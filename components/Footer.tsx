'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';
import { LanguageCode } from '@/types/note';
import { TRANSLATIONS, Translations } from '@/lib/i18n/translations';

interface FooterProps {
  currentLang?: LanguageCode;
  onOpenPrivacy: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenExportImport: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  currentLang = 'EN',
  onOpenPrivacy,
  onOpenShortcuts,
  onOpenSettings,
  onOpenExportImport,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const t: Translations = TRANSLATIONS[currentLang] || TRANSLATIONS.EN;

  return (
    <footer
      id="notepad-footer"
      className="w-full border-t border-subtle-theme bg-white/60 dark:bg-[#0D1017]/80 backdrop-blur-xs text-secondary-theme text-xs select-none"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 sm:gap-3 text-center sm:text-left">
        <div className="flex flex-col sm:flex-row items-center justify-center sm:justify-start gap-1.5 sm:gap-2.5">
          <span className="font-bold text-xs tracking-tight text-primary-theme">NoLoginNotepad</span>
          <span className="text-secondary-theme hidden sm:inline" aria-hidden="true">·</span>
          <span className="text-xs text-secondary-theme">
            {t.footerTagline}
          </span>
        </div>

        <div className="flex items-center justify-center flex-wrap gap-x-5 gap-y-2 text-xs w-full sm:w-auto">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-primary-theme transition-colors py-1 flex items-center gap-1.5 shrink-0 cursor-pointer"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>{t.devicePrivacy}</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="hover:text-primary-theme transition-colors py-1 shrink-0 cursor-pointer"
          >
            {t.shortcuts}
          </button>

          <button
            onClick={onOpenSettings}
            className="hover:text-primary-theme transition-colors py-1 shrink-0 cursor-pointer"
          >
            {t.settings}
          </button>

          <button
            onClick={onOpenExportImport}
            className="hover:text-primary-theme transition-colors py-1 shrink-0 cursor-pointer"
          >
            {t.export}
          </button>

          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-xs text-primary-theme hover:text-indigo-600 dark:hover:text-indigo-400 py-1 font-semibold shrink-0 cursor-pointer transition-colors"
            aria-expanded={isExpanded}
            aria-controls="footer-directory-links"
          >
            <span>{isExpanded ? t.hideInfo : t.aboutQuickLinks}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {isExpanded && (
        <div
          id="footer-directory-links"
          className="border-t border-subtle-theme px-4 sm:px-6 py-10 bg-card-theme text-xs leading-relaxed animate-in fade-in duration-150"
        >
          <div className="max-w-6xl mx-auto space-y-8">
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-8">
              {/* Column 1: Workflow Solutions */}
              <div className="space-y-3">
                <h4 className="font-bold text-primary-theme text-xs uppercase tracking-wider">
                  Workflow Solutions
                </h4>
                <ul className="space-y-2 text-secondary-theme">
                  <li>
                    <Link href="/quick-meeting-notes" className="hover:text-primary-theme transition-colors block">
                      Quick Meeting Notes
                    </Link>
                  </li>
                  <li>
                    <Link href="/code-scratchpad" className="hover:text-primary-theme transition-colors block">
                      Code Scratchpad
                    </Link>
                  </li>
                  <li>
                    <Link href="/long-form-writing" className="hover:text-primary-theme transition-colors block">
                      Long-Form Writing
                    </Link>
                  </li>
                  <li>
                    <Link href="/ephemeral-drafts" className="hover:text-primary-theme transition-colors block">
                      Ephemeral Drafts
                    </Link>
                  </li>
                  <li>
                    <Link href="/distraction-free-editor" className="hover:text-primary-theme transition-colors block">
                      Distraction-Free Editor
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 2: Targeted Keyword Clusters */}
              <div className="space-y-3">
                <h4 className="font-bold text-primary-theme text-xs uppercase tracking-wider">
                  Notepad Keywords
                </h4>
                <ul className="space-y-2 text-secondary-theme">
                  <li>
                    <Link href="/free-browser-notepad" className="hover:text-primary-theme transition-colors block">
                      Free Browser Notepad
                    </Link>
                  </li>
                  <li>
                    <Link href="/online-text-editor-no-login" className="hover:text-primary-theme transition-colors block">
                      Online Text Editor No Login
                    </Link>
                  </li>
                  <li>
                    <Link href="/private-offline-notes" className="hover:text-primary-theme transition-colors block">
                      Private Offline Notes
                    </Link>
                  </li>
                  <li>
                    <Link href="/instant-scratchpad" className="hover:text-primary-theme transition-colors block">
                      Instant Scratchpad
                    </Link>
                  </li>
                  <li>
                    <Link href="/online-scratchpad-quick-notes" className="hover:text-primary-theme transition-colors block">
                      Quick Notes Online
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 3: Core Utilities */}
              <div className="space-y-3">
                <h4 className="font-bold text-primary-theme text-xs uppercase tracking-wider">
                  Core Utilities
                </h4>
                <ul className="space-y-2 text-secondary-theme">
                  <li>
                    <Link href="/word-count-checker" className="hover:text-primary-theme transition-colors block">
                      Word Count Checker
                    </Link>
                  </li>
                  <li>
                    <Link href="/plain-text-stripper" className="hover:text-primary-theme transition-colors block">
                      Plain Text Stripper
                    </Link>
                  </li>
                  <li>
                    <Link href="/markdown-scratchpad" className="hover:text-primary-theme transition-colors block">
                      Markdown Scratchpad
                    </Link>
                  </li>
                  <li>
                    <Link href="/clean-case-formatter" className="hover:text-primary-theme transition-colors block">
                      Clean Case Formatter
                    </Link>
                  </li>
                  <li>
                    <Link href="/rich-text-notepad" className="hover:text-primary-theme transition-colors block">
                      Rich Text Formatting
                    </Link>
                  </li>
                </ul>
              </div>

              {/* Column 4: Platform & Legal */}
              <div className="space-y-3">
                <h4 className="font-bold text-primary-theme text-xs uppercase tracking-wider">
                  {t.navAbout} & Policies
                </h4>
                <ul className="space-y-2 text-secondary-theme">
                  <li>
                    <Link href="/about" className="hover:text-primary-theme transition-colors block">
                      {t.navAbout} NoLoginNotepad
                    </Link>
                  </li>
                  <li>
                    <Link href="/privacy" className="hover:text-primary-theme transition-colors block">
                      Privacy Policy & Sandboxing
                    </Link>
                  </li>
                  <li>
                    <Link href="/terms" className="hover:text-primary-theme transition-colors block">
                      Terms of Service
                    </Link>
                  </li>
                  <li>
                    <Link href="/contact" className="hover:text-primary-theme transition-colors block">
                      {t.navContact} & Support
                    </Link>
                  </li>
                </ul>
              </div>
            </div>

            {/* Bottom Meta & Tagline Strip */}
            <div className="pt-6 border-t border-subtle-theme flex flex-col sm:flex-row items-center justify-between gap-3 text-secondary-theme text-[11px]">
              <p className="leading-relaxed">
                <strong className="text-primary-theme font-semibold">NoLoginNotepad</strong> — A secure browser-based text editor built for private local writing, instant autosave, and zero user accounts.
              </p>
              <p className="shrink-0">
                &copy; {new Date().getFullYear()} NoLoginNotepad · Client-Side IndexedDB Storage
              </p>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};
