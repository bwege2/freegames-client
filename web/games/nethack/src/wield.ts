// @ts-nocheck
// NetHack 3.6.7 wield.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { arti_speak, artifact_light, restrict_name, retouch_object, undiscovered_artifact } from './artifact.ts';
import { acurr, exercise } from './attrib.ts';
import { yn_function } from './cmd.ts';
import { dropx } from './do.ts';
import { hcolor } from './do_name.ts';
import { reset_remarm } from './do_wear.ts';
import { inv_cnt } from './hack.ts';
import { strstri } from './hacklib.ts';
import { addinv, freeinv, getobj, prinv, splittable, update_inventory, useupall } from './invent.ts';
import { arti_light_description } from './light.ts';
import { costly_alteration, set_bknown, splitobj, uncurse, unsplitobj, weight } from './mkobj.ts';
import { discover_object } from './o_init.ts';
import { The, Tobjnam, Yname2, Yobjnam2, an, aobjnam, corpse_xname, doname, killer_xname, makeplural, otense, simpleonames, xname, yname } from './objnam.ts';
import { encumber_msg } from './pickup.ts';
import { You, You_cant, Your, pline } from './pline.ts';
import { body_part } from './polyself.ts';
import { strange_feeling } from './potion.ts';
import { rn2, rnd } from './rnd.ts';
import { Shk_Your, alter_cost, inside_shop, shop_keeper } from './shk.ts';
import { shkname } from './shknam.ts';
import { begin_burn, end_burn } from './timeout.ts';
import { instapetrify } from './trap.ts';
import { setworn } from './worn.ts';
import { struct_obj } from './structs.ts';
import { $sat, $ta, G, P, S, sprintf, strcpy, strncmp } from './rt/index.ts';
import { AKLYS, ALLOW_COUNT, ALLOW_NONE, ALL_CLASSES, ARMOR_CLASS, ARM_BOOTS, ARM_GLOVES, ART_MAGICBANE, ART_OGRESMASHER, A_DEX, BATTLE_AXE, BLINDED, COIN_CLASS, CORPSE, COST_DECHNT, COST_DEGRD, CRYSKNIFE, CXN_PFX_THE, FALSE, GEM_CLASS, GLIB, HALLUC, HALLUC_RES, HAND, HANDED, P_BOOMERANG, P_BOW, P_CROSSBOW, P_DART, P_LANCE, P_NONE, P_POLEARMS, P_SABER, P_SHORT_SWORD, P_SLING, SCROLL_CLASS, STONE_RES, STRANGE_OBJECT, TOOL_CLASS, TRUE, WEAPON_CLASS, WORM_TOOTH, W_ACCESSORY, W_ARMOR, W_QUIVER, W_SADDLE, W_SWAPWEP, W_WEP } from './consts.ts';

let wield_objs: any;
let ready_objs: any;
let bullets: any;

