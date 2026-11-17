// C-Dogs SDL 2.5.0, translated: pictures (pic.c, cpic.c, pic_manager.c, blit.c's character colours,
// draw/char_sprites.c). GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
//
// A Pic keeps the original's pixels (RGBA, 8 bits per channel) so that everything the game computes from them
// (character colour channels, masked tiles, random pixel colours for debris) is the same; the browser texture is
// made from them when it is first drawn (platform/render.ts).
import {
  rand, cmod, svec2i, svec2i_zero, svec2i_scale_divide, svec2_assign_vec2i, MAX, colorWhite, ColorMult,
  ColorStr, StrColor, ColorTint, type Color, type Vec2, type Vec2i, type HSV,
} from './base.ts';
import { GetString, LoadInt, LoadStr, child, has, isObj, type Json } from './json.ts';
import type { RGBAImage } from '../platform/png.ts';

export interface Pic {
  size: Vec2i;
  offset: Vec2i;
  isHD: boolean;
  /** packed pixels, r | g << 8 | b << 16 | a << 24 (0 = fully transparent) */
  Data: Uint32Array;
  /** the browser texture, made on first use (platform/render.ts) */
  tex?: unknown;
  /** textures with a colour mask, by mask */
  texMasked?: Map<number, unknown>;
}

export function pixelToColor(p: number): Color {
  return { r: p & 255, g: (p >>> 8) & 255, b: (p >>> 16) & 255, a: p >>> 24 };
}
export function colorToPixel(c: Color): number {
  return ((c.r & 255) | ((c.g & 255) << 8) | ((c.b & 255) << 16) | ((c.a & 255) << 24)) >>> 0;
}

export function PicIsNone(p: Pic | null | undefined): boolean {
  return !p || p.size.x === 0 || p.size.y === 0 || !p.Data;
}
export function PicCopy(src: Pic): Pic {
  return { size: { ...src.size }, offset: { ...src.offset }, isHD: src.isHD, Data: new Uint32Array(src.Data) };
}
function PicPixelSize(p: Pic): Vec2i {
  return p.isHD ? { x: p.size.x * 2, y: p.size.y * 2 } : p.size;
}
/** PicGetRandomColor: a random non-transparent pixel */
export function PicGetRandomColor(p: Pic): Color {
  const size = PicPixelSize(p);
  for (;;) {
    const px = p.Data[cmod(rand(), size.x * size.y)];
    const c = pixelToColor(px);
    if (c.a > 0) return c;
  }
}
export function PicTrim(pic: Pic, xTrim: boolean, yTrim: boolean): void {
  const size = PicPixelSize(pic);
  const min = { x: size.x, y: size.y };
  const max = { x: 0, y: 0 };
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      if (pic.Data[x + y * size.x] > 0) {
        min.x = Math.min(min.x, x);
        min.y = Math.min(min.y, y);
        max.x = Math.max(max.x, x);
        max.y = Math.max(max.y, y);
      }
    }
  }
  const newSize = { x: size.x, y: size.y };
  const offset = { x: 0, y: 0 };
  if (min.x < max.x && min.y < max.y) {
    if (xTrim) {
      newSize.x = max.x - min.x + 1;
      offset.x = min.x;
    }
    if (yTrim) {
      newSize.y = max.y - min.y + 1;
      offset.y = min.y;
    }
  }
  PicShrink(pic, newSize, offset);
}
export function PicShrink(pic: Pic, size: Vec2i, offset: Vec2i): void {
  const data = new Uint32Array(size.x * size.y);
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      data[x + y * size.x] = pic.Data[x + offset.x + (y + offset.y) * pic.size.x];
    }
  }
  pic.Data = data;
  pic.size = { ...size };
  if (pic.isHD) pic.size = svec2i_scale_divide(pic.size, 2);
  pic.offset = svec2i_zero();
  pic.tex = undefined;
  pic.texMasked = undefined;
}

