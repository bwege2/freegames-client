// The rules of Fish Fillets NG: models on a field, falling, pushing, dying, going out.
// A translation of src/level/{Cube,Rules,MarkMask,Field,Shape,Goal,Landslip,ModelList,Unit,Controls,
// ModelFactory,Dir}.cpp of fillets-ng 1.0.1. Pure logic: no drawing, no sound.
import { Anim } from './anim.ts';

export const DIR_NO = 0, DIR_UP = 1, DIR_DOWN = 2, DIR_LEFT = 3, DIR_RIGHT = 4;
export type Dir = 0 | 1 | 2 | 3 | 4;
export const NONE = 0, LIGHT = 1, HEAVY = 2, FIXED = 3;
export type Weight = 0 | 1 | 2 | 3;
export const ACTION_NO = 0, ACTION_FALL = 1, ACTION_MOVE = 2;
export type Action = 0 | 1 | 2;

export interface V2 { x: number; y: number }

export function dir2xy(dir: Dir): V2 {
  switch (dir) {
    case DIR_UP: return { x: 0, y: -1 };
    case DIR_DOWN: return { x: 0, y: 1 };
    case DIR_LEFT: return { x: -1, y: 0 };
    case DIR_RIGHT: return { x: 1, y: 0 };
    default: return { x: 0, y: 0 };
  }
}

export class LayoutException extends Error {}
export class LoadException extends Error {}
export class LogicException extends Error {}

/** Shape.cpp: "XX.\n.X" */
export class Shape {
  marks: V2[] = [];
  w: number;
  h: number;
  constructor(shape: string) {
    let x = 0, y = 0, maxX = -1, maxY = -1;
    for (const c of shape) {
      if (c === '\n') { y++; x = 0; } else if (c === 'X') {
        this.marks.push({ x, y });
        maxX = Math.max(maxX, x);
        maxY = Math.max(maxY, y);
        x++;
      } else if (c === '.') x++;
      else throw new LayoutException(`bad shape char '${c}'`);
    }
    this.w = maxX + 1;
    this.h = maxY + 1;
  }
}

const SATISFY_TRUE = 0, SATISFY_FALSE = 1, SATISFY_IGNORE = 2;
export class Goal {
  out: number;
  alive: number;
  constructor(out: number, alive: number) { this.out = out; this.alive = alive; }
  static noGoal() { return new Goal(SATISFY_IGNORE, SATISFY_IGNORE); }
  static outGoal() { return new Goal(SATISFY_TRUE, SATISFY_IGNORE); }
  static escapeGoal() { return new Goal(SATISFY_TRUE, SATISFY_TRUE); }
  static aliveGoal() { return new Goal(SATISFY_IGNORE, SATISFY_TRUE); }
  isSatisfy(m: Cube): boolean {
    let r = true;
    if (this.out === SATISFY_TRUE) r = r && m.out;
    else if (this.out === SATISFY_FALSE) r = r && !m.out;
    if (this.alive === SATISFY_TRUE) r = r && m.alive;
    else if (this.alive === SATISFY_FALSE) r = r && !m.alive;
    return r;
  }
  isWrong(m: Cube): boolean {
    let w = false;
    if (this.alive === SATISFY_TRUE) w = w || !m.alive;
    if (this.out === SATISFY_FALSE) w = w || m.out;
    return w;
  }
  shouldGoOut(): boolean { return this.out === SATISFY_TRUE; }
}

let serial = 0;

/** Cube.cpp: one object in the game */
export class Cube {
  /** allocation order: MarkMask::unique() sorts by pointer, we sort by this */
  readonly serial = ++serial;
  index = -1;
  busy = false;
  loc: V2;
  alive: boolean;
  out = false;
  weight: Weight;
  power: Weight;
  lookLeft = true;
  lost = false;
  shape: Shape;
  anim = new Anim();
  rules: Rules;
  goal = Goal.noGoal();
  outDir: Dir = DIR_NO;
  outCapacity = 0;
  talking: ((index: number) => boolean) | null = null;

