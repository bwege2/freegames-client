// No Gravity port (GPL-3.0-or-later; translated in 2026 by the freegames project from realtech VR's
// No Gravity 2.0, GPL-2.0-or-later; LICENSE.md): the full-screen pictures (src/lt_video.c) and the
// waiting for a key (src/lt_input.c).
import { csp, CSP_Color, rgb, GX, WriteCenterText, DrawCenterText } from '../gx/gx.ts';
import {
  Flip, idle, sKEY, sMOU, sKEY_IsClicked, sKEY_IsHeld, sMOU_IsClicked, s, timer_sec, STUB_TaskControl,
} from '../sys/sys.ts';
import { loadBackground, T } from './data.ts';
import { NG_AudioPlayTrack, NG_AudioSay, NG_AudioPlaySound, NG_AudioGetByName, NG_AudioStopMusic } from './sound.ts';
import { G, g_SGSettings, Ms_INTRO, Ms_FAILED } from './state.ts';

/** NG_WaitForKeyPress: 2 = Esc / right button, 1 = Enter (held) / left button */
export function NG_WaitForKeyPress(): number {
  let a = 0;
  sKEY.Update(); sMOU.Update();
  if (sKEY_IsClicked(s.esc) || sMOU_IsClicked(1)) a |= 2;
  if (sKEY_IsHeld(s.return) || sMOU_IsClicked(0)) a |= 1;
  return a;
}
/** NG_WaitForKeyWithDelay: up to dt seconds */
export async function NG_WaitForKeyWithDelay(dt: number): Promise<void> {
  const t = timer_sec() + dt;
  while (!STUB_TaskControl()) {
    if (NG_WaitForKeyPress()) break;
    if (timer_sec() >= t) break;
    await idle();
  }
}
/** NG_DrawBackgroundPic */
export async function NG_DrawBackgroundPic(file: string, TrackPlay: number): Promise<void> {
  G.g_csPicture = loadBackground(file);
  if (TrackPlay >= 0) NG_AudioPlayTrack(TrackPlay);
}
/** NG_FadeInBackground / NG_FadeOutBackground: 64 frames (step 4, the hardware renderer) */
export async function NG_FadeInBackground(): Promise<void> {
  for (let i = 0; i < 255; i += 4) {
    const k = i === 256 - 4 ? 255 : i;
    if (i === 0) CSP_Color(0);
    CSP_Color(rgb(k, k, k));
    csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
    await Flip();
  }
}
export async function NG_FadeOutBackground(): Promise<void> {
  for (let i = 0; i < 255; i += 4) {
    const k = i === 256 - 4 ? 0 : 255 - i;
    CSP_Color(rgb(k, k, k));
    csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
    await Flip();
  }
}
/** NG_PlayGameOver: "continue?" with a 20 second countdown; sets g_SGSettings.Menu */
export async function NG_PlayGameOver(): Promise<void> {
  await NG_DrawBackgroundPic('menu/failed.png', Ms_FAILED);
  await NG_FadeInBackground();
  g_SGSettings.Menu = 0;
  NG_AudioSay('ins05');
  const g_uiTrackTime = timer_sec();
  let esc = false, delta: number;
  while ((delta = timer_sec() - g_uiTrackTime) < 20 && !esc) {
    sKEY.Update();
    CSP_Color(rgb(255, 255, 255));
    csp.zoom_pset(G.g_csPicture!, 0, 0, GX.View.lWidth, GX.View.lHeight);
    WriteCenterText(T(145), Math.trunc((2 * GX.View.ymax) / 3), G.g_pFontMenuSml);
    DrawCenterText(String(19 - delta).padStart(2, '0'), Math.trunc((3 * GX.View.ymax) / 4), G.g_pFontMenuLrg, csp.put);
    await Flip();
    if (sKEY_IsHeld(s.esc) || sKEY_IsHeld(s.n)) { esc = true; g_SGSettings.Menu = 0; }
    if (sKEY_IsHeld(s.space) || sKEY_IsHeld(s.y) || sKEY_IsHeld(s.j) || sKEY_IsHeld(s.o)) { esc = true; g_SGSettings.Menu = 1; }
  }
  await NG_FadeOutBackground();
  G.g_csPicture = null;
  NG_AudioPlaySound(NG_AudioGetByName('explode2') - 1, 0);
  NG_AudioStopMusic();
}
/** NG_PlayPresentsGame: the realtech and Lithium pictures */
export async function NG_PlayPresentsGame(): Promise<void> {
  await NG_DrawBackgroundPic('menu/realtech.png', Ms_INTRO);
  await NG_FadeInBackground();
  await NG_WaitForKeyWithDelay(2);
  await NG_FadeOutBackground();
  await NG_DrawBackgroundPic('menu/lithium.png', -1);
  await NG_FadeInBackground();
  await NG_WaitForKeyWithDelay(4);
  await NG_FadeOutBackground();
  G.g_csPicture = null;
  NG_AudioStopMusic();
}
/** NG_PlayTheEnd: after the last episode */
export async function NG_PlayTheEnd(): Promise<void> {
  await NG_DrawBackgroundPic('menu/theend.png', -1);
  await NG_FadeInBackground();
  await NG_WaitForKeyWithDelay(30);
  await NG_FadeOutBackground();
  G.g_csPicture = null;
}
