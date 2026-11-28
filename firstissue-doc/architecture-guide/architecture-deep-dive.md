---
title: "Architecture Deep Dive (Scalability & Concurrency)"
description: "A comprehensive guide on the FirstIssue.dev architecture, handling concurrency, scalability, and security."
readTime: "15 min read"
updated: "today"
difficulty: "Advanced"
order: 2
---
This structured guide covers the core architectural principles of FirstIssue.dev: What, Why, How, Scale, and Failure. Below are the concepts paired with real-world implementation examples.

## 1. High-Level Architecture

FirstIssue.dev operates on a serverless, decoupled architecture. The frontend is a React Single Page Application (SPA) hosted on Vercel. The backend utilizes Supabase (managed PostgreSQL) for data persistence, Supabase Auth for identity, and Supabase Edge Functions (Deno) for secure, compute-heavy tasks like AI generation and GitHub syncing. External APIs (GitHub, OpenAI) are accessed exclusively via these Edge Functions.

```typescript
// Example: A lightweight Deno Edge Function acting as the secure API Gateway
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

serve(async (req) => {
  const supabaseClient = createClient(Deno.env.get('SUPABASE_URL'), Deno.env.get('SUPABASE_ANON_KEY'));
  return new Response(JSON.stringify({ status: 'Architecture Online' }), { headers: { "Content-Type": "application/json" } });
});
```

## 2. Core User Flows: Submitting a Contribution

1. User authenticates via GitHub OAuth on the frontend.
2. User pastes a PR URL or triggers an automatic sync.
3. The frontend invokes a Supabase Edge Function to securely query the GitHub API.
4. The Edge Function verifies PR status, author match, and merges.
5. The backend signs a cryptographic 'Proof of Work' (Attestation) and upserts it into the PostgreSQL database.
6. The frontend receives a success response and renders an interactive 3D MetalCard for the user's portfolio.

```javascript
// Example: Frontend invoking the Edge Function to sync a PR
const syncContribution = async (prUrl) => {
  const { data, error } = await supabase.functions.invoke('github-sync', {
    body: { url: prUrl }
  });
  
  if (error) throw new Error('Sync failed');
  return data;
};
```

## 3. Detailed Component Design

- Frontend (React/Vite): Uses TanStack Query for server state caching and optimistic UI updates. TailwindCSS and Framer Motion handle styling and animations.
- Edge Functions (Deno): Stateless, distributed functions that act as the API Gateway for external services. They hold all secrets (OpenAI Keys, Admin DB keys).
- PostgreSQL DB: Uses Row Level Security (RLS) to enforce data access rules at the database level. pgvector is used to store and query AI embeddings for the Copilot.

```javascript
// Example: React Component using TanStack Query for optimal component design
import { useQuery } from '@tanstack/react-query';

function Portfolio() {
  const { data: contributions, isLoading } = useQuery({
    queryKey: ['contributions'],
    queryFn: fetchUserContributions
  });

  if (isLoading) return <SkeletonLoader />;
  return <MetalCardGrid data={contributions} />;
}
```

## 4. API Design

Instead of building a traditional REST API, the frontend directly queries the Supabase database using the Supabase client. This is safe because RLS policies restrict what data can be read or mutated. For operations requiring secrets (e.g., generating AI kits), the client calls RPCs (Remote Procedure Calls) or Edge Functions.

```javascript
// Example: Securely fetching user contributions directly from the client
const { data, error } = await supabase
  .from('contributions')
  .select('*')
  .eq('pr_status', 'merged')
  .order('created_at', { ascending: false });
// RLS ensures users ONLY get their own data, no backend endpoint needed!
```

## 5. Data Flow

Data flows unidirectionally for GitHub syncs: GitHub API -> Edge Function (parsing/transformation) -> PostgreSQL (Storage) -> React Client (Real-time updates via Supabase Realtime). For AI Copilot, User Query -> Edge Function -> pgvector (context retrieval) -> OpenAI API -> Client (streaming response).

```javascript
// Example: Edge Function fetching from GitHub and pushing to Supabase
const githubRes = await fetch(`https://api.github.com/repos/${owner}/${repo}/pulls/${prNumber}`, {
  headers: { Authorization: `Bearer ${GITHUB_TOKEN}` }
});
const prData = await githubRes.json();

