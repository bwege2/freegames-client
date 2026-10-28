// biniax.c (game version 1.2, "Biniax-Classic"): the field, the player, the moves, the scrolling, the
// menu, the session, and the files autosave.bnx / hiscore.bnx in the original's binary layout.
// The original's loops (mainMenu, gameSession) are steps here: one step is one pass of its loop.
import { GlibcRand } from './glibcRand.ts';
import { Input } from './inp.ts';
import type { Gfx } from './gfx.ts';

export const GRID_X = 5, GRID_Y = 7;
export const MAX_ELEMENTS = 4;
const INIT_LINES = 3;
/** ms per game step */
export const DELTA_TIME = 60;
export const MAX_SCROLL = 70, MIN_SCROLL = 18;
const SCORE_STEP = 10;
export const SHAKE_AFTER = 8;
const MAX_SPEED_SCORE = 5000;

export const TEXT_INGAME_SCORE = 0, TEXT_GAME_OVER = 1, TEXT_BEST_SCORE = 2;
export const OPTION_CONTINUE = 0, OPTION_NEW = 1, OPTION_QUIT = 2, MAX_OPTIONS = 3;
export const SND_NONE = 0, SND_TAKE = 1, SND_FAIL = 2, SND_SCROLL = 3, SND_SHAKE = 4, SND_LAST = 5;
const soundMask = (i: number) => 1 << i;

/** BNX_GAME */
export interface GameState {
  player: { x: number; y: number; e: number };
  /** grid[x][y], pairs as (left << 4) | right; 0 = empty; row 0 is the bottom */
  grid: number[][];
  score: number;
  best: number;
  scroll: number;
  speed: number;
  ingame: boolean;
  sounds: number;
  message: number;
}

export const pairLeft = (p: number) => p >> 4;
export const pairRight = (p: number) => p & 0xf;

/** The game's files, as the original wrote them next to the program. */
export interface Files {
  read(name: string): Uint8Array | null;
  write(name: string, data: Uint8Array): void;
}

export class Biniax {
  readonly game: GameState = {
    player: { x: 0, y: 0, e: 0 }, grid: Array.from({ length: GRID_X }, () => new Array<number>(GRID_Y).fill(0)),
    score: 0, best: 0, scroll: 0, speed: 0, ingame: false, sounds: 0, message: 0,
  };
  readonly input = new Input();
  private readonly rand: GlibcRand;
  private readonly gfx: Gfx;
  private readonly files: Files;
  /** mainMenu()'s option */
  private option = 0;
  /** where main() is: the menu, a session, or gone (Quit) */
  state: 'menu' | 'game' | 'quit' = 'menu';

  /** sysInit(): srand( sysGetTime() ) */
  constructor(gfx: Gfx, files: Files, seed: number) {
    this.gfx = gfx;
    this.files = files;
    this.rand = new GlibcRand(seed >>> 0);
  }

  /** sysRand( max ): rand() % max */
  sysRand(max: number): number {
    return this.rand.next() % max;
  }

  // ------------------------------------------------------------------ game init

  initGame(): void {
    this.initPlayer();
    this.initGrid(INIT_LINES);
    const g = this.game;
    g.ingame = true;
    g.score = 0;
    g.scroll = MAX_SCROLL;
    g.speed = MAX_SCROLL;
    g.message = TEXT_INGAME_SCORE;
  }

  private initPlayer(): void {
    const p = this.game.player;
    p.x = 0;
    p.y = 0;
    p.e = this.sysRand(MAX_ELEMENTS);
  }

  private initGrid(lines: number): void {
    for (let y = 0; y < GRID_Y; ++y) for (let x = 0; x < GRID_X; ++x) this.game.grid[x][y] = 0;
    for (let y = 0; y < lines; ++y) this.scrollDown();
  }

  private initPair(maxel: number): number {
    const left = this.sysRand(maxel);
    let right: number;
    do right = this.sysRand(maxel); while (left === right);
    return (left << 4) | right;
  }

  private initLine(line: number): void {
    for (let x = 0; x < GRID_X; ++x) this.game.grid[x][line] = this.initPair(MAX_ELEMENTS);
    this.game.grid[this.sysRand(GRID_X)][line] = 0;
  }

