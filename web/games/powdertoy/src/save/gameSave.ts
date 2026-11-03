// client/GameSave.h / GameSave.cpp: the save and stamp format (OPS, and the older PSv/fuC read only), the save's
// content as Simulation::Load / Simulation::Save exchange it, and Transform (stamp rotation, mirroring, nudging).
//
// Representation:
//   PlaneAdapter<std::vector<T>>  Plane: `size` and a flat typed array `data`, index y * size.X + x; plane[p] is
//                                 plane.get(p) / plane.set(p, v)
//   std::vector<Particle>         particles: Particle objects; entries exist (at least) for 0 <= n < particlesCount
//                                 (C++ allocates NPART up front; here they are created as they are filled)
//   Version<2>                    [major, minor]
//   RNG::State                    rngState: [s0h, s0l, s1h, s1l] as RNG.state() / RNG.setState() use them
//   uint64_t frameCount           a number
//   std::vector<char> data        Uint8Array
//   sign                          the Sign of simulation.ts ({ x, y, ju, text }); text is a JS string (C++ String)
//   Json::Value authors           a JSON value: plain objects, arrays, strings, booleans, numbers (an integer in
//                                 int32 range is jsoncpp's intValue, any other number its realValue) and bigint
//                                 (jsoncpp's uintValue, UInt64; e.g. "date"); null is nullValue
import { CELL, MAXSIGNS, NPART, PT_NUM, XCELLS, XRES, YCELLS, YRES, PMAP, ID, TYP, PMAPBITS, R_TEMP, AIRC_LEGACY,
  AIRC_BOUSSINESQ, GRAV_VERTICAL, GRAV_CUSTOM, AIR_ON, NGOL, FLAG_PHOTDECO, FLAG_MOVABLE, OLD_PT_WIND, MAX_TEMP,
  MIN_TEMP, O_MAX_TEMP, O_MIN_TEMP,
  O_WL_WALLELEC, O_WL_EWALL, O_WL_DETECT, O_WL_STREAM, O_WL_FAN, O_WL_FANHELPER, O_WL_ALLOWLIQUID, O_WL_DESTROYALL,
  O_WL_ERASE, O_WL_WALL, O_WL_ALLOWAIR, O_WL_ALLOWSOLID, O_WL_ALLOWALLELEC, O_WL_EHOLE, O_WL_ALLOWGAS, O_WL_GRAV,
  O_WL_ALLOWENERGY, O_WL_SIGN, WL_WALLELEC, WL_EWALL, WL_DETECT, WL_STREAM, WL_FAN, WL_ALLOWLIQUID, WL_DESTROYALL,
  WL_ERASE, WL_WALL, WL_ALLOWAIR, WL_ALLOWPOWDER, WL_ALLOWALLELEC, WL_EHOLE, WL_ALLOWGAS, WL_GRAV, WL_ALLOWENERGY,
  WL_STASIS, UI_WALLCOUNT } from '../sim/config.ts';
import { f, itrunc } from '../sim/cpp.ts';
import { Particle, PARTICLE_PROPERTIES, FIELD_LIFE, FIELD_CTYPE, FIELD_TMP, FIELD_TMP2, FIELD_TMP3, FIELD_TMP4 } from '../sim/particle.ts';
import type { Sign } from '../sim/simulation.ts';
import { sd } from '../sim/simulationData.ts';
import { firwTableAt } from '../sim/colour.ts';
import { type Vec2, type Rect, RectSized, RectBetween, rectAnd, rectContains, rectPoints } from '../sim/vec2.ts';
import { Element_PIPE_offsets, Element_PIPE_transformPatchOffsets, PFLAG_CAN_CONDUCT } from '../elements/PIPE.ts';
import {
  PT_NONE, PT_SOAP, PT_BOMB, PT_EMBR, PT_DUST, PT_FIRW, PT_PSTN, PT_FILT, PT_QRTZ, PT_PQRT, PT_PHOT, PT_VINE, PT_DLAY,
  PT_CRAY, PT_CONV, PT_PIPE, PT_PPIP, PT_TSNS, PT_HSWC, PT_PSNS, PT_PUMP, PT_LIFE, PT_GLAS, PT_TUNG, PT_RPEL, PT_NWHL,
  PT_HEAC, PT_SAWD, PT_POLO, PT_RFRG, PT_RFGL, PT_LSNS, PT_FRAY, PT_INVIS, PT_LDTC, PT_RSST, PT_RSSS, PT_ETRD,
  PT_BASE, PT_SEED, PT_ICEI, PT_SNOW, PT_PLSM, PT_EXOT, PT_FWRK, PT_WTRV, PT_FIRE, PT_BRMT, PT_FOG, PT_RIME, PT_COAL,
  PT_FUSE, PT_BIZR, PT_BIZRG, PT_BIZRS, PT_PBCN, PT_TRON, PT_CLNE, PT_PCLN, PT_BCLN, PT_SPRK, PT_LAVA, PT_WIRE,
  PT_STOR, PT_SPNG, PT_BRAY, PT_DMND, PT_LCRY,
} from '../sim/numbers.ts';
import { Bson, objectValue, arrayValue, stringValue, userValue, doubleValue, int32Value, int64Value, boolValue,
  ParseError, DumpError } from './bson.ts';
import { BZ2WCompress, BZ2WDecompress, BZ2WCompressOk, BZ2WCompressNomem, BZ2WDecompressOk, BZ2WDecompressNomem } from './bzip2.ts';

// ---------------------------------------------------------------- Config.h (the release build of v100.1.400)

export type Version2 = [number, number];
/** UPSTREAM_VERSION.displayVersion */
export const currentVersion: Version2 = [100, 1];
export const nextVersion: Version2 = [100, 1];
export const ALLOW_FAKE_NEWER_VERSION = false;
export const effectiveVersion: Version2 = ALLOW_FAKE_NEWER_VERSION ? nextVersion : currentVersion;
/** APP_VERSION.build */
export const APP_VERSION_BUILD = 400;
export const MOD_ID = 0;
export const IDENT_RELTYPE = 'R';
// the original's browser (emscripten) build: meson's ident_platform falls through to UNKNOWN and IDENT is
// '<host_arch>-<host_platform>-<host_libc>' upper-cased
export const IDENT_PLATFORM = 'UNKNOWN';
export const IDENT = 'WASM32-EMSCRIPTEN-EMSCRIPTEN';

/** Version<2> comparison: <0, 0, >0 */
export function versionCompare(a: Version2, b: Version2): number {
  if (a[0] !== b[0]) return a[0] < b[0] ? -1 : 1;
  if (a[1] !== b[1]) return a[1] < b[1] ? -1 : 1;
  return 0;
}
const vLt = (a: Version2, b: Version2): boolean => versionCompare(a, b) < 0;
const vLe = (a: Version2, b: Version2): boolean => versionCompare(a, b) <= 0;
const vGt = (a: Version2, b: Version2): boolean => versionCompare(a, b) > 0;
const vGe = (a: Version2, b: Version2): boolean => versionCompare(a, b) >= 0;
const V = (major: number, minor = 0): Version2 => [major, minor];

const CELLS: Vec2 = { X: XCELLS, Y: YCELLS };
const RES: Vec2 = { X: XRES, Y: YRES };
const originRect = (s: Vec2): Rect => RectSized({ X: 0, Y: 0 }, s);

// ---------------------------------------------------------------- exceptions

// ParseException::ParseResult
export const OK = 0, Corrupt = 1, WrongVersion = 2, InvalidDimensions = 3, InternalError = 4, MissingElement = 5;

export class ParseException extends Error {
  result: number;
  constructor(result: number, message: string) {
    super(message);
    this.result = result;
  }
}

export class BuildException extends Error {}

// ---------------------------------------------------------------- planes

type PlaneArray = Uint8Array | Float32Array | Uint32Array | Int32Array;

/** PlaneAdapter<std::vector<T>> */
export class Plane<A extends PlaneArray> {
  size: Vec2;
  data: A;
  constructor(size: Vec2, data: A) {
    this.size = { X: size.X, Y: size.Y };
    this.data = data;
  }
  Size(): Vec2 { return this.size; }
  get(p: Vec2): number { return this.data[p.Y * this.size.X + p.X]; }
  set(p: Vec2, v: number): void { this.data[p.Y * this.size.X + p.X] = v; }
}
export function planeU8(size: Vec2, fill = 0): Plane<Uint8Array> {
  return new Plane(size, new Uint8Array(Math.max(size.X * size.Y, 0)).fill(fill));
}
export function planeF32(size: Vec2, fill = 0): Plane<Float32Array> {
  return new Plane(size, new Float32Array(Math.max(size.X * size.Y, 0)).fill(fill));
}
export function planeU32(size: Vec2, fill = 0): Plane<Uint32Array> {
  return new Plane(size, new Uint32Array(Math.max(size.X * size.Y, 0)).fill(fill));
}

/**
 * `for (auto p : rect.Range<LEFT_TO_RIGHT, TOP_TO_BOTTOM>())`: column-major, the columns left to right, each column
 * top to bottom (the order the OPS maps' bytes are in). rectPoints is the default, row-major order.
 */
function* columnPoints(r: Rect): Generator<Vec2> {
  for (let x = r.pos.X; x < r.pos.X + r.size.X; x++) {
    for (let y = r.pos.Y; y < r.pos.Y + r.size.Y; y++) {
      yield { X: x, Y: y };
    }
  }
}

// ---------------------------------------------------------------- small helpers the original takes from elsewhere

/** ByteString::FromUtf8 */
function fromUtf8(bytes: string): string {
  const u = new Uint8Array(bytes.length);
  for (let k = 0; k < bytes.length; k++) u[k] = bytes.charCodeAt(k);
  return new TextDecoder('utf-8').decode(u);
}
/** String::ToUtf8 (a ByteString: one char per byte) */
function toUtf8(s: string): string {
  const u = new TextEncoder().encode(s);
  let out = '';
  for (let k = 0; k < u.length; k++) out += String.fromCharCode(u[k]);
  return out;
}

/** Format.cpp format::CleanString(dirtyString, ascii, color, newlines, numeric = false) */
export function CleanString(dirtyString: string, ascii: boolean, color: boolean, newlines: boolean, numeric = false): string {
  const s = Array.from(dirtyString);
  for (let i = 0; i < s.length; i++) {
    switch (s[i]) {
    case '\b':
      if (color) {
        s.splice(i, 2);
        i--;
      } else
        i++;
      break;
    case '\x0E':
      if (color) {
        s.splice(i, 1);
        i--;
      }
      break;
    case '\x0F':
      if (color) {
        s.splice(i, 4);
        i--;
      } else
        i += 3;
      break;
    case '\r':
    case '\n':
      if (newlines)
        s[i] = ' ';
      break;
    default:
      if (numeric && (s[i] < '0' || s[i] > '9')) {
        s.splice(i, 1);
        i--;
      } else if (ascii && (s[i] < ' ' || s[i] > '~')) {
        // if less than ascii 20 or greater than ascii 126, delete
        s.splice(i, 1);
        i--;
      }
      break;
    }
  }
  return s.join('');
}

/** String::Substr(0, n) on code points */
function substr(s: string, n: number): string {
  return Array.from(s).slice(0, n).join('');
}

/** Sign.cpp sign::split(): [pos, type] with type Normal 0, Save 1, Thread 2, Button 3, Search 4 */
export function signSplit(text: string): [number, number] {
  let pipe = 0;
  if (text.length >= 4 && text[0] === '{' && text[text.length - 1] === '}') {
    switch (text[1]) {
    case 'c':
    case 't':
      if (text[2] === ':' && (pipe = text.indexOf('|', 4)) !== -1) {
        for (let i = 3; i < pipe; ++i) {
          if (text[i] < '0' || text[i] > '9') {
            return [0, 0];
          }
        }
        return [pipe, text[1] === 'c' ? 1 : 2];
      }
      break;
    case 'b':
      if (text[2] === '|') {
        return [2, 3];
      }
      break;
    case 's':
      if (text[2] === ':' && (pipe = text.indexOf('|', 3)) !== -1) {
        return [pipe, 4];
      }
      break;
    }
  }
  return [0, 0];
}

/** the *v95 out-parameter of sign::getDisplayText(nullptr, ..., true, &v95) (Sign.cpp): whether the text uses a
 *  {t} {p} {a} ... substitution that needs 95.0 */
export function signNeedsV95(text: string): boolean {
  let v95 = false;
  if (text.indexOf('{') === -1) return false;
  const si = signSplit(text);
  if (si[0]) return false;
  let remaining_text = text;
  for (;;) {
    const l = remaining_text.indexOf('{');
    if (l === -1) break;
    const after_left_curly = remaining_text.substring(l + 1);
    const r = after_left_curly.indexOf('}');
    if (r === -1) break;
    remaining_text = after_left_curly.substring(r + 1);
    const between_curlies = after_left_curly.substring(0, r);
    if (['t', 'temp', 'p', 'pres', 'a', 'aheat', 'type', 'ctype', 'life', 'tmp', 'tmp2'].includes(between_curlies)) {
      v95 = true;
    }
  }
  return v95;
}

// ---------------------------------------------------------------- JSON <-> BSON (authors)

export type JsonValue = null | boolean | number | bigint | string | JsonValue[] | { [key: string]: JsonValue };

const INT_MAX = 2147483647, INT_MIN = -2147483648;
function jsonIsObject(j: JsonValue): j is { [key: string]: JsonValue } {
  return j !== null && typeof j === 'object' && !Array.isArray(j);
}
/** Json::Value::isInt() */
function jsonIsInt(j: JsonValue): boolean {
  if (typeof j === 'number') return Number.isInteger(j) && j >= INT_MIN && j <= INT_MAX;
  if (typeof j === 'bigint') return j >= BigInt(INT_MIN) && j <= BigInt(INT_MAX);
  return false;
}
function jsonAsInt(j: JsonValue): number { return Number(j) | 0; }
/** Json::Value::type() == Json::intValue */
function jsonIsIntValue(j: JsonValue): boolean {
  return (typeof j === 'number' && Number.isInteger(j) && j >= INT_MIN && j <= INT_MAX) || (typeof j === 'bigint' && j < 0n);
}
/** Json::Value::getMemberNames(): sorted (jsoncpp's std::map) */
function jsonMemberNames(j: JsonValue): string[] {
  if (!jsonIsObject(j)) return [];
  return Object.keys(j).sort((a, b) => (toUtf8(a) < toUtf8(b) ? -1 : toUtf8(a) > toUtf8(b) ? 1 : 0));
}
/** Json::Value::append on a null or array member */
function jsonAppend(j: { [key: string]: JsonValue }, key: string, v: JsonValue): void {
  if (!Array.isArray(j[key])) j[key] = [];
  (j[key] as JsonValue[]).push(v);
}

