// Sopwith missions: the `.sop` files are Yocton (src/yocton.c): a tree of
// `name { ... }` objects and `name: "string"` properties, strings joined with
// `&`. This parses the original files unchanged and turns them into the level
// data the simulation and renderer use (src/swgames.c, doc/sopwith-mission.5).
import { ORIGINAL_GROUND, ORIGINAL_OBJECTS, type LevelObject } from './assets/level.ts';
import { makeSprites, type Sprites } from './video.ts';

export interface YProp {
  name: string;
  /** string value, for `name: "..."` */
  value?: string;
  /** child object, for `name { ... }` */
  inner?: YObj;
}
export interface YObj { props: YProp[] }

export class YoctonError extends Error {
  readonly line: number;
  constructor(message: string, line: number) {
    super(`line ${line}: ${message}`);
    this.line = line;
  }
}

class Parser {
  private pos = 0;
  private line = 1;
  private readonly text: string;

  constructor(text: string) { this.text = text; }

  private eof(): boolean { return this.pos >= this.text.length; }

  private peek(): string { return this.text[this.pos] ?? ''; }

  private take(): string {
    const c = this.text[this.pos++] ?? '';
    if (c === '\n') this.line++;
    return c;
  }

  /** Whitespace, `//` comments and a UTF-8 BOM, as skip_past_spaces(). */
  private skip(): void {
    for (;;) {
      const c = this.peek();
      if (c === '/' && this.text[this.pos + 1] === '/') {
        while (!this.eof() && this.take() !== '\n') { /* comment */ }
      } else if (c === '\uFEFF' || c === ' ' || c === '\t' || c === '\r' || c === '\n') {
        this.take();
      } else {
        return;
      }
    }
  }

  private symbol(): string {
    this.skip();
    let s = '';
    while (!this.eof() && /[A-Za-z0-9_+.-]/.test(this.peek())) s += this.take();
    if (!s) throw new YoctonError(`expected a name, found ${JSON.stringify(this.peek())}`, this.line);
    return s;
  }

  private string(): string {
    this.skip();
    if (this.take() !== '"') throw new YoctonError('expected a quoted string', this.line);
    let out = '';
    for (;;) {
      if (this.eof()) throw new YoctonError('unexpected EOF in string', this.line);
      const c = this.take();
      if (c === '"') {
        // A string may continue after `&` (whitespace/comments allowed).
        this.skip();
        if (this.peek() !== '&') return out;
        this.take();
        this.skip();
        if (this.take() !== '"') throw new YoctonError("quoted string should follow '&'", this.line);
        continue;
      }
      if (c === '\\') {
        const e = this.take();
        if (e === 'n') out += '\n';
        else if (e === 't') out += '\t';
        else if (e === '\\') out += '\\';
        else if (e === '"') out += '"';
        else if (e === 'x') {
          const h = this.take() + this.take();
          if (!/^[0-9a-fA-F]{2}$/.test(h)) throw new YoctonError('\\x needs two hex digits', this.line);
          const v = parseInt(h, 16);
          if (v === 0 || v >= 0x20) throw new YoctonError('\\x is only for control characters', this.line);
          out += String.fromCharCode(v);
        } else throw new YoctonError(`unknown escape \\${e}`, this.line);
        continue;
      }
      if (c.charCodeAt(0) < 0x20) throw new YoctonError('control character inside string', this.line);
      out += c;
    }
  }

  private object(top: boolean): YObj {
    const props: YProp[] = [];
    for (;;) {
      this.skip();
      if (this.eof()) {
        if (top) return { props };
        throw new YoctonError('unexpected EOF (missing })', this.line);
      }
      if (this.peek() === '}') {
        if (top) throw new YoctonError("closing brace '}' not expected at top level", this.line);
        this.take();
        return { props };
      }
      const name = this.symbol();
      this.skip();
      if (this.peek() === ':') {
        this.take();
        this.skip();
        props.push({ name, value: this.peek() === '"' ? this.string() : this.symbol() });
      } else if (this.peek() === '{') {
        this.take();
        props.push({ name, inner: this.object(false) });
      } else {
        throw new YoctonError(`':' or '{' expected after '${name}'`, this.line);
      }
    }
  }