  constructor(loc: V2, weight: Weight, power: Weight, alive: boolean, shape: Shape) {
    this.loc = { x: loc.x, y: loc.y };
    this.weight = weight;
    this.power = power;
    this.alive = alive;
    this.shape = shape;
    this.rules = new Rules(this);
  }

  change_die(): void {
    this.alive = false;
    this.anim.changeEffect('disintegrate');
  }
  change_goingOut(): void { this.weight = FIXED; }
  change_goOut(): void { this.out = true; this.change_remove(); }
  change_remove(): void {
    this.lost = true;
    this.weight = NONE;
    this.loc = { x: -1000, y: -1000 };
  }
  change_turnSide(): void { this.lookLeft = !this.lookLeft; }
  getLastMoveDir(): Dir { return this.rules.dir; }
  isSatisfy(): boolean { return this.goal.isSatisfy(this); }
  isWrong(): boolean { return this.goal.isWrong(this); }
  isWall(): boolean { return this.weight >= FIXED; }
  shouldGoOut(): boolean { return this.goal.shouldGoOut(); }
  isBorder(): boolean { return this.index === -1; }
  isOutDir(dir: Dir): boolean { return this.outDir === dir; }
  setOutDir(dir: Dir, capacity = 2, weight: Weight = FIXED): void {
    this.outCapacity = capacity;
    this.outDir = dir;
    this.weight = weight;
  }
  setExtraParams(): void {
    this.lost = false;
    this.rules.resetLastDir();
  }
  decOutCapacity(): void {
    if (this.outCapacity > 0) {
      this.outCapacity--;
      if (this.outCapacity === 0) {
        this.outDir = DIR_NO;
        this.weight = LIGHT;
        this.outCapacity = -1;
      }
    }
  }
  isDisintegrated(): boolean { return this.anim.isDisintegrated(); }
  isTalking(): boolean { return this.talking !== null && this.talking(this.index); }
}

/** Field.cpp: [y][x] cells, the border everywhere outside */
export class Field {
  w: number;
  h: number;
  border: Cube;
  private marks: (Cube | null)[];
  constructor(w: number, h: number) {
    this.w = w;
    this.h = h;
    this.border = new Cube({ x: -1, y: -1 }, FIXED, NONE, false, new Shape('X\n'));
    this.marks = new Array(w * h).fill(null);
    this.border.rules.takeField(this);
  }
  getModel(x: number, y: number): Cube | null {
    if (x >= 0 && x < this.w && y >= 0 && y < this.h) return this.marks[y * this.w + x];
    return this.border;
  }
  setModel(x: number, y: number, model: Cube | null, toOverride: Cube | null): void {
    if (x >= 0 && x < this.w && y >= 0 && y < this.h) {
      const i = y * this.w + x;
      if (toOverride === null || this.marks[i] === toOverride) this.marks[i] = model;
    }
  }
}

function unique(models: Cube[]): Cube[] {
  models.sort((a, b) => a.serial - b.serial);
  return models.filter((m, i) => i === 0 || models[i - 1] !== m);
}

/** MarkMask.cpp */
export class MarkMask {
  model: Cube;
  field: Field;
  constructor(model: Cube, field: Field) { this.model = model; this.field = field; }

