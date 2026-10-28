// @ts-nocheck
// NetHack 3.6.7 steal.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { o_unleash } from './apply.ts';
import { touch_artifact } from './artifact.ts';
import { newsym } from './display.ts';
import { flooreffects } from './do.ts';
import { Adjmonnam, Monnam, y_monnam } from './do_name.ts';
import { Amulet_off, Armor_off, Blindf_off, Boots_off, Cloak_off, Gloves_off, Helmet_off, Ring_gone, Shield_off, Shirt_off, cancel_don, doffing, donning, stop_donning } from './do_wear.ts';
import { droppables } from './dogmove.ts';
import { is_fainted, maybe_finished_meal } from './eat.ts';
import { in_rooms, inv_cnt, money_cnt, nomul, unmul } from './hack.ts';
import { dist2, s_suffix, upstart } from './hacklib.ts';
import { carry_obj_effects, freeinv, g_at, stackobj } from './invent.ts';
import { obj_sheds_light, snuff_light_source } from './light.ts';
import { add_to_minv, obj_extract_self, place_object, splitobj } from './mkobj.ts';
import { can_carry, monnear } from './mon.ts';
import { attacktype, dmgtype } from './mondata.ts';
import { monflee } from './monmove.ts';
import { Tobjnam, cloak_simple_name, distant_name, doname, helm_simple_name, makeplural, otense, simpleonames, suit_simple_name, yname } from './objnam.ts';
import { Your, impossible, pline } from './pline.ts';
import { body_part, mbodypart, skinback } from './polyself.ts';
import { is_quest_artifact } from './questpgr.ts';
import { unpunish } from './read.ts';
import { rn2, rnd } from './rnd.ts';
import { costly_spot, obfree, shop_keeper, subfrombill } from './shk.ts';
import { rloc, rloco, tele_restrict } from './teleport.ts';
import { minstapetrify, unconscious } from './trap.ts';
import { setmnotwielded } from './weapon.ts';
import { uqwepgone, uswapwepgone, uwepgone, welded } from './wield.ts';
import { worm_known } from './worm.ts';
import { setnotworn, setworn, update_mon_intrinsics } from './worn.ts';
import { obj_resists } from './zap.ts';
import { struct_monst, struct_obj } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, strchr, strcmp, strcpy, strncmp } from './rt/index.ts';
import { ADORNED, AD_SITM, AMULET_CLASS, AMULET_OF_YENDOR, ARMOR_CLASS, AT_ENGL, BELL, BELL_OF_OPENING, BLINDED, BOULDER, CANDELABRUM_OF_INVOCATION, COIN_CLASS, CONFLICT, CORPSE, DETECT_MONSTERS, FAKE_AMULET_OF_YENDOR, FALSE, FLYING, FOOD_CLASS, FOOT, GOLD_PIECE, HAND, INFRAVISION, LARGEST_INT, LEASH, LEFT_RING, LEVITATION, RIGHT_RING, RING_CLASS, ROCK_CLASS, SEE_INVIS, SHOPBASE, SPE_BOOK_OF_THE_DEAD, TELEPAT, TOOL_CLASS, TRUE, WARN_OF_MON, WEAPON_CLASS, W_ACCESSORY, W_AMUL, W_ARMG, W_ARMOR, W_BALL, W_CHAIN, W_RING, W_SADDLE, W_TOOL, W_WEAPONS, W_WEP } from './consts.ts';

let steal$how: any;

function equipname(otmp: struct_obj | null): Ptr | null {
  return otmp === G.uarmu ? S("shirt") : otmp === G.uarmf ? S("boots") : otmp === G.uarms ? S("shield") : otmp === G.uarmg ? S("gloves") : otmp === G.uarmc ? cloak_simple_name(otmp) : otmp === G.uarmh ? helm_simple_name(otmp) : suit_simple_name(otmp);
}

export function somegold(lmoney: number): number {
  let igold = lmoney >= LARGEST_INT ? LARGEST_INT : lmoney | 0;
  if (igold < 50) {
    ;
  } else if (igold < 100) {
    igold = rn2(igold - 25 + 1) + 25;
  } else if (igold < 500) {
    igold = rn2(igold - 50 + 1) + 50;
  } else if (igold < 1000) {
    igold = rn2(igold - 100 + 1) + 100;
  } else if (igold < 5000) {
    igold = rn2(igold - 500 + 1) + 500;
  } else if (igold < 10000) {
    igold = rn2(igold - 1000 + 1) + 1000;
  } else {
    igold = rn2(igold - 5000 + 1) + 5000;
  }
  return igold;
}

