'use client';

import React from 'react';
import { AlertOctagon, X, Trash2, Download } from 'lucide-react';

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
  React.useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
      role="dialog"
      aria-modal="true"
      aria-labelledby="reset-modal-title"
      aria-describedby="reset-modal-desc"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col my-auto transition-all animate-in zoom-in-95 duration-150 cursor-default shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-rose-50 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center shrink-0">
              <AlertOctagon className="w-4.5 h-4.5" />
            </div>
            <div>
              <h3 id="reset-modal-title" className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Delete All Notes & History?
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Factory reset all stored data
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div id="reset-modal-desc" className="rounded-xl bg-rose-50/70 dark:bg-rose-950/30 p-4 text-xs text-rose-900 dark:text-rose-200 space-y-2 leading-relaxed border border-rose-200/70 dark:border-rose-900/50">
            <p className="font-semibold text-rose-950 dark:text-white">
              This will permanently delete:
            </p>
            <ul className="list-disc pl-4 space-y-1">
              <li>All <span className="tabular-nums font-semibold">{notesCount}</span> {notesCount === 1 ? 'note' : 'notes'} and drafts</li>
              <li>All writing history and custom preferences</li>
            </ul>
          </div>

          {onDownloadBackup && notesCount > 0 && (
            <div className="flex items-center justify-between p-3.5 rounded-xl bg-slate-50 dark:bg-[#1A1F2C] border border-slate-200/80 dark:border-slate-800 text-xs">
              <span className="text-slate-700 dark:text-slate-200 font-medium">Save a backup first?</span>
              <button
                type="button"
                onClick={onDownloadBackup}
                className="px-3 py-1.5 rounded-lg bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 font-semibold text-xs text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
              >
                <Download className="w-3.5 h-3.5 text-indigo-500" />
                <span>Download Backup</span>
              </button>
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 flex items-center justify-end gap-2.5 bg-slate-50/70 dark:bg-[#10131B] border-t border-slate-200/70 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
          >
            Cancel
          </button>
          <button
            type="button"
            id="confirm-delete-all-btn"
            onClick={onConfirmReset}
            className="px-4 py-2 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer flex items-center gap-1.5 shadow-2xs"
          >
            <Trash2 className="w-3.5 h-3.5" />
            <span>Delete Everything</span>
          </button>
        </div>
      </div>
    </div>
  );
};
