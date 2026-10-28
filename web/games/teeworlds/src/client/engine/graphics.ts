// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/graphics.h, engine/client/graphics_threaded.cpp and the OpenGL fragment of
// engine/client/backend_sdl.cpp of Teeworlds 0.7.5 in TypeScript, on WebGL 2. The command buffer is gone: a batch
// of vertices is drawn when the original would flush it (state change, QuadsEnd/LinesEnd, a full buffer), with
// the state the original's fixed-function pipeline has: premultiplied RGBA textures blended with ONE, RGB and
// ALPHA textures with SRC_ALPHA, GL_MODULATE texturing (an ALPHA texture keeps the vertex colour), mipmaps
// LINEAR_MIPMAP_NEAREST, the half-size textures without gfx_texture_quality, the 16x16 tile textures as 256-layer
// texture arrays (the original's GL_TEXTURE_3D), glOrtho for MapScreen, the scissor with ClipEnable.
import { f, cosf, sinf, clamp, type vec4 } from '../../base/vmath.ts';
import type { CConfig } from '../../generated/config.ts';
import { FORMAT_ALPHA, FORMAT_AUTO, FORMAT_RGB, FORMAT_RGBA, type CImageInfo } from './png.ts';
import type { CStorage } from './storage.ts';

export { FORMAT_ALPHA, FORMAT_AUTO, FORMAT_RGB, FORMAT_RGBA, type CImageInfo };

export const TEXLOAD_NORESAMPLE = 1, TEXLOAD_NOMIPMAPS = 2, TEXLOAD_ARRAY_256 = 4, TEXLOAD_MULTI_DIMENSION = 8, TEXLOAD_LINEARMIPMAPS = 16;
export const NUMTILES_DIMENSION = 16;
export const WRAP_REPEAT = 0, WRAP_CLAMP = 1;

const TEXFLAG_NOMIPMAPS = 1, TEXFLAG_QUALITY = 4, TEXFLAG_TEXTURE3D = 8, TEXFLAG_TEXTURE2D = 16, TEXTFLAG_LINEARMIPMAPS = 32;
const BLEND_NONE = 0, BLEND_ALPHA = 1, BLEND_ADDITIVE = 2;
const DRAWING_QUADS = 1, DRAWING_LINES = 2;
const MAX_TEXTURES = 1024 * 4;
const MAX_VERTICES = 32 * 1024;
const FLOATS = 9; // pos 2, tex 3, color 4

export class CTextureHandle {
  m_Id: number;
  constructor(id = -1) { this.m_Id = id; }
  IsValid(): boolean { return this.m_Id >= 0; }
  Id(): number { return this.m_Id; }
  Invalidate(): void { this.m_Id = -1; }
}

export class CQuadItem {
  m_X: number;
  m_Y: number;
  m_Width: number;
  m_Height: number;
  constructor(x: number, y: number, w: number, h: number) {
    this.m_X = f(x);
    this.m_Y = f(y);
    this.m_Width = f(w);
    this.m_Height = f(h);
  }
}
export class CFreeformItem {
  m_X0: number; m_Y0: number; m_X1: number; m_Y1: number; m_X2: number; m_Y2: number; m_X3: number; m_Y3: number;
  constructor(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number) {
    this.m_X0 = x0; this.m_Y0 = y0; this.m_X1 = x1; this.m_Y1 = y1; this.m_X2 = x2; this.m_Y2 = y2; this.m_X3 = x3; this.m_Y3 = y3;
  }
}
export class CLineItem {
  m_X0: number; m_Y0: number; m_X1: number; m_Y1: number;
  constructor(x0: number, y0: number, x1: number, y1: number) { this.m_X0 = x0; this.m_Y0 = y0; this.m_X1 = x1; this.m_Y1 = y1; }
}
export interface CColorVertex { m_Index: number; m_R: number; m_G: number; m_B: number; m_A: number }

interface CState {
  m_ScreenTL: { x: number; y: number };
  m_ScreenBR: { x: number; y: number };
  m_ClipEnable: boolean;
  m_ClipX: number; m_ClipY: number; m_ClipW: number; m_ClipH: number;
  m_Texture: number;
  m_Dimension: number;
  m_BlendMode: number;
  m_WrapModeU: number;
  m_WrapModeV: number;
}

interface CTexture {
  tex2D: WebGLTexture | null;
  tex3D: WebGLTexture | null;
  format: number;
  memSize: number;
}

