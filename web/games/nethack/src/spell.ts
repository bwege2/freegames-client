// @ts-nocheck
// NetHack 3.6.7 spell.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { jump } from './apply.ts';
import { acurr, exercise, losestr } from './attrib.ts';
import { getdir, isok, set_occupation, yn_function } from './cmd.ts';
import { do_vicinity_map } from './detect.ts';
import { shieldeff } from './display.ts';
import { docall, getpos, hcolor, hliquid, noveltitle } from './do_name.ts';
import { find_ac } from './do_wear.ts';
import { make_familiar, tamedog } from './dog.ts';
import { walk_path } from './dothrow.ts';
import { On_stairs, on_level } from './dungeon.ts';
import { morehungry } from './eat.ts';
import { freehand } from './engrave.ts';
import { more_experienced, newexplevel } from './exper.ts';
import { explode } from './explode.ts';
import { read_tribute } from './files.ts';
import { check_capacity, invocation_pos, losehp, nomul } from './hack.ts';
import { dist2, distmin, isqrt, sgn, strncmpi } from './hacklib.ts';
import { update_inventory, useup } from './invent.ts';
import { makemon, set_malign } from './makemon.ts';
import { mkinvokearea } from './mklev.ts';
import { mksobj, weight } from './mkobj.ts';
import { mkundead } from './mkroom.ts';
import { can_chant } from './mondata.ts';
import { monflee } from './monmove.ts';
import { discover_object } from './o_init.ts';
import { an, makeplural } from './objnam.ts';
import { You, You_feel, You_hear, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part } from './polyself.ts';
import { healup, make_blinded, make_confused, make_slimed, make_stunned, peffects } from './potion.ts';
import { seffects } from './read.ts';
import { d, rn2, rnd, rnl } from './rnd.ts';
import { check_unpaid, obfree } from './shk.ts';
import { rndcurse, take_gold } from './sit.ts';
import { tele } from './teleport.ts';
import { fall_asleep } from './timeout.ts';
import { erode_obj } from './trap.ts';
import { use_skill } from './weapon.ts';
import { aggravate } from './wizard.ts';
import { worm_known } from './worm.ts';
import { spell_damage_bonus, unturn_dead, weffects, zapyourself } from './zap.ts';
import { struct_nhcoord, struct_obj, struct_spell, struct_tport_hideaway, union_any } from './structs.ts';
import { $at2, $cs, $rd, $sadd, $sarr, $sat, $wr, G, P, S, free, qsort, sprintf, strchr, strcmp, strcpy } from './rt/index.ts';
import { ADD_SPELL, ANTIMAGIC, ATR_NONE, A_INT, A_STR, A_WIS, BELL_OF_OPENING, BLINDED, CANDELABRUM_OF_INVOCATION, CLAIRVOYANT, CLOUD, CONFUSION, CORNUTHAUM, DBWALL, DETECT_MONSTERS, DOOR, D_ISOPEN, EF_GREASE, EF_VERBOSE, ERODE_CORRODE, EXPL_FIERY, EXPL_FROSTY, EYE, FACE, FALSE, HALF_PHDAM, HEAD, HELM_OF_BRILLIANCE, HIDE_SPELL, INFRAVISION, IRON, KEEN, KILLED_BY_AN, LENSES, MAXSPELL, MAX_SPELL_STUDY, MENU_SELECTED, MENU_TRADITIONAL, MENU_UNSELECTED, MITHRIL, NHW_MENU, NODIR, NOOP_SPELL, NO_GLYPH, NO_KILLER_PREFIX, NO_MINVENT, NO_SPELL, PICK_NONE, PICK_ONE, PM_FOG_CLOUD, PM_MASTER_LICH, PM_NALFESHNEE, POISON_RES, POOL, P_ATTACK_SPELL, P_BASIC, P_CLERIC_SPELL, P_DIVINATION_SPELL, P_ENCHANTMENT_SPELL, P_ESCAPE_SPELL, P_EXPERT, P_HEALING_SPELL, P_MATTER_SPELL, P_SKILLED, P_UNSKILLED, REMOVESPELL, ROBE, SEE_INVIS, SICK, SLEEP_RES, SLIMED, SMALL_SHIELD, SORTBY_ALPHA, SORTBY_CURRENT, SORTBY_LETTER, SORTBY_LVL_HI, SORTBY_LVL_LO, SORTBY_SKL_AL, SORTBY_SKL_HI, SORTBY_SKL_LO, SORTRETAINORDER, SPELLMENU_CAST, SPELLMENU_SORT, SPELLMENU_VIEW, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_CONE_OF_COLD, SPE_CURE_BLINDNESS, SPE_CURE_SICKNESS, SPE_DETECT_FOOD, SPE_EXTRA_HEALING, SPE_HEALING, SPE_MAGIC_MISSILE, SPE_NOVEL, SPE_REMOVE_CURSE, SPE_RESTORE_ABILITY, SPE_TELEPORT_AWAY, SPINE, STONE, STUNNED, S_VORTEX, TELEPAT, TIMEOUT, TREE, TRUE, UNHIDESPELL, WARN_OF_MON, uarmfbon, uarmgbon, uarmhbon } from './consts.ts';

let explodes: any;
let spl_sortchoices: any;
let spl_sortmode: number;
let spl_orderindx: Ptr | null;
let tport_spell$save_tport: struct_tport_hideaway;

function spell_let_to_idx(ilet: number): number {
  let indx = 0;
  indx = ilet - 97;
  if (indx >= 0 && indx < 26) {
    return indx;
  }
  indx = ilet - 65;
  if (indx >= 0 && indx < 26) {
    return indx + 26;
  }
  return -1;
}

async function cursed_book(bp: struct_obj | null): Promise<number> {
  let was_in_use = 0;
  let lev = G.objects[bp.otyp].oc_oc2;
  let dmg = 0;
  switch (rn2(lev)) {
  case 0:
    await You_feel(S("a wrenching sensation."));
    await tele();
    break;
  case 1:
    await You_feel(S("threatened."));
    await aggravate();
    break;
  case 2:
    await make_blinded(G.u.uprops[BLINDED].intrinsic + (rn2(100) + 250), TRUE);
    break;
  case 3:
    await take_gold();
    break;
  case 4:
    await pline(S("These runes were just too much to comprehend."));
    await make_confused(G.u.uprops[CONFUSION].intrinsic + (rn2(7) + 16), FALSE);
    break;
  case 5:
    await pline_The(S("book was coated with contact poison!"));
    if (G.uarmg) {
      await erode_obj(G.uarmg, S("gloves"), ERODE_CORRODE, EF_GREASE | EF_VERBOSE);
      break;
    }
    was_in_use = bp.in_use << 24 >> 24;
    bp.in_use = (FALSE) & 1;
    await losestr(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic ? rn2(2) + 1 : rn2(4) + 3);
    await losehp(rnd(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic ? 6 : 10), S("contact-poisoned spellbook"), KILLED_BY_AN);
    bp.in_use = (was_in_use >>> 0) & 1;
    break;
  case 6:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline_The(S("book %s, but you are unharmed!"), P(explodes));
    } else {
      await pline(S("As you read the book, it %s in your %s!"), P(explodes), body_part(FACE));
      dmg = 2 * rnd(10) + 5;
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("exploding rune"), KILLED_BY_AN);
    }
    return TRUE;
  default:
    await rndcurse();
    break;
  }
  return FALSE;
}

