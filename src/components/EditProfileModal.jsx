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
  "Solidity", "Web3", "Cloudflare"
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
        // If there's a matching suggestion, use it (preserves casing)
        const match = filteredSuggestions.find(
          (s) => s.toLowerCase() === inputValue.trim().toLowerCase()
        );
        addTag(match || inputValue.trim());
      }
    } else if (e.key === "Backspace" && !inputValue && value.length > 0) {
      removeTag(value[value.length - 1]);
    }
  };

  // Close suggestions on outside click
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
      <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1.5">
        Tech Stack
      </label>
      <p className="text-[10px] text-zinc-550 mb-2">
        Add your skills to get better SmartMatch recommendations
      </p>

      {/* Tags display */}
      <div className="flex flex-wrap gap-1.5 mb-2">
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1 px-2.5 py-1 bg-zinc-900 text-zinc-300 border border-zinc-800/80 rounded-md text-xs font-medium"
          >
            {tag}
            <button
              type="button"
              onClick={() => removeTag(tag)}
              className="p-0.5 hover:bg-zinc-800 rounded transition-colors text-zinc-400 hover:text-white"
            >
              <X className="w-3 h-3" />
            </button>
          </span>
        ))}
      </div>

      {/* Input */}
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          value={inputValue}
          onChange={(e) => {
            setInputValue(e.target.value);
            setShowSuggestions(true);
          }}
          onFocus={() => setShowSuggestions(true)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? "e.g., React, Node.js, Python..." : "Add more..."}
          className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800/80 rounded text-zinc-150 placeholder-zinc-650 focus:outline-none focus:border-zinc-700 transition-all text-xs"
        />
      </div>

      {/* Suggestions dropdown */}
      {showSuggestions && inputValue && filteredSuggestions.length > 0 && (
        <div className="absolute z-50 w-full mt-1 bg-zinc-950 border border-zinc-800 rounded-md shadow-xl overflow-hidden max-h-48 overflow-y-auto">
          {filteredSuggestions.map((suggestion) => (
            <button
              key={suggestion}
              type="button"
              onClick={() => addTag(suggestion)}
              className="w-full flex items-center gap-2 px-3 py-2 text-xs text-zinc-300 hover:bg-white/[0.02] hover:text-white transition-colors text-left"
            >
              <Plus className="w-3 h-3 text-zinc-400 flex-shrink-0" />
              {suggestion}
            </button>
          ))}
        </div>
      )}

      {/* Quick-add popular tags when empty */}
      {value.length === 0 && !inputValue && (
        <div className="mt-2">
          <p className="text-[9px] text-zinc-550 uppercase tracking-wider mb-1.5 font-semibold">Popular</p>
          <div className="flex flex-wrap gap-1.5">
            {["React", "TypeScript", "Node.js", "Python", "Next.js", "Tailwind CSS"].map((tech) => (
              <button
                key={tech}
                type="button"
                onClick={() => addTag(tech)}
                className="px-2 py-0.5 text-[10px] bg-zinc-900 border border-zinc-800 text-zinc-450 hover:bg-zinc-850 hover:text-white rounded-md transition-colors"
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
      // Fetch existing profile data from profiles table
      const fetchProfileData = async () => {
        try {
          const { data } = await supabase
            .from("profiles")
            .select("name, bio, location, company, website, tech_stack")
            .eq("id", user.id)
            .single();

          setFormData({
            name: data?.name || githubProfile.name || "",
            bio: data?.bio || githubProfile.bio || "",
            location: data?.location || githubProfile.location || "",
            company: data?.company || githubProfile.company || "",
            website: data?.website || githubProfile.blog || "",
            tech_stack: data?.tech_stack || [],
          });
        } catch {
          setFormData({
            name: githubProfile.name || "",
            bio: githubProfile.bio || "",
            location: githubProfile.location || "",
            company: githubProfile.company || "",
            website: githubProfile.blog || "",
            tech_stack: [],
          });
        }
      };
      fetchProfileData();
    }
  }, [isOpen, githubProfile, user?.id]);

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
      // Update profile in database
      const { error: updateError } = await supabase.from("profiles").upsert(
        {
          id: user.id,
          name: formData.name,
          bio: formData.bio,
          location: formData.location,
          company: formData.company,
          website: formData.website,
          tech_stack: formData.tech_stack,
          updated_at: new Date().toISOString(),
        },
        {
          onConflict: "id",
        },
      );

      if (updateError) throw updateError;

      setSuccess(true);

      // Call onSave callback to refresh parent data
      if (onSave) {
        onSave(formData);
      }

      // Close modal after 1 second
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
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-zinc-950 border border-zinc-800 rounded-lg w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">
        {/* Header - Fixed */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60 flex-shrink-0">
          <h2 className="text-xs font-bold text-white uppercase tracking-wider">Edit Profile</h2>
          <button
            onClick={onClose}
            className="p-1.5 text-zinc-400 hover:text-white hover:bg-white/5 rounded transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form - Scrollable Content */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 min-h-0">
          <div className="p-5 space-y-4 overflow-y-auto flex-1">
            {error && (
              <div className="p-3.5 bg-red-500/5 border border-red-550/20 rounded text-red-400 text-xs font-medium">
                {error}
              </div>
            )}

            {success && (
              <div className="p-3.5 bg-emerald-500/5 border border-emerald-500/20 rounded text-emerald-400 text-xs font-medium flex items-center gap-2">
                <Check className="w-3.5 h-3.5" />
                Profile updated successfully!
              </div>
            )}

            {/* Name */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Full Name
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                placeholder="Your full name"
                className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800/80 rounded text-zinc-150 placeholder-zinc-600 focus:outline-none focus:border-zinc-705 transition-all text-xs"
              />
            </div>

            {/* Bio */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Bio
              </label>
              <textarea
                name="bio"
                value={formData.bio}
                onChange={handleChange}
                placeholder="Tell us about yourself"
                rows={3}
                maxLength={160}
                className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800/80 rounded text-zinc-150 placeholder-zinc-650 focus:outline-none focus:border-zinc-705 transition-all resize-none text-xs"
              />
              <p className="text-[10px] text-zinc-500 mt-1 font-mono">
                {formData.bio.length}/160 characters
              </p>
            </div>

            {/* Tech Stack */}
            <TechStackInput
              value={formData.tech_stack}
              onChange={(newStack) =>
                setFormData({ ...formData, tech_stack: newStack })
              }
            />

            {/* Location */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Location
              </label>
              <input
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                placeholder="City, Country"
                className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800/80 rounded text-zinc-150 placeholder-zinc-600 focus:outline-none focus:border-zinc-705 transition-all text-xs"
              />
            </div>

            {/* Company */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Company
              </label>
              <input
                type="text"
                name="company"
                value={formData.company}
                onChange={handleChange}
                placeholder="Your company or organization"
                className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800/80 rounded text-zinc-150 placeholder-zinc-600 focus:outline-none focus:border-zinc-705 transition-all text-xs"
              />
            </div>

            {/* Website */}
            <div>
              <label className="block text-xs font-bold text-zinc-400 uppercase tracking-wider mb-2">
                Website
              </label>
              <input
                type="url"
                name="website"
                value={formData.website}
                onChange={handleChange}
                placeholder="https://yourwebsite.com"
                className="w-full px-3 py-2 bg-zinc-900/40 border border-zinc-800/80 rounded text-zinc-150 placeholder-zinc-600 focus:outline-none focus:border-zinc-705 transition-all text-xs"
              />
            </div>

            {/* Note */}
            <div className="p-3 bg-zinc-900 border border-zinc-800/60 rounded">
              <p className="text-[11px] text-zinc-400">
                <strong>Note:</strong> This updates your FirstIssue.dev profile.
                Your GitHub profile remains unchanged.
              </p>
            </div>
          </div>

          {/* Actions - Fixed at Bottom */}
          <div className="flex gap-3 p-5 border-t border-zinc-800/60 flex-shrink-0 bg-zinc-950">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 bg-transparent hover:bg-zinc-900 border border-zinc-800 text-zinc-300 hover:text-white rounded text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="flex-1 py-2 bg-white hover:bg-zinc-200 text-black rounded text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {saving ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  Saving...
                </>
              ) : success ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  Saved!
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
