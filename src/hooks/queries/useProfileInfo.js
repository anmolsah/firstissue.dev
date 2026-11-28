import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

/**
 * Query key factory for profile info
 */
export const profileInfoKeys = {
  all: (userId) => ['profileInfo', userId],
  signupIndex: (userId) => ['profileInfo', userId, 'signupIndex'],
  custom: (userId) => ['profileInfo', userId, 'custom'],
};

function isMissingColumnError(error) {
  if (!error) return false;
  const msg = String(error.message || '').toLowerCase();
  return (
    error.code === 'PGRST204' ||
    error.code === '42703' ||
    msg.includes('column') ||
    msg.includes('schema cache')
  );
}

/**
 * Fetch signup_index from profiles table
 */
async function fetchSignupIndex(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('signup_index')
    .eq('id', userId)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data?.signup_index || 0;
}

/**
 * Fetch custom profile fields (name, bio, college, location, company, website, linkedin_url, twitter_url)
 */
async function fetchCustomProfile(userId) {
  let { data, error } = await supabase
    .from('profiles')
    .select('name, bio, college, location, company, website, linkedin_url, twitter_url')
    .eq('id', userId)
    .single();

  if (error && isMissingColumnError(error)) {
    const fallbackWithCollege = await supabase
      .from('profiles')
      .select('name, bio, college, location, company, website')
      .eq('id', userId)
      .single();

    if (!fallbackWithCollege.error) {
      data = fallbackWithCollege.data;
      error = null;
    } else if (isMissingColumnError(fallbackWithCollege.error)) {
      const baseFallback = await supabase
        .from('profiles')
        .select('name, bio, location, company, website')
        .eq('id', userId)
        .single();
      data = baseFallback.data;
      error = baseFallback.error;
    } else {
      error = fallbackWithCollege.error;
    }
  }

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Hook to fetch signup index for badge calculation.
 */
export function useSignupIndex(userId) {
  return useQuery({
    queryKey: profileInfoKeys.signupIndex(userId),
    queryFn: () => fetchSignupIndex(userId),
    enabled: !!userId,
    staleTime: 30 * 60 * 1000, // 30 minutes — signup index never changes
  });
}

/**
 * Hook to fetch custom profile fields.
 */
export function useCustomProfile(userId) {
  return useQuery({
    queryKey: profileInfoKeys.custom(userId),
    queryFn: () => fetchCustomProfile(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}
