// X-Moto replays (.rpl, src/xmoto/Replay.cpp): format 1 as 0.6.3 writes it for levels without physics
// blocks (header, zlib-compressed events, chunks of 512 zlib-compressed bike states) and formats 1 and 3
// for reading. A state is the 44-byte SerializedBikeState (xmscene/BasicSceneStructs.h, xmscene/
// Serializer.cpp, Bike.cpp convertStateFromReplay); events are the game events the scripts and the
// strawberries produced (xmoto/GameEvents.cpp serialize), in DBuffer's little-endian encoding.
import { zlibSync, unzlibSync } from 'fflate';
import { BikeState, DD_RIGHT, DD_LEFT, type Phys } from './bike.ts';
import { f, v2, vadd, vsub, vmul, vnormalize, type Vec2 } from './vmath.ts';

export const STATES_PER_CHUNK = 512;
export const STATE_SIZE = 44;
export const REPLAY_FRAMERATE = 25.0;
const SER_BIKE_STATE_DIR_LEFT = 0x01, SER_BIKE_STATE_DIR_RIGHT = 0x02;

/** GameApp::timeToFloat / floatToTime */
export const timeToFloat = (t: number): number => f(f(t) / 100.0 + 0.001);
export const floatToTime = (x: number): number => Math.trunc(x * 100.0);

/** DBuffer: little-endian ints/floats, strings as int length + bytes, bools as one byte */
export class DBuf {
  private bytes: number[] = [];
  private view: DataView | null = null;
  private pos = 0;
  static from(data: Uint8Array): DBuf { const b = new DBuf(); b.view = new DataView(data.buffer, data.byteOffset, data.byteLength); return b; }
  get remaining(): number { return this.view ? this.view.byteLength - this.pos : 0; }
  toBytes(): Uint8Array { return Uint8Array.from(this.bytes); }
  int(n: number): void { const d = new DataView(new ArrayBuffer(4)); d.setInt32(0, n | 0, true); for (let i = 0; i < 4; i++) this.bytes.push(d.getUint8(i)); }
  float(x: number): void { const d = new DataView(new ArrayBuffer(4)); d.setFloat32(0, x, true); for (let i = 0; i < 4; i++) this.bytes.push(d.getUint8(i)); }
  bool(b: boolean): void { this.bytes.push(b ? 1 : 0); }
  string(s: string): void { const u = new TextEncoder().encode(s); this.int(u.length); for (const c of u) this.bytes.push(c); }
  rInt(): number { const v = this.view!.getInt32(this.pos, true); this.pos += 4; return v; }
  rFloat(): number { const v = this.view!.getFloat32(this.pos, true); this.pos += 4; return v; }
  rBool(): boolean { return this.view!.getUint8(this.pos++) !== 0; }
  rString(): string {
    const n = this.rInt();
    if (n < 0 || n >= 512) throw new Error('Unable to read the string');
    const s = new TextDecoder().decode(new Uint8Array(this.view!.buffer, this.view!.byteOffset + this.pos, n));
    this.pos += n;
    return s;
  }
}

/** a recorded game event: type (GameEventType), time and its fields */
export interface ReplayEvent { type: number; time: number; s?: string; n: number[]; b?: boolean }

/** the fields of each serialized event type (GameEvents.cpp), in order: s string, F float, I int, B bool, P period float */
export const EVENT_FIELDS: Record<number, string> = {
  4: 'sIFFF', 5: '', 6: 'FFF', 7: 'FFF', 8: '', 9: 's', 10: 'sFF', 11: 'sFF', 12: 'FF', 13: 'FFB', 14: 'sFF', 15: 'sFF', 16: 'sF',
  17: 'sFFPII', 18: 'sFFPII', 19: 's', 20: 'F', 21: 'FF', 22: 'sFFPII', 23: 'sFFPII', 24: 's', 25: 'T', 30: 'FFBI', 31: 'sPII',
  32: 'sPII', 33: 'F', 34: '', 35: 'FFIII', 36: 'F', 37: 'sF', 38: 's', 39: '', 41: 'sIII', 42: 'sFFPII', 43: 'FF',
};

