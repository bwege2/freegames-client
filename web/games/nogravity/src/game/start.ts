// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): starting and stopping a mission (src/lt_start.c): the
// scene and its objects as the mission script says, the NAV points, the HUD of the ship, the loading screen.
import * as m from '../v3x/math.ts';
import {
  V3X, View, validate, verify, viewportSetup, oviByName, cameraByName, cameraSelect, meshOf, clNewFromMesh, plugCollisionMove,
  V3XOPTION_COLLISION, V3XOPTION_TRUECOLOR,
} from '../v3x/scene.ts';
import {
  type OVI, type Mesh, type Light, parseVmx, kPos, V3XOBJ_MESH, V3XOBJ_LIGHT, V3XMATRIX_Custom, V3XSTATE_HIDDEN,
  V3XSTATE_CULLNEVER, V3XSTATE_MATRIXUPDATE, V3XSTATE_GIANT, V3XCMODE_REFLEX, V3XCMODE_NOFEEDBACK, V3XCMODE_DONTMOVE,
  V3XCMODE_INVERTCONDITION, V3XCMODE_DONOTTESTSAMEID, V3XBLENDMODE_ADD, V3XMESH_NOZSHADING,
} from '../v3x/vmx.ts';
import { GX, csp, gi, CSP_Color, rgb, WriteCenterText, type Sprite } from '../gx/gx.ts';
import { fileGet, Flip, timer_Start, g_cTimer, sysRand } from '../sys/sys.ts';
import { loadBackground, loadSpriteGroup, interfaceFromSpc, stageReadFile, T } from './data.ts';
import { NG_AudioGetByName, NG_AudioPlayMusic, NG_AudioStopSound, NG_AudioStopTrack, channelGetFree } from './sound.ts';
import { NG_FXLoadData, NG_FXGetByName, NG_ChangeGameDetail, NG_FXSetSceneShading } from './fx.ts';
import { NG_WeaponCreate } from './weapons.ts';
import { NG_ColorToNAV } from './ai.ts';
import { NG_DisplayWarp, NG_AISetTacticMode, NG_InitAnimateStage, NG_GamePlay } from './play.ts';
import { NG_DrawBackgroundPic } from './video.ts';
import { loadEpisodeData, prepareScene, releaseScene } from './render.ts';
import { replayLoad } from './replay.ts';
import {
  G, g_SGGame, g_SGSettings, g_pShip, newActor, newPlayer, newScript, copyShip, type SGActor, type SGWeapon, type RWInterface,
  MAX_WEAPONS, MAX_ENEMYS, t_SPECIAL, t_ENEMY, t_PIRAT, t_OBSTACLE, t_FRIEND, t_DECOR, t_ACCESSOIRE, t_PLAYER, t_MPLAYER,
  t_CS_BONUS, t_CS_BUMP, t_CS_BUMP_LOSE_SHIELD, t_COL_AUTOSPHERE, t_COL_AUTOSPHERE2, ORDER_Attack, GAMESTATE_PLAY, CAMERA_START,
} from './state.ts';

const O = G.g_SGObjects;

/** NG_ResizeInterface: places the HUD zones (the 640x480 screen: only the right-aligned ones move) */
function NG_ResizeInterface(I: RWInterface): void {
  const xmax = GX.View.xmax, ymax = GX.View.ymax, ymin = GX.View.ymin;
  I.item.forEach((b, i) => {
    if (b.parent) return;
    const but = { ...b };
    if (b.Y + but.LY > ymax) b.Y = ymax - but.LY;
    if (b.Y < ymin) b.Y = ymin;
    switch (i) {
      case 0: b.X = (GX.View.lWidth - but.LX) >> 1; b.Y = (GX.View.lHeight - but.LY) >> 1; break;
      case 3: case 5: b.X = xmax - but.LX; break;
      case 4: if (G.g_pCurrentGame.ship !== 0) b.X = xmax - but.LX; break;
    }
  });
  for (const b of I.item) if (b.parent) { b.X = b.parent.X + b.X; b.Y = b.parent.Y + b.Y; }
}
/** NG_LoadGameInterface: int\v<ship>_sprit and its zones, with the hierarchy I_normal_Hie */
function NG_LoadGameInterface(): void {
  const Hie = [255, 255, 255, 255, 255, 255, 255, 255, 2, 2, 3, 3, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 5, 6, 7, 6, 6, 4, 5, 6, 4, 255, 37, 37, 255];
  G.g_pspHud = loadSpriteGroup(`v${G.g_pCurrentGame.ship + 1}_sprit`, 64);
  const I = interfaceFromSpc(`int/v${G.g_pCurrentGame.ship + 1}_zones.spc`);
  I.item.forEach((but, i) => {
    const p = Hie[i] ?? 0; // the table has 41 entries; zones beyond read what follows it in memory (0 here)
    if (p < 255) { const root = I.item[p]; but.X -= root.X; but.Y -= root.Y; but.parent = root; }
    else but.parent = null;
  });
  NG_ResizeInterface(I);
  G.g_pGameBoard = I;
}

