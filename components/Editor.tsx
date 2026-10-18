'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Note, UserPreferences, LanguageCode, FontFamily } from '@/types/note';
import {
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Code,
  Highlighter,
  CheckSquare,
  RemoveFormatting,
  RotateCcw,
  RotateCw,
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  ChevronDown,
  Check,
  Download,
  HelpCircle,
  List,
  ListOrdered,
  FileText,
  Clock,
  Hash,
  AlignJustify,
} from 'lucide-react';
import { stripHtmlToPlainText, getPlainTextWithNewlines, calculateTextStats } from '@/lib/services/note-service';
import { TRANSLATIONS, Translations } from '@/lib/i18n/translations';

const getNextCaseInfo = (text: string) => {
  if (!text) {
    return { iconText: 'AB' as const, nextCase: 'upper' as const, title: 'Convert to UPPERCASE (AB)' };
  }
  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (!letters) {
    return { iconText: 'AB' as const, nextCase: 'upper' as const, title: 'Convert to UPPERCASE (AB)' };
  }

  const isAllUpper = letters === letters.toUpperCase();
  const isAllLower = letters === letters.toLowerCase();

  if (isAllUpper) {
    return { iconText: 'ab' as const, nextCase: 'lower' as const, title: 'Convert to lowercase (ab)' };
  } else if (isAllLower) {
    return { iconText: 'Ab' as const, nextCase: 'capitalized' as const, title: 'Convert to Capitalized (Ab)' };
  } else {
    return { iconText: 'AB' as const, nextCase: 'upper' as const, title: 'Convert to UPPERCASE (AB)' };
  }
};

const cleanEmptyMarks = (container: HTMLElement) => {
  const marks = container.querySelectorAll('mark, [style*="background-color"]');
  marks.forEach((m) => {
    const el = m as HTMLElement;
    const isMark = el.tagName === 'MARK';
    const hasBg = Boolean(
      el.style &&
        el.style.backgroundColor &&
        el.style.backgroundColor !== 'transparent' &&
        el.style.backgroundColor !== 'rgba(0, 0, 0, 0)'
    );
    if (isMark || hasBg) {
      const text = el.textContent || '';
      if (!text.replace(/[\s\u200B\uFEFF]/g, '')) {
        const parent = el.parentNode;
        if (parent) {
          while (el.firstChild) {
            parent.insertBefore(el.firstChild, el);
          }
          parent.removeChild(el);
        }
      }
    }
  });
};

function getLinePrefixBeforeCaret(container: HTMLElement, sel: Selection): string {
  if (!sel.anchorNode || !sel.isCollapsed) return '';
  const range = sel.getRangeAt(0);

  let block: Node | null = sel.anchorNode;
  while (block && block !== container) {
    if (block.nodeType === Node.ELEMENT_NODE) {
      const tag = (block as HTMLElement).tagName.toLowerCase();
      if (['div', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tag)) {
        break;
      }
    }
    block = block.parentNode;
  }
  if (!block) block = container;

  try {
    const preRange = document.createRange();
    preRange.setStart(block, 0);
    preRange.setEnd(range.startContainer, range.startOffset);

    const fragment = preRange.cloneContents();
    fragment.querySelectorAll('br').forEach((br) => br.replaceWith('\n'));
    fragment.querySelectorAll('div, p, li').forEach((el) => el.append('\n'));
    const fullText = fragment.textContent || '';
    const lastNl = fullText.lastIndexOf('\n');
    return lastNl === -1 ? fullText : fullText.slice(lastNl + 1);
  } catch {
    return '';
  }
}

export type ListPrefixType = 'checkbox' | 'bullet' | 'number' | 'alpha' | null;

export interface LinePrefixInfo {
  type: ListPrefixType;
  inputEl?: HTMLInputElement;
  prefixText?: string;
  number?: number;
  letter?: string;
}

export function getNextAlpha(curr: string): string {
  if (!curr) return 'A';
  const isUpper = curr === curr.toUpperCase();
  const upper = curr.toUpperCase();
  if (upper.length === 1 && upper >= 'A' && upper < 'Z') {
    const next = String.fromCharCode(upper.charCodeAt(0) + 1);
    return isUpper ? next : next.toLowerCase();
  }
  if (upper === 'Z') {
    return isUpper ? 'AA' : 'aa';
  }
  let result = '';
  let carry = 1;
  for (let i = upper.length - 1; i >= 0; i--) {
    let code = upper.charCodeAt(i) - 65 + carry;
    carry = Math.floor(code / 26);
    code = code % 26;
    result = String.fromCharCode(65 + code) + result;
  }
  if (carry > 0) {
    result = 'A' + result;
  }
  return isUpper ? result : result.toLowerCase();
}

export const getCaretBlock = (container: HTMLElement): HTMLElement => {
  const sel = window.getSelection();
  if (!sel || !sel.rangeCount) return container;
  const range = sel.getRangeAt(0);
  let node: Node | null = range.startContainer;
  while (node && node !== container) {
    if (node.nodeType === Node.ELEMENT_NODE) {
      const tag = (node as HTMLElement).tagName.toLowerCase();
      if (['div', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tag)) {
        return node as HTMLElement;
      }
    }
    node = node.parentNode;
  }
  return container;
};

export const detectBlockPrefix = (block: HTMLElement): LinePrefixInfo => {
  const checkbox = block.querySelector('input[type="checkbox"]') as HTMLInputElement | null;
  if (checkbox || block.classList.contains('checklist-item') || block.querySelector('.checklist-item')) {
    return { type: 'checkbox', inputEl: checkbox || undefined };
  }

  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode() as Text | null;
  while (textNode) {
    const val = textNode.nodeValue || '';
    if (val.trim().length > 0) {
      const cleanVal = val.replace(/^[\s\u00A0]+/, '');
      const bulletMatch = /^•\s*/.exec(cleanVal);
      if (bulletMatch) return { type: 'bullet', prefixText: bulletMatch[0] };

      const numMatch = /^(\d+)\.\s*/.exec(cleanVal);
      if (numMatch) return { type: 'number', prefixText: numMatch[0], number: parseInt(numMatch[1], 10) };

      const alphaMatch = /^([A-Za-z])\.\s*/.exec(cleanVal);
      if (alphaMatch) return { type: 'alpha', prefixText: alphaMatch[0], letter: alphaMatch[1] };

      break;
    }
    textNode = walker.nextNode() as Text | null;
  }

  return { type: null };
};

export const removeBlockPrefix = (block: HTMLElement) => {
  block.classList.remove('checklist-item');
  const checkboxes = block.querySelectorAll('input[type="checkbox"]');
  checkboxes.forEach((cb) => cb.remove());
  const spans = block.querySelectorAll('.checklist-text');
  spans.forEach((s) => {
    const parent = s.parentNode;
    if (parent) {
      while (s.firstChild) {
        parent.insertBefore(s.firstChild, s);
      }
      parent.removeChild(s);
    }
  });

  const walker = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  let textNode = walker.nextNode() as Text | null;
  while (textNode) {
    const val = textNode.nodeValue || '';
    if (val.trim().length > 0) {
      textNode.nodeValue = val.replace(/^[\s\u00A0]*(•|\d+\.|[A-Za-z]\.)[\s\u00A0]*/, '');
      break;
    }
    textNode = walker.nextNode() as Text | null;
  }

  const walker2 = document.createTreeWalker(block, NodeFilter.SHOW_TEXT);
  const firstText = walker2.nextNode() as Text | null;
  if (firstText) {
    firstText.nodeValue = (firstText.nodeValue || '').replace(/^[\s\u00A0]+/, '');
  }

  if (!block.innerHTML.trim() || block.innerHTML === '&nbsp;') {
    block.innerHTML = '<br>';
  }
};

interface EditorProps {
  note: Note;
  preferences: UserPreferences;
  currentLang?: LanguageCode;
  saveStatus?: 'saved' | 'saving' | 'error';
  onContentChange: (newContent: string) => void;
  onInstantSave: () => void;
  onImportFile?: (content: string, fileName?: string) => void;
  onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
  onDownloadFile?: () => void;
  onOpenExport?: () => void;
  onOpenHelp?: () => void;
  tabsHeader?: React.ReactNode;
}

const paletteConfig = {
  light: {
    text: [
      "#FF0033",
      "#FF6600",
      "#E5A100",
      "#66CC00",
      "#00B846",
      "#00A3FF",
      "#0044FF",
      "#7E00FF",
      "#FF007F",
      "#B35900"
    ],
    highlighter: [
      "#FF5252",
      "#FFA033",
      "#FFFF00",
      "#BFFF00",
      "#33FF77",
      "#00F5FF",
      "#70A5FF",
      "#D070FF",
      "#FF4DA6",
      "#FFC833"
    ]
  },
  dark: {
    text: [
      "#FF2A55",
      "#FF8000",
      "#FFD500",
      "#8CFF00",
      "#00FF66",
      "#00E5FF",
      "#3D7EFF",
      "#B84DFF",
      "#FF1A9B",
      "#FFB020"
    ],
    highlighter: [
      "#FF3366",
      "#FF8800",
      "#FFEE00",
      "#A6FF00",
      "#00FF7F",
      "#00F0FF",
      "#4D94FF",
      "#C266FF",
      "#FF33B8",
      "#FFB800"
    ]
  }
};

export const FONT_OPTIONS: { value: FontFamily; label: string; family: string }[] = [
  { value: 'rubik', label: 'Plus Jakarta / Rubik', family: "'Plus Jakarta Sans', 'Rubik', sans-serif" },
  { value: 'roboto', label: 'Roboto', family: "'Roboto', sans-serif" },
  { value: 'google-sans', label: 'Google Sans Flex', family: "'Google Sans Flex', 'Plus Jakarta Sans', sans-serif" },
  { value: 'roboto-slab', label: 'Roboto Slab', family: "'Roboto Slab', serif" },
  { value: 'baloo-2', label: 'Baloo 2', family: "'Baloo 2', cursive, sans-serif" },
  { value: 'merriweather-sans', label: 'Merriweather Sans', family: "'Merriweather Sans', sans-serif" },
  { value: 'caveat', label: 'Caveat', family: "'Caveat', cursive, sans-serif" },
  { value: 'comic-relief', label: 'Comic Relief', family: "'Comic Relief', cursive, sans-serif" },
  { value: 'jua', label: 'Jua', family: "'Jua', sans-serif" },
  { value: 'patrick-hand', label: 'Patrick Hand', family: "'Patrick Hand', cursive, sans-serif" },
  { value: 'pt-mono', label: 'PT Mono', family: "'PT Mono', monospace" },
  { value: 'jetbrains-mono', label: 'JetBrains Mono', family: "'JetBrains Mono', monospace" },
  { value: 'geist-mono', label: 'Geist Mono', family: "'Geist Mono', monospace" },
  { value: 'space-mono', label: 'Space Mono', family: "'Space Mono', monospace" },
  { value: 'courier-prime', label: 'Courier Prime', family: "'Courier Prime', monospace" },
  { value: 'cairo', label: 'Cairo', family: "'Cairo', sans-serif" },
  { value: 'noto-sans-arabic', label: 'Noto Sans Arabic', family: "'Noto Sans Arabic', sans-serif" },
  { value: 'almarai', label: 'Almarai', family: "'Almarai', sans-serif" },
  { value: 'noto-kufi-arabic', label: 'Noto Kufi Arabic', family: "'Noto接触Arabic', sans-serif" },
  { value: 'amiri', label: 'Amiri', family: "'Amiri', serif" },
  { value: 'noto-naskh-arabic', label: 'Noto Naskh Arabic', family: "'Noto Naskh Arabic', serif" },
  { value: 'lateef', label: 'Lateef', family: "'Lateef', cursive, serif" },
  { value: 'mirza', label: 'Mirza', family: "'Mirza', cursive, serif" },
  { value: 'amiri-quran', label: 'Amiri Quran', family: "'Amiri Quran', serif" },
  { value: 'alan-sans', label: 'Alan Sans', family: "'Alan Sans', sans-serif" },
  { value: 'beiruti', label: 'Beiruti', family: "'Beiruti', sans-serif" },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function convertPlainTextToHtml(raw: string): string {
  if (!raw) return '';
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw
      .replace(/<span[^>]*>[☐☑]<\/span>/g, '<input type="checkbox" class="note-checkbox notepad-todo-checkbox" contenteditable="false">')
      .replace(/([☐☑])/g, '<input type="checkbox" class="note-checkbox notepad-todo-checkbox" contenteditable="false">');
  }
  const lines = raw.split('\n');
  return lines
    .map((line) => {
      const trimmed = line.trim();
      const checkMatch = /^(\[ \]|\[x\]|\[X\]|☐|☑)\s*(.*)$/.exec(trimmed);
      if (checkMatch) {
        const isChecked = checkMatch[1] === '[x]' || checkMatch[1] === '[X]' || checkMatch[1] === '☑';
        const text = checkMatch[2] || '';
        return `<div class="checklist-item" contenteditable="true"><input type="checkbox" class="note-checkbox notepad-todo-checkbox" contenteditable="false"${isChecked ? ' checked' : ''}><span class="checklist-text">${escapeHtml(text) || '&nbsp;'}</span></div>`;
      }
      return line ? `<div>${escapeHtml(line)}</div>` : '<div><br></div>';
    })
    .join('');
}

