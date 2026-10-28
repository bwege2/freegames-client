// @ts-nocheck
// NetHack 3.6.7 explode.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { exercise } from './attrib.ts';
import { isok } from './cmd.ts';
import { curs_on_u, map_invisible, newsym, show_glyph, tmp_at, unmap_invisible } from './display.ts';
import { Monnam, rndmonnam } from './do_name.ts';
import { breaks } from './dothrow.ts';
import { done } from './end.ts';
import { nomul } from './hack.ts';
import { dist2, lowc, s_suffix, strncmpi, strstri } from './hacklib.ts';
import { sobj_at, stackobj } from './invent.ts';
import { obj_extract_self, place_object, splitobj } from './mkobj.ts';
import { golemeffects, hideunder, monkilled, seemimic, setmangry, wake_nearto, xkilled } from './mon.ts';
import { resists_magm, sticks } from './mondata.ts';
import { closed_door } from './monmove.ts';
import { ohitmon, thitu } from './mthrowu.ts';
import { Tobjnam } from './objnam.ts';
import { You, You_hear, impossible, pline, pline_The } from './pline.ts';
import { rehumanize, ugolemeffects } from './polyself.ts';
import { unpunish } from './read.ts';
import { d, rn2, rnd } from './rnd.ts';
import { pay_for_damage } from './shk.ts';
import { burn_away_slime, end_burn } from './timeout.ts';
import { burnarmor, deltrap, t_at } from './trap.ts';
import { dmgval } from './weapon.ts';
import { worm_known } from './worm.ts';
import { break_statue, destroy_item, destroy_mitem, fracture_rock, resist, zap_over_floor } from './zap.ts';
import { struct_nhcoord, struct_obj, struct_scatter_chain } from './structs.ts';
import { $arr, $at2, $peq, $rd, $rows, $sat, $ta, $wr, G, P, S, free, sprintf, strcpy } from './rt/index.ts';
import { ACID_RES, AD_ACID, AD_COLD, AD_DISN, AD_DRST, AD_ELEC, AD_FIRE, AD_MAGM, AD_PHYS, AD_RBRE, ANTIMAGIC, A_STR, BLINDED, BOULDER, BURNING, BURNING_OIL, COLD_RES, DEAF, DETECT_MONSTERS, DIED, DISINT_RES, DISP_BEAM, DISP_CHANGE, DISP_END, EGG, EXPL_FIERY, FALSE, FIRE_RES, GLASS, HALF_PHDAM, HALLUC, HALLUC_RES, INFRAVISION, INVULNERABLE, KILLED_BY, KILLED_BY_AN, LARGEST_INT, MAXPCHARS, MAY_DESTROY, MAY_FRACTURE, MAY_HITMON, MAY_HITYOU, MON_EXPLODE, NO_KILLER_PREFIX, PLNMSG_CAUGHT_IN_EXPLOSION, PLNMSG_TOWER_OF_FLAME, POISON_RES, POOL, POTION_CLASS, RAY, RING_CLASS, SCROLL_CLASS, SEE_INVIS, SHIELD_COUNT, SHOCK_RES, SPBOOK_CLASS, STATUE, STATUE_TRAP, S_GOLEM, S_VORTEX, S_explode1, S_explode2, S_explode3, S_explode4, S_explode5, S_explode6, S_explode7, S_explode8, S_explode9, TELEPAT, TRUE, VIS_EFFECTS, WAND_CLASS, WAN_DIGGING, WAN_MAGIC_MISSILE, WAN_SLEEP, WARN_OF_MON, XKILL_GIVEMSG, XKILL_NOCONDUCT, XKILL_NOCORPSE, XKILL_NOMSG, ZT_SPELL_O_FIRE } from './consts.ts';

let explosion: any;

