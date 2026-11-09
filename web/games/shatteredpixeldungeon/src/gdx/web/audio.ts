// @ts-nocheck
// libGDX's Audio for the browser, on the site's AudioContext (ctx.audio), as the LWJGL3 backend's OpenAL audio
// behaves (OpenALLwjgl3Audio, gdx-backend-lwjgl3 1.14.0):
// - Sound (noosa's Sample, the .mp3 effects): decoded once (decodeAudioData) from the asset's bytes; play(volume,
//   pitch, pan) starts an instance and returns its id (a long), pitch is the playback rate, pan -1..1; at most
//   16 instances play at once (the backend's default simultaneous sources; play() answers -1 when all are
//   busy); pause()/resume() hold and continue all instances.
// - Music (the .ogg tracks): streamed by an <audio> element through the AudioContext (the files are large and
//   load lazily, game.json lazyAssets); looping, volume, play/pause/stop, position, and the completion
//   listener (called when a track that does not loop ends, as OpenALMusic does on the render thread: here
//   at the start of the next frame).
import { JObject } from '../../jre/lang.ts';
import { GdxRuntimeException } from '../core.ts';

const MAX_SOURCES = 16;

export class BrowserAudio extends JObject {
  ctx: AudioContext;
  out: GainNode;
  playing = 0;
  musics = new Set<BrowserMusic>();
  /** Runs on the render thread (the start of a frame). */
  post: (f: () => void) => void;
  /** The URL of an internal file (music streams from it). */
  urlOf: (path: string) => string | null;
  constructor(ctx: AudioContext, urlOf: (path: string) => string | null, post: (f: () => void) => void) {
    super();
    this.ctx = ctx;
    this.urlOf = urlOf;
    this.post = post;
    this.out = ctx.createGain();
    this.out.connect(ctx.destination);
  }
  newSound(file: any) { return new BrowserSound(this, file); }
  newMusic(file: any) { const m = new BrowserMusic(this, file); this.musics.add(m); return m; }
  newAudioDevice() { return null; }
  newAudioRecorder() { return null; }
  switchOutputDevice() { return false; }
  getAvailableOutputDevices() { return []; }
  /** The game stops: every track is paused (the context closes with the game). */
  stopAll() { for (const m of this.musics) m.halt(); }
  pauseAll() { for (const m of this.musics) m.suspend(); }
  resumeAll() { for (const m of this.musics) m.unsuspend(); }
}

type Instance = { src: AudioBufferSourceNode; gain: GainNode; pan: StereoPannerNode; started: number; offset: number; rate: number; paused: boolean };

export class BrowserSound extends JObject {
  audio: BrowserAudio;
  buffer: AudioBuffer | null = null;
  instances = new Map<bigint, Instance>();
  nextId = 1n;
  disposed = false;
  constructor(audio: BrowserAudio, file: any) {
    super();
    this.audio = audio;
    const bytes: Uint8Array = file.bytesOrThrow();
    const copy = bytes.slice().buffer;
    audio.ctx.decodeAudioData(copy).then((b) => { this.buffer = b; }, (e) => console.warn('Shattered Pixel Dungeon: cannot decode ' + file.path() + ': ' + e));
  }
  start(id: bigint, inst: Instance, offset: number) {
    const ctx = this.audio.ctx;
    const src = ctx.createBufferSource();
    src.buffer = this.buffer;
    src.playbackRate.value = inst.rate;
    src.connect(inst.gain);
    src.onended = () => {
      if (inst.src !== src || inst.paused) return;
      this.instances.delete(id);
      this.audio.playing--;
    };
    inst.src = src;
    inst.started = ctx.currentTime;
    inst.offset = offset;
    src.start(0, offset);
  }
  play(volume = 1, pitch = 1, pan = 0): bigint {
    if (this.disposed || !this.buffer || this.audio.ctx.state === 'closed') return -1n;
    if (this.audio.playing >= MAX_SOURCES) return -1n;
    const ctx = this.audio.ctx;
    const gain = ctx.createGain();
    gain.gain.value = volume;
    const panner = ctx.createStereoPanner();
    panner.pan.value = Math.max(-1, Math.min(1, pan));
    gain.connect(panner);
    panner.connect(this.audio.out);
    const id = this.nextId++;
    const inst: Instance = { src: null, gain, pan: panner, started: 0, offset: 0, rate: pitch, paused: false };
    this.instances.set(id, inst);
    this.audio.playing++;
    this.start(id, inst, 0);
    return id;
  }
  loop(volume = 1, pitch = 1, pan = 0) {
    const id = this.play(volume, pitch, pan);
    const i = this.instances.get(id);
    if (i) i.src.loop = true;
    return id;
  }
  stop(id?: bigint) {
    for (const [k, i] of [...this.instances]) {
      if (id !== undefined && k !== id) continue;
      i.paused = false;
      i.src.onended = null;
      try { i.src.stop(); } catch { /* not started */ }
      i.gain.disconnect();
      this.instances.delete(k);
      this.audio.playing--;
    }
  }
  pause(id?: bigint) {
    const ctx = this.audio.ctx;
    for (const [k, i] of this.instances) {
      if ((id !== undefined && k !== id) || i.paused) continue;
      i.paused = true;
      i.offset += (ctx.currentTime - i.started) * i.rate;
      try { i.src.stop(); } catch { /* not started */ }
    }
  }
  resume(id?: bigint) {
    for (const [k, i] of this.instances) {
      if ((id !== undefined && k !== id) || !i.paused) continue;
      i.paused = false;
      const d = this.buffer.duration;
      this.start(k, i, i.src.loop ? i.offset % d : Math.min(i.offset, d));
    }
  }
  setLooping(id: bigint, l: boolean) { const i = this.instances.get(id); if (i) i.src.loop = l; }
  setPitch(id: bigint, p: number) { const i = this.instances.get(id); if (i) { i.rate = p; i.src.playbackRate.value = p; } }
  setVolume(id: bigint, v: number) { const i = this.instances.get(id); if (i) i.gain.gain.value = v; }
  setPan(id: bigint, pan: number, v: number) { const i = this.instances.get(id); if (i) { i.pan.pan.value = pan; i.gain.gain.value = v; } }
  dispose() { this.stop(); this.disposed = true; this.buffer = null; }
}

