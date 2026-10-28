// The XPilot NG X11 client in the browser: the port (client/) on the X server emulation (xlib/), a
// 1024x768 screen drawn into a canvas scaled to the window. Keys and the pointer become X input
// (Pointer Lock while the client steers with the mouse), the server is the room's xpilot module
// (protocol/games/xpilot.capnp messages through ctx.rooms), the player's files (.xpilotrc) are
// account storage, sounds play with Web Audio. `start` is what src/index.ts will export (FG-24).
import type { GameContext, GameInstance, StartGame } from '../../../src/sdk/index.ts';
import { SERVER_SEAT, packGame, unpackGame, playerName } from '../../../src/sdk/index.ts';
import * as P from './proto/xpilot.ts';
import { Display, XKeysymToString } from './xlib/xlib.ts';
import { setSys, type RoomEntry, type RoomService, type XpSys } from './client/sys.ts';
import { xpilot_main } from './client/main.ts';
import { G } from './client/G.ts';
import { O } from './client/option.ts';
import { KEY_EXIT } from './client/consts.ts';

const W = 1024, H = 768;

const textureUrls = import.meta.glob('../assets/textures/*.ppm', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const soundUrls = import.meta.glob('../assets/sound/*', { query: '?url', import: 'default', eager: true }) as Record<string, string>;
const shipshapesUrl = (import.meta.glob('../assets/shipshapes.txt', { query: '?url', import: 'default', eager: true }) as Record<string, string>)['../assets/shipshapes.txt'];

/** the maps of lib/maps a new room can play */
const MAPS = [
  'tourmination.xp2', 'blood-music.xp2', 'circle2.xp2', 'dodgers-legacy.xp2', 'dodgers-robots.xp2', 'dragon-1.0.xp2', 'ndh.xp2', 'pacman.xp2',
  'polybloods.xp2', 'polybloods7.xp2', 'polybloods8T.xp2', 'polybloods9Tb2.xp2', 'polyfishtank3.xp2', 'sadistic_bastard_v2.xp2', 'spaceball.xp2',
  'teamcup.xp',
];

/** DOM KeyboardEvent.code -> X keysym name, for keys that are not characters */
const CODE_KEYSYMS: Record<string, string> = {
  ShiftLeft: 'Shift_L', ShiftRight: 'Shift_R', ControlLeft: 'Control_L', ControlRight: 'Control_R', AltLeft: 'Alt_L', AltRight: 'Alt_R',
  MetaLeft: 'Meta_L', MetaRight: 'Meta_R', CapsLock: 'Caps_Lock', NumLock: 'Num_Lock', ScrollLock: 'Scroll_Lock', Enter: 'Return',
  NumpadEnter: 'KP_Enter', Backspace: 'BackSpace', Tab: 'Tab', Escape: 'Escape', Space: 'space', Delete: 'Delete', Insert: 'Insert',
  Home: 'Home', End: 'End', PageUp: 'Prior', PageDown: 'Next', ArrowLeft: 'Left', ArrowRight: 'Right', ArrowUp: 'Up', ArrowDown: 'Down',
  Pause: 'Pause', PrintScreen: 'Print', NumpadAdd: 'KP_Add', NumpadSubtract: 'KP_Subtract', NumpadMultiply: 'KP_Multiply',
  NumpadDivide: 'KP_Divide', NumpadDecimal: 'KP_Decimal',
};
for (let i = 1; i <= 12; i++) CODE_KEYSYMS[`F${i}`] = `F${i}`;
for (let i = 0; i <= 9; i++) CODE_KEYSYMS[`Numpad${i}`] = `KP_${i}`;

/** the keysym of a key: special keys by their position, characters as typed (letters unshifted) */
function keysymName(e: KeyboardEvent): string | null {
  const special = CODE_KEYSYMS[e.code];
  if (special && !(e.code.startsWith('Numpad') && e.key.length === 1 && e.getModifierState('NumLock') && /\d|\./.test(e.key))) return special;
  if (e.key.length === 1) {
    const c = e.key.toLowerCase().charCodeAt(0);
    if (c > 0xff) return null;
    return XKeysymToString(c);
  }
  return special ?? null;
}

class Stopped extends Error {}

class XpilotGame {
  private host: HTMLElement;
  private ctx: GameContext;
  private canvas: HTMLCanvasElement;
  private g2d: CanvasRenderingContext2D;
  private image: ImageData;
  private dpy = new Display(W, H);
  private dirty = true;
  private stopped = false;
  private waiter: (() => void) | null = null;
  private inbox: Uint8Array[] = [];
  private lib = new Map<string, Uint8Array>();
  private sounds = new Map<string, Promise<AudioBuffer | null>>();
  private sources: ({ node: AudioBufferSourceNode; gain: GainNode } | null)[] = [];
  /** the keysym each pressed key went down with (its release must say the same) */
  private down = new Map<string, string>();
  private fracX = 0;
  private fracY = 0;
  private locked = false;

  constructor(host: HTMLElement, ctx: GameContext) {
    this.host = host;
    this.ctx = ctx;
    host.tabIndex = 0;
    host.style.display = 'flex';
    host.style.alignItems = 'center';
    host.style.justifyContent = 'center';
    host.style.background = '#000';
    host.style.outline = 'none';
    this.canvas = document.createElement('canvas');
    this.canvas.width = W;
    this.canvas.height = H;
    this.canvas.style.imageRendering = 'pixelated';
    this.canvas.style.cursor = 'default';
    host.appendChild(this.canvas);
    this.g2d = this.canvas.getContext('2d')!;
    this.image = this.g2d.createImageData(W, H);
    this.dpy.onChange = () => { this.dirty = true; };
    const signal = ctx.signal;
    signal.addEventListener('abort', () => this.stop());
    new ResizeObserver(() => this.fit()).observe(host);
    this.fit();
    host.addEventListener('keydown', (e) => this.key(e, true), { signal });
    host.addEventListener('keyup', (e) => this.key(e, false), { signal });
    // keys held when the page loses the keyboard would stay down: they are let go
    host.addEventListener('blur', () => this.releaseAll(), { signal });
    this.canvas.addEventListener('mousedown', (e) => this.button(e, true), { signal });
    window.addEventListener('mouseup', (e) => this.button(e, false), { signal });
    window.addEventListener('mousemove', (e) => this.motion(e), { signal });
    this.canvas.addEventListener('wheel', (e) => this.wheel(e), { signal, passive: false });
    this.canvas.addEventListener('contextmenu', (e) => e.preventDefault(), { signal });
    document.addEventListener('pointerlockchange', () => this.lockChange(), { signal });
    ctx.rooms.on('message', (m) => {
      if (m.from !== SERVER_SEAT) return;
      this.inbox.push(m.data);
      this.wake();
    });
    // the round ended on the server (its tick watchdog: FG-35): the client hears it as the original
    // heard a server dropping it, a PKT_QUIT with the reason
    ctx.rooms.on('finished', (f) => {
      const reason = (f.stopped || 'the game ended').slice(0, 79);
      this.inbox.push(packGame(P.Msg, (m) => { m._initReliable(1).get(0)._initQuit().reason = reason; }));
      this.wake();
    });
    ctx.frame(() => this.paint());
    host.focus();
  }

  private fit(): void {
    const s = Math.min(this.host.clientWidth / W, this.host.clientHeight / H);
    const scale = s >= 1 ? Math.floor(s * window.devicePixelRatio) / window.devicePixelRatio || s : s;
    this.canvas.style.width = `${Math.floor(W * scale)}px`;
    this.canvas.style.height = `${Math.floor(H * scale)}px`;
  }

  private paint(): void {
    if (!this.dirty) return;
    this.dirty = false;
    this.dpy.composite(new Uint32Array(this.image.data.buffer), 0, 0, W, H);
    this.g2d.putImageData(this.image, 0, 0);
  }

  private wake(): void {
    const w = this.waiter;
    if (w) w();
  }

  /** resolves when cond() holds, or false at the timeout (microseconds; null: none) */
  private waitFor(cond: () => boolean, timeoutUs: number | null): Promise<boolean> {
    if (this.stopped) return Promise.reject(new Stopped());
    if (cond()) return Promise.resolve(true);
    return new Promise((resolve, reject) => {
      let timer: ReturnType<typeof setTimeout> | null = null;
      const done = (v: boolean | null) => {
        if (timer !== null) clearTimeout(timer);
        this.waiter = null;
        if (v === null) reject(new Stopped());
        else resolve(v);
      };
      if (timeoutUs !== null) timer = setTimeout(() => done(this.stopped ? null : cond()), Math.max(0, timeoutUs / 1000));
      this.waiter = () => {
        if (this.stopped) done(null);
        else if (cond()) done(true);
      };
    });
  }

  // ---------------------------------------------------------------- input

  private key(e: KeyboardEvent, press: boolean): void {
    if (e.code === 'F5' || e.code === 'F11' || e.code === 'F12') return;
    e.preventDefault();
    if (press) {
      if (e.repeat) return;        // the client turns X's auto-repeat off while playing
      const name = keysymName(e);
      if (!name) return;
      const old = this.down.get(e.code);
      if (old) this.dpy.inputKey(false, old);
      this.down.set(e.code, name);
      this.dpy.inputKey(true, name);
    } else {
      const name = this.down.get(e.code);
      if (!name) return;
      this.down.delete(e.code);
      this.dpy.inputKey(false, name);
    }
    this.wake();
  }

  private releaseAll(): void {
    for (const [code, name] of [...this.down]) {
      if (code.startsWith('button')) continue;
      this.down.delete(code);
      this.dpy.inputKey(false, name);
    }
    this.wake();
  }

  private toScreen(e: MouseEvent): [number, number] {
    const r = this.canvas.getBoundingClientRect();
    return [Math.floor(((e.clientX - r.left) * W) / r.width), Math.floor(((e.clientY - r.top) * H) / r.height)];
  }

  private button(e: MouseEvent, press: boolean): void {
    if (press) this.host.focus();
    if (!press && !this.locked && e.target !== this.canvas && !this.down.has(`button${e.button}`)) return;
    const b = e.button === 0 ? 1 : e.button === 1 ? 2 : e.button === 2 ? 3 : 0;
    if (!b) return;
    e.preventDefault();
    if (press) this.down.set(`button${e.button}`, '');
    else this.down.delete(`button${e.button}`);
    if (!this.locked) {
      const [x, y] = this.toScreen(e);
      this.dpy.inputMotionAbs(x, y);
    }
    this.dpy.inputButton(press, b);
    this.wake();
  }

  private motion(e: MouseEvent): void {
    if (this.locked) {
      const r = this.canvas.getBoundingClientRect();
      this.fracX += (e.movementX * W) / r.width;
      this.fracY += (e.movementY * H) / r.height;
      const dx = Math.trunc(this.fracX), dy = Math.trunc(this.fracY);
      if (!dx && !dy) return;
      this.fracX -= dx;
      this.fracY -= dy;
      this.dpy.inputMotionRel(dx, dy);
    } else {
      const [x, y] = this.toScreen(e);
      if (x < 0 || y < 0 || x >= W || y >= H) return;
      this.dpy.inputMotionAbs(x, y);
    }
    this.wake();
  }

  private wheel(e: WheelEvent): void {
    e.preventDefault();
    if (!e.deltaY) return;
    const b = e.deltaY < 0 ? 4 : 5;
    this.dpy.inputButton(true, b);
    this.dpy.inputButton(false, b);
    this.wake();
  }

  private pointerControl(on: boolean): void {
    if (on) {
      const p = this.canvas.requestPointerLock() as unknown as Promise<void> | undefined;
      if (p && typeof p.catch === 'function') p.catch(() => this.lockChange());
    } else if (document.pointerLockElement === this.canvas) document.exitPointerLock();
  }

  private lockChange(): void {
    this.locked = document.pointerLockElement === this.canvas;
    this.canvas.style.cursor = this.locked ? 'none' : 'default';
    // the browser left Pointer Lock (Esc): the client leaves mouse steering with its exit key
    if (!this.locked && !this.stopped && G.clData.pointerControl) {
      const kd = O.keydefs.find((k) => k.key === KEY_EXIT);
      const name = XKeysymToString(kd ? kd.keysym : 0xff1b);
      if (name) {
        this.dpy.inputKey(true, name);
        this.dpy.inputKey(false, name);
        this.wake();
      }
    }
  }

  // ---------------------------------------------------------------- the server and files

  private rooms(): RoomService {
    const rooms = this.ctx.rooms;
    const started = () => new Promise<boolean>((resolve) => {
      if (rooms.round) {
        resolve(true);
        return;
      }
      const off = rooms.on('started', () => {
        off();
        offc();
        resolve(true);
      });
      const offc = rooms.on('closed', () => {
        off();
        offc();
        resolve(false);
      });
    });
    const optionsOf = (data: Uint8Array): [string, string][] => {
      try {
        const o = unpackGame(P.Options, data);
        return [...o.options].map((x) => [x.name, x.value] as [string, string]);
      } catch {
        return [];
      }
    };
    return {
      list: async () => {
        try {
          const list = await rooms.list();
          return list.map((r): RoomEntry => {
            const options = optionsOf(r.options);
            const map = options.find(([k]) => /^(map|mapFileName)$/i.test(k))?.[1] ?? '';
            return {
              id: r.id, name: r.name, users: r.seats.length, maxUsers: r.maxSeats, map: map.replace(/\.xp2?$|\.xpd$/, ''),
              players: r.seats.map((s) => `${s.name}=web`), options,
            };
          });
        } catch (e) {
          console.warn('xpilot: no room list', e);
          return null;
        }
      },
      maps: async () => MAPS.slice(),
      create: async (map, options) => {
        try {
          const all: [string, string][] = [['map', map], ...options];
          const data = packGame(P.Options, (o) => {
            const l = o._initOptions(all.length);
            all.forEach(([k, v], i) => {
              l.get(i).name = k;
              l.get(i).value = v;
            });
          });
          await rooms.create({ name: `${playerName() || 'XPilot'}: ${map.replace(/\.xp2?$/, '')}`, options: data });
          if (!rooms.round) await rooms.start();
          return true;
        } catch (e) {
          console.warn('xpilot: no room', e);
          return false;
        }
      },
      join: async (id) => {
        try {
          await rooms.join(id);
          return await started();
        } catch (e) {
          console.warn('xpilot: cannot join', e);
          return false;
        }
      },
    };
  }

  private async preload(): Promise<void> {
    const get = async (url: string) => new Uint8Array(await (await fetch(url, { signal: this.ctx.signal })).arrayBuffer());
    const jobs: Promise<void>[] = [];
    for (const [path, url] of Object.entries(textureUrls)) {
      jobs.push(get(url).then((d) => { this.lib.set(`textures/${path.slice(path.lastIndexOf('/') + 1)}`, d); }));
    }
    const soundsTxt = Object.entries(soundUrls).find(([p]) => p.endsWith('/sounds.txt'));
    if (soundsTxt) jobs.push(get(soundsTxt[1]).then((d) => { this.lib.set('sound/sounds.txt', d); }));
    jobs.push(get(shipshapesUrl).then((d) => { this.lib.set('shipshapes.txt', d); }));
    await Promise.all(jobs);
  }

  private sound(file: string): Promise<AudioBuffer | null> {
    let p = this.sounds.get(file);
    if (!p) {
      const url = Object.entries(soundUrls).find(([path]) => path.endsWith(`/${file.slice(file.lastIndexOf('/') + 1)}`))?.[1];
      p = url
        ? fetch(url, { signal: this.ctx.signal }).then((r) => r.arrayBuffer()).then((b) => this.ctx.audio.decodeAudioData(b)).catch(() => null)
        : Promise.resolve(null);
      this.sounds.set(file, p);
    }
    return p;
  }

  private stopSource(source: number): void {
    const s = this.sources[source];
    if (s) {
      try { s.node.stop(); } catch { /* not started */ }
      s.node.disconnect();
      s.gain.disconnect();
      this.sources[source] = null;
    }
  }

  private sys(): XpSys {
    const latin1 = (b: Uint8Array) => { let s = ''; for (const c of b) s += String.fromCharCode(c); return s; };
    const bytesOf = (s: string) => Uint8Array.from(s, (c) => c.charCodeAt(0) & 0xff);
    return {
      onFrameEnd: frameEnd,
      nowUs: () => Math.floor((performance.timeOrigin + performance.now()) * 1000),
      time: () => Math.floor(Date.now() / 1000),
      localtime: (t) => {
        const d = new Date(t * 1000);
        return { hour: d.getHours(), min: d.getMinutes() };
      },
      select: async (x, net, timeoutUs) => {
        const xr = () => x && this.dpy.pending() > 0, nr = () => net && this.inbox.length > 0;
        await this.waitFor(() => xr() || nr(), timeoutUs);
        return { x: xr(), net: nr() };
      },
      waitNet: (timeoutUs) => this.waitFor(() => this.inbox.length > 0, timeoutUs),
      waitX: async () => { await this.waitFor(() => this.dpy.pending() > 0, null); },
      recv: () => this.inbox.shift() ?? null,
      peek: () => this.inbox[0] ?? null,
      send: (data) => {
        if (this.ctx.rooms.round) this.ctx.rooms.send(data, 'server', true);
      },
      contact: async () => false,
      rooms: this.rooms(),
      readFile: async (name) => {
        try {
          const d = await this.ctx.storage.get(name);
          return d ? latin1(d) : null;
        } catch {
          return null;
        }
      },
      writeFile: async (name, text) => {
        try {
          await this.ctx.storage.put(name, bytesOf(text));
          return true;
        } catch {
          return false;
        }
      },
      libFile: (path) => this.lib.get(path) ?? null,
      display: this.dpy,
      pid: 1 + Math.floor(Math.random() * 32767),
      login: (playerName() || 'pilot').replace(/[^A-Za-z0-9_-]/g, '').slice(0, 15) || 'pilot',
      hostname: 'web',
      sound: true,
      playSound: (source, file, gain, loop) => {
        this.stopSource(source);
        void this.sound(file).then((buf) => {
          if (!buf || this.stopped) return;
          const audio = this.ctx.audio;
          const node = audio.createBufferSource();
          const g = audio.createGain();
          node.buffer = buf;
          node.loop = loop;
          g.gain.value = gain;
          node.connect(g).connect(audio.destination);
          this.stopSource(source);
          this.sources[source] = { node, gain: g };
          node.onended = () => { if (this.sources[source]?.node === node) this.sources[source] = null; };
          node.start();
        });
      },
      setSoundGain: (source, gain) => {
        const s = this.sources[source];
        if (s) s.gain.gain.value = gain;
      },
      stopSound: (source) => this.stopSource(source),
      exit: () => this.ctx.exit(),
      log: (line) => console.log(line.trimEnd()),
      clipboard: () => null,
      pointerControl: (on) => this.pointerControl(on),
    };
  }

  async run(): Promise<void> {
    try {
      await this.preload();
      setSys(this.sys());
      const nick = (playerName() || 'Pilot').slice(0, 15);
      await xpilot_main(['-name', nick]);
    } catch (e) {
      if (e instanceof Stopped || this.stopped) return;
      console.error('xpilot', e);
    }
    if (!this.stopped) this.ctx.exit();
  }

  stop(): void {
    if (this.stopped) return;
    this.stopped = true;
    for (let i = 0; i < this.sources.length; i++) this.stopSource(i);
    if (document.pointerLockElement === this.canvas) document.exitPointerLock();
    if (this.ctx.rooms.room) this.ctx.rooms.leave();
    this.wake();
  }
}

/**
 * Read-only for tests (web/games/xpilot/e2e.mjs), like the example game's __exampleFrames: the server
 * frame the client is at, where it is, and the ships it sees.
 */
let lastFrame = { loops: 0, ships: [] as { id: number; x: number; y: number }[] };

/** at the end of each frame, before painting forgets the ships */
function frameEnd(loops: number): void {
  lastFrame = { loops, ships: G.ship_ptr.slice(0, G.num_ship).map((s) => ({ id: s.id, x: s.x, y: s.y })) };
}

function snapshot() {
  return {
    loops: G.loops,
    self: G.self ? { id: G.self.id, name: G.self.nick_name, x: G.selfPos.x, y: G.selfPos.y, visible: !!G.selfVisible } : null,
    ships: lastFrame.loops === G.loops ? lastFrame.ships : [],
    players: G.Others.length,
  };
}

export const start: StartGame = (host, ctx): GameInstance => {
  const game = new XpilotGame(host, ctx);
  const w = globalThis as unknown as { __xpilot?: { snapshot: typeof snapshot } };
  w.__xpilot = { snapshot };
  void game.run();
  return {
    stop: () => {
      game.stop();
      delete w.__xpilot;
    },
  };
};
