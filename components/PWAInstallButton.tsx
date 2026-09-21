'use client';

import React, { useState } from 'react';
import { usePWAInstall } from '@/hooks/usePWAInstall';
import { useIsMounted } from '@/hooks/useIsMounted';
import { Download, Share, X } from 'lucide-react';

export const PWAInstallButton: React.FC = () => {
  const isMounted = useIsMounted();
  const { isInstallable, isInstalled, isIOS, install } = usePWAInstall();
  const [showIOSGuide, setShowIOSGuide] = useState(false);

  // During SSR and hydration, keep identical output
  if (!isMounted || isInstalled) {
    return null;
  }


  // Chromium / Android / Desktop flow
  if (isInstallable) {
    return (
      <button
        id="pwa-install-btn"
        onClick={install}
        className="flex items-center gap-1.5 rounded-lg bg-stone-900 px-3 py-1.5 text-xs font-medium text-white shadow-xs hover:bg-stone-800 transition dark:bg-stone-100 dark:text-stone-900 dark:hover:bg-white"
        title="Install NoLoginPad as a standalone app"
      >
        <Download className="w-3.5 h-3.5" />
        <span>Install App</span>
      </button>
    );
  }

  // iOS Safari flow (beforeinstallprompt is not supported by WebKit)
  if (isIOS) {
    return (
      <>
        <button
          id="pwa-install-ios-btn"
          onClick={() => setShowIOSGuide(true)}
          className="flex items-center gap-1.5 rounded-lg border border-stone-300 dark:border-stone-700 px-2.5 py-1.5 text-xs font-medium text-stone-700 hover:bg-stone-100 dark:text-stone-200 dark:hover:bg-stone-800 transition"
          title="Install on iPhone / iPad"
        >
          <Download className="w-3.5 h-3.5" />
          <span>Add to Home</span>
        </button>

        {showIOSGuide && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
            <div className="w-full max-w-sm rounded-xl bg-white p-5 shadow-xl dark:bg-stone-900 border border-stone-200 dark:border-stone-800 animate-in fade-in zoom-in-95">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold text-stone-900 dark:text-white">Install on iPhone / iPad</h3>
                <button
                  onClick={() => setShowIOSGuide(false)}
                  className="rounded p-1 text-stone-400 hover:text-stone-600 dark:hover:text-stone-200"
                  aria-label="Close guide"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              <div className="mt-3 space-y-2 text-xs text-stone-600 dark:text-stone-300 leading-relaxed">
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 mt-0.5">
                    <Share className="w-4 h-4" />
                  </div>
                  <p>
                    1. Tap the <strong>Share</strong> button in your Safari toolbar at the bottom of the screen.
                  </p>
                </div>
                <div className="flex items-start gap-2.5">
                  <div className="p-1 rounded bg-stone-100 dark:bg-stone-800 text-stone-700 dark:text-stone-300 mt-0.5">
                    <Download className="w-4 h-4" />
                  </div>
                  <p>
                    2. Scroll down and tap <strong>Add to Home Screen</strong>.
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowIOSGuide(false)}
                className="mt-4 w-full rounded-lg bg-stone-900 dark:bg-stone-100 py-2 text-xs font-medium text-white dark:text-stone-900 hover:opacity-90 transition"
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