/** NG_DrawLoadingScreen */
function NG_DrawLoadingScreen(): void {
  csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
  WriteCenterText(g_SGSettings.DemoMode ? 'Demo' : G.g_pGameItem[G.g_pCurrentGame.episode].LI[G.g_pCurrentGame.level[G.g_pCurrentGame.episode]].name, GX.View.ymax - 26, G.g_pFontMenuSml);
}
async function NG_PlayLoadingScreen(): Promise<void> {
  await NG_DrawBackgroundPic('menu/load.png', -1);
  for (let i = 0; i < 256; i += 4) {
    const j = i === 255 - 4 ? 255 : i;
    CSP_Color(rgb(j, j, j));
    NG_DrawLoadingScreen();
    await Flip();
  }
}
/** NG_DrawLoadingBar: the red bar under the loading picture */
async function NG_DrawLoadingBar(step: number): Promise<void> {
  const lw = Math.trunc((7 * GX.View.lWidth) / 8), x = (GX.View.lWidth - lw) >> 1;
  const p = Math.trunc((lw * step) / 100);
  csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
  NG_DrawLoadingScreen();
  gi.drawWiredRect(x, GX.View.ymax - 10, x + lw, GX.View.ymax, 0);
  for (let i = 0; i < p; i++) {
    const r = Math.trunc((180 * i) / lw) & 255;
    gi.drawVerticalLine(i + x, GX.View.ymax - 10, 10, rgb(r, 0, 0));
  }
  await Flip();
}

