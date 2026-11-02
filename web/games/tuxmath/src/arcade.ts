// The arcade game of Tux, of Math Command 2.0.3, from src/game.c: comets carrying math problems fall
// on four cities (igloos by default), Tux zaps them when the player types the answer, waves get
// faster and add comets, and the game is over when the last city is gone. The sprites, sounds and
// timings are the original's. Penguins, steam, bonus comets, power-ups and the smart bomb are not
// part of this first port (see README).
import { generateList, type Card, type LessonOptions } from './math.ts';

export const W = 640;
export const H = 480;
export const FPS = 15;

export interface Resources {
  img(path: string): HTMLImageElement;
  font: string;
  sound(name: string): void;
}

export interface ArcadeCallbacks {
  onEnd(result: { score: number; wave: number; won: boolean }): void;
  onQuit(): void;
}

type CityStatus = 'present' | 'exploding' | 'evaporating' | 'gone';

interface City {
  x: number;
  hits: number;
  status: CityStatus;
  counter: number;
}

interface Comet {
  alive: boolean;
  expl: number; // -1: falling, >=0: explosion frame counter
  city: number;
  x: number;
  y: number;
  card: Card;
}

const NUM_CITIES = 4;
const IGLOO_SWITCH_START = 8;
const EVAPORATING_COUNTER_START = 100;
const GAMEOVER_COUNTER_START = 40;
const LEVEL_START_WAIT_START = 20;
const LASER_START = 5;
const ANIM_FRAME_START = 8;

export class ArcadeGame {
  private readonly ctx: CanvasRenderingContext2D;
  private readonly lesson: LessonOptions;
  private readonly level: number;
  private readonly res: Resources;
  private readonly cb: ArcadeCallbacks;
  private readonly random: () => number;

  private cards: Card[] = [];
  private cities: City[] = [];
  private comets: Comet[] = [];
  private score = 0;
  private wave = 1;
  private speed = 1;
  private numAttackers = 2;
  private prevWaveComets = 2;
  private levelStartWait = LEVEL_START_WAIT_START;
  private frame = 0;
  private gameoverCounter = -1;
  private gameOver = false;
  private won = false;
  private paused = false;
  private typed: number[] = [0, 0, 0];
  private negative = false;
  private tuxImage = 'tux/tux-sit.png';
  private tuxTimer = 0;
  private tuxFrame = 0;
  private laser: { alive: number; x1: number; y1: number; x2: number; y2: number }[] = [];
  private message = '';
  private messageTimer = 0;
  private background = 0;
  private penguinFrame = 0;
  private prevCity = -1;

  constructor(ctx: CanvasRenderingContext2D, lesson: LessonOptions, level: number, res: Resources,
    cb: ArcadeCallbacks, random: () => number = Math.random) {
    this.ctx = ctx;
    this.lesson = lesson;
    this.level = level;
    this.res = res;
    this.cb = cb;
    this.random = random;
    this.reset();
  }

  private reset(): void {
    this.score = 0;
    this.wave = 1;
    this.speed = this.lesson.speed;
    this.numAttackers = this.prevWaveComets = this.lesson.startingComets;
    this.levelStartWait = LEVEL_START_WAIT_START;
    this.frame = 0;
    this.gameoverCounter = -1;
    this.gameOver = false;
    this.won = false;
    this.paused = false;
    this.typed = [0, 0, 0];
    this.negative = false;
    this.laser = [];
    this.message = `Wave ${this.wave}`;
    this.messageTimer = LEVEL_START_WAIT_START;
    this.background = Math.floor(this.random() * 8);
    this.cards = [];
    this.comets = [];
    const igloo = this.res.img('images/igloos/intact.png');
    for (let i = 0; i < NUM_CITIES; i++) {
      const x = i < NUM_CITIES / 2
        ? (W / (NUM_CITIES + 1)) * i + igloo.width / 2
        : W - ((W / (NUM_CITIES + 1)) * (i - NUM_CITIES / 2) + igloo.width / 2);
      this.cities.push({ x, hits: 2, status: 'present', counter: 0 });
    }
    this.setTux('tux/tux-relax1.png');
  }

  private setTux(path: string, frames = 0): void {
    this.tuxImage = path;
    this.tuxFrame = frames;
    this.tuxTimer = frames;
  }

  private nextCard(): Card | null {
    for (;;) {
      if (!this.cards.length) this.cards = generateList(this.lesson, this.random);
      const card = this.cards.shift();
      if (!card) return null;
      // add_comet() refuses cards whose answer is outside -999..999
      if (Math.abs(card.answer) <= 999) return card;
    }
  }

