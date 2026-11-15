// Pingus's data directory and resources: Pathname/PathManager (paths relative to data/), ResourceManager
// (resource names "pingus/player0/walker/left" → images/….sprite, .png or .jpg), SpriteDescription
// (sprite_description.cpp), Resource::load_surface (resource.cpp) and CollisionMask (collision_mask.cpp).
// The files themselves come from a DataSource: the fetched assets in the browser, the original's data
// directory in the tests. All reads are synchronous as in the original; the browser loads what a screen
// needs before showing it (index.ts).
import { SExprReader } from './sexpr.ts';
import { Surface, collisionMask, decodeImage } from './surface.ts';

export interface DataSource {
  /** a text file of data/ ("levels/tutorial/x.pingus"), null when there is none */
  text(path: string): string | null;
  /** an image of data/ ("images/core/misc/404.png") */
  image(path: string): Surface | null;
  exists(path: string): boolean;
  /** a file's bytes (the sounds) */
  bytes(path: string): Uint8Array | null;
  /** every file below a directory of data/ */
  list(dir: string): string[];
}

let source: DataSource | null = null;
export function setDataSource(s: DataSource) { source = s; spriteDescs.clear(); surfaces.clear(); }
export function data(): DataSource {
  if (!source) throw new Error('pingus: no data source');
  return source;
}

/** a DataSource on raw bytes (the browser's fetched files, a directory in tests) */
export class BytesSource implements DataSource {
  private files: Map<string, Uint8Array>;
  private images = new Map<string, Surface | null>();
  private dec = new TextDecoder('utf-8');
  constructor(files: Map<string, Uint8Array>) { this.files = files; }
  add(path: string, bytes: Uint8Array) { this.files.set(path, bytes); }
  has(path: string) { return this.files.has(path); }
  text(path: string) { const b = this.files.get(normalizePath(path)); return b ? this.dec.decode(b) : null; }
  image(path: string) {
    const p = normalizePath(path);
    if (!this.images.has(p)) {
      const b = this.files.get(p);
      this.images.set(p, b ? decodeImage(p, b) : null);
    }
    return this.images.get(p)!;
  }
  exists(path: string) { return this.files.has(normalizePath(path)); }
  bytes(path: string) { return this.files.get(normalizePath(path)) ?? null; }
  list(dir: string) {
    const d = dir.endsWith('/') ? dir : dir + '/';
    return [...this.files.keys()].filter((k) => k.startsWith(d)).sort();
  }
}

/** System::normalize_path */
export function normalizePath(path: string): string {
  const out: string[] = [];
  let skip = 0;
  const parts = path.split('/');
  for (let i = parts.length - 1; i >= 0; i--) {
    const d = parts[i];
    if (d === '' || d === '.') continue;
    if (d === '..') { skip++; continue; }
    if (skip === 0) out.unshift(d); else skip--;
  }
  return (path.startsWith('/') ? '/' : '') + out.join('/');
}
export const dirname = (p: string) => { const i = p.lastIndexOf('/'); return i < 0 ? '.' : p.slice(0, i); };

export type Origin = 'top_left' | 'top_center' | 'top_right' | 'center_left' | 'center' | 'center_right'
  | 'bottom_left' | 'bottom_center' | 'bottom_right';
const ORIGINS: Origin[] = ['top_left', 'top_center', 'top_right', 'center_left', 'center', 'center_right', 'bottom_left', 'bottom_center', 'bottom_right'];

/** calc_origin (math/origin.cpp) */
export function calcOrigin(o: Origin, w: number, h: number): { x: number; y: number } {
  const hw = Math.trunc(w / 2), hh = Math.trunc(h / 2);
  switch (o) {
    case 'top_center': return { x: hw, y: 0 };
    case 'top_right': return { x: w, y: 0 };
    case 'center_left': return { x: 0, y: hh };
    case 'center': return { x: hw, y: hh };
    case 'center_right': return { x: w, y: hh };
    case 'bottom_left': return { x: 0, y: h };
    case 'bottom_center': return { x: hw, y: h };
    case 'bottom_right': return { x: w, y: h };
    default: return { x: 0, y: 0 };
  }
}

