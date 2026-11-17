// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the game loop of a mission (src/lt_game.c): the
// controls, the flight of the ship, the cameras, power-ups, communications, the HUD, the radar, the
// target boxes, the starfield, the pause menu; and the small 3D views of the HUD (src/lt_st2.c).
import * as m from '../v3x/math.ts';
import { V3X, View, meshOf, transformProject, viewportBuild, viewportSetup, cameraSelect, matrixOf, worldPos } from '../v3x/scene.ts';
import {
  type OVI, type Mesh, kPos, kTarget, V3XMATRIX_Custom, V3XMATRIX_Vector, V3XMATRIX_Euler, V3XMATRIX_Vector2,
  V3XSTATE_HIDDEN, V3XSTATE_HIDDENDISPLAY, V3XSTATE_MATRIXUPDATE, V3XSTATE_GIANT, V3XSTATE_CULLNEVER, V3XSTATE_CULLEDOFR,
  V3XOBJ_MESH, V3XBLENDMODE_ALPHA,
} from '../v3x/vmx.ts';
import {
  GX, csp, gi, CSP_Color, rgb, DrawText, DrawTextC, WriteText, WriteCenterText, TxLen, ClippedLine, gradientLine,
  type Sprite, type SpriteGroup,
} from '../gx/gx.ts';
import {
  g_cTimer, sKEY, sKEY_IsHeld, sKEY_IsClicked, sMOU, sMOU_IsHeld, s, Flip, timer_ms, timer_sec, timer_Update, timer_Reset,
  STUB_TaskControl, sysRand,
} from '../sys/sys.ts';
import { conPrint, conIsActive, conHandleInput, conRender } from './console.ts';
import { picture, sheet, T } from './data.ts';
import { spriteOfSheet } from '../gx/gx.ts';
import { renderView } from './render.ts';
import {
  NG_AudioPlaySound, NG_AudioGetByName, NG_AudioKickSound, NG_AudioStopSound, NG_Audio3DPlay, NG_Audio3DUpdate, NG_AudioSetFreq,
  NG_AudioBeep, NG_AudioSay, NG_AudioPauseMusic, NG_AudioResumeMusic, channelGetFree, flushAll, playWarpMusic, stopWarpMusic,
} from './sound.ts';
import { NG_FXDraw, NG_FXFlare, NG_FXImpact, NG_FXAvary, NG_FXBlast, NG_FXUpdate, NG_FXUpdateEx } from './fx.ts';
import { NG_WeaponFire, NG_WeaponUpdate } from './weapons.ts';
import {
  NG_AILocateNearestEnemy, NG_AIRandomAim, NG_AIRandomAimEx, NG_DrawCircle, NG_HudLockTargetOn, NG_HudLockTargetReset,
  NG_LevelUpdate, NG_AddMoreLights,
} from './ai.ts';
import { NG_NAVReset, NG_InitGameShip } from './start.ts';
import { NG_DrawHelpFile } from './menu.ts';
import { netDispatchPlayer } from './replay.ts';
import {
  G, g_SGGame, g_SGSettings, g_pShip, type SGActor, type SGScript, LK, lk, MAX_POWERUP, MAX_COM_DELAY, GODMODE, STEALTHMODE, DOOMEDMODE,
  TURBOMODE, SGNET_HASMOVED, SGNET_HASTURN, SGNET_NEWSHOOT, SGNET_HASWARP, SGNET_UPDATEAIM, SGNET_SHIELDCHANGE, SGNET_MODECHANGE,
  SGNET_COMMUNICATE, SGNET_CHAT, SGNET_HASWON, SGNET_HASLEFT, SGNET_HASRESPAWN, GAMESTATE_DEAD, GAMESTATE_WON, GAMESTATE_FAIL,
  GAMESTATE_FAILED, GAMESTATE_QUIT, GAMESTATE_HELP, GAMESTATE_ABORT, GAMESTATE_RETRY, CAMERA_SHIP, CAMERA_NAV, CAMERA_DEATH,
  CAMERA_NEWNAV, CAMERA_START, CAMERA_MISSILE, ART_POWER, ART_SUPERPOWER, ART_STEALTH, ART_INVICIBLITY, ART_CLOAK, ART_MEGABANG,
  COM_Weapon, COM_Bonus, COM_Status, COM_Request, COM_NearBy, COM_TooFar, COM_Complete, COM_FindWarp, COM_TimeShort, COM_Failed,
  COM_Chat, t_SPECIAL, t_OBSTACLE, t_ENEMY, t_PIRAT, t_DECOR, t_FRIEND, t_PLAYER, t_ACCESSOIRE, t_CS_NAV, t_CS_NAVWARP,
  t_CS_BONUS, t_CS_WARP, t_CS_ADD_SCORE_HIDE, t_CS_ADD_SCORE, t_CS_BUMP_LOSE_SHIELD, t_CS_BUMP, t_CS_LOSE_SHIELD, t_FIXE,
  t_GIANT, t_TURN_AROUND_X, t_TURN_AROUND_Y, t_TURN_AROUND_Z, t_TURN_RANDOM, t_TAC_RANDOM_PATROL, t_TAC_PATROL_FIGHT1, t_TAC_TRACK,
  t_TAC_HIND, t_TAC_ATTACK1, ORDER_Attack, ORDER_StayAlert, ORDER_Retreat, ORDER_TargetWeakest, ORDER_TargetStrongest,
  ORDER_AttackTarget, ORDER_Protect, CTRL_Mouse, CTRL_Keyb, CTRL_Joystick, VCfg_win_radar, VCfg_sp_rear, VCfg_sp_camis,
  VCfg_win_rear, VCfg_win_camis, szCOM, szOrder, szCamera,
} from './state.ts';

const P = (): typeof G.g_pPlayer => G.g_pPlayer;
const O = G.g_SGObjects;
const posOf = (o: OVI): Float32Array => m.Pos(o.node.matrix);
export const comText = (i: number): string => (i === COM_Chat ? chat.Code : i === 0 ? ' ' : T(szCOM[i]));

const chat = { Code: '', Car: 0, isType: 0 };
let g_pComFunction: { szTitle: string; Val: string[]; ptr: () => number } | null = null;
let g_nWaitAnswer = 0;
const g_szLockText = ['Lock', 'Locking...', null as string | null];

// ---------------------------------------------------------------- the camera
const roll = (): number => G.g_pCamera![6];
const setRoll = (v: number): void => { G.g_pCamera![6] = v; };
function NG_UpdateCamera(): void {
  const v2 = m.vec(0, -128, 128), v3 = m.vec(-128, -128, 1200), v4 = m.vec(-128, -128, -4000);
  const d = [m.vec(1200, 0, 0), m.vec(0, 0, 1200), m.vec(-1200, 0, 0), m.vec(0, 0, -2), m.vec(0, 0, -600)];
  const b = m.vec(), vTgt = m.vec(), vPos = m.vec(), vDV = m.vec();
  const player = P();
  const mySHIP = player.J.OVI!;
  const cam = G.g_pCamera!;
  const C = V3X.Camera;
  let sp = 2;
  if (O.NavCam) mySHIP.state |= V3XSTATE_MATRIXUPDATE;
  mySHIP.state &= ~V3XSTATE_HIDDENDISPLAY;
  O.Cam!.state |= V3XSTATE_MATRIXUPDATE;
  if (O.Sky) O.Sky.state |= V3XSTATE_MATRIXUPDATE | V3XSTATE_GIANT;
  switch (g_SGGame.CameraMode) {
    case 0:
      C.matrix_Method = V3XMATRIX_Custom;
      kPos(cam).set(m.Pos(player.Mat));
      setRoll(0);
      m.Pos(C.M).set(m.Pos(player.Mat));
      m.transpose(C.M, player.Mat);
      mySHIP.state |= V3XSTATE_HIDDENDISPLAY;
      break;
    case 2: case 3: case 4: case 5:
      sp = 6;
      setRoll(0);
      C.matrix_Method = V3XMATRIX_Vector;
      m.applyMatrix(b, d[g_SGGame.CameraMode - 2], player.Mat);
      vTgt.set(m.Pos(player.Mat));
      m.dif(vPos, vTgt, b);
      break;
    case 1:
      C.matrix_Method = V3XMATRIX_Custom;
      vTgt.set(m.Pos(player.Mat));
      setRoll(0);
      m.transpose(C.M, player.Mat);
      m.applyMatrix(b, d[4], player.Mat);
      m.dif(vPos, m.Pos(player.Mat), b);
      m.Pos(C.M).set(kPos(cam));
      sp = 8;
      break;
    case CAMERA_NAV: {
      const GRID = 4096;
      C.matrix_Method = V3XMATRIX_Vector;
      setRoll(0);
      vTgt.set(m.Pos(player.Mat));
      for (let i = 0; i < 3; i++) {
        const p = Math.trunc(vTgt[i]);
        const p0 = p & (GRID - 1);
        let p1 = p & ~(GRID - 1);
        if (p0 > GRID >> 1) p1 += GRID;
        vPos[i] = (g_SGGame.Count & 511) === 0 ? p1 : cam[3 + i];
      }
      break;
    }
    case CAMERA_MISSILE:
      g_SGGame.CameraMode = 0;
      break;
    case CAMERA_DEATH: case CAMERA_DEATH + 1:
      if (g_SGGame.CameraMode === CAMERA_DEATH) {
        NG_FXBlast(player.J.pInf, mySHIP);
        C.matrix_Method = V3XMATRIX_Vector;
        setRoll(0);
        g_SGGame.CameraMode++;
        g_SGGame.DeathDist = 512;
      }
      vTgt.set(m.Pos(player.Mat));
      g_SGGame.DeathDist = Math.fround(g_SGGame.DeathDist + 16);
      NG_AIRandomAimEx(vPos, vTgt, g_SGGame.DeathDist, Math.trunc(g_SGGame.Count * 32), Math.trunc(g_SGGame.Count * 4));
      if (g_SGGame.DeathDist > 4048) g_SGGame.DeathDist = 4048;
      kPos(cam).set(vPos);
      kTarget(cam).set(vTgt);
      return;
    case CAMERA_START:
      sp = 9;
      C.matrix_Method = V3XMATRIX_Vector;
      setRoll(Math.fround(roll() + (g_cTimer.iCounter >> 15)));
      m.applyMatrix(b, v2, player.Mat);
      vTgt.set(m.Pos(player.Mat));
      m.dif(vPos, vTgt, b);
      if (g_SGGame.Count === 2) NG_AudioKickSound(G.g_cFXTable.Engine, G.g_cFXTable.SoundEngine, 0);
      break;
    case CAMERA_NEWNAV: case CAMERA_NEWNAV + 1:
      if (g_SGGame.CameraMode === CAMERA_NEWNAV) {
        m.setIdentity(player.Mat);
        m.applyMatrix(b, v3, player.Mat);
        vTgt.set(m.Pos(player.Mat));
        m.dif(kPos(cam), vTgt, b);
        kTarget(cam).set(vTgt);
        g_SGGame.CameraMode = CAMERA_NEWNAV + 1;
        player.J.pInf.Doppling = NG_Audio3DPlay(player.J.pInf.Doppler - 1, vTgt, player.J.Mv.vel);
        player.J.pInf.fSpeed = player.J.pInf.fSpeedMax;
      }
      setRoll(Math.fround(roll() + (g_cTimer.iCounter >> 13)));
      C.matrix_Method = V3XMATRIX_Vector;
      m.applyMatrix(b, v4, player.Mat);
      vTgt.set(m.Pos(player.Mat));
      kTarget(cam).set(vTgt);
      m.dif(vPos, vTgt, b);
      sp = 10;
      NG_Audio3DUpdate(vTgt, player.J.Mv.vel, player.J.pInf.Doppling, player.J.pInf.Doppler - 1);
      break;
    default:
      g_SGGame.CameraMode = CAMERA_SHIP;
      break;
  }
  if (g_SGGame.CameraMode > 0) {
    const k = Math.fround(1 / sp);
    m.dif(vDV, vPos, kPos(cam));
    m.scl(vDV, vDV, k);
    const di = m.lengthSq(vDV);
    if (di <= 128 || (g_SGGame.CameraMode === 5 && di <= 2048)) {
      if (g_SGGame.CameraMode === CAMERA_START) g_SGGame.CameraMode = CAMERA_SHIP;
      if (g_SGGame.CameraMode === CAMERA_SHIP) g_SGGame.CameraMode = 0;
      if (g_SGGame.CameraMode === CAMERA_NEWNAV + 1) {
        g_SGGame.CameraMode = CAMERA_SHIP;
        g_SGGame.Count = 0;
        O.NAV++;
        if (O.NAV >= O.MaxNAV) O.NAV = 0;
        NG_NAVReset(1);
        m.Pos(player.Mat).set(kPos(C.Tk));
        kPos(cam).set(kPos(C.Tk));
        return;
      }
    }
    m.inc(kPos(cam), vDV);
    m.dif(vDV, vTgt, kTarget(cam));
    m.scl(vDV, vDV, k);
    m.inc(kTarget(cam), vDV);
    if (O.FinCode !== GAMESTATE_DEAD) NG_Audio3DUpdate(m.Pos(player.Mat), player.J.Mv.vel, G.g_cFXTable.Engine, G.g_cFXTable.SoundEngine);
  }
}

