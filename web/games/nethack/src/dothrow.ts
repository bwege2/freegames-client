// @ts-nocheck
// NetHack 3.6.7 dothrow.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { snuff_candle } from './apply.ts';
import { artifact_hit, spec_abon } from './artifact.ts';
import { acurr, acurrstr, change_luck, exercise } from './attrib.ts';
import { drag_ball, drop_ball, move_bc } from './ball.ts';
import { getdir, isok } from './cmd.ts';
import { is_lava, is_moat, is_pool } from './dbridge.ts';
import { flush_screen, glyph_at, map_invisible, newsym, tmp_at } from './display.ts';
import { canletgo, doaltarobj, dropy, dropz, flooreffects, obj_no_longer_held } from './do.ts';
import { Monnam, a_monnam, hliquid, mon_nam, rndmonnam } from './do_name.ts';
import { dogfood, tamedog } from './dog.ts';
import { container_impact_dmg, ghitm, ship_object } from './dokick.ts';
import { has_ceiling, on_level, u_on_newpos } from './dungeon.ts';
import { done } from './end.ts';
import { ceiling, surface, u_wipe_engr } from './engrave.ts';
import { explode_oil } from './explode.ts';
import { bad_rock, calc_capacity, check_capacity, in_rooms, inv_weight, losehp, may_passwall, nomul, switch_terrain, weight_cap } from './hack.ts';
import { dist2, distmin, ordin, s_suffix, sgn } from './hacklib.ts';
import { addinv, delobj, freeinv, getobj, prinv, sobj_at, stackobj } from './invent.ts';
import { obj_sheds_light } from './light.ts';
import { makemon, set_malign } from './makemon.ts';
import { add_to_minv, place_object, splitobj, unsplitobj } from './mkobj.ts';
import { monnear, setmangry, wake_nearto, wakeup } from './mon.ts';
import { can_blnd, monsndx, poly_when_stoned, pronoun_gender } from './mondata.ts';
import { closed_door, set_apparxy } from './monmove.ts';
import { An, Doname2, The, Tobjnam, an, corpse_xname, helm_simple_name, killer_xname, makeplural, mshot_xname, otense, singular, the, vtense, xname } from './objnam.ts';
import { encumber_msg } from './pickup.ts';
import { Norep, You, You_cant, You_feel, You_hear, Your, impossible, pline, pline_The } from './pline.ts';
import { body_part, polymon } from './polyself.ts';
import { make_blinded, potionbreathe, potionhit } from './potion.ts';
import { finish_quest } from './quest.ts';
import { is_quest_artifact } from './questpgr.ts';
import { in_out_region, m_in_out_region } from './region.ts';
import { rn2, rnd, rnl } from './rnd.ts';
import { costly_spot, hot_pursuit, inside_shop, is_unpaid, make_angry_shk, obfree, sellobj, shop_keeper, stolen_value, subfrombill } from './shk.ts';
import { mpickobj, remove_worn_item } from './steal.ts';
import { place_monster } from './steed.ts';
import { goodpos, rloc, tele_restrict } from './teleport.ts';
import { dotrap, drown, instapetrify, minstapetrify, mintrap, sokoban_guilt, t_at } from './trap.ts';
import { hmon, passive_obj } from './uhitm.ts';
import { vision_recalc } from './vision.ts';
import { dmgval, dry_a_towel, hitval, weapon_hit_bonus, weapon_type } from './weapon.ts';
import { setuqwep, setuwep, welded, weldmsg } from './wield.ts';
import { cutworm, worm_known } from './worm.ts';
import { find_mac, setworn } from './worn.ts';
import { bhit, boomhit, miss, obj_resists } from './zap.ts';
import { struct_monst, struct_nhcoord, struct_obj } from './structs.ts';
import { $at2, $cs, $rd, $sat, $ta, $u64, $wr, G, P, S, rn2_on_display_rng, sprintf, strcat, strchr, strcmp, strcpy } from './rt/index.ts';
import { ACCFOOD, ACID_VENOM, AIR, AKLYS, ALLOW_COUNT, ALL_CLASSES, ALTAR, ARM, ART_MJOLLNIR, AT_WEAP, A_CON, A_DEX, A_STR, BACKTRACK, BLINDED, BLINDING_VENOM, BOLT_LIM, BOOMERANG, BOULDER, CLOUD, COIN_CLASS, CONFUSION, CORPSE, CREAM_PIE, CXN_PFX_THE, DETECT_MONSTERS, DISP_END, DISP_FLASH, DISP_TETHER, DOOR, DRAWBRIDGE_UP, D_ISOPEN, EGG, ELVEN_ARROW, ELVEN_BOW, EXPL_MAX, EYE, FACE, FALSE, FIRE_TRAP, FLINT, FLYING, FOOD_CLASS, FOOT, FUMBLING, GEMSTONE, GEM_CLASS, GLASS, HALF_PHDAM, HALLUC, HALLUC_RES, HAND, HEAD, HEAVY_IRON_BALL, HMON_APPLIED, HMON_KICKED, HMON_THROWN, HOLE, INFRAVISION, IRON, IRONBARS, I_SPECIAL, KILLED_BY, KILLED_BY_AN, LEVITATION, LOW_PM, MAGIC_PORTAL, MAXPCHARS, MITHRIL, MZ_HUGE, MZ_MEDIUM, M_AP_MONSTER, NO_MM_FLAGS, OBJ_FLOOR, OBJ_MINVENT, ORCISH_ARROW, ORCISH_BOW, PASSES_WALLS, PIERCE, PIT, PM_HOMUNCULUS, PM_IMP, PM_SHADE, PM_STONE_GOLEM, POOL, POTHIT_HERO_THROW, POTION_CLASS, POT_OIL, POT_WATER, P_AXE, P_BOOMERANG, P_BOW, P_CROSSBOW, P_DAGGER, P_DART, P_EXPERT, P_KNIFE, P_NONE, P_PICK_AXE, P_SABER, P_SHORT_SWORD, P_SHURIKEN, P_SKILLED, P_SLING, P_SPEAR, ROCK, SEE_INVIS, SHOPBASE, SILVER, SLT_ENCUMBER, SPIKED_PIT, STONE, STONE_RES, STONING, STRANGE_OBJECT, STRAT_WAITMASK, STUNNED, S_UNICORN, S_arrow_trap, TELEPAT, THROWN_TETHERED_WEAPON, THROWN_WEAPON, TOOL_CLASS, TRAPDOOR, TREE, TRUE, TT_BURIEDBALL, TT_INFLOOR, TT_LAVA, TT_WEB, VEGGY, VENOM_CLASS, VIBRATING_SQUARE, WAND_CLASS, WARN_OF_MON, WAR_HAMMER, WATER, WEAPON_CLASS, WWALKING, W_QUIVER, W_WEP, YA, YUMI } from './consts.ts';

let toss_objs: any;
let bullets: any;
let gem_accept$nogood: any;
let gem_accept$acceptgift: any;
let gem_accept$maybeluck: any;
let gem_accept$noluck: any;
let gem_accept$addluck: any;
let breakobj$lastmovetime: number;
let breakobj$peaceful_shk: number;

