'use client';

import { Sidebar } from '@/components/dashboard/Sidebar';
import { BoardGrid } from '@/components/dashboard/BoardGrid';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useTranslations } from 'next-intl';

export default function DashboardPage() {
  const t = useTranslations('user');

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar />
      <div className="flex-1 flex flex-col min-w-0">
        <header className="h-16 bg-white border-b border-slate-200 flex items-center justify-between px-6 shrink-0">
          <div className="flex items-center gap-3">
            <span className="text-sm text-slate-500">{t('welcome')},</span>
            <span className="text-sm font-semibold text-slate-800">User</span>
          </div>
          <div className="flex items-center gap-3">
            <LanguageSwitcher />
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-emerald-400 to-teal-500 flex items-center justify-center text-white text-xs font-bold cursor-pointer hover:ring-2 hover:ring-indigo-300 transition-all">
              U
            </div>
          </div>
        </header>
        <BoardGrid />
      </div>
    </div>
  );
}