  parse(): YObj { return this.object(true); }
}

export function parseYocton(text: string): YObj {
  return new Parser(text).parse();
}

const OBJECT_TYPES = ['GROUND', 'PLANE', 'BOMB', 'SHOT', 'TARGET', 'EXPLOSION', 'SMOKE',
  'FLOCK', 'BIRD', 'OX', 'MISSILE', 'STARBURST', 'BALLOON'];
const TRANSFORMS = ['NONE', 'ROTATE90', 'ROTATE180', 'ROTATE270', 'FLIP', 'FLIP_ROTATE90',
  'MIRROR', 'MIRROR_ROTATE90'];
const FACTIONS = ['NONE', 'PLAYER1', 'PLAYER2', 'PLAYER3', 'PLAYER4', 'PLAYER5', 'PLAYER6',
  'PLAYER7', 'PLAYER8'];

function enumValue(name: string | undefined, names: string[], fallback = 0): number {
  if (name === undefined) return fallback;
  const up = name.toUpperCase();
  const i = names.indexOf(up);
  if (i >= 0) return i;
  if (/^\d+$/.test(up)) return Number(up);
  return fallback;
}

function intValue(name: string | undefined, fallback = 0): number {
  if (name === undefined) return fallback;
  const n = Number(name.trim());
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
}

function child(props: YProp[], name: string): YObj | undefined {
  return props.find((p) => p.name === name && p.inner)?.inner;
}

function propsOf(o: YObj, name: string): YProp[] {
  return o.props.filter((p) => p.name === name);
}

export interface Mission {
  id: string;
  label: string;
  /** ground height by world column (0..199), from the mission or the built-in level */
  ground: Int16Array;
  objects: LevelObject[];
  sprites: Sprites;
  /** title/explosion tune (`sounds.title_tune`), or null for the original */
  tune: string | null;
  /** true when the file has a level section (otherwise the built-in level is kept) */
  hasLevel: boolean;
}

export interface MissionFile { id: string; label: string; file: string }

/** The seven files shipped with SDL Sopwith 2.9.0 (maps/), in menu order. */
export const MISSION_FILES: MissionFile[] = [
  { id: 'original', label: 'original (built-in level)', file: 'original.sop' },
  { id: 'empty', label: 'empty', file: 'empty.sop' },
  { id: 'new_targets', label: 'new targets', file: 'new_targets.sop' },
  { id: 'tank_strike', label: 'tank strike', file: 'tank_strike.sop' },
  { id: 'triplane', label: 'triplane', file: 'triplane.sop' },
  { id: 'doghouse', label: 'doghouse', file: 'doghouse.sop' },
  { id: 'bogey', label: 'colonel bogey', file: 'bogey.sop' },
];

function builtinObjects(): LevelObject[] {
  return ORIGINAL_OBJECTS.map((o) => ({ ...o }));
}

function builtinMission(): Mission {
  return {
    id: 'original', label: 'original (built-in level)',
    ground: Int16Array.from(ORIGINAL_GROUND), objects: builtinObjects(),
    sprites: makeSprites(), tune: null, hasLevel: true,
  };
}

function readGround(level: YObj): Int16Array | null {
  const g = child(level.props, 'ground');
  if (!g) return null;
  const vals: number[] = [];
  for (const p of g.props) {
    if (p.name !== '_' || p.value === undefined) continue;
    for (const m of p.value.matchAll(/-?\d+/g)) vals.push(Number(m[0]));
  }
  if (vals.length === 0) return null;
  const n = Math.min(100_000, Math.max(321, vals.length));
  const out = new Int16Array(n);
  for (let i = 0; i < n; i++) {
    const v = vals[Math.min(i, vals.length - 1)] ?? 64;
    out[i] = Math.max(0, Math.min(199, v));
  }
  return out;
}

