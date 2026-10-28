// desktop/gfx.c and snd.c: what is drawn where (640x480, the original's coordinates), and which sounds
// start. Drawing goes through a Surface (a framebuffer in the browser, a recorder in the tests), so the
// tests can compare every blit with what the original did.
import { GRID_X, GRID_Y, SHAKE_AFTER, SND_LAST, SND_NONE, TEXT_BEST_SCORE, TEXT_GAME_OVER, TEXT_INGAME_SCORE, pairLeft, pairRight, type GameState } from './game.ts';

export const SCREEN_X = 640, SCREEN_Y = 480;
const ZERO_X = 16, ZERO_Y = 424;
const NEXT_PLUS_X = 48, SHIELD_PLUS_X = 39, PAIR_PLUS_X = 128, PAIR_PLUS_Y = -64, PLAYER_PLUS_X = 24;
const FONT_SIZE_X = 16, FONT_SIZE_Y = 20, FONT_TILE_X = 14;
const INFO_BAR = 30, SPRAY_SIZE = 5, SPRAY = 300;
const SCORE_X = 4, SCORE_Y = 4, BEST_X = 290, BEST_Y = 4, OPTION_X = 220, OPTION_Y = 300;
const GAMEOVER_X = 150, GAMEOVER_Y = 210;
const SHAKE = 3, CURSORS = 2, CURSOR_SPEED = 3;

/** The images of data/, by file name without .bmp. */
export type ImageName = 'background' | 'splash' | 'gameover' | 'option0' | 'option1' | 'option2' | 'element0' | 'element1'
  | 'element2' | 'element3' | 'shield' | 'cursor0' | 'cursor1' | 'font';

/** SDL's screen as the original used it. */
export interface Surface {
  size(img: ImageName): { w: number; h: number };
  /** SDL_BlitSurface( img, src (null = all), screen, at x,y ) */
  blit(img: ImageName, src: { x: number; y: number; w: number; h: number } | null, x: number, y: number): void;
  /** SDL_FillRect( screen, rect, black ) */
  fill(x: number, y: number, w: number, h: number): void;
  /** SDL_Flip */
  flip(): void;
  /** Mix_PlayChannel( channel, sfx<n>, 0 ) */
  play(channel: number, sound: number): void;
}

export class Gfx {
  private readonly s: Surface;
  // gfxRenderGame()'s statics
  private prevIngame = true;
  private cursor = 0;

  constructor(s: Surface) {
    this.s = s;
  }

  renderMenu(option: number): void {
    this.s.blit('splash', null, 0, 0);
    this.s.blit(`option${option}` as ImageName, null, OPTION_X, OPTION_Y);
  }

  renderGame(g: GameState, sysRand: (max: number) => number): void {
    const s = this.s;
    if (this.prevIngame) {
      s.blit('background', null, 0, 0);
      let posY = ZERO_Y;
      for (let j = 0; j < GRID_Y; ++j) {
        let posX = ZERO_X;
        if (g.scroll <= SHAKE_AFTER) posX = ZERO_X + (SHAKE >> 1) - sysRand(SHAKE);
        // (the original advances the cursor animation once per row)
        if (g.scroll % CURSOR_SPEED === 0) this.cursor = (this.cursor + 1) % CURSORS;
        for (let i = 0; i < GRID_X; ++i) {
          const pair = g.grid[i][j];
          if (pair !== 0) {
            s.blit(`element${pairLeft(pair)}` as ImageName, null, posX, posY);
            s.blit(`element${pairRight(pair)}` as ImageName, null, posX + NEXT_PLUS_X, posY);
            s.blit('shield', null, posX + SHIELD_PLUS_X, posY);
          }
          posX += PAIR_PLUS_X;
        }
        posY += PAIR_PLUS_Y;
      }
      s.blit(`cursor${this.cursor}` as ImageName, null, ZERO_X + g.player.x * PAIR_PLUS_X, ZERO_Y + g.player.y * PAIR_PLUS_Y);
      s.blit(`element${g.player.e}` as ImageName, null, ZERO_X + g.player.x * PAIR_PLUS_X + PLAYER_PLUS_X, ZERO_Y + g.player.y * PAIR_PLUS_Y);
    } else {
      // the game-over effect
      for (let i = 0; i < SPRAY; ++i) {
        const x = sysRand(SCREEN_X);
        const y = INFO_BAR + sysRand(SCREEN_Y - INFO_BAR);
        s.fill(x, y, SPRAY_SIZE, SPRAY_SIZE);
      }
      const go = s.size('gameover');
      for (let i = 0; i < SPRAY >> 2; ++i) {
        const sx = sysRand(go.w - SPRAY_SIZE);
        const sy = sysRand(go.h - SPRAY_SIZE);
        s.blit('gameover', { x: sx, y: sy, w: SPRAY_SIZE, h: SPRAY_SIZE }, GAMEOVER_X + sx, GAMEOVER_Y + sy);
      }
    }
    switch (g.message) {
      case TEXT_INGAME_SCORE:
        this.printText(SCORE_X, SCORE_Y, `SCORE : ${g.score}`);
        this.printText(BEST_X, BEST_Y, `BEST : ${g.best}`);
        break;
      case TEXT_GAME_OVER:
        this.printText(SCORE_X, SCORE_Y, `GAME OVER, SCORE : ${g.score}`);
        break;
      case TEXT_BEST_SCORE:
        this.printText(SCORE_X, SCORE_Y, `CONGRATULATIONS : ${g.best}`);
        break;
    }
    this.prevIngame = g.ingame;
  }

  printText(x: number, y: number, text: string): void {
    for (const ch of text) {
      const c = ch.charCodeAt(0) - 32;
      this.s.blit('font', { x: (c % FONT_TILE_X) * FONT_SIZE_X, y: Math.trunc(c / FONT_TILE_X) * FONT_SIZE_Y, w: FONT_SIZE_X, h: FONT_SIZE_Y }, x, y);
      x += FONT_SIZE_X;
    }
  }

  update(): void {
    this.s.flip();
  }

  /** sndPlay(): sounds 1..4 on channel (n % 2); a sound replaces what plays on its channel */
  playSounds(g: GameState): void {
    for (let snd = 0; g.sounds !== SND_NONE && snd <= SND_LAST; snd++) {
      const mask = 1 << snd;
      if (g.sounds & mask && snd >= 1 && snd <= 4) this.s.play(snd % 2, snd);
      g.sounds &= ~mask;
    }
  }
}
