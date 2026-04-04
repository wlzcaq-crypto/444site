'use client';

import { useTranslations } from 'next-intl';
import { Square, Circle, Type } from 'lucide-react';
import { useCanvasStore, type ShapeType } from '@/stores/canvasStore';

export function Toolbar() {
  const t = useTranslations('canvas');
  const addNode = useCanvasStore((s) => s.addNode);

  const tools: { type: ShapeType; icon: typeof Square; labelKey: string }[] = [
    { type: 'rectangle', icon: Square, labelKey: 'addRectangle' },
    { type: 'circle', icon: Circle, labelKey: 'addCircle' },
    { type: 'text', icon: Type, labelKey: 'addText' },
  ];

  return (
    <div className="absolute top-4 left-1/2 -translate-x-1/2 z-10 flex items-center gap-1 bg-white/95 backdrop-blur-xl rounded-2xl shadow-xl border border-slate-200/60 px-2 py-2">
      {tools.map(({ type, icon: Icon, labelKey }) => (
        <button
          key={type}
          onClick={() => addNode(type)}
          title={t(labelKey)}
          className="group relative flex flex-col items-center gap-0.5 px-4 py-2.5 rounded-xl hover:bg-indigo-50 transition-all duration-200 active:scale-95"
        >
          <Icon className="w-5 h-5 text-slate-600 group-hover:text-indigo-600 transition-colors" />
          <span className="text-[10px] font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
            {t(labelKey)}
          </span>
        </button>
      ))}
    </div>
  );
}
