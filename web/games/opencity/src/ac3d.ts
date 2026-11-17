// src/model/ac3d*.cpp and src/model/modelloader.cpp: OpenCity's AC3D (.ac) model loader. It reads the
// materials and the object tree the way the original does (the same tokens, the same handling of kids, the
// "alpha" data marker for translucent objects) and triangulates every surface as a fan, with the original's
// unnormalised face normal (cross product). The result is three triangle lists, like the original's three
// display lists: opaque one-sided (back faces culled), opaque two-sided, translucent (alpha tested, blended).

export interface Material { r: number; g: number; b: number }

interface Ref { v: number; s: number; t: number }
interface Surface { twoSide: boolean; mat: number; refs: Ref[] }
interface AcObject {
  type: string;
  loc: [number, number, number];
  texture: string;
  translucent: boolean;
  kids: number;
  vertices: [number, number, number][];
  surfaces: Surface[];
  children: AcObject[];
}

/** one display list: per vertex position (3), normal (3), uv (2), colour (3) */
export interface TriangleList { position: number[]; normal: number[]; uv: number[]; color: number[] }

export interface Model {
  texture: string;   // the first texture of the model ('' for none), relative to the model's folder
  opaque: TriangleList;
  twoSide: TriangleList;
  alpha: TriangleList | null;
}

/** istream::getline over the file: the lines read while the stream is good (a last line without a newline
 * is read with eof set, and the original's loops stop before using it) */
function goodLines(text: string): string[] {
  const lines = text.split('\n');
  lines.pop();
  return lines.map((l) => (l.length >= 1024 ? l.slice(0, 1023) : l));
}

const startsWith = (line: string, token: string) => line.startsWith(token);
const scanFloats = (s: string): number[] => {
  const out: number[] = [];
  for (const t of s.trim().split(/\s+/)) {
    const m = /^[+-]?(\d+\.?\d*|\.\d+)([eE][+-]?\d+)?/.exec(t);
    if (!m) break;
    out.push(Math.fround(Number(m[0])));
  }
  return out;
};

function parseMaterial(line: string): Material {
  // sscanf "MATERIAL %s rgb %f %f %f ..."
  const m = /^MATERIAL\s+\S+\s+rgb\s+(\S+)\s+(\S+)\s+(\S+)/.exec(line);
  if (!m) return { r: 0, g: 0, b: 0 };
  const v = (s: string) => Math.fround(parseFloat(s) || 0);
  return { r: v(m[1]), g: v(m[2]), b: v(m[3]) };
}

function parseSurfaceBlock(block: string[]): Surface {
  const s: Surface = { twoSide: false, mat: 0, refs: [] };
  let i = 0;
  while (i < block.length) {
    const line = block[i];
    if (startsWith(line, 'SURF')) {
      const attr = parseInt(line.slice(4).trim(), 16) || 0;
      s.twoSide = (attr & 0x20) !== 0;
      i++;
    } else if (startsWith(line, 'mat')) {
      s.mat = parseInt(line.slice(3).trim(), 10) || 0;
      i++;
    } else if (startsWith(line, 'refs')) {
      let n = parseInt(line.slice(4).trim(), 10) || 0;
      i++;
      while (i < block.length && n-- > 0) {
        const p = block[i].trim().split(/\s+/);
        s.refs.push({ v: parseInt(p[0], 10) >>> 0, s: Math.fround(Number(p[1]) || 0), t: Math.fround(Number(p[2]) || 0) });
        i++;
      }
      break;
    } else i++;
  }
  return s;
}

function parseObject(block: string[]): AcObject {
  const o: AcObject = { type: '', loc: [0, 0, 0], texture: '', translucent: false, kids: 0, vertices: [], surfaces: [], children: [] };
  let i = 0;
  while (i < block.length) {
    const line = block[i];
    if (startsWith(line, 'OBJECT')) { o.type = line.split(/\s+/)[1] ?? ''; i++; }
    else if (startsWith(line, 'data')) {
      const size = parseInt(line.slice(4).trim(), 10) || 0;
      const data = (block[i + 1] ?? '').slice(0, size);
      o.translucent = data.includes('alpha');
      i += 2;
    } else if (startsWith(line, 'texture')) {
      const t = line.split(/\s+/)[1] ?? '';
      o.texture = t.length >= 2 ? t.slice(1, -1) : t;
      i++;
    } else if (startsWith(line, 'loc')) {
      const v = scanFloats(line.slice(3));
      o.loc = [v[0] ?? 0, v[1] ?? 0, v[2] ?? 0];
      i++;
    } else if (startsWith(line, 'kids')) { o.kids = parseInt(line.slice(4).trim(), 10) || 0; i++; }
    else if (startsWith(line, 'numvert')) {
      let n = parseInt(line.slice(7).trim(), 10) || 0;
      i++;
      while (i < block.length && n-- > 0) {
        const v = scanFloats(block[i]);
        o.vertices.push([v[0] ?? 0, v[1] ?? 0, v[2] ?? 0]);
        i++;
      }
    } else if (startsWith(line, 'numsurf')) {
      i++;
      // ac3dobjectParseSurface: blocks of SURF/mat/refs lines up to "kids"
      let cur: string[] = [];
      while (i < block.length) {
        const b = block[i];
        if (startsWith(b, 'kids')) break;
        if (startsWith(b, 'SURF') || startsWith(b, 'mat')) { cur.push(b); i++; }
        else if (startsWith(b, 'refs')) {
          cur.push(b);
          i++;
          while (i < block.length && !(startsWith(block[i], 'SURF') || startsWith(block[i], 'mat') ||
            startsWith(block[i], 'refs') || startsWith(block[i], 'kids'))) { cur.push(block[i]); i++; }
          o.surfaces.push(parseSurfaceBlock(cur));
          cur = [];
        } else i++;
      }
    } else i++;
  }
  return o;
}

