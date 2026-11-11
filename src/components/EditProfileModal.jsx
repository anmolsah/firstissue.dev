import React, { useState, useEffect, useRef } from "react";
import { X, Loader2, Check, Plus } from "lucide-react";
import { supabase } from "../lib/supabase";

const TECH_SUGGESTIONS = [
  "React", "Next.js", "Vue", "Nuxt", "Angular", "Svelte", "SvelteKit",
  "JavaScript", "TypeScript", "Node.js", "Express", "Fastify", "NestJS",
  "HTML", "CSS",
  "Python", "Django", "Flask", "FastAPI",
  "Java", "Spring Boot", "Kotlin",
  "Go", "Rust", "C++", "C#", ".NET",
  "Ruby", "Rails", "PHP", "Laravel",
  "Swift", "React Native", "Flutter", "Dart",
  "Tailwind CSS", "Bootstrap", "Sass",
  "GraphQL", "REST API", "tRPC",
  "PostgreSQL", "MongoDB", "MySQL", "Redis", "Supabase", "Firebase",
  "Docker", "Kubernetes", "AWS", "GCP", "Azure",
  "Git", "CI/CD", "Linux",
  "Machine Learning", "TensorFlow", "PyTorch",
  "Cloudflare"
];

const TechStackInput = ({ value = [], onChange }) => {
  const [inputValue, setInputValue] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const inputRef = useRef(null);
  const containerRef = useRef(null);

  const filteredSuggestions = TECH_SUGGESTIONS.filter(
    (tech) =>
      tech.toLowerCase().includes(inputValue.toLowerCase()) &&
      !value.includes(tech)
  ).slice(0, 8);

  const addTag = (tag) => {
    const trimmed = tag.trim();
    if (trimmed && !value.includes(trimmed)) {
      onChange([...value, trimmed]);
    }
    setInputValue("");
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const removeTag = (tagToRemove) => {
    onChange(value.filter((t) => t !== tagToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      if (inputValue.trim()) {
        const match = filteredSuggestions.find(
          (s) => s.toLowerCase() === inputValue.trim().toLowerCase()
        );
        addTag(match || inputValue.trim());
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  return (
    <div ref={containerRef} className="relative">
      <label
        htmlFor="profile-tech-stack"
        className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
      >
        Tech Stack
      </label>
      <p className="text-xs text-[#8C929C] mb-2">
        Add languages or frameworks to improve SmartMatch issue recommendations.
      </p>

      {value.length > 0 && (
        <div className="flex flex-wrap gap-1.5 mb-2">
          {value.map((tag) => (
            <span
              key={tag}
              className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-[#17181B] text-[#F4F4F0] border border-[#2B2E36] rounded-[4px] text-xs font-mono"
            >
              {tag}
              <button
                type="button"
                onClick={() => removeTag(tag)}
                aria-label={`Remove ${tag}`}
                className="p-0.5 hover:bg-[#1C1E23] rounded-[4px] transition-colors text-[#8C929C] hover:text-[#F4F4F0]"
              >
                <X className="w-3 h-3" />
              </button>
            </span>
          ))}
        </div>
      )}

      <div className="relative">
        <input
          id="profile-tech-stack"
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "e.g., React, Node.js, Python..." : "Add technology..."}
          className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
        />
      </div>

      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-[#17181B] border border-[#2B2E36] rounded-[4px] shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0] transition-colors text-left"
            >
              <Plus className="w-3 h-3 text-[#DAFA9C] shrink-0" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {value.length === 0 && !inputValue && (
        <div className="mt-2.5">
          <p className="text-xs text-[#8C929C] mb-1.5 font-mono">Quick add:</p>
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Node.js", "Python", "Next.js", "Tailwind CSS"].map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTag(tech)}
                className="px-2.5 py-1 text-xs bg-[#141518] border border-[#2B2E36] text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0] rounded-[4px] transition-colors"
              >
                + {tech}
              </button>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

const EditProfileModal = ({ isOpen, onClose, user, githubProfile, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    college: "",
    location: "",
    company: "",
    website: "",
    tech_stack: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && githubProfile) {
      const fetchProfileData = async () => {
        try {
          let { data, error: fetchErr } = await supabase
            .from("profiles")
            .select("name, bio, college, location, company, website, tech_stack")
            .eq("id", user.id)
            .single();

          if (
            fetchErr &&
            (fetchErr.message?.toLowerCase().includes("college") ||
              fetchErr.code === "PGRST204" ||
              fetchErr.code === "42703")
          ) {
            const fallback = await supabase
              .from("profiles")
              .select("name, bio, location, company, website, tech_stack")
              .eq("id", user.id)
              .single();
            data = fallback.data;
          }

          setFormData({
            name: data?.name || githubProfile.name || "",
            bio: data?.bio || githubProfile.bio || "",
            college: data?.college || user?.user_metadata?.college || "",
            location: data?.location || githubProfile.location || "",
            company: data?.company || githubProfile.company || "",
            website: data?.website || githubProfile.blog || "",
            tech_stack: data?.tech_stack || [],
          });
        } catch {
          setFormData({
            name: githubProfile.name || "",
            bio: githubProfile.bio || "",
            college: user?.user_metadata?.college || "",
            location: githubProfile.location || "",
            company: githubProfile.company || "",
            website: githubProfile.blog || "",
            tech_stack: [],
          });
        }
      };
      fetchProfileData();
    }
  }, [isOpen, githubProfile, user?.id, user?.user_metadata?.college]);

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    setSuccess(false);

    try {
      const payload = {
        id: user.id,
        name: formData.name,
        bio: formData.bio,
        college: formData.college,
        location: formData.location,
        company: formData.company,
        website: formData.website,
        tech_stack: formData.tech_stack,
        updated_at: new Date().toISOString(),
      };

      let { error: updateError } = await supabase.from("profiles").upsert(payload, {
        onConflict: "id",
      });

      if (
        updateError &&
        (updateError.message?.toLowerCase().includes("college") ||
          updateError.code === "PGRST204" ||
          updateError.code === "42703")
      ) {
        delete payload.college;
        const retry = await supabase.from("profiles").upsert(payload, {
          onConflict: "id",
        });
        updateError = retry.error;
      }

      if (updateError) throw updateError;

      setSuccess(true);

      if (onSave) {
        onSave(formData);
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 1000);
    } catch (err) {
      console.error("Error updating profile:", err);
      setError(err.message || "Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/75"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-profile-modal-title"
    >
      <div className="bg-[#141518] border border-[#2B2E36] rounded-[4px] w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-5 border-b border-[#22242A] flex-shrink-0">
          <h2
            id="edit-profile-modal-title"
            className="text-xs font-mono font-semibold text-[#F4F4F0] uppercase tracking-wider"
          >
            Edit Profile
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close edit profile modal"
            className="p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3 bg-[#F87171]/10 border border-[#F87171]/30 rounded-[4px] text-[#F87171] text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3 bg-[#34D399]/10 border border-[#34D399]/30 rounded-[4px] text-[#34D399] text-xs font-medium flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                Profile updated.
              </div>
            )}

            <div>
              <label
                htmlFor="edit-profile-name"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Full Name
              </label>
              <input
                id="edit-profile-name"
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-profile-bio"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Bio
              </label>
              <textarea
                id="edit-profile-bio"
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Short engineering bio"
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors resize-none text-xs"
              />
              <p className="text-xs text-[#8C929C] mt-1 font-mono tabular-nums">
                {formData.bio.length}/160 characters
              </p>
            </div>

            <TechStackInput
              value={formData.tech_stack}
              onChange={(newStack) =>
                setFormData({ ...formData, tech_stack: newStack })
              }
            />

            <div>
              <label
                htmlFor="edit-profile-college"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                College or University
              </label>
              <input
                id="edit-profile-college"
                type="text"
                name="college"
                value={formData.college}
                onChange={handleChange}
                placeholder="Your school or university"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-profile-location"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Location
              </label>
              <input
                id="edit-profile-location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-profile-company"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Company or Lab
              </label>
              <input
                id="edit-profile-company"
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Organization"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>

            <div>
              <label
                htmlFor="edit-profile-website"
                className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
              >
                Website
              </label>
              <input
                id="edit-profile-website"
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yoursite.dev"
                className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
              />
            </div>

            <div className="p-3 bg-[#17181B] border border-[#22242A] rounded-[4px]">
              <p className="text-xs text-[#A8ADB6]">
                <strong className="text-[#F4F4F0]">Note:</strong> Updates apply only to your FirstIssue.dev profile; your GitHub account details remain unchanged.
              </p>
            </div>
          </div>

          <div className="flex gap-3 p-5 border-t border-[#22242A] flex-shrink-0 bg-[#0F0F0F]">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="flex-1 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved
                </>
              ) : (
                "Save Changes"
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditProfileModal;
