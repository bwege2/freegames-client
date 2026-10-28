// @ts-nocheck
// NetHack 3.6.7 minion.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { acurr } from './attrib.ts';
import { newsym } from './display.ts';
import { Amonnam, Monnam, mon_nam } from './do_name.ts';
import { In_hell } from './dungeon.ts';
import { Hear_again, is_fainted, reset_faint } from './eat.ts';
import { panic } from './end.ts';
import { money_cnt, nomul, unmul } from './hack.ts';
import { dist2, s_suffix, sgn } from './hacklib.ts';
import { currency } from './invent.ts';
import { makemon, mkclass, mkclass_aligned, mongets, newmextra, set_malign } from './makemon.ts';
import { bless, mksobj } from './mkobj.ts';
import { mongone } from './mon.ts';
import { monsndx } from './mondata.ts';
import { You, You_feel, impossible, pline, pline_The, verbalize } from './pline.ts';
import { align_gname } from './pray.ts';
import { mk_roamer, mon_aligntyp } from './priest.ts';
import { d, rn2, rnd } from './rnd.ts';
import { money2mon } from './shk.ts';
import { mpickobj } from './steal.ts';
import { enexto, rloc, tele_restrict } from './teleport.ts';
import { select_hwep } from './weapon.ts';
import { mon_has_amulet } from './wizard.ts';
import { worm_known } from './worm.ts';
import { m_dowear, which_armor } from './worn.ts';
import { struct_emin, struct_monst, struct_nhcoord } from './structs.ts';
import { $rd, $sat, $wr, G, P, S, free, memset, sscanf } from './rt/index.ts';
import { AMULET_OF_REFLECTION, ART_DEMONBANE, ART_EXCALIBUR, A_CHA, A_NONE, BLINDED, CONFLICT, DEAF, DETECT_MONSTERS, FALSE, G_GONE, G_UNIQ, INFRAVISION, MM_EMIN, NON_PM, NO_MM_FLAGS, PM_AIR_ELEMENTAL, PM_ALIGNED_PRIEST, PM_ANGEL, PM_ARCHON, PM_GUARD, PM_HIGH_PRIEST, PM_SHOPKEEPER, PM_WIZARD_OF_YENDOR, SEE_INVIS, SHIELD_OF_REFLECTION, SILVER_SABER, STRAT_APPEARMSG, S_ANGEL, S_DEMON, TELEPAT, TRUE, WARN_OF_MON, W_ARMS } from './consts.ts';


export async function newemin(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mextra) {
    mtmp.mextra = await newmextra();
  }
  if (!mtmp.mextra.emin) {
    mtmp.mextra.emin = new struct_emin();
    memset(mtmp.mextra.emin, 0, 2);
  }
}

export function free_emin(mtmp: struct_monst | null): void {
  if (mtmp.mextra && mtmp.mextra.emin) {
    free(mtmp.mextra.emin);
    mtmp.mextra.emin = null;
  }
  mtmp.isminion = 0;
}

export function monster_census(spotted: number): number {
  let mtmp = null;
  let count = 0;
  for (mtmp = G.level.monlist; mtmp; mtmp = mtmp.nmon) {
    if (mtmp.mhp < 1) {
      continue;
    }
    if (spotted && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      continue;
    }
    ++count;
  }
  return count;
}

