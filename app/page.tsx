'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Note, UserPreferences, ThemeMode } from '@/types/note';
import { noteRepository } from '@/lib/storage/note-repository';
import { preferencesRepository, DEFAULT_PREFERENCES } from '@/lib/storage/preferences-repository';
import {
  calculateTextStats,
  createNewNote,
  getNextUntitledTitle,
  stripHtmlToPlainText,
} from '@/lib/services/note-service';
import { TopToolbar } from '@/components/TopToolbar';
import { Editor } from '@/components/Editor';
import { Sidebar } from '@/components/Sidebar';
import { SettingsModal } from '@/components/SettingsModal';
import { ExportImportModal } from '@/components/ExportImportModal';
import { PrivacyModal } from '@/components/PrivacyModal';
import { DeleteConfirmModal } from '@/components/DeleteConfirmModal';
import { ResetAllModal } from '@/components/ResetAllModal';
import { KeyboardShortcutsModal } from '@/components/KeyboardShortcutsModal';
import { OfflineIndicator } from '@/components/OfflineIndicator';
import { Footer } from '@/components/Footer';
import { resetAllApplicationData } from '@/lib/storage/reset-service';
import { exportAllNotesBackup, exportNoteAsTxt } from '@/lib/utils/export-import';

export default function NotepadPage() {
  // Application State
  const [notes, setNotes] = useState<Note[]>([]);
  const [activeNoteId, setActiveNoteId] = useState<string | null>(null);
  const [preferences, setPreferences] = useState<UserPreferences>(DEFAULT_PREFERENCES);
  const [saveStatus, setSaveStatus] = useState<'saved' | 'saving' | 'error'>('saved');
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  // Modals
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isExportImportOpen, setIsExportImportOpen] = useState(false);
  const [isPrivacyOpen, setIsPrivacyOpen] = useState(false);
  const [isShortcutsOpen, setIsShortcutsOpen] = useState(false);
  const [noteToDelete, setNoteToDelete] = useState<Note | null>(null);
  const [isResetAllOpen, setIsResetAllOpen] = useState(false);

  // Debounce save ref
  const saveTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const activeNoteRef = useRef<Note | null>(null);
  const preferencesRef = useRef<UserPreferences>(DEFAULT_PREFERENCES);

  // Active Note Computation
  const activeNote = notes.find((n) => n.id === activeNoteId) || null;

  useEffect(() => {
    activeNoteRef.current = activeNote;
  }, [activeNote]);

  useEffect(() => {
    preferencesRef.current = preferences;
  }, [preferences]);

  // Apply Theme directly to the HTML document root & body
  const applyTheme = useCallback((theme: ThemeMode) => {
    if (typeof document === 'undefined') return;
    const root = document.documentElement;

    let targetTheme: 'light' | 'dark' | 'sepia' = 'light';
    if (theme === 'system') {
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      targetTheme = prefersDark ? 'dark' : 'light';
    } else {
      targetTheme = theme;
    }

    root.setAttribute('data-theme', targetTheme);
    root.classList.toggle('dark', targetTheme === 'dark');

    const appRoot = document.getElementById('notepad-app-root');
    if (appRoot) {
      appRoot.setAttribute('data-theme', targetTheme);
    }
  }, []);

  // Listen for system theme changes if preferences.theme is system
  useEffect(() => {
    if (preferences.theme !== 'system') return;
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => applyTheme('system');
    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [preferences.theme, applyTheme]);

  // Handle Live Theme Preview from Settings modal
  const handleLivePreviewTheme = useCallback(
    (theme: ThemeMode) => {
      applyTheme(theme);
    },
    [applyTheme]
  );

  // Revert Live Theme Preview back to user's saved preferences
  const handleRevertLiveTheme = useCallback(() => {
    applyTheme(preferencesRef.current.theme);
  }, [applyTheme]);

  // Initial Bootstrapping: Load preferences and notes from IndexedDB
  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        // 1. Load preferences
        const savedPrefs = await preferencesRepository.getPreferences();
        if (isMounted) {
          setPreferences(savedPrefs);
          applyTheme(savedPrefs.theme);
        }

        // 2. Load notes
        const allNotes = await noteRepository.getAllNotes();
        const lastActiveId = await noteRepository.getLastActiveNoteId();

        if (allNotes.length > 0) {
          if (isMounted) {
            const normalizedNotes = allNotes.map((n) =>
              n.title === 'Untitled Note' ? { ...n, title: 'Untitled Note 1' } : n
            );
            const targetNote = normalizedNotes.find((n) => n.id === lastActiveId) || normalizedNotes[0];
            
            // Extra safety recovery check from quick scratch
            try {
              const quickScratch = localStorage.getItem('notepad_quick_scratch');
              const lastActive = localStorage.getItem('notepad_last_active_id');
              if (targetNote && !targetNote.content && quickScratch && lastActive === targetNote.id) {
                targetNote.content = quickScratch;
                noteRepository.saveNoteSync(targetNote);
              }
            } catch {}

            setNotes(normalizedNotes);
            setActiveNoteId(targetNote.id);
            activeNoteRef.current = targetNote;
          }
        } else {
          // First time user opens the site: exactly ONE clean pad will be open
          const initialNote = createNewNote(undefined, '', savedPrefs.pageStyle, []);
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
        const fallbackNote = createNewNote(undefined, '', undefined, []);
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
  }, [applyTheme]);

  // Remove any Next.js development indicator / toast badge from bottom left
  useEffect(() => {
    const purgeDevIndicators = () => {
      const targets = document.querySelectorAll(
        'nextjs-portal, [data-nextjs-toast], [data-nextjs-dev-indicator], #nextjs-dev-overlay'
      );
      targets.forEach((el) => {
        (el as HTMLElement).style.display = 'none';
        el.remove();
      });
    };

    purgeDevIndicators();
    const interval = setInterval(purgeDevIndicators, 500);
    return () => clearInterval(interval);
  }, []);

  // Synchronous flush on page exit or tab switch to prevent any data loss
  useEffect(() => {
    const handleFlushOnExit = () => {
      if (activeNoteRef.current) {
        try {
          noteRepository.saveNoteSync(activeNoteRef.current);
          localStorage.setItem('notepad_quick_scratch', activeNoteRef.current.content);
          localStorage.setItem('notepad_last_active_id', activeNoteRef.current.id);
        } catch {
          // LocalStorage quota or safety fallback
        }
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

  // Listen to browser Fullscreen change events
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  // Toggle Full Screen (with fallback if iframe denies requestFullscreen)
  const handleToggleFullScreen = useCallback(async () => {
    try {
      if (!document.fullscreenElement) {
        if (document.documentElement.requestFullscreen) {
          await document.documentElement.requestFullscreen();
          setIsFullscreen(true);
        } else {
          // Fallback UI fullscreen
          setIsFullscreen((prev) => !prev);
        }
      } else {
        if (document.exitFullscreen) {
          await document.exitFullscreen();
        }
        setIsFullscreen(false);
      }
    } catch (err) {
      console.warn('Fullscreen API unavailable or blocked in iframe, toggling Zen View:', err);
      setIsFullscreen((prev) => !prev);
    }
  }, []);

  // Instant Save handler (triggered via Ctrl+S or menu)
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
      } catch {
        // ignore
      }
      setSaveStatus('saved');
    } catch (err) {
      console.error('[Save] Instant save failed:', err);
      setSaveStatus('error');
    }
  }, [activeNote]);

  // Content Change with In-Memory Update & Instant LocalStorage + Debounced IndexedDB
  const handleContentChange = useCallback(
    (newContent: string) => {
      if (!activeNoteId) return;

      const now = Date.now();
      const stats = calculateTextStats(newContent);
      let updatedNoteToSave: Note | null = null;

      setNotes((prevNotes) => {
        return prevNotes.map((note) => {
          if (note.id !== activeNoteId) return note;

          // Do not extract the first word from content; preserve title or use next untitled note
          const currentTitle =
            note.title && note.title.trim()
              ? note.title
              : getNextUntitledTitle(prevNotes);

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

        // 1. Instant zero-latency synchronous write to localStorage
        noteRepository.saveNoteSync(noteToSave);
        try {
          localStorage.setItem('notepad_quick_scratch', newContent);
          localStorage.setItem('notepad_last_active_id', activeNoteId);
        } catch {}

        // 2. Debounced asynchronous write to IndexedDB
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

  // File import handler (e.g. dragged & dropped .txt or imported file)
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
            (note.title && note.title.trim()
              ? note.title
              : getNextUntitledTitle(prevNotes));
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

  // Update Note Title
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

  // Switch Active Note
  const handleSelectNote = useCallback(async (id: string) => {
    if (activeNoteRef.current) {
      await noteRepository.saveNote(activeNoteRef.current);
    }
    setActiveNoteId(id);
    await noteRepository.setLastActiveNoteId(id);
    setSaveStatus('saved');
  }, []);

  // Create New Note
  const handleCreateNewNote = useCallback(async () => {
    if (activeNoteRef.current) {
      await noteRepository.saveNote(activeNoteRef.current);
    }
    const newNote = createNewNote(undefined, '', preferences.pageStyle, notes);
    await noteRepository.saveNote(newNote);
    await noteRepository.setLastActiveNoteId(newNote.id);

    setNotes((prev) => [newNote, ...prev]);
    setActiveNoteId(newNote.id);
    setSaveStatus('saved');
  }, [preferences.pageStyle, notes]);

  // Delete Note Confirmation
  const handleDeleteNoteConfirm = useCallback(async () => {
    if (!noteToDelete) return;
    const targetId = noteToDelete.id;
    await noteRepository.deleteNote(targetId);

    setNotes((prev) => {
      const remaining = prev.filter((n) => n.id !== targetId);
      if (remaining.length === 0) {
        const fresh = createNewNote(undefined, '', preferences.pageStyle, []);
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

    setNoteToDelete(null);
  }, [noteToDelete, activeNoteId, preferences.pageStyle]);

  // Toggle Pin Note
  const handleTogglePin = useCallback(async (note: Note) => {
    const updated: Note = { ...note, isPinned: !note.isPinned };
    await noteRepository.saveNote(updated);
    setNotes((prev) => prev.map((n) => (n.id === note.id ? updated : n)));
  }, []);

  // Update and Persist User Preferences
  const handleUpdatePreferences = useCallback(
    async (updates: Partial<UserPreferences>) => {
      const updated = await preferencesRepository.savePreferences(updates);
      setPreferences(updated);
      if (updates.theme) {
        applyTheme(updated.theme);
      }
    },
    [applyTheme]
  );

  // Import Notes Callback
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

  // Complete Clean / Delete All History, Notes, and Settings
  const handleResetAllData = useCallback(async () => {
    try {
      if (saveTimeoutRef.current) {
        clearTimeout(saveTimeoutRef.current);
      }
      const { initialNote, defaultPreferences } = await resetAllApplicationData();
      setNotes([initialNote]);
      setActiveNoteId(initialNote.id);
      setPreferences(defaultPreferences);
      applyTheme(defaultPreferences.theme);
      setSaveStatus('saved');
      setIsResetAllOpen(false);
      setIsSettingsOpen(false);
      setIsSidebarOpen(false);
    } catch (err) {
      console.error('[Reset] Failed to clean all application data:', err);
    }
  }, [applyTheme]);

  // Global Keyboard Shortcuts (Ctrl+N, Ctrl+S, Ctrl+\, F11, Esc)
  useEffect(() => {
    const handleGlobalKeyDown = (e: KeyboardEvent) => {
      const isMac = typeof window !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent);
      const hasMod = isMac ? e.metaKey : e.ctrlKey;

      // Ctrl/Cmd + N: New Note
      if (hasMod && e.key.toLowerCase() === 'n' && !e.shiftKey) {
        e.preventDefault();
        handleCreateNewNote();
        return;
      }

      // Ctrl/Cmd + S: Trigger file download (prevent default browser save dialog)
      if (hasMod && e.key.toLowerCase() === 's' && !e.shiftKey) {
        e.preventDefault();
        if (activeNoteRef.current) {
          exportNoteAsTxt(activeNoteRef.current);
        }
        return;
      }

      // Ctrl/Cmd + Shift + C: Copy all text to clipboard
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

      // Ctrl/Cmd + \: Toggle Sidebar
      if (hasMod && e.key === '\\') {
        e.preventDefault();
        setIsSidebarOpen((prev) => !prev);
        return;
      }

      // F11: Full screen
      if (e.key === 'F11') {
        e.preventDefault();
        handleToggleFullScreen();
        return;
      }

      // Escape key: Close modals or exit full screen
      if (e.key === 'Escape') {
        if (isSettingsOpen) {
          handleRevertLiveTheme();
          setIsSettingsOpen(false);
        } else if (isResetAllOpen) setIsResetAllOpen(false);
        else if (isExportImportOpen) setIsExportImportOpen(false);
        else if (isPrivacyOpen) setIsPrivacyOpen(false);
        else if (isShortcutsOpen) setIsShortcutsOpen(false);
        else if (noteToDelete) setNoteToDelete(null);
        else if (isSidebarOpen) setIsSidebarOpen(false);
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
    isSidebarOpen,
    isFullscreen,
  ]);

  return (
    <div
      id="notepad-app-root"
      className="min-h-screen flex flex-col bg-app-theme text-primary-theme relative overflow-x-hidden"
    >
      {/* Top Toolbar / Navigation Bar */}
      <TopToolbar
        note={activeNote}
        saveStatus={saveStatus}
        notesCount={notes.length}
        isFullscreen={isFullscreen}
        onToggleSidebar={() => setIsSidebarOpen((prev) => !prev)}
        onCreateNewNote={handleCreateNewNote}
        onUpdateTitle={handleUpdateTitle}
        onToggleFullScreen={handleToggleFullScreen}
        onOpenSettings={() => setIsSettingsOpen(true)}
        onOpenExportImport={() => setIsExportImportOpen(true)}
        onOpenShortcuts={() => setIsShortcutsOpen(true)}
        onOpenPrivacy={() => setIsPrivacyOpen(true)}
        onDeleteNote={() => activeNote && setNoteToDelete(activeNote)}
        onOpenResetAll={() => setIsResetAllOpen(true)}
      />

      {/* Main Body Area (Writing canvas + optional sidebar) */}
      <div className="flex-1 flex relative w-full overflow-hidden">
        {/* Notes Sidebar Drawer */}
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
          notes={notes}
          activeNoteId={activeNoteId}
          onSelectNote={handleSelectNote}
          onCreateNewNote={handleCreateNewNote}
          onDeleteNote={(note) => setNoteToDelete(note)}
          onTogglePin={handleTogglePin}
          onOpenExportImport={() => setIsExportImportOpen(true)}
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenResetAll={() => setIsResetAllOpen(true)}
        />

        {/* Primary Writing Area */}
        {activeNote ? (
          <Editor
            key={activeNote.id}
            note={activeNote}
            preferences={preferences}
            onContentChange={handleContentChange}
            onInstantSave={handleInstantSave}
            onImportFile={handleImportFile}
            onDownloadFile={() => activeNote && exportNoteAsTxt(activeNote)}
            onUpdatePreferences={handleUpdatePreferences}
          />
        ) : (
          <div className="flex-1 flex items-center justify-center p-8 text-secondary-theme">
            <p>Loading note...</p>
          </div>
        )}
      </div>

      {/* Quick Access & Directory Footer */}
      {!isFullscreen && (
        <Footer
          onOpenPrivacy={() => setIsPrivacyOpen(true)}
          onOpenShortcuts={() => setIsShortcutsOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenExportImport={() => setIsExportImportOpen(true)}
        />
      )}

      {/* Offline Status Indicator */}
      <OfflineIndicator />

      {/* Modals */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => {
          handleRevertLiveTheme();
          setIsSettingsOpen(false);
        }}
        preferences={preferences}
        onUpdatePreferences={handleUpdatePreferences}
        onLivePreviewTheme={handleLivePreviewTheme}
        onRevertLiveTheme={handleRevertLiveTheme}
        onOpenResetAll={() => setIsResetAllOpen(true)}
      />

      <ExportImportModal
        isOpen={isExportImportOpen}
        onClose={() => setIsExportImportOpen(false)}
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
