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
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-zinc-950 rounded-lg shadow-2xl w-full max-w-md border border-zinc-800">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-zinc-800/60">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="h-4 w-4 text-red-500" />
            <h2 className="text-xs font-bold font-mono tracking-wider uppercase text-white">
              {title || "Confirm Delete"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1 hover:bg-zinc-900 rounded transition-all"
            disabled={loading}
          >
            <X className="h-4 w-4 text-zinc-400 hover:text-white" />
          </button>
        </div>

        {/* Content */}
        <div className="p-5">
          <p className="text-xs text-zinc-400 mb-5 leading-relaxed">
            {message || "This action cannot be undone."}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-3 py-1.5 border border-zinc-800 bg-transparent text-zinc-350 hover:bg-zinc-900 hover:text-white rounded text-xs font-semibold transition-all disabled:opacity-30"
            >
              Cancel
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-1.5 px-3 py-1.5 bg-red-950/20 hover:bg-red-950/40 border border-red-900/40 text-red-400 rounded text-xs font-semibold transition-all disabled:opacity-30"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-3 w-3 border border-red-400 border-t-transparent"></div>
                  <span>Deleting...</span>
                </>
              ) : (
                <>
                  <Trash2 className="h-3.5 h-3.5" />
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