async function confused_book(spellbook: struct_obj | null): Promise<number> {
  let gone = FALSE;
  if (!rn2(3) && spellbook.otyp !== SPE_BOOK_OF_THE_DEAD) {
    spellbook.in_use = (TRUE) & 1;
    await pline(S("Being confused you have difficulties in controlling your actions."));
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    await You(S("accidentally tear the spellbook to pieces."));
    if (!G.objects[spellbook.otyp].oc_name_known && !G.objects[spellbook.otyp].oc_uname) {
      await docall(spellbook);
    }
    await useup(spellbook);
    gone = TRUE;
  } else {
    await You(S("find yourself reading the %s line over and over again."), spellbook === G.context.spbook.book ? S("next") : S("first"));
  }
  return gone;
}

async function deadbook(book2: struct_obj | null): Promise<void> {
  let $g = 0;
  let mtmp = null;
  let mtmp2 = null;
  let mm = new struct_nhcoord();
  $L: for (;;) {
    switch ($g) {
    case 0:
      mm = new struct_nhcoord();
      await You(S("turn the pages of the Book of the Dead..."));
      await discover_object(383, 1, 1);
      book2.known = 1;
      if (invocation_pos(G.u.ux, G.u.uy) && !On_stairs(G.u.ux, G.u.uy)) {
        let otmp = null;
        let arti1_primed = FALSE;
        let arti2_primed = FALSE;
        let arti_cursed = FALSE;
        if (book2.cursed) {
          await pline_The(S("runes appear scrambled.  You can't read them!"));
          return;
        }
        if (!G.u.uhave.bell || !G.u.uhave.menorah) {
          await pline(S("A chill runs down your %s."), body_part(SPINE));
          if (!G.u.uhave.bell) {
            await You_hear(S("a faint chime..."));
          }
          if (!G.u.uhave.menorah) {
            await pline(S("Vlad's doppelganger is amused."));
          }
          return;
        }
        for (otmp = G.invent; otmp; otmp = otmp.nobj) {
          if (otmp.otyp === CANDELABRUM_OF_INVOCATION && otmp.spe === 7 && otmp.lamplit | 0) {
            if (!otmp.cursed) {
              arti1_primed = TRUE;
            } else {
              arti_cursed = TRUE;
            }
          }
          if (otmp.otyp === BELL_OF_OPENING && G.moves - otmp.age < 5) {
            if (!otmp.cursed) {
              arti2_primed = TRUE;
            } else {
              arti_cursed = TRUE;
            }
          }
        }
        if (arti_cursed) {
          await pline_The(S("invocation fails!"));
          await pline(S("At least one of your artifacts is cursed..."));
        } else if (arti1_primed && arti2_primed) {
          let soon = d(2, 6) >>> 0;
          await mkinvokearea();
          G.u.uevent.invoked = 1;
          G.u.uevent.udemigod = 1;
          if (!G.u.udg_cnt || G.u.udg_cnt > soon) {
            G.u.udg_cnt = soon;
          }
        } else {
          await You(S("have a feeling that %s is amiss..."), G.c_common_strings.c_something);
          { $g = 1; continue $L; }
        }
        return;
      }
      if (!book2.cursed) { $g = 3; continue $L; }
    case 1: // raise_dead
      await You(S("raised the dead!"));
      if (!rn2(3) && (!!(mtmp = await makemon($sat(G.mons, PM_MASTER_LICH), G.u.ux, G.u.uy, NO_MINVENT)) || !!(mtmp = await makemon($sat(G.mons, PM_NALFESHNEE), G.u.ux, G.u.uy, NO_MINVENT)))) {
        mtmp.mpeaceful = 0;
        set_malign(mtmp);
      }
      await unturn_dead(G.youmonst);
      mm.x = G.u.ux;
      mm.y = G.u.uy;
      await mkundead(mm, TRUE, NO_MINVENT);
      { $g = 2; continue $L; }
    case 3:
      if (book2.blessed) {
        for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
          mtmp2 = mtmp.nmon;
          if (mtmp.mhp < 1) {
            continue;
          }
          if (((mtmp.data.mflags2 & 2) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224)) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
            mtmp.mpeaceful = (TRUE) & 1;
            if (sgn(mtmp.data.maligntyp) === sgn(G.u.ualign.type) && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) < 4) {
              if (mtmp.mtame) {
                if (mtmp.mtame < 20) {
                  mtmp.mtame = mtmp.mtame + 1 << 24 >> 24;
                }
              } else {
                await tamedog(mtmp, null);
              }
            } else {
              await monflee(mtmp, 0, FALSE, TRUE);
            }
          }
        }
      } else {
        switch (rn2(3)) {
        case 0:
          await Your(S("ancestors are annoyed with you!"));
          break;
        case 1:
          await pline_The(S("headstones in the cemetery begin to move!"));
          break;
        default:
          await pline(S("Oh my!  Your name appears in the book!"));
        }
      }
    case 2:
      return;
    }
    break;
  }
}

export async function book_cursed(book: struct_obj | null): Promise<void> {
  if (G.occupation === learn && G.context.spbook.book === book && book.cursed | 0 && book.bknown | 0 && G.multi >= 0) {
    await stop_occupation();
  }
}

