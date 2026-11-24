// @ts-nocheck
// OpenClonk 36de799: src/platform/C4Window.h, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$SDL_GL_GetDrawableSize, gl$SDL_GL_SetAttribute } from '../../rt/gl.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { sdl$SDL_CreateWindow, sdl$SDL_DestroyWindow, sdl$SDL_GetError, sdl$SDL_SetWindowData, sdl$SDL_SetWindowGrab, sdl$SDL_SetWindowSize, sdl$SDL_SetWindowTitle, sdl$SDL_ShowCursor } from '../../rt/sdl.ts';

export class C4Window {
  Active = false;
  pSurface = null;
  eKind = 0;
  window = null;
  available_samples = [];

  init() {
    this.Active = false;
    this.pSurface = null;
    this.eKind = 3 /*W_Fullscreen*/;
    this.window = null;
    this.available_samples = [];
    return this;
  }

  $dtor() {
    C4Window.prototype.Clear.call(this);
  }

  Clear() {
    if (this.window != null) {
      sdl$SDL_DestroyWindow(this.window);
    }
    this.window = null;
  }

  ReInit(_pApp) {
    $.TheScreen.ShowMessage($.LoadResStr(S("IDS_CTL_ANTIALIASING_RESTART_MSG")), $.LoadResStr(S("IDS_CTL_ANTIALIASING_RESTART_TITLE")), 1 /*Ico_Notify*/);
    return true;
  }

  EnumerateMultiSamples(samples, _min_expected = 0) {
    samples = this.available_samples.slice();
  }

  RestorePosition(_0, _1, _2 = false) {
    return true;
  }

  GetSize(pRect) {
    pRect.x = pRect.y = 0;
    gl$SDL_GL_GetDrawableSize(this.window, P(pRect, "Wdt"), P(pRect, "Hgt"));
    return true;
  }

  SetSize(X, Y) {
    sdl$SDL_SetWindowSize(this.window, X | 0, Y | 0);
  }

  SetTitle(Title) {
    sdl$SDL_SetWindowTitle(this.window, Title);
  }

  FlashWindow() {
    $.SetUrgencyHint(this.window, true);
  }

  GrabMouse(grab) {
    sdl$SDL_SetWindowGrab(this.window, grab ? 1 /*SDL_TRUE*/ : 0 /*SDL_FALSE*/);
  }

  RequestUpdate() {
    this.PerformUpdate();
  }

  PerformUpdate() {
  }

  HandleSDLEvent(e) {
    switch (e.event) {
      case 12:
        $.SetUrgencyHint(this.window, false);
        break;
      case 5:
      case 6:
        $.Application.OnResolutionChanged(e.data1 >>> 0, e.data2 >>> 0);
        break;
      default:
        break;
    }
  }

  Init$i32$pC4AbstractApp$pi8$pC4Rect(windowKind, _pApp, Title, size) {
    this.eKind = windowKind;
    gl$SDL_GL_SetAttribute(0 /*SDL_GL_RED_SIZE*/, 8);
    gl$SDL_GL_SetAttribute(1 /*SDL_GL_GREEN_SIZE*/, 8);
    gl$SDL_GL_SetAttribute(2 /*SDL_GL_BLUE_SIZE*/, 8);
    gl$SDL_GL_SetAttribute(6 /*SDL_GL_DEPTH_SIZE*/, 8);
    gl$SDL_GL_SetAttribute(17 /*SDL_GL_CONTEXT_MAJOR_VERSION*/, 3);
    gl$SDL_GL_SetAttribute(18 /*SDL_GL_CONTEXT_MINOR_VERSION*/, 2);
    gl$SDL_GL_SetAttribute(20 /*SDL_GL_CONTEXT_FLAGS*/, $.Config.Graphics.DebugOpenGL !== 0 ? 1 /*SDL_GL_CONTEXT_DEBUG_FLAG*/ : 0);
    gl$SDL_GL_SetAttribute(21 /*SDL_GL_CONTEXT_PROFILE_MASK*/, 1 /*SDL_GL_CONTEXT_PROFILE_CORE*/);
    $.EnumerateMultiSamplesSDL(this.available_samples);
    let samples = 0;
    for (const e of this.available_samples) {
      if (samples < e && e <= $.Config.Graphics.MultiSampling) {
        samples = e;
      }
    }
    $.SetMultisamplingAttributes(samples);
    let flags = 2 /*SDL_WINDOW_OPENGL*/ >>> 0;
    if (windowKind === 3 && size.Wdt === -1) {
      flags = (flags | 4097 /*SDL_WINDOW_FULLSCREEN_DESKTOP*/ >>> 0) >>> 0;
    } else if (windowKind === 3 && $.Config.Graphics.Windowed === 0) {
      flags = (flags | 1 /*SDL_WINDOW_FULLSCREEN*/ >>> 0) >>> 0;
    }
    this.window = sdl$SDL_CreateWindow(Title, 0x1fff0000, 0x1fff0000, size.Wdt, size.Hgt, flags);
    if (this.window == null) {
      $.Log(sdl$SDL_GetError());
      return null;
    }
    $.Config.Graphics.MultiSampling = samples;
    sdl$SDL_SetWindowData(this.window, S("C4Window"), this);
    this.Active = true;
    sdl$SDL_ShowCursor(0);
    return this;
  }

  $clone() { return new C4Window().$assign(this); }
  $assign(o) {
    this.Active = o.Active;
    this.pSurface = o.pSurface;
    this.eKind = o.eKind;
    this.window = o.window;
    this.available_samples = o.available_samples.slice();
    return this;
  }
}

export function $init(): void {
}

Object.assign($, { C4Window });
