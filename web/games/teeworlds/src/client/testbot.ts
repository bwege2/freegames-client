// A capture-the-flag bot for the end-to-end test (not part of the game): the steering of the server oracle's
// scripted clients (re/teeworlds/oracle/client.cpp, mode=flag: a breadth first path over the free tiles of the
// game layer as a guide, running, jumping and hooking towards a tile a few steps along it), driving the client's
// own controls (CControls: the direction keys, jump, hook and the aim) once per predicted tick. It runs for the
// enemy flag's stand (read from the map's entities), and with the flag back to its own stand.
// Two additions to the oracle's steering: it notices going nowhere (less than a tile in a second, e.g. swinging
// on its hook under an overhang), and it does not hook again at a place that led nowhere.
import { vec2, distance, angle, direction, clamp } from '../base/vmath.ts';
import * as P from '../generated/protocol.ts';
import { COLFLAG_SOLID, type CCollision } from '../game/collision.ts';
import { ENTITY_OFFSET, ENTITY_FLAGSTAND_RED, ENTITY_FLAGSTAND_BLUE } from '../game/mapitems.ts';
import type { CGameClient } from './game/gameclient.ts';

export interface CSteerInput { m_Direction: number; m_Jump: number; m_Hook: number; m_TargetX: number; m_TargetY: number }

/** the flag stands of a map (the game layer's entities): [red, blue] */
export function FlagStands(C: CCollision): (vec2 | null)[] {
  const a: (vec2 | null)[] = [null, null];
  for (let y = 0; y < C.GetHeight(); y++)
    for (let x = 0; x < C.GetWidth(); x++) {
      const t = C.m_pTiles[(y * C.GetWidth() + x) * 4];
      if (t === ENTITY_OFFSET + ENTITY_FLAGSTAND_RED) a[P.TEAM_RED] = new vec2(x * 32 + 16, y * 32 + 16);
      if (t === ENTITY_OFFSET + ENTITY_FLAGSTAND_BLUE) a[P.TEAM_BLUE] = new vec2(x * 32 + 16, y * 32 + 16);
    }
  return a;
}

/** the oracle's SteerTo and Waypoint: one tick's input towards a target */
export class CSteer {
  private C: CCollision;
  private rnd: (n: number) => number;
  private m_Path: number[] = [];
  private m_PathAge = 0;
  private m_HookTicks = 0;
  private m_StuckTicks = 0;
  private m_WanderTicks = 0;
  private m_WanderDir = 1;
  private m_LastPos = new vec2(0, 0);
  private m_CheckPos = new vec2(0, 0);
  private m_CheckTicks = 0;
  private m_BadHooks = new Set<number>();
  private m_LastHook = -1;
  private m_Last: CSteerInput = { m_Direction: 0, m_Jump: 0, m_Hook: 0, m_TargetX: 1, m_TargetY: 0 };
  constructor(C: CCollision, rnd: (n: number) => number = (n) => Math.floor(Math.random() * n)) {
    this.C = C;
    this.rnd = rnd;
  }

  private Solid(x: number, y: number): boolean { return this.C.CheckPoint(x, y); }
  private FreeTile(x: number, y: number): boolean {
    if (x < 0 || y < 0 || x >= this.C.GetWidth() || y >= this.C.GetHeight()) return false;
    return !this.C.CheckPoint(x * 32 + 16, y * 32 + 16);
  }

