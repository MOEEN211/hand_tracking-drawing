import { useEffect, useRef, useState } from 'react';

// Use the global MediaPipe objects from the script tags in index.html
declare global {
  interface Window {
    Hands: any;
    Camera: any;
  }
}

export type Results = any;

export interface HandPoint {
  x: number;
  y: number;
  z: number;
}

export interface HandData {
  landmarks: HandPoint[];
  handedness: 'Left' | 'Right';
}

export const useHandTracking = (videoElement: HTMLVideoElement | null) => {
  const [results, setResults] = useState<Results | null>(null);
  const handsRef = useRef<any>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!videoElement) return;

    // Check if MediaPipe is loaded
    if (!window.Hands || !window.Camera) {
      console.error('MediaPipe not loaded yet');
      return;
    }

    const hands = new window.Hands({
      locateFile: (file: string) => {
        return `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`;
      },
    });

    hands.setOptions({
      maxNumHands: 2,
      modelComplexity: 1,
      minDetectionConfidence: 0.5,
      minTrackingConfidence: 0.5,
    });

    hands.onResults((results: any) => {
      setResults(results);
    });

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        await hands.send({ image: videoElement });
      },
      width: 640,
      height: 480,
    });

    handsRef.current = hands;
    cameraRef.current = camera;

    camera.start();

    return () => {
      if (cameraRef.current) cameraRef.current.stop();
      if (handsRef.current) handsRef.current.close();
    };
  }, [videoElement]);

  return results;
};