export async function msummon(mon: struct_monst | null): Promise<number> {
  let ptr = null;
  let dtype = NON_PM;
  let cnt = 0;
  let result = 0;
  let census = 0;
  let atyp = 0;
  let mtmp = null;
  if (mon) {
    ptr = mon.data;
    if (G.uwep && G.uwep.oartifact === ART_DEMONBANE && (ptr.mflags2 & 256) >>> 0 !== 0) {
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) {
        await pline(S("%s looks puzzled for a moment."), await Monnam(mon));
      }
      return 0;
    }
    atyp = (mon.ispriest | 0 ? mon.mextra.epri.shralign : mon.isminion | 0 ? mon.mextra.emin.min_align : ptr.maligntyp === A_NONE ? A_NONE : sgn(ptr.maligntyp)) << 24 >> 24;
  } else {
    ptr = $sat(G.mons, PM_WIZARD_OF_YENDOR);
    atyp = (ptr.maligntyp === A_NONE ? A_NONE : sgn(ptr.maligntyp)) << 24 >> 24;
  }
  if ((ptr.mflags2 & 256) >>> 0 !== 0 && (ptr.mflags2 & 2048) >>> 0 !== 0 || ptr === $sat(G.mons, PM_WIZARD_OF_YENDOR)) {
    dtype = !rn2(20) ? await dprince(atyp) : !rn2(4) ? await dlord(atyp) : await ndemon(atyp);
    cnt = dtype !== NON_PM && !rn2(4) && (($sat(G.mons, dtype).mflags2 & 256) >>> 0 !== 0 && ($sat(G.mons, dtype).mflags2 & (1024 | 2048)) >>> 0 === 0) ? 2 : 1;
  } else if ((ptr.mflags2 & 256) >>> 0 !== 0 && (ptr.mflags2 & 1024) >>> 0 !== 0) {
    dtype = !rn2(50) ? await dprince(atyp) : !rn2(20) ? await dlord(atyp) : await ndemon(atyp);
    cnt = dtype !== NON_PM && !rn2(4) && (($sat(G.mons, dtype).mflags2 & 256) >>> 0 !== 0 && ($sat(G.mons, dtype).mflags2 & (1024 | 2048)) >>> 0 === 0) ? 2 : 1;
  } else if ((ptr.mflags2 & 256) >>> 0 !== 0 && (ptr.mflags2 & (1024 | 2048)) >>> 0 === 0) {
    dtype = !rn2(20) ? await dlord(atyp) : !rn2(6) ? await ndemon(atyp) : await monsndx(ptr);
    cnt = 1;
  } else if ((mon.data.mflags2 & 4096) >>> 0 !== 0 && mon_aligntyp(mon) === 1) {
    dtype = (ptr.mflags2 & 1024) >>> 0 !== 0 && !rn2(20) ? await llord() : (ptr.mflags2 & 1024) >>> 0 !== 0 || !rn2(6) ? await lminion() : await monsndx(ptr);
    cnt = dtype !== NON_PM && !rn2(4) && !(($sat(G.mons, dtype).mflags2 & 1024) >>> 0 !== 0) ? 2 : 1;
  } else if (ptr === $sat(G.mons, PM_ANGEL)) {
    if (!rn2(6)) {
      switch (atyp) {
      case 0:
        dtype = PM_AIR_ELEMENTAL + rn2(4);
        break;
      case -1:
      case -128:
        dtype = await ndemon(atyp);
        break;
      }
    } else {
      dtype = PM_ANGEL;
    }
    cnt = dtype !== NON_PM && !rn2(4) && !(($sat(G.mons, dtype).mflags2 & 1024) >>> 0 !== 0) ? 2 : 1;
  }
  if (dtype === NON_PM) {
    return 0;
  }
  if (cnt > 1 && G.mons[dtype].geno & G_UNIQ) {
    cnt = 1;
  }
  if (G.mvitals[dtype].mvflags & G_GONE) {
    dtype = await ndemon(atyp);
    if (dtype === NON_PM) {
      return 0;
    }
  }
  census = monster_census(FALSE);
  while (cnt > 0) {
    mtmp = await makemon($sat(G.mons, dtype), G.u.ux, G.u.uy, MM_EMIN);
    if (mtmp) {
      ++result;
      if (dtype === PM_ANGEL) {
        mtmp.isminion = 1;
        mtmp.mextra.emin.min_align = atyp;
        mtmp.mextra.emin.renegade = ((atyp !== G.u.ualign.type ? 1 : 0) ^ (!mtmp.mpeaceful ? 1 : 0)) << 24 >> 24;
      }
      if ((ptr.mflags2 & 256) >>> 0 !== 0 && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected))) {
        await pline(S("%s appears in a cloud of smoke!"), await Amonnam(mtmp));
      }
    }
    --cnt;
  }
  if (result) {
    result = monster_census(FALSE) - census;
  }
  return result;
}

export async function summon_minion(alignment: number, talk: number): Promise<void> {
  let mon = null;
  let mnum = 0;
  switch (alignment) {
  case 1:
    mnum = await lminion();
    break;
  case 0:
    mnum = PM_AIR_ELEMENTAL + rn2(4);
    break;
  case -1:
  case -128:
    mnum = await ndemon(alignment);
    break;
  default:
    await impossible(S("unaligned player?"));
    mnum = await ndemon(A_NONE);
    break;
  }
  if (mnum === NON_PM) {
    mon = null;
  } else if (mnum === PM_ANGEL) {
    mon = await makemon($sat(G.mons, mnum), G.u.ux, G.u.uy, MM_EMIN);
    if (mon) {
      mon.isminion = 1;
      mon.mextra.emin.min_align = alignment;
      mon.mextra.emin.renegade = FALSE;
    }
  } else if (mnum !== PM_SHOPKEEPER && mnum !== PM_GUARD && mnum !== PM_ALIGNED_PRIEST && mnum !== PM_HIGH_PRIEST) {
    mon = await makemon($sat(G.mons, mnum), G.u.ux, G.u.uy, MM_EMIN);
    if (mon) {
      mon.isminion = 1;
      mon.mextra.emin.min_align = alignment;
      mon.mextra.emin.renegade = FALSE;
    }
  } else {
    mon = await makemon($sat(G.mons, mnum), G.u.ux, G.u.uy, NO_MM_FLAGS);
  }
  if (mon) {
    if (talk) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await pline_The(S("voice of %s booms:"), await align_gname(alignment));
      } else {
        await You_feel(S("%s booming voice:"), s_suffix(await align_gname(alignment)));
      }
      await verbalize(S("Thou shalt pay for thine indiscretion!"));
      if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
        await pline(S("%s appears before you."), await Amonnam(mon));
      }
      mon.mstrategy = (mon.mstrategy & ~STRAT_APPEARMSG >>> 0) >>> 0;
    }
    mon.mpeaceful = (FALSE) & 1;
  }
}

