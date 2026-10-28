// DOS 3.3's file manager, as DISK.S calls it (JSR FMGR with the parameter list FMPL at $B5BB): OPEN a
// binary file by its name (CHARBUF), READ and WRITE ranges of bytes (at a position or on from the
// last), CLOSE. DOS is not part of Bill Budge's sources; this follows Apple's DOS 3.3 source (FOPCLRW:
// RNXBLK, WNXBLK, PUTBYT; FLOCNXB: LOCNXB, GNWSEC, DTBLN; CLRSEC) as far as DISK.S relies on it:
// - a file is whole 256-byte sectors, and its bytes pass through the sector buffer DISK.S gives DOS
//   (DSBUF, $600): the buffer holds one sector, written back when another one is needed or on CLOSE;
// - a sector the file does not have yet starts cleared (GNWSEC calls CLRSEC); reading one it does not
//   have is END OF DATA;
// - a READ of a range reads the length's bytes (RNXBLK counts down first), a WRITE of a range writes
//   one byte more (WNXBLK writes, then counts down): DISK.S's BSAVE passes its length "LESS 1".
// Shared by the port (on the player's storage) and the test's 6502 machine (on a map).

export const FMPL = 0xb5bb;
export const CHARBUF = 0x1f00;
const DSBUF = 0x600;

/** DOS 3.3's error codes (FMPL+10) */
export const FM = { OK: 0, RANGE: 2, END_OF_DATA: 5, FILE_NOT_FOUND: 6, IO_ERROR: 8, DISK_FULL: 9 } as const;

/** the file name at CHARBUF (30 characters, spaces after it), as storage names it: spaces become _ */
export function fileName(ram: Uint8Array): string {
  let s = '';
  for (let i = 0; i < 30; i++) s += String.fromCharCode(ram[CHARBUF + i] & 0x7f);
  return s.trimEnd().replace(/ /g, '_');
}

interface OpenFile {
  name: string;
  /** the file's sectors */
  data: Uint8Array;
  pos: number;
  /** the sector in DSBUF (DCBCMS), -1 for none */
  sector: number;
  /** DSBUF changed since it was read (DCBWRF) */
  bufferDirty: boolean;
  written: boolean;
}

export class FileManager {
  private file: OpenFile | null = null;

  /** OPEN: `data` is the file's bytes as stored, or null when it does not exist; X=0 may make it */
  open(ram: Uint8Array, x: number, data: Uint8Array | null): number {
    if (!data && x !== 0) return FM.FILE_NOT_FOUND;
    const d = new Uint8Array(Math.ceil((data?.length ?? 0) / 256) * 256);
    if (data) d.set(data);
    this.file = { name: fileName(ram), data: d, pos: 0, sector: -1, bufferDirty: false, written: false };
    return FM.OK;
  }

  /** WRSECT: the buffer back into its sector, if it changed */
  private flush(ram: Uint8Array, f: OpenFile): void {
    if (!f.bufferDirty) return;
    f.data.set(ram.subarray(DSBUF, DSBUF + 256), f.sector * 256);
    f.bufferDirty = false;
  }

  /** LOCNXB: the sector of f.pos into DSBUF; false at the end of the file when reading */
  private locate(ram: Uint8Array, f: OpenFile, writing: boolean): boolean {
    const sector = f.pos >> 8;
    if (sector === f.sector) return true;
    this.flush(ram, f);
    if (sector * 256 < f.data.length) ram.set(f.data.subarray(sector * 256, sector * 256 + 256), DSBUF);
    else if (!writing) return false;
    else {
      // GNWSEC: a new sector, cleared
      const d = new Uint8Array(sector * 256 + 256);
      d.set(f.data);
      f.data = d;
      ram.fill(0, DSBUF, DSBUF + 256);
      f.bufferDirty = true;
    }
    f.sector = sector;
    return true;
  }

  /** READ (3) or WRITE (4), subcodes 1 (a byte), 2 (a range), 3 and 4 (the same at a position) */
  rw(ram: Uint8Array): number {
    const f = this.file;
    if (!f) return FM.RANGE;
    const op = ram[FMPL];
    const sub = ram[FMPL + 1];
    if (sub < 1 || sub > 4) return FM.RANGE;
    // the position: record number times the record length (OPEN's 0, which DOS takes as 1) plus the byte
    if (sub >= 3) f.pos = (ram[FMPL + 2] | (ram[FMPL + 3] << 8)) + (ram[FMPL + 4] | (ram[FMPL + 5] << 8));
    const range = sub === 2 || sub === 4;
    // RNXBLK reads `length` bytes, WNXBLK writes `length` + 1
    const n = !range ? 1 : (ram[FMPL + 6] | (ram[FMPL + 7] << 8)) + (op === 4 ? 1 : 0);
    let at = ram[FMPL + 8] | (ram[FMPL + 9] << 8);
    for (let i = 0; i < n; i++) {
      if (!this.locate(ram, f, op === 4)) return FM.END_OF_DATA;
      const b = DSBUF + (f.pos & 0xff);
      // a single byte goes to and from FMPL+8 itself (CCBDAT), a range to and from memory
      const ptr = range ? at : FMPL + 8;
      if (op === 3) ram[ptr] = ram[b];
      else {
        ram[b] = ram[ptr];
        f.bufferDirty = true;
        f.written = true;
      }
      at = (at + 1) & 0xffff;
      f.pos++;
    }
    return FM.OK;
  }

  /** CLOSE: the file to keep, if it was written */
  close(ram: Uint8Array): { name: string; data: Uint8Array } | null {
    const f = this.file;
    this.file = null;
    if (!f) return null;
    this.flush(ram, f);
    return f.written ? { name: f.name, data: f.data } : null;
  }
}
