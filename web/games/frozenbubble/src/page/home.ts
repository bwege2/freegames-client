// ~/.frozen-bubble in the player's account storage (server principle 6): rc, highscores,
// highscores-mptrain, highlevelshistory, levels/<levelset>, records/<record>. A path's "/" becomes "."
// in the storage name (levels/mine is levels.mine). The files are read once when the game starts; writes
// go to the server in order, in the background.
import type { Storage } from '../../../../src/sdk/index.ts';
import type { FbHome } from '../fb/game.ts';

const toName = (p: string): string => p.replace(/\//g, '.');
const DIRS = ['levels', 'records'];
const fromName = (n: string): string => {
  for (const d of DIRS) if (n.startsWith(`${d}.`)) return `${d}/${n.slice(d.length + 1)}`;
  return n;
};

export class StorageHome implements FbHome {
  private readonly files = new Map<string, string>();
  private chain: Promise<unknown> = Promise.resolve();
  private readonly storage: Storage | null;
  /** called when a write fails (the server's limits, or no connection) */
  onError: (path: string, e: unknown) => void = () => {};

  constructor(storage: Storage | null) { this.storage = storage; }

  async load(): Promise<void> {
    if (!this.storage) return;
    const dec = new TextDecoder();
    for (const f of await this.storage.list('')) {
      const d = await this.storage.get(f.name);
      if (d) this.files.set(fromName(f.name), dec.decode(d));
    }
  }

  private save(path: string): void {
    const s = this.storage;
    if (!s) return;
    const v = this.files.get(path);
    this.chain = this.chain.then(async (): Promise<void> => {
      if (v === undefined) await s.delete(toName(path)); else await s.put(toName(path), new TextEncoder().encode(v));
    })
      .catch((e) => this.onError(path, e));
  }

  /** resolves when every write has reached the server */
  flush(): Promise<unknown> { return this.chain; }

  read(p: string): string | null { return this.files.get(p) ?? null; }
  write(p: string, d: string): void { this.files.set(p, d); this.save(p); }
  append(p: string, d: string): void { this.files.set(p, (this.files.get(p) ?? '') + d); this.save(p); }
  remove(p: string): boolean { const had = this.files.delete(p); if (had) this.save(p); return had; }
  exists(p: string): boolean { return this.files.has(p); }
  list(dir: string): string[] {
    const pre = `${dir}/`;
    return [...this.files.keys()].filter((k) => k.startsWith(pre)).map((k) => k.slice(pre.length));
  }
}
