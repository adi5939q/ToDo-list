export type Priority = 'Low' | 'Medium' | 'High';

export type Category = 'Personal' | 'Work' | 'Study' | 'Other';

export type StatusFilter = 'all' | 'pending' | 'completed' | 'overdue';

export type SortField = 'dueDate' | 'priority' | 'createdAt';

export type SortDirection = 'asc' | 'desc';

export type NavView =
  | 'dashboard'
  | 'all'
  | 'pending'
  | 'completed'
  | 'categories'
  | 'settings';

export interface Task {
  id: string;
  title: string;
  description: string;
  dueDate: string; // YYYY-MM-DD or ''
  priority: Priority;
  category: Category;
  completed: boolean;
  createdAt: string; // ISO string
  updatedAt: string; // ISO string
}

export interface TaskFormValues {
  title: string;
  description: string;
  dueDate: string;
  priority: Priority;
  category: Category;
}

export interface TaskStats {
  total: number;
  completed: number;
  pending: number;
  overdue: number;
  byCategory: Record<Category, { total: number; completed: number; pending: number; overdue: number }>;
}

export interface ToastItem {
  id: string;
  type: 'success' | 'error' | 'info';
  message: string;
}