export function PauseSoundGame(): void { NG_AudioPauseMusic(); flushAll(); }
export function ResumeSoundGame(): void {
  flushAll();
  NG_AudioResumeMusic();
  if (G.g_cFXTable.Alarm) G.g_cFXTable.Alarm = NG_AudioPlaySound(G.g_cFXTable.SoundAlarm, 0);
  NG_AudioKickSound(G.g_cFXTable.Engine, G.g_cFXTable.SoundEngine, 0);
  G.g_cFXTable.Engine = channelGetFree();
}

/** NG_RenderView: the 3D view (Viewport_Clear + Viewport_Render with its post_render) */
export function NG_RenderView(): void {
  if (g_SGSettings.bClearView === 2) {
    GX.csp_cfg.alpha = 128;
    gi.drawFilledRect(0, 0, GX.View.xmax, GX.View.ymax, 0);
  } else {
    renderView({ xmin: View.xmin, ymin: View.ymin, xmax: View.xmax, ymax: View.ymax }, null, null);
    AddingFaceMoreDisp();
  }
}
function ShowHelpBack(): void {
  timer_Reset();
  NG_RenderView();
  GX.csp_cfg.alpha = 128;
  gi.drawMeshedRect(0, 0, GX.View.xmax, GX.View.ymax, 0);
}
async function NG_MissionSummary(sty: number): Promise<void> {
  const pFont = G.g_pspDispFont;
  const Level = G.g_pGameItem[G.g_pCurrentGame.episode].LI[G.g_pCurrentGame.level[G.g_pCurrentGame.episode]];
  let quit = false;
  do {
    sKEY.Update();
    quit = conIsActive() ? false : sKEY_IsClicked(s.esc) || sKEY_IsClicked(s.return);
    g_SGSettings.bClearView = 1;
    ShowHelpBack();
    WriteCenterText(Level.name, 0, G.g_pspDispFont);
    for (let y = sty, i = 0; i < 16; i++, y += pFont.item[0].LY + 2) WriteCenterText(Level.tex[i], y, pFont);
    if (conIsActive()) conRender();
    await Flip();
  } while (!quit);
}
async function ShowHelp(): Promise<void> {
  const tim = timer_sec();
  PauseSoundGame();
  await NG_DrawHelpFile(G.g_pspDispFont, g_SGGame.CI_BLUELIGHT, 10, true);
  ResumeSoundGame();
  G.g_cGameStat.time_start += timer_sec() - tim;
  timer_Update(); timer_Update();
}
function DrawShadedTexte(texte: string, ye: number, pFont: SpriteGroup, color: number): void {
  const xe = GX.View.xmin + (((GX.View.xmax - GX.View.xmin) - TxLen(texte, pFont)) >> 1);
  if (GX.View.xmax > 320) { CSP_Color(0); DrawText(texte, xe + 1, ye + 1, pFont, csp.put); }
  CSP_Color(color);
  DrawText(texte, xe, ye, pFont, csp.put);
}
let panelSprite: Sprite | null = null;
async function NG_DisplayDropMenu(menu: string[]): Promise<number> {
  const pFont = G.g_pspDispFont;
  const sz = menu.length - 1, ly = pFont.item[0].LY + 2;
  let ch = 0, esc = 0, stx: number, sty: number;
  if (GX.View.xmax > 400) {
    if (!panelSprite) panelSprite = spriteOfSheet(sheet('int/panel.png'));
    sty = (GX.View.ymax - panelSprite.LY) >> 1;
    stx = (GX.View.xmax - panelSprite.LX) >> 1;
  } else { stx = 0; sty = (GX.View.ymax - sz * ly) >> 1; }
  void picture;
  do {
    if (STUB_TaskControl()) { esc = 1; break; }
    sKEY.Update(); sMOU.Update();
    conHandleInput();
    let dy = 0;
    if (!conIsActive()) {
      if (sKEY_IsClicked(s.return)) esc = 2;
      dy = Number(sKEY_IsClicked(s.up)) - Number(sKEY_IsClicked(s.down));
      if (dy) NG_AudioPlaySound(NG_AudioGetByName('bloup') - 1, 0);
    }
    g_SGSettings.bClearView = 1;
    ShowHelpBack();
    CSP_Color(g_SGGame.CI_WHITE);
    let y = sty;
    if (panelSprite && GX.View.xmax > 400) { csp.put(stx, y, panelSprite); y += 20; }
    DrawShadedTexte(menu[0], y, pFont, g_SGGame.CI_WHITE);
    y += ly * 2;
    ch -= dy;
    if (ch < 0) ch = sz - 1;
    if (ch >= sz) ch = 0;
    for (let i = 0; i < sz; y += ly, i++) DrawShadedTexte(menu[i + 1], y, pFont, ch !== i ? g_SGGame.CI_BLUELIGHT : g_SGGame.CI_WHITE);
    if (conIsActive()) conRender();
    await Flip();
  } while (!esc);
  NG_AudioPlaySound(NG_AudioGetByName('door') - 1, 0);
  return esc === 2 ? ch : 0;
}
/** NG_QuitGame: the pause menu (Esc) */
async function NG_QuitGame(): Promise<number> {
  const tim = timer_sec();
  let ret = 0;
  const PauseMenu = [T(165), T(166), T(168), T(167), T(45), T(52)];
  PauseSoundGame();
  if (g_SGSettings.DemoMode) { O.FinCode = GAMESTATE_ABORT; ret = 1; }
  else {
    switch (await NG_DisplayDropMenu(PauseMenu)) {
      case 0: O.FinCode = 0; ret = 0; break;
      case 1: await NG_MissionSummary(Math.trunc(GX.View.ymax / 3)); O.FinCode = 0; ret = 0; break;
      case 2: O.FinCode = GAMESTATE_RETRY; ret = 2; break;
      case 3: O.FinCode = GAMESTATE_ABORT; ret = 1; break;
      case 4: O.FinCode = GAMESTATE_QUIT; ret = 2; break;
    }
  }
  ResumeSoundGame();
  G.g_cGameStat.time_start += timer_sec() - tim;
  timer_Update(); timer_Update();
  return ret;
}

