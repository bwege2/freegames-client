// The original's world objects and bots, translated function by function from src/base/KikiObject.cpp,
// src/items/*.cpp and src/bots/*.cpp (kiki 1.0.2). Rendering is in ../render/; what an object's render()
// computed as state (angles, sizes, the bot's tire rotation) is kept here.
import { KikiAction, KikiActionObject, ONCE, CONTINUOUS, REPEAT } from './action.ts';
import { Controller } from './global.ts';
import { KikiPos, KQuaternion, KVector, kMax, kMin } from './math.ts';
import { colorOf, type KColor } from './colors.ts';
import { Snd } from './sound.ts';
import { KikiProjection } from './projection.ts';

// ------------------------------------------------------------------------------------------- KikiFace
export const KikiFace = { PX: 0, X: 0, PY: 1, Y: 1, PZ: 2, Z: 2, NX: 3, NY: 4, NZ: 5 } as const;

export function orientationForFace(face: number): KQuaternion {
  switch (face % 6) {
    case KikiFace.PZ: return new KQuaternion();
    case KikiFace.NZ: return KQuaternion.rotationAroundVector(180, new KVector(1, 0, 0));
    case KikiFace.PX: return KQuaternion.rotationAroundVector(90, new KVector(0, 1, 0));
    case KikiFace.NX: return KQuaternion.rotationAroundVector(-90, new KVector(0, 1, 0));
    case KikiFace.PY: return KQuaternion.rotationAroundVector(-90, new KVector(1, 0, 0));
    case KikiFace.NY: return KQuaternion.rotationAroundVector(90, new KVector(1, 0, 0));
  }
  return new KQuaternion();
}

export function normalVectorForFace(face: number): KVector {
  const o = face < 3 ? -1 : 1;
  switch (face % 3) {
    case 0: return new KVector(o, 0, 0);
    case 1: return new KVector(0, o, 0);
    case 2: return new KVector(0, 0, o);
  }
  return new KVector();
}

// ------------------------------------------------------------------------------------------ KikiObject
let nextUid = 1;

export class KikiObject extends KikiActionObject {
  /** class_space_egoistic (KIKI_OBJECT_VALUES): an egoistic object occupies its cell */
  static ego = false;
  static className = 'KikiObject';
  readonly uid = nextUid++;
  move_action: KikiAction | null = null;
  name: string | null = null;
  direction = new KVector();
  position = new KVector();
  current_position = new KVector();
  orientation = new KQuaternion();
  current_orientation = new KQuaternion();
  deleted = false;
  /** KNotificationObject receivers of KIKI_NOTIFICATION_OBJECT_DELETED */
  deleteReceivers: (() => void)[] = [];

  isSpaceEgoistic(): boolean { return (this.constructor as typeof KikiObject).ego; }
  getClassName(): string { return (this.constructor as typeof KikiObject).className; }

  newCellMate(_object: KikiObject): void {}
  cellMateLeft(_object: KikiObject): void {}
  bulletImpact(): void {}
  isSlippery(): boolean { return false; }

  getPos(): KikiPos { return KikiPos.fromVector(this.current_position); }
  setPosition(pos: KVector): void { this.position = pos.clone(); this.current_position = pos.clone(); }
  setCurrentPosition(pos: KVector): void { this.current_position = pos.clone(); }
  getPosition(): KVector { return this.position.clone(); }
  setOrientation(q: KQuaternion): void { this.orientation = q.clone(); this.current_orientation = q.clone(); }
  getOrientation(): KQuaternion { return this.orientation.clone(); }
  setCurrentOrientation(q: KQuaternion): void { this.current_orientation = q.clone(); }
  getCurrentOrientation(): KQuaternion { return this.current_orientation.clone(); }
  setName(n: string): void { this.name = n; }
  getName(): string { return this.name ?? 'noname'; }

  /** `delete object`: the subclasses' destructors (destroyParts), ~KikiObject, ~KikiActionObject */
  destroy(): void {
    if (this.deleted) return;
    this.deleted = true;
    this.destroyParts();
    Controller.world.removeObject(this);
    for (const r of this.deleteReceivers.slice()) r();
    this.destroyActions();
  }
  protected destroyParts(): void {}
}

export class KikiTmpObject extends KikiObject {
  static ego = true;
  static className = 'KikiTmpObject';
  time = 0;
  public object: KikiObject;
  constructor(object: KikiObject) { super();
    this.object = object;
  }
}

// ---------------------------------------------------------------------------------------- KikiPushable
export class KikiPushable extends KikiObject {
  static ego = true;
  static className = 'KikiPushable';
  static readonly ACTION_PUSH: number = 0;
  static readonly ACTION_FALL: number = 1;
  static readonly ACTION_END: number = 2;
  pushing_sound: number = Snd.STONE_MOVE;
  landing_sound: number = Snd.STONE_LAND;
  pusher: KikiObject | null = null;

  constructor() {
    super();
    this.addAction(new KikiAction(this, KikiPushable.ACTION_PUSH, 'push'));
    this.addAction(new KikiAction(this, KikiPushable.ACTION_FALL, 'fall', 40));
  }

  pushedByObjectInDirection(object: KikiObject, dir: KVector, duration: number): void {
    const pushAction = this.getActionWithId(KikiPushable.ACTION_PUSH);
    this.pusher = object;
    this.move_action = pushAction;
    this.direction = dir.clone();
    pushAction.setDuration(Controller.unmapMsTime(duration));
    Controller.timer_event.addAction(pushAction);
  }

  initAction(action: KikiAction): void {
    switch (action.getId()) {
      case KikiPushable.ACTION_PUSH:
        Controller.sound.playSound(this.pushing_sound);
      // fall through
      case KikiPushable.ACTION_FALL:
        Controller.world.objectWillMoveToPos(this, KikiPos.fromVector(this.position.add(this.direction)), action.getDuration());
    }
  }

  performAction(action: KikiAction): void {
    switch (action.getId()) {
      case KikiPushable.ACTION_PUSH:
      case KikiPushable.ACTION_FALL:
        this.setCurrentPosition(this.position.add(this.direction.mul(action.getRelativeTime())));
    }
  }

  finishAction(action: KikiAction): void {
    switch (action.getId()) {
      case KikiPushable.ACTION_PUSH:
      case KikiPushable.ACTION_FALL:
        this.move_action = null;
        Controller.world.objectMovedFromPos(this, this.position);
        this.setPosition(this.current_position);
    }
  }

  actionFinished(action: KikiAction): void {
    const actionId = action.getId();
    if (actionId === KikiPushable.ACTION_PUSH || actionId === KikiPushable.ACTION_FALL) {
      let gravityDir = this.direction.clone();
      if (actionId === KikiPushable.ACTION_PUSH) {
        if (this.pusher instanceof KikiBot) {
          gravityDir = this.pusher.getDown().toVector();
        } else if (this.pusher instanceof KikiBomb) {
          if (this instanceof KikiBot) {
            if (this.direction.equals(this.getUp().toVector())) {
              this.direction.reset();
              return;
            }
            gravityDir = this.getDown().toVector(); // bots pushed by bombs fall down
          } else {
            this.direction.reset();
            return; // objects pushed by bombs don't fall
          }
        }
      }
      if (Controller.world.isUnoccupiedPos(KikiPos.fromVector(this.position.add(gravityDir)))) {
        this.direction = gravityDir;
        this.move_action = this.getActionWithId(KikiPushable.ACTION_FALL);
        Controller.timer_event.addAction(this.move_action);
      } else {
        this.direction.reset();
        Controller.sound.playSoundAtPos(this.landing_sound, KikiPos.fromVector(this.position));
      }
    }
  }
}

// ------------------------------------------------------------------------------------- stones & walls
export class KikiStone extends KikiPushable {
  static ego = true;
  static className = 'KikiStone';
  color: KColor | null;
  public slippery: boolean;
  constructor(c: KColor | null = null, slippery = false) {
    super();
    this.slippery = slippery;
    this.color = c ? [...c] as KColor : null;
  }
  isSlippery(): boolean { return this.slippery; }
}

export class KikiWall extends KikiObject {
  static ego = true;
  static className = 'KikiWall';
}

export class KikiWireStone extends KikiStone {
  static ego = true;
  static className = 'KikiWireStone';
  wires: (KikiWire | null)[] = [null, null, null, null, null, null];

  constructor() { super(); }

  initAction(action: KikiAction): void {
    switch (action.getId()) {
      case KikiPushable.ACTION_PUSH:
      case KikiPushable.ACTION_FALL: {
        for (let i = 0; i < 6; i++) {
          const w = this.wires[i];
          if (w) {
            Controller.world.unsetObject(w);
            w.setActive(false);
          }
        }
        for (const g of Controller.world.getObjectsOfType(KikiGenerator) as KikiGenerator[]) {
          if (g.isActive()) g.activateWires();
        }
      }
    }
    super.initAction(action);
  }

  setPosition(pos: KVector): void {
    for (let i = 0; i < 6; i++) {
      const newPos = pos.sub(normalVectorForFace(i));
      if (this.isFreePos(newPos)) {
        const w = this.wires[i];
        if (w === null) {
          this.wires[i] = new KikiWire(i);
          Controller.world.addObjectAtPos(this.wires[i]!, KikiPos.fromVector(newPos));
        } else {
          Controller.world.setObjectAtPos(w, KikiPos.fromVector(newPos));
          w.updateActive();
        }
      } else if (this.wires[i]) {
        this.wires[i]!.destroy();
        this.wires[i] = null;
      }
    }
    for (const g of Controller.world.getObjectsOfType(KikiGenerator) as KikiGenerator[]) {
      if (g.isActive()) g.activateWires();
    }
    super.setPosition(pos);
  }

