import React, { useRef, useEffect, useState, useCallback } from 'react';
import { useHandTracking } from '../hooks/useHandTracking';
import { useCanvasDrawing, DrawingOptions } from '../hooks/useCanvasDrawing';
import { detectGesture, Gesture } from '../utils/gestures';
import { Point, smoothPoints } from '../utils/smoothing';
import Toolbar from './Toolbar';
import WebcamPreview from './WebcamPreview';
import ThemeToggle from './ThemeToggle';
import LayerManager from './LayerManager';
import { motion, AnimatePresence } from 'framer-motion';
import { jsPDF } from 'jspdf';

const Canvas: React.FC = () => {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const results = useHandTracking(videoRef.current);
  const { 
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
    canUndo, 
    canRedo 
  } = useCanvasDrawing();

  const [options, setOptions] = useState<DrawingOptions>({
    color: '#aa3bff',
    size: 5,
    opacity: 1,
    tool: 'pencil'
  });

  const [lastPoint, setLastPoint] = useState<Point | null>(null);
  const [pointsBuffer, setPointsBuffer] = useState<Point[]>([]);
  const [currentGesture, setCurrentGesture] = useState<Gesture>('none');
  const [isPaused, setIsPaused] = useState(false);
  const [gestureCooldown, setGestureCooldown] = useState(false);
  const [showColorPalette, setShowColorPalette] = useState(false);
  const [shapeStartPoint, setShapeStartPoint] = useState<Point | null>(null);

  // Initialize canvas on mount
  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      initCanvas(canvas);

      const handleResize = () => {
        const tempImageData = canvas.getContext('2d')?.getImageData(0, 0, canvas.width, canvas.height);
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        if (tempImageData) canvas.getContext('2d')?.putImageData(tempImageData, 0, 0);
      };

      window.addEventListener('resize', handleResize);
      return () => window.removeEventListener('resize', handleResize);
    }
  }, [initCanvas]);

  // Process Hand Tracking Results
  useEffect(() => {
    if (!results || !results.multiHandLandmarks || results.multiHandLandmarks.length === 0) {
      setLastPoint(null);
      setPointsBuffer([]);
      setCurrentGesture('none');
      return;
    }

    const landmarks = results.multiHandLandmarks[0];
    const gesture = detectGesture(landmarks);
    setCurrentGesture(gesture);

    // Index finger tip is landmark 8
    const indexTip = landmarks[8];
    const x = (1 - indexTip.x) * window.innerWidth; // Mirrored
    const y = indexTip.y * window.innerHeight;
    const currentPoint = new Point(x, y);

    if (gesture === 'palm') {
      setIsPaused(true);
      setLastPoint(null);
      return;
    }

    setIsPaused(false);

    if (gesture === 'pinch') {
      const newPoints = [...pointsBuffer, currentPoint];
      const smoothed = smoothPoints(newPoints);
      
      const isShapeTool = ['circle', 'rectangle', 'line'].includes(options.tool);

      if (isShapeTool) {
        if (!shapeStartPoint) {
          setShapeStartPoint(currentPoint);
        } else {
          // Draw preview
          drawShape(shapeStartPoint.x, shapeStartPoint.y, currentPoint.x, currentPoint.y, options, true);
        }
      } else {
        if (lastPoint) {
          draw(lastPoint.x, lastPoint.y, smoothed.x, smoothed.y, options);
        }
        setLastPoint(smoothed);
      }
      
      setPointsBuffer(newPoints.slice(-5)); // Keep small buffer for smoothing
    } else if (gesture === 'two-finger') {
        // Erase mode
        const eraseOptions = { ...options, tool: 'eraser' as const };
        if (lastPoint) {
            draw(lastPoint.x, lastPoint.y, x, y, eraseOptions);
        }
        setLastPoint(currentPoint);
    } else {
      if (lastPoint || shapeStartPoint) {
        saveToHistory();
      }
      setLastPoint(null);
      setShapeStartPoint(null);
      setPointsBuffer([]);
    }

    // Special gestures for actions
    if (!gestureCooldown) {
      if (gesture === 'three-finger') {
        setShowColorPalette(prev => !prev);
        setGestureCooldown(true);
        setTimeout(() => setGestureCooldown(false), 1000);
      } else if (gesture === 'four-finger') {
        if (confirm('Clear canvas?')) {
          clear();
        }
        setGestureCooldown(true);
        setTimeout(() => setGestureCooldown(false), 2000);
      }
    }
  }, [results, options, lastPoint, pointsBuffer, draw, drawShape, saveToHistory, gestureCooldown, clear, shapeStartPoint]);

  const handleSave = (format: 'png' | 'pdf') => {
    const canvas = canvasRef.current;
    if (canvas) {
      if (format === 'png') {
        const link = document.createElement('a');
        link.download = 'hand-draw-studio.png';
        link.href = canvas.toDataURL();
        link.click();
      } else if (format === 'pdf') {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new jsPDF({
          orientation: canvas.width > canvas.height ? 'landscape' : 'portrait',
          unit: 'px',
          format: [canvas.width, canvas.height]
        });
        pdf.addImage(imgData, 'PNG', 0, 0, canvas.width, canvas.height);
        pdf.save('hand-draw-studio.pdf');
      }
    }
  };

  return (
    <div className="relative w-full h-full overflow-hidden bg-zinc-50 dark:bg-zinc-950">
      {/* Background patterns */}
      <div className="absolute inset-0 opacity-20 dark:opacity-10 pointer-events-none">
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(#000 1px, transparent 1px)', backgroundSize: '40px 40px' }} />
      </div>

      <canvas
        ref={canvasRef}
        className="absolute inset-0 z-10 touch-none"
      />

      <Toolbar
        options={options}
        setOptions={setOptions}
        onUndo={undo}
        onRedo={redo}
        onClear={clear}
        onSave={handleSave}
        canUndo={canUndo}
        canRedo={canRedo}
      />

      <WebcamPreview videoRef={videoRef} isMuted={true} />
      
      <LayerManager
        layers={layers}
        activeLayerId={activeLayerId}
        onSetActive={setActiveLayerId}
        onAdd={addLayer}
        onRemove={removeLayer}
        onToggleVisibility={toggleLayerVisibility}
      />
      
      <ThemeToggle />

      {/* Quick Color Palette */}
      <AnimatePresence>
        {showColorPalette && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="fixed bottom-24 left-6 glass p-4 rounded-3xl z-50 grid grid-cols-4 gap-2"
          >
            {['#aa3bff', '#ef4444', '#22c55e', '#3b82f6', '#eab308', '#ec4899', '#f97316', '#06b6d4'].map((color) => (
              <button
                key={color}
                onClick={() => {
                  setOptions({ ...options, color });
                  setShowColorPalette(false);
                }}
                className="w-8 h-8 rounded-full border-2 border-white/20 hover:scale-110 transition-transform"
                style={{ backgroundColor: color }}
              />
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Gesture Indicator */}
      <div className="fixed bottom-6 left-1/2 -translate-x-1/2 glass px-6 py-3 rounded-2xl z-50 flex items-center gap-4">
        <div className="flex items-center gap-2">
          <div className={`w-3 h-3 rounded-full ${currentGesture !== 'none' ? 'bg-green-500' : 'bg-zinc-300 dark:bg-zinc-700'}`} />
          <span className="text-sm font-medium capitalize text-zinc-600 dark:text-zinc-400">
            {currentGesture === 'none' ? 'No Hand Detected' : `Gesture: ${currentGesture}`}
          </span>
        </div>
        <div className="h-4 w-px bg-zinc-200 dark:bg-zinc-800" />
        <span className="text-xs text-zinc-400 font-mono">
          {isPaused ? 'PAUSED' : 'ACTIVE'}
        </span>
      </div>

      {/* Instructions Overlay */}
      <AnimatePresence>
        {currentGesture === 'none' && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-24 left-1/2 -translate-x-1/2 glass-card px-8 py-4 z-40 text-center"
          >
            <h3 className="text-lg font-bold mb-2">How to Draw</h3>
            <div className="grid grid-cols-2 gap-4 text-sm text-zinc-500">
              <div className="flex flex-col items-center">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Pinch</span>
                <span>Draw / Paint</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Open Palm</span>
                <span>Pause Tracking</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">2 Fingers</span>
                <span>Quick Erase</span>
              </div>
              <div className="flex flex-col items-center">
                <span className="font-bold text-zinc-900 dark:text-zinc-100">Index Tip</span>
                <span>Cursor</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Visual Feedback for cursor */}
      {results?.multiHandLandmarks?.[0] && !isPaused && (
        <div 
          className="fixed pointer-events-none z-50 w-6 h-6 border-2 border-white rounded-full mix-blend-difference"
          style={{
            left: (1 - results.multiHandLandmarks[0][8].x) * window.innerWidth - 12,
            top: results.multiHandLandmarks[0][8].y * window.innerHeight - 12,
            backgroundColor: currentGesture === 'pinch' ? options.color : 'transparent',
            boxShadow: '0 0 10px rgba(255,255,255,0.5)'
          }}
        />
      )}
    </div>
  );
};

export default Canvas;