export async function explode(x: number, y: number, type: number, dam: number, olet: number, expltype: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any, $t11: any, $t12: any, $t13: any, $t14: any;
  let i = 0;
  let j = 0;
  let k = 0;
  let damu = dam;
  let starting = 1;
  let visible = 0;
  let any_shield = 0;
  let uhurt = 0;
  let str = null;
  let idamres = 0;
  let idamnonres = 0;
  let mtmp = null;
  let mdef = null;
  let adtyp = 0;
  let explmask = $arr(3, () => new Int32Array(3));
  const shopdamage = new Int8Array(1);
  shopdamage[0] = FALSE;
  let generic = FALSE;
  let physical_dmg = FALSE;
  let do_hallu = FALSE;
  let inside_engulfer = 0;
  let grabbed = 0;
  let grabbing = 0;
  let grabxy = new struct_nhcoord();
  let hallu_buf = new Int8Array(256);
  let killr_buf = new Int8Array(256);
  let exploding_wand_typ = 0;
  if (olet === WAND_CLASS) {
    if (type < 0) {
      type = -type;
      exploding_wand_typ = type << 16 >> 16;
      if ((G.objects[type].oc_dir | 0) === RAY && type !== WAN_DIGGING && type !== WAN_SLEEP) {
        type -= WAN_MAGIC_MISSILE;
        if (type < 0 || type > 9) {
          await impossible(S("explode: wand has bad zap type (%d)."), type);
          type = 0;
        }
      } else {
        type = 0;
      }
    }
    switch (G.urole.malenum) {
    case 335:
    case 334:
    case 342:
      damu = damu / 5 | 0;
      break;
    case 332:
    case 333:
      damu = damu / 2 | 0;
      break;
    default:
      break;
    }
  }
  if (expltype < 0) {
    mdef = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
    expltype = -expltype;
  }
  inside_engulfer = (G.u.uswallow | 0 && type >= 0 ? 1 : 0) << 24 >> 24;
  grabbed = grabbing = FALSE;
  if (G.u.ustuck && !G.u.uswallow) {
    if (G.u.umonnum !== G.u.umonster && sticks(G.youmonst.data)) {
      grabbing = TRUE;
    } else {
      grabbed = TRUE;
    }
    grabxy.x = G.u.ustuck.mx;
    grabxy.y = G.u.ustuck.my;
  } else {
    grabxy.x = grabxy.y = 0;
  }
  if (olet === MON_EXPLODE) {
    str = strcpy(P(killr_buf), P(G.killer.name));
    do_hallu = (G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) && (strstri(str, S("'s explosion")) || strstri(str, S("s' explosion"))) ? 1 : 0) << 24 >> 24;
    adtyp = AD_PHYS;
  } else {
    switch (Math.abs(type) % 10) {
    case 0:
      str = S("magical blast");
      adtyp = AD_MAGM;
      break;
    case 1:
      str = olet === BURNING_OIL ? S("burning oil") : olet === SCROLL_CLASS ? S("tower of flame") : S("fireball");
      adtyp = AD_FIRE;
      break;
    case 2:
      str = S("ball of cold");
      adtyp = AD_COLD;
      break;
    case 4:
      str = olet === WAND_CLASS ? S("death field") : S("disintegration field");
      adtyp = AD_DISN;
      break;
    case 5:
      str = S("ball of lightning");
      adtyp = AD_ELEC;
      break;
    case 6:
      str = S("poison gas cloud");
      adtyp = AD_DRST;
      break;
    case 7:
      str = S("splash of acid");
      adtyp = AD_ACID;
      break;
    default:
      await impossible(S("explosion base type %d?"), type);
      return;
    }
  }
  any_shield = visible = FALSE;
  for (i = 0; i < 3; ++i) {
    for (j = 0; j < 3; ++j) {
      if (!isok(i + x - 1, j + y - 1)) {
        explmask[i][j] = 2;
        continue;
      } else {
        explmask[i][j] = 0;
      }
      if (i + x - 1 === G.u.ux && j + y - 1 === G.u.uy) {
        switch (adtyp) {
        case 0:
          explmask[i][j] = 0;
          break;
        case 1:
          explmask[i][j] = !!(G.u.uprops[ANTIMAGIC].intrinsic || G.u.uprops[ANTIMAGIC].extrinsic) ? 1 : 0;
          break;
        case 2:
          explmask[i][j] = !!(G.u.uprops[FIRE_RES].intrinsic || G.u.uprops[FIRE_RES].extrinsic) ? 1 : 0;
          break;
        case 3:
          explmask[i][j] = !!(G.u.uprops[COLD_RES].intrinsic || G.u.uprops[COLD_RES].extrinsic) ? 1 : 0;
          break;
        case 5:
          explmask[i][j] = olet === WAND_CLASS ? !!((G.youmonst.data.mflags2 & 2) >>> 0 !== 0 || G.youmonst.data === $sat(G.mons, 49) || (G.youmonst.data.mlet === S_GOLEM || G.youmonst.data.mlet === S_VORTEX) || (G.youmonst.data.mflags2 & 256) >>> 0 !== 0) ? 1 : 0 : !!(G.u.uprops[DISINT_RES].intrinsic || G.u.uprops[DISINT_RES].extrinsic) ? 1 : 0;
          break;
        case 6:
          explmask[i][j] = !!(G.u.uprops[SHOCK_RES].intrinsic || G.u.uprops[SHOCK_RES].extrinsic) ? 1 : 0;
          break;
        case 7:
          explmask[i][j] = !!(G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic) ? 1 : 0;
          break;
        case 8:
          explmask[i][j] = !!(G.u.uprops[ACID_RES].intrinsic || G.u.uprops[ACID_RES].extrinsic) ? 1 : 0;
          physical_dmg = TRUE;
          break;
        default:
          await impossible(S("explosion type %d?"), adtyp);
          break;
        }
      }
      mtmp = !!G.level.monsters[i + x - 1][j + y - 1] ? G.level.monsters[i + x - 1][j + y - 1] : null;
      if (!mtmp && i + x - 1 === G.u.ux && j + y - 1 === G.u.uy) {
        mtmp = G.u.usteed;
      }
      if (mtmp) {
        if (mtmp.mhp < 1) {
          explmask[i][j] = 2;
        } else {
          switch (adtyp) {
          case 0:
            break;
          case 1:
            ($t1 = explmask[i], $t2 = j, $t1[$t2] = $t1[$t2] | resists_magm(mtmp));
            break;
          case 2:
            ($t3 = explmask[i], $t4 = j, $t3[$t4] = $t3[$t4] | (((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0 ? 1 : 0));
            break;
          case 3:
            ($t5 = explmask[i], $t6 = j, $t5[$t6] = $t5[$t6] | (((mtmp.data.mresists | mtmp.mextrinsics) & 2) !== 0 ? 1 : 0));
            break;
          case 5:
            ($t7 = explmask[i], $t8 = j, $t7[$t8] = $t7[$t8] | (olet === WAND_CLASS ? (mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) || (mtmp.data.mflags2 & 256) >>> 0 !== 0 || (mtmp.cham === 222 || mtmp.cham === 223 || mtmp.cham === 224) ? 1 : 0 : ((mtmp.data.mresists | mtmp.mextrinsics) & 8) !== 0 ? 1 : 0));
            break;
          case 6:
            ($t9 = explmask[i], $t10 = j, $t9[$t10] = $t9[$t10] | (((mtmp.data.mresists | mtmp.mextrinsics) & 16) !== 0 ? 1 : 0));
            break;
          case 7:
            ($t11 = explmask[i], $t12 = j, $t11[$t12] = $t11[$t12] | (((mtmp.data.mresists | mtmp.mextrinsics) & 32) !== 0 ? 1 : 0));
            break;
          case 8:
            ($t13 = explmask[i], $t14 = j, $t13[$t14] = $t13[$t14] | (((mtmp.data.mresists | mtmp.mextrinsics) & 64) !== 0 ? 1 : 0));
            break;
          default:
            await impossible(S("explosion type %d?"), adtyp);
            break;
          }
        }
      }
      if (mtmp && $rd(G.viz_array.a[G.viz_array.o + (j + y - 1)], (i + x - 1)) & 2 && !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
        await map_invisible(i + x - 1, j + y - 1);
      } else if (!mtmp) {
        await unmap_invisible(i + x - 1, j + y - 1);
      }
      if ($rd(G.viz_array.a[G.viz_array.o + (j + y - 1)], (i + x - 1)) & 2) {
        visible = TRUE;
      }
      if (explmask[i][j] === 1) {
        any_shield = TRUE;
      }
    }
  }
  if (visible) {
    for (i = 0; i < 3; ++i) {
      for (j = 0; j < 3; ++j) {
        if (explmask[i][j] === 2) {
          continue;
        }
        await tmp_at(starting ? DISP_BEAM : DISP_CHANGE, expltype * 9 + (explosion[i][j] - S_explode1) + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))));
        await tmp_at(i + x - 1, j + y - 1);
        starting = 0;
      }
    }
    await curs_on_u();
    if (any_shield && G.flags.sparkle) {
      for (k = 0; k < SHIELD_COUNT; ++k) {
        for (i = 0; i < 3; ++i) {
          for (j = 0; j < 3; ++j) {
            if (explmask[i][j] === 1) {
              await show_glyph(i + x - 1, j + y - 1, G.shield_static[k] + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0))))))));
            }
          }
        }
        await curs_on_u();
        await G.windowprocs.win_delay_output();
      }
      for (i = 0; i < 3; ++i) {
        for (j = 0; j < 3; ++j) {
          if (explmask[i][j] === 1) {
            await show_glyph(i + x - 1, j + y - 1, expltype * 9 + (explosion[i][j] - S_explode1) + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))));
          }
        }
      }
    } else {
      await G.windowprocs.win_delay_output();
      await G.windowprocs.win_delay_output();
    }
    await tmp_at(DISP_END, 0);
  } else {
    if (olet === MON_EXPLODE) {
      str = S("explosion");
      generic = TRUE;
    }
    if (!(G.u.uprops[DEAF].intrinsic || G.u.uprops[DEAF].extrinsic) && olet !== SCROLL_CLASS) {
      await You_hear(S("a blast."));
    }
  }
  if (dam) {
    for (i = 0; i < 3; ++i) {
      for (j = 0; j < 3; ++j) {
        if (explmask[i][j] === 2) {
          continue;
        }
        if (i + x - 1 === G.u.ux && j + y - 1 === G.u.uy) {
          uhurt = explmask[i][j] === 1 ? 1 : 2;
        } else if (inside_engulfer) {
          continue;
        }
        idamres = idamnonres = 0;
        if (type >= 0 && !G.u.uswallow) {
          await zap_over_floor(i + x - 1 << 24 >> 24, j + y - 1 << 24 >> 24, type, P(shopdamage, 0), exploding_wand_typ);
        }
        mtmp = !!G.level.monsters[i + x - 1][j + y - 1] ? G.level.monsters[i + x - 1][j + y - 1] : null;
        if (!mtmp && i + x - 1 === G.u.ux && j + y - 1 === G.u.uy) {
          mtmp = G.u.usteed;
        }
        if (!mtmp) {
          continue;
        }
        if (do_hallu) {
          do {
            sprintf(P(hallu_buf), S("%s explosion"), s_suffix(await rndmonnam(null)));
          } while ($rd(P(hallu_buf)) !== lowc($rd(P(hallu_buf))));
          str = P(hallu_buf);
        }
        if (G.u.uswallow | 0 && mtmp === G.u.ustuck) {
          let adj = null;
          if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
            switch (adtyp) {
            case 2:
              adj = S("heartburn");
              break;
            case 3:
              adj = S("chilly");
              break;
            case 5:
              if (olet === WAND_CLASS) {
                adj = S("irradiated by pure energy");
              } else {
                adj = S("perforated");
              }
              break;
            case 6:
              adj = S("shocked");
              break;
            case 7:
              adj = S("poisoned");
              break;
            case 8:
              adj = S("an upset stomach");
              break;
            default:
              adj = S("fried");
              break;
            }
            await pline(S("%s gets %s!"), await Monnam(G.u.ustuck), adj);
          } else {
            switch (adtyp) {
            case 2:
              adj = S("toasted");
              break;
            case 3:
              adj = S("chilly");
              break;
            case 5:
              if (olet === WAND_CLASS) {
                adj = S("overwhelmed by pure energy");
              } else {
                adj = S("perforated");
              }
              break;
            case 6:
              adj = S("shocked");
              break;
            case 7:
              adj = S("intoxicated");
              break;
            case 8:
              adj = S("burned");
              break;
            default:
              adj = S("fried");
              break;
            }
            await pline(S("%s gets slightly %s!"), await Monnam(G.u.ustuck), adj);
          }
        } else if ($rd(G.viz_array.a[G.viz_array.o + (j + y - 1)], (i + x - 1)) & 2) {
          if (mtmp.m_ap_type) {
            await seemimic(mtmp);
          }
          await pline(S("%s is caught in the %s!"), await Monnam(mtmp), str);
        }
        idamres += await destroy_mitem(mtmp, SCROLL_CLASS, adtyp);
        idamres += await destroy_mitem(mtmp, SPBOOK_CLASS, adtyp);
        idamnonres += await destroy_mitem(mtmp, POTION_CLASS, adtyp);
        idamnonres += await destroy_mitem(mtmp, WAND_CLASS, adtyp);
        idamnonres += await destroy_mitem(mtmp, RING_CLASS, adtyp);
        if (explmask[i][j] === 1) {
          await golemeffects(mtmp, adtyp, dam + idamres);
          mtmp.mhp -= idamnonres;
        } else {
          let mdam = dam;
          if (await resist(mtmp, olet, 0, FALSE)) {
            if ($rd(G.viz_array.a[G.viz_array.o + (j + y - 1)], (i + x - 1)) & 2 || inside_engulfer) {
              await pline(S("%s resists the %s!"), await Monnam(mtmp), str);
            }
            mdam = (dam + 1) / 2 | 0;
          }
          if (grabbed && mtmp === G.u.ustuck && dist2(x, y, G.u.ux, G.u.uy) <= 2) {
            mdam = mdam * 2;
          }
          if (((mtmp.data.mresists | mtmp.mextrinsics) & 2) !== 0 && adtyp === AD_FIRE) {
            mdam = mdam * 2;
          } else if (((mtmp.data.mresists | mtmp.mextrinsics) & 1) !== 0 && adtyp === AD_COLD) {
            mdam = mdam * 2;
          }
          mtmp.mhp -= mdam;
          mtmp.mhp -= idamres + idamnonres;
        }
        if (mtmp.mhp < 1) {
          let xkflg = adtyp === AD_FIRE && (mtmp.data === $sat(G.mons, 246) || mtmp.data === $sat(G.mons, 245)) ? XKILL_NOCORPSE : 0;
          if (!G.context.mon_moving) {
            await xkilled(mtmp, XKILL_GIVEMSG | xkflg);
          } else if (mdef && mtmp === mdef) {
            if ($rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
              await pline(S("%s is %s!"), await Monnam(mtmp), xkflg ? S("burned completely") : (mtmp.data.mflags2 & 2) >>> 0 !== 0 || mtmp.data === $sat(G.mons, 49) || (mtmp.data.mlet === S_GOLEM || mtmp.data.mlet === S_VORTEX) ? S("destroyed") : S("killed"));
            }
            await xkilled(mtmp, XKILL_NOMSG | XKILL_NOCONDUCT | xkflg);
          } else {
            if (xkflg) {
              adtyp = AD_RBRE;
            }
            await monkilled(mtmp, S(""), adtyp);
          }
        } else if (!G.context.mon_moving) {
          await setmangry(mtmp, TRUE);
        }
      }
    }
  }
  if (uhurt) {
    if (G.flags.verbose && (type < 0 || olet !== SCROLL_CLASS)) {
      if (do_hallu) {
        do {
          sprintf(P(hallu_buf), S("%s explosion"), s_suffix(await rndmonnam(null)));
        } while ($rd(P(hallu_buf)) !== lowc($rd(P(hallu_buf))));
        str = P(hallu_buf);
      }
      await You(S("are caught in the %s!"), str);
      G.iflags.last_msg = PLNMSG_CAUGHT_IN_EXPLOSION;
    }
    if (adtyp === AD_FIRE) {
      await burn_away_slime();
    }
    if (G.u.uprops[INVULNERABLE].intrinsic) {
      damu = 0;
      await You(S("are unharmed!"));
    } else if (adtyp === AD_PHYS || physical_dmg) {
      damu = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (damu + 1) / 2 | 0 : damu;
    }
    if (adtyp === AD_FIRE) {
      await burnarmor(G.youmonst);
    }
    await destroy_item(SCROLL_CLASS, adtyp);
    await destroy_item(SPBOOK_CLASS, adtyp);
    await destroy_item(POTION_CLASS, adtyp);
    await destroy_item(RING_CLASS, adtyp);
    await destroy_item(WAND_CLASS, adtyp);
    await ugolemeffects(adtyp, damu);
    if (uhurt === 2) {
      if (grabbing && dist2(grabxy.x, grabxy.y, x, y) <= 2) {
        damu = damu * 2;
      }
      if (G.u.umonnum !== G.u.umonster) {
        G.u.mh -= damu;
      } else {
        G.u.uhp -= damu;
      }
      G.context.botl = 1;
    }
    if (G.u.uhp <= 0 || G.u.umonnum !== G.u.umonster && G.u.mh <= 0) {
      if (G.u.umonnum !== G.u.umonster) {
        await rehumanize();
      } else {
        if (olet === MON_EXPLODE) {
          if (generic) {
            ;
          } else if (!$peq(str, P(G.killer.name)) && !$peq(str, P(hallu_buf))) {
            strcpy(P(G.killer.name), str);
          }
          G.killer.format = KILLED_BY_AN;
        } else if (type >= 0 && olet !== SCROLL_CLASS) {
          G.killer.format = NO_KILLER_PREFIX;
          sprintf(P(G.killer.name), S("caught %sself in %s own %s"), G.genders[G.flags.female ? 1 : 0].him, G.genders[G.flags.female ? 1 : 0].his, str);
        } else {
          G.killer.format = !strncmpi(str, S("tower of flame"), -1) || !strncmpi(str, S("fireball"), -1) ? KILLED_BY_AN : KILLED_BY;
          strcpy(P(G.killer.name), str);
        }
        if (G.iflags.last_msg === PLNMSG_CAUGHT_IN_EXPLOSION || G.iflags.last_msg === PLNMSG_TOWER_OF_FLAME) {
          await pline(S("It is fatal."));
        } else {
          await pline_The(S("%s is fatal."), str);
        }
        await done(adtyp === AD_FIRE ? BURNING : DIED);
      }
    }
    await exercise(A_STR, FALSE);
  }
  if (shopdamage[0]) {
    await pay_for_damage(adtyp === AD_FIRE ? S("burn away") : adtyp === AD_COLD ? S("shatter") : adtyp === AD_DISN ? S("disintegrate") : S("destroy"), FALSE);
  }
  i = Math.imul(dam, dam);
  if (i < 50) {
    i = 50;
  }
  if (inside_engulfer) {
    i = (i + 3) / 4 | 0;
  }
  wake_nearto(x, y, i);
}

