// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: game/gamecore.{h,cpp} and game/tuning.h of Teeworlds 0.7.5 in TypeScript.
import {
  vec2, ZERO, f, angle, closest_point_on_line, distance, dot, length, mixv, normalize, powf, round_to_int, toInt,
} from '../base/vmath.ts';
import { str_comp_nocase } from '../base/system.ts';
import type { CCollision } from './collision.ts';
import { COLFLAG_NOHOOK } from './collision.ts';
import * as P from '../generated/protocol.ts';
import { MAX_CLIENTS, SERVER_TICK_SPEED } from '../engine/shared/protocol.ts';

export const TUNING_NAMES = [
  'ground_control_speed', 'ground_control_accel', 'ground_friction', 'ground_jump_impulse', 'air_jump_impulse',
  'air_control_speed', 'air_control_accel', 'air_friction', 'hook_length', 'hook_fire_speed', 'hook_drag_accel',
  'hook_drag_speed', 'gravity', 'velramp_start', 'velramp_range', 'velramp_curvature', 'gun_curvature', 'gun_speed',
  'gun_lifetime', 'shotgun_curvature', 'shotgun_speed', 'shotgun_speeddiff', 'shotgun_lifetime', 'grenade_curvature',
  'grenade_speed', 'grenade_lifetime', 'laser_reach', 'laser_bounce_delay', 'laser_bounce_num', 'laser_bounce_cost',
  'player_collision', 'player_hooking'];

const TPS = 50;
const TUNING_DEFAULTS = [10.0, f(100 / TPS), 0.5, 13.2, 12.0, f(250 / TPS), 1.5, 0.95, 380.0, 80.0, 3.0, 15.0, 0.5, 550, 2000, 1.4,
  1.25, 2200.0, 2.0, 1.25, 2750.0, 0.8, 0.20, 7.0, 1000.0, 2.0, 800.0, 150, 1, 0, 1, 1];

/** CTuningParams: every parameter a CTuneParam, an int holding value*100 */
export class CTuningParams {
  readonly v = new Int32Array(TUNING_NAMES.length);
  constructor() {
    for (let i = 0; i < TUNING_DEFAULTS.length; i++) this.v[i] = toInt(f(f(TUNING_DEFAULTS[i]) * 100));
  }
  copy(): CTuningParams {
    const t = new CTuningParams();
    t.v.set(this.v);
    return t;
  }
  static Num(): number { return TUNING_NAMES.length; }
  /** operator float(): m_Value/100.0f */
  get(i: number): number { return f(this.v[i] / 100); }
  Set(i: number, Value: number): boolean {
    if (i < 0 || i >= TUNING_NAMES.length) return false;
    this.v[i] = toInt(f(f(Value) * 100));
    return true;
  }
  SetByName(name: string, Value: number): boolean {
    for (let i = 0; i < TUNING_NAMES.length; i++) if (str_comp_nocase(name, TUNING_NAMES[i]) === 0) return this.Set(i, Value);
    return false;
  }
  equals(o: CTuningParams): boolean {
    for (let i = 0; i < this.v.length; i++) if (this.v[i] !== o.v[i]) return false;
    return true;
  }
  get m_GroundControlSpeed(): number { return this.get(0); }
  get m_GroundControlAccel(): number { return this.get(1); }
  get m_GroundFriction(): number { return this.get(2); }
  get m_GroundJumpImpulse(): number { return this.get(3); }
  get m_AirJumpImpulse(): number { return this.get(4); }
  get m_AirControlSpeed(): number { return this.get(5); }
  get m_AirControlAccel(): number { return this.get(6); }
  get m_AirFriction(): number { return this.get(7); }
  get m_HookLength(): number { return this.get(8); }
  get m_HookFireSpeed(): number { return this.get(9); }
  get m_HookDragAccel(): number { return this.get(10); }
  get m_HookDragSpeed(): number { return this.get(11); }
  get m_Gravity(): number { return this.get(12); }
  get m_VelrampStart(): number { return this.get(13); }
  get m_VelrampRange(): number { return this.get(14); }
  get m_VelrampCurvature(): number { return this.get(15); }
  get m_GunCurvature(): number { return this.get(16); }
  get m_GunSpeed(): number { return this.get(17); }
  get m_GunLifetime(): number { return this.get(18); }
  get m_ShotgunCurvature(): number { return this.get(19); }
  get m_ShotgunSpeed(): number { return this.get(20); }
  get m_ShotgunSpeeddiff(): number { return this.get(21); }
  get m_ShotgunLifetime(): number { return this.get(22); }
  get m_GrenadeCurvature(): number { return this.get(23); }
  get m_GrenadeSpeed(): number { return this.get(24); }
  get m_GrenadeLifetime(): number { return this.get(25); }
  get m_LaserReach(): number { return this.get(26); }
  get m_LaserBounceDelay(): number { return this.get(27); }
  get m_LaserBounceNum(): number { return this.get(28); }
  get m_LaserBounceCost(): number { return this.get(29); }
  get m_PlayerCollision(): number { return this.get(30); }
  get m_PlayerHooking(): number { return this.get(31); }
}

