// @ts-nocheck
// NetHack 3.6.7 mcastu.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { acurr, losestr } from './attrib.ts';
import { map_invisible, shieldeff } from './display.ts';
import { Monnam, mon_nam } from './do_name.ts';
import { destroy_arm, some_armor } from './do_wear.ts';
import { is_fainted } from './eat.ts';
import { done, done_in_by } from './end.ts';
import { nomul } from './hack.ts';
import { dist2, sgn, upstart } from './hacklib.ts';
import { makemon, mkclass, set_malign } from './makemon.ts';
import { mdamageu } from './mhitu.ts';
import { monster_census } from './minion.ts';
import { pronoun_gender } from './mondata.ts';
import { lined_up } from './mthrowu.ts';
import { ureflects } from './muse.ts';
import { an, makeplural, vtense } from './objnam.ts';
import { Norep, You, You_feel, You_hear, Your, impossible, pline, pline_The, verbalize } from './pline.ts';
import { body_part } from './polyself.ts';
import { make_blinded, make_confused, make_stunned } from './potion.ts';
import { d, rn2, rnd } from './rnd.ts';
import { rndcurse } from './sit.ts';
import { enexto } from './teleport.ts';
import { burn_away_slime } from './timeout.ts';
import { burnarmor, unconscious } from './trap.ts';
import { aggravate, clonewiz, has_aggravatables, nasty } from './wizard.ts';
import { worm_known } from './worm.ts';
import { mon_adjust_speed, mon_set_minvis } from './worn.ts';
import { burn_floor_objects, buzz, destroy_item, flashburn } from './zap.ts';
import { struct_attack, struct_monst, struct_nhcoord } from './structs.ts';
import { $at2, $rd, $sat, $wr, G, P, S, strcpy } from './rt/index.ts';
import { AD_CLRC, AD_ELEC, AD_FIRE, AD_SPC2, AD_SPEL, ANTIMAGIC, A_DEX, BLINDED, CLC_BLIND_YOU, CLC_CONFUSE_YOU, CLC_CURE_SELF, CLC_CURSE_ITEMS, CLC_FIRE_PILLAR, CLC_GEYSER, CLC_INSECTS, CLC_LIGHTNING, CLC_OPEN_WOUNDS, CLC_PARALYZE, COLD_RES, CONFUSION, DEAF, DETECT_MONSTERS, DIED, DISPLACED, EYE, FALSE, FIRE_RES, FREE_ACTION, HALF_PHDAM, HALF_SPDAM, HALLUC, HALLUC_RES, HEAD, INFRAVISION, INVIS, KILLED_BY_AN, MFAST, MGC_AGGRAVATION, MGC_CLONE_WIZ, MGC_CURE_SELF, MGC_CURSE_ITEMS, MGC_DEATH_TOUCH, MGC_DESTRY_ARMR, MGC_DISAPPEAR, MGC_HASTE_SELF, MGC_PSI_BOLT, MGC_STUN_YOU, MGC_SUMMON_MONS, MGC_WEAKEN_YOU, MM_ANGRY, M_AP_OBJECT, POTION_CLASS, RING_CLASS, SCROLL_CLASS, SEE_INVIS, SHOCK_RES, SPBOOK_CLASS, STUNNED, S_ANT, S_GOLEM, S_SNAKE, S_VORTEX, TELEPAT, TIMEOUT, TRUE, WAND_CLASS, WARN_OF_MON, WATER } from './consts.ts';


async function cursetxt(mtmp: struct_monst | null, undirected: number): Promise<void> {
  if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) {
    let point_msg = null;
    if (undirected) {
      point_msg = S("all around, then curses");
    } else if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy) || (G.youmonst.m_ap_type & 7) === M_AP_OBJECT && G.youmonst.mappearance === 0 || G.u.uundetected | 0) {
      point_msg = S("and curses in your general direction");
    } else if (G.u.uprops[DISPLACED].extrinsic && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy)) {
      point_msg = S("and curses at your displaced image");
    } else {
      point_msg = S("at you, then curses");
    }
    await pline(S("%s points %s."), await Monnam(mtmp), point_msg);
  } else if (!(G.moves % 4) || !rn2(4)) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await Norep(S("You hear a mumbled curse."));
    }
  }
}

