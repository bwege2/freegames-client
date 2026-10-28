// @ts-nocheck
// NetHack 3.6.7 fountain.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { artiname, discover_artifact, exist_artifact } from './artifact.ts';
import { acurr, adjattrib, exercise, losestr } from './attrib.ts';
import { enlightenment, yn_function } from './cmd.ts';
import { monster_detect } from './detect.ts';
import { newsym } from './display.ts';
import { Amonnam, a_monnam, hcolor, hliquid, oname, rndmonnam } from './do_name.ts';
import { dunlev, dunlevs_in_dungeon, level_difficulty } from './dungeon.ts';
import { morehungry, newuhs, vomit } from './eat.ts';
import { del_engr_at, surface } from './engrave.ts';
import { more_experienced, newexplevel } from './exper.ts';
import { in_town, losehp, money_cnt } from './hack.ts';
import { dist2, distmin } from './hacklib.ts';
import { delobj, sobj_at, update_inventory, useup } from './invent.ts';
import { makemon } from './makemon.ts';
import { bless, curse, mkgold, mkobj, mkobj_at, mksobj_at, uncurse } from './mkobj.ts';
import { nexttodoor } from './mkroom.ts';
import { angry_guards, minliquid } from './mon.ts';
import { pronoun_gender } from './mondata.ts';
import { monflee } from './monmove.ts';
import { fruitname, makeplural, rnd_class } from './objnam.ts';
import { You, You_feel, You_hear, You_see, Your, pline, pline_The, verbalize } from './pline.ts';
import { body_part, mbodypart, polyself } from './polyself.ts';
import { dopotion, mongrantswish } from './potion.ts';
import { rn2, rnd } from './rnd.ts';
import { obfree } from './shk.ts';
import { somegold } from './steal.ts';
import { delfloortrap, mintrap, t_at, water_damage, water_damage_chain } from './trap.ts';
import { do_clear_area } from './vision.ts';
import { worm_known } from './worm.ts';
import { struct_obj } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S } from './rt/index.ts';
import { ARM, ART_EXCALIBUR, A_CON, A_LAWFUL, A_MAX, A_WIS, BLINDED, BOULDER, COIN_CLASS, DEAF, DETECT_MONSTERS, DILITHIUM_CRYSTAL, ENL_GAMEINPROGRESS, ER_DESTROYED, ER_NOTHING, FALSE, FIRE_RES, FOUNTAIN, FROMOUTSIDE, G_GONE, HALLUC, HALLUC_RES, HEAD, INFRAVISION, INVIS, KILLED_BY, KILLED_BY_AN, LEVITATION, LONG_SWORD, LUCKSTONE, MAGICENLIGHTENMENT, NO_MM_FLAGS, PM_SEWER_RAT, PM_WATER_DEMON, PM_WATER_ELEMENTAL, PM_WATER_MOCCASIN, PM_WATER_NYMPH, POISON_RES, POOL, POTION_CLASS, POT_ACID, POT_WATER, RING_CLASS, ROOM, SEE_INVIS, S_LRING, TELEPAT, TRUE, TT_INFLOOR, TT_LAVA, UNCHANGING, WARN_OF_MON } from './consts.ts';


export async function floating_above(what: Ptr | null): Promise<void> {
  let umsg = S("are floating high above the %s.");
  if (G.u.utrap && (G.u.utraptype === TT_INFLOOR || G.u.utraptype === TT_LAVA)) {
    umsg = S("are trapped in the %s.");
    what = surface(G.u.ux, G.u.uy);
  }
  await You(umsg, what);
}

async function dowatersnakes(): Promise<void> {
  let num = rn2(5) + 2;
  let mtmp = null;
  if (!(G.mvitals[PM_WATER_MOCCASIN].mvflags & G_GONE)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("An endless stream of %s pours forth!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await makeplural(await rndmonnam(null)) : S("snakes"));
    } else {
      await You_hear(S("%s hissing!"), G.c_common_strings.c_something);
    }
    while (num-- > 0) {
      if (!!(mtmp = await makemon($sat(G.mons, PM_WATER_MOCCASIN), G.u.ux, G.u.uy, NO_MM_FLAGS)) && t_at(mtmp.mx, mtmp.my)) {
        await mintrap(mtmp);
      }
    }
  } else {
    await pline_The(S("fountain bubbles furiously for a moment, then calms."));
  }
}

