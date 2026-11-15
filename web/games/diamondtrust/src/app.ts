// Diamond Trust of London on the website: the local hot-seat rules game (and,
// for online rooms, the server-refereed variant in wire.ts). The map,
// unit sprites and title art are the original Diamond Trust graphics.
import { SERVER_SEAT, unpackGame, type GameContext, type StartGame } from '../../../src/sdk/index.ts';
import { Msg } from './proto/diamondtrust.ts';
import {
  gameFromState, packAdjust, packInspector, packMarketAdjust, packMoves, packNext,
  packSalary, packSale, packSync,
} from './wire.ts';
import { assetUrl, loadArt, type Art } from './assets.ts';
import { drawBitmapText, loadBitmapFont, type BitmapFont } from './font.ts';
import { aiChoices, aiInspectorRegion } from './ai.ts';
import {
  ALLOWANCE, DiamondGame, MARKET_POOL, NUM_REGIONS, REGION_COLORS, REGION_NAMES,
  START_MONTHS, UNITS_PER_PLAYER, moveCost, type PlayerChoices,
} from './sim.ts';

type Screen = 'title' | 'local' | 'rules' | 'online';

const CSS = `
.dt-root { position:absolute; inset:0; display:flex; flex-wrap:wrap; gap:12px; align-content:flex-start; justify-content:center;
  background:#202020; color:#eee; font:14px/1.4 system-ui, sans-serif; padding:12px; box-sizing:border-box; overflow:auto; }
.dt-mapwrap { position:relative; flex:0 0 auto; }
.dt-map { width:512px; height:384px; image-rendering:pixelated; background:#000; border:2px solid #9c9cff; cursor:crosshair; }
.dt-side { flex:1 1 380px; max-width:520px; min-width:300px; color:#111; border:2px solid #9c9cff; padding:12px; box-sizing:border-box;
  background-color:#f5f0e6; background-size:256px 192px; image-rendering:pixelated; }
.dt-side h1 { margin:0 0 6px; font:bold 24px 'Times New Roman', serif; color:#111; }
.dt-side h2 { margin:8px 0 4px; font:bold 18px 'Times New Roman', serif; color:#111; }
.dt-side p { margin:4px 0; }
.dt-side button { font:inherit; padding:5px 12px; margin:3px 4px 3px 0; border:1px solid #333; background:#d8d0bd; color:#111; cursor:pointer; }
.dt-side button.primary { background:#3a5fcd; color:#fff; border-color:#1d327a; }
.dt-side button:disabled { opacity:.45; cursor:default; }
.dt-row { display:flex; gap:6px; align-items:center; margin:3px 0; flex-wrap:wrap; }
.dt-row label { min-width:74px; }
.dt-row input, .dt-row select { font:inherit; width:64px; padding:2px 4px; }
.dt-row select { width:150px; }
.dt-small { font-size:12px; color:#555; }
.dt-leak { background:#fff3c4; border:1px solid #c9a227; padding:6px; margin:6px 0; font-size:12px; }
.dt-pass { position:absolute; inset:0; background:rgb(0 0 0 / .88); color:#fff; display:flex; flex-direction:column;
  align-items:center; justify-content:center; text-align:center; padding:20px; box-sizing:border-box; z-index:5; }
.dt-pass h2 { color:#ffd75e; font:bold 28px 'Times New Roman', serif; margin:0 0 10px; }
.dt-pass button { font:inherit; padding:8px 20px; margin-top:14px; }
.dt-badge { display:inline-block; padding:1px 7px; border-radius:3px; background:#3a5fcd; color:#fff; font-size:12px; }
.dt-badge.p1 { background:#3a5fcd; } .dt-badge.p2 { background:#a33; }
.dt-money { font-weight:bold; color:#1d6b2f; }
.dt-warn { color:#a33; }
@media (max-width:1000px) { .dt-map { width:100%; max-width:512px; height:auto; aspect-ratio:4/3; } .dt-root { align-content:flex-start; } }
`;

interface MapRegion { index: number; cx: number; cy: number; area: number }

