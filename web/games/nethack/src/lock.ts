// @ts-nocheck
// NetHack 3.6.7 lock.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { stop_occupation } from './allmain.ts';
import { is_magic_key } from './artifact.ts';
import { acurr, acurrstr, exercise } from './attrib.ts';
import { get_adjacent_loc, getdir, isok, set_occupation, yn_function } from './cmd.ts';
import { is_db_wall, is_drawbridge_wall, is_lava, is_pool } from './dbridge.ts';
import { feel_location, feel_newsym, map_invisible, newsym } from './display.ts';
import { Monnam, hliquid, mon_nam } from './do_name.ts';
import { on_level } from './dungeon.ts';
import { can_reach_floor, cant_reach_floor } from './engrave.ts';
import { in_rooms } from './hack.ts';
import { dist2, s_suffix } from './hacklib.ts';
import { currency, delobj, stackobj, useup } from './invent.ts';
import { costly_alteration, obj_extract_self, place_object, start_corpse_timeout } from './mkobj.ts';
import { wake_nearby, wake_nearto } from './mon.ts';
import { mb_trapped } from './monmove.ts';
import { An, an, ansimpleoname, doname, safe_qbuf, simple_typename, singular, the, xname, yname } from './objnam.ts';
import { container_at, doloot } from './pickup.ts';
import { There, You, You_cant, You_hear, impossible, pline, pline_The, verbalize } from './pline.ts';
import { bottlename, potionbreathe } from './potion.ts';
import { rn2, rnl } from './rnd.ts';
import { add_damage, costly_spot, obfree, shop_keeper, stolen_value } from './shk.ts';
import { maybe_absorb_item } from './steal.ts';
import { b_trapped, chest_trap, t_at } from './trap.ts';
import { stumble_onto_mimic } from './uhitm.ts';
import { block_point, unblock_point, vision_recalc } from './vision.ts';
import { worm_known } from './worm.ts';
import { obj_resists } from './zap.ts';
import { struct_nhcoord, struct_obj, struct_xlock_s } from './structs.ts';
import { $cs, $rd, $sat, $wr, G, P, S, sprintf } from './rt/index.ts';
import { A_CON, A_DEX, A_STR, A_WIS, BLINDED, CHEST, CONFUSION, CORPSE, COST_BRKLCK, CREDIT_CARD, DETECT_MONSTERS, DOOR, DRAWBRIDGE_DOWN, DRAWBRIDGE_UP, D_BROKEN, D_CLOSED, D_ISOPEN, D_LOCKED, D_NODOOR, D_TRAPPED, FALSE, FINGER, FLESH, GLASS, ICE_BOX, INFRAVISION, LEVITATION, LOCK_PICK, M_AP_FURNITURE, M_AP_OBJECT, OBJ_FLOOR, PAPER, PICKLOCK_DID_NOTHING, PICKLOCK_DID_SOMETHING, PICKLOCK_LEARNED_SOMETHING, PM_ORACLE, POTION_CLASS, PROT_FROM_SHAPE_CHANGERS, P_DAGGER, P_FLAIL, P_LANCE, P_NONE, P_PICK_AXE, P_SABER, ROCK_CLASS, SDOOR, SEE_INVIS, SHOPBASE, SHOP_DOOR_COST, SKELETON_KEY, SPE_KNOCK, STUNNED, S_hcdoor, S_vcdoor, TELEPAT, TOOL_CLASS, TRUE, TT_PIT, VEGGY, WAND_CLASS, WAN_OPENING, WARN_OF_MON, WAX, WEAPON_CLASS, WOOD } from './consts.ts';

let xlock: struct_xlock_s;
let lock_action$actions: any;
let pick_lock$no_longer: any;

export function picking_lock(x: Ptr | null, y: Ptr | null): number {
  if (G.occupation === picklock) {
    x.a[x.o] = G.u.ux + G.u.dx;
    y.a[y.o] = G.u.uy + G.u.dy;
    return TRUE;
  } else {
    x.a[x.o] = y.a[y.o] = 0;
    return FALSE;
  }
}

export function picking_at(x: number, y: number): number {
  return (G.occupation === picklock && xlock.door === $sat(G.level.locations[x], y) ? 1 : 0) << 24 >> 24;
}

function lock_action(): Ptr | null {
  if (xlock.door && !((xlock.door.flags | 0) & D_LOCKED)) {
    return lock_action$actions[0].add(2);
  } else if (xlock.box && !xlock.box.olocked) {
    return xlock.box.otyp === CHEST ? lock_action$actions[1].add(2) : lock_action$actions[2].add(2);
  } else if (xlock.picktyp === LOCK_PICK) {
    return lock_action$actions[3];
  } else if (xlock.picktyp === CREDIT_CARD) {
    return lock_action$actions[3];
  } else if (xlock.door) {
    return lock_action$actions[0];
  } else if (xlock.box) {
    return xlock.box.otyp === CHEST ? lock_action$actions[1] : lock_action$actions[2];
  } else {
    return lock_action$actions[3];
  }
}

