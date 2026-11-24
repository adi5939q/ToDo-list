import { useCallback, useEffect, useMemo, useState } from 'react';
import { Menu, Plus } from 'lucide-react';
import { CategoriesView } from './components/CategoriesView';
import { ConfirmModal } from './components/ConfirmModal';
import { FilterToolbar } from './components/FilterToolbar';
import { SettingsView } from './components/SettingsView';
import { Sidebar } from './components/Sidebar';
import { StatsGrid } from './components/StatsGrid';
import { TaskCard } from './components/TaskCard';
import { TaskModal } from './components/TaskModal';
import { ToastContainer } from './components/ToastContainer';
import {
  Category,
  NavView,
  Priority,
  SortDirection,
  SortField,
  StatusFilter,
  Task,
  TaskFormValues,
  ToastItem,
} from './types/task';
import {
  computeTaskStats,
  createSampleTasks,
  formatCurrentHeaderDate,
  generateTaskId,
  isTaskOverdue,
  loadTasksFromStorage,
  saveTasksToStorage,
} from './utils/taskStorage';

type PendingConfirmAction =
  | { kind: 'deleteTask'; task: Task }
  | { kind: 'clearCompleted' }
  | { kind: 'restoreSamples' }
  | { kind: 'deleteAll' }
  | null;

const PRIORITY_WEIGHT: Record<Priority, number> = {
  High: 3,
  Medium: 2,
  Low: 1,
};

