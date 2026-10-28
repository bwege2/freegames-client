// @ts-nocheck
// NetHack 3.6.7 objnam.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { artifact_exists, artifact_name, artiname, glow_color, glow_verb, nartifact_exist, undiscovered_artifact } from './artifact.ts';
import { title_to_mon } from './botl.ts';
import { is_lava, is_pool } from './dbridge.ts';
import { docrt, feel_newsym } from './display.ts';
import { lookup_novel, noit_mon_nam, oname, safe_oname } from './do_name.ts';
import { doffing, donning } from './do_wear.ts';
import { def_char_to_objclass } from './drawing.ts';
import { Can_fall_thru } from './dungeon.ts';
import { consume_oeaten, set_tin_variety, tin_details, tin_variety_txt } from './eat.ts';
import { panic } from './end.ts';
import { del_engr_at, make_grave } from './engrave.ts';
import { pooleffects } from './hack.ts';
import { digit, eos, fuzzymatch, highc, letter, lowc, mungspaces, ordin, s_suffix, sitoa, strcasecpy, strncmpi, strstri } from './hacklib.ts';
import { count_contents, currency } from './invent.ts';
import { find_mid } from './light.ts';
import { curse, is_flammable, is_rottable, mkobj, mksobj, obj_extract_self, place_object, set_corpsenm, weight } from './mkobj.ts';
import { can_be_hatched, dead_species, genus } from './mon.ts';
import { name_to_mon } from './mondata.ts';
import { impossible, pline } from './pline.ts';
import { body_part } from './polyself.ts';
import { align_str } from './priest.ts';
import { is_quest_artifact } from './questpgr.ts';
import { tshirt_text } from './read.ts';
import { rn2, rnd } from './rnd.ts';
import { delete_contents, get_cost_of_shop_item, is_unpaid, obfree, shk_your, unpaid_cost } from './shk.ts';
import { begin_burn } from './timeout.ts';
import { maketrap, reset_utrap, water_damage_chain } from './trap.ts';
import { block_point } from './vision.ts';
import { struct_Jitem, struct_alt_spellings, struct_fruit, struct_monst, struct_o_range, struct_obj, struct_objclass, struct_permonst, struct_sing_plur } from './structs.ts';
import { $arr, $cs, $peq, $rd, $sadd, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, atoi, memset, sprintf, strcat, strchr, strcmp, strcpy, strlen, strncat, strncmp, strncpy, strrchr } from './rt/index.ts';
import { ACID_VENOM, AKLYS, ALTAR, AMULET_CLASS, AMULET_OF_YENDOR, AMULET_VERSUS_POISON, ARMOR_CLASS, ARM_BOOTS, ARM_CLOAK, ARM_GLOVES, ARM_HELM, ARM_SHIELD, ART_ORB_OF_DETECTION, A_CHAOTIC, A_LAWFUL, A_NEUTRAL, A_NONE, BAG_OF_TRICKS, BALL_CLASS, BEARTRAP, BEAR_TRAP, BELL, BLINDED, BLINDING_VENOM, BRASS_LANTERN, BROADSWORD, BUFSZ, BULLWHIP, CANDELABRUM_OF_INVOCATION, CHAIN_CLASS, CLOAK_OF_DISPLACEMENT, COIN_CLASS, COPPER, CORPSE, CREAM_PIE, CRYSKNIFE, CXN_ARTICLE, CXN_NOCORPSE, CXN_NORMAL, CXN_NO_PFX, CXN_PFX_THE, CXN_SINGULAR, DONAME_VAGUE_QUAN, DONAME_WITH_PRICE, DUNCE_CAP, DWARVISH_MATTOCK, EGG, ELVEN_LEATHER_HELM, ELVEN_SHIELD, EMPTY, EUCALYPTUS_LEAF, EXPENSIVE_CAMERA, FAKE_AMULET_OF_YENDOR, FALSE, FEDORA, FIGURINE, FLAIL, FLINT, FLYING, FM_FMON, FOOD_CLASS, FOOD_RATION, FORTUNE_COOKIE, FOUNTAIN, GAUNTLETS_OF_DEXTERITY, GEMSTONE, GEM_CLASS, GLAIVE, GLIB, GOLD_PIECE, GOLD_SYM, GRAPPLING_HOOK, GRAVE, GRAY_DRAGON_SCALES, GRAY_DRAGON_SCALE_MAIL, G_NOCORPSE, G_UNIQ, HAND, HAWAIIAN_SHIRT, HEAVY_IRON_BALL, HELMET, HELM_OF_TELEPATHY, HOLE, HORN_OF_PLENTY, ILLOBJ_CLASS, IRON, IRONBARS, IRON_BALL_W_INCR, IRON_SHOES, KATANA, KELP_FROND, KNIFE, LANDMINE, LAND_MINE, LARGE_BOX, LAST_GEM, LAVAPOOL, LEASH, LEATHER_GLOVES, LEMBAS_WAFER, LENSES, LEVITATION, LEVITATION_BOOTS, LOADSTONE, LOCK_PICK, LOW_BOOTS, LOW_PM, LUCKSTONE, LUMP_OF_ROYAL_JELLY, MAGIC_LAMP, MAGIC_MARKER, MAGIC_PORTAL, MAXOCLASSES, MEAT_RING, MINERAL, MITHRIL, MOAT, MS_GUARDIAN, MUMMY_WRAPPING, MV_KNOWS_EGG, M_AP_OBJECT, NON_PM, NO_TRAP, NUMOBUF, NUM_OBJECTS, OIL_LAMP, ORANGE, ORCISH_SHIELD, PICK_AXE, PLATE_MAIL, PM_ALIGNED_PRIEST, PM_GRAY_DRAGON, PM_HIGH_PRIEST, PM_LONG_WORM, PM_LONG_WORM_TAIL, PM_MAIL_DAEMON, PM_WIZARD_OF_YENDOR, PM_YELLOW_DRAGON, POOL, POTION_CLASS, POT_BOOZE, POT_OIL, POT_SLEEPING, POT_WATER, PREFIX, P_BOOMERANG, P_BOW, P_CROSSBOW, P_DART, P_HAMMER, P_NONE, P_POLEARMS, P_SHURIKEN, QBUFSZ, RANDOM_TIN, RING_CLASS, RIN_PROTECTION_FROM_SHAPE_CHAN, ROCK, ROCKTRAP, ROCK_CLASS, SACK, SCHAR_LIM, SCROLL_CLASS, SCR_BLANK_PAPER, SCR_MAIL, SHIELD_OF_REFLECTION, SHORT_SWORD, SILVER_SABER, SINK, SLIME_MOLD, SMALL_SHIELD, SPBOOK_CLASS, SPE_BLANK_PAPER, SPE_BOOK_OF_THE_DEAD, SPE_NOVEL, SPINACH, STATUE, STATUE_HISTORIC, STRANGE_OBJECT, S_arrow_trap, TALLOW_CANDLE, THRONE, TIN, TIN_OPENER, TOOLED_HORN, TOOL_CLASS, TOUCHSTONE, TRAPDOOR, TRAPNUM, TREE, TRUE, TT_LAVA, T_SHIRT, UNDEFINED, VENOM_CLASS, WAND_CLASS, WAN_WISHING, WARN_OF_MON, WAX_CANDLE, WEAPON_CLASS, WOODEN_HARP, W_AMUL, W_ARMOR, W_BALL, W_QUIVER, W_RING, W_RINGL, W_RINGR, W_SADDLE, W_SWAPWEP, W_TOOL, W_WEP, YELLOW_DRAGON_SCALES, YELLOW_DRAGON_SCALE_MAIL } from './consts.ts';

let Japanese_items: any;
let obufs: any;
let obufidx: number;
let distantname: number;
let wrp: any;
let wrpsym: any;
let special_subjs: any;
let one_off: any;
let as_is: any;
let o_ranges: any;
let spellings: any;
let singplur_compound$compounds: any;
let singplur_compound$compound_start: any;
let makeplural$already_plural: any;
let badman$no_men: any;
let badman$no_man: any;
let wishymatch$detect_SP: any;
let wishymatch$SP_detection: any;
let gloves_simple_name$gauntlets: any;

async function strprepend(s: Ptr | null, pref: Ptr | null): Promise<Ptr | null> {
  let i = strlen(pref) | 0;
  if (i > PREFIX) {
    await impossible(S("PREFIX too short (for %d)."), i);
    return s;
  }
  s = s.add(-i);
  strncpy(s, pref, $u64(i));
  return s;
}

function nextobuf(): Ptr | null {
  obufidx = (obufidx + 1) % NUMOBUF;
  return P(obufs[obufidx]);
}

function releaseobuf(bufp: Ptr | null): void {
  if (bufp.o >= P(obufs[obufidx]).o && bufp.o < P(obufs[obufidx]).add(256).o) {
    obufidx = (obufidx - 1 + NUMOBUF) % NUMOBUF;
  }
}

export async function obj_typename(otyp: number): Promise<Ptr | null> {
  let buf = nextobuf();
  let ocl = $sat(G.objects, otyp);
  let actualn = G.obj_descr[ocl.oc_name_idx].oc_name;
  let dn = G.obj_descr[ocl.oc_descr_idx].oc_descr;
  let un = ocl.oc_uname;
  let nn = ocl.oc_name_known | 0;
  if (G.urole.malenum === 339 && Japanese_item_name(otyp)) {
    actualn = Japanese_item_name(otyp);
  }
  buf.a[buf.o] = 0;
  switch (ocl.oc_class) {
  case COIN_CLASS:
    strcpy(buf, S("coin"));
    break;
  case POTION_CLASS:
    strcpy(buf, S("potion"));
    break;
  case SCROLL_CLASS:
    strcpy(buf, S("scroll"));
    break;
  case WAND_CLASS:
    strcpy(buf, S("wand"));
    break;
  case SPBOOK_CLASS:
    if (otyp !== SPE_NOVEL) {
      strcpy(buf, S("spellbook"));
    } else {
      strcpy(buf, !nn ? S("book") : S("novel"));
      nn = 0;
    }
    break;
  case RING_CLASS:
    strcpy(buf, S("ring"));
    break;
  case AMULET_CLASS:
    if (nn) {
      strcpy(buf, actualn);
    } else {
      strcpy(buf, S("amulet"));
    }
    if (un) {
      await xcalled(buf, BUFSZ - (dn ? (strlen(dn) | 0) + 3 : 0), S(""), un);
    }
    if (dn) {
      sprintf(eos(buf), S(" (%s)"), dn);
    }
    return buf;
  default:
    if (nn) {
      strcpy(buf, actualn);
      if (otyp === 446 || (G.objects[otyp].oc_material | 0) === GEMSTONE && (otyp !== 412 && otyp !== 414 && otyp !== 413 && otyp !== 416 && otyp !== 417 && otyp !== 418 && otyp !== 425)) {
        strcat(buf, S(" stone"));
      }
      if (un) {
        await xcalled(buf, BUFSZ - (dn ? (strlen(dn) | 0) + 3 : 0), S(""), un);
      }
      if (dn) {
        sprintf(eos(buf), S(" (%s)"), dn);
      }
    } else {
      strcpy(buf, dn ? dn : actualn);
      if (ocl.oc_class === GEM_CLASS) {
        strcat(buf, (ocl.oc_material | 0) === MINERAL ? S(" stone") : S(" gem"));
      }
      if (un) {
        await xcalled(buf, BUFSZ, S(""), un);
      }
    }
    return buf;
  }
  if (nn) {
    if (ocl.oc_unique) {
      strcpy(buf, actualn);
    } else {
      sprintf(eos(buf), S(" of %s"), actualn);
    }
  }
  if (un) {
    await xcalled(buf, BUFSZ - (dn ? (strlen(dn) | 0) + 3 : 0), S(""), un);
  }
  if (dn) {
    sprintf(eos(buf), S(" (%s)"), dn);
  }
  return buf;
}

export async function simple_typename(otyp: number): Promise<Ptr | null> {
  let bufp = null;
  let pp = null;
  let save_uname = G.objects[otyp].oc_uname;
  G.objects[otyp].oc_uname = null;
  bufp = await obj_typename(otyp);
  G.objects[otyp].oc_uname = save_uname;
  if (!!(pp = strstri(bufp, S(" (")))) {
    pp.a[pp.o] = 0;
  }
  return bufp;
}

export async function safe_typename(otyp: number): Promise<Ptr | null> {
  let save_nameknown = 0;
  let res = null;
  if (otyp < STRANGE_OBJECT || otyp >= NUM_OBJECTS || !G.obj_descr[G.objects[otyp].oc_name_idx].oc_name) {
    res = nextobuf();
    sprintf(res, S("glorkum[%d]"), otyp);
  } else {
    save_nameknown = G.objects[otyp].oc_name_known;
    G.objects[otyp].oc_name_known = 1;
    res = await simple_typename(otyp);
    G.objects[otyp].oc_name_known = (save_nameknown) & 1;
  }
  return res;
}

export function obj_is_pname(obj: struct_obj | null): number {
  if (!obj.oartifact || !(obj.oextra && obj.oextra.oname)) {
    return FALSE;
  }
  if (!G.program_state.gameover && !G.iflags.override_ID) {
    if (not_fully_identified(obj)) {
      return FALSE;
    }
  }
  return TRUE;
}

export async function distant_name(obj: struct_obj | null, func: Function | null): Promise<Ptr | null> {
  let str = null;
  ++distantname;
  str = await func(obj);
  --distantname;
  return str;
}

export async function fruitname(juice: number): Promise<Ptr | null> {
  let buf = nextobuf();
  let fruit_nam = strstri(P(G.pl_fruit), S(" of "));
  if (fruit_nam) {
    fruit_nam = fruit_nam.add(4);
  } else {
    fruit_nam = P(G.pl_fruit);
  }
  sprintf(buf, S("%s%s"), await makesingular(fruit_nam), juice ? S(" juice") : S(""));
  return buf;
}

export function fruit_from_indx(indx: number): struct_fruit | null {
  let f = null;
  for (f = G.ffruit; f; f = f.nextf) {
    if (f.fid === indx) {
      break;
    }
  }
  return f;
}

export async function fruit_from_name(fname: Ptr | null, exact: number, highest_fid: Ptr | null): Promise<struct_fruit | null> {
  let f = null;
  let tentativef = null;
  let altfname = null;
  let k = 0;
  if (highest_fid) {
    highest_fid.a[highest_fid.o] = 0;
  }
  for (f = G.ffruit; f; f = f.nextf) {
    if (!strcmp(P(f.fname), fname)) {
      return f;
    } else if (highest_fid && f.fid > highest_fid.a[highest_fid.o]) {
      highest_fid.a[highest_fid.o] = f.fid;
    }
  }
  if (!exact) {
    tentativef = null;
    for (f = G.ffruit; f; f = f.nextf) {
      k = strlen(P(f.fname)) >>> 0;
      if (!strncmp(P(f.fname), fname, k) && (!fname.a[fname.o + k] || fname.a[fname.o + k] === 32) && (!tentativef || k > strlen(P(tentativef.fname)))) {
        tentativef = f;
      }
    }
    f = tentativef;
  }
  if (!f) {
    altfname = await makesingular(fname);
    for (f = G.ffruit; f; f = f.nextf) {
      if (!strcmp(P(f.fname), altfname)) {
        break;
      }
    }
    releaseobuf(altfname);
  }
  if (!f && !exact) {
    let fnamebuf = new Int8Array(256);
    let p = null;
    let fname_k = strlen(fname) >>> 0;
    tentativef = null;
    for (f = G.ffruit; f; f = f.nextf) {
      k = strlen(P(f.fname)) >>> 0;
      strcpy(P(fnamebuf), fname);
      if (fname_k >= k && !!(p = strchr(P(fnamebuf, k), 32))) {
        p.a[p.o] = 0;
        altfname = await makesingular(P(fnamebuf));
        k = strlen(altfname) >>> 0;
        if (!strcmp(P(f.fname), altfname) && (!tentativef || k > strlen(P(tentativef.fname)))) {
          tentativef = f;
        }
        releaseobuf(altfname);
      }
    }
    f = tentativef;
  }
  return f;
}

export async function reorder_fruit(forward: number): Promise<void> {
  let f = null;
  let allfr = new Array(128).fill(null);
  let i = 0;
  let j = 0;
  let k = Math.trunc(1024 / 8) | 0;
  for (i = 0; i < k; ++i) {
    allfr[i] = null;
  }
  for (f = G.ffruit; f; f = f.nextf) {
    j = f.fid;
    if (j < 1 || j >= k) {
      await impossible(S("reorder_fruit: fruit index (%d) out of range"), j);
      return;
    } else if (allfr[j]) {
      await impossible(S("reorder_fruit: duplicate fruit index (%d)"), j);
      return;
    }
    allfr[j] = f;
  }
  G.ffruit = null;
  for (i = 1; i < k; ++i) {
    j = forward ? k - i : i;
    if (allfr[j]) {
      allfr[j].nextf = G.ffruit;
      G.ffruit = allfr[j];
    }
  }
}

async function xcalled(buf: Ptr | null, siz: number, pfx: Ptr | null, sfx: Ptr | null): Promise<void> {
  let bufsiz = siz - 1 - (strlen(buf) | 0);
  let pfxlen = strlen(pfx) + 9 - 1 | 0;
  if (pfxlen > bufsiz) {
    await panic(S("xcalled: not enough room for prefix (%d > %d)"), pfxlen, bufsiz);
  }
  sprintf(eos(buf), S("%s called %.*s"), pfx, bufsiz - pfxlen, sfx);
}

export async function xname(obj: struct_obj | null): Promise<Ptr | null> {
  return await xname_flags(obj, CXN_NORMAL);
}

