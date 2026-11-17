// Drawing (display.cc): the game area of 20x13 tiles at 32 pixels with the layers floor, items, shadows,
// actors, stones and effects, the screen follower (d_follower.cc), and the status bar with the time, the
// inventory and the scrolling text (StatusBarImpl, TextDisplay).
import { display, world, server, player, V2 } from './engine/core.ts';
import { Anim2d, CompositeModel, ImageModel, ShadowModel, type Model, type ImageRef } from './engine/display.ts';

export type ImageLookup = (name: string) => CanvasImageSource | null;

export const TILE = 32;
export const GAME_W = 640, GAME_H = 416;

export function drawModel(g: CanvasRenderingContext2D, img: ImageLookup, m: Model | null, x: number, y: number) {
  if (!m) return;
  if (m instanceof ShadowModel) { drawModel(g, img, m.model, x, y); return; }
  if (m instanceof CompositeModel) { drawModel(g, img, m.bg, x, y); drawModel(g, img, m.fg, x, y); return; }
  if (m instanceof Anim2d) { drawModel(g, img, m.current(), x, y); return; }
  if (m instanceof ImageModel) {
    const r: ImageRef & { overlay?: string[] } = m.img;
    const im = img(r.file);
    if (!im) return;
    g.drawImage(im, r.x, r.y, r.w, r.h, x + r.xoff, y + r.yoff, r.w, r.h);
    if (r.overlay) for (const o of r.overlay) { const oi = img(o); if (oi) g.drawImage(oi, x, y); }
  }
}
export function drawShadow(g: CanvasRenderingContext2D, img: ImageLookup, m: Model | null, x: number, y: number) {
  if (!m) return;
  if (m instanceof ShadowModel) { drawModel(g, img, m.shade, x, y); return; }
  if (m instanceof CompositeModel) { drawShadow(g, img, m.bg, x, y); return; }
  if (m instanceof Anim2d) { drawShadow(g, img, m.current(), x, y); }
}

/** Follower_Screen (the default flip mode) and Follower_Scrolling / Follower_Smooth */
export class Follower {
  offset = new V2(0, 0);
  private scrolling = false; private cur = new V2(); private dest = new V2();
  reset() { this.offset = new V2(0, 0); this.scrolling = false; }
  private bx() { return server.FollowThreshold; }
  private hoff() { return GAME_W / TILE - this.bx() * 2; }
  private voff() { return GAME_H / TILE - this.bx() * 2; }
  private clampOff(o: V2) {
    o.x = Math.max(o.x, 0); o.y = Math.max(o.y, 0);
    o.x = Math.min(o.x, world.w - this.hoff() - this.bx() * 2);
    o.y = Math.min(o.y, world.h - this.voff() - this.bx() * 2);
    return o;
  }
  center(p: V2) {
    if (!server.FollowGrid) { this.offset = this.smooth(p); return; }
    const h = this.hoff(), v = this.voff(), b = this.bx();
    this.offset = this.clampOff(new V2(Math.floor((p.x - b) / h) * h, Math.floor((p.y - b) / v) * v));
    this.cur = this.offset.clone(); this.dest = this.offset.clone();
  }
  private smooth(p: V2) {
    const d = new V2(p.x - GAME_W / TILE / 2, p.y - GAME_H / TILE / 2);
    d.x = Math.round(d.x * TILE) / TILE; d.y = Math.round(d.y * TILE) / TILE;
    d.x = Math.max(0, Math.min(d.x, world.w - GAME_W / TILE)); d.y = Math.max(0, Math.min(d.y, world.h - GAME_H / TILE));
    return d;
  }
  tick(dt: number, p: V2) {
    if (!server.FollowGrid) { this.offset = this.smooth(p); return; }
    if (server.FollowMethod === 0) return;
    if (server.FollowMethod === 2) { this.center(p); return; }
    // scrolling (screenwise unless the default threshold 0.5 and action (9.5, 6))
    const screenwise = !(server.FollowThreshold === 0.5 && server.FollowAction.x === 9.5 && server.FollowAction.y === 6);
    if (!this.scrolling) {
      const sx = Math.round(p.x * TILE) - Math.round(this.offset.x * TILE), sy = Math.round(p.y * TILE) - Math.round(this.offset.y * TILE);
      const b = this.bx();
      const sxp = sx < b * TILE || sx >= GAME_W - b * TILE, syp = sy < b * TILE || sy >= GAME_H - b * TILE;
      if (sxp || syp) {
        const old = this.dest.clone();
        this.scrolling = true;
        this.cur = this.offset.clone();
        if (screenwise) {
          this.dest = new V2(Math.floor((p.x - b) / this.hoff()) * this.hoff(), Math.floor((p.y - b) / this.voff()) * this.voff());
        } else {
          this.dest = new V2(p.x - GAME_W / TILE / 2, p.y - GAME_H / TILE / 2);
          const xm = this.dest.x % 19;
          this.dest.x = xm < 5 || (xm > 10 && xm < 14.5) ? Math.floor(this.dest.x) : Math.ceil(this.dest.x);
          this.dest.y = Math.round(this.dest.y);
        }
        this.dest.x = Math.max(0, Math.min(this.dest.x, world.w - GAME_W / TILE));
        this.dest.y = Math.max(0, Math.min(this.dest.y, world.h - GAME_H / TILE));
        if (!sxp) this.dest.x = old.x;
        if (!syp) this.dest.y = old.y;
      }
    }
    if (this.scrolling) {
      const speed = 45.0;
      const dx = this.dest.x - this.cur.x, dy = this.dest.y - this.cur.y;
      const l = Math.sqrt(dx * dx + dy * dy);
      const rest = l / speed - dt;
      if (rest <= 0) { this.offset = this.dest.clone(); this.scrolling = false; }
      else { this.cur.x += dx / l * speed * dt; this.cur.y += dy / l * speed * dt; this.offset = this.cur.clone(); }
    }
  }
}

