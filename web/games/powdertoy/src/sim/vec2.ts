// common/Vec2.h (the integer parts the simulation and the tools use): Vec2<int> / ui::Point and Rect<int>.

/** Vec2<int>, ui::Point */
export interface Vec2 {
  X: number;
  Y: number;
}

/** Rect<int>: pos and size (the rectangle covers pos .. pos + size - 1) */
export interface Rect {
  pos: Vec2;
  size: Vec2;
}

export function vec2(X: number, Y: number): Vec2 {
  return { X, Y };
}

export function RectSized(pos: Vec2, size: Vec2): Rect {
  return { pos: { X: pos.X, Y: pos.Y }, size: { X: size.X, Y: size.Y } };
}

/** RectBetween(topLeft, bottomRight): both inclusive */
export function RectBetween(topLeft: Vec2, bottomRight: Vec2): Rect {
  return RectSized(topLeft, { X: bottomRight.X - topLeft.X + 1, Y: bottomRight.Y - topLeft.Y + 1 });
}

/** Rect::operator&: the intersection (possibly empty) */
export function rectAnd(a: Rect, b: Rect): Rect {
  const tlX = Math.max(a.pos.X, b.pos.X), tlY = Math.max(a.pos.Y, b.pos.Y);
  const brX = Math.min(a.pos.X + a.size.X, b.pos.X + b.size.X), brY = Math.min(a.pos.Y + a.size.Y, b.pos.Y + b.size.Y);
  return { pos: { X: tlX, Y: tlY }, size: { X: Math.max(brX - tlX, 0), Y: Math.max(brY - tlY, 0) } };
}

/** Rect::Contains */
export function rectContains(r: Rect, X: number, Y: number): boolean {
  return X >= r.pos.X && X < r.pos.X + r.size.X && Y >= r.pos.Y && Y < r.pos.Y + r.size.Y;
}

/**
 * `for (auto p : rect)`: the default iteration order, rows top to bottom, each row left to right
 * (Range<TOP_TO_BOTTOM, LEFT_TO_RIGHT>).
 */
export function* rectPoints(r: Rect): Generator<Vec2> {
  for (let y = r.pos.Y; y < r.pos.Y + r.size.Y; y++) {
    for (let x = r.pos.X; x < r.pos.X + r.size.X; x++) {
      yield { X: x, Y: y };
    }
  }
}
