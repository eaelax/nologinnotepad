import { FontFamily } from '@/types/note';

export interface FontOption {
  value: FontFamily;
  label: string;
}

export const ALL_FONT_OPTIONS: FontOption[] = [
  { value: 'rubik', label: 'Plus Jakarta / Rubik (Default)' },
  { value: 'roboto', label: 'Roboto' },
  { value: 'google-sans', label: 'Google Sans Flex' },
  { value: 'merriweather-sans', label: 'Merriweather Sans' },
  { value: 'baloo-2', label: 'Baloo 2' },
  { value: 'roboto-slab', label: 'Roboto Slab' },
  { value: 'pt-mono', label: 'PT Mono' },
  { value: 'jetbrains-mono', label: 'JetBrains Mono' },
  { value: 'geist-mono', label: 'Geist Mono' },
  { value: 'space-mono', label: 'Space Mono' },
  { value: 'courier-prime', label: 'Courier Prime' },
  { value: 'comic-relief', label: 'Comic Relief' },
  { value: 'caveat', label: 'Caveat' },
  { value: 'patrick-hand', label: 'Patrick Hand' },
  { value: 'jua', label: 'Jua' },
  { value: 'cairo', label: 'Cairo' },
  { value: 'noto-sans-arabic', label: 'Noto Sans Arabic' },
  { value: 'noto-kufi-arabic', label: 'Noto Kufi Arabic' },
  { value: 'noto-naskh-arabic', label: 'Noto Naskh Arabic' },
  { value: 'almarai', label: 'Almarai' },
  { value: 'amiri', label: 'Amiri' },
  { value: 'amiri-quran', label: 'Amiri Quran' },
  { value: 'lateef', label: 'Lateef' },
  { value: 'mirza', label: 'Mirza' },
  { value: 'alan-sans', label: 'Alan Sans' },
  { value: 'beiruti', label: 'Beiruti' },
];

export const getFontFamilyCss = (fontFamily?: string): string => {
  switch (fontFamily) {
    case 'rubik':
    case 'sans':
      return '"Plus Jakarta Sans", "Rubik", ui-sans-serif, system-ui, sans-serif';
    case 'roboto':
      return '"Roboto", sans-serif';
    case 'google-sans':
      return '"Google Sans Flex", "Google Sans", "Plus Jakarta Sans", system-ui, sans-serif';
    case 'merriweather-sans':
    case 'literary':
      return '"Merriweather Sans", sans-serif';
    case 'baloo-2':
    case 'dyslexic':
      return '"Baloo 2", cursive, sans-serif';
    case 'roboto-slab':
    case 'serif':
      return '"Roboto Slab", Georgia, serif';
    case 'pt-mono':
    case 'mono':
      return '"PT Mono", monospace';
    case 'jetbrains-mono':
      return '"JetBrains Mono", monospace';
    case 'geist-mono':
      return '"Geist Mono", monospace';
    case 'space-mono':
      return '"Space Mono", monospace';
    case 'courier-prime':
    case 'courier':
      return '"Courier Prime", Courier, monospace';
    case 'comic-relief':
      return '"Comic Relief", "Comic Neue", cursive, sans-serif';
    case 'caveat':
    case 'casual':
      return '"Caveat", cursive';
    case 'patrick-hand':
      return '"Patrick Hand", cursive';
    case 'jua':
      return '"Jua", sans-serif';
    case 'cairo':
      return '"Cairo", sans-serif';
    case 'noto-sans-arabic':
      return '"Noto Sans Arabic", sans-serif';
    case 'noto-kufi-arabic':
    case 'arabic':
      return '"Noto Kufi Arabic", sans-serif';
    case 'noto-naskh-arabic':
      return '"Noto Naskh Arabic", serif';
    case 'almarai':
      return '"Almarai", sans-serif';
    case 'amiri':
      return '"Amiri", serif';
    case 'amiri-quran':
      return '"Amiri Quran", "Amiri", serif';
    case 'lateef':
      return '"Lateef", serif';
    case 'mirza':
      return '"Mirza", cursive, serif';
    case 'alan-sans':
      return '"Alan Sans", "Alexandria", sans-serif';
    case 'beiruti':
      return '"Beiruti", sans-serif';
    case 'arial':
      return 'Arial, Helvetica, sans-serif';
    default:
      return '"Plus Jakarta Sans", "Rubik", ui-sans-serif, system-ui, sans-serif';
  }
};
