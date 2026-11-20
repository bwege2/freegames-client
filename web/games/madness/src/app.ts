// Madness Interactive Reloaded port (GPL-3.0). The game around the levels: loading (Scenes/GameLoadingSteps.cs),
// the menus (User interface/Systems/MainMenuSystem.cs, CampaignMenuSystem.cs, ImprobabilityDiskSelection, Incident mode,
// character customisation, settings, credits), the pause menu (Shared/Systems/PauseSystem.cs), the experiment mode's
// editing (Level/Systems/ExperimentModeSystem.cs), cutscenes (Level/Systems/CutsceneSystem.cs, Cutscenes/Cutscene.cs),
// the HUD (PlayerUISystem.cs), the death screen (PlayerDeathSequenceSystem.cs), the user data (CampaignStats, disks.txt,
// settings, player.look; kept in server storage) and the music.
import type { GameContext } from '../../../src/sdk/index.ts';
import { Registry, readKeyValues, assetPath, type AssetSource, type Campaign, type CharacterLook, type Level, ArmourPieceType } from './data/registry.ts';
import { Scene, type SceneHooks } from './game/scene.ts';
import type { PlayerInput } from './game/control.ts';
import { Renderer } from './render/gl.ts';
import { decodeQoi } from './render/qoi.ts';
import { drawScene, drawText, image, line, loadFont, rectFill, textWidth, hexColor, type Font } from './render/draw.ts';
import { clamp, Easings, lerp, mapRange, smoothApproach, v2, type Vec2 } from './engine/util.ts';
import { noiseValue } from './engine/noise.ts';
import { getBarrel } from './game/combat.ts';
import { hasRoundsLeft, HeadOffsetRelativeToBody } from './game/character.ts';
import { DiskState, DISKS, incompatible } from './game/abilities.ts';
import { createIncident, MaxKillTarget, MinKillTarget } from './game/incident.ts';
import { localeTable } from './data/locale.ts';
import { floorLevelAt } from './data/registry.ts';

