// An Impulse Tracker module player for Pingus's music (data/music/*.it), which the original plays through
// SDL_mixer's module support. The loader follows the IT format (ITTECH.TXT: header, instruments with
// envelopes and new note actions, samples with IT 2.14/2.15 compression, packed patterns); the player runs
// the song tick by tick (2.5 * rate / tempo samples a tick) with the IT effects the songs use, linear and
// Amiga slides, and mixes with linear interpolation.

interface Env { on: boolean; loop: boolean; sus: boolean; lb: number; le: number; sb: number; se: number; nodes: { t: number; v: number }[] }
interface Instrument {
  nna: number; dct: number; dca: number; fadeout: number; gv: number; dfp: number; panOn: boolean; rv: number; rp: number;
  keymap: { note: number; smp: number }[]; vol: Env; pan: Env; pitch: Env; filterEnv: boolean;
}
interface Sample {
  gv: number; vol: number; pan: number; panOn: boolean; len: number; loop: boolean; pingpong: boolean; lb: number; le: number;
  sus: boolean; susPingpong: boolean; sb: number; se: number; c5: number; data: Float32Array | null;
  vibSpeed: number; vibDepth: number; vibRate: number; vibType: number;
}
interface Cell { note: number; ins: number; vol: number; fx: number; param: number }
export interface Song {
  name: string; flags: number; gv: number; mv: number; speed: number; tempo: number; sep: number;
  chnPan: number[]; chnVol: number[]; orders: number[]; instruments: Instrument[]; samples: Sample[]; patterns: Cell[][][];
}

const u16 = (b: Uint8Array, o: number) => b[o] | (b[o + 1] << 8);
const u32 = (b: Uint8Array, o: number) => (b[o] | (b[o + 1] << 8) | (b[o + 2] << 16) | (b[o + 3] << 24)) >>> 0;

function readEnv(b: Uint8Array, o: number, signed: boolean): Env {
  const fl = b[o], n = b[o + 1];
  const nodes: { t: number; v: number }[] = [];
  for (let i = 0; i < Math.min(25, n); i++) {
    const v = b[o + 6 + i * 3];
    nodes.push({ v: signed ? (v << 24) >> 24 : v, t: u16(b, o + 7 + i * 3) });
  }
  return { on: !!(fl & 1), loop: !!(fl & 2), sus: !!(fl & 4), lb: b[o + 2], le: b[o + 3], sb: b[o + 4], se: b[o + 5], nodes };
}

/** IT 2.14 / 2.15 sample decompression (8 or 16 bit) */
function decompress(b: Uint8Array, off: number, len: number, is16: boolean, it215: boolean): Float32Array {
  const out = new Float32Array(len);
  let pos = 0, src = off;
  while (pos < len && src + 2 <= b.length) {
    const size = u16(b, src);
    src += 2;
    const end = src + size;
    let bitbuf = 0, bitnum = 0, p = src;
    const bits = (n: number) => {
      let v = 0;
      for (let i = 0; i < n; i++) {
        if (bitnum === 0) { bitbuf = p < end ? b[p++] : 0; bitnum = 8; }
        v |= (bitbuf & 1) << i;
        bitbuf >>= 1;
        bitnum--;
      }
      return v >>> 0;
    };
    const blockLen = Math.min(is16 ? 0x4000 : 0x8000, len - pos);
    const top = is16 ? 17 : 9;
    let left = top, temp = 0, temp2 = 0, i = 0;
    while (i < blockLen) {
      let v = bits(left);
      let store = true;
      if (left < 7) {
        if (v === 1 << (left - 1)) {
          v = bits(is16 ? 4 : 3) + 1;
          left = v < left ? v : v + 1;
          continue;
        }
      } else if (left < top) {
        const hi = ((is16 ? 0xffff : 0xff) >> (top - left)) + (is16 ? 8 : 4);
        const lo = hi - (is16 ? 16 : 8);
        if (v > lo && v <= hi) {
          v -= lo;
          left = v < left ? v : v + 1;
          continue;
        }
      } else if (left >= top + 1) {
        store = false;
      } else if (v >= (is16 ? 0x10000 : 0x100)) {
        left = (v + 1) & 0xff;
        continue;
      }
      if (store) {
        const w = is16 ? 16 : 8;
        if (left < w) { const sh = 32 - left; v = (v << sh) >> sh; }
        if (is16) {
          temp = ((temp + v) << 16) >> 16;
          temp2 = ((temp2 + temp) << 16) >> 16;
          out[pos + i] = (it215 ? temp2 : temp) / 32768;
        } else {
          temp = ((temp + v) << 24) >> 24;
          temp2 = ((temp2 + temp) << 24) >> 24;
          out[pos + i] = (it215 ? temp2 : temp) / 128;
        }
      }
      i++;
    }
    pos += blockLen;
    src = end;
  }
  return out;
}