// ---------------------------------------------------------------- the shield sphere
export function NG_GetFreeSphere(): OVI | null { return O.Shield; }
export function NG_SetSpherePos(OVI: OVI, Mat: Float32Array, scale: number, status: number): OVI {
  const mesh = meshOf(OVI);
  mesh.matrix.set(Mat);
  mesh.scale = scale;
  OVI.state |= V3XSTATE_MATRIXUPDATE;
  if (status) OVI.state |= V3XSTATE_CULLNEVER; else OVI.state &= ~V3XSTATE_CULLNEVER;
  if (status === 0) OVI.state |= V3XSTATE_HIDDEN; else OVI.state &= ~V3XSTATE_HIDDEN;
  OVI.collisionList = null;
  OVI.matrix_Method = V3XMATRIX_Custom;
  return OVI;
}
let warp = 0, warps = 1;
function SetSphereColor(status: number, z: number): void {
  const OVI = NG_SetSpherePos(O.Shield!, P().Mat, z, status);
  if (status === 1) {
    const Mat = meshOf(OVI).material[0];
    Mat.diffuse = [...g_SGGame.FlashColor];
    Mat.info.Transparency = V3XBLENDMODE_ALPHA;
    Mat.alpha = warp & 255;
    Mat.version++;
  }
}
function NG_UpdateLights(): void {
  const t = Math.max(1, g_cTimer.iCounter >> 16);
  warp += warps * t;
  if (warp < 0) { warp = 0; warps = 2; }
  if (warp > 255) { warp = 255; warps = -2; }
  for (const OVI of g_SGGame.Scene!.OVI) {
    if (OVI.ORI?.type !== V3XOBJ_MESH || OVI.state & V3XSTATE_HIDDEN) continue;
    for (const Mat of meshOf(OVI).material) {
      const n = Mat.mat_name.toLowerCase();
      if (n === 'light2') { Mat.diffuse = [(Mat.diffuse[0] - t) & 255, (Mat.diffuse[1] - t) & 255, (Mat.diffuse[2] - t) & 255]; Mat.version++; }
      if (n === 'warp') { Mat.diffuse = [warp & 255, warp & 255, warp & 255]; Mat.version++; }
    }
  }
}
function NG_UpdatePowerUps(): void {
  const player = P();
  for (let i = 1; i <= MAX_POWERUP; i++) {
    const a = player.Art[i];
    if (a.Time_val <= 0) continue;
    SetSphereColor(2, 1);
    switch (i) {
      case ART_STEALTH: g_SGGame.FlashColor = [0, 0, 255]; g_SGGame.FlashAlpha = 8; break;
      case ART_INVICIBLITY: g_SGGame.FlashColor = [255, 0, 0]; g_SGGame.FlashAlpha = 8; break;
    }
    // (short)g_cTimer.iCounter >> 16: the short cast comes first
    a.Time_val = ((a.Time_val - (((g_cTimer.iCounter << 16) >> 16) >> 16)) << 16) >> 16;
    if (a.Time_val <= 0) {
      SetSphereColor(0, 1);
      a.Time_val = 0;
      switch (i) {
        case ART_STEALTH: player.mode ^= STEALTHMODE; player.Notify += SGNET_MODECHANGE; conPrint('stealth mode depleated'); break;
        case ART_INVICIBLITY: player.mode ^= GODMODE; player.Notify += SGNET_MODECHANGE; conPrint('inviciblity mode depleated'); break;
      }
    }
  }
}
function PlayPowerUp(): void {
  const player = P(), cur = player.CurArt, a = player.Art[cur];
  if (a.val <= 0) return;
  const J = player.J.pInf;
  const name = G.g_pCurrentGame.name;
  switch (cur) {
    case ART_POWER:
      if (J.Shield < J.ShieldMax) {
        J.Shield += Math.trunc(J.ShieldMax / 5);
        if (J.Shield >= J.ShieldMax) J.Shield = J.ShieldMax;
        a.val--;
        NG_AudioPlaySound(NG_AudioGetByName('bloup') - 1, 0);
        conPrint(`${name} used power up`);
      }
      break;
    case ART_SUPERPOWER:
      if (J.Shield < J.ShieldMax) {
        J.Shield = J.ShieldMax;
        a.val--;
        NG_AudioPlaySound(NG_AudioGetByName('bloup') - 1, 0);
        player.Notify += SGNET_SHIELDCHANGE;
        conPrint(`${name} used super power up`);
      }
      break;
    case ART_STEALTH:
      a.Time_val = 1968; a.val--;
      NG_AudioPlaySound(NG_AudioGetByName('shield') - 1, 0);
      g_SGGame.FlashAlpha = 32;
      player.mode |= STEALTHMODE;
      player.Notify += SGNET_MODECHANGE;
      g_SGGame.FlashColor = [0, 0, 255];
      SetSphereColor(1, 1);
      conPrint(`${name} used stealth mode`);
      break;
    case ART_INVICIBLITY:
      a.Time_val = 1968; a.val--;
      NG_AudioPlaySound(NG_AudioGetByName('shield') - 1, 0);
      player.mode |= GODMODE;
      player.Notify += SGNET_MODECHANGE;
      g_SGGame.FlashColor = [255, 0, 0];
      SetSphereColor(1, 1.5);
      conPrint(`${name} used invicility`);
      break;
    case ART_CLOAK:
      NG_NAVReset(1);
      a.val--;
      g_SGGame.FlashAlpha = 32;
      NG_AudioPlaySound(NG_AudioGetByName('warp') - 1, 0);
      kPos(player.Rot).set(kPos(O.NavCam!.Tk!));
      a.Time_val = 50;
      g_SGGame.FlashColor = [255, 255, 255];
      SetSphereColor(1, 1);
      conPrint(`${name} used cloak device`);
      break;
    case ART_MEGABANG: {
      g_SGGame.FlashAlpha = 32;
      const ORI = player.J.OVI!.ORI!;
      const k = ORI.global_rayon;
      ORI.global_rayon = 2048;
      NG_FXAvary(player.J.OVI!, player.J.pInf);
      NG_FXBlast(player.J.pInf, player.J.OVI!);
      ORI.global_rayon = k;
      a.val--;
      NG_AudioPlaySound(NG_AudioGetByName('shield') - 1, 0);
      a.Time_val = 50;
      g_SGGame.FlashColor = [0, 255, 0];
      SetSphereColor(1, 5);
      conPrint(`${name} used mega bomb`);
      break;
    }
  }
}
function AddPowerUp(code: number): number {
  let c = -1;
  const player = P(), sh = G.g_cShip;
  if (code >= 8 && code < 16) { c = code - 8; sh.wea[c].cur += 8; }
  if (code >= 16) { c = code - 16; sh.wea[c].cur += 16; }
  if (c >= 0) {
    if (sh.wea[c].cur >= sh.wea[c].max) sh.wea[c].cur = sh.wea[c].max; else NG_AudioBeep(2);
    g_SGSettings.ComNumber = COM_Weapon + c - 1;
    g_SGSettings.ComTime = MAX_COM_DELAY;
    return 1;
  }
  if (player.Art[code].val === 0) player.CurArt = code;
  if (player.Art[code].val < player.Art[code].MAX_val) {
    g_SGSettings.ComNumber = COM_Bonus + code - 1;
    g_SGSettings.ComTime = MAX_COM_DELAY;
    player.Art[code].val++;
    NG_AudioBeep(2);
    g_SGGame.FlashColor = [255, 0, 0];
    g_SGGame.FlashAlpha = 16;
    return 1;
  }
  return 0;
}
function NG_UpdateCom(): void {
  if (g_nWaitAnswer <= 0) return;
  g_nWaitAnswer -= g_cTimer.iCounter >> 16;
  if (g_nWaitAnswer > 0 || !G.g_pLockTarget) return;
  const J = G.g_pLockTarget.data as SGActor;
  if (J.pInf.Type !== t_FRIEND) return;
  let c = 0;
  if (J.pInf.Shield > 0) c = 3;
  if (J.pInf.Shield > J.pInf.ShieldMax >> 2) c = 2;
  if (J.pInf.Shield > J.pInf.ShieldMax >> 1) c = 1;
  if (J.pInf.Shield === J.pInf.ShieldMax) c = 0;
  g_SGSettings.ComTime = MAX_COM_DELAY / 2;
  g_SGSettings.ComNumber = COM_Status + c;
  const tex = `rep0${c + 1}`;
  NG_AudioSay(tex);
  conPrint(tex);
  NG_AudioBeep(3);
}
function setFormation(code: number): void {
  const tex = `com0${code + 1}`;
  NG_AudioSay(tex);
  conPrint(tex);
  if (code && !(P().mode & DOOMEDMODE)) O.CallMode[t_FRIEND] = code;
  else g_nWaitAnswer = 128;
  if (g_SGSettings.SerialGame) {
    P().Notify += SGNET_COMMUNICATE;
    g_SGSettings.ComNumber = COM_Request + code;
    g_SGSettings.ComTime = MAX_COM_DELAY;
    g_SGGame.ComMode = 0;
  }
  NG_AISetTacticMode();
}

// ---------------------------------------------------------------- input
const lowpass = { rollZ: 0, keyX: 0, keyY: 0, mouX: 0, mouY: 0, Mvx: 0, Mvy: 0, Mvz: 0 };
const f32 = Math.fround;
function RollControl(ra: number): void {
  let dZ = 0;
  if (sKEY_IsHeld(lk(LK.ROLLRIGHT))) dZ = 1;
  if (sKEY_IsHeld(lk(LK.ROLLLEFT))) dZ = -1;
  const nlZ = f32(f32(dZ * ra) / 2);
  lowpass.rollZ = f32(f32(lowpass.rollZ * 0.8) + f32(nlZ * 0.2));
  P().Mv.z = lowpass.rollZ;
}
/** SGMOU_MapKeyboard: the mouse buttons press the keys they are bound to */
function mapMouseButtons(): void {
  for (let i = 0; i < 3; i++) {
    let key = 0;
    for (let k = 0; k < 23; k++) if (g_SGSettings.mou[k] === i + 1) key = g_SGSettings.key[k];
    if (key && !sKEY_IsHeld(key)) sKEY.rgbButtons[key] = sMOU_IsHeld(i) ? 1 : 0;
  }
}
let oldWheel = 0;
function NG_ReadInput(): void {
  const player = P();
  sKEY.Update();
  sMOU.Update();
  conHandleInput();
  if (conIsActive()) return;
  if (!chat.isType) {
    if (sKEY_IsClicked(lk(LK.TALK))) chat.isType = 1;
    if (sKEY_IsClicked(lk(LK.HUD))) { g_SGSettings.showInf ^= sKEY_IsHeld(s.leftshift) ? 2 : 1; NG_AudioBeep(1); }
    if (O.FinCode === GAMESTATE_DEAD || g_SGSettings.DemoMode >= 2) {
      if (sKEY_IsClicked(s.esc)) O.quit = 1;
    } else {
      const ra = f32(f32(2 * g_cTimer.fCounter) * (1 + g_SGSettings.MouseSensitivity + 8));
      switch (g_SGSettings.Ctrl) {
        case CTRL_Joystick:
          // no joystick in this port: as without one (NG_CheckSystems falls back to the mouse)
          break;
        case CTRL_Keyb: {
          let dX = 0, dY = 0;
          if (sKEY_IsHeld(lk(LK.RIGHT))) dX = 1;
          if (sKEY_IsHeld(lk(LK.LEFT))) dX = -1;
          if (sKEY_IsHeld(lk(LK.DOWN))) dY = 1;
          if (sKEY_IsHeld(lk(LK.UP))) dY = -1;
          const nlX = f32(f32(dX * ra) / 2), nlY = f32(f32(dY * ra) / 2);
          lowpass.keyX = f32(f32(lowpass.keyX * 0.8) + f32(nlX * 0.2));
          lowpass.keyY = f32(f32(lowpass.keyY * 0.8) + f32(nlY * 0.2));
          player.Mv.x = -lowpass.keyX;
          player.Mv.y = lowpass.keyY;
          RollControl(ra);
          break;
        }
        case CTRL_Mouse: {
          mapMouseButtons();
          if (g_SGSettings.AltMouse) {
            const nlX = f32(f32(sMOU.lX * ra) / 50), nlY = f32(f32(sMOU.lY * ra) / 50);
            lowpass.mouX = f32(f32(lowpass.mouX * 0.8) + f32(nlX * 0.2));
            lowpass.mouY = f32(f32(lowpass.mouY * 0.8) + f32(nlY * 0.2));
            player.Mv.x = -lowpass.mouX;
            player.Mv.y = lowpass.mouY;
          } else {
            let s1 = f32(f32(sMOU.x / GX.View.xmax) - 0.5);
            player.Mv.x = f32(-s1 * ra);
            s1 = f32(f32(sMOU.y / GX.View.ymax) - 0.5);
            player.Mv.y = f32(s1 * ra);
          }
          RollControl(ra);
          break;
        }
      }
      if (sKEY_IsHeld(lk(LK.FIRE))) player.Mx.but |= 1;
      if (sKEY_IsHeld(lk(LK.THROTTLE))) player.Mx.but |= 2;
      if (sKEY_IsClicked(lk(LK.ITEM))) player.Mx.but |= 8;
      if (sKEY_IsClicked(lk(LK.NEXTWEAPON)) || sMOU.lZ) {
        const t = timer_ms();
        if (t - oldWheel > 100) {
          const sgn = sMOU.lZ ? Math.sign(sMOU.lZ) : 1;
          oldWheel = t;
          player.J.pInf.Attack += sgn;
          if (player.J.pInf.Attack > 6) player.J.pInf.Attack = 1;
          if (player.J.pInf.Attack < 1) player.J.pInf.Attack = 6;
          player.Mx.but |= 1 << (player.J.pInf.Attack + 5);
        }
      }
      if (sKEY_IsHeld(lk(LK.ANTITHRUST))) player.Mx.but |= 1 << 30;
      if (sKEY_IsHeld(lk(LK.SPEEDLESS))) player.Mv.inert = f32(player.Mv.inert - g_cTimer.fCounter / 2);
      if (sKEY_IsHeld(lk(LK.SPEEDPLUS))) player.Mv.inert = f32(player.Mv.inert + g_cTimer.fCounter / 2);
      if (sKEY_IsHeld(lk(LK.STOP))) player.Mv.inert = player.J.pInf.fSpeedMax;
      const cm = g_SGGame.ComMode ? 15 : 0;
      if (sKEY_IsClicked(lk(LK.RADAR))) { g_SGGame.RadarMode ^= 1; NG_AudioBeep(1); }
      else if (sKEY_IsClicked(s.esc)) player.Mx.but |= 1 << 20;
      else if (sKEY_IsClicked(lk(LK.LOCK)) || sKEY_IsClicked(s.winapp)) player.Mx.but |= 4;
      else if (sKEY_IsClicked(lk(LK.THRUST)) || sKEY_IsClicked(s.winright)) player.Mx.but |= 16;
      else if (sKEY_IsClicked(lk(LK.NEXTNAV)) || sKEY_IsClicked(s.winleft)) player.Mx.but |= 32;
      else if (sKEY_IsClicked(s.n1)) player.Mx.but |= 1 << (6 + cm);
      else if (sKEY_IsClicked(s.n2)) player.Mx.but |= 1 << (7 + cm);
      else if (sKEY_IsClicked(s.n3)) player.Mx.but |= 1 << (8 + cm);
      else if (sKEY_IsClicked(s.n4)) player.Mx.but |= 1 << (9 + cm);
      else if (sKEY_IsClicked(s.n5)) player.Mx.but |= 1 << (10 + cm);
      else if (sKEY_IsClicked(s.n6)) player.Mx.but |= 1 << (11 + cm);
      else if (sKEY_IsClicked(lk(LK.COM))) g_SGGame.ComMode ^= 1;
      else if (sKEY_IsClicked(lk(LK.PREVITEM))) player.Mx.but |= 1 << 12;
      else if (sKEY_IsClicked(lk(LK.NEXTITEM))) player.Mx.but |= 1 << 13;
      else if (g_SGGame.ComMode) {
        if (sKEY_IsClicked(s.n7)) player.Mx.but |= 1 << 27;
        else if (sKEY_IsClicked(s.n8)) player.Mx.but |= 1 << 28;
      }
    }
    if (sKEY_IsClicked(s.f1)) player.Mx.but |= 1 << 18;
    else if (sKEY_IsClicked(s.f2)) player.Mx.but |= 1 << 14;
    else if (sKEY_IsClicked(s.f3)) player.Mx.but |= 1 << 15;
    else if (sKEY_IsClicked(s.f4)) player.Mx.but |= 1 << 16;
    else if (sKEY_IsClicked(s.f5)) player.Mx.but |= 1 << 17;
    else if (sKEY_IsClicked(s.f6)) player.Mx.but |= 1 << 19;
    else if (sKEY_IsClicked(s.f7) && g_SGGame.Missile) player.Mx.but |= 1 << 29;
  } else {
    const oV = sKEY.charCode;
    if (oV === 8 && chat.Car) { chat.Car--; chat.Code = chat.Code.slice(0, chat.Car); }
    else if (oV === 13) {
      player.Notify += SGNET_CHAT;
      chat.isType = 0;
      conPrint(`${G.g_pCurrentGame.name}: ${chat.Code}`);
    } else if (oV >= 32 && oV < 128 && chat.Car < 31) { chat.Code += String.fromCharCode(oV); chat.Car++; }
    sKEY.charCode = 0; // one character per key press (the original's charCode stays until the key is released)
  }
}

