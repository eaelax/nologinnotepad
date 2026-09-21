import { ExportBundle, Note, UserPreferences } from '@/types/note';
import { calculateTextStats, createNewNote, stripHtmlToPlainText } from '../services/note-service';

export function downloadFile(content: string, filename: string, mimeType: string): void {
  if (typeof window === 'undefined') return;

  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  URL.revokeObjectURL(url);
}

function sanitizeFilename(title: string, defaultName = 'note'): string {
  const clean = title.replace(/[^a-zA-Z0-9_\- ]/g, '').trim();
  return clean ? clean.replace(/\s+/g, '_').toLowerCase() : defaultName;
}

export function exportNoteAsTxt(note: Note): void {
  const filename = `${sanitizeFilename(note.title)}.txt`;
  const plainText = stripHtmlToPlainText(note.content);
  downloadFile(plainText, filename, 'text/plain;charset=utf-8');
}

export function exportNoteAsMarkdown(note: Note): void {
  const filename = `${sanitizeFilename(note.title)}.md`;
  // Prefix with title if note doesn't already start with a markdown heading
  let content = note.content;
  if (!content.trim().startsWith('# ') && note.title && note.title !== 'Untitled Note') {
    content = `# ${note.title}\n\n${content}`;
  }
  downloadFile(content, filename, 'text/markdown;charset=utf-8');
}

export function exportNoteAsJson(note: Note): void {
  const filename = `${sanitizeFilename(note.title)}.json`;
  const data = JSON.stringify(note, null, 2);
  downloadFile(data, filename, 'application/json;charset=utf-8');
}

export function exportAllNotesBackup(notes: Note[], preferences?: UserPreferences): void {
  const bundle: ExportBundle = {
    app: 'NoLoginNotepad',
    version: 1,
    exportedAt: new Date().toISOString(),
    notes,
    preferences,
  };

  const dateStr = new Date().toISOString().split('T')[0];
  const filename = `nologinnotepad_backup_${dateStr}.json`;
  downloadFile(JSON.stringify(bundle, null, 2), filename, 'application/json;charset=utf-8');
}

export async function parseImportFile(
  file: File
): Promise<{ notes: Note[]; preferences?: Partial<UserPreferences>; message: string }> {
  const text = await file.text();
  const name = file.name.toLowerCase();

  // JSON Import
  if (name.endsWith('.json')) {
    try {
      const parsed = JSON.parse(text);

      // Check if it's a full backup bundle
      if (parsed && Array.isArray(parsed.notes)) {
        const validatedNotes: Note[] = parsed.notes
          .filter((item: any) => item && typeof item === 'object' && typeof item.content === 'string')
          .map((item: any) => {
            const stats = calculateTextStats(item.content || '');
            return {
              id: typeof item.id === 'string' && item.id ? item.id : `imported_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
              title: typeof item.title === 'string' && item.title ? item.title : 'Imported Note',
              content: item.content || '',
              createdAt: typeof item.createdAt === 'number' ? item.createdAt : Date.now(),
              updatedAt: typeof item.updatedAt === 'number' ? item.updatedAt : Date.now(),
              wordCount: stats.wordCount,
              characterCount: stats.characterCount,
              pageStyle: item.pageStyle || 'blank',
              isPinned: !!item.isPinned,
              version: 1,
            };
          });

        return {
          notes: validatedNotes,
          preferences: parsed.preferences,
          message: `Successfully imported ${validatedNotes.length} note${validatedNotes.length === 1 ? '' : 's'} from backup.`,
        };
      }

      // Check if it's a single exported Note object
      if (parsed && typeof parsed.content === 'string') {
        const singleNote = createNewNote(
          parsed.title || file.name.replace(/\.[^/.]+$/, ''),
          parsed.content,
          parsed.pageStyle
        );
        return {
          notes: [singleNote],
          message: `Imported note "${singleNote.title}".`,
        };
      }

      throw new Error('Unrecognized JSON structure.');
    } catch (err: any) {
      throw new Error(`Failed to parse JSON file: ${err.message || 'Invalid format'}`);
    }
  }

  // Plain Text or Markdown (.txt, .md, .markdown)
  const title = file.name.replace(/\.[^/.]+$/, '');
  const note = createNewNote(title, text);
  return {
    notes: [note],
    message: `Imported note "${note.title}".`,
  };
}
