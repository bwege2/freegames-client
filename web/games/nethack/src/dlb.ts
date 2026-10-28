// @ts-nocheck
// NetHack 3.6.7 dlb.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { fopen_datafile } from './files.ts';
import { eos } from './hacklib.ts';
import { struct_dlb_directory, struct_dlb_handle, struct_dlb_library, struct_dlb_procs } from './structs.ts';
import { $bytes, $sadd, $sarr, $sat, $u64, G, P, S, fclose, fgetc, fgets, fread, free, fscanf, fseek, ftell, memset, strcmp } from './rt/index.ts';
import { DATAPREFIX, DLB_MAX_VERS, DLB_MIN_VERS, EOF, FALSE, MAX_LIBS, SEEK_SET, TRUE } from './consts.ts';

let dlb_libs: any;
let dlb_procs: struct_dlb_procs | null;
let dlb_initialized: number;

async function readlibdir(lp: struct_dlb_library | null): Promise<number> {
  let i = 0;
  let sp = null;
  const liboffset = new Float64Array(1);
  const totalsize = new Float64Array(1);
  if (fscanf(lp.fdata, S("%ld %ld %ld %ld %ld\n"), P(lp, "rev"), P(lp, "nentries"), P(lp, "strsize"), P(liboffset, 0), P(totalsize, 0)) !== 5) {
    return FALSE;
  }
  if (lp.rev > DLB_MAX_VERS || lp.rev < DLB_MIN_VERS) {
    return FALSE;
  }
  lp.dir = $sarr(struct_dlb_directory, ($u64(lp.nentries) * 32 >>> 0) / 32)[0];
  lp.sspace = P(new Int8Array((lp.strsize >>> 0)));
  for (i = 0, sp = lp.sspace; i < lp.nentries; ++i) {
    $sadd(lp.dir, i).fname = sp;
    if (fscanf(lp.fdata, S("%c%s %ld\n"), P($sadd(lp.dir, i), "handling"), sp, P($sadd(lp.dir, i), "foffset")) !== 3) {
      free(lp.dir);
      free(lp.sspace);
      lp.dir = null;
      lp.sspace = null;
      return FALSE;
    }
    sp = eos(sp).add(1);
  }
  for (i = 0; i < lp.nentries; ++i) {
    if (i === lp.nentries - 1) {
      $sadd(lp.dir, i).fsize = totalsize[0] - $sadd(lp.dir, i).foffset;
    } else {
      $sadd(lp.dir, i).fsize = $sadd(lp.dir, (i + 1)).foffset - $sadd(lp.dir, i).foffset;
    }
  }
  fseek(lp.fdata, 0, SEEK_SET);
  lp.fmark = 0;
  return TRUE;
}

function find_file(name: Ptr | null, lib: Ptr | null, startp: Ptr | null, sizep: Ptr | null): number {
  let i = 0;
  let j = 0;
  let lp = null;
  for (i = 0; i < MAX_LIBS && dlb_libs[i].fdata; ++i) {
    lp = $sat(dlb_libs, i);
    for (j = 0; j < lp.nentries; ++j) {
      if (strcmp(name, $sadd(lp.dir, j).fname) === 0) {
        lib.a[lib.o] = lp;
        startp.a[startp.o] = $sadd(lp.dir, j).foffset;
        sizep.a[sizep.o] = $sadd(lp.dir, j).fsize;
        return TRUE;
      }
    }
  }
  lib.a[lib.o] = null;
  startp.a[startp.o] = sizep.a[sizep.o] = 0;
  return FALSE;
}

export async function open_library(lib_name: Ptr | null, lp: struct_dlb_library | null): Promise<number> {
  let status = FALSE;
  lp.fdata = fopen_datafile(lib_name, S("r"), DATAPREFIX);
  if (lp.fdata) {
    if (await readlibdir(lp)) {
      status = TRUE;
    } else {
      fclose(lp.fdata);
      lp.fdata = null;
    }
  }
  return status;
}

export function close_library(lp: struct_dlb_library | null): void {
  fclose(lp.fdata);
  free(lp.dir);
  free(lp.sspace);
  memset($bytes(lp), 0, 56);
}

async function lib_dlb_init(): Promise<number> {
  memset($bytes(dlb_libs[0]), 0, 224);
  if (!await open_library(S("nhdat"), dlb_libs[0])) {
    return FALSE;
  }
  return TRUE;
}

function lib_dlb_cleanup(): void {
  let i = 0;
  for (i = 0; i < MAX_LIBS && dlb_libs[i].fdata; ++i) {
    close_library($sat(dlb_libs, i));
  }
}

function lib_dlb_fopen(dp: struct_dlb_handle | null, name: Ptr | null, mode: Ptr | null): number {
  const start = new Float64Array(1);
  const size = new Float64Array(1);
  const lp = [null];
  if (find_file(name, P(lp, 0), P(start, 0), P(size, 0))) {
    dp.lib = lp[0];
    dp.start = start[0];
    dp.size = size[0];
    dp.mark = 0;
    return TRUE;
  }
  return FALSE;
}

function lib_dlb_fclose(dp: struct_dlb_handle | null): number {
  return 0;
}

