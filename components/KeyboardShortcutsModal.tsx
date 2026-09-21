'use client';

import React from 'react';
import { X, Command } from 'lucide-react';

interface KeyboardShortcutsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const KeyboardShortcutsModal: React.FC<KeyboardShortcutsModalProps> = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const isMac = typeof window !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent);
  const modKey = isMac ? '⌘' : 'Ctrl';

  const shortcuts = [
    { key: `${modKey} + N`, desc: 'Create a new note' },
    { key: `${modKey} + S`, desc: 'Save changes immediately' },
    { key: `${modKey} + \\`, desc: 'Toggle notes list drawer' },
    { key: `${modKey} + B`, desc: 'Format selected text with bold (**text**)' },
    { key: `${modKey} + I`, desc: 'Format selected text with italic (*text*)' },
    { key: `${modKey} + K`, desc: 'Insert markdown link' },
    { key: 'Tab', desc: 'Indent text with 2 spaces' },
    { key: 'Esc', desc: 'Exit fullscreen or close dialogs' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-md rounded-2xl bg-paper-theme border border-subtle-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <div className="flex items-center justify-between border-b border-subtle-theme pb-4">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-card-theme text-primary-theme">
              <Command className="w-4 h-4" />
            </div>
            <h2 id="shortcuts-title" className="text-base font-semibold">
              Keyboard Shortcuts
            </h2>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="mt-4 space-y-2 max-h-[60vh] overflow-y-auto pr-1">
          {shortcuts.map((sc, i) => (
            <div
              key={i}
              className="flex items-center justify-between text-xs sm:text-sm py-2 border-b border-subtle-theme/50 last:border-0"
            >
              <span className="text-secondary-theme">{sc.desc}</span>
              <kbd className="px-2 py-1 rounded-md bg-card-theme border border-subtle-theme text-[11px] font-mono text-primary-theme font-semibold shadow-xs">
                {sc.key}
              </kbd>
            </div>
          ))}
        </div>

        <div className="mt-5 pt-3 border-t border-subtle-theme flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-subtle-theme text-primary-theme hover:bg-card-theme transition"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
};
