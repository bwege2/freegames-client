// A FastTracker 2 module (.xm) player for the 2-player music (snd/frozen-mainzik-2p.xm), which the
// original plays through SDL_mixer's MikMod. DOM-free: the audio worklet (xm.worklet.ts) runs it.
// Linear frequencies, instrument envelopes and fadeout, auto-vibrato, the effect and volume columns.

interface Sample {
  data: Float32Array; loopStart: number; loopLen: number; loopType: number;
  volume: number; finetune: number; panning: number; relnote: number;
}
interface Envelope { points: [number, number][]; sustain: number; loopStart: number; loopEnd: number; on: boolean; sus: boolean; loop: boolean }
interface Instrument {
  samples: Sample[]; keymap: Uint8Array; vol: Envelope; pan: Envelope; fadeout: number;
  vibType: number; vibSweep: number; vibDepth: number; vibRate: number;
}
interface Cell { note: number; inst: number; vol: number; eff: number; param: number }

export interface Song {
  channels: number; order: number[]; restart: number; patterns: Cell[][][]; instruments: Instrument[];
  linear: boolean; tempo: number; bpm: number;
}

export function parseXM(b: Uint8Array): Song {
  const dv = new DataView(b.buffer, b.byteOffset, b.byteLength);
  const u8 = (o: number): number => b[o], u16 = (o: number): number => dv.getUint16(o, true), u32 = (o: number): number => dv.getUint32(o, true);
  const hsize = u32(60);
  const len = u16(64), restart = u16(66), channels = u16(68), npat = u16(70), ninst = u16(72), flags = u16(74);
  const tempo = u16(76), bpm = u16(78);
  const order: number[] = [];
  for (let i = 0; i < len; i++) order.push(u8(80 + i));
  let p = 60 + hsize;
  const patterns: Cell[][][] = [];
  for (let i = 0; i < npat; i++) {
    const plen = u32(p), rows = u16(p + 5), psize = u16(p + 7);
    p += plen;
    const pat: Cell[][] = [];
    let q = p;
    for (let r = 0; r < rows; r++) {
      const row: Cell[] = [];
      for (let c = 0; c < channels; c++) {
        const cell: Cell = { note: 0, inst: 0, vol: 0, eff: 0, param: 0 };
        if (psize) {
          const k = u8(q++);
          if (k & 0x80) {
            if (k & 1) cell.note = u8(q++);
            if (k & 2) cell.inst = u8(q++);
            if (k & 4) cell.vol = u8(q++);
            if (k & 8) cell.eff = u8(q++);
            if (k & 16) cell.param = u8(q++);
          } else {
            cell.note = k; cell.inst = u8(q++); cell.vol = u8(q++); cell.eff = u8(q++); cell.param = u8(q++);
          }
        }
        row.push(cell);
      }
      pat.push(row);
    }
    if (!rows) for (let r = 0; r < 64; r++) pat.push(Array.from({ length: channels }, () => ({ note: 0, inst: 0, vol: 0, eff: 0, param: 0 })));
    patterns.push(pat);
    p += psize;
  }
  const instruments: Instrument[] = [];
  for (let i = 0; i < ninst; i++) {
    const isize = u32(p), ns = u16(p + 27);
    const inst: Instrument = {
      samples: [], keymap: new Uint8Array(96), fadeout: 0, vibType: 0, vibSweep: 0, vibDepth: 0, vibRate: 0,
      vol: { points: [], sustain: 0, loopStart: 0, loopEnd: 0, on: false, sus: false, loop: false },
      pan: { points: [], sustain: 0, loopStart: 0, loopEnd: 0, on: false, sus: false, loop: false },
    };
    if (ns > 0) {
      inst.keymap = b.slice(p + 33, p + 33 + 96);
      const env = (off: number, n: number, sus: number, ls: number, le: number, type: number): Envelope => {
        const points: [number, number][] = [];
        for (let k = 0; k < Math.min(n, 12); k++) points.push([u16(off + k * 4), u16(off + k * 4 + 2)]);
        return { points, sustain: sus, loopStart: ls, loopEnd: le, on: !!(type & 1), sus: !!(type & 2), loop: !!(type & 4) };
      };
      inst.vol = env(p + 129, u8(p + 225), u8(p + 227), u8(p + 228), u8(p + 229), u8(p + 233));
      inst.pan = env(p + 177, u8(p + 226), u8(p + 230), u8(p + 231), u8(p + 232), u8(p + 234));
      inst.vibType = u8(p + 235); inst.vibSweep = u8(p + 236); inst.vibDepth = u8(p + 237); inst.vibRate = u8(p + 238);
      inst.fadeout = u16(p + 239);
    }
    p += isize;
    const heads: { len: number; ls: number; ll: number; vol: number; fine: number; type: number; pan: number; rel: number }[] = [];
    for (let s = 0; s < ns; s++) {
      heads.push({ len: u32(p), ls: u32(p + 4), ll: u32(p + 8), vol: u8(p + 12), fine: dv.getInt8(p + 13), type: u8(p + 14), pan: u8(p + 15), rel: dv.getInt8(p + 16) });
      p += 40;
    }
    for (const h of heads) {
      const sixteen = (h.type & 16) !== 0;
      const n = sixteen ? h.len >> 1 : h.len;
      const data = new Float32Array(n);
      let acc = 0;
      for (let k = 0; k < n; k++) {
        if (sixteen) { acc = (acc + dv.getInt16(p + k * 2, true)) << 16 >> 16; data[k] = acc / 32768; }
        else { acc = (acc + dv.getInt8(p + k)) << 24 >> 24; data[k] = acc / 128; }
      }
      p += h.len;
      const div = sixteen ? 2 : 1;
      inst.samples.push({ data, loopStart: h.ls / div, loopLen: h.ll / div, loopType: h.ll ? h.type & 3 : 0, volume: h.vol, finetune: h.fine, panning: h.pan, relnote: h.rel });
    }
    instruments.push(inst);
  }
  return { channels, order, restart, patterns, instruments, linear: (flags & 1) === 1, tempo, bpm };
}

