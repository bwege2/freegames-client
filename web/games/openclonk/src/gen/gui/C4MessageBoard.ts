// @ts-nocheck
// OpenClonk 36de799: src/gui/C4MessageBoard.cpp, src/gui/C4MessageBoard.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { ftoi32 } from '../../rt/int.ts';
import { c$strlen } from '../../rt/libc.ts';
import { $padd, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $max, $min } from '../../rt/std.ts';

export class C4MessageBoard {
  Output = new $.C4Facet().init$v();
  ScreenFader = 0;
  Startup = false;
  Delay = 0;
  Fader = 0;
  Speed = 0;
  iBackScroll = 0;
  iLineHgt = 0;
  ScrollUpBinding = null;
  ScrollDownBinding = null;
  LogBuffer = new $.C4LogBuffer();

  init() {
    this.Output = new $.C4Facet().init$v();
    this.ScrollUpBinding = null;
    this.ScrollDownBinding = null;
    this.LogBuffer = new $.C4LogBuffer().init(30000, 1000, 0, S("  "), false);
    this.Delay = -1;
    this.Fader = 0;
    this.Speed = 2;
    $.C4Facet.prototype.Default.call(this.Output);
    this.Startup = false;
    this.ScreenFader = Math.fround(0);
    this.iBackScroll = -1;
    this.ScrollUpBinding = null;
    this.ScrollDownBinding = null;
    this.iLineHgt = 1;
    return this;
  }

  $dtor() {
    this.LogBuffer.Clear();
    this.LogBuffer.SetLBWidth(0);
  }

