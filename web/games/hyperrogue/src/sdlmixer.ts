// The parts of SDL_mixer that sound.cpp uses, on Web Audio (ctx.audio of the website): one music stream with its
// volume and linear fades (Mix_Music: an <audio> element routed through the AudioContext, streamed as SDL_mixer
// streams it, not decoded whole), and 16 mixing channels for the sound effects (Mix_Chunk: a decoded AudioBuffer;
// the chunk's volume is a gain node every playing copy of the chunk goes through, as SDL_mixer applies a chunk's
// volume when it mixes). Volumes are SDL_mixer's 0..128 (MIX_MAX_VOLUME), linear. The mixer's clock is the
// AudioContext's (currentTime, in ms here).
// Loading is asynchronous in the browser (SDL_mixer loads synchronously): Mix_LoadMUS and Mix_LoadWAV return a
// handle at once; a music handle is played only when Mix_MusicReady (sound.ts waits for it); a sound played
// before its chunk is decoded starts when it is. A file the browser cannot fetch or decode (no Ogg Vorbis
// support) gives a handle that never plays: the game stays silent instead of failing.
// (C) Zeno Rogue, GPL-2.0-or-later (HyperRogue); TypeScript port. The behaviour follows SDL_mixer 2 (zlib license).

export const MIX_MAX_VOLUME = 128;

// --- the parts of Web Audio used (structural, so that the tests can pass a fake context) ---
export interface MixParam {
  value: number;
  setValueAtTime(v: number, t: number): unknown;
  linearRampToValueAtTime(v: number, t: number): unknown;
  cancelScheduledValues(t: number): unknown;
}
export interface MixNode { connect(n: MixNode): unknown; disconnect(): void; }
export interface MixGain extends MixNode { gain: MixParam; }
export interface MixBufferSource extends MixNode {
  buffer: unknown;
  onended: (() => void) | null;
  start(when?: number): void;
  stop(): void;
}
export interface MixMediaElement {
  src: string;
  loop: boolean;
  preload: string;
  currentTime: number;
  readonly duration: number;
  play(): Promise<void>;
  pause(): void;
  load(): void;
  removeAttribute(name: string): void;
  addEventListener(type: string, f: () => void, opts?: { once?: boolean }): void;
}
export interface MixAudioContext {
  readonly currentTime: number;
  readonly destination: MixNode;
  createGain(): MixGain;
  createBufferSource(): MixBufferSource;
  createMediaElementSource(el: never): MixNode;
  decodeAudioData(data: ArrayBuffer): Promise<unknown>;
}
/** how the mixer gets its files: an <audio> element for a music file, the bytes of a sound file */
export interface MixLoader {
  media(url: string): MixMediaElement | null;
  fetch(url: string): Promise<ArrayBuffer>;
}

const Fading = { NONE: 0, IN: 1, OUT: 2 } as const;
type Fading = 0 | 1 | 2;

export class Mix_Music {
  el: MixMediaElement | null = null;
  node: MixNode | null = null;
  ready = false;
  failed = false;
  readonly file: string;
  constructor(file: string) { this.file = file; }
}

export class Mix_Chunk {
  buffer: unknown = null;
  failed = false;
  volume = MIX_MAX_VOLUME;
  gain: MixGain | null = null;
  /** channels that wait for the chunk to be decoded */
  waiting: number[] = [];
  readonly file: string;
  constructor(file: string) { this.file = file; }
}

interface channel_t { chunk: Mix_Chunk | null; source: MixBufferSource | null; }

/** the mixer (one per game: opened by initAudio, closed when the game stops) */
const mixer = {
  ctx: null as MixAudioContext | null,
  loader: null as MixLoader | null,
  error: '',
  // the music
  music_gain: null as MixGain | null,
  music_volume: MIX_MAX_VOLUME,
  music_playing: null as Mix_Music | null,
  fading: Fading.NONE as Fading,
  fade_start: 0, // ms (mixer clock)
  fade_ms: 0,
  fade_from: 1, // fade level (0..1) at fade_start
  fade_to: 1,
  // the sound effects
  channels: [] as channel_t[],
};

export function Mix_GetError(): string { return mixer.error; }

