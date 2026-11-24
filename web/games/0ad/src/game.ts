// 0 A.D. — the browser vertical slice: one original skirmish map (Farmland (2)), the Athenians,
// the Village-phase economy, combat and a scripted opponent. The reference is Release 28
// “Boiorix” (v0.28.0); the data and its licences are in web/games/0ad/LICENSE.md.
import { packGame, type GameContext, type GameInstance, type RoundStart } from '../../../src/sdk/index.ts';
import { fetchBuffer, fetchJson, fetchText, templateFiles } from './assets.ts';
import { parseScenario, type Scenario } from './data/map.ts';
import { parsePmp, type Terrain } from './data/pmp.ts';
import { TemplateDatabase } from './data/template-db.ts';
import { World, knownCiv, otherCiv } from './sim/world.ts';
import { applyCommand, STANCES, type PlayerCommand } from './sim/commands.ts';
import { Ai } from './sim/ai.ts';
import { TURN_MS } from './sim/types.ts';
import { SceneView } from './render/scene.ts';
import { loadActorBank, type ActorBank } from './render/views.ts';
import { makeLightUniforms } from './render/materials.ts';
import { loadImageData } from './render/textures.ts';
import { Hud } from './ui/hud.ts';
import { createSave, readSave, SAVE_FILE } from './save/save.ts';
import { OnlineMatch, type OnlineWorldOptions } from './net/online.ts';
import { Options } from './proto/0ad.ts';

const SAVE_NAME = SAVE_FILE;
const SEED = 0x5ead;

interface LoadedData {
  scenario: Scenario;
  terrain: Terrain;
  templates: TemplateDatabase;
  bank: ActorBank;
  icons: Record<string, string>;
  colors: Record<string, [number, number, number]>;
}

function el<K extends keyof HTMLElementTagNameMap>(tag: K, props: Partial<HTMLElementTagNameMap[K]> = {}, ...kids: (Node | string)[]): HTMLElementTagNameMap[K] {
  const e = Object.assign(document.createElement(tag), props);
  e.append(...kids);
  return e;
}

const LOADING_CSS = `
.ad-load { position:absolute; inset:0; display:grid; place-items:center; background:radial-gradient(ellipse at 50% 30%, #2b2418, #0b0d10 70%); z-index:50; color:#e9dfc8; font:14px/1.4 "FreeSans","DejaVu Sans",system-ui,sans-serif; }
.ad-load-box { width:min(34rem,82vw); padding:1.5rem 1.8rem; border:1px solid #6b542b; border-radius:.4rem; background:#17130e; box-shadow:0 18px 60px #000a; }
.ad-load-box h1 { margin:0; font:600 2.6rem/1 "FreeSans",sans-serif; letter-spacing:.14em; color:#e4c27b; }
.ad-load-box p { margin:.4rem 0; color:#b9aa8b; }
.ad-load-box progress { width:100%; height:.55rem; accent-color:#c9a45c; }
.ad-load-box .err { color:#ffb3a3; white-space:pre-wrap; }
`;

