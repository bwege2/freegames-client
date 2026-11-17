// A level: level/Level.cpp, Room.cpp, View.cpp (the logic of it), LevelScript.cpp, level-script.cpp,
// game-script.cpp, LevelLoading.cpp, LevelCountDown.cpp, LevelStatus.cpp, LevelInput.cpp, MouseControl.cpp,
// FinderAlg.cpp, PhaseLocker.cpp of fillets-ng 1.0.1.
import { LuaError, LuaFunction, LuaTable, truthy, type LuaValue } from '../lua/interp.ts';
import { Anim, type Blitter, type ImgRef, SIDE_LEFT, SIDE_RIGHT } from './anim.ts';
import {
  ACTION_FALL, ACTION_MOVE, ACTION_NO, Controls, Cube, DIR_DOWN, DIR_LEFT, DIR_NO, DIR_RIGHT, DIR_UP, Field, Goal,
  HEAVY, LIGHT, Landslip, LoadException, createModel, createUnit, dir2xy, type Action, type Dir, type InputProvider,
  type Unit, type V2, type Weight,
} from './model.ts';
import { Planner, ScriptException, argInt, argNum, argStr, optInt } from './script.ts';
import { rng } from './random.ts';
import { GameState } from './state.ts';
import type { Env } from './env.ts';

export const SCALE = 15;

export class PhaseLocker {
  lockPhases = 0;
  reset(): void { this.lockPhases = 0; }
  ensurePhases(count: number): void { this.lockPhases = Math.max(this.lockPhases, count); }
  decLock(): void { if (this.lockPhases > 0) this.lockPhases--; }
  getLocked(): number { return this.lockPhases; }
}

export type Decor = { kind: 'steps' } | { kind: 'rope'; m1: Cube; m2: Cube; s1: V2; s2: V2 };

/** what a drawing of the room needs, beside the models */
export interface RoomPainter extends Blitter {
  background(picture: string, amp: number, periode: number, speed: number, cycles: number): void;
  rope(x1: number, y1: number, x2: number, y2: number): void;
  steps(count: number, powerful: boolean): void;
}

/** Room.cpp (with the View's state) */
export class Room {
  bg: string;
  waves = { amp: 0, periode: 0, speed: 0 };
  field: Field;
  models: Cube[] = [];
  controls: Controls;
  lastAction: Action = ACTION_NO;
  startTime: number;
  fastFalling = false;
  sounds = new Map<string, string[]>();
  // View
  animShift = 0;
  shiftSize = SCALE;
  screenShift: V2 = { x: 0, y: 0 };
  decors: Decor[] = [];
  private level: Level;
  /** FinderAlg: the closed places persist between searches until reset */
  private finderUnit: Unit | null = null;

  constructor(w: number, h: number, picture: string, level: Level) {
    this.level = level;
    this.bg = picture;
    this.field = new Field(w, h);
    this.controls = new Controls(level.locker);
    this.startTime = level.env.cycles;
    // WavyPicture: no waves, periode = picture width (set by the renderer when known)
    this.waves = { amp: 0, periode: 0, speed: 0 };
  }

  get w(): number { return this.field.w; }
  get h(): number { return this.field.h; }

  setWaves(amp: number, periode: number, speed: number): void {
    // float members in WavyPicture
    this.waves = { amp: Math.fround(amp), periode: Math.fround(periode), speed: Math.fround(speed) };
  }

  addModel(m: Cube, unit: Unit | null): number {
    m.rules.takeField(this.field);
    this.models.push(m);
    if (unit) {
      unit.model = m;
      this.controls.addUnit(unit);
    }
    m.index = this.models.length - 1;
    return m.index;
  }

  getModel(i: number): Cube {
    if (i >= 0 && i < this.models.length) return this.models[i];
    throw new LuaError(`bad model index: ${i}`);
  }

  askField(loc: V2): Cube | null { return this.field.getModel(loc.x, loc.y); }

  nextRound(input: InputProvider & { mouse(): V2; isLeftPressed(): boolean; isRightPressed(): boolean }): void {
    if (this.fastFalling) {
      while (this.beginFall()) this.finishRound();
    } else {
      this.beginFall();
    }
    if (this.isFresh()) {
      if (this.controls.driving(input)) this.lastAction = ACTION_MOVE;
      else if (this.mouseDrive(input)) this.lastAction = ACTION_MOVE;
    }
    this.finishRound();
  }

  private playImpact(impact: Weight): void {
    if (impact === LIGHT) this.playSound('impact_light', 50);
    else if (impact === HEAVY) this.playSound('impact_heavy', 50);
  }

  private playDead(m: Cube): void {
    this.level.script.dialogs.killSound(m.index);
    if (m.power === LIGHT) this.playSound('dead_small');
    else if (m.power === HEAVY) this.playSound('dead_big');
  }