export async function setuwep(obj: struct_obj | null): Promise<void> {
  let olduwep = G.uwep;
  if (obj === G.uwep) {
    return;
  }
  await setworn(obj, W_WEP);
  if (G.uwep === obj && artifact_light(olduwep) && olduwep.lamplit | 0) {
    await end_burn(olduwep, FALSE);
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s shining."), await Tobjnam(olduwep, S("stop")));
    }
  }
  if (G.uwep === obj && (G.uwep && G.uwep.oartifact === ART_OGRESMASHER || olduwep && olduwep.oartifact === ART_OGRESMASHER)) {
    G.context.botl = 1;
  }
  if (obj) {
    G.unweapon = (obj.oclass === WEAPON_CLASS ? obj.oclass === WEAPON_CLASS && G.objects[obj.otyp].oc_subtyp >= P_BOW && G.objects[obj.otyp].oc_subtyp <= P_CROSSBOW || (obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW || (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART || (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && (G.objects[obj.otyp].oc_subtyp === P_POLEARMS || G.objects[obj.otyp].oc_subtyp === P_LANCE) && !G.u.usteed ? 1 : 0 : !(obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE) && !(obj.otyp === 209 && obj.spe > 0) ? 1 : 0) << 24 >> 24;
  } else {
    G.unweapon = TRUE;
  }
}

async function cant_wield_corpse(obj: struct_obj | null): Promise<number> {
  let kbuf = new Int8Array(256);
  if (G.uarmg || obj.otyp !== CORPSE || !($sat(G.mons, obj.corpsenm) === $sat(G.mons, 10) || $sat(G.mons, obj.corpsenm) === $sat(G.mons, 9)) || (G.u.uprops[STONE_RES].intrinsic || G.u.uprops[STONE_RES].extrinsic)) {
    return FALSE;
  }
  await You(S("wield %s in your bare %s."), await corpse_xname(obj, null, CXN_PFX_THE), await makeplural(body_part(HAND)));
  sprintf(P(kbuf), S("wielding %s bare-handed"), await killer_xname(obj));
  await instapetrify(P(kbuf));
  return TRUE;
}

async function ready_weapon(wep$: struct_obj | null): Promise<number> {
  const wep = [null];
  wep[0] = wep$;
  let res = 0;
  if (!wep[0]) {
    if (G.uwep) {
      await You(S("are empty %s."), body_part(HANDED));
      await setuwep(null);
      ++res;
    } else {
      await You(S("are already empty %s."), body_part(HANDED));
    }
  } else if (wep[0].otyp === CORPSE && await cant_wield_corpse(wep[0])) {
    ++res;
  } else if (G.uarms && ((wep[0].oclass === WEAPON_CLASS || wep[0].oclass === TOOL_CLASS) && G.objects[wep[0].otyp].oc_big | 0)) {
    await You(S("cannot wield a two-handed %s while wearing a shield."), wep[0].oclass === WEAPON_CLASS && G.objects[wep[0].otyp].oc_subtyp >= P_SHORT_SWORD && G.objects[wep[0].otyp].oc_subtyp <= P_SABER ? S("sword") : wep[0].otyp === BATTLE_AXE ? S("axe") : S("weapon"));
  } else if (!await retouch_object(P(wep, 0), FALSE)) {
    ++res;
  } else {
    ++res;
    if (wep[0].cursed | 0 && (wep[0].oclass === WEAPON_CLASS || wep[0].oclass === TOOL_CLASS && G.objects[wep[0].otyp].oc_subtyp !== P_NONE || wep[0].otyp === 450 || wep[0].otyp === 451 || wep[0].otyp === 214)) {
      let tmp = await xname(wep[0]);
      let thestr = S("The ");
      if (strncmp(tmp, thestr, 4) && !strncmp(await The(tmp), thestr, 4)) {
        tmp = thestr;
      } else {
        tmp = S("");
      }
      await pline(S("%s%s %s to your %s!"), tmp, await aobjnam(wep[0], S("weld")), wep[0].quan === 1 ? S("itself") : S("themselves"), (wep[0].oclass === WEAPON_CLASS || wep[0].oclass === TOOL_CLASS) && G.objects[wep[0].otyp].oc_big | 0 ? await makeplural(body_part(HAND)) : body_part(HAND));
      set_bknown(wep[0], 1);
    } else {
      let dummy = wep[0].owornmask;
      wep[0].owornmask = wep[0].owornmask | W_WEP;
      if (wep[0].otyp === AKLYS && (wep[0].owornmask & W_WEP) !== 0) {
        await You(S("secure the tether."));
      }
      await prinv(null, wep[0], 0);
      wep[0].owornmask = dummy;
    }
    await setuwep(wep[0]);
    await arti_speak(wep[0]);
    if (artifact_light(wep[0]) && !wep[0].lamplit) {
      await begin_burn(wep[0], FALSE);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s to shine %s!"), await Tobjnam(wep[0], S("begin")), arti_light_description(wep[0]));
      }
    }
    if (wep[0].unpaid) {
      let this_shkp = null;
      if (!!(this_shkp = await shop_keeper(inside_shop(G.u.ux, G.u.uy)))) {
        await pline(S("%s says \"You be careful with my %s!\""), await shkname(this_shkp), await xname(wep[0]));
      }
    }
  }
  return res;
}

export async function setuqwep(obj: struct_obj | null): Promise<void> {
  await setworn(obj, W_QUIVER);
  return;
}

export async function setuswapwep(obj: struct_obj | null): Promise<void> {
  await setworn(obj, W_SWAPWEP);
  return;
}

export async function dowield(): Promise<number> {
  let wep = null;
  let oldwep = null;
  let result = 0;
  G.multi = 0;
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1) {
    await pline(S("Don't be ridiculous!"));
    return 0;
  }
  if (!(wep = await getobj(P(wield_objs), S("wield")))) {
    return 0;
  } else if (wep === G.uwep) {
    await You(S("are already wielding that!"));
    if (wep.oclass === TOOL_CLASS && G.objects[wep.otyp].oc_subtyp !== P_NONE || wep.otyp === 209 && wep.spe > 0) {
      G.unweapon = FALSE;
    }
    return 0;
  } else if (welded(G.uwep)) {
    await weldmsg(G.uwep);
    reset_remarm();
    return 0;
  }
  if (wep === G.zeroobj) {
    wep = null;
  } else if (wep === G.uswapwep) {
    return await doswapweapon();
  } else if (wep === G.uquiver) {
    await setuqwep(null);
  } else if (wep.owornmask & (W_ARMOR | W_ACCESSORY | W_SADDLE)) {
    await You(S("cannot wield that!"));
    return 0;
  }
  oldwep = G.uwep;
  result = await ready_weapon(wep);
  if (G.flags.pushweapon && oldwep && G.uwep !== oldwep) {
    await setuswapwep(oldwep);
  }
  await untwoweapon();
  return result;
}

