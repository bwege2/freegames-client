// OpenClonk in the browser: the sound library calls of the original on WebAudio, for the translated code.
//
// Which library: the Linux build prefers OpenAL (cmake/FindAudio.cmake: OpenAL with ALUT and Ogg Vorbis, else
// SDL_mixer), so C4SoundSystem, C4SoundInstance, C4SoundLoaders, C4MusicSystem, C4MusicFile and C4SoundModifiers
// run on OpenAL (al*, alc*), ALUT (alut*: WAV files, init) and libvorbisfile (ov_*: Ogg Vorbis to 16-bit PCM). Each
// call is here as `al$<name>` (rt/gl.ts does the same for OpenGL; re/openclonk/tools/al.txt lists them). The
// AudioContext is the page's ctx.audio (alSetAudioContext).
//
// What WebAudio does differently, and how it is bridged:
//  * Decoding Ogg Vorbis. The original decodes every sound when it loads it (VorbisLoader::ReadInfo: ov_open,
//    ov_read into a buffer, alBufferData) and the music while it plays (C4MusicFileOgg::FillBuffer). Browsers decode
//    only asynchronously (decodeAudioData). So the page decodes the Ogg files of the content before the engine starts
//    (`decodeOggVorbis`, at each file's own sample rate, into 16-bit samples the way libvorbis's ov_read rounds them),
//    and the ov_* functions read from those samples synchronously. A file that was not decoded opens like one that
//    is not Ogg Vorbis (OV_ENOTVORBIS), which the original's loader then tries as WAV. Chromium and Firefox decode
//    Ogg Vorbis; Safari only in recent versions (older Safari and iOS Safari cannot, and would have no sounds).
//  * Sources. A source is an AudioBufferSourceNode (made anew for each play, as WebAudio requires) through a
//    PannerNode set up like OpenAL's defaults (inverse distance clamped, reference distance 1, listener at the
//    origin looking down -z) and a GainNode. The original places a sound at (pan, 0, -0.7) (C4SoundInstance.cpp), so
//    the distance is below 1 and only the direction matters; WebAudio pans it with its equal-power law, OpenAL Soft
//    with its own: the stereo balance is close, not equal (no effect on the game).
//  * Queued buffers (the music's stream of 4 × 160 KiB) are scheduled back to back; a buffer counts as processed
//    when its play time is over.
//  * The EFX extension (C4SoundModifiers: reverb, echo, equalizer) is reported missing (alcIsExtensionPresent), so
//    the original disables sound modifiers ("ALExt: No efx extensions available"), as it does on systems without
//    EFX. WebAudio has no counterpart of OpenAL Soft's EFX reverb.
import { Ptr, S } from './ptr.ts';

// ---- al.h, alc.h, vorbisfile's codes
export const AL = {
  NONE: 0, FALSE: 0, TRUE: 1,
  PITCH: 0x1003, POSITION: 0x1004, LOOPING: 0x1007, BUFFER: 0x1009, GAIN: 0x100a,
  SOURCE_STATE: 0x1010, INITIAL: 0x1011, PLAYING: 0x1012, PAUSED: 0x1013, STOPPED: 0x1014,
  BUFFERS_QUEUED: 0x1015, BUFFERS_PROCESSED: 0x1016, SEC_OFFSET: 0x1024, SAMPLE_OFFSET: 0x1025,
  FORMAT_MONO8: 0x1100, FORMAT_MONO16: 0x1101, FORMAT_STEREO8: 0x1102, FORMAT_STEREO16: 0x1103,
  FREQUENCY: 0x2001, BITS: 0x2002, CHANNELS: 0x2003, SIZE: 0x2004,
  NO_ERROR: 0, INVALID_NAME: 0xa001, INVALID_ENUM: 0xa002, INVALID_VALUE: 0xa003, INVALID_OPERATION: 0xa004, OUT_OF_MEMORY: 0xa005,
  AUXILIARY_SEND_FILTER: 0x20006,
} as const;
/** vorbisfile's error codes (vorbis/codec.h) */
export const OV_EREAD = -128, OV_ENOTVORBIS = -132, OV_EINVAL = -131;

// ---- the context

let audio: BaseAudioContext | null = null;
let master: GainNode | null = null;

/** the node every source plays into (before the context's destination): tests listen to the game's output there */
export function alOutput(): AudioNode | null {
  return master;
}

/** the page's AudioContext (ctx.audio); null when the game stops */
export function alSetAudioContext(ctx: BaseAudioContext | null): void {
  for (const s of sources.values()) stopNodes(s);
  sources.clear();
  buffers.clear();
  audio = ctx;
  master = null;
  if (ctx) {
    master = ctx.createGain();
    master.connect(ctx.destination);
  }
}

