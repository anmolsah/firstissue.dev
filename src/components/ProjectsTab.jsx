import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  Plus,
  ExternalLink,
  Github,
  Pencil,
  Trash2,
  Loader2,
  FolderGit2,
  X,
  Globe,
} from "lucide-react";
import toast from "react-hot-toast";
import { useAuth } from "../contexts/AuthContext";
import {
  useUserProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "../hooks/useProjects";
import TechStackInput from "./TechStackInput";
import { normalizeExternalHttpUrl, formatCompactUrl } from "../utils/socialLinks";

/**
 * Shared project card used in both the private Projects tab and PublicProfilePage.
 */
export const LiveProjectCard = ({
  project,
  isOwner = false,
  onEdit,
  onDelete,
  isDeleting = false,
}) => {
  const safeLiveUrl = normalizeExternalHttpUrl(project.live_url);
  const safeRepoUrl = project.repo_url ? normalizeExternalHttpUrl(project.repo_url) : "";
  const stack = Array.isArray(project.tech_stack) ? project.tech_stack : [];

  return (
    <div className="bg-[#141518] border border-[#2B2E36] hover:border-[#3A3E48] rounded-[4px] p-5 flex flex-col justify-between gap-4 transition-colors">
      <div>
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <div className="flex items-center gap-2">
              <span
                className="w-2 h-2 rounded-full bg-[#34D399] shrink-0"
                title="Live deployment"
              />
              <h3 className="text-sm font-bold text-[#F4F4F0] truncate">
                {project.title}
              </h3>
            </div>
            {safeLiveUrl && (
              <a
                href={safeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-1 inline-flex items-center gap-1 text-xs font-mono text-[#8C929C] hover:text-[#DAFA9C] transition-colors max-w-full"
              >
                <Globe className="w-3 h-3 shrink-0" />
                <span className="truncate">{formatCompactUrl(safeLiveUrl)}</span>
              </a>
            )}
          </div>

          <div className="flex items-center gap-1.5 shrink-0">
            {safeRepoUrl && (
              <a
                href={safeRepoUrl}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`Source code for ${project.title}`}
                title="View source repository"
                className="p-1.5 rounded-[4px] bg-[#0B0C0E] border border-[#22242A] hover:border-[#3A3E48] text-[#A8ADB6] hover:text-[#F4F4F0] transition-colors"
              >
                <Github className="w-3.5 h-3.5" />
              </a>
            )}
            {safeLiveUrl && (
              <a
                href={safeLiveUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-[4px] bg-[#0B0C0E] border border-[#2B2E36] hover:border-[#DAFA9C]/60 text-xs font-mono font-semibold text-[#DAFA9C] transition-colors"
              >
                <span>Live</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            )}
          </div>
        </div>

        {project.description && (
          <p className="mt-3 text-xs text-[#A8ADB6] leading-relaxed break-words">
            {project.description}
          </p>
        )}
      </div>

      <div className="pt-3 border-t border-[#22242A] flex items-end justify-between gap-3">
        <div className="flex flex-wrap gap-1.5 min-w-0">
          {stack.length > 0 ? (
            stack.map((tech) => (
              <span
                key={tech}
                className="px-2 py-0.5 bg-[#0B0C0E] border border-[#22242A] rounded-[4px] text-[11px] font-mono text-[#F4F4F0]"
              >
                {tech}
              </span>
            ))
          ) : (
            <span className="text-[11px] font-mono text-[#8C929C]">No stack listed</span>
          )}
        </div>

        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={() => onEdit?.(project)}
              aria-label={`Edit ${project.title}`}
              title="Edit project"
              className="p-1.5 text-[#8C929C] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors cursor-pointer"
            >
              <Pencil className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={() => onDelete?.(project)}
              disabled={isDeleting}
              aria-label={`Delete ${project.title}`}
              title="Delete project"
              className="p-1.5 text-[#8C929C] hover:text-[#F87171] hover:bg-[#F87171]/10 rounded-[4px] transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isDeleting ? (
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
              ) : (
                <Trash2 className="w-3.5 h-3.5" />
              )}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const EMPTY_FORM = {
  title: "",
  liveUrl: "",
  repoUrl: "",
  description: "",
  techStack: [],
};

const ProjectsTab = () => {
  const { user } = useAuth();
  const { data: projects = [], isLoading } = useUserProjects(user?.id);
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);

  const ghUsername =
    user?.user_metadata?.user_name ||
    user?.user_metadata?.preferred_username ||
    user?.identities?.[0]?.identity_data?.user_name;

  const openAddForm = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setIsFormOpen(true);
  };

  const openEditForm = (project) => {
    setEditingId(project.id);
    setForm({
      title: project.title || "",
      liveUrl: project.live_url || "",
      repoUrl: project.repo_url || "",
      description: project.description || "",
      techStack: Array.isArray(project.tech_stack) ? project.tech_stack : [],
    });
    setIsFormOpen(true);
  };

  const closeForm = () => {
    setIsFormOpen(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!user?.id) return;

    if (!form.title.trim()) {
      toast.error("Please enter a project name.");
      return;
    }

    if (!form.liveUrl.trim()) {
      toast.error("Please enter the live project URL.");
      return;
    }

    if (form.techStack.length === 0) {
      toast.error("Add at least one technology to the tech stack.");
      return;
    }

    try {
      if (editingId) {
        await updateProject.mutateAsync({
          id: editingId,
          userId: user.id,
          title: form.title,
          description: form.description,
          liveUrl: form.liveUrl,
          repoUrl: form.repoUrl,
          techStack: form.techStack,
        });
        toast.success("Project updated");
      } else {
        await createProject.mutateAsync({
          userId: user.id,
          title: form.title,
          description: form.description,
          liveUrl: form.liveUrl,
          repoUrl: form.repoUrl,
          techStack: form.techStack,
        });
        toast.success("Live project added to your profile");
      }
      closeForm();
    } catch (err) {
      toast.error(err.message || "Failed to save project");
    }
  };

  const handleDelete = async (project) => {
    if (!user?.id || !project?.id) return;
    setDeletingId(project.id);
    try {
      await deleteProject.mutateAsync({ id: project.id, userId: user.id });
      toast.success("Project removed");
      if (editingId === project.id) {
        closeForm();
      }
    } catch (err) {
      toast.error(err.message || "Failed to remove project");
    } finally {
      setDeletingId(null);
    }
  };

  const isSaving = createProject.isPending || updateProject.isPending;

  return (
    <div className="space-y-6">
      {/* Section Header */}
      <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h2 className="text-sm font-bold text-[#F4F4F0] flex items-center gap-2 uppercase tracking-wide">
            <FolderGit2 className="w-4 h-4 text-[#DAFA9C]" />
            Live Projects Showcase
          </h2>
          <p className="text-xs text-[#A8ADB6] mt-1 leading-relaxed">
            Add links to your deployed projects and the tech stack behind them. Added projects appear on your{" "}
            {ghUsername ? (
              <Link
                to={`/u/${ghUsername}`}
                className="text-[#DAFA9C] hover:underline font-mono"
              >
                public profile (/u/{ghUsername})
              </Link>
            ) : (
              "public profile"
            )}
            .
          </p>
        </div>

        {!isFormOpen && (
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors shrink-0 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Live Project
          </button>
        )}
      </div>

      {/* Add / Edit Project Form */}
      {isFormOpen && (
        <form
          onSubmit={handleSubmit}
          className="bg-[#141518] border border-[#2B2E36] rounded-[4px] p-5 space-y-4"
        >
          <div className="flex items-center justify-between pb-3 border-b border-[#22242A]">
            <h3 className="text-xs font-mono font-bold text-[#F4F4F0] uppercase tracking-wider">
              {editingId ? "Edit Live Project" : "Add New Live Project"}
            </h3>
            <button
              type="button"
              onClick={closeForm}
              aria-label="Close project form"
              className="p-1 text-[#8C929C] hover:text-[#F4F4F0] rounded-[4px] hover:bg-[#1C1E23] transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label
                htmlFor="project-title"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Project Name <span className="text-[#DAFA9C]">*</span>
              </label>
              <input
                id="project-title"
                type="text"
                maxLength={120}
                value={form.title}
                onChange={(e) => setForm({ ...form, title: e.target.value })}
                placeholder="e.g., DevPulse Analytics"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="project-live-url"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Live Project URL <span className="text-[#DAFA9C]">*</span>
              </label>
              <input
                id="project-live-url"
                type="text"
                value={form.liveUrl}
                onChange={(e) => setForm({ ...form, liveUrl: e.target.value })}
                placeholder="https://yourproject.dev"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="project-repo-url"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              GitHub / Source URL{" "}
              <span className="text-[11px] font-normal lowercase text-[#8C929C]">
                (optional)
              </span>
            </label>
            <input
              id="project-repo-url"
              type="text"
              value={form.repoUrl}
              onChange={(e) => setForm({ ...form, repoUrl: e.target.value })}
              placeholder="https://github.com/username/repo"
              className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
            />
          </div>

          <div>
            <label
              htmlFor="project-description"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              Short Description{" "}
              <span className="text-[11px] font-normal lowercase text-[#8C929C]">
                (optional)
              </span>
            </label>
            <textarea
              id="project-description"
              rows={2}
              maxLength={240}
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              placeholder="What did you build and what problem does it solve?"
              className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors resize-none text-xs"
            />
            <p className="text-[11px] text-[#8C929C] mt-1 font-mono tabular-nums">
              {form.description.length}/240 characters
            </p>
          </div>

          <TechStackInput
            id="project-tech-stack"
            label="Tech Stack *"
            helperText="Add the languages, frameworks, and infrastructure used to build this project."
            placeholder="e.g., Next.js, TypeScript, Supabase, Tailwind CSS..."
            value={form.techStack}
            onChange={(nextStack) => setForm({ ...form, techStack: nextStack })}
          />

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-[#22242A]">
            <button
              type="button"
              onClick={closeForm}
              className="px-4 py-2 bg-[#17181B] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isSaving}
              className="inline-flex items-center gap-2 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50 cursor-pointer"
            >
              {isSaving && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              {editingId ? "Save Changes" : "Publish Project"}
            </button>
          </div>
        </form>
      )}

      {/* Projects Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-14 bg-[#141518] border border-[#2B2E36] rounded-[4px]">
          <Loader2 className="w-5 h-5 text-[#DAFA9C] animate-spin" />
          <span className="ml-2.5 text-xs font-mono text-[#8C929C]">
            Loading projects...
          </span>
        </div>
      ) : projects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {projects.map((project) => (
            <LiveProjectCard
              key={project.id}
              project={project}
              isOwner
              onEdit={openEditForm}
              onDelete={handleDelete}
              isDeleting={deletingId === project.id}
            />
          ))}
        </div>
      ) : !isFormOpen ? (
        <div className="text-center py-14 px-4 border border-dashed border-[#2B2E36] rounded-[4px] bg-[#141518]">
          <FolderGit2 className="mx-auto h-9 w-9 text-[#8C929C] mb-3" />
          <h3 className="text-sm font-semibold text-[#F4F4F0] mb-1">
            No live projects added yet
          </h3>
          <p className="text-xs text-[#A8ADB6] max-w-md mx-auto mb-5 leading-relaxed">
            Share links to deployed apps, CLIs, or libraries you&apos;ve built along with their tech stack so visitors and recruiters can explore them on your public profile.
          </p>
          <button
            type="button"
            onClick={openAddForm}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            Add Your First Project
          </button>
        </div>
      ) : null}
    </div>
  );
};

export default ProjectsTab;
