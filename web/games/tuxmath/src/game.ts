// Tux, of Math Command 2.0.3 on the website: the title screen and menus (the original menu tree's
// Play Alone/Arcade, Academy, Hall of Fame, Help, More Options and Quit), the high scores in the
// player's account, music and sound, and the arcade game in arcade.ts. The original's 640x480 picture
// is drawn on the SDK's pixel screen.
import { PixelScreen } from '../../../src/sdk/index.ts';
import type { GameContext, StartGame } from '../../../src/sdk/index.ts';
import { FONT, loadFont, loadImage, loadSound } from './assets.ts';
import { ArcadeGame, FPS, H, W, type Resources } from './arcade.ts';
import { parseLesson } from './math.ts';

interface MenuItem { title: string; desc: string; icon: string; action: () => void }
interface HighScore { name: string; score: number; wave: number }

const ARCADE_NAMES = ['Space Cadet', 'Scout', 'Ranger', 'Ace', 'Commando'];
const ARCADE_FILES = ['space_cadet', 'scout', 'ranger', 'ace', 'commando'];

const lessonTexts = import.meta.glob('../assets/missions/arcade/*', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;
const academyTexts = import.meta.glob('../assets/missions/lessons/*', { query: '?raw', import: 'default', eager: true }) as Record<string, string>;

function rawLesson(dir: string, name: string): string | null {
  return lessonTexts[`../assets/missions/${dir}/${name}`] ?? academyTexts[`../assets/missions/lessons/${name}`] ?? null;
}

class AudioEngine {
  private readonly ctx: AudioContext;
  private readonly buffers = new Map<string, AudioBuffer>();
  private current: AudioBufferSourceNode | null = null;
  private currentName = '';
  private readonly gain: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.gain = ctx.createGain();
    this.gain.gain.value = 0.45;
    this.gain.connect(ctx.destination);
  }

  async load(names: string[]): Promise<void> {
    await Promise.all(names.map(async (name) => {
      if (this.buffers.has(name)) return;
      const path = name.endsWith('.ogg') ? `sounds/${name}` : `sounds/${name}.wav`;
      const buf = await loadSound(this.ctx, path);
      if (buf) this.buffers.set(name, buf);
    }));
  }

  play(name: string, volume = 0.7): void {
    const buf = this.buffers.get(name);
    if (!buf) return;
    const src = this.ctx.createBufferSource();
    const g = this.ctx.createGain();
    g.gain.value = volume;
    src.buffer = buf;
    src.connect(g); g.connect(this.ctx.destination);
    src.start();
  }

  music(name: string): void {
    if (this.currentName === name) return;
    this.currentName = name;
    this.current?.stop();
    const buf = this.buffers.get(name);
    if (!buf) { this.current = null; return; }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.loop = true;
    src.connect(this.gain);
    src.start();
    this.current = src;
  }

  stopMusic(): void {
    this.currentName = '';
    this.current?.stop();
    this.current = null;
  }
}

class Res implements Resources {
  readonly images = new Map<string, HTMLImageElement>();
  readonly audio: AudioEngine;
  readonly font = FONT;

  constructor(audio: AudioEngine) { this.audio = audio; }

