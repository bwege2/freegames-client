// The original's timing core: KikiAction, KikiEvent and KikiActionObject (src/base/KikiAction.cpp,
// KikiEvent.cpp, KikiActionObject.cpp). Every movement and animation is an action with a duration in
// ms (scaled by the speed setting); the controller's "timer" event performs its actions once per frame
// with the frame's time stamp.
import { Controller } from './global.ts';

export const ONCE = 0;
export const CONTINUOUS = 1;
export const REPEAT = 2;

/** C++ std::vector erase of the first occurrence */
function eraseFirst<T>(list: T[], item: T): boolean {
  const i = list.indexOf(item);
  if (i < 0) return false;
  list.splice(i, 1);
  return true;
}

export class KikiAction {
  start = 0;
  rest = 0;
  current = 0;
  last = 0;
  event: KikiEvent | null = null;

  public object: KikiActionObject | null;
  public id: number;
  public name: string;
  public duration: number;
  public mode: number;
  constructor(
    object: KikiActionObject | null,
    id: number,
    name: string,
    duration = 0,
    mode = ONCE) {
    this.object = object;
    this.id = id;
    this.name = name;
    this.duration = duration;
    this.mode = mode;
    this.reset();
  }

  /** ~KikiAction */
  destroy(): void {
    if (this.event) this.event.removeAction(this);
    if (this.object) this.object.removeAction(this);
  }

  getId(): number { return this.id; }
  getName(): string { return this.name; }
  getObject(): KikiActionObject | null { return this.object; }

  init(): void { this.object!.initAction(this); }
  perform(): void { this.object!.performAction(this); }
  finish(): void { this.object!.finishAction(this); }
  finished(): void {
    this.object!.actionFinished(this);
    if (this.current === this.getDuration()) this.reset(); // keepRest wasn't called
  }

  reset(): void { this.start = 0; this.rest = 0; this.last = 0; this.current = 0; }

  takeRest(action: KikiAction): void {
    this.current = action.rest;
    this.start = action.start;
    this.last = 0;
    this.rest = 0;
  }

  keepRest(): void {
    if (this.rest !== 0) {
      this.current = this.rest;
      this.rest = 0;
    }
  }

  /** current / (float)getDuration(): 0/0 is NaN in C as here */
  getRelativeTime(): number { return Math.fround(this.current / this.getDuration()); }
  getRelativeDelta(): number { return Math.fround((this.current - this.last) / this.getDuration()); }
  getStart(): number { return this.start; }
  getDuration(): number { return Controller.mapMsTime(this.duration); }
  setDuration(d: number): void { this.duration = d; }

  performWithEvent(event: KikiEvent): void {
    const eventTime = event.getTime();
    if (this.start === 0) {
      this.start = eventTime;
      this.current = 0;
      this.rest = 0;
      this.last = 0;
      if (this.duration === 0 && this.mode === ONCE) event.removeAction(this);
      this.perform();
      this.last = this.current;
      if (this.duration === 0 && this.mode === ONCE) this.finished();
    } else {
      const currentDiff = eventTime - this.start;
      if (currentDiff >= this.getDuration()) {
        this.current = this.getDuration();
        this.start += this.current;
        this.rest = eventTime - this.start;
        this.perform();
        this.last = 0;
        if (this.mode === CONTINUOUS) {
          this.current = this.rest;
          return;
        }
        if (this.mode === ONCE) event.removeAction(this);
        this.finish();
        if (this.mode === REPEAT) {
          if (this.current === this.getDuration()) this.reset();
          return;
        }
        event.addFinishedAction(this);
      } else {
        this.current = currentDiff;
        this.perform();
        this.last = this.current;
      }
    }
  }
}

/** KikiPyAction (src/base/KikiPyAction.cpp): an action whose object is Python code. `once(f)` and
 * `continuous(f)` call f on perform; a KikiPyActionObject gets performAction/finishAction/actionFinished. */
export interface PyTarget {
  performAction(name: string, relTime: number): void;
  finishAction(name: string): void;
  actionFinished(name: string): void;
}

export class KikiPyAction extends KikiAction {
  public target: (() => unknown) | PyTarget;
  constructor(target: (() => unknown) | PyTarget, name: string, duration = 0, mode = ONCE) {
    super(null, 0, name, duration, mode);
    this.target = target;
  }
  init(): void {}
  perform(): void {
    if (typeof this.target === 'function') this.target();
    else this.target.performAction(this.name, this.getRelativeTime());
  }
  finish(): void {
    if (typeof this.target !== 'function') this.target.finishAction(this.name);
  }
  finished(): void {
    if (typeof this.target !== 'function') this.target.actionFinished(this.name);
    this.reset();
  }
}

