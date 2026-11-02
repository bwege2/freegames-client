// Tux Racer's game flow and menus: the original's modes (splash, game type, event/cup, race
// select, loading, intro, racing, paused, game over, credits), the Herring Run cup's rules and
// lives, the practice courses, the saved games and the music. The 3D race itself is in render.ts,
// physics.ts and race.ts.
import { EVENTS, assetUrl, loadCourse, type EventInfo, type CupInfo, type RaceInfo } from './assets.ts';
import { Physics } from './physics.ts';
import { Race, formatTime } from './race.ts';
import { GameRenderer } from './render.ts';
import { SaveGame, type RaceRecord } from './save.ts';
import type { GameContext } from '../../../src/sdk/index.ts';
import './ui.css';

const DIFFICULTY = 1; // NORMAL: the only difficulty 0.61 sets (src/main.c:259)
const EASY = 0; // the par time used for the score (src/game_logic_util.c:192)
const PRACTICE_EVENT = '__Practice_Event__';
const PRACTICE_CUP = '__Practice_Cup__';
const CONDITION_NAMES = ['sunny', 'cloudy', 'night'] as const;

type Mode = 'save' | 'splash' | 'menu' | 'event' | 'raceSelect' | 'loading' | 'intro' | 'racing'
  | 'paused' | 'gameOver' | 'credits' | 'stopped';

interface OpenCourse {
  course: string; name: string; description: string; parTime: number;
}

interface RaceEntry {
  course: string;
  name: string;
  description: string;
  herring: number[];
  time: number[];
  score: number[];
  mirrored: boolean;
  conditions: string;
  windy: boolean;
  snowing: boolean;
  parTime: number;
}

interface GameResult {
  aborted: boolean;
  time: number;
  herring: number;
  score: number;
  won: boolean;
  best: boolean;
  cupWon: boolean;
  advanced: boolean;
  message: string;
}

class Music {
  private readonly ctx: AudioContext;
  private readonly buffers = new Map<string, AudioBuffer>();
  private current: AudioBufferSourceNode | null = null;
  private currentName = '';
  private readonly gain: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0.5;
    this.gain.connect(ctx.destination);
  }

  async play(name: string, loop = true): Promise<void> {
    if (this.currentName === name) return;
    this.currentName = name;
    this.stop();
    let buffer = this.buffers.get(name);
    if (!buffer) {
      try {
        const res = await fetch(assetUrl(`music/${name}.ogg`));
        buffer = await this.ctx.decodeAudioData(await res.arrayBuffer());
        this.buffers.set(name, buffer);
      } catch { return; }
    }
    if (this.currentName !== name) return;
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    src.loop = loop;
    src.connect(this.gain);
    src.start();
    this.current = src;
  }

  stop(): void {
    if (this.current) {
      try { this.current.stop(); } catch { /* already ended */ }
      this.current.disconnect();
      this.current = null;
    }
  }

  async sound(name: string, volume = 1): Promise<void> {
    let buffer = this.buffers.get(`snd:${name}`);
    if (!buffer) {
      try {
        const res = await fetch(assetUrl(`sounds/${name}.wav`));
        buffer = await this.ctx.decodeAudioData(await res.arrayBuffer());
        this.buffers.set(`snd:${name}`, buffer);
      } catch { return; }
    }
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    g.gain.value = volume;
    src.buffer = buffer;
    src.connect(g); g.connect(this.ctx.destination);
    src.start();
  }
}

