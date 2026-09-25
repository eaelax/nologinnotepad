'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { Shield, ChevronDown, ChevronUp } from 'lucide-react';

interface FooterProps {
  onOpenPrivacy: () => void;
  onOpenShortcuts: () => void;
  onOpenSettings: () => void;
  onOpenExportImport: () => void;
}

const FooterComponent: React.FC<FooterProps> = ({
  onOpenPrivacy,
  onOpenShortcuts,
  onOpenSettings,
  onOpenExportImport,
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <footer
      id="notepad-footer"
      className="w-full border-t border-subtle-theme bg-app-theme text-secondary-theme text-xs select-none"
    >
      {/* Compact Main Bar - Responsive for mobile and desktop */}
      <div className="max-w-7xl mx-auto px-3 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 sm:gap-3">
        {/* Left: Brand & Guarantee */}
        <div className="flex items-center justify-between sm:justify-start gap-2 sm:gap-3">
          <div className="flex items-center gap-1.5 text-primary-theme font-medium">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shrink-0" />
            <span className="font-semibold text-xs tracking-tight">NoLoginNotepad</span>
          </div>
          <span className="text-secondary-theme">•</span>
          <span className="text-[11px] text-secondary-theme truncate">
            100% Private, Local-First Writing
          </span>
        </div>

        {/* Right / Center: Action buttons with touch-friendly targets */}
        <div className="flex items-center flex-wrap gap-x-3 gap-y-1.5 text-[11px]">
          <button
            onClick={onOpenPrivacy}
            className="hover:text-primary-theme transition py-1 flex items-center gap-1 shrink-0"
          >
            <Shield className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
            <span>Privacy</span>
          </button>

          <button
            onClick={onOpenShortcuts}
            className="hover:text-primary-theme transition py-1 hidden sm:inline shrink-0"
          >
            Shortcuts
          </button>

          <button
            onClick={onOpenSettings}
            className="hover:text-primary-theme transition py-1 shrink-0"
          >
            Settings
          </button>

          <button
            onClick={onOpenExportImport}
            className="hover:text-primary-theme transition py-1 shrink-0"
          >
            Backup & Export
          </button>

          {/* Toggle About & Quick Links Accordion */}
          <button
            onClick={() => setIsExpanded((prev) => !prev)}
            className="flex items-center gap-1 text-[11px] text-primary-theme hover:underline py-1 font-medium ml-auto sm:ml-2 shrink-0"
            aria-expanded={isExpanded}
            aria-controls="footer-directory-links"
          >
            <span>{isExpanded ? 'Hide Info' : 'About & Quick Links'}</span>
            {isExpanded ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
        </div>
      </div>

      {/* Expanded Directory Links & App Information */}
      {isExpanded && (
        <div
          id="footer-directory-links"
          className="border-t border-subtle-theme px-4 sm:px-6 py-5 sm:py-6 bg-card-theme text-[11px] leading-relaxed animate-in fade-in duration-150"
        >
          <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-5 sm:gap-6">
            {/* Column 1: Writing Tools & Modes */}
            <div className="space-y-2">
              <h4 className="font-semibold text-primary-theme uppercase tracking-wider text-[10px]">
                Writing Tools & Keywords
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/online-notepad" className="hover:text-primary-theme transition">
                    Online Notepad
                  </Link>
                </li>
                <li>
                  <Link href="/notepad-no-login" className="hover:text-primary-theme transition">
                    Notepad No Login
                  </Link>
                </li>
                <li>
                  <Link href="/markdown-notepad" className="hover:text-primary-theme transition">
                    Markdown Notepad Online
                  </Link>
                </li>
                <li>
                  <Link href="/distraction-free-editor" className="hover:text-primary-theme transition">
                    Distraction-Free Text Editor
                  </Link>
                </li>
                <li>
                  <Link href="/offline-notepad" className="hover:text-primary-theme transition">
                    Offline Notepad (PWA)
                  </Link>
                </li>
                <li>
                  <Link href="/ruled-paper-notepad" className="hover:text-primary-theme transition">
                    Ruled Paper Notepad
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2: Paper & Customization */}
            <div className="space-y-2">
              <h4 className="font-semibold text-primary-theme uppercase tracking-wider text-[10px]">
                Paper & Customization
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <button onClick={onOpenPrivacy} className="hover:text-primary-theme text-left transition">
                    Local Device Storage (IndexedDB)
                  </button>
                </li>
                <li>
                  <button onClick={onOpenSettings} className="hover:text-primary-theme text-left transition">
                    Blank, Ruled, Journal & Grid Paper
                  </button>
                </li>
                <li>
                  <button onClick={onOpenSettings} className="hover:text-primary-theme text-left transition">
                    Light, Dark & Vintage Sepia Themes
                  </button>
                </li>
                <li>
                  <button onClick={onOpenSettings} className="hover:text-primary-theme text-left transition">
                    Custom Typography & Baseline Alignment
                  </button>
                </li>
                <li>
                  <button onClick={onOpenExportImport} className="hover:text-primary-theme text-left transition">
                    Export Plain Text (.txt) & Markdown (.md)
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 3: Trust, Privacy & Legal */}
            <div className="space-y-2">
              <h4 className="font-semibold text-primary-theme uppercase tracking-wider text-[10px]">
                Trust, Privacy &amp; Legal
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <Link href="/about" className="hover:text-primary-theme transition">
                    About NoLoginNotepad
                  </Link>
                </li>
                <li>
                  <Link href="/privacy" className="hover:text-primary-theme transition">
                    Privacy Policy &amp; Cookies
                  </Link>
                </li>
                <li>
                  <Link href="/terms" className="hover:text-primary-theme transition">
                    Terms of Service
                  </Link>
                </li>
                <li>
                  <Link href="/contact" className="hover:text-primary-theme transition">
                    Contact Us &amp; Support
                  </Link>
                </li>
                <li>
                  <button onClick={onOpenPrivacy} className="hover:text-primary-theme text-left transition">
                    Local Device Security Modal
                  </button>
                </li>
              </ul>
            </div>

            {/* Column 4: Standards, Sitemap & Architecture */}
            <div className="space-y-2">
              <h4 className="font-semibold text-primary-theme uppercase tracking-wider text-[10px]">
                SEO &amp; Infrastructure
              </h4>
              <ul className="space-y-1.5">
                <li>
                  <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="hover:text-primary-theme transition">
                    XML Sitemap (sitemap.xml)
                  </a>
                </li>
                <li>
                  <a href="/robots.txt" target="_blank" rel="noopener noreferrer" className="hover:text-primary-theme transition">
                    Robots Policy (robots.txt)
                  </a>
                </li>
                <li>
                  <a href="/ads.txt" target="_blank" rel="noopener noreferrer" className="hover:text-primary-theme transition">
                    AdSense Policy (ads.txt)
                  </a>
                </li>
                <li>
                  <span className="text-secondary-theme">
                    IndexedDB Local-First • Zero Cloud Accounts
                  </span>
                </li>
              </ul>
              <div className="pt-1 text-[10px] text-secondary-theme">
                <span>Designed for fast, private everyday writing</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </footer>
  );
};

export const Footer = React.memo(FooterComponent);