async function learn(): Promise<number> {
  let i = 0;
  let booktype = 0;
  let splname = new Int8Array(256);
  let costly = TRUE;
  let book = G.context.spbook.book;
  if (G.context.spbook.delay && G.ublindf && G.ublindf.otyp === LENSES && rn2(2)) {
    G.context.spbook.delay = G.context.spbook.delay + 1 << 24 >> 24;
  }
  if (G.u.uprops[CONFUSION].intrinsic) {
    await confused_book(book);
    G.context.spbook.book = null;
    G.context.spbook.o_id = 0;
    nomul(G.context.spbook.delay);
    G.multi_reason = S("reading a book");
    G.nomovemsg = null;
    G.context.spbook.delay = 0;
    return 0;
  }
  if (G.context.spbook.delay) {
    G.context.spbook.delay = G.context.spbook.delay + 1 << 24 >> 24;
    return 1;
  }
  await exercise(A_WIS, TRUE);
  booktype = book.otyp;
  if (booktype === SPE_BOOK_OF_THE_DEAD) {
    await deadbook(book);
    return 0;
  }
  sprintf(P(splname), G.objects[booktype].oc_name_known | 0 ? S("\"%s\"") : S("the \"%s\" spell"), G.obj_descr[G.objects[booktype].oc_name_idx].oc_name);
  for (i = 0; i < MAXSPELL; ++i) {
    if (G.spl_book[i].sp_id === booktype || G.spl_book[i].sp_id === NO_SPELL) {
      break;
    }
  }
  if (i === MAXSPELL) {
    await impossible(S("Too many spells memorized!"));
  } else if (G.spl_book[i].sp_id === booktype) {
    if (book.usecount > MAX_SPELL_STUDY) {
      await pline(S("This spellbook is too faint to be read any more."));
      book.otyp = booktype = SPE_BLANK_PAPER;
      book.usecount = rn2(book.usecount);
    } else if (G.spl_book[i].sp_know > (KEEN / 10 | 0)) {
      await You(S("know %s quite well already."), P(splname));
      costly = FALSE;
    } else {
      await Your(S("knowledge of %s is %s."), P(splname), G.spl_book[i].sp_know ? S("keener") : S("restored"));
      G.spl_book[i].sp_know = 20000 + 1;
      ++book.usecount;
      await exercise(A_WIS, TRUE);
    }
    await discover_object(booktype, 1, 1);
  } else {
    if (book.usecount >= MAX_SPELL_STUDY) {
      await pline(S("This spellbook is too faint to read even once."));
      book.otyp = booktype = SPE_BLANK_PAPER;
      book.usecount = rn2(book.usecount);
    } else {
      G.spl_book[i].sp_id = booktype;
      G.spl_book[i].sp_lev = G.objects[booktype].oc_oc2;
      G.spl_book[i].sp_know = 20000 + 1;
      ++book.usecount;
      await You(i > 0 ? S("add %s to your repertoire.") : S("learn %s."), P(splname));
    }
    await discover_object(booktype, 1, 1);
  }
  if (book.cursed) {
    if (await cursed_book(book)) {
      await useup(book);
      G.context.spbook.book = null;
      G.context.spbook.o_id = 0;
      return 0;
    }
  }
  if (costly) {
    await check_unpaid(book);
  }
  G.context.spbook.book = null;
  G.context.spbook.o_id = 0;
  return 0;
}

export async function study_book(spellbook: struct_obj | null): Promise<number> {
  let booktype = spellbook.otyp;
  let confused = (G.u.uprops[CONFUSION].intrinsic !== 0 ? 1 : 0) << 24 >> 24;
  let too_hard = FALSE;
  if (!confused && !(G.u.uprops[SLEEP_RES].intrinsic || G.u.uprops[SLEEP_RES].extrinsic) && !strcmp(G.obj_descr[G.objects[booktype].oc_descr_idx].oc_descr, S("dull"))) {
    let eyes = null;
    let dullbook = rnd(25) - acurr(A_WIS);
    if (G.context.spbook.delay && spellbook === G.context.spbook.book) {
      dullbook -= rnd(G.objects[booktype].oc_oc2);
    }
    if (dullbook > 0) {
      eyes = body_part(EYE);
      if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) > 1) {
        eyes = await makeplural(eyes);
      }
      await pline(S("This book is so dull that you can't keep your %s open."), eyes);
      dullbook += rnd(2 * G.objects[booktype].oc_oc2);
      await fall_asleep(-dullbook, TRUE);
      return 1;
    }
  }
  if (G.context.spbook.delay && !confused && spellbook === G.context.spbook.book && booktype !== SPE_BLANK_PAPER) {
    await You(S("continue your efforts to %s."), booktype === SPE_NOVEL ? S("read the novel") : S("memorize the spell"));
  } else {
    if (booktype === SPE_BLANK_PAPER) {
      await pline(S("This spellbook is all blank."));
      await discover_object(booktype, 1, 1);
      return 1;
    }
    if (booktype === SPE_NOVEL) {
      let tribtitle = noveltitle(P(spellbook, "corpsenm"));
      if (await read_tribute(S("books"), tribtitle, 0, null, 0, spellbook.o_id)) {
        ++G.u.uconduct.literate;
        await check_unpaid(spellbook);
        await discover_object(booktype, 1, 1);
        if (!G.u.uevent.read_tribute) {
          await more_experienced(20, 0);
          await newexplevel();
          G.u.uevent.read_tribute = 1;
        }
      }
      return 1;
    }
    switch (G.objects[booktype].oc_oc2) {
    case 1:
    case 2:
      G.context.spbook.delay = -G.objects[booktype].oc_delay << 24 >> 24;
      break;
    case 3:
    case 4:
      G.context.spbook.delay = Math.imul(-(G.objects[booktype].oc_oc2 - 1), G.objects[booktype].oc_delay) << 24 >> 24;
      break;
    case 5:
    case 6:
      G.context.spbook.delay = Math.imul(-G.objects[booktype].oc_oc2, G.objects[booktype].oc_delay) << 24 >> 24;
      break;
    case 7:
      G.context.spbook.delay = -8 * G.objects[booktype].oc_delay << 24 >> 24;
      break;
    default:
      await impossible(S("Unknown spellbook level %d, book %d;"), G.objects[booktype].oc_oc2, booktype);
      return 0;
    }
    spellbook.in_use = (TRUE) & 1;
    if (!spellbook.blessed && spellbook.otyp !== SPE_BOOK_OF_THE_DEAD) {
      if (spellbook.cursed) {
        too_hard = TRUE;
      } else {
        let read_ability = acurr(A_INT) + 4 + (G.u.ulevel / 2 | 0) - 2 * G.objects[booktype].oc_oc2 + (G.ublindf && G.ublindf.otyp === LENSES ? 2 : 0);
        if (G.urole.malenum === 342 && read_ability < 20 && !confused) {
          let qbuf = new Int8Array(128);
          sprintf(P(qbuf), S("This spellbook is %sdifficult to comprehend.  Continue?"), read_ability < 12 ? S("very ") : S(""));
          if (await yn_function(P(qbuf), P(G.ynchars), 110) !== 121) {
            spellbook.in_use = (FALSE) & 1;
            return 1;
          }
        }
        if (rnd(20) > read_ability) {
          too_hard = TRUE;
        }
      }
    }
    if (too_hard) {
      let gone = await cursed_book(spellbook);
      nomul(G.context.spbook.delay);
      G.multi_reason = S("reading a book");
      G.nomovemsg = null;
      G.context.spbook.delay = 0;
      if (gone || !rn2(3)) {
        if (!gone) {
          await pline_The(S("spellbook crumbles to dust!"));
        }
        if (!G.objects[spellbook.otyp].oc_name_known && !G.objects[spellbook.otyp].oc_uname) {
          await docall(spellbook);
        }
        await useup(spellbook);
      } else {
        spellbook.in_use = (FALSE) & 1;
      }
      return 1;
    } else if (confused) {
      if (!await confused_book(spellbook)) {
        spellbook.in_use = (FALSE) & 1;
      }
      nomul(G.context.spbook.delay);
      G.multi_reason = S("reading a book");
      G.nomovemsg = null;
      G.context.spbook.delay = 0;
      return 1;
    }
    spellbook.in_use = (FALSE) & 1;
    await You(S("begin to %s the runes."), spellbook.otyp === SPE_BOOK_OF_THE_DEAD ? S("recite") : S("memorize"));
  }
  G.context.spbook.book = spellbook;
  if (G.context.spbook.book) {
    G.context.spbook.o_id = G.context.spbook.book.o_id;
  }
  set_occupation(learn, S("studying"), 0);
  return 1;
}

