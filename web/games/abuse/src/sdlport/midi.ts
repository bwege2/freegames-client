// sdlport/midi.ts: a small Standard MIDI File player on the Web Audio API, standing in for
// SDL_mixer's music (Mix_LoadMUS_RW / Mix_PlayMusic / Mix_VolumeMusic / Mix_FadeOutMusic) that
// sound.cpp uses for the HMI music converted by hmi.ts. Our own code: no soundfonts, nothing
// downloaded. General MIDI is synthesised roughly (an oscillator per note, noise for drums), so the
// music's notes, timing and instrument changes are the original's, the timbre is not
// (README.md, "Sound").
//
// parseMidi is pure (no Web Audio) so the tests can check it in Node. Nothing here touches window or
// AudioContext at module level; the player only uses the context it is given.

/** one channel message of the merged song, in time order */
export interface MidiEvent {
  /** seconds from the start of the song */
  time: number;
  /** absolute tick */
  tick: number;
  /** status byte (0x80..0xEF), always explicit (running status resolved) */
  status: number;
  data1: number;
  /** 0 for one-byte messages (program change, channel pressure) */
  data2: number;
}

export interface MidiSong {
  format: number;
  /** ticks per quarter note (0 if the file uses SMPTE division) */
  division: number;
  events: MidiEvent[];
  /** seconds of the last event or end of track */
  duration: number;
}

interface RawEvent {
  tick: number;
  track: number;
  seq: number;
  status: number;
  data1: number;
  data2: number;
  /** microseconds per quarter for tempo events (status 0x51 marker uses status = -1) */
  tempo: number;
}

const TEMPO = -1;

/**
 * Parses a format 0/1 (and 2, played as 1) Standard MIDI File into channel events merged by absolute
 * time, with times in seconds following the tempo map. Never throws: malformed data ends the track
 * (or the file) where it breaks.
 */
