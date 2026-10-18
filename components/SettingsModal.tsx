'use client';

import React, { useState, useEffect } from 'react';
import { FontFamily, PageStyle, EditorWidth, UserPreferences, LanguageCode } from '@/types/note';
import { DEFAULT_PREFERENCES } from '@/lib/storage/preferences-repository';
import { TRANSLATIONS, Translations } from '@/lib/i18n/translations';
import { FONT_OPTIONS } from '@/components/Editor';
import {
  X,
  ChevronDown,
  RotateCcw,
  Sliders,
  Type,
  ShieldAlert,
  Check,
  AlertTriangle,
} from 'lucide-react';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  preferences: UserPreferences;
  currentLang?: LanguageCode;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onOpenResetAll?: () => void;
}

export const SettingsModal: React.FC<SettingsModalProps> = ({
  isOpen,
  onClose,
  preferences,
  currentLang = 'EN',
  onUpdatePreferences,
  onOpenResetAll,
}) => {
  if (!isOpen) return null;

  return (
    <SettingsModalContent
      key={`${preferences.theme}_${preferences.fontFamily}_${preferences.fontSize}_${preferences.pageStyle}_${preferences.editorWidth}`}
      onClose={onClose}
      preferences={preferences}
      currentLang={currentLang}
      onUpdatePreferences={onUpdatePreferences}
      onOpenResetAll={onOpenResetAll}
    />
  );
};

interface SettingsModalContentProps {
  onClose: () => void;
  preferences: UserPreferences;
  currentLang?: LanguageCode;
  onUpdatePreferences: (updates: Partial<UserPreferences>) => void;
  onOpenResetAll?: () => void;
}

