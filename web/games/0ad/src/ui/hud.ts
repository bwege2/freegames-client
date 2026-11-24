// The slice's HUD, in the original's bronze/stone language: resources, population, selection,
// the building/training commands with the original portrait icons and costs, a minimap, pause and
// end screens. It reads the world directly and calls back into the game for every command.
import type { World } from '../sim/world.ts';
import type { Entity } from '../sim/types.ts';
import type { Resource } from '../data/template-info.ts';
import { RESOURCE_LABEL } from '../sim/economy.ts';
import { assetUrl } from '../assets.ts';

type Rgb = [number, number, number];

export interface HudCallbacks {
  onStart(civ: string): void;
  onOnline(): void;
  onLoad(): void;
  onSave(): void;
  onControls(): void;
  onQuitToMenu(): void;
  onExit(): void;
  onResume(): void;
  onRestart(): void;
  onTrain(template: string): void;
  onBuild(template: string): void;
  onStop(): void;
  onStance(): void;
  onMinimap(x: number, z: number): void;
  onFocusEntity(id: number): void;
  hasSave(): boolean;
}

type ElProps<K extends keyof HTMLElementTagNameMap> = Omit<Partial<HTMLElementTagNameMap[K]>, 'style'> & { style?: string | CSSStyleDeclaration };
function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: ElProps<K> = {} as ElProps<K>, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

