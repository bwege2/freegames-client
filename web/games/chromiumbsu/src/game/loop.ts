// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): src/MainSDL.cpp (the main loop) and
// src/MainSDL_Event.cpp (keys, mouse). One step() is one pass of MainSDL::run's loop: draw (which
// moves the game), the events since the last frame, the held keys, the frame counters and the speed
// adjustment. Time is the original's 50 frames per second: every frame is 20 ms of SDL_GetTicks.
import { MusicGame, MusicMenu } from './audio.ts';
import { Game, HeroDead, LevelOver, Menu, type Global, type Toolkit } from './global.ts';
import * as M from './menu.ts';

const f = Math.fround;

/** SDL key names the game reacts to (SDLK_...) */
export type Key = 'RETURN' | 'SPACE' | 'ESCAPE' | 'UP' | 'DOWN' | 'LEFT' | 'RIGHT' | 'KP_ENTER' | 'KP_PLUS'
  | 'QUOTE' | 'KP1' | 'KP2' | 'KP3' | 'KP4' | 'KP5' | 'KP6' | 'KP7' | 'KP8' | 'KP9' | 'PAUSE' | 'p' | 'q' | 'n'
  | 'g' | '0' | '9' | 'other';

export type InputEvent =
  | { type: 'keydown'; key: Key }
  | { type: 'keyup'; key: Key }
  | { type: 'motion'; dx: number; dy: number }
  | { type: 'buttondown'; button: number; x: number; y: number }
  | { type: 'buttonup'; button: number; x: number; y: number }
  | { type: 'quit' };

/** the browser side of MainSDL: video mode and mouse grab */
export interface Screen {
  setVideoMode(): boolean;
  grabMouse(on: boolean): void;
}

export class MainLoop implements Toolkit {
  /** SDL_GetKeyboardState */
  readonly held = new Set<Key>();
  mouseToggle = false;
  keySpeedX = 0;
  keySpeedY = 0;
  ticks = 0;
  private targetAdj = f(1.0);
  private lastTime = 0;
  private readonly game: Global;
  private readonly screen: Screen;

  constructor(game: Global, screen: Screen) {
    this.game = game;
    this.screen = screen;
    this.mouseToggle = false;
    game.toolkit = this;
    this.setVideoMode();
    game.createGame();
  }

  setVideoMode(): boolean {
    if (!this.screen.setVideoMode()) return false;
    if (this.game.mainGL) this.game.mainGL.initGL();
    return true;
  }

  grabMouse(status: boolean): void {
    this.mouseToggle = status;
    this.screen.grabMouse(status);
  }

  /** draws the frame (MainGL::drawGL, which also moves everything); then endFrame() */
  draw(): void {
    this.game.mainGL.drawGL();
    this.ticks += 20;
  }

  /** the rest of the loop after SDL_GL_SwapWindow: events, held keys, counters; true when done */
  endFrame(events: InputEvent[]): boolean {
    const g = this.game;
    let done = false;
    for (const e of events) done = this.process(e);
    this.keyMove();
    g.frame++;
    if (!(g.gameFrame % 10)) {
      const now = this.ticks;
      if (this.lastTime) g.fps = f((10.0 / (now - this.lastTime)) * 1000.0);
      this.lastTime = now;
      if (g.gameMode !== Menu) {
        if (g.gameFrame < 400) {
          if (g.fps < 48.0 && g.gameSpeed < 1.0) {
            g.gameSpeed = f(g.gameSpeed + 0.02);
          } else if (g.gameFrame > 20) {
            let tmp = f(50.0 / g.fps);
            tmp = f(0.8 * this.targetAdj + 0.2 * tmp);
            this.targetAdj = f(Math.floor(100.0 * (tmp + 0.005)) / 100.0);
          }
        } else if (g.config.autoSpeed() && g.fps > 30.0 && g.fps < 100.0) {
          const tmp = f(50.0 / g.fps);
          if (Math.abs(this.targetAdj - tmp) > 0.1) g.speedAdj = tmp;
          else g.speedAdj = this.targetAdj;
        } else g.speedAdj = this.targetAdj;
      }
    }
    return done;
  }

  private process(e: InputEvent): boolean {
    const g = this.game;
    switch (e.type) {
      case 'keydown': this.keyDown(e.key); break;
      case 'keyup': if (e.key === 'SPACE') g.hero.fireGun(false); break;
      case 'motion':
        if (this.mouseToggle && (e.dx || e.dy)) g.hero.moveEvent(e.dx, e.dy);
        break;
      case 'buttondown':
        if (g.gameMode === Game) {
          if (e.button === 1) g.hero.fireGun(true);
          else if (e.button === 2) g.hero.nextItem();
          else if (e.button === 3) g.hero.useItem();
        } else if (g.gameMode === HeroDead) g.menu.keyHit(M.KeyEnter);
        break;
      case 'buttonup':
        if (g.gameMode === Menu) g.menu.mousePress(e.button - 1, e.x, e.y);
        else if (e.button === 1) g.hero.fireGun(false);
        break;
      case 'quit':
        return true;
    }
    return g.gameQuit;
  }