  setCurrentPosition(pos: KVector): void {
    super.setCurrentPosition(pos);
    for (let i = 0; i < 6; i++) {
      const w = this.wires[i];
      if (w) w.setPosition(pos.sub(normalVectorForFace(i)));
    }
  }

  isFreePos(pos: KVector): boolean {
    const p = KikiPos.fromVector(pos);
    if (Controller.world.isUnoccupiedPos(p)) return true;
    if (Controller.world.isValidPos(p)) {
      const occupant = Controller.world.getOccupantAtPos(p)!;
      return !(occupant instanceof KikiWall || occupant instanceof KikiStone);
    }
    return false;
  }
}

// --------------------------------------------------------------------------------------------- lights
/** OpenGL lights: GL_LIGHT0 is the camera's, KLight::initialize takes the first free of GL_LIGHT1..7 */
export const MAX_LIGHTS = 8;

export class KikiLight extends KikiObject {
  static ego = false;
  static className = 'KikiLight';
  radius: number;
  halo_radius = 1;
  quadratic_attenuation = 0;
  light_number = 0;
  ambient_color: KColor = [0, 0, 0, 1];
  diffuse_color: KColor = [1, 1, 1, 1];
  specular_color: KColor = [1, 1, 1, 1];

  constructor(pos?: KVector, r = 4.0) {
    super();
    this.radius = pos ? r : 4.0;
    if (pos) this.setPosition(pos);
    this.setup();
    if (pos) Controller.world.addObject(this);
  }

  setup(): void {
    this.halo_radius = 1.0;
    this.quadratic_attenuation = 1.0 / (this.radius * this.radius);
    this.ambient_color = colorOf('KikiLight', 'base');
    this.diffuse_color = colorOf('KikiLight', 'diffuse');
    this.specular_color = colorOf('KikiLight', 'specular');
    this.initialize();
  }

  /** KLight::initialize(0): the first light number that is not enabled */
  initialize(): void {
    if (this.light_number === 0) {
      const used = Controller.lightsEnabled;
      let n = 1;
      for (; n < MAX_LIGHTS; n++) if (!used[n]) break;
      if (n === MAX_LIGHTS) { this.light_number = 0; return; }
      this.light_number = n;
      used[n] = true;
    }
  }

  protected destroyParts(): void {
    if (this.light_number) Controller.lightsEnabled[this.light_number] = false;
  }
}

// ------------------------------------------------------------------------------------ switch and gate
export class KikiSwitch extends KikiObject {
  static ego = true;
  static className = 'KikiSwitch';
  static readonly ACTION_TOGGLE: number = 0;
  static readonly ACTION_ROTATE: number = 1;
  active: boolean;
  sound_on: number = Snd.SWITCH_ON;
  sound_off: number = Snd.SWITCH_OFF;
  angle = 0;
  light: KikiLight | null = null;
  protected SWITCH_OFF_EVENT: number;
  protected SWITCH_ON_EVENT: number;
  protected SWITCHED_EVENT: number;

  constructor(on: boolean | number = false) {
    super();
    this.active = !!on;
    this.SWITCH_OFF_EVENT = this.addEventWithName('off');
    this.SWITCH_ON_EVENT = this.addEventWithName('on');
    this.SWITCHED_EVENT = this.addEventWithName('switched');
    this.addAction(new KikiAction(this, KikiSwitch.ACTION_TOGGLE, 'toggle', 0));
    this.addAction(new KikiAction(this, KikiSwitch.ACTION_ROTATE, 'rotation', 2000, CONTINUOUS));
    if (this.active) {
      this.startTimedAction(this.getActionWithId(KikiSwitch.ACTION_ROTATE));
      this.newLight();
    }
  }

  private newLight(): void {
    const light = new KikiLight(this.position, 3.0);
    this.light = light;
    light.deleteReceivers.push(() => { if (this.light === light) this.light = null; });
  }

  protected destroyParts(): void { if (this.light) this.light.destroy(); }

  bulletImpact(): void { this.toggle(); }
  toggle(): void { this.setActive(!this.active); }
  isActive(): boolean { return this.active; }

  setActive(status: boolean | number = true): void {
    const s = !!status;
    if (this.active !== s) {
      this.active = s;
      if (this.active) {
        this.startTimedAction(this.getActionWithId(KikiSwitch.ACTION_ROTATE));
        Controller.sound.playSound(this.sound_on);
        this.events[this.SWITCH_ON_EVENT].triggerActions();
        this.newLight();
      } else {
        this.stopAction(this.getActionWithId(KikiSwitch.ACTION_ROTATE));
        Controller.sound.playSound(this.sound_off);
        this.events[this.SWITCH_OFF_EVENT].triggerActions();
        if (this.light) {
          this.light.destroy();
          this.light = null;
        }
      }
      this.events[this.SWITCHED_EVENT].triggerActions();
    }
  }

  setPosition(pos: KVector): void {
    if (this.light) this.light.setPosition(pos);
    super.setPosition(pos);
  }

  performAction(action: KikiAction): void {
    if (action.getId() === KikiSwitch.ACTION_TOGGLE) this.toggle();
    else this.angle += action.getRelativeDelta() * 360;
  }
}

export class KikiGate extends KikiSwitch {
  static ego = false;
  static className = 'KikiGate';
  value = 0;
  private ENTER_EVENT: number;

  constructor(open: boolean | number = false) {
    super(open);
    this.ENTER_EVENT = this.addEventWithName('enter');
    this.getActionWithId(KikiSwitch.ACTION_ROTATE).setDuration(3000);
    this.sound_on = Snd.GATE_OPEN;
    this.sound_off = Snd.GATE_CLOSE;
  }

  bulletImpact(): void {}

  newCellMate(object: KikiObject): void {
    if (object === Controller.getPlayer() && this.active) {
      Controller.sound.playSound(Snd.GATE_WARP);
      this.events[this.ENTER_EVENT].triggerActions();
    }
  }
}

// ----------------------------------------------------------------------------------------------- bomb
export class KikiBomb extends KikiPushable {
  static ego = true;
  static className = 'KikiBomb';
  static readonly ACTION_ROTATE: number = 2;
  static readonly ACTION_IMPLODE: number = 3;
  static readonly ACTION_EXPLODE: number = 4;
  angle = 0;
  size = 1.0;
  splitted = false;

  constructor() {
    super();
    this.addEventWithName('explode');
    this.addAction(new KikiAction(this, KikiBomb.ACTION_ROTATE, 'rotation', 2000, CONTINUOUS));
    this.addAction(new KikiAction(this, KikiBomb.ACTION_IMPLODE, 'implode', 100));
    this.addAction(new KikiAction(this, KikiBomb.ACTION_EXPLODE, 'explode', 100));
    this.startTimedAction(this.getActionWithId(KikiBomb.ACTION_ROTATE));
  }

  splitterInDirection(dir: KVector): void {
    let splitter = false;
    const pos = this.getPos().add(KikiPos.fromVector(dir));
    if (Controller.world.isUnoccupiedPos(pos)) {
      splitter = true;
    } else {
      const occupant = Controller.world.getRealOccupantAtPos(pos);
      if (occupant) {
        if (occupant instanceof KikiBomb) {
          occupant.bulletImpact();
          return;
        }
        if (Controller.world.mayObjectPushToPos(this, pos, this.getActionWithId(KikiBomb.ACTION_EXPLODE).getDuration())) {
          splitter = true;
        }
      }
    }
    if (splitter) Controller.world.addObjectAtPos(new KikiBombSplitter(dir), pos);
  }

  bulletImpact(): void {
    if (!this.splitted) {
      this.splitted = true;
      const directions = [[1, 0, 0], [0, 1, 0], [0, 0, 1], [-1, 0, 0], [0, -1, 0], [0, 0, -1]];
      for (const d of directions) this.splitterInDirection(new KVector(d[0], d[1], d[2]));
      this.startTimedAction(this.getActionWithId(KikiBomb.ACTION_IMPLODE));
      Controller.sound.playSoundAtPos(Snd.BOMB_EXPLODE, this.getPos());
      this.getEventWithName('explode')!.triggerActions();
    }
  }

  performAction(action: KikiAction): void {
    switch (action.getId()) {
      case KikiBomb.ACTION_ROTATE: this.angle += action.getRelativeDelta() * 360; break;
      case KikiBomb.ACTION_IMPLODE: this.size = 1.0 - action.getRelativeTime(); break;
      case KikiBomb.ACTION_EXPLODE: this.size = action.getRelativeTime(); break;
      default: super.performAction(action);
    }
  }

  actionFinished(action: KikiAction): void {
    const actionId = action.getId();
    if (actionId === KikiBomb.ACTION_IMPLODE) {
      this.destroy();
    } else if (actionId === KikiBomb.ACTION_EXPLODE) {
      this.splitterInDirection(this.direction);
      Controller.sound.playSoundAtPos(Snd.BOMB_SPLITTER, this.getPos());
      this.startTimedAction(this.getActionWithId(KikiBomb.ACTION_IMPLODE));
    } else {
      super.actionFinished(action);
    }
  }
}

