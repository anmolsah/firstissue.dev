import { supabase } from "../lib/supabase";

/**
 * Check if user has a valid GitHub token
 */
export const hasValidGitHubToken = async (userId) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('github_token, github_token_expires_at')
            .eq('id', userId)
            .single();

        if (error || !profile?.github_token) {
            return false;
        }

        // Check expiry
        if (profile.github_token_expires_at) {
            const expiresAt = new Date(profile.github_token_expires_at);
            if (expiresAt < new Date()) {
                return false;
            }
        }

        return true;
    } catch (error) {
        console.error("Error checking GitHub token:", error);
        return false;
    }
};

/**
 * Get GitHub token from database
 */
export const getStoredGitHubToken = async (userId) => {
    try {
        const { data: profile, error } = await supabase
            .from('profiles')
            .select('github_token')
            .eq('id', userId)
            .single();

        if (error || !profile?.github_token) {
            return null;
        }

        return profile.github_token;
    } catch (error) {
        console.error("Error getting stored GitHub token:", error);
        return null;
    }
};

/**
 * Clear GitHub token (for logout or reconnect)
 */
export const clearGitHubToken = async (userId) => {
    try {
        const { error } = await supabase
            .from('profiles')
            .update({
                github_token: null,
                github_token_expires_at: null,
                updated_at: new Date().toISOString(),
            })
            .eq('id', userId);

        if (error) {
            console.error("Error clearing GitHub token:", error);
            return false;
        }

        return true;
    } catch (error) {
        console.error("Error in clearGitHubToken:", error);
        return false;
    }
};
