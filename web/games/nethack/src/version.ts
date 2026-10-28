// @ts-nocheck
// NetHack 3.6.7 version.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dlb_fclose, dlb_fgets, dlb_fopen } from './dlb.ts';
import { eos, strip_newline, strstri, strsubst, tabexpand } from './hacklib.ts';
import { pline, raw_printf } from './pline.ts';
import { minit } from './restore.ts';
import { bufoff, bufon, bwrite } from './save.ts';
import { struct_rt_opt, struct_version_info } from './structs.ts';
import { $rd, $sarrOf, $shl64, $u64, $wr, G, P, S, atoi, read, sprintf, strchr, strcpy, strlen, strrchr } from './rt/index.ts';
import { BUFSZ, COLNO, FALSE, IGNORED_FEATURES, NHW_TEXT, TRUE, VERSION_COMPATIBILITY, VERSION_FEATURES, VERSION_NUMBER, VERSION_SANITY1, VERSION_SANITY2, VERSION_SANITY3 } from './consts.ts';

let rt_opts: any;
let store_version$version_data: struct_version_info;

export function version_string(buf: Ptr | null): Ptr | null {
  return strcpy(buf, S("3.6.7"));
}

export function getversionstring(buf: Ptr | null): Ptr | null {
  strcpy(buf, S("Unix NetHack Version 3.6.7 - last revision Thu Feb 16 00:00:00 2023."));
  return buf;
}

export async function doversion(): Promise<number> {
  let buf = new Int8Array(256);
  await pline(S("%s"), getversionstring(P(buf)));
  return 0;
}

export async function doextversion(): Promise<number> {
  let f = null;
  let buf = new Int8Array(256);
  let p = null;
  let win = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
  getversionstring(P(buf));
  if (strlen(P(buf)) >= COLNO) {
    p = strrchr(P(buf), 40);
  }
  if (p && p.o > P(buf).o && p.a[p.o + -1] === 32) {
    p.a[p.o + -1] = 0;
  } else {
    p = null;
  }
  await G.windowprocs.win_putstr(win, 0, P(buf));
  if (p) {
    $wr((p = p.add(-1)), 0, 32);
    await G.windowprocs.win_putstr(win, 0, p);
  }
  f = await dlb_fopen(S("options"), S("r"));
  if (!f) {
    await G.windowprocs.win_putstr(win, 0, S(""));
    sprintf(P(buf), S("[Configuration '%s' not available?]"), S("options"));
    await G.windowprocs.win_putstr(win, 0, P(buf));
  } else {
    let prolog = TRUE;
    while (dlb_fgets(P(buf), BUFSZ, f)) {
      strip_newline(P(buf));
      if (!!strchr(P(buf), 9)) {
        tabexpand(P(buf));
      }
      if ($rd(P(buf)) && $rd(P(buf)) !== 32) {
        await G.windowprocs.win_putstr(win, 0, S(""));
        prolog = FALSE;
      }
      if (prolog || !$rd(P(buf))) {
        continue;
      }
      if (strchr(P(buf), 58)) {
        insert_rtoption(P(buf));
      }
      if ($rd(P(buf))) {
        await G.windowprocs.win_putstr(win, 0, P(buf));
      }
    }
    dlb_fclose(f);
    await G.windowprocs.win_display_nhwindow(win, FALSE);
    await G.windowprocs.win_destroy_nhwindow(win);
  }
  return 0;
}

export function early_version_info(pastebuf: number): void {
  let $t1: any;
  let buf = new Int8Array(256);
  let buf2 = new Int8Array(256);
  let tmp = getversionstring(P(buf));
  if (tmp) {
    tmp = strstri(P(buf), S(" ("));
    if (tmp) {
      $wr(($t1 = tmp, tmp = $t1.add(1), $t1), 0, 0);
    }
  }
  sprintf(P(buf2), S("%s\n"), P(buf));
  if (tmp) {
    sprintf(eos(P(buf2)), S("%s\n"), tmp);
  }
  raw_printf(S("%s"), P(buf2));
  if (pastebuf) {
    raw_printf(S("%s"), S("Paste buffer copy is not available.\n"));
  }
}

