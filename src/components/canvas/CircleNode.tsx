'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function CircleNodeComponent({ data, selected }: NodeProps) {
  const [isEditing, setIsEditing] = useState(false);
  const [label, setLabel] = useState((data as { label: string }).label);

  const handleDoubleClick = useCallback(() => {
    setIsEditing(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditing(false);
  }, []);

  return (
    <div
      className={`relative w-[120px] h-[120px] bg-gradient-to-br from-violet-50 to-indigo-50 border-2 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 ${
        selected
          ? 'border-indigo-500 shadow-indigo-200 ring-2 ring-indigo-300'
          : 'border-slate-300 hover:border-indigo-400 hover:shadow-xl'
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
      />
      {isEditing ? (
        <input
          type="text"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className="bg-transparent text-center text-sm font-medium text-slate-700 outline-none w-20"
        />
      ) : (
        <span className="text-sm font-medium text-slate-700 select-none text-center px-2">
          {label}
        </span>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white"
      />
    </div>
  );
}

export const CircleNode = memo(CircleNodeComponent);