const FONT_CSS = `
@font-face { font-family: 'FreeSans'; src: url('${assetUrl('fonts/FreeSans.ttf')}') format('truetype'); font-weight: 400; font-style: normal; }
@font-face { font-family: 'Biolinum'; src: url('${assetUrl('fonts/LinBiolinum_Rah.ttf')}') format('truetype'); font-weight: 400; font-style: normal; }
`;
const CSS = `
.ad { position: absolute; inset: 0; overflow: hidden; background: #0d1117; color: #eadfc4; font: 14px/1.35 "FreeSans","DejaVu Sans",system-ui,sans-serif; user-select: none; }
.ad canvas { display: block; }
.ad-hud { position: absolute; inset: 0; pointer-events: none; }
.ad-hud > * { pointer-events: auto; }
.ad-top { position: absolute; top: 0; left: 50%; transform: translateX(-50%); display: flex; gap: .2rem; align-items: center; padding: .22rem .5rem .3rem; background: linear-gradient(#2a2115f2,#17110bee); border: 1px solid #7c6232; border-top: 0; border-radius: 0 0 .45rem .45rem; box-shadow: 0 3px 14px #000b; }
.ad-res { display: flex; align-items: center; gap: .15rem; min-width: 4.6rem; padding: .08rem .35rem; font-weight: 600; color: #f5e3b4; }
.ad-res img { width: 1.35rem; height: 1.35rem; image-rendering: auto; }
.ad-res.pop { min-width: 5.2rem; }
.ad-menu { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(ellipse at 50% 38%, #2c2518dc, #07090ce8 72%); z-index: 20; }
.ad-box { width: min(38rem, 90vw); padding: 1.5rem 1.8rem 1.4rem; border: 1px solid #8d6d36; border-radius: .4rem; background: linear-gradient(#211a11f7,#120e0af7); box-shadow: 0 20px 70px #000d, inset 0 0 40px #0008; }
.ad-box h1 { margin: 0; font: 400 3.1rem/.95 "Biolinum","FreeSans",sans-serif; letter-spacing: .18em; color: #e7c477; text-shadow: 0 2px 0 #5b3f18, 0 0 22px #c8933a55; }
.ad-box h2 { margin: .1rem 0 1rem; font: 400 1rem/1.3 "FreeSans",sans-serif; color: #b7a47d; letter-spacing: .08em; }
.ad-box p { margin: .45rem 0; color: #c9bb9c; }
.ad-box button, .ad-cmd button { font: inherit; color: #f1e1ba; background: linear-gradient(#3a2e1c,#241b10); border: 1px solid #8d6d36; border-radius: .25rem; padding: .42rem .8rem; cursor: pointer; }
.ad-box button:hover, .ad-cmd button:hover { background: linear-gradient(#4d3b22,#302413); border-color: #c49a52; }
.ad-box button:disabled, .ad-cmd button:disabled { opacity: .42; cursor: default; }
.ad-menu .ad-buttons { display: flex; flex-wrap: wrap; gap: .5rem; margin-top: 1rem; }
.ad-loading { position: absolute; inset: 0; display: grid; place-items: center; background: radial-gradient(ellipse at 50% 30%, #2b2418, #0b0d10 70%); z-index: 30; }
.ad-loading-box { width: min(34rem, 82vw); padding: 1.4rem 1.7rem; border: 1px solid #6b542b; border-radius: .4rem; background: #17130e; box-shadow: 0 18px 60px #000a; }
.ad-loading h1 { margin: 0 0 .2rem; font: 600 2.4rem/1 "FreeSans",sans-serif; letter-spacing: .12em; color: #e4c27b; }
.ad-loading p { margin: .35rem 0; color: #b9aa8b; }
.ad-loading progress { width: 100%; height: .55rem; accent-color: #c9a45c; }
.ad-error { color: #ffb3a3; white-space: pre-wrap; }
.ad-bottom { position: absolute; left: .5rem; right: .5rem; bottom: .5rem; display: flex; align-items: end; gap: .45rem; }
.ad-sel { width: min(21rem, 34vw); min-height: 6.7rem; padding: .4rem .5rem; background: linear-gradient(#241c12ee,#120e09ee); border: 1px solid #7c6232; border-radius: .3rem; box-shadow: 0 6px 20px #000a; }
.ad-sel-head { display: flex; gap: .5rem; align-items: center; }
.ad-sel-head img { width: 3.4rem; height: 3.4rem; border: 1px solid #8d6d36; border-radius: .25rem; background: #0b0a08; }
.ad-sel-name { font-weight: 650; color: #f2dfb2; }
.ad-sel-sub { color: #b8a784; font-size: .78rem; }
.ad-hp { height: .42rem; margin: .35rem 0 .15rem; background: #1d1a14; border: 1px solid #59482a; border-radius: .2rem; overflow: hidden; }
.ad-hp div { height: 100%; background: linear-gradient(#7ddf70,#2f8a35); }
.ad-portraits { display: flex; flex-wrap: wrap; gap: .15rem; }
.ad-portraits img { width: 2.4rem; height: 2.4rem; border: 1px solid #6b542b; border-radius: .2rem; background: #0b0a08; }
.ad-cmd { flex: 1; display: flex; flex-wrap: wrap; gap: .3rem; align-content: end; padding: .38rem .38rem .3rem; min-height: 6.7rem; background: linear-gradient(#241c12ee,#120e09ee); border: 1px solid #7c6232; border-radius: .3rem; box-shadow: 0 6px 20px #000a; }
.ad-cmd .ad-cmdbtn { width: 4.35rem; height: 5.5rem; padding: .2rem; display: flex; flex-direction: column; align-items: center; justify-content: flex-start; gap: .1rem; font-size: .68rem; line-height: 1.05; }
.ad-cmd .ad-cmdbtn img { width: 2.35rem; height: 2.35rem; border-radius: .2rem; background: #0b0a08; }
.ad-cmd .ad-cmdbtn .cost { color: #cdb98e; font-size: .64rem; }
.ad-cmd .ad-cmdbtn .cost img { width: .8rem; height: .8rem; vertical-align: -.15rem; }
.ad-side { display: flex; flex-direction: column; gap: .3rem; }
.ad-mini { width: 12rem; height: 12rem; border: 1px solid #7c6232; border-radius: .3rem; background: #090b09; box-shadow: 0 6px 20px #000a; }
.ad-mini canvas { width: 100%; height: 100%; border-radius: .25rem; cursor: crosshair; }
.ad-status { position: absolute; top: .4rem; right: .5rem; display: flex; gap: .35rem; align-items: center; }
.ad-status button { padding: .32rem .6rem; font: inherit; font-size: .8rem; color: #eadfc4; background: #1a140dcc; border: 1px solid #7c6232; border-radius: .25rem; cursor: pointer; }
.ad-note { position: absolute; left: 50%; top: 3.2rem; transform: translateX(-50%); padding: .35rem .8rem; background: #1b150dea; border: 1px solid #8d6d36; border-radius: .3rem; color: #f4e3b7; opacity: 0; transition: opacity .2s; pointer-events: none; }
.ad-note.show { opacity: 1; }
.ad-queue { display: flex; gap: .18rem; margin-top: .25rem; }
.ad-queue div { flex: 1; height: .35rem; background: #1c1812; border: 1px solid #5c4a2a; border-radius: .15rem; overflow: hidden; }
.ad-queue div i { display: block; height: 100%; background: #c9a45c; }
.ad-selbox { position: absolute; border: 1px solid #d8c58d; background: #d8c58d22; display: none; pointer-events: none; }
.ad-help { display: grid; grid-template-columns: 1fr 1fr; gap: .3rem 1rem; margin: .6rem 0 .9rem; color: #cdbd9b; font-size: .88rem; }
.ad-help b { color: #f0dcae; font-weight: 600; }
.ad-toast { position: absolute; left: 50%; top: 5.3rem; transform: translateX(-50%); padding: .45rem .8rem; background: #1b150de8; border: 1px solid #8d6d36; border-radius: .3rem; color: #f4e3b7; opacity: 0; transition: opacity .2s; pointer-events: none; }
.ad-toast.show { opacity: 1; }
`;