export function writeEvent(buf: DBuf, e: ReplayEvent): void {
  const spec = EVENT_FIELDS[e.type];
  if (spec === undefined) return; // the players' events are not serialized
  buf.float(timeToFloat(e.time));
  buf.int(e.type);
  let k = 0;
  for (const c of spec) {
    if (c === 's') buf.string(e.s ?? '');
    else if (c === 'B') buf.bool(!!e.b);
    else if (c === 'I') buf.int(e.n[k++]);
    else if (c === 'P') buf.float(timeToFloat(e.n[k++] * 100));
    else if (c === 'T') buf.float(timeToFloat(e.n[k++]));
    else buf.float(e.n[k++]);
  }
}

export function readEvents(buf: DBuf): ReplayEvent[] {
  const out: ReplayEvent[] = [];
  while (buf.remaining > 0) {
    const time = floatToTime(buf.rFloat());
    const type = buf.rInt();
    const spec = EVENT_FIELDS[type];
    if (spec === undefined) throw new Error(`unknown replay event ${type}`);
    const e: ReplayEvent = { type, time, n: [] };
    for (const c of spec) {
      if (c === 's') e.s = buf.rString();
      else if (c === 'B') e.b = buf.rBool();
      else if (c === 'I') e.n.push(buf.rInt());
      else if (c === 'P') e.n.push(Math.trunc(floatToTime(buf.rFloat()) / 100));
      else if (c === 'T') e.n.push(floatToTime(buf.rFloat()));
      else e.n.push(buf.rFloat());
    }
    out.push(e);
  }
  return out;
}

const map8 = (ref: number, maxDiff: number, c: number): number => {
  let n = Math.trunc(f(f(127.0 * f(c - ref)) / maxDiff));
  if (!Number.isFinite(n)) n = 0;
  if (n < -127) n = -127;
  if (n > 127) n = 127;
  return n;
};
const unmap8 = (ref: number, maxDiff: number, c: number): number => f(ref + f(f(c / 127.0) * maxDiff));
function matrixTo16(m: number[]): number {
  let n1 = Math.trunc(f(f(m[0] * 127.0) + 127.0)); n1 = Math.max(0, Math.min(255, n1));
  let n2 = Math.trunc(f(f(m[2] * 127.0) + 127.0)); n2 = Math.max(0, Math.min(255, n2));
  return (n1 << 8) | n2;
}
function bits16ToMatrix(n16: number): number[] {
  let a = f((((n16 & 0xff00) >> 8) - 127.0) / 127.0), c = f(((n16 & 0xff) - 127.0) / 127.0);
  const d = f(Math.sqrt(f(f(a * a) + f(c * c))));
  if (d === 0) return [1, 0, 0, 1];
  a = f(a / d); c = f(c / d);
  return [a, -c, c, a];
}

