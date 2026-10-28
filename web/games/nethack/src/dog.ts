// @ts-nocheck
// NetHack 3.6.7 dog.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { m_unleash } from './apply.ts';
import { acurr } from './attrib.ts';
import { is_pool } from './dbridge.ts';
import { newsym } from './display.ts';
import { Monnam, christen_monst } from './do_name.ts';
import { dog_eat, finish_meating } from './dogmove.ts';
import { deliver_obj_to_mon } from './dokick.ts';
import { In_W_tower, depth, ledger_no, ledger_to_dlev, ledger_to_dnum } from './dungeon.ts';
import { panic } from './end.ts';
import { in_rooms } from './hack.ts';
import { dist2, night, s_suffix } from './hacklib.ts';
import { makemon, mbirth_limit, newmextra, rndmonst, set_malign } from './makemon.ts';
import { expels } from './mhitu.ts';
import { mksobj, peek_at_iced_corpse_age, place_object } from './mkobj.ts';
import { somexy } from './mkroom.ts';
import { m_into_limbo, minliquid, mnearto, mnexto, monnear, relmon, unstuck } from './mon.ts';
import { attacktype, levl_follower, mon_hates_silver, same_race, sticks } from './mondata.ts';
import { Tobjnam, the, xname } from './objnam.ts';
import { There, You, impossible, pline, pline_The } from './pline.ts';
import { body_part } from './polyself.ts';
import { is_quest_artifact } from './questpgr.ts';
import { rn2 } from './rnd.ts';
import { make_happy_shoppers, picked_container, set_residency } from './shk.ts';
import { growl, yelp } from './sounds.ts';
import { mdrop_special_objs } from './steal.ts';
import { dismount_steed, place_monster, put_saddle_on_mon } from './steed.ts';
import { rloc, rloc_to } from './teleport.ts';
import { mintrap } from './trap.ts';
import { mon_wield_item } from './weapon.ts';
import { mon_has_amulet } from './wizard.ts';
import { count_wsegs, get_wormno, initworm, worm_known, wormgone } from './worm.ts';
import { obj_resists } from './zap.ts';
import { struct_d_level, struct_edog, struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $rd, $sat, $wr, G, P, S, free, memset } from './rt/index.ts';
import { ACCFOOD, AGGRAVATE_MONSTER, AMULET_OF_STRANGULATION, APPORT, AT_WEAP, A_CHA, BALL_CLASS, BLINDED, CADAVER, CHAIN_CLASS, CONFLICT, CORPSE, DETECT_MONSTERS, DF_ALL, DISMOUNT_GENERIC, DISMOUNT_THROWN, DOGFOOD, EGG, EYE, FALSE, FOOD_CLASS, FULL_MOON, G_EXTINCT, INFRAVISION, IRON, LARGEST_INT, LOW_PM, M3_WANTSARTI, MAGIC_PORTAL, MANFOOD, MAXMONNO, MIGR_EXACT_XY, MIGR_LEFTOVERS, MITHRIL, MM_EDOG, MM_IGNOREWATER, NEED_HTH_WEAPON, NON_PM, NO_MINVENT, PM_GELATINOUS_CUBE, PM_GHOUL, PM_GREEN_SLIME, PM_KITTEN, PM_LICHEN, PM_LITTLE_DOG, PM_LIZARD, PM_LONG_WORM, PM_MEDUSA, PM_PONY, PM_RUST_MONSTER, POISON, RIN_SLOW_DIGESTION, ROCK_CLASS, ROOMOFFSET, SADDLE, SEE_INVIS, SILVER, SLIME_MOLD, STRAT_ARRIVE, STRAT_WAITFORU, S_BLOB, S_DOG, S_ELEMENTAL, S_FUNGUS, S_GHOST, S_GOLEM, S_JELLY, S_KOBOLD, S_LIGHT, S_OGRE, S_ORC, S_VORTEX, S_YETI, TABU, TELEPAT, TIN, TRUE, UNDEF, WARN_OF_MON, WOOD } from './consts.ts';

let makedog$petname_used: number;

export async function newedog(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mextra) {
    mtmp.mextra = await newmextra();
  }
  if (!mtmp.mextra.edog) {
    mtmp.mextra.edog = new struct_edog();
    memset(mtmp.mextra.edog, 0, 56);
  }
}

export function free_edog(mtmp: struct_monst | null): void {
  if (mtmp.mextra && mtmp.mextra.edog) {
    free(mtmp.mextra.edog);
    mtmp.mextra.edog = null;
  }
  mtmp.mtame = 0;
}