  private prepareRound(): void {
    let interrupt = false;
    for (const m of this.models) m.rules.freeOldPos();
    for (const m of this.models) m.rules.occupyNewPos();
    for (const m of this.models) {
      const die = m.rules.checkDead(this.lastAction);
      interrupt = interrupt || die;
      if (die) this.playDead(m);
    }
    for (const m of this.models) m.rules.changeState();
    if (interrupt) this.level.script.interruptPlan();
  }

  private fallout(interactive: boolean): boolean {
    let wentOut = false;
    for (const m of this.models) {
      if (!m.lost) {
        const depth = m.rules.actionOut();
        if (depth > 0) {
          wentOut = true;
          if (interactive) this.level.locker.ensurePhases(3);
        } else if (depth === -1) {
          this.level.script.interruptPlan();
        }
      }
    }
    return wentOut;
  }

  private falldown(interactive: boolean): boolean {
    const slip = new Landslip(this.models);
    const falling = slip.computeFall();
    if (interactive) this.playImpact(slip.impact);
    return falling;
  }

  finishRound(interactive = true): void {
    if (interactive) this.controls.lockPhases();
    // View::noteNewRound
    this.animShift = 0;
    const phases = this.level.locker.getLocked();
    this.shiftSize = phases > 0 ? Math.trunc(SCALE / phases) : SCALE;
  }

  isFresh(): boolean { return this.lastAction === ACTION_NO; }
  isFalling(): boolean { return this.lastAction === ACTION_FALL; }

  loadMove(move: string): void {
    let falling = true;
    while (falling) {
      falling = this.beginFall(false);
      this.makeMove(move);
      this.finishRound(false);
    }
  }

  beginFall(interactive = true): boolean {
    this.prepareRound();
    this.lastAction = ACTION_NO;
    if (this.fallout(interactive)) this.lastAction = ACTION_MOVE;
    else if (this.falldown(interactive)) this.lastAction = ACTION_FALL;
    return this.lastAction !== ACTION_NO;
  }

  makeMove(move: string): boolean {
    if (this.isFresh()) {
      if (!this.controls.makeMove(move)) throw new LoadException(`load error - bad move: ${move}`);
      this.lastAction = ACTION_MOVE;
      return true;
    }
    return false;
  }

  cannotMove(): boolean { return this.controls.cannotMove(); }
  isSolvable(): boolean { return !this.models.some((m) => m.isWrong()); }
  isSolved(): boolean {
    if (!this.isFresh()) return false;
    return this.models.every((m) => m.isSatisfy());
  }
  checkActive(): void { this.controls.checkActive(); }
  unBusyUnits(): void { for (const m of this.models) m.busy = false; }
  getCycles(): number { return this.level.env.cycles - this.startTime; }

  addSound(name: string, file: string): void {
    // ResSoundPack::addSound stores only sounds that could be loaded
    const env = this.level.env;
    if (!env.options.getAsBool('sound', true) || !env.vfs.exists(file)) return;
    let l = this.sounds.get(name);
    if (!l) this.sounds.set(name, (l = []));
    l.push(env.vfs.dataPath(file));
  }

  playSound(name: string, volume = 100): void {
    const env = this.level.env;
    if (env.options.getAsBool('sound', true)) {
      const l = this.sounds.get(name);
      let file: string | null = null;
      if (l && l.length > 0) file = l[rng.randomInt(l.length)];
      else env.log(`no such resource: ${name}`);
      env.sound.playSound(file, volume, 0);
    }
  }

  changeBg(picture: string): void { if (picture !== this.bg) this.bg = picture; }

  /** View::getScreenPos */
  getScreenPos(m: Cube): V2 {
    let sx = 0, sy = 0;
    const dir = m.getLastMoveDir();
    if (dir !== DIR_NO) {
      const d = dir2xy(dir);
      sx = d.x * this.animShift;
      sy = d.y * this.animShift;
    }
    sx += this.screenShift.x;
    sy += this.screenShift.y;
    const a = m.anim.viewShift;
    return { x: (m.loc.x + a.x) * SCALE + sx, y: (m.loc.y + a.y) * SCALE + sy };
  }

  getFieldPos(cursor: V2): V2 {
    return { x: Math.trunc((cursor.x - this.screenShift.x) / SCALE), y: Math.trunc((cursor.y - this.screenShift.y) / SCALE) };
  }

