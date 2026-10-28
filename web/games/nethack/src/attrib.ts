// @ts-nocheck
// NetHack 3.6.7 attrib.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { confers_luck, retouch_equipment, what_gives } from './artifact.ts';
import { see_monsters, shieldeff } from './display.ts';
import { done } from './end.ts';
import { debugcore } from './files.ts';
import { losehp, near_capacity } from './hack.ts';
import { copynchars, sgn, strncmpi, strstri } from './hacklib.ts';
import { carrying } from './invent.ts';
import { name_to_mon } from './mondata.ts';
import { bare_artifactname, the, ysimple_name } from './objnam.ts';
import { encumber_msg } from './pickup.ts';
import { You, You_feel, Your, pline, pline_The } from './pline.ts';
import { d, rn2, rnd } from './rnd.ts';
import { add_weapon_skill, lose_weapon_skill } from './weapon.ts';
import { anon_attrib_c_701, struct_innate, struct_obj, struct_poison_effect_message } from './structs.ts';
import { $cs, $peq, $sadd, $sarrOf, $sat, G, P, S, isupper, sprintf, strcmp, strcpy, strlen } from './rt/index.ts';
import { ART_EYES_OF_THE_OVERWORLD, ART_OGRESMASHER, AVAL, A_CHA, A_CON, A_CURRENT, A_DEX, A_INT, A_MAX, A_STR, A_WIS, BLINDED, BUFSZ, CLAIRVOYANT, COLD_RES, CONFUSION, DIED, DRAIN_RES, DUNCE_CAP, EXT_ENCUMBER, FAINTED, FAINTING, FALSE, FAST, FIRE_RES, FIXED_ABIL, FROMEXPER, FROMFORM, FROMOUTSIDE, FROMRACE, FROM_EXP, FROM_FORM, FROM_INTR, FROM_LYCN, FROM_NONE, FROM_RACE, FROM_ROLE, FUMBLING, GAUNTLETS_OF_POWER, G_UNIQ, HALLUC, HALLUC_RES, HELM_OF_OPPOSITE_ALIGNMENT, HUNGRY, HVY_ENCUMBER, INFRAVISION, INTRINSIC, INVIS, JUMPING, KILLED_BY, KILLED_BY_AN, LOW_PM, LUCKADD, LUCKMAX, LUCKMIN, LUCKSTONE, MAXULEV, MOD_ENCUMBER, NOT_HUNGRY, PM_ARCHEOLOGIST, PM_BARBARIAN, PM_CAVEMAN, PM_HEALER, PM_INCUBUS, PM_KNIGHT, PM_MONK, PM_PRIEST, PM_RANGER, PM_ROGUE, PM_SAMURAI, PM_SUCCUBUS, PM_TOURIST, PM_VALKYRIE, PM_WIZARD, POISONING, POISON_RES, REGENERATION, SATIATED, SEARCHING, SEE_INVIS, SHOCK_RES, SICK, SLEEP_RES, STEALTH, STRANGLED, STUNNED, S_NYMPH, TELEPORT_CONTROL, TIMEOUT, TRUE, VOMITING, WARNING, WEAK, WOUNDED_LEGS, W_ARMC, W_ARMF, W_ARMH } from './consts.ts';

let plusattr: any;
let minusattr: any;
let arc_abil: any;
let bar_abil: any;
let cav_abil: any;
let hea_abil: any;
let kni_abil: any;
let mon_abil: any;
let pri_abil: any;
let ran_abil: any;
let rog_abil: any;
let sam_abil: any;
let tou_abil: any;
let val_abil: any;
let wiz_abil: any;
let dwa_abil: any;
let elf_abil: any;
let gno_abil: any;
let orc_abil: any;
let hum_abil: any;
let poiseff: any;
let exertext: any;
let from_what$buf: any;
let from_what$because_of: any;

export async function adjattrib(ndx: number, incr: number, msgflg: number): Promise<number> {
  let old_acurr = 0;
  let old_abase = 0;
  let old_amax = 0;
  let decr = 0;
  let abonflg = 0;
  let attrstr = null;
  if (G.u.uprops[FIXED_ABIL].extrinsic || !incr) {
    return FALSE;
  }
  if ((ndx === A_INT || ndx === A_WIS) && G.uarmh && G.uarmh.otyp === DUNCE_CAP) {
    if (msgflg === 0) {
      await Your(S("cap constricts briefly, then relaxes again."));
    }
    return FALSE;
  }
  old_acurr = acurr(ndx);
  old_abase = G.u.acurr.a[ndx];
  old_amax = G.u.amax.a[ndx];
  G.u.acurr.a[ndx] += incr;
  if (incr > 0) {
    if (G.u.acurr.a[ndx] > G.u.amax.a[ndx]) {
      G.u.amax.a[ndx] = G.u.acurr.a[ndx];
      if (G.u.amax.a[ndx] > (ndx === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[ndx])) {
        G.u.acurr.a[ndx] = G.u.amax.a[ndx] = (ndx === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[ndx]) << 24 >> 24;
      }
    }
    attrstr = plusattr[ndx];
    abonflg = (G.u.abon.a[ndx] < 0 ? 1 : 0) << 24 >> 24;
  } else {
    if (G.u.acurr.a[ndx] < G.urace.attrmin[ndx]) {
      decr = rn2(G.urace.attrmin[ndx] - G.u.acurr.a[ndx] + 1);
      G.u.acurr.a[ndx] = G.urace.attrmin[ndx];
      G.u.amax.a[ndx] -= decr;
      if (G.u.amax.a[ndx] < G.urace.attrmin[ndx]) {
        G.u.amax.a[ndx] = G.urace.attrmin[ndx];
      }
    }
    attrstr = minusattr[ndx];
    abonflg = (G.u.abon.a[ndx] > 0 ? 1 : 0) << 24 >> 24;
  }
  if (acurr(ndx) === old_acurr) {
    if (msgflg === 0 && G.flags.verbose) {
      if (G.u.acurr.a[ndx] === old_abase && G.u.amax.a[ndx] === old_amax) {
        await pline(S("You're %s as %s as you can get."), abonflg ? S("currently") : S("already"), attrstr);
      } else {
        await Your(S("innate %s has %s."), G.attrname[ndx], incr > 0 ? S("improved") : S("declined"));
      }
    }
    return FALSE;
  }
  if (msgflg <= 0) {
    await You_feel(S("%s%s!"), incr > 1 || incr < -1 ? S("very ") : S(""), attrstr);
  }
  G.context.botl = TRUE;
  if (G.program_state.in_moveloop && (ndx === A_STR || ndx === A_CON)) {
    await encumber_msg();
  }
  return TRUE;
}