export function findgold(chain: struct_obj | null): struct_obj | null {
  while (chain && chain.otyp !== GOLD_PIECE) {
    chain = chain.nobj;
  }
  return chain;
}

export async function stealgold(mtmp: struct_monst | null): Promise<void> {
  let fgold = g_at(G.u.ux, G.u.uy);
  let ygold = null;
  let tmp = 0;
  let who = null;
  let whose = null;
  let what = null;
  while (fgold && fgold.otyp !== GOLD_PIECE) {
    fgold = fgold.v.v_nexthere;
  }
  ygold = findgold(G.invent);
  if (fgold && (!ygold || fgold.quan > ygold.quan || !rn2(5))) {
    await obj_extract_self(fgold);
    await add_to_minv(mtmp, fgold);
    await newsym(G.u.ux, G.u.uy);
    if (G.u.usteed) {
      who = G.u.usteed;
      whose = s_suffix(await y_monnam(who));
      what = await makeplural(mbodypart(who, FOOT));
    } else {
      who = G.youmonst;
      whose = S("your");
      what = await makeplural(body_part(FOOT));
    }
    if ((who.data.mflags1 & 524288) >>> 0 !== 0) {
      what = S("coils");
    }
    if (!strncmp(what, S("rear "), 5)) {
      what = what.add(5);
    }
    await pline(S("%s quickly snatches some gold from %s %s %s!"), await Monnam(mtmp), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked ? S("beneath") : S("between"), whose, what);
    if (!ygold || !rn2(5)) {
      if (!await tele_restrict(mtmp)) {
        await rloc(mtmp, TRUE);
      }
      await monflee(mtmp, 0, FALSE, FALSE);
    }
  } else if (ygold) {
    let gold_price = G.objects[GOLD_PIECE].oc_cost;
    tmp = Math.trunc((somegold(money_cnt(G.invent)) + gold_price - 1) / gold_price);
    tmp = tmp < ygold.quan ? tmp : ygold.quan;
    if (tmp < ygold.quan) {
      ygold = await splitobj(ygold, tmp);
    } else {
      await setnotworn(ygold);
    }
    await freeinv(ygold);
    await add_to_minv(mtmp, ygold);
    await Your(S("purse feels lighter."));
    if (!await tele_restrict(mtmp)) {
      await rloc(mtmp, TRUE);
    }
    await monflee(mtmp, 0, FALSE, FALSE);
    G.context.botl = 1;
  }
}

async function stealarm(): Promise<number> {
  let $g = 0;
  let mtmp = null;
  let otmp = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if (otmp.o_id === G.stealoid) {
          for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
            if (mtmp.m_id === G.stealmid) {
              if (mtmp.mhp < 1) {
                await impossible(S("stealarm(): dead monster stealing"));
              }
              if (!dmgtype(mtmp.data, AD_SITM)) {
                { $g = 1; continue $L; }
              }
              if (otmp.unpaid) {
                await subfrombill(otmp, await shop_keeper($rd(P(G.u.ushops))));
              }
              await freeinv(otmp);
              await pline(S("%s steals %s!"), await Monnam(mtmp), await doname(otmp));
              await mpickobj(mtmp, otmp);
              await monflee(mtmp, 0, FALSE, FALSE);
              if (!await tele_restrict(mtmp)) {
                await rloc(mtmp, TRUE);
              }
              break;
            }
          }
          break;
        }
      }
    case 1: // botm
      G.stealoid = 0;
      return 0;
    }
    break;
  }
}