const SINE = Array.from({ length: 64 }, (_, i) => Math.round(Math.sin(i * Math.PI / 32) * 255));

class Channel {
  inst: Instrument | null = null;
  sample: Sample | null = null;
  pos = 0; dir = 1; playing = false;
  note = 0; period = 0; targetPeriod = 0; basePeriod = 0;
  vol = 0; pan = 128; finetune = 0; relnote = 0;
  keyOn = false; fade = 65536;
  envTick = 0; panEnvTick = 0;
  autoVibPos = 0; autoVibSweep = 0;
  vibPos = 0; vibSpeed = 0; vibDepth = 0; tremPos = 0; tremSpeed = 0; tremDepth = 0;
  portaSpeed = 0; portaUp = 0; portaDown = 0; volSlide = 0; finePortaUp = 0; finePortaDown = 0; fineVolUp = 0; fineVolDown = 0;
  panSlide = 0; globalSlide = 0; retrig = 0; offset = 0; xfUp = 0; xfDown = 0;
  loopRow = 0; loopCount = 0;
  vibOff = 0; tremOff = 0; arp = 0;
  noteDelay = -1; cutTick = -1;
  pendingCell: Cell | null = null;
}

export class XMPlayer {
  readonly s: Song;
  private readonly rate: number;
  private ch: Channel[];
  private orderIdx = 0; private row = 0; private tick = 0;
  private speed: number; private bpm: number;
  private globalVol = 64;
  private sampleLeft = 0;
  private jumpTo = -1; private breakRow = -1; private patDelay = 0;
  volume = 1;

  constructor(song: Song, rate: number) {
    this.s = song;
    this.rate = rate;
    this.speed = song.tempo || 6;
    this.bpm = song.bpm || 125;
    this.ch = Array.from({ length: song.channels }, () => new Channel());
  }

  private periodOf(note: number, fine: number): number { return 7680 - note * 64 - fine / 2; }
  private freqOf(period: number): number { return 8363 * Math.pow(2, (4608 - period) / 768); }

