-- Enable pgvector extension
create extension if not exists vector;

-- Create knowledge base chunks table
create table if not exists kb_chunks (
  id uuid primary key default gen_random_uuid(),
  source text not null,
  title text not null,
  path text,
  content text not null,
  embedding vector(1536), -- 1536 dimensions for text-embedding-3-small
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table kb_chunks enable row level security;

-- Create policy to allow public reads (if anyone can query it via edge functions)
create policy "Allow public read access to knowledge base chunks"
  on kb_chunks for select
  to anon, authenticated
  using (true);

-- Create HNSW index for cosine distance similarity searches
-- Note: we use 1536 dimension vector with cosine distance (<=>)
create index on kb_chunks using hnsw (embedding vector_cosine_ops);

-- Create a matching function to retrieve similar chunks using cosine similarity
create or replace function match_kb_chunks (
  query_embedding vector(1536),
  match_threshold float,
  match_count int
)
returns table (
  id uuid,
  source text,
  title text,
  path text,
  content text,
  similarity float
)
language sql stable
as $$
  select
    kb_chunks.id,
    kb_chunks.source,
    kb_chunks.title,
    kb_chunks.path,
    kb_chunks.content,
    1 - (kb_chunks.embedding <=> query_embedding) as similarity
  from kb_chunks
  where 1 - (kb_chunks.embedding <=> query_embedding) > match_threshold
  order by kb_chunks.embedding <=> query_embedding
  limit match_count;
$$;
