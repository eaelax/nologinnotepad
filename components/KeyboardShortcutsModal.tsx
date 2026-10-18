'use client';

import React from 'react';
import { Command, X } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  React.useEffect(() => {
    if (!isOpen) return;
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + N`, desc: 'Create new note' },
    { key: `${modKey} + S`, desc: 'Download note (.txt)' },
    { key: `${modKey} + Shift + C`, desc: 'Copy note text' },
    { key: `${modKey} + B`, desc: 'Bold formatting' },
    { key: `${modKey} + I`, desc: 'Italic formatting' },
    { key: `${modKey} + U`, desc: 'Underline formatting' },
    { key: 'Tab', desc: 'Indent text' },
    { key: 'F11', desc: 'Toggle full screen' },
    { key: 'Esc', desc: 'Close dialogs' },
  ];

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[460px] rounded-2xl bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col my-auto cursor-default transition-all animate-in zoom-in-95 duration-150 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Command className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 id="shortcuts-title" className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Keyboard Shortcuts
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Speed up your writing workflow
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

        <div className="p-6 space-y-2 max-h-[60vh] overflow-y-auto no-scrollbar">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs py-2.5 px-3.5 rounded-xl bg-slate-50/80 dark:bg-[#1A1F2C] border border-slate-200/70 dark:border-slate-800/80"
            >
              <span className="font-medium text-slate-700 dark:text-slate-200">{sc.desc}</span>
              <kbd className="px-2.5 py-1 rounded-md bg-white dark:bg-[#11141C] text-[11px] font-mono text-slate-800 dark:text-slate-200 font-semibold border border-slate-200 dark:border-slate-700 shadow-2xs">
                {sc.key}
              </kbd>
            </div>
          ))}
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
