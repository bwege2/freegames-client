// The Lugaru application: the menu, the campaign map, one level at a time, the input, the
// save in the account storage and the bridge to the website SDK.
import type { GameContext, GameInstance } from '../../../src/sdk/index.ts';
import { LugaruUI } from './ui.ts';
import { World } from './sim/world.ts';
import { loadCreatures, type CreatureData } from './sim/creatures.ts';
import { loadAnimations, type AnimationSet } from './sim/animations.ts';
import { loadJson, AudioBank } from './load.ts';
import { parseHeightMap, type HeightMap } from './data/heightmap.ts';
import { parseCampaign, type Campaign } from './data/campaign.ts';
import { parseMap } from './data/map.ts';
import type { PersonInput } from './sim/person.ts';
import { SceneView } from './render/scene.ts';

const SAVE_NAME = 'lugaru-save.json';
const SAVE_VERSION = 1;

interface SaveData {
  version: number;
  unlocked: number;
  completed: number[];
}

type AppState = 'loading' | 'menu' | 'campaign' | 'controls' | 'playing' | 'paused' | 'end' | 'dead';

export class LugaruApp implements GameInstance {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly ui: LugaruUI;
  private readonly keys = new Set<string>();
  private readonly pressed = new Set<string>();
  private readonly mouse = { dragging: false, attack: false, attackPressed: false };
  private heightmap!: HeightMap;
  private campaign!: Campaign;
  private creatures!: [CreatureData, CreatureData];
  private animations!: AnimationSet;
  private audio!: AudioBank;
  private world: World | null = null;
  private scene: SceneView | null = null;
  private state: AppState = 'loading';
  private save: SaveData = { version: SAVE_VERSION, unlocked: 0, completed: [] };
  private currentLevel = 0;
  private dialogIndexShown = -1;
  private lastTime = 0;
  private disposed = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.ui = new LugaruUI(host);
  }

  async start(): Promise<void> {
    this.addEvents();
    this.ui.loading('Loading Lugaru…', 0.05);
    const [heightJson, campaignJson] = await Promise.all([
      loadJson<{ size: number; red: number[] }>('heightmap.json'),
      loadJson<unknown>('campaign.json'),
    ]);
    this.heightmap = parseHeightMap(heightJson);
    this.campaign = parseCampaign(campaignJson);
    this.ui.loading('Loading characters…', 0.2);
    [this.creatures, this.animations] = await Promise.all([
      loadCreatures(),
      loadAnimations((done, total) => this.ui.loading('Loading animations…', 0.2 + 0.75 * (done / total))),
    ]);
    this.audio = new AudioBank(this.ctx.audio);
    await this.loadSave();
    this.ui.hideLoading();
    this.showMenu();
    this.ctx.frame((time) => this.frame(time));
  }

  private addEvents(): void {
    const { signal } = this.ctx;
    window.addEventListener('keydown', (e) => {
      if (['Space', 'ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Tab'].includes(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
      if (e.code === 'Escape' && this.state === 'playing') this.pause();
      else if (e.code === 'Escape' && this.state === 'paused') this.resume();
      if (this.state === 'playing' && this.world?.inDialogue && (e.code === 'Space' || e.code === 'Enter')) {
        this.advanceDialog();
      }
    }, { signal });
    window.addEventListener('keyup', (e) => this.keys.delete(e.code), { signal });
    window.addEventListener('mousemove', (e) => {
      if (!this.world) return;
      const locked = document.pointerLockElement === this.scene?.renderer.domElement;
      if (locked || this.mouse.dragging) {
        this.world.cameraYaw -= e.movementX * 0.14;
        this.world.cameraPitch = Math.max(-70, Math.min(55, this.world.cameraPitch - e.movementY * 0.12));
      }
    }, { signal });
    window.addEventListener('mousedown', (e) => {
      if (e.button === 2) {
        this.mouse.dragging = true;
        return;
      }
      if (e.button !== 0) return;
      if (this.state === 'playing' && this.world?.inDialogue) {
        this.advanceDialog();
        return;
      }
      if (this.state === 'playing') {
        this.mouse.attack = true;
        this.mouse.attackPressed = true;
      }
    }, { signal });
    window.addEventListener('mouseup', (e) => {
      if (e.button === 2) this.mouse.dragging = false;
      if (e.button === 0) this.mouse.attack = false;
    }, { signal });
    window.addEventListener('contextmenu', (e) => { if (this.state === 'playing') e.preventDefault(); }, { signal });
    window.addEventListener('blur', () => { this.keys.clear(); this.mouse.attack = false; }, { signal });
  }

  private frame(time: number): void {
    const dt = this.lastTime ? Math.min(0.05, (time - this.lastTime) / 1000) : 0.016;
    this.lastTime = time;
    if (this.state === 'playing' && this.world) {
      this.updateDialogue(dt);
      const input = this.input();
      this.world.update(dt, input);
      this.mouse.attackPressed = false;
      this.pressed.clear();
      this.scene?.update();
      this.scene?.render();
      if (this.world.won) this.finishLevel();
      else if (this.world.lost) this.showDead();
    } else if ((this.state === 'paused' || this.state === 'end' || this.state === 'dead') && this.scene) {
      this.scene.render();
    }
  }

  private updateDialogue(dt: number): void {
    const w = this.world;
    if (!w) return;
    if (!w.dialogue) {
      if (this.dialogIndexShown !== -1) {
        this.dialogIndexShown = -1;
        this.ui.hideDialogue();
      }
      return;
    }
    const d = w.dialogue;
    d.time += dt;
    if (this.dialogIndexShown !== d.index) {
      this.dialogIndexShown = d.index;
      const scene = d.scenes[d.index];
      this.ui.showDialogue(scene.name, scene.text);
    }
    const scene = d.scenes[d.index];
    const auto = 4.5 + Math.min(6, scene.text.length * 0.03);
    if (d.time > auto) w.advanceDialogue();
  }

  private advanceDialog(): void {
    if (!this.world?.dialogue) return;
    this.world.advanceDialogue();
    this.dialogIndexShown = -1;
    if (!this.world.dialogue) this.ui.hideDialogue();
  }

  private input(): PersonInput {
    const down = (a: string, b?: string) => this.keys.has(a) || (!!b && this.keys.has(b));
    const pressed = (a: string) => this.pressed.has(a);
    return {
      forward: down('KeyW', 'ArrowUp'),
      back: down('KeyS', 'ArrowDown'),
      left: down('KeyA', 'ArrowLeft'),
      right: down('KeyD', 'ArrowRight'),
      jump: down('Space'),
      crouch: down('ShiftLeft') || down('ShiftRight'),
      attack: this.mouse.attack,
      draw: pressed('KeyE'),
      throw: pressed('KeyQ'),
      attackPressed: this.mouse.attackPressed,
      jumpPressed: pressed('Space'),
      crouchPressed: pressed('ShiftLeft') || pressed('ShiftRight'),
      cameraYaw: this.world?.cameraYaw ?? 0,
    };
  }

  private showMenu(): void {
    this.disposeLevel();
    this.state = 'menu';
    this.ui.hideLoading();
    const canContinue = this.save.unlocked > 0 || this.save.completed.length > 0;
    this.ui.menu({
      onStart: () => { this.save = { version: SAVE_VERSION, unlocked: 0, completed: [] }; void this.saveGame(); this.showCampaign(); },
      onContinue: () => this.showCampaign(),
      onChallenge: () => this.startChallenge(),
      onControls: () => { this.state = 'controls'; this.ui.controls(() => this.showMenu()); },
      onQuit: () => this.ctx.exit(),
    }, canContinue);
    if (this.scene) this.scene.render();
  }

  private startChallenge(): void {
    // The original's challenge levels are map1..map14, outside the campaign. The first one is
    // the tutorial's arena; the menu entry keeps the original's 14-map challenge mode.
    this.startMap('map1', -1);
  }

  private async startLevel(index: number): Promise<void> {
    const l = this.campaign.levels[index];
    if (!l) return;
    this.currentLevel = index;
    await this.startMap(l.name, index);
  }

  private async startMap(name: string, campaignIndex: number): Promise<void> {
    this.currentLevel = campaignIndex;
    this.disposeLevel();
    this.state = 'loading';
    this.ui.loading(`Loading ${name.replace(/_/g, ' ')}…`, 0.1);
    try {
      const json = await loadJson<unknown>(`Maps/${name}.json`);
      const map = parseMap(json);
      const world = new World(name, {
        map,
        heightmap: this.heightmap,
        creatures: this.creatures,
        animations: (id) => this.animations.byId.get(id) ?? this.animations.byId.get('bounceidleanim')!,
        audio: this.audio,
      });
      this.world = world;
      this.scene = await SceneView.create(this.host, world);
      this.attachPointerLock(this.scene.renderer.domElement);
      this.ui.hideLoading();
      this.ui.hideAll();
      this.state = 'playing';
      this.dialogIndexShown = -1;
      this.lastTime = 0;
      if (campaignIndex >= 0) {
        this.save.unlocked = Math.max(this.save.unlocked, campaignIndex);
        void this.saveGame();
      }
    } catch (err) {
      console.error('Lugaru: cannot load level', name, err);
      this.ui.hideLoading();
      this.ui.end('Level failed', `Could not load ${name}.\n${err instanceof Error ? err.message : String(err)}`, [
        { label: 'Main menu', onClick: () => this.showMenu() },
      ]);
      this.state = 'end';
    }
  }

  private attachPointerLock(canvas: HTMLCanvasElement): void {
    canvas.addEventListener('click', () => {
      if (this.state !== 'playing') return;
      if (document.pointerLockElement !== canvas && canvas.requestPointerLock) {
        void canvas.requestPointerLock();
      }
    });
    canvas.addEventListener('contextmenu', (e) => e.preventDefault());
  }

  private finishLevel(): void {
    if (!this.world) return;
    if (this.state !== 'playing') return;
    this.state = 'end';
    this.ui.hideDialogue();
    if (this.currentLevel < 0) {
      this.ui.end('Challenge complete', 'The arena is clear.', [
        { label: 'Campaign map', onClick: () => this.showCampaign() },
        { label: 'Main menu', onClick: () => this.showMenu() },
      ]);
      if (document.pointerLockElement) document.exitPointerLock();
      return;
    }
    if (this.currentLevel >= 0) {
      if (!this.save.completed.includes(this.currentLevel)) this.save.completed.push(this.currentLevel);
      this.save.unlocked = Math.max(this.save.unlocked, this.currentLevel + 1);
      void this.saveGame();
    }
    const last = this.currentLevel >= this.campaign.levels.length - 1;
    if (last) {
      this.ui.end('Lugaru', this.campaign.endText || 'You have avenged your family.', [
        { label: 'Campaign map', onClick: () => this.showCampaign() },
        { label: 'Main menu', onClick: () => this.showMenu() },
      ]);
    } else {
      const next = this.campaign.levels[this.currentLevel + 1];
      this.ui.end('Level complete', `${next ? next.description.replace(/_/g, ' ') : ''}\n\nThe island is a little quieter.`, [
        { label: 'Next level', onClick: () => void this.startLevel(this.currentLevel + 1) },
        { label: 'Campaign map', onClick: () => this.showCampaign() },
        { label: 'Main menu', onClick: () => this.showMenu() },
      ]);
    }
    if (document.pointerLockElement) document.exitPointerLock();
  }

  private showDead(): void {
    if (this.state !== 'playing') return;
    this.state = 'dead';
    this.ui.hideDialogue();
    this.ui.end('You died', 'Turner falls. The island is not done with him yet.', [
      { label: 'Retry', onClick: () => { if (this.currentLevel < 0) void this.startMap('map1', -1); else void this.startLevel(this.currentLevel); } },
      { label: 'Campaign map', onClick: () => this.showCampaign() },
      { label: 'Main menu', onClick: () => this.showMenu() },
    ]);
    if (document.pointerLockElement) document.exitPointerLock();
  }

  private showCampaign(): void {
    this.disposeLevel();
    this.state = 'campaign';
    this.ui.campaign(
      this.campaign,
      this.save.unlocked,
      this.save.completed,
      (index) => void this.startLevel(index),
      () => this.showMenu(),
    );
  }

  private pause(): void {
    if (this.state !== 'playing') return;
    this.state = 'paused';
    this.ui.pause(
      () => this.resume(),
      () => { this.state = 'playing'; this.ui.hideAll(); void this.startLevel(this.currentLevel); },
      () => this.showMenu(),
      () => this.ctx.exit(),
    );
    if (document.pointerLockElement) document.exitPointerLock();
  }

  private resume(): void {
    if (this.state !== 'paused') return;
    this.state = 'playing';
    this.ui.hideAll();
    this.lastTime = 0;
  }

  private async loadSave(): Promise<void> {
    try {
      const bytes = await this.ctx.storage.get(SAVE_NAME);
      if (bytes && bytes.length) {
        const data = JSON.parse(new TextDecoder().decode(bytes)) as SaveData;
        if (data && data.version === SAVE_VERSION && Array.isArray(data.completed)) {
          this.save = { version: SAVE_VERSION, unlocked: Math.max(0, data.unlocked | 0), completed: data.completed.filter((n) => Number.isInteger(n)) };
        }
      }
    } catch {
      // no server storage yet: play with the in-memory save
    }
  }

  private async saveGame(): Promise<void> {
    try {
      await this.ctx.storage.put(SAVE_NAME, new TextEncoder().encode(JSON.stringify(this.save)));
    } catch {
      // the game stays playable; the next successful save will catch up
    }
  }

  private disposeLevel(): void {
    this.scene?.dispose();
    this.scene = null;
    this.world = null;
    this.dialogIndexShown = -1;
    this.ui.hideDialogue();
  }

  stop(): void {
    if (this.disposed) return;
    this.disposed = true;
    this.disposeLevel();
    this.ui.destroy();
    if (document.pointerLockElement) document.exitPointerLock();
  }
}
