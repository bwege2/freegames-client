// src/mapgen/: the map maker. A diamond-square generator (generator/diamon.cpp), then filters
// (filter/*.cpp), in 32-bit float arithmetic like the original (every float operation is rounded with
// Math.fround). The game creates every new city with the defaults of main.cpp: PLAIN map, LAKE water,
// no shape, SPARSE trees; the other generator options exist only on the original's command line.
import { GlibcRandom, RAND_MAX } from './rand.ts';

const f = Math.fround;
const RAND_MAX_F = f(RAND_MAX);

/** mapgen/map.cpp: a float map stored per column (_map[x][y]) */
export class GenMap {
  readonly w: number;
  readonly h: number;
  readonly a: Float32Array;

  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.a = new Float32Array(w * h);
  }

  setAt(x: number, y: number, v: number): void { this.a[x * this.h + y] = v; }

  /** bordered getter */
  getAt(x: number, y: number): number {
    x = x < 0 ? 0 : x;
    x = x >= this.w ? this.w - 1 : x;
    y = y < 0 ? 0 : y;
    y = y >= this.h ? this.h - 1 : y;
    return this.a[x * this.h + y];
  }

  crop(w: number, h: number): GenMap {
    const m = new GenMap(w, h);
    const dcx = Math.floor(this.w / 2) - Math.floor(w / 2);
    const dcy = Math.floor(this.h / 2) - Math.floor(h / 2);
    for (let x = 0; x < w; ++x) for (let y = 0; y < h; ++y) m.setAt(x, y, this.getAt(x + dcx, y + dcy));
    return m;
  }

  /** (int) truncation, row-major (x + y*w) */
  toIntArray(): Int32Array {
    const out = new Int32Array(this.w * this.h);
    for (let x = 0; x < this.w; x++) for (let y = 0; y < this.h; y++) out[x + y * this.w] = Math.trunc(this.getAt(x, y));
    return out;
  }

  halfShift(): GenMap {
    const m = new GenMap(this.w - 1, this.h - 1);
    for (let x = 0; x < this.w - 1; ++x)
      for (let y = 0; y < this.h - 1; ++y)
        m.setAt(x, y, f(f(f(f(this.getAt(x, y) + this.getAt(x + 1, y)) + this.getAt(x, y + 1)) + this.getAt(x + 1, y + 1)) / 4));
    return m;
  }

  minMax(): [number, number] {
    let min = this.getAt(0, 0);
    let max = min;
    for (let x = 0; x < this.w; ++x)
      for (let y = 0; y < this.h; ++y) {
        const v = this.getAt(x, y);
        if (v < min) min = v;
        if (v > max) max = v;
      }
    return [min, max];
  }
}

/** generator/diamon.cpp; Generator's constructor calls srand(seed) */
function diamond(rng: GlibcRandom, seed: number, order: number): GenMap {
  rng.srand(seed);
  const side = 2 ** order;
  const map = new GenMap(side, side);
  map.setAt(0, 0, 128);
  const mapW = side, mapL = side;
  const all = (p: number): number => f(f(f(f(f(rng.rand()) / RAND_MAX_F) * p) * 2) - p);
  const get = (x: number, y: number): number => map.getAt(((x % mapW) + mapW) % mapW, ((y % mapL) + mapL) % mapL);
  const avg = (a: number, b: number, c: number, d: number): number => f(f(f(f(a + b) + c) + d) / 4);
  let p = mapW / 2;
  while (p !== 0) {
    const p2 = 2 * p;
    for (let i = p; i < mapW; i += p2)
      for (let j = p; j < mapL; j += p2)
        map.setAt(i, j, f(avg(get(i - p, j - p), get(i + p, j - p), get(i + p, j + p), get(i - p, j + p)) + all(p)));
    for (let i = p; i < mapW; i += p2)
      for (let j = 0; j < mapL; j += p2)
        map.setAt(i, j, f(avg(get(i - p, j), get(i + p, j), get(i, j - p), get(i, j + p)) + all(p)));
    for (let i = 0; i < mapW; i += p2)
      for (let j = p; j < mapL; j += p2)
        map.setAt(i, j, f(avg(get(i - p, j), get(i + p, j), get(i, j - p), get(i, j + p)) + all(p)));
    p = Math.floor(p / 2);
  }
  return map;
}

type Filter = (m: GenMap) => void;

function normalize(min: number, max: number): Filter {
  return (m) => {
    const [lo, hi] = m.minMax();
    const a = f(f(max - min) / f(hi - lo));
    const b = f(f(-lo * a) + min);
    for (let x = 0; x < m.w; ++x) for (let y = 0; y < m.h; ++y) m.setAt(x, y, f(f(a * m.getAt(x, y)) + b));
  };
}