export function PicLoad(size: Vec2i, offset: Vec2i, image: RGBAImage, isHD: boolean): Pic {
  const p: Pic = { size: { ...size }, offset: svec2i_zero(), isHD, Data: new Uint32Array(size.x * size.y) };
  if (isHD) p.size = svec2i_scale_divide(p.size, 2);
  const d = image.data;
  for (let y = 0; y < size.y; y++) {
    for (let x = 0; x < size.x; x++) {
      const sx = offset.x + x;
      const sy = offset.y + y;
      if (sx >= image.width || sy >= image.height) continue;
      const si = (sy * image.width + sx) * 4;
      const a = d[si + 3];
      p.Data[y * size.x + x] = a === 0 ? 0 : (d[si] | (d[si + 1] << 8) | (d[si + 2] << 16) | (a << 24)) >>> 0;
    }
  }
  return p;
}

// ---------------------------------------------------------------------------------------------------------------
// blit.c: character colours

export interface CharColors {
  Skin: Color; Arms: Color; Body: Color; Legs: Color; Hair: Color; Feet: Color; Facehair: Color; Hat: Color;
  Glasses: Color;
}
export const CHAR_COLOR_SKIN = 0;
export const CHAR_COLOR_ARMS = 1;
export const CHAR_COLOR_BODY = 2;
export const CHAR_COLOR_LEGS = 3;
export const CHAR_COLOR_HAIR = 4;
export const CHAR_COLOR_FEET = 5;
export const CHAR_COLOR_FACEHAIR = 6;
export const CHAR_COLOR_HAT = 7;
export const CHAR_COLOR_GLASSES = 8;
export const CHAR_COLOR_COUNT = 9;
const CHAR_COLOR_KEYS: (keyof CharColors)[] = ['Skin', 'Arms', 'Body', 'Legs', 'Hair', 'Feet', 'Facehair', 'Hat', 'Glasses'];
export function CharColorGetByType(c: CharColors, t: number): Color {
  return c[CHAR_COLOR_KEYS[t] ?? 'Skin'];
}
export function CharColorSetByType(c: CharColors, t: number, v: Color): void {
  c[CHAR_COLOR_KEYS[t] ?? 'Skin'] = v;
}
export function CharColorTypeAlpha(t: number): number {
  return t < CHAR_COLOR_COUNT ? 254 - t : 255;
}
const CHAR_COLOR_THRESHOLD = 5;
export function CharColorTypeFromColor(c: Color, headPartColor: number): number {
  const abs = Math.abs;
  if (abs(c.r - c.g) < CHAR_COLOR_THRESHOLD && abs(c.g - c.b) < CHAR_COLOR_THRESHOLD &&
    abs(c.r - c.b) < CHAR_COLOR_THRESHOLD) return CHAR_COLOR_COUNT;
  if ((c.g < 5 && c.b < 5) || (abs(c.g - c.b) < 5 && c.r > 250)) return CHAR_COLOR_SKIN;
  else if ((c.r < 5 && c.b < 5) || (abs(c.r - c.b) < 5 && c.g > 250)) return headPartColor;
  else if ((c.r < 5 && c.g < 5) || (abs(c.r - c.g) < 5 && c.b > 250)) return CHAR_COLOR_ARMS;
  else if (c.b < 5 || (c.r > 250 && c.g > 250)) return CHAR_COLOR_BODY;
  else if (c.r < 5 || (c.g > 250 && c.b > 250)) return CHAR_COLOR_LEGS;
  else if (c.g < 5 || (c.r > 250 && c.b > 250)) return CHAR_COLOR_FEET;
  return CHAR_COLOR_COUNT;
}
export function CharColorsFromOneColor(color: Color): CharColors {
  return {
    Skin: color, Arms: color, Body: color, Legs: color, Hair: color, Feet: color, Facehair: color, Hat: color,
    Glasses: color,
  };
}
export function CharColorsGetChannelMask(c: CharColors, alpha: number): Color {
  switch (alpha) {
    case 255: return colorWhite;
    case 254: return c.Skin;
    case 253: return c.Arms;
    case 252: return c.Body;
    case 251: return c.Legs;
    case 250: return c.Hair;
    case 249: return c.Feet;
    case 248: return c.Facehair;
    case 247: return c.Hat;
    case 246: return c.Glasses;
    default: return colorWhite;
  }
}
export function CharColorsGetMaskedName(base: string, c: CharColors): string {
  return [base, c.Skin, c.Arms, c.Body, c.Legs, c.Hair, c.Feet, c.Facehair, c.Hat, c.Glasses]
    .map((x, i) => (i === 0 ? (x as string) : ColorStr(x as Color))).join('/');
}

