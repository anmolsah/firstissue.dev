import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../../lib/supabase';

/**
 * Query key factory for bookmarks
 */
export const bookmarkKeys = {
  all: (userId) => ['bookmarks', userId],
};

/**
 * Fetch bookmarks from Supabase
 */
async function fetchBookmarks(userId) {
  const { data, error } = await supabase
    .from('bookmarks')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Hook to fetch user bookmarks with TanStack Query caching.
 */
export function useBookmarks(userId) {
  return useQuery({
    queryKey: bookmarkKeys.all(userId),
    queryFn: () => fetchBookmarks(userId),
    enabled: !!userId,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
}

/**
 * Hook to add a bookmark with optimistic update.
 */
export function useAddBookmark(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookmarkData) => {
      const { data, error } = await supabase
        .from('bookmarks')
        .insert([{ ...bookmarkData, user_id: userId }])
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onMutate: async (newBookmark) => {
      // Cancel outgoing refetches
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.all(userId) });

      // Snapshot previous value
      const previous = queryClient.getQueryData(bookmarkKeys.all(userId));

      // Optimistically add the bookmark
      queryClient.setQueryData(bookmarkKeys.all(userId), (old = []) => [
        { ...newBookmark, user_id: userId, id: `temp-${Date.now()}`, created_at: new Date().toISOString() },
        ...old,
      ]);

      return { previous };
    },
    onError: (_err, _newBookmark, context) => {
      // Rollback on error
      if (context?.previous) {
        queryClient.setQueryData(bookmarkKeys.all(userId), context.previous);
      }
    },
    onSettled: () => {
      // Refetch to get server state
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all(userId) });
    },
  });
}

/**
 * Hook to remove a bookmark with optimistic update.
 */
export function useRemoveBookmark(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (bookmarkId) => {
      const { error } = await supabase
        .from('bookmarks')
        .delete()
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (error) throw error;
      return bookmarkId;
    },
    onMutate: async (bookmarkId) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.all(userId) });
      const previous = queryClient.getQueryData(bookmarkKeys.all(userId));

      // Optimistically remove the bookmark
      queryClient.setQueryData(bookmarkKeys.all(userId), (old = []) =>
        old.filter((b) => b.id !== bookmarkId)
      );

      return { previous };
    },
    onError: (_err, _bookmarkId, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bookmarkKeys.all(userId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all(userId) });
    },
  });
}

/**
 * Hook to update a bookmark's status with optimistic update.
 */
export function useUpdateBookmarkStatus(userId) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ bookmarkId, status }) => {
      const { error } = await supabase
        .from('bookmarks')
        .update({ status })
        .eq('id', bookmarkId)
        .eq('user_id', userId);

      if (error) throw error;
      return { bookmarkId, status };
    },
    onMutate: async ({ bookmarkId, status }) => {
      await queryClient.cancelQueries({ queryKey: bookmarkKeys.all(userId) });
      const previous = queryClient.getQueryData(bookmarkKeys.all(userId));

      queryClient.setQueryData(bookmarkKeys.all(userId), (old = []) =>
        old.map((b) => (b.id === bookmarkId ? { ...b, status } : b))
      );

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(bookmarkKeys.all(userId), context.previous);
      }
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: bookmarkKeys.all(userId) });
    },
  });
}