export async function doswapweapon(): Promise<number> {
  let oldwep = null;
  let oldswap = null;
  let result = 0;
  G.multi = 0;
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1) {
    await pline(S("Don't be ridiculous!"));
    return 0;
  }
  if (welded(G.uwep)) {
    await weldmsg(G.uwep);
    return 0;
  }
  oldwep = G.uwep;
  oldswap = G.uswapwep;
  await setuswapwep(null);
  result = await ready_weapon(oldswap);
  if (G.uwep === oldwep) {
    await setuswapwep(oldswap);
  } else {
    await setuswapwep(oldwep);
    if (G.uswapwep) {
      await prinv(null, G.uswapwep, 0);
    } else {
      await You(S("have no secondary weapon readied."));
    }
  }
  if (G.u.twoweap && !await can_twoweapon()) {
    await untwoweapon();
  }
  return result;
}

export async function dowieldquiver(): Promise<number> {
  let $g = 0;
  let qbuf = new Int8Array(128);
  let newquiver = null;
  let quivee_types = null;
  let res = 0;
  let finish_splitting = 0;
  let was_uwep = 0;
  let was_twoweap = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      qbuf = new Int8Array(128);
      finish_splitting = FALSE;
      was_uwep = FALSE;
      was_twoweap = G.u.twoweap;
      G.multi = 0;
      G.context.objsplit.child_oid = G.context.objsplit.parent_oid = 0;
      quivee_types = G.uwep && G.objects[G.uwep.otyp].oc_subtyp === P_SLING || G.uswapwep && G.objects[G.uswapwep.otyp].oc_subtyp === P_SLING ? P(bullets) : P(ready_objs);
      newquiver = await getobj(quivee_types, S("ready"));
      if (!!newquiver) { $g = 4; continue $L; }
      {
        return 0;
      }
      { $g = 3; continue $L; }
    case 4:
      if (!(newquiver === G.zeroobj)) { $g = 6; continue $L; }
      {
        if (G.uquiver) {
          await You(S("now have no ammunition readied."));
          await setuqwep(null);
        } else {
          await You(S("already have no ammunition readied!"));
        }
        return 0;
      }
      { $g = 5; continue $L; }
    case 6:
      if (!(newquiver.o_id === G.context.objsplit.child_oid)) { $g = 8; continue $L; }
      {
        if (G.uquiver && G.uquiver.o_id === G.context.objsplit.parent_oid) {
          await unsplitobj(newquiver);
          { $g = 1; continue $L; }
        }
        finish_splitting = TRUE;
      }
      { $g = 7; continue $L; }
    case 8:
      if (!(newquiver === G.uquiver)) { $g = 10; continue $L; }
    case 1: // already_quivered
      await pline(S("That ammunition is already readied!"));
      return 0;
      { $g = 9; continue $L; }
    case 10:
      if (newquiver.owornmask & (W_ARMOR | W_ACCESSORY | W_SADDLE)) {
        await You(S("cannot ready that!"));
        return 0;
      } else if (newquiver === G.uwep) {
        let weld_res = !G.uwep.bknown ? 1 : 0;
        if (welded(G.uwep)) {
          await weldmsg(G.uwep);
          reset_remarm();
          return weld_res;
        }
        if (G.uwep.quan > 1 && inv_cnt(FALSE) < 52 && splittable(G.uwep)) {
          sprintf(P(qbuf), S("You are wielding %ld %s.  Ready %ld of them?"), G.uwep.quan, await simpleonames(G.uwep), G.uwep.quan - 1);
          switch (await yn_function(P(qbuf), P(G.ynqchars), 113)) {
          case 113:
            return 0;
          case 121:
            newquiver = await splitobj(G.uwep, G.uwep.quan - 1);
            finish_splitting = TRUE;
            { $g = 2; continue $L; }
          default:
            break;
          }
          strcpy(P(qbuf), S("Ready all of them instead?"));
        } else {
          let use_plural = (G.uwep.quan !== 1 || G.uwep.oartifact === 26 && !undiscovered_artifact(26) || (G.uwep.otyp === 207 || G.uwep.oclass === ARMOR_CLASS && G.objects[G.uwep.otyp].oc_subtyp === ARM_GLOVES || G.uwep.oclass === ARMOR_CLASS && G.objects[G.uwep.otyp].oc_subtyp === ARM_BOOTS) ? 1 : 0) << 24 >> 24;
          sprintf(P(qbuf), S("You are wielding %s.  Ready %s instead?"), !use_plural ? S("that") : S("those"), !use_plural ? S("it") : S("them"));
        }
        if (await yn_function(P(qbuf), P(G.ynqchars), 113) !== 121) {
          await Shk_Your(P(qbuf), G.uwep);
          await pline(S("%s%s %s wielded."), P(qbuf), await simpleonames(G.uwep), otense(G.uwep, S("remain")));
          return 0;
        }
        await setuwep(null);
        await untwoweapon();
        was_uwep = TRUE;
      } else if (newquiver === G.uswapwep) {
        if (G.uswapwep.quan > 1 && inv_cnt(FALSE) < 52 && splittable(G.uswapwep)) {
          sprintf(P(qbuf), S("%s %ld %s.  Ready %ld of them?"), G.u.twoweap ? S("You are dual wielding") : S("Your alternate weapon is"), G.uswapwep.quan, await simpleonames(G.uswapwep), G.uswapwep.quan - 1);
          switch (await yn_function(P(qbuf), P(G.ynqchars), 113)) {
          case 113:
            return 0;
          case 121:
            newquiver = await splitobj(G.uswapwep, G.uswapwep.quan - 1);
            finish_splitting = TRUE;
            { $g = 2; continue $L; }
          default:
            break;
          }
          strcpy(P(qbuf), S("Ready all of them instead?"));
        } else {
          let use_plural = (G.uswapwep.quan !== 1 || G.uswapwep.oartifact === 26 && !undiscovered_artifact(26) || (G.uswapwep.otyp === 207 || G.uswapwep.oclass === ARMOR_CLASS && G.objects[G.uswapwep.otyp].oc_subtyp === ARM_GLOVES || G.uswapwep.oclass === ARMOR_CLASS && G.objects[G.uswapwep.otyp].oc_subtyp === ARM_BOOTS) ? 1 : 0) << 24 >> 24;
          sprintf(P(qbuf), S("%s your %s weapon.  Ready %s instead?"), !use_plural ? S("That is") : S("Those are"), G.u.twoweap ? S("second") : S("alternate"), !use_plural ? S("it") : S("them"));
        }
        if (await yn_function(P(qbuf), P(G.ynqchars), 113) !== 121) {
          await Shk_Your(P(qbuf), G.uswapwep);
          await pline(S("%s%s %s %s."), P(qbuf), await simpleonames(G.uswapwep), otense(G.uswapwep, S("remain")), G.u.twoweap ? S("wielded") : S("as secondary weapon"));
          return 0;
        }
        await setuswapwep(null);
        await untwoweapon();
      }
    case 9:
    case 7:
    case 5:
    case 3:
    case 2: // quivering
      if (finish_splitting) {
        await freeinv(newquiver);
        newquiver.nomerge = 1;
        await addinv(newquiver);
        newquiver.nomerge = 0;
      }
      await setuqwep(newquiver);
      await prinv(null, newquiver, 0);
      res = 0;
      if (was_uwep) {
        await You(S("are now empty %s."), body_part(HANDED));
        res = 1;
      } else if (was_twoweap && !G.u.twoweap) {
        await You(S("are no longer wielding two weapons at once."));
        res = 1;
      }
      return res;
    }
    break;
  }
}

