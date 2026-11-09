// @ts-nocheck
// The native methods of gdx-freetype's FreeType class (translated from gdx-freetype 1.14.0, src/gen), on the
// port's FreeType (ft.ts): what libgdx-freetype's JNI functions do with FreeType's objects, with Java's long
// pointers as handles (BigInts) to the port's objects. Registered in $J.natives by class and method name.
import { $J } from '../../jre/lang.ts';
import { ByteBuffer } from '../../jre/nio.ts';
import { Face, renderOutline, type Outline, type Bitmap } from './ft.ts';
import { strokeOutsideBorder } from './stroke.ts';

const objects = new Map<bigint, any>();
let next = 16n;
function handle(o: any): bigint {
  if (o == null) return 0n;
  if (o.$handle) return o.$handle;
  const h = (next += 16n);
  o.$handle = h;
  objects.set(h, o);
  return h;
}
/** One handle per object and kind of view (FreeType's slot, size and metrics are parts of their face). */
function view(o: any, key: string, make: () => any): bigint {
  return (o['$' + key] ??= handle(make()));
}
const obj = (h: bigint): any => {
  const o = objects.get(h);
  if (o === undefined) throw new Error('FreeType: no object at ' + h);
  return o;
};

/** A glyph (FT_Glyph): an outline, or a bitmap once rendered. */
type Glyph = { outline: Outline | null; bitmap: Bitmap | null; left: number; top: number };

