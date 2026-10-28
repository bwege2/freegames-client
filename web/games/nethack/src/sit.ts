// @ts-nocheck
// NetHack 3.6.7 sit.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { spec_ability } from './artifact.ts';
import { adjattrib, change_luck, exercise } from './attrib.ts';
import { is_ice, is_lava, is_pool } from './dbridge.ts';
import { do_mapping } from './detect.ts';
import { newsym, see_monsters, shieldeff } from './display.ts';
import { dropy, heal_legs } from './do.ts';
import { Monnam, hcolor, hliquid, mon_nam } from './do_name.ts';
import { on_level } from './dungeon.ts';
import { morehungry } from './eat.ts';
import { can_reach_floor, surface } from './engrave.ts';
import { losehp, money_cnt } from './hack.ts';
import { delobj, identify_pack, stackobj, update_inventory } from './invent.ts';
import { makemon } from './makemon.ts';
import { curse, mksobj, set_corpsenm, unbless, weight } from './mkobj.ts';
import { courtmon } from './mkroom.ts';
import { egg_type_from_parent } from './mon.ts';
import { pronoun_gender, sticks } from './mondata.ts';
import { Tobjnam, Yobjnam2, the, xname } from './objnam.ts';
import { There, You, You_cant, You_feel, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part } from './polyself.ts';
import { make_blinded, make_confused, make_sick } from './potion.ts';
import { altar_wrath } from './pray.ts';
import { do_genocide } from './read.ts';
import { d, rn2, rnd } from './rnd.ts';
import { remove_worn_item } from './steal.ts';
import { tele } from './teleport.ts';
import { burn_away_slime } from './timeout.ts';
import { dotrap, t_at, uescaped_shaft, uteetering_at_seen_pit, water_damage } from './trap.ts';
import { aggravate } from './wizard.ts';
import { which_armor } from './worn.ts';
import { makewish } from './zap.ts';
import { $at2, $cs, $sat, G, P, S } from './rt/index.ts';
import { AGGRAVATE_MONSTER, ALTAR, ANTIMAGIC, ART_MAGICBANE, A_CON, A_MAX, A_STR, A_WIS, BLINDED, CLOTH, COIN_CLASS, COLD_RES, CONFUSION, DRAWBRIDGE_DOWN, EGG, FALSE, FAST, FIRE_RES, FOOT, FROMOUTSIDE, GRAVE, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, INTRINSIC, INVIS, KILLED_BY, KILLED_BY_AN, LADDER, LEVITATION, NO_MM_FLAGS, PM_ELECTRIC_EEL, PM_GIANT_EEL, PM_TRAPPER, POISON_RES, PROTECTION, ROOM, SEE_INVIS, SHOCK_RES, SICK_ALL, SINK, SLIMED, SPFX_INTEL, SPIKED_PIT, STAIRS, STEALTH, S_DRAGON, S_EEL, S_altar, S_grave, S_ice, S_sink, S_throne, TELEPAT, TELEPORT, THRONE, TIMEOUT, TRUE, TT_BEARTRAP, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_PIT, TT_WEB, VIASITTING, WATER_WALKING_BOOTS, W_SADDLE } from './consts.ts';

let dosit$sit_message: any;
let rndcurse$mal_aura: any;

export async function take_gold(): Promise<void> {
  let otmp = null;
  let nobj = null;
  let lost_money = 0;
  for (otmp = G.invent; otmp; otmp = nobj) {
    nobj = otmp.nobj;
    if (otmp.oclass === COIN_CLASS) {
      lost_money = 1;
      await remove_worn_item(otmp, FALSE);
      await delobj(otmp);
    }
  }
  if (!lost_money) {
    await You_feel(S("a strange sensation."));
  } else {
    await You(S("notice you have no money!"));
    G.context.botl = 1;
  }
}