  /** Room::drawOn: background, the models (this advances their anims), decors */
  draw(painter: RoomPainter | null): void {
    painter?.background(this.bg, this.waves.amp, this.waves.periode, this.waves.speed, this.level.env.cycles);
    this.animShift = Math.min(SCALE, this.animShift + this.shiftSize);
    for (const m of this.models) {
      if (!m.lost) {
        const p = this.getScreenPos(m);
        m.anim.drawAt(painter, p.x, p.y, m.lookLeft ? SIDE_LEFT : SIDE_RIGHT);
      }
    }
    if (painter) {
      for (const d of this.decors) {
        if (d.kind === 'steps') {
          if (this.level.env.options.getAsBool('show_steps')) painter.steps(this.controls.getStepCount(), this.controls.isPowerful());
        } else {
          const p1 = this.getScreenPos(d.m1), p2 = this.getScreenPos(d.m2);
          painter.rope(p1.x + d.s1.x, p1.y + d.s1.y, p2.x + d.s2.x, p2.y + d.s2.y);
        }
      }
    }
  }

  // ---- MouseControl
  private mouseDrive(input: { mouse(): V2; isLeftPressed(): boolean; isRightPressed(): boolean }): boolean {
    const field = this.getFieldPos(input.mouse());
    if (input.isLeftPressed()) return this.moveTo(field);
    if (input.isRightPressed()) return this.moveHardTo(field);
    return false;
  }

  private moveTo(dest: V2): boolean {
    const unit = this.controls.getActive();
    if (unit) {
      const dir = this.findDir(unit, dest);
      if (dir !== DIR_NO) return this.controls.makeMove(unit.myOrder(dir));
    }
    return false;
  }

  private moveHardTo(f: V2): boolean {
    const unit = this.controls.getActive();
    if (!unit) return false;
    const loc = unit.model.loc;
    if (f.x < loc.x) return this.controls.makeMove(unit.myOrder(DIR_LEFT));
    if (loc.x + unit.model.shape.w <= f.x) return this.controls.makeMove(unit.myOrder(DIR_RIGHT));
    if (f.y < loc.y) return this.controls.makeMove(unit.myOrder(DIR_UP));
    if (loc.y + unit.model.shape.h <= f.y) return this.controls.makeMove(unit.myOrder(DIR_DOWN));
    return false;
  }

  private closed: boolean[] | null = null;
  private findDir(unit: Unit, dest: V2): Dir {
    const W = this.field.w, H = this.field.h;
    if (!this.closed || this.finderUnit) this.closed = new Array(W * H).fill(false);
    this.finderUnit = unit;
    const closed = this.closed;
    const isClosed = (x: number, y: number) => (x >= 0 && x < W && y >= 0 && y < H ? closed[y * W + x] : true);
    const markClosed = (x: number, y: number) => { if (x >= 0 && x < W && y >= 0 && y < H) closed[y * W + x] = true; };
    const u = unit.model.loc;
    const w = unit.model.shape.w, h = unit.model.shape.h;
    const inRect = (rx: number, ry: number) => rx <= dest.x && dest.x < rx + w && ry <= dest.y && dest.y < ry + h;
    if (inRect(u.x, u.y)) return DIR_NO;
    markClosed(u.x, u.y);
    const fifo: { d: Dir; x: number; y: number }[] = [
      { d: DIR_LEFT, x: u.x - 1, y: u.y }, { d: DIR_RIGHT, x: u.x + 1, y: u.y },
      { d: DIR_UP, x: u.x, y: u.y - 1 }, { d: DIR_DOWN, x: u.x, y: u.y + 1 },
    ];
    for (let i = 0; i < fifo.length; i++) {
      const p = fifo[i];
      if (unit.model.rules.isFreePlace({ x: p.x, y: p.y })) {
        if (inRect(p.x, p.y)) return p.d;
        for (const [dx, dy] of [[-1, 0], [1, 0], [0, -1], [0, 1]]) {
          const x = p.x + dx, y = p.y + dy;
          if (!isClosed(x, y)) {
            markClosed(x, y);
            fifo.push({ d: p.d, x, y });
          }
        }
      }
    }
    return DIR_NO;
  }

  controlMouse(x: number, y: number): void {
    const f = this.getFieldPos({ x, y });
    this.controls.activateSelected(this.askField(f));
  }
}

/** LevelStatus.cpp: the level being run and its best solution in solved/<codename>.lua */
export class LevelStatus {
  env: Env;
  codename = '';
  poster = '';
  bestMoves = -1;
  bestAuthor = '';
  complete = false;
  wasRunning = false;
  constructor(env: Env) { this.env = env; }

  prepareRun(codename: string, poster: string, bestMoves: number, bestAuthor: string): void {
    this.complete = false;
    this.wasRunning = false;
    this.codename = codename;
    this.poster = poster;
    this.bestMoves = bestMoves;
    this.bestAuthor = bestAuthor;
  }
  setRunning(r: boolean): void { this.wasRunning = r; }
  setComplete(): void { this.complete = true; }

