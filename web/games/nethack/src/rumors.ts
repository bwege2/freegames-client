// @ts-nocheck
// NetHack 3.6.7 rumors.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { exercise } from './attrib.ts';
import { yn_function } from './cmd.ts';
import { dlb_fclose, dlb_fgets, dlb_fopen, dlb_fseek, dlb_ftell } from './dlb.ts';
import { Monnam } from './do_name.ts';
import { is_fainted } from './eat.ts';
import { more_experienced, newexplevel } from './exper.ts';
import { money_cnt } from './hack.ts';
import { eos, strstri, xcrypt } from './hacklib.ts';
import { currency } from './invent.ts';
import { There, You, impossible, pline, verbalize } from './pline.ts';
import { mread } from './restore.ts';
import { rn2, rnd } from './rnd.ts';
import { bwrite } from './save.ts';
import { money2mon } from './shk.ts';
import { struct_dlb_handle, struct_monst } from './structs.ts';
import { $cs, $rd, $u64, $wr, G, P, S, free, sprintf, sscanf, strcat, strchr, strcmp, strcpy } from './rt/index.ts';
import { A_WIS, BLINDED, BY_COOKIE, BY_ORACLE, BY_PAPER, COLNO, FALSE, NHW_TEXT, SEEK_CUR, SEEK_END, SEEK_SET, TRUE } from './consts.ts';

let true_rumor_size: any;
let false_rumor_size: any;
let true_rumor_start: any;
let false_rumor_start: any;
let true_rumor_end: number;
let false_rumor_end: number;
let oracle_flg: number;
let oracle_cnt: any;
let oracle_loc: Ptr | null;
let init_rumors$rumors_header: any;
let outrumor$fortune_msg: any;

function init_rumors(fp: struct_dlb_handle | null): void {
  const true_count = new Int32Array(1);
  const false_count = new Int32Array(1);
  const eof_offset = new Float64Array(1);
  let line = new Int8Array(256);
  dlb_fgets(P(line), 256, fp);
  dlb_fgets(P(line), 256, fp);
  if (sscanf(P(line), P(init_rumors$rumors_header), P(true_count, 0), P(true_rumor_size, 0), P(true_rumor_start, 0), P(false_count, 0), P(false_rumor_size, 0), P(false_rumor_start, 0), P(eof_offset, 0)) === 7 && true_rumor_size[0] > 0 && false_rumor_size[0] > 0) {
    true_rumor_end = true_rumor_start[0] + true_rumor_size[0];
    false_rumor_end = false_rumor_start[0] + false_rumor_size[0];
  } else {
    true_rumor_size[0] = -1;
    dlb_fclose(fp);
  }
}

export async function getrumor(truth: number, rumor_buf: Ptr | null, exclude_cookie: number): Promise<Ptr | null> {
  let rumors = null;
  let tidbit = 0;
  let beginning = 0;
  let endp = null;
  let line = new Int8Array(256);
  let xbuf = new Int8Array(256);
  rumor_buf.a[rumor_buf.o] = 0;
  if (true_rumor_size[0] < 0) {
    return rumor_buf;
  }
  rumors = await dlb_fopen(S("rumors"), S("r"));
  if (rumors) {
    let count = 0;
    let adjtruth = 0;
    do {
      rumor_buf.a[rumor_buf.o] = 0;
      if (true_rumor_size[0] === 0) {
        init_rumors(rumors);
        if (true_rumor_size[0] < 0) {
          sprintf(rumor_buf, S("Error reading \"%.80s\"."), S("rumors"));
          return rumor_buf;
        }
      }
      switch (adjtruth = truth + rn2(2)) {
      case 2:
      case 1:
        beginning = true_rumor_start[0];
        tidbit = rn2(true_rumor_size[0] | 0);
        break;
      case 0:
      case -1:
        beginning = false_rumor_start[0];
        tidbit = rn2(false_rumor_size[0] | 0);
        break;
      default:
        await impossible(S("strange truth value for rumor"));
        return strcpy(rumor_buf, S("Oops..."));
      }
      dlb_fseek(rumors, beginning + tidbit, SEEK_SET);
      dlb_fgets(P(line), 256, rumors);
      if (!dlb_fgets(P(line), 256, rumors) || adjtruth > 0 && dlb_ftell(rumors) > true_rumor_end) {
        dlb_fseek(rumors, beginning, SEEK_SET);
        dlb_fgets(P(line), 256, rumors);
      }
      if (!!(endp = strchr(P(line), 10))) {
        endp.a[endp.o] = 0;
      }
      strcat(rumor_buf, xcrypt(P(line), P(xbuf)));
    } while (count++ < 50 && exclude_cookie && (strstri(rumor_buf, S("fortune")) || strstri(rumor_buf, S("pity"))));
    dlb_fclose(rumors);
    if (count >= 50) {
      await impossible(S("Can't find non-cookie rumor?"));
    } else if (!G.in_mklev) {
      await exercise(A_WIS, adjtruth > 0 ? 1 : 0);
    }
  } else {
    await couldnt_open_file(S("rumors"));
    true_rumor_size[0] = -1;
  }
  {
    let x = eos(rumor_buf).add(-1);
    while (x.o > rumor_buf.o && x.a[x.o] === 95) {
      x = x.add(-1);
    }
    $wr((x = x.add(1)), 0, 10);
    x.a[x.o] = 0;
  }
  return rumor_buf;
}

