// kiki in the browser: the controller and the Python half (pyworld.ts), the keyboard as SDL 1.2 and
// kodilib's KKey name it, SDL_mixer's eight channels on Web Audio, the highscore and configuration
// files in the player's account, and one frame per animation frame (KEventHandler::mainLoop).
import type { GameContext } from '../../../src/sdk/index.ts';
import { KikiController } from './engine/controller.ts';
import { KikiScreenText } from './engine/gui.ts';
import type { KikiKey } from './engine/objects.ts';
import { SOUNDS, type KikiSound } from './engine/sound.ts';
import { KikiGame, type KikiStorage } from './pyworld.ts';
import { KikiRenderer } from './render/renderer.ts';

const soundUrls = import.meta.glob('../assets/sound/*.wav', { query: '?url', import: 'default', eager: true }) as Record<string, string>;

// --------------------------------------------------------------------------------------------- sound
const MIX_CHANNELS = 8;
const MIX_MAX_VOLUME = 128;

/** KikiSound on Web Audio: SDL_mixer's channels, chunk volumes, channel volume and panning */
class WebSound implements KikiSound {
  private buffers = new Map<string, AudioBuffer>();
  private channels: { end: number; source: AudioBufferSourceNode | null }[] =
    Array.from({ length: MIX_CHANNELS }, () => ({ end: 0, source: null }));
  /** Mix_VolumeChunk: per sound id, set when it is played with playSound */
  private chunkVolume: number[] = SOUNDS.map(() => 1.0);
  private sound_volume = 50;
  private mute = false;

  constructor(private audio: AudioContext, private C: () => KikiController) {}

  async load(signal: AbortSignal): Promise<void> {
    const files = [...new Set(SOUNDS.map(([f]) => f))];
    await Promise.all(files.map(async (f) => {
      const url = soundUrls[`../assets/sound/${f}`];
      if (!url) return;
      try {
        const res = await fetch(url, { signal });
        this.buffers.set(f, await this.audio.decodeAudioData(await res.arrayBuffer()));
      } catch { /* a sound that does not load is not played */ }
    }));
  }

  setMute(m: boolean): void { this.mute = m; }
  isMute(): boolean { return this.mute; }
  setSoundVolume(v: number): void { this.sound_volume = v; }
  getSoundVolume(): number { return this.sound_volume; }

  private freeChannel(): number {
    const now = this.audio.currentTime;
    return this.channels.findIndex((c) => c.end <= now);
  }

  private play(id: number, left: number, right: number): void {
    const buffer = this.buffers.get(SOUNDS[id][0]);
    if (!buffer || this.audio.state === 'closed') return;
    const ch = this.freeChannel();
    if (ch < 0) return;
    const channelVolume = Math.min(this.sound_volume, MIX_MAX_VOLUME) / MIX_MAX_VOLUME;
    const v = this.chunkVolume[id] * channelVolume;
    const src = this.audio.createBufferSource();
    src.buffer = buffer;
    const merger = this.audio.createChannelMerger(2);
    const l = this.audio.createGain();
    const r = this.audio.createGain();
    l.gain.value = v * left;
    r.gain.value = v * right;
    if (buffer.numberOfChannels > 1) {
      const split = this.audio.createChannelSplitter(2);
      src.connect(split);
      split.connect(l, 0);
      split.connect(r, 1);
    } else {
      src.connect(l);
      src.connect(r);
    }
    l.connect(merger, 0, 0);
    r.connect(merger, 0, 1);
    merger.connect(this.audio.destination);
    src.start();
    this.channels[ch] = { end: this.audio.currentTime + buffer.duration, source: src };
  }

  playSound(id: number, volume = -1): void {
    if (this.mute) return;
    if (volume < 0) volume = SOUNDS[id][1];
    this.chunkVolume[id] = Math.trunc(MIX_MAX_VOLUME * volume) / MIX_MAX_VOLUME;
    this.play(id, 1, 1);
  }