  async load(): Promise<void> {
    const paths: string[] = [
      'images/title/menu_bkg.jpg', 'images/title/title1.png', 'images/status/standby.png',
      'images/tux/bigtux0.png', 'images/tux/console_led.png', 'images/tux/tux-sit.png',
      'images/tux/tux-relax1.png', 'images/tux/tux-relax2.png', 'images/tux/tux-yay1.png',
      'images/tux/tux-yay2.png', 'images/tux/tux-yes1.png', 'images/tux/tux-yes2.png',
      'images/tux/tux-drat.png', 'images/tux/tux-yipe.png', 'images/tux/tux-fist1.png',
      'images/tux/tux-fist2.png', 'images/tux/tux-console1.png', 'images/tux/tux-console2.png',
      'images/tux/tux-console3.png', 'images/tux/tux-console4.png',
      'images/status/wave.png', 'images/status/score.png', 'images/status/stop.png',
      'images/status/numbers.png', 'images/status/lednums.png', 'images/status/led_neg_sign.png',
      'images/status/gameover.png', 'images/status/gameover_won.png',
      'images/igloos/intact.png', 'images/igloos/half.png', 'images/igloos/melted1.png',
      'images/igloos/melted2.png', 'images/igloos/melted3.png', 'images/igloos/extra_life.png',
      'images/penguins/flapdown.png', 'images/penguins/flapup.png',
      'images/cities/city-blue.png', 'images/cities/shields.png',
    ];
    for (let i = 0; i < 3; i++) paths.push(`images/comets/comet${i}.png`);
    for (let i = 0; i < 4; i++) paths.push(`images/comets/cometex${i}.png`);
    for (let i = 0; i < 8; i++) paths.push(`images/backgrounds/${i}.jpg`);
    for (const name of ['alone', 'lan', 'friends', 'factors', 'help', 'tux_config', 'quit', 'lesson', 'fleet',
      'comet', 'tux_config_brown', 'main', 'trophy', 'tux_helmet_yellow', 'tux_helmet_green',
      'tux_helmet_blue', 'tux_helmet_red', 'tux_helmet_black', 'credits']) {
      paths.push(`images/sprites/${name}0.png`);
    }
    await Promise.all(paths.map(async (p) => {
      try { this.images.set(p, await loadImage(p)); } catch { /* a missing optional image */ }
    }));
    await this.audio.load(['tuxi.ogg', '01_rush.ogg', '02_on_the_edge_of_the_universe.ogg', '03_gravity.ogg',
      'harp', 'pop', 'tock', 'laser', 'buzz', 'alarm', 'shieldsdown', 'explosion', 'sizzling', 'towerclock', 'cheer']);
  }

  img(path: string): HTMLImageElement {
    const i = this.images.get(path);
    if (!i) throw new Error(`no image ${path}`);
    return i;
  }

  sound(name: string): void {
    const files: Record<string, string> = {
      laser: 'laser', buzz: 'buzz', sizzling: 'sizzling', explosion: 'explosion', cheer: 'cheer',
      pop: 'pop', tock: 'tock', harp: 'harp', alarm: 'alarm', shieldsdown: 'shieldsdown',
    };
    this.audio.play(files[name] ?? name);
  }
}

interface HighTables { tables: HighScore[][] }

export class TuxMathGame {
  private readonly ctx: GameContext;
  private readonly screen: PixelScreen;
  private readonly c2d: CanvasRenderingContext2D;
  private readonly audio: AudioEngine;
  private readonly res: Res;
  private state: 'boot' | 'standby' | 'menu' | 'help' | 'credits' | 'message' | 'arcade' | 'hall' | 'result' | 'name' | 'stopped' = 'boot';
  private menu: MenuItem[] = [];
  private menuTitle = '';
  private menuIndex = 0;
  private menuStack: { title: string; items: MenuItem[]; index: number }[] = [];
  private readonly menuRects: { x: number; y: number; w: number; h: number }[] = [];
  private standbyAt = 0;
  private arcade: ArcadeGame | null = null;
  private arcadeLevel = 0;
  private arcadeLast = 0;
  private arcadeAcc = 0;
  private arcadeGameName = '';
  private highs: HighTables = { tables: Array.from({ length: 5 }, () => []) };
  private result: { score: number; wave: number; won: boolean; level: number } | null = null;
  private nameEntry = '';
  private nameFor: { score: number; wave: number; level: number } | null = null;
  private creditY = 0;
  private academyLessons: { name: string; file: string }[] = [];

  constructor(host: HTMLElement, ctx: GameContext) {
    this.ctx = ctx;
    this.screen = new PixelScreen(host, { width: W, height: H, background: '#000' }, ctx.signal);
    this.c2d = this.screen.ctx;
    this.audio = new AudioEngine(ctx.audio);
    this.res = new Res(this.audio);
    document.addEventListener('keydown', (e) => this.onKey(e), { signal: ctx.signal });
    this.screen.canvas.addEventListener('pointerdown', (e) => {
      const p = this.screen.toPixel(e.clientX, e.clientY);
      if (p) this.onClick(p.x, p.y);
    }, { signal: ctx.signal });
  }