  private cityAlive(): number {
    return this.cities.filter((c) => c.hits > 0).length;
  }

  private numCometsAlive(): number { return this.comets.filter((c) => c.alive).length; }

  private addComet(): boolean {
    // add_comet() waits until every live comet is at least 1.5 number-heights down
    const spacing = this.res.img('images/status/numbers.png').height * 1.5;
    if (this.comets.some((c) => c.alive && c.y < spacing)) return false;
    let slot = this.comets.findIndex((c) => !c.alive);
    if (slot < 0) {
      if (this.comets.length >= Math.max(1, this.lesson.maxComets)) return false;
      slot = this.comets.length;
      this.comets.push({ alive: false, expl: -1, city: 0, x: 0, y: 0, card: { formula: '', answer: 0, difficulty: 1 } });
    }
    const card = this.nextCard();
    if (!card) return false;
    // the original never picks the same city twice in a row
    let city = Math.floor(this.random() * NUM_CITIES);
    while (city === this.prevCity) city = Math.floor(this.random() * NUM_CITIES);
    this.prevCity = city;
    const c = this.comets[slot];
    c.alive = true;
    c.expl = -1;
    c.city = city;
    c.x = this.cities[city].x;
    c.y = 0;
    c.card = card;
    return true;
  }

  private resetLevel(): void {
    this.wave++;
    this.prevWaveComets = this.prevWaveComets + this.lesson.extraCometsPerWave;
    if (this.prevWaveComets > this.lesson.maxComets) this.prevWaveComets = this.lesson.maxComets;
    if (this.lesson.allowSpeedup) this.speed = Math.min(this.lesson.maxSpeed, this.speed * this.lesson.speedupFactor);
    this.numAttackers = this.prevWaveComets;
    this.levelStartWait = LEVEL_START_WAIT_START;
    this.message = `Wave ${this.wave}`;
    this.messageTimer = LEVEL_START_WAIT_START;
    this.background = (this.background + 1 + Math.floor(this.random() * 7)) % 8;
    this.typed = [0, 0, 0];
    this.negative = false;
  }

  /** One frame of the original's 15 fps loop. */
  update(): void {
    if (this.paused || this.gameOver) return;
    this.frame++;
    if (this.penguinFrame >= 0) this.penguinFrame++;
    if (this.messageTimer > 0) this.messageTimer--;
    if (this.levelStartWait > 0) this.levelStartWait--;
    if (this.tuxTimer > 0) {
      this.tuxTimer--;
      if (this.tuxTimer === 0 && this.tuxFrame > 0) this.setTux('tux/tux-sit.png');
    }

    // pandas? no: comets
    for (const c of this.comets) {
      if (!c.alive) continue;
      if (c.expl < 0) {
        c.y += this.speed;
        if (c.y >= H - this.res.img('images/cities/city-blue.png').height) {
          c.expl = 0;
          this.cityHit(c.city);
        }
      } else {
        c.expl++;
        if (c.expl >= 8) { c.alive = false; c.expl = -1; }
      }
    }

    // cities
    for (const c of this.cities) {
      if (c.status === 'exploding') {
        c.counter--;
        if (c.counter <= 0) c.status = c.hits > 0 ? 'present' : 'evaporating';
        if (c.status === 'evaporating') c.counter = EVAPORATING_COUNTER_START;
      } else if (c.status === 'evaporating') {
        c.counter--;
        if (c.counter <= 0) c.status = 'gone';
      }
    }

    if (this.levelStartWait <= 0) {
      if (this.numAttackers > 0) {
        if (this.addComet()) this.numAttackers--;
      } else if (this.numCometsAlive() === 0 && this.levelStartWait <= 0) {
        if (this.lesson.playThroughList && this.cards.length === 0) {
          this.finish(true);
          return;
        }
        this.resetLevel();
      }
    }

    // laser fade
    for (const l of this.laser) if (l.alive > 0) l.alive--;

    if (!this.cityAlive() && this.gameoverCounter < 0) this.gameoverCounter = GAMEOVER_COUNTER_START;
    if (this.gameoverCounter > 0) {
      this.gameoverCounter--;
      if (this.gameoverCounter === 0) this.finish(false);
    }
  }

  private cityHit(index: number): void {
    const city = this.cities[index];
    if (city.hits > 0) {
      city.hits--;
      city.status = 'exploding';
      city.counter = IGLOO_SWITCH_START;
      this.res.sound(city.hits > 0 ? 'sizzling' : 'explosion');
      this.setTux('tux/tux-fist1.png', ANIM_FRAME_START);
    }
  }

