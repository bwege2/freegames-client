// Drawing a scene on a canvas (src/xmoto/Renderer.cpp, GeomsManager.cpp, xmscene/Camera.cpp): the sky, the
// blocks with their textures and edge effects, the sprites, the bike and rider, the game messages, the
// time panel, the strawberry counter and the minimap, in the original's order. OpenGL's textured polygons
// become canvas patterns and affine image draws; the camera, its offsets, zoom and rotation are the
// original's.
import type { Scene, CameraCommand } from './scene.ts';
import type { Theme, AnimSprite } from './theme.ts';
import type { Block, Entity } from './level.ts';
import { ET_NONE, ET_PARTICLES_SOURCE, ET_MAKEWIN, ET_ISTOTAKE, ET_KILL, ET_CHECKPOINT } from './level.ts';
import { DD_RIGHT, DD_LEFT, type PlayerBiker, type BikeState } from './bike.ts';
import type { Vec2 } from './vmath.ts';

export type ImageSource = (path: string) => HTMLImageElement | null;

const ZOOM_DEFAULT = 0.24, ZOOM_DEFAULT_NO_AUTOZOOM = 0.195;
const CAMERA_OFFSETX_DEFAULT = 0.6, CAMERA_OFFSETY_DEFAULT = 0.0, CAMERA_SMOOTHNESS = 0.5;
const SPEED_UNTIL_ZOOM_BEGIN = 24.0, SPEED_UNTIL_ZOOM_END = 15.0, CAM_ZOOM_NEAR = 0.24, CAM_ZOOM_FAR = 0.18;
const ZOOM_OUT_SPEED = -0.0004, ZOOM_IN_SPEED = 0.0004, TRESHOLD = 1000;

/** xmscene/Camera.cpp (one camera, no trail camera) */
export class Camera {
  scale = ZOOM_DEFAULT;
  private useActiveZoom = true;
  private initialZoom = ZOOM_DEFAULT_NO_AUTOZOOM;
  private zoomState: 'none' | 'in' | 'out' = 'none';
  private tIn = 0; private tOut = 0;
  offsetX = CAMERA_OFFSETX_DEFAULT; offsetY = CAMERA_OFFSETY_DEFAULT;
  private hShift = 0; private vShift = 0;
  private prevDir = DD_LEFT;
  private fast = true;
  scrollX = 0; scrollY = 0;
  rotationAngle = 0; // degrees
  rotationSpeed = 1.0;
  desiredRotation = 0;
  private deathOffset: Vec2 = { x: 0, y: 0 };
  shadeStart = -1;

  get x(): number { return -this.scrollX + this.offsetX; }
  get y(): number { return -this.scrollY + this.offsetY; }

  initCamera(): void { this.offsetX = CAMERA_OFFSETX_DEFAULT; this.offsetY = CAMERA_OFFSETY_DEFAULT; this.initZoom(); }
  initZoom(): void { this.scale = this.useActiveZoom ? ZOOM_DEFAULT : ZOOM_DEFAULT_NO_AUTOZOOM; }
  private desactiveActionZoom(): void { if (this.useActiveZoom) { this.useActiveZoom = false; this.scale = this.initialZoom; } }
  private relZoom(z: number): void { this.scale += z; if (this.scale < 0) this.scale = 0; }

  command(c: CameraCommand, gravity: Vec2): void {
    switch (c.kind) {
      case 'zoom': this.desactiveActionZoom(); this.relZoom(c.z); break;
      case 'move': this.desactiveActionZoom(); this.offsetX += c.x; this.offsetY += c.y; break;
      case 'setPos': this.desactiveActionZoom(); this.offsetX = this.scrollX + c.x; this.offsetY = this.scrollY + c.y; break;
      case 'rotate': this.desiredRotation = (c.angle * 180.0) / Math.PI; break;
      case 'rotationSpeed': this.rotationSpeed = (c.speed * 180.0) / Math.PI; break;
      case 'adaptToGravity': this.adaptToGravity(gravity); break;
      case 'init': this.initCamera(); break;
    }
  }
  private adaptToGravity(g: Vec2): void {
    if (g.x === 0.0) { this.desiredRotation = g.y > 0 ? 180.0 : 0.0; return; }
    const vx = g.x, vy = -g.y;
    let a: number;
    if (vx > 0.0) a = vy > 0.0 ? Math.atan(vy / vx) : -Math.atan(-vy / vx);
    else a = vy > 0.0 ? Math.PI - Math.atan(vy / -vx) : Math.PI + Math.atan(-vy / -vx);
    a = (a * 180.0) / Math.PI - 90.0;
    this.desiredRotation = Math.trunc(a + 360.0) % 360;
  }
  /** guessDesiredAngleRotation, once per drawn frame */
  updateRotation(): number {
    if (Math.abs(this.desiredRotation - this.rotationAngle) <= this.rotationSpeed * 3.0) {
      this.rotationAngle = this.desiredRotation;
      return this.rotationAngle;
    }
    if (this.desiredRotation < 0.0) this.desiredRotation = (Math.trunc(this.desiredRotation) % 360) + 360;
    else if (this.desiredRotation >= 360.0) this.desiredRotation = Math.trunc(this.desiredRotation) % 360;
    const diff = this.rotationAngle > this.desiredRotation ? this.rotationAngle - this.desiredRotation : this.rotationAngle - this.desiredRotation + 360.0;
    this.rotationAngle = diff <= 180.0 ? this.rotationAngle - this.rotationSpeed + 360.0 : this.rotationAngle + this.rotationSpeed + 360.0;
    this.rotationAngle -= Math.trunc(this.rotationAngle / 360) * 360.0;
    return this.rotationAngle;
  }
  setPlayerDead(p: PlayerBiker, now: number): void {
    const s = p.state;
    const k = s.Dir === DD_RIGHT ? s.KneeP : s.Knee2P;
    this.deathOffset = { x: s.CenterP.x - k.x, y: s.CenterP.y - k.y };
    this.shadeStart = now;
  }
  setPlayerResussite(): void { this.deathOffset = { x: 0, y: 0 }; this.shadeStart = -1; }