async function xname_flags(obj: struct_obj | null, cxn_flags: number): Promise<Ptr | null> {
  let $g = 0;
  let buf = null;
  let typ = 0;
  let ocl = null;
  let nn = 0;
  let omndx = 0;
  let actualn = null;
  let dn = null;
  let un = null;
  let pluralize = 0;
  let known = 0;
  let dknown = 0;
  let bknown = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      typ = obj.otyp;
      ocl = $sat(G.objects, typ);
      nn = ocl.oc_name_known | 0;
      omndx = obj.corpsenm;
      actualn = G.obj_descr[ocl.oc_name_idx].oc_name;
      dn = G.obj_descr[ocl.oc_descr_idx].oc_descr;
      un = ocl.oc_uname;
      pluralize = (obj.quan !== 1 && !((cxn_flags & CXN_SINGULAR) >>> 0) ? 1 : 0) << 24 >> 24;
      buf = nextobuf().add(PREFIX);
      if (G.urole.malenum === 339 && Japanese_item_name(typ)) {
        actualn = Japanese_item_name(typ);
      }
      if (!dn) {
        dn = actualn;
      }
      buf.a[buf.o] = 0;
      if (!nn && ocl.oc_uses_known | 0 && ocl.oc_unique | 0) {
        obj.known = 0;
      }
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && !distantname) {
        obj.dknown = 1;
      }
      if (G.urole.malenum === 335) {
        obj.bknown = 1;
      }
      if (G.iflags.override_ID) {
        known = dknown = bknown = TRUE;
        nn = 1;
      } else {
        known = obj.known << 24 >> 24;
        dknown = obj.dknown << 24 >> 24;
        bknown = obj.bknown << 24 >> 24;
      }
      if (obj_is_pname(obj)) {
        { $g = 1; continue $L; }
      }
      switch (obj.oclass) {
      case AMULET_CLASS:
        if (!dknown) {
          strcpy(buf, S("amulet"));
        } else if (typ === AMULET_OF_YENDOR || typ === FAKE_AMULET_OF_YENDOR) {
          strcpy(buf, known ? actualn : dn);
        } else if (nn) {
          strcpy(buf, actualn);
        } else if (un) {
          await xcalled(buf, BUFSZ - PREFIX, S("amulet"), un);
        } else {
          sprintf(buf, S("%s amulet"), dn);
        }
        break;
      case WEAPON_CLASS:
        if (obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[obj.otyp].oc_subtyp <= -P_BOW && obj.otrapped | 0) {
          strcpy(buf, S("poisoned "));
        }
      case VENOM_CLASS:
      case TOOL_CLASS:
        if (typ === LENSES) {
          strcpy(buf, S("pair of "));
        } else if (obj.otyp === 209 && obj.spe > 0) {
          strcpy(buf, obj.spe < 3 ? S("moist ") : S("wet "));
        }
        if (!dknown) {
          strcat(buf, dn);
        } else if (nn) {
          strcat(buf, actualn);
        } else if (un) {
          await xcalled(buf, BUFSZ - PREFIX, dn, un);
        } else {
          strcat(buf, dn);
        }
        if (typ === FIGURINE && omndx !== NON_PM) {
          let anbuf = new Int8Array(10);
          sprintf(eos(buf), S(" of %s%s"), just_an(P(anbuf), G.mons[omndx].mname), G.mons[omndx].mname);
        } else if (obj.otyp === 209 && obj.spe > 0) {
          if (G.flags.debug) {
            sprintf(eos(buf), S(" (%d)"), obj.spe);
          }
        }
        break;
      case ARMOR_CLASS:
        if (typ >= GRAY_DRAGON_SCALES && typ <= YELLOW_DRAGON_SCALES) {
          sprintf(buf, S("set of %s"), actualn);
          break;
        }
        if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_BOOTS || obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_GLOVES) {
          strcpy(buf, S("pair of "));
        }
        if (obj.otyp >= ELVEN_SHIELD && obj.otyp <= ORCISH_SHIELD && !dknown) {
          strcpy(buf, S("shield"));
          break;
        }
        if (obj.otyp === SHIELD_OF_REFLECTION && !dknown) {
          strcpy(buf, S("smooth shield"));
          break;
        }
        if (nn) {
          strcat(buf, actualn);
        } else if (un) {
          if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_BOOTS) {
            strcat(buf, S("boots"));
          } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_GLOVES) {
            strcat(buf, S("gloves"));
          } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_CLOAK) {
            strcpy(buf, S("cloak"));
          } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_HELM) {
            strcpy(buf, S("helmet"));
          } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIELD) {
            strcpy(buf, S("shield"));
          } else {
            strcpy(buf, S("armor"));
          }
          strcat(buf, S(" called "));
          strcat(buf, un);
        } else {
          strcat(buf, dn);
        }
        break;
      case FOOD_CLASS:
        if (typ === SLIME_MOLD) {
          let f = fruit_from_indx(obj.spe);
          if (!f) {
            await impossible(S("Bad fruit #%d?"), obj.spe);
            strcpy(buf, S("fruit"));
          } else {
            strcpy(buf, P(f.fname));
            if (pluralize) {
              strcpy(buf, await makeplural(await makesingular(buf)));
              pluralize = FALSE;
            }
          }
          break;
        }
        if (obj.globby) {
          sprintf(buf, S("%s%s"), obj.owt <= 100 ? S("small ") : obj.owt > 500 ? S("very large ") : obj.owt > 300 ? S("large ") : S(""), actualn);
          break;
        }
        strcpy(buf, actualn);
        if (typ === TIN && known) {
          tin_details(obj, omndx, buf);
        }
        break;
      case COIN_CLASS:
      case CHAIN_CLASS:
        strcpy(buf, actualn);
        break;
      case ROCK_CLASS:
        if (typ === STATUE && omndx !== NON_PM) {
          let anbuf = new Int8Array(10);
          sprintf(buf, S("%s%s of %s%s"), G.urole.malenum === 328 && obj.spe & STATUE_HISTORIC ? S("historic ") : S(""), actualn, ($sat(G.mons, omndx).mflags2 & 524288) >>> 0 !== 0 ? S("") : the_unique_pm($sat(G.mons, omndx)) ? S("the ") : just_an(P(anbuf), G.mons[omndx].mname), G.mons[omndx].mname);
        } else {
          strcpy(buf, actualn);
        }
        break;
      case BALL_CLASS:
        sprintf(buf, S("%sheavy iron ball"), obj.owt > ocl.oc_weight ? S("very ") : S(""));
        break;
      case POTION_CLASS:
        if (dknown && obj.oeroded | 0) {
          strcpy(buf, S("diluted "));
        }
        if (nn || un || !dknown) {
          strcat(buf, S("potion"));
          if (!dknown) {
            break;
          }
          if (nn) {
            strcat(buf, S(" of "));
            if (typ === POT_WATER && bknown && (obj.blessed | 0 || obj.cursed | 0)) {
              strcat(buf, obj.blessed | 0 ? S("holy ") : S("unholy "));
            }
            strcat(buf, actualn);
          } else {
            await xcalled(buf, BUFSZ - PREFIX, S(""), un);
          }
        } else {
          strcat(buf, dn);
          strcat(buf, S(" potion"));
        }
        break;
      case SCROLL_CLASS:
        strcpy(buf, S("scroll"));
        if (!dknown) {
          break;
        }
        if (nn) {
          strcat(buf, S(" of "));
          strcat(buf, actualn);
        } else if (un) {
          await xcalled(buf, BUFSZ - PREFIX, S(""), un);
        } else if (ocl.oc_magic) {
          strcat(buf, S(" labeled "));
          strcat(buf, dn);
        } else {
          strcpy(buf, dn);
          strcat(buf, S(" scroll"));
        }
        break;
      case WAND_CLASS:
        if (!dknown) {
          strcpy(buf, S("wand"));
        } else if (nn) {
          sprintf(buf, S("wand of %s"), actualn);
        } else if (un) {
          await xcalled(buf, BUFSZ - PREFIX, S("wand"), un);
        } else {
          sprintf(buf, S("%s wand"), dn);
        }
        break;
      case SPBOOK_CLASS:
        if (typ === SPE_NOVEL) {
          if (!dknown) {
            strcpy(buf, S("book"));
          } else if (nn) {
            strcpy(buf, actualn);
          } else if (un) {
            await xcalled(buf, BUFSZ - PREFIX, S("novel"), un);
          } else {
            sprintf(buf, S("%s book"), dn);
          }
          break;
        } else if (!dknown) {
          strcpy(buf, S("spellbook"));
        } else if (nn) {
          if (typ !== SPE_BOOK_OF_THE_DEAD) {
            strcpy(buf, S("spellbook of "));
          }
          strcat(buf, actualn);
        } else if (un) {
          await xcalled(buf, BUFSZ - PREFIX, S("spellbook"), un);
        } else {
          sprintf(buf, S("%s spellbook"), dn);
        }
        break;
      case RING_CLASS:
        if (!dknown) {
          strcpy(buf, S("ring"));
        } else if (nn) {
          sprintf(buf, S("ring of %s"), actualn);
        } else if (un) {
          await xcalled(buf, BUFSZ - PREFIX, S("ring"), un);
        } else {
          sprintf(buf, S("%s ring"), dn);
        }
        break;
      case GEM_CLASS:
        {
          let rock = (ocl.oc_material | 0) === MINERAL ? S("stone") : S("gem");
          if (!dknown) {
            strcpy(buf, rock);
          } else if (!nn) {
            if (un) {
              await xcalled(buf, BUFSZ - PREFIX, rock, un);
            } else {
              sprintf(buf, S("%s %s"), dn, rock);
            }
          } else {
            strcpy(buf, actualn);
            if (typ === 446 || (G.objects[typ].oc_material | 0) === GEMSTONE && (typ !== 412 && typ !== 414 && typ !== 413 && typ !== 416 && typ !== 417 && typ !== 418 && typ !== 425)) {
              strcat(buf, S(" stone"));
            }
          }
          break;
        }
      default:
        sprintf(buf, S("glorkum %d %d %d"), obj.oclass, typ, obj.spe);
      }
      if (pluralize) {
        strcpy(buf, await makeplural(buf));
      }
      if (obj.otyp === T_SHIRT && G.program_state.gameover) {
        let tmpbuf = new Int8Array(256);
        sprintf(eos(buf), S(" with text \"%s\""), tshirt_text(obj, P(tmpbuf)));
      }
      if (!(obj.oextra && obj.oextra.oname && dknown)) { $g = 2; continue $L; }
      strcat(buf, S(" named "));
    case 1: // nameit
      strncat(buf, obj.oextra.oname, BUFSZ - 1 - PREFIX - (strlen(buf) >>> 0) >>> 0);
    case 2:
      if (!strncmpi(buf, S("the "), 4)) {
        buf = buf.add(4);
      }
      return buf;
    }
    break;
  }
}

async function minimal_xname(obj: struct_obj | null): Promise<Ptr | null> {
  let bufp = null;
  let bareobj = new struct_obj();
  let saveobcls = new struct_objclass();
  let otyp = obj.otyp;
  saveobcls.oc_uname = G.objects[otyp].oc_uname;
  G.objects[otyp].oc_uname = null;
  saveobcls.oc_name_known = (G.objects[otyp].oc_name_known) & 1;
  if (!obj.dknown) {
    G.objects[otyp].oc_name_known = 0;
  }
  bareobj.$cp(G.zeroobj);
  bareobj.otyp = otyp << 16 >> 16;
  bareobj.oclass = obj.oclass;
  bareobj.dknown = (obj.dknown) & 1;
  bareobj.known = ((obj.oclass === AMULET_CLASS ? obj.known | 0 : !G.objects[otyp].oc_uses_known ? 1 : 0) >>> 0) & 1;
  bareobj.quan = 1;
  bareobj.corpsenm = NON_PM;
  if (obj.otyp === SLIME_MOLD) {
    bareobj.spe = obj.spe;
  }
  bufp = await distant_name(bareobj, xname);
  if (!strncmp(bufp, S("uncursed "), 9)) {
    bufp = bufp.add(9);
  }
  G.objects[otyp].oc_uname = saveobcls.oc_uname;
  G.objects[otyp].oc_name_known = (saveobcls.oc_name_known) & 1;
  return bufp;
}

export async function mshot_xname(obj: struct_obj | null): Promise<Ptr | null> {
  let tmpbuf = new Int8Array(256);
  let onm = await xname(obj);
  if (G.m_shot.n > 1 && G.m_shot.o === obj.otyp) {
    sprintf(P(tmpbuf), S("the %d%s "), G.m_shot.i, ordin(G.m_shot.i));
    onm = await strprepend(onm, P(tmpbuf));
  }
  return onm;
}

export function the_unique_obj(obj: struct_obj | null): number {
  let known = (obj.known | 0 || G.iflags.override_ID ? 1 : 0) << 24 >> 24;
  if (!obj.dknown && !G.iflags.override_ID) {
    return FALSE;
  } else if (obj.otyp === FAKE_AMULET_OF_YENDOR && !known) {
    return TRUE;
  } else {
    return (G.objects[obj.otyp].oc_unique | 0 && (known || obj.otyp === AMULET_OF_YENDOR) ? 1 : 0) << 24 >> 24;
  }
}

export function the_unique_pm(ptr: struct_permonst | null): number {
  let uniq = 0;
  if ((ptr.mflags2 & 524288) >>> 0 !== 0) {
    return FALSE;
  }
  uniq = (ptr.geno & G_UNIQ ? TRUE : FALSE) << 24 >> 24;
  if (ptr === $sat(G.mons, PM_HIGH_PRIEST) || ptr === $sat(G.mons, PM_LONG_WORM_TAIL)) {
    uniq = FALSE;
  }
  if (ptr === $sat(G.mons, PM_WIZARD_OF_YENDOR)) {
    uniq = TRUE;
  }
  return uniq;
}

function add_erosion_words(obj: struct_obj | null, prefix: Ptr | null): void {
  let iscrys = (obj.otyp === CRYSKNIFE ? 1 : 0) << 24 >> 24;
  let rknown = 0;
  rknown = (G.iflags.override_ID === 0 ? obj.rknown | 0 : TRUE) << 24 >> 24;
  if (!((G.objects[obj.otyp].oc_material | 0) === IRON || is_flammable(obj) || is_rottable(obj) || ((G.objects[obj.otyp].oc_material | 0) === COPPER || (G.objects[obj.otyp].oc_material | 0) === IRON)) && !iscrys) {
    return;
  }
  if (obj.oeroded | 0 && !iscrys) {
    switch (obj.oeroded | 0) {
    case 2:
      strcat(prefix, S("very "));
      break;
    case 3:
      strcat(prefix, S("thoroughly "));
      break;
    }
    strcat(prefix, (G.objects[obj.otyp].oc_material | 0) === IRON ? S("rusty ") : S("burnt "));
  }
  if (obj.oeroded2 | 0 && !iscrys) {
    switch (obj.oeroded2 | 0) {
    case 2:
      strcat(prefix, S("very "));
      break;
    case 3:
      strcat(prefix, S("thoroughly "));
      break;
    }
    strcat(prefix, (G.objects[obj.otyp].oc_material | 0) === COPPER || (G.objects[obj.otyp].oc_material | 0) === IRON ? S("corroded ") : S("rotted "));
  }
  if (rknown && obj.oerodeproof | 0) {
    strcat(prefix, iscrys ? S("fixed ") : (G.objects[obj.otyp].oc_material | 0) === IRON ? S("rustproof ") : (G.objects[obj.otyp].oc_material | 0) === COPPER || (G.objects[obj.otyp].oc_material | 0) === IRON ? S("corrodeproof ") : is_flammable(obj) ? S("fireproof ") : S(""));
  }
}

export function erosion_matters(obj: struct_obj | null): number {
  switch (obj.oclass) {
  case TOOL_CLASS:
    return (obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE ? TRUE : FALSE) << 24 >> 24;
  case WEAPON_CLASS:
  case ARMOR_CLASS:
  case BALL_CLASS:
  case CHAIN_CLASS:
    return TRUE;
  default:
    break;
  }
  return FALSE;
}