export async function demon_talk(mtmp: struct_monst | null): Promise<number> {
  let cash = 0;
  let demand = 0;
  let offer = 0;
  if (G.uwep && G.uwep.oartifact === ART_EXCALIBUR) {
    await pline(S("%s looks very angry."), await Amonnam(mtmp));
    mtmp.mpeaceful = ((mtmp.mtame = 0) >>> 0) & 1;
    set_malign(mtmp);
    await newsym(mtmp.mx, mtmp.my);
    return 0;
  }
  if (is_fainted()) {
    await reset_faint();
  } else {
    await stop_occupation();
    if (G.multi > 0) {
      nomul(0);
      await unmul(null);
    }
  }
  if ((mtmp.data.mflags2 & 256) >>> 0 !== 0 && (mtmp.data.mflags2 & 2048) >>> 0 !== 0 && mtmp.minvis | 0) {
    let wasunseen = (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? 1 : 0) << 24 >> 24;
    mtmp.minvis = (mtmp.perminvis = 0) & 1;
    if (wasunseen && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
      await pline(S("%s appears before you."), await Amonnam(mtmp));
      mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_APPEARMSG >>> 0) >>> 0;
    }
    await newsym(mtmp.mx, mtmp.my);
  }
  if (G.youmonst.data.mlet === S_DEMON) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s says, \"Good hunting, %s.\""), await Amonnam(mtmp), G.flags.female ? S("Sister") : S("Brother"));
    } else if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline(S("%s says something."), await Amonnam(mtmp));
    }
    if (!await tele_restrict(mtmp)) {
      await rloc(mtmp, TRUE);
    }
    return 1;
  }
  cash = money_cnt(G.invent);
  demand = Math.trunc(cash * (rnd(80) + 20 * (In_hell(G.u.uz) && mtmp.cham === -1 ? 1 : 0)) / (100 * (1 + (sgn(G.u.ualign.type) === sgn(mtmp.data.maligntyp) ? 1 : 0))));
  if (!demand || G.multi < 0) {
    mtmp.mpeaceful = 0;
    set_malign(mtmp);
    return 0;
  } else {
    if (mon_has_amulet(mtmp) || (G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      demand = cash + (rn2(1000) + 125);
    }
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("%s demands %ld %s for safe passage."), await Amonnam(mtmp), demand, await currency(demand));
    } else if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline(S("%s seems to be demanding something."), await Amonnam(mtmp));
    }
    offer = 0;
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && (offer = await bribe(mtmp)) >= demand) {
      await pline(S("%s vanishes, laughing about cowardly mortals."), await Amonnam(mtmp));
    } else if (offer > 0 && rnd(5 * acurr(A_CHA)) > demand - offer) {
      await pline(S("%s scowls at you menacingly, then vanishes."), await Amonnam(mtmp));
    } else {
      await pline(S("%s gets angry..."), await Amonnam(mtmp));
      mtmp.mpeaceful = 0;
      set_malign(mtmp);
      return 0;
    }
  }
  await mongone(mtmp);
  return 1;
}

export async function bribe(mtmp: struct_monst | null): Promise<number> {
  let buf = new Int8Array(256);
  const offer = new Float64Array(1);
  let umoney = money_cnt(G.invent);
  await G.windowprocs.win_getlin(S("How much will you offer?"), P(buf));
  if (sscanf(P(buf), S("%ld"), P(offer, 0)) !== 1) {
    offer[0] = 0;
  }
  if (offer[0] < 0) {
    await You(S("try to shortchange %s, but fumble."), await mon_nam(mtmp));
    return 0;
  } else if (offer[0] === 0) {
    await You(S("refuse."));
    return 0;
  } else if (offer[0] >= umoney) {
    await You(S("give %s all your gold."), await mon_nam(mtmp));
    offer[0] = umoney;
  } else {
    await You(S("give %s %ld %s."), await mon_nam(mtmp), offer[0], await currency(offer[0]));
  }
  await money2mon(mtmp, offer[0]);
  G.context.botl = 1;
  return offer[0];
}