  async start(): Promise<void> {
    await whileNotAborted(this.ctx, Promise.all([loadFont(), this.res.load()]));
    if (this.ctx.signal.aborted) return;
    this.highs = await this.loadHighs();
    this.academyLessons = Object.keys(academyTexts)
      .filter((k) => !k.endsWith('README') && !k.endsWith('Makefile.am') && !k.endsWith('Makefile.in'))
      .map((k) => {
        const text = academyTexts[k];
        const m = /#\s*(.*?)\s*(lesson file)?\s*$/i.exec(text.split('\n')[0] ?? '');
        return { name: (m?.[1] || k.split('/').pop() || 'Lesson').trim(), file: k.split('/').pop()! };
      })
      .sort((a, b) => a.name.localeCompare(b.name));
    this.state = 'standby';
    this.standbyAt = performance.now();
    this.audio.music('tuxi.ogg');
    this.ctx.frame((now) => this.frame(now));
  }

  private async loadHighs(): Promise<HighTables> {
    try {
      if (!this.ctx.storage) return { tables: Array.from({ length: 5 }, () => []) };
      const get = this.ctx.storage.get('tuxmath-highscores.json');
      const bytes = await Promise.race([get, new Promise<null>((r) => setTimeout(() => r(null), 1500))]);
      if (!bytes) return { tables: Array.from({ length: 5 }, () => []) };
      const parsed = JSON.parse(new TextDecoder().decode(bytes)) as HighTables;
      if (!Array.isArray(parsed.tables) || parsed.tables.length !== 5) throw new Error('bad high scores');
      return parsed;
    } catch {
      return { tables: Array.from({ length: 5 }, () => []) };
    }
  }

  private saveHighs(): void {
    if (!this.ctx.storage) return;
    void this.ctx.storage.put('tuxmath-highscores.json', new TextEncoder().encode(JSON.stringify(this.highs))).catch(() => {});
  }

  private frame(now: number): void {
    if (this.state === 'stopped') return;
    if (this.state === 'boot') { this.drawBoot(); return; }
    if (this.state === 'standby') {
      this.drawStandby();
      if (now - this.standbyAt >= 2000) this.showMain();
      return;
    }
    if (this.state === 'arcade') {
      const dt = Math.min(0.25, (now - this.arcadeLast) / 1000);
      this.arcadeLast = now;
      this.arcadeAcc += dt;
      const step = 1 / FPS;
      let guard = 0;
      while (this.arcadeAcc >= step && guard++ < 8) {
        this.arcade?.update();
        this.arcadeAcc -= step;
      }
      this.arcade?.draw();
      return;
    }
    if (this.state === 'menu' || this.state === 'hall' || this.state === 'help' || this.state === 'credits'
      || this.state === 'message' || this.state === 'result' || this.state === 'name') {
      if (this.state === 'credits') this.creditY += 1.2;
      this.drawMenuState();
    }
  }

  private drawBoot(): void {
    this.c2d.fillStyle = '#000';
    this.c2d.fillRect(0, 0, W, H);
    this.centerText('Loading...', 22, '#fff');
  }

  private drawStandby(): void {
    const ctx = this.c2d;
    ctx.fillStyle = '#000';
    ctx.fillRect(0, 0, W, H);
    const logo = this.res.images.get('images/status/standby.png');
    if (logo) ctx.drawImage(logo, Math.round((W - logo.width) / 2), Math.round((H - logo.height) / 2));
    this.centerText('Press any key', 16, '#888');
  }

  private showMain(): void {
    this.menuTitle = 'Tux, of Math Command';
    this.menu = [
      { title: 'Play Alone', desc: 'Play and learn on your own', icon: 'alone0', action: () => this.showPlayAlone() },
      { title: 'Network Game', desc: 'Play a game with your friends on a local network', icon: 'lan0', action: () => this.showMessage('Network games are not available in this browser port.') },
      { title: 'Play With Friends', desc: 'Take turns in a game with your friends on a single computer', icon: 'friends0', action: () => this.showMessage('Turn-based multiplayer is not part of this port yet.') },
      { title: 'Factoroids', desc: 'Factorize numbers with your laser beam!', icon: 'factors0', action: () => this.showMessage('Factoroids is not part of this port yet.') },
      { title: 'Help', desc: 'See how to play the game', icon: 'help0', action: () => this.showHelp() },
      { title: 'More Options', desc: 'Additional options', icon: 'tux_config0', action: () => this.showMore() },
      { title: 'Quit', desc: 'Exit to the website', icon: 'quit0', action: () => this.ctx.exit() },
    ];
    this.menuIndex = 0;
    this.state = 'menu';
    this.audio.music('tuxi.ogg');
  }