export async function rumor_check(): Promise<void> {
  let $g = 0;
  let rumors = null;
  let tmpwin = 0;
  let endp = null;
  let line = new Int8Array(256);
  let xbuf = new Int8Array(256);
  let rumor_buf = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      rumors = null;
      line = new Int8Array(256);
      xbuf = new Int8Array(256);
      rumor_buf = new Int8Array(256);
      if (!(true_rumor_size[0] < 0)) { $g = 2; continue $L; }
    case 1: // no_rumors
      await pline(S("rumors not accessible."));
      return;
    case 2:
      rumors = await dlb_fopen(S("rumors"), S("r"));
      if (rumors) {
        let ftell_rumor_start = 0;
        rumor_buf[0] = 0;
        if (true_rumor_size[0] === 0) {
          init_rumors(rumors);
          if (true_rumor_size[0] < 0) {
            rumors = null;
            { $g = 1; continue $L; }
          }
        }
        tmpwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
        sprintf(P(rumor_buf), S("T start=%06ld (%06lx), end=%06ld (%06lx), size=%06ld (%06lx)"), true_rumor_start[0], true_rumor_start[0], true_rumor_end, $u64(true_rumor_end), true_rumor_size[0], $u64(true_rumor_size[0]));
        await G.windowprocs.win_putstr(tmpwin, 0, P(rumor_buf));
        sprintf(P(rumor_buf), S("F start=%06ld (%06lx), end=%06ld (%06lx), size=%06ld (%06lx)"), false_rumor_start[0], false_rumor_start[0], false_rumor_end, $u64(false_rumor_end), false_rumor_size[0], $u64(false_rumor_size[0]));
        await G.windowprocs.win_putstr(tmpwin, 0, P(rumor_buf));
        rumor_buf[0] = 0;
        dlb_fseek(rumors, true_rumor_start[0], SEEK_SET);
        ftell_rumor_start = dlb_ftell(rumors);
        dlb_fgets(P(line), 256, rumors);
        if (!!(endp = strchr(P(line), 10))) {
          endp.a[endp.o] = 0;
        }
        sprintf(P(rumor_buf), S("T %06ld %s"), ftell_rumor_start, xcrypt(P(line), P(xbuf)));
        await G.windowprocs.win_putstr(tmpwin, 0, P(rumor_buf));
        while (dlb_fgets(P(line), 256, rumors) && dlb_ftell(rumors) < true_rumor_end) {
          continue;
        }
        if (!!(endp = strchr(P(line), 10))) {
          endp.a[endp.o] = 0;
        }
        sprintf(P(rumor_buf), S("  %6s %s"), S(""), xcrypt(P(line), P(xbuf)));
        await G.windowprocs.win_putstr(tmpwin, 0, P(rumor_buf));
        rumor_buf[0] = 0;
        dlb_fseek(rumors, false_rumor_start[0], SEEK_SET);
        ftell_rumor_start = dlb_ftell(rumors);
        dlb_fgets(P(line), 256, rumors);
        if (!!(endp = strchr(P(line), 10))) {
          endp.a[endp.o] = 0;
        }
        sprintf(P(rumor_buf), S("F %06ld %s"), ftell_rumor_start, xcrypt(P(line), P(xbuf)));
        await G.windowprocs.win_putstr(tmpwin, 0, P(rumor_buf));
        while (dlb_fgets(P(line), 256, rumors) && dlb_ftell(rumors) < false_rumor_end) {
          continue;
        }
        if (!!(endp = strchr(P(line), 10))) {
          endp.a[endp.o] = 0;
        }
        sprintf(P(rumor_buf), S("  %6s %s"), S(""), xcrypt(P(line), P(xbuf)));
        await G.windowprocs.win_putstr(tmpwin, 0, P(rumor_buf));
        dlb_fclose(rumors);
        await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
        await G.windowprocs.win_destroy_nhwindow(tmpwin);
      } else {
        await couldnt_open_file(S("rumors"));
        true_rumor_size[0] = -1;
      }
    }
    break;
  }
}