export function parseIT(b: Uint8Array): Song {
  if (String.fromCharCode(...b.subarray(0, 4)) !== 'IMPM') throw new Error('not an IT module');
  const ordNum = u16(b, 0x20), insNum = u16(b, 0x22), smpNum = u16(b, 0x24), patNum = u16(b, 0x26);
  const cmwt = u16(b, 0x2a), flags = u16(b, 0x2c);
  const song: Song = {
    name: String.fromCharCode(...b.subarray(4, 30)).replace(/\0.*$/, ''), flags, gv: b[0x30], mv: b[0x31], speed: b[0x32] || 6,
    tempo: b[0x33] || 125, sep: b[0x34], chnPan: [...b.subarray(0x40, 0x80)], chnVol: [...b.subarray(0x80, 0xc0)],
    orders: [...b.subarray(0xc0, 0xc0 + ordNum)], instruments: [], samples: [], patterns: [],
  };
  let o = 0xc0 + ordNum;
  const insOff: number[] = [], smpOff: number[] = [], patOff: number[] = [];
  for (let i = 0; i < insNum; i++, o += 4) insOff.push(u32(b, o));
  for (let i = 0; i < smpNum; i++, o += 4) smpOff.push(u32(b, o));
  for (let i = 0; i < patNum; i++, o += 4) patOff.push(u32(b, o));
  for (const p of insOff) {
    const keymap: { note: number; smp: number }[] = [];
    if (cmwt >= 0x200) {
      for (let k = 0; k < 120; k++) keymap.push({ note: b[p + 0x40 + k * 2], smp: b[p + 0x41 + k * 2] });
      song.instruments.push({
        nna: b[p + 0x11], dct: b[p + 0x12], dca: b[p + 0x13], fadeout: u16(b, p + 0x14), gv: b[p + 0x18], dfp: b[p + 0x19] & 0x7f,
        panOn: !(b[p + 0x19] & 0x80), rv: b[p + 0x1a], rp: b[p + 0x1b], keymap,
        vol: readEnv(b, p + 0x130, false), pan: readEnv(b, p + 0x182, true), pitch: readEnv(b, p + 0x1d4, true),
        filterEnv: !!(b[p + 0x1d4] & 0x80),
      });
    } else {
      // old (cmwt < 0x200) instruments: no envelopes the songs use
      for (let k = 0; k < 120; k++) keymap.push({ note: b[p + 0x40 + k * 2], smp: b[p + 0x41 + k * 2] });
      const none: Env = { on: false, loop: false, sus: false, lb: 0, le: 0, sb: 0, se: 0, nodes: [] };
      song.instruments.push({ nna: b[p + 0x1e], dct: 0, dca: 0, fadeout: u16(b, p + 0x14) * 2, gv: 128, dfp: 32, panOn: false, rv: 0, rp: 0, keymap, vol: none, pan: none, pitch: none, filterEnv: false });
    }
  }
  for (const p of smpOff) {
    const fl = b[p + 0x12], len = u32(b, p + 0x30), cvt = b[p + 0x2e], ptr = u32(b, p + 0x48);
    const is16 = !!(fl & 2);
    let data: Float32Array | null = null;
    if ((fl & 1) && len > 0) {
      if (fl & 8) {
        data = decompress(b, ptr, len, is16, !!(cvt & 4));
      } else {
        data = new Float32Array(len);
        const signed = !!(cvt & 1);
        for (let i = 0; i < len; i++) {
          if (is16) { let v = u16(b, ptr + i * 2); if (!signed) v -= 32768; data[i] = ((v << 16) >> 16) / 32768; }
          else { let v = b[ptr + i]; if (!signed) v -= 128; data[i] = ((v << 24) >> 24) / 128; }
        }
      }
    }
    song.samples.push({
      gv: b[p + 0x11], vol: b[p + 0x13], pan: b[p + 0x2f] & 0x7f, panOn: !!(b[p + 0x2f] & 0x80), len,
      loop: !!(fl & 0x10), pingpong: !!(fl & 0x40), lb: u32(b, p + 0x34), le: u32(b, p + 0x38),
      sus: !!(fl & 0x20), susPingpong: !!(fl & 0x80), sb: u32(b, p + 0x40), se: u32(b, p + 0x44), c5: u32(b, p + 0x3c) || 8363,
      data, vibSpeed: b[p + 0x4c], vibDepth: b[p + 0x4d], vibRate: b[p + 0x4e], vibType: b[p + 0x4f],
    });
  }
  for (const p of patOff) {
    const rows: Cell[][] = [];
    if (p === 0) { for (let r = 0; r < 64; r++) rows.push(Array.from({ length: 64 }, () => ({ note: 0, ins: 0, vol: 255, fx: 0, param: 0 }))); song.patterns.push(rows); continue; }
    const nrows = u16(b, p + 2);
    let q = p + 8;
    const lastMask = new Array(64).fill(0);
    const last: Cell[] = Array.from({ length: 64 }, () => ({ note: 0, ins: 0, vol: 255, fx: 0, param: 0 }));
    for (let r = 0; r < nrows; r++) {
      const row: Cell[] = Array.from({ length: 64 }, () => ({ note: 0, ins: 0, vol: 255, fx: 0, param: 0 }));
      for (;;) {
        const cv = b[q++];
        if (cv === 0) break;
        const ch = (cv - 1) & 63;
        const mask = cv & 128 ? (lastMask[ch] = b[q++]) : lastMask[ch];
        const c = row[ch];
        if (mask & 1) { c.note = b[q++] + 1; last[ch].note = c.note; } // 1..120 notes, 255+1 off, 254+1 cut
        if (mask & 2) { c.ins = b[q++]; last[ch].ins = c.ins; }
        if (mask & 4) { c.vol = b[q++]; last[ch].vol = c.vol; }
        if (mask & 8) { c.fx = b[q++]; c.param = b[q++]; last[ch].fx = c.fx; last[ch].param = c.param; }
        if (mask & 16) c.note = last[ch].note;
        if (mask & 32) c.ins = last[ch].ins;
        if (mask & 64) c.vol = last[ch].vol;
        if (mask & 128) { c.fx = last[ch].fx; c.param = last[ch].param; }
      }
      rows.push(row);
    }
    song.patterns.push(rows);
  }
  return song;
}