export function parseAC3D(text: string): { materials: Material[]; root: AcObject | null } {
  const lines = goodLines(text);
  const materials: Material[] = [];
  let root: AcObject | null = null;
  let current: AcObject | null = null;
  const stack: AcObject[] = [];
  let i = 1;   // the header ("AC3Db")
  while (i < lines.length) {
    const line = lines[i];
    if (startsWith(line, 'MATERIAL')) { materials.push(parseMaterial(line)); i++; }
    else if (startsWith(line, 'OBJECT')) {
      const block = [line];
      i++;
      while (i < lines.length && !startsWith(lines[i], 'OBJECT')) block.push(lines[i++]);
      const obj = parseObject(block);
      if (root === null) { root = obj; current = obj; }
      else {
        current!.children.push(obj);
        if (current!.translucent && current!.type === 'group') obj.translucent = true;
        if (obj.kids > 0) { stack.push(current!); current = obj; }
        else {
          while (current!.children.length === current!.kids && stack.length > 0) current = stack.pop()!;
        }
      }
    } else i++;
  }
  return { materials, root };
}

const emptyList = (): TriangleList => ({ position: [], normal: [], uv: [], color: [] });

/** ModelLoader::LoadAC3D */
export function loadModel(text: string): Model | null {
  const { materials, root } = parseAC3D(text);
  if (root === null) return null;
  let texture = '';
  const findTexture = (o: AcObject) => {
    if (o.texture !== '' && texture === '') texture = o.texture;
    o.children.forEach(findTexture);
  };
  findTexture(root);
  let needAlpha = false;
  const f = Math.fround;
  const emit = (list: TriangleList, translucent: boolean, twoSide: boolean) => {
    const acc = [0, 0, 0];
    const walk = (o: AcObject) => {
      acc[0] = f(acc[0] + o.loc[0]); acc[1] = f(acc[1] + o.loc[1]); acc[2] = f(acc[2] + o.loc[2]);
      if (o.translucent) needAlpha = true;
      if (translucent === o.translucent) {
        for (const surf of o.surfaces) {
          if (!translucent && twoSide !== surf.twoSide) continue;
          const mat = materials[surf.mat] ?? { r: 0, g: 0, b: 0 };
          const refs = surf.refs;
          for (let k = 1; k < refs.length - 1; k++) {
            const tri = [refs[0], refs[k], refs[k + 1]];
            const p = tri.map((r) => {
              const v = o.vertices[r.v] ?? [0, 0, 0];
              return [f(v[0] + acc[0]), f(v[1] + acc[1]), f(v[2] + acc[2])];
            });
            const a = [f(p[1][0] - p[0][0]), f(p[1][1] - p[0][1]), f(p[1][2] - p[0][2])];
            const b = [f(p[2][0] - p[0][0]), f(p[2][1] - p[0][1]), f(p[2][2] - p[0][2])];
            const n = [f(f(a[1] * b[2]) - f(b[1] * a[2])), f(f(b[0] * a[2]) - f(a[0] * b[2])), f(f(a[0] * b[1]) - f(b[0] * a[1]))];
            for (let j = 0; j < 3; j++) {
              list.position.push(p[j][0], p[j][1], p[j][2]);
              list.normal.push(n[0], n[1], n[2]);
              list.uv.push(tri[j].s, tri[j].t);
              list.color.push(mat.r, mat.g, mat.b);
            }
          }
        }
      }
      o.children.forEach(walk);
      acc[0] = f(acc[0] - o.loc[0]); acc[1] = f(acc[1] - o.loc[1]); acc[2] = f(acc[2] - o.loc[2]);
    };
    walk(root);
  };
  const opaque = emptyList(), twoSide = emptyList();
  emit(opaque, false, false);
  emit(twoSide, false, true);
  let alpha: TriangleList | null = null;
  if (needAlpha) { alpha = emptyList(); emit(alpha, true, false); }
  return { texture, opaque, twoSide, alpha };
}
