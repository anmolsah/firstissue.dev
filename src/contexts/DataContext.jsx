import React, { createContext, useContext } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { useAuth } from "./AuthContext";
import {
  useContributions,
  contributionKeys,
} from "../hooks/queries/useContributions";
import {
  useBookmarks,
  useAddBookmark,
  useRemoveBookmark,
  useUpdateBookmarkStatus,
  bookmarkKeys,
} from "../hooks/queries/useBookmarks";

const DataContext = createContext();

export const useData = () => {
  const context = useContext(DataContext);
  if (!context) {
    throw new Error("useData must be used within DataProvider");
  }
  return context;
};

export const DataProvider = ({ children }) => {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  // TanStack Query hooks for data fetching
  const {
    data: contributions = null,
    isLoading: contributionsLoading,
  } = useContributions(user?.id);

  const {
    data: bookmarks = null,
    isLoading: bookmarksLoading,
  } = useBookmarks(user?.id);

  // Mutation hooks
  const addBookmarkMutation = useAddBookmark(user?.id);
  const removeBookmarkMutation = useRemoveBookmark(user?.id);
  const updateBookmarkStatusMutation = useUpdateBookmarkStatus(user?.id);

  const loading = {
    contributions: contributionsLoading,
    bookmarks: bookmarksLoading,
  };

  /**
   * Fetch contributions (triggers refetch via invalidation)
   */
  const fetchContributions = async (forceRefresh = false) => {
    if (!user?.id) return null;

    if (forceRefresh) {
      await queryClient.invalidateQueries({ queryKey: contributionKeys.all(user.id) });
    }
    return queryClient.getQueryData(contributionKeys.all(user.id)) || null;
  };

  /**
   * Fetch bookmarks (triggers refetch via invalidation)
   */
  const fetchBookmarks = async (forceRefresh = false) => {
    if (!user?.id) return null;

    if (forceRefresh) {
      await queryClient.invalidateQueries({ queryKey: bookmarkKeys.all(user.id) });
    }
    return queryClient.getQueryData(bookmarkKeys.all(user.id)) || null;
  };

  /**
   * Add bookmark
   */
  const addBookmark = async (bookmarkData) => {
    if (!user?.id) return null;
    try {
      return await addBookmarkMutation.mutateAsync(bookmarkData);
    } catch (error) {
      console.error("Error adding bookmark:", error);
      return null;
    }
  };

  /**
   * Remove bookmark
   */
  const removeBookmark = async (bookmarkId) => {
    if (!user?.id) return false;
    try {
      await removeBookmarkMutation.mutateAsync(bookmarkId);
      return true;
    } catch (error) {
      console.error("Error removing bookmark:", error);
      return false;
    }
  };

  /**
   * Update bookmark status
   */
  const updateBookmarkStatus = async (bookmarkId, status) => {
    if (!user?.id) return false;
    try {
      await updateBookmarkStatusMutation.mutateAsync({ bookmarkId, status });
      return true;
    } catch (error) {
      console.error("Error updating bookmark status:", error);
      return false;
    }
  };

  /**
   * Clear all cached data for current user
   */
  const clearUserCache = () => {
    if (!user?.id) return;
    queryClient.removeQueries({ queryKey: contributionKeys.all(user.id) });
    queryClient.removeQueries({ queryKey: bookmarkKeys.all(user.id) });
  };

  const value = {
    // Data
    contributions,
    bookmarks,
    loading,

    // Fetch functions
    fetchContributions,
    fetchBookmarks,

    // Mutation functions
    addBookmark,
    removeBookmark,
    updateBookmarkStatus,

    // Cache management
    clearUserCache,
  };

  return <DataContext.Provider value={value}>{children}</DataContext.Provider>;
};
