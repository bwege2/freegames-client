// One level being played (src/xmscene/Scene.cpp): time, the player, the level's entities and zones, the
// game events (xmoto/GameEvents.cpp), the Lua "Game" library (xmoto/LuaLibGame.cpp), script timers
// (xmscene/ScriptTimer.cpp), the scripts' moving blocks and entities (xmoto/ScriptDynamicObjects.cpp),
// checkpoints and game messages. Rendering, sound and the menus live elsewhere and listen to the hooks.
import { CollisionSystem } from './collision.ts';
import { PlayerBiker, PHYS, DD_RIGHT, DD_LEFT, type BikeState } from './bike.ts';
import { Level, Entity, Zone, Block, generateLevel } from './level.ts';
import { f, v2, vadd, intersectLineCircle2f, circleTouchCircle2f, AABB, type Vec2 } from './vmath.ts';
import { LuaState, type LuaFn, type LuaArgs } from './lua.ts';
import type { ReplayEvent, ReplayRecorder } from './replay.ts';

export const MESSAGE_DURATION = 500;
const GAMEMESSAGES_PACKTIME = 50;

export interface GameMessage {
  text: string; removeTime: number; isNew: boolean; alpha: number; once: boolean; lines: number;
  type: 'scripted' | 'gameTime' | 'levelInfo'; pos: Vec2; vel: Vec2;
}

export interface SceneHooks {
  onPlayerDies?(): void;
  onPlayerWins?(): void;
  onStrawberry?(): void;
  onCheckpoint?(): void;
  onSomersault?(counterclock: boolean): void;
  playSound?(name: string, volume: number): void;
  playMusic?(name: string): void;
  camera?(cmd: CameraCommand): void;
}
export type CameraCommand =
  | { kind: 'zoom'; z: number } | { kind: 'move'; x: number; y: number } | { kind: 'setPos'; x: number; y: number }
  | { kind: 'rotate'; angle: number } | { kind: 'adaptToGravity' } | { kind: 'rotationSpeed'; speed: number } | { kind: 'init' };

const EV_PLAYER_WINS = 'wins';
interface GameEvent { type: string; run(): void; rec?: ReplayEvent }

// ScriptDynamicObjects.cpp ---------------------------------------------------------------------
abstract class DynObject {
  time = 0;
  objectId: string;
  protected start: number; protected end: number;
  constructor(id: string, start: number, end: number) { this.objectId = id; this.start = start; this.end = end; }
  /** SDynamicObject::nextState: false when finished */
  nextState(scene: Scene, nbCents: number): boolean {
    let real = nbCents;
    if (this.time >= this.end && this.end !== 0) return false;
    if (this.start > this.time) real -= this.start - this.time;
    if (this.time + nbCents > this.end && this.end !== 0) real -= this.time + nbCents - this.end;
    this.performMove(scene, real);
    this.time += nbCents;
    return !(this.time >= this.end && this.end !== 0);
  }
  abstract performMove(scene: Scene, n: number): void;
}
interface Mover { xy(): [number, number, number] }

class Translation implements Mover {
  private X: number; private Y: number; private up = true; private speed = 0; private mx = 0; private my = 0; private tx = 0; private ty = 0;
  constructor(x: number, y: number, period: number) {
    this.X = f(x); this.Y = f(y);
    const Z = f(Math.sqrt(f(f(this.X * this.X) + f(this.Y * this.Y))));
    if (period !== 0) this.speed = f(f(Z * 2) / f(period));
    if (Z !== 0) { this.mx = f(f(this.speed * this.X) / Z); this.my = f(f(this.speed * this.Y) / Z); }
  }
  xy(): [number, number, number] {
    const vx = this.up ? this.mx : -this.mx, vy = this.up ? this.my : -this.my;
    this.tx = f(this.tx + (this.up ? Math.abs(vx) : -Math.abs(vx)));
    this.ty = f(this.ty + (this.up ? Math.abs(vy) : -Math.abs(vy)));
    if (this.tx < 0 || this.tx > Math.abs(this.X) || this.ty < 0 || this.ty > Math.abs(this.Y)) this.up = !this.up;
    return [vx, vy, 0];
  }
}
class Rotation implements Mover {
  private speed = 0; private angle: number; private radius: number; private cx: number; private cy: number; private px = 0; private py = 0;
  constructor(initAngle: number, radius: number, period: number) {
    if (period !== 0) this.speed = f((2 * Math.PI) / f(period));
    this.angle = f(initAngle); this.radius = f(radius);
    this.cx = f(Math.cos(this.angle) * this.radius);
    this.cy = f(Math.sin(this.angle) * this.radius);
  }
  xy(): [number, number, number] {
    if (this.angle >= 2 * Math.PI) this.angle = f(this.angle - 2 * Math.PI);
    const x = f(Math.cos(this.angle) * this.radius - this.cx);
    const y = f(Math.sin(this.angle) * this.radius - this.cy);
    const vx = f(x - this.px), vy = f(y - this.py);
    this.px = x; this.py = y;
    this.angle = f(this.angle + this.speed);
    return [vx, vy, 0];
  }
}
class SelfRotation implements Mover {
  private total = 0; private incr = 0; private period: number;
  constructor(period: number) { this.period = period; }
  xy(): [number, number, number] {
    let a = f((2 * Math.PI) / f(this.period));
    this.incr++;
    this.total = f(this.total + a);
    if ((this.period > 0 && this.incr >= this.period) || (this.period < 0 && this.incr >= -this.period)) {
      const real = f((f(this.incr) * (2 * Math.PI)) / f(this.period));
      a = f(a + f(real - this.total));
      this.incr = 0; this.total = 0;
    }
    return [0, 0, a];
  }
}

