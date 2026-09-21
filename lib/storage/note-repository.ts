import { Note } from '@/types/note';
import {
  checkIndexedDBSupport,
  idbClear,
  idbDelete,
  idbGet,
  idbGetAll,
  idbPut,
  STORE_METADATA,
  STORE_NOTES,
} from './indexeddb';

export interface INoteRepository {
  getAllNotes(): Promise<Note[]>;
  getNote(id: string): Promise<Note | null>;
  saveNote(note: Note): Promise<void>;
  saveNoteSync(note: Note): void;
  saveAllNotesSync(notes: Note[]): void;
  deleteNote(id: string): Promise<void>;
  getLastActiveNoteId(): Promise<string | null>;
  setLastActiveNoteId(id: string): Promise<void>;
  importNotes(notes: Note[]): Promise<{ imported: number; updated: number }>;
  clearAll(): Promise<void>;
}

const LS_NOTES_KEY = 'notepad_notes_fallback';
const LS_ACTIVE_NOTE_KEY = 'notepad_active_note_id';

// LocalStorage Fallback Helper
function getLocalStorageNotes(): Note[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(LS_NOTES_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch (err) {
    console.error('[Storage] Error reading fallback localStorage notes:', err);
    return [];
  }
}

function saveLocalStorageNotes(notes: Note[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(LS_NOTES_KEY, JSON.stringify(notes));
  } catch (err) {
    console.error('[Storage] Error saving fallback localStorage notes:', err);
  }
}

export class NoteRepository implements INoteRepository {
  private isFallbackMode = false;

  constructor() {
    if (typeof window !== 'undefined') {
      this.isFallbackMode = !checkIndexedDBSupport();
    }
  }

  async getAllNotes(): Promise<Note[]> {
    if (typeof window === 'undefined') return [];

    if (!this.isFallbackMode) {
      try {
        const notes = await idbGetAll<Note>(STORE_NOTES);
        return notes.sort((a, b) => b.updatedAt - a.updatedAt);
      } catch (err) {
        console.warn('[Storage] Falling back to localStorage for notes retrieval:', err);
        this.isFallbackMode = true;
      }
    }

    const notes = getLocalStorageNotes();
    return notes.sort((a, b) => b.updatedAt - a.updatedAt);
  }

  async getNote(id: string): Promise<Note | null> {
    if (typeof window === 'undefined') return null;

    if (!this.isFallbackMode) {
      try {
        const note = await idbGet<Note>(STORE_NOTES, id);
        if (note) return note;
      } catch (err) {
        console.warn('[Storage] Falling back to localStorage for single note retrieval:', err);
        this.isFallbackMode = true;
      }
    }

    const notes = getLocalStorageNotes();
    return notes.find((n) => n.id === id) || null;
  }

  async saveNote(note: Note): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!this.isFallbackMode) {
      try {
        await idbPut<Note>(STORE_NOTES, note);
        // Also keep a lightweight fallback clone of notes in localStorage as extra safety
        this.syncToFallback(note);
        return;
      } catch (err) {
        console.warn('[Storage] Falling back to localStorage for note save:', err);
        this.isFallbackMode = true;
      }
    }

    const notes = getLocalStorageNotes();
    const index = notes.findIndex((n) => n.id === note.id);
    if (index >= 0) {
      notes[index] = note;
    } else {
      notes.unshift(note);
    }
    saveLocalStorageNotes(notes);
  }

  saveNoteSync(note: Note): void {
    if (typeof window === 'undefined') return;
    try {
      const notes = getLocalStorageNotes();
      const index = notes.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        notes[index] = note;
      } else {
        notes.unshift(note);
      }
      saveLocalStorageNotes(notes);
      localStorage.setItem(LS_ACTIVE_NOTE_KEY, note.id);
    } catch {
      // Ignore fallback errors
    }
  }

  saveAllNotesSync(notes: Note[]): void {
    if (typeof window === 'undefined') return;
    try {
      saveLocalStorageNotes(notes);
    } catch {
      // Ignore fallback errors
    }
  }

  private syncToFallback(note: Note): void {
    try {
      const notes = getLocalStorageNotes();
      const index = notes.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        notes[index] = note;
      } else {
        notes.unshift(note);
      }
      // Keep at most 20 recent notes in fallback to prevent LS quota exhaustion
      saveLocalStorageNotes(notes.slice(0, 20));
    } catch {
      // Ignore fallback errors
    }
  }

  async deleteNote(id: string): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!this.isFallbackMode) {
      try {
        await idbDelete(STORE_NOTES, id);
      } catch (err) {
        console.warn('[Storage] Error deleting note from IndexedDB:', err);
        this.isFallbackMode = true;
      }
    }

    const notes = getLocalStorageNotes().filter((n) => n.id !== id);
    saveLocalStorageNotes(notes);
  }

  async getLastActiveNoteId(): Promise<string | null> {
    if (typeof window === 'undefined') return null;

    if (!this.isFallbackMode) {
      try {
        const item = await idbGet<{ key: string; value: string }>(STORE_METADATA, 'lastActiveNoteId');
        if (item?.value) return item.value;
      } catch (err) {
        console.warn('[Storage] Error reading last active note from IndexedDB:', err);
        this.isFallbackMode = true;
      }
    }

    try {
      return localStorage.getItem(LS_ACTIVE_NOTE_KEY);
    } catch {
      return null;
    }
  }

  async setLastActiveNoteId(id: string): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!this.isFallbackMode) {
      try {
        await idbPut(STORE_METADATA, { key: 'lastActiveNoteId', value: id });
      } catch (err) {
        console.warn('[Storage] Error setting last active note in IndexedDB:', err);
        this.isFallbackMode = true;
      }
    }

    try {
      localStorage.setItem(LS_ACTIVE_NOTE_KEY, id);
    } catch {
      // Ignore
    }
  }

  async importNotes(notes: Note[]): Promise<{ imported: number; updated: number }> {
    let imported = 0;
    let updated = 0;

    const existingNotes = await this.getAllNotes();
    const existingMap = new Map<string, Note>(existingNotes.map((n) => [n.id, n]));

    for (const note of notes) {
      if (existingMap.has(note.id)) {
        updated++;
      } else {
        imported++;
      }
      await this.saveNote(note);
    }

    return { imported, updated };
  }

  async clearAll(): Promise<void> {
    if (typeof window === 'undefined') return;

    if (!this.isFallbackMode) {
      try {
        await idbClear(STORE_NOTES);
        await idbClear(STORE_METADATA);
      } catch (err) {
        console.warn('[Storage] Error clearing IndexedDB:', err);
      }
    }

    try {
      localStorage.removeItem(LS_NOTES_KEY);
      localStorage.removeItem(LS_ACTIVE_NOTE_KEY);
    } catch {
      // Ignore
    }
  }
}

export const noteRepository = new NoteRepository();
