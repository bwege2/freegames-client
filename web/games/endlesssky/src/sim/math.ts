// Point and Angle, as the reference release (source/Point.cpp, Angle.cpp).
// Angles are clock angles in degrees (0 is up, increasing clockwise) and are
// quantized to 1/65536 turn, so trajectories reproduce the original's steps.

export class Point {
  x: number;
  y: number;

  constructor(x = 0, y = 0) {
    this.x = x;
    this.y = y;
  }

  add(other: Point): Point { return new Point(this.x + other.x, this.y + other.y); }
  sub(other: Point): Point { return new Point(this.x - other.x, this.y - other.y); }
  mul(scalar: number): Point { return new Point(this.x * scalar, this.y * scalar); }
  div(scalar: number): Point { return new Point(this.x / scalar, this.y / scalar); }
  neg(): Point { return new Point(-this.x, -this.y); }
  iadd(other: Point): void { this.x += other.x; this.y += other.y; }
  imul(scalar: number): void { this.x *= scalar; this.y *= scalar; }

  dot(other: Point): number { return this.x * other.x + this.y * other.y; }
  cross(other: Point): number { return this.x * other.y - this.y * other.x; }
  length(): number { return Math.hypot(this.x, this.y); }
  lengthSquared(): number { return this.x * this.x + this.y * this.y; }
  unit(): Point {
    const length = this.length();
    return length ? new Point(this.x / length, this.y / length) : new Point(1, 0);
  }
  distance(other: Point): number { return Math.hypot(this.x - other.x, this.y - other.y); }
  distanceSquared(other: Point): number {
    const dx = this.x - other.x;
    const dy = this.y - other.y;
    return dx * dx + dy * dy;
  }
  lerp(to: Point, c: number): Point { return new Point(this.x + (to.x - this.x) * c, this.y + (to.y - this.y) * c); }
  isZero(): boolean { return this.x === 0 && this.y === 0; }
}

const STEPS = 0x10000;
const MASK = STEPS - 1;
const DEG_TO_STEP = STEPS / 360;
const STEP_TO_RAD = Math.PI / (STEPS / 2);

// One table of unit vectors, like Angle.cpp's 1 MB cache.
const UNIT = new Float64Array(STEPS * 2);
for (let i = 0; i < STEPS; ++i) {
  const radians = i * STEP_TO_RAD;
  UNIT[2 * i] = Math.sin(radians);
  UNIT[2 * i + 1] = -Math.cos(radians);
}

export class Angle {
  /** quantized steps, 0..65535 */
  steps: number;

  constructor(degrees = 0) {
    this.steps = Math.round(degrees * DEG_TO_STEP) & MASK;
  }

  static fromSteps(steps: number): Angle {
    const angle = new Angle(0);
    angle.steps = steps & MASK;
    return angle;
  }

  /** Angle pointing in the direction of a vector (Angle(const Point &)). */
  static fromPoint(point: Point): Angle {
    return new Angle((180 / Math.PI) * Math.atan2(point.x, -point.y));
  }

  add(other: Angle): Angle { return Angle.fromSteps(this.steps + other.steps); }
  sub(other: Angle): Angle { return Angle.fromSteps(this.steps - other.steps); }
  iaddDegrees(degrees: number): void { this.steps = (this.steps + Math.round(degrees * DEG_TO_STEP)) & MASK; }

  unit(): Point {
    return new Point(UNIT[2 * this.steps], UNIT[2 * this.steps + 1]);
  }

  /** Degrees in [-180, 180), like Angle::Degrees. */
  degrees(): number {
    return this.steps / DEG_TO_STEP - (this.steps >= STEPS / 2 ? 360 : 0);
  }

  /** Degrees in [0, 360), like Angle::AbsDegrees. */
  absDegrees(): number {
    return this.steps / DEG_TO_STEP;
  }

  /** Rotate a point around the origin (Angle::Rotate). */
  rotate(point: Point): Point {
    const unit = this.unit();
    return new Point(-unit.y * point.x - unit.x * point.y, -unit.y * point.y + unit.x * point.x);
  }
}

/** `rand` is a function returning a number in [0, 1). */
export function randomAngle(rand: () => number): Angle {
  return Angle.fromSteps(Math.floor(rand() * STEPS));
}

export const TO_DEG = 180 / Math.PI;
export const TO_RAD = Math.PI / 180;