const VS = `#version 300 es
in vec2 aPos; in vec3 aTex; in vec4 aColor;
uniform vec4 uScreen; // TL.x, TL.y, BR.x, BR.y (glOrtho(TL.x, BR.x, BR.y, TL.y))
out vec3 vTex; out vec4 vColor;
void main() {
  vec2 p = vec2(2.0 * (aPos.x - uScreen.x) / (uScreen.z - uScreen.x) - 1.0, 1.0 - 2.0 * (aPos.y - uScreen.y) / (uScreen.w - uScreen.y));
  gl_Position = vec4(p, 0.0, 1.0);
  vTex = aTex; vColor = aColor;
}`;
const FS = `#version 300 es
precision highp float; precision highp sampler2DArray;
in vec3 vTex; in vec4 vColor;
uniform int uMode; // 0 no texture, 1 2D, 2 array
uniform int uAlphaTex;
uniform sampler2D uTex2D; uniform sampler2DArray uTex3D;
out vec4 oColor;
void main() {
  if (uMode == 0) { oColor = vColor; return; }
  vec4 t = uMode == 1 ? texture(uTex2D, vTex.xy) : texture(uTex3D, vec3(vTex.xy, floor(vTex.z * 256.0)));
  oColor = uAlphaTex == 1 ? vec4(vColor.rgb, vColor.a * t.a) : vColor * t;
}`;

/** CGraphics_Threaded with its OpenGL backend, on a WebGL 2 context */
export class CGraphics {
  gl: WebGL2RenderingContext;
  private canvas: HTMLCanvasElement;
  private m_pConfig: CConfig;
  private m_pStorage: CStorage | null;
  m_ScreenWidth = 0;
  m_ScreenHeight = 0;
  m_DesktopScreenWidth = 0;
  m_DesktopScreenHeight = 0;

  private m_State: CState = {
    m_ScreenTL: { x: 0, y: 0 }, m_ScreenBR: { x: 0, y: 0 }, m_ClipEnable: false, m_ClipX: 0, m_ClipY: 0, m_ClipW: 0, m_ClipH: 0,
    m_Texture: -1, m_Dimension: 2, m_BlendMode: BLEND_NONE, m_WrapModeU: WRAP_REPEAT, m_WrapModeV: WRAP_REPEAT,
  };
  private m_aVertices = new Float32Array(MAX_VERTICES * FLOATS);
  private m_NumVertices = 0;
  private m_aColor = [0, 1, 2, 3].map(() => ({ r: 1, g: 1, b: 1, a: 1 }));
  private m_aTexture = [0, 1, 2, 3].map(() => ({ u: 0, v: 0, i: 0 }));
  private m_Rotation = 0;
  private m_Drawing = 0;
  private m_TextureMemoryUsage = 0;
  private m_aTextureIndices = new Int32Array(MAX_TEXTURES);
  private m_FirstFreeTexture = 0;
  private m_aTextures: CTexture[] = [];
  m_InvalidTexture = new CTextureHandle();
  private m_MaxTexSize = 0;

  private prog: WebGLProgram;
  private vbo: WebGLBuffer;
  private ibo: WebGLBuffer;
  private vao: WebGLVertexArrayObject;
  private uScreen: WebGLUniformLocation;
  private uMode: WebGLUniformLocation;
  private uAlphaTex: WebGLUniformLocation;
  /** draw calls and vertices of the last frame (debug) */
  stats = { draws: 0, vertices: 0, lastDraws: 0 };