// ---------------------------------------------------------------- demo playback
let g_nOldTimer = 0, g_bSaveIT = 0;
function Demo_RecordA(): void {
  const player = P(), J = player.J;
  g_bSaveIT = 0;
  if (g_SGSettings.DemoMode <= 1) {
    m.Pos(player.Mat).set(kPos(player.Rot));
    if (player.Mv.inert < 1) player.Mv.inert = 1;
    if (player.Mv.inert > J.pInf.fSpeedMax) player.Mv.inert = J.pInf.fSpeedMax;
  }
  if (g_SGSettings.DemoMode === 2 || g_SGSettings.DemoMode === 4) {
    const R = G.rec;
    if (R.step < R.maxstep && g_SGGame.CameraMode !== CAMERA_NEWNAV + 1) {
      const t = timer_ms();
      if (t > g_nOldTimer) {
        player.Mx.but = R.pos[R.step].but;
        player.Mx.Mat.set(R.pos[R.step].Mat);
        player.Mat.set(player.Mx.Mat);
        kPos(player.Rot).set(m.Pos(player.Mat));
        g_bSaveIT = 1;
        g_nOldTimer += Math.trunc(1000 / 30);
      }
    } else player.Mx.but |= 1 << 20;
  }
}
function NG_RecordReplayAction(): void {
  const player = P(), R = G.rec;
  player.Mx.but = 0;
  if (R.step >= R.maxstep) { O.quit = 1; return; }
  if (g_bSaveIT && (g_SGSettings.DemoMode === 2 || g_SGSettings.DemoMode === 4)) {
    if (R.version === 3) netDispatchPlayer(R.buf[R.step]);
    R.step++;
  }
}

// ---------------------------------------------------------------- the ship
const M = { x: 0, y: 0, z: 0 };
function NG_ControlGame(): void {
  const player = P(), J = player.J;
  player.Notify = 0;
  NG_ReadInput();
  Demo_RecordA();
  if (g_SGGame.CameraMode < CAMERA_NEWNAV) {
    if (player.Mv.x || player.Mv.y || player.Mv.z) player.Notify += SGNET_HASTURN;
    player.Notify += SGNET_HASMOVED;
    const but = player.Mx.but;
    if (but) controlButtons(but);
    if (player.J.pInf.fFrozen <= 0) {
      M.x = f32(f32(player.Mv.x * 0.1) + f32(M.x * 0.9));
      M.y = f32(f32(player.Mv.y * 0.1) + f32(M.y * 0.9));
      M.z = f32(f32(player.Mv.z * 0.1) + f32(M.z * 0.9));
      m.rotateYLocal(Math.trunc(player.Mv.x), player.Mat);
      m.rotateXLocal(g_SGSettings.FlipYMouse ? -Math.trunc(player.Mv.y) : Math.trunc(player.Mv.y), player.Mat);
      m.rotateZLocal(Math.trunc(player.Mv.z - player.Mv.x * 0.7), player.Mat);
      if (!(g_SGGame.Count & 63)) {
        m.normalize(m.I(player.Mat), m.I(player.Mat));
        m.normalize(m.J(player.Mat), m.J(player.Mat));
        m.normalize(m.K(player.Mat), m.K(player.Mat));
      }
      for (let i = 0; i < 6; i++) {
        const w = G.g_cShip.wea[i];
        if (w.reload && V3X.Time.ms > w.loadTime) {
          w.loadTime = V3X.Time.ms + w.reload * 100;
          if (w.cur < w.max) w.cur++;
        }
      }
      let oV = J.pInf.fSpeed;
      if (!player.fBooster) {
        if (player.Mx.but & 2) {
          J.pInf.fSpeed = f32(J.pInf.fSpeed + (J.pInf.fSpeed < J.pInf.fSpeedMax ? g_cTimer.fCounter / 2 : 0));
          if (J.pInf.fSpeed > J.pInf.fSpeedMax) J.pInf.fSpeed = J.pInf.fSpeedMax;
        } else {
          J.pInf.fSpeed = f32(J.pInf.fSpeed - g_cTimer.fCounter * 2);
          if (J.pInf.fSpeed < player.Mv.inert) J.pInf.fSpeed = player.Mv.inert;
        }
      } else {
        J.pInf.fSpeed = f32(J.pInf.fSpeed + player.fBooster);
        if (player.fBooster < 0) {
          if (J.pInf.fSpeed < -J.pInf.fSpeedMax) J.pInf.fSpeed = -J.pInf.fSpeedMax;
          player.fBooster = f32(player.fBooster + g_cTimer.fCounter);
          if (player.fBooster > 0) player.fBooster = 0;
        }
        if (player.fBooster > 0) {
          if (J.pInf.fSpeed > 2 * J.pInf.fSpeedMax) J.pInf.fSpeed = J.pInf.fSpeedMax * 2;
          player.fBooster = f32(player.fBooster - g_cTimer.fCounter);
          if (player.fBooster < 0) player.fBooster = 0;
        }
      }
      if (g_SGGame.pReactorMaterial && !g_SGSettings.SerialGame) {
        const Mat = g_SGGame.pReactorMaterial;
        const scale = (J.pInf.fSpeed < 0 ? 1 : Math.trunc((J.pInf.fSpeed * 256) / (J.pInf.fSpeedMax + 1))) & 255;
        Mat.diffuse = [scale, scale, scale];
        Mat.version++;
      }
      const b = m.vec(0, 0, f32(f32(-J.pInf.fSpeed * g_cTimer.fCounter) * 2));
      m.applyMatrix(J.Mv.vel, b, player.Mat);
      m.inc(kPos(player.Rot), J.Mv.vel);
      if (g_SGGame.CameraMode === 0 && G.g_ubSampleUsed[G.g_cFXTable.Engine] !== G.g_cFXTable.SoundEngine) oV = 65535;
      if (oV !== J.pInf.fSpeed) NG_AudioSetFreq(G.g_cFXTable.Engine, Math.trunc(44100 + J.pInf.fSpeed * 256));
    }
  }
  const OVI = player.J.OVI!.collisionList;
  if (!OVI) return;
  player.J.OVI!.collisionList = null;
  const JJ = OVI.data as SGActor;
  if (!JJ) return;
  switch (JJ.pInf.Type) {
    case t_SPECIAL:
      if (O.NAV === O.MaxNAV - 1 && JJ.pInf.ColorRadar !== 255) { conPrint('Completed'); O.FinCode = GAMESTATE_WON; }
      break;
    case t_OBSTACLE: case t_ENEMY: case t_PIRAT: case t_DECOR: case t_FRIEND:
      collide(JJ, J);
      break;
  }
}
function collide(JJ: SGActor, J: SGActor): void {
  const player = P();
  switch (JJ.pInf.CollisionStyle) {
    case t_CS_NAV: case t_CS_NAVWARP:
      O.NAV = JJ.pInf.Code;
      if (O.NAV >= O.MaxNAV) O.NAV = O.MaxNAV - 1;
      if (JJ.pInf.CollisionStyle === t_CS_NAVWARP) player.Notify += SGNET_HASWARP;
      player.Notify += SGNET_UPDATEAIM;
      NG_NAVReset(JJ.pInf.CollisionStyle === t_CS_NAVWARP ? 1 : 0);
      break;
    case t_CS_BONUS:
      if (AddPowerUp(JJ.pInf.Code)) { JJ.pInf.Wait = 1; G.g_cGameStat.bonus++; conPrint('Pickup a bonus'); }
      break;
    case t_CS_WARP:
      JJ.pInf.Wait = 1;
      G.g_cGameStat.newlevel = JJ.pInf.Code - 1;
      break;
    case t_CS_ADD_SCORE_HIDE: case t_CS_ADD_SCORE:
      if (JJ.pInf.CollisionStyle === t_CS_ADD_SCORE_HIDE) JJ.pInf.Wait = 1;
      g_SGGame.MaxAim[O.NAV] -= JJ.pInf.Mission;
      player.Notify += SGNET_UPDATEAIM;
      if (JJ.pInf.Mission) NG_DisplayWarp();
      JJ.pInf.Mission = 0;
      if (JJ.pInf.Scoring) { g_SGGame.FlashAlpha = 16; J.pInf.Scoring += JJ.pInf.Scoring; JJ.pInf.Scoring = 0; }
      break;
    case t_CS_BUMP_LOSE_SHIELD: case t_CS_BUMP:
      if (JJ.pInf.CollisionStyle === t_CS_BUMP_LOSE_SHIELD && !(player.mode & GODMODE) && O.FinCode !== GAMESTATE_DEAD) {
        J.pInf.Shield--;
        JJ.pInf.Shield--;
        NG_AudioPlaySound(NG_AudioGetByName('flag_st') - 1, 0);
        g_SGGame.FlashAlpha = 16;
        NG_FXImpact(4);
        player.Notify += SGNET_SHIELDCHANGE;
      }
      J.pInf.fSpeed = f32(J.pInf.fSpeed * 0.5);
      break;
    case t_CS_LOSE_SHIELD:
      J.pInf.Shield -= 2;
      NG_AudioPlaySound(NG_AudioGetByName('flag_st') - 1, 0);
      g_SGGame.FlashColor = [255, 0, 0];
      g_SGGame.FlashAlpha = 16;
      player.Notify += SGNET_SHIELDCHANGE;
      break;
  }
}
function selectWeapon(n: number): void {
  P().J.pInf.Attack = n;
  NG_AudioBeep(2);
  NG_HudLockTargetReset();
  g_SGGame.LockMAX = g_pShip[G.g_pCurrentGame.ship].wea[n - 1].lockTime;
}
function controlButtons(but: number): void {
  const player = P();
  if (but & 1 && !player.J.pInf.ShootOk) {
    const w = G.g_cShip.wea[player.J.pInf.Attack - 1];
    if (w.cur > 0) {
      if (NG_WeaponFire(player.J, player.J.pInf.Attack, G.g_pLockTarget)) { w.cur--; G.g_cGameStat.shooted++; player.Notify += SGNET_NEWSHOOT; }
    } else {
      player.J.pInf.Attack++;
      if (player.J.pInf.Attack > 6) player.J.pInf.Attack = 1;
      player.Mx.but |= 1 << (5 + player.J.pInf.Attack);
    }
  }
  if (player.Mx.but & (1 << 2)) { NG_AudioBeep(3); NG_HudLockTargetOn(); }
  if (player.Mx.but & (1 << 3)) { NG_AudioBeep(1); PlayPowerUp(); }
  if (player.Mx.but & (1 << 4) && !player.fBooster) { player.fBooster = 256; NG_AudioPlaySound(NG_AudioGetByName('turbo') - 1, 0); }
  const b2 = player.Mx.but;
  if (b2 <= 16 && b2 >= 0) return;
  if (b2 & (1 << 5)) {
    if (g_SGGame.MaxAim[O.NAV] && !g_SGSettings.DemoMode) { g_SGSettings.ComNumber = COM_NearBy; g_SGSettings.ComTime = MAX_COM_DELAY; }
    else {
      const bb = m.vec();
      const r = NG_AILocateNearestEnemy(m.Pos(player.Mat), bb, t_SPECIAL);
      if (r.OVI) {
        if ((r.di < 5000 || g_SGSettings.DemoMode) && O.NAV < O.MaxNAV - 1) {
          g_SGSettings.ComNumber = 0; g_SGSettings.ComTime = MAX_COM_DELAY;
          g_SGGame.CameraMode = CAMERA_NEWNAV;
          player.Notify += SGNET_HASWARP;
        } else { g_SGSettings.ComNumber = COM_TooFar; g_SGSettings.ComTime = MAX_COM_DELAY; }
      }
    }
    if (g_SGSettings.Cheater && O.NAV < O.MaxNAV) g_SGGame.CameraMode = CAMERA_NEWNAV;
    NG_DisplayWarp();
  }
  for (let n = 1; n <= 6; n++) if (b2 & (1 << (5 + n))) selectWeapon(n);
  if (b2 & (1 << 12)) { NG_AudioBeep(1); player.CurArt--; if (player.CurArt < 1) player.CurArt = MAX_POWERUP; }
  if (b2 & (1 << 13)) { NG_AudioBeep(1); player.CurArt++; if (player.CurArt > MAX_POWERUP) player.CurArt = 1; }
  if (O.FinCode !== GAMESTATE_DEAD) {
    if (b2 & (1 << 14) && g_SGGame.CameraMode) { g_SGGame.CameraMode = 0; NG_AudioBeep(3); }
    if (b2 & (1 << 15)) { g_SGGame.CameraMode++; NG_AudioBeep(3); if (g_SGGame.CameraMode > 4) g_SGGame.CameraMode = 1; }
    if (b2 & (1 << 16)) { g_SGGame.CameraMode--; NG_AudioBeep(3); if (g_SGGame.CameraMode < 1) g_SGGame.CameraMode = 4; }
    if (b2 & (1 << 17)) g_SGSettings.rearview ^= 1;
    if (b2 & (1 << 18)) O.FinCode = GAMESTATE_HELP;
    if (b2 & (1 << 19)) { g_SGGame.CameraMode = CAMERA_NAV; NG_AudioBeep(3); }
    if (b2 & (1 << 29)) { g_SGGame.CameraMode = CAMERA_MISSILE; NG_AudioBeep(3); }
    for (let n = 0; n < 8; n++) if (b2 & (1 << (21 + n))) setFormation(n);
  }
  if (b2 & (1 << 20)) O.FinCode = GAMESTATE_QUIT;
  if (b2 & (1 << 30) && !player.fBooster) { player.fBooster = -128; NG_AudioPlaySound(NG_AudioGetByName('turbo') - 1, 0); }
}