  getResist(dir: Dir): Cube[] {
    const s = dir2xy(dir);
    return this.getPlacedResist({ x: this.model.loc.x + s.x, y: this.model.loc.y + s.y });
  }
  getPlacedResist(loc: V2): Cube[] {
    const out: Cube[] = [];
    for (const m of this.model.shape.marks) {
      const r = this.field.getModel(loc.x + m.x, loc.y + m.y);
      if (r !== null && r !== this.model) out.push(r);
    }
    return unique(out);
  }
  mask(): void { this.write(this.model, null); }
  unmask(): void { this.write(null, this.model); }
  private write(model: Cube | null, toOverride: Cube | null): void {
    const { x, y } = this.model.loc;
    for (const m of this.model.shape.marks) this.field.setModel(x + m.x, y + m.y, model, toOverride);
  }
  getBorderDir(): Dir {
    const { x, y } = this.model.loc;
    for (const m of this.model.shape.marks) {
      const mx = x + m.x, my = y + m.y;
      if (mx === 0 && this.canGo(DIR_LEFT)) return DIR_LEFT;
      else if (mx === this.field.w - 1 && this.canGo(DIR_RIGHT)) return DIR_RIGHT;
      else if (my === 0 && this.canGo(DIR_UP)) return DIR_UP;
      else if (my === this.field.h - 1 && this.canGo(DIR_DOWN)) return DIR_DOWN;
    }
    return DIR_NO;
  }
  private canGo(dir: Dir): boolean { return this.model.rules.canMoveOthers(dir, FIXED); }
  isFullyOut(): boolean {
    const { x, y } = this.model.loc;
    for (const m of this.model.shape.marks) {
      const place = this.field.getModel(x + m.x, y + m.y);
      if (place === null || !place.isBorder()) return false;
    }
    return true;
  }
}

interface OnCondition { isSatisfy(m: Cube): boolean; isWrong(m: Cube): boolean }
const ON_WALL: OnCondition = { isSatisfy: (m) => m.isWall(), isWrong: (m) => m.alive };
const onStrongPad = (weight: Weight): OnCondition => ({
  isSatisfy: (m) => m.isWall() || (m.alive && m.power >= weight),
  isWrong: (m) => m.alive && m.power < weight,
});
const ON_STACK: OnCondition = {
  isSatisfy: (m) => !m.alive && m.rules.dir === DIR_NO && m.rules.isOnStrongPad(LIGHT),
  isWrong: (m) => m.alive,
};

export interface RuleOptions { strictRules: boolean }
export const ruleOptions: RuleOptions = { strictRules: true };

/** Rules.cpp */
export class Rules {
  dir: Dir = DIR_NO;
  readyToDie = false;
  readyToTurn = false;
  readyToActive = false;
  pushing = false;
  lastFall = false;
  outDepth = 0;
  touchDir: Dir = DIR_NO;
  model: Cube;
  mask: MarkMask | null = null;
  constructor(model: Cube) { this.model = model; }

  private get m(): MarkMask { return this.mask!; }

  takeField(field: Field): void {
    if (this.mask) this.mask.unmask();
    this.mask = new MarkMask(this.model, field);
    const resist = this.mask.getResist(DIR_NO);
    if (resist.length > 0) throw new LayoutException(`position is occupied: model at ${this.model.loc.x},${this.model.loc.y}`);
    this.mask.mask();
  }

  occupyNewPos(): void {
    this.touchDir = DIR_NO;
    if (this.dir !== DIR_NO) {
      this.pushing = false;
      const s = dir2xy(this.dir);
      this.model.loc = { x: this.model.loc.x + s.x, y: this.model.loc.y + s.y };
      this.m.mask();
    }
  }

  change_setLocation(loc: V2): void {
    this.m.unmask();
    if (loc.x < 0 && loc.y < 0) this.model.change_goOut();
    else {
      this.model.loc = { x: loc.x, y: loc.y };
      this.m.mask();
    }
  }

  checkDead(lastAction: Action): boolean {
    let dead = false;
    if (this.model.alive) {
      switch (lastAction) {
        case ACTION_FALL: dead = this.checkDeadFall(); break;
        case ACTION_MOVE: dead = this.checkDeadMove(); break;
        default: dead = false;
      }
      if (!dead) dead = this.checkDeadStress();
      if (dead) this.readyToDie = true;
    }
    return dead;
  }

  private checkDeadMove(): boolean {
    const strict = ruleOptions.strictRules;
    for (const i of this.m.getResist(DIR_UP)) {
      if (!i.alive) {
        const rd = i.rules.dir;
        if (rd !== DIR_NO && rd !== DIR_UP) {
          if (strict) {
            if (i.rules.isOnHolderBacks()) return true;
          } else if (!i.rules.isOnStack()) return true;
        }
      }
    }
    return false;
  }