const SINE = Array.from({ length: 256 }, (_, i) => Math.round(Math.sin(i * Math.PI * 2 / 256) * 64));
const wave = (type: number, pos: number) => {
  pos &= 255;
  switch (type & 3) {
    case 1: return 64 - (pos >> 1); // ramp down
    case 2: return pos < 128 ? 64 : -64; // square
    case 3: return Math.floor(Math.random() * 128) - 64;
    default: return SINE[pos];
  }
};

class Voice {
  smp: Sample | null = null;
  ins: Instrument | null = null;
  pos = 0;
  dir = 1;
  freq = 0;
  vol = 0; // 0..64
  pan = 32;
  keyOff = false;
  fading = false;
  fade = 1024;
  envVolPos = 0;
  envPanPos = 0;
  envPitchPos = 0;
  active = false;
  bg = false;
  chanVol = 64;
  outVolL = 0;
  outVolR = 0;
  autoVibPos = 0;
  autoVibDepth = 0;
}

class Channel {
  voice: Voice | null = null;
  note = 0;
  ins = 0;
  smpVol = 0;
  chanVol = 64;
  pan = 32;
  surround = false;
  freq = 0;
  portaTarget = 0;
  mem: Record<string, number> = {};
  vibPos = 0;
  vibType = 0;
  tremPos = 0;
  tremType = 0;
  panbPos = 0;
  vibOffset = 0; // in 1/768 octave
  tremOffset = 0;
  loopRow = 0;
  loopCount = 0;
  retrigCount = 0;
  tremorCount = 0;
  tremorOn = true;
  arp = 0;
  fx = 0;
  param = 0;
  volFx = 255;
  delayedCell: Cell | null = null;
  delayTick = 0;
  cutTick = -1;
}

export class ITPlayer {
  private s: Song;
  private rate: number;
  private chans: Channel[] = [];
  private voices: Voice[] = [];
  private order = 0;
  private row = 0;
  private tick = 0;
  private speed: number;
  private tempo: number;
  private gv: number;
  private tickSamples = 0;
  private tickLeft = 0;
  private patDelay = 0;
  private nextOrder = -1;
  private nextRow = -1;
  loop: boolean;
  ended = false;
  private linear: boolean;
  private useIns: boolean;
  private gain: number;

