// @ts-nocheck
// OpenClonk 36de799: src/game/C4GraphicsSystem.cpp, src/game/C4GraphicsSystem.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$glReadPixels } from '../../rt/gl.ts';
import { ftoi32 } from '../../rt/int.ts';
import { c$ceil } from '../../rt/libc.ts';
import { $padd, $reinterp, P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { $delete, StdString } from '../../rt/std.ts';

export class C4GraphicsSystem {
  MessageBoard = null;
  UpperBoard = new $.C4UpperBoard().init();
  iRedrawBackground = 0;
  ShowHelp = false;
  ShowVertices = false;
  ShowAction = false;
  ShowCommand = false;
  ShowEntrance = false;
  ShowPathfinder = false;
  ShowNetstatus = false;
  Show8BitSurface = 0;
  ShowLights = false;
  ShowMenuInfo = false;
  pLoaderScreen = null;
  FlashMessageText = new Int8Array(513);
  FlashMessageTime = 0;
  FlashMessageX = 0;
  FlashMessageY = 0;
  lastFrame = new $.C4TimeMilliseconds();

  init() {
    this.MessageBoard = null;
    this.UpperBoard = new $.C4UpperBoard().init();
    this.lastFrame = new $.C4TimeMilliseconds();
    C4GraphicsSystem.prototype.Default.call(this);
    return this;
  }

  $dtor() {
    C4GraphicsSystem.prototype.Clear.call(this);
  }

  Default() {
    this.MessageBoard = new $.C4MessageBoard().init();
    this.InvalidateBg();
    this.ShowVertices = false;
    this.ShowAction = false;
    this.ShowCommand = false;
    this.ShowEntrance = false;
    this.ShowPathfinder = false;
    this.ShowNetstatus = false;
    this.Show8BitSurface = 0;
    this.ShowLights = false;
    this.ShowMenuInfo = false;
    this.ShowHelp = false;
    this.FlashMessageText[0] = 0;
    this.FlashMessageTime = 0;
    this.FlashMessageX = 0;
    this.FlashMessageY = 0;
    this.pLoaderScreen = null;
  }

  Clear() {
    this.MessageBoard = null;
    if (this.pLoaderScreen != null) {
      $delete(this.pLoaderScreen);
      this.pLoaderScreen = null;
    }
    $.Viewports.Clear();
    this.DeactivateDebugOutput();
  }

  StartDrawing() {
    if ($.pDraw == null) {
      return false;
    }
    if (!$.pDraw.Active) {
      return false;
    }
    if (!$.Application.Active && $.op_sub$C4TimeMilliseconds$C4TimeMilliseconds($.C4TimeMilliseconds.Now(), this.lastFrame) < 200) {
      return false;
    }
    return true;
  }

  FinishDrawing() {
    if ($.Application.isEditor === 0) {
      $.FullScreen.pSurface.PageFlip();
    }
    this.lastFrame.$assign($.C4TimeMilliseconds.Now());
  }

  Execute() {
    if (!this.StartDrawing()) {
      return;
    }
    let did_draw_background = false;
    if (!$.pGUI.HasFullscreenDialog(true)) {
      if ($.Network.isLobbyActive() || !$.Game.IsRunning) {
        if ($.Application.isEditor === 0) {
          if (this.iRedrawBackground !== 0) {
            this.ClearFullscreenBackground();
          }
          this.MessageBoard.Execute();
          if (!$.IsActive()) {
            this.FinishDrawing();
            return;
          }
          did_draw_background = true;
        }
      }
    }
    if ($.Application.isEditor === 0 && $.IsActive() && ($.pGUI.HasFullscreenDialog(false) || !$.Game.IsRunning)) {
      if (!did_draw_background && this.iRedrawBackground !== 0) {
        this.ClearFullscreenBackground();
      }
      $.pGUI.Render(!did_draw_background);
      this.FinishDrawing();
      return;
    }
    $.Objects.ResetAudibility();
    if (!$.IsActive()) {
      $.pGUI.SetMouseInGUI(false, false);
    }
    $.Viewports.Execute($.Application.isEditor === 0 && this.iRedrawBackground !== 0);
    if (this.iRedrawBackground !== 0) {
      this.iRedrawBackground = this.iRedrawBackground - 1 | 0;
    }
    if ($.Application.isEditor === 0) {
      this.UpperBoard.Execute();
      this.MessageBoard.Execute();
      this.DrawHelp();
      this.DrawHoldMessages();
      this.DrawFlashMessage();
    }
    if ($.IsActive()) {
      $.pGUI.Render(false);
    }
    this.FinishDrawing();
  }

  FlashMessage(message) {
    $.SCopy$pi8$pi8$u64(message, P(this.FlashMessageText, 0), 512);
    this.FlashMessageTime = $.SLen(P(this.FlashMessageText, 0)) * 2 | 0;
    this.FlashMessageX = -1;
    this.FlashMessageY = 10;
    if ($.Config.Graphics.UpperBoard !== 0) {
      this.FlashMessageY = this.FlashMessageY + 50 | 0;
    }
    if ($.Viewports.GetViewportCount() > 1) {
      this.FlashMessageY = this.FlashMessageY + 64 | 0;
    }
    this.InvalidateBg();
  }

  FlashMessageOnOff(description, switch_on) {
    let message = new $.StdStrBuf();
    message.Format(S("%s: %s"), description, $.LoadResStr(switch_on ? S("IDS_CTL_ON") : S("IDS_CTL_OFF")));
    this.FlashMessage(message.getData());
  }

  DeactivateDebugOutput() {
    this.ShowVertices = false;
    this.ShowAction = false;
    this.ShowCommand = false;
    this.ShowEntrance = false;
    this.ShowPathfinder = false;
    this.ShowLights = false;
    this.Show8BitSurface = 0;
    this.ShowNetstatus = false;
    this.ShowMenuInfo = false;
  }

  Init() {
    return true;
  }

  InitLoaderScreen(image_name) {
    let loader = new $.C4LoaderScreen().init();
    loader.SetBlackScreen(false);
    if (!loader.Init(StdString.of(image_name))) {
      $delete(loader);
      return false;
    }
    if (this.pLoaderScreen != null) {
      $delete(this.pLoaderScreen);
    }
    this.pLoaderScreen = loader;
    return true;
  }

  EnableLoaderDrawing() {
    if (this.pLoaderScreen != null) {
      this.pLoaderScreen.SetBlackScreen(false);
    }
  }

  SaveScreenshotKey(save_all) {
    return this.SaveScreenshot(save_all, 2);
  }

  SaveScreenshot(save_all, zoom_factor_all) {
    let $t1;
    const filename = new Int8Array(4097);
    if (!('C4GraphicsSystem$SaveScreenshot$screenshot_index' in $)) $.C4GraphicsSystem$SaveScreenshot$screenshot_index = 1;
    let filepath = null;
    do {
      $.ssprintf$17(filename, S("Screenshot%03i.png"), ($t1 = $.C4GraphicsSystem$SaveScreenshot$screenshot_index, $.C4GraphicsSystem$SaveScreenshot$screenshot_index = $.C4GraphicsSystem$SaveScreenshot$screenshot_index + 1 | 0, $t1));
    } while ($.FileExists(filepath = $.Config.AtScreenshotPath(P(filename, 0))));
    let can_save = this.DoSaveScreenshot(save_all, filepath, zoom_factor_all);
    if (!can_save) {
      $.LogF($.LoadResStr(S("IDS_PRC_SCREENSHOTERROR")), $.Config.AtUserDataRelativePath($.Config.AtScreenshotPath(P(filename, 0))));
    } else {
      $.LogF($.LoadResStr(S("IDS_PRC_SCREENSHOT")), $.Config.AtUserDataRelativePath($.Config.AtScreenshotPath(P(filename, 0))));
    }
    return !!can_save;
  }

  DoSaveScreenshot(save_all, filename, zoom_factor_all) {
    let $t1;
    if ($.Application.isEditor !== 0) {
      $.Log($.LoadResStr(S("IDS_PRC_SCREENSHOTERROREDITOR")));
      return false;
    }
    if ($.FullScreen.pSurface == null) {
      return false;
    }
    if (save_all) {
      let zoom = zoom_factor_all;
      let viewport = $.Viewports.GetFirstViewport();
      if (viewport == null) {
        return false;
      }
      let png = new $.CPNGFile().init();
      let lWdt = ftoi32(Math.fround(Math.fround($.Landscape.GetWidth()) * zoom));
      let lHgt = ftoi32(Math.fround(Math.fround($.Landscape.GetHeight()) * zoom));
      if (!png.Create(lWdt, lHgt, false)) {
        return false;
      }
      let bkWdt = $.GetScreenWdt();
      let bkHgt = $.GetScreenHgt();
      if (bkWdt === 0 || bkHgt === 0) {
        return false;
      }
      let bkFct = new $.C4TargetFacet().init();
      this.InvalidateBg();
      viewport.SetOutputSize(0, 0, 0, 0, bkWdt, bkHgt);
      let SkyParX = $.Landscape.GetSky().ParX;
      $.Landscape.GetSky().ParX = 10;
      let SkyParY = $.Landscape.GetSky().ParY;
      $.Landscape.GetSky().ParY = 10;
      let vp_borders = ((($o) => ($o.left = viewport.BorderLeft, $o.right = viewport.BorderRight, $o.top = viewport.BorderTop, $o.bottom = viewport.BorderBottom, $o))(new $.FLOAT_RECT()));
      viewport.BorderLeft = viewport.BorderRight = viewport.BorderTop = viewport.BorderBottom = 0;
      let viewport_player = viewport.Player;
      viewport.Player = -1;
      for (let iY = 0; iY < lHgt; iY = iY + bkHgt | 0) {
        for (let iX = 0; iX < lWdt; iX = iX + bkWdt | 0) {
          let bkWdt2 = bkWdt;
          let bkHgt2 = bkHgt;
          if ((iX + bkWdt2 | 0) > lWdt) {
            bkWdt2 = bkWdt2 - ((iX + bkWdt2 | 0) - lWdt | 0) | 0;
          }
          if ((iY + bkHgt2 | 0) > lHgt) {
            bkHgt2 = bkHgt2 - ((iY + bkHgt2 | 0) - lHgt | 0) | 0;
          }
          bkFct.Set$pC4Surface$f32$f32$f32$f32$f32$f32$f32$f32$f32($.FullScreen.pSurface, Math.fround(0), Math.fround(0), Math.fround(c$ceil(Math.fround(Math.fround(bkWdt2) / zoom))), Math.fround(c$ceil(Math.fround(Math.fround(bkHgt2) / zoom))), Math.fround(Math.fround(iX) / zoom), Math.fround(Math.fround(iY) / zoom), zoom, Math.fround(0), Math.fround(0));
          viewport.Draw(bkFct, true, false);
          $.FullScreen.pSurface.PageFlip();
          $.FullScreen.pSurface.PageFlip();
          if ($.FullScreen.pSurface.Lock()) {
            for (let iY2 = 0; iY2 < bkHgt2; iY2 = iY2 + 1 | 0) {
              gl$glReadPixels(0, ($.FullScreen.pSurface.Hgt - iY2 | 0) - 1 | 0, bkWdt2, 1, 32992, 5121, $padd($reinterp(png.GetRow(iY + iY2 | 0), "u8"), Math.imul(iX, 3)));
            }
            $.FullScreen.pSurface.Unlock();
            $.Application.MusicSystem.Execute(true);
          }
        }
      }
      viewport.Player = viewport_player;
      viewport.BorderLeft = vp_borders.left;
      viewport.BorderTop = vp_borders.top;
      viewport.BorderRight = vp_borders.right;
      viewport.BorderBottom = vp_borders.bottom;
      $.Landscape.GetSky().ParX = SkyParX;
      $.Landscape.GetSky().ParY = SkyParY;
      $.Viewports.RecalculateViewports();
      $.CPNGFile.ScheduleSaving(($t1 = png, png = null, $t1), filename);
      return true;
    }
    return $.FullScreen.pSurface.SavePNG$pi8$b$b$b(filename, false, false, true);
  }

  InvalidateBg() {
    this.iRedrawBackground = 2;
  }

  OverwriteBg() {
    this.InvalidateBg();
  }

  DrawHelp() {
    if (!this.ShowHelp || $.Application.isEditor !== 0) {
      return;
    }
    let x = ftoi32($.Viewports.ViewportArea.X);
    let y = ftoi32($.Viewports.ViewportArea.Y);
    let wdt = ftoi32($.Viewports.ViewportArea.Wdt);
    let text = new $.StdStrBuf();
    text.AppendFormat(S("[%s]\n\n"), $.LoadResStr(S("IDS_CTL_GAMEFUNCTIONS")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("ToggleShowHelp")).getData(), $.LoadResStr(S("IDS_CON_HELP")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("MusicToggle")).getData(), $.LoadResStr(S("IDS_CTL_MUSIC")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("NetClientListDlgToggle")).getData(), $.LoadResStr(S("IDS_DLG_NETWORK")));
    let strAltChatKey = new $.StdCopyStrBuf().init$mStdStrBuf($.GetKeyboardInputName(S("ChatOpen"), false, 0));
    text.AppendFormat(S("\n<c ffff00>%s/%s</c> - %s\n"), $.GetKeyboardInputName(S("ChatOpen"), false, 1).getData(), strAltChatKey.getData(), $.LoadResStr(S("IDS_CTL_SENDMESSAGE")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("MsgBoardScrollUp")).getData(), $.LoadResStr(S("IDS_CTL_MESSAGEBOARDBACK")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("MsgBoardScrollDown")).getData(), $.LoadResStr(S("IDS_CTL_MESSAGEBOARDFORWARD")));
    text.AppendFormat(S("\n<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("ToggleChat")).getData(), $.LoadResStr(S("IDS_CTL_IRCCHAT")));
    text.AppendFormat(S("\n<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("ScoreboardToggle")).getData(), $.LoadResStr(S("IDS_CTL_SCOREBOARD")));
    text.AppendFormat(S("\n<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("Screenshot")).getData(), $.LoadResStr(S("IDS_CTL_SCREENSHOT")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("ScreenshotEx")).getData(), $.LoadResStr(S("IDS_CTL_SCREENSHOTEX")));
    $.pDraw.TextOut(text.getData(), $.GraphicsResource.FontRegular, Math.fround(1), $.FullScreen.pSurface, Math.fround(x + 128 | 0), Math.fround(y + 64 | 0), 0xffffffff, 0);
    text.Clear();
    text.AppendFormat(S("\n\n<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("GameSpeedUp")).getData(), $.LoadResStr(S("IDS_CTL_GAMESPEEDUP")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("GameSlowDown")).getData(), $.LoadResStr(S("IDS_CTL_GAMESPEEDDOWN")));
    text.AppendFormat(S("\n\n[%s]\n\n"), S("Debug"));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("DbgModeToggle")).getData(), $.LoadResStr(S("IDS_CTL_DEBUGMODE")));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("DbgShowVtxToggle")).getData(), S("Entrance+Vertices"));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("DbgShowActionToggle")).getData(), S("Actions/Commands/Pathfinder/Lights/Menus"));
    text.AppendFormat(S("<c ffff00>%s</c> - %s\n"), $.GetKeyboardInputName(S("DbgShow8BitSurface")).getData(), S("8-bit surfaces"));
    $.pDraw.TextOut(text.getData(), $.GraphicsResource.FontRegular, Math.fround(1), $.FullScreen.pSurface, Math.fround((x + (wdt / 2 | 0) | 0) + 64 | 0), Math.fround(y + 64 | 0), 0xffffffff, 0);
  }

  DrawFlashMessage() {
    if (this.FlashMessageTime === 0 || $.Application.isEditor !== 0) {
      return;
    }
    $.pDraw.TextOut(P(this.FlashMessageText, 0), $.GraphicsResource.FontRegular, Math.fround(1), $.FullScreen.pSurface, Math.fround(this.FlashMessageX === -1 ? $.GetScreenWdt() / 2 | 0 : this.FlashMessageX), Math.fround(this.FlashMessageY === -1 ? $.GetScreenHgt() / 2 | 0 : this.FlashMessageY), 0xffffffff, (this.FlashMessageX === -1 ? $.ACenter$C4Surface : $.ALeft$C4Surface) & 0xff);
    this.FlashMessageTime = this.FlashMessageTime - 1 | 0;
    if (this.FlashMessageTime === 0) {
      this.InvalidateBg();
    }
  }

  DrawHoldMessages() {
    if ($.Application.isEditor === 0 && $.Game.HaltCount !== 0) {
      $.pDraw.TextOut(S("Pause"), $.GraphicsResource.FontRegular, Math.fround(1), $.FullScreen.pSurface, Math.fround($.GetScreenWdt() / 2 | 0), Math.fround(($.GetScreenHgt() / 2 | 0) - Math.imul($.GraphicsResource.FontRegular.GetLineHeight(), 2) | 0), 0xffffffff, 1);
      $.GraphicsSystem.OverwriteBg();
    }
  }

  ClearFullscreenBackground() {
    $.pDraw.FillBG(0);
    this.iRedrawBackground = this.iRedrawBackground - 1 | 0;
  }

  ToggleShow8BitSurface() {
    if (!$.Game.DebugMode && !$.Console.Active) {
      this.FlashMessage($.LoadResStr(S("IDS_MSG_NODEBUGMODE")));
      return false;
    }
    this.Show8BitSurface = (this.Show8BitSurface + 1 | 0) % 3;
    if (this.Show8BitSurface === 0) {
      this.FlashMessage(S("Default view"));
    } else if (this.Show8BitSurface === 1) {
      this.FlashMessage(S("Foreground 8-bit landscape"));
    } else if (this.Show8BitSurface === 2) {
      this.FlashMessage(S("Background 8-bit landscape"));
    }
    return true;
  }

  ToggleShowNetStatus() {
    this.ShowNetstatus = !this.ShowNetstatus;
    return true;
  }

  ToggleShowVertices() {
    if (!$.Game.DebugMode && !$.Console.Active) {
      this.FlashMessage($.LoadResStr(S("IDS_MSG_NODEBUGMODE")));
      return false;
    }
    this.ShowVertices = !this.ShowVertices;
    this.ShowEntrance = !this.ShowEntrance;
    this.FlashMessageOnOff(S("Entrance+Vertices"), this.ShowVertices || this.ShowEntrance);
    return true;
  }

  ToggleShowAction() {
    if (!$.Game.DebugMode && !$.Console.Active) {
      this.FlashMessage($.LoadResStr(S("IDS_MSG_NODEBUGMODE")));
      return false;
    }
    if (!(this.ShowAction || this.ShowCommand || this.ShowPathfinder || this.ShowLights || this.ShowMenuInfo)) {
      this.ShowAction = true;
      this.FlashMessage(S("Actions"));
    } else if (this.ShowAction) {
      this.ShowAction = false;
      this.ShowCommand = true;
      this.FlashMessage(S("Commands"));
    } else if (this.ShowCommand) {
      this.ShowCommand = false;
      this.ShowPathfinder = true;
      this.FlashMessage(S("Pathfinder"));
    } else if (this.ShowPathfinder) {
      this.ShowPathfinder = false;
      this.ShowLights = true;
      this.FlashMessage(S("Lights"));
    } else if (this.ShowLights) {
      this.ShowLights = false;
      this.ShowMenuInfo = true;
      this.FlashMessage(S("Menu Info"));
    } else if (this.ShowMenuInfo) {
      this.ShowMenuInfo = false;
      this.FlashMessageOnOff(S("Actions/Commands/Pathfinder/Lights/Menus"), false);
    }
    return true;
  }

  ToggleShowHelp() {
    this.ShowHelp = !this.ShowHelp;
    if (!this.ShowHelp) {
      this.InvalidateBg();
    }
    return true;
  }

  $clone() { return new C4GraphicsSystem().$assign(this); }
  $assign(o) {
    this.MessageBoard = o.MessageBoard;
    this.UpperBoard.$assign(o.UpperBoard);
    this.iRedrawBackground = o.iRedrawBackground;
    this.ShowHelp = o.ShowHelp;
    this.ShowVertices = o.ShowVertices;
    this.ShowAction = o.ShowAction;
    this.ShowCommand = o.ShowCommand;
    this.ShowEntrance = o.ShowEntrance;
    this.ShowPathfinder = o.ShowPathfinder;
    this.ShowNetstatus = o.ShowNetstatus;
    this.Show8BitSurface = o.Show8BitSurface;
    this.ShowLights = o.ShowLights;
    this.ShowMenuInfo = o.ShowMenuInfo;
    this.pLoaderScreen = o.pLoaderScreen;
    this.FlashMessageText = o.FlashMessageText.slice();
    this.FlashMessageTime = o.FlashMessageTime;
    this.FlashMessageX = o.FlashMessageX;
    this.FlashMessageY = o.FlashMessageY;
    this.lastFrame.$assign(o.lastFrame);
    return this;
  }
}


export function $init(): void {
  $.MAX_BACKGROUND_FPS$C4GraphicsSystem = 5;
}

Object.assign($, { C4GraphicsSystem });
