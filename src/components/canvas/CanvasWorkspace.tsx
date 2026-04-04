'use client';

import { useCallback, useMemo } from 'react';
import {
  ReactFlow,
  Background,
  BackgroundVariant,
  MiniMap,
  type NodeTypes,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { useCanvasStore } from '@/stores/canvasStore';
import { RectangleNode } from './RectangleNode';
import { CircleNode } from './CircleNode';
import { TextNode } from './TextNode';
import { Toolbar } from './Toolbar';
import { CanvasControls } from './CanvasControls';

export function CanvasWorkspace() {
  const nodes = useCanvasStore((s) => s.nodes);
  const edges = useCanvasStore((s) => s.edges);
  const onNodesChange = useCanvasStore((s) => s.onNodesChange);
  const onEdgesChange = useCanvasStore((s) => s.onEdgesChange);
  const onConnect = useCanvasStore((s) => s.onConnect);

  const nodeTypes: NodeTypes = useMemo(
    () => ({
      rectangleNode: RectangleNode,
      circleNode: CircleNode,
      textNode: TextNode,
    }),
    []
  );

  const defaultEdgeOptions = useMemo(
    () => ({
      type: 'smoothstep',
      animated: true,
    }),
    []
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  return (
    <div className="w-full h-full relative">
      <Toolbar />
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        onDragOver={onDragOver}
        nodeTypes={nodeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        fitView
        snapToGrid
        snapGrid={[15, 15]}
        className="bg-slate-50"
        connectionLineStyle={{ stroke: '#6366f1', strokeWidth: 2 }}
        proOptions={{ hideAttribution: true }}
      >
        <Background
          variant={BackgroundVariant.Dots}
          gap={20}
          size={1}
          color="#cbd5e1"
        />
        <MiniMap
          nodeColor={() => '#6366f1'}
          maskColor="rgb(240, 240, 245, 0.7)"
          className="!bg-white/80 !backdrop-blur-sm !rounded-xl !border !border-slate-200/60 !shadow-lg"
        />
        <CanvasControls />
      </ReactFlow>
    </div>
  );
}