/** the mixer's clock in ms */
export function mix_ticks(): number { return mixer.ctx ? mixer.ctx.currentTime * 1000 : 0; }

/** Mix_OpenAudio: the website's AudioContext and how to load files; 0 on success, -1 without audio */
export function Mix_OpenAudio(ctx: MixAudioContext | null, loader: MixLoader | null): number {
  Mix_CloseAudio();
  if (!ctx || !loader) { mixer.error = 'No audio context'; return -1; }
  try {
    mixer.ctx = ctx;
    mixer.loader = loader;
    mixer.music_gain = ctx.createGain();
    mixer.music_gain.connect(ctx.destination);
    mixer.music_volume = MIX_MAX_VOLUME;
    mixer.music_playing = null;
    mixer.fading = Fading.NONE;
    music_apply_gain();
    return 0;
  } catch (e) {
    mixer.ctx = null;
    mixer.loader = null;
    mixer.error = String(e);
    return -1;
  }
}

/** Mix_CloseAudio: everything stops */
export function Mix_CloseAudio(): void {
  if (!mixer.ctx) return;
  Mix_HaltMusic();
  for (let ch = 0; ch < mixer.channels.length; ch++) Mix_HaltChannel(ch);
  try { mixer.music_gain?.disconnect(); } catch { /* closed */ }
  mixer.ctx = null;
  mixer.loader = null;
  mixer.music_gain = null;
  mixer.channels = [];
}

export function Mix_AllocateChannels(n: number): number {
  while (mixer.channels.length > n) { Mix_HaltChannel(mixer.channels.length - 1); mixer.channels.pop(); }
  while (mixer.channels.length < n) mixer.channels.push({ chunk: null, source: null });
  return mixer.channels.length;
}

// --- music ---

/** the fade level (0..1) at time t (ms) */
function fade_level(t: number): number {
  if (mixer.fading === Fading.NONE) return 1;
  if (mixer.fade_ms <= 0 || t >= mixer.fade_start + mixer.fade_ms) return mixer.fade_to;
  if (t <= mixer.fade_start) return mixer.fade_from;
  return mixer.fade_from + (mixer.fade_to - mixer.fade_from) * (t - mixer.fade_start) / mixer.fade_ms;
}

/** the music's gain now (volume/128 times the fade level) */
export function mix_music_gain(): number {
  if (!mixer.music_playing) return 0;
  return mixer.music_volume / MIX_MAX_VOLUME * fade_level(mix_ticks());
}

/** sets the music gain node to the volume and the fade in progress */
function music_apply_gain(): void {
  const g = mixer.music_gain;
  if (!g || !mixer.ctx) return;
  const now = mixer.ctx.currentTime;
  const t = now * 1000;
  const vol = mixer.music_volume / MIX_MAX_VOLUME;
  try {
    g.gain.cancelScheduledValues(now);
    g.gain.setValueAtTime(vol * fade_level(t), now);
    if (mixer.fading !== Fading.NONE && t < mixer.fade_start + mixer.fade_ms)
      g.gain.linearRampToValueAtTime(vol * mixer.fade_to, (mixer.fade_start + mixer.fade_ms) / 1000);
  } catch {
    g.gain.value = vol * fade_level(t);
  }
}

/** the end of a fade: a fade-out halts the music (SDL_mixer's music_mixer) */
function music_update(): void {
  if (!mixer.music_playing || mixer.fading === Fading.NONE) return;
  if (mix_ticks() < mixer.fade_start + mixer.fade_ms) return;
  if (mixer.fading === Fading.OUT) music_internal_halt();
  else mixer.fading = Fading.NONE;
}

function music_internal_halt(): void {
  const m = mixer.music_playing;
  mixer.music_playing = null;
  mixer.fading = Fading.NONE;
  if (m?.el) { try { m.el.pause(); } catch { /* gone */ } }
}

