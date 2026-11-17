// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the shots (src/lt_weap.c). Every shot is an object of
// the scene ("Laser2_#", "missil2_#", ...) of type t_ACCESSOIRE whose Code says which weapon fires it.
import * as m from '../v3x/math.ts';
import { meshOf } from '../v3x/scene.ts';
import { type OVI, kPos, V3XMATRIX_Custom, V3XSTATE_HIDDEN, V3XSTATE_CULLNEVER, V3XSTATE_MATRIXUPDATE } from '../v3x/vmx.ts';
import { g_cTimer, sysRand } from '../sys/sys.ts';
import { NG_Audio3DPlay, NG_Audio3DUpdate, NG_AudioSay } from './sound.ts';
import { NG_FXNew, NG_FXImpact } from './fx.ts';
import { NG_HudLockTargetOff } from './ai.ts';
import {
  G, g_SGGame, g_SGSettings, type SGActor, type SGScript, t_PLAYER, t_ACCESSOIRE, t_SPECIAL, t_FRIEND, t_ENEMY, t_PIRAT, t_OBSTACLE,
  t_DECOR, FX_IMPACT, FX_SMOKE2, FX_FINISH, GODMODE, DOOMEDMODE, SGNET_SHIELDCHANGE, GAMESTATE_DEAD, COM_ShipAttacked, COM_HelpMe,
  MAX_COM_DELAY,
} from './state.ts';

/** NG_WeaponCreate */
export function NG_WeaponCreate(): void {
  for (let i = 0; i < g_SGGame.numWeapons; i++) {
    const W = g_SGGame.pWea[i];
    W.OVI.matrix_Method = V3XMATRIX_Custom;
    W.OVI.state |= V3XSTATE_HIDDEN;
    W.Available = 0;
  }
}
const col = (M: Float32Array, c: number): Float32Array => m.vec(M[c], M[c + 3], M[c + 6]);

/** NG_WeaponFire: a free shot of the weapon type; true when fired */
export function NG_WeaponFire(Jj: SGActor, type: number, target: OVI | null): boolean {
  const objAttacker = meshOf(Jj.OVI!);
  let f = 0;
  if (Jj.pInf.ShootOk) return false;
  for (let i = 0; i < g_SGGame.numWeapons && f === 0; i++) {
    const W = g_SGGame.pWea[i];
    if (W.Available || type !== W.pInf.Code || W.fTime !== 0) continue;
    const OVI = W.OVI;
    W.Camera = W.pInf.Code === 6 || W.pInf.Code === 4 ? 1 : 0;
    if (W.Camera && !target) return false;
    if (target) { W.TargetLock = target; W.Target.set(kPos(target.Tk!)); }
    else W.TargetLock = null;
    if (W.pInf.Code === 10 || W.pInf.Code === 21 || W.pInf.Code === 20) W.Camera = 2;
    W.Available = 1;
    if (Jj.pInf.Type === t_PLAYER && W.Camera === 1 && (G.g_pLockTarget!.data as SGActor).pInf.LockTime < g_SGGame.LockMAX) {
      W.Available = 0;
      f = 2;
    }
    if (!W.Available) continue;
    if (W.Camera === 1 && Jj.pInf.Type === t_PLAYER) g_SGGame.Missile = OVI;
    OVI.state |= V3XSTATE_CULLNEVER;
    OVI.state &= ~V3XSTATE_HIDDEN;
    OVI.collisionList = null;
    OVI.state |= V3XSTATE_MATRIXUPDATE;
    W.Attacker = Jj;
    W.Freeze = 0;
    W.pInf.Shield = W.pInf.ShieldMax;
    switch (W.pInf.Code) {
      case 1: W.fTime = 150; Jj.pInf.ShootOk = 15; break;
      case 4: case 6: W.fTime = 1000; Jj.pInf.ShootOk = 50; break;
      case 10: W.fTime = 150; Jj.pInf.ShootOk = 15; break;
      case 5: W.Freeze = 1; W.fTime = 200; Jj.pInf.ShootOk = 30; break;
      default: W.fTime = 200; Jj.pInf.ShootOk = 30; break;
    }
    objAttacker.selfIllumine = 128;
    let k = W.pInf.fSpeedMax;
    meshOf(OVI).matrix.set(objAttacker.matrix);
    let a = m.vec();
    switch (Jj.pInf.ShootAxe & 127) {
      case 4: k = -k; a = col(objAttacker.matrix, 2); break;
      case 0: a = col(objAttacker.matrix, 2); break;
      case 1: a = col(objAttacker.matrix, 1); break;
      case 2: a = col(objAttacker.matrix, 0); break;
      case 3: {
        m.dif(a, m.Pos((Jj.OVI!.ORI!.node as { matrix: Float32Array }).matrix), m.Pos(objAttacker.matrix));
        m.normalize(a, a);
        const M0 = m.mtx();
        m.buildFromNVector(M0, a, 0);
        m.transpose(meshOf(OVI).matrix, M0);
        break;
      }
    }
    G.g_mtxMissile.set(meshOf(OVI).matrix);
    m.scl(W.vel, a, k);
    let ky = -Math.fround((Jj.OVI!.ORI!.global_rayon + 8) * (1 << W.Camera));
    if (Jj !== G.g_pPlayer.J) ky = -ky;
    m.madd(kPos(OVI.Tk!), a, m.Pos(objAttacker.matrix), ky);
    Jj.pInf.ShootAxe |= 128;
    W.TagFX = NG_Audio3DPlay(W.pInf.StartSound - 1, m.Pos(objAttacker.matrix), W.vel);
    f = 1;
  }
  return f === 1;
}