  /** Camera::setScroll, called once per frame */
  setScroll(smooth: boolean, p: PlayerBiker, gravity: Vec2): void {
    const s = p.state;
    if (this.prevDir !== s.Dir) this.fast = true;
    this.prevDir = s.Dir;
    const maxMove = this.fast ? 0.05 : 0.01;
    if (p.isDead()) {
      const k = s.Dir === DD_RIGHT ? s.KneeP : s.Knee2P;
      this.scrollX = -k.x - this.deathOffset.x;
      this.scrollY = -k.y - this.deathOffset.y;
      const d = this.deathOffset;
      if (d.x !== 0.0 && d.y !== 0.0) {
        if (Math.abs(d.x) > 0.015) d.x += d.x > 0 ? -0.01 : 0.01; else d.x = 0.0;
      }
      if (d.y !== 0.0) {
        if (Math.abs(d.x) > 0.015) d.y += d.y > 0 ? -0.01 : 0.01; else d.y = 0.0;
      }
    } else {
      this.scrollX = -s.CenterP.x;
      this.scrollY = -s.CenterP.y;
    }
    let dh = (gravity.y * 1.7) / 9.81;
    if (s.Dir === DD_LEFT) dh *= -1;
    let dv = (gravity.x * 2.0) / 9.81;
    if (s.Dir === DD_RIGHT) dv *= -1;
    dh = Math.max(-1.7, Math.min(1.7, dh));
    dv = Math.max(-2.0, Math.min(2.0, dv));
    if (this.useActiveZoom) this.guessZoom(p);
    if (Math.abs(dh - this.hShift) < maxMove) this.fast = false;
    if (dh !== this.hShift) {
      const d = dh - this.hShift;
      if (Math.abs(d) < 0.01 || !smooth) this.hShift = dh; else this.hShift += maxMove * d * CAMERA_SMOOTHNESS;
    }
    if (dv !== this.vShift) {
      const d = dv - this.vShift;
      if (Math.abs(d) < 0.01 || !smooth) this.vShift = dv; else this.vShift += maxMove * d * CAMERA_SMOOTHNESS;
    }
    this.scrollX += this.hShift;
    this.scrollY += this.vShift;
  }
  private guessZoom(p: PlayerBiker): void {
    const v = p.getBikeLinearVel();
    if (v > SPEED_UNTIL_ZOOM_BEGIN) {
      this.tOut += 10; this.tIn = 0;
      if (this.tOut > TRESHOLD) this.zoomState = 'out';
    } else if (v < SPEED_UNTIL_ZOOM_END) {
      this.tIn += 10; this.tOut = 0;
      if (this.tIn > TRESHOLD) this.zoomState = 'in';
    } else { this.tIn = 0; this.tOut = 0; this.zoomState = 'none'; }
    if (this.zoomState === 'in') {
      if (this.scale <= CAM_ZOOM_NEAR) this.relZoom(ZOOM_IN_SPEED); else { this.tIn = this.tOut = 0; this.zoomState = 'none'; }
    } else if (this.zoomState === 'out') {
      if (this.scale >= CAM_ZOOM_FAR) this.relZoom(ZOOM_OUT_SPEED); else { this.tIn = this.tOut = 0; this.zoomState = 'none'; }
    }
  }
}

interface EdgeQuad { a1: Vec2; b1: Vec2; b2: Vec2; a2: Vec2; ua1: number; ub1: number; ua2: number; ub2: number; v1: number; v2: number }
interface EdgeGeom { sprite: string; color: [number, number, number, number]; upper: boolean; quads: EdgeQuad[] }
interface BlockGeom { block: Block; texture: string | undefined; scale: number; edges: EdgeGeom[]; minX: number; minY: number; maxX: number; maxY: number }

export interface HudInfo { bestTime: string; worldRecord: string; showTimePanel: boolean; showMinimap: boolean; levelInfo: string }

const deg2rad = (d: number): number => (d * Math.PI) / 180;

export class Renderer {
  private geoms: BlockGeom[] = [];
  private patterns = new Map<string, CanvasPattern>();
  private realTime = 0;
  private frameState = new Map<AnimSprite, { frame: number; t: number }>();

  private ctx: CanvasRenderingContext2D; private theme: Theme; private img: ImageSource;
  constructor(ctx: CanvasRenderingContext2D, theme: Theme, img: ImageSource) { this.ctx = ctx; this.theme = theme; this.img = img; }

  /** the textures a level needs (to load them before it starts) */
  static files(scene: Scene, theme: Theme): string[] {
    const set = new Set<string>();
    const L = scene.level;
    const addAnim = (n: string): void => { const a = theme.anims.get(n); if (a) for (const fr of a.frames) set.add(fr.file); };
    for (const b of L.blocks) {
      const t = theme.texture(b.texture);
      if (t) set.add(t);
      for (const v of b.vertices) {
        if (!v.edge) continue;
        const mat = b.edgeMaterials.find((m) => m.name === v.edge);
        const e = theme.edges.get(mat ? mat.texture : v.edge);
        if (e) set.add(e.file);
      }
    }
    for (const e of [...L.entities, ...L.entitiesDestroyed]) addAnim(spriteName(scene, e));
    for (const n of ['Strawberry', 'Wrecker', 'Flower', 'Checkpoint_0', 'Checkpoint_1']) addAnim(L.spriteReplacements[n] ?? n);
    const sky = theme.texture(L.sky.texture); if (sky) set.add(sky);
    const sky2 = theme.texture(L.sky.blendTexture); if (sky2) set.add(sky2);
    for (const p of theme.biker.values()) set.add(p);
    const arrow = theme.misc.get('Arrow'); if (arrow) set.add(arrow);
    return [...set];
  }

