// The PC-speaker tune player from src/swsound.c (playnote): notes a-g with
// `<>` octaves, `+`/`-` accidentals, `.` dotted notes, digits for the
// duration and `/` between notes. The original updates at 18.2 Hz; the port
// schedules the same sequence through a WebAudio square wave.

export const DEFAULT_TUNE =
  '<b4/>d8/d2/r16/c8/<b8/a8/b4./>c4./c+4./d4./'
  + 'e4/g8/g2/r16/a8/g8/e8/d2./'
  + '<b4/>d8/d2/r16/c8/<b8/a8/b4./>c4./c+4./d4./'
  + 'e4/a8/a2/r16/g8/f+8/e8/d2./'
  + 'd8/g2/r16/g8/g+2/r16/g+8/a2/r16/a8/>c2/<r16/'
  + 'b8/a8/g8/b4/g8/b4/g8/a4./g1/';

const NOTEFREQ = [523, 554, 587, 622, 659, 698, 740, 784, 831, 880, 932, 988];
const NOTEINDEX: Record<string, number> = { A: 9, B: 11, C: 0, D: 2, E: 4, F: 5, G: 7 };

export interface Note { hz: number; seconds: number }

export class TuneReader {
  private place = 0;
  private octavefactor = 256;
  private readonly tune: string;

  constructor(tune: string) { this.tune = tune; }

  next(): Note | null {
    if (!this.tune) return null;
    let firstplace = true;
    let noteletter = '';
    let index = 0;
    let indexadj = 0;
    let dotted = 2;
    let noteoctavefactor = 256;
    let durstring = '';
    let sawNote = false;
    for (;;) {
      if (!this.place) this.octavefactor = 256;
      const ch = (this.tune[this.place++] ?? '').toUpperCase();
      if (!ch) {
        this.place = 0;
        if (firstplace) continue;
        break;
      }
      firstplace = false;
      if (ch === '/') break;
      if (/[A-G]/.test(ch)) {
        index = NOTEINDEX[ch] ?? 0;
        noteletter = ch;
        sawNote = true;
      } else if (ch === '>') this.octavefactor <<= 1;
      else if (ch === '<') this.octavefactor >>= 1;
      else if (ch === '+') indexadj++;
      else if (ch === '-') indexadj--;
      else if (ch === '.') dotted = 3;
      else if (/\d/.test(ch)) durstring += ch;
      else if (ch === 'R') { noteletter = 'R'; sawNote = true; }
    }
    if (!sawNote && !noteletter) return null;
    let duration = Number(durstring || '4');
    if (duration <= 0) duration = 4;
    const ticks = Math.trunc((1440 * dotted / (60 * duration)) / 2);
    if (noteletter === 'R') return { hz: 0, seconds: ticks / 18.2 };
    index += indexadj;
    while (index < 0) { index += 12; noteoctavefactor /= 2; }
    while (index >= 12) { index -= 12; noteoctavefactor *= 2; }
    let freq = NOTEFREQ[index] ?? 523;
    freq = (freq * this.octavefactor) >> 8;
    freq = (freq * noteoctavefactor) >> 8;
    // Speaker_Output(count) uses 1193280/count while playnote builds a
    // 1331000/freq count; the resulting tone is ~0.896 * freq.
    return { hz: Math.max(20, freq * 0.896), seconds: ticks / 18.2 };
  }
}

export class TunePlayer {
  private osc: OscillatorNode | null = null;
  private gain: GainNode | null = null;
  private timer: number | null = null;
  private reader: TuneReader | null = null;
  private generation = 0;
  private readonly ctx: AudioContext;
  private readonly volume: number;

  constructor(ctx: AudioContext, volume = 0.035) { this.ctx = ctx; this.volume = volume; }

  start(tune: string): void {
    this.stop();
    if (!tune) return;
    try {
      this.reader = new TuneReader(tune);
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();
      osc.type = 'square';
      gain.gain.value = this.volume;
      osc.connect(gain);
      gain.connect(this.ctx.destination);
      osc.start();
      this.osc = osc;
      this.gain = gain;
      this.generation++;
      this.play(this.generation);
    } catch {
      this.stop();
    }
  }

  private play(generation: number): void {
    if (generation !== this.generation || !this.reader || !this.osc || !this.gain) return;
    const n = this.reader.next();
    if (!n) { this.stop(); return; }
    const now = this.ctx.currentTime;
    if (n.hz === 0) {
      this.gain.gain.setTargetAtTime(0.00001, now, 0.005);
    } else {
      this.gain.gain.setTargetAtTime(this.volume, now, 0.005);
      this.osc.frequency.setValueAtTime(n.hz, now);
    }
    this.timer = window.setTimeout(() => this.play(generation), Math.max(20, n.seconds * 1000));
  }

  stop(): void {
    this.generation++;
    if (this.timer !== null) { window.clearTimeout(this.timer); this.timer = null; }
    try { this.osc?.stop(); } catch { /* already stopped */ }
    try { this.gain?.disconnect(); } catch { /* disconnected */ }
    this.osc = null;
    this.gain = null;
    this.reader = null;
  }
}