function ConvertBsonToJson(b: Bson, j: { [key: string]: JsonValue }, depth = 0): void {
  for (const [key, value] of b.sortedEntries()) {
    const k = fromUtf8(key);
    if (value.GetType() === stringValue)
      j[k] = fromUtf8(value.asString());
    else if (value.GetType() === boolValue)
      j[k] = value.asBool();
    else if (value.GetType() === int32Value)
      j[k] = value.asInt32();
    else if (value.GetType() === int64Value)
      j[k] = BigInt.asUintN(64, value.asInt64());
    else if (value.GetType() === arrayValue && depth < 5) {
      let length = 0, length2 = 0;
      for (const item of value.asArray()) {
        if (item.GetType() === objectValue) { // this used to check whether the """key""" (funny because this is an array) was "part"
          const tempPart: { [key: string]: JsonValue } = {};
          ConvertBsonToJson(item, tempPart, depth + 1);
          jsonAppend(j, 'links', tempPart);
          length++;
        } else if (item.GetType() === int32Value) { // this used to check whether the """key""" (funny because this is an array) was "saveID"
          jsonAppend(j, 'links', item.asInt32());
        }
        length2++;
        if (length > ((40 / ((depth + 1) * (depth + 1))) | 0) || length2 > 50)
          break;
      }
    }
  }
}

export function GetNestedSaveIDs(j: JsonValue): Set<number> {
  const saveIDs = new Set<number>();
  if (!jsonIsObject(j)) return saveIDs;
  for (const member of jsonMemberNames(j)) {
    const m = j[member];
    if (member === 'id' && jsonIsInt(m))
      saveIDs.add(jsonAsInt(m));
    else if (Array.isArray(m)) {
      for (const item of m) {
        // only supports objects and ints here because that is all we need
        if (jsonIsInt(item)) {
          saveIDs.add(jsonAsInt(item));
          continue;
        }
        if (!jsonIsObject(item))
          continue;
        for (const id of GetNestedSaveIDs(item)) saveIDs.add(id);
      }
    }
  }
  return saveIDs;
}

/** converts a json object to bson (with the original's quirk: an array member turns b itself into an array) */
function ConvertJsonToBson(b: Bson, j: JsonValue, depth = 0): void {
  if (!jsonIsObject(j)) return;
  for (const member of jsonMemberNames(j)) {
    const m = j[member];
    const key = toUtf8(member);
    if (typeof m === 'string')
      b.set(key, Bson.string(toUtf8(m)));
    else if (typeof m === 'boolean')
      b.set(key, Bson.bool(m));
    else if (jsonIsIntValue(m))
      b.set(key, Bson.int32(jsonAsInt(m)));
    else if (typeof m === 'bigint')
      b.set(key, Bson.int64(m));
    else if (Array.isArray(m)) {
      const array = b.Append(new Bson(arrayValue));
      const saveIDs = new Set<number>();
      let length = 0;
      for (const item of m) {
        // only supports objects and ints here because that is all we need
        if (jsonIsInt(item)) {
          saveIDs.add(jsonAsInt(item));
          continue;
        }
        if (!jsonIsObject(item))
          continue;
        if (depth > 4 || length > ((40 / ((depth + 1) * (depth + 1))) | 0)) {
          for (const id of GetNestedSaveIDs(item)) saveIDs.add(id);
        } else {
          const part = array.Append(new Bson(objectValue));
          ConvertJsonToBson(part, item, depth + 1);
        }
        length++;
      }
      for (const id of [...saveIDs].sort((a, c) => a - c)) {
        array.Append(Bson.int32(id));
      }
    }
  }
}

// ---------------------------------------------------------------- GameSave

/** StkmData */
export class StkmData {
  rocketBoots1 = false;
  rocketBoots2 = false;
  fan1 = false;
  fan2 = false;
  rocketBootsFigh: number[] = [];
  fanFigh: number[] = [];

  hasData(): boolean {
    return this.rocketBoots1 || this.rocketBoots2 || this.fan1 || this.fan2
      || this.rocketBootsFigh.length > 0 || this.fanFigh.length > 0;
  }
}

/** MissingElements */
export class MissingElements {
  /** std::map<ByteString, int> */
  identifiers = new Map<string, number>();
  /** std::set<int> */
  ids = new Set<number>();
  /** operator bool */
  any(): boolean { return this.identifiers.size > 0 || this.ids.size > 0; }
}

/** GameSave::PaletteItem: [identifier, number] */
export type PaletteItem = [string, number];

function MakeOpsNonconformance(): Bson {
  const opsNonconformance = new Bson(objectValue);
  {
    const paletteNode = opsNonconformance.set('palette', new Bson(arrayValue));
    paletteNode.Append(Bson.string('objectEncodedAsArray'));
  }
  {
    const stkmNode = opsNonconformance.set('stkm', new Bson(objectValue));
    {
      const rocketBootsFighNode = stkmNode.set('rocketBootsFigh', new Bson(arrayValue));
      rocketBootsFighNode.Append(Bson.string('arrayEncodedWithBadKeys'));
      rocketBootsFighNode.Append(Bson.string('num'));
    }
    {
      const fanFighNode = stkmNode.set('fanFigh', new Bson(arrayValue));
      fanFighNode.Append(Bson.string('arrayEncodedWithBadKeys'));
      fanFighNode.Append(Bson.string('num'));
    }
  }
  {
    const signsNode = opsNonconformance.set('signs', new Bson(arrayValue));
    signsNode.Append(Bson.string('arrayEncodedWithBadKeys'));
    signsNode.Append(Bson.string('sign'));
  }
  return opsNonconformance;
}
const opsNonconformance = MakeOpsNonconformance();

/** Particle::PossiblyCarriesType() */
const possiblyCarriesType = [FIELD_LIFE, FIELD_CTYPE, FIELD_TMP, FIELD_TMP2, FIELD_TMP3, FIELD_TMP4];
type IntField = 'life' | 'ctype' | 'tmp' | 'tmp2' | 'tmp3' | 'tmp4';
const propName = (index: number): IntField => PARTICLE_PROPERTIES[index].name as IntField;

export class GameSave {
  blockSize: Vec2 = { X: 0, Y: 0 };
  blockContent: Rect = { pos: { X: 0, Y: 0 }, size: { X: 0, Y: 0 } };
  fromNewerVersion = false;
  fromUnstableVersion = false;
  version: Version2 = [0, 0];
  hasPressure = false;
  hasAmbientHeat = false;
  hasBlockAirMaps = false;
  hasGravityMaps = false;
  /** only taken seriously by serializeOPS; readOPS may set this even if the save does not have everything required for determinism */
  ensureDeterminism = false;
  /** only written by readOPS, never read */
  hasRngState = false;
  /** RNG::State as [s0h, s0l, s1h, s1l] */
  rngState: number[] = [0, 0, 0, 0];
  frameCount = 0;

  // Simulation data
  particlesCount = 0;
  particles: Particle[] = [];
  blockMap = planeU8({ X: 0, Y: 0 });
  fanVelX = planeF32({ X: 0, Y: 0 });
  fanVelY = planeF32({ X: 0, Y: 0 });
  pressure = planeF32({ X: 0, Y: 0 });
  velocityX = planeF32({ X: 0, Y: 0 });
  velocityY = planeF32({ X: 0, Y: 0 });
  ambientHeat = planeF32({ X: 0, Y: 0 });
  blockAir = planeU8({ X: 0, Y: 0 });
  blockAirh = planeU8({ X: 0, Y: 0 });
  gravMass = planeF32({ X: 0, Y: 0 });
  gravMask = planeU32({ X: 0, Y: 0 });
  gravForceX = planeF32({ X: 0, Y: 0 });
  gravForceY = planeF32({ X: 0, Y: 0 });

  // Simulation Options
  waterEEnabled = false;
  legacyEnable = false;
  gravityEnable = false;
  aheatEnable = false;
  paused = false;
  gravityMode = 0;
  customGravityX = 0.0;
  customGravityY = 0.0;
  airMode = 0;
  ambientAirTemp = f(R_TEMP + f(273.15));
  edgePressure = 0;
  edgeVelocityX = 0;
  edgeVelocityY = 0;
  vorticityCoeff = 0.0;
  convectionMode = AIRC_LEGACY;
  edgeMode = 0;
  wantAuthors = true;

  missingElements = new MissingElements();

  // Signs
  signs: Sign[] = [];
  stkm = new StkmData();

  // Element palette
  palette: PaletteItem[] = [];

  // author information
  authors: JsonValue = null;

  /** default to 8 bits for older saves */
  pmapbits = 8;

  /**
   * GameSave(Vec2<int> newBlockSize) when given a Vec2; GameSave(const std::vector<char> &data, bool newWantAuthors)
   * when given the bytes (throws ParseException)
   */
  constructor(arg: Vec2 | Uint8Array, newWantAuthors = true) {
    if (arg instanceof Uint8Array) {
      this.wantAuthors = newWantAuthors;
      this.Expand(arg);
    } else {
      this.setSize(arg);
    }
  }

  /** particles[n], created (zeroed) if this port has not allocated it yet */
  part(n: number): Particle {
    let p = this.particles[n];
    if (!p) {
      for (let k = this.particles.length; k <= n; k++) this.particles.push(new Particle());
      p = this.particles[n];
    }
    return p;
  }

  private MapPalette(): void {
    // - the palette is always right
    //   - there are palettes with missing entries but there are no palettes with incorrect entries
    //   - for every (identifier, number) pair in the palette
    //     - if the identifier is recognized, map the number to the appropriate element
    //     - if not, map it to 0
    //       - complain about the identifier if the corresponding number is actually used
    // - to handle every number not covered by the palette
    //   - in the case of any 98.0+ save, the palette is comprehensive
    //     - except for the few cases already handled below
    //       - e.g RSSS et al not having CarriesTypeIn set properly until 98.2
    //       - can handle mistakes like this with similar extra code later
    //     - map any number seen used to 0 and complain about the number
    //   - in the case of any pre-98.0 save, the palette may not be comprehensive
    //     - in the case of saves from 78.1 and newer
    //       - identity-map only ranges of numbers that are known to have existed
    //         at the point in time in vanilla when the save was made, based on this->version
    //       - this is still not perfect because it lets numbers slip that a mod freed up a
    //         vanilla element from and reused for one of its own elements, but that's fine
    //     - in the case of saves older than that
    //       - pretend that they are 78.1 in terms of validity of element numbers, this is good enough

    const partMap = new Int32Array(PT_NUM);
    const ignoreMissingErrors = new Array<boolean>(PT_NUM).fill(false);
    if (vLe(this.version, V(98, 2))) {
      ignoreMissingErrors[PT_ICEI] = true;
      ignoreMissingErrors[PT_SNOW] = true;
      ignoreMissingErrors[PT_RSST] = true;
      ignoreMissingErrors[PT_RSSS] = true;
    }
    if (vLe(this.version, V(99, 5))) {
      ignoreMissingErrors[PT_PLSM] = true;
      ignoreMissingErrors[PT_EXOT] = true;
      ignoreMissingErrors[PT_FWRK] = true;
      ignoreMissingErrors[PT_WTRV] = true;
      ignoreMissingErrors[PT_FIRE] = true;
      ignoreMissingErrors[PT_BRMT] = true;
      ignoreMissingErrors[PT_FOG] = true;
      ignoreMissingErrors[PT_RIME] = true;
    }

    const elements = sd.elements;
    const missingElementIdentifiers = new Map<string, number>();
    if (vLt(this.version, V(98, 0))) {
      interface CoarsePaletteInfo {
        firstVersion: Version2; // the first version to which this entry applies
        maxValid: number;       // almost all element numbers in the range [1, maxValid] are valid, but see golHoleFirst
        golHoleFirst: number;   // the element numbers in the range [golHoleFirst, golHoleLast] are not valid
        golHoleLast: number;
      }
      const cpi: CoarsePaletteInfo[] = [
        // must be sorted by firstVersion
        { firstVersion: V(78, 1), maxValid: 160, golHoleFirst: 144, golHoleLast: 146 }, // 147 isn't allocated in this version but other elements
        //                                                                                  in certain states are loaded as 147, so leave it alone
        { firstVersion: V(79, 0), maxValid: 160, golHoleFirst: 145, golHoleLast: 146 }, // similarly
        { firstVersion: V(80, 0), maxValid: 160, golHoleFirst: 146, golHoleLast: 146 }, // similarly
        { firstVersion: V(80, 5), maxValid: 160, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(81, 7), maxValid: 161, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(83, 0), maxValid: 162, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(83, 4), maxValid: 163, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(84, 0), maxValid: 166, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(86, 0), maxValid: 169, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(87, 1), maxValid: 172, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(89, 0), maxValid: 176, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(90, 0), maxValid: 178, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(91, 0), maxValid: 179, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(92, 0), maxValid: 185, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(94, 0), maxValid: 186, golHoleFirst: 146, golHoleLast: 146 },
        { firstVersion: V(96, 0), maxValid: 191, golHoleFirst: 146, golHoleLast: 146 },
      ];
      let found = cpi[0]; // pretend everything is at least from the first version in the list
      for (const info of cpi.slice(1)) {
        if (vLe(info.firstVersion, this.version)) {
          found = info;
        }
      }
      for (let i = 1; i <= found.maxValid; i++) {
        if (i >= found.golHoleFirst && i <= found.golHoleLast) {
          continue;
        }
        partMap[i] = i;
      }
    }
    for (const pi of this.palette) {
      if (pi[1] > 0 && pi[1] < PT_NUM) {
        let myId = 0;
        for (let i = 0; i < PT_NUM; i++) {
          if (elements[i].Enabled && elements[i].Identifier === pi[0]) {
            myId = i;
          }
        }
        partMap[pi[1]] = myId;
        if (!myId) {
          if (!missingElementIdentifiers.has(pi[0])) missingElementIdentifiers.set(pi[0], pi[1]);
        }
      }
    }
    const paletteLookup = (type: number, ignoreMissing: boolean): number => {
      if (type > 0 && type < PT_NUM) {
        const carriedType = partMap[type];
        if (!carriedType) { // type is not 0 so this shouldn't be 0 either
          if (ignoreMissing)
            return type;
          this.missingElements.ids.add(type);
        }
        type = carriedType;
      }
      return type;
    };

    const pmapmask = ((1 << this.pmapbits) - 1) >>> 0;
    for (let n = 0; n < NPART && n < this.particlesCount; n++) {
      const tempPart = this.part(n);
      if (tempPart.type <= 0 || tempPart.type >= PT_NUM) {
        continue;
      }
      tempPart.type = paletteLookup(tempPart.type, false);
      for (const index of possiblyCarriesType) {
        if ((elements[tempPart.type].CarriesTypeIn >>> 0) & ((1 << index) >>> 0)) {
          const name = propName(index);
          const prop = tempPart[name];
          let carriedType = prop & (pmapmask | 0);
          const extra = prop >> this.pmapbits;
          carriedType = paletteLookup(carriedType, ignoreMissingErrors[tempPart.type]);
          tempPart[name] = PMAP(extra, carriedType);
        }
      }
    }
    for (const [key, value] of [...missingElementIdentifiers].sort((a, b) => (a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0))) {
      if (this.missingElements.ids.has(value)) {
        if (!this.missingElements.identifiers.has(key)) this.missingElements.identifiers.set(key, value);
      }
    }
  }