export class KikiBombSplitter extends KikiBomb {
  static ego = false;
  static className = 'KikiBombSplitter';
  constructor(dir: KVector) {
    super();
    this.size = 0.0;
    this.splitted = true;
    this.direction = dir.clone();
    this.startTimedAction(this.getActionWithId(KikiBomb.ACTION_EXPLODE));
  }
}

// --------------------------------------------------------------------------------------------- bullet
const KIKI_BULLET_RADIUS = 0.1;

export class KikiBullet extends KikiObject {
  static ego = false;
  static className = 'KikiBullet';
  static readonly ACTION_FLY: number = 0;
  static readonly ACTION_EXPLODE: number = 1;
  size = KIKI_BULLET_RADIUS;
  color: KColor;
  src_object: KikiObject | null = null;

  constructor() {
    super();
    this.color = colorOf('KikiBullet', 'base');
    this.addAction(new KikiAction(this, KikiBullet.ACTION_FLY, 'fly', 40));
    this.addAction(new KikiAction(this, KikiBullet.ACTION_EXPLODE, 'explode', 200));
  }

  static shootFromBot(bot: KikiBot): void {
    const bullet = new KikiBullet();
    Controller.world.addObject(bullet);
    bullet.direction = bot.getCurrentDir();
    bullet.setPosition(bot.getPos().toVector().add(bullet.direction.div(2.0)));
    bullet.src_object = bot;
    const c = bot.getBodyColor();
    bullet.color = [c[0], c[1], c[2], 0.8];
    Controller.sound.playSoundAtPos(Snd.BULLET_SHOT, bot.getPos());
    if (bullet.hitObjectAtPos(KikiPos.fromVector(bullet.position.add(bullet.direction.div(2.0))))) return;
    Controller.timer_event.addAction(bullet.getActionWithId(KikiBullet.ACTION_FLY));
  }

  performAction(action: KikiAction): void {
    const relTime = action.getRelativeTime();
    const actionId = action.getId();
    if (actionId === KikiBullet.ACTION_FLY) {
      this.current_position = this.position.add(this.direction.mul(relTime));
    } else if (actionId === KikiBullet.ACTION_EXPLODE) {
      this.size = KIKI_BULLET_RADIUS + relTime / 2.0;
      this.color = [this.color[0], this.color[1], this.color[2], 0.8 * (1.0 - relTime)];
    }
  }

  hitObjectAtPos(pos: KikiPos): boolean {
    const world = Controller.world;
    if (world.isInvalidPos(pos) || world.isOccupiedPos(pos)) {
      const hitObject = world.getRealOccupantAtPos(pos);
      if (hitObject !== this.src_object) {
        if (hitObject) {
          hitObject.bulletImpact();
          if (hitObject instanceof KikiMutant && !hitObject.isDead()) {
            Controller.sound.playSoundAtPos(Snd.BULLET_HIT_MUTANT, pos);
          } else if (hitObject === Controller.player) {
            Controller.sound.playSoundAtPos(Snd.BULLET_HIT_PLAYER, pos);
          } else {
            Controller.sound.playSoundAtPos(Snd.BULLET_HIT_OBJECT, pos);
          }
        } else {
          Controller.sound.playSoundAtPos(Snd.BULLET_HIT_WALL, pos);
        }
        Controller.timer_event.addAction(this.getActionWithId(KikiBullet.ACTION_EXPLODE));
        return true;
      }
    }
    return false;
  }

  finishAction(action: KikiAction): void {
    if (action.getName() === 'fly') this.position = this.current_position.clone();
  }

  actionFinished(action: KikiAction): void {
    const actionId = action.getId();
    if (actionId === KikiBullet.ACTION_FLY) {
      if (this.hitObjectAtPos(KikiPos.fromVector(this.position.add(this.direction.div(2.0))))) return;
      Controller.timer_event.addAction(this.getActionWithId(KikiBullet.ACTION_FLY));
    } else if (actionId === KikiBullet.ACTION_EXPLODE) {
      Controller.world.deleteObject(this);
    }
  }
}

// ----------------------------------------------------------------------------------------------- wire
export class KikiWire extends KikiObject {
  static ego = false;
  static className = 'KikiWire';
  static readonly UP: number = 1;
  static readonly RIGHT: number = 2;
  static readonly DOWN: number = 4;
  static readonly VERTICAL: number = 5;
  static readonly LEFT: number = 8;
  static readonly HORIZONTAL: number = 10;
  static readonly ALL: number = 15;
  active = false;
  value = 1.0;
  private SWITCH_OFF_EVENT: number;
  private SWITCH_ON_EVENT: number;
  private SWITCHED_EVENT: number;

  public face: number;
  public connections: number;
  constructor(face: number = KikiFace.PZ, connections: number = KikiWire.ALL) {
    super();
    this.face = face;
    this.connections = connections;
    this.SWITCH_OFF_EVENT = this.addEventWithName('off');
    this.SWITCH_ON_EVENT = this.addEventWithName('on');
    this.SWITCHED_EVENT = this.addEventWithName('switched');
  }

  updateActive(): void {
    for (const n of this.getNeighborWires()) if (n.active) this.setActive(true);
  }

  setActive(a: boolean | number = true): void {
    const act = !!a;
    if (this.active !== act) {
      this.active = act;
      const neighbors = this.getNeighborWires();
      for (const n of neighbors) n.setActive(this.active);
      const cellSwitch = Controller.world.getObjectOfTypeAtPos(KikiSwitch, this.getPos()) as KikiSwitch | null;
      if (cellSwitch) cellSwitch.setActive(this.active);
      this.events[this.active ? this.SWITCH_ON_EVENT : this.SWITCH_OFF_EVENT].triggerActions();
      this.events[this.SWITCHED_EVENT].triggerActions();
    }
  }

  getNeighborWires(): KikiWire[] {
    const result: KikiWire[] = [];
    const points = this.getConnectionPoints();
    const rot = orientationForFace(this.face);
    const n = normalVectorForFace(this.face);
    const dirs: KVector[] = [new KVector(0, 0, 0)];
    if (this.connections & KikiWire.RIGHT) { dirs.push(rot.rotate(new KVector(1, 0, 0))); dirs.push(rot.rotate(new KVector(1, 0, 0)).add(n)); }
    if (this.connections & KikiWire.LEFT) { dirs.push(rot.rotate(new KVector(-1, 0, 0))); dirs.push(rot.rotate(new KVector(-1, 0, 0)).add(n)); }
    if (this.connections & KikiWire.UP) { dirs.push(rot.rotate(new KVector(0, 1, 0))); dirs.push(rot.rotate(new KVector(0, 1, 0)).add(n)); }
    if (this.connections & KikiWire.DOWN) { dirs.push(rot.rotate(new KVector(0, -1, 0))); dirs.push(rot.rotate(new KVector(0, -1, 0)).add(n)); }
    for (const d of dirs) {
      const neighbors = Controller.world.getObjectsOfTypeAtPos(KikiWire, KikiPos.fromVector(this.position.add(d))) as KikiWire[];
      for (const nb of neighbors) {
        if (nb === this) continue;
        const nbPoints = nb.getConnectionPoints();
        for (const p of points) {
          for (const q of nbPoints) {
            if (q.sub(p).length() < 0.1) result.push(nb);
          }
        }
      }
    }
    return result;
  }

  getConnectionPoints(): KVector[] {
    const list: KVector[] = [];
    const toBorder = normalVectorForFace(this.face).mul(0.5);
    const rot = orientationForFace(this.face);
    const base = this.position.add(toBorder);
    if (this.connections & KikiWire.RIGHT) list.push(base.add(rot.rotate(new KVector(0.5, 0, 0))));
    if (this.connections & KikiWire.LEFT) list.push(base.add(rot.rotate(new KVector(-0.5, 0, 0))));
    if (this.connections & KikiWire.UP) list.push(base.add(rot.rotate(new KVector(0, 0.5, 0))));
    if (this.connections & KikiWire.DOWN) list.push(base.add(rot.rotate(new KVector(0, -0.5, 0))));
    return list;
  }
}

// ---------------------------------------------------------------------- valve, gears, generator, motor
export class KikiValve extends KikiPushable {
  static ego = true;
  static className = 'KikiValve';
  static readonly ACTION_ROTATE: number = 2;
  angle = 0;
  clockwise = false;
  active = false;

  public face: number;
  constructor(face: number = KikiFace.PZ) {
    super();
    this.face = face;
    this.addAction(new KikiAction(this, KikiValve.ACTION_ROTATE, 'rotation', 2000, REPEAT));
    this.startTimedAction(this.getActionWithId(KikiValve.ACTION_ROTATE));
  }

  setPosition(pos: KVector): void {
    super.setPosition(pos);
    const p = this.getPos();
    const dir = this.face % 3;
    const sum = ((dir === 1 || dir === 2) ? p.x : 0) + ((dir === 0 || dir === 2) ? p.y : 0) + ((dir === 0 || dir === 1) ? p.z : 0);
    this.clockwise = sum % 2 !== 0;
  }

  performAction(action: KikiAction): void {
    if (action.getId() === KikiValve.ACTION_ROTATE) this.angle += action.getRelativeDelta() * 360;
    else super.performAction(action);
  }

  isActive(): boolean { return this.active; }
}

export class KikiGear extends KikiValve {
  static ego = true;
  static className = 'KikiGear';