const SettingsModalContent: React.FC<SettingsModalContentProps> = ({
  onClose,
  preferences,
  currentLang = 'EN',
  onUpdatePreferences,
  onOpenResetAll,
}) => {
  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const lang = currentLang || preferences.language || 'EN';
  const t: Translations = TRANSLATIONS[lang] || TRANSLATIONS.EN;
  const isRtl = lang === 'AR';

  const [initialPrefs] = useState<UserPreferences>(() => ({ ...preferences }));
  const [draft, setDraft] = useState<UserPreferences>(() => ({ ...preferences }));
  const [showUnsavedPrompt, setShowUnsavedPrompt] = useState(false);

  const isDirty =
    draft.fontFamily !== initialPrefs.fontFamily ||
    draft.fontSize !== initialPrefs.fontSize ||
    draft.lineHeight !== initialPrefs.lineHeight ||
    draft.pageStyle !== initialPrefs.pageStyle ||
    draft.editorWidth !== initialPrefs.editorWidth;

  const handleRequestClose = () => {
    if (isDirty) {
      setShowUnsavedPrompt(true);
    } else {
      onClose();
    }
  };

  const handleSave = () => {
    onUpdatePreferences(draft);
    onClose();
  };

  const handleSaveAndExit = () => {
    onUpdatePreferences(draft);
    setShowUnsavedPrompt(false);
    onClose();
  };

  const handleDiscardAndExit = () => {
    setShowUnsavedPrompt(false);
    onClose();
  };

  const pageStyles: { id: PageStyle; label: string; shortLabel: string }[] = [
    { id: 'blank', label: 'Blank Paper', shortLabel: 'Blank' },
    { id: 'lined', label: 'Lined Paper', shortLabel: 'Lined' },
    { id: 'college', label: 'College Lined Paper', shortLabel: 'College' },
    { id: 'grid', label: 'Grid Paper', shortLabel: 'Grid' },
    { id: 'dotted', label: 'Dotted Paper', shortLabel: 'Dotted' },
  ];

  const renderPaperThumbnail = (styleId: PageStyle) => {
    switch (styleId) {
      case 'blank':
        return (
          <div className="w-full h-11 rounded-lg bg-white dark:bg-[#11141C] border border-slate-200 dark:border-slate-700 flex items-center justify-center overflow-hidden relative">
            <div className="w-7 h-0.5 rounded-full bg-slate-200 dark:bg-slate-700" />
          </div>
        );
      case 'lined':
        return (
          <div className="w-full h-11 rounded-lg bg-white dark:bg-[#11141C] border border-slate-200 dark:border-slate-700 p-2 flex flex-col justify-between overflow-hidden">
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
          </div>
        );
      case 'college':
        return (
          <div className="w-full h-11 rounded-lg bg-white dark:bg-[#11141C] border border-slate-200 dark:border-slate-700 p-2 flex flex-col justify-between relative overflow-hidden">
            <div className="absolute left-3 top-0 bottom-0 w-px bg-rose-400/80 z-10" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
            <div className="w-full h-px bg-slate-300 dark:bg-slate-600" />
          </div>
        );
      case 'grid':
        return (
          <div className="w-full h-11 rounded-lg bg-white dark:bg-[#11141C] border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            <svg className="w-full h-full" width="100%" height="100%">
              <defs>
                <pattern id="settings-grid-pattern-hd" width="8" height="8" patternUnits="userSpaceOnUse">
                  <path d="M 8 0 L 0 0 0 8" fill="none" stroke="currentColor" strokeWidth="0.8" className="text-slate-300 dark:text-slate-600" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#settings-grid-pattern-hd)" />
            </svg>
          </div>
        );
      case 'dotted':
        return (
          <div className="w-full h-11 rounded-lg bg-white dark:bg-[#11141C] border border-slate-200 dark:border-slate-700 overflow-hidden relative">
            <svg className="w-full h-full" width="100%" height="100%">
              <defs>
                <pattern id="settings-dot-pattern-hd" width="8" height="8" patternUnits="userSpaceOnUse">
                  <circle cx="4" cy="4" r="1" fill="currentColor" className="text-slate-400 dark:text-slate-500" />
                </pattern>
              </defs>
              <rect width="100%" height="100%" fill="url(#settings-dot-pattern-hd)" />
            </svg>
          </div>
        );
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-3 sm:p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-150"
      dir={isRtl ? 'rtl' : 'ltr'}
      onClick={handleRequestClose}
      aria-hidden="true"
    >
      <div
        className="w-full max-w-full sm:max-w-[660px] rounded-2xl bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col my-auto transition-all animate-in zoom-in-95 duration-150 relative shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="settings-title"
        onClick={(e) => e.stopPropagation()}
      >
          <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
                <Sliders className="w-4.5 h-4.5" />
              </div>
              <div>
                <h2
                  id="settings-title"
                  className="text-base font-bold tracking-tight text-slate-900 dark:text-white leading-snug"
                >
                  {t.settingsTitle || 'Writing & Editor Settings'}
                </h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Customize stationery paper, typography, and canvas width
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={handleRequestClose}
              className="modal-close-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
              aria-label={t.close || 'Close'}
              title={t.close || 'Close'}
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <div className="p-6 space-y-5 max-h-[75vh] overflow-y-auto no-scrollbar">
            {/* Section 1: Notepad Stationery Styles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  {t.paperStyleSection || 'Stationery Paper Style'}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Select canvas ruling
                </span>
              </div>

              <div className="grid grid-cols-5 gap-2.5 w-full">
                {pageStyles.map((style) => {
                  const isSelected = draft.pageStyle === style.id;
                  return (
                    <button
                      key={style.id}
                      type="button"
                      onClick={() => {
                        setDraft((prev) => ({ ...prev, pageStyle: style.id }));
                      }}
                      className={`relative p-2.5 rounded-xl flex flex-col items-center gap-2 transition-all cursor-pointer text-center border ${
                        isSelected
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/40 border-indigo-600 dark:border-indigo-400 ring-1 ring-indigo-600/20 dark:ring-indigo-400/20'
                          : 'bg-slate-50/60 dark:bg-[#1A1F2C] hover:bg-slate-100/80 dark:hover:bg-[#222838] border-slate-200/80 dark:border-slate-800'
                      }`}
                      title={style.label}
                    >
                      {isSelected && (
                        <div className="absolute top-1.5 right-1.5 w-4 h-4 rounded-full bg-indigo-600 text-white flex items-center justify-center z-10 shadow-2xs">
                          <Check className="w-2.5 h-2.5 stroke-[3]" />
                        </div>
                      )}

                      <div className="w-full">{renderPaperThumbnail(style.id)}</div>

                      <span
                        className={`text-xs font-semibold leading-tight truncate w-full ${
                          isSelected
                            ? 'text-indigo-700 dark:text-indigo-300'
                            : 'text-slate-700 dark:text-slate-300'
                        }`}
                      >
                        {style.shortLabel}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Section 2: Typography & Line Height */}
            <div className="pt-4 border-t border-slate-200/70 dark:border-slate-800/80 space-y-3">
              <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-slate-200">
                <Type className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
                <span>{t.typographySection || 'Typography & Spacing'}</span>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 w-full">
                <div className="space-y-1.5">
                  <label htmlFor="settings-font-family" className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                    {t.fontFamily || 'Font Family'}
                  </label>
                  <div className="relative rounded-xl bg-slate-50 dark:bg-[#1A1F2C] border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/60 transition-colors">
                    <select
                      id="settings-font-family"
                      value={draft.fontFamily}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, fontFamily: e.target.value as FontFamily }))
                      }
                      className="w-full appearance-none bg-transparent text-xs font-semibold text-slate-900 dark:text-white py-2.5 pl-3 pr-8 focus:outline-none cursor-pointer"
                    >
                      {FONT_OPTIONS.map((f) => (
                        <option
                          key={f.value}
                          value={f.value}
                          className="bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100"
                        >
                          {f.label}
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-font-size" className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                    {t.fontSize || 'Font Size'}
                  </label>
                  <div className="relative rounded-xl bg-slate-50 dark:bg-[#1A1F2C] border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/60 transition-colors">
                    <select
                      id="settings-font-size"
                      value={draft.fontSize}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, fontSize: Number(e.target.value) }))
                      }
                      className="w-full appearance-none bg-transparent text-xs font-semibold text-slate-900 dark:text-white py-2.5 pl-3 pr-8 focus:outline-none cursor-pointer tabular-nums"
                    >
                      {[12, 14, 16, 18, 20, 24].map((size) => (
                        <option
                          key={size}
                          value={size}
                          className="bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100"
                        >
                          {size}px
                        </option>
                      ))}
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label htmlFor="settings-line-height" className="text-xs font-medium text-slate-600 dark:text-slate-400 block">
                    {t.lineSpacing || 'Line Spacing'}
                  </label>
                  <div className="relative rounded-xl bg-slate-50 dark:bg-[#1A1F2C] border border-slate-200 dark:border-slate-700/80 hover:border-indigo-500/60 transition-colors">
                    <select
                      id="settings-line-height"
                      value={draft.lineHeight}
                      onChange={(e) =>
                        setDraft((prev) => ({ ...prev, lineHeight: Number(e.target.value) }))
                      }
                      className="w-full appearance-none bg-transparent text-xs font-semibold text-slate-900 dark:text-white py-2.5 pl-3 pr-8 focus:outline-none cursor-pointer"
                    >
                      <option value={1.3} className="bg-white dark:bg-[#141822]">1.3x (Compact)</option>
                      <option value={1.5} className="bg-white dark:bg-[#141822]">1.5x (Normal)</option>
                      <option value={1.7} className="bg-white dark:bg-[#141822]">1.7x (Spacious)</option>
                      <option value={2.0} className="bg-white dark:bg-[#141822]">2.0x (Double)</option>
                    </select>
                    <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>
            </div>

            {/* Section 4: Danger Zone */}
            {onOpenResetAll && (
              <div className="rounded-xl bg-rose-50/60 dark:bg-rose-950/25 border border-rose-200/70 dark:border-rose-900/50 p-4 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-rose-100 dark:bg-rose-900/50 text-rose-600 dark:text-rose-300 flex items-center justify-center shrink-0">
                    <ShieldAlert className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-rose-950 dark:text-rose-100">
                      {t.deleteAllNotes || 'Delete All Notes & Settings'}
                    </div>
                    <div className="text-[11px] text-rose-700/80 dark:text-rose-300/80">
                      Permanently wipe all local IndexedDB notes and preferences
                    </div>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    onOpenResetAll();
                  }}
                  className="px-3.5 py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0"
                >
                  Reset All
                </button>
              </div>
            )}
          </div>

          <div className="px-6 py-3.5 flex items-center justify-between bg-slate-50/70 dark:bg-[#10131B] border-t border-slate-200/70 dark:border-slate-800/80">
            <button
              type="button"
              onClick={() => setDraft(DEFAULT_PREFERENCES)}
              className="text-xs font-semibold text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{t.resetDefaults || 'Reset to Defaults'}</span>
            </button>

            <div className="flex items-center gap-2.5">
              <button
                type="button"
                onClick={handleRequestClose}
                className="px-4 py-2 text-xs font-semibold rounded-lg bg-white hover:bg-slate-100 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 transition-colors cursor-pointer"
              >
                {t.cancel || 'Cancel'}
              </button>
              <button
                id="save-settings-btn"
                type="button"
                onClick={handleSave}
                className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white shadow-2xs transition-colors cursor-pointer"
              >
                {t.savePreferences || 'Save Settings'}
              </button>
            </div>
          </div>

          {showUnsavedPrompt && (
            <div
              className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 animate-in fade-in duration-100"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#181C26] p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-center animate-in zoom-in-95 duration-100">
                <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                  <AlertTriangle className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                    Unsaved Changes
                  </h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                    You have unsaved changes. Do you want to save them before leaving?
                  </p>
                </div>
                <div className="flex flex-col gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleSaveAndExit}
                    className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
                  >
                    Save Changes
                  </button>
                  <button
                    type="button"
                    onClick={handleDiscardAndExit}
                    className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-rose-600 hover:bg-rose-700 text-white transition-colors cursor-pointer"
                  >
                    Discard
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowUnsavedPrompt(false)}
                    className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
  );
};