function choose_magic_spell(spellval: number): number {
  while (spellval > 24 && rn2(25)) {
    spellval = rn2(spellval);
  }
  switch (spellval) {
  case 24:
  case 23:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      return MGC_PSI_BOLT;
    }
  case 22:
  case 21:
  case 20:
    return MGC_DEATH_TOUCH;
  case 19:
  case 18:
    return MGC_CLONE_WIZ;
  case 17:
  case 16:
  case 15:
    return MGC_SUMMON_MONS;
  case 14:
  case 13:
    return MGC_AGGRAVATION;
  case 12:
  case 11:
  case 10:
    return MGC_CURSE_ITEMS;
  case 9:
  case 8:
    return MGC_DESTRY_ARMR;
  case 7:
  case 6:
    return MGC_WEAKEN_YOU;
  case 5:
  case 4:
    return MGC_DISAPPEAR;
  case 3:
    return MGC_STUN_YOU;
  case 2:
    return MGC_HASTE_SELF;
  case 1:
    return MGC_CURE_SELF;
  case 0:
  default:
    return MGC_PSI_BOLT;
  }
}

function choose_clerical_spell(spellnum: number): number {
  while (spellnum > 15 && rn2(16)) {
    spellnum = rn2(spellnum);
  }
  switch (spellnum) {
  case 15:
  case 14:
    if (rn2(3)) {
      return CLC_OPEN_WOUNDS;
    }
  case 13:
    return CLC_GEYSER;
  case 12:
    return CLC_FIRE_PILLAR;
  case 11:
    return CLC_LIGHTNING;
  case 10:
  case 9:
    return CLC_CURSE_ITEMS;
  case 8:
    return CLC_INSECTS;
  case 7:
  case 6:
    return CLC_BLIND_YOU;
  case 5:
  case 4:
    return CLC_PARALYZE;
  case 3:
  case 2:
    return CLC_CONFUSE_YOU;
  case 1:
    return CLC_CURE_SELF;
  case 0:
  default:
    return CLC_OPEN_WOUNDS;
  }
}

