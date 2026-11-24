import { SRGBColorSpace, TextureLoader, type Texture } from 'three';
import { assetUrl } from '../assets.ts';

const cache = new Map<string, Promise<Texture>>();

export function loadTexture(path: string): Promise<Texture> {
  let p = cache.get(path);
  if (!p) {
    p = new Promise((resolve, reject) => {
      new TextureLoader().load(
        assetUrl(path),
        (t) => {
          t.colorSpace = SRGBColorSpace;
          t.anisotropy = 4;
          resolve(t);
        },
        undefined,
        () => reject(new Error(`texture ${path}`)),
      );
    });
    cache.set(path, p);
  }
  return p;
}

export function loadActorTexture(path: string): Promise<Texture> {
  return loadTexture(`textures/${path}`);
}

export interface ImageData32 {
  width: number;
  height: number;
  data: Uint8Array;
}

/** Decode an image to RGBA bytes for a DataArrayTexture / minimap. */
export async function loadImageData(path: string, size?: number): Promise<ImageData32> {
  const img = new Image();
  img.crossOrigin = 'anonymous';
  img.decoding = 'async';
  img.src = assetUrl(path);
  await img.decode();
  const w = size ?? img.naturalWidth;
  const h = size ?? img.naturalHeight;
  const canvas = document.createElement('canvas');
  canvas.width = w;
  canvas.height = h;
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('2d canvas unavailable');
  ctx.imageSmoothingEnabled = true;
  ctx.drawImage(img, 0, 0, w, h);
  const data = ctx.getImageData(0, 0, w, h).data;
  return { width: w, height: h, data: new Uint8Array(data) };
}
