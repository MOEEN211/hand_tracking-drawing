export type Gesture = 'none' | 'pinch' | 'palm' | 'two-finger' | 'three-finger' | 'four-finger';

export const calculateDistance = (p1: any, p2: any) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export type GestureInfo = {
  type: Gesture;
  confidence: number; // 0 to 1
};

export const detectGesture = (landmarks: any[]): GestureInfo => {
  if (!landmarks || landmarks.length === 0) return { type: 'none', confidence: 0 };

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];
  
  const palmBase = landmarks[0];
  const middleBase = landmarks[9];

  const thumbIndexDist = calculateDistance(thumbTip, indexTip);
  const handSize = calculateDistance(palmBase, middleBase);
  const normalizedThumbIndexDist = thumbIndexDist / handSize;

  // Linear mapping for pinch confidence
  // If dist < 0.2, confidence is 1. If dist > 0.6, confidence is 0.
  const pinchConfidence = Math.max(0, Math.min(1, (0.6 - normalizedThumbIndexDist) / 0.4));

  if (normalizedThumbIndexDist < 0.3) {
    return { type: 'pinch', confidence: pinchConfidence };
  }

  // Check for other gestures...
  const isFingerExtended = (tip: any, pip: any) => tip.y < pip.y;
  const indexExtended = isFingerExtended(landmarks[8], landmarks[6]);
  const middleExtended = isFingerExtended(landmarks[12], landmarks[10]);
  const ringExtended = isFingerExtended(landmarks[16], landmarks[14]);
  const pinkyExtended = isFingerExtended(landmarks[20], landmarks[18]);

  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return { type: 'palm', confidence: 1 };
  }

  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return { type: 'two-finger', confidence: 1 };
  }

  return { type: 'none', confidence: 0 };
};