export async function wield_tool(obj: struct_obj | null, verb: Ptr | null): Promise<number> {
  let what = null;
  let more_than_1 = 0;
  if (obj === G.uwep) {
    return TRUE;
  }
  if (!verb) {
    verb = S("wield");
  }
  what = await xname(obj);
  more_than_1 = (obj.quan > 1 || !!strstri(what, S("pair of ")) || !!strstri(what, S("s of ")) ? 1 : 0) << 24 >> 24;
  if (obj.owornmask & (W_ARMOR | W_ACCESSORY)) {
    await You_cant(S("%s %s while wearing %s."), verb, await yname(obj), more_than_1 ? S("them") : S("it"));
    return FALSE;
  }
  if (welded(G.uwep)) {
    if (G.flags.verbose) {
      let hand = body_part(HAND);
      if ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0) {
        hand = await makeplural(hand);
      }
      if (!!strstri(what, S("pair of "))) {
        more_than_1 = FALSE;
      }
      await pline(S("Since your weapon is welded to your %s, you cannot %s %s %s."), hand, verb, more_than_1 ? S("those") : S("that"), await xname(obj));
    } else {
      await You_cant(S("do that."));
    }
    return FALSE;
  }
  if ((G.youmonst.data.mflags1 & 8192) >>> 0 !== 0 || G.youmonst.data.msize < 1) {
    await You_cant(S("hold %s strongly enough."), more_than_1 ? S("them") : S("it"));
    return FALSE;
  }
  if (G.uarms && ((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0)) {
    await You(S("cannot %s a two-handed %s while wearing a shield."), verb, obj.oclass === WEAPON_CLASS ? S("weapon") : S("tool"));
    return FALSE;
  }
  if (G.uquiver === obj) {
    await setuqwep(null);
  }
  if (G.uswapwep === obj) {
    await doswapweapon();
    if (G.uswapwep === obj) {
      return FALSE;
    }
  } else {
    let oldwep = G.uwep;
    if (obj.cursed | 0 && (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || obj.otyp === 450 || obj.otyp === 451 || obj.otyp === 214)) {
      await ready_weapon(obj);
    } else {
      await You(S("now wield %s."), await doname(obj));
      await setuwep(obj);
    }
    if (G.flags.pushweapon && oldwep && G.uwep !== oldwep) {
      await setuswapwep(oldwep);
    }
  }
  if (G.uwep !== obj) {
    return FALSE;
  }
  if (G.u.twoweap) {
    await untwoweapon();
  }
  if (obj.oclass !== WEAPON_CLASS) {
    G.unweapon = TRUE;
  }
  return TRUE;
}

