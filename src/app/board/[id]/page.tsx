'use client';

import { useRouter } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { ArrowLeft } from 'lucide-react';
import { CanvasWorkspace } from '@/components/canvas/CanvasWorkspace';
import { LanguageSwitcher } from '@/components/ui/LanguageSwitcher';
import { useCanvasStore } from '@/stores/canvasStore';
import { ReactFlowProvider } from '@xyflow/react';

export default function BoardPage() {
  const t = useTranslations('canvas');
  const router = useRouter();
  const boardName = useCanvasStore((s) => s.boardName);

  return (
    <div className="flex flex-col h-screen bg-slate-50">
      <header className="h-14 bg-white/95 backdrop-blur-xl border-b border-slate-200/60 flex items-center justify-between px-4 shrink-0 z-20">
        <div className="flex items-center gap-3">
          <button
            onClick={() => router.push('/dashboard')}
            className="flex items-center gap-2 px-3 py-1.5 text-sm font-medium text-slate-600 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all duration-200"
          >
            <ArrowLeft className="w-4 h-4" />
            <span className="hidden sm:inline">{t('backToDashboard')}</span>
          </button>
          <div className="w-px h-6 bg-slate-200" />
          <h1 className="text-sm font-semibold text-slate-800 truncate max-w-xs">
            {boardName}
          </h1>
        </div>
        <div className="flex items-center gap-2">
          <LanguageSwitcher />
        </div>
      </header>
      <main className="flex-1 relative">
        <ReactFlowProvider>
          <CanvasWorkspace />
        </ReactFlowProvider>
      </main>
    </div>
  );
}
