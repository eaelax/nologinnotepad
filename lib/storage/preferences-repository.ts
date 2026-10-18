import { UserPreferences } from '@/types/note';
import {
  checkIndexedDBSupport,
  idbGet,
  idbPut,
  STORE_PREFERENCES,
} from './indexeddb';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  fontFamily: 'rubik',
  fontSize: 16,
  lineHeight: 1.7,
  pageStyle: 'blank',
  editorWidth: 'medium',
  editorMode: 'edit',
  language: 'EN',
  focusMode: false,
  reducedMotion: false,
  showWordCount: true,
  showCharacterCount: true,
  showLineCount: true,
  showReadingTime: false,
  autoSaveDelayMs: 600,
  spellCheck: true,
  typewriterMode: false,
};

const LS_PREFS_KEY = 'notepad_preferences';

export class PreferencesRepository {
  private cachedPrefs: UserPreferences | null = null;

  async getPreferences(): Promise<UserPreferences> {
    if (this.cachedPrefs) {
      return { ...this.cachedPrefs };
    }

    if (typeof window === 'undefined') {
      this.cachedPrefs = { ...DEFAULT_PREFERENCES };
      return { ...this.cachedPrefs };
    }

    let loaded: Partial<UserPreferences> = {};

    // 1. First try localStorage for fast synchronous parity
    try {
      const raw = localStorage.getItem(LS_PREFS_KEY);
      if (raw) {
        loaded = JSON.parse(raw);
      }
      const directLang = localStorage.getItem('notepad_language') as any;
      if (directLang) {
        loaded.language = directLang;
      }
    } catch (err) {
      console.error('[Preferences] Error reading localStorage preferences:', err);
    }

    // 2. Then try IndexedDB
    if (checkIndexedDBSupport()) {
      try {
        const item = await idbGet<{ key: string; value: UserPreferences }>(
          STORE_PREFERENCES,
          'user_settings'
        );
        if (item?.value) {
          loaded = { ...loaded, ...item.value };
        }
      } catch (err) {
        console.warn('[Preferences] IndexedDB read error:', err);
      }
    }

    // Default to Light Theme on first load when no saved theme exists in local storage
    const themeToUse = loaded.theme === 'dark' ? 'dark' : 'light';

    const normalizedLang =
      typeof loaded.language === 'string' && loaded.language.trim()
        ? (loaded.language.toUpperCase() as any)
        : 'EN';

    this.cachedPrefs = {
      ...DEFAULT_PREFERENCES,
      ...loaded,
      theme: themeToUse,
      fontFamily: loaded.fontFamily || 'rubik',
      fontSize: typeof loaded.fontSize === 'number' && loaded.fontSize > 0 ? loaded.fontSize : 16,
      pageStyle: loaded.pageStyle || 'blank',
      language: ['EN', 'AR', 'FR', 'ES', 'DE', 'RU', 'PT', 'CH'].includes(normalizedLang)
        ? normalizedLang
        : 'EN',
    };

    if (this.cachedPrefs.fontFamily === 'sans' || !this.cachedPrefs.fontFamily) {
      this.cachedPrefs.fontFamily = 'rubik';
    }
    return { ...this.cachedPrefs };
  }

  async savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated: UserPreferences = { ...current, ...prefs };
    this.cachedPrefs = updated;

    // Write to localStorage immediately
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LS_PREFS_KEY, JSON.stringify(updated));
        if (updated.language) {
          localStorage.setItem('notepad_language', updated.language);
        }
      } catch (err) {
        console.error('[Preferences] Error saving preferences to localStorage:', err);
      }
    }

    // Also persist in IndexedDB
    if (checkIndexedDBSupport()) {
      try {
        await idbPut(STORE_PREFERENCES, {
          key: 'user_settings',
          value: updated,
        });
      } catch (err) {
        console.warn('[Preferences] Error writing preferences to IndexedDB:', err);
      }
    }

    return updated;
  }
}

export const preferencesRepository = new PreferencesRepository();