  Init(cgo, fStartup) {
    this.Output.$assign(cgo);
    this.Startup = fStartup;
    this.iLineHgt = $.GraphicsResource.FontRegular.GetLineHeight();
    this.LogBuffer.SetLBWidth(ftoi32(this.Output.Wdt));
    if (!this.Startup) {
      this.iBackScroll = -1;
      this.Fader = 0;
      this.Speed = 2;
      this.ScreenFader = 1;
      this.LogBuffer.SetLBWidth(ftoi32(this.Output.Wdt));
    }
    this.ScrollUpBinding = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(103, 4), S("MsgBoardScrollUp"), 4 /*KEYSCOPE_Fullscreen*/, new $.C4KeyCB$C4MessageBoard().init($.GraphicsSystem.MessageBoard, "ControlScrollUp"));
    this.ScrollDownBinding = new $.C4KeyBinding().init$C4KeyCodeEx$pi8$i32$pC4KeyboardCallbackInterface$u32(new $.C4KeyCodeEx().init(108, 4), S("MsgBoardScrollDown"), 4 /*KEYSCOPE_Fullscreen*/, new $.C4KeyCB$C4MessageBoard().init($.GraphicsSystem.MessageBoard, "ControlScrollDown"));
  }

  Execute() {
    if (this.Startup) {
      this.Draw(this.Output);
      return;
    }
    if ($.MessageInput.IsTypeIn() || this.iBackScroll >= 0) {
      this.ScreenFader = $max(Math.fround(this.ScreenFader - Math.fround(0.200000003)), -1);
    }
    if (this.iBackScroll < 0) {
      this.Draw(this.Output);
      if (!$.MessageInput.IsTypeIn()) {
        this.ScreenFader = $min(Math.fround(this.ScreenFader + Math.fround(0.0500000007)), 1);
      }
      return;
    }
    this.Speed = $max(1, this.iBackScroll / 5 | 0);
    if (this.Fader > 0) {
      this.Fader = $max(this.Fader - this.Speed | 0, 0);
    }
    if (this.Fader <= 0) {
      if (this.Delay === -1) {
        let szCurrMsg = this.LogBuffer.GetLine($min(-this.iBackScroll | 0, -1), null, null, null);
        if (szCurrMsg != null) {
          this.Delay = c$strlen(szCurrMsg) | 0;
        } else {
          this.Delay = 0;
        }
      }
      if (this.Delay > 0) {
        this.Delay = $max(this.Delay - this.Speed | 0, 0);
      }
      if (this.Delay === 0) {
        this.iBackScroll = $max(this.iBackScroll - 1 | 0, -1);
        this.Fader = this.iLineHgt;
        this.Delay = -1;
      }
    }
    this.Draw(this.Output);
  }

  Draw(cgo) {
    if (!$.Application.Active) {
      return;
    }
    if (this.Startup) {
      if ($.GraphicsSystem.pLoaderScreen != null) {
        $.GraphicsSystem.pLoaderScreen.Draw(cgo, 255 /*ALL*/, $.Game.InitProgress, this.LogBuffer);
      } else {
        $.pDraw.DrawBoxDw(cgo.Surface, 0, 0, ftoi32(cgo.Wdt), ftoi32(cgo.Hgt), 0);
      }
      return;
    }
    let iMsgFader = 6;
    if (this.ScreenFader >= 1) {
      return;
    }
    $.GraphicsSystem.OverwriteBg();
    for (let iMsg = -iMsgFader | 0; iMsg < 0; iMsg = iMsg + 1 | 0) {
      if ((iMsg - this.iBackScroll | 0) >= 0) {
        break;
      }
      let Message = this.LogBuffer.GetLine(iMsg - this.iBackScroll | 0, null, null, null);
      if (Message == null || Message.a[Message.o] === 0) {
        continue;
      }
      let iMsgY = ftoi32(Math.fround(Math.fround(Math.fround(cgo.Y + cgo.Hgt) + Math.fround(Math.imul(iMsg, this.iLineHgt))) + Math.fround(this.Fader)));
      let pPlr = this.GetMessagePlayer(Message);
      let dwColor = 0;
      if (pPlr != null) {
        dwColor = ($.PlrClr2TxtClr(pPlr.ColorDw) & 0xffffff) >>> 0;
      } else {
        dwColor = 0xffffff;
      }
      let fade = Math.fround($max(this.ScreenFader, 0) + Math.fround(Math.fround(Math.fround(Math.fround(iMsg) + 2) + Math.fround(Math.fround(this.Fader) / Math.fround(this.iLineHgt))) / Math.fround($min(2 - iMsgFader | 0, -1))));
      let dwFade = ((255 - $.Clamp$i32$i32$i32(ftoi32(Math.fround(fade * Math.fround(255))), 0, 255) | 0) << 24 | 0) >>> 0;
      dwColor = (dwColor | dwFade) >>> 0;
      $.pDraw.StringOut$pi8$rCStdFont$f32$pC4Surface$f32$f32$u32$u8$b(Message, $.GraphicsResource.FontRegular, Math.fround(1), cgo.Surface, cgo.X, Math.fround(iMsgY), dwColor);
    }
  }

  AddLog(szMessage) {
    if (szMessage == null || szMessage.a[szMessage.o] === 0) {
      return;
    }
    this.iBackScroll = this.iBackScroll + 1 | 0;
    this.LogBuffer.AppendLines(szMessage, $.GraphicsResource.FontRegular, 0, null);
  }

  ClearLog() {
    this.LogBuffer.Clear();
  }

  LogNotify() {
    if ($.pGUI.IsActive$v()) {
      return;
    }
    this.iBackScroll = 0;
    if ($.pDraw != null) {
      this.Draw(this.Output);
      if (this.Startup) {
        $.FullScreen.pSurface.PageFlip();
      }
    }
  }

  EnsureLastMessage() {
    if (this.Startup) {
      return;
    }
    for (let i = 0; i < 100; i = i + 1 | 0) {
      $.GraphicsSystem.Execute();
      this.Execute();
      if (this.iBackScroll < 0) {
        break;
      }
      this.Delay = 0;
    }
  }

  ControlScrollUp() {
    this.Delay = -1;
    this.Fader = 0;
    this.iBackScroll = this.iBackScroll + 1 | 0;
    return true;
  }

  ControlScrollDown() {
    this.Delay = -1;
    this.Fader = 0;
    if (this.iBackScroll > -1) {
      this.iBackScroll = this.iBackScroll - 1 | 0;
    }
    return true;
  }

  GetMessagePlayer(szMessage) {
    if ($.SEqual2(szMessage, S("* "))) {
      let str = new $.StdStrBuf();
      str.CopyUntil($padd(szMessage, 2), 32);
      return $.Players.GetByName(str.getData());
    }
    if ($.SCharCount(58, szMessage) !== 0) {
      let str = new $.StdStrBuf();
      str.CopyUntil($padd(szMessage, 2), 58);
      return $.Players.GetByName(str.getData());
    }
    return null;
  }

  $clone() { return new C4MessageBoard().$assign(this); }
  $assign(o) {
    this.Output.$assign(o.Output);
    this.ScreenFader = o.ScreenFader;
    this.Startup = o.Startup;
    this.Delay = o.Delay;
    this.Fader = o.Fader;
    this.Speed = o.Speed;
    this.iBackScroll = o.iBackScroll;
    this.iLineHgt = o.iLineHgt;
    this.ScrollUpBinding = o.ScrollUpBinding;
    this.ScrollDownBinding = o.ScrollDownBinding;
    this.LogBuffer.$assign(o.LogBuffer);
    return this;
  }
}




export function $init(): void {
  $.C4MSGB_MaxMsgFading$C4MessageBoard = 6;
  $.C4LogSize$C4MessageBoard = 30000;
  $.C4LogMaxLines$C4MessageBoard = 1000;
}

Object.assign($, { C4MessageBoard });
