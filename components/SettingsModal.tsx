'use client';

import React, { useState } from 'react';
import {
  X,
  Sliders,
  Sun,
  Moon,
  Coffee,
  Monitor,
  Check,
  Type,
  AlignLeft,
  RotateCcw,
  Trash2,
} from 'lucide-react';
import { FontFamily, PageStyle, ThemeMode, UserPreferences, EditorWidth } from '@/types/note';
import { DEFAULT_PREFERENCES } from '@/lib/storage/preferences-repository';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onLivePreviewTheme?: (theme: ThemeMode) => void;
  onRevertLiveTheme?: () => void;
  onOpenResetAll?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  onUpdatePreferences,
  onLivePreviewTheme,
  onRevertLiveTheme,
  onOpenResetAll,
}) => {
  if (!isOpen) return null;

  return (
    <SettingsModalContent
      onClose={onClose}
      preferences={preferences}
      onUpdatePreferences={onUpdatePreferences}
      onLivePreviewTheme={onLivePreviewTheme}
      onRevertLiveTheme={onRevertLiveTheme}
      onOpenResetAll={onOpenResetAll}
    />
  );
};

interface SettingsModalContentProps {
  onClose: () => void;
  preferences: UserPreferences;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onLivePreviewTheme?: (theme: ThemeMode) => void;
  onRevertLiveTheme?: () => void;
  onOpenResetAll?: () => void;
}