let error = AL.NO_ERROR as number;
const setError = (e: number) => { if (error === AL.NO_ERROR) error = e; };

interface Buffer { data: AudioBuffer | null; freq: number; channels: number; bits: number; size: number }
interface Queued { id: number; start: number; end: number }
interface Source {
  buffer: number; looping: boolean; gain: number; pitch: number; position: [number, number, number];
  state: number; queue: Queued[]; started: number; nodes: AudioBufferSourceNode[];
  panner: PannerNode | null; gainNode: GainNode | null;
}
const buffers = new Map<number, Buffer>();
const sources = new Map<number, Source>();
let nextName = 1;

function now(): number { return audio?.currentTime ?? 0; }

/** *(p + i) = v for an output pointer */
function store(p: Ptr, i: number, v: number): void {
  if (typeof p.o === 'string') p.a[p.o] = v; else p.a[p.o + i] = v;
}
function load(p: Ptr, i: number): number {
  return Number(typeof p.o === 'string' ? p.a[p.o] : p.a[p.o + i]);
}

// ---- alc: devices and contexts (C4MusicSystem::InitializeMOD, SelectContext, DeinitializeMOD)
const device = { name: 'WebAudio' };
const context = { device };
export function al$alcOpenDevice(_name: Ptr | null): object | null { return audio ? device : null; }
export function al$alcCloseDevice(_d: object): boolean { return true; }
export function al$alcCreateContext(d: object | null, _attrs: Ptr | null): object | null { return d ? context : null; }
export function al$alcMakeContextCurrent(_c: object | null): boolean { return true; }
export function al$alcDestroyContext(_c: object): void {}
/** ALC_EXT_EFX and the rest: not provided (see above) */
export function al$alcIsExtensionPresent(_d: object | null, _name: Ptr): boolean { return false; }
export function al$alGetProcAddress(_name: Ptr): null { return null; }

// ---- alut: init and WAV files (WavLoader::ReadInfo)
export function al$alutInitWithoutContext(_argc: Ptr | null, _argv: Ptr | null): boolean { return true; }
export function al$alutExit(): boolean { return true; }

/** the PCM of a RIFF WAVE file (ALUT reads 8- and 16-bit PCM); null when it is not one */
export function parseWav(bytes: Uint8Array): { channels: number; rate: number; bits: number; data: Uint8Array } | null {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const tag = (o: number) => String.fromCharCode(bytes[o], bytes[o + 1], bytes[o + 2], bytes[o + 3]);
  if (bytes.length < 12 || tag(0) !== 'RIFF' || tag(8) !== 'WAVE') return null;
  let fmt: { channels: number; rate: number; bits: number } | null = null;
  for (let o = 12; o + 8 <= bytes.length;) {
    const id = tag(o), size = v.getUint32(o + 4, true);
    if (id === 'fmt ') {
      if (v.getUint16(o + 8, true) !== 1) return null; // PCM only, as ALUT's loader
      fmt = { channels: v.getUint16(o + 10, true), rate: v.getUint32(o + 12, true), bits: v.getUint16(o + 22, true) };
    } else if (id === 'data' && fmt) {
      return { ...fmt, data: bytes.subarray(o + 8, Math.min(bytes.length, o + 8 + size)) };
    }
    o += 8 + size + (size & 1);
  }
  return null;
}

export function al$alutCreateBufferFromFileImage(data: Ptr, length: number | bigint): number {
  const a = data.a as Uint8Array | Int8Array;
  const bytes = new Uint8Array(a.buffer, a.byteOffset + (data.o as number), Number(length));
  const wav = parseWav(bytes);
  if (!wav || (wav.bits !== 8 && wav.bits !== 16) || (wav.channels !== 1 && wav.channels !== 2)) return AL.NONE;
  const id = nextName++;
  buffers.set(id, { data: null, freq: 0, channels: 0, bits: 0, size: 0 });
  const format = wav.channels === 1 ? (wav.bits === 8 ? AL.FORMAT_MONO8 : AL.FORMAT_MONO16) : (wav.bits === 8 ? AL.FORMAT_STEREO8 : AL.FORMAT_STEREO16);
  al$alBufferData(id, format, new Ptr(wav.data, 0), wav.data.length, wav.rate);
  return id;
}