export async function get_rnd_text(fname: Ptr | null, buf: Ptr | null, rng: Function | null): Promise<Ptr | null> {
  let fh = null;
  buf.a[buf.o] = 0;
  fh = await dlb_fopen(fname, S("r"));
  if (fh) {
    let sizetxt = 0;
    let starttxt = 0;
    let endtxt = 0;
    let tidbit = 0;
    let endp = null;
    let line = new Int8Array(256);
    let xbuf = new Int8Array(256);
    dlb_fgets(P(line), 256, fh);
    dlb_fseek(fh, 0, SEEK_CUR);
    starttxt = dlb_ftell(fh);
    dlb_fseek(fh, 0, SEEK_END);
    endtxt = dlb_ftell(fh);
    sizetxt = endtxt - starttxt;
    if (sizetxt < 1) {
      return buf;
    }
    tidbit = await rng(sizetxt | 0);
    dlb_fseek(fh, starttxt + tidbit, SEEK_SET);
    dlb_fgets(P(line), 256, fh);
    if (!dlb_fgets(P(line), 256, fh)) {
      dlb_fseek(fh, starttxt, SEEK_SET);
      dlb_fgets(P(line), 256, fh);
    }
    if (!!(endp = strchr(P(line), 10))) {
      endp.a[endp.o] = 0;
    }
    strcat(buf, xcrypt(P(line), P(xbuf)));
    dlb_fclose(fh);
  } else {
    await couldnt_open_file(fname);
  }
  return buf;
}

export async function outrumor(truth: number, mechanism: number): Promise<void> {
  let line = null;
  let buf = new Int8Array(256);
  let reading = (mechanism === BY_COOKIE || mechanism === BY_PAPER ? 1 : 0) << 24 >> 24;
  if (reading) {
    if (is_fainted() && mechanism === BY_COOKIE) {
      return;
    } else if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
      if (mechanism === BY_COOKIE) {
        await pline(P(outrumor$fortune_msg));
      }
      await pline(S("What a pity that you cannot read it!"));
      return;
    }
  }
  line = await getrumor(truth, P(buf), reading ? FALSE : TRUE);
  if (!line.a[line.o]) {
    line = S("NetHack rumors file closed for renovation.");
  }
  switch (mechanism) {
  case 0:
    await pline(S("True to her word, the Oracle %ssays: "), !rn2(4) ? S("offhandedly ") : !rn2(3) ? S("casually ") : rn2(2) ? S("nonchalantly ") : S(""));
    await verbalize(S("%s"), line);
    return;
  case 1:
    await pline(P(outrumor$fortune_msg));
  case 2:
    await pline(S("It reads:"));
    break;
  }
  await pline(S("%s"), line);
}