/** TextDisplay: the scrolling text of the status bar */
export class TextDisplay {
  text = ''; active = false; xoff = 0; speed = 140; time = 0; maxtime = 0; pingpong = false; showscroll = false; width = 0;
  areaW = 444;
  set(text: string, width: number, scrolling: boolean, duration: number, textSpeed = 7) {
    this.text = text; this.width = width; this.pingpong = false; this.time = 0; this.showscroll = false;
    if (scrolling) {
      if (duration <= 0) { this.xoff = -this.areaW; this.speed = textSpeed * 20; }
      else { this.showscroll = true; this.speed = 0; this.xoff = this.areaW < width ? 0 : -(this.areaW - width) / 2; }
    }
    this.maxtime = duration > 0 ? duration : 1e20;
    if (!scrolling) {
      if (this.areaW < width) { this.pingpong = true; this.speed = (width - this.areaW) / duration; this.xoff = 0; }
      else { this.xoff = -(this.areaW - width) / 2; this.speed = 0; }
    }
    this.active = true;
  }
  tick(dt: number, textSpeed = 7) {
    if (!this.active) return;
    this.time += dt;
    if (this.time > this.maxtime) {
      if (this.showscroll) { this.showscroll = false; this.speed = textSpeed * 20; this.maxtime = 1e20; }
      else this.active = false;
    } else {
      this.xoff += dt * this.speed;
      const nx = Math.round(this.xoff);
      if (this.pingpong) {
        if (this.speed > 0 && this.areaW + nx >= this.width) this.speed = -this.speed;
        else if (this.speed < 0 && nx <= 0) this.speed = -this.speed;
      } else if (this.xoff >= this.width) this.active = false;
    }
  }
}

export const FONT = '"Enigma DejaVu", "DejaVu Sans Condensed", sans-serif';

export class Renderer {
  g: CanvasRenderingContext2D;
  img: ImageLookup;
  follower = new Follower();
  text = new TextDisplay();
  playerImage = 0; playerImageDuration = 0;
  inventoryModels: Model[] = [];
  constructor(g: CanvasRenderingContext2D, img: ImageLookup) { this.g = g; this.img = img; }

  textWidth(s: string, px = 18) { this.g.font = `${px}px ${FONT}`; return this.g.measureText(s).width; }
  showText(s: string, scrolling: boolean, duration: number) { this.text.set(s, this.textWidth(s), scrolling, duration); }
  updateInventory() {
    const inv = player.inventory(player.current);
    this.inventoryModels = inv.items.map((it) => display.makeModel(it.get_inventory_model()));
    if (this.text.active && this.textInterruptible) this.text.active = false;
  }
  textInterruptible = true;
  tickStatus(dt: number) {
    this.playerImageDuration += dt;
    if (player.current * 12 !== this.playerImage && this.playerImageDuration > 0.1) {
      this.playerImage = (this.playerImage + 1) % 24;
      this.playerImageDuration = 0;
    }
    this.text.tick(dt);
  }

