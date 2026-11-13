import { supabase } from '../lib/supabase';
import {
  rankCandidatesForUser,
  buildDeterministicMatchResults,
} from '../utils/smartMatchRanker';

/**
 * Smart Match Service
 * Extracts developer profile, pre-ranks candidates using deterministic stack +
 * repo_health + clarity + claim-risk scoring, then calls xAI Grok for final tie-breaking & reasoning.
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

async function attachSupabaseRepoHealth(candidates) {
  const missingRepos = Array.from(
    new Set(
      candidates
        .filter((issue) => !issue.repo_health && issue.repo)
        .map((issue) => issue.repo)
    )
  );
  if (missingRepos.length === 0) return candidates;

  try {
    const { data, error } = await supabase
      .from('repo_health')
      .select('*')
      .in('repo_full_name', missingRepos);

    if (error || !Array.isArray(data) || data.length === 0) return candidates;
    const healthMap = new Map(data.map((row) => [row.repo_full_name, row]));

    return candidates.map((issue) => {
      const health = healthMap.get(issue.repo);
      if (!health) return issue;
      return {
        ...issue,
        repo_stars: issue.repo_stars ?? health.stars ?? null,
        repo_pushed_at: issue.repo_pushed_at ?? health.last_pushed_at ?? null,
        repo_archived: issue.repo_archived ?? Boolean(health.is_archived),
        repo_health: health,
      };
    });
  } catch {
    return candidates;
  }
}

export async function getAIMatchedIssues(userProfile, candidateIssues) {
  try {
    const { data, error } = await supabase.functions.invoke('smart-match', {
      body: {
        userProfile,
        candidateIssues,
      }
    });

    if (error) {
      let details = error.message || 'Unknown error';
      try {
        if (error.context?.body) {
          const reader = error.context.body.getReader();
          const { value } = await reader.read();
          const bodyText = new TextDecoder().decode(value);
          const bodyJson = JSON.parse(bodyText);
          details = bodyJson.details || bodyJson.error || details;
        }
      } catch { /* ignore parse errors */ }
      console.error('Smart Match edge function error:', details);
      throw new Error(`AI matching failed: ${details}`);
    }
    if (data?.error) throw new Error(data.error);

    return {
      matches: data?.matches || [],
      limited: !!data?.limited,
      totalAvailable: data?.totalAvailable ?? null,
      failed: false,
    };
  } catch (error) {
    console.error('Error getting AI matches:', error);
    return { matches: [], limited: false, totalAvailable: null, failed: true };
  }
}

export async function runSmartMatch(
  username,
  token,
  supabaseUrl,
  { userId, preferredLabels, isSupporter = false } = {}
) {
  // Step 1: Extract user profile from GitHub (languages + manifest frameworks + external PRs)
  const userProfile = await extractUserProfile(username, token);
  if (!userProfile) throw new Error('Could not analyze GitHub profile');

  // Step 2: Fetch user's declared tech stack from Supabase profile
  let techStack = [];
  if (userId) {
    techStack = await fetchUserTechStack(userId);
  }
  userProfile.techStack = techStack;

  // Step 3: Fetch broader candidate pool and backfill repo_health if needed
  const rawCandidates = await fetchCandidateIssues(
    userProfile.topLanguages,
    token,
    preferredLabels
  );
  if (rawCandidates.length === 0) throw new Error('No candidate issues found');

  const enrichedCandidates = await attachSupabaseRepoHealth(rawCandidates);

  // Step 4: Per-user deterministic pre-AI ranking (stack + repo health + clarity + claim risk + diversity)
  const preRankedCandidates = rankCandidatesForUser(enrichedCandidates, userProfile, {
    maxCandidates: 20,
  });
  if (preRankedCandidates.length === 0) throw new Error('No candidate issues found');

  // Step 5: Send only the top 20 pre-ranked candidates to xAI Grok for explanation & final ordering
  const { matches, limited, totalAvailable, failed } = await getAIMatchedIssues(
    userProfile,
    preRankedCandidates
  );

  // Resilient deterministic fallback when AI service is unavailable
  if (failed || matches.length === 0) {
    const previewLimit = isSupporter ? null : 2;
    const fallbackIssues = buildDeterministicMatchResults(preRankedCandidates, previewLimit);
    return {
      issues: fallbackIssues,
      userProfile,
      generatedAt: new Date().toISOString(),
      limited: !isSupporter && preRankedCandidates.length > fallbackIssues.length,
      totalAvailable: preRankedCandidates.length,
      fallbackUsed: true,
    };
  }

  // Step 6: Merge AI scores and explanations back into pre-ranked issues
  const matchMap = new Map(matches.map((m) => [String(m.issueId), m]));

  let rankedIssues = preRankedCandidates
    .map((issue) => {
      const match = matchMap.get(String(issue.id));
      return {
        ...issue,
        matchScore: match?.matchScore ?? issue.preMatchScore,
        matchReason:
          match?.reason ||
          (issue.preReasons?.length > 0
            ? issue.preReasons.join(' · ')
            : 'Matched on your repository stack'),
        isAIRanked: !!match,
      };
    })
    .sort((a, b) => b.matchScore - a.matchScore);

  if (limited) {
    rankedIssues = rankedIssues.filter((issue) => issue.isAIRanked);
  }

  return {
    issues: rankedIssues,
    userProfile,
    generatedAt: new Date().toISOString(),
    limited,
    totalAvailable,
    fallbackUsed: false,
  };
}