export async function remove_worn_item(obj: struct_obj | null, unchain_ball: number): Promise<void> {
  if (donning(obj)) {
    cancel_don();
  }
  if (!obj.owornmask) {
    return;
  }
  if (obj.owornmask & W_ARMOR) {
    if (obj === G.uskin) {
      await impossible(S("Removing embedded scales?"));
      await skinback(TRUE);
    }
    if (obj === G.uarm) {
      await Armor_off();
    } else if (obj === G.uarmc) {
      await Cloak_off();
    } else if (obj === G.uarmf) {
      await Boots_off();
    } else if (obj === G.uarmg) {
      await Gloves_off();
    } else if (obj === G.uarmh) {
      await Helmet_off();
    } else if (obj === G.uarms) {
      await Shield_off();
    } else if (obj === G.uarmu) {
      await Shirt_off();
    } else {
      await setworn(null, obj.owornmask & W_ARMOR);
    }
  } else if (obj.owornmask & W_AMUL) {
    await Amulet_off();
  } else if (obj.owornmask & W_RING) {
    await Ring_gone(obj);
  } else if (obj.owornmask & W_TOOL) {
    await Blindf_off(obj);
  } else if (obj.owornmask & W_WEAPONS) {
    if (obj === G.uwep) {
      await uwepgone();
    }
    if (obj === G.uswapwep) {
      await uswapwepgone();
    }
    if (obj === G.uquiver) {
      await uqwepgone();
    }
  }
  if (obj.owornmask & (W_BALL | W_CHAIN)) {
    if (unchain_ball) {
      await unpunish();
    }
  } else if (obj.owornmask) {
    await setnotworn(obj);
  }
}

