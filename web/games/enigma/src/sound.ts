// Sound effects (SoundEngine.cc, sound-defaults.lua's soundtable_enigma) and the menu music
// (MusicManager.cc, the "Default" menu queue: Esprit, Enigma Rag and Pentagonal Dreams with 8 s pauses).
// The S3M renderer below plays the port's own replacement for pentagonal_dreams.s3m (notes, instruments,
// volumes, speed and tempo; ScreamTracker effects are not used by that file).
import { newState, toBytes } from './lua/lib.ts';
import { LuaTable, LuaFunction } from './lua/interp.ts';

export interface SoundDef { file: string; volume: number; global: boolean }

/** soundtable_enigma of sound-defaults.lua, completed as complete_sound() does */
export function loadSoundTable(luaText: string): Map<string, SoundDef> {
  const L = newState();
  const out = new Map<string, SoundDef>();
  // sound.DefineSoundEffect(set, name, file, volume, loop, global, ...): the "Enigma" set is the default one
  const sound = new LuaTable();
  sound.set('DefineSoundEffect', new LuaFunction((a) => {
    if (a[0] === 'Enigma') out.set(String(a[1]), { file: String(a[2] ?? ''), volume: typeof a[3] === 'number' ? a[3] : 1.0, global: a[5] === true });
    return [];
  }));
  sound.set('SetActiveSoundSet', new LuaFunction(() => []));
  L.G.set('sound', sound);
  L.doString(toBytes(luaText), '@sound-defaults.lua');
  return out;
}

