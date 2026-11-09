// @ts-nocheck
// libGDX's Graphics for the browser, as the LWJGL3 backend (Lwjgl3Graphics, gdx-backend-lwjgl3 1.14.0) reports a
// desktop window. The window is the player's area of the page. Its size is in device pixels: on Windows and
// Linux a GLFW window's size is in screen pixels, its back buffer the same size (only macOS reports "logical"
// sizes, HdpiMode.Logical), so getWidth() == getBackBufferWidth() == CSS size x devicePixelRatio, and the
// game picks its pixel zoom for the device's pixels (sharp pixel art and text at any ratio). The display
// is the screen (screen.width x devicePixelRatio), its density 96 dpi x devicePixelRatio (CSS's inch), so
// Game.create's density is ppi / 160 as on a desktop monitor. Full screen is the Fullscreen API on the host
// element. getDeltaTime is the time between two frames in seconds.
import { JObject, defineLib } from '../../jre/lang.ts';
import { Application_ApplicationType } from '../core.ts';

export class DisplayMode extends JObject {
  width: number;
  height: number;
  refreshRate: number;
  bitsPerPixel: number;
  constructor(w: number, h: number, hz = 60, bpp = 24) {
    super();
    this.width = w;
    this.height = h;
    this.refreshRate = hz;
    this.bitsPerPixel = bpp;
  }
  toString() { return this.width + 'x' + this.height + ', bpp: ' + this.bitsPerPixel + ', hz: ' + this.refreshRate; }
}
defineLib(DisplayMode, 'com.badlogic.gdx.Graphics$DisplayMode');

/** GLVersion: the game compares its identity to notice a new GL context (Game.resize). */
export class GLVersion extends JObject {
  major: number;
  minor: number;
  vendor: string;
  renderer: string;
  constructor(gl: WebGLRenderingContext) {
    super();
    const webgl2 = typeof WebGL2RenderingContext !== 'undefined' && gl instanceof WebGL2RenderingContext;
    this.major = webgl2 ? 3 : 2;
    this.minor = 0;
    this.vendor = String(gl.getParameter(gl.VENDOR));
    this.renderer = String(gl.getParameter(gl.RENDERER));
  }
  getType() { return Application_ApplicationType.WebGL; }
  getMajorVersion() { return this.major; }
  getMinorVersion() { return this.minor; }
  getReleaseVersion() { return 0; }
  getVendorString() { return this.vendor; }
  getRendererString() { return this.renderer; }
  isVersionEqualToOrHigher(a: number, b: number) { return this.major > a || (this.major === a && this.minor >= b); }
  getDebugVersionString() { return 'WebGL ' + this.major + '.' + this.minor + ' ' + this.vendor + ' ' + this.renderer; }
}

/** A mouse cursor made from a Pixmap (Graphics.newCursor): a PNG for CSS's cursor property. */
export class BrowserCursor extends JObject {
  css: string;
  constructor(pixmap: any, x: number, y: number, dpr: number) {
    super();
    const c = document.createElement('canvas');
    c.width = pixmap.getWidth();
    c.height = pixmap.getHeight();
    const g = c.getContext('2d');
    const img = g.createImageData(c.width, c.height);
    for (let y = 0, i = 0; y < c.height; y++) {
      for (let x = 0; x < c.width; x++, i++) {
        const v = pixmap.getPixel(x, y); // RGBA8888
        img.data[4 * i] = v >>> 24; img.data[4 * i + 1] = (v >>> 16) & 0xff; img.data[4 * i + 2] = (v >>> 8) & 0xff; img.data[4 * i + 3] = v & 0xff;
      }
    }
    g.putImageData(img, 0, 0);
    const url = c.toDataURL('image/png');
    // the image is in device pixels, as the original's (scaled to the game's zoom): shown at that size
    this.css = dpr === 1 ? `url(${url}) ${x} ${y}, auto`
      : `image-set(url(${url}) ${dpr}x) ${Math.round(x / dpr)} ${Math.round(y / dpr)}, url(${url}) ${x} ${y}, auto`;
  }
  dispose() {}
}

export class BrowserGraphics extends JObject {
  canvas: HTMLCanvasElement;
  host: HTMLElement;
  gl: WebGLRenderingContext;
  glVersion: GLVersion;
  width = 0;
  height = 0;
  cssWidth = 0;
  cssHeight = 0;
  dpr = 1;
  deltaTime = 0;
  lastTime = -1;
  frameId = 0n;
  fps = 0;
  fpsFrames = 0;
  fpsTime = 0;
  cursorCss = 'auto';
  cursorHidden = false;