async function dowaterdemon(): Promise<void> {
  const mtmp = [null];
  if (!(G.mvitals[PM_WATER_DEMON].mvflags & G_GONE)) {
    if (!!(mtmp[0] = await makemon($sat(G.mons, PM_WATER_DEMON), G.u.ux, G.u.uy, NO_MM_FLAGS))) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await You(S("unleash %s!"), await a_monnam(mtmp[0]));
      } else {
        await You_feel(S("the presence of evil."));
      }
      if (rnd(100) > 80 + level_difficulty()) {
        await pline(S("Grateful for %s release, %s grants you a wish!"), G.genders[pronoun_gender(mtmp[0], 0)].his, G.genders[pronoun_gender(mtmp[0], 0)].he);
        await mongrantswish(P(mtmp, 0));
      } else if (t_at(mtmp[0].mx, mtmp[0].my)) {
        await mintrap(mtmp[0]);
      }
    }
  } else {
    await pline_The(S("fountain bubbles furiously for a moment, then calms."));
  }
}

async function dowaternymph(): Promise<void> {
  let mtmp = null;
  if (!(G.mvitals[PM_WATER_NYMPH].mvflags & G_GONE) && !!(mtmp = await makemon($sat(G.mons, PM_WATER_NYMPH), G.u.ux, G.u.uy, NO_MM_FLAGS))) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await You(S("attract %s!"), await a_monnam(mtmp));
    } else {
      await You_hear(S("a seductive voice."));
    }
    mtmp.msleeping = 0;
    if (t_at(mtmp.mx, mtmp.my)) {
      await mintrap(mtmp);
    }
  } else if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await pline(S("A large bubble rises to the surface and pops."));
  } else {
    await You_hear(S("a loud pop."));
  }
}

export async function dogushforth(drinking: number): Promise<void> {
  const madepool = new Int32Array(1);
  madepool[0] = 0;
  await do_clear_area(G.u.ux, G.u.uy, 7, gush, P(madepool, 0));
  if (!madepool[0]) {
    if (drinking) {
      await Your(S("thirst is quenched."));
    } else {
      await pline(S("Water sprays all over you."));
    }
  }
}

async function gush(x: number, y: number, poolcnt: any): Promise<void> {
  let mtmp = null;
  let ttmp = null;
  if ((x + y) % 2 || x === G.u.ux && y === G.u.uy || rn2(1 + distmin(G.u.ux, G.u.uy, x, y)) || $at2(G.level.locations, x, y).typ !== ROOM || sobj_at(BOULDER, x, y) || nexttodoor(x, y)) {
    return;
  }
  if (!!(ttmp = t_at(x, y)) && !await delfloortrap(ttmp)) {
    return;
  }
  if (!poolcnt.a[poolcnt.o]++) {
    await pline(S("Water gushes forth from the overflowing fountain!"));
  }
  $at2(G.level.locations, x, y).typ = POOL, $at2(G.level.locations, x, y).flags = 0;
  await del_engr_at(x, y);
  await water_damage_chain(G.level.objects[x][y], TRUE);
  if (!!(mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    await minliquid(mtmp);
  } else {
    await newsym(x, y);
  }
}

async function dofindgem(): Promise<void> {
  let $t1: any;
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    await You(S("spot a gem in the sparkling waters!"));
  } else {
    await You_feel(S("a gem here!"));
  }
  await mksobj_at(rnd_class(DILITHIUM_CRYSTAL, LUCKSTONE - 1), G.u.ux, G.u.uy, FALSE, FALSE);
  ($t1 = $at2(G.level.locations, G.u.ux, G.u.uy), $t1.flags = (($t1.flags | 0 | 1) >>> 0) & 31);
  ;
  await newsym(G.u.ux, G.u.uy);
  await exercise(A_WIS, TRUE);
}

