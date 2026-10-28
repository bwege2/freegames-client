// @ts-nocheck
// NetHack 3.6.7 u_init.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { adjabil, adjattrib, init_attr, newhp } from './attrib.ts';
import { max_rank_sz } from './botl.ts';
import { find_ac } from './do_wear.ts';
import { init_uhunger } from './eat.ts';
import { newpw } from './exper.ts';
import { debugcore, read_wizkit } from './files.ts';
import { inv_weight } from './hack.ts';
import { addinv } from './invent.ts';
import { dealloc_obj, mkobj, mksobj, weight } from './mkobj.ts';
import { discover_object } from './o_init.ts';
import { pline } from './pline.ts';
import { set_uasmon } from './polyself.ts';
import { rn2, rnd, rne } from './rnd.ts';
import { initialspell, spell_skilltype } from './spell.ts';
import { hidden_gold } from './vault.ts';
import { skill_init } from './weapon.ts';
import { setuqwep, setuswapwep, setuwep } from './wield.ts';
import { setworn } from './worn.ts';
import { struct_def_skill, struct_inv_sub, struct_trobj } from './structs.ts';
import { $sadd, $sarrOf, $ta, G, P, S, memset, time } from './rt/index.ts';
import { APPLE, ARMOR_CLASS, ARM_BOOTS, ARM_CLOAK, ARM_GLOVES, ARM_HELM, ARM_SHIELD, ARM_SHIRT, ARM_SUIT, ARROW, AXE, A_CHAOTIC, A_CON, A_CURRENT, A_MAX, A_ORIGINAL, A_STR, BATTLE_AXE, BELL, BLINDFOLD, BOW, BUGLE, BULLWHIP, B_MAJOR, B_MINOR, CARROT, CHAIN_MAIL, CLOAK_OF_DISPLACEMENT, CLOAK_OF_MAGIC_RESISTANCE, CLOVE_OF_GARLIC, CLUB, COIN_CLASS, CRAM_RATION, CREDIT_CARD, CROSSBOW, CROSSBOW_BOLT, C_AMMO, DAGGER, DART, DWARVISH_CLOAK, DWARVISH_IRON_HELM, DWARVISH_MATTOCK, DWARVISH_MITHRIL_COAT, DWARVISH_ROUNDSHIELD, DWARVISH_SHORT_SWORD, DWARVISH_SPEAR, ELVEN_ARROW, ELVEN_BOOTS, ELVEN_BOW, ELVEN_BROADSWORD, ELVEN_CLOAK, ELVEN_DAGGER, ELVEN_LEATHER_HELM, ELVEN_MITHRIL_COAT, ELVEN_SHIELD, ELVEN_SHORT_SWORD, ELVEN_SPEAR, EXPENSIVE_CAMERA, FALSE, FEDORA, FLINT, FOOD_CLASS, FOOD_RATION, FORTUNE_COOKIE, FROMOUTSIDE, GEM_CLASS, GOLD_PIECE, HAWAIIAN_SHIRT, HELMET, JUMPING, KATANA, LANCE, LEASH, LEATHER_ARMOR, LEATHER_DRUM, LEATHER_GLOVES, LEATHER_JACKET, LEMBAS_WAFER, LOCK_PICK, LONG_SWORD, MACE, MAGIC_MARKER, MAXSPELL, M_BOOK, NON_PM, NO_SPELL, NUM_OBJECTS, OIL_LAMP, ORANGE, ORCISH_ARROW, ORCISH_BOW, ORCISH_CHAIN_MAIL, ORCISH_CLOAK, ORCISH_DAGGER, ORCISH_HELM, ORCISH_RING_MAIL, ORCISH_SHIELD, ORCISH_SHORT_SWORD, ORCISH_SPEAR, PICK_AXE, PM_DWARF, PM_ELF, PM_GNOME, PM_HUMAN, PM_ORC, POTION_CLASS, POT_ACID, POT_EXTRA_HEALING, POT_FULL_HEALING, POT_HALLUCINATION, POT_HEALING, POT_OIL, POT_POLYMORPH, POT_SICKNESS, POT_WATER, P_ATTACK_SPELL, P_AXE, P_BARE_HANDED_COMBAT, P_BASIC, P_BOOMERANG, P_BOW, P_BROAD_SWORD, P_CLERIC_SPELL, P_CLUB, P_CROSSBOW, P_DAGGER, P_DART, P_DIVINATION_SPELL, P_ENCHANTMENT_SPELL, P_ESCAPE_SPELL, P_EXPERT, P_FLAIL, P_GRAND_MASTER, P_HAMMER, P_HEALING_SPELL, P_KNIFE, P_LANCE, P_LONG_SWORD, P_MACE, P_MASTER, P_MATTER_SPELL, P_MORNING_STAR, P_NONE, P_PICK_AXE, P_POLEARMS, P_QUARTERSTAFF, P_RIDING, P_SABER, P_SCIMITAR, P_SHORT_SWORD, P_SHURIKEN, P_SKILLED, P_SLING, P_SPEAR, P_TRIDENT, P_TWO_HANDED_SWORD, P_TWO_WEAPON_COMBAT, P_UNICORN_HORN, P_WHIP, QUARTERSTAFF, RAN_TWO_ARROWS, RAN_ZERO_ARROWS, RING_CLASS, RING_MAIL, RIN_AGGRAVATE_MONSTER, RIN_HUNGER, RIN_LEVITATION, RIN_POISON_RESISTANCE, RIN_POLYMORPH, RIN_POLYMORPH_CONTROL, ROBE, ROCK, R_DAGGERS, SACK, SCALPEL, SCROLL_CLASS, SCR_AMNESIA, SCR_BLANK_PAPER, SCR_ENCHANT_WEAPON, SCR_FIRE, SCR_MAGIC_MAPPING, SHORT_SWORD, SHURIKEN, SLING, SMALL_SHIELD, SPBOOK_CLASS, SPEAR, SPE_BLANK_PAPER, SPE_EXTRA_HEALING, SPE_FORCE_BOLT, SPE_HEALING, SPE_POLYMORPH, SPE_PROTECTION, SPE_SLEEP, SPE_STONE_TO_FLESH, SPLINT_MAIL, SPRIG_OF_WOLFSBANE, STATUE, STETHOSCOPE, STRANGE_OBJECT, S_ARROWS, TINNING_KIT, TIN_OPENER, TOOLED_HORN, TOOL_CLASS, TOUCHSTONE, TOWEL, TRIPE_RATION, TRUE, TWO_HANDED_SWORD, T_DARTS, UNDEF_BLESS, UNDEF_SPE, UNDEF_TYP, URUK_HAI_SHIELD, WAND_CLASS, WAN_NOTHING, WAN_SLEEP, WAN_WISHING, WEAPON_CLASS, WOODEN_FLUTE, WOODEN_HARP, W_ARM, W_ARMC, W_ARMF, W_ARMG, W_ARMH, W_ARMS, W_ARMU, YA, YUMI } from './consts.ts';

