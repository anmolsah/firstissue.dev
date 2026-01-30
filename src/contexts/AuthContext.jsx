import React, { createContext, useContext, useEffect, useState } from "react";
import { supabase } from "../lib/supabase";

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Store GitHub token in database
  const storeGitHubToken = async (userId, token, userData) => {
    try {
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 60); // GitHub tokens typically last 60 days

      const { error } = await supabase.from("profiles").upsert(
        {
          id: userId,
          github_token: token,
          github_token_expires_at: expiresAt.toISOString(),
          github_username:
            userData.user_metadata?.user_name ||
            userData.user_metadata?.preferred_username,
          github_avatar_url: userData.user_metadata?.avatar_url,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

      if (error) {
        console.error("Error storing GitHub token:", error);
      } else {
        console.log("GitHub token stored successfully");
      }
    } catch (error) {
      console.error("Error in storeGitHubToken:", error);
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Store GitHub token if available
      if (session?.provider_token && session?.user) {
        storeGitHubToken(session.user.id, session.provider_token, session.user);
      }
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setUser(session?.user ?? null);
      setLoading(false);

      // Store GitHub token on sign in
      if (event === "SIGNED_IN" && session?.provider_token && session?.user) {
        storeGitHubToken(session.user.id, session.provider_token, session.user);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const signUp = async (email, password) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
    });
    return { data, error };
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    return { data, error };
  };

  const signInWithGitHub = async () => {
    const { data, error } = await supabase.auth.signInWithOAuth({
      provider: "github",
      options: {
        scopes: "read:user user:email public_repo",
        redirectTo: `${window.location.origin}/status`,
      },
    });
    return { data, error };
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    return { error };
  };

  const value = {
    user,
    loading,
    signUp,
    signIn,
    signInWithGitHub,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
