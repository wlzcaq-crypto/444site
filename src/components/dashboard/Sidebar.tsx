'use client';

import { useTranslations } from 'next-intl';
import { Clock, Star, Trash2, Layout } from 'lucide-react';
import { useBoardStore } from '@/stores/boardStore';

export function Sidebar() {
  const t = useTranslations('dashboard');
  const activeView = useBoardStore((s) => s.activeView);
  const setActiveView = useBoardStore((s) => s.setActiveView);

  const navItems = [
    { view: 'recent' as const, icon: Clock, label: t('recentBoards') },
    { view: 'starred' as const, icon: Star, label: t('starredBoards') },
    { view: 'trash' as const, icon: Trash2, label: t('trash') },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col h-full shrink-0">
      <div className="p-5 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center">
            <Layout className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-800">MiroBoard</h2>
            <p className="text-xs text-slate-400">Workspace</p>
          </div>
        </div>
      </div>

      <nav className="flex-1 p-3 space-y-1">
        {navItems.map(({ view, icon: Icon, label }) => (
          <button
            key={view}
            onClick={() => setActiveView(view)}
            className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
              activeView === view
                ? 'bg-indigo-50 text-indigo-700 shadow-sm'
                : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
            }`}
          >
            <Icon className={`w-4.5 h-4.5 ${activeView === view ? 'text-indigo-600' : 'text-slate-400'}`} />
            {label}
          </button>
        ))}
      </nav>

      <div className="p-4 border-t border-slate-100">
        <div className="flex items-center gap-3 px-2">
          <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold">
            U
          </div>
          <div>
            <p className="text-sm font-medium text-slate-700">User</p>
            <p className="text-xs text-slate-400">user@miroboard.com</p>
          </div>
        </div>
      </div>
    </aside>
  );
}