function insert_rtoption(buf: Ptr | null): void {
  let i = 0;
  for (i = 0; i < (Math.trunc(16 / 16) | 0); ++i) {
    if (strstri(buf, rt_opts[i].token)) {
      strsubst(buf, rt_opts[i].token, rt_opts[i].value);
    }
  }
}

export async function check_version(version_data: struct_version_info | null, filename: Ptr | null, complain: number): Promise<number> {
  if (version_data.incarnation < VERSION_COMPATIBILITY || version_data.incarnation > VERSION_NUMBER) {
    if (complain) {
      await pline(S("Version mismatch for file \"%s\"."), filename);
    }
    return FALSE;
  } else if ((version_data.feature_set & ~IGNORED_FEATURES >>> 0) >>> 0 !== (VERSION_FEATURES & ~IGNORED_FEATURES >>> 0) >>> 0 || version_data.entity_count !== VERSION_SANITY1 || version_data.struct_sizes1 !== VERSION_SANITY2 || version_data.struct_sizes2 !== VERSION_SANITY3) {
    if (complain) {
      await pline(S("Configuration incompatibility for file \"%s\"."), filename);
    }
    return FALSE;
  }
  return TRUE;
}

export async function uptodate(fd: number, name: Ptr | null): Promise<number> {
  let rlen = 0;
  let vers_info = new struct_version_info();
  let verbose = (name ? TRUE : FALSE) << 24 >> 24;
  rlen = read(fd, vers_info, 40) | 0;
  minit();
  if (rlen === 0) {
    if (verbose) {
      await pline(S("File \"%s\" is empty?"), name);
      await G.windowprocs.win_wait_synch();
    }
    return FALSE;
  }
  if (!await check_version(vers_info, name, verbose)) {
    if (verbose) {
      await G.windowprocs.win_wait_synch();
    }
    return FALSE;
  }
  return TRUE;
}

export async function store_version(fd: number): Promise<void> {
  await bufoff(fd);
  await bwrite(fd, store_version$version_data, 40);
  await bufon(fd);
  return;
}

export function get_feature_notice_ver(str: Ptr | null): number {
  let $t1: any;
  let buf = new Int8Array(256);
  let ver_maj = 0;
  let ver_min = 0;
  let patch = 0;
  let istr = new Array(3).fill(null);
  let j = 0;
  if (!str) {
    return 0;
  }
  str = strcpy(P(buf), str);
  istr[j] = str;
  while (str.a[str.o]) {
    if (str.a[str.o] === 46) {
      $wr(($t1 = str, str = $t1.add(1), $t1), 0, 0);
      ++j;
      istr[j] = str;
      if (j === 2) {
        break;
      }
    } else if (!!strchr(S("0123456789"), str.a[str.o])) {
      str = str.add(1);
    } else {
      return 0;
    }
  }
  if (j !== 2) {
    return 0;
  }
  ver_maj = atoi(istr[0]);
  ver_min = atoi(istr[1]);
  patch = atoi(istr[2]);
  return ((($shl64($u64(ver_maj), 24) | $shl64($u64(ver_min), 16)) >>> 0 | $shl64($u64(patch), 8)) >>> 0 | 0) >>> 0;
}

export function get_current_feature_ver(): number {
  return ((($shl64(3, 24) | $shl64(6, 16)) >>> 0 | $shl64(7, 8)) >>> 0 | 0) >>> 0;
}

export function copyright_banner_line(indx: number): Ptr | null {
  if (indx === 1) {
    return S("NetHack, Copyright 1985-2023");
  }
  if (indx === 2) {
    return S("         By Stichting Mathematisch Centrum and M. Stephenson.");
  }
  if (indx === 3) {
    return S("         Version 3.6.7 Unix, revised Feb 16 00:00:00 2023.");
  }
  if (indx === 4) {
    return S("         See license for details.");
  }
  return S("");
}

export function $init(): void {
  rt_opts = $sarrOf([struct_rt_opt.$of(S(":PATMATCH:"), P(G.regex_id))]);
  store_version$version_data = struct_version_info.$of(VERSION_NUMBER, VERSION_FEATURES, VERSION_SANITY1, VERSION_SANITY2, VERSION_SANITY3);
}
