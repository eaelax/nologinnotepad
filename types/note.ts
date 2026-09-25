export type PageStyle = 
  | 'blank' 
  | 'lined' 
  | 'dotted' 
  | 'grid' 
  | 'graph' 
  | 'journal' 
  | 'minimal';

export type FontFamily = 
  | 'sans' 
  | 'serif' 
  | 'mono' 
  | 'literary' 
  | 'casual' 
  | 'dyslexic';

export type ThemeMode = 'light' | 'dark' | 'sepia' | 'system';

export type EditorWidth = 'narrow' | 'medium' | 'wide' | 'full';

export type EditorMode = 'edit' | 'split' | 'preview';

export interface Note {
  id: string;
  title: string;
  content: string;
  createdAt: number;
  updatedAt: number;
  wordCount: number;
  characterCount: number;
  pageStyle?: PageStyle;
  isPinned?: boolean;
  version: number;
}

export interface UserPreferences {
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: number; // 14 to 32
  lineHeight: number; // 1.4 to 2.4
  pageStyle: PageStyle;
  editorWidth: EditorWidth;
  editorMode: EditorMode;
  focusMode: boolean;
  reducedMotion: boolean;
  showWordCount: boolean;
  showCharacterCount: boolean;
  showLineCount?: boolean;
  showReadingTime: boolean;
  autoSaveDelayMs: number;
  spellCheck: boolean;
  typewriterMode: boolean;
}

export interface NoteSummary {
  id: string;
  title: string;
  updatedAt: number;
  createdAt: number;
  wordCount: number;
  characterCount: number;
  isPinned?: boolean;
  snippet: string;
}

export interface ExportBundle {
  app: string;
  version: number;
  exportedAt: string;
  notes: Note[];
  preferences?: Partial<UserPreferences>;
}