  private keyDown(key: Key): void {
    const g = this.game;
    switch (key) {
      case 'q':
        g.gameQuit = true;
        return;
      case 'g':
        this.grabMouse(!this.mouseToggle);
        return;
      case '0':
        g.hero.useItemIndex(0);
        return;
      case '9':
        g.hero.useItemIndex(1);
        return;
      case 'ESCAPE':
        if (g.gameMode === Menu) {
          g.gameMode = Game;
          g.audio.setMusicMode(MusicGame);
          this.grabMouse(!g.gamePause);
        } else {
          if (g.gameMode !== Game) g.newGame();
          g.gameMode = Menu;
          g.menu.startMenu();
          g.audio.setMusicMode(MusicMenu);
          this.grabMouse(false);
        }
        return;
    }
    if (g.gameMode === Game) this.keyDownGame(key);
    else if (g.gameMode === LevelOver) {
      g.gotoNextLevel();
      g.gameMode = Game;
      g.audio.setMusicMode(MusicGame);
    } else if (g.gameMode === HeroDead) {
      g.gameMode = Game;
      g.newGame();
      this.grabMouse(true);
      g.audio.setMusicMode(MusicGame);
    } else {
      let k: number;
      switch (key) {
        case 'KP9': case 'KP7': case 'KP8': case 'UP': k = M.KeyUp; break;
        case 'KP1': case 'KP3': case 'KP2': case 'DOWN': k = M.KeyDown; break;
        case 'KP4': case 'LEFT': k = M.KeyLeft; break;
        case 'KP6': case 'RIGHT': k = M.KeyRight; break;
        case 'KP_ENTER': case 'RETURN': k = M.KeyEnter; break;
        case 'KP5': return;
        default: k = M.KeyEnter; break;
      }
      g.menu.keyHit(k);
    }
  }

  private keyDownGame(key: Key): void {
    const g = this.game;
    switch (key) {
      case 'KP_PLUS': case 'QUOTE': g.hero.nextItem(); break;
      case 'KP_ENTER': case 'RETURN': g.hero.useItem(); break;
      case 'PAUSE': case 'p':
        this.grabMouse(g.gamePause);
        g.gamePause = !g.gamePause;
        g.audio.pauseGameMusic(g.gamePause);
        break;
      case 'n': g.audio.nextMusicIndex(); break;
      case 'KP7': this.keySpeedX = f(this.keySpeedX - 5.0); this.keySpeedY = f(this.keySpeedY - 5.0); break;
      case 'KP9': this.keySpeedX = f(this.keySpeedX + 5.0); this.keySpeedY = f(this.keySpeedY - 5.0); break;
      case 'KP3': this.keySpeedX = f(this.keySpeedX + 5.0); this.keySpeedY = f(this.keySpeedY + 5.0); break;
      case 'KP1': this.keySpeedX = f(this.keySpeedX - 5.0); this.keySpeedY = f(this.keySpeedY + 5.0); break;
      case 'KP4': case 'LEFT': this.keySpeedX = f(this.keySpeedX - 5.0); break;
      case 'KP6': case 'RIGHT': this.keySpeedX = f(this.keySpeedX + 5.0); break;
      case 'KP8': case 'UP': this.keySpeedY = f(this.keySpeedY - 5.0); break;
      case 'KP2': case 'DOWN': this.keySpeedY = f(this.keySpeedY + 5.0); break;
      case 'SPACE': g.hero.fireGun(true); break;
      default: break;
    }
  }

  private keyMove(): void {
    const g = this.game;
    if (g.gameMode !== Game) return;
    const h = this.held;
    const dx = (sign: number) => { this.keySpeedX = f(this.keySpeedX + sign * (2.0 + Math.abs(this.keySpeedX) * 0.4)); };
    const dy = (sign: number) => { this.keySpeedY = f(this.keySpeedY + sign * (2.0 + Math.abs(this.keySpeedY) * 0.4)); };
    if (h.has('LEFT') || h.has('KP4')) dx(-1);
    if (h.has('RIGHT') || h.has('KP6')) dx(1);
    if (h.has('UP') || h.has('KP8')) dy(-1);
    if (h.has('DOWN') || h.has('KP2')) dy(1);
    if (h.has('KP7')) { dx(-1); dy(-1); }
    if (h.has('KP9')) { dx(1); dy(-1); }
    if (h.has('KP3')) { dx(1); dy(1); }
    if (h.has('KP1')) { dx(-1); dy(1); }
    const s = f(0.7);
    this.keySpeedX = f(this.keySpeedX * s);
    this.keySpeedY = f(this.keySpeedY * s);
    g.hero.moveEvent(Math.trunc(this.keySpeedX), Math.trunc(this.keySpeedY));
  }
}
