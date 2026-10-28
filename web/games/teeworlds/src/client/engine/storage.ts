// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/storage.cpp of Teeworlds 0.7.5 in TypeScript: the data directory (the release's data,
// fetched and its images decoded before the client starts, so that the client loads them synchronously as the
// original reads its files) and ListDirectory over it. The save directory (settings.cfg) is the site's server
// storage (account scope), read before the start and written by the client (host.ts).
import { decodePNG, type CImageInfo } from './png.ts';

export const TYPE_SAVE = 0, TYPE_ALL = -1;

export class CStorage {
  private files = new Map<string, Uint8Array>();
  private images = new Map<string, CImageInfo>();

  /** adds a data file (a path relative to data/, e.g. "skins/body/standard.png"); PNGs are decoded */
  async add(path: string, bytes: Uint8Array): Promise<void> {
    this.files.set(path, bytes);
    if (path.endsWith('.png')) {
      const img = await decodePNG(bytes);
      if (img) this.images.set(path, img);
    }
  }

  ReadFile(path: string): Uint8Array | null { return this.files.get(path) ?? null; }
  Image(path: string): CImageInfo | null { return this.images.get(path) ?? null; }

  /** ListDirectory: the names of the files and directories directly in path (IsDir as the second value) */
  ListDirectory(path: string, cb: (name: string, isDir: boolean) => void): void {
    const prefix = path.endsWith('/') ? path : path + '/';
    const seen = new Set<string>();
    for (const k of [...this.files.keys()].sort()) {
      if (!k.startsWith(prefix)) continue;
      const rest = k.slice(prefix.length);
      const slash = rest.indexOf('/');
      const name = slash >= 0 ? rest.slice(0, slash) : rest;
      if (seen.has(name)) continue;
      seen.add(name);
      cb(name, slash >= 0);
    }
  }
}