async function throw_obj(obj: struct_obj | null, shotlimit: number): Promise<number> {
  let otmp = null;
  let multishot = 0;
  let skill = 0;
  let wep_mask = 0;
  let twoweap = 0;
  let weakmultishot = 0;
  if (!await getdir(null)) {
    if (obj.o_id === G.context.objsplit.parent_oid || obj.o_id === G.context.objsplit.child_oid) {
      await unsplitobj(obj);
    }
    return 0;
  }
  if (obj.oclass === COIN_CLASS && obj !== G.uquiver) {
    return await throw_gold(obj);
  }
  if (!await canletgo(obj, S("throw"))) {
    return 0;
  }
  if (obj.oartifact === ART_MJOLLNIR && obj !== G.uwep) {
    await pline(S("%s must be wielded before it can be thrown."), await The(await xname(obj)));
    return 0;
  }
  if (obj.oartifact === ART_MJOLLNIR && acurr(A_STR) < 100 + 25 || obj.otyp === BOULDER && !((G.youmonst.data.mflags2 & 134217728) >>> 0 !== 0)) {
    await pline(S("It's too heavy."));
    return 1;
  }
  if (!G.u.dx && !G.u.dy && !G.u.dz) {
    await You(S("cannot throw an object at yourself."));
    return 0;
  }
  await u_wipe_engr(2);
  if (!G.uarmg && obj.otyp === CORPSE && ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    await You(S("throw %s with your bare %s."), await corpse_xname(obj, null, CXN_PFX_THE), await makeplural(body_part(HAND)));
    sprintf(P(G.killer.name), S("throwing %s bare-handed"), await killer_xname(obj));
    await instapetrify(P(G.killer.name));
  }
  if (welded(obj)) {
    await weldmsg(obj);
    return 1;
  }
  if (obj.otyp === 209 && obj.spe > 0) {
    await dry_a_towel(obj, -1, FALSE);
  }
  multishot = 1;
  skill = G.objects[obj.otyp].oc_subtyp;
  if (obj.quan > 1 && ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW ? G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp ? 1 : 0 : obj.oclass === WEAPON_CLASS ? 1 : 0) && !(G.u.uprops[CONFUSION].intrinsic || G.u.uprops[STUNNED].intrinsic)) {
    weakmultishot = (G.urole.malenum === 342 || G.urole.malenum === 335 || G.urole.malenum === 332 && skill !== P_KNIFE || G.urole.malenum === 340 && skill !== -P_DART || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || acurr(A_DEX) <= 6 ? 1 : 0) << 24 >> 24;
    switch (G.u.weapon_skills[weapon_type(obj)].skill) {
    case P_EXPERT:
      ++multishot;
    case P_SKILLED:
      if (!weakmultishot) {
        ++multishot;
      }
      break;
    default:
      break;
    }
    switch (G.urole.malenum) {
    case 330:
      if (skill === -P_SLING || skill === P_SPEAR) {
        ++multishot;
      }
      break;
    case 334:
      if (skill === -P_SHURIKEN) {
        ++multishot;
      }
      break;
    case 337:
      if (skill !== P_DAGGER) {
        ++multishot;
      }
      break;
    case 338:
      if (skill === P_DAGGER) {
        ++multishot;
      }
      break;
    case 339:
      if (obj.otyp === YA && G.uwep && G.uwep.otyp === YUMI) {
        ++multishot;
      }
      break;
    default:
      break;
    }
    if (!weakmultishot) {
      switch (G.urace.malenum) {
      case 260:
        if (obj.otyp === ELVEN_ARROW && G.uwep && G.uwep.otyp === ELVEN_BOW) {
          ++multishot;
        }
        break;
      case 71:
        if (obj.otyp === ORCISH_ARROW && G.uwep && G.uwep.otyp === ORCISH_BOW) {
          ++multishot;
        }
        break;
      case 162:
        if (skill === -P_CROSSBOW) {
          ++multishot;
        }
        break;
      case 256:
      case 43:
      default:
        break;
      }
    }
    if (multishot > 1 && skill === -P_CROSSBOW && ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp)) && acurrstr() < (G.urace.malenum === 162 ? 16 : 18)) {
      multishot = rnd(multishot);
    }
    multishot = rnd(multishot);
    if (multishot > obj.quan) {
      multishot = obj.quan | 0;
    }
    if (shotlimit > 0 && multishot > shotlimit) {
      multishot = shotlimit;
    }
  }
  G.m_shot.s = ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp) ? TRUE : FALSE) << 24 >> 24;
  if (multishot > 1 || shotlimit > 0) {
    await You(S("%s %d %s."), G.m_shot.s ? S("shoot") : S("throw"), multishot, multishot === 1 ? await singular(obj, xname) : await xname(obj));
  }
  wep_mask = obj.owornmask;
  G.m_shot.o = obj.otyp;
  G.m_shot.n = multishot;
  for (G.m_shot.i = 1; G.m_shot.i <= G.m_shot.n; ++G.m_shot.i) {
    twoweap = G.u.twoweap;
    if (obj.quan > 1) {
      otmp = await splitobj(obj, 1);
    } else {
      otmp = obj;
      if (otmp.owornmask) {
        await remove_worn_item(otmp, FALSE);
      }
    }
    await freeinv(otmp);
    await throwit(otmp, wep_mask, twoweap);
  }
  G.m_shot.n = G.m_shot.i = 0;
  G.m_shot.o = STRANGE_OBJECT;
  G.m_shot.s = FALSE;
  return 1;
}

async function ok_to_throw(shotlimit_p: Ptr | null): Promise<number> {
  shotlimit_p.a[shotlimit_p.o] = G.multi || G.save_cm ? G.multi + 1 : 0;
  G.multi = 0;
  if ((G.youmonst.data.mflags1 & 2048) >>> 0 !== 0) {
    await You(S("are physically incapable of throwing or shooting anything."));
    return FALSE;
  } else if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You_cant(S("throw or shoot without hands."));
    return FALSE;
  }
  if (await check_capacity(null)) {
    return FALSE;
  }
  return TRUE;
}

export async function dothrow(): Promise<number> {
  let obj = null;
  const shotlimit = new Int32Array(1);
  if (!await ok_to_throw(P(shotlimit, 0))) {
    return 0;
  }
  obj = await getobj(G.uwep && G.objects[G.uwep.otyp].oc_subtyp === P_SLING ? P(bullets) : P(toss_objs), S("throw"));
  return obj ? await throw_obj(obj, shotlimit[0]) : 0;
}

async function autoquiver(): Promise<void> {
  let otmp = null;
  let oammo = null;
  let omissile = null;
  let omisc = null;
  let altammo = null;
  if (G.uquiver) {
    return;
  }
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (otmp.owornmask || otmp.oartifact || !otmp.dknown) {
      ;
    } else if (otmp.otyp === ROCK || otmp.otyp === FLINT && G.objects[otmp.otyp].oc_name_known | 0 || otmp.oclass === GEM_CLASS && (G.objects[otmp.otyp].oc_material | 0) === GLASS && G.objects[otmp.otyp].oc_name_known | 0) {
      if (G.uwep && G.objects[G.uwep.otyp].oc_subtyp === P_SLING) {
        oammo = otmp;
      } else if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (G.uswapwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[G.uswapwep.otyp].oc_subtyp)) {
        altammo = otmp;
      } else if (!omisc) {
        omisc = otmp;
      }
    } else if (otmp.oclass === GEM_CLASS) {
      ;
    } else if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW) {
      if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp)) {
        oammo = otmp;
      } else if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === GEM_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[otmp.otyp].oc_subtyp <= -P_BOW && (G.uswapwep && G.objects[otmp.otyp].oc_subtyp === -G.objects[G.uswapwep.otyp].oc_subtyp)) {
        altammo = otmp;
      } else {
        omisc = otmp;
      }
    } else if ((otmp.oclass === WEAPON_CLASS || otmp.oclass === TOOL_CLASS) && G.objects[otmp.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[otmp.otyp].oc_subtyp <= -P_DART) {
      omissile = otmp;
    } else if (otmp.oclass === WEAPON_CLASS && throwing_weapon(otmp)) {
      if (G.objects[otmp.otyp].oc_subtyp === P_DAGGER && !omissile) {
        omissile = otmp;
      } else {
        omisc = otmp;
      }
    }
  }
  if (oammo) {
    await setuqwep(oammo);
  } else if (omissile) {
    await setuqwep(omissile);
  } else if (altammo) {
    await setuqwep(altammo);
  } else if (omisc) {
    await setuqwep(omisc);
  }
  return;
}

export async function dofire(): Promise<number> {
  const shotlimit = new Int32Array(1);
  let obj = null;
  if (!await ok_to_throw(P(shotlimit, 0))) {
    return 0;
  }
  if (!(obj = G.uquiver)) {
    if (!G.flags.autoquiver) {
      await You(S("have no ammunition readied."));
    } else {
      await autoquiver();
      if (!(obj = G.uquiver)) {
        await You(S("have nothing appropriate for your quiver."));
      }
    }
    if (!obj) {
      G.in_doagain = 0;
      obj = await getobj(G.uwep && G.objects[G.uwep.otyp].oc_subtyp === P_SLING ? P(bullets) : P(toss_objs), S("throw"));
      if (obj && !obj.owornmask && obj.oclass !== COIN_CLASS) {
        await setuqwep(obj);
      }
    }
    if (G.uquiver) {
      G.uquiver.owornmask = G.uquiver.owornmask & ~W_QUIVER;
      await prinv(S("You ready:"), G.uquiver, 0);
      G.uquiver.owornmask = G.uquiver.owornmask | W_QUIVER;
    }
  }
  return obj ? await throw_obj(obj, shotlimit[0]) : 0;
}

export async function endmultishot(verbose: number): Promise<void> {
  if (G.m_shot.i < G.m_shot.n) {
    if (verbose && !G.context.mon_moving) {
      await You(S("stop %s after the %d%s %s."), G.m_shot.s ? S("firing") : S("throwing"), G.m_shot.i, ordin(G.m_shot.i), G.m_shot.s ? S("shot") : S("toss"));
    }
    G.m_shot.n = G.m_shot.i;
  }
}

export async function hitfloor(obj: struct_obj | null, verbosely: number): Promise<void> {
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === AIR || $at2(G.level.locations, G.u.ux, G.u.uy).typ === CLOUD || $at2(G.level.locations, G.u.ux, G.u.uy).typ >= POOL && $at2(G.level.locations, G.u.ux, G.u.uy).typ <= DRAWBRIDGE_UP || G.u.uinwater | 0 || G.u.uswallow | 0) {
    await dropy(obj);
    return;
  }
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ === ALTAR) {
    await doaltarobj(obj);
  } else if (verbosely) {
    await pline(S("%s %s the %s."), await Doname2(obj), otense(obj, S("hit")), surface(G.u.ux, G.u.uy));
  }
  if (await hero_breaks(obj, G.u.ux, G.u.uy, TRUE)) {
    return;
  }
  if (await ship_object(obj, G.u.ux, G.u.uy, FALSE)) {
    return;
  }
  await dropz(obj, TRUE);
}

export async function walk_path(src_cc: struct_nhcoord | null, dest_cc: struct_nhcoord | null, check_proc: Function | null, arg: any): Promise<number> {
  let x = 0;
  let y = 0;
  let dx = 0;
  let dy = 0;
  let x_change = 0;
  let y_change = 0;
  let err = 0;
  let i = 0;
  let prev_x = 0;
  let prev_y = 0;
  let keep_going = TRUE;
  dx = dest_cc.x - src_cc.x;
  dy = dest_cc.y - src_cc.y;
  prev_x = x = src_cc.x;
  prev_y = y = src_cc.y;
  if (dx < 0) {
    x_change = -1;
    dx = -dx;
  } else {
    x_change = 1;
  }
  if (dy < 0) {
    y_change = -1;
    dy = -dy;
  } else {
    y_change = 1;
  }
  i = err = 0;
  if (dx < dy) {
    while (i++ < dy) {
      prev_x = x;
      prev_y = y;
      y += y_change;
      err += dx << 1;
      if (err > dy) {
        x += x_change;
        err -= dy << 1;
      }
      if (!(keep_going = await check_proc(arg, x, y))) {
        break;
      }
    }
  } else {
    while (i++ < dx) {
      prev_x = x;
      prev_y = y;
      x += x_change;
      err += dy << 1;
      if (err > dx) {
        y += y_change;
        err -= dx << 1;
      }
      if (!(keep_going = await check_proc(arg, x, y))) {
        break;
      }
    }
  }
  if (keep_going) {
    return TRUE;
  }
  dest_cc.x = prev_x << 24 >> 24;
  dest_cc.y = prev_y << 24 >> 24;
  return FALSE;
}