  /** The field moves down one row; false if that ends the game. */
  private scrollDown(): boolean {
    const g = this.game;
    let ingame = true;
    for (let y = 0; y < GRID_Y - 1; ++y) for (let x = 0; x < GRID_X; ++x) g.grid[x][y] = g.grid[x][y + 1];
    this.initLine(GRID_Y - 1);
    if (g.ingame) {
      if (g.player.y > 0) g.player.y--;
      else if (!this.takePair(g.player.x, g.player.y)) {
        g.player.y--;
        ingame = false;
      }
    }
    return ingame;
  }

  // ------------------------------------------------------------------ actions

  private takePair(x: number, y: number): boolean {
    const g = this.game;
    const pair = g.grid[x][y];
    if (pair === 0) return true;
    let cantake: boolean;
    if (pairLeft(pair) === g.player.e) {
      g.player.e = pairRight(pair);
      cantake = true;
    } else if (pairRight(pair) === g.player.e) {
      g.player.e = pairLeft(pair);
      cantake = true;
    } else cantake = false;
    if (cantake) {
      g.grid[x][y] = 0;
      g.score += SCORE_STEP;
    }
    return cantake;
  }

  private move(dx: number, dy: number): boolean {
    const p = this.game.player;
    const nx = p.x + dx, ny = p.y + dy;
    if (nx < 0 || nx >= GRID_X || ny < 0 || ny >= GRID_Y) return false;
    if (!this.takePair(nx, ny)) return false;
    p.x = nx;
    p.y = ny;
    return true;
  }

  private correctSpeed(): void {
    const g = this.game;
    const scrollRange = MAX_SCROLL - MIN_SCROLL;
    const speedIndex = Math.trunc((scrollRange << 8) / MAX_SPEED_SCORE);
    g.speed = g.score < MAX_SPEED_SCORE ? MAX_SCROLL - ((g.score * speedIndex) >> 8) : MIN_SCROLL;
  }

  // ------------------------------------------------------------------ main(), mainMenu(), gameSession()

  /** One pass of mainMenu()'s loop; when A is pressed, main()'s switch starts the session or quits. */
  menuStep(): void {
    const g = this.game, inp = this.input;
    inp.update();
    if (inp.take('left') || inp.take('up')) {
      this.option = (this.option + MAX_OPTIONS - 1) % MAX_OPTIONS;
      g.sounds |= soundMask(SND_FAIL);
    } else if (inp.take('right') || inp.take('down')) {
      this.option = (this.option + 1) % MAX_OPTIONS;
      g.sounds |= soundMask(SND_FAIL);
    }
    this.gfx.renderMenu(this.option);
    this.gfx.update();
    this.gfx.playSounds(g);
    if (!inp.take('a')) return;
    // main()'s switch
    switch (this.option) {
      case OPTION_CONTINUE:
        if (!this.loadGame()) this.initGame();
        this.loadHiScore();
        break;
      case OPTION_NEW:
        this.initGame();
        this.loadHiScore();
        break;
      case OPTION_QUIT:
        this.state = 'quit';
        return;
    }
    this.state = 'game';
  }

