// What the browser gives NetHack besides its screen (index.ts): the player's files in account storage
// (the save file and bones), the keys as a terminal sends them, and the terminal's output drawn on the
// SDK's TextScreen. Kept apart from index.ts so that node tests can use it (test/host.test.ts).
import { packGame, unpackGame, type GameContext, type KeyInput, type ScoreEntry } from '../../../src/sdk/index.ts';
import { Score } from './proto/nethack.ts';
import { A_BOLD, A_REVERSE, A_UNDERLINE, VT } from './vt.ts';

/** What the files use of the game's context. */
export type HostContext = Pick<GameContext, 'storage' | 'signal'>;

/** what the server stores: [A-Za-z0-9._-]{1,64} */
export const storageName = (n: string): boolean => /^[A-Za-z0-9._-]{1,64}$/.test(n) && n !== '.' && n !== '..';

/**
 * The game's files that outlive a game: its save files (save/<uid><name>, kept as save.<uid><name>)
 * and bones files (bon*: per player here, see README.md). Everything else (level files, locks, the
 * logs) lives only while the game runs.
 */
export function persistentName(path: string): string | null {
  let n: string | null = null;
  if (path.startsWith('save/')) n = 'save.' + path.slice(5);
  else if (/^bon[A-Z]/.test(path) && !path.endsWith('.lock')) n = path;
  return n && storageName(n) ? n : null;
}

/** the game's path of a stored file */
export function gamePath(stored: string): string {
  return stored.startsWith('save.') ? 'save/' + stored.slice(5) : stored;
}

/** The player's files in account storage: loaded at the start, every change written back. */
export class StorageFiles {
  private readonly ctx: HostContext;
  private readonly pending = new Map<string, Uint8Array | null>();
  private flushing: Promise<void> | null = null;
  onError: (msg: string) => void = () => {};

  constructor(ctx: HostContext) {
    this.ctx = ctx;
  }

  /** the stored files, by the game's paths */
  async load(): Promise<Map<string, Uint8Array>> {
    const out = new Map<string, Uint8Array>();
    for (const f of await this.ctx.storage.list('')) {
      const data = await this.ctx.storage.get(f.name);
      if (data) out.set(gamePath(f.name), data);
    }
    return out;
  }

  /** a file of the game changed (null: removed) */
  changed(path: string, data: Uint8Array | null): void {
    const n = persistentName(path);
    if (!n) return;
    this.pending.set(n, data ? data.slice() : null);
    if (!this.flushing) this.flushing = new Promise((r) => setTimeout(r, 0)).then(() => this.flush());
  }

  private async flush(): Promise<void> {
    try {
      while (this.pending.size) {
        const [n, data] = this.pending.entries().next().value!;
        this.pending.delete(n);
        if (data) await this.ctx.storage.put(n, data);
        else await this.ctx.storage.delete(n);
      }
    } catch (e) {
      if (!this.ctx.signal.aborted) this.onError(`The server did not keep the file: ${e instanceof Error ? e.message : String(e)}`);
    } finally {
      this.flushing = null;
    }
  }

  /** resolves when every change has reached the server (or failed) */
  async settled(): Promise<void> {
    while (this.flushing) await this.flushing;
  }
}

/**
 * The bytes a terminal in NetHack's mode sends for a key: Enter is a newline (the tty driver's ICRNL),
 * the arrow and paging keys are the movement keys (hjklyubn; with Shift the running HJKLYUBN; the
 * digits with number_pad), Alt+key the key with the 8th bit (NetHack's meta commands).
 */
export function keyBytes(k: KeyInput, numberPad: boolean): number[] {
  const DIRS: Record<string, [string, string]> = {
    ArrowUp: ['k', '8'], ArrowDown: ['j', '2'], ArrowLeft: ['h', '4'], ArrowRight: ['l', '6'],
    Home: ['y', '7'], PageUp: ['u', '9'], End: ['b', '1'], PageDown: ['n', '3'],
  };
  const d = DIRS[k.key];
  if (d && !k.ctrl && !k.alt) {
    if (numberPad) return [d[1].charCodeAt(0)];
    return [(k.shift ? d[0].toUpperCase() : d[0]).charCodeAt(0)];
  }
  if (k.key === 'Clear' || (k.key === '5' && k.code === 'Numpad5' && !numberPad)) return ['.'.charCodeAt(0)];
  let seq = k.seq;
  if (seq === '\r') seq = '\n';
  if (k.alt && seq.length === 2 && seq[0] === '\x1b') return [(seq.charCodeAt(1) | 0x80) & 255];
  const out: number[] = [];
  for (const ch of seq) {
    const c = ch.charCodeAt(0);
    if (c < 256) out.push(c);
  }
  return out;
}

/** TextScreen's attribute bits */
export interface ScreenLike {
  writeAt(row: number, col: number, s: string): void;
  moveTo(row: number, col: number): void;
  attr: number;
}

/** Draws the terminal's cells on a TextScreen grid: only the rows that changed. */
export class Painter {
  private shown: string[] = [];
  private readonly bits: { bold: number; reverse: number; underline: number };

  constructor(bits: { bold: number; reverse: number; underline: number }) {
    this.bits = bits;
  }

