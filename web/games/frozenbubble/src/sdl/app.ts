// What SDL_perl gives the game: the window (SDL::App), surfaces (SDL::Surface), events (SDL::Event),
// the mixer (SDL::Mixer/Sound/Music). One App runs in the page (real clock, the canvas, Web Audio) or
// in a test (virtual clock, a script's input, a trace): the platform decides, the game code is the same.
import { Events, type EventPlatform } from './events.ts';
import { Mixer, type MixerSink } from './mixer.ts';
import { createRGBSurface, Rect, type Surface, SWSURFACE } from './video.ts';

export interface AppPlatform extends EventPlatform {
  /** a frame on the screen: SDL_Flip (rects null) or SDL_UpdateRects */
  present(screen: Surface, rects: Rect[] | null): void;
  /** Perl's sleep(n) */
  sleep(seconds: number): Promise<void>;
  /** time(): seconds since the epoch */
  time(): number;
  /** the window's fullscreen toggle (SDL_WM_ToggleFullScreen) */
  toggleFullscreen(): void;
  /** SDL_ShowCursor */
  showCursor(on: boolean): void;
  sink: MixerSink;
  /** the trace lines of the mixer (tests) */
  log?: (line: string) => void;
}

export class App {
  readonly screen: Surface;
  readonly events: Events;
  readonly mixer: Mixer;
  readonly platform: AppPlatform;

  constructor(platform: AppPlatform) {
    this.platform = platform;
    // the screen: 640x480, 32 bpp XRGB8888 (what SDL_ANYFORMAT gives on a 24/32-bit desktop)
    this.screen = createRGBSurface(SWSURFACE, 640, 480, 32, 0xff0000, 0x00ff00, 0x0000ff, 0);
    this.screen.name = 'app';
    this.events = new Events(platform);
    this.mixer = new Mixer(() => platform.ticks(), platform.sink, platform.log);
  }

  get width(): number { return 640; }
  get height(): number { return 480; }
  ticks(): number { return this.platform.ticks(); }
  delay(ms: number): Promise<void> { return this.platform.delay(ms); }
  sleep(s: number): Promise<void> { return this.platform.sleep(s); }
  time(): number { return this.platform.time(); }

  /** $app->update(@rects) */
  update(rects: Rect[]): void { this.platform.present(this.screen, rects); }
  /** $app->flip */
  flip(): void { this.platform.present(this.screen, null); }
  /** $app->fullscreen */
  fullscreen(): void { this.platform.toggleFullscreen(); }
}

/** SDL::Surface->new(-width, -height, -depth, [-Amask]): SDL_perl's default masks are those of RGBA
 *  in memory order (R 0xff, G 0xff00, B 0xff0000) and A 0xff000000 unless -Amask is given ("0 but
 *  true" means none) */
export function newSurface(w: number, h: number, depth: number, noAlpha = false): Surface {
  return createRGBSurface(SWSURFACE, Math.trunc(w), Math.trunc(h), depth, 0xff, 0xff00, 0xff0000, noAlpha ? 0 : 0xff000000);
}

export { Rect };
