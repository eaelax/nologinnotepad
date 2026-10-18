'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { Note, UserPreferences, ThemeMode, PageStyle, EditorMode, LanguageCode } from '@/types/note';
import { TRANSLATIONS, Translations } from '@/lib/i18n/translations';
import { noteRepository } from '@/lib/storage/note-repository';
import { preferencesRepository, DEFAULT_PREFERENCES } from '@/lib/storage/preferences-repository';
import {
  calculateTextStats,
  createNewNote,
  getNextUntitledTitle,
  stripHtmlToPlainText,
} from '@/lib/services/note-service';
import { NotepadTabsRow } from '@/components/NotepadTabsRow';
import { Editor } from '@/components/Editor';
import { SettingsModal } from '@/components/SettingsModal';
import { ExportImportModal } from '@/components/ExportImportModal';
import { PrivacyModal } from '@/components/PrivacyModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ResetAllModal } from '@/components/ResetAllModal';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { AppLogo } from '@/components/AppLogo';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Footer } from '@/components/Footer';
import { MobileShowcaseSection } from '@/components/MobileShowcaseSection';
import { resetAllApplicationData } from '@/lib/storage/reset-service';
import { exportAllNotesBackup, exportNoteAsTxt } from '@/lib/utils/export-import';
import {
  Zap,
  BookOpen,
  Check,
  X,
  ChevronDown,
  Download,
  Type,
  Maximize2,
  Shield,
  FileText,
  WifiOff,
  Layers,
  BarChart2,
  ArrowUp,
} from 'lucide-react';
import { ALL_PSEO_SLUGS, PSEO_PAGES } from '@/lib/pseo-pages';

export interface NotepadAppProps {
  initialSlug?: string;
  defaultPageStyle?: PageStyle;
  defaultEditorMode?: EditorMode;
  defaultSampleContent?: string;
  defaultShowWordCounter?: boolean;
  highlightOffline?: boolean;
  pageHeader?: {
    badge?: string;
    h1: string;
  };
  infoSection?: {
    heading: string;
    paragraphs: string[];
    useCases?: string[];
    keyFeatures?: { title: string; desc: string }[];
  };
}

