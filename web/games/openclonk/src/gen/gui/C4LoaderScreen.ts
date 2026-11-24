// @ts-nocheck
// OpenClonk 36de799: src/gui/C4LoaderScreen.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { c$tolower } from '../../rt/libc.ts';
import { UnsyncedRandom$u32 } from '../../rt/native.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdMap, StdString, std_advance, std_transform } from '../../rt/std.ts';

export class C4LoaderScreen {
  fctBackground = new $.C4FacetSurface().init();
  szInfo = null;
  fBlackScreen = false;
  loaders = new StdMap();

  SeekLoaderScreens(rFromGrp, wildcard) {
    const filename = new Int8Array(4097);
    for (let found = rFromGrp.FindEntry$pi8$pi8(wildcard.c_str(), P(filename, 0)); found; found = rFromGrp.FindNextEntry$pi8$pi8$pu64$b(wildcard.c_str(), P(filename, 0))) {
      let extension = StdString.of($.GetExtension$2(P(filename, 0)));
      std_transform(extension.begin(), extension.end(), extension.begin(), c$tolower);
      if (extension.eq(S("png")) || extension.eq(S("jpg")) || extension.eq(S("jpeg")) || extension.eq(S("bmp"))) {
        this.loaders.insert(rFromGrp, StdString.of(P(filename, 0)));
      }
    }
  }

  init() {
    this.fctBackground = new $.C4FacetSurface().init();
    this.loaders = new StdMap();
    this.szInfo = null;
    this.fBlackScreen = false;
    return this;
  }

  $dtor() {
    if (this.szInfo != null) {
      $delete(this.szInfo);
    }
  }

  Init(loaderSpec) {
    if (loaderSpec.empty()) {
      loaderSpec.assign(S("Loader*"));
    }
    let pGroup = null;
    while ((pGroup = $.Game.GroupSet.FindGroup(2, pGroup, true)) != null) {
      this.SeekLoaderScreens(pGroup, loaderSpec);
    }
    let GfxGrp = new $.C4Group().init();
    if (this.loaders.empty()) {
      GfxGrp.Close$v();
      if (!$.Reloc.Open(GfxGrp, S("Graphics.ocg"))) {
        $.LogFatal($.FormatString($.LoadResStr(S("IDS_PRC_NOGFXFILE")), S("Graphics.ocg"), GfxGrp.GetError()).getData());
        return false;
      }
      this.SeekLoaderScreens(GfxGrp, loaderSpec);
      if (this.loaders.empty()) {
        this.SeekLoaderScreens(GfxGrp, StdString.of(S("Loader*")));
      }
      if (this.loaders.empty()) {
        $.LogFatal($.FormatString(S("No loaders found for loader specification: %s"), loaderSpec.c_str()).getData());
        return false;
      }
    }
    let entry = this.loaders.begin();
    std_advance(entry, UnsyncedRandom$u32(this.loaders.size() >>> 0));
    this.fctBackground.GetFace().SetBackground();
    if (!this.fctBackground.Load(entry.v.first, entry.v.second.c_str(), -1, -1, true, 0)) {
      return false;
    }
    if (this.szInfo != null) {
      $delete(this.szInfo);
      this.szInfo = null;
    }
    return true;
  }

  SetBlackScreen(fIsBlack) {
    this.fBlackScreen = fIsBlack;
  }