  getNeighborDirections(): KikiPos[] {
    const neighbors = [
      [new KikiPos(0, 1, 0), new KikiPos(0, -1, 0), new KikiPos(0, 0, 1), new KikiPos(0, 0, -1)],
      [new KikiPos(1, 0, 0), new KikiPos(-1, 0, 0), new KikiPos(0, 0, 1), new KikiPos(0, 0, -1)],
      [new KikiPos(1, 0, 0), new KikiPos(-1, 0, 0), new KikiPos(0, 1, 0), new KikiPos(0, -1, 0)]];
    return neighbors[this.face % 3];
  }

  getNeighborGears(): KikiGear[] {
    const out: KikiGear[] = [];
    const pos = this.getPos();
    for (const d of this.getNeighborDirections()) {
      const neighbor = Controller.world.getOccupantAtPos(pos.add(d));
      if (neighbor instanceof KikiGear && neighbor.face === this.face) out.push(neighbor);
    }
    return out;
  }

  initAction(action: KikiAction): void {
    super.initAction(action);
    if (action.getId() === KikiPushable.ACTION_PUSH) this.setActive(false);
  }

  actionFinished(action: KikiAction): void {
    super.actionFinished(action);
    const id = action.getId();
    if (id === KikiPushable.ACTION_PUSH || id === KikiPushable.ACTION_FALL) {
      if (this.move_action === null) this.updateActive();
    }
  }

  updateActive(): void {
    this.setActive(false);
    for (const n of this.getNeighborGears()) {
      if (n.active) { this.setActive(true); return; }
    }
  }

  setActive(a: boolean | number = true): void {
    const act = !!a;
    if (this.active !== act) {
      this.active = act;
      Controller.sound.playSound(this.active ? Snd.GEAR_ON : Snd.GEAR_OFF);
      for (const n of this.getNeighborGears()) {
        if (this.active) n.setActive(true);
        else n.updateActive();
      }
    }
  }
}

export class KikiGenerator extends KikiGear {
  static ego = true;
  static className = 'KikiGenerator';

  activateWires(): void {
    for (const w of Controller.world.getObjectsOfTypeAtPos(KikiWire, this.getPos()) as KikiWire[]) w.setActive(this.active);
  }

  setActive(a: boolean | number = true): void {
    if (this.active !== !!a) {
      super.setActive(a);
      this.activateWires();
      Controller.sound.playSound(this.active ? Snd.GENERATOR_ON : Snd.GENERATOR_OFF);
    }
  }
}

export class KikiMotorGear extends KikiGear {
  static ego = true;
  static className = 'KikiMotorGear';
  constructor(face: number = KikiFace.PZ) {
    super(face);
    this.setActive(true);
  }
  updateActive(): void {}
}

export class KikiMotorCylinder extends KikiObject {
  static ego = true;
  static className = 'KikiMotorCylinder';
  static readonly ACTION_TUCKER: number = 0;
  active = false;
  value = 0;

  constructor(face: number = KikiFace.PZ) {
    super();
    this.orientation = orientationForFace(face);
    this.addAction(new KikiAction(this, KikiMotorCylinder.ACTION_TUCKER, 'tucker', 500, REPEAT));
    this.setActive(true);
  }

  setActive(a: boolean): void {
    if (this.active !== a) {
      this.active = a;
      if (this.active) this.startTimedAction(this.getActionWithId(KikiMotorCylinder.ACTION_TUCKER));
      else this.stopAction(this.getActionWithId(KikiMotorCylinder.ACTION_TUCKER));
    }
  }

  performAction(action: KikiAction): void {
    if (action.getId() === KikiMotorCylinder.ACTION_TUCKER) {
      const relTime = action.getRelativeTime();
      this.value = (relTime < 0.5 ? relTime : 1.0 - relTime) * 2;
    }
  }

  finishAction(action: KikiAction): void {
    if (action.getId() === KikiMotorCylinder.ACTION_TUCKER) Controller.sound.playSoundAtPos(Snd.MOTOR, this.getPos());
  }
}

// --------------------------------------------------------------------------------------------- spikes
const MIN_SPIKE_VALUE = 0.0;

export class KikiSpikes extends KikiObject {
  static ego = false;
  static className = 'KikiSpikes';
  spike = MIN_SPIKE_VALUE;
  spiked_bot: KikiBot | null = null;

  public face: number;
  constructor(face: number = KikiFace.PZ) {
    super();
    this.face = face;
    this.addAction(new KikiAction(this, 0, 'spike', 2000, REPEAT));
    this.startTimedAction(this.actions[0]);
  }

  performAction(action: KikiAction): void {
    const relTime = action.getRelativeTime();
    if (relTime < 0.33) {
      this.spike = kMax(relTime, MIN_SPIKE_VALUE);
      if (relTime === 0) Controller.sound.playSoundAtPos(Snd.SPIKES_START, KikiPos.fromVector(this.position));
    } else {
      this.spike = kMax(0.66 - relTime, MIN_SPIKE_VALUE);
    }
    if (this.spiked_bot) {
      if (relTime === 0) this.spikeBot(this.spiked_bot);
      else if (relTime < 0.66) this.spiked_bot.getStatus().addHealth(-action.getRelativeDelta() / 5.0);
      else this.spiked_bot.setSpiked(false);
    }
  }

  spikeBot(bot: KikiBot): void {
    if (bot.isDead()) {
      this.spiked_bot = null;
    } else {
      this.spiked_bot = bot;
      bot.setSpiked(true);
      if (bot === Controller.player) Controller.sound.playSound(Snd.BOT_SPIKED);
    }
  }

  newCellMate(object: KikiObject): void {
    if (object instanceof KikiBot) {
      if (this.spike !== MIN_SPIKE_VALUE) this.spikeBot(object);
      else this.spiked_bot = object;
    }
  }

  cellMateLeft(object: KikiObject): void {
    if (object === this.spiked_bot) this.spiked_bot = null;
  }
}

// ---------------------------------------------------------------------------------------------- atoms
const NEUTRON_ORBITS = [
  [0, 0, 1, 0], [0, 1, 0, 180], [1, 0, 0, 180], [0, 1, 1, 90], [1, 0, 1, -90],
  [-1, -1, 0, 180], [0, 1, -1, 45], [1, 0, -1, -45], [1, -1, 0, -45]];
const NUM_NEUTRONS = 9;

/** KikiNeutron (src/items/KikiNeutron.cpp): a sphere on an orbit around the nucleus */
export class KikiNeutron {
  start_angle: number;
  angle: number;
  orientation = new KQuaternion();
  constructor(orbitNormal: KVector, startAngle: number) {
    this.start_angle = startAngle;
    const n = orbitNormal.normal();
    const z = new KVector(0, 0, 1);
    // KVector::angle: RAD2DEG(acos(this->normal()*v.normal()))
    this.angle = (Math.acos(z.normal().dot(orbitNormal.normal())) * 180) / Math.PI;
    if (this.angle !== 0) this.orientation = KQuaternion.rotationAroundVector(this.angle, z.cross(n));
  }
}

export class KikiAtom extends KikiObject {
  static ego = false;
  static className = 'KikiAtom';
  neutrons: KikiNeutron[] = [];
  value: number;
  nucleus_size: number;
  constructor(neutrons = 9) {
    super();
    this.value = neutrons / NUM_NEUTRONS;
    this.nucleus_size = neutrons / (NUM_NEUTRONS * 2.0);
    for (let i = 0; i < neutrons; i++) this.addNeutron();
  }
  addNeutron(): void {
    const o = NEUTRON_ORBITS[this.neutrons.length];
    this.neutrons.push(new KikiNeutron(new KVector(o[0], o[1], o[2]), o[3]));
  }
  setValue(v: number): void {
    this.value = kMin(kMax(0.0, v), 1.0);
    this.nucleus_size = this.value / 2.0;
    while (this.value * NUM_NEUTRONS < this.neutrons.length) this.neutrons.pop();
    while (Math.floor(this.value * NUM_NEUTRONS) > this.neutrons.length) this.addNeutron();
  }
}

export class KikiMovesAtom extends KikiAtom {
  static className = 'KikiMovesAtom';
}

// -------------------------------------------------------------------------------------- fume and text
export class KikiBotFume extends KikiObject {
  static ego = false;
  static className = 'KikiBotFume';
  size = 0.0;
  alpha_value = 1.0;
  constructor() {
    super();
    this.startTimer(300);
  }
  performAction(action: KikiAction): void {
    const relTime = action.getRelativeTime();
    this.size = relTime * 0.25;
    this.alpha_value = 1.0 - relTime;
  }
  actionFinished(_action: KikiAction): void { this.destroy(); }
}

export class KikiCellText extends KikiObject {
  static ego = false;
  static className = 'KikiCellText';
  public text: string;
  public cell_height: number;
  constructor(text: string, cell_height = 1.0) { super();
    this.text = text;
    this.cell_height = cell_height;
  }
}

// ----------------------------------------------------------------------------------------------- bots
export class KikiBotStatus {
  moves = 0;
  min_moves = 100;
  health = 1.0;
  getMoves(): number { return this.moves; }
  setMoves(m: number): void { this.moves = m; }
  addMoves(m: number): void { this.moves += m; }
  getMinMoves(): number { return this.min_moves; }
  setMinMoves(m: number): void { this.min_moves = m; }
  getHealth(): number { return this.health; }
  /** health is a float in the original: 10 hits of -0.1 bring it to exactly 0 there, not in doubles */
  addHealth(h: number): void { this.health = Math.fround(kMax(0.0, Math.fround(this.health + Math.fround(h)))); }
}

