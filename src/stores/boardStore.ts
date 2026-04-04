import { create } from 'zustand';
import { v4 as uuidv4 } from 'uuid';

export interface Board {
  id: string;
  name: string;
  createdAt: string;
  updatedAt: string;
  starred: boolean;
  deleted: boolean;
  thumbnail: string;
}

interface BoardStore {
  boards: Board[];
  activeView: 'recent' | 'starred' | 'trash';
  setActiveView: (view: 'recent' | 'starred' | 'trash') => void;
  createBoard: (name?: string) => Board;
  deleteBoard: (id: string) => void;
  restoreBoard: (id: string) => void;
  permanentlyDeleteBoard: (id: string) => void;
  toggleStar: (id: string) => void;
  renameBoard: (id: string, name: string) => void;
}

const COLORS = [
  'from-violet-500 to-purple-600',
  'from-blue-500 to-cyan-600',
  'from-emerald-500 to-teal-600',
  'from-orange-500 to-amber-600',
  'from-pink-500 to-rose-600',
  'from-indigo-500 to-blue-600',
];

export const useBoardStore = create<BoardStore>((set) => ({
  boards: [
    {
      id: uuidv4(),
      name: 'Project Roadmap',
      createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
      updatedAt: new Date(Date.now() - 86400000).toISOString(),
      starred: true,
      deleted: false,
      thumbnail: COLORS[0],
    },
    {
      id: uuidv4(),
      name: 'Sprint Planning',
      createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
      starred: false,
      deleted: false,
      thumbnail: COLORS[1],
    },
    {
      id: uuidv4(),
      name: 'User Flow Diagram',
      createdAt: new Date(Date.now() - 86400000 * 10).toISOString(),
      updatedAt: new Date(Date.now() - 86400000 * 7).toISOString(),
      starred: true,
      deleted: false,
      thumbnail: COLORS[2],
    },
  ],
  activeView: 'recent',
  setActiveView: (view) => set({ activeView: view }),
  createBoard: (name) => {
    const newBoard: Board = {
      id: uuidv4(),
      name: name || 'Untitled Board',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      starred: false,
      deleted: false,
      thumbnail: COLORS[Math.floor(Math.random() * COLORS.length)],
    };
    set((state) => ({ boards: [newBoard, ...state.boards] }));
    return newBoard;
  },
  deleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id ? { ...b, deleted: true } : b
      ),
    })),
  restoreBoard: (id) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id ? { ...b, deleted: false } : b
      ),
    })),
  permanentlyDeleteBoard: (id) =>
    set((state) => ({
      boards: state.boards.filter((b) => b.id !== id),
    })),
  toggleStar: (id) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id ? { ...b, starred: !b.starred } : b
      ),
    })),
  renameBoard: (id, name) =>
    set((state) => ({
      boards: state.boards.map((b) =>
        b.id === id ? { ...b, name, updatedAt: new Date().toISOString() } : b
      ),
    })),
}));
