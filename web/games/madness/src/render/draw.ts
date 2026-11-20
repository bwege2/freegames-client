// Madness Interactive Reloaded port (GPL-3.0). What the systems' renderers draw each frame: the backgrounds,
// characters (QuadShapeComponent / ApparelSpriteComponent), weapons, doors, decals, flipbook effects, casings and
// tracers (BulletTracerSystem), in world space; and Walgelijk's Draw.Text with MIR's .wf fonts in screen space.
import { unzipSync, strFromU8 } from 'fflate';
import { mmul, type Mat } from '../engine/matrix.ts';
import { clamp, Easings, lerp, type Vec2 } from '../engine/util.ts';
import { Layer } from '../game/character.ts';
import type { Scene } from '../game/scene.ts';
import { Mode, type Renderer } from './gl.ts';

type C4 = [number, number, number, number];
export const hexColor = (h: string, a = 1): C4 => {
  const s = h.replace('#', '');
  const n = (i: number): number => parseInt(s.slice(i, i + 2), 16) / 255;
  return [n(0), n(2), n(4), s.length >= 8 ? n(6) * a : a];
};

const UNIT: [number, number][] = [[-0.5, -0.5], [0.5, -0.5], [0.5, 0.5], [-0.5, 0.5]];
function corners(m: Readonly<Mat>): [number, number, number, number, number, number, number, number] {
  const out: number[] = [];
  for (const [x, y] of UNIT) out.push(x * m[0] + y * m[2] + m[4], x * m[1] + y * m[3] + m[5]);
  return out as [number, number, number, number, number, number, number, number];
}
function uvs(hflip: boolean, vflip: boolean, u0 = 0, v0 = 0, u1 = 1, v1 = 1): [number, number, number, number, number, number, number, number] {
  let a = u0, b = u1, c = v0, d = v1;
  if (hflip) [a, b] = [b, a];
  if (vflip) [c, d] = [d, c];
  return [a, c, b, c, b, d, a, d];
}
const rectMat = (x: number, y: number, w: number, h: number, rotDeg = 0): Mat => {
  const r = rotDeg * Math.PI / 180;
  const cs = Math.cos(r), sn = Math.sin(r);
  return [w * cs, w * sn, -h * sn, h * cs, x, y];
};

