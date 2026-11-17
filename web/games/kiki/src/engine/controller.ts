// KikiController (src/main/KikiController.cpp) with the parts of kodilib's KEventHandler the game uses:
// the timer and escape events, the speed setting that scales every duration, the key handlers and the
// focus key handler (menus, texts, the key recorder), and the per-frame display() step.
import { KikiActionObject, type KikiEvent } from './action.ts';
import { installController } from './global.ts';
import { GlibcRandom } from './random.ts';
import { KikiPlayer, MAX_LIGHTS, unmodifiedName, type KeyHandler, type KikiKey } from './objects.ts';
import { KikiWorld } from './world.ts';
import { SilentSound, type KikiSound } from './sound.ts';

/** what the status display shows (KikiStatusDisplay); the renderer draws it */
export class KikiStatusDisplay {
  player_status: { getMoves(): number; getMinMoves(): number } | null = null;
  visible = false;
  setStatus(s: { getMoves(): number; getMinMoves(): number } | null): void {
    this.player_status = s;
    this.visible = !!s;
  }
  show(): void { this.visible = true; }
  hide(): void { this.visible = false; }
  isVisible(): boolean { return this.visible; }
}

/** an object drawn over the world (KikiScreenText and its menus) */
export interface Overlay {
  depth: number;
}

export class KikiController extends KikiActionObject {
  debug_version = false;
  speed = 5;
  gamma = 8;
  language = 'english';
  sound: KikiSound;
  world: KikiWorld;
  player: KikiPlayer = null as unknown as KikiPlayer;
  player_status = new KikiStatusDisplay();
  timer_event: KikiEvent;
  random = new GlibcRandom(1);
  quit_key = 'CTRL_q';
  /** glIsEnabled(GL_LIGHTn) for the KikiLights' light numbers */
  lightsEnabled: boolean[] = new Array(MAX_LIGHTS).fill(false);
  key_handlers: KeyHandler[] = [];
  focus_key_handler: KeyHandler | null = null;
  overlays: Overlay[] = [];
  /** the key recorder (KKeyRecorder) while a key is being assigned in the keyboard setup */
  recordKey: ((keyName: string) => void) | null = null;
  /** SDL_GetTicks of this frame, and of the one before (KEventHandler frame_time / last_time) */
  frame_time = 1;
  last_time = 1;
  private escapeEventId: number;
  /** the original's getLocalizedString is replaced by py/lang.py's */
  getLocalizedString: (key: string) => string = (k) => k;
  onQuit: () => void = () => {};
  onLog: (msg: string) => void = () => {};
  onDisplayText: (text: string) => void = () => {};

  constructor(sound: KikiSound = new SilentSound()) {
    super();
    installController(this);
    this.addEventWithName('timer');
    this.timer_event = this.events[this.events.length - 1];
    this.escapeEventId = this.addEventWithName('escape');
    this.sound = sound;
    this.world = new KikiWorld();
    this.addKeyHandler(this);
  }

  /** KikiController::init after the world: the status display and the player (src/main/KikiController.cpp) */
  init(): void {
    this.removeKeyHandler(this);
    this.world.init();
    this.getPlayer();
    this.addKeyHandler(this);
  }

  log(msg: string): void { this.onLog(msg); }

  getPlayer(): KikiPlayer {
    if (this.player === null) {
      this.player = new KikiPlayer();
      this.addKeyHandler(this.player);
    }
    return this.player;
  }

  isDebugVersion(): boolean { return this.debug_version; }
  getTime(): number { return this.frame_time; }
  setSpeed(s: number): void { this.speed = s; }
  getSpeed(): number { return this.speed; }
  mapMsTime(unmapped: number): number { return Math.trunc((10.0 * unmapped) / this.speed); }
  unmapMsTime(mapped: number): number { return Math.trunc((mapped * this.speed) / 10.0); }
  /** (frame_time - last_time)/(10000.0/speed) */
  getRelativeDelta(): number { return (this.frame_time - this.last_time) / (10000.0 / this.speed); }
  setGamma(g: number): void { this.gamma = g; }
  getGamma(): number { return this.gamma; }

  /** KikiController::displayText: a KikiScreenText that shows itself */
  displayText(text: string): void { this.onDisplayText(text); }

  quit(): void { this.onQuit(); }

  // ................................................................................ the frame
  /** one frame (KEventHandler::mainLoop's display()): the timer actions, then the moved objects */
  step(time: number): void {
    this.last_time = this.frame_time;
    this.frame_time = time;
    this.timer_event.triggerActions();
    this.world.updateStatus();
    this.timer_event.finishActions();
  }

  // ................................................................................ keys
  addKeyHandler(h: KeyHandler | null): void {
    if (h && !this.key_handlers.includes(h)) this.key_handlers.push(h);
  }
  removeKeyHandler(h: KeyHandler | null): void {
    if (!h) return;
    const i = this.key_handlers.indexOf(h);
    if (i >= 0) this.key_handlers.splice(i, 1);
  }
  setFocusKeyHandler(h: KeyHandler | null): void { this.focus_key_handler = h; }
  removeFocusKeyHandler(h: KeyHandler): void { if (this.focus_key_handler === h) this.focus_key_handler = null; }

  addOverlay(o: Overlay): void { if (!this.overlays.includes(o)) this.overlays.push(o); }
  removeOverlay(o: Overlay): void {
    const i = this.overlays.indexOf(o);
    if (i >= 0) this.overlays.splice(i, 1);
  }

  /** KEventHandler::handleKeyboardEvent */
  handleKeyboardEvent(key: KikiKey, down: boolean): void {
    if (this.recordKey && down) {
      // KKeyRecorder::handleKey: RETURN ends the recording without a key
      const cb = this.recordKey;
      this.recordKey = null;
      cb(key.name === 'RETURN' ? '' : key.name);
      return;
    }
    const focus = this.focus_key_handler;
    if (focus) {
      if (down) {
        if (focus.handleKey(key)) return;
      } else if (focus.handleKeyRelease) {
        if (focus.handleKeyRelease(key)) return;
      }
    }
    for (const h of this.key_handlers.slice()) {
      if (!this.key_handlers.includes(h)) continue;
      if (down) {
        if (h.handleKey(key)) return;
      } else if (h.handleKeyRelease) {
        if (h.handleKeyRelease(key)) return;
      }
    }
  }

  /** KikiController::handleKey: Escape, quit, F9 (the debug mode, part of the release), its keys, speed */
  handleKey(key: KikiKey): boolean {
    if (unmodifiedName(key) === 'ESCAPE') {
      this.events[this.escapeEventId].triggerActions();
      return true;
    }
    if (key.name === this.quit_key) {
      this.quit();
      return true;
    }
    if (key.name === 'F9') {
      this.debug_version = !this.debug_version;
      this.log('toggle debug mode');
      return true;
    }
    if (this.isDebugVersion()) {
      if (key.name === 'b') {
        this.world.setDisplayBorder(!this.world.display_border);
        return true;
      }
      if (key.name === 'r') {
        this.world.display_raster = !this.world.display_raster;
        this.world.displayListVersion++;
        return true;
      }
      if (key.name === 'd') {
        this.world.display_dots = !this.world.display_dots;
        return true;
      }
    }
    if (key.character >= 49 && key.character <= 57) {
      this.speed = key.character - 48;
      return true;
    }
    return false;
  }
}