export async function dryup(x: number, y: number, isyou: number): Promise<void> {
  let $t1: any;
  if ($at2(G.level.locations, x, y).typ === FOUNTAIN && (!rn2(3) || ($at2(G.level.locations, x, y).flags | 0) & 2)) {
    if (isyou && in_town(x, y) && !(($at2(G.level.locations, x, y).flags | 0) & 2)) {
      let mtmp = null;
      ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | 2) >>> 0) & 31);
      ;
      for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
        if (mtmp.mhp < 1) {
          continue;
        }
        if ((mtmp.data === $sat(G.mons, 278) || mtmp.data === $sat(G.mons, 279)) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 && mtmp.mpeaceful | 0) {
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            await pline(S("%s yells:"), await Amonnam(mtmp));
            await verbalize(S("Hey, stop using that fountain!"));
          } else {
            await pline(S("%s earnestly %s %s %s!"), await Amonnam(mtmp), (mtmp.data.mflags1 & 24576) >>> 0 === 24576 ? S("shakes") : S("waves"), G.genders[pronoun_gender(mtmp, 0)].his, (mtmp.data.mflags1 & 24576) >>> 0 === 24576 ? mbodypart(mtmp, HEAD) : await makeplural(mbodypart(mtmp, ARM)));
          }
          break;
        }
      }
      if (!mtmp) {
        await pline_The(S("flow reduces to a trickle."));
      }
      return;
    }
    if (isyou && G.flags.debug) {
      if (await yn_function(S("Dry up fountain?"), P(G.ynchars), 110) === 110) {
        return;
      }
    }
    $at2(G.level.locations, x, y).typ = ROOM, $at2(G.level.locations, x, y).flags = 0;
    $at2(G.level.locations, x, y).horizontal = 0;
    if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
      await pline_The(S("fountain dries up!"));
    }
    await newsym(x, y);
    G.level.flags.nfountains = G.level.flags.nfountains - 1 & 0xff;
    if (isyou && in_town(x, y)) {
      await angry_guards(FALSE);
    }
  }
}

