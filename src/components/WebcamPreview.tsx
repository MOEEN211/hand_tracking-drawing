import React, { useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Camera, CameraOff, GripVertical } from 'lucide-react';

interface WebcamPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement | null>;
  isMuted: boolean;
}

const WebcamPreview: React.FC<WebcamPreviewProps> = ({ videoRef, isMuted }) => {
  return (
    <motion.div
      drag
      dragMomentum={false}
      initial={{ x: window.innerWidth - 300, y: 20 }}
      className="fixed z-40 group"
    >
      <div className="relative glass-card overflow-hidden w-64 aspect-video flex items-center justify-center">
        <div className="absolute top-2 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity cursor-grab active:cursor-grabbing p-1 bg-black/20 rounded-full">
          <GripVertical size={16} className="text-white" />
        </div>
        
        <video
          ref={videoRef}
          autoPlay
          playsInline
          muted={isMuted}
          className="w-full h-full object-cover mirror"
          style={{ transform: 'scaleX(-1)' }}
        />
        
        {!videoRef.current && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 text-zinc-400">
            <CameraOff size={32} />
            <span className="text-xs">Camera loading...</span>
          </div>
        )}
        
        <div className="absolute bottom-2 left-2 flex items-center gap-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-white font-medium uppercase tracking-wider">Live Tracking</span>
        </div>
      </div>
    </motion.div>
  );
};

export default WebcamPreview;