/** NG_DrawExtra: the OpenGL build's look of the scene's lights and materials */
function NG_DrawExtra(): void {
  const Scene = g_SGGame.Scene!;
  let i = Scene.OVI.length;
  for (const OVI of Scene.OVI) {
    const ORI = OVI.ORI!;
    if (ORI.type === V3XOBJ_LIGHT) {
      const l = OVI.node as Light;
      l.intensity = 255; l.type = 2; l.flags = 1; l.color = [255, 255, 255, l.color[3]]; l.range = V3X.Light.fogDistance;
    }
    if (ORI.type === V3XOBJ_MESH && ORI.node) {
      const mesh = meshOf(OVI);
      for (const Mat of mesh.material) {
        Mat.scale = 255;
        const n = Mat.mat_name.toLowerCase();
        if (n === 'reacteurs' && OVI === G.g_pPlayer.J.OVI) g_SGGame.pReactorMaterial = Mat;
        if (!Mat.info.Shade) Mat.diffuse = [255, 255, 255];
        if (Mat.info.Transparency) { Mat.info.Transparency = V3XBLENDMODE_ADD; Mat.alpha = 200; }
        // V3XOPTION_TRUECOLOR and VisualsFx > 1 (the default 4): the 3D engine's improvements
        if (V3X.Setup.flags & V3XOPTION_TRUECOLOR && g_SGSettings.VisualsFx > 1) {
          if (n === 'aster01') { Mat.info.Shade = 2; mesh.flags |= 2; }
          if (n === 'tir1') { Mat.info.Transparency = V3XBLENDMODE_ADD; Mat.diffuse = [255, 255, 255]; Mat.alpha = 128; }
          else if (n === 'warp') { Mat.info.Transparency = V3XBLENDMODE_ADD; Mat.alpha = 200; }
          else if (n === 'reacteurs') { Mat.info.Transparency = V3XBLENDMODE_ADD; Mat.info.TwoSide = 1; Mat.alpha = 200; }
          else if (n === 'light2') { Mat.diffuse = [(i * 8) & 255, (i * 8) & 255, (i * 8) & 255]; }
          else if (n.toUpperCase().includes('TUROK')) { Mat.info.Transparency = V3XBLENDMODE_ADD; Mat.alpha = 200; Mat.info.TwoSide = 1; Mat.scale = 128; }
          else if (Mat.info.Transparency) { Mat.info.Transparency = V3XBLENDMODE_ADD; Mat.alpha = 200; }
          if (Mat.info.Sprite) Mat.info.Opacity = 1;
          if (Mat.info.Transparency) Mat.diffuse = [240, 240, 240];
          if (g_SGSettings.VisualsFx === 2) Mat.info.Transparency = 0;
        }
        Mat.version++;
      }
    }
    i--;
  }
}
/** NG_FixTrackAnim: a track whose last key repeats the one before is extended */
function NG_FixTrackAnim(): void {
  for (const TRI of g_SGGame.Scene!.TRI) {
    if (TRI.numFrames > 2 && TRI.keys.length >= TRI.numFrames) {
      const f = TRI.numFrames - 1;
      const v = m.vec();
      m.dif(v, kPos(TRI.keys[f - 1]), kPos(TRI.keys[f - 2]));
      if (m.distanceSq(kPos(TRI.keys[f]), kPos(TRI.keys[f - 1])) === 0) m.sum(kPos(TRI.keys[f]), kPos(TRI.keys[f - 1]), v);
    }
  }
}
const FIX100TO255 = (x: number): number => Math.trunc((x * 255) / 300);
/** palette index -> colour of the scene's palette (RGB_convert) */
let scenePalette = new Uint8Array(768);
const RGB_convert = (i: number): number => rgb(scenePalette[3 * i], scenePalette[3 * i + 1], scenePalette[3 * i + 2]);

/** NG_InitGameScene: ep_<n>\<scene>.vmx */
function NG_InitGameScene(): void {
  const AmbientLevel = [[72, 0, 0], [25, 25, 33], [55, 33, 47], [72, 27, 0], [0, 36, 59]].map((c) => c.map(FIX100TO255));
  NG_FXLoadData();
  const pth = O.World.path_name.replace(/^\.\\/, '').replace(/\\/g, '/').toLowerCase();
  const name = O.World.scene_name.replace(/\.[^.]*$/, '') + '.vmx';
  const scene = parseVmx(fileGet(`${pth}/${name}`));
  validate(scene);
  g_SGGame.Scene = scene;
  V3X.Setup.flags |= V3XOPTION_COLLISION | 0x200;
  V3X.Setup.flags |= 0x4; // V3XOPTION_AMBIANT (more than 8 bits per pixel)
  const ep = G.g_pCurrentGame.episode > 4 ? 0 : G.g_pCurrentGame.episode;
  V3X.Light.ambiant = AmbientLevel[ep];
  prepareScene(scene, pth);
  loadScenePalette(pth);
  verify(scene);
  NG_FXSetSceneShading(2);
  NG_FixTrackAnim();
}
/** the palette of the scene (stage.act: 256 x RGB) */
function loadScenePalette(pth: string): void {
  try { scenePalette = fileGet(`${pth}/stage.act`).slice(0, 768); } catch { scenePalette = new Uint8Array(768); }
  const S = g_SGGame;
  S.CI_COL2 = RGB_convert(212); S.CI_BLACK = RGB_convert(0); S.CI_YELLOW = RGB_convert(207); S.CI_RED = RGB_convert(216);
  S.CI_WHITE = rgb(255, 255, 255); S.CI_GREEN = RGB_convert(210); S.CI_BLUE = RGB_convert(195); S.CI_BLUELIGHT = RGB_convert(192);
  S.pColorRadar = [S.CI_WHITE, S.CI_BLUE, S.CI_RED, S.CI_YELLOW, RGB_convert(220), rgb(255, 255, 255), S.CI_BLUELIGHT, S.CI_COL2];
}