// ---- al: errors
export function al$alGetError(): number { const e = error; error = AL.NO_ERROR; return e; }
const ERROR_TEXT: Record<number, string> = {
  [AL.NO_ERROR]: 'No Error', [AL.INVALID_NAME]: 'Invalid Name', [AL.INVALID_ENUM]: 'Invalid Enum', [AL.INVALID_VALUE]: 'Invalid Value',
  [AL.INVALID_OPERATION]: 'Invalid Operation', [AL.OUT_OF_MEMORY]: 'Out of Memory',
};
export function al$alGetString(param: number): Ptr | null { return S(ERROR_TEXT[param] ?? 'WebAudio'); }

// ---- al: buffers
export function al$alGenBuffers(n: number, out: Ptr): void {
  for (let i = 0; i < n; i++) {
    const id = nextName++;
    buffers.set(id, { data: null, freq: 0, channels: 0, bits: 0, size: 0 });
    store(out, i, id);
  }
}
export function al$alDeleteBuffers(n: number, ids: Ptr): void {
  for (let i = 0; i < n; i++) buffers.delete(load(ids, i));
}
/** the bytes a `const ALvoid *` points at */
function bytesAt(p: Ptr, size: number): Uint8Array {
  const a = p.a;
  if (ArrayBuffer.isView(a)) {
    const es = (a as unknown as { BYTES_PER_ELEMENT: number }).BYTES_PER_ELEMENT;
    return new Uint8Array(a.buffer, a.byteOffset + (p.o as number) * es, size);
  }
  // a std::vector<BYTE> (C4SoundEffect::Load hands VorbisLoader's sound_data): the translator's array of numbers
  if (Array.isArray(a)) return Uint8Array.from({ length: size }, (_, i) => a[(p.o as number) + i] ?? 0);
  throw new Error('al: sample data that is not an array');
}
export function al$alBufferData(id: number, format: number, data: Ptr, size: number | bigint, freq: number): void {
  const b = buffers.get(id);
  if (!b) { setError(AL.INVALID_NAME); return; }
  const n = Number(size);
  const channels = format === AL.FORMAT_STEREO8 || format === AL.FORMAT_STEREO16 ? 2 : 1;
  const bits = format === AL.FORMAT_MONO8 || format === AL.FORMAT_STEREO8 ? 8 : 16;
  const bytes = bytesAt(data, n);
  const frames = Math.floor(n / (channels * bits / 8));
  b.freq = freq; b.channels = channels; b.bits = bits; b.size = frames * channels * bits / 8;
  if (!audio || frames === 0) { b.data = null; return; }
  const buf = audio.createBuffer(channels, frames, freq);
  const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  for (let c = 0; c < channels; c++) {
    const out = buf.getChannelData(c);
    for (let i = 0; i < frames; i++) {
      out[i] = bits === 16 ? view.getInt16((i * channels + c) * 2, true) / 32768 : (bytes[i * channels + c] - 128) / 128;
    }
  }
  b.data = buf;
}
export function al$alGetBufferi(id: number, param: number, value: Ptr): void {
  const b = buffers.get(id);
  if (!b) { setError(AL.INVALID_NAME); return; }
  const v = param === AL.FREQUENCY ? b.freq : param === AL.CHANNELS ? b.channels : param === AL.BITS ? b.bits : param === AL.SIZE ? b.size : NaN;
  if (Number.isNaN(v)) { setError(AL.INVALID_ENUM); return; }
  store(value, 0, v);
}