  Expand(data: Uint8Array): void {
    if (data.length > 15) {
      if ((data[0] === 0x66 && data[1] === 0x75 && data[2] === 0x43) || (data[0] === 0x50 && data[1] === 0x53 && data[2] === 0x76)) {
        this.readPSv(data);
      } else if (data[0] === 0x4F && data[1] === 0x50 && data[2] === 0x53) { // 'O' 'P' 'S'
        if (data[3] !== 0x31) // '1'
          throw new ParseException(WrongVersion, 'Save format from newer version');
        this.readOPS(data);
      } else {
        throw new ParseException(Corrupt, 'Invalid save format');
      }
      this.MapPalette();
    } else {
      throw new ParseException(Corrupt, 'No data');
    }
  }

  setSize(newBlockSize: Vec2): void {
    this.blockSize = { X: newBlockSize.X, Y: newBlockSize.Y };
    this.blockContent = originRect(this.blockSize);

    this.particlesCount = 0;
    this.particles = [];

    this.blockMap = planeU8(this.blockSize, 0);
    this.fanVelX = planeF32(this.blockSize, 0.0);
    this.fanVelY = planeF32(this.blockSize, 0.0);
    this.pressure = planeF32(this.blockSize, 0.0);
    this.velocityX = planeF32(this.blockSize, 0.0);
    this.velocityY = planeF32(this.blockSize, 0.0);
    this.ambientHeat = planeF32(this.blockSize, 0.0);
    this.blockAir = planeU8(this.blockSize, 0);
    this.blockAirh = planeU8(this.blockSize, 0);
    this.gravMass = planeF32(this.blockSize, 0);
    this.gravMask = planeU32(this.blockSize, 0xFFFFFFFF);
    this.gravForceX = planeF32(this.blockSize, 0);
    this.gravForceY = planeF32(this.blockSize, 0);
  }

  /** returns [ fakeFromNewerVersion, gameData ]; gameData is empty when building failed */
  Serialise(): [boolean, Uint8Array] {
    try {
      return this.serialiseOPS();
    } catch (e) {
      if (e instanceof BuildException) {
        console.log(e.message);
        return [false, new Uint8Array(0)];
      }
      throw e;
    }
  }

  /** Transform(Mat2<int> transform, Vec2<int> nudge); transform is [A, B, C, D] (⎛A B⎞ ⎝C D⎠ on column vectors) */
  Transform(transform: readonly [number, number, number, number], nudge: Vec2): void {
    const [A, B, C, D] = transform;
    const mulI = (v: Vec2): Vec2 => ({ X: A * v.X + B * v.Y, Y: C * v.X + D * v.Y });
    // Mat2<int> * Vec2<float>: float products and sums
    const mulF = (x: number, y: number): [number, number] => [f(f(A * x) + f(B * y)), f(f(C * x) + f(D * y))];
    const blockSize = this.blockSize;
    // undo translation by rotation
    const br = mulI({ X: blockSize.X * CELL - 1, Y: blockSize.Y * CELL - 1 });
    const bbr = mulI({ X: blockSize.X - 1, Y: blockSize.Y - 1 });
    const translate = { X: Math.max(0, -br.X), Y: Math.max(0, -br.Y) };
    const btranslate = { X: Math.max(0, -bbr.X), Y: Math.max(0, -bbr.Y) };
    let newBlockS = mulI(blockSize);
    newBlockS.X = Math.abs(newBlockS.X);
    newBlockS.Y = Math.abs(newBlockS.Y);
    translate.X += nudge.X;
    translate.Y += nudge.Y;

    // Grow as needed.
    if (!rectContains(originRect({ X: CELL, Y: CELL }), nudge.X, nudge.Y)) throw new Error('assert(nudge in CELL rect)');
    this.blockContent = originRect(newBlockS);
    if (nudge.X) newBlockS.X += 1;
    if (nudge.Y) newBlockS.Y += 1;
    if (nudge.X >= CELL / 2) this.blockContent.pos.X += 1;
    if (nudge.Y >= CELL / 2) this.blockContent.pos.Y += 1;
    btranslate.X += this.blockContent.pos.X;
    btranslate.Y += this.blockContent.pos.Y;

    // TODO: allow transforms to yield bigger saves. For this we'd need SaveRenderer (the singleton, not Renderer)
    // to fully render them (possible with stitching) and Simulation::Load to be able to take only the part that fits.
    {
      // newBlockS.Clamp(RectBetween({ 0, 0 }, CELLS))
      const r = RectBetween({ X: 0, Y: 0 }, CELLS);
      newBlockS = {
        X: Math.min(Math.max(newBlockS.X, r.pos.X), r.pos.X + r.size.X - 1),
        Y: Math.min(Math.max(newBlockS.Y, r.pos.Y), r.pos.Y + r.size.Y - 1),
      };
    }
    this.blockContent = rectAnd(this.blockContent, originRect(CELLS));
    const newPartS = { X: newBlockS.X * CELL, Y: newBlockS.Y * CELL };

    // Prepare to patch pipes.
    const pipeOffsetMap = Element_PIPE_offsets.map((offset) => {
      const t = mulI(offset);
      const it = Element_PIPE_offsets.findIndex((o) => o.X === t.X && o.Y === t.Y);
      if (it === -1) throw new Error('assert(it != Element_PIPE_offsets.end())');
      return it;
    });

    // Translate signs.
    for (let i = 0; i < this.signs.length; i++) {
      const p = mulI({ X: this.signs[i].x, Y: this.signs[i].y });
      const newPos = { X: p.X + translate.X, Y: p.Y + translate.Y };
      if (!rectContains(originRect(newPartS), newPos.X, newPos.Y)) {
        this.signs[i].text = '';
        continue;
      }
      this.signs[i].x = newPos.X;
      this.signs[i].y = newPos.Y;
    }

    // Translate particles.
    for (let i = 0; i < this.particlesCount; i++) {
      const part = this.part(i);
      if (!part.type) {
        continue;
      }
      {
        // * We want particles to retain their distance from the centre of the particle grid cell
        //   they are in, but more importantly we also don't want them to change grid cells,
        //   so we just get rid of the edge cases.
        const threshold = f(0.001);
        const boundaryDiffX = f(part.x - f(Math.floor(part.x) + 0.5));
        if (Math.abs(boundaryDiffX) < threshold) {
          part.x = f(part.x + (boundaryDiffX < 0 || Object.is(boundaryDiffX, -0) ? -threshold : threshold));
        }
        const boundaryDiffY = f(part.y - f(Math.floor(part.y) + 0.5));
        if (Math.abs(boundaryDiffY) < threshold) {
          part.y = f(part.y + (boundaryDiffY < 0 || Object.is(boundaryDiffY, -0) ? -threshold : threshold));
        }
      }
      if (f(part.x - Math.floor(part.x)) === 0.5) part.x = f(part.x + f(0.001));
      if (f(part.y - Math.floor(part.y)) === 0.5) part.y = f(part.y + f(0.001));
      const m = mulF(part.x, part.y);
      const newPos = [f(m[0] + translate.X), f(m[1] + translate.Y)];
      if (!rectContains(originRect(newPartS), itrunc(Math.floor(f(newPos[0] + 0.5))), itrunc(Math.floor(f(newPos[1] + 0.5))))) {
        part.type = PT_NONE;
        continue;
      }
      part.x = newPos[0];
      part.y = newPos[1];
      const newVel = mulF(part.vx, part.vy);
      part.vx = newVel[0];
      part.vy = newVel[1];
      if (part.type === PT_PIPE || part.type === PT_PPIP) {
        Element_PIPE_transformPatchOffsets(part, pipeOffsetMap);
      }
    }

    // Translate blocky stuff.
    const newBlockMap = planeU8(newBlockS, 0);
    const newFanVelX = planeF32(newBlockS, 0.0);
    const newFanVelY = planeF32(newBlockS, 0.0);
    const newPressure = planeF32(newBlockS, 0.0);
    const newVelocityX = planeF32(newBlockS, 0.0);
    const newVelocityY = planeF32(newBlockS, 0.0);
    const newAmbientHeat = planeF32(newBlockS, 0.0);
    const newBlockAir = planeU8(newBlockS, 0);
    const newBlockAirh = planeU8(newBlockS, 0);
    const newGravMass = planeF32(newBlockS, 0);
    const newGravMask = planeU32(newBlockS, 0xFFFFFFFF);
    const newGravForceX = planeF32(newBlockS, 0);
    const newGravForceY = planeF32(newBlockS, 0);
    for (const bpos of rectPoints(originRect(blockSize))) {
      const t = mulI(bpos);
      const newBpos = { X: t.X + btranslate.X, Y: t.Y + btranslate.Y };
      if (!rectContains(originRect(newBlockS), newBpos.X, newBpos.Y)) {
        continue;
      }
      if (this.blockMap.get(bpos)) {
        newBlockMap.set(newBpos, this.blockMap.get(bpos));
        if (this.blockMap.get(bpos) === WL_FAN) {
          const newVel = mulF(this.fanVelX.get(bpos), this.fanVelY.get(bpos));
          newFanVelX.set(newBpos, newVel[0]);
          newFanVelY.set(newBpos, newVel[1]);
        }
      }
      newPressure.set(newBpos, this.pressure.get(bpos));
      {
        const transformed = mulF(this.velocityX.get(bpos), this.velocityY.get(bpos));
        newVelocityX.set(newBpos, transformed[0]);
        newVelocityY.set(newBpos, transformed[1]);
      }
      newAmbientHeat.set(newBpos, this.ambientHeat.get(bpos));
      newBlockAir.set(newBpos, this.blockAir.get(bpos));
      newBlockAirh.set(newBpos, this.blockAirh.get(bpos));
      newGravMass.set(newBpos, this.gravMass.get(bpos));
      newGravMask.set(newBpos, this.gravMask.get(bpos));
      {
        const transformed = mulF(this.gravForceX.get(bpos), this.gravForceY.get(bpos));
        newGravForceX.set(newBpos, transformed[0]);
        newGravForceY.set(newBpos, transformed[1]);
      }
    }
    this.blockMap = newBlockMap;
    this.fanVelX = newFanVelX;
    this.fanVelY = newFanVelY;
    this.pressure = newPressure;
    this.velocityX = newVelocityX;
    this.velocityY = newVelocityY;
    this.ambientHeat = newAmbientHeat;
    this.blockAir = newBlockAir;
    this.blockAirh = newBlockAirh;
    this.gravMass = newGravMass;
    this.gravMask = newGravMask;
    this.gravForceX = newGravForceX;
    this.gravForceY = newGravForceY;

    this.blockSize = newBlockS;
  }