export async function steal(mtmp: struct_monst | null, objnambuf: Ptr | null): Promise<number> {
  let $g = 0;
  let otmp = null;
  let tmp = 0;
  let could_petrify = 0;
  let armordelay = 0;
  let olddelay = 0;
  let icnt = 0;
  let named = 0;
  let retrycnt = 0;
  let monkey_business = 0;
  let was_doffing = 0;
  let was_punished = 0;
  let ostuck = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      named = 0;
      retrycnt = 0;
      was_punished = (!!G.uball ? 1 : 0) << 24 >> 24;
      if (objnambuf) {
        objnambuf.a[objnambuf.o] = 0;
      }
      if (!monnear(mtmp, G.u.ux, G.u.uy)) {
        return 0;
      }
      if (G.occupation) {
        await maybe_finished_meal(FALSE);
      }
      icnt = inv_cnt(FALSE);
      if (!(!icnt || icnt === 1 && G.uskin)) { $g = 5; continue $L; }
    case 1: // nothing_to_steal
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        await pline(S("Somebody tries to rob you, but finds nothing to steal."));
      } else if (inv_cnt(TRUE) > inv_cnt(FALSE)) {
        await pline(S("%s tries to rob you, but isn't interested in gold."), await Monnam(mtmp));
      } else {
        await pline(S("%s tries to rob you, but there is nothing to steal!"), await Monnam(mtmp));
      }
      return 1;
    case 5:
      monkey_business = ((mtmp.data.mflags1 & 262144) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
      if (monkey_business || G.uarmg) {
        ;
      } else if (G.u.uprops[ADORNED].extrinsic & LEFT_RING) {
        otmp = G.uleft;
        { $g = 2; continue $L; }
      } else if (G.u.uprops[ADORNED].extrinsic & RIGHT_RING) {
        otmp = G.uright;
        { $g = 2; continue $L; }
      }
    case 3: // retry
      tmp = 0;
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if ((!G.uarm || otmp !== G.uarmc) && otmp !== G.uskin && otmp.oclass !== COIN_CLASS) {
          tmp += otmp.owornmask & (W_ARMOR | W_ACCESSORY) ? 5 : 1;
        }
      }
      if (!tmp) {
        { $g = 1; continue $L; }
      }
      tmp = rn2(tmp);
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if ((!G.uarm || otmp !== G.uarmc) && otmp !== G.uskin && otmp.oclass !== COIN_CLASS) {
          tmp -= otmp.owornmask & (W_ARMOR | W_ACCESSORY) ? 5 : 1;
          if (tmp < 0) {
            break;
          }
        }
      }
      if (!otmp) {
        await impossible(S("Steal fails!"));
        return 0;
      }
      if ((otmp === G.uleft || otmp === G.uright) && G.uarmg) {
        otmp = G.uarmg;
      }
      if (otmp === G.uarmg && G.uwep) {
        otmp = G.uwep;
      } else if (otmp === G.uarm && G.uarmc) {
        otmp = G.uarmc;
      } else if (otmp === G.uarmu && G.uarmc) {
        otmp = G.uarmc;
      } else if (otmp === G.uarmu && G.uarm) {
        otmp = G.uarm;
      }
    case 2: // gotobj
      if (otmp.o_id === G.stealoid) {
        return 0;
      }
      if (otmp.otyp === BOULDER && !((mtmp.data.mflags2 & 134217728) >>> 0 !== 0)) {
        if (!retrycnt++) {
          { $g = 3; continue $L; }
        }
        { $g = 4; continue $L; }
      }
      if (!monkey_business) { $g = 6; continue $L; }
      if (otmp === G.uball) {
        ostuck = TRUE;
      } else if (otmp === G.uquiver || otmp === G.uswapwep && !G.u.twoweap) {
        ostuck = FALSE;
      } else {
        ostuck = (otmp.cursed | 0 && otmp.owornmask || otmp === G.uright && welded(G.uwep) || otmp === G.uleft && welded(G.uwep) && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) ? 1 : 0) << 24 >> 24;
      }
      if (!(ostuck || can_carry(mtmp, otmp) === 0)) { $g = 7; continue $L; }
    case 4: // cant_take
      await pline(S("%s tries to %s %s%s but gives up."), await Monnam(mtmp), steal$how[rn2(Math.trunc(32 / 8) | 0)], otmp.owornmask & W_ARMOR ? S("your ") : S(""), otmp.owornmask & W_ARMOR ? equipname(otmp) : await yname(otmp));
      return !rn2((inv_cnt(FALSE) / 5 | 0) + 2) ? 1 : 0;
    case 7:
    case 6:
      if (otmp.otyp === LEASH && otmp.corpsenm) {
        if (monkey_business && otmp.cursed | 0) {
          { $g = 4; continue $L; }
        }
        o_unleash(otmp);
      }
      was_doffing = doffing(otmp);
      olddelay = await stop_donning(otmp);
      await stop_occupation();
      if (otmp.owornmask & (W_ARMOR | W_ACCESSORY)) {
        switch (otmp.oclass) {
        case TOOL_CLASS:
        case AMULET_CLASS:
        case RING_CLASS:
        case FOOD_CLASS:
          await remove_worn_item(otmp, TRUE);
          break;
        case ARMOR_CLASS:
          armordelay = G.objects[otmp.otyp].oc_delay;
          if (olddelay > 0 && olddelay < armordelay) {
            armordelay = olddelay;
          }
          if (monkey_business) {
            if (armordelay >= 1 && !olddelay && rn2(10)) {
              { $g = 4; continue $L; }
            }
            await remove_worn_item(otmp, TRUE);
            break;
          } else {
            let curssv = otmp.cursed | 0;
            let slowly = 0;
            let seen = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? 1 : 0) << 24 >> 24;
            otmp.cursed = 0;
            if (G.multi < 0 && (unconscious() || is_fainted())) {
              await unmul(null);
            }
            slowly = armordelay >= 1 || G.multi < 0 ? 1 : 0;
            if (G.flags.female) {
              await pline(S("%s charms you.  You gladly %s your %s."), !seen ? S("She") : await Monnam(mtmp), curssv ? S("let her take") : !slowly ? S("hand over") : was_doffing ? S("continue removing") : S("start removing"), equipname(otmp));
            } else {
              await pline(S("%s seduces you and %s off your %s."), !seen ? S("She") : await Adjmonnam(mtmp, S("beautiful")), curssv ? S("helps you to take") : !slowly ? S("you take") : was_doffing ? S("you continue taking") : S("you start taking"), equipname(otmp));
            }
            ++named;
            nomul(-armordelay);
            G.multi_reason = S("taking off clothes");
            G.nomovemsg = null;
            await remove_worn_item(otmp, TRUE);
            otmp.cursed = (curssv >>> 0) & 1;
            if (G.multi < 0) {
              G.stealoid = otmp.o_id;
              G.stealmid = mtmp.m_id;
              G.afternmv = stealarm;
              return 0;
            }
          }
          break;
        default:
          await impossible(S("Tried to steal a strange worn thing. [%d]"), otmp.oclass);
        }
      } else if (otmp.owornmask) {
        await remove_worn_item(otmp, TRUE);
      }
      if (objnambuf) {
        strcpy(objnambuf, await yname(otmp));
      }
      if (!(G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) && !(was_punished && !!!G.uball)) {
        mtmp.mavenge = 1;
      }
      if (otmp.unpaid) {
        await subfrombill(otmp, await shop_keeper($rd(P(G.u.ushops))));
      }
      await freeinv(otmp);
      await pline(S("%s%s stole %s."), named ? S("She") : await Monnam(mtmp), was_punished && !!!G.uball ? S(" removed your chain and") : S(""), await doname(otmp));
      could_petrify = otmp.otyp === CORPSE && ($sat(G.mons, otmp.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, otmp.corpsenm) === $sat(G.mons, 9)) ? 1 : 0;
      await mpickobj(mtmp, otmp);
      if (could_petrify && !(mtmp.misc_worn_check & W_ARMG)) {
        await minstapetrify(mtmp, TRUE);
        return -1;
      }
      return G.multi < 0 ? 0 : 1;
    }
    break;
  }
}

