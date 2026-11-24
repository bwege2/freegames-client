// @ts-nocheck
// OpenClonk 36de799: src/gui/C4UpperBoard.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { c$localtime, c$strftime, c$time } from '../../rt/libc.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $max } from '../../rt/std.ts';

export class C4UpperBoard {
  Output = new $.C4Facet().init$v();
  cTimeString = new Int8Array(64);
  cTimeString2 = new Int8Array(64);
  TextWidth = 0;
  TextYPosition = 0;

  init() {
    this.Output = new $.C4Facet().init$v();
    return this;
  }

  Init(cgo) {
    this.Output.$assign(cgo);
    if ($.GraphicsResource.fctUpperBoard.Surface == null) {
      return;
    }
    this.Output.Hgt = $max(this.Output.Hgt, $.GraphicsResource.fctUpperBoard.Hgt);
    $.ssprintf$21(this.cTimeString, S("%02d:%02d:%02d"), $.Game.Time / 3600 | 0, $.Game.Time % 3600 / 60 | 0, $.Game.Time % 60);
    this.TextWidth = $.GraphicsResource.FontRegular.GetTextWidth(P(this.cTimeString, 0));
    this.TextYPosition = ftoi32(Math.fround(Math.fround(cgo.Hgt / Math.fround(2)) - Math.fround($.GraphicsResource.FontRegular.GetLineHeight() / 2 | 0)));
  }

  Execute() {
    if ($.Config.Graphics.UpperBoard === 0) {
      return;
    }
    $.ssprintf$21(this.cTimeString, S("%02d:%02d:%02d"), $.Game.Time / 3600 | 0, $.Game.Time % 3600 / 60 | 0, $.Game.Time % 60);
    const t = [c$time(null)];
    c$strftime(P(this.cTimeString2, 0), 64, S("[%H:%M:%S]"), c$localtime(P(t, 0)));
    this.Draw(this.Output);
  }

  Draw(cgo) {
    let $t1, $t2, $t3;
    if (cgo.Surface == null) {
      return;
    }
    $.pDraw.BlitSurfaceTile($.GraphicsResource.fctUpperBoard.Surface, this.Output.Surface, Math.fround(0), Math.fround(0), this.Output.Wdt, this.Output.Hgt, Math.fround(0), Math.fround(0), null);
    let cgo2 = new $.C4Facet().init$v();
    let fLogoZoom = 1;
    cgo2.Set$pC4Surface$f32$f32$f32$f32(cgo.Surface, Math.fround(ftoi32(Math.fround(Math.fround(cgo.Wdt / Math.fround(2)) - Math.fround(Math.fround($.GraphicsResource.fctLogo.Wdt / Math.fround(2)) * fLogoZoom)))), Math.fround(0), Math.fround(ftoi32(Math.fround($.GraphicsResource.fctLogo.Wdt * fLogoZoom))), Math.fround(ftoi32(Math.fround($.GraphicsResource.fctLogo.Hgt * fLogoZoom))));
    $.GraphicsResource.fctLogo.Draw$rC4Facet$b$i32$i32$b(cgo2);
    let iRightOff = 1;
    $.pDraw.TextOut(P(this.cTimeString, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(($.GetScreenWdt() - Math.imul(($t1 = iRightOff, iRightOff = iRightOff + 1 | 0, $t1), this.TextWidth) | 0) - 10 | 0), Math.fround(this.TextYPosition), 0xffffffff);
    if ($.Config.Graphics.ShowClock !== 0) {
      $.pDraw.TextOut(P(this.cTimeString2, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(($.GetScreenWdt() - Math.imul(($t2 = iRightOff, iRightOff = iRightOff + 1 | 0, $t2), this.TextWidth) | 0) - 30 | 0), Math.fround(this.TextYPosition), 0xffffffff);
    }
    if ($.Config.General.FPS !== 0) {
      $.ssprintf$21(this.cTimeString, S("%d FPS"), $.Game.FPS);
      $.pDraw.TextOut(P(this.cTimeString, 0), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(($.GetScreenWdt() - Math.imul(($t3 = iRightOff, iRightOff = iRightOff + 1 | 0, $t3), this.TextWidth) | 0) - 30 | 0), Math.fround(this.TextYPosition), 0xffffffff);
    }
    $.pDraw.TextOut($.Game.ScenarioTitle.getData(), $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, Math.fround(10), Math.fround(Math.fround(cgo.Hgt / Math.fround(2)) - Math.fround($.GraphicsResource.FontRegular.GetLineHeight() / 2 | 0)), 0xffffffff);
  }

  $clone() { return new C4UpperBoard().$assign(this); }
  $assign(o) {
    this.Output.$assign(o.Output);
    this.cTimeString = o.cTimeString.slice();
    this.cTimeString2 = o.cTimeString2.slice();
    this.TextWidth = o.TextWidth;
    this.TextYPosition = o.TextYPosition;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4UpperBoard });
