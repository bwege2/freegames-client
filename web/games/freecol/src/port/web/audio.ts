// The page's side of FreeCol's sound (client/sound.ts): one channel per SoundPlayer (music, effects), each
// playing one file at a time and saying when it ended. The browser decodes the Ogg Vorbis files.
import type { FileIndex } from './files.ts';

/**
 * The original sets a line's gain in dB to min + (max - min)/2 * log10(volume) (SoundPlayer.changeVolume); with a
 * gain control from -80 dB to 0 dB that is an amplitude of (volume/100)^2.
 */
export function amplitude(volume: number): number {
  const v = Math.max(0, Math.min(100, volume));
  return (v / 100) * (v / 100);
}

type Channel = { gain: GainNode; source: AudioBufferSourceNode | null; token: number };

export class PageAudio {
  channels = new Map<number, Channel>();
  buffers = new Map<string, Promise<AudioBuffer>>();
  token = 0;

  constructor(
    private ctx: AudioContext,
    private files: FileIndex,
    private ended: (player: number) => void,
  ) {}

  channel(player: number): Channel {
    let c = this.channels.get(player);
    if (!c) {
      const gain = this.ctx.createGain();
      gain.connect(this.ctx.destination);
      c = { gain, source: null, token: 0 };
      this.channels.set(player, c);
    }
    return c;
  }

  decode(path: string): Promise<AudioBuffer> {
    let b = this.buffers.get(path);
    if (!b) {
      const url = this.files[path];
      b = url == null ? Promise.reject(new Error('no file ' + path))
        : fetch(url).then((r) => r.arrayBuffer()).then((a) => this.ctx.decodeAudioData(a));
      // music is long: keep only the short sounds decoded
      b.then((buf) => { if (buf.duration > 20) this.buffers.delete(path); }, () => this.buffers.delete(path));
      this.buffers.set(path, b);
    }
    return b;
  }

  play(player: number, path: string, volume: number) {
    const c = this.channel(player);
    this.halt(c);
    const token = (c.token = ++this.token);
    c.gain.gain.value = amplitude(volume);
    this.decode(path).then((buf) => {
      if (c.token !== token) return;
      const s = this.ctx.createBufferSource();
      s.buffer = buf;
      s.connect(c.gain);
      s.onended = () => {
        if (c.token !== token) return;
        c.source = null;
        c.token = 0;
        this.ended(player);
      };
      c.source = s;
      s.start();
    }).catch((e) => {
      console.warn('FreeCol: cannot play ' + path + ': ' + e);
      if (c.token !== token) return;
      c.token = 0;
      this.ended(player);
    });
  }

  /** Stops what a channel plays; the client hears that it ended. */
  stop(player: number) {
    const c = this.channels.get(player);
    if (!c || c.token === 0) return;
    this.halt(c);
    c.token = 0;
    this.ended(player);
  }

  halt(c: Channel) {
    if (c.source) {
      c.source.onended = null;
      try {
        c.source.stop();
      } catch {
        // not started
      }
      c.source = null;
    }
  }

  volume(player: number, volume: number) {
    this.channel(player).gain.gain.value = amplitude(volume);
  }
}
