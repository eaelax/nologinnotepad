'use client';

import React from 'react';
import { X, ShieldCheck, Database, Lock } from 'lucide-react';

interface PrivacyModalProps {
  isOpen: boolean;
  onClose: () => void;
  notesCount: number;
}

export const PrivacyModal: React.FC<PrivacyModalProps> = ({ isOpen, onClose, notesCount }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-lg rounded-2xl bg-paper-theme border border-subtle-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
      >
        <div className="flex items-center justify-between border-b border-subtle-theme pb-4">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h2 id="privacy-title" className="text-base font-semibold">
                Privacy & Data Architecture
              </h2>
              <p className="text-xs text-secondary-theme">
                NoLoginNotepad — Local-first, zero-telemetry notepad
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-3.5 text-xs sm:text-sm text-secondary-theme max-h-[65vh] overflow-y-auto pr-1">
          <div className="p-3.5 rounded-xl bg-card-theme border border-subtle-theme flex items-start gap-3">
            <Database className="w-4 h-4 text-primary-theme mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-primary-theme">
                Where are your notes stored?
              </p>
              <p className="mt-1 text-xs text-secondary-theme leading-relaxed">
                All of your notes ({notesCount} currently saved) are stored directly inside your browser using <strong>IndexedDB</strong>, an asynchronous persistent browser database.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card-theme border border-subtle-theme flex items-start gap-3">
            <Lock className="w-4 h-4 text-primary-theme mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-primary-theme">
                Zero telemetry & no external servers
              </p>
              <p className="mt-1 text-xs text-secondary-theme leading-relaxed">
                We do not track you, use third-party analytics, or send your note content to any cloud server. Your notes never leave your personal computer, tablet, or phone.
              </p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-card-theme border border-subtle-theme flex items-start gap-3">
            <ShieldCheck className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
            <div>
              <p className="font-medium text-primary-theme">
                Zero Logins, Accounts, or Passwords
              </p>
              <p className="mt-1 text-xs text-secondary-theme leading-relaxed">
                Start writing instantly. Because all data is held on your machine, no email or password is ever required.
              </p>
            </div>
          </div>
        </div>

        <div className="mt-5 pt-3 border-t border-subtle-theme flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-subtle-theme text-primary-theme hover:bg-card-theme transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
