import React, { useState, useEffect } from "react";
import { X, Loader2, Check } from "lucide-react";
import { supabase } from "../lib/supabase";
import TechStackInput from "./TechStackInput";
import { LinkedInOfficialLogo, XTwitterOfficialLogo } from "./SocialBrandIcons";
import { normalizeLinkedInUrl, normalizeTwitterUrl } from "../utils/socialLinks";

function isMissingColumnError(err) {
  if (!err) return false;
  const msg = String(err.message || "").toLowerCase();
  return (
    err.code === "PGRST204" ||
    err.code === "42703" ||
    msg.includes("column") ||
    msg.includes("schema cache")
  );
}

const EditProfileModal = ({ isOpen, onClose, user, githubProfile, onSave }) => {
  const [formData, setFormData] = useState({
    name: "",
    bio: "",
    college: "",
    location: "",
    company: "",
    website: "",
    linkedin_url: "",
    twitter_url: "",
    tech_stack: [],
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (isOpen && user?.id) {
      const fetchProfileData = async () => {
        try {
          let { data, error: fetchErr } = await supabase
            .from("profiles")
            .select("name, bio, college, location, company, website, linkedin_url, twitter_url, tech_stack")
            .eq("id", user.id)
            .single();

          if (fetchErr && isMissingColumnError(fetchErr)) {
            const fallbackWithCollege = await supabase
              .from("profiles")
              .select("name, bio, college, location, company, website, tech_stack")
              .eq("id", user.id)
              .single();

            if (!fallbackWithCollege.error) {
              data = fallbackWithCollege.data;
            } else {
              const baseFallback = await supabase
                .from("profiles")
                .select("name, bio, location, company, website, tech_stack")
                .eq("id", user.id)
                .single();
              data = baseFallback.data;
            }
          }

          setFormData({
            name: data?.name || githubProfile?.name || "",
            bio: data?.bio || githubProfile?.bio || "",
            college: data?.college || user?.user_metadata?.college || "",
            location: data?.location || githubProfile?.location || "",
            company: data?.company || githubProfile?.company || "",
            website: data?.website || githubProfile?.blog || "",
            linkedin_url: data?.linkedin_url ?? user?.user_metadata?.linkedin_url ?? "",
            twitter_url: data?.twitter_url ?? user?.user_metadata?.twitter_url ?? "",
            tech_stack: data?.tech_stack || [],
          });
        } catch {
          setFormData({
            name: githubProfile?.name || "",
            bio: githubProfile?.bio || "",
            college: user?.user_metadata?.college || "",
            location: githubProfile?.location || "",
            company: githubProfile?.company || "",
            website: githubProfile?.blog || "",
            linkedin_url: user?.user_metadata?.linkedin_url || "",
            twitter_url: user?.user_metadata?.twitter_url || "",
            tech_stack: [],
          });
        }
      };
      fetchProfileData();
    }
  }, [
    isOpen,
    githubProfile,
    user?.id,
    user?.user_metadata?.college,
    user?.user_metadata?.linkedin_url,
    user?.user_metadata?.twitter_url,
  ]);

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
      const rawLinkedIn = formData.linkedin_url.trim();
      const rawTwitter = formData.twitter_url.trim();

      const normalizedLinkedIn = rawLinkedIn ? normalizeLinkedInUrl(rawLinkedIn) : null;
      if (rawLinkedIn && !normalizedLinkedIn) {
        throw new Error(
          "Please enter a valid LinkedIn URL or username (e.g., https://linkedin.com/in/yourname)."
        );
      }

      const normalizedTwitter = rawTwitter ? normalizeTwitterUrl(rawTwitter) : null;
      if (rawTwitter && !normalizedTwitter) {
        throw new Error(
          "Please enter a valid X (Twitter) URL or @handle (e.g., https://x.com/yourhandle)."
        );
      }

      const ghLogin =
        githubProfile?.login ||
        user?.user_metadata?.user_name ||
        user?.user_metadata?.preferred_username ||
        undefined;

      const payload = {
        id: user.id,
        name: formData.name,
        bio: formData.bio,
        college: formData.college,
        location: formData.location,
        company: formData.company,
        website: formData.website,
        linkedin_url: normalizedLinkedIn,
        twitter_url: normalizedTwitter,
        tech_stack: formData.tech_stack,
        ...(ghLogin ? { github_username: ghLogin } : {}),
        ...(githubProfile?.avatar_url ? { github_avatar_url: githubProfile.avatar_url } : {}),
        updated_at: new Date().toISOString(),
      };

      let { error: updateError } = await supabase.from("profiles").upsert(payload, {
        onConflict: "id",
      });

      // Pre-migration fallback if linkedin_url / twitter_url / college columns do not exist yet
      if (updateError && isMissingColumnError(updateError)) {
        await supabase.auth
          .updateUser({
            data: {
              linkedin_url: normalizedLinkedIn || "",
              twitter_url: normalizedTwitter || "",
              college: formData.college || "",
            },
          })
          .catch(() => {});

        const retryPayload = { ...payload };
        delete retryPayload.linkedin_url;
        delete retryPayload.twitter_url;

        let retry = await supabase.from("profiles").upsert(retryPayload, {
          onConflict: "id",
        });

        if (retry.error && isMissingColumnError(retry.error)) {
          delete retryPayload.college;
          retry = await supabase.from("profiles").upsert(retryPayload, {
            onConflict: "id",
          });
        }

        updateError = retry.error;
      }

      if (updateError) throw updateError;

      const savedData = {
        ...formData,
        linkedin_url: normalizedLinkedIn || "",
        twitter_url: normalizedTwitter || "",
      };
      setFormData(savedData);
      setSuccess(true);

      if (onSave) {
        onSave(savedData);
      }

      setTimeout(() => {
        onClose();
        setSuccess(false);
      }, 900);
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
            className="p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors cursor-pointer"
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
              id="profile-tech-stack"
              value={formData.tech_stack}
              onChange={(newStack) =>
                setFormData({ ...formData, tech_stack: newStack })
              }
            />

            {/* Optional Social Profiles */}
            <div className="pt-2 border-t border-[#22242A] space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider">
                  Social Profiles
                </span>
                <span className="text-[11px] font-mono text-[#8C929C]">Optional</span>
              </div>

              <div>
                <label
                  htmlFor="edit-profile-linkedin"
                  className="flex items-center gap-2 text-xs font-medium text-[#F4F4F0] mb-1.5"
                >
                  <LinkedInOfficialLogo className="w-3.5 h-3.5 shrink-0" />
                  <span>LinkedIn</span>
                  <span className="text-[11px] text-[#8C929C] font-normal">(optional)</span>
                </label>
                <input
                  id="edit-profile-linkedin"
                  type="text"
                  name="linkedin_url"
                  value={formData.linkedin_url}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/yourprofile or username"
                  className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
                />
              </div>

              <div>
                <label
                  htmlFor="edit-profile-twitter"
                  className="flex items-center gap-2 text-xs font-medium text-[#F4F4F0] mb-1.5"
                >
                  <XTwitterOfficialLogo className="w-3.5 h-3.5 shrink-0" />
                  <span>X (Twitter)</span>
                  <span className="text-[11px] text-[#8C929C] font-normal">(optional)</span>
                </label>
                <input
                  id="edit-profile-twitter"
                  type="text"
                  name="twitter_url"
                  value={formData.twitter_url}
                  onChange={handleChange}
                  placeholder="https://x.com/yourhandle or @yourhandle"
                  className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] transition-colors text-xs"
                />
              </div>
            </div>

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
              className="flex-1 py-2.5 bg-[#141518] hover:bg-[#1C1E23] border border-[#2B2E36] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors cursor-pointer"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={saving || success}
              className="flex-1 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 cursor-pointer"
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
