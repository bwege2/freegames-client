// C-Dogs SDL 2.5.0, translated: the loading screen (loading_screens.c): panels appear in a shuffled order (rand()),
// with a click sound every second frame. GPL-2.0-or-later / BSD-2-Clause (web/games/cdogs/LICENSE.md).
import { CArrayShuffle, CLAMP, colorWhite, f32 } from '../core/base.ts';
import { PicManagerGetPic, gPicManager, type Pic } from '../core/pics.ts';
import { gSoundDevice, SoundPlayAtPlusDistance, StrSound, type SoundRef } from '../core/sounds.ts';
import { ALIGN_CENTER, FontOptsNew, FontStrOpt, PicRender, gGfx } from '../render/gfx.ts';
import { GameLoopDataNew, UPDATE_RESULT_DRAW, UPDATE_RESULT_OK, type GameLoopData, type LoopRunner } from './loop.ts';

const gLoadingScreen = { logo: null as Pic | null, panel: null as Pic | null, panelIndices: [] as number[], sndTick: null as SoundRef };

function LazyLoad(): void {
  const l = gLoadingScreen;
  if (l.logo == null) l.logo = PicManagerGetPic(gPicManager, 'logo');
  if (l.panel == null) l.panel = PicManagerGetPic(gPicManager, 'bigpanel');
  if (l.panel) {
    const n = (Math.trunc(gGfx.w / l.panel.size.x) + 1) * (Math.trunc(gGfx.h / l.panel.size.y) + 1);
    if (n !== l.panelIndices.length) {
      l.panelIndices = Array.from({ length: n }, (_, i) => i);
      CArrayShuffle(l.panelIndices);
    }
  }
  if (gSoundDevice.isInitialised && l.sndTick == null) l.sndTick = StrSound('click');
}
export function LoadingScreenDrawInner(text: string, showPct: number): void {
  const l = gLoadingScreen;
  LazyLoad();
  if (l.panel) {
    const stride = Math.trunc(gGfx.w / l.panel.size.x) + 1;
    const limit = Math.trunc(f32(l.panelIndices.length * showPct));
    for (let i = 0; i < l.panelIndices.length; i++) {
      if (i > limit) break;
      const idx = l.panelIndices[i];
      const y = Math.trunc(idx / stride);
      const x = idx - y * stride;
      PicRender(l.panel, { x: x * l.panel.size.x, y: y * l.panel.size.y }, colorWhite);
    }
  }
  if (l.logo) {
    PicRender(l.logo, { x: Math.trunc((gGfx.w - l.logo.size.x) / 2), y: Math.trunc((Math.trunc(gGfx.h / 2) - l.logo.size.y) / 2) }, colorWhite);
  }
  const opts = FontOptsNew();
  opts.HAlign = ALIGN_CENTER;
  opts.VAlign = ALIGN_CENTER;
  opts.Area = { x: gGfx.w, y: Math.trunc(gGfx.h / 2) };
  FontStrOpt(text, { x: 0, y: Math.trunc(gGfx.h / 2) }, opts);
}
export function ScreenLoading(text: string, ascending: boolean, nextLoop: GameLoopData | null, removeParent: boolean): GameLoopData {
  let showPct = ascending ? 0 : 1;
  let count = 0;
  const data = GameLoopDataNew({
    label: 'loading',
    UpdateFunc: (l: LoopRunner) => {
      const complete = showPct === (ascending ? 1 : 0);
      if (count % 2 === 0) SoundPlayAtPlusDistance(gSoundDevice, gLoadingScreen.sndTick, gSoundDevice.earLeft1, 255);
      count++;
      if (complete) {
        l.pop();
        if (ascending) {
          if (removeParent) l.pop();
          if (nextLoop) {
            l.push(nextLoop);
            l.push(ScreenLoading(text, false, null, false));
          }
        }
        return UPDATE_RESULT_OK;
      }
      showPct = f32(showPct + (ascending ? f32(0.04) : f32(-0.06)));
      showPct = CLAMP(showPct, 0, 1);
      return UPDATE_RESULT_DRAW;
    },
    DrawFunc: () => LoadingScreenDrawInner(text, showPct),
  });
  data.DrawParent = true;
  return data;
}
