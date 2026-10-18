'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Plus,
  X,
  Globe,
  Settings,
  MoreVertical,
  Download,
  Upload,
  HelpCircle,
  Shield,
  Trash2,
  Check,
  Sun,
  Moon,
} from 'lucide-react';
import { Note, LanguageCode, ThemeMode } from '@/types/note';
import { TRANSLATIONS, LANGUAGE_OPTIONS, Translations } from '@/lib/i18n/translations';
import { AppLogo } from './AppLogo';
import { PWAInstallButton } from './PWAInstallButton';

interface NotepadTabsRowProps {
  note: Note | null;
  notes: Note[];
  activeNoteId: string | null;
  currentLang?: LanguageCode;
  currentTheme?: ThemeMode;
  onSelectNote: (id: string) => void;
  onCloseNote: (note: Note) => void;
  onCreateNewNote: () => void;
  onUpdateTitle: (title: string) => void;
  onDeleteNote: () => void;
  onExportFile?: () => void;
  onImportFile?: (content: string, filename?: string) => void;
  onToggleTheme?: () => void;
  onSelectLanguage?: (lang: LanguageCode) => void;
  onOpenSettings?: () => void;
  onOpenExportImport: (tab?: 'export' | 'import') => void;
  onOpenShortcuts: () => void;
  onOpenPrivacy?: () => void;
  onOpenResetAll?: () => void;
  isSettingsOpen?: boolean;
}