async function doname_base(obj: struct_obj | null, doname_flags: number): Promise<Ptr | null> {
  let $g = 0;
  let ispoisoned = 0;
  let with_price = 0;
  let vague_quan = 0;
  let weightshown = new Int8Array(1);
  let known = 0;
  let dknown = 0;
  let cknown = 0;
  let bknown = 0;
  let lknown = 0;
  let omndx = 0;
  let prefix = new Int8Array(80);
  let globbuf = new Int8Array(128);
  let tmpbuf = new Int8Array(81);
  let bp = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      ispoisoned = FALSE;
      with_price = ((doname_flags & DONAME_WITH_PRICE) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      vague_quan = ((doname_flags & DONAME_VAGUE_QUAN) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      weightshown[0] = FALSE;
      omndx = obj.corpsenm;
      prefix = new Int8Array(80);
      globbuf = new Int8Array(128);
      tmpbuf = new Int8Array(81);
      bp = await xname(obj);
      if (G.iflags.override_ID) {
        known = dknown = cknown = bknown = lknown = TRUE;
      } else {
        known = obj.known << 24 >> 24;
        dknown = obj.dknown << 24 >> 24;
        cknown = obj.cknown << 24 >> 24;
        bknown = obj.bknown << 24 >> 24;
        lknown = obj.lknown << 24 >> 24;
      }
      if (!strncmp(bp, S("poisoned "), 9) && obj.otrapped | 0) {
        bp = bp.add(9);
        ispoisoned = TRUE;
      }
      if (obj.quan !== 1) {
        if (dknown || !vague_quan) {
          sprintf(P(prefix), S("%ld "), obj.quan);
        } else {
          strcpy(P(prefix), S("some "));
        }
      } else if (obj.otyp === CORPSE) {
        $wr(P(prefix), 0, 0);
      } else if (obj_is_pname(obj) || the_unique_obj(obj)) {
        if (!strncmpi(bp, S("the "), 4)) {
          bp = bp.add(4);
        }
        strcpy(P(prefix), S("the "));
      } else {
        strcpy(P(prefix), S("a "));
      }
      if (cknown && (obj.otyp === BAG_OF_TRICKS ? obj.spe === 0 && !obj.known ? 1 : 0 : (obj.otyp >= 189 && obj.otyp <= 195 || obj.otyp === STATUE) && !!!obj.cobj ? 1 : 0)) {
        strcat(P(prefix), S("empty "));
      }
      if (bknown && obj.oclass !== COIN_CLASS && (obj.otyp !== POT_WATER || !G.objects[POT_WATER].oc_name_known || !obj.cursed && !obj.blessed)) {
        if (obj.cursed) {
          strcat(P(prefix), S("cursed "));
        } else if (obj.blessed) {
          strcat(P(prefix), S("blessed "));
        } else if (!G.iflags.implicit_uncursed || (!known || !G.objects[obj.otyp].oc_charged || obj.oclass === ARMOR_CLASS || obj.oclass === RING_CLASS) && obj.otyp !== SCR_MAIL && obj.otyp !== FAKE_AMULET_OF_YENDOR && obj.otyp !== AMULET_OF_YENDOR && !(G.urole.malenum === 335)) {
          strcat(P(prefix), S("uncursed "));
        }
      }
      if (lknown && (obj.otyp === 189 || obj.otyp === 190)) {
        if (obj.obroken) {
          strcat(P(prefix), S("broken "));
        } else if (obj.olocked) {
          strcat(P(prefix), S("locked "));
        } else {
          strcat(P(prefix), S("unlocked "));
        }
      }
      if (obj.greased) {
        strcat(P(prefix), S("greased "));
      }
      if (cknown && !!obj.cobj) {
        let itemcount = await count_contents(obj, FALSE, FALSE, TRUE, FALSE);
        sprintf(eos(bp), S(" containing %ld item%s"), itemcount, itemcount === 1 ? S("") : S("s"));
      }
      switch (obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE ? WEAPON_CLASS : obj.oclass) {
      case AMULET_CLASS: { $g = 4; continue $L; }
      case ARMOR_CLASS: { $g = 5; continue $L; }
      case WEAPON_CLASS: { $g = 6; continue $L; }
      case TOOL_CLASS: { $g = 7; continue $L; }
      case WAND_CLASS: { $g = 8; continue $L; }
      case POTION_CLASS: { $g = 9; continue $L; }
      case RING_CLASS: { $g = 10; continue $L; }
      case FOOD_CLASS: { $g = 11; continue $L; }
      case BALL_CLASS: { $g = 12; continue $L; }
      case CHAIN_CLASS: { $g = 13; continue $L; }
      default: { $g = 3; continue $L; }
      }
    case 4:
      if (obj.owornmask & W_AMUL) {
        strcat(bp, S(" (being worn)"));
      }
      { $g = 3; continue $L; };
    case 5:
      if (obj.owornmask & W_ARMOR) {
        strcat(bp, obj === G.uskin ? S(" (embedded in your skin)") : doffing(obj) ? S(" (being doffed)") : donning(obj) ? S(" (being donned)") : S(" (being worn)"));
        if (obj === G.uarmg && G.u.uprops[GLIB].intrinsic) {
          strcpy(strrchr(bp, 41), S("; slippery)"));
        }
      }
    case 6:
      if (ispoisoned) {
        strcat(P(prefix), S("poisoned "));
      }
      add_erosion_words(obj, P(prefix));
      if (known) {
        strcat(P(prefix), sitoa(obj.spe));
        strcat(P(prefix), S(" "));
      }
      { $g = 3; continue $L; };
    case 7:
      if (obj.owornmask & (W_TOOL | W_SADDLE)) {
        strcat(bp, S(" (being worn)"));
        { $g = 3; continue $L; };
      }
      if (obj.otyp === LEASH && obj.corpsenm !== 0) {
        let mlsh = find_mid(obj.corpsenm >>> 0, FM_FMON);
        if (!mlsh) {
          await impossible(S("leashed monster not on this level"));
          obj.corpsenm = 0;
        } else {
          sprintf(eos(bp), S(" (attached to %s)"), await noit_mon_nam(mlsh));
        }
        { $g = 3; continue $L; };
      }
      if (obj.otyp === CANDELABRUM_OF_INVOCATION) {
        if (!obj.spe) {
          strcpy(P(tmpbuf), S("no"));
        } else {
          sprintf(P(tmpbuf), S("%d"), obj.spe);
        }
        sprintf(eos(bp), S(" (%s candle%s%s)"), P(tmpbuf), obj.spe === 1 ? S("") : S("s"), !obj.lamplit ? S(" attached") : S(", lit"));
        { $g = 3; continue $L; };
      } else if (obj.otyp === OIL_LAMP || obj.otyp === MAGIC_LAMP || obj.otyp === BRASS_LANTERN || (obj.otyp === 199 || obj.otyp === 200)) {
        if ((obj.otyp === 199 || obj.otyp === 200) && obj.age < 20 * G.objects[obj.otyp].oc_cost) {
          strcat(P(prefix), S("partly used "));
        }
        if (obj.lamplit) {
          strcat(bp, S(" (lit)"));
        }
        { $g = 3; continue $L; };
      }
      if (G.objects[obj.otyp].oc_charged) {
        { $g = 1; continue $L; }
      }
      { $g = 3; continue $L; };
    case 8:
    case 1: // charges
      if (known) {
        sprintf(eos(bp), S(" (%d:%d)"), obj.recharged | 0, obj.spe);
      }
      { $g = 3; continue $L; };
    case 9:
      if (obj.otyp === POT_OIL && obj.lamplit | 0) {
        strcat(bp, S(" (lit)"));
      }
      { $g = 3; continue $L; };
    case 10:
    case 2: // ring
      if (obj.owornmask & W_RINGR) {
        strcat(bp, S(" (on right "));
      }
      if (obj.owornmask & W_RINGL) {
        strcat(bp, S(" (on left "));
      }
      if (obj.owornmask & W_RING) {
        strcat(bp, body_part(HAND));
        strcat(bp, S(")"));
      }
      if (known && G.objects[obj.otyp].oc_charged | 0) {
        strcat(P(prefix), sitoa(obj.spe));
        strcat(P(prefix), S(" "));
      }
      { $g = 3; continue $L; };
    case 11:
      if (obj.oeaten) {
        strcat(P(prefix), S("partly eaten "));
      }
      if (obj.otyp === CORPSE) {
        let cxarg = ((obj.quan !== 1 ? 0 : CXN_ARTICLE) | CXN_NOCORPSE) >>> 0;
        let cxstr = await corpse_xname(obj, P(prefix), cxarg);
        sprintf(P(prefix), S("%s "), cxstr);
        releaseobuf(cxstr);
      } else if (obj.otyp === EGG) {
        if (omndx >= LOW_PM && (known || G.mvitals[omndx].mvflags & MV_KNOWS_EGG)) {
          strcat(P(prefix), G.mons[omndx].mname);
          strcat(P(prefix), S(" "));
          if (obj.spe) {
            strcat(bp, S(" (laid by you)"));
          }
        }
      }
      if (obj.otyp === MEAT_RING) {
        { $g = 2; continue $L; }
      }
      { $g = 3; continue $L; };
    case 12:
    case 13:
      add_erosion_words(obj, P(prefix));
      if (obj.owornmask & W_BALL) {
        strcat(bp, S(" (chained to you)"));
      }
      { $g = 3; continue $L; };
    case 3:
      if (obj.owornmask & W_WEP && !G.mrg_to_wielded) {
        if (obj.quan !== 1) {
          strcat(bp, S(" (wielded)"));
        } else {
          let hand_s = body_part(HAND);
          if ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0) {
            hand_s = await makeplural(hand_s);
          }
          sprintf(eos(bp), S(" (%sweapon in %s)"), obj.otyp === AKLYS ? S("tethered ") : S(""), hand_s);
          if (G.warn_obj_cnt && obj === G.uwep && (G.u.uprops[WARN_OF_MON].extrinsic & W_WEP) !== 0) {
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              sprintf(eos(bp).add(-1), S(", %s %s)"), glow_verb(G.warn_obj_cnt, TRUE), glow_color(obj.oartifact));
            }
          }
        }
      }
      if (obj.owornmask & W_SWAPWEP) {
        if (G.u.twoweap) {
          sprintf(eos(bp), S(" (wielded in other %s)"), body_part(HAND));
        } else {
          strcat(bp, S(" (alternate weapon; not wielded)"));
        }
      }
      if (obj.owornmask & W_QUIVER) {
        switch (obj.oclass) {
        case WEAPON_CLASS:
          if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
            if (G.objects[obj.otyp].oc_subtyp === -P_BOW) {
              strcat(bp, S(" (in quiver)"));
              break;
            } else {
              strcat(bp, S(" (in quiver pouch)"));
              break;
            }
          } else {
            strcat(bp, S(" (at the ready)"));
            break;
          }
        case RING_CLASS:
        case AMULET_CLASS:
        case WAND_CLASS:
        case COIN_CLASS:
        case GEM_CLASS:
          strcat(bp, S(" (in quiver pouch)"));
          break;
        default:
          strcat(bp, S(" (at the ready)"));
        }
      }
      if (G.iflags.suppress_price || G.restoring) {
        ;
      } else if (is_unpaid(obj)) {
        let quotedprice = await unpaid_cost(obj, TRUE);
        sprintf(eos(bp), S(" (%s, %s%ld %s)"), obj.unpaid | 0 ? S("unpaid") : S("contents"), globwt(obj, P(globbuf), P(weightshown, 0)), quotedprice, await currency(quotedprice));
      } else if (with_price) {
        const nochrg = new Int32Array(1);
        nochrg[0] = 0;
        let price = await get_cost_of_shop_item(obj, P(nochrg, 0));
        if (price > 0) {
          sprintf(eos(bp), S(" (%s, %s%ld %s)"), nochrg[0] ? S("contents") : S("for sale"), globwt(obj, P(globbuf), P(weightshown, 0)), price, await currency(price));
        } else if (nochrg[0] > 0) {
          sprintf(eos(bp), S(" (%sno charge)"), globwt(obj, P(globbuf), P(weightshown, 0)));
        }
      }
      if (!strncmp(P(prefix), S("a "), 2)) {
        strcpy(P(tmpbuf), P(prefix).add(2));
        just_an(P(prefix), $rd(P(tmpbuf)) ? P(tmpbuf) : bp);
        strcat(P(prefix), P(tmpbuf));
      }
      if (G.flags.debug && G.iflags.wizweight) {
        if (!weightshown[0]) {
          sprintf(eos(bp), S(" (%u aum)"), obj.owt);
        }
      }
      bp = await strprepend(bp, P(prefix));
      return bp;
    }
    break;
  }
}

export async function doname(obj: struct_obj | null): Promise<Ptr | null> {
  return await doname_base(obj, 0);
}

export async function doname_with_price(obj: struct_obj | null): Promise<Ptr | null> {
  return await doname_base(obj, DONAME_WITH_PRICE);
}

export async function doname_vague_quan(obj: struct_obj | null): Promise<Ptr | null> {
  return await doname_base(obj, DONAME_VAGUE_QUAN);
}

export function not_fully_identified(otmp: struct_obj | null): number {
  if (otmp.oclass === COIN_CLASS) {
    return FALSE;
  }
  if (!otmp.known || !otmp.dknown || !otmp.bknown && otmp.otyp !== SCR_MAIL || !G.objects[otmp.otyp].oc_name_known) {
    return TRUE;
  }
  if (!otmp.cknown && (otmp.otyp >= 189 && otmp.otyp <= 195 || otmp.otyp === STATUE) || !otmp.lknown && (otmp.otyp === 189 || otmp.otyp === 190)) {
    return TRUE;
  }
  if (otmp.oartifact && undiscovered_artifact(otmp.oartifact)) {
    return TRUE;
  }
  if (otmp.rknown | 0 || otmp.oclass !== ARMOR_CLASS && otmp.oclass !== WEAPON_CLASS && !(otmp.oclass === TOOL_CLASS && G.objects[otmp.otyp].oc_subtyp !== P_NONE) && otmp.oclass !== BALL_CLASS) {
    return FALSE;
  } else {
    return ((G.objects[otmp.otyp].oc_material | 0) === IRON || ((G.objects[otmp.otyp].oc_material | 0) === COPPER || (G.objects[otmp.otyp].oc_material | 0) === IRON) || is_flammable(otmp) ? 1 : 0) << 24 >> 24;
  }
}