export class KikiEvent {
  actions: KikiAction[] = [];
  save_actions: KikiAction[] = [];
  finished_actions: KikiAction[] = [];
  time = 0;

  public object: KikiActionObject | null;
  public name: string;
  constructor(object: KikiActionObject | null, name: string) {
    this.object = object;
    this.name = name;
  }

  getName(): string { return this.name; }
  getTime(): number { return this.time; }

  hasAction(action: KikiAction): boolean { return this.actions.includes(action); }

  addAction(action: KikiAction): void {
    if (!this.actions.includes(action)) {
      this.actions.push(action);
      action.event = this;
      action.init();
    }
  }

  removeAllActions(): void {
    while (this.actions.length) this.removeAction(this.actions[this.actions.length - 1]);
  }

  getActionsOfObject(object: KikiActionObject): KikiAction[] {
    return this.actions.filter((a) => a.getObject() === object);
  }

  /** The original erases while it iterates (std::vector): the element after each erased one is skipped.
   * (When the erased one was the last, the original reads past the end; here the loop ends.) */
  removeActionsOfObject(object: KikiActionObject): void {
    for (let i = 0; i < this.actions.length; i++) {
      if (this.actions[i].getObject() === object) this.removeAction(this.actions[i]);
    }
  }

  removeActionWithName(name: string): void {
    for (const a of this.actions) {
      if (a.getName() === name) { this.removeAction(a); return; }
    }
  }

  removeAction(action: KikiAction): void {
    action.event = null;
    eraseFirst(this.actions, action);
    eraseFirst(this.save_actions, action);
    eraseFirst(this.finished_actions, action);
  }

  triggerActions(): void {
    this.time = Controller.getTime();
    this.save_actions = this.actions.slice();
    while (this.save_actions.length) {
      const action = this.save_actions[this.save_actions.length - 1];
      action.performWithEvent(this);
      if (this.save_actions[this.save_actions.length - 1] === action) this.save_actions.pop();
    }
  }

  addFinishedAction(action: KikiAction): void { this.finished_actions.push(action); }

  finishActions(): void {
    while (this.finished_actions.length) {
      const action = this.finished_actions[this.finished_actions.length - 1];
      action.finished();
      if (this.finished_actions[this.finished_actions.length - 1] === action) this.finished_actions.pop();
    }
  }

  /** ~KikiEvent: forgets its actions (without telling them) */
  destroy(): void { this.actions.length = 0; }
}

export class KikiActionObject {
  actions: KikiAction[] = [];
  events: KikiEvent[] = [];

  initAction(_action: KikiAction): void {}
  performAction(_action: KikiAction): void {}
  finishAction(_action: KikiAction): void {}
  actionFinished(_action: KikiAction): void {}

  /** ~KikiActionObject */
  destroyActions(): void {
    while (this.actions.length) this.actions[this.actions.length - 1].destroy();
    while (this.events.length) this.events.pop()!.destroy();
  }

  addAction(action: KikiAction): void {
    if (!this.actions.includes(action)) this.actions.push(action);
  }

  startTimer(duration: number, mode = ONCE): void {
    const action = new KikiAction(this, 0, 'timer', duration, mode);
    this.actions.push(action);
    Controller.timer_event.addAction(action);
  }

  stopAction(action: KikiAction): void { Controller.timer_event.removeAction(action); }

  startTimedAction(action: KikiAction, duration = -1): void {
    if (duration >= 0) action.setDuration(duration);
    Controller.timer_event.addAction(action);
  }

  removeAction(action: KikiAction): void { eraseFirst(this.actions, action); }

  getActionWithId(actionId: number): KikiAction {
    if (actionId < this.actions.length && this.actions[actionId].getId() === actionId) return this.actions[actionId];
    for (const a of this.actions) if (a.getId() === actionId) return a;
    return null as unknown as KikiAction;
  }

  getActionWithName(name: string): KikiAction | null {
    for (const a of this.actions) if (a.getName() === name) return a;
    return null;
  }

  addEventWithName(name: string): number {
    if (this.getEventWithName(name)) return -1;
    this.events.push(new KikiEvent(this, name));
    return this.events.length - 1;
  }

  getEventWithId(id: number): KikiEvent { return this.events[id]; }

  getEventWithName(name: string): KikiEvent | null {
    for (const e of this.events) if (e.getName() === name) return e;
    return null;
  }
}