async function init_oracles(fp: struct_dlb_handle | null): Promise<void> {
  let i = 0;
  let line = new Int8Array(256);
  const cnt = new Int32Array(1);
  cnt[0] = 0;
  dlb_fgets(P(line), 256, fp);
  dlb_fgets(P(line), 256, fp);
  if (sscanf(P(line), S("%5d\n"), P(cnt, 0)) === 1 && cnt[0] > 0) {
    oracle_cnt[0] = cnt[0] >>> 0;
    oracle_loc = P(new Float64Array(((cnt[0] >>> 0) * 8 >>> 0) / 8));
    for (i = 0; i < cnt[0]; ++i) {
      dlb_fgets(P(line), 256, fp);
      sscanf(P(line), S("%5lx\n"), oracle_loc.add(i));
    }
  }
  return;
}

export async function save_oracles(fd: number, mode: number): Promise<void> {
  if (mode & (1 | 2)) {
    await bwrite(fd, P(oracle_cnt, 0), 4);
    if (oracle_cnt[0]) {
      await bwrite(fd, oracle_loc, oracle_cnt[0] * 8 >>> 0);
    }
  }
  if (mode & 4) {
    if (oracle_cnt[0]) {
      free(oracle_loc);
      oracle_loc = null, oracle_cnt[0] = 0, oracle_flg = 0;
    }
  }
}

export async function restore_oracles(fd: number): Promise<void> {
  await mread(fd, P(oracle_cnt, 0), 4);
  if (oracle_cnt[0]) {
    oracle_loc = P(new Float64Array((oracle_cnt[0] * 8 >>> 0) / 8));
    await mread(fd, oracle_loc, oracle_cnt[0] * 8 >>> 0);
    oracle_flg = 1;
  }
}

export async function outoracle(special: number, delphi: number): Promise<void> {
  let $g = 0;
  let tmpwin = 0;
  let oracles = null;
  let oracle_idx = 0;
  let endp = null;
  let line = new Int8Array(80);
  let xbuf = new Int8Array(256);
  $L: for (;;) {
    switch ($g) {
    case 0:
      line = new Int8Array(80);
      xbuf = new Int8Array(256);
      if (oracle_flg < 0 || oracle_flg > 0 && oracle_cnt[0] === 0) {
        return;
      }
      oracles = await dlb_fopen(S("oracles"), S("r"));
      if (!oracles) { $g = 3; continue $L; }
      if (oracle_flg === 0) {
        await init_oracles(oracles);
        oracle_flg = 1;
        if (oracle_cnt[0] === 0) {
          { $g = 1; continue $L; }
        }
      }
      if (oracle_cnt[0] <= 1 && !special) {
        { $g = 1; continue $L; }
      }
      oracle_idx = special ? 0 : rnd((oracle_cnt[0] | 0) - 1);
      dlb_fseek(oracles, oracle_loc.a[oracle_loc.o + oracle_idx], SEEK_SET);
      if (!special) {
        oracle_loc.a[oracle_loc.o + oracle_idx] = oracle_loc.a[oracle_loc.o + (oracle_cnt[0] = oracle_cnt[0] - 1 >>> 0)];
      }
      tmpwin = await G.windowprocs.win_create_nhwindow(NHW_TEXT);
      if (delphi) {
        await G.windowprocs.win_putstr(tmpwin, 0, special ? S("The Oracle scornfully takes all your money and says:") : S("The Oracle meditates for a moment and then intones:"));
      } else {
        await G.windowprocs.win_putstr(tmpwin, 0, S("The message reads:"));
      }
      await G.windowprocs.win_putstr(tmpwin, 0, S(""));
      while (dlb_fgets(P(line), COLNO, oracles) && strcmp(P(line), S("---\n"))) {
        if (!!(endp = strchr(P(line), 10))) {
          endp.a[endp.o] = 0;
        }
        await G.windowprocs.win_putstr(tmpwin, 0, xcrypt(P(line), P(xbuf)));
      }
      await G.windowprocs.win_display_nhwindow(tmpwin, TRUE);
      await G.windowprocs.win_destroy_nhwindow(tmpwin);
    case 1: // close_oracles
      dlb_fclose(oracles);
      { $g = 2; continue $L; }
    case 3:
      {
        await couldnt_open_file(S("oracles"));
        oracle_flg = -1;
      }
    case 2:
    }
    break;
  }
}