export abstract class KikiBot extends KikiPushable {
  static ego = true;
  static className = 'KikiBot';
  static readonly ACTION_NOOP: number = 2;
  static readonly ACTION_FORWARD: number = 3;
  static readonly ACTION_CLIMB_UP: number = 4;
  static readonly ACTION_CLIMB_DOWN: number = 5;
  static readonly ACTION_TURN_LEFT: number = 6;
  static readonly ACTION_TURN_RIGHT: number = 7;
  static readonly ACTION_JUMP: number = 8;
  static readonly ACTION_JUMP_FORWARD: number = 9;
  static readonly ACTION_FALL_FORWARD: number = 10;
  static readonly ACTION_SHOOT: number = 11;
  static readonly ACTION_END: number = 12;

  left_tire_rot = 0;
  right_tire_rot = 0;
  last_fume = 0;
  status = new KikiBotStatus();
  move = false;
  push = false;
  jump = false;
  shoot = false;
  jump_once = false;
  spiked = false;
  died = false;
  dir_sgn = 1.0;
  rotate_action: KikiAction | null = null;
  rotate_orientation = new KQuaternion();
  climb_orientation = new KQuaternion();
  rest_orientation = new KQuaternion();

  constructor() {
    super();
    const B = KikiBot;
    this.addAction(new KikiAction(this, B.ACTION_NOOP, 'noop', 0));
    this.addAction(new KikiAction(this, B.ACTION_FORWARD, 'move forward', 200));
    this.addAction(new KikiAction(this, B.ACTION_CLIMB_UP, 'climb up', 200));
    this.addAction(new KikiAction(this, B.ACTION_CLIMB_DOWN, 'climb down', 500));
    this.addAction(new KikiAction(this, B.ACTION_TURN_LEFT, 'turn left', 200));
    this.addAction(new KikiAction(this, B.ACTION_TURN_RIGHT, 'turn right', 200));
    this.addAction(new KikiAction(this, B.ACTION_JUMP, 'jump', 120));
    this.addAction(new KikiAction(this, B.ACTION_JUMP_FORWARD, 'jump forward', 200));
    this.addAction(new KikiAction(this, B.ACTION_FALL_FORWARD, 'fall forward', 200));
    this.addAction(new KikiAction(this, B.ACTION_SHOOT, 'shoot', 200, REPEAT));
    this.getActionWithId(KikiPushable.ACTION_FALL).setDuration(120);
    this.addEventWithName('died');
    this.startTimedAction(this.getActionWithId(B.ACTION_NOOP), 500);
  }

  abstract getBodyColor(): KColor;
  abstract getDeadColor(): KColor;
  abstract getTireColor(): KColor;

  setSpiked(b: boolean): void { this.spiked = b; }
  setMove(b: boolean): void { this.move = b; }
  isDead(): boolean { return this.status.getHealth() === 0.0; }
  isFalling(): boolean { return !!this.move_action && this.move_action.getId() === KikiPushable.ACTION_FALL; }
  getStatus(): KikiBotStatus { return this.status; }
  getDown(): KikiPos { return KikiPos.fromVector(this.orientation.rotate(new KVector(0, 1, 0)).neg()); }
  getUp(): KikiPos { return KikiPos.fromVector(this.orientation.rotate(new KVector(0, 1, 0))); }
  getDir(): KikiPos { return KikiPos.fromVector(this.orientation.rotate(new KVector(0, 0, 1)).mul(this.dir_sgn)); }
  getCurrentDir(): KVector { return this.current_orientation.rotate(new KVector(0, 0, 1)).normal(); }

  die(): void {
    Controller.timer_event.removeActionsOfObject(this);
    this.move = false;
    this.jump = false;
    this.shoot = false;
    this.push = false;
    this.getEventWithName('died')!.triggerActions();
    this.died = true;
  }

  reset(): void {
    this.left_tire_rot = 0;
    this.right_tire_rot = 0;
    this.last_fume = 0;
    this.direction.reset();
    this.orientation.reset();
    this.current_orientation.reset();
    this.rotate_orientation.reset();
    this.climb_orientation.reset();
    this.rest_orientation.reset();
    this.move_action = null;
    this.move = false;
    this.push = false;
    this.jump = false;
    this.shoot = false;
    this.jump_once = false;
    this.spiked = false;
    this.died = false;
  }

  initAction(action: KikiAction): void {
    let newPos = KikiPos.fromVector(this.position);
    const B = KikiBot;
    switch (action.getId()) {
      case B.ACTION_NOOP: return;
      case B.ACTION_FORWARD: newPos = newPos.add(this.getDir()); break;
      case B.ACTION_CLIMB_DOWN: newPos = newPos.add(this.getDir().add(this.getDown())); break;
      case B.ACTION_JUMP: newPos = newPos.add(this.getUp()); break;
      case B.ACTION_JUMP_FORWARD: newPos = newPos.add(this.getUp().add(this.getDir())); break;
      case B.ACTION_FALL_FORWARD: newPos = newPos.add(this.getDown().add(this.getDir())); break;
      case KikiPushable.ACTION_FALL:
        if (!this.direction.isZero()) {
          super.initAction(action);
          return;
        }
        newPos = newPos.add(this.getDown());
        break;
      default:
        super.initAction(action);
        return;
    }
    if (!newPos.equals(KikiPos.fromVector(this.position))) {
      Controller.world.objectWillMoveToPos(this, newPos, action.getDuration());
    }
  }

  performAction(action: KikiAction): void {
    const actionId = action.getId();
    const relTime = action.getRelativeTime();
    const dltTime = action.getRelativeDelta();
    const B = KikiBot;
    const HALF_PI = Math.PI / 2;
    switch (actionId) {
      case B.ACTION_SHOOT:
        if (relTime === 0) KikiBullet.shootFromBot(this);
        return;
      case B.ACTION_NOOP:
        return;
      case B.ACTION_FORWARD:
        this.left_tire_rot += this.dir_sgn * dltTime;
        this.right_tire_rot += this.dir_sgn * dltTime;
        this.current_position = this.position.add(this.getDir().toVector().mul(relTime));
        return;
      case B.ACTION_JUMP:
        this.current_position = this.position.add(this.getUp().toVector().mul(Math.cos(HALF_PI - HALF_PI * relTime)));
        return;
      case B.ACTION_JUMP_FORWARD:
        this.left_tire_rot += Math.cos(HALF_PI - HALF_PI * dltTime);
        this.right_tire_rot += Math.cos(HALF_PI - HALF_PI * dltTime);
        this.current_position = this.position
          .add(this.getDir().toVector().mul(1.0 - Math.cos(HALF_PI * relTime)))
          .add(this.getUp().toVector().mul(Math.cos(HALF_PI - HALF_PI * relTime)));
        return;
      case B.ACTION_FALL_FORWARD:
        this.current_position = this.position
          .add(this.getDir().toVector().mul(Math.cos(HALF_PI - HALF_PI * relTime)))
          .add(this.getDown().toVector().mul(1.0 - Math.cos(HALF_PI * relTime)));
        return;
      case KikiPushable.ACTION_FALL:
        if (!this.direction.isZero()) {
          super.performAction(action);
          return;
        }
        this.current_position = this.position.add(this.getDown().toVector().mul(relTime));
        return;
      case B.ACTION_CLIMB_UP:
        this.left_tire_rot += (this.dir_sgn * dltTime) / 2;
        this.right_tire_rot += (this.dir_sgn * dltTime) / 2;
        this.climb_orientation = KQuaternion.rotationAroundVector(this.dir_sgn * relTime * -90.0, new KVector(1, 0, 0));
        break;
      case B.ACTION_CLIMB_DOWN:
        this.left_tire_rot += this.dir_sgn * dltTime;
        this.right_tire_rot += this.dir_sgn * dltTime;
        if (relTime <= 0.2) {
          this.current_position = this.position.add(this.getDir().toVector().mul((relTime / 0.2) / 2));
        } else if (relTime >= 0.8) {
          this.climb_orientation = KQuaternion.rotationAroundVector(this.dir_sgn * 90.0, new KVector(1, 0, 0));
          this.current_position = this.position.add(this.getDir().toVector())
            .add(this.getDown().toVector().mul(0.5 + (relTime - 0.8) / 0.2 / 2));
        } else {
          this.climb_orientation = KQuaternion.rotationAroundVector(this.dir_sgn * ((relTime - 0.2) / 0.6) * 90.0, new KVector(1, 0, 0));
          const rotVec = this.orientation.mul(this.climb_orientation).rotate(new KVector(0, 1, 0));
          this.current_position = this.position.add(this.getDir().toVector().add(this.getDown().toVector()).add(rotVec).mul(0.5));
        }
        break;
      case B.ACTION_TURN_LEFT:
      case B.ACTION_TURN_RIGHT:
        if (this.move_action === null && relTime === 0.0) {
          // update orientation now, so next move action will move in desired direction
          if (actionId === B.ACTION_TURN_LEFT) {
            this.orientation.mulSelf(KQuaternion.rotationAroundVector(90.0, new KVector(0, 1, 0)));
            this.rest_orientation = KQuaternion.rotationAroundVector(-90.0, new KVector(0, 1, 0));
          } else {
            this.orientation.mulSelf(KQuaternion.rotationAroundVector(-90.0, new KVector(0, 1, 0)));
            this.rest_orientation = KQuaternion.rotationAroundVector(90.0, new KVector(0, 1, 0));
          }
        }
        if (actionId === B.ACTION_TURN_LEFT) {
          this.left_tire_rot += -dltTime;
          this.right_tire_rot += dltTime;
          this.rotate_orientation = KQuaternion.rotationAroundVector(relTime * 90.0, new KVector(0, 1, 0));
        } else {
          this.left_tire_rot += dltTime;
          this.right_tire_rot += -dltTime;
          this.rotate_orientation = KQuaternion.rotationAroundVector(relTime * -90.0, new KVector(0, 1, 0));
        }
        break;
      default:
        super.performAction(action);
        return;
    }
    this.current_orientation = this.orientation.mul(this.climb_orientation).mulSelf(this.rotate_orientation).mulSelf(this.rest_orientation);
  }

