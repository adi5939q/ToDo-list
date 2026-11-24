import {
  CheckCircle2,
  Clock,
  FolderKanban,
  LayoutDashboard,
  ListTodo,
  Settings,
  X,
} from 'lucide-react';
import { NavView, TaskStats } from '../types/task';

interface SidebarProps {
  activeView: NavView;
  onSelectView: (view: NavView) => void;
  stats: TaskStats;
  mobileOpen: boolean;
  onCloseMobile: () => void;
}

interface NavItemConfig {
  id: NavView;
  label: string;
  icon: typeof LayoutDashboard;
  count?: number;
}

export function Sidebar({
  activeView,
  onSelectView,
  stats,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const navItems: NavItemConfig[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'all', label: 'All Tasks', icon: ListTodo, count: stats.total },
    { id: 'pending', label: 'Pending', icon: Clock, count: stats.pending },
    { id: 'completed', label: 'Completed', icon: CheckCircle2, count: stats.completed },
    { id: 'categories', label: 'Categories', icon: FolderKanban },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  const handleSelect = (view: NavView) => {
    onSelectView(view);
    onCloseMobile();
  };

  const sidebarContent = (
    <div className="flex h-full flex-col bg-white border-r border-slate-200">
      {/* Brand Header */}
      <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100">
        <button
          type="button"
          onClick={() => handleSelect('dashboard')}
          className="flex items-center gap-3 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 rounded-lg"
        >
          <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-900 text-white shadow-xs">
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              aria-hidden="true"
              className="text-white"
            >
              <path
                d="M9 11.5L11.25 13.75L15.5 9.25"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <rect
                x="3.5"
                y="3.5"
                width="17"
                height="17"
                rx="4.5"
                stroke="currentColor"
                strokeWidth="1.9"
              />
            </svg>
          </span>
          <span className="font-display text-lg font-bold tracking-tight text-slate-900 whitespace-nowrap">
            TaskFlow
          </span>
        </button>

        <button
          type="button"
          onClick={onCloseMobile}
          aria-label="Close navigation menu"
          className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-colors"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      {/* Navigation Links */}
      <nav aria-label="Primary navigation" className="flex-1 px-4 py-5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeView === item.id;
          return (
            <button
              key={item.id}
              type="button"
              onClick={() => handleSelect(item.id)}
              aria-current={isActive ? 'page' : undefined}
              className={`w-full flex items-center justify-between gap-3 px-3.5 py-2.5 rounded-lg text-sm font-medium transition-colors duration-150 whitespace-nowrap focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-600 ${
                isActive
                  ? 'bg-slate-900 text-white'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span className="flex items-center gap-3 min-w-0">
                <Icon
                  className={`h-4 w-4 shrink-0 ${
                    isActive ? 'text-white' : 'text-slate-400'
                  }`}
                  aria-hidden="true"
                />
                <span className="truncate">{item.label}</span>
              </span>
              {typeof item.count === 'number' && (
                <span
                  className={`font-mono text-xs tabular-nums shrink-0 ${
                    isActive ? 'text-slate-300' : 'text-slate-400'
                  }`}
                >
                  {item.count}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Quiet Workspace Summary Footer */}
      <div className="px-6 py-4 border-t border-slate-100">
        <div className="flex items-center justify-between text-xs text-slate-500">
          <span>Completion rate</span>
          <span className="font-mono font-medium tabular-nums text-slate-700">
            {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
          </span>
        </div>
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-green-600 transition-all duration-200"
            style={{
              width: `${stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%`,
            }}
          />
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block lg:w-64 lg:shrink-0 lg:sticky lg:top-0 lg:h-screen">
        {sidebarContent}
      </aside>

      {/* Mobile / Tablet Drawer Overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-[1px] transition-opacity"
            onClick={onCloseMobile}
            aria-hidden="true"
          />
          <aside className="relative z-10 w-72 max-w-[82vw] h-full shadow-xl">
            {sidebarContent}
          </aside>
        </div>
      )}
    </>
  );
}