async function picklock(): Promise<number> {
  if (xlock.box) {
    if (xlock.box.where !== OBJ_FLOOR || xlock.box.ox !== G.u.ux || xlock.box.oy !== G.u.uy) {
      return xlock.usedtime = 0;
    }
  } else {
    if (xlock.door !== $sat(G.level.locations[G.u.ux + G.u.dx], G.u.uy + G.u.dy)) {
      return xlock.usedtime = 0;
    }
    switch (xlock.door.flags | 0) {
    case 0:
      await pline(S("This doorway has no door."));
      return xlock.usedtime = 0;
    case 2:
      await You(S("cannot lock an open door."));
      return xlock.usedtime = 0;
    case 1:
      await pline(S("This door is broken."));
      return xlock.usedtime = 0;
    }
  }
  if (xlock.usedtime++ >= 50 || (G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You(S("give up your attempt at %s."), lock_action());
    await exercise(A_DEX, TRUE);
    return xlock.usedtime = 0;
  }
  if (rn2(100) >= xlock.chance) {
    return 1;
  }
  if ((!xlock.door ? xlock.box.otrapped | 0 : ((xlock.door.flags | 0) & D_TRAPPED) !== 0 ? 1 : 0) && xlock.magic_key) {
    xlock.chance += 20;
    if (await yn_function(S("You find a trap!  Do you want to try to disarm it?"), P(G.ynchars), 110) === 121) {
      let what = null;
      let alreadyunlocked = 0;
      if (xlock.door) {
        xlock.door.flags = (((xlock.door.flags | 0) & ~D_TRAPPED) >>> 0) & 31;
        what = S("door");
        alreadyunlocked = (!((xlock.door.flags | 0) & D_LOCKED) ? 1 : 0) << 24 >> 24;
      } else {
        xlock.box.otrapped = 0;
        what = xlock.box.otyp === CHEST ? S("chest") : S("box");
        alreadyunlocked = (!xlock.box.olocked ? 1 : 0) << 24 >> 24;
      }
      await You(S("succeed in disarming the trap.  The %s is still %slocked."), what, alreadyunlocked ? S("un") : S(""));
      await exercise(A_WIS, TRUE);
    } else {
      await You(S("stop %s."), lock_action());
      await exercise(A_WIS, FALSE);
    }
    return xlock.usedtime = 0;
  }
  await You(S("succeed in %s."), lock_action());
  if (xlock.door) {
    if ((xlock.door.flags | 0) & D_TRAPPED) {
      await b_trapped(S("door"), FINGER);
      xlock.door.flags = (D_NODOOR) & 31;
      unblock_point(G.u.ux + G.u.dx, G.u.uy + G.u.dy);
      if ($rd(in_rooms(G.u.ux + G.u.dx, G.u.uy + G.u.dy, SHOPBASE))) {
        await add_damage(G.u.ux + G.u.dx, G.u.uy + G.u.dy, SHOP_DOOR_COST);
      }
      await newsym(G.u.ux + G.u.dx, G.u.uy + G.u.dy);
    } else if ((xlock.door.flags | 0) & D_LOCKED) {
      xlock.door.flags = (D_CLOSED) & 31;
    } else {
      xlock.door.flags = (D_LOCKED) & 31;
    }
  } else {
    xlock.box.olocked = ((!xlock.box.olocked ? 1 : 0) >>> 0) & 1;
    xlock.box.lknown = 1;
    if (xlock.box.otrapped) {
      await chest_trap(xlock.box, FINGER, FALSE);
    }
  }
  await exercise(A_DEX, TRUE);
  return xlock.usedtime = 0;
}

export async function breakchestlock(box: struct_obj | null, destroyit: number): Promise<void> {
  if (!destroyit) {
    let hide_contents = box.cobj;
    box.cobj = null;
    await costly_alteration(box, COST_BRKLCK);
    box.cobj = hide_contents;
    box.olocked = 0;
    box.obroken = 1;
    box.lknown = 1;
  } else {
    let otmp = null;
    let shkp = $rd(P(G.u.ushops)) && await costly_spot(G.u.ux, G.u.uy) ? await shop_keeper($rd(P(G.u.ushops))) : null;
    let costly = (!!shkp ? 1 : 0) << 24 >> 24;
    let peaceful_shk = (costly && shkp.mpeaceful << 24 >> 24 ? 1 : 0) << 24 >> 24;
    let loss = 0;
    await pline(S("In fact, you've totally destroyed %s."), await the(await xname(box)));
    while (!!(otmp = box.cobj)) {
      await obj_extract_self(otmp);
      if (!rn2(3) || otmp.oclass === POTION_CLASS) {
        await chest_shatter_msg(otmp);
        if (costly) {
          loss += await stolen_value(otmp, G.u.ux, G.u.uy, peaceful_shk, TRUE);
        }
        if (otmp.quan === 1) {
          await obfree(otmp, null);
          continue;
        }
        await useup(otmp);
      }
      if (box.otyp === ICE_BOX && otmp.otyp === CORPSE) {
        otmp.age = G.monstermoves - otmp.age;
        await start_corpse_timeout(otmp);
      }
      await place_object(otmp, G.u.ux, G.u.uy);
      await stackobj(otmp);
    }
    if (costly) {
      loss += await stolen_value(box, G.u.ux, G.u.uy, peaceful_shk, TRUE);
    }
    if (loss) {
      await You(S("owe %ld %s for objects destroyed."), loss, await currency(loss));
    }
    await delobj(box);
  }
}

async function forcelock(): Promise<number> {
  if (xlock.box.ox !== G.u.ux || xlock.box.oy !== G.u.uy) {
    return xlock.usedtime = 0;
  }
  if (xlock.usedtime++ >= 50 || !G.uwep || (G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You(S("give up your attempt to force the lock."));
    if (xlock.usedtime >= 50) {
      await exercise(xlock.picktyp ? A_DEX : A_STR, TRUE);
    }
    return xlock.usedtime = 0;
  }
  if (xlock.picktyp) {
    if (rn2(1000 - G.uwep.spe) > 992 - ((G.uwep.oeroded | 0) > (G.uwep.oeroded2 | 0) ? G.uwep.oeroded | 0 : G.uwep.oeroded2 | 0) * 10 && !G.uwep.cursed && !obj_resists(G.uwep, 0, 99)) {
      await pline(S("%sour %s broke!"), G.uwep.quan > 1 ? S("One of y") : S("Y"), await xname(G.uwep));
      await useup(G.uwep);
      await You(S("give up your attempt to force the lock."));
      await exercise(A_DEX, TRUE);
      return xlock.usedtime = 0;
    }
  } else {
    wake_nearby();
  }
  if (rn2(100) >= xlock.chance) {
    return 1;
  }
  await You(S("succeed in forcing the lock."));
  await exercise(xlock.picktyp ? A_DEX : A_STR, TRUE);
  await breakchestlock(xlock.box, (!xlock.picktyp && !rn2(3) ? 1 : 0) << 24 >> 24);
  reset_pick();
  return 0;
}

export function reset_pick(): void {
  xlock.usedtime = xlock.chance = xlock.picktyp = 0;
  xlock.magic_key = FALSE;
  xlock.door = null;
  xlock.box = null;
}

export function maybe_reset_pick(container: struct_obj | null): void {
  if (container ? container === xlock.box ? 1 : 0 : !xlock.box || !(xlock.box.where === 3) ? 1 : 0) {
    reset_pick();
  }
}

export async function pick_lock(pick: struct_obj | null): Promise<number> {
  let picktyp = 0;
  let c = 0;
  let ch = 0;
  let cc = new struct_nhcoord();
  let door = null;
  let otmp = null;
  let qbuf = new Int8Array(128);
  picktyp = pick.otyp;
  if (xlock.usedtime && picktyp === xlock.picktyp) {
    if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
      let what = picktyp === LOCK_PICK ? S("pick") : S("key");
      if (picktyp === CREDIT_CARD) {
        what = S("card");
      }
      await pline(P(pick_lock$no_longer), S("hold the"), what);
      reset_pick();
      return PICKLOCK_LEARNED_SOMETHING;
    } else if (G.u.uswallow | 0 || xlock.box && !can_reach_floor(TRUE)) {
      await pline(P(pick_lock$no_longer), S("reach the"), S("lock"));
      reset_pick();
      return PICKLOCK_LEARNED_SOMETHING;
    } else {
      let action = lock_action();
      await You(S("resume your attempt at %s."), action);
      xlock.magic_key = is_magic_key(G.youmonst, pick);
      set_occupation(picklock, action, 0);
      return PICKLOCK_DID_SOMETHING;
    }
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You_cant(S("hold %s -- you have no hands!"), await doname(pick));
    return PICKLOCK_DID_NOTHING;
  } else if (G.u.uswallow) {
    await You_cant(S("%sunlock %s."), picktyp === CREDIT_CARD ? S("") : S("lock or "), await mon_nam(G.u.ustuck));
    return PICKLOCK_DID_NOTHING;
  }
  if (picktyp !== LOCK_PICK && picktyp !== CREDIT_CARD && picktyp !== SKELETON_KEY) {
    await impossible(S("picking lock with object %d?"), picktyp);
    return PICKLOCK_DID_NOTHING;
  }
  ch = 0;
  if (!await get_adjacent_loc(null, S("Invalid location!"), G.u.ux, G.u.uy, cc)) {
    return PICKLOCK_DID_NOTHING;
  }
  if (cc.x === G.u.ux && cc.y === G.u.uy) {
    let verb = null;
    let qsfx = new Int8Array(128);
    let it = 0;
    let count = 0;
    if (G.u.dz < 0) {
      await There(S("isn't any sort of lock up %s."), (G.u.uprops[LEVITATION].intrinsic || G.u.uprops[LEVITATION].extrinsic) && !G.u.uprops[LEVITATION].blocked ? S("here") : S("there"));
      return PICKLOCK_LEARNED_SOMETHING;
    } else if (is_lava(G.u.ux, G.u.uy)) {
      await pline(S("Doing that would probably melt %s."), await yname(pick));
      return PICKLOCK_LEARNED_SOMETHING;
    } else if (is_pool(G.u.ux, G.u.uy) && !G.u.uinwater) {
      await pline_The(S("%s has no lock."), hliquid(S("water")));
      return PICKLOCK_LEARNED_SOMETHING;
    }
    count = 0;
    c = 110;
    for (otmp = G.level.objects[cc.x][cc.y]; otmp; otmp = otmp.v.v_nexthere) {
      if (otmp.otyp === 189 || otmp.otyp === 190) {
        ++count;
        if (!can_reach_floor(TRUE)) {
          await You_cant(S("reach %s from up here."), await the(await xname(otmp)));
          return PICKLOCK_LEARNED_SOMETHING;
        }
        it = 0;
        if (otmp.obroken) {
          verb = S("fix");
        } else if (!otmp.olocked) {
          verb = S("lock"), it = 1;
        } else if (picktyp !== LOCK_PICK) {
          verb = S("unlock"), it = 1;
        } else {
          verb = S("pick");
        }
        sprintf(P(qsfx), S(" here; %s %s?"), verb, it ? S("it") : S("its lock"));
        await safe_qbuf(P(qbuf), S("There is "), P(qsfx), otmp, doname, ansimpleoname, S("a box"));
        otmp.lknown = 1;
        c = await yn_function(P(qbuf), P(G.ynqchars), 113);
        if (c === 113) {
          return 0;
        }
        if (c === 110) {
          continue;
        }
        if (otmp.obroken) {
          await You_cant(S("fix its broken lock with %s."), await doname(pick));
          return PICKLOCK_LEARNED_SOMETHING;
        } else if (picktyp === CREDIT_CARD && !otmp.olocked) {
          await You_cant(S("do that with %s."), await an(await simple_typename(picktyp)));
          return PICKLOCK_LEARNED_SOMETHING;
        }
        switch (picktyp) {
        case 198:
          ch = acurr(A_DEX) + 20 * (G.urole.malenum === 338 ? 1 : 0);
          break;
        case 197:
          ch = 4 * acurr(A_DEX) + 25 * (G.urole.malenum === 338 ? 1 : 0);
          break;
        case 196:
          ch = 75 + acurr(A_DEX);
          break;
        default:
          ch = 0;
        }
        if (otmp.cursed) {
          ch = ch / 2 | 0;
        }
        xlock.box = otmp;
        xlock.door = null;
        break;
      }
    }
    if (c !== 121) {
      if (!count) {
        await There(S("doesn't seem to be any sort of lock here."));
      }
      return PICKLOCK_LEARNED_SOMETHING;
    }
  } else {
    let mtmp = null;
    if (G.u.utrap && G.u.utraptype === TT_PIT) {
      await You_cant(S("reach over the edge of the pit."));
      return PICKLOCK_LEARNED_SOMETHING;
    }
    door = $sat(G.level.locations[cc.x], cc.y);
    mtmp = !!G.level.monsters[cc.x][cc.y] ? G.level.monsters[cc.x][cc.y] : null;
    if (mtmp && ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) && (mtmp.m_ap_type & 7) !== M_AP_FURNITURE && (mtmp.m_ap_type & 7) !== M_AP_OBJECT) {
      if (picktyp === CREDIT_CARD && (mtmp.isshk | 0 || mtmp.data === $sat(G.mons, PM_ORACLE))) {
        await verbalize(S("No checks, no credit, no problem."));
      } else {
        await pline(S("I don't think %s would appreciate that."), await mon_nam(mtmp));
      }
      return PICKLOCK_LEARNED_SOMETHING;
    } else if (mtmp && ((mtmp.m_ap_type & 7) === M_AP_FURNITURE && (mtmp.mappearance === S_hcdoor || mtmp.mappearance === S_vcdoor))) {
      await stumble_onto_mimic(mtmp);
      await maybe_absorb_item(mtmp, pick, 50, 10);
      return PICKLOCK_LEARNED_SOMETHING;
    }
    if (!(door.typ === DOOR)) {
      if (is_drawbridge_wall(cc.x, cc.y) >= 0) {
        await You(S("%s no lock on the drawbridge."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see"));
      } else {
        await You(S("%s no door there."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see"));
      }
      return PICKLOCK_LEARNED_SOMETHING;
    }
    switch (door.flags | 0) {
    case 0:
      await pline(S("This doorway has no door."));
      return PICKLOCK_LEARNED_SOMETHING;
    case 2:
      await You(S("cannot lock an open door."));
      return PICKLOCK_LEARNED_SOMETHING;
    case 1:
      await pline(S("This door is broken."));
      return PICKLOCK_LEARNED_SOMETHING;
    default:
      if (picktyp === CREDIT_CARD && !((door.flags | 0) & D_LOCKED)) {
        await You_cant(S("lock a door with a credit card."));
        return PICKLOCK_LEARNED_SOMETHING;
      }
      sprintf(P(qbuf), S("%s it?"), (door.flags | 0) & D_LOCKED ? S("Unlock") : S("Lock"));
      c = await yn_function(P(qbuf), P(G.ynchars), 110);
      if (c === 110) {
        return 0;
      }
      switch (picktyp) {
      case 198:
        ch = 2 * acurr(A_DEX) + 20 * (G.urole.malenum === 338 ? 1 : 0);
        break;
      case 197:
        ch = 3 * acurr(A_DEX) + 30 * (G.urole.malenum === 338 ? 1 : 0);
        break;
      case 196:
        ch = 70 + acurr(A_DEX);
        break;
      default:
        ch = 0;
      }
      xlock.door = door;
      xlock.box = null;
    }
  }
  G.context.move = 0;
  xlock.chance = ch;
  xlock.picktyp = picktyp;
  xlock.magic_key = is_magic_key(G.youmonst, pick);
  xlock.usedtime = 0;
  set_occupation(picklock, lock_action(), 0);
  return PICKLOCK_DID_SOMETHING;
}

export async function doforce(): Promise<number> {
  let otmp = null;
  let c = 0;
  let picktyp = 0;
  let qbuf = new Int8Array(128);
  if (G.u.uswallow) {
    await You_cant(S("force anything from inside here."));
    return 0;
  }
  if (!G.uwep || (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE ? G.objects[G.uwep.otyp].oc_subtyp < P_DAGGER || G.objects[G.uwep.otyp].oc_subtyp === P_FLAIL || G.objects[G.uwep.otyp].oc_subtyp > P_LANCE ? 1 : 0 : G.uwep.oclass !== ROCK_CLASS ? 1 : 0)) {
    await You_cant(S("force anything %s weapon."), !G.uwep ? S("when not wielding a") : G.uwep.oclass !== WEAPON_CLASS && !(G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE) ? S("without a proper") : S("with that"));
    return 0;
  }
  if (!can_reach_floor(TRUE)) {
    await cant_reach_floor(G.u.ux, G.u.uy, FALSE, TRUE);
    return 0;
  }
  picktyp = G.uwep.oclass === WEAPON_CLASS && G.objects[G.uwep.otyp].oc_subtyp >= P_DAGGER && G.objects[G.uwep.otyp].oc_subtyp <= P_SABER && !((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_subtyp === P_PICK_AXE) ? 1 : 0;
  if (xlock.usedtime && xlock.box && picktyp === xlock.picktyp) {
    await You(S("resume your attempt to force the lock."));
    set_occupation(forcelock, S("forcing the lock"), 0);
    return 1;
  }
  xlock.box = null;
  for (otmp = G.level.objects[G.u.ux][G.u.uy]; otmp; otmp = otmp.v.v_nexthere) {
    if (otmp.otyp === 189 || otmp.otyp === 190) {
      if (otmp.obroken | 0 || !otmp.olocked) {
        otmp.lknown = 0;
        await There(S("is %s here, but its lock is already %s."), await doname(otmp), otmp.obroken | 0 ? S("broken") : S("unlocked"));
        otmp.lknown = 1;
        continue;
      }
      await safe_qbuf(P(qbuf), S("There is "), S(" here; force its lock?"), otmp, doname, ansimpleoname, S("a box"));
      otmp.lknown = 1;
      c = await yn_function(P(qbuf), P(G.ynqchars), 113);
      if (c === 113) {
        return 0;
      }
      if (c === 110) {
        continue;
      }
      if (picktyp) {
        await You(S("force %s into a crack and pry."), await yname(G.uwep));
      } else {
        await You(S("start bashing it with %s."), await yname(G.uwep));
      }
      xlock.box = otmp;
      xlock.chance = G.objects[G.uwep.otyp].oc_wldam * 2;
      xlock.picktyp = picktyp;
      xlock.magic_key = FALSE;
      xlock.usedtime = 0;
      break;
    }
  }
  if (xlock.box) {
    set_occupation(forcelock, S("forcing the lock"), 0);
  } else {
    await You(S("decide not to force the issue."));
  }
  return 1;
}

export async function stumble_on_door_mimic(x: number, y: number): Promise<number> {
  let mtmp = null;
  if ((mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null) && ((mtmp.m_ap_type & 7) === M_AP_FURNITURE && (mtmp.mappearance === S_hcdoor || mtmp.mappearance === S_vcdoor)) && !(G.u.uprops[PROT_FROM_SHAPE_CHANGERS].intrinsic || G.u.uprops[PROT_FROM_SHAPE_CHANGERS].extrinsic)) {
    await stumble_onto_mimic(mtmp);
    return TRUE;
  }
  return FALSE;
}

export async function doopen(): Promise<number> {
  return await doopen_indir(0, 0);
}

export async function doopen_indir(x: number, y: number): Promise<number> {
  let cc = new struct_nhcoord();
  let door = null;
  let portcullis = 0;
  let res = 0;
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
    await You_cant(S("open anything -- you have no hands!"));
    return 0;
  }
  if (G.u.utrap && G.u.utraptype === TT_PIT) {
    await You_cant(S("reach over the edge of the pit."));
    return 0;
  }
  if (x > 0 && y > 0) {
    cc.x = x << 24 >> 24;
    cc.y = y << 24 >> 24;
  } else if (!await get_adjacent_loc(null, null, G.u.ux, G.u.uy, cc)) {
    return 0;
  }
  if (cc.x === G.u.ux && cc.y === G.u.uy) {
    return await doloot();
  }
  if (await stumble_on_door_mimic(cc.x, cc.y)) {
    return 1;
  }
  if (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[STUNNED].intrinsic) {
    res = 1;
  }
  door = $sat(G.level.locations[cc.x], cc.y);
  portcullis = (is_drawbridge_wall(cc.x, cc.y) >= 0 ? 1 : 0) << 24 >> 24;
  if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
    let oldglyph = door.glyph;
    let oldlastseentyp = G.lastseentyp[cc.x][cc.y];
    await feel_location(cc.x, cc.y);
    if (door.glyph !== oldglyph || G.lastseentyp[cc.x][cc.y] !== oldlastseentyp) {
      res = 1;
    }
  }
  if (portcullis || !(door.typ === DOOR)) {
    if (is_db_wall(cc.x, cc.y) || door.typ === DRAWBRIDGE_UP) {
      await There(S("is no obvious way to open the drawbridge."));
    } else if (portcullis || door.typ === DRAWBRIDGE_DOWN) {
      await pline_The(S("drawbridge is already open."));
    } else if (container_at(cc.x, cc.y, TRUE)) {
      await pline(S("%s like something lootable over there."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("Feels") : S("Seems"));
    } else {
      await You(S("%s no door there."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see"));
    }
    return res;
  }
  if (!((door.flags | 0) & D_CLOSED)) {
    let mesg = null;
    switch (door.flags | 0) {
    case 1:
      mesg = S(" is broken");
      break;
    case 0:
      mesg = S("way has no door");
      break;
    case 2:
      mesg = S(" is already open");
      break;
    default:
      mesg = S(" is locked");
      break;
    }
    await pline(S("This door%s."), mesg);
    return res;
  }
  if (G.youmonst.data.msize < 1) {
    await pline(S("You're too small to pull the door open."));
    return res;
  }
  if (rnl(20) < ((acurrstr() + acurr(A_DEX) + acurr(A_CON)) / 3 | 0)) {
    await pline_The(S("door opens."));
    if ((door.flags | 0) & D_TRAPPED) {
      await b_trapped(S("door"), FINGER);
      door.flags = (D_NODOOR) & 31;
      if ($rd(in_rooms(cc.x, cc.y, SHOPBASE))) {
        await add_damage(cc.x, cc.y, SHOP_DOOR_COST);
      }
    } else {
      door.flags = (D_ISOPEN) & 31;
    }
    await feel_newsym(cc.x, cc.y);
    unblock_point(cc.x, cc.y);
  } else {
    await exercise(A_STR, TRUE);
    await pline_The(S("door resists!"));
  }
  return 1;
}

async function obstructed(x: number, y: number, quietly: number): Promise<number> {
  let $g = 0;
  let mtmp = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      mtmp = !!G.level.monsters[x][y] ? G.level.monsters[x][y] : null;
      if (mtmp && (mtmp.m_ap_type & 7) !== M_AP_FURNITURE) {
        if ((mtmp.m_ap_type & 7) === M_AP_OBJECT) {
          { $g = 1; continue $L; }
        }
        if (!quietly) {
          if (mtmp.mx !== x || mtmp.my !== y) {
            await pline(S("%s%s blocks the way!"), !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? G.c_common_strings.c_Something : s_suffix(await Monnam(mtmp)), !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? S("") : S(" tail"));
          } else {
            await pline(S("%s blocks the way!"), !((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data))) ? S("Some creature") : await Monnam(mtmp));
          }
        }
        if (!((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected) || (!((mtmp.data.mflags1 & 65536) >>> 0 !== 0) && ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) && (G.u.uprops[TELEPAT].intrinsic || G.u.uprops[TELEPAT].extrinsic) || G.u.uprops[TELEPAT].extrinsic && dist2(mtmp.mx, mtmp.my, G.u.ux, G.u.uy) <= 8 * 8) || (G.u.uprops[DETECT_MONSTERS].intrinsic || G.u.uprops[DETECT_MONSTERS].extrinsic) || (G.u.uprops[WARN_OF_MON].intrinsic || G.u.uprops[WARN_OF_MON].extrinsic) && (G.context.warntype.obj && (G.context.warntype.obj & mtmp.data.mflags2) >>> 0 || G.context.warntype.polyd && (G.context.warntype.polyd & mtmp.data.mflags2) >>> 0 || G.context.warntype.species && G.context.warntype.species === mtmp.data)))) {
          await map_invisible(x, y);
        }
        return TRUE;
      }
      if (!!!G.level.objects[x][y]) { $g = 2; continue $L; }
    case 1: // objhere
      if (!quietly) {
        await pline(S("%s's in the way."), G.c_common_strings.c_Something);
      }
      return TRUE;
    case 2:
      return FALSE;
    }
    break;
  }
}

export async function doclose(): Promise<number> {
  let $g = 0;
  let x = 0;
  let y = 0;
  let door = null;
  let portcullis = 0;
  let res = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      res = 0;
      if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0) {
        await You_cant(S("close anything -- you have no hands!"));
        return 0;
      }
      if (G.u.utrap && G.u.utraptype === TT_PIT) {
        await You_cant(S("reach over the edge of the pit."));
        return 0;
      }
      if (!await getdir(null)) {
        return 0;
      }
      x = G.u.ux + G.u.dx;
      y = G.u.uy + G.u.dy;
      if (x === G.u.ux && y === G.u.uy) {
        await You(S("are in the way!"));
        return 1;
      }
      if (!isok(x, y)) {
        { $g = 1; continue $L; }
      }
      if (await stumble_on_door_mimic(x, y)) {
        return 1;
      }
      if (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[STUNNED].intrinsic) {
        res = 1;
      }
      door = $sat(G.level.locations[x], y);
      portcullis = (is_drawbridge_wall(x, y) >= 0 ? 1 : 0) << 24 >> 24;
      if ((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) {
        let oldglyph = door.glyph;
        let oldlastseentyp = G.lastseentyp[x][y];
        await feel_location(x, y);
        if (door.glyph !== oldglyph || G.lastseentyp[x][y] !== oldlastseentyp) {
          res = 1;
        }
      }
      if (!(portcullis || !(door.typ === DOOR))) { $g = 2; continue $L; }
      if (!(is_db_wall(x, y) || door.typ === DRAWBRIDGE_UP)) { $g = 4; continue $L; }
      await pline_The(S("drawbridge is already closed."));
      { $g = 3; continue $L; }
    case 4:
      if (!(portcullis || door.typ === DRAWBRIDGE_DOWN)) { $g = 6; continue $L; }
      await There(S("is no obvious way to close the drawbridge."));
      { $g = 5; continue $L; }
    case 6:
    case 1: // nodoor
      await You(S("%s no door there."), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("feel") : S("see"));
    case 5:
    case 3:
      return res;
    case 2:
      if ((door.flags | 0) === D_NODOOR) {
        await pline(S("This doorway has no door."));
        return res;
      } else if (await obstructed(x, y, FALSE)) {
        return res;
      } else if ((door.flags | 0) === D_BROKEN) {
        await pline(S("This door is broken."));
        return res;
      } else if ((door.flags | 0) & (D_CLOSED | D_LOCKED)) {
        await pline(S("This door is already closed."));
        return res;
      }
      if ((door.flags | 0) === D_ISOPEN) {
        if (G.youmonst.data.msize < 1 && !G.u.usteed) {
          await pline(S("You're too small to push the door closed."));
          return res;
        }
        if (G.u.usteed || rn2(25) < ((acurrstr() + acurr(A_DEX) + acurr(A_CON)) / 3 | 0)) {
          await pline_The(S("door closes."));
          door.flags = (D_CLOSED) & 31;
          await feel_newsym(x, y);
          block_point(x, y);
        } else {
          await exercise(A_STR, TRUE);
          await pline_The(S("door resists!"));
        }
      }
      return 1;
    }
    break;
  }
}