export default function App() {
  const [tasks, setTasks] = useState<Task[]>(() => loadTasksFromStorage());
  const [activeView, setActiveView] = useState<NavView>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Filters & Sorting
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [priorityFilter, setPriorityFilter] = useState<Priority | 'All'>('All');
  const [categoryFilter, setCategoryFilter] = useState<Category | 'All'>('All');
  const [sortField, setSortField] = useState<SortField>('dueDate');
  const [sortDirection, setSortDirection] = useState<SortDirection>('asc');
  const [selectedCategoryTab, setSelectedCategoryTab] = useState<Category>('Personal');

  // Modals
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [editingTask, setEditingTask] = useState<Task | null>(null);
  const [modalDefaultCategory, setModalDefaultCategory] = useState<Category>('Personal');
  const [confirmAction, setConfirmAction] = useState<PendingConfirmAction>(null);

  // Notifications
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const addToast = useCallback((type: ToastItem['type'], message: string) => {
    const id = `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    setToasts((prev) => [...prev.slice(-3), { id, type, message }]);
    window.setTimeout(() => {
      setToasts((prev) => prev.filter((item) => item.id !== id));
    }, 3500);
  }, []);

  const dismissToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((item) => item.id !== id));
  }, []);

  // Persist to LocalStorage whenever tasks state changes
  useEffect(() => {
    saveTasksToStorage(tasks);
  }, [tasks]);

  const stats = useMemo(() => computeTaskStats(tasks), [tasks]);

  const currentDateText = useMemo(() => formatCurrentHeaderDate(), []);

  // Sync sidebar navigation changes with the task status filter
  const handleSelectNavView = (view: NavView) => {
    setActiveView(view);
    if (view === 'dashboard' || view === 'all') {
      setStatusFilter('all');
    } else if (view === 'pending') {
      setStatusFilter('pending');
    } else if (view === 'completed') {
      setStatusFilter('completed');
    }
  };

  // Keep sidebar active state intuitive when clicking status tabs or stat cards
  const handleSelectStatusFilter = (nextStatus: StatusFilter) => {
    setStatusFilter(nextStatus);
    if (activeView === 'pending' && nextStatus !== 'pending') {
      setActiveView('all');
    } else if (activeView === 'completed' && nextStatus !== 'completed') {
      setActiveView('all');
    }
  };

  const hasActiveFilters =
    searchQuery.trim() !== '' ||
    statusFilter !== 'all' ||
    priorityFilter !== 'All' ||
    categoryFilter !== 'All';

  const handleResetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('All');
    setCategoryFilter('All');
    if (activeView === 'pending' || activeView === 'completed') {
      setActiveView('all');
    }
  };

  const filteredAndSortedTasks = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    const filtered = tasks.filter((task) => {
      if (query && !task.title.toLowerCase().includes(query)) {
        return false;
      }

      if (statusFilter === 'pending' && task.completed) return false;
      if (statusFilter === 'completed' && !task.completed) return false;
      if (statusFilter === 'overdue' && !isTaskOverdue(task)) return false;

      if (priorityFilter !== 'All' && task.priority !== priorityFilter) {
        return false;
      }

      if (categoryFilter !== 'All' && task.category !== categoryFilter) {
        return false;
      }

      return true;
    });

    const sorted = [...filtered].sort((a, b) => {
      let comparison = 0;

      if (sortField === 'dueDate') {
        if (!a.dueDate && !b.dueDate) {
          comparison = 0;
        } else if (!a.dueDate) {
          comparison = 1;
        } else if (!b.dueDate) {
          comparison = -1;
        } else {
          comparison = a.dueDate.localeCompare(b.dueDate);
        }
      } else if (sortField === 'priority') {
        comparison = PRIORITY_WEIGHT[a.priority] - PRIORITY_WEIGHT[b.priority];
      } else {
        comparison = a.createdAt.localeCompare(b.createdAt);
      }

      if (comparison === 0) {
        comparison = a.createdAt.localeCompare(b.createdAt);
      }

      return sortDirection === 'asc' ? comparison : -comparison;
    });

    return sorted;
  }, [tasks, searchQuery, statusFilter, priorityFilter, categoryFilter, sortField, sortDirection]);

  // CRUD Handlers
  const openCreateModal = (defaultCat: Category = 'Personal') => {
    setEditingTask(null);
    setModalDefaultCategory(defaultCat);
    setIsTaskModalOpen(true);
  };

  const openEditModal = (task: Task) => {
    setEditingTask(task);
    setModalDefaultCategory(task.category);
    setIsTaskModalOpen(true);
  };

  const handleSaveTask = (values: TaskFormValues, editingTaskId?: string) => {
    const now = new Date().toISOString();

    if (editingTaskId) {
      setTasks((prev) =>
        prev.map((task) =>
          task.id === editingTaskId
            ? {
                ...task,
                title: values.title,
                description: values.description,
                dueDate: values.dueDate,
                priority: values.priority,
                category: values.category,
                updatedAt: now,
              }
            : task
        )
      );
      setIsTaskModalOpen(false);
      setEditingTask(null);
      addToast('success', 'Task updated successfully.');
    } else {
      const newTask: Task = {
        id: generateTaskId(),
        title: values.title,
        description: values.description,
        dueDate: values.dueDate,
        priority: values.priority,
        category: values.category,
        completed: false,
        createdAt: now,
        updatedAt: now,
      };
      setTasks((prev) => [newTask, ...prev]);
      setIsTaskModalOpen(false);
      addToast('success', 'New task added to your list.');
    }
  };

  const handleToggleComplete = (taskId: string) => {
    let toggledTitle = '';
    let nextCompleted = false;

    setTasks((prev) =>
      prev.map((task) => {
        if (task.id !== taskId) return task;
        toggledTitle = task.title;
        nextCompleted = !task.completed;
        return {
          ...task,
          completed: nextCompleted,
          updatedAt: new Date().toISOString(),
        };
      })
    );

    if (toggledTitle) {
      addToast(
        'success',
        nextCompleted
          ? `Marked "${toggledTitle}" as completed.`
          : `Moved "${toggledTitle}" back to pending.`
      );
    }
  };

  const handleRequestDeleteTask = (task: Task) => {
    setConfirmAction({ kind: 'deleteTask', task });
  };

  const handleExecuteConfirmedAction = () => {
    if (!confirmAction) return;

    if (confirmAction.kind === 'deleteTask') {
      const deletedTitle = confirmAction.task.title;
      setTasks((prev) => prev.filter((item) => item.id !== confirmAction.task.id));
      addToast('info', `Deleted "${deletedTitle}".`);
    } else if (confirmAction.kind === 'clearCompleted') {
      const removedCount = tasks.filter((t) => t.completed).length;
      setTasks((prev) => prev.filter((t) => !t.completed));
      addToast(
        'info',
        `Cleared ${removedCount} completed ${removedCount === 1 ? 'task' : 'tasks'}.`
      );
    } else if (confirmAction.kind === 'restoreSamples') {
      const samples = createSampleTasks();
      setTasks(samples);
      addToast('success', 'Sample tasks restored.');
    } else if (confirmAction.kind === 'deleteAll') {
      setTasks([]);
      addToast('info', 'All tasks have been deleted.');
    }

    setConfirmAction(null);
  };

  const handleImportTasks = (importedTasks: Task[], mode: 'replace' | 'merge') => {
    if (mode === 'replace') {
      setTasks(importedTasks);
      addToast(
        'success',
        `Imported ${importedTasks.length} ${importedTasks.length === 1 ? 'task' : 'tasks'} (replaced workspace).`
      );
    } else {
      setTasks((prev) => {
        const existingIds = new Set(prev.map((t) => t.id));
        const deduplicatedIncoming = importedTasks.map((t) =>
          existingIds.has(t.id) ? { ...t, id: generateTaskId() } : t
        );
        return [...deduplicatedIncoming, ...prev];
      });
      addToast(
        'success',
        `Merged ${importedTasks.length} ${importedTasks.length === 1 ? 'task' : 'tasks'} into your list.`
      );
    }
  };

  const getHeaderContext = () => {
    switch (activeView) {
      case 'dashboard':
        return { title: 'Welcome back!', subtitle: currentDateText };
      case 'all':
        return { title: 'All Tasks', subtitle: currentDateText };
      case 'pending':
        return { title: 'Pending Tasks', subtitle: currentDateText };
      case 'completed':
        return { title: 'Completed Tasks', subtitle: currentDateText };
      case 'categories':
        return { title: 'Categories', subtitle: 'Organize and track progress across focus areas' };
      case 'settings':
        return { title: 'Settings', subtitle: 'Manage backups and LocalStorage workspace data' };
    }
  };

  const headerContext = getHeaderContext();

  const confirmDialogConfig = (() => {
    if (!confirmAction) return null;
    switch (confirmAction.kind) {
      case 'deleteTask':
        return {
          title: 'Delete Task',
          message: `Are you sure you want to permanently delete "${confirmAction.task.title}"? This action cannot be undone.`,
          confirmLabel: 'Delete Task',
          destructive: true,
        };
      case 'clearCompleted':
        return {
          title: 'Clear Completed Tasks',
          message: `Permanently remove all ${stats.completed} completed tasks? Pending tasks will remain untouched.`,
          confirmLabel: 'Clear Completed',
          destructive: true,
        };
      case 'restoreSamples':
        return {
          title: 'Restore Sample Tasks',
          message:
            'This will replace your current task list with the default sample tasks. Export a JSON backup first if you want to keep your existing tasks.',
          confirmLabel: 'Restore Samples',
          destructive: false,
        };
      case 'deleteAll':
        return {
          title: 'Delete All Tasks',
          message:
            'Are you sure you want to permanently remove every task from TaskFlow? This cannot be undone.',
          confirmLabel: 'Delete All Tasks',
          destructive: true,
        };
    }
  })();

  return (
    <div className="min-h-screen flex bg-slate-50 text-slate-900">
      {/* Sidebar Navigation */}
      <Sidebar
        activeView={activeView}
        onSelectView={handleSelectNavView}
        stats={stats}
        mobileOpen={mobileMenuOpen}
        onCloseMobile={() => setMobileMenuOpen(false)}
      />

      {/* Main Content Workspace */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile Top Bar */}
        <header className="lg:hidden sticky top-0 z-30 flex items-center justify-between gap-4 bg-white/95 backdrop-blur-xs border-b border-slate-200 px-4 py-3">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-10 w-10 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <Menu className="h-5 w-5" />
            </button>
            <span className="font-display text-base font-bold tracking-tight text-slate-900">
              TaskFlow
            </span>
          </div>

          <button
            type="button"
            onClick={() => openCreateModal()}
            className="inline-flex items-center gap-1.5 rounded-xl bg-slate-900 px-3.5 py-2 text-xs font-medium text-white hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0"
          >
            <Plus className="h-4 w-4" aria-hidden="true" />
            <span>Add Task</span>
          </button>
        </header>

        <main className="flex-1 px-4 sm:px-6 lg:px-10 py-6 sm:py-8">
          <div className="mx-auto max-w-6xl space-y-8">
            {/* Workspace Page Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
              <div>
                <h1 className="font-display text-2xl sm:text-3xl font-bold tracking-tight text-slate-900 text-balance">
                  {headerContext.title}
                </h1>
                <p className="mt-1 text-sm text-slate-500">{headerContext.subtitle}</p>
              </div>

              {activeView !== 'settings' && (
                <button
                  type="button"
                  onClick={() =>
                    openCreateModal(
                      activeView === 'categories' ? selectedCategoryTab : 'Personal'
                    )
                  }
                  className="inline-flex items-center justify-center gap-2 rounded-xl bg-slate-900 px-5 py-2.5 text-sm font-medium text-white shadow-xs hover:bg-slate-800 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
                >
                  <Plus className="h-4 w-4" aria-hidden="true" />
                  <span>Add New Task</span>
                </button>
              )}
            </div>

            {/* View Routing */}
            {activeView === 'categories' ? (
              <CategoriesView
                selectedCategory={selectedCategoryTab}
                onSelectCategory={setSelectedCategoryTab}
                tasks={tasks}
                stats={stats}
                onToggleComplete={handleToggleComplete}
                onEditTask={openEditModal}
                onDeleteTask={handleRequestDeleteTask}
                onAddTaskInCategory={(category) => openCreateModal(category)}
              />
            ) : activeView === 'settings' ? (
              <SettingsView
                tasks={tasks}
                stats={stats}
                onImportTasks={handleImportTasks}
                onClearCompleted={() => setConfirmAction({ kind: 'clearCompleted' })}
                onRestoreSamples={() => setConfirmAction({ kind: 'restoreSamples' })}
                onDeleteAll={() => setConfirmAction({ kind: 'deleteAll' })}
                onNotify={addToast}
              />
            ) : (
              <>
                {/* Dashboard Statistics Cards */}
                {activeView === 'dashboard' && (
                  <StatsGrid
                    stats={stats}
                    activeStatusFilter={statusFilter}
                    onSelectStatus={handleSelectStatusFilter}
                  />
                )}

                {/* Search, Filter & Sorting Toolbar */}
                <section aria-label="Task controls and list" className="space-y-5">
                  <FilterToolbar
                    searchQuery={searchQuery}
                    onSearchChange={setSearchQuery}
                    statusFilter={statusFilter}
                    onStatusChange={handleSelectStatusFilter}
                    priorityFilter={priorityFilter}
                    onPriorityChange={setPriorityFilter}
                    categoryFilter={categoryFilter}
                    onCategoryChange={setCategoryFilter}
                    sortField={sortField}
                    onSortFieldChange={setSortField}
                    sortDirection={sortDirection}
                    onToggleSortDirection={() =>
                      setSortDirection((prev) => (prev === 'asc' ? 'desc' : 'asc'))
                    }
                    stats={stats}
                    onResetFilters={handleResetFilters}
                    hasActiveFilters={hasActiveFilters}
                  />

                  {/* Task List */}
                  {filteredAndSortedTasks.length === 0 ? (
                    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-12 text-center">
                      <h2 className="font-display text-lg font-semibold text-slate-900">
                        {tasks.length === 0
                          ? 'Your task list is empty'
                          : 'No tasks match your current filters'}
                      </h2>
                      <p className="mt-1.5 mx-auto max-w-md text-sm text-slate-500">
                        {tasks.length === 0
                          ? 'Create a new task with a due date, priority, and category to get started.'
                          : 'Try adjusting your search query, status tab, priority, or category filter.'}
                      </p>
                      <div className="mt-5 flex flex-wrap items-center justify-center gap-3">
                        {tasks.length > 0 && hasActiveFilters && (
                          <button
                            type="button"
                            onClick={handleResetFilters}
                            className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
                          >
                            Clear All Filters
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => openCreateModal()}
                          className="inline-flex items-center gap-2 rounded-xl bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 transition-colors"
                        >
                          <Plus className="h-4 w-4" aria-hidden="true" />
                          <span>Add Task</span>
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-xs text-slate-500 px-1">
                        <span>
                          Showing{' '}
                          <span className="font-mono tabular-nums font-medium text-slate-700">
                            {filteredAndSortedTasks.length}
                          </span>{' '}
                          of{' '}
                          <span className="font-mono tabular-nums font-medium text-slate-700">
                            {tasks.length}
                          </span>{' '}
                          {tasks.length === 1 ? 'task' : 'tasks'}
                        </span>
                      </div>
                      {filteredAndSortedTasks.map((task) => (
                        <TaskCard
                          key={task.id}
                          task={task}
                          onToggleComplete={handleToggleComplete}
                          onEdit={openEditModal}
                          onDelete={handleRequestDeleteTask}
                        />
                      ))}
                    </div>
                  )}
                </section>
              </>
            )}
          </div>
        </main>
      </div>

      {/* Create / Edit Task Modal */}
      <TaskModal
        isOpen={isTaskModalOpen}
        editingTask={editingTask}
        defaultCategory={modalDefaultCategory}
        onClose={() => {
          setIsTaskModalOpen(false);
          setEditingTask(null);
        }}
        onSubmit={handleSaveTask}
        onValidationError={(msg) => addToast('error', msg)}
      />

      {/* Delete / Destructive Action Confirmation Dialog */}
      <ConfirmModal
        isOpen={Boolean(confirmDialogConfig)}
        title={confirmDialogConfig?.title ?? ''}
        message={confirmDialogConfig?.message ?? ''}
        confirmLabel={confirmDialogConfig?.confirmLabel ?? 'Confirm'}
        destructive={confirmDialogConfig?.destructive ?? true}
        onConfirm={handleExecuteConfirmedAction}
        onCancel={() => setConfirmAction(null)}
      />

      {/* Toast Notifications */}
      <ToastContainer toasts={toasts} onDismiss={dismissToast} />
    </div>
  );
}