export async function castmu(mtmp: struct_monst | null, mattk: struct_attack | null, thinks_it_foundyou: number, foundyou: number): Promise<number> {
  let dmg = 0;
  let ml = mtmp.m_lev;
  let ret = 0;
  let spellnum = 0;
  if ((mattk.adtyp === AD_SPEL || mattk.adtyp === AD_CLRC) && ml) {
    let cnt = 40;
    do {
      spellnum = rn2(ml);
      if (mattk.adtyp === AD_SPEL) {
        spellnum = choose_magic_spell(spellnum);
      } else {
        spellnum = choose_clerical_spell(spellnum);
      }
      if (!thinks_it_foundyou) {
        if (!is_undirected_spell(mattk.adtyp, spellnum) || await spell_would_be_useless(mtmp, mattk.adtyp, spellnum)) {
          if (foundyou) {
            await impossible(S("spellcasting monster found you and doesn't know it?"));
          }
          return 0;
        }
        break;
      }
    } while (--cnt > 0 && await spell_would_be_useless(mtmp, mattk.adtyp, spellnum));
    if (cnt === 0) {
      return 0;
    }
  }
  if (mtmp.mcan | 0 || mtmp.mspec_used || !ml) {
    await cursetxt(mtmp, is_undirected_spell(mattk.adtyp, spellnum));
    return 0;
  }
  if (mattk.adtyp === AD_SPEL || mattk.adtyp === AD_CLRC) {
    mtmp.mspec_used = 10 - mtmp.m_lev;
    if (mtmp.mspec_used < 2) {
      mtmp.mspec_used = 2;
    }
  }
  if (!foundyou && thinks_it_foundyou && !is_undirected_spell(mattk.adtyp, spellnum)) {
    await pline(S("%s casts a spell at %s!"), (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) ? await Monnam(mtmp) : S("Something"), $at2(G.level.locations, mtmp.mux, mtmp.muy).typ === WATER ? S("empty water") : S("thin air"));
    return 0;
  }
  nomul(0);
  if (rn2(ml * 10) < (mtmp.mconf | 0 ? 100 : 20)) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) && !(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline_The(S("air crackles around %s."), await mon_nam(mtmp));
    }
    return 0;
  }
  if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) || !is_undirected_spell(mattk.adtyp, spellnum)) {
    await pline(S("%s casts a spell%s!"), (mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)) ? await Monnam(mtmp) : S("Something"), is_undirected_spell(mattk.adtyp, spellnum) ? S("") : (G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy) ? S(" at a spot near you") : G.u.uprops[DISPLACED].extrinsic && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy) ? S(" at your displaced image") : S(" at you"));
  }
  if (!foundyou) {
    dmg = 0;
    if (mattk.adtyp !== AD_SPEL && mattk.adtyp !== AD_CLRC) {
      await impossible(S("%s casting non-hand-to-hand version of hand-to-hand spell %d?"), await Monnam(mtmp), mattk.adtyp);
      return 0;
    }
  } else if (mattk.damd) {
    dmg = d((ml / 2 | 0) + mattk.damn, mattk.damd);
  } else {
    dmg = d((ml / 2 | 0) + 1, 6);
  }
  if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
    dmg = (dmg + 1) / 2 | 0;
  }
  ret = 1;
  switch (mattk.adtyp) {
  case 2:
    await pline(S("You're enveloped in flames."));
    if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline(S("But you resist the effects."));
      dmg = 0;
    }
    await burn_away_slime();
    break;
  case 3:
    await pline(S("You're covered in frost."));
    if (G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline(S("But you resist the effects."));
      dmg = 0;
    }
    break;
  case 1:
    await You(S("are hit by a shower of missiles!"));
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline_The(S("missiles bounce off!"));
      dmg = 0;
    } else {
      dmg = d((mtmp.m_lev / 2 | 0) + 1, 6);
    }
    break;
  case 241:
  case 240:
    {
      if (mattk.adtyp === AD_SPEL) {
        await cast_wizard_spell(mtmp, dmg, spellnum);
      } else {
        await cast_cleric_spell(mtmp, dmg, spellnum);
      }
      dmg = 0;
      break;
    }
  }
  if (dmg) {
    await mdamageu(mtmp, dmg);
  }
  return ret;
}

async function m_cure_self(mtmp: struct_monst | null, dmg: number): Promise<number> {
  if (mtmp.mhp < mtmp.mhpmax) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline(S("%s looks better."), await Monnam(mtmp));
    }
    if ((mtmp.mhp += d(3, 6)) > mtmp.mhpmax) {
      mtmp.mhp = mtmp.mhpmax;
    }
    dmg = 0;
  }
  return dmg;
}