class EntityMove extends DynObject {
  private m: Mover;
  constructor(id: string, start: number, end: number, m: Mover) { super(id, start, end); this.m = m; }
  performMove(scene: Scene, n: number): void {
    const e = scene.level.getEntityById(this.objectId);
    if (!e.alive) return;
    let ax = 0, ay = 0, aa = 0, va = 0;
    if (n > 0) {
      for (let i = 0; i < n; i++) { const [vx, vy, a] = this.m.xy(); ax = f(ax + vx); ay = f(ay + vy); aa = a; va = a; }
      if (ax !== 0 || ay !== 0) scene.translateEntity(e, ax, ay);
      if (va !== 0) e.drawAngle = f(aa + e.drawAngle);
    }
  }
}
class BlockMove extends DynObject {
  private m: Mover;
  constructor(id: string, start: number, end: number, m: Mover) { super(id, start, end); this.m = m; }
  performMove(scene: Scene, n: number): void {
    const b = scene.level.getBlockById(this.objectId);
    let ax = 0, ay = 0, aa = 0, va = 0;
    if (n > 0) {
      for (let i = 0; i < n; i++) { const [vx, vy, a] = this.m.xy(); ax = f(ax + vx); ay = f(ay + vy); aa = a; va = a; }
      if (ax !== 0 || ay !== 0) scene.moveBlock(b, ax, ay);
      if (va !== 0) scene.setBlockRotation(b, f(aa + b.dynamicRotation));
    }
  }
}

// ScriptTimer.cpp
class ScriptTimer {
  private last: number; running = true; calls = 1; name: string; delay: number; loops: number;
  constructor(name: string, delay: number, loops: number, now: number) { this.name = name; this.delay = delay; this.loops = loops; this.last = now; }
  update(scene: Scene, now: number): void {
    if (this.running) {
      if (now > this.last + this.delay) {
        this.last = now;
        scene.lua?.callTblVoid(this.name, 'Tick', this.calls);
        this.calls++;
      }
    } else this.last = now;
  }
  finished(): boolean { return this.loops !== 0 && this.loops < this.calls; }
  reset(delay: number, loops: number, now: number): void { this.delay = delay; this.last = now; this.loops = loops; this.calls = 1; this.running = true; }
}

export interface Checkpoint { entity: Entity; destroyed: Entity[]; dir: number }

/** Scene */
export class Scene {
  level: Level;
  col = new CollisionSystem();
  time = 0;
  gravity = v2(0, -PHYS.worldGravity);
  player!: PlayerBiker;
  lua: LuaState | null = null;
  hooks: SceneHooks;
  messages: GameMessage[] = [];
  arrow = { mode: 0, pos: v2(0, 0), angle: 0 };
  checkpoint: Checkpoint | null = null;
  activatedCheckpoints = new Set<Entity>();
  usedCheckpoint = false;
  keyHooks: { key: string; fn: string }[] = [];
  /** the replay being recorded (Scene::executeEvents_step serializes each event into it) */
  recorder: ReplayRecorder | null = null;
  /** false when a replay is shown: no scripts, no zones, no entity touches (m_playEvents) */
  playEvents = true;
  /** in a replay: puts the recorded bike state of this time into the player (instead of the physics) */
  replayPlayer: ((time: number) => void) | null = null;
  private events: GameEvent[] = [];
  private delSchedule: Entity[] = [];
  private dynObjects: DynObject[] = [];
  private timers: ScriptTimer[] = [];
  private lastTick = 0;
  private entitiesTouching = new Set<Entity>();
  private zonesTouching = new Set<Zone>();
  private lastStrawberries: number[] = [];

  constructor(level: Level, hooks: SceneHooks = {}, scripts: Record<string, string> = {}, playEvents = true) {
    this.level = level;
    this.hooks = hooks;
    this.playEvents = playEvents;
    this.prePlayLevel(scripts);
  }

