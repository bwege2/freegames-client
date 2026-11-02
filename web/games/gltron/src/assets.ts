// GLtron's original data: OBJ/MTL lightcycle and recognizer models, the classic art-pack textures,
// the two FTX bitmap fonts and the sounds. The music is the original Impulse Tracker module rendered
// to OGG by re/gltron/fetch.sh (a lossy conversion; the .it stays in the download).
const urls = import.meta.glob('../assets/**/*.{png,obj,mtl,ftx,txt,ogg,wav}', {
  query: '?url', import: 'default', eager: true,
}) as Record<string, string>;

export function assetUrl(path: string): string {
  const u = urls[`../assets/${path}`];
  if (!u) throw new Error(`no GLtron asset ${path}`);
  return u;
}

export async function textAsset(path: string): Promise<string> {
  const r = await fetch(assetUrl(path));
  if (!r.ok) throw new Error(`cannot read ${path}`);
  return r.text();
}

export interface FtxFont {
  lower: number;
  upper: number;
  width: number;
  pages: HTMLImageElement[];
  /** pages tinted for a color, cached */
  tinted: Map<string, HTMLCanvasElement[]>;
}

async function loadImage(url: string): Promise<HTMLImageElement> {
  const img = new Image();
  img.src = url;
  await img.decode();
  return img;
}

/** ftxLoadFont() from src/video/fonttex.c: 2 256 32 / 32 126 / name / page0 / page1. */
export async function loadFtx(path: string): Promise<FtxFont> {
  const text = await textAsset(path);
  const lines = text.split(/\r?\n/).filter((l) => l.trim() && !l.startsWith('#'));
  const [nTextures, , width] = lines[0].split(/\s+/).map(Number);
  const [lower, upper] = lines[1].split(/\s+/).map(Number);
  const pages: HTMLImageElement[] = [];
  for (let i = 0; i < nTextures; i++) pages.push(await loadImage(assetUrl(`art/${lines[3 + i].trim()}`)));
  return { lower, upper, width, pages, tinted: new Map() };
}

function tintedPages(font: FtxFont, color: string): HTMLCanvasElement[] {
  const key = color;
  const hit = font.tinted.get(key);
  if (hit) return hit;
  const out = font.pages.map((img) => {
    const c = document.createElement('canvas');
    c.width = img.width;
    c.height = img.height;
    const g = c.getContext('2d')!;
    g.drawImage(img, 0, 0);
    g.globalCompositeOperation = 'source-in';
    g.fillStyle = color;
    g.fillRect(0, 0, c.width, c.height);
    return c;
  });
  font.tinted.set(key, out);
  return out;
}

/** ftxRenderString(): each glyph is one square, texwidth/width columns per page. */
export function drawFtx(g: CanvasRenderingContext2D, font: FtxFont, text: string,
  x: number, y: number, size: number, color = '#fff'): void {
  const cw = font.width;
  const cols = font.pages[0].width / cw;
  const perPage = cols * cols;
  const pages = tintedPages(font, color);
  let cx = x;
  for (const ch of text) {
    const code = ch.charCodeAt(0);
    if (code === 3) continue;
    let index = code - font.lower + 1;
    if (index < 0 || index >= font.upper) index = 1;
    const page = Math.floor(index / perPage);
    const cell = index % perPage;
    const sx = (cell % cols) * cw;
    const sy = Math.floor(cell / cols) * cw;
    if (pages[page]) g.drawImage(pages[page], sx, sy, cw, cw, cx, y, size, size);
    cx += size;
  }
}

export interface AudioSet {
  music: AudioBuffer;
  engine: AudioBuffer;
  crash: AudioBuffer;
  recognizer: AudioBuffer;
}

export async function loadAudio(ctx: AudioContext): Promise<AudioSet> {
  const get = async (path: string): Promise<AudioBuffer> => {
    const r = await fetch(assetUrl(path));
    return ctx.decodeAudioData(await r.arrayBuffer());
  };
  const [music, engine, crash, recognizer] = await Promise.all([
    get('music/revenge-of-cats.ogg'),
    get('data/game_engine.ogg'),
    get('data/game_crash.ogg'),
    get('data/game_recognizer.ogg'),
  ]);
  return { music, engine, crash, recognizer };
}