export async function boxlock(obj: struct_obj | null, otmp: struct_obj | null): Promise<number> {
  let res = 0;
  switch (otmp.otyp) {
  case 399:
  case 356:
    if (!obj.olocked) {
      await pline(S("Klunk!"));
      obj.olocked = 1;
      obj.obroken = 0;
      if (G.urole.malenum === 342) {
        obj.lknown = 1;
      } else {
        obj.lknown = 0;
      }
      res = 1;
    }
    break;
  case 398:
  case 350:
    if (obj.olocked) {
      await pline(S("Klick!"));
      obj.olocked = 0;
      res = 1;
      if (G.urole.malenum === 342) {
        obj.lknown = 1;
      } else {
        obj.lknown = 0;
      }
    } else {
      obj.obroken = 0;
    }
    break;
  case 395:
  case 374:
    if (xlock.box === obj) {
      reset_pick();
    }
    break;
  }
  return res;
}

export async function doorlock(otmp: struct_obj | null, x: number, y: number): Promise<number> {
  let door = $sat(G.level.locations[x], y);
  let res = TRUE;
  let loudness = 0;
  let msg = null;
  let dustcloud = S("A cloud of dust");
  let quickly_dissipates = S("quickly dissipates");
  let mysterywand = (otmp.oclass === WAND_CLASS && !otmp.dknown ? 1 : 0) << 24 >> 24;
  if (door.typ === SDOOR) {
    switch (otmp.otyp) {
    case 398:
    case 350:
    case 390:
    case 351:
      door.typ = DOOR;
      door.flags = ((D_CLOSED | (door.flags | 0) & D_TRAPPED) >>> 0) & 31;
      await newsym(x, y);
      if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
        await pline(S("A door appears in the wall!"));
      }
      if (otmp.otyp === WAN_OPENING || otmp.otyp === SPE_KNOCK) {
        return TRUE;
      }
      break;
    case 399:
    case 356:
    default:
      return FALSE;
    }
  }
  switch (otmp.otyp) {
  case 399:
  case 356:
    if ((G.dungeon_topology.d_rogue_level.dlevel || G.dungeon_topology.d_rogue_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_rogue_level)) {
      let vis = ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) << 24 >> 24;
      if (vis) {
        await pline(S("%s springs up in the older, more primitive doorway."), dustcloud);
      } else {
        await You_hear(S("a swoosh."));
      }
      if (await obstructed(x, y, mysterywand)) {
        if (vis) {
          await pline_The(S("cloud %s."), quickly_dissipates);
        }
        return FALSE;
      }
      block_point(x, y);
      door.typ = SDOOR, door.flags = (D_NODOOR) & 31;
      if (vis) {
        await pline_The(S("doorway vanishes!"));
      }
      await newsym(x, y);
      return TRUE;
    }
    if (await obstructed(x, y, mysterywand)) {
      return FALSE;
    }
    if (t_at(x, y)) {
      await pline(S("%s springs up in the doorway, but %s."), dustcloud, quickly_dissipates);
      return FALSE;
    }
    switch ((door.flags | 0) & ~D_TRAPPED) {
    case 4:
      msg = S("The door locks!");
      break;
    case 2:
      msg = S("The door swings shut, and locks!");
      break;
    case 1:
      msg = S("The broken door reassembles and locks!");
      break;
    case 0:
      msg = S("A cloud of dust springs up and assembles itself into a door!");
      break;
    default:
      res = FALSE;
      break;
    }
    block_point(x, y);
    door.flags = ((D_LOCKED | (door.flags | 0) & D_TRAPPED) >>> 0) & 31;
    await newsym(x, y);
    break;
  case 398:
  case 350:
    if ((door.flags | 0) & D_LOCKED) {
      msg = S("The door unlocks!");
      door.flags = ((D_CLOSED | (door.flags | 0) & D_TRAPPED) >>> 0) & 31;
    } else {
      res = FALSE;
    }
    break;
  case 390:
  case 351:
    if ((door.flags | 0) & (D_LOCKED | D_CLOSED)) {
      if ((door.flags | 0) & D_TRAPPED) {
        if (!!G.level.monsters[x][y]) {
          await mb_trapped(!!G.level.monsters[x][y] ? G.level.monsters[x][y] : null);
        } else if (G.flags.verbose) {
          if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
            await pline(S("KABOOM!!  You see a door explode."));
          } else {
            await You_hear(S("a distant explosion."));
          }
        }
        door.flags = (D_NODOOR) & 31;
        unblock_point(x, y);
        await newsym(x, y);
        loudness = 40;
        break;
      }
      door.flags = (D_BROKEN) & 31;
      if (G.flags.verbose) {
        if ($rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
          await pline_The(S("door crashes open!"));
        } else {
          await You_hear(S("a crashing sound."));
        }
      }
      unblock_point(x, y);
      await newsym(x, y);
      if (G.vision_full_recalc) {
        await vision_recalc(0);
      }
      loudness = 20;
    } else {
      res = FALSE;
    }
    break;
  default:
    await impossible(S("magic (%d) attempted on door."), otmp.otyp);
    break;
  }
  if (msg && $rd(G.viz_array.a[G.viz_array.o + y], x) & 2) {
    await pline(S("%s"), msg);
  }
  if (loudness > 0) {
    wake_nearto(x, y, loudness);
    if ($rd(in_rooms(x, y, SHOPBASE))) {
      await add_damage(x, y, 0);
    }
  }
  if (res && picking_at(x, y)) {
    await stop_occupation();
    reset_pick();
  }
  return res;
}