  paint(vt: VT, g: ScreenLike): void {
    for (let y = 0; y < vt.rows; y++) {
      const chars = vt.chars[y], attrs = vt.attrs[y];
      const key = chars.join('') + attrs.join(',');
      if (this.shown[y] === key) continue;
      this.shown[y] = key;
      let x = 0;
      while (x < vt.cols) {
        const a = attrs[x];
        let e = x + 1;
        while (e < vt.cols && attrs[e] === a) e++;
        g.attr = (a & A_BOLD ? this.bits.bold : 0) | (a & A_REVERSE ? this.bits.reverse : 0) | (a & A_UNDERLINE ? this.bits.underline : 0);
        g.writeAt(y, x, chars.slice(x, e).join(''));
        x = e;
      }
    }
    g.attr = 0;
    g.moveTo(Math.min(vt.y, vt.rows - 1), Math.min(vt.x, vt.cols - 1));
  }
}

// ---- the record: the server's score table "record" (protocol/games/nethack.capnp) ----

/** one entry of the record (topten.c, struct toptenentry) */
export interface RecordEntry {
  verMajor: number; verMinor: number; patchlevel: number; points: number; deathDnum: number; deathLev: number;
  maxLvl: number; hp: number; maxHp: number; deaths: number; deathDate: number; birthDate: number; uid: number;
  role: string; race: string; gender: string; align: string; name: string; death: string;
}

/** a line of the record file, as writeentry() (topten.c) writes it */
export function recordLine(e: RecordEntry): string {
  return `${e.verMajor}.${e.verMinor}.${e.patchlevel} ${e.points} ${e.deathDnum} ${e.deathLev} ${e.maxLvl} ${e.hp} ${e.maxHp} ` +
    `${e.deaths} ${e.deathDate} ${e.birthDate} ${e.uid} ${e.role} ${e.race} ${e.gender} ${e.align} ` +
    `${/^ *$/.test(e.name) ? '_' : e.name},${e.death}\n`;
}

/** a line of the record or the logfile, as readentry() reads it (3.3 and later), or null */
export function parseRecordLine(line: string): RecordEntry | null {
  const m = /^(\d+)\.(\d+)\.(\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (-?\d+) (\S+) (\S+) (\S+) (\S+) ([^,]*),(.*)$/.exec(line.replace(/\n$/, ''));
  if (!m) return null;
  const n = (i: number) => Number(m[i]);
  return {
    verMajor: n(1), verMinor: n(2), patchlevel: n(3), points: n(4), deathDnum: n(5), deathLev: n(6), maxLvl: n(7),
    hp: n(8), maxHp: n(9), deaths: n(10), deathDate: n(11), birthDate: n(12), uid: n(13),
    role: m[14], race: m[15], gender: m[16], align: m[17], name: m[18], death: m[19],
  };
}

export function packEntry(e: RecordEntry): Uint8Array {
  return packGame(Score, (s) => {
    s.verMajor = e.verMajor;
    s.verMinor = e.verMinor;
    s.patchlevel = e.patchlevel;
    s.points = BigInt(e.points);
    s.deathDnum = e.deathDnum;
    s.deathLev = e.deathLev;
    s.maxLvl = e.maxLvl;
    s.hp = e.hp;
    s.maxHp = e.maxHp;
    s.deaths = e.deaths;
    s.deathDate = e.deathDate;
    s.birthDate = e.birthDate;
    s.uid = e.uid;
    s.role = e.role;
    s.race = e.race;
    s.gender = e.gender;
    s.align = e.align;
    s.name = e.name;
    s.death = e.death;
  });
}

export function unpackEntry(detail: Uint8Array): RecordEntry | null {
  try {
    const s = unpackGame(Score, detail);
    return {
      verMajor: s.verMajor, verMinor: s.verMinor, patchlevel: s.patchlevel, points: Number(s.points), deathDnum: s.deathDnum,
      deathLev: s.deathLev, maxLvl: s.maxLvl, hp: s.hp, maxHp: s.maxHp, deaths: s.deaths, deathDate: s.deathDate,
      birthDate: s.birthDate, uid: s.uid, role: s.role, race: s.race, gender: s.gender, align: s.align, name: s.name, death: s.death,
    };
  } catch {
    return null;
  }
}

/**
 * The record file the game reads: the server's table, best first. The uid of an entry is how topten()
 * tells one player's entries (PERSMAX per role): the player's own entries get the game's uid (1000),
 * every other account one of its own, as on a machine where each player is a user.
 */
export function recordFile(entries: ScoreEntry[], me: number): Uint8Array {
  const uids = new Map<number, number>();
  let others = 0;
  let text = '';
  for (const x of entries) {
    const e = unpackEntry(x.detail);
    if (!e) continue;
    if (!uids.has(x.accountId)) uids.set(x.accountId, x.accountId === me ? 1000 : 1001 + others++);
    text += recordLine({ ...e, uid: uids.get(x.accountId)! });
  }
  return Uint8Array.from(text, (c) => c.charCodeAt(0) & 255);
}

const lastLine = (data: Uint8Array): string => {
  const t = String.fromCharCode(...data).replace(/\n$/, '');
  return t.slice(t.lastIndexOf('\n') + 1);
};

/**
 * The entry of the game that just ended, for the server: topten() appends it to the logfile, and then
 * its xlogfile line, whose flags say whether the game counts (not in wizard or discover mode). Null if
 * the game does not go into the record.
 */
export function finishedEntry(xlog: Uint8Array, log: Uint8Array): RecordEntry | null {
  const x = lastLine(xlog);
  const flags = /(?:^|\t)flags=0x([0-9a-f]+)/.exec(x);
  if (!flags || (parseInt(flags[1], 16) & 3) !== 0) return null;
  const e = parseRecordLine(lastLine(log));
  if (!e || e.points < 1) return null;
  return e;
}
