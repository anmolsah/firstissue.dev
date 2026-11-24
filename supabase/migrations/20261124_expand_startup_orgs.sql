-- Migration: Seed 34 high-signal modern open-source startup organizations
-- Automatically detects startup_orgs.id column type (integer/bigint, uuid, or text),
-- attaches a safe default if missing, and inserts only non-duplicate organizations.

CREATE INDEX IF NOT EXISTS idx_startup_orgs_github_name_lower
  ON startup_orgs (lower(github_name));

DO $$
DECLARE
  v_id_type text;
  v_id_default text;
  v_sample_text_id text;
BEGIN
  SELECT data_type, column_default
    INTO v_id_type, v_id_default
    FROM information_schema.columns
   WHERE table_schema = 'public'
     AND table_name = 'startup_orgs'
     AND column_name = 'id';

  -- Ensure a default exists for numeric or UUID primary keys so future inserts never fail on null id
  IF v_id_type IN ('integer', 'bigint', 'smallint') THEN
    CREATE SEQUENCE IF NOT EXISTS startup_orgs_id_seq;
    EXECUTE 'SELECT setval(''startup_orgs_id_seq'', COALESCE((SELECT MAX(id)::bigint FROM startup_orgs), 0) + 1, false)';
    IF v_id_default IS NULL THEN
      EXECUTE 'ALTER TABLE startup_orgs ALTER COLUMN id SET DEFAULT nextval(''startup_orgs_id_seq'')';
    END IF;
  ELSIF v_id_type = 'uuid' AND v_id_default IS NULL THEN
    EXECUTE 'ALTER TABLE startup_orgs ALTER COLUMN id SET DEFAULT gen_random_uuid()';
  END IF;

  CREATE TEMP TABLE tmp_new_startup_orgs (
    github_name text,
    display_name text,
    description text,
    website text,
    category text,
    stars integer,
    country text,
    founded_year integer
  ) ON COMMIT DROP;

  INSERT INTO tmp_new_startup_orgs VALUES
    ('astral-sh', 'Astral', 'Next-generation Python developer tooling behind Ruff and uv, written in Rust.', 'https://astral.sh', 'DevTools', 92000, 'US', 2022),
    ('zed-industries', 'Zed Industries', 'High-performance, multiplayer code editor written in Rust with native AI workflows.', 'https://zed.dev', 'DevTools', 56000, 'US', 2021),
    ('biomejs', 'Biome', 'Fast toolchain for web projects offering formatting and linting in a single Rust binary.', 'https://biomejs.dev', 'DevTools', 18000, 'Global', 2023),
    ('triggerdotdev', 'Trigger.dev', 'Open-source background jobs and long-running AI workflow infrastructure for TypeScript.', 'https://trigger.dev', 'Infrastructure', 11200, 'UK', 2022),
    ('inngest', 'Inngest', 'Durable workflow engine and event-driven queues without managing infrastructure.', 'https://www.inngest.com', 'Infrastructure', 4600, 'US', 2021),
    ('resend', 'Resend', 'Email API and React Email component ecosystem built for developers.', 'https://resend.com', 'DevTools', 16500, 'US', 2023),
    ('mastra-ai', 'Mastra', 'Open-source TypeScript agent framework for building production AI applications and MCP workflows.', 'https://mastra.ai', 'AI/ML', 12500, 'US', 2024),
    ('browser-use', 'Browser Use', 'Make websites accessible for AI agents with open-source browser automation.', 'https://browser-use.com', 'AI/ML', 52000, 'US', 2024),
    ('pydantic', 'Pydantic', 'Data validation library for Python and the PydanticAI agent framework.', 'https://pydantic.dev', 'AI/ML', 26000, 'UK', 2022),
    ('langchain-ai', 'LangChain', 'Open-source agent orchestration, LangGraph state machines, and LLM tooling.', 'https://www.langchain.com', 'AI/ML', 105000, 'US', 2022),
    ('vllm-project', 'vLLM', 'High-throughput and memory-efficient inference and serving engine for LLMs.', 'https://vllm.ai', 'AI/ML', 42000, 'US', 2023),
    ('crewAIInc', 'CrewAI', 'Framework for orchestrating role-playing, autonomous AI agents in Python.', 'https://www.crewai.com', 'AI/ML', 29000, 'US', 2023),
    ('BerriAI', 'LiteLLM', 'Unified OpenAI-compatible proxy and SDK for calling 100+ LLM APIs with budgets and fallbacks.', 'https://litellm.ai', 'AI/ML', 20500, 'US', 2023),
    ('composiohq', 'Composio', 'Production-ready toolset and MCP integration layer for AI agents.', 'https://composio.dev', 'AI/ML', 18500, 'US', 2023),
    ('mem0ai', 'Mem0', 'Universal memory layer for personalized AI agents and assistants.', 'https://mem0.ai', 'AI/ML', 27000, 'US', 2023),
    ('agno-agi', 'Agno', 'Lightweight framework for building multimodal reasoning agents with memory and tools.', 'https://www.agno.com', 'AI/ML', 22000, 'US', 2023),
    ('Arize-ai', 'Arize Phoenix', 'Open-source AI observability, OpenTelemetry tracing, and LLM evaluation platform.', 'https://phoenix.arize.com', 'AI/ML', 5800, 'US', 2020),
    ('qdrant', 'Qdrant', 'High-performance Rust vector similarity search engine and vector database.', 'https://qdrant.tech', 'Data', 23000, 'Germany', 2021),
    ('chroma-core', 'Chroma', 'AI-native open-source embedding and retrieval database.', 'https://www.trychroma.com', 'Data', 19000, 'US', 2022),
    ('neondatabase', 'Neon', 'Serverless open-source Postgres with instant branching and scale-to-zero storage.', 'https://neon.tech', 'Data', 17500, 'US', 2021),
    ('tursodatabase', 'Turso', 'Edge-hosted distributed database built on libSQL, an open-source fork of SQLite.', 'https://turso.tech', 'Data', 14000, 'US', 2021),
    ('lancedb', 'LanceDB', 'Developer-friendly, embedded multimodal vector database for AI.', 'https://lancedb.com', 'Data', 6200, 'US', 2022),
    ('infisical', 'Infisical', 'Open-source secret management, PKI, and KMS platform for engineering teams.', 'https://infisical.com', 'Security', 17800, 'US', 2022),
    ('cerbos', 'Cerbos', 'Open-source, scalable authorization layer for fine-grained access control.', 'https://cerbos.dev', 'Security', 3700, 'UK', 2021),
    ('phasehq', 'Phase', 'Open-source application secrets and environment variable management.', 'https://phase.dev', 'Security', 1400, 'UK', 2023),
    ('upstash', 'Upstash', 'Serverless Redis, Vector, and QStash messaging SDKs built for edge runtimes.', 'https://upstash.com', 'Cloud', 6500, 'US', 2021),
    ('coollabsio', 'Coolify', 'Open-source and self-hostable Heroku, Netlify, and Vercel alternative.', 'https://coolify.io', 'Cloud', 39500, 'Hungary', 2021),
    ('daytonaio', 'Daytona', 'Secure, elastic infrastructure for running AI-generated code and dev environments.', 'https://www.daytona.io', 'Infrastructure', 16500, 'US', 2023),
    ('hatchet-dev', 'Hatchet', 'Distributed, fault-tolerant task queue and workflow engine replacing legacy brokers.', 'https://hatchet.run', 'Infrastructure', 5400, 'US', 2023),
    ('encoredev', 'Encore', 'Type-safe backend development framework for Go and TypeScript with cloud automation.', 'https://encore.dev', 'Infrastructure', 9200, 'Sweden', 2021),
    ('dagger', 'Dagger', 'Programmable CI/CD engine that runs pipelines inside portable containers.', 'https://dagger.io', 'Infrastructure', 12400, 'US', 2022),
    ('medusajs', 'Medusa', 'Composable open-source digital commerce platform built for customization.', 'https://medusajs.com', 'FinTech', 28500, 'Denmark', 2021),
    ('formancehq', 'Formance', 'Open-source programmable financial ledger and payment orchestration infrastructure.', 'https://www.formance.com', 'FinTech', 1500, 'France', 2021),
    ('juspay', 'Hyperswitch', 'Open-source Rust payment switch connecting global payment processors.', 'https://hyperswitch.io', 'FinTech', 15000, 'India', 2022);

  IF v_id_type IN ('text', 'character varying') THEN
    EXECUTE 'SELECT id::text FROM startup_orgs WHERE id IS NOT NULL LIMIT 1' INTO v_sample_text_id;
    IF v_sample_text_id ~* '^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$' THEN
      EXECUTE $sql$
        INSERT INTO startup_orgs (
          id, github_name, display_name, description, github_url, website,
          category, stars, country, founded_year, is_active, is_startup, stars_synced_at
        )
        SELECT
          gen_random_uuid()::text,
          v.github_name, v.display_name, v.description,
          'https://github.com/' || v.github_name, v.website,
          v.category, v.stars, v.country, v.founded_year,
          true, true, now()
        FROM tmp_new_startup_orgs v
        WHERE NOT EXISTS (
          SELECT 1 FROM startup_orgs s WHERE lower(s.github_name) = lower(v.github_name)
        )
      $sql$;
    ELSE
      EXECUTE $sql$
        INSERT INTO startup_orgs (
          id, github_name, display_name, description, github_url, website,
          category, stars, country, founded_year, is_active, is_startup, stars_synced_at
        )
        SELECT
          lower(v.github_name),
          v.github_name, v.display_name, v.description,
          'https://github.com/' || v.github_name, v.website,
          v.category, v.stars, v.country, v.founded_year,
          true, true, now()
        FROM tmp_new_startup_orgs v
        WHERE NOT EXISTS (
          SELECT 1 FROM startup_orgs s
          WHERE lower(s.github_name) = lower(v.github_name)
             OR lower(s.id::text) = lower(v.github_name)
        )
      $sql$;
    END IF;
  ELSE
    EXECUTE $sql$
      INSERT INTO startup_orgs (
        github_name, display_name, description, github_url, website,
        category, stars, country, founded_year, is_active, is_startup, stars_synced_at
      )
      SELECT
        v.github_name, v.display_name, v.description,
        'https://github.com/' || v.github_name, v.website,
        v.category, v.stars, v.country, v.founded_year,
        true, true, now()
      FROM tmp_new_startup_orgs v
      WHERE NOT EXISTS (
        SELECT 1 FROM startup_orgs s WHERE lower(s.github_name) = lower(v.github_name)
      )
    $sql$;
  END IF;
END $$;
