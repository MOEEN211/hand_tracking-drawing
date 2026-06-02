import { useRef, useCallback, useState } from 'react';

export type Tool = 'pencil' | 'brush' | 'marker' | 'eraser' | 'highlighter' | 'circle' | 'rectangle' | 'line';

export interface DrawingOptions {
  color: string;
  size: number;
  opacity: number;
  tool: Tool;
}

export const useCanvasDrawing = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);

  const initCanvas = useCallback((canvas: HTMLCanvasElement) => {
    canvasRef.current = canvas;
    const ctx = canvas.getContext('2d', { willReadFrequently: true });
    if (ctx) {
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      contextRef.current = ctx;
      
      // Initial background
      ctx.fillStyle = 'transparent';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      saveToHistory();
    }
  }, []);

  const saveToHistory = useCallback(() => {
    if (!canvasRef.current || !contextRef.current) return;
    const imageData = contextRef.current.getImageData(0, 0, canvasRef.current.width, canvasRef.current.height);
    setHistory(prev => {
      const newHistory = prev.slice(0, historyStep + 1);
      return [...newHistory, imageData].slice(-20); // Keep last 20 steps
    });
    setHistoryStep(prev => Math.min(prev + 1, 19));
  }, [historyStep]);

  const undo = useCallback(() => {
    if (historyStep > 0 && contextRef.current && canvasRef.current) {
      const newStep = historyStep - 1;
      contextRef.current.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  }, [history, historyStep]);

  const redo = useCallback(() => {
    if (historyStep < history.length - 1 && contextRef.current && canvasRef.current) {
      const newStep = historyStep + 1;
      contextRef.current.putImageData(history[newStep], 0, 0);
      setHistoryStep(newStep);
    }
  }, [history, historyStep]);

  const clear = useCallback(() => {
    if (contextRef.current && canvasRef.current) {
      contextRef.current.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
      saveToHistory();
    }
  }, [saveToHistory]);

  const draw = useCallback((
    fromX: number, 
    fromY: number, 
    toX: number, 
    toY: number, 
    options: DrawingOptions
  ) => {
    const ctx = contextRef.current;
    if (!ctx) return;

    ctx.beginPath();
    ctx.moveTo(fromX, fromY);
    ctx.lineTo(toX, toY);

    ctx.globalAlpha = options.opacity;
    
    if (options.tool === 'eraser') {
      ctx.globalCompositeOperation = 'destination-out';
      ctx.lineWidth = options.size * 2;
    } else {
      ctx.globalCompositeOperation = 'source-over';
      ctx.strokeStyle = options.color;
      
      switch (options.tool) {
        case 'pencil':
          ctx.lineWidth = options.size;
          break;
        case 'brush':
          ctx.lineWidth = options.size * 2;
          ctx.shadowBlur = options.size / 2;
          ctx.shadowColor = options.color;
          break;
        case 'marker':
          ctx.lineWidth = options.size * 1.5;
          ctx.lineCap = 'square';
          break;
        case 'highlighter':
          ctx.lineWidth = options.size * 3;
          ctx.globalAlpha = options.opacity * 0.3;
          break;
      }
    }

    ctx.stroke();
    ctx.shadowBlur = 0; // Reset shadow
  }, []);

  const drawShape = useCallback((
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    options: DrawingOptions,
    isPreview: boolean = false
  ) => {
    if (!contextRef.current || !canvasRef.current) return;
    const ctx = contextRef.current;

    if (isPreview) {
      // Clear for preview (we need a way to restore the previous state)
      // For simplicity in this hand-tracking context, we might use a separate preview layer
      // or just redraw the previous history step before drawing the shape
      ctx.putImageData(history[historyStep], 0, 0);
    }

    ctx.beginPath();
    ctx.globalAlpha = options.opacity;
    ctx.strokeStyle = options.color;
    ctx.lineWidth = options.size;
    ctx.globalCompositeOperation = 'source-over';

    switch (options.tool) {
      case 'circle':
        const radius = Math.sqrt(Math.pow(endX - startX, 2) + Math.pow(endY - startY, 2));
        ctx.arc(startX, startY, radius, 0, 2 * Math.PI);
        break;
      case 'rectangle':
        ctx.rect(startX, startY, endX - startX, endY - startY);
        break;
      case 'line':
        ctx.moveTo(startX, startY);
        ctx.lineTo(endX, endY);
        break;
    }

    ctx.stroke();
  }, [history, historyStep]);

  return {
    canvasRef,
    initCanvas,
    draw,
    drawShape,
    undo,
    redo,
    clear,
    saveToHistory,
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1
  };
};
