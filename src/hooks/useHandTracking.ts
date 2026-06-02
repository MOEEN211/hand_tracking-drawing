import { useEffect, useRef, useState } from 'react';

// Use the global MediaPipe objects from the script tags in index.html
declare global {
  interface Window {
    Hands: any;
    Camera: any;
    drawConnectors: any;
    drawLandmarks: any;
    HAND_CONNECTIONS: any;
  }
}

export type Results = any;

export interface HandTrackingOptions {
  maxNumHands?: number;
  modelComplexity?: number;
  minDetectionConfidence?: number;
  minTrackingConfidence?: number;
}

export const useHandTracking = (
  videoElement: HTMLVideoElement | null, 
  options: HandTrackingOptions = {}
) => {
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
      maxNumHands: options.maxNumHands ?? 1,
      modelComplexity: options.modelComplexity ?? 1,
      minDetectionConfidence: options.minDetectionConfidence ?? 0.7,
      minTrackingConfidence: options.minTrackingConfidence ?? 0.7,
    });

    hands.onResults((results: any) => {
      setResults(results);
    });

    const camera = new window.Camera(videoElement, {
      onFrame: async () => {
        // Optimization: only send frame if the window is visible
        if (document.visibilityState === 'visible') {
          await hands.send({ image: videoElement });
        }
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
  }, [videoElement, options.maxNumHands, options.minDetectionConfidence, options.minTrackingConfidence]);

  return results;
};
