'use client';

import React from 'react';
import dynamic from 'next/dynamic';
import { AppLogo } from './AppLogo';
import type { NotepadAppProps } from './NotepadApp';

function WorkspaceLoading() {
  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#F6F7F9] dark:bg-[#090B10] select-none w-full h-full"
    >
      <div className="flex flex-col items-center gap-4 animate-logo-breath">
        <AppLogo size={52} tileRadius={120} />
        <div className="flex items-center gap-2.5">
          <div className="w-4 h-4 border-2 border-indigo-600 dark:border-indigo-400 border-t-transparent rounded-full animate-spin" />
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 tracking-wide">
            Preparing workspace...
          </span>
        </div>
      </div>
    </div>
  );
}

const DynamicNotepadApp = dynamic(
  () => import('./NotepadApp').then((mod) => mod.NotepadApp),
  {
    ssr: false,
    loading: () => <WorkspaceLoading />,
  }
);

export function NotepadClientWrapper(props: NotepadAppProps) {
  return <DynamicNotepadApp {...props} />;
}
