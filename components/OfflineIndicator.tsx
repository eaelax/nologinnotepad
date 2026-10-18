'use client';

import React, { useSyncExternalStore } from 'react';
import { WifiOff } from 'lucide-react';
import { useIsMounted } from '@/hooks/useIsMounted';

function subscribeOnline(callback: () => void) {
  window.addEventListener('online', callback);
  window.addEventListener('offline', callback);
  return () => {
    window.removeEventListener('online', callback);
    window.removeEventListener('offline', callback);
  };
}

function getOnlineSnapshot() {
  return typeof navigator !== 'undefined' ? navigator.onLine : true;
}

export interface OfflineIndicatorProps {
  forceHighlighted?: boolean;
}

export const OfflineIndicator: React.FC<OfflineIndicatorProps> = ({ forceHighlighted = false }) => {
  const isMounted = useIsMounted();
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    () => true
  );

  if (!isMounted) {
    return null;
  }

  if (forceHighlighted) {
    return (
      <div
        id="offline-indicator"
        className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-slate-900/90 text-slate-100 dark:bg-slate-800/90 dark:text-slate-100 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-md border border-slate-700/60"
      >
        <WifiOff className="w-3.5 h-3.5 text-emerald-400" />
        <span>PWA Local-First Active — Works 100% Offline with IndexedDB</span>
      </div>
    );
  }

  if (isOnline) {
    return null;
  }

  return (
    <div
      id="offline-indicator"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-slate-900/95 text-white px-3.5 py-2 text-xs font-medium shadow-lg backdrop-blur-md border border-slate-700/60"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-400" />
      <span>Offline Mode — All changes saved in browser</span>
    </div>
  );
};