export async function gainstr(otmp: struct_obj | null, incr: number, givemsg: number): Promise<void> {
  let num = incr;
  if (!num) {
    if (G.u.acurr.a[A_STR] < 18) {
      num = rn2(4) ? 1 : rnd(6);
    } else if (G.u.acurr.a[A_STR] < 18 + 85) {
      num = rnd(10);
    } else {
      num = 1;
    }
  }
  await adjattrib(A_STR, otmp && otmp.cursed | 0 ? -num : num, givemsg ? -1 : 1);
}

export async function losestr(num: number): Promise<void> {
  let ustr = G.u.acurr.a[A_STR] - num;
  while (ustr < 3) {
    ++ustr;
    --num;
    if (G.u.umonnum !== G.u.umonster) {
      G.u.mh -= 6;
      G.u.mhmax -= 6;
    } else {
      G.u.uhp -= 6;
      G.u.uhpmax -= 6;
    }
  }
  await adjattrib(A_STR, -num, 1);
}

export async function poisontell(typ: number, exclaim: number): Promise<void> {
  let func = poiseff[typ].delivery_func;
  let msg_txt = poiseff[typ].effect_msg;
  if (typ === A_STR && acurr(A_STR) === 100 + 25) {
    msg_txt = S("innately weaker");
  } else if (typ === A_CON && acurr(A_CON) === 25) {
    msg_txt = S("sick inside");
  }
  await func(S("%s%c"), msg_txt, exclaim ? 33 : 46);
}

export async function poisoned(reason: Ptr | null, typ: number, pkiller: Ptr | null, fatal: number, thrown_weapon: number): Promise<void> {
  let i = 0;
  let loss = 0;
  let kprefix = KILLED_BY_AN;
  if (strcmp(reason, S("blast")) && !strstri(reason, S("poison"))) {
    let plural = (reason.a[reason.o + (strlen(reason) - 1)] === 115 ? 1 : 0) << 24 >> 24;
    await pline(S("%s%s %s poisoned!"), isupper(reason.a[reason.o] & 0xff) ? S("") : S("The "), reason, plural ? S("were") : S("was"));
  }
  if (G.u.uprops[POISON_RES].intrinsic || G.u.uprops[POISON_RES].extrinsic) {
    if (!strcmp(reason, S("blast"))) {
      await shieldeff(G.u.ux, G.u.uy);
    }
    await pline_The(S("poison doesn't seem to affect you."));
    return;
  }
  i = name_to_mon(pkiller);
  if (i >= LOW_PM && G.mons[i].geno & G_UNIQ) {
    kprefix = KILLED_BY;
    if (!(($sat(G.mons, i).mflags2 & 524288) >>> 0 !== 0)) {
      pkiller = await the(pkiller);
    }
  } else if (!strncmpi(pkiller, S("the "), 4) || !strncmpi(pkiller, S("an "), 3) || !strncmpi(pkiller, S("a "), 2)) {
    kprefix = KILLED_BY;
  }
  i = !fatal ? 1 : rn2(fatal + (thrown_weapon ? 20 : 0));
  if (i === 0 && typ !== A_CHA) {
    G.u.uhp = -1;
    G.context.botl = TRUE;
    await pline_The(S("poison was deadly..."));
  } else if (i > 5) {
    loss = thrown_weapon ? rnd(6) : rn2(10) + 6;
    await losehp(loss, pkiller, kprefix);
  } else {
    loss = thrown_weapon || !fatal ? 1 : d(2, 2);
    if (await adjattrib(typ, -loss, 1)) {
      await poisontell(typ, TRUE);
    }
  }
  if (G.u.uhp < 1) {
    G.killer.format = kprefix;
    strcpy(P(G.killer.name), pkiller);
    await done(strstri(pkiller, S("poison")) ? DIED : POISONING);
  }
  await encumber_msg();
}

export function change_luck(n: number): void {
  G.u.uluck = G.u.uluck + n << 24 >> 24;
  if (G.u.uluck < 0 && G.u.uluck < LUCKMIN) {
    G.u.uluck = LUCKMIN;
  }
  if (G.u.uluck > 0 && G.u.uluck > LUCKMAX) {
    G.u.uluck = LUCKMAX;
  }
}