  playSoundAtPos(id: number, pos: { x: number; y: number; z: number }, factor = 1.0): void {
    if (this.mute) return;
    const C = this.C();
    const projection = C.world.projection ?? C.world.getProjection();
    const p = projection.getPosition();
    const dx = pos.x - p.x;
    const dy = pos.y - p.y;
    const dz = pos.z - p.z;
    const len = Math.sqrt(dx * dx + dy * dy + dz * dz);
    let volume = 1.0 - len / C.world.getMaxDistance();
    volume *= volume * factor;
    if (volume > 0.05) {
      const x = projection.getXVector();
      const pan = (len ? (x.x * dx + x.y * dy + x.z * dz) / len : 0) / 2.0 + 0.5;
      volume *= MIX_MAX_VOLUME;
      // Mix_SetPanning(left, right) with 255 = unchanged
      this.play(id, Math.trunc(volume * (1.0 - pan)) / 255, Math.trunc(volume * pan) / 255);
    }
  }

  stop(): void {
    for (const c of this.channels) { try { c.source?.stop(); } catch { /* ended */ } }
  }
}

// ------------------------------------------------------------------------------------------ keyboard
const NAMED: Record<string, string> = {
  ArrowUp: 'UP', ArrowDown: 'DOWN', ArrowLeft: 'LEFT', ArrowRight: 'RIGHT', Space: 'SPACE', Enter: 'RETURN',
  NumpadEnter: 'KPENTER', Escape: 'ESCAPE', Home: 'HOME', End: 'END', PageUp: 'PAGEUP', PageDown: 'PAGEDOWN',
  Insert: 'INSERT', Delete: 'DELETE', Backspace: 'BACKSPACE', Tab: 'TAB', ShiftLeft: 'SHIFT', ShiftRight: 'SHIFT',
  ControlLeft: 'CTRL', ControlRight: 'CTRL', AltLeft: 'ALT', AltRight: 'ALT', MetaLeft: 'META', MetaRight: 'META',
  CapsLock: 'CAPSLOCK', NumLock: 'NUMLOCK', ScrollLock: 'SCROLLOCK', Pause: 'PAUSE', PrintScreen: 'PRINT',
  ContextMenu: 'MENU', Comma: 'COMMA', Period: 'PERIOD', Slash: 'SLASH', Semicolon: 'SEMICOLON', Quote: 'QUOTE',
  BracketLeft: 'LEFTBRACKET', BracketRight: 'RIGHTBRACKET', Backslash: 'BACKSLASH', Minus: 'MINUS', Equal: 'EQUALS',
  Backquote: 'BACKQUOTE', NumpadDecimal: 'KPPERIOD', NumpadDivide: 'KPDIVIDE', NumpadMultiply: 'KPMULTIPLY',
  NumpadSubtract: 'KPMINUS', NumpadAdd: 'KPPLUS', NumpadEqual: 'KPEQUALS',
};

/** the SDL key name (kKeyGetNameForSym) of a browser key */
function symName(e: KeyboardEvent): string {
  if (NAMED[e.code]) return NAMED[e.code];
  if (/^F\d{1,2}$/.test(e.code)) return e.code;
  if (/^Numpad\d$/.test(e.code)) return 'KP' + e.code.slice(6);
  if (/^Digit\d$/.test(e.code)) return e.code.slice(5);
  if (e.key.length === 1 && /[a-z]/i.test(e.key)) return e.key.toLowerCase();
  if (/^Key[A-Z]$/.test(e.code)) return e.code.slice(3).toLowerCase();
  return '';
}

/** KKey from SDL_keysym: modifiers + "_" + key. A modifier key pressed has its own modifier not yet set
 * (SDL 1.2 takes the modifier state before the key); released, it is already unset. */
