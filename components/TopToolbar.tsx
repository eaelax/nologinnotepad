'use client';

import React from 'react';
import { Note, ThemeMode, LanguageCode } from '@/types/note';
import { NotepadTabsRow } from './NotepadTabsRow';

interface TopToolbarProps {
  note: Note | null;
  notes?: Note[];
  activeNoteId?: string | null;
  onSelectNote?: (id: string) => void;
  onCloseNote?: (note: Note) => void;
  saveStatus?: 'saved' | 'saving' | 'error';
  notesCount: number;
  isFullscreen?: boolean;
  currentTheme?: ThemeMode;
  currentLang?: LanguageCode;
  onToggleTheme?: () => void;
  onSelectLanguage?: (lang: LanguageCode) => void;
  onCreateNewNote: () => void;
  onUpdateTitle: (title: string) => void;
  onToggleFullScreen?: () => void;
  onOpenSettings: () => void;
  onOpenExportImport: () => void;
  onExportFile?: () => void;
  onImportFile?: (content: string, filename?: string) => void;
  onOpenShortcuts: () => void;
  onOpenPrivacy: () => void;
  onDeleteNote: () => void;
  onOpenResetAll?: () => void;
  isSettingsOpen?: boolean;
}

const TopToolbarComponent: React.FC<TopToolbarProps> = (props) => {
  return (
    <NotepadTabsRow
      note={props.note}
      notes={props.notes || (props.note ? [props.note] : [])}
      activeNoteId={props.activeNoteId || props.note?.id || null}
      currentLang={props.currentLang}
      currentTheme={props.currentTheme}
      onSelectNote={props.onSelectNote || (() => {})}
      onCloseNote={props.onCloseNote || (() => props.onDeleteNote())}
      onCreateNewNote={props.onCreateNewNote}
      onUpdateTitle={props.onUpdateTitle}
      onDeleteNote={props.onDeleteNote}
      onExportFile={props.onExportFile}
      onImportFile={props.onImportFile}
      onToggleTheme={props.onToggleTheme}
      onSelectLanguage={props.onSelectLanguage}
      onOpenSettings={props.onOpenSettings}
      onOpenExportImport={() => props.onOpenExportImport()}
      onOpenShortcuts={props.onOpenShortcuts}
      onOpenPrivacy={props.onOpenPrivacy}
      onOpenResetAll={props.onOpenResetAll}
      isSettingsOpen={props.isSettingsOpen}
    />
  );
};

export const TopToolbar = React.memo(TopToolbarComponent);
