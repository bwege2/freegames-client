// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the behaviour of the ships and objects, the target
// lock, the dynamic lights and the per-frame update of the level (src/lt_game2.c).
import * as m from '../v3x/math.ts';
import { V3X, meshOf, oviByName } from '../v3x/scene.ts';
import {
  type OVI, type Light, kPos, kVect, V3XMATRIX_Vector2, V3XSTATE_HIDDEN, V3XSTATE_HIDDENDISPLAY, V3XSTATE_CULLED,
  V3XSTATE_CULLEDOFR, V3XSTATE_MATRIXUPDATE, V3XOBJ_MESH, V3XOBJ_LIGHT,
} from '../v3x/vmx.ts';
import { csp, ClippedLine, GX } from '../gx/gx.ts';
import { g_cTimer, sysRand, randomf } from '../sys/sys.ts';
import { NG_Audio3DPlay, NG_Audio3DUpdate, NG_AudioStopSound } from './sound.ts';
import { NG_FXNew, NG_FXBlast, NG_FXDebris } from './fx.ts';
import { NG_WeaponFire } from './weapons.ts';
import { NG_DisplayWarp, NG_AISetTacticMode } from './play.ts';
import { conPrint } from './console.ts';
import {
  G, g_SGGame, g_SGSettings, type SGActor, type SGScript, type OviData, t_ENEMY, t_FRIEND, t_PIRAT, t_PLAYER, t_SPECIAL,
  t_ACCESSOIRE, ORDER_TargetWeakest, ORDER_TargetStrongest, ORDER_Attack, ORDER_Retreat, ORDER_StayAlert, ORDER_Protect,
  ORDER_AttackTarget, STEALTHMODE, DOOMEDMODE, REFRESH_FNF, m_OFF, m_REVERSE, m_LOOP, m_PINGPONG, t_ET_WARP, t_AD_ADD_AIM,
  t_AD_EXPLODE, t_AD_FAILED, t_AD_SUCCESS, SGNET_UPDATEAIM, SGNET_HASDIE, SGNET_SHIP, COM_EscortOk, COM_Failed, COM_FriendDead,
  MAX_COM_DELAY, GAMESTATE_FAIL, GAMESTATE_WON, GAMESTATE_DEAD, GAMESTATE_ABORT, HIND_MODE_PHASE_0, HIND_MODE_PHASE_1,
  HIND_MODE_PHASE_2, HIND_MAXPLAYER, t_EC_ENABLE, t_EC_SHIELDOFF, t_EC_SHIELDOFFDIE, t_EC_APPEAR, t_EC_TRACK_TOGGLE,
  t_ET_SHOOT, t_ET_DESTROY, FX_WARPIN, FX_CUSTOM, FX_SMOKE, CAMERA_DEATH, t_FIXE, t_GIANT, t_TURN_AROUND_X, t_TURN_AROUND_Y,
  t_TURN_AROUND_Z, t_TURN_RANDOM, t_MPLAYER, t_TAC_DROID, t_TAC_MINE, t_TAC_ATTACK1, t_TAC_ATTACK0, t_TAC_RANDOM_PATROL,
  t_TAC_PATROL_FIGHT1, t_TAC_TRACKFULL, t_TAC_TRACK, t_TAC_HIND,
} from './state.ts';

const posOf = (o: OVI): Float32Array => m.Pos(o.node.matrix);
const sif = (o: OVI): SGScript => (o.data as OviData).pInf;

export function NG_ColorToNAV(x: number): number {
  let nv = 0;
  if (x >= 4) { nv = (x - 4) >> 2; if (nv > 7) nv = 7; }
  return nv;
}
export function NG_MomentumValue(x: number, mx: number): number {
  const p = (g_cTimer.iCounter >> 15) << G.g_pCurrentGame.ship;
  if (x > 0) { x -= p; if (x > mx) x = mx; if (x < 0) x = 0; }
  else if (x < 0) { x += p; if (x < -mx) x = -mx; if (x > 0) x = 0; }
  return x;
}
/** NG_DrawCircle */
export function NG_DrawCircle(c: Float32Array, r: number, cx: number, cote: number): void {
  const p = Math.trunc(4096 / cote);
  const r0 = (r * GX.View.lRatio) >> 4, r1 = r;
  let b = { x: 0, y: 0 };
  for (let i = 0; i <= 4096; i += p) {
    const a = { x: c[0] + m.sin16(i) * r0, y: c[1] + m.cos16(i) * r1 };
    if (i > 1) ClippedLine(a, b, cx);
    b = a;
  }
}
export function NG_AIRandomAim(a: Float32Array, cent: Float32Array, r: number): void {
  const al = sysRand(4096), bl = sysRand(4096);
  m.polarSet(a, cent, r, al, bl);
}
export function NG_AIRandomAimEx(a: Float32Array, cent: Float32Array, r: number, al: number, bl: number): void { m.polarSet(a, cent, r, al, bl); }