export function initedog(mtmp: struct_monst | null): void {
  mtmp.mtame = ((mtmp.data.mflags2 & 4194304) >>> 0 !== 0 ? 10 : 5) << 24 >> 24;
  mtmp.mpeaceful = 1;
  mtmp.mavenge = 0;
  set_malign(mtmp);
  mtmp.mleashed = 0;
  mtmp.meating = 0;
  mtmp.mextra.edog.droptime = 0;
  mtmp.mextra.edog.dropdist = 10000;
  mtmp.mextra.edog.apport = acurr(A_CHA);
  mtmp.mextra.edog.whistletime = 0;
  mtmp.mextra.edog.hungrytime = 1000 + G.monstermoves;
  mtmp.mextra.edog.ogoal.x = -1;
  mtmp.mextra.edog.ogoal.y = -1;
  mtmp.mextra.edog.abuse = 0;
  mtmp.mextra.edog.revivals = 0;
  mtmp.mextra.edog.mhpmax_penalty = 0;
  mtmp.mextra.edog.killed_by_u = 0;
}

function pet_type(): number {
  if (G.urole.petnum !== NON_PM) {
    return G.urole.petnum;
  } else if (G.preferred_pet === 99) {
    return PM_KITTEN;
  } else if (G.preferred_pet === 100) {
    return PM_LITTLE_DOG;
  } else {
    return rn2(2) ? PM_KITTEN : PM_LITTLE_DOG;
  }
}

export async function make_familiar(otmp: struct_obj | null, x: number, y: number, quietly: number): Promise<struct_monst | null> {
  let pm = null;
  let mtmp = null;
  let chance = 0;
  let trycnt = 100;
  do {
    if (otmp) {
      let mndx = otmp.corpsenm;
      pm = $sat(G.mons, mndx);
      if (G.mvitals[mndx].mvflags & G_EXTINCT && mbirth_limit(mndx) !== MAXMONNO) {
        if (!quietly) {
          await pline(S("... into a pile of dust."));
        }
        break;
      }
    } else if (!rn2(3)) {
      pm = $sat(G.mons, pet_type());
    } else {
      pm = await rndmonst();
      if (!pm) {
        if (!quietly) {
          await There(S("seems to be nothing available for a familiar."));
        }
        break;
      }
    }
    mtmp = await makemon(pm, x, y, MM_EDOG | MM_IGNOREWATER | NO_MINVENT);
    if (otmp && !mtmp) {
      if (!quietly) {
        await pline_The(S("figurine writhes and then shatters into pieces!"));
      }
      break;
    }
  } while (!mtmp && --trycnt > 0);
  if (!mtmp) {
    return null;
  }
  if (is_pool(mtmp.mx, mtmp.my) && await minliquid(mtmp)) {
    return null;
  }
  initedog(mtmp);
  mtmp.msleeping = 0;
  if (otmp) {
    chance = rn2(10);
    if (chance > 2) {
      chance = otmp.blessed | 0 ? 0 : !otmp.cursed ? 1 : 2;
    }
    if (chance > 0) {
      mtmp.mtame = 0;
      if (chance === 2) {
        if (!quietly) {
          await You(S("get a bad feeling about this."));
        }
        mtmp.mpeaceful = 0;
        set_malign(mtmp);
      }
    }
    if (otmp.oextra && otmp.oextra.oname) {
      mtmp = await christen_monst(mtmp, otmp.oextra.oname);
    }
  }
  set_malign(mtmp);
  await newsym(mtmp.mx, mtmp.my);
  if (mtmp.mtame && attacktype(mtmp.data, AT_WEAP)) {
    mtmp.weapon_check = NEED_HTH_WEAPON;
    await mon_wield_item(mtmp);
  }
  return mtmp;
}

export async function makedog(): Promise<struct_monst | null> {
  let mtmp = null;
  let otmp = null;
  let petname = null;
  let pettype = 0;
  if (G.preferred_pet === 110) {
    return null;
  }
  pettype = pet_type();
  if (pettype === PM_LITTLE_DOG) {
    petname = P(G.dogname);
  } else if (pettype === PM_PONY) {
    petname = P(G.horsename);
  } else {
    petname = P(G.catname);
  }
  if (!petname.a[petname.o] && pettype === PM_LITTLE_DOG) {
    if (G.urole.malenum === 330) {
      petname = S("Slasher");
    }
    if (G.urole.malenum === 339) {
      petname = S("Hachi");
    }
    if (G.urole.malenum === 329) {
      petname = S("Idefix");
    }
    if (G.urole.malenum === 337) {
      petname = S("Sirius");
    }
  }
  mtmp = await makemon($sat(G.mons, pettype), G.u.ux, G.u.uy, MM_EDOG);
  if (!mtmp) {
    return null;
  }
  G.context.startingpet_mid = mtmp.m_id;
  if (pettype === PM_PONY && !!(otmp = await mksobj(SADDLE, TRUE, FALSE))) {
    otmp.dknown = (otmp.bknown = (otmp.rknown = 1) & 1) & 1;
    await put_saddle_on_mon(otmp, mtmp);
  }
  if (!makedog$petname_used++ && petname.a[petname.o]) {
    mtmp = await christen_monst(mtmp, petname);
  }
  initedog(mtmp);
  return mtmp;
}

