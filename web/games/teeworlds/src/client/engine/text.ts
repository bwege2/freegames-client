// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/textrender.h and engine/client/text.cpp of Teeworlds 0.7.5 in TypeScript. The glyph atlas,
// its slots, the outline textures (Grow), the cursor, the word wrap and the rounding to screen pixels are the
// original's; the glyphs are rasterized by the browser from the release's DejaVuSans.ttf instead of FreeType
// (the cell sizes InitIndex derives from all glyphs of the font come from FreeType, re/teeworlds/tools/fontcells.sh;
// the advance is the browser's rounded to whole pixels, as FreeType's hinted advance is; no kerning).
import { f, type vec2, type vec4 } from '../../base/vmath.ts';
import { str_utf8_decode } from '../../base/system.ts';
import { CGraphics, CQuadItem, CTextureHandle, FORMAT_ALPHA, TEXLOAD_NOMIPMAPS } from './graphics.ts';
import { TIME_FREQ } from '../../engine/shared/network.ts';

export const TEXTFLAG_RENDER = 1, TEXTFLAG_ALLOW_NEWLINE = 2, TEXTFLAG_STOP_AT_END = 4;
const MAX_CHARACTERS = 64;
const aFontSizes = [8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 36, 64];
const NUM_FONT_SIZES = aFontSizes.length;
/** CharMaxWidth, CharMaxHeight of InitIndex for each font size (FreeType 2.14 on DejaVuSans.ttf 2.33) */
const FONT_CELLS: Record<number, [number, number]> = {
  8: [32, 16], 9: [32, 32], 10: [32, 32], 11: [32, 32], 12: [32, 32], 13: [32, 32], 14: [32, 32], 15: [32, 32], 16: [32, 32],
  17: [64, 32], 18: [64, 32], 19: [64, 32], 20: [64, 64], 36: [128, 64], 64: [128, 128],
};

/** a rendered glyph as FreeType gives it: an 8-bit coverage bitmap and its metrics in pixels */
export interface CGlyphBitmap { width: number; rows: number; buffer: Uint8Array; left: number; top: number; advance: number }
export interface IGlyphRasterizer { render(chr: number, size: number): CGlyphBitmap | null }

/** the glyphs from the browser's text rendering of a loaded font face */
export class CCanvasRasterizer implements IGlyphRasterizer {
  private family: string;
  private canvas: OffscreenCanvas | HTMLCanvasElement;
  private ctx: OffscreenCanvasRenderingContext2D | CanvasRenderingContext2D;
  constructor(family: string) {
    this.family = family;
    this.canvas = typeof OffscreenCanvas !== 'undefined' ? new OffscreenCanvas(256, 256) : document.createElement('canvas');
    this.canvas.width = this.canvas.height = 256;
    this.ctx = this.canvas.getContext('2d', { willReadFrequently: true }) as OffscreenCanvasRenderingContext2D;
  }
  render(chr: number, size: number): CGlyphBitmap | null {
    if (chr < 0) return null;
    const ctx = this.ctx;
    const dim = Math.max(64, size * 3);
    if (this.canvas.width < dim) this.canvas.width = this.canvas.height = dim;
    const W = this.canvas.width;
    ctx.clearRect(0, 0, W, W);
    ctx.font = `${size}px ${this.family}`;
    ctx.fillStyle = '#fff';
    ctx.textBaseline = 'alphabetic';
    const s = String.fromCodePoint(chr);
    const ox = size, oy = size * 2;
    ctx.fillText(s, ox, oy);
    const advance = Math.round(ctx.measureText(s).width);
    const img = ctx.getImageData(0, 0, W, W).data;
    let minx = W, miny = W, maxx = -1, maxy = -1;
    for (let y = 0; y < W; y++)
      for (let x = 0; x < W; x++)
        if (img[(y * W + x) * 4 + 3]) {
          if (x < minx) minx = x;
          if (x > maxx) maxx = x;
          if (y < miny) miny = y;
          if (y > maxy) maxy = y;
        }
    if (maxx < 0) return { width: 0, rows: 0, buffer: new Uint8Array(0), left: 0, top: 0, advance };
    const width = maxx - minx + 1, rows = maxy - miny + 1;
    const buffer = new Uint8Array(width * rows);
    for (let y = 0; y < rows; y++) for (let x = 0; x < width; x++) buffer[y * width + x] = img[((y + miny) * W + x + minx) * 4 + 3];
    return { width, rows, buffer, left: minx - ox, top: oy - miny, advance };
  }
}