/** StrToInts (gamecore.h): a byte string into ints (each byte +128) */
export function StrToInts(ints: Int32Array | number[], off: number, Num: number, s: string): void {
  let Index = 0;
  for (let n = 0; n < Num; n++) {
    const a = [0, 0, 0, 0];
    for (let c = 0; c < 4 && Index < s.length; c++, Index++) a[c] = (s.charCodeAt(Index) << 24) >> 24; // signed char
    ints[off + n] = (((a[0] + 128) << 24) | ((a[1] + 128) << 16) | ((a[2] + 128) << 8) | (a[3] + 128)) | 0;
  }
  ints[off + Num - 1] &= 0xffffff00;
}

/** IntsToStr (gamecore.h): ints into a byte string */
export function IntsToStr(ints: ArrayLike<number>, off: number, Num: number): string {
  const b: number[] = [];
  for (let n = 0; n < Num; n++) {
    const v = ints[off + n];
    b.push((((v >> 24) & 0xff) - 128) & 0xff, (((v >> 16) & 0xff) - 128) & 0xff, (((v >> 8) & 0xff) - 128) & 0xff, ((v & 0xff) - 128) & 0xff);
  }
  b[b.length - 1] = 0;
  let s = '';
  for (const c of b) {
    if (!c) break;
    s += String.fromCharCode(c);
  }
  return s;
}

export function CalcPos(Pos: vec2, Velocity: vec2, Curvature: number, Speed: number, Time: number): vec2 {
  Time = f(Time * Speed);
  const nx = f(Pos.x + f(Velocity.x * Time));
  const ny = f(f(Pos.y + f(Velocity.y * Time)) + f(f(Curvature / 10000) * f(Time * Time)));
  return new vec2(nx, ny);
}

export function SaturatedAdd(Min: number, Max: number, Current: number, Modifier: number): number {
  if (Modifier < 0) {
    if (Current < Min) return Current;
    Current = f(Current + Modifier);
    if (Current < Min) Current = Min;
    return Current;
  }
  if (Current > Max) return Current;
  Current = f(Current + Modifier);
  if (Current > Max) Current = Max;
  return Current;
}

export function VelocityRamp(Value: number, Start: number, Range: number, Curvature: number): number {
  if (Value < Start) return 1;
  return f(1 / powf(Curvature, f(f(Value - Start) / Range)));
}

export const HOOK_RETRACTED = -1, HOOK_IDLE = 0, HOOK_RETRACT_START = 1, HOOK_RETRACT_END = 3, HOOK_FLYING = 4, HOOK_GRABBED = 5;

export class CWorldCore {
  m_Tuning = new CTuningParams();
  readonly m_apCharacters: (CCharacterCore | null)[] = new Array(MAX_CLIENTS).fill(null);
}

export function emptyInput(): P.CNetObj_PlayerInput {
  return { m_Direction: 0, m_TargetX: 0, m_TargetY: 0, m_Jump: 0, m_Fire: 0, m_Hook: 0, m_PlayerFlags: 0, m_WantedWeapon: 0, m_NextWeapon: 0, m_PrevWeapon: 0 };
}

export function emptyCore(): P.CNetObj_CharacterCore {
  return { m_Tick: 0, m_X: 0, m_Y: 0, m_VelX: 0, m_VelY: 0, m_Angle: 0, m_Direction: 0, m_Jumped: 0, m_HookedPlayer: 0, m_HookState: 0, m_HookTick: 0, m_HookX: 0, m_HookY: 0, m_HookDx: 0, m_HookDy: 0 };
}

export const PHYS_SIZE = 28;

export class CCharacterCore {
  m_pWorld: CWorldCore | null = null;
  m_pCollision: CCollision | null = null;
  m_Pos = ZERO;
  m_Vel = ZERO;
  m_HookPos = ZERO;
  m_HookDir = ZERO;
  m_HookTick = 0;
  m_HookState = 0;
  m_HookedPlayer = 0;
  m_Jumped = 0;
  m_Direction = 0;
  m_Angle = 0;
  m_Death = false;
  m_Input: P.CNetObj_PlayerInput = emptyInput();
  m_TriggeredEvents = 0;