const powf = (x: number, y: number): number => f(Math.pow(f(x), f(y)));

function flattern(power: number): Filter {
  return (m) => {
    const [min, max] = m.minMax();
    const coef = f(Math.abs(f(max - min)));
    for (let x = 0; x < m.w; ++x)
      for (let y = 0; y < m.h; ++y) {
        if (min >= 0) {
          m.setAt(x, y, f(f(powf(f(f(m.getAt(x, y) - min) / coef), power) * coef) + min));
        } else {
          const h = m.getAt(x, y);
          if (h >= 0) m.setAt(x, y, f(powf(f(h / max), power) * max));
          else m.setAt(x, y, f(Math.abs(powf(f(Math.abs(h) / min), power)) * min));
        }
      }
  };
}

/** filter/gaussblur.cpp. _gauss() takes the offset as an unsigned int: the left half of the kernel
 * wraps to huge numbers and gets the weight 0, so the "blur" only looks right and down. */
function gaussBlur(length: number): Filter {
  const size = length * 2 + 1;
  const w = new Float32Array(size);
  let sum = 0;
  for (let x = 0; x < size; ++x) {
    const u = (x - length) >>> 0;
    w[x] = f(Math.exp(-1.0 / length * u * u));
    sum = f(sum + w[x]);
  }
  for (let x = 0; x < size; ++x) w[x] = f(w[x] / sum);
  return (m) => {
    const t = new GenMap(m.w, m.h);
    for (let x = 0; x < m.w; ++x)
      for (let y = 0; y < m.h; ++y) {
        let s = 0;
        for (let i = 0; i < size; ++i) s = f(s + f(w[i] * m.getAt(x + i - length, y)));
        t.setAt(x, y, s);
      }
    for (let x = 0; x < m.w; ++x)
      for (let y = 0; y < m.h; ++y) {
        let s = 0;
        for (let i = 0; i < size; ++i) s = f(s + f(w[i] * t.getAt(x, y + i - length)));
        m.setAt(x, y, s);
      }
  };
}

/** Contextualizer(ContextOnlyPositive): keep the height where int(context) >= 0 */
function onlyWhereContextPositive(context: GenMap): Filter {
  return (m) => {
    for (let x = 0; x < m.w; ++x)
      for (let y = 0; y < m.h; ++y) m.setAt(x, y, Math.trunc(context.getAt(x, y)) >= 0 ? m.getAt(x, y) : 0);
  };
}

/** Cutter(CutterFunctorOnlyPositive): negative values become 0 */
const cutNegative: Filter = (m) => {
  for (let x = 0; x < m.w; ++x) for (let y = 0; y < m.h; ++y) if (m.getAt(x, y) < 0) m.setAt(x, y, 0);
};

function generate(w: number, h: number, gen: GenMap, filters: Filter[]): GenMap {
  const cropped = gen.crop(w, h);
  for (const fl of filters) fl(cropped);
  return cropped;
}

/** MapMaker(w, h, "", PLAIN, LAKE, NONE, SPARSE, seed). The rng is left as the map maker leaves it except
 * for its final srand(time(NULL)), which the caller does. */
export class MapMaker {
  readonly map: GenMap;
  readonly treeDensity: GenMap;

  constructor(w: number, h: number, seed: number, rng: GlibcRandom) {
    rng.srand(seed);
    const mapSeed = rng.rand();
    const treeSeed = rng.rand();
    // _generateMap: PLAIN with LAKE water (waterLevel 1)
    const largerSide = Math.max(w + 1, h + 1);
    const side = Math.ceil(Math.log2(f(largerSide)));
    const waterLevel = 1;
    const minLevel = -3 * waterLevel, maxLevel = 5;
    this.map = generate(w + 1, h + 1, diamond(rng, mapSeed, side), [normalize(minLevel, maxLevel), flattern(3), gaussBlur(2)]);
    // _generateTreeDensity: SPARSE
    const tSide = Math.ceil(Math.log2(f(Math.max(w, h))));
    const halfShift = this.map.halfShift();
    this.treeDensity = generate(w, h, diamond(rng, treeSeed, tSide),
      [flattern(1), gaussBlur(5), normalize(-15, 5), onlyWhereContextPositive(halfShift), cutNegative]);
  }

  getMap(): Int32Array { return this.map.toIntArray(); }
  getTreeDensity(): Int32Array { return this.treeDensity.toIntArray(); }
}