  constructor(song: Song, rate: number, loop = true) {
    this.s = song;
    this.rate = rate;
    this.loop = loop;
    this.speed = song.speed;
    this.tempo = song.tempo;
    this.gv = song.gv;
    this.linear = !!(song.flags & 8);
    this.useIns = !!(song.flags & 4) && song.instruments.length > 0;
    for (let i = 0; i < 64; i++) {
      const c = new Channel();
      c.chanVol = song.chnVol[i];
      const p = song.chnPan[i];
      c.surround = (p & 127) === 100;
      c.pan = (p & 127) > 64 ? 32 : p & 127;
      this.chans.push(c);
    }
    this.gain = (song.mv || 48) / 128 * 0.5;
    this.tickSamples = Math.floor(rate * 2.5 / this.tempo);
    this.tick = this.speed; // start on a row
    this.row = -1;
    this.skipEmptyOrders();
  }

  private skipEmptyOrders() {
    while (this.order < this.s.orders.length && this.s.orders[this.order] === 254) this.order++;
    if (this.order >= this.s.orders.length || this.s.orders[this.order] === 255) this.restartOrEnd();
  }
  private restartOrEnd() {
    if (!this.loop) { this.ended = true; return; }
    this.order = 0;
    while (this.order < this.s.orders.length && this.s.orders[this.order] >= 254) this.order++;
    if (this.order >= this.s.orders.length) this.ended = true;
  }

  private pattern() { return this.s.patterns[this.s.orders[this.order]] ?? null; }

  private freqOf(note: number, c5: number) { return c5 * Math.pow(2, (note - 60) / 12); }
  private slide(freq: number, units768: number) {
    if (this.linear) return freq * Math.pow(2, units768 / 768);
    const period = 14317456 / Math.max(1, freq) - units768; // Amiga: 4 period units per E/F step
    return 14317456 / Math.max(1, period);
  }

  private doRow() {
    // advance
    if (this.nextOrder >= 0 || this.nextRow >= 0) {
      if (this.nextOrder >= 0) { this.order = this.nextOrder; this.row = this.nextRow >= 0 ? this.nextRow : 0; }
      else { this.order++; this.row = this.nextRow; }
      this.nextOrder = -1; this.nextRow = -1;
      this.skipEmptyOrders();
      if (this.ended) return;
    } else {
      this.row++;
      const pat = this.pattern();
      if (!pat || this.row >= pat.length) {
        this.order++;
        this.row = 0;
        this.skipEmptyOrders();
        if (this.ended) return;
      }
    }
    const pat = this.pattern();
    if (!pat) return;
    if (this.row >= pat.length) this.row = 0;
    const cells = pat[this.row];
    for (let ch = 0; ch < 64; ch++) {
      const c = this.chans[ch], cell = cells[ch];
      c.fx = cell.fx; c.param = cell.param; c.volFx = cell.vol;
      c.cutTick = -1;
      if (cell.fx === 19 && (cell.param >> 4) === 0xd && (cell.param & 15) > 0) { // SDx note delay
        c.delayedCell = cell; c.delayTick = cell.param & 15;
        continue;
      }
      this.playCell(ch, cell);
    }
  }

  private playCell(ch: number, cell: Cell) {
    const c = this.chans[ch];
    const porta = cell.fx === 7 || cell.fx === 12 || (cell.vol >= 193 && cell.vol <= 202);
    if (cell.ins) {
      c.ins = cell.ins;
      if (!this.useIns) {
        const smp = this.s.samples[cell.ins - 1];
        if (smp) c.smpVol = smp.vol;
      }
    }
    if (cell.note >= 1 && cell.note <= 120) {
      const note = cell.note - 1;
      let smp: Sample | undefined, ins: Instrument | null = null, realNote = note;
      if (this.useIns) {
        ins = this.s.instruments[c.ins - 1] ?? null;
        if (ins) { const k = ins.keymap[note]; realNote = k.note; smp = this.s.samples[k.smp - 1]; }
      } else {
        smp = this.s.samples[c.ins - 1];
      }
      if (smp && smp.data) {
        const f = this.freqOf(realNote, smp.c5);
        if (porta && c.voice && c.voice.active) {
          c.portaTarget = f;
        } else {
          this.newNote(c, smp, ins, f, !!cell.ins);
        }
        c.note = note;
      }
    } else if (cell.note === 256) { // note off
      if (c.voice) { c.voice.keyOff = true; if (!c.voice.ins || !c.voice.ins.vol.on || c.voice.ins.vol.loop) c.voice.fading = true; }
    } else if (cell.note === 255) { // note cut
      if (c.voice) { c.voice.active = false; c.voice = null; }
    } else if (cell.note >= 121) { // note fade
      if (c.voice) c.voice.fading = true;
    }
    if (cell.ins && c.voice && !(cell.note >= 1 && cell.note <= 120 && !porta)) {
      // an instrument alone resets the volume
      if (c.voice.smp) c.smpVol = c.voice.smp.vol;
    }
    // volume column
    const v = cell.vol;
    if (v <= 64) c.smpVol = v;
    else if (v >= 128 && v <= 192) { c.pan = v - 128; c.surround = false; }
    else if (v >= 65 && v <= 74) { const x = v - 65 || c.mem.vfine || 0; c.mem.vfine = x; c.smpVol = Math.min(64, c.smpVol + x); }
    else if (v >= 75 && v <= 84) { const x = v - 75 || c.mem.vfine || 0; c.mem.vfine = x; c.smpVol = Math.max(0, c.smpVol - x); }
    else if (v >= 85 && v <= 104) { if (v !== 85 && v !== 95) c.mem.vslide = v; }
    this.effectTick0(ch, cell);
  }

