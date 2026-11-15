// SDL_mixer as C-Dogs SDL 2.5.0 uses it (sounds.c, music.c), on Web Audio: sound channels (64, doubled up to 256
// when all are busy, GetChannel), Mix_SetPosition's stereo attenuation by bearing and distance (effect_position.c
// set_amplitudes), the muffle effect of sounds out of sight (sounds.c MuffleEffect: a three-sample average),
// Mix_Volume / Mix_VolumeMusic (0-128) and one looping music track.
import { ConfigGetInt } from '../core/config.ts';
import type { SoundPlayer, SoundRef } from '../core/sounds.ts';

const MIX_MAX_VOLUME = 128;
const MUSIC_REDUCTION_RATE = 0.25;

export class Audio implements SoundPlayer {
  private buffers = new Map<string, AudioBuffer>();
  private muffled = new Map<string, AudioBuffer>();
  private channels: (AudioBufferSourceNode | null)[] = new Array(64).fill(null);
  private sfx: GainNode;
  private musicGain: GainNode;
  private music: { path: string; node: AudioBufferSourceNode | null } | null = null;
  private musicToken = 0;
  musicReduced = false;

  constructor(private ctx: AudioContext, private read: (path: string) => Promise<Uint8Array>) {
    this.sfx = ctx.createGain();
    this.sfx.connect(ctx.destination);
    this.musicGain = ctx.createGain();
    this.musicGain.connect(ctx.destination);
    this.reconfigure();
  }
  /** decode the sound files (every SoundRef path) */
  async load(paths: string[]): Promise<void> {
    await Promise.all(paths.map(async (p) => {
      try {
        const bytes = await this.read(p);
        this.buffers.set(p, await this.ctx.decodeAudioData(bytes.slice().buffer));
      } catch {
        // a sound that does not decode stays silent, as Mix_LoadWAV failing
      }
    }));
  }
  /** SoundReconfigure: the volumes */
  reconfigure(): void {
    this.sfx.gain.value = ConfigGetInt('Sound.SoundVolume') / MIX_MAX_VOLUME;
    const m = ConfigGetInt('Sound.MusicVolume');
    this.musicGain.gain.value = (this.musicReduced ? Math.trunc(m * MUSIC_REDUCTION_RATE) : m) / MIX_MAX_VOLUME;
  }
  private muffledBuffer(path: string, b: AudioBuffer): AudioBuffer {
    let m = this.muffled.get(path);
    if (m) return m;
    m = this.ctx.createBuffer(b.numberOfChannels, b.length, b.sampleRate);
    for (let c = 0; c < b.numberOfChannels; c++) {
      const src = b.getChannelData(c);
      const dst = m.getChannelData(c);
      dst.set(src);
      for (let i = 0; i < src.length - 2; i++) dst[i] = (src[i] + src[i + 1] + src[i + 2]) / 3;
    }
    this.muffled.set(path, m);
    return m;
  }
  play(ref: SoundRef, bearingDegrees: number, distance: number, muffled: boolean): number {
    if (ref == null) return -1;
    const b = this.buffers.get(ref.path);
    if (!b) return -1;
    let ch = this.channels.indexOf(null);
    while (ch < 0) {
      if (this.channels.length > 128) return -1;
      ch = this.channels.length;
      this.channels.length *= 2;
      this.channels.fill(null, ch);
    }
    const src = this.ctx.createBufferSource();
    src.buffer = muffled ? this.muffledBuffer(ref.path, b) : b;
    // Mix_SetPosition: distance 0 is the loudest; the stereo split by the angle
    const angle = Math.abs(bearingDegrees) % 360;
    let left = 255;
    let right = 255;
    if (angle < 90) left = 255 - Math.trunc(255.0 * (angle / 89.0));
    else if (angle < 180) left = Math.trunc(255.0 * ((angle - 90) / 89.0));
    else if (angle < 270) right = 255 - Math.trunc(255.0 * ((angle - 180) / 89.0));
    else right = Math.trunc(255.0 * ((angle - 270) / 89.0));
    const d = (255 - Math.min(distance, 255)) / 255;
    const split = this.ctx.createChannelSplitter(2);
    const merge = this.ctx.createChannelMerger(2);
    const gl = this.ctx.createGain();
    const gr = this.ctx.createGain();
    gl.gain.value = (left / 255) * d;
    gr.gain.value = (right / 255) * d;
    src.connect(split);
    split.connect(gl, 0);
    split.connect(gr, src.buffer.numberOfChannels > 1 ? 1 : 0);
    gl.connect(merge, 0, 0);
    gr.connect(merge, 0, 1);
    merge.connect(this.sfx);
    this.channels[ch] = src;
    src.onended = () => {
      if (this.channels[ch] === src) this.channels[ch] = null;
      merge.disconnect();
    };
    src.start();
    return ch;
  }
  halt(channel: number): void {
    const s = this.channels[channel];
    if (!s) return;
    this.channels[channel] = null;
    try {
      s.stop();
    } catch {
      // already stopped
    }
  }
  /** the music player's track (null: stop) */
  playMusic(path: string | null): void {
    const token = ++this.musicToken;
    if (this.music?.node) {
      try {
        this.music.node.stop();
      } catch {
        // already stopped
      }
    }
    this.music = null;
    if (path == null) return;
    this.music = { path, node: null };
    void (async () => {
      // decoded tracks are large: not kept
      let b: AudioBuffer;
      try {
        b = await this.ctx.decodeAudioData((await this.read(path)).slice().buffer);
      } catch {
        return;
      }
      if (token !== this.musicToken) return;
      const src = this.ctx.createBufferSource();
      src.buffer = b;
      src.loop = true;
      src.connect(this.musicGain);
      src.start();
      this.music!.node = src;
    })();
  }
}