export async function can_twoweapon(): Promise<number> {
  let otmp = null;
  if (!(G.youmonst.data.mattk[1].aatyp === 254)) {
    if (G.u.umonnum !== G.u.umonster) {
      await You_cant(S("use two weapons in your current form."));
    } else {
      await pline(S("%s aren't able to use two weapons at once."), await makeplural(G.flags.female && G.urole.name.f ? G.urole.name.f : G.urole.name.m));
    }
  } else if (!G.uwep || !G.uswapwep) {
    await Your(S("%s%s%s empty."), G.uwep ? S("left ") : G.uswapwep ? S("right ") : S(""), body_part(HAND), !G.uwep && !G.uswapwep ? S("s are") : S(" is"));
  } else if (!(G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE) && G.uwep.oclass !== WEAPON_CLASS || !(G.uswapwep.oclass === TOOL_CLASS && G.objects[G.uswapwep.otyp].oc_subtyp !== P_NONE) && G.uswapwep.oclass !== WEAPON_CLASS) {
    otmp = !(G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE) && G.uwep.oclass !== WEAPON_CLASS ? G.uwep : G.uswapwep;
    await pline(S("%s %s."), await Yname2(otmp), otmp.quan !== 1 || otmp.oartifact === 26 && !undiscovered_artifact(26) ? S("aren't weapons") : S("isn't a weapon"));
  } else if ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0 || (G.uswapwep.oclass === WEAPON_CLASS || G.uswapwep.oclass === TOOL_CLASS) && G.objects[G.uswapwep.otyp].oc_big | 0) {
    otmp = (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0 ? G.uwep : G.uswapwep;
    await pline(S("%s isn't one-handed."), await Yname2(otmp));
  } else if (G.uarms) {
    await You_cant(S("use two weapons while wearing a shield."));
  } else if (G.uswapwep.oartifact) {
    await pline(S("%s being held second to another weapon!"), await Yobjnam2(G.uswapwep, S("resist")));
  } else if (G.uswapwep.otyp === CORPSE && await cant_wield_corpse(G.uswapwep)) {
    ;
  } else if (G.u.uprops[GLIB].intrinsic || G.uswapwep.cursed | 0) {
    if (!G.u.uprops[GLIB].intrinsic) {
      set_bknown(G.uswapwep, 1);
    }
    await drop_uswapwep();
  } else {
    return TRUE;
  }
  return FALSE;
}