  /** One pass of gameSession()'s loop (every 60 ms); at its end the session saves and the menu returns. */
  gameStep(): void {
    const g = this.game, inp = this.input;
    let bgameSes = true, bautoSave = true;
    let flagTake = false, flagMove = true;
    inp.update();
    if (inp.take('a') || inp.take('b')) {
      bgameSes = false;
      bautoSave = g.ingame;
    }
    if (g.ingame) {
      const prevScore = g.score;
      if (inp.take('left')) flagTake = this.move(-1, 0);
      else if (inp.take('right')) flagTake = this.move(1, 0);
      else if (inp.take('up')) flagTake = this.move(0, 1);
      else if (inp.take('down')) flagTake = this.move(0, -1);
      else flagMove = false;
      g.sounds = SND_NONE;
      if (flagMove && flagTake) {
        if (prevScore < g.score) g.sounds |= soundMask(SND_TAKE);
      } else if (flagMove && !flagTake) {
        g.sounds |= soundMask(SND_FAIL);
      }
    }
    // the shake starts (not *played* at high speed)
    if (g.scroll === SHAKE_AFTER && g.score < MAX_SPEED_SCORE) g.sounds |= soundMask(SND_SHAKE);
    // move the field and detect the game over
    if (g.ingame && --g.scroll <= 0) {
      const prevIngame = g.ingame;
      g.ingame = this.scrollDown();
      if (prevIngame && !g.ingame) {
        if (g.best < g.score) {
          g.best = g.score;
          g.message = TEXT_BEST_SCORE;
          this.saveHiScore();
        } else {
          g.message = TEXT_GAME_OVER;
        }
      }
      g.sounds |= soundMask(SND_SCROLL);
      g.scroll = g.speed;
      this.correctSpeed();
    }
    this.gfx.renderGame(g, (max) => this.sysRand(max));
    this.gfx.update();
    this.gfx.playSounds(g);
    if (bgameSes) return;
    if (bautoSave) this.saveGame();
    this.state = 'menu';
    this.option = 0; // mainMenu() starts at its first option every time
  }

  /**
   * The player leaves the website during a game: saved as Escape would (then Quit). The original had
   * no other way out, so this is the browser's (README).
   */
  leave(): void {
    if (this.state === 'game' && this.game.ingame) this.saveGame();
    this.state = 'quit';
  }

  // ------------------------------------------------------------------ files (the original's binary layout)

  /** BNX_GAME as fwrite() wrote it (x86, 64 bytes with padding) */
  static encodeGame(g: GameState): Uint8Array {
    const b = new Uint8Array(64);
    const v = new DataView(b.buffer);
    v.setInt8(0, g.player.x);
    v.setInt8(1, g.player.y);
    v.setInt8(2, g.player.e);
    for (let x = 0; x < GRID_X; x++) for (let y = 0; y < GRID_Y; y++) b[3 + x * GRID_Y + y] = g.grid[x][y];
    v.setInt32(40, g.score, true);
    v.setInt32(44, g.best, true);
    v.setInt16(48, g.scroll, true);
    v.setInt16(50, g.speed, true);
    v.setInt8(52, g.ingame ? 1 : 0);
    v.setUint32(56, g.sounds, true);
    v.setUint8(60, g.message);
    return b;
  }

  static decodeGame(b: Uint8Array, g: GameState): void {
    const v = new DataView(b.buffer, b.byteOffset, b.byteLength);
    g.player.x = v.getInt8(0);
    g.player.y = v.getInt8(1);
    g.player.e = v.getInt8(2);
    for (let x = 0; x < GRID_X; x++) for (let y = 0; y < GRID_Y; y++) g.grid[x][y] = b[3 + x * GRID_Y + y];
    g.score = v.getInt32(40, true);
    g.best = v.getInt32(44, true);
    g.scroll = v.getInt16(48, true);
    g.speed = v.getInt16(50, true);
    g.ingame = v.getInt8(52) !== 0;
    g.sounds = v.getUint32(56, true);
    g.message = v.getUint8(60);
  }

  private saveGame(): void {
    this.files.write('autosave.bnx', Biniax.encodeGame(this.game));
  }

  private loadGame(): boolean {
    const f = this.files.read('autosave.bnx');
    if (!f) return false;
    // fread of a short file fills only what it has
    const full = new Uint8Array(64);
    full.set(Biniax.encodeGame(this.game));
    full.set(f.subarray(0, 64));
    Biniax.decodeGame(full, this.game);
    return true;
  }

  private saveHiScore(): void {
    const b = new Uint8Array(8);
    const v = new DataView(b.buffer);
    v.setInt32(0, this.game.best, true);
    v.setInt32(4, this.game.best + 1, true); // the check value
    this.files.write('hiscore.bnx', b);
  }

  private loadHiScore(): boolean {
    this.game.best = 0;
    const f = this.files.read('hiscore.bnx');
    if (!f || f.length < 8) return false;
    const v = new DataView(f.buffer, f.byteOffset, f.byteLength);
    this.game.best = v.getInt32(0, true);
    if (v.getInt32(4, true) - 1 !== this.game.best) {
      this.game.best = 0;
      return false;
    }
    return true;
  }
}