  static solutionFile(codename: string): string { return `solved/${codename}.lua`; }

  /** reads saved_moves of the solution file with a fresh look at its text */
  readSolvedMoves(): string {
    const text = this.env.vfs.readText(LevelStatus.solutionFile(this.codename));
    if (text === null) return '';
    const m = /saved_moves\s*=\s*'([^']*)'/.exec(text);
    return m ? m[1] : '';
  }

  writeSolvedMoves(moves: string): void {
    const prev = this.readSolvedMoves();
    if (prev === '' || moves.length < prev.length) {
      this.env.vfs.write(LevelStatus.solutionFile(this.codename), `\nsaved_moves = '${moves}'\n`);
    }
  }

  compareToBest(): number {
    const moves = this.readSolvedMoves().length;
    if (this.bestMoves > 0) {
      if (this.bestMoves < moves) return -1;
      if (this.bestMoves === moves) return 0;
    }
    return 1;
  }
}

/** the services a level asks of the game (posters, demos, the level's name) */
export interface LevelHost {
  findDesc(codename: string): string;
  findLevelName(codename: string): string;
  /** a DemoMode for a poster or a demo script */
  createDemo(script: string): GameState;
  /** the room size changed (VideoAgent::initVideoMode) */
  setScreenSize(w: number, h: number): void;
  /** F1, F10: the help screen and the options menu */
  createHelp?(): GameState;
  createMenu?(): GameState;
  /** a status picture for a while (StatusDisplay) */
  displayStatus?(picture: string, seconds: number): void;
}

export interface LevelInputProvider extends InputProvider {
  mouse(): V2;
  isLeftPressed(): boolean;
  isRightPressed(): boolean;
}

const noLevelInput: LevelInputProvider = { isPressed: () => false, mouse: () => ({ x: -1, y: -1 }), isLeftPressed: () => false, isRightPressed: () => false };

/** LevelScript: the level's Lua state with the game functions */
export class LevelScript extends Planner {
  level: Level;
  room_: Room | null = null;

  constructor(level: Level) {
    super(level.env);
    this.level = level;
    this.registerGameFuncs();
  }

  get room(): Room {
    if (!this.room_) throw new LuaError('room is not ready');
    return this.room_;
  }
  isRoom(): boolean { return this.room_ !== null; }

  takeRoom(r: Room): void { this.cleanRoom(); this.room_ = r; }

  /** ~Room() */
  cleanRoom(): void {
    if (this.room_) {
      this.killPlan();
      this.dialogs.removeAll();
      this.env.subtitles.removeAll();
      this.room_ = null;
    }
  }

  updateScript(): void {
    this.scriptDo('script_update()');
    this.satisfyPlan();
  }

  interruptPlan(): void {
    super.interruptPlan();
    if (this.room_) {
      this.room_.checkActive();
      this.room_.unBusyUnits();
    }
  }

  private model(a: LuaValue[], fname: string): Cube { return this.room.getModel(argInt(a, 0, fname)); }