export async function corpse_xname(otmp: struct_obj | null, adjective: Ptr | null, cxn_flags: number): Promise<Ptr | null> {
  let nambuf = nextobuf().add(PREFIX);
  let omndx = otmp.corpsenm;
  let ignore_quan = ((cxn_flags & CXN_SINGULAR) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let no_prefix = ((cxn_flags & CXN_NO_PFX) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let the_prefix = ((cxn_flags & CXN_PFX_THE) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let any_prefix = ((cxn_flags & CXN_ARTICLE) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let omit_corpse = ((cxn_flags & CXN_NOCORPSE) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let possessive = FALSE;
  let glob = (otmp.otyp !== CORPSE && otmp.globby | 0 ? 1 : 0) << 24 >> 24;
  let mname = null;
  if (glob) {
    mname = G.obj_descr[G.objects[otmp.otyp].oc_name_idx].oc_name;
  } else if (omndx === NON_PM) {
    mname = S("thing");
  } else if (omndx === PM_ALIGNED_PRIEST) {
    mname = S("priest");
  } else {
    mname = G.mons[omndx].mname;
    if (the_unique_pm($sat(G.mons, omndx)) || ($sat(G.mons, omndx).mflags2 & 524288) >>> 0 !== 0) {
      mname = s_suffix(mname);
      possessive = TRUE;
      if (($sat(G.mons, omndx).mflags2 & 524288) >>> 0 !== 0) {
        no_prefix = TRUE;
      } else if (the_unique_pm($sat(G.mons, omndx)) && !no_prefix) {
        the_prefix = TRUE;
      }
    }
  }
  if (no_prefix) {
    the_prefix = any_prefix = FALSE;
  } else if (the_prefix) {
    any_prefix = FALSE;
  }
  nambuf.a[nambuf.o] = 0;
  if (the_prefix) {
    strcat(nambuf, S("the "));
  }
  if (!adjective || !adjective.a[adjective.o]) {
    strcat(nambuf, mname);
  } else {
    if (possessive) {
      sprintf(eos(nambuf), S("%s %s"), mname, adjective);
    } else {
      sprintf(eos(nambuf), S("%s %s"), adjective, mname);
    }
    mungspaces(nambuf);
    if (digit(adjective.a[adjective.o])) {
      any_prefix = FALSE;
    }
  }
  if (glob) {
    ;
  } else if (!omit_corpse) {
    strcat(nambuf, S(" corpse"));
    if (otmp.quan > 1 && !ignore_quan) {
      strcat(nambuf, S("s"));
      any_prefix = FALSE;
    }
  }
  if (any_prefix) {
    strcpy(nambuf, await an(nambuf));
  }
  return nambuf;
}

export async function cxname(obj: struct_obj | null): Promise<Ptr | null> {
  if (obj.otyp === CORPSE) {
    return await corpse_xname(obj, null, CXN_NORMAL);
  }
  return await xname(obj);
}

export async function cxname_singular(obj: struct_obj | null): Promise<Ptr | null> {
  if (obj.otyp === CORPSE) {
    return await corpse_xname(obj, null, CXN_SINGULAR);
  }
  return await xname_flags(obj, CXN_SINGULAR);
}

export async function killer_xname(obj: struct_obj | null): Promise<Ptr | null> {
  let save_obj = new struct_obj();
  let save_ocknown = 0;
  let buf = null;
  let save_ocuname = null;
  let save_oname = null;
  if (obj.oartifact) {
    return await bare_artifactname(obj);
  }
  save_obj.$cp(obj);
  if (obj.oextra && obj.oextra.oname) {
    save_oname = obj.oextra.oname;
  }
  obj.known = (obj.dknown = 1) & 1;
  obj.bknown = (obj.rknown = (obj.greased = 0) & 1) & 1;
  if (obj.otyp !== POT_WATER) {
    obj.blessed = (obj.cursed = 0) & 1;
  } else {
    obj.bknown = 1;
  }
  obj.otrapped = 0;
  if (!obj.oartifact && save_oname) {
    obj.oextra.oname = null;
  }
  save_ocknown = G.objects[obj.otyp].oc_name_known;
  G.objects[obj.otyp].oc_name_known = 1;
  save_ocuname = G.objects[obj.otyp].oc_uname;
  G.objects[obj.otyp].oc_uname = null;
  if (obj.otyp === CORPSE) {
    buf = await corpse_xname(obj, null, CXN_NORMAL);
  } else if (obj.otyp === SLIME_MOLD) {
    buf = nextobuf();
    sprintf(buf, S("deadly slime mold%s"), obj.quan === 1 ? S("") : S("s"));
  } else {
    buf = await xname(obj);
  }
  if (obj.quan === 1 && !strstri(buf, S("'s ")) && !strstri(buf, S("s' "))) {
    buf = obj_is_pname(obj) || the_unique_obj(obj) ? await the(buf) : await an(buf);
  }
  G.objects[obj.otyp].oc_name_known = (save_ocknown) & 1;
  G.objects[obj.otyp].oc_uname = save_ocuname;
  obj.$cp(save_obj);
  if (!obj.oartifact && save_oname) {
    obj.oextra.oname = save_oname;
  }
  return buf;
}

export async function short_oname(obj: struct_obj | null, func: Function | null, altfunc: Function | null, lenlimit: number): Promise<Ptr | null> {
  let save_obj = new struct_obj();
  let unamebuf = new Int8Array(12);
  let onamebuf = new Int8Array(12);
  let save_oname = null;
  let save_uname = null;
  let outbuf = null;
  outbuf = await func(obj);
  if (strlen(outbuf) >>> 0 <= lenlimit) {
    return outbuf;
  }
  save_uname = G.objects[obj.otyp].oc_uname;
  if (save_uname && strlen(save_uname) >= 12) {
    strncpy(P(unamebuf), save_uname, 12 - 4);
    strcpy(P(unamebuf).add(12).add(-4), S("..."));
    G.objects[obj.otyp].oc_uname = P(unamebuf);
    releaseobuf(outbuf);
    outbuf = await func(obj);
    G.objects[obj.otyp].oc_uname = save_uname;
    if (strlen(outbuf) >>> 0 <= lenlimit) {
      return outbuf;
    }
  }
  save_oname = obj.oextra && obj.oextra.oname ? obj.oextra.oname : null;
  if (save_oname && strlen(save_oname) >= 12) {
    strncpy(P(onamebuf), save_oname, 12 - 4);
    strcpy(P(onamebuf).add(12).add(-4), S("..."));
    obj.oextra.oname = P(onamebuf);
    releaseobuf(outbuf);
    outbuf = await func(obj);
    obj.oextra.oname = save_oname;
    if (strlen(outbuf) >>> 0 <= lenlimit) {
      return outbuf;
    }
  }
  if (save_uname && strlen(save_uname) >= 12 && save_oname && strlen(save_oname) >= 12) {
    G.objects[obj.otyp].oc_uname = P(unamebuf);
    obj.oextra.oname = P(onamebuf);
    releaseobuf(outbuf);
    outbuf = await func(obj);
    if (strlen(outbuf) >>> 0 <= lenlimit) {
      G.objects[obj.otyp].oc_uname = save_uname;
      obj.oextra.oname = save_oname;
      return outbuf;
    }
  }
  save_obj.$cp(obj);
  obj.bknown = (obj.rknown = (obj.greased = 0) & 1) & 1;
  obj.oeroded = (obj.oeroded2 = 0) & 3;
  releaseobuf(outbuf);
  outbuf = await func(obj);
  if (altfunc && strlen(outbuf) >>> 0 > lenlimit) {
    releaseobuf(outbuf);
    outbuf = await altfunc(obj);
  }
  obj.$cp(save_obj);
  if (save_oname) {
    obj.oextra.oname = save_oname;
  }
  if (save_uname) {
    G.objects[obj.otyp].oc_uname = save_uname;
  }
  return outbuf;
}

export async function singular(otmp: struct_obj | null, func: Function | null): Promise<Ptr | null> {
  let savequan = 0;
  let nam = null;
  if (otmp.otyp === CORPSE && func === xname) {
    func = cxname;
  }
  savequan = otmp.quan;
  otmp.quan = 1;
  nam = await func(otmp);
  otmp.quan = savequan;
  return nam;
}

function just_an(outbuf: Ptr | null, str: Ptr | null): Ptr | null {
  let c0 = 0;
  outbuf.a[outbuf.o] = 0;
  c0 = lowc(str.a[str.o]);
  if (!str.a[str.o + 1]) {
    strcpy(outbuf, strchr(S("aefhilmnosx"), c0) ? S("an ") : S("a "));
  } else if (!strncmpi(str, S("the "), 4) || !strncmpi(str, S("molten lava"), -1) || !strncmpi(str, S("iron bars"), -1) || !strncmpi(str, S("ice"), -1)) {
    ;
  } else {
    if (strchr(P(G.vowels), c0) && strncmpi(str, S("one-"), 4) && strncmpi(str, S("eucalyptus"), 10) && strncmpi(str, S("unicorn"), 7) && strncmpi(str, S("uranium"), 7) && strncmpi(str, S("useful"), 6) || strchr(S("x"), c0) && !strchr(P(G.vowels), lowc(str.a[str.o + 1]))) {
      strcpy(outbuf, S("an "));
    } else {
      strcpy(outbuf, S("a "));
    }
  }
  return outbuf;
}

export async function an(str: Ptr | null): Promise<Ptr | null> {
  let buf = nextobuf();
  if (!str || !str.a[str.o]) {
    await impossible(S("Alphabet soup: 'an(%s)'."), str ? S("\"\"") : S("<null>"));
    return strcpy(buf, S("an []"));
  }
  just_an(buf, str);
  return strncat(buf, str, BUFSZ - 1 - (strlen(buf) >>> 0) >>> 0);
}

export async function An(str: Ptr | null): Promise<Ptr | null> {
  let tmp = await an(str);
  tmp.a[tmp.o] = highc(tmp.a[tmp.o]);
  return tmp;
}

export async function the(str: Ptr | null): Promise<Ptr | null> {
  let buf = nextobuf();
  let insert_the = FALSE;
  if (!str || !str.a[str.o]) {
    await impossible(S("Alphabet soup: 'the(%s)'."), str ? S("\"\"") : S("<null>"));
    return strcpy(buf, S("the []"));
  }
  if (!strncmpi(str, S("the "), 4)) {
    buf.a[buf.o] = lowc(str.a[str.o]);
    strcpy(buf.add(1), str.add(1));
    return buf;
  } else if (str.a[str.o] < 65 || str.a[str.o] > 90 || await fruit_from_name(str, TRUE, null)) {
    insert_the = TRUE;
  } else {
    let tmp = null;
    let named = null;
    let called = null;
    let l = 0;
    if ((!!(tmp = strrchr(str, 32)) || !!(tmp = strrchr(str, 45))) && (tmp.a[tmp.o + 1] < 65 || tmp.a[tmp.o + 1] > 90)) {
      insert_the = TRUE;
    } else if (tmp && strchr(str, 32).o < tmp.o) {
      tmp = strstri(str, S(" of "));
      named = strstri(str, S(" named "));
      called = strstri(str, S(" called "));
      if (called && (!named || called.o < named.o)) {
        named = called;
      }
      if (tmp && (!named || tmp.o < named.o)) {
        insert_the = TRUE;
      } else if (!named && (l = strlen(str) | 0) >= 31 && !strcmp(str.add(l - 31), S("Platinum Yendorian Express Card"))) {
        insert_the = TRUE;
      }
    }
  }
  if (insert_the) {
    strcpy(buf, S("the "));
  } else {
    buf.a[buf.o] = 0;
  }
  return strncat(buf, str, BUFSZ - 1 - (strlen(buf) >>> 0) >>> 0);
}

export async function The(str: Ptr | null): Promise<Ptr | null> {
  let tmp = await the(str);
  tmp.a[tmp.o] = highc(tmp.a[tmp.o]);
  return tmp;
}

export async function aobjnam(otmp: struct_obj | null, verb: Ptr | null): Promise<Ptr | null> {
  let prefix = new Int8Array(80);
  let bp = await cxname(otmp);
  if (otmp.quan !== 1) {
    sprintf(P(prefix), S("%ld "), otmp.quan);
    bp = await strprepend(bp, P(prefix));
  }
  if (verb) {
    strcat(bp, S(" "));
    strcat(bp, otense(otmp, verb));
  }
  return bp;
}

export async function yobjnam(obj: struct_obj | null, verb: Ptr | null): Promise<Ptr | null> {
  let s = await aobjnam(obj, verb);
  if (!(obj.where === 3) || !obj_is_pname(obj) || obj.oartifact >= ART_ORB_OF_DETECTION) {
    let outbuf = await shk_your(nextobuf(), obj);
    let space_left = BUFSZ - 1 - strlen(outbuf) | 0;
    s = strncat(outbuf, s, $u64(space_left));
  }
  return s;
}

export async function Yobjnam2(obj: struct_obj | null, verb: Ptr | null): Promise<Ptr | null> {
  let s = await yobjnam(obj, verb);
  s.a[s.o] = highc(s.a[s.o]);
  return s;
}

export async function Tobjnam(otmp: struct_obj | null, verb: Ptr | null): Promise<Ptr | null> {
  let bp = await The(await xname(otmp));
  if (verb) {
    strcat(bp, S(" "));
    strcat(bp, otense(otmp, verb));
  }
  return bp;
}

export async function Doname2(obj: struct_obj | null): Promise<Ptr | null> {
  let s = await doname(obj);
  s.a[s.o] = highc(s.a[s.o]);
  return s;
}

export async function yname(obj: struct_obj | null): Promise<Ptr | null> {
  let s = await cxname(obj);
  if (!(obj.where === 3) || !obj_is_pname(obj) || obj.oartifact >= ART_ORB_OF_DETECTION) {
    let outbuf = await shk_your(nextobuf(), obj);
    let space_left = BUFSZ - 1 - strlen(outbuf) | 0;
    s = strncat(outbuf, s, $u64(space_left));
  }
  return s;
}

export async function Yname2(obj: struct_obj | null): Promise<Ptr | null> {
  let s = await yname(obj);
  s.a[s.o] = highc(s.a[s.o]);
  return s;
}

export async function ysimple_name(obj: struct_obj | null): Promise<Ptr | null> {
  let outbuf = nextobuf();
  let s = await shk_your(outbuf, obj);
  let space_left = BUFSZ - 1 - strlen(s) | 0;
  return strncat(s, await minimal_xname(obj), $u64(space_left));
}

export async function Ysimple_name2(obj: struct_obj | null): Promise<Ptr | null> {
  let s = await ysimple_name(obj);
  s.a[s.o] = highc(s.a[s.o]);
  return s;
}

export async function simpleonames(obj: struct_obj | null): Promise<Ptr | null> {
  let simpleoname = await minimal_xname(obj);
  if (obj.quan !== 1) {
    simpleoname = await makeplural(simpleoname);
  }
  return simpleoname;
}

export async function ansimpleoname(obj: struct_obj | null): Promise<Ptr | null> {
  let simpleoname = await simpleonames(obj);
  let otyp = obj.otyp;
  if (otyp === FAKE_AMULET_OF_YENDOR) {
    otyp = AMULET_OF_YENDOR;
  }
  if (G.objects[otyp].oc_unique | 0 && !strcmp(simpleoname, G.obj_descr[G.objects[otyp].oc_name_idx].oc_name)) {
    return await the(simpleoname);
  }
  if (obj.quan === 1) {
    simpleoname = await an(simpleoname);
  }
  return simpleoname;
}

export async function thesimpleoname(obj: struct_obj | null): Promise<Ptr | null> {
  let simpleoname = await simpleonames(obj);
  return await the(simpleoname);
}

export async function bare_artifactname(obj: struct_obj | null): Promise<Ptr | null> {
  let outbuf = null;
  if (obj.oartifact) {
    outbuf = nextobuf();
    strcpy(outbuf, artiname(obj.oartifact));
    if (!strncmp(outbuf, S("The "), 4)) {
      outbuf.a[outbuf.o] = lowc(outbuf.a[outbuf.o]);
    }
  } else {
    outbuf = await xname(obj);
  }
  return outbuf;
}

export function otense(otmp: struct_obj | null, verb: Ptr | null): Ptr | null {
  let buf = null;
  if (!(otmp.quan !== 1 || otmp.oartifact === 26 && !undiscovered_artifact(26))) {
    return vtense(null, verb);
  }
  buf = nextobuf();
  strcpy(buf, verb);
  return buf;
}

export function vtense(subj: Ptr | null, verb: Ptr | null): Ptr | null {
  let $g = 0;
  let buf = null;
  let bspot = null;
  let len = 0;
  let ltmp = 0;
  let sp = null;
  let spot = null;
  let spec = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = nextobuf();
      if (subj) {
        if (!strncmpi(subj, S("a "), 2) || !strncmpi(subj, S("an "), 3)) {
          { $g = 1; continue $L; }
        }
        spot = null;
        for (sp = subj; !!(sp = strchr(sp, 32)); sp = sp.add(1)) {
          if (!strncmpi(sp, S(" of "), 4) || !strncmpi(sp, S(" from "), 6) || !strncmpi(sp, S(" called "), 8) || !strncmpi(sp, S(" named "), 7) || !strncmpi(sp, S(" labeled "), 9)) {
            if (!$peq(sp, subj)) {
              spot = sp.add(-1);
            }
            break;
          }
        }
        len = strlen(subj) | 0;
        if (!spot) {
          spot = subj.add(len).add(-1);
        }
        if (lowc(spot.a[spot.o]) === 115 && !$peq(spot, subj) && !strchr(S("us"), lowc($rd(spot.add(-1)))) || !(spot.add(-3).o < subj.o || strncmpi(spot.add(-3), S("eeth"), 4)) || !(spot.add(-3).o < subj.o || strncmpi(spot.add(-3), S("feet"), 4)) || !(spot.add(-1).o < subj.o || strncmpi(spot.add(-1), S("ia"), 2)) || !(spot.add(-1).o < subj.o || strncmpi(spot.add(-1), S("ae"), 2))) {
          len = (spot.o - subj.o | 0) + 1;
          for (spec = P(special_subjs); spec.a[spec.o]; spec = spec.add(1)) {
            ltmp = strlen(spec.a[spec.o]) | 0;
            if (len === ltmp && !strncmpi(spec.a[spec.o], subj, len)) {
              { $g = 1; continue $L; }
            }
            if (len > ltmp && $rd(spot.add(-ltmp)) === 32 && !strncmpi(spec.a[spec.o], spot.add(-ltmp).add(1), ltmp)) {
              { $g = 1; continue $L; }
            }
          }
          return strcpy(buf, verb);
        }
        if (!strncmpi(subj, S("they"), -1) || !strncmpi(subj, S("you"), -1)) {
          return strcpy(buf, verb);
        }
      }
    case 1: // sing
      strcpy(buf, verb);
      len = strlen(buf) | 0;
      bspot = buf.add(len).add(-1);
      if (!strncmpi(buf, S("are"), -1)) {
        strcasecpy(buf, S("is"));
      } else if (!strncmpi(buf, S("have"), -1)) {
        strcasecpy(bspot.add(-1), S("s"));
      } else if (strchr(S("zxs"), lowc(bspot.a[bspot.o])) || len >= 2 && lowc(bspot.a[bspot.o]) === 104 && strchr(S("cs"), lowc($rd(bspot.add(-1)))) || len === 2 && lowc(bspot.a[bspot.o]) === 111) {
        strcasecpy(bspot.add(1), S("es"));
      } else if (lowc(bspot.a[bspot.o]) === 121 && !strchr(P(G.vowels), lowc($rd(bspot.add(-1))))) {
        strcasecpy(bspot, S("ies"));
      } else {
        strcasecpy(bspot.add(1), S("s"));
      }
      return buf;
    }
    break;
  }
}

function singplur_lookup(basestr: Ptr | null, endstring: Ptr | null, to_plural: number, alt_as_is: Ptr | null): number {
  let sp = null;
  let same = null;
  let other = null;
  let as = null;
  let al = 0;
  let baselen = strlen(basestr) | 0;
  for (as = P(as_is); as.a[as.o]; as = as.add(1)) {
    al = strlen(as.a[as.o]) | 0;
    if (!(endstring.add(-al).o < basestr.o || strncmpi(endstring.add(-al), as.a[as.o], -1))) {
      return TRUE;
    }
  }
  if (alt_as_is) {
    for (as = alt_as_is; as.a[as.o]; as = as.add(1)) {
      al = strlen(as.a[as.o]) | 0;
      if (!(endstring.add(-al).o < basestr.o || strncmpi(endstring.add(-al), as.a[as.o], -1))) {
        return TRUE;
      }
    }
  }
  if (baselen > 5 && !(endstring.add(-5).o < basestr.o || strncmpi(endstring.add(-5), S("craft"), -1))) {
    return TRUE;
  }
  if (!strncmpi(basestr, S("slice"), -1) || !strncmpi(basestr, S("mongoose"), -1)) {
    if (to_plural) {
      strcasecpy(endstring, S("s"));
    }
    return TRUE;
  }
  if (to_plural && baselen > 2 && !strncmpi(endstring.add(-2), S("ox"), -1) && !(baselen > 5 && !strncmpi(endstring.add(-6), S("muskox"), -1))) {
    strcasecpy(endstring, S("es"));
    return TRUE;
  }
  if (to_plural) {
    if (baselen > 2 && !strncmpi(endstring.add(-3), S("man"), -1) && badman(basestr, to_plural)) {
      strcasecpy(endstring, S("s"));
      return TRUE;
    }
  } else {
    if (baselen > 2 && !strncmpi(endstring.add(-3), S("men"), -1) && badman(basestr, to_plural)) {
      return TRUE;
    }
  }
  for (sp = one_off[0]; sp.sing; sp = $sadd(sp, 1)) {
    same = to_plural ? sp.plur : sp.sing;
    al = strlen(same) | 0;
    if (!(endstring.add(-al).o < basestr.o || strncmpi(endstring.add(-al), same, -1))) {
      return TRUE;
    }
    other = to_plural ? sp.sing : sp.plur;
    al = strlen(other) | 0;
    if (!(endstring.add(-al).o < basestr.o || strncmpi(endstring.add(-al), other, -1))) {
      strcasecpy(endstring.add(-al), same);
      return TRUE;
    }
  }
  return FALSE;
}

function singplur_compound(str: Ptr | null): Ptr | null {
  let cmpd = null;
  let p = null;
  for (p = str; p.a[p.o]; p = p.add(1)) {
    if (!strchr(P(singplur_compound$compound_start), p.a[p.o])) {
      continue;
    }
    for (cmpd = P(singplur_compound$compounds); cmpd.a[cmpd.o]; cmpd = cmpd.add(1)) {
      if (!strncmpi(p, cmpd.a[cmpd.o], strlen(cmpd.a[cmpd.o]) | 0)) {
        return p;
      }
    }
  }
  return null;
}

export async function makeplural(oldstr: Ptr | null): Promise<Ptr | null> {
  let $g = 0;
  let spot = null;
  let lo_c = 0;
  let str = null;
  let excess = null;
  let len = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      str = nextobuf();
      excess = null;
      if (oldstr) {
        while (oldstr.a[oldstr.o] === 32) {
          oldstr = oldstr.add(1);
        }
      }
      if (!oldstr || !oldstr.a[oldstr.o]) {
        await impossible(S("plural of null?"));
        strcpy(str, S("s"));
        return str;
      }
      strcpy(str, oldstr);
      if (!strncmpi(str, S("pair of "), 8)) {
        { $g = 1; continue $L; }
      }
      if (!!(spot = singplur_compound(str))) {
        excess = oldstr.add(spot.o - str.o | 0);
        spot.a[spot.o] = 0;
      } else {
        spot = eos(str);
      }
      spot = spot.add(-1);
      while (spot.o > str.o && spot.a[spot.o] === 32) {
        spot = spot.add(-1);
      }
      $wr(spot.add(1), 0, 0);
      len = strlen(str) | 0;
      if (len === 1 || !letter(spot.a[spot.o])) {
        strcpy(spot.add(1), S("'s"));
        { $g = 1; continue $L; }
      }
      {
        if (singplur_lookup(str, spot.add(1), TRUE, P(makeplural$already_plural))) {
          { $g = 1; continue $L; }
        }
        if (len === 2 && !strncmpi(str, S("ya"), -1) || len >= 3 && !strncmpi(spot.add(-2), S(" ya"), -1)) {
          { $g = 1; continue $L; }
        }
      }
      if (len >= 3 && !strncmpi(spot.add(-2), S("man"), -1) && !badman(str, TRUE)) {
        strcasecpy(spot.add(-1), S("en"));
        { $g = 1; continue $L; }
      }
      if (lowc(spot.a[spot.o]) === 102) {
        lo_c = lowc($rd(spot.add(-1)));
        if (len >= 3 && !strncmpi(spot.add(-2), S("erf"), -1)) {
          ;
        } else if (strchr(S("lr"), lo_c) || strchr(P(G.vowels), lo_c)) {
          strcasecpy(spot, S("ves"));
          { $g = 1; continue $L; }
        }
      }
      if (len >= 3 && !strncmpi(spot.add(-2), S("ium"), -1)) {
        strcasecpy(spot.add(-2), S("ia"));
        { $g = 1; continue $L; }
      }
      if (len >= 4 && !strncmpi(spot.add(-3), S("alga"), -1) || len >= 5 && (!strncmpi(spot.add(-4), S("hypha"), -1) || !strncmpi(spot.add(-4), S("larva"), -1)) || len >= 6 && !strncmpi(spot.add(-5), S("amoeba"), -1) || len >= 8 && !strncmpi(spot.add(-7), S("vertebra"), -1)) {
        strcasecpy(spot.add(1), S("e"));
        { $g = 1; continue $L; }
      }
      if (len > 3 && !strncmpi(spot.add(-1), S("us"), -1) && !(len >= 5 && !strncmpi(spot.add(-4), S("lotus"), -1) || len >= 6 && !strncmpi(spot.add(-5), S("wumpus"), -1))) {
        strcasecpy(spot.add(-1), S("i"));
        { $g = 1; continue $L; }
      }
      if (len >= 3 && !strncmpi(spot.add(-2), S("sis"), -1)) {
        strcasecpy(spot.add(-1), S("es"));
        { $g = 1; continue $L; }
      }
      if (len >= 6 && (!strncmpi(spot.add(-5), S("matzoh"), -1) || !strncmpi(spot.add(-5), S("matzah"), -1))) {
        strcasecpy(spot.add(-1), S("ot"));
        { $g = 1; continue $L; }
      }
      if (len >= 5 && (!strncmpi(spot.add(-4), S("matzo"), -1) || !strncmpi(spot.add(-4), S("matza"), -1))) {
        strcasecpy(spot, S("ot"));
        { $g = 1; continue $L; }
      }
      lo_c = lowc(spot.a[spot.o]);
      if (len >= 5 && (!strncmpi(spot.add(-2), S("dex"), -1) || !strncmpi(spot.add(-2), S("dix"), -1) || !strncmpi(spot.add(-2), S("tex"), -1)) && strncmpi(spot.add(-4), S("index"), -1) !== 0) {
        strcasecpy(spot.add(-1), S("ices"));
        { $g = 1; continue $L; }
      }
      if (strchr(S("zxs"), lo_c) || len >= 2 && lo_c === 104 && strchr(S("cs"), lowc($rd(spot.add(-1)))) && !(len >= 4 && (lowc($rd(spot.add(-2))) === 101 && strchr(S("mt"), lowc($rd(spot.add(-3)))) || lowc($rd(spot.add(-2))) === 111 && strchr(S("lp"), lowc($rd(spot.add(-3)))))) || len >= 4 && !strncmpi(spot.add(-2), S("ato"), -1) || len >= 5 && !strncmpi(spot.add(-4), S("dingo"), -1)) {
        strcasecpy(spot.add(1), S("es"));
        { $g = 1; continue $L; }
      }
      if (lo_c === 121 && !strchr(P(G.vowels), lowc($rd(spot.add(-1))))) {
        strcasecpy(spot, S("ies"));
        { $g = 1; continue $L; }
      }
      strcasecpy(spot.add(1), S("s"));
    case 1: // bottom
      if (excess) {
        strcat(str, excess);
      }
      return str;
    }
    break;
  }
}

export async function makesingular(oldstr: Ptr | null): Promise<Ptr | null> {
  let $g = 0;
  let p = null;
  let bp = null;
  let excess = null;
  let str = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      excess = null;
      str = nextobuf();
      if (oldstr) {
        while (oldstr.a[oldstr.o] === 32) {
          oldstr = oldstr.add(1);
        }
      }
      if (!oldstr || !oldstr.a[oldstr.o]) {
        await impossible(S("singular of null?"));
        str.a[str.o] = 0;
        return str;
      }
      bp = strcpy(str, oldstr);
      if (!!(p = singplur_compound(bp))) {
        excess = oldstr.add(p.o - bp.o | 0);
        p.a[p.o] = 0;
      } else {
        p = eos(bp);
      }
      if (singplur_lookup(bp, p, FALSE, P(special_subjs))) {
        { $g = 1; continue $L; }
      }
      if (!(p.o >= bp.add(1).o && lowc(p.a[p.o + -1]) === 115)) { $g = 4; continue $L; }
      if (p.o >= bp.add(2).o && lowc(p.a[p.o + -2]) === 101) {
        if (p.o >= bp.add(3).o && lowc(p.a[p.o + -3]) === 105) {
          if (!(p.add(-7).o < bp.o || strncmpi(p.add(-7), S("cookies"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("pies"), -1)) && ($peq(p.add(-4), bp) || p.a[p.o + -5] === 32) || !(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("genies"), -1)) && ($peq(p.add(-6), bp) || p.a[p.o + -7] === 32) || !(p.add(-5).o < bp.o || strncmpi(p.add(-5), S("mbies"), -1)) || !(p.add(-5).o < bp.o || strncmpi(p.add(-5), S("yries"), -1))) {
            { $g = 2; continue $L; }
          }
          strcasecpy(p.add(-3), S("y"));
          { $g = 1; continue $L; }
        }
        if (p.add(-4).o >= bp.o && (strchr(S("lr"), lowc($rd(p.add(-4)))) || strchr(P(G.vowels), lowc($rd(p.add(-4))))) && !(p.add(-3).o < bp.o || strncmpi(p.add(-3), S("ves"), -1))) {
          if (!(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("cloves"), -1)) || !(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("nerves"), -1))) {
            { $g = 2; continue $L; }
          }
          strcasecpy(p.add(-3), S("f"));
          { $g = 1; continue $L; }
        }
        if (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("eses"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("oxes"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("nxes"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("ches"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("uses"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("sses"), -1)) || !(p.add(-5).o < bp.o || strncmpi(p.add(-5), S("atoes"), -1)) || !(p.add(-7).o < bp.o || strncmpi(p.add(-7), S("dingoes"), -1)) || !(p.add(-7).o < bp.o || strncmpi(p.add(-7), S("Aleaxes"), -1))) {
          $wr(p.add(-2), 0, 0);
          { $g = 1; continue $L; }
        }
      } else if (!(p.add(-2).o < bp.o || strncmpi(p.add(-2), S("us"), -1))) {
        if ((p.add(-6).o < bp.o || strncmpi(p.add(-6), S("tengus"), -1)) && (p.add(-7).o < bp.o || strncmpi(p.add(-7), S("hezrous"), -1))) {
          { $g = 1; continue $L; }
        }
      } else if (!(p.add(-2).o < bp.o || strncmpi(p.add(-2), S("ss"), -1)) || !(p.add(-5).o < bp.o || strncmpi(p.add(-5), S(" lens"), -1)) || $peq(p.add(-4), bp) && !strncmpi(p.add(-4), S("lens"), -1)) {
        { $g = 1; continue $L; }
      }
    case 2: // mins
      $wr(p.add(-1), 0, 0);
      { $g = 3; continue $L; }
    case 4:
      {
        if (!(p.add(-3).o < bp.o || strncmpi(p.add(-3), S("men"), -1)) && !badman(bp, FALSE)) {
          strcasecpy(p.add(-2), S("an"));
          { $g = 1; continue $L; }
        }
        if (!(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("matzot"), -1)) || !(p.add(-2).o < bp.o || strncmpi(p.add(-2), S("ae"), -1))) {
          $wr(p.add(-1), 0, 0);
          { $g = 1; continue $L; }
        }
        if (p.add(-4).o >= bp.o && !strncmpi(p.add(-2), S("ia"), -1) && strchr(S("lr"), lowc($rd(p.add(-3)))) && lowc($rd(p.add(-4))) === 101) {
          strcasecpy(p.add(-1), S("um"));
        }
      }
    case 3:
    case 1: // bottom
      if (excess) {
        strcat(bp, excess);
      }
      return bp;
    }
    break;
  }
}