export async function hurtle_jump(arg: any, x: number, y: number): Promise<number> {
  let $t1: any;
  let res = 0;
  let save_EWwalking = G.u.uprops[WWALKING].extrinsic;
  ($t1 = G.u.uprops[WWALKING], $t1.extrinsic = $t1.extrinsic | I_SPECIAL);
  res = await hurtle_step(arg, x, y);
  G.u.uprops[WWALKING].extrinsic = save_EWwalking;
  return res;
}

export async function hurtle_step(arg: any, x: number, y: number): Promise<number> {
  let ox = 0;
  let oy = 0;
  let range = arg;
  let obj = null;
  let mon = null;
  let may_pass = TRUE;
  let via_jumping = 0;
  let stopping_short = 0;
  let ttmp = null;
  let dmg = 0;
  if (!isok(x, y)) {
    await You_feel(S("the spirits holding you back."));
    return FALSE;
  } else if (!await in_out_region(x, y)) {
    return FALSE;
  } else if (range.a[range.o] === 0) {
    return FALSE;
  }
  via_jumping = ((G.u.uprops[WWALKING].extrinsic & I_SPECIAL) !== 0 ? 1 : 0) << 24 >> 24;
  stopping_short = (via_jumping && range.a[range.o] < 2 ? 1 : 0) << 24 >> 24;
  if (!(G.u.uprops[PASSES_WALLS].intrinsic || G.u.uprops[PASSES_WALLS].extrinsic) || !(may_pass = may_passwall(x, y))) {
    let odoor_diag = ($at2(G.level.locations, x, y).typ === DOOR && ($at2(G.level.locations, x, y).flags | 0) & D_ISOPEN && G.u.ux - x && G.u.uy - y ? 1 : 0) << 24 >> 24;
    if ($at2(G.level.locations, x, y).typ < POOL || closed_door(x, y) || odoor_diag) {
      let s = null;
      if (odoor_diag) {
        await You(S("hit the door edge!"));
      }
      await pline(S("Ouch!"));
      if ($at2(G.level.locations, x, y).typ === TREE || G.level.flags.arboreal | 0 && $at2(G.level.locations, x, y).typ === STONE) {
        s = S("bumping into a tree");
      } else if ($at2(G.level.locations, x, y).typ < POOL) {
        s = S("bumping into a wall");
      } else {
        s = S("bumping into a door");
      }
      dmg = rnd(2 + range.a[range.o]);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, s, KILLED_BY);
      wake_nearto(x, y, 10);
      return FALSE;
    }
    if ($at2(G.level.locations, x, y).typ === IRONBARS) {
      await You(S("crash into some iron bars.  Ouch!"));
      dmg = rnd(2 + range.a[range.o]);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("crashing into iron bars"), KILLED_BY);
      wake_nearto(x, y, 20);
      return FALSE;
    }
    if (!!(obj = sobj_at(BOULDER, x, y))) {
      await You(S("bump into a %s.  Ouch!"), await xname(obj));
      dmg = rnd(2 + range.a[range.o]);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("bumping into a boulder"), KILLED_BY);
      wake_nearto(x, y, 10);
      return FALSE;
    }
    if (!may_pass) {
      await You(S("smack into something!"));
      dmg = rnd(2 + range.a[range.o]);
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("touching the edge of the universe"), KILLED_BY);
      wake_nearto(x, y, 10);
      return FALSE;
    }
    if (G.u.ux - x && G.u.uy - y && bad_rock(G.youmonst.data, G.u.ux, y) && bad_rock(G.youmonst.data, x, G.u.uy)) {
      let too_much = (G.invent && inv_weight() + weight_cap() > 600 ? 1 : 0) << 24 >> 24;
      if (G.youmonst.data.msize >= 3 || too_much) {
        await You(S("%sget forcefully wedged into a crevice."), too_much ? S("and all your belongings ") : S(""));
        dmg = rnd(2 + range.a[range.o]);
        await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg + 1) / 2 | 0 : dmg, S("wedging into a narrow crevice"), KILLED_BY);
        wake_nearto(x, y, 10);
        return FALSE;
      }
    }
  }
  if (!!(mon = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null)) {
    let mnam = null;
    let pronoun = null;
    let glyph = glyph_at(x, y);
    mon.mundetected = 0;
    mnam = await a_monnam(mon);
    pronoun = G.genders[pronoun_gender(mon, 1)].him;
    if (!strcmp(mnam, S("it"))) {
      mnam = !strcmp(pronoun, S("it")) ? S("something") : S("someone");
    }
    if (!(glyph >= 0 && glyph < 0 + 382 || glyph >= 382 + 0 && glyph < 382 + 0 + 382 || glyph >= 382 + (382 + (1 + (382 + (382 + 0)))) && glyph < 382 + (382 + (1 + (382 + (382 + 0)))) + 382 || glyph >= 1 + (382 + (382 + 0)) && glyph < 1 + (382 + (382 + 0)) + 382) && !(glyph === 382 + (382 + 0))) {
      await You(S("find %s by bumping into %s."), mnam, pronoun);
    } else {
      await You(S("bump into %s."), mnam);
    }
    await wakeup(mon, FALSE);
    if (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected) || (!((mon.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mon.mx, mon.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mon.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mon.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mon.data)))) {
      await map_invisible(mon.mx, mon.my);
    }
    await setmangry(mon, FALSE);
    wake_nearto(x, y, 10);
    return FALSE;
  }
  if (G.u.ux - x && G.u.uy - y && bad_rock(G.youmonst.data, G.u.ux, y) && bad_rock(G.youmonst.data, x, G.u.uy)) {
    if (G.level.flags.sokoban_rules) {
      await You(S("come to an abrupt halt!"));
      return FALSE;
    }
  }
  if (!!G.uball && G.uball.where === OBJ_FLOOR) {
    const bc_control = new Int32Array(1);
    const ballx = new Int8Array(1);
    const bally = new Int8Array(1);
    const chainx = new Int8Array(1);
    const chainy = new Int8Array(1);
    const cause_delay = new Int8Array(1);
    if (await drag_ball(x, y, P(bc_control, 0), P(ballx, 0), P(bally, 0), P(chainx, 0), P(chainy, 0), P(cause_delay, 0), TRUE)) {
      await move_bc(0, bc_control[0], ballx[0], bally[0], chainx[0], chainy[0]);
    }
  }
  ox = G.u.ux;
  oy = G.u.uy;
  await u_on_newpos(x, y);
  await newsym(ox, oy);
  await vision_recalc(1);
  await flush_screen(1);
  if ($at2(G.level.locations, G.u.ux, G.u.uy).typ !== $at2(G.level.locations, ox, oy).typ) {
    await switch_terrain();
  }
  if (is_pool(x, y) && !G.u.uinwater) {
    if ((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level) && $at2(G.level.locations, x, y).typ === WATER || !((G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked || (G.u.uprops[FLYING].intrinsic || G.u.uprops[FLYING].extrinsic || G.u.usteed && (G.u.usteed.data.mflags1 & 1) >>> 0 !== 0) && !G.u.uprops[FLYING].blocked || G.u.uprops[WWALKING].extrinsic && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)))) {
      G.multi = 0;
      await drown();
      return FALSE;
    } else if (!((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level)) && !stopping_short) {
      await Norep(S("You move over %s."), await an(is_moat(x, y) ? S("moat") : S("pool")));
    }
  } else if (is_lava(x, y) && !stopping_short) {
    await Norep(S("You move over some lava."));
  }
  if (!!(ttmp = t_at(x, y))) {
    if (stopping_short) {
      ;
    } else if ((ttmp.ttyp | 0) === MAGIC_PORTAL) {
      await dotrap(ttmp, 0);
      return FALSE;
    } else if ((ttmp.ttyp | 0) === VIBRATING_SQUARE) {
      await pline(S("The ground vibrates as you pass it."));
      await dotrap(ttmp, 0);
    } else if ((ttmp.ttyp | 0) === FIRE_TRAP) {
      await dotrap(ttmp, 0);
    } else if (((ttmp.ttyp | 0) === PIT || (ttmp.ttyp | 0) === SPIKED_PIT || ((ttmp.ttyp | 0) === HOLE || (ttmp.ttyp | 0) === TRAPDOOR)) && G.level.flags.sokoban_rules | 0) {
      if (!via_jumping) {
        await dotrap(ttmp, 0);
      }
      range.a[range.o] = 0;
      return TRUE;
    } else {
      if (ttmp.tseen) {
        await You(S("pass right over %s."), await an(G.defsyms[S_arrow_trap + (ttmp.ttyp | 0) - 1].explanation));
      }
    }
  }
  if (--range.a[range.o] < 0) {
    range.a[range.o] = 0;
  }
  if (range.a[range.o] !== 0) {
    await G.windowprocs.win_delay_output();
  }
  return TRUE;
}

