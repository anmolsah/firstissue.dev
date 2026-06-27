import { supabase } from '../lib/supabase';

/**
 * Smart Match Service
 * Analyzes user's GitHub profile and calls xAI Grok via Edge Function
 * to provide personalized issue recommendations.
 */

/**
 * Fetch user's tech stack from their Supabase profile
 */
export async function fetchUserTechStack(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('tech_stack')
      .eq('id', userId)
      .single();

    if (error) throw error;
    return data?.tech_stack || [];
  } catch (error) {
    console.error('Error fetching tech stack:', error);
    return [];
  }
}

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
export async function fetchCandidateIssues(languages, token, preferredLabels) {
  try {
    const { data, error } = await supabase.functions.invoke('github-data', {
      body: { action: 'fetchIssues', languages, token, preferredLabels }
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
        candidateIssues, // Send ALL candidates — no slicing
      }
    });

    if (error) {
      // Try to read the response body for more details
      let details = error.message || 'Unknown error';
      try {
        if (error.context?.body) {
          const reader = error.context.body.getReader();
          const { value } = await reader.read();
          const bodyText = new TextDecoder().decode(value);
          const bodyJson = JSON.parse(bodyText);
          details = bodyJson.details || bodyJson.error || details;
        }
      } catch (_) { /* ignore parse errors */ }
      console.error('Smart Match edge function error:', details);
      throw new Error(`AI matching failed: ${details}`);
    }
    if (data?.error) throw new Error(data.error);

    return {
      matches: data?.matches || [],
      limited: !!data?.limited,
      totalAvailable: data?.totalAvailable ?? null,
    };
  } catch (error) {
    console.error('Error getting AI matches:', error);
    return { matches: [], limited: false, totalAvailable: null };
  }
}

/**
 * Full smart match pipeline
 */
export async function runSmartMatch(username, token, supabaseUrl, { userId, preferredLabels } = {}) {
  // Step 1: Extract user profile from GitHub
  const userProfile = await extractUserProfile(username, token);
  if (!userProfile) throw new Error('Could not analyze GitHub profile');

  // Step 2: Fetch user's declared tech stack from Supabase profile
  let techStack = [];
  if (userId) {
    techStack = await fetchUserTechStack(userId);
  }
  
  // Merge tech stack into profile for AI
  userProfile.techStack = techStack;

  console.log('[SmartMatch] User tech stack:', techStack);
  console.log('[SmartMatch] Detected frameworks:', userProfile.detectedFrameworks);

  // Step 3: Fetch candidate issues with preferred labels
  const candidates = await fetchCandidateIssues(userProfile.topLanguages, token, preferredLabels);
  if (candidates.length === 0) throw new Error('No candidate issues found');

  console.log('[SmartMatch] Candidates fetched:', candidates.length);

  // Step 4: Get AI rankings. Free users receive only the top matches plus a
  // `limited` flag and the total count available behind the paywall.
  const { matches, limited, totalAvailable } = await getAIMatchedIssues(userProfile, candidates);

  console.log('[SmartMatch] AI returned', matches.length, 'matches', limited ? `(free preview of ${totalAvailable})` : '');

  // Step 5: Merge AI scores back into full issue data
  const matchMap = new Map(matches.map((m) => [String(m.issueId), m]));

  let rankedIssues = candidates
    .map((issue) => {
      const match = matchMap.get(String(issue.id));
      return {
        ...issue,
        matchScore: match?.matchScore || 0,
        matchReason: match?.reason || 'Could not be scored by AI',
        isAIRanked: !!match,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore)
    // Cap at top 25 results
    .slice(0, 25);

  // In a free preview the server only scored/returned the top few matches, so
  // keep only the AI-ranked issues — never pad the grid with 0%-scored ones.
  if (limited) {
    rankedIssues = rankedIssues.filter((issue) => issue.isAIRanked);
  }

  console.log('[SmartMatch] Final results:', rankedIssues.length);
  if (rankedIssues.length > 0) {
    console.log('[SmartMatch] Score range:', rankedIssues[0]?.matchScore, 'to', rankedIssues[rankedIssues.length - 1]?.matchScore);
  }

  return {
    issues: rankedIssues,
    userProfile,
    generatedAt: new Date().toISOString(),
    limited,
    totalAvailable,
  };
}