// ---- al: sources
export function al$alGenSources(n: number, out: Ptr): void {
  for (let i = 0; i < n; i++) {
    const id = nextName++;
    sources.set(id, { buffer: 0, looping: false, gain: 1, pitch: 1, position: [0, 0, 0], state: AL.INITIAL, queue: [], started: 0, nodes: [], panner: null, gainNode: null });
    store(out, i, id);
  }
}
function stopNodes(s: Source): void {
  for (const n of s.nodes) { try { n.onended = null; n.stop(); } catch { /* not started */ } n.disconnect(); }
  s.nodes = [];
}
export function al$alDeleteSources(n: number, ids: Ptr): void {
  for (let i = 0; i < n; i++) {
    const s = sources.get(load(ids, i));
    if (!s) continue;
    stopNodes(s);
    s.panner?.disconnect();
    s.gainNode?.disconnect();
    sources.delete(load(ids, i));
  }
}
function source(id: number): Source | null {
  const s = sources.get(id);
  if (!s) setError(AL.INVALID_NAME);
  return s ?? null;
}
/** the source's chain: panner -> gain -> the master gain */
function chain(s: Source): AudioNode {
  if (!s.panner && audio && master) {
    s.panner = audio.createPanner();
    s.panner.panningModel = 'equalpower';
    s.panner.distanceModel = 'inverse';
    s.panner.refDistance = 1;
    s.panner.rolloffFactor = 1;
    s.panner.maxDistance = 1e10;
    s.gainNode = audio.createGain();
    s.panner.connect(s.gainNode).connect(master);
    applyParams(s);
  }
  return s.panner!;
}
function applyParams(s: Source): void {
  if (s.panner) {
    s.panner.positionX.value = s.position[0];
    s.panner.positionY.value = s.position[1];
    s.panner.positionZ.value = s.position[2];
  }
  if (s.gainNode) s.gainNode.gain.value = s.gain;
  for (const n of s.nodes) n.playbackRate.value = s.pitch;
}
export function al$alSourcei(id: number, param: number, value: number): void {
  const s = source(id);
  if (!s) return;
  if (param === AL.BUFFER) {
    if (s.state === AL.PLAYING || s.state === AL.PAUSED) { setError(AL.INVALID_OPERATION); return; }
    s.buffer = value;
    s.queue = value ? [{ id: value, start: 0, end: 0 }] : [];
  } else if (param === AL.LOOPING) {
    s.looping = !!value;
    for (const n of s.nodes) n.loop = s.looping;
  } else setError(AL.INVALID_ENUM);
}
export function al$alSourcef(id: number, param: number, value: number): void {
  const s = source(id);
  if (!s) return;
  if (param === AL.GAIN) s.gain = Math.max(0, value);
  else if (param === AL.PITCH) s.pitch = value > 0 ? value : 1;
  else { setError(AL.INVALID_ENUM); return; }
  applyParams(s);
}
export function al$alSource3f(id: number, param: number, x: number, y: number, z: number): void {
  const s = source(id);
  if (!s) return;
  if (param !== AL.POSITION) { setError(AL.INVALID_ENUM); return; }
  s.position = [x, y, z];
  applyParams(s);
}
/** AL_AUXILIARY_SEND_FILTER (EFX): no effect slots without EFX */
export function al$alSource3i(id: number, param: number, _a: number, _b: number, _c: number): void {
  if (!source(id)) return;
  if (param !== AL.AUXILIARY_SEND_FILTER) setError(AL.INVALID_ENUM);
}
/** plays the queue (or the one buffer) from the start, scheduling each buffer after the one before */
export function al$alSourcePlay(id: number): void {
  const s = source(id);
  if (!s) return;
  stopNodes(s);
  s.state = AL.PLAYING;
  s.started = now();
  let t = s.started;
  for (const q of s.queue) t = schedule(s, q, t);
}
function schedule(s: Source, q: Queued, at: number): number {
  const b = buffers.get(q.id);
  q.start = at;
  const duration = b?.data ? b.data.duration / s.pitch : 0;
  q.end = at + duration;
  if (b?.data && audio) {
    const node = audio.createBufferSource();
    node.buffer = b.data;
    node.loop = s.looping && s.queue.length === 1;
    node.playbackRate.value = s.pitch;
    node.connect(chain(s));
    node.start(at);
    s.nodes.push(node);
  }
  return q.end;
}
export function al$alSourceStop(id: number): void {
  const s = source(id);
  if (!s) return;
  stopNodes(s);
  s.state = AL.STOPPED;
  for (const q of s.queue) q.end = Math.min(q.end, now());
}
export function al$alSourceQueueBuffers(id: number, n: number, ids: Ptr): void {
  const s = source(id);
  if (!s) return;
  for (let i = 0; i < n; i++) {
    const q = { id: load(ids, i), start: 0, end: 0 };
    s.queue.push(q);
    if (s.state === AL.PLAYING) {
      const last = s.queue.length > 1 ? s.queue[s.queue.length - 2].end : now();
      schedule(s, q, Math.max(last, now()));
    }
  }
  s.buffer = 0;
}
function processed(s: Source): number {
  if (s.state === AL.INITIAL) return 0;
  const t = now();
  let n = 0;
  for (const q of s.queue) if (s.state === AL.STOPPED || q.end <= t) n++; else break;
  return n;
}
export function al$alSourceUnqueueBuffers(id: number, n: number, ids: Ptr): void {
  const s = source(id);
  if (!s) return;
  if (n > processed(s)) { setError(AL.INVALID_VALUE); return; }
  for (let i = 0; i < n; i++) store(ids, i, s.queue.shift()!.id);
}
/** AL_PLAYING until the last scheduled sample has played (for ever when looping one buffer) */
function state(s: Source): number {
  if (s.state === AL.PLAYING && !(s.looping && s.queue.length === 1)) {
    const end = s.queue.length ? s.queue[s.queue.length - 1].end : s.started;
    if (now() >= end) s.state = AL.STOPPED;
  }
  return s.state;
}
export function al$alGetSourcei(id: number, param: number, value: Ptr): void {
  const s = source(id);
  if (!s) return;
  switch (param) {
    case AL.SOURCE_STATE: store(value, 0, state(s)); break;
    case AL.BUFFERS_QUEUED: store(value, 0, s.queue.length); break;
    case AL.BUFFERS_PROCESSED: state(s); store(value, 0, processed(s)); break;
    case AL.LOOPING: store(value, 0, s.looping ? 1 : 0); break;
    case AL.BUFFER: store(value, 0, s.buffer); break;
    default: setError(AL.INVALID_ENUM);
  }
}
/** AL_SEC_OFFSET: the play position in the current buffer, in seconds of its own time */
export function al$alGetSourcef(id: number, param: number, value: Ptr): void {
  const s = source(id);
  if (!s) return;
  if (param !== AL.SEC_OFFSET) { setError(AL.INVALID_ENUM); return; }
  if (state(s) !== AL.PLAYING && s.state !== AL.PAUSED) { store(value, 0, 0); return; }
  const t = now();
  const q = s.queue.find((x) => t < x.end) ?? s.queue[0];
  const b = q ? buffers.get(q.id) : undefined;
  let pos = q ? (t - q.start) * s.pitch : 0;
  if (b?.data && s.looping) pos %= b.data.duration;
  store(value, 0, Math.max(0, pos));
}

