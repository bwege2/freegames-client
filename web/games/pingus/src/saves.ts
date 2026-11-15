// What Pingus keeps in ~/.pingus/savegames/: savegames.scm (SavegameManager: per level accessible or
// finished, with time and saved pingus) and variables.scm (StatManager: "tutorial-startstory-seen",
// "credits-seen", "<worldmap>-current-node"), written in the original's format by SExprFileWriter. The
// browser keeps them in the player's server storage (index.ts); here they are text in, text out.
import { SExprReader } from './sexpr.ts';

export type SaveStatus = 'none' | 'accessible' | 'finished';
export interface Savegame { filename: string; status: SaveStatus; time: number; saved: number }

/** SExprFileWriter::write_string's escaping */
const str = (s: string) => s.replace(/\\/g, '\\\\').replace(/"/g, '\\"');

export class SavegameManager {
  static instance: SavegameManager;
  private games: Savegame[] = [];
  private write: (text: string) => void;
  constructor(text: string | null, write: (text: string) => void) {
    SavegameManager.instance = this;
    this.write = write;
    if (!text) return;
    try {
      const r = SExprReader.parse(text);
      if (r.getName() !== 'pingus-savegame') return;
      for (const s of r.getSections()) {
        const st = (s.readString('status') ?? 'none').toLowerCase();
        const g: Savegame = {
          filename: s.readString('filename') ?? '', status: st === 'accessible' || st === 'finished' ? st : 'none',
          time: s.readInt('time') ?? 0, saved: s.readInt('saved-pingus') ?? 0,
        };
        const i = this.games.findIndex((x) => x.filename === g.filename);
        if (i >= 0) this.games[i] = g; else this.games.push(g);
      }
    } catch {
      // a broken file: start without savegames
    }
  }
  get(filename: string): Savegame | null { return this.games.find((g) => g.filename === filename) ?? null; }
  store(g: Savegame) {
    const i = this.games.findIndex((x) => x.filename === g.filename);
    if (i < 0) this.games.push({ ...g });
    else if (!(this.games[i].status === 'finished' && g.status === 'accessible')) this.games[i] = { ...g };
    this.flush();
  }
  flush() {
    let out = '(pingus-savegame ';
    for (const g of this.games) {
      out += `\n  (level \n    (filename "${str(g.filename)}")\n    (status "${g.status}")\n    (time ${g.time})\n    (saved-pingus ${g.saved}))`;
    }
    out += ')';
    this.write(out);
  }
}

export class StatManager {
  static instance: StatManager;
  private stats = new Map<string, string>();
  private write: (text: string) => void;
  constructor(text: string | null, write: (text: string) => void) {
    StatManager.instance = this;
    this.write = write;
    if (!text) return;
    try {
      const r = SExprReader.parse(text);
      if (r.getName() !== 'pingus-stats') return;
      for (const n of r.getSectionNames()) this.stats.set(n, r.readString(n) ?? '');
    } catch {
      // as the original: a broken file is reported and ignored
    }
  }
  getString(name: string): string | undefined { return this.stats.get(name); }
  /** StringUtil::from_string<bool>: an istream reading "1" or "0" */
  getBool(name: string): boolean | undefined {
    const s = this.stats.get(name);
    if (s === undefined) return undefined;
    const m = /^\s*([01])/.exec(s);
    return m ? m[1] === '1' : undefined;
  }
  setString(name: string, value: string) { this.stats.set(name, value); this.flush(); }
  setBool(name: string, value: boolean) { this.setString(name, value ? '1' : '0'); }
  flush() {
    let out = '(pingus-stats ';
    for (const k of [...this.stats.keys()].sort()) {
      const v = this.stats.get(k)!;
      if (v) out += `\n  (${k} "${str(v)}")`;
    }
    out += ')';
    this.write(out);
  }
}
