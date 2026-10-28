// @ts-nocheck
// NetHack 3.6.7 mail.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { dupstr } from './alloc.ts';
import { isok } from './cmd.ts';
import { flush_screen, newsym } from './display.ts';
import { oname } from './do_name.ts';
import { nh_terminate } from './end.ts';
import { debugcore } from './files.ts';
import { dist2 } from './hacklib.ts';
import { hold_another_object } from './invent.ts';
import { makemon } from './makemon.ts';
import { mksobj, new_omailcmd } from './mkobj.ts';
import { mongone } from './mon.ts';
import { accessible } from './monmove.ts';
import { nh_getenv } from './options.ts';
import { pline, verbalize } from './pline.ts';
import { rn2 } from './rnd.ts';
import { Hello } from './role.ts';
import { place_monster } from './steed.ts';
import { enexto } from './teleport.ts';
import { child } from './unixunix.ts';
import { struct_mail_info, struct_monst, struct_nhcoord, struct_obj, struct_stat } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, execl, free, getpwuid, getuid, stat, strcat, strcpy, strlen } from './rt/index.ts';
import { BLINDED, DBWALL, EXIT_FAILURE, FALSE, MAILCKFREQ, MSG_MAIL, MSG_OTHER, NO_MM_FLAGS, PM_MAIL_DAEMON, ROWNO, SCR_MAIL, TELEPAT, TRUE } from './consts.ts';

let omstat: struct_stat;
let nmstat: struct_stat;
let mailbox: Ptr | null;
let laststattime: number;
let mail_text: any;
let ckmailstatus$deliver: struct_mail_info;

export function free_maildata(): void {
  if (mailbox) {
    free(mailbox), mailbox = null;
  }
}

export async function getmailstatus(): Promise<void> {
  if (mailbox) {
    ;
  } else if (!!(mailbox = nh_getenv(S("MAIL")))) {
    mailbox = await dupstr(mailbox);
  } else {
    let pw_name = getpwuid(getuid()).pw_name;
    mailbox = P(new Int8Array((strlen(pw_name) + 17 >>> 0)));
    strcpy(mailbox, S("/var/spool/mail/"));
    strcat(mailbox, pw_name);
  }
  do {
    if (await debugcore(S("mail.c"), 1)) {
      await pline(S("mailbox=%c%s%c"), mailbox ? 34 : 60, mailbox ? mailbox : S("null"), mailbox ? 34 : 62);
    }
  } while (0);
  if (mailbox && stat(mailbox, omstat)) {
    omstat.st_mtim.tv_sec = 0;
  }
}

async function md_start(startp: struct_nhcoord | null): Promise<number> {
  let $g = 0;
  let testcc = new struct_nhcoord();
  let row = 0;
  let lax = 0;
  let dd = 0;
  let max_distance = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      testcc = new struct_nhcoord();
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic)) {
        if (!await enexto(startp, G.u.ux, G.u.uy, null)) {
          return FALSE;
        }
        return TRUE;
      }
      if ($rd(G.viz_array.a[G.viz_array.o + G.upstair.sy], G.upstair.sx) & 1) {
        startp.x = G.upstair.sx;
        startp.y = G.upstair.sy;
        return TRUE;
      }
      if ($rd(G.viz_array.a[G.viz_array.o + G.dnstair.sy], G.dnstair.sx) & 1) {
        startp.x = G.dnstair.sx;
        startp.y = G.dnstair.sy;
        return TRUE;
      }
      lax = 0;
      max_distance = -1;
    case 1: // retry
      for (row = 0; row < ROWNO; ++row) {
        if (G.viz_rmin.a[G.viz_rmin.o + row] < G.viz_rmax.a[G.viz_rmax.o + row]) {
          dd = dist2(G.viz_rmin.a[G.viz_rmin.o + row], row, G.u.ux, G.u.uy);
          if (dd > max_distance) {
            if (lax) {
              max_distance = dd;
              startp.y = row << 24 >> 24;
              startp.x = G.viz_rmin.a[G.viz_rmin.o + row];
            } else if (await enexto(testcc, G.viz_rmin.a[G.viz_rmin.o + row], row, null) && !($rd(G.viz_array.a[G.viz_array.o + testcc.y], testcc.x) & 2) && $rd(G.viz_array.a[G.viz_array.o + testcc.y], testcc.x) & 1) {
              max_distance = dd;
              startp.$cp(testcc);
            }
          }
          dd = dist2(G.viz_rmax.a[G.viz_rmax.o + row], row, G.u.ux, G.u.uy);
          if (dd > max_distance) {
            if (lax) {
              max_distance = dd;
              startp.y = row << 24 >> 24;
              startp.x = G.viz_rmax.a[G.viz_rmax.o + row];
            } else if (await enexto(testcc, G.viz_rmax.a[G.viz_rmax.o + row], row, null) && !($rd(G.viz_array.a[G.viz_array.o + testcc.y], testcc.x) & 2) && $rd(G.viz_array.a[G.viz_array.o + testcc.y], testcc.x) & 1) {
              max_distance = dd;
              startp.$cp(testcc);
            }
          }
        }
      }
      if (max_distance < 0) {
        if (!lax) {
          lax = 1;
          { $g = 1; continue $L; }
        }
        return FALSE;
      }
      return TRUE;
    }
    break;
  }
}