  private trigger(c: Channel, cell: Cell): void {
    const s = this.s;
    if (cell.inst) {
      const inst = s.instruments[cell.inst - 1];
      if (inst) {
        c.inst = inst;
        const note = cell.note && cell.note < 97 ? cell.note : c.note;
        const smp = inst.samples[inst.keymap[Math.max(0, note - 1)] ?? 0];
        if (smp) { c.vol = smp.volume; c.pan = smp.panning; c.finetune = smp.finetune; c.relnote = smp.relnote; }
        c.keyOn = true; c.fade = 65536; c.envTick = 0; c.panEnvTick = 0; c.autoVibSweep = 0; c.autoVibPos = 0;
      }
    }
    if (cell.note === 97) { c.keyOn = false; if (!c.inst?.vol.on) c.vol = 0; return; }
    if (cell.note && cell.note < 97 && c.inst) {
      const smp = c.inst.samples[c.inst.keymap[cell.note - 1] ?? 0];
      if (!smp) return;
      const porta = cell.eff === 3 || cell.eff === 5 || (cell.vol >> 4) === 0xf;
      c.note = cell.note;
      const real = cell.note - 1 + c.relnote;
      const per = this.periodOf(real, c.finetune);
      if (porta && c.playing) { c.targetPeriod = per; return; }
      c.sample = smp; c.period = per; c.basePeriod = per; c.targetPeriod = per;
      c.pos = 0; c.dir = 1; c.playing = true;
      if (cell.eff === 9) { if (cell.param) c.offset = cell.param; c.pos = c.offset * 256; }
      c.vibPos = 0; c.tremPos = 0;
    }
  }

  private volColumn(c: Channel, v: number, tick0: boolean): void {
    const hi = v >> 4, lo = v & 15;
    if (tick0) {
      if (v >= 0x10 && v <= 0x50) c.vol = v - 0x10;
      else if (hi === 8) c.vol = Math.max(0, c.vol - lo);
      else if (hi === 9) c.vol = Math.min(64, c.vol + lo);
      else if (hi === 0xa) c.vibSpeed = lo;
      else if (hi === 0xb) { if (lo) c.vibDepth = lo; }
      else if (hi === 0xc) c.pan = lo * 17;
      else if (hi === 0xf) { if (lo) c.portaSpeed = lo * 16; }
    } else {
      if (hi === 6) c.vol = Math.max(0, c.vol - lo);
      else if (hi === 7) c.vol = Math.min(64, c.vol + lo);
      else if (hi === 0xb) this.vibrato(c);
      else if (hi === 0xd) c.pan = Math.max(0, c.pan - lo);
      else if (hi === 0xe) c.pan = Math.min(255, c.pan + lo);
      else if (hi === 0xf) this.tonePorta(c);
    }
  }

  private vibrato(c: Channel): void {
    c.vibOff = SINE[c.vibPos & 63] * c.vibDepth / 32;
    c.vibPos += c.vibSpeed;
  }
  private tonePorta(c: Channel): void {
    if (c.period < c.targetPeriod) c.period = Math.min(c.targetPeriod, c.period + c.portaSpeed);
    else if (c.period > c.targetPeriod) c.period = Math.max(c.targetPeriod, c.period - c.portaSpeed);
  }
  private volSlide(c: Channel): void {
    const up = c.volSlide >> 4, dn = c.volSlide & 15;
    if (up) c.vol = Math.min(64, c.vol + up); else c.vol = Math.max(0, c.vol - dn);
  }

  private row0(): void {
    const s = this.s;
    const pat = s.patterns[s.order[this.orderIdx]] ?? s.patterns[0];
    const row = pat[this.row] ?? pat[0];
    for (let i = 0; i < s.channels; i++) {
      const c = this.ch[i], cell = row[i];
      c.vibOff = 0; c.tremOff = 0; c.arp = 0; c.noteDelay = -1; c.cutTick = -1;
      if (cell.eff === 0xe && (cell.param >> 4) === 0xd && (cell.param & 15)) { c.noteDelay = cell.param & 15; c.pendingCell = cell; }
      else this.trigger(c, cell);
      if (c.noteDelay < 0) this.volColumn(c, cell.vol, true);
      const x = cell.param, xh = x >> 4, xl = x & 15;
      switch (cell.eff) {
        case 1: if (x) c.portaUp = x; break;
        case 2: if (x) c.portaDown = x; break;
        case 3: if (x) c.portaSpeed = x * 4; break;
        case 4: if (xh) c.vibSpeed = xh; if (xl) c.vibDepth = xl; break;
        case 5: case 6: case 0xa: if (x) c.volSlide = x; break;
        case 7: if (xh) c.tremSpeed = xh; if (xl) c.tremDepth = xl; break;
        case 8: c.pan = x; break;
        case 0xb: this.jumpTo = x; this.breakRow = 0; break;
        case 0xc: c.vol = Math.min(64, x); break;
        case 0xd: if (this.jumpTo < 0) this.jumpTo = this.orderIdx + 1; this.breakRow = xh * 10 + xl; break;
        case 0xe:
          if (xh === 1) { if (xl) c.finePortaUp = xl; c.period -= c.finePortaUp * 4; }
          else if (xh === 2) { if (xl) c.finePortaDown = xl; c.period += c.finePortaDown * 4; }
          else if (xh === 6) {
            if (!xl) c.loopRow = this.row;
            else { if (!c.loopCount) c.loopCount = xl; else c.loopCount--; if (c.loopCount) { this.breakRow = c.loopRow; this.jumpTo = this.orderIdx; } }
          } else if (xh === 0xa) { if (xl) c.fineVolUp = xl; c.vol = Math.min(64, c.vol + c.fineVolUp); }
          else if (xh === 0xb) { if (xl) c.fineVolDown = xl; c.vol = Math.max(0, c.vol - c.fineVolDown); }
          else if (xh === 0xc) c.cutTick = xl;
          else if (xh === 0xe) this.patDelay = xl;
          break;
        case 0xf: if (x) { if (x < 32) this.speed = x; else this.bpm = x; } break;
        case 0x10: this.globalVol = Math.min(64, x); break;
        case 0x11: if (x) c.globalSlide = x; break;
        case 0x14: c.keyOn = false; break;
        case 0x15: c.envTick = x; c.panEnvTick = x; break;
        case 0x19: if (x) c.panSlide = x; break;
        case 0x1b: if (x) c.retrig = x; break;
        case 0x21:
          if (xh === 1) { if (xl) c.xfUp = xl; c.period -= c.xfUp; }
          else if (xh === 2) { if (xl) c.xfDown = xl; c.period += c.xfDown; }
          break;
      }
    }
  }