  /** Scene::prePlayLevel */
  private prePlayLevel(scripts: Record<string, string>): void {
    this.lua = new LuaState('Game', this.luaLibrary());
    for (const lib of this.level.scriptLibraries) {
      const code = scripts[`LevelsLibraries/${lib}`];
      if (code === undefined) throw new Error(`unable to load script LevelsLibraries/${lib}`);
      this.lua.load(code, lib);
    }
    if (this.level.scriptFile) {
      const code = scripts[this.level.scriptFile];
      if (code === undefined) throw new Error(`unable to load script ${this.level.scriptFile}`);
      this.lua.load(code.split('\n').filter((l) => l.length > 0).map((l) => `${l}\n`).join(''), this.level.scriptFile);
    }
    if (this.level.scriptSource) this.lua.load(this.level.scriptSource, this.level.scriptFile);
    this.time = 0;
    this.lastTick = 0;
    generateLevel(this.level, this.col, PHYS);
    if (this.playEvents) this.executeEvents();
  }

  /** the player at the level's start (Scene::addPlayerLocalBiker), then OnLoad (Scene::playInitLevel) */
  addPlayer(): void {
    this.player = new PlayerBiker(PHYS, this.level.playerStart, DD_RIGHT, this.gravity);
    this.player.hooks = {
      onWheelTouches: (w, t) => {
        this.lua?.callVoid(`OnWheel${w}Touchs`, t ? 1 : 0);
        this.lua?.callVoid(`OnWheel${w}TouchsBy`, t ? 1 : 0, 0);
      },
      onHeadTouches: () => {
        if (!this.player.isDead()) this.createEvent('dies', () => this.killPlayer());
      },
      onSomersaultDone: (cc) => {
        this.lua?.callVoid('OnSomersault', cc ? 1 : 0);
        this.lua?.callVoid('OnSomersaultBy', cc ? 1 : 0, 0);
        this.hooks.onSomersault?.(cc);
      },
    };
  }
  playInitLevel(): void {
    if (this.playEvents && this.lua && !this.lua.callBool('OnLoad', true)) throw new Error('OnLoad script function failed !');
  }

  get state(): BikeState { return this.player.state; }

  /** Scene::updateLevel for one PHYS_STEP_SIZE */
  updateLevel(timeStep = 1): void {
    this.updateGameMessages();
    this.time += timeStep;
    if (this.playEvents) {
      this.updateZones();
      this.updateEntities();
    }
    let i = 0;
    while (i < this.timers.length) {
      this.timers[i].update(this, this.time);
      if (this.timers[i].finished()) this.timers.splice(i, 1);
      else i++;
    }
    let nbCents = 0;
    while (this.time - this.lastTick > 1) {
      if (this.playEvents && this.lua && !this.lua.callBool('Tick', true)) throw new Error('level script Tick() returned false');
      nbCents++;
      this.lastTick += 1;
    }
    let k = 0;
    while (k < this.dynObjects.length) {
      if (!this.dynObjects[k].nextState(this, nbCents)) this.dynObjects.splice(k, 1);
      else k++;
    }
    if (this.replayPlayer) this.replayPlayer(this.time);
    else this.player.updateToTime(this.time, timeStep, this.col, this.gravity);
    this.executeEvents();
    if (this.recorder && !this.player.isFinished()) {
      this.recorder.maybeStore(this.time, this.player.state, PHYS, !this.player.isDead());
    }
    for (const e of this.delSchedule) this.killEntityNow(e);
    this.delSchedule = [];
  }

  private createEvent(type: string, run: () => void, rec?: ReplayEvent): void { this.events.push({ type, run, rec }); }

  /** Scene::executeEvents: everything but the wins first (events may create events), then the wins */
  private executeEvents(): void {
    let found: boolean;
    do {
      found = false;
      let i = 0;
      while (i < this.events.length) {
        if (this.events[i].type !== EV_PLAYER_WINS) {
          found = true;
          const ev = this.events[i];
          this.events.splice(i, 1);
          if (ev.rec) this.recorder?.event(ev.rec);
          ev.run();
        } else i++;
      }
    } while (found);
    while (this.events.length > 0) {
      const ev = this.events.shift()!;
      ev.run();
    }
  }

  // players ---------------------------------------------------------------------------------
  killPlayer(): void {
    const p = this.player;
    if (!p.isDead() && !p.isFinished()) {
      p.setDead(true, this.time);
      this.hooks.onPlayerDies?.();
      p.setBodyDetach(true);
      p.ctrl.stopControls();
    }
  }
  makePlayerWin(): void {
    const p = this.player;
    if (!p.isDead() && !p.isFinished()) {
      p.setFinished(true, this.time);
      this.hooks.onPlayerWins?.();
    }
  }
  setPlayerPosition(x: number, y: number, right: boolean): void {
    if (!this.player.isDead()) this.player.initToPosition(v2(x, y), right ? DD_RIGHT : DD_LEFT, this.gravity);
  }
  setGravity(x: number, y: number): void {
    this.gravity = v2(x, y);
    if (!this.player.isDead()) this.player.resetAutoDisabler();
  }

