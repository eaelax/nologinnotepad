'use client';

import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  FileText,
  FileCode,
  Archive,
  CheckCircle2,
  AlertCircle,
  FileCheck,
} from 'lucide-react';
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
  activeNote: Note | null;
  allNotes: Note[];
  preferences: UserPreferences;
  onImportSuccess: (importedNotes: Note[], newPrefs?: Partial<UserPreferences>) => void;
}

export const ExportImportModal: React.FC<ExportImportModalProps> = ({
  isOpen,
  onClose,
  activeNote,
  allNotes,
  preferences,
  onImportSuccess,
}) => {
  const [activeTab, setActiveTab] = useState<'export' | 'import'>('export');
  const [importStatus, setImportStatus] = useState<{
    type: 'idle' | 'loading' | 'success' | 'error';
    message?: string;
  }>({ type: 'idle' });
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  if (!isOpen) return null;

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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-in fade-in duration-150">
      <div
        className="w-full max-w-md rounded-2xl bg-paper-theme border border-subtle-theme shadow-2xl p-6 text-primary-theme"
        role="dialog"
        aria-modal="true"
        aria-labelledby="export-import-title"
      >
        <div className="flex items-center justify-between pb-4 border-b border-subtle-theme">
          <div className="flex items-center gap-1 p-1 bg-card-theme rounded-lg">
            <button
              onClick={() => {
                setActiveTab('export');
                setImportStatus({ type: 'idle' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                activeTab === 'export'
                  ? 'bg-paper-theme text-primary-theme shadow-xs font-semibold'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              Export
            </button>
            <button
              onClick={() => {
                setActiveTab('import');
                setImportStatus({ type: 'idle' });
              }}
              className={`px-3 py-1 rounded-md text-xs font-medium transition ${
                activeTab === 'import'
                  ? 'bg-paper-theme text-primary-theme shadow-xs font-semibold'
                  : 'text-secondary-theme hover:text-primary-theme'
              }`}
            >
              Import File
            </button>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg p-1 text-secondary-theme hover:text-primary-theme hover:bg-card-theme transition"
            aria-label="Close"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {activeTab === 'export' ? (
          <div className="mt-4 space-y-4">
            <div>
              <p className="text-xs font-semibold text-secondary-theme uppercase tracking-wider">
                Current Note ({activeNote?.title || 'Untitled'})
              </p>
              <div className="mt-2 grid grid-cols-3 gap-2">
                <button
                  type="button"
                  disabled={!activeNote}
                  onClick={() => activeNote && exportNoteAsTxt(activeNote)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-subtle-theme hover:bg-card-theme transition group disabled:opacity-50"
                >
                  <FileText className="w-5 h-5 text-secondary-theme group-hover:scale-105 transition" />
                  <span className="mt-1.5 text-xs font-medium text-primary-theme">Plain Text</span>
                  <span className="text-[10px] text-secondary-theme">.txt</span>
                </button>

                <button
                  type="button"
                  disabled={!activeNote}
                  onClick={() => activeNote && exportNoteAsMarkdown(activeNote)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-subtle-theme hover:bg-card-theme transition group disabled:opacity-50"
                >
                  <FileCode className="w-5 h-5 text-sky-600 dark:text-sky-400 group-hover:scale-105 transition" />
                  <span className="mt-1.5 text-xs font-medium text-primary-theme">Markdown</span>
                  <span className="text-[10px] text-secondary-theme">.md</span>
                </button>

                <button
                  type="button"
                  disabled={!activeNote}
                  onClick={() => activeNote && exportNoteAsJson(activeNote)}
                  className="flex flex-col items-center justify-center p-3 rounded-xl border border-subtle-theme hover:bg-card-theme transition group disabled:opacity-50"
                >
                  <FileCheck className="w-5 h-5 text-amber-600 dark:text-amber-400 group-hover:scale-105 transition" />
                  <span className="mt-1.5 text-xs font-medium text-primary-theme">JSON Data</span>
                  <span className="text-[10px] text-secondary-theme">.json</span>
                </button>
              </div>
            </div>

            <div className="pt-2 border-t border-subtle-theme">
              <p className="text-xs font-semibold text-secondary-theme uppercase tracking-wider">
                Full Vault Backup
              </p>
              <div className="mt-2 p-3.5 rounded-xl bg-card-theme border border-subtle-theme flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5 font-medium text-xs sm:text-sm text-primary-theme">
                    <Archive className="w-4 h-4 text-secondary-theme" />
                    <span>All Notes & Settings ({allNotes.length})</span>
                  </div>
                  <p className="mt-0.5 text-[11px] text-secondary-theme">
                    Saves your library and preferences into one portable backup file
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => exportAllNotesBackup(allNotes, preferences)}
                  className="flex items-center gap-1 px-3 py-1.5 rounded-lg btn-primary-theme text-xs font-medium hover:opacity-90 transition shrink-0 shadow-xs"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download</span>
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="mt-4 space-y-4">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={onDrop}
              onClick={() => fileInputRef.current?.click()}
              className={`p-6 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center cursor-pointer transition ${
                isDragging
                  ? 'border-selected-theme bg-card-selected-theme'
                  : 'border-subtle-theme hover:border-selected-theme bg-card-theme'
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
              <div className="p-2.5 rounded-xl bg-paper-theme shadow-xs text-primary-theme mb-2 border border-subtle-theme">
                <Upload className="w-5 h-5" />
              </div>
              <p className="text-xs sm:text-sm font-medium text-primary-theme">
                Click to browse or drag and drop
              </p>
              <p className="text-[11px] text-secondary-theme mt-1">
                Supports Plain text (.txt), Markdown (.md), or NoLoginPad Backup (.json)
              </p>
            </div>

            {importStatus.type === 'success' && (
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 flex items-start gap-2 text-xs text-emerald-800 dark:text-emerald-300">
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{importStatus.message}</span>
              </div>
            )}

            {importStatus.type === 'error' && (
              <div className="p-3 rounded-xl bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-900 flex items-start gap-2 text-xs text-red-800 dark:text-red-300">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>{importStatus.message}</span>
              </div>
            )}
          </div>
        )}

        <div className="mt-5 pt-3 border-t border-subtle-theme flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 text-xs font-medium rounded-lg border border-subtle-theme text-primary-theme hover:bg-stone-100 dark:hover:bg-stone-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