  /** GeomsManager::loadBlockEdgeGeom and Block::loadToPlay's texture scale, once per level */
  prepare(scene: Scene): void {
    this.geoms = [];
    for (const b of scene.level.blocks) {
      const tex = this.theme.texture(b.texture);
      let scale = b.textureScale * 0.25;
      const im = tex ? this.img(tex) : null;
      if (im && im.width < 256 && im.width !== 0) scale *= Math.trunc(256 / im.width);
      const center = b.isDynamic() ? { x: 0, y: 0 } : b.dynamicPosition;
      const g: BlockGeom = { block: b, texture: tex, scale, edges: this.edgeGeoms(b, center), minX: Infinity, minY: Infinity, maxX: -Infinity, maxY: -Infinity };
      for (const v of b.vertices) {
        const x = b.initialPosition.x + v.pos.x, y = b.initialPosition.y + v.pos.y;
        g.minX = Math.min(g.minX, x); g.maxX = Math.max(g.maxX, x); g.minY = Math.min(g.minY, y); g.maxY = Math.max(g.maxY, y);
      }
      this.geoms.push(g);
    }
  }

  private edgeGeoms(b: Block, center: Vec2): EdgeGeom[] {
    const geoms: EdgeGeom[] = [];
    const vs = b.vertices;
    let orientation = true, oldOrientation = true, cut = false;
    for (let j = 0; j < vs.length; j++) {
      const A = vs[j];
      if (!A.edge) continue;
      const B = vs[(j + 1) % vs.length];
      let ox = -(B.pos.y - A.pos.y), oy = B.pos.x - A.pos.x;
      const rot = deg2rad(270.0 - b.edgeAngle);
      const ny = oy * Math.cos(rot) + ox * Math.sin(rot);
      ox = ox * Math.cos(rot) + oy * Math.sin(rot);
      oldOrientation = orientation;
      orientation = ny > 0;
      if (j !== 0 && orientation !== oldOrientation) cut = true;
      const mat = b.edgeMaterials.find((m) => m.name === A.edge);
      const sprite = this.theme.edges.get(mat ? mat.texture : A.edge);
      if (!sprite) continue;
      let g = cut ? undefined : geoms.find((x) => x.sprite === sprite.file && x.upper === orientation && x.color === (mat ? mat.color : DEFAULT_EDGE_COLOR));
      if (!g) {
        cut = false;
        g = { sprite: sprite.file, color: mat ? mat.color : DEFAULT_EDGE_COLOR, upper: orientation, quads: [] };
        geoms.push(g);
      }
      const depth = mat && mat.depth !== -1 ? mat.depth : sprite.depth;
      const xscale = mat && mat.scale !== -1 ? mat.scale : sprite.scale;
      const border = depth > 0 ? 0.01 : -0.01;
      if (b.edgeDrawMethod === 'angle') {
        const ra = deg2rad(b.edgeAngle), c = Math.cos(ra), s = Math.sin(ra);
        const a1 = { x: A.pos.x + center.x - c * border, y: A.pos.y + center.y - s * border };
        const b1 = { x: B.pos.x + center.x - c * border, y: B.pos.y + center.y - s * border };
        const b2 = { x: B.pos.x + center.x + c * depth, y: B.pos.y + center.y + s * depth };
        const a2 = { x: A.pos.x + center.x + c * depth, y: A.pos.y + center.y + s * depth };
        const ua = a1.x * xscale * s - a1.y * xscale * c;
        const ub = b1.x * xscale * s - b1.y * xscale * c;
        g.quads.push({ a1, b1, b2, a2, ua1: ua, ub1: ub, ua2: ua, ub2: ub, v1: 0.01, v2: 0.99 });
      } else {
        // inside/outside: the normal of each edge, depth along it (the original's "wip" join is approximated)
        const nx0 = -(B.pos.y - A.pos.y), ny0 = B.pos.x - A.pos.x;
        const l = Math.hypot(nx0, ny0) || 1;
        const nx = (nx0 / l) * depth, ny = (ny0 / l) * depth;
        const sgn = b.edgeDrawMethod === 'inside' ? -1 : 1;
        const a1 = { x: A.pos.x + center.x, y: A.pos.y + center.y + border };
        const b1 = { x: B.pos.x + center.x, y: B.pos.y + center.y + border };
        const a2 = { x: a1.x + sgn * nx, y: a1.y + sgn * ny };
        const b2 = { x: b1.x + sgn * nx, y: b1.y + sgn * ny };
        const N = { x: -b1.y + a1.y, y: b1.x - a1.x };
        const nl = Math.hypot(N.x, N.y) || 1;
        const tu = (p: Vec2): number => p.x * xscale * (N.y / nl) - p.y * xscale * (N.x / nl);
        const inside = b.edgeDrawMethod === 'inside';
        g.quads.push({ a1, b1, b2, a2, ua1: tu(a1), ub1: tu(b1), ua2: tu(a2), ub2: tu(b2), v1: inside ? 0.01 : 0.99, v2: inside ? 0.99 : 0.01 });
      }
    }
    return [...geoms.filter((g) => !g.upper), ...geoms.filter((g) => g.upper)];
  }

  private pattern(path: string): CanvasPattern | null {
    let p = this.patterns.get(path);
    if (p) return p;
    const im = this.img(path);
    if (!im) return null;
    p = this.ctx.createPattern(im, 'repeat') ?? undefined;
    if (!p) return null;
    this.patterns.set(path, p);
    return p;
  }