export class TuxRacerGame {
  private readonly host: HTMLElement;
  private readonly ctx: GameContext;
  private readonly ui: HTMLElement;
  private readonly music: Music;
  private saveGame = new SaveGame();
  private saveChain: Promise<unknown> = Promise.resolve();
  private screenEl: HTMLElement | null = null;
  private hudEl: HTMLElement | null = null;
  private overlayEl: HTMLElement | null = null;
  private resolveObserver: ResizeObserver;
  private mode: Mode = 'save';
  private last = 0;
  private practice = false;
  private event: EventInfo | null = null;
  private cup: CupInfo | null = null;
  private races: RaceEntry[] = [];
  private selected = 0;
  private lives = 4;
  private cupRaceIndex = 0;
  private cupComplete = false;
  private practiceCondition = 0;
  private practiceWind = false;
  private practiceMirror = false;
  private practiceSnow = false;
  private race: Race | null = null;
  private renderer: GameRenderer | null = null;
  private currentEntry: RaceEntry | null = null;
  private introTime = 0;
  private viewMode: 0 | 1 | 2 = 1;
  private creditY = 0;
  private result: GameResult | null = null;
  private stopped = false;
  private readonly openCourses: OpenCourse[];
  private readonly cupOrder: string[];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    this.music = new Music(ctx.audio);
    this.ui = document.createElement('div');
    this.ui.className = 'tr-ui game-root';
    host.append(this.ui);
    this.resolveObserver = new ResizeObserver(() => this.fitScreen());
    this.resolveObserver.observe(host);
    this.openCourses = EVENTS.courses.map((c) => ({
      course: c.course, name: c.name, description: c.description, parTime: c.parTime,
    }));
    this.event = EVENTS.events[0] ?? null;
    this.cup = this.event?.cups[0] ?? null;
    this.cupOrder = this.event?.cups.map((c) => c.name) ?? [];
    document.addEventListener('keydown', (ev) => this.onKey(ev), { signal: ctx.signal });
    document.addEventListener('keyup', (ev) => this.onKeyUp(ev), { signal: ctx.signal });
  }

  async init(): Promise<void> {
    this.saveGame = await this.loadSave();
    this.showSplash();
    this.last = performance.now();
    this.ctx.frame((now) => this.frame(now));
  }

  private async loadSave(): Promise<SaveGame> {
    if (!this.ctx.storage) return new SaveGame();
    const get = this.ctx.storage.get('noname.sav');
    const timeout = new Promise<null>((resolve) => setTimeout(() => resolve(null), 1500));
    try {
      const bytes = await Promise.race([get, timeout]);
      return SaveGame.parse(bytes);
    } catch {
      return new SaveGame();
    }
  }

  private queueSave(): void {
    const bytes = this.saveGame.toBytes();
    this.saveChain = this.saveChain.then(() => this.ctx.storage.put('noname.sav', bytes)).catch(() => {});
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.mode = 'stopped';
    this.resolveObserver.disconnect();
    this.music.stop();
    this.renderer?.dispose();
    this.renderer = null;
    await Promise.race([this.saveChain, new Promise<void>((r) => setTimeout(r, 1000))]);
    this.ui.remove();
    this.host.replaceChildren();
  }

  // ------------------------------------------------------------------ frame loop
  private frame(now: number): void {
    if (this.stopped) return;
    const dt = Math.min(0.1, Math.max(0, (now - this.last) / 1000));
    this.last = now;
    switch (this.mode) {
      case 'intro': {
        this.introTime += dt;
        this.renderer?.draw(dt, { introActive: true, introTime: this.introTime + 0.5, viewMode: 2 });
        if (this.introTime >= 3.5) this.startRacing();
        break;
      }
      case 'racing': {
        if (!this.race) break;
        this.race.step(dt);
        this.updateHud();
        if (this.race.physics.finished) this.finishRace(false);
        else if (this.race.aborted) this.finishRace(true);
        else this.renderer?.draw(dt, { introActive: false, viewMode: this.viewMode });
        break;
      }
      case 'paused': {
        this.renderer?.draw(0, { introActive: false, viewMode: this.viewMode });
        break;
      }
      case 'gameOver': {
        this.renderer?.draw(0, { introActive: false, viewMode: this.viewMode });
        break;
      }
      case 'credits': {
        this.creditY += 30 * dt;
        const el = this.screenEl?.querySelector('.tr-credits') as HTMLElement | null;
        if (el) el.style.transform = `translateY(${-this.creditY}px)`;
        if (el && -this.creditY < -el.scrollHeight + 60) this.creditY = 0;
        break;
      }
      default:
        break;
    }
  }

  // ------------------------------------------------------------------ screens
  private fitScreen(): void {
    if (!this.screenEl) return;
    const w = this.host.clientWidth, h = this.host.clientHeight;
    const scale = Math.min(w / 640, h / 480);
    this.screenEl.style.transform = `translate(-50%, -50%) scale(${scale})`;
  }

  private clearScreen(): void {
    this.ui.style.background = 'transparent';
    this.screenEl?.remove();
    this.screenEl = null;
    this.overlayEl?.remove();
    this.overlayEl = null;
    this.hudEl?.remove();
    this.hudEl = null;
  }

  private newScreen(clear = false): HTMLDivElement {
    this.clearScreen();
    this.ui.style.background = '#14263c';
    const el = document.createElement('div');
    el.className = `tr-screen${clear ? ' clear' : ''}`;
    this.ui.append(el);
    this.screenEl = el;
    this.fitScreen();
    return el;
  }

  private decor(root: HTMLElement): void {
    const add = (cls: string, file: string) => {
      const img = document.createElement('img');
      img.className = `tr-deco ${cls}`;
      img.src = assetUrl(`textures/${file}.png`);
      img.alt = '';
      root.append(img);
    };
    add('title', 'menu_title');
    add('tl', 'menu_top_left');
    add('tr', 'menu_top_right');
    add('bl', 'menu_bottom_left');
    add('br', 'menu_bottom_right');
  }

  private text(root: HTMLElement, cls: string, value: string, left: number, top: number, width?: number): HTMLElement {
    const el = document.createElement('div');
    el.className = cls;
    el.textContent = value;
    el.style.left = `${left}px`;
    el.style.top = `${top}px`;
    if (width !== undefined) el.style.width = `${width}px`;
    root.append(el);
    return el;
  }

  private button(root: HTMLElement, label: string, left: number, top: number, onclick: () => void,
    opts: { small?: boolean; width?: number; disabled?: boolean } = {}): HTMLButtonElement {
    const b = document.createElement('button');
    b.type = 'button';
    b.className = `tr-btn${opts.small ? ' small' : ''}`;
    b.textContent = label;
    b.style.left = `${left}px`;
    b.style.top = `${top}px`;
    if (opts.width !== undefined) b.style.width = `${opts.width}px`;
    b.disabled = !!opts.disabled;
    b.addEventListener('click', (ev) => { ev.stopPropagation(); onclick(); });
    root.append(b);
    return b;
  }


  // ------------------------------------------------------------------ splash / menu
  private showSplash(): void {
    this.mode = 'splash';
    this.music.play('start1');
    const s = this.newScreen();
    const splash = document.createElement('div');
    splash.className = 'tr-splash';
    for (const [name, left, top] of [['splash_tl', 0, 0], ['splash_tr', 256, 0], ['splash_bl', 0, 256], ['splash_br', 256, 256]] as const) {
      const img = document.createElement('img');
      img.src = assetUrl(`textures/${name}.png`);
      img.alt = '';
      img.style.left = `${left}px`;
      img.style.top = `${top}px`;
      splash.append(img);
    }
    s.append(splash);
    s.addEventListener('click', () => this.showMenu());
  }

  private showMenu(): void {
    if (this.mode === 'stopped') return;
    this.disposeRace();
    this.mode = 'menu';
    this.music.play('start1');
    const s = this.newScreen();
    this.decor(s);
    this.button(s, 'Enter an event', 170, 183, () => this.showEvent());
    this.button(s, 'Practice', 170, 239, () => this.enterPractice());
    this.button(s, 'Credits', 170, 295, () => this.showCredits());
    this.button(s, 'Quit', 170, 351, () => this.ctx.exit());
  }

  private showEvent(): void {
    if (!this.event || !this.cup) { this.showMenu(); return; }
    this.mode = 'event';
    const s = this.newScreen();
    this.decor(s);
    this.text(s, 'tr-title', 'Select event and cup', 0, 132, 640);
    this.text(s, 'tr-sub', 'Event:', 130, 190);
    this.text(s, 'tr-sub tr-status', this.event.name, 230, 190);
    this.text(s, 'tr-sub', 'Cup:', 130, 225);
    this.text(s, 'tr-sub tr-status', this.cup.name, 230, 225);
    const complete = this.isCupComplete();
    const first = this.isFirstIncompleteCup();
    const status = complete ? "You've won this cup!" : first ? 'You must complete this cup next' : 'You cannot enter this cup yet';
    this.text(s, 'tr-sub tr-status', status, 0, 270, 640);
    const icon = document.createElement('img');
    icon.className = 'tr-icon';
    icon.src = assetUrl('common/herringrunicon.png');
    icon.style.cssText = 'left:150px;top:266px;width:44px;height:44px';
    s.append(icon);
    this.button(s, 'Back', 146, 398, () => this.showMenu(), { small: true });
    this.button(s, 'Continue', 344, 398, () => this.enterCup(), { small: true, disabled: !(complete || first) });
  }

  private isCupComplete(): boolean {
    if (!this.event || !this.cup) return false;
    return this.saveGame.isCupComplete(this.event.name, this.cup.name, this.cupOrder, DIFFICULTY);
  }

  private isFirstIncompleteCup(): boolean {
    if (!this.event || !this.cup) return false;
    return this.saveGame.isFirstIncompleteCup(this.event.name, this.cup.name, this.cupOrder, DIFFICULTY);
  }

  private enterPractice(): void {
    this.practice = true;
    this.event = null;
    this.cup = null;
    this.races = this.openCourses.map((c) => ({
      course: c.course, name: c.name, description: c.description,
      herring: [0, 0, 0, 0], time: [c.parTime, 0, 0, 0], score: [0, 0, 0, 0],
      mirrored: this.practiceMirror, conditions: CONDITION_NAMES[this.practiceCondition],
      windy: this.practiceWind, snowing: this.practiceSnow, parTime: c.parTime,
    }));
    this.selected = 0;
    this.lives = 4;
    this.showRaceSelect();
  }

  private enterCup(): void {
    if (!this.event || !this.cup) { this.showMenu(); return; }
    this.practice = false;
    this.lives = 4;
    this.cupComplete = this.isCupComplete();
    this.cupRaceIndex = 0;
    this.races = this.cup.races.map((r: RaceInfo) => ({
      course: r.course, name: r.name, description: r.description,
      herring: r.herring, time: r.time, score: r.score, mirrored: r.mirrored === 'yes',
      conditions: r.conditions, windy: r.windy === 'yes', snowing: r.snowing === 'yes',
      parTime: r.time[EASY],
    }));
    this.selected = 0;
    this.showRaceSelect();
  }

  // ------------------------------------------------------------------ race select
  private showRaceSelect(): void {
    this.mode = 'raceSelect';
    this.music.play('start1');
    const s = this.newScreen();
    this.decor(s);
    this.text(s, 'tr-title', 'Select a race', 0, 132, 640);
    const entry = this.races[this.selected];
    if (!entry) { this.showMenu(); return; }
    const list = document.createElement('div');
    list.className = 'tr-panel tr-list';
    list.style.cssText = 'left:90px;top:180px;width:460px;height:44px';
    const item = document.createElement('div');
    item.className = 'tr-list-item sel';
    item.textContent = this.races[this.selected].name;
    list.append(item);
    s.append(list);
    this.button(s, '▲', 90 + 460 - 36, 180, () => { this.selected = (this.selected + this.races.length - 1) % this.races.length; this.showRaceSelect(); }, { small: true, width: 32 });
    this.button(s, '▼', 90 + 460 - 36, 180 + 22, () => { this.selected = (this.selected + 1) % this.races.length; this.showRaceSelect(); }, { small: true, width: 32 });
    this.text(s, 'tr-desc', entry.description, 90, 282, 312);
    const preview = document.createElement('img');
    preview.className = 'tr-preview';
    preview.src = assetUrl(`courses/${entry.course}/preview.png`);
    preview.alt = '';
    preview.style.cssText = 'left:410px;top:282px;width:132px;height:99px';
    preview.onerror = () => { preview.src = assetUrl('common/nopreview.png'); };
    s.append(preview);
    const status = this.statusLines(entry);
    this.text(s, 'tr-desc tr-status', status.label, 90, 148, 500);
    this.text(s, 'tr-desc', status.values, 90, 164, 500);
    if (!this.practice && !this.cupComplete) this.drawLives(s);
    else if (this.practice) this.drawPracticeStates(s);
    const canRace = this.canRace(entry);
    this.button(s, 'Back', 146, 398, () => { if (this.practice) this.showMenu(); else this.showEvent(); }, { small: true });
    this.button(s, 'Race!', 344, 398, () => void this.beginRace(), { small: true, disabled: !canRace });
    this.text(s, 'tr-desc tr-muted', '←/→ select   Enter race   Esc back', 0, 450, 640);
  }

  private statusLines(entry: RaceEntry): { label: string; values: string } {
    if (this.practice) {
      const saved = this.saveGame.result(PRACTICE_EVENT, PRACTICE_CUP, entry.name, DIFFICULTY);
      if (!saved) return { label: 'No result yet.', values: `Par time: ${formatTime(entry.parTime)}` };
      return {
        label: 'Best result:',
        values: `Time: ${formatTime(saved.time)}   Herring: ${saved.herring}   Score: ${saved.score}`,
      };
    }
    if (this.cupComplete || this.selected < this.cupRaceIndex) {
      const saved = this.saveGame.result(this.event!.name, this.cup!.name, entry.name, DIFFICULTY);
      if (saved) {
        return {
          label: this.cupComplete ? 'Best result:' : 'Race won! Your result:',
          values: `Time: ${formatTime(saved.time)}   Herring: ${saved.herring}   Score: ${saved.score}`,
        };
      }
    }
    if (!this.cupComplete && this.lives <= 0) return { label: "You don't have any lives left.", values: '' };
    if (!this.cupComplete && this.selected !== this.cupRaceIndex) {
      return { label: "You can't enter this race yet.", values: '' };
    }
    const secs = entry.time[DIFFICULTY];
    return {
      label: this.selected === this.cupRaceIndex ? 'Needed to advance:' : 'Requirements:',
      values: `Time: ${formatTime(secs)}   Herring: ${String(entry.herring[DIFFICULTY]).padStart(3, '0')}` +
        `   Score: ${String(entry.score[DIFFICULTY]).padStart(6, '0')}`,
    };
  }

  private canRace(_entry: RaceEntry): boolean {
    if (this.practice) return true;
    if (this.cupComplete) return true;
    return this.lives > 0 && this.selected === this.cupRaceIndex;
  }

  private drawLives(root: HTMLElement): void {
    for (let i = 0; i < 4; i++) {
      const img = document.createElement('img');
      img.className = 'tr-icon';
      img.src = assetUrl('textures/tuxlife.png');
      img.alt = '';
      img.style.cssText = `left:${410 + i * 36}px;top:236px;width:32px;height:32px;opacity:${i < this.lives ? 1 : 0.25}`;
      root.append(img);
    }
  }

  private drawPracticeStates(root: HTMLElement): void {
    const btn = (label: string, left: number, onclick: () => void) => {
      const b = this.button(root, label, left, 236, onclick, { small: true, width: 100 });
      b.style.fontSize = '14px';
      return b;
    };
    btn(`Cond: ${CONDITION_NAMES[this.practiceCondition]}`, 92, () => {
      this.practiceCondition = (this.practiceCondition + 1) % 3;
      this.syncPractice();
      this.showRaceSelect();
    });
    btn(`Wind: ${this.practiceWind ? 'on' : 'off'}`, 196, () => {
      this.practiceWind = !this.practiceWind;
      this.syncPractice();
      this.showRaceSelect();
    });
    btn(`Mirror: ${this.practiceMirror ? 'on' : 'off'}`, 300, () => {
      this.practiceMirror = !this.practiceMirror;
      this.syncPractice();
      this.showRaceSelect();
    });
    const snow = btn(`Snow: ${this.practiceSnow ? 'on' : 'off'}`, 404, () => {});
    snow.disabled = true;
  }

  private syncPractice(): void {
    for (const r of this.races) {
      r.mirrored = this.practiceMirror;
      r.conditions = CONDITION_NAMES[this.practiceCondition];
      r.windy = this.practiceWind;
      r.snowing = this.practiceSnow;
    }
  }

  // ------------------------------------------------------------------ racing
  private async beginRace(): Promise<void> {
    const entry = this.races[this.selected];
    if (!entry || !this.canRace(entry)) return;
    this.currentEntry = entry;
    this.mode = 'loading';
    const s = this.newScreen();
    s.style.background = '#14263c';
    this.text(s, 'tr-sub', 'Loading, Please Wait...', 0, 216, 640);
    try {
      const course = await loadCourse(entry.course, Math.random, this.ctx.signal, { mirror: entry.mirrored });
      if (this.stopped) return;
      this.disposeRace();
      const physics = new Physics(course, Math.random);
      physics.windy = entry.windy;
      this.race = new Race(physics);
      physics.onSound = () => void this.music.sound(`fish_pickup${1 + Math.floor(Math.random() * 3)}`, 0.8);
      physics.onTreeHit = () => void this.music.sound('tux_hit_tree1', 0.8);
      this.renderer = await GameRenderer.create(this.host, physics, entry.conditions, this.ctx.signal);
      if (this.stopped) return;
      this.clearScreen();
      this.showHud();
      this.mode = 'intro';
      this.introTime = 0;
      this.music.play('race1');
    } catch (e) {
      console.error('tuxracer: course failed', e);
      this.showMenu();
      const err = document.createElement('div');
      err.className = 'tr-sub';
      err.style.cssText = 'top:220px;color:#f88;z-index:5';
      err.textContent = `Could not load the course: ${(e as Error).message ?? e}`;
      this.screenEl?.append(err);
    }
  }

  private startRacing(): void {
    if (!this.race) return;
    this.mode = 'racing';
    this.introTime = 0;
    this.race.resetKeys();
    this.race.time = 0;
    this.race.physics.time = 0;
    this.race.physics.player.herring = 0;
    this.race.physics.player.score = 0;
    this.race.physics.init();
    this.race.physics.windy = this.currentEntry?.windy ?? false;
    for (const item of this.race.physics.course.items) item.collected = false;
    this.updateHud();
    this.overlayEl?.remove();
  }

  private finishRace(aborted: boolean): void {
    if (!this.race || !this.currentEntry) return;
    const entry = this.currentEntry;
    const time = this.race.time;
    const herring = this.race.physics.player.herring;
    const par = entry.time[EASY];
    const score = Math.max(0, Math.trunc(100 * (par - time) + 200 * herring));
    const won = !aborted && time <= entry.time[DIFFICULTY] && herring >= entry.herring[DIFFICULTY] && score >= entry.score[DIFFICULTY];
    const prev = this.practice
      ? this.saveGame.result(PRACTICE_EVENT, PRACTICE_CUP, entry.name, DIFFICULTY)
      : this.saveGame.result(this.event!.name, this.cup!.name, entry.name, DIFFICULTY);
    const best = !aborted && !!prev && score > prev.score;
    let cupWon = false;
    let advanced = false;
    if (!this.practice && this.event && this.cup) {
      if (!aborted) {
        const save = (): void => {
          const rec: RaceRecord = {
            event: this.event!.name, cup: this.cup!.name, race: entry.name,
            difficulty: DIFFICULTY, time, herring, score,
          };
          if (!prev || !this.cupComplete || score > prev.score) this.saveGame.setResult(rec);
        };
        save();
        if (!this.cupComplete) {
          if (won) {
            if (this.selected >= this.races.length - 1) {
              this.cupComplete = true;
              this.saveGame.setLastCompletedCup(this.event.name, DIFFICULTY, this.cup.name);
              cupWon = true;
            } else {
              this.cupRaceIndex = Math.max(this.cupRaceIndex, this.selected + 1);
              advanced = true;
            }
          } else {
            this.lives -= 1;
          }
        }
      } else if (!this.cupComplete) {
        this.lives -= 1;
      }
      this.queueSave();
    } else {
      if (!aborted && (!prev || score > prev.score)) {
        this.saveGame.setResult({
          event: PRACTICE_EVENT, cup: PRACTICE_CUP, race: entry.name,
          difficulty: DIFFICULTY, time, herring, score,
        });
      }
      this.queueSave();
    }
    let message: string;
    if (aborted) message = 'Race aborted.';
    else if (best && (this.practice || this.cupComplete)) message = 'You beat your best score!';
    else if (this.practice || this.cupComplete) message = '';
    else if (won && cupWon) message = 'Congratulations! You won the cup!';
    else if (won && advanced) message = 'You advanced to the next race!';
    else message = "You didn't advance.";
    this.result = { aborted, time, herring, score, won, best, cupWon, advanced, message };
    this.mode = 'gameOver';
    this.music.play('wonrace1');
    this.showGameOver();
  }

  private showGameOver(): void {
    const r = this.result!;
    const box = document.createElement('div');
    box.className = 'tr-box';
    const title = document.createElement('h2');
    title.textContent = 'Race Over';
    box.append(title);
    if (!r.aborted) {
      for (const [label, value] of [['Time: ', formatTime(r.time)], ['Herring: ', String(r.herring).padStart(3, ' ')], ['Score: ', String(r.score).padStart(6, ' ')]] as const) {
        const row = document.createElement('div');
        row.className = 'row';
        row.textContent = `${label}${value}`;
        box.append(row);
      }
    }
    if (r.message) {
      const msg = document.createElement('div');
      msg.className = 'msg';
      msg.textContent = r.message;
      box.append(msg);
    }
    const hint = document.createElement('div');
    hint.className = 'msg';
    hint.style.color = '#ffffffaa';
    hint.textContent = 'Press any key';
    box.append(hint);
    this.overlayEl?.remove();
    const o = document.createElement('div');
    o.className = 'tr-overlay';
    o.append(box);
    o.addEventListener('click', () => this.afterGameOver());
    this.ui.append(o);
    this.overlayEl = o;
  }

  private afterGameOver(): void {
    this.overlayEl?.remove();
    this.overlayEl = null;
    this.disposeRace();
    if (!this.practice && !this.cupComplete) this.selected = this.cupRaceIndex;
    this.mode = 'raceSelect';
    this.showRaceSelect();
  }

  private showPaused(): void {
    this.mode = 'paused';
    const box = document.createElement('div');
    box.className = 'tr-box';
    const title = document.createElement('h2');
    title.textContent = 'Paused';
    box.append(title);
    const hint = document.createElement('div');
    hint.className = 'msg';
    hint.textContent = 'Press any key to continue';
    box.append(hint);
    const o = document.createElement('div');
    o.className = 'tr-overlay';
    o.append(box);
    o.addEventListener('click', () => this.resume());
    this.ui.append(o);
    this.overlayEl = o;
  }

  private resume(): void {
    this.race?.resetKeys();
    this.overlayEl?.remove();
    this.overlayEl = null;
    this.mode = 'racing';
    this.last = performance.now();
  }

  // ------------------------------------------------------------------ HUD
  private showHud(): void {
    this.ui.style.background = 'transparent';
    const hud = document.createElement('div');
    hud.className = 'tr-hud';
    const timeLabel = document.createElement('div');
    timeLabel.className = 'time-label';
    timeLabel.textContent = 'Time';
    const time = document.createElement('div');
    time.className = 'time';
    time.textContent = '00:00.00';
    const herring = document.createElement('div');
    herring.className = 'herring';
    const icon = document.createElement('img');
    icon.src = assetUrl('textures/herringicon.png');
    icon.alt = '';
    const count = document.createElement('span');
    count.textContent = ' x 000';
    herring.append(icon, count);
    const gauge = document.createElement('div');
    gauge.className = 'gauge';
    const outline = document.createElement('img');
    outline.src = assetUrl('textures/gaugeoutline.png');
    outline.alt = '';
    outline.style.cssText = 'position:absolute;inset:0;width:128px;height:128px';
    const energy = document.createElement('div');
    energy.className = 'energy';
    const bar = document.createElement('i');
    energy.append(bar);
    const speednum = document.createElement('div');
    speednum.className = 'speednum';
    speednum.textContent = '0';
    const speedunit = document.createElement('div');
    speedunit.className = 'speedunit';
    speedunit.textContent = 'km/h';
    gauge.append(outline, energy, speednum, speedunit);
    const help = document.createElement('div');
    help.className = 'helpline';
    help.textContent = '←/→ turn · ↑ paddle · ↓ brake · E jump · D trick · 1/2/3 view · P pause · R reset · Q quit';
    hud.append(timeLabel, time, herring, gauge, help);
    this.ui.append(hud);
    this.hudEl = hud;
    (hud as HTMLElement & { _time?: HTMLElement; _count?: HTMLElement; _speed?: HTMLElement; _bar?: HTMLElement })._time = time;
    (hud as HTMLElement & { _time?: HTMLElement; _count?: HTMLElement; _speed?: HTMLElement; _bar?: HTMLElement })._count = count;
    (hud as HTMLElement & { _time?: HTMLElement; _count?: HTMLElement; _speed?: HTMLElement; _bar?: HTMLElement })._speed = speednum;
    (hud as HTMLElement & { _time?: HTMLElement; _count?: HTMLElement; _speed?: HTMLElement; _bar?: HTMLElement })._bar = bar;
  }

  private updateHud(): void {
    if (!this.hudEl || !this.race) return;
    const h = this.hudEl as HTMLElement & { _time?: HTMLElement; _count?: HTMLElement; _speed?: HTMLElement; _bar?: HTMLElement };
    if (h._time) h._time.textContent = formatTime(this.race.time);
    const p = this.race.physics.player;
    if (h._count) h._count.textContent = ` x ${String(p.herring).padStart(3, '0')}`;
    if (h._speed) h._speed.textContent = String(Math.trunc(this.race.speedKmh));
    if (h._bar) h._bar.style.height = `${Math.max(3, p.control.jumpAmt * 103)}px`;
  }

  // ------------------------------------------------------------------ credits
  private showCredits(): void {
    this.mode = 'credits';
    this.music.play('options1');
    this.creditY = 0;
    const s = this.newScreen(true);
    this.decor(s);
    const box = document.createElement('div');
    box.className = 'tr-credits';
    box.style.top = '480px';
    box.innerHTML = `
      <h1>Tux Racer</h1>
      <p>A Sunspire Studios Production</p>
      <p>www.sunspirestudios.com</p>
      <h2>Core Development Team</h2>
      <p class="small">(Alphabetical Order)</p>
      <p>Patrick "Pog" Gilhuly</p><p>Eric "Monster" Hall</p><p>Rick Knowles</p><p>Vincent Ma</p>
      <p>Jasmin Patry</p><p>Mark Riddell</p>
      <h2>Music</h2><p>Joseph Toscano</p>
      <h2>Thanks To:</h2><p class="small">(In No Particular Order)</p>
      <p>Larry Ewing</p><p>Thatcher Ulrich</p><p>Steve Baker</p><p>Ingo Ruhnke</p><p>James Barnard</p>
      <p>Alan Levy</p><p>University of Waterloo Computer Graphics Lab</p>
      <h2>Tux Racer</h2>
      <p class="small">Tux Racer is a trademark of Jasmin F. Patry</p>
      <p class="small">Tux Racer is copyright 1999, 2000, 2001 Jasmin F. Patry</p>`;
    s.append(box);
    s.addEventListener('click', () => this.showMenu());
  }

  // ------------------------------------------------------------------ keys
  private onKey(ev: KeyboardEvent): void {
    if (ev.repeat) return;
    switch (this.mode) {
      case 'splash':
        this.showMenu();
        break;
      case 'menu':
        if (ev.key === 'e' || ev.key === 'Enter') this.showEvent();
        else if (ev.key === 'p' || ev.key === 'P') this.enterPractice();
        else if (ev.key === 'c' || ev.key === 'C') this.showCredits();
        else if (ev.key === 'q' || ev.key === 'Q' || ev.key === 'Escape') this.ctx.exit();
        break;
      case 'event':
        if (ev.key === 'Enter') { if (this.isCupComplete() || this.isFirstIncompleteCup()) this.enterCup(); }
        else if (ev.key === 'Escape') this.showMenu();
        break;
      case 'raceSelect':
        if (ev.key === 'ArrowUp' || ev.key === 'ArrowLeft') { this.selected = (this.selected + this.races.length - 1) % this.races.length; this.showRaceSelect(); }
        else if (ev.key === 'ArrowDown' || ev.key === 'ArrowRight') { this.selected = (this.selected + 1) % this.races.length; this.showRaceSelect(); }
        else if (ev.key === 'Enter') { const e = this.races[this.selected]; if (e && this.canRace(e)) void this.beginRace(); }
        else if (ev.key === 'Escape') { if (this.practice) this.showMenu(); else this.showEvent(); }
        else if (this.practice && (ev.key === 'c' || ev.key === 'C')) { this.practiceCondition = (this.practiceCondition + 1) % 3; this.syncPractice(); this.showRaceSelect(); }
        else if (this.practice && (ev.key === 'w' || ev.key === 'W')) { this.practiceWind = !this.practiceWind; this.syncPractice(); this.showRaceSelect(); }
        else if (this.practice && (ev.key === 'm' || ev.key === 'M')) { this.practiceMirror = !this.practiceMirror; this.syncPractice(); this.showRaceSelect(); }
        break;
      case 'intro':
        this.startRacing();
        break;
      case 'racing':
        this.racingKey(ev, true);
        break;
      case 'paused':
        this.resume();
        break;
      case 'gameOver':
        this.afterGameOver();
        break;
      case 'credits':
        this.showMenu();
        break;
      default:
        break;
    }
  }

  private onKeyUp(ev: KeyboardEvent): void {
    if (this.mode === 'racing') this.racingKey(ev, false);
  }

  private racingKey(ev: KeyboardEvent, down: boolean): void {
    if (!this.race) return;
    const k = ev.key;
    if (down) {
      if (k === 'p' || k === 'P') { this.showPaused(); return; }
      if (k === 'q' || k === 'Q' || k === 'Escape') { this.race.aborted = true; return; }
      if (k === 'r' || k === 'R' || k === 'Backspace') { this.race.resetPosition(); return; }
      if (k === '1') this.viewMode = 1;
      else if (k === '2') this.viewMode = 0;
      else if (k === '3') this.viewMode = 2;
    }
    const map: Record<string, 'left' | 'right' | 'brake' | 'paddle' | 'trick' | 'jump'> = {
      ArrowLeft: 'left', j: 'left', J: 'left',
      ArrowRight: 'right', l: 'right', L: 'right',
      ArrowDown: 'brake', ' ': 'brake', k: 'brake', K: 'brake',
      ArrowUp: 'paddle', i: 'paddle', I: 'paddle',
      e: 'jump', E: 'jump',
      d: 'trick', D: 'trick',
    };
    const key = map[k];
    if (key) {
      ev.preventDefault();
      this.race.key(key, down);
    }
  }

  private disposeRace(): void {
    this.renderer?.dispose();
    this.renderer = null;
    this.race = null;
    this.hudEl?.remove();
    this.hudEl = null;
  }
}
