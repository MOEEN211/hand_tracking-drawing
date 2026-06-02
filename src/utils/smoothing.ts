/**
 * OneEuroFilter implementation for smoothing noisy signals in real-time.
 * Perfect for hand tracking cursor stabilization.
 */
export class OneEuroFilter {
  private lastTime: number | null = null;
  private xPrev: number | null = null;
  private dxPrev: number = 0;

  constructor(
    private minCutoff: number = 1.0,
    private beta: number = 0.007,
    private dCutoff: number = 1.0
  ) {}

  private alpha(cutoff: number, dt: number): number {
    const tau = 1.0 / (2 * Math.PI * cutoff);
    return 1.0 / (1.0 + tau / dt);
  }

  public filter(value: number, timestamp: number = Date.now()): number {
    if (this.lastTime === null || this.xPrev === null) {
      this.lastTime = timestamp;
      this.xPrev = value;
      return value;
    }

    const dt = (timestamp - this.lastTime) / 1000.0;
    if (dt <= 0) return this.xPrev;

    const aD = this.alpha(this.dCutoff, dt);
    const dx = (value - this.xPrev) / dt;
    const dxHat = aD * dx + (1 - aD) * this.dxPrev;

    const cutoff = this.minCutoff + this.beta * Math.abs(dxHat);
    const a = this.alpha(cutoff, dt);
    const xHat = a * value + (1 - a) * this.xPrev;

    this.lastTime = timestamp;
    this.xPrev = xHat;
    this.dxPrev = dxHat;

    return xHat;
  }
}

export class Point {
  constructor(public x: number, public y: number) {}
}

export const smoothPoints = (points: Point[]): Point => {
  if (points.length === 0) return new Point(0, 0);
  return points[points.length - 1]; // We will use OneEuroFilter instead of this
};
