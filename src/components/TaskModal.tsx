import { FormEvent, useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';
import { Category, Priority, Task, TaskFormValues } from '../types/task';
import { CATEGORIES, getLocalDateString, PRIORITIES } from '../utils/taskStorage';

interface TaskModalProps {
  isOpen: boolean;
  editingTask: Task | null;
  defaultCategory?: Category;
  onClose: () => void;
  onSubmit: (values: TaskFormValues, editingTaskId?: string) => void;
  onValidationError: (message: string) => void;
}

export function TaskModal({
  isOpen,
  editingTask,
  defaultCategory = 'Personal',
  onClose,
  onSubmit,
  onValidationError,
}: TaskModalProps) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [priority, setPriority] = useState<Priority>('Medium');
  const [category, setCategory] = useState<Category>(defaultCategory);
  const [titleError, setTitleError] = useState('');
  const titleInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!isOpen) return;

    if (editingTask) {
      setTitle(editingTask.title);
      setDescription(editingTask.description);
      setDueDate(editingTask.dueDate);
      setPriority(editingTask.priority);
      setCategory(editingTask.category);
    } else {
      setTitle('');
      setDescription('');
      setDueDate(getLocalDateString());
      setPriority('Medium');
      setCategory(defaultCategory);
    }
    setTitleError('');

    const timer = setTimeout(() => {
      titleInputRef.current?.focus();
    }, 20);
    return () => clearTimeout(timer);
  }, [isOpen, editingTask, defaultCategory]);

  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const isEditing = Boolean(editingTask);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    const trimmedTitle = title.trim();

    if (!trimmedTitle) {
      const msg = 'Task title is required. Please enter a title before saving.';
      setTitleError(msg);
      onValidationError(msg);
      titleInputRef.current?.focus();
      return;
    }

    onSubmit(
      {
        title: trimmedTitle,
        description: description.trim(),
        dueDate,
        priority,
        category,
      },
      editingTask?.id
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-labelledby="task-modal-title"
    >
      <div
        className="fixed inset-0 bg-slate-900/45 backdrop-blur-[1px]"
        onClick={onClose}
        aria-hidden="true"
      />

      <div className="relative z-10 w-full max-w-lg rounded-2xl bg-white border border-slate-200 shadow-xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100">
          <h2 id="task-modal-title" className="font-display text-lg font-semibold text-slate-900">
            {isEditing ? 'Edit Task' : 'Add New Task'}
          </h2>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100 hover:text-slate-700 transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} noValidate className="p-6 space-y-5">
          {/* Title Field */}
          <div>
            <label htmlFor="task-title" className="block text-sm font-medium text-slate-700">
              Task Title <span className="text-red-600">*</span>
            </label>
            <input
              ref={titleInputRef}
              id="task-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (titleError && e.target.value.trim()) {
                  setTitleError('');
                }
              }}
              placeholder="e.g., Review quarterly project deliverables"
              aria-invalid={Boolean(titleError)}
              aria-describedby={titleError ? 'task-title-error' : undefined}
              className={`mt-1.5 w-full rounded-xl border px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 transition-colors ${
                titleError
                  ? 'border-red-400 focus:border-red-500 focus:ring-red-500/15'
                  : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/15'
              }`}
            />
            {titleError && (
              <p id="task-title-error" className="mt-1.5 text-xs font-medium text-red-600">
                {titleError}
              </p>
            )}
          </div>

          {/* Description Field */}
          <div>
            <label htmlFor="task-description" className="block text-sm font-medium text-slate-700">
              Description <span className="text-slate-400 font-normal">(optional)</span>
            </label>
            <textarea
              id="task-description"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Add helpful context, links, or next steps..."
              className="mt-1.5 w-full rounded-xl border border-slate-200 px-3.5 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors resize-none"
            />
          </div>

          {/* Due Date, Priority, Category */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label htmlFor="task-due-date" className="block text-sm font-medium text-slate-700">
                Due Date
              </label>
              <input
                id="task-due-date"
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 font-mono focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors"
              />
            </div>

            <div>
              <label htmlFor="task-priority" className="block text-sm font-medium text-slate-700">
                Priority
              </label>
              <select
                id="task-priority"
                value={priority}
                onChange={(e) => setPriority(e.target.value as Priority)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors"
              >
                {PRIORITIES.map((p) => (
                  <option key={p} value={p}>
                    {p}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label htmlFor="task-category" className="block text-sm font-medium text-slate-700">
                Category
              </label>
              <select
                id="task-category"
                value={category}
                onChange={(e) => setCategory(e.target.value as Category)}
                className="mt-1.5 w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-900 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors"
              >
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Modal Footer */}
          <div className="flex items-center justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="rounded-xl bg-slate-900 px-5 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
            >
              {isEditing ? 'Save Changes' : 'Add Task'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