/** NG_AILocateNearestEnemy: the nearest object of the other side (mode = the side asking) */
export function NG_AILocateNearestEnemy(pos: Float32Array, dist: Float32Array, mode: number): { OVI: OVI | null; di: number } {
  let maxy = m.CST_MAX;
  let minpower = 0xffff, maxpower = 0;
  let OVI2: OVI | null = null;
  const TargScan = G.g_pLockTarget ? G.g_pLockTarget : G.g_pPlayer.J.OVI;
  const P = G.g_pPlayer;
  const O = G.g_SGObjects;
  for (const OVI of g_SGGame.Scene!.OVI) {
    if (!OVI.data || OVI.state & V3XSTATE_HIDDEN) continue;
    const data = OVI.data as SGActor;
    const Sif = data.pInf;
    let b = false, mechant: boolean;
    switch (mode) {
      case t_ENEMY:
        mechant = Sif.Type === t_FRIEND || (Sif.Type === t_PLAYER && !(P.mode & STEALTHMODE)) || Sif.Type === t_PIRAT;
        switch (O.CallMode[t_ENEMY]) {
          case ORDER_TargetWeakest: if (mechant && Sif.Shield < minpower) { OVI2 = OVI; minpower = Sif.Shield; } break;
          case ORDER_TargetStrongest: if (mechant && Sif.Shield > maxpower) { OVI2 = OVI; maxpower = Sif.Shield; } break;
          case ORDER_Attack: b = mechant; break;
          case ORDER_Retreat: case ORDER_StayAlert: b = false; break;
          case ORDER_Protect: b = mechant; break;
          case ORDER_AttackTarget: b = Sif.Type === t_PLAYER && !(P.mode & STEALTHMODE); break;
        }
        break;
      case t_FRIEND:
        mechant = Sif.Type === t_ENEMY || Sif.Type === t_PIRAT;
        switch (O.CallMode[t_FRIEND]) {
          case ORDER_TargetWeakest: if (mechant && Sif.Shield < minpower) { OVI2 = OVI; minpower = Sif.Shield; } break;
          case ORDER_TargetStrongest: if (mechant && Sif.Shield > maxpower) { OVI2 = OVI; maxpower = Sif.Shield; } break;
          case ORDER_Attack: b = mechant || (Sif.Type === t_PLAYER && !(P.mode & STEALTHMODE) && !!(P.mode & DOOMEDMODE)); break;
          case ORDER_Retreat: case ORDER_StayAlert: b = false; break;
          case ORDER_Protect: b = mechant && data.OVItarget === TargScan; break;
          case ORDER_AttackTarget: b = mechant; break;
        }
        break;
      case t_PIRAT:
        break;
      case t_SPECIAL:
        b = Sif.Type === t_SPECIAL;
        break;
    }
    if (b) {
      const ds = m.vec();
      m.dif(ds, posOf(OVI), pos);
      const dii = m.lengthSq(ds);
      if (dii < maxy) { maxy = dii; OVI2 = OVI; }
    }
  }
  let di = 0;
  if (OVI2) { m.dif(dist, posOf(OVI2), pos); di = m.normalize(dist, dist); }
  return { OVI: OVI2, di };
}

function computeFoeDist(OVI: OVI, data: SGActor, camp: number, di2: Float32Array): number {
  let k2 = 0;
  if (!(g_SGGame.Count & REFRESH_FNF) || !data.OVItarget) {
    const r = NG_AILocateNearestEnemy(posOf(OVI), di2, camp);
    data.OVItarget = r.OVI;
    k2 = r.di;
  } else if (data.OVItarget) {
    m.dif(di2, posOf(data.OVItarget), posOf(OVI));
    k2 = m.normalize(di2, di2);
  }
  return k2;
}

