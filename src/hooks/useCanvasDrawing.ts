import { useRef, useCallback, useState } from 'react';
import type { Tool, DrawingOptions, Layer } from '../types/drawing';

export const useCanvasDrawing = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const contextRef = useRef<CanvasRenderingContext2D | null>(null);
  const [history, setHistory] = useState<ImageData[]>([]);
  const [historyStep, setHistoryStep] = useState(-1);
  const [layers, setLayers] = useState<Layer[]>([
    { id: '1', name: 'Background', visible: true, opacity: 1 }
  ]);
  const [activeLayerId, setActiveLayerId] = useState('1');

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

  const addLayer = useCallback(() => {
    const newId = Math.random().toString(36).substr(2, 9);
    setLayers(prev => [...prev, { id: newId, name: `Layer ${prev.length + 1}`, visible: true, opacity: 1 }]);
    setActiveLayerId(newId);
  }, []);

  const removeLayer = useCallback((id: string) => {
    if (layers.length > 1) {
      setLayers(prev => prev.filter(l => l.id !== id));
      if (activeLayerId === id) {
        setActiveLayerId(layers[0].id);
      }
    }
  }, [activeLayerId, layers]);

  const toggleLayerVisibility = useCallback((id: string) => {
    setLayers(prev => prev.map(l => l.id === id ? { ...l, visible: !l.visible } : l));
  }, []);

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
    layers,
    activeLayerId,
    setActiveLayerId,
    addLayer,
    removeLayer,
    toggleLayerVisibility,
    canUndo: historyStep > 0,
    canRedo: historyStep < history.length - 1
  };
};