/** NG_DisplayWarp: when the aims of the NAV are done, says so and opens the warp at the last one */
export function NG_DisplayWarp(): void {
  if (g_SGGame.MaxAim[O.NAV] > 0 || g_SGGame.WarpOk) return;
  g_SGGame.WarpOk = 1;
  if (O.NAV < O.MaxNAV - 1) {
    g_SGSettings.ComNumber = COM_Complete; g_SGSettings.ComTime = MAX_COM_DELAY;
    if (O.NAV) { NG_AudioSay('ins02'); NG_AudioBeep(3); conPrint('Sector completed'); }
  } else {
    g_SGSettings.ComNumber = COM_FindWarp; g_SGSettings.ComTime = MAX_COM_DELAY;
    if (O.NAV) { NG_AudioSay('ins04'); conPrint('Mission completed'); NG_AudioBeep(3); }
    for (const OVI of g_SGGame.Scene!.OVI) {
      if (OVI.ORI?.type !== V3XOBJ_MESH) continue;
      const J = OVI.data as SGActor | null;
      if (J && J.pInf.Basename.includes('warp')) {
        J.pInf.Wait = 0; J.pInf.Shield = 100000;
        OVI.state &= ~V3XSTATE_HIDDEN;
        break;
      }
    }
  }
}

// ---------------------------------------------------------------- starfield
export const Starfield = { maxStars: 300, Zclip: 1000, Mx: 150, Stars: [] as Float32Array[], Prj: [[], []] as Float32Array[][] };
export function NG_StarfieldCreate(): void {
  Starfield.Stars = Array.from({ length: Starfield.maxStars }, () => m.vec());
  Starfield.Prj = [Array.from({ length: Starfield.maxStars }, () => m.vec()), Array.from({ length: Starfield.maxStars }, () => m.vec())];
}
function NG_StarfieldUpdate(): void {
  const player = P();
  const spid = Math.fround(player.J.pInf.fSpeed / 8);
  if ((g_SGGame.Count & 128) === 0) {
    const ct = Starfield.maxStars >> 1;
    Starfield.Mx = Math.min(Starfield.maxStars, Math.trunc(ct + (ct * 65536) / g_cTimer.fCounter));
  }
  const tmp = Starfield.Prj[1]; Starfield.Prj[1] = Starfield.Prj[0]; Starfield.Prj[0] = tmp;
  for (let i = 0; i < Starfield.Mx; i++) {
    const v = Starfield.Stars[i];
    const p1 = Starfield.Prj[0][i], p2 = Starfield.Prj[1][i];
    const W = m.vec();
    let Rs = 0, ToM = 0;
    transformProject(v, W);
    while (ToM < 16 && (W[2] >= 0 || W[2] < -Starfield.Zclip)) {
      NG_AIRandomAim(v, m.Pos(V3X.Camera.M), Starfield.Zclip);
      transformProject(v, W);
      Rs = 1; ToM++;
    }
    p1.set(W);
    if (Rs) p2.set(W);
    const x = p2[0] - p1[0], y = p2[1] - p1[1], z = p2[2] - p1[2];
    let d = x * x + y * y;
    if (d > spid * spid) {
      d = spid / Math.sqrt(d);
      p2[0] = p1[0] + x * d; p2[1] = p1[1] + y * d; p2[2] = p1[2] + z * d;
    }
    const p3x = (p1[0] + p2[0]) / 2, p3y = (p1[1] + p2[1]) / 2;
    // the hardware path: two lines p1 -> p3 (black to white) and p3 -> p2 (white to black)
    gradientLine(p1[0], p1[1], p3x, p3y, 0, 0, 0xffffff, 255);
    gradientLine(p3x, p3y, p2[0], p2[1], 0xffffff, 255, 0, 0);
  }
}

// ---------------------------------------------------------------- target boxes
function DrawBoxTarg(p: Float32Array, cx: number, OVI: OVI, pInf: SGScript): number {
  const a = m.vec();
  let Diam = OVI.ORI!.global_rayon;
  let disp = 0;
  if (Diam > 512) Diam = 512;
  if (transformProject(p, a)) {
    let sx = V3X.ViewPort.Focal / a[2];
    const sy0 = Diam * sx, sx0 = sy0 * V3X.ViewPort.Ratio;
    const i0 = { x: a[0] - sx0, y: a[1] - sy0 }, j0 = { x: i0.x, y: a[1] + sy0 }, k0 = { x: a[0] + sx0, y: j0.y }, l0 = { x: k0.x, y: i0.y };
    const s3x = (3 * sx0) / 4, s3y = (3 * sy0) / 4;
    const i1 = { x: a[0] - s3x, y: a[1] - s3y }, j1y = a[1] + s3y, k1x = a[0] + s3x;
    if (pInf.Locked === 0) {
      disp += ClippedLine(i0, { x: i1.x, y: i0.y }, cx);
      disp += ClippedLine(i0, { x: i0.x, y: i1.y }, cx);
      disp += ClippedLine(j0, { x: i1.x, y: j0.y }, cx);
      disp += ClippedLine(j0, { x: j0.x, y: j1y }, cx);
      disp += ClippedLine(k0, { x: k1x, y: k0.y }, cx);
      disp += ClippedLine(k0, { x: k0.x, y: j1y }, cx);
      disp += ClippedLine(l0, { x: k1x, y: l0.y }, cx);
      disp += ClippedLine(l0, { x: l0.x, y: i1.y }, cx);
    } else {
      disp += ClippedLine(i0, j0, cx);
      disp += ClippedLine(j0, k0, cx);
      disp += ClippedLine(k0, l0, cx);
      disp += ClippedLine(l0, i0, cx);
      const jx = a[0] - V3X.ViewPort.center[0], jy = a[1] - V3X.ViewPort.center[1];
      sx = V3X.ViewPort.center[0] / 4;
      g_szLockText[2] = pInf.Type === t_PLAYER && g_SGSettings.SerialGame ? pInf.Realname : null;
      let inf = 2;
      if (g_SGGame.LockMAX) {
        if (jx * jx + jy * jy < sx * sx) { pInf.Locked = 2; inf = 1; } else pInf.Locked = 1;
        if (pInf.Locked === 2) {
          let ox = pInf.LockTime, oy = pInf.LockTime;
          oy += 1 + (g_cTimer.iCounter >> 15);
          if (oy > g_SGGame.LockMAX) {
            oy = g_SGGame.LockMAX;
            if (ox < g_SGGame.LockMAX) G.g_SGLockMode.dmode |= 256;
            inf = 0;
          }
          ox = oy >= g_SGGame.LockMAX && g_SGSettings.cursor ? g_SGGame.CI_WHITE : cx;
          NG_DrawCircle(a, Math.trunc((oy * sy0) / g_SGGame.LockMAX), ox, 4);
          pInf.LockTime = oy & 255;
          disp = -1;
        }
      }
      if (disp) {
        const d = m.vec();
        m.dif(d, posOf(G.g_pLockTarget!), m.Pos(V3X.Camera.M));
        const L = G.g_SGLockMode;
        L.szText = (g_szLockText[inf] ?? ' ').slice(0, 31);
        L.dmode |= inf ? 2 : 1;
        L.color = cx;
        L.x = Math.trunc(i0.x); L.y = Math.trunc(i0.y); L.x0 = Math.trunc(l0.x); L.y0 = Math.trunc(l0.y);
        L.dist = Math.trunc(m.length(d) / 8) >>> 0;
        if (G.g_pCurrentGame.ship === 0) L.shield = Math.trunc((pInf.Shield * 100) / pInf.ShieldMax) >>> 0;
      }
    }
  }
  if (disp >= 0) {
    pInf.LockTime = disp !== 0 ? 1 : 0;
    if (disp === 0 && pInf.Locked === 2) pInf.Locked = 1;
  }
  return pInf.Locked;
}
/** AddingFaceMoreDisp (V3X.Setup.post_render): starfield and target boxes */
function AddingFaceMoreDisp(): void {
  if (g_SGSettings.bClearView) { g_SGSettings.bClearView = 0; return; }
  if (O.Nav.SpaceDebris) NG_StarfieldUpdate();
  for (const OVI of g_SGGame.Scene!.OVI) {
    if (!OVI.data) continue;
    const pInf = (OVI.data as SGActor).pInf;
    if (pInf.ModeX && pInf.ColorRadar !== 0 && pInf.ColorRadar !== 255) DrawBoxTarg(posOf(OVI), g_SGGame.pColorRadar[pInf.ColorRadar], OVI, pInf);
  }
}