const natives: Record<string, (...a: any[]) => any> = {
  'FreeType.getLastErrorCode': () => 0,
  'FreeType.initFreeTypeJni': () => handle({ library: true }),

  'FreeType$Library.doneFreeType': (lib: bigint) => { objects.delete(lib); },
  'FreeType$Library.newMemoryFace': (_lib: bigint, data: any, size: number, _faceIndex: number) => {
    const bytes = new Uint8Array(data.a.buffer, data.a.byteOffset + data.pos, size);
    const face = new Face(new Uint8Array(bytes)); // FreeType keeps reading the font's bytes: a copy
    return handle(face);
  },
  'FreeType$Library.strokerNew': () => handle({ radius: 0, lineCap: 0, lineJoin: 0, miterLimit: 0 }),

  'FreeType$Face.doneFace': (f: bigint) => { objects.delete(f); },
  'FreeType$Face.getFaceFlags': (f: bigint) => obj(f).faceFlags(),
  'FreeType$Face.getStyleFlags': () => 0,
  'FreeType$Face.getNumGlyphs': (f: bigint) => obj(f).sf.numGlyphs,
  'FreeType$Face.getAscender': (f: bigint) => obj(f).sf.ascender,
  'FreeType$Face.getDescender': (f: bigint) => obj(f).sf.descender,
  'FreeType$Face.getHeight': (f: bigint) => obj(f).sf.height,
  'FreeType$Face.getMaxAdvanceWidth': (f: bigint) => obj(f).sf.hhea.advanceWidthMax,
  'FreeType$Face.getMaxAdvanceHeight': (f: bigint) => obj(f).sf.height,
  'FreeType$Face.getUnderlinePosition': () => 0,
  'FreeType$Face.getUnderlineThickness': () => 0,
  'FreeType$Face.selectSize': () => false,
  'FreeType$Face.setCharSize': (f: bigint, w: number, h: number, _hr: number, _vr: number) =>
    obj(f).setPixelSizes(((w + 32) >> 6), ((h + 32) >> 6)),
  'FreeType$Face.setPixelSizes': (f: bigint, w: number, h: number) => obj(f).setPixelSizes(w, h),
  'FreeType$Face.loadGlyph': (f: bigint, gi: number, flags: number) => obj(f).loadGlyph(gi, flags),
  'FreeType$Face.loadChar': (f: bigint, c: number, flags: number) => obj(f).loadChar(c, flags),
  'FreeType$Face.getGlyph': (f: bigint) => view(obj(f), 'slot', () => ({ slotOf: obj(f) })),
  'FreeType$Face.getSize': (f: bigint) => view(obj(f), 'size', () => ({ face: obj(f) })),
  'FreeType$Face.hasKerning': (f: bigint) => obj(f).sf.kern != null,
  'FreeType$Face.getKerning': (f: bigint, l: number, r: number, _mode: number) => obj(f).kerning(l, r),
  'FreeType$Face.getCharIndex': (f: bigint, c: number) => obj(f).charIndex(c),

  'FreeType$Size.getMetrics': (s: bigint) => view(obj(s), 'metrics', () => ({ sizeOf: obj(s).face })),
  'FreeType$SizeMetrics.getXppem': (m: bigint) => obj(m).sizeOf.size.xPpem,
  'FreeType$SizeMetrics.getYppem': (m: bigint) => obj(m).sizeOf.size.yPpem,
  'FreeType$SizeMetrics.getXscale': (m: bigint) => obj(m).sizeOf.size.xScale,
  'FreeType$SizeMetrics.getYscale': (m: bigint) => obj(m).sizeOf.size.yScale,
  'FreeType$SizeMetrics.getAscender': (m: bigint) => obj(m).sizeOf.size.ascender,
  'FreeType$SizeMetrics.getDescender': (m: bigint) => obj(m).sizeOf.size.descender,
  'FreeType$SizeMetrics.getHeight': (m: bigint) => obj(m).sizeOf.size.height,
  'FreeType$SizeMetrics.getMaxAdvance': (m: bigint) => obj(m).sizeOf.size.maxAdvance,

  'FreeType$GlyphSlot.getMetrics': (s: bigint) => view(obj(s), 'metrics', () => ({ metricsOf: obj(s).slotOf })),
  'FreeType$GlyphSlot.getLinearHoriAdvance': (s: bigint) => obj(s).slotOf.slot.linearHoriAdvance,
  'FreeType$GlyphSlot.getLinearVertAdvance': () => 0,
  'FreeType$GlyphSlot.getAdvanceX': (s: bigint) => obj(s).slotOf.slot.advanceX,
  'FreeType$GlyphSlot.getAdvanceY': () => 0,
  'FreeType$GlyphSlot.getFormat': (s: bigint) => obj(s).slotOf.slot.format,
  'FreeType$GlyphSlot.getBitmap': (s: bigint) => {
    const sl = obj(s).slotOf.slot;
    sl.bitmap ??= renderOutline(sl.outline);
    return handle(sl.bitmap);
  },
  'FreeType$GlyphSlot.getBitmapLeft': (s: bigint) => (obj(s).slotOf.slot.bitmap ?? renderOutline(obj(s).slotOf.slot.outline)).left,
  'FreeType$GlyphSlot.getBitmapTop': (s: bigint) => (obj(s).slotOf.slot.bitmap ?? renderOutline(obj(s).slotOf.slot.outline)).top,
  'FreeType$GlyphSlot.renderGlyph': (s: bigint, _mode: number) => {
    const sl = obj(s).slotOf.slot;
    sl.bitmap = renderOutline(sl.outline);
    return true;
  },
  // FT_Get_Glyph: a copy of the slot's outline
  'FreeType$GlyphSlot.getGlyph': (s: bigint) => {
    const o = obj(s).slotOf.slot.outline;
    const g: Glyph = { outline: { x: o.x.slice(), y: o.y.slice(), tags: o.tags.slice(), contours: o.contours.slice() }, bitmap: null, left: 0, top: 0 };
    return handle(g);
  },

  'FreeType$Glyph.done': (g: bigint) => { objects.delete(g); },
  'FreeType$Glyph.strokeBorder': (g: bigint, st: bigint, inside: boolean) => {
    const gl: Glyph = obj(g), s = obj(st);
    if (inside) throw new Error('FreeType: inside borders are not in the port');
    const out = strokeOutsideBorder(gl.outline!, s.radius, s.lineCap, s.lineJoin, s.miterLimit);
    objects.delete(g);
    return handle({ outline: out, bitmap: null, left: 0, top: 0 });
  },
  'FreeType$Glyph.toBitmap': (g: bigint, _mode: number) => {
    const gl: Glyph = obj(g);
    if (gl.bitmap) return g;
    const bm = renderOutline(gl.outline!);
    objects.delete(g);
    return handle({ outline: null, bitmap: bm, left: bm.left, top: bm.top });
  },
  'FreeType$Glyph.getBitmap': (g: bigint) => handle(obj(g).bitmap),
  'FreeType$Glyph.getLeft': (g: bigint) => obj(g).left,
  'FreeType$Glyph.getTop': (g: bigint) => obj(g).top,

  'FreeType$Bitmap.getRows': (b: bigint) => obj(b).rows,
  'FreeType$Bitmap.getWidth': (b: bigint) => obj(b).width,
  'FreeType$Bitmap.getPitch': (b: bigint) => obj(b).pitch,
  'FreeType$Bitmap.getBuffer': (b: bigint) => {
    const bm: Bitmap = obj(b);
    return new ByteBuffer(new Int8Array(bm.buffer.buffer, bm.buffer.byteOffset, bm.rows * bm.pitch));
  },
  'FreeType$Bitmap.getNumGray': () => 256,
  'FreeType$Bitmap.getPixelMode': () => 2, // FT_PIXEL_MODE_GRAY

  'FreeType$GlyphMetrics.getWidth': (m: bigint) => obj(m).metricsOf.slot.metrics.width,
  'FreeType$GlyphMetrics.getHeight': (m: bigint) => obj(m).metricsOf.slot.metrics.height,
  'FreeType$GlyphMetrics.getHoriBearingX': (m: bigint) => obj(m).metricsOf.slot.metrics.horiBearingX,
  'FreeType$GlyphMetrics.getHoriBearingY': (m: bigint) => obj(m).metricsOf.slot.metrics.horiBearingY,
  'FreeType$GlyphMetrics.getHoriAdvance': (m: bigint) => obj(m).metricsOf.slot.metrics.horiAdvance,
  'FreeType$GlyphMetrics.getVertBearingX': (m: bigint) => obj(m).metricsOf.slot.metrics.vertBearingX,
  'FreeType$GlyphMetrics.getVertBearingY': (m: bigint) => obj(m).metricsOf.slot.metrics.vertBearingY,
  'FreeType$GlyphMetrics.getVertAdvance': (m: bigint) => obj(m).metricsOf.slot.metrics.vertAdvance,

  'FreeType$Stroker.set': (st: bigint, radius: number, lineCap: number, lineJoin: number, miterLimit: number) => {
    Object.assign(obj(st), { radius, lineCap, lineJoin, miterLimit });
  },
  'FreeType$Stroker.done': (st: bigint) => { objects.delete(st); },
};

for (const [k, f] of Object.entries(natives)) {
  $J.natives.set('com.badlogic.gdx.graphics.g2d.freetype.' + k, (_self: any, args: any[]) => f(...args));
}