export async function dosit(): Promise<number> {
  let $t1: any;
  let $g = 0;
  let trap = null;
  let typ = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      trap = t_at(G.u.ux, G.u.uy);
      typ = $at2(G.level.locations, G.u.ux, G.u.uy).typ;
      if (G.u.usteed) {
        await You(S("are already sitting on %s."), await mon_nam(G.u.usteed));
        return 0;
      }
      if (G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 256) >>> 0 !== 0 && G.u.umonnum !== PM_TRAPPER) {
        G.u.uundetected = 0;
      }
      if (!can_reach_floor(FALSE)) {
        if (G.u.uswallow) {
          await There(S("are no seats in here!"));
        } else if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          await You(S("tumble in place."));
        } else {
          await You(S("are sitting on air."));
        }
        return 0;
      } else if (G.u.ustuck && !sticks(G.youmonst.data)) {
        if ((G.u.ustuck.data.mflags1 & 131072) >>> 0 !== 0) {
          await pline(S("%s won't offer %s lap."), await Monnam(G.u.ustuck), G.genders[pronoun_gender(G.u.ustuck, 0)].his);
        } else {
          await pline(S("%s has no lap."), await Monnam(G.u.ustuck));
        }
        return 0;
      } else if (is_pool(G.u.ux, G.u.uy) && !G.u.uinwater) {
        { $g = 1; continue $L; }
      }
      if (!(!!G.level.objects[G.u.ux][G.u.uy] && !(uteetering_at_seen_pit(trap) || uescaped_shaft(trap)))) { $g = 3; continue $L; }
      {
        let obj = null;
        obj = G.level.objects[G.u.ux][G.u.uy];
        if (G.youmonst.data.mlet === S_DRAGON && obj.oclass === COIN_CLASS) {
          await You(S("coil up around your %shoard."), obj.quan + money_cnt(G.invent) < G.u.ulevel * 1000 ? S("meager ") : S(""));
        } else {
          await You(S("sit on %s."), await the(await xname(obj)));
          if (!(obj.otyp === 189 || obj.otyp === 190 || (G.objects[obj.otyp].oc_material | 0) === CLOTH)) {
            await pline(S("It's not very comfortable..."));
          }
        }
      }
      { $g = 2; continue $L; }
    case 3:
      if (!(!!trap || G.u.utrap && G.u.utraptype >= TT_LAVA)) { $g = 5; continue $L; }
      {
        if (G.u.utrap) {
          await exercise(A_WIS, FALSE);
          if (G.u.utraptype === TT_BEARTRAP) {
            await You_cant(S("sit down with your %s in the bear trap."), body_part(FOOT));
            G.u.utrap = G.u.utrap + 1 >>> 0;
          } else if (G.u.utraptype === TT_PIT) {
            if (trap && (trap.ttyp | 0) === SPIKED_PIT) {
              await You(S("sit down on a spike.  Ouch!"));
              await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? rn2(2) : 1, S("sitting on an iron spike"), KILLED_BY);
              await exercise(A_STR, FALSE);
            } else {
              await You(S("sit down in the pit."));
            }
            G.u.utrap = G.u.utrap + (rn2(5) >>> 0) >>> 0;
          } else if (G.u.utraptype === TT_WEB) {
            await You(S("sit in the spider web and get entangled further!"));
            G.u.utrap = G.u.utrap + (rn2(10) + 5 >>> 0) >>> 0;
          } else if (G.u.utraptype === TT_LAVA) {
            await You(S("sit in the %s!"), hliquid(S("lava")));
            if (G.u.uprops[SLIMED].intrinsic) {
              await burn_away_slime();
            }
            G.u.utrap = G.u.utrap + (rnd(4) >>> 0) >>> 0;
            await losehp(d(2, 10), S("sitting in lava"), KILLED_BY);
          } else if (G.u.utraptype === TT_INFLOOR || G.u.utraptype === TT_BURIEDBALL) {
            await You_cant(S("maneuver to sit!"));
            G.u.utrap = G.u.utrap + 1 >>> 0;
          }
        } else {
          await You(S("sit down."));
          await dotrap(trap, VIASITTING);
        }
      }
      { $g = 4; continue $L; }
    case 5:
      if (!((G.u.uinwater | 0 || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.youmonst.data.mlet === S_EEL && (G.youmonst.data.mflags1 & 2) >>> 0 !== 0))) { $g = 7; continue $L; }
      {
        if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) {
          await There(S("are no cushions floating nearby."));
        } else {
          await You(S("sit down on the muddy bottom."));
        }
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(is_pool(G.u.ux, G.u.uy) && !((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.youmonst.data.mlet === S_EEL && (G.youmonst.data.mflags1 & 2) >>> 0 !== 0))) { $g = 9; continue $L; }
    case 1: // in_water
      await You(S("sit in the %s."), hliquid(S("water")));
      if (!rn2(10) && G.uarm) {
        await water_damage(G.uarm, S("armor"), TRUE);
      }
      if (!rn2(10) && G.uarmf && G.uarmf.otyp !== WATER_WALKING_BOOTS) {
        await water_damage(G.uarm, S("armor"), TRUE);
      }
      { $g = 8; continue $L; }
    case 9:
      if (typ === SINK) {
        await You(P(dosit$sit_message), G.defsyms[S_sink].explanation);
        await Your(S("%s gets wet."), (G.youmonst.data.mflags1 & 131072) >>> 0 !== 0 ? S("rump") : S("underside"));
      } else if (typ === ALTAR) {
        await You(P(dosit$sit_message), G.defsyms[S_altar].explanation);
        await altar_wrath(G.u.ux, G.u.uy);
      } else if (typ === GRAVE) {
        await You(P(dosit$sit_message), G.defsyms[S_grave].explanation);
      } else if (typ === STAIRS) {
        await You(P(dosit$sit_message), S("stairs"));
      } else if (typ === LADDER) {
        await You(P(dosit$sit_message), S("ladder"));
      } else if (is_lava(G.u.ux, G.u.uy)) {
        await You(P(dosit$sit_message), hliquid(S("lava")));
        await burn_away_slime();
        if (G.youmonst.data === $sat(G.mons, 152) || G.youmonst.data === $sat(G.mons, 326)) {
          await pline_The(S("%s feels warm."), hliquid(S("lava")));
          return 1;
        }
        await pline_The(S("%s burns you!"), hliquid(S("lava")));
        await losehp(d(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic ? 2 : 10, 10), S("sitting on lava"), KILLED_BY);
      } else if (is_ice(G.u.ux, G.u.uy)) {
        await You(P(dosit$sit_message), G.defsyms[S_ice].explanation);
        if (!(G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic)) {
          await pline_The(S("ice feels cold."));
        }
      } else if (typ === DRAWBRIDGE_DOWN) {
        await You(P(dosit$sit_message), S("drawbridge"));
      } else if (typ === THRONE) {
        await You(P(dosit$sit_message), G.defsyms[S_throne].explanation);
        if (rnd(6) > 4) {
          switch (rnd(13)) {
          case 1:
            await adjattrib(rn2(A_MAX), -(rn2(4) + 3), FALSE);
            await losehp(rnd(10), S("cursed throne"), KILLED_BY_AN);
            break;
          case 2:
            await adjattrib(rn2(A_MAX), 1, FALSE);
            break;
          case 3:
            await pline(S("A%s electric shock shoots through your body!"), G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic ? S("n") : S(" massive"));
            await losehp(G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic ? rnd(6) : rnd(30), S("electric chair"), KILLED_BY_AN);
            await exercise(A_CON, FALSE);
            break;
          case 4:
            await You_feel(S("much, much better!"));
            if (G.u.umonnum !== G.u.umonster) {
              if (G.u.mh >= G.u.mhmax - 5) {
                G.u.mhmax += 4;
              }
              G.u.mh = G.u.mhmax;
            }
            if (G.u.uhp >= G.u.uhpmax - 5) {
              G.u.uhpmax += 4;
            }
            G.u.uhp = G.u.uhpmax;
            G.u.ucreamed = 0;
            await make_blinded(0, TRUE);
            await make_sick(0, null, FALSE, SICK_ALL);
            await heal_legs(0);
            G.context.botl = 1;
            break;
          case 5:
            await take_gold();
            break;
          case 6:
            if (G.u.uluck + rn2(5) < 0) {
              await You_feel(S("your luck is changing."));
              change_luck(1);
            } else {
              await makewish();
            }
            break;
          case 7:
            {
              let cnt = rnd(10);
              await pline(S("A voice echoes:"));
              await verbalize(S("Thy audience hath been summoned, %s!"), G.flags.female ? S("Dame") : S("Sire"));
              while (cnt--) {
                await makemon(await courtmon(), G.u.ux, G.u.uy, NO_MM_FLAGS);
              }
              break;
            }
          case 8:
            await pline(S("A voice echoes:"));
            await verbalize(S("By thine Imperious order, %s..."), G.flags.female ? S("Dame") : S("Sire"));
            await do_genocide(5);
            break;
          case 9:
            await pline(S("A voice echoes:"));
            await verbalize(S("A curse upon thee for sitting upon this most holy throne!"));
            if (G.u.uluck + G.u.moreluck > 0) {
              await make_blinded(G.u.uprops[BLINDED].intrinsic + (rn2(100) + 250), TRUE);
              change_luck(G.u.uluck + G.u.moreluck > 1 ? -rnd(2) : -1);
            } else {
              await rndcurse();
            }
            break;
          case 10:
            if (G.u.uluck + G.u.moreluck < 0 || G.u.uprops[SEE_INVIS].intrinsic & INTRINSIC) {
              if (G.level.flags.nommap) {
                await pline(S("A terrible drone fills your head!"));
                await make_confused((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) + rnd(30), FALSE);
              } else {
                await pline(S("An image forms in your mind."));
                await do_mapping();
              }
            } else {
              await Your(S("vision becomes clear."));
              ($t1 = G.u.uprops[SEE_INVIS], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
              await newsym(G.u.ux, G.u.uy);
            }
            break;
          case 11:
            if (G.u.uluck + G.u.moreluck < 0) {
              await You_feel(S("threatened."));
              await aggravate();
            } else {
              await You_feel(S("a wrenching sensation."));
              await tele();
            }
            break;
          case 12:
            await You(S("are granted an insight!"));
            if (G.invent) {
              await identify_pack(rn2(5), FALSE);
            }
            break;
          case 13:
            await Your(S("mind turns into a pretzel!"));
            await make_confused((G.u.uprops[CONFUSION].intrinsic & TIMEOUT) + (rn2(7) + 16), FALSE);
            break;
          default:
            await impossible(S("throne effect"));
            break;
          }
        } else {
          if ((G.youmonst.data.mflags2 & 2048) >>> 0 !== 0) {
            await You_feel(S("very comfortable here."));
          } else {
            await You_feel(S("somehow out of place..."));
          }
        }
        if (!rn2(3) && $at2(G.level.locations, G.u.ux, G.u.uy).typ === THRONE) {
          $at2(G.level.locations, G.u.ux, G.u.uy).typ = ROOM, $at2(G.level.locations, G.u.ux, G.u.uy).flags = 0;
          await pline_The(S("throne vanishes in a puff of logic."));
          await newsym(G.u.ux, G.u.uy);
        }
      } else if ((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0) {
        let uegg = null;
        if (!G.flags.female) {
          await pline(S("%s can't lay eggs!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("You may think you are a platypus, but a male still") : S("Males"));
          return 0;
        } else if (G.u.uhunger < G.objects[EGG].oc_nutrition) {
          await You(S("don't have enough energy to lay an egg."));
          return 0;
        } else if ((G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.youmonst.data.mlet === S_EEL && (G.youmonst.data.mflags1 & 2) >>> 0 !== 0) {
          if (!(G.u.uinwater | 0 || (G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
            await pline(S("A splash tetra you are not."));
            return 0;
          }
          if (G.u.umonnum !== G.u.umonster && (G.youmonst.data === $sat(G.mons, PM_GIANT_EEL) || G.youmonst.data === $sat(G.mons, PM_ELECTRIC_EEL))) {
            await You(S("yearn for the Sargasso Sea."));
            return 0;
          }
        }
        uegg = await mksobj(EGG, FALSE, FALSE);
        uegg.spe = 1;
        uegg.quan = 1;
        uegg.owt = await weight(uegg) >>> 0;
        await set_corpsenm(uegg, egg_type_from_parent(G.u.umonnum, FALSE));
        uegg.known = (uegg.dknown = 1) & 1;
        await You(S("%s an egg."), (G.youmonst.data.mflags1 & 4194304) >>> 0 !== 0 && G.youmonst.data.mlet === S_EEL && (G.youmonst.data.mflags1 & 2) >>> 0 !== 0 ? S("spawn") : S("lay"));
        await dropy(uegg);
        await stackobj(uegg);
        await morehungry(G.objects[EGG].oc_nutrition);
      } else {
        await pline(S("Having fun sitting on the %s?"), surface(G.u.ux, G.u.uy));
      }
    case 8:
    case 6:
    case 4:
    case 2:
      return 1;
    }
    break;
  }
}

export async function rndcurse(): Promise<void> {
  let nobj = 0;
  let cnt = 0;
  let onum = 0;
  let otmp = null;
  if (G.uwep && G.uwep.oartifact === ART_MAGICBANE && rn2(20)) {
    await You(P(rndcurse$mal_aura), S("the magic-absorbing blade"));
    return;
  }
  if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
    await shieldeff(G.u.ux, G.u.uy);
    await You(P(rndcurse$mal_aura), S("you"));
  }
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.oclass === COIN_CLASS) {
      continue;
    }
    ++nobj;
  }
  if (nobj) {
    for (cnt = rnd(6 / ((!!(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) ? 1 : 0) + (!!(G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) ? 1 : 0) + 1) | 0); cnt > 0; --cnt) {
      onum = rnd(nobj);
      for (otmp = G.invent; otmp; otmp = otmp.nobj) {
        if (otmp.oclass === COIN_CLASS) {
          continue;
        }
        if (--onum === 0) {
          break;
        }
      }
      if (!otmp || otmp.cursed | 0) {
        continue;
      }
      if (otmp.oartifact && spec_ability(otmp, SPFX_INTEL) && rn2(10) < 8) {
        await pline(S("%s!"), await Tobjnam(otmp, S("resist")));
        continue;
      }
      if (otmp.blessed) {
        await unbless(otmp);
      } else {
        await curse(otmp);
      }
    }
    update_inventory();
  }
  if (G.u.usteed && !rn2(4) && !!(otmp = await which_armor(G.u.usteed, W_SADDLE)) && !otmp.cursed) {
    if (otmp.blessed) {
      await unbless(otmp);
    } else {
      await curse(otmp);
    }
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s %s."), await Yobjnam2(otmp, S("glow")), hcolor(otmp.cursed | 0 ? G.c_color_names.c_black : S("brown")));
      otmp.bknown = 1;
    }
  }
}

