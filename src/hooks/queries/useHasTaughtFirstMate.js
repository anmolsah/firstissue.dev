import { useQuery } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

export const taughtFirstMateKeys = {
  user: (userId) => ['taughtFirstMate', userId],
};

/**
 * Synchronous local check to see if the user has taught FirstMate AI on this machine.
 * Inspects both explicit flag markers and the cached learned knowledge list.
 */
export function checkHasTaughtFirstMate(userId) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return false;

    if (userId && localStorage.getItem(`firstmate_has_taught_${userId}`) === 'true') {
      return true;
    }
    if (localStorage.getItem('firstmate_has_taught_firstmate') === 'true') {
      return true;
    }

    const raw = localStorage.getItem('firstmate_learned_knowledge_v1');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list) && list.some(item => item.user_feedback === 'correction' || Boolean(item.user_correction))) {
        return true;
      }
    }
  } catch (err) {
    console.warn('Error reading local FirstMate taught state:', err);
  }
  return false;
}

/**
 * Returns the timestamp when FirstMate was first taught, or current ISO date if not recorded.
 */
export function getTaughtFirstMateDate(userId) {
  try {
    if (typeof window === 'undefined' || !window.localStorage) return new Date().toISOString();
    const storedDate = userId && localStorage.getItem(`firstmate_taught_at_${userId}`);
    if (storedDate) return storedDate;

    const raw = localStorage.getItem('firstmate_learned_knowledge_v1');
    if (raw) {
      const list = JSON.parse(raw);
      if (Array.isArray(list)) {
        const correction = list.find(item => item.user_feedback === 'correction' || Boolean(item.user_correction));
        if (correction?.created_at) return correction.created_at;
      }
    }
  } catch {
    // Fallback to current time
  }
  return new Date().toISOString();
}

/**
 * Fetches teaching status from Supabase and merges with local storage.
 */
export async function fetchHasTaughtFirstMate(userId) {
  const localTaught = checkHasTaughtFirstMate(userId);
  if (!userId) return localTaught;

  try {
    const { count, error } = await supabase
      .from('ai_learned_solutions')
      .select('id', { count: 'exact', head: true })
      .eq('user_id', userId)
      .or('user_feedback.eq.correction,user_correction.not.is.null');

    if (error) {
      return localTaught;
    }

    const hasRemote = (count || 0) > 0;
    if (hasRemote) {
      try {
        localStorage.setItem(`firstmate_has_taught_${userId}`, 'true');
      } catch {}
    }

    return hasRemote || localTaught;
  } catch {
    return localTaught;
  }
}

/**
 * React Query hook to check if user has taught FirstMate AI.
 */
export function useHasTaughtFirstMate(userId) {
  return useQuery({
    queryKey: taughtFirstMateKeys.user(userId),
    queryFn: () => fetchHasTaughtFirstMate(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000,
    initialData: () => checkHasTaughtFirstMate(userId),
  });
}