function sayRandom(n: number, base: number): void {
  const tex = `mes0${sysRand(n) + base}`;
  if (sysRand(2)) NG_AudioSay(tex);
}

/** NG_WeaponUpdate: moves the shots, the missiles towards their target, and the hits */
export function NG_WeaponUpdate(): void {
  for (let j = 0; j < g_SGGame.numWeapons; j++) {
    const W = g_SGGame.pWea[j];
    if (W.fTime > 0) W.fTime = Math.fround(W.fTime - g_cTimer.fCounter); else W.fTime = 0;
    if (!W.Available) { W.OVI.state |= V3XSTATE_HIDDEN; continue; }
    const Shooter = W.Attacker!.OVI!;
    const J_Sh = Shooter.data as SGActor;
    const p_Sh = J_Sh.pInf;
    const Tir = meshOf(W.OVI);
    const po = Float32Array.from(kPos(Tir.Tk));
    const Mat = Tir.matrix;
    if (W.fTime <= 0) {
      W.Available = 0;
      if (W.Camera) NG_FXNew(po, FX_IMPACT, 1, W.pInf, 1, W.OVI);
    } else {
      let sp = Math.fround(g_cTimer.fCounter * 2);
      W.OVI.state |= V3XSTATE_MATRIXUPDATE;
      let OVI = W.OVI.collisionList;
      if (W.TargetLock && W.TargetLock.state & V3XSTATE_HIDDEN && W.Camera) W.fTime = 4;
      if (W.Camera) {
        const d = m.vec();
        m.dif(d, m.Pos(Tir.matrix), m.Pos(meshOf(W.TargetLock!).matrix));
        const LockDist = m.normalize(d, d);
        if (LockDist < 64) {
          OVI = W.TargetLock;
          g_SGSettings.CamDisp = 0;
          NG_HudLockTargetOff();
        }
        if (W.fTime > 1000) { NG_FXNew(po, FX_SMOKE2, 1, W.pInf, 1, W.OVI); W.fTime = 0; }
        W.vel.set(d);
        switch (W.Camera) {
          case 2: W.Camera = 0; m.neg(W.vel); // fallthrough
          // eslint-disable-next-line no-fallthrough
          case 1: {
            const M0 = m.mtx();
            m.buildFromVector(M0, W.vel, 0);
            m.transpose(Mat, M0);
            if (p_Sh.Type === t_PLAYER && !OVI && W.Camera) {
              if (g_SGGame.Missile === W.OVI) {
                m.transpose(G.g_mtxMissile, Mat);
                m.Pos(G.g_mtxMissile).set(m.Pos(Mat));
              }
              sp *= -W.pInf.fSpeedMax;
            } else if (!W.Camera) m.scl(W.vel, W.vel, W.pInf.fSpeedMax);
            break;
          }
        }
      }
      m.madd(po, W.vel, po, sp);
      if (W.TagFX >= 0 && !NG_Audio3DUpdate(po, W.vel, W.TagFX, W.pInf.StartSound - 1)) W.TagFX = -1;
      m.Pos(Mat).set(po);
      kPos(Tir.Tk).set(po);
      m.rotateZLocal(Math.trunc(W.fTime / (10 + W.Camera)), Mat);
      if (OVI) {
        const Parent = Shooter.parent;
        if (OVI !== Parent && OVI !== Shooter) {
          const J = OVI.data as SGActor | null;
          W.OVI.collisionList = null;
          if (J !== W.Attacker && J) {
            const p = J.pInf;
            if (p.Type !== t_ACCESSOIRE) {
              W.Available = 0;
              W.OVI.state |= V3XSTATE_HIDDEN;
              if (W.Freeze) {
                p.fFrozen = 255;
                NG_FXNew(po, FX_IMPACT, 1, W.pInf, 1, W.OVI);
              } else hit(W, J, p, OVI, Shooter, p_Sh, po);
            }
          }
        }
      }
    }
    if (!W.Available && W.OVI === g_SGGame.Missile) { g_SGGame.Missile = null; NG_HudLockTargetOff(); }
  }
}

