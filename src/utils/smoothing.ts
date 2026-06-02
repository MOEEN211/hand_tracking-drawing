export class Point {
  constructor(public x: number, public y: number) {}
}

export const smoothPoints = (points: Point[]): Point => {
  if (points.length < 3) return points[points.length - 1];
  
  const last = points[points.length - 1];
  const prev = points[points.length - 2];
  const pprev = points[points.length - 3];
  
  // Exponential Moving Average
  const alpha = 0.3;
  const smoothedX = alpha * last.x + (1 - alpha) * prev.x;
  const smoothedY = alpha * last.y + (1 - alpha) * prev.y;
  
  return new Point(smoothedX, smoothedY);
};