/** Scene::getSerializedBikeState */
export function encodeState(s: BikeState, time: number, p: Phys): Uint8Array {
  const out = new Uint8Array(STATE_SIZE);
  const d = new DataView(out.buffer);
  const R = s.Dir === DD_RIGHT;
  d.setUint8(0, s.Dir === DD_LEFT ? SER_BIKE_STATE_DIR_LEFT : SER_BIKE_STATE_DIR_RIGHT);
  d.setFloat32(4, timeToFloat(time), true);
  const C = s.CenterP;
  const pts = R ? [s.ElbowP, s.ShoulderP, s.LowerBodyP, s.KneeP] : [s.Elbow2P, s.Shoulder2P, s.LowerBody2P, s.Knee2P];
  let mx = 0, my = 0;
  for (const q of [s.FrontWheelP, s.RearWheelP, ...pts]) {
    mx = Math.max(mx, Math.abs(f(C.x - q.x)));
    my = Math.max(my, Math.abs(f(C.y - q.y)));
  }
  let rpm = Math.trunc(f(f(f(s.fBikeEngineRPM - p.engineRpmMin) / p.engineRpmMax) * 255.0));
  rpm = Math.max(0, Math.min(255, rpm));
  d.setFloat32(8, C.x, true); d.setFloat32(12, C.y, true); d.setFloat32(16, mx, true); d.setFloat32(20, my, true);
  d.setUint16(24, matrixTo16(s.fRearWheelRot), true);
  d.setUint16(26, matrixTo16(s.fFrontWheelRot), true);
  d.setUint16(28, matrixTo16(s.fFrameRot), true);
  d.setUint8(30, rpm);
  const xs = [s.RearWheelP, s.FrontWheelP, ...pts];
  xs.forEach((q, i) => {
    d.setInt8(31 + 2 * i, map8(C.x, mx, q.x));
    d.setInt8(32 + 2 * i, map8(C.y, my, q.y));
  });
  return out;
}

/** BikeState::convertStateFromReplay */
export function decodeState(bytes: Uint8Array, p: Phys): BikeState {
  const d = new DataView(bytes.buffer, bytes.byteOffset, STATE_SIZE);
  const s = new BikeState(p);
  const fx = d.getFloat32(8, true), fy = d.getFloat32(12, true), mx = d.getFloat32(16, true), my = d.getFloat32(20, true);
  const c = (i: number): Vec2 => v2(unmap8(fx, mx, d.getInt8(31 + 2 * i)), unmap8(fy, my, d.getInt8(32 + 2 * i)));
  s.RearWheelP = c(0); s.FrontWheelP = c(1);
  s.CenterP = v2(fx, fy);
  s.fFrameRot = bits16ToMatrix(d.getUint16(28, true));
  s.fFrontWheelRot = bits16ToMatrix(d.getUint16(26, true));
  s.fRearWheelRot = bits16ToMatrix(d.getUint16(24, true));
  s.fBikeEngineRPM = f(p.engineRpmMin + f(f(f(p.engineRpmMax - p.engineRpmMin) * d.getUint8(30)) / 255.0));
  const R = s.fFrameRot, a = s.anchors;
  const tr = (P: Vec2): Vec2 => v2(f(f(f(P.x * R[0]) + f(P.y * R[1])) + s.CenterP.x), f(f(f(P.x * R[2]) + f(P.y * R[3])) + s.CenterP.y));
  s.SwingAnchorP = tr(a.AR); s.FrontAnchorP = tr(a.AF); s.SwingAnchor2P = tr(a.AR2); s.FrontAnchor2P = tr(a.AF2);
  s.WantedFootP = tr(a.PFp); s.WantedHandP = tr(a.PHp); s.WantedFoot2P = tr(a.PFp2); s.WantedHand2P = tr(a.PHp2);
  const flags = d.getUint8(0);
  let updRider = true, updAlt = true;
  if (flags & SER_BIKE_STATE_DIR_RIGHT) {
    s.HandP = s.WantedHandP; s.ElbowP = c(2); s.ShoulderP = c(3); s.LowerBodyP = c(4); s.KneeP = c(5); s.FootP = s.WantedFootP;
    s.Dir = DD_RIGHT; updAlt = false;
  } else if (flags & SER_BIKE_STATE_DIR_LEFT) {
    s.Hand2P = s.WantedHand2P; s.Elbow2P = c(2); s.Shoulder2P = c(3); s.LowerBody2P = c(4); s.Knee2P = c(5); s.Foot2P = s.WantedFoot2P;
    s.Dir = DD_LEFT; updRider = false;
  }
  const head = (S: Vec2, L: Vec2): Vec2 => {
    const V = vsub(S, L);
    try { vnormalize(V); return vadd(S, vmul(V, p.riderNeckLength)); } catch { return S; }
  };
  if (updRider) s.HeadP = head(s.ShoulderP, s.LowerBodyP);
  if (updAlt) s.Head2P = head(s.Shoulder2P, s.LowerBody2P);
  s.RFrontWheelP = tr(a.Fp); s.RRearWheelP = tr(a.Rp);
  s.GameTime = floatToTime(d.getFloat32(4, true));
  return s;
}