// ---------------------------------------------------------------------------------------------------------------
// pic_manager.c

export interface NamedPic { pic: Pic; name: string }
export interface NamedSprites { pics: Pic[]; name: string }

export const HEAD_PART_HAIR = 0;
export const HEAD_PART_FACEHAIR = 1;
export const HEAD_PART_HAT = 2;
export const HEAD_PART_GLASSES = 3;
export const HEAD_PART_COUNT = 4;

export class PicManager {
  pics = new Map<string, NamedPic>();
  sprites = new Map<string, NamedSprites>();
  customPics = new Map<string, NamedPic>();
  customSprites = new Map<string, NamedSprites>();
  headPartNames: string[][] = [[], [], [], []];
  wallStyleNames: string[] = [];
  tileStyleNames: string[] = [];
  exitStyleNames: string[] = [];
  doorStyleNames: string[] = [];
  keyStyleNames: string[] = [];
}
export const gPicManager = new PicManager();

/** PicManagerAdd: name is the path without extension, e.g. "chars/heads/jones" or "fireball_24x21" */
export function PicManagerAdd(pics: Map<string, NamedPic>, sprites: Map<string, NamedSprites>, name: string,
  image: RGBAImage, isHD = false): void {
  let buf = name;
  let size = svec2i(image.width, image.height);
  let isSpritesheet = false;
  const us = buf.lastIndexOf('_');
  const xi = buf.lastIndexOf('x');
  if (us >= 0 && xi >= 0 && us + 1 < xi && xi + 1 < buf.length) {
    // sscanf(underscore, "_%dx%d", &size.x, &size.y) == 2
    const m = /^_([+-]?\d+)x([+-]?\d+)/.exec(buf.slice(us));
    if (m) {
      size = svec2i(parseInt(m[1], 10), parseInt(m[2], 10));
      buf = buf.slice(0, us);
      isSpritesheet = true;
    }
  }
  let nsp: NamedSprites | null = null;
  let np: NamedPic | null = null;
  if (isSpritesheet) {
    nsp = { pics: [], name: buf };
    sprites.set(buf, nsp);
  } else {
    np = { pic: { size: svec2i_zero(), offset: svec2i_zero(), isHD: false, Data: new Uint32Array(0) }, name: buf };
    pics.set(buf, np);
  }
  for (let oy = 0; oy < image.height; oy += size.y) {
    for (let ox = 0; ox < image.width; ox += size.x) {
      const pic = PicLoad(size, { x: ox, y: oy }, image, isHD);
      if (isSpritesheet) nsp!.pics.push(pic);
      else np!.pic = pic;
      if (buf.startsWith('chars/')) {
        const sub = buf.slice('chars/'.length);
        let headPartColor = CHAR_COLOR_HAIR;
        if (sub.startsWith('facehairs/')) headPartColor = CHAR_COLOR_FACEHAIR;
        else if (sub.startsWith('hats/')) headPartColor = CHAR_COLOR_HAT;
        else if (sub.startsWith('glasses/')) headPartColor = CHAR_COLOR_GLASSES;
        for (let i = 0; i < pic.size.x * pic.size.y; i++) {
          const c = pixelToColor(pic.Data[i]);
          if (c.a !== 255) continue;
          const t = CharColorTypeFromColor(c, headPartColor);
          if (t !== CHAR_COLOR_COUNT) {
            const v = Math.max(c.r, c.g, c.b);
            pic.Data[i] = colorToPixel({ r: v, g: v, b: v, a: CharColorTypeAlpha(t) });
          }
        }
      }
    }
  }
}

