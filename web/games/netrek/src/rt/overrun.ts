// COW's buffer overrun, as it happens in the original: socket.c's doRead() reads the rest of a packet that
// straddles the end of its 1024-byte read buffer (the global `buf`) past the buffer's end
// (`read(asock, buf + count, ...)`), into the memory after it. In the client oracle's binary (nm -n
// bin/netrek-client-cow) the globals there are video_mode_current, wm_argv, wm_delete_window, wm_argc,
// fonts[4], full_screen_enabled, video_mode_dotclock, myroot, W_Display, ... (x11window.c), and the packet's
// bytes overwrite them: the login's MOTD lines, for one, set the fonts' baselines to 0, and COW draws its
// texts so from then on. The port's buffer has room after it for those bytes (the translator's SLACK), and
// this module changes the globals as the bytes would have.
import { G } from '../cow/globals.ts';

/** a non-null pointer the bytes made (in the original it points nowhere) */
export const BAD_POINTER: any = Object.freeze({ badPointer: true });

type Field = { off: number; size: number; kind: 'int' | 'uint' | 'ptr'; get: () => any; set: (v: any) => void };

function fieldsAfterBuf(): Field[] {
  const f: Field[] = [];
  const g = (name: string, off: number, size: number, kind: Field['kind']) =>
    f.push({ off, size, kind, get: () => G[name], set: (v) => { G[name] = v; } });
  g('video_mode_current', 0, 8, 'ptr');
  g('wm_argv', 8, 8, 'ptr');
  g('wm_delete_window', 16, 8, 'uint');
  g('wm_argc', 24, 4, 'int');
  for (let i = 0; i < 4; i++) {
    // struct fontInfo { int baseline; XFontStruct *xfs; }: 16 bytes
    f.push({ off: 32 + 16 * i, size: 4, kind: 'int', get: () => G.fonts[i].baseline, set: (v) => { G.fonts[i].baseline = v; } });
    f.push({ off: 40 + 16 * i, size: 8, kind: 'ptr', get: () => G.fonts[i].xfs, set: (v) => { G.fonts[i].xfs = v; } });
  }
  g('full_screen_enabled', 96, 4, 'int');
  g('video_mode_dotclock', 100, 4, 'int');
  // myroot: struct window (128 bytes), its fields by C's layout
  for (const [name, off, desc] of G.myroot.constructor.$layout()) {
    if (desc[0] === 'i') f.push({ off: 104 + off, size: desc[1], kind: desc[2] ? 'int' : 'uint', get: () => G.myroot[name], set: (v) => { G.myroot[name] = v; } });
    else if (desc[0] === 'p') f.push({ off: 104 + off, size: 8, kind: 'ptr', get: () => G.myroot[name], set: (v) => { G.myroot[name] = v; } });
    else throw new Error(`overrun: myroot.${name} is not a number or a pointer`);
  }
  return f;
}

/** the bytes at [from, from + bytes.length) past the end of buf were written */
export function overrun(from: number, bytes: Uint8Array): void {
  const to = from + bytes.length;
  if (to > 232) throw new Error(`overrun: ${to} bytes past socket.c's buf reach W_Display (the original would crash)`);
  for (const fd of fieldsAfterBuf()) {
    if (fd.off + fd.size <= from || fd.off >= to) continue;
    // the field's bytes as they are, the written ones over them
    const cur = fd.get();
    const b = new Uint8Array(8);
    const dv = new DataView(b.buffer);
    if (fd.kind === 'ptr') dv.setUint32(0, cur ? 1 : 0, true);
    else {
      const v = BigInt.asUintN(64, BigInt(Math.trunc(Number(cur) || 0)));
      dv.setBigUint64(0, v, true);
    }
    for (let k = 0; k < fd.size; k++) {
      const at = fd.off + k;
      if (at >= from && at < to) b[k] = bytes[at - from];
    }
    if (fd.kind === 'ptr') {
      const zero = b.every((v) => v === 0);
      const same = !zero && cur && b[0] === 1 && b.subarray(1).every((v) => v === 0);
      fd.set(zero ? null : same ? cur : BAD_POINTER);
    } else {
      const u = dv.getBigUint64(0, true) & ((1n << BigInt(8 * fd.size)) - 1n);
      fd.set(Number(fd.kind === 'int' ? BigInt.asIntN(8 * fd.size, u) : u));
    }
  }
}
