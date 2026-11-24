import { Category, Priority, Task, TaskStats } from '../types/task';

export const TASKS_STORAGE_KEY = 'taskflow_tasks_v1';
export const INITIALIZED_STORAGE_KEY = 'taskflow_initialized_v1';

export const PRIORITIES: Priority[] = ['Low', 'Medium', 'High'];
export const CATEGORIES: Category[] = ['Personal', 'Work', 'Study', 'Other'];

export function generateTaskId(): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return crypto.randomUUID();
  }
  return `task_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
}

export function getLocalDateString(date: Date = new Date()): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function addDaysToLocalDate(days: number): string {
  const date = new Date();
  date.setDate(date.getDate() + days);
  return getLocalDateString(date);
}

export function isTaskOverdue(task: Pick<Task, 'completed' | 'dueDate'>): boolean {
  if (task.completed || !task.dueDate) {
    return false;
  }
  const today = getLocalDateString();
  return task.dueDate < today;
}

export function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return 'No due date';
  const parts = dateStr.split('-').map(Number);
  if (parts.length !== 3 || parts.some(Number.isNaN)) return dateStr;

  const [year, month, day] = parts;
  const date = new Date(year, month - 1, day);
  const todayStr = getLocalDateString();
  const tomorrowStr = addDaysToLocalDate(1);
  const yesterdayStr = addDaysToLocalDate(-1);

  if (dateStr === todayStr) return 'Today';
  if (dateStr === tomorrowStr) return 'Tomorrow';
  if (dateStr === yesterdayStr) return 'Yesterday';

  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: year !== new Date().getFullYear() ? 'numeric' : undefined,
  });
}

export function formatCurrentHeaderDate(date: Date = new Date()): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

export function createSampleTasks(): Task[] {
  const now = Date.now();
  return [
    {
      id: generateTaskId(),
      title: 'Finalize Q4 product roadmap presentation',
      description: 'Consolidate engineering milestones, review resource estimates, and share slides ahead of tomorrow’s sync.',
      dueDate: addDaysToLocalDate(-1),
      priority: 'High',
      category: 'Work',
      completed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 48).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 24).toISOString(),
    },
    {
      id: generateTaskId(),
      title: 'Review distributed systems lecture notes',
      description: 'Summarize consensus algorithms and work through Raft state transition examples for Friday quiz.',
      dueDate: addDaysToLocalDate(0),
      priority: 'High',
      category: 'Study',
      completed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 30).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 12).toISOString(),
    },
    {
      id: generateTaskId(),
      title: 'Schedule annual dental checkup',
      description: 'Call clinic before 4 PM and confirm morning slot availability.',
      dueDate: addDaysToLocalDate(2),
      priority: 'Medium',
      category: 'Personal',
      completed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 20).toISOString(),
    },
    {
      id: generateTaskId(),
      title: 'Prepare weekly team sprint retrospective',
      description: 'Gather velocity metrics and highlight key blockers resolved during the release.',
      dueDate: addDaysToLocalDate(4),
      priority: 'Medium',
      category: 'Work',
      completed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 10).toISOString(),
    },
    {
      id: generateTaskId(),
      title: 'Organize digital receipts and tax folder',
      description: 'Archive October invoices into cloud backup and label deductible expenses.',
      dueDate: addDaysToLocalDate(6),
      priority: 'Low',
      category: 'Other',
      completed: false,
      createdAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 6).toISOString(),
    },
    {
      id: generateTaskId(),
      title: 'Complete TypeScript generics workshop exercises',
      description: 'Finished all five utility-type challenges and pushed solution notes.',
      dueDate: addDaysToLocalDate(-2),
      priority: 'Medium',
      category: 'Study',
      completed: true,
      createdAt: new Date(now - 1000 * 60 * 60 * 72).toISOString(),
      updatedAt: new Date(now - 1000 * 60 * 60 * 36).toISOString(),
    },
  ];
}

export function loadTasksFromStorage(): Task[] {
  try {
    const initialized = localStorage.getItem(INITIALIZED_STORAGE_KEY);
    const raw = localStorage.getItem(TASKS_STORAGE_KEY);

    if (!initialized && raw === null) {
      const samples = createSampleTasks();
      localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(samples));
      localStorage.setItem(INITIALIZED_STORAGE_KEY, 'true');
      return samples;
    }

    if (!raw) {
      return [];
    }

    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) {
      return [];
    }

    return normalizeTaskList(parsed);
  } catch {
    return [];
  }
}

export function saveTasksToStorage(tasks: Task[]): boolean {
  try {
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(tasks));
    localStorage.setItem(INITIALIZED_STORAGE_KEY, 'true');
    return true;
  } catch {
    return false;
  }
}

function isPriority(value: unknown): value is Priority {
  return value === 'Low' || value === 'Medium' || value === 'High';
}

function isCategory(value: unknown): value is Category {
  return value === 'Personal' || value === 'Work' || value === 'Study' || value === 'Other';
}

export function normalizeTaskList(items: unknown[]): Task[] {
  const seenIds = new Set<string>();
  const normalized: Task[] = [];

  for (const item of items) {
    if (!item || typeof item !== 'object') continue;
    const record = item as Record<string, unknown>;
    const rawTitle = typeof record.title === 'string' ? record.title.trim() : '';
    if (!rawTitle) continue;

    let id = typeof record.id === 'string' && record.id.trim() ? record.id.trim() : generateTaskId();
    if (seenIds.has(id)) {
      id = generateTaskId();
    }
    seenIds.add(id);

    const description = typeof record.description === 'string' ? record.description : '';
    const dueDate =
      typeof record.dueDate === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(record.dueDate)
        ? record.dueDate
        : '';
    const priority: Priority = isPriority(record.priority) ? record.priority : 'Medium';
    const category: Category = isCategory(record.category) ? record.category : 'Personal';
    const completed = Boolean(record.completed);
    const createdAt =
      typeof record.createdAt === 'string' && !Number.isNaN(Date.parse(record.createdAt))
        ? record.createdAt
        : new Date().toISOString();
    const updatedAt =
      typeof record.updatedAt === 'string' && !Number.isNaN(Date.parse(record.updatedAt))
        ? record.updatedAt
        : createdAt;

    normalized.push({
      id,
      title: rawTitle,
      description,
      dueDate,
      priority,
      category,
      completed,
      createdAt,
      updatedAt,
    });
  }

  return normalized;
}

export function parseImportedBackup(rawJson: string): { ok: true; tasks: Task[] } | { ok: false; error: string } {
  try {
    const parsed: unknown = JSON.parse(rawJson);
    let candidateArray: unknown[] | null = null;

    if (Array.isArray(parsed)) {
      candidateArray = parsed;
    } else if (parsed && typeof parsed === 'object' && Array.isArray((parsed as { tasks?: unknown }).tasks)) {
      candidateArray = (parsed as { tasks: unknown[] }).tasks;
    }

    if (!candidateArray) {
      return { ok: false, error: 'Backup file must contain a JSON array of tasks or a { tasks: [...] } object.' };
    }

    const tasks = normalizeTaskList(candidateArray);
    if (candidateArray.length > 0 && tasks.length === 0) {
      return { ok: false, error: 'No valid tasks were found in the imported JSON file.' };
    }

    return { ok: true, tasks };
  } catch {
    return { ok: false, error: 'Invalid JSON file. Please check the file formatting and try again.' };
  }
}

export function computeTaskStats(tasks: Task[]): TaskStats {
  const byCategory: TaskStats['byCategory'] = {
    Personal: { total: 0, completed: 0, pending: 0, overdue: 0 },
    Work: { total: 0, completed: 0, pending: 0, overdue: 0 },
    Study: { total: 0, completed: 0, pending: 0, overdue: 0 },
    Other: { total: 0, completed: 0, pending: 0, overdue: 0 },
  };

  let completed = 0;
  let pending = 0;
  let overdue = 0;

  for (const task of tasks) {
    const catStats = byCategory[task.category];
    catStats.total += 1;

    if (task.completed) {
      completed += 1;
      catStats.completed += 1;
    } else {
      pending += 1;
      catStats.pending += 1;
      if (isTaskOverdue(task)) {
        overdue += 1;
        catStats.overdue += 1;
      }
    }
  }

  return {
    total: tasks.length,
    completed,
    pending,
    overdue,
    byCategory,
  };
}