  private Waypoint(Pos: vec2, Target: vec2): vec2 {
    const W = this.C.GetWidth(), H = this.C.GetHeight();
    const sx = clamp(Math.trunc(Pos.x / 32), 0, W - 1), sy = clamp(Math.trunc(Pos.y / 32), 0, H - 1);
    const tx = clamp(Math.trunc(Target.x / 32), 0, W - 1), ty = clamp(Math.trunc(Target.y / 32), 0, H - 1);
    if (!this.m_Path.length || ++this.m_PathAge > 10 || this.m_Path[this.m_Path.length - 1] !== ty * W + tx) {
      this.m_PathAge = 0;
      this.m_Path = [];
      const Prev = new Int32Array(W * H).fill(-1);
      const Queue = [sy * W + sx];
      Prev[sy * W + sx] = sy * W + sx;
      const adx = [1, -1, 0, 0, 1, 1, -1, -1], ady = [0, 0, 1, -1, 1, -1, 1, -1];
      for (let q = 0; q < Queue.length; q++) {
        const c = Queue[q], cx = c % W, cy = Math.trunc(c / W);
        if (c === ty * W + tx) break;
        for (let d = 0; d < 8; d++) {
          const nx = cx + adx[d], ny = cy + ady[d];
          if (!this.FreeTile(nx, ny) || Prev[ny * W + nx] !== -1) continue;
          if (d >= 4 && (!this.FreeTile(cx + adx[d], cy) || !this.FreeTile(cx, cy + ady[d]))) continue;
          Prev[ny * W + nx] = c;
          Queue.push(ny * W + nx);
        }
      }
      if (Prev[ty * W + tx] === -1) return Target;
      for (let c = ty * W + tx; c !== sy * W + sx; c = Prev[c]) this.m_Path.unshift(c);
    }
    // the first path tile 4 steps ahead of the nearest one
    let Best = 0, BestD = 1e9;
    for (let i = 0; i < this.m_Path.length; i++) {
      const d = distance(new vec2((this.m_Path[i] % W) * 32 + 16, Math.trunc(this.m_Path[i] / W) * 32 + 16), Pos);
      if (d < BestD) { BestD = d; Best = i; }
    }
    if (!this.m_Path.length) return Target;
    const i = Math.min(Best + 4, this.m_Path.length - 1);
    return new vec2((this.m_Path[i] % W) * 32 + 16, Math.trunc(this.m_Path[i] / W) * 32 + 16);
  }

  Step(Pos: vec2, Vel: vec2, Target: vec2): CSteerInput {
    const rnd = this.rnd;
    const In: CSteerInput = { m_Direction: 0, m_Jump: 0, m_Hook: 0, m_TargetX: this.m_Last.m_TargetX, m_TargetY: this.m_Last.m_TargetY };
    const W = this.Waypoint(Pos, Target);
    const dx = W.x - Pos.x, dy = W.y - Pos.y;
    let Dir = dx > 24 ? 1 : dx < -24 ? -1 : 0;
    if (this.m_WanderTicks > 0) {
      this.m_WanderTicks--;
      Dir = this.m_WanderDir;
    }
    In.m_Direction = Dir;
    const Grounded = this.Solid(Pos.x + 14, Pos.y + 14 + 5) || this.Solid(Pos.x - 14, Pos.y + 14 + 5);
    const Wall = Dir !== 0 && (this.Solid(Pos.x + Dir * 32, Pos.y) || this.Solid(Pos.x + Dir * 32, Pos.y - 24));
    const WantJump = (Grounded && (dy < -64 || Wall)) || (!Grounded && Vel.y > 2 && dy < -120) || (this.m_WanderTicks > 0 && rnd(8) === 0);
    In.m_Jump = this.m_Last.m_Jump ? 0 : WantJump ? 1 : 0;
    // hook: up towards the target, if there is ground to grab
    if (this.m_HookTicks > 0) {
      this.m_HookTicks--;
      In.m_Hook = this.m_HookTicks > 0 ? 1 : 0;
    } else if (this.m_WanderTicks <= 0 && (dy < -40 || Wall || (Math.abs(dx) > 200 && !Grounded && rnd(4) === 0))) {
      // the direction towards the waypoint, turned up a little, then the first angle that grabs ground
      const Base = angle(new vec2(dx, dy - 64));
      for (let k = 0; k < 9; k++) {
        const a = Base + Math.trunc((k + 1) / 2) * 0.2 * (k & 1 ? 1 : -1);
        const A = direction(a);
        const out: { col?: vec2 } = {};
        if (A.y < 0.3 && this.C.IntersectLine(Pos, Pos.add(A.mul(360)), out) === COLFLAG_SOLID && distance(out.col!, W) < distance(Pos, W) + 64) {
          const tile = Math.trunc(out.col!.y / 32) * this.C.GetWidth() + Math.trunc(out.col!.x / 32);
          if (this.m_BadHooks.has(tile)) continue;
          this.m_LastHook = tile;
          In.m_TargetX = Math.trunc(A.x * 200);
          In.m_TargetY = Math.trunc(A.y * 200);
          In.m_Hook = 1;
          this.m_HookTicks = 8 + rnd(20);
          break;
        }
      }
    }
    if (!In.m_Hook) {
      // AimAndFire without an enemy: the aim along the run
      In.m_TargetX = Dir * 100 || 1;
      In.m_TargetY = 0;
    }
    // stuck: wander for a while
    if (distance(Pos, this.m_LastPos) < 1.5) {
      if (++this.m_StuckTicks > 40) {
        this.m_StuckTicks = 0;
        this.m_WanderTicks = 30 + rnd(40);
        this.m_WanderDir = rnd(2) ? 1 : -1;
      }
    } else this.m_StuckTicks = 0;
    this.m_LastPos = Pos;
    // going nowhere: less than a tile in a second
    if (++this.m_CheckTicks >= 50) {
      if (distance(Pos, this.m_CheckPos) < 32 && this.m_WanderTicks <= 0) {
        if (this.m_LastHook >= 0) this.m_BadHooks.add(this.m_LastHook);
        this.m_LastHook = -1;
        this.m_WanderTicks = 30 + rnd(40);
        this.m_WanderDir = rnd(2) ? 1 : -1;
        this.m_HookTicks = 0;
        In.m_Hook = 0;
      } else if (distance(Pos, this.m_CheckPos) >= 32) this.m_LastHook = -1; // the hook got it somewhere
      this.m_CheckTicks = 0;
      this.m_CheckPos = Pos;
    }
    this.m_Last = In;
    return In;
  }
}

