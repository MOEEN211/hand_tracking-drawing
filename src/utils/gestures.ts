export type Gesture = 'none' | 'pinch' | 'palm' | 'two-finger' | 'three-finger' | 'four-finger';

export const calculateDistance = (p1: any, p2: any) => {
  return Math.sqrt(Math.pow(p1.x - p2.x, 2) + Math.pow(p1.y - p2.y, 2));
};

export const detectGesture = (landmarks: any[]): Gesture => {
  if (!landmarks || landmarks.length === 0) return 'none';

  const thumbTip = landmarks[4];
  const indexTip = landmarks[8];
  const middleTip = landmarks[12];
  const ringTip = landmarks[16];
  const pinkyTip = landmarks[20];

  const thumbIndexDist = calculateDistance(thumbTip, indexTip);
  const indexMiddleDist = calculateDistance(indexTip, middleTip);
  const middleRingDist = calculateDistance(middleTip, ringTip);
  const ringPinkyDist = calculateDistance(ringTip, pinkyTip);

  // Pinch: Thumb and Index tips are close
  if (thumbIndexDist < 0.05) {
    return 'pinch';
  }

  // Open Palm: All fingers are extended (checking distances from palm base is better but simple check here)
  const isFingerExtended = (tip: any, pip: any) => tip.y < pip.y; // Simplified
  
  const indexExtended = isFingerExtended(landmarks[8], landmarks[6]);
  const middleExtended = isFingerExtended(landmarks[12], landmarks[10]);
  const ringExtended = isFingerExtended(landmarks[16], landmarks[14]);
  const pinkyExtended = isFingerExtended(landmarks[20], landmarks[18]);

  if (indexExtended && middleExtended && ringExtended && pinkyExtended) {
    return 'palm';
  }

  // Four fingers extended
  if (indexExtended && middleExtended && ringExtended && pinkyExtended && !isFingerExtended(landmarks[4], landmarks[2])) {
     // Wait, thumb is 4. If index, middle, ring, pinky are extended.
     return 'four-finger';
  }

  // Three fingers extended
  if (indexExtended && middleExtended && ringExtended && !pinkyExtended) {
    return 'three-finger';
  }

  // Two fingers extended
  if (indexExtended && middleExtended && !ringExtended && !pinkyExtended) {
    return 'two-finger';
  }

  return 'none';
};
