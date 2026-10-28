// @ts-nocheck
// NetHack 3.6.7 write.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { exercise } from './attrib.ts';
import { dropx } from './do.ts';
import { fingers_or_gloves } from './do_wear.ts';
import { wipeout_text } from './engrave.ts';
import { mungspaces, strncmpi, strstri, upstart } from './hacklib.ts';
import { getobj, hold_another_object, update_inventory, useup } from './invent.ts';
import { bcsign, mksobj } from './mkobj.ts';
import { The, Tobjnam, aobjnam, ysimple_name } from './objnam.ts';
import { There, You, You_cant, Your, impossible, pline, pline_The } from './pline.ts';
import { rn2, rnl } from './rnd.ts';
import { check_unpaid, obfree } from './shk.ts';
import { struct_obj } from './structs.ts';
import { $ta, G, P, S, sprintf, strcpy, strncpy } from './rt/index.ts';
import { A_WIS, BLINDED, FALSE, GLIB, MAXULEV, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_MAIL, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_NOVEL, TRUE } from './consts.ts';

let write_on: any;
let new_book_description$compositions: any;

async function cost(otmp: struct_obj | null): Promise<number> {
  if (otmp.oclass === SPBOOK_CLASS) {
    return 10 * G.objects[otmp.otyp].oc_oc2;
  }
  switch (otmp.otyp) {
  case 339:
    return 2;
  case 307:
  case 309:
  case 310:
  case 312:
  case 313:
  case 314:
  case 315:
    return 8;
  case 299:
  case 304:
  case 316:
    return 10;
  case 300:
    return 12;
  case 311:
    return 14;
  case 298:
  case 302:
  case 303:
  case 317:
    return 16;
  case 301:
  case 318:
  case 305:
  case 308:
    return 20;
  case 306:
    return 30;
  case 340:
  default:
    await impossible(S("You can't write such a weird scroll!"));
  }
  return 1000;
}