let Archeologist: any;
let Barbarian: any;
let Cave_man: any;
let Healer: any;
let Knight: any;
let Monk: any;
let Priest: any;
let Ranger: any;
let Rogue: any;
let Samurai: any;
let Tourist: any;
let Valkyrie: any;
let Wizard: any;
let Tinopener: any;
let Magicmarker: any;
let Lamp: any;
let Blindfold: any;
let Instrument: any;
let Xtra_food: any;
let Leash: any;
let Towel: any;
let Wishing: any;
let Money: any;
let inv_subs: any;
let Skill_A: any;
let Skill_B: any;
let Skill_C: any;
let Skill_H: any;
let Skill_K: any;
let Skill_Mon: any;
let Skill_P: any;
let Skill_R: any;
let Skill_Ran: any;
let Skill_S: any;
let Skill_T: any;
let Skill_V: any;
let Skill_W: any;
let u_init$M_spell: any;
let u_init$trotyp: any;
let ini_inv$nocreate: number;
let ini_inv$nocreate2: number;
let ini_inv$nocreate3: number;
let ini_inv$nocreate4: number;

async function knows_object(obj: number): Promise<void> {
  await discover_object(obj, TRUE, FALSE);
  G.objects[obj].oc_pre_discovered = 1;
}

async function knows_class(sym: number): Promise<void> {
  let ct = 0;
  for (ct = 1; ct < NUM_OBJECTS; ++ct) {
    if (G.objects[ct].oc_class === sym && !G.objects[ct].oc_magic) {
      await knows_object(ct);
    }
  }
}

export async function u_init(): Promise<void> {
  let $t1: any;
  let i = 0;
  let tmpuroleplay = G.u.uroleplay.$clone();
  G.flags.female = G.flags.initgend << 24 >> 24;
  G.flags.beginner = 1;
  memset(G.u, 0, 2392);
  G.u.ustuck = null;
  memset(P(G, "ubirthday"), 0, 8);
  memset(G.urealtime, 0, 24);
  G.u.uroleplay.$cp(tmpuroleplay);
  G.u.uz.dlevel = 1;
  G.u.uz0.dlevel = 0;
  G.u.utolev.$cp(G.u.uz);
  G.u.umoved = FALSE;
  G.u.umortality = 0;
  G.u.ugrave_arise = NON_PM;
  G.u.umonnum = G.u.umonster = G.flags.female && G.urole.femalenum !== NON_PM ? G.urole.femalenum : G.urole.malenum;
  G.u.ulycn = NON_PM;
  await set_uasmon();
  G.u.ulevel = 0;
  G.u.uhp = G.u.uhpmax = newhp();
  G.u.uen = G.u.uenmax = newpw();
  G.u.uspellprot = 0;
  await adjabil(0, 1);
  G.u.ulevel = G.u.ulevelmax = 1;
  await init_uhunger();
  for (i = 0; i <= MAXSPELL; ++i) {
    G.spl_book[i].sp_id = NO_SPELL;
  }
  G.u.ublesscnt = 300;
  G.u.ualignbase[A_CURRENT] = G.u.ualignbase[A_ORIGINAL] = G.u.ualign.type = G.aligns[G.flags.initalign].value;
  time(P(G, "ubirthday"));
  G.u.nv_range = 1;
  G.u.xray_range = -1;
  switch (G.urole.malenum) {
  case 328:
    await ini_inv(Archeologist[0]);
    if (!rn2(10)) {
      await ini_inv(Tinopener[0]);
    } else if (!rn2(4)) {
      await ini_inv(Lamp[0]);
    } else if (!rn2(10)) {
      await ini_inv(Magicmarker[0]);
    }
    await knows_object(SACK);
    await knows_object(TOUCHSTONE);
    await skill_init(Skill_A[0]);
    break;
  case 329:
    if (rn2(100) >= 50) {
      Barbarian[B_MAJOR].trotyp = BATTLE_AXE;
      Barbarian[B_MINOR].trotyp = SHORT_SWORD;
    }
    await ini_inv(Barbarian[0]);
    if (!rn2(6)) {
      await ini_inv(Lamp[0]);
    }
    await knows_class(WEAPON_CLASS);
    await knows_class(ARMOR_CLASS);
    await skill_init(Skill_B[0]);
    break;
  case 330:
    Cave_man[C_AMMO].trquan = (rn2(11) + 10 >>> 0) & 63;
    await ini_inv(Cave_man[0]);
    await skill_init(Skill_C[0]);
    break;
  case 332:
    G.u.umoney0 = rn2(1000) + 1001;
    await ini_inv(Healer[0]);
    if (!rn2(25)) {
      await ini_inv(Lamp[0]);
    }
    await knows_object(POT_FULL_HEALING);
    await skill_init(Skill_H[0]);
    break;
  case 333:
    await ini_inv(Knight[0]);
    await knows_class(WEAPON_CLASS);
    await knows_class(ARMOR_CLASS);
    ($t1 = G.u.uprops[JUMPING], $t1.intrinsic = $t1.intrinsic | FROMOUTSIDE);
    await skill_init(Skill_K[0]);
    break;
  case 334:
    {
      Monk[M_BOOK].trotyp = u_init$M_spell[rn2(90) / 30 | 0];
      await ini_inv(Monk[0]);
      if (!rn2(5)) {
        await ini_inv(Magicmarker[0]);
      } else if (!rn2(10)) {
        await ini_inv(Lamp[0]);
      }
      await knows_class(ARMOR_CLASS);
      await knows_object(SHURIKEN);
      await skill_init(Skill_Mon[0]);
      break;
    }
  case 335:
    await ini_inv(Priest[0]);
    if (!rn2(10)) {
      await ini_inv(Magicmarker[0]);
    } else if (!rn2(10)) {
      await ini_inv(Lamp[0]);
    }
    await knows_object(POT_WATER);
    await skill_init(Skill_P[0]);
    break;
  case 337:
    Ranger[RAN_TWO_ARROWS].trquan = (rn2(10) + 50 >>> 0) & 63;
    Ranger[RAN_ZERO_ARROWS].trquan = (rn2(10) + 30 >>> 0) & 63;
    await ini_inv(Ranger[0]);
    await skill_init(Skill_Ran[0]);
    break;
  case 338:
    Rogue[R_DAGGERS].trquan = (rn2(10) + 6 >>> 0) & 63;
    G.u.umoney0 = 0;
    await ini_inv(Rogue[0]);
    if (!rn2(5)) {
      await ini_inv(Blindfold[0]);
    }
    await knows_object(SACK);
    await skill_init(Skill_R[0]);
    break;
  case 339:
    Samurai[S_ARROWS].trquan = (rn2(20) + 26 >>> 0) & 63;
    await ini_inv(Samurai[0]);
    if (!rn2(5)) {
      await ini_inv(Blindfold[0]);
    }
    await knows_class(WEAPON_CLASS);
    await knows_class(ARMOR_CLASS);
    await skill_init(Skill_S[0]);
    break;
  case 340:
    Tourist[T_DARTS].trquan = (rn2(20) + 21 >>> 0) & 63;
    G.u.umoney0 = rnd(1000);
    await ini_inv(Tourist[0]);
    if (!rn2(25)) {
      await ini_inv(Tinopener[0]);
    } else if (!rn2(25)) {
      await ini_inv(Leash[0]);
    } else if (!rn2(25)) {
      await ini_inv(Towel[0]);
    } else if (!rn2(25)) {
      await ini_inv(Magicmarker[0]);
    }
    await skill_init(Skill_T[0]);
    break;
  case 341:
    await ini_inv(Valkyrie[0]);
    if (!rn2(6)) {
      await ini_inv(Lamp[0]);
    }
    await knows_class(WEAPON_CLASS);
    await knows_class(ARMOR_CLASS);
    await skill_init(Skill_V[0]);
    break;
  case 342:
    await ini_inv(Wizard[0]);
    if (!rn2(5)) {
      await ini_inv(Magicmarker[0]);
    }
    if (!rn2(5)) {
      await ini_inv(Blindfold[0]);
    }
    await skill_init(Skill_W[0]);
    break;
  default:
    break;
  }
  switch (G.urace.malenum) {
  case 256:
    break;
  case 260:
    if (G.urole.malenum === 335 || G.urole.malenum === 342) {
      Instrument[0].trotyp = u_init$trotyp[rn2(Math.trunc(24 / 4) | 0)] << 16 >> 16;
      await ini_inv(Instrument[0]);
    }
    await knows_object(ELVEN_SHORT_SWORD);
    await knows_object(ELVEN_ARROW);
    await knows_object(ELVEN_BOW);
    await knows_object(ELVEN_SPEAR);
    await knows_object(ELVEN_DAGGER);
    await knows_object(ELVEN_BROADSWORD);
    await knows_object(ELVEN_MITHRIL_COAT);
    await knows_object(ELVEN_LEATHER_HELM);
    await knows_object(ELVEN_SHIELD);
    await knows_object(ELVEN_BOOTS);
    await knows_object(ELVEN_CLOAK);
    break;
  case 43:
    await knows_object(DWARVISH_SPEAR);
    await knows_object(DWARVISH_SHORT_SWORD);
    await knows_object(DWARVISH_MATTOCK);
    await knows_object(DWARVISH_IRON_HELM);
    await knows_object(DWARVISH_MITHRIL_COAT);
    await knows_object(DWARVISH_CLOAK);
    await knows_object(DWARVISH_ROUNDSHIELD);
    break;
  case 162:
    break;
  case 71:
    if (!(G.urole.malenum === 342)) {
      await ini_inv(Xtra_food[0]);
    }
    await knows_object(ORCISH_SHORT_SWORD);
    await knows_object(ORCISH_ARROW);
    await knows_object(ORCISH_BOW);
    await knows_object(ORCISH_SPEAR);
    await knows_object(ORCISH_DAGGER);
    await knows_object(ORCISH_CHAIN_MAIL);
    await knows_object(ORCISH_RING_MAIL);
    await knows_object(ORCISH_HELM);
    await knows_object(ORCISH_SHIELD);
    await knows_object(URUK_HAI_SHIELD);
    await knows_object(ORCISH_CLOAK);
    break;
  default:
    break;
  }
  if (G.flags.explore) {
    await ini_inv(Wishing[0]);
  }
  if (G.flags.debug) {
    await read_wizkit();
  }
  if (G.u.umoney0) {
    await ini_inv(Money[0]);
  }
  G.u.umoney0 += hidden_gold();
  find_ac();
  init_attr(75);
  max_rank_sz();
  for (i = 0; i < A_MAX; ++i) {
    if (!rn2(20)) {
      let xd = rn2(7) - 2;
      await adjattrib(i, xd, TRUE);
      if (G.u.acurr.a[i] < G.u.amax.a[i]) {
        G.u.amax.a[i] = G.u.acurr.a[i];
      }
    }
  }
  while (inv_weight() > 0) {
    if (await adjattrib(A_STR, 1, TRUE)) {
      continue;
    }
    if (await adjattrib(A_CON, 1, TRUE)) {
      continue;
    }
    break;
  }
  return;
}