export function stone_luck(parameter: number): number {
  let otmp = null;
  let bonchance = 0;
  for (otmp = G.invent; otmp; otmp = otmp.nobj) {
    if (confers_luck(otmp)) {
      if (otmp.cursed) {
        bonchance -= otmp.quan;
      } else if (otmp.blessed) {
        bonchance += otmp.quan;
      } else if (parameter) {
        bonchance += otmp.quan;
      }
    }
  }
  return sgn(bonchance | 0);
}

export function set_moreluck(): void {
  let luckbon = stone_luck(TRUE);
  if (!luckbon && !carrying(LUCKSTONE)) {
    G.u.moreluck = 0;
  } else if (luckbon >= 0) {
    G.u.moreluck = LUCKADD;
  } else {
    G.u.moreluck = -LUCKADD;
  }
}

export async function restore_attrib(): Promise<void> {
  let i = 0;
  let equilibrium = 0;
  ;
  for (i = 0; i < A_MAX; ++i) {
    equilibrium = i === A_STR && G.u.uhs >= WEAK ? -1 : 0;
    if (G.u.atemp.a[i] !== equilibrium && G.u.atime.a[i] !== 0) {
      if (!--G.u.atime.a[i]) {
        G.u.atemp.a[i] += G.u.atemp.a[i] > 0 ? -1 : 1;
        G.context.botl = TRUE;
        if (G.u.atemp.a[i]) {
          G.u.atime.a[i] = (100 / acurr(A_CON) | 0) << 24 >> 24;
        }
      }
    }
  }
  if (G.context.botl) {
    await encumber_msg();
  }
}

export async function exercise(i: number, inc_or_dec: number): Promise<void> {
  do {
    if (await debugcore(S("attrib.c"), 1)) {
      await pline(S("Exercise:"));
    }
  } while (0);
  if (i === A_INT || i === A_CHA) {
    return;
  }
  if (G.u.umonnum !== G.u.umonster && i !== A_WIS) {
    return;
  }
  if (Math.abs(G.u.aexe.a[i]) < AVAL) {
    G.u.aexe.a[i] += inc_or_dec ? rn2(19) > acurr(i) ? 1 : 0 : -rn2(2);
    do {
      if (await debugcore(S("attrib.c"), 1)) {
        await pline(S("%s, %s AEXE = %d"), i === A_STR ? S("Str") : i === A_WIS ? S("Wis") : i === A_DEX ? S("Dex") : S("Con"), inc_or_dec ? S("inc") : S("dec"), G.u.aexe.a[i]);
      }
    } while (0);
  }
  if (G.moves > 0 && (i === A_STR || i === A_CON)) {
    await encumber_msg();
  }
}

async function exerper(): Promise<void> {
  if (!(G.moves % 10)) {
    let hs = G.u.uhunger > 1000 ? SATIATED : G.u.uhunger > 150 ? NOT_HUNGRY : G.u.uhunger > 50 ? HUNGRY : G.u.uhunger > 0 ? WEAK : FAINTING;
    do {
      if (await debugcore(S("attrib.c"), 1)) {
        await pline(S("exerper: Hunger checks"));
      }
    } while (0);
    switch (hs) {
    case SATIATED:
      await exercise(A_DEX, FALSE);
      if (G.urole.malenum === 334) {
        await exercise(A_WIS, FALSE);
      }
      break;
    case NOT_HUNGRY:
      await exercise(A_CON, TRUE);
      break;
    case WEAK:
      await exercise(A_STR, FALSE);
      if (G.urole.malenum === 334) {
        await exercise(A_WIS, TRUE);
      }
      break;
    case FAINTING:
    case FAINTED:
      await exercise(A_CON, FALSE);
      break;
    }
    do {
      if (await debugcore(S("attrib.c"), 1)) {
        await pline(S("exerper: Encumber checks"));
      }
    } while (0);
    switch (near_capacity()) {
    case MOD_ENCUMBER:
      await exercise(A_STR, TRUE);
      break;
    case HVY_ENCUMBER:
      await exercise(A_STR, TRUE);
      await exercise(A_DEX, FALSE);
      break;
    case EXT_ENCUMBER:
      await exercise(A_DEX, FALSE);
      await exercise(A_CON, FALSE);
      break;
    }
  }
  if (!(G.moves % 5)) {
    do {
      if (await debugcore(S("attrib.c"), 1)) {
        await pline(S("exerper: Status checks"));
      }
    } while (0);
    if (G.u.uprops[CLAIRVOYANT].intrinsic & (INTRINSIC | TIMEOUT) && !G.u.uprops[CLAIRVOYANT].blocked) {
      await exercise(A_WIS, TRUE);
    }
    if (G.u.uprops[REGENERATION].intrinsic) {
      await exercise(A_STR, TRUE);
    }
    if (G.u.uprops[SICK].intrinsic || G.u.uprops[VOMITING].intrinsic) {
      await exercise(A_CON, FALSE);
    }
    if (G.u.uprops[CONFUSION].intrinsic || G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic)) {
      await exercise(A_WIS, FALSE);
    }
    if ((G.u.uprops[WOUNDED_LEGS].intrinsic || G.u.uprops[WOUNDED_LEGS].extrinsic) && !G.u.usteed || (G.u.uprops[FUMBLING].intrinsic || G.u.uprops[FUMBLING].extrinsic) || G.u.uprops[STUNNED].intrinsic) {
      await exercise(A_DEX, FALSE);
    }
  }
}