  private pushMenu(title: string, items: MenuItem[]): void {
    this.menuStack.push({ title: this.menuTitle, items: this.menu, index: this.menuIndex });
    this.menuTitle = title;
    this.menu = items;
    this.menuIndex = 0;
    this.state = 'menu';
  }

  private backMenu(): void {
    const prev = this.menuStack.pop();
    if (!prev) { this.showMain(); return; }
    this.menuTitle = prev.title;
    this.menu = prev.items;
    this.menuIndex = prev.index;
    this.state = 'menu';
  }

  private showPlayAlone(): void {
    this.pushMenu('Play Alone', [
      { title: 'Math Command Training Academy', desc: 'Earn stars as you build your math skills with each mission', icon: 'lesson0', action: () => this.showAcademy() },
      { title: 'Math Command Fleet Missions', desc: 'Complete missions for the Math Command Fleet', icon: 'fleet0', action: () => this.showMessage('Fleet Missions are not part of this port yet.') },
      { title: 'Play Arcade Game', desc: 'Make the Hall of Fame by beating the highest score', icon: 'comet0', action: () => this.showArcade() },
      { title: 'Play Custom Game', desc: 'Customize the game you play', icon: 'tux_config_brown0', action: () => this.showMessage('Custom games need the original options file; the arcade levels are available instead.') },
      { title: 'Main Menu', desc: 'Return to the main menu', icon: 'main0', action: () => this.showMain() },
    ]);
  }

  private showArcade(): void {
    const items: MenuItem[] = ARCADE_NAMES.map((name, i) => ({
      title: name, desc: ['Easiest', 'Easy', 'Moderate', 'Hard', 'Hardest'][i],
      icon: ['tux_helmet_yellow0', 'tux_helmet_green0', 'tux_helmet_blue0', 'tux_helmet_red0', 'tux_helmet_black0'][i],
      action: () => this.startArcade(i),
    }));
    items.push({ title: 'Hall Of Fame', desc: 'High Scores', icon: 'trophy0', action: () => this.showHall(this.arcadeLevel) });
    items.push({ title: 'Main Menu', desc: 'Return to the main menu', icon: 'main0', action: () => this.showMain() });
    this.pushMenu('Play Arcade Game', items);
  }

  private showAcademy(): void {
    const items: MenuItem[] = this.academyLessons.slice(0, 30).map((l) => ({
      title: l.name, desc: 'Training Academy lesson', icon: 'lesson0',
      action: () => this.startAcademy(l.file),
    }));
    items.push({ title: 'Main Menu', desc: 'Return to the main menu', icon: 'main0', action: () => this.showMain() });
    this.pushMenu('Math Command Training Academy', items);
  }

  private showMore(): void {
    this.pushMenu('More Options', [
      { title: 'Demo', desc: 'Run a demo of the game', icon: 'comet0', action: () => this.showMessage('The demo mode is not part of this port yet.') },
      { title: 'Project Info', desc: 'See the project info', icon: 'help0', action: () => this.showMessage('Tux, of Math Command 2.0.3, Tux4Kids, GPL-3.0-or-later. Ported to the browser by freegames.') },
      { title: 'Credits', desc: 'See the credits for the game', icon: 'credits0', action: () => this.showCredits() },
      { title: 'Main Menu', desc: 'Return to the main menu', icon: 'main0', action: () => this.showMain() },
    ]);
  }

  private showHelp(): void {
    this.state = 'help';
  }

  private showCredits(): void {
    this.creditY = 0;
    this.state = 'credits';
    this.audio.music('tuxi.ogg');
  }

  private showMessage(text: string): void {
    this.state = 'message';
    this.messageText = text;
  }

  private messageText = '';

  private showHall(level: number): void {
    this.arcadeLevel = level;
    this.state = 'hall';
  }