export function update_mlstmv(): void {
  let mon = null;
  for (mon = G.level.monlist; mon; mon = mon.nmon) {
    if (mon.mhp < 1) {
      continue;
    }
    mon.mlstmv = G.monstermoves;
  }
}

export async function losedogs(): Promise<void> {
  let mtmp = null;
  let mtmp0 = null;
  let mtmp2 = null;
  let dismissKops = 0;
  for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mux !== G.u.uz.dnum || mtmp.muy !== G.u.uz.dlevel) {
      continue;
    }
    if (mtmp.isshk) {
      if (mtmp.mextra.eshk.dismiss_kops) {
        if (dismissKops === 0) {
          dismissKops = 1;
        }
        mtmp.mextra.eshk.dismiss_kops = FALSE;
      } else if (!mtmp.mpeaceful) {
        dismissKops = -1;
      }
    }
  }
  for (mtmp = G.mydogs; mtmp && dismissKops >= 0; mtmp = mtmp.nmon) {
    if (mtmp.isshk) {
      if (!mtmp.mpeaceful) {
        dismissKops = -1;
      }
    }
  }
  if (dismissKops > 0) {
    await make_happy_shoppers(TRUE);
  }
  while (!!(mtmp = G.mydogs)) {
    G.mydogs = mtmp.nmon;
    await mon_arrive(mtmp, TRUE);
  }
  for (mtmp = G.migrating_mons; mtmp; mtmp = mtmp2) {
    mtmp2 = mtmp.nmon;
    if (mtmp.mux === G.u.uz.dnum && mtmp.muy === G.u.uz.dlevel) {
      if (mtmp === G.migrating_mons) {
        G.migrating_mons = mtmp.nmon;
      } else {
        for (mtmp0 = G.migrating_mons; mtmp0; mtmp0 = mtmp0.nmon) {
          if (mtmp0.nmon === mtmp) {
            mtmp0.nmon = mtmp.nmon;
            break;
          }
        }
        if (!mtmp0) {
          await panic(S("losedogs: can't find migrating mon"));
        }
      }
      await mon_arrive(mtmp, FALSE);
    }
  }
}

export async function mon_arrive(mtmp: struct_monst | null, with_you: number): Promise<void> {
  let t = null;
  let xlocale = 0;
  let ylocale = 0;
  let xyloc = 0;
  let xyflags = 0;
  let wander = 0;
  let num_segs = 0;
  let failed_to_place = FALSE;
  mtmp.nmon = G.level.monlist;
  G.level.monlist = mtmp;
  if (mtmp.isshk) {
    set_residency(mtmp, FALSE);
  }
  num_segs = mtmp.wormno | 0;
  if (mtmp.data === $sat(G.mons, PM_LONG_WORM)) {
    mtmp.wormno = (get_wormno() >>> 0) & 31;
    if (mtmp.wormno) {
      await initworm(mtmp, num_segs);
    }
  } else {
    mtmp.wormno = 0;
  }
  mtmp.mstrategy = (mtmp.mstrategy | STRAT_ARRIVE) >>> 0;
  mtmp.mux = G.u.ux, mtmp.muy = G.u.uy;
  xyloc = mtmp.mtrack[0].x;
  xyflags = mtmp.mtrack[0].y;
  xlocale = mtmp.mtrack[1].x;
  ylocale = mtmp.mtrack[1].y;
  memset(mtmp.mtrack[0], 0, 8);
  if (mtmp === G.u.usteed) {
    return;
  }
  if (with_you) {
    if (!!!G.level.monsters[G.u.ux][G.u.uy] && !rn2(mtmp.mtame ? 10 : mtmp.mpeaceful | 0 ? 5 : 2)) {
      await rloc_to(mtmp, G.u.ux, G.u.uy);
    } else {
      await mnexto(mtmp);
    }
    return;
  }
  if (mtmp.mlstmv < G.monstermoves - 1) {
    let nmv = G.monstermoves - 1 - mtmp.mlstmv;
    await mon_catchup_elapsed_time(mtmp, nmv);
    mtmp.mlstmv = G.monstermoves - 1;
    wander = (nmv < 8 ? nmv : 8) << 24 >> 24;
  } else {
    wander = 0;
  }
  switch (xyloc) {
  case 1:
    break;
  case 2:
    wander = 0;
    break;
  case 9:
    xlocale = G.u.ux, ylocale = G.u.uy;
    break;
  case 3:
    xlocale = G.upstair.sx, ylocale = G.upstair.sy;
    break;
  case 4:
    xlocale = G.dnstair.sx, ylocale = G.dnstair.sy;
    break;
  case 5:
    xlocale = G.upladder.sx, ylocale = G.upladder.sy;
    break;
  case 6:
    xlocale = G.dnladder.sx, ylocale = G.dnladder.sy;
    break;
  case 7:
    xlocale = G.sstairs.sx, ylocale = G.sstairs.sy;
    break;
  case 8:
    if (G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) {
      xlocale = rn2(G.updest.hx - G.updest.lx + 1) + G.updest.lx << 24 >> 24;
      ylocale = rn2(G.updest.hy - G.updest.ly + 1) + G.updest.ly << 24 >> 24;
      break;
    }
    for (t = G.ftrap; t; t = t.ntrap) {
      if ((t.ttyp | 0) === MAGIC_PORTAL) {
        break;
      }
    }
    if (t) {
      xlocale = t.tx, ylocale = t.ty;
      break;
    } else {
      await impossible(S("mon_arrive: no corresponding portal?"));
    }
  default:
  case 0:
    xlocale = ylocale = 0;
    break;
  }
  if ((mtmp.mspare1 & MIGR_LEFTOVERS) !== 0) {
    if (G.migrating_objs) {
      await deliver_obj_to_mon(mtmp, 0, DF_ALL);
    }
  }
  if (xlocale && wander) {
    let r = in_rooms(xlocale, ylocale, 0);
    if (r && r.a[r.o]) {
      let c = new struct_nhcoord();
      if (somexy($sat(G.rooms, r.a[r.o] - ROOMOFFSET), c)) {
        xlocale = c.x, ylocale = c.y;
      } else {
        xlocale = ylocale = 0;
      }
    } else {
      let i = 0;
      let j = 0;
      i = 1 > xlocale - wander ? 1 : xlocale - wander;
      j = 80 - 1 < xlocale + wander ? 80 - 1 : xlocale + wander;
      xlocale = rn2(j - i) + i << 24 >> 24;
      i = 0 > ylocale - wander ? 0 : ylocale - wander;
      j = 21 - 1 < ylocale + wander ? 21 - 1 : ylocale + wander;
      ylocale = rn2(j - i) + i << 24 >> 24;
    }
  }
  mtmp.mx = 0;
  mtmp.my = xyflags;
  if (xlocale) {
    failed_to_place = (!await mnearto(mtmp, xlocale, ylocale, FALSE) ? 1 : 0) << 24 >> 24;
  } else {
    failed_to_place = (!await rloc(mtmp, TRUE) ? 1 : 0) << 24 >> 24;
  }
  if (failed_to_place) {
    await m_into_limbo(mtmp);
  }
}

