// @ts-nocheck
// OpenClonk 36de799: src/platform/C4App.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { StdScheduler } from './StdScheduler.ts';
import { c$pthread_self, c$setlocale } from '../../rt/libc.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { sdl$SDL_GetClipboardText, sdl$SDL_GetDesktopDisplayMode, sdl$SDL_GetDisplayMode, sdl$SDL_GetError, sdl$SDL_GetModState, sdl$SDL_GetMouseState, sdl$SDL_GetNumDisplayModes, sdl$SDL_GetWindowData, sdl$SDL_GetWindowFromID, sdl$SDL_HasClipboardText, sdl$SDL_Init, sdl$SDL_PollEvent, sdl$SDL_Quit, sdl$SDL_SetClipboardText, sdl$SDL_SetWindowDisplayMode, sdl$SDL_SetWindowFullscreen, sdl$SDL_ShowSimpleMessageBox, sdl$SDL_free } from '../../rt/sdl.ts';
import { StdString } from '../../rt/std.ts';

export class C4AbstractApp extends StdScheduler {
  Active = false;
  pWindow = null;
  fQuitMsgReceived = false;
  MainThread = 0;
  sLastError = new StdString();
  fDspModeSet = false;

  init() {
    super.init();
    this.Active = false;
    this.pWindow = null;
    this.fQuitMsgReceived = false;
    this.MainThread = c$pthread_self();
    this.sLastError = new StdString();
    this.fDspModeSet = false;
    return this;
  }

  $dtor() {
    super.$dtor();
  }

  Clear$v() {
    sdl$SDL_Quit();
  }

  Init$i32$ppi8(argc, argv) {
    c$setlocale(6, S(""));
    if (sdl$SDL_Init(32) !== 0) {
      $.LogF(S("SDL_Init: %s"), sdl$SDL_GetError());
      return false;
    }
    return this.DoInit$i32$ppi8(argc, argv);
  }

  Run() {
    while (!this.fQuitMsgReceived) {
      this.ScheduleProcs();
    }
  }

  Quit$v() {
    this.fQuitMsgReceived = true;
  }

  GetIndexedDisplayMode(iIndex, piXRes, piYRes, piBitDepth, piRefreshRate, iMonitor) {
    if ($.modeCount$C4AppSDL === 0) {
      $.modeCount$C4AppSDL = sdl$SDL_GetNumDisplayModes(iMonitor | 0);
    }
    if (iIndex >= $.modeCount$C4AppSDL) {
      return false;
    }
    let mode = {};
    sdl$SDL_GetDisplayMode(iMonitor | 0, iIndex, mode);
    piXRes.a[piXRes.o] = mode.w;
    piYRes.a[piYRes.o] = mode.h;
    piBitDepth.a[piBitDepth.o] = $.bits_per_pixel(mode.format | 0);
    if (piRefreshRate != null) {
      piRefreshRate.a[piRefreshRate.o] = mode.refresh_rate;
    }
    return true;
  }

  SetVideoMode(iXRes, iYRes, RefreshRate, iMonitor, fFullScreen) {
    let res = 0;
    if (!fFullScreen) {
      if (iXRes === -1) {
        let desktop_mode = {};
        res = sdl$SDL_GetDesktopDisplayMode(iMonitor | 0, desktop_mode);
        if (res !== 0) {
          this.Error_(sdl$SDL_GetError());
          $.LogF(S("SDL_GetDesktopDisplayMode: %s"), sdl$SDL_GetError());
          return false;
        }
        iXRes = desktop_mode.w;
        iYRes = desktop_mode.h;
      }
      res = sdl$SDL_SetWindowFullscreen(this.pWindow.window, 0);
      if (res !== 0) {
        this.Error_(sdl$SDL_GetError());
        $.LogF(S("SDL_SetWindowFullscreen: %s"), sdl$SDL_GetError());
        return false;
      }
      this.pWindow.SetSize(iXRes >>> 0, iYRes >>> 0);
      this.OnResolutionChanged(iXRes >>> 0, iYRes >>> 0);
      return true;
    }
    let mode = {};
    if (iXRes < 0 || iYRes < 0) {
      res = sdl$SDL_SetWindowFullscreen(this.pWindow.window, 4097 /*SDL_WINDOW_FULLSCREEN_DESKTOP*/ >>> 0);
      if (res !== 0) {
        this.Error_(sdl$SDL_GetError());
        $.LogF(S("SDL_SetWindowFullscreen: %s"), sdl$SDL_GetError());
        return false;
      }
      res = sdl$SDL_GetDesktopDisplayMode(iMonitor | 0, mode);
      if (res !== 0) {
        this.Error_(sdl$SDL_GetError());
        $.LogF(S("SDL_GetDesktopDisplayMode: %s"), sdl$SDL_GetError());
        return false;
      }
      this.OnResolutionChanged(mode.w >>> 0, mode.h >>> 0);
      return true;
    }
    for (let i = 0; i < $.modeCount$C4AppSDL; i = i + 1 | 0) {
      res = sdl$SDL_GetDisplayMode(iMonitor | 0, i, mode);
      if (res !== 0) {
        this.Error_(sdl$SDL_GetError());
        $.LogF(S("SDL_GetDisplayMode: %s"), sdl$SDL_GetError());
        return false;
      }
      if (mode.w === iXRes && mode.h === iYRes && (RefreshRate === 0 || mode.refresh_rate >>> 0 === RefreshRate) && $.bits_per_pixel(mode.format | 0) === 32) {
        res = sdl$SDL_SetWindowDisplayMode(this.pWindow.window, mode);
        if (res !== 0) {
          this.Error_(sdl$SDL_GetError());
          $.LogF(S("SDL_SetWindowDisplayMode: %s"), sdl$SDL_GetError());
          return false;
        }
        res = sdl$SDL_SetWindowFullscreen(this.pWindow.window, 1 /*SDL_WINDOW_FULLSCREEN*/ >>> 0);
        if (res !== 0) {
          this.Error_(sdl$SDL_GetError());
          $.LogF(S("SDL_SetWindowFullscreen: %s"), sdl$SDL_GetError());
          return false;
        }
        this.OnResolutionChanged(mode.w >>> 0, mode.h >>> 0);
        return true;
      }
    }
    this.Error_(S("No such resolution available"));
    return false;
  }