  // zones and entities ----------------------------------------------------------------------
  private updateZones(): void {
    const p = this.player;
    if (p.isDead()) return;
    const s = p.state;
    for (const z of this.level.zones) {
      if (z.doesCircleTouch(s.FrontWheelP, PHYS.bikeWheelRadius) || z.doesCircleTouch(s.RearWheelP, PHYS.bikeWheelRadius) ||
        z.doesCircleTouch(s.HeadP, PHYS.riderHeadSize)) {
        if (!this.zonesTouching.has(z)) {
          this.zonesTouching.add(z);
          this.createEvent('enterZone', () => { this.lua?.callTblVoid(z.id, 'OnEnter'); this.lua?.callTblVoid(z.id, 'OnEnterBy', 0); });
        }
      } else if (this.zonesTouching.has(z)) {
        this.zonesTouching.delete(z);
        this.createEvent('leaveZone', () => { this.lua?.callTblVoid(z.id, 'OnLeave'); this.lua?.callTblVoid(z.id, 'OnLeaveBy', 0); });
      }
    }
  }
  isTouchingZone(z: Zone): boolean { return this.zonesTouching.has(z); }

  private updateEntities(): void {
    const p = this.player;
    if (p.isDead()) return;
    const s = p.state;
    const head = s.Dir === DD_RIGHT ? s.HeadP : s.Head2P;
    const hs = PHYS.riderHeadSize, wr = PHYS.bikeWheelRadius, m = f(0.5);
    const box = new AABB();
    box.addPoint(f(f(head.x - hs) - m), f(f(head.y - hs) - m));
    box.addPoint(f(f(s.FrontWheelP.x - wr) - m), f(f(s.FrontWheelP.y - wr) - m));
    box.addPoint(f(f(s.RearWheelP.x - wr) - m), f(f(s.RearWheelP.y - wr) - m));
    box.addPoint(f(f(head.x + hs) + m), f(f(head.y + hs) + m));
    box.addPoint(f(f(s.FrontWheelP.x + wr) + m), f(f(s.FrontWheelP.y + wr) + m));
    box.addPoint(f(f(s.RearWheelP.x + wr) + m), f(f(s.RearWheelP.y + wr) + m));
    const near = [...this.col.entities.near(box)] as Entity[];
    for (const e of near) {
      if (circleTouchCircle2f(e.dynamicPosition, e.size, head, hs)) {
        if (this.setTouching(e, true)) this.createEvent('touch', () => this.touchEntity(e, true));
      } else if (circleTouchCircle2f(e.dynamicPosition, e.size, s.FrontWheelP, wr) || circleTouchCircle2f(e.dynamicPosition, e.size, s.RearWheelP, wr)) {
        if (this.setTouching(e, true)) this.createEvent('touch', () => this.touchEntity(e, false));
      } else if (touchBodyExceptHead(s, e)) {
        if (this.setTouching(e, true)) this.createEvent('touch', () => this.touchEntity(e, false));
      } else {
        this.setTouching(e, false);
      }
    }
  }
  private setTouching(e: Entity, t: boolean): boolean {
    const was = this.entitiesTouching.has(e);
    if (was === t) return false;
    if (t) this.entitiesTouching.add(e); else this.entitiesTouching.delete(e);
    return t;
  }
  isTouchingEntity(e: Entity): boolean { return this.entitiesTouching.has(e); }

  /** Scene::touchEntity */
  private touchEntity(e: Entity, _head: boolean): void {
    this.lua?.callTblVoid(e.id, 'Touch');
    this.lua?.callTblVoid(e.id, 'TouchBy', 0);
    if (e.doesMakeWin() && this.level.nbEntitiesToTake === 0) this.createEvent(EV_PLAYER_WINS, () => this.makePlayerWin());
    if (e.doesKill()) this.createEvent('dies', () => this.killPlayer());
    if (e.isToTake()) {
      const rec: ReplayEvent = { type: 4, time: this.time, s: e.id, n: [e.speciality, e.size, e.dynamicPosition.x, e.dynamicPosition.y] };
      this.createEvent('destroyed', () => this.entityDestroyed(e, rec.time, 0), rec);
    }
    if (e.isCheckpoint()) {
      this.checkpoint = { entity: e, destroyed: [...this.level.entitiesDestroyed], dir: this.player.state.Dir };
      this.activatedCheckpoints = new Set([e]);
      this.hooks.onCheckpoint?.();
    }
  }
  /** Scene::entityDestroyed */
  private entityDestroyed(e: Entity, time: number, byPlayer: number): void {
    if (e.isToTake()) {
      if (byPlayer >= 0) this.hooks.onStrawberry?.();
      this.lastStrawberries.push(time);
    }
    if (!this.delSchedule.includes(e)) this.delSchedule.push(e);
  }
  /** Scene::_KillEntity */
  private killEntityNow(e: Entity): void {
    this.level.killEntity(e.id);
    this.col.entities.remove(e);
    if (this.level.nbEntitiesToTake === 0 && !this.player.isDead()) {
      for (const t of this.entitiesTouching) {
        if (t.doesMakeWin()) this.createEvent(EV_PLAYER_WINS, () => this.makePlayerWin());
      }
    }
  }
  translateEntity(e: Entity, x: number, y: number): void {
    e.translate(x, y);
    if (e.alive) this.col.entities.move(e);
  }
  setEntityPos(e: Entity, x: number, y: number): void {
    e.setDynamicPosition(v2(x, y));
    if (e.alive) this.col.entities.move(e);
  }
  moveBlock(b: Block, x: number, y: number): void {
    if (b.isDynamic()) { b.translate(f(x), f(y)); this.col.dynBlocks.move(b); }
  }
  setBlockPos(b: Block, x: number, y: number): void {
    if (b.isDynamic()) { b.setDynamicPositionAccordingToCenter(v2(x, y)); this.col.dynBlocks.move(b); }
  }
  setBlockRotation(b: Block, a: number): void {
    if (b.isDynamic() && b.setDynamicRotation(a)) this.col.dynBlocks.move(b);
  }