export async function drinkfountain(): Promise<void> {
  let $t1: any;
  let mgkftn = (($at2(G.level.locations, G.u.ux, G.u.uy).horizontal | 0) === 1 ? 1 : 0) << 24 >> 24;
  let fate = rnd(30);
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    await floating_above(S("fountain"));
    return;
  }
  if (mgkftn && G.u.uluck >= 0 && fate >= 10) {
    let i = 0;
    let ii = 0;
    let littleluck = G.u.uluck < 4 ? 1 : 0;
    await pline(S("Wow!  This makes you feel great!"));
    for (ii = 0; ii < A_MAX; ++ii) {
      if (G.u.acurr.a[ii] < G.u.amax.a[ii]) {
        G.u.acurr.a[ii] = G.u.amax.a[ii];
        G.context.botl = 1;
      }
    }
    i = rn2(A_MAX);
    for (ii = 0; ii < A_MAX; ++ii) {
      if (await adjattrib(i, 1, littleluck ? -1 : 0) && littleluck) {
        break;
      }
      if (++i >= A_MAX) {
        i = 0;
      }
    }
    await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
    await pline(S("A wisp of vapor escapes the fountain..."));
    await exercise(A_WIS, TRUE);
    $at2(G.level.locations, G.u.ux, G.u.uy).horizontal = 0;
    return;
  }
  if (fate < 10) {
    await pline_The(S("cool draught refreshes you."));
    G.u.uhunger += rnd(10);
    await newuhs(FALSE);
    if (mgkftn) {
      return;
    }
  } else {
    switch (fate) {
    case 19:
      await You_feel(S("self-knowledgeable..."));
      await G.windowprocs.win_display_nhwindow(G.WIN_MESSAGE, FALSE);
      await enlightenment(MAGICENLIGHTENMENT, ENL_GAMEINPROGRESS);
      await exercise(A_WIS, TRUE);
      await pline_The(S("feeling subsides."));
      break;
    case 20:
      await pline_The(S("water is foul!  You gag and vomit."));
      await morehungry(rn2(20) + 11);
      await vomit();
      break;
    case 21:
      await pline_The(S("water is contaminated!"));
      if (G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic) {
        await pline(S("Perhaps it is runoff from the nearby %s farm."), await fruitname(FALSE));
        await losehp(rnd(4), S("unrefrigerated sip of juice"), KILLED_BY_AN);
        break;
      }
      await losestr(rn2(4) + 3);
      await losehp(rnd(10), S("contaminated water"), KILLED_BY);
      await exercise(A_CON, FALSE);
      break;
    case 22:
      await dowatersnakes();
      break;
    case 23:
      await dowaterdemon();
      break;
    case 24:
      {
        let obj = null;
        await pline(S("This water's no good!"));
        await morehungry(rn2(20) + 11);
        await exercise(A_CON, FALSE);
        for (obj = G.invent; obj; obj = obj.nobj) {
          if (!rn2(5)) {
            await curse(obj);
          }
        }
        break;
      }
    case 25:
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) {
          await You(S("feel transparent."));
        } else {
          await You(S("feel very self-conscious."));
          await pline(S("Then it passes."));
        }
      } else {
        await You_see(S("an image of someone stalking you."));
        await pline(S("But it disappears."));
      }
      ($t1 = G.u.uprops[SEE_INVIS], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
      await newsym(G.u.ux, G.u.uy);
      await exercise(A_WIS, TRUE);
      break;
    case 26:
      await monster_detect(null, 0);
      await exercise(A_WIS, TRUE);
      break;
    case 27:
      if (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 1)) {
        await dofindgem();
        break;
      }
    case 28:
      await dowaternymph();
      break;
    case 29:
      {
        let mtmp = null;
        await pline(S("This %s gives you bad breath!"), hliquid(S("water")));
        for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
          if (mtmp.mhp < 1) {
            continue;
          }
          await monflee(mtmp, 0, FALSE, FALSE);
        }
        break;
      }
    case 30:
      await dogushforth(TRUE);
      break;
    default:
      await pline(S("This tepid %s is tasteless."), hliquid(S("water")));
      break;
    }
  }
  await dryup(G.u.ux, G.u.uy, TRUE);
}