function restricted_spell_discipline(otyp: number): number {
  let skills = null;
  let this_skill = spell_skilltype(otyp);
  switch (G.urole.malenum) {
  case 328:
    skills = Skill_A[0];
    break;
  case 329:
    skills = Skill_B[0];
    break;
  case 330:
    skills = Skill_C[0];
    break;
  case 332:
    skills = Skill_H[0];
    break;
  case 333:
    skills = Skill_K[0];
    break;
  case 334:
    skills = Skill_Mon[0];
    break;
  case 335:
    skills = Skill_P[0];
    break;
  case 337:
    skills = Skill_Ran[0];
    break;
  case 338:
    skills = Skill_R[0];
    break;
  case 339:
    skills = Skill_S[0];
    break;
  case 340:
    skills = Skill_T[0];
    break;
  case 341:
    skills = Skill_V[0];
    break;
  case 342:
    skills = Skill_W[0];
    break;
  default:
    skills = null;
    break;
  }
  while (skills && skills.skill !== P_NONE) {
    if (skills.skill === this_skill) {
      return FALSE;
    }
    skills = $sadd(skills, 1);
  }
  return TRUE;
}

async function ini_inv(trop: struct_trobj | null): Promise<void> {
  let obj = null;
  let otyp = 0;
  let i = 0;
  while (trop.trclass) {
    otyp = trop.trotyp;
    if (otyp !== UNDEF_TYP) {
      obj = await mksobj(otyp, TRUE, FALSE);
    } else {
      obj = await mkobj(trop.trclass, FALSE);
      otyp = obj.otyp;
      while (otyp === WAN_WISHING || otyp === ini_inv$nocreate || otyp === ini_inv$nocreate2 || otyp === ini_inv$nocreate3 || otyp === ini_inv$nocreate4 || otyp === RIN_LEVITATION || otyp === POT_HALLUCINATION || otyp === POT_ACID || otyp === SCR_AMNESIA || otyp === SCR_FIRE || otyp === SCR_BLANK_PAPER || otyp === SPE_BLANK_PAPER || otyp === RIN_AGGRAVATE_MONSTER || otyp === RIN_HUNGER || otyp === WAN_NOTHING || otyp === RIN_POISON_RESISTANCE && G.urace.malenum === 71 || otyp === SCR_ENCHANT_WEAPON && G.urole.malenum === 334 || otyp === SPE_FORCE_BOLT && G.urole.malenum === 342 || obj.oclass === SPBOOK_CLASS && (G.objects[otyp].oc_oc2 > 3 || restricted_spell_discipline(otyp))) {
        await dealloc_obj(obj);
        obj = await mkobj(trop.trclass, FALSE);
        otyp = obj.otyp;
      }
      if (G.objects[otyp].oc_charged | 0 && obj.spe <= 0) {
        obj.spe = rne(3) << 24 >> 24;
      }
      switch (otyp) {
      case 395:
      case 173:
      case 291:
        ini_inv$nocreate = RIN_POLYMORPH_CONTROL;
        break;
      case 174:
        ini_inv$nocreate = RIN_POLYMORPH;
        ini_inv$nocreate2 = SPE_POLYMORPH;
        ini_inv$nocreate3 = POT_POLYMORPH;
      }
      if (obj.oclass === RING_CLASS || obj.oclass === SPBOOK_CLASS) {
        ini_inv$nocreate4 = otyp << 16 >> 16;
      }
    }
    if (G.urace.malenum !== PM_HUMAN) {
      for (i = 0; inv_subs[i].race_pm !== NON_PM; ++i) {
        if (inv_subs[i].race_pm === G.urace.malenum && otyp === inv_subs[i].item_otyp) {
          do {
            if (await debugcore(S("u_init.c"), 1)) {
              await pline(S("ini_inv: substituting %s for %s%s"), G.obj_descr[G.objects[inv_subs[i].subs_otyp].oc_name_idx].oc_name, trop.trotyp === 0 ? S("random ") : S(""), G.obj_descr[G.objects[otyp].oc_name_idx].oc_name);
            }
          } while (0);
          otyp = obj.otyp = inv_subs[i].subs_otyp;
          break;
        }
      }
    }
    if (G.u.uroleplay.nudist && obj.oclass === ARMOR_CLASS) {
      await dealloc_obj(obj);
      trop = $sadd(trop, 1);
      continue;
    }
    if (trop.trclass === COIN_CLASS) {
      obj.quan = G.u.umoney0;
    } else {
      if (G.objects[otyp].oc_uses_known) {
        obj.known = 1;
      }
      obj.dknown = (obj.bknown = (obj.rknown = 1) & 1) & 1;
      if (obj.otyp >= 189 && obj.otyp <= 195 || obj.otyp === STATUE) {
        obj.cknown = (obj.lknown = 1) & 1;
        obj.otrapped = 0;
      }
      obj.cursed = 0;
      if (obj.otrapped | 0 && G.u.ualign.type !== A_CHAOTIC) {
        obj.otrapped = 0;
      }
      if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) {
        obj.quan = trop.trquan;
        trop.trquan = 1;
      } else if (obj.oclass === GEM_CLASS && (obj.otyp === 443 || obj.otyp === 444 || obj.otyp === 446 || obj.otyp === 445) && obj.otyp !== FLINT) {
        obj.quan = 1;
      }
      if (trop.trspe !== UNDEF_SPE) {
        obj.spe = trop.trspe;
      }
      if ((trop.trbless | 0) !== UNDEF_BLESS) {
        obj.blessed = (trop.trbless) & 1;
      }
    }
    obj.owt = await weight(obj) >>> 0;
    obj = await addinv(obj);
    if (G.obj_descr[G.objects[otyp].oc_descr_idx].oc_descr && obj.known | 0) {
      await discover_object(otyp, TRUE, FALSE);
    }
    if (otyp === OIL_LAMP) {
      await discover_object(POT_OIL, TRUE, FALSE);
    }
    if (obj.oclass === ARMOR_CLASS) {
      if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIELD && !G.uarms && !(G.uwep && ((G.uwep.oclass === WEAPON_CLASS || G.uwep.oclass === TOOL_CLASS) && G.objects[G.uwep.otyp].oc_big | 0))) {
        await setworn(obj, W_ARMS);
        G.u.twoweap = FALSE;
      } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_HELM && !G.uarmh) {
        await setworn(obj, W_ARMH);
      } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_GLOVES && !G.uarmg) {
        await setworn(obj, W_ARMG);
      } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SHIRT && !G.uarmu) {
        await setworn(obj, W_ARMU);
      } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_CLOAK && !G.uarmc) {
        await setworn(obj, W_ARMC);
      } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_BOOTS && !G.uarmf) {
        await setworn(obj, W_ARMF);
      } else if (obj.oclass === ARMOR_CLASS && G.objects[obj.otyp].oc_subtyp === ARM_SUIT && !G.uarm) {
        await setworn(obj, W_ARM);
      }
    }
    if (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS && G.objects[obj.otyp].oc_subtyp !== P_NONE || otyp === TIN_OPENER || otyp === FLINT || otyp === ROCK) {
      if ((obj.oclass === WEAPON_CLASS || obj.oclass === GEM_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_CROSSBOW && G.objects[obj.otyp].oc_subtyp <= -P_BOW || (obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_subtyp >= -P_BOOMERANG && G.objects[obj.otyp].oc_subtyp <= -P_DART) {
        if (!G.uquiver) {
          await setuqwep(obj);
        }
      } else if (!G.uwep && (!G.uarms || !((obj.oclass === WEAPON_CLASS || obj.oclass === TOOL_CLASS) && G.objects[obj.otyp].oc_big | 0))) {
        await setuwep(obj);
      } else if (!G.uswapwep) {
        await setuswapwep(obj);
      }
    }
    if (obj.oclass === SPBOOK_CLASS && obj.otyp !== SPE_BLANK_PAPER) {
      await initialspell(obj);
    }
    if (trop.trquan = (trop.trquan - 1 >>> 0) & 63) {
      continue;
    }
    trop = $sadd(trop, 1);
  }
}

