'use client';

import React from 'react';
import { X, ShieldCheck, Database, Lock } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  notesCount: number;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, notesCount }) => {
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
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[540px] rounded-2xl bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col my-auto cursor-default transition-all animate-in zoom-in-95 duration-150 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0">
              <ShieldCheck className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 id="privacy-title" className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Privacy & Data Architecture
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Local-first, zero-telemetry browser workspace
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

        <div className="p-6 space-y-3.5 max-h-[65vh] overflow-y-auto no-scrollbar">
          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1A1F2C] border border-slate-200/70 dark:border-slate-800 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Database className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Where are your notes stored?
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                All of your notes (<span className="tabular-nums font-semibold">{notesCount}</span> currently saved) are stored directly inside your browser using <strong>IndexedDB</strong>, an asynchronous persistent browser database.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1A1F2C] border border-slate-200/70 dark:border-slate-800 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
              <Lock className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Zero telemetry & no external servers
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                We do not track you, use third-party analytics, or send your note content to any cloud server. Your notes never leave your personal computer, tablet, or phone.
              </p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50/80 dark:bg-[#1A1F2C] border border-slate-200/70 dark:border-slate-800 flex items-start gap-3.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-50 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400 flex items-center justify-center shrink-0 mt-0.5">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div>
              <p className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                Zero Logins, Accounts, or Passwords
              </p>
              <p className="mt-1 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                Start writing instantly. Because all data is held on your machine, no email or password is ever required.
              </p>
            </div>
          </div>
        </div>

        <div className="px-6 py-3.5 flex items-center justify-end bg-slate-50/70 dark:bg-[#10131B] border-t border-slate-200/70 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors shadow-2xs cursor-pointer"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