  private newNote(c: Channel, smp: Sample, ins: Instrument | null, freq: number, insGiven: boolean) {
    if (c.voice && c.voice.active) {
      const nna = c.voice.ins ? c.voice.ins.nna : 0;
      if (nna === 0) c.voice.active = false;
      else {
        c.voice.bg = true;
        if (nna === 2) { c.voice.keyOff = true; if (!c.voice.ins!.vol.on || c.voice.ins!.vol.loop) c.voice.fading = true; }
        else if (nna === 3) c.voice.fading = true;
      }
    }
    const v = new Voice();
    v.smp = smp; v.ins = ins; v.active = true; v.freq = freq; v.pos = 0; v.dir = 1;
    if (insGiven || c.smpVol === undefined) c.smpVol = smp.vol;
    if (ins && ins.panOn) c.pan = ins.dfp;
    if (smp.panOn) c.pan = smp.pan;
    c.freq = freq;
    c.portaTarget = freq;
    c.voice = v;
    c.vibPos = 0; c.tremPos = 0;
    this.voices.push(v);
    // a few background voices at most, the oldest dropped
    const bg = this.voices.filter((x) => x.bg && x.active);
    if (bg.length > 32) bg[0].active = false;
    this.voices = this.voices.filter((x) => x.active);
  }

  private effectTick0(ch: number, cell: Cell) {
    const c = this.chans[ch];
    const p = cell.param;
    const mem = (k: string) => { if (p) c.mem[k] = p; return c.mem[k] ?? 0; };
    c.vibOffset = 0; c.tremOffset = 0; c.arp = 0;
    switch (cell.fx) {
      case 1: if (p) this.speed = p; break; // A
      case 2: this.nextOrder = p; this.nextRow = 0; break; // B
      case 3: if (this.nextOrder < 0) this.nextRow = p; else this.nextRow = p; break; // C
      case 4: { // D
        const x = mem('D');
        if ((x & 15) === 15 && x >> 4) c.smpVol = Math.min(64, c.smpVol + (x >> 4));
        else if ((x >> 4) === 15 && x & 15) c.smpVol = Math.max(0, c.smpVol - (x & 15));
        break;
      }
      case 5: case 6: { // E, F
        const x = p ? (c.mem.EF = p) : (c.mem.EF ?? 0);
        const sign = cell.fx === 5 ? -1 : 1;
        if ((x >> 4) === 15) c.freq = this.slide(c.freq, sign * 4 * (x & 15));
        else if ((x >> 4) === 14) c.freq = this.slide(c.freq, sign * (x & 15));
        break;
      }
      case 7: if (p) c.mem.G = p; break;
      case 8: if (p >> 4) c.mem.Hs = p >> 4; if (p & 15) c.mem.Hd = (p & 15) * 4; break; // H
      case 21: if (p >> 4) c.mem.Hs = p >> 4; if (p & 15) c.mem.Hd = p & 15; break; // U
      case 9: mem('I'); break;
      case 10: mem('J'); break;
      case 11: case 12: if (p) c.mem.D = p; break;
      case 13: c.chanVol = Math.min(64, p); break; // M
      case 14: mem('N'); break;
      case 15: { // O
        const x = mem('O');
        if (c.voice && c.voice.smp) { c.voice.pos = x * 256; if (c.voice.pos >= c.voice.smp.len) c.voice.pos = c.voice.smp.len - 1; }
        break;
      }
      case 16: mem('P'); break;
      case 17: mem('Q'); break;
      case 18: if (p >> 4) c.mem.Rs = p >> 4; if (p & 15) c.mem.Rd = p & 15; break;
      case 19: { // S
        const x = mem('S'), hi = x >> 4, lo = x & 15;
        if (hi === 3) c.vibType = lo;
        else if (hi === 4) c.tremType = lo;
        else if (hi === 8) { c.pan = Math.round(lo * 64 / 15); c.surround = false; }
        else if (hi === 9 && lo === 1) c.surround = true;
        else if (hi === 0xb) {
          if (lo === 0) c.loopRow = this.row;
          else if (c.loopCount === 0) { c.loopCount = lo; this.nextRow = c.loopRow; this.nextOrder = this.order; }
          else if (--c.loopCount > 0) { this.nextRow = c.loopRow; this.nextOrder = this.order; }
          else c.loopRow = this.row + 1;
        } else if (hi === 0xc) c.cutTick = lo || 1;
        else if (hi === 0xe) { if (!this.patDelay) this.patDelay = lo + 1; }
        else if (hi === 7 && c.voice) {
          if (lo === 0) for (const v of this.voices) if (v.bg) v.active = false;
          if (lo === 1) for (const v of this.voices) if (v.bg) v.keyOff = true;
          if (lo === 2) for (const v of this.voices) if (v.bg) v.fading = true;
        }
        break;
      }
      case 20: { // T
        const x = p || c.mem.T || 0;
        if (p) c.mem.T = p;
        if (x >= 0x20) this.setTempo(x);
        break;
      }
      case 22: this.gv = Math.min(128, p); break; // V
      case 23: mem('W'); break;
      case 24: c.pan = p >> 2; c.surround = false; break; // X
      case 25: mem('Y'); break;
    }
  }

