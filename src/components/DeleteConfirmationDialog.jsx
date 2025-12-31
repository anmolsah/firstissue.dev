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
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-[#393E46] rounded-2xl shadow-2xl w-full max-w-md border border-[#EEEEEE]/10">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-[#EEEEEE]/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-red-500/20 rounded-full flex items-center justify-center">
              <AlertTriangle className="h-5 w-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-[#EEEEEE]">
              {title || "Confirm Delete"}
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-[#222831] rounded-lg transition-colors"
            disabled={loading}
          >
            <X className="h-5 w-5 text-[#EEEEEE]/60" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          <p className="text-[#EEEEEE]/70 mb-6">
            {message || "This action cannot be undone."}
          </p>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              disabled={loading}
              className="flex-1 px-4 py-2 border border-[#EEEEEE]/20 text-[#EEEEEE] rounded-lg hover:bg-[#222831] transition-colors font-medium disabled:opacity-50"
            >
              Not Now
            </button>
            <button
              onClick={onConfirm}
              disabled={loading}
              className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition-colors font-medium disabled:opacity-50"
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4" />
                  Delete
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