// ---- EFX (alGetProcAddress gives none of them, so the original does not call these; here for completeness)
export function al$alIsEffect(_e: number): boolean { return false; }
export function al$alIsAuxiliaryEffectSlot(_s: number): boolean { return false; }
export function al$alGenEffects(n: number, out: Ptr): void { for (let i = 0; i < n; i++) store(out, i, 0); setError(AL.INVALID_OPERATION); }
export function al$alDeleteEffects(_n: number, _ids: Ptr): void {}
export function al$alGenAuxiliaryEffectSlots(n: number, out: Ptr): void { for (let i = 0; i < n; i++) store(out, i, 0); setError(AL.INVALID_OPERATION); }
export function al$alDeleteAuxiliaryEffectSlots(_n: number, _ids: Ptr): void {}
export function al$alEffecti(_e: number, _p: number, _v: number): void { setError(AL.INVALID_NAME); }
export function al$alEffectf(_e: number, _p: number, _v: number): void { setError(AL.INVALID_NAME); }
export function al$alAuxiliaryEffectSloti(_s: number, _p: number, _v: number): void { setError(AL.INVALID_NAME); }

// ---- vorbisfile on the samples decoded before the start

interface Vorbis {
  channels: number; rate: number; samples: number; pcm: Int16Array; vendor: string; comments: string[];
  /** music decoded while it plays: the samples of `pcm` usable so far (all of them once `rest` has decoded the file) */
  usable?: number; rest?: () => void; bytes?: Uint8Array;
}
const decoded = new Map<string, Vorbis>();

/** a key of the file's bytes (FNV-1a over all of them, and the length) */
export function vorbisKey(bytes: Uint8Array): string {
  let h = 0x811c9dc5;
  for (let i = 0; i < bytes.length; i++) h = Math.imul(h ^ bytes[i], 0x01000193);
  return `${bytes.length}:${(h >>> 0).toString(16)}`;
}

/** the first packets of an Ogg stream (enough for the Vorbis headers), and the last granule position */
export function oggHeaders(bytes: Uint8Array): { packets: Uint8Array[]; granule: number } | null {
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  const packets: Uint8Array[] = [];
  let current: number[] = [];
  let granule = 0;
  for (let o = 0; o + 27 <= bytes.length;) {
    if (bytes[o] !== 0x4f || bytes[o + 1] !== 0x67 || bytes[o + 2] !== 0x67 || bytes[o + 3] !== 0x53) return packets.length ? { packets, granule } : null;
    const g = Number(v.getBigInt64(o + 6, true));
    if (g >= 0) granule = g;
    const segments = bytes[o + 26];
    let data = o + 27 + segments;
    for (let i = 0; i < segments; i++) {
      const len = bytes[o + 27 + i];
      if (packets.length < 3) for (let k = 0; k < len; k++) current.push(bytes[data + k]);
      data += len;
      if (len < 255 && packets.length < 3) { packets.push(Uint8Array.from(current)); current = []; }
    }
    o = data;
  }
  return { packets, granule };
}

