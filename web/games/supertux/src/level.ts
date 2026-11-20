// SuperTux 0.6.3 level files (.stl/.stwm) and the parts of Sector/Layer this port runs.
import { parseSexp, child, children, num, atom, bool, text, textOf, type Sexp } from './sexp.ts';

export interface PathNode { x: number; y: number; time: number; easing: string }
export interface PathData { name: string; nodes: PathNode[]; mode: 'oneshot' | 'ping-pong' | 'circular'; adaptSpeed: boolean }

export interface TilemapData {
  width: number; height: number; tiles: number[];
  solid: boolean; z: number; name: string;
  speedX: number; speedY: number; alpha: number;
  offsetX: number; offsetY: number;
  pathRef: string; startingNode: number;
}

export interface BackgroundData {
  color: [number, number, number] | null;
  gradientTop: [number, number, number] | null;
  gradientBottom: [number, number, number] | null;
  image: string; imageTop: string; imageBottom: string;
  speed: number; alignment: string; z: number;
}

export interface ObjectData {
  type: string;
  node: Sexp[];
  x: number; y: number;
  width: number; height: number;
  name: string;
  direction: string;
  sprite: string;
  strings: Map<string, string>;
  numbers: Map<string, number>;
  booleans: Map<string, boolean>;
  child(name: string): Sexp[] | undefined;
  text(name: string, fallback?: string): string;
}

export interface SectorData {
  name: string;
  width: number; height: number;
  tilemaps: TilemapData[];
  objects: ObjectData[];
  backgrounds: BackgroundData[];
  music: string;
  initScript: string;
  ambient: [number, number, number];
  gravity: number;
  spawnpoints: { name: string; x: number; y: number }[];
}

export interface LevelData {
  filename: string;
  name: string;
  author: string;
  license: string;
  targetTime: number;
  sectors: Map<string, SectorData>;
  paths: Map<string, PathData>;
  isWorldmap: boolean;
}

function readObject(node: Sexp[]): ObjectData {
  const strings = new Map<string, string>();
  const numbers = new Map<string, number>();
  const booleans = new Map<string, boolean>();
  for (const item of node.slice(1)) {
    if (!Array.isArray(item) || item.length < 2) continue;
    const key = String(item[0]);
    const v = item[1];
    if (typeof v === 'string') {
      if (v === '#t') booleans.set(key, true);
      else if (v === '#f') booleans.set(key, false);
      else if (Number.isFinite(Number(v)) && v.trim() !== '') numbers.set(key, Number(v));
      else strings.set(key, v);
    } else if (Array.isArray(v) && typeof v[1] === 'string') strings.set(key, v[1]);
  }
  return {
    type: String(node[0]),
    node,
    x: num(node, 'x', 0),
    y: num(node, 'y', 0),
    width: num(node, 'width', 0),
    height: num(node, 'height', 0),
    name: strings.get('name') ?? '',
    direction: strings.get('direction') ?? 'auto',
    sprite: strings.get('sprite') ?? '',
    strings, numbers, booleans,
    child: (n: string) => child(node, n),
    text: (n: string, fallback = '') => strings.get(n) ?? text(node, n, fallback),
  };
}

function parseTilemap(node: Sexp[]): TilemapData {
  const width = num(node, 'width', 0);
  const height = num(node, 'height', 0);
  const tilesNode = child(node, 'tiles');
  const tiles = tilesNode ? tilesNode.slice(1).map((x) => Number(x) || 0) : [];
  return {
    width, height, tiles,
    solid: bool(node, 'solid', false),
    z: num(node, 'z-pos', 0),
    name: atom(node, 'name'),
    speedX: num(node, 'speed-x', 1), speedY: num(node, 'speed-y', 1),
    alpha: num(node, 'alpha', 1),
    offsetX: num(node, 'x', 0), offsetY: num(node, 'y', 0),
    pathRef: atom(node, 'path-ref'),
    startingNode: num(node, 'starting-node', 0),
  };
}

function triple(node: Sexp[] | undefined): [number, number, number] | null {
  if (!node) return null;
  return [Number(node[1]), Number(node[2]), Number(node[3])];
}

