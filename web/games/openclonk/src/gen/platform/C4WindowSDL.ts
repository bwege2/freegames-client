// @ts-nocheck
// OpenClonk 36de799: src/platform/C4WindowSDL.cpp, translated by re/openclonk/tools/cpp2ts. Do not edit.
import { gl$SDL_GL_SetAttribute, gl$glGetIntegerv } from '../../rt/gl.ts';
import { P, S } from '../../rt/ptr.ts';
import { $ } from '../../rt/registry.ts';
import { sdl$SDL_CreateWindow, sdl$SDL_DestroyWindow } from '../../rt/sdl.ts';
import { $max } from '../../rt/std.ts';

function SetMultisamplingAttributes(samples) {
  gl$SDL_GL_SetAttribute(13 /*SDL_GL_MULTISAMPLEBUFFERS*/, samples > 0 ? 1 : 0);
  gl$SDL_GL_SetAttribute(14 /*SDL_GL_MULTISAMPLESAMPLES*/, samples);
}

function EnumerateMultiSamplesSDL(samples) {
  const max_samples = [0];
  gl$glGetIntegerv(36183, P(max_samples, 0));
  max_samples[0] = $max(max_samples[0], 16);
  samples.length = 0;
  for (let s = 2; s <= max_samples[0]; s = Math.imul(s, 2)) {
    SetMultisamplingAttributes(s);
    let wnd = sdl$SDL_CreateWindow(S("OpenClonk Test Window"), 0x1fff0000, 0x1fff0000, 100, 100, (2 /*SDL_WINDOW_OPENGL*/ | 8 /*SDL_WINDOW_HIDDEN*/) >>> 0);
    if (wnd != null) {
      sdl$SDL_DestroyWindow(wnd);
      samples.push(s);
    } else {
      break;
    }
  }
  SetMultisamplingAttributes($.Config.Graphics.MultiSampling);
}

export function $init(): void {
}

Object.assign($, { EnumerateMultiSamplesSDL, SetMultisamplingAttributes });