async function cast_wizard_spell(mtmp: struct_monst | null, dmg: number, spellnum: number): Promise<void> {
  if (dmg === 0 && !is_undirected_spell(AD_SPEL, spellnum)) {
    await impossible(S("cast directed wizard spell (%d) with dmg=0?"), spellnum);
    return;
  }
  switch (spellnum) {
  case MGC_DEATH_TOUCH:
    await pline(S("Oh no, %s's using the touch of death!"), G.genders[pronoun_gender(mtmp, 0)].he);
    if ((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX) || (G.youmonst.data.mflags2 & 256) >>> 0 !== 0) {
      await You(S("seem no deader than before."));
    } else if (!(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) && rn2(mtmp.m_lev) > 12) {
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await You(S("have an out of body experience."));
      } else {
        G.killer.format = KILLED_BY_AN;
        strcpy(P(G.killer.name), S("touch of death"));
        await done(DIED);
      }
    } else {
      if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
        await shieldeff(G.u.ux, G.u.uy);
      }
      await pline(S("Lucky for you, it didn't work!"));
    }
    dmg = 0;
    break;
  case MGC_CLONE_WIZ:
    if (mtmp.iswiz | 0 && G.context.no_of_wizards === 1) {
      await pline(S("Double Trouble..."));
      await clonewiz();
      dmg = 0;
    } else {
      await impossible(S("bad wizard cloning?"));
    }
    break;
  case MGC_SUMMON_MONS:
    {
      let count = 0;
      count = await nasty(mtmp);
      if (mtmp.iswiz) {
        await verbalize(S("Destroy the thief, my pet%s!"), count === 1 ? S("") : S("s"));
      } else {
        let mappear = count === 1 ? S("A monster appears") : S("Monsters appear");
        if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy)) {
          await pline(S("%s around a spot near you!"), mappear);
        } else if (G.u.uprops[DISPLACED].extrinsic && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy)) {
          await pline(S("%s around your displaced image!"), mappear);
        } else {
          await pline(S("%s from nowhere!"), mappear);
        }
      }
      dmg = 0;
      break;
    }
  case MGC_AGGRAVATION:
    await You_feel(S("that monsters are aware of your presence."));
    await aggravate();
    dmg = 0;
    break;
  case MGC_CURSE_ITEMS:
    await You_feel(S("as if you need some help."));
    await rndcurse();
    dmg = 0;
    break;
  case MGC_DESTRY_ARMR:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await pline(S("A field of force surrounds you!"));
    } else if (!await destroy_arm(await some_armor(G.youmonst))) {
      await Your(S("skin itches."));
    }
    dmg = 0;
    break;
  case MGC_WEAKEN_YOU:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await You_feel(S("momentarily weakened."));
    } else {
      await You(S("suddenly feel weaker!"));
      dmg = mtmp.m_lev - 6;
      if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
        dmg = (dmg + 1) / 2 | 0;
      }
      await losestr(rnd(dmg));
      if (G.u.uhp < 1) {
        await done_in_by(mtmp, DIED);
      }
    }
    dmg = 0;
    break;
  case MGC_DISAPPEAR:
    if (!mtmp.minvis && !mtmp.invis_blkd) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s suddenly %s!"), await Monnam(mtmp), !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) ? S("disappears") : S("becomes transparent"));
      }
      await mon_set_minvis(mtmp);
      if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        await map_invisible(mtmp.mx, mtmp.my);
      }
      dmg = 0;
    } else {
      await impossible(S("no reason for monster to cast disappear spell?"));
    }
    break;
  case MGC_STUN_YOU:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic || G.u.uprops[FREE_ACTION].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      if (!G.u.uprops[STUNNED].intrinsic) {
        await You_feel(S("momentarily disoriented."));
      }
      await make_stunned(1, FALSE);
    } else {
      await You(G.u.uprops[STUNNED].intrinsic ? S("struggle to keep your balance.") : S("reel..."));
      dmg = d(acurr(A_DEX) < 12 ? 6 : 4, 4);
      if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
        dmg = (dmg + 1) / 2 | 0;
      }
      await make_stunned((G.u.uprops[STUNNED].intrinsic & TIMEOUT) + dmg, FALSE);
    }
    dmg = 0;
    break;
  case MGC_HASTE_SELF:
    await mon_adjust_speed(mtmp, 1, null);
    dmg = 0;
    break;
  case MGC_CURE_SELF:
    dmg = await m_cure_self(mtmp, dmg);
    break;
  case MGC_PSI_BOLT:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      dmg = (dmg + 1) / 2 | 0;
    }
    if (dmg <= 5) {
      await You(S("get a slight %sache."), body_part(HEAD));
    } else if (dmg <= 10) {
      await Your(S("brain is on fire!"));
    } else if (dmg <= 20) {
      await Your(S("%s suddenly aches painfully!"), body_part(HEAD));
    } else {
      await Your(S("%s suddenly aches very painfully!"), body_part(HEAD));
    }
    break;
  default:
    await impossible(S("mcastu: invalid magic spell (%d)"), spellnum);
    dmg = 0;
    break;
  }
  if (dmg) {
    await mdamageu(mtmp, dmg);
  }
}

