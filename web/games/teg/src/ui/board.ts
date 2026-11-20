// The board of TEG 0.13.0: the default theme's map (640x382), the country overlays at the theme's
// positions, and the army circles exactly where G_country_draw_ejer() puts them. A click is resolved
// through the country image's alpha channel, so the transparent corners of an overlay do not take
// clicks from a neighbour that is drawn below it.
import { CONTINENTS, COUNTRIES, COUNTRY_COUNT, colorOf, NO_COLOR } from '../rules/data.ts';
import type { TegGame } from '../rules/engine.ts';
import type { Assets, ThemeCountry } from './assets.ts';

interface CountryBox {
  file: string;
  x: number;
  y: number;
  w: number;
  h: number;
  cx: number;
  cy: number;
}

export interface BoardSelection {
  /** attack source/destination: red rings as COUNTRY_SELECT_ATTACK */
  attackSource?: number;
  attackTarget?: number;
  /** regroup source/destination: blue rings as COUNTRY_SELECT_REGROUP */
  regroupSource?: number;
  regroupTarget?: number;
  /** placement: white for a country that can take armies, orange for one that cannot */
  placeIn?: number;
  placeOut?: number;
  hover?: number;
}

export class Board {
  readonly canvas: HTMLCanvasElement;
  private readonly ctx: CanvasRenderingContext2D;
  private readonly theme: Assets['theme'];
  private readonly images: Assets['images'];
  private readonly boxes: CountryBox[] = [];
  private readonly alpha: { data: Uint8ClampedArray; w: number; h: number }[] = [];

  constructor(canvas: HTMLCanvasElement, assets: Assets) {
    this.canvas = canvas;
    this.theme = assets.theme;
    this.images = assets.images;
    const ctx = canvas.getContext('2d');
    if (!ctx) throw new Error('no 2d canvas');
    this.ctx = ctx;
    canvas.width = this.theme.boardW;
    canvas.height = this.theme.boardH;
    // the theme's continents and countries are in the same order as g_countries[]
    let id = 0;
    for (const cont of this.theme.continents) {
      for (const c of cont.countries) {
        const x = cont.x + c.x;
        const y = cont.y + c.y;
        // G_country_draw_ejer(): x = x_len + army_x; the ellipse centre is x/2
        this.boxes[id] = {
          file: c.file, x, y, w: c.w, h: c.h,
          cx: x + (c.w + c.armyX) / 2, cy: y + (c.h + c.armyY) / 2,
        };
        this.alpha[id] = this.makeAlpha(assets, c);
        id++;
      }
    }
    if (id !== COUNTRY_COUNT) throw new Error(`theme has ${id} countries, the game ${COUNTRY_COUNT}`);
  }

  private makeAlpha(assets: Assets, c: ThemeCountry): { data: Uint8ClampedArray; w: number; h: number } {
    const off = document.createElement('canvas');
    off.width = c.w;
    off.height = c.h;
    const g = off.getContext('2d');
    if (!g) throw new Error('no 2d canvas');
    const img = assets.images.get(c.file);
    if (!img) throw new Error(`missing country picture ${c.file}`);
    g.drawImage(img, 0, 0);
    return { data: g.getImageData(0, 0, c.w, c.h).data, w: c.w, h: c.h };
  }

  /** the country at a board pixel, or -1 */
  countryAt(x: number, y: number): number {
    // an army circle is the obvious target, even where it pokes out of the country image
    for (let i = COUNTRY_COUNT - 1; i >= 0; i--) {
      const b = this.boxes[i];
      const dx = x - b.cx;
      const dy = y - b.cy;
      if (dx * dx + dy * dy <= 13 * 13) return i;
    }
    for (let i = COUNTRY_COUNT - 1; i >= 0; i--) {
      const b = this.boxes[i];
      const px = Math.floor(x - b.x);
      const py = Math.floor(y - b.y);
      if (px < 0 || py < 0 || px >= b.w || py >= b.h) continue;
      const a = this.alpha[i];
      if (a.data[(py * b.w + px) * 4 + 3] > 8) return i;
    }
    return -1;
  }

  /** the army circle's radius, as G_country_draw_ejer() sizes it */
  private radius(n: number): number {
    const size = n === 0 ? 4 : n === 1 ? 6 : n === 2 ? 6 : n === 3 ? 7 : n === 4 ? 7 : n === 5 ? 8
      : n === 6 ? 8 : n === 7 ? 9 : n === 8 ? 9 : n === 9 ? 10 : n === 10 ? 10 : 11;
    const extra = n === 2 || n === 4 || n === 6 || n === 8 || n === 10 ? 1 : 0;
    return size + extra;
  }

  center(country: number): { x: number; y: number } {
    const b = this.boxes[country];
    return { x: b.cx, y: b.cy };
  }

