// SDLSoundAgent with SDL_mixer on Web Audio: 16 channels (Mix_AllocateChannels(16)), Mix_PlayChannel(-1)
// takes the first free one, the volume is MIX_MAX_VOLUME * volume_sound% * volume%; the music loops as
// SDLMusicLooper does, between the samples (at 22050 Hz) of its .ogg.meta file.
import type { SoundPlayer } from '../engine/env.ts';

interface Channel { file: string; src: AudioBufferSourceNode | null; gain: GainNode; pending: boolean; done: boolean }

export class WebSound implements SoundPlayer {
  private ctx: AudioContext;
  private urlOf: (path: string) => string | undefined;
  private buffers = new Map<string, Promise<AudioBuffer | null>>();
  private decoded = new Map<string, AudioBuffer | null>();
  private channels: (Channel | null)[] = new Array(16).fill(null);
  private soundVolume = 128;
  private musicVolume = 128;
  private music: { path: string; src: AudioBufferSourceNode | null; gain: GainNode; token: number } | null = null;
  private token = 0;
  private metaText: (path: string) => Promise<string | null>;
  constructor(ctx: AudioContext, urlOf: (path: string) => string | undefined, metaText: (path: string) => Promise<string | null>) {
    this.ctx = ctx;
    this.urlOf = urlOf;
    this.metaText = metaText;
  }

  load(path: string): Promise<AudioBuffer | null> {
    let p = this.buffers.get(path);
    if (!p) {
      const url = this.urlOf(path);
      p = url
        ? fetch(url).then((r) => r.arrayBuffer()).then((b) => this.ctx.decodeAudioData(b)).catch(() => null)
        : Promise.resolve(null);
      p.then((b) => this.decoded.set(path, b));
      this.buffers.set(path, p);
    }
    return p;
  }

  playSound(file: string | null, volume: number, loops: number): number {
    if (!file) return -1;
    const ch = this.channels.findIndex((c) => c === null || c.done);
    if (ch < 0) return -1;
    const gain = this.ctx.createGain();
    gain.gain.value = (this.soundVolume * volume) / 100 / 128;
    gain.connect(this.ctx.destination);
    const c: Channel = { file, src: null, gain, pending: true, done: false };
    this.channels[ch] = c;
    const start = (buf: AudioBuffer | null) => {
      if (c.done) return;
      c.pending = false;
      if (!buf) { c.done = true; return; }
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      if (loops === -1) src.loop = true;
      let left = loops;
      src.onended = () => {
        if (left > 0 && !c.done) { left--; start(buf); return; }
        c.done = true;
      };
      src.connect(gain);
      src.start();
      c.src = src;
    };
    const ready = this.decoded.get(file);
    if (ready !== undefined) start(ready);
    else void this.load(file).then(start);
    return ch;
  }

  isPlaying(channel: number, file: string): boolean {
    const c = this.channels[channel];
    return !!c && !c.done && c.file === file;
  }

  halt(channel: number): void {
    const c = this.channels[channel];
    if (!c) return;
    c.done = true;
    try { c.src?.stop(); } catch { /* not started */ }
    c.gain.disconnect();
  }

  playMusic(path: string): void {
    if (this.music && this.music.path === path) return;
    this.stopMusic();
    const gain = this.ctx.createGain();
    gain.gain.value = this.musicVolume / 128;
    gain.connect(this.ctx.destination);
    const token = ++this.token;
    this.music = { path, src: null, gain, token };
    void Promise.all([this.load(path), this.metaText(path + '.meta')]).then(([buf, meta]) => {
      if (!buf || !this.music || this.music.token !== token) return;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      src.loop = true;
      const lines = meta ? meta.split('\n') : [];
      if (lines.length >= 2) {
        const s = parseInt(lines[0], 10) / 22050, e = parseInt(lines[1], 10) / 22050;
        src.loopStart = Math.min(s, buf.duration);
        src.loopEnd = Math.min(e, buf.duration);
      }
      src.connect(gain);
      src.start();
      this.music.src = src;
    });
  }

  stopMusic(): void {
    if (!this.music) return;
    try { this.music.src?.stop(); } catch { /* not started */ }
    this.music.gain.disconnect();
    this.music = null;
  }

  setVolumes(sound: number, music: number): void {
    this.soundVolume = Math.max(0, Math.min(128, Math.trunc((128 * sound) / 100)));
    this.musicVolume = Math.max(0, Math.min(128, Math.trunc((128 * music) / 100)));
    for (const c of this.channels) if (c && !c.done) c.gain.gain.value = this.soundVolume / 128;
    if (this.music) this.music.gain.gain.value = this.musicVolume / 128;
  }
}