/** the steering on the client: the predicted own tee, the flags of the snapshot, the controls */
export class CFlagBot {
  private gc: CGameClient;
  private steer: CSteer | null = null;
  private aStand: (vec2 | null)[] = [null, null];
  private m_LastTick = -1;
  constructor(gc: CGameClient) { this.gc = gc; }

  Tick(): void {
    const gc = this.gc, Cl = gc.Client();
    if (Cl.PredGameTick() === this.m_LastTick) return;
    this.m_LastTick = Cl.PredGameTick();
    const ctl = gc.m_pControls;
    const me = gc.m_LocalClientID >= 0 ? gc.m_Snap.m_aCharacters[gc.m_LocalClientID] : null;
    if (!me || !me.m_Active) {
      ctl.m_InputDirectionLeft = ctl.m_InputDirectionRight = 0;
      ctl.m_InputData.m_Jump = ctl.m_InputData.m_Hook = 0;
      return;
    }
    if (!this.steer) {
      this.steer = new CSteer(gc.Collision());
      this.aStand = FlagStands(gc.Collision());
    }
    const Pos = gc.m_PredictedChar.m_Pos, Vel = gc.m_PredictedChar.m_Vel;
    const Mine = gc.m_aClients[gc.m_LocalClientID].m_Team === P.TEAM_BLUE ? P.TEAM_BLUE : P.TEAM_RED, Theirs = Mine ^ 1;
    const gdf = gc.m_Snap.m_pGameDataFlag;
    const aCarrier = gdf ? [gdf.m_FlagCarrierRed, gdf.m_FlagCarrierBlue] : [P.FLAG_ATSTAND, P.FLAG_ATSTAND];
    let Target = this.aStand[Theirs] ?? Pos;
    if (aCarrier[Theirs] === gc.m_LocalClientID) Target = this.aStand[Mine] ?? Pos;
    else if (aCarrier[Theirs] !== P.FLAG_ATSTAND && gc.m_Snap.m_paFlags[Theirs]) Target = new vec2(gc.m_Snap.m_paFlags[Theirs]!.m_X, gc.m_Snap.m_paFlags[Theirs]!.m_Y);
    const In = this.steer.Step(Pos, Vel, Target);
    ctl.m_InputDirectionLeft = In.m_Direction < 0 ? 1 : 0;
    ctl.m_InputDirectionRight = In.m_Direction > 0 ? 1 : 0;
    ctl.m_InputData.m_Jump = In.m_Jump;
    ctl.m_InputData.m_Hook = In.m_Hook;
    ctl.m_MousePos = new vec2(In.m_TargetX, In.m_TargetY);
  }
}