const SettingsModalContent: React.FC<SettingsModalContentProps> = ({
  onClose,
  preferences,
  onUpdatePreferences,
  onLivePreviewTheme,
  onRevertLiveTheme,
  onOpenResetAll,
}) => {
  const [draft, setDraft] = useState<UserPreferences>(preferences);

  const handleSelectTheme = (theme: ThemeMode) => {
    setDraft((prev) => ({ ...prev, theme }));
    onLivePreviewTheme?.(theme);
  };

  const handleResetDefaults = () => {
    setDraft(DEFAULT_PREFERENCES);
    onLivePreviewTheme?.(DEFAULT_PREFERENCES.theme);
  };

  const handleCancel = () => {
    onRevertLiveTheme?.();
    onClose();
  };

  const handleSave = () => {
    onUpdatePreferences(draft);
    onClose();
  };

  const fontOptions: { id: FontFamily; label: string; preview: string; fontClass: string }[] = [
    { id: 'sans', label: 'System Sans', preview: 'Clean modern sans-serif', fontClass: 'font-sans-notepad' },
    { id: 'serif', label: 'Classic Serif', preview: 'Editorial book typography', fontClass: 'font-serif-notepad' },
    { id: 'mono', label: 'Monospace', preview: 'Code & tabular precision', fontClass: 'font-mono-notepad' },
    { id: 'literary', label: 'Literary', preview: 'Warm Palatino humanist', fontClass: 'font-literary-notepad' },
    { id: 'casual', label: 'Handwritten', preview: 'Casual notebook style', fontClass: 'font-casual-notepad' },
    { id: 'dyslexic', label: 'High Legibility', preview: 'Enhanced character distinction', fontClass: 'font-dyslexic-notepad' },
  ];

  const pageStyles: { id: PageStyle; label: string; desc: string }[] = [
    { id: 'blank', label: 'Blank', desc: 'Clean distraction-free paper' },
    { id: 'lined', label: 'Lined', desc: 'Soft ruled notebook lines' },
    { id: 'journal', label: 'Journal', desc: 'Ruled with red margin guide' },
    { id: 'dotted', label: 'Dotted', desc: 'Bullet journal dot matrix' },
    { id: 'grid', label: 'Grid', desc: 'Quadrille graph paper' },
    { id: 'graph', label: 'Graph Paper', desc: 'Technical engineering grid' },
  ];

  const widthOptions: { id: EditorWidth; label: string; desc: string }[] = [
    { id: 'narrow', label: 'Narrow', desc: '~65 characters' },
    { id: 'medium', label: 'Standard', desc: '~75 characters' },
    { id: 'wide', label: 'Wide', desc: '~95 characters' },
    { id: 'full', label: 'Full', desc: 'Full screen width' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-in fade-in duration-100">
      <div
        className="w-full max-w-xl rounded-2xl bg-paper-theme border border-subtle-theme shadow-2xl p-5 sm:p-6 text-primary-theme max-h-[90vh] flex flex-col"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
      >
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-subtle-theme shrink-0">
          <div className="flex items-center gap-2">
            <div className="p-1.5 rounded-lg bg-card-theme text-primary-theme">
              <Sliders className="w-4 h-4" />
            </div>
            <div>
              <h2 id="settings-title" className="text-base font-semibold">
                Writing Settings
              </h2>
              <p className="text-[11px] text-secondary-theme">
                Customize your theme, paper, and typography preferences
              </p>
            </div>
          </div>
          <button
            onClick={handleCancel}
            className="rounded-lg p-1.5 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="Close settings"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="mt-4 space-y-5 overflow-y-auto pr-1">
          {/* Theme Selector */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-xs font-semibold text-secondary-theme uppercase tracking-wider">
                Color Theme
              </label>
              <span className="text-[11px] text-secondary-theme">Live preview</span>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              <button
                type="button"
                onClick={() => handleSelectTheme('light')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  draft.theme === 'light'
                    ? 'border-selected-theme bg-card-selected-theme text-primary-theme font-semibold shadow-xs'
                    : 'border-subtle-theme text-secondary-theme hover:bg-card-theme'
                }`}
              >
                <Sun className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Light</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('dark')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  draft.theme === 'dark'
                    ? 'border-selected-theme bg-card-selected-theme text-primary-theme font-semibold shadow-xs'
                    : 'border-subtle-theme text-secondary-theme hover:bg-card-theme'
                }`}
              >
                <Moon className="w-4 h-4 text-indigo-400 shrink-0" />
                <span>Dark</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('sepia')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  draft.theme === 'sepia'
                    ? 'border-selected-theme bg-card-selected-theme text-primary-theme font-semibold shadow-xs'
                    : 'border-subtle-theme text-secondary-theme hover:bg-card-theme'
                }`}
              >
                <Coffee className="w-4 h-4 text-amber-700 dark:text-amber-500 shrink-0" />
                <span>Sepia</span>
              </button>

              <button
                type="button"
                onClick={() => handleSelectTheme('system')}
                className={`flex items-center gap-2 p-2.5 rounded-xl border text-xs font-medium transition ${
                  draft.theme === 'system'
                    ? 'border-selected-theme bg-card-selected-theme text-primary-theme font-semibold shadow-xs'
                    : 'border-subtle-theme text-secondary-theme hover:bg-card-theme'
                }`}
              >
                <Monitor className="w-4 h-4 text-stone-400 shrink-0" />
                <span>System</span>
              </button>
            </div>
          </div>

          {/* Paper Style */}
          <div>
            <label className="text-xs font-semibold text-secondary-theme uppercase tracking-wider block mb-2">
              Paper Style & Ruled Lines
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {pageStyles.map((style) => (
                <button
                  key={style.id}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, pageStyle: style.id }))}
                  className={`p-2.5 rounded-xl border text-left transition ${
                    draft.pageStyle === style.id
                      ? 'border-selected-theme bg-card-selected-theme text-primary-theme font-semibold shadow-xs'
                      : 'border-subtle-theme text-secondary-theme hover:bg-card-theme'
                  }`}
                >
                  <div className="text-xs font-medium text-primary-theme flex items-center justify-between">
                    <span>{style.label}</span>
                    {draft.pageStyle === style.id && <Check className="w-3.5 h-3.5 text-emerald-500" />}
                  </div>
                  <div className="text-[10px] text-secondary-theme mt-0.5">{style.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Typography & Spacing Controls: Font Family, Font Size, Line Height beside each other */}
          <div>
            <label className="text-xs font-semibold text-secondary-theme uppercase tracking-wider block mb-2">
              Typography & Spacing
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 p-3.5 rounded-xl border border-subtle-theme bg-card-theme">
              {/* Font Family Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-font-family" className="text-xs font-medium text-primary-theme flex items-center gap-1.5">
                  <Type className="w-3.5 h-3.5 text-secondary-theme" />
                  Font Family
                </label>
                <select
                  id="settings-font-family"
                  value={draft.fontFamily}
                  onChange={(e) => setDraft((prev) => ({ ...prev, fontFamily: e.target.value as FontFamily }))}
                  className="w-full bg-paper-theme border border-subtle-theme rounded-lg px-2.5 py-1.5 text-xs text-primary-theme font-medium focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer"
                >
                  {fontOptions.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.label} ({f.preview})
                    </option>
                  ))}
                </select>
              </div>

              {/* Font Size Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-font-size" className="text-xs font-medium text-primary-theme flex items-center gap-1.5">
                  <Type className="w-3 h-3 text-secondary-theme" />
                  Font Size
                </label>
                <select
                  id="settings-font-size"
                  value={draft.fontSize}
                  onChange={(e) => setDraft((prev) => ({ ...prev, fontSize: Number(e.target.value) }))}
                  className="w-full bg-paper-theme border border-subtle-theme rounded-lg px-2.5 py-1.5 text-xs text-primary-theme font-medium focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer font-mono"
                >
                  {[12, 13, 14, 15, 16, 17, 18, 20, 22, 24, 26, 28, 32].map((size) => (
                    <option key={size} value={size}>
                      {size}px {size === 15 ? '(Default)' : ''}
                    </option>
                  ))}
                </select>
              </div>

              {/* Line Height Select */}
              <div className="flex flex-col gap-1.5">
                <label htmlFor="settings-line-height" className="text-xs font-medium text-primary-theme flex items-center gap-1.5">
                  <AlignLeft className="w-3.5 h-3.5 text-secondary-theme" />
                  Line Height
                </label>
                <select
                  id="settings-line-height"
                  value={draft.lineHeight}
                  onChange={(e) => setDraft((prev) => ({ ...prev, lineHeight: Number(e.target.value) }))}
                  className="w-full bg-paper-theme border border-subtle-theme rounded-lg px-2.5 py-1.5 text-xs text-primary-theme font-medium focus:outline-none focus:ring-1 focus:ring-stone-400 cursor-pointer font-mono"
                >
                  <option value={1.3}>1.3x (Tight)</option>
                  <option value={1.4}>1.4x (Compact)</option>
                  <option value={1.5}>1.5x (Normal)</option>
                  <option value={1.6}>1.6x (Medium)</option>
                  <option value={1.7}>1.7x (Relaxed - Default)</option>
                  <option value={1.8}>1.8x (Open)</option>
                  <option value={2.0}>2.0x (Double)</option>
                  <option value={2.2}>2.2x (Spacious)</option>
                </select>
              </div>
            </div>
          </div>

          {/* Editor Width */}
          <div>
            <label className="text-xs font-semibold text-secondary-theme uppercase tracking-wider block mb-2">
              Writing Canvas Width
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
              {widthOptions.map((w) => (
                <button
                  key={w.id}
                  type="button"
                  onClick={() => setDraft((prev) => ({ ...prev, editorWidth: w.id }))}
                  className={`p-2 rounded-xl border text-center transition ${
                    draft.editorWidth === w.id
                      ? 'border-selected-theme bg-card-selected-theme text-primary-theme font-semibold shadow-xs'
                      : 'border-subtle-theme text-secondary-theme hover:bg-card-theme'
                  }`}
                >
                  <div className="text-xs text-primary-theme">{w.label}</div>
                  <div className="text-[10px] text-secondary-theme mt-0.5">{w.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Statistics Toggles */}
          <div>
            <label className="text-xs font-semibold text-secondary-theme uppercase tracking-wider block mb-2">
              Writing Statistics
            </label>
            <div className="space-y-2 border border-subtle-theme rounded-xl p-3 bg-card-theme">
              <label className="flex items-center justify-between cursor-pointer">
                <span className="text-xs font-medium text-primary-theme">
                  Show Word Count
                </span>
                <input
                  type="checkbox"
                  checked={draft.showWordCount}
                  onChange={(e) => setDraft((prev) => ({ ...prev, showWordCount: e.target.checked }))}
                  className="rounded border-subtle-theme accent-current cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-subtle-theme">
                <span className="text-xs font-medium text-primary-theme">
                  Show Character Count
                </span>
                <input
                  type="checkbox"
                  checked={draft.showCharacterCount}
                  onChange={(e) => setDraft((prev) => ({ ...prev, showCharacterCount: e.target.checked }))}
                  className="rounded border-subtle-theme accent-current cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-subtle-theme">
                <span className="text-xs font-medium text-primary-theme">
                  Show Line Count
                </span>
                <input
                  type="checkbox"
                  checked={draft.showLineCount ?? true}
                  onChange={(e) => setDraft((prev) => ({ ...prev, showLineCount: e.target.checked }))}
                  className="rounded border-subtle-theme accent-current cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-subtle-theme">
                <span className="text-xs font-medium text-primary-theme">
                  Show Reading Time Estimate
                </span>
                <input
                  type="checkbox"
                  checked={draft.showReadingTime}
                  onChange={(e) => setDraft((prev) => ({ ...prev, showReadingTime: e.target.checked }))}
                  className="rounded border-subtle-theme accent-current cursor-pointer"
                />
              </label>

              <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-subtle-theme">
                <span className="text-xs font-medium text-primary-theme">
                  Browser Spell Check
                </span>
                <input
                  type="checkbox"
                  checked={draft.spellCheck}
                  onChange={(e) => setDraft((prev) => ({ ...prev, spellCheck: e.target.checked }))}
                  className="rounded border-subtle-theme accent-current cursor-pointer"
                />
              </label>
            </div>

            {/* Danger Zone: Delete All History, Notes & Settings */}
            <div className="pt-4 border-t border-subtle-theme">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-red-600 dark:text-red-400 mb-2.5 flex items-center gap-1.5">
                <Trash2 className="w-3.5 h-3.5" />
                <span>Danger Zone / Data Reset</span>
              </h4>
              <div className="p-3.5 rounded-xl border border-red-200 dark:border-red-900/40 bg-red-50/50 dark:bg-red-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="text-xs space-y-0.5">
                  <p className="font-semibold text-red-800 dark:text-red-300">
                    Delete All History, Notes & Settings
                  </p>
                  <p className="text-stone-500 dark:text-stone-400 text-[11px] leading-relaxed">
                    Permanently wipes all saved notes in browser storage and restores original factory settings.
                  </p>
                </div>
                <button
                  type="button"
                  id="settings-delete-all-btn"
                  onClick={() => {
                    handleCancel();
                    onOpenResetAll?.();
                  }}
                  className="px-3 py-2 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold shrink-0 transition shadow-xs flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Data</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer with Reset to Defaults, Cancel & Save */}
        <div className="mt-5 pt-3 border-t border-subtle-theme flex items-center justify-between gap-2 shrink-0">
          <button
            type="button"
            onClick={handleResetDefaults}
            className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-theme border border-subtle-theme transition"
            title="Reset all settings to default (Blank paper, Light theme, 15px font)"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Defaults</span>
          </button>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleCancel}
              className="px-3.5 py-2 text-xs font-medium rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            >
              Cancel
            </button>
            <button
              id="save-settings-btn"
              type="button"
              onClick={handleSave}
              className="px-4 py-2 text-xs font-medium rounded-lg btn-primary-theme hover:opacity-90 transition font-semibold shadow-xs"
            >
              Save Settings
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