  Init(w: CWorldCore | null, c: CCollision): void {
    this.m_pWorld = w;
    this.m_pCollision = c;
  }

  Reset(): void {
    this.m_Pos = ZERO;
    this.m_Vel = ZERO;
    this.m_HookPos = ZERO;
    this.m_HookDir = ZERO;
    this.m_HookTick = 0;
    this.m_HookState = HOOK_IDLE;
    this.m_HookedPlayer = -1;
    this.m_Jumped = 0;
    this.m_TriggeredEvents = 0;
    this.m_Death = false;
  }

  /** a copy (C++ assigns cores by value) */
  clone(): CCharacterCore {
    const c = new CCharacterCore();
    Object.assign(c, this);
    c.m_Input = { ...this.m_Input };
    return c;
  }

  Tick(UseInput: boolean): void {
    const w = this.m_pWorld!;
    const t = w.m_Tuning;
    const col = this.m_pCollision!;
    this.m_TriggeredEvents = 0;
    const half = PHYS_SIZE / 2;
    let Grounded = false;
    if (col.CheckPoint(f(this.m_Pos.x + half), f(f(this.m_Pos.y + half) + 5))) Grounded = true;
    if (col.CheckPoint(f(this.m_Pos.x - half), f(f(this.m_Pos.y + half) + 5))) Grounded = true;

    const TargetDirection = normalize(new vec2(this.m_Input.m_TargetX, this.m_Input.m_TargetY));

    this.m_Vel = this.m_Vel.withY(f(this.m_Vel.y + t.m_Gravity));

    const MaxSpeed = Grounded ? t.m_GroundControlSpeed : t.m_AirControlSpeed;
    const Accel = Grounded ? t.m_GroundControlAccel : t.m_AirControlAccel;
    const Friction = Grounded ? t.m_GroundFriction : t.m_AirFriction;

    if (UseInput) {
      this.m_Direction = this.m_Input.m_Direction;
      this.m_Angle = toInt(f(angle(new vec2(this.m_Input.m_TargetX, this.m_Input.m_TargetY)) * 256));
      if (this.m_Input.m_Jump) {
        if (!(this.m_Jumped & 1)) {
          if (Grounded) {
            this.m_TriggeredEvents |= P.COREEVENTFLAG_GROUND_JUMP;
            this.m_Vel = this.m_Vel.withY(-t.m_GroundJumpImpulse);
            this.m_Jumped |= 1;
          } else if (!(this.m_Jumped & 2)) {
            this.m_TriggeredEvents |= P.COREEVENTFLAG_AIR_JUMP;
            this.m_Vel = this.m_Vel.withY(-t.m_AirJumpImpulse);
            this.m_Jumped |= 3;
          }
        }
      } else this.m_Jumped &= ~1;

      if (this.m_Input.m_Hook) {
        if (this.m_HookState === HOOK_IDLE) {
          this.m_HookState = HOOK_FLYING;
          this.m_HookPos = this.m_Pos.add(TargetDirection.mul(PHYS_SIZE).mul(1.5));
          this.m_HookDir = TargetDirection;
          this.m_HookedPlayer = -1;
          this.m_HookTick = 0;
        }
      } else {
        this.m_HookedPlayer = -1;
        this.m_HookState = HOOK_IDLE;
        this.m_HookPos = this.m_Pos;
      }
    }

    if (this.m_Direction < 0) this.m_Vel = this.m_Vel.withX(SaturatedAdd(-MaxSpeed, MaxSpeed, this.m_Vel.x, -Accel));
    if (this.m_Direction > 0) this.m_Vel = this.m_Vel.withX(SaturatedAdd(-MaxSpeed, MaxSpeed, this.m_Vel.x, Accel));
    if (this.m_Direction === 0) this.m_Vel = this.m_Vel.withX(f(this.m_Vel.x * Friction));

    if (Grounded) this.m_Jumped &= ~2;

    if (this.m_HookState === HOOK_IDLE) {
      this.m_HookedPlayer = -1;
      this.m_HookState = HOOK_IDLE;
      this.m_HookPos = this.m_Pos;
    } else if (this.m_HookState >= HOOK_RETRACT_START && this.m_HookState < HOOK_RETRACT_END) {
      this.m_HookState++;
    } else if (this.m_HookState === HOOK_RETRACT_END) {
      this.m_HookState = HOOK_RETRACTED;
    } else if (this.m_HookState === HOOK_FLYING) {
      let NewPos = this.m_HookPos.add(this.m_HookDir.mul(t.m_HookFireSpeed));
      if (distance(this.m_Pos, NewPos) > t.m_HookLength) {
        this.m_HookState = HOOK_RETRACT_START;
        NewPos = this.m_Pos.add(normalize(NewPos.sub(this.m_Pos)).mul(t.m_HookLength));
      }
      let GoingToHitGround = false;
      let GoingToRetract = false;
      const o: { col?: vec2 } = {};
      const Hit = col.IntersectLine(this.m_HookPos, NewPos, o);
      NewPos = o.col!;
      if (Hit) {
        if (Hit & COLFLAG_NOHOOK) GoingToRetract = true;
        else GoingToHitGround = true;
      }
      if (t.m_PlayerHooking) {
        let Distance = 0;
        for (let i = 0; i < MAX_CLIENTS; i++) {
          const c = w.m_apCharacters[i];
          if (!c || c === this) continue;
          const ClosestPoint = closest_point_on_line(this.m_HookPos, NewPos, c.m_Pos);
          if (distance(c.m_Pos, ClosestPoint) < PHYS_SIZE + 2) {
            if (this.m_HookedPlayer === -1 || distance(this.m_HookPos, c.m_Pos) < Distance) {
              this.m_TriggeredEvents |= P.COREEVENTFLAG_HOOK_ATTACH_PLAYER;
              this.m_HookState = HOOK_GRABBED;
              this.m_HookedPlayer = i;
              Distance = distance(this.m_HookPos, c.m_Pos);
            }
          }
        }
      }
      if (this.m_HookState === HOOK_FLYING) {
        if (GoingToHitGround) {
          this.m_TriggeredEvents |= P.COREEVENTFLAG_HOOK_ATTACH_GROUND;
          this.m_HookState = HOOK_GRABBED;
        } else if (GoingToRetract) {
          this.m_TriggeredEvents |= P.COREEVENTFLAG_HOOK_HIT_NOHOOK;
          this.m_HookState = HOOK_RETRACT_START;
        }
        this.m_HookPos = NewPos;
      }
    }

    if (this.m_HookState === HOOK_GRABBED) {
      if (this.m_HookedPlayer !== -1) {
        const c = w.m_apCharacters[this.m_HookedPlayer];
        if (c) this.m_HookPos = c.m_Pos;
        else {
          this.m_HookedPlayer = -1;
          this.m_HookState = HOOK_RETRACTED;
          this.m_HookPos = this.m_Pos;
        }
      }
      if (this.m_HookedPlayer === -1 && distance(this.m_HookPos, this.m_Pos) > 46) {
        const HookVel = normalize(this.m_HookPos.sub(this.m_Pos)).mul(t.m_HookDragAccel);
        let hx = HookVel.x, hy = HookVel.y;
        if (hy > 0) hy = f(hy * f(0.3));
        if ((hx < 0 && this.m_Direction < 0) || (hx > 0 && this.m_Direction > 0)) hx = f(hx * f(0.95));
        else hx = f(hx * f(0.75));
        const NewVel = this.m_Vel.add(new vec2(hx, hy));
        if (length(NewVel) < t.m_HookDragSpeed || length(NewVel) < length(this.m_Vel)) this.m_Vel = NewVel;
      }
      this.m_HookTick++;
      if (this.m_HookedPlayer !== -1 && (this.m_HookTick > SERVER_TICK_SPEED + SERVER_TICK_SPEED / 5 || !w.m_apCharacters[this.m_HookedPlayer])) {
        this.m_HookedPlayer = -1;
        this.m_HookState = HOOK_RETRACTED;
        this.m_HookPos = this.m_Pos;
      }
    }

    for (let i = 0; i < MAX_CLIENTS; i++) {
      const c = w.m_apCharacters[i];
      if (!c || c === this) continue;
      const Distance = distance(this.m_Pos, c.m_Pos);
      const Dir = normalize(this.m_Pos.sub(c.m_Pos));
      if (t.m_PlayerCollision && Distance < f(PHYS_SIZE * f(1.25)) && Distance > 0) {
        const a = f(f(PHYS_SIZE * f(1.45)) - Distance);
        let Velocity = f(0.5);
        if (length(this.m_Vel) > 0.0001) Velocity = f(1 - f(f(dot(normalize(this.m_Vel), Dir) + 1) / 2));
        this.m_Vel = this.m_Vel.add(Dir.mul(a).mul(f(Velocity * f(0.75))));
        this.m_Vel = this.m_Vel.mul(f(0.85));
      }
      if (this.m_HookedPlayer === i && t.m_PlayerHooking) {
        if (Distance > f(PHYS_SIZE * f(1.5))) {
          const HAccel = f(t.m_HookDragAccel * f(Distance / t.m_HookLength));
          const DragSpeed = t.m_HookDragSpeed;
          const ovx = SaturatedAdd(-DragSpeed, DragSpeed, c.m_Vel.x, f(f(HAccel * Dir.x) * f(1.5)));
          const ovy = SaturatedAdd(-DragSpeed, DragSpeed, c.m_Vel.y, f(f(HAccel * Dir.y) * f(1.5)));
          c.m_Vel = new vec2(ovx, ovy);
          const mvx = SaturatedAdd(-DragSpeed, DragSpeed, this.m_Vel.x, f(f(-HAccel * Dir.x) * f(0.25)));
          const mvy = SaturatedAdd(-DragSpeed, DragSpeed, this.m_Vel.y, f(f(-HAccel * Dir.y) * f(0.25)));
          this.m_Vel = new vec2(mvx, mvy);
        }
      }
    }

    if (length(this.m_Vel) > 6000) this.m_Vel = normalize(this.m_Vel).mul(6000);
  }