  private tickN(): void {
    const s = this.s;
    const pat = s.patterns[s.order[this.orderIdx]] ?? s.patterns[0];
    const row = pat[this.row] ?? pat[0];
    for (let i = 0; i < s.channels; i++) {
      const c = this.ch[i], cell = row[i];
      if (c.noteDelay === this.tick && c.pendingCell) { this.trigger(c, c.pendingCell); this.volColumn(c, c.pendingCell.vol, true); }
      this.volColumn(c, cell.vol, false);
      const x = cell.param, xh = x >> 4, xl = x & 15;
      switch (cell.eff) {
        case 0: if (x) { const t = this.tick % 3; c.arp = t === 1 ? xh : t === 2 ? xl : 0; } break;
        case 1: c.period = Math.max(1, c.period - c.portaUp * 4); break;
        case 2: c.period += c.portaDown * 4; break;
        case 3: this.tonePorta(c); break;
        case 4: this.vibrato(c); break;
        case 5: this.tonePorta(c); this.volSlide(c); break;
        case 6: this.vibrato(c); this.volSlide(c); break;
        case 7: c.tremOff = SINE[c.tremPos & 63] * c.tremDepth / 64; c.tremPos += c.tremSpeed; break;
        case 0xa: this.volSlide(c); break;
        case 0xe: if (xh === 0xc && this.tick === c.cutTick) c.vol = 0; if (xh === 9 && xl && this.tick % xl === 0) { c.pos = 0; c.dir = 1; } break;
        case 0x11: { const up = c.globalSlide >> 4, dn = c.globalSlide & 15; this.globalVol = up ? Math.min(64, this.globalVol + up) : Math.max(0, this.globalVol - dn); break; }
        case 0x19: { const r = c.panSlide >> 4, l = c.panSlide & 15; c.pan = r ? Math.min(255, c.pan + r) : Math.max(0, c.pan - l); break; }
        case 0x1b: { const iv = c.retrig & 15; if (iv && this.tick % iv === 0) { c.pos = 0; c.dir = 1; } break; }
      }
    }
  }

  private envValue(e: Envelope, tickRef: { t: number }, keyOn: boolean): number {
    const pts = e.points;
    if (!pts.length) return 64;
    let t = tickRef.t;
    if (e.sus && keyOn && pts[e.sustain] && t >= pts[e.sustain][0]) t = pts[e.sustain][0];
    else if (e.loop && pts[e.loopEnd] && t >= pts[e.loopEnd][0]) t = pts[e.loopStart][0];
    tickRef.t = t + 1;
    if (t >= pts[pts.length - 1][0]) return pts[pts.length - 1][1];
    let k = 0;
    while (k < pts.length - 1 && pts[k + 1][0] <= t) k++;
    const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
    return x1 === x0 ? y0 : y0 + (y1 - y0) * (t - x0) / (x1 - x0);
  }