  private readOPS(data: Uint8Array): void {
    const builtinGol = sd.builtinGol;

    // Renderer::PopulateTables(): colour.ts builds its tables at load

    const inputData = data;
    let partsData: Uint8Array | null = null;
    let partsPosData: Uint8Array | null = null;
    let fanData: Uint8Array | null = null;
    let wallData: Uint8Array | null = null;
    let soapLinkData: Uint8Array | null = null;
    let pressData: Uint8Array | null = null;
    let vxData: Uint8Array | null = null;
    let vyData: Uint8Array | null = null;
    let ambientData: Uint8Array | null = null;
    let blockAirData: Uint8Array | null = null;
    let gravityData: Uint8Array | null = null;
    let partsCount = 0;
    const savedVersion = inputData[4];
    this.version = [savedVersion, 0];

    const getIfType = (b: Bson, key: string, type: number): Bson | null => {
      const node = b.Get(key);
      if (node) {
        if (node.GetType() !== type) {
          console.error(`Wrong type for ${key}`);
          return null;
        }
        return node;
      }
      return null;
    };
    const getAddressIfUser = (b: Bson, key: string): Uint8Array | null => {
      const node = getIfType(b, key, userValue);
      return node ? node.asUser() : null;
    };
    const copyIfBool = (b: Bson, key: string, set: (v: boolean) => void): boolean => {
      const node = getIfType(b, key, boolValue);
      if (node) {
        set(node.asBool());
        return true;
      }
      return false;
    };
    const copyIfInt32 = (b: Bson, key: string, set: (v: number) => void): boolean => {
      const node = getIfType(b, key, int32Value);
      if (node) {
        set(node.asInt32());
        return true;
      }
      return false;
    };
    const copyIfInt64 = (b: Bson, key: string, set: (v: bigint) => void): boolean => {
      const node = getIfType(b, key, int64Value);
      if (node) {
        set(node.asInt64());
        return true;
      }
      return false;
    };
    const copyIfFloat = (b: Bson, key: string, set: (v: number) => void): boolean => {
      const node = getIfType(b, key, doubleValue);
      if (node) {
        set(f(node.asDouble()));
        return true;
      }
      return false;
    };

    let b: Bson;

    // Block sizes
    const blockP = { X: 0, Y: 0 };
    const blockS = { X: inputData[6], Y: inputData[7] };

    // Full size, normalised
    const partP = { X: blockP.X * CELL, Y: blockP.Y * CELL };
    const partS = { X: blockS.X * CELL, Y: blockS.Y * CELL };

    // Incompatible cell size
    if (inputData[5] !== CELL)
      throw new ParseException(InvalidDimensions, 'Incorrect CELL size');

    if (!rectContains(RectBetween({ X: 0, Y: 0 }, CELLS), blockS.X, blockS.Y))
      throw new ParseException(InvalidDimensions, 'Save is of invalid size');

    // Too large/off screen
    if (!rectContains(RectBetween({ X: 0, Y: 0 }, CELLS), blockP.X + blockS.X, blockP.Y + blockS.Y))
      throw new ParseException(InvalidDimensions, 'Save extends beyond canvas');

    this.setSize(blockS);

    let toAlloc = 0;
    toAlloc = inputData[8];
    toAlloc |= inputData[9] << 8;
    toAlloc |= inputData[10] << 16;
    toAlloc |= inputData[11] << 24;
    toAlloc >>>= 0;

    // Check for overflows, don't load saves larger than 200MB
    if (toAlloc > 209715200 || !toAlloc)
      throw new ParseException(InvalidDimensions, 'Save data too large, refusing');

    {
      const { status, data: bsonData } = BZ2WDecompress(inputData.subarray(12), toAlloc);
      switch (status) {
      case BZ2WDecompressOk: break;
      case BZ2WDecompressNomem: throw new ParseException(Corrupt, 'Cannot allocate memory');
      default: throw new ParseException(Corrupt, `Cannot decompress: status ${status}`);
      }

      try {
        b = Bson.Parse(bsonData, opsNonconformance);
      } catch (ex) {
        if (ex instanceof ParseError) {
          throw new ParseException(Corrupt, 'BSON error when parsing save: ' + fromUtf8(ex.message));
        }
        throw ex;
      }
    }

    const tempSigns: Sign[] = [];

    let releaseType = 'R';
    const origin = getIfType(b, 'origin', objectValue);
    if (origin) {
      copyIfInt32(origin, 'minorVersion', (minorVersion) => {
        // Version components are size_t
        this.version[1] = minorVersion < 0 ? minorVersion + 18446744073709551616 : minorVersion;
      });
      const value = getIfType(origin, 'releaseType', stringValue);
      if (value) {
        releaseType = value.asString();
      }
    }
    this.fromNewerVersion = vGt(this.version, currentVersion);
    if (this.fromNewerVersion) {
      this.fromUnstableVersion = releaseType !== 'R';
    }

    partsData = getAddressIfUser(b, 'parts') ?? partsData;
    partsPosData = getAddressIfUser(b, 'partsPos') ?? partsPosData;
    wallData = getAddressIfUser(b, 'wallMap') ?? wallData;
    pressData = getAddressIfUser(b, 'pressMap') ?? pressData;
    vxData = getAddressIfUser(b, 'vxMap') ?? vxData;
    vyData = getAddressIfUser(b, 'vyMap') ?? vyData;
    ambientData = getAddressIfUser(b, 'ambientMap') ?? ambientData;
    blockAirData = getAddressIfUser(b, 'blockAir') ?? blockAirData;
    gravityData = getAddressIfUser(b, 'gravity') ?? gravityData;
    fanData = getAddressIfUser(b, 'fanMap') ?? fanData;
    soapLinkData = getAddressIfUser(b, 'soapLinks') ?? soapLinkData;
    copyIfBool(b, 'legacyEnable', (v) => { this.legacyEnable = v; });
    copyIfBool(b, 'gravityEnable', (v) => { this.gravityEnable = v; });
    copyIfBool(b, 'aheat_enable', (v) => { this.aheatEnable = v; });
    copyIfBool(b, 'waterEEnabled', (v) => { this.waterEEnabled = v; });
    copyIfBool(b, 'paused', (v) => { this.paused = v; });
    copyIfInt32(b, 'gravityMode', (v) => { this.gravityMode = v; });
    copyIfFloat(b, 'customGravityX', (v) => { this.customGravityX = v; });
    copyIfFloat(b, 'customGravityY', (v) => { this.customGravityY = v; });
    copyIfInt32(b, 'airMode', (v) => { this.airMode = v; });
    copyIfFloat(b, 'ambientAirTemp', (v) => { this.ambientAirTemp = v; });
    copyIfFloat(b, 'edgePressure', (v) => { this.edgePressure = v; });
    copyIfFloat(b, 'edgeVelocityX', (v) => { this.edgeVelocityX = v; });
    copyIfFloat(b, 'edgeVelocityY', (v) => { this.edgeVelocityY = v; });
    copyIfFloat(b, 'vorticityCoeff', (v) => { this.vorticityCoeff = v; });

    // Before 99.0 the default is "legacy", from 99.0 the default is "Boussinesq"
    if (vGe(this.version, V(99, 0)))
      this.convectionMode = AIRC_BOUSSINESQ;
    copyIfInt32(b, 'convectionMode', (v) => { this.convectionMode = v; });

    copyIfInt32(b, 'edgeMode', (v) => { this.edgeMode = v; });
    copyIfInt32(b, 'pmapbits', (v) => { this.pmapbits = v; });
    copyIfBool(b, 'ensureDeterminism', (v) => { this.ensureDeterminism = v; });
    copyIfInt64(b, 'frameCount', (v) => { this.frameCount = Number(BigInt.asUintN(64, v)); });
    {
      // copyIfUser(b, "rngState", rngState): std::array<uint64_t, 2>, little endian
      const node = getIfType(b, 'rngState', userValue);
      if (node) {
        const user = node.asUser();
        if (user.length !== 16) {
          console.error('Wrong size for rngState');
        } else {
          const u32 = (o: number): number => (user[o] | (user[o + 1] << 8) | (user[o + 2] << 16) | (user[o + 3] << 24)) >>> 0;
          this.rngState = [u32(4), u32(0), u32(12), u32(8)];
          this.hasRngState = true;
        }
      }
    }
    const signs = getIfType(b, 'signs', arrayValue);
    if (signs) {
      for (const signNode of signs.asArray()) {
        if (!signNode.Is(objectValue)) {
          console.error('Wrong type for signs[...]');
          continue;
        }
        const tempSign: Sign = { x: 0, y: 0, ju: 0, text: '' };
        const text = getIfType(signNode, 'text', stringValue);
        if (text) {
          tempSign.text = substr(CleanString(fromUtf8(text.asString()), true, true, true), 45);
          if (vLt(this.version, V(94, 2))) {
            if (tempSign.text === '{t}') {
              tempSign.text = 'Temp: {t}';
            } else if (tempSign.text === '{p}') {
              tempSign.text = 'Pressure: {p}';
            }
          }
        }
        const justification = getIfType(signNode, 'justification', int32Value);
        if (justification) {
          tempSign.ju = justification.asInt32();
        }
        const x = getIfType(signNode, 'x', int32Value);
        if (x) {
          tempSign.x = (x.asInt32() + partP.X) | 0;
        }
        const y = getIfType(signNode, 'y', int32Value);
        if (y) {
          tempSign.y = (y.asInt32() + partP.Y) | 0;
        }
        tempSigns.push(tempSign);
      }
    }
    const stkmNode = getIfType(b, 'stkm', objectValue);
    if (stkmNode) {
      copyIfBool(stkmNode, 'rocketBoots1', (v) => { this.stkm.rocketBoots1 = v; });
      copyIfBool(stkmNode, 'rocketBoots2', (v) => { this.stkm.rocketBoots2 = v; });
      copyIfBool(stkmNode, 'fan1', (v) => { this.stkm.fan1 = v; });
      copyIfBool(stkmNode, 'fan2', (v) => { this.stkm.fan2 = v; });
      const rocketBootsFigh = getIfType(stkmNode, 'rocketBootsFigh', arrayValue);
      if (rocketBootsFigh) {
        for (const item of rocketBootsFigh.asArray()) {
          if (item.Is(int32Value)) {
            this.stkm.rocketBootsFigh.push(item.asInt32() >>> 0);
          }
        }
      }
      const fanFigh = getIfType(stkmNode, 'fanFigh', arrayValue);
      if (fanFigh) {
        for (const item of fanFigh.asArray()) {
          if (item.Is(int32Value)) {
            this.stkm.fanFigh.push(item.asInt32() >>> 0);
          }
        }
      }
    }
    const paletteNode = getIfType(b, 'palette', objectValue);
    if (paletteNode) {
      this.palette = [];
      for (const [id, numNode] of paletteNode.sortedEntries()) {
        if (numNode.GetType() === int32Value) {
          this.palette.push([id, numNode.asInt32()]);
        }
      }
    }
    const minimumVersionNode = getIfType(b, 'minimumVersion', objectValue);
    if (minimumVersionNode) {
      let minimumVersion: Version2;
      {
        let major = INT_MAX, minor = INT_MAX;
        copyIfInt32(minimumVersionNode, 'major', (v) => { major = v; });
        copyIfInt32(minimumVersionNode, 'minor', (v) => { minor = v; });
        // Version components are size_t
        const sz = (v: number): number => (v < 0 ? v + 18446744073709551616 : v);
        minimumVersion = [sz(major), sz(minor)];
      }
      if (vLt(effectiveVersion, minimumVersion)) {
        throw new ParseException(WrongVersion, `Save from a newer version: Requires version ${minimumVersion[0]}.${minimumVersion[1]}`);
      }
      // else if (ALLOW_FAKE_NEWER_VERSION && currentVersion < minimumVersion) fakeNewerVersion = true; (development builds only)
    }
    const authorsNode = getIfType(b, 'authors', objectValue);
    if (authorsNode && this.wantAuthors) {
      // we need to clear authors because the save may be read multiple times in the stamp browser (loading and rendering twice)
      // seems inefficient ...
      const authors: { [key: string]: JsonValue } = {};
      ConvertBsonToJson(authorsNode, authors);
      this.authors = authors;
    }

    const paletteRemap = (maxVersion: Version2, from: string, to: string): void => {
      if (vLe(this.version, maxVersion)) {
        const it = this.palette.find((item) => item[0] === from);
        if (it) {
          it[0] = to;
        }
      }
    };
    paletteRemap(V(87, 1), 'DEFAULT_PT_TUGN', 'DEFAULT_PT_TUNG');
    paletteRemap(V(90, 1), 'DEFAULT_PT_REPL', 'DEFAULT_PT_RPEL');
    paletteRemap(V(92, 0), 'DEFAULT_PT_E180', 'DEFAULT_PT_HEAC');
    paletteRemap(V(92, 0), 'DEFAULT_PT_E181', 'DEFAULT_PT_SAWD');
    paletteRemap(V(92, 0), 'DEFAULT_PT_E182', 'DEFAULT_PT_POLO');
    paletteRemap(V(93, 3), 'DEFAULT_PT_RAYT', 'DEFAULT_PT_LDTC');

    // Read wall and fan data
    if (wallData) {
      let j = 0;
      if (blockS.X * blockS.Y > wallData.length)
        throw new ParseException(Corrupt, 'Not enough wall data');
      for (const bpos of columnPoints(originRect(blockS))) {
        let bm = 0;
        if (wallData[bpos.Y * blockS.X + bpos.X])
          bm = wallData[bpos.Y * blockS.X + bpos.X];

        switch (bm) {
        case O_WL_WALLELEC: bm = WL_WALLELEC; break;
        case O_WL_EWALL: bm = WL_EWALL; break;
        case O_WL_DETECT: bm = WL_DETECT; break;
        case O_WL_STREAM: bm = WL_STREAM; break;
        case O_WL_FAN:
        case O_WL_FANHELPER: bm = WL_FAN; break;
        case O_WL_ALLOWLIQUID: bm = WL_ALLOWLIQUID; break;
        case O_WL_DESTROYALL: bm = WL_DESTROYALL; break;
        case O_WL_ERASE: bm = WL_ERASE; break;
        case O_WL_WALL: bm = WL_WALL; break;
        case O_WL_ALLOWAIR: bm = WL_ALLOWAIR; break;
        case O_WL_ALLOWSOLID: bm = WL_ALLOWPOWDER; break;
        case O_WL_ALLOWALLELEC: bm = WL_ALLOWALLELEC; break;
        case O_WL_EHOLE: bm = WL_EHOLE; break;
        case O_WL_ALLOWGAS: bm = WL_ALLOWGAS; break;
        case O_WL_GRAV: bm = WL_GRAV; break;
        case O_WL_ALLOWENERGY: bm = WL_ALLOWENERGY; break;
        }

        if (bm === WL_FAN && fanData) {
          if (j + 1 >= fanData.length) {
            throw new ParseException(Corrupt, 'Not enough fan data');
          }
          const p = { X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y };
          this.fanVelX.set(p, f(f(fanData[j++] - 127.0) / 64.0));
          this.fanVelY.set(p, f(f(fanData[j++] - 127.0) / 64.0));
        }

        if (bm >= UI_WALLCOUNT)
          bm = 0;
        this.blockMap.set({ X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y }, bm);
      }
    }

    // Read pressure data
    if (pressData) {
      let j = 0;
      if (blockS.X * blockS.Y * 2 > pressData.length)
        throw new ParseException(Corrupt, 'Not enough pressure data');
      for (const bpos of columnPoints(originRect(blockS))) {
        const i = pressData[j++];
        const i2 = pressData[j++];
        this.pressure.set({ X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y }, f(f((i + (i2 << 8)) / 128.0) - 256));
      }
      this.hasPressure = true;
    }

    // Read vx data
    if (vxData) {
      let j = 0;
      if (blockS.X * blockS.Y * 2 > vxData.length)
        throw new ParseException(Corrupt, 'Not enough vx data');
      for (const bpos of columnPoints(originRect(blockS))) {
        const i = vxData[j++];
        const i2 = vxData[j++];
        this.velocityX.set({ X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y }, f(f((i + (i2 << 8)) / 128.0) - 256));
      }
    }

    // Read vy data
    if (vyData) {
      let j = 0;
      if (blockS.X * blockS.Y * 2 > vyData.length)
        throw new ParseException(Corrupt, 'Not enough vy data');
      for (const bpos of columnPoints(originRect(blockS))) {
        const i = vyData[j++];
        const i2 = vyData[j++];
        this.velocityY.set({ X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y }, f(f((i + (i2 << 8)) / 128.0) - 256));
      }
    }

    // Read ambient data
    if (ambientData) {
      let i = 0;
      if (blockS.X * blockS.Y * 2 > ambientData.length)
        throw new ParseException(Corrupt, 'Not enough ambient heat data');
      for (const bpos of columnPoints(originRect(blockS))) {
        let tempTemp = ambientData[i++];
        tempTemp |= ambientData[i++] << 8;
        this.ambientHeat.set({ X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y }, tempTemp);
      }
      this.hasAmbientHeat = true;
    }

    if (blockAirData) {
      if (blockS.X * blockS.Y * 2 > blockAirData.length)
        throw new ParseException(Corrupt, 'Not enough block air data');
      const n = blockS.X * blockS.Y;
      for (const bpos of columnPoints(originRect(blockS))) {
        const p = { X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y };
        this.blockAir.set(p, blockAirData[bpos.Y * blockS.X + bpos.X]);
        this.blockAirh.set(p, blockAirData[n + bpos.Y * blockS.X + bpos.X]);
      }
      this.hasBlockAirMaps = true;
    }

    if (gravityData) {
      if (blockS.X * blockS.Y * 4 * 4 > gravityData.length) {
        throw new ParseException(Corrupt, 'Not enough gravity data');
      }
      const view = new DataView(gravityData.buffer, gravityData.byteOffset, gravityData.byteLength);
      const n = blockS.X * blockS.Y;
      for (const bpos of columnPoints(originRect(blockS))) {
        const k = bpos.Y * blockS.X + bpos.X;
        const p = { X: blockP.X + bpos.X, Y: blockP.Y + bpos.Y };
        this.gravMass.set(p, view.getFloat32(4 * k, true));
        this.gravMask.set(p, view.getUint32(4 * (n + k), true));
        this.gravForceX.set(p, view.getFloat32(4 * (2 * n + k), true));
        this.gravForceY.set(p, view.getFloat32(4 * (3 * n + k), true));
      }
      this.hasGravityMaps = true;
    }

    // Read particle data
    if (partsData && partsPosData) {
      let newIndex = 0, tempTemp: number;
      let posCount: number, posTotal: number, partsPosDataIndex = 0;
      if (partS.X * partS.Y * 3 > partsPosData.length)
        throw new ParseException(Corrupt, 'Not enough particle position data');

      partsCount = 0;

      let i = 0;
      const partsDataLen = partsData.length;
      newIndex = 0;
      for (const pos of rectPoints(RectSized(partP, partS))) {
        // Read total number of particles at this position
        posTotal = 0;
        posTotal |= partsPosData[partsPosDataIndex++] << 16;
        posTotal |= partsPosData[partsPosDataIndex++] << 8;
        posTotal |= partsPosData[partsPosDataIndex++];
        // Put the next posTotal particles at this position
        for (posCount = 0; posCount < posTotal; posCount++) {
          this.particlesCount = newIndex + 1;
          // i+3 because we have 4 bytes of required fields (type (1), descriptor (2), temp (1))
          if (i + 3 >= partsDataLen)
            throw new ParseException(Corrupt, 'Ran past particle data buffer');
          let fieldDescriptor = partsData[i + 1];
          fieldDescriptor |= partsData[i + 2] << 8;

          if (newIndex < 0 || newIndex >= NPART)
            throw new ParseException(Corrupt, 'Too many particles');

          // Clear the particle, ready for our new properties
          const part = this.part(newIndex);
          part.clear();

          // Required fields
          part.type = partsData[i];
          part.x = pos.X;
          part.y = pos.Y;
          i += 3;

          // Read type (2nd byte)
          if (fieldDescriptor & 0x4000)
            part.type |= partsData[i++] << 8;

          // Read temp
          if (fieldDescriptor & 0x01) {
            // Full 16bit int
            tempTemp = partsData[i++];
            tempTemp |= partsData[i++] << 8;
            part.temp = tempTemp;
          } else {
            // 1 Byte room temp offset
            tempTemp = partsData[i++];
            if (tempTemp >= 0x80) {
              tempTemp -= 0x100;
            }
            part.temp = f(tempTemp + f(294.15));
          }

          // fieldDesc3
          if (fieldDescriptor & 0x8000) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading third byte of field descriptor');
            fieldDescriptor |= partsData[i++] << 16;
          }

          // Read life
          if (fieldDescriptor & 0x02) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading life');
            part.life = partsData[i++];
            // i++;
            // Read 2nd byte
            if (fieldDescriptor & 0x04) {
              if (i >= partsDataLen)
                throw new ParseException(Corrupt, 'Ran past particle data buffer while loading life');
              part.life |= partsData[i++] << 8;
            }
          }

          // Read tmp
          if (fieldDescriptor & 0x08) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading tmp');
            part.tmp = partsData[i++];
            // Read 2nd byte
            if (fieldDescriptor & 0x10) {
              if (i >= partsDataLen)
                throw new ParseException(Corrupt, 'Ran past particle data buffer while loading tmp');
              part.tmp |= partsData[i++] << 8;
              // Read 3rd and 4th bytes
              if (fieldDescriptor & 0x1000) {
                if (i + 1 >= partsDataLen)
                  throw new ParseException(Corrupt, 'Ran past particle data buffer while loading tmp');
                part.tmp |= partsData[i++] << 24;
                part.tmp |= partsData[i++] << 16;
              }
            }
          }

          // Read ctype
          if (fieldDescriptor & 0x20) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading ctype');
            part.ctype = partsData[i++];
            // Read additional bytes
            if (fieldDescriptor & 0x200) {
              if (i + 2 >= partsDataLen)
                throw new ParseException(Corrupt, 'Ran past particle data buffer while loading ctype');
              part.ctype |= partsData[i++] << 24;
              part.ctype |= partsData[i++] << 16;
              part.ctype |= partsData[i++] << 8;
            }
          }