/** NG_AIEnemyGeneric: turns towards NewAim and moves at fSpeed */
function NG_AIEnemyGeneric(OVI: OVI): void {
  const nm = meshOf(OVI).Tk;
  const data = OVI.data as SGActor;
  const p = data.pInf;
  if (data.Mv.k > 0 && OVI.matrix_Method === V3XMATRIX_Vector2) {
    const dt = Math.fround((p.SpeedTurn * g_cTimer.fCounter) / 700);
    data.Mv.k = Math.fround(data.Mv.k - dt);
    if (data.Mv.k > 0) {
      const tmp = m.vec();
      m.slerp(tmp, data.Mv.NewAim, data.Mv.OldAim, data.Mv.k);
      if (m.lengthSq(tmp) > m.CST_EPSILON) m.normalize(kVect(nm), tmp);
    } else if (m.lengthSq(data.Mv.NewAim) > m.CST_EPSILON) m.normalize(kVect(nm), data.Mv.NewAim);
  }
  const k = Math.fround(p.fSpeed * g_cTimer.fCounter * 2);
  m.scl(data.Mv.vel, kVect(nm), k);
  m.inc(kPos(nm), data.Mv.vel);
  if (p.Doppler) {
    const dir = m.vec();
    m.dif(dir, kPos(nm), m.Pos(G.g_pPlayer.Mat));
    if (m.lengthSq(dir) < 1000000) {
      m.dif(dir, G.g_pPlayer.J.Mv.vel, data.Mv.vel);
      if (m.lengthSq(dir) > 32) {
        if (!p.Doppling) p.Doppling = NG_Audio3DPlay(p.Doppler - 1, kPos(nm), data.Mv.vel);
        else if (!NG_Audio3DUpdate(kPos(nm), data.Mv.vel, p.Doppling, p.Doppler - 1)) p.Doppling = 0;
      } else p.Doppling = 0;
    }
  }
}
function CheckAngle(a: Float32Array, b: Float32Array): void {
  if (m.dot(a, b) < -0.5) { const c = m.vec(); m.cross(c, a, b); a.set(c); }
}
function NG_AIEnemyPatrol(OVI: OVI): void {
  const data = OVI.data as SGActor, p = data.pInf, nm = OVI.Tk!;
  const di = m.vec();
  m.dif(di, data.Mv.aim, kPos(nm));
  data.Mv.Dist = m.lengthSq(di);
  if (data.Mv.k === -1 || data.Mv.Dist < 8 || OVI.collisionList || !(g_SGGame.Count & 31)) {
    data.Mv.k = 1;
    data.Mv.OldAim.set(kVect(nm));
    NG_AIRandomAim(data.Mv.aim, G.g_SGObjects.defTarget[p.Type === t_FRIEND ? t_ENEMY : t_FRIEND]!, 8178);
    m.dif(data.Mv.NewAim, data.Mv.aim, kPos(nm));
    m.normalize(data.Mv.NewAim, data.Mv.NewAim);
    CheckAngle(data.Mv.NewAim, data.Mv.OldAim);
    const k = p.fSpeedMax / 2;
    p.fSpeed = Math.fround(k + randomf(k));
  }
  NG_AIEnemyGeneric(OVI);
}
function NG_AIEnemyPatrolAndFight(OVI: OVI): void {
  const data = OVI.data as SGActor, p = data.pInf, nm = OVI.Tk!;
  const di = m.vec(), di2 = m.vec();
  let targ: Float32Array | null = null;
  let k = 0, k1 = 0;
  const camp = p.Type;
  const oldTarg = data.OVItarget;
  computeFoeDist(OVI, data, camp, di2);
  if (data.OVItarget && data.OVItarget !== OVI) targ = posOf(data.OVItarget);
  m.dif(di, data.Mv.aim, kPos(nm));
  data.Mv.Dist = m.lengthSq(di);
  if (data.Mv.k <= 0) {
    if (data.Mv.Dist < 8 || oldTarg !== data.OVItarget || (g_SGGame.Count & 127) === 0) {
      if (targ) {
        m.dif(di, targ, kPos(nm));
        k = m.lengthSq(di);
        data.Mv.aim.set(targ);
        p.fSpeed = p.fSpeedMax / 2;
        p.fSpeed = Math.fround(p.fSpeed + randomf(p.fSpeed + 1));
      } else NG_AIRandomAim(data.Mv.aim, G.g_SGObjects.defTarget[camp]!, 3048);
      k1 = 1;
    }
    if ((g_SGGame.Count & 31) === 0 || k1) {
      m.dif(data.Mv.NewAim, data.Mv.aim, kPos(nm));
      m.normalize(data.Mv.NewAim, data.Mv.NewAim);
      data.Mv.k = 1;
      data.Mv.OldAim.set(kVect(nm));
      CheckAngle(data.Mv.NewAim, data.Mv.OldAim);
    }
  }
  if (data.OVItarget && !data.pInf.ShootOk) {
    const kx = m.dot(kVect(nm), di2);
    if (kx > 0.8 && k < 24 * p.Sight) {
      NG_WeaponFire(data, data.pInf.Attack, data.OVItarget);
      OVI.state |= V3XSTATE_MATRIXUPDATE;
    }
  }
  NG_AIEnemyGeneric(OVI);
}
function NG_AIEnemyAttack(OVI: OVI): void {
  const data = OVI.data as SGActor, p = data.pInf;
  const di2 = m.vec();
  const k2 = computeFoeDist(OVI, data, p.Type, di2);
  if (!data.OVItarget) data.OVItarget = G.g_pPlayer.J.OVI;
  if (data.OVItarget && !data.pInf.ShootOk) {
    const kx = m.dot(m.K(meshOf(OVI).matrix), di2);
    if (kx && k2 < 4 * p.Sight && sysRand(2)) {
      NG_WeaponFire(data, data.pInf.Attack, data.OVItarget);
      OVI.state |= V3XSTATE_MATRIXUPDATE;
    }
  }
  if (p.Tactic === t_TAC_ATTACK1) {
    const nm = OVI.Tk!;
    if (data.Mv.k <= 0) {
      data.Mv.aim.set(posOf(data.OVItarget!));
      m.dif(data.Mv.NewAim, data.Mv.aim, kPos(nm));
      m.normalize(data.Mv.NewAim, data.Mv.NewAim);
      data.Mv.k = 1;
      data.Mv.OldAim.set(kVect(nm));
    }
    NG_AIEnemyGeneric(OVI);
  }
}
function NG_AIEnemyKamikaze(OVI: OVI): void {
  const data = OVI.data as SGActor, p = data.pInf, nm = OVI.Tk!;
  const di = m.vec(), di2 = m.vec();
  const k2 = computeFoeDist(OVI, data, p.Type, di2);
  const targ = posOf(data.OVItarget!);
  m.dif(di, data.Mv.aim, kPos(nm));
  const k = m.normalize(di, di);
  if (k < 64 && data.Mv.k <= 0) {
    data.Mv.k = 1;
    data.Mv.OldAim.set(data.Mv.aim);
    m.normalize(data.Mv.NewAim, targ);
    data.Mv.aim.set(data.Mv.NewAim);
    p.fSpeed = p.fSpeedMax / 2;
    p.fSpeed = Math.fround(p.fSpeed + randomf(p.fSpeed + 1));
  }
  if (k2 < 32 && p.Shield > 0) p.Shield = -1;
  NG_AIEnemyGeneric(OVI);
}
function NG_AIEnemyMine(OVI: OVI): void {
  const data = OVI.data as SGActor, p = data.pInf;
  const di2 = m.vec();
  const kk = G.g_SGObjects.CallMode[t_ENEMY];
  G.g_SGObjects.CallMode[t_ENEMY] = ORDER_Attack;
  const r = NG_AILocateNearestEnemy(posOf(OVI), di2, p.Type);
  data.OVItarget = r.OVI;
  if (data.OVItarget && r.di < p.Sight && p.Shield > 0) p.Shield = -1;
  G.g_SGObjects.CallMode[t_ENEMY] = kk;
}