function hit(W: (typeof g_SGGame.pWea)[number], J: SGActor, p: SGScript, OVI: OVI, Shooter: OVI, p_Sh: SGScript, po: Float32Array): void {
  const P = G.g_pPlayer;
  switch (p.Type) {
    case t_PLAYER:
      if (!(P.mode & GODMODE)) {
        NG_FXImpact(4);
        p.Shield -= W.pInf.Shield;
        P.Notify += SGNET_SHIELDCHANGE;
        NG_FXNew(po, FX_IMPACT, 1, W.pInf, 1, W.OVI);
        if (OVI === P.J.OVI) {
          g_SGGame.FlashColor = [255, 255, 255];
          g_SGGame.FlashAlpha = 8;
          if (G.g_SGObjects.FinCode !== GAMESTATE_DEAD) { g_SGSettings.ComNumber = COM_ShipAttacked; g_SGSettings.ComTime = MAX_COM_DELAY; }
        } else { g_SGSettings.ComNumber = COM_HelpMe; g_SGSettings.ComTime = MAX_COM_DELAY; }
      }
      break;
    case t_SPECIAL:
      p.Shield = p.ShieldMax;
      break;
    case t_FRIEND: case t_ENEMY: case t_PIRAT: case t_OBSTACLE: case t_DECOR:
      if (p.Type === t_FRIEND) { g_SGSettings.ComNumber = COM_HelpMe; g_SGSettings.ComTime = MAX_COM_DELAY; }
      if (p.Shield < 0) break;
      if (Shooter === P.J.OVI) {
        if (p.Type === t_ENEMY || p.Type === t_PIRAT) G.g_cGameStat.hitted++;
        if (G.g_pCurrentGame.ship === 1 && p.ColorRadar) {
          if (!p.Locked) { p.Locked = 1; NG_HudLockTargetOff(); G.g_pLockTarget = OVI; }
          if (g_SGSettings.SerialGame && p.ColorRadar === 255) G.g_cGameStat.frag += 1;
        }
      }
      if (p_Sh.Type === t_ENEMY && p.Type === t_ENEMY) break;
      p.Shield -= W.pInf.Shield;
      if (p.Shield > p.ShieldMax) p.Shield = 0;
      meshOf(OVI).selfIllumine = 32;
      if (p.Shield >= 0) {
        NG_FXNew(po, FX_IMPACT, 1, W.pInf, 1, W.OVI);
        if (p.Shield > 0 && p.Shield <= Math.trunc(p.ShieldMax / 2) && p.FinisHim && !J.pEffect) {
          J.pEffect = NG_FXNew(m.Pos(meshOf(OVI).matrix), FX_FINISH, -1, J.pInf, 0, OVI);
        }
      } else {
        if (p.Type === t_FRIEND) G.g_cGameStat.killed_amy++;
        W.Attacker!.pInf.Scoring += p.Scoring;
        if (W.Camera) NG_HudLockTargetOff();
        if (Shooter === P.J.OVI) {
          if (p.Type === t_FRIEND) {
            P.mode |= DOOMEDMODE;
            if (sysRand(2)) NG_AudioSay('mes01');
          } else if (p.Type === t_ENEMY) {
            G.g_cGameStat.killed_nmy++;
            const tex = `mes0${sysRand(4) + 5}`;
            if (sysRand(2) && p.Scoring >= 100) NG_AudioSay(tex);
          }
        } else if (p_Sh.Type === t_FRIEND) sayRandom(2, 6);
        else if (p_Sh.Type === t_ENEMY) sayRandom(4, 1);
      }
      break;
    default: break;
  }
}