  /** Scene::playToCheckpoint (time goes on; the replay is dropped by the caller) */
  playToCheckpoint(): void {
    const cp = this.checkpoint;
    if (!cp) return;
    if (this.player.isDead()) { this.player.setDead(false); this.player.wheelDetach = false; }
    this.clearGameMessages();
    this.gameMessage(' ', true, 0);
    this.setPlayerPosition(cp.entity.dynamicPosition.x, cp.entity.dynamicPosition.y, cp.dir === DD_RIGHT);
    this.hooks.camera?.({ kind: 'init' });
    const revert = this.level.entitiesDestroyed.filter((e) => !cp.destroyed.includes(e)).map((e) => e.id);
    for (const id of revert) {
      const i = this.level.entitiesDestroyed.findIndex((e) => e.id === id);
      const e = this.level.entitiesDestroyed[i];
      e.alive = true;
      if (e.isToTake()) this.level.nbEntitiesToTake++;
      this.level.entities.push(e);
      this.col.entities.add(e);
      this.level.entitiesDestroyed.splice(i, 1);
    }
    this.lua?.callTblVoid(cp.entity.id, 'OnUse');
    this.usedCheckpoint = true;
  }

  // messages (Scene::gameMessage, packGameMessages, updateGameMessages) --------------------------
  gameMessage(text: string, once = false, duration = MESSAGE_DURATION, type: GameMessage['type'] = 'levelInfo'): void {
    if (text === '') return;
    let msg: GameMessage | null = null;
    if (once) msg = this.messages.find((m) => m.once) ?? null;
    const mk = (t: string): GameMessage => ({ text: t, removeTime: this.time + duration, isNew: true, alpha: 255, once, lines: 1, type, pos: v2(0, 0), vel: v2(0, 0) });
    if (!msg) {
      if (once) this.messages.push(mk(text));
      else for (const part of text.split('\n')) this.messages.push(mk(part));
    } else {
      msg.text = text; msg.removeTime = this.time + duration; msg.alpha = 255; msg.type = type;
    }
    for (let i = this.messages.length - 1; i > 0; i--) {
      const a = this.messages[i - 1], b = this.messages[i];
      if (b.removeTime - a.removeTime < GAMEMESSAGES_PACKTIME && b.removeTime !== 0 && b.type === a.type && b.once === a.once && b.alpha === a.alpha) {
        a.text += `\n${b.text}`;
        a.removeTime = b.removeTime;
        this.messages.splice(i, 1);
      }
    }
    for (const m of this.messages) m.lines = m.text.split('\n').length;
    this.updateGameMessages();
  }
  clearGameMessages(): void { for (const m of this.messages) m.removeTime = 0; }
  private updateGameMessages(): void {
    let i = 0;
    for (;;) {
      if (i < 0 || i >= this.messages.length) break;
      const m = this.messages[i];
      if (this.time > m.removeTime) {
        m.alpha -= 2;
        if (m.alpha <= 0) { this.messages.splice(i, 1); i--; continue; }
      }
      let row = 0;
      for (let j = 0; j < i; j++) row += this.messages[j].lines;
      const target = v2(0.2, f(0.5 - f(this.messages.length * 0.05) / 2.0 + 0.049 * row));
      if (m.isNew) { m.vel = v2(0, 0); m.pos = target; m.isNew = false; }
      else if (Math.abs(target.x - m.pos.x) >= 0.001 || Math.abs(target.y - m.pos.y) >= 0.001) {
        m.vel = v2(m.vel.x + (target.x - m.pos.x) * 0.0005, m.vel.y + (target.y - m.pos.y) * 0.0005);
        m.pos = vadd(m.pos, m.vel);
      }
      i++;
    }
  }

