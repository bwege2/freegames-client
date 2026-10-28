// The original's data files (assets/fb-data.bin, made by re/frozenbubble/tools/pack.py): every
// graphics file unchanged, decoded here as SDL_image decodes it, once; each load
// (SDL::Surface->new(-name => ...)) gets its own copy, as each IMG_Load gets a new surface.
import { loadImage } from '../sdl/image.ts';
import { cloneSurface, type Surface } from '../sdl/video.ts';
import type { FbData } from './game.ts';

export class PackData implements FbData {
  private readonly index: Record<string, [number, number]>;
  private readonly bytes: Uint8Array;
  private readonly base: number;
  private readonly decoded = new Map<string, Surface>();

  constructor(bytes: Uint8Array) {
    const magic = new TextDecoder().decode(bytes.subarray(0, 6));
    if (magic !== 'FBPK1\n') throw new Error('not a Frozen Bubble data pack');
    const len = bytes[6] | (bytes[7] << 8) | (bytes[8] << 16) | (bytes[9] << 24);
    this.index = JSON.parse(new TextDecoder().decode(bytes.subarray(10, 10 + len)));
    this.base = 10 + len;
    this.bytes = bytes;
  }

  has(path: string): boolean { return path in this.index; }

  file(path: string): Uint8Array {
    const e = this.index[path];
    if (!e) throw new Error(`missing data file ${path}`);
    return this.bytes.subarray(this.base + e[0], this.base + e[0] + e[1]);
  }

  image(path: string): Surface {
    let s = this.decoded.get(path);
    if (!s) {
      s = loadImage(this.file(path), path);
      this.decoded.set(path, s);
    }
    return cloneSurface(s);
  }

  /** glob("<prefix>*"), sorted */
  glob(prefix: string): string[] { return Object.keys(this.index).filter((k) => k.startsWith(prefix)).sort(); }
}
