// C-Dogs SDL 2.5.0, translated: the stack of screens and its loop (game_loop.c). The browser drives it with
// requestAnimationFrame: LoopRunnerTick gets the elapsed milliseconds and runs as many updates as the original's
// fixed frame time (1000 / FPS) asks for, skipping draws as LoopRunParamsShouldSkip does.
// GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { EventPoll, KeyInit, ev } from '../platform/input.ts';
import { gGfx } from '../render/gfx.ts';

export const UPDATE_RESULT_OK = 0;
export const UPDATE_RESULT_DRAW = 1;

export interface GameLoopData {
  OnTerminate?: () => void;
  OnEnter?: () => void;
  OnExit?: () => void;
  InputFunc?: () => void;
  UpdateFunc: (l: LoopRunner) => number;
  DrawFunc?: () => void;
  FPS: number;
  SuperhotMode: boolean;
  SkipNextFrame: boolean;
  HasEntered: boolean;
  HasExited: boolean;
  HasDrawnFirst: boolean;
  DrawParent: boolean;
  Frames: number;
  id: number;
  /** for the tests and the screenshots: which screen it is */
  label: string;
}
let loopIds = 0;
export function GameLoopDataNew(f: Partial<GameLoopData> & { UpdateFunc: (l: LoopRunner) => number }): GameLoopData {
  const id = ++loopIds;
  return {
    id,
    label: '',
    FPS: 30, SuperhotMode: false, SkipNextFrame: false, HasEntered: false, HasExited: false, HasDrawnFirst: false,
    DrawParent: false, Frames: 0, ...f,
  };
}

export class LoopRunner {
  Loops: GameLoopData[] = [];
  private current: GameLoopData | null = null;
  private ticksElapsed = 0;
  private framesSkipped = 0;
  /** what draws the frame onto the page (after the loop's DrawFunc) */
  present: () => void = () => {};
  /** the loop stack is empty: the game ends */
  onEmpty: () => void = () => {};

  push(d: GameLoopData): void {
    this.Loops.push(d);
  }
  pop(): void {
    const d = this.Loops[this.Loops.length - 1];
    GameLoopOnExit(d);
    d.OnTerminate?.();
    this.Loops.pop();
  }
  /** the stack starts over (a test or a game started from outside the menus) */
  reset(d: GameLoopData): void {
    this.Loops.length = 0;
    this.current = null;
    this.ticksElapsed = 0;
    this.framesSkipped = 0;
    this.push(d);
  }
  change(d: GameLoopData): void {
    this.pop();
    this.push(d);
  }
  top(): number {
    return this.current?.id ?? -1;
  }
  stack(): (number | string)[] {
    return this.Loops.map((d) => (d.label ? `${d.id}:${d.label}` : d.id));
  }
  private cur(): GameLoopData | null {
    return this.Loops.length ? this.Loops[this.Loops.length - 1] : null;
  }
  private parent(): GameLoopData | null {
    return this.Loops.length > 1 ? this.Loops[this.Loops.length - 2] : null;
  }
  /** one browser frame: ms since the last */
  tick(ms: number): void {
    if (this.current == null) {
      this.current = this.cur();
      if (this.current == null) return;
      GameLoopOnEnter(this.current);
      this.ticksElapsed = 0;
      this.framesSkipped = 0;
    }
    this.ticksElapsed += Math.min(ms, 1000);
    let drew = false;
    for (let guard = 0; guard < 20; guard++) {
      const data = this.current;
      const frameMs = Math.trunc(1000 / data.FPS);
      if (this.ticksElapsed < frameMs) break;
      EventPoll(frameMs);
      data.InputFunc?.();
      const result = data.UpdateFunc(this);

      const newData = this.cur();
      if (newData == null) {
        this.current = null;
        this.onEmpty();
        return;
      }
      if (newData !== data) {
        const parent = this.parent();
        for (const d of this.Loops) {
          if (d === newData) continue;
          if (d === parent && newData.DrawParent && d.DrawFunc) continue;
          GameLoopOnExit(d);
        }
        this.current = newData;
        GameLoopOnEnter(newData);
        this.ticksElapsed = 0;
        this.framesSkipped = 0;
        return;
      }
      let draw = !data.HasDrawnFirst;
      if (result === UPDATE_RESULT_DRAW) draw = true;
      data.Frames++;
      this.ticksElapsed -= frameMs;
      if (this.ticksElapsed > frameMs) {
        this.framesSkipped++;
        if (this.framesSkipped === Math.trunc(data.FPS / 5)) this.ticksElapsed = 0;
        else continue;
      }
      this.framesSkipped = 0;
      if (draw) {
        gGfx.preRender();
        if (data.DrawParent) {
          const parent = this.parent();
          if (parent && parent.DrawFunc) {
            GameLoopOnEnter(parent);
            parent.DrawFunc();
          }
        }
        data.DrawFunc?.();
        gGfx.postRender();
        data.HasDrawnFirst = true;
        drew = true;
      }
    }
    if (drew) this.present();
  }
}
function GameLoopOnEnter(d: GameLoopData): void {
  if (!d.HasEntered && d.OnEnter) d.OnEnter();
  // EventReset
  KeyInit();
  ev.mouse.current = 0;
  ev.mouse.previous = 0;
  ev.mouse.pressed = 0;
  d.HasEntered = true;
  d.HasExited = false;
}
function GameLoopOnExit(d: GameLoopData): void {
  if (!d.HasExited && d.OnExit) d.OnExit();
  d.HasExited = true;
  d.HasEntered = false;
}
