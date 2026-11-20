// The port's assets: the original's data files, sprites (converted losslessly
// to WebP), bitmap fonts and sounds. Vite hashes each file and serves it from
// the game's folder; heavy folders are lazy (see game.json).
import type { DataNode } from './data/node.ts';
import { parseData } from './data/node.ts';
import { GameData } from './data/gamedata.ts';

const IMAGE_URLS = import.meta.glob<string>(['../assets/images/**/*.webp', '../assets/images/**/*.jpg'], {
  eager: true, query: '?url', import: 'default',
});
const DATA_URLS = import.meta.glob<string>('../assets/data/**/*.txt', {
  eager: true, query: '?url', import: 'default',
});
const SOUND_URLS = import.meta.glob<string>('../assets/sounds/**/*.wav', {
  eager: true, query: '?url', import: 'default',
});

export interface Frame {
  url: string;
  blend: string;
}

export interface SpriteData {
  name: string;
  frames: (Frame | undefined)[];
  image?: HTMLImageElement;
  width: number;
  height: number;
  loading?: Promise<void>;
}

const BLENDS = '-=^+~';

function parseSpritePath(path: string): { name: string; frame: number; blend: string } {
  let stem = path.replace(/^.*\/assets\/images\//, '').replace(/\.(webp|jpg)$/, '');
  // The image folders are named like the sprite ("ship/star barge"); the file
  // may end in a blending marker and a frame number (ImageFileData).
  let name = stem;
  let blend = '';
  let frame = 0;
  let index = stem.length;
  while (index > 0 && stem[index - 1] >= '0' && stem[index - 1] <= '9') --index;
  if (index < stem.length) {
    const marker = stem[index - 1];
    if (BLENDS.includes(marker)) {
      blend = marker;
      frame = Number(stem.slice(index)) || 0;
      name = stem.slice(0, index - 1);
    }
  }
  if (!blend && stem.length && BLENDS.includes(stem[stem.length - 1])) {
    blend = stem[stem.length - 1];
    name = stem.slice(0, -1);
  }
  return { name, frame, blend };
}

export class Assets {
  readonly sprites = new Map<string, SpriteData>();
  private readonly images = new Map<string, Promise<HTMLImageElement>>();
  readonly sounds = new Map<string, string>();
  data: GameData | null = null;
  readonly font14: string;
  readonly font18: string;

  constructor() {
    for (const [path, url] of Object.entries(IMAGE_URLS)) {
      const { name, frame, blend } = parseSpritePath(path);
      let sprite = this.sprites.get(name);
      if (!sprite) {
        sprite = { name, frames: [], width: 0, height: 0 };
        this.sprites.set(name, sprite);
      }
      while (sprite.frames.length <= frame) sprite.frames.push(undefined);
      if (!sprite.frames[frame]) sprite.frames[frame] = { url, blend };
    }
    for (const [path, url] of Object.entries(SOUND_URLS)) {
      const name = path.replace(/^.*\/assets\/sounds\//, '').replace(/\.wav$/, '').replace(/~$/, '').replace(/@3x$/, '');
      const existing = this.sounds.get(name);
      // Prefer the normal sample over the @3x variant.
      if (!existing || !path.includes('@3x')) this.sounds.set(name, url);
    }
    const fontUrl = (name: string): string => {
      const key = Object.keys(IMAGE_URLS).find((k) => k.endsWith(`/assets/images/font/${name}.webp`));
      if (!key) throw new Error(`missing font ${name}`);
      return IMAGE_URLS[key];
    };
    this.font14 = fontUrl('ubuntu14r');
    this.font18 = fontUrl('ubuntu18r');
  }

  async loadGameData(progress?: (done: number, total: number) => void): Promise<GameData> {
    if (this.data) return this.data;
    const entries = Object.entries(DATA_URLS);
    const files: { path: string; text: string }[] = [];
    let done = 0;
    await Promise.all(entries.map(async ([path, url]) => {
      const text = await (await fetch(url)).text();
      files.push({ path, text });
      progress?.(++done, entries.length);
    }));
    const data = new GameData();
    data.load(files, parseData);
    this.data = data;
    return data;
  }

  /** Load one frame of a sprite (default frame 0). */
  async loadSprite(name: string, frame = 0): Promise<HTMLImageElement | null> {
    const sprite = this.sprites.get(name);
    const entry = sprite?.frames[frame] ?? sprite?.frames[0];
    if (!sprite || !entry) return null;
    const cached = imageCache.get(entry.url);
    if (cached) {
      if (!sprite.image) {
        sprite.image = cached;
        sprite.width = cached.naturalWidth;
        sprite.height = cached.naturalHeight;
      }
      return cached;
    }
    let promise = this.images.get(entry.url);
    if (!promise) {
      promise = new Promise<HTMLImageElement>((resolve, reject) => {
        const image = new Image();
        image.onload = () => resolve(image);
        image.onerror = () => reject(new Error(`image failed: ${entry.url}`));
        image.src = entry.url;
      });
      this.images.set(entry.url, promise);
    }
    const image = await promise;
    imageCache.set(entry.url, image);
    if (!sprite.image) {
      sprite.image = image;
      sprite.width = image.naturalWidth;
      sprite.height = image.naturalHeight;
    }
    return image;
  }

  spriteSize(name: string): { width: number; height: number } | null {
    const sprite = this.sprites.get(name);
    if (sprite?.width) return { width: sprite.width, height: sprite.height };
    return null;
  }

  spriteName(name: string): string { return name; }

  /** Load frame 0 of each sprite, for the current system and the UI. */
  async preload(names: readonly string[]): Promise<void> {
    await Promise.all([...new Set(names)].map((name) => this.loadSprite(name).catch(() => null)));
  }

  /** The loaded image for a frame, or null if it is not loaded yet. */
  frameImage(name: string, frame = 0): HTMLImageElement | null {
    const sprite = this.sprites.get(name);
    const entry = sprite?.frames[frame] ?? sprite?.frames[0];
    if (!sprite || !entry) return null;
    const promise = this.images.get(entry.url);
    if (!promise) {
      void this.loadSprite(name, frame);
      return null;
    }
    // The promise has resolved if sprite.image is set and this is its frame;
    // frame images after the first are looked up by storing them in the cache.
    return imageCache.get(entry.url) ?? null;
  }

  blendOf(name: string, frame = 0): string {
    return this.sprites.get(name)?.frames[frame]?.blend ?? '';
  }

  frameCount(name: string): number {
    return this.sprites.get(name)?.frames.length ?? 0;
  }

  soundUrl(name: string): string | null {
    return this.sounds.get(name) ?? null;
  }
}

const imageCache = new Map<string, HTMLImageElement>();

/** A sound player over the site's AudioContext (ctx.audio). */
export class SoundBank {
  private readonly context: AudioContext;
  private readonly buffers = new Map<string, Promise<AudioBuffer | null>>();
  private readonly assets: Assets;
  enabled = true;

  constructor(context: AudioContext, assets: Assets) {
    this.context = context;
    this.assets = assets;
  }

  play(name: string, volume = 1): void {
    if (!this.enabled) return;
    const url = this.assets.soundUrl(name);
    if (!url) return;
    let promise = this.buffers.get(url);
    if (!promise) {
      promise = fetch(url).then((response) => response.arrayBuffer())
        .then((data) => this.context.decodeAudioData(data)).catch(() => null);
      this.buffers.set(url, promise);
    }
    void promise.then((buffer) => {
      if (!buffer) return;
      const source = this.context.createBufferSource();
      source.buffer = buffer;
      const gain = this.context.createGain();
      gain.gain.value = Math.max(0, Math.min(1, volume));
      source.connect(gain).connect(this.context.destination);
      source.start();
    });
  }
}

export type { DataNode };