export async function mpickobj(mtmp: struct_monst | null, otmp: struct_obj | null): Promise<number> {
  let freed_otmp = 0;
  let snuff_otmp = FALSE;
  if (!otmp) {
    await impossible(S("monster (%s) taking or picking up nothing?"), mtmp.data.mname);
    return 1;
  } else if (otmp === G.uball || otmp === G.uchain) {
    await impossible(S("monster (%s) taking or picking up attached %s (%s)?"), mtmp.data.mname, otmp === G.uchain ? S("chain") : S("ball"), await simpleonames(otmp));
    return 0;
  }
  if (otmp === G.thrownobj) {
    G.thrownobj = null;
  } else if (otmp === G.kickedobj) {
    G.kickedobj = null;
  }
  if (obj_sheds_light(otmp) && attacktype(mtmp.data, AT_ENGL)) {
    if (G.u.uswallow | 0 && mtmp === G.u.ustuck && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s out."), await Tobjnam(otmp, S("go")));
    }
    snuff_otmp = TRUE;
  }
  if (!mtmp.mtame) {
    otmp.no_charge = 0;
  }
  await carry_obj_effects(otmp);
  freed_otmp = await add_to_minv(mtmp, otmp);
  if (snuff_otmp) {
    await snuff_light_source(mtmp.mx, mtmp.my);
  }
  return freed_otmp;
}

export async function stealamulet(mtmp: struct_monst | null): Promise<void> {
  let buf = new Int8Array(256);
  let otmp = null;
  let obj = null;
  let real = 0;
  let fake = 0;
  let n = 0;
  for (n = 0, obj = G.invent; obj; obj = obj.nobj) {
    if (obj.oartifact >= 21) {
      ++n, otmp = obj;
    }
  }
  if (n > 1) {
    n = rnd(n);
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (otmp.oartifact >= 21 && !--n) {
        break;
      }
    }
  }
  if (!otmp) {
    if (G.u.uhave.amulet) {
      real = AMULET_OF_YENDOR;
      fake = FAKE_AMULET_OF_YENDOR;
    } else if (G.u.uhave.bell) {
      real = BELL_OF_OPENING;
      fake = BELL;
    } else if (G.u.uhave.book) {
      real = SPE_BOOK_OF_THE_DEAD;
    } else if (G.u.uhave.menorah) {
      real = CANDELABRUM_OF_INVOCATION;
    } else {
      return;
    }
    for (n = 0, obj = G.invent; obj; obj = obj.nobj) {
      if (obj.otyp === real || obj.otyp === fake && !mtmp.iswiz) {
        ++n, otmp = obj;
      }
    }
    if (n > 1) {
      n = rnd(n);
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if ((otmp.otyp === real || otmp.otyp === fake && !mtmp.iswiz) && !--n) {
          break;
        }
      }
    }
  }
  if (otmp) {
    if ((otmp === G.uarm || otmp === G.uarmu) && G.uarmc) {
      await remove_worn_item(G.uarmc, FALSE);
    }
    if (otmp === G.uarmu && G.uarm) {
      await remove_worn_item(G.uarm, FALSE);
    }
    if ((otmp === G.uarmg || (otmp === G.uright || otmp === G.uleft) && G.uarmg) && G.uwep) {
      if (G.u.twoweap) {
        await remove_worn_item(G.uswapwep, FALSE);
      }
      await remove_worn_item(G.uwep, FALSE);
    }
    if ((otmp === G.uright || otmp === G.uleft) && G.uarmg) {
      await remove_worn_item(G.uarmg, FALSE);
    }
    if (otmp.owornmask) {
      await remove_worn_item(otmp, TRUE);
    }
    if (otmp.unpaid) {
      await subfrombill(otmp, await shop_keeper($rd(P(G.u.ushops))));
    }
    await freeinv(otmp);
    strcpy(P(buf), await doname(otmp));
    await mpickobj(mtmp, otmp);
    await pline(S("%s steals %s!"), await Monnam(mtmp), P(buf));
    if ((mtmp.data.mflags1 & 33554432) >>> 0 !== 0 && !await tele_restrict(mtmp)) {
      await rloc(mtmp, TRUE);
    }
  }
}