export async function drop_uswapwep(): Promise<void> {
  let str = new Int8Array(256);
  let obj = G.uswapwep;
  strcpy(P(str), await makeplural(body_part(HAND)));
  await pline(S("%s from your %s!"), await Yobjnam2(obj, S("slip")), P(str));
  await dropx(obj);
}

export async function dotwoweapon(): Promise<number> {
  if (G.u.twoweap) {
    await You(S("switch to your primary weapon."));
    G.u.twoweap = 0;
    update_inventory();
    return 0;
  }
  if (await can_twoweapon()) {
    await You(S("begin two-weapon combat."));
    G.u.twoweap = 1;
    update_inventory();
    return rnd(20) > acurr(A_DEX) ? 1 : 0;
  }
  return 0;
}

export async function uwepgone(): Promise<void> {
  if (G.uwep) {
    if (artifact_light(G.uwep) && G.uwep.lamplit | 0) {
      await end_burn(G.uwep, FALSE);
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        await pline(S("%s shining."), await Tobjnam(G.uwep, S("stop")));
      }
    }
    await setworn(null, W_WEP);
    G.unweapon = TRUE;
    update_inventory();
  }
}

export async function uswapwepgone(): Promise<void> {
  if (G.uswapwep) {
    await setworn(null, W_SWAPWEP);
    update_inventory();
  }
}