function label_known(scrolltype: number, objlist: struct_obj | null): number {
  let otmp = null;
  if (G.objects[scrolltype].oc_class !== SCROLL_CLASS) {
    return FALSE;
  }
  if (G.objects[scrolltype].oc_name_known | 0 || G.objects[scrolltype].oc_uname) {
    return TRUE;
  }
  for (otmp = objlist; otmp; otmp = otmp.nobj) {
    if (otmp.otyp === scrolltype && otmp.dknown | 0) {
      return TRUE;
    }
    if (!!otmp.cobj && otmp.cknown | 0 && label_known(scrolltype, otmp.cobj)) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function dowrite(pen: struct_obj | null): Promise<number> {
  let $g = 0;
  let paper = null;
  let namebuf = new Int8Array(256);
  let nm = null;
  let bp = null;
  let new_obj = null;
  let basecost = 0;
  let actualcost = 0;
  let curseval = 0;
  let qbuf = new Int8Array(128);
  let first = 0;
  let last = 0;
  let i = 0;
  let deferred = 0;
  let deferralchance = 0;
  let by_descr = 0;
  let typeword = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      namebuf = new Int8Array(256);
      qbuf = new Int8Array(128);
      by_descr = FALSE;
      if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
        await You(S("need hands to be able to write!"));
        return 0;
      } else if (G.u.uprops[GLIB].intrinsic) {
        await pline(S("%s from your %s."), await Tobjnam(pen, S("slip")), await fingers_or_gloves(FALSE));
        await dropx(pen);
        return 1;
      }
      paper = await getobj(P(write_on), S("write on"));
      if (!paper) {
        return 0;
      }
      typeword = paper.otyp === SPE_NOVEL ? S("book") : paper.oclass === SPBOOK_CLASS ? S("spellbook") : S("scroll");
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        if (!paper.dknown) {
          await You(S("don't know if that %s is blank or not."), typeword);
          return 0;
        } else if (paper.oclass === SPBOOK_CLASS) {
          await pline(S("%s can't create braille text."), upstart(await ysimple_name(pen)));
          return 0;
        }
      }
      paper.dknown = 1;
      if (paper.otyp !== SCR_BLANK_PAPER && paper.otyp !== SPE_BLANK_PAPER) {
        await pline(S("That %s is not blank!"), typeword);
        await exercise(A_WIS, FALSE);
        return 1;
      }
      sprintf(P(qbuf), S("What type of %s do you want to write?"), typeword);
      await G.windowprocs.win_getlin(P(qbuf), P(namebuf));
      mungspaces(P(namebuf));
      if (namebuf[0] === 27 || !namebuf[0]) {
        return 1;
      }
      nm = P(namebuf);
      if (!strncmpi(nm, S("scroll "), 7)) {
        nm = nm.add(7);
      } else if (!strncmpi(nm, S("spellbook "), 10)) {
        nm = nm.add(10);
      }
      if (!strncmpi(nm, S("of "), 3)) {
        nm = nm.add(3);
      }
      if (!!(bp = strstri(nm, S(" armour")))) {
        strncpy(bp, S(" armor "), 7);
        mungspaces(bp.add(1));
      }
      deferred = 0;
      deferralchance = 0;
      first = G.bases[paper.oclass];
      last = G.bases[paper.oclass + 1] - 1;
      for (i = first; i <= last; ++i) {
        if (!G.obj_descr[G.objects[i].oc_name_idx].oc_name) {
          continue;
        }
        if (!strncmpi(G.obj_descr[G.objects[i].oc_name_idx].oc_name, nm, -1)) {
          { $g = 1; continue $L; }
        }
        if (!strncmpi(G.obj_descr[G.objects[i].oc_descr_idx].oc_descr, nm, -1)) {
          by_descr = TRUE;
          { $g = 1; continue $L; }
        }
        if (G.objects[i].oc_uname && !strncmpi(G.objects[i].oc_uname, nm, -1) && !rn2(++deferralchance)) {
          deferred = i;
        }
      }
      if (deferred) {
        i = deferred;
        by_descr = TRUE;
        { $g = 1; continue $L; }
      }
      await There(S("is no such %s!"), typeword);
      return 1;
    case 1: // found
      if (i === SCR_BLANK_PAPER || i === SPE_BLANK_PAPER) {
        await You_cant(S("write that!"));
        await pline(S("It's obscene!"));
        return 1;
      } else if (i === SPE_BOOK_OF_THE_DEAD) {
        await pline(S("No mere dungeon adventurer could write that."));
        return 1;
      } else if (by_descr && paper.oclass === SPBOOK_CLASS && !G.objects[i].oc_name_known) {
        await pline(S("Unfortunately you don't have enough information to go on."));
        return 1;
      }
      ++G.u.uconduct.literate;
      new_obj = await mksobj(i, FALSE, FALSE);
      new_obj.bknown = ((paper.bknown | 0 && pen.bknown | 0 ? 1 : 0) >>> 0) & 1;
      await check_unpaid(pen);
      basecost = await cost(new_obj);
      if (pen.spe < (basecost / 2 | 0)) {
        await Your(S("marker is too dry to write that!"));
        await obfree(new_obj, null);
        return 1;
      }
      actualcost = rn2(basecost / 2 | 0) + (basecost / 2 | 0);
      curseval = bcsign(pen) + bcsign(paper);
      await exercise(A_WIS, TRUE);
      if (pen.spe < actualcost) {
        pen.spe = 0;
        await Your(S("marker dries out!"));
        if (paper.oclass === SPBOOK_CLASS) {
          await pline_The(S("spellbook is left unfinished and your writing fades."));
          update_inventory();
        } else {
          await pline_The(S("scroll is now useless and disappears!"));
          await useup(paper);
        }
        await obfree(new_obj, null);
        return 1;
      }
      pen.spe = pen.spe - actualcost << 24 >> 24;
      if (!G.objects[new_obj.otyp].oc_name_known && !(by_descr && label_known(new_obj.otyp, G.invent)) && rnl(G.urole.malenum === 342 ? 5 : 15)) {
        await You(S("%s to write that."), by_descr ? S("fail") : S("don't know how"));
        if (paper.oclass === SPBOOK_CLASS) {
          await You(S("write in your best handwriting:  \"My Diary\", but it quickly fades."));
          update_inventory();
        } else {
          if (by_descr) {
            strcpy(P(namebuf), G.obj_descr[G.objects[new_obj.otyp].oc_descr_idx].oc_descr);
            wipeout_text(P(namebuf), (6 + MAXULEV - G.u.ulevel) / 6 | 0, 0);
          } else {
            sprintf(P(namebuf), S("%s was here!"), P(G.plname));
          }
          await You(S("write \"%s\" and the scroll disappears."), P(namebuf));
          await useup(paper);
        }
        await obfree(new_obj, null);
        return 1;
      }
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && rnl(3)) {
        await You(S("fail to write the scroll correctly and it disappears."));
        await useup(paper);
        await obfree(new_obj, null);
        return 1;
      }
      await useup(paper);
      if (new_obj.oclass === SPBOOK_CLASS) {
        await pline_The(S("spellbook warps strangely, then turns %s."), new_book_description(new_obj.otyp, P(namebuf)));
      }
      new_obj.blessed = ((curseval > 0 ? 1 : 0) >>> 0) & 1;
      new_obj.cursed = ((curseval < 0 ? 1 : 0) >>> 0) & 1;
      if (new_obj.otyp === SCR_MAIL) {
        new_obj.spe = 2;
      }
      new_obj.dknown = ((label_known(new_obj.otyp, G.invent) ? 1 : 0) >>> 0) & 1;
      new_obj = await hold_another_object(new_obj, S("Oops!  %s out of your grasp!"), await The(await aobjnam(new_obj, S("slip"))), null);
      ;
      return 1;
    }
    break;
  }
}

function new_book_description(booktype: number, outbuf: Ptr | null): Ptr | null {
  let descr = null;
  let comp_p = null;
  descr = G.obj_descr[G.objects[booktype].oc_descr_idx].oc_descr;
  for (comp_p = P(new_book_description$compositions); comp_p.a[comp_p.o]; comp_p = comp_p.add(1)) {
    if (!strncmpi(descr, comp_p.a[comp_p.o], -1)) {
      break;
    }
  }
  sprintf(outbuf, S("%s%s"), comp_p.a[comp_p.o] ? S("into ") : S(""), descr);
  return outbuf;
}

export function $init(): void {
  write_on = $ta(Int8Array, 3, [SCROLL_CLASS, SPBOOK_CLASS]);
  new_book_description$compositions = [S("parchment"),
S("vellum"),
S("cloth"),
null];
}