export function parseMidi(bytes: Uint8Array): MidiSong {
  const song: MidiSong = { format: 0, division: 0, events: [], duration: 0 };
  const raw: RawEvent[] = [];
  const n = bytes.length;
  const u8 = (p: number): number => (p >= 0 && p < n ? bytes[p]! : 0);
  const u16 = (p: number): number => (u8(p) << 8) | u8(p + 1);
  const u32 = (p: number): number => ((u8(p) << 24) | (u8(p + 1) << 16) | (u8(p + 2) << 8) | u8(p + 3)) >>> 0;
  const tag = (p: number): string => String.fromCharCode(u8(p), u8(p + 1), u8(p + 2), u8(p + 3));

  if (n < 14 || tag(0) !== 'MThd') return song;
  const hlen = u32(4);
  song.format = u16(8);
  const ntracks = u16(10);
  const div = u16(12);
  song.division = div & 0x8000 ? 0 : div;
  const tpq = song.division || 96; // SMPTE division ignored: play at 96 ticks per quarter
  let endTick = 0;
  let seq = 0;

  let p = 8 + hlen;
  for (let tr = 0; tr < ntracks && p + 8 <= n; tr++) {
    const id = tag(p);
    const len = u32(p + 4);
    const start = p + 8;
    const end = Math.min(n, start + len);
    p = start + len;
    if (id !== 'MTrk') {
      tr--; // unknown chunk: skip it, it is not a track
      continue;
    }
    let q = start;
    let tick = 0;
    let running = 0;
    const vlq = (): number => {
      let v = 0;
      for (let i = 0; i < 4; i++) {
        if (q >= end) return -1;
        const c = bytes[q++]!;
        v = v * 128 + (c & 0x7f);
        if (!(c & 0x80)) return v;
      }
      return v;
    };
    while (q < end) {
      const delta = vlq();
      if (delta < 0) break;
      tick += delta;
      if (q >= end) break;
      let status = bytes[q]!;
      if (status >= 0x80) q++;
      else if (running) status = running;
      else break; // data without a status: broken track
      if (status === 0xff) {
        running = 0;
        const type = u8(q++);
        const l = vlq();
        if (l < 0 || q + l > end) break;
        if (type === 0x2f) {
          q = end;
        } else if (type === 0x51 && l >= 3) {
          raw.push({ tick, track: tr, seq: seq++, status: TEMPO, data1: 0, data2: 0, tempo: (u8(q) << 16) | (u8(q + 1) << 8) | u8(q + 2) });
        }
        q += l;
      } else if (status === 0xf0 || status === 0xf7) {
        running = 0;
        const l = vlq();
        if (l < 0) break;
        q += l;
      } else if (status >= 0xf0) {
        break; // system common/real time messages do not belong in a file
      } else {
        running = status;
        const two = (status & 0xe0) !== 0xc0; // 0xC0, 0xD0 have one data byte
        if (q + (two ? 2 : 1) > end) break;
        const d1 = bytes[q++]! & 0x7f;
        const d2 = two ? bytes[q++]! & 0x7f : 0;
        raw.push({ tick, track: tr, seq: seq++, status, data1: d1, data2: d2, tempo: 0 });
      }
    }
    if (tick > endTick) endTick = tick;
  }

  // merge by absolute tick; at equal ticks tempo first, then by track and file order
  raw.sort((a, b) => a.tick - b.tick || (a.status === TEMPO ? 0 : 1) - (b.status === TEMPO ? 0 : 1) || a.track - b.track || a.seq - b.seq);

  let usPerQuarter = 500000;
  let lastTick = 0;
  let seconds = 0;
  for (const e of raw) {
    seconds += ((e.tick - lastTick) * usPerQuarter) / (tpq * 1e6);
    lastTick = e.tick;
    if (e.status === TEMPO) {
      if (e.tempo > 0) usPerQuarter = e.tempo;
    } else {
      song.events.push({ time: seconds, tick: e.tick, status: e.status, data1: e.data1, data2: e.data2 });
    }
  }
  song.duration = seconds + ((Math.max(endTick, lastTick) - lastTick) * usPerQuarter) / (tpq * 1e6);
  return song;
}

// ---- the synthesiser ----

const MAX_VOICES = 32;
const LOOKAHEAD = 0.2; // seconds scheduled ahead
const INTERVAL_MS = 50;
const ATTACK = 0.005;
const RELEASE = 0.08; // time constant of the release
const MASTER = 0.5; // gain at full music volume

interface Voice {
  channel: number;
  note: number;
  start: number;
  /** when the release starts, Infinity while the note is held */
  off: number;
  /** when the sources are stopped */
  end: number;
  sources: AudioScheduledSourceNode[];
  oscs: OscillatorNode[];
  gain: GainNode;
}

interface Channel {
  program: number;
  volume: number;
  expression: number;
  pan: number;
  bend: number; // cents
  gain: GainNode | null;
  panner: StereoPannerNode | null;
}

function waveFor(program: number): OscillatorType {
  const family = program >> 3;
  switch (family) {
    case 0: // piano
    case 4: // bass
    case 11: // pad
      return 'triangle';
    case 1: // chromatic percussion
    case 9: // pipe
      return 'sine';
    case 2: // organ
    case 8: // reed
    case 10: // lead
      return 'square';
    default: // guitar, strings, ensemble, brass, effects...
      return 'sawtooth';
  }
}

/** families whose notes die away while held (struck or plucked) */
function decays(program: number): boolean {
  const family = program >> 3;
  return family === 0 || family === 1 || family === 3 || family === 4 || family === 14;
}

const players = new Set<MidiPlayer>();

export class MidiPlayer {
  private ctx: AudioContext;
  private song: MidiSong;
  private master: GainNode | null = null;
  private channels: Channel[] = [];
  private voices: Voice[] = [];
  private timer: ReturnType<typeof setInterval> | null = null;
  private stopTimer: ReturnType<typeof setTimeout> | null = null;
  private startTime = 0;
  private next = 0;
  private volume = 127;
  private isPlaying = false;
  private noise: AudioBuffer | null = null;

