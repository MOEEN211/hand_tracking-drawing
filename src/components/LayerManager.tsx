import React from 'react';
import { Layers, Plus, Trash2, Eye, EyeOff } from 'lucide-react';
import { Layer } from '../hooks/useCanvasDrawing';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface LayerManagerProps {
  layers: Layer[];
  activeLayerId: string;
  onSetActive: (id: string) => void;
  onAdd: () => void;
  onRemove: (id: string) => void;
  onToggleVisibility: (id: string) => void;
}

const LayerManager: React.FC<LayerManagerProps> = ({
  layers,
  activeLayerId,
  onSetActive,
  onAdd,
  onRemove,
  onToggleVisibility,
}) => {
  return (
    <div className="fixed right-6 top-24 w-64 glass rounded-3xl p-4 z-50 flex flex-col gap-4">
      <div className="flex items-center justify-between px-2">
        <div className="flex items-center gap-2 text-zinc-600 dark:text-zinc-400">
          <Layers size={18} />
          <span className="text-sm font-bold uppercase tracking-wider">Layers</span>
        </div>
        <button
          onClick={onAdd}
          className="p-1.5 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 transition-colors"
          title="Add Layer"
        >
          <Plus size={18} />
        </button>
      </div>

      <div className="flex flex-col gap-2 overflow-y-auto max-h-[40vh] pr-1">
        {[...layers].reverse().map((layer) => (
          <div
            key={layer.id}
            onClick={() => onSetActive(layer.id)}
            className={cn(
              "group flex items-center justify-between p-3 rounded-2xl transition-all cursor-pointer",
              activeLayerId === layer.id
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 shadow-lg scale-[1.02]"
                : "bg-white/50 dark:bg-zinc-800/50 hover:bg-zinc-200 dark:hover:bg-zinc-700 text-zinc-600 dark:text-zinc-400"
            )}
          >
            <div className="flex items-center gap-3">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onToggleVisibility(layer.id);
                }}
                className={cn(
                  "p-1 rounded-md transition-colors",
                  activeLayerId === layer.id
                    ? "hover:bg-white/20 text-white dark:text-zinc-900"
                    : "hover:bg-zinc-300 dark:hover:bg-zinc-600"
                )}
              >
                {layer.visible ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <span className="text-xs font-medium truncate w-24">{layer.name}</span>
            </div>

            {layers.length > 1 && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onRemove(layer.id);
                }}
                className={cn(
                  "p-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity",
                  activeLayerId === layer.id
                    ? "hover:bg-red-500/20 text-red-400"
                    : "hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
                )}
              >
                <Trash2 size={14} />
              </button>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

export default LayerManager;
