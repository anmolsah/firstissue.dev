import fs from 'fs';
import path from 'path';
import { createClient } from '@supabase/supabase-js';
import { docContent } from '../src/data/docContent.js';

// Manual .env loader to support all Node versions without external dependencies
function loadEnv() {
  try {
    const envPath = path.join(process.cwd(), '.env');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      const lines = envContent.split('\n');
      for (const line of lines) {
        const trimmed = line.trim();
        if (trimmed && !trimmed.startsWith('#') && trimmed.includes('=')) {
          const equalsIdx = trimmed.indexOf('=');
          const key = trimmed.substring(0, equalsIdx).trim();
          let val = trimmed.substring(equalsIdx + 1).trim();
          if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
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
// Prefer service role key for inserting, fallback to anon key (might fail if RLS is strict)
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.XAI_API_KEY; // Fallback to xai key if configured to openrouter

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set.');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY must be set to generate embeddings.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Helper to generate embedding via OpenRouter / OpenAI API compatibility
async function getEmbedding(text) {
  try {
    // OpenRouter uses standard OpenAI-compatible embeddings endpoint
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://firstissue.dev', // Required by OpenRouter
        'X-Title': 'FirstIssue RAG Seeding'
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text,
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter API error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    return resJson.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding for text:', text.substring(0, 40) + '...');
    throw error;
  }
}

// Markdown chunker
function chunkMarkdown(filename, content) {
  const lines = content.split('\n');
  const chunks = [];
  let currentHeader = 'Introduction';
  let currentChunk = [];

  for (const line of lines) {
    if (line.startsWith('# ') || line.startsWith('## ') || line.startsWith('### ')) {
      if (currentChunk.length > 0) {
        chunks.push({
          source: filename,
          title: currentHeader,
          path: `docs/${filename}`,
          content: currentChunk.join('\n').trim()
        });
      }
      currentHeader = line.replace(/^#+\s+/, '').trim();
      currentChunk = [line];
    } else {
      currentChunk.push(line);
    }
  }
  if (currentChunk.length > 0) {
    chunks.push({
      source: filename,
      title: currentHeader,
      path: `docs/${filename}`,
      content: currentChunk.join('\n').trim()
    });
  }
  return chunks;
}

// Parser for docContent.js
function parseDocContent() {
  const chunks = [];
  for (const [catKey, category] of Object.entries(docContent)) {
    if (typeof category !== 'object' || !category.title) continue;
    for (const [secKey, section] of Object.entries(category)) {
      if (typeof section !== 'object' || !section.content) continue;
      
      let currentTitle = section.title;
      let currentText = [];

      for (const item of section.content) {
        if (item.type === 'heading') {
          if (currentText.length > 0) {
            chunks.push({
              source: 'docContent.js',
              title: `${section.title} - ${currentTitle}`,
              path: `/docs/${secKey}`,
              content: currentText.join('\n').trim()
            });
          }
          currentTitle = item.text;
          currentText = [`### ${item.text}`];
        } else if (item.type === 'paragraph') {
          currentText.push(item.text);
        } else if (item.type === 'callout') {
          currentText.push(`> [!${(item.variant || 'info').toUpperCase()}] ${item.title || ''}\n> ${item.text}`);
        } else if (item.type === 'list') {
          const prefix = item.ordered ? '1. ' : '- ';
          item.items.forEach(li => currentText.push(`${prefix}${li}`));
        } else if (item.type === 'code') {
          currentText.push(`\`\`\`${item.language || 'text'}\n${item.code}\n\`\`\``);
        }
      }
      if (currentText.length > 0) {
        chunks.push({
          source: 'docContent.js',
          title: `${section.title} - ${currentTitle}`,
          path: `/docs/${secKey}`,
          content: currentText.join('\n').trim()
        });
      }
    }
  }
  return chunks;
}

async function main() {
  console.log('--- Starting Knowledge Base Seeding ---');
  let allChunks = [];

  // 1. Parse docContent.js
  console.log('Parsing docContent.js...');
  try {
    const docChunks = parseDocContent();
    console.log(`Parsed ${docChunks.length} chunks from docContent.js`);
    allChunks = allChunks.concat(docChunks);
  } catch (err) {
    console.error('Error parsing docContent.js:', err);
  }

  // 2. Parse docs/*.md
  const docsDir = path.join(process.cwd(), 'docs');
  console.log(`Reading docs from: ${docsDir}`);
  if (fs.existsSync(docsDir)) {
    const files = fs.readdirSync(docsDir);
    for (const file of files) {
      if (file.endsWith('.md')) {
        console.log(`Processing file: ${file}`);
        const content = fs.readFileSync(path.join(docsDir, file), 'utf-8');
        const fileChunks = chunkMarkdown(file, content);
        console.log(`Split ${file} into ${fileChunks.length} chunks`);
        allChunks = allChunks.concat(fileChunks);
      }
    }
  } else {
    console.warn('Warning: docs/ directory not found.');
  }

  console.log(`Total chunks to index: ${allChunks.length}`);

  // 3. Clear existing chunks in Supabase
  console.log('Clearing existing chunks in Supabase...');
  const { error: deleteError } = await supabase
    .from('kb_chunks')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all

  if (deleteError) {
    console.warn('Warning: Failed to clear old chunks (might be empty or RLS restriction):', deleteError.message);
  }

  // 4. Generate embeddings and upload chunks
  let successCount = 0;
  for (let i = 0; i < allChunks.length; i++) {
    const chunk = allChunks[i];
    console.log(`[${i + 1}/${allChunks.length}] Embedding chunk: "${chunk.title}" from ${chunk.source}`);
    
    // Skip empty chunks
    if (!chunk.content || chunk.content.trim().length === 0) {
      continue;
    }

    try {
      const embedding = await getEmbedding(chunk.content);
      
      const { error: insertError } = await supabase
        .from('kb_chunks')
        .insert({
          source: chunk.source,
          title: chunk.title,
          path: chunk.path,
          content: chunk.content,
          embedding: embedding
        });

      if (insertError) {
        console.error(`Database insert error for chunk ${i}:`, insertError.message);
      } else {
        successCount++;
      }
    } catch (err) {
      console.error(`Failed to process chunk "${chunk.title}":`, err.message);
      // Continue with remaining chunks
    }

    // Add a short delay to prevent aggressive rate limiting
    await new Promise(resolve => setTimeout(resolve, 200));
  }

  console.log(`\n--- Seeding completed: ${successCount}/${allChunks.length} chunks uploaded ---`);
}

main().catch(err => {
  console.error('Fatal error in seeding script:', err);
  process.exit(1);
});