export function NG_AISetTacticMode(): void {
  const T0 = O.defTarget;
  switch (O.CallMode[t_FRIEND]) {
    case ORDER_Attack: case ORDER_StayAlert: case ORDER_Retreat: T0[t_ENEMY] = posOf(O.NavCam!); break;
    case ORDER_TargetWeakest: case ORDER_TargetStrongest: T0[t_ENEMY] = m.Pos(P().Mat); break;
    case ORDER_AttackTarget: case ORDER_Protect:
      T0[t_ENEMY] = G.g_pLockTarget ? posOf(G.g_pLockTarget) : m.Pos(P().Mat);
      break;
  }
}
/** NG_InitAnimateStage */
export function NG_InitAnimateStage(): void {
  const Scene = g_SGGame.Scene!;
  const n = Scene.OVI.length;
  Scene.OVI.forEach((OVI, idx) => {
    if (!OVI.data) return;
    const J = OVI.data as SGActor;
    const i = n - idx; // counted down from numOVI
    J.pEffect = null;
    J.OVItarget = null;
    const pInf = J.pInf;
    if (pInf.Wait || pInf.Appear) OVI.state |= V3XSTATE_HIDDEN;
    if (pInf.Stealth) OVI.state |= V3XSTATE_HIDDENDISPLAY;
    pInf.fSpeed = pInf.fSpeedMax / 2;
    const TRI = OVI.TVI?.TRI ?? null;
    switch (pInf.Animation) {
      case t_TURN_AROUND_X: case t_TURN_AROUND_Y: case t_TURN_AROUND_Z: case t_TURN_RANDOM: OVI.matrix_Method = V3XMATRIX_Euler; break;
    }
    switch (pInf.Tactic) {
      case t_TAC_RANDOM_PATROL: case t_TAC_PATROL_FIGHT1: case t_TAC_TRACK: case t_TAC_HIND: case t_TAC_ATTACK1:
        OVI.matrix_Method = V3XMATRIX_Vector2; break;
    }
    if (J.pInf.Type !== t_ACCESSOIRE && OVI.matrix_Method === V3XMATRIX_Vector2 && J.Mv) {
      J.Mv.k = -1;
      J.Mv.Ang = ((i * 128) << 16) >> 16;
      if (pInf.Tactic === t_TAC_TRACK && TRI) {
        J.Mv.aim.set(kPos(TRI.keys[1]));
        m.dif(J.Mv.OldAim, kPos(TRI.keys[1]), kPos(OVI.Tk!));
        m.normalize(J.Mv.OldAim, J.Mv.OldAim);
      } else {
        J.Mv.aim.set(kPos(OVI.Tk!));
        J.Mv.OldAim.set(m.K(meshOf(OVI).matrix));
      }
      J.Mv.NewAim.set(J.Mv.OldAim);
      OVI.Tk!.set(J.Mv.OldAim, 0);
    }
    if (pInf.Replace) {
      const g = OVI.ORI!.name.indexOf('_');
      if (g >= 0) {
        const OVIp = Scene.OVI.find((o) => (o.ORI?.name ?? '').toLowerCase() === (G.g_pPlayerInfo[pInf.Replace].Basename + OVI.ORI!.name.slice(g)).toLowerCase());
        if (OVIp) OVIp.state |= V3XSTATE_HIDDEN;
      }
    }
  });
  V3X.Setup.add_lights = NG_AddMoreLights;
  O.defTarget[t_FRIEND] = m.Pos(P().Mat);
  NG_AISetTacticMode();
}