async function cast_cleric_spell(mtmp: struct_monst | null, dmg: number, spellnum: number): Promise<void> {
  if (dmg === 0 && !is_undirected_spell(AD_CLRC, spellnum)) {
    await impossible(S("cast directed cleric spell (%d) with dmg=0?"), spellnum);
    return;
  }
  switch (spellnum) {
  case CLC_GEYSER:
    await pline(S("A sudden geyser slams into you from nowhere!"));
    dmg = d(8, 6);
    if (G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic) {
      dmg = (dmg + 1) / 2 | 0;
    }
    break;
  case CLC_FIRE_PILLAR:
    await pline(S("A pillar of fire strikes all around you!"));
    if (G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      dmg = 0;
    } else {
      dmg = d(8, 6);
    }
    if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
      dmg = (dmg + 1) / 2 | 0;
    }
    await burn_away_slime();
    await burnarmor(G.youmonst);
    await destroy_item(SCROLL_CLASS, AD_FIRE);
    await destroy_item(POTION_CLASS, AD_FIRE);
    await destroy_item(SPBOOK_CLASS, AD_FIRE);
    await burn_floor_objects(G.u.ux, G.u.uy, TRUE, FALSE);
    break;
  case CLC_LIGHTNING:
    {
      let reflects = 0;
      await pline(S("A bolt of lightning strikes down at you from above!"));
      reflects = await ureflects(S("It bounces off your %s%s."), S(""));
      if (reflects || (G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic)) {
        await shieldeff(G.u.ux, G.u.uy);
        dmg = 0;
        if (reflects) {
          break;
        }
      } else {
        dmg = d(8, 6);
      }
      if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
        dmg = (dmg + 1) / 2 | 0;
      }
      await destroy_item(WAND_CLASS, AD_ELEC);
      await destroy_item(RING_CLASS, AD_ELEC);
      await flashburn(rnd(100));
      break;
    }
  case CLC_CURSE_ITEMS:
    await You_feel(S("as if you need some help."));
    await rndcurse();
    dmg = 0;
    break;
  case CLC_INSECTS:
    {
      let pm = await mkclass(S_ANT, 0);
      let mtmp2 = null;
      let let_ = (pm ? S_ANT : S_SNAKE) << 24 >> 24;
      let success = FALSE;
      let seecaster = 0;
      let i = 0;
      let quan = 0;
      let oldseen = 0;
      let newseen = 0;
      let bypos = new struct_nhcoord();
      let fmt = null;
      oldseen = monster_census(TRUE);
      quan = mtmp.m_lev < 2 ? 1 : rnd(mtmp.m_lev / 2 | 0);
      if (quan < 3) {
        quan = 3;
      }
      for (i = 0; i <= quan; ++i) {
        if (!await enexto(bypos, mtmp.mux, mtmp.muy, mtmp.data)) {
          break;
        }
        if (!!(pm = await mkclass(let_, 0)) && !!(mtmp2 = await makemon(pm, bypos.x, bypos.y, MM_ANGRY))) {
          success = TRUE;
          mtmp2.msleeping = (mtmp2.mpeaceful = ((mtmp2.mtame = 0) >>> 0) & 1) & 1;
          set_malign(mtmp2);
        }
      }
      newseen = monster_census(TRUE);
      seecaster = ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || !((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) ? 1 : 0) << 24 >> 24;
      fmt = null;
      if (!seecaster) {
        let arg = null;
        let what = let_ === S_SNAKE ? S("snake") : S("insect");
        if (newseen <= oldseen || G.multi < 0 && (unconscious() || is_fainted())) {
          await You_hear(S("someone summoning %s."), await makeplural(what));
        } else {
          arg = newseen === oldseen + 1 ? await an(what) : await makeplural(what);
          if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
            await You_hear(S("someone summoning something, and %s %s."), arg, vtense(arg, S("appear")));
          } else {
            await pline(S("%s %s."), upstart(arg), vtense(arg, S("appear")));
          }
        }
      } else if (!success) {
        fmt = S("%s casts at a clump of sticks, but nothing happens.");
      } else if (let_ === S_SNAKE) {
        fmt = S("%s transforms a clump of sticks into snakes!");
      } else if ((G.u.uprops[INVIS].intrinsic || G.u.uprops[INVIS].extrinsic) && !G.u.uprops[INVIS].blocked && !((mtmp.data.mflags1 & 16777216) >>> 0 !== 0) && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy)) {
        fmt = S("%s summons insects around a spot near you!");
      } else if (G.u.uprops[DISPLACED].extrinsic && (mtmp.mux !== G.u.ux || mtmp.muy !== G.u.uy)) {
        fmt = S("%s summons insects around your displaced image!");
      } else {
        fmt = S("%s summons insects!");
      }
      if (fmt) {
        await pline(fmt, await Monnam(mtmp));
      }
      dmg = 0;
      break;
    }
  case CLC_BLIND_YOU:
    if (!G.u.uprops[BLINDED].intrinsic) {
      let num_eyes = !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2;
      await pline(S("Scales cover your %s!"), num_eyes === 1 ? body_part(EYE) : await makeplural(body_part(EYE)));
      await make_blinded(G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic ? 100 : 200, FALSE);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await Your(S("%s"), G.c_common_strings.c_vision_clears);
      }
      dmg = 0;
    } else {
      await impossible(S("no reason for monster to cast blindness spell?"));
    }
    break;
  case CLC_PARALYZE:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic || G.u.uprops[FREE_ACTION].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      if (G.multi >= 0) {
        await You(S("stiffen briefly."));
      }
      nomul(-1);
      G.multi_reason = S("paralyzed by a monster");
    } else {
      if (G.multi >= 0) {
        await You(S("are frozen in place!"));
      }
      dmg = 4 + mtmp.m_lev;
      if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
        dmg = (dmg + 1) / 2 | 0;
      }
      nomul(-dmg);
      G.multi_reason = S("paralyzed by a monster");
    }
    G.nomovemsg = null;
    dmg = 0;
    break;
  case CLC_CONFUSE_YOU:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      await You_feel(S("momentarily dizzy."));
    } else {
      let oldprop = (!!G.u.uprops[CONFUSION].intrinsic ? 1 : 0) << 24 >> 24;
      dmg = mtmp.m_lev;
      if (G.u.uprops[HALF_SPDAM].intrinsic || G.u.uprops[HALF_SPDAM].extrinsic) {
        dmg = (dmg + 1) / 2 | 0;
      }
      await make_confused(G.u.uprops[CONFUSION].intrinsic + dmg, TRUE);
      if (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
        await You_feel(S("%s!"), oldprop ? S("trippier") : S("trippy"));
      } else {
        await You_feel(S("%sconfused!"), oldprop ? S("more ") : S(""));
      }
    }
    dmg = 0;
    break;
  case CLC_CURE_SELF:
    dmg = await m_cure_self(mtmp, dmg);
    break;
  case CLC_OPEN_WOUNDS:
    if (G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) {
      await shieldeff(G.u.ux, G.u.uy);
      dmg = (dmg + 1) / 2 | 0;
    }
    if (dmg <= 5) {
      await Your(S("skin itches badly for a moment."));
    } else if (dmg <= 10) {
      await pline(S("Wounds appear on your body!"));
    } else if (dmg <= 20) {
      await pline(S("Severe wounds appear on your body!"));
    } else {
      await Your(S("body is covered with painful wounds!"));
    }
    break;
  default:
    await impossible(S("mcastu: invalid clerical spell (%d)"), spellnum);
    dmg = 0;
    break;
  }
  if (dmg) {
    await mdamageu(mtmp, dmg);
  }
}