  private checkDeadFall(): boolean {
    for (const i of this.whoIsFalling()) if (!i.rules.isOnWall()) return true;
    return false;
  }

  private checkDeadStress(): boolean {
    for (const i of this.whoIsHeavier(this.model.power)) if (!i.rules.isOnStrongPad(i.weight)) return true;
    return false;
  }

  changeState(): void {
    this.dir = DIR_NO;
    if (!this.model.lost && this.model.isDisintegrated()) {
      this.m.unmask();
      this.model.change_remove();
    }
    if (this.readyToTurn) {
      this.readyToTurn = false;
      this.model.change_turnSide();
    }
    this.readyToActive = false;
    if (this.readyToDie) {
      this.readyToDie = false;
      this.model.change_die();
    }
  }

  actionOut(): number {
    if (!this.model.lost && !this.model.busy && this.dir === DIR_NO) {
      if (this.model.shouldGoOut()) {
        if (this.m.isFullyOut()) {
          this.model.change_goOut();
          this.outDepth = -1;
        } else {
          const borderDir = this.m.getBorderDir();
          if (borderDir !== DIR_NO) {
            this.model.change_goingOut();
            this.moveDirBrute(borderDir);
            this.outDepth += 1;
          } else {
            this.outDepth = 0;
          }
        }
      }
    }
    return this.outDepth;
  }

  actionFall(): void {
    this.dir = DIR_DOWN;
    this.lastFall = true;
  }

  clearLastFall(): boolean {
    const last = this.lastFall;
    this.lastFall = false;
    return last;
  }

  freeOldPos(): void {
    if (this.dir !== DIR_NO) this.m.unmask();
  }

  private isOnCond(cond: OnCondition): boolean {
    let result = false;
    if (cond.isSatisfy(this.model)) result = true;
    else if (cond.isWrong(this.model)) result = false;
    else {
      this.m.unmask();
      result = false;
      for (const i of this.m.getResist(DIR_DOWN)) {
        if (i.rules.isOnCond(cond)) { result = true; break; }
      }
      this.m.mask();
    }
    return result;
  }

  isOnStack(): boolean { return this.isOnCond(ON_STACK); }
  isOnWall(): boolean { return this.isOnCond(ON_WALL); }
  isOnStrongPad(weight: Weight): boolean { return this.isOnCond(onStrongPad(weight)); }

  isOnHolderBacks(): boolean {
    let numDirectHolders = 0;
    for (const i of this.m.getResist(DIR_DOWN)) if (i.alive) numDirectHolders++;
    const pads = unique(this.getPads());
    return numDirectHolders === pads.length;
  }

  private getPads(): Cube[] {
    const pads: Cube[] = [];
    this.m.unmask();
    for (const i of this.m.getResist(DIR_DOWN)) {
      if (i.alive || i.isWall()) pads.push(i);
      else pads.push(...i.rules.getPads());
    }
    this.m.mask();
    return pads;
  }

  private isFalling(): boolean {
    return !this.model.alive && this.dir === DIR_DOWN;
  }

  private whoIsFalling(): Cube[] {
    const result: Cube[] = [];
    this.m.unmask();
    for (const i of this.m.getResist(DIR_UP)) {
      if (!i.isWall() && !i.alive) {
        if (i.rules.isFalling()) result.push(i);
        else result.push(...i.rules.whoIsFalling());
      }
    }
    this.m.mask();
    return result;
  }

  private isHeavier(power: Weight): boolean {
    return !this.model.isWall() && !this.model.alive && this.model.weight > power;
  }

  private whoIsHeavier(power: Weight): Cube[] {
    const result: Cube[] = [];
    this.m.unmask();
    for (const i of this.m.getResist(DIR_UP)) {
      if (!i.isWall()) {
        if (i.rules.isHeavier(power)) result.push(i);
        else result.push(...i.rules.whoIsHeavier(power));
      }
    }
    this.m.mask();
    return result;
  }

