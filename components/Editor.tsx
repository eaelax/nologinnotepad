'use client';

import React, { useRef, useEffect, useCallback, useState, useMemo } from 'react';
import { Note, UserPreferences } from '@/types/note';
import {
  Upload,
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Palette,
  Code,
  Highlighter,
  List,
  CheckSquare,
  RemoveFormatting,
} from 'lucide-react';
import { stripHtmlToPlainText, getPlainTextWithNewlines } from '@/lib/services/note-service';

// Determine the next case state and icon text (AB / Ab / ab)
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
    // Current is ALL UPPERCASE -> Next is lowercase (ab)
    return { iconText: 'ab' as const, nextCase: 'lower' as const, title: 'Convert to lowercase (ab)' };
  } else if (isAllLower) {
    // Current is all lowercase -> Next is Capitalized (Ab)
    return { iconText: 'Ab' as const, nextCase: 'capitalized' as const, title: 'Convert to Capitalized (Ab)' };
  } else {
    // Current is mixed / Capitalized -> Next is UPPERCASE (AB)
    return { iconText: 'AB' as const, nextCase: 'upper' as const, title: 'Convert to UPPERCASE (AB)' };
  }
};

// Clean up any empty mark elements (e.g. from Enter splits or blank spans)
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
      // If it has no printable characters
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

// Retrieve text preceding the caret on the current visual line
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

interface EditorProps {
  note: Note;
  preferences: UserPreferences;
  onContentChange: (newContent: string) => void;
  onInstantSave: () => void;
  onImportFile?: (content: string, fileName?: string) => void;
  onUpdatePreferences?: (updates: Partial<UserPreferences>) => void;
}

interface SelectionToolbarState {
  visible: boolean;
  top: number;
  left: number;
  text: string;
}

const COLOR_SWATCHES = [
  { label: 'Default', hex: 'inherit' },
  { label: 'Red', hex: '#ef4444' },
  { label: 'Crimson', hex: '#e11d48' },
  { label: 'Orange', hex: '#f97316' },
  { label: 'Amber', hex: '#f59e0b' },
  { label: 'Emerald', hex: '#10b981' },
  { label: 'Teal', hex: '#14b8a6' },
  { label: 'Cyan', hex: '#06b6d4' },
  { label: 'Blue', hex: '#3b82f6' },
  { label: 'Indigo', hex: '#6366f1' },
  { label: 'Purple', hex: '#8b5cf6' },
  { label: 'Pink', hex: '#ec4899' },
  { label: 'Slate', hex: '#64748b' },
];

const HIGHLIGHT_SWATCHES = [
  { label: 'None', hex: 'transparent' },
  { label: 'Yellow', hex: '#fef08a' },
  { label: 'Amber', hex: '#fde68a' },
  { label: 'Green', hex: '#bbf7d0' },
  { label: 'Emerald', hex: '#a7f3d0' },
  { label: 'Teal', hex: '#99f6e4' },
  { label: 'Sky', hex: '#bae6fd' },
  { label: 'Blue', hex: '#bfdbfe' },
  { label: 'Indigo', hex: '#c7d2fe' },
  { label: 'Purple', hex: '#e9d5ff' },
  { label: 'Fuchsia', hex: '#f5d0fe' },
  { label: 'Pink', hex: '#fbcfe8' },
  { label: 'Rose', hex: '#fecdd3' },
  { label: 'Orange', hex: '#fed7aa' },
];