  finishAction(action: KikiAction): void {
    const actionId = action.getId();
    const B = KikiBot;
    if (actionId === B.ACTION_NOOP || actionId === B.ACTION_SHOOT) return;
    if (actionId === KikiPushable.ACTION_PUSH) {
      super.finishAction(action);
      return;
    }
    if (actionId === B.ACTION_TURN_LEFT || actionId === B.ACTION_TURN_RIGHT) {
      this.rotate_action = null;
      if (this.move_action) {
        // bot currently performing a move action -> store rotation in rest_orientation
        this.rest_orientation.mulSelf(this.rotate_orientation);
        this.rotate_orientation.reset();
      } else {
        this.orientation.mulSelf(this.rotate_orientation.mul(this.rest_orientation));
        this.rotate_orientation.reset();
        this.rest_orientation.reset();
      }
    } else if (actionId < B.ACTION_END) {
      this.move_action = null;
      this.orientation.mulSelf(this.climb_orientation);
      this.climb_orientation.reset();
      if (this.rotate_action && actionId !== B.ACTION_JUMP_FORWARD) {
        // take over result of rotation to prevent sliding
        if (this.rotate_action.getId() === B.ACTION_TURN_LEFT) {
          this.orientation.mulSelf(KQuaternion.rotationAroundVector(90.0, new KVector(0, 1, 0)).mulSelf(this.rest_orientation));
          this.rest_orientation = KQuaternion.rotationAroundVector(-90.0, new KVector(0, 1, 0));
        } else {
          this.orientation.mulSelf(KQuaternion.rotationAroundVector(-90.0, new KVector(0, 1, 0)).mulSelf(this.rest_orientation));
          this.rest_orientation = KQuaternion.rotationAroundVector(90.0, new KVector(0, 1, 0));
        }
      }
      if (actionId !== B.ACTION_CLIMB_UP) {
        Controller.world.objectMovedFromPos(this, this.position);
        this.position = this.current_position.round();
      }
      if (actionId !== B.ACTION_JUMP_FORWARD && this.rotate_action === null) {
        this.orientation.mulSelf(this.rest_orientation);
        this.rest_orientation.reset();
      }
    }
  }

  actionFinished(action: KikiAction): void {
    const actionId = action.getId();
    const B = KikiBot;
    const world = Controller.world;
    if (this.isDead()) {
      if (!this.died) this.die();
      if (actionId !== KikiPushable.ACTION_PUSH && actionId !== KikiPushable.ACTION_FALL) return; // dead may only fall
    }
    if (this.spiked) {
      this.move_action = null;
      this.startTimedAction(this.getActionWithId(B.ACTION_NOOP), 0);
      return;
    }
    if (actionId === KikiPushable.ACTION_PUSH || !this.direction.isZero()) {
      super.actionFinished(action);
      return;
    }
    if (this.move_action) return; // action was not a move action -> return

    const pos = this.position;
    const up = this.getUp();
    const dir = this.getDir();
    const at = (v: KVector): KikiPos => KikiPos.fromVector(v);
    if (actionId === B.ACTION_JUMP_FORWARD) {
      const forwardPos = pos.add(dir);
      if (world.isUnoccupiedPos(at(forwardPos))) {
        if (world.isUnoccupiedPos(at(forwardPos.sub(up)))) {
          this.move_action = this.getActionWithId(B.ACTION_FALL_FORWARD);
          this.move_action.takeRest(action);
        } else {
          this.move_action = this.getActionWithId(B.ACTION_FORWARD);
          Controller.sound.playSoundAtPos(Snd.BOT_LAND, this.getPos(), 0.25);
        }
      } else if (world.isUnoccupiedPos(at(pos.sub(up)))) {
        this.move_action = this.getActionWithId(B.ACTION_CLIMB_UP);
        Controller.sound.playSoundAtPos(Snd.BOT_LAND, this.getPos(), 0.5);
      }
    } else if (world.isUnoccupiedPos(at(pos.sub(up)))) {
      if (this.move) {
        if (world.isUnoccupiedPos(at(pos.add(dir)))) {
          if (world.isOccupiedPos(at(pos.add(dir).sub(up)))) {
            const occupant = world.getOccupantAtPos(at(pos.add(dir).sub(up)));
            if (occupant === null || !occupant.isSlippery()) this.move_action = this.getActionWithId(B.ACTION_FORWARD);
          }
        } else {
          const occupant = world.getOccupantAtPos(at(pos.add(dir)));
          if (occupant === null || !occupant.isSlippery()) this.move_action = this.getActionWithId(B.ACTION_CLIMB_UP);
        }
      }
      if (this.move_action === null) {
        this.move_action = this.getActionWithId(KikiPushable.ACTION_FALL);
        this.move_action.takeRest(action);
      }
    } else if (actionId === KikiPushable.ACTION_FALL || actionId === B.ACTION_FALL_FORWARD) {
      // landed
      if (this === (Controller.player as KikiBot)) Controller.sound.playSound(Snd.BOT_LAND);
      else Controller.sound.playSoundAtPos(Snd.BOT_LAND, this.getPos());
    }

    if (this.move_action) {
      Controller.timer_event.addAction(this.move_action);
      return;
    }
    if (this.rotate_action) return;
    if (this.move) {
      this.moveBot();
    } else {
      this.dir_sgn = 1.0;
      if (actionId !== B.ACTION_NOOP) this.jump_once = false;
      // keep action chain flowing in order to detect environment changes
      this.startTimedAction(this.getActionWithId(B.ACTION_NOOP), 0);
    }
  }

  moveBot(): void {
    const B = KikiBot;
    const world = Controller.world;
    this.move_action = null;
    const forwardPos = KikiPos.fromVector(this.position).add(this.getDir());
    const pos = KikiPos.fromVector(this.position);
    if ((this.jump || this.jump_once) && this.dir_sgn === 1.0 && world.isUnoccupiedPos(pos.add(this.getUp()))) {
      if (world.isUnoccupiedPos(forwardPos.add(this.getUp())) && world.isUnoccupiedPos(forwardPos)) {
        this.move_action = this.getActionWithId(B.ACTION_JUMP_FORWARD);
      } else {
        this.move_action = this.getActionWithId(B.ACTION_JUMP);
      }
    } else if (world.isUnoccupiedPos(forwardPos)) {
      if (world.isUnoccupiedPos(forwardPos.add(this.getDown()))) {
        this.move_action = this.getActionWithId(B.ACTION_CLIMB_DOWN);
      } else {
        this.move_action = this.getActionWithId(B.ACTION_FORWARD);
      }
    } else {
      const moveAction = this.getActionWithId(B.ACTION_FORWARD);
      if (this.push && world.mayObjectPushToPos(this, forwardPos, moveAction.getDuration())) {
        moveAction.reset();
        if (world.isUnoccupiedPos(forwardPos.add(this.getDown()))) {
          this.move_action = this.getActionWithId(B.ACTION_CLIMB_DOWN);
        } else {
          this.move_action = moveAction;
        }
      } else {
        this.move_action = this.getActionWithId(B.ACTION_CLIMB_UP);
      }
    }
    this.jump_once = false;
    if (this.move_action) {
      this.move_action.keepRest();
      Controller.timer_event.addAction(this.move_action);
    }
  }

  /** the fume KikiBot::render leaves behind while the bot moves (every 40 ms of game time) */
  emitFume(): void {
    if ((this.move_action || this.rotate_action) && !this.died) {
      const now = Controller.getTime();
      if (now - this.last_fume > Controller.mapMsTime(40)) {
        const fume = new KikiBotFume();
        Controller.world.addObject(fume);
        fume.setPosition(this.current_position.sub(this.getCurrentDir().mul(0.4)));
        this.last_fume = now;
      }
    }
  }
}

export class KikiMutant extends KikiBot {
  static ego = true;
  static className = 'KikiMutant';
  constructor() {
    super();
    this.move = true;
  }
  die(): void {
    Controller.sound.playSound(Snd.BOT_DEATH);
    super.die();
    this.getActionWithId(KikiPushable.ACTION_FALL).setDuration(40);
  }
  bulletImpact(): void { this.status.addHealth(-0.1); }
  getBodyColor(): KColor { return colorOf('KikiMutant', 'base'); }
  getDeadColor(): KColor { return colorOf('KikiMutant', 'dead'); }
  getTireColor(): KColor { return colorOf('KikiMutant', 'tire'); }

