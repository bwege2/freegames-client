// The original's saved games: one `<player>.sav` file (player "noname"), magic "fish", then 512-byte
// records (`src/save.c`): progress (last completed cup per event and difficulty) and race results
// (time, herring, score per event/cup/race/difficulty). In the port the file is in the player's
// account storage, in the original's binary layout.
const MAGIC = 'fish';
const RECORD = 512;

export interface RaceRecord {
  event: string; cup: string; race: string; difficulty: number;
  time: number; herring: number; score: number;
}

function writeStr(view: DataView, offset: number, s: string): void {
  const bytes = new TextEncoder().encode(s);
  for (let i = 0; i < 40; i++) view.setUint8(offset + i, i < bytes.length ? bytes[i] : 0);
}
function readStr(view: DataView, offset: number): string {
  let s = '';
  for (let i = 0; i < 40; i++) {
    const c = view.getUint8(offset + i);
    if (c === 0) break;
    s += String.fromCharCode(c);
  }
  return s;
}

export class SaveGame {
  /** event + '\0' + difficulty → cup */
  private readonly progress = new Map<string, string>();
  /** event + '\0' + cup + '\0' + race + '\0' + difficulty → record */
  private readonly results = new Map<string, RaceRecord>();

  static parse(bytes: Uint8Array | null): SaveGame {
    const save = new SaveGame();
    if (!bytes || bytes.byteLength < 4) return save;
    const view = new DataView(bytes.buffer, bytes.byteOffset, bytes.byteLength);
    if (String.fromCharCode(view.getUint8(0), view.getUint8(1), view.getUint8(2), view.getUint8(3)) !== MAGIC) return save;
    for (let off = 4; off + RECORD <= bytes.byteLength; off += RECORD) {
      const type = view.getInt32(off, true);
      if (type === 0) {
        const event = readStr(view, off + 8);
        const cup = readStr(view, off + 48);
        const difficulty = view.getInt32(off + 88, true);
        if (event && cup) save.progress.set(`${event}\0${difficulty}`, cup);
      } else if (type === 1) {
        const event = readStr(view, off + 8);
        const cup = readStr(view, off + 48);
        const race = readStr(view, off + 88);
        const difficulty = view.getInt32(off + 128, true);
        const time = view.getFloat64(off + 136, true);
        const herring = view.getInt32(off + 144, true);
        const score = view.getInt32(off + 148, true);
        if (event && cup && race) save.results.set(`${event}\0${cup}\0${race}\0${difficulty}`,
          { event, cup, race, difficulty, time, herring, score });
      }
    }
    return save;
  }

  toBytes(): Uint8Array {
    const records = this.progress.size + this.results.size;
    const bytes = new Uint8Array(4 + records * RECORD);
    const view = new DataView(bytes.buffer);
    for (let i = 0; i < 4; i++) view.setUint8(i, MAGIC.charCodeAt(i));
    let off = 4;
    for (const [key, cup] of this.progress) {
      const [event, difficulty] = key.split('\0');
      view.setInt32(off, 0, true);
      writeStr(view, off + 8, event);
      writeStr(view, off + 48, cup);
      view.setInt32(off + 88, Number(difficulty), true);
      off += RECORD;
    }
    for (const r of this.results.values()) {
      view.setInt32(off, 1, true);
      writeStr(view, off + 8, r.event);
      writeStr(view, off + 48, r.cup);
      writeStr(view, off + 88, r.race);
      view.setInt32(off + 128, r.difficulty, true);
      view.setFloat64(off + 136, r.time, true);
      view.setInt32(off + 144, r.herring, true);
      view.setInt32(off + 148, r.score, true);
      off += RECORD;
    }
    return bytes;
  }

  lastCompletedCup(event: string, difficulty: number): string | null {
    return this.progress.get(`${event}\0${difficulty}`) ?? null;
  }

  setLastCompletedCup(event: string, difficulty: number, cup: string): void {
    this.progress.set(`${event}\0${difficulty}`, cup);
  }

  result(event: string, cup: string, race: string, difficulty: number): RaceRecord | null {
    return this.results.get(`${event}\0${cup}\0${race}\0${difficulty}`) ?? null;
  }

  setResult(r: RaceRecord): void {
    this.results.set(`${r.event}\0${r.cup}\0${r.race}\0${r.difficulty}`, r);
  }

  /** src/course_mgr.c is_cup_complete: the saved cup and all before it are complete. */
  isCupComplete(event: string, cupName: string, cupOrder: string[], difficulty: number): boolean {
    const saved = this.lastCompletedCup(event, difficulty);
    if (!saved) return false;
    const savedIdx = cupOrder.indexOf(saved);
    const idx = cupOrder.indexOf(cupName);
    return savedIdx >= 0 && idx >= 0 && idx <= savedIdx;
  }

  /** src/course_mgr.c is_cup_first_incomplete_cup: the cup after the saved one, or the first. */
  isFirstIncompleteCup(event: string, cupName: string, cupOrder: string[], difficulty: number): boolean {
    const saved = this.lastCompletedCup(event, difficulty);
    const idx = cupOrder.indexOf(cupName);
    if (idx < 0) return false;
    if (!saved) return idx === 0;
    return idx === cupOrder.indexOf(saved) + 1;
  }
}