export async function dipfountain(obj: struct_obj | null): Promise<void> {
  let $t1: any, $t2: any;
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    await floating_above(S("fountain"));
    return;
  }
  if (obj.otyp === LONG_SWORD && obj.quan === 1 && G.u.ulevel >= 5 && !rn2(6) && !obj.oartifact && !exist_artifact(LONG_SWORD, artiname(ART_EXCALIBUR))) {
    if (G.u.ualign.type !== A_LAWFUL) {
      await pline(S("A freezing mist rises from the %s and envelopes the sword."), hliquid(S("water")));
      await pline_The(S("fountain disappears!"));
      await curse(obj);
      if (obj.spe > -6 && !rn2(3)) {
        obj.spe = obj.spe - 1 << 24 >> 24;
      }
      obj.oerodeproof = (FALSE) & 1;
      await exercise(A_WIS, FALSE);
    } else {
      await pline(S("From the murky depths, a hand reaches up to bless the sword."));
      await pline(S("As the hand retreats, the fountain disappears!"));
      obj = await oname(obj, artiname(ART_EXCALIBUR));
      await discover_artifact(ART_EXCALIBUR);
      await bless(obj);
      obj.oeroded = (obj.oeroded2 = 0) & 3;
      obj.oerodeproof = (TRUE) & 1;
      await exercise(A_WIS, TRUE);
    }
    update_inventory();
    $at2(G.level.locations, G.u.ux, G.u.uy).typ = ROOM, $at2(G.level.locations, G.u.ux, G.u.uy).flags = 0;
    await newsym(G.u.ux, G.u.uy);
    G.level.flags.nfountains = G.level.flags.nfountains - 1 & 0xff;
    if (in_town(G.u.ux, G.u.uy)) {
      await angry_guards(FALSE);
    }
    return;
  } else {
    let er = await water_damage(obj, null, TRUE);
    if (obj.otyp === POT_ACID && er !== ER_DESTROYED) {
      await useup(obj);
      return;
    } else if (er !== ER_NOTHING && !rn2(2)) {
      return;
    }
  }
  switch (rnd(30)) {
  case 16:
    await curse(obj);
    break;
  case 17:
  case 18:
  case 19:
  case 20:
    if (obj.cursed) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline_The(S("%s glows for a moment."), hliquid(S("water")));
      }
      await uncurse(obj);
    } else {
      await pline(S("A feeling of loss comes over you."));
    }
    break;
  case 21:
    await dowaterdemon();
    break;
  case 22:
    await dowaternymph();
    break;
  case 23:
    await dowatersnakes();
    break;
  case 24:
    if (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 1)) {
      await dofindgem();
      break;
    }
  case 25:
    await dogushforth(FALSE);
    break;
  case 26:
    await pline(S("A strange tingling runs up your %s."), body_part(ARM));
    break;
  case 27:
    await You_feel(S("a sudden chill."));
    break;
  case 28:
    await pline(S("An urge to take a bath overwhelms you."));
    {
      let money = money_cnt(G.invent);
      let otmp = null;
      if (money > 10) {
        money = Math.trunc(somegold(money) / 10);
        for (otmp = G.invent; otmp && money > 0; otmp = otmp.nobj) {
          if (otmp.oclass === COIN_CLASS) {
            let denomination = G.objects[otmp.otyp].oc_cost;
            let coin_loss = Math.trunc((money + denomination - 1) / denomination);
            coin_loss = coin_loss < otmp.quan ? coin_loss : otmp.quan;
            otmp.quan -= coin_loss;
            money -= coin_loss * denomination;
            if (!otmp.quan) {
              await delobj(otmp);
            }
          }
        }
        await You(S("lost some of your money in the fountain!"));
        ($t1 = $at2(G.level.locations, G.u.ux, G.u.uy), $t1.flags = ((($t1.flags | 0) & ~1) >>> 0) & 31);
        ;
        await exercise(A_WIS, FALSE);
      }
    }
    break;
  case 29:
    if (($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & 1) {
      break;
    }
    ($t2 = $at2(G.level.locations, G.u.ux, G.u.uy), $t2.flags = (($t2.flags | 0 | 1) >>> 0) & 31);
    ;
    await mkgold(rnd((dunlevs_in_dungeon(G.u.uz) - dunlev(G.u.uz) + 1) * 2) + 5, G.u.ux, G.u.uy);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("Far below you, you see coins glistening in the %s."), hliquid(S("water")));
    }
    await exercise(A_WIS, TRUE);
    await newsym(G.u.ux, G.u.uy);
    break;
  }
  update_inventory();
  await dryup(G.u.ux, G.u.uy, TRUE);
}

export async function breaksink(x: number, y: number): Promise<void> {
  let $t1: any;
  if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2 || x === G.u.ux && y === G.u.uy) {
    await pline_The(S("pipes break!  Water spurts out!"));
  }
  G.level.flags.nsinks = G.level.flags.nsinks - 1 & 0xff;
  $at2(G.level.locations, x, y).typ = FOUNTAIN, $at2(G.level.locations, x, y).flags = 0;
  $at2(G.level.locations, x, y).horizontal = 0;
  ($t1 = $at2(G.level.locations, x, y), $t1.flags = (($t1.flags | 0 | 1) >>> 0) & 31);
  ;
  G.level.flags.nfountains = G.level.flags.nfountains + 1 & 0xff;
  await newsym(x, y);
}