  canMoveOthers(dir: Dir, power: Weight): boolean {
    let result = true;
    this.m.unmask();
    for (const i of this.m.getResist(dir)) {
      if (this.model.shouldGoOut() && i.isBorder()) continue;
      if (!i.rules.canDir(dir, power)) { result = false; break; }
    }
    this.m.mask();
    return result;
  }

  private canDir(dir: Dir, power: Weight): boolean {
    let result = false;
    if (!this.model.alive && power >= this.model.weight) {
      if (this.model.isWall() && !this.model.shouldGoOut()) return false;
      result = this.canMoveOthers(dir, power);
    }
    return result;
  }

  private touchSpec(dir: Dir): boolean {
    const resist = this.m.getResist(dir);
    if (resist.length === 1 && resist[0].isOutDir(dir)) {
      resist[0].decOutCapacity();
      this.m.unmask();
      this.model.change_goOut();
      return true;
    }
    return false;
  }

  private setTouched(dir: Dir): void {
    this.touchDir = dir;
    if (!this.model.isWall()) {
      this.m.unmask();
      for (const i of this.m.getResist(dir)) if (!i.alive) i.rules.setTouched(dir);
      this.m.mask();
    }
  }

  actionMoveDir(dir: Dir): boolean {
    if (this.canMoveOthers(dir, this.model.power)) {
      this.moveDirBrute(dir);
      return true;
    }
    if (this.touchSpec(dir)) return true;
    this.setTouched(dir);
    return false;
  }

  moveDirBrute(dir: Dir): void {
    this.m.unmask();
    for (const i of this.m.getResist(dir)) {
      if (!i.isBorder()) {
        i.rules.moveDirBrute(dir);
        this.pushing = true;
      }
    }
    this.dir = dir;
    this.m.mask();
  }

  getAction(): string {
    if (this.readyToTurn) return 'turn';
    if (this.readyToActive) return 'activate';
    if (this.model.busy) return 'busy';
    switch (this.dir) {
      case DIR_LEFT: return 'move_left';
      case DIR_RIGHT: return 'move_right';
      case DIR_UP: return 'move_up';
      case DIR_DOWN: return 'move_down';
      default: return 'rest';
    }
  }

  getState(): string {
    if (this.outDepth === 1) return 'goout';
    if (!this.model.alive) return 'dead';
    if (this.model.isTalking()) return 'talking';
    if (this.pushing) return 'pushing';
    return 'normal';
  }

  isAtBorder(): boolean { return this.m.getBorderDir() !== DIR_NO; }
  isFreePlace(loc: V2): boolean { return this.m.getPlacedResist(loc).length === 0; }
  getResist(dir: Dir): Cube[] { return this.m.getResist(dir); }
  resetLastDir(): void { this.dir = DIR_NO; }
}

/** Landslip.cpp + ModelList::stoneOn/fallOn */
export class Landslip {
  models: Cube[];
  impact: Weight = NONE;
  stoned: boolean[];
  constructor(models: Cube[]) {
    this.models = models;
    this.stoned = new Array(models.length).fill(false);
  }
  computeFall(): boolean {
    for (;;) {
      let change = false;
      for (const m of this.models) if (this.stoneModel(m)) change = true;
      if (!change) break;
    }
    let falling = false;
    for (const m of this.models) falling = this.fallModel(m) || falling;
    return falling;
  }
  private stoneModel(m: Cube): boolean {
    if (!this.isStoned(m) && (this.isFixed(m) || this.isOnPad(m))) {
      this.stone(m);
      return true;
    }
    return false;
  }
  private isOnPad(m: Cube): boolean {
    for (const i of m.rules.getResist(DIR_DOWN)) if (this.isFixed(i)) return true;
    return false;
  }
  private isFixed(m: Cube): boolean { return this.isStoned(m) || m.isWall() || m.alive || m.lost; }
  private isStoned(m: Cube): boolean { return m.index > -1 ? this.stoned[m.index] : true; }
  private stone(m: Cube): void { if (m.index > -1) this.stoned[m.index] = true; }
  private fallModel(m: Cube): boolean {
    if (!this.isFixed(m)) {
      m.rules.actionFall();
      return true;
    }
    const lastFall = m.rules.clearLastFall();
    if (lastFall && this.impact < m.weight) this.impact = m.weight;
    return false;
  }
}