  moveBot(): void {
    const R = (): number => Controller.random.RANDOM();
    const changeOrientation = R() < 0.3;
    const changeJumpMode = R() < 0.3;
    const changeDirection = R() < 0.3;
    this.push = R() < 0.1;
    const fire = R() < 0.5;
    const noop = R() < 0.05;
    if (changeDirection) this.dir_sgn = R() < 0.3 ? -1 : 1;
    if (changeJumpMode) {
      if (this.jump || this.dir_sgn > 0) this.jump = !this.jump; // prevent jumping backwards
    }
    const forwardPos = KikiPos.fromVector(this.position).add(this.getDir());
    if (fire && Controller.world.isValidPos(forwardPos)) KikiBullet.shootFromBot(this);
    if (changeOrientation) {
      this.rotate_action = this.getActionWithId(R() < 0.5 ? KikiBot.ACTION_TURN_LEFT : KikiBot.ACTION_TURN_RIGHT);
      Controller.timer_event.addAction(this.rotate_action);
      return;
    }
    if (noop) {
      this.startTimedAction(this.getActionWithId(KikiBot.ACTION_NOOP), 666);
      return;
    }
    super.moveBot();
  }
}

// --------------------------------------------------------------------------------------------- player
export interface KikiKey {
  /** KKey::name: modifiers + '_' + key, e.g. "SHIFT_UP" */
  name: string;
  /** the typed character (KKey::character), 0 if none */
  character: number;
}

export function unmodifiedName(key: KikiKey): string {
  const i = key.name.indexOf('_');
  return i < 0 ? key.name : key.name.substring(i + 1);
}

export interface KeyHandler {
  handleKey(key: KikiKey): boolean;
  handleKeyRelease?(key: KikiKey): boolean;
}

/** action name -> key name: KikiPlayer's static key strings (actionKeyMapping) */
export const ACTION_KEYS: [string, string][] = [
  ['move forward', 'UP'], ['move backward', 'DOWN'], ['turn left', 'LEFT'], ['turn right', 'RIGHT'],
  ['shoot', 'SPACE'], ['jump', 'CTRL'], ['push', 'SHIFT'], ['look up', 'HOME'], ['look down', 'END'],
  ['change view', 'PAGEDOWN']];

export class KikiPlayer extends KikiBot implements KeyHandler {
  static ego = true;
  static className = 'KikiPlayer';
  static readonly ACTION_LOOK_UP: number = 12;
  static readonly ACTION_LOOK_DOWN: number = 13;
  static readonly ACTION_LOOK_RESET: number = 14;
  static keys = new Map<string, string>(ACTION_KEYS);
  static recordingAction: string | null = null;

  look_action: KikiAction | null = null;
  look_angle = 0.0;
  new_dir_sgn = 1.0;
  rotate = 0;
  projection: KikiProjection;

  constructor() {
    super();
    this.addAction(new KikiAction(this, KikiPlayer.ACTION_LOOK_UP, 'look up', 220));
    this.addAction(new KikiAction(this, KikiPlayer.ACTION_LOOK_DOWN, 'look down', 220));
    this.addAction(new KikiAction(this, KikiPlayer.ACTION_LOOK_RESET, 'look reset', 60));
    this.addEventWithName('keyset');
    this.addEventWithName('keyset failed');
    this.addEventWithName('landed');
    this.projection = new KikiProjection(90.0);
    this.projection.lightCutoff = 90.0;
    this.projection.lightAttenuation = [1.0, 0.0, 0.05];
    Controller.player_status.setStatus(this.status);
  }

  key(action: string): string { return KikiPlayer.keys.get(action) ?? ''; }
  static getKeyForAction(actionName: string): string { return KikiPlayer.keys.get(actionName) ?? ''; }
  static getActionForKey(keyName: string): string {
    for (const [a, k] of KikiPlayer.keys) if (k === keyName) return a;
    return '';
  }
  static setKeyForAction(keyName: string, actionName: string): void {
    if (KikiPlayer.keys.has(actionName)) KikiPlayer.keys.set(actionName, keyName);
  }
  recordKeyForAction(actionName: string): void {
    KikiPlayer.recordingAction = actionName;
    Controller.recordKey = (keyName: string) => this.setRecordedKey(keyName);
  }
  setRecordedKey(keyName: string): void {
    for (const [a, k] of KikiPlayer.keys) {
      if (k === keyName && a !== KikiPlayer.recordingAction) KikiPlayer.setKeyForAction('', a);
    }
    KikiPlayer.setKeyForAction(keyName, KikiPlayer.recordingAction!);
    this.getEventWithName('keyset')!.triggerActions();
  }

  getBodyColor(): KColor {
    const c = colorOf('KikiPlayer', 'base');
    if (Controller.world.getCameraMode() === CAMERA_BEHIND) {
      return [c[0], c[1], c[2], kMin(0.7, this.projection.getPosition().sub(this.current_position).length() - 0.4)];
    }
    return c;
  }
  getTireColor(): KColor {
    const c = colorOf('KikiPlayer', 'tire');
    if (Controller.world.getCameraMode() === CAMERA_BEHIND) {
      return [c[0], c[1], c[2], kMin(1.0, this.projection.getPosition().sub(this.current_position).length() - 0.4)];
    }
    return c;
  }
  getDeadColor(): KColor { return colorOf('KikiPlayer', 'dead'); }

  updatePosition(): void {
    if (this.move_action) {
      const relTime = Math.fround((Controller.getTime() - this.move_action.getStart()) / this.move_action.getDuration());
      if (relTime <= 1.0) {
        const HALF_PI = Math.PI / 2;
        const p = this.position;
        const dir = this.getDir().toVector();
        const up = this.getUp().toVector();
        switch (this.move_action.getId()) {
          case KikiBot.ACTION_FORWARD:
            this.current_position = p.add(dir.mul(relTime)); break;
          case KikiPushable.ACTION_FALL:
            this.current_position = p.sub(up.mul(relTime)); break;
          case KikiBot.ACTION_JUMP_FORWARD:
            this.current_position = p.add(dir.mul(1.0 - Math.cos(HALF_PI * relTime))).add(up.mul(Math.cos(HALF_PI - HALF_PI * relTime))); break;
          case KikiBot.ACTION_FALL_FORWARD:
            this.current_position = p.add(dir.mul(Math.cos(HALF_PI - HALF_PI * relTime))).add(up.neg().mul(1.0 - Math.cos(HALF_PI * relTime))); break;
        }
      }
    }
  }

  /** the inside view (KikiPlayer::getProjection) */
  getProjection(): KikiProjection {
    const projection = this.projection;
    const posDelta = Controller.getSpeed() / 10.0;
    projection.setPosition(projection.getPosition().mul(1.0 - posDelta).add(this.current_position.mul(posDelta)));
    const playerDir = this.getCurrentDir();
    const playerUp = this.current_orientation.rotate(new KVector(0, 1, 0)).normal();
    if (this.look_angle) {
      projection.setXVector(playerUp.cross(playerDir).normal());
      const lookRot = KQuaternion.rotationAroundVector(this.look_angle, projection.getXVector());
      projection.setYVector(lookRot.rotate(playerUp));
      projection.setZVector(lookRot.rotate(playerDir.neg()));
    } else {
      const lookDelta = (2.0 - projection.getZVector().dot(playerDir)) * Controller.getSpeed() / 50.0;
      const newLook = projection.getZVector().mul(1.0 - lookDelta).sub(playerDir.mul(lookDelta)).normalize();
      projection.setXVector(playerUp.cross(newLook).normal());
      projection.setYVector(playerUp);
      projection.setZVector(newLook);
    }
    return projection;
  }

  getBehindProjection(): KikiProjection {
    this.updatePosition();
    const projection = this.projection;
    const playerDir = this.getCurrentDir();
    const playerUp = this.current_orientation.rotate(new KVector(0, 1, 0)).normal();
    let botToCamera = playerUp.sub(playerDir.mul(2));
    let min_f = botToCamera.length();
    botToCamera = botToCamera.normalize();
    min_f = kMin(Controller.world.getWallDistanceForRay(this.current_position, botToCamera), min_f);
    let cameraPos = this.current_position.add(botToCamera.mul(kMax(min_f, 0.72)));
    cameraPos = Controller.world.getInsideWallPosWithDelta(cameraPos, 0.2);
    const posDelta = 0.2;
    projection.setPosition(projection.getPosition().mul(1.0 - posDelta).add(cameraPos.mul(posDelta)));
    if (this.look_angle) {
      projection.setXVector(playerUp.cross(playerDir).normal());
      const lookRot = KQuaternion.rotationAroundVector(this.look_angle, projection.getXVector());
      projection.setYVector(lookRot.rotate(playerUp));
      projection.setZVector(lookRot.rotate(playerDir.neg()));
    } else {
      const lookDelta = 0.3;
      const newLook = projection.getZVector().mul(1.0 - lookDelta).sub(playerDir.mul(lookDelta)).normalize();
      projection.setZVector(newLook);
      projection.setXVector(playerUp.cross(newLook).normal());
      projection.setYVector(newLook.cross(projection.getXVector()).normal());
    }
    return projection;
  }