function MaybeAddStyleName(picName: string, prefix: string, styleNames: string[]): void {
  if (!picName.startsWith(prefix)) return;
  let next = picName.indexOf('/', prefix.length);
  if (next < 0) next = picName.length;
  const s = picName.slice(prefix.length, next);
  if (styleNames.includes(s)) return;
  styleNames.push(s);
}
function cmpStr(a: string, b: string): number {
  return a < b ? -1 : a > b ? 1 : 0;
}
export function PicManagerAfterAdd(pm: PicManager = gPicManager): void {
  const hp = [['chars/hairs/', HEAD_PART_HAIR], ['chars/facehairs/', HEAD_PART_FACEHAIR], ['chars/hats/', HEAD_PART_HAT],
    ['chars/glasses/', HEAD_PART_GLASSES]] as const;
  for (const [prefix, part] of hp) {
    const names: string[] = [];
    for (const m of [pm.customSprites, pm.sprites]) for (const ns of m.values()) MaybeAddStyleName(ns.name, prefix, names);
    names.sort(cmpStr);
    pm.headPartNames[part] = names;
  }
  const styles = [['wall/', 'wallStyleNames'], ['tile/', 'tileStyleNames'], ['exits/', 'exitStyleNames'],
    ['door/', 'doorStyleNames'], ['keys/', 'keyStyleNames']] as const;
  for (const [prefix, key] of styles) {
    const names: string[] = [];
    for (const m of [pm.customPics, pm.pics]) for (const np of m.values()) MaybeAddStyleName(np.name, prefix, names);
    names.sort(cmpStr);
    pm[key] = names;
  }
}
export function PicManagerClearCustom(pm: PicManager = gPicManager): void {
  pm.customPics.clear();
  pm.customSprites.clear();
  PicManagerAfterAdd(pm);
}
export function PicManagerGetNamedPic(pm: PicManager, name: string): NamedPic | null {
  return pm.customPics.get(name) ?? pm.pics.get(name) ?? null;
}
export function PicManagerGetPic(pm: PicManager, name: string): Pic | null {
  return PicManagerGetNamedPic(pm, name)?.pic ?? null;
}
export function PicManagerGetSprites(pm: PicManager, name: string): NamedSprites | null {
  return pm.customSprites.get(name) ?? pm.sprites.get(name) ?? null;
}
function GetMaskedName(name: string, mask: Color, maskAlt: Color): string {
  return `${name}/${ColorStr(mask)}/${ColorStr(maskAlt)}`;
}
export function PicManagerGetMaskedStylePic(pm: PicManager, name: string, style: string, type: string, mask: Color,
  maskAlt: Color): NamedPic | null {
  return PicManagerGetNamedPic(pm, GetMaskedName(`${name}/${style}/${type}`, mask, maskAlt));
}
export function PicManagerGenerateMaskedStylePic(pm: PicManager, name: string, style: string, type: string,
  mask: Color, maskAlt: Color, noAltMask: boolean): void {
  const base = `${name}/${style}/${type}`;
  const maskedName = GetMaskedName(base, mask, maskAlt);
  if (PicManagerGetPic(pm, maskedName) != null) return;
  const original = PicManagerGetPic(pm, base);
  if (original == null) return;
  const p = PicCopy(original);
  for (let i = 0; i < p.size.x * p.size.y; i++) {
    let c = pixelToColor(original.Data[i]);
    if (c.g <= 2 && c.b <= 2 && !noAltMask) {
      c.g = c.r;
      c.b = c.r;
      c = ColorMult(c, maskAlt);
    } else if (c.r === c.g && c.g === c.b) {
      c = ColorMult(c, mask);
    }
    p.Data[i] = colorToPixel(c);
  }
  pm.customPics.set(maskedName, { pic: p, name: maskedName });
  PicManagerAfterAdd(pm);
}
export function PicManagerGetCharSprites(pm: PicManager, name: string, colors: CharColors): NamedSprites | null {
  const buf = CharColorsGetMaskedName(name, colors);
  const ns = PicManagerGetSprites(pm, buf);
  if (ns != null) return ns;
  const ons = PicManagerGetSprites(pm, name);
  if (ons == null) return null;
  const nsp: NamedSprites = { pics: [], name: buf };
  pm.customSprites.set(buf, nsp);
  for (const op of ons.pics) {
    const p = PicCopy(op);
    for (let i = 0; i < p.size.x * p.size.y; i++) {
      if (op.Data[i] === 0) continue;
      const c = pixelToColor(op.Data[i]);
      p.Data[i] = colorToPixel(ColorMult(c, CharColorsGetChannelMask(colors, c.a)));
    }
    nsp.pics.push(p);
  }
  // the original calls AfterAdd here too; it finds no new style names (a masked head part's name starts with the
  // head part's own), so the port leaves it out
  return nsp;
}
function styleIndex(names: string[], style: string): number {
  const i = names.indexOf(style);
  return i < 0 ? 0 : i;
}
export const PicManagerGetWallStyleIndex = (pm: PicManager, s: string): number => styleIndex(pm.wallStyleNames, s);
export const PicManagerGetTileStyleIndex = (pm: PicManager, s: string): number => styleIndex(pm.tileStyleNames, s);
export const PicManagerGetExitStyleIndex = (pm: PicManager, s: string): number => styleIndex(pm.exitStyleNames, s);
export const PicManagerGetDoorStyleIndex = (pm: PicManager, s: string): number => styleIndex(pm.doorStyleNames, s);
export const PicManagerGetKeyStyleIndex = (pm: PicManager, s: string): number => styleIndex(pm.keyStyleNames, s);