export function drawScene(r: Renderer, s: Scene, real: number): void {
  for (const b of s.backgrounds) {
    const t = r.textures.get(b.texture);
    if (!t) continue;
    const m = rectMat(b.center.x, b.center.y, t.w * b.scale, t.h * b.scale);
    r.quad(b.texture, corners(m), uvs(false, false), [1, 1, 1, 1], Mode.BgBehind, Layer.BackgroundBehind, -1);
    r.quad(b.texture, corners(m), uvs(false, false), [1, 1, 1, 1], Mode.BgFront, Layer.BackgroundInFront, 1);
  }
  for (const p of s.props) {
    const frames = p.columns * p.rows;
    const f = Number.isFinite(p.duration) && frames > 1 ? Math.floor(((s.clock.time / p.duration) % 1) * frames) : 0;
    const col = f % p.columns;
    const row = Math.floor(f / p.columns);
    const u0 = col / p.columns, v0 = (p.rows - 1 - row) / p.rows;
    r.quad(p.texture, corners(rectMat(p.pos.x, p.pos.y, p.size.x, p.size.y, p.rot)), uvs(false, false, u0, v0, u0 + 1 / p.columns, v0 + 1 / p.rows), p.tint, Mode.AlphaClip, p.layer, p.order);
  }
  for (const d of s.doors) {
    const prog = Easings.quadInOut(clamp(s.clock.time - d.changedAt, 0, 0.4) / 0.4);
    const pr = d.isOpen ? prog : 1 - prog;
    r.quad(d.texture, [d.bottomLeft.x, d.bottomLeft.y, d.bottomRight.x, d.bottomRight.y, d.topRight.x, d.topRight.y, d.topLeft.x, d.topLeft.y],
      [0, 0, 1, 0, 1, 1, 0, 1], [1, 1, 1, 1], Mode.Door, Layer.BackgroundBehind, 1, [pr, d.horizontal ? 1 : 0, 0, 0]);
  }
  for (const d of s.decals) {
    const tex = d.blood ? 'textures/decals/blood_splat.qoi' : 'textures/decals/bullet_hole.qoi';
    const cols = d.blood ? 10 : 5;
    const u0 = d.index / cols;
    r.quad(tex, corners(rectMat(d.pos.x, d.pos.y, d.scale.x, d.scale.y, d.rot)), uvs(false, false, u0, 0, u0 + 1 / cols, 1), hexColor(d.color),
      Mode.Sprite, d.front ? 300 : -100, d.front ? 50 : 9);
  }
  const extra: import('../game/extras.ts').DrawItem[] = [];
  s.extras.draw(extra);
  for (const c of s.characters) if (c.rich && !c.removed) c.rich.draw(s, c, extra);
  for (const d of extra) {
    const uv = d.uv ?? [0, 0, 1, 1];
    r.quad(d.tex, corners(d.m), uvs(false, false, uv[0], uv[1], uv[2], uv[3]), d.color, d.mode, d.layer, d.order, d.p);
  }
  for (const st of s.stamps) for (const sp of st.sprites) r.quad(sp.texture, corners(sp.matrix), uvs(sp.hflip, sp.vflip), [1, 1, 1, 1], Mode.Sprite, sp.layer, sp.order);
  for (const c of s.characters) {
    const tint: C4 = [c.tint[0], c.tint[1], c.tint[2], 1];
    for (const sp of s.characterSprites(c)) r.quad(sp.texture, corners(c.teleportTransform ? mmul(sp.matrix, c.teleportTransform) : sp.matrix), uvs(sp.hflip, sp.vflip), tint, Mode.Sprite, sp.layer, sp.order);
    if (c.holyShield) {
      // HolyShieldAbilityComponent: the shield and its glow, turned to the aim
      const h = c.holyShield;
      const ang = Math.atan2(h.dir.y * 0.5, h.dir.x);
      const sy = Math.sign(h.dir.x) || 1;
      for (const [tex, a] of [['textures/holy_shield_glow.qoi', 0.5 + h.flash * 0.5], ['textures/holy_shield.qoi', 1]] as [string, number][]) {
        const t = r.textures.get(tex);
        if (!t) continue;
        const m: Mat = mmul([t.w * 0.5, 0, 0, t.h * 0.5 * sy, 0, 0], [Math.cos(ang), Math.sin(ang), -Math.sin(ang), Math.cos(ang), h.pos.x, h.pos.y]);
        r.quad(tex, corners(m), uvs(false, false), [1, 1, 1, a * h.visibility], Mode.Sprite, Layer.Effects, 0);
      }
    }
    if (c.auditorFire && c.isAlive) {
      // AuditorFireSystem: the burning head and body flipbooks (6 x 4, 24 frames per second)
      const f = Math.floor((s.clock.time % 1) * 24);
      const u0 = (f % 6) / 6, v0 = (3 - Math.floor(f / 6)) / 4;
      for (const [tex, part] of [['textures/auditorHead_4x6.png', c.positioning.head], ['textures/auditorBody_4x6.png', c.positioning.body]] as const) {
        const t = r.textures.get(tex);
        if (!t) continue;
        const ctr = part.transform.position;
        const m: Mat = mmul([t.w / 6 * 2.7 * c.positioning.flipScaling, 0, 0, t.h / 4 * 2.7, 0, 0], [Math.cos(part.globalRotation * Math.PI / 180), Math.sin(part.globalRotation * Math.PI / 180), -Math.sin(part.globalRotation * Math.PI / 180), Math.cos(part.globalRotation * Math.PI / 180), ctr.x, ctr.y]);
        r.quad(tex, corners(m), uvs(false, false, u0, v0, u0 + 1 / 6, v0 + 1 / 4), [1, 1, 1, 1], Mode.AlphaClip, part.renderer.layer, part.renderer.order + 60);
      }
    }
    for (const part of [c.positioning.head, c.positioning.body]) {
      const wounds = s.wounds.get(part);
      if (!wounds) continue;
      let m = part.transform.localToWorld;
      if (part.renderer.additional) m = mmul(m, part.renderer.additional);
      const blood = hexColor(c.look.bloodColour);
      for (const w of wounds) {
        const x = clamp(part.renderer.hflip ? -w.p.x : w.p.x, -0.33, 0.33);
        const y = clamp(w.p.y, -0.4, 0.4);
        const rad = Math.max(0.02, w.size * 0.25);
        const sx = rad * (w.slash ? 2.5 : 1);
        const local: Mat = [sx, 0, 0, rad, x, y];
        r.quad('#wound', corners(mmul(local, m)), uvs(false, false), [blood[0] * 0.45, 0, 0, 1], Mode.Sprite, part.renderer.layer, part.renderer.order + 50);
      }
    }
  }
  for (const w of s.weapons) {
    if (w.removed) continue;
    let layer = w.layer, order = w.order;
    if (w.stuckInside) { layer = Layer.RagdollsLower; order = -100; } else if (w.isAttachedToWall) { layer = Layer.BackgroundBehind; order = 1; } else if (!w.wielder) { layer = 0; order = 0; }
    r.quad(w.instr.baseTexture, corners(w.sprite.localToWorld), uvs(false, false), [1, 1, 1, 1], Mode.Sprite, layer, order);
    for (const p of w.parts) if (p.visible) r.quad(p.texture, corners(p.transform.localToWorld), uvs(false, false), [1, 1, 1, 1], Mode.Sprite, layer, order + 1);
  }
  for (const e of s.fx) {
    const frames = e.columns * e.rows;
    const f = Math.min(frames - 1, Math.floor(frames * (e.time / e.duration)));
    const u0 = (f % e.columns) / e.columns;
    const color: C4 = e.tint ? hexColor(e.tint) : [1, 1, 1, 1];
    r.quad(e.texture, corners(rectMat(e.pos.x, e.pos.y, e.size.x, e.size.y, e.rot)), uvs(false, false, u0, 0, u0 + 1 / e.columns, 1), color, Mode.AlphaClip, e.layer, e.order);
  }
  for (const c of s.casings) {
    const u0 = c.frame / c.columns;
    r.quad(c.texture, corners(rectMat(c.pos.x, c.pos.y, c.size, c.size, c.rot)), uvs(false, false, u0, 0, u0 + 1 / c.columns, 1), [1, 1, 1, 1], Mode.Sprite, -100, 10);
  }
  for (const t of s.tracers) {
    const d = Math.hypot(t.to.x - t.from.x, t.to.y - t.from.y);
    const p = clamp((0.07 - t.life) / 0.07 / (d / 5000));
    const a = { x: lerp(t.from.x, t.to.x, p), y: lerp(t.from.y, t.to.y, p) };
    const q = clamp(p + s.clock.timeScale);
    const b = { x: lerp(t.from.x, t.to.x, q), y: lerp(t.from.y, t.to.y, q) };
    line(r, a, b, 3, [1, 1, 1, 1], Layer.Effects, 0);
  }
  if (s.accurateShot) {
    const a = s.accurateShot;
    const w = a.origin.equipped;
    if (w) {
      const progress = a.time / a.lifespan;
      const pl = progress * progress;
      const target = a.origin.aimTargetPosition;
      line(r, w.transform.position, target, 5, [1, 1, 1, 1 - clamp(pl * 40)], 300, 100);
      const c: C4 = progress > 0.1 ? [1, 0, 0, 1] : [1, 1, 1, 1];
      c[3] = Math.max(clamp(1 - progress * 10), pl);
      const size = 3000;
      const fill = size * (1 - (progress > 0.1 ? progress : 1));
      for (const [dx, dy] of [[0, 1], [0, -1], [1, 0], [-1, 0]]) line(r, { x: target.x + dx * fill, y: target.y + dy * fill }, { x: target.x + dx * size, y: target.y + dy * size }, 9, c, 300, 100);
    }
  }
  void real;
}

