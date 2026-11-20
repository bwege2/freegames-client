import { setResourceLoader } from './resources.ts';

// Loading the port's copy of the original's data. Everything under assets/ is the original
// file, copied by re/supertux/tools/build-assets.py; Vite hashes the URLs.
type UrlMap = Record<string, string>;

const globbed = import.meta.glob([
  '../assets/**/*.png', '../assets/**/*.jpg', '../assets/**/*.ogg', '../assets/**/*.wav',
  '../assets/**/*.sprite', '../assets/**/*.strf', '../assets/**/*.stf', '../assets/**/*.stl',
  '../assets/**/*.stwm', '../assets/**/*.music', '../assets/**/*.txt',
], { query: '?url', import: 'default', eager: true }) as UrlMap;

const urls = new Map<string, string>();
for (const [key, url] of Object.entries(globbed)) urls.set(key.replace(/^\.\.\/assets\//, ''), url);

export function assetUrl(path: string): string {
  const clean = path.replace(/^\/+/, '');
  const url = urls.get(clean);
  if (!url) throw new Error(`no asset: ${path}`);
  return url;
}

const textCache = new Map<string, Promise<string>>();
export function loadText(path: string): Promise<string> {
  let p = textCache.get(path);
  if (!p) {
    p = fetch(assetUrl(path)).then((r) => {
      if (!r.ok) throw new Error(`${path}: HTTP ${r.status}`);
      return r.text();
    });
    textCache.set(path, p);
  }
  return p;
}

export type Img = HTMLImageElement;

const imageCache = new Map<string, Promise<Img>>();
const imageElements = new Map<string, Img>();
const blank = (() => {
  const c = document.createElement('canvas');
  c.width = c.height = 1;
  return c as unknown as Img;
})();

/** The image if it is already decoded, else null and its load is started. */
export function imageReady(path: string): Img | null {
  const img = imageElements.get(path);
  if (img) return img.complete && img.naturalWidth > 0 ? img : null;
  void loadImage(path);
  return null;
}

export function loadImage(path: string): Promise<Img> {
  let p = imageCache.get(path);
  if (!p) {
    p = new Promise<Img>((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`image failed: ${path}`));
      img.src = assetUrl(path);
      imageElements.set(path, img);
    }).catch(() => {
      imageElements.set(path, blank);
      return blank;
    });
    imageCache.set(path, p);
  }
  return p;
}

export class SoundBank {
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private musicSource: AudioBufferSourceNode | null = null;
  private musicGain: GainNode;
  private soundGain: GainNode;
  readonly ctx: AudioContext;
  soundEnabled = true;
  musicEnabled = true;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.musicGain = ctx.createGain();
    this.musicGain.gain.value = 0.55;
    this.musicGain.connect(ctx.destination);
    this.soundGain = ctx.createGain();
    this.soundGain.gain.value = 0.8;
    this.soundGain.connect(ctx.destination);
  }

  buffer(path: string): Promise<AudioBuffer | null> {
    let p = this.buffers.get(path);
    if (!p) {
      p = fetch(assetUrl(path))
        .then((r) => r.arrayBuffer())
        .then((b) => this.ctx.decodeAudioData(b))
        .catch(() => null);
      this.buffers.set(path, p);
    }
    return p;
  }

  play(path: string, volume = 1): void {
    if (!this.soundEnabled) return;
    void this.buffer(path).then((b) => {
      if (!b) return;
      const src = this.ctx.createBufferSource();
      src.buffer = b;
      const g = this.ctx.createGain();
      g.gain.value = volume;
      src.connect(g).connect(this.soundGain);
      src.start();
    });
  }

  playMusic(path: string, loop = true): void {
    if (!this.musicEnabled) return;
    this.stopMusic();
    void this.buffer(path).then((b) => {
      if (!b) return;
      const src = this.ctx.createBufferSource();
      src.buffer = b;
      src.loop = loop;
      src.connect(this.musicGain);
      src.start();
      this.musicSource = src;
    });
  }

  stopMusic(): void {
    if (this.musicSource) {
      try { this.musicSource.stop(); } catch { /* already stopped */ }
      this.musicSource.disconnect();
      this.musicSource = null;
    }
  }
}

// install the browser loader for the simulation modules
setResourceLoader({
  text: loadText,
  imageReady,
  image: loadImage,
});