export class Hud {
  readonly root: HTMLElement;
  readonly minimap: HTMLCanvasElement;
  private readonly world: World;
  /** the player this HUD belongs to (1 or 2) */
  private readonly me: number;
  private readonly icons: Record<string, string>;
  private readonly colors: Record<string, Rgb>;
  private readonly cb: HudCallbacks;
  private readonly resVals: Record<Resource, HTMLElement>;
  private readonly popVal: HTMLElement;
  private readonly selectionPanel: HTMLElement;
  private readonly commandPanel: HTMLElement;
  private readonly note: HTMLElement;
  private readonly toastEl: HTMLElement;
  private readonly menuLayer: HTMLElement;
  private readonly pauseLayer: HTMLElement;
  private readonly controlsLayer: HTMLElement;
  private readonly endLayer: HTMLElement;
  private readonly loadingLayer: HTMLElement;
  private readonly minimapBase: HTMLCanvasElement;
  private readonly status: HTMLElement;
  private menuOpen = false;
  private pauseOpen = false;
  private lastMini = -1;
  private noteTimer = 0;
  private lastSelectionKey = '';
  /** an online round: no save/restart, and the end screen returns to the menu */
  online = false;
  /** the civilisation the menu has chosen (the opponent gets the other one) */
  civ = 'athen';
  private commandButtons: { button: HTMLButtonElement; template: string; kind: 'build' | 'train' }[] = [];
  private selectedHp: { bar: HTMLElement; text: HTMLElement; entity: number } | null = null;

  constructor(host: HTMLElement, world: World, icons: Record<string, string>, colors: Record<string, Rgb>, cb: HudCallbacks, me = 1) {
    this.world = world;
    this.me = me;
    this.icons = icons;
    this.colors = colors;
    this.cb = cb;
    host.append(el('style', { textContent: FONT_CSS + CSS }));
    this.root = el('div', { className: 'ad-hud' });
    host.append(this.root);
    this.resVals = {} as Record<Resource, HTMLElement>;
    const top = el('div', { className: 'ad-top' });
    for (const r of ['food', 'wood', 'stone', 'metal'] as Resource[]) {
      const value = el('span', { textContent: '0' });
      this.resVals[r] = value;
      top.append(el('div', { className: 'ad-res', title: RESOURCE_LABEL[r] }, el('img', { src: this.icon(`resource/${r}`), alt: RESOURCE_LABEL[r] }), value));
    }
    this.popVal = el('span', { textContent: '0/0' });
    top.append(el('div', { className: 'ad-res pop', title: 'Population' }, el('img', { src: this.icon('resource/population'), alt: 'Population' }), this.popVal));
    this.root.append(top);

    this.status = el('div', { className: 'ad-status' }, el('span', { className: 'ad-sel-sub', textContent: '' }));
    const pause = el('button', { textContent: 'Menu (Esc)' });
    pause.onclick = () => this.showPause();
    this.status.append(pause);
    this.root.append(this.status);

    this.selectionPanel = el('div', { className: 'ad-sel' });
    this.commandPanel = el('div', { className: 'ad-cmd' });
    const miniWrap = el('div', { className: 'ad-side' });
    this.minimap = el('canvas', { width: 384, height: 384 });
    this.minimap.className = 'ad-mini';
    miniWrap.append(this.minimap);
    this.root.append(el('div', { className: 'ad-bottom' }, this.selectionPanel, this.commandPanel, miniWrap));
    this.note = el('div', { className: 'ad-note' });
    this.root.append(this.note);
    this.toastEl = el('div', { className: 'ad-toast' });
    this.root.append(this.toastEl);

    this.menuLayer = el('div', { className: 'ad-menu', style: 'display:none' });
    this.pauseLayer = el('div', { className: 'ad-menu', style: 'display:none' });
    this.controlsLayer = el('div', { className: 'ad-menu', style: 'display:none' });
    this.endLayer = el('div', { className: 'ad-menu', style: 'display:none' });
    this.loadingLayer = el('div', { className: 'ad-loading' });
    this.root.append(this.menuLayer, this.pauseLayer, this.controlsLayer, this.endLayer, this.loadingLayer);

    this.minimapBase = document.createElement('canvas');
    this.minimapBase.width = this.world.fogSize;
    this.minimapBase.height = this.world.fogSize;
    this.buildMinimapBase();
    this.minimap.addEventListener('pointerdown', (ev) => {
      const rect = this.minimap.getBoundingClientRect();
      const x = ((ev.clientX - rect.left) / rect.width) * this.world.terrain.size;
      const z = ((ev.clientY - rect.top) / rect.height) * this.world.terrain.size;
      this.cb.onMinimap(x, z);
    });
    this.showMenu();
    this.hideLoading();
  }

