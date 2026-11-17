// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): explosions, impacts, debris, smoke and lens flares
// (src/lt_fx.c), with the OpenGL build's choices (GXSPEC_HARDWARE: lens flares from int\le01..12.png,
// the expanding shield sphere of a blast).
import * as m from '../v3x/math.ts';
import { V3X, transformProject, meshOf } from '../v3x/scene.ts';
import { type OVI, type Mesh, V3XSTATE_MATRIXUPDATE, V3XSTATE_HIDDEN, V3XCMODE_DONTMOVE, V3XBLENDMODE_ALPHA, V3XBLENDMODE_ADD } from '../v3x/vmx.ts';
import { GX, csp, CSP_Color, rgb, spriteOfSheet } from '../gx/gx.ts';
import { g_cTimer, sysRand, randomf, fileText } from '../sys/sys.ts';
import { loadTextList } from '../sys/ini.ts';
import { sheet, flcSpriteGroup } from './data.ts';
import { NG_Audio3DPlay, NG_Audio3DUpdate } from './sound.ts';
import {
  G, g_SGGame, g_SGSettings, newEffect, type SGEffect, type SGScript, type SGActor, MAX_DEBRIS, MAX_BLASTS, FX_CUSTOM, FX_IMPACT,
  FX_DEBRIS, FX_FINISH, FX_WARPIN, FX_SMOKE, FX_SMOKE2, t_DECOR, t_SPECIAL, t_PLAYER, t_ENEMY, t_PIRAT, t_FRIEND, t_OBSTACLE,
  t_NEUTRAL, GODMODE, SGNET_SHIELDCHANGE, GAMESTATE_DEAD, COM_ShipAttacked, MAX_COM_DELAY,
} from './state.ts';
import { NG_GetFreeSphere, NG_SetSpherePos } from './play.ts';