/** NG_CMXToObject: the objects of the scene get their scripts by name ("<basename>_<anything>") */
function NG_CMXToObject(): void {
  const Scene = g_SGGame.Scene!;
  let numPlayer = 0;
  for (let i = 0; i < 8; i++) { g_SGGame.MaxAim[i] = 0; g_SGGame.MaxProtect[i] = 0; }
  g_SGGame.numWeapons = 0; g_SGGame.numEnemies = 0;
  const S = G.g_cGameStat;
  S.total_nmy = 0; S.newlevel = 0; S.total_amy = 0; S.killed_nmy = 0; S.killed_amy = 0; S.total_bonus = 0;
  for (const OVI of Scene.OVI) {
    const ORI = OVI.ORI!;
    if (ORI.type === V3XOBJ_MESH && ORI.node) meshOf(OVI).scale = 1;
    if (!ORI.name || ORI.type !== V3XOBJ_MESH) continue;
    const us = ORI.name.indexOf('_');
    if (us < 0) continue;
    const name = ORI.name.slice(0, us).toLowerCase();
    let f = 0, Coliable = 0;
    let Sf = null;
    for (let j = 0; j < g_SGSettings.maxCase && !Sf; j++) {
      const Sif = G.g_pPlayerInfo[j];
      if (name !== Sif.Basename.toLowerCase()) continue;
      f = 1; Sf = Sif;
      if (Sf.NeverHide === 1 || Sf.NeverHide === 2) OVI.state |= V3XSTATE_CULLNEVER;
      if (Sif.CollisionStyle === t_CS_BONUS) S.total_bonus++;
      Coliable = Sif.CollisionStyle === t_CS_BUMP || Sif.CollisionStyle === t_CS_BUMP_LOSE_SHIELD ? 2 : 1;
      const nav = NG_ColorToNAV(ORI.index_color);
      g_SGGame.MaxAim[nav] += Sif.Mission + Sif.Protect;
      g_SGGame.MaxProtect[nav] += Sif.Protect;
      switch (Sif.Type) {
        case t_SPECIAL: {
          const Jf = newActor();
          Jf.pInf = { ...Sif }; Jf.OVI = OVI; OVI.data = Jf;
          if (Sif.Code === 0) OVI.state |= V3XSTATE_HIDDEN;
          g_SGGame.pEnemy.push(Jf); g_SGGame.numEnemies++;
          break;
        }
        case t_ENEMY: case t_PIRAT: case t_OBSTACLE: case t_FRIEND: case t_DECOR: {
          const Jf = newActor();
          Jf.pInf = { ...Sif };
          if (Sif.Type === t_FRIEND) S.total_amy++;
          if (Sif.Type === t_ENEMY) {
            S.total_nmy++;
            if (g_SGSettings.Difficulty === 0 && Jf.pInf.ShieldMax > 2) {
              Jf.pInf.ShieldMax -= Math.trunc(Jf.pInf.ShieldMax / 2);
              Jf.pInf.Shield -= Math.trunc(Jf.pInf.Shield / 2);
              if (Jf.pInf.fSpeedMax > 2) Jf.pInf.fSpeedMax = Math.fround(Jf.pInf.fSpeedMax - Jf.pInf.fSpeedMax / 4);
            }
          }
          Jf.OVI = OVI; OVI.data = Jf; Jf.pEffect = null;
          g_SGGame.pEnemy.push(Jf); g_SGGame.numEnemies++;
          break;
        }
        case t_ACCESSOIRE: {
          const W: SGWeapon = {
            kind: 'weapon', pInf: { ...Sif }, OVI, TargetLock: null, Attacker: null, vel: m.vec(), Target: m.vec(),
            fTime: 0, Delay: 0, Available: 0, Camera: 0, Freeze: 0, TagFX: 0,
          };
          OVI.data = W;
          OVI.state &= ~V3XSTATE_HIDDEN;
          OVI.state |= V3XSTATE_CULLNEVER;
          g_SGGame.pWea.push(W); g_SGGame.numWeapons++;
          Coliable = 0;
          break;
        }
        case t_PLAYER:
          OVI.state |= V3XSTATE_HIDDEN;
          f = 2;
          if (!numPlayer && Sif.Basename.includes(g_pShip[G.g_pCurrentGame.ship].name)) {
            Sif.CollisionStyle = t_CS_BUMP_LOSE_SHIELD;
            Sif.Animation = t_MPLAYER;
            Sif.Tactic = 0;
            const P = g_SGGame.pPlayer[numPlayer];
            G.g_pPlayer = P;
            P.J.pInf = { ...Sif };
            P.J.pInf.ColorRadar = 7;
            OVI.data = P.J;
            OVI.state &= ~V3XSTATE_HIDDEN;
            P.J.OVI = OVI;
            P.Rot = OVI.Tk!;
            P.Mat = meshOf(OVI).matrix;
            P.Si = g_pShip[G.g_pCurrentGame.ship];
            OVI.matrix_Method = V3XMATRIX_Custom;
            Coliable = 2;
            numPlayer++;
            f = 1;
          }
          break;
      }
    }
    if (f === 1 && Sf) {
      if (Sf.NoFog) meshOf(OVI).flags |= V3XMESH_NOZSHADING;
      if ((Sf.Collision === t_COL_AUTOSPHERE || Sf.Collision === t_COL_AUTOSPHERE2) && !ORI.Cs) ORI.Cs = clNewFromMesh(ORI.node as Mesh);
      if (ORI.Cs) {
        const Cs = ORI.Cs;
        Cs.weight = Sf.Poids;
        Cs.reaction = 0.25;
        ORI.global_rayon = Math.fround(Cs.global.radius * 2);
        ORI.global_center = Float32Array.from(Cs.global.center);
        if (Coliable === 2) Cs.flags |= V3XCMODE_REFLEX;
        if (Sf.Collision === t_COL_AUTOSPHERE2) Cs.flags |= V3XCMODE_NOFEEDBACK;
        if (Sf.Type === t_ACCESSOIRE || Sf.Poids >= 10000) Cs.flags |= V3XCMODE_DONTMOVE;
        if (Cs.flags & V3XCMODE_INVERTCONDITION) { Cs.flags |= V3XCMODE_DONTMOVE | V3XCMODE_REFLEX; Cs.reaction = 1; }
        if (Sf.Type === t_OBSTACLE || Sf.NeverShock) { Cs.flags |= V3XCMODE_DONOTTESTSAMEID; Cs.ID = Sf.NeverShock ? Sf.NeverShock : Sf.Type; }
        OVI.state |= V3XSTATE_CULLNEVER;
      } else {
        ORI.global_rayon = 1024;
        ORI.global_center = m.vec();
        OVI.state |= V3XSTATE_CULLNEVER;
      }
    }
  }
  G.g_pPlayer = g_SGGame.pPlayer[g_SGGame.IdPlayer];
  if (!G.g_pPlayer.J.OVI) throw new Error('no ship of the player in the scene');
  G.g_pPlayer.mode = 0;
  V3X.Light.fogDistance = -15000;
  V3X.Clip.Far = -65000;
  V3X.Clip.Near = -1;
  m.set(G.g_pPlayer.J.Mv.vel, 0, 0, 0);
  G.g_pPlayer.J.pInf.fSpeed = G.g_pPlayer.J.pInf.fSpeedMax / 2;
}