export function book_disappears(obj: struct_obj | null): void {
  if (obj === G.context.spbook.book) {
    G.context.spbook.book = null;
    G.context.spbook.o_id = 0;
  }
}

export function book_substitution(old_obj: struct_obj | null, new_obj: struct_obj | null): void {
  if (old_obj === G.context.spbook.book) {
    G.context.spbook.book = new_obj;
    if (G.context.spbook.book) {
      G.context.spbook.o_id = G.context.spbook.book.o_id;
    }
  }
}

export function age_spells(): void {
  let $t1: any;
  let i = 0;
  for (i = 0; i < MAXSPELL && G.spl_book[i].sp_id !== NO_SPELL; ++i) {
    if (G.spl_book[i].sp_know) {
      ($t1 = G.spl_book[i], $t1.sp_know = $t1.sp_know - 1);
    }
  }
  return;
}

async function rejectcasting(): Promise<number> {
  if (G.u.uprops[STUNNED].intrinsic) {
    await You(S("are too impaired to cast a spell."));
    return TRUE;
  } else if (!can_chant(G.youmonst)) {
    await You(S("are unable to chant the incantation."));
    return TRUE;
  } else if (!freehand()) {
    await Your(S("arms are not free to cast!"));
    return TRUE;
  }
  return FALSE;
}

async function getspell(spell_no: Ptr | null): Promise<number> {
  let nspells = 0;
  let idx = 0;
  let ilet = 0;
  let lets = new Int8Array(256);
  let qbuf = new Int8Array(128);
  if (G.spl_book[0].sp_id === NO_SPELL) {
    await You(S("don't know any spells right now."));
    return FALSE;
  }
  if (await rejectcasting()) {
    return FALSE;
  }
  if (G.flags.menu_style === MENU_TRADITIONAL) {
    for (nspells = 1; nspells < MAXSPELL && G.spl_book[nspells].sp_id !== NO_SPELL; ++nspells) {
      continue;
    }
    if (nspells === 1) {
      strcpy(P(lets), S("a"));
    } else if (nspells < 27) {
      sprintf(P(lets), S("a-%c"), 97 + nspells - 1);
    } else if (nspells === 27) {
      sprintf(P(lets), S("a-zA"));
    } else {
      sprintf(P(lets), S("a-zA-%c"), 65 + nspells - 27);
    }
    for (; ; ) {
      sprintf(P(qbuf), S("Cast which spell? [%s *?]"), P(lets));
      ilet = await yn_function(P(qbuf), null, 0);
      if (ilet === 42 || ilet === 63) {
        break;
      }
      if (strchr(P(G.quitchars), ilet)) {
        return FALSE;
      }
      idx = spell_let_to_idx(ilet);
      if (idx < 0 || idx >= nspells) {
        await You(S("don't know that spell."));
        continue;
      }
      spell_no.a[spell_no.o] = idx;
      return TRUE;
    }
  }
  return await dospellmenu(S("Choose which spell to cast"), SPELLMENU_CAST, spell_no);
}

export async function docast(): Promise<number> {
  const spell_no = new Int32Array(1);
  if (await getspell(P(spell_no, 0))) {
    return await spelleffects(spell_no[0], FALSE);
  }
  return 0;
}

async function spelltypemnemonic(skill: number): Promise<Ptr | null> {
  switch (skill) {
  case P_ATTACK_SPELL:
    return S("attack");
  case P_HEALING_SPELL:
    return S("healing");
  case P_DIVINATION_SPELL:
    return S("divination");
  case P_ENCHANTMENT_SPELL:
    return S("enchantment");
  case P_CLERIC_SPELL:
    return S("clerical");
  case P_ESCAPE_SPELL:
    return S("escape");
  case P_MATTER_SPELL:
    return S("matter");
  default:
    await impossible(S("Unknown spell skill, %d;"), skill);
    return S("");
  }
}

export function spell_skilltype(booktype: number): number {
  return G.objects[booktype].oc_subtyp;
}

async function cast_protection(): Promise<void> {
  let l = G.u.ulevel;
  let loglev = 0;
  let gain = 0;
  let natac = G.u.uac + G.u.uspellprot;
  while (l) {
    ++loglev;
    l = l / 2 | 0;
  }
  natac = (10 - natac) / 10 | 0;
  gain = loglev - (G.u.uspellprot / (4 - (3 < natac ? 3 : natac)) | 0);
  if (gain > 0) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      let rmtyp = 0;
      let hgolden = hcolor(G.c_color_names.c_golden);
      let atmosphere = null;
      if (G.u.uspellprot) {
        await pline_The(S("%s haze around you becomes more dense."), hgolden);
      } else {
        rmtyp = $at2(G.level.locations, G.u.ux, G.u.uy).typ;
        atmosphere = G.u.uswallow | 0 ? G.u.ustuck.data === $sat(G.mons, PM_FOG_CLOUD) ? S("mist") : G.u.ustuck.data.mlet === S_VORTEX || G.u.ustuck.data === $sat(G.mons, 151) ? S("maelstrom") : (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("maw") : S("ooze") : G.u.uinwater | 0 ? hliquid(S("water")) : rmtyp === CLOUD ? S("cloud") : rmtyp === TREE || G.level.flags.arboreal | 0 && rmtyp === STONE ? S("vegetation") : rmtyp <= DBWALL ? S("stone") : S("air");
        await pline_The(S("%s around you begins to shimmer with %s haze."), atmosphere, await an(hgolden));
      }
    }
    G.u.uspellprot = G.u.uspellprot + gain & 0xff;
    G.u.uspmtime = (G.u.weapon_skills[spell_skilltype(378)].skill === P_EXPERT ? 20 : 10) & 0xff;
    if (!G.u.usptime) {
      G.u.usptime = G.u.uspmtime;
    }
    find_ac();
  } else {
    await Your(S("skin feels warm for a moment."));
  }
}

async function spell_backfire(spell: number): Promise<void> {
  let duration = (G.spl_book[spell].sp_lev + 1) * 3;
  let old_stun = G.u.uprops[STUNNED].intrinsic & TIMEOUT;
  let old_conf = G.u.uprops[CONFUSION].intrinsic & TIMEOUT;
  switch (rn2(10)) {
  case 0:
  case 1:
  case 2:
  case 3:
    await make_confused(old_conf + duration, FALSE);
    break;
  case 4:
  case 5:
  case 6:
    await make_confused(old_conf + Math.trunc(2 * duration / 3), FALSE);
    await make_stunned(old_stun + Math.trunc(duration / 3), FALSE);
    break;
  case 7:
  case 8:
    await make_stunned(old_stun + Math.trunc(2 * duration / 3), FALSE);
    await make_confused(old_conf + Math.trunc(duration / 3), FALSE);
    break;
  case 9:
    await make_stunned(old_stun + duration, FALSE);
    break;
  }
  return;
}

