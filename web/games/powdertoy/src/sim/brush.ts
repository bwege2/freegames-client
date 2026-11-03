// gui/game/Brush.h / Brush.cpp, EllipseBrush.h, RectangleBrush.h, TriangleBrush.h, BitmapBrush.h / .cpp: the brush
// shapes. The bitmap is a PlaneAdapter of (2*radius.X+1) x (2*radius.Y+1) bytes, index x + y * width, where
// (radius.X, radius.Y) is the brush centre. The drawing helpers (RenderRect/Line/Point/Fill, Graphics XOR
// drawing) belong to the renderer and are left out; `outline` is kept for it.
import { f, itrunc } from './cpp.ts';
import type { Vec2 } from './vec2.ts';

/** PlaneAdapter<std::vector<unsigned char>> */
export class BrushPlane {
  width: number;
  height: number;
  data: Uint8Array;
  constructor(width: number, height: number, fill = 0) {
    this.width = width;
    this.height = height;
    this.data = new Uint8Array(width * height);
    if (fill) this.data.fill(fill);
  }
  get(x: number, y: number): number { return this.data[x + y * this.width]; }
  set(x: number, y: number, v: number): void { this.data[x + y * this.width] = v; }
  clone(): BrushPlane {
    const p = new BrushPlane(this.width, this.height);
    p.data.set(this.data);
    return p;
  }
}

export abstract class Brush {
  // 2D arrays indexed by coordinates from [-radius.X, radius.X] by [-radius.Y, radius.Y]
  bitmap = new BrushPlane(1, 1);
  outline = new BrushPlane(1, 1);
  protected radius: Vec2 = { X: 0, Y: 0 };

  protected abstract GenerateBitmap(): BrushPlane;
  abstract Clone(): Brush;

  private InitBitmap(): void {
    this.bitmap = this.GenerateBitmap();
  }

  private InitOutline(): void {
    this.InitBitmap();
    const bounds = this.GetSize();
    const bitmap = this.bitmap;
    this.outline = new BrushPlane(bounds.X, bounds.Y);
    for (let j = 0; j < bounds.Y; j++) {
      for (let i = 0; i < bounds.X; i++) {
        let value = false;
        if (bitmap.get(i, j)) {
          if (i == 0 || j == 0 || i == bounds.X - 1 || j == bounds.Y - 1)
            value = true;
          else if (!bitmap.get(i + 1, j))
            value = true;
          else if (!bitmap.get(i - 1, j))
            value = true;
          else if (!bitmap.get(i, j + 1))
            value = true;
          else if (!bitmap.get(i, j - 1))
            value = true;
        }
        this.outline.set(i, j, value ? 0xFF : 0);
      }
    }
  }

  GetSize(): Vec2 {
    return { X: this.radius.X * 2 + 1, Y: this.radius.Y * 2 + 1 };
  }

  GetRadius(): Vec2 {
    return { X: this.radius.X, Y: this.radius.Y };
  }

  /**
   * `for (ui::Point off : brush)`: the offsets of the set pixels, bottom to top (y from radius.Y down to
   * -radius.Y), each row left to right ("bottom to top is the preferred order for Simulation::CreateParts").
   */
  *[Symbol.iterator](): Generator<Vec2> {
    const rx = this.radius.X, ry = this.radius.Y;
    const bitmap = this.bitmap;
    for (let y = ry; y >= -ry; y--) {
      for (let x = -rx; x <= rx; x++) {
        if (bitmap.get(rx + x, ry + y)) yield { X: x, Y: y };
      }
    }
  }

  /** the same offsets as the iterator, as a flat [x0, y0, x1, y1, ...] list (for hot loops) */
  offsets(): Int32Array {
    const out: number[] = [];
    for (const p of this) out.push(p.X, p.Y);
    return Int32Array.from(out);
  }

  SetRadius(newRadius: Vec2): void {
    newRadius = { X: newRadius.X, Y: newRadius.Y };
    if (newRadius.X < 0)
      newRadius.X = 0;
    if (newRadius.Y < 0)
      newRadius.Y = 0;
    if (newRadius.X > 200)
      newRadius.X = 200;
    if (newRadius.Y > 200)
      newRadius.Y = 200;
    this.radius = newRadius;
    this.InitOutline();
  }