export async function mon_catchup_elapsed_time(mtmp: struct_monst | null, nmv: number): Promise<void> {
  let imv = 0;
  if (nmv < 0) {
    await panic(S("catchup from future time?"));
    return;
  } else if (nmv === 0) {
    await impossible(S("catchup from now?"));
  } else if (nmv >= LARGEST_INT) {
    imv = LARGEST_INT - 1;
  } else {
    imv = nmv | 0;
  }
  if (mtmp.mblinded) {
    if (imv >= (mtmp.mblinded | 0)) {
      mtmp.mblinded = 1;
    } else {
      mtmp.mblinded = ((mtmp.mblinded | 0) - imv >>> 0) & 127;
    }
  }
  if (mtmp.mfrozen) {
    if (imv >= (mtmp.mfrozen | 0)) {
      mtmp.mfrozen = 1;
    } else {
      mtmp.mfrozen = ((mtmp.mfrozen | 0) - imv >>> 0) & 127;
    }
  }
  if (mtmp.mfleetim) {
    if (imv >= (mtmp.mfleetim | 0)) {
      mtmp.mfleetim = 1;
    } else {
      mtmp.mfleetim = ((mtmp.mfleetim | 0) - imv >>> 0) & 127;
    }
  }
  if (mtmp.mtrapped | 0 && rn2(imv + 1) > (40 / 2 | 0)) {
    mtmp.mtrapped = 0;
  }
  if (mtmp.mconf | 0 && rn2(imv + 1) > (50 / 2 | 0)) {
    mtmp.mconf = 0;
  }
  if (mtmp.mstun | 0 && rn2(imv + 1) > (10 / 2 | 0)) {
    mtmp.mstun = 0;
  }
  if (imv > mtmp.meating) {
    await finish_meating(mtmp);
  } else {
    mtmp.meating -= imv;
  }
  if (imv > mtmp.mspec_used) {
    mtmp.mspec_used = 0;
  } else {
    mtmp.mspec_used -= imv;
  }
  if (mtmp.mtame) {
    let wilder = (imv + 75) / 150 | 0;
    if (mtmp.mtame > wilder) {
      mtmp.mtame = mtmp.mtame - wilder << 24 >> 24;
    } else if (mtmp.mtame > rn2(wilder)) {
      mtmp.mtame = 0;
    } else {
      mtmp.mtame = (mtmp.mpeaceful = 0) << 24 >> 24;
    }
  }
  if (mtmp.mtame && !mtmp.isminion && ((mtmp.data.mflags1 & 536870912) >>> 0 !== 0 || (mtmp.data.mflags1 & 1073741824) >>> 0 !== 0)) {
    let edog = mtmp.mextra.edog;
    if (G.monstermoves > edog.hungrytime + 500 && mtmp.mhp < 3 || G.monstermoves > edog.hungrytime + 750) {
      mtmp.mtame = (mtmp.mpeaceful = 0) << 24 >> 24;
    }
  }
  if (!mtmp.mtame && mtmp.mleashed | 0) {
    await impossible(S("catching up for leashed monster?"));
    await m_unleash(mtmp, FALSE);
  }
  if (!((mtmp.data.mflags1 & 8388608) >>> 0 !== 0)) {
    imv = imv / 20 | 0;
  }
  if (mtmp.mhp + imv >= mtmp.mhpmax) {
    mtmp.mhp = mtmp.mhpmax;
  } else {
    mtmp.mhp += imv;
  }
}

