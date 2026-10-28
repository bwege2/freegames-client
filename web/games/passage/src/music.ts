// musicPlayer.cpp, Timbre.cpp, Envelope.cpp: the song is an image (music.tga): x is time in quarter
// seconds, y is pitch in a major scale, four bands of rows are four timbres, green is the left and red
// the right channel's loudness. It is synthesized at 22050 Hz from wavetables, in blocks, as SDL's
// audio callback did; fill() is that callback, sample for sample.
import { GlibcRand, RAND_MAX } from './glibcRand.ts';
import type { Image } from './assets.ts';

export const SAMPLE_RATE = 22050;
const GRID_STEP_DURATION = 0.25;
const GRID_STEP_SAMPLES = Math.trunc(GRID_STEP_DURATION * SAMPLE_RATE);
const KEY_FREQUENCY = 261.63;
const NUM_TIMBRES = 4;

const TWELFTH_ROOT_OF_TWO = Math.pow(2, 1.0 / 12);
const HALFSTEP_MAP = [0, 2, 4, 5, 7, 9, 11];

function getFrequency(base: number, scaleNote: number): number {
  const octavesUp = Math.trunc(scaleNote / 7);
  const halfsteps = HALFSTEP_MAP[scaleNote % 7] + octavesUp * 12;
  return base * Math.pow(TWELFTH_ROOT_OF_TWO, halfsteps);
}

/** C's (Sint16)( double ): truncate toward zero, wrap to 16 bits */
const toInt16 = (v: number) => (Math.trunc(v) << 16) >> 16;

class Timbre {
  readonly tables: Int16Array[] = [];

  constructor(loudness: number, base: number, entries: number, wave: (t: number) => number) {
    for (let i = 0; i < entries; i++) {
      const freq = getFrequency(base, i);
      const period = 1.0 / freq;
      const length = Math.trunc(5 * period * SAMPLE_RATE);
      const temp = new Float64Array(length);
      let maxValue = 0;
      for (let s = 0; s < length; s++) {
        const t = s / SAMPLE_RATE;
        const v = wave(2 * Math.PI * t * freq);
        temp[s] = v;
        if (v > maxValue) maxValue = v;
        else if (-v > maxValue) maxValue = -v;
      }
      const table = new Int16Array(length);
      for (let s = 0; s < length; s++) table[s] = toInt16(32767 * (temp[s] * loudness / maxValue));
      this.tables.push(table);
    }
  }
}

class Envelope {
  private readonly envelopes: Float64Array[] = [];

  constructor(attack: number, decay: number, sustain: number, release: number, maxNoteLength: number) {
    for (let i = 0; i < maxNoteLength; i++) {
      const length = (i + 1) * GRID_STEP_SAMPLES;
      const e = new Float64Array(length);
      for (let s = 0; s < length; s++) {
        const t = s / (length - 1);
        if (t < attack) e[s] = t / attack;
        else if (t < attack + decay) e[s] = (1.0 - sustain) * (attack + decay - t) / decay + sustain;
        else if (1.0 - t > release) e[s] = sustain;
        else e[s] = release > 0 ? sustain - sustain * (release - (1.0 - t)) / release : sustain;
      }
      this.envelopes.push(e);
    }
  }

  get(noteLengthInGridSteps: number): Float64Array {
    return this.envelopes[noteLengthInGridSteps - 1];
  }
}

interface Note {
  timbre: number;
  envelope: number;
  scaleNote: number;
  loudnessLeft: number;
  loudnessRight: number;
  currentSample: number;
  numSamples: number;
}

const N_LIMIT = 40;
const squareWave = (t: number) => { let sum = 0; for (let n = 1; n < N_LIMIT; n += 2) sum += 1.0 / n * Math.sin(n * t); return sum; };
const sawWave = (t: number) => { let sum = 0; for (let n = 1; n < N_LIMIT; n++) sum += 1.0 / n * Math.sin(n * t); return sum; };

