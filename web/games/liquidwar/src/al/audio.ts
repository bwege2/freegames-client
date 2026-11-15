// al/audio.ts: the page's sound for Allegro's play_sample (8-bit samples, volume 0-255, pan 0-255, the
// frequency in 1/1000 of the sample's own) and play_midi (al/midi.ts), on the game's AudioContext.

import type { Midi, Sample } from './datafile.ts';
import { MidiPlayer } from './midi.ts';
import type { SoundSink } from './sound.ts';

/** Allegro's MIDI struct back to a Standard MIDI File */
export function midiToSmf(m: Midi): Uint8Array {
  const tracks = m.tracks.filter((t) => t.length > 0);
  const size = 14 + tracks.reduce((a, t) => a + 8 + t.length, 0);
  const b = new Uint8Array(size);
  const dv = new DataView(b.buffer);
  b.set([0x4d, 0x54, 0x68, 0x64], 0);
  dv.setUint32(4, 6);
  dv.setUint16(8, 1);
  dv.setUint16(10, tracks.length);
  dv.setUint16(12, m.divisions);
  let p = 14;
  for (const t of tracks) {
    b.set([0x4d, 0x54, 0x72, 0x6b], p);
    dv.setUint32(p + 4, t.length);
    b.set(t, p + 8);
    p += 8 + t.length;
  }
  return b;
}

export class WebAudioSink implements SoundSink {
  private readonly ctx: AudioContext;
  private readonly buffers = new Map<Sample, AudioBuffer>();
  private readonly out: GainNode;
  private music: MidiPlayer | null = null;
  private musicVolume = 255;
  private digiVolume = 255;

  constructor(ctx: AudioContext) {
    this.ctx = ctx;
    this.out = ctx.createGain();
    this.out.gain.value = 0.7;
    this.out.connect(ctx.destination);
  }

  private buffer(s: Sample): AudioBuffer {
    let b = this.buffers.get(s);
    if (!b) {
      b = this.ctx.createBuffer(1, Math.max(1, s.len), s.freq);
      const d = b.getChannelData(0);
      for (let i = 0; i < s.len; i++) d[i] = (s.data[i]! - 128) / 128;
      this.buffers.set(s, b);
    }
    return b;
  }

  play_sample(s: Sample, vol: number, pan: number, freq: number, loop: number): void {
    try {
      const src = this.ctx.createBufferSource();
      src.buffer = this.buffer(s);
      src.playbackRate.value = freq / 1000;
      src.loop = !!loop;
      const g = this.ctx.createGain();
      g.gain.value = (vol / 255) * (this.digiVolume / 255);
      src.connect(g);
      if (typeof this.ctx.createStereoPanner === 'function') {
        const p = this.ctx.createStereoPanner();
        p.pan.value = Math.max(-1, Math.min(1, (pan - 128) / 128));
        g.connect(p);
        p.connect(this.out);
      } else g.connect(this.out);
      src.onended = () => g.disconnect();
      src.start();
    } catch {
      /* the context may be closed */
    }
  }

  play_midi(m: Midi | null, loop: number): void {
    this.music?.stop(0);
    this.music = null;
    if (!m) return;
    try {
      const p = new MidiPlayer(this.ctx, midiToSmf(m));
      p.loop = !!loop;
      p.play(Math.round((this.musicVolume / 255) * 128));
      this.music = p;
    } catch {
      /* ignore */
    }
  }

  set_volume(digi: number, midi: number): void {
    if (digi >= 0) this.digiVolume = digi;
    if (midi >= 0) {
      this.musicVolume = midi;
      this.music?.set_volume(Math.round((midi / 255) * 128));
    }
  }

  stop(): void {
    this.music?.stop(0);
    this.music = null;
    MidiPlayer.stopAll();
  }
}