  private icon(name: string): string {
    const file = this.icons[name];
    return file ? assetUrl(`icons/${file}`) : assetUrl('icons/civic_centre.png');
  }

  private buildMinimapBase(): void {
    const ctx = this.minimapBase.getContext('2d')!;
    const img = ctx.createImageData(this.world.fogSize, this.world.fogSize);
    const t = this.world.terrain;
    for (let j = 0; j < this.world.fogSize; j++) {
      for (let i = 0; i < this.world.fogSize; i++) {
        const tx = Math.min(t.tilesPerSide - 1, Math.floor((i / this.world.fogSize) * t.tilesPerSide));
        const tz = Math.min(t.tilesPerSide - 1, Math.floor((j / this.world.fogSize) * t.tilesPerSide));
        const name = t.textures[t.tiles[tz * t.tilesPerSide + tx].tex1] ?? '';
        const c = this.colors[name] ?? [80, 100, 60];
        const k = (j * this.world.fogSize + i) * 4;
        img.data[k] = c[0]; img.data[k + 1] = c[1]; img.data[k + 2] = c[2]; img.data[k + 3] = 255;
      }
    }
    ctx.putImageData(img, 0, 0);
  }

  showLoading(text = 'Loading the original map and models…', progress = 0.1): void {
    this.loadingLayer.style.display = '';
    this.loadingLayer.replaceChildren(el('div', { className: 'ad-loading-box' },
      el('h1', { textContent: '0 A.D.' }), el('p', { textContent: 'Farmland (2) · Release 28 “Boiorix”' }),
      el('p', { textContent: text }), el('progress', { max: 100, value: Math.round(progress * 100) })));
  }

  hideLoading(): void { this.loadingLayer.style.display = 'none'; }

  showError(message: string): void {
    this.loadingLayer.style.display = '';
    this.loadingLayer.replaceChildren(el('div', { className: 'ad-loading-box' },
      el('h1', { textContent: '0 A.D.' }), el('p', { className: 'ad-error', textContent: message })));
  }

  showMenu(): void {
    this.menuOpen = true;
    this.menuLayer.style.display = '';
    this.menuLayer.replaceChildren(this.menuBox());
  }

  hideMenu(): void { this.menuOpen = false; this.menuLayer.style.display = 'none'; }

  /** Rebuild the main menu so a just-written save enables its Load button. */
  refreshMenu(): void { if (this.menuOpen) this.menuLayer.replaceChildren(this.menuBox()); }

