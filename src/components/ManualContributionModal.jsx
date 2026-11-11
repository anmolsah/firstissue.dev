import React, { useState } from "react";
import { X, Plus, ExternalLink, AlertCircle, CheckCircle } from "lucide-react";

const ManualContributionModal = ({
  isOpen,
  onClose,
  onSubmit,
  editingContribution = null,
}) => {
  const [formData, setFormData] = useState({
    repository_name: editingContribution?.repository_name || "",
    contribution_link: editingContribution?.contribution_link || "",
    description: editingContribution?.description || "",
    status: editingContribution?.status || "planned",
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});

  const statusOptions = [
    {
      value: "planned",
      label: "Planned",
      icon: AlertCircle,
      color: "text-[#A8ADB6]",
    },
    {
      value: "in_progress",
      label: "In Progress",
      icon: Plus,
      color: "text-[#F59E0B]",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle,
      color: "text-[#34D399]",
    },
  ];

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch {
      return false;
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.repository_name.trim()) {
      newErrors.repository_name = "Repository name is required";
    } else if (!formData.repository_name.includes("/")) {
      newErrors.repository_name = "Please use format: owner/repository";
    }
    if (formData.contribution_link && !isValidUrl(formData.contribution_link)) {
      newErrors.contribution_link = "Please enter a valid URL";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    setLoading(true);
    try {
      await onSubmit(formData);
      handleClose();
    } catch (error) {
      console.error("Error submitting contribution:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleClose = () => {
    setFormData({
      repository_name: "",
      contribution_link: "",
      description: "",
      status: "planned",
    });
    setErrors({});
    onClose();
  };

  const handleChange = (field, value) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) setErrors((prev) => ({ ...prev, [field]: "" }));
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="manual-contribution-title"
    >
      <div className="bg-[#141518] rounded-[4px] shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[#2B2E36]">
        <div className="flex items-center justify-between p-5 border-b border-[#22242A]">
          <h2
            id="manual-contribution-title"
            className="text-sm font-semibold text-[#F4F4F0]"
          >
            {editingContribution
              ? "Edit Manual Contribution"
              : "Log Manual Contribution"}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label="Close modal"
            className="p-1.5 text-[#A8ADB6] hover:text-[#F4F4F0] hover:bg-[#1C1E23] rounded-[4px] transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-5">
          <div>
            <label
              htmlFor="manual-repo-name"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              Repository Slug *
            </label>
            <input
              id="manual-repo-name"
              type="text"
              value={formData.repository_name}
              onChange={(e) => handleChange("repository_name", e.target.value)}
              placeholder="e.g., facebook/react"
              className={`w-full px-3 py-2 bg-[#0B0C0E] border rounded-[4px] text-xs font-mono text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] ${
                errors.repository_name ? "border-[#F87171]" : "border-[#2B2E36]"
              }`}
            />
            {errors.repository_name && (
              <p className="text-[#F87171] text-xs mt-1">
                {errors.repository_name}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="manual-contrib-link"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              PR or Issue URL (Optional)
            </label>
            <div className="relative">
              <input
                id="manual-contrib-link"
                type="url"
                value={formData.contribution_link}
                onChange={(e) =>
                  handleChange("contribution_link", e.target.value)
                }
                placeholder="https://github.com/owner/repo/pull/123"
                className={`w-full px-3 py-2 pr-9 bg-[#0B0C0E] border rounded-[4px] text-xs font-mono text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] ${
                  errors.contribution_link ? "border-[#F87171]" : "border-[#2B2E36]"
                }`}
              />
              <ExternalLink className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-[#8C929C]" />
            </div>
            {errors.contribution_link && (
              <p className="text-[#F87171] text-xs mt-1">
                {errors.contribution_link}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="manual-description"
              className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-1.5"
            >
              Notes (Optional)
            </label>
            <textarea
              id="manual-description"
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Summary of the change or issue scope..."
              rows={3}
              className="w-full px-3 py-2 bg-[#0B0C0E] border border-[#2B2E36] rounded-[4px] text-xs text-[#F4F4F0] placeholder-[#8C929C] focus:outline-none focus:border-[#DAFA9C] resize-none"
              maxLength={200}
            />
            <p className="text-[#8C929C] text-xs font-mono tabular-nums mt-1">
              {formData.description.length}/200
            </p>
          </div>

          <div>
            <span className="block text-xs font-semibold text-[#A8ADB6] uppercase tracking-wider mb-2">
              Status *
            </span>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map(({ value, label, icon, color }) => {
                const Icon = icon;
                return (
                  <label
                    key={value}
                    className={`flex items-center p-3 border rounded-[4px] cursor-pointer transition-colors ${
                      formData.status === value
                        ? "border-[#DAFA9C] bg-[#1C1E23]"
                        : "border-[#2B2E36] bg-[#0B0C0E] hover:border-[#3A3E48]"
                    }`}
                  >
                    <input
                      type="radio"
                      name="status"
                      value={value}
                      checked={formData.status === value}
                      onChange={(e) => handleChange("status", e.target.value)}
                      className="sr-only"
                    />
                    <Icon className={`h-4 w-4 mr-2.5 ${color}`} />
                    <span className="text-xs font-medium text-[#F4F4F0]">
                      {label}
                    </span>
                  </label>
                );
              })}
            </div>
          </div>

          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2.5 bg-[#0B0C0E] border border-[#2B2E36] hover:border-[#3A3E48] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2.5 bg-[#DAFA9C] hover:bg-[#C7F275] text-[#0F0F0F] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-50"
            >
              {loading ? "Saving..." : editingContribution ? "Update" : "Save Entry"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualContributionModal;