  private setTempo(t: number) { this.tempo = t; this.tickSamples = Math.floor(this.rate * 2.5 / t); }

  private effectTick(ch: number) {
    const c = this.chans[ch];
    if (c.delayedCell && this.tick === c.delayTick) { const cell = c.delayedCell; c.delayedCell = null; this.playCell(ch, cell); }
    if (c.cutTick === this.tick && c.voice) { c.smpVol = 0; }
    const vs = c.volFx;
    if (vs >= 85 && vs <= 104 && this.tick) {
      const x = vs >= 85 && vs <= 94 ? vs - 85 : vs - 95;
      if (vs <= 94) c.smpVol = Math.min(64, c.smpVol + x); else c.smpVol = Math.max(0, c.smpVol - x);
    }
    if (vs >= 105 && vs <= 114 && this.tick) c.freq = this.slide(c.freq, -4 * 4 * (vs - 105));
    if (vs >= 115 && vs <= 124 && this.tick) c.freq = this.slide(c.freq, 4 * 4 * (vs - 115));
    if (vs >= 193 && vs <= 202 && this.tick) {
      const t = [0, 1, 4, 8, 16, 32, 64, 96, 128, 255][vs - 193];
      if (t) c.mem.G = t;
      this.tonePorta(c);
    }
    if (vs >= 203 && vs <= 212 && this.tick) { if (vs > 203) c.mem.Hd = (vs - 203) * 4; this.vibrato(c); }
    if (!this.tick) return;
    switch (c.fx) {
      case 4: case 11: case 12: {
        const x = c.mem.D ?? 0;
        if ((x & 15) === 0) c.smpVol = Math.min(64, c.smpVol + (x >> 4));
        else if ((x >> 4) === 0) c.smpVol = Math.max(0, c.smpVol - (x & 15));
        if (c.fx === 11) this.vibrato(c);
        if (c.fx === 12) this.tonePorta(c);
        break;
      }
      case 5: case 6: {
        const x = c.mem.EF ?? 0;
        if (x < 0xe0) c.freq = this.slide(c.freq, (c.fx === 5 ? -4 : 4) * x);
        break;
      }
      case 7: this.tonePorta(c); break;
      case 8: case 21: this.vibrato(c); break;
      case 9: { // tremor
        const x = c.mem.I ?? 0, on = (x >> 4) + 1, off = (x & 15) + 1;
        c.tremorCount = (c.tremorCount + 1) % (on + off);
        c.tremorOn = c.tremorCount < on;
        break;
      }
      case 10: { // arpeggio
        const x = c.mem.J ?? 0, t = this.tick % 3;
        c.arp = t === 0 ? 0 : t === 1 ? x >> 4 : x & 15;
        break;
      }
      case 14: {
        const x = c.mem.N ?? 0;
        if ((x & 15) === 0) c.chanVol = Math.min(64, c.chanVol + (x >> 4));
        else if ((x >> 4) === 0) c.chanVol = Math.max(0, c.chanVol - (x & 15));
        break;
      }
      case 16: {
        const x = c.mem.P ?? 0;
        if ((x & 15) === 0) c.pan = Math.max(0, c.pan - (x >> 4));
        else if ((x >> 4) === 0) c.pan = Math.min(64, c.pan + (x & 15));
        break;
      }
      case 17: { // retrigger
        const x = c.mem.Q ?? 0, every = x & 15;
        if (every && this.tick % every === 0 && c.voice) {
          c.voice.pos = 0; c.voice.dir = 1;
          const m = x >> 4;
          const vol = [c.smpVol, c.smpVol - 1, c.smpVol - 2, c.smpVol - 4, c.smpVol - 8, c.smpVol - 16, c.smpVol * 2 / 3, c.smpVol / 2,
            c.smpVol, c.smpVol + 1, c.smpVol + 2, c.smpVol + 4, c.smpVol + 8, c.smpVol + 16, c.smpVol * 3 / 2, c.smpVol * 2][m];
          c.smpVol = Math.max(0, Math.min(64, Math.trunc(vol)));
        }
        break;
      }
      case 18: { // tremolo
        c.tremPos = (c.tremPos + (c.mem.Rs ?? 0) * 4) & 255;
        c.tremOffset = (wave(c.tremType, c.tremPos) * (c.mem.Rd ?? 0)) >> 5;
        break;
      }
      case 23: {
        const x = c.mem.W ?? 0;
        if ((x & 15) === 0) this.gv = Math.min(128, this.gv + (x >> 4));
        else if ((x >> 4) === 0) this.gv = Math.max(0, this.gv - (x & 15));
        break;
      }
      case 25: { // panbrello
        const x = c.mem.Y ?? 0;
        c.panbPos = (c.panbPos + (x >> 4)) & 255;
        c.pan = Math.max(0, Math.min(64, c.pan + ((wave(0, c.panbPos) * (x & 15)) >> 6)));
        break;
      }
    }
  }