  private menuBox(): HTMLElement {
    const civ = el('select', { title: 'Your civilisation; the opponent plays the other one' });
    civ.append(el('option', { value: 'athen', textContent: 'Athenians' }), el('option', { value: 'cart', textContent: 'Carthaginians' }));
    civ.value = this.civ;
    civ.onchange = () => { this.civ = civ.value; };
    const start = el('button', { textContent: 'Start skirmish' });
    start.onclick = () => { this.hideMenu(); this.cb.onStart(this.civ); };
    const load = el('button', { textContent: 'Load game' });
    load.disabled = !this.cb.hasSave();
    load.onclick = () => { this.cb.onLoad(); };
    const online = el('button', { textContent: 'Play online 1v1' });
    online.onclick = () => this.cb.onOnline();
    const controls = el('button', { textContent: 'Controls' });
    controls.onclick = () => this.showControls();
    const quit = el('button', { textContent: 'Leave game' });
    quit.onclick = () => this.cb.onExit();
    const box = el('div', { className: 'ad-box' },
      el('h1', { textContent: '0 A.D.' }),
      el('h2', { textContent: 'Empires Ascendant · Release 28 “Boiorix” · Farmland (2)' }),
      el('p', { textContent: 'A 1-versus-1 skirmish on the original map, as the Athenians or the Carthaginians. Gather food, wood, stone and metal; build a village; train your civilisation’s spearmen and ranged citizens; destroy the enemy Civic Centre.' }),
      el('p', { className: 'ad-sel-sub', textContent: 'This is a vertical slice of the browser port: one map, two civilisations, Village phase, no formations, no music and no campaign. README.md lists everything that is missing.' }),
      el('label', { style: 'display:flex; gap:.6rem; align-items:center; margin:.6rem 0' }, 'Your civilisation', civ),
      el('div', { className: 'ad-buttons' }, start, online, load, controls, quit),
    );
    return box;
  }

  showPause(): void {
    if (this.endLayer.style.display !== 'none') return;
    this.pauseOpen = true;
    this.pauseLayer.style.display = '';
    const resume = el('button', { textContent: 'Resume' }); resume.onclick = () => { this.hidePause(); this.cb.onResume(); };
    const controls = el('button', { textContent: 'Controls' }); controls.onclick = () => this.showControls();
    const quit = el('button', { textContent: 'Leave game' }); quit.onclick = () => this.cb.onExit();
    const buttons = [resume, controls];
    if (this.online) {
      const leave = el('button', { textContent: 'Leave match' }); leave.onclick = () => { this.hidePause(); this.cb.onQuitToMenu(); };
      buttons.push(leave);
    } else {
      const save = el('button', { textContent: 'Save game' }); save.onclick = () => this.cb.onSave();
      const restart = el('button', { textContent: 'Restart map' }); restart.onclick = () => { this.hidePause(); this.cb.onRestart(); };
      const menu = el('button', { textContent: 'Main menu' }); menu.onclick = () => { this.hidePause(); this.cb.onQuitToMenu(); };
      buttons.push(save, restart, menu);
    }
    buttons.push(quit);
    this.pauseLayer.replaceChildren(el('div', { className: 'ad-box' },
      el('h1', { textContent: 'Paused' }),
      el('p', { className: 'ad-sel-sub', textContent: this.online
        ? `Online 1v1 · ${this.world.time.toFixed(0)} s · the other seat keeps playing while this menu is open`
        : `Game time ${this.world.time.toFixed(0)} s · population ${this.world.players[this.me].popUsed}/${this.world.players[this.me].popCap}` }),
      el('div', { className: 'ad-buttons' }, ...buttons)));
  }

  hidePause(): void { this.pauseOpen = false; this.pauseLayer.style.display = 'none'; }
  get paused(): boolean { return this.pauseOpen || this.menuOpen; }

  showControls(): void {
    this.controlsLayer.style.display = '';
    const close = el('button', { textContent: 'Back' });
    close.onclick = () => { this.controlsLayer.style.display = 'none'; };
    const rows: [string, string][] = [
      ['W A S D / arrows', 'pan the camera'], ['Mouse wheel', 'zoom'], ['Middle drag / Shift+right drag', 'rotate and tilt'],
      ['Q / E', 'rotate the camera'], ['Left click / drag', 'select one unit or a box'], ['Shift + left click', 'add to the selection'],
      ['Right click', 'move, gather, attack or help a foundation'], ['H', 'stop the selected units'],
      ['Esc', 'pause menu'], ['Space', 'centre on the selected unit'],
    ];
    const help = el('div', { className: 'ad-help' });
    for (const [k, v] of rows) help.append(el('b', { textContent: k }), el('span', { textContent: v }));
    this.controlsLayer.replaceChildren(el('div', { className: 'ad-box' }, el('h1', { textContent: 'Controls', style: 'font-size:2rem' }), help, close));
  }