  private startArcade(level: number): void {
    const text = rawLesson('arcade', ARCADE_FILES[level]);
    if (!text) { this.showMessage(`The lesson file ${ARCADE_FILES[level]} is missing.`); return; }
    const lesson = parseLesson(text);
    this.arcadeLevel = level;
    this.arcadeGameName = ARCADE_NAMES[level];
    this.arcade = new ArcadeGame(this.c2d, lesson, level, this.res, {
      onEnd: (r) => this.arcadeEnded(r),
      onQuit: () => this.quitArcade(),
    });
    this.state = 'arcade';
    this.arcadeLast = performance.now();
    this.arcadeAcc = 0;
    this.audio.music(['01_rush.ogg', '02_on_the_edge_of_the_universe.ogg', '03_gravity.ogg'][Math.floor(Math.random() * 3)]);
  }

  private startAcademy(file: string): void {
    const text = rawLesson('lessons', file);
    if (!text) { this.showMessage('That lesson file is missing.'); return; }
    const lesson = parseLesson(text);
    this.arcadeGameName = file;
    this.arcade = new ArcadeGame(this.c2d, lesson, 0, this.res, {
      onEnd: (r) => this.arcadeEnded(r, true),
      onQuit: () => this.quitArcade(),
    });
    this.state = 'arcade';
    this.arcadeLast = performance.now();
    this.arcadeAcc = 0;
    this.audio.music(['01_rush.ogg', '02_on_the_edge_of_the_universe.ogg', '03_gravity.ogg'][Math.floor(Math.random() * 3)]);
  }

  private quitArcade(): void {
    this.arcade = null;
    this.showArcade();
  }

  private arcadeEnded(r: { score: number; wave: number; won: boolean }, academy = false): void {
    this.arcade = null;
    this.result = { ...r, level: academy ? -1 : this.arcadeLevel };
    this.audio.music('tuxi.ogg');
    const table = academy ? null : this.highs.tables[this.arcadeLevel];
    const qualifies = !academy && r.score > 0 && (!table || table.length < 10 || r.score > (table[table.length - 1]?.score ?? 0));
    if (qualifies) {
      this.nameFor = { score: r.score, wave: r.wave, level: this.arcadeLevel };
      this.nameEntry = '';
      this.state = 'name';
    } else {
      this.state = 'result';
    }
  }

  private submitName(): void {
    if (!this.nameFor) { this.state = 'result'; return; }
    const n = this.nameEntry.trim().slice(0, 24) || 'Tux';
    const table = this.highs.tables[this.nameFor.level];
    table.push({ name: n, score: this.nameFor.score, wave: this.nameFor.wave });
    table.sort((a, b) => b.score - a.score);
    this.highs.tables[this.nameFor.level] = table.slice(0, 10);
    this.saveHighs();
    this.arcadeLevel = this.nameFor.level;
    this.nameFor = null;
    this.state = 'hall';
  }

  private onKey(e: KeyboardEvent): void {
    if (this.state === 'stopped') return;
    if (this.state === 'standby') { this.showMain(); return; }
    if (this.state === 'arcade') {
      if (!this.arcade) return;
      this.arcade.key(e.key);
      if (['ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', ' ', 'Enter', 'Backspace'].includes(e.key)) e.preventDefault();
      return;
    }
    if (this.state === 'help' || this.state === 'message' || this.state === 'credits') {
      this.state = 'menu';
      return;
    }
    if (this.state === 'result') {
      if (e.key === 'Enter' || e.key === 'Escape') this.showHall(this.result?.level === -1 ? 0 : (this.result?.level ?? 0));
      return;
    }
    if (this.state === 'name') {
      if (e.key === 'Enter') this.submitName();
      else if (e.key === 'Backspace') this.nameEntry = this.nameEntry.slice(0, -1);
      else if (e.key.length === 1 && this.nameEntry.length < 24) this.nameEntry += e.key;
      return;
    }
    if (this.state === 'hall') {
      if (e.key === 'Escape' || e.key === 'Enter') this.showArcade();
      else if (e.key === 'ArrowUp') { this.arcadeLevel = (this.arcadeLevel + 4) % 5; this.audio.play('pop'); }
      else if (e.key === 'ArrowDown') { this.arcadeLevel = (this.arcadeLevel + 1) % 5; this.audio.play('pop'); }
      return;
    }
    if (this.state !== 'menu') return;
    if (e.key === 'ArrowUp') { this.menuIndex = (this.menuIndex + this.menu.length - 1) % this.menu.length; this.audio.play('tock'); }
    else if (e.key === 'ArrowDown') { this.menuIndex = (this.menuIndex + 1) % this.menu.length; this.audio.play('tock'); }
    else if (e.key === 'Enter' || e.key === ' ') { this.audio.play('pop'); this.menu[this.menuIndex]?.action(); }
    else if (e.key === 'Escape') { this.backMenu(); }
  }