  private tonePorta(c: Channel) {
    const sp = (c.mem.G ?? 0) * 4;
    if (!c.portaTarget || !c.freq) return;
    if (c.freq < c.portaTarget) { c.freq = this.slide(c.freq, sp); if (c.freq > c.portaTarget) c.freq = c.portaTarget; }
    else if (c.freq > c.portaTarget) { c.freq = this.slide(c.freq, -sp); if (c.freq < c.portaTarget) c.freq = c.portaTarget; }
  }
  private vibrato(c: Channel) {
    c.vibPos = (c.vibPos + (c.mem.Hs ?? 0) * 4) & 255;
    c.vibOffset = (wave(c.vibType, c.vibPos) * (c.mem.Hd ?? 0)) / 16;
  }

  private envValue(e: Env, pos: number): number {
    const n = e.nodes;
    if (!n.length) return 0;
    if (pos <= n[0].t) return n[0].v;
    for (let i = 1; i < n.length; i++) {
      if (pos <= n[i].t) {
        const a = n[i - 1], b = n[i];
        return b.t === a.t ? b.v : a.v + (b.v - a.v) * (pos - a.t) / (b.t - a.t);
      }
    }
    return n[n.length - 1].v;
  }
  private envAdvance(e: Env, pos: number, keyOff: boolean): number {
    const n = e.nodes;
    if (!n.length) return pos;
    pos++;
    if (e.sus && !keyOff && n[e.se] && pos > n[e.se].t) return n[e.sb]?.t ?? pos;
    if (e.loop && n[e.le] && pos > n[e.le].t) return n[e.lb]?.t ?? pos;
    return Math.min(pos, n[n.length - 1].t + 1);
  }