  /** AnimationSprite::getCurrentFrame, on the wall clock */
  private frame(a: AnimSprite): number {
    if (a.frames.length <= 1) return 0;
    let st = this.frameState.get(a);
    if (!st) { st = { frame: 0, t: this.realTime }; this.frameState.set(a, st); }
    while (this.realTime > st.t + a.frames[st.frame].delay) {
      st.t = this.realTime;
      st.frame = (st.frame + 1) % a.frames.length;
    }
    return st.frame;
  }

  /** GameRenderer::render */
  render(scene: Scene, cam: Camera, w: number, h: number, realTime: number, hud: HudInfo): void {
    const ctx = this.ctx;
    this.realTime = realTime;
    const rot = cam.updateRotation();
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, w, h);
    this.renderSky(scene, cam, w, h);
    const ppu = (cam.scale * h) / 2; // pixels per level unit
    const world = (): void => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(w / 2, h / 2);
      ctx.rotate(deg2rad(rot));
      ctx.scale(ppu, -ppu);
      ctx.translate(-cam.x, -cam.y);
    };
    // visible area (generous, for the rotation)
    const r = Math.hypot(w, h) / 2 / ppu;
    const view = { minX: cam.x - r, maxX: cam.x + r, minY: cam.y - r, maxY: cam.y + r };
    this.renderLayers(scene, cam, w, h, rot, false);
    world();
    for (const g of this.geoms) if (g.block.isDynamic() && g.block.background) this.renderBlock(g, view);
    for (const g of this.geoms) if (!g.block.isDynamic() && g.block.background && g.block.layer === -1) this.renderBlock(g, view);
    this.renderSprites(scene, view, false, true);
    for (const g of this.geoms) if (g.block.isDynamic() && !g.block.background) this.renderBlock(g, view);
    for (const g of this.geoms) if (!g.block.isDynamic() && !g.block.background && g.block.layer === -1 && !g.block.isLayer) this.renderBlock(g, view);
    for (const g of this.geoms) if (!g.block.isDynamic() && !g.block.background && g.block.layer === -1 && g.block.isLayer) this.renderBlock(g, view);
    this.renderSprites(scene, view, false, false);
    this.renderBike(scene.player);
    this.renderSprites(scene, view, true, false);
    this.renderLayers(scene, cam, w, h, rot, true);
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    if (hud.showMinimap) this.renderMiniMap(scene, cam, w, h);
    if (hud.showTimePanel) { this.renderTimePanel(scene, hud); this.renderGameStatus(scene, h); }
    this.renderMessages(scene, cam, w, h);
    this.renderShadow(cam, w, h, realTime);
    if (hud.levelInfo) {
      ctx.font = '22px "XMotoDejaVu", sans-serif';
      ctx.fillStyle = '#fff';
      ctx.textBaseline = 'bottom';
      ctx.fillText(hud.levelInfo, 5, h - 2);
    }
  }

  /** _RenderLayers / _RenderLayer: the background (and front) layers, moved by their offsets (parallax) */
  private renderLayers(scene: Scene, cam: Camera, w: number, h: number, rot: number, front: boolean): void {
    const L = scene.level;
    for (let layer = 0; layer < L.layerOffsets.length; layer++) {
      if (L.layerFront[layer] !== front) continue;
      const off = L.layerOffsets[layer];
      // layers moving almost like the main layer are drawn with its zoom, the others with the default zoom
      const scale = off.x > 0.30 && off.x < 1.70 && off.y > 0.30 && off.y < 1.70 ? cam.scale : ZOOM_DEFAULT;
      const ppu = (scale * h) / 2;
      const halfW = w / 2 / ppu, halfH = h / 2 / ppu;
      const minX = cam.x - halfW, maxY = cam.y + halfH;
      const ox = minX - L.leftLimit, oy = maxY - L.topLimit;
      const tx = ox - ox * off.x, ty = oy - oy * off.y;
      const ctx = this.ctx;
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      ctx.translate(w / 2, h / 2);
      ctx.rotate(deg2rad(rot));
      ctx.scale(ppu, -ppu);
      ctx.translate(-cam.x, -cam.y);
      ctx.translate(tx, ty);
      const view = { minX: cam.x - tx - 2 * halfW, maxX: cam.x - tx + 2 * halfW, minY: cam.y - ty - 2 * halfH, maxY: cam.y - ty + 2 * halfH };
      for (const g of this.geoms) if (g.block.layer === layer) this.renderBlock(g, view);
    }
  }

  private renderSky(scene: Scene, cam: Camera, w: number, h: number): void {
    const ctx = this.ctx, sky = scene.level.sky;
    const tex = this.theme.texture(sky.texture);
    const im = tex ? this.img(tex) : null;
    const pat = tex ? this.pattern(tex) : null;
    if (!im || !pat) return;
    const draw = (p: CanvasPattern, image: HTMLImageElement, zoom: number, drift: number, color: [number, number, number, number], add: boolean): void => {
      const uZoom = 1.0 / zoom;
      const u0 = cam.x * sky.offset + drift, v0 = -cam.y * sky.offset;
      // screen = (tex - (u0,v0)) * (w,h)/uZoom, tex = pixel/(W,H)
      p.setTransform(new DOMMatrix([w / uZoom / image.width, 0, 0, h / uZoom / image.height, -u0 * w / uZoom, -v0 * h / uZoom]));
      ctx.save();
      ctx.globalCompositeOperation = add ? 'lighter' : 'source-over';
      ctx.globalAlpha = add ? color[3] / 255 : 1;
      ctx.fillStyle = p;
      ctx.fillRect(0, 0, w, h);
      if (!add && (color[0] !== 255 || color[1] !== 255 || color[2] !== 255)) {
        ctx.globalCompositeOperation = 'multiply';
        ctx.fillStyle = `rgb(${color[0]},${color[1]},${color[2]})`;
        ctx.fillRect(0, 0, w, h);
      }
      ctx.restore();
    };
    draw(pat, im, sky.zoom, sky.drifted ? this.realTime / 25.0 : 0, sky.color, false);
    if (sky.drifted) {
      const t2 = this.theme.texture(sky.blendTexture);
      const im2 = t2 ? this.img(t2) : null, p2 = t2 ? this.pattern(t2) : null;
      if (im2 && p2) draw(p2, im2, sky.driftZoom, this.realTime / 15.0, sky.driftColor, true);
    }
  }

  private renderBlock(g: BlockGeom, view: { minX: number; maxX: number; minY: number; maxY: number }): void {
    const b = g.block, ctx = this.ctx;
    const dyn = b.isDynamic();
    if (!dyn && (g.maxX < view.minX || g.minX > view.maxX || g.maxY < view.minY || g.minY > view.maxY)) return;
    ctx.save();
    if (dyn) {
      ctx.translate(b.dynamicPosition.x, b.dynamicPosition.y);
      if (b.dynamicRotation !== 0) {
        ctx.translate(b.rotationCenter.x, b.rotationCenter.y);
        ctx.rotate(b.dynamicRotation);
        ctx.translate(-b.rotationCenter.x, -b.rotationCenter.y);
      }
    }
    const off = dyn ? { x: 0, y: 0 } : b.dynamicPosition;
    ctx.beginPath();
    b.vertices.forEach((v, i) => (i === 0 ? ctx.moveTo(v.pos.x + off.x, v.pos.y + off.y) : ctx.lineTo(v.pos.x + off.x, v.pos.y + off.y)));
    ctx.closePath();
    const im = g.texture ? this.img(g.texture) : null;
    const pat = g.texture ? this.pattern(g.texture) : null;
    const [r, gg, bb, a] = b.blendColor;
    ctx.globalAlpha = a / 255;
    if (pat && im) {
      // texture coordinate = (initial position + vertex) * scale, repeated
      const sx = 1 / (im.width * g.scale), sy = 1 / (im.height * g.scale);
      const tx = dyn ? -b.initialPosition.x : 0, ty = dyn ? -b.initialPosition.y : 0;
      pat.setTransform(new DOMMatrix([sx, 0, 0, sy, tx, ty]));
      ctx.fillStyle = pat;
    } else {
      ctx.fillStyle = '#5a4630';
    }
    ctx.fill();
    if (r !== 255 || gg !== 255 || bb !== 255) {
      ctx.globalCompositeOperation = 'multiply';
      ctx.fillStyle = `rgb(${r},${gg},${bb})`;
      ctx.fill();
      ctx.globalCompositeOperation = 'source-over';
    }
    ctx.globalAlpha = 1;
    if (!dyn || true) for (const e of g.edges) this.renderEdge(e);
    ctx.restore();
  }

  private renderEdge(e: EdgeGeom): void {
    const ctx = this.ctx;
    const im = this.img(e.sprite), pat = this.pattern(e.sprite);
    if (!im || !pat) return;
    ctx.globalAlpha = e.color[3] / 255;
    for (const q of e.quads) {
      // affine map texture (u,v) -> level: from a1 (ua1,v1), b1 (ub1,v1), a2 (ua2,v2)
      const du = q.ub1 - q.ua1, dv = q.v2 - q.v1;
      if (du === 0 || dv === 0) continue;
      const ex = { x: (q.b1.x - q.a1.x) / du, y: (q.b1.y - q.a1.y) / du };
      const ey = { x: (q.a2.x - q.a1.x - ex.x * (q.ua2 - q.ua1)) / dv, y: (q.a2.y - q.a1.y - ex.y * (q.ua2 - q.ua1)) / dv };
      const ox = q.a1.x - ex.x * q.ua1 - ey.x * q.v1, oy = q.a1.y - ex.y * q.ua1 - ey.y * q.v1;
      pat.setTransform(new DOMMatrix([ex.x / im.width, ex.y / im.width, ey.x / im.height, ey.y / im.height, ox, oy]));
      ctx.beginPath();
      ctx.moveTo(q.a1.x, q.a1.y); ctx.lineTo(q.b1.x, q.b1.y); ctx.lineTo(q.b2.x, q.b2.y); ctx.lineTo(q.a2.x, q.a2.y);
      ctx.closePath();
      ctx.fillStyle = pat;
      ctx.fill();
    }
    ctx.globalAlpha = 1;
  }

  /** draws an image so that its corners land on a (top left), b (top right), d (bottom left) */
  private quad(im: HTMLImageElement, a: Vec2, b: Vec2, d: Vec2, additive = false): void {
    const ctx = this.ctx;
    ctx.save();
    ctx.transform((b.x - a.x) / im.width, (b.y - a.y) / im.width, (d.x - a.x) / im.height, (d.y - a.y) / im.height, a.x, a.y);
    if (additive) ctx.globalCompositeOperation = 'lighter';
    ctx.drawImage(im, 0, 0);
    ctx.restore();
  }
  /** _RenderAlphaBlendedSection(p0,p1,p2,p3) = drawImage(p3,p2,p1,p0): texture (0,0) at p3, (1,0) at p2, (0,1) at p0 */
  private section(im: HTMLImageElement, p0: Vec2, _p1: Vec2, p2: Vec2, p3: Vec2): void {
    this.quad(im, p3, p2, p0);
  }

  private renderSprites(scene: Scene, view: { minX: number; maxX: number; minY: number; maxY: number }, fg: boolean, bg: boolean): void {
    const ents = scene.level.entities.filter((e) => e.dynamicPosition.x > view.minX - 5 && e.dynamicPosition.x < view.maxX + 5 &&
      e.dynamicPosition.y > view.minY - 5 && e.dynamicPosition.y < view.maxY + 5);
    const order = (e: Entity): number => this.theme.anims.get(e.spriteName)?.order ?? 0;
    ents.sort((a, b) => order(a) - order(b));
    for (const e of ents) {
      if (e.speciality === ET_PARTICLES_SOURCE) continue;
      if (e.speciality === ET_NONE) {
        if ((e.z === 0 && !fg && !bg) || (e.z > 0 && fg) || (e.z < 0 && bg)) this.renderSprite(scene, e);
      } else if (!fg && !bg) {
        this.renderSprite(scene, e);
      }
    }
  }

  private renderSprite(scene: Scene, e: Entity): void {
    const a = this.theme.anims.get(spriteName(scene, e));
    if (!a || a.frames.length === 0) return;
    const fr = a.frames[this.frame(a)];
    const im = this.img(fr.file);
    if (!im) return;
    let cx = fr.centerX, cy = fr.centerY, w = fr.width, h = fr.height;
    if (e.width > 0) {
      w = e.width; h = e.height;
      cx += (e.width - fr.width) / 2.0;
      cy += (e.height - fr.height) / 2.0;
    }
    let p: Vec2[] = [{ x: 0, y: 0 }, { x: w, y: 0 }, { x: w, y: h }, { x: 0, y: h }].map((q) => ({ x: q.x - cx, y: q.y - cy }));
    if (e.drawAngle !== 0) {
      const c = Math.cos(e.drawAngle), s = Math.sin(e.drawAngle);
      p = p.map((q) => ({ x: q.x * c - q.y * s, y: q.x * s + q.y * c }));
    }
    if (e.drawReversed) p = [p[1], p[0], p[3], p[2]];
    p = p.map((q) => ({ x: q.x + e.dynamicPosition.x, y: q.y + e.dynamicPosition.y }));
    // _RenderAlphaBlendedSection(p0..p3): texture top left at p3
    this.quad(im, p[3], p[2], p[0], a.additive);
  }

  private bodyPart(p: PlayerBiker, from: Vec2, to: Vec2, c: number[], sprite: string, rot90: number): void {
    const im = this.img(this.theme.biker.get(sprite) ?? '');
    if (!im) return;
    let sx = from.x - to.x, sy = from.y - to.y;
    const l = Math.hypot(sx, sy) || 1;
    sx /= l; sy /= l;
    const n = { x: -sy, y: sx };
    const sg = p.state.Dir === DD_RIGHT ? 1 : -1;
    let p0 = { x: from.x + sg * n.x * c[0] + sx * c[1], y: from.y + sg * n.y * c[0] + sy * c[1] };
    let p1 = { x: to.x + sg * n.x * c[2] + sx * c[3], y: to.y + sg * n.y * c[2] + sy * c[3] };
    let p2 = { x: to.x - sg * n.x * c[4] + sx * c[5], y: to.y - sg * n.y * c[4] + sy * c[5] };
    let p3 = { x: from.x - sg * n.x * c[6] + sx * c[7], y: from.y - sg * n.y * c[6] + sy * c[7] };
    [p0, p1, p2, p3] = [p0, p1, p2, p3].map((q) => changeDir(p, q));
    if (rot90 === 0) this.section(im, p1, p2, p3, p0);
    else if (rot90 === 1) this.section(im, p0, p1, p2, p3);
    else this.section(im, p3, p2, p1, p0);
  }

  /** GameRenderer::_RenderBike */
  private renderBike(p: PlayerBiker): void {
    const s = p.state, WR = p.p.bikeWheelRadius;
    const wheelIm = this.img(this.theme.biker.get('PlayerBikerWheel') ?? '');
    const wheel = (rot: number[], C: Vec2): Vec2 => {
      const o = [{ x: -WR, y: WR }, { x: WR, y: WR }, { x: WR, y: -WR }, { x: -WR, y: -WR }];
      const q = o.map((v) => ({ x: v.x * rot[0] + v.y * rot[1] + C.x, y: v.x * rot[2] + v.y * rot[3] + C.y }));
      if (wheelIm) this.section(wheelIm, q[0], q[1], q[2], q[3]);
      return { x: (q[0].x + q[1].x + q[2].x + q[3].x) * 0.25, y: (q[0].y + q[1].y + q[2].y + q[3].y) * 0.25 };
    };
    const Fc = wheel(s.fFrontWheelRot, s.FrontWheelP);
    const Rc = wheel(s.fRearWheelRot, s.RearWheelP);
    const norm = (v: Vec2): Vec2 => { const l = Math.hypot(v.x, v.y) || 1; return { x: v.x / l, y: v.y / l }; };
    const add = (a: Vec2, n: Vec2, k: number, sv: Vec2, m: number): Vec2 => ({ x: a.x + n.x * k + sv.x * m, y: a.y + n.y * k + sv.y * m });
    // swing arm
    {
      const right = s.Dir === DD_RIGHT;
      const anchor = right ? s.SwingAnchorP : s.SwingAnchor2P, wp = right ? s.RearWheelP : s.FrontWheelP, c = right ? Rc : Fc;
      const Sv = norm({ x: anchor.x - c.x, y: anchor.y - c.y }), N = { x: -Sv.y, y: Sv.x };
      const q = [add(wp, N, 0.07, Sv, -0.08), add(anchor, N, 0.07, Sv, 0), add(anchor, N, -0.07, Sv, 0), add(wp, N, -0.07, Sv, -0.08)].map((v) => changeDir(p, v));
      const im = this.img(this.theme.biker.get('PlayerBikerRear') ?? '');
      if (im) this.section(im, q[0], q[1], q[2], q[3]);
    }
    // front suspension
    if (!p.wheelDetach) {
      const right = s.Dir === DD_RIGHT;
      const anchor = right ? s.FrontAnchorP : s.FrontAnchor2P, wp = right ? s.FrontWheelP : s.RearWheelP, c = right ? Fc : Rc;
      const Sv = norm({ x: anchor.x - c.x, y: anchor.y - c.y }), N = { x: -Sv.y, y: Sv.x };
      const q = [add(wp, N, 0.04, Sv, -0.05), add(anchor, N, 0.04, Sv, -0.35), add(anchor, N, -0.04, Sv, -0.35), add(wp, N, -0.04, Sv, -0.05)].map((v) => changeDir(p, v));
      const im = this.img(this.theme.biker.get('PlayerBikerFront') ?? '');
      if (im) this.section(im, q[3], q[0], q[1], q[2]);
    }
    // body / frame
    {
      const R = s.fFrameRot, C = s.CenterP;
      const o = [{ x: -1, y: 0.5 }, { x: 1, y: 0.5 }, { x: 1, y: -0.5 }, { x: -1, y: -0.5 }];
      const q = o.map((v) => changeDir(p, { x: C.x + v.x * R[0] + v.y * R[1], y: C.y + v.x * R[2] + v.y * R[3] }));
      const im = this.img(this.theme.biker.get('PlayerBikerBody') ?? '');
      if (im) {
        if (s.Dir === DD_RIGHT) this.section(im, q[3], q[2], q[1], q[0]);
        else this.section(im, q[2], q[3], q[0], q[1]);
      }
    }
    const R = s.Dir === DD_RIGHT;
    this.bodyPart(p, R ? s.ShoulderP : s.Shoulder2P, R ? s.LowerBodyP : s.LowerBody2P, [0.24, 0.46, 0.24, -0.1, 0.24, -0.1, 0.24, 0.46], 'PlayerTorso', 0);
    this.bodyPart(p, R ? s.LowerBodyP : s.LowerBody2P, R ? s.KneeP : s.Knee2P, [0.20, 0.14, 0.15, 0.00, 0.15, 0.00, 0.10, 0.14], 'PlayerUpperLeg', 1);
    this.bodyPart(p, R ? s.KneeP : s.Knee2P, R ? s.FootP : s.Foot2P, [0.23, 0.01, 0.20, 0.00, 0.20, 0.00, 0.23, 0.10], 'PlayerLowerLeg', 0);
    this.bodyPart(p, R ? s.ShoulderP : s.Shoulder2P, R ? s.ElbowP : s.Elbow2P, [0.12, 0.09, 0.12, -0.05, 0.10, -0.05, 0.10, 0.09], 'PlayerUpperArm', 0);
    this.bodyPart(p, R ? s.ElbowP : s.Elbow2P, R ? s.HandP : s.Hand2P, [0.12, 0.09, 0.12, -0.05, 0.10, -0.05, 0.10, 0.09], 'PlayerLowerArm', 2);
  }

  private renderTimePanel(scene: Scene, hud: HudInfo): void {
    const ctx = this.ctx, p = scene.player;
    const t = p.isDead() ? p.deadTime : p.isFinished() ? p.finishTime : scene.time;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'top';
    ctx.font = '22px "XMotoDejaVu", sans-serif';
    ctx.fillText(formatTime(t), 0, 0);
    ctx.font = '14px "XMotoDejaVu", sans-serif';
    ctx.fillText(hud.bestTime, 0, 28);
    ctx.fillText(hud.worldRecord, 0, 48);
  }

  /** _RenderGameStatus: the strawberries still to take, or the flower */
  private renderGameStatus(scene: Scene, height: number): void {
    const ctx = this.ctx;
    const left = scene.level.nbEntitiesToTake;
    const name = left > 0 ? (scene.level.spriteReplacements.Strawberry ?? 'Strawberry') : (scene.level.spriteReplacements.Flower ?? 'Flower');
    const a = this.theme.anims.get(name);
    const im = a ? this.img(a.frames[this.frame(a)].file) : null;
    const x1 = 125, y1 = 2, x2 = 100, y2 = 27;
    if (im) {
      // drawn with screen coordinates y up (height - y)
      ctx.drawImage(im, x2, y1, x1 - x2, y2 - y1);
    }
    if (left > 0) {
      ctx.font = '14px "XMotoDejaVu", sans-serif';
      ctx.fillStyle = '#ff0';
      ctx.textBaseline = 'middle';
      ctx.textAlign = 'center';
      ctx.fillText(String(left), (x1 + x2) / 2, (y1 + y2) / 2);
      ctx.textAlign = 'left';
    }
    void height;
  }

  private renderMessages(scene: Scene, cam: Camera, w: number, h: number): void {
    const ctx = this.ctx;
    const arrow = scene.arrow;
    if (arrow.mode !== 0) {
      const im = this.img(this.theme.misc.get('Arrow') ?? '');
      let C: Vec2;
      if (arrow.mode === 1) C = { x: w / 2 + (arrow.pos.x - cam.x) * 60, y: h / 2 - (arrow.pos.y - cam.y) * 60 };
      else C = { x: (w * arrow.pos.x) / 800, y: (h * arrow.pos.y) / 600 };
      if (im) {
        const rot = (d: number): Vec2 => ({ x: Math.cos(deg2rad(d + arrow.angle)) * 50 + C.x, y: Math.sin(deg2rad(d + arrow.angle)) * 50 + C.y });
        // _RenderAlphaBlendedSectionSP(p1..p4) = drawImage(p4,p3,p2,p1) in screen space
        this.quad(im, rot(270), rot(180), rot(0));
      }
    }
    ctx.textAlign = 'center';
    ctx.textBaseline = 'top';
    for (const m of scene.messages) {
      ctx.font = '22px "XMotoDejaVu", sans-serif';
      ctx.fillStyle = `rgba(255,255,255,${Math.max(0, m.alpha) / 255})`;
      const lines = m.text.split('\n');
      lines.forEach((line, i) => ctx.fillText(line, w / 2, m.pos.y * h + i * 26));
    }
    ctx.textAlign = 'left';
  }

  private renderShadow(cam: Camera, w: number, h: number, now: number): void {
    if (cam.shadeStart < 0) return;
    const a = Math.min(1, (now - cam.shadeStart) / 1.0) * 150;
    this.ctx.fillStyle = `rgba(0,0,0,${a / 255})`;
    this.ctx.fillRect(0, 0, w, h);
  }

  /** GameRenderer::renderMiniMap */
  private renderMiniMap(scene: Scene, cam: Camera, w: number, h: number): void {
    const p = scene.player;
    if (p.isDead()) return;
    const ctx = this.ctx;
    const nW = Math.trunc(w / 5), nH = Math.trunc(h / 6), x = 0, y = h - nH;
    const Z = 5.0;
    ctx.fillStyle = 'rgba(0,0,0,0.83)';
    ctx.fillRect(x, y, nW, nH);
    ctx.strokeStyle = 'rgba(255,255,255,0.5)';
    ctx.strokeRect(x + 0.5, y + 0.5, nW - 1, nH - 1);
    ctx.save();
    ctx.beginPath();
    ctx.rect(x + 1, y + 1, nW - 2, nH - 2);
    ctx.clip();
    const X = (px: number): number => x + nW / 2 + (px - cam.x) * Z;
    const Y = (py: number): number => y + nH / 2 - (py - cam.y) * Z;
    ctx.fillStyle = 'rgb(168,168,168)';
    for (const b of scene.level.blocks) {
      if (b.background || b.layer !== -1) continue;
      ctx.beginPath();
      if (b.isDynamic()) {
        const c = Math.cos(b.dynamicRotation), s = Math.sin(b.dynamicRotation), rc = b.rotationCenter;
        b.vertices.forEach((v, i) => {
          const tx = (v.pos.x - rc.x) * c - (v.pos.y - rc.y) * s + b.dynamicPosition.x + rc.x;
          const ty = (v.pos.x - rc.x) * s + (v.pos.y - rc.y) * c + b.dynamicPosition.y + rc.y;
          if (i === 0) ctx.moveTo(X(tx), Y(ty)); else ctx.lineTo(X(tx), Y(ty));
        });
      } else {
        b.vertices.forEach((v, i) => (i === 0 ? ctx.moveTo(X(b.dynamicPosition.x + v.pos.x), Y(b.dynamicPosition.y + v.pos.y)) : ctx.lineTo(X(b.dynamicPosition.x + v.pos.x), Y(b.dynamicPosition.y + v.pos.y))));
      }
      ctx.closePath();
      ctx.fill();
    }
    const dot = (px: number, py: number, color: string): void => {
      ctx.fillStyle = color;
      ctx.beginPath();
      ctx.arc(X(px), Y(py), 3, 0, Math.PI * 2);
      ctx.fill();
    };
    dot(p.state.CenterP.x, p.state.CenterP.y, 'rgb(255,238,104)');
    for (const e of scene.level.entities) {
      const c = e.speciality === ET_MAKEWIN ? 'rgb(255,0,255)' : e.speciality === ET_ISTOTAKE ? 'rgb(255,0,0)' : e.speciality === ET_KILL ? 'rgb(80,255,255)' : e.speciality === ET_CHECKPOINT ? 'rgb(26,188,26)' : null;
      if (c) dot(e.dynamicPosition.x, e.dynamicPosition.y, c);
    }
    ctx.restore();
  }
}

