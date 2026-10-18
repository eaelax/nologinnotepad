import { Note, PageStyle } from '@/types/note';

export function getPlainTextWithNewlines(html: string): string {
  if (!html) return '';
  if (!/<[a-z][\s\S]*>/i.test(html)) {
    return html.replace(/\r\n|\r/g, '\n');
  }
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<div><br\s*[\/]?>\s*<\/div>/gi, '\n')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<\/li>/gi, '\n')
    .replace(/<\/h[1-6]>/gi, '\n')
    .replace(/<[^>]+>/g, '')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\r\n|\r/g, '\n')
    .replace(/\n$/, '');
}

export function stripHtmlToPlainText(html: string): string {
  if (!html) return '';
  return html
    .replace(/<style[^>]*>[\s\S]*?<\/style>/gi, '')
    .replace(/<script[^>]*>[\s\S]*?<\/script>/gi, '')
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/gi, ' ')
    .replace(/&amp;/gi, '&')
    .replace(/&lt;/gi, '<')
    .replace(/&gt;/gi, '>')
    .replace(/&quot;/gi, '"')
    .replace(/&#39;/gi, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function calculateTextStats(text: string): {
  wordCount: number;
  characterCount: number;
  lineCount: number;
  readingTimeMinutes: number;
} {
  if (!text) {
    return {
      wordCount: 0,
      characterCount: 0,
      lineCount: 0,
      readingTimeMinutes: 0,
    };
  }

  const plain = getPlainTextWithNewlines(text);
  const trimmedEndPlain = plain.replace(/\n+$/, '');

  if (!trimmedEndPlain.trim()) {
    return {
      wordCount: 0,
      characterCount: 0,
      lineCount: 0,
      readingTimeMinutes: 0,
    };
  }

  const cleanForWords = trimmedEndPlain.replace(/[•☐☑\u200B-\u200D\uFEFF]/g, ' ');
  const wordsMatch = cleanForWords.match(/[\p{L}\p{N}]+/gu);
  const wordCount = wordsMatch ? wordsMatch.length : 0;

  const characterCount = trimmedEndPlain.replace(/\r\n|\r|\n/g, '').length;
  const rawLines = trimmedEndPlain.split(/\r\n|\r|\n/);
  const lineCount = rawLines.filter(l => l.length > 0 || rawLines.length === 1).length;
  const readingTimeMinutes = Math.max(1, Math.ceil(wordCount / 200));

  return {
    wordCount,
    characterCount,
    lineCount: Math.max(1, lineCount),
    readingTimeMinutes,
  };
}

export function extractTitleFromContent(content: string, fallback: string = 'Untitled Note'): string {
  if (!content || !content.trim()) return fallback;

  const cleanLines = content
    .replace(/<br\s*[\/]?>/gi, '\n')
    .replace(/<\/div>/gi, '\n')
    .replace(/<\/p>/gi, '\n')
    .split('\n');

  for (const line of cleanLines) {
    const textOnly = stripHtmlToPlainText(line);
    if (textOnly) {
      const stripped = textOnly
        .replace(/^(#+\s*|[-*+•☐☑]\s*|\d+\.\s*)/, '')
        .trim();
      if (stripped.length > 0) {
        return stripped.slice(0, 60);
      }
    }
  }

  return fallback;
}

export function getNextUntitledTitle(existingNotes?: Array<{ title?: string }>): string {
  if (!existingNotes || existingNotes.length === 0) {
    return 'Untitled Note 1';
  }

  let maxNum = 0;
  for (const n of existingNotes) {
    if (!n || !n.title) continue;
    const match = n.title.trim().match(/^Untitled Note(?:\s+(\d+))?$/i);
    if (match) {
      const num = match[1] ? parseInt(match[1], 10) : 1;
      if (num > maxNum) {
        maxNum = num;
      }
    }
  }

  return `Untitled Note ${maxNum + 1}`;
}

export function generateNoteId(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `note_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
}

export function createNewNote(
  customTitle?: string,
  initialContent: string = '',
  pageStyle?: PageStyle,
  existingNotes?: Array<{ title?: string }>
): Note {
  const now = Date.now();
  const stats = calculateTextStats(initialContent);

  const title =
    customTitle && customTitle.trim()
      ? customTitle.trim()
      : getNextUntitledTitle(existingNotes);

  return {
    id: generateNoteId(),
    title,
    content: initialContent,
    createdAt: now,
    updatedAt: now,
    wordCount: stats.wordCount,
    characterCount: stats.characterCount,
    pageStyle: pageStyle || 'blank',
    isPinned: false,
    version: 1,
  };
}

export function duplicateNote(source: Note): Note {
  const now = Date.now();
  return {
    ...source,
    id: generateNoteId(),
    title: `${source.title} (Copy)`,
    createdAt: now,
    updatedAt: now,
    isPinned: false,
  };
}

export function filterAndSortNotes(
  notes: Note[],
  query: string = '',
  sortBy: 'updatedAt' | 'createdAt' | 'title' = 'updatedAt',
  sortOrder: 'asc' | 'desc' = 'desc'
): Note[] {
  let filtered = [...notes];

  if (query.trim()) {
    const q = query.toLowerCase().trim();
    filtered = filtered.filter(
      (n) => n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q)
    );
  }

  filtered.sort((a, b) => {
    if (sortBy !== 'title') {
      if (a.isPinned && !b.isPinned) return -1;
      if (!a.isPinned && b.isPinned) return 1;
    }

    let comparison = 0;
    if (sortBy === 'title') {
      comparison = a.title.localeCompare(b.title, undefined, { sensitivity: 'base' });
    } else if (sortBy === 'createdAt') {
      comparison = a.createdAt - b.createdAt;
    } else {
      comparison = a.updatedAt - b.updatedAt;
    }

    return sortOrder === 'asc' ? comparison : -comparison;
  });

  return filtered;
}

export function formatRelativeTime(timestamp: number): string {
  const diff = Date.now() - timestamp;
  const seconds = Math.floor(diff / 1000);
  if (seconds < 60) return 'Just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;

  const date = new Date(timestamp);
  return date.toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}