  private processTick() {
    if (this.tick >= this.speed * (this.patDelay || 1)) {
      this.tick = 0;
      this.patDelay = 0;
      this.doRow();
      if (this.ended) return;
    } else {
      for (let ch = 0; ch < 64; ch++) this.effectTick(ch);
    }
    if (this.tick === 0) for (let ch = 0; ch < 64; ch++) this.effectTick(ch);
    this.tick++;
    // per-voice state for this tick
    for (let ch = 0; ch < 64; ch++) {
      const c = this.chans[ch], v = c.voice;
      if (!v || !v.active) continue;
      v.vol = c.tremorOn ? Math.max(0, Math.min(64, c.smpVol + c.tremOffset)) : 0;
      v.pan = c.pan;
      v.chanVol = c.chanVol;
      let f = c.freq;
      if (c.vibOffset) f = this.slide(f, c.vibOffset);
      if (c.arp) f = f * Math.pow(2, c.arp / 12);
      v.freq = f;
    }
    for (const v of this.voices) {
      if (!v.active) continue;
      const ins = v.ins;
      let ev = 1, pan = v.pan, pitch = 0;
      if (ins) {
        if (ins.vol.on) {
          ev = this.envValue(ins.vol, v.envVolPos) / 64;
          v.envVolPos = this.envAdvance(ins.vol, v.envVolPos, v.keyOff);
          const last = ins.vol.nodes[ins.vol.nodes.length - 1];
          if (last && v.envVolPos > last.t && !ins.vol.loop) { if (last.v === 0) v.active = false; else if (v.keyOff) v.fading = true; }
        }
        if (ins.pan.on) { pan = Math.max(0, Math.min(64, pan + this.envValue(ins.pan, v.envPanPos))); v.envPanPos = this.envAdvance(ins.pan, v.envPanPos, v.keyOff); }
        if (ins.pitch.on && !ins.filterEnv) { pitch = this.envValue(ins.pitch, v.envPitchPos); v.envPitchPos = this.envAdvance(ins.pitch, v.envPitchPos, v.keyOff); }
        if (v.fading) { v.fade -= ins.fadeout; if (v.fade <= 0) { v.fade = 0; v.active = false; } }
      } else if (v.fading) { v.active = false; }
      const sm = v.smp!;
      const vol = v.vol / 64 * sm.gv / 64 * (ins ? ins.gv / 128 : 1) * v.chanVol / 64 * this.gv / 128 * ev * v.fade / 1024;
      const sep = this.s.sep / 128;
      const p = ((pan - 32) / 32) * sep;
      v.outVolL = vol * Math.min(1, 1 - p) * this.gain;
      v.outVolR = vol * Math.min(1, 1 + p) * this.gain;
      if (pitch) v.freq = v.freq * Math.pow(2, pitch * 2 / 768 * 4);
    }
    this.voices = this.voices.filter((v) => v.active);
  }

  /** fills the two channels with the next samples */
  render(l: Float32Array, r: Float32Array): void {
    let i = 0;
    const n = l.length;
    l.fill(0); r.fill(0);
    while (i < n) {
      if (this.ended) return;
      if (this.tickLeft <= 0) { this.processTick(); this.tickLeft = this.tickSamples; if (this.ended) return; }
      const m = Math.min(n - i, this.tickLeft);
      for (const v of this.voices) this.mix(v, l, r, i, m);
      i += m;
      this.tickLeft -= m;
    }
  }

  private mix(v: Voice, l: Float32Array, r: Float32Array, at: number, n: number) {
    const s = v.smp!, d = s.data!;
    if (!d || !v.active) return;
    const step = v.freq / this.rate;
    const useSus = s.sus && !v.keyOff;
    const loop = useSus || s.loop;
    const lb = useSus ? s.sb : s.lb, le = Math.min(useSus ? s.se : s.le, s.len), pp = useSus ? s.susPingpong : s.pingpong;
    const end = loop && le > lb ? le : s.len;
    for (let k = 0; k < n; k++) {
      let pos = v.pos;
      if (pos >= end || pos < 0) {
        if (!loop || le <= lb) { v.active = false; return; }
        if (pp) {
          if (pos >= end) { v.dir = -1; pos = end - (pos - end) - 1; }
          if (pos < lb) { v.dir = 1; pos = lb + (lb - pos); }
        } else {
          while (pos >= end) pos -= le - lb;
        }
        v.pos = pos;
      }
      const ip = Math.floor(pos), fr = pos - ip;
      const a = d[ip] ?? 0, b = d[ip + 1 < end ? ip + 1 : loop && !pp ? lb : ip] ?? a;
      const smp = a + (b - a) * fr;
      l[at + k] += smp * v.outVolL;
      r[at + k] += smp * v.outVolR;
      v.pos = pos + step * v.dir;
      if (pp && v.dir < 0 && v.pos < lb) { v.dir = 1; v.pos = lb + (lb - v.pos); }
    }
  }
}
