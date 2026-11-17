// Loads the display models as the original does (d_models.cc InitModels): compat.lua and models-32.lua
// (which runs models-2d.lua and models.lua) in a Lua state with the display functions of lua-display.cc.
import { newState } from '../lua/lib.ts';
import { LuaFunction, LuaTable, LuaUserdata, LuaError, type LuaValue } from '../lua/interp.ts';
import { AliasModel, Anim2d, CompositeModel, ImageModel, RandomModel, ShadowModel, type Display, type ImageRef, type Model } from './display.ts';

export interface ModelFiles {
  /** the text of a data file (compat.lua, models-32.lua, ...) */
  lua(name: string): string;
  /** width and height of an image (gfx32/<name>.png, falling back to gfx/) or null */
  imageSize(name: string): [number, number] | null;
}

interface Surface { file: string; x: number; y: number; w: number; h: number; overlay?: string[] }

export class OverlayModel extends ImageModel {}

export function loadModels(display: Display, files: ModelFiles): string[] {
  const L = newState();
  const errors: string[] = [];
  const G = L.G;
  const fn = (name: string, f: (a: LuaValue[]) => LuaValue[]) => new LuaFunction(f, name);
  const num = (v: LuaValue) => (typeof v === 'number' ? v : Number(v) || 0);
  const str = (v: LuaValue) => (typeof v === 'string' ? v : String(v));

  // ecl.Rect
  const rectMeta = new LuaTable();
  const rectMethods = new LuaTable();
  rectMethods.set('delete', fn('delete', () => []));
  rectMeta.set('__index', rectMethods);
  const ecl = new LuaTable();
  const rectClass = new LuaTable();
  rectClass.set('new', fn('new', (a) => {
    const t = new LuaTable();
    t.set('x', num(a[1])); t.set('y', num(a[2])); t.set('w', num(a[3])); t.set('h', num(a[4]));
    t.metatable = rectMeta;
    return [t];
  }));
  ecl.set('Rect', rectClass);
  G.set('ecl', ecl);
  const rectOf = (v: LuaValue) => { const t = v as LuaTable; return { x: num(t.get('x')), y: num(t.get('y')), w: num(t.get('w')), h: num(t.get('h')) }; };

  const surfMeta = new LuaTable();
  const surfMethods = new LuaTable();
  surfMethods.set('width', fn('width', (a) => [((a[0] as LuaUserdata).data as Surface).w]));
  surfMethods.set('height', fn('height', (a) => [((a[0] as LuaUserdata).data as Surface).h]));
  surfMeta.set('__index', surfMethods);
  const surface = (s: Surface) => { const u = new LuaUserdata(s); u.metatable = surfMeta; return u; };

  const img = (file: string, x: number, y: number, w: number, h: number, xoff: number, yoff: number, whole: boolean): ImageRef =>
    ({ file, x, y, w, h, xoff, yoff, whole });
  const mk = (name: string): Model => display.makeModel(name);

  const D = new LuaTable();
  D.set('DefineImage', fn('DefineImage', (a) => {
    const name = str(a[0]), fname = str(a[1]);
    const size = files.imageSize(fname);
    if (!size) return [1];
    const pad = num(a[4]);
    display.define(name, new ImageModel(img(fname, pad, pad, size[0] - 2 * pad, size[1] - 2 * pad, num(a[2]) + pad, num(a[3]) + pad, false)));
    return [0];
  }));
  D.set('DefineSubImage', fn('DefineSubImage', (a) => {
    const name = str(a[0]), fname = str(a[1]);
    if (!files.imageSize(fname)) return [1];
    const r = rectOf(a[4]);
    display.define(name, new ImageModel(img(fname, r.x, r.y, r.w, r.h, num(a[2]), num(a[3]), false)));
    return [0];
  }));
  D.set('DefineRandModel', fn('DefineRandModel', (a) => {
    const m = new RandomModel();
    const t = a[2] as LuaTable;
    for (let i = 1; i <= num(a[1]); i++) m.names.push(str(t.get(i)));
    display.define(str(a[0]), m);
    return [];
  }));
  D.set('DefineShadedModel', fn('DefineShadedModel', (a) => { display.define(str(a[0]), new ShadowModel(mk(str(a[1])), mk(str(a[2])))); return []; }));
  D.set('DefineOverlayImage', fn('DefineOverlayImage', (a) => {
    const t = a[2] as LuaTable;
    const names: string[] = [];
    for (let i = 1; i <= num(a[1]); i++) names.push(str(t.get(i)));
    const size = files.imageSize(names[0]);
    if (size) {
      const m = new OverlayModel(img(names[0], 0, 0, size[0], size[1], 0, 0, true));
      (m.img as ImageRef & { overlay?: string[] }).overlay = names.slice(1);
      display.define(str(a[0]), m);
    }
    return [];
  }));
  D.set('DefineComposite', fn('DefineComposite', (a) => { display.define(str(a[0]), new CompositeModel(mk(str(a[1])), mk(str(a[2])))); return []; }));
  let animName = '';
  let anim: Anim2d | null = null;
  D.set('DefineAnim', fn('DefineAnim', (a) => {
    anim = new Anim2d({ frames: [], loop: a[1] !== undefined && a[1] !== false });
    animName = str(a[0]);
    display.define(animName, anim);
    return [];
  }));
  D.set('AddFrame', fn('AddFrame', (a) => {
    if (str(a[0]) === animName && anim) anim.rep.frames.push({ model: mk(str(a[1])), duration: num(a[2]) / 1000.0 });
    return [];
  }));
  D.set('DefineAlias', fn('DefineAlias', (a) => { if (str(a[0]) !== str(a[1])) display.define(str(a[0]), new AliasModel(str(a[1]))); return []; }));
  G.set('display', D);

  G.set('GetSurface', fn('GetSurface', (a) => {
    const name = str(a[0]);
    const size = files.imageSize(name);
    if (!size) throw new LuaError(`GetSurface: image '${name}' not found`);
    return [surface({ file: name, x: 0, y: 0, w: size[0], h: size[1] })];
  }));
  G.set('CropSurface', fn('CropSurface', (a) => {
    const s = (a[0] as LuaUserdata).data as Surface;
    const r = rectOf(a[1]);
    return [surface({ file: s.file, x: s.x + r.x, y: s.y + r.y, w: r.w, h: r.h })];
  }));
  G.set('DefineImageModel', fn('DefineImageModel', (a) => {
    const s = (a[1] as LuaUserdata).data as Surface;
    display.define(str(a[0]), new ImageModel(img(s.file, s.x, s.y, s.w, s.h, 0, 0, false)));
    return [];
  }));
  G.set('DefineFont', fn('DefineFont', () => []));
  G.set('FindDataFile', fn('FindDataFile', (a) => [str(a[0])]));
  G.set('dofile', fn('dofile', (a) => L.doString(files.lua(str(a[0])), '@' + str(a[0]))));
  const enigma = new LuaTable();
  enigma.set('ShowLoadingScreen', fn('ShowLoadingScreen', () => []));
  G.set('enigma', enigma);

  for (const f of ['compat.lua', 'models-32.lua']) {
    try { L.doString(files.lua(f), '@' + f); } catch (e) { errors.push(`${f}: ${e instanceof LuaError ? String(e.value) : (e as Error).message}`); }
  }
  return errors;
}