// ---------------------------------------------------------------- units and controls

/** SDL key names, as KeyControl uses them */
export interface KeyControl { up: string; down: string; left: string; right: string }
export const ARROWS: KeyControl = { up: 'up', down: 'down', left: 'left', right: 'right' };
export interface ControlSym { up: string; down: string; left: string; right: string }
export const SYM_NONE = '';

export interface InputProvider { isPressed(key: string): boolean }

/** Unit.cpp */
export class Unit {
  buttons: KeyControl;
  symbols: ControlSym;
  model!: Cube;
  startActive: boolean;
  constructor(buttons: KeyControl, symbols: ControlSym, startActive = false) {
    this.buttons = buttons;
    this.symbols = symbols;
    this.startActive = startActive;
  }
  canDrive(): boolean { return this.model.alive && !this.model.lost && !this.model.busy; }
  willMove(): boolean { return this.model.alive && !this.model.lost; }
  drive(input: InputProvider): string { return this.driveBorrowed(input, this.buttons); }
  driveBorrowed(input: InputProvider, b: KeyControl): string {
    if (this.canDrive()) {
      if (input.isPressed(b.left)) return this.goLeft();
      if (input.isPressed(b.right)) return this.goRight();
      if (input.isPressed(b.up)) return this.goUp();
      if (input.isPressed(b.down)) return this.goDown();
    }
    return SYM_NONE;
  }
  activate(): void { this.model.rules.readyToActive = true; }
  mySymbol(key: string): string { return this.mySymbolBorrowed(key, this.buttons); }
  mySymbolBorrowed(key: string, b: KeyControl): string {
    if (key === b.left) return this.symbols.left;
    if (key === b.right) return this.symbols.right;
    if (key === b.up) return this.symbols.up;
    if (key === b.down) return this.symbols.down;
    return SYM_NONE;
  }
  myOrder(dir: Dir): string {
    switch (dir) {
      case DIR_LEFT: return this.symbols.left;
      case DIR_RIGHT: return this.symbols.right;
      case DIR_UP: return this.symbols.up;
      case DIR_DOWN: return this.symbols.down;
      default: return SYM_NONE;
    }
  }
  driveOrder(move: string): string {
    if (this.canDrive()) {
      if (this.symbols.left === move) return this.goLeft();
      if (this.symbols.right === move) return this.goRight();
      if (this.symbols.up === move) return this.goUp();
      if (this.symbols.down === move) return this.goDown();
    }
    return SYM_NONE;
  }
  private goLeft(): string {
    if (this.model.lookLeft) return this.model.rules.actionMoveDir(DIR_LEFT) ? this.symbols.left : SYM_NONE;
    this.model.rules.readyToTurn = true;
    return this.symbols.left;
  }
  private goRight(): string {
    if (!this.model.lookLeft) return this.model.rules.actionMoveDir(DIR_RIGHT) ? this.symbols.right : SYM_NONE;
    this.model.rules.readyToTurn = true;
    return this.symbols.right;
  }
  private goUp(): string { return this.model.rules.actionMoveDir(DIR_UP) ? this.symbols.up : SYM_NONE; }
  private goDown(): string { return this.model.rules.actionMoveDir(DIR_DOWN) ? this.symbols.down : SYM_NONE; }
  isMoving(): boolean {
    if (!this.canDrive()) return false;
    const a = this.model.rules.getAction();
    return a === 'move_left' || a === 'move_right' || a === 'move_up' || a === 'move_down' || a === 'turn';
  }
  isTurning(): boolean { return this.model.rules.getAction() === 'turn'; }
  isPushing(): boolean { return this.model.rules.pushing; }
  isDrivenBy(s: string): boolean {
    return this.symbols.left === s || this.symbols.right === s || this.symbols.up === s || this.symbols.down === s;
  }
  countAnimPhases(anim: string): number { return this.model.anim.countAnimPhases(anim); }
  isPowerful(): boolean { return this.model.power >= HEAVY; }
}