  showEnd(won: boolean, reason: string): void {
    this.endLayer.style.display = '';
    this.hidePause();
    const menu = el('button', { textContent: this.online ? 'Back to menu' : 'Main menu' }); menu.onclick = () => { this.endLayer.style.display = 'none'; this.cb.onQuitToMenu(); };
    const buttons = [menu];
    if (!this.online) {
      const again = el('button', { textContent: 'Play again' }); again.onclick = () => { this.endLayer.style.display = 'none'; this.cb.onRestart(); };
      buttons.push(again);
    }
    const quit = el('button', { textContent: 'Leave game' }); quit.onclick = () => this.cb.onExit();
    buttons.push(quit);
    this.endLayer.replaceChildren(el('div', { className: 'ad-box' },
      el('h1', { textContent: won ? 'Victory' : 'Defeat', style: `font-size:2.7rem;color:${won ? '#e7c477' : '#e08a7a'}` }),
      el('p', { textContent: reason }),
      el('div', { className: 'ad-buttons' }, ...buttons)));
  }

  hideEnd(): void { this.endLayer.style.display = 'none'; }

  toast(text: string): void {
    this.toastEl.textContent = text;
    this.toastEl.classList.add('show');
    this.noteTimer = 3;
  }

  update(dt: number, selected: number[]): void {
    const p = this.world.players[this.me];
    for (const r of ['food', 'wood', 'stone', 'metal'] as Resource[]) this.resVals[r].textContent = Math.floor(p.resources[r]).toString();
    this.popVal.textContent = `${p.popUsed}/${p.popCap}`;
    const foe = this.world.players[this.me === 1 ? 2 : 1];
    this.status.firstElementChild!.textContent = `Game time ${Math.floor(this.world.time / 60)}:${String(Math.floor(this.world.time % 60)).padStart(2, '0')} · ${foe.name} ${foe.defeated ? 'defeated' : 'ready'}`;
    if (this.noteTimer > 0) {
      this.noteTimer -= dt;
      if (this.noteTimer <= 0) this.toastEl.classList.remove('show');
    }
    const key = selected.map((id) => { const e = this.world.entity(id); return e ? `${e.id}:${e.kind}:${e.construction ? 1 : 0}:${e.production.length}` : ''; }).join(',');
    if (key !== this.lastSelectionKey) { this.lastSelectionKey = key; this.renderSelection(selected); }
    this.updateCommands();
    if (this.selectedHp) {
      const e = this.world.entity(this.selectedHp.entity);
      if (e) {
        this.selectedHp.bar.style.width = `${Math.max(0, (e.hp / e.maxHp) * 100)}%`;
        this.selectedHp.text.textContent = `Health ${Math.ceil(e.hp)} / ${Math.round(e.maxHp)}`;
      }
    }
    this.renderMinimap(selected);
  }

