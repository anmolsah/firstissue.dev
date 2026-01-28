import React, {
  createContext,
  useContext,
  useState,
  useCallback,
  useEffect,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";
import { getCache, setCache, clearCache, CACHE_KEYS } from "../utils/cache";

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
  const [contributions, setContributions] = useState(null);
  const [bookmarks, setBookmarks] = useState(null);
  const [loading, setLoading] = useState({
    contributions: false,
    bookmarks: false,
  });

  /**
   * Fetch contributions with caching
   */
  const fetchContributions = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return null;

      const cacheKey = CACHE_KEYS.CONTRIBUTIONS(user.id);

      // Return cached data if available and not forcing refresh
      if (!forceRefresh) {
        const cached = getCache(cacheKey);
        if (cached) {
          setContributions(cached);
          return cached;
        }
      }

      setLoading((prev) => ({ ...prev, contributions: true }));

      try {
        const { data, error } = await supabase
          .from("contributions")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Cache the data
        setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes
        setContributions(data);
        return data;
      } catch (error) {
        console.error("Error fetching contributions:", error);
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, contributions: false }));
      }
    },
    [user?.id],
  );

  /**
   * Fetch bookmarks with caching
   */
  const fetchBookmarks = useCallback(
    async (forceRefresh = false) => {
      if (!user?.id) return null;

      const cacheKey = CACHE_KEYS.BOOKMARKS(user.id);

      // Return cached data if available and not forcing refresh
      if (!forceRefresh) {
        const cached = getCache(cacheKey);
        if (cached) {
          setBookmarks(cached);
          return cached;
        }
      }

      setLoading((prev) => ({ ...prev, bookmarks: true }));

      try {
        const { data, error } = await supabase
          .from("bookmarks")
          .select("*")
          .eq("user_id", user.id)
          .order("created_at", { ascending: false });

        if (error) throw error;

        // Cache the data
        setCache(cacheKey, data, 5 * 60 * 1000); // 5 minutes
        setBookmarks(data);
        return data;
      } catch (error) {
        console.error("Error fetching bookmarks:", error);
        return null;
      } finally {
        setLoading((prev) => ({ ...prev, bookmarks: false }));
      }
    },
    [user?.id],
  );

  /**
   * Add bookmark and update cache
   */
  const addBookmark = useCallback(
    async (bookmarkData) => {
      if (!user?.id) return null;

      try {
        const { data, error } = await supabase
          .from("bookmarks")
          .insert([{ ...bookmarkData, user_id: user.id }])
          .select()
          .single();

        if (error) throw error;

        // Update local state
        setBookmarks((prev) => [data, ...(prev || [])]);

        // Update cache
        const cacheKey = CACHE_KEYS.BOOKMARKS(user.id);
        const updatedBookmarks = [data, ...(bookmarks || [])];
        setCache(cacheKey, updatedBookmarks, 5 * 60 * 1000);

        return data;
      } catch (error) {
        console.error("Error adding bookmark:", error);
        return null;
      }
    },
    [user?.id, bookmarks],
  );

  /**
   * Remove bookmark and update cache
   */
  const removeBookmark = useCallback(
    async (bookmarkId) => {
      if (!user?.id) return false;

      try {
        const { error } = await supabase
          .from("bookmarks")
          .delete()
          .eq("id", bookmarkId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setBookmarks((prev) => prev?.filter((b) => b.id !== bookmarkId) || []);

        // Update cache
        const cacheKey = CACHE_KEYS.BOOKMARKS(user.id);
        const updatedBookmarks =
          bookmarks?.filter((b) => b.id !== bookmarkId) || [];
        setCache(cacheKey, updatedBookmarks, 5 * 60 * 1000);

        return true;
      } catch (error) {
        console.error("Error removing bookmark:", error);
        return false;
      }
    },
    [user?.id, bookmarks],
  );

  /**
   * Update bookmark status and update cache
   */
  const updateBookmarkStatus = useCallback(
    async (bookmarkId, status) => {
      if (!user?.id) return false;

      try {
        const { error } = await supabase
          .from("bookmarks")
          .update({ status })
          .eq("id", bookmarkId)
          .eq("user_id", user.id);

        if (error) throw error;

        // Update local state
        setBookmarks(
          (prev) =>
            prev?.map((b) => (b.id === bookmarkId ? { ...b, status } : b)) ||
            [],
        );

        // Update cache
        const cacheKey = CACHE_KEYS.BOOKMARKS(user.id);
        const updatedBookmarks =
          bookmarks?.map((b) => (b.id === bookmarkId ? { ...b, status } : b)) ||
          [];
        setCache(cacheKey, updatedBookmarks, 5 * 60 * 1000);

        return true;
      } catch (error) {
        console.error("Error updating bookmark status:", error);
        return false;
      }
    },
    [user?.id, bookmarks],
  );

  /**
   * Clear all cached data for current user
   */
  const clearUserCache = useCallback(() => {
    if (!user?.id) return;

    clearCache(CACHE_KEYS.CONTRIBUTIONS(user.id));
    clearCache(CACHE_KEYS.BOOKMARKS(user.id));
    clearCache(CACHE_KEYS.USER_PROFILE(user.id));
    clearCache(CACHE_KEYS.GITHUB_SYNC(user.id));

    setContributions(null);
    setBookmarks(null);
  }, [user?.id]);

  /**
   * Preload data on mount
   */
  useEffect(() => {
    if (user?.id) {
      // Load from cache immediately
      const contributionsCache = getCache(CACHE_KEYS.CONTRIBUTIONS(user.id));
      const bookmarksCache = getCache(CACHE_KEYS.BOOKMARKS(user.id));

      if (contributionsCache) setContributions(contributionsCache);
      if (bookmarksCache) setBookmarks(bookmarksCache);

      // Fetch fresh data in background if cache is old
      if (!contributionsCache) fetchContributions();
      if (!bookmarksCache) fetchBookmarks();
    }
  }, [user?.id]);

  /**
   * Clear cache on logout
   */
  useEffect(() => {
    if (!user) {
      clearUserCache();
    }
  }, [user, clearUserCache]);

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