const LASTDISTTRCK = 4, MINDISTTRCK = 4000, MAXDISTTRCK = 4000;
/** NG_AIEnemyTrack: follows the key positions of its track */
function NG_AIEnemyTrack(OVI: OVI): void {
  const data = OVI.data as SGActor, TVI = OVI.TVI!, TRI = TVI.TRI!, p = data.pInf, nm = OVI.Tk!;
  let op = 0;
  let lsttrck = TVI.frame === TRI.numFrames - 1;
  m.dif(data.Mv.NewAim, data.Mv.aim, kPos(nm));
  const k = m.length(data.Mv.NewAim);
  if (k < m.CST_EPSILON) data.Mv.NewAim.set(kVect(nm));
  m.normalize(data.Mv.NewAim, data.Mv.NewAim);
  if (p.AnimMode & m_OFF) p.fSpeed = 0;
  else if (data.Mv.k <= 0) {
    if (k >= MAXDISTTRCK) kVect(nm).set(data.Mv.NewAim);
    nm[6] = Math.fround(nm[6] + (g_cTimer.iCounter >> 15));
    data.Mv.Dist = k;
    if (k <= (lsttrck ? LASTDISTTRCK : MINDISTTRCK)) {
      if (!(p.AnimMode & m_REVERSE)) {
        TVI.frame += 1;
        op = 2;
        if (TVI.frame >= TRI.numFrames) {
          op = 1;
          if (p.AnimMode & m_LOOP) TVI.frame = 0;
          else { p.AnimMode |= m_OFF; TVI.frame = TRI.numFrames - 1; }
          if (p.AnimMode & m_PINGPONG) p.AnimMode |= m_REVERSE;
          if (p.EndTrack === t_ET_WARP) p.Wait = 16;
        }
      } else {
        TVI.frame--;
        op = 2;
        if (TVI.frame <= 0) {
          op = 1;
          if (p.AnimMode & m_LOOP) TVI.frame = TRI.numFrames - 1;
          else { p.AnimMode |= m_OFF; TVI.frame = 0; }
          if (p.AnimMode & m_PINGPONG) p.AnimMode |= m_REVERSE;
        }
      }
      if (op === 1) {
        if (p.AfterTrack === t_AD_ADD_AIM) {
          conPrint('Escort completed ...');
          g_SGGame.MaxAim[G.g_SGObjects.NAV] -= p.Mission;
          G.g_pPlayer.Notify += SGNET_UPDATEAIM;
          g_SGSettings.ComNumber = COM_EscortOk; g_SGSettings.ComTime = MAX_COM_DELAY;
          NG_DisplayWarp();
          p.AnimMode |= m_OFF;
        }
        if (p.AfterTrack === t_AD_EXPLODE) { if (p.Shield >= 0) p.Shield = -1; p.AnimMode |= m_OFF; }
        if (p.AfterTrack === t_AD_FAILED) {
          g_SGSettings.ComNumber = COM_Failed; g_SGSettings.ComTime = MAX_COM_DELAY;
          G.g_SGObjects.FinCode = GAMESTATE_FAIL;
          p.AnimMode |= m_OFF;
        }
      }
    }
    p.fSpeed = p.fSpeedMax;
  } else lsttrck = true;
  if (lsttrck) p.fSpeed = p.fSpeedMax > 4 ? Math.fround(p.fSpeedMax / 4) : 1;
  if (op) {
    p.fSpeed = p.fSpeedMax;
    data.Mv.k = 1;
    data.Mv.OldAim.set(kVect(nm));
    data.Mv.aim.set(kPos(TRI.keys[Math.trunc(TVI.frame)]));
  } else NG_AIEnemyGeneric(OVI);
}

