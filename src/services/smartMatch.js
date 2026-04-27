import { supabase } from '../lib/supabase';

/**
 * Smart Match Service
 * Analyzes user's GitHub profile and calls xAI Grok via Edge Function
 * to provide personalized issue recommendations.
 */

/**
 * Extract user's tech stack from their GitHub repos
 */
export async function extractUserProfile(username, token) {
  try {
    const { data, error } = await supabase.functions.invoke('github-data', {
      body: { action: 'extractProfile', username, token }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data?.profile || null;
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
    const { data, error } = await supabase.functions.invoke('github-data', {
      body: { action: 'fetchIssues', languages, token }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data?.issues || [];
  } catch (error) {
    console.error('Error fetching candidate issues:', error);
    return [];
  }
}

/**
 * Call the Supabase Edge Function to get AI-ranked matches
 */
export async function getAIMatchedIssues(userProfile, candidateIssues) {
  try {
    const { data, error } = await supabase.functions.invoke('smart-match', {
      body: {
        userProfile,
        candidateIssues: candidateIssues.slice(0, 20), // Limit to save tokens
      }
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return data?.matches || [];
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
  const matches = await getAIMatchedIssues(userProfile, candidates);

  console.log('[SmartMatch] AI returned', matches.length, 'matches');
  if (matches.length > 0) {
    console.log('[SmartMatch] Sample AI match:', JSON.stringify(matches[0]));
    console.log('[SmartMatch] Sample candidate ID:', candidates[0]?.id, typeof candidates[0]?.id);
  }

  // Step 4: Merge AI scores back into full issue data
  // Coerce all IDs to strings for consistent matching (AI may return string or number IDs)
  const matchMap = new Map(matches.map((m) => [String(m.issueId), m]));

  const rankedIssues = candidates
    .map((issue) => {
      const match = matchMap.get(String(issue.id));
      return {
        ...issue,
        matchScore: match?.matchScore || 0,
        matchReason: match?.reason || 'Matches your tech stack',
        isAIRanked: !!match,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  console.log('[SmartMatch] Ranked issues - top score:', rankedIssues[0]?.matchScore);

  return {
    issues: rankedIssues,
    userProfile,
    generatedAt: new Date().toISOString(),
  };
}