export async function scatter(sx: number, sy: number, blastforce: number, scflags: number, obj: struct_obj | null): Promise<number> {
  let otmp = null;
  let tmp = 0;
  let farthest = 0;
  let typ = 0;
  let qtmp = 0;
  let used_up = 0;
  let individual_object = (obj ? TRUE : FALSE) << 24 >> 24;
  let mtmp = null;
  let stmp = null;
  let stmp2 = null;
  let schain = null;
  let total = 0;
  if (individual_object && (obj.ox !== sx || obj.oy !== sy)) {
    await impossible(S("scattered object <%d,%d> not at scatter site <%d,%d>"), obj.ox, obj.oy, sx, sy);
  }
  while (!!(otmp = individual_object ? obj : G.level.objects[sx][sy])) {
    if (otmp === G.uball || otmp === G.uchain) {
      let waschain = (otmp === G.uchain ? 1 : 0) << 24 >> 24;
      await pline_The(S("chain shatters!"));
      await unpunish();
      if (waschain) {
        continue;
      }
    }
    if (otmp.quan > 1) {
      qtmp = otmp.quan - 1;
      if (qtmp > LARGEST_INT) {
        qtmp = LARGEST_INT;
      }
      qtmp = rnd(qtmp | 0);
      otmp = await splitobj(otmp, qtmp);
    } else {
      obj = null;
    }
    await obj_extract_self(otmp);
    used_up = FALSE;
    if ((scflags & MAY_FRACTURE) >>> 0 !== 0 && (otmp.otyp === BOULDER || otmp.otyp === STATUE) && rn2(10)) {
      if (otmp.otyp === BOULDER) {
        if ($rd(G.viz_array.a[G.viz_array.o + sy], sx) & 2) {
          await pline(S("%s apart."), await Tobjnam(otmp, S("break")));
        } else {
          await You_hear(S("stone breaking."));
        }
        await fracture_rock(otmp);
        await place_object(otmp, sx, sy);
        if (!!(otmp = sobj_at(BOULDER, sx, sy))) {
          await obj_extract_self(otmp);
          await place_object(otmp, sx, sy);
        }
      } else {
        let trap = null;
        if ((trap = t_at(sx, sy)) && (trap.ttyp | 0) === STATUE_TRAP) {
          await deltrap(trap);
        }
        if ($rd(G.viz_array.a[G.viz_array.o + sy], sx) & 2) {
          await pline(S("%s."), await Tobjnam(otmp, S("crumble")));
        } else {
          await You_hear(S("stone crumbling."));
        }
        await break_statue(otmp);
        await place_object(otmp, sx, sy);
      }
      await newsym(sx, sy);
      used_up = TRUE;
    } else if ((scflags & MAY_DESTROY) >>> 0 !== 0 && (!rn2(10) || ((G.objects[otmp.otyp].oc_material | 0) === GLASS || otmp.otyp === EGG))) {
      if (await breaks(otmp, sx << 24 >> 24, sy << 24 >> 24)) {
        used_up = TRUE;
      }
    }
    if (!used_up) {
      stmp = new struct_scatter_chain();
      stmp.next = null;
      stmp.obj = otmp;
      stmp.ox = sx << 24 >> 24;
      stmp.oy = sy << 24 >> 24;
      tmp = rn2(8);
      stmp.dx = G.xdir[tmp];
      stmp.dy = G.ydir[tmp];
      tmp = (blastforce >>> 0) - (otmp.owt / 40 >>> 0) >>> 0 | 0;
      if (tmp < 1) {
        tmp = 1;
      }
      stmp.range = rnd(tmp);
      if (farthest < stmp.range) {
        farthest = stmp.range;
      }
      stmp.stopped = FALSE;
      if (!schain) {
        schain = stmp;
      } else {
        stmp2.next = stmp;
      }
      stmp2 = stmp;
    }
  }
  while (farthest-- > 0) {
    for (stmp = schain; stmp; stmp = stmp.next) {
      if (stmp.range-- > 0 && !stmp.stopped) {
        G.bhitpos.x = stmp.ox + stmp.dx << 24 >> 24;
        G.bhitpos.y = stmp.oy + stmp.dy << 24 >> 24;
        typ = $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ & 0xff;
        if (!isok(G.bhitpos.x, G.bhitpos.y)) {
          G.bhitpos.x = G.bhitpos.x - stmp.dx << 24 >> 24;
          G.bhitpos.y = G.bhitpos.y - stmp.dy << 24 >> 24;
          stmp.stopped = TRUE;
        } else if (!(typ >= POOL) || closed_door(G.bhitpos.x, G.bhitpos.y)) {
          G.bhitpos.x = G.bhitpos.x - stmp.dx << 24 >> 24;
          G.bhitpos.y = G.bhitpos.y - stmp.dy << 24 >> 24;
          stmp.stopped = TRUE;
        } else if (!!(mtmp = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null)) {
          if ((scflags & MAY_HITMON) >>> 0) {
            --stmp.range;
            if (await ohitmon(mtmp, stmp.obj, 1, FALSE)) {
              stmp.obj = null;
              stmp.stopped = TRUE;
            }
          }
        } else if (G.bhitpos.x === G.u.ux && G.bhitpos.y === G.u.uy) {
          if ((scflags & MAY_HITYOU) >>> 0) {
            let hitvalu = 0;
            let hitu = 0;
            if (G.multi) {
              nomul(0);
            }
            hitvalu = 8 + stmp.obj.spe;
            if (G.youmonst.data.msize >= 3) {
              ++hitvalu;
            }
            hitu = await thitu(hitvalu, await dmgval(stmp.obj, G.youmonst), P(stmp, "obj"), null);
            if (!stmp.obj) {
              stmp.stopped = TRUE;
            }
            if (hitu) {
              stmp.range -= 3;
              await stop_occupation();
            }
          }
        } else {
          if ((scflags & VIS_EFFECTS) >>> 0) {
          }
        }
        stmp.ox = G.bhitpos.x;
        stmp.oy = G.bhitpos.y;
      }
    }
  }
  for (stmp = schain; stmp; stmp = stmp2) {
    let x = 0;
    let y = 0;
    stmp2 = stmp.next;
    x = stmp.ox;
    y = stmp.oy;
    if (stmp.obj) {
      if (x !== sx || y !== sy) {
        total += stmp.obj.quan;
      }
      await place_object(stmp.obj, x, y);
      await stackobj(stmp.obj);
    }
    free(stmp);
    await newsym(x, y);
  }
  await newsym(sx, sy);
  if (sx === G.u.ux && sy === G.u.uy && G.u.uundetected | 0 && (G.youmonst.data.mflags1 & 128) >>> 0 !== 0) {
    hideunder(G.youmonst);
  }
  return total;
}

export async function splatter_burning_oil(x: number, y: number, diluted_oil: number): Promise<void> {
  let dmg = d(diluted_oil ? 3 : 4, 4);
  await explode(x, y, ZT_SPELL_O_FIRE, dmg, BURNING_OIL, EXPL_FIERY);
}

export async function explode_oil(obj: struct_obj | null, x: number, y: number): Promise<void> {
  let diluted_oil = obj.oeroded << 24 >> 24;
  if (!obj.lamplit) {
    await impossible(S("exploding unlit oil"));
  }
  await end_burn(obj, TRUE);
  await splatter_burning_oil(x, y, diluted_oil);
}

export function $init(): void {
  explosion = $rows([$ta(Int32Array, 3, [S_explode1, S_explode4, S_explode7]), $ta(Int32Array, 3, [S_explode2, S_explode5, S_explode8]), $ta(Int32Array, 3, [S_explode3, S_explode6, S_explode9])]);
}