  private registerGameFuncs(): void {
    const r = (name: string, f: (a: LuaValue[]) => LuaValue[] | LuaValue | void) => this.reg(name, f);
    const env = this.env;
    r('game_setRoomWaves', (a) => { this.room.setWaves(argNum(a, 0, 'game_setRoomWaves'), argNum(a, 1, 'game_setRoomWaves'), argNum(a, 2, 'game_setRoomWaves')); });
    r('game_addModel', (a) => {
      const kind = argStr(a, 0, 'game_addModel');
      const x = argInt(a, 1, 'game_addModel'), y = argInt(a, 2, 'game_addModel');
      const shape = argStr(a, 3, 'game_addModel');
      const m = createModel(kind, { x, y }, shape);
      const unit = createUnit(kind);
      m.talking = (i) => this.dialogs.isTalking(i);
      m.anim.warn = (s) => env.log(s);
      return this.room.addModel(m, unit);
    });
    r('game_getCycles', () => this.room.getCycles());
    r('game_addDecor', (a) => {
      const name = argStr(a, 0, 'game_addDecor');
      if (name === 'rope') {
        const m1 = this.room.getModel(argInt(a, 1, 'game_addDecor'));
        const m2 = this.room.getModel(argInt(a, 2, 'game_addDecor'));
        this.room.decors.push({ kind: 'rope', m1, m2, s1: { x: argInt(a, 3, 'game_addDecor'), y: argInt(a, 4, 'game_addDecor') }, s2: { x: argInt(a, 5, 'game_addDecor'), y: argInt(a, 6, 'game_addDecor') } });
      } else env.log(`unknown decor: ${name}`);
    });
    r('game_setScreenShift', (a) => { this.room.screenShift = { x: argInt(a, 0, 'game_setScreenShift'), y: argInt(a, 1, 'game_setScreenShift') }; });
    r('game_changeBg', (a) => { this.room.changeBg(argStr(a, 0, 'game_changeBg')); });
    r('game_getBg', () => this.room.bg);
    r('game_checkActive', () => { this.room.checkActive(); });
    r('game_setFastFalling', (a) => { this.room.fastFalling = truthy(a[0]); });

    r('model_addAnim', (a) => {
      const m = this.model(a, 'model_addAnim');
      const animName = argStr(a, 1, 'model_addAnim');
      const picture = argStr(a, 2, 'model_addAnim');
      const side = optInt(a, 3, 'model_addAnim', SIDE_LEFT);
      let img: ImgRef;
      if (picture === '') img = { shape: m.shape.marks, w: m.shape.w, h: m.shape.h, weight: m.weight };
      else img = { path: env.vfs.dataPath(picture) };
      m.anim.addAnim(animName, img, side);
    });
    r('model_runAnim', (a) => { this.model(a, 'model_runAnim').anim.runAnim(argStr(a, 1, 'model_runAnim'), optInt(a, 2, 'model_runAnim', 0)); });
    r('model_setAnim', (a) => { this.model(a, 'model_setAnim').anim.setAnim(argStr(a, 1, 'model_setAnim'), argInt(a, 2, 'model_setAnim')); });
    r('model_useSpecialAnim', (a) => { this.model(a, 'model_useSpecialAnim').anim.useSpecialAnim(argStr(a, 1, 'model_useSpecialAnim'), argInt(a, 2, 'model_useSpecialAnim')); });
    r('model_countAnims', (a) => this.model(a, 'model_countAnims').anim.countAnimPhases(argStr(a, 1, 'model_countAnims')));
    r('model_setEffect', (a) => { this.model(a, 'model_setEffect').anim.setEffect(argStr(a, 1, 'model_setEffect')); });
    r('model_getLoc', (a) => { const m = this.model(a, 'model_getLoc'); return [m.loc.x, m.loc.y]; });
    r('model_getAction', (a) => this.model(a, 'model_getAction').rules.getAction());
    r('model_getState', (a) => this.model(a, 'model_getState').rules.getState());
    r('model_getDir', (a) => this.model(a, 'model_getDir').getLastMoveDir());
    r('model_getTouchDir', (a) => this.model(a, 'model_getTouchDir').rules.touchDir);
    r('model_isAlive', (a) => this.model(a, 'model_isAlive').alive);
    r('model_isOut', (a) => this.model(a, 'model_isOut').out);
    r('model_isLeft', (a) => this.model(a, 'model_isLeft').lookLeft);
    r('model_isAtBorder', (a) => this.model(a, 'model_isAtBorder').rules.isAtBorder());
    r('model_getW', (a) => this.model(a, 'model_getW').shape.w);
    r('model_getH', (a) => this.model(a, 'model_getH').shape.h);
    r('model_setGoal', (a) => {
      const m = this.model(a, 'model_setGoal');
      const g = argStr(a, 1, 'model_setGoal');
      const goals: Record<string, () => Goal> = { goal_no: Goal.noGoal, goal_out: Goal.outGoal, goal_escape: Goal.escapeGoal, goal_alive: Goal.aliveGoal };
      if (!goals[g]) throw new LuaError(`unknown goal: ${g}`);
      m.goal = goals[g]();
    });
    r('model_change_turnSide', (a) => { this.model(a, 'model_change_turnSide').change_turnSide(); });
    r('model_change_setLocation', (a) => {
      this.model(a, 'model_change_setLocation').rules.change_setLocation({ x: argInt(a, 1, 'model_change_setLocation'), y: argInt(a, 2, 'model_change_setLocation') });
    });
    r('model_setViewShift', (a) => { this.model(a, 'model_setViewShift').anim.viewShift = { x: argInt(a, 1, 'model_setViewShift'), y: argInt(a, 2, 'model_setViewShift') }; });
    r('model_getViewShift', (a) => { const s = this.model(a, 'model_getViewShift').anim.viewShift; return [s.x, s.y]; });
    r('model_setBusy', (a) => { this.model(a, 'model_setBusy').busy = truthy(a[1]); });
    r('model_getExtraParams', (a) => {
      const m = this.model(a, 'model_getExtraParams');
      const t = new LuaTable();
      t.set('outDir', m.outDir);
      t.set('outCapacity', m.outCapacity);
      t.set('weight', m.weight);
      t.set('anim', m.anim.getState());
      return t;
    });
    r('model_change_setExtraParams', (a) => {
      const idx = argInt(a, 0, 'model_change_setExtraParams');
      const t = a[1];
      const get = (k: string): LuaValue => (t instanceof LuaTable ? t.get(k) : this.lua.index(t, k));
      const outDir = argInt([get('outDir')], 0, 'model_change_setExtraParams');
      const outCapacity = argInt([get('outCapacity')], 0, 'model_change_setExtraParams');
      const weight = argInt([get('weight')], 0, 'model_change_setExtraParams');
      const animState = argStr([get('anim')], 0, 'model_change_setExtraParams');
      const m = this.room.getModel(idx);
      m.setOutDir(outDir as Dir, outCapacity, weight as Weight);
      m.setExtraParams();
      m.anim.restoreState(animState);
    });
    r('model_equals', (a) => {
      const idx = argInt(a, 0, 'model_equals');
      const other = this.room.askField({ x: argInt(a, 1, 'model_equals'), y: argInt(a, 2, 'model_equals') });
      if (other) return idx === -1 ? false : idx === other.index;
      return idx === -1;
    });
    r('sound_addSound', (a) => { this.room.addSound(argStr(a, 0, 'sound_addSound'), argStr(a, 1, 'sound_addSound')); });
    r('sound_playSound', (a) => { this.room.playSound(argStr(a, 0, 'sound_playSound'), optInt(a, 1, 'sound_playSound', 100)); });

    // level functions
    const lv = this.level;
    r('level_save', (a) => { lv.saveGame(argStr(a, 0, 'level_save')); });
    r('level_load', (a) => { lv.loadGame(argStr(a, 0, 'level_load')); });
    r('level_action_move', (a) => {
      const s = argStr(a, 0, 'level_action_move');
      if (s.length !== 1) throw new LuaError(`bad symbol length: ${s}`);
      return lv.action_move(s);
    });
    r('level_action_save', () => lv.action_save());
    r('level_action_load', () => lv.action_load());
    r('level_action_restart', () => lv.action_restart(1));
    r('level_createRoom', (a) => { lv.createRoom(argInt(a, 0, 'level_createRoom'), argInt(a, 1, 'level_createRoom'), argStr(a, 2, 'level_createRoom')); });
    r('level_getRestartCounter', () => lv.restartCounter);
    r('level_getDepth', () => lv.depth);
    r('level_isNewRound', () => lv.newRound);
    r('level_isSolved', () => this.room.isSolved());
    r('level_newDemo', (a) => { lv.newDemo(argStr(a, 0, 'level_newDemo')); });
    r('level_planShow', (a) => {
      if (!(a[0] instanceof LuaFunction)) throw new LuaError('bad argument #1 to `level_planShow\' (function expected)');
      lv.show.push(a[0]);
    });
    r('level_isShowing', () => lv.isShowing());
  }
}