async function md_stop(stopp: struct_nhcoord | null, startp: struct_nhcoord | null): Promise<number> {
  let x = 0;
  let y = 0;
  let distance = 0;
  let min_distance = -1;
  for (x = G.u.ux - 1; x <= G.u.ux + 1; ++x) {
    for (y = G.u.uy - 1; y <= G.u.uy + 1; ++y) {
      if (!isok(x, y) || x === G.u.ux && y === G.u.uy) {
        continue;
      }
      if (accessible(x, y) && !!!G.level.monsters[x][y]) {
        distance = dist2(x, y, startp.x, startp.y);
        if (min_distance < 0 || distance < min_distance || distance === min_distance && rn2(2)) {
          stopp.x = x << 24 >> 24;
          stopp.y = y << 24 >> 24;
          min_distance = distance;
        }
      }
    }
  }
  if (min_distance < 0 && !await enexto(stopp, G.u.ux, G.u.uy, $sat(G.mons, PM_MAIL_DAEMON))) {
    return FALSE;
  }
  return TRUE;
}

async function md_rush(md: struct_monst | null, tx: number, ty: number): Promise<number> {
  let mon = null;
  let dx = 0;
  let dy = 0;
  let fx = md.mx;
  let fy = md.my;
  let nfx = fx;
  let nfy = fy;
  let d1 = 0;
  let d2 = 0;
  if ((!!G.level.monsters[fx][fy] ? G.level.monsters[fx][fy] : null) === md) {
    G.level.monsters[fx][fy] = null;
    await newsym(fx, fy);
  }
  while (1) {
    d1 = dist2(fx, fy, tx, ty);
    for (dx = -1; dx <= 1; ++dx) {
      for (dy = -1; dy <= 1; ++dy) {
        if ((dx || dy) && isok(fx + dx, fy + dy) && !($at2(G.level.locations, fx + dx, fy + dy).typ <= DBWALL)) {
          d2 = dist2(fx + dx, fy + dy, tx, ty);
          if (d2 < d1) {
            d1 = d2;
            nfx = fx + dx;
            nfy = fy + dy;
          }
        }
      }
    }
    if (nfx === fx && nfy === fy) {
      break;
    }
    fx = nfx;
    fy = nfy;
    if (fx === tx && fy === ty) {
      break;
    }
    if (!!(mon = !!G.level.monsters[fx][fy] ? G.level.monsters[fx][fy] : null)) {
      await verbalize(S("%s"), mail_text[rn2(3)]);
    } else if (fx === G.u.ux && fy === G.u.uy) {
      await verbalize(S("Excuse me."));
    }
    if (mon) {
      G.level.monsters[fx][fy] = null;
    }
    await place_monster(md, fx, fy);
    await newsym(fx, fy);
    await flush_screen(0);
    await G.windowprocs.win_delay_output();
    G.level.monsters[fx][fy] = null;
    if (mon) {
      if (mon.mx !== fx || mon.my !== fy) {
        G.level.monsters[fx][fy] = mon;
      } else {
        await place_monster(mon, fx, fy);
      }
    }
    await newsym(fx, fy);
  }
  if (!!(mon = !!G.level.monsters[fx][fy] ? G.level.monsters[fx][fy] : null)) {
    G.level.monsters[fx][fy] = null;
    await place_monster(md, fx, fy);
    await newsym(fx, fy);
    await verbalize(S("This place's too crowded.  I'm outta here."));
    G.level.monsters[fx][fy] = null;
    if (mon.mx !== fx || mon.my !== fy) {
      G.level.monsters[fx][fy] = mon;
    } else {
      await place_monster(mon, fx, fy);
    }
    await newsym(fx, fy);
    return FALSE;
  }
  await place_monster(md, fx, fy);
  await newsym(fx, fy);
  await flush_screen(0);
  await G.windowprocs.win_delay_output();
  return TRUE;
}