// ---------------------------------------------------------------- radar and HUD
function Line3D(x: number, y: number, z: number, x0: number, y0: number, z0: number, c: number, mat: Float32Array): void {
  const A = m.vec(), C = m.vec(x, y, z), pA = m.vec(), pB = m.vec();
  m.applyTransposeMatrix(A, C, mat); A[2] -= g_SGGame.RadarRange * 3;
  if (A[2] < 0) projectWC(pA, A);
  C.set([x0, y0, z0]);
  m.applyTransposeMatrix(A, C, mat); A[2] -= g_SGGame.RadarRange * 3;
  if (A[2] < 0) projectWC(pB, A);
  gi.drawAnyLine(Math.trunc(pA[0]), Math.trunc(pA[1]), Math.trunc(pB[0]), Math.trunc(pB[1]), c);
}
function projectWC(R: Float32Array, A: Float32Array): void {
  R[2] = 1 / A[2];
  const sx = V3X.ViewPort.Focal * R[2];
  R[1] = V3X.ViewPort.center[1] - A[1] * sx;
  R[0] = V3X.ViewPort.center[0] + A[0] * (sx * V3X.ViewPort.Ratio);
}
function Display_Radar(): void {
  const player = P();
  const g = G.g_pCurrentGame.ship === 2;
  const H2 = G.g_pspHud2;
  const pt2 = { x: 0, y: 0 }, pt3 = { x: 0, y: 0 };
  const nearest = m.vec(0, 0, g_SGGame.RadarRange);
  const oldView = { ...GX.View };
  let but = G.g_pGameBoard.item[VCfg_win_radar];
  g_SGGame.MaxDetect[0] = g_SGGame.MaxDetect[1] = 0;
  if (!g_SGGame.RadarMode) {
    if (g) {
      const b38 = G.g_pGameBoard.item[38];
      pt3.x = (b38.LX + b38.X - H2.item[1].LX) >> 1;
      pt3.y = (b38.LY + b38.Y - H2.item[1].LY) >> 1;
    }
    but = G.g_pGameBoard.item[VCfg_win_radar];
    GX.View.xmin = but.X; GX.View.xmax = but.X + but.LX; GX.View.ymin = but.Y; GX.View.ymax = but.Y + but.LY;
    pt2.x = (GX.View.xmax + GX.View.xmin - H2.item[1].LX) >> 1;
    pt2.y = (GX.View.ymax + GX.View.ymin - H2.item[1].LY) >> 1;
  } else {
    const z0 = g_SGGame.RadarRange, r = z0;
    let x0 = 0, y0 = 0;
    Line3D(0, 0, -z0, 0, 0, z0, g_SGGame.CI_BLUE, player.Mat);
    Line3D(0, -z0, 0, 0, z0, 0, g_SGGame.CI_BLUE, player.Mat);
    Line3D(-z0, 0, 0, z0, 0, 0, g_SGGame.CI_BLUE, player.Mat);
    for (let i = 0; i <= 32; i++) {
      const x1 = r * m.sin16(i << 7), y1 = r * m.cos16(i << 7);
      if (i) {
        Line3D(x1, y1, 0, x0, y0, 0, g_SGGame.CI_BLUE, player.Mat);
        Line3D(x1, 0, y1, x0, 0, y0, g_SGGame.CI_BLUE, player.Mat);
        Line3D(0, x1, y1, 0, x0, y0, g_SGGame.CI_BLUE, player.Mat);
      }
      x0 = x1; y0 = y1;
    }
  }
  const z0 = m.Pos(player.Mat)[2];
  for (const OVI of g_SGGame.Scene!.OVI) {
    const Data = OVI.data as SGActor | null;
    if (!Data) continue;
    if (!(OVI === O.NavCam || ((OVI.state & V3XSTATE_HIDDEN) === 0 && (OVI.state & V3XSTATE_CULLEDOFR) === 0 && (OVI.state & V3XSTATE_HIDDENDISPLAY) === 0))) continue;
    if (Data.pInf.ColorRadar <= 0) continue;
    const dir = m.vec(), di2 = m.vec();
    m.dif(dir, posOf(OVI), kPos(player.Rot));
    const Rad = Data.pInf.ColorRadar === 255 ? 5 : ((Data.pInf.ColorRadar - 1) % 5) + 1;
    if (g_SGGame.RadarMode) {
      m.applyTransposeMatrix(di2, dir, player.Mat);
      CSP_Color(g_SGGame.CI_WHITE);
      if (Math.abs(di2[2]) < nearest[2] || Data.pInf.Locked) nearest.set(di2);
      di2[2] -= g_SGGame.RadarRange * 4;
      if (di2[2] < 0) {
        const pt = m.vec();
        projectWC(pt, di2);
        csp.put(Math.trunc(pt[0]), Math.trunc(pt[1]), H2.item[Rad]);
        g_SGGame.MaxDetect[0]++;
      }
    } else {
      di2[2] = m.dot(dir, m.K(V3X.Camera.M));
      if (di2[2] <= 0) {
        CSP_Color(g_SGGame.CI_WHITE);
        if (m.length(dir) > m.CST_EPSILON) m.normalize(dir, dir); else m.set(dir, 0, 0, 1);
        di2[0] = m.dot(dir, m.I(V3X.Camera.M));
        di2[1] = m.dot(dir, m.J(V3X.Camera.M));
        const px = pt2.x + di2[0] * ((but.LX >> 1) - 4), py = pt2.y - di2[1] * ((but.LY >> 1) - 4);
        if (px > 0 && py > 0) csp.put(Math.trunc(px), Math.trunc(py), H2.item[Rad]);
        g_SGGame.MaxDetect[0]++;
      }
      if (g) {
        const b38 = G.g_pGameBoard.item[38];
        if (di2[2] > 0) {
          CSP_Color(g_SGGame.CI_WHITE);
          m.normalize(dir, dir);
          di2[0] = m.dot(dir, m.I(V3X.Camera.M));
          di2[1] = m.dot(dir, m.J(V3X.Camera.M));
          const px = pt3.x + di2[0] * ((b38.LX >> 1) - 4), py = pt3.y - di2[1] * ((b38.LY >> 1) - 4);
          if (px > 0 && py > 0) csp.put(Math.trunc(px), Math.trunc(py), H2.item[Rad]);
          g_SGGame.MaxDetect[1]++;
        }
      }
    }
  }
  m.Pos(player.Mat)[2] = z0;
  CSP_Color(g_SGGame.CI_WHITE);
  if (g_SGGame.RadarMode && nearest[0] * nearest[0] + nearest[1] * nearest[1] > 1024 * 1024) {
    let sp: Sprite;
    if (Math.abs(nearest[0]) > Math.abs(nearest[1])) sp = nearest[0] < 0 ? H2.item[16] : H2.item[18];
    else sp = nearest[1] > 0 ? H2.item[17] : H2.item[15];
    csp.put(Math.trunc(V3X.ViewPort.center[0]) - (sp.LX >> 1), Math.trunc(V3X.ViewPort.center[1]) - (sp.LY >> 1), sp);
  }
  Object.assign(GX.View, oldView);
}
function info_weapon(val: number, defc: number, but: { X: number; Y: number }, l: number): void {
  DrawTextC(`${String(val).padStart(2, '0')}~ ${l}`, but.X, but.Y, defc, 0xff, G.g_pspCat, csp.put);
}
function HotPowerBar(x: number, y: number, val: number, max: number): void {
  const sp = G.g_pspHud2.item[12];
  let mm = Math.trunc((val * 12) / max);
  const lx = sp.LX - 4;
  if (mm > 12) mm = 12;
  for (let i = 0; i < mm; i++, x += lx) csp.put(x, y, sp);
}
const p2 = (n: number, w: number): string => { const s0 = String(Math.trunc(n)); const neg = s0.startsWith('-'); const d = neg ? s0.slice(1) : s0; return (neg ? '-' : '') + d.padStart(neg ? w - 1 : w, '0'); };
function Display_HUD(): void {
  const player = P(), pInf = player.J.pInf, L = G.g_SGLockMode, B = G.g_pGameBoard, H = G.g_pspHud, H2 = G.g_pspHud2;
  if (L.dmode & 32) {
    const b2 = B.item[VCfg_sp_rear];
    csp.put(b2.X, b2.Y, H.item[VCfg_sp_rear]);
    csp.TrspADD(B.item[34].X, B.item[34].Y, H2.item[13]);
  }
  if (L.dmode & 31) {
    CSP_Color(g_SGGame.CI_WHITE);
    csp.put(B.item[VCfg_sp_camis].X, B.item[VCfg_sp_camis].Y, H.item[VCfg_sp_camis]);
    csp.TrspADD(B.item[35].X, B.item[35].Y, H2.item[13]);
    if (L.dmode & 3) {
      L.dmode &= ~3;
      CSP_Color(L.color);
      WriteText(L.szText, L.x, L.y - G.g_pspCat.item[0].LY - 1, G.g_pspCat);
      WriteText(`${Math.trunc(L.dist / 10)} m`, L.x0 + 2, L.y0, G.g_pspCat);
      if (G.g_pCurrentGame.ship === 0) {
        CSP_Color(L.shield < 25 ? g_SGGame.CI_RED : g_SGGame.CI_GREEN);
        WriteText(`${L.shield} %`, L.x0 + 2, L.y0 + G.g_pspCat.item[0].LY + 1, G.g_pspCat);
      }
    }
  }
  const mcount = g_SGSettings.showInf & 1 ? B.numItem : 1;
  for (let x = 0; x < mcount; x++) {
    const sp = H.item[x];
    CSP_Color(g_SGGame.CI_WHITE);
    const but = B.item[x];
    const xxx = but.X + g_SGGame.Shock;
    switch (x) {
      case 0:
        if (!g_SGGame.RadarMode) {
          const dx = m.vec();
          m.dif(dx, kPos(O.NavCam!.Tk!), m.Pos(V3X.Camera.M));
          csp.put(xxx, but.Y, sp);
          WriteText(p2(g_SGGame.MaxAim[O.NAV], 2), B.item[24].X, B.item[24].Y, G.g_pspCat);
          WriteText(p2(m.length(dx), 6), B.item[25].X, B.item[25].Y, G.g_pspCat);
          WriteText(p2(player.Mv.x, 3), B.item[26].X, B.item[26].Y, G.g_pspCat);
          WriteText(p2(player.Mv.y, 3), B.item[27].X, B.item[27].Y, G.g_pspCat);
        }
        break;
      case 1: csp.put(xxx, but.Y, sp); break;
      case 21: csp.pset(xxx, but.Y, H2.item[5 + player.CurArt]); break;
      case 11: WriteText(p2((pInf.Shield * 100) / pInf.ShieldMax, 3), xxx, but.Y, G.g_pspCat); break;
      case 9: WriteText(p2((pInf.fSpeed * 100) / pInf.fSpeedMax, 3), xxx, but.Y, G.g_pspCat); break;
      case 12: {
        const tex = `${Math.trunc(O.Time / 60)}${V3X.Time.ms % 1000 < 500 ? ':' : ' '}${p2(O.Time % 60, 2)}`;
        if (O.IsTimed) {
          const Pig = G.g_pspMsg;
          const glyph = (c: string): Sprite => (c === ':' || c === ' ' ? G.g_pFontMenuLrg.item[39] : Pig.item[c.charCodeAt(0) - 48 + 2]);
          let ox = 0;
          for (const c of tex) ox += glyph(c).LX;
          ox = (GX.View.xmax - ox) >> 1;
          for (const c of tex) {
            const osp = glyph(c);
            if (c !== ' ') csp.TrspADD(ox, GX.View.ymax >> 2, osp);
            ox += osp.LX;
          }
          if (O.Time < 30 && g_SGGame.Count & 4) CSP_Color(g_SGGame.CI_YELLOW);
          if (O.Time < 10 && g_SGGame.Count & 4) CSP_Color(g_SGGame.CI_RED);
        }
        WriteText(tex, xxx, but.Y, G.g_pspCat);
        break;
      }
      case 22: WriteText(p2(player.Art[player.CurArt].val, 2), xxx, but.Y, G.g_pspCat); break;
      case 23: WriteText(p2(player.Art[player.CurArt].Time_val >> 5, 2), xxx, but.Y, G.g_pspCat); break;
      case 13: case 14: case 15: case 16: case 17: case 18:
        info_weapon(G.g_cShip.wea[x - 13].cur, pInf.Attack === x - 12 ? g_SGGame.CI_YELLOW : g_SGGame.CI_WHITE, { X: but.X, Y: but.Y }, x - 12);
        break;
      case 2: csp.put(xxx, but.Y, sp); break;
      case 8: HotPowerBar(xxx, but.Y, Math.trunc(pInf.fSpeed), Math.trunc(pInf.fSpeedMax)); break;
      case 3: csp.put(xxx, but.Y, sp); break;
      case 10: HotPowerBar(xxx, but.Y, pInf.Shield, pInf.ShieldMax); break;
      case 4: if (!g_SGGame.RadarMode) csp.put(xxx, but.Y, sp); break;
      case 36: case 37: case 38: case 40: {
        let act = 0;
        const ship = G.g_pCurrentGame.ship;
        if (ship === 0) act = x === 36 ? 2 : x === 37 ? 1 : x === 38 ? 3 : 0;
        else if (ship === 1) act = x === 36 ? 2 : x === 37 ? 3 : 0;
        else if (ship === 2) act = x === 36 || x === 38 ? 2 : x === 37 ? 4 : x === 40 ? 3 : 0;
        switch (act) {
          case 2:
            if (!g_SGGame.RadarMode) { CSP_Color(rgb(255, 255, 255)); csp.TrspADD(xxx, but.Y, H2.item[14]); }
            break;
          case 3: {
            but.X = (GX.View.xmax - 6 * (but.LX - 1)) >> 1;
            let xx = xxx;
            for (let cc = 0; cc < 6; cc++, xx += but.LX - 1) csp.pset(xx, but.Y, H2.item[19 + (cc << 1) + (pInf.Attack !== cc + 1 ? 1 : 0)]);
            break;
          }
          case 4: if (!g_SGGame.RadarMode) csp.put(xxx, but.Y, H.item[8]); break;
        }
        break;
      }
      case 7: if (g_SGGame.ComMode) csp.put(xxx, but.Y, sp); break;
      case 30:
        if (g_SGGame.ComMode) {
          let y = but.Y;
          for (let i = 0; i < 8; i++, y += G.g_pspCat.item[0].LY + 1) {
            CSP_Color(i !== O.CallMode[t_FRIEND] ? g_SGGame.CI_WHITE : g_SGGame.CI_YELLOW);
            WriteText(T(szOrder[i]), xxx, y, G.g_pspCat);
          }
        }
        break;
      case 33: if (!g_SGGame.RadarMode) WriteText(p2(g_SGGame.MaxDetect[0], 2), xxx, but.Y, G.g_pspCat); break;
      case 39: if (!g_SGGame.RadarMode) WriteText(p2(g_SGGame.MaxDetect[1], 2), xxx, but.Y, G.g_pspCat); break;
    }
  }
  CSP_Color(g_SGGame.CI_WHITE);
  if (g_SGGame.MaxAim[O.NAV] === 0 && O.NAV < O.MaxNAV - 1) {
    const b = m.vec();
    const r = NG_AILocateNearestEnemy(m.Pos(player.Mat), b, t_SPECIAL);
    if (r.OVI && r.di < 5000) {
      const sp = G.g_pspMsg.item[1];
      csp.TrspADD((GX.View.xmax - sp.LX) >> 1, GX.View.ymax - sp.LY * 2, sp);
    }
  }
  CSP_Color(g_SGGame.CI_WHITE);
  if (G.g_cFXTable.Alarm & g_SGSettings.cursor) {
    const sp = G.g_pspMsg.item[0];
    csp.TrspADD((GX.View.xmax - sp.LX) >> 1, 6, sp);
  }
}
function NG_DrawHUD(): void {
  const dy = G.g_pspDispFont.item[0].LY + 2;
  let y = G.g_pCurrentGame.ship !== 0 ? GX.View.ymax >> 3 : GX.View.ymax - (GX.View.ymax >> 2);
  const font = G.g_pspDispFont;
  CSP_Color(g_SGGame.CI_WHITE);
  if (g_SGSettings.Ctrl === CTRL_Mouse && g_SGSettings.DemoMode < 2 && g_SGGame.CameraMode < CAMERA_NAV && !g_SGSettings.AltMouse) {
    csp.put(sMOU.x, sMOU.y, G.g_pspHud2.item[0]);
  }
  NG_HudDisplayCamera();
  if (chat.isType) WriteCenterText(`:${chat.Code}${g_SGSettings.cursor ? '_' : ' '}`, Math.trunc(GX.View.ymax / 3), G.g_pspCat);
  if (g_SGSettings.ComTime === MAX_COM_DELAY) {
    if (O.FinCode === GAMESTATE_FAIL) O.FinCode = GAMESTATE_FAILED;
    if (g_pComFunction) conPrint(`${g_pComFunction.szTitle}: ${g_pComFunction.Val[g_pComFunction.ptr()]}`);
  }
  if (g_SGSettings.ComFTime && g_pComFunction) {
    g_SGSettings.ComFTime--;
    WriteCenterText(g_pComFunction.szTitle, (y += dy), font);
    WriteCenterText(g_pComFunction.Val[g_pComFunction.ptr()], (y += dy), font);
  }
  if (g_SGSettings.ComTime) {
    const orx = comText(g_SGSettings.ComNumber);
    g_SGSettings.ComTime--;
    CSP_Color(g_SGGame.CI_WHITE);
    WriteCenterText(orx, (y += dy), font);
  } else if (O.FinCode === GAMESTATE_FAIL) O.FinCode = GAMESTATE_FAILED;
  if (g_SGSettings.DemoMode && g_SGSettings.cursor && g_SGSettings.DemoMode >= 2) WriteCenterText('Demo', (y += dy), font);
  if (O.IsTimed) {
    if (O.Time === 10) { g_SGSettings.ComNumber = COM_TimeShort; g_SGSettings.ComTime = MAX_COM_DELAY; }
    if (timer_sec() - g_SGGame.oldTimer) {
      O.Time--;
      g_SGGame.oldTimer = timer_sec();
      if (O.Time === 0) { g_SGSettings.ComNumber = COM_Failed; g_SGSettings.ComTime = MAX_COM_DELAY; O.FinCode = GAMESTATE_FAIL; }
    }
  }
  if (g_SGGame.CameraMode === 0) {
    if (g_SGSettings.showInf & 1 && g_SGGame.MaxAim[O.NAV] === 0) {
      if (O.NAV === O.MaxNAV - 1) WriteCenterText('Mission Complete', (y += dy), font);
      else WriteCenterText(T(39), (y += dy), font);
    }
    Display_HUD();
    if (g_SGSettings.showInf & 1 || g_SGGame.RadarMode) Display_Radar();
    if (P().mode & TURBOMODE) WriteCenterText('Turbo', (y += dy), font);
  } else if (g_SGSettings.cursor) {
    const t = szCamera[g_SGGame.CameraMode];
    WriteCenterText(t === undefined || t < 0 ? ' ' : T(t), (y += dy), font);
  }
}
export function NG_DrawFlash(): void {
  if (!g_SGGame.FlashAlpha) return;
  if (g_SGGame.FlashAlpha > 0) g_SGGame.FlashAlpha--;
  if (g_SGGame.FlashAlpha < 0) g_SGGame.FlashAlpha++;
  GX.csp_cfg.alpha = Math.min(255, Math.abs(g_SGGame.FlashAlpha * 8));
  CSP_Color(rgb(...g_SGGame.FlashColor));
  gi.drawShadedRect(0, 0, GX.View.lWidth - 1, GX.View.lHeight - 1);
}
function NG_DrawOverlay(): void {
  NG_FXDraw();
  if (g_SGSettings.LensFX) NG_FXFlare();
  if (!(g_SGSettings.showInf & 2)) NG_DrawHUD();
  if (g_SGGame.Shock) {
    V3X.ViewPort.center[0] += g_SGGame.Shock;
    g_SGGame.Shock = (-g_SGGame.Shock) >> 1;
  }
  NG_DrawFlash();
}
function NG_UpdateAlarmAndLock(): void {
  const T0 = G.g_cFXTable, pInf = P().J.pInf;
  if (pInf.Shield < Math.trunc(pInf.ShieldMax / 4)) {
    if (!T0.Alarm) { T0.Alarm = NG_AudioPlaySound(T0.SoundAlarm, 0); T0.fAlarmTime = 255; }
    else if (T0.fAlarmTime > 0) {
      T0.fAlarmTime = f32(T0.fAlarmTime - g_cTimer.fCounter);
      if (T0.fAlarmTime <= 0) NG_AudioStopSound(T0.Alarm);
    }
  } else if (T0.Alarm) { NG_AudioStopSound(T0.Alarm); T0.Alarm = 0; }
  if (G.g_SGLockMode.dmode & 256) { NG_AudioBeep(3); G.g_SGLockMode.dmode &= ~256; }
}

