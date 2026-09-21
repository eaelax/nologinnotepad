import { UserPreferences } from '@/types/note';
import {
  checkIndexedDBSupport,
  idbGet,
  idbPut,
  STORE_PREFERENCES,
} from './indexeddb';

export const DEFAULT_PREFERENCES: UserPreferences = {
  theme: 'light',
  fontFamily: 'sans',
  fontSize: 15,
  lineHeight: 1.7,
  pageStyle: 'blank',
  editorWidth: 'medium',
  editorMode: 'edit',
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
  async getPreferences(): Promise<UserPreferences> {
    if (typeof window === 'undefined') return DEFAULT_PREFERENCES;

    // First try IndexedDB
    if (checkIndexedDBSupport()) {
      try {
        const item = await idbGet<{ key: string; value: UserPreferences }>(
          STORE_PREFERENCES,
          'user_settings'
        );
        if (item?.value) {
          return { ...DEFAULT_PREFERENCES, ...item.value };
        }
      } catch (err) {
        console.warn('[Preferences] IndexedDB read error, using localStorage:', err);
      }
    }

    // Fallback to localStorage
    try {
      const raw = localStorage.getItem(LS_PREFS_KEY);
      if (raw) {
        return { ...DEFAULT_PREFERENCES, ...JSON.parse(raw) };
      }
    } catch (err) {
      console.error('[Preferences] Error reading localStorage preferences:', err);
    }

    return DEFAULT_PREFERENCES;
  }

  async savePreferences(prefs: Partial<UserPreferences>): Promise<UserPreferences> {
    const current = await this.getPreferences();
    const updated = { ...current, ...prefs };

    // Write to localStorage for immediate synchronous reads on page boot
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(LS_PREFS_KEY, JSON.stringify(updated));
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