export class DiamondTrustApp {
  private readonly ctx: GameContext;
  private readonly root: HTMLDivElement;
  private readonly mapWrap: HTMLDivElement;
  private readonly canvas: HTMLCanvasElement;
  private readonly mapCtx: CanvasRenderingContext2D;
  private readonly side: HTMLDivElement;
  private readonly style: HTMLStyleElement;
  private art: Art | null = null;
  private font8: BitmapFont | null = null;
  private unitVisual: { x: number; y: number }[] = [];
  private unitTweens = new Map<number, { fx: number; fy: number; tx: number; ty: number; start: number }>();
  private inspectorVisual = { x: 0, y: 0 };
  private inspectorTween: { fx: number; fy: number; tx: number; ty: number; start: number } | null = null;
  private diamondFlights: { fx: number; fy: number; tx: number; ty: number; start: number }[] = [];
  private prevRegions: number[] = [];
  private prevCarrying: number[] = [];
  private regions: MapRegion[] = [];
  private regionPixels: ImageData | null = null;
  private screen: Screen = 'title';
  private game: DiamondGame | null = null;
  private draft: PlayerChoices | null = null;
  private pass: 0 | 1 | null = null;
  private lastTurnKey = '';
  private selectedRegion = -1;
  private message = '';
  private myPlayer: 0 | 1 = 0;
  private online = false;
  private vsAI = false;
  private aiTimer: number | null = null;
  private waiting = false;
  private lobbyHost: HTMLDivElement | null = null;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.style = document.createElement('style');
    this.style.textContent = CSS;
    document.head.append(this.style);
    this.root = document.createElement('div');
    this.root.className = 'dt-root';
    this.mapWrap = document.createElement('div');
    this.mapWrap.className = 'dt-mapwrap';
    this.canvas = document.createElement('canvas');
    this.canvas.width = 256;
    this.canvas.height = 192;
    this.canvas.className = 'dt-map';
    this.mapWrap.append(this.canvas);
    this.side = document.createElement('div');
    this.side.className = 'dt-side';
    (window as unknown as { __dt?: { app: DiamondTrustApp } }).__dt = { app: this };
    this.root.append(this.mapWrap, this.side);
    host.append(this.root);
    const c = this.canvas.getContext('2d', { willReadFrequently: true });
    if (!c) throw new Error('no 2d context');
    this.mapCtx = c;
    this.canvas.addEventListener('click', (e) => {
      const r = this.canvas.getBoundingClientRect();
      const x = Math.floor((e.clientX - r.left) * 256 / r.width);
      const y = Math.floor((e.clientY - r.top) * 192 / r.height);
      this.selectedRegion = this.regionAt(x, y);
      this.render();
    });
    window.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') { if (this.screen === 'local') { this.screen = 'title'; this.game = null; } else this.screen = 'title'; this.render(); }
    }, { signal: ctx.signal });
  }

  async start(): Promise<void> {
    this.art = await loadArt();
    this.font8 = await loadBitmapFont('font8.png', 1, 4);
    const paper = assetUrl('paper.png');
    if (paper) this.side.style.backgroundImage = `linear-gradient(rgb(245 240 230 / .82), rgb(245 240 230 / .82)), url(${paper})`;
    this.parseMap();
    this.ctx.frame((t) => this.animate(t));
    this.render();
  }

  private parseMap(): void {
    if (!this.art) return;
    const c = document.createElement('canvas');
    c.width = 256; c.height = 192;
    const x = c.getContext('2d', { willReadFrequently: true });
    if (!x) return;
    x.drawImage(this.art.map, 0, 0);
    const data = x.getImageData(0, 0, 256, 192);
    this.regionPixels = data;
    const sums = REGION_NAMES.map(() => ({ x: 0, y: 0, n: 0 }));
    for (let y = 0; y < 192; y++) for (let px = 0; px < 256; px++) {
      const i = (y * 256 + px) * 4;
      const r = data.data[i], g = data.data[i + 1], b = data.data[i + 2];
      for (let reg = 0; reg < REGION_COLORS.length; reg++) {
        const [cr, cg, cb] = REGION_COLORS[reg];
        if (r === cr && g === cg && b === cb) { sums[reg].x += px; sums[reg].y += y; sums[reg].n++; break; }
      }
    }
    this.regions = sums.map((s, i) => ({ index: i, cx: s.n ? Math.round(s.x / s.n) : 128, cy: s.n ? Math.round(s.y / s.n) : 96, area: s.n }));
  }

  private regionAt(x: number, y: number): number {
    if (!this.regionPixels || x < 0 || y < 0 || x >= 256 || y >= 192) return -1;
    const i = (y * 256 + x) * 4;
    const r = this.regionPixels.data[i], g = this.regionPixels.data[i + 1], b = this.regionPixels.data[i + 2];
    for (let reg = 0; reg < REGION_COLORS.length; reg++) {
      const [cr, cg, cb] = REGION_COLORS[reg];
      if (r === cr && g === cg && b === cb) return reg;
    }
    return -1;
  }

  private render(): void {
    if (!this.art) return;
    this.syncVisuals();
    this.drawMap();
    this.drawSide();
  }

  private resetVisuals(): void {
    this.unitVisual = []; this.unitTweens.clear(); this.inspectorVisual = { x: 0, y: 0 };
    this.inspectorTween = null; this.diamondFlights = []; this.prevRegions = []; this.prevCarrying = [];
  }

  private unitTarget(g: DiamondGame, global: number): { x: number; y: number } {
    const i = global % UNITS_PER_PLAYER;
    const u = g.units[global];
    const reg = this.regions[u.region];
    if (!reg) return { x: 128, y: 96 };
    return { x: reg.cx - 16 + (i - 1) * 12, y: reg.cy - 16 + (i % 2) * 8 };
  }

  private syncVisuals(): void {
    const g = this.game;
    if (!g) return;
    if (this.unitVisual.length !== 6) {
      this.unitVisual = g.units.map((_, i) => this.unitTarget(g, i));
      this.prevRegions = g.regions.slice();
      this.prevCarrying = g.units.map((u) => u.carrying);
    }
    const now = performance.now();
    for (let i = 0; i < 6; i++) {
      const target = this.unitTarget(g, i);
      const current = this.unitVisual[i];
      const old = this.unitTweens.get(i);
      if (old && (old.tx !== target.x || old.ty !== target.y)) this.unitTweens.delete(i);
      if (!this.unitTweens.has(i) && (Math.abs(current.x - target.x) > 0.5 || Math.abs(current.y - target.y) > 0.5)) {
        this.unitTweens.set(i, { fx: current.x, fy: current.y, tx: target.x, ty: target.y, start: now });
      }
    }
    const insp = this.regions[g.inspector];
    if (insp) {
      const tx = insp.cx - 16, ty = insp.cy - 20;
      if (this.inspectorVisual.x === 0 && this.inspectorVisual.y === 0) this.inspectorVisual = { x: tx, y: ty };
      if (this.inspectorTween) {
        if (this.inspectorTween.tx !== tx || this.inspectorTween.ty !== ty) this.inspectorTween = null;
      }
      if (!this.inspectorTween && (Math.abs(this.inspectorVisual.x - tx) > 0.5 || Math.abs(this.inspectorVisual.y - ty) > 0.5)) {
        this.inspectorTween = { fx: this.inspectorVisual.x, fy: this.inspectorVisual.y, tx, ty, start: now };
      }
    }
    // A region losing diamonds while an agent's carried count grows: fly a diamond.
    if (this.prevRegions.length) {
      for (let r = 2; r < NUM_REGIONS; r++) {
        if (g.regions[r] >= this.prevRegions[r]) continue;
        for (let i = 0; i < 6; i++) {
          if (g.units[i].region !== r || g.units[i].carrying <= this.prevCarrying[i]) continue;
          const reg = this.regions[r];
          const target = this.unitTarget(g, i);
          if (reg) this.diamondFlights.push({ fx: reg.cx, fy: reg.cy, tx: target.x + 16, ty: target.y + 16, start: now });
          break;
        }
      }
    }
    this.prevRegions = g.regions.slice();
    this.prevCarrying = g.units.map((u) => u.carrying);
  }

  private animate(t: number): void {
    if (!this.root.isConnected || !this.game || (this.screen !== 'local' && this.screen !== 'online')) return;
    let active = false;
    for (const [i, tw] of this.unitTweens) {
      const p = Math.min(1, (t - tw.start) / 260);
      const e = 1 - (1 - p) * (1 - p);
      this.unitVisual[i] = { x: tw.fx + (tw.tx - tw.fx) * e, y: tw.fy + (tw.ty - tw.fy) * e };
      if (p >= 1) this.unitTweens.delete(i); else active = true;
    }
    if (this.inspectorTween) {
      const tw = this.inspectorTween;
      const p = Math.min(1, (t - tw.start) / 260);
      const e = 1 - (1 - p) * (1 - p);
      this.inspectorVisual = { x: tw.fx + (tw.tx - tw.fx) * e, y: tw.fy + (tw.ty - tw.fy) * e };
      if (p >= 1) this.inspectorTween = null; else active = true;
    }
    for (let i = this.diamondFlights.length - 1; i >= 0; i--) {
      const f = this.diamondFlights[i];
      const p = (t - f.start) / 420;
      if (p >= 1) this.diamondFlights.splice(i, 1); else active = true;
    }
    if (active) this.drawMap();
  }

  private drawMap(): void {
    const c = this.mapCtx;
    if (!this.art) return;
    c.clearRect(0, 0, 256, 192);
    c.drawImage(this.art.map, 0, 0);
    c.drawImage(this.art.names, 0, 0);
    for (const r of this.regions) {
      if (r.area < 100) continue;
      c.fillStyle = r.index === this.selectedRegion ? 'rgba(255,255,0,0.18)' : 'rgba(0,0,0,0)';
      c.fillRect(r.cx - 26, r.cy - 18, 52, 36);
    }
    const g = this.game;
    if (g) {
      for (let r = 2; r < NUM_REGIONS; r++) {
        const reg = this.regions[r];
        if (!reg) continue;
        if (this.font8) drawBitmapText(c, this.font8, String(g.regions[r]), reg.cx, reg.cy - 20, '#111', 'center');
      }
      for (let p = 0; p < 2; p++) {
        const reg = this.regions[p];
        if (reg) {
          if (this.font8) drawBitmapText(c, this.font8, String(g.diamonds[p]), reg.cx, reg.cy - 12, '#111', 'center');
        }
      }
      for (let p = 0; p < 2; p++) {
        for (let i = 0; i < UNITS_PER_PLAYER; i++) {
          const u = g.unit(p as 0 | 1, i);
          const reg = this.regions[u.region];
          if (!reg) continue;
          const sprite = p === 0 ? this.art.playerUnits : this.art.enemyUnits;
          const global = p * UNITS_PER_PLAYER + i;
          const vis = this.unitVisual[global] ?? { x: reg.cx - 16 + (i - 1) * 12, y: reg.cy - 16 + (i % 2) * 8 };
          c.drawImage(sprite, 0, i * 33, 32, 32, Math.round(vis.x), Math.round(vis.y), 32, 32);
          if (u.carrying) {
            c.drawImage(this.art.diamond, 0, 0, 32, 32, Math.round(vis.x + 28), Math.round(vis.y + 4), 16, 16);
            if (this.font8) drawBitmapText(c, this.font8, String(u.carrying), Math.round(vis.x + 36), Math.round(vis.y + 2), '#fff', 'center');
          }
        }
      }
      if (this.regions[g.inspector]) c.drawImage(this.art.inspector, Math.round(this.inspectorVisual.x), Math.round(this.inspectorVisual.y));
      for (const f of this.diamondFlights) {
        const p = Math.min(1, (performance.now() - f.start) / 420);
        const x = f.fx + (f.tx - f.fx) * p, y = f.fy + (f.ty - f.fy) * p;
        c.drawImage(this.art.diamond, 0, 0, 32, 32, Math.round(x - 8), Math.round(y - 8), 16, 16);
      }
    }
    if (this.font8) drawBitmapText(c, this.font8, 'Diamond Trust of London', 4, 182, '#111');
  }

  private drawSide(): void {
    const s = this.side;
    if (!this.art) { s.innerHTML = '<p>Loading…</p>'; return; }
    if (this.screen === 'title') { this.drawTitle(); return; }
    if (this.screen === 'rules') { this.drawRules(); return; }
    if (this.screen === 'online') { if (this.game) this.drawLocal(); else this.drawOnline(); return; }
    this.drawLocal();
  }

  private drawTitle(): void {
    const s = this.side;
    s.innerHTML = `<h1>Diamond Trust of London</h1>
      <p>Two diamond firms, six Angolan regions, one UN inspector. Move agents, bid for diamonds,
      pay salaries, bribe the other side, and finish the year with more diamonds in your vault.</p>
      <p class="dt-small">Jason Rohrer's 2011 game; this port follows the open-source DS rules.</p>
      <p class="dt-small">The computer opponent is a rule-aware browser AI; see the README for how it differs from the DS Monte-Carlo AI.</p>
      <p><button class="primary" data-act="local">2 players (hot-seat)</button></p>
      <p><button data-act="ai">1 player vs computer</button></p>
      <p><button data-act="online">Online game (website rooms)</button></p>
      <p><button data-act="rules">Rules / controls</button></p>
      <p class="dt-small">Hot-seat: the device is passed between the two players; secret salaries,
      bribes, moves, bids and market sales are entered behind a pass screen.</p>`;
    s.querySelector('[data-act="local"]')?.addEventListener('click', () => this.startLocal(false));
    s.querySelector('[data-act="ai"]')?.addEventListener('click', () => this.startLocal(true));
    s.querySelector('[data-act="online"]')?.addEventListener('click', () => this.startOnline());
    s.querySelector('[data-act="rules"]')?.addEventListener('click', () => { this.screen = 'rules'; this.render(); });
    this.drawTitleMap();
  }

  private drawTitleMap(): void {
    if (!this.art) return;
    this.mapCtx.clearRect(0, 0, 256, 192);
    this.mapCtx.globalAlpha = 0.55;
    this.mapCtx.drawImage(this.art.map, 0, 0);
    this.mapCtx.globalAlpha = 1;
    this.mapCtx.drawImage(this.art.title, 0, 24);
  }

  private drawRules(): void {
    this.side.innerHTML = `<h1>Rules</h1>
      <p><b>Goal:</b> after ${START_MONTHS} months, have more diamonds in your London/Antwerp vault than your opponent. Ties go to money.</p>
      <p><b>Each month:</b> diamonds accumulate; agents may receive salary (at home) and bribe enemy agents
      (where they share a region); both sides secretly move agents and bid for the diamonds or bribe the
      UN inspector; returning agents deposit their diamonds; the inspector moves and confiscates diamonds;
      winning bids receive the region's diamonds; then both sides may sell diamonds on the open market.</p>
      <p><b>Bribes:</b> a unit is bribed when total bribes exceed total salary. The opponent sees a bribed
      agent's move and bid in the peek step, and can be paid more salary to cancel the bribe.</p>
      <p><b>Hot-seat:</b> follow the pass screen. Your money, salaries, bribes and choices are hidden from
      the other player until the peek/commit step.</p>
      <p><b>Vs computer:</b> you play London; the computer plays Antwerp and follows the same rules.
      It pays salaries, bribes co-located agents, bids for regions, uses its peek and moves the inspector.</p>
      <p><b>Online:</b> the server is the referee. It keeps the hidden money, salaries, bribes, moves
      and bids and sends each seat only the public board plus that seat's own private information.</p>
      <p><button data-act="back">Back</button></p>`;
    this.side.querySelector('[data-act="back"]')?.addEventListener('click', () => { this.screen = 'title'; this.render(); });
    this.drawTitleMap();
  }

  private startLocal(vsAI = false): void {
    this.screen = 'local';
    this.resetVisuals();
    this.online = false;
    this.waiting = false;
    this.vsAI = vsAI;
    this.game = new DiamondGame((Date.now() >>> 0) || 1);
    this.draft = null; this.lastTurnKey = ''; this.pass = vsAI ? null : 0;
    this.message = vsAI ? 'You are London; the computer is Antwerp.' : 'Pass the device to Player 1.';
    this.render();
  }

  private startOnline(): void {
    this.screen = 'online';
    this.waiting = false;
    this.vsAI = false;
    this.online = true;
    this.game = null;
    this.message = 'Connecting…';
    this.lobbyHost = document.createElement('div');
    this.lobbyHost.className = 'dt-lobby';
    this.lobbyHost.style.cssText = 'position:fixed;inset:0;z-index:20;overflow:auto;background:#fff';
    document.body.append(this.lobbyHost);
    this.render();
    void this.connectOnline();
  }

  private async connectOnline(): Promise<void> {
    try {
      const hostEl = this.lobbyHost;
      if (!hostEl) return;
      const round = await this.ctx.lobby(hostEl, {
        title: 'Diamond Trust online', seats: { min: 2, max: 2 },
        seatNames: ['London', 'Antwerp'],
      });
      hostEl.remove(); this.lobbyHost = null;
      this.myPlayer = round.you === 1 ? 1 : 0;
      this.message = `Connected as ${REGION_NAMES[this.myPlayer]}. The server runs the rules.`;
      this.ctx.rooms.on('message', ({ from, data }) => this.onlineMessage(from, data));
      this.sendAction(packSync());
      this.render();
    } catch {
      this.lobbyHost?.remove(); this.lobbyHost = null;
      this.screen = 'title';
      this.online = false;
      this.message = '';
      this.render();
    }
  }

  private drawOnline(): void {
    this.side.innerHTML = `<h1>Online game</h1>
      <p>${this.message}</p>
      <p class="dt-small">Both players must be in the room. The server is the referee: it keeps the
      hidden money, salaries, bribes, moves and bids and sends each seat only its own view.</p>
      <p><button data-act="back">Back</button></p>`;
    this.side.querySelector('[data-act="back"]')?.addEventListener('click', () => {
      this.ctx.rooms?.leave?.(); this.lobbyHost?.remove(); this.lobbyHost = null; this.online = false; this.screen = 'title'; this.render();
    });
    this.drawTitleMap();
  }

  private onlineMessage(from: number, data: Uint8Array): void {
    if (!this.online) return;
    let msg: Msg;
    try { msg = unpackGame(Msg, data); } catch { return; }
    if (from !== SERVER_SEAT || !msg._isState) return;
    try {
      const first = !this.game;
      this.game = gameFromState(msg.state, this.myPlayer);
      if (first) this.resetVisuals();
      this.waiting = false;
      this.draft = null;
      this.lastTurnKey = '';
      this.message = '';
      this.render();
    } catch { /* malformed server state: keep the last one */ }
  }

  private sendAction(data: Uint8Array): void {
    this.ctx.rooms.send(data, 'server');
  }

  private drawLocal(): void {
    const g = this.game;
    if (!g) { this.drawOnline(); return; }
    if (this.online) this.pass = null;
    if (this.vsAI && g.active === 1 && g.phase !== 'end') {
      this.side.innerHTML = `<h1>Diamond Trust of London</h1><h2>The computer is thinking…</h2>
        <p>Month ${g.round} / ${START_MONTHS}, ${g.phase}.</p>`;
      this.scheduleAI();
      return;
    }
    if (this.online && (this.waiting || (g.phase !== 'end' && g.active !== this.myPlayer))) {
      this.side.innerHTML = `<h1>Diamond Trust of London</h1><h2>Waiting for the other player…</h2>
        <p>Month ${g.round} / ${START_MONTHS}, ${g.phase}.</p>
        <p class="dt-small">The server sends the next state after the other player's choice.</p>`;
      return;
    }
    if (this.pass !== null) { this.drawPass(); return; }
    const active = g.active;
    const key = `${g.phase}:${active}:${g.submitted[0]}:${g.submitted[1]}:${g.round}`;
    if (key !== this.lastTurnKey) {
      this.lastTurnKey = key;
      this.draft = null;
    }
    if ((g.phase === 'salary' || g.phase === 'moves' || g.phase === 'adjust' || g.phase === 'market' || g.phase === 'marketAdjust')
      && this.pass === null) this.ensureDraft(g);
    const playerBadge = `<span class="dt-badge ${active === 0 ? 'p1' : 'p2'}">${REGION_NAMES[active]}</span>`;
    let html = `<h1>Diamond Trust of London</h1>
      <p>Month <b>${g.round}</b> / ${START_MONTHS} &nbsp; ${playerBadge} &nbsp; <span class="dt-small">${g.phase}</span></p>
      <p>Your money: <span class="dt-money">${g.money[active]}</span> &nbsp; Diamonds: <b>${g.diamonds[active]}</b>
      &nbsp; Opponent money: <b>?</b> &nbsp; Opponent diamonds: <b>${g.diamonds[1 - active]}</b></p>
      <p>Inspector: <b>${REGION_NAMES[g.inspector]}</b> &nbsp; Bids are public after the month.</p>`;
    if (this.message) html += `<p class="${this.message.includes('Not enough') ? 'dt-warn' : 'dt-small'}">${this.message}</p>`;
    html += this.phaseHtml(g);
    this.side.innerHTML = html;
    this.bindPhase(g);
  }

  private drawPass(): void {
    const p = this.pass!;
    this.side.innerHTML = `<div class="dt-pass"><h2>Pass to ${REGION_NAMES[p]}</h2>
      <p>Hand the device to ${p === 0 ? 'Player 1 (London)' : 'Player 2 (Antwerp)'}.</p>
      <p class="dt-small">Their salaries, bribes, moves, bids and sales stay hidden.</p>
      <button class="primary" data-act="ready">I am ${REGION_NAMES[p]}</button></div>`;
    this.side.querySelector('[data-act="ready"]')?.addEventListener('click', () => { this.pass = null; this.draft = null; this.message = ''; this.render(); });
  }

  private ensureDraft(g: DiamondGame): void {
    if (this.draft) return;
    const c = g.choicesFor(g.active);
    if (g.phase === 'moves') {
      for (let i = 0; i < UNITS_PER_PLAYER; i++) c.moves[i].dest = g.unit(g.active, i).region;
    }
    if (g.phase === 'market') c.sale = 0;
    this.draft = c;
  }

  private phaseHtml(g: DiamondGame): string {
    const p = g.active;
    if (g.phase === 'peek') return this.peekHtml(g, g.active);
    if (g.phase === 'marketPeek') return this.salePeekHtml(g, g.active);
    if (g.phase === 'salary') return this.salaryHtml(g);
    if (g.phase === 'moves' || g.phase === 'adjust') return this.moveHtml(g);
    if (g.phase === 'inspector') return this.inspectorHtml(g);
    if (g.phase === 'sale') return this.saleHtml(g);
    if (g.phase === 'market' || g.phase === 'marketAdjust') return this.marketHtml(g);
    if (g.phase === 'roundEnd') return this.roundEndHtml(g);
    if (g.phase === 'end') return this.endHtml(g);
    return `<p>Player ${p + 1}'s turn.</p>`;
  }

  private salaryHtml(g: DiamondGame): string {
    const p = g.active;
    const c = this.draft!;
    let h = `<h2>Salaries and bribes — ${REGION_NAMES[p]}</h2>
      <p class="dt-small">Salary can be paid to agents at home; a bribe can be paid to an enemy agent in the same producing region.</p>`;
    for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      const u = g.unit(p, i);
      h += `<div class="dt-row"><label>Agent ${i + 1} (${REGION_NAMES[u.region]})</label>`;
      if (g.canSalary(p, i)) h += `Salary <input data-sal="${i}" type="number" min="0" value="${c.salary[i]}">`;
      if (g.canBribe(p, i)) {
        const targets = g.bribeTargets(p, i);
        if (targets.length > 1) {
          h += `Bribe <select data-bribetarget="${i}">${targets.map((t) => `<option value="${t - (1 - p) * UNITS_PER_PLAYER}" ${c.bribeTarget[i] === t - (1 - p) * UNITS_PER_PLAYER ? 'selected' : ''}>agent ${t % 3 + 1}</option>`).join('')}</select>`;
        } else {
          h += `Bribe agent ${targets[0] % 3 + 1}`;
        }
        h += ` <input data-bribe="${i}" type="number" min="0" value="${c.bribe[i]}">`;
      }
      h += `</div>`;
    }
    h += `<p>Spent: <b>${g.cost(p, c)}</b> / ${g.money[p]} money. <span class="dt-small">Bribes only count if they exceed the agent's total salary.</span></p>
      <p><button class="primary" data-act="submit">Ready</button></p>`;
    return h;
  }

  private moveHtml(g: DiamondGame): string {
    const p = g.active;
    const c = this.draft!;
    let h = `<h2>Move and bid — ${REGION_NAMES[p]}</h2>
      <p class="dt-small">Moving inside Angola costs 1; to/from home costs 2. A bid is paid even if you lose.
      In the inspector's region, bid 0 and bribe the inspector instead.</p>`;
    for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      const u = g.unit(p, i), m = c.moves[i];
      const options = REGION_NAMES.map((_n, r) => r).filter((r) => r !== 1 - p)
        .map((r) => `<option value="${r}" ${m.dest === r ? 'selected' : ''}>${REGION_NAMES[r]}${r === g.inspector ? ' (inspector)' : ''}</option>`).join('');
      h += `<div class="dt-row"><label>Agent ${i + 1} in ${REGION_NAMES[u.region]}</label>
        <select data-dest="${i}">${options}</select>
        ${m.dest === g.inspector ? `<span>Inspector bribe</span><input data-ibribe="${i}" type="number" min="0" value="${m.bribe}">`
          : m.dest >= 2 ? `<span>Bid</span><input data-bid="${i}" type="number" min="0" value="${m.bid}">` : ''}
        <span class="dt-small">cost ${moveCost(u.region, m.dest)}</span></div>`;
    }
    h += `<p>Total spent: <b>${g.cost(p, c)}</b> / ${g.money[p]} money.
      <span class="dt-small">One agent per producing region; the form fixes duplicate destinations.</span></p>
      ${this.leakHtml(g, p)}
      <p><button class="primary" data-act="submit">Ready</button></p>`;
    return h;
  }

  private peekHtml(g: DiamondGame, p: 0 | 1): string {
    return `<h2>Peek — ${REGION_NAMES[p]}</h2>
      <p>A bribed enemy agent reveals its move and bid to you. The other side does not know what you saw.</p>
      ${this.leakHtml(g, p)}
      <p><button class="primary" data-act="adjust">Adjust your move</button></p>`;
  }

  private salePeekHtml(g: DiamondGame, p: 0 | 1): string {
    const leak = g.saleLeaks[p];
    return `<h2>Market peek — ${REGION_NAMES[p]}</h2>
      <p>${leak === null ? 'No bribed agent is in the enemy home base; your sale quantity stays secret.'
        : `A bribed agent reveals that ${REGION_NAMES[1 - p]} is selling <b>${leak}</b> diamonds.`}</p>
      <p><button class="primary" data-act="marketAdjust">Adjust your sale</button></p>`;
  }

  private leakHtml(g: DiamondGame, p: 0 | 1): string {
    const leaks = g.leaks[p];
    if (!leaks.length) return `<div class="dt-small">You have no bribed enemy agents this month.</div>`;
    return `<div class="dt-leak"><b>Bribed enemy agents:</b><br>${leaks.map((l) =>
      `Agent ${l.unit + 1}: destination ${REGION_NAMES[l.dest]}, bid ${l.bid}, inspector bribe ${l.bribe}, salary ${l.salary}, bribes ${l.bribeTotal}`).join('<br>')}</div>`;
  }

  private inspectorHtml(g: DiamondGame): string {
    let h = `<h2>Move the UN inspector — ${REGION_NAMES[g.active]}</h2>
      <p>Your bribe won. Choose the inspector's new region (including staying). Units carrying diamonds there lose them.</p>
      <div class="dt-row"><label>Region</label><select data-act="inspector-region">${REGION_NAMES.map((n, r) => `<option value="${r}">${n}</option>`).join('')}</select></div>
      <p><button class="primary" data-act="inspector">Move</button></p>`;
    void h; return h;
  }

  private saleHtml(g: DiamondGame): string {
    const rows = REGION_NAMES.map((name, r) => r >= 2 ? `${name}: ${g.regions[r]} diamond(s)` : '').filter(Boolean).join('<br>');
    return `<h2>Diamond sale</h2>
      <p>Regions: </p><p class="dt-small">${rows}</p>
      <p>The UN inspector in <b>${REGION_NAMES[g.inspector]}</b> blocks sales there. Bids were paid when moves were chosen;
      the highest unique bid takes the region's diamonds.</p>
      <p><button class="primary" data-act="market">Continue to the open market</button></p>`;
  }

  private marketHtml(g: DiamondGame): string {
    const p = g.active;
    const c = this.draft!;
    return `<h2>Open market — ${REGION_NAMES[p]}</h2>
      <p>You have <b>${g.diamonds[p]}</b> diamonds in your vault. Sell 0 to receive the ${ALLOWANCE}-money allowance;
      otherwise the ${MARKET_POOL}-money pool is split by the diamonds both sides sell.</p>
      <div class="dt-row"><label>Sell</label><input data-sale type="number" min="0" max="${g.diamonds[p]}" value="${c.sale}"> diamonds</div>
      ${this.leakHtml(g, p)}
      <p><button class="primary" data-act="submit">Ready</button></p>`;
  }

  private roundEndHtml(g: DiamondGame): string {
    return `<h2>Month ${g.round - 1} complete</h2>
      <p>London diamonds: <b>${g.diamonds[0]}</b> &nbsp; Antwerp diamonds: <b>${g.diamonds[1]}</b></p>
      <p class="dt-small">Money: London ${g.money[0]}, Antwerp ${g.money[1]}. The next month's diamonds are accumulating.</p>
      <p><button class="primary" data-act="next">Next month</button></p>`;
  }

  private endHtml(g: DiamondGame): string {
    return `<h2>End of the year</h2>
      <p>London: <b>${g.diamonds[0]}</b> diamonds, ${g.money[0]} money.<br>
      Antwerp: <b>${g.diamonds[1]}</b> diamonds, ${g.money[1]} money.</p>
      <p><b>${g.result?.reason ?? 'Game over'}</b></p>
      <p><button class="primary" data-act="new">New game</button></p>`;
  }

  private bindPhase(g: DiamondGame): void {
    const q = (s: string): HTMLElement | null => this.side.querySelector(s) as HTMLElement | null;
    const p = g.active;
    const refresh = (): void => { this.render(); };
    for (let i = 0; i < UNITS_PER_PLAYER; i++) {
      q(`[data-sal="${i}"]`)?.addEventListener('input', (e) => {
        if (!this.draft) return;
        this.draft.salary[i] = Math.max(0, Number((e.target as HTMLInputElement).value) || 0);
        this.render();
      });
      q(`[data-bribe="${i}"]`)?.addEventListener('input', (e) => {
        if (!this.draft) return;
        this.draft.bribe[i] = Math.max(0, Number((e.target as HTMLInputElement).value) || 0);
        this.render();
      });
      q(`[data-bribetarget="${i}"]`)?.addEventListener('change', (e) => {
        if (!this.draft) return;
        this.draft.bribeTarget[i] = Number((e.target as HTMLSelectElement).value) || 0;
        this.render();
      });
      q(`[data-dest="${i}"]`)?.addEventListener('change', (e) => {
        if (!this.draft) return;
        this.draft.moves[i].dest = Number((e.target as HTMLSelectElement).value);
        this.draft.moves[i].bid = 0; this.draft.moves[i].bribe = 0;
        this.render();
      });
      q(`[data-bid="${i}"]`)?.addEventListener('input', (e) => {
        if (!this.draft) return;
        this.draft.moves[i].bid = Math.max(0, Number((e.target as HTMLInputElement).value) || 0);
        this.render();
      });
      q(`[data-ibribe="${i}"]`)?.addEventListener('input', (e) => {
        if (!this.draft) return;
        this.draft.moves[i].bribe = Math.max(0, Number((e.target as HTMLInputElement).value) || 0);
        this.render();
      });
    }
    q('[data-sale]')?.addEventListener('input', (e) => {
      if (this.draft) this.draft.sale = Math.max(0, Number((e.target as HTMLInputElement).value) || 0);
    });
    q('[data-act="submit"]')?.addEventListener('click', () => this.submit());
    q('[data-act="adjust"]')?.addEventListener('click', () => {
      if (this.online) {
        this.sendAction(packAdjust()); this.waiting = true; this.message = 'Waiting for the server…'; this.render();
        return;
      }
      g.startAdjust(g.active); this.draft = null; this.message = '';
      this.render();
    });
    q('[data-act="marketAdjust"]')?.addEventListener('click', () => {
      if (this.online) {
        this.sendAction(packMarketAdjust()); this.waiting = true; this.message = 'Waiting for the server…'; this.render();
        return;
      }
      g.startMarketAdjust(g.active); this.draft = null; this.message = '';
      this.render();
    });
    q('[data-act="inspector"]')?.addEventListener('click', () => {
      const sel = this.side.querySelector('[data-act="inspector-region"]') as HTMLSelectElement | null;
      if (this.online) {
        this.sendAction(packInspector(Number(sel?.value ?? g.inspector)));
        this.waiting = true;
        this.message = 'Waiting for the server…';
        this.render();
      } else {
        g.resolveInspector(Number(sel?.value ?? g.inspector));
        this.message = 'The inspector has moved.';
        this.render();
      }
    });
    q('[data-act="market"]')?.addEventListener('click', () => {
      if (this.online) {
        this.sendAction(packNext()); this.waiting = true; this.message = 'Waiting for the server…'; this.render();
        return;
      }
      g.beginMarket(); this.pass = this.vsAI ? null : 0; this.message = '';
      this.render();
    });
    q('[data-act="next"]')?.addEventListener('click', () => {
      if (this.online) {
        this.sendAction(packNext()); this.waiting = true; this.message = 'Waiting for the server…'; this.render();
        return;
      }
      g.nextRound(); this.pass = this.vsAI ? null : 0; this.message = '';
      this.render();
    });
    q('[data-act="new"]')?.addEventListener('click', () => { this.startLocal(this.vsAI); });
    void refresh; void p;
  }

  private scheduleAI(): void {
    if (!this.vsAI || this.aiTimer !== null || !this.game) return;
    this.aiTimer = window.setTimeout(() => {
      this.aiTimer = null;
      this.aiStep();
    }, 350);
  }

  private aiStep(): void {
    const g = this.game;
    if (!this.vsAI || !g || g.active !== 1 || g.phase === 'end') return;
    try {
      if (g.phase === 'salary') { g.setChoices(1, aiChoices(g, 1)); g.submitSalary(1); }
      else if (g.phase === 'moves' || g.phase === 'adjust') { g.setChoices(1, aiChoices(g, 1)); g.submitMoves(1); }
      else if (g.phase === 'market' || g.phase === 'marketAdjust') {
        g.setChoices(1, aiChoices(g, 1)); g.submitSale(1);
      } else if (g.phase === 'inspector') g.resolveInspector(aiInspectorRegion(g));
      this.draft = null;
      this.message = '';
      this.render();
      if (g.active === 1) this.scheduleAI();
    } catch { /* an illegal AI move leaves the game on the human turn */ }
  }

  private submit(): void {
    const g = this.game;
    if (!g || !this.draft) return;
    const p = g.active;
    if (this.online) {
      if (p !== this.myPlayer) return;
      let data: Uint8Array;
      if (g.phase === 'salary') data = packSalary(this.draft);
      else if (g.phase === 'moves' || g.phase === 'adjust') data = packMoves(this.draft);
      else if (g.phase === 'market' || g.phase === 'marketAdjust') data = packSale(this.draft.sale);
      else return;
      this.sendAction(data);
      this.draft = null;
      this.waiting = true;
      this.message = 'Waiting for the server…';
      this.render();
      return;
    }
    g.setChoices(p, this.draft);
    let ok = false;
    if (g.phase === 'salary') ok = g.submitSalary(p);
    else if (g.phase === 'moves' || g.phase === 'adjust') ok = g.submitMoves(p);
    else if (g.phase === 'market' || g.phase === 'marketAdjust') ok = g.submitSale(p);
    if (!ok) { this.message = 'Not enough money, or that choice is not allowed.'; this.render(); return; }
    this.draft = null;
    this.message = '';
    if (this.vsAI) {
      if (g.active === 1 && g.phase !== 'end') this.scheduleAI();
    } else if (g.phase === 'peek' || g.phase === 'marketPeek') {
      this.pass = 0;
    } else if (g.phase === 'inspector') {
      this.pass = g.active;
    } else if (g.phase === 'salary' || g.phase === 'moves' || g.phase === 'adjust'
      || g.phase === 'market' || g.phase === 'marketAdjust') {
      this.pass = g.active;
    }
    this.render();
  }

  stop(): void { this.style.remove(); this.root.remove(); }
}

export const start: StartGame = async (host, ctx) => {
  const app = new DiamondTrustApp(host, ctx);
  await app.start();
  return { stop: () => app.stop() };
};
