/**
 * Comprehensive App Data Reset Service
 * Safely cleans and deletes all notes, history, drafts, and user preferences from IndexedDB & LocalStorage.
 */

import {
  idbClear,
  STORE_NOTES,
  STORE_PREFERENCES,
  STORE_METADATA,
  checkIndexedDBSupport,
} from './indexeddb';
import { DEFAULT_PREFERENCES } from './preferences-repository';
import { createNewNote } from '@/lib/services/note-service';
import { Note, UserPreferences } from '@/types/note';

export async function resetAllApplicationData(): Promise<{
  initialNote: Note;
  defaultPreferences: UserPreferences;
}> {
  // 1. Clear IndexedDB stores
  if (typeof window !== 'undefined' && checkIndexedDBSupport()) {
    try {
      await idbClear(STORE_NOTES);
      await idbClear(STORE_PREFERENCES);
      await idbClear(STORE_METADATA);
    } catch (err) {
      console.warn('[Storage] Error clearing IndexedDB stores:', err);
    }
  }

  // 2. Clear all localStorage items related to the app
  if (typeof window !== 'undefined') {
    try {
      const explicitKeys = [
        'notepad_notes_fallback',
        'notepad_active_note_id',
        'notepad_last_active_id',
        'notepad_quick_scratch',
        'notepad_preferences',
      ];
      explicitKeys.forEach((key) => {
        try {
          localStorage.removeItem(key);
        } catch {}
      });

      // Clear any additional prefixed keys
      for (let i = localStorage.length - 1; i >= 0; i--) {
        const key = localStorage.key(i);
        if (
          key &&
          (key.startsWith('notepad_') ||
            key.startsWith('nologinpad_') ||
            key.startsWith('nologinnotepad_'))
        ) {
          localStorage.removeItem(key);
        }
      }
    } catch (err) {
      console.warn('[Storage] Error clearing localStorage:', err);
    }
  }

  // 3. Generate a single clean initial blank note (first-time state)
  const initialNote = createNewNote(undefined, '', DEFAULT_PREFERENCES.pageStyle, []);

  // 4. Persist the fresh baseline note so the app state remains valid
  if (typeof window !== 'undefined') {
    try {
      const { noteRepository } = await import('./note-repository');
      const { preferencesRepository } = await import('./preferences-repository');
      await noteRepository.saveNote(initialNote);
      await noteRepository.setLastActiveNoteId(initialNote.id);
      await preferencesRepository.savePreferences(DEFAULT_PREFERENCES);
    } catch (err) {
      console.warn('[Storage] Error saving fresh baseline after reset:', err);
    }
  }

  return {
    initialNote,
    defaultPreferences: DEFAULT_PREFERENCES,
  };
}