export async function keepdogs(pets_only: number): Promise<void> {
  let mtmp = null;
  let mtmp2 = null;
  let obj = null;
  let num_segs = 0;
  let stay_behind = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp2) {
    mtmp2 = mtmp.nmon;
    if (mtmp.mhp < 1) {
      continue;
    }
    if (pets_only) {
      if (!mtmp.mtame) {
        continue;
      }
      mtmp.mtrapped = 0;
      mtmp.meating = 0;
      mtmp.msleeping = 0;
      mtmp.mfrozen = 0;
      mtmp.mcanmove = 1;
    }
    if ((monnear(mtmp, G.u.ux, G.u.uy) && levl_follower(mtmp) || G.u.uhave.amulet | 0 && mtmp.iswiz | 0) && (!mtmp.msleeping && mtmp.mcanmove | 0 || mtmp === G.u.usteed) && !((mtmp.mstrategy & STRAT_WAITFORU) >>> 0)) {
      stay_behind = FALSE;
      if (mtmp.mtrapped) {
        await mintrap(mtmp);
      }
      if (mtmp === G.u.usteed) {
        mtmp.mtrapped = 0;
        mtmp.meating = 0;
        await mdrop_special_objs(mtmp);
      } else if (mtmp.meating || mtmp.mtrapped | 0) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s is still %s."), await Monnam(mtmp), mtmp.meating ? S("eating") : S("trapped"));
        }
        stay_behind = TRUE;
      } else if (mon_has_amulet(mtmp)) {
        if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
          await pline(S("%s seems very disoriented for a moment."), await Monnam(mtmp));
        }
        stay_behind = TRUE;
      }
      if (stay_behind) {
        if (mtmp.mleashed) {
          await pline(S("%s leash suddenly comes loose."), (mtmp.data.mflags1 & 131072) >>> 0 !== 0 ? mtmp.female | 0 ? S("Her") : S("His") : S("Its"));
          await m_unleash(mtmp, FALSE);
        }
        if (mtmp === G.u.usteed) {
          await impossible(S("steed left behind?"));
          await dismount_steed(DISMOUNT_GENERIC);
        }
        continue;
      }
      if (mtmp.isshk) {
        set_residency(mtmp, TRUE);
      }
      if (mtmp.wormno) {
        let cnt = 0;
        cnt = count_wsegs(mtmp);
        num_segs = cnt < 32 - 1 ? cnt : 32 - 1;
        await wormgone(mtmp);
        await place_monster(mtmp, mtmp.mx, mtmp.my);
      } else {
        num_segs = 0;
      }
      for (obj = mtmp.minvent; obj; obj = obj.nobj) {
        if (!!obj.cobj) {
          picked_container(obj);
        }
        obj.no_charge = 0;
      }
      await relmon(mtmp, P(G, "mydogs"));
      mtmp.mx = mtmp.my = 0;
      mtmp.wormno = (num_segs >>> 0) & 31;
      mtmp.mlstmv = G.monstermoves;
    } else if (mtmp.iswiz) {
      await migrate_to_level(mtmp, ledger_no(G.u.uz), MIGR_EXACT_XY, null);
    } else if (mtmp.mleashed) {
      await pline(S("%s leash goes slack."), s_suffix(await Monnam(mtmp)));
      await m_unleash(mtmp, FALSE);
    }
  }
}

export async function migrate_to_level(mtmp: struct_monst | null, tolev: number, xyloc: number, cc: struct_nhcoord | null): Promise<void> {
  let obj = null;
  let new_lev = new struct_d_level();
  let xyflags = 0;
  let num_segs = 0;
  if (mtmp.isshk) {
    set_residency(mtmp, TRUE);
  }
  if (mtmp.wormno) {
    let cnt = count_wsegs(mtmp);
    num_segs = cnt < 32 - 1 ? cnt : 32 - 1;
    await wormgone(mtmp);
  }
  for (obj = mtmp.minvent; obj; obj = obj.nobj) {
    if (!!obj.cobj) {
      picked_container(obj);
    }
    obj.no_charge = 0;
  }
  if (mtmp.mleashed) {
    mtmp.mtame = mtmp.mtame - 1 << 24 >> 24;
    await m_unleash(mtmp, TRUE);
  }
  await relmon(mtmp, P(G, "migrating_mons"));
  new_lev.dnum = await ledger_to_dnum(tolev);
  new_lev.dlevel = await ledger_to_dlev(tolev);
  xyflags = (depth(new_lev) < depth(G.u.uz) ? 1 : 0) << 24 >> 24;
  if (await In_W_tower(mtmp.mx, mtmp.my, G.u.uz)) {
    xyflags = (xyflags | 2) << 24 >> 24;
  }
  mtmp.wormno = (num_segs >>> 0) & 31;
  mtmp.mlstmv = G.monstermoves;
  mtmp.mtrack[1].x = (cc ? cc.x : mtmp.mx) << 24 >> 24;
  mtmp.mtrack[1].y = (cc ? cc.y : mtmp.my) << 24 >> 24;
  mtmp.mtrack[0].x = xyloc;
  mtmp.mtrack[0].y = xyflags;
  mtmp.mux = new_lev.dnum;
  mtmp.muy = new_lev.dlevel;
  mtmp.mx = mtmp.my = 0;
  if (mtmp === G.context.polearm.hitmon) {
    G.context.polearm.hitmon = null;
  }
}