  constructor(ctx: AudioContext, midi: Uint8Array) {
    this.ctx = ctx;
    this.song = parseMidi(midi);
  }

  /** Mix_PlayMusic(music, 0) after Mix_VolumeMusic(volume): plays once */
  play(volume: number): void {
    this.cleanup();
    try {
      this.volume = volume;
      this.resetChannels();
      this.master = this.ctx.createGain();
      this.master.gain.value = this.level();
      this.master.connect(this.ctx.destination);
      this.startTime = this.ctx.currentTime + 0.05;
      this.next = 0;
      this.isPlaying = true;
      players.add(this);
      this.timer = setInterval(() => this.pump(), INTERVAL_MS);
      this.pump();
    } catch {
      this.cleanup();
    }
  }

  /** Mix_FadeOutMusic(fadeoutMs) */
  stop(fadeoutMs: number): void {
    if (!this.isPlaying) return;
    if (!(fadeoutMs > 0) || !this.master) {
      this.cleanup();
      return;
    }
    if (this.stopTimer !== null) return; // already fading
    try {
      const g = this.master.gain;
      const now = this.ctx.currentTime;
      g.cancelScheduledValues(now);
      g.setValueAtTime(g.value, now);
      g.linearRampToValueAtTime(0, now + fadeoutMs / 1000);
    } catch {
      this.cleanup();
      return;
    }
    this.stopTimer = setTimeout(() => this.cleanup(), fadeoutMs);
  }

  /** Mix_PlayingMusic */
  playing(): boolean {
    return this.isPlaying;
  }

  /** Mix_VolumeMusic */
  set_volume(volume: number): void {
    this.volume = volume;
    if (this.master && this.stopTimer === null) {
      try {
        this.master.gain.setValueAtTime(this.level(), this.ctx.currentTime);
      } catch {
        /* ignore */
      }
    }
  }

  static stopAll(): void {
    for (const p of [...players]) p.cleanup();
  }

  private level(): number {
    const v = Math.max(0, Math.min(128, this.volume));
    return (v / 128) * MASTER;
  }

  private resetChannels(): void {
    this.channels = [];
    for (let i = 0; i < 16; i++) {
      this.channels.push({ program: 0, volume: 100, expression: 127, pan: 64, bend: 0, gain: null, panner: null });
    }
  }

  private chanOut(c: Channel): AudioNode {
    if (!c.gain) {
      c.gain = this.ctx.createGain();
      c.gain.gain.value = (c.volume / 127) * (c.expression / 127);
      if (typeof this.ctx.createStereoPanner === 'function') {
        c.panner = this.ctx.createStereoPanner();
        c.panner.pan.value = (c.pan - 64) / 64;
        c.gain.connect(c.panner);
        c.panner.connect(this.master!);
      } else {
        c.gain.connect(this.master!);
      }
    }
    return c.gain;
  }

  /** the timer: schedules everything up to LOOKAHEAD ahead, ends the song after its last note */
  private pump(): void {
    if (!this.isPlaying) return;
    try {
      const now = this.ctx.currentTime;
      const horizon = now + LOOKAHEAD;
      const ev = this.song.events;
      while (this.next < ev.length && this.startTime + ev[this.next]!.time < horizon) {
        const e = ev[this.next++]!;
        this.handle(e, Math.max(now, this.startTime + e.time));
      }
      this.voices = this.voices.filter((v) => v.end > now);
      if (this.next >= ev.length) {
        const songEnd = this.startTime + this.song.duration;
        for (const v of this.voices) if (v.off === Infinity && songEnd >= v.start) this.release(v, Math.max(songEnd, v.start + ATTACK));
        if (now > songEnd && this.voices.length === 0) this.cleanup();
      }
    } catch {
      this.cleanup();
    }
  }