function NG_CheckHindMode(): void {
  const A = G.g_cAI;
  switch (A.mode) {
    case HIND_MODE_PHASE_0: A.Target = G.g_pPlayer.J.OVI; A.mode = HIND_MODE_PHASE_1; break;
    case HIND_MODE_PHASE_1:
      if (A.nHind) {
        let j = 0;
        for (let i = 0; i < A.nHind; i++) if ((A.OVI[i].data as SGActor).Mv.Reg) j++;
        if (j === A.nHind) { A.mode = HIND_MODE_PHASE_2; A.fTime = 1000; }
      }
      break;
    case HIND_MODE_PHASE_2:
      A.fTime = Math.fround(A.fTime - g_cTimer.fCounter);
      if (A.fTime < 0) A.mode = HIND_MODE_PHASE_0;
      break;
  }
}
function NG_RegisterGroupTactic(): void {
  const A = G.g_cAI;
  A.nHind = 0;
  for (const OVI of g_SGGame.Scene!.OVI) {
    if (OVI.ORI?.type !== V3XOBJ_MESH || OVI.state & V3XSTATE_HIDDEN) continue;
    const J = OVI.data as SGActor | null;
    if (J && J.pInf.Tactic === t_TAC_HIND && A.nHind < HIND_MAXPLAYER && A.mode === HIND_MODE_PHASE_1) {
      A.OVI[A.nHind] = OVI;
      J.Mv.Id = A.nHind;
      A.nHind++;
    }
  }
  NG_CheckHindMode();
}
function NG_AIEnemyHind(OVI: OVI): void {
  const A = G.g_cAI;
  const data = OVI.data as SGActor;
  if (!A.nHind || !A.Target) return;
  const targ = kPos(A.Target.Tk!);
  const nm = OVI.Tk!, p = data.pInf;
  data.OVItarget = A.Target;
  if (A.mode === HIND_MODE_PHASE_1 || A.mode === HIND_MODE_PHASE_2) {
    if (A.mode === HIND_MODE_PHASE_1) {
      if (!data.Mv.Reg || !(g_SGGame.Count & 255)) {
        data.Mv.Ang = ((Math.trunc((data.Mv.Id * 4096) / A.nHind) << 16) >> 16);
        NG_AIRandomAimEx(data.Mv.aim, targ, p.Sight * 4, data.Mv.Ang, data.Mv.Ang);
        const di = m.vec();
        m.dif(di, data.Mv.aim, kPos(nm));
        data.Mv.Dist = m.length(di);
        data.Mv.Reg = 0;
      }
      if (data.Mv.Dist < 384) { data.Mv.aim.set(targ); data.Mv.Reg = 1; p.fSpeed = 0; }
      else p.fSpeed = p.fSpeedMax;
    }
    if (A.mode === HIND_MODE_PHASE_2) p.fSpeed = p.fSpeedMax;
    if (!data.pInf.ShootOk && data.Mv.Reg) { NG_WeaponFire(data, data.pInf.Attack, data.OVItarget); OVI.state |= V3XSTATE_MATRIXUPDATE; }
    if (data.Mv.k <= 0) {
      m.dif(data.Mv.NewAim, data.Mv.aim, kPos(nm));
      m.normalize(data.Mv.NewAim, data.Mv.NewAim);
      data.Mv.k = 1;
      data.Mv.OldAim.set(kVect(nm));
    }
  }
  NG_AIEnemyGeneric(OVI);
}

