/**
 * Smart Match Service
 * Analyzes user's GitHub profile and calls OpenRouter AI via Edge Function
 * to provide personalized issue recommendations.
 */

const GITHUB_API_BASE = 'https://api.github.com';

/**
 * Extract user's tech stack from their GitHub repos
 */
export async function extractUserProfile(username, token) {
  try {
    // Fetch user's repos (sorted by most recently pushed)
    const reposResponse = await fetch(
      `${GITHUB_API_BASE}/users/${username}/repos?sort=pushed&per_page=30&type=owner`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!reposResponse.ok) throw new Error('Failed to fetch repos');
    const repos = await reposResponse.json();

    // Extract languages with weights
    const languageCounts = {};
    const topics = new Set();
    let totalStars = 0;
    let totalForks = 0;

    repos.forEach((repo) => {
      if (repo.language) {
        languageCounts[repo.language] = (languageCounts[repo.language] || 0) + 1;
      }
      if (repo.topics) {
        repo.topics.forEach((t) => topics.add(t));
      }
      totalStars += repo.stargazers_count || 0;
      totalForks += repo.forks_count || 0;
    });

    // Sort languages by frequency
    const topLanguages = Object.entries(languageCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([lang, count]) => ({ language: lang, repoCount: count }));

    // Determine experience level
    let experienceLevel = 'beginner';
    if (repos.length > 20 || totalStars > 50) experienceLevel = 'intermediate';
    if (repos.length > 50 || totalStars > 200) experienceLevel = 'advanced';

    return {
      username,
      topLanguages,
      topics: Array.from(topics).slice(0, 15),
      repoCount: repos.length,
      totalStars,
      totalForks,
      experienceLevel,
    };
  } catch (error) {
    console.error('Error extracting user profile:', error);
    return null;
  }
}

/**
 * Fetch candidate issues from GitHub for matching
 */
export async function fetchCandidateIssues(languages, token) {
  try {
    // Build query targeting user's top languages
    const langFilter = languages
      .slice(0, 3)
      .map((l) => `language:${l.language.toLowerCase()}`)
      .join(' ');

    const query = `state:open type:issue label:"good first issue" ${langFilter} is:public -label:duplicate -label:invalid`;

    const response = await fetch(
      `${GITHUB_API_BASE}/search/issues?q=${encodeURIComponent(query)}&sort=updated&order=desc&per_page=30`,
      {
        headers: {
          Accept: 'application/vnd.github.v3+json',
          ...(token && { Authorization: `Bearer ${token}` }),
        },
      }
    );

    if (!response.ok) throw new Error('Failed to fetch issues');
    const data = await response.json();

    return (data.items || []).map((issue) => ({
      id: issue.id,
      title: issue.title,
      body: issue.body?.substring(0, 300) || '',
      labels: issue.labels.map((l) => l.name),
      repo: issue.repository_url.split('/').slice(-2).join('/'),
      url: issue.html_url,
      created_at: issue.created_at,
      comments: issue.comments,
      user_avatar: issue.user?.avatar_url,
    }));
  } catch (error) {
    console.error('Error fetching candidate issues:', error);
    return [];
  }
}

/**
 * Call the Supabase Edge Function to get AI-ranked matches
 */
export async function getAIMatchedIssues(userProfile, candidateIssues, supabaseUrl) {
  try {
    const functionUrl = `${supabaseUrl}/functions/v1/smart-match`;

    const response = await fetch(functionUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
      },
      body: JSON.stringify({
        userProfile,
        candidateIssues: candidateIssues.slice(0, 20), // Limit to save tokens
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Smart match error:', errorText);
      throw new Error('AI matching failed');
    }

    const data = await response.json();
    return data.matches || [];
  } catch (error) {
    console.error('Error getting AI matches:', error);
    return [];
  }
}

/**
 * Full smart match pipeline
 */
export async function runSmartMatch(username, token, supabaseUrl) {
  // Step 1: Extract user profile
  const userProfile = await extractUserProfile(username, token);
  if (!userProfile) throw new Error('Could not analyze GitHub profile');

  // Step 2: Fetch candidate issues
  const candidates = await fetchCandidateIssues(userProfile.topLanguages, token);
  if (candidates.length === 0) throw new Error('No candidate issues found');

  // Step 3: Get AI rankings
  const matches = await getAIMatchedIssues(userProfile, candidates, supabaseUrl);

  // Step 4: Merge AI scores back into full issue data
  const matchMap = new Map(matches.map((m) => [m.issueId, m]));

  const rankedIssues = candidates
    .map((issue) => {
      const match = matchMap.get(issue.id);
      return {
        ...issue,
        matchScore: match?.matchScore || 0,
        matchReason: match?.reason || 'Matches your tech stack',
        isAIRanked: !!match,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  return {
    issues: rankedIssues,
    userProfile,
    generatedAt: new Date().toISOString(),
  };
}