// ---------------------------------------------------------------------------------------------------------------
// cpic.c

export const PICTYPE_NORMAL = 0;
export const PICTYPE_DIRECTIONAL = 1;
export const PICTYPE_ANIMATED = 2;
export const PICTYPE_ANIMATED_RANDOM = 3;

export interface CPic {
  Type: number;
  /** PICTYPE_NORMAL */
  Pic: Pic | null;
  /** PICTYPE_DIRECTIONAL and the animated types */
  Sprites: Pic[] | null;
  Count: number;
  Frame: number;
  TicksPerFrame: number;
  Mask: Color;
}
export function CPicNew(): CPic {
  return { Type: PICTYPE_NORMAL, Pic: null, Sprites: null, Count: 0, Frame: 0, TicksPerFrame: 0, Mask: { r: 0, g: 0, b: 0, a: 0 } };
}
export function CPicClone(p: CPic): CPic {
  return { ...p, Mask: { ...p.Mask } };
}
export function StrPicType(s: string): number {
  switch (s) {
    case 'Normal': return PICTYPE_NORMAL;
    case 'Directional': return PICTYPE_DIRECTIONAL;
    case 'Animated': return PICTYPE_ANIMATED;
    case 'AnimatedRandom': return PICTYPE_ANIMATED_RANDOM;
    default: return PICTYPE_NORMAL;
  }
}