/** the identification and comment headers of a Vorbis stream */
export function vorbisInfo(bytes: Uint8Array): { channels: number; rate: number; samples: number; vendor: string; comments: string[] } | null {
  const ogg = oggHeaders(bytes);
  if (!ogg || ogg.packets.length < 2) return null;
  const [id, comment] = ogg.packets;
  const isHeader = (p: Uint8Array, type: number) => p[0] === type && String.fromCharCode(...p.subarray(1, 7)) === 'vorbis';
  if (!isHeader(id, 1) || !isHeader(comment, 3)) return null;
  const iv = new DataView(id.buffer, id.byteOffset, id.byteLength);
  const cv = new DataView(comment.buffer, comment.byteOffset, comment.byteLength);
  const text = (o: number, n: number) => new TextDecoder().decode(comment.subarray(o, o + n));
  let o = 7;
  const vendorLen = cv.getUint32(o, true);
  const vendor = text(o + 4, vendorLen);
  o += 4 + vendorLen;
  const count = cv.getUint32(o, true);
  o += 4;
  const comments: string[] = [];
  for (let i = 0; i < count && o + 4 <= comment.length; i++) {
    const n = cv.getUint32(o, true);
    comments.push(text(o + 4, n));
    o += 4 + n;
  }
  return { channels: id[11], rate: iv.getUint32(12, true), samples: ogg.granule, vendor, comments };
}

/**
 * Decodes an Ogg Vorbis file with the browser's decoder at the file's own sample rate, into the 16-bit samples
 * libvorbis's ov_read gives (vorbis_fpu: floor(x * 32768 + 0.5), clipped). Afterwards the ov_* functions find it.
 */
export async function decodeOggVorbis(bytes: Uint8Array): Promise<boolean> {
  const key = vorbisKey(bytes);
  if (decoded.has(key)) return true;
  const info = vorbisInfo(bytes);
  if (!info || !info.channels || !info.rate) return false;
  const offline = new OfflineAudioContext(info.channels, 1, info.rate);
  let buf: AudioBuffer;
  try {
    buf = await offline.decodeAudioData(bytes.slice().buffer);
  } catch {
    return false;
  }
  const frames = info.samples > 0 ? Math.min(buf.length, info.samples) : buf.length;
  const pcm = new Int16Array(frames * info.channels);
  for (let c = 0; c < info.channels; c++) {
    const ch = buf.getChannelData(Math.min(c, buf.numberOfChannels - 1));
    for (let i = 0; i < frames; i++) {
      const v = Math.floor(ch[i] * 32768 + 0.5);
      pcm[i * info.channels + c] = v > 32767 ? 32767 : v < -32768 ? -32768 : v;
    }
  }
  decoded.set(key, { channels: info.channels, rate: info.rate, samples: frames, pcm, vendor: info.vendor, comments: info.comments });
  return true;
}

/** decodes bytes (a whole Ogg Vorbis stream or its first pages) into 16-bit samples as ov_read gives them */
async function decodePcm(bytes: Uint8Array, channels: number, rate: number, samples: number): Promise<Int16Array | null> {
  const offline = new OfflineAudioContext(channels, 1, rate);
  let buf: AudioBuffer;
  try {
    buf = await offline.decodeAudioData(bytes.slice().buffer);
  } catch {
    return null;
  }
  const frames = samples > 0 ? Math.min(buf.length, samples) : buf.length;
  const pcm = new Int16Array(frames * channels);
  for (let c = 0; c < channels; c++) {
    const ch = buf.getChannelData(Math.min(c, buf.numberOfChannels - 1));
    for (let i = 0; i < frames; i++) {
      const v = Math.floor(ch[i] * 32768 + 0.5);
      pcm[i * channels + c] = v > 32767 ? 32767 : v < -32768 ? -32768 : v;
    }
  }
  return pcm;
}

/** how many seconds of a piece of music are decoded before the game starts (MUSIC_PREFIX) and how many of them are
 *  used before the rest of the piece is decoded (the decoder's last frames of a cut stream are not those of the whole) */
export const MUSIC_PREFIX = 24, MUSIC_PREFIX_USED = 20;

/**
 * Music, decoded while it plays (C4MusicFileOgg streams it: ov_read 160 KiB at a time). Decoding is asynchronous in
 * the browser, ov_read is not; so the first MUSIC_PREFIX seconds of each piece (its first Ogg pages) are decoded
 * before the game starts, and when the original opens the piece (ov_open_callbacks) the whole file is decoded in the
 * background; ov_read gives the first seconds meanwhile (four buffers of 160 KiB are 3.7 s at 44.1 kHz stereo; the
 * whole decode takes well under a second in Chromium). Should the decode not have finished when the first seconds
 * are used up, ov_read gives silence until it has.
 */