  AdjustSize(delta: number, logarithmic: boolean, keepX: boolean, keepY: boolean): void {
    if (keepX && keepY)
      return;

    let newSize: Vec2 = { X: 0, Y: 0 };
    const oldSize = this.GetRadius();
    if (logarithmic)
      newSize = { X: oldSize.X + delta * Math.max((oldSize.X / 5) | 0, 1), Y: oldSize.Y + delta * Math.max((oldSize.Y / 5) | 0, 1) };
    else
      newSize = { X: oldSize.X + delta, Y: oldSize.Y + delta };

    if (keepY)
      this.SetRadius({ X: newSize.X, Y: oldSize.Y });
    else if (keepX)
      this.SetRadius({ X: oldSize.X, Y: newSize.Y });
    else
      this.SetRadius(newSize);
  }
}

export class EllipseBrush extends Brush {
  perfectCircle: boolean;

  constructor(newPerfectCircle: boolean) {
    super();
    this.perfectCircle = newPerfectCircle;
  }

  protected GenerateBitmap(): BrushPlane {
    const size = { X: this.radius.X * 2 + 1, Y: this.radius.Y * 2 + 1 };
    const bitmap = new BrushPlane(size.X, size.Y);

    const rx = this.radius.X;
    const ry = this.radius.Y;

    if (!rx) {
      for (let j = 0; j <= 2 * ry; j++) {
        bitmap.set(rx, j, 255);
      }
    }
    else {
      let yTop = ry + 1, yBottom: number, i: number;
      for (i = 0; i <= rx; i++) {
        // pow(int, 2.0) etc. are double computations
        if (this.perfectCircle) {
          while (Math.pow(i - rx, 2.0) * Math.pow(ry - 0.5, 2.0) + Math.pow(yTop - ry, 2.0) * Math.pow(rx - 0.5, 2.0) <= Math.pow(rx, 2.0) * Math.pow(ry, 2.0))
            yTop++;
        }
        else {
          while (Math.pow(i - rx, 2.0) * Math.pow(ry, 2.0) + Math.pow(yTop - ry, 2.0) * Math.pow(rx, 2.0) <= Math.pow(rx, 2.0) * Math.pow(ry, 2.0))
            yTop++;
        }
        yBottom = 2 * ry - yTop;
        for (let j = 0; j <= ry * 2; j++) {
          if (j > yBottom && j < yTop) {
            bitmap.set(i, j, 255);
            bitmap.set(2 * rx - i, j, 255);
          }
          else {
            bitmap.set(i, j, 0);
            bitmap.set(2 * rx - i, j, 0);
          }
        }
      }
      bitmap.set((size.X / 2) | 0, 0, 255);
      bitmap.set((size.X / 2) | 0, size.Y - 1, 255);
    }
    return bitmap;
  }

  Clone(): Brush {
    const b = new EllipseBrush(this.perfectCircle);
    b.SetRadius(this.radius);
    return b;
  }
}

export class RectangleBrush extends Brush {
  protected GenerateBitmap(): BrushPlane {
    const size = this.GetSize();
    return new BrushPlane(size.X, size.Y, 0xFF);
  }

  Clone(): Brush {
    const b = new RectangleBrush();
    b.SetRadius(this.radius);
    return b;
  }
}

export class TriangleBrush extends Brush {
  protected GenerateBitmap(): BrushPlane {
    const size = { X: this.radius.X * 2 + 1, Y: this.radius.Y * 2 + 1 };
    const bitmap = new BrushPlane(size.X, size.Y);

    const rx = this.radius.X;
    const ry = this.radius.Y;
    for (let x = -rx; x <= rx; x++) {
      for (let y = -ry; y <= ry; y++) {
        if ((Math.abs((rx + 2 * x) * ry + rx * y) + Math.abs(2 * rx * (y - ry)) + Math.abs((rx - 2 * x) * ry + rx * y)) <= (4 * rx * ry)) {
          bitmap.set(x + rx, y + ry, 255);
        }
        else {
          bitmap.set(x + rx, y + ry, 0);
        }
      }
    }
    return bitmap;
  }

