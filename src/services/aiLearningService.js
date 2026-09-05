import { supabase } from "../lib/supabase";

const LOCAL_STORAGE_KEY = "firstmate_learned_knowledge_v1";
const LOCAL_FEEDBACK_KEY = "firstmate_message_feedback_v1";

/**
 * Retrieves the local cache of learned solutions.
 */
export const getLocalLearnedSolutions = () => {
  try {
    const raw = localStorage.getItem(LOCAL_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.warn("Failed to load learned solutions from localStorage:", err);
    return [];
  }
};

/**
 * Saves learned solutions to localStorage.
 */
const saveLocalLearnedSolutions = (solutions) => {
  try {
    localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(solutions.slice(-50))); // Keep last 50
  } catch (err) {
    console.warn("Failed to save learned solution to localStorage:", err);
  }
};

/**
 * Records user feedback (upvote, downvote, or user correction) for a specific Q&A exchange.
 */
export const recordAiFeedback = async ({
  userQuery,
  assistantResponse,
  feedbackType, // 'up' | 'down' | 'correction'
  correctionText = null,
  userId = null,
}) => {
  if (!userQuery || !assistantResponse || !feedbackType) return null;

  const newEntry = {
    id: `local-${Date.now()}`,
    query_text: userQuery.trim(),
    assistant_response: assistantResponse.trim(),
    user_feedback: feedbackType,
    user_correction: correctionText ? correctionText.trim() : null,
    created_at: new Date().toISOString(),
    helpful_count: feedbackType === "up" ? 1 : 0,
  };

  // 1. Update local storage cache
  const localList = getLocalLearnedSolutions();
  const existingIdx = localList.findIndex(
    (item) =>
      item.query_text.toLowerCase() === userQuery.toLowerCase().trim() &&
      item.user_feedback === feedbackType
  );

  if (existingIdx >= 0) {
    localList[existingIdx].helpful_count = (localList[existingIdx].helpful_count || 1) + 1;
    if (correctionText) {
      localList[existingIdx].user_correction = correctionText.trim();
    }
  } else {
    localList.unshift(newEntry);
  }
  saveLocalLearnedSolutions(localList);

  // 2. Persist to Supabase if connected
  try {
    const { data, error } = await supabase.rpc("vote_learned_solution", {
      p_query_text: userQuery.trim(),
      p_assistant_response: assistantResponse.trim(),
      p_feedback: feedbackType,
      p_correction: correctionText ? correctionText.trim() : null,
    });

    if (error) {
      // Fallback to standard insert if RPC does not exist
      await supabase.from("ai_learned_solutions").insert({
        user_id: userId,
        query_text: userQuery.trim(),
        assistant_response: assistantResponse.trim(),
        user_feedback: feedbackType,
        user_correction: correctionText ? correctionText.trim() : null,
      });
    }
    return data || newEntry.id;
  } catch (err) {
    console.warn("Supabase learning persistence notice (local memory active):", err.message);
    return newEntry.id;
  }
};

/**
 * Finds learned solutions and corrections that match keywords in the current query.
 */
export const findMatchingLearnedContext = (query) => {
  if (!query) return [];

  const terms = query
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 3);

  if (terms.length === 0) return [];

  const localList = getLocalLearnedSolutions();

  const scored = localList
    .filter((item) => item.user_feedback === "up" || item.user_correction)
    .map((item) => {
      const qLower = item.query_text.toLowerCase();
      let matchCount = 0;
      for (const term of terms) {
        if (qLower.includes(term)) matchCount++;
      }
      return { item, matchCount };
    })
    .filter((entry) => entry.matchCount > 0)
    .sort((a, b) => b.matchCount - a.matchCount || b.item.helpful_count - a.item.helpful_count);

  return scored.slice(0, 3).map((s) => s.item);
};

/**
 * Caches message feedback state (up/down) in localStorage.
 */
export const getMessageFeedback = (messageKey) => {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    return map[messageKey] || null;
  } catch {
    return null;
  }
};

export const setMessageFeedback = (messageKey, feedbackType) => {
  try {
    const raw = localStorage.getItem(LOCAL_FEEDBACK_KEY);
    const map = raw ? JSON.parse(raw) : {};
    map[messageKey] = feedbackType;
    localStorage.setItem(LOCAL_FEEDBACK_KEY, JSON.stringify(map));
  } catch (err) {
    console.warn("Failed to set message feedback:", err);
  }
};