  Draw(cgo, options = 255 /*ALL*/, iProgress = 0, pLog = null, Process = 0) {
    if (this.fBlackScreen || options === 0) {
      $.pDraw.FillBG();
      return;
    }
    let iHIndent = 20;
    let iVIndent = 20;
    let iLogBoxHgt = 84;
    let iLogBoxMargin = 2;
    let iVMargin = 5;
    let iProgressBarHgt = 15;
    const LogFont = $.GraphicsResource.FontTiny;
    const rProgressBarFont = $.GraphicsResource.FontRegular;
    const TitleFont = $.GraphicsResource.FontTitle;
    let fLogBoxFontZoom = 1;
    if ((options & 1) !== 0) {
      this.fctBackground.DrawFullScreen(cgo);
    }
    if ((options & 2) !== 0) {
      $.pDraw.StringOut$pi8$rCStdFont$f32$pC4Surface$f32$f32$u32$u8$b($.Game.ScenarioTitle.getData(), TitleFont, 1, cgo.Surface, Math.fround(cgo.Wdt - Math.fround(iHIndent)), Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin)) - Math.fround(iProgressBarHgt)) - Math.fround(iVMargin)) - Math.fround(TitleFont.GetLineHeight())), 0xdddddddd, 2, false);
    }
    if ((options & 4) !== 0) {
      $.pDraw.DrawBoxDw(cgo.Surface, iHIndent, ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin)) - Math.fround(iProgressBarHgt))), ftoi32(Math.fround(cgo.Wdt - Math.fround(iHIndent))), ftoi32(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin))), 0xb0000000);
      let iProgressBarWdt = ftoi32(Math.fround(Math.fround(cgo.Wdt - Math.fround(Math.imul(iHIndent, 2))) - Math.fround(2)));
      if ($.GraphicsResource.fctProgressBar.Surface != null) {
        $.GraphicsResource.fctProgressBar.DrawX(cgo.Surface, Math.fround(iHIndent + 1 | 0), Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin)) - Math.fround(iProgressBarHgt)) + Math.fround(1)), Math.fround(Math.imul(iProgressBarWdt, iProgress) / 100 | 0), Math.fround(iProgressBarHgt - 2 | 0));
      } else {
        $.pDraw.DrawBoxDw(cgo.Surface, iHIndent + 1 | 0, ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin)) - Math.fround(iProgressBarHgt)) + Math.fround(1))), (iHIndent + 1 | 0) + (Math.imul(iProgressBarWdt, iProgress) / 100 | 0) | 0, ftoi32(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin)) - Math.fround(1))), 0xb0ff0000);
      }
      $.pDraw.StringOut$pi8$rCStdFont$f32$pC4Surface$f32$f32$u32$u8$b($.FormatString(S("%i%%"), iProgress).getData(), rProgressBarFont, 1, cgo.Surface, Math.fround(cgo.Wdt / Math.fround(2)), Math.fround(Math.fround(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) - Math.fround(iVMargin)) - Math.fround(rProgressBarFont.GetLineHeight() / 2 | 0)) - Math.fround(iProgressBarHgt / 2 | 0)), 0xffffffff, 1, true);
    }
    if ((options & 8) !== 0) {
      if (pLog != null) {
        $.pDraw.DrawBoxDw(cgo.Surface, iHIndent, ftoi32(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt))), ftoi32(Math.fround(cgo.Wdt - Math.fround(iHIndent))), ftoi32(Math.fround(cgo.Hgt - Math.fround(iVIndent))), 0x7f000000);
        let iLineHgt = ftoi32(Math.fround(fLogBoxFontZoom * Math.fround(LogFont.GetLineHeight())));
        if (iLineHgt === 0) {
          iLineHgt = 5;
        }
        let iLinesVisible = (iLogBoxHgt - Math.imul(2, iLogBoxMargin) | 0) / iLineHgt | 0;
        let iX = iHIndent + iLogBoxMargin | 0;
        let iY = ftoi32(Math.fround(Math.fround(Math.fround(cgo.Hgt - Math.fround(iVIndent)) - Math.fround(iLogBoxHgt)) + Math.fround(iLogBoxMargin)));
        const w = [0];
        const h = [0];
        for (let i = -iLinesVisible | 0; i < 0; i = i + 1 | 0) {
          let szLine = pLog.GetLine(i, null, null, null);
          if (szLine == null || szLine.a[szLine.o] === 0) {
            continue;
          }
          LogFont.GetTextExtent(szLine, P(w, 0), P(h, 0), true);
          $.pDraw.TextOut(szLine, LogFont, fLogBoxFontZoom, cgo.Surface, Math.fround(iX), Math.fround(iY));
          iY = iY + h[0] | 0;
        }
        if ((options & 15) !== 0) {
          if (Process !== 0) {
            iY = iY - h[0] | 0;
            iX = iX + w[0] | 0;
            $.pDraw.TextOut($.FormatString(S("%i%%"), Process).getData(), LogFont, fLogBoxFontZoom, cgo.Surface, Math.fround(iX), Math.fround(iY));
          }
        }
      }
    }
  }

  $clone() { return new C4LoaderScreen().$assign(this); }
  $assign(o) {
    this.fctBackground.$assign(o.fctBackground);
    this.szInfo = o.szInfo;
    this.fBlackScreen = o.fBlackScreen;
    this.loaders = o.loaders.$clone();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4LoaderScreen });