export class GameApp implements GameInstance {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private data: LoadedData | null = null;
  private world: World | null = null;
  private scene: SceneView | null = null;
  private hud: Hud | null = null;
  private gameRoot: HTMLElement | null = null;
  private selectionBox: HTMLElement | null = null;
  private ai: Ai | null = null;
  /** the online round, when this session is a two-seat lockstep; the local player is `me` */
  private online: OnlineMatch | null = null;
  private me = 1;
  /** the civilisation this session's human plays; the opponent gets the other one */
  private civ = 'athen';
  private keys: Record<string, boolean> = {};
  private selected: number[] = [];
  private placement: string | null = null;
  private playing = false;
  private paused = false;
  private ended = false;
  private accumulator = 0;
  private lastTime = 0;
  private dragging = false;
  private dragStart = { x: 0, y: 0 };
  private dragLast = { x: 0, y: 0 };
  private dragMoved = false;
  private rotating = false;
  private saveExists = false;
  private disposed = false;
  private readonly cssEl: HTMLStyleElement;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.cssEl = el('style', { textContent: LOADING_CSS });
    this.host.append(this.cssEl);
  }

  async start(): Promise<void> {
    console.log('0ad start');
    const loading = this.showLoading();
    try {
      console.log('0ad load begin');
      this.data = await this.load(loading);
      this.saveExists = await this.hasSave();
      loading.remove();
      const box = el('div', { className: 'ad' });
      this.host.append(box);
      this.gameRoot = box;
      await this.newWorld(SEED);
      this.makeHud();
      this.selectionBox = el('div', { className: 'ad-selbox' });
      box.append(this.selectionBox);
      this.addInput();
      this.hud!.showMenu();
      this.ctx.frame((time, dt) => this.frame(time, dt), this.ctx.signal);
    } catch (e) {
      const message = (e as Error).message || String(e);
      console.error('0 A.D.:', e);
      loading.replaceChildren(el('div', { className: 'ad-load-box' },
        el('h1', { textContent: '0 A.D.' }),
        el('p', { className: 'err', textContent: `The map could not start:\n${message}` })));
    }
  }

  private async hasSave(): Promise<boolean> {
    try { return !!(await this.ctx.storage.get(SAVE_NAME)); } catch { return false; }
  }

  private showLoading(): HTMLElement & { setProgress(text: string, value: number): void } {
    const status = el('p', { textContent: 'Reading the original map…' });
    const bar = el('progress', { max: 100, value: 5 });
    const box = el('div', { className: 'ad-load-box' },
      el('h1', { textContent: '0 A.D.' }),
      el('p', { textContent: 'Farmland (2) · Release 28 “Boiorix” · Wildfire Games' }),
      status, bar);
    const load = el('div', { className: 'ad-load' }, box);
    this.host.append(load);
    return Object.assign(load, {
      setProgress: (text: string, value: number) => { status.textContent = text; bar.value = Math.round(value * 100); },
    }) as HTMLElement & { setProgress(text: string, value: number): void };
  }

  private async load(loading: HTMLElement & { setProgress(text: string, value: number): void }): Promise<LoadedData> {
    loading.setProgress('Reading the original templates…', 0.08);
    console.log('0ad templates');
    const templates = new TemplateDatabase(templateFiles());
    console.log('0ad templates done', templateFiles().size);
    loading.setProgress('Reading the Farmland (2) scenario…', 0.2);
    const scenario = parseScenario(await fetchText('maps/farmland_2p.xml'));
    loading.setProgress('Reading the original PMP heightmap…', 0.35);
    const pmp = parsePmp(await fetchBuffer('maps/farmland_2p.pmp'));
    loading.setProgress('Reading actors, models and portraits…', 0.52);
    const bank = await loadActorBank();
    const icons = await fetchJson<Record<string, string>>('icons/icons.json');
    loading.setProgress('Reading the 23 original terrain textures…', 0.66);
    const terrainMeta = await fetchJson<{ name: string; file: string }[]>('terrain/terrains.json');
    const colors: Record<string, [number, number, number]> = {};
    await Promise.all(terrainMeta.map(async (t) => {
      try {
        const img = await loadImageData(t.file, 8);
        let r = 0, g = 0, b = 0;
        for (let i = 0; i < img.data.length; i += 4) { r += img.data[i]; g += img.data[i + 1]; b += img.data[i + 2]; }
        const n = img.data.length / 4;
        colors[t.name] = [Math.round(r / n), Math.round(g / n), Math.round(b / n)];
      } catch {
        colors[t.name] = [92, 110, 66];
      }
    }));
    loading.setProgress('Starting the skirmish…', 0.86);
    return { scenario, terrain: pmp, templates, bank, icons, colors };
  }

  private worldOptions(): ConstructorParameters<typeof World>[0] {
    const d = this.data!;
    return {
      scenario: d.scenario,
      terrain: d.terrain,
      templates: { info: (n: string) => d.templates.info(n), has: (n: string) => d.templates.has(n) },
      players: [
        { name: 'Player 1', civ: this.civ, color: [21 / 255, 55 / 255, 149 / 255] },
        { name: 'Player 2', civ: otherCiv(this.civ), color: [150 / 255, 20 / 255, 20 / 255] },
      ],
      seed: SEED,
      onVictory: (winner) => this.finish(winner),
    };
  }

  private async newWorld(seed: number): Promise<void> {
    this.online?.dispose();
    this.online = null;
    this.me = 1;
    const options = { ...this.worldOptions(), seed };
    this.world = new World(options);
    this.ai = new Ai(this.world, 2, 11);
    this.selected = [];
    this.ended = false;
    this.playing = false;
    this.paused = false;
    this.accumulator = 0;
    await this.buildScene();
  }

  private makeHud(): void {
    if (!this.gameRoot || !this.world || !this.data) return;
    this.hud?.root.remove();
    this.hud = new Hud(this.gameRoot, this.world, this.data.icons, this.data.colors, this.callbacks(), this.me);
    this.hud.online = !!this.online;
    this.hud.civ = this.civ;
  }

  private async buildScene(): Promise<void> {
    if (!this.world) return;
    this.scene?.dispose();
    this.scene = null;
    const scene = await SceneView.create(this.gameRoot ?? this.host, this.world, this.data!.bank, this.data!.scenario, makeLightUniforms(), this.me);
    this.scene = scene;
    scene.setSelection([]);
    scene.resize();
    this.publishDebug();
  }

  private publishDebug(): void {
    // Screenshot/manual-check handle only: no game logic and no resources come from it.
    const app = this;
    (window as unknown as { __0ad?: unknown }).__0ad = {
      get world() { return app.world; },
      get scene() { return app.scene; },
      get online() { return app.online; },
      get me() { return app.me; },
      select: (id: number) => this.selectionChanged([id]),
      focus: (id: number) => { const e = this.world?.entity(id); if (e && this.scene) this.scene.camera.focus(e.x, e.z); },
      start: () => { this.playing = true; this.paused = false; this.hud?.hideMenu(); },
      command: (c: PlayerCommand) => this.command(c),
    };
  }

  private callbacks() {
    return {
      onStart: (civ: string) => void this.startSkirmish(civ),
      onOnline: () => void this.startOnline(),
      onLoad: () => void this.loadSave(),
      onSave: () => void this.saveGame(),
      onControls: () => this.hud?.showControls(),
      onQuitToMenu: () => this.quitToMenu(),
      onExit: () => this.ctx.exit(),
      onResume: () => { this.paused = false; },
      onRestart: () => { if (!this.online) void this.restart(); },
      onTrain: (template: string) => this.train(template),
      onBuild: (template: string) => this.beginPlacement(template),
      onStop: () => this.stopSelected(),
      onStance: () => this.cycleStance(),
      onMinimap: (x: number, z: number) => this.scene?.camera.focus(x, z),
      onFocusEntity: (id: number) => { const e = this.world?.entity(id); if (e) this.scene?.camera.focus(e.x, e.z); },
      hasSave: () => this.saveExists,
    };
  }

  /** Runs a command now (single-player) or queues it for the lockstep (online). */
  private command(c: PlayerCommand): boolean {
    if (!this.world) return false;
    if (this.online) return this.online.issue(c);
    return applyCommand(this.world, this.me, c);
  }

  /** Starts the skirmish, rebuilding the world when the menu's civilisation changed. */
  private async startSkirmish(civ: string): Promise<void> {
    this.hud?.hideMenu();
    if (civ !== this.civ) {
      this.civ = civ;
      await this.newWorld(SEED);
      this.makeHud();
    }
    if (!this.world) return;
    this.playing = true;
    this.paused = false;
    this.hud?.hideMenu();
    const cc = this.world.entitiesOf(this.me).find((e) => e.kind === 'building' && e.info.classes.includes('ConquestCritical'));
    if (cc) this.scene?.camera.focus(cc.x, cc.z);
    this.hud?.toast('Gather with the villagers, build a Barracks and destroy the enemy Civic Centre.');
  }

  private async restart(): Promise<void> {
    this.hud?.hideEnd();
    this.hud?.hideMenu();
    await this.newWorld(SEED);
    this.makeHud();
    this.playing = true;
    this.paused = false;
    this.hud?.toast('A new Farmland (2) skirmish.');
  }

  private frame(time: number, dtMs: number): void {
    if (this.disposed || !this.world || !this.scene) return;
    const dt = Math.min(0.1, dtMs / 1000);
    if (this.online) {
      // the lockstep advances only when both seats' packets are here; a pause menu only stops input
      this.online.pump(dtMs);
      if (this.online.ended && this.playing) {
        this.playing = false;
        this.hud?.toast('The end of the game is reported; waiting for the other seat.');
      }
    } else if (this.playing && !this.paused && !this.hud?.paused && !this.ended) {
      this.accumulator += Math.min(100, dtMs);
      let turns = 0;
      while (this.accumulator >= TURN_MS && turns < 5) {
        this.world.update();
        this.ai?.update();
        this.accumulator -= TURN_MS;
        turns++;
      }
      if (this.world.winner !== null && !this.ended) this.finish(this.world.winner);
    }
    this.scene.sync(dt, this.playing && !this.paused && !this.ended && !this.hud?.paused ? this.keys : {});
    this.hud?.update(dt, this.selected);
    this.lastTime = time;
    void this.lastTime;
    void this.host;
  }

  private finish(winner: number): void {
    if (this.ended) return;
    this.ended = true;
    this.playing = false;
    this.hud?.showEnd(winner === 1, winner === 1
      ? 'The enemy Civic Centre is destroyed. Athens holds Farmland.'
      : 'Your Civic Centre has fallen. The red army holds Farmland.');
  }

  private selectionChanged(ids: number[]): void {
    this.selected = ids.filter((id) => this.world?.entity(id)?.alive);
    this.scene?.setSelection(this.selected);
    this.hud?.update(0, this.selected);
  }

  private selectedEntities(): import('./sim/types.ts').Entity[] {
    return this.selected.map((id) => this.world?.entity(id)).filter((e): e is import('./sim/types.ts').Entity => !!e && e.alive);
  }

  private train(template: string): void {
    if (!this.world) return;
    const building = this.selectedEntities().find((e) => e.kind === 'building' && e.player === this.me);
    if (!building) return;
    if (this.command({ type: 'train', building: building.id, template })) this.hud?.toast(`Training ${this.world.template(template).genericName}…`);
    else this.hud?.toast('Cannot train that unit now (resources, population or a missing building).');
  }

  private beginPlacement(template: string): void {
    this.placement = template;
    this.hud?.toast('Left-click a free place for the foundation; right-click or Esc cancels.');
  }

  private placeAt(clientX: number, clientY: number): void {
    if (!this.world || !this.placement || !this.scene) return;
    const ground = this.scene.pickGround(clientX, clientY);
    if (!ground) return;
    const template = this.placement;
    if (!this.world.canPlace(template, ground.x, ground.z)) {
      this.hud?.toast('That place is not free (terrain, trees, a building or a unit).');
      return;
    }
    const builders = this.selectedEntities().filter((e) => e.kind === 'unit' && e.player === this.me && e.info.builder).map((e) => e.id);
    const cmd: PlayerCommand = { type: 'place', template, x: ground.x, z: ground.z, yaw: this.scene.camera.yaw + Math.PI, builders };
    if (this.online) {
      if (!this.command(cmd)) { this.hud?.toast('The turn already holds too many commands.'); return; }
      this.hud?.toast(`${this.world.template(template).genericName} foundation ordered; it appears in ${this.online.delay} turns.`);
      this.placement = null;
      this.scene.setGhost(null, 0, 0, false);
      return;
    }
    const id = this.world.nextId;
    if (!this.command(cmd)) { this.hud?.toast('You cannot place that here now.'); return; }
    this.hud?.toast(`${this.world.template(template).genericName} foundation placed; send a villager to build it.`);
    this.placement = null;
    this.scene.setGhost(null, 0, 0, false);
    const b = this.world.entity(id);
    if (b) this.selectionChanged([b.id]);
  }

  private stopSelected(): void {
    const ids = this.selectedEntities().filter((e) => e.kind === 'unit' && e.player === this.me).map((e) => e.id);
    if (ids.length && this.command({ type: 'stop', units: ids })) this.hud?.toast('Stopped.');
  }

  private cycleStance(): void {
    const units = this.selectedEntities().filter((e) => e.kind === 'unit' && e.player === this.me);
    if (!units.length) return;
    const current = STANCES.indexOf(units[0].stance);
    const next = (current + 1) % STANCES.length;
    if (this.command({ type: 'stance', units: units.map((e) => e.id), stance: next })) this.hud?.toast(`Stance: ${STANCES[next]}.`);
  }

  private issueCommand(clientX: number, clientY: number): void {
    if (!this.world || !this.scene) return;
    const selected = this.selectedEntities();
    const units = selected.filter((e) => e.kind === 'unit' && e.player === this.me);
    const ground = this.scene.pickGround(clientX, clientY);
    if (!ground) return;
    const target = this.scene.pick(clientX, clientY);
    if (units.length) {
      const ids = units.map((e) => e.id);
      if (target && target.player === 0 && target.info.supply) {
        if (this.command({ type: 'gather', units: ids, target: target.id })) {
          this.hud?.toast(`Gathering ${target.info.genericName}.`);
          return;
        }
      }
      if (target && target.player === this.me && target.kind === 'building' && target.construction) {
        if (this.command({ type: 'build', units: ids, target: target.id })) this.hud?.toast('Building.');
        return;
      }
      if (target && target.player !== this.me && target.player !== 0) {
        if (this.command({ type: 'attack', units: ids, target: target.id })) this.hud?.toast(`Attacking ${target.info.genericName || 'the enemy'}.`);
        return;
      }
      this.command({ type: 'move', units: ids, x: ground.x, z: ground.z });
      return;
    }
    const building = selected.find((e) => e.kind === 'building' && e.player === this.me);
    if (building) {
      if (this.command({ type: 'rally', building: building.id, x: ground.x, z: ground.z })) this.hud?.toast('Rally point set.');
    }
  }

  private addInput(): void {
    const { signal } = this.ctx;
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) e.preventDefault();
      if (e.code === 'Escape') {
        if (this.placement) { this.placement = null; this.scene?.setGhost(null, 0, 0, false); }
        else if (this.playing && !this.paused && !this.ended) { this.paused = true; this.hud?.showPause(); }
        else if (this.paused) { this.paused = false; this.hud?.hidePause(); }
      }
      if (e.code === 'KeyH') this.stopSelected();
      if (e.code === 'Space' && this.selected.length) {
        const e0 = this.world?.entity(this.selected[0]);
        if (e0) this.scene?.camera.focus(e0.x, e0.z);
      }
    }, { signal });
    window.addEventListener('keyup', (e) => { this.keys[e.code] = false; }, { signal });
    const canvas = () => this.scene?.renderer.domElement;
    const down = (e: PointerEvent) => {
      if (!this.playing || this.paused || this.ended || !this.scene) return;
      if (!(e.target instanceof HTMLCanvasElement)) return;
      if (e.button === 0) {
        if (this.placement) { this.placeAt(e.clientX, e.clientY); return; }
        this.dragging = true;
        this.dragMoved = false;
        this.dragStart = { x: e.clientX, y: e.clientY };
      } else if (e.button === 2) {
        if (this.placement) { this.placement = null; this.scene.setGhost(null, 0, 0, false); return; }
        if (e.shiftKey) { this.rotating = true; this.dragLast = { x: e.clientX, y: e.clientY }; }
      } else if (e.button === 1) {
        this.rotating = true;
        this.dragLast = { x: e.clientX, y: e.clientY };
        e.preventDefault();
      }
      canvas()?.focus();
    };
    const move = (e: PointerEvent) => {
      if (!this.scene) return;
      if (this.placement) {
        const g = this.scene.pickGround(e.clientX, e.clientY);
        if (g) this.scene.setGhost(this.placement, g.x, g.z, this.world!.canPlace(this.placement, g.x, g.z));
      }
      if (this.dragging && this.selectionBox) {
        const dx = e.clientX - this.dragStart.x, dy = e.clientY - this.dragStart.y;
        if (Math.hypot(dx, dy) > 5) this.dragMoved = true;
        this.selectionBox.style.display = 'block';
        this.selectionBox.style.left = `${Math.min(this.dragStart.x, e.clientX)}px`;
        this.selectionBox.style.top = `${Math.min(this.dragStart.y, e.clientY)}px`;
        this.selectionBox.style.width = `${Math.abs(dx)}px`;
        this.selectionBox.style.height = `${Math.abs(dy)}px`;
      }
      if (this.rotating) {
        const dx = e.clientX - this.dragLast.x, dy = e.clientY - this.dragLast.y;
        this.dragLast = { x: e.clientX, y: e.clientY };
        this.scene.camera.rotate(dx, dy);
      }
    };
    const up = (e: PointerEvent) => {
      if (!this.scene) return;
      if (e.button === 2 || e.button === 1) { if (this.rotating) { this.rotating = false; return; } }
      if (e.button !== 0) return;
      if (this.placement) return;
      if (!this.playing || this.paused || this.ended) return;
      const wasDrag = this.dragMoved;
      this.dragging = false;
      if (this.selectionBox) this.selectionBox.style.display = 'none';
      if (wasDrag) {
        const ids = this.scene.unitsInBox(this.dragStart.x, this.dragStart.y, e.clientX, e.clientY, this.me);
        this.selectionChanged(e.shiftKey ? [...new Set([...this.selected, ...ids])] : ids);
      } else {
        const hit = this.scene.pick(e.clientX, e.clientY);
        if (hit) this.selectionChanged(e.shiftKey ? [...new Set([...this.selected, hit.id])] : [hit.id]);
        else if (!e.shiftKey) this.selectionChanged([]);
      }
      this.dragMoved = false;
    };
    const ctxMenu = (e: MouseEvent) => {
      e.preventDefault();
      if (!this.playing || this.paused || this.ended) return;
      if (this.placement) { this.placement = null; this.scene?.setGhost(null, 0, 0, false); return; }
      this.issueCommand(e.clientX, e.clientY);
    };
    const wheel = (e: WheelEvent) => { e.preventDefault(); this.scene?.camera.zoom(e.deltaY); };
    const context = () => this.scene?.renderer.domElement;
    addEventListener('pointerdown', down, { signal });
    addEventListener('pointermove', move, { signal });
    addEventListener('pointerup', up, { signal });
    addEventListener('wheel', wheel, { signal, passive: false });
    addEventListener('contextmenu', ctxMenu, { signal });
    void context;
    void this.host;
  }

  // ---------------------------------------------------------------- online

  /** Opens the shared lobby in a layer over the game, then hands the round to `startOnlineRound`. */
  private async startOnline(): Promise<void> {
    if (!this.data || !this.gameRoot) return;
    this.playing = false;
    const civ = this.hud?.civ ?? this.civ;
    const layer = el('div', { className: 'ad-online-layer' });
    layer.style.cssText = 'position:absolute; inset:0; z-index:40; overflow:auto; background:#120e0a;';
    this.gameRoot.append(layer);
    let round: RoundStart;
    try {
      round = await this.ctx.lobby(layer, {
        title: '0 A.D. — online 1v1',
        seats: { min: 2, max: 2, default: 2 },
        seatNames: [`Blue (${civ === 'cart' ? 'Carthaginians' : 'Athenians'})`, `Red (${civ === 'cart' ? 'Athenians' : 'Carthaginians'})`],
        options: () => packGame(Options, (o) => {
          o.map = 'farmland_2p';
          o.startingResources = 300;
          o.civ0 = civ;
          o.civ1 = otherCiv(civ);
          o.commandDelay = 3;
        }),
      });
    } catch {
      layer.remove();
      this.hud?.showMenu();
      return;
    }
    layer.remove();
    await this.startOnlineRound(round);
  }

  private makeOnlineWorld(o: OnlineWorldOptions): World {
    const d = this.data!;
    return new World({
      scenario: d.scenario,
      terrain: d.terrain,
      templates: { info: (n: string) => d.templates.info(n), has: (n: string) => d.templates.has(n) },
      players: [
        { name: o.names[0], civ: o.civs[0], color: [21 / 255, 55 / 255, 149 / 255] },
        { name: o.names[1], civ: o.civs[1], color: [150 / 255, 20 / 255, 20 / 255] },
      ],
      startingResources: o.resources,
      seed: o.seed,
    });
  }

  private async startOnlineRound(round: RoundStart): Promise<void> {
    this.hud?.hideMenu();
    this.hud?.hidePause();
    this.hud?.hideEnd();
    this.ai = null;
    this.ended = false;
    this.paused = false;
    this.accumulator = 0;
    this.selectionChanged([]);
    const match = new OnlineMatch(this.ctx.rooms, round, {
      makeWorld: (o) => this.makeOnlineWorld(o),
      onWorld: (world) => void this.adoptOnlineWorld(world),
      onResults: (r) => this.onlineResults(r),
      onChat: (from, text) => this.hud?.toast(`${this.seatName(from)}: ${text}`),
      onStatus: (text) => this.hud?.toast(text),
      onClosed: (reason) => { this.hud?.toast(`The room closed: ${reason}`); this.quitToMenu(); },
    });
    this.online = match;
    this.me = match.me;
    this.world = match.world;
    this.civ = knownCiv(this.world.players[this.me]?.civ ?? this.civ);
    await this.buildScene();
    this.makeHud();
    this.hud?.hideMenu();
    this.hud?.hidePause();
    this.hud?.hideEnd();
    this.selected = [];
    this.playing = true;
    this.hud?.toast(round.rejoined
      ? 'Rejoined the round: catching up with the checked turns…'
      : 'Online 1v1: commands take three turns to arrive; both simulations advance together.');
  }

  /** A rejoin replay built a new World; rebuild the scene and HUD around it. */
  private async adoptOnlineWorld(world: World): Promise<void> {
    if (!this.online) return;
    this.world = world;
    this.me = this.online.me;
    this.civ = knownCiv(world.players[this.me]?.civ ?? this.civ);
    this.selected = [];
    this.ended = false;
    this.playing = false;
    this.selectionChanged([]);
    await this.buildScene();
    this.makeHud();
    this.hud?.hideMenu();
    this.hud?.hidePause();
    this.hud?.hideEnd();
    this.playing = true;
  }

  private seatName(seat: number): string {
    const s = this.online?.round.seats.find((x) => x.seat === seat);
    return s?.name ?? `Seat ${seat + 1}`;
  }

  private onlineResults(r: { winner: number; turns: number; reason: string }): void {
    if (this.ended) return;
    this.ended = true;
    this.playing = false;
    const won = r.winner === (this.online?.seat ?? this.me - 1);
    const facts = `Round ${this.online?.round.round ?? 0} · ${r.turns} turns · ${r.reason}`;
    const reason = r.reason === 'agreed'
      ? (won ? 'The enemy Civic Centre is destroyed; both simulations agree.' : 'Your Civic Centre has fallen; both simulations agree.')
      : r.reason === 'left' ? (won ? 'The other seat left the round; you win.' : 'You left the round.')
      : r.reason === 'desync' ? 'The two simulations went out of sync; the round ends without a winner.'
      : r.reason === 'disagreed' ? 'The two clients reported different winners; the round ends without a winner.'
      : r.reason === 'too-many-turns' ? "The round reached the server's turn limit."
      : r.reason === 'timeout' ? 'The round stopped: no turn was completed for too long.'
      : `The round ended (${r.reason}).`;
    this.hud?.showEnd(won, `${reason} (${facts})`);
    this.ctx.rooms.leave();
    this.online?.dispose();
  }

  /** Back to the menu: leave an online room and build a fresh single-player world behind the menu. */
  private quitToMenu(): void {
    const wasOnline = !!this.online;
    if (wasOnline) {
      this.online!.dispose();
      this.ctx.rooms.leave();
      this.online = null;
      this.me = 1;
      this.playing = false;
      this.ended = false;
      this.paused = false;
      this.hud?.hidePause();
      this.hud?.hideEnd();
      void this.newWorld(SEED).then(() => {
        this.makeHud();
        this.hud?.showMenu();
      });
      return;
    }
    this.playing = false;
    this.hud?.hidePause();
    this.hud?.hideEnd();
    this.hud?.showMenu();
  }

  private async saveGame(): Promise<void> {
    if (!this.world) return;
    try {
      if (!this.scene) return;
      const bytes = createSave(this.world, this.scene.camera, 'Farmland (2)');
      await this.ctx.storage.put(SAVE_NAME, bytes);
      this.saveExists = true;
      this.hud?.refreshMenu();
      this.hud?.toast('Game saved in your account storage.');
    } catch {
      this.hud?.toast('Could not save: the storage server is not reachable.');
    }
  }

  private async loadSave(): Promise<void> {
    if (!this.world || !this.data) return;
    try {
      const bytes = await this.ctx.storage.get(SAVE_NAME);
      if (!bytes) { this.hud?.toast('No saved game yet.'); return; }
      const save = readSave(bytes);
      const restored = World.restore(save.snapshot, this.worldOptions());
      this.civ = knownCiv(restored.players[1]?.civ ?? 'athen');
      this.world = restored;
      this.ai = new Ai(restored, 2, 11);
      this.selected = [];
      this.ended = false;
      this.playing = true;
      this.paused = false;
      await this.buildScene();
      this.makeHud();
      this.hud?.hideMenu();
      this.hud?.hidePause();
      this.hud?.hideEnd();
      this.hud?.toast(`Loaded the saved game (${Math.floor(restored.time / 60)} min of game time).`);
    } catch (e) {
      console.error(e);
      this.hud?.toast('The save could not be read.');
    }
  }

  stop(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.scene?.dispose();
    this.scene = null;
    this.hud?.root.remove();
    this.hud = null;
    this.world = null;
    this.cssEl.remove();
    this.gameRoot?.remove();
  }
}
