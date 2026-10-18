export type PageStyle = 
  | 'blank' 
  | 'lined' 
  | 'college' 
  | 'grid' 
  | 'dotted' 
  | 'todolist' 
  | 'journal' 
  | 'minimal';

export type FontFamily = 
  | 'rubik'
  | 'roboto'
  | 'google-sans'
  | 'merriweather-sans'
  | 'baloo-2'
  | 'roboto-slab'
  | 'pt-mono'
  | 'jetbrains-mono'
  | 'geist-mono'
  | 'space-mono'
  | 'courier-prime'
  | 'comic-relief'
  | 'caveat'
  | 'patrick-hand'
  | 'jua'
  | 'cairo'
  | 'noto-sans-arabic'
  | 'noto-kufi-arabic'
  | 'noto-naskh-arabic'
  | 'almarai'
  | 'amiri'
  | 'amiri-quran'
  | 'lateef'
  | 'mirza'
  | 'alan-sans'
  | 'beiruti'
  | 'sans' 
  | 'serif' 
  | 'mono' 
  | 'literary' 
  | 'casual' 
  | 'dyslexic'
  | 'arial'
  | 'arabic';

export type ThemeMode = 'light' | 'dark';

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

export type LanguageCode = 'EN' | 'AR' | 'FR' | 'ES' | 'DE' | 'RU' | 'PT' | 'CH';

export interface UserPreferences {
  theme: ThemeMode;
  fontFamily: FontFamily;
  fontSize: number; // 12 to 24
  lineHeight: number; // 1.4 to 2.4
  pageStyle: PageStyle;
  editorWidth: EditorWidth;
  editorMode: EditorMode;
  language?: LanguageCode;
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