/** Level.cpp */
export class Level extends GameState {
  readonly name = 'state_level';
  depth: number;
  codename: string;
  datafile: string;
  locker = new PhaseLocker();
  newRound = false;
  script: LevelScript;
  status: LevelStatus | null = null;
  host: LevelHost;
  restartCounter = 1;
  undoSteps = 0;
  wasDangerousMove = false;
  /** LevelLoading */
  loadPaused = false;
  replayMode = false;
  loadSpeed = 1;
  loadedMoves = '';
  /** LevelCountDown */
  countdown = -1;
  /** the show (CommandQueue m_show) */
  show: LuaFunction[] = [];
  showCount = 0;
  levelInput: LevelInputProvider = noLevelInput;
  error: string | null = null;

  constructor(env: Env, host: LevelHost, codename: string, datafile: string, depth: number) {
    super(env);
    this.host = host;
    this.codename = codename;
    this.datafile = datafile;
    this.depth = depth;
    this.script = new LevelScript(this);
  }

  fillStatus(s: LevelStatus): void { this.status = s; }
  get room(): Room { return this.script.room; }

  protected ownInit(): void {
    this.countdownReset();
    this.loadingReset();
    this.locker.reset();
    this.locker.ensurePhases(1);
    if (!this.isUndoing()) this.env.sound.stopMusic();
    this.script.scriptDo(`CODENAME = [[${this.codename}]]`);
    this.script.scriptInclude(this.datafile);
  }

  protected ownUpdate(): void {
    this.newRound = false;
    if (this.locker.getLocked() === 0) {
      this.newRound = true;
      this.nextAction();
    }
    this.updateLevel();
    this.locker.decLock();
    if (this.countDown()) this.finishLevel();
  }

  protected ownPause(): void {
    this.script.killPlan();
    this.action_undo_finish();
  }
  protected ownResume(): void { if (this.script.isRoom()) this.initScreen(); }
  protected ownClean(): void { this.script.cleanRoom(); }
  protected ownNoteBg(): void {
    if (this.isLoading() && !this.loadPaused) this.loadPaused = true;
    this.action_undo_finish();
  }
  protected ownNoteFg(): void {
    this.initScreen();
    if (this.isLoading() && this.loadPaused) this.loadPaused = false;
    this.locker.ensurePhases(3);
  }