  private handle(e: MidiEvent, t: number): void {
    const ch = e.status & 0x0f;
    const c = this.channels[ch]!;
    switch (e.status & 0xf0) {
      case 0x80:
        this.noteOff(ch, e.data1, t);
        break;
      case 0x90:
        if (e.data2 === 0) this.noteOff(ch, e.data1, t);
        else this.noteOn(ch, e.data1, e.data2, t);
        break;
      case 0xb0:
        switch (e.data1) {
          case 7:
            c.volume = e.data2;
            break;
          case 11:
            c.expression = e.data2;
            break;
          case 10:
            c.pan = e.data2;
            if (c.panner) c.panner.pan.setValueAtTime((c.pan - 64) / 64, t);
            return;
          case 120: // all sound off
          case 123: // all notes off
            for (const v of this.voices) if (v.channel === ch) this.release(v, t);
            return;
          case 121: // reset all controllers
            c.volume = 100;
            c.expression = 127;
            c.bend = 0;
            break;
          default:
            return;
        }
        if (c.gain) c.gain.gain.setValueAtTime((c.volume / 127) * (c.expression / 127), t);
        break;
      case 0xc0:
        c.program = e.data1;
        break;
      case 0xe0: {
        c.bend = ((((e.data2 << 7) | e.data1) - 8192) * 200) / 8192;
        if (ch !== 9) for (const v of this.voices) if (v.channel === ch) for (const o of v.oscs) o.detune.setValueAtTime(c.bend, t);
        break;
      }
      default:
        break;
    }
  }

  private noteOff(ch: number, note: number, t: number): void {
    for (const v of this.voices) {
      if (v.channel === ch && v.note === note && v.off === Infinity) {
        this.release(v, Math.max(t, v.start + ATTACK));
        return;
      }
    }
  }

  private release(v: Voice, t: number): void {
    if (v.off !== Infinity) return;
    v.off = t;
    v.end = t + RELEASE * 5;
    const g = v.gain.gain;
    g.cancelScheduledValues(t);
    g.setTargetAtTime(0, t, RELEASE);
    for (const s of v.sources) s.stop(v.end);
  }

  private noteOn(ch: number, note: number, vel: number, t: number): void {
    // steal the oldest voice when all are in use
    const live = this.voices.filter((v) => v.end > t);
    if (live.length >= MAX_VOICES) {
      const oldest = live.reduce((a, b) => (b.start < a.start ? b : a));
      if (oldest.off === Infinity) this.release(oldest, Math.max(t, oldest.start + ATTACK));
      oldest.end = Math.min(oldest.end, t + 0.01);
      for (const s of oldest.sources) s.stop(oldest.end);
      this.voices = this.voices.filter((v) => v !== oldest);
    }
    const c = this.channels[ch]!;
    const out = this.chanOut(c);
    const amp = (vel / 127) * (vel / 127) * 0.3;
    const gain = this.ctx.createGain();
    gain.gain.setValueAtTime(0, t);
    gain.connect(out);
    const v: Voice = { channel: ch, note, start: t, off: Infinity, end: Infinity, sources: [], oscs: [], gain };
    if (ch === 9) this.drum(v, note, amp, t);
    else {
      const o = this.ctx.createOscillator();
      o.type = waveFor(c.program);
      o.frequency.value = 440 * Math.pow(2, (note - 69) / 12);
      o.detune.value = c.bend;
      o.connect(gain);
      o.start(t);
      v.sources.push(o);
      v.oscs.push(o);
      const peak = o.type === 'square' || o.type === 'sawtooth' ? amp * 0.5 : amp;
      gain.gain.linearRampToValueAtTime(peak, t + ATTACK);
      gain.gain.setTargetAtTime(decays(c.program) ? peak * 0.05 : peak * 0.7, t + ATTACK, decays(c.program) ? 0.6 : 0.15);
    }
    for (const s of v.sources) s.onended = () => gain.disconnect();
    this.voices.push(v);
  }