const DEFAULT_EDGE_COLOR: [number, number, number, number] = [255, 255, 255, 255];

/** _GetSpriteDetails: the sprite of an entity (level replacements for the special ones) */
export function spriteName(scene: Scene, e: Entity): string {
  const r = scene.level.spriteReplacements;
  switch (e.speciality) {
    case ET_KILL: return r.Wrecker ?? 'Wrecker';
    case ET_MAKEWIN: return r.Flower ?? 'Flower';
    case ET_ISTOTAKE: return r.Strawberry ?? 'Strawberry';
    case ET_CHECKPOINT: return scene.activatedCheckpoints.has(e) ? 'Checkpoint_1' : 'Checkpoint_0';
    default: return e.spriteName;
  }
}

/** calculateChangeDirPosition: the bike mirrors around its frame's axis while turning round */
function changeDir(p: PlayerBiker, q: Vec2): Vec2 {
  const s: BikeState = p.state, C = s.CenterP, R = s.fFrameRot;
  const px = q.x - C.x, py = q.y - C.y;
  let s1x = R[1], s1y = R[3];
  const l = Math.hypot(s1x, s1y) || 1;
  s1x /= l; s1y /= l;
  const d = px * s1x + py * s1y;
  const s2x = px - s1x * d, s2y = py - s1y * d;
  const k = 2.0 * (p.changeDirPer - 1.0);
  return { x: px + s2x * k + C.x, y: py + s2y * k + C.y };
}

/** helpers/Text.cpp formatTime: mm:ss:cc */
export function formatTime(t: number): string {
  const m = Math.trunc(t / 6000), s = Math.trunc((t - m * 6000) / 100), c = t - m * 6000 - s * 100;
  const p = (n: number): string => String(n).padStart(2, '0');
  return `${p(m)}:${p(s)}:${p(c)}`;
}