export async function spelleffects(spell: number, atme: number): Promise<number> {
  let energy = 0;
  let damage = 0;
  let chance = 0;
  let n = 0;
  let intell = 0;
  let otyp = 0;
  let skill = 0;
  let role_skill = 0;
  let res = 0;
  let confused = (G.u.uprops[CONFUSION].intrinsic !== 0 ? 1 : 0) << 24 >> 24;
  let physical_damage = FALSE;
  let pseudo = null;
  let cc = new struct_nhcoord();
  if (await rejectcasting()) {
    return 0;
  }
  if (G.spl_book[spell].sp_know <= 0) {
    await Your(S("knowledge of this spell is twisted."));
    await pline(S("It invokes nightmarish images in your mind..."));
    await spell_backfire(spell);
    return 1;
  } else if (G.spl_book[spell].sp_know <= (KEEN / 200 | 0)) {
    await You(S("strain to recall the spell."));
  } else if (G.spl_book[spell].sp_know <= (KEEN / 40 | 0)) {
    await You(S("have difficulty remembering the spell."));
  } else if (G.spl_book[spell].sp_know <= (KEEN / 20 | 0)) {
    await Your(S("knowledge of this spell is growing faint."));
  } else if (G.spl_book[spell].sp_know <= (KEEN / 10 | 0)) {
    await Your(S("recall of this spell is gradually fading."));
  }
  energy = G.spl_book[spell].sp_lev * 5;
  if (G.u.uhunger <= 10 && G.spl_book[spell].sp_id !== SPE_DETECT_FOOD) {
    await You(S("are too hungry to cast that spell."));
    return 0;
  } else if (acurr(A_STR) < 4 && G.spl_book[spell].sp_id !== SPE_RESTORE_ABILITY) {
    await You(S("lack the strength to cast spells."));
    return 0;
  } else if (await check_capacity(S("Your concentration falters while carrying so much stuff."))) {
    return 1;
  }
  if (G.u.uhave.amulet | 0 && G.u.uen >= energy) {
    await You_feel(S("the amulet draining your energy away."));
    G.u.uen -= rnd(2 * energy);
    if (G.u.uen < 0) {
      G.u.uen = 0;
    }
    G.context.botl = 1;
    res = 1;
  }
  if (energy > G.u.uen) {
    await You(S("don't have enough energy to cast that spell."));
    return res;
  } else {
    if (G.spl_book[spell].sp_id !== SPE_DETECT_FOOD) {
      let hungr = energy * 2;
      intell = acurr(A_INT);
      if (!(G.urole.malenum === 342)) {
        intell = 10;
      }
      switch (intell) {
      case 25:
      case 24:
      case 23:
      case 22:
      case 21:
      case 20:
      case 19:
      case 18:
      case 17:
        hungr = 0;
        break;
      case 16:
        hungr = hungr / 4 | 0;
        break;
      case 15:
        hungr = hungr / 2 | 0;
        break;
      }
      if (hungr > G.u.uhunger - 3) {
        hungr = G.u.uhunger - 3;
      }
      await morehungry(hungr);
    }
  }
  chance = await percent_success(spell);
  if (confused || rnd(100) > chance) {
    await You(S("fail to cast the spell correctly."));
    G.u.uen -= energy / 2 | 0;
    G.context.botl = 1;
    return 1;
  }
  G.u.uen -= energy;
  G.context.botl = 1;
  await exercise(A_WIS, TRUE);
  pseudo = await mksobj(G.spl_book[spell].sp_id, FALSE, FALSE);
  pseudo.blessed = (pseudo.cursed = 0) & 1;
  pseudo.quan = 20;
  otyp = pseudo.otyp;
  skill = spell_skilltype(otyp);
  role_skill = G.u.weapon_skills[skill].skill;
  switch (otyp) {
  case 343:
  case 344:
    if (role_skill >= P_SKILLED) {
      if (await throwspell()) {
        cc.x = G.u.dx;
        cc.y = G.u.dy;
        n = rnd(8) + 1;
        while (n--) {
          if (!G.u.dx && !G.u.dy && !G.u.dz) {
            if ((damage = await zapyourself(pseudo, TRUE)) !== 0) {
              let buf = new Int8Array(256);
              sprintf(P(buf), S("zapped %sself with a spell"), G.genders[G.flags.female ? 1 : 0].him);
              await losehp(damage, P(buf), NO_KILLER_PREFIX);
            }
          } else {
            await explode(G.u.dx, G.u.dy, otyp - SPE_MAGIC_MISSILE + 10, spell_damage_bonus((G.u.ulevel / 2 | 0) + 1), 0, otyp === SPE_CONE_OF_COLD ? EXPL_FROSTY : EXPL_FIERY);
          }
          G.u.dx = cc.x + rnd(3) - 2 << 24 >> 24;
          G.u.dy = cc.y + rnd(3) - 2 << 24 >> 24;
          if (!isok(G.u.dx, G.u.dy) || !($rd(G.viz_array.a[G.viz_array.o + G.u.dy], G.u.dx) & 2) || $at2(G.level.locations, G.u.dx, G.u.dy).typ <= DBWALL || G.u.uswallow | 0) {
            G.u.dx = cc.x;
            G.u.dy = cc.y;
          }
        }
      }
      break;
    }
  case 351:
    physical_damage = TRUE;
  case 345:
  case 342:
  case 350:
  case 355:
  case 356:
  case 341:
  case 373:
  case 374:
  case 375:
  case 377:
  case 346:
  case 347:
  case 364:
  case 349:
  case 366:
  case 354:
  case 380:
    if ((G.objects[otyp].oc_dir | 0) !== NODIR) {
      if (otyp === SPE_HEALING || otyp === SPE_EXTRA_HEALING) {
        if (role_skill >= P_SKILLED) {
          pseudo.blessed = 1;
        }
      }
      if (atme) {
        G.u.dx = G.u.dy = G.u.dz = 0;
      } else if (!await getdir(null)) {
        await pline_The(S("magical energy is released!"));
      }
      if (!G.u.dx && !G.u.dy && !G.u.dz) {
        if ((damage = await zapyourself(pseudo, TRUE)) !== 0) {
          let buf = new Int8Array(256);
          sprintf(P(buf), S("zapped %sself with a spell"), G.genders[G.flags.female ? 1 : 0].him);
          if (physical_damage) {
            damage = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (damage + 1) / 2 | 0 : damage;
          }
          await losehp(damage, P(buf), NO_KILLER_PREFIX);
        }
      } else {
        await weffects(pseudo);
      }
    } else {
      await weffects(pseudo);
    }
    update_inventory();
    break;
  case 370:
  case 352:
  case 358:
  case 359:
  case 372:
    if (role_skill >= P_SKILLED) {
      pseudo.blessed = 1;
    }
  case 362:
  case 371:
  case 357:
    await seffects(pseudo);
    break;
  case 363:
  case 369:
  case 348:
  case 365:
  case 367:
    if (role_skill >= P_SKILLED) {
      pseudo.blessed = 1;
    }
  case 368:
    await peffects(pseudo);
    break;
  case 353:
    await healup(0, 0, FALSE, TRUE);
    break;
  case 361:
    if (G.u.uprops[SICK].intrinsic) {
      await You(S("are no longer ill."));
    }
    if (G.u.uprops[SLIMED].intrinsic) {
      await make_slimed(0, S("The slime disappears!"));
    }
    await healup(0, 0, TRUE, FALSE);
    break;
  case 376:
    await make_familiar(null, G.u.ux, G.u.uy, FALSE);
    break;
  case 360:
    if (!G.u.uprops[CLAIRVOYANT].blocked) {
      if (role_skill >= P_SKILLED) {
        pseudo.blessed = 1;
      }
      await do_vicinity_map(pseudo);
    } else if (G.uarmh && G.uarmh.otyp === CORNUTHAUM) {
      await You(S("sense a pointy hat on top of your %s."), body_part(HEAD));
    }
    break;
  case 378:
    await cast_protection();
    break;
  case 379:
    if (!await jump(role_skill > 1 ? role_skill : 1)) {
      await pline(S("%s"), G.c_common_strings.c_nothing_happens);
    }
    break;
  default:
    await impossible(S("Unknown spell %d attempted."), spell);
    await obfree(pseudo, null);
    return 0;
  }
  await use_skill(skill, G.spl_book[spell].sp_lev);
  await obfree(pseudo, null);
  return 1;
}