export const NotepadTabsRow: React.FC<NotepadTabsRowProps> = ({
  note,
  notes,
  activeNoteId,
  currentLang = 'EN',
  currentTheme = 'light',
  onSelectNote,
  onCloseNote,
  onCreateNewNote,
  onUpdateTitle,
  onDeleteNote,
  onExportFile,
  onImportFile,
  onToggleTheme,
  onSelectLanguage,
  onOpenSettings,
  onOpenExportImport,
  onOpenShortcuts,
  onOpenPrivacy,
  onOpenResetAll,
}) => {
  const t: Translations = TRANSLATIONS[currentLang] || TRANSLATIONS.EN;
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(note?.title || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isLangOpen, setIsLangOpen] = useState(false);

  const menuRef = useRef<HTMLDivElement>(null);
  const langMenuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const prevNoteIdRef = useRef(note?.id);

  if (prevNoteIdRef.current !== note?.id) {
    prevNoteIdRef.current = note?.id;
    setTempTitle(note?.title || '');
    setIsEditingTitle(false);
  }

  useEffect(() => {
    if (isEditingTitle && titleInputRef.current) {
      titleInputRef.current.focus();
      titleInputRef.current.select();
    }
  }, [isEditingTitle]);

  useEffect(() => {
    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (menuRef.current && !menuRef.current.contains(target)) {
        setIsMenuOpen(false);
      }
      if (langMenuRef.current && !langMenuRef.current.contains(target)) {
        setIsLangOpen(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setIsMenuOpen(false);
        setIsLangOpen(false);
      }
    };

    const handleScroll = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('.language-dropdown') ||
          target.closest('.topbar-dropdown-menu'))
      ) {
        return;
      }
      setIsMenuOpen(false);
      setIsLangOpen(false);
    };

    if (isMenuOpen || isLangOpen) {
      window.addEventListener('scroll', handleScroll, { capture: true, passive: true });
      window.addEventListener('wheel', handleScroll, { passive: true });
      window.addEventListener('touchmove', handleScroll, { passive: true });
      document.addEventListener('mousedown', handlePointerDown);
      document.addEventListener('touchstart', handlePointerDown);
      document.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      window.removeEventListener('scroll', handleScroll, { capture: true });
      window.removeEventListener('wheel', handleScroll);
      window.removeEventListener('touchmove', handleScroll);
      document.removeEventListener('mousedown', handlePointerDown);
      document.removeEventListener('touchstart', handlePointerDown);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [isMenuOpen, isLangOpen]);

  const handleTitleSubmit = () => {
    const cleanTitle = tempTitle.trim() || note?.title || t.untitledNote;
    setIsEditingTitle(false);
    if (cleanTitle !== note?.title) {
      onUpdateTitle(cleanTitle);
    }
  };

  const handleStartEditing = () => {
    setTempTitle(note?.title || t.untitledNote);
    setIsEditingTitle(true);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result;
      if (typeof text === 'string') {
        if (onImportFile) {
          onImportFile(text, file.name);
        }
      }
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const tabNotes = notes && notes.length > 0 ? notes : note ? [note] : [];

  const renderActionControls = () => (
    <div
      id="notepad-header-right-buttons"
      className="header-right-controls flex items-center gap-2 shrink-0 relative"
    >
      {/* Language Selector Dropdown */}
      <div className="relative z-[210]" ref={langMenuRef}>
        <button
          id="notepad-language-btn"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsMenuOpen(false);
            setIsLangOpen((prev) => !prev);
          }}
          className="h-8 px-2 sm:px-2.5 flex items-center justify-center gap-1.5 rounded-lg border border-slate-200/80 dark:border-slate-800 bg-white/70 hover:bg-slate-100/80 dark:bg-[#141822]/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors text-xs font-semibold cursor-pointer whitespace-nowrap"
          title={t.language}
          aria-label="Change Language"
          aria-expanded={isLangOpen}
          aria-haspopup="true"
        >
          <Globe className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />
          <span>{currentLang || 'EN'}</span>
        </button>

        {isLangOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 'calc(100% + 6px)', zIndex: 9999 }}
            className="language-dropdown topbar-dropdown-menu absolute end-0 top-full mt-2 w-52 rounded-xl bg-white dark:bg-[#161A24] shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 p-1.5 text-xs text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800 max-h-80 overflow-y-auto"
          >
            {LANGUAGE_OPTIONS.map((opt) => {
              const isCurrent = currentLang === opt.code;
              return (
                <button
                  key={opt.code}
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    onSelectLanguage?.(opt.code);
                    setIsLangOpen(false);
                  }}
                  className={`w-full px-2.5 py-2 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                    isCurrent
                      ? 'font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/15'
                      : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/70'
                  }`}
                >
                  <span className="font-medium">{opt.label}</span>
                  {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />}
                </button>
              );
            })}
          </div>
        )}
      </div>

      {/* Theme Toggle Button */}
      {onToggleTheme && (
        <button
          id="notepad-theme-toggle-btn"
          type="button"
          onClick={onToggleTheme}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/80 dark:border-slate-800 bg-white/70 hover:bg-slate-100/80 dark:bg-[#141822]/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
          title={currentTheme === 'dark' ? t.lightTheme : t.darkTheme}
          aria-label={currentTheme === 'dark' ? t.lightTheme : t.darkTheme}
        >
          {currentTheme === 'dark' ? (
            <Sun className="w-4 h-4 text-amber-400 hover:rotate-45 transition-transform duration-300" />
          ) : (
            <Moon className="w-4 h-4 text-indigo-500 hover:-rotate-12 transition-transform duration-300" />
          )}
        </button>
      )}

      {/* Settings Modal Button */}
      {onOpenSettings && (
        <button
          id="notepad-settings-btn"
          type="button"
          onClick={onOpenSettings}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/80 dark:border-slate-800 bg-white/70 hover:bg-slate-100/80 dark:bg-[#141822]/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
          title={t.settings}
          aria-label={t.settings}
        >
          <Settings className="w-4 h-4" />
        </button>
      )}

      {/* More Actions Menu (3 Dots) */}
      <div className="relative z-[210]" ref={menuRef}>
        <button
          id="notepad-actions-menu-btn"
          type="button"
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            setIsLangOpen(false);
            setIsMenuOpen((prev) => !prev);
          }}
          className="w-8 h-8 rounded-lg flex items-center justify-center border border-slate-200/80 dark:border-slate-800 bg-white/70 hover:bg-slate-100/80 dark:bg-[#141822]/70 dark:hover:bg-slate-800/80 text-slate-700 dark:text-slate-300 transition-colors cursor-pointer shrink-0"
          aria-label={t.moreOptions}
          title={t.moreOptions}
          aria-expanded={isMenuOpen}
          aria-haspopup="true"
        >
          <MoreVertical className="w-4 h-4" />
        </button>

        {isMenuOpen && (
          <div
            onClick={(e) => e.stopPropagation()}
            style={{ position: 'absolute', top: 'calc(100% + 6px)', zIndex: 9999 }}
            className="topbar-dropdown-menu absolute end-0 top-full mt-2 w-56 rounded-xl bg-white dark:bg-[#161A24] shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 p-1.5 text-xs text-slate-800 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800"
          >
            <PWAInstallButton variant="menuitem" onAction={() => setIsMenuOpen(false)} />

            {/* 1. Export File */}
            <button
              id="toolbar-export-file-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onOpenExportImport('export');
              }}
              className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer text-xs font-medium"
            >
              <Download className="w-4 h-4 text-indigo-500 shrink-0" />
              <span>{t.exportFile || 'Export File'}</span>
            </button>

            {/* 2. Import File */}
            <button
              id="toolbar-import-file-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onOpenExportImport('import');
              }}
              className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer text-xs font-medium"
            >
              <Upload className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{t.importFile || 'Import File'}</span>
            </button>

            <div className="my-1 h-px bg-slate-200/70 dark:bg-slate-800" />

            {/* 3. Keyboard Shortcuts */}
            <button
              id="toolbar-keyboard-shortcuts-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onOpenShortcuts();
              }}
              className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer text-xs font-medium"
            >
              <HelpCircle className="w-4 h-4 text-amber-500 shrink-0" />
              <span>{t.shortcuts || 'Keyboard Shortcuts'}</span>
            </button>

            {onOpenPrivacy && (
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onOpenPrivacy();
                }}
                className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition-colors cursor-pointer text-xs font-medium"
              >
                <Shield className="w-4 h-4 text-emerald-500 shrink-0" />
                <span>{t.devicePrivacy}</span>
              </button>
            )}

            <div className="my-1 h-px bg-slate-200/70 dark:bg-slate-800" />

            {/* 4. Delete This Note */}
            <button
              id="toolbar-delete-this-note-btn"
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setIsMenuOpen(false);
                onDeleteNote();
              }}
              className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer text-xs font-medium"
            >
              <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
              <span>{t.deleteNote || 'Delete This Note'}</span>
            </button>

            {/* 5. Delete All Notes (Red Alert) */}
            {onOpenResetAll && (
              <button
                id="toolbar-delete-all-notes-btn"
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setIsMenuOpen(false);
                  onOpenResetAll();
                }}
                className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-left transition-colors cursor-pointer text-xs font-medium mt-0.5"
              >
                <Trash2 className="w-4 h-4 text-rose-500 shrink-0" />
                <span>{t.deleteAllNotes || 'Delete All Notes'}</span>
              </button>
            )}
          </div>
        )}
      </div>
    </div>
  );

  return (
    <div
      id="notepad-tabs-row"
      className="header-container sticky top-0 z-[200] w-full bg-white/95 dark:bg-[#0D1017]/95 backdrop-blur-md border-b border-subtle-theme px-3 sm:px-6 py-2 sm:py-2.5 select-none transition-colors"
      style={{ zIndex: 200 }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept=".txt,.md,text/plain,text/markdown"
        className="hidden"
        style={{ display: 'none' }}
        onChange={handleFileInputChange}
      />

      <div
        id="notepad-tabs-nav-bar"
        className="tabs-navigation-bar w-full flex flex-col md:flex-row md:items-center md:justify-between gap-2 sm:gap-4"
      >
        {/* ROW 1 (Mobile): Logo on left + Action controls on right */}
        <div className="flex items-center justify-between w-full md:w-auto shrink-0">
          <div className="flex items-center gap-2.5 shrink-0">
            <AppLogo size={28} />
            <span className="font-bold text-sm sm:text-base tracking-tight text-slate-900 dark:text-white whitespace-nowrap">
              NoLoginNotepad
            </span>
          </div>

          <div className="flex md:hidden items-center gap-2">
            {renderActionControls()}
          </div>
        </div>

        {/* ROW 2 (Mobile) / Center (Desktop): Notepad Tabs & Add (+) Button */}
        <div
          id="notepad-tabs-container"
          className="tabs-scroll-container flex items-center gap-1.5 min-w-0 flex-1 overflow-x-auto whitespace-nowrap py-1 w-full md:w-auto"
        >
          {tabNotes.map((tabNote) => {
            const isActive = tabNote.id === (activeNoteId ?? note?.id);
            return (
              <div
                key={tabNote.id}
                onClick={() => !isActive && onSelectNote(tabNote.id)}
                className={`note-tab tab group relative flex items-center gap-2 h-8 px-3 rounded-lg text-xs transition-all duration-150 cursor-pointer shrink-0 max-w-[220px] select-none border ${
                  isActive
                    ? 'active active-tab bg-[#ffffff] dark:bg-[#272f40] text-[#0f172a] dark:text-[#f8fafc] font-semibold border-slate-200/90 dark:border-slate-700/80 shadow-2xs'
                    : 'bg-[#eef2f6] hover:bg-[#e2e8f0] text-[#64748b] hover:text-[#0f172a] dark:bg-[#181d28] dark:hover:bg-[#222938] dark:text-[#94a3b8] dark:hover:text-[#f8fafc] font-medium border-transparent'
                }`}
                title={tabNote.title || t.untitledNote}
              >
                {/* Glowing Green Auto-Save Status Indicator Dot */}
                <div className="tab-status-dot-slot w-2.5 h-2.5 flex items-center justify-center shrink-0 pointer-events-none">
                  {isActive ? (
                    <span className="tab-active-dot tab-green-dot w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.65)] block shrink-0" />
                  ) : (
                    <span className="w-1.5 h-1.5 rounded-full bg-slate-300 dark:bg-slate-600 block shrink-0 opacity-60 group-hover:opacity-100 transition-opacity" />
                  )}
                </div>

                {/* Tab Title or Inline Rename Input */}
                <div className="flex-1 min-w-0 flex items-center overflow-hidden">
                  {isActive && isEditingTitle ? (
                    <input
                      ref={titleInputRef}
                      type="text"
                      value={tempTitle}
                      onChange={(e) => setTempTitle(e.target.value)}
                      onBlur={handleTitleSubmit}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleTitleSubmit();
                        if (e.key === 'Escape') {
                          setTempTitle(tabNote.title || t.untitledNote);
                          setIsEditingTitle(false);
                        }
                      }}
                      onClick={(e) => e.stopPropagation()}
                      onDoubleClick={(e) => e.stopPropagation()}
                      className="w-full min-w-[80px] bg-transparent border-none p-0 text-xs font-semibold focus:outline-none focus:ring-0 text-inherit"
                    />
                  ) : (
                    <span
                      onDoubleClick={(e) => {
                        e.stopPropagation();
                        e.preventDefault();
                        if (isActive) {
                          handleStartEditing();
                        }
                      }}
                      className="truncate text-xs block select-none max-w-[140px]"
                    >
                      {tabNote.title || t.untitledNote}
                    </span>
                  )}
                </div>

                {/* Close Tab Button */}
                {tabNotes.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onCloseNote ? onCloseNote(tabNote) : onDeleteNote();
                    }}
                    className={`w-4 h-4 flex items-center justify-center rounded-md hover:bg-slate-200/80 dark:hover:bg-slate-700/80 text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer shrink-0 ${
                      isActive ? 'opacity-80 hover:opacity-100' : 'opacity-0 group-hover:opacity-100'
                    }`}
                    title={t.closeTab}
                    aria-label={t.closeTab}
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
            );
          })}

          {/* New Tab Button (+) */}
          <button
            id="new-note-btn"
            type="button"
            onClick={onCreateNewNote}
            className="new-tab-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-600 hover:text-indigo-600 dark:text-slate-400 dark:hover:text-indigo-400 bg-slate-100/70 hover:bg-indigo-50/80 dark:bg-slate-800/40 dark:hover:bg-indigo-950/40 border border-transparent hover:border-indigo-500/20 transition-all duration-150 shrink-0 cursor-pointer"
            title={t.createNewBlankNote}
            aria-label={t.createNewBlankNote}
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>

        {/* Desktop Header Actions */}
        <div className="hidden md:flex items-center gap-1.5 shrink-0 relative">
          {renderActionControls()}
        </div>
      </div>
    </div>
  );
};