  constructor(host: HTMLElement, canvas: HTMLCanvasElement, gl: WebGLRenderingContext) {
    super();
    this.host = host;
    this.canvas = canvas;
    this.gl = gl;
    this.glVersion = new GLVersion(gl);
  }

  /** Sizes the back buffer to the canvas's CSS size x devicePixelRatio; true when it changed. */
  measure(): boolean {
    const r = this.canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = Math.max(1, Math.round(r.width * dpr));
    const h = Math.max(1, Math.round(r.height * dpr));
    this.cssWidth = r.width;
    this.cssHeight = r.height;
    this.dpr = dpr;
    if (w === this.width && h === this.height) return false;
    this.width = w;
    this.height = h;
    this.canvas.width = w;
    this.canvas.height = h;
    return true;
  }
  /** The frame's time (ms, from requestAnimationFrame). */
  frame(time: number) {
    this.deltaTime = this.lastTime < 0 ? 0 : Math.fround(Math.max(0, time - this.lastTime) / 1000);
    this.lastTime = time;
    this.frameId++;
    this.fpsFrames++;
    if (time - this.fpsTime >= 1000) {
      this.fps = this.fpsFrames;
      this.fpsFrames = 0;
      this.fpsTime = time;
    }
  }

  getType() { return 'WebGL'; }
  getGLVersion() { return this.glVersion; }
  isGL30Available() { return false; }
  getGL20() { return (globalThis as any).$gdxGL; }
  getWidth() { return this.width; }
  getHeight() { return this.height; }
  getBackBufferWidth() { return this.width; }
  getBackBufferHeight() { return this.height; }
  getBackBufferScale() { return 1; }
  getSafeInsetLeft() { return 0; }
  getSafeInsetTop() { return 0; }
  getSafeInsetRight() { return 0; }
  getSafeInsetBottom() { return 0; }
  getFrameId() { return this.frameId; }
  getDeltaTime() { return this.deltaTime; }
  getRawDeltaTime() { return this.deltaTime; }
  getFramesPerSecond() { return this.fps; }
  getPpiX() { return Math.fround(96 * this.dpr); }
  getPpiY() { return Math.fround(96 * this.dpr); }
  getPpcX() { return Math.fround((96 * this.dpr) / 2.54); }
  getPpcY() { return Math.fround((96 * this.dpr) / 2.54); }
  getDensity() { return Math.fround(this.getPpiX() / 160); }
  getDisplayMode() {
    const dpr = window.devicePixelRatio || 1;
    return new DisplayMode(Math.round(screen.width * dpr), Math.round(screen.height * dpr), 60, screen.colorDepth || 24);
  }
  getDisplayModes() { return [this.getDisplayMode()]; }
  getMonitor() { return null; }
  getPrimaryMonitor() { return null; }
  getMonitors() { return []; }
  supportsDisplayModeChange() { return !!document.fullscreenEnabled; }
  isFullscreen() { return document.fullscreenElement === this.host; }
  /** false while the game starts: the desktop version goes full screen at its start (SPDSettings.fullscreen
   *  is true by default, ShatteredPixelDungeon.create calls updateSystemUI); in the page it starts in the
   *  player's area, and full screen is entered when the player turns it on in the settings. */
  fullscreenAllowed = false;
  setFullscreenMode(_mode: any) {
    if (!this.fullscreenAllowed) return false;
    if (document.fullscreenElement === this.host) return true;
    if (!document.fullscreenEnabled) return false;
    this.host.requestFullscreen().catch((e) => console.warn('Shattered Pixel Dungeon: full screen refused: ' + e));
    return true;
  }
  setWindowedMode(_w: number, _h: number) {
    if (document.fullscreenElement) document.exitFullscreen().catch(() => {});
    return true;
  }
  setTitle(_t: string) {}
  setUndecorated() {}
  setResizable() {}
  setVSync() {}
  setForegroundFPS() {}
  getBufferFormat() { return null; }
  supportsExtension(e: string) { return this.gl.getSupportedExtensions()?.includes(e) ?? false; }
  setContinuousRendering() {}
  isContinuousRendering() { return true; }
  requestRendering() {}
  newCursor(pixmap: any, x: number, y: number) { return new BrowserCursor(pixmap, x, y, this.dpr); }
  setCursor(c: any) {
    this.cursorCss = c ? c.css : 'auto';
    this.applyCursor();
  }
  setSystemCursor(_c: any) {
    this.cursorCss = 'auto';
    this.applyCursor();
  }
  applyCursor() { this.canvas.style.cursor = this.cursorHidden ? 'none' : this.cursorCss; }
}
