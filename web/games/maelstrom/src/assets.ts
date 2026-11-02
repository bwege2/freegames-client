// Original Maelstrom 4.0.2 assets: individual sprite frames, sounds and the
// title/status images. The files are copied unchanged from Data/ by
// re/maelstrom/tools/build-assets.py.
const SPRITE_URLS = import.meta.glob('../assets/sprites/*.png', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;
const SOUND_URLS = import.meta.glob('../assets/sounds/*.wav', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;
const IMAGE_URLS = import.meta.glob('../assets/images/*.png', {
  eager: true, query: '?url', import: 'default',
}) as Record<string, string>;

function baseName(path: string): string { return path.split('/').pop() ?? path; }
const SPRITES: Record<string, string> = Object.fromEntries(Object.entries(SPRITE_URLS).map(([p, u]) => [baseName(p), u]));
const SOUNDS: Record<string, string> = Object.fromEntries(Object.entries(SOUND_URLS).map(([p, u]) => [baseName(p), u]));
const IMAGES: Record<string, string> = Object.fromEntries(Object.entries(IMAGE_URLS).map(([p, u]) => [baseName(p), u]));

export interface BlitFrame {
  image: HTMLImageElement;
  mask: Uint8Array;
  w: number;
  h: number;
  bbox: { left: number; top: number; right: number; bottom: number };
}

export interface Blit {
  frames: BlitFrame[];
  w: number;
  h: number;
  /** relative hit rectangle, as in the original Blit.hitRect */
  hitRect: { left: number; top: number; right: number; bottom: number };
}

const imageCache = new Map<string, HTMLImageElement>();
const blitCache = new Map<string, Blit>();
let imageOverrides: Record<string, string> = {};
let soundOverrides: Record<string, string> = {};
let overrideUrls: string[] = [];

/** Replaces the original sprite/sound files with a mod's Sprites/ and Sounds/ entries. */
export function setModAssets(files: Map<string, Uint8Array>): void {
  clearModAssets();
  const images: Record<string, string> = {};
  const sounds: Record<string, string> = {};
  for (const [path, bytes] of files) {
    const name = baseName(path);
    if (name.endsWith('.png')) {
      const url = URL.createObjectURL(new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'image/png' }));
      images[name] = url; overrideUrls.push(url);
    } else if (name.endsWith('.wav')) {
      const url = URL.createObjectURL(new Blob([bytes.slice().buffer as ArrayBuffer], { type: 'audio/wav' }));
      sounds[name] = url; overrideUrls.push(url);
    }
  }
  imageOverrides = images; soundOverrides = sounds;
}

export function clearModAssets(): void {
  for (const url of overrideUrls) URL.revokeObjectURL(url);
  overrideUrls = []; imageOverrides = {}; soundOverrides = {};
  imageCache.clear(); blitCache.clear();
}

export function loadImage(name: string): Promise<HTMLImageElement> {
  const url = imageOverrides[name] ?? IMAGES[name] ?? SPRITES[name];
  if (!url) return Promise.reject(new Error(`missing image ${name}`));
  const hit = imageCache.get(url);
  if (hit) return Promise.resolve(hit);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => { imageCache.set(url, img); resolve(img); };
    img.onerror = () => reject(new Error(`could not load ${name}`));
    img.src = url;
  });
}

function frameFromImage(image: HTMLImageElement): BlitFrame {
  const w = image.naturalWidth, h = image.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w; canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  const mask = new Uint8Array(w * h);
  let left = w, top = h, right = -1, bottom = -1;
  if (ctx) {
    ctx.drawImage(image, 0, 0);
    const data = ctx.getImageData(0, 0, w, h).data;
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      if (data[(y * w + x) * 4 + 3] > 0) {
        mask[y * w + x] = 1;
        if (x < left) left = x;
        if (x > right) right = x;
        if (y < top) top = y;
        if (y > bottom) bottom = y;
      }
    }
  }
  if (right < left) { left = 0; top = 0; right = 0; bottom = 0; }
  return { image, mask, w, h, bbox: { left, top, right, bottom } };
}

/** icl8 (large) or ics8 (small) frame sequence, ids base..base+count-1. */
export async function loadBlit(large: boolean, base: number, count: number, backwards = false): Promise<Blit> {
  const key = `${large ? 'L' : 'S'}:${base}:${count}:${backwards ? 1 : 0}`;
  const hit = blitCache.get(key);
  if (hit) return hit;
  const ids: number[] = [];
  for (let i = 0; i < count; i++) ids.push(base + i);
  if (backwards) ids.reverse();
  const prefix = large ? 'icl8' : 'ics8';
  const frames: BlitFrame[] = [];
  for (const id of ids) {
    const name = `${prefix}_${id}.png`;
    const url = imageOverrides[name] ?? SPRITES[name];
    if (!url) throw new Error(`missing sprite ${name}`);
    const image = imageCache.get(url) ?? await loadImage(name);
    frames.push(frameFromImage(image));
  }
  const first = frames[0];
  let left = first.bbox.left, top = first.bbox.top, right = first.bbox.right, bottom = first.bbox.bottom;
  for (const f of frames) {
    left = Math.min(left, f.bbox.left); top = Math.min(top, f.bbox.top);
    right = Math.max(right, f.bbox.right); bottom = Math.max(bottom, f.bbox.bottom);
  }
  const blit: Blit = { frames, w: first.w, h: first.h, hitRect: { left, top, right, bottom } };
  blitCache.set(key, blit);
  return blit;
}

/** A single file in Data/Images (shot_player, Maelstrom_Titles#129, ...). */
export async function loadImageBlit(name: string): Promise<Blit> {
  const image = await loadImage(name);
  const f = frameFromImage(image);
  return { frames: [f], w: f.w, h: f.h, hitRect: { ...f.bbox } };
}

export async function loadSound(ctx: AudioContext, id: number): Promise<AudioBuffer | null> {
  const url = soundOverrides[`snd_${id}.wav`] ?? SOUNDS[`snd_${id}.wav`];
  if (!url) return null;
  try {
    const response = await fetch(url);
    const data = await response.arrayBuffer();
    return await ctx.decodeAudioData(data);
  } catch {
    return null;
  }
}

export function soundIds(): number[] {
  return Object.keys(SOUNDS).map((n) => Number(/_([0-9]+)\.wav/.exec(n)?.[1] ?? 0)).filter((n) => n > 0);
}

export function imageNames(): string[] { return [...new Set([...Object.keys(IMAGES), ...Object.keys(imageOverrides)])]; }