export class MusicPlayer {
  private readonly w: number;
  private readonly h: number;
  private readonly grid: (Note | null)[][];
  private readonly timbres: Timbre[] = [];
  private readonly envelopes: Envelope[] = [];
  private streamSamples = 0;
  private playing: Note[] = [];
  /** setMusicLoudness(): 0..1 */
  loudness = 1.0;

  constructor(music: Image) {
    this.w = music.w;
    this.h = music.h;
    const w = music.w, h = music.h;
    const inv255 = 1.0 / 255.0;
    const red = new Float64Array(w * h), green = new Float64Array(w * h);
    for (let i = 0; i < w * h; i++) {
      red[i] = inv255 * music.rgb[i * 3];
      green[i] = inv255 * music.rgb[i * 3 + 1];
    }
    const heightPerTimbre = Math.trunc((h + 1) / NUM_TIMBRES) - 1;
    const noteNumber = (y: number) => (h - y - 1) % (heightPerTimbre + 1);
    const isNote = (x: number, y: number) => noteNumber(y) < heightPerTimbre && (red[y * w + x] > 0 || green[y * w + x] > 0);

    // the loudest column sets the scale of every timbre
    let maxColumn = 0;
    for (let x = 0; x < w; x++) {
      let l = 0, r = 0;
      for (let y = 0; y < h; y++) if (isNote(x, y)) { l += green[y * w + x]; r += red[y * w + x]; }
      if (maxColumn < l) maxColumn = l;
      if (maxColumn < r) maxColumn = r;
    }
    const loudnessPerTimbre = 1.0 / maxColumn;
    const rand = new GlibcRand();
    const whiteNoise = () => 2.0 * (rand.next() / RAND_MAX) - 1.0;
    let lastSample = 0;
    const smoothedWhiteNoise = () => (lastSample = (2 * lastSample + whiteNoise()) / 3);
    this.timbres.push(new Timbre(0.6 * loudnessPerTimbre, KEY_FREQUENCY, heightPerTimbre, sawWave));
    this.timbres.push(new Timbre(loudnessPerTimbre, KEY_FREQUENCY, heightPerTimbre, Math.sin));
    this.timbres.push(new Timbre(0.4 * loudnessPerTimbre, KEY_FREQUENCY / 4, heightPerTimbre, squareWave));
    this.timbres.push(new Timbre(0.75 * loudnessPerTimbre, KEY_FREQUENCY / 4, heightPerTimbre, smoothedWhiteNoise));

    let maxNoteLength = 0;
    for (let y = 0; y < h; y++) {
      let current = 0;
      for (let x = 0; x < w; x++) {
        current = isNote(x, y) ? current + 1 : 0;
        if (current > maxNoteLength) maxNoteLength = current;
      }
    }
    this.envelopes.push(new Envelope(0.05, 0.7, 0.25, 0.1, maxNoteLength));
    this.envelopes.push(new Envelope(0.1, 0.9, 0.0, 0.0, maxNoteLength));
    this.envelopes.push(new Envelope(0.25, 0.0, 1.0, 0.1, maxNoteLength));
    this.envelopes.push(new Envelope(0.0, 0.2, 0.0, 0.0, maxNoteLength));

    // a run of lit pixels in a row is one note, starting at its first column
    this.grid = [];
    for (let y = 0; y < h; y++) {
      const row: (Note | null)[] = new Array(w).fill(null);
      let start: Note | null = null;
      for (let x = 0; x < w; x++) {
        if (isNote(x, y)) {
          if (start) start.numSamples += GRID_STEP_SAMPLES;
          else {
            const timbre = Math.trunc(y / (heightPerTimbre + 1));
            start = row[x] = {
              timbre, envelope: timbre, scaleNote: noteNumber(y), loudnessLeft: green[y * w + x], loudnessRight: red[y * w + x],
              currentSample: 0, numSamples: GRID_STEP_SAMPLES,
            };
          }
        } else start = null;
      }
      this.grid.push(row);
    }
  }