/** Mix_LoadMUS: starts loading the file (null if there is no such file or no mixer) */
export function Mix_LoadMUS(url: string | null): Mix_Music | null {
  if (!mixer.loader || !mixer.ctx || !mixer.music_gain || !url) { mixer.error = 'Couldn\'t open music file'; return null; }
  const m = new Mix_Music(url);
  let el: MixMediaElement | null = null;
  try { el = mixer.loader.media(url); } catch { el = null; }
  if (!el) { mixer.error = 'Unrecognized audio format'; return null; }
  m.el = el;
  el.loop = true;
  el.preload = 'auto';
  el.addEventListener('canplay', () => { if (!m.failed) m.ready = true; }, { once: true });
  el.addEventListener('error', () => {
    m.failed = true; m.ready = false;
    if (mixer.music_playing === m) music_internal_halt();
  }, { once: true });
  try {
    m.node = mixer.ctx.createMediaElementSource(el as never);
    m.node.connect(mixer.music_gain);
  } catch {
    m.failed = true;
    return m;
  }
  el.src = url;
  try { el.load(); } catch { /* starts on its own */ }
  return m;
}

/** a music handle that can be played now (loaded, decodable) */
export function Mix_MusicReady(m: Mix_Music | null): boolean { return !!m && m.ready && !m.failed; }

export function Mix_FreeMusic(m: Mix_Music | null): void {
  if (!m) return;
  if (mixer.music_playing === m) music_internal_halt();
  m.ready = false;
  m.failed = true;
  if (m.el) {
    try { m.el.pause(); m.el.removeAttribute('src'); m.el.load(); } catch { /* gone */ }
  }
  try { m.node?.disconnect(); } catch { /* gone */ }
  m.el = null;
  m.node = null;
}

/** Mix_PlayingMusic: 1 while music plays (fading in or out included) */
export function Mix_PlayingMusic(): number {
  music_update();
  return mixer.music_playing ? 1 : 0;
}

/** Mix_VolumeMusic(volume): sets the volume (0..128) if volume >= 0; returns the previous volume */
export function Mix_VolumeMusic(volume: number): number {
  const prev = mixer.music_volume;
  if (volume >= 0) {
    if (volume > MIX_MAX_VOLUME) volume = MIX_MAX_VOLUME;
    mixer.music_volume = volume;
    music_apply_gain();
  }
  return prev;
}

/** Mix_FadeOutMusic(ms): fades the music out over ms, then halts it. A fade already in progress keeps its
 *  progress: from the level it has reached it goes down at the new rate (SDL_mixer's fade_step rescaling) */
export function Mix_FadeOutMusic(ms: number): number {
  music_update();
  if (!mixer.music_playing) return 0;
  if (ms <= 0) { music_internal_halt(); return 1; }
  const t = mix_ticks();
  const level = fade_level(t);
  mixer.fading = Fading.OUT;
  mixer.fade_start = t;
  mixer.fade_ms = ms * level;
  mixer.fade_from = level;
  mixer.fade_to = 0;
  if (mixer.fade_ms <= 0) { music_internal_halt(); return 1; }
  music_apply_gain();
  return 1;
}

export function Mix_HaltMusic(): number {
  music_internal_halt();
  return 0;
}

/** Mix_FadeInMusicPos(music, loops, ms, position): halts the music playing and starts this one at position
 *  (seconds), fading in over ms. Only endless loops (-1) are used. Ogg Vorbis cannot seek past the end
 *  (ov_time_seek fails): the music then does not start and -1 is returned, as in SDL_mixer 2 */
export function Mix_FadeInMusicPos(m: Mix_Music | null, loops: number, ms: number, position: number): number {
  if (!m || !Mix_MusicReady(m) || !m.el) { mixer.error = 'music parameter was NULL'; return -1; }
  music_internal_halt();
  const el = m.el;
  el.loop = loops !== 0;
  const d = el.duration;
  if (position > 0 && Number.isFinite(d) && position >= d) { mixer.error = 'ov_time_seek failed'; return -1; }
  try { el.currentTime = position > 0 ? position : 0; } catch { mixer.error = 'Position not implemented'; return -1; }
  mixer.music_playing = m;
  const t = mix_ticks();
  if (ms > 0) {
    mixer.fading = Fading.IN;
    mixer.fade_start = t;
    mixer.fade_ms = ms;
    mixer.fade_from = 0;
    mixer.fade_to = 1;
  }
  else mixer.fading = Fading.NONE;
  music_apply_gain();
  let p: Promise<void> | undefined;
  try { p = el.play(); } catch { p = Promise.reject(new Error('play')); }
  // the browser refused to play (autoplay rules) or cannot decode: this music stays silent
  p?.catch?.(() => {
    m.failed = true; m.ready = false;
    if (mixer.music_playing === m) music_internal_halt();
  });
  return 0;
}

