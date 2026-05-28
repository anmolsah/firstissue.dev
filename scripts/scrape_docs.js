import { createClient } from '@supabase/supabase-js';
import process from 'process';

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

// Target list of documentation URLs to scrape
const TARGETS = [
  // Git Command Manuals
  { url: 'https://git-scm.com/docs/git-commit', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-push', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-pull', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-rebase', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-merge', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-clone', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-init', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-add', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-branch', type: 'git-scm' },
  { url: 'https://git-scm.com/docs/git-checkout', type: 'git-scm' },
  
  // GitHub CLI Manuals
  { url: 'https://cli.github.com/manual/gh_pr_create', type: 'gh-cli' },
  { url: 'https://cli.github.com/manual/gh_pr_view', type: 'gh-cli' },
  { url: 'https://cli.github.com/manual/gh_repo_fork', type: 'gh-cli' }
];

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

// Git-SCM HTML Parser
function parseGitScmHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(' - Git documentation', '').trim() : 'Git Command';

  const mainContentMatch = html.match(/<div id="main"[\s\S]*?>([\s\S]*?)<\/div>\s*?<div id="footer">/i);
  const contentHtml = mainContentMatch ? mainContentMatch[1] : html;

  const sectionRegex = /<h2 id="([^"]+)">([^<]+)<\/h2>([\s\S]*?)(?=<h2 id="|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].trim();
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

// GitHub CLI HTML Parser
function parseGithubCliHtml(html) {
  const titleMatch = html.match(/<title>(.*?)<\/title>/i);
  const pageTitle = titleMatch ? titleMatch[1].replace(' | GitHub CLI Manual', '').trim() : 'GitHub CLI';

  const bodyMatch = html.match(/<main[\s\S]*?>([\s\S]*?)<\/main>/i) || html.match(/<article[\s\S]*?>([\s\S]*?)<\/article>/i);
  const contentHtml = bodyMatch ? bodyMatch[1] : html;

  const sectionRegex = /<(h2|h3)[^>]*>([^<]+)<\/\1>([\s\S]*?)(?=<h2|<h3|$)/gi;
  const chunks = [];
  let match;

  while ((match = sectionRegex.exec(contentHtml)) !== null) {
    const sectionTitle = match[2].trim();
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

// Helper to generate embedding via OpenRouter API
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

async function scrapeAndIndex() {
  console.log('=== Starting Web Documentation Scraper ===\n');

  for (const target of TARGETS) {
    console.log(`[CRAWL] Fetching: ${target.url}...`);
    try {
      // 1. Fetch web page
      const response = await fetch(target.url, {
        headers: {
          'User-Agent': 'FirstIssueScraper/1.0 (https://firstissue.dev; bot)'
        }
      });

      if (!response.ok) {
        console.error(`[ERROR] Failed to fetch ${target.url}: Status ${response.status}`);
        continue;
      }

      const html = await response.text();
      
      // 2. Parse HTML into text chunks
      let chunks = [];
      if (target.type === 'git-scm') {
        chunks = parseGitScmHtml(html);
      } else if (target.type === 'gh-cli') {
        chunks = parseGithubCliHtml(html);
      }

      console.log(`[PARSE] Split page into ${chunks.length} semantic chunks.`);

      if (chunks.length === 0) continue;

      // 3. Clear existing chunks for this specific URL (de-duplication)
      const { error: deleteError } = await supabase
        .from('kb_chunks')
        .delete()
        .eq('source', target.url);

      if (deleteError) {
        console.warn(`[WARN] Failed to clear old database chunks for ${target.url}: ${deleteError.message}`);
      }

      // 4. Generate embeddings and insert into Supabase
      let successCount = 0;
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        console.log(`  -> Embedding chunk [${i + 1}/${chunks.length}]: "${chunk.title.substring(0, 40)}..."`);
        
        try {
          const embedding = await getEmbedding(chunk.content);
          
          const { error: insertError } = await supabase
            .from('kb_chunks')
            .insert({
              source: target.url,
              title: chunk.title,
              path: target.url, // Map url to path so links inside RAG citation work
              content: chunk.content,
              embedding: embedding
            });

          if (insertError) {
            console.error(`  [DB ERROR] Failed to save chunk: ${insertError.message}`);
          } else {
            successCount++;
          }
        } catch (err) {
          console.error(`  [API ERROR] Failed to process embedding: ${err.message}`);
        }

        // Delay to prevent hitting rate limits
        await new Promise(resolve => setTimeout(resolve, 300));
      }

      console.log(`[SUCCESS] Scraping completed for ${target.url}. Indexed ${successCount}/${chunks.length} chunks.\n`);

    } catch (error) {
      console.error(`[FATAL] Error crawling ${target.url}:`, error.message);
    }

    // 1.5 seconds delay between targeting sites to respect robots.txt rate-limits
    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  console.log('=== Web Documentation Scraper completed ===');
}

scrapeAndIndex().catch(err => {
  console.error('Fatal execution error:', err);
  process.exit(1);
});