  // the game events the scripts create (GameEvents.cpp doAction), also replayed from .rpl files ------------
  /** SceneEvent::doAction for the serializable events (and handleEvent for replays) */
  applyEvent(e: ReplayEvent): void {
    const L = this.level, n = e.n, s = e.s ?? '';
    switch (e.type) {
      case 4: { const ent = L.getEntityById(s); this.entityDestroyed(ent, e.time, -1); break; }
      case 5: this.clearGameMessages(); break;
      case 6: this.arrow = { mode: 1, pos: v2(n[0], n[1]), angle: f(n[2]) }; break;
      case 7: this.arrow = { mode: 2, pos: v2(n[0], n[1]), angle: f(n[2]) }; break;
      case 8: this.arrow.mode = 0; break;
      case 9: this.gameMessage(s, false, MESSAGE_DURATION, 'scripted'); break;
      case 10: this.moveBlock(L.getBlockById(s), n[0], n[1]); break;
      case 11: this.setBlockPos(L.getBlockById(s), n[0], n[1]); break;
      case 12: this.setGravity(n[0], n[1]); break;
      case 13: this.setPlayerPosition(n[0], n[1], !!e.b); break;
      case 14: this.setEntityPos(L.getEntityById(s), n[0], n[1]); break;
      case 15: { const b = L.getBlockById(s); if (b.isDynamic()) { b.setCenter(v2(n[0], n[1])); this.col.dynBlocks.move(b); } break; }
      case 16: this.setBlockRotation(L.getBlockById(s), n[0]); break;
      case 17: this.dynObjects.push(new EntityMove(s, n[3], n[4], new Rotation(n[0], n[1], n[2]))); break;
      case 18: this.dynObjects.push(new EntityMove(s, n[3], n[4], new Translation(n[0], n[1], n[2]))); break;
      case 19: case 24: this.removeDynamicOf(s); break;
      case 20: this.hooks.camera?.({ kind: 'zoom', z: n[0] }); break;
      case 21: this.hooks.camera?.({ kind: 'move', x: n[0], y: n[1] }); break;
      case 22: this.dynObjects.push(new BlockMove(s, n[3], n[4], new Rotation(n[0], n[1], n[2]))); break;
      case 23: this.dynObjects.push(new BlockMove(s, n[3], n[4], new Translation(n[0], n[1], n[2]))); break;
      case 25: if (n[0] > 0) this.time += n[0]; break;
      case 30: if (n[3] === 0) this.setPlayerPosition(n[0], n[1], !!e.b); break;
      case 31: this.dynObjects.push(new BlockMove(s, n[1], n[2], new SelfRotation(n[0]))); break;
      case 32: this.dynObjects.push(new EntityMove(s, n[1], n[2], new SelfRotation(n[0]))); break;
      case 33: this.hooks.camera?.({ kind: 'rotate', angle: n[0] }); break;
      case 34: this.hooks.camera?.({ kind: 'adaptToGravity' }); break;
      case 35: if (n[4] === 0) this.player.addBodyForce(this.time, v2(n[0], n[1]), n[2], n[3]); break;
      case 36: this.hooks.camera?.({ kind: 'rotationSpeed', speed: n[0] }); break;
      case 37: this.hooks.playSound?.(s, n[0]); break;
      case 38: this.hooks.playMusic?.(s); break;
      case 39: this.hooks.playMusic?.(''); break;
      case 43: this.hooks.camera?.({ kind: 'setPos', x: n[0], y: n[1] }); break;
      default: break; // 41, 42: chipmunk blocks are not simulated
    }
  }