const dataUrls = import.meta.glob('../assets/data/**/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const localeUrls = import.meta.glob('../assets/locale/*.json', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const textureUrls = import.meta.glob('../assets/textures/**/*.{png,qoi}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const soundUrls = import.meta.glob('../assets/sounds/**/*.{wav,ogg}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const fontUrls = import.meta.glob('../assets/fonts/*.wf', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const videoUrls = import.meta.glob('../assets/video/*.mp4', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

const rel = (k: string): string => k.replace(/^\.\.\/assets\//, '');
const byPath = (m: Record<string, string>): Map<string, string> => new Map(Object.entries(m).map(([k, v]) => [rel(k), v]));
const DATA = byPath(dataUrls);
const TEXTURES = byPath(textureUrls);
const SOUNDS = byPath(soundUrls);
const FONTS = byPath(fontUrls);
const VIDEOS = byPath(videoUrls);

const W = 1920;
const H = 1080;
const MENU_MUSIC = 'sounds/music/Lothyde/unusual_tranquillity.ogg';

interface LevelStats { Kills: number; Deaths: number; Attempts: number; TotalTimeSpent: string; EquippedWeapon: { Key: string; Ammo: number; InfiniteAmmo: boolean } | null }
interface CampaignStats { CampaignId: string; LevelIndex: number; ByLevel: Record<string, LevelStats> }
interface Settings { master: number; music: number; sfx: number; ui: number; screenshake: number; stampRagdolls: boolean }

/** TimeSpan as Json.NET writes it */
const timespan = (s: number): string => {
  const h = Math.floor(s / 3600), m = Math.floor(s / 60) % 60, sec = s % 60;
  const whole = Math.floor(sec);
  const ticks = Math.round((sec - whole) * 1e7);
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(whole).padStart(2, '0')}${ticks ? '.' + String(ticks).padStart(7, '0') : ''}`;
};
const parseTimespan = (t: string): number => {
  const m = /^(?:(\d+)\.)?(\d+):(\d+):(\d+)(?:\.(\d+))?$/.exec(t ?? '');
  if (!m) return 0;
  return (+(m[1] ?? 0)) * 86400 + +m[2] * 3600 + +m[3] * 60 + +m[4] + (m[5] ? +('0.' + m[5]) : 0);
};

class WebAudio {
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private music: { path: string; src: AudioBufferSourceNode } | null = null;
  readonly master: GainNode;
  readonly sfx: GainNode;
  readonly musicGain: GainNode;
  readonly ac: AudioContext;
  readonly signal: AbortSignal;
  constructor(ac: AudioContext, signal: AbortSignal) {
    this.ac = ac;
    this.signal = signal;
    this.master = ac.createGain();
    this.master.connect(ac.destination);
    this.sfx = ac.createGain();
    this.sfx.connect(this.master);
    this.musicGain = ac.createGain();
    this.musicGain.connect(this.master);
  }
  volumes(s: Settings): void { this.master.gain.value = s.master; this.sfx.gain.value = s.sfx; this.musicGain.gain.value = s.music * 0.6; }
  load(path: string): Promise<AudioBuffer | null> {
    let p = this.buffers.get(path);
    if (!p) {
      const url = SOUNDS.get(path);
      p = url ? fetch(url, { signal: this.signal }).then((r) => r.arrayBuffer()).then((b) => this.ac.decodeAudioData(b)).catch(() => null) : Promise.resolve(null);
      this.buffers.set(path, p);
    }
    return p;
  }
  play(path: string, volume = 1, pitch = 1): void {
    void this.load(path).then((b) => {
      if (!b || this.signal.aborted) return;
      const s = this.ac.createBufferSource();
      s.buffer = b;
      s.playbackRate.value = pitch;
      const g = this.ac.createGain();
      g.gain.value = volume;
      s.connect(g).connect(this.sfx);
      s.start();
    });
  }
  stopMusic(): void {
    if (this.music) { try { this.music.src.stop(); } catch { /* stopped */ } this.music = null; }
  }
  playMusic(path: string | null, loop = true, offset = 0): void {
    if (this.music?.path === path) return;
    this.stopMusic();
    if (!path) return;
    const want = path;
    this.music = { path, src: this.ac.createBufferSource() };
    void this.load(path).then((b) => {
      if (!b || this.signal.aborted || this.music?.path !== want) return;
      const src = this.ac.createBufferSource();
      src.buffer = b;
      src.loop = loop;
      src.connect(this.musicGain);
      src.start(0, offset);
      this.music = { path, src };
    });
  }
}

type Screen = 'loading' | 'menu' | 'campaigns' | 'game' | 'disks' | 'incident' | 'character' | 'settings' | 'credits';
type Mode = 'campaign' | 'incident' | 'experiment';

export class MadnessApp {
  private readonly canvas: HTMLCanvasElement;
  private readonly box: HTMLDivElement;
  private readonly r: Renderer;
  private readonly audio: WebAudio;
  private readonly observer: ResizeObserver;
  private destroyed = false;
  private reg!: Registry;
  private texts = new Map<string, string>();
  private fonts = new Map<string, Font>();
  private locale: Record<string, string> = {};
  private sizes = new Map<string, { w: number; h: number }>();
  private screen: Screen = 'loading';
  private scene: Scene | null = null;
  private mode: Mode = 'campaign';
  private campaignId = 'employee_of_the_month';
  private selected: string | null = null;
  private allStats = new Map<string, CampaignStats>();
  private levels: Level[] = [];
  private incident: { name: string; killTarget: number; killCount: number; startKills: number; levelIndex: number; anim: number } | null = null;
  private incidentKills = 100;
  private disks = new DiskState();
  private settings: Settings = { master: 1, music: 1, sfx: 1, ui: 1, screenshake: 1, stampRagdolls: true };
  private playerLook: CharacterLook | null = null;
  private keys = new Set<string>();
  private pressed = new Set<string>();
  private released = new Set<string>();
  private mouse = v2(W / 2, H / 2);
  private buttons = new Set<number>();
  private mousePressed = new Set<number>();
  private wheel = 0;
  private paused = false;
  private loadingText = 'Loading';
  private currentLevelIndex = 0;
  private dodgeSmooth = 0;
  private lastAmmo = 0;
  private ammoFlash = 0;
  private lastBody = 0;
  private bodyFlash = 0;
  private lowAmmoFade = 0;
  private transition = { time: 1, entry: true };
  private busy = false;
  private cutscene: { slides: { type: string; video?: string; texture?: string; duration: number }[]; index: number; time: number; skip: number; done: () => void; el: HTMLVideoElement | null } | null = null;
  private exp = { tab: 'Characters' as 'Characters' | 'Weapons' | 'Music' | 'Rules', pick: null as null | { kind: 'char' | 'weapon'; key: string }, scroll: 0, music: null as string | null };
  private cc = { layer: 'body', scroll: 0 };

  private readonly ctx: GameContext;
  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.tabIndex = 0;
    this.canvas.style.cssText = 'display:block;outline:none;cursor:none;background:#000;position:absolute';
    const box = document.createElement('div');
    box.style.cssText = 'width:100%;height:100%;background:#000;position:relative;overflow:hidden';
    box.appendChild(this.canvas);
    host.appendChild(box);
    this.box = box;
    this.r = new Renderer(this.canvas);
    this.audio = new WebAudio(ctx.audio, ctx.signal);
    const fit = (): void => {
      const s = Math.min(host.clientWidth / W, host.clientHeight / H);
      const w = Math.floor(W * s), h = Math.floor(H * s);
      for (const el of [this.canvas, this.cutscene?.el].filter(Boolean) as HTMLElement[]) {
        el.style.width = `${w}px`;
        el.style.height = `${h}px`;
        el.style.left = `${Math.floor((host.clientWidth - w) / 2)}px`;
        el.style.top = `${Math.floor((host.clientHeight - h) / 2)}px`;
      }
    };
    this.fit = fit;
    this.observer = new ResizeObserver(fit);
    this.observer.observe(host);
    fit();
    this.input();
  }
  private fit: () => void;

  /** the site's stop(): the game loop and the audio context are the SDK's, the rest is here */
  destroy(): void {
    this.destroyed = true;
    this.endCutscene();
    this.audio.stopMusic();
    this.observer.disconnect();
    this.r.dispose();
    this.box.remove();
    this.scene = null;
  }

  async start(): Promise<void> {
    const { signal } = this.ctx;
    this.ctx.frame((_t, dt) => this.frame(dt / 1000));
    const fetchText = (u: string): Promise<string> => fetch(u, { signal }).then((r) => r.text());
    await Promise.all([...DATA].map(async ([k, u]) => { this.texts.set(k, await fetchText(u)); }));
    for (const [, u] of Object.entries(localeUrls)) this.locale = localeTable(await fetchText(u));
    const src: AssetSource = {
      text: (p) => { const t = this.texts.get(p); if (t === undefined) throw new Error(`no ${p}`); return t; },
      has: (p) => this.texts.has(p),
      list: (f) => [...this.texts.keys()].filter((k) => k.startsWith(f + '/')).sort(),
    };
    this.reg = new Registry(src);
    for (const [k, u] of FONTS) this.fonts.set(k, await loadFont(this.r, k, new Uint8Array(await (await fetch(u, { signal })).arrayBuffer())));
    // every texture but the backgrounds and thumbnails now; a level's backgrounds when it starts
    const small = [...TEXTURES.keys()].filter((k) => !k.startsWith('textures/backgrounds/') && !k.startsWith('textures/level_thumbnails/'));
    let done = 0;
    await Promise.all(small.map(async (k) => { await this.loadTexture(k); this.loadingText = `Loading ${Math.round(++done / small.length * 100)}%`; }));
    this.r.upload('#wound', woundTexture(), 64, 64);
    const read = async (name: string): Promise<string | null> => {
      try {
        const b = await Promise.race([this.ctx.storage.get(name), new Promise<null>((r) => setTimeout(() => r(null), 3000))]);
        return b ? new TextDecoder().decode(b) : null;
      } catch { return null; }
    };
    for (const c of this.reg.campaigns.keys()) {
      const t = await read(`campaign-${c}.json`);
      if (t) try { this.allStats.set(c, JSON.parse(t)); } catch { /* broken file */ }
    }
    const disks = await read('disks.txt');
    if (disks) for (const l of disks.split(/\r?\n/)) if (l.trim()) this.disks.unlocked.add(l.trim());
    this.disks.onChange = () => this.write('disks.txt', [...this.disks.unlocked].join('\n'));
    const settings = await read('settings.json');
    if (settings) try { this.settings = { ...this.settings, ...JSON.parse(settings) }; } catch { /* defaults */ }
    this.audio.volumes(this.settings);
    // GameLoadingSteps.LoadPlayerLook: the grunt, or player.look
    this.playerLook = this.reg.looks.get('grunt')!.copy();
    const look = await read('player.look');
    if (look) try { this.playerLook = this.reg.parseLook(look); } catch { /* the grunt */ }
    if (this.destroyed) return;
    this.screen = 'menu';
    this.audio.playMusic(MENU_MUSIC);
  }

  private write(name: string, text: string): void {
    void this.ctx.storage.put(name, new TextEncoder().encode(text)).catch(() => {});
  }

  private async loadTexture(path: string): Promise<void> {
    if (this.r.textures.has(path)) return;
    const url = TEXTURES.get(path);
    if (!url) return;
    const bytes = new Uint8Array(await (await fetch(url, { signal: this.ctx.signal })).arrayBuffer());
    if (path.endsWith('.qoi')) {
      const img = decodeQoi(bytes);
      this.r.upload(path, img.data, img.width, img.height);
      this.sizes.set(path, { w: img.width, h: img.height });
    } else {
      const bmp = await createImageBitmap(new Blob([bytes], { type: 'image/png' }), { imageOrientation: 'flipY', premultiplyAlpha: 'none' });
      this.r.upload(path, bmp, bmp.width, bmp.height);
      this.sizes.set(path, { w: bmp.width, h: bmp.height });
      bmp.close();
    }
  }
  private textureSize(p: string): { w: number; h: number } { return this.sizes.get(p) ?? { w: 1, h: 1 }; }
  private t(key: string, fallback: string): string { return this.locale[key] ?? fallback; }
  private stats(): CampaignStats {
    let s = this.allStats.get(this.campaignId);
    if (!s) { s = { CampaignId: this.campaignId, LevelIndex: 0, ByLevel: {} }; this.allStats.set(this.campaignId, s); }
    return s;
  }
  private saveStats(): void { if (this.mode === 'campaign') this.write(`campaign-${this.campaignId}.json`, JSON.stringify(this.stats())); }
  private campaign(): Campaign { return this.reg.campaigns.get(this.campaignId)!; }
  private levelStats(id: string): LevelStats {
    return this.stats().ByLevel[id] ??= { Kills: 0, Deaths: 0, Attempts: 0, TotalTimeSpent: '00:00:00', EquippedWeapon: null };
  }
  private campaignMeta(id: string): { look?: string; stats?: string; hidden?: boolean; order?: number } {
    try { return JSON.parse(this.texts.get(`data/campaigns/${id}/meta.json`)!.replace(/^﻿/, '')); } catch { return {}; }
  }

  // ---------- starting levels ----------
  private startCampaign(id: string, index: number): void {
    this.mode = 'campaign';
    this.campaignId = id;
    this.incident = null;
    this.levels = this.reg.campaigns.get(id)!.levels.map((l) => this.reg.level(l));
    void this.startLevel(index);
  }
  /** IncidentModeMenuSystem: a new incident with the chosen kill target */
  private startIncident(): void {
    const seed = Math.floor(Math.random() * 2147483647);
    const inc = createIncident(this.reg, seed, this.incidentKills);
    this.mode = 'incident';
    this.levels = inc.levels;
    this.incident = { name: inc.name, killTarget: inc.killTarget, killCount: 0, startKills: 0, levelIndex: 0, anim: 0 };
    void this.startLevel(0);
  }
  /** MainMenuSystem: Experiment = ExperimentScene on exp_1 */
  private startExperiment(): void {
    this.mode = 'experiment';
    this.incident = null;
    this.levels = [this.reg.level('exp_1')];
    void this.startLevel(0);
  }

  /** CampaignScene.Create / ExperimentScene.Create */
  private async startLevel(index: number): Promise<void> {
    if (this.busy || this.destroyed) return;
    this.busy = true;
    const level = this.levels[index];
    this.loadingText = 'Loading';
    this.screen = 'loading';
    const bgs = level.objects.filter((o) => o.$type === 'Background').map((o) => o.TexturePath as string);
    if (level.id === 'lvl_elevator') bgs.push('textures/backgrounds/background_elevator.qoi', 'textures/backgrounds/background_elevator_platform.qoi', 'textures/backgrounds/background_elevator_looping.qoi');
    if (level.id === 'lvl_train_machinist') bgs.push('textures/backgrounds/background_train_machinist_b.qoi');
    for (const b of bgs) await this.loadTexture(b);
    for (const k of [...this.r.textures.keys()]) if (k.startsWith('textures/backgrounds/') && !bgs.includes(k)) this.r.free(k);
    this.currentLevelIndex = index;
    const st = this.mode === 'campaign' ? this.levelStats(level.id) : null;
    if (st) st.Attempts++;
    if (this.incident) {
      // IncidentSystem.OnActivate
      if (this.incident.levelIndex !== index) this.incident.startKills = this.incident.killCount;
      else this.incident.killCount = this.incident.startKills;
      this.incident.levelIndex = index;
    }
    const meta = this.mode === 'campaign' ? this.campaignMeta(this.campaignId) : {};
    const hooks: SceneHooks = {
      nextLevel: (carried) => this.nextLevel(carried),
      stat: (k) => { if (st) { if (k === 'kill') st.Kills++; else st.Deaths++; } },
      music: (p, loop, offset) => this.audio.playMusic(p, loop ?? true, offset ?? 0),
      cutscene: (key, done) => this.playCutscene(key, done),
      attempts: st?.Attempts ?? 1,
      playerLook: this.playerLook ?? undefined,
      playerLookKey: meta.look,
      playerStats: meta.stats,
    };
    const carried = st?.EquippedWeapon ? { key: st.EquippedWeapon.Key, ammo: st.EquippedWeapon.Ammo, infinite: st.EquippedWeapon.InfiniteAmmo } : null;
    if (this.destroyed) return;
    this.scene = new Scene(this.reg, level, { play: (p, v, pitch) => this.audio.play(p, v, pitch) }, (p) => this.textureSize(p),
      (f) => [...SOUNDS.keys(), ...TEXTURES.keys()].filter((k) => k.startsWith(f + '/')), hooks, carried, this.disks);
    this.scene.autoSpawn = this.mode !== 'experiment';
    this.scene.screenshake = this.settings.screenshake;
    this.scene.stampRagdolls = this.settings.stampRagdolls;
    this.audio.playMusic(this.mode === 'experiment' ? this.exp.music : level.backgroundMusic);
    this.paused = false;
    this.transition = { time: 0, entry: level.openingTransition };
    this.screen = 'game';
    this.busy = false;
  }

  /** LevelProgressSystem.TransitionToNextLevel */
  private nextLevel(carried: { key: string; ammo: number; infinite: boolean } | null): void {
    const cur = this.currentLevelIndex;
    if (this.mode === 'campaign') {
      const stats = this.stats();
      const lv = this.campaign().levels;
      if (lv[clamp(stats.LevelIndex, 0, lv.length - 1)] === lv[cur]) stats.LevelIndex++;
      const next = cur + 1 < lv.length ? lv[cur + 1] : null;
      if (next) this.levelStats(next).EquippedWeapon = carried ? { Key: carried.key, Ammo: carried.ammo, InfiniteAmmo: carried.infinite } : null;
      this.saveStats();
    }
    if (this.incident && this.scene) this.incident.killCount = this.incident.startKills + this.scene.progress.bodyCount.current;
    this.audio.play('sounds/ui/scenesweep.wav');
    setTimeout(() => {
      if (cur + 1 >= this.levels.length) { this.toMenu(); return; }
      void this.startLevel(cur + 1);
    }, 300);
  }
  private toMenu(): void {
    this.endCutscene();
    this.scene = null;
    this.paused = false;
    if (this.destroyed) return;
    this.screen = 'menu';
    this.audio.playMusic(MENU_MUSIC);
  }

  // ---------- cutscenes ----------
  /** CutsceneSystem with VideoSlide, PlayerPosterSlide and TextureSlide */
  private playCutscene(key: string, done: () => void): void {
    const text = this.texts.get(`data/cutscenes/${key}.json`);
    if (!text) { done(); return; }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const slides = (JSON.parse(text.replace(/^﻿/, '')) as any[]).map((s) => ({
      type: String(s.$type).split(',')[0].split('.').pop()!, video: s.Video ? assetPath(String(s.Video)) : undefined, texture: s.Texture ? assetPath(String(s.Texture)) : undefined, duration: Number(s.Duration ?? 1),
    }));
    this.cutscene = { slides, index: -1, time: 0, skip: 0, done, el: null };
    this.audio.playMusic(null);
    this.nextSlide();
  }
  private nextSlide(): void {
    const c = this.cutscene!;
    if (c.el) { c.el.pause(); c.el.remove(); c.el = null; }
    c.index++;
    c.time = 0;
    if (c.index >= c.slides.length) { const d = c.done; this.cutscene = null; d(); return; }
    const sl = c.slides[c.index];
    if (sl.type === 'VideoSlide' && sl.video && VIDEOS.has(sl.video)) {
      const v = document.createElement('video');
      v.src = VIDEOS.get(sl.video)!;
      v.playsInline = true;
      v.style.cssText = 'position:absolute;object-fit:contain;background:#000;pointer-events:none';
      this.box.appendChild(v);
      c.el = v;
      this.fit();
      void v.play().catch(() => {});
    }
  }
  private endCutscene(): void { if (this.cutscene?.el) this.cutscene.el.remove(); this.cutscene = null; }
  private cutsceneFrame(dt: number): void {
    const c = this.cutscene!;
    const cs = (): NonNullable<typeof this.cutscene> => this.cutscene!;
    const sl = c.slides[c.index];
    // a video the browser cannot decode does not hold the cutscene up: its slide still lasts its duration
    const ready = !c.el || c.el.readyState >= 2 || !!c.el.error || c.el.networkState === 3;
    if (ready) c.time += dt;
    if (c.time >= sl.duration || (c.el && c.el.ended)) { this.nextSlide(); if (!this.cutscene) return; }
    rectFill(this.r, 0, 0, W, H, [0, 0, 0, 1], 340, 0);
    const now = cs().slides[cs().index];
    if (now && now.type !== 'VideoSlide') {
      const tex = now.type === 'PlayerPosterSlide' ? 'textures/cutscene_player_poster.png' : now.texture ?? '';
      const t = this.r.textures.get(tex);
      if (t) {
        const s = lerp(1, 1.05, cs().time / now.duration) * Math.min(W / t.w, H / t.h);
        image(this.r, tex, W / 2 - t.w * s / 2, H / 2 - t.h * s / 2, t.w * s, t.h * s, [1, 1, 1, 1], 341, 0);
      }
    }
    if (this.keys.has('Escape')) { cs().skip += dt; if (cs().skip > 1) { cs().index = cs().slides.length - 1; this.nextSlide(); return; } } else cs().skip = 0;
    if (cs().skip > 0) drawText(this.r, this.font('inter'), this.t('skip', 'Skip'), W - 40, H - 60, 28, [1, 1, 1, cs().skip], 1, 0, 400);
  }

  private input(): void {
    const { signal } = this.ctx;
    const c = this.canvas;
    const game = new Set(['KeyA', 'KeyD', 'KeyE', 'KeyF', 'KeyR', 'KeyQ', 'Space', 'Escape', 'Tab', 'ShiftLeft', 'ControlLeft', 'ArrowLeft', 'ArrowRight']);
    window.addEventListener('keydown', (e) => {
      if (game.has(e.code)) e.preventDefault();
      if (!this.keys.has(e.code)) this.pressed.add(e.code);
      this.keys.add(e.code);
    }, { signal });
    window.addEventListener('keyup', (e) => { this.keys.delete(e.code); this.released.add(e.code); }, { signal });
    const pos = (e: MouseEvent): void => {
      const b = c.getBoundingClientRect();
      this.mouse = v2((e.clientX - b.left) / b.width * W, (e.clientY - b.top) / b.height * H);
    };
    this.box.addEventListener('mousemove', pos, { signal });
    this.box.addEventListener('mousedown', (e) => { pos(e); c.focus(); e.preventDefault(); this.buttons.add(e.button); this.mousePressed.add(e.button); }, { signal });
    window.addEventListener('mouseup', (e) => { this.buttons.delete(e.button); }, { signal });
    this.box.addEventListener('wheel', (e) => { this.wheel += Math.sign(e.deltaY); e.preventDefault(); }, { signal, passive: false });
    c.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    window.addEventListener('blur', () => { this.keys.clear(); this.buttons.clear(); }, { signal });
  }

  private worldMouse(s: Scene): Vec2 {
    const cam = s.camera;
    return v2(cam.position.x + (this.mouse.x - W / 2) * cam.ortho, cam.position.y + cam.shakeOffset - (this.mouse.y - H / 2) * cam.ortho);
  }

  private frame(dt: number): void {
    if (this.destroyed) return;
    dt = Math.min(dt, 0.1);
    switch (this.screen) {
      case 'loading': this.drawLoading(); break;
      case 'menu': this.menu(); break;
      case 'campaigns': this.campaignMenu(); break;
      case 'disks': this.diskMenu(); break;
      case 'incident': this.incidentMenu(); break;
      case 'character': this.characterMenu(); break;
      case 'settings': this.settingsMenu(); break;
      case 'credits': this.credits(); break;
      case 'game': this.game(dt); break;
    }
    this.pressed.clear();
    this.released.clear();
    this.mousePressed.clear();
    this.wheel = 0;
  }

  private font(name: string): Font { return this.fonts.get(`fonts/${name}.wf`)!; }
  private flush(): void { this.r.flush([W / 2, H / 2, W / 2, -H / 2], [0, 0, 0]); }

  private drawLoading(): void {
    const f = this.fonts.get('fonts/inter.wf');
    if (f) drawText(this.r, f, this.loadingText, W / 2, H / 2, 32, [1, 1, 1, 1], 0.5, 0.5);
    this.flush();
  }

  /** a menu button (MadnessUi's LeftAlignedButton): white text, red when hovered; true when clicked */
  private button(text: string, x: number, y: number, size = 42, enabled = true, layer = 350, selected = false): boolean {
    const f = this.font('impact');
    const w = textWidth(f, text, size);
    const hover = enabled && this.mouse.x >= x && this.mouse.x <= x + w + 20 && this.mouse.y >= y - 4 && this.mouse.y <= y + size;
    drawText(this.r, f, text, x + (hover || selected ? 12 : 0), y, size, enabled ? (hover || selected ? [1, 0.1, 0.1, 1] : [1, 1, 1, 1]) : [1, 1, 1, 0.35], 0, 0, layer);
    if (hover && this.mousePressed.has(0)) { this.audio.play('sounds/ui/press.wav'); return true; }
    return false;
  }
  private cursor(): void {
    line(this.r, v2(this.mouse.x - 12, this.mouse.y), v2(this.mouse.x + 12, this.mouse.y), 3, [1, 1, 1, 1], 400, 0);
    line(this.r, v2(this.mouse.x, this.mouse.y - 12), v2(this.mouse.x, this.mouse.y + 12), 3, [1, 1, 1, 1], 400, 0);
  }
  private background(): void { image(this.r, 'textures/red-black-gradient.png', 0, 0, W, H, [1, 1, 1, 1], -1000, 0); }
  private text(s: string, x: number, y: number, size: number, a = 1, font = 'inter', h = 0): void { drawText(this.r, this.font(font), s, x, y, size, [1, 1, 1, a], h); }
  private back(x = 90, y = 980): boolean { return this.button(this.t('back', 'Back'), x, y, 36); }

  /** MainMenuSystem */
  private menu(): void {
    this.background();
    const logo = this.r.textures.get('textures/ui/logo.png');
    if (logo) image(this.r, 'textures/ui/logo.png', 80, 70, logo.w * 0.8, logo.h * 0.8);
    let y = 400;
    const b = (k: string, f: string): boolean => { const r = this.button(this.t(k, f), 90, y); y += 64; return r; };
    if (b('main-menu-campaigns', 'Campaigns')) this.screen = 'campaigns';
    if (b('main-menu-improbability-disks', 'Improbability disks')) this.screen = 'disks';
    if (b('main-menu-experiment', 'Experiment')) this.startExperiment();
    if (b('main-menu-incident-mode', 'Incident mode')) this.screen = 'incident';
    if (b('main-menu-char-customisation', 'Character customisation')) this.screen = 'character';
    if (b('main-menu-settings', 'Settings')) this.screen = 'settings';
    if (b('main-menu-credits-info', 'Credits and information')) this.screen = 'credits';
    if (b('main-menu-quit', 'Quit')) this.ctx.exit();
    this.text('Madness Interactive Reloaded 0.51.1 by Studio Minus - browser port', W - 30, H - 40, 18, 0.5, 'inter', 1);
    this.cursor();
    this.flush();
  }

  /** CampaignMenuSystem: the campaigns (not the hidden ones, ordered), continue, restart, level select */
  private campaignMenu(): void {
    this.background();
    const list = [...this.reg.campaigns.values()].filter((c) => !this.campaignMeta(c.id).hidden)
      .sort((a, b) => (this.campaignMeta(a.id).order ?? 0) - (this.campaignMeta(b.id).order ?? 0));
    let y = 90;
    for (const c of list) { if (this.button(c.name, 90, y, 40, true, 350, this.selected === c.id)) this.selected = c.id; y += 56; }
    if (this.back()) { this.screen = 'menu'; this.selected = null; }
    const c = this.selected ? this.reg.campaigns.get(this.selected) : null;
    if (!c) { this.text(this.t('cmpgn-menu-select-campaign', 'Select a campaign on the left'), 900, 120, 28, 0.7); this.cursor(); this.flush(); return; }
    this.campaignId = c.id;
    const stats = this.stats();
    drawText(this.r, this.font('impact'), c.name, 800, 80, 64, [1, 1, 1, 1]);
    this.text(c.author, 800, 160, 22, 0.6);
    wrap(c.description, 80).forEach((l, i) => this.text(l, 800, 200 + i * 28, 20, 0.85));
    const kills = Object.values(stats.ByLevel).reduce((a, l) => a + l.Kills, 0);
    const time = Object.values(stats.ByLevel).reduce((a, l) => a + parseTimespan(l.TotalTimeSpent), 0);
    const done = Math.min(stats.LevelIndex, c.levels.length);
    this.text(`${this.t('cmpgn-menu-completed-levels', 'Completed levels')}: ${done} / ${c.levels.length}   ${this.t('cmpgn-menu-time-spent', 'Time spent')}: ${timespan(Math.floor(time))}   Kills: ${kills}`, 800, 330, 22, 0.7);
    const cont = clamp(stats.LevelIndex, 0, c.levels.length - 1);
    if (this.button(stats.LevelIndex > 0 ? this.t('cmpgn-menu-continue', 'Continue') : this.t('cmpgn-menu-play', 'Play'), 800, 380, 48)) this.startCampaign(c.id, cont);
    if (stats.LevelIndex > 0 && this.button(this.t('cmpgn-menu-restart', 'Restart'), 1100, 380, 48)) {
      this.allStats.set(c.id, { CampaignId: c.id, LevelIndex: 0, ByLevel: {} });
      this.write(`campaign-${c.id}.json`, JSON.stringify(this.stats()));
      this.startCampaign(c.id, 0);
    }
    drawText(this.r, this.font('impact'), this.t('cmpgn-menu-lvl-select', 'Level select'), 800, 460, 36, [1, 1, 1, 1]);
    const perCol = 12;
    c.levels.forEach((id, i) => {
      const unlocked = i <= stats.LevelIndex;
      const col = Math.floor(i / perCol);
      const name = this.reg.level(id).displayName !== 'untitled' ? this.reg.level(id).displayName : id.replace(/^(lvl|tut)_/, '').replace(/_/g, ' ');
      if (this.button(`${String(i + 1).padStart(2, '0')} ${name}`, 800 + col * 380, 510 + (i % perCol) * 40, 26, unlocked) && unlocked) this.startCampaign(c.id, i);
    });
    this.cursor();
    this.flush();
  }

  /** ImprobabilityDiskSelectionMenuSystem: the unlocked disks, enabled with a click */
  private diskMenu(): void {
    this.background();
    drawText(this.r, this.font('impact'), this.t('experiment-modifiers-disks', 'Improbability Disks'), 90, 60, 64, [1, 1, 1, 1]);
    DISKS.forEach((d, i) => {
      const x = 90 + (i % 6) * 290, y = 170 + Math.floor(i / 6) * 270;
      const unlocked = this.disks.isUnlocked(d.id);
      const on = this.disks.has(d.id);
      const blocked = !on && [...this.disks.enabled].some((e) => incompatible(e, d.id));
      const hover = this.mouse.x >= x && this.mouse.x < x + 260 && this.mouse.y >= y && this.mouse.y < y + 250;
      rectFill(this.r, x, y, 260, 250, on ? [0.6, 0, 0, 0.8] : [0, 0, 0, hover ? 0.6 : 0.4]);
      if (unlocked) image(this.r, d.texture, x + 55, y + 10, 150, 150, [1, 1, 1, blocked ? 0.3 : 1], 351);
      else image(this.r, 'textures/ui/locked.png', x + 90, y + 40, 80, 80, [1, 1, 1, 0.5], 351);
      this.text(unlocked ? d.name : '???', x + 130, y + 170, 24, 1, 'impact', 0.5);
      if (unlocked) wrap(d.description, 28).slice(0, 2).forEach((l, k) => this.text(l, x + 130, y + 202 + k * 20, 15, 0.8, 'inter', 0.5));
      if (hover && unlocked && this.mousePressed.has(0) && !blocked) { this.disks.toggle(d.id); this.audio.play('sounds/ui/confirm.wav'); }
    });
    if (this.back()) this.screen = 'menu';
    this.cursor();
    this.flush();
  }

  /** IncidentModeMenuSystem: the number of victims, start */
  private incidentMenu(): void {
    this.background();
    drawText(this.r, this.font('impact'), this.t('main-menu-incident-mode', 'Incident mode'), 90, 80, 72, [1, 1, 1, 1]);
    this.text(`${this.incidentKills}`, 90, 260, 64, 1, 'toxigenesis');
    if (this.button('-', 90, 360, 48) || this.wheel > 0) this.incidentKills = clamp(this.incidentKills - 10, MinKillTarget, MaxKillTarget);
    if (this.button('+', 180, 360, 48) || this.wheel < 0) this.incidentKills = clamp(this.incidentKills + 10, MinKillTarget, MaxKillTarget);
    if (this.button(this.t('cmpgn-menu-play', 'Play'), 90, 470, 56)) this.startIncident();
    if (this.back()) this.screen = 'menu';
    this.cursor();
    this.flush();
  }

  /** CharacterCreationSystem: every layer of the look, cycled through the registered pieces; saved as player.look */
  private characterMenu(): void {
    this.background();
    const look = this.playerLook!;
    drawText(this.r, this.font('impact'), this.t('main-menu-char-customisation', 'Character customisation'), 90, 60, 56, [1, 1, 1, 1]);
    const layers: [string, string, number][] = [['body', 'Body', ArmourPieceType.Body], ['head', 'Head', ArmourPieceType.Head],
      ['h0', 'Head accessory 1', ArmourPieceType.HeadAccessory], ['h1', 'Head accessory 2', ArmourPieceType.HeadAccessory], ['h2', 'Head accessory 3', ArmourPieceType.HeadAccessory],
      ['b0', 'Body accessory 1', ArmourPieceType.BodyAccessory], ['b1', 'Body accessory 2', ArmourPieceType.BodyAccessory], ['hands', 'Hands', -1]];
    layers.forEach(([k, n], i) => { if (this.button(n, 90, 170 + i * 52, 34, true, 350, this.cc.layer === k)) { this.cc.layer = k; this.cc.scroll = 0; } });
    const layer = layers.find((l) => l[0] === this.cc.layer)!;
    const items: [string, unknown][] = layer[2] === -1
      ? [['default', null], ...[...this.reg.hands.entries()].filter(([, h]) => !h.name.startsWith('#'))]
      : [...(layer[2] >= ArmourPieceType.HeadAccessory ? [['none', null]] : []) as [string, unknown][], ...[...this.reg.armour.entries()].filter(([, p]) => p.type === layer[2] && !p.hidden)];
    this.cc.scroll = clamp(this.cc.scroll + this.wheel * 3, 0, Math.max(0, items.length - 16));
    items.slice(this.cc.scroll, this.cc.scroll + 16).forEach(([key, piece], i) => {
      const name = piece ? (piece as { name: string }).name || key : key;
      if (this.button(name, 520, 170 + i * 48, 30)) {
        const p = piece as never;
        switch (this.cc.layer) {
          case 'body': look.body = p; break;
          case 'head': look.head = p; break;
          case 'hands': look.hands = p; break;
          default: if (this.cc.layer[0] === 'h') look.headLayers[+this.cc.layer[1]] = p; else look.bodyLayers[+this.cc.layer[1]] = p;
        }
      }
    });
    this.lookPreview(look, 1500, 760, 1.2);
    if (this.button(this.t('character-creation-reset', 'Reset'), 1300, 980, 36)) this.playerLook = this.reg.looks.get('grunt')!.copy();
    if (this.button(this.t('character-creation-save-exit', 'Done'), 90, 980, 36)) { this.write('player.look', this.lookText(look)); this.screen = 'menu'; }
    this.cursor();
    this.flush();
  }
  /** a still picture of a look: body, head and their layers at their offsets (screen space) */
  private lookPreview(look: CharacterLook, x: number, y: number, k: number): void {
    const put = (tex: string, cx: number, cy: number, sc: number): void => {
      const t = this.r.textures.get(tex);
      if (t) image(this.r, tex, cx - t.w * sc * k / 2, cy - t.h * sc * k / 2, t.w * sc * k, t.h * sc * k);
    };
    const bs = this.textureSize(look.body.right);
    const bodyCy = y - bs.h * k / 2;
    put(look.body.right, x, bodyCy, look.body.textureScale);
    for (const l of look.bodyLayers) if (l) put(l.right, x + l.offsetRight.x * k, bodyCy - l.offsetRight.y * k, l.textureScale);
    const hx = x + bs.w * k * HeadOffsetRelativeToBody.x, hy = bodyCy - bs.h * k * (0.5 + HeadOffsetRelativeToBody.y) + 40 * k;
    put(look.head.right, hx, hy, look.head.textureScale);
    for (const l of look.headLayers) if (l) put(l.right, hx + l.offsetRight.x * k, hy - l.offsetRight.y * k, l.textureScale);
    const hand = look.hands?.looks.get(0)?.front ?? 'textures/bodies/default/hand_fist.png';
    put(hand, x + 150 * k, bodyCy + 20 * k, 1);
  }
  /** CharacterLookDeserialiser.Save */
  private lookText(look: CharacterLook): string {
    const key = (p: unknown): string | undefined => [...this.reg.armour.entries()].find(([, v]) => v === p)?.[0];
    const out = ['0.51.1', '', 'body', `   ${key(look.body)}`];
    for (const l of look.bodyLayers) if (l) out.push(`   ${key(l)}`);
    out.push('', 'head', `   ${key(look.head)}`);
    for (const l of look.headLayers) if (l) out.push(`   ${key(l)}`);
    out.push('');
    const hk = [...this.reg.hands.entries()].find(([, v]) => v === look.hands)?.[0];
    if (hk) out.push(`hands ${hk}`);
    out.push(`blood ${look.bloodColour}`);
    return out.join('\n') + '\n';
  }

  /** SettingsSceneSystem: the volumes, screen shake and ragdoll stamping */
  private settingsMenu(): void {
    this.background();
    drawText(this.r, this.font('impact'), this.t('main-menu-settings', 'Settings'), 90, 60, 64, [1, 1, 1, 1]);
    const s = this.settings;
    const rows: [string, string, 'master' | 'music' | 'sfx' | 'screenshake'][] = [['settings-master-volume', 'Master volume', 'master'], ['settings-music-volume', 'Music', 'music'],
      ['settings-sfx-volume', 'Sound effects', 'sfx'], ['settings-screenshake', 'Screenshake', 'screenshake']];
    rows.forEach(([k, f, field], i) => {
      const y = 200 + i * 90;
      this.text(this.t(k, f), 90, y, 32);
      if (this.button('-', 600, y - 6, 40)) s[field] = Math.max(0, Math.round((s[field] - 0.1) * 10) / 10);
      this.text(`${Math.round(s[field] * 100)}%`, 680, y, 32);
      if (this.button('+', 820, y - 6, 40)) s[field] = Math.min(field === 'screenshake' ? 2 : 1, Math.round((s[field] + 0.1) * 10) / 10);
    });
    if (this.button(`${this.t('settings-stamp-ragdolls', 'Stamp ragdolls on background')}: ${s.stampRagdolls ? 'on' : 'off'}`, 90, 560, 32)) s.stampRagdolls = !s.stampRagdolls;
    this.audio.volumes(s);
    if (this.back()) { this.write('settings.json', JSON.stringify(s)); this.screen = 'menu'; }
    this.cursor();
    this.flush();
  }

  /** InformationScene: credits.txt */
  private credits(): void {
    this.background();
    const lines = (this.texts.get('data/credits.txt') ?? '').split(/\r?\n/);
    lines.forEach((l, i) => this.text(l.replace(/<[^>]+>/g, ''), W / 2, 120 + i * 40, 30, l.includes('<color') ? 0.7 : 1, 'inter', 0.5));
    if (this.back()) this.screen = 'menu';
    this.cursor();
    this.flush();
  }

  private game(dt: number): void {
    const s = this.scene!;
    if (this.cutscene) {
      s.paused = true;
      this.cutsceneFrame(dt);
      this.r.flush([W / 2, H / 2, W / 2, -H / 2], [0, 0, 0]);
      return;
    }
    if (this.pressed.has('Escape') && !s.deathSequence) {
      this.paused = !this.paused;
      this.audio.play(this.paused ? 'sounds/ui/press.wav' : 'sounds/ui/confirm.wav');
    }
    if (this.mode === 'experiment' && this.released.has('Tab') && s.player?.isAlive) s.editing = !s.editing;
    s.paused = this.paused;
    const k = this.keys;
    const map: [string, 'left' | 'right' | 'jumpDodge' | 'interact' | 'throw'][] = [['KeyA', 'left'], ['KeyD', 'right'], ['Space', 'jumpDodge'], ['KeyE', 'interact'], ['KeyF', 'throw']];
    const ab = ['ShiftLeft', 'KeyQ', 'ControlLeft', 'KeyR'];
    const input: PlayerInput = {
      left: k.has('KeyA'), right: k.has('KeyD'), jumpDodge: k.has('Space'), interact: k.has('KeyE'), throw: k.has('KeyF'),
      attack: this.buttons.has(0), melee: this.buttons.has(1), blockAim: this.buttons.has(2), pressed: new Set(), worldMouse: this.worldMouse(s),
      abilityHeld: ab.map((c) => k.has(c)), abilityPressed: ab.map((c) => this.pressed.has(c)), abilityReleased: ab.map((c) => this.released.has(c)),
    };
    for (const [code, name] of map) if (this.pressed.has(code)) input.pressed.add(name);
    if (this.mousePressed.has(0)) input.pressed.add('attack');
    if (this.mousePressed.has(1)) input.pressed.add('melee');
    if (s.editing) this.experimentClick(s, input);
    if (!this.paused) {
      s.update(dt, input);
      if (this.mode === 'campaign') {
        const st = this.levelStats(s.level.id);
        st.TotalTimeSpent = timespan(parseTimespan(st.TotalTimeSpent) + dt);
      }
      if (this.incident) this.incident.killCount = this.incident.startKills + s.progress.bodyCount.current;
    }
    // R: retry when dead (LevelProgressSystem; not with Tricky); in an experiment: revive
    if (this.released.has('KeyR') && s.deathSequence && !this.disks.has('tricky')) {
      if (this.mode === 'experiment') s.revive(); else { void this.startLevel(this.currentLevelIndex); return; }
    }
    const cam = s.camera;
    drawScene(this.r, s, dt);
    this.levelBorder(s);
    this.r.flush([cam.position.x, cam.position.y + cam.shakeOffset, W / 2 * cam.ortho, H / 2 * cam.ortho], [0, 0, 0]);
    if (!s.editing) this.hud(s, dt);
    this.overlays(s, dt);
    if (s.editing) this.experimentPanel(s);
    if (this.paused) this.pauseMenu();
    this.transitionOverlay(dt);
    this.r.flush([W / 2, H / 2, W / 2, -H / 2], null);
  }

  private toScreen(s: Scene, q: Vec2): Vec2 {
    const cam = s.camera;
    return v2((q.x - cam.position.x) / cam.ortho + W / 2, -(q.y - cam.position.y - cam.shakeOffset) / cam.ortho + H / 2);
  }

  /** the boss's health bar (RichBossSystem.Render), the training instructions (TeachSystem), the incident counter
   * (IncidentSystem), a disk just unlocked (UnlockDiskSystem) and the experiment's edit-mode hint */
  private overlays(s: Scene, dt: number): void {
    const r = this.r;
    const tox = this.font('toxigenesis');
    const p = s.player;
    const alive = !!p && p.isAlive && !this.paused;
    for (const c of s.characters) {
      const rich = c.rich;
      if (!rich || !alive || c.removed) continue;
      const health = Math.max(0, Math.min(c.positioning.body.health / c.positioning.body.maxHealth, c.positioning.head.health / c.positioning.head.maxHealth));
      if (Math.abs(health - rich.lastHealth) > 1e-6) rich.healthFlash = 0;
      const f = clamp(1 - rich.healthFlash * 4, 0, 1);
      rich.healthFlash += dt;
      rich.lastHealth = health;
      const col: [number, number, number, number] = [1, f, f, 1];
      drawText(r, tox, c.stats.name, W / 2, 10, 30, [col[0], col[1], col[2], 0.9], 0.5);
      rectFill(r, W / 4, 43, W / 2, 14, [0, 0, 0, 1]);
      rectFill(r, W / 4 + 2, 45, (W / 2 - 4) * health, 10, col, 350, 1);
      if (rich.warning) {
        // the warning circle and cross of StartGunSequence, in screen space
        const t = this.toScreen(s, rich.target);
        const pp = Easings.cubicIn(rich.warning.t);
        circleOutline(r, t, 500 * pp / s.camera.ortho, 24 / s.camera.ortho, [1, 0, 0, 1]);
        circleOutline(r, t, mapRange(0, 1, 4000, 500, pp) / s.camera.ortho, 24 / s.camera.ortho, [1, 0, 0, pp]);
      }
    }
    if (s.tutorial && alive) {
      const f = this.font('inter');
      for (const ins of s.tutorial.instructions) {
        let msg = this.t(ins.key, ins.key);
        ins.args.forEach((a, i) => { msg = msg.replace(`{${i}}`, a); });
        msg = msg.replace(/<[^>]+>/g, '');
        const lines = msg.split('\n').flatMap((l) => wrap(l, 60));
        const w = Math.min(600, Math.max(...lines.map((l) => textWidth(f, l, 22))) + 20);
        const h = lines.length * 28 + 10;
        let x = 0, y = 0;
        const target = (q: Vec2 | null): boolean => { if (!q) return false; const sp = this.toScreen(s, q); x = sp.x - w / 2; y = sp.y - h / 2; return true; };
        switch (ins.target) {
          case 'Right': x = W - w - 10; y = H / 2 - h / 2; break;
          case 'Left': x = 10; y = H / 2 - h / 2; break;
          case 'Top': x = W / 2 - w / 2; y = 120; break;
          case 'Player': target(v2(p!.positioning.body.computedVisualCenter.x, p!.positioning.body.computedVisualCenter.y + 400 * p!.positioning.scale)); break;
          case 'NPC': { const n = s.characters.find((c) => c.ai && c.isAlive); if (!target(n ? v2(n.positioning.body.computedVisualCenter.x, n.positioning.body.computedVisualCenter.y + 400 * n.positioning.scale) : null)) continue; break; }
          case 'Weapon': { const wp = s.weapons.find((wx) => hasRoundsLeft(wx)); if (!target(wp ? v2(wp.transform.position.x, wp.transform.position.y + 200) : null)) continue; break; }
        }
        rectFill(r, x, y, w, h, [0, 0, 0, 0.8]);
        lines.forEach((l, i) => drawText(r, f, l, x + 10, y + 8 + i * 28, 22, [1, 1, 1, 1], 0, 0, 350, 11));
      }
      if (s.tutorial.counter) drawText(r, tox, s.tutorial.counter, W / 2, H / 2, 48, [1, 1, 1, 1], 0.5, 0.5);
    }
    if (this.incident && alive) {
      const inc = this.incident;
      const str = `${inc.killTarget - inc.killCount}`;
      let pos = v2(W - 30 - textWidth(tox, str, 64) / 2, H - 70);
      if (inc.levelIndex === 0) { inc.anim += dt * 0.5; const t = Easings.quadInOut(clamp(inc.anim)); pos = v2(lerp(W / 2, pos.x, t), lerp(H / 2, pos.y, t)); }
      drawText(r, tox, str, pos.x, pos.y, 64, [1, 0, 0, 1], 0.5, 0.5);
    }
    if (s.notice) {
      const a = clamp(Math.min(s.notice.time * 4, 4 - s.notice.time));
      drawText(r, tox, this.t('disk-unlocked', 'IMPROBABILITY DISK UNLOCKED'), W / 2, H / 2 - 60, 48, [1, 1, 1, a], 0.5);
      drawText(r, tox, s.notice.text, W / 2, H / 2, 36, [1, 0.2, 0.2, a], 0.5);
    }
    if (this.mode === 'experiment' && !s.editing && alive) drawText(r, this.font('inter'), this.t('experiment-press-to-toggle', 'Press [{0}] to toggle EDIT mode').replace(/<[^>]+>/g, '').replace('{0}', 'Tab'), 20, H - 40, 22, [1, 1, 1, 0.6]);
    if (p && p.spawnMenu && alive) this.spawnMenu(s);
  }

  /** SpawnMenuAbilityComponent ("Conjuring"): click a weapon or a character to conjure it at the crosshair */
  private spawnMenu(s: Scene): void {
    const p = s.player!;
    const menu = p.spawnMenu!;
    rectFill(this.r, W - 420, 100, 400, 820, [0, 0, 0, 0.7]);
    const keys = [...this.reg.weapons.keys()].sort();
    keys.slice(0, 18).forEach((k, i) => { if (this.button(this.reg.weapons.get(k)!.data.name, W - 400, 120 + i * 32, 24)) menu.conjureWeapon(s, p, k); });
    const presets = [...this.texts.keys()].filter((k) => k.startsWith('data/character_presets/')).slice(0, 6);
    presets.forEach((k, i) => {
      const kv = readKeyValues(this.texts.get(k)!, new Set());
      if (this.button(String(kv.get('name')), W - 400, 720 + i * 32, 24)) menu.conjureAlly(s, p, String(kv.get('stats')), String(kv.get('look')));
    });
  }

  // ---------- experiment mode ----------
  private experimentPanel(s: Scene): void {
    const r = this.r;
    rectFill(r, 0, 0, 520, H, [0, 0, 0, 0.75]);
    const tabs: ['Characters' | 'Weapons' | 'Music' | 'Rules', string, string][] = [['Characters', 'experiment-tab-characters', 'Characters'], ['Weapons', 'experiment-tab-weapons', 'Weapons'],
      ['Music', 'experiment-tab-music', 'Music'], ['Rules', 'experiment-tab-game-rules', 'Game rules']];
    let tabX = 20;
    for (const [k, key, f] of tabs) {
      const label = this.t(key, f);
      if (this.button(label, tabX, 20, 26, true, 360, this.exp.tab === k)) { this.exp.tab = k; this.exp.scroll = 0; }
      tabX += textWidth(this.font('impact'), label, 26) + 34;
    }
    const list = (items: [string, string][], onPick: (k: string) => void): void => {
      this.exp.scroll = clamp(this.exp.scroll + this.wheel * 3, 0, Math.max(0, items.length - 22));
      items.slice(this.exp.scroll, this.exp.scroll + 22).forEach(([k, name], i) => { if (this.button(name, 30, 80 + i * 40, 26, true, 360, this.exp.pick?.key === k)) onPick(k); });
    };
    switch (this.exp.tab) {
      case 'Characters':
        list([...this.texts.keys()].filter((k) => k.startsWith('data/character_presets/')).map((k) => [k, String(readKeyValues(this.texts.get(k)!, new Set()).get('name'))]),
          (k) => { this.exp.pick = { kind: 'char', key: k }; });
        break;
      case 'Weapons':
        list([...this.reg.weapons.entries()].sort((a, b) => a[1].data.name.localeCompare(b[1].data.name)).map(([k, w]) => [k, w.data.name]), (k) => { this.exp.pick = { kind: 'weapon', key: k }; });
        break;
      case 'Music':
        list([['', '(silence)'], ...[...SOUNDS.keys()].filter((k) => k.startsWith('sounds/music/')).map((k) => [k, k.split('/').pop()!.replace('.ogg', '')] as [string, string])],
          (k) => { this.exp.music = k || null; this.audio.playMusic(this.exp.music); });
        break;
      case 'Rules':
        if (this.button(`${this.t('experiment-autospawn', 'Autospawn')}: ${s.autoSpawn ? 'on' : 'off'}`, 30, 90, 30, true, 360)) s.autoSpawn = !s.autoSpawn;
        this.text(`${this.t('experiment-timescale', 'Timescale')}: ${s.clock.timeScale.toFixed(2)}`, 30, 160, 28);
        for (const [i, v] of [0.1, 0.25, 0.5, 1, 2].entries()) if (this.button(String(v), 30 + i * 90, 210, 28, true, 360)) s.clock.timeScale = v;
        if (this.button(this.t('experiment-cleanup', 'Clean everything'), 30, 290, 30, true, 360)) s.cleanup();
        DISKS.forEach((d, i) => {
          if (!this.disks.isUnlocked(d.id)) return;
          if (this.button(`${this.disks.has(d.id) ? '[x]' : '[ ]'} ${d.name}`, 30, 370 + i * 36, 24, true, 360)) this.disks.toggle(d.id);
        });
        break;
    }
    this.text(this.t('experiment-close-menu', 'Stop editing') + ' [Tab]', 30, H - 50, 24, 0.7);
    this.cursor();
  }
  /** click in the world while editing: place the chosen character preset or weapon */
  private experimentClick(s: Scene, input: PlayerInput): void {
    if (!this.mousePressed.has(0) || this.mouse.x < 520 || !this.exp.pick) return;
    const m = input.worldMouse;
    if (this.exp.pick.kind === 'weapon') { const w = this.reg.weapons.get(this.exp.pick.key); if (w) s.createWeapon(m, w); }
    else {
      const kv = readKeyValues(this.texts.get(this.exp.pick.key)!, new Set());
      const c = s.createEnemy(v2(m.x, floorLevelAt(s.level, m.x)), String(kv.get('stats')), String(kv.get('look')), 'aahw');
      c.positioning.globalTarget = v2(m.x, 0);
    }
    this.audio.play('sounds/ui/confirm.wav');
  }

  /** LevelBorderSystem: black outside the level bounds */
  private levelBorder(s: Scene): void {
    const b = s.level.levelBounds;
    const cam = s.camera;
    const hw = W / 2 * cam.ortho, hh = H / 2 * cam.ortho;
    const x0 = cam.position.x - hw, x1 = cam.position.x + hw, y0 = cam.position.y - hh - 2000, y1 = cam.position.y + hh + 2000;
    const black: [number, number, number, number] = [0, 0, 0, 1];
    if (x0 < b.minX) rectFill(this.r, x0 - 10, y0, b.minX - x0 + 10, y1 - y0, black, 301, 1000);
    if (x1 > b.maxX) rectFill(this.r, b.maxX, y0, x1 - b.maxX + 10, y1 - y0, black, 301, 1000);
    if (y1 > b.maxY) rectFill(this.r, x0 - 10, b.maxY, x1 - x0 + 20, y1 - b.maxY, black, 301, 1000);
    if (y0 < b.minY) rectFill(this.r, x0 - 10, y0, x1 - x0 + 20, b.minY - y0, black, 301, 1000);
  }

  private transitionOverlay(dt: number): void {
    const tr = this.transition;
    if (tr.time >= 0.3 || !tr.entry) return;
    tr.time += dt;
    rectFill(this.r, clamp(tr.time / 0.3) * W, 0, W, H, [0, 0, 0, 1], 400, 0);
  }

  /** PauseSystem's menu */
  private pauseMenu(): void {
    rectFill(this.r, 0, 0, W, H, [0, 0, 0, 0.6], 360, 0);
    drawText(this.r, this.font('impact'), this.t('pause-menu-paused', 'Paused'), 90, 300, 80, [1, 1, 1, 1], 0, 0, 370);
    let y = 440;
    const b = (t: string): boolean => { const r = this.button(t, 90, y, 48, true, 370); y += 70; return r; };
    if (b(this.t('pause-menu-resume', 'Resume'))) this.paused = false;
    if (this.mode !== 'experiment' && b(this.t('pause-menu-retry', 'Retry level'))) { void this.startLevel(this.currentLevelIndex); return; }
    if (b(this.t('experiment-main-menu', 'Main menu'))) this.toMenu();
    this.cursor();
  }

  /** PlayerUISystem.Render + PlayerDeathSequenceSystem.Render */
  private hud(s: Scene, dt: number): void {
    const r = this.r;
    const p = s.player;
    const time = s.clock.time;
    if (s.deathSequence) { this.deathScreen(s); return; }
    if (!p || !p.isAlive || this.paused) return;
    this.ammoFlash += dt;
    this.bodyFlash += dt;
    const dp = clamp(p.dodgeMeter / p.stats.dodgeAbility);
    this.dodgeSmooth = smoothApproach(this.dodgeSmooth, dp, 10, dt);
    if (p.stats.dodgeAbility > 0.01 && this.dodgeSmooth < 1) image(r, 'textures/red_vignette.png', 0, 0, W, H, [1, 1, 1, 1 - this.dodgeSmooth]);
    // DrawHealthIndicator
    const head = p.positioning.head, body = p.positioning.body;
    const ratio = Math.min(head.health, body.health) / Math.min(head.maxHealth, body.maxHealth);
    if (ratio < 1) {
      const tex = ratio > 0.7 ? 1 : ratio > 0.3 ? 2 : ratio > 0.1 ? 3 : 4;
      const bc = hexColor(p.look.bloodColour);
      const a = (1 - ratio * ratio - Math.abs(Math.sin(time * (1 - ratio) * 4)) * 0.25) * 0.8;
      image(r, `textures/low_health_vignette/${tex}.qoi`, 0, 0, W, H, [bc[0], bc[1], bc[2], clamp(a)]);
    }
    const tox = this.font('toxigenesis');
    const padding = 25;
    let cursorY = 0;
    let normalizedAmmo = 1;
    let firearmEmpty = false;
    let crosshairSize = 20;
    let crosshair = this.mouse;
    const w = p.hasWeaponEquipped ? p.equipped! : null;
    if (w) {
      const tex = this.r.textures.get(w.instr.baseTexture);
      if (tex) {
        const melee = w.data.weaponType === 'Melee';
        let aspect = tex.h / tex.w;
        if (melee) aspect = 1 / aspect;
        let ww = melee ? 60 : 60 / aspect, hh = melee ? 60 / aspect : 60;
        if ((melee ? hh : ww) > 370) { if (melee) { hh = 370; ww = 370 * aspect; } else { ww = 370; hh = 370 * aspect; } }
        const recoil = 1 - clamp(this.ammoFlash * 4);
        const jx = (noiseValue(time * 2, 452.123, 0) - 0.5) * 15 * recoil;
        if (melee) {
          // rotated a quarter turn
          const cx = padding + jx, cy = padding;
          r.quad(w.instr.baseTexture, [cx, cy + ww, cx, cy, cx + hh, cy, cx + hh, cy + ww], [0, 0, 1, 0, 1, 1, 0, 1], [1, 1, 1, 1], 0, 350, 0);
        } else image(r, w.instr.baseTexture, padding + jx, padding, ww, hh);
      }
      cursorY += 60 + padding * 2;
      drawText(r, tox, w.data.name, padding, cursorY, 55 * 0.6, [1, 1, 1, 1]);
      cursorY += 40;
      if (w.data.weaponType === 'Firearm') {
        if (this.lastAmmo !== w.remainingRounds) { this.ammoFlash = 0; this.lastAmmo = w.remainingRounds; }
        normalizedAmmo = w.remainingRounds / w.data.roundsPerMagazine;
        if (w.infiniteAmmo) drawText(r, tox, this.t('infinite-ammo', 'Inf. ammo'), padding, cursorY, 24, [1, 1, 1, 1]);
        else if (!hasRoundsLeft(w)) {
          drawText(r, tox, this.t('empty', 'Empty'), padding, cursorY, 24, Math.sin(time * 24) > 0 ? [1, 0, 0, 1] : [1, 1, 1, 1]);
          firearmEmpty = true;
        } else {
          const c = lerp(0, 1, clamp(this.ammoFlash * 8));
          this.counter(tox, padding, cursorY, w.remainingRounds, w.data.roundsPerMagazine, 24, [1, c, c, 1], 0);
        }
        const barrel = getBarrel(w);
        const cam = s.camera;
        const toScreen = (q: Vec2): Vec2 => v2((q.x - cam.position.x) / cam.ortho + W / 2, -(q.y - cam.position.y - cam.shakeOffset) / cam.ortho + H / 2);
        const wm = this.worldMouse(s);
        const dist = Math.hypot(barrel.position.x - wm.x, barrel.position.y - wm.y);
        const spread = (1 - w.data.accuracy) * dist;
        crosshairSize = Math.max(spread / cam.ortho * 0.5, 20);
        crosshair = toScreen(v2(wm.x + p.positioning.recoilPositionOffset.x * 0.5, wm.y + p.positioning.recoilPositionOffset.y * 0.5));
      }
    }
    // body count (ProgressionType.BodyCount)
    if (s.level.progressionType === 'BodyCount') {
      const prog = s.progress.bodyCount;
      if (this.lastBody !== prog.current) { this.bodyFlash = 0; this.lastBody = prog.current; }
      const col: [number, number, number, number] = prog.current === prog.target
        ? [1, 1, 1, lerp(1, 0.5, mapRange(-1, 1, 0, 0.5, Math.sin(time * 12)))]
        : [1, lerp(0, 1, Easings.cubicOut(clamp(this.bodyFlash * 2))), lerp(0, 1, Easings.cubicOut(clamp(this.bodyFlash * 2))), 1];
      this.counter(tox, W - padding, padding, prog.current, prog.target, 48, col, 1);
      image(r, 'textures/ui/kills_icon.png', W - 235, 46 - 30, 60, 60);
    }
    // crosshair
    this.lowAmmoFade = lerp(this.lowAmmoFade, normalizedAmmo < 0.3 ? 1 : 0, dt * 5);
    const cs = crosshairSize * 2 + 24;
    image(r, 'textures/ui/crosshair_glow.png', this.mouse.x - cs / 2, this.mouse.y - cs / 2, cs, cs, [1, 1, 1, this.lowAmmoFade]);
    const col: [number, number, number, number] = firearmEmpty ? (Math.sin(time * 24) > 0 ? [1, 0, 0, 1] : [1, 1, 1, 1])
      : normalizedAmmo < 0.5 ? [1, lerp(normalizedAmmo, 1, clamp(this.ammoFlash * 3)), lerp(normalizedAmmo, 1, clamp(this.ammoFlash * 3)), 1] : [1, 1, 1, 1];
    circle(r, crosshair, 5, 0, [col[0], col[1], col[2], 1 - Math.hypot(crosshair.x - this.mouse.x, crosshair.y - this.mouse.y) * 0.00142]);
    circle(r, this.mouse, crosshairSize, 5, [col[0], col[1], col[2], Math.max(1 - (crosshairSize - 20) * 0.0085, 0.2)]);
    if (s.flash) rectFill(r, 0, 0, W, H, s.flash.color, 390, 0);
  }

  /** PlayerUISystem.DrawCounter */
  private counter(f: Font, x: number, y: number, c: number, max: number, size: number, color: [number, number, number, number], align: 0 | 1): void {
    const s = String(c).padStart(2, '0');
    const s2 = `/ ${String(max).padStart(2, '0')}`;
    if (align === 1) {
      drawText(this.r, f, s2, x, y, size * 0.7, color, 1);
      drawText(this.r, f, s, x - textWidth(f, s2, size * 0.7) - 10, y, size, color, 1);
    } else {
      drawText(this.r, f, s, x, y, size, color);
      drawText(this.r, f, s2, x + s.length * textWidth(f, '5', size) + 5, y, size * 0.7, color);
    }
  }

  /** PlayerDeathSequenceSystem.Render */
  private deathScreen(s: Scene): void {
    const r = this.r;
    const t = s.deathSequence!.time;
    if (t < 1 / 3) rectFill(r, 0, 0, W, H, [1, 0, 0, 1 - clamp(t * 3)]);
    const delayed = t - 1;
    const cd = clamp(delayed);
    const beat = mapRange(0, 1, 0.5, 1, heartbeat((s.clock.time * 0.5) % 1));
    const barY = H - 256;
    if (delayed > 0) {
      const flickerDone = cd > 0.25;
      const flicker = flickerDone || delayed % 0.1 > 0.05;
      if (flicker) { rectFill(r, 0, barY - 44, W, 88, [1, 0, 0, 1]); rectFill(r, 0, barY - 40, W, 80, [0, 0, 0, 1], 350, 1); }
      if (flickerDone) {
        const tt = Easings.quadOut((s.clock.time * 0.5) % 1);
        const off = mapRange(0, 1, 40, 60, tt);
        rectFill(r, 0, barY - off - 2, W, 4, [1, 0, 0, beat * (1 - tt)], 350, 2);
        rectFill(r, 0, barY + off - 2, W, 4, [1, 0, 0, beat * (1 - tt)], 350, 2);
        const k = clamp(delayed * 4 - 1);
        const text = `[R] ${this.t('retry', 'Retry').toUpperCase()}`;
        drawText(r, this.font('toxigenesis'), text, W / 2, barY - 16, 32, [1, 1 - k, 1 - k, 1], 0.5, 0, 350, 3);
      }
      for (const x of [-350, -370, 350, 370]) rectFill(r, W / 2 + x, barY - 40, 4, 80, [1, 0, 0, beat], 350, 4);
      rectFill(r, 0, 0, W, H, [15 / 255, 0, 0, clamp(delayed / 5, 0, 0.9)], 340, 0);
    }
    const e = 1 - (1 - cd) ** 3;
    rectFill(r, 0, 0, W, 130 * e, [1, 0, 0, 1], 350, 5);
    rectFill(r, 0, H - 130 * e, W, 130 * e, [1, 0, 0, 1], 350, 5);
    rectFill(r, 0, 0, 32 * e, H, [1, 0, 0, 1], 350, 5);
    rectFill(r, W - 32 * e, 0, 32 * e, H, [1, 0, 0, 1], 350, 5);
  }
}

function circleOutline(r: Renderer, c: Vec2, radius: number, width: number, color: [number, number, number, number]): void { circle(r, c, radius, width, color); }

function heartbeat(x: number): number {
  if (x < 0 || x > 1) return 0;
  if (x < 0.5) return Math.max(Math.exp(-200 * (x - 0.15) ** 2), Math.exp(-100 * (x - 0.35) ** 2));
  return 0;
}

function circle(r: Renderer, c: Vec2, radius: number, outline: number, color: [number, number, number, number]): void {
  const n = 32;
  for (let i = 0; i < n; i++) {
    const a0 = i / n * Math.PI * 2, a1 = (i + 1) / n * Math.PI * 2;
    if (outline <= 0) r.quad(null, [c.x, c.y, c.x + Math.cos(a0) * radius, c.y + Math.sin(a0) * radius, c.x + Math.cos(a1) * radius, c.y + Math.sin(a1) * radius, c.x, c.y], [0, 0, 1, 0, 1, 1, 0, 1], color, 6, 380, 0);
    else line(r, v2(c.x + Math.cos(a0) * radius, c.y + Math.sin(a0) * radius), v2(c.x + Math.cos(a1) * radius, c.y + Math.sin(a1) * radius), outline, color, 380, 0);
  }
}

function wrap(text: string, n: number): string[] {
  const out: string[] = [];
  let cur = '';
  for (const w of text.split(/\s+/)) {
    if ((cur + ' ' + w).trim().length > n) { out.push(cur.trim()); cur = w; } else cur += ' ' + w;
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/** a soft round wound for body parts */
function woundTexture(): Uint8Array {
  const d = new Uint8Array(64 * 64 * 4);
  for (let y = 0; y < 64; y++) for (let x = 0; x < 64; x++) {
    const r = Math.hypot(x - 31.5, y - 31.5) / 32;
    const i = (y * 64 + x) * 4;
    d[i] = 255; d[i + 1] = 255; d[i + 2] = 255;
    d[i + 3] = r < 0.8 ? 255 : r < 1 ? Math.round((1 - r) / 0.2 * 255) : 0;
  }
  return d;
}