  isUndoing(): boolean { return this.undoSteps !== 0; }
  isActing(): boolean { return this.isShowing() || this.isLoading() || this.isUndoing(); }
  isLoading(): boolean { return this.loadedMoves !== '' || this.replayMode; }
  togglePause(): void { this.loadPaused = !this.loadPaused; }

  private nextAction(): void {
    if (this.isUndoing()) this.nextUndoAction();
    else if (this.isLoading()) this.nextLoadAction();
    else if (this.isShowing()) this.nextShowAction();
    else this.nextPlayerAction();
  }

  private updateLevel(): void {
    if (!this.isUndoing() && !this.isLoading()) this.script.updateScript();
  }

  private saveUndo(oldMoves: string): void {
    if (this.script.isRoom()) {
      const keepLast = this.wasDangerousMove;
      this.wasDangerousMove = this.room.controls.isDangerousMove();
      this.script.scriptDo(`script_saveUndo("${oldMoves}",${keepLast ? 'true' : 'false'})`);
    }
  }

  private finishLevel(): void {
    if (this.isFinishedEnough()) {
      this.status!.setComplete();
      this.status!.writeSolvedMoves(this.room.controls.moves);
      const next = this.status!.poster !== '' ? this.host.createDemo(this.status!.poster) : null;
      if (next) this.changeState(next);
      else this.quitState();
    } else if (this.isWrongEnough()) {
      this.action_restart(1);
    }
  }

  private nextPlayerAction(): void {
    if (this.script.isRoom()) {
      const room = this.room;
      const oldMoves = room.controls.moves;
      const inp = this.input();
      room.nextRound(this.levelInput !== noLevelInput ? this.levelInput : {
        isPressed: (k) => inp.isPressed(k),
        mouse: () => inp.mouse(),
        isLeftPressed: () => inp.isPressed('mouse0'),
        isRightPressed: () => inp.isPressed('mouse2'),
      });
      const wasSolvable = room.isSolvable();
      this.wasDangerousMove = this.wasDangerousMove || room.isFalling();
      if (wasSolvable && !room.isFalling()) this.saveUndo(oldMoves);
    }
  }

  saveGame(models: string): void {
    if (this.script.isRoom()) {
      const moves = this.room.controls.moves;
      this.env.vfs.write(`saves/${this.codename}.lua`, `\nsaved_moves = '${moves}'\n\nsaved_models = ${models}`);
      this.host.displayStatus?.('images/menu/status/saved.png', 3);
    }
  }

  loadGame(moves: string): void {
    if (this.isUndoing()) {
      if (this.script.isRoom()) this.room.controls.setMoves(moves);
    } else {
      this.loadedMoves = moves;
      this.loadSpeed = Math.min(50, Math.max(5, Math.trunc(moves.length / 150)));
    }
  }

  loadReplay(moves: string): void {
    this.loadedMoves = moves;
    this.loadSpeed = 1;
    this.replayMode = true;
  }

  private nextLoadAction(): void {
    if (!this.loadPaused) {
      if (this.loadedMoves === '') {
        this.room.beginFall(false);
        this.room.finishRound(false);
      } else {
        for (let i = 0; i < this.loadSpeed && this.loadedMoves !== ''; i++) {
          const symbol = this.loadedMoves[0];
          this.loadedMoves = this.loadedMoves.slice(1);
          this.room.loadMove(symbol);
        }
      }
    }
    if (!this.isLoading()) this.script.scriptDo('script_loadState()');
  }

  private nextShowAction(): void {
    if (this.script.isRoom()) {
      this.room.beginFall();
      // CommandQueue::executeFirst on the show
      const cmd = this.show[0];
      if (this.script.callCommand(cmd, this.showCount)) {
        if (this.show[0] === cmd) this.show.shift();
        this.showCount = 0;
      } else this.showCount++;
      this.room.finishRound();
    }
  }

  private nextUndoAction(): void {
    if (this.script.isRoom()) {
      this.script.scriptDo(`script_loadUndo("${this.room.controls.moves}",${this.undoSteps})`);
    }
  }

  action_restart(increment: number): boolean {
    if (increment > 0) this.undoSteps = 0;
    this.ownClean();
    this.restartCounter += increment;
    this.ownInit();
    return true;
  }

  action_move(symbol: string): boolean { return this.room.makeMove(symbol); }

  action_save(): boolean {
    if (this.room.isSolvable()) this.script.scriptDo('script_save()');
    return true;
  }