  private onClick(x: number, y: number): void {
    if (this.state === 'standby') { this.showMain(); return; }
    if (this.state === 'arcade') { this.arcade?.click(x, y); return; }
    if (this.state === 'help' || this.state === 'message' || this.state === 'credits') { this.state = 'menu'; return; }
    if (this.state === 'result') { this.showHall(this.result?.level === -1 ? 0 : (this.result?.level ?? 0)); return; }
    if (this.state === 'name') { this.submitName(); return; }
    if (this.state !== 'menu') return;
    const index = this.menuRects.findIndex((r) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h);
    if (index >= 0) { this.menuIndex = index; this.audio.play('pop'); this.menu[index].action(); }
  }

  private drawMenuState(): void {
    const ctx = this.c2d;
    const bkg = this.res.images.get('images/title/menu_bkg.jpg');
    if (bkg) ctx.drawImage(bkg, 0, 0, W, H);
    else { ctx.fillStyle = '#0c1c34'; ctx.fillRect(0, 0, W, H); }
    const title = this.res.images.get('images/title/title1.png');
    if (title) ctx.drawImage(title, Math.round((W - title.width) / 2), 8);
    const tux = this.res.images.get('images/tux/bigtux0.png');
    if (tux && this.menu.length) ctx.drawImage(tux, 18, H - tux.height);
    if (this.state === 'menu') {
      this.menuRects.length = 0;
      const startY = 150;
      const rowH = 40;
      for (let i = 0; i < this.menu.length; i++) {
        const y = startY + i * rowH;
        const sel = i === this.menuIndex;
        const icon = this.res.images.get(`images/sprites/${this.menu[i].icon}`);
        if (icon) ctx.drawImage(icon, 190, y + 2, 36, 36);
        ctx.font = `${sel ? 'bold ' : ''}20px ${FONT}`;
        ctx.textAlign = 'left';
        ctx.textBaseline = 'middle';
        ctx.lineWidth = 4;
        ctx.strokeStyle = '#000';
        ctx.strokeText(this.menu[i].title, 236, y + 20);
        ctx.fillStyle = sel ? '#ffe680' : '#fff';
        ctx.fillText(this.menu[i].title, 236, y + 20);
        this.menuRects.push({ x: 180, y, w: 380, h: rowH });
      }
      if (this.menu[this.menuIndex]) {
        ctx.font = `14px ${FONT}`;
        ctx.textAlign = 'center';
        ctx.lineWidth = 3;
        ctx.strokeStyle = '#000';
        const desc = this.menu[this.menuIndex].desc;
        ctx.strokeText(desc, W / 2, H - 18);
        ctx.fillStyle = '#ffe680';
        ctx.fillText(desc, W / 2, H - 18);
      }
      this.centerText(this.menuTitle, 16, '#fff', W / 2, 124);
      return;
    }
    if (this.state === 'hall') this.drawHall();
    else if (this.state === 'help') this.drawHelp();
    else if (this.state === 'credits') this.drawCredits();
    else if (this.state === 'message') this.centerText(this.messageText, 18, '#fff');
    else if (this.state === 'result') this.drawResult();
    else if (this.state === 'name') this.drawName();
  }

  private drawHall(): void {
    const ctx = this.c2d;
    this.centerText(`Hall Of Fame — ${ARCADE_NAMES[this.arcadeLevel]}`, 22, '#ffe680', W / 2, 120);
    const table = this.highs.tables[this.arcadeLevel] ?? [];
    ctx.font = `18px ${FONT}`;
    ctx.textAlign = 'left';
    for (let i = 0; i < 10; i++) {
      const e = table[i];
      const y = 165 + i * 26;
      const line = e ? `${String(i + 1).padStart(2, ' ')}. ${e.name.padEnd(16, ' ')} ${String(e.score).padStart(6, ' ')}` : `${String(i + 1).padStart(2, ' ')}.`;
      ctx.fillStyle = e ? '#fff' : '#ffffff66';
      ctx.fillText(line, 170, y);
    }
    this.centerText('↑/↓ table · Enter back', 13, '#aaa', W / 2, H - 20);
  }

