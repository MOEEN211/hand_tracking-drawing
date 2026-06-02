export class Point {
  constructor(public x: number, public y: number) {}
}

/**
 * Smooths points using a weighted moving average.
 * More weight is given to recent points to reduce lag while maintaining smoothness.
 */
export const smoothPoints = (points: Point[]): Point => {
  if (points.length === 0) return new Point(0, 0);
  if (points.length === 1) return points[0];
  
  // Take last 5 points for smoothing
  const windowSize = Math.min(points.length, 5);
  const window = points.slice(-windowSize);
  
  let totalX = 0;
  let totalY = 0;
  let totalWeight = 0;
  
  window.forEach((p, i) => {
    // Linear weight: more recent points have higher weight
    const weight = i + 1; 
    totalX += p.x * weight;
    totalY += p.y * weight;
    totalWeight += weight;
  });
  
  return new Point(totalX / totalWeight, totalY / totalWeight);
};
