// AstroMenace 1.4.3 (Mikhail Kurinnoi, Viewizard; GPL-3.0-or-later): the texture store of
// src/core/texture/texture.cpp and src/assets/texture.cpp. Every texture keeps its pixels in the
// order the original uploads them to OpenGL (row 0 first); the alpha channel is created or removed
// on load as the original's asset table says (CreateAlpha EQUAL: black is transparent; GREYSC: the
// alpha is a weighted grey). Changed for the browser by the freegames project, 2026.
import { TEXTURE_ASSETS } from './textures_table.ts';

export interface Tex {
  name: string;
  width: number;
  height: number;
  /** RGBA, 4 bytes per pixel, rows as the original keeps them */
  rgba: Uint8Array;
  /** did the texture keep (or get) an alpha channel */
  alpha: boolean;
  wrap: 'REPEAT' | 'CLAMP_TO_EDGE';
  mipmap: boolean;
  /** caches of the renderers */
  canvas?: unknown;
  gl?: unknown;
}

export const textures = new Map<string, Tex>();

const assetInfo = new Map(TEXTURE_ASSETS.map((t) => [t[0], t]));

/** builds a texture from the decoded file (channels 3 or 4), as vw_CreateTextureFromMemory does */
export function addTexture(name: string, width: number, height: number, channels: number, pixels: Uint8Array): Tex {
  const info = assetInfo.get(name);
  const wantAlpha = info ? info[1] === 1 : false;
  const mode = info ? info[2] : 'EQUAL';
  const rgba = new Uint8Array(width * height * 4);
  for (let i = 0, s = 0; i < width * height; i++, s += channels) {
    const r = pixels[s], g = pixels[s + 1], b = pixels[s + 2];
    rgba[i * 4] = r;
    rgba[i * 4 + 1] = g;
    rgba[i * 4 + 2] = b;
    let a = 255;
    if (channels === 4 && wantAlpha) {
      a = pixels[s + 3];
    } else if (channels === 3 && wantAlpha) {
      if (mode === 'GREYSC') a = Math.trunc(Math.fround(Math.fround(Math.fround(r / 255 * 28) + Math.fround(g / 255 * 150)) + Math.fround(b / 255 * 76)));
      else if (mode === 'EQUAL') a = r === 0 && g === 0 && b === 0 ? 0 : 255;
    }
    rgba[i * 4 + 3] = a;
  }
  const t: Tex = {
    name, width, height, rgba, alpha: wantAlpha,
    wrap: info && info[3] === 'REPEAT' ? 'REPEAT' : 'CLAMP_TO_EDGE',
    mipmap: info ? info[6] === 1 : false,
  };
  textures.set(name, t);
  return t;
}

export function getTexture(name: string | null | undefined): Tex | null {
  return name ? textures.get(name) ?? null : null;
}

export const allTextureNames = (): string[] => TEXTURE_ASSETS.map((t) => t[0]);
