// X-Moto 0.6.3 on the website: the menus (levels by pack, replays, options, help), playing a level
// (states/StatePlaying*, StateDeadJust/StateDeadMenu, StateFinished, StatePause), replays, sounds and the
// player's files in the server storage. The simulation is scene.ts, the drawing render.ts.
import type { GameContext } from '../../../src/sdk/index.ts';
import { gunzipSync } from 'fflate';
import { parseLevel, type Level } from './level.ts';
import { Scene } from './scene.ts';
import { Theme } from './theme.ts';
import { Renderer, Camera, formatTime } from './render.ts';
import { PHYS, PHYS_STEP_SIZE } from './bike.ts';
import { ReplayRecorder, parseReplay, decodeState, interpolate, encodeState, type ReplayFile } from './replay.ts';
import themeXml from '../assets/Themes/original.xml?raw';
import levelsUrl from '../assets/levels.json.gz?url';
import fontUrl from '../assets/Textures/Fonts/DejaVuSans.ttf?url';

const ASSETS = import.meta.glob('../assets/Textures/**/*.{png,jpg,ogg,wav}', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const assetUrl = (path: string): string | undefined => ASSETS[`../assets/${path}`];

const PACK_ORDER = ['Tutorials', 'Classical', 'New Age', "Cup o' Joe", 'Strikes back', 'Oracle Cup', 'Control Cup', 'Challenge Cup', "aeRo's Training", 'Built-in Scripted Levels'];
const MAX_REPLAYS = 40;
const PROFILE_FILE = 'profile.txt';

interface Options { audio: boolean; engine: boolean; music: boolean; minimap: boolean; player: string }
interface BestTime { time: number; date: string }

type Mode = 'menu' | 'play' | 'replay';

export class XMotoApp {
  private host: HTMLElement;
  private ctx: GameContext;
  private canvas = document.createElement('canvas');
  private g: CanvasRenderingContext2D;
  private overlay = document.createElement('div');
  private theme = new Theme(themeXml);
  private images = new Map<string, HTMLImageElement | null>();
  private loading = new Map<string, Promise<void>>();
  private sounds = new Map<string, AudioBuffer | null>();
  private levelFiles: Record<string, string> = {};
  private levels: Level[] = [];
  private scripts: Record<string, string> = {};
  private renderer: Renderer;
  private camera = new Camera();
  private scene: Scene | null = null;
  private mode: Mode = 'menu';
  private level: Level | null = null;
  private keys = new Set<string>();
  private changeDirDown = false;
  private physTime = 0;
  private stepCount = 0;
  private paused = false;
  private recorder: ReplayRecorder | null = null;
  private recorderDone = false;
  private replay: { file: ReplayFile; states: ReturnType<typeof decodeState>[]; events: boolean[]; name: string } | null = null;
  private lastBang = 0;
  private deadSince = -1;
  private deadStill = -1;
  private fileById = new Map<string, string>();
  private options: Options = { audio: true, engine: true, music: true, minimap: true, player: 'Player' };
  private best = new Map<string, BestTime>();
  private music: { src: AudioBufferSourceNode; name: string } | null = null;
  private gain: GainNode;
  private menuStack: (() => void)[] = [];
  private nowSec = 0;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    host.style.position = 'relative';
    host.style.background = '#000';
    host.style.overflow = 'hidden';
    this.canvas.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;display:block';
    this.overlay.style.cssText = 'position:absolute;inset:0;display:flex;align-items:center;justify-content:center;font-family:XMotoDejaVu,DejaVu Sans,sans-serif;color:#fff';
    host.append(this.canvas, this.overlay);
    this.g = this.canvas.getContext('2d')!;
    this.renderer = new Renderer(this.g, this.theme, (p) => this.image(p));
    this.gain = ctx.audio.createGain();
    this.gain.connect(ctx.audio.destination);
  }

  async start(): Promise<void> {
    this.status('Loading X-Moto...');
    try {
      const face = new FontFace('XMotoDejaVu', `url(${fontUrl})`);
      await face.load();
      (document.fonts as unknown as { add(f: FontFace): void }).add(face);
    } catch { /* the fallback font */ }
    const gz = new Uint8Array(await (await fetch(levelsUrl, { signal: this.ctx.signal })).arrayBuffer());
    this.levelFiles = JSON.parse(new TextDecoder().decode(gunzipSync(gz)));
    for (const [n, t] of Object.entries(this.levelFiles)) {
      if (n.endsWith('.lvs')) this.scripts[n] = t;
      else {
        try { const l = parseLevel(t); this.levels.push(l); this.fileById.set(l.id, n); } catch { /* a level the original could not load either */ }
      }
    }
    this.levels.sort((a, b) => packIndex(a.pack) - packIndex(b.pack) || a.pack.localeCompare(b.pack) || a.packNum.localeCompare(b.packNum) || a.name.localeCompare(b.name));
    await this.loadProfile();
    await Promise.all(['Textures/UI/TitleTL.jpg', 'Textures/UI/TitleTR.jpg', 'Textures/UI/TitleBL.jpg', 'Textures/UI/TitleBR.jpg'].map((p) => this.loadImage(p)));
    const resize = (): void => {
      const r = this.host.getBoundingClientRect();
      const dpr = window.devicePixelRatio || 1;
      this.canvas.width = Math.max(1, Math.round(r.width * dpr));
      this.canvas.height = Math.max(1, Math.round(r.height * dpr));
    };
    const ro = new ResizeObserver(resize);
    ro.observe(this.host);
    this.ctx.signal.addEventListener('abort', () => ro.disconnect());
    resize();
    window.addEventListener('keydown', (e) => this.onKey(e, true), { signal: this.ctx.signal });
    window.addEventListener('keyup', (e) => this.onKey(e, false), { signal: this.ctx.signal });
    this.ctx.frame((t) => this.frame(t));
    this.mainMenu();
  }

  stop(): void {
    try { this.music?.src.stop(); } catch { /* already stopped */ }
  }

  // assets ---------------------------------------------------------------------------------
  private image(path: string): HTMLImageElement | null {
    const im = this.images.get(path);
    if (im === undefined) void this.loadImage(path);
    return im ?? null;
  }
  private loadImage(path: string): Promise<void> {
    let p = this.loading.get(path);
    if (p) return p;
    const url = assetUrl(path);
    if (!url) { this.images.set(path, null); return Promise.resolve(); }
    p = new Promise<void>((resolve) => {
      const im = new Image();
      im.onload = () => { this.images.set(path, im); resolve(); };
      im.onerror = () => { this.images.set(path, null); resolve(); };
      im.src = url;
    });
    this.loading.set(path, p);
    return p;
  }
  private async loadSound(path: string): Promise<AudioBuffer | null> {
    if (this.sounds.has(path)) return this.sounds.get(path)!;
    const url = assetUrl(path);
    let buf: AudioBuffer | null = null;
    if (url) {
      try { buf = await this.ctx.audio.decodeAudioData(await (await fetch(url, { signal: this.ctx.signal })).arrayBuffer()); } catch { buf = null; }
    }
    this.sounds.set(path, buf);
    return buf;
  }
  private play(name: string, volume = 1.0): void {
    if (!this.options.audio) return;
    const path = this.theme.sounds.get(name);
    if (!path) return;
    void this.loadSound(path).then((b) => {
      if (!b || this.ctx.signal.aborted) return;
      const s = this.ctx.audio.createBufferSource();
      s.buffer = b;
      const g = this.ctx.audio.createGain();
      g.gain.value = Math.max(0, Math.min(1, volume));
      s.connect(g).connect(this.gain);
      s.start();
    });
  }
  /** GameApp::playGameMusic / playMenuMusic */
  private playMusic(name: string): void {
    if (this.music?.name === name) return;
    try { this.music?.src.stop(); } catch { /* not started */ }
    this.music = null;
    if (!name || !this.options.audio || !this.options.music) return;
    const path = this.theme.musics.get(name);
    if (!path) return;
    void this.loadSound(path).then((b) => {
      if (!b || this.ctx.signal.aborted || (this.music && this.music.name !== name)) return;
      const s = this.ctx.audio.createBufferSource();
      s.buffer = b;
      s.loop = true;
      const g = this.ctx.audio.createGain();
      g.gain.value = 0.5;
      s.connect(g).connect(this.gain);
      s.start();
      this.music = { src: s, name };
    });
    this.music = { src: this.ctx.audio.createBufferSource(), name };
  }

  // storage ----------------------------------------------------------------------------------
  private async loadProfile(): Promise<void> {
    try {
      const b = await this.ctx.storage.get(PROFILE_FILE);
      if (!b) return;
      for (const line of new TextDecoder().decode(b).split('\n')) {
        const w = line.split('\t');
        if (w[0] === 'time' && w.length >= 4) this.best.set(w[1], { time: +w[2], date: w[3] });
        else if (w[0] === 'opt' && w.length >= 3) {
          const k = w[1] as keyof Options;
          if (k === 'player') this.options.player = w[2];
          else if (k in this.options) (this.options as unknown as Record<string, boolean>)[k] = w[2] === '1';
        }
      }
    } catch { /* offline: nothing kept */ }
  }
  private async saveProfile(): Promise<void> {
    const lines = ['# X-Moto port profile: best times (hundredths) and options'];
    for (const [id, b] of this.best) lines.push(`time\t${id}\t${b.time}\t${b.date}`);
    for (const [k, v] of Object.entries(this.options)) lines.push(`opt\t${k}\t${typeof v === 'boolean' ? (v ? 1 : 0) : v}`);
    try { await this.ctx.storage.put(PROFILE_FILE, new TextEncoder().encode(`${lines.join('\n')}\n`)); } catch { /* offline */ }
  }
  private async listReplays(): Promise<{ name: string; size: number; modified: number }[]> {
    try {
      const l = await this.ctx.storage.list('');
      return l.filter((x) => x.name.endsWith('.rpl')).map((x) => ({ name: x.name, size: x.size, modified: Number(x.modified) }));
    } catch { return []; }
  }
  private async saveReplay(rec: ReplayRecorder, name: string): Promise<string> {
    const safe = `${name.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 59)}.rpl`;
    const list = await this.listReplays();
    if (!list.some((r) => r.name === safe) && list.length >= MAX_REPLAYS) {
      list.sort((a, b) => a.modified - b.modified);
      await this.ctx.storage.delete(list[0].name);
    }
    await this.ctx.storage.put(safe, rec.toFile());
    return safe;
  }

  // input --------------------------------------------------------------------------------------
  private onKey(e: KeyboardEvent, down: boolean): void {
    if (this.overlay.contains(document.activeElement) && (document.activeElement as HTMLElement).tagName === 'INPUT') return;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', ' ', 'PageUp', 'PageDown', 'Backspace'].includes(e.key)) e.preventDefault();
    if (down) this.keys.add(e.key); else this.keys.delete(e.key);
    if (this.mode === 'play' && this.scene && !this.paused) this.handleControllers(e.key, down);
    if (!down || e.repeat) return;
    if (this.mode === 'play' && this.scene) {
      const p = this.scene.player;
      if (e.key === 'Escape') { e.preventDefault(); if (p.isDead()) this.deadMenu(); else if (!p.isFinished()) this.pauseMenu(); return; }
      if (e.key === 'Enter' && !this.paused) { this.startLevel(this.level!); return; }
      if (e.key === 'Backspace' && this.scene.checkpoint) { this.toCheckpoint(); return; }
      if (e.key === 'PageUp' && !this.paused) { this.nextLevel(1); return; }
      if (e.key === 'PageDown' && !this.paused) { this.nextLevel(-1); return; }
      for (const h of this.scene.keyHooks) if (keyName(e) === h.key.toLowerCase()) this.scene.lua?.callVoid(h.fn);
    } else if (this.mode === 'replay') {
      if (e.key === 'Escape' || e.key === 'Enter') { this.stopReplay(); return; }
    } else if (e.key === 'Escape' && this.menuStack.length > 1) {
      this.menuStack.pop();
      this.menuStack[this.menuStack.length - 1]();
    }
  }
  /** StatePlaying::handleControllers: the bike's controls follow the key presses and releases */
  private handleControllers(key: string, down: boolean): void {
    const p = this.scene!.player, c = p.ctrl;
    if (p.isDead() || p.isFinished()) return;
    if (down) {
      if (key === 'ArrowUp') c.setThrottle(1.0);
      if (key === 'ArrowDown') c.setBreak(1.0);
      if (key === 'ArrowLeft') c.setPull(1.0);
      if (key === 'ArrowRight') c.setPull(-1.0);
      if (key === ' ' && !this.changeDirDown) { c.setChangeDir(true); this.changeDirDown = true; }
    } else {
      if (key === 'ArrowUp') c.setThrottle(0.0);
      if (key === 'ArrowDown') c.setBreak(0.0);
      if (key === 'ArrowLeft' || key === 'ArrowRight') c.setPull(0.0);
      if (key === ' ') this.changeDirDown = false;
    }
  }

  // the main loop ---------------------------------------------------------------------------------
  private frame(tms: number): void {
    const now = tms / 1000;
    this.nowSec = now;
    const w = this.canvas.width, h = this.canvas.height;
    if ((this.mode === 'play' || this.mode === 'replay') && this.scene) {
      const sc = this.scene;
      if (this.physTime === 0) this.physTime = now;
      let steps = 0;
      if (!this.paused) {
        while (this.physTime + PHYS_STEP_SIZE / 100.0 <= now && steps < 10) {
          this.step();
          this.physTime += PHYS_STEP_SIZE / 100.0;
          steps++;
        }
        if (this.physTime + PHYS_STEP_SIZE / 100.0 < now) this.physTime = now;
        this.camera.setScroll(true, sc.player, sc.gravity);
      } else this.physTime = now;
      this.renderer.render(sc, this.camera, w, h, now, {
        bestTime: this.bestText(), worldRecord: '', showTimePanel: true, showMinimap: this.options.minimap && this.mode === 'play',
        levelInfo: this.mode === 'replay' ? `${this.replay?.file.player ?? ''} - ${this.level?.name ?? ''}` : (sc.player.isDead() || this.paused ? this.level?.name ?? '' : ''),
      });
      if (this.mode === 'play' && sc.player.isDead() && this.deadSince >= 0 && !this.overlay.hasChildNodes()) {
        // StateDeadJust: once the torso is still (VELOCITY_UNTIL_TORSO_RIP), 2 s (STATE_DEAD_MAX_TIME), then the menu
        if (this.deadStill < 0 && sc.player.getTorsoVelocity() < 0.05) this.deadStill = now;
        if (this.deadStill >= 0 && now - this.deadStill > 2.0) this.deadMenu();
      }
    } else {
      this.drawTitle(w, h);
    }
  }

  private step(): void {
    const sc = this.scene!;
    const p = sc.player;
    sc.updateLevel(PHYS_STEP_SIZE);
    this.stepCount++;
    // engine sound (EngineSoundSimulator): a random bang every 60*120/rpm hundredths
    if (this.mode === 'play' && this.options.audio && this.options.engine && !p.isDead() && !p.isFinished()) {
      const rpm = p.state.fBikeEngineRPM;
      if (sc.time < this.lastBang) this.lastBang = sc.time;
      if (rpm > 100) {
        const interval = Math.trunc((60.0 * 120.0) / rpm);
        if (sc.time - this.lastBang > interval) {
          this.play(`Engine${String(Math.min(12, Math.floor(Math.random() * 13))).padStart(2, '0')}`, 0.6);
          this.lastBang = sc.time;
        }
      }
    }
  }

  private drawTitle(w: number, h: number): void {
    const g = this.g;
    g.setTransform(1, 0, 0, 1, 0, 0);
    g.fillStyle = '#000';
    g.fillRect(0, 0, w, h);
    const tl = this.images.get('Textures/UI/TitleTL.jpg'), tr = this.images.get('Textures/UI/TitleTR.jpg');
    const bl = this.images.get('Textures/UI/TitleBL.jpg'), br = this.images.get('Textures/UI/TitleBR.jpg');
    if (tl && tr && bl && br) {
      g.drawImage(tl, 0, 0, w / 2, h / 2); g.drawImage(tr, w / 2, 0, w / 2, h / 2);
      g.drawImage(bl, 0, h / 2, w / 2, h / 2); g.drawImage(br, w / 2, h / 2, w / 2, h / 2);
    }
  }

  // playing ------------------------------------------------------------------------------------------
  private bestText(): string {
    const id = this.level?.id;
    const b = id ? this.best.get(id) : undefined;
    return b ? `${formatTime(b.time)} (${this.options.player})` : '--:--:--';
  }

  private async startLevel(level: Level, replay?: ReplayFile, replayName = ''): Promise<void> {
    this.closeMenu();
    this.paused = false;
    this.level = level;
    this.status(`${level.name}...`);
    const fresh = parseLevel(this.levelFiles[this.fileById.get(level.id) ?? ''] ?? '');
    let scene: Scene;
    try {
      scene = new Scene(fresh, {
        onPlayerDies: () => {
          this.camera.setPlayerDead(scene.player, this.nowSec);
          this.deadSince = this.nowSec;
          this.play('Headcrash', Math.min(1, scene.player.getBikeLinearVel() / 80.0 + 0.2));
          if (this.mode === 'play') {
            // StateDeadJust::enter
            scene.clearGameMessages();
            let msg = scene.checkpoint ? 'Press BACKSPACE to return to Checkpoint' : '';
            msg += '\nPress ENTER to try again';
            msg += '\nPress ESC to display the menu';
            scene.gameMessage(msg, true, 260, 'gameTime');
          }
        },
        onPlayerWins: () => { if (this.mode === 'play') void this.finished(); },
        onStrawberry: () => this.play(fresh.soundReplacements.PickUpStrawberry || 'PickUpStrawberry'),
        onCheckpoint: () => this.play(fresh.soundReplacements.Checkpoint || 'Checkpoint'),
        playSound: (n, v) => this.play(n, v),
        playMusic: (n) => this.playMusic(n),
        camera: (c) => this.camera.command(c, scene.gravity),
      }, this.scripts, !replay);
      scene.addPlayer();
      await Promise.all(Renderer.files(scene, this.theme).map((p) => this.loadImage(p)));
      this.renderer.prepare(scene);
      this.camera = new Camera();
      this.camera.initCamera();
      this.camera.setScroll(false, scene.player, scene.gravity);
      if (replay) {
        const states = replay.states.map((s) => decodeState(s, PHYS));
        this.replay = { file: replay, states, events: replay.events.map(() => false), name: replayName };
        scene.replayPlayer = (t) => this.replayStep(t);
        this.recorder = null;
        this.mode = 'replay';
      } else {
        this.replay = null;
        this.recorder = new ReplayRecorder(fresh.id, this.options.player);
        this.recorderDone = false;
        scene.recorder = this.recorder;
        scene.playInitLevel();
        this.mode = 'play';
      }
    } catch (e) {
      this.message(`Level ${level.name} cannot be loaded:\n${(e as Error).message}`, () => this.levelsMenu(level.pack));
      return;
    }
    this.scene = scene;
    this.deadSince = -1;
    this.deadStill = -1;
    this.physTime = 0;
    this.lastBang = 0;
    this.status('');
    const music = fresh.music === '' ? this.hashMusic(fresh.id) : fresh.music;
    this.playMusic(music);
    if (!replay) scene.gameMessage(fresh.name, true, 300, 'levelInfo');
  }

  private hashMusic(id: string): string {
    const names = [...this.theme.musics.keys()];
    let h = 0;
    for (const c of new TextEncoder().encode(id)) h = (h + (c > 127 ? c - 256 : c)) >>> 0;
    return names[h % names.length] ?? '';
  }

  /** FileGhost::updateToTime: the recorded state of this time, interpolated, and the events up to it */
  private replayStep(t: number): void {
    const r = this.replay!, sc = this.scene!;
    const st = r.states;
    let i = 0;
    while (i + 1 < st.length && st[i + 1].GameTime <= t) i++;
    const A = st[i], B = st[Math.min(i + 1, st.length - 1)];
    let s = A;
    if (B !== A && B.GameTime > A.GameTime && B.GameTime - A.GameTime < 100) {
      const k = (t - A.GameTime) / (B.GameTime - A.GameTime);
      s = interpolate(A, B, Math.max(0, Math.min(1, k)));
    }
    const prevDir = sc.player.state.Dir;
    sc.player.state = s;
    if (prevDir !== s.Dir) sc.player.changeDirPer = 0;
    else if (sc.player.changeDirPer < 1) sc.player.changeDirPer = Math.min(1, sc.player.changeDirPer + 0.03);
    r.file.events.forEach((e, k) => {
      if (!r.events[k] && e.time < t) { r.events[k] = true; sc.applyEvent(e); }
    });
    if (i >= st.length - 1 && t > A.GameTime + 50) {
      if (r.file.finished) sc.player.setFinished(true, r.file.finishTime);
      else if (!sc.player.isDead()) sc.player.setDead(true, A.GameTime);
    }
  }

  private nextLevel(dir: number): void {
    if (!this.level) return;
    const same = this.levels.filter((l) => l.pack === this.level!.pack);
    const i = same.findIndex((l) => l.id === this.level!.id);
    const n = same[i + dir];
    if (n) void this.startLevel(n);
  }

  private toCheckpoint(): void {
    const sc = this.scene!;
    sc.playToCheckpoint();
    this.camera.setPlayerResussite();
    this.deadSince = -1;
    this.deadStill = -1;
    // StateScene::playToCheckpoint: the replay is dropped when a checkpoint is used
    this.recorder = null;
    sc.recorder = null;
    this.closeMenu();
    this.paused = false;
  }

  /** Universe::finalizeReplay, once per ride */
  private finishRecorder(finished: boolean): void {
    const sc = this.scene!;
    if (this.recorder && !this.recorderDone) {
      this.recorder.finish(finished, sc.player.finishTime, encodeState(sc.player.state, sc.time, PHYS));
      this.recorderDone = true;
    }
  }

  /** StateFinished: the time, the best times, saving */
  private async finished(): Promise<void> {
    const sc = this.scene!, lvl = this.level!;
    const t = sc.player.finishTime;
    this.play('EndOfLevel');
    this.finishRecorder(true);
    const prev = this.best.get(lvl.id);
    const record = !prev || t < prev.time;
    if (record) {
      this.best.set(lvl.id, { time: t, date: new Date().toISOString().slice(0, 10) });
      this.play('NewHighscore');
      void this.saveProfile();
      // autosave the highscore's replay (DEFAULT_AUTOSAVEHIGHSCORESREPLAYS)
      if (this.recorder) { try { await this.saveReplay(this.recorder, `${this.options.player}-${lvl.id}`); } catch { /* offline */ } }
    }
    setTimeout(() => this.finishMenu(t, record), 600);
  }

  private stopReplay(): void {
    this.scene = null;
    this.mode = 'menu';
    this.playMusic('menu1');
    void this.replaysMenu();
  }

  // menus ------------------------------------------------------------------------------------------------
  private status(text: string): void {
    this.overlay.replaceChildren();
    if (text) this.overlay.append(panel([el('div', text)]));
  }
  private closeMenu(): void { this.overlay.replaceChildren(); }
  private show(menu: () => void, root = false): void {
    if (root) this.menuStack = [];
    this.menuStack.push(menu);
    menu();
  }
  private back(): void {
    this.play('Button3');
    this.menuStack.pop();
    const m = this.menuStack[this.menuStack.length - 1];
    if (m) m(); else this.mainMenu();
  }
  private message(text: string, ok: () => void): void {
    this.overlay.replaceChildren(panel([...text.split('\n').map((l) => el('div', l)), button('OK', () => ok())]));
  }

  private mainMenu(): void {
    this.mode = 'menu';
    this.scene = null;
    this.playMusic('menu1');
    this.show(() => {
      this.overlay.replaceChildren(panel([
        el('div', 'X-Moto', 'font-size:2.2em;margin-bottom:0.4em'),
        button('Levels', () => { this.play('Button1'); this.show(() => this.packsMenu()); }),
        button('Replays', () => { this.play('Button1'); this.show(() => void this.replaysMenu()); }),
        button('Options', () => { this.play('Button1'); this.show(() => this.optionsMenu()); }),
        button('Help', () => { this.play('Button1'); this.show(() => this.helpMenu()); }),
        button('Quit Game', () => this.ctx.exit()),
      ], 'left'));
    }, true);
  }

  private packsMenu(): void {
    const packs = [...new Set(this.levels.map((l) => l.pack))];
    const rows = packs.map((p) => {
      const ls = this.levels.filter((l) => l.pack === p);
      const done = ls.filter((l) => this.best.has(l.id)).length;
      return button(`${p}  (${done}/${ls.length})`, () => { this.play('Button1'); this.show(() => this.levelsMenu(p)); });
    });
    this.overlay.replaceChildren(panel([el('div', 'Level Packs', 'font-size:1.5em;margin-bottom:0.4em'), scroller(rows), button('Close', () => this.back())]));
  }

  private levelsMenu(pack: string): void {
    const ls = this.levels.filter((l) => l.pack === pack);
    const rows = ls.map((l) => {
      const b = this.best.get(l.id);
      const r = button(`${l.name}${b ? `    ${formatTime(b.time)}` : ''}`, () => { this.play('Button1'); void this.startLevel(l); });
      r.title = `${l.author ? `${l.author}: ` : ''}${l.description}`;
      return r;
    });
    this.overlay.replaceChildren(panel([el('div', pack, 'font-size:1.5em;margin-bottom:0.4em'), scroller(rows), button('Close', () => this.back())]));
  }

  private async replaysMenu(): Promise<void> {
    this.status('Replays...');
    const list = (await this.listReplays()).sort((a, b) => b.modified - a.modified);
    const rows = list.map((r) => {
      const row = el('div', '', 'display:flex;gap:0.5em;align-items:center');
      row.append(el('span', r.name.replace(/\.rpl$/, ''), 'flex:1;text-align:left'),
        button('Show', () => void this.viewReplay(r.name)),
        button('Delete', async () => {
          if (!confirm('Do you really want to delete replay?')) return;
          try { await this.ctx.storage.delete(r.name); } catch { /* offline */ }
          void this.replaysMenu();
        }));
      return row;
    });
    if (rows.length === 0) rows.push(el('div', 'No replays yet: finish a level, or save a ride from the level menus.'));
    this.overlay.replaceChildren(panel([el('div', 'Replays', 'font-size:1.5em;margin-bottom:0.4em'), scroller(rows), button('Close', () => this.back())]));
  }

  private async viewReplay(name: string): Promise<void> {
    let file: ReplayFile;
    try {
      const b = await this.ctx.storage.get(name);
      if (!b) throw new Error('not found');
      file = parseReplay(b);
    } catch (e) {
      this.message(`Unable to open the replay: ${(e as Error).message}`, () => void this.replaysMenu());
      return;
    }
    const lvl = this.levels.find((l) => l.id === file.levelId);
    if (!lvl) { this.message(`The level ${file.levelId} of this replay is not installed.`, () => void this.replaysMenu()); return; }
    await this.startLevel(lvl, file, name);
  }

  private optionsMenu(): void {
    const toggle = (label: string, key: 'audio' | 'engine' | 'music' | 'minimap'): HTMLElement => {
      const l = el('label', '', 'display:block;text-align:left;margin:0.3em 0');
      const c = document.createElement('input');
      c.type = 'checkbox';
      c.checked = this.options[key];
      c.onchange = () => {
        this.options[key] = c.checked;
        if (key === 'audio' || key === 'music') { const m = this.music?.name ?? 'menu1'; this.music = null; this.playMusic(this.options.music && this.options.audio ? m : ''); }
        void this.saveProfile();
      };
      l.append(c, document.createTextNode(` ${label}`));
      return l;
    };
    const name = document.createElement('input');
    name.value = this.options.player;
    name.maxLength = 20;
    name.onchange = () => { this.options.player = name.value.trim() || 'Player'; void this.saveProfile(); };
    const nameRow = el('label', 'Player: ', 'display:block;text-align:left;margin:0.3em 0');
    nameRow.append(name);
    this.overlay.replaceChildren(panel([
      el('div', 'Options', 'font-size:1.5em;margin-bottom:0.4em'),
      nameRow,
      toggle('Enable Audio', 'audio'), toggle('Enable Engine Sound', 'engine'), toggle('Enable game music', 'music'), toggle('Show Mini Map', 'minimap'),
      button('Close', () => this.back()),
    ]));
  }

  private helpMenu(): void {
    const text = ['You control your bike using the keyboard:', '  Up - Accelerates', '  Down - Brakes', '  Left - Rotates it counter-clockwise',
      '  Right - Rotates it clockwise', '  Space - Turns around and drives in the other direction', '  Escape - Pause', '  Return - Restart the level',
      '  PageUp/PageDown - Next/Previous level', '  Backspace - Restart to the last checkpoint', '',
      'Find all the strawberries and touch the flower to finish', 'the level.'];
    this.overlay.replaceChildren(panel([el('div', 'Help', 'font-size:1.5em;margin-bottom:0.4em'), ...text.map((t) => el('div', t, 'text-align:left;white-space:pre')), button('Close', () => this.back())]));
  }

  private pauseMenu(): void {
    this.paused = true;
    this.scene?.player.ctrl.stopControls();
    this.changeDirDown = false;
    this.overlay.replaceChildren(panel([
      el('div', 'Pause', 'font-size:1.5em;margin-bottom:0.4em'),
      button('Resume Playing', () => { this.paused = false; this.closeMenu(); }),
      button('Restart This Level', () => void this.startLevel(this.level!)),
      ...(this.scene?.checkpoint ? [button('Restart to the last checkpoint', () => this.toCheckpoint())] : []),
      button('Play Next Level', () => this.nextLevel(1)),
      button('Quit level', () => this.quitLevel()),
      button('Quit Game', () => this.ctx.exit()),
    ]));
  }

  private deadMenu(): void {
    this.finishRecorder(false);
    const rec = this.recorder;
    this.overlay.replaceChildren(panel([
      el('div', 'Oops!', 'font-size:1.5em;margin-bottom:0.4em'),
      button('Try This Level Again', () => void this.startLevel(this.level!)),
      ...(this.scene?.checkpoint ? [button('Restart to the last checkpoint', () => this.toCheckpoint())] : []),
      ...(rec ? [button('Save Replay', () => this.saveReplayDialog(rec, () => this.deadMenu()))] : []),
      button('Play Next Level', () => this.nextLevel(1)),
      button('Quit level', () => this.quitLevel()),
      button('Quit Game', () => this.ctx.exit()),
    ]));
  }

  private finishMenu(t: number, record: boolean): void {
    const rec = this.recorder;
    const b = this.best.get(this.level!.id);
    this.overlay.replaceChildren(panel([
      el('div', 'Finish', 'font-size:1.5em;margin-bottom:0.2em'),
      el('div', `Finish Time: ${formatTime(t)}`),
      el('div', record ? 'New personal highscore!' : `Best Times: ${b ? formatTime(b.time) : ''}`, 'margin-bottom:0.4em'),
      button('Try This Level Again', () => void this.startLevel(this.level!)),
      button('Play Next Level', () => this.nextLevel(1)),
      ...(rec ? [button('Save Replay', () => this.saveReplayDialog(rec, () => this.finishMenu(t, record)))] : []),
      button('Quit level', () => this.quitLevel()),
      button('Quit Game', () => this.ctx.exit()),
    ]));
  }

  private saveReplayDialog(rec: ReplayRecorder, back: () => void): void {
    const input = document.createElement('input');
    input.value = `${this.options.player}-${this.level!.name}`.replace(/[^A-Za-z0-9._-]/g, '_').slice(0, 59);
    input.maxLength = 59;
    this.overlay.replaceChildren(panel([
      el('div', 'Enter name of replay'), input,
      button('OK', async () => {
        try { const n = await this.saveReplay(rec, input.value || 'replay'); this.message(`Replay saved as ${n.replace(/\.rpl$/, '')}`, back); }
        catch (e) { this.message(`Failed to save replay: ${(e as Error).message}`, back); }
      }),
      button('Cancel', back),
    ]));
    input.focus();
  }

  private quitLevel(): void {
    this.scene = null;
    this.mode = 'menu';
    this.paused = false;
    const pack = this.level?.pack;
    this.mainMenu();
    if (pack) { this.show(() => this.packsMenu()); this.show(() => this.levelsMenu(pack)); }
  }
}