  private finish(won: boolean): void {
    if (this.gameOver) return;
    this.gameOver = true;
    this.won = won;
    this.cb.onEnd({ score: this.score, wave: this.wave, won });
  }

  private typedString(): string {
    let i = 0;
    while (i < this.typed.length - 1 && this.typed[i] === 0) i++;
    let s = '';
    for (; i < this.typed.length; i++) s += String(this.typed[i]);
    return (this.negative ? '-' : '') + s;
  }

  private submit(): void {
    const answer = this.typedString();
    const hit: number[] = [];
    this.comets.forEach((c, i) => {
      if (c.alive && c.expl < 0 && String(c.card.answer) === answer) hit.push(i);
    });
    if (hit.length) {
      for (const i of hit) {
        const c = this.comets[i];
        c.expl = 0;
        this.score += Math.floor(25 * c.card.difficulty * (H - c.y + 1) / H);
        this.laser.push({ alive: LASER_START, x1: W / 2, y1: H, x2: c.x, y2: c.y });
      }
      this.res.sound('laser');
      this.res.sound('sizzling');
      if (hit.length > 1) { this.res.sound('cheer'); this.setTux('tux/tux-yes1.png', ANIM_FRAME_START); }
      else this.setTux(this.random() < 0.5 ? 'tux/tux-yes1.png' : 'tux/tux-yay1.png', ANIM_FRAME_START);
    } else {
      this.laser.push({ alive: LASER_START, x1: W / 2, y1: H, x2: W / 2, y2: 0 });
      this.res.sound('laser');
      this.res.sound('buzz');
      this.setTux(this.random() < 0.5 ? 'tux/tux-drat.png' : 'tux/tux-yipe.png');
    }
    this.typed = [0, 0, 0];
    this.negative = false;
  }

  key(key: string): void {
    if (this.gameOver) return;
    if (key === 'Escape') { this.cb.onQuit(); return; }
    if (key === 'p' || key === 'P') { this.paused = !this.paused; return; }
    if (this.paused) { this.paused = false; return; }
    if (key === 'Enter') { this.submit(); return; }
    if (key === 'Backspace') {
      this.typed = [0, this.typed[0], this.typed[1]];
      return;
    }
    if (key === '-' && this.lesson.allowNegatives) { this.negative = !this.negative; return; }
    if (/^[0-9]$/.test(key)) {
      this.typed = [this.typed[1], this.typed[2], Number(key)];
    }
  }

  /** A click on the stop button in the top right corner. */
  click(x: number, y: number): void {
    const stop = this.res.img('images/status/stop.png');
    if (x >= W - stop.width && y <= stop.height) this.cb.onQuit();
  }

  draw(): void {
    const ctx = this.ctx;
    ctx.imageSmoothingEnabled = false;
    // background
    if (this.lesson.useBkgd) {
      const b = this.res.img(`images/backgrounds/${this.background}.jpg`);
      ctx.drawImage(b, 0, 0, W, H);
    } else {
      ctx.fillStyle = '#203040';
      ctx.fillRect(0, 0, W, H);
    }
    this.drawMisc();
    this.drawCities();
    this.drawComets();
    for (const l of this.laser) {
      if (l.alive > 0) {
        ctx.strokeStyle = `rgba(255,${Math.floor(192 * l.alive / LASER_START)},64,${l.alive / LASER_START})`;
        ctx.lineWidth = 3;
        ctx.beginPath(); ctx.moveTo(l.x1, l.y1); ctx.lineTo(l.x2, l.y2); ctx.stroke();
      }
    }
    this.drawConsole();
    this.drawMessages();
    if (this.paused) this.centerText('PAUSED', 30, '#ffe680');
    if (this.gameOver) this.centerText(this.won ? 'MISSION ACCOMPLISHED' : 'GAME OVER', 34, this.won ? '#8f8' : '#f88');
  }

  private drawMisc(): void {
    const ctx = this.ctx;
    const wave = this.res.img('images/status/wave.png');
    const score = this.res.img('images/status/score.png');
    const stop = this.res.img('images/status/stop.png');
    const nums = this.res.img('images/status/numbers.png');
    const digitW = nums.width / 10;
    ctx.drawImage(wave, 0, 0);
    this.drawNumber(String(this.wave), wave.width + digitW, 0);
    const sx = W - digitW * 7 - score.width - stop.width - 5;
    ctx.drawImage(score, sx, 0);
    this.drawNumber(String(this.score).padStart(6, '0'), W - digitW * 6 - stop.width - 5, 0);
    ctx.drawImage(stop, W - stop.width, 0);
    // extra life progress (bonus comets): omitted; keep the layout without it
  }

