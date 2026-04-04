'use client';

import { useTranslations } from 'next-intl';
import { useReactFlow } from '@xyflow/react';
import { ZoomIn, ZoomOut, Maximize } from 'lucide-react';

export function CanvasControls() {
  const t = useTranslations('canvas');
  const { zoomIn, zoomOut, fitView } = useReactFlow();

  const controls = [
    { action: () => zoomIn(), icon: ZoomIn, label: t('zoomIn') },
    { action: () => zoomOut(), icon: ZoomOut, label: t('zoomOut') },
    { action: () => fitView({ padding: 0.2 }), icon: Maximize, label: t('fitView') },
  ];

  return (
    <div className="absolute bottom-4 right-4 z-10 flex flex-col gap-1 bg-white/95 backdrop-blur-xl rounded-xl shadow-xl border border-slate-200/60 p-1.5">
      {controls.map(({ action, icon: Icon, label }) => (
        <button
          key={label}
          onClick={action}
          title={label}
          className="p-2.5 rounded-lg hover:bg-indigo-50 transition-all duration-200 active:scale-95 group"
        >
          <Icon className="w-4 h-4 text-slate-500 group-hover:text-indigo-600 transition-colors" />
        </button>
      ))}
    </div>
  );
}
