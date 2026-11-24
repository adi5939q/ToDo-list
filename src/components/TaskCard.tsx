import {
  AlertCircle,
  Calendar,
  Check,
  CheckCircle2,
  Flag,
  Folder,
  Pencil,
  Trash2,
} from 'lucide-react';
import { Task } from '../types/task';
import { formatDisplayDate, isTaskOverdue } from '../utils/taskStorage';

interface TaskCardProps {
  task: Task;
  onToggleComplete: (taskId: string) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({
  task,
  onToggleComplete,
  onEdit,
  onDelete,
}: TaskCardProps) {
  const overdue = isTaskOverdue(task);

  const priorityDisplay = {
    High: {
      textClass: 'text-red-600 font-medium',
      label: 'High Priority',
    },
    Medium: {
      textClass: 'text-orange-600 font-medium',
      label: 'Medium Priority',
    },
    Low: {
      textClass: 'text-slate-600 font-medium',
      label: 'Low Priority',
    },
  }[task.priority];

  return (
    <article
      className={`group rounded-xl bg-white border p-5 transition-all duration-150 ${
        task.completed
          ? 'border-green-200 bg-green-50/20'
          : overdue
            ? 'border-red-200 shadow-xs'
            : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
      }`}
    >
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-start gap-3.5 min-w-0 flex-1">
          {/* Completion Checkbox */}
          <button
            type="button"
            role="checkbox"
            aria-checked={task.completed}
            aria-label={
              task.completed
                ? `Mark "${task.title}" as pending`
                : `Mark "${task.title}" as completed`
            }
            onClick={() => onToggleComplete(task.id)}
            className={`mt-0.5 flex h-5 w-5 shrink-0 items-center justify-center rounded-md border transition-colors duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              task.completed
                ? 'border-green-600 bg-green-600 text-white'
                : 'border-slate-300 bg-white text-transparent hover:border-slate-500'
            }`}
          >
            <Check className="h-3.5 w-3.5 stroke-[2.5]" aria-hidden="true" />
          </button>

          {/* Task Content */}
          <div className="min-w-0 flex-1">
            <div className="flex flex-wrap items-baseline gap-x-2.5 gap-y-1">
              <h3
                className={`text-base font-semibold leading-snug break-words ${
                  task.completed ? 'line-through text-slate-400' : 'text-slate-900'
                }`}
              >
                {task.title}
              </h3>
            </div>

            {task.description && (
              <p
                className={`mt-1.5 text-sm leading-relaxed break-words ${
                  task.completed ? 'text-slate-400' : 'text-slate-600'
                }`}
              >
                {task.description}
              </p>
            )}

            {/* Unboxed Metadata Line (Zero-Pill Discipline) */}
            <div className="mt-3 flex flex-wrap items-center gap-x-2.5 gap-y-1.5 text-xs text-slate-500">
              <span className="inline-flex items-center gap-1.5 text-slate-600">
                <Folder className="h-3.5 w-3.5 text-slate-400" aria-hidden="true" />
                <span>{task.category}</span>
              </span>

              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>

              <span
                className={`inline-flex items-center gap-1.5 font-mono tabular-nums ${
                  overdue ? 'text-red-600 font-medium' : 'text-slate-600'
                }`}
              >
                <Calendar
                  className={`h-3.5 w-3.5 ${overdue ? 'text-red-500' : 'text-slate-400'}`}
                  aria-hidden="true"
                />
                <span>{formatDisplayDate(task.dueDate)}</span>
              </span>

              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>

              <span className={`inline-flex items-center gap-1.5 ${priorityDisplay.textClass}`}>
                <Flag className="h-3.5 w-3.5" aria-hidden="true" />
                <span>{priorityDisplay.label}</span>
              </span>

              <span aria-hidden="true" className="text-slate-300">
                ·
              </span>

              {task.completed ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-green-600">
                  <CheckCircle2 className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Completed</span>
                </span>
              ) : overdue ? (
                <span className="inline-flex items-center gap-1.5 font-medium text-red-600">
                  <AlertCircle className="h-3.5 w-3.5" aria-hidden="true" />
                  <span>Overdue</span>
                </span>
              ) : (
                <span className="text-slate-500 font-medium">Pending</span>
              )}
            </div>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => onEdit(task)}
            aria-label={`Edit task "${task.title}"`}
            title="Edit task"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Pencil className="h-4 w-4" aria-hidden="true" />
          </button>
          <button
            type="button"
            onClick={() => onDelete(task)}
            aria-label={`Delete task "${task.title}"`}
            title="Delete task"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-red-50 hover:text-red-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-red-600"
          >
            <Trash2 className="h-4 w-4" aria-hidden="true" />
          </button>
        </div>
      </div>
    </article>
  );
}