export async function exerchk(): Promise<void> {
  let $g = 0;
  let i = 0;
  let ax = 0;
  let mod_val = 0;
  let lolim = 0;
  let hilim = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      await exerper();
      if (G.moves >= G.context.next_attrib_check) {
        do {
          if (await debugcore(S("attrib.c"), 1)) {
            await pline(S("exerchk: ready to test. multi = %d."), G.multi);
          }
        } while (0);
      }
      if (!(G.moves >= G.context.next_attrib_check && !G.multi)) { $g = 2; continue $L; }
      do {
        if (await debugcore(S("attrib.c"), 1)) {
          await pline(S("exerchk: testing."));
        }
      } while (0);
      i = 0;
    case 3:
      if (!(i < A_MAX)) { $g = 5; continue $L; }
      ax = G.u.aexe.a[i];
      if (!ax) {
        { $g = 4; continue $L; };
      }
      mod_val = sgn(ax);
      lolim = G.urace.attrmin[i];
      hilim = i === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[i];
      if (hilim > 18) {
        hilim = 18;
      }
      if (ax < 0 ? G.u.acurr.a[i] <= lolim ? 1 : 0 : G.u.acurr.a[i] >= hilim ? 1 : 0) {
        { $g = 1; continue $L; }
      }
      if (G.u.umonnum !== G.u.umonster && i !== A_WIS) {
        { $g = 1; continue $L; }
      }
      do {
        if (await debugcore(S("attrib.c"), 1)) {
          await pline(S("exerchk: testing %s (%d)."), i === A_STR ? S("Str") : i === A_INT ? S("Int?") : i === A_WIS ? S("Wis") : i === A_DEX ? S("Dex") : i === A_CON ? S("Con") : i === A_CHA ? S("Cha?") : S("???"), ax);
        }
      } while (0);
      if (rn2(AVAL) > (i !== A_WIS ? Math.abs(ax) * 2 / 3 | 0 : Math.abs(ax))) {
        { $g = 1; continue $L; }
      }
      do {
        if (await debugcore(S("attrib.c"), 1)) {
          await pline(S("exerchk: changing %d."), i);
        }
      } while (0);
      if (await adjattrib(i, mod_val, -1)) {
        do {
          if (await debugcore(S("attrib.c"), 1)) {
            await pline(S("exerchk: changed %d."), i);
          }
        } while (0);
        G.u.aexe.a[i] = (ax = 0) << 24 >> 24;
        await You(S("%s %s."), mod_val > 0 ? S("must have been") : S("haven't been"), exertext[i][mod_val > 0 ? 0 : 1]);
      }
    case 1: // nextattrib
      G.u.aexe.a[i] = Math.imul(Math.abs(ax) / 2 | 0, mod_val) << 24 >> 24;
    case 4:
      ++i;
      { $g = 3; continue $L; }
    case 5:
      G.context.next_attrib_check += rn2(200) + 800;
      do {
        if (await debugcore(S("attrib.c"), 1)) {
          await pline(S("exerchk: next check at %ld."), G.context.next_attrib_check);
        }
      } while (0);
    case 2:
    }
    break;
  }
}

export function init_attr(np: number): void {
  let i = 0;
  let x = 0;
  let tryct = 0;
  for (i = 0; i < A_MAX; ++i) {
    G.u.acurr.a[i] = G.u.amax.a[i] = G.urole.attrbase[i];
    G.u.atemp.a[i] = G.u.atime.a[i] = 0;
    np -= G.urole.attrbase[i];
  }
  tryct = 0;
  while (np > 0 && tryct < 100) {
    x = rn2(100);
    for (i = 0; i < A_MAX && (x -= G.urole.attrdist[i]) > 0; ++i) {
      ;
    }
    if (i >= A_MAX) {
      continue;
    }
    if (G.u.acurr.a[i] >= (i === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[i])) {
      ++tryct;
      continue;
    }
    tryct = 0;
    ++G.u.acurr.a[i];
    ++G.u.amax.a[i];
    --np;
  }
  tryct = 0;
  while (np < 0 && tryct < 100) {
    x = rn2(100);
    for (i = 0; i < A_MAX && (x -= G.urole.attrdist[i]) > 0; ++i) {
      ;
    }
    if (i >= A_MAX) {
      continue;
    }
    if (G.u.acurr.a[i] <= G.urace.attrmin[i]) {
      ++tryct;
      continue;
    }
    tryct = 0;
    --G.u.acurr.a[i];
    --G.u.amax.a[i];
    ++np;
  }
}

export async function redist_attr(): Promise<void> {
  let i = 0;
  let tmp = 0;
  for (i = 0; i < A_MAX; ++i) {
    if (i === A_INT || i === A_WIS) {
      continue;
    }
    tmp = G.u.amax.a[i];
    G.u.amax.a[i] += rn2(5) - 2;
    if (G.u.amax.a[i] > (i === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[i])) {
      G.u.amax.a[i] = (i === A_STR && G.u.umonnum !== G.u.umonster && (G.youmonst.data.mflags2 & 67108864) >>> 0 !== 0 ? 18 + 100 : G.urace.attrmax[i]) << 24 >> 24;
    }
    if (G.u.amax.a[i] < G.urace.attrmin[i]) {
      G.u.amax.a[i] = G.urace.attrmin[i];
    }
    G.u.acurr.a[i] = (Math.imul(G.u.acurr.a[i], G.u.amax.a[i]) / tmp | 0) << 24 >> 24;
    if (G.u.acurr.a[i] < G.urace.attrmin[i]) {
      G.u.acurr.a[i] = G.urace.attrmin[i];
    }
  }
  await encumber_msg();
}

async function postadjabil(ability: Ptr | null): Promise<void> {
  if (!ability) {
    return;
  }
  if ($peq(ability, P(G.u.uprops[WARNING], "intrinsic")) || $peq(ability, P(G.u.uprops[SEE_INVIS], "intrinsic"))) {
    await see_monsters();
  }
}