function badman(basestr: Ptr | null, to_plural: number): number {
  let i = 0;
  let al = 0;
  let endstr = null;
  let spot = null;
  if (!basestr || strlen(basestr) < 4) {
    return FALSE;
  }
  endstr = eos(basestr);
  if (to_plural) {
    for (i = 0; i < (Math.trunc(288 / 8) | 0); ++i) {
      al = strlen(badman$no_men[i]) | 0;
      spot = endstr.add(-(al + 3));
      if (!(spot.o < basestr.o || strncmpi(spot, badman$no_men[i], al)) && ($peq(spot, basestr) || $rd(spot.add(-1)) === 32)) {
        return TRUE;
      }
    }
  } else {
    for (i = 0; i < (Math.trunc(248 / 8) | 0); ++i) {
      al = strlen(badman$no_man[i]) | 0;
      spot = endstr.add(-(al + 3));
      if (!(spot.o < basestr.o || strncmpi(spot, badman$no_man[i], al)) && ($peq(spot, basestr) || $rd(spot.add(-1)) === 32)) {
        return TRUE;
      }
    }
  }
  return FALSE;
}

async function wishymatch(u_str: Ptr | null, o_str: Ptr | null, retry_inverted: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let p = null;
  let buf = new Int8Array(256);
  if (fuzzymatch(u_str, o_str, S(" -"), TRUE)) {
    return TRUE;
  }
  if (retry_inverted) {
    let u_of = null;
    let o_of = null;
    u_of = strstri(u_str, S(" of "));
    o_of = strstri(o_str, S(" of "));
    if (u_of && !o_of) {
      strcpy(P(buf), u_of.add(4));
      p = eos(strcat(P(buf), S(" ")));
      while (u_str.o < u_of.o) {
        $wr(($t1 = p, p = $t1.add(1), $t1), 0, $rd(($t2 = u_str, u_str = $t2.add(1), $t2)));
      }
      p.a[p.o] = 0;
      return fuzzymatch(P(buf), o_str, S(" -"), TRUE);
    } else if (o_of && !u_of) {
      strcpy(P(buf), o_of.add(4));
      p = eos(strcat(P(buf), S(" ")));
      while (o_str.o < o_of.o) {
        $wr(($t3 = p, p = $t3.add(1), $t3), 0, $rd(($t4 = o_str, o_str = $t4.add(1), $t4)));
      }
      p.a[p.o] = 0;
      return fuzzymatch(u_str, P(buf), S(" -"), TRUE);
    }
  }
  if (!strncmp(o_str, S("dwarvish "), 9)) {
    if (!strncmpi(u_str, S("dwarven "), 8)) {
      return fuzzymatch(u_str.add(8), o_str.add(9), S(" -"), TRUE);
    }
  } else if (!strncmp(o_str, S("elven "), 6)) {
    if (!strncmpi(u_str, S("elvish "), 7)) {
      return fuzzymatch(u_str.add(7), o_str.add(6), S(" -"), TRUE);
    } else if (!strncmpi(u_str, S("elfin "), 6)) {
      return fuzzymatch(u_str.add(6), o_str.add(6), S(" -"), TRUE);
    }
  } else if (!strncmp(o_str, P(wishymatch$detect_SP), 8 - 1)) {
    if (!!(p = strstri(u_str, P(wishymatch$SP_detection))) && !$rd(p.add(11).add(-1))) {
      p.a[p.o] = 0;
      strcat(strcpy(P(buf), P(wishymatch$detect_SP)), u_str);
      if (!strncmpi(u_str, S("monster"), -1)) {
        strcat(P(buf), S("s"));
      }
      p.a[p.o] = 32;
      return fuzzymatch(P(buf), o_str, S(" -"), TRUE);
    }
  } else if (strstri(o_str, P(wishymatch$SP_detection))) {
    if (!strncmpi(u_str, P(wishymatch$detect_SP), 8 - 1)) {
      p = await makesingular(u_str.add(8).add(-1));
      strcat(strcpy(P(buf), p), P(wishymatch$SP_detection));
      releaseobuf(p);
      return fuzzymatch(P(buf), o_str, S(" -"), TRUE);
    }
  } else if (strstri(o_str, S("ability"))) {
    if (!!(p = strstri(u_str, S("abilities"))) && !$rd(p.add(10).add(-1))) {
      strncpy(P(buf), u_str, p.o - u_str.o >>> 0);
      strcpy(P(buf).add(p.o - u_str.o), S("ability"));
      return fuzzymatch(P(buf), o_str, S(" -"), TRUE);
    }
  } else if (!strcmp(o_str, S("aluminum"))) {
    if (!strncmpi(u_str, S("aluminium"), -1)) {
      return fuzzymatch(u_str.add(9), o_str.add(8), S(" -"), TRUE);
    }
  }
  return FALSE;
}

function rnd_otyp_by_wpnskill(skill: number): number {
  let i = 0;
  let n = 0;
  let otyp = STRANGE_OBJECT;
  for (i = G.bases[WEAPON_CLASS]; i < NUM_OBJECTS && G.objects[i].oc_class === WEAPON_CLASS; ++i) {
    if (G.objects[i].oc_subtyp === skill) {
      ++n;
      otyp = i << 16 >> 16;
    }
  }
  if (n > 0) {
    n = rn2(n);
    for (i = G.bases[WEAPON_CLASS]; i < NUM_OBJECTS && G.objects[i].oc_class === WEAPON_CLASS; ++i) {
      if (G.objects[i].oc_subtyp === skill) {
        if (--n < 0) {
          return i << 16 >> 16;
        }
      }
    }
  }
  return otyp;
}

async function rnd_otyp_by_namedesc(name: Ptr | null, oclass: number, xtra_prob: number): Promise<number> {
  let i = 0;
  let n = 0;
  let validobjs = new Int16Array(454);
  let zn = null;
  let prob = 0;
  let maxprob = 0;
  if (!name || !name.a[name.o]) {
    return STRANGE_OBJECT;
  }
  memset(P(validobjs), 0, 908);
  for (i = oclass ? G.bases[oclass] : STRANGE_OBJECT + 1; i < NUM_OBJECTS && (!oclass || G.objects[i].oc_class === oclass); ++i) {
    if (!(zn = G.obj_descr[G.objects[i].oc_name_idx].oc_name)) {
      continue;
    }
    if (await wishymatch(name, zn, TRUE) || !!(zn = G.obj_descr[G.objects[i].oc_descr_idx].oc_descr) && await wishymatch(name, zn, FALSE) || !!(zn = G.objects[i].oc_uname) && await wishymatch(name, zn, FALSE)) {
      validobjs[n++] = i << 16 >> 16;
      maxprob += G.objects[i].oc_prob + xtra_prob;
    }
  }
  if (n > 0 && maxprob) {
    prob = rn2(maxprob);
    for (i = 0; i < n - 1; ++i) {
      if ((prob -= G.objects[validobjs[i]].oc_prob + xtra_prob) < 0) {
        break;
      }
    }
    return validobjs[i];
  }
  return STRANGE_OBJECT;
}

export async function shiny_obj(oclass: number): Promise<number> {
  return await rnd_otyp_by_namedesc(S("shiny"), oclass, 0);
}