export function NotepadApp({
  initialSlug,
  defaultPageStyle,
  defaultEditorMode,
  defaultSampleContent,
  defaultShowWordCounter,
  highlightOffline,
  pageHeader,
  infoSection,
}: NotepadAppProps) {
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [showBackToTop, setShowBackToTop] = useState(false);

  const lang: LanguageCode = preferences.language || 'EN';
  const t: Translations = TRANSLATIONS[lang] || TRANSLATIONS.EN;
  const isRtl = lang === 'AR';

  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [exportImportTab, setExportImportTab] = useState<'export' | 'import'>('export');

  const handleOpenExportImport = useCallback((tab: 'export' | 'import' = 'export') => {
    setExportImportTab(tab);
    setIsExportImportOpen(true);
  }, []);

  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isResetAllOpen, setIsResetAllOpen] = useState(false);
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeNoteRef = useRef<Note | null>(null);
  const preferencesRef = useRef<UserPreferences>(DEFAULT_PREFERENCES);

  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  useEffect(() => {
    const handleScroll = () => {
      if (typeof window !== 'undefined') {
        setShowBackToTop(window.scrollY > 240);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = useCallback(() => {
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      const editorElement =
        document.getElementById('notepad-text-input') ||
        document.querySelector('.notepad-editable');
      if (editorElement) {
        editorElement.scrollTop = 0;
      }
    }
  }, []);

  const applyTheme = useCallback((theme: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    const targetTheme: 'light' | 'dark' = theme === 'dark' ? 'dark' : 'light';

    root.setAttribute('data-theme', targetTheme);
    if (targetTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }

    if (document.body) {
      document.body.setAttribute('data-theme', targetTheme);
      if (targetTheme === 'dark') {
        document.body.classList.add('dark');
      } else {
        document.body.classList.remove('dark');
      }
    }

    const appRoot = document.getElementById('notepad-app-root');
    if (appRoot) {
      appRoot.setAttribute('data-theme', targetTheme);
    }
  }, []);

  const applyLanguage = useCallback((lang: LanguageCode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;
    root.lang = lang === 'AR' ? 'ar' : lang.toLowerCase();
    root.dir = lang === 'AR' ? 'rtl' : 'ltr';
    root.setAttribute('data-lang', lang);
  }, []);

  const handleRevertLiveTheme = useCallback(() => {
    applyTheme(preferencesRef.current.theme);
  }, [applyTheme]);

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const savedPrefs = await preferencesRepository.getPreferences();
        let initialLang: LanguageCode = 'EN';
        try {
          const directLang = localStorage.getItem('notepad_language') as string;
          if (directLang) {
            const up = directLang.toUpperCase() as LanguageCode;
            if (['EN', 'AR', 'FR', 'ES', 'DE', 'RU', 'PT', 'CH'].includes(up)) {
              initialLang = up;
            }
          } else if (savedPrefs.language) {
            const up = (savedPrefs.language as string).toUpperCase() as LanguageCode;
            if (['EN', 'AR', 'FR', 'ES', 'DE', 'RU', 'PT', 'CH'].includes(up)) {
              initialLang = up;
            }
          }
        } catch {
          if (savedPrefs.language) {
            const up = (savedPrefs.language as string).toUpperCase() as LanguageCode;
            if (['EN', 'AR', 'FR', 'ES', 'DE', 'RU', 'PT', 'CH'].includes(up)) {
              initialLang = up;
            }
          }
        }

        const initialPrefs: UserPreferences = {
          ...savedPrefs,
          theme: savedPrefs.theme === 'dark' ? 'dark' : 'light',
          fontFamily: savedPrefs.fontFamily || 'rubik',
          fontSize: typeof savedPrefs.fontSize === 'number' && savedPrefs.fontSize > 0 ? savedPrefs.fontSize : 16,
          language: initialLang,
          pageStyle: defaultPageStyle ?? (savedPrefs.pageStyle || 'blank'),
          editorMode: defaultEditorMode ?? savedPrefs.editorMode,
          showWordCount: defaultShowWordCounter ?? savedPrefs.showWordCount,
          showCharacterCount: defaultShowWordCounter ?? savedPrefs.showCharacterCount,
          showLineCount: defaultShowWordCounter ?? savedPrefs.showLineCount,
          showReadingTime: defaultShowWordCounter ?? savedPrefs.showReadingTime,
        };

        if (isMounted) {
          setPreferences(initialPrefs);
          applyTheme(initialPrefs.theme);
          applyLanguage(initialLang);
        }

        const allNotes = await noteRepository.getAllNotes();
        const lastActiveId = await noteRepository.getLastActiveNoteId();

        if (allNotes.length > 0) {
          if (isMounted) {
            const normalizedNotes = allNotes.map((n) =>
              n.title === 'Untitled Note' ? { ...n, title: 'Untitled Note 1' } : n
            );
            let targetNote = normalizedNotes.find((n) => n.id === lastActiveId) || normalizedNotes[0];

            if (defaultSampleContent && (!targetNote.content || targetNote.content.trim() === '')) {
              targetNote = {
                ...targetNote,
                content: defaultSampleContent,
                pageStyle: defaultPageStyle ?? targetNote.pageStyle,
              };
              noteRepository.saveNoteSync(targetNote);
            } else if (defaultPageStyle && targetNote.pageStyle !== defaultPageStyle) {
              targetNote = {
                ...targetNote,
                pageStyle: defaultPageStyle,
              };
              noteRepository.saveNoteSync(targetNote);
            }

            try {
              const quickScratch = localStorage.getItem('notepad_quick_scratch');
              const lastActive = localStorage.getItem('notepad_last_active_id');
              if (targetNote && !targetNote.content && quickScratch && lastActive === targetNote.id) {
                targetNote.content = quickScratch;
                noteRepository.saveNoteSync(targetNote);
              }
            } catch {}

            setNotes(normalizedNotes.map((n) => (n.id === targetNote.id ? targetNote : n)));
            setActiveNoteId(targetNote.id);
            activeNoteRef.current = targetNote;
          }
        } else {
          const initialContent = defaultSampleContent || '';
          const initialNote = createNewNote(
            undefined,
            initialContent,
            defaultPageStyle ?? savedPrefs.pageStyle,
            []
          );
          await noteRepository.saveNote(initialNote);
          await noteRepository.setLastActiveNoteId(initialNote.id);
          if (isMounted) {
            setNotes([initialNote]);
            setActiveNoteId(initialNote.id);
            activeNoteRef.current = initialNote;
          }
        }
      } catch (err) {
        console.error('[App] Initialization error:', err);
        const fallbackNote = createNewNote(undefined, defaultSampleContent || '', defaultPageStyle, []);
        if (isMounted) {
          setNotes([fallbackNote]);
          setActiveNoteId(fallbackNote.id);
        }
      } finally {
        if (isMounted) {
          setIsInitialized(true);
        }
      }
    }

    initialize();

    return () => {
      isMounted = false;
    };
  }, [applyTheme, applyLanguage, defaultPageStyle, defaultEditorMode, defaultSampleContent, defaultShowWordCounter]);

  useEffect(() => {
    const handleFlushOnExit = () => {
      if (activeNoteRef.current) {
        try {
          noteRepository.saveNoteSync(activeNoteRef.current);
          localStorage.setItem('notepad_quick_scratch', activeNoteRef.current.content);
          localStorage.setItem('notepad_last_active_id', activeNoteRef.current.id);
        } catch {}
      }
    };

    window.addEventListener('beforeunload', handleFlushOnExit);
    window.addEventListener('pagehide', handleFlushOnExit);
    document.addEventListener('visibilitychange', () => {
      if (document.visibilityState === 'hidden') {
        handleFlushOnExit();
      }
    });

    return () => {
      window.removeEventListener('beforeunload', handleFlushOnExit);
      window.removeEventListener('pagehide', handleFlushOnExit);
    };
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const handleToggleFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } else {
          setIsFullscreen((prev) => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch {
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  const handleInstantSave = useCallback(async () => {
    if (!activeNote) return;
    if (saveTimeoutRef.current) {
      clearTimeout(saveTimeoutRef.current);
    }
    setSaveStatus('saving');
    try {
      await noteRepository.saveNote(activeNote);
      try {
        localStorage.setItem('notepad_quick_scratch', activeNote.content);
      } catch {}
      setSaveStatus('saved');
    } catch (err) {
      console.error('[Save] Instant save failed:', err);
      setSaveStatus('error');
    }
  }, [activeNote]);

  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!activeNoteId) return;

      const now = Date.now();
      const stats = calculateTextStats(newContent);
      let updatedNoteToSave: Note | null = null;

      setNotes((prevNotes) => {
        return prevNotes.map((note) => {
          if (note.id !== activeNoteId) return note;

          const currentTitle =
            note.title && note.title.trim() ? note.title : getNextUntitledTitle(prevNotes);

          const updatedNote: Note = {
            ...note,
            content: newContent,
            title: currentTitle,
            updatedAt: now,
            wordCount: stats.wordCount,
            characterCount: stats.characterCount,
          };

          updatedNoteToSave = updatedNote;
          return updatedNote;
        });
      });

      if (updatedNoteToSave) {
        const noteToSave: Note = updatedNoteToSave;
        activeNoteRef.current = noteToSave;

        noteRepository.saveNoteSync(noteToSave);
        try {
          localStorage.setItem('notepad_quick_scratch', newContent);
          localStorage.setItem('notepad_last_active_id', activeNoteId);
        } catch {}

        if (saveTimeoutRef.current) {
          clearTimeout(saveTimeoutRef.current);
        }
        setSaveStatus('saving');

        saveTimeoutRef.current = setTimeout(async () => {
          try {
            await noteRepository.saveNote(noteToSave);
            setSaveStatus('saved');
          } catch (err) {
            console.error('[Save] Debounced save failed:', err);
            setSaveStatus('error');
          }
        }, 300);
      }
    },
    [activeNoteId]
  );

  const handleImportFile = useCallback(
    async (fileContent: string, fileName?: string) => {
      if (!activeNoteId) return;
      const cleanTitle = fileName ? fileName.replace(/\.[^/.]+$/, '') : undefined;
      const stats = calculateTextStats(fileContent);
      const now = Date.now();

      setNotes((prevNotes) =>
        prevNotes.map((note) => {
          if (note.id !== activeNoteId) return note;
          const currentTitle =
            cleanTitle ||
            (note.title && note.title.trim() ? note.title : getNextUntitledTitle(prevNotes));
          const updatedNote: Note = {
            ...note,
            content: fileContent,
            title: currentTitle,
            updatedAt: now,
            wordCount: stats.wordCount,
            characterCount: stats.characterCount,
          };
          noteRepository.saveNote(updatedNote);
          try {
            localStorage.setItem('notepad_quick_scratch', fileContent);
          } catch {}
          return updatedNote;
        })
      );
      setSaveStatus('saved');
    },
    [activeNoteId]
  );

  const handleUpdateTitle = useCallback(
    async (newTitle: string) => {
      if (!activeNoteId) return;
      const now = Date.now();

      setNotes((prev) =>
        prev.map((n) => {
          if (n.id === activeNoteId) {
            const updated = { ...n, title: newTitle, updatedAt: now };
            noteRepository.saveNote(updated);
            return updated;
          }
          return n;
        })
      );
    },
    [activeNoteId]
  );

  const handleSelectNote = useCallback(async (id: string) => {
    if (activeNoteRef.current) {
      await noteRepository.saveNote(activeNoteRef.current);
    }
    setActiveNoteId(id);
    await noteRepository.setLastActiveNoteId(id);
    setSaveStatus('saved');
  }, []);

  const handleCreateNewNote = useCallback(async () => {
    if (activeNoteRef.current) {
      await noteRepository.saveNote(activeNoteRef.current);
      noteRepository.saveNoteSync(activeNoteRef.current);
    }
    const newNote = createNewNote(undefined, '', defaultPageStyle ?? preferences.pageStyle, notes);
    await noteRepository.saveNote(newNote);
    noteRepository.saveNoteSync(newNote);
    await noteRepository.setLastActiveNoteId(newNote.id);

    setNotes((prev) => [...prev, newNote]);
    setActiveNoteId(newNote.id);
    activeNoteRef.current = newNote;
    setSaveStatus('saved');

    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
      const editorElement =
        document.getElementById('notepad-text-input') ||
        (document.querySelector('.notepad-editable') as HTMLElement | null);
      if (editorElement) {
        editorElement.scrollTop = 0;
      }

      setTimeout(() => {
        const editable = (document.getElementById('notepad-text-input') ||
          document.querySelector('.notepad-editable')) as HTMLElement | null;
        if (editable) {
          editable.focus({ preventScroll: true });
          try {
            const sel = window.getSelection();
            if (sel) {
              const range = document.createRange();
              range.selectNodeContents(editable);
              range.collapse(true);
              sel.removeAllRanges();
              sel.addRange(range);
            }
          } catch {}
        }
      }, 50);
    }
  }, [defaultPageStyle, preferences.pageStyle, notes]);

  const handleDeleteNoteConfirm = useCallback(async () => {
    if (!noteToDelete) return;
    const targetId = noteToDelete.id;
    await noteRepository.deleteNote(targetId);

    setNotes((prev) => {
      const targetIndex = prev.findIndex((n) => n.id === targetId);
      const remaining = prev.filter((n) => n.id !== targetId);
      if (remaining.length === 0) {
        const fresh = createNewNote(undefined, '', defaultPageStyle ?? preferences.pageStyle, []);
        noteRepository.saveNote(fresh);
        noteRepository.setLastActiveNoteId(fresh.id);
        setActiveNoteId(fresh.id);
        try {
          localStorage.setItem('notepad_last_active_id', fresh.id);
          localStorage.setItem('notepad_quick_scratch', fresh.content || '');
        } catch {}
        return [fresh];
      }
      if (activeNoteId === targetId) {
        const nextIndex = Math.min(Math.max(0, targetIndex === 0 ? 0 : targetIndex - 1), remaining.length - 1);
        const nextActive = remaining[nextIndex];
        setActiveNoteId(nextActive.id);
        noteRepository.setLastActiveNoteId(nextActive.id);
        try {
          localStorage.setItem('notepad_last_active_id', nextActive.id);
          localStorage.setItem('notepad_quick_scratch', nextActive.content || '');
        } catch {}
      }
      return remaining;
    });

    setNoteToDelete(null);
  }, [noteToDelete, activeNoteId, defaultPageStyle, preferences.pageStyle]);

  const handleUpdatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const updated = await preferencesRepository.savePreferences(updates);
      setPreferences(updated);
      if (updates.theme) {
        applyTheme(updated.theme);
      }
      if (updates.language) {
        applyLanguage(updated.language || 'EN');
      }
    },
    [applyTheme, applyLanguage]
  );

  const handleImportSuccess = useCallback(
    async (importedNotes: Note[], importedPrefs?: Partial<UserPreferences>) => {
      const allNotes = await noteRepository.getAllNotes();
      setNotes(allNotes);
      if (importedNotes.length > 0) {
        setActiveNoteId(importedNotes[0].id);
        await noteRepository.setLastActiveNoteId(importedNotes[0].id);
      }
      if (importedPrefs) {
        await handleUpdatePreferences(importedPrefs);
      }
    },
    [handleUpdatePreferences]
  );

  const handleResetAllData = useCallback(async () => {
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      const { initialNote, defaultPreferences } = await resetAllApplicationData();
      try {
        localStorage.removeItem('notepad_quick_scratch');
        localStorage.removeItem('notepad_last_active_id');
      } catch {}
      setNotes([initialNote]);
      setActiveNoteId(initialNote.id);
      setPreferences(defaultPreferences);
      applyTheme(defaultPreferences.theme);
      applyLanguage(defaultPreferences.language || 'EN');
      setSaveStatus('saved');
      setIsResetAllOpen(false);
      setIsSettingsOpen(false);
    } catch (err) {
      console.error('[Reset] Failed to clean all application data:', err);
    }
  }, [applyTheme, applyLanguage]);

  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent);
      const hasMod = isMac ? e.metaKey : e.ctrlKey;

      if (hasMod && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleCreateNewNote();
        return;
      }

      if (hasMod && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        if (activeNoteRef.current) {
          exportNoteAsTxt(activeNoteRef.current);
        }
        return;
      }

      if (hasMod && e.shiftKey && e.key.toLowerCase() === 'c') {
        e.preventDefault();
        if (activeNoteRef.current) {
          const plainText = stripHtmlToPlainText(activeNoteRef.current.content || '');
          if (navigator.clipboard) {
            navigator.clipboard.writeText(plainText).catch(() => {});
          }
        }
        return;
      }

      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullScreen();
        return;
      }

      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          handleRevertLiveTheme();
          setIsSettingsOpen(false);
        } else if (isResetAllOpen) setIsResetAllOpen(false);
        else if (isExportImportOpen) setIsExportImportOpen(false);
        else if (isPrivacyOpen) setIsPrivacyOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
        else if (noteToDelete) setNoteToDelete(null);
        else if (isFullscreen) {
          handleToggleFullScreen();
        }
      }
    };

    window.addEventListener('keydown', handleGlobalKeyDown);
    return () => window.removeEventListener('keydown', handleGlobalKeyDown);
  }, [
    handleCreateNewNote,
    handleToggleFullScreen,
    handleRevertLiveTheme,
    isSettingsOpen,
    isResetAllOpen,
    isExportImportOpen,
    isPrivacyOpen,
    isShortcutsOpen,
    noteToDelete,
    isFullscreen,
  ]);

  const handleSelectLanguage = useCallback(
    (newLang: LanguageCode) => {
      applyLanguage(newLang);
      try {
        localStorage.setItem('notepad_language', newLang);
      } catch {}
      setPreferences((prev) => ({ ...prev, language: newLang }));
      handleUpdatePreferences({ language: newLang });
    },
    [applyLanguage, handleUpdatePreferences]
  );

  const handleToggleTheme = useCallback(() => {
    setPreferences((prev) => {
      const nextTheme: ThemeMode = prev.theme === 'dark' ? 'light' : 'dark';
      applyTheme(nextTheme);
      preferencesRepository.savePreferences({ theme: nextTheme });
      return { ...prev, theme: nextTheme };
    });
  }, [applyTheme]);

  const featureIcons = [
    Zap,
    Download,
    Maximize2,
    FileText,
    Type,
    BarChart2,
    Shield,
    WifiOff,
    Layers,
  ];

  return (
    <div
      id="notepad-app-root"
      className="min-h-screen w-full max-w-full box-border flex flex-col bg-app-theme text-primary-theme relative overflow-visible"
      dir={isRtl ? 'rtl' : 'ltr'}
    >
      {!isInitialized && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F6F7F9] dark:bg-[#090B10] select-none w-full h-full"
        >
          <div className="flex flex-col items-center gap-4 animate-logo-breath">
            <AppLogo size={52} tileRadius={120} />
            <div className="flex items-center gap-2.5">
              <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
                Preparing workspace...
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Semantic H1 page header */}
      {pageHeader && !isFullscreen && (
        <header
          id="pseo-page-header"
          className="border-b border-subtle-theme bg-white/70 dark:bg-[#11141C]/70 backdrop-blur-xs px-4 sm:px-6 py-3 transition-colors select-none"
        >
          <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
            <div className="space-y-0.5">
              {pageHeader.badge && (
                <div className="text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                  {pageHeader.badge}
                </div>
              )}
              <h1 className="text-base sm:text-lg font-bold tracking-tight text-primary-theme leading-snug">
                {pageHeader.h1}
              </h1>
            </div>

            <div className="flex items-center gap-2 self-start sm:self-auto">
              <Link
                href="/"
                className="text-xs font-medium px-3 py-1.5 rounded-lg border border-subtle-theme hover:bg-card-theme text-secondary-theme hover:text-primary-theme transition-colors inline-flex items-center gap-1"
              >
                <span>Default Notepad</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Workspace Area */}
      <div className="flex-1 flex flex-col relative w-full max-w-full box-border items-stretch">
        <div className="workspace-main-column flex-1 min-w-0 w-full max-w-full box-border flex flex-col items-stretch">
          {activeNote ? (
            <Editor
              key={activeNote.id}
              note={activeNote}
              preferences={preferences}
              currentLang={lang}
              saveStatus={saveStatus}
              onContentChange={handleContentChange}
              onInstantSave={handleInstantSave}
              onImportFile={handleImportFile}
              onDownloadFile={() => activeNote && exportNoteAsTxt(activeNote)}
              onUpdatePreferences={handleUpdatePreferences}
              onOpenExport={() => handleOpenExportImport('export')}
              onOpenHelp={() => setIsShortcutsOpen(true)}
              tabsHeader={
                <NotepadTabsRow
                  note={activeNote}
                  notes={notes}
                  activeNoteId={activeNoteId}
                  currentLang={lang}
                  currentTheme={preferences.theme}
                  onSelectNote={handleSelectNote}
                  onCloseNote={(noteToClose) => {
                    const plain = stripHtmlToPlainText(noteToClose.content || '').trim();
                    if (plain === '') {
                      const targetId = noteToClose.id;
                      noteRepository.deleteNote(targetId).then(() => {
                        setNotes((prev) => {
                          const remaining = prev.filter((n) => n.id !== targetId);
                          if (remaining.length === 0) {
                            const fresh = createNewNote(undefined, '', defaultPageStyle ?? preferences.pageStyle, []);
                            noteRepository.saveNote(fresh);
                            noteRepository.setLastActiveNoteId(fresh.id);
                            setActiveNoteId(fresh.id);
                            return [fresh];
                          }
                          if (activeNoteId === targetId) {
                            const nextActive = remaining[0];
                            setActiveNoteId(nextActive.id);
                            noteRepository.setLastActiveNoteId(nextActive.id);
                          }
                          return remaining;
                        });
                      });
                    } else {
                      setNoteToDelete(noteToClose);
                    }
                  }}
                  onCreateNewNote={handleCreateNewNote}
                  onUpdateTitle={handleUpdateTitle}
                  onDeleteNote={() => {
                    if (activeNote) {
                      setNoteToDelete(activeNote);
                    }
                  }}
                  onExportFile={() => handleOpenExportImport('export')}
                  onImportFile={handleImportFile}
                  onToggleTheme={handleToggleTheme}
                  onSelectLanguage={handleSelectLanguage}
                  onOpenSettings={() => setIsSettingsOpen(true)}
                  onOpenExportImport={handleOpenExportImport}
                  onOpenShortcuts={() => setIsShortcutsOpen(true)}
                  onOpenPrivacy={() => setIsPrivacyOpen(true)}
                  onOpenResetAll={() => setIsResetAllOpen(true)}
                  isSettingsOpen={isSettingsOpen}
                />
              }
            />
          ) : (
            <div className="flex-1 flex flex-col items-stretch">
              <NotepadTabsRow
                note={null}
                notes={notes}
                activeNoteId={null}
                currentLang={lang}
                currentTheme={preferences.theme}
                onSelectNote={handleSelectNote}
                onCloseNote={() => {}}
                onCreateNewNote={handleCreateNewNote}
                onUpdateTitle={handleUpdateTitle}
                onDeleteNote={() => {}}
                onExportFile={() => handleOpenExportImport('export')}
                onImportFile={handleImportFile}
                onToggleTheme={handleToggleTheme}
                onSelectLanguage={handleSelectLanguage}
                onOpenSettings={() => setIsSettingsOpen(true)}
                onOpenExportImport={handleOpenExportImport}
                onOpenShortcuts={() => setIsShortcutsOpen(true)}
                onOpenPrivacy={() => setIsPrivacyOpen(true)}
                onOpenResetAll={() => setIsResetAllOpen(true)}
                isSettingsOpen={isSettingsOpen}
              />
              <div className="flex-1 flex items-center justify-center p-12 text-secondary-theme text-sm">
                <p>Loading note...</p>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Below-the-Fold Sections */}
      {!isFullscreen && (
        <div className="border-t border-subtle-theme bg-app-theme py-20 px-4 sm:px-6">
          <div className="max-w-5xl mx-auto space-y-24">
            {/* Section 1: Editorial Overview & SEO Showcase */}
            <section className="space-y-8 max-w-[760px] mx-auto text-center px-4">
              <div className="space-y-4">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-primary-theme text-balance">
                  What Is An Online Notepad?
                </h2>
                <p className="text-secondary-theme leading-relaxed text-sm sm:text-base sm:leading-relaxed">
                  A <strong className="font-semibold text-primary-theme">free online notepad</strong> is a lightweight, <strong className="font-semibold text-primary-theme">browser-based text editor</strong> engineered for rapid, frictionless writing with zero account barriers. As an <strong className="font-semibold text-primary-theme">online notepad without login</strong>, it lets you <strong className="font-semibold text-primary-theme">save notes online without account</strong> friction, functioning as an <strong className="font-semibold text-primary-theme">instant online scratchpad for quick notes</strong> directly on your device.
                </p>
                <p className="text-secondary-theme leading-relaxed text-sm sm:text-base sm:leading-relaxed">
                  Operating as a strictly <strong className="font-semibold text-primary-theme">private offline browser notepad</strong>, your thoughts, drafts, and sensitive information are preserved locally via client-side storage—delivering desktop-grade speed without third-party tracking or server dependencies.
                </p>
              </div>

              {/* Scannable Use-Case Highlights */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5 text-left pt-2">
                {/* Card 01: Drafting & Composition */}
                <div className="rounded-2xl p-6 bg-paper-theme border border-subtle-theme shadow-xs flex flex-col justify-between transition-colors">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300 bg-indigo-50/90 dark:bg-indigo-950/60 border border-indigo-200/60 dark:border-indigo-800/50 w-fit">
                      <span className="font-mono text-[10px] text-indigo-500 dark:text-indigo-400">01</span>
                      <span className="opacity-40">·</span>
                      <span>Long-Form</span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-primary-theme tracking-tight">
                        Drafting & Composition
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                        Craft blog drafts, emails, and long-form prose with continuous background autosave.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 02: Code Snippets & Data */}
                <div className="rounded-2xl p-6 bg-paper-theme border border-subtle-theme shadow-xs flex flex-col justify-between transition-colors">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide text-sky-700 dark:text-sky-300 bg-sky-50/90 dark:bg-sky-950/60 border border-sky-200/60 dark:border-sky-800/50 w-fit">
                      <span className="font-mono text-[10px] text-sky-500 dark:text-sky-400">02</span>
                      <span className="opacity-40">·</span>
                      <span>Code & Syntax</span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-primary-theme tracking-tight">
                        Code Snippets & Data
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                        Store command lines, configuration payloads, and formatted text fragments clean of clutter.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 03: Meeting Scratchpad */}
                <div className="rounded-2xl p-6 bg-paper-theme border border-subtle-theme shadow-xs flex flex-col justify-between transition-colors">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide text-emerald-700 dark:text-emerald-300 bg-emerald-50/90 dark:bg-emerald-950/60 border border-emerald-200/60 dark:border-emerald-800/50 w-fit">
                      <span className="font-mono text-[10px] text-emerald-500 dark:text-emerald-400">03</span>
                      <span className="opacity-40">·</span>
                      <span>Quick Capture</span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-primary-theme tracking-tight">
                        Meeting Scratchpad
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                        Capture action items, rapid call memos, and agenda outlines in seconds on any screen.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Card 04: Distraction-Free Writing */}
                <div className="rounded-2xl p-6 bg-paper-theme border border-subtle-theme shadow-xs flex flex-col justify-between transition-colors">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide text-violet-700 dark:text-violet-300 bg-violet-50/90 dark:bg-violet-950/60 border border-violet-200/60 dark:border-violet-800/50 w-fit">
                      <span className="font-mono text-[10px] text-violet-500 dark:text-violet-400">04</span>
                      <span className="opacity-40">·</span>
                      <span>Pure Focus</span>
                    </div>
                    <div className="space-y-1.5">
                      <h3 className="text-base font-bold text-primary-theme tracking-tight">
                        Distraction-Free Writing
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                        Focus on your thoughts in a pure, full-bleed canvas with zero popups or sign-in prompts.
                      </p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Minimalist Capability Pill Strip */}
              <div className="pt-2 flex flex-wrap items-center justify-center gap-2">
                {[
                  'Instant Auto-Save',
                  'Zero Registration',
                  'Client-Side Privacy',
                  'Offline Capable',
                  'Rich Text Controls',
                ].map((pill, idx) => (
                  <span
                    key={idx}
                    className="px-3.5 py-1.5 rounded-full text-xs font-medium text-secondary-theme bg-slate-100/80 dark:bg-slate-800/50"
                  >
                    {pill}
                  </span>
                ))}
              </div>
            </section>

            {/* Cross-Device & Mobile Responsiveness Showcase */}
            <MobileShowcaseSection />

            {/* Section 2: Key Features Bento Grid */}
            <section className="space-y-5 sm:space-y-6">
              <div className="text-center space-y-1.5 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme text-balance">
                  {t.keyFeaturesTitle}
                </h2>
                <p className="text-xs sm:text-sm text-secondary-theme">
                  {t.keyFeaturesSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3.5 sm:gap-4 auto-rows-fr items-stretch">
                {/* Card 1: Continuous Auto-Save Browser Notepad */}
                <div className="h-full p-5 rounded-2xl border border-subtle-theme bg-paper-theme hover:border-purple-500/30 transition-all duration-150 flex flex-col justify-start gap-2">
                  <h3 className="text-base font-bold text-primary-theme tracking-tight">Continuous Auto-Save Browser Notepad</h3>
                  <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                    Auto-saving text editor with real-time local storage persistence and zero draft loss across tab reloads, crashes, or sudden battery dropouts.
                  </p>
                </div>

                {/* Card 2: Live Word Counter & Character Calculator */}
                <div className="h-full p-5 rounded-2xl border border-subtle-theme bg-paper-theme hover:border-purple-500/30 transition-all duration-150 flex flex-col justify-start gap-2">
                  <h3 className="text-base font-bold text-primary-theme tracking-tight">Live Word Counter & Character Calculator</h3>
                  <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                    Real-time word count tracker, character counter notepad, and live reading time estimator updating instantly with zero typing latency.
                  </p>
                </div>

                {/* Card 3: 100% Private Client-Side Note Taking */}
                <div className="h-full p-5 rounded-2xl border border-subtle-theme bg-paper-theme hover:border-purple-500/30 transition-all duration-150 flex flex-col justify-start gap-2">
                  <h3 className="text-base font-bold text-primary-theme tracking-tight">100% Private Client-Side Note Taking</h3>
                  <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                    Private offline notepad with zero cloud tracking and sandboxed local security. Notes never leave your device or touch external servers.
                  </p>
                </div>

                {/* Card 4: Rich Text Formatting & Ruled Stationery */}
                <div className="h-full p-5 rounded-2xl border border-subtle-theme bg-paper-theme hover:border-purple-500/30 transition-all duration-150 flex flex-col justify-start gap-2">
                  <h3 className="text-base font-bold text-primary-theme tracking-tight">Rich Text Formatting & Ruled Stationery</h3>
                  <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                    Distraction-free writing space featuring a markdown styling toolbar, checklist generator, inline code, and authentic lined paper stationery.
                  </p>
                </div>

                {/* Full-Cover Browser Visual Container */}
                <div className="h-full min-h-[170px] sm:min-h-0 rounded-2xl border border-subtle-theme bg-paper-theme overflow-hidden relative shadow-xs group">
                  <img
                    src="/nologin-notepad-browser.jfif"
                    alt="NoLoginNotepad Browser Workspace"
                    className="w-full h-full object-cover object-top block absolute inset-0"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/25 via-transparent to-transparent pointer-events-none" />
                </div>

                {/* Card 5: Multi-Tab Note Manager & Instant Export */}
                <div className="h-full p-5 rounded-2xl border border-subtle-theme bg-paper-theme hover:border-purple-500/30 transition-all duration-150 flex flex-col justify-start gap-2">
                  <h3 className="text-base font-bold text-primary-theme tracking-tight">Multi-Tab Note Manager & Instant Export</h3>
                  <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                    Tabbed scratchpad organizer with one-click plain text download and markdown document export (.txt and .md) without platform lock-in.
                  </p>
                </div>
              </div>
            </section>

            {/* Section 3: Why Use NoLoginNotepad? Modern Bento Grid */}
            <section className="space-y-8">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme text-balance">
                  {t.whyUseTitle}
                </h2>
                <p className="text-xs sm:text-sm text-secondary-theme">
                  {t.whyUseSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-5">
                {/* Hero Feature Card: Spans 2 columns on lg */}
                <div className="lg:col-span-2 p-6 sm:p-7 rounded-2xl border border-subtle-theme bg-paper-theme shadow-xs flex flex-col justify-between gap-6 transition-colors">
                  <div className="space-y-3">
                    <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-semibold tracking-wide text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200/60 dark:border-indigo-800/50 w-fit">
                      <span>Zero Friction Guarantee</span>
                    </div>
                    <div className="space-y-2">
                      <h3 className="text-lg sm:text-xl font-bold text-primary-theme tracking-tight">
                        Zero Accounts & 100% Client-Side Privacy
                      </h3>
                      <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed max-w-2xl">
                        Traditional note apps force user registration, sync your drafts to external servers, and lock features behind paywalls. NoLoginNotepad eliminates all hurdles—providing an immediate, sandboxed browser scratchpad where your text never leaves your device.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-subtle-theme">
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#141824]/60 space-y-1">
                      <span className="text-[11px] font-medium text-secondary-theme">Account Requirement</span>
                      <p className="text-xs font-semibold text-primary-theme">Zero sign-in or emails</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#141824]/60 space-y-1">
                      <span className="text-[11px] font-medium text-secondary-theme">Data Ownership</span>
                      <p className="text-xs font-semibold text-primary-theme">100% local IndexedDB</p>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50/70 dark:bg-[#141824]/60 space-y-1">
                      <span className="text-[11px] font-medium text-secondary-theme">Cloud Tracking</span>
                      <p className="text-xs font-semibold text-primary-theme">Zero tracking scripts</p>
                    </div>
                  </div>
                </div>

                {/* Full-Bleed Square Visual */}
                <div className="w-full aspect-square rounded-2xl overflow-hidden relative">
                  <img
                    src="/nologin-notepad-square-logo.jfif"
                    alt="NoLoginNotepad Square Logo"
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </div>

                {/* Card 2: Instant Launch Velocity */}
                <div className="p-6 rounded-2xl border border-subtle-theme bg-paper-theme shadow-xs flex flex-col justify-between gap-5 transition-colors">
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Launch Velocity
                    </span>
                    <h3 className="text-base font-bold text-primary-theme leading-snug">
                      {t.featInstantLoad}
                    </h3>
                    <p className="text-xs text-secondary-theme leading-relaxed">
                      Zero multi-megabyte app bundles or startup spinners. Opens instantly in under 50ms, ready for immediate typing whenever inspiration strikes.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-subtle-theme flex items-center justify-between text-xs text-secondary-theme">
                    <span>Performance Target</span>
                    <span className="font-semibold text-primary-theme">&lt; 50ms Direct Render</span>
                  </div>
                </div>

                {/* Card 3: Continuous Auto-Save */}
                <div className="p-6 rounded-2xl border border-subtle-theme bg-paper-theme shadow-xs flex flex-col justify-between gap-5 transition-colors">
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Persistence
                    </span>
                    <h3 className="text-base font-bold text-primary-theme leading-snug">
                      {t.featAutoSave}
                    </h3>
                    <p className="text-xs text-secondary-theme leading-relaxed">
                      Every keystroke is automatically captured with intelligent background debouncing. Tab crashes, battery loss, and browser exits never discard your work.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-subtle-theme flex items-center justify-between text-xs text-secondary-theme">
                    <span>Saving Mechanism</span>
                    <span className="font-semibold text-primary-theme">Non-Blocking Auto-Save</span>
                  </div>
                </div>

                {/* Card 4: Paper & Eye-Care Themes */}
                <div className="p-6 rounded-2xl border border-subtle-theme bg-paper-theme shadow-xs flex flex-col justify-between gap-5 transition-colors">
                  <div className="space-y-2.5">
                    <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Eye-Care Stationery
                    </span>
                    <h3 className="text-base font-bold text-primary-theme leading-snug">
                      {t.featEyeCare}
                    </h3>
                    <p className="text-xs text-secondary-theme leading-relaxed">
                      Switch seamlessly between warm ivory digital stationery, obsidian dark mode, ruled notebook lines, and grid paper patterns designed for comfortable long sessions.
                    </p>
                  </div>
                  <div className="pt-3 border-t border-subtle-theme flex items-center justify-between text-xs text-secondary-theme">
                    <span>Display Modes</span>
                    <span className="font-semibold text-primary-theme">Warm Paper & Obsidian</span>
                  </div>
                </div>

                {/* Card 5: Cross-Device Agility */}
                <div className="md:col-span-2 lg:col-span-3 p-6 sm:p-7 rounded-2xl border border-subtle-theme bg-paper-theme shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-6 transition-colors">
                  <div className="space-y-2 max-w-2xl">
                    <span className="text-[11px] font-mono font-semibold text-indigo-600 dark:text-indigo-400 uppercase tracking-wider">
                      Cross-Device Agility
                    </span>
                    <h3 className="text-base sm:text-lg font-bold text-primary-theme leading-snug">
                      {t.featAllDevices}
                    </h3>
                    <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                      Fluid responsive layout adapts dynamically across mobile phones, tablets, and full-screen desktop monitors with touch-optimized controls and zero viewport shifts.
                    </p>
                  </div>
                  <div className="sm:text-right shrink-0 pt-3 sm:pt-0 border-t sm:border-t-0 sm:border-l border-subtle-theme sm:pl-6 space-y-1">
                    <span className="text-[11px] font-medium text-secondary-theme block">Ecosystem</span>
                    <span className="text-sm font-semibold text-primary-theme">Universal Browser Access</span>
                  </div>
                </div>
              </div>
            </section>

            {/* Section 4: How to Use Workflow Grid */}
            <section className="space-y-8">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme text-balance">
                  {t.howToTitle}
                </h2>
                <p className="text-xs sm:text-sm text-secondary-theme">
                  {t.howToSubtitle}
                </p>
              </div>

              {/* Landscape Visual Card */}
              <div className="rounded-2xl border border-subtle-theme bg-paper-theme overflow-hidden shadow-xs relative max-w-5xl mx-auto">
                <div className="aspect-[16/8] sm:aspect-[21/9] w-full relative overflow-hidden bg-slate-900">
                  <img
                    src="/nologin-notepad-logo-cursor.jfif"
                    alt="How to use NoLoginNotepad - Desktop launcher"
                    className="w-full h-full object-cover block"
                    loading="lazy"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                {[
                  { num: '01', title: t.step1Title, desc: t.step1Desc },
                  { num: '02', title: t.step2Title, desc: t.step2Desc },
                  { num: '03', title: t.step3Title, desc: t.step3Desc },
                  { num: '04', title: t.step4Title, desc: t.step4Desc },
                  { num: '05', title: t.step5Title, desc: t.step5Desc },
                ].map((step) => (
                  <div
                    key={step.num}
                    className="p-5 rounded-2xl border border-subtle-theme bg-paper-theme flex flex-col justify-between gap-4 hover:border-indigo-500/30 transition-colors"
                  >
                    <span className="font-mono text-xs font-bold text-indigo-600 dark:text-indigo-400 tabular-nums">
                      {step.num}.
                    </span>
                    <div className="space-y-1.5">
                      <h3 className="text-sm font-bold text-primary-theme">{step.title}</h3>
                      <p className="text-xs text-secondary-theme leading-relaxed">{step.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </section>

            {/* Section 5: Frequently Asked Questions */}
            <section className="space-y-8 max-w-5xl mx-auto">
              <div className="text-center space-y-2 max-w-xl mx-auto">
                <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-primary-theme text-balance">
                  {t.faqTitle}
                </h2>
                <p className="text-xs sm:text-sm text-secondary-theme">
                  {t.faqSubtitle}
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start">
                {[
                  { q: t.faq1Q, a: t.faq1A },
                  { q: t.faq2Q, a: t.faq2A },
                  { q: t.faq3Q, a: t.faq3A },
                  { q: t.faq4Q, a: t.faq4A },
                  { q: t.faq5Q, a: t.faq5A },
                  { q: t.faq6Q, a: t.faq6A },
                  { q: t.faq7Q, a: t.faq7A },
                  { q: t.faq8Q, a: t.faq8A },
                ].map((item, idx) => {
                  const isOpen = openFaq === idx;
                  return (
                    <div
                      key={idx}
                      className={`rounded-2xl border transition-all overflow-hidden bg-paper-theme ${
                        isOpen
                          ? 'border-indigo-500/30 ring-1 ring-indigo-500/10'
                          : 'border-subtle-theme hover:border-slate-300 dark:hover:border-slate-700'
                      }`}
                    >
                      <button
                        type="button"
                        onClick={() => setOpenFaq(isOpen ? null : idx)}
                        className="w-full px-5 sm:px-6 py-4 text-left flex items-center justify-between gap-3 text-sm font-bold text-primary-theme cursor-pointer"
                        aria-expanded={isOpen}
                      >
                        <span className="leading-snug">{item.q}</span>
                        <ChevronDown
                          className={`w-4 h-4 text-secondary-theme shrink-0 transition-transform duration-200 ${
                            isOpen ? 'rotate-180 text-indigo-600 dark:text-indigo-400' : ''
                          }`}
                        />
                      </button>
                      {isOpen && (
                        <div className="px-5 sm:px-6 pb-5 text-xs sm:text-sm text-secondary-theme leading-relaxed border-t border-subtle-theme pt-3.5 animate-in fade-in duration-150">
                          {item.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </section>

            {/* Section 6: Dynamic pSEO Editorial Section */}
            {infoSection && (
              <section id="pseo-editorial-section" className="pt-12 border-t border-subtle-theme space-y-6">
                <div className="space-y-2">
                  <div className="inline-flex items-center gap-2 text-xs font-semibold text-indigo-600 dark:text-indigo-400">
                    <BookOpen className="w-3.5 h-3.5" />
                    <span>Stationery Feature Guide</span>
                  </div>
                  <h2 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-theme">
                    {infoSection.heading}
                  </h2>
                </div>
                {infoSection.paragraphs.map((p, idx) => (
                  <p key={idx} className="text-secondary-theme leading-relaxed text-sm sm:text-base">
                    {p}
                  </p>
                ))}

                <div className="pt-6 border-t border-subtle-theme space-y-3">
                  <h3 className="text-xs font-bold text-primary-theme">
                    Explore Other Notepad Tools
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {ALL_PSEO_SLUGS.map((slugKey) => {
                      const item = PSEO_PAGES[slugKey];
                      if (!item) return null;
                      const isActive = slugKey === initialSlug;
                      const label = item.badge || (item.h1 ? item.h1.split('—')[0].trim() : item.title || slugKey);
                      return (
                        <Link
                          key={slugKey}
                          href={`/${slugKey}`}
                          className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                            isActive
                              ? 'bg-indigo-600 text-white'
                              : 'border border-subtle-theme bg-paper-theme hover:border-indigo-500/30 text-secondary-theme hover:text-primary-theme'
                          }`}
                        >
                          {label}
                        </Link>
                      );
                    })}
                  </div>
                </div>
              </section>
            )}
          </div>
        </div>
      )}

      {!isFullscreen && (
        <Footer
          currentLang={lang}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExportImport={() => handleOpenExportImport('export')}
        />
      )}

      {/* Back-to-Top Floating Button */}
      <button
        id="back-to-top-btn"
        type="button"
        onClick={scrollToTop}
        className={`fixed z-40 w-11 h-11 rounded-full bg-white dark:bg-[#1E2330] text-slate-700 dark:text-slate-200 border border-slate-200/90 dark:border-slate-700/80 shadow-xl flex items-center justify-center transition-all duration-200 cursor-pointer hover:bg-slate-50 dark:hover:bg-[#272F40] hover:text-indigo-600 dark:hover:text-indigo-400 bottom-6 right-6 ${
          showBackToTop ? 'opacity-100 pointer-events-auto translate-y-0' : 'opacity-0 pointer-events-none translate-y-3'
        }`}
        title="Back to top"
        aria-label="Back to top"
      >
        <ArrowUp className="w-5 h-5 stroke-[2.2]" />
      </button>

      <OfflineIndicator forceHighlighted={highlightOffline} />

      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        preferences={preferences}
        currentLang={lang}
        onUpdatePreferences={handleUpdatePreferences}
        onOpenResetAll={() => setIsResetAllOpen(true)}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
        initialTab={exportImportTab}
        activeNote={activeNote}
        allNotes={notes}
        preferences={preferences}
        onImportSuccess={handleImportSuccess}
      />

      <PrivacyModal
        isOpen={isPrivacyOpen}
        onClose={() => setIsPrivacyOpen(false)}
        notesCount={notes.length}
      />

      <DeleteConfirmModal
        isOpen={!!noteToDelete}
        note={noteToDelete}
        onClose={() => setNoteToDelete(null)}
        onConfirm={handleDeleteNoteConfirm}
      />

      <ResetAllModal
        isOpen={isResetAllOpen}
        notesCount={notes.length}
        onClose={() => setIsResetAllOpen(false)}
        onConfirmReset={handleResetAllData}
        onDownloadBackup={() => exportAllNotesBackup(notes, preferences)}
      />

      <KeyboardShortcutsModal
        isOpen={isShortcutsOpen}
        onClose={() => setIsShortcutsOpen(false)}
      />
    </div>
  );
}

export default NotepadApp;