function role_abil(r: number): struct_innate | null {
  let roleabils = $sarrOf([anon_attrib_c_701.$of(PM_ARCHEOLOGIST, arc_abil[0]),
anon_attrib_c_701.$of(PM_BARBARIAN, bar_abil[0]),
anon_attrib_c_701.$of(PM_CAVEMAN, cav_abil[0]),
anon_attrib_c_701.$of(PM_HEALER, hea_abil[0]),
anon_attrib_c_701.$of(PM_KNIGHT, kni_abil[0]),
anon_attrib_c_701.$of(PM_MONK, mon_abil[0]),
anon_attrib_c_701.$of(PM_PRIEST, pri_abil[0]),
anon_attrib_c_701.$of(PM_RANGER, ran_abil[0]),
anon_attrib_c_701.$of(PM_ROGUE, rog_abil[0]),
anon_attrib_c_701.$of(PM_SAMURAI, sam_abil[0]),
anon_attrib_c_701.$of(PM_TOURIST, tou_abil[0]),
anon_attrib_c_701.$of(PM_VALKYRIE, val_abil[0]),
anon_attrib_c_701.$of(PM_WIZARD, wiz_abil[0]),
anon_attrib_c_701.$of()]);
  let i = 0;
  for (i = 0; roleabils[i].abil && roleabils[i].role !== r; ++i) {
    continue;
  }
  return roleabils[i].abil;
}

function check_innate_abil(ability: Ptr | null, frommask: number): struct_innate | null {
  let abil = null;
  if (frommask === FROMEXPER) {
    abil = role_abil(G.urole.malenum);
  } else if (frommask === FROMRACE) {
    switch (G.urace.malenum) {
    case 43:
      abil = dwa_abil[0];
      break;
    case 260:
      abil = elf_abil[0];
      break;
    case 162:
      abil = gno_abil[0];
      break;
    case 71:
      abil = orc_abil[0];
      break;
    case 256:
      abil = hum_abil[0];
      break;
    default:
      break;
    }
  }
  while (abil && abil.ability) {
    if ($peq(abil.ability, ability) && G.u.ulevel >= abil.ulevel) {
      return abil;
    }
    abil = $sadd(abil, 1);
  }
  return null;
}

function innately(ability: Ptr | null): number {
  let iptr = null;
  if (!!(iptr = check_innate_abil(ability, FROMEXPER))) {
    return iptr.ulevel === 1 ? FROM_ROLE : FROM_EXP;
  }
  if (!!(iptr = check_innate_abil(ability, FROMRACE))) {
    return FROM_RACE;
  }
  if ((ability.a[ability.o] & FROMOUTSIDE) !== 0) {
    return FROM_INTR;
  }
  if ((ability.a[ability.o] & FROMFORM) !== 0) {
    return FROM_FORM;
  }
  return FROM_NONE;
}

export function is_innate(propidx: number): number {
  let innateness = 0;
  if (propidx === DRAIN_RES && G.u.ulycn >= LOW_PM) {
    return FROM_LYCN;
  }
  if (propidx === FAST && (G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic)) {
    return FROM_NONE;
  }
  if ((innateness = innately(P(G.u.uprops[propidx], "intrinsic"))) !== FROM_NONE) {
    return innateness;
  }
  if (propidx === JUMPING && G.urole.malenum === 333 && !G.u.uprops[propidx].extrinsic) {
    return FROM_ROLE;
  }
  if (propidx === BLINDED && !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
    return FROM_FORM;
  }
  return FROM_NONE;
}

