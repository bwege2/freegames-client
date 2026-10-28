// @ts-nocheck
// NetHack 3.6.7 questpgr.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { artiname } from './artifact.ts';
import { rank_of } from './botl.ts';
import { dlb_fclose, dlb_fgets, dlb_fopen, dlb_fread, dlb_fseek } from './dlb.ts';
import { panic } from './end.ts';
import { debugcore } from './files.ts';
import { copynchars, highc, lowc, s_suffix, strncmpi, strstri, xcrypt } from './hacklib.ts';
import { mkclass } from './makemon.ts';
import { An, an, makeplural, makesingular, the } from './objnam.ts';
import { impossible, pline } from './pline.ts';
import { align_gname, align_gtitle } from './pray.ts';
import { align_str } from './priest.ts';
import { rn2 } from './rnd.ts';
import { struct_dlb_handle, struct_obj, struct_permonst, struct_qtlists, struct_qtmsg } from './structs.ts';
import { $arr, $rd, $sadd, $sarr, $sat, $u64, $wr, G, P, S, free, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncmp } from './rt/index.ts';
import { A_LAWFUL, A_ORIGINAL, BLINDED, BUFSZ, FALSE, G_GENOD, LEN_HDR, MIN_QUEST_LEVEL, NHW_MAP, NHW_MENU, NHW_TEXT, NON_PM, OBJ_BURIED, OBJ_FLOOR, OBJ_INVENT, OBJ_MIGRATING, OBJ_MINVENT, QT_ALTGOAL, QT_NEXTGOAL, SEEK_SET, TRUE } from './consts.ts';

let cvt_buf: any;
let qt_list: struct_qtlists;
let msg_file: struct_dlb_handle | null;
let nambuf: any;

async function dump_qtlist(): Promise<void> {
  let msg = null;
  if (!await debugcore(S("questpgr.c"), 0)) {
    return;
  }
  for (msg = qt_list.chrole; msg.msgnum > 0; msg = $sadd(msg, 1)) {
    dlb_fseek(msg_file, msg.offset, SEEK_SET);
    await deliver_by_window(msg, NHW_MAP);
  }
  return;
}

async function Fread(ptr: any, size: number, nitems: number, stream: struct_dlb_handle | null): Promise<void> {
  let cnt = 0;
  if ((cnt = dlb_fread(ptr, size, nitems, stream)) !== nitems) {
    await panic(S("PREMATURE EOF ON QUEST TEXT FILE! Expected %d bytes, got %d"), Math.imul(size, nitems), Math.imul(size, cnt));
  }
}

async function construct_qtlist(hdr_offset: number): Promise<struct_qtmsg | null> {
  let msg_list = null;
  const n_msgs = new Int32Array(1);
  dlb_fseek(msg_file, hdr_offset, SEEK_SET);
  await Fread(P(n_msgs, 0), 4, 1, msg_file);
  msg_list = $sarr(struct_qtmsg, ((n_msgs[0] + 1 >>> 0) * 32 >>> 0) / 32)[0];
  await Fread(msg_list, $u64(n_msgs[0]) * 32 | 0, 1, msg_file);
  $sadd(msg_list, n_msgs[0]).msgnum = -1;
  return msg_list;
}

export async function load_qtlist(): Promise<void> {
  const n_classes = new Int32Array(1);
  let i = 0;
  let qt_classes = $arr(16, () => new Int8Array(3));
  let qt_offsets = new Float64Array(16);
  msg_file = await dlb_fopen(S("quest.dat"), S("r"));
  if (!msg_file) {
    await panic(S("CANNOT OPEN QUEST TEXT FILE %s."), S("quest.dat"));
  }
  await Fread(P(n_classes, 0), 4, 1, msg_file);
  await Fread(P(qt_classes[0], 0), 1 * LEN_HDR, n_classes[0], msg_file);
  await Fread(P(qt_offsets), 8, n_classes[0], msg_file);
  qt_list.common = qt_list.chrole = null;
  for (i = 0; i < n_classes[0]; ++i) {
    if (!strncmp(S("-"), P(qt_classes[i]), LEN_HDR)) {
      qt_list.common = await construct_qtlist(qt_offsets[i]);
    } else if (!strncmp(G.urole.filecode, P(qt_classes[i]), LEN_HDR)) {
      qt_list.chrole = await construct_qtlist(qt_offsets[i]);
    }
  }
  if (!qt_list.common || !qt_list.chrole) {
    await impossible(S("load_qtlist: cannot load quest text."));
  }
  await dump_qtlist();
  return;
}

export function unload_qtlist(): void {
  if (msg_file) {
    dlb_fclose(msg_file), msg_file = null;
  }
  if (qt_list.common) {
    free(qt_list.common), qt_list.common = null;
  }
  if (qt_list.chrole) {
    free(qt_list.chrole), qt_list.chrole = null;
  }
  return;
}

