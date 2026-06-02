import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, GripVertical } from 'lucide-react';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
  results: any;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ videoRef, isMuted, results }) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    if (!results || !canvasRef.current || !videoRef.current) return;

    const canvas = canvasRef.current;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Set canvas size to match video aspect ratio
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (results.multiHandLandmarks) {
      for (const landmarks of results.multiHandLandmarks) {
        // Draw connectors (bones)
        window.drawConnectors(ctx, landmarks, window.HAND_CONNECTIONS, {
          color: '#aa3bff',
          lineWidth: 4,
        });
        // Draw landmarks (joints)
        window.drawLandmarks(ctx, landmarks, {
          color: '#ffffff',
          lineWidth: 1,
          radius: 3,
        });
      }
    }
  }, [results]);

  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: window.innerWidth - 350, y: 20 }}
      className="fixed z-40 group"
    >
      <div className="relative glass-card overflow-hidden w-80 aspect-video flex items-center justify-center border-2 border-brand/30">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-black/20 rounded-full z-10">
          <GripVertical size={16} className="text-white" />
        </div>
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-contain mirror absolute inset-0 bg-zinc-950"
          style={{ transform: 'scaleX(-1)' }}
        />

        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain absolute inset-0 pointer-events-none"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {!videoRef.current && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400 bg-zinc-900/50 backdrop-blur-md">
            <CameraOff size={32} />
            <span className="text-xs">Camera loading...</span>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg z-10">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white font-medium uppercase tracking-wider">Live Feedback</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WebcamPreview;
