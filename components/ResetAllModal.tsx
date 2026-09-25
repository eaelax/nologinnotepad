'use client';

import React from 'react';
import { AlertTriangle, Trash2, Download, X, RotateCcw } from 'lucide-react';

interface ResetAllModalProps {
  isOpen: boolean;
  notesCount: number;
  onClose: () => void;
  onConfirmReset: () => void;
  onDownloadBackup?: () => void;
}

export const ResetAllModal: React.FC<ResetAllModalProps> = ({
  isOpen,
  notesCount,
  onClose,
  onConfirmReset,
  onDownloadBackup,
}) => {
  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 animate-in fade-in duration-150"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      aria-describedby="reset-modal-desc"
    >
      <div className="w-full max-w-md rounded-2xl bg-paper-theme border border-subtle-theme shadow-2xl p-5 sm:p-6 text-primary-theme flex flex-col gap-4 animate-in zoom-in-95 duration-150">
        {/* Header with Danger Badge */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-red-500/10 text-red-600 dark:text-red-400 shrink-0">
              <Trash2 className="w-5 h-5" />
            </div>
            <div>
              <h3 id="reset-modal-title" className="text-base font-bold text-primary-theme">
                Delete All History & Notes?
              </h3>
              <p className="text-xs text-secondary-theme">
                Permanent factory reset of browser data
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="Close dialog"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Description & List of what gets cleared */}
        <div id="reset-modal-desc" className="text-xs sm:text-sm text-secondary-theme space-y-2.5 leading-relaxed bg-card-theme/60 p-3.5 rounded-xl border border-subtle-theme">
          <p className="text-primary-theme font-medium">
            This action will permanently erase:
          </p>
          <ul className="list-disc pl-4 space-y-1 text-xs text-secondary-theme">
            <li>
              <strong>All {notesCount} {notesCount === 1 ? 'note' : 'notes'}</strong> and drafts in your local IndexedDB storage
            </li>
            <li>All tab sessions, writing histories, and autosave cache</li>
            <li>All custom preferences (themes, fonts, page paper styles, widths)</li>
          </ul>
          <p className="text-[11px] text-red-600 dark:text-red-400 font-medium pt-1">
            ⚠️ This action is client-side only and cannot be recovered unless you export a backup.
          </p>
        </div>

        {/* Optional Backup Button */}
        {onDownloadBackup && notesCount > 0 && (
          <div className="flex items-center justify-between p-3 rounded-xl bg-card-theme border border-subtle-theme text-xs">
            <div className="flex items-center gap-2">
              <Download className="w-4 h-4 text-emerald-500 shrink-0" />
              <span className="text-secondary-theme">Save your notes before deleting:</span>
            </div>
            <button
              type="button"
              onClick={onDownloadBackup}
              className="px-3 py-1.5 rounded-lg bg-paper-theme border border-subtle-theme hover:bg-card-selected-theme font-medium text-xs text-primary-theme transition flex items-center gap-1.5 shrink-0 shadow-xs"
            >
              <span>Download Backup</span>
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5 pt-2 border-t border-subtle-theme">
          <button
            type="button"
            onClick={onClose}
            className="w-full sm:w-auto px-4 py-2 text-xs font-medium rounded-lg border border-subtle-theme text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
          >
            Keep My Notes
          </button>
          <button
            type="button"
            id="confirm-delete-all-btn"
            onClick={onConfirmReset}
            className="w-full sm:w-auto px-4 py-2 text-xs font-semibold rounded-lg bg-red-600 hover:bg-red-700 text-white transition flex items-center justify-center gap-1.5 shadow-xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Everything & Reset</span>
          </button>
        </div>
      </div>
    </div>
  );
};
