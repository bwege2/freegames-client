// SuperTux 0.6.3 tilesets (data/images/*.strf, parsed by src/supertux/tile_set_parser.cpp).
import { imageReady, loadImage, loadText } from './resources.ts';
import { parseSexp, child, children, num, bool, type Sexp } from './sexp.ts';
import { DIRECTION_MASK, DEFORM_MASK } from './physics.ts';

export const SOLID = 0x0001;
export const UNISOLID = 0x0002;
export const SLOPE = 0x0010;
export const ICE = 0x0100;
export const WATER = 0x0200;
export const HURTS = 0x0400;
export const FIRE = 0x0800;
export const WALLJUMP = 0x1000;

export interface TileImage { path: string; sx: number; sy: number; sw: number; sh: number }

export interface TileDef {
  id: number;
  attributes: number;
  data: number;
  fps: number;
  images: TileImage[];
}

const EMPTY: TileDef = { id: 0, attributes: 0, data: 0, fps: 0, images: [] };

export class TileSet {
  readonly path: string;
  readonly tiles = new Map<number, TileDef>();

  constructor(path: string) {
    this.path = path.replace(/^\/+/, '');
  }

  get(id: number): TileDef {
    return this.tiles.get(id) ?? EMPTY;
  }

  draw(ctx: CanvasRenderingContext2D, id: number, x: number, y: number, time: number): void {
    const t = this.get(id);
    if (t.images.length === 0) return;
    const idx = t.images.length > 1 && t.fps > 0 ? Math.floor(time * t.fps) % t.images.length : 0;
    const im = t.images[idx];
    const img = imageReady(im.path);
    if (!img) return;
    ctx.drawImage(img, im.sx, im.sy, im.sw, im.sh, Math.round(x), Math.round(y), 32, 32);
  }
}

function imageSpecs(node: Sexp[] | undefined, base: string, region: boolean): TileImage[] {
  if (!node) return [];
  const out: TileImage[] = [];
  for (const v of node.slice(1)) {
    if (typeof v === 'string') {
      const path = v.startsWith('/') ? v.slice(1) : `${base}/${v}`;
      out.push({ path, sx: 0, sy: 0, sw: 32, sh: 32 });
    } else if (Array.isArray(v) && v[0] === 'region' && typeof v[1] === 'string') {
      const path = v[1].startsWith('/') ? v[1].slice(1) : `${base}/${v[1]}`;
      out.push({ path, sx: Number(v[2]), sy: Number(v[3]), sw: Number(v[4]), sh: Number(v[5]) });
    }
  }
  if (!region) for (const im of out) { im.sw = 32; im.sh = 32; }
  return out;
}

export function parseTileSet(path: string, text: string): TileSet {
  const set = new TileSet(path);
  const base = set.path.slice(0, set.path.lastIndexOf('/'));
  const doc = parseSexp(text);
  for (const t of children(doc, 'tile')) {
    const id = num(t, 'id', -1);
    if (id < 0) continue;
    let attrs = 0;
    if (bool(t, 'solid')) attrs |= SOLID;
    if (bool(t, 'unisolid')) attrs |= SOLID | UNISOLID;
    if (bool(t, 'ice')) attrs |= ICE;
    if (bool(t, 'water')) attrs |= WATER;
    if (bool(t, 'hurts')) attrs |= HURTS;
    if (bool(t, 'fire')) attrs |= FIRE;
    if (bool(t, 'walljump')) attrs |= WALLJUMP;
    if (child(t, 'slope-type')) attrs |= SOLID | SLOPE;
    const data = num(t, 'data', 0);
    const slope = child(t, 'slope-type');
    const fps = num(t, 'fps', 10);
    const imgs = imageSpecs(child(t, 'images'), base, false);
    set.tiles.set(id, { id, attributes: attrs, data: slope ? Number(slope[1]) : data, fps, images: imgs });
  }
  for (const grid of children(doc, 'tiles')) {
    const width = num(grid, 'width', 0);
    const height = num(grid, 'height', 0);
    const ids = child(grid, 'ids');
    if (!ids || width <= 0 || height <= 0) continue;
    const idlist = ids.slice(1).map((x) => Number(x));
    const attrNode = child(grid, 'attributes');
    const dataNode = child(grid, 'datas');
    const attrs = attrNode ? attrNode.slice(1).map((x) => Number(x)) : [];
    const datas = dataNode ? dataNode.slice(1).map((x) => Number(x)) : [];
    const fps = num(grid, 'fps', 10);
    const shared = bool(grid, 'shared-surface');
    const single = child(grid, 'image') ?? child(grid, 'images');
    const frames = imageSpecs(single, base, false);
    for (let i = 0; i < idlist.length; i++) {
      const id = idlist[i];
      if (!id) continue;
      const cx = (i % width) * 32;
      const cy = Math.floor(i / width) * 32;
      const images: TileImage[] = shared
        ? frames.map((f) => ({ ...f, sx: cx, sy: cy }))
        : (child(grid, 'images') ? imageSpecs(child(grid, 'images'), base, true) : frames).map((f) => ({ ...f, sx: cx, sy: cy }));
      set.tiles.set(id, {
        id,
        attributes: attrs[i] ?? 0,
        data: datas[i] ?? 0,
        fps,
        images,
      });
    }
  }
  return set;
}

const cache = new Map<string, Promise<TileSet>>();
export function loadTileSet(path: string): Promise<TileSet> {
  const clean = path.replace(/^\/+/, '');
  let p = cache.get(clean);
  if (!p) {
    p = loadText(clean).then(async (text) => {
      const set = parseTileSet(clean, text);
      for (const t of set.tiles.values()) for (const im of t.images) await loadImage(im.path);
      return set;
    });
    cache.set(clean, p);
  }
  return p;
}

export function slopeData(t: TileDef): number { return t.data & (DIRECTION_MASK | DEFORM_MASK); }