  getFollowProjection(): KikiProjection {
    const projection = this.projection;
    let cameraPos = projection.getPosition();
    const desiredDistance = 2.0;
    this.updatePosition();
    const playerPos = this.current_position.clone();
    const playerDir = this.getCurrentDir();
    const playerUp = this.current_orientation.rotate(new KVector(0, 1, 0)).normal();
    const playerRight = playerDir.cross(playerUp).normal();

    let botToCamera = cameraPos.sub(playerPos);
    const cameraBotDistance = botToCamera.length();
    if (cameraBotDistance >= desiredDistance) {
      const difference = cameraBotDistance - desiredDistance;
      const delta = (difference * difference) / 400.0;
      cameraPos = cameraPos.mul(1.0 - delta).add(playerPos.mul(delta));
    } else {
      const difference = desiredDistance - cameraBotDistance;
      const delta = difference / 20.0;
      cameraPos = cameraPos.mul(1.0 - delta).add(playerPos.add(botToCamera.normal().mul(desiredDistance)).mul(delta));
    }

    botToCamera = cameraPos.sub(playerPos);
    let botToCameraNormal = botToCamera.normal();
    if (botToCameraNormal.dot(playerUp) < 0) {
      const verticalAngle = (Math.acos(Math.max(-1, Math.min(1, botToCameraNormal.dot(playerUp)))) * 180) / Math.PI - 90.0;
      cameraPos = playerPos.add(KQuaternion.rotationAroundVector(verticalAngle / 40.0, botToCameraNormal.cross(playerUp)).rotate(botToCamera));
      botToCamera = cameraPos.sub(playerPos);
      botToCameraNormal = cameraPos.sub(playerPos).normal();
    }

    let rot_factor = 1.0;
    const wall_distance = Controller.world.getWallDistanceForPos(playerPos.add(botToCamera));
    if (wall_distance < 0.5) {
      if (wall_distance < 0.2) {
        cameraPos = Controller.world.getInsideWallPosWithDelta(cameraPos, 0.2);
        botToCamera = cameraPos.sub(playerPos);
        botToCameraNormal = cameraPos.sub(playerPos).normal();
      }
      rot_factor = 0.5 / (wall_distance - 0.2);
    }

    const mappedToXZ = botToCamera.sub(playerUp.mul(botToCamera.dot(playerUp))).normal();
    let horizontalAngle = (Math.acos(Math.max(-1, Math.min(1, playerDir.neg().dot(mappedToXZ)))) * 180) / Math.PI;
    if (botToCameraNormal.dot(playerRight) > 0) horizontalAngle = -horizontalAngle;
    cameraPos = playerPos.add(KQuaternion.rotationAroundVector(horizontalAngle / (rot_factor * 400.0), playerUp).rotate(botToCamera));
    botToCamera = cameraPos.sub(playerPos);
    botToCameraNormal = botToCamera.normal();
    projection.setPosition(cameraPos);

    let lookDelta = 2.0 - projection.getZVector().dot(botToCameraNormal);
    lookDelta *= lookDelta / 30.0;
    const newLook = projection.getZVector().mul(1.0 - lookDelta).add(botToCameraNormal.mul(lookDelta)).normalize();
    let upDelta = 2.0 - projection.getYVector().dot(playerUp);
    upDelta *= upDelta / 100.0;
    const newRight = projection.getYVector().mul(1.0 - upDelta).add(playerUp.mul(upDelta)).cross(newLook).normalize();
    const newUp = newLook.cross(newRight).normal();
    projection.setZVector(newLook);
    projection.setXVector(newRight);
    projection.setYVector(newUp);
    return projection;
  }

  initAction(action: KikiAction): void {
    const actionId = action.getId();
    switch (actionId) {
      case KikiBot.ACTION_FORWARD:
      case KikiBot.ACTION_CLIMB_DOWN:
        this.status.addMoves(1);
      // fall through
      case KikiBot.ACTION_TURN_LEFT:
      case KikiBot.ACTION_TURN_RIGHT:
        Controller.sound.playSound(Snd.BOT_MOVE);
        break;
      case KikiBot.ACTION_JUMP:
      case KikiBot.ACTION_JUMP_FORWARD:
        this.status.addMoves(actionId === KikiBot.ACTION_JUMP ? 1 : 2);
        Controller.sound.playSound(Snd.BOT_JUMP);
        break;
    }
    super.initAction(action);
  }

  performAction(action: KikiAction): void {
    const relTime = action.getRelativeTime();
    switch (action.getId()) {
      case KikiBot.ACTION_NOOP: return;
      case KikiPlayer.ACTION_LOOK_UP: this.look_angle = relTime * -90.0; break;
      case KikiPlayer.ACTION_LOOK_DOWN: this.look_angle = relTime * 90.0; break;
      case KikiPlayer.ACTION_LOOK_RESET:
        if (this.look_angle > 0) this.look_angle = kMin(this.look_angle, (1.0 - relTime) * 90.0);
        else this.look_angle = kMax(this.look_angle, (1.0 - relTime) * -90.0);
        break;
      default:
        super.performAction(action);
    }
  }

  finishAction(action: KikiAction): void {
    const actionId = action.getId();
    if (actionId === KikiPlayer.ACTION_LOOK_RESET) {
      this.look_action = null;
      this.look_angle = 0.0;
    } else {
      if (action === this.move_action) this.dir_sgn = this.new_dir_sgn; // move finished, update direction
      if (actionId !== KikiPlayer.ACTION_LOOK_UP && actionId !== KikiPlayer.ACTION_LOOK_DOWN) super.finishAction(action);
      if (actionId === KikiBot.ACTION_TURN_LEFT || actionId === KikiBot.ACTION_TURN_RIGHT) {
        if (this.rotate) {
          this.rotate_action = this.getActionWithId(this.rotate);
          Controller.timer_event.addAction(this.rotate_action);
        }
      }
    }
  }

  die(): void {
    Controller.removeKeyHandler(this);
    super.die();
    Controller.displayText('game over');
    Controller.sound.playSound(Snd.BOT_DEATH);
    Controller.world.setCameraMode(CAMERA_FOLLOW);
  }

  reborn(): void {
    Controller.addKeyHandler(this);
    this.died = false;
  }

  reset(): void {
    super.reset();
    Controller.timer_event.removeActionsOfObject(this);
    this.look_action = null;
    this.look_angle = 0.0;
    this.new_dir_sgn = 1.0;
    this.rotate = 0;
  }

  handleKey(key: KikiKey): boolean {
    const keyName = unmodifiedName(key);
    const K = (a: string): string => this.key(a);
    if (keyName === K('move forward') || keyName === K('move backward')) {
      this.move = true; // try to move as long as the key is not released
      if (this.move_action === null) {
        this.new_dir_sgn = this.dir_sgn = keyName === K('move backward') ? -1 : 1;
        this.moveBot();
      } else {
        this.new_dir_sgn = keyName === K('move backward') ? -1 : 1;
      }
      return true;
    }
    if (keyName === K('turn left') || keyName === K('turn right')) {
      this.rotate = keyName === K('turn left') ? KikiBot.ACTION_TURN_LEFT : KikiBot.ACTION_TURN_RIGHT;
      if (this.rotate_action === null && this.spiked === false) {
        this.rotate_action = this.getActionWithId(this.rotate);
        Controller.timer_event.addAction(this.rotate_action);
      }
      return true;
    }
    if (key.name === K('jump')) {
      this.jump = true; // switch to jump mode until jump_key released
      this.jump_once = true;
      return true;
    }
    if (key.name === K('push')) {
      this.push = true;
      return true;
    }
    if (keyName === K('shoot')) {
      if (this.shoot === false) {
        this.shoot = true;
        Controller.timer_event.addAction(this.getActionWithId(KikiBot.ACTION_SHOOT));
      }
      return true;
    }
    if (keyName === K('look up') || keyName === K('look down')) {
      if (!this.look_action) {
        this.look_action = this.getActionWithId(key.name === K('look up') ? KikiPlayer.ACTION_LOOK_UP : KikiPlayer.ACTION_LOOK_DOWN);
        Controller.timer_event.addAction(this.look_action);
      }
      return true;
    }
    if (keyName === K('change view')) {
      Controller.world.changeCameraMode();
      return true;
    }
    return false;
  }

  handleKeyRelease(key: KikiKey): boolean {
    const keyName = unmodifiedName(key);
    const K = (a: string): string => this.key(a);
    if (keyName === K('shoot')) {
      Controller.timer_event.removeAction(this.getActionWithId(KikiBot.ACTION_SHOOT));
      this.shoot = false;
      return true;
    }
    if (keyName === K('move forward') || keyName === K('move backward')) {
      this.move = false;
      return true;
    }
    if (key.name === K('jump')) {
      this.jump = false;
      if (this.jump_once) {
        if (this.move_action === null && Controller.world.isUnoccupiedPos(KikiPos.fromVector(this.position.add(this.getUp().toVector())))) {
          this.jump_once = false;
          this.move_action = this.getActionWithId(KikiBot.ACTION_JUMP);
          Controller.sound.playSound(Snd.BOT_JUMP);
          Controller.timer_event.addAction(this.move_action);
        }
      }
      return true;
    }
    if (keyName === K('turn left') || keyName === K('turn right')) {
      this.rotate = 0;
      return true;
    }
    if (key.name === K('push')) {
      this.push = false;
      return true;
    }
    if (keyName === K('look down') || keyName === K('look up')) {
      if (this.look_action && this.look_action.getId() !== KikiPlayer.ACTION_LOOK_RESET) {
        Controller.timer_event.removeAction(this.look_action);
      }
      this.look_action = this.getActionWithId(KikiPlayer.ACTION_LOOK_RESET);
      Controller.timer_event.addAction(this.look_action);
      return true;
    }
    if (keyName === K('change view')) return true;
    return false;
  }
}

export const CAMERA_INSIDE = 0;
export const CAMERA_BEHIND = 1;
export const CAMERA_FOLLOW = 2;

void ONCE;
