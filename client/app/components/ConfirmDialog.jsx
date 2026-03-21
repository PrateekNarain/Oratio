import React from "react";
import { MdClose } from 'react-icons/md';

export default function ConfirmDialog({ open, title, message, confirmText = "Yes", cancelText = "Cancel", onConfirm, onCancel }) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-2xl p-6 w-full max-w-xs relative border border-slate-200 dark:border-slate-700">
        <button
          className="absolute top-2 right-2 text-slate-400 hover:text-slate-700 dark:hover:text-white p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          onClick={onCancel}
        >
          <MdClose size={20} />
        </button>
        <h3 className="text-lg font-bold text-slate-800 dark:text-white mb-2">{title}</h3>
        <p className="text-slate-600 dark:text-slate-300 mb-6 text-sm">{message}</p>
        <div className="flex justify-end gap-2">
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all"
            onClick={onCancel}
            aria-label="Cancel deletion"
          >
            {cancelText}
          </button>
          <button
            type="button"
            className="px-4 py-2 rounded-lg bg-gradient-to-r from-[#FF6A3D] to-[#FF3D71] text-white font-semibold hover:opacity-90 transition-all focus:outline-none focus:ring-2 focus:ring-[#FF6A3D] focus:ring-offset-2"
            onClick={onConfirm}
            aria-label="Confirm deletion"
            tabIndex={0}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  );
}
