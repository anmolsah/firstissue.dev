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
      color: "text-[#EEEEEE]/60",
    },
    {
      value: "in_progress",
      label: "In Progress",
      icon: Plus,
      color: "text-[#00ADB5]",
    },
    {
      value: "completed",
      label: "Completed",
      icon: CheckCircle,
      color: "text-emerald-400",
    },
  ];

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

  const isValidUrl = (string) => {
    try {
      new URL(string);
      return true;
    } catch (_) {
      return false;
    }
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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#393E46] rounded-2xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-[#EEEEEE]/10">
        <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE]/10">
          <h2 className="text-xl font-semibold text-[#EEEEEE]">
            {editingContribution
              ? "Edit Manual Contribution"
              : "Add Manual Contribution"}
          </h2>
          <button
            onClick={handleClose}
            className="p-2 hover:bg-[#222831] rounded-lg transition-colors"
          >
            <X className="h-5 w-5 text-[#EEEEEE]/60" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
              Repository Name *
            </label>
            <input
              type="text"
              value={formData.repository_name}
              onChange={(e) => handleChange("repository_name", e.target.value)}
              placeholder="e.g., facebook/react"
              className={`w-full px-3 py-2 bg-[#222831] border rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40 ${
                errors.repository_name
                  ? "border-red-400"
                  : "border-[#EEEEEE]/20"
              }`}
            />
            {errors.repository_name && (
              <p className="text-red-400 text-sm mt-1">
                {errors.repository_name}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
              Contribution Link (Optional)
            </label>
            <div className="relative">
              <input
                type="url"
                value={formData.contribution_link}
                onChange={(e) =>
                  handleChange("contribution_link", e.target.value)
                }
                placeholder="https://github.com/owner/repo/pull/123"
                className={`w-full px-3 py-2 pr-10 bg-[#222831] border rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40 ${
                  errors.contribution_link
                    ? "border-red-400"
                    : "border-[#EEEEEE]/20"
                }`}
              />
              <ExternalLink className="absolute right-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-[#EEEEEE]/40" />
            </div>
            {errors.contribution_link && (
              <p className="text-red-400 text-sm mt-1">
                {errors.contribution_link}
              </p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
              Description (Optional)
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => handleChange("description", e.target.value)}
              placeholder="Brief summary..."
              rows={3}
              className="w-full px-3 py-2 bg-[#222831] border border-[#EEEEEE]/20 rounded-lg text-[#EEEEEE] placeholder-[#EEEEEE]/40 resize-none"
              maxLength={200}
            />
            <p className="text-[#EEEEEE]/50 text-xs mt-1">
              {formData.description.length}/200
            </p>
          </div>
          <div>
            <label className="block text-sm font-medium text-[#EEEEEE] mb-2">
              Status *
            </label>
            <div className="grid grid-cols-1 gap-2">
              {statusOptions.map(({ value, label, icon: Icon, color }) => (
                <label
                  key={value}
                  className={`flex items-center p-3 border rounded-lg cursor-pointer transition-all ${
                    formData.status === value
                      ? "border-[#00ADB5] bg-[#00ADB5]/10"
                      : "border-[#EEEEEE]/20 hover:border-[#EEEEEE]/40"
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
                  <Icon className={`h-5 w-5 mr-3 ${color}`} />
                  <span className="font-medium text-[#EEEEEE]">{label}</span>
                </label>
              ))}
            </div>
          </div>
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={handleClose}
              className="flex-1 px-4 py-2 border border-[#EEEEEE]/20 text-[#EEEEEE] rounded-lg hover:bg-[#222831] transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-[#00ADB5] text-[#222831] rounded-lg font-medium hover:bg-[#00d4de] transition-all disabled:opacity-50"
            >
              {loading ? "Saving..." : editingContribution ? "Update" : "Add"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ManualContributionModal;