function spell_aim_step(arg: any, x: number, y: number): number {
  if (!isok(x, y)) {
    return FALSE;
  }
  if (!($at2(G.level.locations, x, y).typ >= POOL) && !($at2(G.level.locations, x, y).typ === DOOR && ($at2(G.level.locations, x, y).flags | 0) & D_ISOPEN)) {
    return FALSE;
  }
  return TRUE;
}

async function throwspell(): Promise<number> {
  let cc = new struct_nhcoord();
  let uc = new struct_nhcoord();
  let mtmp = null;
  if (G.u.uinwater) {
    await pline(S("You're joking!  In this weather?"));
    return 0;
  } else if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
    await You(S("had better wait for the sun to come out."));
    return 0;
  }
  await pline(S("Where do you want to cast the spell?"));
  cc.x = G.u.ux;
  cc.y = G.u.uy;
  if (await getpos(cc, TRUE, S("the desired position")) < 0) {
    return 0;
  }
  if (distmin(G.u.ux, G.u.uy, cc.x, cc.y) > 10) {
    await pline_The(S("spell dissipates over the distance!"));
    return 0;
  } else if (G.u.uswallow) {
    await pline_The(S("spell is cut short!"));
    await exercise(A_WIS, FALSE);
    G.u.dx = 0;
    G.u.dy = 0;
    return 1;
  } else if (!($rd(G.viz_array.a[G.viz_array.o + cc.y], cc.x) & 2) && (!(mtmp = !!G.level.monsters[cc.x][cc.y] ? G.level.monsters[cc.x][cc.y] : null) || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) || $at2(G.level.locations, cc.x, cc.y).typ <= DBWALL) {
    await Your(S("mind fails to lock onto that location!"));
    return 0;
  }
  uc.x = G.u.ux;
  uc.y = G.u.uy;
  await walk_path(uc, cc, spell_aim_step, null);
  G.u.dx = cc.x;
  G.u.dy = cc.y;
  return 1;
}

export async function tport_spell(what: number): Promise<number> {
  let i = 0;
  for (i = 0; i < MAXSPELL; ++i) {
    if (G.spl_book[i].sp_id === SPE_TELEPORT_AWAY || G.spl_book[i].sp_id === NO_SPELL) {
      break;
    }
  }
  if (i === MAXSPELL) {
    await impossible(S("tport_spell: spellbook full"));
  } else if (G.spl_book[i].sp_id === NO_SPELL) {
    if (what === HIDE_SPELL || what === REMOVESPELL) {
      tport_spell$save_tport.tport_indx = MAXSPELL;
    } else if (what === UNHIDESPELL) {
      G.spl_book[tport_spell$save_tport.tport_indx].$cp(tport_spell$save_tport.savespell);
      tport_spell$save_tport.tport_indx = MAXSPELL;
    } else if (what === ADD_SPELL) {
      tport_spell$save_tport.savespell.$cp(G.spl_book[i]);
      tport_spell$save_tport.tport_indx = i;
      G.spl_book[i].sp_id = SPE_TELEPORT_AWAY;
      G.spl_book[i].sp_lev = G.objects[SPE_TELEPORT_AWAY].oc_oc2;
      G.spl_book[i].sp_know = KEEN;
      return REMOVESPELL;
    }
  } else {
    if (what === ADD_SPELL || what === UNHIDESPELL) {
      tport_spell$save_tport.tport_indx = MAXSPELL;
    } else if (what === REMOVESPELL) {
      G.spl_book[i].$cp(tport_spell$save_tport.savespell);
      tport_spell$save_tport.tport_indx = MAXSPELL;
    } else if (what === HIDE_SPELL) {
      tport_spell$save_tport.savespell.$cp(G.spl_book[i]);
      tport_spell$save_tport.tport_indx = i;
      G.spl_book[i].sp_id = NO_SPELL;
      return UNHIDESPELL;
    }
  }
  return NOOP_SPELL;
}

export async function losespells(): Promise<void> {
  let n = 0;
  let nzap = 0;
  let i = 0;
  G.context.spbook.book = null;
  G.context.spbook.o_id = 0;
  for (n = 0; n < MAXSPELL; ++n) {
    if (G.spl_book[n].sp_id === NO_SPELL) {
      break;
    }
  }
  nzap = rn2(n + 1);
  if (G.u.uprops[CONFUSION].intrinsic) {
    i = rn2(n + 1);
    if (i > nzap) {
      nzap = i;
    }
  }
  if (nzap > 1 && !rnl(7)) {
    nzap = rnd(nzap);
  }
  for (i = 0; nzap > 0; ++i) {
    if (rn2(n - i) < nzap) {
      G.spl_book[i].sp_know = 0;
      await exercise(A_WIS, FALSE);
      --nzap;
    }
  }
}

