// @ts-nocheck
// The browser backend of libGDX for the port: what gdx-backend-lwjgl3's Lwjgl3Application does for one window,
// on a canvas in the page (re/shatteredpixeldungeon/NOTES.md, "The browser backend"):
//
//   const b = new BrowserBackend({ host, canvas, gl, assets, files, audio, signal, exit });
//   b.install();                       // sets Gdx.app, graphics, input, audio, files, net, gl, gl20
//   b.start(listener);                 // listener.create(), resize(w, h)
//   b.frame(time);                     // once per animation frame: resize, runnables, input, render
//   b.pause(); b.resume(); b.dispose();
//
// The frame is Lwjgl3Window.update's order: a changed window size first (glViewport, resize), then the
// runnables posted since the last frame, then the queued input events, then render().
import { Gdx } from '../core.ts';
import { StoreFiles } from '../files.ts';
import { webGL20 } from './gl.ts';
import { BrowserGraphics } from './graphics.ts';
import { BrowserInput } from './input.ts';
import { BrowserAudio } from './audio.ts';
import { BrowserApplication, BrowserNet } from './app.ts';
import { textFieldHost } from './scene2d.ts';
import { setGlyphRasterizer } from '../freetype/ft.ts';
import { canvasRasterizer } from './glyphs.ts';
import type { AssetStore, PersistentStore } from './files.ts';

export * from './gl.ts';
export * from './graphics.ts';
export * from './input.ts';
export * from './audio.ts';
export * from './app.ts';
export * from './files.ts';
export * from './glyphs.ts';

export type BackendOptions = {
  host: HTMLElement;
  canvas: HTMLCanvasElement;
  gl: WebGLRenderingContext;
  assets: AssetStore;
  files: PersistentStore;
  audio: AudioContext;
  signal: AbortSignal;
  /** Application.exit(): leave the game */
  exit: () => void;
  /** the CSS font family of the game's pixel font (text fields) */
  fontFamily?: string;
};

export class BrowserBackend {
  o: BackendOptions;
  gl: any;
  app: BrowserApplication;
  graphics: BrowserGraphics;
  input: BrowserInput;
  audio: BrowserAudio;
  listener: any = null;
  paused = false;
  constructor(o: BackendOptions) {
    this.o = o;
    this.gl = webGL20(o.gl);
    this.graphics = new BrowserGraphics(o.host, o.canvas, o.gl);
    this.app = new BrowserApplication(o.files, o.signal, o.exit);
    this.input = new BrowserInput(o.canvas, this.graphics, o.signal);
    this.audio = new BrowserAudio(o.audio, (p) => o.assets.url(p), (f) => this.app.postRunnable(f));
    this.input.textFocus = () => {
      const a = document.activeElement;
      for (const t of textFieldHost.active) if (t.el === a) return true;
      return false;
    };
    textFieldHost.host = o.host;
    textFieldHost.canvas = o.canvas;
    textFieldHost.scale = () => (this.graphics.width > 0 ? this.graphics.cssWidth / this.graphics.width : 1);
    textFieldHost.family = o.fontFamily ?? 'sans-serif';
  }
  install() {
    Gdx.app = this.app;
    Gdx.graphics = this.graphics;
    Gdx.input = this.input;
    Gdx.audio = this.audio;
    Gdx.files = new StoreFiles(this.o.assets, this.o.files);
    Gdx.net = new BrowserNet();
    Gdx.gl = Gdx.gl20 = this.gl;
    Gdx.gl30 = Gdx.gl31 = Gdx.gl32 = null;
    setGlyphRasterizer(canvasRasterizer);
  }
  /** listener.create() and the first resize, as Lwjgl3Window.initializeListener. */
  start(listener: any) {
    this.listener = listener;
    this.app.listener = listener;
    this.graphics.measure();
    this.gl.glViewport(0, 0, this.graphics.width, this.graphics.height);
    listener.create();
    listener.resize(this.graphics.width, this.graphics.height);
    // the runnables create() posted (updateSystemUI's full screen at the start) run before full screen is allowed
    this.app.runPosted();
    this.graphics.fullscreenAllowed = true;
  }
  frame(time: number) {
    if (!this.listener || this.paused) return;
    if (this.graphics.measure()) {
      this.gl.glViewport(0, 0, this.graphics.width, this.graphics.height);
      this.listener.resize(this.graphics.width, this.graphics.height);
    }
    this.graphics.frame(time);
    this.app.runPosted();
    this.input.update();
    this.listener.render();
    this.input.prepareNext();
  }
  /** The window is hidden (Lwjgl3Window: iconified): the game pauses (and saves), the music halts. */
  pause() {
    if (!this.listener || this.paused) return;
    this.paused = true;
    this.audio.pauseAll();
    this.listener.pause();
  }
  resume() {
    if (!this.listener || !this.paused) return;
    this.paused = false;
    this.graphics.lastTime = -1;
    this.audio.resumeAll();
    this.listener.resume();
  }
  /** Application exit: pause() then dispose(), as Lwjgl3Application's cleanup does. */
  dispose() {
    if (!this.listener) return;
    if (!this.paused) this.listener.pause();
    this.paused = true;
    this.listener.dispose();
    this.listener = null;
    this.audio.stopAll();
    for (const t of [...textFieldHost.active]) t.remove();
  }
}
