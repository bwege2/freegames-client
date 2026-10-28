// The SDL screen in the browser: a 640x480 framebuffer, blits and fills clipped as SDL clips them.
import { SCREEN_X, SCREEN_Y, type ImageName, type Surface } from './gfx.ts';
import type { Image } from './assets.ts';

export class FrameBuffer implements Omit<Surface, 'play' | 'flip'> {
  readonly pixels = new Uint8ClampedArray(SCREEN_X * SCREEN_Y * 4);
  private readonly images: Record<ImageName, Image>;

  constructor(images: Record<ImageName, Image>) {
    this.images = images;
    for (let i = 3; i < this.pixels.length; i += 4) this.pixels[i] = 255;
  }

  size(img: ImageName): { w: number; h: number } {
    return { w: this.images[img].w, h: this.images[img].h };
  }

  blit(img: ImageName, src: { x: number; y: number; w: number; h: number } | null, x: number, y: number): void {
    const im = this.images[img];
    let sx = src?.x ?? 0, sy = src?.y ?? 0, w = src?.w ?? im.w, h = src?.h ?? im.h;
    // clip to the image, then to the screen (SDL_BlitSurface / SDL_LowerBlit)
    if (sx + w > im.w) w = im.w - sx;
    if (sy + h > im.h) h = im.h - sy;
    if (x < 0) { sx -= x; w += x; x = 0; }
    if (y < 0) { sy -= y; h += y; y = 0; }
    if (x + w > SCREEN_X) w = SCREEN_X - x;
    if (y + h > SCREEN_Y) h = SCREEN_Y - y;
    const p = this.pixels, rgb = im.rgb;
    for (let r = 0; r < h; r++) {
      let si = ((sy + r) * im.w + sx) * 3, di = ((y + r) * SCREEN_X + x) * 4;
      for (let c = 0; c < w; c++, si += 3, di += 4) {
        p[di] = rgb[si];
        p[di + 1] = rgb[si + 1];
        p[di + 2] = rgb[si + 2];
      }
    }
  }

  fill(x: number, y: number, w: number, h: number): void {
    if (x < 0) { w += x; x = 0; }
    if (y < 0) { h += y; y = 0; }
    if (x + w > SCREEN_X) w = SCREEN_X - x;
    if (y + h > SCREEN_Y) h = SCREEN_Y - y;
    for (let r = 0; r < h; r++) {
      let di = ((y + r) * SCREEN_X + x) * 4;
      for (let c = 0; c < w; c++, di += 4) this.pixels[di] = this.pixels[di + 1] = this.pixels[di + 2] = 0;
    }
  }
}

/** SDL_mixer as snd.c used it: two channels; a sound started on a channel stops what played there. */
export class Mixer {
  private readonly audio: AudioContext;
  private readonly sounds: (AudioBuffer | null)[];
  private readonly channels: (AudioBufferSourceNode | null)[] = [null, null];

  constructor(audio: AudioContext, sounds: (AudioBuffer | null)[]) {
    this.audio = audio;
    this.sounds = sounds;
  }

  play(channel: number, sound: number): void {
    const buf = this.sounds[sound];
    if (!buf || this.audio.state === 'closed') return;
    this.channels[channel]?.stop();
    const node = this.audio.createBufferSource();
    node.buffer = buf;
    node.connect(this.audio.destination);
    node.onended = () => { if (this.channels[channel] === node) this.channels[channel] = null; };
    node.start();
    this.channels[channel] = node;
  }
}
