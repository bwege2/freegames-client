// caudio.c with the OpenAL device of oalaudio.c: the sound table from sounds.txt (several files per
// sound picked at random, "file,gain,loop"), a ring of 16 sources, looping sounds kept while the
// server keeps asking for them. The browser plays the files with Web Audio (sys.playSound).
import { G } from './G.ts';
import { SOUND_NAMES, MAX_SOUNDS } from './consts.ts';
import { MIN, ABS, atof, atoi, latin1, onReset } from './cutil.ts';
import { error, warn } from './error.ts';
import { sys } from './sys.ts';
import { randomMT } from './xpmath.ts';
import { SND } from './default.ts';

const MAX_RANDOM_SOUNDS = 6;
const NUM_SOURCES = 16;
const VOL_THRESHOLD = 10;

interface sample_t { file: string; gain: number; loop: boolean }
interface sound_t { sample: sample_t | null; volume: number; updated: number; source: number; next: number }

const A = {
  audioEnabled: false,
  table: [] as { filenames: string[] | null; priv: (sample_t | null)[]; nsounds: number }[],
  soundinfo: [] as sound_t[],
  ring: 0,
  looping: -1,
};
onReset(() => Object.assign(A, { audioEnabled: false, table: [], soundinfo: [], ring: 0, looping: -1 }));

function audioIsEnabled(): boolean {
  return A.audioEnabled && SND.sound && SND.maxVolume > 0;
}

const SOUNDDIR = 'sound/';

export function audioInit(): void {
  A.table = Array.from({ length: MAX_SOUNDS }, () => ({ filenames: null, priv: [], nsounds: 0 }));
  const data = sys.libFile(SND.soundFile);
  if (!data) {
    error(`Could not open soundfile ${SND.soundFile}`);
    return;
  }
  for (const raw of latin1(data).split('\n')) {
    const buf = raw + '\n';
    if (buf[0] === '\n' || buf[0] === '#') continue;
    // strtok(buf, " \t") and strtok(NULL, " \t\n")
    const m = /^[ \t]*([^ \t]*)[ \t]*([^ \t\n]*)/.exec(buf)!;
    const soundstr = m[1], file = m[2];
    const i = SOUND_NAMES.indexOf(soundstr);
    if (i >= 0) {
      const t = A.table[i];
      t.filenames = [];
      t.priv = new Array(MAX_RANDOM_SOUNDS).fill(null);
      for (const ifile of file.split(/[ \t\n|]+/).filter((f) => f.length).slice(0, MAX_RANDOM_SOUNDS)) {
        t.filenames.push(ifile[0] === '/' ? ifile : SOUNDDIR + ifile);
      }
      t.nsounds = t.filenames.length;
    } else warn(`audioInit: Unknown sound '${soundstr}' (ignored)`);
  }
  A.soundinfo = Array.from({ length: NUM_SOURCES }, (_, k) => ({ sample: null, volume: 0, updated: 0, source: k, next: (k + 1) % NUM_SOURCES }));
  A.ring = 0;
  A.looping = -1;
  A.audioEnabled = true;
}

export function audioCleanup(): void {
  for (const s of A.soundinfo) sys.stopSound(s.source);
  A.table = [];
}

export function audioEvents(): void { /* nothing, as the OpenAL device */ }

export function audioUpdate(): void {
  if (!audioIsEnabled()) return;
  let prev = -1;
  for (let iter = A.looping; iter >= 0;) {
    const s = A.soundinfo[iter];
    if (s.updated < G.loops - 1) {
      sys.stopSound(s.source);
      const nxt = s.next;
      if (prev >= 0) A.soundinfo[prev].next = nxt;
      else A.looping = nxt;
      s.next = A.soundinfo[A.ring].next;
      A.soundinfo[A.ring].next = iter;
      iter = nxt;
    } else {
      prev = iter;
      iter = s.next;
    }
  }
}

function sample_load(filename: string): sample_t {
  const parts = filename.split(',');
  const sample: sample_t = { file: parts[0], gain: 1.0, loop: false };
  if (parts.length > 1) sample.gain = atof(parts[1]);
  if (parts.length > 2) sample.loop = atoi(parts[2]) !== 0;
  return sample;
}

function audioDevicePlay(filename: string, volume: number, slot: { t: { priv: (sample_t | null)[] }; k: number }): void {
  let sample = slot.t.priv[slot.k];
  if (!sample) {
    sample = sample_load(filename);
    slot.t.priv[slot.k] = sample;
  }
  if (sample.loop) {
    for (let iter = A.looping; iter >= 0; iter = A.soundinfo[iter].next) {
      const s = A.soundinfo[iter];
      if (s.sample === sample && ABS(s.volume - volume) < VOL_THRESHOLD) {
        sys.setSoundGain(s.source, (sample.gain * volume) / 100);
        s.volume = volume;
        s.updated = G.loops;
        return;
      }
    }
  }
  const ring = A.soundinfo[A.ring];
  if (ring.next === A.ring) return;
  const n = ring.next;
  const next = A.soundinfo[n];
  if (sample.loop) {
    ring.next = next.next;
    next.next = A.looping;
    A.looping = n;
  } else A.ring = n;
  next.sample = sample;
  next.volume = volume;
  next.updated = G.loops;
  sys.playSound(next.source, sample.file, (sample.gain * volume) / 100, sample.loop);
}

export function Handle_audio(type: number, volume: number): number {
  let pick = 0;
  const t = A.table[type];
  if (!audioIsEnabled() || !t || !t.filenames) return 0;
  if (t.nsounds > 1) pick = randomMT() % t.nsounds;
  if (!t.priv[pick]) {
    for (let i = 0; i < MAX_SOUNDS; i++) {
      const o = A.table[i];
      if (i !== type && o.filenames && o.priv[pick] && t.filenames[0] === o.filenames[0]) {
        t.priv[0] = o.priv[0];
        break;
      }
    }
  }
  if (pick >= t.nsounds) return 0;
  audioDevicePlay(t.filenames[pick], MIN(volume, SND.maxVolume), { t, k: pick });
  return 0;
}