  private drawHelp(): void {
    const lines = [
      'The comets are math problems.',
      'Type the answer and press Enter.',
      'A correct answer zaps every comet with that answer.',
      'Each comet that hits an igloo melts it; two hits destroy it.',
      'Clear all four igloos and the Math Command is over.',
      'Digits 0–9, minus for negative answers, Backspace, Enter.',
      'P pauses; Esc leaves the game.',
      'The waves add comets and speed them up.',
    ];
    this.centerText('Help', 24, '#ffe680', W / 2, 90);
    this.c2d.font = `16px ${FONT}`;
    this.c2d.textAlign = 'left';
    this.c2d.fillStyle = '#fff';
    lines.forEach((l, i) => this.c2d.fillText(l, 90, 150 + i * 28));
    this.centerText('Press any key', 14, '#aaa', W / 2, H - 20);
  }

  private drawCredits(): void {
    const ctx = this.c2d;
    ctx.save();
    ctx.beginPath(); ctx.rect(0, 64, W, H - 128); ctx.clip();
    ctx.font = `20px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.fillStyle = '#fff';
    const lines = [
      '', 'Tux, of Math Command', 'version 2.0.3', '',
      'Tux4Kids', 'Bill Kendrick', 'David Bruce', 'Tim Holy', 'Brendan Luchen', 'Akash Gangil',
      'and the Tux4Kids contributors', '', 'Music: Joseph Toscano and others', '',
      'Ported to the browser by freegames', 'with the original art, sounds and lessons.',
      'GPL-3.0-or-later', '', 'Tux is a trademark of its owners.',
    ];
    lines.forEach((l, i) => ctx.fillText(l, W / 2, 64 + ((i * 28 + this.creditY) % (H + 400))));
    ctx.restore();
    if (this.creditY > 2000) this.creditY = 0;
    this.centerText('Press any key', 14, '#aaa', W / 2, H - 20);
  }

  private drawResult(): void {
    if (!this.result) return;
    this.centerText(this.arcadeGameName || (this.result.won ? 'Mission Accomplished' : 'Game Over'), 24, '#ffe680', W / 2, 110);
    this.centerText(this.result.won ? 'Mission Accomplished' : 'Game Over', 30, this.result.won ? '#8f8' : '#ffe680', W / 2, 150);
    this.c2d.font = `20px ${FONT}`;
    this.c2d.textAlign = 'center';
    this.c2d.fillStyle = '#fff';
    this.c2d.fillText(`Score: ${this.result.score}`, W / 2, 210);
    this.c2d.fillText(`Wave: ${this.result.wave}`, W / 2, 240);
    this.centerText('Press Enter for the Hall Of Fame', 14, '#aaa', W / 2, H - 40);
  }

  private drawName(): void {
    this.centerText('New High Score!', 24, '#ffe680', W / 2, 130);
    this.c2d.font = `20px ${FONT}`;
    this.c2d.textAlign = 'center';
    this.c2d.fillStyle = '#fff';
    this.c2d.fillText(`Score: ${this.nameFor?.score ?? 0}  Wave: ${this.nameFor?.wave ?? 0}`, W / 2, 190);
    this.c2d.fillText('Name:', W / 2, 240);
    this.c2d.fillStyle = '#ffe680';
    this.c2d.fillText(this.nameEntry || '_', W / 2, 280);
    this.centerText('Type a name, Enter to save', 14, '#aaa', W / 2, H - 40);
  }

  private centerText(text: string, size: number, color: string, cx = W / 2, y = H / 2): void {
    const ctx = this.c2d;
    ctx.font = `bold ${size}px ${FONT}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.strokeText(text, cx, y);
    ctx.fillStyle = color;
    ctx.fillText(text, cx, y);
  }

  stop(): void {
    this.state = 'stopped';
    this.audio.stopMusic();
    this.screen.canvas.remove();
  }
}

async function whileNotAborted(ctx: GameContext, p: Promise<unknown>): Promise<void> {
  await Promise.race([p, new Promise<void>((r) => {
    if (ctx.signal.aborted) r();
    else ctx.signal.addEventListener('abort', () => r(), { once: true });
  })]);
}

export const start: StartGame = async (host, ctx) => {
  const game = new TuxMathGame(host, ctx);
  await game.start();
  return { stop: () => game.stop() };
};
