// Chromium B.S.U. port (GPL-3.0-or-later; translated in 2026 by the freegames project from the original by Mark B. Allan, Clarified Artistic License; LICENSE.md): what the game asks of OpenGL 1.x,
// GLU and its text renderer. The game code (src/game/) makes these calls in the original's order;
// render/webgl.ts draws them with WebGL 2, test/trace.ts records them like the oracle's stubs.

export const GL_TRIANGLES = 0x0004;
export const GL_TRIANGLE_STRIP = 0x0005;
export const GL_QUADS = 0x0007;
export const GL_ONE = 1;
export const GL_SRC_ALPHA = 0x0302;
export const GL_ONE_MINUS_SRC_ALPHA = 0x0303;
export const GL_DEPTH_TEST = 0x0b71;
export const GL_CULL_FACE = 0x0b44;
export const GL_BLEND = 0x0be2;
export const GL_ALPHA_TEST = 0x0bc0;
export const GL_NORMALIZE = 0x0ba1;
export const GL_TEXTURE_2D = 0x0de1;
export const GL_TEXTURE_GEN_S = 0x0c60;
export const GL_TEXTURE_GEN_T = 0x0c61;
export const GL_LEQUAL = 0x0203;
export const GL_MODELVIEW = 0x1700;
export const GL_PROJECTION = 0x1701;
export const GL_TEXTURE = 0x1702;

/** a texture, as Image::load made it (src/Image.cpp) */
export interface Texture {
  /** its file, e.g. "hero.png" */
  readonly name: string;
}

/** Image::load's options (src/Image.h) */
export const IMG_NOMIPMAPS = 0, IMG_SIMPLEMIPMAPS = 1, IMG_BUILDMIPMAPS = 2;
export const IMG_SOLID = 0, IMG_ALPHA = 1, IMG_BLEND1 = 2, IMG_BLEND2 = 3, IMG_BLEND3 = 4;
export const GL_CLAMP = 0x2900;
export const GL_REPEAT = 0x2901;
export const GL_CLAMP_TO_EDGE = 0x812f;
export const GL_NEAREST = 0x2600;
export const GL_LINEAR = 0x2601;
export const GL_LINEAR_MIPMAP_NEAREST = 0x2701;
export const GL_LINEAR_MIPMAP_LINEAR = 0x2703;

export interface Images {
  /** Image::load(filename, mipmap, trans, wrapst, minfilter, magfilter) */
  load(file: string, mipmap?: number, trans?: number, wrap?: number, min?: number, mag?: number): Texture;
}

export interface GL {
  begin(mode: number): void;
  end(): void;
  vertex3f(x: number, y: number, z: number): void;
  texCoord2f(s: number, t: number): void;
  color4f(r: number, g: number, b: number, a: number): void;
  normal3f(x: number, y: number, z: number): void;
  translatef(x: number, y: number, z: number): void;
  rotatef(a: number, x: number, y: number, z: number): void;
  scalef(x: number, y: number, z: number): void;
  pushMatrix(): void;
  popMatrix(): void;
  loadIdentity(): void;
  matrixMode(mode: number): void;
  bindTexture(tex: Texture | null): void;
  blendFunc(s: number, d: number): void;
  enable(cap: number): void;
  disable(cap: number): void;
  clear(): void;
  clearColor(r: number, g: number, b: number, a: number): void;
  depthFunc(f: number): void;
  depthMask(on: boolean): void;
  viewport(x: number, y: number, w: number, h: number): void;
  /** glTexParameterfv(GL_TEXTURE_2D, GL_TEXTURE_BORDER_COLOR, c) */
  texBorderColor(r: number, g: number, b: number, a: number): void;
  genLists(n: number): number;
  newList(list: number): void;
  endList(): void;
  callList(list: number): void;
  /** gluPerspective */
  perspective(fovy: number, aspect: number, near: number, far: number): void;
}

/** src/Text.h: the GLC text renderer the Linux build uses (src/TextGLC.cpp) */
export interface Text {
  render(str: string, len?: number): void;
  advance(str: string, len?: number): number;
  lineHeight(): number;
}
