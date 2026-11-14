// Chromium B.S.U. port (GPL-3.0-or-later, LICENSE.md): OpenAL sources on Web Audio. As in the
// original's OpenAL setup (AudioOpenAL::initSound, alDistanceModel(AL_NONE)), the listener stands at
// (0, -5, 25) and a source's position only pans it; distance does not weaken it.
import type { AudioBackend } from '../game/audio.ts';

interface Source {
  sound: number;
  gain: GainNode;
  panner: PannerNode;
  looping: boolean;
  node: AudioBufferSourceNode | null;
  state: 'initial' | 'playing' | 'paused' | 'stopped';
  started: number;
  offset: number;
}

export class WebAudioBackend implements AudioBackend {
  private readonly ac: AudioContext;
  private readonly buffers: (AudioBuffer | null)[];
  private readonly sources = new Map<number, Source>();
  private next = 1;
  private readonly out: GainNode;

  constructor(ac: AudioContext, buffers: (AudioBuffer | null)[]) {
    this.ac = ac;
    this.buffers = buffers;
    this.out = ac.createGain();
    this.out.connect(ac.destination);
    const l = ac.listener;
    if (l.positionX) { l.positionX.value = 0; l.positionY.value = -5; l.positionZ.value = 25; }
    else l.setPosition(0, -5, 25);
  }

  genSources(n: number): number[] {
    const ids: number[] = [];
    for (let i = 0; i < n; i++) {
      const gain = this.ac.createGain();
      const panner = this.ac.createPanner();
      panner.panningModel = 'equalpower';
      panner.distanceModel = 'linear';
      panner.rolloffFactor = 0;
      panner.connect(gain);
      gain.connect(this.out);
      const id = this.next++;
      this.sources.set(id, { sound: 0, gain, panner, looping: false, node: null, state: 'initial', started: 0, offset: 0 });
      ids.push(id);
    }
    return ids;
  }

  private src(id: number): Source | undefined { return this.sources.get(id); }

  buffer(id: number, sound: number): void { const s = this.src(id); if (s) s.sound = sound; }

  position(id: number, x: number, y: number, z: number): void {
    const s = this.src(id);
    if (!s) return;
    const p = s.panner;
    if (p.positionX) { p.positionX.value = x; p.positionY.value = y; p.positionZ.value = z; }
    else p.setPosition(x, y, z);
  }

  looping(id: number, on: boolean): void {
    const s = this.src(id);
    if (!s) return;
    s.looping = on;
    if (s.node) s.node.loop = on;
  }

  gain(id: number, v: number): void {
    const s = this.src(id);
    if (s) s.gain.gain.value = Math.max(0, v);
  }

  private halt(s: Source): void {
    if (s.node) {
      s.node.onended = null;
      try { s.node.stop(); } catch { /* never started */ }
      s.node.disconnect();
      s.node = null;
    }
  }

  /** alSourcePlay: a paused source goes on, any other starts from the beginning */
  play(id: number): void {
    const s = this.src(id);
    const buf = s ? this.buffers[s.sound] : null;
    if (!s || !buf) return;
    const from = s.state === 'paused' ? s.offset : 0;
    this.halt(s);
    const node = this.ac.createBufferSource();
    node.buffer = buf;
    node.loop = s.looping;
    node.connect(s.panner);
    node.onended = () => { if (s.node === node) { s.node = null; s.state = 'stopped'; } };
    node.start(0, from % buf.duration);
    s.node = node;
    s.started = this.ac.currentTime - from;
    s.state = 'playing';
  }

  stop(id: number): void {
    const s = this.src(id);
    if (!s) return;
    this.halt(s);
    s.state = 'stopped';
    s.offset = 0;
  }

  pause(id: number): void {
    const s = this.src(id);
    if (!s || s.state !== 'playing') return;
    const buf = this.buffers[s.sound];
    s.offset = buf ? (this.ac.currentTime - s.started) % buf.duration : 0;
    this.halt(s);
    s.state = 'paused';
  }
}
