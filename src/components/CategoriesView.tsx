import { BookOpen, Briefcase, Folder, Plus, User } from 'lucide-react';
import { Category, Task, TaskStats } from '../types/task';
import { CATEGORIES } from '../utils/taskStorage';
import { TaskCard } from './TaskCard';

interface CategoriesViewProps {
  selectedCategory: Category;
  onSelectCategory: (category: Category) => void;
  tasks: Task[];
  stats: TaskStats;
  onToggleComplete: (taskId: string) => void;
  onEditTask: (task: Task) => void;
  onDeleteTask: (task: Task) => void;
  onAddTaskInCategory: (category: Category) => void;
}

const CATEGORY_META: Record<
  Category,
  { description: string; icon: typeof User }
> = {
  Personal: {
    description: 'Errands, health, appointments, and home tasks.',
    icon: User,
  },
  Work: {
    description: 'Project deliverables, meetings, and team priorities.',
    icon: Briefcase,
  },
  Study: {
    description: 'Courses, reading lists, practice, and exam prep.',
    icon: BookOpen,
  },
  Other: {
    description: 'Miscellaneous items and uncategorized reminders.',
    icon: Folder,
  },
};

export function CategoriesView({
  selectedCategory,
  onSelectCategory,
  tasks,
  stats,
  onToggleComplete,
  onEditTask,
  onDeleteTask,
  onAddTaskInCategory,
}: CategoriesViewProps) {
  const categoryTasks = tasks.filter((t) => t.category === selectedCategory);

  return (
    <div className="space-y-8">
      {/* Category Selector Cards */}
      <section aria-label="Task categories overview" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {CATEGORIES.map((cat) => {
          const catStats = stats.byCategory[cat];
          const Icon = CATEGORY_META[cat].icon;
          const isSelected = selectedCategory === cat;
          const progress =
            catStats.total > 0 ? Math.round((catStats.completed / catStats.total) * 100) : 0;

          return (
            <button
              key={cat}
              type="button"
              onClick={() => onSelectCategory(cat)}
              className={`text-left rounded-xl bg-white p-5 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isSelected
                  ? 'border-slate-900 shadow-sm'
                  : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
              }`}
            >
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2.5">
                  <span
                    className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-lg ${
                      isSelected ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    <Icon className="h-4 w-4" aria-hidden="true" />
                  </span>
                  <h3 className="font-display text-base font-semibold text-slate-900">{cat}</h3>
                </div>
                <span className="font-mono text-lg font-semibold tabular-nums text-slate-900">
                  {catStats.total}
                </span>
              </div>

              <p className="mt-3 text-xs leading-relaxed text-slate-500">
                {CATEGORY_META[cat].description}
              </p>

              <div className="mt-4">
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <span className="font-mono tabular-nums">
                    {catStats.completed}/{catStats.total} done
                  </span>
                  {catStats.overdue > 0 && (
                    <span className="font-mono tabular-nums font-medium text-red-600">
                      {catStats.overdue} overdue
                    </span>
                  )}
                </div>
                <div className="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-green-600 transition-all duration-200"
                    style={{ width: `${progress}%` }}
                  />
                </div>
              </div>
            </button>
          );
        })}
      </section>

      {/* Selected Category Tasks */}
      <section aria-label={`${selectedCategory} tasks`} className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 pb-4">
          <div>
            <h2 className="font-display text-xl font-semibold text-slate-900">
              {selectedCategory} Tasks
            </h2>
            <p className="mt-0.5 text-sm text-slate-500">
              Showing <span className="font-mono tabular-nums">{categoryTasks.length}</span>{' '}
              {categoryTasks.length === 1 ? 'task' : 'tasks'} in {selectedCategory}.
            </p>
          </div>
          <button
            type="button"
            onClick={() => onAddTaskInCategory(selectedCategory)}
            className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add {selectedCategory} Task</span>
          </button>
        </div>

        {categoryTasks.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
            <p className="font-display text-base font-semibold text-slate-900">
              No tasks in {selectedCategory} yet
            </p>
            <p className="mt-1 text-sm text-slate-500">
              Create your first {selectedCategory.toLowerCase()} task to start organizing this category.
            </p>
            <button
              type="button"
              onClick={() => onAddTaskInCategory(selectedCategory)}
              className="mt-4 inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
            >
              <Plus className="h-4 w-4" aria-hidden="true" />
              <span>Add Task</span>
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            {categoryTasks.map((task) => (
              <TaskCard
                key={task.id}
                task={task}
                onToggleComplete={onToggleComplete}
                onEdit={onEditTask}
                onDelete={onDeleteTask}
              />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