async function chest_shatter_msg(otmp: struct_obj | null): Promise<void> {
  let disposition = null;
  let thing = null;
  let save_Blinded = 0;
  if (otmp.oclass === POTION_CLASS) {
    await You(S("%s %s shatter!"), (G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26) ? S("hear") : S("see"), await an(bottlename()));
    if (!((G.youmonst.data.mflags1 & 1024) >>> 0 !== 0) || (G.youmonst.data.mflags1 & 4096) >>> 0 === 0) {
      await potionbreathe(otmp);
    }
    return;
  }
  save_Blinded = G.u.uprops[BLINDED].intrinsic;
  G.u.uprops[BLINDED].intrinsic = 1;
  thing = await singular(otmp, xname);
  G.u.uprops[BLINDED].intrinsic = save_Blinded;
  switch (G.objects[otmp.otyp].oc_material | 0) {
  case PAPER:
    disposition = S("is torn to shreds");
    break;
  case WAX:
    disposition = S("is crushed");
    break;
  case VEGGY:
    disposition = S("is pulped");
    break;
  case FLESH:
    disposition = S("is mashed");
    break;
  case GLASS:
    disposition = S("shatters");
    break;
  case WOOD:
    disposition = S("splinters to fragments");
    break;
  default:
    disposition = S("is destroyed");
    break;
  }
  await pline(S("%s %s!"), await An(thing), disposition);
}

export function $init(): void {
  xlock = new struct_xlock_s();
  lock_action$actions = [S("unlocking the door"),
S("unlocking the chest"),
S("unlocking the box"),
S("picking the lock")];
  pick_lock$no_longer = $cs("Unfortunately, you can no longer %s %s.", 40);
}