  private advanceTick(): void {
    if (this.tick === 0) this.row0(); else this.tickN();
    for (const c of this.ch) {
      if (!c.inst) continue;
      if (!c.keyOn) c.fade = Math.max(0, c.fade - c.inst.fadeout);
    }
    this.tick++;
    if (this.tick >= this.speed * (1 + this.patDelay)) {
      this.tick = 0;
      this.patDelay = 0;
      if (this.jumpTo >= 0) {
        this.orderIdx = this.jumpTo;
        this.row = this.breakRow >= 0 ? this.breakRow : 0;
        this.jumpTo = -1;
        this.breakRow = -1;
      } else this.row++;
      const pat = this.s.patterns[this.s.order[this.orderIdx]];
      if (!pat || this.row >= pat.length) { this.row = 0; this.orderIdx++; }
      if (this.orderIdx >= this.s.order.length) this.orderIdx = this.s.restart < this.s.order.length ? this.s.restart : 0;
    }
  }

  /** fills stereo buffers */
  render(left: Float32Array, right: Float32Array): void {
    const n = left.length;
    left.fill(0); right.fill(0);
    let i = 0;
    while (i < n) {
      if (this.sampleLeft <= 0) {
        this.advanceTick();
        this.sampleLeft = Math.round(this.rate * 2.5 / this.bpm);
        for (const c of this.ch) this.prepare(c);
      }
      const len = Math.min(this.sampleLeft, n - i);
      for (const c of this.ch) this.mix(c, left, right, i, len);
      i += len;
      this.sampleLeft -= len;
    }
  }

  private prepare(c: Channel & { step?: number; gl?: number; gr?: number }): void {
    if (!c.playing || !c.sample || !c.inst) { c.gl = 0; c.gr = 0; return; }
    const ve = c.inst.vol.on ? this.envValue(c.inst.vol, { get t() { return c.envTick; }, set t(v) { c.envTick = v; } }, c.keyOn) : 64;
    const pe = c.inst.pan.on ? this.envValue(c.inst.pan, { get t() { return c.panEnvTick; }, set t(v) { c.panEnvTick = v; } }, c.keyOn) : 32;
    let vibAuto = 0;
    if (c.inst.vibDepth) {
      c.autoVibSweep = Math.min(c.autoVibSweep + 1, c.inst.vibSweep || 1);
      vibAuto = SINE[c.autoVibPos & 63] / 255 * c.inst.vibDepth * (c.inst.vibSweep ? c.autoVibSweep / c.inst.vibSweep : 1) / 4;
      c.autoVibPos += c.inst.vibRate >> 2 || 1;
    }
    const period = c.period - c.arp * 64 + c.vibOff + vibAuto;
    c.step = this.freqOf(period) / this.rate;
    const v = Math.max(0, Math.min(64, c.vol + c.tremOff)) / 64 * (ve / 64) * (c.inst.vol.on ? c.fade / 65536 : 1) * (this.globalVol / 64);
    const pan = Math.max(0, Math.min(255, c.pan + (pe - 32) * (128 - Math.abs(c.pan - 128)) / 32)) / 255;
    const amp = v * 0.35 * this.volume;
    c.gl = amp * Math.cos(pan * Math.PI / 2);
    c.gr = amp * Math.sin(pan * Math.PI / 2);
  }

  private mix(c: Channel & { step?: number; gl?: number; gr?: number }, L: Float32Array, R: Float32Array, from: number, len: number): void {
    const s = c.sample;
    if (!c.playing || !s || (!c.gl && !c.gr)) return;
    const d = s.data;
    const end = s.loopType ? s.loopStart + s.loopLen : d.length;
    for (let k = 0; k < len; k++) {
      const ip = Math.floor(c.pos);
      if (ip >= end || ip < 0) {
        if (s.loopType === 1) c.pos -= s.loopLen;
        else if (s.loopType === 2) { c.dir = -c.dir; c.pos = c.dir < 0 ? 2 * end - c.pos - 1 : 2 * s.loopStart - c.pos; }
        else { c.playing = false; return; }
        continue;
      }
      const fr = c.pos - ip;
      const a = d[ip] ?? 0, b = d[ip + 1 < end ? ip + 1 : s.loopType === 1 ? s.loopStart : ip] ?? a;
      const v = a + (b - a) * fr;
      L[from + k] += v * c.gl!;
      R[from + k] += v * c.gr!;
      c.pos += c.step! * c.dir;
      if (s.loopType === 2 && c.dir < 0 && c.pos < s.loopStart) { c.dir = 1; c.pos = 2 * s.loopStart - c.pos; }
    }
  }
}
