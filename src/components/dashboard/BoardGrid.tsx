'use client';

import { useTranslations } from 'next-intl';
import { useRouter } from 'next/navigation';
import { Star, Trash2, RotateCcw, MoreHorizontal, Plus } from 'lucide-react';
import { useBoardStore, type Board } from '@/stores/boardStore';
import { useCanvasStore } from '@/stores/canvasStore';
import { useState, useRef, useEffect } from 'react';

function BoardCard({ board }: { board: Board }) {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const { deleteBoard, restoreBoard, permanentlyDeleteBoard, toggleStar } = useBoardStore();
  const setBoardName = useCanvasStore((s) => s.setBoardName);
  const resetCanvas = useCanvasStore((s) => s.resetCanvas);
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (menuRef.current && !menuRef.current.contains(event.target as HTMLElement)) {
        setMenuOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleOpenBoard = () => {
    if (board.deleted) return;
    resetCanvas();
    setBoardName(board.name);
    router.push(`/board/${board.id}`);
  };

  const formattedDate = new Date(board.createdAt).toLocaleDateString(undefined, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  return (
    <div className="group relative bg-white rounded-2xl border border-slate-200 hover:border-indigo-300 hover:shadow-xl transition-all duration-300">
      <div
        onClick={handleOpenBoard}
        className={`h-40 bg-gradient-to-br ${board.thumbnail} flex items-center justify-center cursor-pointer relative overflow-hidden rounded-t-2xl`}
      >
        <div className="absolute inset-0 bg-black/0 group-hover:bg-black/5 transition-colors duration-300" />
        <div className="grid grid-cols-3 gap-2 p-6 opacity-30">
          {Array.from({ length: 6 }).map((_, i) => (
            <div key={i} className="w-8 h-6 bg-white/40 rounded" />
          ))}
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-slate-800 truncate">{board.name}</h3>
            <p className="text-xs text-slate-400 mt-1">
              {t('boardCreated')} {formattedDate}
            </p>
          </div>
          <div className="relative" ref={menuRef}>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setMenuOpen(!menuOpen);
              }}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors opacity-0 group-hover:opacity-100"
            >
              <MoreHorizontal className="w-4 h-4" />
            </button>

            {menuOpen && (
              <div className="absolute right-0 mt-1 w-44 bg-white rounded-xl shadow-2xl border border-slate-200 py-1.5 z-30">
                {board.deleted ? (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        restoreBoard(board.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      {t('restoreBoard')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        permanentlyDeleteBoard(board.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('deletePermanently')}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleStar(board.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
                    >
                      <Star className={`w-3.5 h-3.5 ${board.starred ? 'fill-amber-400 text-amber-400' : ''}`} />
                      {board.starred ? t('unstar') : t('star')}
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        deleteBoard(board.id);
                        setMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      {t('deleteConfirm')}
                    </button>
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {!board.deleted && board.starred && (
        <div className="absolute top-3 right-3">
          <Star className="w-4 h-4 fill-amber-400 text-amber-400 drop-shadow-sm" />
        </div>
      )}
    </div>
  );
}

export function BoardGrid() {
  const t = useTranslations('dashboard');
  const router = useRouter();
  const boards = useBoardStore((s) => s.boards);
  const activeView = useBoardStore((s) => s.activeView);
  const createBoard = useBoardStore((s) => s.createBoard);
  const resetCanvas = useCanvasStore((s) => s.resetCanvas);
  const setBoardName = useCanvasStore((s) => s.setBoardName);

  const filteredBoards = boards.filter((board) => {
    switch (activeView) {
      case 'recent':
        return !board.deleted;
      case 'starred':
        return board.starred && !board.deleted;
      case 'trash':
        return board.deleted;
      default:
        return !board.deleted;
    }
  });

  const handleCreateBoard = () => {
    const newBoard = createBoard();
    resetCanvas();
    setBoardName(newBoard.name);
    router.push(`/board/${newBoard.id}`);
  };

  const emptyMessage = {
    recent: t('noBoards'),
    starred: t('noStarred'),
    trash: t('noTrash'),
  }[activeView];

  return (
    <div className="flex-1 p-8 overflow-y-auto">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">{t('myBoards')}</h1>
            <p className="text-sm text-slate-500 mt-1">{t('title')}</p>
          </div>
          {activeView !== 'trash' && (
            <button
              onClick={handleCreateBoard}
              className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white text-sm font-medium rounded-xl hover:from-indigo-700 hover:to-violet-700 transition-all duration-200 shadow-lg shadow-indigo-200 hover:shadow-xl hover:shadow-indigo-300 active:scale-95"
            >
              <Plus className="w-4 h-4" />
              {t('createBoard')}
            </button>
          )}
        </div>

        {filteredBoards.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-20 h-20 rounded-2xl bg-slate-100 flex items-center justify-center mb-4">
              <Layout className="w-10 h-10 text-slate-300" />
            </div>
            <p className="text-slate-500 text-sm">{emptyMessage}</p>
            {activeView === 'recent' && (
              <button
                onClick={handleCreateBoard}
                className="mt-4 flex items-center gap-2 px-4 py-2 text-sm font-medium text-indigo-600 bg-indigo-50 rounded-xl hover:bg-indigo-100 transition-colors"
              >
                <Plus className="w-4 h-4" />
                {t('createBoard')}
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
            {activeView !== 'trash' && (
              <button
                onClick={handleCreateBoard}
                className="h-full min-h-[220px] rounded-2xl border-2 border-dashed border-slate-300 hover:border-indigo-400 flex flex-col items-center justify-center gap-3 transition-all duration-300 hover:bg-indigo-50/50 group"
              >
                <div className="w-12 h-12 rounded-xl bg-slate-100 group-hover:bg-indigo-100 flex items-center justify-center transition-colors">
                  <Plus className="w-6 h-6 text-slate-400 group-hover:text-indigo-600 transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-500 group-hover:text-indigo-600 transition-colors">
                  {t('createBoard')}
                </span>
              </button>
            )}
            {filteredBoards.map((board) => (
              <BoardCard key={board.id} board={board} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function Layout(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      {...props}
    >
      <rect width="18" height="18" x="3" y="3" rx="2" ry="2" />
      <line x1="3" x2="21" y1="9" y2="9" />
      <line x1="9" x2="9" y1="21" y2="9" />
    </svg>
  );
}
