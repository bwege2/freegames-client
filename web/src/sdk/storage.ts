// freegames.stream website and game SDK: GPL-3.0-or-later, with an additional permission and additional terms under its section 7 (web/LICENSE.md).
// The player's files on the server, per game (what the original kept on disk: saves, own levels,
// warriors). Names [A-Za-z0-9._-]{1,64}; limits in docs/SERVER.md. Keep the original's file format
// where it had one.
import { bytes, setData, P } from './net/codec.ts';
import type { GameClient } from './net/client.ts';

export interface FileInfo {
  name: string;
  size: number;
  /** ms since the epoch */
  modified: number;
}

function info(f: P.FileInfo): FileInfo {
  return { name: f.name, size: f.size, modified: f.modified };
}

export class Storage {
  private readonly net: GameClient;

  constructor(net: GameClient) {
    this.net = net;
  }

  /** The file's bytes, or null if there is no such file. */
  async get(name: string): Promise<Uint8Array | null> {
    if (!this.net.hasAccount()) return null; // no account yet, so no files (and no token made just to look)
    await this.net.connect();
    const r = (await this.net.request((e, req) => {
      const g = e._initStorageGet();
      g.req = req;
      g.name = name;
    })).storageReply;
    return r.which() === P.StorageReply.FILE ? bytes(r.file.data) : null;
  }

  /** Writes (or replaces) a file. */
  async put(name: string, data: Uint8Array): Promise<FileInfo> {
    await this.net.connect();
    const r = (await this.net.request((e, req) => {
      const p = e._initStoragePut();
      p.req = req;
      p.name = name;
      setData((n) => p._initData(n), data);
    })).storageReply;
    return info(r.done);
  }

  /** Deletes a file; false if it did not exist. */
  async delete(name: string): Promise<boolean> {
    if (!this.net.hasAccount()) return false;
    await this.net.connect();
    const r = (await this.net.request((e, req) => {
      const d = e._initStorageDelete();
      d.req = req;
      d.name = name;
    })).storageReply;
    return r.which() === P.StorageReply.DONE;
  }

  /** The player's files of this game whose names start with `prefix`, sorted by name. */
  async list(prefix = ''): Promise<FileInfo[]> {
    if (!this.net.hasAccount()) return [];
    await this.net.connect();
    const r = (await this.net.request((e, req) => {
      const l = e._initStorageList();
      l.req = req;
      l.prefix = prefix;
    })).storageReply;
    const out: FileInfo[] = [];
    for (let i = 0; i < r.files.length; i++) out.push(info(r.files.get(i)));
    return out;
  }
}