export const getFontFamilyStyle = (fontFamily?: string) => {
  if (!fontFamily) return "'Plus Jakarta Sans', 'Rubik', ui-sans-serif, system-ui, sans-serif";
  const match = FONT_OPTIONS.find((f) => f.value === fontFamily);
  if (match) return match.family;
  return "'Plus Jakarta Sans', 'Rubik', ui-sans-serif, system-ui, sans-serif";
};

const EditorComponent: React.FC<EditorProps> = ({
  note,
  preferences,
  currentLang = 'EN',
  saveStatus = 'saved',
  onContentChange,
  onInstantSave,
  onImportFile,
  onUpdatePreferences,
  onDownloadFile,
  onOpenExport,
  onOpenHelp,
  tabsHeader,
}) => {
  const lang = currentLang || preferences.language || 'EN';
  const t: Translations = TRANSLATIONS[lang] || TRANSLATIONS.EN;
  const isRtl = lang === 'AR';

  const isDarkTheme =
    preferences.theme === 'dark' ||
    (typeof document !== 'undefined' && document.documentElement.classList.contains('dark'));
  const colorSwatches = isDarkTheme ? paletteConfig.dark.text : paletteConfig.light.text;
  const highlightSwatches = isDarkTheme ? paletteConfig.dark.highlighter : paletteConfig.light.highlighter;

  const editableRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectedTextColor, setSelectedTextColor] = useState<string | null>(null);
  const [selectedHighlightColor, setSelectedHighlightColor] = useState<string | null>(null);
  const [topShowFontPicker, setTopShowFontPicker] = useState(false);
  const [topShowSizePicker, setTopShowSizePicker] = useState(false);
  const [topShowColorPicker, setTopShowColorPicker] = useState(false);
  const [topShowHighlightPicker, setTopShowHighlightPicker] = useState(false);
  const [topShowClearConfirm, setTopShowClearConfirm] = useState(false);
  const topFontRef = useRef<HTMLDivElement>(null);
  const topSizeRef = useRef<HTMLDivElement>(null);
  const topColorRef = useRef<HTMLDivElement>(null);
  const topHighlightRef = useRef<HTMLDivElement>(null);
  const topClearRef = useRef<HTMLDivElement>(null);
  const savedSelectionRangeRef = useRef<Range | null>(null);

  const isAnyDropdownOpen =
    topShowFontPicker ||
    topShowSizePicker ||
    topShowColorPicker ||
    topShowHighlightPicker ||
    topShowClearConfirm;

  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent | TouchEvent) => {
      const target = e.target as Node;
      if (topFontRef.current && !topFontRef.current.contains(target)) {
        setTopShowFontPicker(false);
      }
      if (topSizeRef.current && !topSizeRef.current.contains(target)) {
        setTopShowSizePicker(false);
      }
      if (topColorRef.current && !topColorRef.current.contains(target)) {
        setTopShowColorPicker(false);
      }
      if (topHighlightRef.current && !topHighlightRef.current.contains(target)) {
        setTopShowHighlightPicker(false);
      }
      if (topClearRef.current && !topClearRef.current.contains(target)) {
        setTopShowClearConfirm(false);
      }
    };

    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setTopShowFontPicker(false);
        setTopShowSizePicker(false);
        setTopShowColorPicker(false);
        setTopShowHighlightPicker(false);
        setTopShowClearConfirm(false);
      }
    };

    const handleScrollDismiss = (e: Event) => {
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.closest('.font-dropdown-menu') ||
          target.closest('.size-dropdown-menu') ||
          target.closest('.color-palette-popup') ||
          target.closest('.clear-confirm-dropdown'))
      ) {
        return;
      }
      setTopShowFontPicker(false);
      setTopShowSizePicker(false);
      setTopShowColorPicker(false);
      setTopShowHighlightPicker(false);
      setTopShowClearConfirm(false);
    };

    document.addEventListener('mousedown', handleOutsideClick);
    document.addEventListener('touchstart', handleOutsideClick, { passive: true });
    document.addEventListener('keydown', handleKeyDown);

    if (isAnyDropdownOpen) {
      window.addEventListener('scroll', handleScrollDismiss, { capture: true, passive: true });
      window.addEventListener('wheel', handleScrollDismiss, { passive: true });
      window.addEventListener('touchmove', handleScrollDismiss, { passive: true });
    }

    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
      document.removeEventListener('touchstart', handleOutsideClick);
      document.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('scroll', handleScrollDismiss, { capture: true });
      window.removeEventListener('wheel', handleScrollDismiss);
      window.removeEventListener('touchmove', handleScrollDismiss);
    };
  }, [isAnyDropdownOpen]);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeNoteIdRef = useRef<string | null>(null);
  const localHtmlRef = useRef(note.content || '');

  const [currentText, setCurrentText] = useState(() => getPlainTextWithNewlines(note.content || ''));
  const [preTypeFormats, setPreTypeFormats] = useState<{
    bold: boolean;
    italic: boolean;
    underline: boolean;
    strikeThrough: boolean;
    color: string | null;
    highlight: string | null;
    align: 'left' | 'center' | 'right';
  }>({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    color: null,
    highlight: null,
    align: isRtl ? 'right' : 'left',
  });
  const preTypeFormatsRef = useRef(preTypeFormats);
  useEffect(() => {
    preTypeFormatsRef.current = preTypeFormats;
  }, [preTypeFormats]);

  const [pendingStyles, setPendingStyles] = useState<{
    bold?: boolean;
    italic?: boolean;
    underline?: boolean;
    strikeThrough?: boolean;
  }>({});
  const pendingStylesRef = useRef(pendingStyles);
  useEffect(() => {
    pendingStylesRef.current = pendingStyles;
  }, [pendingStyles]);

  const isEditorEmpty = useCallback(() => {
    if (!editableRef.current) return true;
    const text = (editableRef.current.innerText || editableRef.current.textContent || '')
      .replace(/[\u200B-\u200D\uFEFF]/g, '')
      .trim();
    return text === '' && !editableRef.current.querySelector('img, input, hr, table');
  }, []);

  const applyPreTypeFormatsToEmptyEditor = useCallback(
    (formats: {
      bold: boolean;
      italic: boolean;
      underline: boolean;
      strikeThrough: boolean;
      color: string | null;
      highlight: string | null;
      align: 'left' | 'center' | 'right';
    }) => {
      if (!editableRef.current) return;
      const editor = editableRef.current;
      editor.style.textAlign = formats.align;
      if (formats.color) {
        editor.style.color = formats.color;
      } else {
        editor.style.color = '';
      }

      const p = document.createElement('p');
      p.style.textAlign = formats.align;

      let leaf: HTMLElement = p;
      if (formats.highlight) {
        const mark = document.createElement('mark');
        mark.className = 'highlight-marker';
        mark.style.backgroundColor = formats.highlight;
        mark.style.display = 'inline';
        mark.style.lineHeight = '1';
        mark.style.padding = '0 3px';
        leaf.appendChild(mark);
        leaf = mark;
      }

      const hasTextStyles =
        formats.bold ||
        formats.italic ||
        formats.underline ||
        formats.strikeThrough ||
        formats.color;

      if (hasTextStyles) {
        const span = document.createElement('span');
        if (formats.bold) span.style.fontWeight = 'bold';
        if (formats.italic) span.style.fontStyle = 'italic';
        if (formats.underline && formats.strikeThrough) {
          span.style.textDecoration = 'underline line-through';
        } else if (formats.underline) {
          span.style.textDecoration = 'underline';
        } else if (formats.strikeThrough) {
          span.style.textDecoration = 'line-through';
        }
        if (formats.color) span.style.color = formats.color;

        span.innerHTML = '&#8203;';
        leaf.appendChild(span);
        leaf = span;
      } else {
        leaf.innerHTML = '&#8203;';
      }

      editor.innerHTML = '';
      editor.appendChild(p);

      const range = document.createRange();
      range.selectNodeContents(leaf);
      range.collapse(false);
      const sel = window.getSelection();
      if (sel) {
        sel.removeAllRanges();
        sel.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
      }
      editor.focus({ preventScroll: true });
    },
    []
  );

  const [activeFormats, setActiveFormats] = useState({
    bold: false,
    italic: false,
    underline: false,
    strikeThrough: false,
    justifyLeft: false,
    justifyCenter: false,
    justifyRight: false,
    insertOrderedList: false,
  });

  const [currentLinePrefixType, setCurrentLinePrefixType] = useState<ListPrefixType>(null);

  const resetAllFormattingToDefault = useCallback(() => {
    const defaultAlign: 'left' | 'center' | 'right' = isRtl ? 'right' : 'left';
    const defaultPre = {
      bold: false,
      italic: false,
      underline: false,
      strikeThrough: false,
      color: null,
      highlight: null,
      align: defaultAlign,
    };
    setPreTypeFormats(defaultPre);
    preTypeFormatsRef.current = defaultPre;
    setPendingStyles({});
    pendingStylesRef.current = {};

    setSelectedTextColor(null);
    setSelectedHighlightColor(null);

    setActiveFormats({
      bold: false,
      italic: false,
      underline: false,
      strikeThrough: false,
      justifyLeft: defaultAlign === 'left',
      justifyCenter: false,
      justifyRight: defaultAlign === 'right',
      insertOrderedList: false,
    });
    setCurrentLinePrefixType(null);

    onUpdatePreferences?.({ fontFamily: 'rubik', fontSize: 16 });

    if (editableRef.current) {
      editableRef.current.style.fontFamily = getFontFamilyStyle('rubik');
      editableRef.current.style.fontSize = '16px';
      editableRef.current.style.setProperty('--font-size', '16px');
      editableRef.current.style.setProperty('--editor-font-size', '16px');
      editableRef.current.style.color = '';
      editableRef.current.style.fontWeight = 'normal';
      editableRef.current.style.fontStyle = 'normal';
      editableRef.current.style.textDecoration = 'none';
      editableRef.current.style.textAlign = defaultAlign;

      if (typeof document !== 'undefined') {
        try {
          if (document.queryCommandState && document.queryCommandState('bold')) {
            document.execCommand('bold', false);
          }
          if (document.queryCommandState && document.queryCommandState('italic')) {
            document.execCommand('italic', false);
          }
          if (document.queryCommandState && document.queryCommandState('underline')) {
            document.execCommand('underline', false);
          }
          if (document.queryCommandState && document.queryCommandState('strikeThrough')) {
            document.execCommand('strikeThrough', false);
          }
          document.execCommand('removeFormat', false);
          document.execCommand('styleWithCSS', false, 'true');
          document.execCommand('hiliteColor', false, 'transparent');
        } catch {}
      }
    }

    setTopShowFontPicker(false);
    setTopShowSizePicker(false);
    setTopShowColorPicker(false);
    setTopShowHighlightPicker(false);
  }, [isRtl, onUpdatePreferences]);

  const checkAndResetIfEmpty = useCallback(() => {
    if (!editableRef.current) return;
    const text = (editableRef.current.innerText || editableRef.current.textContent || '')
      .replace(/[\u200B-\u200D\uFEFF\s\u00A0]/g, '')
      .trim();
    const hasMediaOrInputs = Boolean(editableRef.current.querySelector('img, input, hr, table'));

    if (text === '' && !hasMediaOrInputs) {
      if (editableRef.current.innerHTML !== '') {
        editableRef.current.innerHTML = '';
      }
      resetAllFormattingToDefault();
    }
  }, [resetAllFormattingToDefault]);

  useEffect(() => {
    const defaultAlign: 'left' | 'center' | 'right' = isRtl ? 'right' : 'left';
    if (editableRef.current) {
      editableRef.current.dir = isRtl ? 'rtl' : 'ltr';
      editableRef.current.style.direction = isRtl ? 'rtl' : 'ltr';
      editableRef.current.style.textAlign = defaultAlign;
    }
  }, [isRtl]);

  useEffect(() => {
    if (editableRef.current) {
      const elementsWithInlineColor = editableRef.current.querySelectorAll<HTMLElement>('[style*="color"]');
      elementsWithInlineColor.forEach((el) => {
        const c = el.style.color.toLowerCase().replace(/\s+/g, '');
        if (
          isDarkTheme &&
          (c === '#000000' || c === '#000' || c === '#0f172a' || c === 'rgb(0,0,0)' || c === 'rgb(15,23,42)')
        ) {
          el.style.color = '#F8FAFC';
        } else if (
          !isDarkTheme &&
          (c === '#ffffff' || c === '#fff' || c === '#f8fafc' || c === 'rgb(255,255,255)' || c === 'rgb(248,250,252)')
        ) {
          el.style.color = '#0F172A';
        }
      });
    }
  }, [isDarkTheme]);

  useEffect(() => {
    if (editableRef.current) {
      const formattedHtml = convertPlainTextToHtml(note.content || '');
      if (activeNoteIdRef.current !== note.id || editableRef.current.innerHTML !== formattedHtml) {
        editableRef.current.innerHTML = formattedHtml;
      }
      activeNoteIdRef.current = note.id;
      localHtmlRef.current = note.content || '';
      const text = editableRef.current.innerText || getPlainTextWithNewlines(note.content || '');
      setCurrentText(text);
    }
  }, [note.id]);

  useEffect(() => {
    if (editableRef.current && document.activeElement !== editableRef.current) {
      const formattedHtml = convertPlainTextToHtml(note.content || '');
      if (editableRef.current.innerHTML !== formattedHtml) {
        editableRef.current.innerHTML = formattedHtml;
        localHtmlRef.current = note.content || '';
        const text = editableRef.current.innerText || getPlainTextWithNewlines(note.content || '');
        setCurrentText(text);
      }
    }
  }, [note.content]);

  useEffect(() => {
    const focusEditor = () => {
      if (editableRef.current) {
        editableRef.current.focus({ preventScroll: true });
        try {
          const selection = window.getSelection();
          if (selection && editableRef.current) {
            const range = document.createRange();
            range.selectNodeContents(editableRef.current);
            range.collapse(false);
            selection.removeAllRanges();
            selection.addRange(range);
          }
        } catch {}
      }
    };

    focusEditor();
    const frameId = requestAnimationFrame(focusEditor);
    const timer = setTimeout(focusEditor, 80);
    return () => {
      cancelAnimationFrame(frameId);
      clearTimeout(timer);
    };
  }, []);

  const flushContentChange = useCallback(
    (htmlToSave: string) => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        debounceTimerRef.current = null;
      }
      localHtmlRef.current = htmlToSave;
      onContentChange(htmlToSave);
    },
    [onContentChange]
  );

  const handleInput = useCallback(() => {
    if (!editableRef.current) return;
    cleanEmptyMarks(editableRef.current);

    const sel = window.getSelection();
    if (sel && sel.isCollapsed && sel.anchorNode && editableRef.current.contains(sel.anchorNode)) {
      const node = sel.anchorNode;
      if (node.nodeType === Node.TEXT_NODE) {
        const text = node.textContent || '';
        const offset = sel.anchorOffset;
        const textBeforeCaret = text.slice(0, offset);

        const dotMatch = /(^|\n)(\s*)\.\s$/.exec(textBeforeCaret);
        if (dotMatch) {
          const matchStart = dotMatch.index + (dotMatch[1] ? dotMatch[1].length : 0);
          const indent = dotMatch[2] || '';
          const replacement = `${indent}•  `;
          const newText = text.slice(0, matchStart) + replacement + text.slice(offset);
          node.textContent = newText;
          const newOffset = matchStart + replacement.length;
          const range = document.createRange();
          range.setStart(node, newOffset);
          range.collapse(true);
          sel.removeAllRanges();
          sel.addRange(range);
        } else {
          const boxMatch = /(^|\n)(\s*)(\[\]|\[ \])\s?$/.exec(textBeforeCaret);
          if (boxMatch) {
            const block = getCaretBlock(editableRef.current);
            block.classList.add('checklist-item');
            const cb = document.createElement('input');
            cb.type = 'checkbox';
            cb.className = 'note-checkbox notepad-todo-checkbox';
            cb.setAttribute('contenteditable', 'false');
            const span = document.createElement('span');
            span.className = 'checklist-text';
            span.textContent = '\u00A0';

            block.innerHTML = '';
            block.appendChild(cb);
            block.appendChild(span);

            const range = document.createRange();
            range.selectNodeContents(span);
            range.collapse(false);
            sel.removeAllRanges();
            sel.addRange(range);
            const html = editableRef.current.innerHTML;
            localHtmlRef.current = html;
            setCurrentText(editableRef.current.innerText || '');
            checkAndResetIfEmpty();
            onContentChange(html);
            return;
          }
        }
      }
    }

    const html = editableRef.current.innerHTML;
    localHtmlRef.current = html;
    const plain = editableRef.current ? editableRef.current.innerText || '' : getPlainTextWithNewlines(html);
    setCurrentText(plain);

    checkAndResetIfEmpty();

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    onContentChange(html);
  }, [onContentChange, checkAndResetIfEmpty]);

  useEffect(() => {
    const el = editableRef.current;
    if (!el) return;
    const handleChange = (e: Event) => {
      const target = e.target as HTMLElement;
      if (target && target.tagName === 'INPUT' && (target as HTMLInputElement).type === 'checkbox') {
        const isChecked = (target as HTMLInputElement).checked;
        if (isChecked) {
          target.setAttribute('checked', 'checked');
        } else {
          target.removeAttribute('checked');
        }
        handleInput();
      }
    };
    el.addEventListener('change', handleChange);
    return () => {
      el.removeEventListener('change', handleChange);
    };
  }, [handleInput]);

  const isSelectionInEditor = useCallback(() => {
    if (typeof window === 'undefined') return false;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return false;
    const range = sel.getRangeAt(0);
    const container = editableRef.current;
    if (!container) return false;
    return (
      container.contains(range.commonAncestorContainer) ||
      document.activeElement === container ||
      (savedSelectionRangeRef.current
        ? container.contains(savedSelectionRangeRef.current.commonAncestorContainer)
        : false)
    );
  }, []);

  const queryCurrentFormatAtCaret = useCallback(
    (command: 'bold' | 'italic' | 'underline' | 'strikeThrough'): boolean => {
      if (typeof document === 'undefined') return false;
      try {
        if (document.queryCommandState && document.queryCommandState(command)) {
          return true;
        }
        const sel = window.getSelection();
        if (!sel || !sel.anchorNode) return false;
        let node: Node | null = sel.anchorNode;
        while (node && node !== editableRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const el = node as HTMLElement;
            const tag = el.tagName.toLowerCase();
            if (command === 'bold') {
              if (
                tag === 'b' ||
                tag === 'strong' ||
                el.style.fontWeight === 'bold' ||
                parseInt(el.style.fontWeight, 10) >= 600
              ) {
                return true;
              }
            } else if (command === 'italic') {
              if (tag === 'i' || tag === 'em' || el.style.fontStyle === 'italic') {
                return true;
              }
            } else if (command === 'underline') {
              if (tag === 'u' || (el.style.textDecoration && el.style.textDecoration.includes('underline'))) {
                return true;
              }
            } else if (command === 'strikeThrough') {
              if (
                tag === 's' ||
                tag === 'strike' ||
                (el.style.textDecoration && el.style.textDecoration.includes('line-through'))
              ) {
                return true;
              }
            }
          }
          node = node.parentNode;
        }
        return false;
      } catch {
        return false;
      }
    },
    []
  );

  const updateActiveFormats = useCallback(() => {
    if (typeof document === 'undefined') return;
    const pending = pendingStylesRef.current;
    if (isEditorEmpty()) {
      setActiveFormats({
        bold: pending.bold !== undefined ? pending.bold : preTypeFormatsRef.current.bold,
        italic: pending.italic !== undefined ? pending.italic : preTypeFormatsRef.current.italic,
        underline: pending.underline !== undefined ? pending.underline : preTypeFormatsRef.current.underline,
        strikeThrough: pending.strikeThrough !== undefined ? pending.strikeThrough : preTypeFormatsRef.current.strikeThrough,
        justifyLeft: preTypeFormatsRef.current.align === 'left',
        justifyCenter: preTypeFormatsRef.current.align === 'center',
        justifyRight: preTypeFormatsRef.current.align === 'right',
        insertOrderedList: false,
      });
      setCurrentLinePrefixType(null);
      return;
    }
    const inEditor = isSelectionInEditor();
    if (!inEditor) {
      return;
    }
    try {
      let isBold = queryCurrentFormatAtCaret('bold');
      let isItalic = queryCurrentFormatAtCaret('italic');
      let isUnderline = queryCurrentFormatAtCaret('underline');
      let isStrike = queryCurrentFormatAtCaret('strikeThrough');
      let isJustifyLeft = document.queryCommandState('justifyLeft');
      let isJustifyCenter = document.queryCommandState('justifyCenter');
      let isJustifyRight = document.queryCommandState('justifyRight');

      const sel = window.getSelection();
      let node: Node | null = sel && sel.anchorNode ? sel.anchorNode : null;
      while (node && node !== editableRef.current) {
        if (node.nodeType === Node.ELEMENT_NODE) {
          const el = node as HTMLElement;
          if (el.style.textAlign === 'center') {
            isJustifyCenter = true;
            isJustifyLeft = false;
          } else if (el.style.textAlign === 'right') {
            isJustifyRight = true;
            isJustifyLeft = false;
          } else if (el.style.textAlign === 'left') {
            isJustifyLeft = true;
          }
        }
        node = node.parentNode;
      }

      if (!isJustifyCenter && !isJustifyRight && !isJustifyLeft) {
        if (isRtl) {
          isJustifyRight = true;
          isJustifyLeft = false;
        } else {
          isJustifyLeft = true;
        }
      }

      setActiveFormats({
        bold: pending.bold !== undefined ? pending.bold : isBold,
        italic: pending.italic !== undefined ? pending.italic : isItalic,
        underline: pending.underline !== undefined ? pending.underline : isUnderline,
        strikeThrough: pending.strikeThrough !== undefined ? pending.strikeThrough : isStrike,
        justifyLeft: isJustifyLeft,
        justifyCenter: isJustifyCenter,
        justifyRight: isJustifyRight,
        insertOrderedList: document.queryCommandState('insertOrderedList'),
      });

      if (editableRef.current) {
        const block = getCaretBlock(editableRef.current);
        const prefixInfo = detectBlockPrefix(block);
        setCurrentLinePrefixType(prefixInfo.type);
      }
    } catch {
      // ignore
    }
  }, [isSelectionInEditor, isEditorEmpty, isRtl, queryCurrentFormatAtCaret]);

  const saveCurrentSelection = useCallback(() => {
    if (typeof window === 'undefined') return;
    const sel = window.getSelection();
    if (!sel || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const container = editableRef.current;
    if (container && (container === range.commonAncestorContainer || container.contains(range.commonAncestorContainer))) {
      savedSelectionRangeRef.current = range.cloneRange();
    }
  }, []);

  const restoreSelection = useCallback(() => {
    if (typeof window === 'undefined' || !savedSelectionRangeRef.current) return;
    if (editableRef.current && document.activeElement !== editableRef.current) {
      editableRef.current.focus({ preventScroll: true });
    }
    const sel = window.getSelection();
    if (sel) {
      try {
        sel.removeAllRanges();
        sel.addRange(savedSelectionRangeRef.current);
      } catch {
        // ignore
      }
    }
  }, []);

  useEffect(() => {
    const handleSelectionChange = () => {
      saveCurrentSelection();
      updateActiveFormats();
    };
    document.addEventListener('selectionchange', handleSelectionChange);
    return () => {
      document.removeEventListener('selectionchange', handleSelectionChange);
    };
  }, [saveCurrentSelection, updateActiveFormats]);

  const handleFontSizeSelection = useCallback(
    (sizePx: number) => {
      onUpdatePreferences?.({ fontSize: sizePx });
      if (editableRef.current) {
        editableRef.current.style.fontSize = `${sizePx}px`;
        editableRef.current.style.setProperty('--editor-font-size', `${sizePx}px`);
        editableRef.current.style.setProperty('--font-size', `${sizePx}px`);
        const lineHeightPx = Math.round(sizePx * 2);
        editableRef.current.style.lineHeight = `${lineHeightPx}px`;
        editableRef.current.style.setProperty('--line-height', `${lineHeightPx}px`);
        editableRef.current.style.setProperty('--notepad-line-height', `${lineHeightPx}px`);
        const baselineOffset = Math.round(32 + lineHeightPx * 0.75);
        editableRef.current.style.setProperty('--baseline-offset', `${baselineOffset}px`);
        editableRef.current.style.setProperty('--notepad-line-offset-y', `${baselineOffset}px`);
      }
      restoreSelection();
      if (isEditorEmpty()) {
        applyPreTypeFormatsToEmptyEditor(preTypeFormatsRef.current);
        return;
      }
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && isSelectionInEditor()) {
        try {
          const range = sel.getRangeAt(0);
          const span = document.createElement('span');
          span.style.fontSize = `${sizePx}px`;
          span.appendChild(range.extractContents());
          range.insertNode(span);
          handleInput();
        } catch {
          // ignore
        }
      } else if (editableRef.current) {
        editableRef.current.focus({ preventScroll: true });
      }
    },
    [
      onUpdatePreferences,
      restoreSelection,
      isSelectionInEditor,
      handleInput,
      isEditorEmpty,
      applyPreTypeFormatsToEmptyEditor,
    ]
  );

  const handleFontFamilySelection = useCallback(
    (family: string) => {
      onUpdatePreferences?.({ fontFamily: family as any });
      if (editableRef.current) {
        editableRef.current.style.fontFamily = getFontFamilyStyle(family);
      }
      restoreSelection();
      if (isEditorEmpty()) {
        applyPreTypeFormatsToEmptyEditor(preTypeFormatsRef.current);
        return;
      }
      const sel = window.getSelection();
      if (sel && !sel.isCollapsed && isSelectionInEditor()) {
        try {
          const range = sel.getRangeAt(0);
          const span = document.createElement('span');
          span.style.fontFamily = getFontFamilyStyle(family);
          span.appendChild(range.extractContents());
          range.insertNode(span);
          handleInput();
        } catch {
          // ignore
        }
      } else if (editableRef.current) {
        editableRef.current.focus({ preventScroll: true });
      }
    },
    [
      onUpdatePreferences,
      restoreSelection,
      isSelectionInEditor,
      handleInput,
      isEditorEmpty,
      applyPreTypeFormatsToEmptyEditor,
    ]
  );

  const toggleOrReplacePrefix = useCallback(
    (type: 'checkbox' | 'bullet' | 'number' | 'alpha') => {
      if (!editableRef.current) return;
      restoreSelection();

      if (isEditorEmpty()) {
        let newHtml = '';
        if (type === 'checkbox') {
          newHtml =
            '<div class="checklist-item" contenteditable="true"><input type="checkbox" class="note-checkbox notepad-todo-checkbox" contenteditable="false"><span class="checklist-text">&nbsp;</span></div>';
        } else if (type === 'bullet') {
          newHtml = '<p>•&nbsp;</p>';
        } else if (type === 'number') {
          newHtml = '<p>1.&nbsp;</p>';
        } else if (type === 'alpha') {
          newHtml = '<p>A.&nbsp;</p>';
        }
        editableRef.current.innerHTML = newHtml;
        const block = (editableRef.current.firstElementChild as HTMLElement) || editableRef.current;
        const range = document.createRange();
        range.selectNodeContents(block);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
        editableRef.current.focus({ preventScroll: true });
        setCurrentLinePrefixType(type);
        handleInput();
        return;
      }

      const block = getCaretBlock(editableRef.current);
      let targetBlock = block;
      if (targetBlock === editableRef.current) {
        const sel = window.getSelection();
        if (sel && sel.rangeCount) {
          const range = sel.getRangeAt(0);
          const p = document.createElement('div');
          p.appendChild(range.extractContents());
          range.insertNode(p);
          targetBlock = p;
        }
      }

      const currentPrefix = detectBlockPrefix(targetBlock);

      if (currentPrefix.type === type) {
        removeBlockPrefix(targetBlock);
        setCurrentLinePrefixType(null);
        const range = document.createRange();
        range.selectNodeContents(targetBlock);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
        handleInput();
        return;
      }

      removeBlockPrefix(targetBlock);

      if (targetBlock.innerHTML === '<br>' || targetBlock.innerHTML === '<br/>') {
        targetBlock.innerHTML = '';
      }

      if (type === 'checkbox') {
        targetBlock.classList.add('checklist-item');
        const cb = document.createElement('input');
        cb.type = 'checkbox';
        cb.className = 'note-checkbox notepad-todo-checkbox';
        cb.setAttribute('contenteditable', 'false');
        const span = document.createElement('span');
        span.className = 'checklist-text';
        const initialText = targetBlock.textContent?.trim() || '\u00A0';
        span.textContent = initialText;

        targetBlock.innerHTML = '';
        targetBlock.appendChild(cb);
        targetBlock.appendChild(span);

        const range = document.createRange();
        range.selectNodeContents(span);
        range.collapse(false);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
      } else if (type === 'bullet') {
        const bulletText = document.createTextNode('•\u00A0');
        if (targetBlock.firstChild) {
          targetBlock.insertBefore(bulletText, targetBlock.firstChild);
        } else {
          targetBlock.appendChild(bulletText);
        }
        const range = document.createRange();
        range.setStart(bulletText, bulletText.length);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
      } else if (type === 'number') {
        let nextNum = 1;
        const prevBlock = targetBlock.previousElementSibling as HTMLElement | null;
        if (prevBlock) {
          const prevInfo = detectBlockPrefix(prevBlock);
          if (prevInfo.type === 'number' && prevInfo.number) {
            nextNum = prevInfo.number + 1;
          }
        }
        const numText = document.createTextNode(`${nextNum}.\u00A0`);
        if (targetBlock.firstChild) {
          targetBlock.insertBefore(numText, targetBlock.firstChild);
        } else {
          targetBlock.appendChild(numText);
        }
        const range = document.createRange();
        range.setStart(numText, numText.length);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
      } else if (type === 'alpha') {
        let nextAlpha = 'A';
        const prevBlock = targetBlock.previousElementSibling as HTMLElement | null;
        if (prevBlock) {
          const prevInfo = detectBlockPrefix(prevBlock);
          if (prevInfo.type === 'alpha' && prevInfo.letter) {
            nextAlpha = getNextAlpha(prevInfo.letter);
          }
        }
        const alphaText = document.createTextNode(`${nextAlpha}.\u00A0`);
        if (targetBlock.firstChild) {
          targetBlock.insertBefore(alphaText, targetBlock.firstChild);
        } else {
          targetBlock.appendChild(alphaText);
        }
        const range = document.createRange();
        range.setStart(alphaText, alphaText.length);
        range.collapse(true);
        const sel = window.getSelection();
        sel?.removeAllRanges();
        sel?.addRange(range);
        savedSelectionRangeRef.current = range.cloneRange();
      }

      setCurrentLinePrefixType(type);
      handleInput();
      editableRef.current.focus({ preventScroll: true });
    },
    [isEditorEmpty, handleInput, restoreSelection]
  );

  const execFormat = useCallback(
    (command: string, value: string = '') => {
      if (typeof document === 'undefined') return;

      if (command === 'removeFormat') {
        setPendingStyles({});
        pendingStylesRef.current = {};
        restoreSelection();
        try {
          document.execCommand('removeFormat', false, '');
        } catch {}
        resetAllFormattingToDefault();
        return;
      }

      const isFormattingCmd =
        command === 'bold' ||
        command === 'italic' ||
        command === 'underline' ||
        command === 'strikeThrough';

      if (isFormattingCmd) {
        const formatKey = command as 'bold' | 'italic' | 'underline' | 'strikeThrough';
        const sel = window.getSelection();
        const isCollapsed = !sel || sel.rangeCount === 0 || sel.isCollapsed;

        if (isCollapsed) {
          const currentActive =
            pendingStylesRef.current[formatKey] !== undefined
              ? pendingStylesRef.current[formatKey]!
              : queryCurrentFormatAtCaret(formatKey);

          const nextState = !currentActive;
          const newPending = {
            ...pendingStylesRef.current,
            [formatKey]: nextState,
          };
          setPendingStyles(newPending);
          pendingStylesRef.current = newPending;

          const nextPre = {
            ...preTypeFormatsRef.current,
            [formatKey]: nextState,
          };
          setPreTypeFormats(nextPre);
          preTypeFormatsRef.current = nextPre;

          setActiveFormats((prev) => ({
            ...prev,
            [formatKey]: nextState,
          }));

          try {
            restoreSelection();
            document.execCommand(command, false, value);
          } catch {}

          if (editableRef.current) {
            editableRef.current.focus({ preventScroll: true });
          }
          return;
        } else {
          restoreSelection();
          document.execCommand(command, false, value);
          if (pendingStylesRef.current[formatKey] !== undefined) {
            const newPending = { ...pendingStylesRef.current };
            delete newPending[formatKey];
            setPendingStyles(newPending);
            pendingStylesRef.current = newPending;
          }
          updateActiveFormats();
          saveCurrentSelection();
          if (editableRef.current) {
            editableRef.current.focus({ preventScroll: true });
            handleInput();
          }
          return;
        }
      }

      if (isEditorEmpty()) {
        if (command === 'justifyLeft' || command === 'justifyCenter' || command === 'justifyRight') {
          let targetAlign: 'left' | 'center' | 'right' = 'left';
          if (command === 'justifyCenter') {
            targetAlign = preTypeFormatsRef.current.align === 'center' ? (isRtl ? 'right' : 'left') : 'center';
          } else if (command === 'justifyRight') {
            targetAlign = preTypeFormatsRef.current.align === 'right' ? 'left' : 'right';
          } else {
            targetAlign = 'left';
          }
          const next = { ...preTypeFormatsRef.current, align: targetAlign };
          setPreTypeFormats(next);
          preTypeFormatsRef.current = next;
          setActiveFormats((prev) => ({
            ...prev,
            justifyLeft: targetAlign === 'left',
            justifyCenter: targetAlign === 'center',
            justifyRight: targetAlign === 'right',
          }));
          applyPreTypeFormatsToEmptyEditor(next);
          return;
        }
      }

      restoreSelection();
      document.execCommand(command, false, value);
      updateActiveFormats();
      saveCurrentSelection();
      if (editableRef.current) {
        editableRef.current.focus({ preventScroll: true });
        handleInput();
      }
    },
    [
      isEditorEmpty,
      applyPreTypeFormatsToEmptyEditor,
      isRtl,
      restoreSelection,
      updateActiveFormats,
      saveCurrentSelection,
      handleInput,
      queryCurrentFormatAtCaret,
      resetAllFormattingToDefault,
    ]
  );

  const applyColor = useCallback(
    (hex: string) => {
      setSelectedTextColor(hex);
      restoreSelection();
      if (isEditorEmpty()) {
        const nextColor = hex === 'inherit' ? null : hex;
        const next = { ...preTypeFormatsRef.current, color: nextColor };
        setPreTypeFormats(next);
        preTypeFormatsRef.current = next;
        applyPreTypeFormatsToEmptyEditor(next);
        return;
      }
      try {
        if (hex === 'inherit') {
          document.execCommand('removeFormat', false, 'foreColor');
        } else {
          document.execCommand('styleWithCSS', false, 'true');
          document.execCommand('foreColor', false, hex);
        }
        updateActiveFormats();
        saveCurrentSelection();
        if (editableRef.current) {
          editableRef.current.focus({ preventScroll: true });
          handleInput();
        }
      } catch {}
    },
    [restoreSelection, isEditorEmpty, applyPreTypeFormatsToEmptyEditor, updateActiveFormats, saveCurrentSelection, handleInput]
  );

  const applyHighlight = useCallback(
    (bgHex: string) => {
      setSelectedHighlightColor(bgHex === 'transparent' ? null : bgHex);
      restoreSelection();
      if (isEditorEmpty()) {
        const nextHl = bgHex === 'transparent' ? null : bgHex;
        const next = { ...preTypeFormatsRef.current, highlight: nextHl };
        setPreTypeFormats(next);
        preTypeFormatsRef.current = next;
        applyPreTypeFormatsToEmptyEditor(next);
        return;
      }
      try {
        const sel = window.getSelection();
        if (sel && !sel.isCollapsed && sel.rangeCount > 0) {
          const range = sel.getRangeAt(0);
          if (bgHex === 'transparent') {
            document.execCommand('styleWithCSS', false, 'true');
            document.execCommand('removeFormat', false, 'hiliteColor');
            document.execCommand('removeFormat', false, 'backColor');
            if (editableRef.current) {
              const marks = editableRef.current.querySelectorAll('mark, .highlight-marker');
              marks.forEach((m) => {
                if (range.intersectsNode(m)) {
                  const parent = m.parentNode;
                  while (m.firstChild) {
                    parent?.insertBefore(m.firstChild, m);
                  }
                  m.remove();
                }
              });
            }
          } else {
            const mark = document.createElement('mark');
            mark.className = 'highlight-marker';
            mark.style.backgroundColor = bgHex;
            mark.style.padding = '0 3px';
            mark.style.borderRadius = '3px';
            mark.style.display = 'inline';
            try {
              mark.appendChild(range.extractContents());
              range.insertNode(mark);

              // Boundary isolation: Insert a clean text node immediately after the mark
              const postBoundary = document.createTextNode('');
              if (mark.nextSibling) {
                mark.parentNode?.insertBefore(postBoundary, mark.nextSibling);
              } else {
                mark.parentNode?.appendChild(postBoundary);
              }

              const newRange = document.createRange();
              newRange.setStart(postBoundary, 0);
              newRange.collapse(true);
              sel.removeAllRanges();
              sel.addRange(newRange);
              savedSelectionRangeRef.current = newRange.cloneRange();

              try {
                document.execCommand('styleWithCSS', false, 'true');
                document.execCommand('hiliteColor', false, 'transparent');
              } catch {}
            } catch {
              document.execCommand('styleWithCSS', false, 'true');
              document.execCommand('hiliteColor', false, bgHex);
            }
          }
        } else {
          document.execCommand('styleWithCSS', false, 'true');
          if (bgHex === 'transparent') {
            document.execCommand('removeFormat', false, 'hiliteColor');
            document.execCommand('removeFormat', false, 'backColor');
          } else {
            document.execCommand('hiliteColor', false, bgHex);
          }
        }
        updateActiveFormats();
        saveCurrentSelection();
        if (editableRef.current) {
          editableRef.current.focus({ preventScroll: true });
          handleInput();
        }
      } catch {}
    },
    [restoreSelection, isEditorEmpty, applyPreTypeFormatsToEmptyEditor, updateActiveFormats, saveCurrentSelection, handleInput]
  );

  const transformCase = useCallback(() => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !isSelectionInEditor()) return;

    try {
      const range = sel.getRangeAt(0);
      const selectedText = range.toString();
      if (!selectedText) return;

      const info = getNextCaseInfo(selectedText);
      let transformed = selectedText;
      if (info.nextCase === 'upper') transformed = selectedText.toUpperCase();
      else if (info.nextCase === 'lower') transformed = selectedText.toLowerCase();
      else if (info.nextCase === 'capitalized') {
        transformed = selectedText
          .toLowerCase()
          .replace(/(^\w|\s\w)/g, (m) => m.toUpperCase());
      }

      const textNode = document.createTextNode(transformed);
      range.deleteContents();
      range.insertNode(textNode);

      const newRange = document.createRange();
      newRange.selectNodeContents(textNode);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRangeRef.current = newRange.cloneRange();

      handleInput();
      if (editableRef.current) {
        editableRef.current.focus({ preventScroll: true });
      }
    } catch {}
  }, [restoreSelection, isSelectionInEditor, handleInput]);

  const applyInlineCode = useCallback(() => {
    restoreSelection();
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !isSelectionInEditor()) return;

    try {
      const range = sel.getRangeAt(0);
      const codeEl = document.createElement('code');
      codeEl.appendChild(range.extractContents());
      range.insertNode(codeEl);

      const newRange = document.createRange();
      newRange.selectNodeContents(codeEl);
      newRange.collapse(false);
      sel.removeAllRanges();
      sel.addRange(newRange);
      savedSelectionRangeRef.current = newRange.cloneRange();

      handleInput();
      if (editableRef.current) {
        editableRef.current.focus({ preventScroll: true });
      }
    } catch {}
  }, [restoreSelection, isSelectionInEditor, handleInput]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      e.stopPropagation();
    }
  };

  const handleEditableClick = (e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    if (target && target.tagName === 'INPUT' && target.getAttribute('type') === 'checkbox') {
      const input = target as HTMLInputElement;
      const block = target.closest('.checklist-item');
      if (block) {
        if (input.checked) {
          block.classList.add('checked');
        } else {
          block.classList.remove('checked');
        }
        handleInput();
      }
      return;
    }

    const sel = window.getSelection();
    if (sel && sel.isCollapsed && editableRef.current) {
      const node = sel.anchorNode;
      if (node) {
        let block: Node | null = node;
        while (block && block !== editableRef.current) {
          if (block.nodeType === Node.ELEMENT_NODE) {
            const tag = (block as HTMLElement).tagName.toLowerCase();
            if (['div', 'p', 'li', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'blockquote'].includes(tag)) {
              const prefixInfo = detectBlockPrefix(block as HTMLElement);
              setCurrentLinePrefixType(prefixInfo.type);
              break;
            }
          }
          block = block.parentNode;
        }
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    // Keyboard shortcuts: Ctrl+B / Cmd+B, Ctrl+I / Cmd+I, Ctrl+U / Cmd+U
    if ((e.ctrlKey || e.metaKey) && !e.shiftKey && !e.altKey) {
      if (e.key === 'b' || e.key === 'B') {
        e.preventDefault();
        execFormat('bold');
        return;
      }
      if (e.key === 'i' || e.key === 'I') {
        e.preventDefault();
        execFormat('italic');
        return;
      }
      if (e.key === 'u' || e.key === 'U') {
        e.preventDefault();
        execFormat('underline');
        return;
      }
    }

    if (!e.ctrlKey && !e.metaKey && !e.altKey && e.key.length === 1) {
      const hasPendingStyles =
        pendingStylesRef.current.bold !== undefined ||
        pendingStylesRef.current.italic !== undefined ||
        pendingStylesRef.current.underline !== undefined ||
        pendingStylesRef.current.strikeThrough !== undefined;

      if (hasPendingStyles) {
        const effBold =
          pendingStylesRef.current.bold !== undefined
            ? pendingStylesRef.current.bold!
            : queryCurrentFormatAtCaret('bold');
        const effItalic =
          pendingStylesRef.current.italic !== undefined
            ? pendingStylesRef.current.italic!
            : queryCurrentFormatAtCaret('italic');
        const effUnderline =
          pendingStylesRef.current.underline !== undefined
            ? pendingStylesRef.current.underline!
            : queryCurrentFormatAtCaret('underline');
        const effStrike =
          pendingStylesRef.current.strikeThrough !== undefined
            ? pendingStylesRef.current.strikeThrough!
            : queryCurrentFormatAtCaret('strikeThrough');

        const currentBold = queryCurrentFormatAtCaret('bold');
        const currentItalic = queryCurrentFormatAtCaret('italic');
        const currentUnderline = queryCurrentFormatAtCaret('underline');
        const currentStrike = queryCurrentFormatAtCaret('strikeThrough');

        const matchesCaret =
          effBold === currentBold &&
          effItalic === currentItalic &&
          effUnderline === currentUnderline &&
          effStrike === currentStrike;

        if (!matchesCaret) {
          e.preventDefault();
          const char = e.key === ' ' ? '\u00A0' : e.key;
          const sel = window.getSelection();
          if (sel && editableRef.current) {
            let range: Range;
            if (sel.rangeCount > 0) {
              range = sel.getRangeAt(0);
              range.deleteContents();
            } else {
              range = document.createRange();
              range.selectNodeContents(editableRef.current);
              range.collapse(false);
            }

            const span = document.createElement('span');
            span.style.fontWeight = effBold ? 'bold' : 'normal';
            span.style.fontStyle = effItalic ? 'italic' : 'normal';
            if (effUnderline && effStrike) {
              span.style.textDecoration = 'underline line-through';
            } else if (effUnderline) {
              span.style.textDecoration = 'underline';
            } else if (effStrike) {
              span.style.textDecoration = 'line-through';
            } else {
              span.style.textDecoration = 'none';
            }
            if (selectedTextColor && selectedTextColor !== 'inherit') {
              span.style.color = selectedTextColor;
            }

            const textNode = document.createTextNode(char);
            span.appendChild(textNode);

            if (editableRef.current.innerHTML === '' || !editableRef.current.hasChildNodes()) {
              const p = document.createElement('p');
              p.style.textAlign = preTypeFormatsRef.current.align || (isRtl ? 'right' : 'left');
              p.appendChild(span);
              editableRef.current.innerHTML = '';
              editableRef.current.appendChild(p);
            } else {
              range.insertNode(span);
            }

            const newRange = document.createRange();
            newRange.setStart(textNode, textNode.length);
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRangeRef.current = newRange.cloneRange();

            updateActiveFormats();
            handleInput();
            return;
          }
        }
      }
    }

    if (!e.ctrlKey && !e.metaKey && !e.altKey) {
      if (typeof window !== 'undefined') {
        const sel = window.getSelection();
        if (sel && sel.isCollapsed && sel.anchorNode && editableRef.current) {
          let node: Node | null = sel.anchorNode;
          let highlightWrapper: HTMLElement | null = null;
          while (node && node !== editableRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const el = node as HTMLElement;
              const bg = el.style.backgroundColor;
              const isHighlight =
                el.tagName === 'MARK' ||
                el.classList.contains('highlight-marker') ||
                (bg && bg !== 'transparent' && bg !== 'rgba(0, 0, 0, 0)');
              if (isHighlight) {
                highlightWrapper = el;
                break;
              }
            }
            node = node.parentNode;
          }

          if (highlightWrapper) {
            const anchor = sel.anchorNode;
            const isAtEnd =
              anchor === highlightWrapper
                ? sel.anchorOffset === highlightWrapper.childNodes.length
                : anchor.nodeType === Node.TEXT_NODE &&
                  sel.anchorOffset === (anchor.textContent?.length || 0) &&
                  (anchor === highlightWrapper.lastChild || !anchor.nextSibling);

            if (isAtEnd && (e.key === ' ' || e.key.length === 1)) {
              e.preventDefault();
              const insertChar = e.key === ' ' ? '\u00A0' : e.key;

              let targetNode: Text;
              const nextSib = highlightWrapper.nextSibling;
              if (nextSib && nextSib.nodeType === Node.TEXT_NODE) {
                targetNode = nextSib as Text;
                targetNode.insertData(0, insertChar);
                const r = document.createRange();
                r.setStart(targetNode, insertChar.length);
                r.collapse(true);
                sel.removeAllRanges();
                sel.addRange(r);
              } else {
                targetNode = document.createTextNode(insertChar);
                if (highlightWrapper.nextSibling) {
                  highlightWrapper.parentNode?.insertBefore(targetNode, highlightWrapper.nextSibling);
                } else {
                  highlightWrapper.parentNode?.appendChild(targetNode);
                }
                const r = document.createRange();
                r.setStart(targetNode, insertChar.length);
                r.collapse(true);
                sel.removeAllRanges();
                sel.addRange(r);
              }

              savedSelectionRangeRef.current = sel.getRangeAt(0).cloneRange();
              try {
                document.execCommand('styleWithCSS', false, 'true');
                document.execCommand('hiliteColor', false, 'transparent');
              } catch {}
              handleInput();
              return;
            }
          }
        }
      }
    }

    if (e.key === 'Backspace' || e.key === 'Delete') {
      setTimeout(() => {
        checkAndResetIfEmpty();
        updateActiveFormats();
      }, 0);
    }

    if (e.key === ' ' && editableRef.current) {
      const prefix = getLinePrefixBeforeCaret(editableRef.current, window.getSelection()!);
      if (prefix === '.') {
        e.preventDefault();
        toggleOrReplacePrefix('bullet');
        return;
      }
      if (prefix === '[]' || prefix === '[ ]') {
        e.preventDefault();
        toggleOrReplacePrefix('checkbox');
        return;
      }
    }

    if (e.key === 'Enter' && !e.shiftKey && editableRef.current) {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed) {
        const block = getCaretBlock(editableRef.current);
        const prefixInfo = detectBlockPrefix(block);
        if (prefixInfo.type) {
          const textWithoutPrefix = block.textContent?.replace(/^[\s\u00A0]*([☐☑]|•|\d+\.|[A-Za-z]\.)[\s\u00A0]*/, '').trim() || '';
          if (textWithoutPrefix === '') {
            e.preventDefault();
            removeBlockPrefix(block);
            setCurrentLinePrefixType(null);
            const newDiv = document.createElement('div');
            newDiv.innerHTML = '<br>';
            if (block.nextSibling) {
              block.parentNode?.insertBefore(newDiv, block.nextSibling);
            } else {
              block.parentNode?.appendChild(newDiv);
            }
            const range = document.createRange();
            range.setStart(newDiv, 0);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
            savedSelectionRangeRef.current = range.cloneRange();
            handleInput();
            return;
          } else {
            e.preventDefault();
            const range = sel.getRangeAt(0);
            const preRange = range.cloneRange();
            preRange.selectNodeContents(block);
            preRange.setEnd(range.startContainer, range.startOffset);
            const contents = preRange.cloneContents();
            const trailing = document.createElement('span');
            trailing.appendChild(range.extractContents());

            const newBlock = document.createElement('div');
            let caretTarget: Node | null = null;
            let caretOffset = 0;

            if (prefixInfo.type === 'checkbox') {
              newBlock.className = 'checklist-item';
              const cb = document.createElement('input');
              cb.type = 'checkbox';
              cb.className = 'note-checkbox notepad-todo-checkbox';
              cb.setAttribute('contenteditable', 'false');
              const span = document.createElement('span');
              span.className = 'checklist-text';
              span.innerHTML = '&nbsp;';
              newBlock.appendChild(cb);
              newBlock.appendChild(span);
              caretTarget = span;
              caretOffset = 1;
            } else if (prefixInfo.type === 'bullet') {
              const bullet = document.createTextNode('•\u00A0');
              newBlock.appendChild(bullet);
              caretTarget = bullet;
              caretOffset = 2;
            } else if (prefixInfo.type === 'number') {
              const nextNum = (prefixInfo.number || 1) + 1;
              const numText = document.createTextNode(`${nextNum}.\u00A0`);
              newBlock.appendChild(numText);
              caretTarget = numText;
              caretOffset = numText.length;
            } else if (prefixInfo.type === 'alpha') {
              const nextAlpha = getNextAlpha(prefixInfo.letter || 'A');
              const alphaText = document.createTextNode(`${nextAlpha}.\u00A0`);
              newBlock.appendChild(alphaText);
              caretTarget = alphaText;
              caretOffset = alphaText.length;
            }

            if (trailing.textContent?.trim()) {
              newBlock.appendChild(trailing);
            } else {
              newBlock.appendChild(document.createElement('br'));
            }

            if (block.nextSibling) {
              block.parentNode?.insertBefore(newBlock, block.nextSibling);
            } else {
              block.parentNode?.appendChild(newBlock);
            }

            const newRange = document.createRange();
            if (caretTarget) {
              newRange.setStart(caretTarget, caretOffset);
            } else {
              newRange.setStart(newBlock, 0);
            }
            newRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(newRange);
            savedSelectionRangeRef.current = range.cloneRange();
            setCurrentLinePrefixType(prefixInfo.type);
            handleInput();
            return;
          }
        }
      }
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (!isDraggingFile) setIsDraggingFile(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.currentTarget.contains(e.relatedTarget as Node)) return;
    setIsDraggingFile(false);
  };

  const handleDrop = async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDraggingFile(false);

    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    try {
      const text = await file.text();
      const htmlFormatted = convertPlainTextToHtml(text);
      if (editableRef.current) {
        editableRef.current.innerHTML = htmlFormatted;
      }
      localHtmlRef.current = htmlFormatted;
      setCurrentText(stripHtmlToPlainText(htmlFormatted));
      flushContentChange(htmlFormatted);

      if (onImportFile) {
        onImportFile(text, file.name);
      }
    } catch (err) {
      console.error('Error reading dropped file:', err);
    }
  };

  const pageStyleClass = `page-style-${preferences.pageStyle || 'blank'}`;

  const fontSize = preferences.fontSize || 16;
  const lineHeightRatio = 2;
  const calculatedLineHeightPx = Math.round(fontSize * lineHeightRatio);
  const paddingTop = 32;
  const baselineOffset = Math.round(paddingTop + calculatedLineHeightPx * 0.75);

  const isCollegeOrJournal =
    preferences.pageStyle === 'college' || preferences.pageStyle === 'journal';
  const paddingClass = isCollegeOrJournal
    ? 'pl-20 pr-4 sm:pl-24 sm:pr-12 md:pl-26 md:pr-16 pb-20 sm:pb-24'
    : 'px-4 sm:px-10 md:px-14 pb-20 sm:pb-24';

  const stats = useMemo(() => {
    const computed = calculateTextStats(currentText);
    return {
      wordCount: computed.wordCount,
      charCount: computed.characterCount,
      lineCount: computed.lineCount,
      readingTime: computed.readingTimeMinutes,
    };
  }, [currentText]);

  const toolBtnClass = (isActive: boolean) =>
    `w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg transition-all duration-150 shrink-0 cursor-pointer ${
      isActive
        ? 'btn-format-active bg-indigo-600/12 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300 ring-1 ring-indigo-500/25 font-semibold'
        : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200/70 dark:hover:bg-slate-800/80 hover:text-slate-900 dark:hover:text-white'
    }`;

  return (
    <div
      ref={editorContainerRef}
      id="notepad-canvas-wrapper"
      className="flex-1 w-full max-w-full box-border flex flex-col items-stretch px-0 py-0 relative overflow-visible"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* 1. Top bar and notepads tabs and buttons */}
      {tabsHeader}

      {/* 2. Text Settings Toolbar */}
      <div
        id="editor-main-action-toolbar"
        onMouseDown={(e) => {
          const target = e.target as HTMLElement;
          if (target && target.tagName !== 'SELECT' && target.tagName !== 'OPTION') {
            e.preventDefault();
          }
        }}
        onPointerDown={(e) => {
          const target = e.target as HTMLElement;
          if (target && target.tagName !== 'SELECT' && target.tagName !== 'OPTION') {
            e.preventDefault();
          }
        }}
        className="toolbar border-b border-subtle-theme bg-slate-50/80 dark:bg-[#141822]/90 px-3 sm:px-5 py-2 flex items-center justify-start sm:justify-center gap-1 sm:gap-2 z-40 text-xs select-none w-full max-w-full overflow-x-auto overflow-y-visible relative scrollbar-none touch-pan-x"
        style={{ zIndex: 100, WebkitOverflowScrolling: 'touch' }}
      >
          <div className="flex items-center gap-1 sm:gap-1.5 w-max min-w-full sm:min-w-0 flex-nowrap sm:flex-wrap justify-start sm:justify-center mx-auto shrink-0 overflow-visible relative" style={{ zIndex: 100 }}>
            {/* Group 1: Undo / Redo */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                id="format-undo-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => {
                  document.execCommand('undo');
                  handleInput();
                  saveCurrentSelection();
                }}
                className={toolBtnClass(false)}
                title="Undo (Ctrl+Z)"
                aria-label="Undo"
              >
                <RotateCcw className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="format-redo-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => {
                  document.execCommand('redo');
                  handleInput();
                  saveCurrentSelection();
                }}
                className={toolBtnClass(false)}
                title="Redo (Ctrl+Y)"
                aria-label="Redo"
              >
                <RotateCw className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

            {/* Group 2: Font Family & Font Size */}
            <div className="flex items-center gap-1 shrink-0">
              <div
                className={`relative font-picker-container ${topShowFontPicker ? 'z-[120]' : 'z-50'}`}
                ref={topFontRef}
                style={{ zIndex: topShowFontPicker ? 120 : 50 }}
              >
                <button
                  type="button"
                  id="format-font-family-btn"
                  onClick={() => {
                    setTopShowFontPicker((prev) => !prev);
                    setTopShowSizePicker(false);
                    setTopShowColorPicker(false);
                    setTopShowHighlightPicker(false);
                  }}
                  className={`h-8 px-2.5 flex items-center justify-between gap-1.5 rounded-lg text-xs font-medium cursor-pointer transition-all border min-w-[116px] ${
                    topShowFontPicker
                      ? 'bg-indigo-600/12 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300 border-indigo-500/30 font-semibold'
                      : 'bg-white dark:bg-[#1A1F2C] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                  title="Font Family"
                  aria-label="Font Family"
                >
                  <span className="truncate max-w-[100px]">
                    {FONT_OPTIONS.find((f) => f.value === (preferences.fontFamily || 'rubik'))?.label ||
                      'Plus Jakarta'}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>

                {topShowFontPicker && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ zIndex: 9999 }}
                    className="font-dropdown-menu absolute left-0 top-full mt-1.5 w-60 max-h-72 overflow-y-auto rounded-xl bg-white dark:bg-[#161A24] border border-slate-200/90 dark:border-slate-700/80 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 p-1.5 text-xs text-slate-800 dark:text-slate-100 z-[9999] animate-in fade-in zoom-in-95 duration-100"
                  >
                    {FONT_OPTIONS.map((opt) => {
                      const isCurrent = (preferences.fontFamily || 'rubik') === opt.value;
                      return (
                        <button
                          key={opt.value}
                          type="button"
                          onClick={() => {
                            handleFontFamilySelection(opt.value);
                            setTopShowFontPicker(false);
                          }}
                          style={{ fontFamily: opt.family }}
                          className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? 'font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/15'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <span className="truncate">{opt.label}</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0 ml-1.5" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className={`relative size-picker-container ${topShowSizePicker ? 'z-[120]' : 'z-50'}`}
                ref={topSizeRef}
                style={{ zIndex: topShowSizePicker ? 120 : 50 }}
              >
                <button
                  type="button"
                  id="format-font-size-btn"
                  onClick={() => {
                    setTopShowSizePicker((prev) => !prev);
                    setTopShowFontPicker(false);
                    setTopShowColorPicker(false);
                    setTopShowHighlightPicker(false);
                  }}
                  className={`h-8 px-2.5 flex items-center justify-between gap-1 rounded-lg text-xs font-medium cursor-pointer transition-all border min-w-[64px] tabular-nums ${
                    topShowSizePicker
                      ? 'bg-indigo-600/12 text-indigo-700 dark:bg-indigo-500/25 dark:text-indigo-300 border-indigo-500/30 font-semibold'
                      : 'bg-white dark:bg-[#1A1F2C] hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border-slate-200/80 dark:border-slate-700/80'
                  }`}
                  title={t.fontSizeLabel || 'Font Size'}
                  aria-label="Font Size"
                >
                  <span>{preferences.fontSize || 16}px</span>
                  <ChevronDown className="w-3.5 h-3.5 opacity-60 shrink-0" />
                </button>

                {topShowSizePicker && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ zIndex: 9999 }}
                    className="size-dropdown-menu absolute left-0 top-full mt-1.5 w-32 rounded-xl bg-white dark:bg-[#161A24] border border-slate-200/90 dark:border-slate-700/80 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 p-1.5 text-xs text-slate-800 dark:text-slate-100 z-[9999] animate-in fade-in zoom-in-95 duration-100 tabular-nums"
                  >
                    {[12, 14, 16, 18, 20, 24].map((sz) => {
                      const isCurrent = (preferences.fontSize || 16) === sz;
                      return (
                        <button
                          key={sz}
                          type="button"
                          onClick={() => {
                            handleFontSizeSelection(sz);
                            setTopShowSizePicker(false);
                          }}
                          className={`w-full px-3 py-2 rounded-lg flex items-center justify-between text-left transition-colors cursor-pointer ${
                            isCurrent
                              ? 'font-semibold text-indigo-600 dark:text-indigo-300 bg-indigo-50/80 dark:bg-indigo-500/15'
                              : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80'
                          }`}
                        >
                          <span>{sz}px</span>
                          {isCurrent && <Check className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400 shrink-0" />}
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

            {/* Group 3: Text Formatting */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                id="format-bold-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => execFormat('bold')}
                className={toolBtnClass(activeFormats.bold)}
                title="Bold (Ctrl+B)"
                aria-label="Bold"
              >
                <Bold className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="format-italic-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => execFormat('italic')}
                className={toolBtnClass(activeFormats.italic)}
                title="Italic (Ctrl+I)"
                aria-label="Italic"
              >
                <Italic className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="format-underline-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => execFormat('underline')}
                className={toolBtnClass(activeFormats.underline)}
                title="Underline (Ctrl+U)"
                aria-label="Underline"
              >
                <Underline className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="format-strike-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onPointerDown={(e) => {
                  e.preventDefault();
                }}
                onClick={() => execFormat('strikeThrough')}
                className={toolBtnClass(activeFormats.strikeThrough)}
                title="Strikethrough"
                aria-label="Strikethrough"
              >
                <Strikethrough className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

            {/* Group 4: Text Color & Highlighter Marker */}
            <div className="flex items-center gap-0.5 shrink-0">
              <div
                className={`relative color-picker-container ${topShowColorPicker ? 'z-[120]' : 'z-50'}`}
                ref={topColorRef}
                style={{ zIndex: topShowColorPicker ? 120 : 50 }}
              >
                <button
                  type="button"
                  id="format-color-btn"
                  onMouseDown={(e) => {
                    saveCurrentSelection();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    saveCurrentSelection();
                    setTopShowColorPicker((prev) => !prev);
                    setTopShowHighlightPicker(false);
                    setTopShowFontPicker(false);
                    setTopShowSizePicker(false);
                  }}
                  className={toolBtnClass(topShowColorPicker)}
                  title="Text Color"
                  aria-label="Text Color"
                >
                  <Palette className="w-4 h-4" />
                </button>

                {topShowColorPicker && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ zIndex: 9999 }}
                    className="color-palette-popup absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1.5 rounded-xl bg-white dark:bg-[#161A24] border border-slate-200/90 dark:border-slate-700/80 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 flex flex-row flex-nowrap items-center gap-2 p-2.5 z-[9999] animate-in fade-in zoom-in-95 duration-100 max-w-[94vw] overflow-visible"
                  >
                    {colorSwatches.map((hex, index) => {
                      const isSelected = selectedTextColor === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => {
                            applyColor(hex);
                            setTopShowColorPicker(false);
                          }}
                          className={`color-swatch-circle relative w-6 h-6 rounded-full cursor-pointer shrink-0 transition-transform hover:scale-110 ${
                            isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#161A24]' : ''
                          }`}
                          style={{ backgroundColor: hex }}
                          aria-label={`Color swatch ${index + 1}: ${hex}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>

              <div
                className={`relative highlight-picker-container ${topShowHighlightPicker ? 'z-[120]' : 'z-50'}`}
                ref={topHighlightRef}
                style={{ zIndex: topShowHighlightPicker ? 120 : 50 }}
              >
                <button
                  type="button"
                  id="format-highlight-btn"
                  onMouseDown={(e) => {
                    saveCurrentSelection();
                    e.preventDefault();
                  }}
                  onClick={(e) => {
                    e.preventDefault();
                    saveCurrentSelection();
                    setTopShowHighlightPicker((prev) => !prev);
                    setTopShowColorPicker(false);
                    setTopShowFontPicker(false);
                    setTopShowSizePicker(false);
                  }}
                  className={toolBtnClass(topShowHighlightPicker)}
                  title="Highlighter Marker"
                  aria-label="Highlighter Marker"
                >
                  <Highlighter className="w-4 h-4" />
                </button>

                {topShowHighlightPicker && (
                  <div
                    id="highlight-circles-palette"
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ zIndex: 9999 }}
                    className="color-palette-popup absolute left-0 sm:left-1/2 sm:-translate-x-1/2 top-full mt-1.5 rounded-xl bg-white dark:bg-[#161A24] border border-slate-200/90 dark:border-slate-700/80 shadow-2xl ring-1 ring-slate-900/10 dark:ring-white/10 flex flex-row flex-nowrap items-center gap-2 p-2.5 z-[9999] animate-in fade-in zoom-in-95 duration-100 max-w-[94vw] overflow-visible"
                  >
                    {highlightSwatches.map((hex, index) => {
                      const isSelected = selectedHighlightColor === hex;
                      return (
                        <button
                          key={hex}
                          type="button"
                          onMouseDown={(e) => {
                            e.preventDefault();
                            e.stopPropagation();
                          }}
                          onClick={() => {
                            applyHighlight(hex);
                            setTopShowHighlightPicker(false);
                          }}
                          className={`color-swatch-circle relative w-6 h-6 rounded-full cursor-pointer shrink-0 transition-transform hover:scale-110 ${
                            isSelected ? 'ring-2 ring-emerald-500 ring-offset-2 dark:ring-offset-[#161A24]' : ''
                          }`}
                          style={{ backgroundColor: hex }}
                          aria-label={`Highlighter swatch ${index + 1}: ${hex}`}
                        />
                      );
                    })}
                  </div>
                )}
              </div>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

            {/* Group 5: Lists & Code */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                id="format-checkbox-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => toggleOrReplacePrefix('checkbox')}
                className={toolBtnClass(currentLinePrefixType === 'checkbox')}
                title="Interactive Checklist (☐ )"
                aria-label="Checklist"
              >
                <CheckSquare className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="format-bullet-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => toggleOrReplacePrefix('bullet')}
                className={toolBtnClass(currentLinePrefixType === 'bullet')}
                title="Bullet Points (• )"
                aria-label="Bullet Points"
              >
                <List className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="format-numbered-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => toggleOrReplacePrefix('number')}
                className={toolBtnClass(currentLinePrefixType === 'number')}
                title="Numbered List (1. 2. 3.)"
                aria-label="Numbered List"
              >
                <ListOrdered className="w-4 h-4" />
              </button>

              <button
                type="button"
                id="format-alpha-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => toggleOrReplacePrefix('alpha')}
                className={toolBtnClass(currentLinePrefixType === 'alpha')}
                title="Alphabetical List (A. B. C.)"
                aria-label="Alphabetical List"
              >
                <span className="text-[11px] font-bold font-mono leading-none">A.</span>
              </button>

              <button
                type="button"
                id="format-code-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={applyInlineCode}
                className={toolBtnClass(false)}
                title="Inline Code (</>)"
                aria-label="Inline Code"
              >
                <Code className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

            {/* Group 6: Alignment */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                id="format-align-left-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => execFormat('justifyLeft')}
                className={toolBtnClass(activeFormats.justifyLeft)}
                title="Align Left"
                aria-label="Align Left"
              >
                <AlignLeft className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="format-align-center-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => execFormat('justifyCenter')}
                className={toolBtnClass(activeFormats.justifyCenter)}
                title="Align Center"
                aria-label="Align Center"
              >
                <AlignCenter className="w-4 h-4" />
              </button>
              <button
                type="button"
                id="format-align-right-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => execFormat('justifyRight')}
                className={toolBtnClass(activeFormats.justifyRight)}
                title="Align Right"
                aria-label="Align Right"
              >
                <AlignRight className="w-4 h-4" />
              </button>
            </div>

            <div className="w-px h-4 bg-slate-200 dark:bg-slate-700/80 mx-1 shrink-0" />

            {/* Group 7: Case & Clear */}
            <div className="flex items-center gap-0.5 shrink-0">
              <button
                type="button"
                id="format-case-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={transformCase}
                className={toolBtnClass(false)}
                title="Toggle Case (UPPERCASE / lowercase / Capitalized)"
                aria-label="Toggle Case"
              >
                <span className="text-xs font-bold font-mono">Aa</span>
              </button>
              <button
                type="button"
                id="format-clear-btn"
                onMouseDown={(e) => {
                  saveCurrentSelection();
                  e.preventDefault();
                }}
                onClick={() => execFormat('removeFormat')}
                className={toolBtnClass(false)}
                title="Clear Formatting"
                aria-label="Clear Formatting"
              >
                <RemoveFormatting className="w-4 h-4" />
              </button>
              <div
                className={`relative clear-confirm-container ${topShowClearConfirm ? 'z-[120]' : 'z-50'}`}
                ref={topClearRef}
                style={{ zIndex: topShowClearConfirm ? 120 : 50 }}
              >
                <button
                  type="button"
                  id="format-clear-notepad-btn"
                  onClick={() => setTopShowClearConfirm((prev) => !prev)}
                  className="w-8 h-8 min-w-[32px] min-h-[32px] flex items-center justify-center rounded-lg text-slate-500 hover:text-rose-600 dark:text-slate-400 dark:hover:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors shrink-0 cursor-pointer"
                  title="Clear Notepad Content"
                  aria-label="Clear Notepad Content"
                >
                  <Trash2 className="w-4 h-4" />
                </button>

                {topShowClearConfirm && (
                  <div
                    onMouseDown={(e) => e.preventDefault()}
                    style={{ zIndex: 9999 }}
                    className="clear-confirm-dropdown absolute right-0 top-full mt-1.5 w-56 p-3.5 bg-white dark:bg-[#161A24] text-slate-800 dark:text-slate-100 border border-slate-200/90 dark:border-slate-700/80 shadow-2xl rounded-xl text-xs space-y-2.5 z-[9999] animate-in fade-in zoom-in-95 duration-100"
                  >
                    <p className="font-bold text-slate-900 dark:text-white">Clear note content?</p>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      This will remove all text from the current note.
                    </p>
                    <div className="flex items-center gap-2 pt-1">
                      <button
                        type="button"
                        onClick={() => {
                          if (editableRef.current) {
                            editableRef.current.innerHTML = '';
                            editableRef.current.focus();
                            try {
                              const sel = window.getSelection();
                              if (sel) {
                                const range = document.createRange();
                                range.selectNodeContents(editableRef.current);
                                range.collapse(true);
                                sel.removeAllRanges();
                                sel.addRange(range);
                              }
                            } catch {}
                          }
                          localHtmlRef.current = '';
                          setCurrentText('');
                          flushContentChange('');
                          setTopShowClearConfirm(false);
                          resetAllFormattingToDefault();
                          if (typeof window !== 'undefined') {
                            window.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                            document.documentElement.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                            document.body.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                            if (editorContainerRef.current) {
                              editorContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
                            }
                          }
                        }}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold text-xs transition cursor-pointer"
                      >
                        Clear
                      </button>
                      <button
                        type="button"
                        onClick={() => setTopShowClearConfirm(false)}
                        className="flex-1 py-1.5 px-2.5 rounded-lg bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 font-semibold text-xs transition cursor-pointer"
                      >
                        Cancel
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

      {/* 3. Paper Sheet Surface */}
      <div
        ref={sheetContainerRef}
        id="notepad-paper-sheet"
        className="w-full max-w-full box-border flex-1 flex flex-col rounded-none paper-sheet-container text-primary-theme relative transition-all duration-150 overflow-visible min-h-[800px] z-0"
        style={{ zIndex: 1 }}
      >
        {/* Drag & Drop File Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-30 bg-indigo-600/8 dark:bg-indigo-400/10 backdrop-blur-xs border-2 border-dashed border-indigo-500 sm:rounded-2xl flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-paper-theme px-6 py-4 rounded-xl shadow-lg border border-subtle-theme flex items-center gap-3 text-primary-theme font-semibold text-sm">
              <Upload className="w-5 h-5 text-indigo-500 animate-bounce" />
              <span>Drop .txt or .md file to open in note</span>
            </div>
          </div>
        )}

        {/* Editor Writing Canvas Area */}
        <div
          className="flex-1 flex flex-col min-h-[800px] relative cursor-text w-full max-w-full box-border z-0 overflow-visible"
          style={{ zIndex: 1 }}
          onClick={() => {
            if (editableRef.current && document.activeElement !== editableRef.current) {
              editableRef.current.focus();
            }
          }}
        >
          <div
            ref={editableRef}
            id="notepad-text-input"
            contentEditable={true}
            suppressContentEditableWarning={true}
            onInput={handleInput}
            onKeyDown={handleKeyDown}
            onClick={handleEditableClick}
            onDoubleClick={handleDoubleClick}
            onSelect={saveCurrentSelection}
            onKeyUp={(e) => {
              if (e.key === 'Enter' && editableRef.current) {
                cleanEmptyMarks(editableRef.current);
              }
              checkAndResetIfEmpty();
              updateActiveFormats();
              saveCurrentSelection();
            }}
            onCut={() => {
              setTimeout(() => {
                checkAndResetIfEmpty();
                updateActiveFormats();
              }, 0);
            }}
            onMouseUp={saveCurrentSelection}
            spellCheck={preferences.spellCheck}
            dir={isRtl ? 'rtl' : 'ltr'}
            data-lang={lang}
            data-placeholder={
              isRtl
                ? 'ابدأ في كتابة ملاحظاتك هنا... اكتب \'. \' للقوائم النقطية أو \'[] \' لقوائم المهام.'
                : "Start typing your notes... Type '. ' for bullets, '[] ' for checklists, or select text to format."
            }
            aria-label="Note Content"
            className={`w-full max-w-full box-border flex-1 notepad-editable text-primary-theme min-h-[800px] ${pageStyleClass} ${paddingClass}`}
            style={
              {
                fontSize: `${fontSize}px`,
                fontFamily: getFontFamilyStyle(preferences.fontFamily),
                lineHeight: `${calculatedLineHeightPx}px`,
                paddingTop: `${paddingTop}px`,
                minHeight: '800px',
                direction: isRtl ? 'rtl' : 'ltr',
                textAlign: preTypeFormats.align || (isRtl ? 'right' : 'left'),
                color: preTypeFormats.color || undefined,
                '--editor-font-size': `${fontSize}px`,
                '--line-height-ratio': '2',
                '--line-height': `${calculatedLineHeightPx}px`,
                '--notepad-line-height': `${calculatedLineHeightPx}px`,
                '--padding-top': `${paddingTop}px`,
                '--baseline-ratio': '0.75',
                '--baseline-offset': `${baselineOffset}px`,
                '--notepad-line-offset-y': `${baselineOffset}px`,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Status Bar Dock */}
        <footer
          id="notepad-status-bar"
          className="border-t border-subtle-theme px-3 sm:px-6 py-2.5 sm:py-2.5 flex flex-col sm:flex-row items-center justify-between gap-2.5 text-xs text-secondary-theme select-none bg-slate-50/50 dark:bg-[#131722]/60 sm:rounded-b-2xl w-full"
        >
          {/* Line 1: Counters */}
          <div
            id="status-counters-row"
            className="flex items-center justify-center gap-2 sm:gap-3.5 text-xs font-medium tabular-nums whitespace-nowrap overflow-x-auto no-scrollbar w-full sm:w-auto"
          >
            {preferences.showWordCount && (
              <span className="flex items-center gap-1.5 status-counter-words">
                <FileText id="status-word-count-icon" className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                <span className="text-primary-theme font-semibold">{stats.wordCount}</span>
                <span>{t.words}</span>
              </span>
            )}

            {(preferences.showLineCount ?? true) && (
              <>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 status-counter-lines">
                  <AlignJustify id="status-line-count-icon" className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                  <span className="text-primary-theme font-semibold">{stats.lineCount}</span>
                  <span>{t.lines}</span>
                </span>
              </>
            )}

            {preferences.showCharacterCount && (
              <>
                <span className="text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                <span className="flex items-center gap-1.5 status-counter-chars">
                  <Hash id="status-char-count-icon" className="w-3.5 h-3.5 text-purple-500 dark:text-purple-400" />
                  <span className="text-primary-theme font-semibold">{stats.charCount}</span>
                  <span>{t.characters}</span>
                </span>
              </>
            )}

            {preferences.showReadingTime && (
              <>
                <span className="hidden md:inline text-slate-300 dark:text-slate-700" aria-hidden="true">·</span>
                <span className="hidden md:flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                  <span>~{stats.readingTime} {t.readingTime}</span>
                </span>
              </>
            )}
          </div>

          {/* Line 2: Actions Row */}
          <div
            id="status-actions-row"
            className="flex items-center justify-center gap-3 w-full sm:w-auto sm:ml-auto mt-2 sm:mt-0 flex-wrap"
          >
            <button
              type="button"
              id="notepad-footer-export-btn"
              onClick={onOpenExport}
              className="h-7 px-3.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-[#1A1F2C] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={t.export}
              aria-label={t.export}
            >
              <Download className="w-3.5 h-3.5 text-indigo-600 dark:text-indigo-400" />
              <span>{t.export}</span>
            </button>
            <button
              type="button"
              id="notepad-footer-help-btn"
              onClick={onOpenHelp}
              className="h-7 px-3.5 rounded-lg text-xs font-semibold bg-white hover:bg-slate-100 dark:bg-[#1A1F2C] dark:hover:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200/80 dark:border-slate-700/80 transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
              title={t.help}
              aria-label={t.help}
            >
              <HelpCircle className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>{t.help}</span>
            </button>

            {/* Saved status indicator */}
            <span
              id="notepad-status-saved-indicator"
              className="inline-flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium text-xs ml-1"
            >
              <Check className="w-3.5 h-3.5 shrink-0" />
              <span>{saveStatus === 'saving' ? t.savingStatus : t.savedStatus}</span>
            </span>
          </div>
        </footer>
      </div>
    </div>
  );
};

export const Editor = React.memo(EditorComponent);