async function mhurtle_step(arg: any, x: number, y: number): Promise<number> {
  let mon = arg;
  if (goodpos(x, y, mon, 0) && await m_in_out_region(mon, x, y)) {
    G.level.monsters[mon.mx][mon.my] = null;
    await newsym(mon.mx, mon.my);
    await place_monster(mon, x, y);
    await newsym(mon.mx, mon.my);
    set_apparxy(mon);
    await mintrap(mon);
    return TRUE;
  }
  return FALSE;
}

export async function hurtle(dx: number, dy: number, range$: number, verbose: number): Promise<void> {
  const range = new Int32Array(1);
  range[0] = range$;
  let uc = new struct_nhcoord();
  let cc = new struct_nhcoord();
  if (!!G.uball && !(G.uball.where === 3)) {
    await You_feel(S("a tug from the iron ball."));
    nomul(0);
    return;
  } else if (G.u.utrap) {
    await You(S("are anchored by the %s."), G.u.utraptype === TT_WEB ? S("web") : G.u.utraptype === TT_LAVA ? hliquid(S("lava")) : G.u.utraptype === TT_INFLOOR ? surface(G.u.ux, G.u.uy) : G.u.utraptype === TT_BURIEDBALL ? S("buried ball") : S("trap"));
    nomul(0);
    return;
  }
  dx = sgn(dx);
  dy = sgn(dy);
  if (!range[0] || !dx && !dy || G.u.ustuck) {
    return;
  }
  nomul(-range[0]);
  G.multi_reason = S("moving through the air");
  G.nomovemsg = S("");
  if (verbose) {
    await You(S("%s in the opposite direction."), range[0] > 1 ? S("hurtle") : S("float"));
  }
  await endmultishot(TRUE);
  sokoban_guilt();
  uc.x = G.u.ux;
  uc.y = G.u.uy;
  cc.x = G.u.ux + Math.imul(dx, range[0]) << 24 >> 24;
  cc.y = G.u.uy + Math.imul(dy, range[0]) << 24 >> 24;
  await walk_path(uc, cc, hurtle_step, P(range, 0));
}

export async function mhurtle(mon: struct_monst | null, dx: number, dy: number, range: number): Promise<void> {
  let mc = new struct_nhcoord();
  let cc = new struct_nhcoord();
  mon.movement = 0;
  mon.mstun = 1;
  if (mon.data.msize >= MZ_HUGE || mon === G.u.ustuck || mon.mtrapped | 0) {
    return;
  }
  dx = sgn(dx);
  dy = sgn(dy);
  if (!range || !dx && !dy) {
    return;
  }
  if (dx && dy && await monsndx(mon.data) === 115) {
    return;
  }
  mc.x = mon.mx;
  mc.y = mon.my;
  cc.x = mon.mx + Math.imul(dx, range) << 24 >> 24;
  cc.y = mon.my + Math.imul(dy, range) << 24 >> 24;
  await walk_path(mc, cc, mhurtle_step, mon);
  return;
}

async function check_shop_obj(obj: struct_obj | null, x: number, y: number, broken: number): Promise<void> {
  let costly_xy = 0;
  let shkp = await shop_keeper($rd(P(G.u.ushops)));
  if (!shkp) {
    return;
  }
  costly_xy = await costly_spot(x, y);
  if (broken || !costly_xy || $rd(in_rooms(x, y, SHOPBASE)) !== $rd(P(G.u.ushops))) {
    if (is_unpaid(obj)) {
      await stolen_value(obj, G.u.ux, G.u.uy, shkp.mpeaceful << 24 >> 24, FALSE);
    }
    if (broken) {
      obj.no_charge = 1;
    }
  } else if (costly_xy) {
    let oshops = in_rooms(x, y, SHOPBASE);
    if (oshops.a[oshops.o] === $rd(P(G.u.ushops)) || oshops.a[oshops.o] === $rd(P(G.u.ushops0))) {
      if (is_unpaid(obj)) {
        await subfrombill(obj, shkp);
      } else if (x !== shkp.mx || y !== shkp.my) {
        await sellobj(obj, x, y);
      }
    }
  }
}

async function toss_up(obj: struct_obj | null, hitsroof: number): Promise<number> {
  let $g = 0;
  let action = null;
  let petrifier = 0;
  let less_damage = 0;
  let artimsg = 0;
  let dmg = new Int32Array(1);
  $L: for (;;) {
    switch ($g) {
    case 0:
      petrifier = ((obj.otyp === EGG || obj.otyp === CORPSE) && ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) ? 1 : 0) << 24 >> 24;
      if (!has_ceiling(G.u.uz)) {
        action = S("flies up into");
      } else if (hitsroof) {
        if (breaktest(obj)) {
          await pline(S("%s hits the %s."), await Doname2(obj), ceiling(G.u.ux, G.u.uy));
          await breakmsg(obj, !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0);
          await breakobj(obj, G.u.ux, G.u.uy, TRUE, TRUE);
          return FALSE;
        }
        action = S("hits");
      } else {
        action = S("almost hits");
      }
      await pline(S("%s %s the %s, then falls back on top of your %s."), await Doname2(obj), action, ceiling(G.u.ux, G.u.uy), body_part(HEAD));
      if (!(obj.oclass === POTION_CLASS)) { $g = 3; continue $L; }
      {
        await potionhit(G.youmonst, obj, POTHIT_HERO_THROW);
      }
      { $g = 2; continue $L; }
    case 3:
      if (!breaktest(obj)) { $g = 5; continue $L; }
      {
        let otyp = obj.otyp;
        let blindinc = 0;
        blindinc = (otyp === CREAM_PIE || otyp === BLINDING_VENOM) && can_blnd(G.youmonst, G.youmonst, AT_WEAP, obj) ? rnd(25) : 0;
        await breakmsg(obj, !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) ? 1 : 0);
        await breakobj(obj, G.u.ux, G.u.uy, TRUE, TRUE);
        obj = null;
        switch (otyp) {
        case 241:
          if (petrifier && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM))) {
            if (G.uarmh) {
              await Your(S("%s fails to protect you."), helm_simple_name(G.uarmh));
            }
            { $g = 1; continue $L; }
          }
        case 262:
        case 452:
          await pline(S("You've got it all over your %s!"), body_part(FACE));
          if (blindinc) {
            if (otyp === BLINDING_VENOM && !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              await pline(S("It blinds you!"));
            }
            G.u.ucreamed = G.u.ucreamed + (blindinc >>> 0) >>> 0;
            await make_blinded(G.u.uprops[BLINDED].intrinsic + blindinc, FALSE);
            if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
              await Your(S("%s"), G.c_common_strings.c_vision_clears);
            }
          }
          break;
        default:
          break;
        }
        return FALSE;
      }
      { $g = 4; continue $L; }
    case 5:
      less_damage = (G.uarmh && ((G.objects[G.uarmh.otyp].oc_material | 0) >= IRON && (G.objects[G.uarmh.otyp].oc_material | 0) <= MITHRIL) ? 1 : 0) << 24 >> 24;
      artimsg = FALSE;
      dmg[0] = await dmgval(obj, G.youmonst);
      if (obj.oartifact) {
        artimsg = await artifact_hit(null, G.youmonst, obj, P(dmg, 0), rn2(18) + 2);
      }
      if (!dmg[0]) {
        dmg[0] = (obj.owt | 0) / 100 | 0;
        if (dmg[0] < 1) {
          dmg[0] = 1;
        } else if (dmg[0] > 6) {
          dmg[0] = 6;
        }
        if (G.youmonst.data === $sat(G.mons, PM_SHADE) && (G.objects[obj.otyp].oc_material | 0) !== SILVER) {
          dmg[0] = 0;
        }
      }
      if (dmg[0] > 1 && less_damage) {
        dmg[0] = 1;
      }
      if (dmg[0] > 0) {
        dmg[0] += G.u.udaminc;
      }
      if (dmg[0] < 0) {
        dmg[0] = 0;
      }
      dmg[0] = G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg[0] + 1) / 2 | 0 : dmg[0];
      if (!G.uarmh) { $g = 7; continue $L; }
      {
        if (less_damage && dmg[0] < (G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp)) {
          if (!artimsg) {
            await pline(S("Fortunately, you are wearing a hard helmet."));
          }
        } else if (!petrifier) {
          if (G.flags.verbose) {
            await Your(S("%s does not protect you."), helm_simple_name(G.uarmh));
          }
        }
      }
      { $g = 6; continue $L; }
    case 7:
      if (!(petrifier && !(G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic) && !(poly_when_stoned(G.youmonst.data) && await polymon(PM_STONE_GOLEM)))) { $g = 8; continue $L; }
    case 1: // petrify
      G.killer.format = KILLED_BY;
      strcpy(P(G.killer.name), S("elementary physics"));
      await You(S("turn to stone."));
      if (obj) {
        await dropy(obj);
      }
      G.thrownobj = null;
      await done(STONING);
      return (obj ? TRUE : FALSE) << 24 >> 24;
    case 8:
    case 6:
      await hitfloor(obj, TRUE);
      G.thrownobj = null;
      await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg[0] + 1) / 2 | 0 : dmg[0], S("falling object"), KILLED_BY_AN);
    case 4:
    case 2:
      return TRUE;
    }
    break;
  }
}

export function throwing_weapon(obj: struct_obj | null): number {
  return ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART || obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp === P_SPEAR || obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= P_DAGGER && G.objects[obj.otyp].oc_subtyp <= P_SABER && !(obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[obj.otyp].oc_subtyp <= P_SABER) && (G.objects[obj.otyp].oc_dir | 0) & PIERCE || obj.otyp === WAR_HAMMER || obj.otyp === AKLYS ? 1 : 0) << 24 >> 24;
}

