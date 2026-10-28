// What is heard: the mixer's calls (sdl/mixer.ts) on Web Audio. The sound effects and the Ogg musics are
// decoded by the browser; the 2-player music (XM) plays in an audio worklet (xm.worklet.ts).
import type { Chunk, MixerSink, Music } from '../sdl/mixer.ts';
import { MIX_MAX_VOLUME } from '../sdl/mixer.ts';
import workletUrl from './xm.worklet.ts?worker&url';

export class WebAudioSink implements MixerSink {
  private readonly ac: AudioContext;
  private readonly urls: Record<string, string>;
  private readonly buffers = new Map<string, AudioBuffer>();
  private readonly channelGain: GainNode[] = [];
  private readonly master: GainNode;
  private readonly musicGain: GainNode;
  private music: { name: string; src: AudioBufferSourceNode | null; started: number; offset: number; loops: number } | null = null;
  private xm: AudioWorkletNode | null = null;
  private musicVol = MIX_MAX_VOLUME;

  constructor(ac: AudioContext, urls: Record<string, string>) {
    this.ac = ac;
    this.urls = urls;
    this.master = ac.createGain();
    this.master.connect(ac.destination);
    for (let i = 0; i < 8; i++) {
      const g = ac.createGain();
      g.connect(this.master);
      this.channelGain.push(g);
    }
    this.musicGain = ac.createGain();
    this.musicGain.connect(this.master);
  }

  /** decodes every file (in the background: the game does not wait for sound) */
  async load(signal: AbortSignal): Promise<void> {
    await Promise.all(Object.entries(this.urls).map(async ([name, url]) => {
      try {
        const r = await fetch(url, { signal });
        const data = await r.arrayBuffer();
        if (name.endsWith('.xm')) {
          await this.ac.audioWorklet.addModule(workletUrl);
          this.xm = new AudioWorkletNode(this.ac, 'fb-xm', { numberOfInputs: 0, outputChannelCount: [2] });
          this.xm.connect(this.musicGain);
          this.xm.port.postMessage({ t: 'load', data }, [data]);
          if (this.music?.name === name) this.startMusic();
        } else {
          this.buffers.set(name, await this.ac.decodeAudioData(data));
          if (this.music?.name === name && !this.music.src) this.startMusic();
        }
      } catch {
        // no sound for this file (an old browser without Ogg Vorbis, or the page closing)
      }
    }));
  }

  playChannel(c: Chunk, channel: number, loops: number): void {
    const b = this.buffers.get(c.name);
    if (!b) return;
    const src = this.ac.createBufferSource();
    src.buffer = b;
    src.loop = loops !== 0;
    const g = this.ac.createGain();
    g.gain.value = c.volume / MIX_MAX_VOLUME;
    src.connect(g);
    g.connect(this.channelGain[channel % 8]);
    src.start();
  }

  private startMusic(): void {
    const m = this.music;
    if (!m) return;
    if (m.name.endsWith('.xm')) {
      this.xm?.port.postMessage({ t: 'restart' });
      this.xm?.port.postMessage({ t: 'playing', on: true });
      return;
    }
    const b = this.buffers.get(m.name);
    if (!b) return;
    const src = this.ac.createBufferSource();
    src.buffer = b;
    src.loop = m.loops !== 0;
    src.connect(this.musicGain);
    src.start(0, m.offset % b.duration);
    m.src = src;
    m.started = this.ac.currentTime - m.offset;
  }

  private stopMusic(): void {
    const m = this.music;
    if (!m) return;
    if (m.name.endsWith('.xm')) this.xm?.port.postMessage({ t: 'playing', on: false });
    try { m.src?.stop(); } catch { /* not started */ }
    m.src = null;
  }

  playMusic(music: Music, loops: number): void {
    this.stopMusic();
    this.musicGain.gain.cancelScheduledValues(this.ac.currentTime);
    this.musicGain.gain.value = this.musicVol / MIX_MAX_VOLUME;
    this.music = { name: music.name, src: null, started: 0, offset: 0, loops };
    this.startMusic();
  }

  fadeOutMusic(ms: number): void {
    const t = this.ac.currentTime;
    this.musicGain.gain.cancelScheduledValues(t);
    this.musicGain.gain.setValueAtTime(this.musicGain.gain.value, t);
    this.musicGain.gain.linearRampToValueAtTime(0, t + ms / 1000);
    const m = this.music;
    setTimeout(() => { if (this.music === m) { this.stopMusic(); this.music = null; } }, ms);
  }

  haltMusic(): void { this.stopMusic(); this.music = null; }

  pauseMusic(): void {
    const m = this.music;
    if (!m) return;
    if (m.src) m.offset = this.ac.currentTime - m.started;
    this.stopMusic();
  }

  resumeMusic(): void { if (this.music && !this.music.src) this.startMusic(); }

  musicVolume_(v: number): void { this.musicVol = v; this.musicGain.gain.value = v / MIX_MAX_VOLUME; }
  musicVolume(v: number): void { this.musicVolume_(v); }

  channelVolume(channel: number, v: number): void { this.channelGain[channel % 8].gain.value = v / MIX_MAX_VOLUME; }
}