  private drawNumber(text: string, x: number, y: number): void {
    const nums = this.res.img('images/status/numbers.png');
    const w = nums.width / 10;
    for (let i = 0; i < text.length; i++) {
      const d = text.charCodeAt(i) - 48;
      if (d >= 0 && d <= 9) this.ctx.drawImage(nums, d * w, 0, w, nums.height, x + i * w, y, w, nums.height);
    }
  }

  private drawCities(): void {
    const ctx = this.ctx;
    const iglooOffset = this.res.img('images/cities/city-blue.png').height - this.res.img('images/igloos/intact.png').height;
    for (const city of this.cities) {
      let path = 'images/igloos/intact.png';
      if (city.status === 'evaporating') path = city.hits >= 1 ? 'images/igloos/half.png' : 'images/igloos/melted1.png';
      else if (city.hits === 1) path = 'images/igloos/half.png';
      else if (city.hits === 0) path = 'images/igloos/melted1.png';
      if (city.status === 'gone') continue;
      const img = this.res.img(path);
      ctx.drawImage(img, Math.round(city.x - img.width / 2), H - img.height - iglooOffset);
      // a penguin beside each igloo
      const pen = this.res.img(this.penguinFrame % 20 < 2 ? 'images/penguins/flapup.png' : 'images/penguins/flapdown.png');
      ctx.drawImage(pen, Math.round(city.x - pen.width / 2), Math.round(H - 5 * pen.height / 4 - iglooOffset));
    }
  }

  private drawComets(): void {
    const ctx = this.ctx;
    const nums = this.res.img('images/status/numbers.png');
    for (const c of this.comets) {
      if (!c.alive) continue;
      if (c.expl < 0) {
        const frame = (this.frame + c.city) % 3;
        const img = this.res.img(`images/comets/comet${frame}.png`);
        ctx.drawImage(img, Math.round(c.x - img.width / 2), Math.round(c.y - img.height));
        this.outlinedText(c.card.formula, c.x, c.y - img.height - 8, 24, '#fff');
      } else {
        const img = this.res.img(`images/comets/cometex${Math.min(3, Math.floor(c.expl / 2))}.png`);
        ctx.drawImage(img, Math.round(c.x - img.width / 2), Math.round(c.y - img.height));
        this.outlinedText(String(c.card.answer), c.x, c.y - img.height - 8, 24, '#fff');
      }
    }
    void nums;
  }

  private outlinedText(text: string, cx: number, baseline: number, size: number, color: string): void {
    const ctx = this.ctx;
    ctx.font = `bold ${size}px ${this.res.font}`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'alphabetic';
    ctx.lineWidth = 4;
    ctx.strokeStyle = '#000';
    ctx.strokeText(text, cx, baseline);
    ctx.fillStyle = color;
    ctx.fillText(text, cx, baseline);
  }

  private drawConsole(): void {
    const ctx = this.ctx;
    const consoleImg = this.res.img('images/tux/console_led.png');
    const x = Math.round((W - consoleImg.width) / 2);
    const y = H - consoleImg.height;
    ctx.drawImage(consoleImg, x, y);
    const led = this.res.img('images/status/lednums.png');
    const ledW = led.width / 10;
    const slots = this.lesson.allowNegatives ? 4 : 3;
    let dx = (W - ledW * slots) / 2;
    const dy = y + 4;
    if (this.lesson.allowNegatives) {
      const minus = this.res.img('images/status/led_neg_sign.png');
      ctx.drawImage(minus, this.negative ? minus.width / 2 : 0, 0, minus.width / 2, minus.height, dx, dy, minus.width / 2, minus.height);
      dx += minus.width / 2;
    }
    for (const d of this.typed) {
      ctx.drawImage(led, d * ledW, 0, ledW, led.height, dx, dy, ledW, led.height);
      dx += ledW;
    }
    const tux = this.res.img(`images/${this.tuxImage}`);
    ctx.drawImage(tux, Math.round((W - tux.width) / 2), H - tux.height);
  }

  private drawMessages(): void {
    if (this.messageTimer > 0 && this.message) this.centerText(this.message, 28, '#ffe680');
  }

  private centerText(text: string, size: number, color: string): void {
    this.outlinedText(text, W / 2, H / 2, size, color);
  }

  get levelIndex(): number { return this.level; }
  get currentScore(): number { return this.score; }
  get currentWave(): number { return this.wave; }
  get isOver(): boolean { return this.gameOver; }
}