function lib_dlb_fread(buf: Ptr | null, size: number, quan: number, dp: struct_dlb_handle | null): number {
  let pos = 0;
  let nread = 0;
  let nbytes = 0;
  if (dp.size - dp.mark < Math.imul(size, quan)) {
    quan = Math.trunc((dp.size - dp.mark) / size) | 0;
  }
  if (quan === 0) {
    return 0;
  }
  pos = dp.start + dp.mark;
  if (dp.lib.fmark !== pos) {
    fseek(dp.lib.fdata, pos, SEEK_SET);
    dp.lib.fmark = pos;
  }
  nread = fread(buf, $u64(size), $u64(quan), dp.lib.fdata);
  nbytes = nread * size;
  dp.mark += nbytes;
  dp.lib.fmark += nbytes;
  return nread | 0;
}

function lib_dlb_fseek(dp: struct_dlb_handle | null, pos: number, whence: number): number {
  let curpos = 0;
  switch (whence) {
  case 1:
    curpos = dp.mark + pos;
    break;
  case 2:
    curpos = dp.size - pos;
    break;
  default:
    curpos = pos;
    break;
  }
  if (curpos < 0) {
    curpos = 0;
  }
  if (curpos > dp.size) {
    curpos = dp.size;
  }
  dp.mark = curpos;
  return 0;
}

function lib_dlb_fgets(buf: Ptr | null, len: number, dp: struct_dlb_handle | null): Ptr | null {
  let i = 0;
  let bp = null;
  let c = 0;
  if (len <= 0) {
    return buf;
  }
  if (dp.mark >= dp.size) {
    return null;
  }
  --len;
  for (i = 0, bp = buf; i < len && dp.mark < dp.size && c !== 10; ++i, bp = bp.add(1)) {
    if (dlb_fread(bp, 1, 1, dp) <= 0) {
      break;
    }
    c = bp.a[bp.o];
  }
  bp.a[bp.o] = 0;
  return buf;
}

function lib_dlb_fgetc(dp: struct_dlb_handle | null): number {
  const c = new Int8Array(1);
  if (lib_dlb_fread(P(c, 0), 1, 1, dp) !== 1) {
    return EOF;
  }
  return c[0];
}

function lib_dlb_ftell(dp: struct_dlb_handle | null): number {
  return dp.mark;
}

export async function dlb_init(): Promise<number> {
  if (!dlb_initialized) {
    dlb_procs = G.lib_dlb_procs;
    if (dlb_procs) {
      dlb_initialized = await dlb_procs.dlb_init_proc();
    }
  }
  return dlb_initialized;
}

export function dlb_cleanup(): void {
  if (dlb_initialized) {
    dlb_procs.dlb_cleanup_proc();
    dlb_initialized = FALSE;
  }
}

export async function dlb_fopen(name: Ptr | null, mode: Ptr | null): Promise<struct_dlb_handle | null> {
  let fp = null;
  let dp = null;
  if (!dlb_initialized) {
    return null;
  }
  if (!mode || mode.a[mode.o] !== 114) {
    return null;
  }
  dp = new struct_dlb_handle();
  if (dlb_procs.dlb_fopen_proc(dp, name, mode)) {
    dp.fp = null;
  } else if (!!(fp = fopen_datafile(name, mode, DATAPREFIX))) {
    dp.fp = fp;
  } else {
    free(dp);
    dp = null;
  }
  return dp;
}

export function dlb_fclose(dp: struct_dlb_handle | null): number {
  let ret = 0;
  if (dlb_initialized) {
    if (dp.fp) {
      ret = fclose(dp.fp);
    } else {
      ret = dlb_procs.dlb_fclose_proc(dp);
    }
    free(dp);
  }
  return ret;
}

export function dlb_fread(buf: Ptr | null, size: number, quan: number, dp: struct_dlb_handle | null): number {
  if (!dlb_initialized || size <= 0 || quan <= 0) {
    return 0;
  }
  if (dp.fp) {
    return fread(buf, $u64(size), $u64(quan), dp.fp) | 0;
  }
  return dlb_procs.dlb_fread_proc(buf, size, quan, dp);
}

export function dlb_fseek(dp: struct_dlb_handle | null, pos: number, whence: number): number {
  if (!dlb_initialized) {
    return EOF;
  }
  if (dp.fp) {
    return fseek(dp.fp, pos, whence);
  }
  return dlb_procs.dlb_fseek_proc(dp, pos, whence);
}

export function dlb_fgets(buf: Ptr | null, len: number, dp: struct_dlb_handle | null): Ptr | null {
  if (!dlb_initialized) {
    return null;
  }
  if (dp.fp) {
    return fgets(buf, len, dp.fp);
  }
  return dlb_procs.dlb_fgets_proc(buf, len, dp);
}

export async function dlb_fgetc(dp: struct_dlb_handle | null): Promise<number> {
  if (!dlb_initialized) {
    return EOF;
  }
  if (dp.fp) {
    return await fgetc(dp.fp);
  }
  return dlb_procs.dlb_fgetc_proc(dp);
}

export function dlb_ftell(dp: struct_dlb_handle | null): number {
  if (!dlb_initialized) {
    return 0;
  }
  if (dp.fp) {
    return ftell(dp.fp);
  }
  return dlb_procs.dlb_ftell_proc(dp);
}

export function $init(): void {
  dlb_libs = $sarr(struct_dlb_library, 4);
  G.lib_dlb_procs = struct_dlb_procs.$of(lib_dlb_init, lib_dlb_cleanup, lib_dlb_fopen, lib_dlb_fclose, lib_dlb_fread, lib_dlb_fseek, lib_dlb_fgets, lib_dlb_fgetc, lib_dlb_ftell);
  dlb_procs = null;
  dlb_initialized = 0;
}
