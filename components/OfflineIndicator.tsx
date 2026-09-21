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

export const OfflineIndicator: React.FC = () => {
  const isMounted = useIsMounted();
  const isOnline = useSyncExternalStore(
    subscribeOnline,
    getOnlineSnapshot,
    () => true
  );

  // During SSR and initial client hydration, isMounted is false, guaranteeing identical HTML.
  // Once hydrated, if offline, it gracefully displays the indicator.
  if (!isMounted || isOnline) {
    return null;
  }

  return (
    <div
      id="offline-indicator"
      className="fixed bottom-4 left-4 z-40 flex items-center gap-2 rounded-lg bg-stone-900/90 text-stone-100 dark:bg-stone-100/90 dark:text-stone-900 px-3 py-1.5 text-xs font-medium shadow-lg backdrop-blur-xs border border-stone-700/50 dark:border-stone-300/50"
    >
      <WifiOff className="w-3.5 h-3.5 text-amber-500 animate-pulse" />
      <span>Offline Mode — All changes stay in browser</span>
    </div>
  );
};

