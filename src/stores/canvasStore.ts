import { create } from 'zustand';
import {
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  type Connection,
  MarkerType,
} from '@xyflow/react';
import { v4 as uuidv4 } from 'uuid';

export type ShapeType = 'rectangle' | 'circle' | 'text';

interface CanvasStore {
  nodes: Node[];
  edges: Edge[];
  boardName: string;
  setBoardName: (name: string) => void;
  onNodesChange: OnNodesChange;
  onEdgesChange: OnEdgesChange;
  onConnect: OnConnect;
  addNode: (type: ShapeType, position?: { x: number; y: number }) => void;
  resetCanvas: () => void;
}

export const useCanvasStore = create<CanvasStore>((set) => ({
  nodes: [],
  edges: [],
  boardName: 'Untitled Board',
  setBoardName: (name) => set({ boardName: name }),
  onNodesChange: (changes) => {
    set((state) => ({
      nodes: applyNodeChanges(changes, state.nodes),
    }));
  },
  onEdgesChange: (changes) => {
    set((state) => ({
      edges: applyEdgeChanges(changes, state.edges),
    }));
  },
  onConnect: (connection: Connection) => {
    set((state) => ({
      edges: addEdge(
        {
          ...connection,
          type: 'smoothstep',
          animated: true,
          markerEnd: { type: MarkerType.ArrowClosed, color: '#6366f1' },
          style: { stroke: '#6366f1', strokeWidth: 2 },
        },
        state.edges
      ),
    }));
  },
  addNode: (type, position) => {
    const id = uuidv4();
    const pos = position || {
      x: Math.random() * 400 + 100,
      y: Math.random() * 300 + 100,
    };

    const nodeBase = {
      id,
      position: pos,
      draggable: true,
    };

    let newNode: Node;

    switch (type) {
      case 'rectangle':
        newNode = {
          ...nodeBase,
          type: 'rectangleNode',
          data: { label: 'Rectangle' },
        };
        break;
      case 'circle':
        newNode = {
          ...nodeBase,
          type: 'circleNode',
          data: { label: 'Circle' },
        };
        break;
      case 'text':
        newNode = {
          ...nodeBase,
          type: 'textNode',
          data: { label: 'Double click to edit' },
        };
        break;
      default:
        newNode = {
          ...nodeBase,
          type: 'rectangleNode',
          data: { label: 'Shape' },
        };
    }

    set((state) => ({
      nodes: [...state.nodes, newNode],
    }));
  },
  resetCanvas: () => set({ nodes: [], edges: [], boardName: 'Untitled Board' }),
}));