export async function uqwepgone(): Promise<void> {
  if (G.uquiver) {
    await setworn(null, W_QUIVER);
    update_inventory();
  }
}

export async function untwoweapon(): Promise<void> {
  if (G.u.twoweap) {
    await You(S("can no longer use two weapons at once."));
    G.u.twoweap = FALSE;
    update_inventory();
  }
  return;
}

export async function chwepon(otmp: struct_obj | null, amount: number): Promise<number> {
  let color = hcolor(amount < 0 ? G.c_color_names.c_black : G.c_color_names.c_blue);
  let xtime = null;
  let wepname = S("");
  let multiple = 0;
  let otyp = STRANGE_OBJECT;
  if (!G.uwep || G.uwep.oclass !== WEAPON_CLASS && !(G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE)) {
    let buf = new Int8Array(256);
    if (amount >= 0 && G.uwep && (G.uwep.cursed | 0 && (G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS && G.objects[G.uwep.otyp].oc_subtyp !== P_NONE || G.uwep.otyp === 450 || G.uwep.otyp === 451 || G.uwep.otyp === 214))) {
      if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
        sprintf(P(buf), S("%s with %s aura."), await Yobjnam2(G.uwep, S("glow")), await an(hcolor(G.c_color_names.c_amber)));
        G.uwep.bknown = ((!(G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) ? 1 : 0) >>> 0) & 1;
      } else {
        sprintf(P(buf), S("Your right %s tingles."), body_part(HAND));
      }
      await uncurse(G.uwep);
      update_inventory();
    } else {
      sprintf(P(buf), S("Your %s %s."), await makeplural(body_part(HAND)), amount >= 0 ? S("twitch") : S("itch"));
    }
    await strange_feeling(otmp, P(buf));
    await exercise(A_DEX, (amount >= 0 ? 1 : 0) << 24 >> 24);
    return 0;
  }
  if (otmp && otmp.oclass === SCROLL_CLASS) {
    otyp = otmp.otyp;
  }
  if (G.uwep.otyp === WORM_TOOTH && amount >= 0) {
    multiple = (G.uwep.quan > 1 ? 1 : 0) << 24 >> 24;
    await Your(S("%s %s much sharper now."), await simpleonames(G.uwep), multiple ? S("fuse, and become") : S("is"));
    G.uwep.otyp = CRYSKNIFE;
    G.uwep.oerodeproof = 0;
    if (multiple) {
      G.uwep.quan = 1;
      G.uwep.owt = await weight(G.uwep) >>> 0;
    }
    if (G.uwep.cursed) {
      await uncurse(G.uwep);
    }
    if (G.uwep.unpaid) {
      await alter_cost(G.uwep, 0);
    }
    if (otyp !== STRANGE_OBJECT) {
      await discover_object(otyp, 1, 1);
    }
    if (multiple) {
      await encumber_msg();
    }
    return 1;
  } else if (G.uwep.otyp === CRYSKNIFE && amount < 0) {
    multiple = (G.uwep.quan > 1 ? 1 : 0) << 24 >> 24;
    await Your(S("%s %s much duller now."), await simpleonames(G.uwep), multiple ? S("fuse, and become") : S("is"));
    await costly_alteration(G.uwep, COST_DEGRD);
    G.uwep.otyp = WORM_TOOTH;
    G.uwep.oerodeproof = 0;
    if (multiple) {
      G.uwep.quan = 1;
      G.uwep.owt = await weight(G.uwep) >>> 0;
    }
    if (otyp !== STRANGE_OBJECT && otmp.bknown | 0) {
      await discover_object(otyp, 1, 1);
    }
    if (multiple) {
      await encumber_msg();
    }
    return 1;
  }
  if (G.uwep.oextra && G.uwep.oextra.oname) {
    wepname = G.uwep.oextra.oname;
  }
  if (amount < 0 && G.uwep.oartifact && restrict_name(G.uwep, wepname)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s %s."), await Yobjnam2(G.uwep, S("faintly glow")), color);
    }
    return 1;
  }
  if ((G.uwep.spe > 5 && amount >= 0 || G.uwep.spe < -5 && amount < 0) && rn2(3)) {
    if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
      await pline(S("%s %s for a while and then %s."), await Yobjnam2(G.uwep, S("violently glow")), color, otense(G.uwep, S("evaporate")));
    } else {
      await pline(S("%s."), await Yobjnam2(G.uwep, S("evaporate")));
    }
    await useupall(G.uwep);
    return 1;
  }
  if (!((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26))) {
    xtime = Math.imul(amount, amount) === 1 ? S("moment") : S("while");
    await pline(S("%s %s for a %s."), await Yobjnam2(G.uwep, amount === 0 ? S("violently glow") : S("glow")), color, xtime);
    if (otyp !== STRANGE_OBJECT && G.uwep.known | 0 && (amount > 0 || amount < 0 && otmp.bknown | 0)) {
      await discover_object(otyp, 1, 1);
    }
  }
  if (amount < 0) {
    await costly_alteration(G.uwep, COST_DECHNT);
  }
  G.uwep.spe = G.uwep.spe + amount << 24 >> 24;
  if (amount > 0) {
    if (G.uwep.cursed) {
      await uncurse(G.uwep);
    }
    if (G.uwep.unpaid) {
      await alter_cost(G.uwep, 0);
    }
  }
  if (G.uwep.oartifact === ART_MAGICBANE && G.uwep.spe >= 0) {
    await Your(S("right %s %sches!"), body_part(HAND), amount > 1 && G.uwep.spe > 1 ? S("flin") : S("it"));
  }
  if (G.uwep.spe > 5 && (G.uwep.otyp === 2 || G.uwep.otyp === 11 || G.uwep.otyp === 18 || G.uwep.otyp === 30 || G.uwep.otyp === 36 || G.uwep.otyp === 66 || G.uwep.oartifact || !rn2(7))) {
    await pline(S("%s unexpectedly."), await Yobjnam2(G.uwep, S("suddenly vibrate")));
  }
  return 1;
}