export async function drinksink(): Promise<void> {
  let $t1: any;
  let otmp = null;
  let mtmp = null;
  if ((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
    await floating_above(S("sink"));
    return;
  }
  switch (rn2(20)) {
  case 0:
    await You(S("take a sip of very cold %s."), hliquid(S("water")));
    break;
  case 1:
    await You(S("take a sip of very warm %s."), hliquid(S("water")));
    break;
  case 2:
    await You(S("take a sip of scalding hot %s."), hliquid(S("water")));
    if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
      await pline(S("It seems quite tasty."));
    } else {
      await losehp(rnd(6), S("sipping boiling water"), KILLED_BY);
    }
    break;
  case 3:
    if (G.mvitals[PM_SEWER_RAT].mvflags & G_GONE) {
      await pline_The(S("sink seems quite dirty."));
    } else {
      mtmp = await makemon($sat(G.mons, PM_SEWER_RAT), G.u.ux, G.u.uy, NO_MM_FLAGS);
      if (mtmp) {
        await pline(S("Eek!  There's %s in the sink!"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? S("something squirmy") : await a_monnam(mtmp));
      }
    }
    break;
  case 4:
    do {
      otmp = await mkobj(POTION_CLASS, FALSE);
      if (otmp.otyp === POT_WATER) {
        await obfree(otmp, null);
        otmp = null;
      }
    } while (!otmp);
    otmp.cursed = (otmp.blessed = 0) & 1;
    await pline(S("Some %s liquid flows from the faucet."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("odd") : hcolor(G.obj_descr[G.objects[otmp.otyp].oc_descr_idx].oc_descr));
    otmp.dknown = ((!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) >>> 0) & 1;
    ++otmp.quan;
    otmp.corpsenm = 1;
    await dopotion(otmp);
    await obfree(otmp, null);
    break;
  case 5:
    if (!(($at2(G.level.locations, G.u.ux, G.u.uy).flags | 0) & S_LRING)) {
      await You(S("find a ring in the sink!"));
      await mkobj_at(RING_CLASS, G.u.ux, G.u.uy, TRUE);
      ($t1 = $at2(G.level.locations, G.u.ux, G.u.uy), $t1.flags = (($t1.flags | 0 | S_LRING) >>> 0) & 31);
      await exercise(A_WIS, TRUE);
      await newsym(G.u.ux, G.u.uy);
    } else {
      await pline(S("Some dirty %s backs up in the drain."), hliquid(S("water")));
    }
    break;
  case 6:
    await breaksink(G.u.ux, G.u.uy);
    break;
  case 7:
    await pline_The(S("%s moves as though of its own will!"), hliquid(S("water")));
    if (G.mvitals[PM_WATER_ELEMENTAL].mvflags & G_GONE || !await makemon($sat(G.mons, PM_WATER_ELEMENTAL), G.u.ux, G.u.uy, NO_MM_FLAGS)) {
      await pline(S("But it quiets down."));
    }
    break;
  case 8:
    await pline(S("Yuk, this %s tastes awful."), hliquid(S("water")));
    await more_experienced(1, 0);
    await newexplevel();
    break;
  case 9:
    await pline(S("Gaggg... this tastes like sewage!  You vomit."));
    await morehungry(rn2(30 - acurr(A_CON)) + 11);
    await vomit();
    break;
  case 10:
    await pline(S("This %s contains toxic wastes!"), hliquid(S("water")));
    if (!(G.u.uprops[UNCHANGING].intrinsic || G.u.uprops[UNCHANGING].extrinsic)) {
      await You(S("undergo a freakish metamorphosis!"));
      await polyself(0);
    }
    break;
  case 11:
    await You_hear(S("clanking from the pipes..."));
    break;
  case 12:
    await You_hear(S("snatches of song from among the sewers..."));
    break;
  case 19:
    if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await pline(S("From the murky drain, a hand reaches up... --oops--"));
      break;
    }
  default:
    await You(S("take a sip of %s %s."), rn2(3) ? rn2(2) ? S("cold") : S("warm") : S("hot"), hliquid(S("water")));
  }
}

export function $init(): void {
}