const packIndex = (p: string): number => { const i = PACK_ORDER.indexOf(p); return i < 0 ? PACK_ORDER.length : i; };
function keyName(e: KeyboardEvent): string { return e.key.length === 1 ? e.key.toLowerCase() : e.key.toLowerCase(); }

function el(tag: string, text: string, style = ''): HTMLElement {
  const e = document.createElement(tag);
  e.textContent = text;
  if (style) e.style.cssText = style;
  return e;
}
function button(label: string, onClick: () => void): HTMLButtonElement {
  const b = document.createElement('button');
  b.textContent = label;
  b.style.cssText = 'display:block;width:100%;margin:0.25em 0;padding:0.35em 1em;background:rgba(40,40,60,0.85);color:#fff;border:1px solid rgba(255,255,255,0.45);border-radius:4px;font:inherit;cursor:pointer;text-align:left';
  b.onmouseenter = () => { b.style.background = 'rgba(80,80,130,0.95)'; };
  b.onmouseleave = () => { b.style.background = 'rgba(40,40,60,0.85)'; };
  b.onclick = (e) => { e.preventDefault(); onClick(); };
  return b;
}
function panel(children: HTMLElement[], align: 'left' | 'center' = 'center'): HTMLElement {
  const p = document.createElement('div');
  p.style.cssText = `min-width:18em;max-width:min(40em,92%);max-height:92%;display:flex;flex-direction:column;padding:1em 1.4em;background:rgba(0,0,0,0.72);border:1px solid rgba(255,255,255,0.5);border-radius:6px;text-align:center;${align === 'left' ? 'margin-right:auto;margin-left:6%' : ''}`;
  p.append(...children);
  return p;
}
function scroller(rows: HTMLElement[]): HTMLElement {
  const s = document.createElement('div');
  s.style.cssText = 'overflow:auto;max-height:60vh;margin:0.3em 0;padding-right:0.3em';
  s.append(...rows);
  return s;
}
