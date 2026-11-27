import fs from 'fs';
import path from 'path';
import process from 'process';
import { createClient } from '@supabase/supabase-js';

function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      for (const line of envContent.split('\n')) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const equalsIdx = trimmed.indexOf('=');
          const key = trimmed.substring(0, equalsIdx).trim();
          let val = trimmed.substring(equalsIdx + 1).trim();
          if (
            (val.startsWith('"') && val.endsWith('"')) ||
            (val.startsWith("'") && val.endsWith("'"))
          ) {
            val = val.substring(1, val.length - 1);
          }
          if (key && !process.env[key]) {
            process.env[key] = val;
          }
        }
      }
    }
  } catch (err) {
    console.warn('Warning: Failed to load .env file manually:', err.message);
  }
}

loadEnv();

const SUPABASE_URL = process.env.VITE_SUPABASE_URL || process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.XAI_API_KEY;
const BATCH_SIZE = 20;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set.');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY must be set to generate embeddings.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

async function getEmbeddingsBatch(texts) {
  const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${OPENROUTER_API_KEY}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': 'https://firstissue.dev',
      'X-Title': 'FirstIssue RAG Embeddings Backfill',
    },
    body: JSON.stringify({
      model: 'openai/text-embedding-3-small',
      input: texts,
    }),
  });

  if (!response.ok) {
    const errText = await response.text();
    throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
  }

  const json = await response.json();
  return (json.data || []).map((entry) => entry.embedding);
}

function formatLearnedSolutionText(row) {
  const parts = [];
  if (row.query_text) parts.push(`Question: ${String(row.query_text).trim()}`);
  if (row.user_correction && String(row.user_correction).trim()) {
    parts.push(`Correction: ${String(row.user_correction).trim()}`);
  } else if (row.assistant_response) {
    parts.push(`Answer: ${String(row.assistant_response).trim().slice(0, 800)}`);
  }
  return parts.join('\n').slice(0, 1600);
}

function formatStartupOrgText(org) {
  return [
    `${org.display_name || org.github_name || ''} (@${org.github_name || ''})`,
    org.category ? `Category: ${org.category}` : '',
    org.country ? `Country: ${org.country}` : '',
    org.founded_year ? `Founded: ${org.founded_year}` : '',
    org.description ? `Description: ${org.description}` : '',
  ]
    .filter(Boolean)
    .join(' | ')
    .slice(0, 1200);
}

async function backfillTable({ tableName, selectCols, filterFn, formatText }) {
  console.log(`\n--- Backfilling embeddings for ${tableName} ---`);
  let totalUpdated = 0;

  while (true) {
    let query = supabase
      .from(tableName)
      .select(selectCols)
      .is('embedding', null)
      .limit(BATCH_SIZE);

    if (filterFn) {
      query = filterFn(query);
    }

    const { data: rows, error } = await query;
    if (error) {
      console.error(`Failed to read ${tableName}:`, error.message);
      break;
    }

    if (!Array.isArray(rows) || rows.length === 0) {
      break;
    }

    const prepared = rows
      .map((row) => ({ id: row.id, text: formatText(row) }))
      .filter((item) => item.text.length > 0);

    if (prepared.length === 0) break;

    console.log(`Embedding batch of ${prepared.length} rows in ${tableName}...`);
    const vectors = await getEmbeddingsBatch(prepared.map((p) => p.text));

    for (let i = 0; i < prepared.length; i++) {
      const vec = vectors[i];
      if (!Array.isArray(vec) || vec.length === 0) continue;

      const { error: updateErr } = await supabase
        .from(tableName)
        .update({ embedding: vec })
        .eq('id', prepared[i].id);

      if (updateErr) {
        console.error(`Failed to update ${tableName} row ${prepared[i].id}:`, updateErr.message);
      } else {
        totalUpdated++;
      }
    }

    await new Promise((resolve) => setTimeout(resolve, 250));
  }

  console.log(`Completed ${tableName}: updated ${totalUpdated} row(s).`);
}

async function main() {
  await backfillTable({
    tableName: 'ai_learned_solutions',
    selectCols: 'id, query_text, user_correction, assistant_response',
    filterFn: (q) => q.or('user_feedback.eq.up,user_correction.neq.null'),
    formatText: formatLearnedSolutionText,
  });

  await backfillTable({
    tableName: 'startup_orgs',
    selectCols: 'id, github_name, display_name, category, country, founded_year, description',
    filterFn: (q) => q.eq('is_active', true).eq('is_startup', true),
    formatText: formatStartupOrgText,
  });

  console.log('\nAll RAG embedding backfills complete.');
}

main().catch((err) => {
  console.error('Fatal error in backfill script:', err);
  process.exit(1);
});
