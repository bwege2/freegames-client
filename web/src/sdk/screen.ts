// A pixel screen for ports that draw at the original's resolution: a canvas of exactly that size,
// scaled to the host by whole numbers when it fits (crisp pixels, no blur), letterboxed, with the
// original display's pixel aspect ratio (Apple II and C64 pixels were not square). Phaser can draw
// into it too (`new Phaser.Game({ canvas: screen.canvas, type: Phaser.CANVAS, ... })`).

export interface PixelScreenOptions {
  /** the original's resolution */
  width: number;
  height: number;
  /** width / height of one pixel on the original display (1 = square) */
  pixelAspect?: number;
  /** letterbox colour */
  background?: string;
}

/**
 * How big to draw a width×height screen with pixels pixelAspect wide (relative to their height) in a
 * box: the largest whole-number scale that fits, else the largest fractional one. Returns CSS pixels.
 */
export function fitScale(boxW: number, boxH: number, width: number, height: number, pixelAspect = 1): { scale: number; cssWidth: number; cssHeight: number } {
  // the scale applies to the pixel's height; its width is scale * pixelAspect
  const fit = Math.min(boxW / (width * pixelAspect), boxH / height);
  const scale = fit >= 1 ? Math.floor(fit) : fit;
  return { scale, cssWidth: Math.round(width * pixelAspect * scale), cssHeight: Math.round(height * scale) };
}

export class PixelScreen {
  readonly canvas: HTMLCanvasElement;
  readonly ctx: CanvasRenderingContext2D;
  readonly width: number;
  readonly height: number;
  private readonly box: HTMLElement;
  private readonly host: HTMLElement;
  private readonly aspect: number;
  private fixedScale: number | null = null;

  constructor(host: HTMLElement, o: PixelScreenOptions, signal: AbortSignal) {
    this.width = o.width;
    this.height = o.height;
    this.box = document.createElement('div');
    Object.assign(this.box.style, { position: 'absolute', inset: '0', display: 'grid', placeItems: 'center', background: o.background ?? '#000', overflow: 'hidden' });
    this.canvas = Object.assign(document.createElement('canvas'), { width: o.width, height: o.height });
    this.canvas.style.imageRendering = 'pixelated';
    this.box.append(this.canvas);
    host.append(this.box);
    this.ctx = this.canvas.getContext('2d')!;
    this.ctx.imageSmoothingEnabled = false;
    this.host = host;
    this.aspect = o.pixelAspect ?? 1;
    const ro = new ResizeObserver(() => this.fit());
    const end = () => {
      ro.disconnect();
      this.box.remove();
    };
    if (signal.aborted) {
      end();
      return;
    }
    ro.observe(host);
    this.fit();
    signal.addEventListener('abort', end, { once: true });
  }

  /** The fit in device pixels: whole device pixels per original pixel keep them even at any zoom. */
  private deviceFit() {
    const dpr = window.devicePixelRatio || 1;
    return { dpr, f: fitScale(this.host.clientWidth * dpr, this.host.clientHeight * dpr, this.width, this.height, this.aspect) };
  }

  private fit(): void {
    const { dpr, f } = this.deviceFit();
    const scale = this.fixedScale !== null ? Math.min(this.fixedScale, Math.max(1, f.scale)) : f.scale;
    this.canvas.style.width = `${Math.round(this.width * this.aspect * scale) / dpr}px`;
    this.canvas.style.height = `${Math.round(this.height * scale) / dpr}px`;
  }

  /** The largest whole-number scale (in device pixels) that fits the host (at least 1). */
  maxScale(): number {
    return Math.max(1, Math.floor(this.deviceFit().f.scale));
  }

  /** A fixed whole-number scale in device pixels (an original's zoom key), or null to fit the host again. */
  setScale(scale: number | null): void {
    this.fixedScale = scale;
    this.fit();
  }

  /** A pointer position (clientX/Y) in the original's pixels, or null outside the screen. */
  toPixel(clientX: number, clientY: number): { x: number; y: number } | null {
    const r = this.canvas.getBoundingClientRect();
    const x = Math.floor((clientX - r.left) / r.width * this.width);
    const y = Math.floor((clientY - r.top) / r.height * this.height);
    return x >= 0 && y >= 0 && x < this.width && y < this.height ? { x, y } : null;
  }
}