          // Read dcolour
          if (fieldDescriptor & 0x40) {
            if (i + 3 >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading deco');
            part.dcolour = partsData[i++] << 24;
            part.dcolour |= partsData[i++] << 16;
            part.dcolour |= partsData[i++] << 8;
            part.dcolour |= partsData[i++];
          }

          // Read vx
          if (fieldDescriptor & 0x80) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading vx');
            part.vx = f(f(partsData[i++] - 127.0) / 16.0);
          }

          // Read vy
          if (fieldDescriptor & 0x100) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading vy');
            part.vy = f(f(partsData[i++] - 127.0) / 16.0);
          }

          // Read tmp2
          if (fieldDescriptor & 0x400) {
            if (i >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading tmp2');
            part.tmp2 = partsData[i++];
            if (fieldDescriptor & 0x800) {
              if (i >= partsDataLen)
                throw new ParseException(Corrupt, 'Ran past particle data buffer while loading tmp2');
              part.tmp2 |= partsData[i++] << 8;
            }
          }

          // Read tmp3 and tmp4
          if (fieldDescriptor & 0x2000) {
            if (i + 3 >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading tmp3 and tmp4');
            if (fieldDescriptor & 0x10000 && i + 7 >= partsDataLen)
              throw new ParseException(Corrupt, 'Ran past particle data buffer while loading high halves of tmp3 and tmp4');
            let tmp34: number;
            tmp34 = partsData[i + 0];
            tmp34 |= partsData[i + 1] << 8;
            if (fieldDescriptor & 0x10000) {
              tmp34 |= partsData[i + 4] << 16;
              tmp34 |= partsData[i + 5] << 24;
            }
            part.tmp3 = tmp34 | 0;
            tmp34 = partsData[i + 2];
            tmp34 |= partsData[i + 3] << 8;
            if (fieldDescriptor & 0x10000) {
              tmp34 |= partsData[i + 6] << 16;
              tmp34 |= partsData[i + 7] << 24;
            }
            part.tmp4 = tmp34 | 0;
            i += 4;
            if (fieldDescriptor & 0x10000)
              i += 4;
          }

          // Particle specific parsing:
          switch (part.type) {
          case PT_SOAP:
            // Clear soap links, links will be added back in if soapLinkData is present
            part.ctype &= ~6;
            break;
          case PT_BOMB:
            if (part.tmp !== 0 && savedVersion < 81) {
              part.type = PT_EMBR;
              part.ctype = 0;
              if (part.tmp === 1)
                part.tmp = 0;
            }
            break;
          case PT_DUST:
            if (part.life > 0 && savedVersion < 81) {
              part.type = PT_EMBR;
              part.ctype = (part.tmp2 << 16) | (part.tmp << 8) | part.ctype;
              part.tmp = 1;
            }
            break;
          case PT_FIRW:
            if (part.tmp >= 2 && savedVersion < 81) {
              part.type = PT_EMBR;
              part.ctype = firwTableAt(part.tmp - 4);
              part.tmp = 1;
            }
            break;
          case PT_PSTN:
            if (savedVersion < 87 && part.ctype)
              part.life = 1;
            if (savedVersion < 91)
              part.temp = f(283.15);
            break;
          case PT_FILT:
            if (savedVersion < 89) {
              if (part.tmp < 0 || part.tmp > 3)
                part.tmp = 6;
              part.ctype = 0;
            }
            break;
          case PT_QRTZ:
          case PT_PQRT:
            if (savedVersion < 89) {
              part.tmp2 = part.tmp;
              part.tmp = part.ctype;
              part.ctype = 0;
            }
            break;
          case PT_PHOT:
            if (savedVersion < 90) {
              part.flags |= FLAG_PHOTDECO;
            }
            break;
          case PT_VINE:
            if (savedVersion < 91) {
              part.tmp = 1;
            }
            break;
          case PT_DLAY:
            // correct DLAY temperature in older saves
            // due to either the +.5f now done in DLAY (higher temps), or rounding errors in the old DLAY code (room temperature temps),
            // the delay in all DLAY from older versions will always be one greater than it should
            if (savedVersion < 91) {
              part.temp = f(part.temp - 1.0);
            }
            break;
          case PT_CRAY:
            if (savedVersion < 91) {
              if (part.tmp2) {
                part.ctype |= part.tmp2 << 8;
                part.tmp2 = 0;
              }
            }
            break;
          case PT_CONV:
            if (savedVersion < 91) {
              if (part.tmp) {
                part.ctype |= part.tmp << 8;
                part.tmp = 0;
              }
            }
            break;
          case PT_PIPE:
          case PT_PPIP:
            if (savedVersion < 93) {
              if (part.ctype === 1)
                part.tmp |= 0x00020000; // PFLAG_INITIALIZING
              part.tmp |= (part.ctype - 1) << 18;
              part.ctype = part.tmp & 0xFF;
            }
            if (savedVersion < 100) {
              // tmp flags now exist in the spot previously used by PIPE before ver. 93, clear them
              part.tmp &= ~0xFF;
            }
            break;
          case PT_TSNS:
          case PT_HSWC:
          case PT_PSNS:
          case PT_PUMP:
            if (savedVersion < 93) {
              part.tmp = 0;
            }
            break;
          case PT_LIFE:
            if (savedVersion < 96) {
              if (part.ctype >= 0 && part.ctype < NGOL) {
                part.tmp2 = part.tmp;
                if (!part.dcolour)
                  part.dcolour = builtinGol[part.ctype].colour;
                part.tmp = builtinGol[part.ctype].colour2;
              }
            }
          }
          if (GameSave.PressureInTmp3(part.type)) {
            // pavg[1] used to be saved as a u16, which PressureInTmp3 elements then treated as
            // an i16. tmp3 is now saved as a u32, or as a u16 if it's small enough. PressureInTmp3
            // elements will never use the upper 16 bits, and should still treat the lower 16 bits
            // as an i16, so they need sign extension.
            let tmp3 = part.tmp3 >>> 0;
            if (tmp3 & 0x8000) {
              tmp3 = (tmp3 | 0xFFFF0000) >>> 0;
              part.tmp3 = tmp3 | 0;
            }
          }
          // note: PSv was used in version 77.0 and every version before, add something in PSv too if the element is that old
          newIndex++;
          partsCount++;
        }
      }

      if (i !== partsDataLen)
        throw new ParseException(Corrupt, "Didn't reach end of particle data buffer");
    }

    if (soapLinkData) {
      let soapLinkDataPos = 0;
      for (let i = 0; i < partsCount; i++) {
        if (this.part(i).type === PT_SOAP) {
          // Get the index of the particle forward linked from this one, if present in the save data
          let linkedIndex = 0;
          if (soapLinkDataPos + 3 > soapLinkData.length) break;
          linkedIndex |= soapLinkData[soapLinkDataPos++] << 16;
          linkedIndex |= soapLinkData[soapLinkDataPos++] << 8;
          linkedIndex |= soapLinkData[soapLinkDataPos++];
          // All indexes in soapLinkData and partsSimIndex have 1 added to them (0 means not saved/loaded)
          if (!linkedIndex || linkedIndex - 1 >= partsCount)
            continue;
          linkedIndex = linkedIndex - 1;

          // Attach the two particles
          this.part(i).ctype |= 2;
          this.part(i).tmp = linkedIndex;
          this.part(linkedIndex).ctype |= 4;
          this.part(linkedIndex).tmp2 = i;
        }
      }
    }

    if (tempSigns.length) {
      for (let i = 0; i < tempSigns.length; i++) {
        if (this.signs.length === MAXSIGNS)
          break;
        this.signs.push(tempSigns[i]);
      }
    }
  }

  private readPSv(saveData: Uint8Array): void {
    const builtinGol = sd.builtinGol;
    // Renderer::PopulateTables(): colour.ts builds its tables at load

    let dataLength = saveData.length;
    let q: number, p = 0, ty: number, legacy_beta = 0;
    let blockP = { X: 0, Y: 0 };
    let new_format = 0, ttv = 0;

    const tempSigns: Sign[] = [];

    const builtinElements = sd.elements;

    // New file header uses PSv, replacing fuC. This is to detect if the client uses a new save format for temperatures
    // This creates a problem for old clients, that display and "corrupt" error instead of a "newer version" error

    if (dataLength < 16)
      throw new ParseException(Corrupt, 'No save data');
    if (!(saveData[2] === 0x43 && saveData[1] === 0x75 && saveData[0] === 0x66) && !(saveData[2] === 0x76 && saveData[1] === 0x53 && saveData[0] === 0x50))
      throw new ParseException(Corrupt, 'Unknown format');
    if (saveData[2] === 0x76 && saveData[1] === 0x53 && saveData[0] === 0x50) {
      new_format = 1;
    }
    if (saveData[4] > 97) // this used to respect currentVersion but no valid PSv will ever have a version > 97 so it's ok to hardcode
      throw new ParseException(WrongVersion, 'Save from newer version');
    this.version = [saveData[4], 0];
    const ver = this.version[0];

    if (ver < 34) {
      this.legacyEnable = true;
    } else {
      if (ver >= 44) {
        this.legacyEnable = !!(saveData[3] & 0x01);
        this.paused = !!((saveData[3] >> 1) & 0x01);
        if (ver >= 46) {
          this.gravityMode = ((saveData[3] >> 2) & 0x03); // | ((c[3]>>2)&0x01);
          this.airMode = ((saveData[3] >> 4) & 0x07); // | ((c[3]>>4)&0x02) | ((c[3]>>4)&0x01);
        }
        if (ver >= 49) {
          this.gravityEnable = !!((saveData[3] >> 7) & 0x01);
        }
      } else {
        if (saveData[3] === 1 || saveData[3] === 0) {
          this.legacyEnable = !!saveData[3];
        } else {
          legacy_beta = 1;
        }
      }
    }

    const blockS = { X: saveData[6], Y: saveData[7] };
    blockP = {
      X: Math.min(Math.max(blockP.X, 0), Math.max(blockS.X - 1, 0)),
      Y: Math.min(Math.max(blockP.Y, 0), Math.max(blockS.Y - 1, 0)),
    };

    if (saveData[5] !== CELL || blockP.X + blockS.X > XCELLS || blockP.Y + blockS.Y > YCELLS)
      throw new ParseException(InvalidDimensions, 'Save too large');
    let size = saveData[8];
    size |= saveData[9] << 8;
    size |= saveData[10] << 16;
    size |= saveData[11] << 24;

    if (size > 209715200 || !size)
      throw new ParseException(InvalidDimensions, 'Save data too large');

    const { status, data: bsonData } = BZ2WDecompress(saveData.subarray(12), size >>> 0);
    switch (status) {
    case BZ2WDecompressOk: break;
    case BZ2WDecompressNomem: throw new ParseException(Corrupt, 'Cannot allocate memory');
    default: throw new ParseException(Corrupt, `Cannot decompress: status ${status}`);
    }

    this.setSize(blockS);
    const data = bsonData;
    dataLength = bsonData.length;

    if (dataLength < blockS.X * blockS.Y)
      throw new ParseException(Corrupt, 'Save data corrupt (missing data)');

    // normalize coordinates
    const partS = { X: blockS.X * CELL, Y: blockS.Y * CELL };
    const partP = { X: blockP.X * CELL, Y: blockP.Y * CELL };

    if (ver < 46) {
      this.gravityMode = GRAV_VERTICAL;
      this.airMode = AIR_ON;
    }

    // PlaneAdapter<std::vector<int>> particleIDMap(RES, 0)
    const particleIDMap = new Int32Array(RES.X * RES.Y);
    const idAt = (pos: Vec2): number => particleIDMap[pos.Y * RES.X + pos.X];
    const notEnough = (): ParseException => new ParseException(Corrupt, 'Not enough data');

    // load the required air state
    for (const bpos of rectPoints(RectSized(blockP, blockS))) {
      if (data[p]) {
        // In old saves, ignore walls created by sign tool bug
        // Not ignoring other invalid walls or invalid walls in new saves, so that any other bugs causing them are easier to notice, find and fix
        if (ver >= 44 && ver < 71 && data[p] === O_WL_SIGN) {
          p++;
          continue;
        }
        let bm = data[p];
        switch (bm) {
        case 1: bm = WL_WALL; break;
        case 2: bm = WL_DESTROYALL; break;
        case 3: bm = WL_ALLOWLIQUID; break;
        case 4: bm = WL_FAN; break;
        case 5: bm = WL_STREAM; break;
        case 6: bm = WL_DETECT; break;
        case 7: bm = WL_EWALL; break;
        case 8: bm = WL_WALLELEC; break;
        case 9: bm = WL_ALLOWAIR; break;
        case 10: bm = WL_ALLOWPOWDER; break;
        case 11: bm = WL_ALLOWALLELEC; break;
        case 12: bm = WL_EHOLE; break;
        case 13: bm = WL_ALLOWGAS; break;
        }

        if (ver >= 44) {
          /* The numbers used to save walls were changed, starting in v44.
           * The new numbers are ignored for older versions due to some corruption of bmap in saves from older versions.
           */
          switch (bm) {
          case O_WL_WALLELEC: bm = WL_WALLELEC; break;
          case O_WL_EWALL: bm = WL_EWALL; break;
          case O_WL_DETECT: bm = WL_DETECT; break;
          case O_WL_STREAM: bm = WL_STREAM; break;
          case O_WL_FAN:
          case O_WL_FANHELPER: bm = WL_FAN; break;
          case O_WL_ALLOWLIQUID: bm = WL_ALLOWLIQUID; break;
          case O_WL_DESTROYALL: bm = WL_DESTROYALL; break;
          case O_WL_ERASE: bm = WL_ERASE; break;
          case O_WL_WALL: bm = WL_WALL; break;
          case O_WL_ALLOWAIR: bm = WL_ALLOWAIR; break;
          case O_WL_ALLOWSOLID: bm = WL_ALLOWPOWDER; break;
          case O_WL_ALLOWALLELEC: bm = WL_ALLOWALLELEC; break;
          case O_WL_EHOLE: bm = WL_EHOLE; break;
          case O_WL_ALLOWGAS: bm = WL_ALLOWGAS; break;
          case O_WL_GRAV: bm = WL_GRAV; break;
          case O_WL_ALLOWENERGY: bm = WL_ALLOWENERGY; break;
          }
        }

        if (bm >= UI_WALLCOUNT)
          bm = 0;
        this.blockMap.set(bpos, bm);
      }

      p++;
    }
    const dataPlane = (bpos: Vec2): number => data[(bpos.Y - blockP.Y) * blockS.X + (bpos.X - blockP.X)];
    for (const bpos of rectPoints(RectSized(blockP, blockS))) {
      if (dataPlane(bpos) === 4 || (ver >= 44 && dataPlane(bpos) === O_WL_FAN)) {
        if (p >= dataLength)
          throw notEnough();
        this.fanVelX.set(bpos, f(f(data[p++] - 127.0) / 64.0));
      }
    }
    for (const bpos of rectPoints(RectSized(blockP, blockS))) {
      if (dataPlane(bpos) === 4 || (ver >= 44 && dataPlane(bpos) === O_WL_FAN)) {
        if (p >= dataLength)
          throw notEnough();
        this.fanVelY.set(bpos, f(f(data[p++] - 127.0) / 64.0));
      }
    }

    // load the particle map
    let pty: number;
    {
      let k = 0;
      pty = p;
      for (const pos of rectPoints(RectSized(partP, partS))) {
        if (p >= dataLength)
          throw notEnough();
        let j = data[p++];
        if (j >= PT_NUM) { // not possible these days since PMAPBITS >= 8
          j = PT_DUST; // throw ParseException(ParseException::Corrupt, "Not enough data at line " MTOS(__LINE__) " in " MTOS(__FILE__));
        }
        if (j) {
          const part = this.part(k);
          part.clear();
          part.type = j;
          if (j === PT_COAL)
            part.tmp = 50;
          if (j === PT_FUSE)
            part.tmp = 50;
          if (j === PT_PHOT)
            part.ctype = 0x3fffffff;
          if (j === PT_SOAP)
            part.ctype = 0;
          if (j === PT_BIZR || j === PT_BIZRG || j === PT_BIZRS)
            part.ctype = 0x47FFFF;
          part.x = pos.X;
          part.y = pos.Y;
          particleIDMap[(pos.Y - partP.Y) * RES.X + (pos.X - partP.X)] = k + 1;
          this.particlesCount = ++k;
        }
      }
    }
    const particles = (n: number): Particle => this.part(n);

    // load particle properties
    for (const pos of rectPoints(originRect(partS))) {
      let i = idAt(pos);
      if (i) {
        i--;
        if (p + 1 >= dataLength)
          throw notEnough();
        if (i < NPART) {
          particles(i).vx = f(f(data[p++] - 127.0) / 16.0);
          particles(i).vy = f(f(data[p++] - 127.0) / 16.0);
        } else
          p += 2;
      }
    }
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      if (i) {
        if (ver >= 44) {
          if (p + 2 > dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            ttv = data[p++] << 8;
            ttv |= data[p++];
            particles(i - 1).life = ttv;
          } else {
            p += 2;
          }
        } else {
          if (p >= dataLength)
            throw notEnough();
          if (i <= NPART)
            particles(i - 1).life = data[p++] * 4;
          else
            p++;
        }
      }
    }
    if (ver >= 44) {
      for (const pos of rectPoints(originRect(partS))) {
        const i = idAt(pos);
        if (i) {
          if (p + 2 > dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            ttv = data[p++] << 8;
            ttv |= data[p++];
            particles(i - 1).tmp = ttv;
            if (ver < 53 && !particles(i - 1).tmp)
              for (q = 0; q < NGOL; q++) {
                if (particles(i - 1).type === builtinGol[q].oldtype && (builtinGol[q].ruleset >> 17) === 0)
                  particles(i - 1).tmp = (builtinGol[q].ruleset >> 17) + 1;
              }
            if (ver >= 51 && ver < 53 && particles(i - 1).type === PT_PBCN) {
              particles(i - 1).tmp2 = particles(i - 1).tmp;
              particles(i - 1).tmp = 0;
            }
          } else {
            p += 2;
          }
        }
      }
    }
    const dataPlanePty = (pos: Vec2): number => data[pty + pos.Y * partS.X + pos.X];
    if (ver >= 53) {
      for (const pos of rectPoints(originRect(partS))) {
        const i = idAt(pos);
        ty = dataPlanePty(pos);
        if (i && (ty === PT_PBCN || (ty === PT_TRON && ver >= 77))) {
          if (p >= dataLength)
            throw notEnough();
          if (i <= NPART)
            particles(i - 1).tmp2 = data[p++];
          else
            p++;
        }
      }
    }
    // Read ALPHA component
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      if (i) {
        if (ver >= 49) {
          if (p >= dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            particles(i - 1).dcolour = data[p++] << 24;
          } else {
            p++;
          }
        }
      }
    }
    // Read RED component
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      if (i) {
        if (ver >= 49) {
          if (p >= dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            particles(i - 1).dcolour |= data[p++] << 16;
          } else {
            p++;
          }
        }
      }
    }
    // Read GREEN component
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      if (i) {
        if (ver >= 49) {
          if (p >= dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            particles(i - 1).dcolour |= data[p++] << 8;
          } else {
            p++;
          }
        }
      }
    }
    // Read BLUE component
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      if (i) {
        if (ver >= 49) {
          if (p >= dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            particles(i - 1).dcolour |= data[p++];
          } else {
            p++;
          }
        }
      }
    }
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      ty = dataPlanePty(pos);
      if (i) {
        if (ver >= 34 && legacy_beta === 0) {
          if (p >= dataLength) {
            throw notEnough();
          }
          if (i <= NPART) {
            if (ver >= 42) {
              if (new_format) {
                ttv = data[p++] << 8;
                if (p >= dataLength) {
                  throw notEnough();
                }
                ttv |= data[p++];
                if (particles(i - 1).type === PT_PUMP) {
                  particles(i - 1).temp = ttv + 0.15; // fix PUMP saved at 0, so that it loads at 0.
                } else {
                  particles(i - 1).temp = ttv;
                }
              } else {
                particles(i - 1).temp = (data[p++] * (((MAX_TEMP + (-MIN_TEMP)) / 255) | 0)) + MIN_TEMP;
              }
            } else {
              particles(i - 1).temp = ((data[p++] * (((O_MAX_TEMP + (-O_MIN_TEMP)) / 255) | 0)) + O_MIN_TEMP) + 273;
            }
          } else {
            p++;
            if (new_format) {
              if (p >= dataLength) {
                throw notEnough();
              }
              p++;
            }
          }
        } else {
          particles(i - 1).temp = builtinElements[particles(i - 1).type].DefaultProperties.temp;
        }
      }
    }
    for (const pos of rectPoints(originRect(partS))) {
      const i = idAt(pos);
      let gnum = 0;
      ty = dataPlanePty(pos);
      if (i && (ty === PT_CLNE || (ty === PT_PCLN && ver >= 43) || (ty === PT_BCLN && ver >= 44) || (ty === PT_SPRK && ver >= 21) || (ty === PT_LAVA && ver >= 34) || (ty === PT_PIPE && ver >= 43) || (ty === PT_LIFE && ver >= 51) || (ty === PT_PBCN && ver >= 52) || (ty === PT_WIRE && ver >= 55) || (ty === PT_STOR && ver >= 59) || (ty === PT_CONV && ver >= 60))) {
        if (p >= dataLength)
          throw notEnough();
        if (i <= NPART)
          particles(i - 1).ctype = data[p++];
        else
          p++;
      }
      // no more particle properties to load, so we can change type here without messing up loading
      if (i && i <= NPART) {
        const part = particles(i - 1);
        if (ver < 90 && part.type === PT_PHOT) {
          part.flags |= FLAG_PHOTDECO;
        }
        if (ver < 79 && part.type === PT_SPNG) {
          if (Math.abs(part.vx) > 0.0 || Math.abs(part.vy) > 0.0)
            part.flags |= FLAG_MOVABLE;
        }

        if (ver < 48 && (ty === OLD_PT_WIND || (ty === PT_BRAY && part.life === 0))) {
          // Replace invisible particles with something sensible and add decoration to hide it
          part.dcolour = 0xFF000000;
          part.type = PT_DMND;
        }
        if (ver < 51 && ((ty >= 78 && ty <= 89) || (ty >= 134 && ty <= 146 && ty !== 141))) {
          // Replace old GOL
          part.type = PT_LIFE;
          for (gnum = 0; gnum < NGOL; gnum++) {
            if (ty === builtinGol[gnum].oldtype)
              part.ctype = gnum;
          }
          ty = PT_LIFE;
        }
        if (ver < 52 && (ty === PT_CLNE || ty === PT_PCLN || ty === PT_BCLN)) {
          // Replace old GOL ctypes in clone
          for (gnum = 0; gnum < NGOL; gnum++) {
            if (part.ctype === builtinGol[gnum].oldtype) {
              part.ctype = PT_LIFE;
              part.tmp = gnum;
            }
          }
        }
        if (part.type === PT_LIFE) {
          part.tmp2 = part.tmp;
          part.tmp = 0;
          if (part.ctype >= 0 && part.ctype < NGOL) {
            if (!part.dcolour)
              part.dcolour = builtinGol[part.ctype].colour;
            part.tmp = builtinGol[part.ctype].colour2;
          }
        }
        if (ty === PT_LCRY) {
          if (ver < 67) {
            // New LCRY uses TMP not life
            if (part.life >= 10) {
              part.life = 10;
              part.tmp2 = 10;
              part.tmp = 3;
            } else if (part.life <= 0) {
              part.life = 0;
              part.tmp2 = 0;
              part.tmp = 0;
            } else if (part.life < 10 && part.life > 0) {
              part.tmp = 1;
            }
          } else {
            part.tmp2 = part.life;
          }
        }

        if (ver < 81) {
          if (part.type === PT_BOMB && part.tmp !== 0) {
            part.type = PT_EMBR;
            part.ctype = 0;
            if (part.tmp === 1)
              part.tmp = 0;
          }
          if (part.type === PT_DUST && part.life > 0) {
            part.type = PT_EMBR;
            part.ctype = (part.tmp2 << 16) | (part.tmp << 8) | part.ctype;
            part.tmp = 1;
          }
          if (part.type === PT_FIRW && part.tmp >= 2) {
            part.type = PT_EMBR;
            part.ctype = firwTableAt(part.tmp - 4);
            part.tmp = 1;
          }
        }
        if (ver < 89) {
          if (part.type === PT_FILT) {
            if (part.tmp < 0 || part.tmp > 3)
              part.tmp = 6;
            part.ctype = 0;
          } else if (part.type === PT_QRTZ || part.type === PT_PQRT) {
            part.tmp2 = part.tmp;
            part.tmp = part.ctype;
            part.ctype = 0;
          }
        }
        if (ver < 91) {
          if (part.type === PT_VINE)
            part.tmp = 1;
          else if (part.type === PT_CONV) {
            if (part.tmp) {
              part.ctype |= part.tmp << 8;
              part.tmp = 0;
            }
          }
        }
        if (ver < 93) {
          if (part.type === PT_PIPE || part.type === PT_PPIP) {
            if (part.ctype === 1)
              part.tmp |= 0x00020000; // PFLAG_INITIALIZING
            part.tmp |= (part.ctype - 1) << 18;
            part.ctype = part.tmp & 0xFF;
            part.tmp &= ~0xFF;
          } else if (part.type === PT_HSWC || part.type === PT_PUMP) {
            part.tmp = 0;
          }
        }
      }
    }

    if (p === dataLength) // no sign data, "version 1" PSv
      return;

    const signCount = data[p++];
    for (let i = 0; i < signCount; i++) {
      const tempSign: Sign = { x: 0, y: 0, ju: 0, text: '' };
      if (p + 6 > dataLength)
        throw notEnough();
      {
        let x = data[p++];
        x |= data[p++] << 8;
        tempSign.x = x + partP.X;
      }
      {
        let y = data[p++];
        y |= data[p++] << 8;
        tempSign.y = y + partP.Y;
      }
      {
        const ju = data[p++];
        tempSign.ju = ju;
      }
      let tempSignText = '';
      {
        let l = data[p++];
        if (p + l > dataLength)
          throw notEnough();
        if (l > 254)
          l = 254;
        // ByteString(tempSignText): up to the first NUL
        for (let k = 0; k < l && data[p + k]; k++) tempSignText += String.fromCharCode(data[p + k]);
        p += l;
      }
      tempSign.text = substr(CleanString(fromUtf8(tempSignText), true, true, true), 45);
      if (tempSign.text === '{t}') {
        tempSign.text = 'Temp: {t}';
      } else if (tempSign.text === '{p}') {
        tempSign.text = 'Pressure: {p}';
      }
      tempSigns.push(tempSign);
    }

    for (let i = 0; i < tempSigns.length; i++) {
      if (this.signs.length === MAXSIGNS)
        break;
      this.signs.push(tempSigns[i]);
    }
  }

  private serialiseOPS(): [boolean, Uint8Array] {
    if (this.blockSize.X > 255 || this.blockSize.Y > 255) {
      throw new BuildException('simulation size not supported by the save format');
    }

    // minimum version this save is compatible with
    // when building, this number may be increased depending on what elements are used
    // or what properties are detected
    let minimumVersion: Version2 = V(90, 2);
    const RESTRICTVERSION = (major: number, minor = 0): void => {
      // restrict the minimum version this save can be opened with
      const version = V(major, minor);
      if (vLt(minimumVersion, version)) {
        minimumVersion = version;
      }
    };

    // Get coords in blocks
    const blockP = { X: 0, Y: 0 };

    // Snap full coords to block size
    const partP = { X: blockP.X * CELL, Y: blockP.Y * CELL };

    // Original size + offset of original corner from snapped corner, rounded up by adding CELL-1
    const blockS = this.blockSize;
    const partS = { X: blockS.X * CELL, Y: blockS.Y * CELL };
    const nBlocks = this.blockSize.X * this.blockSize.Y;

    // Copy fan and wall data
    const wallDataBacking = new Uint8Array(nBlocks);
    let hasWallData = false;
    const fanData = new Uint8Array(nBlocks * 2);
    const pressData = new Uint8Array(nBlocks * 2);
    const vxData = new Uint8Array(nBlocks * 2);
    const vyData = new Uint8Array(nBlocks * 2);
    const ambientData = new Uint8Array(nBlocks * 2);

    const blockAirData = new Uint8Array(nBlocks * 2);

    const gravityData = new Uint8Array(nBlocks * 4 * 4);
    const gravityView = new DataView(gravityData.buffer);

    let fanDataLen = 0, pressDataLen = 0, vxDataLen = 0, vyDataLen = 0, ambientDataLen = 0;

    for (const bpos of columnPoints(RectSized(blockP, blockS))) {
      const k = (bpos.Y - blockP.Y) * blockS.X + (bpos.X - blockP.X);
      wallDataBacking[k] = this.blockMap.get(bpos);
      if (this.blockMap.get(bpos))
        hasWallData = true;

      if (this.hasPressure) {
        // save pressure and x/y velocity grids
        const pres = f(Math.max(-255.0, Math.min(255.0, this.pressure.get(bpos))) + 256.0);
        const velX = f(Math.max(-255.0, Math.min(255.0, this.velocityX.get(bpos))) + 256.0);
        const velY = f(Math.max(-255.0, Math.min(255.0, this.velocityY.get(bpos))) + 256.0);
        pressData[pressDataLen++] = itrunc(f(pres * 128)) & 0xFF;
        pressData[pressDataLen++] = itrunc(f(pres * 128)) >> 8;

        vxData[vxDataLen++] = itrunc(f(velX * 128)) & 0xFF;
        vxData[vxDataLen++] = itrunc(f(velX * 128)) >> 8;

        vyData[vyDataLen++] = itrunc(f(velY * 128)) & 0xFF;
        vyData[vyDataLen++] = itrunc(f(velY * 128)) >> 8;

        blockAirData[k] = this.blockAir.get(bpos);
        blockAirData[nBlocks + k] = this.blockAirh.get(bpos);

        gravityView.setFloat32(4 * k, this.gravMass.get(bpos), true);
        gravityView.setUint32(4 * (nBlocks + k), this.gravMask.get(bpos), true);
        gravityView.setFloat32(4 * (2 * nBlocks + k), this.gravForceX.get(bpos), true);
        gravityView.setFloat32(4 * (3 * nBlocks + k), this.gravForceY.get(bpos), true);
      }

      if (this.hasAmbientHeat) {
        const tempTemp = itrunc(f(this.ambientHeat.get(bpos) + 0.5));
        ambientData[ambientDataLen++] = tempTemp;
        ambientData[ambientDataLen++] = tempTemp >> 8;
      }

      if (this.blockMap.get(bpos) === WL_FAN) {
        {
          let i = itrunc(f(f(this.fanVelX.get(bpos) * 64.0) + 127.5));
          if (i < 0) i = 0;
          if (i > 255) i = 255;
          fanData[fanDataLen++] = i;
        }
        {
          let i = itrunc(f(f(this.fanVelY.get(bpos) * 64.0) + 127.5));
          if (i < 0) i = 0;
          if (i > 255) i = 255;
          fanData[fanDataLen++] = i;
        }
      } else if (this.blockMap.get(bpos) === WL_STASIS) {
        RESTRICTVERSION(94, 0);
      }
    }

    // Index positions of all particles, using linked lists
    // partsPosFirstMap is pmap for the first particle in each position
    // partsPosLastMap is pmap for the last particle in each position
    // partsPosCount is the number of particles in each position
    // partsPosLink contains, for each particle, (i<<8)|1 of the next particle in the same position
    const partsPosFirstMap = new Uint32Array(partS.X * partS.Y);
    const partsPosLastMap = new Uint32Array(partS.X * partS.Y);
    const partsPosCount = new Uint32Array(partS.X * partS.Y);
    const partsPosLink = new Uint32Array(NPART);
    let soapCount = 0;
    for (let i = 0; i < this.particlesCount; i++) {
      const pi = this.part(i);
      if (pi.type) {
        const pos = { X: itrunc(f(pi.x + 0.5)), Y: itrunc(f(pi.y + 0.5)) };
        // Coordinates relative to top left corner of saved area
        const k = (pos.Y - partP.Y) * partS.X + (pos.X - partP.X);
        if (!partsPosFirstMap[k]) {
          // First entry in list
          partsPosFirstMap[k] = (i << 8) | 1;
          partsPosLastMap[k] = (i << 8) | 1;
        } else {
          // Add to end of list
          partsPosLink[partsPosLastMap[k] >>> 8] = (i << 8) | 1; // link to current end of list
          partsPosLastMap[k] = (i << 8) | 1; // set as new end of list
        }
        partsPosCount[k]++;
      }
    }

    // Store number of particles in each position
    const partsPosData = new Uint8Array(partS.X * partS.Y * 3);
    let partsPosDataLen = 0;
    for (const pos of rectPoints(originRect(partS))) {
      const posCount = partsPosCount[pos.Y * partS.X + pos.X];
      partsPosData[partsPosDataLen++] = (posCount & 0x00FF0000) >> 16;
      partsPosData[partsPosDataLen++] = (posCount & 0x0000FF00) >> 8;
      partsPosData[partsPosDataLen++] = (posCount & 0x000000FF);
    }

    // Copy parts data
    /* Field descriptor [1+2] format:
     |      15      |      14       |      13       |      12       |      11       |      10       |       9       |       8       |       7       |       6       |       5       |       4       |       3       |       2       |       1       |       0       |
     |  fieldDesc3  |    type[2]    |  tmp3/4[1+2]  |   tmp[3+4]    |   tmp2[2]     |     tmp2      |   ctype[2]    |      vy       |      vx       |  decorations  |   ctype[1]    |    tmp[2]     |    tmp[1]     |    life[2]    |    life[1]    | temp dbl len  |
     life[2] means a second byte (for a 16 bit field) if life[1] is present
     fieldDesc3 means Field descriptor [3] exists
       Field descriptor [3] format:
     |      23      |      22       |      21       |      20       |      19       |      18       |      17       |      16       |
     |   RESERVED   |     FREE      |     FREE      |     FREE      |     FREE      |     FREE      |     FREE      |  tmp3/4[3+4]  |
     last bit is reserved. If necessary, use it to signify that fieldDescriptor will have another byte
     That way, if we ever need a 25th bit, we won't have to change the save format
     */

    const builtinElements = sd.elements;
    // Allocate enough space to store all Particles and 3 bytes on top of that per Particle, for the field descriptors.
    // In practice, a Particle will never need as much space in the save as in memory; this is just an upper bound to simplify allocation.
    // (the port sizes it by the particles it has: at most 33 bytes per particle)
    const partsData = new Uint8Array(Math.max(this.particlesCount, 1) * 40);
    let partsDataLen = 0;
    const partsSaveIndex = new Uint32Array(NPART);
    let partsCount = 0;
    const elements = sd.elements;
    const paletteSet = new Set<number>();
    for (const pos of rectPoints(originRect(partS))) {
      // Find the first particle in this position
      let i = partsPosFirstMap[pos.Y * partS.X + pos.X];

      // Loop while there is a pmap entry
      while (i) {
        let fieldDesc = 0;
        let tempTemp: number, vTemp: number;

        // Turn pmap entry into a particles index
        i = i >>> 8;

        // Store saved particle index+1 for this partsptr index (0 means not saved)
        partsSaveIndex[i] = (partsCount++) + 1;

        const part = this.part(i).clone();
        paletteSet.add(part.type);
        for (const index of possiblyCarriesType) {
          if ((elements[part.type].CarriesTypeIn >>> 0) & ((1 << index) >>> 0)) {
            const name = propName(index);
            if (sd.IsElement(TYP(part[name]))) {
              paletteSet.add(TYP(part[name]));
            } else {
              part[name] = PMAP(ID(part[name]), 0);
            }
          }
        }

        // Type (required)
        partsData[partsDataLen++] = part.type;

        // Location of the field descriptor
        let fieldDesc3Loc = 0;
        const fieldDescLoc = partsDataLen++;
        partsDataLen++;

        const tmp3 = part.tmp3 >>> 0;
        const tmp4 = part.tmp4 >>> 0;
        if ((tmp3 || tmp4) && (!GameSave.PressureInTmp3(part.type) || this.hasPressure)) {
          fieldDesc |= 1 << 13;
          // The tmp3 of PressureInTmp3 elements is okay to truncate because the loading code
          // sign extends it anyway, expecting the value to not be higher in magnitude than
          // 256 (max pressure value) * 64 (tmp3 multiplicative bias).
          if (((tmp3 >>> 16) || (tmp4 >>> 16)) && !GameSave.PressureInTmp3(part.type)) {
            fieldDesc |= 1 << 15;
            fieldDesc |= 1 << 16;
            RESTRICTVERSION(97, 0);
          }
        }

        // Extra type byte if necessary
        if (part.type & 0xFF00) {
          partsData[partsDataLen++] = part.type >> 8;
          fieldDesc |= 1 << 14;
          RESTRICTVERSION(93, 0);
        }

        // Extra Temperature (2nd byte optional, 1st required), 1 to 2 bytes
        // Store temperature as an offset of 21C(294.15K) or go into a 16byte int and store the whole thing
        if (Math.abs(f(part.temp - f(294.15))) < 127) {
          tempTemp = itrunc(Math.floor(f(f(part.temp - f(294.15)) + 0.5)));
          partsData[partsDataLen++] = tempTemp;
        } else {
          fieldDesc |= 1;
          tempTemp = itrunc(f(part.temp + 0.5));
          partsData[partsDataLen++] = tempTemp;
          partsData[partsDataLen++] = tempTemp >> 8;
        }

        if (fieldDesc & (1 << 15)) {
          fieldDesc3Loc = partsDataLen++;
        }

        // Life (optional), 1 to 2 bytes
        if (part.life) {
          let life = part.life;
          if (life > 0xFFFF)
            life = 0xFFFF;
          else if (life < 0)
            life = 0;
          fieldDesc |= 1 << 1;
          partsData[partsDataLen++] = life;
          if (life & 0xFF00) {
            fieldDesc |= 1 << 2;
            partsData[partsDataLen++] = life >> 8;
          }
        }

        // Tmp (optional), 1, 2, or 4 bytes
        if (part.tmp) {
          fieldDesc |= 1 << 3;
          partsData[partsDataLen++] = part.tmp;
          if (part.tmp & 0xFFFFFF00) {
            fieldDesc |= 1 << 4;
            partsData[partsDataLen++] = part.tmp >> 8;
            if (part.tmp & 0xFFFF0000) {
              fieldDesc |= 1 << 12;
              partsData[partsDataLen++] = (part.tmp & 0xFF000000) >>> 24;
              partsData[partsDataLen++] = (part.tmp & 0x00FF0000) >> 16;
            }
          }
        }

        // Ctype (optional), 1 or 4 bytes
        if (part.ctype) {
          fieldDesc |= 1 << 5;
          partsData[partsDataLen++] = part.ctype;
          if (part.ctype & 0xFFFFFF00) {
            fieldDesc |= 1 << 9;
            partsData[partsDataLen++] = (part.ctype & 0xFF000000) >>> 24;
            partsData[partsDataLen++] = (part.ctype & 0x00FF0000) >> 16;
            partsData[partsDataLen++] = (part.ctype & 0x0000FF00) >> 8;
          }
        }

        // Dcolour (optional), 4 bytes
        if (part.dcolour && ((part.dcolour & 0xFF000000) || part.type === PT_LIFE)) {
          fieldDesc |= 1 << 6;
          partsData[partsDataLen++] = (part.dcolour & 0xFF000000) >>> 24;
          partsData[partsDataLen++] = (part.dcolour & 0x00FF0000) >> 16;
          partsData[partsDataLen++] = (part.dcolour & 0x0000FF00) >> 8;
          partsData[partsDataLen++] = (part.dcolour & 0x000000FF);
        }

        // VX (optional), 1 byte
        if (Math.abs(part.vx) > f(0.001)) {
          fieldDesc |= 1 << 7;
          vTemp = itrunc(f(f(part.vx * 16.0) + 127.5));
          if (vTemp < 0) vTemp = 0;
          if (vTemp > 255) vTemp = 255;
          partsData[partsDataLen++] = vTemp;
        }

        // VY (optional), 1 byte
        if (Math.abs(part.vy) > f(0.001)) {
          fieldDesc |= 1 << 8;
          vTemp = itrunc(f(f(part.vy * 16.0) + 127.5));
          if (vTemp < 0) vTemp = 0;
          if (vTemp > 255) vTemp = 255;
          partsData[partsDataLen++] = vTemp;
        }

        // Tmp2 (optional), 1 or 2 bytes
        if (part.tmp2) {
          fieldDesc |= 1 << 10;
          partsData[partsDataLen++] = part.tmp2;
          if (part.tmp2 & 0xFF00) {
            fieldDesc |= 1 << 11;
            partsData[partsDataLen++] = part.tmp2 >> 8;
          }
        }

        // tmp3 and tmp4, 4 bytes
        if (fieldDesc & (1 << 13)) {
          partsData[partsDataLen++] = tmp3;
          partsData[partsDataLen++] = tmp3 >>> 8;
          partsData[partsDataLen++] = tmp4;
          partsData[partsDataLen++] = tmp4 >>> 8;
          if (fieldDesc & (1 << 16)) {
            partsData[partsDataLen++] = tmp3 >>> 16;
            partsData[partsDataLen++] = tmp3 >>> 24;
            partsData[partsDataLen++] = tmp4 >>> 16;
            partsData[partsDataLen++] = tmp4 >>> 24;
          }
        }

        // Write the field descriptor
        partsData[fieldDescLoc] = fieldDesc;
        partsData[fieldDescLoc + 1] = fieldDesc >> 8;
        if (fieldDesc & (1 << 15)) {
          partsData[fieldDesc3Loc] = fieldDesc >> 16;
        }

        if (part.type === PT_SOAP)
          soapCount++;

        if (part.type === PT_RPEL && part.ctype) {
          RESTRICTVERSION(91, 4);
        } else if (part.type === PT_NWHL && part.tmp) {
          RESTRICTVERSION(91, 5);
        }
        if (part.type === PT_HEAC || part.type === PT_SAWD || part.type === PT_POLO
          || part.type === PT_RFRG || part.type === PT_RFGL || part.type === PT_LSNS) {
          RESTRICTVERSION(92, 0);
        } else if ((part.type === PT_FRAY || part.type === PT_INVIS) && part.tmp) {
          RESTRICTVERSION(92, 0);
        } else if (part.type === PT_PIPE || part.type === PT_PPIP) {
          RESTRICTVERSION(93, 0);
        }
        if (part.type === PT_TSNS || part.type === PT_PSNS
          || part.type === PT_HSWC || part.type === PT_PUMP) {
          if (part.tmp === 1) {
            RESTRICTVERSION(93, 0);
          }
        }
        if (PMAPBITS > 8) {
          for (const index of possiblyCarriesType) {
            if ((builtinElements[part.type].CarriesTypeIn >>> 0) & ((1 << index) >>> 0)) {
              if (TYP(part[propName(index)]) > 0xFF) {
                RESTRICTVERSION(93, 0);
              }
            }
          }
        }
        if (part.type === PT_LDTC) {
          RESTRICTVERSION(94, 0);
        }
        if (part.type === PT_TSNS || part.type === PT_PSNS) {
          if (part.tmp === 2) {
            RESTRICTVERSION(94, 0);
          }
        }
        if (part.type === PT_LSNS) {
          if (part.tmp >= 1 && part.tmp <= 3) {
            RESTRICTVERSION(95, 0);
          }
        }
        if (part.type === PT_LIFE) {
          RESTRICTVERSION(96, 0);
        }
        if (part.type === PT_GLAS && part.life > 0) {
          RESTRICTVERSION(97, 0);
        }
        if (GameSave.PressureInTmp3(part.type)) {
          RESTRICTVERSION(97, 0);
        }
        if (part.type === PT_CONV && part.tmp2 !== 0) {
          RESTRICTVERSION(97, 0);
        }
        if (part.type === PT_RSST || part.type === PT_RSSS) {
          RESTRICTVERSION(98, 0);
        }
        if (part.type === PT_ETRD && (part.tmp || part.tmp2)) {
          RESTRICTVERSION(98, 0);
        }
        if (part.type === PT_BASE || part.type === PT_SEED) {
          RESTRICTVERSION(100, 0);
        }
        if ((part.type === PT_PIPE || part.type === PT_PPIP) && (part.tmp & PFLAG_CAN_CONDUCT)) {
          RESTRICTVERSION(100, 0);
        }

        // Get the pmap entry for the next particle in the same position
        i = partsPosLink[i];
      }
    }

    const paletteData: PaletteItem[] = [];
    for (const ID of [...paletteSet].sort((a, c) => a - c)) {
      paletteData.push([elements[ID].Identifier, ID]);
    }

    let soapLinkDataLen = 0;
    const soapLinkData = new Uint8Array(3 * soapCount);
    if (soapCount) {
      // Iterate through particles in the same order that they were saved
      for (const pos of rectPoints(originRect(partS))) {
        // Find the first particle in this position
        let i = partsPosFirstMap[pos.Y * partS.X + pos.X];

        // Loop while there is a pmap entry
        while (i) {
          // Turn pmap entry into a partsptr index
          i = i >>> 8;

          const pi = this.part(i);
          if (pi.type === PT_SOAP) {
            // Only save forward link for each particle, back links can be deduced from other forward links
            // linkedIndex is index within saved particles + 1, 0 means not saved or no link

            let linkedIndex = 0;
            if ((pi.ctype & 2) && pi.tmp >= 0 && pi.tmp < NPART) {
              linkedIndex = partsSaveIndex[pi.tmp];
            }
            soapLinkData[soapLinkDataLen++] = (linkedIndex & 0xFF0000) >> 16;
            soapLinkData[soapLinkDataLen++] = (linkedIndex & 0x00FF00) >> 8;
            soapLinkData[soapLinkDataLen++] = (linkedIndex & 0x0000FF);
          }

          // Get the pmap entry for the next particle in the same position
          i = partsPosLink[i];
        }
      }
    }

    for (let i = 0; i < this.signs.length; i++) {
      if (this.signs[i].text.length && rectContains(originRect(partS), this.signs[i].x, this.signs[i].y)) {
        if (signNeedsV95(this.signs[i].text)) {
          RESTRICTVERSION(95, 0);
        }
      }
    }

    const b = new Bson(objectValue);

    const originNode = b.set('origin', new Bson(objectValue));
    originNode.set('majorVersion', Bson.int32(effectiveVersion[0]));
    originNode.set('minorVersion', Bson.int32(effectiveVersion[1]));
    originNode.set('buildNum', Bson.int32(APP_VERSION_BUILD));
    originNode.set('modId', Bson.int32(MOD_ID));
    originNode.set('releaseType', Bson.string(IDENT_RELTYPE));
    originNode.set('platform', Bson.string(IDENT_PLATFORM));
    originNode.set('ident', Bson.string(IDENT));

    if (this.gravityMode === GRAV_CUSTOM) {
      b.set('customGravityX', Bson.double(this.customGravityX));
      b.set('customGravityY', Bson.double(this.customGravityY));
      RESTRICTVERSION(97, 0);
    }

    // the node's values are the minimum version at this point: the RESTRICTVERSIONs below (ambientAirTemp, edge
    // pressure/velocity, vorticity, ensureDeterminism) do not reach the saved minimumVersion, as in the original
    const minimumVersionNode = b.set('minimumVersion', new Bson(objectValue));
    minimumVersionNode.set('major', Bson.int32(minimumVersion[0]));
    minimumVersionNode.set('minor', Bson.int32(minimumVersion[1]));

    b.set('waterEEnabled', Bson.bool(this.waterEEnabled));
    b.set('legacyEnable', Bson.bool(this.legacyEnable));
    b.set('gravityEnable', Bson.bool(this.gravityEnable));
    b.set('aheat_enable', Bson.bool(this.aheatEnable));
    b.set('paused', Bson.bool(this.paused));
    b.set('gravityMode', Bson.int32(this.gravityMode));
    b.set('airMode', Bson.int32(this.airMode));
    if (Math.abs(f(this.ambientAirTemp - f(R_TEMP + f(273.15)))) > f(0.0001)) {
      b.set('ambientAirTemp', Bson.double(this.ambientAirTemp));
      RESTRICTVERSION(96, 0);
    }
    if (Math.abs(this.edgePressure) > f(0.0001)) {
      b.set('edgePressure', Bson.double(this.edgePressure));
      RESTRICTVERSION(100, 0);
    }
    if (Math.abs(this.edgeVelocityX) > f(0.0001)) {
      b.set('edgeVelocityX', Bson.double(this.edgeVelocityX));
      RESTRICTVERSION(100, 0);
    }
    if (Math.abs(this.edgeVelocityY) > f(0.0001)) {
      b.set('edgeVelocityY', Bson.double(this.edgeVelocityY));
      RESTRICTVERSION(100, 0);
    }
    if (this.vorticityCoeff > f(0.0001) && this.vorticityCoeff < 1.0) {
      b.set('vorticityCoeff', Bson.double(this.vorticityCoeff));
      RESTRICTVERSION(100, 0);
    }
    b.set('convectionMode', Bson.int32(this.convectionMode));
    b.set('edgeMode', Bson.int32(this.edgeMode));

    if (this.stkm.hasData()) {
      const stkmNode = b.set('stkm', new Bson(objectValue));
      if (this.stkm.rocketBoots1) {
        stkmNode.set('rocketBoots1', Bson.bool(this.stkm.rocketBoots1));
      }
      if (this.stkm.rocketBoots2) {
        stkmNode.set('rocketBoots2', Bson.bool(this.stkm.rocketBoots2));
      }
      if (this.stkm.fan1) {
        stkmNode.set('fan1', Bson.bool(this.stkm.fan1));
      }
      if (this.stkm.fan2) {
        stkmNode.set('fan2', Bson.bool(this.stkm.fan2));
      }
      if (this.stkm.rocketBootsFigh.length) {
        const rocketBootsFighNode = stkmNode.set('rocketBootsFigh', new Bson(arrayValue));
        for (const fighNum of this.stkm.rocketBootsFigh) {
          rocketBootsFighNode.Append(Bson.int32(fighNum));
        }
      }
      if (this.stkm.fanFigh.length) {
        const fanFighNode = stkmNode.set('fanFigh', new Bson(arrayValue));
        for (const fighNum of this.stkm.fanFigh) {
          fanFighNode.Append(Bson.int32(fighNum));
        }
      }
    }

    b.set('pmapbits', Bson.int32(this.pmapbits));
    if (partsDataLen) {
      b.set('parts', Bson.user(partsData.slice(0, partsDataLen)));
      if (paletteData.length) {
        const paletteNode = new Bson(objectValue);
        for (const item of paletteData) {
          paletteNode.set(item[0], Bson.int32(item[1]));
        }
        b.set('palette', paletteNode);
      }
      if (partsPosDataLen) {
        b.set('partsPos', Bson.user(partsPosData));
      }
    }
    if (hasWallData) {
      b.set('wallMap', Bson.user(wallDataBacking));
    }
    if (fanDataLen) {
      b.set('fanMap', Bson.user(fanData));
    }
    if (this.hasPressure && pressDataLen) {
      b.set('pressMap', Bson.user(pressData));
    }
    if (this.hasPressure && vxDataLen) {
      b.set('vxMap', Bson.user(vxData));
    }
    if (this.hasPressure && vyDataLen) {
      b.set('vyMap', Bson.user(vyData));
    }
    if (this.hasAmbientHeat && this.aheatEnable && ambientDataLen) {
      b.set('ambientMap', Bson.user(ambientData));
    }
    if (soapLinkDataLen) {
      b.set('soapLinks', Bson.user(soapLinkData));
    }
    if (this.hasBlockAirMaps) {
      b.set('blockAir', Bson.user(blockAirData));
    }
    if (this.ensureDeterminism) {
      b.set('ensureDeterminism', Bson.bool(this.ensureDeterminism));
      b.set('frameCount', Bson.int64(BigInt(this.frameCount)));
      const rng = new Uint8Array(16);
      const rv = new DataView(rng.buffer);
      // std::array<uint64_t, 2> in memory: s[0] low, s[0] high, s[1] low, s[1] high
      rv.setUint32(0, this.rngState[1], true);
      rv.setUint32(4, this.rngState[0], true);
      rv.setUint32(8, this.rngState[3], true);
      rv.setUint32(12, this.rngState[2], true);
      b.set('rngState', Bson.user(rng));
      RESTRICTVERSION(98, 0);
    }
    if (this.gravityEnable) {
      b.set('gravity', Bson.user(gravityData));
    }
    let signsCount = 0;
    for (let i = 0; i < this.signs.length; i++) {
      if (this.signs[i].text.length && rectContains(originRect(partS), this.signs[i].x, this.signs[i].y)) {
        signsCount++;
      }
    }
    if (signsCount) {
      const signsNode = b.set('signs', new Bson(arrayValue));
      for (let i = 0; i < this.signs.length; i++) {
        if (this.signs[i].text.length && rectContains(originRect(partS), this.signs[i].x, this.signs[i].y)) {
          const signNode = signsNode.Append(new Bson(objectValue));
          signNode.set('text', Bson.string(toUtf8(this.signs[i].text)));
          signNode.set('justification', Bson.int32(this.signs[i].ju));
          signNode.set('x', Bson.int32(this.signs[i].x));
          signNode.set('y', Bson.int32(this.signs[i].y));
        }
      }
    }
    if (jsonMemberNames(this.authors).length || (Array.isArray(this.authors) && this.authors.length)) {
      const authorsNode = b.set('authors', new Bson(objectValue));
      ConvertJsonToBson(authorsNode, this.authors);
    }

    let finalData: Uint8Array;
    try {
      finalData = b.Dump(opsNonconformance);
    } catch (ex) {
      if (ex instanceof DumpError) {
        throw new BuildException(`BSON error when dumping save: ${ex.message}`);
      }
      throw ex;
    }

    const { status, data: compressed } = BZ2WCompress(finalData);
    switch (status) {
    case BZ2WCompressOk: break;
    case BZ2WCompressNomem: throw new BuildException('Save error, out of memory');
    default: throw new BuildException(`Cannot compress: status ${status}`);
    }

    const outputData = new Uint8Array(compressed.length + 12);
    const header = outputData;
    header[0] = 0x4F; // 'O'
    header[1] = 0x50; // 'P'
    header[2] = 0x53; // 'S'
    header[3] = 0x31; // '1'
    header[4] = effectiveVersion[0];
    header[5] = CELL;
    header[6] = blockS.X;
    header[7] = blockS.Y;
    const finalDataLen = finalData.length >>> 0;
    header[8] = finalDataLen;
    header[9] = finalDataLen >>> 8;
    header[10] = finalDataLen >>> 16;
    header[11] = finalDataLen >>> 24;
    outputData.set(compressed, 12);

    // Mark save as incompatible with latest release
    const fakeFromNewerVersion = ALLOW_FAKE_NEWER_VERSION && vLt(currentVersion, minimumVersion);
    return [fakeFromNewerVersion, outputData];
  }

  static PressureInTmp3(type: number): boolean {
    return type === PT_QRTZ || type === PT_GLAS || type === PT_TUNG;
  }

  /** operator << (Particle &v) */
  addParticle(v: Particle): this {
    if (this.particlesCount < NPART && v.type) {
      this.part(this.particlesCount++).copyFrom(v);
    }
    return this;
  }

  /** operator << (sign &v) */
  addSign(v: Sign): this {
    if (this.signs.length < MAXSIGNS && v.text.length)
      this.signs.push({ x: v.x, y: v.y, ju: v.ju, text: v.text });
    return this;
  }
}
