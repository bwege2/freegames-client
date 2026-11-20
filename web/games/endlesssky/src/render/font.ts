// The original's bitmap font (images/font/ubuntu14r.png and ubuntu18r.png),
// rendered in canvas with Font.cpp's advances, kerning and glyph selection.
// The atlases are 2x: a glyph cell is half its atlas size on screen.

const GLYPHS = 98;
const KERN = 2;

interface CachedFont {
  image: HTMLImageElement;
  cellWidth: number; // atlas pixels
  cellHeight: number;
  glyphWidth: number; // on-screen
  glyphHeight: number;
  space: number;
  advance: Int32Array;
  tints: Map<string, HTMLCanvasElement>;
}

const fonts = new Map<string, CachedFont>();

export async function loadFont(url: string): Promise<void> {
  if (fonts.has(url)) return;
  const image = new Image();
  image.src = url;
  await image.decode();
  const canvas = document.createElement('canvas');
  canvas.width = image.naturalWidth;
  canvas.height = image.naturalHeight;
  const context = canvas.getContext('2d', { willReadFrequently: true })!;
  context.drawImage(image, 0, 0);
  const pixels = context.getImageData(0, 0, canvas.width, canvas.height).data;

  const cellWidth = Math.floor(image.naturalWidth / GLYPHS);
  const cellHeight = image.naturalHeight;
  const advance = new Int32Array(GLYPHS * GLYPHS);
  const alphaAt = (x: number, y: number): number => pixels[4 * (y * canvas.width + x) + 3];

  for (let previous = 1; previous < GLYPHS; ++previous) {
    for (let next = 0; next < GLYPHS; ++next) {
      let maxD = 0;
      let glyphWidth = 0;
      for (let y = 0; y < cellHeight; ++y) {
        let pit = cellWidth - 1;
        while (pit >= 0 && alphaAt(previous * cellWidth + pit, y) < 0xc0) --pit;
        const distance = pit + 1;
        glyphWidth = Math.max(distance, glyphWidth);
        if (next) {
          let nit = 0;
          while (nit < cellWidth && alphaAt(next * cellWidth + nit, y) < 0xc0) ++nit;
          maxD = Math.max(maxD, distance + 1 - nit);
        } else {
          maxD = Math.max(maxD, distance);
        }
      }
      advance[previous * GLYPHS + next] = Math.floor(Math.max(maxD, glyphWidth - 4) / 2);
    }
  }

  const halfWidth = Math.floor(cellWidth / 2);
  fonts.set(url, {
    image,
    cellWidth,
    cellHeight,
    glyphWidth: cellWidth / 2,
    glyphHeight: cellHeight / 2,
    space: Math.floor((halfWidth + 3) / 6) + 1,
    advance,
    tints: new Map(),
  });
}

function fontFor(url: string): CachedFont {
  const font = fonts.get(url);
  if (!font) throw new Error(`font not loaded: ${url}`);
  return font;
}

function tinted(font: CachedFont, color: string): HTMLCanvasElement {
  let canvas = font.tints.get(color);
  if (canvas) return canvas;
  canvas = document.createElement('canvas');
  canvas.width = font.image.naturalWidth;
  canvas.height = font.image.naturalHeight;
  const context = canvas.getContext('2d')!;
  context.drawImage(font.image, 0, 0);
  context.globalCompositeOperation = 'source-in';
  context.fillStyle = color;
  context.fillRect(0, 0, canvas.width, canvas.height);
  font.tints.set(color, canvas);
  return canvas;
}

function glyphIndex(code: number, isAfterSpace: boolean): number {
  if (code === 39 && isAfterSpace) return 96;
  if (code === 34 && isAfterSpace) return 97;
  return Math.max(0, Math.min(GLYPHS - 3, code - 32));
}

export function textWidth(url: string, text: string): number {
  const font = fontFor(url);
  let width = 0;
  let previous = 0;
  let afterSpace = true;
  for (const char of text) {
    if (char === '_') continue;
    const code = char.codePointAt(0)!;
    const glyph = glyphIndex(code, afterSpace);
    if (char !== '"' && char !== "'") afterSpace = !glyph;
    if (!glyph) width += font.space;
    else {
      width += font.advance[previous * GLYPHS + glyph] + KERN;
      previous = glyph;
    }
  }
  return width;
}

export interface TextOptions {
  color?: string;
  align?: 'left' | 'center' | 'right';
  width?: number;
  alpha?: number;
}

export function drawText(
  context: CanvasRenderingContext2D,
  url: string,
  text: string,
  x: number,
  y: number,
  options: TextOptions = {},
): number {
  const font = fontFor(url);
  const color = options.color ?? '#ffffff';
  const canvas = tinted(font, color);
  if (options.align && options.align !== 'left') {
    const width = textWidth(url, text);
    if (options.width) x += options.align === 'center' ? (options.width - width) / 2 : options.width - width;
    else if (options.align === 'center') x -= width / 2;
    else x -= width;
  }
  const previousAlpha = context.globalAlpha;
  if (options.alpha !== undefined) context.globalAlpha = previousAlpha * options.alpha;

  let previous = 0;
  let afterSpace = true;
  let cursor = Math.round(x) - 1;
  for (const char of text) {
    if (char === '_') continue;
    const code = char.codePointAt(0)!;
    const glyph = glyphIndex(code, afterSpace);
    if (char !== '"' && char !== "'") afterSpace = !glyph;
    if (!glyph) {
      cursor += font.space;
      continue;
    }
    cursor += font.advance[previous * GLYPHS + glyph] + KERN;
    context.drawImage(canvas, glyph * font.cellWidth, 0, font.cellWidth, font.cellHeight,
      cursor, Math.round(y), font.glyphWidth, font.glyphHeight);
    previous = glyph;
  }
  context.globalAlpha = previousAlpha;
  return cursor + font.advance[previous * GLYPHS];
}

/** Split text into lines no wider than `maxWidth`, keeping blank lines. */
export function wrapText(url: string, text: string, maxWidth: number): string[] {
  const lines: string[] = [];
  for (const paragraph of text.split('\n')) {
    if (!paragraph.trim()) {
      lines.push('');
      continue;
    }
    let line = '';
    for (const word of paragraph.split(/\s+/)) {
      const candidate = line ? `${line} ${word}` : word;
      if (line && textWidth(url, candidate) > maxWidth) {
        lines.push(line);
        line = word;
      } else line = candidate;
    }
    if (line) lines.push(line);
  }
  return lines;
}

export function fontHeight(url: string, scale = 1): number {
  return fontFor(url).glyphHeight * scale;
}