export async function decodeOggVorbisStart(bytes: Uint8Array): Promise<boolean> {
  const key = vorbisKey(bytes);
  if (decoded.has(key)) return true;
  const info = vorbisInfo(bytes);
  if (!info || !info.channels || !info.rate) return false;
  // the first pages up to MUSIC_PREFIX seconds (granule positions count samples)
  const v = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
  let end = 0;
  for (let o = 0; o + 27 <= bytes.length;) {
    if (bytes[o] !== 0x4f || bytes[o + 1] !== 0x67 || bytes[o + 2] !== 0x67 || bytes[o + 3] !== 0x53) break;
    const g = Number(v.getBigInt64(o + 6, true));
    let size = 27 + bytes[o + 26];
    for (let i = 0; i < bytes[o + 26]; i++) size += bytes[o + 27 + i];
    o += size;
    end = o;
    if (g >= MUSIC_PREFIX * info.rate) break;
  }
  const pcm = await decodePcm(bytes.subarray(0, end), info.channels, info.rate, 0);
  if (!pcm) return false;
  const entry: Vorbis = {
    channels: info.channels, rate: info.rate, samples: info.samples, pcm, vendor: info.vendor, comments: info.comments,
    usable: end >= bytes.length ? pcm.length / info.channels : Math.min(pcm.length / info.channels, MUSIC_PREFIX_USED * info.rate),
    bytes,
  };
  entry.rest = () => {
    entry.rest = undefined;
    if (end >= bytes.length) { entry.usable = undefined; return; }
    void decodePcm(bytes, info.channels, info.rate, info.samples).then((all) => {
      if (all) { entry.pcm = all; entry.usable = undefined; entry.bytes = undefined; }
    });
  };
  decoded.set(key, entry);
  return true;
}

/** for tests without a browser: samples of a file as if decoded */
export function setDecodedVorbis(bytes: Uint8Array, pcm: Int16Array): void {
  const info = vorbisInfo(bytes);
  if (!info) throw new Error('not Ogg Vorbis');
  decoded.set(vorbisKey(bytes), { channels: info.channels, rate: info.rate, samples: pcm.length / info.channels, pcm, vendor: info.vendor, comments: info.comments });
}

interface OvState { v: Vorbis; pos: number; comment: unknown }
/** the state of an OggVorbis_File: kept on the object the original passes (its fields are libvorbis's own) */
function ov(vf: any): OvState | null { return vf?.$ov ?? null; }

/**
 * ov_open_callbacks: reads the whole file through the original's read callback (VorbisLoader::mem_read_func or
 * file_read_func; their size_t arguments and result are numbers, as the translator gives size_t), then looks for its
 * samples.
 */