async function sho_obj_return_to_u(obj: struct_obj | null): Promise<void> {
  if ((G.u.dx || G.u.dy) && (G.bhitpos.x !== G.u.ux || G.bhitpos.y !== G.u.uy)) {
    let x = G.bhitpos.x - G.u.dx;
    let y = G.bhitpos.y - G.u.dy;
    await tmp_at(DISP_FLASH, obj.otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : obj.corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : obj.otyp === 240 ? obj.corpsenm + (382 + (1 + (382 + (382 + 0)))) : obj.otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
    while (isok(x, y) && (x !== G.u.ux || y !== G.u.uy)) {
      await tmp_at(x, y);
      await G.windowprocs.win_delay_output();
      x -= G.u.dx;
      y -= G.u.dy;
    }
    await tmp_at(DISP_END, 0);
  }
}

export async function throwit(obj$: struct_obj | null, wep_mask: number, twoweap: number): Promise<void> {
  const obj = [null];
  obj[0] = obj$;
  let $g = 0;
  let mon = null;
  let range = 0;
  let urange = 0;
  let crossbowing = 0;
  let clear_thrownobj = 0;
  let impaired = 0;
  let tethered_weapon = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      clear_thrownobj = FALSE;
      impaired = (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[STUNNED].intrinsic || (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) ? 1 : 0) << 24 >> 24;
      tethered_weapon = (obj[0].otyp === AKLYS && (wep_mask & W_WEP) !== 0 ? 1 : 0) << 24 >> 24;
      G.notonhead = FALSE;
      if ((obj[0].cursed | 0 || obj[0].greased | 0) && (G.u.dx || G.u.dy) && !rn2(7)) {
        let slipok = TRUE;
        if ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === GEM_CLASS) && G.objects[obj[0].otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj[0].otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj[0].otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp)) {
          await pline(S("%s!"), await Tobjnam(obj[0], S("misfire")));
        } else {
          if (obj[0].greased | 0 || throwing_weapon(obj[0])) {
            await pline(S("%s as you throw it!"), await Tobjnam(obj[0], S("slip")));
          } else {
            slipok = FALSE;
          }
        }
        if (slipok) {
          G.u.dx = rn2(3) - 1 << 24 >> 24;
          G.u.dy = rn2(3) - 1 << 24 >> 24;
          if (!G.u.dx && !G.u.dy) {
            G.u.dz = 1;
          }
          impaired = TRUE;
        }
      }
      if ((G.u.dx || G.u.dy || G.u.dz < 1) && calc_capacity(obj[0].owt | 0) > SLT_ENCUMBER && (G.u.umonnum !== G.u.umonster ? G.u.mh < 5 && G.u.mh !== G.u.mhmax ? 1 : 0 : G.u.uhp < 10 && G.u.uhp !== G.u.uhpmax ? 1 : 0) && obj[0].owt > (G.u.umonnum !== G.u.umonster ? G.u.mh : G.u.uhp) * 2 >>> 0 && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level))) {
        await You(S("have so little stamina, %s drops from your grasp."), await the(await xname(obj[0])));
        await exercise(A_CON, FALSE);
        G.u.dx = G.u.dy = 0;
        G.u.dz = 1;
      }
      G.thrownobj = obj[0];
      G.thrownobj.was_thrown = 1;
      G.iflags.returning_missile = obj[0].oartifact === ART_MJOLLNIR && G.urole.malenum === 341 || tethered_weapon ? obj[0] : null;
      if (G.u.uswallow) {
        if (obj[0] === G.uball) {
          G.uball.ox = G.uchain.ox = G.u.ux;
          G.uball.oy = G.uchain.oy = G.u.uy;
        }
        mon = G.u.ustuck;
        G.bhitpos.x = mon.mx;
        G.bhitpos.y = mon.my;
        if (tethered_weapon) {
          await tmp_at(DISP_TETHER, obj[0].otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : obj[0].corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : obj[0].otyp === 240 ? obj[0].corpsenm + (382 + (1 + (382 + (382 + 0)))) : obj[0].otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
        }
      } else if (G.u.dz) {
        if (G.u.dz < 0 && G.iflags.returning_missile && !impaired) {
          await pline(S("%s the %s and returns to your hand!"), await Tobjnam(obj[0], S("hit")), ceiling(G.u.ux, G.u.uy));
          obj[0] = await addinv(obj[0]);
          await encumber_msg();
          if (obj[0].owornmask & W_QUIVER) {
            await setuqwep(null);
          }
          await setuwep(obj[0]);
          G.u.twoweap = twoweap;
        } else if (G.u.dz < 0) {
          await toss_up(obj[0], rn2(5) && !G.u.uinwater ? 1 : 0);
        } else if (G.u.dz > 0 && G.u.usteed && obj[0].oclass === POTION_CLASS && rn2(6)) {
          await potionhit(G.u.usteed, obj[0], POTHIT_HERO_THROW);
        } else {
          await hitfloor(obj[0], TRUE);
        }
        clear_thrownobj = TRUE;
        { $g = 1; continue $L; }
      } else if (obj[0].otyp === BOOMERANG && !G.u.uinwater) {
        if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          await hurtle(-G.u.dx, -G.u.dy, 1, TRUE);
        }
        mon = await boomhit(obj[0], G.u.dx, G.u.dy);
        if (mon === G.youmonst) {
          await exercise(A_DEX, TRUE);
          obj[0] = await addinv(obj[0]);
          await encumber_msg();
          if (wep_mask && !(obj[0].owornmask & wep_mask)) {
            await setworn(obj[0], wep_mask);
            G.u.twoweap = twoweap;
          }
          clear_thrownobj = TRUE;
          { $g = 1; continue $L; }
        }
      } else {
        crossbowing = ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === GEM_CLASS) && G.objects[obj[0].otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj[0].otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj[0].otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp) && weapon_type(G.uwep) === P_CROSSBOW ? 1 : 0) << 24 >> 24;
        urange = (crossbowing ? 18 : acurrstr()) / 2 | 0;
        if (obj[0].otyp === HEAVY_IRON_BALL) {
          range = urange - (obj[0].owt / 100 >>> 0 | 0);
        } else {
          range = urange - (obj[0].owt / 40 >>> 0 | 0);
        }
        if (obj[0] === G.uball) {
          if (G.u.ustuck) {
            range = 1;
          } else if (range >= 5) {
            range = 5;
          }
        }
        if (range < 1) {
          range = 1;
        }
        if ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === GEM_CLASS) && G.objects[obj[0].otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj[0].otyp].oc_subtyp <= -P_BOW) {
          if ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === GEM_CLASS) && G.objects[obj[0].otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj[0].otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj[0].otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp)) {
            if (crossbowing) {
              range = BOLT_LIM;
            } else {
              ++range;
            }
          } else if (obj[0].oclass !== GEM_CLASS) {
            range = range / 2 | 0;
          }
        }
        if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          urange -= range;
          if (urange < 1) {
            urange = 1;
          }
          range -= urange;
          if (range < 1) {
            range = 1;
          }
        }
        if (obj[0].otyp === BOULDER) {
          range = 20;
        } else if (obj[0].oartifact === ART_MJOLLNIR) {
          range = (range + 1) / 2 | 0;
        } else if (tethered_weapon) {
          range = range < (8 / 2 | 0) ? range : 8 / 2 | 0;
        } else if (obj[0] === G.uball && G.u.utrap && G.u.utraptype === TT_INFLOOR) {
          range = 1;
        }
        if (G.u.uinwater) {
          range = 1;
        }
        mon = await bhit(G.u.dx, G.u.dy, range, tethered_weapon ? THROWN_TETHERED_WEAPON : THROWN_WEAPON, null, null, P(obj, 0));
        G.thrownobj = obj[0];
        if ((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level) || (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked) {
          await hurtle(-G.u.dx, -G.u.dy, urange, TRUE);
        }
        if (!obj[0]) {
          if (tethered_weapon) {
            await tmp_at(DISP_END, 0);
          }
          { $g = 1; continue $L; }
        }
      }
      if (mon) {
        let obj_gone = 0;
        if (mon.isshk | 0 && obj[0].where === OBJ_MINVENT && obj[0].v.v_ocarry === mon) {
          clear_thrownobj = TRUE;
          { $g = 1; continue $L; }
        }
        await snuff_candle(obj[0]);
        G.notonhead = (G.bhitpos.x !== mon.mx || G.bhitpos.y !== mon.my ? 1 : 0) << 24 >> 24;
        obj_gone = await thitmonst(mon, obj[0]) << 24 >> 24;
        mon = !!G.level.monsters[G.bhitpos.x][G.bhitpos.y] ? G.level.monsters[G.bhitpos.x][G.bhitpos.y] : null;
        if (mon && mon.isshk | 0 && (!inside_shop(G.u.ux, G.u.uy) || !strchr(in_rooms(mon.mx, mon.my, SHOPBASE), $rd(P(G.u.ushops))))) {
          hot_pursuit(mon);
        }
        if (obj_gone) {
          G.thrownobj = null;
        }
      }
      if (!!G.thrownobj) { $g = 4; continue $L; }
      {
        if (tethered_weapon) {
          await tmp_at(DISP_END, 0);
        }
      }
      { $g = 3; continue $L; }
    case 4:
      if (!(G.u.uswallow | 0 && !G.iflags.returning_missile)) { $g = 6; continue $L; }
    case 2: // swallowit
      if (obj[0] !== G.uball) {
        await mpickobj(G.u.ustuck, obj[0]);
      } else {
        clear_thrownobj = TRUE;
      }
      { $g = 1; continue $L; }
      { $g = 5; continue $L; }
    case 6:
      {
        if (G.iflags.returning_missile) {
          if (rn2(100)) {
            if (tethered_weapon) {
              await tmp_at(DISP_END, BACKTRACK);
            } else {
              await sho_obj_return_to_u(obj[0]);
            }
            if (!impaired && rn2(100)) {
              await pline(S("%s to your hand!"), await Tobjnam(obj[0], S("return")));
              obj[0] = await addinv(obj[0]);
              await encumber_msg();
              if (obj[0].owornmask & W_QUIVER) {
                await setuqwep(null);
              }
              await setuwep(obj[0]);
              G.u.twoweap = twoweap;
              if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
                await newsym(G.bhitpos.x, G.bhitpos.y);
              }
            } else {
              const dmg = new Int32Array(1);
              dmg[0] = rn2(2);
              if (!dmg[0]) {
                await pline((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("%s lands %s your %s.") : S("%s back to you, landing %s your %s."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? G.c_common_strings.c_Something : await Tobjnam(obj[0], S("return")), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("beneath") : S("at"), await makeplural(body_part(FOOT)));
              } else {
                dmg[0] += rnd(3);
                await pline((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("%s your %s!") : S("%s back toward you, hitting your %s!"), await Tobjnam(obj[0], (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("hit") : S("fly")), body_part(ARM));
                if (obj[0].oartifact) {
                  await artifact_hit(null, G.youmonst, obj[0], P(dmg, 0), 0);
                }
                await losehp(G.u.uprops[HALF_PHDAM].intrinsic || G.u.uprops[HALF_PHDAM].extrinsic ? (dmg[0] + 1) / 2 | 0 : dmg[0], await killer_xname(obj[0]), KILLED_BY);
              }
              if (G.u.uswallow) {
                { $g = 2; continue $L; }
              }
              if (!await ship_object(obj[0], G.u.ux, G.u.uy, FALSE)) {
                await dropy(obj[0]);
              }
            }
            clear_thrownobj = TRUE;
            { $g = 1; continue $L; }
          } else {
            if (tethered_weapon) {
              await tmp_at(DISP_END, 0);
            }
            await pline(S("%s to return!"), await Tobjnam(obj[0], S("fail")));
            if (G.u.uswallow) {
              { $g = 2; continue $L; }
            }
          }
        }
        if (!($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === AIR || $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === CLOUD || $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ >= POOL && $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ <= DRAWBRIDGE_UP) && breaktest(obj[0]) || obj[0].oclass === VENOM_CLASS) {
          await tmp_at(DISP_FLASH, obj[0].otyp === 449 ? G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? rn2_on_display_rng(382) + 0 : obj[0].corpsenm + (6 + ((382 << 3) + ((8 << 2) + (9 * EXPL_MAX + (MAXPCHARS - 9 + (454 + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))))))))) : G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? (G.otg_temp = rn2_on_display_rng(454 - 1) + 1) === 240 ? rn2_on_display_rng(382) + (382 + (1 + (382 + (382 + 0)))) : G.otg_temp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))) : obj[0].otyp === 240 ? obj[0].corpsenm + (382 + (1 + (382 + (382 + 0)))) : obj[0].otyp + (382 + (382 + (382 + (1 + (382 + (382 + 0)))))));
          await tmp_at(G.bhitpos.x, G.bhitpos.y);
          await G.windowprocs.win_delay_output();
          await tmp_at(DISP_END, 0);
          await breakmsg(obj[0], $rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2);
          await breakobj(obj[0], G.bhitpos.x, G.bhitpos.y, TRUE, TRUE);
          clear_thrownobj = TRUE;
          { $g = 1; continue $L; }
        }
        if (await flooreffects(obj[0], G.bhitpos.x, G.bhitpos.y, S("fall"))) {
          clear_thrownobj = TRUE;
          { $g = 1; continue $L; }
        }
        await obj_no_longer_held(obj[0]);
        if (mon && mon.isshk | 0 && ((obj[0].oclass === WEAPON_CLASS || obj[0].oclass === TOOL_CLASS) && G.objects[obj[0].otyp].oc_subtyp === P_PICK_AXE)) {
          if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
            await pline(S("%s snatches up %s."), await Monnam(mon), await the(await xname(obj[0])));
          }
          if ($rd(P(G.u.ushops)) || obj[0].unpaid | 0) {
            await check_shop_obj(obj[0], G.bhitpos.x, G.bhitpos.y, FALSE);
          }
          await mpickobj(mon, obj[0]);
          clear_thrownobj = TRUE;
          { $g = 1; continue $L; }
        }
        await snuff_candle(obj[0]);
        if (!mon && await ship_object(obj[0], G.bhitpos.x, G.bhitpos.y, FALSE)) {
          clear_thrownobj = TRUE;
          { $g = 1; continue $L; }
        }
        G.thrownobj = null;
        await place_object(obj[0], G.bhitpos.x, G.bhitpos.y);
        if (!($at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === AIR || $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ === CLOUD || $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ >= POOL && $at2(G.level.locations, G.bhitpos.x, G.bhitpos.y).typ <= DRAWBRIDGE_UP)) {
          await container_impact_dmg(obj[0], G.u.ux, G.u.uy);
        }
        if (($rd(P(G.u.ushops)) || obj[0].unpaid | 0) && obj[0] !== G.uball) {
          await check_shop_obj(obj[0], G.bhitpos.x, G.bhitpos.y, FALSE);
        }
        await stackobj(obj[0]);
        if (obj[0] === G.uball) {
          await drop_ball(G.bhitpos.x, G.bhitpos.y);
        }
        if ($rd(G.viz_array.a[G.viz_array.o + G.bhitpos.y], G.bhitpos.x) & 2) {
          await newsym(G.bhitpos.x, G.bhitpos.y);
        }
        if (obj_sheds_light(obj[0])) {
          G.vision_full_recalc = 1;
        }
      }
    case 5:
    case 3:
    case 1: // throwit_return
      G.iflags.returning_missile = null;
      if (clear_thrownobj) {
        G.thrownobj = null;
      }
      return;
    }
    break;
  }
}

