// (c) Magnus Auvinen. See licence.txt in the root of the distribution for more information.
// If you are missing that file, acquire a complete release at teeworlds.com.
// Altered: engine/shared/map.cpp (CMap) and the client's map search (maps/, downloadedmaps/) of Teeworlds 0.7.5
// in TypeScript. The browser inflates asynchronously, so the maps the client may load are opened ahead (the
// official maps when the game starts, a downloaded map when its download completes) and loading one is a
// copy of the opened file, as synchronous as the original's.
import { CDataFileReader } from '../../engine/shared/datafile.ts';

/** a fresh copy of an opened datafile (loading mutates items and data: CLayers, CCollision) */
function cloneReader(r: CDataFileReader): CDataFileReader {
  const c = Object.create(CDataFileReader.prototype) as CDataFileReader;
  Object.assign(c, r);
  c.items = r.items.slice();
  c.data = r.data.map((d) => d.slice());
  return c;
}

export interface MapEntry { name: string; crc: number; size: number; reader: CDataFileReader; sha256?: string }

/** the maps the client can load: the official ones it ships and those it downloaded this session */
export class CMapStore {
  private readonly maps: MapEntry[] = [];

  async add(name: string, bytes: Uint8Array): Promise<MapEntry | null> {
    const r = await CDataFileReader.open(bytes);
    if (!r) return null;
    const e: MapEntry = { name, crc: r.crc, size: bytes.length, reader: r };
    this.maps.push(e);
    return e;
  }

  /** a loaded copy of the map name with this crc, or null ("map not found" / "map differs") */
  load(name: string, crc: number): CDataFileReader | null {
    for (const m of this.maps) {
      if (m.name === name && (m.crc | 0) === (crc | 0)) {
        const r = cloneReader(m.reader);
        if (!r.loadMap()) return null;
        return r;
      }
    }
    return null;
  }

  has(name: string, crc: number): boolean { return this.maps.some((m) => m.name === name && (m.crc | 0) === (crc | 0)); }
}