export async function maybe_absorb_item(mon: struct_monst | null, obj: struct_obj | null, ochance: number, achance: number): Promise<void> {
  if (obj === G.uball || obj === G.uchain || obj.oclass === ROCK_CLASS || obj_resists(obj, 100 - ochance, 100 - achance) || !await touch_artifact(obj, mon)) {
    return;
  }
  if (obj.where === 3) {
    if (obj.owornmask) {
      await remove_worn_item(obj, TRUE);
    }
    if (obj.unpaid) {
      await subfrombill(obj, await shop_keeper($rd(P(G.u.ushops))));
    }
    if ($rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2) {
      let MonName = await Monnam(mon);
      if (!strcmp(MonName, S("It"))) {
        MonName = S("Something");
      }
      await pline(S("%s pulls %s away from you and absorbs %s!"), MonName, await yname(obj), obj.quan > 1 ? S("them") : S("it"));
    } else {
      let hand_s = body_part(HAND);
      if ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0) {
        hand_s = await makeplural(hand_s);
      }
      await pline(S("%s %s pulled from your %s!"), upstart(await yname(obj)), otense(obj, S("are")), hand_s);
    }
    await freeinv(obj);
  } else {
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      await pline(S("%s absorbs %s!"), await Monnam(mon), await yname(obj));
    }
  }
  await mpickobj(mon, obj);
}

export async function mdrop_obj(mon: struct_monst | null, obj: struct_obj | null, verbosely: number): Promise<void> {
  let omx = mon.mx;
  let omy = mon.my;
  let update_mon = FALSE;
  if (obj.owornmask) {
    if (!(mon.mhp < 1)) {
      mon.misc_worn_check = mon.misc_worn_check & ~obj.owornmask;
      update_mon = TRUE;
    } else if (mon.mtame && (obj.owornmask & W_SADDLE) !== 0 && !obj.unpaid && await costly_spot(omx, omy) && strchr(in_rooms(G.u.ux, G.u.uy, SHOPBASE), $at2(G.level.locations, omx, omy).roomno | 0)) {
      obj.no_charge = 1;
    }
    if (obj.owornmask & W_WEP) {
      await setmnotwielded(mon, obj);
    }
    obj.owornmask = 0;
  }
  if (verbosely && $rd(G.viz_array.a[G.viz_array.o + omy], omx) & 2) {
    await pline(S("%s drops %s."), await Monnam(mon), await distant_name(obj, doname));
  }
  if (!await flooreffects(obj, omx, omy, S("fall"))) {
    await place_object(obj, omx, omy);
    await stackobj(obj);
  }
  if (update_mon) {
    await update_mon_intrinsics(mon, obj, FALSE, TRUE);
  }
}

export async function mdrop_special_objs(mon: struct_monst | null): Promise<void> {
  let obj = null;
  let otmp = null;
  for (obj = mon.minvent; obj; obj = otmp) {
    otmp = obj.nobj;
    if (obj_resists(obj, 0, 0) || is_quest_artifact(obj)) {
      await obj_extract_self(obj);
      if (mon.mx) {
        await mdrop_obj(mon, obj, FALSE);
      } else {
        if (obj.owornmask) {
          mon.misc_worn_check = mon.misc_worn_check & ~obj.owornmask;
          if (obj.owornmask & W_WEP) {
            await setmnotwielded(mon, obj);
          }
          obj.owornmask = 0;
        }
        await rloco(obj);
      }
    }
  }
}

export async function relobj(mtmp: struct_monst | null, show: number, is_pet: number): Promise<void> {
  let otmp = null;
  let omx = mtmp.mx;
  let omy = mtmp.my;
  if (mtmp.isgd | 0 && !!(otmp = findgold(mtmp.minvent))) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
      await pline(S("%s gold %s."), s_suffix(await Monnam(mtmp)), (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? S("vanishes") : S("seems to vanish"));
    }
    await obj_extract_self(otmp);
    await obfree(otmp, null);
  }
  while (!!(otmp = is_pet ? await droppables(mtmp) : mtmp.minvent)) {
    await obj_extract_self(otmp);
    await mdrop_obj(mtmp, otmp, is_pet && G.flags.verbose ? 1 : 0);
  }
  if (show && $rd(G.viz_array.a[G.viz_array.o + omy], omx) & 2) {
    await newsym(omx, omy);
  }
}

export function $init(): void {
  G.stealoid = 0;
  G.stealmid = 0;
  steal$how = [S("steal"),
S("snatch"),
S("grab"),
S("take")];
}