export function welded(obj: struct_obj | null): number {
  if (obj && obj === G.uwep && (obj.cursed | 0 && (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || obj.otyp === 450 || obj.otyp === 451 || obj.otyp === 214))) {
    set_bknown(obj, 1);
    return 1;
  }
  return 0;
}

export async function weldmsg(obj: struct_obj | null): Promise<void> {
  let savewornmask = 0;
  savewornmask = obj.owornmask;
  await pline(S("%s welded to your %s!"), await Yobjnam2(obj, S("are")), (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0 ? await makeplural(body_part(HAND)) : body_part(HAND));
  obj.owornmask = savewornmask;
}

export function mwelded(obj: struct_obj | null): number {
  if (obj && obj.owornmask & W_WEP && (obj.cursed | 0 && (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || obj.otyp === 450 || obj.otyp === 451 || obj.otyp === 214))) {
    return TRUE;
  }
  return FALSE;
}

export function $init(): void {
  wield_objs = $ta(Int8Array, 5, [ALL_CLASSES, ALLOW_NONE, WEAPON_CLASS, TOOL_CLASS]);
  ready_objs = $ta(Int8Array, 6, [ALLOW_COUNT, COIN_CLASS, ALL_CLASSES, ALLOW_NONE, WEAPON_CLASS]);
  bullets = $ta(Int8Array, 7, [ALLOW_COUNT, COIN_CLASS, ALL_CLASSES, ALLOW_NONE, GEM_CLASS, WEAPON_CLASS]);
}