  private renderSelection(ids: number[]): void {
    const selected = ids.map((id) => this.world.entity(id)).filter((e): e is Entity => !!e && e.alive);
    const sel = this.selectionPanel;
    const cmd = this.commandPanel;
    sel.replaceChildren();
    cmd.replaceChildren();
    this.commandButtons = [];
    this.selectedHp = null;
    if (!selected.length) {
      sel.append(el('div', { className: 'ad-sel-sub', textContent: 'Nothing selected. Left-click a unit or drag a box.' }));
      return;
    }
    if (selected.length === 1) {
      const e = selected[0];
      const head = el('div', { className: 'ad-sel-head' });
      const img = el('img', { src: this.icon(e.template), alt: '' });
      head.append(img, el('div', {}, el('div', { className: 'ad-sel-name', textContent: e.info.specificName || e.info.genericName || e.template }),
        el('div', { className: 'ad-sel-sub', textContent: `${e.info.genericName}${e.player === 0 ? ' · Gaia' : ''}` })));
      sel.append(head);
      const hp = el('div', { className: 'ad-hp' }, el('div', { style: `width:${Math.max(0, (e.hp / e.maxHp) * 100)}%` }));
      const hpText = el('div', { className: 'ad-sel-sub', textContent: `Health ${Math.ceil(e.hp)} / ${Math.round(e.maxHp)}` });
      this.selectedHp = { bar: hp.firstElementChild as HTMLElement, text: hpText, entity: e.id };
      sel.append(hp, hpText);
      if (e.carry) sel.append(el('div', { className: 'ad-sel-sub', textContent: `Carrying ${Math.floor(e.carry.amount)} ${e.carry.resource}` }));
      if (e.construction) sel.append(el('div', { className: 'ad-sel-sub', textContent: `Construction ${Math.floor(e.construction.progress * 100)} %` }));
      if (e.kind === 'building' && e.info.capturePoints > 0) sel.append(el('div', { className: 'ad-sel-sub', textContent: `Capture ${Math.max(0, Math.ceil((e.capturePoints / e.info.capturePoints) * 100))} %` }));
      if (e.kind === 'resource' && e.info.supply) sel.append(el('div', { className: 'ad-sel-sub', textContent: Number.isFinite(e.amount) ? `${Math.floor(e.amount)} ${e.info.supply.type.split('.')[0]} left` : 'Infinite supply' }));
      if (e.order) sel.append(el('div', { className: 'ad-sel-sub', textContent: this.orderLabel(e) }));
      if (e.kind === 'building' && e.production.length) {
        const q = el('div', { className: 'ad-queue' });
        for (const item of e.production) {
          const pct = Math.max(0, 100 * (1 - item.remaining / item.total));
          q.append(el('div', {}, el('i', { style: `width:${pct}%` })));
        }
        sel.append(q, el('div', { className: 'ad-sel-sub', textContent: e.production.map((i) => this.world.template(i.template).genericName).join(', ') }));
      }
      this.commandsFor(e, cmd);
    } else {
      const portraits = el('div', { className: 'ad-portraits' });
      for (const e of selected.slice(0, 14)) portraits.append(el('img', { src: this.icon(e.template), title: e.info.genericName }));
      if (selected.length > 14) portraits.append(el('span', { className: 'ad-sel-sub', textContent: `+${selected.length - 14}` }));
      sel.append(el('div', { className: 'ad-sel-name', textContent: `${selected.length} units` }), portraits);
      const units = selected.filter((e) => e.kind === 'unit');
      if (units.length) {
        const stop = this.cmd('stop', 'Stop', () => this.cb.onStop());
        const stance = this.cmd('attack-move', 'Stance', () => this.cb.onStance());
        cmd.append(stop, stance);
        if (selected.some((e) => e.info.builder)) {
          for (const b of this.world.buildOptions(this.me)) cmd.append(this.buildButton(b));
        }
      }
    }
  }

  private orderLabel(e: Entity): string {
    const o = e.order;
    if (!o) return 'Idle';
    if (o.type === 'move') return 'Moving';
    if (o.type === 'gather') {
      const t = this.world.entity(o.target);
      return `Gathering ${o.resource}${t ? ` from ${t.info.genericName}` : ''}`;
    }
    if (o.type === 'attack') {
      const t = this.world.entity(o.target);
      return `Attacking ${t ? t.info.genericName : 'enemy'}`;
    }
    if (o.type === 'build') return 'Building';
    return '';
  }

  private cmd(cls: string, label: string, fn: () => void, img?: string, cost?: string): HTMLButtonElement {
    const b = el('button', { className: `ad-cmdbtn ${cls}`, title: label });
    if (img) b.append(el('img', { src: img, alt: '' }));
    b.append(el('span', { textContent: label }));
    if (cost) b.append(el('span', { className: 'cost', innerHTML: cost }));
    b.onclick = fn;
    return b;
  }

  private costHtml(template: string): string {
    const info = this.world.template(template);
    const parts: string[] = [];
    for (const r of ['food', 'wood', 'stone', 'metal'] as Resource[]) {
      if (info.cost.resources[r]) parts.push(`<img src="${this.icon(`resource/${r}`)}" alt="${r}">${info.cost.resources[r]}`);
    }
    return parts.join(' ');
  }

