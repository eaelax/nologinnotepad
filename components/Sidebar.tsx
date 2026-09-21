'use client';

import React, { useState, useMemo } from 'react';
import {
  Plus,
  Search,
  Pin,
  Trash2,
  X,
  Clock,
  ArrowUpDown,
  FileText,
  HardDrive,
  Download,
  Shield,
} from 'lucide-react';
import { Note } from '@/types/note';
import { formatRelativeTime } from '@/lib/services/note-service';
import { AppLogo } from '@/components/AppLogo';

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
  notes: Note[];
  activeNoteId: string | null;
  onSelectNote: (noteId: string) => void;
  onCreateNewNote: () => void;
  onDeleteNote: (note: Note) => void;
  onTogglePin: (note: Note) => void;
  onOpenExportImport: () => void;
  onOpenPrivacy?: () => void;
  onOpenResetAll?: () => void;
}

type SortBy = 'updated' | 'created' | 'title' | 'words';

const SidebarComponent: React.FC<SidebarProps> = ({
  isOpen,
  onClose,
  notes,
  activeNoteId,
  onSelectNote,
  onCreateNewNote,
  onDeleteNote,
  onTogglePin,
  onOpenExportImport,
  onOpenPrivacy,
  onOpenResetAll,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortBy>('updated');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  const filteredAndSortedNotes = useMemo(() => {
    return notes
      .filter((note) => {
        if (!searchQuery.trim()) return true;
        const q = searchQuery.toLowerCase();
        return (
          note.title.toLowerCase().includes(q) ||
          note.content.toLowerCase().includes(q)
        );
      })
      .sort((a, b) => {
        // Pinned notes always take precedence at top
        if (a.isPinned && !b.isPinned) return -1;
        if (!a.isPinned && b.isPinned) return 1;

        let comparison = 0;
        if (sortBy === 'updated') {
          comparison = a.updatedAt - b.updatedAt;
        } else if (sortBy === 'created') {
          comparison = a.createdAt - b.createdAt;
        } else if (sortBy === 'title') {
          comparison = (a.title || '').localeCompare(b.title || '');
        } else if (sortBy === 'words') {
          comparison = (a.wordCount || 0) - (b.wordCount || 0);
        }

        return sortOrder === 'desc' ? -comparison : comparison;
      });
  }, [notes, searchQuery, sortBy, sortOrder]);

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === 'desc' ? 'asc' : 'desc'));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Mobile backdrop */}
      <div
        className="fixed inset-0 z-40 bg-black/30 backdrop-blur-xs md:hidden animate-in fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Sidebar panel */}
      <aside
        className="fixed top-0 bottom-0 left-0 z-40 w-80 max-w-[85vw] bg-paper-theme border-r border-subtle-theme flex flex-col shadow-xl md:shadow-none animate-in slide-in-from-left text-primary-theme"
        aria-label="Notes Directory"
      >
        {/* Header */}
        <div className="p-4 border-b border-subtle-theme flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <AppLogo size={28} />
            <h2 className="text-sm font-semibold">
              All Notes ({notes.length})
            </h2>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={onCreateNewNote}
              className="p-1.5 rounded-lg bg-card-theme hover:bg-card-selected-theme text-primary-theme transition border border-subtle-theme"
              title="New Note (Ctrl+N)"
            >
              <Plus className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
              aria-label="Close sidebar"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Search & Sort Controls */}
        <div className="p-3 border-b border-subtle-theme space-y-2 shrink-0">
          <div className="relative">
            <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-secondary-theme" />
            <input
              type="text"
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-7 py-1.5 rounded-lg bg-card-theme border border-subtle-theme text-xs text-primary-theme placeholder:text-secondary-theme focus:outline-none focus:ring-1 focus:ring-stone-400 transition"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-secondary-theme hover:text-primary-theme"
              >
                <X className="w-3 h-3" />
              </button>
            )}
          </div>

          <div className="flex items-center justify-between text-[11px] text-secondary-theme px-0.5">
            <div className="flex items-center gap-1">
              <Clock className="w-3 h-3" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as SortBy)}
                className="bg-transparent border-none text-xs text-secondary-theme hover:text-primary-theme cursor-pointer focus:outline-none"
              >
                <option value="updated">Recently Modified</option>
                <option value="created">Date Created</option>
                <option value="title">Title (A-Z)</option>
                <option value="words">Word Count</option>
              </select>
            </div>

            <button
              onClick={toggleSortOrder}
              className="p-1 rounded hover:bg-card-theme transition text-secondary-theme hover:text-primary-theme"
              title={`Sort ${sortOrder === 'desc' ? 'Ascending' : 'Descending'}`}
            >
              <ArrowUpDown className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Note list */}
        <div className="flex-1 overflow-y-auto p-2 space-y-1.5">
          {filteredAndSortedNotes.length === 0 ? (
            <div className="p-8 text-center text-secondary-theme text-xs">
              <FileText className="w-8 h-8 mx-auto mb-2 opacity-30" />
              <p className="font-medium text-primary-theme">No notes found</p>
              <p className="mt-1">
                {searchQuery
                  ? 'Try searching with different keywords'
                  : 'Start by writing in your first note'}
              </p>
            </div>
          ) : (
            filteredAndSortedNotes.map((note) => {
              const isActive = note.id === activeNoteId;

              return (
                <div
                  key={note.id}
                  id={`note-item-${note.id}`}
                  onClick={() => {
                    onSelectNote(note.id);
                    if (typeof window !== 'undefined' && window.innerWidth < 768) {
                      onClose();
                    }
                  }}
                  className={`relative p-2.5 rounded-xl cursor-pointer transition text-left border flex items-center justify-between gap-2 ${
                    isActive
                      ? 'bg-card-selected-theme border-selected-theme shadow-xs font-medium'
                      : 'border-transparent hover:bg-card-theme'
                  }`}
                >
                  <div className="flex-1 min-w-0 pr-1">
                    <div className="flex items-center gap-1.5">
                      <h3 className="text-xs font-semibold truncate text-primary-theme">
                        {note.title || 'Untitled Note 1'}
                      </h3>
                      {note.isPinned && (
                        <Pin className="w-3 h-3 fill-amber-500 text-amber-500 shrink-0" />
                      )}
                    </div>

                    <div className="mt-0.5 text-[10px] text-secondary-theme font-medium">
                      {formatRelativeTime(note.updatedAt)}
                    </div>
                  </div>

                  {/* Always-visible action buttons: Pin and Delete */}
                  <div
                    className="flex items-center gap-1 shrink-0"
                    onClick={(e) => e.stopPropagation()}
                  >
                    <button
                      type="button"
                      onClick={() => onTogglePin(note)}
                      className={`p-1.5 rounded-lg transition hover:bg-card-selected-theme ${
                        note.isPinned
                          ? 'text-amber-500'
                          : 'text-secondary-theme hover:text-primary-theme'
                      }`}
                      title={note.isPinned ? 'Unpin note' : 'Pin note to top'}
                      aria-label="Pin note"
                    >
                      <Pin className={`w-3.5 h-3.5 ${note.isPinned ? 'fill-current' : ''}`} />
                    </button>

                    <button
                      type="button"
                      id={`delete-note-btn-${note.id}`}
                      onClick={() => onDeleteNote(note)}
                      className="p-1.5 rounded-lg text-secondary-theme hover:text-red-600 hover:bg-red-500/10 transition"
                      title="Delete note"
                      aria-label="Delete note"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Footer info & Backup link */}
        <div className="p-3 border-t border-subtle-theme bg-card-theme shrink-0 space-y-2">
          <div className="flex items-center justify-between text-[11px] text-secondary-theme">
            <div className="flex items-center gap-1">
              <HardDrive className="w-3.5 h-3.5 text-emerald-500" />
              <span>Browser IndexedDB</span>
            </div>
            <div className="flex items-center gap-2.5">
              {onOpenResetAll && (
                <button
                  id="sidebar-clear-all-data-btn"
                  onClick={onOpenResetAll}
                  className="flex items-center gap-1 text-red-600 dark:text-red-400 hover:underline"
                  title="Clear all history, notes & settings"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Clear All</span>
                </button>
              )}
              {onOpenPrivacy && (
                <button
                  onClick={onOpenPrivacy}
                  className="flex items-center gap-1 text-secondary-theme hover:text-primary-theme hover:underline"
                >
                  <Shield className="w-3 h-3" />
                  <span>Privacy</span>
                </button>
              )}
              <button
                onClick={onOpenExportImport}
                className="flex items-center gap-1 text-primary-theme hover:underline"
              >
                <Download className="w-3 h-3" />
                <span>Backup</span>
              </button>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

export const Sidebar = React.memo(SidebarComponent);