function is_undirected_spell(adtyp: number, spellnum: number): number {
  if (adtyp === AD_SPEL) {
    switch (spellnum) {
    case MGC_CLONE_WIZ:
    case MGC_SUMMON_MONS:
    case MGC_AGGRAVATION:
    case MGC_DISAPPEAR:
    case MGC_HASTE_SELF:
    case MGC_CURE_SELF:
      return TRUE;
    default:
      break;
    }
  } else if (adtyp === AD_CLRC) {
    switch (spellnum) {
    case CLC_INSECTS:
    case CLC_CURE_SELF:
      return TRUE;
    default:
      break;
    }
  }
  return FALSE;
}

async function spell_would_be_useless(mtmp: struct_monst | null, adtyp: number, spellnum: number): Promise<number> {
  let mcouldseeu = ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1) << 24 >> 24;
  if (adtyp === AD_SPEL) {
    if (mtmp.mpeaceful | 0 && (spellnum === MGC_AGGRAVATION || spellnum === MGC_SUMMON_MONS || spellnum === MGC_CLONE_WIZ)) {
      return TRUE;
    }
    if ((mtmp.permspeed | 0) === MFAST && spellnum === MGC_HASTE_SELF) {
      return TRUE;
    }
    if ((mtmp.minvis | 0 || mtmp.invis_blkd | 0) && spellnum === MGC_DISAPPEAR) {
      return TRUE;
    }
    if (mtmp.mpeaceful | 0 && !(G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic) && spellnum === MGC_DISAPPEAR) {
      return TRUE;
    }
    if (mtmp.mhp === mtmp.mhpmax && spellnum === MGC_CURE_SELF) {
      return TRUE;
    }
    if (!mcouldseeu && (spellnum === MGC_SUMMON_MONS || !mtmp.iswiz && spellnum === MGC_CLONE_WIZ)) {
      return TRUE;
    }
    if ((!mtmp.iswiz || G.context.no_of_wizards > 1) && spellnum === MGC_CLONE_WIZ) {
      return TRUE;
    }
    if (spellnum === MGC_AGGRAVATION) {
      if (!await has_aggravatables(mtmp)) {
        return (rn2(100) ? TRUE : FALSE) << 24 >> 24;
      }
    }
  } else if (adtyp === AD_CLRC) {
    if (mtmp.mpeaceful | 0 && spellnum === CLC_INSECTS) {
      return TRUE;
    }
    if (mtmp.mhp === mtmp.mhpmax && spellnum === CLC_CURE_SELF) {
      return TRUE;
    }
    if (!mcouldseeu && spellnum === CLC_INSECTS) {
      return TRUE;
    }
    if (G.u.uprops[BLINDED].intrinsic && spellnum === CLC_BLIND_YOU) {
      return TRUE;
    }
  }
  return FALSE;
}

export async function buzzmu(mtmp: struct_monst | null, mattk: struct_attack | null): Promise<number> {
  if (mattk.adtyp > AD_SPC2) {
    return 0;
  }
  if (mtmp.mcan) {
    await cursetxt(mtmp, FALSE);
    return 0;
  }
  if (lined_up(mtmp) && rn2(3)) {
    nomul(0);
    if (mattk.adtyp && mattk.adtyp < 11) {
      if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
        await pline(S("%s zaps you with a %s!"), await Monnam(mtmp), G.flash_types[10 + mattk.adtyp - 1]);
      }
      await buzz(-(10 + mattk.adtyp - 1), mattk.damn, mtmp.mx, mtmp.my, sgn(G.tbx), sgn(G.tby));
    } else {
      await impossible(S("Monster spell %d cast"), mattk.adtyp - 1);
    }
  }
  return 1;
}

export function $init(): void {
}
