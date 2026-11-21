// Loading of the original data: JSON maps/campaign/heightmap, binary models/skeletons/
// animations, PNG/JPG textures and OGG sound effects. Music is deliberately absent.
import * as THREE from 'three';
import { assetUrl } from './assets.ts';

const jsonCache = new Map<string, Promise<unknown>>();
const binaryCache = new Map<string, Promise<ArrayBuffer>>();
const textCache = new Map<string, Promise<string>>();
const textureCache = new Map<string, Promise<THREE.Texture>>();
const imageCache = new Map<string, Promise<HTMLImageElement>>();

export function loadJson<T>(path: string): Promise<T> {
  let p = jsonCache.get(path);
  if (!p) {
    p = fetch(assetUrl(path)).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.json();
    });
    jsonCache.set(path, p);
  }
  return p as Promise<T>;
}

export function loadBinary(path: string): Promise<ArrayBuffer> {
  let p = binaryCache.get(path);
  if (!p) {
    p = fetch(assetUrl(path)).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.arrayBuffer();
    });
    binaryCache.set(path, p);
  }
  return p;
}

export function loadText(path: string): Promise<string> {
  let p = textCache.get(path);
  if (!p) {
    p = fetch(assetUrl(path)).then((r) => {
      if (!r.ok) throw new Error(`${path}: ${r.status}`);
      return r.text();
    });
    textCache.set(path, p);
  }
  return p;
}

export function loadImage(path: string): Promise<HTMLImageElement> {
  let p = imageCache.get(path);
  if (!p) {
    p = new Promise((resolve, reject) => {
      const img = new Image();
      img.onload = () => resolve(img);
      img.onerror = () => reject(new Error(`image ${path}`));
      img.src = assetUrl(path);
    });
    imageCache.set(path, p);
  }
  return p;
}

export function loadTexture(path: string, opts: { repeat?: boolean; nearest?: boolean } = {}): Promise<THREE.Texture> {
  const key = `${path}|${opts.repeat ? 1 : 0}|${opts.nearest ? 1 : 0}`;
  let p = textureCache.get(key);
  if (!p) {
    p = new Promise((resolve, reject) => {
      new THREE.TextureLoader().load(
        assetUrl(path),
        (t) => {
          t.colorSpace = THREE.SRGBColorSpace;
          if (opts.repeat) {
            t.wrapS = THREE.RepeatWrapping;
            t.wrapT = THREE.RepeatWrapping;
          }
          if (opts.nearest) {
            t.magFilter = THREE.NearestFilter;
            t.minFilter = THREE.LinearMipmapLinearFilter;
          }
          t.anisotropy = 4;
          resolve(t);
        },
        undefined,
        () => reject(new Error(`texture ${path}`)),
      );
    });
    textureCache.set(key, p);
  }
  return p;
}

/** Fur + clothes, blended the way Person::addClothes does it (alpha blend with a tint). */
export async function compositeSkin(furPath: string, clothes: { path: string; tintr: number; tintg: number; tintb: number }[]): Promise<HTMLCanvasElement> {
  const fur = await loadImage(furPath);
  const size = fur.naturalWidth || 512;
  const canvas = document.createElement('canvas');
  canvas.width = size;
  canvas.height = size;
  const ctx = canvas.getContext('2d')!;
  ctx.drawImage(fur, 0, 0, size, size);
  for (const layer of clothes) {
    if (!layer.path) continue;
    const img = await loadImage(layer.path);
    const tint = document.createElement('canvas');
    tint.width = size;
    tint.height = size;
    const tctx = tint.getContext('2d')!;
    tctx.drawImage(img, 0, 0, size, size);
    tctx.globalCompositeOperation = 'multiply';
    tctx.fillStyle = `rgb(${Math.round(Math.max(0, Math.min(1, layer.tintr)) * 255)},${Math.round(Math.max(0, Math.min(1, layer.tintg)) * 255)},${Math.round(Math.max(0, Math.min(1, layer.tintb)) * 255)})`;
    tctx.fillRect(0, 0, size, size);
    // restore the clothes' own alpha channel after the multiply fill
    tctx.globalCompositeOperation = 'destination-in';
    tctx.drawImage(img, 0, 0, size, size);
    ctx.drawImage(tint, 0, 0, size, size);
  }
  return canvas;
}

export class AudioBank {
  private readonly ctx: AudioContext;
  private readonly buffers = new Map<string, Promise<AudioBuffer>>();
  private readonly master: GainNode;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.master = ctx.createGain();
    this.master.gain.value = 0.8;
    this.master.connect(ctx.destination);
  }

  private load(name: string): Promise<AudioBuffer> {
    let p = this.buffers.get(name);
    if (!p) {
      p = fetch(assetUrl(`Sounds/${name}.ogg`))
        .then((r) => {
          if (!r.ok) throw new Error(`sound ${name}: ${r.status}`);
          return r.arrayBuffer();
        })
        .then((b) => this.ctx.decodeAudioData(b));
      this.buffers.set(name, p);
    }
    return p;
  }

  /** Play a sound; `pan` -1..1, `gain` 0..1. */
  async play(name: string, gain = 1, pan = 0): Promise<void> {
    if (gain <= 0.01) return;
    let buffer: AudioBuffer;
    try {
      buffer = await this.load(name);
    } catch {
      return; // a missing sound must never stop the game
    }
    const src = this.ctx.createBufferSource();
    src.buffer = buffer;
    const g = this.ctx.createGain();
    g.gain.value = Math.min(1, gain);
    if (this.ctx.createStereoPanner) {
      const p = this.ctx.createStereoPanner();
      p.pan.value = Math.max(-1, Math.min(1, pan));
      src.connect(g).connect(p).connect(this.master);
    } else {
      src.connect(g).connect(this.master);
    }
    src.start();
  }
}

/** Wait for the next animation frame; used by loading screens and dialogue pacing. */
export const nextFrame = (): Promise<void> => new Promise((resolve) => requestAnimationFrame(() => resolve()));