export async function quest_info(typ: number): Promise<number> {
  switch (typ) {
  case 0:
    return G.urole.questarti;
  case 31:
    return G.urole.ldrnum;
  case 32:
    return G.urole.neminum;
  case 33:
    return G.urole.guardnum;
  default:
    await impossible(S("quest_info(%d)"), typ);
  }
  return 0;
}

export function ldrname(): Ptr | null {
  let i = G.urole.ldrnum;
  sprintf(P(nambuf), S("%s%s"), ($sat(G.mons, i).mflags2 & 524288) >>> 0 !== 0 ? S("") : S("the "), G.mons[i].mname);
  return P(nambuf);
}

function intermed(): Ptr | null {
  return G.urole.intermed;
}

export function is_quest_artifact(otmp: struct_obj | null): number {
  return (otmp.oartifact === G.urole.questarti ? 1 : 0) << 24 >> 24;
}

function find_qarti(ochain: struct_obj | null): struct_obj | null {
  let otmp = null;
  let qarti = null;
  for (otmp = ochain; otmp; otmp = otmp.nobj) {
    if (is_quest_artifact(otmp)) {
      return otmp;
    }
    if (!!otmp.cobj && !!(qarti = find_qarti(otmp.cobj))) {
      return qarti;
    }
  }
  return null;
}

export function find_quest_artifact(whichchains: number): struct_obj | null {
  let mtmp = null;
  let qarti = null;
  if ((whichchains & 1 << OBJ_INVENT) >>> 0 !== 0) {
    qarti = find_qarti(G.invent);
  }
  if (!qarti && (whichchains & 1 << OBJ_FLOOR) >>> 0 !== 0) {
    qarti = find_qarti(G.level.objlist);
  }
  if (!qarti && (whichchains & 1 << OBJ_MINVENT) >>> 0 !== 0) {
    for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (!!(qarti = find_qarti(mtmp.minvent))) {
        break;
      }
    }
  }
  if (!qarti && (whichchains & 1 << OBJ_MIGRATING) >>> 0 !== 0) {
    for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp.nmon) {
      if (mtmp.mhp < 1) {
        continue;
      }
      if (!!(qarti = find_qarti(mtmp.minvent))) {
        break;
      }
    }
    if (!qarti) {
      qarti = find_qarti(G.migrating_objs);
    }
  }
  if (!qarti && (whichchains & 1 << OBJ_BURIED) >>> 0 !== 0) {
    qarti = find_qarti(G.level.buriedobjlist);
  }
  return qarti;
}

function neminame(): Ptr | null {
  let i = G.urole.neminum;
  sprintf(P(nambuf), S("%s%s"), ($sat(G.mons, i).mflags2 & 524288) >>> 0 !== 0 ? S("") : S("the "), G.mons[i].mname);
  return P(nambuf);
}

function guardname(): Ptr | null {
  let i = G.urole.guardnum;
  return G.mons[i].mname;
}

function homebase(): Ptr | null {
  return G.urole.homebase;
}

async function qtext_pronoun(who: number, which: number): Promise<void> {
  let pnoun = null;
  let g = 0;
  let lwhich = lowc(which);
  if (who === 111 && (strstri(P(cvt_buf), S("Eyes ")) || strncmpi(P(cvt_buf), await makesingular(P(cvt_buf)), -1))) {
    pnoun = lwhich === 104 ? S("they") : lwhich === 105 ? S("them") : lwhich === 106 ? S("their") : S("?");
  } else {
    g = who === 100 ? G.quest_status.godgend | 0 : who === 108 ? G.quest_status.ldrgend | 0 : who === 110 ? G.quest_status.nemgend | 0 : 2;
    pnoun = lwhich === 104 ? G.genders[g].he : lwhich === 105 ? G.genders[g].him : lwhich === 106 ? G.genders[g].his : S("?");
  }
  strcpy(P(cvt_buf), pnoun);
  if (lwhich !== which) {
    cvt_buf[0] = highc(cvt_buf[0]);
  }
  return;
}

function msg_in(qtm_list: struct_qtmsg | null, msgnum: number): struct_qtmsg | null {
  let qt_msg = null;
  for (qt_msg = qtm_list; qt_msg.msgnum > 0; qt_msg = $sadd(qt_msg, 1)) {
    if (qt_msg.msgnum === msgnum) {
      return qt_msg;
    }
  }
  return null;
}

