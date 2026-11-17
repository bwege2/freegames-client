// plan/GameState.cpp and plan/StateManager.cpp: a stack of screens (world map, level, menus, posters).
// The topmost gets the input; states that allow it keep running under a menu.
import type { Env } from './env.ts';

/** what a state draws on: the renderer gives this (headless: nothing) */
export interface Screen {
  width: number;
  height: number;
}

/** InputHandler: keys held now and the mouse */
export interface Input {
  isPressed(key: string): boolean;
  mouse(): { x: number; y: number };
}

export const noInput: Input = { isPressed: () => false, mouse: () => ({ x: -1, y: -1 }) };

export abstract class GameState {
  manager: StateManager | null = null;
  active = false;
  onBg = false;
  nextState: GameState | null = null;
  env: Env;
  constructor(env: Env) { this.env = env; }

  abstract readonly name: string;
  allowBg(): boolean { return false; }
  isRunning(): boolean { return this.active; }

  // the state's own parts
  protected ownInit(): void {}
  protected ownUpdate(): void {}
  protected ownPause(): void {}
  protected ownResume(): void {}
  protected ownClean(): void {}
  protected ownNoteBg(): void {}
  protected ownNoteFg(): void {}

  /** a key went down (KeyStroke); `key` is an SDL-like name */
  keyDown(_key: string, _shift: boolean): void {}
  keyUp(_key: string): void {}
  mouseDown(_x: number, _y: number, _button: number): void {}
  /** what this state draws, bottom first */
  draw(_g: unknown): void {}

  /** only the topmost state has its input handler installed */
  input(): Input { return this.manager && this.manager.top() === this ? this.manager.input : noInput; }

  initState(m: StateManager): void {
    this.manager = m;
    this.active = true;
    this.onBg = false;
    this.ownInit();
  }
  updateState(): void { this.ownUpdate(); }
  pauseState(): void {
    this.ownPause();
    this.active = false;
    this.onBg = false;
  }
  resumeState(): void {
    this.active = true;
    this.ownResume();
  }
  cleanState(): void {
    this.ownClean();
    this.active = false;
    this.onBg = false;
    this.manager = null;
  }
  noteBg(): void { this.ownNoteBg(); this.onBg = true; }
  noteFg(): void { this.onBg = false; this.ownNoteFg(); }

  quitState(): void {
    if (this.nextState) this.changeState(this.nextState);
    else this.manager!.popState(this);
  }
  pushState(s: GameState): void { this.manager!.pushState(this, s); }
  changeState(s: GameState): void { this.manager!.changeState(this, s); }
  setNextState(s: GameState): void { this.nextState = s; }
}

export class StateManager {
  states: GameState[] = [];
  input: Input = noInput;
  onQuit: () => void = () => {};

  updateGame(): void {
    for (const s of [...this.states]) {
      if (this.states.includes(s) && s.isRunning()) s.updateState();
    }
  }

  top(): GameState | null { return this.states.length > 0 ? this.states[this.states.length - 1] : null; }

  private removeState(s: GameState): void {
    s.cleanState();
    this.states.splice(this.states.indexOf(s), 1);
  }

  changeState(who: GameState, s: GameState): void {
    this.insertAfter(who, s);
    this.removeState(who);
    s.initState(this);
    this.checkStack();
  }

  pushState(who: GameState | null, s: GameState): void {
    this.insertAfter(who, s);
    s.initState(this);
    this.checkStack();
  }

  popState(who: GameState): void {
    this.removeState(who);
    if (this.states.length > 0) this.checkStack();
    else this.onQuit();
  }

  private insertAfter(who: GameState | null, s: GameState): void {
    if (who === null) this.states.unshift(s);
    else {
      const i = this.states.indexOf(who);
      if (i < 0) throw new Error(`game state is not found in stack: ${who.name}`);
      this.states.splice(i + 1, 0, s);
    }
  }

  private checkStack(): void {
    if (this.states.length === 0) throw new Error('game state stack is empty');
    const ti = this.states.length - 1;
    const top = this.states[ti];
    if (top.onBg) top.noteFg();
    this.pauseBg(ti);
    this.resumeBg(ti);
  }

  private pauseBg(i: number): void {
    if (i > 0) {
      const prev = this.states[i - 1];
      const cur = this.states[i];
      if (!cur.isRunning() || !cur.allowBg()) {
        if (prev.isRunning()) prev.pauseState();
      }
      this.pauseBg(i - 1);
    }
  }

  private resumeBg(i: number): void {
    const cur = this.states[i];
    if (cur.allowBg() && i > 0) {
      this.resumeBg(i - 1);
      this.states[i - 1].noteBg();
    }
    if (!cur.isRunning()) cur.resumeState();
  }

  /** the running states, bottom first (they draw in this order) */
  running(): GameState[] { return this.states.filter((s) => s.isRunning()); }
}
