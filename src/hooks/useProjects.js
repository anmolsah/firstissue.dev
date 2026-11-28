import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "../lib/supabase";
import { normalizeExternalHttpUrl } from "../utils/socialLinks";

export const projectKeys = {
  user: (userId) => ["userProjects", userId],
};

function isMissingTableError(err) {
  if (!err) return false;
  const msg = String(err.message || "").toLowerCase();
  return (
    err.code === "42P01" ||
    err.code === "PGRST205" ||
    msg.includes("user_projects") ||
    msg.includes("does not exist") ||
    msg.includes("schema cache")
  );
}

function getLocalProjects(userId) {
  if (!userId) return [];
  try {
    const raw = localStorage.getItem(`firstissue_projects_${userId}`);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setLocalProjects(userId, list) {
  if (!userId) return;
  try {
    localStorage.setItem(`firstissue_projects_${userId}`, JSON.stringify(list));
  } catch {
    // ignore storage quota errors
  }
}

export function useUserProjects(userId) {
  return useQuery({
    queryKey: projectKeys.user(userId),
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from("user_projects")
        .select("*")
        .eq("user_id", userId)
        .order("created_at", { ascending: false });

      if (error) {
        if (isMissingTableError(error)) {
          return getLocalProjects(userId);
        }
        throw error;
      }

      return data || [];
    },
    enabled: !!userId,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ userId, title, description, liveUrl, repoUrl, techStack }) => {
      const normalizedLiveUrl = normalizeExternalHttpUrl(liveUrl);
      if (!normalizedLiveUrl) {
        throw new Error("Please enter a valid live project URL (e.g., https://myapp.dev).");
      }

      const normalizedRepoUrl = repoUrl?.trim() ? normalizeExternalHttpUrl(repoUrl) : null;
      if (repoUrl?.trim() && !normalizedRepoUrl) {
        throw new Error("Please enter a valid source repository URL or leave it empty.");
      }

      const cleanTitle = String(title || "").trim();
      if (!cleanTitle) {
        throw new Error("Project title is required.");
      }

      const cleanStack = Array.isArray(techStack)
        ? techStack.map((t) => String(t).trim()).filter(Boolean)
        : [];

      const payload = {
        user_id: userId,
        title: cleanTitle.slice(0, 120),
        description: description?.trim() ? description.trim().slice(0, 400) : null,
        live_url: normalizedLiveUrl,
        repo_url: normalizedRepoUrl,
        tech_stack: cleanStack,
      };

      const { data, error } = await supabase
        .from("user_projects")
        .insert(payload)
        .select("*")
        .single();

      if (error) {
        if (isMissingTableError(error)) {
          const localItem = {
            id: `local-${Date.now()}`,
            ...payload,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          };
          const next = [localItem, ...getLocalProjects(userId)];
          setLocalProjects(userId, next);
          return localItem;
        }
        throw error;
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId, title, description, liveUrl, repoUrl, techStack }) => {
      const normalizedLiveUrl = normalizeExternalHttpUrl(liveUrl);
      if (!normalizedLiveUrl) {
        throw new Error("Please enter a valid live project URL (e.g., https://myapp.dev).");
      }

      const normalizedRepoUrl = repoUrl?.trim() ? normalizeExternalHttpUrl(repoUrl) : null;
      if (repoUrl?.trim() && !normalizedRepoUrl) {
        throw new Error("Please enter a valid source repository URL or leave it empty.");
      }

      const cleanTitle = String(title || "").trim();
      if (!cleanTitle) {
        throw new Error("Project title is required.");
      }

      const cleanStack = Array.isArray(techStack)
        ? techStack.map((t) => String(t).trim()).filter(Boolean)
        : [];

      const updates = {
        title: cleanTitle.slice(0, 120),
        description: description?.trim() ? description.trim().slice(0, 400) : null,
        live_url: normalizedLiveUrl,
        repo_url: normalizedRepoUrl,
        tech_stack: cleanStack,
        updated_at: new Date().toISOString(),
      };

      if (String(id).startsWith("local-")) {
        const list = getLocalProjects(userId).map((p) =>
          p.id === id ? { ...p, ...updates } : p
        );
        setLocalProjects(userId, list);
        return list.find((p) => p.id === id);
      }

      const { data, error } = await supabase
        .from("user_projects")
        .update(updates)
        .eq("id", id)
        .eq("user_id", userId)
        .select("*")
        .single();

      if (error) {
        if (isMissingTableError(error)) {
          const list = getLocalProjects(userId).map((p) =>
            p.id === id ? { ...p, ...updates } : p
          );
          setLocalProjects(userId, list);
          return list.find((p) => p.id === id);
        }
        throw error;
      }

      return data;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ id, userId }) => {
      if (String(id).startsWith("local-")) {
        const next = getLocalProjects(userId).filter((p) => p.id !== id);
        setLocalProjects(userId, next);
        return true;
      }

      const { error } = await supabase
        .from("user_projects")
        .delete()
        .eq("id", id)
        .eq("user_id", userId);

      if (error) {
        if (isMissingTableError(error)) {
          const next = getLocalProjects(userId).filter((p) => p.id !== id);
          setLocalProjects(userId, next);
          return true;
        }
        throw error;
      }

      return true;
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: projectKeys.user(variables.userId) });
      queryClient.invalidateQueries({ queryKey: ["publicProfile"] });
    },
  });
}