/** NG_ReadCMXFile: cmx\stage_<level>.cmx */
function NG_ReadCMXFile(level: number): void {
  G.g_pPlayerInfo = [];
  g_SGSettings.maxCase = 0;
  stageReadFile(`stage_${level}.cmx`, { fx: NG_FXGetByName, audio: NG_AudioGetByName });
}

/** NG_NAVReset: the camera, the objects and the sky of the current NAV point */
export function NG_NAVReset(reset: number): void {
  const Scene = g_SGGame.Scene!;
  g_SGGame.WarpOk = 0;
  let OVI = oviByName(Scene, O.NAV ? `NAVPTS_#${O.NAV}` : 'NAVPTS_#');
  if (!OVI) { OVI = oviByName(Scene, 'WARP_')!; OVI.state |= V3XSTATE_CULLNEVER; }
  O.NavCam = OVI;
  const cam = cameraByName(Scene, `NAV${O.NAV}`);
  if (cam) {
    O.Cam = cam;
    cameraSelect(cam);
    V3X.Camera.focal = O.World.Focal * 2;
    viewportSetup();
    G.g_pCamera = cam.Tk!;
    if (reset) {
      kTarget(G.g_pCamera).set(kPos(G.g_pCamera));
      m.madd(kPos(G.g_pCamera), m.K(V3X.Camera.M), kPos(G.g_pCamera), 65535);
      for (let i = 0; i < g_SGGame.numPlayer; i++) {
        const P = g_SGGame.pPlayer[i];
        m.transpose(P.Mat, V3X.Camera.M);
        kPos(P.Rot).set(kPos(V3X.Camera.Tk));
      }
    }
  }
  for (const o of Scene.OVI) {
    const ORI = o.ORI!;
    let nv = 0;
    if (ORI.index_color >= 4) {
      nv = NG_ColorToNAV(ORI.index_color);
      if (nv !== O.NAV) o.state |= V3XSTATE_HIDDEN; else o.state &= ~V3XSTATE_HIDDEN;
    }
    if (o.data) {
      const J = o.data as SGActor;
      J.pInf.ColorNav = nv;
      if (J.Mv) J.Mv.k = 1;
      if (J.pInf.Wait) o.state |= V3XSTATE_HIDDEN;
      o.state |= V3XSTATE_MATRIXUPDATE;
    }
  }
  for (const o of Scene.OVI) {
    if (!o.data) continue;
    const J = o.data as SGActor;
    if (J.pInf.Replace) {
      const g = o.ORI!.name.indexOf('_');
      if (g >= 0) {
        const p = oviByName(Scene, G.g_pPlayerInfo[J.pInf.Replace].Basename + o.ORI!.name.slice(g));
        if (p) p.state |= V3XSTATE_HIDDEN;
      }
    }
  }
  g_SGGame.WarpOk = 0;
  O.Nav = O.World.Nav[O.NAV];
  if (!O.Nav.Skybox) O.Sky!.state |= V3XSTATE_HIDDEN; else O.Sky!.state &= ~V3XSTATE_HIDDEN;
  NG_WeaponCreate();
  NG_DisplayWarp();
  G.g_cAI = { OVI: [], Target: null, mode: 0, nHind: 0, fTime: 0 };
  NG_AISetTacticMode();
}
const kTarget = (k: Float32Array): Float32Array => k.subarray(0, 3);
/** NG_NAVClear: the number of NAV points (from the objects' colours) and the first one */
function NG_NAVClear(): void {
  O.NAV = 0;
  O.MaxNAV = 0;
  for (const o of g_SGGame.Scene!.OVI) {
    const ic = o.ORI!.index_color;
    if (ic > 4) { const nv = (ic - 4) >> 2; if (nv > O.MaxNAV && nv < 8) O.MaxNAV = nv; }
  }
  O.MaxNAV++;
  NG_NAVReset(1);
}
function NG_InitGameVariables(): void {
  const P = G.g_pPlayer;
  O.Time = G.g_pGameItem[G.g_pCurrentGame.episode].LI[G.g_pCurrentGame.level[G.g_pCurrentGame.episode]].Time;
  O.IsTimed = O.Time !== 0 ? 1 : 0;
  P.CurArt = 1;
  for (let i = 0; i < 8; i++) { P.Art[i].MAX_val = g_SGSettings.Cheater ? 99 : 10; P.Art[i].val = g_SGSettings.Cheater ? 99 : 0; P.Art[i].Time_val = 0; }
  G.g_cGameStat.bonus = 0; G.g_cGameStat.shooted = 0;
  O.FinCode = GAMESTATE_PLAY;
  O.quit = 0;
  O.CallMode[t_ENEMY] = ORDER_Attack;
  O.CallMode[t_FRIEND] = ORDER_Attack;
  g_SGGame.Count = 0;
  g_SGGame.ComMode = 0;
  g_SGGame.RadarRange = 8000 * g_SGSettings.WorldUnit;
  g_SGGame.DeathDist = 1400;
  g_SGGame.CameraMode = g_SGSettings.SerialGame || g_SGSettings.DemoMode ? 0 : CAMERA_START;
  g_SGGame.FlashAlpha = -32;
  g_SGSettings.ComNumber = 0;
  g_SGGame.LockMAX = 0;
  G.g_pLockTarget = null;
}
function NG_InitGameGraphics(): void {
  const Scene = g_SGGame.Scene!;
  O.Sky = oviByName(Scene, 'sky_');
  O.Sky!.state |= V3XSTATE_GIANT;
  O.Shield = oviByName(Scene, 'shield_');
  NG_DrawExtra();
  V3X.Camera.focal = O.World.Focal << 8;
  viewportSetup();
}
/** NG_InitGameShip */
export function NG_InitGameShip(): void {
  const P = G.g_pPlayer;
  G.g_cShip = copyShip(g_pShip[P.Si.code]);
  P.Mv.inert = 8;
  P.J.pInf.Attack = P.Si.code + 1;
  P.J.pInf.Scoring = G.g_pCurrentGame.score | 0;
}
function NG_InitGameSounds(): void {
  NG_AudioPlayMusic(O.World);
  G.g_cFXTable.Engine = channelGetFree();
  G.g_cFXTable.SoundEngine = G.g_pPlayer.J.pInf.StartSound - 1;
  G.g_cFXTable.SoundAlarm = NG_AudioGetByName('alarm') - 1;
  G.g_cFXTable.Alarm = 0;
}