/** BikeState::interpolateGameStateLinear */
export function interpolate(A: BikeState, B: BikeState, t: number): BikeState {
  const p = Object.assign(Object.create(Object.getPrototypeOf(A)), A) as BikeState;
  if (A.Dir !== B.Dir) return p;
  const L = (a: Vec2, b: Vec2): Vec2 => ({ x: a.x + (b.x - a.x) * t, y: a.y + (b.y - a.y) * t });
  p.CenterP = L(A.CenterP, B.CenterP); p.RearWheelP = L(A.RearWheelP, B.RearWheelP); p.FrontWheelP = L(A.FrontWheelP, B.FrontWheelP);
  if (t <= 1.0) p.fBikeEngineRPM = A.fBikeEngineRPM + (B.fBikeEngineRPM - A.fBikeEngineRPM) * t;
  p.fFrameRot = A.fFrameRot.map((v, i) => v + (B.fFrameRot[i] - v) * t);
  p.fFrontWheelRot = [...B.fFrontWheelRot]; p.fRearWheelRot = [...B.fRearWheelRot];
  if (A.Dir === DD_RIGHT) {
    for (const k of ['HeadP', 'HandP', 'ElbowP', 'ShoulderP', 'LowerBodyP', 'KneeP', 'FootP', 'SwingAnchorP', 'FrontAnchorP'] as const) p[k] = L(A[k], B[k]);
  } else {
    for (const k of ['Head2P', 'Hand2P', 'Elbow2P', 'Shoulder2P', 'LowerBody2P', 'Knee2P', 'Foot2P', 'SwingAnchor2P', 'FrontAnchor2P'] as const) p[k] = L(A[k], B[k]);
  }
  return p;
}

/** Replay recording (createReplay, storeState, finishReplay, saveReplay_1) */
export class ReplayRecorder {
  events = new DBuf();
  chunks: Uint8Array[][] = [];
  finished = false;
  finishTime = 0;
  lastSerialization = -100;
  levelId: string; player: string; frameRate: number;
  constructor(levelId: string, player: string, frameRate = REPLAY_FRAMERATE) { this.levelId = levelId; this.player = player; this.frameRate = frameRate; }
  event(e: ReplayEvent): void { writeEvent(this.events, e); }
  storeState(st: Uint8Array): void {
    let c = this.chunks[this.chunks.length - 1];
    if (!c || c.length >= STATES_PER_CHUNK) { c = []; this.chunks.push(c); }
    c.push(st);
  }
  /** Scene::updateLevel's "record the replay only if" */
  maybeStore(time: number, s: BikeState, p: Phys, alive: boolean): void {
    if (time - this.lastSerialization >= f(100.0 / this.frameRate)) {
      this.lastSerialization = time;
      if (alive) this.storeState(encodeState(s, time, p));
    }
  }
  finish(finished: boolean, finishTime: number, last: Uint8Array): void {
    this.storeState(last);
    this.finished = finished;
    this.finishTime = finished ? finishTime : 0;
  }
  /** saveReplay_1 */
  toFile(): Uint8Array {
    const out: number[] = [];
    const d4 = (fn: (v: DataView) => void): void => { const v = new DataView(new ArrayBuffer(4)); fn(v); for (let i = 0; i < 4; i++) out.push(v.getUint8(i)); };
    const str = (s: string): void => { const u = new TextEncoder().encode(s); out.push(u.length & 0xff); out.push(...u); };
    out.push(1);
    d4((v) => v.setInt32(0, 0x12345678, true));
    str(this.levelId);
    str(this.player);
    d4((v) => v.setFloat32(0, this.frameRate, true));
    d4((v) => v.setInt32(0, STATE_SIZE, true));
    out.push(this.finished ? 1 : 0);
    d4((v) => v.setFloat32(0, timeToFloat(this.finishTime), true));
    const ev = this.events.toBytes();
    d4((v) => v.setInt32(0, ev.length, true));
    const cev = zlibSync(ev, { level: 9 });
    out.push(1);
    d4((v) => v.setInt32(0, cev.length, true));
    out.push(...cev);
    d4((v) => v.setInt32(0, this.chunks.length, true));
    for (const c of this.chunks) {
      d4((v) => v.setInt32(0, c.length, true));
      const raw = new Uint8Array(c.length * STATE_SIZE);
      c.forEach((s, i) => raw.set(s, i * STATE_SIZE));
      const z = zlibSync(raw, { level: 9 });
      out.push(1);
      d4((v) => v.setInt32(0, z.length, true));
      for (const b of z) out.push(b);
    }
    return Uint8Array.from(out);
  }
}

