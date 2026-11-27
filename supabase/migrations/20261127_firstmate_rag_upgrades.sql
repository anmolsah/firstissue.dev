-- Migration: FirstMate RAG Upgrades
-- 1. Safe OR-tsquery builder for natural-language chat queries & technical flags
-- 2. Hybrid Search (Postgres FTS + pgvector RRF) on kb_chunks
-- 3. Semantic + FTS hybrid filtering on ai_learned_solutions
-- 4. Query-filtered Postgres FTS + pgvector search on startup_orgs

CREATE EXTENSION IF NOT EXISTS vector;

-- ============================================================================
-- 0. Helper: Build a safe OR-based tsquery from natural language + CLI tokens
-- ============================================================================
-- Combines stemmed English lexemes (stopwords removed) with unstemmed 'simple'
-- technical tokens (e.g., --force-with-lease, reflog, gplv3, apache-2.0,
-- codeowners) while excluding English stopwords and stripping tsquery syntax
-- characters so arbitrary user prompts can never raise a syntax error.
CREATE OR REPLACE FUNCTION public.firstmate_build_or_tsquery(p_query text)
RETURNS tsquery
LANGUAGE plpgsql
IMMUTABLE
AS $$
DECLARE
  v_clean text;
  v_expr text;
BEGIN
  IF p_query IS NULL OR length(trim(p_query)) = 0 THEN
    RETURN NULL;
  END IF;

  -- Limit input length to keep lexeme parsing bounded on huge pasted prompts
  v_clean := left(trim(p_query), 1500);

  WITH raw_lexemes AS (
    SELECT unnest(tsvector_to_array(to_tsvector('english', v_clean))) AS lex
    UNION
    SELECT s.lex
    FROM unnest(tsvector_to_array(to_tsvector('simple', v_clean))) AS s(lex)
    WHERE length(s.lex) >= 2
      AND to_tsvector('english', s.lex) <> ''::tsvector
  ),
  sanitized AS (
    SELECT DISTINCT
      regexp_replace(lex, '[''\\&|!():*<>[:space:]]+', '', 'g') AS tok
    FROM raw_lexemes
  ),
  limited AS (
    SELECT tok
    FROM sanitized
    WHERE length(tok) >= 2
    ORDER BY length(tok) DESC, tok ASC
    LIMIT 24
  )
  SELECT string_agg('''' || tok || '''', ' | ')
    INTO v_expr
  FROM limited;

  IF v_expr IS NULL OR length(v_expr) = 0 THEN
    RETURN NULL;
  END IF;

  RETURN v_expr::tsquery;
EXCEPTION
  WHEN OTHERS THEN
    RETURN websearch_to_tsquery('english', v_clean);
END;
$$;

-- ============================================================================
-- 1. Hybrid Search (FTS + pgvector with RRF) on kb_chunks
-- ============================================================================
ALTER TABLE public.kb_chunks
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(title, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(content, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(content, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_kb_chunks_fts
  ON public.kb_chunks USING gin (fts);

CREATE OR REPLACE FUNCTION public.match_kb_chunks_hybrid (
  query_text text,
  query_embedding vector(1536),
  match_threshold float DEFAULT 0.25,
  match_count int DEFAULT 10,
  full_text_weight float DEFAULT 1.0,
  semantic_weight float DEFAULT 1.0,
  rrf_k int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  source text,
  title text,
  path text,
  content text,
  similarity float,
  fts_rank float,
  hybrid_score float
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_tsq tsquery;
  v_pool int := GREATEST(COALESCE(match_count, 10) * 3, 24);
  v_rrf_k int := GREATEST(COALESCE(rrf_k, 50), 1);
BEGIN
  v_tsq := public.firstmate_build_or_tsquery(query_text);

  RETURN QUERY
  WITH semantic AS (
    SELECT
      k.id,
      (1 - (k.embedding <=> query_embedding))::float AS sim,
      row_number() OVER (ORDER BY k.embedding <=> query_embedding) AS rank_ix
    FROM public.kb_chunks k
    WHERE query_embedding IS NOT NULL
      AND k.embedding IS NOT NULL
      AND (1 - (k.embedding <=> query_embedding)) > match_threshold
    ORDER BY k.embedding <=> query_embedding
    LIMIT v_pool
  ),
  full_text AS (
    SELECT
      k.id,
      ts_rank_cd(k.fts, v_tsq, 32)::float AS ft_score,
      row_number() OVER (ORDER BY ts_rank_cd(k.fts, v_tsq, 32) DESC) AS rank_ix
    FROM public.kb_chunks k
    WHERE v_tsq IS NOT NULL
      AND k.fts @@ v_tsq
      AND ts_rank_cd(k.fts, v_tsq, 32) > 0.01
    ORDER BY ft_score DESC
    LIMIT v_pool
  ),
  fused AS (
    SELECT
      COALESCE(s.id, f.id) AS id,
      s.sim AS sem_sim,
      COALESCE(f.ft_score, 0.0)::float AS ft_score,
      (
        COALESCE(semantic_weight / (v_rrf_k + s.rank_ix), 0.0) +
        COALESCE(full_text_weight / (v_rrf_k + f.rank_ix), 0.0)
      )::float AS rrf_score
    FROM semantic s
    FULL OUTER JOIN full_text f ON s.id = f.id
  ),
  ranked AS (
    SELECT
      k.id,
      k.source,
      k.title,
      k.path,
      k.content,
      COALESCE(
        fused.sem_sim,
        CASE
          WHEN query_embedding IS NOT NULL AND k.embedding IS NOT NULL
            THEN (1 - (k.embedding <=> query_embedding))::float
          ELSE 0.0::float
        END
      ) AS similarity,
      fused.ft_score AS fts_rank,
      fused.rrf_score AS hybrid_score
    FROM fused
    JOIN public.kb_chunks k ON k.id = fused.id
  )
  SELECT
    r.id,
    r.source,
    r.title,
    r.path,
    r.content,
    r.similarity,
    r.fts_rank,
    r.hybrid_score
  FROM ranked r
  ORDER BY r.hybrid_score DESC, r.similarity DESC, r.fts_rank DESC
  LIMIT COALESCE(match_count, 10);
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_kb_chunks_hybrid(text, vector, float, int, float, float, int)
  TO anon, authenticated, service_role;

-- ============================================================================
-- 2. Semantic + FTS Hybrid Retrieval on ai_learned_solutions
-- ============================================================================
ALTER TABLE public.ai_learned_solutions
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.ai_learned_solutions
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(query_text, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(query_text, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(user_correction, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(user_correction, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(assistant_response, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_ai_learned_solutions_embedding
  ON public.ai_learned_solutions USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_ai_learned_solutions_fts
  ON public.ai_learned_solutions USING gin (fts);

DROP FUNCTION IF EXISTS public.match_learned_solutions(text, vector, float, int, int);

CREATE OR REPLACE FUNCTION public.match_learned_solutions (
  p_query_text text,
  query_embedding vector(1536) DEFAULT NULL,
  match_threshold float DEFAULT 0.35,
  match_count int DEFAULT 4,
  rrf_k int DEFAULT 50
)
RETURNS TABLE (
  id uuid,
  query_text text,
  assistant_response text,
  user_correction text,
  helpful_count integer,
  is_verified boolean,
  similarity float,
  fts_rank float,
  score float
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_tsq tsquery;
  v_pool int := GREATEST(COALESCE(match_count, 4) * 4, 16);
  v_rrf_k int := GREATEST(COALESCE(rrf_k, 50), 1);
BEGIN
  v_tsq := public.firstmate_build_or_tsquery(p_query_text);

  RETURN QUERY
  WITH eligible AS (
    SELECT a.*
    FROM public.ai_learned_solutions a
    WHERE a.user_feedback = 'up'
       OR (a.user_correction IS NOT NULL AND length(trim(a.user_correction)) > 0)
  ),
  semantic AS (
    SELECT
      e.id,
      (1 - (e.embedding <=> query_embedding))::float AS sim,
      row_number() OVER (ORDER BY e.embedding <=> query_embedding) AS rank_ix
    FROM eligible e
    WHERE query_embedding IS NOT NULL
      AND e.embedding IS NOT NULL
      AND (1 - (e.embedding <=> query_embedding)) >= match_threshold
    ORDER BY e.embedding <=> query_embedding
    LIMIT v_pool
  ),
  full_text AS (
    SELECT
      e.id,
      ts_rank_cd(e.fts, v_tsq, 32)::float AS ft_score,
      row_number() OVER (ORDER BY ts_rank_cd(e.fts, v_tsq, 32) DESC) AS rank_ix
    FROM eligible e
    WHERE v_tsq IS NOT NULL
      AND e.fts @@ v_tsq
      AND ts_rank_cd(e.fts, v_tsq, 32) >= 0.02
    ORDER BY ft_score DESC
    LIMIT v_pool
  ),
  fused AS (
    SELECT
      COALESCE(s.id, f.id) AS id,
      s.sim AS sem_sim,
      COALESCE(f.ft_score, 0.0)::float AS ft_score,
      (
        COALESCE(1.2 / (v_rrf_k + s.rank_ix), 0.0) +
        COALESCE(0.9 / (v_rrf_k + f.rank_ix), 0.0)
      )::float AS rrf_score
    FROM semantic s
    FULL OUTER JOIN full_text f ON s.id = f.id
  ),
  ranked AS (
    SELECT
      e.id,
      e.query_text,
      e.assistant_response,
      e.user_correction,
      e.helpful_count,
      e.is_verified,
      COALESCE(
        fused.sem_sim,
        CASE
          WHEN query_embedding IS NOT NULL AND e.embedding IS NOT NULL
            THEN (1 - (e.embedding <=> query_embedding))::float
          ELSE 0.0::float
        END
      ) AS similarity,
      fused.ft_score AS fts_rank,
      (
        fused.rrf_score
        + CASE WHEN COALESCE(e.is_verified, false) THEN 0.004 ELSE 0.0 END
        + CASE WHEN e.user_correction IS NOT NULL AND length(trim(e.user_correction)) > 0 THEN 0.002 ELSE 0.0 END
        + LEAST(0.003, ln(GREATEST(1, COALESCE(e.helpful_count, 1)))::float * 0.001)
      )::float AS score
    FROM fused
    JOIN eligible e ON e.id = fused.id
  )
  SELECT
    r.id,
    r.query_text,
    r.assistant_response,
    r.user_correction,
    r.helpful_count,
    r.is_verified,
    r.similarity,
    r.fts_rank,
    r.score
  FROM ranked r
  ORDER BY r.score DESC, r.similarity DESC, r.fts_rank DESC
  LIMIT COALESCE(match_count, 4);
END;
$$;

GRANT EXECUTE ON FUNCTION public.match_learned_solutions(text, vector, float, int, int)
  TO anon, authenticated, service_role;

-- ============================================================================
-- 3. Query-Filtered Postgres FTS + pgvector Search on startup_orgs
-- ============================================================================
ALTER TABLE public.startup_orgs
  ADD COLUMN IF NOT EXISTS embedding vector(1536);

ALTER TABLE public.startup_orgs
  ADD COLUMN IF NOT EXISTS fts tsvector
  GENERATED ALWAYS AS (
    setweight(to_tsvector('english', coalesce(display_name, '') || ' ' || coalesce(github_name, '')), 'A') ||
    setweight(to_tsvector('simple', coalesce(display_name, '') || ' ' || coalesce(github_name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(category, '') || ' ' || coalesce(country, '')), 'B') ||
    setweight(to_tsvector('simple', coalesce(category, '') || ' ' || coalesce(country, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(description, '')), 'C') ||
    setweight(to_tsvector('simple', coalesce(description, '')), 'C')
  ) STORED;

CREATE INDEX IF NOT EXISTS idx_startup_orgs_fts
  ON public.startup_orgs USING gin (fts);

CREATE INDEX IF NOT EXISTS idx_startup_orgs_embedding
  ON public.startup_orgs USING hnsw (embedding vector_cosine_ops)
  WHERE embedding IS NOT NULL;

CREATE INDEX IF NOT EXISTS idx_startup_orgs_active_startup_stars
  ON public.startup_orgs (stars DESC NULLS LAST)
  WHERE is_active = true AND is_startup = true;

CREATE OR REPLACE FUNCTION public.search_startup_orgs (
  query_text text,
  query_embedding vector(1536) DEFAULT NULL,
  preferred_categories text[] DEFAULT NULL,
  expanded_keywords text[] DEFAULT NULL,
  country_filter text[] DEFAULT NULL,
  wants_new boolean DEFAULT false,
  match_count int DEFAULT 6
)
RETURNS TABLE (
  id text,
  github_name text,
  display_name text,
  description text,
  github_url text,
  website text,
  category text,
  stars integer,
  country text,
  founded_year integer,
  relevance_score float
)
LANGUAGE plpgsql
STABLE
AS $$
DECLARE
  v_combined_query text;
  v_tsq tsquery;
  v_limit int := GREATEST(COALESCE(match_count, 6), 1);
  v_pool int := GREATEST(COALESCE(match_count, 6) * 5, 30);
  v_has_categories boolean := preferred_categories IS NOT NULL AND cardinality(preferred_categories) > 0;
  v_has_countries boolean := country_filter IS NOT NULL AND cardinality(country_filter) > 0;
BEGIN
  v_combined_query := trim(
    coalesce(query_text, '') || ' ' ||
    coalesce(array_to_string(expanded_keywords, ' '), '')
  );
  v_tsq := public.firstmate_build_or_tsquery(v_combined_query);

  RETURN QUERY
  WITH fts_candidates AS (
    SELECT
      s.ctid AS row_tid,
      ts_rank_cd(s.fts, v_tsq, 32)::float AS ft_score
    FROM public.startup_orgs s
    WHERE s.is_active = true
      AND s.is_startup = true
      AND v_tsq IS NOT NULL
      AND s.fts @@ v_tsq
    ORDER BY ft_score DESC, COALESCE(s.stars, 0) DESC
    LIMIT v_pool
  ),
  semantic_candidates AS (
    SELECT
      s.ctid AS row_tid,
      (1 - (s.embedding <=> query_embedding))::float AS sim_score
    FROM public.startup_orgs s
    WHERE s.is_active = true
      AND s.is_startup = true
      AND query_embedding IS NOT NULL
      AND s.embedding IS NOT NULL
      AND (1 - (s.embedding <=> query_embedding)) >= 0.25
    ORDER BY s.embedding <=> query_embedding
    LIMIT v_pool
  ),
  filter_candidates AS (
    SELECT
      s.ctid AS row_tid
    FROM public.startup_orgs s
    WHERE s.is_active = true
      AND s.is_startup = true
      AND (
        (v_has_categories AND s.category = ANY(preferred_categories))
        OR (v_has_countries AND lower(coalesce(s.country, '')) = ANY(country_filter))
      )
    ORDER BY
      CASE WHEN wants_new THEN COALESCE(s.founded_year, 0) ELSE 0 END DESC,
      COALESCE(s.stars, 0) DESC
    LIMIT v_pool
  ),
  fallback_candidates AS (
    SELECT
      s.ctid AS row_tid
    FROM public.startup_orgs s
    WHERE s.is_active = true
      AND s.is_startup = true
    ORDER BY
      CASE WHEN wants_new THEN COALESCE(s.founded_year, 0) ELSE 0 END DESC,
      COALESCE(s.stars, 0) DESC
    LIMIT v_limit
  ),
  candidate_tids AS (
    SELECT row_tid FROM fts_candidates
    UNION
    SELECT row_tid FROM semantic_candidates
    UNION
    SELECT row_tid FROM filter_candidates
    UNION
    SELECT row_tid FROM fallback_candidates
  ),
  scored AS (
    SELECT
      s.id::text AS id,
      s.github_name,
      COALESCE(NULLIF(s.display_name, ''), s.github_name) AS display_name,
      COALESCE(NULLIF(s.description, ''), 'Open-source startup organization') AS description,
      COALESCE(NULLIF(s.github_url, ''), 'https://github.com/' || s.github_name) AS github_url,
      COALESCE(s.website, '') AS website,
      COALESCE(NULLIF(s.category, ''), 'DevTools') AS category,
      s.stars,
      s.country,
      s.founded_year,
      (
        -- Indexed FTS relevance
        COALESCE(fc.ft_score, CASE WHEN v_tsq IS NOT NULL AND s.fts @@ v_tsq THEN ts_rank_cd(s.fts, v_tsq, 32)::float ELSE 0.0 END) * 35.0
        -- Optional pgvector semantic similarity
        + COALESCE(
            sc.sim_score,
            CASE
              WHEN query_embedding IS NOT NULL AND s.embedding IS NOT NULL
                THEN GREATEST(0.0, (1 - (s.embedding <=> query_embedding))::float)
              ELSE 0.0
            END
          ) * 30.0
        -- Structured category match
        + CASE WHEN v_has_categories AND s.category = ANY(preferred_categories) THEN 18.0 ELSE 0.0 END
        -- Structured country/region match
        + CASE WHEN v_has_countries AND lower(coalesce(s.country, '')) = ANY(country_filter) THEN 20.0 ELSE 0.0 END
        -- Recency boost
        + CASE
            WHEN wants_new AND COALESCE(s.founded_year, 0) >= 2024 THEN 22.0
            WHEN wants_new AND COALESCE(s.founded_year, 0) >= 2023 THEN 15.0
            WHEN wants_new AND COALESCE(s.founded_year, 0) >= 2022 THEN 8.0
            WHEN NOT wants_new AND COALESCE(s.founded_year, 0) >= 2023 THEN 4.0
            ELSE 0.0
          END
        -- Mild popularity tie-breaker
        + LEAST(8.0, log10(GREATEST(10, COALESCE(s.stars, 0))::double precision) * 1.6)
      )::float AS relevance_score
    FROM candidate_tids c
    JOIN public.startup_orgs s ON s.ctid = c.row_tid
    LEFT JOIN fts_candidates fc ON fc.row_tid = c.row_tid
    LEFT JOIN semantic_candidates sc ON sc.row_tid = c.row_tid
    WHERE s.github_name IS NOT NULL AND length(trim(s.github_name)) > 0
  ),
  deduped AS (
    SELECT DISTINCT ON (lower(scored.github_name))
      scored.*
    FROM scored
    ORDER BY lower(scored.github_name), scored.relevance_score DESC
  )
  SELECT
    d.id,
    d.github_name,
    d.display_name,
    d.description,
    d.github_url,
    d.website,
    d.category,
    d.stars,
    d.country,
    d.founded_year,
    d.relevance_score
  FROM deduped d
  ORDER BY d.relevance_score DESC, COALESCE(d.stars, 0) DESC
  LIMIT v_limit;
END;
$$;

GRANT EXECUTE ON FUNCTION public.search_startup_orgs(text, vector, text[], text[], text[], boolean, int)
  TO anon, authenticated, service_role;
