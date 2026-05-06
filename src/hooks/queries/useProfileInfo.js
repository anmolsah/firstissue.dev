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
 * Fetch custom profile fields (name, bio, location, company, website)
 */
async function fetchCustomProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('name, bio, location, company, website')
    .eq('id', userId)
    .single();

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