  /** restartMusic(): back to the start of the song, silence what plays */
  restart(): void {
    this.streamSamples = 0;
    this.playing = [];
  }

  /** audioCallback(): the next n stereo samples */
  fill(left: Int16Array, right: Int16Array, n: number): void {
    left.fill(0, 0, n);
    right.fill(0, 0, n);
    // notes that start in this block, at the grid steps that fall into it
    let first = this.streamSamples % GRID_STEP_SAMPLES;
    if (first !== 0) first = GRID_STEP_SAMPLES - first;
    for (let i = first; i < n; i += GRID_STEP_SAMPLES) {
      const x = Math.trunc((this.streamSamples + i) / GRID_STEP_SAMPLES) % this.w;
      for (let y = 0; y < this.h; y++) {
        const note = this.grid[y][x];
        if (!note) continue;
        this.playing.push(note);
        note.currentSample = -i;
      }
    }
    this.streamSamples += n;

    for (let k = 0; k < this.playing.length; k++) {
      const note = this.playing[k];
      const table = this.timbres[note.timbre].tables[note.scaleNote];
      const env = this.envelopes[note.envelope].get(Math.trunc(note.numSamples / GRID_STEP_SAMPLES));
      const loudL = note.loudnessLeft * this.loudness, loudR = note.loudnessRight * this.loudness;
      let start = 0, end = n;
      if (note.currentSample < 0) {
        start = -note.currentSample;
        note.currentSample = 0;
      }
      let endNote = false;
      const left_ = note.numSamples - note.currentSample;
      if (start + left_ < end) {
        end = start + left_;
        endNote = true;
      }
      let pos = note.currentSample % table.length;
      let cur = note.currentSample;
      for (let i = start; i !== end; i++) {
        const mono = env[cur] * table[pos];
        left[i] = left[i] + toInt16(loudL * mono); // Sint16 += (Sint16)( ... ): wraps
        right[i] = right[i] + toInt16(loudR * mono);
        cur++;
        if (++pos === table.length) pos = 0;
      }
      note.currentSample += end - start;
      if (endNote) {
        this.playing.splice(k, 1);
        k--;
      }
    }
  }
}

/** SDL asked for 512-sample blocks at 22050 Hz; browsers play at their own rate: blocks, resampled linearly. */
export class Resampler {
  private readonly player: MusicPlayer;
  private readonly ratio: number;
  private readonly bl = new Int16Array(512);
  private readonly br = new Int16Array(512);
  private blockStart = -512;
  private prevL = 0;
  private prevR = 0;
  private t = 0;

  constructor(player: MusicPlayer, outputRate: number) {
    this.player = player;
    this.ratio = SAMPLE_RATE / outputRate;
  }

  /** after restartMusic(): the next block starts the song */
  reset(): void {
    this.blockStart = -512;
    this.prevL = this.prevR = 0;
    this.t = 0;
  }

  render(outL: Float32Array, outR: Float32Array): void {
    for (let k = 0; k < outL.length; k++) {
      while (this.t >= this.blockStart + 512) {
        this.prevL = this.bl[511];
        this.prevR = this.br[511];
        this.player.fill(this.bl, this.br, 512);
        this.blockStart += 512;
        if (this.blockStart === 0) this.prevL = this.prevR = 0;
      }
      const whole = Math.floor(this.t), f = this.t - whole, i = whole - this.blockStart;
      const aL = i > 0 ? this.bl[i - 1] : this.prevL, aR = i > 0 ? this.br[i - 1] : this.prevR;
      outL[k] = (aL + (this.bl[i] - aL) * f) / 32768;
      outR[k] = (aR + (this.br[i] - aR) * f) / 32768;
      this.t += this.ratio;
    }
  }
}