export function CPicLoadJSON(p: CPic, node: Json | undefined): void {
  p.Type = StrPicType(GetString(node, 'Type'));
  switch (p.Type) {
    case PICTYPE_NORMAL:
      p.Pic = PicManagerGetPic(gPicManager, GetString(node, 'Pic'));
      break;
    case PICTYPE_DIRECTIONAL: {
      const s = LoadStr(node, 'Sprites');
      if (s == null) return;
      p.Sprites = PicManagerGetSprites(gPicManager, s)?.pics ?? null;
      break;
    }
    case PICTYPE_ANIMATED:
    case PICTYPE_ANIMATED_RANDOM: {
      const s = LoadStr(node, 'Sprites');
      if (s == null) return;
      p.Sprites = PicManagerGetSprites(gPicManager, s)?.pics ?? null;
      p.Count = LoadInt(node, 'Count', p.Count);
      p.TicksPerFrame = MAX(LoadInt(node, 'TicksPerFrame', p.TicksPerFrame), 0);
      if (p.Type === PICTYPE_ANIMATED_RANDOM) p.Frame = cmod(rand(), p.Sprites!.length);
      break;
    }
    default:
      break;
  }
  LoadMaskTint(p, node);
}
export function CPicInitNormal(p: CPic, pic: Pic | null): void {
  p.Type = PICTYPE_NORMAL;
  p.Pic = pic;
  p.Mask = { ...colorWhite };
}
export function CPicInitNormalFromName(p: CPic, name: string): void {
  CPicInitNormal(p, PicManagerGetPic(gPicManager, name));
}
/** CPicLoadNormal: node is the pic name string */
export function CPicLoadNormal(p: CPic, node: Json | undefined): void {
  p.Type = PICTYPE_NORMAL;
  p.Pic = PicManagerGetPic(gPicManager, typeof node === 'string' ? node : '');
  p.Mask = { ...colorWhite };
}
function LoadMaskTint(p: CPic, node: Json | undefined): void {
  p.Mask = { ...colorWhite };
  if (has(node, 'Mask')) {
    p.Mask = StrColor(GetString(node, 'Mask'));
  } else if (has(node, 'Tint')) {
    const t = child(node, 'Tint');
    if (Array.isArray(t)) {
      const hsv: HSV = { h: Number(t[0]), s: Number(t[1]), v: Number(t[2]) };
      p.Mask = ColorTint(colorWhite, hsv);
      p.Mask.a = 0x40;
    }
  }
}
export function CPicIsLoaded(p: CPic): boolean {
  return p.Type === PICTYPE_NORMAL ? p.Pic != null : p.Sprites != null;
}
export function CPicGetSize(p: CPic): Vec2i {
  const pic = CPicGetPic(p, 0);
  return pic == null ? svec2i_zero() : pic.size;
}
/** CPicCopyPic: a copy; random animations start at a random frame */
export function CPicCopyPic(src: CPic): CPic {
  const dest = CPicClone(src);
  if (dest.Type === PICTYPE_ANIMATED_RANDOM) dest.Frame = cmod(rand(), dest.Sprites!.length);
  return dest;
}
export function CPicUpdate(p: CPic, ticks: number): void {
  switch (p.Type) {
    case PICTYPE_ANIMATED:
      p.Count += ticks;
      if (p.TicksPerFrame > 0) {
        while (p.Count >= p.TicksPerFrame) {
          p.Frame++;
          p.Count -= p.TicksPerFrame;
        }
        while (p.Frame >= p.Sprites!.length) p.Frame -= p.Sprites!.length;
      }
      break;
    case PICTYPE_ANIMATED_RANDOM:
      if (p.Count === 0) p.Frame = cmod(rand(), p.Sprites!.length);
      p.Count += ticks;
      if (p.TicksPerFrame > 0 && p.Count >= p.TicksPerFrame) {
        p.Frame = cmod(rand(), p.Sprites!.length);
        p.Count = 0;
      }
      break;
    default:
      break;
  }
}
export function CPicGetPic(p: CPic, idx: number): Pic | null {
  switch (p.Type) {
    case PICTYPE_NORMAL:
      return p.Pic;
    case PICTYPE_DIRECTIONAL:
      return p.Sprites != null ? p.Sprites[idx] ?? null : null;
    default:
      if (p.Sprites == null || p.Frame < 0 || p.Frame >= p.Sprites.length) return null;
      return p.Sprites[p.Frame];
  }
}

// ---------------------------------------------------------------------------------------------------------------
// draw/char_sprites.c

export const BODY_PART_HEAD = 0;
export const BODY_PART_HAIR = 1;
export const BODY_PART_FACEHAIR = 2;
export const BODY_PART_HAT = 3;
export const BODY_PART_GLASSES = 4;
export const BODY_PART_BODY = 5;
export const BODY_PART_LEGS = 6;
export const BODY_PART_GUN_R = 7;
export const BODY_PART_GUN_L = 8;
export const BODY_PART_COUNT = 9;
export function StrBodyPart(s: string): number {
  // utils.c StrBodyPart: the names as the sprite JSONs write them (lower case)
  switch (s) {
    case 'head': return BODY_PART_HEAD;
    case 'hair': return BODY_PART_HAIR;
    case 'facehair': return BODY_PART_FACEHAIR;
    case 'hat': return BODY_PART_HAT;
    case 'glasses': return BODY_PART_GLASSES;
    case 'body': return BODY_PART_BODY;
    case 'legs': return BODY_PART_LEGS;
    case 'gun_r': return BODY_PART_GUN_R;
    case 'gun_l': return BODY_PART_GUN_L;
    default: return BODY_PART_HEAD;
  }
}

