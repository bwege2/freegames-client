// @ts-nocheck
// The headless backend: libGDX's HeadlessApplication as the port needs it (no screen, no sound, no input):
// Gdx.app (type HeadlessDesktop, as the oracle's, with preferences and a clipboard in memory, a log) and
// Gdx.files (internal files from a store the caller gives, the files the game writes in memory).
//
//   const app = installHeadless({ internal: myAssetStore });   // sets Gdx.app and Gdx.files
//   app.runPosted();                                           // runs what Gdx.app.postRunnable queued
//
// A browser backend does the same with its own objects: Gdx.app = ..., Gdx.graphics = ..., Gdx.input = ...
import { $J, JObject } from '../jre/lang.ts';
import { Gdx, Application_ApplicationType, MemoryPreferences, MemoryClipboard } from './core.ts';
import { StoreFiles, MemoryFileStore } from './files.ts';
import type { FileStore } from './files.ts';

export class HeadlessApplication extends JObject {
  prefs = new Map<string, MemoryPreferences>();
  clipboard = new MemoryClipboard();
  posted: any[] = [];
  logLevel = 2; // Application.LOG_INFO
  /** Where log(), error() and debug() go (nothing by default: tests compare output, not logs). */
  logger: ((level: string, tag: string, msg: string, e?: any) => void) | null = null;
  exited = false;
  getType() { return Application_ApplicationType.HeadlessDesktop; }
  getVersion() { return 0; }
  getPreferences(name: string) {
    let p = this.prefs.get(name);
    if (!p) this.prefs.set(name, (p = new MemoryPreferences()));
    return p;
  }
  getClipboard() { return this.clipboard; }
  postRunnable(r: any) { this.posted.push(r); }
  /** Runs the runnables posted so far (libGDX runs them before the next frame). */
  runPosted() {
    const rs = this.posted;
    this.posted = [];
    for (const r of rs) (typeof r === 'function' ? r : r.run.bind(r))();
  }
  log(tag: string, msg: string, e?: any) { if (this.logLevel >= 2 && this.logger) this.logger('info', tag, msg, e); }
  error(tag: string, msg: string, e?: any) { if (this.logLevel >= 1 && this.logger) this.logger('error', tag, msg, e); }
  debug(tag: string, msg: string, e?: any) { if (this.logLevel >= 3 && this.logger) this.logger('debug', tag, msg, e); }
  setLogLevel(l: number) { this.logLevel = l; }
  getLogLevel() { return this.logLevel; }
  exit() { this.exited = true; }
  getJavaHeap() { return 0n; }
  getNativeHeap() { return 0n; }
  getApplicationListener() { return null; }
  addLifecycleListener() {}
  removeLifecycleListener() {}
}

/**
 * An OpenGL that draws nothing (as the oracle's, OracleMain.gl()): shaders compile and programs link (status 1),
 * their logs are empty, every other call does nothing and answers 0.
 */
export function mockGL(): any {
  const gl: any = {
    glGetShaderiv: (_s: number, _p: number, b: any) => { b.put(0, 1); },
    glGetProgramiv: (_s: number, _p: number, b: any) => { b.put(0, 1); },
    glGetShaderInfoLog: () => '',
    glGetProgramInfoLog: () => '',
  };
  return new Proxy(gl, { get: (t: any, p) => (p in t ? t[p] : () => 0) });
}

/** libGDX's MockGraphics: no screen (sizes 0), the frame time the backend's loop sets. */
export class HeadlessGraphics extends JObject {
  deltaTime = 0;
  frameId = 0n;
  getType() { return Application_ApplicationType.HeadlessDesktop; }
  getWidth() { return 0; }
  getHeight() { return 0; }
  getBackBufferWidth() { return 0; }
  getBackBufferHeight() { return 0; }
  getSafeInsetLeft() { return 0; }
  getSafeInsetTop() { return 0; }
  getSafeInsetRight() { return 0; }
  getSafeInsetBottom() { return 0; }
  getDeltaTime() { return this.deltaTime; }
  getRawDeltaTime() { return this.deltaTime; }
  getFrameId() { return this.frameId; }
  getFramesPerSecond() { return 0; }
  getPpiX() { return 0; }
  getPpiY() { return 0; }
  getPpcX() { return 0; }
  getPpcY() { return 0; }
  getDensity() { return 0; }
  getBackBufferScale() { return 0; }
  isGL30Available() { return false; }
  supportsDisplayModeChange() { return false; }
  getDisplayMode() { return { width: 0, height: 0, refreshRate: 0, bitsPerPixel: 0 }; }
  getDisplayModes() { return []; }
  isFullscreen() { return false; }
  setVSync() {}
  setForegroundFPS() {}
  setTitle() {}
  setCursor() {}
  setSystemCursor() {}
  newCursor() { return null; }
  requestRendering() {}
  isContinuousRendering() { return true; }
  setContinuousRendering() {}
  supportsExtension() { return false; }
}

/**
 * The gameplay oracle's screen (re/.../oracle/src/freegames/spd/OracleMain.java, graphics()): w x h pixels, every
 * frame 1/60 s, density 96/160, 96 ppi, a 1920x1080 display at 60 Hz, OpenGL "2.0 oracle"; anything else 0.
 */