export interface ReplayFile { version: number; levelId: string; player: string; frameRate: number; finished: boolean; finishTime: number; events: ReplayEvent[]; states: Uint8Array[] }

/** Replay::openReplay (formats 1 and 3) */
export function parseReplay(data: Uint8Array): ReplayFile {
  const d = new DataView(data.buffer, data.byteOffset, data.byteLength);
  let pos = 0;
  const u8 = (): number => d.getUint8(pos++);
  const i32 = (): number => { const v = d.getInt32(pos, true); pos += 4; return v; };
  const f32 = (): number => { const v = d.getFloat32(pos, true); pos += 4; return v; };
  const str = (): string => { const n = u8(); const s = new TextDecoder().decode(data.subarray(pos, pos + n)); pos += n; return s; };
  const bytes = (n: number): Uint8Array => { const b = data.subarray(pos, pos + n); pos += n; return b; };
  const version = u8();
  if (version !== 1 && version !== 3) throw new Error('Unsupported replay format');
  if (i32() !== 0x12345678) throw new Error('Unable to open the replay');
  const r: ReplayFile = { version, levelId: str(), player: str(), frameRate: f32(), finished: false, finishTime: 0, events: [], states: [] };
  const stateSize = i32();
  r.finished = u8() !== 0;
  r.finishTime = floatToTime(f32());
  const pushStates = (raw: Uint8Array, n: number): void => { for (let i = 0; i < n; i++) r.states.push(raw.slice(i * stateSize, i * stateSize + STATE_SIZE)); };
  if (version === 1) {
    const evSize = i32();
    const ev = u8() ? unzlibSync(bytes(i32())) : bytes(evSize);
    r.events = readEvents(DBuf.from(ev));
    const nChunks = i32();
    if (nChunks === 0) throw new Error('Replay with no chunk !');
    for (let i = 0; i < nChunks; i++) {
      const n = i32();
      const raw = u8() ? unzlibSync(bytes(i32())) : bytes(n * stateSize);
      pushStates(raw, n);
    }
  } else {
    i32(); // uncompressed size
    const body = DBuf.from(unzlibSync(bytes(i32())));
    const evSize = body.rInt();
    const all = (body as unknown as { view: DataView; pos: number });
    const evBytes = new Uint8Array(all.view.buffer, all.view.byteOffset + all.pos, evSize);
    r.events = readEvents(DBuf.from(evBytes));
    all.pos += evSize;
    const nChunks = body.rInt();
    for (let i = 0; i < nChunks; i++) {
      const n = body.rInt();
      const raw = new Uint8Array(all.view.buffer, all.view.byteOffset + all.pos, n * stateSize);
      all.pos += n * stateSize;
      pushStates(raw, n);
    }
  }
  return r;
}