export async function from_what(propidx: number): Promise<Ptr | null> {
  from_what$buf[0] = 0;
  if (G.flags.debug) {
    if (propidx >= 0) {
      let p = null;
      let obj = null;
      let innateness = is_innate(propidx);
      if (propidx === BLINDED && G.u.uroleplay.blind) {
        sprintf(P(from_what$buf), S(" from birth"));
      } else if (innateness === FROM_ROLE || innateness === FROM_RACE) {
        strcpy(P(from_what$buf), S(" innately"));
      } else if (innateness === FROM_INTR) {
        strcpy(P(from_what$buf), S(" intrinsically"));
      } else if (innateness === FROM_EXP) {
        strcpy(P(from_what$buf), S(" because of your experience"));
      } else if (innateness === FROM_LYCN) {
        strcpy(P(from_what$buf), S(" due to your lycanthropy"));
      } else if (innateness === FROM_FORM) {
        strcpy(P(from_what$buf), S(" from current creature form"));
      } else if (propidx === FAST && (G.u.uprops[FAST].intrinsic & ~(67108864 | 33554432 | 16777216) || G.u.uprops[FAST].extrinsic)) {
        sprintf(P(from_what$buf), P(from_what$because_of), (G.u.uprops[FAST].intrinsic & TIMEOUT) !== 0 ? S("a potion or spell") : (G.u.uprops[FAST].extrinsic & W_ARMF) !== 0 && G.uarmf.dknown | 0 && G.objects[G.uarmf.otyp].oc_name_known | 0 ? await ysimple_name(G.uarmf) : G.u.uprops[FAST].extrinsic ? S("worn equipment") : G.c_common_strings.c_something);
      } else if (G.flags.debug && !!(obj = what_gives(P(G.u.uprops[propidx], "extrinsic")))) {
        sprintf(P(from_what$buf), P(from_what$because_of), obj.oartifact ? await bare_artifactname(obj) : await ysimple_name(obj));
      } else if (propidx === BLINDED && (G.ublindf && G.ublindf.otyp !== 207 && G.ublindf.oartifact !== 26 && !G.u.uroleplay.blind && !G.u.uprops[BLINDED].intrinsic && (G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) {
        sprintf(P(from_what$buf), P(from_what$because_of), await ysimple_name(G.ublindf));
      }
      if (!!(p = strstri(P(from_what$buf), S(" pair of ")))) {
        copynchars(p.add(1), p.add(9), BUFSZ);
      } else if (propidx === STRANGLED && !!(p = strstri(P(from_what$buf), S(" of strangulation")))) {
        p.a[p.o] = 0;
      }
    } else {
      switch (-propidx) {
      case BLINDED:
        if (G.ublindf && G.ublindf.oartifact === ART_EYES_OF_THE_OVERWORLD) {
          sprintf(P(from_what$buf), P(from_what$because_of), await bare_artifactname(G.ublindf));
        }
        break;
      case INVIS:
        if (G.u.uprops[INVIS].blocked & W_ARMC) {
          sprintf(P(from_what$buf), P(from_what$because_of), await ysimple_name(G.uarmc));
        }
        break;
      case CLAIRVOYANT:
        if (G.flags.debug && G.u.uprops[CLAIRVOYANT].blocked & W_ARMH) {
          sprintf(P(from_what$buf), P(from_what$because_of), await ysimple_name(G.uarmh));
        }
        break;
      }
    }
  }
  return P(from_what$buf);
}

export async function adjabil(oldlevel: number, newlevel: number): Promise<void> {
  let abil = null;
  let rabil = null;
  let prevabil = 0;
  let mask = FROMEXPER;
  abil = role_abil(G.urole.malenum);
  switch (G.urace.malenum) {
  case 260:
    rabil = elf_abil[0];
    break;
  case 71:
    rabil = orc_abil[0];
    break;
  case 256:
  case 43:
  case 162:
  default:
    rabil = null;
    break;
  }
  while (abil || rabil) {
    if (!abil || !abil.ability) {
      if (!rabil || !rabil.ability) {
        break;
      }
      abil = rabil;
      rabil = null;
      mask = FROMRACE;
    }
    prevabil = abil.ability.a[abil.ability.o];
    if (oldlevel < abil.ulevel && newlevel >= abil.ulevel) {
      if (abil.ulevel === 1) {
        abil.ability.a[abil.ability.o] = abil.ability.a[abil.ability.o] | (mask | FROMOUTSIDE);
      } else {
        abil.ability.a[abil.ability.o] = abil.ability.a[abil.ability.o] | mask;
      }
      if (!(abil.ability.a[abil.ability.o] & INTRINSIC & ~mask)) {
        if (abil.gainstr.a[abil.gainstr.o]) {
          await You_feel(S("%s!"), abil.gainstr);
        }
      }
    } else if (oldlevel >= abil.ulevel && newlevel < abil.ulevel) {
      abil.ability.a[abil.ability.o] = abil.ability.a[abil.ability.o] & ~mask;
      if (!(abil.ability.a[abil.ability.o] & INTRINSIC)) {
        if (abil.losestr.a[abil.losestr.o]) {
          await You_feel(S("%s!"), abil.losestr);
        } else if (abil.gainstr.a[abil.gainstr.o]) {
          await You_feel(S("less %s!"), abil.gainstr);
        }
      }
    }
    if (prevabil !== abil.ability.a[abil.ability.o]) {
      await postadjabil(abil.ability);
    }
    abil = $sadd(abil, 1);
  }
  if (oldlevel > 0) {
    if (newlevel > oldlevel) {
      await add_weapon_skill(newlevel - oldlevel);
    } else {
      await lose_weapon_skill(oldlevel - newlevel);
    }
  }
}

export function newhp(): number {
  let hp = 0;
  let conplus = 0;
  if (G.u.ulevel === 0) {
    hp = G.urole.hpadv.infix + G.urace.hpadv.infix;
    if (G.urole.hpadv.inrnd > 0) {
      hp += rnd(G.urole.hpadv.inrnd);
    }
    if (G.urace.hpadv.inrnd > 0) {
      hp += rnd(G.urace.hpadv.inrnd);
    }
    if (G.moves <= 1) {
      G.u.ualign.type = G.aligns[G.flags.initalign].value;
      G.u.ualign.record = G.urole.initrecord;
    }
  } else {
    if (G.u.ulevel < G.urole.xlev) {
      hp = G.urole.hpadv.lofix + G.urace.hpadv.lofix;
      if (G.urole.hpadv.lornd > 0) {
        hp += rnd(G.urole.hpadv.lornd);
      }
      if (G.urace.hpadv.lornd > 0) {
        hp += rnd(G.urace.hpadv.lornd);
      }
    } else {
      hp = G.urole.hpadv.hifix + G.urace.hpadv.hifix;
      if (G.urole.hpadv.hirnd > 0) {
        hp += rnd(G.urole.hpadv.hirnd);
      }
      if (G.urace.hpadv.hirnd > 0) {
        hp += rnd(G.urace.hpadv.hirnd);
      }
    }
    if (acurr(A_CON) <= 3) {
      conplus = -2;
    } else if (acurr(A_CON) <= 6) {
      conplus = -1;
    } else if (acurr(A_CON) <= 14) {
      conplus = 0;
    } else if (acurr(A_CON) <= 16) {
      conplus = 1;
    } else if (acurr(A_CON) === 17) {
      conplus = 2;
    } else if (acurr(A_CON) === 18) {
      conplus = 3;
    } else {
      conplus = 4;
    }
    hp += conplus;
  }
  if (hp <= 0) {
    hp = 1;
  }
  if (G.u.ulevel < MAXULEV) {
    G.u.uhpinc[G.u.ulevel] = hp << 24 >> 24;
  }
  return hp;
}

export function acurr(x: number): number {
  let tmp = G.u.abon.a[x] + G.u.atemp.a[x] + G.u.acurr.a[x];
  if (x === A_STR) {
    if (tmp >= 125 || G.uarmg && G.uarmg.otyp === GAUNTLETS_OF_POWER) {
      return 125;
    } else {
      return (tmp <= 3 ? 3 : tmp) << 24 >> 24;
    }
  } else if (x === A_CHA) {
    if (tmp < 18 && (G.youmonst.data.mlet === S_NYMPH || G.u.umonnum === PM_SUCCUBUS || G.u.umonnum === PM_INCUBUS)) {
      return 18;
    }
  } else if (x === A_CON) {
    if (G.uwep && G.uwep.oartifact === ART_OGRESMASHER) {
      return 25;
    }
  } else if (x === A_INT || x === A_WIS) {
    if (G.uarmh && G.uarmh.otyp === DUNCE_CAP) {
      return 6;
    }
  }
  return (tmp >= 25 ? 25 : tmp <= 3 ? 3 : tmp) << 24 >> 24;
}

export function acurrstr(): number {
  let str = acurr(A_STR);
  if (str <= 18) {
    return str << 24 >> 24;
  }
  if (str <= 121) {
    return 19 + (str / 50 | 0) << 24 >> 24;
  } else {
    return (str < 125 ? str : 125) - 100 << 24 >> 24;
  }
}

export function extremeattr(attrindx: number): number {
  let lolimit = 3;
  let hilimit = 25;
  let curval = acurr(attrindx);
  if (attrindx === A_STR) {
    hilimit = 100 + 25;
    if (G.uarmg && G.uarmg.otyp === GAUNTLETS_OF_POWER) {
      lolimit = hilimit;
    }
  } else if (attrindx === A_CON) {
    if (G.uwep && G.uwep.oartifact === ART_OGRESMASHER) {
      lolimit = hilimit;
    }
  }
  if (attrindx === A_INT || attrindx === A_WIS) {
    if (G.uarmh && G.uarmh.otyp === DUNCE_CAP) {
      hilimit = lolimit = 6;
    }
  }
  return (curval === lolimit || curval === hilimit ? TRUE : FALSE) << 24 >> 24;
}

export function adjalign(n: number): void {
  let newalign = G.u.ualign.record + n;
  if (n < 0) {
    if (newalign < G.u.ualign.record) {
      G.u.ualign.record = newalign;
    }
  } else if (newalign > G.u.ualign.record) {
    G.u.ualign.record = newalign;
    if (G.u.ualign.record > 10 + Math.trunc(G.moves / 200)) {
      G.u.ualign.record = 10 + Math.trunc(G.moves / 200) | 0;
    }
  }
}

export async function uchangealign(newalign: number, reason: number): Promise<void> {
  let oldalign = G.u.ualign.type;
  G.u.ublessed = 0;
  G.context.botl = TRUE;
  if (reason === 0) {
    G.u.ualignbase[A_CURRENT] = newalign << 24 >> 24;
    if (!G.uarmh || G.uarmh.otyp !== HELM_OF_OPPOSITE_ALIGNMENT) {
      G.u.ualign.type = G.u.ualignbase[A_CURRENT];
    }
    await You(S("have a %ssense of a new direction."), G.u.ualign.type !== oldalign ? S("sudden ") : S(""));
  } else {
    G.u.ualign.type = newalign << 24 >> 24;
    if (reason === 1) {
      await Your(S("mind oscillates %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("wildly") : S("briefly"));
    } else if (reason === 2) {
      await Your(S("mind is %s."), G.u.uprops[HALLUC].intrinsic && !(G.u.uprops[HALLUC_RES].intrinsic || G.u.uprops[HALLUC_RES].extrinsic) ? S("much of a muchness") : S("back in sync with your body"));
    }
  }
  if (G.u.ualign.type !== oldalign) {
    G.u.ualign.record = 0;
    await retouch_equipment(0);
  }
}

export function $init(): void {
  plusattr = [S("strong"),
S("smart"),
S("wise"),
S("agile"),
S("tough"),
S("charismatic")];
  minusattr = [S("weak"),
S("stupid"),
S("foolish"),
S("clumsy"),
S("fragile"),
S("repulsive")];
  G.attrname = [S("strength"),
S("intelligence"),
S("wisdom"),
S("dexterity"),
S("constitution"),
S("charisma")];
  arc_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[STEALTH], "intrinsic"), S(""), S("")),
struct_innate.$of(1, P(G.u.uprops[FAST], "intrinsic"), S(""), S("")),
struct_innate.$of(10, P(G.u.uprops[SEARCHING], "intrinsic"), S("perceptive"), S("")),
struct_innate.$of()]);
  bar_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[POISON_RES], "intrinsic"), S(""), S("")),