export class CTextCursor {
  m_Flags = 0;
  m_LineCount = 1;
  m_GlyphCount = 0;
  m_CharCount = 0;
  m_MaxLines = 0;
  m_StartX = 0;
  m_StartY = 0;
  m_LineWidth = -1;
  m_X = 0;
  m_Y = 0;
  m_FontSize = 0;
  copy(): CTextCursor { return Object.assign(new CTextCursor(), this); }
}

interface CFontChar {
  m_ID: number;
  m_Width: number;
  m_Height: number;
  m_OffsetX: number;
  m_OffsetY: number;
  m_AdvanceX: number;
  m_aUvs: [number, number, number, number];
  m_TouchTime: number;
}

class CFontSizeData {
  m_FontSize = -1;
  m_aTextures = [new CTextureHandle(), new CTextureHandle()];
  m_TextureWidth = 0;
  m_TextureHeight = 0;
  m_NumXChars = 0;
  m_NumYChars = 0;
  m_CharMaxWidth = 0;
  m_CharMaxHeight = 0;
  m_aCharacters: CFontChar[] = [];
  m_CurrentCharacter = 0;
}

export interface CQuadChar { m_aUvs: [number, number, number, number]; m_QuadItem: CQuadItem }

/** CTextRender */
export class CTextRender {
  private m_pGraphics: CGraphics;
  private raster: IGlyphRasterizer | null = null;
  private time_get: () => number;
  private m_TextR = 1;
  private m_TextG = 1;
  private m_TextB = 1;
  private m_TextA = 1;
  private m_TextOutlineR = 0;
  private m_TextOutlineG = 0;
  private m_TextOutlineB = 0;
  private m_TextOutlineA = f(0.3);
  private m_aSizes: CFontSizeData[] = [];

  constructor(graphics: CGraphics, time_get: () => number) {
    this.m_pGraphics = graphics;
    this.time_get = time_get;
  }
  private Graphics(): CGraphics { return this.m_pGraphics; }

  /** LoadFont: the rasterizer of the loaded font */
  LoadFont(raster: IGlyphRasterizer): number {
    this.raster = raster;
    this.m_aSizes = aFontSizes.map(() => new CFontSizeData());
    return 0;
  }

  private static WordLength(s: string, i: number): number {
    let n = 1;
    for (;;) {
      const c = i < s.length ? s.charCodeAt(i) : 0;
      if (c === 0) return n - 1;
      if (c === 10 || c === 9 || c === 32) return n;
      i++;
      n++;
    }
  }

  private GetFontSizeIndex(Pixelsize: number): number {
    for (let i = 0; i < NUM_FONT_SIZES; i++) if (aFontSizes[i] >= Pixelsize) return i;
    return NUM_FONT_SIZES - 1;
  }