function escapeHtml(text: string): string {
  return text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function convertPlainTextToHtml(raw: string): string {
  if (!raw) return '';
  // If it already has HTML formatting, return it
  if (/<[a-z][\s\S]*>/i.test(raw)) {
    return raw;
  }
  // Convert newlines to div blocks
  const lines = raw.split('\n');
  return lines
    .map((line) => (line ? `<div>${escapeHtml(line)}</div>` : '<div><br></div>'))
    .join('');
}

const EditorComponent: React.FC<EditorProps> = ({
  note,
  preferences,
  onContentChange,
  onInstantSave,
  onImportFile,
}) => {
  const editableRef = useRef<HTMLDivElement>(null);
  const editorContainerRef = useRef<HTMLDivElement>(null);
  const sheetContainerRef = useRef<HTMLDivElement>(null);

  const [isDraggingFile, setIsDraggingFile] = useState(false);
  const [selectionToolbar, setSelectionToolbar] = useState<SelectionToolbarState | null>(null);
  const [showColorPicker, setShowColorPicker] = useState(false);
  const [showHighlightPicker, setShowHighlightPicker] = useState(false);

  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);
  const activeNoteIdRef = useRef(note.id);
  const localHtmlRef = useRef(note.content || '');

  // Local text stats for status bar
  const [currentText, setCurrentText] = useState(() => getPlainTextWithNewlines(note.content || ''));

  // Sync editor content when active note changes
  useEffect(() => {
    if (activeNoteIdRef.current !== note.id || !editableRef.current) {
      activeNoteIdRef.current = note.id;
      localHtmlRef.current = note.content || '';
      if (editableRef.current) {
        editableRef.current.innerHTML = convertPlainTextToHtml(note.content || '');
      }
      setCurrentText(getPlainTextWithNewlines(note.content || ''));
      setSelectionToolbar(null);
    }
  }, [note.id, note.content]);

  // Initial mount focus
  useEffect(() => {
    if (editableRef.current) {
      editableRef.current.focus({ preventScroll: true });
    }
  }, []);

  // Flush pending content change on unmount
  useEffect(() => {
    return () => {
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
        onContentChange(localHtmlRef.current);
      }
    };
  }, [onContentChange]);

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

  // Called on every keystroke/input inside contentEditable
  const handleInput = useCallback(() => {
    if (!editableRef.current) return;
    cleanEmptyMarks(editableRef.current);
    const html = editableRef.current.innerHTML;
    localHtmlRef.current = html;
    setCurrentText(getPlainTextWithNewlines(html));

    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }

    debounceTimerRef.current = setTimeout(() => {
      onContentChange(html);
    }, 200);
  }, [onContentChange]);

  // Floating selection bubble toolbar positioning & auto-trimming trailing whitespace
  const updateSelectionToolbar = useCallback(() => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) {
      setSelectionToolbar(null);
      setShowColorPicker(false);
      setShowHighlightPicker(false);
      return;
    }

    const range = sel.getRangeAt(0);
    const container = editableRef.current;
    const sheet = sheetContainerRef.current;
    if (!container || !sheet || !container.contains(range.commonAncestorContainer)) {
      setSelectionToolbar(null);
      return;
    }

    // If selection ends or begins with whitespace (e.g. browser double-click selects 'word '),
    // trim the trailing or leading whitespace so only the actual word/text is selected
    if (
      range.endContainer.nodeType === Node.TEXT_NODE &&
      range.startContainer.nodeType === Node.TEXT_NODE
    ) {
      let modified = false;
      const endText = range.endContainer.textContent || '';
      let endOffset = range.endOffset;
      while (endOffset > 0 && /\s/.test(endText[endOffset - 1])) {
        // If range is within the same node, don't shrink past startOffset
        if (range.startContainer === range.endContainer && endOffset <= range.startOffset) {
          break;
        }
        endOffset--;
        modified = true;
      }

      if (modified) {
        try {
          range.setEnd(range.endContainer, endOffset);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch {
          // ignore if range modification fails
        }
      }
    }

    const text = sel.toString().trim();
    if (!text) {
      setSelectionToolbar(null);
      return;
    }

    try {
      const rect = range.getBoundingClientRect();
      const sheetRect = sheet.getBoundingClientRect();

      // Position toolbar above selection
      const toolbarHeight = 44;
      const toolbarWidth = 360;
      let topPos = rect.top - sheetRect.top - toolbarHeight - 8;

      // If selection is near top of paper sheet, flip below selection
      if (topPos < 10) {
        topPos = rect.bottom - sheetRect.top + 8;
      }

      // Center horizontally on selected text and clamp inside paper sheet
      const centerLeft = rect.left - sheetRect.left + rect.width / 2;
      const leftPos = Math.max(12, Math.min(sheetRect.width - toolbarWidth - 12, centerLeft - toolbarWidth / 2));

      setSelectionToolbar({
        visible: true,
        top: topPos,
        left: leftPos,
        text,
      });
    } catch {
      setSelectionToolbar(null);
    }
  }, []);

  // True Rich-Text Formatting Actions
  const execFormat = useCallback(
    (command: string, value: string = '') => {
      if (typeof document === 'undefined') return;
      document.execCommand('styleWithCSS', false, 'true');
      document.execCommand(command, false, value);
      handleInput();
      requestAnimationFrame(() => {
        updateSelectionToolbar();
      });
    },
    [handleInput, updateSelectionToolbar]
  );

  // Apply color format
  const applyColor = (hex: string) => {
    if (hex === 'inherit') {
      execFormat('removeFormat');
    } else {
      execFormat('foreColor', hex);
    }
    setShowColorPicker(false);
  };

  // Apply Highlight format with circular swatch selection
  const applyHighlight = useCallback(
    (bgHex: string) => {
      const sel = window.getSelection();
      if (!sel || !sel.rangeCount) return;
      const range = sel.getRangeAt(0);
      const container = editableRef.current;
      if (!container) return;

      if (!bgHex || bgHex === 'transparent') {
        // Remove highlight from selected text
        let parent: Node | null = range.commonAncestorContainer;
        while (parent && parent !== container) {
          if (parent.nodeType === Node.ELEMENT_NODE) {
            const el = parent as HTMLElement;
            if (el.tagName === 'MARK' || el.style.backgroundColor) {
              el.style.backgroundColor = '';
              if (el.tagName === 'MARK') {
                const p = el.parentNode;
                if (p) {
                  while (el.firstChild) {
                    p.insertBefore(el.firstChild, el);
                  }
                  p.removeChild(el);
                }
              }
              break;
            }
          }
          parent = parent.parentNode;
        }

        const allMarks = container.querySelectorAll('mark, [style*="background-color"]');
        allMarks.forEach((m) => {
          const el = m as HTMLElement;
          if (range.intersectsNode(el)) {
            el.style.backgroundColor = '';
            if (el.tagName === 'MARK') {
              const p = el.parentNode;
              if (p) {
                while (el.firstChild) {
                  p.insertBefore(el.firstChild, el);
                }
                p.removeChild(el);
              }
            }
          }
        });

        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('hiliteColor', false, 'transparent');
        handleInput();
        setShowHighlightPicker(false);
        return;
      }

      if (range.collapsed) return;

      try {
        const fragment = range.extractContents();
        const mark = document.createElement('mark');
        mark.style.backgroundColor = bgHex;
        mark.style.color = '#111827';
        mark.style.borderRadius = '3px';
        mark.style.padding = '1px 3px';
        mark.appendChild(fragment);

        range.insertNode(mark);

        // Add empty text node immediately following mark
        // so future typing at the caret position does NOT continue inside mark!
        const separator = document.createTextNode('');
        if (mark.nextSibling) {
          mark.parentNode?.insertBefore(separator, mark.nextSibling);
        } else {
          mark.parentNode?.appendChild(separator);
        }

        // Position caret on the unstyled separator
        const newRange = document.createRange();
        newRange.setStart(separator, 0);
        newRange.collapse(true);
        sel.removeAllRanges();
        sel.addRange(newRange);
      } catch {
        document.execCommand('styleWithCSS', false, 'true');
        document.execCommand('hiliteColor', false, bgHex);
      }

      handleInput();
      setShowHighlightPicker(false);
      setSelectionToolbar(null);
    },
    [handleInput]
  );

  // Inline Code format: wraps in <code> and inserts a space before and after
  const applyInlineCode = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const selected = range.extractContents();

    const spaceBefore = document.createTextNode(' ');
    const codeEl = document.createElement('code');
    codeEl.appendChild(selected);
    const spaceAfter = document.createTextNode(' ');

    const fragment = document.createDocumentFragment();
    fragment.appendChild(spaceBefore);
    fragment.appendChild(codeEl);
    fragment.appendChild(spaceAfter);

    range.insertNode(fragment);

    // Place caret immediately after the trailing space
    const newRange = document.createRange();
    newRange.setStartAfter(spaceAfter);
    newRange.collapse(true);
    sel.removeAllRanges();
    sel.addRange(newRange);

    handleInput();
    setSelectionToolbar(null);
  };

  // Change Case (UPPERCASE -> lowercase -> Capitalized)
  const transformCase = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const text = sel.toString();
    if (!text) return;

    const caseInfo = getNextCaseInfo(text);
    let transformed = text;

    if (caseInfo.nextCase === 'lower') {
      transformed = text.toLowerCase();
    } else if (caseInfo.nextCase === 'capitalized') {
      transformed = text.replace(/\b([a-zA-Z])/g, (c) => c.toUpperCase());
    } else {
      transformed = text.toUpperCase();
    }

    document.execCommand('insertText', false, transformed);
    handleInput();

    // Keep the transformed text selected so the next icon (AB / Ab / ab) is shown immediately
    const currentSel = window.getSelection();
    if (currentSel && currentSel.anchorNode) {
      try {
        const node = currentSel.anchorNode;
        const endPos = currentSel.anchorOffset;
        const startPos = Math.max(0, endPos - transformed.length);
        const newRange = document.createRange();
        newRange.setStart(node, startPos);
        newRange.setEnd(node, endPos);
        currentSel.removeAllRanges();
        currentSel.addRange(newRange);
      } catch {
        // ignore range error
      }
    }

    requestAnimationFrame(() => {
      updateSelectionToolbar();
    });
  };

  // Checkbox interactive click toggle (☐ <-> ☑)
  const handleEditableClick = () => {
    const sel = window.getSelection();
    if (!sel || !sel.anchorNode) {
      updateSelectionToolbar();
      return;
    }

    const node = sel.anchorNode;
    const offset = sel.anchorOffset;
    const text = node.textContent || '';

    // Check if clicked directly on or adjacent to ☐ or ☑
    let targetIdx = -1;
    if (text[offset] === '☐' || text[offset] === '☑') {
      targetIdx = offset;
    } else if (text[offset - 1] === '☐' || text[offset - 1] === '☑') {
      targetIdx = offset - 1;
    }

    if (targetIdx !== -1) {
      const char = text[targetIdx];
      if (char === '☐') {
        // Toggle to checked: bold green ☑
        // If node's parent is already a checkbox span, update directly
        const parent = node.parentNode as HTMLElement;
        if (parent && parent.classList?.contains('notepad-checkbox-checked')) {
          node.textContent = text.slice(0, targetIdx) + '☑' + text.slice(targetIdx + 1);
        } else {
          // Replace ☐ with a styled span containing ☑
          const before = text.slice(0, targetIdx);
          const after = text.slice(targetIdx + 1);
          const span = document.createElement('span');
          span.className = 'notepad-checkbox-checked text-emerald-600 dark:text-emerald-500 font-bold';
          span.style.color = '#16a34a';
          span.style.fontWeight = '800';
          span.textContent = '☑';

          const parentNode = node.parentNode;
          if (parentNode) {
            const beforeNode = document.createTextNode(before);
            const afterNode = document.createTextNode(after);
            parentNode.insertBefore(beforeNode, node);
            parentNode.insertBefore(span, node);
            parentNode.insertBefore(afterNode, node);
            parentNode.removeChild(node);
          } else {
            node.textContent = before + '☑' + after;
          }
        }
      } else {
        // Toggle back to unchecked ☐
        const parent = node.parentNode as HTMLElement;
        if (parent && parent.classList?.contains('notepad-checkbox-checked')) {
          parent.className = 'notepad-checkbox-unchecked';
          parent.style.color = '';
          parent.style.fontWeight = '';
          node.textContent = '☐';
        } else {
          const before = text.slice(0, targetIdx);
          const after = text.slice(targetIdx + 1);
          const span = document.createElement('span');
          span.className = 'notepad-checkbox-unchecked';
          span.textContent = '☐';

          const parentNode = node.parentNode;
          if (parentNode) {
            const beforeNode = document.createTextNode(before);
            const afterNode = document.createTextNode(after);
            parentNode.insertBefore(beforeNode, node);
            parentNode.insertBefore(span, node);
            parentNode.insertBefore(afterNode, node);
            parentNode.removeChild(node);
          } else {
            node.textContent = before + '☐' + after;
          }
        }
      }
      handleInput();
    }

    updateSelectionToolbar();
  };

  // Double-click word selection handler: trims trailing whitespace selected by the browser
  const handleDoubleClick = () => {
    const sel = window.getSelection();
    if (!sel || sel.isCollapsed || !sel.rangeCount) return;
    const range = sel.getRangeAt(0);
    const container = editableRef.current;
    if (!container || !container.contains(range.commonAncestorContainer)) return;

    if (range.endContainer.nodeType === Node.TEXT_NODE) {
      const endText = range.endContainer.textContent || '';
      let endOffset = range.endOffset;
      let modified = false;

      while (endOffset > 0 && /\s/.test(endText[endOffset - 1])) {
        if (range.startContainer === range.endContainer && endOffset <= range.startOffset) {
          break;
        }
        endOffset--;
        modified = true;
      }

      if (modified) {
        try {
          range.setEnd(range.endContainer, endOffset);
          sel.removeAllRanges();
          sel.addRange(range);
        } catch {
          // ignore
        }
      }
    }

    updateSelectionToolbar();
  };

  // Keyboard Shortcuts & Smart Auto-Conversions
  const handleKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
    const isMac = typeof window !== 'undefined' && /macintosh|mac os x/i.test(navigator.userAgent);
    const hasMod = isMac ? e.metaKey : e.ctrlKey;

    // Ctrl/Cmd + S: Save immediately
    if (hasMod && e.key.toLowerCase() === 's') {
      e.preventDefault();
      if (editableRef.current) {
        flushContentChange(editableRef.current.innerHTML);
      }
      onInstantSave();
      return;
    }

    // Ctrl/Cmd + B: Bold
    if (hasMod && e.key.toLowerCase() === 'b') {
      e.preventDefault();
      execFormat('bold');
      return;
    }

    // Ctrl/Cmd + I: Italic
    if (hasMod && e.key.toLowerCase() === 'i') {
      e.preventDefault();
      execFormat('italic');
      return;
    }

    // Ctrl/Cmd + U: Underline
    if (hasMod && e.key.toLowerCase() === 'u') {
      e.preventDefault();
      execFormat('underline');
      return;
    }

    // Tab key indentation
    if (e.key === 'Tab') {
      e.preventDefault();
      document.execCommand('insertText', false, '  ');
      handleInput();
      return;
    }

    // Ensure typing immediately following a highlighted text block does NOT inherit highlight
    if (e.key.length === 1 && !e.ctrlKey && !e.metaKey && !e.altKey && e.key !== ' ') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.anchorNode && editableRef.current) {
        let markEl: HTMLElement | null = null;
        let curr: Node | null = sel.anchorNode;
        while (curr && curr !== editableRef.current) {
          if (curr.nodeType === Node.ELEMENT_NODE) {
            const el = curr as HTMLElement;
            if (
              el.tagName === 'MARK' ||
              (el.style && el.style.backgroundColor && el.style.backgroundColor !== 'transparent')
            ) {
              markEl = el;
              break;
            }
          }
          curr = curr.parentNode;
        }

        if (markEl) {
          const range = sel.getRangeAt(0);
          const testRange = range.cloneRange();
          testRange.selectNodeContents(markEl);
          testRange.setStart(range.endContainer, range.endOffset);

          if (testRange.toString().length === 0) {
            e.preventDefault();
            let nextNode = markEl.nextSibling;
            if (!nextNode || nextNode.nodeType !== Node.TEXT_NODE) {
              nextNode = document.createTextNode('');
              markEl.parentNode?.insertBefore(nextNode, markEl.nextSibling);
            }

            const char = e.key;
            nextNode.textContent = (nextNode.textContent || '') + char;

            const caretRange = document.createRange();
            caretRange.setStart(nextNode, nextNode.textContent.length);
            caretRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(caretRange);

            handleInput();
            return;
          }
        }
      }
    }

    // Spacebar: Auto-convert '. ' to '• ' only if it is the first character on a new line
    if (e.key === ' ') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.anchorNode && editableRef.current) {
        const linePrefix = getLinePrefixBeforeCaret(editableRef.current, sel);
        const dotMatch = /^(\s*)\.$/.exec(linePrefix);
        if (dotMatch) {
          e.preventDefault();
          const indent = dotMatch[1] || '';
          const node = sel.anchorNode;
          const offset = sel.anchorOffset;

          if (node && node.nodeType === Node.TEXT_NODE && offset > 0) {
            const text = node.textContent || '';
            node.textContent = text.slice(0, offset - 1) + `${indent}• ` + text.slice(offset);
            const range = document.createRange();
            range.setStart(node, offset - 1 + indent.length + 2);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            document.execCommand('delete', false);
            document.execCommand('insertText', false, `${indent}• `);
          }
          handleInput();
          return;
        }

        const boxMatch = /^(\s*)(\[\]|\[ \])$/.exec(linePrefix);
        if (boxMatch) {
          e.preventDefault();
          const indent = boxMatch[1] || '';
          const matchStr = boxMatch[2];
          const node = sel.anchorNode;
          const offset = sel.anchorOffset;

          if (node && node.nodeType === Node.TEXT_NODE && offset >= matchStr.length) {
            const text = node.textContent || '';
            node.textContent =
              text.slice(0, offset - matchStr.length) + `${indent}☐ ` + text.slice(offset);
            const range = document.createRange();
            range.setStart(node, offset - matchStr.length + indent.length + 2);
            range.collapse(true);
            sel.removeAllRanges();
            sel.addRange(range);
          } else {
            document.execCommand('delete', false);
            document.execCommand('insertText', false, `${indent}☐ `);
          }
          handleInput();
          return;
        }
      }
    }

    // Enter key: list & checklist continuation AND clean breakout from highlighted text
    if (e.key === 'Enter') {
      const sel = window.getSelection();
      if (sel && sel.isCollapsed && sel.anchorNode && editableRef.current) {
        const node = sel.anchorNode;
        const text = node.textContent || '';
        const offset = sel.anchorOffset;
        const beforeCaret = text.slice(0, offset);
        const afterCaret = text.slice(offset);

        const lastNl = beforeCaret.lastIndexOf('\n');
        const currentLine = lastNl === -1 ? beforeCaret : beforeCaret.slice(lastNl + 1);

        // Bullet continuation
        const bulletMatch = currentLine.match(/^(\s*)•\s?(.*)$/);
        if (bulletMatch) {
          e.preventDefault();
          const indent = bulletMatch[1];
          const textAfterBullet = bulletMatch[2].trim();

          // Empty bullet item -> exit list
          if (!textAfterBullet && !afterCaret.trim()) {
            const lineStartIdx = lastNl === -1 ? 0 : lastNl + 1;
            node.textContent = text.slice(0, lineStartIdx);
            document.execCommand('insertParagraph', false);
          } else {
            document.execCommand('insertParagraph', false);
            document.execCommand('insertText', false, `${indent}• `);
          }
          cleanEmptyMarks(editableRef.current);
          handleInput();
          return;
        }

        // Checkbox continuation
        const checkMatch = currentLine.match(/^(\s*)([☐☑])\s?(.*)$/);
        if (checkMatch) {
          e.preventDefault();
          const indent = checkMatch[1];
          const textAfterBox = checkMatch[3].trim();

          // Empty checkbox -> exit checklist
          if (!textAfterBox && !afterCaret.trim()) {
            const lineStartIdx = lastNl === -1 ? 0 : lastNl + 1;
            node.textContent = text.slice(0, lineStartIdx);
            document.execCommand('insertParagraph', false);
          } else {
            document.execCommand('insertParagraph', false);
            document.execCommand('insertText', false, `${indent}☐ `);
          }
          cleanEmptyMarks(editableRef.current);
          handleInput();
          return;
        }

        // Check if cursor is at the end of a highlighted / marked element
        let markEl: HTMLElement | null = null;
        let curr: Node | null = sel.anchorNode;
        while (curr && curr !== editableRef.current) {
          if (curr.nodeType === Node.ELEMENT_NODE) {
            const el = curr as HTMLElement;
            if (
              el.tagName === 'MARK' ||
              (el.style &&
                el.style.backgroundColor &&
                el.style.backgroundColor !== 'transparent' &&
                el.style.backgroundColor !== 'rgba(0, 0, 0, 0)')
            ) {
              markEl = el;
              break;
            }
          }
          curr = curr.parentNode;
        }

        if (markEl) {
          const range = sel.getRangeAt(0);
          const testRange = range.cloneRange();
          testRange.selectNodeContents(markEl);
          testRange.setStart(range.endContainer, range.endOffset);
          const isAtEndOfMark = testRange.toString().length === 0;

          if (isAtEndOfMark) {
            e.preventDefault();

            // Position caret cleanly outside markEl before inserting paragraph
            const outsideRange = document.createRange();
            outsideRange.setStartAfter(markEl);
            outsideRange.collapse(true);
            sel.removeAllRanges();
            sel.addRange(outsideRange);

            document.execCommand('insertParagraph', false);

            cleanEmptyMarks(editableRef.current);
            setTimeout(() => {
              if (editableRef.current) {
                cleanEmptyMarks(editableRef.current);
                handleInput();
              }
            }, 0);
            handleInput();
            return;
          }
        }
      }
    }
  };

  // Drag and Drop Text File Handling
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

  // Typography font class
  const getFontFamilyClass = useCallback(() => {
    switch (preferences.fontFamily) {
      case 'serif':
        return 'font-serif-notepad';
      case 'mono':
        return 'font-mono-notepad';
      case 'literary':
        return 'font-literary-notepad';
      case 'casual':
        return 'font-casual-notepad';
      case 'dyslexic':
        return 'font-dyslexic-notepad';
      default:
        return 'font-sans-notepad';
    }
  }, [preferences.fontFamily]);

  // Container width
  const getWidthClass = useCallback(() => {
    switch (preferences.editorWidth) {
      case 'narrow':
        return 'max-w-2xl';
      case 'medium':
        return 'max-w-4xl';
      case 'wide':
        return 'max-w-6xl';
      case 'full':
        return 'max-w-none w-full';
    }
  }, [preferences.editorWidth]);

  // Page background style class
  const pageStyleClass = `page-style-${preferences.pageStyle || 'blank'}`;

  // Mathematical Baseline Alignment
  const fontSize = preferences.fontSize || 15;
  const lineHeightMultiple = preferences.lineHeight || 1.7;
  const calculatedLineHeightPx = Math.round(fontSize * lineHeightMultiple);
  const paddingTop = 28;

  const baselineOffsetInLine = Math.round(
    (calculatedLineHeightPx - fontSize) / 2 + 0.79 * fontSize
  );
  const firstLineY = paddingTop + baselineOffsetInLine + 1;

  const isJournal = preferences.pageStyle === 'journal';
  const paddingClass = isJournal
    ? 'pl-18 pr-6 sm:pl-22 sm:pr-10 pb-16'
    : 'px-6 sm:px-10 pb-16';

  // Fast text statistics calculation
  const stats = useMemo(() => {
    const raw = currentText;
    const trimmed = raw.trim();
    if (!trimmed) {
      return { wordCount: 0, charCount: 0, lineCount: 0, readingTime: 0 };
    }
    const words = trimmed.split(/\s+/).filter(Boolean);
    const lines = raw.split(/\r\n|\r|\n/).length;
    return {
      wordCount: words.length,
      charCount: trimmed.length,
      lineCount: lines,
      readingTime: Math.max(1, Math.ceil(words.length / 200)),
    };
  }, [currentText]);

  return (
    <main
      ref={editorContainerRef}
      id="notepad-canvas-wrapper"
      className="flex-1 w-full overflow-y-auto flex flex-col items-center relative px-2 sm:px-4 md:px-6"
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      onDrop={handleDrop}
    >
      {/* Paper Sheet Container with Rich Tactile Separation */}
      <div
        ref={sheetContainerRef}
        id="notepad-paper-sheet"
        className={`w-full ${getWidthClass()} flex-1 flex flex-col my-3 sm:my-5 rounded-xl sm:rounded-2xl paper-sheet-container text-primary-theme relative transition-all duration-75`}
      >
        {/* Drag & Drop Visual Overlay */}
        {isDraggingFile && (
          <div className="absolute inset-0 z-30 bg-stone-900/10 dark:bg-stone-100/10 backdrop-blur-xs border-2 border-dashed border-stone-400 dark:border-stone-500 rounded-xl sm:rounded-2xl flex flex-col items-center justify-center pointer-events-none">
            <div className="bg-paper-theme px-6 py-4 rounded-xl shadow-lg border border-subtle-theme flex items-center gap-3 text-primary-theme font-medium text-sm">
              <Upload className="w-5 h-5 text-emerald-500 animate-bounce" />
              <span>Drop .txt or markdown file to open in note</span>
            </div>
          </div>
        )}

        {/* Floating Text Selection Fast-Edit Toolbar */}
        {selectionToolbar?.visible && (
          <div
            id="selection-floating-toolbar"
            style={{
              top: `${selectionToolbar.top}px`,
              left: `${selectionToolbar.left}px`,
            }}
            className="absolute z-40 bg-stone-900/95 dark:bg-stone-900/95 text-stone-100 shadow-2xl rounded-xl p-1.5 flex items-center gap-1 animate-in fade-in zoom-in-95 duration-100 backdrop-blur-md border border-stone-800"
            onMouseDown={(e) => {
              // Prevent editor from losing focus/selection when clicking toolbar buttons
              e.preventDefault();
              e.stopPropagation();
            }}
          >
            {/* Inline Formatting Group */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                id="format-bold-btn"
                onClick={() => execFormat('bold')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Bold"
                aria-label="Bold"
              >
                <Bold className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="format-italic-btn"
                onClick={() => execFormat('italic')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Italic"
                aria-label="Italic"
              >
                <Italic className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="format-underline-btn"
                onClick={() => execFormat('underline')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Underline"
                aria-label="Underline"
              >
                <Underline className="w-3.5 h-3.5" />
              </button>
              <button
                type="button"
                id="format-strike-btn"
                onClick={() => execFormat('strikeThrough')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Strikethrough"
                aria-label="Strikethrough"
              >
                <Strikethrough className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-px h-4 bg-stone-700 mx-0.5" />

            {/* Colors Group: Text & Highlighter */}
            <div className="flex items-center gap-0.5">
              {/* Text Color Picker */}
              <div className="relative">
                <button
                  type="button"
                  id="format-color-btn"
                  onClick={() => {
                    setShowColorPicker((prev) => !prev);
                    setShowHighlightPicker(false);
                  }}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                    showColorPicker
                      ? 'bg-amber-500/20 text-amber-400 ring-1 ring-amber-500/40'
                      : 'hover:bg-stone-800 text-stone-200 hover:text-white'
                  }`}
                  title="Text Color"
                  aria-label="Text Color"
                >
                  <Palette className="w-3.5 h-3.5 text-amber-400" />
                </button>

                {showColorPicker && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2.5 bg-stone-900 border border-stone-800 shadow-2xl rounded-xl z-50 animate-in fade-in duration-75 min-w-44">
                    <div className="text-[11px] font-medium text-stone-400 mb-2 px-0.5">Text Color</div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {COLOR_SWATCHES.map((color) => (
                        <button
                          key={color.label}
                          type="button"
                          onClick={() => applyColor(color.hex)}
                          className="w-5 h-5 rounded-full border border-stone-700 hover:border-white flex items-center justify-center transition-transform hover:scale-125 focus:outline-none"
                          style={{
                            backgroundColor: color.hex === 'inherit' ? 'transparent' : color.hex,
                          }}
                          title={color.label}
                        >
                          {color.hex === 'inherit' && (
                            <span className="text-[9px] font-bold text-stone-400">✕</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Marker Highlighter Picker */}
              <div className="relative">
                <button
                  type="button"
                  id="format-highlight-btn"
                  onClick={() => {
                    setShowHighlightPicker((prev) => !prev);
                    setShowColorPicker(false);
                  }}
                  className={`w-7 h-7 flex items-center justify-center rounded-lg transition ${
                    showHighlightPicker
                      ? 'bg-yellow-500/20 text-yellow-400 ring-1 ring-yellow-500/40'
                      : 'hover:bg-stone-800 text-stone-200 hover:text-white'
                  }`}
                  title="Marker Color"
                  aria-label="Marker Color"
                >
                  <Highlighter className="w-3.5 h-3.5 text-yellow-400" />
                </button>

                {showHighlightPicker && (
                  <div
                    id="highlight-circles-palette"
                    className="absolute top-full left-1/2 -translate-x-1/2 mt-2 p-2.5 bg-stone-900 border border-stone-800 shadow-2xl rounded-xl z-50 animate-in fade-in duration-75 min-w-48"
                  >
                    <div className="text-[11px] font-medium text-stone-400 mb-2 px-0.5">Marker Color</div>
                    <div className="grid grid-cols-7 gap-1.5">
                      {HIGHLIGHT_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.label}
                          type="button"
                          onClick={() => applyHighlight(swatch.hex)}
                          className="w-5 h-5 rounded-full border border-stone-700 hover:border-white flex items-center justify-center transition-transform hover:scale-125 focus:outline-none shrink-0"
                          style={{
                            backgroundColor: swatch.hex !== 'transparent' ? swatch.hex : undefined,
                          }}
                          title={swatch.label === 'None' ? 'Remove Marker' : `${swatch.label} Marker`}
                          aria-label={swatch.label}
                        >
                          {swatch.hex === 'transparent' && (
                            <span className="text-[10px] font-bold text-red-400 leading-none">✕</span>
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>

            <div className="w-px h-4 bg-stone-700 mx-0.5" />

            {/* Inline Code */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                id="format-code-btn"
                onClick={applyInlineCode}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Inline Code"
                aria-label="Inline Code"
              >
                <Code className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="w-px h-4 bg-stone-700 mx-0.5" />

            {/* Lists & Tools Group */}
            <div className="flex items-center gap-0.5">
              <button
                type="button"
                id="format-bullet-btn"
                onClick={() => document.execCommand('insertText', false, '• ')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Bullet Point"
                aria-label="Bullet Point"
              >
                <List className="w-3.5 h-3.5" />
              </button>

              <button
                type="button"
                id="format-checkbox-btn"
                onClick={() => document.execCommand('insertText', false, '☐ ')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                title="Checkbox"
                aria-label="Checkbox"
              >
                <CheckSquare className="w-3.5 h-3.5 text-emerald-400" />
              </button>

              {/* Case toggle showing next setting: AB / Ab / ab */}
              {(() => {
                const nextCaseInfo = getNextCaseInfo(selectionToolbar?.text || '');
                return (
                  <button
                    type="button"
                    id="format-case-btn"
                    onClick={transformCase}
                    className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-200 hover:text-white transition"
                    title={nextCaseInfo.title}
                    aria-label={nextCaseInfo.title}
                  >
                    <span className="text-[11px] font-bold font-mono tracking-tight text-stone-200 hover:text-white leading-none">
                      {nextCaseInfo.iconText}
                    </span>
                  </button>
                );
              })()}

              <button
                type="button"
                id="format-clear-btn"
                onClick={() => execFormat('removeFormat')}
                className="w-7 h-7 flex items-center justify-center rounded-lg hover:bg-stone-800 active:bg-stone-700 text-stone-400 hover:text-red-400 transition"
                title="Clear Formatting"
                aria-label="Clear Formatting"
              >
                <RemoveFormatting className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* Editor Writing Area (Rich Text ContentEditable) */}
        <div
          className="flex-1 flex flex-col min-h-[calc(100vh-10rem)] relative cursor-text"
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
            onSelect={updateSelectionToolbar}
            onKeyUp={(e) => {
              if (e.key === 'Enter' && editableRef.current) {
                cleanEmptyMarks(editableRef.current);
              }
              updateSelectionToolbar();
            }}
            onMouseUp={updateSelectionToolbar}
            spellCheck={preferences.spellCheck}
            data-placeholder="Start typing your notes... Type '. ' for bullets, '[] ' for checklists, or select any text to format."
            aria-label="Note Content"
            className={`w-full flex-1 notepad-editable text-primary-theme ${pageStyleClass} ${paddingClass} ${getFontFamilyClass()}`}
            style={
              {
                fontSize: `${fontSize}px`,
                lineHeight: `${calculatedLineHeightPx}px`,
                paddingTop: `${paddingTop}px`,
                minHeight: '100%',
                '--notepad-line-height': `${calculatedLineHeightPx}px`,
                '--notepad-line-offset-y': `${firstLineY}px`,
              } as React.CSSProperties
            }
          />
        </div>

        {/* Minimal Bottom Status Bar */}
        <footer
          id="notepad-status-bar"
          className="border-t border-subtle-theme px-4 sm:px-6 py-2.5 flex items-center justify-between text-[11px] text-secondary-theme select-none bg-card-theme/30 rounded-b-xl sm:rounded-b-2xl"
        >
          <div className="flex items-center gap-3 sm:gap-4 font-mono">
            {preferences.showWordCount && <span>{stats.wordCount} words</span>}
            {preferences.showCharacterCount && <span>{stats.charCount} chars</span>}
            {(preferences.showLineCount ?? true) && <span>{stats.lineCount} lines</span>}
            {preferences.showReadingTime && <span>~{stats.readingTime} min read</span>}
          </div>

          <div className="flex items-center gap-2 text-[10px] text-secondary-theme uppercase tracking-wider font-sans">
            <span className="hidden sm:inline">Autosaved Locally</span>
            <span className="capitalize">{preferences.pageStyle}</span>
          </div>
        </footer>
      </div>
    </main>
  );
};

export const Editor = React.memo(EditorComponent);