function parseBackground(node: Sexp[]): BackgroundData | null {
  const image = atom(node, 'image');
  const imageTop = atom(node, 'image-top');
  const imageBottom = atom(node, 'image-bottom');
  const gradTop = child(node, 'gradient');
  const color = triple(child(node, 'color'));
  const top = triple(child(gradTop ?? node, 'top_color')) ?? triple(child(node, 'top_color'));
  const bottom = triple(child(gradTop ?? node, 'bottom_color')) ?? triple(child(node, 'bottom_color'));
  if (!image && !imageTop && !color && !top) return null;
  return {
    color,
    gradientTop: top, gradientBottom: bottom,
    image, imageTop, imageBottom,
    speed: num(node, 'speed', 1),
    alignment: atom(node, 'alignment', 'none'),
    z: num(node, 'z-pos', -100),
  };
}

function parsePath(node: Sexp[]): PathData | null {
  const name = atom(node, 'name');
  const inner = child(node, 'path');
  if (!inner) return null;
  const modeStr = atom(inner, 'mode', 'circular');
  const mode = modeStr === 'oneshot' ? 'oneshot' : modeStr === 'ping-pong' ? 'ping-pong' : 'circular';
  const nodes: PathNode[] = children(inner, 'node').map((n) => ({
    x: num(n, 'x', 0), y: num(n, 'y', 0), time: Math.max(0.0001, num(n, 'time', 1)),
    easing: atom(n, 'easing', 'EaseInOutQuad'),
  }));
  return { name, nodes, mode, adaptSpeed: bool(inner, 'adapt_speed', true) };
}

export function parseLevel(filename: string, textData: string): LevelData {
  const doc = parseSexp(textData);
  const isWorldmap = filename.endsWith('.stwm');
  const paths = new Map<string, PathData>();
  const sectors = new Map<string, SectorData>();
  let levelName = text(doc, 'name');
  const author = atom(doc, 'author');
  const license = atom(doc, 'license');
  const targetTime = num(doc, 'target-time', 0);
  for (const p of children(doc, 'path')) {
    const pd = parsePath(p);
    if (pd) paths.set(pd.name, pd);
  }
  for (const sec of children(doc, 'sector')) {
    const name = atom(sec, 'name', 'main');
    const tilemaps: TilemapData[] = [];
    const objects: ObjectData[] = [];
    const backgrounds: BackgroundData[] = [];
    const spawnpoints: { name: string; x: number; y: number }[] = [];
    let music = '';
    let initScript = '';
    let ambient: [number, number, number] = [1, 1, 1];
    let width = 0, height = 0;
    for (const item of sec.slice(1)) {
      if (!Array.isArray(item) || item.length === 0) continue;
      const type = String(item[0]);
      if (type === 'tilemap') {
        const tm = parseTilemap(item);
        tilemaps.push(tm);
        width = Math.max(width, tm.width * 32);
        height = Math.max(height, tm.height * 32);
      } else if (type === 'background') {
        const bg = parseBackground(item);
        if (bg) backgrounds.push(bg);
      } else if (type === 'gradient') {
        const bg: BackgroundData = {
          color: null, gradientTop: triple(child(item, 'top_color')) ?? [0.3, 0.4, 0.75],
          gradientBottom: triple(child(item, 'bottom_color')) ?? [1, 1, 1],
          image: '', imageTop: '', imageBottom: '', speed: 1, alignment: 'none', z: num(item, 'z-pos', -100),
        };
        backgrounds.push(bg);
      } else if (type === 'music') {
        music = atom(item, 'file');
      } else if (type === 'init-script') {
        initScript = typeof item[1] === 'string' ? item[1] : '';
      } else if (type === 'ambient-light') {
        const c = triple(child(item, 'color'));
        if (c) ambient = c;
      } else if (type === 'camera' || type === 'name' || type === 'gravity') {
        // camera mode is fixed to normal here; gravity is read below
      } else if (type === 'path') {
        const pd = parsePath(item);
        if (pd) paths.set(pd.name, pd);
      } else if (type === 'spawnpoint') {
        spawnpoints.push({ name: atom(item, 'name'), x: num(item, 'x', 0), y: num(item, 'y', 0) });
      } else {
        const o = readObject(item);
        objects.push(o);
        width = Math.max(width, o.x + o.width);
        height = Math.max(height, o.y + o.height);
      }
    }
    const gravity = num(sec, 'gravity', 10);
    sectors.set(name, {
      name, width, height, tilemaps, objects, backgrounds, music, initScript,
      ambient, gravity: gravity || 10, spawnpoints,
    });
  }
  if (!levelName) levelName = filename;
  return { filename, name: levelName, author, license, targetTime, sectors, paths, isWorldmap };
}

export function levelObjectText(o: ObjectData, name: string, fallback = ''): string {
  return o.strings.get(name) ?? fallback;
}

export { textOf };