export async function dogfood(mon: struct_monst | null, obj: struct_obj | null): Promise<number> {
  let mptr = mon.data;
  let fptr = null;
  let carni = ((mptr.mflags1 & 536870912) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let herbi = ((mptr.mflags1 & 1073741824) >>> 0 !== 0 ? 1 : 0) << 24 >> 24;
  let starving = 0;
  let mblind = 0;
  if (is_quest_artifact(obj) || obj_resists(obj, 0, 95)) {
    return obj.cursed | 0 ? TABU : APPORT;
  }
  switch (obj.oclass) {
  case FOOD_CLASS:
    if (obj.otyp === CORPSE || obj.otyp === TIN || obj.otyp === EGG) {
      fptr = $sat(G.mons, obj.corpsenm);
    }
    if (obj.otyp === CORPSE && (fptr === $sat(G.mons, 308) || fptr === $sat(G.mons, 310) || fptr === $sat(G.mons, 309))) {
      return TABU;
    }
    if ((obj.otyp === CORPSE || obj.otyp === EGG) && (fptr === $sat(G.mons, 10) || fptr === $sat(G.mons, 9)) && !(((mon.data.mresists | mon.mextrinsics) & 128) !== 0)) {
      return POISON;
    }
    if (!carni && !herbi) {
      return obj.cursed | 0 ? UNDEF : APPORT;
    }
    starving = (mon.mtame && !mon.isminion && mon.mextra.edog.mhpmax_penalty ? 1 : 0) << 24 >> 24;
    mblind = (!mon.mcansee && (mon.data.mflags1 & 4096) >>> 0 === 0 ? 1 : 0) << 24 >> 24;
    if (mptr === $sat(G.mons, PM_GHOUL)) {
      if (obj.otyp === CORPSE) {
        return await peek_at_iced_corpse_age(obj) + 50 <= G.monstermoves && fptr !== $sat(G.mons, PM_LIZARD) && fptr !== $sat(G.mons, PM_LICHEN) ? DOGFOOD : starving && !(fptr.mlet === S_BLOB || fptr.mlet === S_JELLY || fptr.mlet === S_FUNGUS || fptr.mlet === S_VORTEX || fptr.mlet === S_LIGHT || fptr.mlet === S_ELEMENTAL && fptr !== $sat(G.mons, 150) || fptr.mlet === S_GOLEM && fptr !== $sat(G.mons, 251) && fptr !== $sat(G.mons, 249) || fptr.mlet === S_GHOST) ? ACCFOOD : POISON;
      }
      if (obj.otyp === EGG) {
        return G.monstermoves - obj.age > 2 * 200 ? CADAVER : starving ? ACCFOOD : POISON;
      }
      return TABU;
    }
    switch (obj.otyp) {
    case 239:
    case 242:
    case 245:
    case 243:
    case 244:
      return carni ? DOGFOOD : MANFOOD;
    case 241:
      return carni ? CADAVER : MANFOOD;
    case 240:
      if (await peek_at_iced_corpse_age(obj) + 50 <= G.monstermoves && obj.corpsenm !== PM_LIZARD && obj.corpsenm !== PM_LICHEN && mptr.mlet !== S_FUNGUS || (fptr.mflags1 & 134217728) >>> 0 !== 0 && !(((mon.data.mresists | mon.mextrinsics) & 64) !== 0) || (fptr.mflags1 & 268435456) >>> 0 !== 0 && !(((mon.data.mresists | mon.mextrinsics) & 32) !== 0)) {
        return POISON;
      } else if (fptr === $sat(G.mons, PM_GREEN_SLIME) && !(mon.data === $sat(G.mons, 205) || (mon.data === $sat(G.mons, 110) || mon.data === $sat(G.mons, 30) || mon.data === $sat(G.mons, 152) || mon.data === $sat(G.mons, 326)) || mon.data.mlet === S_GHOST)) {
        return starving ? ACCFOOD : POISON;
      } else if (fptr.mlet === S_BLOB || fptr.mlet === S_JELLY || fptr.mlet === S_FUNGUS || fptr.mlet === S_VORTEX || fptr.mlet === S_LIGHT || fptr.mlet === S_ELEMENTAL && fptr !== $sat(G.mons, 150) || fptr.mlet === S_GOLEM && fptr !== $sat(G.mons, 251) && fptr !== $sat(G.mons, 249) || fptr.mlet === S_GHOST) {
        return herbi ? CADAVER : MANFOOD;
      } else if ((mptr.mflags1 & 131072) >>> 0 !== 0 && await same_race(mptr, fptr) && (!((mptr.mflags2 & 2) >>> 0 !== 0) && fptr.mlet !== S_KOBOLD && fptr.mlet !== S_ORC && fptr.mlet !== S_OGRE)) {
        return starving && carni && !((mptr.mflags2 & 16) >>> 0 !== 0) ? ACCFOOD : TABU;
      } else {
        return carni ? CADAVER : MANFOOD;
      }
    case 259:
      return (mptr.mflags2 & 2) >>> 0 !== 0 || (mon.cham === 222 || mon.cham === 223 || mon.cham === 224) ? TABU : herbi || starving ? ACCFOOD : MANFOOD;
    case 271:
      return (mptr.mflags1 & 2147483648) >>> 0 !== 0 ? ACCFOOD : MANFOOD;
    case 252:
      return herbi ? DOGFOOD : starving ? ACCFOOD : MANFOOD;
    case 257:
      return herbi || mblind ? DOGFOOD : starving ? ACCFOOD : MANFOOD;
    case 256:
      return mptr.mlet === S_YETI && herbi ? DOGFOOD : herbi || starving ? ACCFOOD : MANFOOD;
    default:
      if (starving) {
        return ACCFOOD;
      }
      return obj.otyp > SLIME_MOLD ? carni ? ACCFOOD : MANFOOD : herbi ? ACCFOOD : MANFOOD;
    }
  default:
    if (obj.otyp === AMULET_OF_STRANGULATION || obj.otyp === RIN_SLOW_DIGESTION) {
      return TABU;
    }
    if (mon_hates_silver(mon) && (G.objects[obj.otyp].oc_material | 0) === SILVER) {
      return TABU;
    }
    if (mptr === $sat(G.mons, PM_GELATINOUS_CUBE) && (G.objects[obj.otyp].oc_material | 0) <= WOOD) {
      return ACCFOOD;
    }
    if ((mptr.mflags1 & 2147483648) >>> 0 !== 0 && ((G.objects[obj.otyp].oc_material | 0) >= IRON && (G.objects[obj.otyp].oc_material | 0) <= MITHRIL) && ((G.objects[obj.otyp].oc_material | 0) === IRON || mptr !== $sat(G.mons, PM_RUST_MONSTER))) {
      return (G.objects[obj.otyp].oc_material | 0) === IRON && !obj.oerodeproof ? DOGFOOD : ACCFOOD;
    }
    if (!obj.cursed && obj.oclass !== BALL_CLASS && obj.oclass !== CHAIN_CLASS) {
      return APPORT;
    }
  case ROCK_CLASS:
    return UNDEF;
  }
}

export async function tamedog(mtmp: struct_monst | null, obj: struct_obj | null): Promise<number> {
  if (mtmp.iswiz | 0 || mtmp.data === $sat(G.mons, PM_MEDUSA) || mtmp.data.mflags3 & M3_WANTSARTI) {
    return FALSE;
  }
  mtmp.mpeaceful = 1;
  set_malign(mtmp);
  if (G.flags.moonphase === FULL_MOON && night() && rn2(6) && obj && mtmp.data.mlet === S_DOG) {
    return FALSE;
  }
  mtmp.mflee = 0;
  mtmp.mfleetim = 0;
  if (mtmp === G.u.ustuck) {
    if (G.u.uswallow) {
      await expels(mtmp, mtmp.data, TRUE);
    } else if (!(G.u.umonnum !== G.u.umonster && sticks(G.youmonst.data))) {
      await unstuck(mtmp);
    }
  }
  if (mtmp.mtame && obj) {
    let tasty = 0;
    if (mtmp.mcanmove | 0 && !mtmp.mconf && !mtmp.meating && ((tasty = await dogfood(mtmp, obj)) === DOGFOOD || tasty <= ACCFOOD && mtmp.mextra.edog.hungrytime <= G.monstermoves)) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        let big_corpse = (obj.otyp === CORPSE && obj.corpsenm >= LOW_PM && G.mons[obj.corpsenm].msize > mtmp.data.msize ? 1 : 0) << 24 >> 24;
        await pline(S("%s catches %s%s"), await Monnam(mtmp), await the(await xname(obj)), !big_corpse ? S(".") : S(", or vice versa!"));
      } else if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
        await pline(S("%s."), await Tobjnam(obj, S("stop")));
      }
      await place_object(obj, mtmp.mx, mtmp.my);
      await dog_eat(mtmp, obj, mtmp.mx, mtmp.my, FALSE);
      return TRUE;
    } else {
      return FALSE;
    }
  }
  if (mtmp.mtame || !mtmp.mcanmove || mtmp.isshk | 0 || mtmp.isgd | 0 || mtmp.ispriest | 0 || mtmp.isminion | 0 || mtmp.data.mflags3 & 31 || (mtmp.data.mflags2 & 8) >>> 0 !== 0 || (mtmp.data.mflags2 & 256) >>> 0 !== 0 && !((G.youmonst.data.mflags2 & 256) >>> 0 !== 0) || obj && await dogfood(mtmp, obj) >= MANFOOD) {
    return FALSE;
  }
  if (mtmp.m_id === G.quest_status.leader_m_id) {
    return FALSE;
  }
  await newedog(mtmp);
  initedog(mtmp);
  if (obj) {
    await place_object(obj, mtmp.mx, mtmp.my);
    if (await dog_eat(mtmp, obj, mtmp.mx, mtmp.my, TRUE) === 2) {
      return TRUE;
    }
  }
  await newsym(mtmp.mx, mtmp.my);
  if (attacktype(mtmp.data, AT_WEAP)) {
    mtmp.weapon_check = NEED_HTH_WEAPON;
    await mon_wield_item(mtmp);
  }
  return TRUE;
}