  RestoreVideoMode() {
    if (this.pWindow != null && this.pWindow.window != null) {
      sdl$SDL_SetWindowFullscreen(this.pWindow.window, 0);
    }
  }

  DoScheduleProcs(iTimeout) {
    if (this.fQuitMsgReceived) {
      return false;
    }
    this.FlushMessages();
    return $.StdScheduler.prototype.DoScheduleProcs.call(this, iTimeout);
  }

  FlushMessages() {
    if (this.fQuitMsgReceived) {
      return false;
    }
    let event = {};
    while (sdl$SDL_PollEvent(event) !== 0) {
      this.HandleSDLEvent(event);
    }
    return true;
  }

  Copy$string$b(text, _fClipboard = true) {
    return sdl$SDL_SetClipboardText(text.c_str()) === 0;
  }

  Paste$b(_fClipboard = true) {
    let text = sdl$SDL_GetClipboardText();
    let buf = StdString.of(text);
    sdl$SDL_free(text);
    return buf;
  }

  IsClipboardFull(_fClipboard = true) {
    return sdl$SDL_HasClipboardText() !== 0;
  }

  NotifyUserIfInactive() {
    if (this.pWindow != null) {
      this.pWindow.FlashWindow();
    }
  }

  MessageDialog(message) {
    sdl$SDL_ShowSimpleMessageBox(0, S("OpenClonk"), message, this.pWindow != null ? this.pWindow.window : null);
  }

  GetLastError() {
    return this.sLastError.c_str();
  }

  Error_(m) {
    this.sLastError.assign(m);
  }

  AssertMainThread() {
    0;
    return this.MainThread === c$pthread_self();
  }

  HandleSDLEvent(e) {
    const flags = [0];
    switch (e.type) {
      case 256:
        this.Quit$v();
        break;
      case 771:
        $.pGUI.CharIn(P(e.text.text, 0));
        break;
      case 768:
        {
          $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32($.sdl_scancode_to_keycode(e.key.keysym.scancode), 1 /*KEYEV_Down*/, (e.key.keysym.mod & (256 /*KMOD_LALT*/ | 512 /*KMOD_RALT*/)) !== 0, (e.key.keysym.mod & (64 /*KMOD_LCTRL*/ | 128 /*KMOD_RCTRL*/)) !== 0, (e.key.keysym.mod & (1 /*KMOD_LSHIFT*/ | 2 /*KMOD_RSHIFT*/)) !== 0, e.key.repeat > 0, null);
          break;
        }
      case 769:
        $.Game.DoKeyboardInput$u64$i32$b$b$b$b$pDialog$b$i32($.sdl_scancode_to_keycode(e.key.keysym.scancode), 2 /*KEYEV_Up*/, (e.key.keysym.mod & (256 /*KMOD_LALT*/ | 512 /*KMOD_RALT*/)) !== 0, (e.key.keysym.mod & (64 /*KMOD_LCTRL*/ | 128 /*KMOD_RCTRL*/)) !== 0, (e.key.keysym.mod & (1 /*KMOD_LSHIFT*/ | 2 /*KMOD_RSHIFT*/)) !== 0, false, null);
        break;
      case 1024:
        $.MouseMove(0, e.motion.x, e.motion.y, 0, null);
        break;
      case 1026:
      case 1025:
        const button = [0];
        $.sdlToC4MCBtn(e.button, P(button, 0), P(flags, 0));
        $.MouseMove(button[0], e.button.x, e.button.y, flags[0], null);
        break;
      case 1027:
        flags[0] = e.wheel.y > 0 ? 0x200000 : 0xffe00000;
        flags[0] = flags[0] + (sdl$SDL_GetModState() >>> 0) >>> 0;
        const x = [0];
        const y = [0];
        sdl$SDL_GetMouseState(P(x, 0), P(y, 0));
        $.MouseMove(7, x[0], y[0], flags[0], null);
        break;
      case 1616:
      case 1617:
      case 1618:
        $.Application.pGamePadControl.FeedEvent(e, 1);
        break;
      case 1541:
      case 1619:
      case 1620:
        $.Application.pGamePadControl.CheckGamePad(e);
        break;
      case 512:
        let window = sdl$SDL_GetWindowData(sdl$SDL_GetWindowFromID(e.window.windowID), S("C4Window"));
        window.HandleSDLEvent(e.window);
        break;
    }
  }

  $clone() { return new C4AbstractApp().$assign(this); }
  $assign(o) {
    super.$assign(o);
    this.Active = o.Active;
    this.pWindow = o.pWindow;
    this.fQuitMsgReceived = o.fQuitMsgReceived;
    this.MainThread = o.MainThread;
    this.sLastError = o.sLastError.$clone();
    this.fDspModeSet = o.fDspModeSet;
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4AbstractApp });
