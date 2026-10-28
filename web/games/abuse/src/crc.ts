// crc.cpp and the CrcManager of cache.cpp: checksums of data files (the network game compares them) and
// the numbering of every file the program opened through the cache
import { bFILE, jFILE, open_file } from './imlib/specs.ts';

export function calc_crc(data: Uint8Array, len = data.length): number {
  let c1 = 0, c2 = 0;
  for (let i = 0; i < len; i++) {
    c1 = (c1 + data[i]) & 0xff;
    c2 = (c2 + c1) & 0xff;
  }
  return (c2 << 8) | c1;
}

export function crc_file(fp: bFILE): number {
  let crc1 = 0, crc2 = 0, crc3 = 0, crc4 = 0;
  let l = fp.file_size();
  const cur = fp.tell();
  fp.seek(0, 0);
  const buf = new Uint8Array(0x1000);
  while (l) {
    let nr = fp.read(buf, 0x1000);
    if (nr === 0) l = 0;
    else {
      l -= nr;
      for (let i = 0; nr; nr--, i++) {
        crc1 = (crc1 + buf[i]) & 0xff;
        crc2 = (crc2 + crc1) & 0xff;
        crc3 = (crc3 + crc2) & 0xff;
        crc4 = (crc4 + crc3) & 0xff;
      }
    }
  }
  fp.seek(cur, 0);
  return (crc1 | (crc2 << 8) | (crc3 << 16) | (crc4 << 24)) >>> 0;
}

class CrcedFile {
  crc_calculated = 0;
  crc = 0;
  filename: string;
  constructor(name: string) { this.filename = name; }
}

export class CrcManager {
  private files: CrcedFile[] = [];

  get_filenumber(filename: string): number {
    for (let i = 0; i < this.files.length; i++) if (this.files[i].filename === filename) return i;
    this.files.push(new CrcedFile(filename));
    return this.files.length - 1;
  }
  get_filename(n: number): string { return this.files[n].filename; }
  /** returns [crc, failed] */
  get_crc(n: number): [number, number] {
    const f = this.files[n];
    return f.crc_calculated ? [f.crc, 0] : [0, 1];
  }
  set_crc(n: number, crc: number): void {
    this.files[n].crc_calculated = 1;
    this.files[n].crc = crc;
  }
  total_filenames(): number { return this.files.length; }
  clean_up(): void { this.files = []; }

  load_crc_file(filename: string): number {
    const fp = open_file(filename, 'rb');
    if (fp.open_failure()) {
      fp.close();
      return 0;
    }
    const total = (fp.read_uint16() << 16) >> 16;
    for (let i = 0; i < total; i++) {
      const crc = fp.read_uint32();
      const len = fp.read_uint8();
      const nb = fp.read_bytes(len);
      let name = '';
      for (let j = 0; j < nb.length && nb[j]; j++) name += String.fromCharCode(nb[j]);
      this.set_crc(this.get_filenumber(name), crc);
    }
    fp.close();
    return 1;
  }

  /** the checksums of every file (write_crc_file without the file) */
  calc_all(): void {
    for (let i = 0; i < this.files.length; i++) {
      if (this.get_crc(i)[1]) {
        const fp = new jFILE(this.get_filename(i), 'rb');
        if (!fp.open_failure()) this.set_crc(i, crc_file(fp));
        fp.close();
      }
    }
  }
}

export const crc_manager = new CrcManager();
