'use client';

import React, { useState, useRef, useEffect } from 'react';
import { Download, Upload, AlertCircle, X, FileText, FileCode, Database } from 'lucide-react';
import { Note, UserPreferences } from '@/types/note';
import {
  exportNoteAsTxt,
  exportNoteAsMarkdown,
  exportNoteAsJson,
  exportAllNotesBackup,
  parseImportFile,
} from '@/lib/utils/export-import';

interface ExportImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialTab?: 'export' | 'import';
  activeNote: Note | null;
  allNotes: Note[];
  preferences: UserPreferences;
  onImportSuccess: (importedNotes: Note[], newPrefs?: Partial<UserPreferences>) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  initialTab = 'export',
  activeNote,
  allNotes,
  preferences,
  onImportSuccess,
}) => {
  if (!isOpen) return null;

  return (
    <ExportImportModalContent
      key={`${initialTab}_${isOpen}`}
      onClose={onClose}
      initialTab={initialTab}
      activeNote={activeNote}
      allNotes={allNotes}
      preferences={preferences}
      onImportSuccess={onImportSuccess}
    />
  );
};

const ExportImportModalContent: React.FC<Omit<ExportImportModalProps, 'isOpen'>> = ({
  onClose,
  initialTab = 'export',
  activeNote,
  allNotes,
  preferences,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>(initialTab);
  const [showEmptyAlert, setShowEmptyAlert] = useState(false);
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const orig = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = orig;
    };
  }, []);

  const handleFileProcess = async (file: File) => {
    setImportStatus({ type: 'loading', message: 'Reading file...' });
    try {
      const result = await parseImportFile(file);
      setImportStatus({
        type: 'success',
        message: result.message,
      });
      onImportSuccess(result.notes, result.preferences);
    } catch (err: any) {
      setImportStatus({
        type: 'error',
        message: err.message || 'Failed to process file',
      });
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  return (
    <div
      className="fixed inset-0 w-screen h-screen z-[9999] flex items-center justify-center p-4 bg-black/35 backdrop-blur-md animate-in fade-in duration-150 cursor-pointer"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[540px] rounded-2xl bg-white dark:bg-[#141822] text-slate-900 dark:text-slate-100 border border-slate-200/80 dark:border-slate-800/80 overflow-hidden flex flex-col my-auto cursor-default transition-all animate-in zoom-in-95 duration-150 relative shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-import-title"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-6 py-4 flex items-center justify-between border-b border-slate-200/70 dark:border-slate-800/80">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 flex items-center justify-center shrink-0">
              <Download className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 id="export-import-title" className="text-base font-bold tracking-tight text-slate-900 dark:text-white">
                Export & Import Notes
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Download your notes locally or restore backups
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="modal-close-btn w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-slate-700 dark:text-slate-400 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer shrink-0"
            aria-label="Close dialog"
            title="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-5 max-h-[72vh] overflow-y-auto no-scrollbar">
          <div className="flex items-center gap-1 p-1 bg-slate-100 dark:bg-[#1A1F2C] rounded-xl border border-slate-200/70 dark:border-slate-800 w-fit">
            <button
              onClick={() => {
                setActiveTab('export');
                setImportStatus({ type: 'idle' });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'export'
                  ? 'bg-white dark:bg-[#252B3B] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Export Note
            </button>
            <button
              onClick={() => {
                setActiveTab('import');
                setImportStatus({ type: 'idle' });
              }}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                activeTab === 'import'
                  ? 'bg-white dark:bg-[#252B3B] text-slate-900 dark:text-white shadow-2xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              Import File
            </button>
          </div>

          {activeTab === 'export' ? (
            <div className="space-y-4">
              {(() => {
                const rawContent = activeNote?.content || '';
                const strippedContent = rawContent
                  .replace(/<[^>]*>/g, '')
                  .replace(/&nbsp;/g, ' ')
                  .replace(/[\u200B-\u200D\uFEFF]/g, '')
                  .trim();
                const isNoteEmpty = !activeNote || strippedContent.length === 0;

                const handleExport = (format: 'txt' | 'md' | 'json') => {
                  if (isNoteEmpty || !activeNote) {
                    setShowEmptyAlert(true);
                    return;
                  }
                  if (format === 'txt') exportNoteAsTxt(activeNote);
                  else if (format === 'md') exportNoteAsMarkdown(activeNote);
                  else if (format === 'json') exportNoteAsJson(activeNote);
                };

                return (
                  <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-[#1A1F2C] border border-slate-200/70 dark:border-slate-800 space-y-3.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500 dark:text-slate-400 font-medium">Active Note</span>
                      <span className="text-slate-900 dark:text-white font-semibold truncate max-w-[260px]">
                        {activeNote?.title || 'Untitled Note'}
                      </span>
                    </div>

                    <div className="grid grid-cols-3 gap-2.5">
                      <button
                        type="button"
                        onClick={() => handleExport('txt')}
                        className="py-3.5 px-3 rounded-xl bg-white dark:bg-[#141822] hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-2xs"
                        title="Export as Plain Text (.txt)"
                      >
                        <FileText className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Plain Text (.txt)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport('md')}
                        className="py-3.5 px-3 rounded-xl bg-white dark:bg-[#141822] hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-2xs"
                        title="Export as Markdown (.md)"
                      >
                        <FileCode className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                        <span>Markdown (.md)</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleExport('json')}
                        className="py-3.5 px-3 rounded-xl bg-white dark:bg-[#141822] hover:border-indigo-500/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/20 border border-slate-200/90 dark:border-slate-700/80 text-slate-800 dark:text-slate-100 text-xs font-semibold transition-all cursor-pointer flex flex-col items-center justify-center gap-1.5 shadow-2xs"
                        title="Export as JSON (.json)"
                      >
                        <Database className="w-4.5 h-4.5 text-indigo-600 dark:text-indigo-400" />
                        <span>JSON (.json)</span>
                      </button>
                    </div>
                  </div>
                );
              })()}

              <div className="p-4 sm:p-5 rounded-xl bg-slate-50/80 dark:bg-[#1A1F2C] border border-slate-200/70 dark:border-slate-800 flex items-center justify-between gap-3">
                <div>
                  <div className="text-xs sm:text-sm font-bold text-slate-900 dark:text-white">
                    Full Workspace Backup (<span className="tabular-nums">{allNotes.length}</span>)
                  </div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Save all tabs and preferences in one JSON bundle
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => exportAllNotesBackup(allNotes, preferences)}
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold transition-colors cursor-pointer shrink-0 shadow-2xs"
                >
                  Download Backup
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-3.5">
              <div
                onDragOver={(e) => {
                  e.preventDefault();
                  setIsDragging(true);
                }}
                onDragLeave={() => setIsDragging(false)}
                onDrop={onDrop}
                onClick={() => fileInputRef.current?.click()}
                className={`p-8 rounded-xl flex flex-col items-center justify-center text-center cursor-pointer transition-colors border-2 border-dashed ${
                  isDragging
                    ? 'border-indigo-500 bg-indigo-50/40 dark:bg-indigo-950/30'
                    : 'border-slate-300 dark:border-slate-700 hover:border-indigo-500 bg-slate-50/70 dark:bg-[#1A1F2C]'
                }`}
              >
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".txt,.md,.markdown,.json"
                  className="hidden"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      handleFileProcess(e.target.files[0]);
                    }
                  }}
                />
                <Upload className="w-6 h-6 text-indigo-500 mb-2" />
                <p className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                  Click or drop a file to import
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Supports .txt, .md, or backup .json
                </p>
              </div>

              {importStatus.type === 'success' && (
                <div className="p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800 text-xs font-semibold text-emerald-800 dark:text-emerald-200">
                  {importStatus.message}
                </div>
              )}

              {importStatus.type === 'error' && (
                <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-800 dark:text-rose-200">
                  {importStatus.message}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-3.5 flex items-center justify-end bg-slate-50/70 dark:bg-[#10131B] border-t border-slate-200/70 dark:border-slate-800/80">
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer shadow-2xs"
          >
            Done
          </button>
        </div>

        {showEmptyAlert && (
          <div
            className="absolute inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/55 animate-in fade-in duration-100"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="w-full max-w-sm rounded-2xl bg-white dark:bg-[#181C26] p-5 shadow-2xl border border-slate-200 dark:border-slate-700 space-y-4 text-center animate-in zoom-in-95 duration-100">
              <div className="w-10 h-10 rounded-full bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div className="space-y-1">
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Export Notice
                </h3>
                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  Cannot export an empty notepad. Write something first!
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowEmptyAlert(false)}
                className="w-full py-2 px-4 text-xs font-semibold rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white transition-colors cursor-pointer"
              >
                OK
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