  Move(): void {
    const w = this.m_pWorld;
    if (!w) return;
    const t = w.m_Tuning;
    const RampValue = VelocityRamp(f(length(this.m_Vel) * 50), t.m_VelrampStart, t.m_VelrampRange, t.m_VelrampCurvature);
    this.m_Vel = this.m_Vel.withX(f(this.m_Vel.x * RampValue));
    const s = { pos: this.m_Pos, vel: this.m_Vel };
    this.m_Death = this.m_pCollision!.MoveBox(s, new vec2(PHYS_SIZE, PHYS_SIZE), 0, true);
    const NewPos = s.pos;
    this.m_Vel = s.vel;
    this.m_Vel = this.m_Vel.withX(f(this.m_Vel.x * f(1 / RampValue)));
    if (t.m_PlayerCollision) {
      const Distance = distance(this.m_Pos, NewPos);
      const End = toInt(f(Distance + 1));
      let LastPos = this.m_Pos;
      for (let i = 0; i < End; i++) {
        const a = f(i / Distance);
        const Pos = mixv(this.m_Pos, NewPos, a);
        for (let p = 0; p < MAX_CLIENTS; p++) {
          const c = w.m_apCharacters[p];
          if (!c || c === this) continue;
          const D = distance(Pos, c.m_Pos);
          if (D < PHYS_SIZE && D >= 0) {
            if (a > 0) this.m_Pos = LastPos;
            else if (distance(NewPos, c.m_Pos) > D) this.m_Pos = NewPos;
            return;
          }
        }
        LastPos = Pos;
      }
    }
    this.m_Pos = NewPos;
  }

