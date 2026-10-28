// sdlport/sound.cpp: sound effects (WAV) and music (HMI, converted to MIDI by hmi.ts and played by
// midi.ts). The original's files (data/sfx/, data/music/ of the reference tarball) are not free and
// not part of the port: without them, sound is off exactly as in the original without its sfx/
// directory. Put them into the data pack (re/abuse/tools/pack.py --sound <dir>) and every call below
// plays them, with the original's volumes and panning (README.md, "Sound").
//
// The tests switch on `trace`: sound is then on as if the files were there (silent), and every call
// is written down as the oracle's sound layer does (re/abuse/oracle/sound_rec.cpp).
import { DATA_PREFIX, vfsGet, vfsList } from '../rt/vfs.ts';
import { get_filename_prefix } from '../imlib/specs.ts';

export const SFX_INITIALIZED = 1, MUSIC_INITIALIZED = 2;

/** the page's side of the sound layer (rt/audio.ts plays WAVs and, through hmi.ts and midi.ts, HMI) */
export interface AudioOut {
  sfxLoad(id: number, data: Uint8Array): void;
  /** volume 0..127 (more is clipped as SDL_mixer does), panpot 0 right .. 128 centre .. 255 left */
  sfxPlay(id: number, volume: number, pitch: number, panpot: number, mono: boolean): void;
  songLoad(id: number, data: Uint8Array): void;
  songPlay(id: number, volume: number): void;
  songStop(id: number): void;
  songVolume(id: number, volume: number): void;
  songFree(id: number): void;
}
let next_id = 1;
/** songs the page reported as finished (Mix_PlayingMusic() then returns 0) */
export const songs_ended = new Set<number>();

export const S = {
  /** sound_avail (loader2.cpp) */
  sound_avail: 0,
  sfx_volume: 127,
  music_volume: 127,
  nosound: false,
  mono: false,
  /** the tests' recorder: sound on without files, every call written down */
  trace: null as ((line: string) => void) | null,
  /** where the sounds go: the page's audio (rt/audio.ts, through the worker's messages), or null */
  out: null as AudioOut | null,
  sfx_file_ok(filename: string): boolean {
    if (S.trace) return true;
    const d = vfsGet(path(filename));
    if (!d) return false;
    if (String.fromCharCode(d[0], d[1], d[2], d[3]) !== 'RIFF') throw new Error(`File ${filename} is not a WAV file`);
    return true;
  },
};

function path(filename: string): string {
  return filename[0] === '/' ? filename : (get_filename_prefix() ?? DATA_PREFIX) + filename;
}

let sound_enabled = 0;

/** sound_init: on if the sfx directory is there (here: any file under sfx/ in the data) */
export function sound_init(): number {
  sound_enabled = 0;
  if (S.nosound) return 0;
  if (S.trace) {
    sound_enabled = SFX_INITIALIZED | MUSIC_INITIALIZED;
    return sound_enabled;
  }
  if (!vfsList((get_filename_prefix() ?? DATA_PREFIX) + 'sfx/').length) return 0;
  sound_enabled = SFX_INITIALIZED | MUSIC_INITIALIZED;
  return sound_enabled;
}

export function sound_uninit(): void {
  sound_enabled = 0;
}

export class sound_effect {
  name: string;
  private id = 0;

  constructor(filename: string) {
    this.name = filename;
    if (!sound_enabled) return;
    if (S.trace) {
      S.trace(`S load ${filename}`);
      return;
    }
    const d = vfsGet(path(filename));
    if (d && S.out) {
      this.id = next_id++;
      S.out.sfxLoad(this.id, d);
    }
  }

  /** panpot: 0 right .. 128 centre .. 255 left (Mix_SetPanning(channel, panpot, 255 - panpot)) */
  play(volume = 127, pitch = 128, panpot = 128): void {
    if (!sound_enabled) return;
    if (S.trace) {
      S.trace(`S play ${this.name} ${volume} ${pitch} ${panpot}`);
      return;
    }
    if (this.id && S.out) S.out.sfxPlay(this.id, volume, pitch, panpot & 0xff, S.mono);
  }
}

export class song {
  Name: string;
  song_id = 0;
  private id = 0;

  constructor(filename: string) {
    this.Name = filename;
    if (S.trace) {
      S.trace(`M load ${filename}`);
      return;
    }
    const d = vfsGet(path(filename));
    if (!d || !S.out) return;
    this.id = next_id++;
    S.out.songLoad(this.id, d);
  }

  name(): string { return this.Name; }

  play(volume = 127): void {
    this.song_id = 1;
    if (S.trace) {
      S.trace(`M play ${this.Name} ${volume & 0xff}`);
      return;
    }
    if (this.id && S.out) {
      songs_ended.delete(this.id);
      S.out.songPlay(this.id, volume & 0xff);
    }
  }

  stop(): void {
    this.song_id = 0;
    if (S.trace) {
      S.trace(`M stop ${this.Name}`);
      return;
    }
    if (this.id && S.out) S.out.songStop(this.id);
  }

  /** Mix_PlayingMusic(); the recorder plays until stopped, as the oracle's */
  playing(): number {
    if (S.trace) return this.song_id !== 0 ? 1 : 0;
    if (!this.id) return 0;
    return this.song_id !== 0 && !songs_ended.has(this.id) ? 1 : 0;
  }

  set_volume(volume: number): void {
    if (S.trace) {
      S.trace(`M volume ${this.Name} ${volume}`);
      return;
    }
    if (this.id && S.out) S.out.songVolume(this.id, volume);
  }

  /** ~song */
  destroy(): void {
    if (this.playing()) this.stop();
    if (this.id && S.out) S.out.songFree(this.id);
  }
}