export async function omon_adj(mon: struct_monst | null, obj: struct_obj | null, mon_notices: number): Promise<number> {
  let tmp = 0;
  tmp += mon.data.msize - MZ_MEDIUM;
  if (mon.msleeping) {
    tmp += 2;
    if (mon_notices) {
      mon.msleeping = 0;
    }
  }
  if (!mon.mcanmove || !mon.data.mmove) {
    tmp += 4;
    if (mon_notices && mon.data.mmove && !rn2(10)) {
      mon.mcanmove = 1;
      mon.mfrozen = 0;
    }
  }
  switch (obj.otyp) {
  case 450:
    if (obj !== G.uball) {
      tmp += 2;
    }
    break;
  case 448:
    tmp += 6;
    break;
  default:
    if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || obj.oclass === GEM_CLASS) {
      tmp += await hitval(obj, mon);
    }
    break;
  }
  return tmp;
}

async function tmiss(obj: struct_obj | null, mon: struct_monst | null, maybe_wakeup: number): Promise<void> {
  let missile = await mshot_xname(obj);
  if (!((mon.wormno | 0 ? worm_known(mon) : $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mon && mon.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mon.my], mon.mx) & 1 ? 1 : 0) && ((!mon.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mon.mundetected)) || mon.m_ap_type & 7 && (mon.m_ap_type & 7) !== M_AP_MONSTER) {
    await pline(S("%s %s."), await The(missile), otense(obj, S("miss")));
  } else {
    await miss(missile, mon);
  }
  if (maybe_wakeup && !rn2(3)) {
    await wakeup(mon, TRUE);
  }
  return;
}