/** NG_FXCreate */
export function NG_FXCreate(): void {
  g_SGGame.pExpl = Array.from({ length: g_SGGame.numEffects }, newEffect);
}
/** NG_FXDraw: two sprites per effect, the second at half colour */
export function NG_FXDraw(): void {
  for (const p of g_SGGame.pExpl) {
    if (!p.visible) continue;
    for (let j = 0; j < 2; j++) {
      const sp = p.Sprite!.item[p.Step[j]];
      if (!sp) continue;
      CSP_Color(rgb(Math.trunc(p.diffuse[0] / (j + 1)), Math.trunc(p.diffuse[1] / (j + 1)), Math.trunc(p.diffuse[2] / (j + 1))));
      csp.zoom_TrspADD(sp, Math.trunc(p.pos2D[j][0] - p.size2D[j][0] / 2), Math.trunc(p.pos2D[j][1] - p.size2D[j][1] / 2),
        Math.trunc(p.size2D[j][0]), Math.trunc(p.size2D[j][1]));
    }
  }
}
/** NG_FXUpdate */
export function NG_FXUpdate(): void {
  const t = V3X.Time.ms;
  for (const p of g_SGGame.pExpl) {
    if (p.Dispo) continue;
    let alpha = 255;
    if (p.FxCode >= 0) {
      if (p.PlaySample) { p.TagFx = NG_Audio3DPlay(p.FxCode, p.pos, null); p.PlaySample = 0; }
      else if (p.TagFx && !NG_Audio3DUpdate(p.pos, null, p.TagFx, p.FxCode)) p.TagFx = 0;
    }
    const delta = Math.trunc((t - p.LastFrame) / (1 + p.Sprite!.speed));
    if (p.useKeep) p.OVI!.state |= V3XSTATE_MATRIXUPDATE;
    if (p.type === FX_DEBRIS || p.type === FX_SMOKE) {
      const scale = randomf(p.type === FX_DEBRIS ? 3 + 4 : 2 + 8);
      m.polarSet(p.pos, p.cent, p.angle[0], p.angle[1] | 0, p.angle[2] | 0);
      p.angle[0] += Math.trunc(g_cTimer.fCounter * scale);
      p.OVI!.state |= V3XSTATE_MATRIXUPDATE;
      alpha = p.type === FX_DEBRIS ? 255 : 128;
    }
    if (delta) {
      p.Step[1] = p.Step[0];
      p.Step[0] += delta;
      p.LastFrame = t;
      const max = p.Sprite!.maxItem;
      if (p.Step[0] >= max - 1) {
        p.Nloop--;
        if (p.Nloop === 0) { p.Dispo = 1; p.visible = 0; }
        else { p.Step[0] %= max; p.PlaySample = 1; }
      }
      if (p.Nloop === 1) {
        const a = p.Step[0] > p.FadeStart ? alpha - Math.trunc((alpha * (p.Step[0] - p.FadeStart)) / (max - p.FadeStart)) : alpha;
        p.diffuse = [a & 255, a & 255, a & 255];
      }
    }
    if (!p.Dispo && p.type === FX_FINISH && p.OVI!.state & V3XSTATE_HIDDEN) { p.Dispo = 1; p.visible = 0; }
    if (!p.Dispo) {
      for (let j = 0; j < 2; j++) {
        if (transformProject(p.pos, p.pos2D[j])) {
          const sx = V3X.ViewPort.Focal / p.pos2D[j][2];
          p.size2D[j][1] = p.Size * sx;
          p.size2D[j][0] = p.size2D[j][1] * V3X.ViewPort.Ratio;
          p.pos2D[j][2] = -p.pos2D[j][2];
          if (j === 0) p.visible = 1;
        } else if (j === 0) p.visible = 0;
      }
      p.pos2D[1].set(p.pos2D[0]);
    }
  }
}
/** NG_FXUpdateEx: the expanding sphere of a blast */
export function NG_FXUpdateEx(): void {
  for (const pExpl of g_SGGame.pExpl) {
    const OVI = pExpl.Sphere;
    if (OVI && pExpl.radius < 256) {
      const rapport = Math.fround((10 * pExpl.OVI!.ORI!.global_rayon) / OVI.ORI!.global_rayon);
      const radius = Math.fround((pExpl.radius * rapport) / 256);
      pExpl.radius = Math.fround(pExpl.radius + g_cTimer.fCounter * 3);
      if (pExpl.radius > 256) pExpl.radius = 256;
      const mm = m.mtx();
      m.setIdentity(mm);
      m.Pos(mm).set(pExpl.pos);
      NG_SetSpherePos(OVI, mm, radius, 1);
      const Mat = meshOf(OVI).material[0];
      Mat.diffuse = [255, 255, 255];
      Mat.info.Transparency = V3XBLENDMODE_ALPHA;
      Mat.alpha = Math.trunc(256 - pExpl.radius) & 255;
      Mat.version++;
    }
  }
}
/** NG_FXLoadData: the flares (hardware: int\le01..12.png) and the animations of anim\anim.lst */
export function NG_FXLoadData(): void {
  const item = [];
  for (let i = 0; i < 12; i++) item.push(spriteOfSheet(sheet(`int/le${String(i + 1).padStart(2, '0')}.png`)));
  G.g_pspFlares = { item, maxItem: 12, speed: 0, HSpacing: 0, VSpacing: 0, Caps: 0 };
  G.g_pspFX = G.g_pszAnimList.map((n) => flcSpriteGroup(`anim/${n}`));
  for (const p of g_SGGame.pExpl) { p.Dispo = 1; p.visible = 0; }
}
export function NG_FXLoadList(): void { G.g_pszAnimList = loadTextList(fileText('anim/anim.lst'), 32); }
/** NG_FXGetByName: 1-based */
export function NG_FXGetByName(s: string): number {
  const i = G.g_pszAnimList.findIndex((a) => a.toLowerCase() === s.toLowerCase());
  return i + 1;
}