export function line(r: Renderer, a: Vec2, b: Vec2, width: number, color: C4, layer: number, order: number): void {
  const dx = b.x - a.x, dy = b.y - a.y;
  const l = Math.hypot(dx, dy);
  if (l <= 0) return;
  const nx = -dy / l * width / 2, ny = dx / l * width / 2;
  r.quad(null, [a.x - nx, a.y - ny, b.x - nx, b.y - ny, b.x + nx, b.y + ny, a.x + nx, a.y + ny], [0, 0, 1, 0, 1, 1, 0, 1], color, Mode.Solid, layer, order);
}
export function rectFill(r: Renderer, x: number, y: number, w: number, h: number, color: C4, layer = 350, order = 0): void {
  r.quad(null, [x, y, x + w, y, x + w, y + h, x, y + h], [0, 0, 1, 0, 1, 1, 0, 1], color, Mode.Solid, layer, order);
}
/** an image in screen space (y down) */
export function image(r: Renderer, tex: string, x: number, y: number, w: number, h: number, color: C4 = [1, 1, 1, 1], layer = 350, order = 0): void {
  r.quad(tex, [x, y + h, x + w, y + h, x + w, y, x, y], [0, 0, 1, 0, 1, 1, 0, 1], color, Mode.Sprite, layer, order);
}

