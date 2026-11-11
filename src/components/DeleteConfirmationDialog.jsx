import React from "react";
import { X, Trash2, AlertTriangle } from "lucide-react";

const DeleteConfirmationDialog = ({
  isOpen,
  onClose,
  onConfirm,
  loading,
  title,
  message,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/75 flex items-center justify-center p-4 z-50"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-confirm-title"
    >
      <div className="bg-[#141518] rounded-[4px] shadow-2xl w-full max-w-md border border-[#2B2E36]">
        <div className="flex items-center justify-between p-5 border-b border-[#22242A]">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-[#F87171]" />
            <h2
              id="delete-confirm-title"
              className="text-xs font-bold font-mono tracking-wider uppercase text-[#F4F4F0]"
            >
              {title || "Confirm Delete"}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close confirmation dialog"
            className="p-1.5 hover:bg-[#1C1E23] text-[#A8ADB6] hover:text-[#F4F4F0] rounded-[4px] transition-colors"
            disabled={loading}
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="p-5">
          <p className="text-xs text-[#A8ADB6] mb-5 leading-relaxed">
            {message || "This action cannot be undone."}
          </p>

          <div className="flex gap-3">
            <button
              type="button"
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-2 border border-[#2B2E36] bg-[#0B0C0E] text-[#A8ADB6] hover:bg-[#1C1E23] hover:text-[#F4F4F0] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-40"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-[#F87171]/15 hover:bg-[#F87171]/25 border border-[#F87171]/40 text-[#F87171] rounded-[4px] text-xs font-semibold transition-colors disabled:opacity-40"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3.5 w-3.5 border border-[#F87171] border-t-transparent" />
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 w-3.5" />
                  <span>Delete</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteConfirmationDialog;