export class FixedGraphics extends HeadlessGraphics {
  w: number;
  h: number;
  displayMode = { width: 1920, height: 1080, refreshRate: 60, bitsPerPixel: 32 };
  glVersion = { getMajorVersion: () => 2, getMinorVersion: () => 0, getReleaseVersion: () => 0, getVendorString: () => 'oracle',
    getRendererString: () => 'oracle', getType: () => Application_ApplicationType.Desktop, getDebugVersionString: () => '2.0 oracle' };
  constructor(w: number, h: number) {
    super();
    this.w = w;
    this.h = h;
    this.deltaTime = Math.fround(1 / 60);
  }
  getType() { return 'Mock'; }
  getWidth() { return this.w; }
  getHeight() { return this.h; }
  getBackBufferWidth() { return this.w; }
  getBackBufferHeight() { return this.h; }
  getDensity() { return Math.fround(96 / 160); }
  getPpiX() { return 96; }
  getPpiY() { return 96; }
  getPpcX() { return Math.fround(96 / 2.54); }
  getPpcY() { return Math.fround(96 / 2.54); }
  getBackBufferScale() { return 1; }
  getDisplayMode() { return this.displayMode; }
  getDisplayModes() { return [this.displayMode]; }
  getGLVersion() { return this.glVersion; }
  getFramesPerSecond() { return 60; }
  setWindowedMode() { return false; }
  setFullscreenMode() { return false; }
}

/** libGDX's MockInput: no keys, no pointer, no peripherals. */
export class MockInput extends JObject {
  processor: any = null;
  setInputProcessor(p: any) { this.processor = p; }
  getInputProcessor() { return this.processor; }
  isPeripheralAvailable() { return false; }
  isKeyPressed() { return false; }
  isKeyJustPressed() { return false; }
  isTouched() { return false; }
  justTouched() { return false; }
  isButtonPressed() { return false; }
  isButtonJustPressed() { return false; }
  getX() { return 0; }
  getY() { return 0; }
  getDeltaX() { return 0; }
  getDeltaY() { return 0; }
  getCurrentEventTime() { return 0n; }
  setCatchKey() {}
  isCatchKey() { return false; }
  setCursorCatched() {}
  isCursorCatched() { return false; }
  setCursorPosition() {}
  setOnscreenKeyboardVisible() {}
  vibrate() {}
  getMaxPointers() { return 0; }
}

/** libGDX's MockAudio: sounds and music that do nothing. */
export class MockSound extends JObject {
  play() { return 0n; }
  loop() { return 0n; }
  stop() {}
  pause() {}
  resume() {}
  dispose() {}
  setLooping() {}
  setPitch() {}
  setVolume() {}
  setPan() {}
}
export class MockMusic extends JObject {
  looping = false;
  volume = 1;
  play() {}
  pause() {}
  stop() {}
  isPlaying() { return false; }
  setLooping(b: boolean) { this.looping = b; }
  isLooping() { return this.looping; }
  setVolume(v: number) { this.volume = v; }
  getVolume() { return this.volume; }
  setPan() {}
  setPosition() {}
  getPosition() { return 0; }
  dispose() {}
  setOnCompletionListener() {}
}
export class MockAudio extends JObject {
  newSound(_f: any) { return new MockSound(); }
  newMusic(_f: any) { return new MockMusic(); }
  newAudioDevice() { return null; }
  newAudioRecorder() { return null; }
  switchOutputDevice() { return true; }
  getAvailableOutputDevices() { return []; }
}

/** libGDX's HeadlessApplicationLogger: "[tag] message" lines (log and debug to out, error to err). */
export function headlessLogger(out: (line: string) => void, err: (line: string) => void = out) {
  return (level: string, tag: string, msg: string, e?: any) => {
    const sink = level === 'error' ? err : out;
    sink('[' + tag + '] ' + msg);
    if (e) sink(String(e && e.stack ? e.stack : e));
  };
}

/**
 * Sets Gdx.app, Gdx.files, Gdx.graphics, Gdx.gl, Gdx.input and Gdx.audio to the headless backend; returns the
 * application. With `screen`, the graphics are the gameplay oracle's (FixedGraphics), else libGDX's
 * MockGraphics (no screen); `log` receives the log's lines as libGDX's headless logger prints them.
 */
export function installHeadless(opts: { internal: FileStore; writable?: FileStore; screen?: { width: number; height: number };
  log?: (line: string) => void; err?: (line: string) => void }): HeadlessApplication {
  const app = new HeadlessApplication();
  if (opts.log) app.logger = headlessLogger(opts.log, opts.err ?? opts.log);
  Gdx.app = app;
  Gdx.files = new StoreFiles(opts.internal, opts.writable ?? new MemoryFileStore());
  Gdx.graphics = opts.screen ? new FixedGraphics(opts.screen.width, opts.screen.height) : new HeadlessGraphics();
  Gdx.gl = Gdx.gl20 = mockGL();
  Gdx.input = new MockInput();
  Gdx.audio = new MockAudio();
  return app;
}