  /**
   * Draws one frame. `seat` is the viewer for fog of war (-1: show everything, for the end dialog);
   * `pending` shows armies that the player has clicked but not sent yet.
   */
  draw(game: TegGame, seat: number, selection: BoardSelection = {}, pending?: ReadonlyMap<number, number>): void {
    const ctx = this.ctx;
    const t = this.theme;
    ctx.clearRect(0, 0, t.boardW, t.boardH);
    const board = this.images.get(t.board);
    if (board) ctx.drawImage(board, 0, 0);
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      const b = this.boxes[i];
      const img = this.images.get(b.file);
      if (img) ctx.drawImage(img, b.x, b.y);
    }
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      const c = game.countries[i];
      const visible = seat < 0 || !game.options.fogOfWar || game.canSee(seat, i);
      const add = pending?.get(i) ?? 0;
      const n = visible ? c.armies + add : -1;
      const owner = visible ? c.owner : -1;
      const color = owner >= 0 ? colorOf(game.player(owner).color) : NO_COLOR;
      const b = this.boxes[i];
      const r = this.radius(n < 0 ? 2 : n);
      ctx.beginPath();
      ctx.arc(b.cx, b.cy, r, 0, Math.PI * 2);
      ctx.fillStyle = color.fill;
      ctx.fill();
      ctx.lineWidth = 1;
      ctx.strokeStyle = '#000';
      ctx.stroke();
      if (n !== 0) {
        ctx.font = '10px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillStyle = color.text;
        ctx.fillText(n < 0 ? '?' : String(n), b.cx, b.cy + 0.5);
      }
      if (add) {
        ctx.font = 'bold 9px Helvetica, Arial, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'bottom';
        ctx.fillStyle = '#fff';
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2.5;
        ctx.strokeText(`+${add}`, b.cx + r + 5, b.cy - r + 2);
        ctx.fillText(`+${add}`, b.cx + r + 5, b.cy - r + 2);
      }
    }
    const ringR = (country: number | undefined) => {
      if (country === undefined || country < 0 || country >= COUNTRY_COUNT) return 6;
      const n = game.countries[country].armies + (pending?.get(country) ?? 0);
      return this.radius(Math.max(0, n));
    };
    this.ring(selection.attackSource, '#ff0000', 3, ringR(selection.attackSource));
    this.ring(selection.attackTarget, '#ff0000', 3, ringR(selection.attackTarget));
    this.ring(selection.regroupSource, '#0000ff', 2, ringR(selection.regroupSource));
    this.ring(selection.regroupTarget, '#0000ff', 2, ringR(selection.regroupTarget));
    this.ring(selection.placeIn, '#ffffff', 2, ringR(selection.placeIn));
    this.ring(selection.placeOut, '#ff8c00', 2, ringR(selection.placeOut));
    this.ring(selection.hover, '#ffffff', 2, ringR(selection.hover));
  }

  private ring(country: number | undefined, color: string, width: number, r = 6): void {
    if (country === undefined || country < 0 || country >= COUNTRY_COUNT) return;
    const b = this.boxes[country];
    this.ctx.beginPath();
    this.ctx.arc(b.cx, b.cy, r + 3, 0, Math.PI * 2);
    this.ctx.lineWidth = width;
    this.ctx.strokeStyle = color;
    this.ctx.stroke();
  }

  /** the map without a game, for the welcome screen */
  drawStatic(): void {
    const t = this.theme;
    this.ctx.clearRect(0, 0, t.boardW, t.boardH);
    const board = this.images.get(t.board);
    if (board) this.ctx.drawImage(board, 0, 0);
    for (let i = 0; i < COUNTRY_COUNT; i++) {
      const b = this.boxes[i];
      const img = this.images.get(b.file);
      if (img) this.ctx.drawImage(img, b.x, b.y);
    }
  }

  /** the last attack's dice, drawn at the theme's dices_ext_pos (the m2 theme's extended layout) */
  drawDice(src: number, dst: number, srcDice: number[], dstDice: number[], srcColor: string, dstColor: string): void {
    const t = this.theme;
    const p = t.dicePos;
    const e = t.diceExt;
    const draw = (v: number, x: number, y: number) => {
      if (!v) return;
      const img = this.images.get(`dice-${v}.png`);
      if (img) this.ctx.drawImage(img, x, y, img.width, img.height);
    };
    const xs = [e.x1, e.x2, e.x3];
    const ys = [e.y1, e.y2, e.y3];
    const xd = [e.x4, e.x5, e.x6];
    const yd = [e.y4, e.y5, e.y6];
    for (let i = 0; i < 3; i++) {
      draw(srcDice[i] ?? 0, p.x + xs[i], p.y + ys[i]);
      draw(dstDice[i] ?? 0, p.x + xd[i], p.y + yd[i]);
    }
    this.ctx.textAlign = 'center';
    this.ctx.textBaseline = 'top';
    this.ctx.font = 'bold 11px Helvetica, Arial, sans-serif';
    this.ctx.fillStyle = t.diceText.color;
    this.ctx.fillText(COUNTRIES[src].name, p.x + t.diceText.x1, p.y + t.diceText.y1);
    this.ctx.fillStyle = t.diceText.color;
    this.ctx.fillText(COUNTRIES[dst].name, p.x + t.diceText.x2, p.y + t.diceText.y2);
    // the two names in the players' colours, as the original's dice text uses the theme's colour for
    // both; a small colour chip keeps the attacker and defender apart
    this.ctx.fillStyle = srcColor;
    this.ctx.fillRect(p.x + t.diceText.x1 - 4, p.y + t.diceText.y1 + 3, 3, 10);
    this.ctx.fillStyle = dstColor;
    this.ctx.fillRect(p.x + t.diceText.x2 - 4, p.y + t.diceText.y2 + 3, 3, 10);
  }

  /** the map in the original's aspect ratio; call on a resize */
  fit(availableW: number, availableH: number): void {
    const k = Math.min(availableW / this.theme.boardW, availableH / this.theme.boardH);
    this.canvas.style.width = `${Math.max(1, Math.floor(this.theme.boardW * k))}px`;
    this.canvas.style.height = `${Math.max(1, Math.floor(this.theme.boardH * k))}px`;
  }

  /** canvas coordinates from a pointer event */
  point(e: { clientX: number; clientY: number }): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return {
      x: (e.clientX - r.left) * this.theme.boardW / r.width,
      y: (e.clientY - r.top) * this.theme.boardH / r.height,
    };
  }

  /** theme country id → the game's country id (the orders are the same) */
  countryName(id: number): string { return COUNTRIES[id]?.name ?? 'Unknown'; }
  continentName(id: number): string { return CONTINENTS[COUNTRIES[id]?.continent ?? 0].name; }
}