export async function attrcurse(): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any;
  switch (rnd(11)) {
  case 1:
    if (G.u.uprops[FIRE_RES].intrinsic & INTRINSIC) {
      ($t1 = G.u.uprops[FIRE_RES], $t1.intrinsic = $t1.intrinsic & ~INTRINSIC);
      await You_feel(S("warmer."));
      break;
    }
  case 2:
    if (G.u.uprops[TELEPORT].intrinsic & INTRINSIC) {
      ($t2 = G.u.uprops[TELEPORT], $t2.intrinsic = $t2.intrinsic & ~INTRINSIC);
      await You_feel(S("less jumpy."));
      break;
    }
  case 3:
    if (G.u.uprops[POISON_RES].intrinsic & INTRINSIC) {
      ($t3 = G.u.uprops[POISON_RES], $t3.intrinsic = $t3.intrinsic & ~INTRINSIC);
      await You_feel(S("a little sick!"));
      break;
    }
  case 4:
    if (G.u.uprops[TELEPAT].intrinsic & INTRINSIC) {
      ($t4 = G.u.uprops[TELEPAT], $t4.intrinsic = $t4.intrinsic & ~INTRINSIC);
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && !(G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic)) {
        await see_monsters();
      }
      await Your(S("senses fail!"));
      break;
    }
  case 5:
    if (G.u.uprops[COLD_RES].intrinsic & INTRINSIC) {
      ($t5 = G.u.uprops[COLD_RES], $t5.intrinsic = $t5.intrinsic & ~INTRINSIC);
      await You_feel(S("cooler."));
      break;
    }
  case 6:
    if (G.u.uprops[INVIS].intrinsic & INTRINSIC) {
      ($t6 = G.u.uprops[INVIS], $t6.intrinsic = $t6.intrinsic & ~INTRINSIC);
      await You_feel(S("paranoid."));
      break;
    }
  case 7:
    if (G.u.uprops[SEE_INVIS].intrinsic & INTRINSIC) {
      ($t7 = G.u.uprops[SEE_INVIS], $t7.intrinsic = $t7.intrinsic & ~INTRINSIC);
      await You(S("%s!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("tawt you taw a puttie tat") : S("thought you saw something"));
      break;
    }
  case 8:
    if (G.u.uprops[FAST].intrinsic & INTRINSIC) {
      ($t8 = G.u.uprops[FAST], $t8.intrinsic = $t8.intrinsic & ~INTRINSIC);
      await You_feel(S("slower."));
      break;
    }
  case 9:
    if (G.u.uprops[STEALTH].intrinsic & INTRINSIC) {
      ($t9 = G.u.uprops[STEALTH], $t9.intrinsic = $t9.intrinsic & ~INTRINSIC);
      await You_feel(S("clumsy."));
      break;
    }
  case 10:
    if (G.u.uprops[PROTECTION].intrinsic & INTRINSIC) {
      ($t10 = G.u.uprops[PROTECTION], $t10.intrinsic = $t10.intrinsic & ~INTRINSIC);
      await You_feel(S("vulnerable."));
      break;
    }
  case 11:
    if (G.u.uprops[AGGRAVATE_MONSTER].intrinsic & INTRINSIC) {
      ($t11 = G.u.uprops[AGGRAVATE_MONSTER], $t11.intrinsic = $t11.intrinsic & ~INTRINSIC);
      await You_feel(S("less attractive."));
      break;
    }
  default:
    break;
  }
}

export function $init(): void {
  dosit$sit_message = $cs("sit on the %s.", 15);
  rndcurse$mal_aura = $cs("feel a malignant aura surround %s.", 35);
}