// ---------------------------------------------------------------- the small 3D views (lt_st2.c)
function NG_RenderDisplayBox(but: { X: number; Y: number; LX: number; LY: number }, Mat: Float32Array, only: OVI | null): void {
  renderView({ xmin: but.X, ymin: but.Y, xmax: but.X + but.LX, ymax: but.Y + but.LY }, Mat, only);
}
function NG_HudDisplayRear(): void {
  const Cam = Float32Array.from(V3X.Camera.M);
  m.neg(m.K(Cam));
  m.cross(m.I(Cam), m.J(Cam), m.K(Cam));
  NG_RenderDisplayBox(G.g_pGameBoard.item[VCfg_win_rear], Cam, null);
}
function NG_HudDisplayLocked(OVI: OVI | null): number {
  const but = G.g_pGameBoard.item[VCfg_win_camis];
  if (g_SGGame.CameraMode) return 0;
  let Cam: Float32Array;
  if (g_SGGame.Missile) {
    Cam = Float32Array.from(G.g_mtxMissile);
    g_SGGame.Missile.state |= V3XSTATE_HIDDEN;
    OVI = null;
  } else {
    Cam = Float32Array.from(V3X.Camera.M);
    const rz = OVI!.ORI!.global_rayon * 2;
    m.polarSet(m.Pos(Cam), posOf(OVI!), rz, g_SGGame.Count * 16, g_SGGame.Count * 8);
    const retrait = m.vec();
    m.dif(retrait, m.Pos(Cam), posOf(OVI!));
    m.buildFromVector(Cam, retrait, 0);
  }
  NG_RenderDisplayBox(but, Cam, OVI);
  if (g_SGGame.Missile) g_SGGame.Missile.state &= ~V3XSTATE_HIDDEN;
  return 0;
}
function NG_HudDisplayCamera(): void {
  let p = 0;
  if (g_SGSettings.rearview) p |= 1;
  if (G.g_pLockTarget && (GX.View.ymax > 100 || g_SGGame.Missile)) p |= 2;
  G.g_SGLockMode.dmode &= ~(8 + 16 + 32);
  if (p) {
    if (p & 2 && (G.g_pLockTarget!.state & V3XSTATE_HIDDEN) === 0) {
      g_SGSettings.bClearView = 1;
      if (NG_HudDisplayLocked(G.g_pLockTarget)) { p |= 8; G.g_SGLockMode.dmode |= 8; }
      G.g_SGLockMode.dmode |= 16;
      p |= 4;
    }
    if (p & 1) {
      g_SGSettings.bClearView = 1;
      NG_HudDisplayRear();
      G.g_SGLockMode.dmode |= 32;
      p |= 4;
    }
  }
  g_SGSettings.bClearView = 0;
}
/** NG_DrawTicker: frames and polygons per second (the "/ticker" console command) */
const prof = { frame: 0, fps: 0, time: 0 };
function NG_DrawTicker(): void {
  prof.frame++;
  if (timer_ms() - prof.time > 2000) { prof.fps = prof.frame >> 1; prof.frame = 0; prof.time = timer_ms(); }
  CSP_Color(g_SGGame.CI_WHITE);
  WriteCenterText(`${prof.fps} fps 0 pps`, GX.View.ymax - 20, G.g_pSmallFont);
}

/** NG_AudioPlayWarp: the warp out of a won mission, five seconds of fading to white */
async function NG_AudioPlayWarp(): Promise<void> {
  playWarpMusic();
  g_SGGame.FlashAlpha = 0;
  const t = timer_ms();
  do {
    if (STUB_TaskControl()) break;
    g_SGGame.FlashColor = [g_SGGame.FlashAlpha & 255, g_SGGame.FlashAlpha & 255, g_SGGame.FlashAlpha & 255];
    NG_RenderView();
    NG_DrawFlash();
    await Flip();
    g_SGGame.FlashAlpha += 4;
    if (g_SGGame.FlashAlpha > 255) g_SGGame.FlashAlpha = 255;
  } while (timer_ms() < t + 5000);
  stopWarpMusic();
}

/** NG_GamePlay: the mission's loop */
export async function NG_GamePlay(waitForKey: (s0: number) => Promise<void>): Promise<void> {
  const player = P();
  viewportBuild(g_SGGame.Scene!);
  G.g_cGameStat.time_start = timer_sec();
  V3X.Time.ms = g_nOldTimer = timer_ms();
  timer_Update();
  g_SGGame.FlashAlpha = 32;
  g_SGGame.FlashColor = [0, 0, 0];
  conPrint(G.g_pGameItem[G.g_pCurrentGame.episode].LI[G.g_pCurrentGame.level[G.g_pCurrentGame.episode]].name);
  do {
    if (STUB_TaskControl()) break;
    g_SGSettings.bClearView = 0;
    NG_RenderView();
    NG_DrawOverlay();
    if (g_SGSettings.ticker) NG_DrawTicker();
    if (conIsActive()) conRender();
    NG_ControlGame();
    NG_UpdateCamera();
    NG_FXUpdate();
    NG_FXUpdateEx();
    NG_UpdatePowerUps();
    NG_LevelUpdate();
    NG_UpdateLights();
    NG_UpdateAlarmAndLock();
    NG_UpdateCom();
    viewportBuild(g_SGGame.Scene!);
    viewportSetup();
    NG_WeaponUpdate();
    switch (O.FinCode) {
      case GAMESTATE_ABORT: case GAMESTATE_RETRY: case GAMESTATE_FAILED: case GAMESTATE_WON: O.quit = 1; break;
    }
    if (O.FinCode === GAMESTATE_QUIT && (await NG_QuitGame())) O.quit = 1;
    if (O.FinCode === GAMESTATE_HELP) {
      if (g_SGSettings.DemoMode) O.quit = 1; else await ShowHelp();
      O.FinCode = 0;
    }
    if (!O.quit) {
      if (g_SGSettings.DemoMode) NG_RecordReplayAction(); else player.Mx.but = 0;
      V3X.Time.ms = timer_ms();
      g_SGGame.Count++;
      g_SGSettings.cursor = (g_SGGame.Count & 15) === 0 ? 2 : (g_SGGame.Count & 15) < 8 ? 1 : 0;
      await Flip();
    }
  } while (O.quit === 0);
  NG_AudioStopSound(G.g_cFXTable.Engine);
  G.g_cGameStat.time_end = timer_sec();
  if (O.FinCode === GAMESTATE_WON && !g_SGSettings.DemoMode) {
    G.g_pCurrentGame.score = player.J.pInf.Scoring >>> 0;
    player.Notify += SGNET_HASWON;
    await NG_AudioPlayWarp();
  } else {
    if (O.FinCode === GAMESTATE_DEAD) await waitForKey(2);
    player.Notify += SGNET_HASLEFT;
  }
  if (g_SGSettings.DemoMode) O.FinCode = GAMESTATE_DEAD;
  void SGNET_HASRESPAWN; void NG_InitGameShip; void sysRand; void worldPos; void matrixOf; void cameraSelect; void kTarget;
  void V3XMATRIX_Vector; void t_FIXE; void t_GIANT; void STEALTHMODE; void comText; void sKEY_IsHeld; void sMOU_IsHeld; void sKEY;
  void NG_AudioKickSound; void (null as unknown as Mesh); void picture;
}
