// The converted Tux, of Math Command 2.0.3 data: the original PNG/JPEG images, WAV/OGG sounds,
// the Andika font and the lesson files, copied unchanged by re/tuxmath/fetch.sh.
const urls = import.meta.glob('../assets/**/*.{png,jpg,jpeg,ogg,wav,ttf}', {
  query: '?url', import: 'default', eager: true,
}) as Record<string, string>;

export function assetUrl(path: string): string {
  const u = urls[`../assets/${path}`];
  if (!u) throw new Error(`no asset ${path}`);
  return u;
}

const images = new Map<string, HTMLImageElement>();
const sounds = new Map<string, AudioBuffer>();

export async function loadImage(path: string): Promise<HTMLImageElement> {
  const cached = images.get(path);
  if (cached) return cached;
  const img = new Image();
  img.src = assetUrl(path);
  await img.decode();
  images.set(path, img);
  return img;
}

export async function loadImages(paths: string[]): Promise<void> {
  await Promise.all(paths.map((p) => loadImage(p)));
}

export async function loadSound(ctx: AudioContext, path: string): Promise<AudioBuffer | null> {
  const cached = sounds.get(path);
  if (cached) return cached;
  try {
    const r = await fetch(assetUrl(path));
    const b = await ctx.decodeAudioData(await r.arrayBuffer());
    sounds.set(path, b);
    return b;
  } catch {
    return null;
  }
}

let fontPromise: Promise<boolean> | null = null;

/** The original's TTF font, as a CSS font for canvas text. */
export function loadFont(): Promise<boolean> {
  fontPromise ??= (async () => {
    try {
      const face = new FontFace('TuxMath', `url(${assetUrl('fonts/AndikaDesRevG.ttf')})`);
      await face.load();
      document.fonts.add(face);
      return true;
    } catch {
      return false;
    }
  })();
  return fontPromise;
}

export const FONT = '"TuxMath", "Trebuchet MS", sans-serif';

export interface Sound {
  name: string;
  path: string;
}