export async function wary_dog(mtmp: struct_monst | null, was_dead: number): Promise<void> {
  let edog = null;
  let quietly = was_dead;
  await finish_meating(mtmp);
  if (!mtmp.mtame) {
    return;
  }
  edog = !mtmp.isminion ? mtmp.mextra.edog : null;
  if (edog && edog.mhpmax_penalty) {
    mtmp.mhpmax += edog.mhpmax_penalty;
    mtmp.mhp += edog.mhpmax_penalty;
    edog.mhpmax_penalty = 0;
  }
  if (edog && ((edog.killed_by_u | 0) === 1 || edog.abuse > 2)) {
    mtmp.mpeaceful = ((mtmp.mtame = 0) >>> 0) & 1;
    if (edog.abuse >= 0 && edog.abuse < 10) {
      if (!rn2(edog.abuse + 1)) {
        mtmp.mpeaceful = 1;
      }
    }
    if (!quietly && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2) {
      if ((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
        if ((mtmp.data.mflags1 & 4096) >>> 0 === 0) {
          await pline(S("%s %s to look you in the %s."), await Monnam(mtmp), mtmp.mpeaceful | 0 ? S("seems unable") : S("refuses"), body_part(EYE));
        } else {
          await pline(S("%s avoids your gaze."), await Monnam(mtmp));
        }
      }
    }
  } else {
    mtmp.mtame = rn2(mtmp.mtame + 1) << 24 >> 24;
    if (!mtmp.mtame) {
      mtmp.mpeaceful = (rn2(2) >>> 0) & 1;
    }
  }
  if (!mtmp.mtame) {
    if (!quietly && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await pline(S("%s %s."), await Monnam(mtmp), mtmp.mpeaceful | 0 ? S("is no longer tame") : S("has become feral"));
    }
    await newsym(mtmp.mx, mtmp.my);
    if (mtmp.mleashed) {
      await m_unleash(mtmp, TRUE);
    }
    if (mtmp === G.u.usteed) {
      await dismount_steed(DISMOUNT_THROWN);
    }
  } else if (edog) {
    ++edog.revivals;
    edog.killed_by_u = 0;
    edog.abuse = 0;
    edog.ogoal.x = edog.ogoal.y = -1;
    if (was_dead || edog.hungrytime < G.monstermoves + 500) {
      edog.hungrytime = G.monstermoves + 500;
    }
    if (was_dead) {
      edog.droptime = 0;
      edog.dropdist = 10000;
      edog.whistletime = 0;
      edog.apport = 5;
    }
  }
}

export async function abuse_dog(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mtame) {
    return;
  }
  if (G.u.uprops[AGGRAVATE_MONSTER].intrinsic || G.u.uprops[AGGRAVATE_MONSTER].extrinsic || (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic)) {
    mtmp.mtame = (mtmp.mtame / 2 | 0) << 24 >> 24;
  } else {
    mtmp.mtame = mtmp.mtame - 1 << 24 >> 24;
  }
  if (mtmp.mtame && !mtmp.isminion) {
    ++mtmp.mextra.edog.abuse;
  }
  if (!mtmp.mtame && mtmp.mleashed | 0) {
    await m_unleash(mtmp, TRUE);
  }
  if (mtmp.mx !== 0) {
    if (mtmp.mtame && rn2(mtmp.mtame)) {
      await yelp(mtmp);
    } else {
      await growl(mtmp);
    }
    if (!mtmp.mtame) {
      await newsym(mtmp.mx, mtmp.my);
    }
  }
}

export function $init(): void {
  makedog$petname_used = 0;
}