export interface SpriteDescription {
  filename: string;
  offset: { x: number; y: number };
  origin: Origin;
  loop: boolean;
  speed: number;
  array: { width: number; height: number };
  framePos: { x: number; y: number };
  frameSize: { width: number; height: number };
}

const spriteDescs = new Map<string, SpriteDescription | null>();

/** ResourceManager::get_sprite_description */
export function spriteDescription(name: string): SpriteDescription | null {
  if (spriteDescs.has(name)) return spriteDescs.get(name)!;
  const d = data();
  let desc: SpriteDescription | null = null;
  const base = (filename: string): SpriteDescription => ({
    filename, offset: { x: 0, y: 0 }, origin: 'top_left', loop: true, speed: 100,
    array: { width: 1, height: 1 }, framePos: { x: 0, y: 0 }, frameSize: { width: -1, height: -1 },
  });
  const spritePath = `images/${name}.sprite`;
  const text = d.text(spritePath);
  if (text !== null) {
    const r = SExprReader.parse(text);
    desc = base('');
    desc.speed = r.readInt('speed') ?? desc.speed;
    desc.loop = r.readBool('loop') ?? desc.loop;
    desc.offset = r.readVector2i('offset') ?? desc.offset;
    const o = r.readString('origin');
    if (o !== undefined) desc.origin = (ORIGINS as string[]).includes(o) ? o as Origin : 'top_left';
    const img = r.readString('image') ?? '';
    // "/images/..." is relative to data/ (Pathname::absolute), anything else to the .sprite file's directory
    desc.filename = img.startsWith('/') ? normalizePath(img.slice(1)) : normalizePath(`${dirname(spritePath)}/${img}`);
    desc.array = r.readSize('array') ?? desc.array;
    desc.framePos = r.readVector2i('position') ?? desc.framePos;
    desc.frameSize = r.readSize('size') ?? desc.frameSize;
  } else if (d.exists(`images/${name}.png`)) {
    desc = base(`images/${name}.png`);
  } else if (d.exists(`images/${name}.jpg`)) {
    desc = base(`images/${name}.jpg`);
  }
  if (desc || d.exists(spritePath)) spriteDescs.set(name, desc);
  return desc;
}

export const NOT_FOUND = 'images/core/misc/404.png';

const surfaces = new Map<string, Surface>();
/** Surface(Pathname): IMG_Load, 404 image when missing (as load_framebuffer_surface does) */
export function loadImageFile(filename: string): Surface {
  let s = surfaces.get(filename);
  if (!s) {
    s = data().image(filename) ?? data().image(NOT_FOUND)!;
    surfaces.set(filename, s);
  }
  return s;
}

export interface ResDescriptor { name: string; modifier: string }

/** Resource::load_surface */
export function loadSurface(res: ResDescriptor | string): Surface {
  const r = typeof res === 'string' ? { name: res, modifier: 'ROT0' } : res;
  const desc = spriteDescription(r.name);
  if (!desc) return data().image(NOT_FOUND)!;
  let s = loadImageFile(desc.filename);
  if (desc.array.width !== 1 || desc.array.height !== 1 || desc.framePos.x !== 0 || desc.framePos.y !== 0
      || desc.frameSize.width !== -1 || desc.frameSize.height !== -1) {
    s = s.subsection(desc.framePos.x, desc.framePos.y, desc.frameSize.width, desc.frameSize.height);
  }
  return r.modifier === 'ROT0' ? s : s.mod(r.modifier);
}

/** CollisionMask: a surface (drawn) and which of its pixels are solid (maybe from a second image) */
export class CollisionMask {
  readonly surface: Surface;
  readonly w: number;
  readonly h: number;
  readonly data: Uint8Array;
  constructor(gfx: ResDescriptor | string, col?: ResDescriptor | string) {
    this.surface = loadSurface(gfx);
    const c = col === undefined ? this.surface : loadSurface(col);
    this.w = c.w;
    this.h = c.h;
    this.data = collisionMask(c);
  }
}