async function newmail(info: struct_mail_info | null): Promise<void> {
  let $g = 0;
  let md = null;
  let start = new struct_nhcoord();
  let stop = new struct_nhcoord();
  let message_seen = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      start = new struct_nhcoord();
      stop = new struct_nhcoord();
      message_seen = FALSE;
      if (!await md_start(start) || !await md_stop(stop, start)) {
        { $g = 1; continue $L; }
      }
      if (!(md = await makemon($sat(G.mons, PM_MAIL_DAEMON), start.x, start.y, NO_MM_FLAGS))) {
        { $g = 1; continue $L; }
      }
      if (!await md_rush(md, stop.x, stop.y)) {
        { $g = 2; continue $L; }
      }
      message_seen = TRUE;
      await verbalize(S("%s, %s!  %s."), Hello(md), P(G.plname), info.display_txt);
      if (info.message_typ) {
        let obj = await mksobj(SCR_MAIL, FALSE, FALSE);
        if (info.object_nam) {
          obj = await oname(obj, info.object_nam);
        }
        if (info.response_cmd) {
          await new_omailcmd(obj, info.response_cmd);
        }
        if (dist2(md.mx, md.my, G.u.ux, G.u.uy) > 2) {
          await verbalize(S("Catch!"));
        }
        await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
        obj = await hold_another_object(obj, S("Oops!"), null, null);
        ;
      }
    case 2: // go_back
      if (!await md_rush(md, start.x, start.y)) {
        md.mx = md.my = 0;
      }
      await mongone(md);
    case 1: // give_up
      if (!message_seen && info.message_typ === MSG_OTHER) {
        await pline(S("Hark!  \"%s.\""), info.display_txt);
      }
    }
    break;
  }
}

export async function ckmailstatus(): Promise<void> {
  ck_server_admin_msg();
  if (!mailbox || G.u.uswallow | 0 || !G.flags.biff || G.moves < laststattime + MAILCKFREQ) {
    return;
  }
  laststattime = G.moves;
  if (stat(mailbox, nmstat)) {
    nmstat.st_mtim.tv_sec = 0;
  } else if (nmstat.st_mtim.tv_sec > omstat.st_mtim.tv_sec) {
    if (nmstat.st_size) {
      await newmail(ckmailstatus$deliver);
    }
    await getmailstatus();
  }
}

export function ck_server_admin_msg(): void {
}

export async function readmail(otmp: struct_obj | null): Promise<void> {
  let mr = null;
  if (G.iflags.debug_fuzzer) {
    return;
  }
  await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
  if (!(mr = nh_getenv(S("MAILREADER")))) {
    mr = S("/bin/mail");
  }
  if (await child(1)) {
    execl(mr, mr, null);
    await nh_terminate(EXIT_FAILURE);
  }
  await getmailstatus();
}

export function $init(): void {
  omstat = new struct_stat();
  nmstat = new struct_stat();
  mailbox = null;
  laststattime = 0;
  mail_text = [S("Gangway!"), S("Look out!"), S("Pardon me!")];
  ckmailstatus$deliver = struct_mail_info.$of(MSG_MAIL, S("I have some mail for you"));
}