export async function readobjnam(bp: Ptr | null, no_wish: struct_obj | null): Promise<struct_obj | null> {
  let $t1: any, $t2: any, $t3: any;
  let $g = 0;
  let p = null;
  let i = 0;
  let otmp = null;
  let cnt = 0;
  let spe = 0;
  let spesgn = 0;
  let typ = 0;
  let very = 0;
  let rechrg = 0;
  let blessed = 0;
  let uncursed = 0;
  let iscursed = 0;
  let ispoisoned = 0;
  let isgreased = 0;
  let eroded = 0;
  let eroded2 = 0;
  let erodeproof = 0;
  let locked = 0;
  let unlocked = 0;
  let broken = 0;
  let halfeaten = 0;
  let mntmp = 0;
  let contents = 0;
  let islit = 0;
  let unlabeled = 0;
  let ishistoric = 0;
  let isdiluted = 0;
  let trapped = 0;
  let tmp = 0;
  let tinv = new Int32Array(1);
  let tvariety = 0;
  let wetness = 0;
  let gsize = 0;
  let f = null;
  let ftype = 0;
  let fruitbuf = new Int8Array(256);
  let globbuf = new Int8Array(256);
  let oclass = 0;
  let un = null;
  let dn = null;
  let actualn = null;
  let origbp = null;
  let name = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      gsize = 0;
      ftype = G.context.current_fruit;
      fruitbuf = new Int8Array(256);
      globbuf = new Int8Array(256);
      origbp = bp;
      name = null;
      cnt = spe = spesgn = typ = 0;
      very = rechrg = blessed = uncursed = iscursed = ispoisoned = isgreased = eroded = eroded2 = erodeproof = halfeaten = islit = unlabeled = ishistoric = isdiluted = trapped = locked = unlocked = broken = 0;
      tvariety = RANDOM_TIN;
      mntmp = NON_PM;
      contents = UNDEFINED;
      oclass = 0;
      actualn = dn = un = null;
      wetness = 0;
      if (!bp) {
        { $g = 1; continue $L; }
      }
      mungspaces(bp);
      if (!strncmpi(bp, S("nothing"), -1) || !strncmpi(bp, S("nil"), -1) || !strncmpi(bp, S("none"), -1)) {
        return no_wish;
      }
      strcpy(P(fruitbuf), bp);
      for (; ; ) {
        let l = 0;
        if (!bp || !bp.a[bp.o]) {
          { $g = 1; continue $L; }
        }
        if (!strncmpi(bp, S("an "), l = 3) || !strncmpi(bp, S("a "), l = 2)) {
          cnt = 1;
        } else if (!strncmpi(bp, S("the "), l = 4)) {
          ;
        } else if (!cnt && digit(bp.a[bp.o]) && strcmp(bp, S("0"))) {
          cnt = atoi(bp);
          while (digit(bp.a[bp.o])) {
            bp = bp.add(1);
          }
          while (bp.a[bp.o] === 32) {
            bp = bp.add(1);
          }
          l = 0;
        } else if (bp.a[bp.o] === 43 || bp.a[bp.o] === 45) {
          spesgn = $rd(($t2 = bp, bp = $t2.add(1), $t2)) === 43 ? 1 : -1;
          spe = atoi(bp);
          while (digit(bp.a[bp.o])) {
            bp = bp.add(1);
          }
          while (bp.a[bp.o] === 32) {
            bp = bp.add(1);
          }
          l = 0;
        } else if (!strncmpi(bp, S("blessed "), l = 8) || !strncmpi(bp, S("holy "), l = 5)) {
          blessed = 1;
        } else if (!strncmpi(bp, S("moist "), l = 6) || !strncmpi(bp, S("wet "), l = 4)) {
          if (!strncmpi(bp, S("wet "), 4)) {
            wetness = rn2(3) + 3;
          } else {
            wetness = rnd(2);
          }
        } else if (!strncmpi(bp, S("cursed "), l = 7) || !strncmpi(bp, S("unholy "), l = 7)) {
          iscursed = 1;
        } else if (!strncmpi(bp, S("uncursed "), l = 9)) {
          uncursed = 1;
        } else if (!strncmpi(bp, S("rustproof "), l = 10) || !strncmpi(bp, S("erodeproof "), l = 11) || !strncmpi(bp, S("corrodeproof "), l = 13) || !strncmpi(bp, S("fixed "), l = 6) || !strncmpi(bp, S("fireproof "), l = 10) || !strncmpi(bp, S("rotproof "), l = 9)) {
          erodeproof = 1;
        } else if (!strncmpi(bp, S("lit "), l = 4) || !strncmpi(bp, S("burning "), l = 8)) {
          islit = 1;
        } else if (!strncmpi(bp, S("unlit "), l = 6) || !strncmpi(bp, S("extinguished "), l = 13)) {
          islit = 0;
        } else if (!strncmpi(bp, S("unlabeled "), l = 10) || !strncmpi(bp, S("unlabelled "), l = 11) || !strncmpi(bp, S("blank "), l = 6)) {
          unlabeled = 1;
        } else if (!strncmpi(bp, S("poisoned "), l = 9)) {
          ispoisoned = 1;
        } else if (!strncmpi(bp, S("trapped "), l = 8)) {
          trapped = 0;
          if (G.flags.debug) {
            trapped = 1;
          }
        } else if (!strncmpi(bp, S("untrapped "), l = 10)) {
          trapped = 2;
        } else if (!strncmpi(bp, S("locked "), l = 7)) {
          locked = 1, unlocked = broken = 0;
        } else if (!strncmpi(bp, S("unlocked "), l = 9)) {
          unlocked = 1, locked = broken = 0;
        } else if (!strncmpi(bp, S("broken "), l = 7)) {
          broken = 1, locked = unlocked = 0;
        } else if (!strncmpi(bp, S("greased "), l = 8)) {
          isgreased = 1;
        } else if (!strncmpi(bp, S("very "), l = 5)) {
          very = 1;
        } else if (!strncmpi(bp, S("thoroughly "), l = 11)) {
          very = 2;
        } else if (!strncmpi(bp, S("rusty "), l = 6) || !strncmpi(bp, S("rusted "), l = 7) || !strncmpi(bp, S("burnt "), l = 6) || !strncmpi(bp, S("burned "), l = 7)) {
          eroded = 1 + very;
          very = 0;
        } else if (!strncmpi(bp, S("corroded "), l = 9) || !strncmpi(bp, S("rotted "), l = 7)) {
          eroded2 = 1 + very;
          very = 0;
        } else if (!strncmpi(bp, S("partly eaten "), l = 13) || !strncmpi(bp, S("partially eaten "), l = 16)) {
          halfeaten = 1;
        } else if (!strncmpi(bp, S("historic "), l = 9)) {
          ishistoric = 1;
        } else if (!strncmpi(bp, S("diluted "), l = 8)) {
          isdiluted = 1;
        } else if (!strncmpi(bp, S("empty "), l = 6)) {
          contents = EMPTY;
        } else if (!strncmpi(bp, S("small "), l = 6)) {
          if (strncmpi(bp.add(l), S("glob"), 4) && !strstri(bp.add(l), S(" glob"))) {
            break;
          }
          gsize = 1;
        } else if (!strncmpi(bp, S("medium "), l = 7)) {
          gsize = 2;
        } else if (!strncmpi(bp, S("large "), l = 6)) {
          if (strncmpi(bp.add(l), S("glob"), 4) && !strstri(bp.add(l), S(" glob"))) {
            break;
          }
          gsize = very !== 1 ? 3 : 4;
        } else {
          break;
        }
        bp = bp.add(l);
      }
      if (!cnt) {
        cnt = 1;
      }
      if (strlen(bp) > 1 && !!(p = strrchr(bp, 40))) {
        let keeptrailingchars = TRUE;
        p.a[p.o + (p.o > bp.o && p.a[p.o + -1] === 32 ? -1 : 0)] = 0;
        p = p.add(1);
        if (!strncmpi(p, S("lit)"), 4)) {
          islit = 1;
          p = p.add(4 - 1);
        } else {
          spe = atoi(p);
          while (digit(p.a[p.o])) {
            p = p.add(1);
          }
          if (p.a[p.o] === 58) {
            p = p.add(1);
            rechrg = spe;
            spe = atoi(p);
            while (digit(p.a[p.o])) {
              p = p.add(1);
            }
          }
          if (p.a[p.o] !== 41) {
            spe = rechrg = 0;
            keeptrailingchars = FALSE;
          } else {
            spesgn = 1;
          }
        }
        if (keeptrailingchars) {
          let pp = eos(bp);
          do {
            $wr(($t3 = pp, pp = $t3.add(1), $t3), 0, $rd((p = p.add(1))));
          } while (p.a[p.o]);
        }
      }
      if (spe < 0) {
        spesgn = -1;
        spe = Math.abs(spe);
      }
      if (spe > SCHAR_LIM) {
        spe = SCHAR_LIM;
      }
      if (rechrg < 0 || rechrg > 7) {
        rechrg = 7;
      }
      if (!!(p = strstri(bp, S(" named ")))) {
        p.a[p.o] = 0;
        name = p.add(7);
      }
      if (!!(p = strstri(bp, S(" called ")))) {
        p.a[p.o] = 0;
        un = p.add(8);
        for (i = 0; i < (Math.trunc(456 / 24) | 0); ++i) {
          if (!strncmpi(bp, o_ranges[i].name, -1)) {
            oclass = o_ranges[i].oclass;
            { $g = 2; continue $L; }
          }
        }
      }
      if (!!(p = strstri(bp, S(" labeled ")))) {
        p.a[p.o] = 0;
        dn = p.add(9);
      } else if (!!(p = strstri(bp, S(" labelled ")))) {
        p.a[p.o] = 0;
        dn = p.add(10);
      }
      if (!!(p = strstri(bp, S(" of spinach")))) {
        p.a[p.o] = 0;
        contents = SPINACH;
      }
      if (!strncmpi(bp, S("pair of "), 8)) {
        bp = bp.add(8);
        cnt = cnt * 2;
      } else if (!strncmpi(bp, S("pairs of "), 9)) {
        bp = bp.add(9);
        if (cnt > 1) {
          cnt = cnt * 2;
        }
      } else if (!strncmpi(bp, S("set of "), 7)) {
        bp = bp.add(7);
      } else if (!strncmpi(bp, S("sets of "), 8)) {
        bp = bp.add(8);
      }
      i = strlen(bp) | 0;
      p = null;
      if (!strncmpi(bp, S("glob"), -1) || !(bp.add(i).add(-5).o < bp.o || strncmpi(bp.add(i).add(-5), S(" glob"), -1)) || !strncmpi(bp, S("globs"), -1) || !(bp.add(i).add(-6).o < bp.o || strncmpi(bp.add(i).add(-6), S(" globs"), -1)) || !!(p = strstri(bp, S("glob of "))) || !!(p = strstri(bp, S("globs of ")))) {
        mntmp = name_to_mon(!p ? bp : strstri(p, S(" of ")).add(4));
        if (mntmp === NON_PM) {
          mntmp = rn2(206 - 203) + 203;
        }
        sprintf(P(globbuf), S("glob of %s"), G.mons[mntmp].mname);
        bp = P(globbuf);
        mntmp = NON_PM;
        cnt = 0;
        oclass = FOOD_CLASS;
        actualn = bp, dn = null;
        { $g = 2; continue $L; }
      } else {
        if (!strstri(bp, S("wand ")) && !strstri(bp, S("spellbook ")) && !strstri(bp, S("finger "))) {
          if (!!(p = strstri(bp, S("tin of ")))) {
            if (!strncmpi(p.add(7), S("spinach"), -1)) {
              contents = SPINACH;
              mntmp = NON_PM;
            } else {
              tmp = tin_variety_txt(p.add(7), P(tinv, 0));
              tvariety = tinv[0];
              mntmp = name_to_mon(p.add(7).add(tmp));
            }
            typ = TIN;
            { $g = 3; continue $L; }
          } else if (!!(p = strstri(bp, S(" of "))) && (mntmp = name_to_mon(p.add(4))) >= LOW_PM) {
            p.a[p.o] = 0;
          }
        }
      }
      if (strncmpi(bp, S("samurai sword"), 13) && strncmpi(bp, S("wizard lock"), 11) && strncmpi(bp, S("ninja-to"), 8) && strncmpi(bp, S("master key"), 10) && strncmpi(bp, S("magenta"), 7)) {
        if (mntmp < LOW_PM && strlen(bp) > 2 && (mntmp = name_to_mon(bp)) >= LOW_PM) {
          let mntmptoo = 0;
          const mntmplen = new Int32Array(1);
          let obp = bp;
          mntmptoo = title_to_mon(bp, null, P(mntmplen, 0));
          bp = bp.add(mntmp !== mntmptoo ? strlen(G.mons[mntmp].mname) | 0 : mntmplen[0]);
          if (bp.a[bp.o] === 32) {
            bp = bp.add(1);
          } else if (!strncmpi(bp, S("s "), 2)) {
            bp = bp.add(2);
          } else if (!strncmpi(bp, S("es "), 3)) {
            bp = bp.add(3);
          } else if (!bp.a[bp.o] && !actualn && !dn && !un && !oclass) {
            bp = obp;
            mntmp = NON_PM;
          }
        }
      }
      if (bp.a[bp.o]) {
        let sng = await makesingular(bp);
        if (strcmp(bp, sng)) {
          if (cnt === 1) {
            cnt = 2;
          }
          strcpy(bp, sng);
        }
      }
      {
        let as = spellings[0];
        while (as.sp) {
          if (fuzzymatch(bp, as.sp, S(" -"), TRUE)) {
            typ = as.ob;
            { $g = 3; continue $L; }
          }
          as = $sadd(as, 1);
        }
        if (!strncmpi(bp, S("grey spell"), 10)) {
          $wr(bp.add(2), 0, 97);
        }
        if (!!(p = strstri(bp, S("armour")))) {
          p = p.add(4);
          while ((p.a[p.o] = $rd(p.add(1))) !== 0) {
            p = p.add(1);
          }
        }
      }
      if (!strncmpi(bp, S("scales"), -1) && mntmp >= PM_GRAY_DRAGON && mntmp <= PM_YELLOW_DRAGON) {
        typ = GRAY_DRAGON_SCALES + mntmp - PM_GRAY_DRAGON;
        mntmp = NON_PM;
        { $g = 3; continue $L; }
      }
      p = eos(bp);
      if (!(p.add(-10).o < bp.o || strncmpi(p.add(-10), S("holy water"), -1))) {
        typ = POT_WATER;
        if (p.o - bp.o >= 12 && $rd(p.add(-12)) === 117) {
          iscursed = 1;
        } else {
          blessed = 1;
        }
        { $g = 3; continue $L; }
      }
      if (unlabeled && !(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("scroll"), -1))) {
        typ = SCR_BLANK_PAPER;
        { $g = 3; continue $L; }
      }
      if (unlabeled && !(p.add(-9).o < bp.o || strncmpi(p.add(-9), S("spellbook"), -1))) {
        typ = SPE_BLANK_PAPER;
        { $g = 3; continue $L; }
      }
      if (!(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("orange"), -1)) && mntmp === NON_PM) {
        typ = ORANGE;
        { $g = 3; continue $L; }
      }
      if (!(p.add(-10).o < bp.o || strncmpi(p.add(-10), S("gold piece"), -1)) || !(p.add(-7).o < bp.o || strncmpi(p.add(-7), S("zorkmid"), -1)) || !strncmpi(bp, S("gold"), -1) || !strncmpi(bp, S("money"), -1) || !strncmpi(bp, S("coin"), -1) || bp.a[bp.o] === GOLD_SYM) {
        if (cnt > 5000 && !G.flags.debug) {
          cnt = 5000;
        } else if (cnt < 1) {
          cnt = 1;
        }
        otmp = await mksobj(GOLD_PIECE, FALSE, FALSE);
        otmp.quan = cnt;
        otmp.owt = await weight(otmp) >>> 0;
        G.context.botl = 1;
        return otmp;
      }
      if (strlen(bp) === 1 && (i = def_char_to_objclass(bp.a[bp.o])) < MAXOCLASSES && i > ILLOBJ_CLASS && (i !== VENOM_CLASS || G.flags.debug)) {
        oclass = i << 24 >> 24;
        { $g = 1; continue $L; }
      }
      if (strncmpi(bp, S("enchant "), 8) && strncmpi(bp, S("destroy "), 8) && strncmpi(bp, S("detect food"), 11) && strncmpi(bp, S("food detection"), 14) && strncmpi(bp, S("ring mail"), 9) && strncmpi(bp, S("studded leather armor"), 21) && strncmpi(bp, S("leather armor"), 13) && strncmpi(bp, S("tooled horn"), 11) && strncmpi(bp, S("food ration"), 11) && strncmpi(bp, S("meat ring"), 9)) {
        for (i = 0; i < 13; ++i) {
          let j = strlen(wrp[i]) | 0;
          if (!strncmpi(bp, wrp[i], j)) {
            oclass = wrpsym[i];
            if (oclass !== AMULET_CLASS) {
              bp = bp.add(j);
              if (!strncmpi(bp, S(" of "), 4)) {
                actualn = bp.add(4);
              }
            } else {
              actualn = bp;
            }
            { $g = 2; continue $L; }
          }
          if (!(p.add(-j).o < bp.o || strncmpi(p.add(-j), wrp[i], -1))) {
            oclass = wrpsym[i];
            if (oclass !== AMULET_CLASS) {
              p = p.add(-j);
              p.a[p.o] = 0;
              if (p.o > bp.o && p.a[p.o + -1] === 32) {
                p.a[p.o + -1] = 0;
              }
            } else {
              if (!strncmpi(bp, S("versus poison "), 14)) {
                typ = AMULET_VERSUS_POISON;
                { $g = 3; continue $L; }
              }
            }
            actualn = dn = bp;
            { $g = 2; continue $L; }
          }
        }
      }
      if (G.flags.debug && (!strncmpi(bp, S("bear"), 4) || !strncmpi(bp, S("land"), 4))) {
        let beartrap = (lowc(bp.a[bp.o]) === 98 ? 1 : 0) << 24 >> 24;
        let zp = bp.add(4);
        if (zp.a[zp.o] === 32) {
          zp = zp.add(1);
        }
        if (!strncmpi(zp, beartrap ? S("trap") : S("mine"), 4)) {
          zp = zp.add(4);
          if (trapped === 2 || !strncmpi(zp, S(" object"), -1)) {
            typ = beartrap ? BEARTRAP : LAND_MINE;
            { $g = 3; continue $L; }
          } else if (trapped === 1 || zp.a[zp.o] !== 0) {
            let idx = S_arrow_trap + (beartrap ? BEAR_TRAP : LANDMINE) - 1;
            strcpy(bp, G.defsyms[idx].explanation);
            { $g = 4; continue $L; }
          }
        }
      }
    case 5: // retry
      for (i = 0; i < (Math.trunc(456 / 24) | 0); ++i) {
        if (!strncmpi(bp, o_ranges[i].name, -1)) {
          typ = rnd_class(o_ranges[i].f_o_range, o_ranges[i].l_o_range);
          { $g = 3; continue $L; }
        }
      }
      if (!(p.add(-6).o < bp.o || strncmpi(p.add(-6), S(" stone"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S(" gem"), -1))) {
        p.a[p.o + (!strncmpi(p.add(-4), S(" gem"), -1) ? -4 : -6)] = 0;
        oclass = GEM_CLASS;
        dn = actualn = bp;
        { $g = 2; continue $L; }
      } else if (!strncmpi(bp, S("looking glass"), -1)) {
        ;
      } else if (!(p.add(-6).o < bp.o || strncmpi(p.add(-6), S(" glass"), -1)) || !strncmpi(bp, S("glass"), -1)) {
        let g = bp;
        if (broken || strstri(g, S("broken"))) {
          return null;
        }
        if (!strncmpi(g, S("worthless "), 10)) {
          g = g.add(10);
        }
        if (!strncmpi(g, S("piece of "), 9)) {
          g = g.add(9);
        }
        if (!strncmpi(g, S("colored "), 8)) {
          g = g.add(8);
        } else if (!strncmpi(g, S("coloured "), 9)) {
          g = g.add(9);
        }
        if (!strncmpi(g, S("glass"), -1)) {
          typ = LAST_GEM + rnd(9);
          if (G.objects[typ].oc_class === GEM_CLASS) {
            { $g = 3; continue $L; }
          } else {
            typ = 0;
          }
        } else {
          let tbuf = new Int8Array(256);
          strcpy(P(tbuf), S("worthless piece of "));
          strcat(P(tbuf), g);
          strcpy(bp, P(tbuf));
        }
      }
      actualn = bp;
      if (!dn) {
        dn = actualn;
      }
    case 2: // srch
      if (!oclass && actualn) {
        for (i = G.bases[GEM_CLASS]; i <= LAST_GEM; ++i) {
          let zn = null;
          if (!!(zn = G.obj_descr[G.objects[i].oc_name_idx].oc_name) && !strncmpi(actualn, zn, -1)) {
            typ = i;
            { $g = 3; continue $L; }
          }
        }
        if (!strncmpi(actualn, S("tin"), -1)) {
          typ = TIN;
          { $g = 3; continue $L; }
        }
      }
      if ((typ = await rnd_otyp_by_namedesc(actualn, oclass, 1)) !== STRANGE_OBJECT || (typ = await rnd_otyp_by_namedesc(dn, oclass, 1)) !== STRANGE_OBJECT || (typ = await rnd_otyp_by_namedesc(un, oclass, 1)) !== STRANGE_OBJECT || (typ = await rnd_otyp_by_namedesc(origbp, oclass, 1)) !== STRANGE_OBJECT) {
        { $g = 3; continue $L; }
      }
      typ = 0;
      if (actualn) {
        let j = Japanese_items[0];
        while (j.item) {
          if (actualn && !strncmpi(actualn, j.name, -1)) {
            typ = j.item;
            { $g = 3; continue $L; }
          }
          j = $sadd(j, 1);
        }
      }
      if (oclass === ARMOR_CLASS && !strstri(bp, S("mail"))) {
        strcat(bp, S(" mail"));
        { $g = 5; continue $L; }
      }
      if (!strncmpi(bp, S("spinach"), -1)) {
        contents = SPINACH;
        typ = TIN;
        { $g = 3; continue $L; }
      }
      {
        let fp = null;
        let l = 0;
        let cntf = 0;
        let blessedf = 0;
        let iscursedf = 0;
        let uncursedf = 0;
        let halfeatenf = 0;
        blessedf = iscursedf = uncursedf = halfeatenf = 0;
        cntf = 0;
        fp = P(fruitbuf);
        for (; ; ) {
          if (!fp || !fp.a[fp.o]) {
            break;
          }
          if (!strncmpi(fp, S("an "), l = 3) || !strncmpi(fp, S("a "), l = 2)) {
            cntf = 1;
          } else if (!cntf && digit(fp.a[fp.o])) {
            cntf = atoi(fp);
            while (digit(fp.a[fp.o])) {
              fp = fp.add(1);
            }
            while (fp.a[fp.o] === 32) {
              fp = fp.add(1);
            }
            l = 0;
          } else if (!strncmpi(fp, S("blessed "), l = 8)) {
            blessedf = 1;
          } else if (!strncmpi(fp, S("cursed "), l = 7)) {
            iscursedf = 1;
          } else if (!strncmpi(fp, S("uncursed "), l = 9)) {
            uncursedf = 1;
          } else if (!strncmpi(fp, S("partly eaten "), l = 13) || !strncmpi(fp, S("partially eaten "), l = 16)) {
            halfeatenf = 1;
          } else {
            break;
          }
          fp = fp.add(l);
        }
        for (f = G.ffruit; f; f = f.nextf) {
          let ftyp = 0;
          if (!strcmp(fp, P(f.fname))) {
            ftyp = 1;
          } else if (!strcmp(fp, await makesingular(P(f.fname)))) {
            ftyp = 2;
          } else if (!strcmp(fp, await makeplural(P(f.fname)))) {
            ftyp = 3;
          }
          if (ftyp) {
            typ = SLIME_MOLD;
            blessed = blessedf;
            iscursed = iscursedf;
            uncursed = uncursedf;
            halfeaten = halfeatenf;
            if (ftyp === 2 && !cntf) {
              cntf = 1;
            } else if (ftyp === 3 && !cntf) {
              cntf = 2;
            }
            cnt = cntf;
            ftype = f.fid;
            { $g = 3; continue $L; }
          }
        }
      }
      if (!oclass && actualn) {
        const objtyp = new Int16Array(1);
        name = artifact_name(actualn, P(objtyp, 0));
        if (name) {
          typ = objtyp[0];
          { $g = 3; continue $L; }
        }
      }
    case 4: // wiztrap
      if (G.flags.debug && !G.program_state.wizkit_wishing) {
        let lev = null;
        let madeterrain = FALSE;
        let trap = 0;
        let x = G.u.ux;
        let y = G.u.uy;
        for (trap = NO_TRAP + 1; trap < TRAPNUM; ++trap) {
          let t = null;
          let tname = null;
          tname = G.defsyms[S_arrow_trap + trap - 1].explanation;
          if (strncmpi(tname, bp, strlen(tname) | 0)) {
            continue;
          }
          if ((trap === HOLE || trap === TRAPDOOR) && !Can_fall_thru(G.u.uz)) {
            trap = ROCKTRAP;
          }
          if (!!(t = await maketrap(x, y, trap))) {
            trap = t.ttyp | 0;
            tname = G.defsyms[S_arrow_trap + trap - 1].explanation;
            await pline(S("%s%s."), await An(tname), trap !== MAGIC_PORTAL ? S("") : S(" to nowhere"));
          } else {
            await pline(S("Creation of %s failed."), await an(tname));
          }
          return G.zeroobj;
        }
        lev = $sat(G.level.locations[x], y);
        p = eos(bp);
        if (!(p.add(-8).o < bp.o || strncmpi(p.add(-8), S("fountain"), -1))) {
          lev.typ = FOUNTAIN;
          G.level.flags.nfountains = G.level.flags.nfountains + 1 & 0xff;
          if (!strncmpi(bp, S("magic "), 6)) {
            lev.horizontal = 1;
          }
          await pline(S("A %sfountain."), lev.horizontal | 0 ? S("magic ") : S(""));
          madeterrain = TRUE;
        } else if (!(p.add(-6).o < bp.o || strncmpi(p.add(-6), S("throne"), -1))) {
          lev.typ = THRONE;
          await pline(S("A throne."));
          madeterrain = TRUE;
        } else if (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("sink"), -1))) {
          lev.typ = SINK;
          G.level.flags.nsinks = G.level.flags.nsinks + 1 & 0xff;
          await pline(S("A sink."));
          madeterrain = TRUE;
        } else if (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("pool"), -1)) || !(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("moat"), -1))) {
          lev.typ = (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("pool"), -1)) ? POOL : MOAT) << 24 >> 24;
          await del_engr_at(x, y);
          await pline(S("A %s."), lev.typ === POOL ? S("pool") : S("moat"));
          await water_damage_chain(G.level.objects[x][y], TRUE);
          madeterrain = TRUE;
        } else if (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("lava"), -1))) {
          lev.typ = LAVAPOOL;
          await del_engr_at(x, y);
          await pline(S("A pool of molten lava."));
          if (!((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked)) {
            await pooleffects(FALSE);
          }
          madeterrain = TRUE;
        } else if (!(p.add(-5).o < bp.o || strncmpi(p.add(-5), S("altar"), -1))) {
          let al = 0;
          lev.typ = ALTAR;
          if (!strncmpi(bp, S("chaotic "), 8)) {
            al = A_CHAOTIC;
          } else if (!strncmpi(bp, S("neutral "), 8)) {
            al = A_NEUTRAL;
          } else if (!strncmpi(bp, S("lawful "), 7)) {
            al = A_LAWFUL;
          } else if (!strncmpi(bp, S("unaligned "), 10)) {
            al = A_NONE;
          } else {
            al = (!rn2(6) ? A_NONE : rn2(A_LAWFUL + 2) - 1) << 24 >> 24;
          }
          lev.flags = ((al === -128 ? 0 : al === 1 ? 4 : al + 2) >>> 0) & 31;
          await pline(S("%s altar."), await An(align_str(al)));
          madeterrain = TRUE;
        } else if (!(p.add(-5).o < bp.o || strncmpi(p.add(-5), S("grave"), -1)) || !(p.add(-9).o < bp.o || strncmpi(p.add(-9), S("headstone"), -1))) {
          await make_grave(x, y, null);
          await pline(S("%s."), lev.typ === GRAVE ? S("A grave") : S("Can't place a grave here"));
          madeterrain = TRUE;
        } else if (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("tree"), -1))) {
          lev.typ = TREE;
          await pline(S("A tree."));
          block_point(x, y);
          madeterrain = TRUE;
        } else if (!(p.add(-4).o < bp.o || strncmpi(p.add(-4), S("bars"), -1))) {
          lev.typ = IRONBARS;
          await pline(S("Iron bars."));
          madeterrain = TRUE;
        }
        if (madeterrain) {
          await feel_newsym(x, y);
          if (G.u.uinwater | 0 && !is_pool(G.u.ux, G.u.uy)) {
            G.u.uinwater = 0;
            await docrt();
            G.vision_full_recalc = 1;
          } else if (G.u.utrap && G.u.utraptype === TT_LAVA && !is_lava(G.u.ux, G.u.uy)) {
            await reset_utrap(FALSE);
          }
          return G.zeroobj;
        }
      }
      if (!oclass && !typ) {
        if (!strncmpi(bp, S("polearm"), 7)) {
          typ = rnd_otyp_by_wpnskill(P_POLEARMS);
          { $g = 3; continue $L; }
        } else if (!strncmpi(bp, S("hammer"), 6)) {
          typ = rnd_otyp_by_wpnskill(P_HAMMER);
          { $g = 3; continue $L; }
        }
      }
      if (!oclass) {
        return null;
      }
    case 1: // any
      if (!oclass) {
        oclass = wrpsym[rn2(13)];
      }
    case 3: // typfnd
      if (typ) {
        oclass = G.objects[typ].oc_class;
      }
      if (typ && !G.flags.debug) {
        switch (typ) {
        case 188:
          typ = FAKE_AMULET_OF_YENDOR;
          break;
        case 237:
          typ = rnd_class(TALLOW_CANDLE, WAX_CANDLE);
          break;
        case 238:
          typ = BELL;
          break;
        case 383:
          typ = SPE_BLANK_PAPER;
          break;
        case 203:
          typ = OIL_LAMP;
          break;
        default:
          if (G.objects[typ].oc_nowish) {
            return null;
          }
          break;
        }
      }
      otmp = typ ? await mksobj(typ, TRUE, FALSE) : await mkobj(oclass, FALSE);
      typ = otmp.otyp, oclass = otmp.oclass;
      if (islit && (typ === OIL_LAMP || typ === MAGIC_LAMP || typ === BRASS_LANTERN || (otmp.otyp === 199 || otmp.otyp === 200) || typ === POT_OIL)) {
        await place_object(otmp, G.u.ux, G.u.uy);
        await begin_burn(otmp, FALSE);
        await obj_extract_self(otmp);
      }
      if (cnt > 0 && G.objects[typ].oc_merge | 0 && (G.flags.debug || cnt < rnd(6) || cnt <= 7 && (otmp.otyp === 199 || otmp.otyp === 200) || cnt <= 20 && (oclass === WEAPON_CLASS && ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW) || typ === ROCK || (otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[otmp.otyp].oc_subtyp <= -P_DART))) {
        otmp.quan = cnt;
      }
      if (oclass === VENOM_CLASS) {
        otmp.spe = 1;
      }
      if (spesgn === 0) {
        spe = otmp.spe;
      } else if (G.flags.debug) {
        ;
      } else if (oclass === ARMOR_CLASS || oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS && G.objects[otmp.otyp].oc_subtyp !== P_NONE || oclass === RING_CLASS && G.objects[typ].oc_charged | 0) {
        if (spe > rnd(5) && spe > otmp.spe) {
          spe = 0;
        }
        if (spe > 2 && G.u.uluck + G.u.moreluck < 0) {
          spesgn = -1;
        }
      } else {
        if (oclass === WAND_CLASS) {
          if (spe > 1 && spesgn === -1) {
            spe = 1;
          }
        } else {
          if (spe > 0 && spesgn === -1) {
            spe = 0;
          }
        }
        if (spe > otmp.spe) {
          spe = otmp.spe;
        }
      }
      if (spesgn === -1) {
        spe = -spe;
      }
      switch (typ) {
      case 271:
        if (contents === EMPTY) {
          otmp.corpsenm = NON_PM;
          otmp.spe = 0;
        } else if (contents === SPINACH) {
          otmp.corpsenm = NON_PM;
          otmp.spe = 1;
        }
        break;
      case 209:
        if (wetness) {
          otmp.spe = wetness << 24 >> 24;
        }
        break;
      case 260:
        otmp.spe = ftype << 24 >> 24;
      case 196:
      case 190:
      case 189:
      case 450:
      case 451:
      case 449:
        break;
      case 339:
        otmp.spe = 1;
        break;
      case 388:
        if (!G.flags.debug) {
          otmp.spe = (rn2(10) ? -1 : 0) << 24 >> 24;
          break;
        }
      default:
        otmp.spe = spe << 24 >> 24;
      }
      if (mntmp >= LOW_PM) {
        if (mntmp === PM_LONG_WORM_TAIL) {
          mntmp = PM_LONG_WORM;
        }
        switch (typ) {
        case 271:
          otmp.spe = 0;
          if (dead_species(mntmp, FALSE)) {
            otmp.corpsenm = NON_PM;
          } else if ((!(G.mons[mntmp].geno & G_UNIQ) || G.flags.debug) && !(G.mvitals[mntmp].mvflags & G_NOCORPSE) && G.mons[mntmp].cnutrit !== 0) {
            otmp.corpsenm = mntmp;
          }
          break;
        case 240:
          if ((!(G.mons[mntmp].geno & G_UNIQ) || G.flags.debug) && !(G.mvitals[mntmp].mvflags & G_NOCORPSE)) {
            if (G.mons[mntmp].msound === MS_GUARDIAN) {
              mntmp = genus(mntmp, 1);
            }
            await set_corpsenm(otmp, mntmp);
          }
          break;
        case 241:
          mntmp = can_be_hatched(mntmp);
          await set_corpsenm(otmp, mntmp);
          break;
        case 216:
          if (!(G.mons[mntmp].geno & G_UNIQ) && !(($sat(G.mons, mntmp).mflags2 & 8) >>> 0 !== 0) && mntmp !== PM_MAIL_DAEMON) {
            otmp.corpsenm = mntmp;
          }
          break;
        case 449:
          otmp.corpsenm = mntmp;
          if (!!otmp.cobj && $sat(G.mons, mntmp).msize < 1) {
            await delete_contents(otmp);
          }
          otmp.spe = (ishistoric ? STATUE_HISTORIC : 0) << 24 >> 24;
          break;
        case 109:
          if (mntmp >= PM_GRAY_DRAGON && mntmp <= PM_YELLOW_DRAGON) {
            otmp.otyp = GRAY_DRAGON_SCALE_MAIL + mntmp - PM_GRAY_DRAGON << 16 >> 16;
          }
          break;
        }
      }
      if (iscursed) {
        await curse(otmp);
      } else if (uncursed) {
        otmp.blessed = 0;
        otmp.cursed = ((G.u.uluck + G.u.moreluck < 0 && !G.flags.debug ? 1 : 0) >>> 0) & 1;
      } else if (blessed) {
        otmp.blessed = ((G.u.uluck + G.u.moreluck >= 0 || G.flags.debug ? 1 : 0) >>> 0) & 1;
        otmp.cursed = ((G.u.uluck + G.u.moreluck < 0 && !G.flags.debug ? 1 : 0) >>> 0) & 1;
      } else if (spesgn < 0) {
        await curse(otmp);
      }
      if (erosion_matters(otmp)) {
        if (eroded && (is_flammable(otmp) || (G.objects[otmp.otyp].oc_material | 0) === IRON)) {
          otmp.oeroded = (eroded >>> 0) & 3;
        }
        if (eroded2 && ((G.objects[otmp.otyp].oc_material | 0) === COPPER || (G.objects[otmp.otyp].oc_material | 0) === IRON || is_rottable(otmp))) {
          otmp.oeroded2 = (eroded2 >>> 0) & 3;
        }
        if (erodeproof && ((G.objects[otmp.otyp].oc_material | 0) === IRON || is_flammable(otmp) || is_rottable(otmp) || ((G.objects[otmp.otyp].oc_material | 0) === COPPER || (G.objects[otmp.otyp].oc_material | 0) === IRON) || otmp.otyp === CRYSKNIFE)) {
          otmp.oerodeproof = ((G.u.uluck + G.u.moreluck >= 0 || G.flags.debug ? 1 : 0) >>> 0) & 1;
        }
      }
      if (oclass === WAND_CLASS) {
        if (otmp.otyp === WAN_WISHING && !G.flags.debug) {
          rechrg = 1;
        }
        otmp.recharged = (rechrg >>> 0) & 7;
      }
      if (ispoisoned) {
        if (otmp.oclass === WEAPON_CLASS && G.objects[otmp.otyp].oc_subtyp >= -P_SHURIKEN && G.objects[otmp.otyp].oc_subtyp <= -P_BOW) {
          otmp.otrapped = ((G.u.uluck + G.u.moreluck >= 0 ? 1 : 0) >>> 0) & 1;
        } else if (oclass === FOOD_CLASS) {
          otmp.age = 1;
        }
      }
      if (trapped) {
        if (otmp.otyp === 189 || otmp.otyp === 190 || typ === TIN) {
          otmp.otrapped = ((trapped === 1 ? 1 : 0) >>> 0) & 1;
        }
      }
      if (contents === EMPTY) {
        if (otmp.otyp === BAG_OF_TRICKS || otmp.otyp === HORN_OF_PLENTY) {
          if (otmp.spe > 0) {
            otmp.spe = 0;
          }
        } else if (!!otmp.cobj) {
          await delete_contents(otmp);
          otmp.owt = await weight(otmp) >>> 0;
        }
      }
      if (otmp.otyp === 189 || otmp.otyp === 190) {
        if (locked) {
          otmp.olocked = 1, otmp.obroken = 0;
        } else if (unlocked) {
          otmp.olocked = 0, otmp.obroken = 0;
        } else if (broken) {
          otmp.olocked = 0, otmp.obroken = 1;
        }
      }
      if (isgreased) {
        otmp.greased = 1;
      }
      if (isdiluted && otmp.oclass === POTION_CLASS && otmp.otyp !== POT_WATER) {
        otmp.oeroded = 1;
      }
      if (otmp.otyp === TIN && tvariety >= 0 && (rn2(4) || G.flags.debug)) {
        set_tin_variety(otmp, tvariety);
      }
      if (name) {
        let aname = null;
        const objtyp = new Int16Array(1);
        aname = artifact_name(name, P(objtyp, 0));
        if (aname && objtyp[0] === otmp.otyp) {
          name = aname;
        }
        if (otmp.otyp === SPE_NOVEL) {
          let novelname = null;
          novelname = await lookup_novel(name, P(otmp, "corpsenm"));
          if (novelname) {
            name = novelname;
          }
        }
        otmp = await oname(otmp, name);
        if (otmp.oartifact || $peq(name, aname)) {
          otmp.quan = 1;
          ++G.u.uconduct.wisharti;
        }
      }
      if ((is_quest_artifact(otmp) || otmp.oartifact && rn2(nartifact_exist()) > 1) && !G.flags.debug) {
        artifact_exists(otmp, safe_oname(otmp), FALSE);
        await obfree(otmp, null);
        otmp = G.zeroobj;
        await pline(S("For a moment, you feel %s in your %s, but it disappears!"), G.c_common_strings.c_something, await makeplural(body_part(HAND)));
        return otmp;
      }
      if (halfeaten && otmp.oclass === FOOD_CLASS) {
        if (otmp.otyp === CORPSE) {
          otmp.oeaten = G.mons[otmp.corpsenm].cnutrit;
        } else {
          otmp.oeaten = G.objects[otmp.otyp].oc_nutrition;
        }
        consume_oeaten(otmp, 1);
      }
      otmp.owt = await weight(otmp) >>> 0;
      if (very && otmp.otyp === HEAVY_IRON_BALL) {
        otmp.owt = otmp.owt + IRON_BALL_W_INCR >>> 0;
      } else if (gsize > 1 && otmp.globby | 0) {
        otmp.owt = otmp.owt + (100 + (gsize - 2) * 200 >>> 0) >>> 0;
      }
      return otmp;
    }
    break;
  }
}