  private buildButton(b: ReturnType<World['buildOptions']>[number]): HTMLButtonElement {
    const btn = this.cmd('build', b.info.genericName || b.template.split('/').pop()!, () => this.cb.onBuild(b.template), this.icon(b.template), this.costHtml(b.template));
    btn.disabled = !b.affordable;
    btn.title = b.reason || `Build ${b.info.genericName}`;
    this.commandButtons.push({ button: btn, template: b.template, kind: 'build' });
    return btn;
  }

  /** Affordability and population change every second; update the existing buttons instead of
   * recreating them under the player's pointer. */
  private updateCommands(): void {
    const p = this.world.players[this.me];
    for (const c of this.commandButtons) {
      const info = this.world.template(c.template);
      let reason = this.world.canAfford(this.me, info) ? '' : 'not enough resources';
      if (c.kind === 'train') {
        const building = [...this.world.entities.values()].find((e) => e.player === this.me && e.kind === 'building' && this.world.trainOptions(e).some((t) => t.template === c.template));
        const opt = building ? this.world.trainOptions(building).find((t) => t.template === c.template) : undefined;
        reason = opt?.reason ?? (p.popUsed + this.world.queuedPopulation(this.me) + info.cost.population > p.popCap ? 'population limit' : '');
      }
      c.button.disabled = reason !== '';
      c.button.title = reason || `${c.kind === 'build' ? 'Build' : 'Train'} ${info.genericName}`;
    }
  }

  private commandsFor(e: Entity, cmd: HTMLElement): void {
    if (e.player !== this.me) return;
    if (e.kind === 'building' && !e.construction) {
      for (const t of this.world.trainOptions(e)) {
        const btn = this.cmd('train', t.info.genericName || t.template.split('/').pop()!, () => this.cb.onTrain(t.template), this.icon(t.template), this.costHtml(t.template));
        btn.disabled = !t.affordable;
        btn.title = t.reason || `Train ${t.info.genericName}`;
        this.commandButtons.push({ button: btn, template: t.template, kind: 'train' });
        cmd.append(btn);
      }
    }
    if (e.kind === 'unit' && e.info.builder) {
      for (const b of this.world.buildOptions(this.me)) cmd.append(this.buildButton(b));
    }
    if (e.kind === 'unit') {
      cmd.append(this.cmd('stop', 'Stop (H)', () => this.cb.onStop()));
      cmd.append(this.cmd('stance', 'Stance', () => this.cb.onStance()));
    }
  }

  private renderMinimap(selected: number[]): void {
    const now = performance.now();
    if (now - this.lastMini < 160) return;
    this.lastMini = now;
    const ctx = this.minimap.getContext('2d')!;
    const W = this.minimap.width;
    ctx.imageSmoothingEnabled = true;
    ctx.clearRect(0, 0, W, W);
    ctx.drawImage(this.minimapBase, 0, 0, W, W);
    const n = this.world.fogSize;
    const cell = W / n;
    for (let j = 0; j < n; j++) {
      for (let i = 0; i < n; i++) {
        const idx = j * n + i;
        if (this.world.visible[this.me][idx]) continue;
        ctx.fillStyle = this.world.explored[this.me][idx] ? 'rgba(4,6,7,.42)' : 'rgba(4,6,7,.9)';
        ctx.fillRect(i * cell, j * cell, cell + 0.5, cell + 0.5);
      }
    }
    for (const e of this.world.aliveEntities()) {
      if (e.player !== this.me && !this.world.entityVisible(e, this.me)) continue;
      if (e.kind === 'scenery') continue;
      const x = (e.x / this.world.terrain.size) * W;
      const y = (e.z / this.world.terrain.size) * W;
      const r = e.kind === 'building' ? Math.max(2.5, e.radius / 3) : Math.max(1.5, 2.2);
      ctx.fillStyle = e.player === 1 ? '#4f8fff' : e.player === 2 ? '#ff5a4f' : e.kind === 'resource' ? '#7fa35a' : '#e5c76a';
      ctx.beginPath(); ctx.arc(x, y, r, 0, Math.PI * 2); ctx.fill();
      if (selected.includes(e.id)) { ctx.strokeStyle = '#ffffff'; ctx.lineWidth = 1.5; ctx.stroke(); }
    }
    void this.colors;
  }
}