export interface PhaseLocker { ensurePhases(count: number): void }

/** Controls.cpp; `active` is an index into units, units.length meaning end() */
export class Controls {
  units: Unit[] = [];
  active = 0;
  speedup = 0;
  switch_ = true;
  moves = '';
  strokeSymbol = SYM_NONE;
  locker: PhaseLocker;
  constructor(locker: PhaseLocker) { this.locker = locker; }

  private get end(): number { return this.units.length; }

  addUnit(unit: Unit): void {
    this.units.push(unit);
    for (let i = 0; i < this.units.length; i++) {
      if (this.units[i].startActive) { this.setActive(i); return; }
    }
    this.setActive(0);
  }

  getActive(): Unit | null { return this.active !== this.end ? this.units[this.active] : null; }

  driving(input: InputProvider): boolean {
    let moved = false;
    if (!this.useSwitch()) {
      if (!this.useStroke()) moved = this.driveUnit(input);
      else moved = true;
    }
    return moved;
  }

  private useSwitch(): boolean {
    let result = false;
    if (this.active !== this.end) {
      if (!this.units[this.active].willMove()) this.checkActive();
      if (this.switch_ && this.active !== this.end) {
        this.locker.ensurePhases(3);
        this.units[this.active].activate();
        result = true;
      }
    }
    this.switch_ = false;
    return result;
  }

  private useStroke(): boolean {
    if (this.strokeSymbol !== SYM_NONE) {
      this.makeMove(this.strokeSymbol);
      this.strokeSymbol = SYM_NONE;
      return true;
    }
    return false;
  }

  private driveUnit(input: InputProvider): boolean {
    let moved = SYM_NONE;
    if (this.active !== this.end) moved = this.units[this.active].driveBorrowed(input, ARROWS);
    if (moved === SYM_NONE) {
      for (let i = 0; i < this.units.length; i++) {
        moved = this.units[i].drive(input);
        if (moved !== SYM_NONE) { this.setActive(i); break; }
      }
    }
    if (moved !== SYM_NONE) this.moves += moved;
    return moved !== SYM_NONE;
  }

  lockPhases(): void {
    const a = this.getActive();
    if (a && a.isMoving()) {
      if (a.isPushing()) this.speedup = 0;
      else if (!a.isTurning()) this.speedup++;
      this.locker.ensurePhases(this.getNeededPhases(this.speedup));
    } else {
      this.speedup = 0;
    }
  }

  private getNeededPhases(speedup: number): number {
    let phases = 3;
    const a = this.getActive();
    if (a) {
      if (a.isTurning()) phases = a.countAnimPhases('turn');
      else if (speedup > 10) phases = Math.trunc(a.countAnimPhases('swam') / 6);
      else if (speedup > 6) phases = Math.trunc(a.countAnimPhases('swam') / 3);
      else phases = Math.trunc(a.countAnimPhases('swam') / 2);
    }
    return phases;
  }

  checkActive(): void {
    if (this.active === this.end || !this.units[this.active].canDrive()) this.switchActive();
  }

  switchActive(): void {
    if (this.units.length > 0) {
      const start = this.active;
      do {
        if (this.active === this.end || this.active + 1 === this.end) this.active = 0;
        else this.active++;
      } while (this.active !== start && !this.units[this.active].canDrive());
      if (start !== this.active) {
        this.speedup = 0;
        this.switch_ = true;
      }
    }
  }