export function kkey(e: KeyboardEvent, down: boolean): KikiKey {
  const sym = symName(e);
  const mods: string[] = [];
  const self = sym;
  if (e.shiftKey && !(down && self === 'SHIFT')) mods.push('SHIFT');
  if (e.ctrlKey && !(down && self === 'CTRL')) mods.push('CTRL');
  if (e.altKey && !(down && self === 'ALT')) mods.push('ALT');
  if (e.metaKey && !(down && self === 'META')) mods.push('META');
  const name = mods.length ? `${mods.join('+')}_${sym}` : sym;
  const character = e.key.length === 1 && e.key.charCodeAt(0) < 128 ? e.key.charCodeAt(0) : 0;
  return { name, character };
}

// ---------------------------------------------------------------------------------------------- game
export class KikiBrowserGame {
  private C!: KikiController;
  private game!: KikiGame;
  private renderer!: KikiRenderer;
  private sound!: WebSound;
  private files = new Map<string, string>();
  private saving: Promise<void> = Promise.resolve();
  private resize?: ResizeObserver;
  private stopped = false;

  constructor(private host: HTMLElement, private ctx: GameContext) {}

  async init(): Promise<void> {
    const { host, ctx } = this;
    host.tabIndex = 0;
    host.style.outline = 'none';
    host.style.background = '#000';
    // the original's files in the home directory (~/.kiki.hsc, ~/.kiki.cfg)
    for (const name of ['kiki.hsc', 'kiki.cfg']) {
      try {
        const bytes = await ctx.storage.get(name);
        if (bytes) this.files.set(name, new TextDecoder().decode(bytes));
      } catch { /* not signed in or offline: start fresh */ }
    }
    const storage: KikiStorage = {
      load: (name) => this.files.get(name) ?? null,
      save: (name, text) => {
        if (this.files.get(name) === text) return;
        this.files.set(name, text);
        this.saving = this.saving.then(async () => { await ctx.storage.put(name, new TextEncoder().encode(text)); }).catch(() => {});
      },
    };
    this.sound = new WebSound(ctx.audio, () => this.C);
    await this.sound.load(ctx.signal);
    if (ctx.signal.aborted) return;
    this.renderer = new KikiRenderer(host);
    const fit = (): void => {
      const r = host.getBoundingClientRect();
      this.renderer.resize(r.width, r.height, Math.min(window.devicePixelRatio || 1, 2));
    };
    fit();
    this.resize = new ResizeObserver(fit);
    this.resize.observe(host);

    this.C = new KikiController(this.sound);
    const C = this.C;
    C.frame_time = C.last_time = Math.floor(performance.now()) + 1;
    C.onQuit = () => ctx.exit();
    C.onDisplayText = (text) => {
      const t = new KikiScreenText();
      t.setText(text, 0);
      t.show();
    };
    this.game = new KikiGame(C, {
      storage,
      getFullscreen: () => document.fullscreenElement === host,
      setFullscreen: (b) => {
        if (b && document.fullscreenElement !== host) host.requestFullscreen?.().catch(() => {});
        else if (!b && document.fullscreenElement) document.exitFullscreen().catch(() => {});
      },
    });
    this.game.start();

    const keys = (down: boolean) => (e: KeyboardEvent): void => {
      if (e.repeat) { e.preventDefault(); return; } // SDL_EnableKeyRepeat(0, 0)
      const key = kkey(e, down);
      if (!key.name) return;
      if (!(e.key === 'F5' || e.key === 'F11' || e.key === 'F12')) e.preventDefault();
      C.handleKeyboardEvent(key, down);
    };
    host.addEventListener('keydown', keys(true), { signal: ctx.signal });
    host.addEventListener('keyup', keys(false), { signal: ctx.signal });
    host.addEventListener('pointerdown', () => host.focus(), { signal: ctx.signal });
    host.focus();

    ctx.frame((time) => {
      if (this.stopped) return;
      // KEventHandler::mainLoop: SDL_GetTicks, the timer actions, then drawing
      C.step(Math.max(C.frame_time, Math.floor(time) + 1));
      this.renderer.render(C);
    });
  }

  async stop(): Promise<void> {
    this.stopped = true;
    this.resize?.disconnect();
    this.sound?.stop();
    this.renderer?.dispose();
    await this.saving;
  }
}