function readObjects(level: YObj): LevelObject[] {
  const out: LevelObject[] = [];
  for (const p of propsOf(level, 'object')) {
    if (!p.inner || out.length >= 500) continue;
    const v = Object.fromEntries(p.inner.props.filter((x) => x.value !== undefined).map((x) => [x.name, x.value!]));
    const type = OBJECT_TYPES[enumValue(v.type, OBJECT_TYPES)] ?? 'GROUND';
    const fac = FACTIONS[enumValue(v.faction ?? v.owner, FACTIONS)] ?? 'NONE';
    const tr = TRANSFORMS[enumValue(v.transform, TRANSFORMS)] ?? 'NONE';
    const o: LevelObject = {
      type,
      x: intValue(v.x),
      orient: intValue(v.orient),
      territoryL: intValue(v.territory_l),
      territoryR: intValue(v.territory_r),
      faction: fac === 'NONE' ? 'FACTION_NONE' : `FACTION_${fac}`,
      transform: tr === 'NONE' ? 'TRANSFORM_NONE' : `TRANSFORM_${tr}`,
    };
    // Keep only object kinds the game knows how to create; the C skips the rest.
    if (!['PLANE', 'TARGET', 'OX', 'FLOCK', 'BALLOON'].includes(o.type)) continue;
    out.push(o);
  }
  return out;
}

function readSymbols(root: YObj): Record<string, Record<number, string>> {
  const out: Record<string, Record<number, string>> = {};
  for (const syms of propsOf(root, 'symbols')) {
    if (!syms.inner) continue;
    for (const set of syms.inner.props) {
      if (!set.inner) continue;
      const frames: Record<number, string> = {};
      for (const f of set.inner.props) {
        if (f.value === undefined) continue;
        const n = Number(f.name);
        if (Number.isInteger(n) && n >= 0 && n < 256) frames[n] = f.value;
      }
      out[set.name] = { ...(out[set.name] ?? {}), ...frames };
    }
  }
  return out;
}

function readTune(root: YObj): string | null {
  for (const s of propsOf(root, 'sounds')) {
    if (!s.inner) continue;
    const t = s.inner.props.find((p) => p.name === 'title_tune' && p.value !== undefined);
    if (t?.value) return t.value;
  }
  return null;
}

/**
 * Applies one `.sop` file on top of `base` (the original level and graphics),
 * exactly as LoadCustomLevel does: a file without `level` keeps the previous
 * level, while `symbols` and `sounds` always replace the current ones.
 */
export function missionFromSop(text: string, id: string, label: string, base?: Mission): Mission {
  const root = parseYocton(text);
  const start = base ?? builtinMission();
  let ground = start.ground;
  let objects = start.objects;
  let hasLevel = false;
  const level = child(root.props, 'level');
  if (level) {
    ground = readGround(level) ?? ground;
    objects = readObjects(level);
    hasLevel = true;
  }
  const maxX = ground.length;
  const objects2 = objects.filter((o) => {
    if (o.type === 'PLANE') return o.x >= 0 && o.x <= maxX - 21;
    return o.x >= 0 && o.x < maxX;
  });
  if (!objects2.some((o) => o.type === 'PLANE' && o.faction === 'FACTION_PLAYER1')) {
    throw new Error(`${label}: no PLAYER1 plane`);
  }
  const overrides = readSymbols(root);
  return {
    id, label, ground, objects: objects2,
    sprites: makeSprites(overrides), tune: readTune(root) ?? start.tune, hasLevel,
  };
}

/** All seven missions as parsed from the shipped files, base first. */
export function buildMissions(files: Record<string, string>): Mission[] {
  let base: Mission | undefined;
  const out: Mission[] = [];
  for (const f of MISSION_FILES) {
    const text = files[f.file];
    if (text === undefined) continue;
    if (!base) {
      base = missionFromSop(text, f.id, f.label);
      out.push(base);
    } else {
      const m = missionFromSop(text, f.id, f.label, base);
      out.push(m);
      // original.sop defines the base symbols; a mod file must not leak into
      // the files after it.
    }
  }
  return out;
}

/** Fallback when the asset bundle is unavailable (tests and a failed fetch). */
export function builtinOnly(): Mission[] { return [builtinMission()]; }
