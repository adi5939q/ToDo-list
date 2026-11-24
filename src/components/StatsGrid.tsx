import { AlertTriangle, CheckCircle2, Clock, Layers } from 'lucide-react';
import { StatusFilter, TaskStats } from '../types/task';

interface StatsGridProps {
  stats: TaskStats;
  activeStatusFilter: StatusFilter;
  onSelectStatus: (status: StatusFilter) => void;
}

export function StatsGrid({
  stats,
  activeStatusFilter,
  onSelectStatus,
}: StatsGridProps) {
  const cards: Array<{
    key: StatusFilter;
    label: string;
    value: number;
    icon: typeof Layers;
    accentClass: string;
    valueClass: string;
    helper: string;
  }> = [
    {
      key: 'all',
      label: 'Total Tasks',
      value: stats.total,
      icon: Layers,
      accentClass: 'text-slate-600 bg-slate-100',
      valueClass: 'text-slate-900',
      helper: 'Across all categories',
    },
    {
      key: 'completed',
      label: 'Completed Tasks',
      value: stats.completed,
      icon: CheckCircle2,
      accentClass: 'text-green-700 bg-green-50',
      valueClass: 'text-green-700',
      helper:
        stats.total > 0
          ? `${Math.round((stats.completed / stats.total) * 100)}% finished`
          : 'No tasks yet',
    },
    {
      key: 'pending',
      label: 'Pending Tasks',
      value: stats.pending,
      icon: Clock,
      accentClass: 'text-orange-700 bg-orange-50',
      valueClass: 'text-slate-900',
      helper: 'Active in queue',
    },
    {
      key: 'overdue',
      label: 'Overdue Tasks',
      value: stats.overdue,
      icon: AlertTriangle,
      accentClass: stats.overdue > 0 ? 'text-red-700 bg-red-50' : 'text-slate-500 bg-slate-100',
      valueClass: stats.overdue > 0 ? 'text-red-600' : 'text-slate-900',
      helper: stats.overdue > 0 ? 'Needs attention' : 'All on schedule',
    },
  ];

  return (
    <section aria-label="Task statistics" className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
      {cards.map((card) => {
        const Icon = card.icon;
        const isSelected = activeStatusFilter === card.key;
        return (
          <button
            key={card.key}
            type="button"
            onClick={() => onSelectStatus(card.key)}
            className={`group text-left rounded-xl bg-white p-5 border transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
              isSelected
                ? 'border-slate-900 shadow-sm'
                : 'border-slate-200 hover:border-slate-300 hover:shadow-xs'
            }`}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-slate-500">{card.label}</p>
                <p
                  className={`mt-2 font-mono text-3xl font-semibold tracking-tight tabular-nums ${card.valueClass}`}
                >
                  {card.value}
                </p>
              </div>
              <span
                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.accentClass}`}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
              </span>
            </div>
            <p className="mt-3 text-xs text-slate-500">{card.helper}</p>
          </button>
        );
      })}
    </section>
  );
}
