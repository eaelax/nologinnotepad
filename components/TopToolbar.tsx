'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  Menu,
  Plus,
  Settings,
  Maximize2,
  Minimize2,
  Check,
  Loader2,
  MoreVertical,
  Download,
  Upload,
  Trash2,
  HelpCircle,
  Shield,
} from 'lucide-react';
import { Note } from '@/types/note';
import { PWAInstallButton } from './PWAInstallButton';
import { AppLogo } from './AppLogo';

interface TopToolbarProps {
  note: Note | null;
  saveStatus: 'saved' | 'saving' | 'error';
  notesCount: number;
  isFullscreen: boolean;
  onToggleSidebar: () => void;
  onCreateNewNote: () => void;
  onUpdateTitle: (title: string) => void;
  onToggleFullScreen: () => void;
  onOpenSettings: () => void;
  onOpenExportImport: () => void;
  onOpenShortcuts: () => void;
  onOpenPrivacy: () => void;
  onDeleteNote: () => void;
  onOpenResetAll?: () => void;
}

const TopToolbarComponent: React.FC<TopToolbarProps> = ({
  note,
  saveStatus,
  notesCount,
  isFullscreen,
  onToggleSidebar,
  onCreateNewNote,
  onUpdateTitle,
  onToggleFullScreen,
  onOpenSettings,
  onOpenExportImport,
  onOpenShortcuts,
  onOpenPrivacy,
  onDeleteNote,
  onOpenResetAll,
}) => {
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [tempTitle, setTempTitle] = useState(note?.title || '');
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const titleInputRef = useRef<HTMLInputElement>(null);
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
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  const handleTitleSubmit = () => {
    const cleanTitle = tempTitle.trim() || note?.title || 'Untitled Note 1';
    setIsEditingTitle(false);
    if (cleanTitle !== note?.title) {
      onUpdateTitle(cleanTitle);
    }
  };

  const handleStartEditing = () => {
    setTempTitle(note?.title || 'Untitled Note 1');
    setIsEditingTitle(true);
  };

  return (
    <header
      id="notepad-top-toolbar"
      className="h-13 border-b border-subtle-theme bg-toolbar-theme px-3 sm:px-4 flex items-center justify-between gap-2 z-30 shrink-0 select-none text-primary-theme"
    >
      {/* Left controls: Logo, Notes Drawer, New Note, Title */}
      <div className="flex items-center gap-1.5 sm:gap-2.5 min-w-0 flex-1">
        {/* Logo & brand */}
        <div
          className="flex items-center gap-1.5 sm:gap-2 cursor-pointer pr-1 shrink-0"
          onClick={onToggleSidebar}
          title="Open Notes Directory"
        >
          <AppLogo size={28} />
          <h1 className="font-bold text-xs sm:text-sm tracking-tight hidden min-[360px]:inline text-primary-theme">
            NoLoginNotepad
          </h1>
        </div>

        <div className="h-4 w-px border-r border-subtle-theme hidden sm:block mx-0.5" />

        {/* Sidebar notes directory button */}
        <button
          id="sidebar-toggle-btn"
          onClick={onToggleSidebar}
          className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition relative"
          title="All Notes (Ctrl+\)"
          aria-label="Toggle notes directory"
        >
          <Menu className="w-4 h-4" />
          {notesCount > 1 && (
            <span className="absolute -top-0.5 -right-0.5 min-w-3.5 h-3.5 px-0.5 rounded-full btn-primary-theme text-[9px] font-bold flex items-center justify-center">
              {notesCount > 99 ? '99+' : notesCount}
            </span>
          )}
        </button>

        {/* New Note button */}
        <button
          id="new-note-btn"
          onClick={onCreateNewNote}
          className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-card-theme hover:bg-card-selected-theme border border-subtle-theme text-primary-theme text-xs font-medium transition shrink-0"
          title="Create New Blank Note (Ctrl+N)"
        >
          <Plus className="w-3.5 h-3.5" />
          <span className="hidden sm:inline">New Note</span>
        </button>

        {/* Title Input / Display */}
        <div className="min-w-0 flex-1 max-w-xs sm:max-w-md">
          {isEditingTitle ? (
            <input
              ref={titleInputRef}
              type="text"
              value={tempTitle}
              onChange={(e) => setTempTitle(e.target.value)}
              onBlur={handleTitleSubmit}
              onKeyDown={(e) => {
                if (e.key === 'Enter') handleTitleSubmit();
                if (e.key === 'Escape') {
                  setTempTitle(note?.title || 'Untitled Note 1');
                  setIsEditingTitle(false);
                }
              }}
              className="w-full bg-paper-theme border border-subtle-theme px-2 py-0.5 rounded text-xs sm:text-sm font-semibold text-primary-theme focus:outline-none focus:ring-1 focus:ring-stone-400"
            />
          ) : (
            <button
              onClick={handleStartEditing}
              className="w-full text-left truncate text-xs sm:text-sm font-semibold text-primary-theme hover:opacity-80 transition px-1 py-0.5 rounded hover:bg-card-theme flex items-center gap-1"
              title="Click to rename note"
            >
              <span className="truncate">{note?.title || 'Untitled Note 1'}</span>
            </button>
          )}
        </div>

        {/* Autosave status badge */}
        <div className="hidden xs:flex items-center gap-1 text-[11px] text-secondary-theme shrink-0">
          {saveStatus === 'saving' ? (
            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
              <Loader2 className="w-3 h-3 animate-spin" />
              <span className="hidden md:inline">Saving…</span>
            </span>
          ) : saveStatus === 'saved' ? (
            <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400">
              <Check className="w-3 h-3" />
              <span className="hidden md:inline">Saved</span>
            </span>
          ) : (
            <span className="text-red-500">Unsaved</span>
          )}
        </div>
      </div>

      {/* Right controls: Full Screen, Settings, More */}
      <div className="flex items-center gap-1 sm:gap-1.5 shrink-0">
        {/* True Full Screen Toggle */}
        <button
          id="fullscreen-toggle-btn"
          onClick={onToggleFullScreen}
          className={`p-1.5 rounded-lg transition ${
            isFullscreen
              ? 'btn-primary-theme'
              : 'text-secondary-theme hover:text-primary-theme hover:bg-card-theme'
          }`}
          title={isFullscreen ? 'Exit Full Screen (Esc / F11)' : 'Enter Full Screen (F11)'}
          aria-label="Toggle Full Screen"
        >
          {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
        </button>

        {/* Settings button */}
        <button
          id="notepad-settings-btn"
          onClick={onOpenSettings}
          className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
          title="Writing Settings (Theme, Font, Paper Style)"
          aria-label="Settings"
        >
          <Settings className="w-4 h-4" />
        </button>

        {/* More Actions Dropdown Menu */}
        <div className="relative" ref={menuRef}>
          <button
            id="notepad-actions-menu-btn"
            onClick={() => setIsMenuOpen((prev) => !prev)}
            className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="More options"
          >
            <MoreVertical className="w-4 h-4" />
          </button>

          {isMenuOpen && (
            <div className="absolute right-0 top-full mt-1.5 w-48 rounded-xl bg-paper-theme border border-subtle-theme shadow-xl py-1 text-xs text-primary-theme z-50 animate-in fade-in zoom-in-95">
              <PWAInstallButton variant="menuitem" onAction={() => setIsMenuOpen(false)} />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenExportImport();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-card-theme text-left transition"
              >
                <Download className="w-3.5 h-3.5 text-secondary-theme" />
                <span>Save Note as File / Export</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenExportImport();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-card-theme text-left transition"
              >
                <Upload className="w-3.5 h-3.5 text-secondary-theme" />
                <span>Open File / Import</span>
              </button>

              <div className="my-1 border-t border-subtle-theme" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenShortcuts();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-card-theme text-left transition"
              >
                <HelpCircle className="w-3.5 h-3.5 text-secondary-theme" />
                <span>Keyboard Shortcuts</span>
              </button>

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onOpenPrivacy();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 hover:bg-card-theme text-left transition"
              >
                <Shield className="w-3.5 h-3.5 text-secondary-theme" />
                <span>Privacy & Security</span>
              </button>

              <div className="my-1 border-t border-subtle-theme" />

              <button
                onClick={() => {
                  setIsMenuOpen(false);
                  onDeleteNote();
                }}
                className="w-full px-3 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-left transition"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete This Note</span>
              </button>

              {onOpenResetAll && (
                <button
                  id="toolbar-delete-all-btn"
                  onClick={() => {
                    setIsMenuOpen(false);
                    onOpenResetAll();
                  }}
                  className="w-full px-3 py-2 flex items-center gap-2 text-red-600 dark:text-red-400 hover:bg-red-500/10 text-left transition font-medium text-xs border-t border-subtle-theme mt-1 pt-2"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete All Notes & Settings...</span>
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export const TopToolbar = React.memo(TopToolbarComponent);