// ---------------------------------------------------------------- dynamic lights
/** V3XLIGHT_AddOmni (V3X.Buffer.MaxLight = 16) */
function addOmni(pos: Float32Array, intensity: number, color: number[], type: number, flags: number): void {
  if (V3X.Light.lights.length >= 16 - 1) return;
  V3X.Light.lights.push({
    pos: Float32Array.from(pos), target: m.vec(), intensity: intensity > 1 ? intensity : 1, diminish: 1, range: 20000, falloff: 0,
    color: [color[0], color[1], color[2], 0], material: null, flaresize: 0, Tk: new Float32Array(7), type, flags: flags | 4,
    alpha: 0, status: 0, Timer: 0, TimeOn: 0, TimeOff: 0, matrix: m.mtx(),
  } as Light);
}
const ColorWeap = [[0, 0, 0], [128, 0, 0], [0, 128, 0], [200, 200, 100], [128, 128, 128], [0, 0, 200], [180, 180, 180], [0, 0, 0], [0, 0, 0], [0, 0, 0],
  [0, 128, 0], [128, 0, 0], [128, 128, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [0, 0, 0], [128, 128, 0], [180, 180, 180]];
/** NG_AddMoreLights: the shots and the explosions light the scene */
export function NG_AddMoreLights(): void {
  for (let i = 0; i < g_SGGame.numWeapons; i++) {
    const w = g_SGGame.pWea[i];
    if (w.Available && w.pInf.Code < 22) addOmni(posOf(w.OVI), 150, ColorWeap[w.pInf.Code], 2, 8);
  }
  for (const p of g_SGGame.pExpl) {
    if (p.visible && !p.Dispo && p.Light) {
      const pas = g_cTimer.iCounter >> 15;
      const flags = g_SGSettings.VisualsFx < 3 ? 8 : 1 | 8;
      addOmni(p.pos, p.Light, [255, 255, 200], 2, flags);
      if (p.Light > pas) p.Light -= pas; else p.Light = 0;
    }
  }
}

// ---------------------------------------------------------------- target lock
export function NG_HudLockTargetOff(): void {
  if (G.g_pLockTarget) sif(G.g_pLockTarget).Locked = 0;
  G.g_pLockTarget = null;
  NG_AISetTacticMode();
}
export function NG_HudLockTargetReset(): void {
  if (G.g_pLockTarget) sif(G.g_pLockTarget).LockTime = 0;
  NG_AISetTacticMode();
}
let LockCycle = 0;
function NG_HudCycleTarget(): OVI | null {
  const list = g_SGGame.Scene!.OVI;
  let Gs: OVI | null = null;
  if (LockCycle >= list.length) LockCycle = 0;
  const x = LockCycle;
  do {
    const OVI = list[LockCycle];
    if (OVI.data && (OVI.state & (V3XSTATE_HIDDEN | V3XSTATE_CULLED)) === 0 && sif(OVI).ColorRadar) {
      const dir = m.vec();
      m.dif(dir, posOf(OVI), kPos(G.g_pPlayer.Rot));
      if (m.dot(dir, m.K(V3X.Camera.M)) < 0) Gs = OVI;
    }
    LockCycle++;
    if (LockCycle >= list.length) LockCycle = 0;
  } while (!(x === LockCycle || Gs !== null));
  return Gs;
}
export function NG_HudLockTargetOn(): void {
  const Gs = NG_HudCycleTarget();
  if (Gs) { sif(Gs).Locked = 1; NG_HudLockTargetOff(); G.g_pLockTarget = Gs; }
  else NG_HudLockTargetOff();
  NG_AISetTacticMode();
}

function LookEventCode(code: number): number {
  let c = 1;
  for (const OVI of g_SGGame.Scene!.OVI) {
    if (c === 0) break;
    if (OVI.ORI?.type !== V3XOBJ_MESH || OVI.state & V3XSTATE_HIDDEN) continue;
    const J = OVI.data as SGActor | null;
    if (!J) continue;
    const pInf = J.pInf;
    if (pInf.Event === code && pInf.EventCode === t_EC_ENABLE) {
      if (pInf.EventType === t_ET_SHOOT) { if (!OVI.collisionList) c = 0; }
      else if (pInf.EventType === t_ET_DESTROY) c = 0;
    }
  }
  return c;
}

/** NG_LevelUpdate: everything of the level that moves, appears, dies or scores this frame */
export function NG_LevelUpdate(): void {
  const O = G.g_SGObjects, P = G.g_pPlayer;
  let As_wet = 1;
  if (g_SGGame.Count && !(g_SGGame.Count & 511)) {
    O.CallMode[t_ENEMY]++;
    if (O.CallMode[t_ENEMY] > ORDER_TargetStrongest) O.CallMode[t_ENEMY] = ORDER_AttackTarget;
  }
  NG_RegisterGroupTactic();
  NG_CheckHindMode();
  let pInf: SGScript | null = null;
  const list = g_SGGame.Scene!.OVI;
  for (let ii = 0; ii < list.length; ii++) {
    const OVI = list[ii];
    const i = list.length - ii; // the original counts i down from numOVI
    const ORI = OVI.ORI;
    if (!ORI) continue;
    if (ORI.type === V3XOBJ_LIGHT) {
      const l = OVI.node as Light;
      OVI.state |= V3XSTATE_MATRIXUPDATE;
      l.intensity = 255; l.type = 4; l.flags |= 0x20 | 1; l.color = [255, 255, 255, l.color[3]];
      continue;
    }
    if (ORI.type !== V3XOBJ_MESH) continue;
    const c = Math.min(1, g_cTimer.iCounter >> 16);
    const pos = posOf(OVI);
    const mesh = meshOf(OVI);
    if (mesh.selfIllumine > c) mesh.selfIllumine -= c; else mesh.selfIllumine = 0;
    const J = OVI.data as SGActor | null;
    if (J) {
      pInf = J.pInf;
      if (pInf.Type !== t_ACCESSOIRE) updateObject(OVI, J, pInf, pos, i, () => { As_wet = 0; }, () => As_wet);
    }
    if (pInf) {
      if (OVI.state & V3XSTATE_HIDDEN || OVI.state & V3XSTATE_HIDDENDISPLAY || OVI === O.Shield) pInf.ModeX &= ~1;
      else pInf.ModeX |= 1;
    }
  }
  P.J.pInf.ModeX = 0;
}

function updateObject(OVI: OVI, J: SGActor, pInf: SGScript, pos: Float32Array, i: number, setAs: () => void, getAs: () => number): void {
  const O = G.g_SGObjects, P = G.g_pPlayer;
  if (pInf.Wait > 0 && (pInf.ColorNav === O.NAV || pInf.Type === t_SPECIAL)) {
    pInf.Wait -= g_cTimer.iCounter >> 16;
    if (pInf.Wait <= 0) {
      pInf.Wait = 0;
      if (!pInf.Stealth) pInf.Shield = pInf.ShieldMax;
      if (pInf.AppearMode) NG_FXNew(pos, FX_WARPIN, 1, pInf, 2, OVI);
      else OVI.state ^= V3XSTATE_HIDDENDISPLAY;
      if (pInf.Stealth) { OVI.state &= ~V3XSTATE_HIDDENDISPLAY; pInf.Wait = pInf.Appear; }
      if (pInf.CollisionStyle === 72 && g_SGSettings.SerialGame) pInf.Wait = 500;
    }
  }
  if (pInf.Appear > 0 && !pInf.Stealth && pInf.ColorNav === O.NAV) {
    const dist = m.vec();
    const r = NG_AILocateNearestEnemy(pos, dist, t_FRIEND);
    if (r.OVI !== OVI && r.OVI !== null && r.di < pInf.Appear) {
      pInf.Appear = 0;
      NG_FXNew(pos, FX_WARPIN, 1, pInf, 2, OVI);
    }
  }
  switch (pInf.EventCode) {
    case t_EC_SHIELDOFF: if (!LookEventCode(pInf.Event)) pInf.Shield = pInf.ShieldMax; break;
    case t_EC_SHIELDOFFDIE: if (!LookEventCode(pInf.Event)) pInf.Shield = pInf.ShieldMax; else pInf.Shield = 0; break;
    case t_EC_APPEAR: if (LookEventCode(pInf.Event)) NG_FXNew(pos, FX_WARPIN, 1, pInf, 2, OVI); break;
    case t_EC_TRACK_TOGGLE:
      if (LookEventCode(pInf.Event)) {
        if (OVI.state & V3XSTATE_HIDDEN) NG_FXNew(pos, FX_WARPIN, 1, pInf, 2, OVI);
        pInf.AnimMode ^= m_OFF;
      }
      break;
  }
  if (!(OVI.state & V3XSTATE_HIDDEN)) {
    const OVIp = OVI.parent;
    if (OVIp) {
      const Jp = OVIp.data as SGActor | null;
      if (Jp) {
        const PIp = Jp.pInf;
        if (OVIp.state & V3XSTATE_HIDDEN) { if (PIp.Shield <= 0) pInf.Shield = 0; }
        else if (PIp.Shield > 0) OVI.state &= ~V3XSTATE_HIDDEN;
      }
    }
  }
  if (OVI.state & V3XSTATE_HIDDEN) return;
  if (pInf.AmbiantSound && getAs() && !(OVI.state & V3XSTATE_CULLEDOFR)) {
    if (pInf.AmbiantChannel <= 0) pInf.AmbiantChannel = NG_Audio3DPlay(pInf.AmbiantSound - 1, pos, null);
    else if (!NG_Audio3DUpdate(pos, null, pInf.AmbiantChannel, pInf.AmbiantSound - 1)) pInf.AmbiantChannel = 0;
    setAs();
  }
  if (pInf.ShootOk > 0) pInf.ShootOk -= g_cTimer.iCounter >> 16; else pInf.ShootOk = 0;
  if (pInf.AfterDeath) {
    pInf.AfterDeath -= g_cTimer.iCounter >> 16;
    pInf.fFrozen = 1;
    pInf.Shield = 0;
    if (pInf.AfterDeath <= 0) afterDeath(OVI, pInf, pos);
  }
  if (pInf.Shield <= 0) {
    if (O.FinCode !== GAMESTATE_DEAD && OVI === P.J.OVI) {
      J.pInf.AfterDeath = 168;
      J.pInf.fSpeed = 0;
      P.Mv.inert = 0;
      NG_HudLockTargetOff();
      O.FinCode = GAMESTATE_DEAD;
      g_SGGame.CameraMode = CAMERA_DEATH;
      P.J.pInf.Shield = 0;
      g_SGSettings.ComNumber = COM_Failed; g_SGSettings.ComTime = MAX_COM_DELAY;
      NG_AudioStopSound(G.g_cFXTable.Engine);
      NG_AudioStopSound(G.g_cFXTable.Alarm);
      if (g_SGSettings.DemoMode) O.FinCode = GAMESTATE_ABORT;
      P.Notify += SGNET_HASDIE;
    }
    if (!pInf.AfterDeath) {
      pInf.Shield = 0;
      pInf.fFrozen = 1;
      if (pInf.Type === t_FRIEND) { g_SGSettings.ComNumber = COM_FriendDead; g_SGSettings.ComTime = MAX_COM_DELAY; }
      if (pInf.BigExplode) { NG_FXBlast(pInf, OVI); pInf.AfterDeath = 168; }
      else pInf.AfterDeath = 1;
      g_SGGame.FlashColor = [200, 160, 40];
      g_SGGame.FlashAlpha = 16;
    }
  } else if (pInf.SoundExplode && pInf.Shield < Math.trunc(pInf.ShieldMax / 4) && (g_SGGame.Count & 1024) === 0 &&
    (OVI !== P.J.OVI || g_SGGame.CameraMode)) {
    NG_FXNew(posOf(OVI), FX_SMOKE, 1, J.pInf, 1, OVI);
  }
  if (!pInf.fFrozen) {
    const Tk = OVI.Tk!;
    const turn = Math.fround(pInf.fSpeedMax * g_cTimer.fCounter);
    switch (pInf.Animation) {
      case t_FIXE: if (OVI.parent) OVI.state |= V3XSTATE_MATRIXUPDATE; break;
      case t_GIANT: OVI.state |= V3XSTATE_MATRIXUPDATE; break;
      case t_TURN_AROUND_X: Tk[0] += turn; OVI.state |= V3XSTATE_MATRIXUPDATE; break;
      case t_TURN_AROUND_Y: Tk[1] += turn; OVI.state |= V3XSTATE_MATRIXUPDATE; break;
      case t_TURN_AROUND_Z: Tk[2] += turn; OVI.state |= V3XSTATE_MATRIXUPDATE; break;
      case t_TURN_RANDOM:
        if (i & 1) Tk[0] += turn; else Tk[1] += turn;
        Tk[2] += turn;
        OVI.state |= V3XSTATE_MATRIXUPDATE;
        break;
      case t_MPLAYER: OVI.state |= V3XSTATE_MATRIXUPDATE; break;
    }
    if (!g_SGGame.IsHost || (g_SGSettings.DemoMode >= 2 && G.rec.version === 3)) OVI.state |= V3XSTATE_MATRIXUPDATE;
    else {
      P.Notify |= SGNET_SHIP;
      switch (pInf.Tactic) {
        case t_TAC_DROID: NG_AIEnemyKamikaze(OVI); OVI.state |= V3XSTATE_MATRIXUPDATE; break;
        case t_TAC_MINE: NG_AIEnemyMine(OVI); OVI.state |= V3XSTATE_MATRIXUPDATE; break;
        case t_TAC_ATTACK1: OVI.state |= V3XSTATE_MATRIXUPDATE; NG_AIEnemyAttack(OVI); break;
        case t_TAC_ATTACK0: NG_AIEnemyAttack(OVI); break;
        case t_TAC_RANDOM_PATROL: NG_AIEnemyPatrol(OVI); OVI.state |= V3XSTATE_MATRIXUPDATE; break;
        case t_TAC_PATROL_FIGHT1: NG_AIEnemyPatrolAndFight(OVI); OVI.state |= V3XSTATE_MATRIXUPDATE; break;
        case t_TAC_TRACKFULL: OVI.state |= V3XSTATE_MATRIXUPDATE; break;
        case t_TAC_TRACK: NG_AIEnemyTrack(OVI); OVI.state |= V3XSTATE_MATRIXUPDATE; break;
        case t_TAC_HIND: NG_AIEnemyHind(OVI); OVI.state |= V3XSTATE_MATRIXUPDATE; break;
      }
    }
  } else {
    pInf.fFrozen = Math.fround(pInf.fFrozen - g_cTimer.fCounter);
    if (pInf.fFrozen < 0) pInf.fFrozen = 0;
  }
}

function afterDeath(OVI: OVI, pInf: SGScript, pos: Float32Array): void {
  const O = G.g_SGObjects, P = G.g_pPlayer;
  pInf.Stealth = 0; pInf.Wait = 0; pInf.Appear = 0;
  switch (pInf.AfterDestroy) {
    case t_AD_ADD_AIM:
      conPrint('Completed an objective ..');
      g_SGGame.MaxAim[O.NAV] -= pInf.Mission;
      if (g_SGGame.MaxAim[O.NAV] <= 0) { g_SGGame.WarpOk = 0; g_SGGame.MaxAim[O.NAV] = 0; }
      if (g_SGGame.IsHost) P.Notify += SGNET_UPDATEAIM;
      NG_DisplayWarp();
      break;
    case t_AD_FAILED:
      conPrint('Objective failed');
      g_SGGame.MaxProtect[O.NAV] -= pInf.Protect;
      if (g_SGGame.MaxProtect[O.NAV] === 0) { g_SGSettings.ComNumber = COM_Failed; g_SGSettings.ComTime = MAX_COM_DELAY; O.FinCode = GAMESTATE_FAIL; }
      break;
    case t_AD_SUCCESS:
      conPrint('Objective success');
      O.FinCode = GAMESTATE_WON;
      break;
  }
  const EI = NG_FXNew(pos, FX_CUSTOM, 1, pInf, 1, OVI);
  if (EI) { EI.Size = OVI.ORI!.global_rayon * 4; g_SGGame.FlashColor = [255, 255, 0]; g_SGGame.FlashAlpha = 16; }
  if (pInf.DebrisMode) NG_FXDebris(pInf, OVI);
  OVI.state |= V3XSTATE_HIDDEN;
  if (g_SGSettings.Difficulty === 2 && (pInf.Type === t_ENEMY || pInf.Type === t_PIRAT)) {
    pInf.Wait = 1000; pInf.Mission = 0; pInf.Shield = pInf.ShieldMax; pInf.ColorRadar = 7;
  }
  pInf.AfterDeath = 0;
  if (pInf.Replace) {
    const g = OVI.ORI!.name.indexOf('_');
    if (g >= 0) {
      const OVIp = oviByName(g_SGGame.Scene!, G.g_pPlayerInfo[pInf.Replace].Basename + OVI.ORI!.name.slice(g));
      if (OVIp) { OVIp.state &= ~V3XSTATE_HIDDEN; OVIp.Tk!.set(OVI.Tk!); pInf.Replace = 0; }
    }
  }
}
export { csp };
