// The ninja's dash for the client's prediction (not the original's: Teeworlds 0.7.5 does not predict it). The server
// (server/.../game/server/Character.java FireNinja, HandleNinja) fires the ninja at the tick its input is for and
// sends the dash's state to the tee's own client in a snapshot item of its own, NETOBJTYPE_FG_NINJA; with it the
// client moves its tee as the server does, tick by tick from the snapshot with the inputs it sent: the dash shows
// the moment fire is pressed, where the original's tee stood still for the ping and then jumped the whole dash.
// Float for float the server's arithmetic (base/vmath.ts), so that prediction and server agree to the bit.
import { vec2, f, length, normalize, ZERO } from '../base/vmath.ts';
import { CCharacterCore, PHYS_SIZE } from './gamecore.ts';
import { g_pData } from '../generated/content.ts';
import * as P from '../generated/protocol.ts';
import { SERVER_TICK_SPEED } from '../engine/shared/protocol.ts';

/** the server's own snapshot item (type 63, free in the original's protocol): the receiver's tee's ninja */
export const NETOBJTYPE_FG_NINJA = 63, FG_NINJA_INTS = 6;

const TICK_SPEED = SERVER_TICK_SPEED;
const N = g_pData.m_Weapons.m_Ninja;
/** the dash's ticks (200 ms), its speed (units a tick), the reload after an attack (800 ms) */
export const NINJA_MOVETICKS = Math.trunc((N.m_Movetime * TICK_SPEED) / 1000);
export const NINJA_VELOCITY = N.m_Velocity;
export const NINJA_RELOADTICKS = Math.trunc((g_pData.m_Weapons.m_aId[P.WEAPON_NINJA].m_Firedelay * TICK_SPEED) / 1000);

const view = new DataView(new ArrayBuffer(4));
const fromBits = (i: number): number => {
  view.setInt32(0, i);
  return view.getFloat32(0);
};

/** presses of fire between two input states (CountInput) */
export function presses(prev: number, cur: number): number {
  let n = 0, i = prev & P.INPUT_STATE_MASK;
  cur &= P.INPUT_STATE_MASK;
  while (i !== cur) {
    i = (i + 1) & P.INPUT_STATE_MASK;
    if (i & 1) n++;
  }
  return n;
}

/** a tee's ninja: as at the end of a tick (the snapshot's), then as the prediction moves it on */
export class CNinja {
  /** the dash's direction, its ticks left (after this tick's), the speed (length) the tee had before it */
  m_Dir = ZERO;
  m_MoveTime = 0;
  m_OldVel = 0;
  /** ticks until the ninja can attack again; the last tick the ninja is held (then it is gone) */
  m_Reload = 0;
  m_EndTick = 0;
  /** the tick of the last attack the prediction saw (-1: none) */
  m_AttackTick = -1;

  static read(d: Int32Array): CNinja {
    const n = new CNinja();
    n.m_Dir = new vec2(fromBits(d[0]), fromBits(d[1]));
    n.m_MoveTime = d[2];
    n.m_OldVel = d[3];
    n.m_Reload = d[4];
    n.m_EndTick = d[5];
    return n;
  }

  clone(): CNinja {
    return Object.assign(new CNinja(), this);
  }

  /**
   * One tick of the tee, after its core's Tick(true) and before its Move(): the server's HandleNinja (the ninja ends,
   * or the dash moves the tee), then HandleWeapons' reload and the attack on a press of fire (FireNinja), aimed as
   * `input` aims. Returns false once the ninja is gone.
   */
  Tick(core: CCharacterCore, tick: number, input: P.CNetObj_PlayerInput, prev: P.CNetObj_PlayerInput): boolean {
    if (tick > this.m_EndTick) {
      if (this.m_MoveTime > 0) core.m_Vel = this.m_Dir.mul(this.m_OldVel);
      return false;
    }
    this.m_MoveTime--;
    if (this.m_MoveTime === 0) core.m_Vel = this.m_Dir.mul(this.m_OldVel);
    if (this.m_MoveTime > 0) {
      const s = { pos: core.m_Pos, vel: this.m_Dir.mul(NINJA_VELOCITY) };
      core.m_pCollision!.MoveBox(s, new vec2(PHYS_SIZE, PHYS_SIZE), 0, false);
      core.m_Pos = s.pos;
      core.m_Vel = ZERO;
    }
    if (this.m_Reload !== 0) {
      this.m_Reload--;
      return true;
    }
    if (presses(prev.m_Fire, input.m_Fire) === 0) return true;
    // the server's tee aims at 0,-1 when its input aims at the centre (CCharacter::OnPredictedInput)
    const tx = input.m_TargetX, ty = input.m_TargetX === 0 && input.m_TargetY === 0 ? -1 : input.m_TargetY;
    this.m_Dir = normalize(new vec2(tx, ty));
    this.m_MoveTime = NINJA_MOVETICKS;
    this.m_OldVel = Math.trunc(f(length(core.m_Vel)));
    this.m_Reload = NINJA_RELOADTICKS;
    this.m_AttackTick = tick;
    return true;
  }
}