  controlEvent(key: string): void {
    if (this.strokeSymbol === SYM_NONE) {
      if (this.active !== this.end) this.strokeSymbol = this.units[this.active].mySymbolBorrowed(key, ARROWS);
      if (this.strokeSymbol === SYM_NONE) {
        for (const u of this.units) {
          this.strokeSymbol = u.mySymbol(key);
          if (this.strokeSymbol !== SYM_NONE) return;
        }
      }
    }
  }

  activateSelected(occupant: Cube | null): boolean {
    for (let i = 0; i < this.units.length; i++) {
      if (this.units[i].model === occupant) {
        this.active = i;
        this.switch_ = true;
        return true;
      }
    }
    return false;
  }

  setMoves(moves: string): void {
    this.moves = moves;
    if (moves.length > 0) this.activateDriven(moves[moves.length - 1]);
  }

  private activateDriven(symbol: string): boolean {
    for (let i = 0; i < this.units.length; i++) {
      if (this.units[i].isDrivenBy(symbol)) {
        this.active = i;
        this.switch_ = true;
        return true;
      }
    }
    return false;
  }

  private setActive(i: number): void {
    if (this.active !== i) {
      this.speedup = 0;
      this.active = i;
    }
  }

  makeMove(move: string): boolean {
    for (let i = 0; i < this.units.length; i++) {
      if (this.units[i].driveOrder(move) === move) {
        this.setActive(i);
        this.moves += move;
        return true;
      }
    }
    return false;
  }

  cannotMove(): boolean {
    for (const u of this.units) if (u.willMove()) return false;
    return true;
  }

  getStepCount(): number { return this.moves.length; }
  isPowerful(): boolean { const a = this.getActive(); return a ? a.isPowerful() : false; }
  isDangerousMove(): boolean { const a = this.getActive(); return a ? a.isPushing() : false; }
}

/** ModelFactory.cpp */
export function createModel(kind: string, loc: V2, shape: string): Cube {
  if (kind.startsWith('output_')) {
    const dirs: Record<string, Dir> = { output_left: DIR_LEFT, output_right: DIR_RIGHT, output_up: DIR_UP, output_down: DIR_DOWN };
    const d = dirs[kind];
    if (d === undefined) throw new LogicException(`unknown border dir: ${kind}`);
    const m = new Cube(loc, FIXED, NONE, false, new Shape(shape));
    m.setOutDir(d);
    return m;
  }
  let weight: Weight, power: Weight = NONE, alive = false;
  if (kind === 'fish_small') { weight = LIGHT; power = LIGHT; alive = true; } else if (kind === 'fish_big') { weight = LIGHT; power = HEAVY; alive = true; } else if (kind.startsWith('fish_extra')) { weight = LIGHT; power = LIGHT; alive = true; } else if (kind.startsWith('fish_EXTRA')) { weight = LIGHT; power = HEAVY; alive = true; } else if (kind === 'item_light') weight = LIGHT;
  else if (kind === 'item_heavy') weight = HEAVY;
  else if (kind === 'item_fixed') weight = FIXED;
  else throw new LogicException(`unknown model kind: ${kind}`);
  return new Cube(loc, weight, power, alive, new Shape(shape));
}

const NO_KEYS: KeyControl = { up: '', down: '', left: '', right: '' };

export function createUnit(kind: string): Unit | null {
  if (kind === 'fish_small') return new Unit({ up: 'i', down: 'k', left: 'j', right: 'l' }, { up: 'u', down: 'd', left: 'l', right: 'r' }, true);
  if (kind === 'fish_big') return new Unit({ up: 'w', down: 's', left: 'a', right: 'd' }, { up: 'U', down: 'D', left: 'L', right: 'R' });
  if (kind.startsWith('fish_extra') || kind.startsWith('fish_EXTRA')) {
    const PREFIX = 'fish_extra-';
    if (kind.length !== PREFIX.length + 4) throw new LogicException(`you must specify control symbols: ${kind}`);
    const p = PREFIX.length;
    return new Unit(NO_KEYS, { up: kind[p], down: kind[p + 1], left: kind[p + 2], right: kind[p + 3] });
  }
  return null;
}
