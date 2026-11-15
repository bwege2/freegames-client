// What is heard: PingusSoundReal (engine/sound/sound_real.cpp) on Web Audio. Sounds are sounds/<name>.wav,
// played on SDL_mixer's 8 channels (a sound with no free channel is dropped, as Mix_PlayChannel(-1) does)
// at MIX_MAX_VOLUME * volume; the music is a module (it.ts) played in an audio worklet, one at a time.
import type { SoundOut } from './common.ts';
import type { DataSource } from './res.ts';
import workletUrl from './it.worklet.ts?worker&url';

export class Mixer implements SoundOut {
  private ac: AudioContext;
  private data: DataSource;
  private loadMusic: (name: string) => Promise<Uint8Array | null>;
  private buffers = new Map<string, AudioBuffer | null>();
  private decoding = new Map<string, Promise<AudioBuffer | null>>();
  private channels: (AudioBufferSourceNode | null)[] = new Array(8).fill(null);
  private node: AudioWorkletNode | null = null;
  private ready: Promise<AudioWorkletNode | null>;
  private musicGain: GainNode;
  private current = '';
  private stopped = false;

  constructor(ac: AudioContext, data: DataSource, loadMusic: (name: string) => Promise<Uint8Array | null>) {
    this.ac = ac;
    this.data = data;
    this.loadMusic = loadMusic;
    this.musicGain = ac.createGain();
    this.musicGain.connect(ac.destination);
    this.ready = ac.audioWorklet.addModule(workletUrl).then(() => {
      if (this.stopped) return null;
      this.node = new AudioWorkletNode(ac, 'pingus-it', { numberOfInputs: 0, outputChannelCount: [2] });
      this.node.connect(this.musicGain);
      return this.node;
    }).catch(() => null);
  }

  private buffer(name: string): Promise<AudioBuffer | null> {
    let p = this.decoding.get(name);
    if (!p) {
      const path = `sounds/${name}.wav`;
      const file = this.data.bytes(path);
      p = file ? this.ac.decodeAudioData(file.slice().buffer).catch(() => null) : Promise.resolve(null);
      p.then((b) => this.buffers.set(name, b));
      this.decoding.set(name, p);
    }
    return p;
  }

  playSound(name: string, volume: number): void {
    const free = this.channels.findIndex((c) => c === null);
    if (free < 0) return;
    const b = this.buffers.get(name);
    if (b === null) return; // no such sound: "Can't open sound ... -- skipping"
    const start = (buf: AudioBuffer | null) => {
      if (!buf || this.stopped || this.channels[free] !== null) return;
      const src = this.ac.createBufferSource();
      src.buffer = buf;
      const g = this.ac.createGain();
      g.gain.value = Math.trunc(128 * volume) / 128;
      src.connect(g).connect(this.ac.destination);
      this.channels[free] = src;
      src.onended = () => { if (this.channels[free] === src) this.channels[free] = null; };
      src.start();
    };
    if (b) start(b); else void this.buffer(name).then(start);
  }

  playMusic(name: string, volume: number, loop: boolean): void {
    this.current = name;
    this.musicGain.gain.value = Math.trunc(128 * volume) / 128;
    void Promise.all([this.loadMusic(name), this.ready]).then(([bytes, node]) => {
      if (!bytes || !node || this.current !== name || this.stopped) return;
      const copy = bytes.slice().buffer;
      node.port.postMessage({ t: 'play', data: copy, loop }, [copy]);
    });
  }

  stopMusic(): void {
    this.current = '';
    this.node?.port.postMessage({ t: 'stop' });
  }

  stop(): void {
    this.stopped = true;
    this.stopMusic();
    for (const c of this.channels) try { c?.stop(); } catch { /* ended */ }
    this.node?.disconnect();
  }
}
