import { supabase } from "../lib/supabase";

/**
 * Fetch all chat sessions for a user, ordered by most recently updated.
 */
export const fetchChatHistory = async (userId) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .select("id, title, messages, updated_at")
    .eq("user_id", userId)
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching chat history:", error);
    return [];
  }
  return data;
};

/**
 * Create a new chat session. Returns the created row (with its generated id).
 */
export const createChat = async (userId, title, messages) => {
  const { data, error } = await supabase
    .from("chat_sessions")
    .insert({
      user_id: userId,
      title,
      messages,
    })
    .select("id, title, messages, updated_at")
    .single();

  if (error) {
    console.error("Error creating chat:", error);
    return null;
  }
  return data;
};

/**
 * Update the messages array (and bump updated_at) for an existing chat.
 */
export const updateChatMessages = async (chatId, messages) => {
  const { error } = await supabase
    .from("chat_sessions")
    .update({
      messages,
      updated_at: new Date().toISOString(),
    })
    .eq("id", chatId);

  if (error) {
    console.error("Error updating chat messages:", error);
  }
};

/**
 * Rename a chat session.
 */
export const renameChat = async (chatId, title) => {
  const { error } = await supabase
    .from("chat_sessions")
    .update({ title })
    .eq("id", chatId);

  if (error) {
    console.error("Error renaming chat:", error);
  }
};

/**
 * Delete a chat session.
 */
export const deleteChat = async (chatId) => {
  const { error } = await supabase
    .from("chat_sessions")
    .delete()
    .eq("id", chatId);

  if (error) {
    console.error("Error deleting chat:", error);
  }
};
