'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Download, Share, X } from 'lucide-react';

interface PWAInstallButtonProps {
  variant?: 'button' | 'menuitem';
  onAction?: () => void;
}

export const PWAInstallButton: React.FC<PWAInstallButtonProps> = ({
  variant = 'button',
  onAction,
}) => {
  const isMounted = useIsMounted();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  if (!isMounted || isInstalled) {
    return null;
  }

  const handleInstall = async () => {
    onAction?.();
    await install();
  };

  if (isInstallable) {
    if (variant === 'menuitem') {
      return (
        <button
          id="pwa-install-menu-btn"
          onClick={handleInstall}
          className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition text-xs font-medium"
        >
          <Download className="w-4 h-4 text-indigo-500 shrink-0" />
          <span>Install App / Shortcut</span>
        </button>
      );
    }

    return (
      <button
        id="pwa-install-btn"
        onClick={handleInstall}
        className="flex items-center gap-1.5 rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white shadow-2xs hover:bg-indigo-700 transition"
        title="Install NoLoginNotepad as a standalone app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  if (isIOS) {
    return (
      <>
        {variant === 'menuitem' ? (
          <button
            id="pwa-install-ios-menu-btn"
            onClick={() => {
              onAction?.();
              setShowIOSGuide(true);
            }}
            className="w-full px-3 py-2 rounded-lg flex items-center gap-2.5 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 text-left transition text-xs font-medium cursor-pointer"
          >
            <Download className="w-4 h-4 text-indigo-500 shrink-0" />
            <span>Install / Add to Home</span>
          </button>
        ) : (
          <button
            id="pwa-install-ios-btn"
            onClick={() => setShowIOSGuide(true)}
            className="flex items-center gap-1.5 rounded-lg bg-slate-100 hover:bg-slate-200/80 dark:bg-slate-800 dark:hover:bg-slate-700 px-2.5 py-1.5 text-xs font-medium text-slate-800 dark:text-slate-100 transition cursor-pointer"
            title="Install on iPhone / iPad"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Add to Home</span>
          </button>
        )}

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/50 p-4">
            <div className="w-full max-w-sm rounded-2xl bg-white p-5 shadow-2xl dark:bg-[#141822] border border-slate-200/80 dark:border-slate-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-bold text-slate-900 dark:text-white">Install on iPhone / iPad</h3>
                <button
                  type="button"
                  onClick={() => setShowIOSGuide(false)}
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
                  aria-label="Close guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2.5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <p>
                    1. Tap the <strong>Share</strong> button in your Safari toolbar at the bottom of the screen.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <p>
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-xl bg-indigo-600 py-2.5 text-xs font-semibold text-white hover:bg-indigo-700 transition"
              >
                Got it
              </button>
            </div>
          </div>
        )}
      </>
    );
  }

  return null;
};