async function convert_arg(c: number): Promise<void> {
  let str = null;
  switch (c) {
  case 112:
    str = P(G.plname);
    break;
  case 99:
    str = G.flags.female && G.urole.name.f ? G.urole.name.f : G.urole.name.m;
    break;
  case 114:
    str = rank_of(G.u.ulevel, G.urole.malenum, G.flags.female);
    break;
  case 82:
    str = rank_of(MIN_QUEST_LEVEL, G.urole.malenum, G.flags.female);
    break;
  case 115:
    str = G.flags.female ? S("sister") : S("brother");
    break;
  case 83:
    str = G.flags.female ? S("daughter") : S("son");
    break;
  case 108:
    str = ldrname();
    break;
  case 105:
    str = intermed();
    break;
  case 79:
  case 111:
    str = await the(artiname(G.urole.questarti));
    if (c === 79) {
      let p = strstri(str, S(" of "));
      if (p) {
        p.a[p.o] = 0;
      }
    }
    break;
  case 110:
    str = neminame();
    break;
  case 103:
    str = guardname();
    break;
  case 71:
    str = align_gtitle(G.u.ualignbase[A_ORIGINAL]);
    break;
  case 72:
    str = homebase();
    break;
  case 97:
    str = align_str(G.u.ualignbase[A_ORIGINAL]);
    break;
  case 65:
    str = align_str(G.u.ualign.type);
    break;
  case 100:
    str = await align_gname(G.u.ualignbase[A_ORIGINAL]);
    break;
  case 68:
    str = await align_gname(A_LAWFUL);
    break;
  case 67:
    str = S("chaotic");
    break;
  case 78:
    str = S("neutral");
    break;
  case 76:
    str = S("lawful");
    break;
  case 120:
    str = (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("sense") : S("see");
    break;
  case 90:
    str = P(G.dungeons[0].dname);
    break;
  case 37:
    str = S("%");
    break;
  default:
    str = S("");
    break;
  }
  strcpy(P(cvt_buf), str);
}

async function convert_line(in_line: Ptr | null, out_line: Ptr | null): Promise<void> {
  let $t1: any;
  let c = null;
  let cc = null;
  let xbuf = new Int8Array(256);
  cc = out_line;
  for (c = xcrypt(in_line, P(xbuf)); c.a[c.o]; c = c.add(1)) {
    cc.a[cc.o] = 0;
    switch (c.a[c.o]) {
    case 13:
    case 10:
      $wr((cc = cc.add(1)), 0, 0);
      return;
    case 37:
      if ($rd(c.add(1))) {
        await convert_arg($rd((c = c.add(1))));
        switch ($rd((c = c.add(1)))) {
        case 65:
          strcat(cc, await An(P(cvt_buf)));
          cc = cc.add(strlen(cc));
          continue;
        case 97:
          strcat(cc, await an(P(cvt_buf)));
          cc = cc.add(strlen(cc));
          continue;
        case 67:
          cvt_buf[0] = highc(cvt_buf[0]);
          break;
        case 104:
        case 72:
        case 105:
        case 73:
        case 106:
        case 74:
          if (strchr(S("dlno"), lowc($rd(c.add(-1))))) {
            await qtext_pronoun($rd(c.add(-1)), c.a[c.o]);
          } else {
            c = c.add(-1);
          }
          break;
        case 80:
          cvt_buf[0] = highc(cvt_buf[0]);
        case 112:
          strcpy(P(cvt_buf), await makeplural(P(cvt_buf)));
          break;
        case 83:
          cvt_buf[0] = highc(cvt_buf[0]);
        case 115:
          strcpy(P(cvt_buf), s_suffix(P(cvt_buf)));
          break;
        case 116:
          if (!strncmpi(P(cvt_buf), S("the "), 4)) {
            strcat(cc, P(cvt_buf, 4));
            cc = cc.add(strlen(cc));
            continue;
          }
          break;
        default:
          c = c.add(-1);
          break;
        }
        strcat(cc, P(cvt_buf));
        cc = cc.add(strlen(P(cvt_buf)));
        break;
      }
    default:
      $wr(($t1 = cc, cc = $t1.add(1), $t1), 0, c.a[c.o]);
      break;
    }
  }
  if (cc.o > out_line.add(BUFSZ - 1).o) {
    await panic(S("convert_line: overflow"));
  }
  cc.a[cc.o] = 0;
  return;
}

async function deliver_by_pline(qt_msg: struct_qtmsg | null): Promise<void> {
  let size = 0;
  let in_line = new Int8Array(256);
  let out_line = new Int8Array(256);
  $wr(P(in_line), 0, 0);
  for (size = 0; size < qt_msg.size; size += strlen(P(in_line))) {
    dlb_fgets(P(in_line), 256, msg_file);
    await convert_line(P(in_line), P(out_line));
    await pline(S("%s"), P(out_line));
  }
}

async function deliver_by_window(qt_msg: struct_qtmsg | null, how: number): Promise<void> {
  let size = 0;
  let in_line = new Int8Array(256);
  let out_line = new Int8Array(256);
  let qtdump = (how === NHW_MAP ? 1 : 0) << 24 >> 24;
  let datawin = await G.windowprocs.win_create_nhwindow(qtdump ? NHW_TEXT : how);
  if (qtdump) {
    let buf = new Int8Array(256);
    sprintf(P(buf), S("msgnum: %d, delivery: %c"), qt_msg.msgnum, qt_msg.delivery);
    await G.windowprocs.win_putstr(datawin, 0, P(buf));
    await G.windowprocs.win_putstr(datawin, 0, S(""));
  }
  for (size = 0; size < qt_msg.size; size += strlen(P(in_line))) {
    dlb_fgets(P(in_line), 256, msg_file);
    await convert_line(P(in_line), P(out_line));
    await G.windowprocs.win_putstr(datawin, 0, P(out_line));
  }
  await G.windowprocs.win_display_nhwindow(datawin, TRUE);
  await G.windowprocs.win_destroy_nhwindow(datawin);
  $wr(P(out_line), 0, 0);
  if (qt_msg.summary_size) {
    dlb_fgets(P(in_line), 256, msg_file);
    await convert_line(P(in_line), P(out_line));
  }
  if ($rd(P(out_line))) {
    await G.windowprocs.win_putmsghistory(P(out_line), FALSE);
  }
}

async function skip_pager(common: number): Promise<number> {
  if (G.program_state.wizkit_wishing) {
    return TRUE;
  }
  if (!(common ? qt_list.common : qt_list.chrole)) {
    await panic(S("%s: no %s quest text data available"), common ? S("com_pager") : S("qt_pager"), common ? S("common") : S("role-specific"));
    return TRUE;
  }
  return FALSE;
}

export async function com_pager(msgnum: number): Promise<void> {
  let qt_msg = null;
  if (await skip_pager(TRUE)) {
    return;
  }
  if (!(qt_msg = msg_in(qt_list.common, msgnum))) {
    await impossible(S("com_pager: message %d not found."), msgnum);
    return;
  }
  dlb_fseek(msg_file, qt_msg.offset, SEEK_SET);
  if (qt_msg.delivery === 112) {
    await deliver_by_pline(qt_msg);
  } else if (msgnum === 1) {
    await deliver_by_window(qt_msg, NHW_MENU);
  } else {
    await deliver_by_window(qt_msg, NHW_TEXT);
  }
  return;
}

export async function qt_pager(msgnum: number): Promise<void> {
  let qt_msg = null;
  if (await skip_pager(FALSE)) {
    return;
  }
  qt_msg = msg_in(qt_list.chrole, msgnum);
  if (!qt_msg) {
    if (msgnum === QT_ALTGOAL) {
      qt_msg = msg_in(qt_list.chrole, QT_NEXTGOAL);
    }
  }
  if (!qt_msg) {
    await impossible(S("qt_pager: message %d not found."), msgnum);
    return;
  }
  dlb_fseek(msg_file, qt_msg.offset, SEEK_SET);
  if (qt_msg.delivery === 112 && strcmp(G.windowprocs.name, S("X11"))) {
    await deliver_by_pline(qt_msg);
  } else {
    await deliver_by_window(qt_msg, NHW_TEXT);
  }
  return;
}

export async function qt_montype(): Promise<struct_permonst | null> {
  let qpm = 0;
  if (rn2(5)) {
    qpm = G.urole.enemy1num;
    if (qpm !== NON_PM && rn2(5) && !(G.mvitals[qpm].mvflags & G_GENOD)) {
      return $sat(G.mons, qpm);
    }
    return await mkclass(G.urole.enemy1sym, 0);
  }
  qpm = G.urole.enemy2num;
  if (qpm !== NON_PM && rn2(5) && !(G.mvitals[qpm].mvflags & G_GENOD)) {
    return $sat(G.mons, qpm);
  }
  return await mkclass(G.urole.enemy2sym, 0);
}

export async function deliver_splev_message(): Promise<void> {
  let str = null;
  let nl = null;
  let in_line = new Int8Array(256);
  let out_line = new Int8Array(256);
  if (G.lev_message) {
    for (str = G.lev_message; str.a[str.o]; str = nl.add(1)) {
      copynchars(P(in_line), str, 256 - 1);
      xcrypt(P(in_line), P(in_line));
      await convert_line(P(in_line), P(out_line));
      await pline(S("%s"), P(out_line));
      if (!(nl = strchr(str, 10))) {
        break;
      }
    }
    free(G.lev_message);
    G.lev_message = null;
  }
}

export function $init(): void {
  cvt_buf = new Int8Array(64);
  qt_list = new struct_qtlists();
  msg_file = null;
  nambuf = new Int8Array(64);
}
