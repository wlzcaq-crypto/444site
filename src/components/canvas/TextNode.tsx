'use client';

import { memo, useState, useCallback } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';

function TextNodeComponent({ data, selected }: NodeProps) {
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
      className={`relative px-4 py-2 min-w-[100px] transition-all duration-200 ${
        selected ? 'ring-2 ring-indigo-300 rounded-lg bg-indigo-50/50' : ''
      }`}
      onDoubleClick={handleDoubleClick}
    >
      <Handle
        type="target"
        position={Position.Top}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !opacity-0 hover:!opacity-100"
      />
      <Handle
        type="target"
        position={Position.Left}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !opacity-0 hover:!opacity-100"
      />
      {isEditing ? (
        <textarea
          value={label}
          onChange={(e) => setLabel(e.target.value)}
          onBlur={handleBlur}
          autoFocus
          className="bg-transparent text-base text-slate-800 outline-none w-full resize-none min-h-[24px]"
          rows={2}
        />
      ) : (
        <p className="text-base text-slate-800 select-none whitespace-pre-wrap">
          {label}
        </p>
      )}
      <Handle
        type="source"
        position={Position.Bottom}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !opacity-0 hover:!opacity-100"
      />
      <Handle
        type="source"
        position={Position.Right}
        className="!w-3 !h-3 !bg-indigo-500 !border-2 !border-white !opacity-0 hover:!opacity-100"
      />
    </div>
  );
}

export const TextNode = memo(TextNodeComponent);
