import { ArrowUpDown, Search, X } from 'lucide-react';
import {
  Category,
  Priority,
  SortDirection,
  SortField,
  StatusFilter,
  TaskStats,
} from '../types/task';
import { CATEGORIES, PRIORITIES } from '../utils/taskStorage';

interface FilterToolbarProps {
  searchQuery: string;
  onSearchChange: (value: string) => void;
  statusFilter: StatusFilter;
  onStatusChange: (status: StatusFilter) => void;
  priorityFilter: Priority | 'All';
  onPriorityChange: (priority: Priority | 'All') => void;
  categoryFilter: Category | 'All';
  onCategoryChange: (category: Category | 'All') => void;
  sortField: SortField;
  onSortFieldChange: (field: SortField) => void;
  sortDirection: SortDirection;
  onToggleSortDirection: () => void;
  stats: TaskStats;
  hideCategorySelect?: boolean;
  onResetFilters: () => void;
  hasActiveFilters: boolean;
}

export function FilterToolbar({
  searchQuery,
  onSearchChange,
  statusFilter,
  onStatusChange,
  priorityFilter,
  onPriorityChange,
  categoryFilter,
  onCategoryChange,
  sortField,
  onSortFieldChange,
  sortDirection,
  onToggleSortDirection,
  stats,
  hideCategorySelect = false,
  onResetFilters,
  hasActiveFilters,
}: FilterToolbarProps) {
  const statusTabs: Array<{ id: StatusFilter; label: string; count: number }> = [
    { id: 'all', label: 'All Tasks', count: stats.total },
    { id: 'pending', label: 'Pending Tasks', count: stats.pending },
    { id: 'completed', label: 'Completed Tasks', count: stats.completed },
    { id: 'overdue', label: 'Overdue Tasks', count: stats.overdue },
  ];

  return (
    <div className="space-y-4">
      {/* Segmented Status Tabs + Search Bar */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-3">
        <div
          role="tablist"
          aria-label="Filter tasks by status"
          className="flex flex-wrap items-center gap-1 p-1 rounded-xl bg-slate-100 border border-slate-200/70"
        >
          {statusTabs.map((tab) => {
            const active = statusFilter === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                role="tab"
                aria-selected={active}
                onClick={() => onStatusChange(tab.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors duration-150 whitespace-nowrap shrink-0 flex items-center gap-1.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                  active
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`font-mono tabular-nums ${
                    active ? 'text-slate-700' : 'text-slate-400'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search Input */}
        <div className="relative w-full lg:w-72">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400"
            aria-hidden="true"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            placeholder="Search tasks by title..."
            aria-label="Search tasks by title"
            className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-8 py-2 text-sm text-slate-900 placeholder:text-slate-400 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15 transition-colors"
          />
          {searchQuery && (
            <button
              type="button"
              onClick={() => onSearchChange('')}
              aria-label="Clear search"
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 p-0.5 rounded"
            >
              <X className="h-3.5 w-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Priority, Category & Sort Controls */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="whitespace-nowrap">Priority:</span>
            <select
              value={priorityFilter}
              onChange={(e) => onPriorityChange(e.target.value as Priority | 'All')}
              aria-label="Filter by priority"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="All">All Priorities</option>
              {PRIORITIES.map((priority) => (
                <option key={priority} value={priority}>
                  {priority}
                </option>
              ))}
            </select>
          </label>

          {!hideCategorySelect && (
            <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
              <span className="whitespace-nowrap">Category:</span>
              <select
                value={categoryFilter}
                onChange={(e) => onCategoryChange(e.target.value as Category | 'All')}
                aria-label="Filter by category"
                className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
              >
                <option value="All">All Categories</option>
                {CATEGORIES.map((category) => (
                  <option key={category} value={category}>
                    {category}
                  </option>
                ))}
              </select>
            </label>
          )}

          {hasActiveFilters && (
            <button
              type="button"
              onClick={onResetFilters}
              className="text-xs font-medium text-blue-600 hover:text-blue-700 hover:underline px-1.5 py-1 whitespace-nowrap shrink-0"
            >
              Reset filters
            </button>
          )}
        </div>

        <div className="flex items-center gap-2">
          <label className="flex items-center gap-2 text-xs font-medium text-slate-600">
            <span className="whitespace-nowrap">Sort by:</span>
            <select
              value={sortField}
              onChange={(e) => onSortFieldChange(e.target.value as SortField)}
              aria-label="Sort tasks by"
              className="rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-800 focus:border-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-600/15"
            >
              <option value="dueDate">Due Date</option>
              <option value="priority">Priority</option>
              <option value="createdAt">Creation Date</option>
            </select>
          </label>

          <button
            type="button"
            onClick={onToggleSortDirection}
            title={sortDirection === 'asc' ? 'Ascending order' : 'Descending order'}
            aria-label={`Sort order: ${sortDirection === 'asc' ? 'Ascending' : 'Descending'}. Click to toggle.`}
            className="inline-flex items-center gap-1.5 rounded-lg border border-slate-200 bg-white px-2.5 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50 transition-colors whitespace-nowrap shrink-0 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600"
          >
            <ArrowUpDown className="h-3.5 w-3.5 text-slate-500" aria-hidden="true" />
            <span>{sortDirection === 'asc' ? 'Asc' : 'Desc'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