  constructor(canvas: HTMLCanvasElement, config: CConfig, storage: CStorage | null) {
    this.canvas = canvas;
    this.m_pConfig = config;
    this.m_pStorage = storage;
    const gl = canvas.getContext('webgl2', { alpha: false, antialias: false, depth: false, stencil: false, premultipliedAlpha: true, preserveDrawingBuffer: false });
    if (!gl) throw new Error('WebGL 2 is not available');
    this.gl = gl;
    const sh = (type: number, src: string): WebGLShader => {
      const s = gl.createShader(type)!;
      gl.shaderSource(s, src);
      gl.compileShader(s);
      if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s) ?? 'shader');
      return s;
    };
    const prog = gl.createProgram()!;
    gl.attachShader(prog, sh(gl.VERTEX_SHADER, VS));
    gl.attachShader(prog, sh(gl.FRAGMENT_SHADER, FS));
    gl.bindAttribLocation(prog, 0, 'aPos');
    gl.bindAttribLocation(prog, 1, 'aTex');
    gl.bindAttribLocation(prog, 2, 'aColor');
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog) ?? 'link');
    this.prog = prog;
    gl.useProgram(prog);
    this.uScreen = gl.getUniformLocation(prog, 'uScreen')!;
    this.uMode = gl.getUniformLocation(prog, 'uMode')!;
    this.uAlphaTex = gl.getUniformLocation(prog, 'uAlphaTex')!;
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex2D'), 0);
    gl.uniform1i(gl.getUniformLocation(prog, 'uTex3D'), 1);
    this.vao = gl.createVertexArray()!;
    gl.bindVertexArray(this.vao);
    this.vbo = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferData(gl.ARRAY_BUFFER, this.m_aVertices.byteLength, gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(0);
    gl.vertexAttribPointer(0, 2, gl.FLOAT, false, FLOATS * 4, 0);
    gl.enableVertexAttribArray(1);
    gl.vertexAttribPointer(1, 3, gl.FLOAT, false, FLOATS * 4, 8);
    gl.enableVertexAttribArray(2);
    gl.vertexAttribPointer(2, 4, gl.FLOAT, false, FLOATS * 4, 20);
    // GL_QUADS as two triangles each
    const idx = new Uint16Array((MAX_VERTICES / 4) * 6);
    for (let q = 0, v = 0; q < idx.length; q += 6, v += 4) {
      idx[q] = v; idx[q + 1] = v + 1; idx[q + 2] = v + 2;
      idx[q + 3] = v; idx[q + 4] = v + 2; idx[q + 5] = v + 3;
    }
    this.ibo = gl.createBuffer()!;
    gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, this.ibo);
    gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, idx, gl.STATIC_DRAW);
    gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);
    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL, false);
    this.m_MaxTexSize = gl.getParameter(gl.MAX_TEXTURE_SIZE) as number;
    this.Init();
  }

  ScreenWidth(): number { return this.m_ScreenWidth; }
  ScreenHeight(): number { return this.m_ScreenHeight; }
  ScreenAspect(): number { return f(this.m_ScreenWidth / this.m_ScreenHeight); }
  DesktopWidth(): number { return this.m_DesktopScreenWidth; }
  DesktopHeight(): number { return this.m_DesktopScreenHeight; }

  /** the canvas has a new size in device pixels (the window was resized) */
  Resize(w: number, h: number): void {
    this.m_ScreenWidth = Math.max(1, w);
    this.m_ScreenHeight = Math.max(1, h);
    this.m_DesktopScreenWidth = this.m_ScreenWidth;
    this.m_DesktopScreenHeight = this.m_ScreenHeight;
    if (this.canvas.width !== this.m_ScreenWidth) this.canvas.width = this.m_ScreenWidth;
    if (this.canvas.height !== this.m_ScreenHeight) this.canvas.height = this.m_ScreenHeight;
    this.gl.viewport(0, 0, this.m_ScreenWidth, this.m_ScreenHeight);
  }

  private Init(): void {
    this.m_FirstFreeTexture = 0;
    for (let i = 0; i < MAX_TEXTURES - 1; i++) this.m_aTextureIndices[i] = i + 1;
    this.m_aTextureIndices[MAX_TEXTURES - 1] = -1;
    this.Resize(this.canvas.width, this.canvas.height);
    const aNullTextureData = new Uint8Array(4 * 32 * 32);
    for (let x = 0; x < 32; ++x)
      for (let y = 0; y < 32; ++y) {
        const o = 4 * (y * 32 + x);
        if (x < 16) {
          if (y < 16) {
            aNullTextureData[o] = y * 8 + x * 8 + 15; aNullTextureData[o + 1] = 0; aNullTextureData[o + 2] = 0;
          } else {
            aNullTextureData[o] = 0; aNullTextureData[o + 1] = y * 8 + x * 8 - 113; aNullTextureData[o + 2] = 0;
          }
        } else if (y < 16) {
          aNullTextureData[o] = 0; aNullTextureData[o + 1] = 0; aNullTextureData[o + 2] = y * 8 + x * 8 - 113;
        } else {
          aNullTextureData[o] = y * 8 + x * 8 - 496; aNullTextureData[o + 1] = y * 8 + x * 8 - 496; aNullTextureData[o + 2] = 0;
        }
        aNullTextureData[o + 3] = 255;
      }
    this.m_InvalidTexture = this.LoadTextureRaw(32, 32, FORMAT_RGBA, aNullTextureData, FORMAT_RGBA, TEXLOAD_NORESAMPLE | TEXLOAD_MULTI_DIMENSION);
  }

  Shutdown(): void {
    const gl = this.gl;
    for (const t of this.m_aTextures) {
      if (!t) continue;
      if (t.tex2D) gl.deleteTexture(t.tex2D);
      if (t.tex3D) gl.deleteTexture(t.tex3D);
    }
    this.m_aTextures = [];
    gl.deleteBuffer(this.vbo);
    gl.deleteBuffer(this.ibo);
    gl.deleteVertexArray(this.vao);
    gl.deleteProgram(this.prog);
    gl.getExtension('WEBGL_lose_context')?.loseContext();
  }

  // ---------------------------------------------------------------- state
  ClipEnable(x: number, y: number, w: number, h: number): void {
    if (x < 0) w += x;
    if (y < 0) h += y;
    x = clamp(x, 0, this.ScreenWidth());
    y = clamp(y, 0, this.ScreenHeight());
    w = clamp(w, 0, this.ScreenWidth() - x);
    h = clamp(h, 0, this.ScreenHeight() - y);
    this.m_State.m_ClipEnable = true;
    this.m_State.m_ClipX = x;
    this.m_State.m_ClipY = this.ScreenHeight() - (y + h);
    this.m_State.m_ClipW = w;
    this.m_State.m_ClipH = h;
  }
  ClipDisable(): void { this.m_State.m_ClipEnable = false; }
  BlendNone(): void { this.m_State.m_BlendMode = BLEND_NONE; }
  BlendNormal(): void { this.m_State.m_BlendMode = BLEND_ALPHA; }
  BlendAdditive(): void { this.m_State.m_BlendMode = BLEND_ADDITIVE; }
  WrapNormal(): void { this.m_State.m_WrapModeU = this.m_State.m_WrapModeV = WRAP_REPEAT; }
  WrapClamp(): void { this.m_State.m_WrapModeU = this.m_State.m_WrapModeV = WRAP_CLAMP; }
  WrapMode(WrapU: number, WrapV: number): void {
    this.m_State.m_WrapModeU = WrapU;
    this.m_State.m_WrapModeV = WrapV;
  }
  MemoryUsage(): number { return this.m_TextureMemoryUsage; }
  MapScreen(TopLeftX: number, TopLeftY: number, BottomRightX: number, BottomRightY: number): void {
    this.m_State.m_ScreenTL = { x: f(TopLeftX), y: f(TopLeftY) };
    this.m_State.m_ScreenBR = { x: f(BottomRightX), y: f(BottomRightY) };
  }
  /** GetScreen: [TopLeftX, TopLeftY, BottomRightX, BottomRightY] */
  GetScreen(): [number, number, number, number] {
    const s = this.m_State;
    return [s.m_ScreenTL.x, s.m_ScreenTL.y, s.m_ScreenBR.x, s.m_ScreenBR.y];
  }

  // ---------------------------------------------------------------- textures
  UnloadTexture(Index: CTextureHandle): number {
    if (Index.Id() === this.m_InvalidTexture.Id()) return 0;
    if (!Index.IsValid()) return 0;
    const t = this.m_aTextures[Index.Id()];
    if (t) {
      if (t.tex2D) this.gl.deleteTexture(t.tex2D);
      if (t.tex3D) this.gl.deleteTexture(t.tex3D);
      this.m_TextureMemoryUsage -= t.memSize;
      delete this.m_aTextures[Index.Id()];
    }
    this.m_aTextureIndices[Index.Id()] = this.m_FirstFreeTexture;
    this.m_FirstFreeTexture = Index.Id();
    Index.Invalidate();
    return 0;
  }

  private static PixelSize(Format: number): number { return Format === FORMAT_RGB ? 3 : Format === FORMAT_ALPHA ? 1 : 4; }

  /** the pixels as RGBA bytes for WebGL (an ALPHA texture's value in alpha) */
  private static ToRGBA(w: number, h: number, Format: number, d: Uint8Array): Uint8Array {
    if (Format === FORMAT_RGBA) return d;
    const out = new Uint8Array(w * h * 4);
    if (Format === FORMAT_RGB) {
      for (let i = 0; i < w * h; i++) {
        out[i * 4] = d[i * 3]; out[i * 4 + 1] = d[i * 3 + 1]; out[i * 4 + 2] = d[i * 3 + 2]; out[i * 4 + 3] = 255;
      }
    } else {
      for (let i = 0; i < w * h; i++) {
        out[i * 4] = 255; out[i * 4 + 1] = 255; out[i * 4 + 2] = 255; out[i * 4 + 3] = d[i];
      }
    }
    return out;
  }

  private static Rescale(Width: number, Height: number, NewWidth: number, NewHeight: number, Format: number, pData: Uint8Array): Uint8Array {
    const ScaleW = Math.trunc(Width / NewWidth), ScaleH = Math.trunc(Height / NewHeight);
    const Bpp = Format === FORMAT_RGBA ? 4 : 3;
    const out = new Uint8Array(NewWidth * NewHeight * Bpp);
    let c = 0;
    for (let y = 0; y < NewHeight; y++)
      for (let x = 0; x < NewWidth; x++, c++) {
        for (let k = 0; k < Bpp; k++) {
          let Value = 0;
          for (let sx = 0; sx < ScaleW; sx++)
            for (let sy = 0; sy < ScaleH; sy++) Value += pData[((y * ScaleH + sy) * Width + (x * ScaleW + sx)) * Bpp + k];
          out[c * Bpp + k] = Math.trunc(Value / (ScaleW * ScaleH));
        }
      }
    return out;
  }

  LoadTextureRawSub(TextureID: CTextureHandle, x: number, y: number, Width: number, Height: number, Format: number, pData: Uint8Array): number {
    if (!TextureID.IsValid()) return 0;
    const t = this.m_aTextures[TextureID.Id()];
    if (!t || !t.tex2D) return 0;
    this.FlushVertices();
    const gl = this.gl;
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, t.tex2D);
    gl.texSubImage2D(gl.TEXTURE_2D, 0, x, y, Width, Height, gl.RGBA, gl.UNSIGNED_BYTE, CGraphics.ToRGBA(Width, Height, Format, pData));
    return 0;
  }

  LoadTextureRaw(Width: number, Height: number, Format: number, pData: Uint8Array, _StoreFormat: number, Flags: number): CTextureHandle {
    if (this.m_pConfig.m_DbgStress) return this.m_InvalidTexture;
    const Tex = this.m_FirstFreeTexture;
    this.m_FirstFreeTexture = this.m_aTextureIndices[Tex];
    this.m_aTextureIndices[Tex] = -1;
    let CmdFlags = TEXFLAG_TEXTURE2D;
    if (Flags & TEXLOAD_NOMIPMAPS) CmdFlags |= TEXFLAG_NOMIPMAPS;
    if (this.m_pConfig.m_GfxTextureQuality || Flags & TEXLOAD_NORESAMPLE) CmdFlags |= TEXFLAG_QUALITY;
    if (Flags & TEXLOAD_ARRAY_256) {
      CmdFlags |= TEXFLAG_TEXTURE3D;
      CmdFlags &= ~TEXFLAG_TEXTURE2D;
    }
    if (Flags & TEXLOAD_MULTI_DIMENSION) CmdFlags |= TEXFLAG_TEXTURE3D;
    if (Flags & TEXLOAD_LINEARMIPMAPS) CmdFlags |= TEXTFLAG_LINEARMIPMAPS;
    this.CreateTexture(Tex, Width, Height, Format, pData.slice(0, Width * Height * CGraphics.PixelSize(Format)), CmdFlags);
    return new CTextureHandle(Tex);
  }

  /** Cmd_Texture_Create */
  private CreateTexture(Slot: number, Width0: number, Height0: number, Format: number, pTexData: Uint8Array, Flags: number): void {
    const gl = this.gl;
    this.FlushVertices();
    let Width = Width0, Height = Height0;
    const PixelSize = CGraphics.PixelSize(Format);
    if (Format === FORMAT_RGBA || Format === FORMAT_RGB) {
      let MaxTexSize = this.m_MaxTexSize;
      if (Flags & TEXFLAG_TEXTURE3D) {
        if (Flags & TEXFLAG_TEXTURE2D) MaxTexSize = Math.min(MaxTexSize, 256 * NUMTILES_DIMENSION);
        else MaxTexSize = 256 * NUMTILES_DIMENSION;
      }
      if (Width > MaxTexSize || Height > MaxTexSize) {
        do {
          Width >>= 1;
          Height >>= 1;
        } while (Width > MaxTexSize || Height > MaxTexSize);
        pTexData = CGraphics.Rescale(Width0, Height0, Width, Height, Format, pTexData);
      } else if (Width > NUMTILES_DIMENSION && Height > NUMTILES_DIMENSION && (Flags & TEXFLAG_QUALITY) === 0) {
        Width >>= 1;
        Height >>= 1;
        pTexData = CGraphics.Rescale(Width0, Height0, Width, Height, Format, pTexData);
      }
    }
    // premultiplied alpha for RGBA textures
    if (Format === FORMAT_RGBA) {
      for (let i = 0; i < Width * Height; ++i) {
        const a = f(pTexData[i * 4 + 3] / 255);
        pTexData[i * 4] = Math.trunc(f(pTexData[i * 4] * a));
        pTexData[i * 4 + 1] = Math.trunc(f(pTexData[i * 4 + 1] * a));
        pTexData[i * 4 + 2] = Math.trunc(f(pTexData[i * 4 + 2] * a));
      }
    }
    const t: CTexture = { tex2D: null, tex3D: null, format: Format, memSize: 0 };
    const rgba = CGraphics.ToRGBA(Width, Height, Format, pTexData);
    if (Flags & TEXFLAG_TEXTURE2D) {
      const Mipmaps = !(Flags & TEXFLAG_NOMIPMAPS);
      t.tex2D = gl.createTexture();
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, t.tex2D);
      gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, Width, Height, 0, gl.RGBA, gl.UNSIGNED_BYTE, rgba);
      if (!Mipmaps) gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      else {
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, Flags & TEXTFLAG_LINEARMIPMAPS ? gl.LINEAR : gl.LINEAR_MIPMAP_NEAREST);
        gl.generateMipmap(gl.TEXTURE_2D);
      }
      t.memSize = Width * Height * PixelSize;
      if (Mipmaps) {
        let TexWidth = Width, TexHeight = Height;
        while (TexWidth > 2 && TexHeight > 2) {
          TexWidth >>= 1;
          TexHeight >>= 1;
          t.memSize += TexWidth * TexHeight * PixelSize;
        }
      }
    }
    if (Flags & TEXFLAG_TEXTURE3D) {
      const W = Math.trunc(Width / NUMTILES_DIMENSION), H = Math.trunc(Height / NUMTILES_DIMENSION);
      const Depth = NUMTILES_DIMENSION * NUMTILES_DIMENSION;
      const tmp = new Uint8Array(W * H * Depth * 4);
      const TileSize = H * W * 4, TileRowSize = W * 4, ImagePitch = W * NUMTILES_DIMENSION * 4;
      for (let i = 0; i < Depth; i++) {
        const px = (i % NUMTILES_DIMENSION) * W, py = Math.trunc(i / NUMTILES_DIMENSION) * H;
        const tile = (py * W * NUMTILES_DIMENSION + px) * 4;
        for (let y = 0; y < H; y++) tmp.set(rgba.subarray(tile + y * ImagePitch, tile + y * ImagePitch + TileRowSize), i * TileSize + y * TileRowSize);
      }
      t.tex3D = gl.createTexture();
      gl.activeTexture(gl.TEXTURE1);
      gl.bindTexture(gl.TEXTURE_2D_ARRAY, t.tex3D);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
      gl.texParameteri(gl.TEXTURE_2D_ARRAY, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
      gl.texImage3D(gl.TEXTURE_2D_ARRAY, 0, gl.RGBA, W, H, Depth, 0, gl.RGBA, gl.UNSIGNED_BYTE, tmp);
      gl.activeTexture(gl.TEXTURE0);
      t.memSize += W * H * PixelSize;
    }
    this.m_TextureMemoryUsage += t.memSize;
    this.m_aTextures[Slot] = t;
  }

  /** LoadPNG: the decoded image from the storage (preloaded), or null */
  LoadPNG(pFilename: string): CImageInfo | null {
    const img = this.m_pStorage?.Image(pFilename) ?? null;
    if (!img) return null;
    return { m_Width: img.m_Width, m_Height: img.m_Height, m_Format: img.m_Format, m_pData: img.m_pData.slice() };
  }

  LoadTexture(pFilename: string, _StorageType: number, StoreFormat: number, Flags: number): CTextureHandle {
    if (pFilename.length < 3) return new CTextureHandle();
    const Img = this.LoadPNG(pFilename);
    if (Img) {
      if (StoreFormat === FORMAT_AUTO) StoreFormat = Img.m_Format;
      return this.LoadTextureRaw(Img.m_Width, Img.m_Height, Img.m_Format, Img.m_pData, StoreFormat, Flags);
    }
    return this.m_InvalidTexture;
  }

  TextureSet(TextureID: CTextureHandle): void {
    if (this.m_Drawing !== 0) throw new Error('called Graphics()->TextureSet within begin');
    this.m_State.m_Texture = TextureID.Id();
    this.m_State.m_Dimension = 2;
  }
  TextureClear(): void { this.TextureSet(new CTextureHandle()); }

  Clear(r: number, g: number, b: number): void {
    this.FlushVertices();
    const gl = this.gl;
    gl.disable(gl.SCISSOR_TEST);
    gl.clearColor(r, g, b, 1);
    gl.clear(gl.COLOR_BUFFER_BIT);
  }

  // ---------------------------------------------------------------- drawing
  private SetState(): void {
    const gl = this.gl, s = this.m_State;
    if (s.m_ClipEnable) {
      gl.scissor(s.m_ClipX, s.m_ClipY, s.m_ClipW, s.m_ClipH);
      gl.enable(gl.SCISSOR_TEST);
    } else gl.disable(gl.SCISSOR_TEST);
    let SrcBlendMode: number = gl.ONE;
    let mode = 0, alphaTex = 0;
    const t = s.m_Texture >= 0 && s.m_Texture < MAX_TEXTURES ? this.m_aTextures[s.m_Texture] : undefined;
    if (t) {
      if (s.m_Dimension === 2 && t.tex2D) {
        mode = 1;
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, t.tex2D);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, s.m_WrapModeU === WRAP_CLAMP ? gl.CLAMP_TO_EDGE : gl.REPEAT);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, s.m_WrapModeV === WRAP_CLAMP ? gl.CLAMP_TO_EDGE : gl.REPEAT);
      } else if (s.m_Dimension === 3 && t.tex3D) {
        mode = 2;
        gl.activeTexture(gl.TEXTURE1);
        gl.bindTexture(gl.TEXTURE_2D_ARRAY, t.tex3D);
        gl.activeTexture(gl.TEXTURE0);
      }
      SrcBlendMode = t.format === FORMAT_RGBA ? gl.ONE : gl.SRC_ALPHA;
      alphaTex = t.format === FORMAT_ALPHA ? 1 : 0;
    }
    gl.uniform1i(this.uMode, mode);
    gl.uniform1i(this.uAlphaTex, alphaTex);
    switch (s.m_BlendMode) {
      case BLEND_NONE: gl.disable(gl.BLEND); break;
      case BLEND_ALPHA:
        gl.enable(gl.BLEND);
        gl.blendFunc(SrcBlendMode, gl.ONE_MINUS_SRC_ALPHA);
        break;
      case BLEND_ADDITIVE:
        gl.enable(gl.BLEND);
        gl.blendFunc(SrcBlendMode, gl.ONE);
        break;
    }
    gl.uniform4f(this.uScreen, s.m_ScreenTL.x, s.m_ScreenTL.y, s.m_ScreenBR.x, s.m_ScreenBR.y);
  }

  private FlushVertices(): void {
    if (this.m_NumVertices === 0) return;
    const NumVerts = this.m_NumVertices;
    this.m_NumVertices = 0;
    if (this.m_Drawing !== DRAWING_QUADS && this.m_Drawing !== DRAWING_LINES) return;
    const gl = this.gl;
    this.SetState();
    gl.bindVertexArray(this.vao);
    gl.bindBuffer(gl.ARRAY_BUFFER, this.vbo);
    gl.bufferSubData(gl.ARRAY_BUFFER, 0, this.m_aVertices, 0, NumVerts * FLOATS);
    if (this.m_Drawing === DRAWING_QUADS) gl.drawElements(gl.TRIANGLES, (NumVerts / 4) * 6, gl.UNSIGNED_SHORT, 0);
    else gl.drawArrays(gl.LINES, 0, NumVerts);
    this.stats.draws++;
    this.stats.vertices += NumVerts;
  }

  private AddVertices(Count: number): void {
    this.m_NumVertices += Count;
    if (this.m_NumVertices + Count >= MAX_VERTICES) this.FlushVertices();
  }

  private SetVertex(i: number, x: number, y: number, k: number): void {
    const o = (this.m_NumVertices + i) * FLOATS, v = this.m_aVertices, t = this.m_aTexture[k], c = this.m_aColor[k];
    v[o] = x; v[o + 1] = y; v[o + 2] = t.u; v[o + 3] = t.v; v[o + 4] = t.i;
    v[o + 5] = c.r; v[o + 6] = c.g; v[o + 7] = c.b; v[o + 8] = c.a;
  }

  LinesBegin(): void {
    if (this.m_Drawing !== 0) throw new Error('called Graphics()->LinesBegin twice');
    this.m_Drawing = DRAWING_LINES;
    this.SetColor(1, 1, 1, 1);
  }
  LinesEnd(): void {
    this.FlushVertices();
    this.m_Drawing = 0;
  }
  LinesDraw(pArray: CLineItem[], Num = pArray.length): void {
    for (let i = 0; i < Num; ++i) {
      this.SetVertex(2 * i, pArray[i].m_X0, pArray[i].m_Y0, 0);
      this.SetVertex(2 * i + 1, pArray[i].m_X1, pArray[i].m_Y1, 1);
    }
    this.AddVertices(2 * Num);
  }

  QuadsBegin(): void {
    if (this.m_Drawing !== 0) throw new Error('called Graphics()->QuadsBegin twice');
    this.m_Drawing = DRAWING_QUADS;
    this.QuadsSetSubset(0, 0, 1, 1, -1);
    this.QuadsSetRotation(0);
    this.SetColor(1, 1, 1, 1);
  }
  QuadsEnd(): void {
    this.FlushVertices();
    this.m_Drawing = 0;
  }
  QuadsSetRotation(Angle: number): void { this.m_Rotation = f(Angle); }

  SetColorVertex(pArray: CColorVertex[], Num = pArray.length): void {
    for (let i = 0; i < Num; ++i) {
      const c = this.m_aColor[pArray[i].m_Index];
      c.r = pArray[i].m_R; c.g = pArray[i].m_G; c.b = pArray[i].m_B; c.a = pArray[i].m_A;
    }
  }
  SetColor(r: number, g: number, b: number, a: number): void {
    for (const c of this.m_aColor) {
      c.r = r; c.g = g; c.b = b; c.a = a;
    }
  }
  SetColor4(TopLeft: vec4, TopRight: vec4, BottomLeft: vec4, BottomRight: vec4): void {
    const set = (i: number, v: vec4): void => {
      const c = this.m_aColor[i];
      c.r = v.r; c.g = v.g; c.b = v.b; c.a = v.a;
    };
    set(0, TopLeft);
    set(1, TopRight);
    set(2, BottomRight);
    set(3, BottomLeft);
  }

  QuadsSetSubset(TlU: number, TlV: number, BrU: number, BrV: number, TextureIndex = -1): void {
    const t = this.m_aTexture;
    t[0].u = TlU; t[1].u = BrU; t[0].v = TlV; t[1].v = TlV;
    t[3].u = TlU; t[2].u = BrU; t[3].v = BrV; t[2].v = BrV;
    const i = f(f(0.5 + TextureIndex) / 256);
    t[0].i = t[1].i = t[2].i = t[3].i = i;
    this.SetDimension(TextureIndex < 0 ? 2 : 3);
  }
  QuadsSetSubsetFree(x0: number, y0: number, x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, TextureIndex = -1): void {
    const t = this.m_aTexture;
    t[0].u = x0; t[0].v = y0; t[1].u = x1; t[1].v = y1; t[2].u = x2; t[2].v = y2; t[3].u = x3; t[3].v = y3;
    const i = f(f(0.5 + TextureIndex) / 256);
    t[0].i = t[1].i = t[2].i = t[3].i = i;
    this.SetDimension(TextureIndex < 0 ? 2 : 3);
  }
  /** m_State.m_Dimension changes only take effect on the next flush in the original's command buffer as well:
   * the state is copied into each render command when the vertices are flushed, so a batch mixing dimensions
   * is drawn with the last one. The same here. */
  private SetDimension(d: number): void { this.m_State.m_Dimension = d; }

  QuadsDraw(pArray: CQuadItem[], Num = pArray.length): void {
    for (let i = 0; i < Num; ++i) {
      pArray[i].m_X = f(pArray[i].m_X - f(pArray[i].m_Width / 2));
      pArray[i].m_Y = f(pArray[i].m_Y - f(pArray[i].m_Height / 2));
    }
    this.QuadsDrawTL(pArray, Num);
  }

  QuadsDrawTL(pArray: CQuadItem[], Num = pArray.length): void {
    if (this.m_Drawing !== DRAWING_QUADS) throw new Error('called Graphics()->QuadsDrawTL without begin');
    for (let i = 0; i < Num; ++i) {
      const q = pArray[i];
      const x1 = f(q.m_X + q.m_Width), y1 = f(q.m_Y + q.m_Height);
      this.SetVertex(4 * i, q.m_X, q.m_Y, 0);
      this.SetVertex(4 * i + 1, x1, q.m_Y, 1);
      this.SetVertex(4 * i + 2, x1, y1, 2);
      this.SetVertex(4 * i + 3, q.m_X, y1, 3);
      if (this.m_Rotation !== 0) {
        const cx = f(q.m_X + f(q.m_Width / 2)), cy = f(q.m_Y + f(q.m_Height / 2));
        const c = cosf(this.m_Rotation), s = sinf(this.m_Rotation);
        const v = this.m_aVertices;
        for (let k = 0; k < 4; k++) {
          const o = (this.m_NumVertices + 4 * i + k) * FLOATS;
          const x = f(v[o] - cx), y = f(v[o + 1] - cy);
          v[o] = f(f(f(x * c) - f(y * s)) + cx);
          v[o + 1] = f(f(f(x * s) + f(y * c)) + cy);
        }
      }
    }
    this.AddVertices(4 * Num);
  }

  QuadsDrawFreeform(pArray: CFreeformItem[], Num = pArray.length): void {
    for (let i = 0; i < Num; ++i) {
      const q = pArray[i];
      this.SetVertex(4 * i, q.m_X0, q.m_Y0, 0);
      this.SetVertex(4 * i + 1, q.m_X1, q.m_Y1, 1);
      this.SetVertex(4 * i + 2, q.m_X3, q.m_Y3, 3);
      this.SetVertex(4 * i + 3, q.m_X2, q.m_Y2, 2);
    }
    this.AddVertices(4 * Num);
  }

  QuadsText(x: number, y: number, Size: number, pText: string): void {
    const StartX = x;
    for (let k = 0; k < pText.length; k++) {
      const c = pText.charCodeAt(k) << 24 >> 24;
      if (c === 10) {
        x = StartX;
        y += Size;
      } else {
        const cx = c % 16, cy = Math.trunc(c / 16);
        this.QuadsSetSubset(f(cx / 16), f(cy / 16), f(cx / 16 + 1 / 16), f(cy / 16 + 1 / 16));
        this.QuadsDrawTL([new CQuadItem(x, y, Size, Size)], 1);
        x += Size / 2;
      }
    }
  }

  /** the frame is done (Swap): the browser presents the canvas when the frame callback returns */
  Swap(): void {
    this.FlushVertices();
    this.stats.lastDraws = this.stats.draws;
    this.stats.draws = 0;
    this.stats.vertices = 0;
  }

  /** ReadBackbuffer: RGB pixels of a part of the screen (for the screenshot of a test) */
  ReadBackbuffer(x: number, y: number, w: number, h: number): Uint8Array {
    const gl = this.gl;
    const px = new Uint8Array(w * h * 4);
    gl.readPixels(x, this.m_ScreenHeight - y - h, w, h, gl.RGBA, gl.UNSIGNED_BYTE, px);
    return px;
  }

  WindowActive(): boolean { return typeof document === 'undefined' || !document.hidden; }
  WindowOpen(): boolean { return true; }
}