const Flare = [
  { pos: -0.4, radius: 3, type: 0 }, { pos: 0.4, radius: 3, type: 0 }, { pos: 0.5, radius: 8, type: 0 }, { pos: 0.6, radius: 4, type: 0 },
  { pos: 0.8, radius: 3, type: 0 }, { pos: 0.9, radius: 1, type: 0 }, { pos: 1.3, radius: 2, type: 0 }, { pos: 1.4, radius: 5, type: 0 },
  { pos: 1.5, radius: 8, type: 0 }, { pos: 1.6, radius: 16, type: 1 }, { pos: 1.8, radius: 10, type: 0 }, { pos: 2.0, radius: 4, type: 0 },
];
const MAXLENZ = 12;
/** NG_FXFlare: the lens flares of the lights with V3XLIGHTCAPS_LENZFLARE in the view */
export function NG_FXFlare(): void {
  const zero = m.vec(V3X.ViewPort.center[0], V3X.ViewPort.center[1], 0);
  for (const light of V3X.Light.lights) {
    const it = Math.fround(light.intensity / 255);
    const sz = Math.fround(MAXLENZ * it);
    const lensZ = Math.fround(V3X.ViewPort.Focal * 0.025 * it);
    if (!(light.flags & 1)) continue;
    const light2cam = m.vec();
    if (light.type === 2 || light.type === 4) m.dif(light2cam, m.Pos(V3X.Camera.M), light.pos);
    else if (light.type === 1) m.dif(light2cam, light.target, light.pos);
    const lightOnView = m.vec();
    if (!transformProject(light.pos, lightOnView)) continue;
    m.normalize(light2cam, light2cam);
    lightOnView[2] = light.pos[2];
    let alphaLevel = m.dot(light2cam, m.K(V3X.Camera.M));
    if (alphaLevel <= 0.75) continue;
    if (alphaLevel > 1) alphaLevel = 1;
    if (alphaLevel >= 0.98) { g_SGGame.FlashColor = [255, 255, 255]; g_SGGame.FlashAlpha = Math.trunc(8 * alphaLevel); }
    const direction = m.vec();
    m.dif(direction, zero, lightOnView);
    CSP_Color(rgb(255, 255, 255));
    GX.csp_cfg.alpha = 255;
    let n = Math.trunc(sz) || 0;
    if (!sz) n = 1;
    for (let j = n, k = 0; j !== 0; k++, j--) {
      const F = Flare[k];
      if (!F) break;
      const lx = lightOnView[0] + direction[0] * F.pos, ly = lightOnView[1] + direction[1] * F.pos;
      const sp = G.g_pspFlares!.item[MAXLENZ - j];
      let sy = -F.radius * lensZ, sx = sy * V3X.ViewPort.Ratio;
      if (sx < 0) sx = -sx;
      if (sy < 0) sy = -sy;
      csp.zoom_TrspADD(sp, Math.trunc(lx - sx / 2), Math.trunc(ly - sy / 2), Math.trunc(sx), Math.trunc(sy));
    }
  }
}
export function NG_FXImpact(power: number): void { g_SGGame.Shock = power < 12 ? power : 12; }

/** xADJUSTFIX(x, k): a float scaled by 2^k, as an integer */
const xADJUSTFIX = (x: number, k: number): number => Math.trunc(x * (1 << k));