export interface CharSprites {
  Name: string;
  /** Order[dir][i], i < BODY_PART_COUNT + MAX_BARRELS - 1 */
  Order: number[][];
  Offsets: {
    Frame: Map<string, Vec2i[]>[];
    Dir: Vec2[][];
  };
}
export const gCharSpriteClasses = { classes: new Map<string, CharSprites>(), customClasses: new Map<string, CharSprites>() };
export function StrCharSpriteClass(s: string): CharSprites | null {
  return gCharSpriteClasses.customClasses.get(s) ?? gCharSpriteClasses.classes.get(s) ??
    (s !== 'base' ? StrCharSpriteClass('base') : null);
}
function findPath(node: Json, path: string): Json | undefined {
  let n: Json | undefined = node;
  for (const k of path.split('/')) {
    if (!isObj(n)) return undefined;
    n = n[k];
  }
  return n;
}
/** CharSpritesLoadJSON: a body's data.json */
export function CharSpritesLoadJSON(name: string, root: Json): CharSprites {
  const order: number[][] = [];
  const orderNode = findPath(root, 'Order') as Json[];
  for (let d = 0; d < 8; d++) {
    const od = orderNode[d] as Json[];
    const o: number[] = new Array(BODY_PART_COUNT + 1).fill(0);
    let i = 0;
    for (let bp = BODY_PART_HEAD; bp < BODY_PART_COUNT; bp++) {
      o[bp] = StrBodyPart(String(od[i]));
      i++;
      if (o[bp] === BODY_PART_HEAD) {
        o[++bp] = BODY_PART_FACEHAIR;
        o[++bp] = BODY_PART_GLASSES;
        o[++bp] = BODY_PART_HAIR;
        o[++bp] = BODY_PART_HAT;
      }
    }
    order.push(o);
  }
  const frameOffsets = (path: string): Map<string, Vec2i[]> => {
    const m = new Map<string, Vec2i[]>();
    const obj = findPath(root, path);
    if (isObj(obj)) {
      for (const k of Object.keys(obj)) {
        const a = obj[k] as Json[];
        m.set(k, a.map((v) => { const vv = v as number[]; return { x: vv[0] | 0, y: vv[1] | 0 }; }));
      }
    }
    return m;
  };
  const dirOffsets = (path: string): Vec2[] | null => {
    const a = findPath(root, path);
    if (!Array.isArray(a)) return null;
    const out: Vec2[] = [];
    for (let d = 0; d < 8; d++) {
      const v = a[d] as number[];
      out.push(svec2_assign_vec2i({ x: v[0] | 0, y: v[1] | 0 }));
    }
    return out;
  };
  const zero8 = (): Vec2[] => Array.from({ length: 8 }, () => ({ x: 0, y: 0 }));
  const Frame: Map<string, Vec2i[]>[] = [];
  const head = frameOffsets('Offsets/Frame/Head');
  for (let bp = BODY_PART_HEAD; bp <= BODY_PART_GLASSES; bp++) Frame[bp] = head;
  Frame[BODY_PART_BODY] = frameOffsets('Offsets/Frame/Body');
  Frame[BODY_PART_LEGS] = frameOffsets('Offsets/Frame/Legs');
  Frame[BODY_PART_GUN_R] = frameOffsets('Offsets/Frame/Gun');
  Frame[BODY_PART_GUN_L] = Frame[BODY_PART_GUN_R];
  const Dir: Vec2[][] = [];
  Dir[BODY_PART_HEAD] = dirOffsets('Offsets/Dir/Head') ?? zero8();
  for (let bp = BODY_PART_HEAD + 1; bp <= BODY_PART_GLASSES; bp++) Dir[bp] = Dir[BODY_PART_HEAD];
  Dir[BODY_PART_BODY] = dirOffsets('Offsets/Dir/Body') ?? zero8();
  Dir[BODY_PART_LEGS] = dirOffsets('Offsets/Dir/Legs') ?? zero8();
  Dir[BODY_PART_GUN_R] = dirOffsets('Offsets/Dir/Gun') ?? zero8();
  Dir[BODY_PART_GUN_L] = Dir[BODY_PART_GUN_R];
  return { Name: name, Order: order, Offsets: { Frame, Dir } };
}
export function CharSpritesGetOffset(offsets: Map<string, Vec2i[]>, anim: string, frame: number): Vec2i {
  const a = offsets.get(anim) ?? offsets.get('idle');
  if (!a) return svec2i_zero();
  return a[frame % a.length];
}