export async function dprince(atyp: number): Promise<number> {
  let tryct = 0;
  let pm = 0;
  for (tryct = !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) ? 20 : 0; tryct > 0; --tryct) {
    pm = rn2(307 + 1 - 302) + 302;
    if (!(G.mvitals[pm].mvflags & G_GONE) && (atyp === A_NONE || sgn(G.mons[pm].maligntyp) === sgn(atyp))) {
      return pm;
    }
  }
  return await dlord(atyp);
}

export async function dlord(atyp: number): Promise<number> {
  let tryct = 0;
  let pm = 0;
  for (tryct = !(G.u.uz.dnum === G.dungeon_topology.d_astral_level.dnum) ? 20 : 0; tryct > 0; --tryct) {
    pm = rn2(301 + 1 - 300) + 300;
    if (!(G.mvitals[pm].mvflags & G_GONE) && (atyp === A_NONE || sgn(G.mons[pm].maligntyp) === sgn(atyp))) {
      return pm;
    }
  }
  return await ndemon(atyp);
}

export async function llord(): Promise<number> {
  if (!(G.mvitals[PM_ARCHON].mvflags & G_GONE)) {
    return PM_ARCHON;
  }
  return await lminion();
}

export async function lminion(): Promise<number> {
  let tryct = 0;
  let ptr = null;
  for (tryct = 0; tryct < 20; ++tryct) {
    ptr = await mkclass(S_ANGEL, 0);
    if (ptr && !((ptr.mflags2 & 1024) >>> 0 !== 0)) {
      return await monsndx(ptr);
    }
  }
  return NON_PM;
}

export async function ndemon(atyp: number): Promise<number> {
  let ptr = null;
  ptr = await mkclass_aligned(S_DEMON, 0, atyp);
  return ptr && ((ptr.mflags2 & 256) >>> 0 !== 0 && (ptr.mflags2 & (1024 | 2048)) >>> 0 === 0) ? await monsndx(ptr) : NON_PM;
}

export async function lose_guardian_angel(mon: struct_monst | null): Promise<void> {
  let mm = new struct_nhcoord();
  let i = 0;
  if (mon) {
    if ((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data))) {
      if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
        await pline(S("%s rebukes you, saying:"), await Monnam(mon));
        await verbalize(S("Since you desire conflict, have some more!"));
      } else {
        await pline(S("%s vanishes!"), await Monnam(mon));
      }
    }
    await mongone(mon);
  }
  for (i = rn2(3) + 2; i > 0; --i) {
    mm.x = G.u.ux;
    mm.y = G.u.uy;
    if (await enexto(mm, mm.x, mm.y, $sat(G.mons, PM_ANGEL))) {
      await mk_roamer($sat(G.mons, PM_ANGEL), G.u.ualign.type, mm.x, mm.y, FALSE);
    }
  }
}

export async function gain_guardian_angel(): Promise<void> {
  let mtmp = null;
  let otmp = null;
  let mm = new struct_nhcoord();
  await Hear_again();
  if (G.u.uprops[CONFLICT].intrinsic || G.u.uprops[CONFLICT].extrinsic) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("A voice booms:"));
    } else {
      await You_feel(S("a booming voice:"));
    }
    await verbalize(S("Thy desire for conflict shall be fulfilled!"));
    await lose_guardian_angel(null);
  } else if (G.u.ualign.record > 8) {
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic)) {
      await pline(S("A voice whispers:"));
    } else {
      await You_feel(S("a soft voice:"));
    }
    await verbalize(S("Thou hast been worthy of me!"));
    mm.x = G.u.ux;
    mm.y = G.u.uy;
    if (await enexto(mm, mm.x, mm.y, $sat(G.mons, PM_ANGEL)) && !!(mtmp = await mk_roamer($sat(G.mons, PM_ANGEL), G.u.ualign.type, mm.x, mm.y, TRUE))) {
      mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_APPEARMSG >>> 0) >>> 0;
      mtmp.mtame = 10;
      await newsym(mtmp.mx, mtmp.my);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("An angel appears near you."));
      } else {
        await You_feel(S("the presence of a friendly angel near you."));
      }
      mtmp.m_lev = rn2(8) + 15 & 0xff;
      mtmp.mhp = mtmp.mhpmax = d(mtmp.m_lev, 10) + 30 + rnd(30);
      if (!(otmp = await select_hwep(mtmp))) {
        otmp = await mksobj(SILVER_SABER, FALSE, FALSE);
        if (await mpickobj(mtmp, otmp)) {
          await panic(S("merged weapon?"));
        }
      }
      await bless(otmp);
      if (otmp.spe < 4) {
        otmp.spe = otmp.spe + rnd(4) << 24 >> 24;
      }
      if (!(otmp = await which_armor(mtmp, W_ARMS)) || otmp.otyp !== SHIELD_OF_REFLECTION) {
        await mongets(mtmp, AMULET_OF_REFLECTION);
        await m_dowear(mtmp, TRUE);
      }
    }
  }
}

export function $init(): void {
}