export function rnd_class(first: number, last: number): number {
  let i = 0;
  let x = 0;
  let sum = 0;
  if (first === last) {
    return first;
  }
  for (i = first; i <= last; ++i) {
    sum += G.objects[i].oc_prob;
  }
  if (!sum) {
    return first + rn2(last - first + 1);
  }
  x = rnd(sum);
  for (i = first; i <= last; ++i) {
    if (G.objects[i].oc_prob && (x -= G.objects[i].oc_prob) <= 0) {
      return i;
    }
  }
  return 0;
}

function Japanese_item_name(i: number): Ptr | null {
  let j = Japanese_items[0];
  while (j.item) {
    if (i === j.item) {
      return j.name;
    }
    j = $sadd(j, 1);
  }
  return null;
}

export function suit_simple_name(suit: struct_obj | null): Ptr | null {
  let suitnm = null;
  let esuitp = null;
  if (suit) {
    if (suit.otyp >= 82 && suit.otyp <= 90) {
      return S("dragon mail");
    } else if (suit.otyp >= 91 && suit.otyp <= 99) {
      return S("dragon scales");
    }
    suitnm = G.obj_descr[G.objects[suit.otyp].oc_name_idx].oc_name;
    esuitp = eos(suitnm);
    if (strlen(suitnm) > 5 && !strcmp(esuitp.add(-5), S(" mail"))) {
      return S("mail");
    } else if (strlen(suitnm) > 7 && !strcmp(esuitp.add(-7), S(" jacket"))) {
      return S("jacket");
    }
  }
  return S("suit");
}