export class BrowserMusic extends JObject {
  audio: BrowserAudio;
  el: HTMLAudioElement;
  node: MediaElementAudioSourceNode | null = null;
  gain: GainNode;
  volume = 1;
  pan = 0;
  playing = false;
  suspended = false;
  listener: any = null;
  path: string;
  constructor(audio: BrowserAudio, file: any) {
    super();
    this.audio = audio;
    this.path = file.path();
    const url = audio.urlOf(this.path);
    if (url == null) throw new GdxRuntimeException('File not found: ' + this.path + ' (Internal)');
    this.el = new Audio();
    this.el.preload = 'auto';
    this.el.crossOrigin = 'anonymous';
    this.el.src = url;
    this.gain = audio.ctx.createGain();
    this.gain.connect(audio.out);
    try {
      this.node = audio.ctx.createMediaElementSource(this.el);
      this.node.connect(this.gain);
    } catch {
      this.node = null; // played by the element itself
    }
    this.el.addEventListener('ended', () => {
      if (!this.playing || this.el.loop) return;
      this.playing = false;
      const l = this.listener;
      if (l) this.audio.post(() => l.onCompletion(this));
    });
  }
  apply() {
    if (this.node) this.gain.gain.value = this.volume;
    else this.el.volume = Math.max(0, Math.min(1, this.volume));
  }
  play() {
    this.playing = true;
    if (this.suspended) return;
    this.apply();
    this.el.play().catch(() => { /* not allowed yet, or stopped meanwhile */ });
  }
  pause() { this.playing = false; this.el.pause(); }
  stop() { this.playing = false; this.el.pause(); try { this.el.currentTime = 0; } catch { /* not loaded */ } }
  /** The page is hidden or the game stops: the track halts without the game knowing (as a paused app). */
  suspend() { this.suspended = true; this.el.pause(); }
  unsuspend() { this.suspended = false; if (this.playing) this.el.play().catch(() => {}); }
  halt() { this.suspended = true; this.el.pause(); this.el.removeAttribute('src'); this.el.load(); }
  isPlaying() { return this.playing; }
  setLooping(l: boolean) { this.el.loop = l; }
  isLooping() { return this.el.loop; }
  setVolume(v: number) { this.volume = v; this.apply(); }
  getVolume() { return this.volume; }
  setPan(pan: number, v: number) { this.pan = pan; this.setVolume(v); }
  setPosition(s: number) { try { this.el.currentTime = s; } catch { /* not loaded */ } }
  getPosition() { return Math.fround(this.el.currentTime || 0); }
  setOnCompletionListener(l: any) { this.listener = l; }
  dispose() {
    this.playing = false;
    this.halt();
    try { this.node?.disconnect(); } catch { /* closed */ }
    this.gain.disconnect();
    this.audio.musics.delete(this);
  }
}