/** NG_GameStart */
export async function NG_GameStart(): Promise<void> {
  if (!G.g_pCurrentGame) G.g_pCurrentGame = G.g_pSaveGames[0];
  const cg = G.g_pCurrentGame;
  if (g_SGSettings.DemoMode === 2 || g_SGSettings.DemoMode === 4) cg.ship = sysRand(3);
  let start_level = (cg.episode + 1) * 10 + (cg.level[cg.episode] + 1);
  g_cTimer.iMinFrame = g_SGGame.Demo ? 1 : g_SGSettings.FrameSkip;
  if (!g_cTimer.iMinFrame) g_cTimer.iMinFrame = 1;
  timer_Start(70, 1);
  await NG_PlayLoadingScreen();
  G.g_pspDispFont = G.g_pFont;
  await NG_DrawLoadingBar(5);
  if (g_SGSettings.DemoMode === 2 || g_SGSettings.DemoMode === 4) {
    start_level = await replayLoad();
    g_SGGame.IsHost = 1;
  }
  NG_LoadGameInterface();
  await NG_DrawLoadingBar(10);
  // NG_ResetGameData
  g_SGGame.numEnemies = 0; g_SGGame.numWeapons = 0; g_SGGame.pWea = []; g_SGGame.pEnemy = [];
  g_SGGame.pPlayer = [newPlayer()];
  void MAX_WEAPONS; void MAX_ENEMYS; void newScript;
  await NG_DrawLoadingBar(20);
  NG_ReadCMXFile(start_level);
  // the scene's directory (the script's Path) is downloaded now, as the browser loads the episodes on demand
  await loadEpisodeData(O.World.path_name.replace(/^\.\\/, '').replace(/\\/g, '/').toLowerCase());
  await NG_DrawLoadingBar(30);
  NG_InitGameScene();
  await NG_DrawLoadingBar(40);
  NG_CMXToObject();
  await NG_DrawLoadingBar(50);
  NG_InitGameVariables();
  await NG_DrawLoadingBar(60);
  NG_InitGameGraphics();
  await NG_DrawLoadingBar(70);
  NG_ChangeGameDetail();
  await NG_DrawLoadingBar(75);
  NG_InitGameShip();
  await NG_DrawLoadingBar(80);
  NG_WeaponCreate();
  await NG_DrawLoadingBar(85);
  NG_NAVClear();
  await NG_DrawLoadingBar(90);
  await NG_DrawLoadingBar(95);
  await NG_DrawLoadingBar(97);
  NG_InitAnimateStage();
  await NG_DrawLoadingBar(100);
  G.g_csPicture = null;
  V3X.plugins = [plugCollisionMove];
  timer_Start(70, 1);
  NG_InitGameSounds();
}
/** NG_GameStop */
export function NG_GameStop(): void {
  NG_AudioStopSound(G.g_cFXTable.Engine);
  NG_AudioStopSound(G.g_cFXTable.Alarm);
  NG_AudioStopTrack();
  releaseScene();
  g_SGGame.Scene = null;
}
export { NG_GamePlay, View, loadBackground, type OVI, type Sprite, T };