  Write(o: P.CNetObj_CharacterCore): void {
    o.m_X = round_to_int(this.m_Pos.x);
    o.m_Y = round_to_int(this.m_Pos.y);
    o.m_VelX = round_to_int(f(this.m_Vel.x * 256));
    o.m_VelY = round_to_int(f(this.m_Vel.y * 256));
    o.m_HookState = this.m_HookState;
    o.m_HookTick = this.m_HookTick;
    o.m_HookX = round_to_int(this.m_HookPos.x);
    o.m_HookY = round_to_int(this.m_HookPos.y);
    o.m_HookDx = round_to_int(f(this.m_HookDir.x * 256));
    o.m_HookDy = round_to_int(f(this.m_HookDir.y * 256));
    o.m_HookedPlayer = this.m_HookedPlayer;
    o.m_Jumped = this.m_Jumped;
    o.m_Direction = this.m_Direction;
    o.m_Angle = this.m_Angle;
  }

  Read(o: P.CNetObj_CharacterCore): void {
    this.m_Pos = new vec2(o.m_X, o.m_Y);
    this.m_Vel = new vec2(f(o.m_VelX / 256), f(o.m_VelY / 256));
    this.m_HookState = o.m_HookState;
    this.m_HookTick = o.m_HookTick;
    this.m_HookPos = new vec2(o.m_HookX, o.m_HookY);
    this.m_HookDir = new vec2(f(o.m_HookDx / 256), f(o.m_HookDy / 256));
    this.m_HookedPlayer = o.m_HookedPlayer;
    this.m_Jumped = o.m_Jumped;
    this.m_Direction = o.m_Direction;
    this.m_Angle = o.m_Angle;
  }

  Quantize(): void {
    const c = emptyCore();
    this.Write(c);
    this.Read(c);
  }
}