  /** channel 10: short noise bursts and pitched blips by GM drum note */
  private drum(v: Voice, note: number, amp: number, t: number): void {
    const g = v.gain.gain;
    let len: number;
    if (note === 35 || note === 36 || (note >= 41 && note <= 50 && note !== 42 && note !== 44 && note !== 46 && note !== 49)) {
      // bass drum and toms: a sine dropping in pitch
      const kick = note <= 36;
      const f0 = kick ? 150 : 100 + (note - 41) * 25;
      len = kick ? 0.25 : 0.3;
      const o = this.ctx.createOscillator();
      o.type = 'sine';
      o.frequency.setValueAtTime(f0, t);
      o.frequency.exponentialRampToValueAtTime(f0 * 0.35, t + len);
      o.connect(v.gain);
      o.start(t);
      v.sources.push(o);
      g.linearRampToValueAtTime(amp * 1.5, t + ATTACK);
    } else {
      // snares, hats, cymbals, everything else: filtered noise
      let type: BiquadFilterType = 'bandpass';
      let freq = 2000;
      len = 0.12;
      if (note === 38 || note === 40 || note === 37 || note === 39) {
        freq = 1800;
        len = 0.18;
      } else if (note === 42 || note === 44) {
        type = 'highpass';
        freq = 7000;
        len = 0.05;
      } else if (note === 46) {
        type = 'highpass';
        freq = 7000;
        len = 0.3;
      } else if (note === 49 || note === 51 || note === 52 || note === 55 || note === 57 || note === 59) {
        type = 'highpass';
        freq = 5000;
        len = 0.8;
      } else {
        freq = 400 + ((note * 97) % 3000);
      }
      const src = this.ctx.createBufferSource();
      src.buffer = this.noiseBuffer();
      const f = this.ctx.createBiquadFilter();
      f.type = type;
      f.frequency.value = freq;
      src.connect(f);
      f.connect(v.gain);
      src.start(t);
      v.sources.push(src);
      g.linearRampToValueAtTime(amp, t + ATTACK);
    }
    g.setTargetAtTime(0, t + ATTACK, len / 4);
    v.off = t + len; // drums ignore note off
    v.end = t + len + 0.05;
    for (const s of v.sources) s.stop(v.end);
  }

  private noiseBuffer(): AudioBuffer {
    if (!this.noise) {
      const len = Math.floor(this.ctx.sampleRate);
      this.noise = this.ctx.createBuffer(1, len, this.ctx.sampleRate);
      const d = this.noise.getChannelData(0);
      let s = 0x12345678;
      for (let i = 0; i < len; i++) {
        s = (Math.imul(s, 1103515245) + 12345) >>> 0;
        d[i] = (s >>> 16) / 32768 - 1;
      }
    }
    return this.noise;
  }

  /** stops at once and frees every timer and node */
  private cleanup(): void {
    if (this.timer !== null) clearInterval(this.timer);
    if (this.stopTimer !== null) clearTimeout(this.stopTimer);
    this.timer = null;
    this.stopTimer = null;
    for (const v of this.voices) {
      for (const s of v.sources) {
        try {
          s.onended = null;
          s.stop();
        } catch {
          /* not started or already stopped */
        }
      }
      try {
        v.gain.disconnect();
      } catch {
        /* ignore */
      }
    }
    this.voices = [];
    for (const c of this.channels) {
      try {
        c.gain?.disconnect();
        c.panner?.disconnect();
      } catch {
        /* ignore */
      }
      c.gain = null;
      c.panner = null;
    }
    if (this.master) {
      try {
        this.master.disconnect();
      } catch {
        /* ignore */
      }
      this.master = null;
    }
    this.isPlaying = false;
    players.delete(this);
  }
}
