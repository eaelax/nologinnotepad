'use client';

import React from 'react';

interface MobileShowcaseSectionProps {
  className?: string;
}

export const MobileShowcaseSection: React.FC<MobileShowcaseSectionProps> = ({ className = '' }) => {
  return (
    <section
      id="mobile-showcase-section"
      aria-label="Cross-Device and Mobile Showcase"
      className={`space-y-10 sm:space-y-14 ${className}`}
    >
      {/* Header */}
      <div className="text-center space-y-3 max-w-2xl mx-auto px-4 pt-2">
        <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-primary-theme text-balance">
          Why Users Choose NoLoginNotepad Everywhere
        </h2>
        <p className="text-secondary-theme text-sm sm:text-base leading-relaxed">
          Engineered for frictionless capture on smartphones, tablets, and desktops with absolute privacy and zero configuration.
        </p>
      </div>

      {/* Three-Card Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 lg:gap-8 items-stretch max-w-5xl mx-auto">
        {/* Left Container: Handheld Speed */}
        <article className="rounded-3xl p-6 sm:p-8 md:p-10 bg-paper-theme shadow-md shadow-black/[0.03] dark:shadow-black/20 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-theme">
                Engineered for Handheld Speed
              </h3>
              <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                Built specifically for phone browsers with zero pinch-to-zoom, responsive thumb-zone toolbar placement, and zero viewport shift.
              </p>
            </div>

            {/* Editorial Feature Rows */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-primary-theme tracking-tight">
                  Thumb-First Ergonomics
                </div>
                <p className="text-xs text-secondary-theme leading-relaxed">
                  Core formatting controls positioned for natural one-handed editing.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-primary-theme tracking-tight">
                  Adaptive Keyboard Flow
                </div>
                <p className="text-xs text-secondary-theme leading-relaxed">
                  Zero interface jumps or obscured text when the virtual keyboard opens.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-primary-theme tracking-tight">
                  Instant Browser Capture
                </div>
                <p className="text-xs text-secondary-theme leading-relaxed">
                  Immediate writing without app downloads, onboarding, or sign-in barriers.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-secondary-theme font-medium">
            <span>Touch-Optimized</span>
            <span className="font-mono text-[11px] opacity-80">Zero Install</span>
          </div>
        </article>

        {/* Center Container: Visual Showcase */}
        <article className="relative rounded-3xl overflow-hidden bg-slate-900 shadow-md shadow-black/[0.03] dark:shadow-black/20 flex flex-col justify-center items-center min-h-[380px] sm:min-h-[460px] lg:min-h-0 lg:h-full p-6 text-center text-white">
          <div className="relative z-10 space-y-4">
            <div className="w-16 h-16 rounded-2xl bg-indigo-600/30 border border-indigo-400/30 flex items-center justify-center mx-auto text-indigo-400">
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
              </svg>
            </div>
            <h4 className="text-xl font-bold tracking-tight">Mobile First Notepad</h4>
            <p className="text-xs text-slate-300 max-w-xs leading-relaxed">
              Opens in less than 50 milliseconds directly in Chrome, Safari, Edge, or Firefox.
            </p>
          </div>
          <div className="absolute inset-0 bg-gradient-to-t from-indigo-950 via-slate-900 to-slate-950 pointer-events-none" />
        </article>

        {/* Right Container: Fluid Scaling */}
        <article className="rounded-3xl p-6 sm:p-8 md:p-10 bg-paper-theme shadow-md shadow-black/[0.03] dark:shadow-black/20 flex flex-col justify-between">
          <div className="space-y-6">
            <div className="space-y-2.5">
              <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-primary-theme">
                Fluid Across Every Screen
              </h3>
              <p className="text-xs sm:text-sm text-secondary-theme leading-relaxed">
                Dynamic typography and auto-scaling components that adapt smoothly from compact mobile displays to tablets and desktops.
              </p>
            </div>

            {/* Editorial Feature Rows */}
            <div className="space-y-4 pt-1">
              <div className="space-y-1">
                <div className="text-sm font-semibold text-primary-theme tracking-tight">
                  Responsive Font Engine
                </div>
                <p className="text-xs text-secondary-theme leading-relaxed">
                  Proportionate text scaling that preserves legibility across all screen densities.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-primary-theme tracking-tight">
                  Pocket-Ready Persistence
                </div>
                <p className="text-xs text-secondary-theme leading-relaxed">
                  Instant continuous auto-save that protects drafts across mobile tab reloads.
                </p>
              </div>

              <div className="space-y-1">
                <div className="text-sm font-semibold text-primary-theme tracking-tight">
                  OLED Handheld Theme
                </div>
                <p className="text-xs text-secondary-theme leading-relaxed">
                  True dark mode contrast engineered for battery conservation and night reading.
                </p>
              </div>
            </div>
          </div>

          <div className="mt-8 pt-5 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-xs text-secondary-theme font-medium">
            <span>Dynamic Scaling</span>
            <span className="font-mono text-[11px] opacity-80">OLED Friendly</span>
          </div>
        </article>
      </div>
    </section>
  );
};