struct_innate.$of(7, P(G.u.uprops[FAST], "intrinsic"), S("quick"), S("slow")),
struct_innate.$of(15, P(G.u.uprops[STEALTH], "intrinsic"), S("stealthy"), S("")),
struct_innate.$of()]);
  cav_abil = $sarrOf([struct_innate.$of(7, P(G.u.uprops[FAST], "intrinsic"), S("quick"), S("slow")), struct_innate.$of(15, P(G.u.uprops[WARNING], "intrinsic"), S("sensitive"), S("")), struct_innate.$of()]);
  hea_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[POISON_RES], "intrinsic"), S(""), S("")), struct_innate.$of(15, P(G.u.uprops[WARNING], "intrinsic"), S("sensitive"), S("")), struct_innate.$of()]);
  kni_abil = $sarrOf([struct_innate.$of(7, P(G.u.uprops[FAST], "intrinsic"), S("quick"), S("slow")), struct_innate.$of()]);
  mon_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[FAST], "intrinsic"), S(""), S("")),
struct_innate.$of(1, P(G.u.uprops[SLEEP_RES], "intrinsic"), S(""), S("")),
struct_innate.$of(1, P(G.u.uprops[SEE_INVIS], "intrinsic"), S(""), S("")),
struct_innate.$of(3, P(G.u.uprops[POISON_RES], "intrinsic"), S("healthy"), S("")),
struct_innate.$of(5, P(G.u.uprops[STEALTH], "intrinsic"), S("stealthy"), S("")),
struct_innate.$of(7, P(G.u.uprops[WARNING], "intrinsic"), S("sensitive"), S("")),
struct_innate.$of(9, P(G.u.uprops[SEARCHING], "intrinsic"), S("perceptive"), S("unaware")),
struct_innate.$of(11, P(G.u.uprops[FIRE_RES], "intrinsic"), S("cool"), S("warmer")),
struct_innate.$of(13, P(G.u.uprops[COLD_RES], "intrinsic"), S("warm"), S("cooler")),
struct_innate.$of(15, P(G.u.uprops[SHOCK_RES], "intrinsic"), S("insulated"), S("conductive")),
struct_innate.$of(17, P(G.u.uprops[TELEPORT_CONTROL], "intrinsic"), S("controlled"), S("uncontrolled")),
struct_innate.$of()]);
  pri_abil = $sarrOf([struct_innate.$of(15, P(G.u.uprops[WARNING], "intrinsic"), S("sensitive"), S("")), struct_innate.$of(20, P(G.u.uprops[FIRE_RES], "intrinsic"), S("cool"), S("warmer")), struct_innate.$of()]);
  ran_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[SEARCHING], "intrinsic"), S(""), S("")),