function spell_cmp(vptr1: any, vptr2: any): number {
  let indx1 = vptr1.a[vptr1.o];
  let indx2 = vptr2.a[vptr2.o];
  let otyp1 = G.spl_book[indx1].sp_id;
  let otyp2 = G.spl_book[indx2].sp_id;
  let levl1 = G.objects[otyp1].oc_oc2;
  let levl2 = G.objects[otyp2].oc_oc2;
  let skil1 = G.objects[otyp1].oc_subtyp;
  let skil2 = G.objects[otyp2].oc_subtyp;
  switch (spl_sortmode) {
  case SORTBY_LETTER:
    return indx1 - indx2;
  case SORTBY_ALPHA:
    break;
  case SORTBY_LVL_LO:
    if (levl1 !== levl2) {
      return levl1 - levl2;
    }
    break;
  case SORTBY_LVL_HI:
    if (levl1 !== levl2) {
      return levl2 - levl1;
    }
    break;
  case SORTBY_SKL_AL:
    if (skil1 !== skil2) {
      return skil1 - skil2;
    }
    break;
  case SORTBY_SKL_LO:
    if (skil1 !== skil2) {
      return skil1 - skil2;
    }
    if (levl1 !== levl2) {
      return levl1 - levl2;
    }
    break;
  case SORTBY_SKL_HI:
    if (skil1 !== skil2) {
      return skil1 - skil2;
    }
    if (levl1 !== levl2) {
      return levl2 - levl1;
    }
    break;
  case SORTBY_CURRENT:
  default:
    return vptr1.o < vptr2.o ? -1 : vptr1.o > vptr2.o ? 1 : 0;
  }
  return strncmpi(G.obj_descr[G.objects[otyp1].oc_name_idx].oc_name, G.obj_descr[G.objects[otyp2].oc_name_idx].oc_name, -1);
}

async function sortspells(): Promise<void> {
  let i = 0;
  let n = 0;
  if (spl_sortmode === SORTBY_CURRENT) {
    return;
  }
  for (n = 0; n < MAXSPELL && G.spl_book[n].sp_id !== NO_SPELL; n = n + 1 >>> 0) {
    continue;
  }
  if (n < 2) {
    return;
  }
  if (!spl_orderindx) {
    if (spl_sortmode === SORTBY_LETTER || spl_sortmode === SORTRETAINORDER) {
      return;
    }
    spl_orderindx = P(new Int32Array(MAXSPELL * 4 / 4));
    for (i = 0; i < MAXSPELL; ++i) {
      spl_orderindx.a[spl_orderindx.o + i] = i;
    }
  }
  if (spl_sortmode === SORTRETAINORDER) {
    let tmp_book = $sarr(struct_spell, 44);
    for (i = 0; i < MAXSPELL; ++i) {
      tmp_book[i].$cp(G.spl_book[spl_orderindx.a[spl_orderindx.o + i]]);
    }
    for (i = 0; i < MAXSPELL; ++i) {
      G.spl_book[i].$cp(tmp_book[i]), spl_orderindx.a[spl_orderindx.o + i] = i;
    }
    spl_sortmode = SORTBY_LETTER;
    return;
  }
  await qsort(spl_orderindx, n, 4, spell_cmp);
  return;
}

async function spellsortmenu(): Promise<number> {
  let tmpwin = 0;
  const selected = [null];
  let any = new union_any();
  let let_ = 0;
  let i = 0;
  let n = 0;
  let choice = 0;
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  for (i = 0; i < (Math.trunc(72 / 8) | 0); ++i) {
    if (i === SORTRETAINORDER) {
      let_ = 122;
      any.a_int = 0;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, ATR_NONE, S(""), MENU_UNSELECTED);
    } else {
      let_ = 97 + i << 24 >> 24;
    }
    any.a_int = i + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, let_, 0, ATR_NONE, spl_sortchoices[i], i === spl_sortmode ? MENU_SELECTED : MENU_UNSELECTED);
  }
  await G.windowprocs.win_end_menu(tmpwin, S("View known spells list sorted"));
  n = await G.windowprocs.win_select_menu(tmpwin, PICK_ONE, P(selected, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (n > 0) {
    choice = selected[0].item.a_int - 1;
    if (n > 1 && choice === spl_sortmode) {
      choice = $sadd(selected[0], 1).item.a_int - 1;
    }
    free(selected[0]);
    spl_sortmode = choice;
    return TRUE;
  }
  return FALSE;
}

export async function dovspell(): Promise<number> {
  let qbuf = new Int8Array(128);
  const splnum = new Int32Array(1);
  const othnum = new Int32Array(1);
  let spl_tmp = new struct_spell();
  if (G.spl_book[0].sp_id === NO_SPELL) {
    await You(S("don't know any spells right now."));
  } else {
    while (await dospellmenu(S("Currently known spells"), SPELLMENU_VIEW, P(splnum, 0))) {
      if (splnum[0] === SPELLMENU_SORT) {
        if (await spellsortmenu()) {
          await sortspells();
        }
      } else {
        sprintf(P(qbuf), S("Reordering spells; swap '%c' with"), (splnum[0] < 26 ? 97 + splnum[0] : 65 + splnum[0] - 26) << 24 >> 24);
        if (!await dospellmenu(P(qbuf), splnum[0], P(othnum, 0))) {
          break;
        }
        spl_tmp.$cp(G.spl_book[splnum[0]]);
        G.spl_book[splnum[0]].$cp(G.spl_book[othnum[0]]);
        G.spl_book[othnum[0]].$cp(spl_tmp);
      }
    }
  }
  if (spl_orderindx) {
    free(spl_orderindx);
    spl_orderindx = null;
  }
  spl_sortmode = SORTBY_LETTER;
  return 0;
}

async function dospellmenu(prompt: Ptr | null, splaction: number, spell_no: Ptr | null): Promise<number> {
  let tmpwin = 0;
  let i = 0;
  let n = 0;
  let how = 0;
  let splnum = 0;
  let buf = new Int8Array(256);
  let retentionbuf = new Int8Array(24);
  let fmt = null;
  const selected = [null];
  let any = new union_any();
  tmpwin = await G.windowprocs.win_create_nhwindow(NHW_MENU);
  await G.windowprocs.win_start_menu(tmpwin);
  any.$cp(G.zeroany);
  if (!G.iflags.menu_tab_sep) {
    sprintf(P(buf), S("%-20s     Level %-12s Fail Retention"), S("    Name"), S("Category"));
    fmt = S("%-20s  %2d   %-12s %3d%% %9s");
  } else {
    sprintf(P(buf), S("Name\tLevel\tCategory\tFail\tRetention"));
    fmt = S("%s\t%-d\t%s\t%-d%%\t%s");
  }
  await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 0, 0, G.iflags.menu_headings, P(buf), MENU_UNSELECTED);
  for (i = 0; i < MAXSPELL && G.spl_book[i].sp_id !== NO_SPELL; ++i) {
    splnum = !spl_orderindx ? i : spl_orderindx.a[spl_orderindx.o + i];
    sprintf(P(buf), fmt, G.obj_descr[G.objects[G.spl_book[splnum].sp_id].oc_name_idx].oc_name, G.spl_book[splnum].sp_lev, await spelltypemnemonic(spell_skilltype(G.spl_book[splnum].sp_id)), 100 - await percent_success(splnum), spellretention(splnum, P(retentionbuf)));
    any.a_int = splnum + 1;
    await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, (splnum < 26 ? 97 + splnum : 65 + splnum - 26) << 24 >> 24, 0, ATR_NONE, P(buf), splnum === splaction ? MENU_SELECTED : MENU_UNSELECTED);
  }
  how = PICK_ONE;
  if (splaction === SPELLMENU_VIEW) {
    if (G.spl_book[1].sp_id === NO_SPELL) {
      how = PICK_NONE;
    } else {
      any.a_int = SPELLMENU_SORT + 1;
      await G.windowprocs.win_add_menu(tmpwin, NO_GLYPH, any, 43, 0, ATR_NONE, S("[sort spells]"), MENU_UNSELECTED);
    }
  }
  await G.windowprocs.win_end_menu(tmpwin, prompt);
  n = await G.windowprocs.win_select_menu(tmpwin, how, P(selected, 0));
  await G.windowprocs.win_destroy_nhwindow(tmpwin);
  if (n > 0) {
    spell_no.a[spell_no.o] = selected[0].item.a_int - 1;
    if (n > 1 && spell_no.a[spell_no.o] === splaction) {
      spell_no.a[spell_no.o] = $sadd(selected[0], 1).item.a_int - 1;
    }
    free(selected[0]);
    if (spell_no.a[spell_no.o] === splaction) {
      return FALSE;
    }
    return TRUE;
  } else if (splaction >= 0) {
    spell_no.a[spell_no.o] = splaction;
    return TRUE;
  }
  return FALSE;
}

