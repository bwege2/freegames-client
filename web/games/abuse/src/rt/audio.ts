// The page's side of sdlport/sound.cpp: what SDL_mixer did with the calls the game makes (the game
// runs in a worker and sends them here). WAV effects: Mix_PlayChannel on one of 50 channels,
// Mix_Volume(channel, volume) (0..128), Mix_SetPanning(channel, panpot, 255 - panpot). Music: the HMI
// file converted to MIDI (hmi.ts, translated from sdlport/hmi.cpp) and played by midi.ts,
// Mix_VolumeMusic(volume). Nothing plays unless the data has the original's sfx/ and music/.
import { load_hmi } from '../sdlport/hmi.ts';
import { MidiPlayer } from '../sdlport/midi.ts';
import type { AudioOut } from '../sdlport/sound.ts';

const MAX_CHANNELS = 50;

/** an 8- or 16-bit PCM WAV as an AudioBuffer */
function decode_wav(ctx: AudioContext, d: Uint8Array): AudioBuffer | null {
  if (d.length < 12 || String.fromCharCode(d[0], d[1], d[2], d[3]) !== 'RIFF') return null;
  const dv = new DataView(d.buffer, d.byteOffset, d.byteLength);
  let o = 12, channels = 1, rate = 11025, bits = 8;
  let data: Uint8Array | null = null;
  while (o + 8 <= d.length) {
    const id = String.fromCharCode(d[o], d[o + 1], d[o + 2], d[o + 3]);
    const size = dv.getUint32(o + 4, true);
    if (id === 'fmt ') {
      channels = dv.getUint16(o + 10, true);
      rate = dv.getUint32(o + 12, true);
      bits = dv.getUint16(o + 22, true);
    } else if (id === 'data') data = d.subarray(o + 8, Math.min(d.length, o + 8 + size));
    o += 8 + size + (size & 1);
  }
  if (!data || !data.length) return null;
  const bps = bits >> 3;
  const frames = Math.floor(data.length / (bps * channels));
  if (!frames) return null;
  const buf = ctx.createBuffer(channels, frames, rate);
  for (let c = 0; c < channels; c++) {
    const ch = buf.getChannelData(c);
    for (let i = 0; i < frames; i++) {
      const at = (i * channels + c) * bps;
      ch[i] = bps === 1 ? (data[at] - 128) / 128 : ((data[at] | (data[at + 1] << 8)) << 16 >> 16) / 32768;
    }
  }
  return buf;
}

export class WebAudioOut implements AudioOut {
  private readonly ctx: AudioContext;
  private readonly sfx = new Map<number, AudioBuffer | null>();
  private readonly songs = new Map<number, MidiPlayer | null>();
  private playing = 0;
  private current: MidiPlayer | null = null;
  private readonly onSongEnd: (id: number) => void;

  constructor(ctx: AudioContext, onSongEnd: (id: number) => void) {
    this.ctx = ctx;
    this.onSongEnd = onSongEnd;
  }

  sfxLoad(id: number, data: Uint8Array): void { this.sfx.set(id, decode_wav(this.ctx, data)); }

  sfxPlay(id: number, volume: number, _pitch: number, panpot: number, mono: boolean): void {
    const buffer = this.sfx.get(id);
    const ctx = this.ctx;
    if (!buffer || this.playing >= MAX_CHANNELS) return;
    const src = ctx.createBufferSource();
    src.buffer = buffer;
    const vol = Math.max(0, Math.min(128, volume)) / 128;
    const split = ctx.createChannelSplitter(2);
    const merge = ctx.createChannelMerger(2);
    const left = ctx.createGain(), right = ctx.createGain();
    const l = mono ? 1 : panpot / 255, r = mono ? 1 : (255 - panpot) / 255;
    left.gain.value = vol * l;
    right.gain.value = vol * r;
    src.connect(split);
    split.connect(left, 0);
    split.connect(right, buffer.numberOfChannels > 1 ? 1 : 0);
    left.connect(merge, 0, 0);
    right.connect(merge, 0, 1);
    merge.connect(ctx.destination);
    this.playing++;
    src.onended = () => {
      this.playing--;
      merge.disconnect();
    };
    src.start();
  }

  songLoad(id: number, data: Uint8Array): void {
    const midi = load_hmi(data);
    this.songs.set(id, midi ? new MidiPlayer(this.ctx, midi) : null);
  }

  songPlay(id: number, volume: number): void {
    const p = this.songs.get(id);
    if (!p) {
      this.onSongEnd(id);
      return;
    }
    if (this.current && this.current !== p) this.current.stop(0);
    this.current = p;
    p.play(volume);
    const watch = (): void => {
      if (this.current !== p) return;
      if (!p.playing()) this.onSongEnd(id);
      else setTimeout(watch, 250);
    };
    setTimeout(watch, 250);
  }

  songStop(id: number): void { this.songs.get(id)?.stop(100); }
  songVolume(id: number, volume: number): void { this.songs.get(id)?.set_volume(volume); }
  songFree(id: number): void {
    const p = this.songs.get(id);
    if (p && this.current === p) this.current = null;
    this.songs.delete(id);
  }

  close(): void {
    this.current?.stop(0);
    MidiPlayer.stopAll();
  }
}