// Push to DB
await supabaseAdmin.from('contributions').upsert({
  user_id: userId,
  pr_url: prData.html_url,
  title: prData.title
});
```

## 6. Authentication & Authorization

Authentication is managed via Supabase Auth using GitHub OAuth. Upon login, a JWT is issued to the client. Authorization is handled via PostgreSQL Row Level Security (RLS). For example, the policy 'auth.uid() = user_id' ensures users can only modify their own 'contributions' rows.

```sql
-- Example: Creating an RLS Policy for Authorization
ALTER TABLE contributions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can insert their own contributions"
ON contributions FOR INSERT
WITH CHECK ( auth.uid() = user_id );

CREATE POLICY "Users can view their own contributions"
ON contributions FOR SELECT
USING ( auth.uid() = user_id );
```

## 7. Caching & Performance

- Client Caching: TanStack Query caches API responses in the browser memory, preventing redundant network requests during navigation.
- Edge Caching: Vercel CDN caches static assets globally.
- Sync Throttling: To respect GitHub's rate limits, the client enforces a 5-minute cooldown before allowing a manual or automatic data sync.

```javascript
// Example: Configuring TanStack Query for optimal client caching
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5, // Data is fresh for 5 minutes
      cacheTime: 1000 * 60 * 30, // Keep in cache for 30 minutes
      refetchOnWindowFocus: false,
    },
  },
});
```

## 8. Scalability

The architecture scales horizontally almost infinitely. Vercel automatically scales the frontend delivery. Supabase Edge Functions automatically spin up instances globally based on traffic. PostgreSQL is scaled vertically initially, with read replicas planned for heavy public portfolio read workloads.

```sql
-- Example: Scaling AI Vector Search with pgvector HNSW Index
CREATE INDEX ON kb_embeddings USING hnsw (embedding vector_cosine_ops)
WITH (m = 16, ef_construction = 64);
-- This index allows scalable, sub-millisecond similarity search across millions of vectors.
```

## 9. Background Jobs / Async Processing

Heavy tasks like bulk generating AI portfolios or scraping documentation for the knowledge base run asynchronously. We use Supabase pg_cron for scheduled background jobs, such as cleaning up stale chat sessions or resetting monthly AI quotas for free users.

```sql
-- Example: Scheduling a daily cleanup job using pg_cron
SELECT cron.schedule(
  'cleanup-stale-sessions',
  '0 0 * * *', -- Runs every day at midnight
  $$ DELETE FROM chat_sessions WHERE created_at < NOW() - INTERVAL '30 days' $$
);
```

## 10. Reliability & Failure Handling

For the AI Contribution Kit, handling quota concurrency is critical. We use Atomic Row Locks ('SELECT ... FOR UPDATE') in PL/pgSQL to serialize concurrent requests, preventing race conditions where users might bypass quotas. If an external API (like OpenAI) fails, the edge function catches the error and issues a refund to the user's quota via a 'refund_kit_quota' RPC.

```sql
-- Example: Atomic Row Lock in PL/pgSQL to prevent concurrency bugs
SELECT kit_count INTO v_used
FROM public.contribution_kit_usage
WHERE user_id = p_user_id AND usage_month = v_month
FOR UPDATE; -- This locks the row until the transaction completes!

IF v_used >= p_limit THEN
    RETURN false;
END IF;
```

## 11. Security

We follow a Zero-Trust Architecture. Sensitive GitHub OAuth provider tokens are never exposed to the frontend. All GitHub API calls are proxied through server-side Edge Functions. The database is strictly locked down by RLS.

```typescript
// Example: Edge Function securely validating the user's JWT token
const authHeader = req.headers.get('Authorization');
const token = authHeader.replace('Bearer ', '');

const { data: { user }, error } = await supabaseClient.auth.getUser(token);
if (error || !user) {
  return new Response('Unauthorized', { status: 401 });
}
// Proceed with secure logic for authenticated user...
```

## 12. Monitoring & Observability

We leverage Vercel Analytics for frontend web vitals. Supabase provides native observability for database query performance and Edge Function invocation logs. We track API rate limits closely to avoid being blocked by GitHub.

```javascript
// Example: Custom tracking for Edge Function execution time
console.time('GitHub API Request');
const response = await fetch(githubUrl, { headers });
console.timeEnd('GitHub API Request'); // Automatically logged in Supabase Observability

// Check Rate Limit Headers
const limit = response.headers.get('x-ratelimit-remaining');
console.log(`GitHub API calls remaining: ${limit}`);
```