  action_load(): boolean {
    const file = `saves/${this.codename}.lua`;
    if (this.env.vfs.exists(file)) {
      this.undoSteps = 0;
      this.restartCounter--;
      this.action_restart(1);
      this.script.scriptInclude(file);
      this.script.scriptDo('script_load()');
    }
    return true;
  }

  action_undo(steps: number): void {
    this.undoSteps = steps;
    this.script.killPlan();
    this.countdownReset();
    this.nextUndoAction();
  }

  action_undo_finish(): void {
    if (!this.isUndoing()) return;
    this.action_restart(0);
    this.script.scriptDo('script_loadFinalUndo()');
    this.undoSteps = 0;
  }

  switchFish(): void { if (this.script.isRoom()) this.room.controls.switchActive(); }
  controlEvent(key: string): void { if (this.script.isRoom()) this.room.controls.controlEvent(key); }
  controlMouse(x: number, y: number, button: number): void {
    if (this.script.isRoom() && button === 0) this.room.controlMouse(x, y);
  }

  createRoom(w: number, h: number, picture: string): void {
    const room = new Room(w, h, picture, this);
    room.decors.push({ kind: 'steps' });
    this.script.takeRoom(room);
    this.initScreen();
  }

  private initScreen(): void {
    if (this.script.isRoom()) {
      this.env.options.setParam('screen_width', this.room.w * SCALE);
      this.env.options.setParam('screen_height', this.room.h * SCALE);
      this.host.setScreenSize(this.room.w * SCALE, this.room.h * SCALE);
    }
  }

  newDemo(demofile: string): void {
    this.script.interruptPlan();
    this.pushState(this.host.createDemo(demofile));
  }

  isShowing(): boolean { return this.show.length > 0; }
  interruptShow(): void { this.show = []; this.showCount = 0; }

  getLevelName(): string { return this.host.findLevelName(this.codename); }

  // ---- LevelCountDown
  private countdownReset(): void {
    if (!this.status) throw new Error('level status is NULL');
    this.status.setRunning(true);
    this.countdown = -1;
  }
  private countDown(): boolean {
    if (this.countdown < 0) this.setCountDown();
    else if (this.countdown > 0) this.countdown--;
    else return true;
    return false;
  }
  private setCountDown(): void {
    if (this.room.isSolved()) this.countdown = this.getCountForSolved();
    else if (this.room.cannotMove()) this.countdown = 75;
    else this.countdown = -1;
  }
  private getCountForSolved(): number {
    if (this.isUndoing()) return -1;
    if (this.isLoading()) return 0;
    if (this.script.dialogs.areRunning()) return 30;
    return 10;
  }
  private isFinishedEnough(): boolean { return this.countdown === 0 && this.room.isSolved(); }
  private isWrongEnough(): boolean { return this.countdown === 0 && this.room.cannotMove() && !this.room.isSolved(); }

  private loadingReset(): void {
    this.loadPaused = false;
    this.replayMode = false;
    this.loadSpeed = 1;
    this.loadedMoves = '';
  }

  // ---- LevelInput (StateInput for Esc, F1, F10, F6)
  keyDown(key: string): void {
    switch (key) {
      case 'Escape': this.quitState(); return;
      case 'F1': { const h = this.host.createHelp?.(); if (h) this.pushState(h); return; }
      case 'F10': { const m = this.host.createMenu?.(); if (m) this.pushState(m); return; }
      case 'F6': this.toggleParam('subtitles'); return;
      case ' ': if (!this.isActing()) this.switchFish(); return;
      case 'F2': if (!this.isActing()) this.action_save(); return;
      case 'F3': if (!this.isShowing()) this.action_load(); return;
      case 'Backspace': this.interruptShow(); this.action_restart(1); return;
      case 'F5': this.toggleParam('show_steps'); return;
      case '-': case 'KP-': if (!this.isShowing()) this.action_undo(1); return;
      case '+': case '=': case 'KP+': if (!this.isShowing()) this.action_undo(-1); return;
    }
    if (!this.isActing()) this.controlEvent(key);
  }

  keyUp(key: string): void {
    if (key === '-' || key === 'KP-' || key === '+' || key === '=' || key === 'KP+') this.action_undo_finish();
  }

  mouseDown(x: number, y: number, button: number): void { this.controlMouse(x, y, button); }

  private toggleParam(p: string): void {
    this.env.options.setPersistent(p, !this.env.options.getAsBool(p));
  }

  /** run a frame's logic with a script error caught: the original stopped with the exception */
  static guard(f: () => void, onError: (e: Error) => void): void {
    try {
      f();
    } catch (e) {
      if (e instanceof ScriptException || e instanceof LuaError || e instanceof LoadException) onError(e as Error);
      else throw e;
    }
  }
}

export { DIR_UP, DIR_DOWN, Anim };