export function al$ov_open_callbacks(datasource: unknown, vf: any, _initial: unknown, _ibytes: unknown, callbacks: any): number {
  const chunks: Uint8Array[] = [];
  const chunk = new Int8Array(64 * 1024);
  for (let total = 0; ; ) {
    const r = Number(callbacks.read_func(new Ptr(chunk, 0), 1, chunk.length, datasource));
    if (!(r > 0)) break;
    chunks.push(new Uint8Array(chunk.buffer, 0, r).slice());
    total += r;
    if (total > 256 << 20) return OV_EREAD;
  }
  const bytes = new Uint8Array(chunks.reduce((n, c) => n + c.length, 0));
  let o = 0;
  for (const c of chunks) { bytes.set(c, o); o += c.length; }
  const v = decoded.get(vorbisKey(bytes));
  if (!v) return OV_ENOTVORBIS;
  // music: the rest of the piece is decoded now, while its first seconds play
  v.rest?.();
  if (vf && typeof vf === 'object') vf.$ov = { v, pos: 0, comment: null } satisfies OvState;
  return 0;
}
export function al$ov_clear(vf: any): number {
  if (vf && typeof vf === 'object') delete vf.$ov;
  return 0;
}
/** vorbis_info: `long rate`, a number as the translator gives 64-bit integers that hold small values (`$u64n`) */
export function al$ov_info(vf: any, _link: number): { version: number; channels: number; rate: number } | null {
  const s = ov(vf);
  return s ? { version: 0, channels: s.v.channels, rate: s.v.rate } : null;
}
export function al$ov_time_total(vf: any, _link: number): number {
  const s = ov(vf);
  return s ? s.v.samples / s.v.rate : OV_EINVAL;
}
/** ov_read: little-endian (bigendianp 0), 16-bit (word 2), signed samples, interleaved; returns bytes (a long, a number in the translated code) */
export function al$ov_read(vf: any, buffer: Ptr, length: number, bigendianp: number, word: number, sgned: number, bitstream: Ptr | null): number {
  const s = ov(vf);
  if (!s) return OV_EINVAL;
  if (bigendianp || word !== 2 || !sgned) throw new Error('ov_read: only 16-bit signed little-endian, as the original reads');
  if (bitstream) store(bitstream, 0, 0);
  const frameBytes = 2 * s.v.channels;
  if (s.v.usable !== undefined && s.pos >= s.v.usable && s.pos < s.v.samples) {
    // music whose rest is still being decoded: silence for now (rare: the decode is much faster than the playback)
    const n = Math.min(Math.floor(length / frameBytes), s.v.samples - s.pos) * frameBytes;
    for (let i = 0; i < n; i++) buffer.a[buffer.o + i] = 0;
    return n;
  }
  const frames = Math.min(Math.floor(length / frameBytes), (s.v.usable ?? s.v.samples) - s.pos);
  if (frames <= 0) return 0;
  const out = new Uint8Array(s.v.pcm.buffer, s.v.pcm.byteOffset + s.pos * frameBytes, frames * frameBytes);
  const a = buffer.a as Int8Array | Uint8Array | number[];
  if (ArrayBuffer.isView(a)) {
    const dest = new Uint8Array(a.buffer, a.byteOffset + (buffer.o as number) * ((a as unknown as { BYTES_PER_ELEMENT: number }).BYTES_PER_ELEMENT ?? 1), out.length);
    dest.set(out);
  } else {
    // a std::vector<BYTE> (VorbisLoader::ReadInfo's sound_data): the translator's array of numbers
    for (let i = 0; i < out.length; i++) a[(buffer.o as number) + i] = out[i];
  }
  s.pos += frames;
  return out.length;
}
export function al$ov_time_seek(vf: any, seconds: number): number {
  const s = ov(vf);
  if (!s) return OV_EINVAL;
  s.pos = Math.max(0, Math.min(s.v.samples, Math.floor(seconds * s.v.rate)));
  return 0;
}
/** ov_raw_seek: the original only rewinds (C4MusicFileOgg::FillBuffer, ov_raw_seek(&ogg_file, 0)) */
export function al$ov_raw_seek(vf: any, pos: number | bigint): number {
  const s = ov(vf);
  if (!s) return OV_EINVAL;
  if (Number(pos) !== 0) throw new Error('ov_raw_seek: only to the start');
  s.pos = 0;
  return 0;
}
/** vorbis_comment: user_comments (char **), comment_lengths (int *), comments, vendor */
export function al$ov_comment(vf: any, _link: number): object | null {
  const s = ov(vf);
  if (!s) return null;
  if (!s.comment) {
    const enc = new TextEncoder();
    const strs = s.v.comments.map((c) => { const b = enc.encode(c); const a = new Int8Array(b.length + 1); a.set(b); return a; });
    s.comment = {
      user_comments: new Ptr(strs.map((a) => new Ptr(a, 0)), 0),
      comment_lengths: new Ptr(Int32Array.from(strs.map((a) => a.length - 1)), 0),
      comments: strs.length,
      vendor: S(s.v.vendor),
    };
  }
  return s.comment as object;
}

/** every C function of this module (re/openclonk/tools/al.txt lists the same) */
export const AL_FUNCTIONS: readonly string[] = [
  'alcOpenDevice', 'alcCloseDevice', 'alcCreateContext', 'alcMakeContextCurrent', 'alcDestroyContext', 'alcIsExtensionPresent', 'alGetProcAddress',
  'alutInitWithoutContext', 'alutExit', 'alutCreateBufferFromFileImage',
  'alGetError', 'alGetString', 'alGenBuffers', 'alDeleteBuffers', 'alBufferData', 'alGetBufferi',
  'alGenSources', 'alDeleteSources', 'alSourcei', 'alSourcef', 'alSource3f', 'alSource3i', 'alSourcePlay', 'alSourceStop',
  'alSourceQueueBuffers', 'alSourceUnqueueBuffers', 'alGetSourcei', 'alGetSourcef',
  'alIsEffect', 'alIsAuxiliaryEffectSlot', 'alGenEffects', 'alDeleteEffects', 'alGenAuxiliaryEffectSlots', 'alDeleteAuxiliaryEffectSlots',
  'alEffecti', 'alEffectf', 'alAuxiliaryEffectSloti',
  'ov_open_callbacks', 'ov_clear', 'ov_info', 'ov_time_total', 'ov_read', 'ov_time_seek', 'ov_raw_seek', 'ov_comment',
];