export function $init(): void {
  Archeologist = $sarrOf([struct_trobj.$of(BULLWHIP, 2, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(LEATHER_JACKET, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(FEDORA, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(FOOD_RATION, 0, FOOD_CLASS, 3),
struct_trobj.$of(PICK_AXE, UNDEF_SPE, TOOL_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(TINNING_KIT, UNDEF_SPE, TOOL_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(TOUCHSTONE, 0, GEM_CLASS, 1),
struct_trobj.$of(SACK, 0, TOOL_CLASS, 1),
struct_trobj.$of()]);
  Barbarian = $sarrOf([struct_trobj.$of(TWO_HANDED_SWORD, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(AXE, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(RING_MAIL, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(FOOD_RATION, 0, FOOD_CLASS, 1),
struct_trobj.$of()]);
  Cave_man = $sarrOf([struct_trobj.$of(CLUB, 1, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(SLING, 2, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(FLINT, 0, GEM_CLASS, 15, UNDEF_BLESS),
struct_trobj.$of(ROCK, 0, GEM_CLASS, 3),
struct_trobj.$of(LEATHER_ARMOR, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of()]);
  Healer = $sarrOf([struct_trobj.$of(SCALPEL, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(LEATHER_GLOVES, 1, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(STETHOSCOPE, 0, TOOL_CLASS, 1),
struct_trobj.$of(POT_HEALING, 0, POTION_CLASS, 4, UNDEF_BLESS),
struct_trobj.$of(POT_EXTRA_HEALING, 0, POTION_CLASS, 4, UNDEF_BLESS),
struct_trobj.$of(WAN_SLEEP, UNDEF_SPE, WAND_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(SPE_HEALING, 0, SPBOOK_CLASS, 1, 1),
struct_trobj.$of(SPE_EXTRA_HEALING, 0, SPBOOK_CLASS, 1, 1),
struct_trobj.$of(SPE_STONE_TO_FLESH, 0, SPBOOK_CLASS, 1, 1),
struct_trobj.$of(APPLE, 0, FOOD_CLASS, 5),
struct_trobj.$of()]);
  Knight = $sarrOf([struct_trobj.$of(LONG_SWORD, 1, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(LANCE, 1, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(RING_MAIL, 1, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(HELMET, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(SMALL_SHIELD, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(LEATHER_GLOVES, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(APPLE, 0, FOOD_CLASS, 10),
struct_trobj.$of(CARROT, 0, FOOD_CLASS, 10),
struct_trobj.$of()]);
  Monk = $sarrOf([struct_trobj.$of(LEATHER_GLOVES, 2, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(ROBE, 1, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, SPBOOK_CLASS, 1, 1),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, SCROLL_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(POT_HEALING, 0, POTION_CLASS, 3, UNDEF_BLESS),
struct_trobj.$of(FOOD_RATION, 0, FOOD_CLASS, 3),
struct_trobj.$of(APPLE, 0, FOOD_CLASS, 5, UNDEF_BLESS),
struct_trobj.$of(ORANGE, 0, FOOD_CLASS, 5, UNDEF_BLESS),
struct_trobj.$of(FORTUNE_COOKIE, 0, FOOD_CLASS, 3, UNDEF_BLESS),
struct_trobj.$of()]);
  Priest = $sarrOf([struct_trobj.$of(MACE, 1, WEAPON_CLASS, 1, 1),
struct_trobj.$of(ROBE, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(SMALL_SHIELD, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(POT_WATER, 0, POTION_CLASS, 4, 1),
struct_trobj.$of(CLOVE_OF_GARLIC, 0, FOOD_CLASS, 1),
struct_trobj.$of(SPRIG_OF_WOLFSBANE, 0, FOOD_CLASS, 1),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, SPBOOK_CLASS, 2, UNDEF_BLESS),
struct_trobj.$of()]);
  Ranger = $sarrOf([struct_trobj.$of(DAGGER, 1, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(BOW, 1, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(ARROW, 2, WEAPON_CLASS, 50, UNDEF_BLESS),
struct_trobj.$of(ARROW, 0, WEAPON_CLASS, 30, UNDEF_BLESS),
struct_trobj.$of(CLOAK_OF_DISPLACEMENT, 2, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(CRAM_RATION, 0, FOOD_CLASS, 4),
struct_trobj.$of()]);
  Rogue = $sarrOf([struct_trobj.$of(SHORT_SWORD, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(DAGGER, 0, WEAPON_CLASS, 10),
struct_trobj.$of(LEATHER_ARMOR, 1, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(POT_SICKNESS, 0, POTION_CLASS, 1),
struct_trobj.$of(LOCK_PICK, 0, TOOL_CLASS, 1),
struct_trobj.$of(SACK, 0, TOOL_CLASS, 1),
struct_trobj.$of()]);
  Samurai = $sarrOf([struct_trobj.$of(KATANA, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(SHORT_SWORD, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(YUMI, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(YA, 0, WEAPON_CLASS, 25, UNDEF_BLESS),
struct_trobj.$of(SPLINT_MAIL, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of()]);
  Tourist = $sarrOf([struct_trobj.$of(DART, 2, WEAPON_CLASS, 25, UNDEF_BLESS),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, FOOD_CLASS, 10),
struct_trobj.$of(POT_EXTRA_HEALING, 0, POTION_CLASS, 2, UNDEF_BLESS),
struct_trobj.$of(SCR_MAGIC_MAPPING, 0, SCROLL_CLASS, 4, UNDEF_BLESS),
struct_trobj.$of(HAWAIIAN_SHIRT, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(EXPENSIVE_CAMERA, UNDEF_SPE, TOOL_CLASS, 1),
struct_trobj.$of(CREDIT_CARD, 0, TOOL_CLASS, 1),
struct_trobj.$of()]);
  Valkyrie = $sarrOf([struct_trobj.$of(LONG_SWORD, 1, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(DAGGER, 0, WEAPON_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(SMALL_SHIELD, 3, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(FOOD_RATION, 0, FOOD_CLASS, 1),
struct_trobj.$of()]);
  Wizard = $sarrOf([struct_trobj.$of(QUARTERSTAFF, 1, WEAPON_CLASS, 1, 1),
struct_trobj.$of(CLOAK_OF_MAGIC_RESISTANCE, 0, ARMOR_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, WAND_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, RING_CLASS, 2, UNDEF_BLESS),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, POTION_CLASS, 3, UNDEF_BLESS),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, SCROLL_CLASS, 3, UNDEF_BLESS),
struct_trobj.$of(SPE_FORCE_BOLT, 0, SPBOOK_CLASS, 1, 1),
struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, SPBOOK_CLASS, 1, UNDEF_BLESS),
struct_trobj.$of()]);
  Tinopener = $sarrOf([struct_trobj.$of(TIN_OPENER, 0, TOOL_CLASS, 1), struct_trobj.$of()]);
  Magicmarker = $sarrOf([struct_trobj.$of(MAGIC_MARKER, UNDEF_SPE, TOOL_CLASS, 1), struct_trobj.$of()]);
  Lamp = $sarrOf([struct_trobj.$of(OIL_LAMP, 1, TOOL_CLASS, 1), struct_trobj.$of()]);
  Blindfold = $sarrOf([struct_trobj.$of(BLINDFOLD, 0, TOOL_CLASS, 1), struct_trobj.$of()]);
  Instrument = $sarrOf([struct_trobj.$of(WOODEN_FLUTE, 0, TOOL_CLASS, 1), struct_trobj.$of()]);
  Xtra_food = $sarrOf([struct_trobj.$of(UNDEF_TYP, UNDEF_SPE, FOOD_CLASS, 2), struct_trobj.$of()]);
  Leash = $sarrOf([struct_trobj.$of(LEASH, 0, TOOL_CLASS, 1), struct_trobj.$of()]);
  Towel = $sarrOf([struct_trobj.$of(TOWEL, 0, TOOL_CLASS, 1), struct_trobj.$of()]);
  Wishing = $sarrOf([struct_trobj.$of(WAN_WISHING, 3, WAND_CLASS, 1), struct_trobj.$of()]);
  Money = $sarrOf([struct_trobj.$of(GOLD_PIECE, 0, COIN_CLASS, 1), struct_trobj.$of()]);
  inv_subs = $sarrOf([struct_inv_sub.$of(PM_ELF, DAGGER, ELVEN_DAGGER),
struct_inv_sub.$of(PM_ELF, SPEAR, ELVEN_SPEAR),
struct_inv_sub.$of(PM_ELF, SHORT_SWORD, ELVEN_SHORT_SWORD),
struct_inv_sub.$of(PM_ELF, BOW, ELVEN_BOW),
struct_inv_sub.$of(PM_ELF, ARROW, ELVEN_ARROW),
struct_inv_sub.$of(PM_ELF, HELMET, ELVEN_LEATHER_HELM),
struct_inv_sub.$of(PM_ELF, CLOAK_OF_DISPLACEMENT, ELVEN_CLOAK),
struct_inv_sub.$of(PM_ELF, CRAM_RATION, LEMBAS_WAFER),
struct_inv_sub.$of(PM_ORC, DAGGER, ORCISH_DAGGER),
struct_inv_sub.$of(PM_ORC, SPEAR, ORCISH_SPEAR),
struct_inv_sub.$of(PM_ORC, SHORT_SWORD, ORCISH_SHORT_SWORD),
struct_inv_sub.$of(PM_ORC, BOW, ORCISH_BOW),
struct_inv_sub.$of(PM_ORC, ARROW, ORCISH_ARROW),
struct_inv_sub.$of(PM_ORC, HELMET, ORCISH_HELM),
struct_inv_sub.$of(PM_ORC, SMALL_SHIELD, ORCISH_SHIELD),
struct_inv_sub.$of(PM_ORC, RING_MAIL, ORCISH_RING_MAIL),
struct_inv_sub.$of(PM_ORC, CHAIN_MAIL, ORCISH_CHAIN_MAIL),
struct_inv_sub.$of(PM_ORC, CRAM_RATION, TRIPE_RATION),
struct_inv_sub.$of(PM_ORC, LEMBAS_WAFER, TRIPE_RATION),
struct_inv_sub.$of(PM_DWARF, SPEAR, DWARVISH_SPEAR),
struct_inv_sub.$of(PM_DWARF, SHORT_SWORD, DWARVISH_SHORT_SWORD),
struct_inv_sub.$of(PM_DWARF, HELMET, DWARVISH_IRON_HELM),
struct_inv_sub.$of(PM_DWARF, LEMBAS_WAFER, CRAM_RATION),
struct_inv_sub.$of(PM_GNOME, BOW, CROSSBOW),
struct_inv_sub.$of(PM_GNOME, ARROW, CROSSBOW_BOLT),
struct_inv_sub.$of(NON_PM, STRANGE_OBJECT, STRANGE_OBJECT)]);
  Skill_A = $sarrOf([struct_def_skill.$of(P_DAGGER, P_BASIC),
struct_def_skill.$of(P_KNIFE, P_BASIC),
struct_def_skill.$of(P_PICK_AXE, P_EXPERT),
struct_def_skill.$of(P_SHORT_SWORD, P_BASIC),
struct_def_skill.$of(P_SCIMITAR, P_SKILLED),
struct_def_skill.$of(P_SABER, P_EXPERT),
struct_def_skill.$of(P_CLUB, P_SKILLED),
struct_def_skill.$of(P_QUARTERSTAFF, P_SKILLED),
struct_def_skill.$of(P_SLING, P_SKILLED),
struct_def_skill.$of(P_DART, P_BASIC),
struct_def_skill.$of(P_BOOMERANG, P_EXPERT),
struct_def_skill.$of(P_WHIP, P_EXPERT),
struct_def_skill.$of(P_UNICORN_HORN, P_SKILLED),
struct_def_skill.$of(P_ATTACK_SPELL, P_BASIC),
struct_def_skill.$of(P_HEALING_SPELL, P_BASIC),
struct_def_skill.$of(P_DIVINATION_SPELL, P_EXPERT),
struct_def_skill.$of(P_MATTER_SPELL, P_BASIC),
struct_def_skill.$of(P_RIDING, P_BASIC),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_BASIC),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_EXPERT),
struct_def_skill.$of(P_NONE)]);
  Skill_B = $sarrOf([struct_def_skill.$of(P_DAGGER, P_BASIC),
struct_def_skill.$of(P_AXE, P_EXPERT),
struct_def_skill.$of(P_PICK_AXE, P_SKILLED),
struct_def_skill.$of(P_SHORT_SWORD, P_EXPERT),
struct_def_skill.$of(P_BROAD_SWORD, P_SKILLED),
struct_def_skill.$of(P_LONG_SWORD, P_SKILLED),
struct_def_skill.$of(P_TWO_HANDED_SWORD, P_EXPERT),
struct_def_skill.$of(P_SCIMITAR, P_SKILLED),
struct_def_skill.$of(P_SABER, P_BASIC),
struct_def_skill.$of(P_CLUB, P_SKILLED),
struct_def_skill.$of(P_MACE, P_SKILLED),
struct_def_skill.$of(P_MORNING_STAR, P_SKILLED),
struct_def_skill.$of(P_FLAIL, P_BASIC),
struct_def_skill.$of(P_HAMMER, P_EXPERT),
struct_def_skill.$of(P_QUARTERSTAFF, P_BASIC),
struct_def_skill.$of(P_SPEAR, P_SKILLED),
struct_def_skill.$of(P_TRIDENT, P_SKILLED),
struct_def_skill.$of(P_BOW, P_BASIC),
struct_def_skill.$of(P_ATTACK_SPELL, P_BASIC),
struct_def_skill.$of(P_ESCAPE_SPELL, P_BASIC),
struct_def_skill.$of(P_RIDING, P_BASIC),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_BASIC),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_MASTER),
struct_def_skill.$of(P_NONE)]);
  Skill_C = $sarrOf([struct_def_skill.$of(P_DAGGER, P_BASIC),
struct_def_skill.$of(P_KNIFE, P_SKILLED),
struct_def_skill.$of(P_AXE, P_SKILLED),
struct_def_skill.$of(P_PICK_AXE, P_BASIC),
struct_def_skill.$of(P_CLUB, P_EXPERT),
struct_def_skill.$of(P_MACE, P_EXPERT),
struct_def_skill.$of(P_MORNING_STAR, P_BASIC),
struct_def_skill.$of(P_FLAIL, P_SKILLED),
struct_def_skill.$of(P_HAMMER, P_SKILLED),
struct_def_skill.$of(P_QUARTERSTAFF, P_EXPERT),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_EXPERT),
struct_def_skill.$of(P_TRIDENT, P_SKILLED),
struct_def_skill.$of(P_BOW, P_SKILLED),
struct_def_skill.$of(P_SLING, P_EXPERT),
struct_def_skill.$of(P_ATTACK_SPELL, P_BASIC),
struct_def_skill.$of(P_MATTER_SPELL, P_SKILLED),
struct_def_skill.$of(P_BOOMERANG, P_EXPERT),
struct_def_skill.$of(P_UNICORN_HORN, P_BASIC),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_MASTER),
struct_def_skill.$of(P_NONE)]);
  Skill_H = $sarrOf([struct_def_skill.$of(P_DAGGER, P_SKILLED),
struct_def_skill.$of(P_KNIFE, P_EXPERT),
struct_def_skill.$of(P_SHORT_SWORD, P_SKILLED),
struct_def_skill.$of(P_SCIMITAR, P_BASIC),
struct_def_skill.$of(P_SABER, P_BASIC),
struct_def_skill.$of(P_CLUB, P_SKILLED),
struct_def_skill.$of(P_MACE, P_BASIC),
struct_def_skill.$of(P_QUARTERSTAFF, P_EXPERT),
struct_def_skill.$of(P_POLEARMS, P_BASIC),
struct_def_skill.$of(P_SPEAR, P_BASIC),
struct_def_skill.$of(P_TRIDENT, P_BASIC),
struct_def_skill.$of(P_SLING, P_SKILLED),
struct_def_skill.$of(P_DART, P_EXPERT),
struct_def_skill.$of(P_SHURIKEN, P_SKILLED),
struct_def_skill.$of(P_UNICORN_HORN, P_EXPERT),
struct_def_skill.$of(P_HEALING_SPELL, P_EXPERT),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_BASIC),
struct_def_skill.$of(P_NONE)]);
  Skill_K = $sarrOf([struct_def_skill.$of(P_DAGGER, P_BASIC),
struct_def_skill.$of(P_KNIFE, P_BASIC),
struct_def_skill.$of(P_AXE, P_SKILLED),
struct_def_skill.$of(P_PICK_AXE, P_BASIC),
struct_def_skill.$of(P_SHORT_SWORD, P_SKILLED),
struct_def_skill.$of(P_BROAD_SWORD, P_SKILLED),
struct_def_skill.$of(P_LONG_SWORD, P_EXPERT),
struct_def_skill.$of(P_TWO_HANDED_SWORD, P_SKILLED),
struct_def_skill.$of(P_SCIMITAR, P_BASIC),
struct_def_skill.$of(P_SABER, P_SKILLED),
struct_def_skill.$of(P_CLUB, P_BASIC),
struct_def_skill.$of(P_MACE, P_SKILLED),
struct_def_skill.$of(P_MORNING_STAR, P_SKILLED),
struct_def_skill.$of(P_FLAIL, P_BASIC),
struct_def_skill.$of(P_HAMMER, P_BASIC),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_SKILLED),
struct_def_skill.$of(P_TRIDENT, P_BASIC),
struct_def_skill.$of(P_LANCE, P_EXPERT),
struct_def_skill.$of(P_BOW, P_BASIC),
struct_def_skill.$of(P_CROSSBOW, P_SKILLED),
struct_def_skill.$of(P_ATTACK_SPELL, P_SKILLED),
struct_def_skill.$of(P_HEALING_SPELL, P_SKILLED),
struct_def_skill.$of(P_CLERIC_SPELL, P_SKILLED),
struct_def_skill.$of(P_RIDING, P_EXPERT),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_SKILLED),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_EXPERT),
struct_def_skill.$of(P_NONE)]);
  Skill_Mon = $sarrOf([struct_def_skill.$of(P_QUARTERSTAFF, P_BASIC),
struct_def_skill.$of(P_SPEAR, P_BASIC),
struct_def_skill.$of(P_CROSSBOW, P_BASIC),
struct_def_skill.$of(P_SHURIKEN, P_BASIC),
struct_def_skill.$of(P_ATTACK_SPELL, P_BASIC),
struct_def_skill.$of(P_HEALING_SPELL, P_EXPERT),
struct_def_skill.$of(P_DIVINATION_SPELL, P_BASIC),
struct_def_skill.$of(P_ENCHANTMENT_SPELL, P_BASIC),
struct_def_skill.$of(P_CLERIC_SPELL, P_SKILLED),
struct_def_skill.$of(P_ESCAPE_SPELL, P_SKILLED),
struct_def_skill.$of(P_MATTER_SPELL, P_BASIC),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_GRAND_MASTER),
struct_def_skill.$of(P_NONE)]);
  Skill_P = $sarrOf([struct_def_skill.$of(P_CLUB, P_EXPERT),
struct_def_skill.$of(P_MACE, P_EXPERT),
struct_def_skill.$of(P_MORNING_STAR, P_EXPERT),
struct_def_skill.$of(P_FLAIL, P_EXPERT),
struct_def_skill.$of(P_HAMMER, P_EXPERT),
struct_def_skill.$of(P_QUARTERSTAFF, P_EXPERT),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_SKILLED),
struct_def_skill.$of(P_TRIDENT, P_SKILLED),
struct_def_skill.$of(P_LANCE, P_BASIC),
struct_def_skill.$of(P_BOW, P_BASIC),
struct_def_skill.$of(P_SLING, P_BASIC),
struct_def_skill.$of(P_CROSSBOW, P_BASIC),
struct_def_skill.$of(P_DART, P_BASIC),
struct_def_skill.$of(P_SHURIKEN, P_BASIC),
struct_def_skill.$of(P_BOOMERANG, P_BASIC),
struct_def_skill.$of(P_UNICORN_HORN, P_SKILLED),
struct_def_skill.$of(P_HEALING_SPELL, P_EXPERT),
struct_def_skill.$of(P_DIVINATION_SPELL, P_EXPERT),
struct_def_skill.$of(P_CLERIC_SPELL, P_EXPERT),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_BASIC),
struct_def_skill.$of(P_NONE)]);
  Skill_R = $sarrOf([struct_def_skill.$of(P_DAGGER, P_EXPERT),
struct_def_skill.$of(P_KNIFE, P_EXPERT),
struct_def_skill.$of(P_SHORT_SWORD, P_EXPERT),
struct_def_skill.$of(P_BROAD_SWORD, P_SKILLED),
struct_def_skill.$of(P_LONG_SWORD, P_SKILLED),
struct_def_skill.$of(P_TWO_HANDED_SWORD, P_BASIC),
struct_def_skill.$of(P_SCIMITAR, P_SKILLED),
struct_def_skill.$of(P_SABER, P_SKILLED),
struct_def_skill.$of(P_CLUB, P_SKILLED),
struct_def_skill.$of(P_MACE, P_SKILLED),
struct_def_skill.$of(P_MORNING_STAR, P_BASIC),
struct_def_skill.$of(P_FLAIL, P_BASIC),
struct_def_skill.$of(P_HAMMER, P_BASIC),
struct_def_skill.$of(P_POLEARMS, P_BASIC),
struct_def_skill.$of(P_SPEAR, P_BASIC),
struct_def_skill.$of(P_CROSSBOW, P_EXPERT),
struct_def_skill.$of(P_DART, P_EXPERT),
struct_def_skill.$of(P_SHURIKEN, P_SKILLED),
struct_def_skill.$of(P_DIVINATION_SPELL, P_SKILLED),
struct_def_skill.$of(P_ESCAPE_SPELL, P_SKILLED),
struct_def_skill.$of(P_MATTER_SPELL, P_SKILLED),
struct_def_skill.$of(P_RIDING, P_BASIC),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_EXPERT),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_EXPERT),
struct_def_skill.$of(P_NONE)]);
  Skill_Ran = $sarrOf([struct_def_skill.$of(P_DAGGER, P_EXPERT),
struct_def_skill.$of(P_KNIFE, P_SKILLED),
struct_def_skill.$of(P_AXE, P_SKILLED),
struct_def_skill.$of(P_PICK_AXE, P_BASIC),
struct_def_skill.$of(P_SHORT_SWORD, P_BASIC),
struct_def_skill.$of(P_MORNING_STAR, P_BASIC),
struct_def_skill.$of(P_FLAIL, P_SKILLED),
struct_def_skill.$of(P_HAMMER, P_BASIC),
struct_def_skill.$of(P_QUARTERSTAFF, P_BASIC),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_EXPERT),
struct_def_skill.$of(P_TRIDENT, P_BASIC),
struct_def_skill.$of(P_BOW, P_EXPERT),
struct_def_skill.$of(P_SLING, P_EXPERT),
struct_def_skill.$of(P_CROSSBOW, P_EXPERT),
struct_def_skill.$of(P_DART, P_EXPERT),
struct_def_skill.$of(P_SHURIKEN, P_SKILLED),
struct_def_skill.$of(P_BOOMERANG, P_EXPERT),
struct_def_skill.$of(P_WHIP, P_BASIC),
struct_def_skill.$of(P_HEALING_SPELL, P_BASIC),
struct_def_skill.$of(P_DIVINATION_SPELL, P_EXPERT),
struct_def_skill.$of(P_ESCAPE_SPELL, P_BASIC),
struct_def_skill.$of(P_RIDING, P_BASIC),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_BASIC),
struct_def_skill.$of(P_NONE)]);
  Skill_S = $sarrOf([struct_def_skill.$of(P_DAGGER, P_BASIC),
struct_def_skill.$of(P_KNIFE, P_SKILLED),
struct_def_skill.$of(P_SHORT_SWORD, P_EXPERT),
struct_def_skill.$of(P_BROAD_SWORD, P_SKILLED),
struct_def_skill.$of(P_LONG_SWORD, P_EXPERT),
struct_def_skill.$of(P_TWO_HANDED_SWORD, P_EXPERT),
struct_def_skill.$of(P_SCIMITAR, P_BASIC),
struct_def_skill.$of(P_SABER, P_BASIC),
struct_def_skill.$of(P_FLAIL, P_SKILLED),
struct_def_skill.$of(P_QUARTERSTAFF, P_BASIC),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_SKILLED),
struct_def_skill.$of(P_LANCE, P_SKILLED),
struct_def_skill.$of(P_BOW, P_EXPERT),
struct_def_skill.$of(P_SHURIKEN, P_EXPERT),
struct_def_skill.$of(P_ATTACK_SPELL, P_BASIC),
struct_def_skill.$of(P_DIVINATION_SPELL, P_BASIC),
struct_def_skill.$of(P_CLERIC_SPELL, P_SKILLED),
struct_def_skill.$of(P_RIDING, P_SKILLED),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_EXPERT),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_MASTER),
struct_def_skill.$of(P_NONE)]);
  Skill_T = $sarrOf([struct_def_skill.$of(P_DAGGER, P_EXPERT),
struct_def_skill.$of(P_KNIFE, P_SKILLED),
struct_def_skill.$of(P_AXE, P_BASIC),
struct_def_skill.$of(P_PICK_AXE, P_BASIC),
struct_def_skill.$of(P_SHORT_SWORD, P_EXPERT),
struct_def_skill.$of(P_BROAD_SWORD, P_BASIC),
struct_def_skill.$of(P_LONG_SWORD, P_BASIC),
struct_def_skill.$of(P_TWO_HANDED_SWORD, P_BASIC),
struct_def_skill.$of(P_SCIMITAR, P_SKILLED),
struct_def_skill.$of(P_SABER, P_SKILLED),
struct_def_skill.$of(P_MACE, P_BASIC),
struct_def_skill.$of(P_MORNING_STAR, P_BASIC),
struct_def_skill.$of(P_FLAIL, P_BASIC),
struct_def_skill.$of(P_HAMMER, P_BASIC),
struct_def_skill.$of(P_QUARTERSTAFF, P_BASIC),
struct_def_skill.$of(P_POLEARMS, P_BASIC),
struct_def_skill.$of(P_SPEAR, P_BASIC),
struct_def_skill.$of(P_TRIDENT, P_BASIC),
struct_def_skill.$of(P_LANCE, P_BASIC),
struct_def_skill.$of(P_BOW, P_BASIC),
struct_def_skill.$of(P_SLING, P_BASIC),
struct_def_skill.$of(P_CROSSBOW, P_BASIC),
struct_def_skill.$of(P_DART, P_EXPERT),
struct_def_skill.$of(P_SHURIKEN, P_BASIC),
struct_def_skill.$of(P_BOOMERANG, P_BASIC),
struct_def_skill.$of(P_WHIP, P_BASIC),
struct_def_skill.$of(P_UNICORN_HORN, P_SKILLED),
struct_def_skill.$of(P_DIVINATION_SPELL, P_BASIC),
struct_def_skill.$of(P_ENCHANTMENT_SPELL, P_BASIC),
struct_def_skill.$of(P_ESCAPE_SPELL, P_SKILLED),
struct_def_skill.$of(P_RIDING, P_BASIC),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_SKILLED),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_SKILLED),
struct_def_skill.$of(P_NONE)]);
  Skill_V = $sarrOf([struct_def_skill.$of(P_DAGGER, P_EXPERT),
struct_def_skill.$of(P_AXE, P_EXPERT),
struct_def_skill.$of(P_PICK_AXE, P_SKILLED),
struct_def_skill.$of(P_SHORT_SWORD, P_SKILLED),
struct_def_skill.$of(P_BROAD_SWORD, P_SKILLED),
struct_def_skill.$of(P_LONG_SWORD, P_EXPERT),
struct_def_skill.$of(P_TWO_HANDED_SWORD, P_EXPERT),
struct_def_skill.$of(P_SCIMITAR, P_BASIC),
struct_def_skill.$of(P_SABER, P_BASIC),
struct_def_skill.$of(P_HAMMER, P_EXPERT),
struct_def_skill.$of(P_QUARTERSTAFF, P_BASIC),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_SKILLED),
struct_def_skill.$of(P_TRIDENT, P_BASIC),
struct_def_skill.$of(P_LANCE, P_SKILLED),
struct_def_skill.$of(P_SLING, P_BASIC),
struct_def_skill.$of(P_ATTACK_SPELL, P_BASIC),
struct_def_skill.$of(P_ESCAPE_SPELL, P_BASIC),
struct_def_skill.$of(P_RIDING, P_SKILLED),
struct_def_skill.$of(P_TWO_WEAPON_COMBAT, P_SKILLED),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_EXPERT),
struct_def_skill.$of(P_NONE)]);
  Skill_W = $sarrOf([struct_def_skill.$of(P_DAGGER, P_EXPERT),
struct_def_skill.$of(P_KNIFE, P_SKILLED),
struct_def_skill.$of(P_AXE, P_SKILLED),
struct_def_skill.$of(P_SHORT_SWORD, P_BASIC),
struct_def_skill.$of(P_CLUB, P_SKILLED),
struct_def_skill.$of(P_MACE, P_BASIC),
struct_def_skill.$of(P_QUARTERSTAFF, P_EXPERT),
struct_def_skill.$of(P_POLEARMS, P_SKILLED),
struct_def_skill.$of(P_SPEAR, P_BASIC),
struct_def_skill.$of(P_TRIDENT, P_BASIC),
struct_def_skill.$of(P_SLING, P_SKILLED),
struct_def_skill.$of(P_DART, P_EXPERT),
struct_def_skill.$of(P_SHURIKEN, P_BASIC),
struct_def_skill.$of(P_ATTACK_SPELL, P_EXPERT),
struct_def_skill.$of(P_HEALING_SPELL, P_SKILLED),
struct_def_skill.$of(P_DIVINATION_SPELL, P_EXPERT),
struct_def_skill.$of(P_ENCHANTMENT_SPELL, P_SKILLED),
struct_def_skill.$of(P_CLERIC_SPELL, P_SKILLED),
struct_def_skill.$of(P_ESCAPE_SPELL, P_EXPERT),
struct_def_skill.$of(P_MATTER_SPELL, P_EXPERT),
struct_def_skill.$of(P_RIDING, P_BASIC),
struct_def_skill.$of(P_BARE_HANDED_COMBAT, P_BASIC),
struct_def_skill.$of(P_NONE)]);
  u_init$M_spell = $ta(Int16Array, 3, [SPE_HEALING, SPE_PROTECTION, SPE_SLEEP]);
  u_init$trotyp = $ta(Int32Array, 6, [WOODEN_FLUTE, TOOLED_HORN, WOODEN_HARP, BELL, BUGLE, LEATHER_DRUM]);
  ini_inv$nocreate = STRANGE_OBJECT;
  ini_inv$nocreate2 = STRANGE_OBJECT;
  ini_inv$nocreate3 = STRANGE_OBJECT;
  ini_inv$nocreate4 = STRANGE_OBJECT;
}