  // the Lua library (LuaLibGame.cpp) ---------------------------------------------------------
  private luaLibrary(): Record<string, LuaFn> {
    const L = this.level;
    /** an event of the queue that a replay records (its fields are the C++ event's floats) */
    const ev = (type: number, s: string | undefined, n: number[], b?: boolean): void => {
      const rec: ReplayEvent = { type, time: this.time, s, n, b };
      this.createEvent(`script${type}`, () => this.applyEvent(rec), rec);
    };
    const safeEntity = (id: string): Entity | null => { try { return L.getEntityById(id); } catch { return null; } };
    const check = (a: LuaArgs, n: number): void => { if (a.count !== n) a.error('Invalid number of arguments'); };
    const player0 = (a: LuaArgs, i: number): void => { if ((a.num(i) | 0) !== 0) a.error('Invalid player number'); };
    const F = f;
    const fns: Record<string, LuaFn> = {
      GetTime: (a) => { check(a, 0); return [this.time / 100.0]; },
      Message: (a) => {
        let out = '';
        for (let i = 1; i <= a.count; i++) { const t = a.str(i); if (t !== '') out += t; }
        ev(9, out, []);
      },
      ClearMessages: (a) => { check(a, 0); ev(5, undefined, []); },
      Log: () => {},
      IsPlayerInZone: (a) => { try { return [this.isTouchingZone(L.getZoneById(a.str(1)))]; } catch { return [false]; } },
      IsAPlayerInZone: (a) => {
        let z: Zone;
        try { z = L.getZoneById(a.str(1)); } catch { return [false]; }
        player0(a, 2);
        return [this.isTouchingZone(z)];
      },
      MoveBlock: (a) => ev(10, a.str(1), [F(a.num(2)), F(a.num(3))]),
      GetBlockPos: (a) => { try { const b = L.getBlockById(a.str(1)); return [b.dynamicPosition.x, b.dynamicPosition.y]; } catch { return [0, 0]; } },
      SetBlockPos: (a) => ev(11, a.str(1), [F(a.num(2)), F(a.num(3))]),
      SetPhysicsBlockPos: (a) => ev(11, a.str(1), [F(a.num(2)), F(a.num(3))]),
      SetBlockCenter: (a) => ev(15, a.str(1), [F(a.num(2)), F(a.num(3))]),
      SetBlockRotation: (a) => ev(16, a.str(1), [F(a.num(2))]),
      PlaceInGameArrow: (a) => ev(6, undefined, [F(a.num(1)), F(a.num(2)), F(a.num(3))]),
      PlaceScreenArrow: (a) => ev(7, undefined, [F(a.num(1)), F(a.num(2)), F(a.num(3))]),
      HideArrow: () => ev(8, undefined, []),
      SetGravity: (a) => ev(12, undefined, [F(a.num(1)), F(a.num(2))]),
      GetGravity: () => [this.gravity.x, this.gravity.y],
      SetPlayerPosition: (a) => { const right = a.num(3) > 0; ev(13, undefined, [F(a.num(1)), F(a.num(2))], right); },
      SetAPlayerPosition: (a) => {
        const right = a.num(3) > 0; player0(a, 4);
        ev(30, undefined, [F(a.num(1)), F(a.num(2)), 0], right);
      },
      GetPlayerPosition: () => [this.player.state.CenterP.x, this.player.state.CenterP.y, this.player.state.Dir],
      GetAPlayerPosition: (a) => { player0(a, 1); return [this.player.state.CenterP.x, this.player.state.CenterP.y, this.player.state.Dir]; },
      AddForceToPlayer: (a) => ev(35, undefined, [F(a.num(1)), F(a.num(2)), a.num(3) | 0, a.num(4) | 0, a.num(5) | 0]),
      GetEntityPos: (a) => { const e = safeEntity(a.str(1)); return e ? [e.dynamicPosition.x, e.dynamicPosition.y] : [0, 0]; },
      SetEntityPos: (a) => ev(14, a.str(1), [F(a.num(2)), F(a.num(3))]),
      GetEntityRadius: (a) => { const e = safeEntity(a.str(1)); return [e ? e.size : 0]; },
      IsEntityTouched: (a) => { const e = safeEntity(a.str(1)); return [e && this.isTouchingEntity(e) ? 1 : 0]; },
      KillEntity: (a) => {
        const e = L.getEntityById(a.str(1));
        const rec: ReplayEvent = { type: 4, time: this.time, s: e.id, n: [e.speciality, e.size, e.dynamicPosition.x, e.dynamicPosition.y] };
        this.createEvent('destroyed', () => this.entityDestroyed(e, rec.time, -1), rec);
      },
      KillPlayer: () => { this.createEvent('dies', () => this.killPlayer()); },
      KillAPlayer: (a) => { player0(a, 1); this.createEvent('dies', () => this.killPlayer()); },
      WinPlayer: () => { this.makePlayerWin(); },
      WinAPlayer: (a) => { player0(a, 1); this.makePlayerWin(); },
      NumberOfPlayers: () => [1],
      RemainingStrawberries: () => [L.nbEntitiesToTake],
      AddPenaltyTime: (a) => ev(25, undefined, [Math.trunc(a.num(1) * 100)]),
      SetKeyHook: (a) => { this.keyHooks.push({ key: a.str(1), fn: a.str(2) }); },
      GetKeyByAction: (a) => [KEY_BY_ACTION[a.str(1)] ?? '?'],
      GetKeyByActionTech: (a) => [KEY_BY_ACTION[a.str(1)] ?? '?'],
      SetDynamicEntityRotation: (a) => ev(17, a.str(1), [F(a.num(2)), F(a.num(3)), a.num(4) | 0, a.num(5) | 0, a.num(6) | 0]),
      SetDynamicEntitySelfRotation: (a) => ev(32, a.str(1), [a.num(2) | 0, a.num(3) | 0, a.num(4) | 0]),
      SetDynamicEntityTranslation: (a) => ev(18, a.str(1), [F(a.num(2)), F(a.num(3)), a.num(4) | 0, a.num(5) | 0, a.num(6) | 0]),
      SetDynamicEntityNone: (a) => ev(19, a.str(1), []),
      SetDynamicBlockRotation: (a) => ev(22, a.str(1), [F(a.num(2)), F(a.num(3)), a.num(4) | 0, a.num(5) | 0, a.num(6) | 0]),
      SetDynamicBlockSelfRotation: (a) => ev(31, a.str(1), [a.num(2) | 0, a.num(3) | 0, a.num(4) | 0]),
      SetDynamicBlockTranslation: (a) => ev(23, a.str(1), [F(a.num(2)), F(a.num(3)), a.num(4) | 0, a.num(5) | 0, a.num(6) | 0]),
      SetDynamicBlockNone: (a) => ev(24, a.str(1), []),
      SetPhysicsBlockSelfRotation: (a) => ev(41, a.str(1), [a.num(2) | 0, a.num(3) | 0, a.num(4) | 0]),
      SetPhysicsBlockTranslation: (a) => ev(42, a.str(1), [F(a.num(2)), F(a.num(3)), a.num(4) | 0, a.num(5) | 0, a.num(6) | 0]),
      CameraZoom: (a) => ev(20, undefined, [F(a.num(1))]),
      CameraMove: (a) => ev(21, undefined, [F(a.num(1)), F(a.num(2))]),
      SetCameraPosition: (a) => ev(43, undefined, [F(a.num(1)), F(a.num(2))]),
      CameraRotate: (a) => ev(33, undefined, [F(a.num(1))]),
      CameraAdaptToGravity: () => ev(34, undefined, []),
      SetCameraRotationSpeed: (a) => ev(36, undefined, [F(a.num(1))]),
      PlaySound: (a) => ev(37, a.str(1), [a.count === 1 ? 1.0 : F(a.num(2))]),
      PlayMusic: (a) => ev(38, a.str(1), []),
      StopMusic: () => ev(39, undefined, []),
      GetPlayerVelocity: (a) => { player0(a, 1); return [this.player.getBikeLinearVel()]; },
      GetPlayerSpeed: (a) => { player0(a, 1); return [this.player.getBikeEngineSpeed()]; },
      GetPlayerAngle: (a) => { player0(a, 1); return [this.player.getAngle()]; },
      GetPlayerProfileName: () => ['*deprecated*'],
      StartTimer: (a) => {
        if (a.count < 1 || a.count > 3) a.error('Invalid number of arguments');
        const name = a.str(1);
        let delay = 100, loops = 0;
        if (a.count > 1) { delay = a.num(2) | 0; if (delay < 1) a.error("StartTimer: delay can't be smaller than 1."); }
        if (a.count > 2) { loops = a.num(3) | 0; if (loops < 0) a.error("StartTimer: loops can't be smaller than 0."); }
        const t = this.timers.find((x) => x.name === name);
        if (!t) this.timers.push(new ScriptTimer(name, delay, loops, this.time));
        else if (a.count === 1) t.running = true;
        else t.reset(delay, loops, this.time);
      },
      SetTimerDelay: (a) => {
        check(a, 2);
        const t = this.timers.find((x) => x.name === a.str(1));
        if (!t) a.error("An error occurred, timer doesn't exist!");
        t!.delay = a.num(2) | 0;
      },
      StopTimer: (a) => {
        check(a, 1);
        const t = this.timers.find((x) => x.name === a.str(1));
        if (!t) a.error("An error occurred, timer doesn't exist!");
        t!.running = false;
      },
      ToggleCameraFollow: () => {},
    };
    return fns;
  }
  private removeDynamicOf(id: string): void { this.dynObjects = this.dynObjects.filter((d) => d.objectId !== id); }
}