struct_innate.$of(7, P(G.u.uprops[STEALTH], "intrinsic"), S("stealthy"), S("")),
struct_innate.$of(15, P(G.u.uprops[SEE_INVIS], "intrinsic"), S(""), S("")),
struct_innate.$of()]);
  rog_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[STEALTH], "intrinsic"), S(""), S("")), struct_innate.$of(10, P(G.u.uprops[SEARCHING], "intrinsic"), S("perceptive"), S("")), struct_innate.$of()]);
  sam_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[FAST], "intrinsic"), S(""), S("")), struct_innate.$of(15, P(G.u.uprops[STEALTH], "intrinsic"), S("stealthy"), S("")), struct_innate.$of()]);
  tou_abil = $sarrOf([struct_innate.$of(10, P(G.u.uprops[SEARCHING], "intrinsic"), S("perceptive"), S("")), struct_innate.$of(20, P(G.u.uprops[POISON_RES], "intrinsic"), S("hardy"), S("")), struct_innate.$of()]);
  val_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[COLD_RES], "intrinsic"), S(""), S("")),
struct_innate.$of(1, P(G.u.uprops[STEALTH], "intrinsic"), S(""), S("")),
struct_innate.$of(7, P(G.u.uprops[FAST], "intrinsic"), S("quick"), S("slow")),
struct_innate.$of()]);
  wiz_abil = $sarrOf([struct_innate.$of(15, P(G.u.uprops[WARNING], "intrinsic"), S("sensitive"), S("")), struct_innate.$of(17, P(G.u.uprops[TELEPORT_CONTROL], "intrinsic"), S("controlled"), S("uncontrolled")), struct_innate.$of()]);
  dwa_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[INFRAVISION], "intrinsic"), S(""), S("")), struct_innate.$of()]);
  elf_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[INFRAVISION], "intrinsic"), S(""), S("")), struct_innate.$of(4, P(G.u.uprops[SLEEP_RES], "intrinsic"), S("awake"), S("tired")), struct_innate.$of()]);
  gno_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[INFRAVISION], "intrinsic"), S(""), S("")), struct_innate.$of()]);
  orc_abil = $sarrOf([struct_innate.$of(1, P(G.u.uprops[INFRAVISION], "intrinsic"), S(""), S("")), struct_innate.$of(1, P(G.u.uprops[POISON_RES], "intrinsic"), S(""), S("")), struct_innate.$of()]);
  hum_abil = $sarrOf([struct_innate.$of()]);
  poiseff = $sarrOf([struct_poison_effect_message.$of(You_feel, S("weaker")),
struct_poison_effect_message.$of(Your, S("brain is on fire")),
struct_poison_effect_message.$of(Your, S("judgement is impaired")),
struct_poison_effect_message.$of(Your, S("muscles won't obey you")),
struct_poison_effect_message.$of(You_feel, S("very sick")),
struct_poison_effect_message.$of(You, S("break out in hives"))]);
  exertext = [[S("exercising diligently"), S("exercising properly")],
[null, null],
[S("very observant"), S("paying attention")],
[S("working on your reflexes"), S("working on reflexes lately")],
[S("leading a healthy life-style"), S("watching your health")],
[null, null]];
  from_what$buf = new Int8Array(256);
  from_what$because_of = $cs(" because of %s", 15);
}