export class SoundPlayer {
  ctx: AudioContext;
  buffers = new Map<string, AudioBuffer>();
  defs: Map<string, SoundDef>;
  urls: Record<string, string>;
  gain: GainNode;
  /** the screen area in world coordinates, for left/right placement */
  view = { x: 0, y: 0, w: 20, h: 13 };
  constructor(ctx: AudioContext, defs: Map<string, SoundDef>, urls: Record<string, string>) {
    this.ctx = ctx; this.defs = defs; this.urls = urls;
    this.gain = ctx.createGain();
    this.gain.connect(ctx.destination);
  }
  private async load(file: string): Promise<AudioBuffer | null> {
    const key = file.replace(/^.*\//, '').replace(/\.wav$/, '');
    if (this.buffers.has(key)) return this.buffers.get(key)!;
    const url = this.urls[key];
    if (!url) return null;
    try {
      const data = await (await fetch(url)).arrayBuffer();
      const buf = await this.ctx.decodeAudioData(data);
      this.buffers.set(key, buf);
      return buf;
    } catch { return null; }
  }
  preload() { for (const d of this.defs.values()) if (d.file) void this.load(d.file); }
  /** sound::EmitSoundEvent: positional sounds are panned by their place on the screen */
  emit(name: string, x: number, y: number, vol: number) {
    const d = this.defs.get(name);
    if (!d || !d.file || vol <= 0) return;
    void this.load(d.file).then((buf) => {
      if (!buf || this.ctx.state === 'closed') return;
      const src = this.ctx.createBufferSource();
      src.buffer = buf;
      const g = this.ctx.createGain();
      let v = vol * d.volume;
      let pan = 0;
      if (!d.global) {
        const cx = this.view.x + this.view.w / 2, cy = this.view.y + this.view.h / 2;
        const dist = Math.hypot(x - cx, y - cy);
        v *= Math.max(0, Math.min(1, 1 - (dist - 10) / 20));
        pan = Math.max(-1, Math.min(1, (x - cx) / 15));
      }
      g.gain.value = v;
      const p = this.ctx.createStereoPanner();
      p.pan.value = pan;
      src.connect(g).connect(p).connect(this.gain);
      src.start();
    });
  }
}

// ------------------------------------------------------------------ S3M

export function renderS3M(data: Uint8Array, rate: number): Float32Array[] {
  const dv = new DataView(data.buffer, data.byteOffset, data.byteLength);
  const ordNum = dv.getUint16(0x20, true), insNum = dv.getUint16(0x22, true);
  let speed = data[0x31] || 6, tempo = data[0x32] || 125;
  const chanSet = Array.from(data.subarray(0x40, 0x60));
  const orders = Array.from(data.subarray(0x60, 0x60 + ordNum)).filter((o) => o < 254);
  const p = 0x60 + ordNum;
  const insPtr = (i: number) => dv.getUint16(p + i * 2, true) * 16;
  const patPtr = (i: number) => dv.getUint16(p + insNum * 2 + i * 2, true) * 16;
  const samples = [] as { data: Float32Array; loop: boolean; ls: number; le: number; vol: number; c2: number }[];
  for (let i = 0; i < insNum; i++) {
    const o = insPtr(i);
    const memseg = (data[o + 13] << 16) | dv.getUint16(o + 14, true);
    const length = dv.getUint32(o + 16, true), ls = dv.getUint32(o + 20, true), le = dv.getUint32(o + 24, true);
    const vol = data[o + 28], flags = data[o + 31], c2 = dv.getUint32(o + 32, true);
    const raw = data.subarray(memseg * 16, memseg * 16 + length);
    const f = new Float32Array(length);
    for (let k = 0; k < length; k++) f[k] = (raw[k] - 128) / 128;
    samples.push({ data: f, loop: (flags & 1) !== 0, ls, le, vol, c2 });
  }
  type Ch = { s: number; pos: number; step: number; vol: number; on: boolean };
  const chans: Ch[] = Array.from({ length: 32 }, () => ({ s: -1, pos: 0, step: 0, vol: 0, on: false }));
  const rows: number[][][] = [];
  for (const ord of orders) {
    const o = patPtr(ord);
    let q = o + 2;
    for (let r = 0; r < 64; r++) {
      const ev: number[][] = [];
      for (;;) {
        const what = data[q++];
        if (what === 0) break;
        const ch = what & 31;
        let note = 255, ins = 0, vol = -1;
        if (what & 32) { note = data[q++]; ins = data[q++]; }
        if (what & 64) vol = data[q++];
        if (what & 128) q += 2;
        ev.push([ch, note, ins, vol]);
      }
      rows.push(ev);
    }
  }
  const rowSamples = Math.round(rate * speed * 2.5 / tempo);
  const total = rows.length * rowSamples;
  const L = new Float32Array(total), R = new Float32Array(total);
  let pos = 0;
  for (const ev of rows) {
    for (const [ch, note, ins, vol] of ev) {
      const c = chans[ch];
      if (ins > 0 && samples[ins - 1]) { c.s = ins - 1; c.vol = samples[ins - 1].vol; }
      if (note === 254) c.on = false;
      else if (note < 254 && c.s >= 0) {
        const semis = (note >> 4) * 12 + (note & 15) - 60;
        c.step = samples[c.s].c2 * Math.pow(2, semis / 12) / rate;
        c.pos = 0; c.on = true;
      }
      if (vol >= 0) c.vol = Math.min(64, vol);
    }
    for (let ch = 0; ch < 32; ch++) {
      const c = chans[ch];
      if (!c.on || c.s < 0 || chanSet[ch] >= 16) continue;
      const smp = samples[c.s];
      const panL = chanSet[ch] < 8 ? 0.8 : 0.4, panR = chanSet[ch] < 8 ? 0.4 : 0.8;
      const g = c.vol / 64 * 0.3;
      for (let k = 0; k < rowSamples; k++) {
        let ip = Math.floor(c.pos);
        if (smp.loop && ip >= smp.le) { c.pos -= smp.le - smp.ls; ip = Math.floor(c.pos); }
        if (ip >= smp.data.length) { c.on = false; break; }
        const v = smp.data[ip] * g;
        L[pos + k] += v * panL; R[pos + k] += v * panR;
        c.pos += c.step;
      }
    }
    pos += rowSamples;
  }
  return [L, R];
}

export class MenuMusic {
  ctx: AudioContext;
  urls: { esprit: string; rag: string; s3m: string };
  private playing: AudioBufferSourceNode | null = null;
  private timer: number | null = null;
  private idx = 0;
  private active = false;
  private gain: GainNode;
  constructor(ctx: AudioContext, urls: { esprit: string; rag: string; s3m: string }) {
    this.ctx = ctx; this.urls = urls;
    this.gain = ctx.createGain(); this.gain.gain.value = 0.6; this.gain.connect(ctx.destination);
  }
  // the "Default" queue: Esprit, Esprit, Esprit + 8 s, Enigma Rag + 8 s, Pentagonal Dreams + 8 s
  private queue: [keyof MenuMusic['urls'], number][] = [['esprit', 0], ['esprit', 0], ['esprit', 8], ['rag', 8], ['s3m', 8]];
  start() { if (this.active) return; this.active = true; this.idx = 0; void this.next(); }
  stop() {
    this.active = false;
    if (this.timer !== null) clearTimeout(this.timer);
    this.timer = null;
    try { this.playing?.stop(); } catch { /* already stopped */ }
    this.playing = null;
  }
  private buffers = new Map<string, AudioBuffer>();
  private async buffer(k: keyof MenuMusic['urls']): Promise<AudioBuffer | null> {
    if (this.buffers.has(k)) return this.buffers.get(k)!;
    try {
      const data = new Uint8Array(await (await fetch(this.urls[k])).arrayBuffer());
      let buf: AudioBuffer;
      if (k === 's3m') {
        const [l, r] = renderS3M(data, 44100);
        buf = this.ctx.createBuffer(2, l.length, 44100);
        buf.copyToChannel(l as Float32Array<ArrayBuffer>, 0); buf.copyToChannel(r as Float32Array<ArrayBuffer>, 1);
      } else buf = await this.ctx.decodeAudioData(data.buffer);
      this.buffers.set(k, buf);
      return buf;
    } catch { return null; }
  }
  private async next() {
    if (!this.active) return;
    const [k, wait] = this.queue[this.idx % this.queue.length];
    this.idx++;
    const buf = await this.buffer(k);
    if (!this.active || this.ctx.state === 'closed') return;
    if (!buf) { this.timer = setTimeout(() => void this.next(), 1000) as unknown as number; return; }
    const src = this.ctx.createBufferSource();
    src.buffer = buf;
    src.connect(this.gain);
    src.onended = () => { if (this.playing === src) { this.playing = null; if (this.active) this.timer = setTimeout(() => void this.next(), wait * 1000) as unknown as number; } };
    this.playing = src;
    src.start();
  }
}