// --- sound effects ---

/** Mix_LoadWAV: starts loading and decoding the file (null if there is no such file or no mixer) */
export function Mix_LoadWAV(url: string | null): Mix_Chunk | null {
  const ctx = mixer.ctx, loader = mixer.loader;
  if (!ctx || !loader || !url) { mixer.error = 'Couldn\'t open sound file'; return null; }
  const c = new Mix_Chunk(url);
  try {
    c.gain = ctx.createGain();
    c.gain.gain.value = c.volume / MIX_MAX_VOLUME;
    c.gain.connect(ctx.destination);
  } catch { return null; }
  loader.fetch(url).then((data) => ctx.decodeAudioData(data)).then((b) => {
    if (mixer.ctx !== ctx || c.failed) return;
    c.buffer = b;
    const w = c.waiting;
    c.waiting = [];
    for (const ch of w) if (mixer.channels[ch]?.chunk === c && !mixer.channels[ch].source) channel_start(ch);
  }, () => {
    c.failed = true;
    for (const ch of c.waiting) if (mixer.channels[ch]?.chunk === c) mixer.channels[ch].chunk = null;
    c.waiting = [];
  });
  return c;
}

/** Mix_VolumeChunk(chunk, volume): 0..128 (more is 128), for every copy of the chunk that plays */
export function Mix_VolumeChunk(c: Mix_Chunk | null, volume: number): number {
  if (!c) return -1;
  const prev = c.volume;
  if (volume >= 0) {
    if (volume > MIX_MAX_VOLUME) volume = MIX_MAX_VOLUME;
    c.volume = volume;
    if (c.gain) c.gain.gain.value = volume / MIX_MAX_VOLUME;
  }
  return prev;
}

function channel_start(ch: number): void {
  const chan = mixer.channels[ch];
  const c = chan.chunk;
  if (!c || !mixer.ctx || !c.gain) return;
  try {
    const s = mixer.ctx.createBufferSource();
    s.buffer = c.buffer;
    s.connect(c.gain);
    s.onended = () => {
      if (chan.source === s) { chan.source = null; chan.chunk = null; }
      try { s.disconnect(); } catch { /* gone */ }
    };
    chan.source = s;
    s.start();
  } catch {
    chan.source = null;
    chan.chunk = null;
  }
}

/** Mix_PlayChannel(-1, chunk, 0): plays the chunk once on the first free channel; -1 if all are busy */
export function Mix_PlayChannel(channel: number, c: Mix_Chunk | null, _loops: number): number {
  if (!c || c.failed || !mixer.ctx) return -1;
  let ch = channel;
  if (ch < 0) {
    ch = -1;
    for (let i = 0; i < mixer.channels.length; i++) if (!mixer.channels[i].chunk) { ch = i; break; }
    if (ch < 0) { mixer.error = 'No free channels available'; return -1; }
  }
  else {
    if (ch >= mixer.channels.length) return -1;
    Mix_HaltChannel(ch);
  }
  mixer.channels[ch].chunk = c;
  if (c.buffer) channel_start(ch);
  else c.waiting.push(ch);
  return ch;
}

export function Mix_HaltChannel(ch: number): number {
  const chan = mixer.channels[ch];
  if (!chan) return 0;
  const s = chan.source;
  chan.source = null;
  chan.chunk = null;
  if (s) { try { s.stop(); } catch { /* ended */ } try { s.disconnect(); } catch { /* gone */ } }
  return 0;
}

/** Mix_GetChunk(channel): the chunk the channel plays (or waits to play) */
export function Mix_GetChunk(ch: number): Mix_Chunk | null { return mixer.channels[ch]?.chunk ?? null; }

export function Mix_FreeChunk(c: Mix_Chunk | null): void {
  if (!c) return;
  for (let ch = 0; ch < mixer.channels.length; ch++) if (mixer.channels[ch].chunk === c) Mix_HaltChannel(ch);
  c.failed = true;
  c.buffer = null;
  c.waiting = [];
  try { c.gain?.disconnect(); } catch { /* gone */ }
}