  private static Grow(pIn: Uint8Array, pOut: Uint8Array, w: number, h: number): void {
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        let c = pIn[y * w + x];
        for (let sy = -1; sy <= 1; sy++)
          for (let sx = -1; sx <= 1; sx++) {
            const GetX = x + sx, GetY = y + sy;
            if (GetX >= 0 && GetY >= 0 && GetX < w && GetY < h) {
              const v = pIn[GetY * w + GetX];
              if (v > c) c = v;
            }
          }
        pOut[y * w + x] = c;
      }
  }

  private InitTexture(pSizeData: CFontSizeData, CharWidth: number, CharHeight: number, Xchars: number, Ychars: number): void {
    const Width = CharWidth * Xchars, Height = CharHeight * Ychars;
    const pMem = new Uint8Array(Width * Height);
    for (let i = 0; i < 2; i++) {
      if (pSizeData.m_aTextures[i].IsValid()) this.Graphics().UnloadTexture(pSizeData.m_aTextures[i]);
      pSizeData.m_aTextures[i] = this.Graphics().LoadTextureRaw(Width, Height, FORMAT_ALPHA, pMem, FORMAT_ALPHA, TEXLOAD_NOMIPMAPS);
    }
    pSizeData.m_NumXChars = Xchars;
    pSizeData.m_NumYChars = Ychars;
    pSizeData.m_TextureWidth = Width;
    pSizeData.m_TextureHeight = Height;
    pSizeData.m_CurrentCharacter = 0;
  }

  private static AdjustOutlineThicknessToFontSize(OutlineThickness: number, FontSize: number): number {
    if (FontSize > 36) OutlineThickness *= 4;
    else if (FontSize >= 18) OutlineThickness *= 2;
    return OutlineThickness;
  }

  private IncreaseTextureSize(pSizeData: CFontSizeData): void {
    if (pSizeData.m_TextureWidth < pSizeData.m_TextureHeight) pSizeData.m_NumXChars <<= 1;
    else pSizeData.m_NumYChars <<= 1;
    this.InitTexture(pSizeData, pSizeData.m_CharMaxWidth, pSizeData.m_CharMaxHeight, pSizeData.m_NumXChars, pSizeData.m_NumYChars);
  }

  private InitIndex(Index: number): void {
    const pSizeData = this.m_aSizes[Index];
    pSizeData.m_FontSize = aFontSizes[Index];
    const [w, h] = FONT_CELLS[pSizeData.m_FontSize];
    pSizeData.m_CharMaxWidth = w;
    pSizeData.m_CharMaxHeight = h;
    this.InitTexture(pSizeData, w, h, 8, 8);
  }

  private GetSize(Pixelsize: number): CFontSizeData {
    const Index = this.GetFontSizeIndex(Pixelsize);
    if (this.m_aSizes[Index].m_FontSize !== aFontSizes[Index]) this.InitIndex(Index);
    return this.m_aSizes[Index];
  }

  private UploadGlyph(pSizeData: CFontSizeData, Texnum: number, SlotID: number, pData: Uint8Array): void {
    const sw = Math.trunc(pSizeData.m_TextureWidth / pSizeData.m_NumXChars), sh = Math.trunc(pSizeData.m_TextureHeight / pSizeData.m_NumYChars);
    const x = (SlotID % pSizeData.m_NumXChars) * sw;
    const y = Math.trunc(SlotID / pSizeData.m_NumXChars) * sh;
    this.Graphics().LoadTextureRawSub(pSizeData.m_aTextures[Texnum], x, y, sw, sh, FORMAT_ALPHA, pData);
  }

  private GetSlot(pSizeData: CFontSizeData): number {
    const CharCount = pSizeData.m_NumXChars * pSizeData.m_NumYChars;
    if (pSizeData.m_CurrentCharacter < CharCount) return pSizeData.m_CurrentCharacter++;
    let Oldest = 0;
    for (let i = 1; i < CharCount; i++) if (pSizeData.m_aCharacters[i].m_TouchTime < pSizeData.m_aCharacters[Oldest].m_TouchTime) Oldest = i;
    if (this.time_get() - pSizeData.m_aCharacters[Oldest].m_TouchTime < TIME_FREQ &&
      (pSizeData.m_NumXChars < MAX_CHARACTERS || pSizeData.m_NumYChars < MAX_CHARACTERS)) {
      // the atlas grows and is empty again: the characters are rendered anew
      this.IncreaseTextureSize(pSizeData);
      return this.GetSlot(pSizeData);
    }
    return Oldest;
  }

  private RenderGlyph(pSizeData: CFontSizeData, Chr: number): number {
    const SlotW = Math.trunc(pSizeData.m_TextureWidth / pSizeData.m_NumXChars);
    const SlotH = Math.trunc(pSizeData.m_TextureHeight / pSizeData.m_NumYChars);
    const SlotSize = SlotW * SlotH;
    let x = 1, y = 1;
    const pBitmap = this.raster?.render(Chr, pSizeData.m_FontSize) ?? null;
    if (!pBitmap) return -1;
    const SlotID = this.GetSlot(pSizeData);
    if (SlotID < 0) return -1;
    const OutlineThickness = CTextRender.AdjustOutlineThicknessToFontSize(1, pSizeData.m_FontSize);
    x += OutlineThickness;
    y += OutlineThickness;
    const ms_aGlyphData = new Uint8Array(SlotSize);
    const ms_aGlyphDataOutlined = new Uint8Array(SlotSize);
    for (let py = 0; py < pBitmap.rows && py + y < SlotH; py++)
      for (let px = 0; px < pBitmap.width && px + x < SlotW; px++) ms_aGlyphData[(py + y) * SlotW + px + x] = pBitmap.buffer[py * pBitmap.width + px];
    this.UploadGlyph(pSizeData, 0, SlotID, ms_aGlyphData);
    if (OutlineThickness === 1) {
      CTextRender.Grow(ms_aGlyphData, ms_aGlyphDataOutlined, SlotW, SlotH);
      this.UploadGlyph(pSizeData, 1, SlotID, ms_aGlyphDataOutlined);
    } else {
      for (let i = OutlineThickness; i > 0; i -= 2) {
        CTextRender.Grow(ms_aGlyphData, ms_aGlyphDataOutlined, SlotW, SlotH);
        CTextRender.Grow(ms_aGlyphDataOutlined, ms_aGlyphData, SlotW, SlotH);
      }
      this.UploadGlyph(pSizeData, 1, SlotID, ms_aGlyphData);
    }
    const Scale = f(1 / pSizeData.m_FontSize);
    const Uscale = f(1 / pSizeData.m_TextureWidth);
    const Vscale = f(1 / pSizeData.m_TextureHeight);
    const Height = pBitmap.rows + OutlineThickness * 2 + 2;
    const Width = pBitmap.width + OutlineThickness * 2 + 2;
    const u0 = f((SlotID % pSizeData.m_NumXChars) / pSizeData.m_NumXChars);
    const v0 = f(Math.trunc(SlotID / pSizeData.m_NumXChars) / pSizeData.m_NumYChars);
    pSizeData.m_aCharacters[SlotID] = {
      m_ID: Chr,
      m_Height: f(Height * Scale),
      m_Width: f(Width * Scale),
      m_OffsetX: f((pBitmap.left - 2) * Scale),
      m_OffsetY: f((pSizeData.m_FontSize - pBitmap.top) * Scale),
      m_AdvanceX: f(pBitmap.advance * Scale),
      m_aUvs: [u0, v0, f(u0 + f(Width * Uscale)), f(v0 + f(Height * Vscale))],
      m_TouchTime: 0,
    };
    return SlotID;
  }

  private GetChar(pSizeData: CFontSizeData, Chr: number): CFontChar | null {
    let pFontchr: CFontChar | null = null;
    for (let i = 0; i < pSizeData.m_CurrentCharacter; i++) {
      if (pSizeData.m_aCharacters[i]?.m_ID === Chr) {
        pFontchr = pSizeData.m_aCharacters[i];
        break;
      }
    }
    if (!pFontchr) {
      const Index = this.RenderGlyph(pSizeData, Chr);
      if (Index >= 0) pFontchr = pSizeData.m_aCharacters[Index];
    }
    if (pFontchr) pFontchr.m_TouchTime = this.time_get();
    return pFontchr;
  }

  SetCursor(pCursor: CTextCursor, x: number, y: number, FontSize: number, Flags: number): void {
    pCursor.m_FontSize = f(FontSize);
    pCursor.m_StartX = f(x);
    pCursor.m_StartY = f(y);
    pCursor.m_X = f(x);
    pCursor.m_Y = f(y);
    pCursor.m_LineCount = 1;
    pCursor.m_LineWidth = -1;
    pCursor.m_Flags = Flags;
    pCursor.m_GlyphCount = 0;
    pCursor.m_CharCount = 0;
    pCursor.m_MaxLines = 0;
  }

  Text(_pFontSetV: unknown, x: number, y: number, Size: number, pText: string, LineWidth: number, MultiLine = true): void {
    const Cursor = new CTextCursor();
    this.SetCursor(Cursor, x, y, Size, TEXTFLAG_RENDER);
    if (!MultiLine) Cursor.m_Flags |= TEXTFLAG_STOP_AT_END;
    Cursor.m_LineWidth = f(LineWidth);
    this.TextEx(Cursor, pText, -1);
  }

  TextWidth(_pFontSetV: unknown, Size: number, pText: string, StrLength: number, LineWidth: number): number {
    const Cursor = new CTextCursor();
    this.SetCursor(Cursor, 0, 0, Size, 0);
    Cursor.m_LineWidth = f(LineWidth);
    this.TextEx(Cursor, pText, StrLength);
    return Cursor.m_X;
  }

  TextLineCount(_pFontSetV: unknown, Size: number, pText: string, LineWidth: number): number {
    const Cursor = new CTextCursor();
    this.SetCursor(Cursor, 0, 0, Size, 0);
    Cursor.m_LineWidth = f(LineWidth);
    this.TextEx(Cursor, pText, -1);
    return Cursor.m_LineCount;
  }

  TextColor(r: number | vec4, g = 0, b = 0, a = 0): void {
    if (typeof r === 'object') ({ r, g, b, a } = r);
    this.m_TextR = r;
    this.m_TextG = g;
    this.m_TextB = b;
    this.m_TextA = a;
  }

  TextOutlineColor(r: number | vec4, g = 0, b = 0, a = 0): void {
    if (typeof r === 'object') ({ r, g, b, a } = r);
    this.m_TextOutlineR = r;
    this.m_TextOutlineG = g;
    this.m_TextOutlineB = b;
    this.m_TextOutlineA = a;
  }

  /** the screen rounding of TextEx: [FakeToScreenX, FakeToScreenY, CursorX, CursorY, ActualSize, Size] */
  private Fake(pCursor: CTextCursor): [number, number, number, number, number, number] {
    const [ScreenX0, ScreenY0, ScreenX1, ScreenY1] = this.Graphics().GetScreen();
    const FakeToScreenX = f(this.Graphics().ScreenWidth() / f(ScreenX1 - ScreenX0));
    const FakeToScreenY = f(this.Graphics().ScreenHeight() / f(ScreenY1 - ScreenY0));
    const ActualX = Math.trunc(f(pCursor.m_X * FakeToScreenX));
    const ActualY = Math.trunc(f(pCursor.m_Y * FakeToScreenY));
    const ActualSize = Math.trunc(f(pCursor.m_FontSize * FakeToScreenY));
    return [FakeToScreenX, FakeToScreenY, f(ActualX / FakeToScreenX), f(ActualY / FakeToScreenY), ActualSize, f(ActualSize / FakeToScreenY)];
  }

  TextShadowed(pCursor: CTextCursor, pText: string, Length: number, ShadowOffset: vec2, ShadowColor: vec4, TextColor_: vec4): void {
    const [ScreenX0, ScreenY0, ScreenX1, ScreenY1] = this.Graphics().GetScreen();
    const FakeToScreenX = f(this.Graphics().ScreenWidth() / f(ScreenX1 - ScreenX0));
    const FakeToScreenY = f(this.Graphics().ScreenHeight() / f(ScreenY1 - ScreenY0));
    const sx = f(ShadowOffset.x / FakeToScreenX), sy = f(ShadowOffset.y / FakeToScreenY);
    const aTextQuads: CQuadChar[] = [];
    const tex = { t: new CTextureHandle() };
    this.TextDeferredRenderEx(pCursor, pText, Length, aTextQuads, tex);
    const G = this.Graphics();
    G.TextureSet(tex.t);
    G.QuadsBegin();
    G.SetColor(ShadowColor.r, ShadowColor.g, ShadowColor.b, ShadowColor.a);
    for (const q of aTextQuads) {
      G.QuadsSetSubset(q.m_aUvs[0], q.m_aUvs[1], q.m_aUvs[2], q.m_aUvs[3]);
      G.QuadsDrawTL([new CQuadItem(f(q.m_QuadItem.m_X + sx), f(q.m_QuadItem.m_Y + sy), q.m_QuadItem.m_Width, q.m_QuadItem.m_Height)], 1);
    }
    G.SetColor(TextColor_.r, TextColor_.g, TextColor_.b, TextColor_.a);
    for (const q of aTextQuads) {
      G.QuadsSetSubset(q.m_aUvs[0], q.m_aUvs[1], q.m_aUvs[2], q.m_aUvs[3]);
      G.QuadsDrawTL([q.m_QuadItem], 1);
    }
    G.QuadsEnd();
  }

  /** the glyph quads of a text (TextDeferredRenderEx); the font texture in pFontTexture.t */
  TextDeferredRenderEx(pCursor: CTextCursor, pText: string, Length: number, aQuadChar: CQuadChar[], pFontTexture: { t: CTextureHandle }): void {
    if (!this.raster) return;
    const fake = this.Fake(pCursor);
    pFontTexture.t = this.GetSize(fake[4]).m_aTextures[0];
    this.Layout(pCursor, pText, Length, fake, pCursor.m_LineCount, pCursor.m_Flags & TEXTFLAG_RENDER ? (pChr, x, y, w, h) => {
      aQuadChar.push({ m_aUvs: pChr.m_aUvs, m_QuadItem: new CQuadItem(x, y, w, h) });
    } : null, (c, t, l) => this.TextDeferredRenderEx(c, t, l, aQuadChar, pFontTexture), false);
  }

  TextEx(pCursor: CTextCursor, pText: string, Length: number): void {
    if (!this.raster) return;
    const fake = this.Fake(pCursor);
    const pSizeData = this.GetSize(fake[4]);
    const LineCount = pCursor.m_LineCount;
    // if we don't want to render, we can just skip the first outline pass
    for (let i = pCursor.m_Flags & TEXTFLAG_RENDER ? 0 : 1; i < 2; i++) {
      const render = (pCursor.m_Flags & TEXTFLAG_RENDER) !== 0;
      if (render) {
        this.Graphics().TextureSet(pSizeData.m_aTextures[i === 0 ? 1 : 0]);
        this.Graphics().QuadsBegin();
        if (i === 0) this.Graphics().SetColor(this.m_TextOutlineR, this.m_TextOutlineG, this.m_TextOutlineB, f(this.m_TextOutlineA * this.m_TextA));
        else this.Graphics().SetColor(this.m_TextR, this.m_TextG, this.m_TextB, this.m_TextA);
      }
      this.Layout(pCursor, pText, Length, fake, LineCount, render ? (pChr, x, y, w, h) => {
        this.Graphics().QuadsSetSubset(pChr.m_aUvs[0], pChr.m_aUvs[1], pChr.m_aUvs[2], pChr.m_aUvs[3]);
        this.Graphics().QuadsDrawTL([new CQuadItem(x, y, w, h)], 1);
      } : null, (cc, t, l) => this.TextEx(cc, t, l), true);
      if (render) this.Graphics().QuadsEnd();
    }
  }

  /** one pass of the layout loop TextEx and TextDeferredRenderEx share (measure is the function's recursive
   * call; newlineMoves: a '\n' moves the cursor's y, which TextDeferredRenderEx forgets) */
  private Layout(pCursor: CTextCursor, pText: string, Length: number, fake: [number, number, number, number, number, number], StartLineCount: number,
    emit: ((pChr: CFontChar, x: number, y: number, w: number, h: number) => void) | null,
    measure: (c: CTextCursor, t: string, l: number) => void, newlineMoves: boolean): void {
    const [FakeToScreenX, FakeToScreenY, CursorX, CursorY, ActualSize, Size] = fake;
    const pSizeData = this.GetSize(ActualSize);
    if (Length < 0) Length = pText.length;
    let pCurrent = 0;
    const pEnd = Math.min(pText.length, pCurrent + Length);
    let DrawX = CursorX, DrawY = CursorY;
    let LineCount = StartLineCount;
    let GotNewLine = 0;
    const sub = (a: number, l: number): string => pText.slice(a, a + l);
    while (pCurrent < pEnd && (pCursor.m_MaxLines < 1 || LineCount <= pCursor.m_MaxLines)) {
      let NewLine = 0;
      let pBatchEnd = pEnd;
      if (pCursor.m_LineWidth > 0 && !(pCursor.m_Flags & TEXTFLAG_STOP_AT_END)) {
        let Wlen = Math.min(CTextRender.WordLength(pText, pCurrent), pEnd - pCurrent);
        const Compare = pCursor.copy();
        Compare.m_X = DrawX;
        Compare.m_Y = DrawY;
        Compare.m_Flags &= ~TEXTFLAG_RENDER;
        Compare.m_LineWidth = -1;
        measure(Compare, sub(pCurrent, Wlen), Wlen);
        if (f(Compare.m_X - DrawX) > pCursor.m_LineWidth) {
          // word can't be fitted in one line, cut it
          const Cutter = pCursor.copy();
          Cutter.m_GlyphCount = 0;
          Cutter.m_X = DrawX;
          Cutter.m_Y = DrawY;
          Cutter.m_Flags &= ~TEXTFLAG_RENDER;
          Cutter.m_Flags |= TEXTFLAG_STOP_AT_END;
          measure(Cutter, sub(pCurrent, Wlen), Wlen);
          Wlen = Cutter.m_GlyphCount;
          NewLine = 1;
          if (Wlen <= 3) Wlen = 0; // if we can't place 3 chars of the word on this line, take the next
        } else if (f(Compare.m_X - pCursor.m_StartX) > pCursor.m_LineWidth) {
          NewLine = 1;
          Wlen = 0;
        }
        pBatchEnd = pCurrent + Wlen;
      }
      const pTmp = { i: pCurrent };
      let NextCharacter = str_utf8_decode(pText, pTmp);
      while (pCurrent < pBatchEnd) {
        pCursor.m_CharCount += pTmp.i - pCurrent;
        const Character = NextCharacter;
        pCurrent = pTmp.i;
        NextCharacter = str_utf8_decode(pText, pTmp);
        if (Character === 10) {
          DrawX = pCursor.m_StartX;
          DrawY = f(DrawY + Size);
          if (newlineMoves) GotNewLine = 1;
          DrawX = f(Math.trunc(f(DrawX * FakeToScreenX)) / FakeToScreenX); // realign
          DrawY = f(Math.trunc(f(DrawY * FakeToScreenY)) / FakeToScreenY);
          ++LineCount;
          if (pCursor.m_MaxLines > 0 && LineCount > pCursor.m_MaxLines) break;
          continue;
        }
        const pChr = this.GetChar(pSizeData, Character);
        if (pChr) {
          const Advance = pChr.m_AdvanceX; // + Kerning(Character, NextCharacter)*Scale: no kerning in the browser
          if (pCursor.m_Flags & TEXTFLAG_STOP_AT_END && f(f(DrawX + f(Advance * Size)) - pCursor.m_StartX) > pCursor.m_LineWidth) {
            // we hit the end of the line, no more to render or count
            pCurrent = pEnd;
            break;
          }
          if (emit) emit(pChr, f(DrawX + f(pChr.m_OffsetX * Size)), f(DrawY + f(pChr.m_OffsetY * Size)), f(pChr.m_Width * Size), f(pChr.m_Height * Size));
          DrawX = f(DrawX + f(Advance * Size));
          pCursor.m_GlyphCount++;
        }
      }
      if (NewLine) {
        DrawX = pCursor.m_StartX;
        DrawY = f(DrawY + Size);
        GotNewLine = 1;
        DrawX = f(Math.trunc(f(DrawX * FakeToScreenX)) / FakeToScreenX); // realign
        DrawY = f(Math.trunc(f(DrawY * FakeToScreenY)) / FakeToScreenY);
        ++LineCount;
      }
    }
    pCursor.m_X = DrawX;
    pCursor.m_LineCount = LineCount;
    if (GotNewLine) pCursor.m_Y = DrawY;
  }

  TextGetLineBaseY(pCursor: CTextCursor): number {
    const [, , , CursorY, ActualSize, Size] = this.Fake(pCursor);
    if (!this.raster) return 0;
    const pSizeData = this.GetSize(ActualSize);
    const pChr = this.GetChar(pSizeData, 32);
    if (!pChr) return CursorY;
    return f(f(CursorY + f(pChr.m_OffsetY * Size)) + f(pChr.m_Height * Size));
  }
}
