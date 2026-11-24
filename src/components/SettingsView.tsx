import { ChangeEvent, useRef, useState } from 'react';
import { Download, RotateCcw, Trash2, Upload } from 'lucide-react';
import { Task, TaskStats } from '../types/task';
import { getLocalDateString, parseImportedBackup } from '../utils/taskStorage';

interface SettingsViewProps {
  tasks: Task[];
  stats: TaskStats;
  onImportTasks: (imported: Task[], mode: 'replace' | 'merge') => void;
  onClearCompleted: () => void;
  onRestoreSamples: () => void;
  onDeleteAll: () => void;
  onNotify: (type: 'success' | 'error' | 'info', message: string) => void;
}

export function SettingsView({
  tasks,
  stats,
  onImportTasks,
  onClearCompleted,
  onRestoreSamples,
  onDeleteAll,
  onNotify,
}: SettingsViewProps) {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [importMode, setImportMode] = useState<'replace' | 'merge'>('merge');

  const handleExportJson = () => {
    try {
      const payload = {
        app: 'TaskFlow',
        version: 1,
        exportedAt: new Date().toISOString(),
        tasks,
      };
      const blob = new Blob([JSON.stringify(payload, null, 2)], {
        type: 'application/json',
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `taskflow-backup-${getLocalDateString()}.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      onNotify('success', `Exported ${tasks.length} ${tasks.length === 1 ? 'task' : 'tasks'} to JSON backup.`);
    } catch {
      onNotify('error', 'Failed to export JSON backup.');
    }
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = () => {
      const content = typeof reader.result === 'string' ? reader.result : '';
      const result = parseImportedBackup(content);

      if (!result.ok) {
        onNotify('error', result.error);
        return;
      }

      onImportTasks(result.tasks, importMode);
    };
    reader.onerror = () => {
      onNotify('error', 'Could not read the selected file.');
    };
    reader.readAsText(file);

    // Reset input so selecting the same file again still triggers onChange
    event.target.value = '';
  };

  return (
    <div className="space-y-6 max-w-3xl">
      {/* JSON Backup Section */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          JSON Backup & Restore
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Export all tasks stored in your browser as a portable JSON file, or restore tasks from a previous backup.
        </p>

        <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-6 pt-5 border-t border-slate-100">
          {/* Export */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Export Tasks</h3>
            <p className="text-xs leading-relaxed text-slate-500">
              Downloads a structured <code className="font-mono text-slate-700">.json</code> file containing{' '}
              <span className="font-mono tabular-nums font-medium text-slate-700">{tasks.length}</span>{' '}
              {tasks.length === 1 ? 'task' : 'tasks'}.
            </p>
            <button
              type="button"
              onClick={handleExportJson}
              className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Download className="h-4 w-4" aria-hidden="true" />
              <span>Export JSON Backup</span>
            </button>
          </div>

          {/* Import */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">Import Tasks</h3>
            <div className="flex items-center gap-4 text-xs text-slate-600">
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  value="merge"
                  checked={importMode === 'merge'}
                  onChange={() => setImportMode('merge')}
                  className="accent-slate-900"
                />
                <span>Merge with current</span>
              </label>
              <label className="inline-flex items-center gap-1.5 cursor-pointer">
                <input
                  type="radio"
                  name="import-mode"
                  value="replace"
                  checked={importMode === 'replace'}
                  onChange={() => setImportMode('replace')}
                  className="accent-slate-900"
                />
                <span>Replace all tasks</span>
              </label>
            </div>

            <input
              ref={fileInputRef}
              type="file"
              accept=".json,application/json"
              onChange={handleFileChange}
              className="hidden"
              aria-label="Upload JSON backup file"
            />

            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-800 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              <Upload className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>Import JSON File</span>
            </button>
          </div>
        </div>
      </section>

      {/* Workspace Data Management */}
      <section className="rounded-2xl bg-white border border-slate-200 p-6">
        <h2 className="font-display text-lg font-semibold text-slate-900">
          Workspace Data Management
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          All changes are automatically persisted to browser LocalStorage. Use these actions to tidy up or reset your workspace.
        </p>

        <div className="mt-6 divide-y divide-slate-100 border-t border-slate-100">
          {/* Clear Completed */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Clear Completed Tasks</p>
              <p className="text-xs text-slate-500">
                Permanently remove{' '}
                <span className="font-mono tabular-nums font-medium">{stats.completed}</span>{' '}
                completed {stats.completed === 1 ? 'task' : 'tasks'} while keeping pending tasks.
              </p>
            </div>
            <button
              type="button"
              disabled={stats.completed === 0}
              onClick={onClearCompleted}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <span>Clear Completed</span>
            </button>
          </div>

          {/* Restore Sample Tasks */}
          <div className="py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-slate-900">Reset to Sample Tasks</p>
              <p className="text-xs text-slate-500">
                Replace current tasks with the default starter set of sample tasks.
              </p>
            </div>
            <button
              type="button"
              onClick={onRestoreSamples}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0"
            >
              <RotateCcw className="h-4 w-4 text-slate-500" aria-hidden="true" />
              <span>Restore Sample Tasks</span>
            </button>
          </div>

          {/* Delete All Tasks */}
          <div className="pt-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <div>
              <p className="text-sm font-medium text-red-700">Delete All Tasks</p>
              <p className="text-xs text-slate-500">
                Remove every task from TaskFlow and clear your LocalStorage task list.
              </p>
            </div>
            <button
              type="button"
              disabled={tasks.length === 0}
              onClick={onDeleteAll}
              className="inline-flex items-center justify-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-2 text-sm font-medium text-red-700 hover:bg-red-100 disabled:opacity-45 disabled:cursor-not-allowed transition-colors whitespace-nowrap shrink-0"
            >
              <Trash2 className="h-4 w-4" aria-hidden="true" />
              <span>Delete All Tasks</span>
            </button>
          </div>
        </div>
      </section>
    </div>
  );
}