/** what Game.GetKeyByAction answers with the default keys (Input.cpp's action names) */
export const KEY_BY_ACTION: Record<string, string> = {
  Drive: 'Up', Brake: 'Down', PullBack: 'Left', PushForward: 'Right', ChangeDirection: 'Space',
  'Drive 1': 'Up', 'Brake 1': 'Down', 'Flip left 1': 'Left', 'Flip right 1': 'Right', 'Change direction 1': 'Space',
};

/** Scene::touchEntityBodyExceptHead */
function touchBodyExceptHead(s: BikeState, e: Entity): boolean {
  const r1 = { x: 0, y: 0 }, r2 = { x: 0, y: 0 };
  const segs = s.Dir === DD_RIGHT
    ? [[s.FootP, s.KneeP], [s.KneeP, s.LowerBodyP], [s.LowerBodyP, s.ShoulderP], [s.ShoulderP, s.ElbowP], [s.ElbowP, s.HandP]]
    : [[s.Foot2P, s.Knee2P], [s.Knee2P, s.LowerBody2P], [s.LowerBody2P, s.Shoulder2P], [s.Shoulder2P, s.Elbow2P], [s.Elbow2P, s.Hand2P]];
  for (const [a, b] of segs) if (intersectLineCircle2f(e.dynamicPosition, e.size, a, b, r1, r2) > 0) return true;
  return false;
}
void intersectLineCircle2f;
