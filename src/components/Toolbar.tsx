import React from 'react';
import { 
  Pencil, 
  Eraser, 
  Paintbrush, 
  Highlighter, 
  Type, 
  Undo2, 
  Redo2, 
  Trash2, 
  Download, 
  Maximize2,
  Settings2,
  Square,
  Circle as CircleIcon,
  Minus,
  FileText,
  Image as ImageIcon
} from 'lucide-react';
import { Tool, DrawingOptions } from '../hooks/useCanvasDrawing';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface ToolbarProps {
  options: DrawingOptions;
  setOptions: (options: DrawingOptions) => void;
  onUndo: () => void;
  onRedo: () => void;
  onClear: () => void;
  onSave: (format: 'png' | 'pdf') => void;
  canUndo: boolean;
  canRedo: boolean;
}

const Toolbar: React.FC<ToolbarProps> = ({
  options,
  setOptions,
  onUndo,
  onRedo,
  onClear,
  onSave,
  canUndo,
  canRedo,
}) => {
  const tools: { id: Tool; icon: any; label: string }[] = [
    { id: 'pencil', icon: Pencil, label: 'Pencil' },
    { id: 'brush', icon: Paintbrush, label: 'Brush' },
    { id: 'marker', icon: Type, label: 'Marker' },
    { id: 'highlighter', icon: Highlighter, label: 'Highlighter' },
    { id: 'eraser', icon: Eraser, label: 'Eraser' },
    { id: 'circle', icon: CircleIcon, label: 'Circle' },
    { id: 'rectangle', icon: Square, label: 'Rectangle' },
    { id: 'line', icon: Minus, label: 'Line' },
  ];

  return (
    <div className="fixed left-6 top-1/2 -translate-y-1/2 flex flex-col gap-4 p-4 glass rounded-3xl z-50">
      <div className="flex flex-col gap-2">
        {tools.map((tool) => (
          <button
            key={tool.id}
            onClick={() => setOptions({ ...options, tool: tool.id })}
            className={cn(
              "p-3 rounded-2xl transition-all duration-200 group relative",
              options.tool === tool.id 
                ? "bg-zinc-900 text-white dark:bg-white dark:text-zinc-900" 
                : "hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
            )}
            title={tool.label}
          >
            <tool.icon size={20} />
            <span className="absolute left-full ml-4 px-2 py-1 bg-zinc-800 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
              {tool.label}
            </span>
          </button>
        ))}
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

      <div className="flex flex-col gap-4 items-center">
        <input
          type="color"
          value={options.color}
          onChange={(e) => setOptions({ ...options, color: e.target.value })}
          className="w-10 h-10 rounded-full cursor-pointer overflow-hidden border-none"
        />
        
        <div className="flex flex-col gap-1 items-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Size</span>
          <input
            type="range"
            min="1"
            max="50"
            value={options.size}
            onChange={(e) => setOptions({ ...options, size: parseInt(e.target.value) })}
            className="w-24 -rotate-90 origin-center my-8 accent-zinc-900 dark:accent-zinc-100"
          />
        </div>

        <div className="flex flex-col gap-1 items-center">
          <span className="text-[10px] font-bold text-zinc-500 uppercase">Alpha</span>
          <input
            type="range"
            min="0"
            max="1"
            step="0.1"
            value={options.opacity}
            onChange={(e) => setOptions({ ...options, opacity: parseFloat(e.target.value) })}
            className="w-24 -rotate-90 origin-center my-8 accent-zinc-900 dark:accent-zinc-100"
          />
        </div>
      </div>

      <div className="h-px bg-zinc-200 dark:bg-zinc-800 my-2" />

      <div className="flex flex-col gap-2">
        <button
          onClick={onUndo}
          disabled={!canUndo}
          className="p-3 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30"
          title="Undo"
        >
          <Undo2 size={20} />
        </button>
        <button
          onClick={onRedo}
          disabled={!canRedo}
          className="p-3 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 disabled:opacity-30"
          title="Redo"
        >
          <Redo2 size={20} />
        </button>
        <button
          onClick={onClear}
          className="p-3 rounded-2xl hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500"
          title="Clear Canvas"
        >
          <Trash2 size={20} />
        </button>
        <button
          onClick={() => onSave('png')}
          className="p-3 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          title="Save as PNG"
        >
          <ImageIcon size={20} />
        </button>
        <button
          onClick={() => onSave('pdf')}
          className="p-3 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          title="Save as PDF"
        >
          <FileText size={20} />
        </button>
        <button
          onClick={() => {
            if (!document.fullscreenElement) {
              document.documentElement.requestFullscreen();
            } else {
              document.exitFullscreen();
            }
          }}
          className="p-3 rounded-2xl hover:bg-zinc-200 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400"
          title="Toggle Fullscreen"
        >
          <Maximize2 size={20} />
        </button>
      </div>
    </div>
  );
};

export default Toolbar;