export async function thitmonst(mon: struct_monst | null, obj: struct_obj | null): Promise<number> {
  let tmp = 0;
  let disttmp = 0;
  let otyp = obj.otyp;
  let hmode = 0;
  let guaranteed_hit = (G.u.uswallow | 0 && mon === G.u.ustuck ? 1 : 0) << 24 >> 24;
  let dieroll = 0;
  hmode = obj === G.uwep ? HMON_APPLIED : obj === G.kickedobj ? HMON_KICKED : HMON_THROWN;
  tmp = -1 + (G.u.uluck + G.u.moreluck) + find_mac(mon) + G.u.uhitinc + (G.u.umonnum !== G.u.umonster ? G.youmonst.data.mlevel : G.u.ulevel);
  if (acurr(A_DEX) < 4) {
    tmp -= 3;
  } else if (acurr(A_DEX) < 6) {
    tmp -= 2;
  } else if (acurr(A_DEX) < 8) {
    tmp -= 1;
  } else if (acurr(A_DEX) >= 14) {
    tmp += acurr(A_DEX) - 14;
  }
  disttmp = 3 - distmin(G.u.ux, G.u.uy, mon.mx, mon.my);
  if (disttmp < -4) {
    disttmp = -4;
  }
  tmp += disttmp;
  if (G.uarmg && G.uwep && G.objects[G.uwep.otyp].oc_subtyp === P_BOW) {
    switch (G.uarmg.otyp) {
    case 138:
      tmp -= 2;
      break;
    case 137:
      tmp -= 3;
      break;
    case 136:
    case 139:
      break;
    default:
      await impossible(S("Unknown type of gloves (%d)"), G.uarmg.otyp);
      break;
    }
  }
  tmp += await omon_adj(mon, obj, TRUE);
  if ((mon.data.mflags2 & 128) >>> 0 !== 0 && (G.u.umonnum !== G.u.umonster ? (G.youmonst.data.mflags2 & 16) >>> 0 !== 0 ? 1 : 0 : G.urace.malenum === 260 ? 1 : 0)) {
    ++tmp;
  }
  if (guaranteed_hit) {
    tmp += 1000;
  }
  if (obj.oclass === GEM_CLASS && (mon.data.mlet === S_UNICORN && (mon.data.mflags2 & 536870912) >>> 0 !== 0)) {
    if (mon.msleeping | 0 || !mon.mcanmove) {
      await tmiss(obj, mon, FALSE);
      return 0;
    } else if (mon.mtame) {
      await pline(S("%s catches and drops %s."), await Monnam(mon), await the(await xname(obj)));
      return 0;
    } else {
      await pline(S("%s catches %s."), await Monnam(mon), await the(await xname(obj)));
      return await gem_accept(mon, obj);
    }
  }
  if (hmode !== HMON_APPLIED && (obj.oartifact && is_quest_artifact(obj) && mon.m_id === G.quest_status.leader_m_id)) {
    mon.msleeping = 0;
    mon.mstrategy = (mon.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
    if (mon.mcanmove) {
      await pline(S("%s catches %s."), await Monnam(mon), await the(await xname(obj)));
      if (mon.mpeaceful) {
        let next2u = monnear(mon, G.u.ux, G.u.uy);
        await finish_quest(obj);
        await pline(S("%s %s %s back to you."), await Monnam(mon), next2u ? S("hands") : S("tosses"), await the(await xname(obj)));
        if (!next2u) {
          await sho_obj_return_to_u(obj);
        }
        obj = await addinv(obj);
        await encumber_msg();
      } else {
        if ($rd(P(G.u.ushops)) || obj.unpaid | 0) {
          await check_shop_obj(obj, mon.mx, mon.my, FALSE);
        }
        await mpickobj(mon, obj);
      }
      return 1;
    }
    return 0;
  }
  dieroll = rnd(20);
  if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || obj.oclass === GEM_CLASS) {
    if (hmode === HMON_KICKED) {
      tmp -= (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW ? 5 : 3;
    } else if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW) {
      if (!((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW && (G.uwep && G.objects[obj.otyp].oc_subtyp === -G.objects[G.uwep.otyp].oc_subtyp))) {
        tmp -= 4;
      } else {
        tmp += G.uwep.spe - ((G.uwep.oeroded | 0) > (G.uwep.oeroded2 | 0) ? G.uwep.oeroded | 0 : G.uwep.oeroded2 | 0);
        tmp += await weapon_hit_bonus(G.uwep);
        if (G.uwep.oartifact) {
          tmp += await spec_abon(G.uwep, mon);
        }
        if ((G.urace.malenum === 260 || G.urole.malenum === 339) && (!(G.u.umonnum !== G.u.umonster) || (G.youmonst.data.mflags2 & $u64(G.urace.selfmask)) >>> 0 !== 0) && G.objects[G.uwep.otyp].oc_subtyp === P_BOW) {
          ++tmp;
          if (G.urace.malenum === 260 && G.uwep.otyp === ELVEN_BOW) {
            ++tmp;
          } else if (G.urole.malenum === 339 && G.uwep.otyp === YUMI) {
            ++tmp;
          }
        }
      }
    } else {
      if (otyp === BOOMERANG) {
        tmp += 4;
      } else if (throwing_weapon(obj)) {
        tmp += 2;
      } else if (obj === G.thrownobj) {
        tmp -= 2;
      }
      tmp += await weapon_hit_bonus(obj);
    }
    if (tmp >= dieroll) {
      let wasthrown = (!!G.thrownobj ? 1 : 0) << 24 >> 24;
      let chopper = ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp === P_AXE ? 1 : 0) << 24 >> 24;
      if (hmode === HMON_APPLIED) {
        ++G.u.uconduct.weaphit;
      }
      if (await hmon(mon, obj, hmode, dieroll)) {
        if (mon.wormno) {
          await cutworm(mon, G.bhitpos.x, G.bhitpos.y, chopper);
        }
      }
      await exercise(A_DEX, TRUE);
      if (wasthrown && !G.thrownobj) {
        return 1;
      }
      if (G.objects[otyp].oc_subtyp < P_NONE && G.objects[otyp].oc_subtyp > -P_BOOMERANG && !G.objects[otyp].oc_magic) {
        let broken = 0;
        let chance = 0;
        chance = 3 + ((obj.oeroded | 0) > (obj.oeroded2 | 0) ? obj.oeroded | 0 : obj.oeroded2 | 0) - obj.spe;
        if (chance > 1) {
          broken = rn2(chance);
        } else {
          broken = !rn2(4) ? 1 : 0;
        }
        if (obj.blessed | 0 && !rnl(4)) {
          broken = 0;
        }
        if (broken) {
          if ($rd(P(G.u.ushops)) || obj.unpaid | 0) {
            await check_shop_obj(obj, G.bhitpos.x, G.bhitpos.y, TRUE);
          }
          await obfree(obj, null);
          return 1;
        }
      }
      await passive_obj(mon, obj, null);
    } else {
      await tmiss(obj, mon, TRUE);
      if (hmode === HMON_APPLIED) {
        await wakeup(mon, TRUE);
      }
    }
  } else if (otyp === HEAVY_IRON_BALL) {
    await exercise(A_STR, TRUE);
    if (tmp >= dieroll) {
      let was_swallowed = guaranteed_hit;
      await exercise(A_DEX, TRUE);
      if (!await hmon(mon, obj, hmode, dieroll)) {
        if (was_swallowed && !G.u.uswallow && obj === G.uball) {
          return 1;
        }
      }
    } else {
      await tmiss(obj, mon, TRUE);
    }
  } else if (otyp === BOULDER) {
    await exercise(A_STR, TRUE);
    if (tmp >= dieroll) {
      await exercise(A_DEX, TRUE);
      await hmon(mon, obj, hmode, dieroll);
    } else {
      await tmiss(obj, mon, TRUE);
    }
  } else if ((otyp === EGG || otyp === CREAM_PIE || otyp === BLINDING_VENOM || otyp === ACID_VENOM) && (guaranteed_hit || acurr(A_DEX) > rnd(25))) {
    await hmon(mon, obj, hmode, dieroll);
    return 1;
  } else if (obj.oclass === POTION_CLASS && (guaranteed_hit || acurr(A_DEX) > rnd(25))) {
    await potionhit(mon, obj, POTHIT_HERO_THROW);
    return 1;
  } else if ((mon.data === $sat(G.mons, 229) || mon.data === $sat(G.mons, 230) ? obj.otyp === 256 ? 1 : 0 : (mon.data.mflags2 & 4194304) >>> 0 !== 0 && obj.oclass === FOOD_CLASS && (mon.data.mlet !== S_UNICORN || (G.objects[obj.otyp].oc_material | 0) === VEGGY || obj.otyp === 240 && obj.corpsenm === 155) ? 1 : 0) || mon.mtame && await dogfood(mon, obj) <= ACCFOOD) {
    if (await tamedog(mon, obj)) {
      return 1;
    } else {
      await tmiss(obj, mon, FALSE);
      mon.msleeping = 0;
      mon.mstrategy = (mon.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
    }
  } else if (guaranteed_hit) {
    await wakeup(mon, TRUE);
    if (obj.otyp === CORPSE && ($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9))) {
      if ((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0) {
        await minstapetrify(G.u.ustuck, TRUE);
        if (!G.u.uswallow) {
          await delobj(obj);
          return 1;
        }
      }
    }
    await pline(S("%s into %s %s."), await Tobjnam(obj, S("vanish")), s_suffix(await mon_nam(mon)), (G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("entrails") : S("currents"));
  } else {
    await tmiss(obj, mon, TRUE);
  }
  return 0;
}

async function gem_accept(mon: struct_monst | null, obj: struct_obj | null): Promise<number> {
  let $g = 0;
  let buf = new Int8Array(256);
  let is_buddy = 0;
  let is_gem = 0;
  let ret = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      buf = new Int8Array(256);
      is_buddy = (sgn(mon.data.maligntyp) === sgn(G.u.ualign.type) ? 1 : 0) << 24 >> 24;
      is_gem = ((G.objects[obj.otyp].oc_material | 0) === GEMSTONE ? 1 : 0) << 24 >> 24;
      ret = 0;
      strcpy(P(buf), await Monnam(mon));
      mon.mpeaceful = 1;
      mon.mavenge = 0;
      if (obj.dknown | 0 && G.objects[obj.otyp].oc_name_known | 0) {
        if (is_gem) {
          if (is_buddy) {
            strcat(P(buf), P(gem_accept$addluck));
            change_luck(5);
          } else {
            strcat(P(buf), P(gem_accept$maybeluck));
            change_luck(rn2(7) - 3);
          }
        } else {
          strcat(P(buf), P(gem_accept$nogood));
          { $g = 1; continue $L; }
        }
      } else if (obj.oextra && obj.oextra.oname || G.objects[obj.otyp].oc_uname) {
        if (is_gem) {
          if (is_buddy) {
            strcat(P(buf), P(gem_accept$addluck));
            change_luck(2);
          } else {
            strcat(P(buf), P(gem_accept$maybeluck));
            change_luck(rn2(3) - 1);
          }
        } else {
          strcat(P(buf), P(gem_accept$nogood));
          { $g = 1; continue $L; }
        }
      } else {
        if (is_gem) {
          if (is_buddy) {
            strcat(P(buf), P(gem_accept$addluck));
            change_luck(1);
          } else {
            strcat(P(buf), P(gem_accept$maybeluck));
            change_luck(rn2(3) - 1);
          }
        } else {
          strcat(P(buf), P(gem_accept$noluck));
        }
      }
      strcat(P(buf), P(gem_accept$acceptgift));
      if ($rd(P(G.u.ushops)) || obj.unpaid | 0) {
        await check_shop_obj(obj, mon.mx, mon.my, TRUE);
      }
      await mpickobj(mon, obj);
      ret = 1;
    case 1: // nopick
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s"), P(buf));
      }
      if (!await tele_restrict(mon)) {
        await rloc(mon, TRUE);
      }
      return ret;
    }
    break;
  }
}