/** NG_FXAvary: the blast damage around an exploding object */
export function NG_FXAvary(mOVI: OVI, pInf: SGScript): void {
  let sz = Math.fround(20 * (mOVI.ORI!.global_rayon + 1));
  sz = Math.fround(sz * sz);
  const pos = m.Pos(mOVI.node.matrix);
  for (const OVI of g_SGGame.Scene!.OVI) {
    if (!OVI.data || OVI.state & V3XSTATE_HIDDEN || mOVI === OVI) continue;
    const Sif = (OVI.data as SGActor).pInf;
    if (Sif.Type === t_DECOR || Sif.Type === t_SPECIAL) continue;
    const dist = m.vec();
    m.dif(dist, m.Pos(OVI.node.matrix), pos);
    let dii = m.lengthSq(dist);
    if (dii < sz && sz) {
      const Cs = OVI.ORI!.Cs;
      let per = Math.fround(1 - dii / sz);
      if (per < 0) per = 0;
      if (per > 1) per = 1;
      if (Cs && Cs.flags & V3XCMODE_DONTMOVE) m.madd(Cs.velocity, dist, Cs.velocity, per);
      dii = Math.fround(pInf.Avary * per);
      if (dii >= Sif.Shield) dii = Sif.Shield;
      switch (Sif.Type) {
        case t_PLAYER:
          if (OVI === G.g_pPlayer.J.OVI && !(G.g_pPlayer.mode & GODMODE)) {
            if (dii > Sif.Shield) dii = Sif.Shield;
            Sif.Shield -= Math.trunc(dii);
            G.g_pPlayer.Notify += SGNET_SHIELDCHANGE;
            g_SGGame.FlashColor = [255, 0, 0];
            g_SGGame.FlashAlpha = xADJUSTFIX(per, 5);
            if (G.g_SGObjects.FinCode !== GAMESTATE_DEAD) { g_SGSettings.ComNumber = COM_ShipAttacked; g_SGSettings.ComTime = MAX_COM_DELAY; }
            NG_FXImpact(xADJUSTFIX(per, 4));
          }
          break;
        case t_ENEMY: case t_PIRAT: case t_FRIEND: case t_OBSTACLE: case t_NEUTRAL:
          Sif.Shield -= Math.trunc(dii);
          break;
      }
    }
  }
}
function vertexWorld(obj: Mesh, x: number, out: Float32Array): void {
  const v = obj.vertex.subarray(3 * x, 3 * x + 3);
  if (v.length === 3) m.applyMatrixTrans(out, v, obj.matrix);
  else m.applyMatrixTrans(out, m.vec(), obj.matrix);
}
/** NG_FXDebris */
export function NG_FXDebris(pInf: SGScript, OVI: OVI): void {
  const obj = meshOf(OVI);
  let i = Math.trunc(OVI.ORI!.global_rayon / 8 + 2);
  if (i > MAX_DEBRIS) i = MAX_DEBRIS;
  for (; i !== 0; i--) {
    const x = sysRand(obj.numVerts);
    const v = m.vec();
    vertexWorld(obj, x, v);
    const p = NG_FXNew(v, FX_DEBRIS, 8, pInf, 1, OVI);
    if (p) {
      p.Step[1] = p.Step[0] = sysRand(p.Sprite!.maxItem);
      p.Size = OVI.ORI!.global_rayon / 8;
      if (p.Size < 256 * g_SGSettings.WorldUnit) p.Size = 256 * g_SGSettings.WorldUnit;
    }
  }
}
/** NG_FXBlast */
export function NG_FXBlast(pInf: SGScript, OVI: OVI): void {
  const obj = meshOf(OVI);
  let f = 0;
  let i = Math.trunc(OVI.ORI!.global_rayon / 8 + 2);
  if (i > MAX_BLASTS) i = MAX_BLASTS;
  for (; i !== 0; i--) {
    const x = sysRand(obj.numVerts);
    const v = m.vec();
    vertexWorld(obj, x, v);
    if (!f) v.set(m.Pos(obj.matrix));
    const p = NG_FXNew(v, FX_IMPACT, 4, pInf, 1, OVI);
    if (p) {
      if (!f) { p.Sphere = NG_GetFreeSphere(); p.radius = 0; f = 1; }
      p.Step[1] = p.Step[0] = sysRand(p.Sprite!.maxItem);
      p.Size = OVI.ORI!.global_rayon / 2;
    }
  }
}
/** NG_FXNew: the first free effect; kp = 1 keeps a copy of pos and follows the object, 2.. scales by 2^(kp-1) */
export function NG_FXNew(pos: Float32Array, type: number, lop: number, pInf: SGScript, kp: number, OVI: OVI): SGEffect | null {
  let EJ: SGEffect | null = null;
  for (let idx = 0, i = g_SGGame.numEffects; i > 0; idx++, i--) {
    const p = g_SGGame.pExpl[idx];
    if (!p.Dispo) continue;
    let transpa = 0;
    OVI.state |= V3XSTATE_MATRIXUPDATE;
    p.Step[0] = p.Step[1] = 0;
    p.Nloop = lop;
    p.Sphere = null;
    p.type = type;
    p.OVI = OVI;
    p.Size = OVI.ORI!.global_rayon;
    p.Dispo = 0;
    p.LastFrame = V3X.Time.ms;
    p.PlaySample = 1;
    if (kp) {
      p.keep.set(pos);
      if (kp === 1) p.useKeep = 1;
      else { p.useKeep = 0; p.Size *= 1 << (kp - 1); }
      p.pos = p.keep;
    } else p.pos = pos;
    EJ = p;
    switch (p.type) {
      case FX_FINISH:
        p.FxCode = pInf.StartSound - 1;
        p.Sprite = G.g_pspFX[pInf.FinisHim - 1];
        p.Size *= 2;
        p.FadeStart = p.Sprite.maxItem;
        transpa = 1;
        break;
      case FX_SMOKE: case FX_SMOKE2:
        if (p.type === FX_SMOKE) {
          p.angle[0] = 0; p.angle[1] = sysRand(4096); p.angle[2] = sysRand(4096);
          vertexWorld(meshOf(OVI), sysRand(meshOf(OVI).numVerts), p.cent);
        }
        p.Sprite = G.g_pspFX[0];
        p.FxCode = -1;
        p.FadeStart = 0;
        transpa = 1;
        break;
      case FX_CUSTOM: case FX_IMPACT:
        if (p.type === FX_CUSTOM) { NG_FXAvary(OVI, pInf); transpa = 1; }
        if (!pInf.ExplodeMode) { p.Dispo = 1; EJ = null; transpa = 0; p.FadeStart = 0; }
        else {
          p.Sprite = G.g_pspFX[pInf.ExplodeMode - 1];
          p.FxCode = pInf.SoundExplode - 1;
          p.FadeStart = p.Sprite.maxItem >> 1;
          p.Size /= 2;
          transpa = 1;
          p.Light = 128;
        }
        break;
      case FX_WARPIN:
        p.FxCode = pInf.SoundAppear - 1;
        p.Sprite = G.g_pspFX[pInf.AppearMode - 1];
        if (p.OVI.state & V3XSTATE_HIDDEN) p.Size *= 4;
        p.OVI.state ^= V3XSTATE_HIDDEN;
        p.Light = 255;
        p.FadeStart = p.Sprite.maxItem;
        transpa = 1;
        break;
      case FX_DEBRIS: {
        p.FxCode = -1;
        p.Sprite = G.g_pspFX[pInf.DebrisMode2 && i & 1 ? pInf.DebrisMode2 - 1 : pInf.DebrisMode - 1];
        const obj = meshOf(OVI);
        const x = sysRand(obj.numVerts) - 1; // -1 when sysRand returns 0: the original reads vertex[-1]
        vertexWorld(obj, x, p.cent);
        p.angle[0] = 0; p.angle[1] = sysRand(4096); p.angle[2] = sysRand(4096);
        transpa = 0;
        p.FadeStart = p.Sprite.maxItem >> 1;
        break;
      }
      default: break;
    }
    p.transparency = transpa && g_SGSettings.VisualsFx > 1 ? V3XBLENDMODE_ADD : 0;
    break;
  }
  return EJ;
}
/** NG_ChangeGameDetail: the sky's materials (diffuse white, no shading) */
export function NG_ChangeGameDetail(): void {
  const Sky = G.g_SGObjects.Sky;
  if (!Sky) return;
  for (const mat of meshOf(Sky).material) { mat.diffuse = [255, 255, 255]; mat.info.Shade = 0; mat.version++; }
}
/** NG_FXSetSceneShading: every shaded material at least gouraud */
export function NG_FXSetSceneShading(limit: number): void {
  const Scene = g_SGGame.Scene!;
  for (const ORI of Scene.ORI) {
    if (ORI.type !== 5 || !ORI.node) continue;
    const obj = ORI.node as Mesh;
    for (const Mat of obj.material) {
      const k = Mat.info.Shade;
      if (k) Mat.info.Shade = Math.max(k, limit);
      if (Mat.info.Shade === 2) obj.flags &= ~0x20000;
    }
  }
  if (limit > 1) for (const OVI of Scene.OVI) if (OVI.ORI?.type === 5) meshOf(OVI).flags &= ~0x20000;
}