  drawGame() {
    const g = this.g, img = this.img;
    const ox = Math.round(this.follower.offset.x * TILE), oy = Math.round(this.follower.offset.y * TILE);
    g.save();
    g.beginPath(); g.rect(0, 0, GAME_W, GAME_H); g.clip();
    g.fillStyle = '#000'; g.fillRect(0, 0, GAME_W, GAME_H);
    const x0 = Math.max(0, Math.floor(ox / TILE)), y0 = Math.max(0, Math.floor(oy / TILE));
    const x1 = Math.min(world.w, Math.ceil((ox + GAME_W) / TILE) + 1), y1 = Math.min(world.h, Math.ceil((oy + GAME_H) / TILE) + 1);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) drawModel(g, img, display.floor.get(x, y), x * TILE - ox, y * TILE - oy);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) drawModel(g, img, display.items.get(x, y), x * TILE - ox, y * TILE - oy);
    // shadows of stones, then of the actors
    for (let y = y0 - 1; y < y1; y++) for (let x = x0 - 1; x < x1; x++) drawShadow(g, img, display.stones.get(x, y), x * TILE - ox, y * TILE - oy);
    for (const s of display.sprites.sprites) if (s && s.visible && s.model) drawShadow(g, img, s.model, Math.round(s.x * TILE) - ox, Math.round(s.y * TILE) - oy);
    for (const s of display.sprites.sprites) if (s && s.visible && s.model) drawModel(g, img, s.model, Math.round(s.x * TILE) - ox, Math.round(s.y * TILE) - oy);
    for (let y = y0; y < y1; y++) for (let x = x0; x < x1; x++) drawModel(g, img, display.stones.get(x, y), x * TILE - ox, y * TILE - oy);
    // rubber bands and wires (DL_Lines::draw_onepass): one anti-aliased line, thick ones three more one pixel up/left
    for (const l of display.rubbers.values()) {
      const x1 = Math.round(l.x1 * TILE) - ox, y1 = Math.round(l.y1 * TILE) - oy, x2 = Math.round(l.x2 * TILE) - ox, y2 = Math.round(l.y2 * TILE) - oy;
      g.strokeStyle = `rgb(${l.r},${l.g},${l.b})`;
      g.lineWidth = 1;
      const offs = l.thick ? [[0, 0], [-1, 0], [0, -1], [-1, -1]] : [[0, 0]];
      g.beginPath();
      for (const [dx, dy] of offs) { g.moveTo(x1 + dx + 0.5, y1 + dy + 0.5); g.lineTo(x2 + dx + 0.5, y2 + dy + 0.5); }
      g.stroke();
    }
    for (const s of display.effects.sprites) if (s && s.visible && s.model) drawModel(g, img, s.model, Math.round(s.x * TILE) - ox, Math.round(s.y * TILE) - oy);
    g.restore();
  }

  drawStatus(time: number, moves: number | null) {
    const g = this.g;
    const bg = this.img(player.current === 0 ? 'inventory_yin' : 'inventory_yang');
    g.fillStyle = '#000'; g.fillRect(0, 416, 640, 64);
    if (bg) g.drawImage(bg, 0, 416);
    const ps = this.img('player_switch_anim');
    if (ps) g.drawImage(ps, 0, this.playerImage * 32, 32, 32, 140, 416 + 16, 32, 32);
    // time: m'ss" (timefont: 32 px, grey 180)
    const abs = time >= 0 ? time : Math.abs(Math.floor(time));
    let h = Math.trunc(abs / 3600), m = Math.trunc((abs - 3600 * h) / 60), s = Math.trunc(abs) % 60;
    if (h >= 10) { h = 9; m = 59; s = 59; }
    let t: string;
    if (h > 0) t = `${h}:${String(m).padStart(2, '0')}'`;
    else t = (m >= 10 ? String(m).padStart(2, '0') : String(m)) + `'${String(s).padStart(2, '0')}"`;
    g.font = `32px ${FONT}`;
    g.fillStyle = 'rgb(180,180,180)';
    g.textBaseline = 'middle';
    const tw = g.measureText(t).width;
    const tx = moves !== null ? 10 + (100 - 10 - tw) / 2 : 10 + (117 - tw) / 2;
    g.fillText(t, tx, 428 + 43 / 2);
    if (moves !== null) {
      g.font = `14px ${FONT}`; g.fillStyle = '#fff';
      const ms = String(moves);
      g.fillText(ms, 100 + (30 - g.measureText(ms).width) / 2, 428 + 10);
    }
    if (this.text.active) {
      g.save();
      g.beginPath(); g.rect(180, 436, 444, 35); g.clip();
      g.fillStyle = '#000'; g.fillRect(180, 436, 444, 35);
      g.font = `18px ${FONT}`; g.fillStyle = '#fff'; g.textBaseline = 'middle';
      g.fillText(this.text.text, 180 - Math.round(this.text.xoff), 436 + 35 / 2);
      g.restore();
    } else {
      let x = 188;
      for (const md of this.inventoryModels) { drawModel(g, this.img, md, x, 433); x += 36; }
    }
    g.textBaseline = 'alphabetic';
  }
}