export async function hero_breaks(obj: struct_obj | null, x: number, y: number, from_invent: number): Promise<number> {
  let in_view = ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? FALSE : from_invent || $rd(G.viz_array.a[G.viz_array.o + y], x) & 2 ? 1 : 0) << 24 >> 24;
  if (!breaktest(obj)) {
    return 0;
  }
  await breakmsg(obj, in_view);
  await breakobj(obj, x, y, TRUE, from_invent);
  return 1;
}

export async function breaks(obj: struct_obj | null, x: number, y: number): Promise<number> {
  let in_view = ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? FALSE : $rd(G.viz_array.a[G.viz_array.o + y], x) & 2) << 24 >> 24;
  if (!breaktest(obj)) {
    return 0;
  }
  await breakmsg(obj, in_view);
  await breakobj(obj, x, y, FALSE, FALSE);
  return 1;
}

export async function release_camera_demon(obj: struct_obj | null, x: number, y: number): Promise<void> {
  let mtmp = null;
  if (!rn2(3) && !!(mtmp = await makemon($sat(G.mons, rn2(3) ? PM_HOMUNCULUS : PM_IMP), x, y, NO_MM_FLAGS))) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) {
      await pline(S("%s is released!"), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? await An(await rndmonnam(null)) : S("The picture-painting demon"));
    }
    mtmp.mpeaceful = ((!obj.cursed ? 1 : 0) >>> 0) & 1;
    set_malign(mtmp);
  }
}

export async function breakobj(obj: struct_obj | null, x: number, y: number, hero_caused: number, from_invent: number): Promise<void> {
  let fracture = FALSE;
  switch (obj.oclass === POTION_CLASS ? POT_WATER : obj.otyp) {
  case 205:
    if (hero_caused) {
      change_luck(-2);
    }
    break;
  case 297:
    obj.in_use = 1;
    if (obj.otyp === POT_OIL && obj.lamplit | 0) {
      await explode_oil(obj, x, y);
    } else if (dist2(x, y, G.u.ux, G.u.uy) <= 2) {
      if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) || (G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
        if (obj.otyp !== POT_WATER) {
          if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0)) {
            await You(S("smell a peculiar odor..."));
          } else {
            let eyes = body_part(EYE);
            if ((!((G.youmonst.data.mflags1 & 4096) >>> 0 === 0) ? 0 : G.youmonst.data === $sat(G.mons, 359) || G.youmonst.data === $sat(G.mons, 28) ? 1 : 2) !== 1) {
              eyes = await makeplural(eyes);
            }
            await Your(S("%s %s."), eyes, vtense(eyes, S("water")));
          }
        }
        await potionbreathe(obj);
      }
    }
    break;
  case 204:
    await release_camera_demon(obj, x, y);
    break;
  case 241:
    if (hero_caused && obj.spe && obj.corpsenm >= LOW_PM) {
      change_luck(-(obj.quan < 5 ? obj.quan : 5) << 24 >> 24);
    }
    break;
  case 448:
  case 449:
    fracture = TRUE;
    break;
  default:
    break;
  }
  if (hero_caused) {
    if (from_invent || obj.unpaid | 0) {
      if ($rd(P(G.u.ushops)) || obj.unpaid | 0) {
        await check_shop_obj(obj, x, y, TRUE);
      }
    } else if (!obj.no_charge && await costly_spot(x, y)) {
      let o_shop = in_rooms(x, y, SHOPBASE);
      let shkp = await shop_keeper(o_shop.a[o_shop.o]);
      if (shkp) {
        if (G.moves !== breakobj$lastmovetime) {
          breakobj$peaceful_shk = shkp.mpeaceful << 24 >> 24;
        }
        if (await stolen_value(obj, x, y, breakobj$peaceful_shk, FALSE) > 0 && (o_shop.a[o_shop.o] !== G.u.ushops[0] || !inside_shop(G.u.ux, G.u.uy)) && G.moves !== breakobj$lastmovetime) {
          await make_angry_shk(shkp, x, y);
        }
        breakobj$lastmovetime = G.moves;
      }
    }
  }
  if (!fracture) {
    await delobj(obj);
  }
}

export function breaktest(obj: struct_obj | null): number {
  if (obj_resists(obj, 1, 99)) {
    return 0;
  }
  if ((G.objects[obj.otyp].oc_material | 0) === GLASS && !obj.oartifact && obj.oclass !== GEM_CLASS) {
    return 1;
  }
  switch (obj.oclass === POTION_CLASS ? POT_WATER : obj.otyp) {
  case 204:
  case 297:
  case 241:
  case 262:
  case 255:
  case 453:
  case 452:
    return 1;
  default:
    return 0;
  }
}

async function breakmsg(obj: struct_obj | null, in_view: number): Promise<void> {
  let to_pieces = null;
  to_pieces = S("");
  switch (obj.oclass === POTION_CLASS ? POT_WATER : obj.otyp) {
  default:
    if (obj.oclass !== WAND_CLASS) {
      await impossible(S("breaking odd object?"));
    }
  case 101:
  case 207:
  case 205:
  case 206:
  case 204:
    to_pieces = S(" into a thousand pieces");
  case 297:
    if (!in_view) {
      await You_hear(S("%s shatter!"), G.c_common_strings.c_something);
    } else {
      await pline(S("%s shatter%s%s!"), await Doname2(obj), obj.quan === 1 ? S("s") : S(""), to_pieces);
    }
    break;
  case 241:
  case 255:
    await pline(S("Splat!"));
    break;
  case 262:
    if (in_view) {
      await pline(S("What a mess!"));
    }
    break;
  case 453:
  case 452:
    await pline(S("Splash!"));
    break;
  }
}

async function throw_gold(obj$: struct_obj | null): Promise<number> {
  const obj = [null];
  obj[0] = obj$;
  let range = 0;
  let odx = 0;
  let ody = 0;
  let mon = null;
  if (!G.u.dx && !G.u.dy && !G.u.dz) {
    await You(S("cannot throw gold at yourself."));
    return 0;
  }
  await freeinv(obj[0]);
  if (G.u.uswallow) {
    await pline((G.u.ustuck.data.mflags1 & 262144) >>> 0 !== 0 ? S("%s in the %s's entrails.") : S("%s into %s."), S("The money disappears"), await mon_nam(G.u.ustuck));
    await add_to_minv(G.u.ustuck, obj[0]);
    return 1;
  }
  if (G.u.dz) {
    if (G.u.dz < 0 && !((G.dungeon_topology.d_air_level.dlevel || G.dungeon_topology.d_air_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_air_level)) && !G.u.uinwater && !((G.dungeon_topology.d_water_level.dlevel || G.dungeon_topology.d_water_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_water_level))) {
      await pline_The(S("gold hits the %s, then falls back on top of your %s."), ceiling(G.u.ux, G.u.uy), body_part(HEAD));
      if (G.uarmh) {
        await pline(S("Fortunately, you are wearing %s!"), await an(helm_simple_name(G.uarmh)));
      }
    }
    G.bhitpos.x = G.u.ux;
    G.bhitpos.y = G.u.uy;
  } else {
    range = ((acurrstr() / 2 | 0) >>> 0) - (obj[0].owt / 40 >>> 0) >>> 0 | 0;
    odx = G.u.ux + G.u.dx;
    ody = G.u.uy + G.u.dy;
    if (!($at2(G.level.locations, odx, ody).typ >= POOL) || closed_door(odx, ody)) {
      G.bhitpos.x = G.u.ux;
      G.bhitpos.y = G.u.uy;
    } else {
      mon = await bhit(G.u.dx, G.u.dy, range, THROWN_WEAPON, null, null, P(obj, 0));
      if (!obj[0]) {
        return 1;
      }
      if (mon) {
        if (await ghitm(mon, obj[0])) {
          return 1;
        }
      } else {
        if (await ship_object(obj[0], G.bhitpos.x, G.bhitpos.y, FALSE)) {
          return 1;
        }
      }
    }
  }
  if (await flooreffects(obj[0], G.bhitpos.x, G.bhitpos.y, S("fall"))) {
    return 1;
  }
  if (G.u.dz > 0) {
    await pline_The(S("gold hits the %s."), surface(G.bhitpos.x, G.bhitpos.y));
  }
  await place_object(obj[0], G.bhitpos.x, G.bhitpos.y);
  if ($rd(P(G.u.ushops))) {
    await sellobj(obj[0], G.bhitpos.x, G.bhitpos.y);
  }
  await stackobj(obj[0]);
  await newsym(G.bhitpos.x, G.bhitpos.y);
  return 1;
}

export function $init(): void {
  toss_objs = $ta(Int8Array, 5, [ALLOW_COUNT, COIN_CLASS, ALL_CLASSES, WEAPON_CLASS]);
  bullets = $ta(Int8Array, 5, [ALLOW_COUNT, COIN_CLASS, ALL_CLASSES, GEM_CLASS]);
  gem_accept$nogood = $cs(" is not interested in your junk.", 33);
  gem_accept$acceptgift = $cs(" accepts your gift.", 20);
  gem_accept$maybeluck = $cs(" hesitatingly", 14);
  gem_accept$noluck = $cs(" graciously", 12);
  gem_accept$addluck = $cs(" gratefully", 12);
  breakobj$lastmovetime = 0;
  breakobj$peaceful_shk = 0;
}