  Clone(): Brush {
    const b = new TriangleBrush();
    b.SetRadius(this.radius);
    return b;
  }
}

/** Misc.h LinearInterpolate<float> */
function LinearInterpolate(val1: number, val2: number, lowerCoord: number, upperCoord: number, coord: number): number {
  if (lowerCoord == upperCoord) return val1;
  return f(f(f(f(val2 - val1) / f(upperCoord - lowerCoord)) * f(coord - lowerCoord)) + val1);
}

export class BitmapBrush extends Brush {
  origSize: Vec2 = { X: 0, Y: 0 };
  // 2D array with coords [0, origSize.X) by [0, origSize.Y)
  origBitmap = new BrushPlane(1, 1);

  /** BitmapBrush(ui::Point size, unsigned char const *bitmap) */
  constructor(inputSize: Vec2, inputBitmap: ArrayLike<number>) {
    super();
    const newSize = { X: inputSize.X, Y: inputSize.Y };

    //Ensure the rect has odd dimensions so we can pull an integer radius with a 1x1 centre
    if (!(newSize.X % 2))
      newSize.X += 1;
    if (!(newSize.Y % 2))
      newSize.Y += 1;

    this.origSize = newSize;
    this.origBitmap = new BrushPlane(newSize.X, newSize.Y, 0);
    for (let y = 0; y < inputSize.Y; y++)
      for (let x = 0; x < inputSize.X; x++)
        this.origBitmap.set(x, y, inputBitmap[x + y * inputSize.X]);
  }

  protected GenerateBitmap(): BrushPlane {
    const size = { X: this.radius.X * 2 + 1, Y: this.radius.Y * 2 + 1 };
    const origSize = this.origSize, origBitmap = this.origBitmap;
    let bitmap: BrushPlane;
    if (size.X == origSize.X && size.Y == origSize.Y)
      bitmap = origBitmap.clone();
    else {
      bitmap = new BrushPlane(size.X, size.Y);
      //Bilinear interpolation
      const factorX = f(origSize.X / size.X);
      const factorY = f(origSize.Y / size.Y);
      for (let y = 0; y < size.Y; y++) {
        for (let x = 0; x < size.X; x++) {
          const originalY = f(y * factorY);
          const originalX = f(x * factorX);

          const lowerX = itrunc(Math.floor(originalX));
          const upperX = itrunc(Math.min(origSize.X - 1, Math.floor(f(originalX + 1.0))));
          const lowerY = itrunc(Math.floor(originalY));
          const upperY = itrunc(Math.min(origSize.Y - 1, Math.floor(f(originalY + 1.0))));

          const topRight = origBitmap.get(upperX, lowerY);
          const topLeft = origBitmap.get(lowerX, lowerY);
          const bottomRight = origBitmap.get(upperX, upperY);
          const bottomLeft = origBitmap.get(lowerX, upperY);
          const top = LinearInterpolate(topLeft, topRight, lowerX, upperX, originalX);
          const bottom = LinearInterpolate(bottomLeft, bottomRight, lowerX, upperX, originalX);
          const mid = LinearInterpolate(top, bottom, lowerY, upperY, originalY);
          bitmap.set(x, y, mid > 128 ? 255 : 0);
        }
      }
    }
    return bitmap;
  }

  Clone(): Brush {
    const b = new BitmapBrush(this.origSize, this.origBitmap.data);
    b.SetRadius(this.radius);
    return b;
  }
}

/**
 * GameModel::BuildBrushList: the default brushes in brush-id order (BRUSH_CIRCLE, BRUSH_SQUARE, BRUSH_TRIANGLE),
 * then any bitmap brushes; the current brush gets the radius (default 4, 4).
 */
export function BuildBrushList(perfectCircle = true, bitmaps: { size: number; data: ArrayLike<number> }[] = []): Brush[] {
  const brushList: Brush[] = [];
  brushList.push(new EllipseBrush(perfectCircle));
  brushList.push(new RectangleBrush());
  brushList.push(new TriangleBrush());
  for (const b of bitmaps) brushList.push(new BitmapBrush({ X: b.size, Y: b.size }, b.data));
  for (const b of brushList) b.SetRadius({ X: 4, Y: 4 });
  return brushList;
}
