'use client';

import React from 'react';
import { AlertTriangle, X } from 'lucide-react';
import { Note } from '@/types/note';

interface DeleteConfirmModalProps {
  isOpen: boolean;
  note: Note | null;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal: React.FC<DeleteConfirmModalProps> = ({
  isOpen,
  note,
  onClose,
  onConfirm,
}) => {
  if (!isOpen || !note) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-sm rounded-2xl bg-paper-theme border border-subtle-theme shadow-2xl p-6 text-primary-theme"
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="delete-dialog-title"
        aria-describedby="delete-dialog-desc"
      >
        <div className="flex items-center justify-between pb-3">
          <div className="p-2 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="Cancel"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <h3 id="delete-dialog-title" className="text-base font-semibold mt-2">
          Delete this note?
        </h3>
        <p id="delete-dialog-desc" className="mt-2 text-xs sm:text-sm text-secondary-theme leading-relaxed">
          Are you sure you want to delete <strong className="text-primary-theme">&ldquo;{note.title || 'Untitled Note 1'}&rdquo;</strong>? This action cannot be undone.
        </p>

        <div className="mt-6 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={onClose}
            className="px-3.5 py-2 text-xs font-medium rounded-lg border border-subtle-theme text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={onConfirm}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition shadow-xs"
          >
            Delete Note
          </button>
        </div>
      </div>
    </div>
  );
};