export async function doconsult(oracl: struct_monst | null): Promise<number> {
  let umoney = 0;
  let u_pay = 0;
  let minor_cost = 50;
  let major_cost = 500 + 50 * G.u.ulevel;
  let add_xpts = 0;
  let qbuf = new Int8Array(128);
  G.multi = 0;
  umoney = money_cnt(G.invent);
  if (!oracl) {
    await There(S("is no one here to consult."));
    return 0;
  } else if (!oracl.mpeaceful) {
    await pline(S("%s is in no mood for consultations."), await Monnam(oracl));
    return 0;
  } else if (!umoney) {
    await You(S("have no money."));
    return 0;
  }
  sprintf(P(qbuf), S("\"Wilt thou settle for a minor consultation?\" (%d %s)"), minor_cost, await currency(minor_cost));
  switch (await yn_function(P(qbuf), P(G.ynqchars), 113)) {
  default:
  case 113:
    return 0;
  case 121:
    if (umoney < minor_cost) {
      await You(S("don't even have enough money for that!"));
      return 0;
    }
    u_pay = minor_cost;
    break;
  case 110:
    if (umoney <= minor_cost || (oracle_cnt[0] === 1 || oracle_flg < 0)) {
      return 0;
    }
    sprintf(P(qbuf), S("\"Then dost thou desire a major one?\" (%d %s)"), major_cost, await currency(major_cost));
    if (await yn_function(P(qbuf), P(G.ynchars), 110) !== 121) {
      return 0;
    }
    u_pay = umoney < major_cost ? umoney | 0 : major_cost;
    break;
  }
  await money2mon(oracl, u_pay);
  G.context.botl = 1;
  add_xpts = 0;
  if (u_pay === minor_cost) {
    await outrumor(1, BY_ORACLE);
    if (!G.u.uevent.minor_oracle) {
      add_xpts = u_pay / (G.u.uevent.major_oracle | 0 ? 25 : 10) | 0;
    }
    G.u.uevent.minor_oracle = (TRUE) & 1;
  } else {
    let cheapskate = (u_pay < major_cost ? 1 : 0) << 24 >> 24;
    await outoracle(cheapskate, TRUE);
    if (!cheapskate && !G.u.uevent.major_oracle) {
      add_xpts = u_pay / (G.u.uevent.minor_oracle | 0 ? 25 : 10) | 0;
    }
    G.u.uevent.major_oracle = (TRUE) & 1;
    await exercise(A_WIS, !cheapskate ? 1 : 0);
  }
  if (add_xpts) {
    await more_experienced(add_xpts, u_pay / 50 | 0);
    await newexplevel();
  }
  return 1;
}

async function couldnt_open_file(filename: Ptr | null): Promise<void> {
  let save_something = G.program_state.something_worth_saving;
  if (!G.iflags.debug_fuzzer) {
    G.program_state.something_worth_saving = 0;
  }
  await impossible(S("Can't open '%s' file."), filename);
  G.program_state.something_worth_saving = save_something;
}

export function $init(): void {
  true_rumor_size = new Float64Array(1);
  true_rumor_size[0] = 0;
  false_rumor_size = new Float64Array(1);
  false_rumor_size[0] = 0;
  true_rumor_start = new Float64Array(1);
  true_rumor_start[0] = 0;
  false_rumor_start = new Float64Array(1);
  false_rumor_start[0] = 0;
  true_rumor_end = 0;
  false_rumor_end = 0;
  oracle_flg = 0;
  oracle_cnt = new Uint32Array(1);
  oracle_cnt[0] = 0;
  oracle_loc = null;
  init_rumors$rumors_header = $cs("%d,%ld,%lx;%d,%ld,%lx;0,0,%lx\n", 31);
  outrumor$fortune_msg = $cs("This cookie has a scrap of paper inside.", 41);
}
