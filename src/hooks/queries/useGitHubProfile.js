import { useQuery } from '@tanstack/react-query';

/**
 * Query key factory for GitHub profile
 */
export const githubProfileKeys = {
  byUsername: (username) => ['githubProfile', username],
};

/**
 * Fetch public GitHub profile data
 */
async function fetchGitHubProfile(username) {
  const response = await fetch(`https://api.github.com/users/${username}`, {
    headers: {
      Accept: 'application/vnd.github.v3+json',
    },
  });

  if (!response.ok) {
    throw new Error(`GitHub API error: ${response.status}`);
  }

  return response.json();
}

/**
 * Hook to fetch a user's public GitHub profile with TanStack Query caching.
 */
export function useGitHubProfile(username) {
  return useQuery({
    queryKey: githubProfileKeys.byUsername(username),
    queryFn: () => fetchGitHubProfile(username),
    enabled: !!username,
    staleTime: 10 * 60 * 1000, // 10 minutes — profile data changes rarely
  });
}