export function cloak_simple_name(cloak: struct_obj | null): Ptr | null {
  if (cloak) {
    switch (cloak.otyp) {
    case 122:
      return S("robe");
    case 117:
      return S("wrapping");
    case 123:
      return G.objects[cloak.otyp].oc_name_known | 0 && cloak.dknown | 0 ? S("smock") : S("apron");
    default:
      break;
    }
  }
  return S("cloak");
}

export function helm_simple_name(helmet: struct_obj | null): Ptr | null {
  return helmet && !((G.objects[helmet.otyp].oc_material | 0) >= IRON && (G.objects[helmet.otyp].oc_material | 0) <= MITHRIL) ? S("hat") : S("helm");
}

export function gloves_simple_name(gloves: struct_obj | null): Ptr | null {
  if (gloves && gloves.dknown | 0) {
    let otyp = gloves.otyp;
    let ocl = $sat(G.objects, otyp);
    let actualn = G.obj_descr[ocl.oc_name_idx].oc_name;
    let descrpn = G.obj_descr[ocl.oc_descr_idx].oc_descr;
    if (strstri(G.objects[otyp].oc_name_known | 0 ? actualn : descrpn, P(gloves_simple_name$gauntlets))) {
      return P(gloves_simple_name$gauntlets);
    }
  }
  return S("gloves");
}

export async function mimic_obj_name(mtmp: struct_monst | null): Promise<Ptr | null> {
  if ((mtmp.m_ap_type & 7) === M_AP_OBJECT) {
    if (mtmp.mappearance === GOLD_PIECE) {
      return S("gold");
    }
    if (mtmp.mappearance !== STRANGE_OBJECT) {
      return await simple_typename(mtmp.mappearance | 0);
    }
  }
  return S("whatcha-may-callit");
}

export async function safe_qbuf(qbuf: Ptr | null, qprefix: Ptr | null, qsuffix: Ptr | null, obj: struct_obj | null, func: Function | null, altfunc: Function | null, lastR: Ptr | null): Promise<Ptr | null> {
  let bufp = null;
  let endp = null;
  let len = 0;
  let lenlimit = 0;
  let len_qpfx = (qprefix ? strlen(qprefix) : 0) >>> 0;
  let len_qsfx = (qsuffix ? strlen(qsuffix) : 0) >>> 0;
  let len_lastR = strlen(lastR) >>> 0;
  lenlimit = QBUFSZ - 1;
  endp = qbuf.add(lenlimit);
  if (len_qpfx > lenlimit) {
    await impossible(S("safe_qbuf: prefix too long (%u characters)."), len_qpfx);
  } else if (len_qpfx + len_qsfx >>> 0 > lenlimit) {
    await impossible(S("safe_qbuf: suffix too long (%u + %u characters)."), len_qpfx, len_qsfx);
  } else if ((len_qpfx + len_lastR >>> 0) + len_qsfx >>> 0 > lenlimit) {
    await impossible(S("safe_qbuf: filler too long (%u + %u + %u characters)."), len_qpfx, len_lastR, len_qsfx);
  }
  if ($peq(qbuf, qprefix)) {
    endp.a[endp.o] = 0;
  } else if (qprefix) {
    strncpy(qbuf, qprefix, lenlimit);
    endp.a[endp.o] = 0;
  } else {
    qbuf.a[qbuf.o] = 0;
  }
  len = strlen(qbuf) >>> 0;
  if ((len + len_lastR >>> 0) + len_qsfx >>> 0 > lenlimit) {
    if (len < lenlimit) {
      strncpy(qbuf.add(len), lastR, lenlimit - len >>> 0);
      endp.a[endp.o] = 0;
      len = strlen(qbuf) >>> 0;
      if (qsuffix && len < lenlimit) {
        strncpy(qbuf.add(len), qsuffix, lenlimit - len >>> 0);
        endp.a[endp.o] = 0;
      }
    }
  } else {
    len = len + len_qsfx >>> 0;
    bufp = await short_oname(obj, func, altfunc, lenlimit - len >>> 0);
    if (len + strlen(bufp) <= lenlimit) {
      strcat(qbuf, bufp);
    } else {
      strcat(qbuf, lastR);
    }
    releaseobuf(bufp);
    if (qsuffix) {
      strcat(qbuf, qsuffix);
    }
  }
  return qbuf;
}

function globwt(otmp: struct_obj | null, buf: Ptr | null, weightformatted_p: Ptr | null): Ptr | null {
  buf.a[buf.o] = 0;
  if (otmp.globby) {
    sprintf(buf, S("%u aum, "), otmp.owt);
    weightformatted_p.a[weightformatted_p.o] = TRUE;
  } else {
    weightformatted_p.a[weightformatted_p.o] = FALSE;
  }
  return buf;
}

export function $init(): void {
  Japanese_items = $sarrOf([struct_Jitem.$of(SHORT_SWORD, S("wakizashi")),
struct_Jitem.$of(BROADSWORD, S("ninja-to")),
struct_Jitem.$of(FLAIL, S("nunchaku")),
struct_Jitem.$of(GLAIVE, S("naginata")),
struct_Jitem.$of(LOCK_PICK, S("osaku")),
struct_Jitem.$of(WOODEN_HARP, S("koto")),
struct_Jitem.$of(KNIFE, S("shito")),
struct_Jitem.$of(PLATE_MAIL, S("tanko")),
struct_Jitem.$of(HELMET, S("kabuto")),
struct_Jitem.$of(LEATHER_GLOVES, S("yugake")),
struct_Jitem.$of(FOOD_RATION, S("gunyoki")),
struct_Jitem.$of(POT_BOOZE, S("sake")),
struct_Jitem.$of(0, S(""))]);
  obufs = $arr(12, () => new Int8Array(256));
  obufidx = 0;
  distantname = 0;
  wrp = [S("wand"),
S("ring"),
S("potion"),
S("scroll"),
S("gem"),
S("amulet"),
S("spellbook"),
S("spell book"),
S("weapon"),
S("armor"),
S("tool"),
S("food"),
S("comestible")];
  wrpsym = $ta(Int8Array, 13, [WAND_CLASS, RING_CLASS, POTION_CLASS, SCROLL_CLASS, GEM_CLASS, AMULET_CLASS, SPBOOK_CLASS, SPBOOK_CLASS, WEAPON_CLASS, ARMOR_CLASS, TOOL_CLASS, FOOD_CLASS, FOOD_CLASS]);
  special_subjs = [S("erinys"),
S("manes"),
S("Cyclops"),
S("Hippocrates"),
S("Pelias"),
S("aklys"),
S("amnesia"),
S("detect monsters"),
S("paralysis"),
S("shape changers"),
S("nemesis"),
null];
  one_off = $sarrOf([struct_sing_plur.$of(S("child"), S("children")),
struct_sing_plur.$of(S("cubus"), S("cubi")),
struct_sing_plur.$of(S("culus"), S("culi")),
struct_sing_plur.$of(S("djinni"), S("djinn")),
struct_sing_plur.$of(S("erinys"), S("erinyes")),
struct_sing_plur.$of(S("foot"), S("feet")),
struct_sing_plur.$of(S("fungus"), S("fungi")),
struct_sing_plur.$of(S("goose"), S("geese")),
struct_sing_plur.$of(S("knife"), S("knives")),
struct_sing_plur.$of(S("labrum"), S("labra")),
struct_sing_plur.$of(S("louse"), S("lice")),
struct_sing_plur.$of(S("mouse"), S("mice")),
struct_sing_plur.$of(S("mumak"), S("mumakil")),
struct_sing_plur.$of(S("nemesis"), S("nemeses")),
struct_sing_plur.$of(S("ovum"), S("ova")),
struct_sing_plur.$of(S("ox"), S("oxen")),
struct_sing_plur.$of(S("passerby"), S("passersby")),
struct_sing_plur.$of(S("rtex"), S("rtices")),
struct_sing_plur.$of(S("serum"), S("sera")),
struct_sing_plur.$of(S("staff"), S("staves")),
struct_sing_plur.$of(S("tooth"), S("teeth")),
struct_sing_plur.$of()]);
  as_is = [S("boots"),
S("shoes"),
S("gloves"),
S("lenses"),
S("scales"),
S("eyes"),
S("gauntlets"),
S("iron bars"),
S("bison"),
S("deer"),
S("elk"),
S("fish"),
S("fowl"),
S("tuna"),
S("yaki"),
S("-hai"),
S("krill"),
S("manes"),
S("moose"),
S("ninja"),
S("sheep"),
S("ronin"),
S("roshi"),
S("shito"),
S("tengu"),
S("ki-rin"),
S("Nazgul"),
S("gunyoki"),
S("piranha"),
S("samurai"),
S("shuriken"),
null];
  o_ranges = $sarrOf([struct_o_range.$of(S("bag"), TOOL_CLASS, SACK, BAG_OF_TRICKS),
struct_o_range.$of(S("lamp"), TOOL_CLASS, OIL_LAMP, MAGIC_LAMP),
struct_o_range.$of(S("candle"), TOOL_CLASS, TALLOW_CANDLE, WAX_CANDLE),
struct_o_range.$of(S("horn"), TOOL_CLASS, TOOLED_HORN, HORN_OF_PLENTY),
struct_o_range.$of(S("shield"), ARMOR_CLASS, SMALL_SHIELD, SHIELD_OF_REFLECTION),
struct_o_range.$of(S("hat"), ARMOR_CLASS, FEDORA, DUNCE_CAP),
struct_o_range.$of(S("helm"), ARMOR_CLASS, ELVEN_LEATHER_HELM, HELM_OF_TELEPATHY),
struct_o_range.$of(S("gloves"), ARMOR_CLASS, LEATHER_GLOVES, GAUNTLETS_OF_DEXTERITY),
struct_o_range.$of(S("gauntlets"), ARMOR_CLASS, LEATHER_GLOVES, GAUNTLETS_OF_DEXTERITY),
struct_o_range.$of(S("boots"), ARMOR_CLASS, LOW_BOOTS, LEVITATION_BOOTS),
struct_o_range.$of(S("shoes"), ARMOR_CLASS, LOW_BOOTS, IRON_SHOES),
struct_o_range.$of(S("cloak"), ARMOR_CLASS, MUMMY_WRAPPING, CLOAK_OF_DISPLACEMENT),
struct_o_range.$of(S("shirt"), ARMOR_CLASS, HAWAIIAN_SHIRT, T_SHIRT),
struct_o_range.$of(S("dragon scales"), ARMOR_CLASS, GRAY_DRAGON_SCALES, YELLOW_DRAGON_SCALES),
struct_o_range.$of(S("dragon scale mail"), ARMOR_CLASS, GRAY_DRAGON_SCALE_MAIL, YELLOW_DRAGON_SCALE_MAIL),
struct_o_range.$of(S("sword"), WEAPON_CLASS, SHORT_SWORD, KATANA),
struct_o_range.$of(S("venom"), VENOM_CLASS, BLINDING_VENOM, ACID_VENOM),
struct_o_range.$of(S("gray stone"), GEM_CLASS, LUCKSTONE, FLINT),
struct_o_range.$of(S("grey stone"), GEM_CLASS, LUCKSTONE, FLINT)]);
  spellings = $sarrOf([struct_alt_spellings.$of(S("pickax"), PICK_AXE),
struct_alt_spellings.$of(S("whip"), BULLWHIP),
struct_alt_spellings.$of(S("saber"), SILVER_SABER),
struct_alt_spellings.$of(S("silver sabre"), SILVER_SABER),
struct_alt_spellings.$of(S("smooth shield"), SHIELD_OF_REFLECTION),
struct_alt_spellings.$of(S("grey dragon scale mail"), GRAY_DRAGON_SCALE_MAIL),
struct_alt_spellings.$of(S("grey dragon scales"), GRAY_DRAGON_SCALES),
struct_alt_spellings.$of(S("iron ball"), HEAVY_IRON_BALL),
struct_alt_spellings.$of(S("lantern"), BRASS_LANTERN),
struct_alt_spellings.$of(S("mattock"), DWARVISH_MATTOCK),
struct_alt_spellings.$of(S("amulet of poison resistance"), AMULET_VERSUS_POISON),
struct_alt_spellings.$of(S("potion of sleep"), POT_SLEEPING),
struct_alt_spellings.$of(S("stone"), ROCK),
struct_alt_spellings.$of(S("camera"), EXPENSIVE_CAMERA),
struct_alt_spellings.$of(S("tee shirt"), T_SHIRT),
struct_alt_spellings.$of(S("can"), TIN),
struct_alt_spellings.$of(S("can opener"), TIN_OPENER),
struct_alt_spellings.$of(S("kelp"), KELP_FROND),
struct_alt_spellings.$of(S("eucalyptus"), EUCALYPTUS_LEAF),
struct_alt_spellings.$of(S("royal jelly"), LUMP_OF_ROYAL_JELLY),
struct_alt_spellings.$of(S("lembas"), LEMBAS_WAFER),
struct_alt_spellings.$of(S("cookie"), FORTUNE_COOKIE),
struct_alt_spellings.$of(S("pie"), CREAM_PIE),
struct_alt_spellings.$of(S("marker"), MAGIC_MARKER),
struct_alt_spellings.$of(S("hook"), GRAPPLING_HOOK),
struct_alt_spellings.$of(S("grappling iron"), GRAPPLING_HOOK),
struct_alt_spellings.$of(S("grapnel"), GRAPPLING_HOOK),
struct_alt_spellings.$of(S("grapple"), GRAPPLING_HOOK),
struct_alt_spellings.$of(S("protection from shape shifters"), RIN_PROTECTION_FROM_SHAPE_CHAN),
struct_alt_spellings.$of(S("box"), LARGE_BOX),
struct_alt_spellings.$of(S("luck stone"), LUCKSTONE),
struct_alt_spellings.$of(S("load stone"), LOADSTONE),
struct_alt_spellings.$of(S("touch stone"), TOUCHSTONE),
struct_alt_spellings.$of(S("flintstone"), FLINT),
struct_alt_spellings.$of()]);
  singplur_compound$compounds = [S(" of "),
S(" labeled "),
S(" called "),
S(" named "),
S(" above"),
S(" versus "),
S(" from "),
S(" in "),
S(" on "),
S(" a la "),
S(" with"),
S(" de "),
S(" d'"),
S(" du "),
S("-in-"),
S("-at-"),
null];
  singplur_compound$compound_start = $cs(" -", 3);
  makeplural$already_plural = [S("ae"), S("matzot"), null];
  badman$no_men = [S("albu"),
S("antihu"),
S("anti"),
S("ata"),
S("auto"),
S("bildungsro"),
S("cai"),
S("cay"),
S("ceru"),
S("corner"),
S("decu"),
S("des"),
S("dura"),
S("fir"),
S("hanu"),
S("het"),
S("infrahu"),
S("inhu"),
S("nonhu"),
S("otto"),
S("out"),
S("prehu"),
S("protohu"),
S("subhu"),
S("superhu"),
S("talis"),
S("unhu"),
S("sha"),
S("hu"),
S("un"),
S("le"),
S("re"),
S("so"),
S("to"),
S("at"),
S("a")];
  badman$no_man = [S("abdo"),
S("acu"),
S("agno"),
S("ceru"),
S("cogno"),
S("cycla"),
S("fleh"),
S("grava"),
S("hegu"),
S("preno"),
S("sonar"),
S("speci"),
S("dai"),
S("exa"),
S("fla"),
S("sta"),
S("teg"),
S("tegu"),
S("vela"),
S("da"),
S("hy"),
S("lu"),
S("no"),
S("nu"),
S("ra"),
S("ru"),
S("se"),
S("vi"),
S("ya"),
S("o"),
S("a")];
  wishymatch$detect_SP = $cs("detect ", 8);
  wishymatch$SP_detection = $cs(" detection", 11);
  gloves_simple_name$gauntlets = $cs("gauntlets", 10);
}