async function percent_success(spell: number): Promise<number> {
  let chance = 0;
  let splcaster = 0;
  let special = 0;
  let statused = 0;
  let difficulty = 0;
  let skill = 0;
  splcaster = G.urole.spelbase;
  special = G.urole.spelheal;
  statused = acurr(G.urole.spelstat);
  if (G.uarm && ((G.objects[G.uarm.otyp].oc_material | 0) >= IRON && (G.objects[G.uarm.otyp].oc_material | 0) <= MITHRIL)) {
    splcaster += G.uarmc && G.uarmc.otyp === ROBE ? G.urole.spelarmr / 2 | 0 : G.urole.spelarmr;
  } else if (G.uarmc && G.uarmc.otyp === ROBE) {
    splcaster -= G.urole.spelarmr;
  }
  if (G.uarms) {
    splcaster += G.urole.spelshld;
  }
  if (G.uarmh && ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) && G.uarmh.otyp !== HELM_OF_BRILLIANCE) {
    splcaster += uarmhbon;
  }
  if (G.uarmg && ((G.objects[G.uarmg.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmg.otyp].oc_material | 0) <= MITHRIL)) {
    splcaster += uarmgbon;
  }
  if (G.uarmf && ((G.objects[G.uarmf.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmf.otyp].oc_material | 0) <= MITHRIL)) {
    splcaster += uarmfbon;
  }
  if (G.spl_book[spell].sp_id === G.urole.spelspec) {
    splcaster += G.urole.spelsbon;
  }
  if (G.spl_book[spell].sp_id === SPE_HEALING || G.spl_book[spell].sp_id === SPE_EXTRA_HEALING || G.spl_book[spell].sp_id === SPE_CURE_BLINDNESS || G.spl_book[spell].sp_id === SPE_CURE_SICKNESS || G.spl_book[spell].sp_id === SPE_RESTORE_ABILITY || G.spl_book[spell].sp_id === SPE_REMOVE_CURSE) {
    splcaster += special;
  }
  if (splcaster > 20) {
    splcaster = 20;
  }
  chance = 11 * statused / 2 | 0;
  skill = G.u.weapon_skills[spell_skilltype(G.spl_book[spell].sp_id)].skill;
  skill = (skill > P_UNSKILLED ? skill : P_UNSKILLED) - 1;
  difficulty = (G.spl_book[spell].sp_lev - 1) * 4 - (skill * 6 + (G.u.ulevel / 3 | 0) + 1);
  if (difficulty > 0) {
    chance -= isqrt(900 * difficulty + 2000);
  } else {
    let learning = 15 * -difficulty / G.spl_book[spell].sp_lev | 0;
    chance += learning > 20 ? 20 : learning;
  }
  if (chance < 0) {
    chance = 0;
  }
  if (chance > 120) {
    chance = 120;
  }
  if (G.uarms && await weight(G.uarms) > G.objects[SMALL_SHIELD].oc_weight) {
    if (G.spl_book[spell].sp_id === G.urole.spelspec) {
      chance = chance / 2 | 0;
    } else {
      chance = chance / 4 | 0;
    }
  }
  chance = (Math.imul(chance, 20 - splcaster) / 15 | 0) - splcaster;
  if (chance > 100) {
    chance = 100;
  }
  if (chance < 0) {
    chance = 0;
  }
  return chance;
}

function spellretention(idx: number, outbuf: Ptr | null): Ptr | null {
  let turnsleft = 0;
  let percent = 0;
  let accuracy = 0;
  let skill = 0;
  skill = G.u.weapon_skills[spell_skilltype(G.spl_book[idx].sp_id)].skill;
  skill = skill > P_UNSKILLED ? skill : P_UNSKILLED;
  turnsleft = G.spl_book[idx].sp_know;
  outbuf.a[outbuf.o] = 0;
  if (turnsleft < 1) {
    strcpy(outbuf, S("(gone)"));
  } else if (turnsleft >= KEEN) {
    strcpy(outbuf, S("100%"));
  } else {
    percent = Math.trunc((turnsleft - 1) / Math.trunc(KEEN / 100)) + 1;
    accuracy = skill === P_EXPERT ? 2 : skill === P_SKILLED ? 5 : skill === P_BASIC ? 10 : 25;
    percent = accuracy * (Math.trunc((percent - 1) / accuracy) + 1);
    sprintf(outbuf, S("%ld%%-%ld%%"), percent - accuracy + 1, percent);
  }
  return outbuf;
}

export async function initialspell(obj: struct_obj | null): Promise<void> {
  let i = 0;
  let otyp = obj.otyp;
  for (i = 0; i < MAXSPELL; ++i) {
    if (G.spl_book[i].sp_id === NO_SPELL || G.spl_book[i].sp_id === otyp) {
      break;
    }
  }
  if (i === MAXSPELL) {
    await impossible(S("Too many spells memorized!"));
  } else if (G.spl_book[i].sp_id !== NO_SPELL) {
    await impossible(S("Spell %s already known."), G.obj_descr[G.objects[otyp].oc_name_idx].oc_name);
  } else {
    G.spl_book[i].sp_id = otyp << 16 >> 16;
    G.spl_book[i].sp_lev = G.objects[otyp].oc_oc2;
    G.spl_book[i].sp_know = 20000 + 0;
  }
  return;
}

export function $init(): void {
  explodes = $cs("radiates explosive energy", 26);
  spl_sortchoices = [S("by casting letter"),
S("alphabetically"),
S("by level, low to high"),
S("by level, high to low"),
S("by skill group, alphabetized within each group"),
S("by skill group, low to high level within group"),
S("by skill group, high to low level within group"),
S("maintain current ordering"),
S("reassign casting letters to retain current order")];
  spl_sortmode = 0;
  spl_orderindx = null;
  tport_spell$save_tport = new struct_tport_hideaway();
}