export interface Font {
  name: string; size: number; lineHeight: number; capHeight: number;
  glyphs: Map<string, { advance: number; g: { minX: number; minY: number; maxX: number; maxY: number }; t: { minX: number; minY: number; maxX: number; maxY: number } }>;
  kern: Map<string, number>;
}
/** Walgelijk's font format: a zip with meta.json and atlas.png */
export async function loadFont(r: Renderer, path: string, bytes: Uint8Array): Promise<Font> {
  const files = unzipSync(bytes);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const meta: any = JSON.parse(strFromU8(files['meta.json']).replace(/^﻿/, ''));
  const bmp = await createImageBitmap(new Blob([files['atlas.png'] as Uint8Array<ArrayBuffer>], { type: 'image/png' }), { imageOrientation: 'flipY', premultiplyAlpha: 'none' });
  r.upload(path, bmp, bmp.width, bmp.height, false);
  const glyphs: Font['glyphs'] = new Map();
  for (const g of meta.Glyphs) glyphs.set(g.Character, {
    advance: g.Advance,
    g: { minX: g.GeometryRect.MinX, minY: g.GeometryRect.MinY, maxX: g.GeometryRect.MaxX, maxY: g.GeometryRect.MaxY },
    t: { minX: g.TextureRect.MinX, minY: g.TextureRect.MinY, maxX: g.TextureRect.MaxX, maxY: g.TextureRect.MaxY },
  });
  const kern = new Map<string, number>();
  for (const k of meta.Kernings ?? []) kern.set(k.FirstChar + k.SecondChar, k.Amount);
  return { name: path, size: meta.Size, lineHeight: meta.LineHeight, capHeight: meta.CapHeight, glyphs, kern };
}

export function textWidth(f: Font, text: string, size: number): number {
  const sc = size / f.size;
  let w = 0;
  for (let i = 0; i < text.length; i++) {
    const g = f.glyphs.get(text[i]) ?? f.glyphs.get('?');
    if (!g) continue;
    w += g.advance + (i + 1 < text.length ? f.kern.get(text[i] + text[i + 1]) ?? 0 : 0);
  }
  return w * sc;
}
/** Draw.Text in screen space (y down): align h 0 left, 0.5 center, 1 right; v 0 top, 0.5 middle */
export function drawText(r: Renderer, f: Font, text: string, x: number, y: number, size: number, color: C4, h = 0, v = 0, layer = 350, order = 10): void {
  const sc = size / f.size;
  let cx = x - textWidth(f, text, size) * h;
  const top = y - f.capHeight * sc * v - (f.lineHeight - f.capHeight) * sc * 0.5 * (v > 0 ? 1 : 0);
  for (let i = 0; i < text.length; i++) {
    const g = f.glyphs.get(text[i]) ?? f.glyphs.get('?');
    if (!g) continue;
    if (text[i] !== ' ') {
      const x0 = cx + g.g.minX * sc, x1 = cx + g.g.maxX * sc;
      const y0 = top + g.g.maxY * sc, y1 = top + g.g.minY * sc;
      r.quad(f.name, [x0, y1, x1, y1, x1, y0, x0, y0], [g.t.minX, g.t.minY, g.t.maxX, g.t.minY, g.t.maxX, g.t.maxY, g.t.minX, g.t.maxY], color, Mode.Text, layer, order);
    }
    cx += (g.advance + (i + 1 < text.length ? f.kern.get(text[i] + text[i + 1]) ?? 0 : 0)) * sc;
  }
}
