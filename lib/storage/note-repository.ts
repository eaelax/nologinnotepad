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
const LS_TABS_ORDER_KEY = 'notepad_tabs_order';

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

    let idbNotes: Note[] = [];
    if (!this.isFallbackMode) {
      try {
        idbNotes = await idbGetAll<Note>(STORE_NOTES);
      } catch (err) {
        console.warn('[Storage] Falling back to localStorage for notes retrieval:', err);
        this.isFallbackMode = true;
      }
    }

    const lsNotes = getLocalStorageNotes();

    const notesMap = new Map<string, Note>();
    for (const n of lsNotes) {
      notesMap.set(n.id, n);
    }
    for (const n of idbNotes) {
      const existing = notesMap.get(n.id);
      if (!existing) {
        notesMap.set(n.id, n);
      } else if (n.updatedAt > existing.updatedAt) {
        notesMap.set(n.id, n);
      } else if (
        n.updatedAt === existing.updatedAt &&
        (n.content?.length || 0) > (existing.content?.length || 0)
      ) {
        notesMap.set(n.id, n);
      }
    }

    let tabOrder: string[] = [];
    try {
      const rawOrder = localStorage.getItem(LS_TABS_ORDER_KEY);
      if (rawOrder) {
        tabOrder = JSON.parse(rawOrder);
      }
    } catch {}

    const merged = Array.from(notesMap.values());
    if (tabOrder.length > 0) {
      merged.sort((a, b) => {
        const idxA = tabOrder.indexOf(a.id);
        const idxB = tabOrder.indexOf(b.id);
        if (idxA !== -1 && idxB !== -1) return idxA - idxB;
        if (idxA !== -1) return -1;
        if (idxB !== -1) return 1;
        return a.createdAt - b.createdAt;
      });
    } else {
      merged.sort((a, b) => a.createdAt - b.createdAt);
    }

    if (merged.length > 0) {
      saveLocalStorageNotes(merged);
      try {
        localStorage.setItem(LS_TABS_ORDER_KEY, JSON.stringify(merged.map((n) => n.id)));
      } catch {}
      if (!this.isFallbackMode) {
        for (const note of merged) {
          idbPut<Note>(STORE_NOTES, note).catch(() => {});
        }
      }
    }

    return merged;
  }

  async getNote(id: string): Promise<Note | null> {
    if (typeof window === 'undefined') return null;

    let idbNote: Note | null = null;
    if (!this.isFallbackMode) {
      try {
        idbNote = await idbGet<Note>(STORE_NOTES, id);
      } catch (err) {
        console.warn('[Storage] Falling back to localStorage for single note retrieval:', err);
        this.isFallbackMode = true;
      }
    }

    const lsNotes = getLocalStorageNotes();
    const lsNote = lsNotes.find((n) => n.id === id) || null;

    if (!idbNote) return lsNote;
    if (!lsNote) return idbNote;
    return idbNote.updatedAt >= lsNote.updatedAt ? idbNote : lsNote;
  }

  async saveNote(note: Note): Promise<void> {
    if (typeof window === 'undefined') return;

    this.saveNoteSync(note);

    if (!this.isFallbackMode) {
      try {
        await idbPut<Note>(STORE_NOTES, note);
        return;
      } catch (err) {
        console.warn('[Storage] Falling back to localStorage for note save:', err);
        this.isFallbackMode = true;
      }
    }
  }

  saveNoteSync(note: Note): void {
    if (typeof window === 'undefined') return;
    try {
      const notes = getLocalStorageNotes();
      const index = notes.findIndex((n) => n.id === note.id);
      if (index >= 0) {
        notes[index] = note;
      } else {
        notes.push(note);
      }
      saveLocalStorageNotes(notes);
      localStorage.setItem(LS_ACTIVE_NOTE_KEY, note.id);
      localStorage.setItem(LS_TABS_ORDER_KEY, JSON.stringify(notes.map((n) => n.id)));
    } catch {
      // Ignore fallback errors
    }
  }

  saveAllNotesSync(notes: Note[]): void {
    if (typeof window === 'undefined') return;
    try {
      saveLocalStorageNotes(notes);
      localStorage.setItem(LS_TABS_ORDER_KEY, JSON.stringify(notes.map((n) => n.id)));
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
    try {
      localStorage.setItem(LS_TABS_ORDER_KEY, JSON.stringify(notes.map((n) => n.id)));
    } catch {}
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
