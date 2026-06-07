import { createClient } from '@supabase/supabase-js';
import process from 'process';
import fs from 'fs';
import path from 'path';

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
// Prefer service role key for inserting to database
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.VITE_SUPABASE_ANON_KEY;
const OPENROUTER_API_KEY = process.env.OPENROUTER_API_KEY || process.env.XAI_API_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('Error: VITE_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY (or VITE_SUPABASE_ANON_KEY) must be set.');
  process.exit(1);
}

if (!OPENROUTER_API_KEY) {
  console.error('Error: OPENROUTER_API_KEY must be set to generate embeddings.');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// =============================================================================
// TARGET LIST — All documentation URLs to scrape and index
// =============================================================================
const TARGETS = [
  // ─── Git Command Manuals (git-scm.com/docs) ──────────────────────────────
  { url: 'https://git-scm.com/docs/git-commit',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-push',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-pull',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-rebase',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-merge',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-clone',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-init',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-add',         type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-branch',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-checkout',    type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-stash',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-log',         type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-diff',        type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-reset',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-remote',      type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-fetch',       type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-cherry-pick', type: 'git-scm', category: 'Git Commands' },
  { url: 'https://git-scm.com/docs/git-tag',         type: 'git-scm', category: 'Git Commands' },

  // ─── GitHub CLI Manuals (cli.github.com/manual) ───────────────────────────
  { url: 'https://cli.github.com/manual/gh_pr_create',    type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_view',      type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_repo_fork',    type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_issue_create', type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_issue_list',   type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_issue_view',   type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_checkout',  type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_merge',     type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_pr_list',      type: 'gh-cli', category: 'GitHub CLI' },
  { url: 'https://cli.github.com/manual/gh_repo_clone',   type: 'gh-cli', category: 'GitHub CLI' },

  // ─── GitHub Docs (docs.github.com — uses Markdown API) ────────────────────
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/proposing-changes-to-your-work-with-pull-requests/creating-a-pull-request',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/incorporating-changes-from-a-pull-request/merging-a-pull-request',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/pull-requests/collaborating-with-pull-requests/reviewing-changes-in-pull-requests/about-pull-request-reviews',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/exploring-projects-on-github/contributing-to-a-project',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/using-github/github-flow',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/repositories/creating-and-managing-repositories/cloning-a-repository',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/authentication/connecting-to-github-with-ssh/generating-a-new-ssh-key-and-adding-it-to-the-ssh-agent',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/repositories/managing-your-repositorys-settings-and-features/customizing-your-repository/licensing-a-repository',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/issues/tracking-your-work-with-issues/creating-an-issue',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/getting-started-with-git/setting-up-git',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/get-started/getting-started-with-git/ignoring-files',
    type: 'github-docs', category: 'GitHub Docs' },
  { url: 'https://docs.github.com/en/actions/writing-workflows/quickstart',
    type: 'github-docs', category: 'GitHub Docs' },

  // ─── Open Source Guides (opensource.guide) ─────────────────────────────────
  { url: 'https://opensource.guide/how-to-contribute/',  type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/starting-a-project/', type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/best-practices/',     type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/finding-users/',      type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/code-of-conduct/',    type: 'opensource-guide', category: 'Open Source Guides' },
  { url: 'https://opensource.guide/getting-paid/',       type: 'opensource-guide', category: 'Open Source Guides' },

  // ─── Pro Git Book (git-scm.com/book) ──────────────────────────────────────
  { url: 'https://git-scm.com/book/en/v2/Git-Branching-Branching-Workflows',      type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Distributed-Git-Contributing-to-a-Project', type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Tools-Interactive-Staging',           type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Tools-Stashing-and-Cleaning',        type: 'git-book', category: 'Pro Git Book' },
  { url: 'https://git-scm.com/book/en/v2/Git-Tools-Rewriting-History',            type: 'git-book', category: 'Pro Git Book' },
];

// =============================================================================
// HTML → Markdown Utilities
// =============================================================================

// Helper to clean HTML and translate to markdown
function cleanHtmlToMarkdown(html) {
  let text = html;

  // Replace <code>...</code> with `...`
  text = text.replace(/<code>([\s\S]*?)<\/code>/gi, '`$1`');

  // Replace <pre><code>...</code></pre> with ```...```
  text = text.replace(/<pre>[\s\S]*?<code>([\s\S]*?)<\/code>[\s\S]*?<\/pre>/gi, '\n```\n$1\n```\n');
  text = text.replace(/<pre>([\s\S]*?)<\/pre>/gi, '\n```\n$1\n```\n');

  // Replace list items <li>...</li> with - ...
  text = text.replace(/<li>([\s\S]*?)<\/li>/gi, '\n- $1');

  // Replace paragraphs <p>...</p> with linebreaks
  text = text.replace(/<p>([\s\S]*?)<\/p>/gi, '\n\n$1\n\n');

  // Remove all other HTML tags
  text = text.replace(/<[^>]+>/g, '');

  // Unescape HTML entities
  text = text.replace(/&lt;/g, '<')
             .replace(/&gt;/g, '>')
             .replace(/&amp;/g, '&')
             .replace(/&quot;/g, '"')
             .replace(/&#x27;/g, "'")
             .replace(/&#x60;/g, "`");

  // Clean up multiple empty lines
  text = text.replace(/\n\s*\n\s*\n/g, '\n\n').trim();

  return text;
}

// =============================================================================
// PARSERS — One for each site type
// =============================================================================

// Git-SCM HTML Parser (for /docs/git-*)
function parseGitScmHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(' - Git documentation', '').trim() : 'Git Command';

  const mainContentMatch = html.match(/<div id="main"[\s\S]*?>([\s\S]*?)<\/div>\s*?<div id="footer">/i);
  const contentHtml = mainContentMatch ? mainContentMatch[1] : html;

  const sectionRegex = /<h2[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[1].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[2];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `${pageTitle} - ${sectionTitle}`,
        content: `## ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: pageTitle,
      content: `# ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// GitHub CLI HTML Parser (for cli.github.com/manual)
function parseGithubCliHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(' | GitHub CLI Manual', '').trim() : 'GitHub CLI';

  const bodyMatch = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i) || html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  const contentHtml = bodyMatch ? bodyMatch[1] : html;

  const sectionRegex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h2|<h3|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[3];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `${pageTitle} - ${sectionTitle}`,
        content: `## ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: pageTitle,
      content: `# ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// GitHub Docs Parser — fetches clean Markdown via their official API
// instead of parsing complex Next.js HTML
async function fetchGithubDocsMarkdown(url) {
  // Extract the pathname from the full URL
  // e.g. https://docs.github.com/en/get-started/using-github/github-flow
  //   → /en/get-started/using-github/github-flow
  const urlObj = new URL(url);
  const pathname = urlObj.pathname;

  const apiUrl = `https://docs.github.com/api/article/body?pathname=${pathname}`;

  const response = await fetch(apiUrl, {
    headers: {
      'User-Agent': 'FirstIssueScraper/1.0 (https://firstissue.dev; bot)',
      'Accept': 'text/markdown, text/plain, */*'
    }
  });

  if (!response.ok) {
    throw new Error(`GitHub Docs API error: ${response.status}`);
  }

  const markdown = await response.text();

  // Extract the title from the first # heading
  const titleMatch = markdown.match(/^#\s+(.+)$/m);
  const pageTitle = titleMatch ? titleMatch[1].trim() : pathname.split('/').pop().replace(/-/g, ' ');

  return parseMarkdownIntoChunks(markdown, pageTitle, url);
}

// Open Source Guide Parser (opensource.guide) — HTML with <article> wrapper
function parseOpenSourceGuideHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch
    ? titleMatch[1].replace(/\s*\|\s*Open Source Guides/i, '').trim()
    : 'Open Source Guide';

  // Content is inside <article> → <div class="article-body">
  const articleMatch = html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  const contentHtml = articleMatch ? articleMatch[1] : html;

  // Split by h2 sections
  const sectionRegex = /<h2[^>]*id="([^"]*)"[^>]*>([\s\S]*?)<\/h2>([\s\S]*?)(?=<h2|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[3];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    // Remove <aside class="pquote"> quote attribution noise but keep the quote text
    markdownText = markdownText.replace(/— @\w+,\s*"[^"]*"/g, '');

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `${pageTitle} - ${sectionTitle}`,
        content: `## ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: pageTitle,
      content: `# ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// Pro Git Book Parser (git-scm.com/book) — HTML with <div id="main"> wrapper
function parseGitBookHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch
    ? titleMatch[1].replace(/^Git\s*-\s*/, '').trim()
    : 'Pro Git';

  // Content is inside <div class="sect1"> or <div id="main">
  const mainMatch = html.match(/<div class="sect1">([\s\S]*?)(?:<div id="nav"|<div id="footer"|$)/i);
  const contentHtml = mainMatch ? mainMatch[1] : html;

  // Split by h2 and h3 sections
  const sectionRegex = /<(h2|h3)[^>]*>([\s\S]*?)<\/\1>([\s\S]*?)(?=<h2|<h3|<div class="sect|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].replace(/<[^>]+>/g, '').trim();
    let sectionHtml = match[3];

    let markdownText = cleanHtmlToMarkdown(sectionHtml);

    if (markdownText.trim().length > 0) {
      chunks.push({
        title: `Pro Git: ${pageTitle} - ${sectionTitle}`,
        content: `## Pro Git: ${pageTitle} - ${sectionTitle}\n\n${markdownText}`
      });
    }
  }

  if (chunks.length === 0) {
    let text = cleanHtmlToMarkdown(contentHtml);
    chunks.push({
      title: `Pro Git: ${pageTitle}`,
      content: `# Pro Git: ${pageTitle}\n\n${text}`
    });
  }

  return chunks;
}

// =============================================================================
// Shared Markdown Chunker (for GitHub Docs Markdown API responses)
// =============================================================================
function parseMarkdownIntoChunks(markdown, pageTitle, sourceUrl) {
  const lines = markdown.split('\n');
  const chunks = [];
  let currentHeader = pageTitle;
  let currentChunk = [];

  for (const line of lines) {
    // Split on h2 (##) headings
    if (line.startsWith('## ') || line.startsWith('### ')) {
      if (currentChunk.length > 0) {
        const text = currentChunk.join('\n').trim();
        if (text.length > 0) {
          chunks.push({
            title: `${pageTitle} - ${currentHeader}`,
            content: text
          });
        }
      }
      currentHeader = line.replace(/^#+\s+/, '').trim();
      currentChunk = [line];
    } else {
      currentChunk.push(line);
    }
  }

  // Push the last chunk
  if (currentChunk.length > 0) {
    const text = currentChunk.join('\n').trim();
    if (text.length > 0) {
      chunks.push({
        title: `${pageTitle} - ${currentHeader}`,
        content: text
      });
    }
  }

  // If no sections were found, treat the whole page as one chunk
  if (chunks.length === 0) {
    chunks.push({
      title: pageTitle,
      content: markdown.trim()
    });
  }

  return chunks;
}

// =============================================================================
// Embedding Generation (OpenRouter API)
// =============================================================================
async function getEmbedding(text) {
  try {
    const response = await fetch('https://openrouter.ai/api/v1/embeddings', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${OPENROUTER_API_KEY}`,
        'Content-Type': 'application/json',
        'HTTP-Referer': 'https://firstissue.dev',
        'X-Title': 'FirstIssue Doc Scraper'
      },
      body: JSON.stringify({
        model: 'openai/text-embedding-3-small',
        input: text
      })
    });

    if (!response.ok) {
      const errText = await response.text();
      throw new Error(`OpenRouter Embeddings Error: ${response.status} - ${errText}`);
    }

    const resJson = await response.json();
    return resJson.data[0].embedding;
  } catch (error) {
    console.error('Failed to generate embedding for: ', text.substring(0, 40) + '...');
    throw error;
  }
}

// =============================================================================
// Main Scrape & Index Pipeline
// =============================================================================
async function scrapeAndIndex() {
  console.log('=== Starting Web Documentation Scraper ===');
  console.log(`Total targets: ${TARGETS.length} pages across ${[...new Set(TARGETS.map(t => t.category))].length} categories\n`);

  // Group targets by category for logging
  const categories = [...new Set(TARGETS.map(t => t.category))];
  for (const cat of categories) {
    const count = TARGETS.filter(t => t.category === cat).length;
    console.log(`  📂 ${cat}: ${count} pages`);
  }
  console.log('');

  let totalSuccess = 0;
  let totalChunks = 0;

  for (let idx = 0; idx < TARGETS.length; idx++) {
    const target = TARGETS[idx];
    console.log(`[${idx + 1}/${TARGETS.length}] [${target.category}] Fetching: ${target.url}...`);

    try {
      let chunks = [];

      // ── GitHub Docs: Use their Markdown API (no HTML parsing needed) ──
      if (target.type === 'github-docs') {
        chunks = await fetchGithubDocsMarkdown(target.url);
      } else {
        // ── All other types: Fetch HTML and parse ──
        const response = await fetch(target.url, {
          headers: {
            'User-Agent': 'FirstIssueScraper/1.0 (https://firstissue.dev; bot)'
          }
        });

        if (!response.ok) {
          console.error(`  [ERROR] Failed to fetch: Status ${response.status}`);
          continue;
        }

        const html = await response.text();

        // Route to the right parser
        if (target.type === 'git-scm') {
          chunks = parseGitScmHtml(html);
        } else if (target.type === 'gh-cli') {
          chunks = parseGithubCliHtml(html);
        } else if (target.type === 'opensource-guide') {
          chunks = parseOpenSourceGuideHtml(html);
        } else if (target.type === 'git-book') {
          chunks = parseGitBookHtml(html);
        }
      }

      console.log(`  [PARSE] Split into ${chunks.length} semantic chunks.`);

      if (chunks.length === 0) continue;

      // Clear existing chunks for this URL (de-duplication)
      const { error: deleteError } = await supabase
        .from('kb_chunks')
        .delete()
        .eq('source', target.url);

      if (deleteError) {
        console.warn(`  [WARN] Failed to clear old chunks: ${deleteError.message}`);
      }

      // Generate embeddings and insert
      let successCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`    → Embedding [${i + 1}/${chunks.length}]: "${chunk.title.substring(0, 50)}..."`);

        try {
          const embedding = await getEmbedding(chunk.content);

          const { error: insertError } = await supabase
            .from('kb_chunks')
            .insert({
              source: target.url,
              title: chunk.title,
              path: target.url,
              content: chunk.content,
              embedding: embedding
            });

          if (insertError) {
            console.error(`    [DB ERROR] ${insertError.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`    [API ERROR] ${err.message}`);
        }

        // Delay to prevent hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      totalSuccess += successCount;
      totalChunks += chunks.length;
      console.log(`  [DONE] Indexed ${successCount}/${chunks.length} chunks.\n`);

    } catch (error) {
      console.error(`  [FATAL] Error crawling ${target.url}:`, error.message);
    }

    // 1.5 seconds delay between sites to respect rate limits
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('=== Web Documentation Scraper completed ===');
  console.log(`Total: ${totalSuccess}/${totalChunks} chunks indexed across ${TARGETS.length} pages.`);
}

scrapeAndIndex().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
