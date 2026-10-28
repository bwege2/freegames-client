// @ts-nocheck
// NetHack 3.6.7 role.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { eos, s_suffix, strkitten, strncmpi, strstri, strsubst } from './hacklib.ts';
import { impossible } from './pline.ts';
import { align_gtitle } from './pray.ts';
import { rn2 } from './rnd.ts';
import { anon_role_c_769, struct_Align, struct_Gender, struct_Race, struct_Role, struct_RoleAdvance, struct_RoleName, struct_monst, union_any } from './structs.ts';
import { $cs, $peq, $rd, $sarr, $sarrOf, $sat, $ta, $u64, $wr, G, P, S, rn2_on_display_rng, sprintf, strcat, strchr, strcpy, strlen } from './rt/index.ts';
import { AM_CHAOTIC, AM_LAWFUL, AM_NEUTRAL, ART_EYES_OF_THE_OVERWORLD, ART_EYE_OF_THE_AETHIOPICA, ART_HEART_OF_AHRIMAN, ART_LONGBOW_OF_DIANA, ART_MAGIC_MIRROR_OF_MERLIN, ART_MASTER_KEY_OF_THIEVERY, ART_MITRE_OF_HOLINESS, ART_ORB_OF_DETECTION, ART_ORB_OF_FATE, ART_SCEPTRE_OF_MIGHT, ART_STAFF_OF_AESCULAPIUS, ART_TSURUGI_OF_MURAMASA, ART_YENDORIAN_EXPRESS_CARD, ATR_NONE, A_CHAOTIC, A_INT, A_LAWFUL, A_NEUTRAL, A_NONE, A_WIS, BP_ALIGN, BP_GEND, BP_RACE, BP_ROLE, FALSE, M2_HOSTILE, M2_NASTY, M2_PEACEFUL, M2_STALK, M3_CLOSE, M3_WAITFORU, M3_WANTSARTI, MENU_SELECTED, MENU_UNSELECTED, MH_DWARF, MH_ELF, MH_GNOME, MH_HUMAN, MH_ORC, MS_LEADER, MS_NEMESIS, NON_PM, NO_GLYPH, NUM_BP, PICK_RANDOM, PICK_RIGID, PL_CSIZ, PM_ABBOT, PM_ACOLYTE, PM_APPRENTICE, PM_ARCHEOLOGIST, PM_ARCH_PRIEST, PM_ASHIKAGA_TAKAUJI, PM_ATTENDANT, PM_BARBARIAN, PM_BUGBEAR, PM_CAVEMAN, PM_CAVEWOMAN, PM_CHIEFTAIN, PM_CHROMATIC_DRAGON, PM_CYCLOPS, PM_DARK_ONE, PM_DWARF, PM_DWARF_MUMMY, PM_DWARF_ZOMBIE, PM_EARTH_ELEMENTAL, PM_ELF, PM_ELF_MUMMY, PM_ELF_ZOMBIE, PM_FIRE_ANT, PM_FIRE_GIANT, PM_FOREST_CENTAUR, PM_GIANT_RAT, PM_GIANT_SPIDER, PM_GNOME, PM_GNOME_MUMMY, PM_GNOME_ZOMBIE, PM_GRAND_MASTER, PM_GUARDIAN_NAGA, PM_GUIDE, PM_HEALER, PM_HILL_GIANT, PM_HIPPOCRATES, PM_HUMAN, PM_HUMAN_MUMMY, PM_HUMAN_ZOMBIE, PM_HUNTER, PM_IXOTH, PM_KING_ARTHUR, PM_KITTEN, PM_KNIGHT, PM_LEPRECHAUN, PM_LITTLE_DOG, PM_LORD_CARNARVON, PM_LORD_SATO, PM_LORD_SURTUR, PM_MAIL_DAEMON, PM_MASTER_ASSASSIN, PM_MASTER_KAEN, PM_MASTER_OF_THIEVES, PM_MINION_OF_HUHETOTL, PM_MONK, PM_NALZOK, PM_NEANDERTHAL, PM_NEFERET_THE_GREEN, PM_NORN, PM_OCHRE_JELLY, PM_OGRE, PM_ORC, PM_ORC_MUMMY, PM_ORC_ZOMBIE, PM_ORION, PM_PAGE, PM_PELIAS, PM_PONY, PM_PRIEST, PM_PRIESTESS, PM_QUASIT, PM_RANGER, PM_ROGUE, PM_ROSHI, PM_SAMURAI, PM_SCORPION, PM_SCORPIUS, PM_SHAMAN_KARNOV, PM_SHOPKEEPER, PM_SNAKE, PM_STALKER, PM_STUDENT, PM_THOTH_AMON, PM_THUG, PM_TOURIST, PM_TROLL, PM_TWOFLOWER, PM_VALKYRIE, PM_VAMPIRE_BAT, PM_WARRIOR, PM_WIZARD, PM_WOLF, PM_WRAITH, PM_XORN, QBUFSZ, ROLE_ALIGNMASK, ROLE_ALIGNS, ROLE_CHAOTIC, ROLE_FEMALE, ROLE_GENDERS, ROLE_GENDMASK, ROLE_LAWFUL, ROLE_MALE, ROLE_NEUTER, ROLE_NEUTRAL, ROLE_NONE, ROLE_RACEMASK, ROLE_RANDOM, RS_ALGNMNT, RS_GENDER, RS_NAME, RS_RACE, RS_ROLE, RS_filter, SPE_CHARM_MONSTER, SPE_CLAIRVOYANCE, SPE_CONE_OF_COLD, SPE_CURE_SICKNESS, SPE_DETECT_TREASURE, SPE_DIG, SPE_HASTE_SELF, SPE_INVISIBILITY, SPE_MAGIC_MAPPING, SPE_MAGIC_MISSILE, SPE_REMOVE_CURSE, SPE_RESTORE_ABILITY, SPE_TURN_UNDEAD, S_ANT, S_BAT, S_CENTAUR, S_DOG, S_ELEMENTAL, S_GIANT, S_HUMANOID, S_IMP, S_JELLY, S_MUMMY, S_NAGA, S_NYMPH, S_OGRE, S_RODENT, S_SNAKE, S_SPIDER, S_TROLL, S_WRAITH, S_XORN, S_YETI, S_ZOMBIE, TRUE } from './consts.ts';

let rfilter: anon_role_c_769;
let randomstr: any;
let pa: any;
let post_attribs: number;
let root_plselection_prompt$err_ret: any;
let role_selection_prolog$choosing: any;
let role_selection_prolog$not_yet: any;
let role_selection_prolog$rand_choice: any;
let role_menu_extra$RS_menu_let: any;

export function validrole(rolenum: number): number {
  return (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 ? 1 : 0) << 24 >> 24;
}

export function randrole(for_display: number): number {
  let res = (Math.trunc(4032 / 288) | 0) - 1;
  if (for_display) {
    res = rn2_on_display_rng(res);
  } else {
    res = rn2(res);
  }
  return res;
}

function randrole_filtered(): number {
  let i = 0;
  let n = 0;
  let set_ = new Int32Array(14);
  for (i = 0; i < (Math.trunc(4032 / 288) | 0); ++i) {
    if (ok_role(i, ROLE_NONE, ROLE_NONE, ROLE_NONE) && ok_race(i, ROLE_RANDOM, ROLE_NONE, ROLE_NONE) && ok_gend(i, ROLE_NONE, ROLE_RANDOM, ROLE_NONE) && ok_align(i, ROLE_NONE, ROLE_NONE, ROLE_RANDOM)) {
      set_[n++] = i;
    }
  }
  return n ? set_[rn2(n)] : randrole(FALSE);
}

export function str2role(str: Ptr | null): number {
  let i = 0;
  let len = 0;
  if (!str || !str.a[str.o]) {
    return ROLE_NONE;
  }
  len = strlen(str) | 0;
  for (i = 0; G.roles[i].name.m; ++i) {
    if (!strncmpi(str, G.roles[i].name.m, len)) {
      return i;
    }
    if (G.roles[i].name.f && !strncmpi(str, G.roles[i].name.f, len)) {
      return i;
    }
    if (!strncmpi(str, G.roles[i].filecode, -1)) {
      return i;
    }
  }
  if (len === 1 && (str.a[str.o] === 42 || str.a[str.o] === 64) || !strncmpi(str, P(randomstr), len)) {
    return ROLE_RANDOM;
  }
  return ROLE_NONE;
}

export function validrace(rolenum: number, racenum: number): number {
  return (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && G.roles[rolenum].allow & G.races[racenum].allow & ROLE_RACEMASK ? 1 : 0) << 24 >> 24;
}

export function randrace(rolenum: number): number {
  let i = 0;
  let n = 0;
  for (i = 0; G.races[i].noun; ++i) {
    if (G.roles[rolenum].allow & G.races[i].allow & ROLE_RACEMASK) {
      ++n;
    }
  }
  if (n) {
    n = rn2(n * 100) / 100 | 0;
  }
  for (i = 0; G.races[i].noun; ++i) {
    if (G.roles[rolenum].allow & G.races[i].allow & ROLE_RACEMASK) {
      if (n) {
        --n;
      } else {
        return i;
      }
    }
  }
  return rn2((Math.trunc(528 / 88) | 0) - 1);
}

export function str2race(str: Ptr | null): number {
  let i = 0;
  let len = 0;
  if (!str || !str.a[str.o]) {
    return ROLE_NONE;
  }
  len = strlen(str) | 0;
  for (i = 0; G.races[i].noun; ++i) {
    if (!strncmpi(str, G.races[i].noun, len)) {
      return i;
    }
    if (!strncmpi(str, G.races[i].filecode, -1)) {
      return i;
    }
  }
  if (len === 1 && (str.a[str.o] === 42 || str.a[str.o] === 64) || !strncmpi(str, P(randomstr), len)) {
    return ROLE_RANDOM;
  }
  return ROLE_NONE;
}

export function validgend(rolenum: number, racenum: number, gendnum: number): number {
  return (gendnum >= 0 && gendnum < ROLE_GENDERS && G.roles[rolenum].allow & G.races[racenum].allow & G.genders[gendnum].allow & ROLE_GENDMASK ? 1 : 0) << 24 >> 24;
}

export function randgend(rolenum: number, racenum: number): number {
  let i = 0;
  let n = 0;
  for (i = 0; i < ROLE_GENDERS; ++i) {
    if (G.roles[rolenum].allow & G.races[racenum].allow & G.genders[i].allow & ROLE_GENDMASK) {
      ++n;
    }
  }
  if (n) {
    n = rn2(n);
  }
  for (i = 0; i < ROLE_GENDERS; ++i) {
    if (G.roles[rolenum].allow & G.races[racenum].allow & G.genders[i].allow & ROLE_GENDMASK) {
      if (n) {
        --n;
      } else {
        return i;
      }
    }
  }
  return rn2(ROLE_GENDERS);
}

export function str2gend(str: Ptr | null): number {
  let i = 0;
  let len = 0;
  if (!str || !str.a[str.o]) {
    return ROLE_NONE;
  }
  len = strlen(str) | 0;
  for (i = 0; i < ROLE_GENDERS; ++i) {
    if (!strncmpi(str, G.genders[i].adj, len)) {
      return i;
    }
    if (!strncmpi(str, G.genders[i].filecode, -1)) {
      return i;
    }
  }
  if (len === 1 && (str.a[str.o] === 42 || str.a[str.o] === 64) || !strncmpi(str, P(randomstr), len)) {
    return ROLE_RANDOM;
  }
  return ROLE_NONE;
}

export function validalign(rolenum: number, racenum: number, alignnum: number): number {
  return (alignnum >= 0 && alignnum < ROLE_ALIGNS && G.roles[rolenum].allow & G.races[racenum].allow & G.aligns[alignnum].allow & ROLE_ALIGNMASK ? 1 : 0) << 24 >> 24;
}

export function randalign(rolenum: number, racenum: number): number {
  let i = 0;
  let n = 0;
  for (i = 0; i < ROLE_ALIGNS; ++i) {
    if (G.roles[rolenum].allow & G.races[racenum].allow & G.aligns[i].allow & ROLE_ALIGNMASK) {
      ++n;
    }
  }
  if (n) {
    n = rn2(n);
  }
  for (i = 0; i < ROLE_ALIGNS; ++i) {
    if (G.roles[rolenum].allow & G.races[racenum].allow & G.aligns[i].allow & ROLE_ALIGNMASK) {
      if (n) {
        --n;
      } else {
        return i;
      }
    }
  }
  return rn2(ROLE_ALIGNS);
}

export function str2align(str: Ptr | null): number {
  let i = 0;
  let len = 0;
  if (!str || !str.a[str.o]) {
    return ROLE_NONE;
  }
  len = strlen(str) | 0;
  for (i = 0; i < ROLE_ALIGNS; ++i) {
    if (!strncmpi(str, G.aligns[i].adj, len)) {
      return i;
    }
    if (!strncmpi(str, G.aligns[i].filecode, -1)) {
      return i;
    }
  }
  if (len === 1 && (str.a[str.o] === 42 || str.a[str.o] === 64) || !strncmpi(str, P(randomstr), len)) {
    return ROLE_RANDOM;
  }
  return ROLE_NONE;
}

export function ok_role(rolenum: number, racenum: number, gendnum: number, alignnum: number): number {
  let i = 0;
  let allow = 0;
  if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1) {
    if (rfilter.roles[rolenum]) {
      return FALSE;
    }
    allow = G.roles[rolenum].allow;
    if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && !(allow & G.races[racenum].allow & ROLE_RACEMASK)) {
      return FALSE;
    }
    if (gendnum >= 0 && gendnum < ROLE_GENDERS && !(allow & G.genders[gendnum].allow & ROLE_GENDMASK)) {
      return FALSE;
    }
    if (alignnum >= 0 && alignnum < ROLE_ALIGNS && !(allow & G.aligns[alignnum].allow & ROLE_ALIGNMASK)) {
      return FALSE;
    }
    return TRUE;
  } else {
    for (i = 0; i < (Math.trunc(4032 / 288) | 0) - 1; ++i) {
      if (rfilter.roles[i]) {
        continue;
      }
      allow = G.roles[i].allow;
      if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && !(allow & G.races[racenum].allow & ROLE_RACEMASK)) {
        continue;
      }
      if (gendnum >= 0 && gendnum < ROLE_GENDERS && !(allow & G.genders[gendnum].allow & ROLE_GENDMASK)) {
        continue;
      }
      if (alignnum >= 0 && alignnum < ROLE_ALIGNS && !(allow & G.aligns[alignnum].allow & ROLE_ALIGNMASK)) {
        continue;
      }
      return TRUE;
    }
    return FALSE;
  }
}

export function pick_role(racenum: number, gendnum: number, alignnum: number, pickhow: number): number {
  let i = 0;
  let roles_ok = 0;
  let set_ = new Int32Array(14);
  for (i = 0; i < (Math.trunc(4032 / 288) | 0) - 1; ++i) {
    if (ok_role(i, racenum, gendnum, alignnum) && ok_race(i, racenum >= 0 ? racenum : ROLE_RANDOM, gendnum, alignnum) && ok_gend(i, racenum, gendnum >= 0 ? gendnum : ROLE_RANDOM, alignnum) && ok_race(i, racenum, gendnum, alignnum >= 0 ? alignnum : ROLE_RANDOM)) {
      set_[roles_ok++] = i;
    }
  }
  if (roles_ok === 0 || roles_ok > 1 && pickhow === PICK_RIGID) {
    return ROLE_NONE;
  }
  return set_[rn2(roles_ok)];
}

export function ok_race(rolenum: number, racenum: number, gendnum: number, alignnum: number): number {
  let i = 0;
  let allow = 0;
  if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1) {
    if (rfilter.mask & G.races[racenum].selfmask) {
      return FALSE;
    }
    allow = G.races[racenum].allow;
    if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 && !(allow & G.roles[rolenum].allow & ROLE_RACEMASK)) {
      return FALSE;
    }
    if (gendnum >= 0 && gendnum < ROLE_GENDERS && !(allow & G.genders[gendnum].allow & ROLE_GENDMASK)) {
      return FALSE;
    }
    if (alignnum >= 0 && alignnum < ROLE_ALIGNS && !(allow & G.aligns[alignnum].allow & ROLE_ALIGNMASK)) {
      return FALSE;
    }
    return TRUE;
  } else {
    for (i = 0; i < (Math.trunc(528 / 88) | 0) - 1; ++i) {
      if (rfilter.mask & G.races[i].selfmask) {
        continue;
      }
      allow = G.races[i].allow;
      if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 && !(allow & G.roles[rolenum].allow & ROLE_RACEMASK)) {
        continue;
      }
      if (gendnum >= 0 && gendnum < ROLE_GENDERS && !(allow & G.genders[gendnum].allow & ROLE_GENDMASK)) {
        continue;
      }
      if (alignnum >= 0 && alignnum < ROLE_ALIGNS && !(allow & G.aligns[alignnum].allow & ROLE_ALIGNMASK)) {
        continue;
      }
      return TRUE;
    }
    return FALSE;
  }
}

export function pick_race(rolenum: number, gendnum: number, alignnum: number, pickhow: number): number {
  let i = 0;
  let races_ok = 0;
  for (i = 0; i < (Math.trunc(528 / 88) | 0) - 1; ++i) {
    if (ok_race(rolenum, i, gendnum, alignnum)) {
      ++races_ok;
    }
  }
  if (races_ok === 0 || races_ok > 1 && pickhow === PICK_RIGID) {
    return ROLE_NONE;
  }
  races_ok = rn2(races_ok);
  for (i = 0; i < (Math.trunc(528 / 88) | 0) - 1; ++i) {
    if (ok_race(rolenum, i, gendnum, alignnum)) {
      if (races_ok === 0) {
        return i;
      } else {
        --races_ok;
      }
    }
  }
  return ROLE_NONE;
}

export function ok_gend(rolenum: number, racenum: number, gendnum: number, alignnum: number): number {
  let i = 0;
  let allow = 0;
  if (gendnum >= 0 && gendnum < ROLE_GENDERS) {
    if (rfilter.mask & G.genders[gendnum].allow) {
      return FALSE;
    }
    allow = G.genders[gendnum].allow;
    if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 && !(allow & G.roles[rolenum].allow & ROLE_GENDMASK)) {
      return FALSE;
    }
    if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && !(allow & G.races[racenum].allow & ROLE_GENDMASK)) {
      return FALSE;
    }
    return TRUE;
  } else {
    for (i = 0; i < ROLE_GENDERS; ++i) {
      if (rfilter.mask & G.genders[i].allow) {
        continue;
      }
      allow = G.genders[i].allow;
      if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 && !(allow & G.roles[rolenum].allow & ROLE_GENDMASK)) {
        continue;
      }
      if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && !(allow & G.races[racenum].allow & ROLE_GENDMASK)) {
        continue;
      }
      return TRUE;
    }
    return FALSE;
  }
}

export function pick_gend(rolenum: number, racenum: number, alignnum: number, pickhow: number): number {
  let i = 0;
  let gends_ok = 0;
  for (i = 0; i < ROLE_GENDERS; ++i) {
    if (ok_gend(rolenum, racenum, i, alignnum)) {
      ++gends_ok;
    }
  }
  if (gends_ok === 0 || gends_ok > 1 && pickhow === PICK_RIGID) {
    return ROLE_NONE;
  }
  gends_ok = rn2(gends_ok);
  for (i = 0; i < ROLE_GENDERS; ++i) {
    if (ok_gend(rolenum, racenum, i, alignnum)) {
      if (gends_ok === 0) {
        return i;
      } else {
        --gends_ok;
      }
    }
  }
  return ROLE_NONE;
}

export function ok_align(rolenum: number, racenum: number, gendnum: number, alignnum: number): number {
  let i = 0;
  let allow = 0;
  if (alignnum >= 0 && alignnum < ROLE_ALIGNS) {
    if (rfilter.mask & G.aligns[alignnum].allow) {
      return FALSE;
    }
    allow = G.aligns[alignnum].allow;
    if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 && !(allow & G.roles[rolenum].allow & ROLE_ALIGNMASK)) {
      return FALSE;
    }
    if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && !(allow & G.races[racenum].allow & ROLE_ALIGNMASK)) {
      return FALSE;
    }
    return TRUE;
  } else {
    for (i = 0; i < ROLE_ALIGNS; ++i) {
      if (rfilter.mask & G.aligns[i].allow) {
        return FALSE;
      }
      allow = G.aligns[i].allow;
      if (rolenum >= 0 && rolenum < (Math.trunc(4032 / 288) | 0) - 1 && !(allow & G.roles[rolenum].allow & ROLE_ALIGNMASK)) {
        continue;
      }
      if (racenum >= 0 && racenum < (Math.trunc(528 / 88) | 0) - 1 && !(allow & G.races[racenum].allow & ROLE_ALIGNMASK)) {
        continue;
      }
      return TRUE;
    }
    return FALSE;
  }
}

export function pick_align(rolenum: number, racenum: number, gendnum: number, pickhow: number): number {
  let i = 0;
  let aligns_ok = 0;
  for (i = 0; i < ROLE_ALIGNS; ++i) {
    if (ok_align(rolenum, racenum, gendnum, i)) {
      ++aligns_ok;
    }
  }
  if (aligns_ok === 0 || aligns_ok > 1 && pickhow === PICK_RIGID) {
    return ROLE_NONE;
  }
  aligns_ok = rn2(aligns_ok);
  for (i = 0; i < ROLE_ALIGNS; ++i) {
    if (ok_align(rolenum, racenum, gendnum, i)) {
      if (aligns_ok === 0) {
        return i;
      } else {
        --aligns_ok;
      }
    }
  }
  return ROLE_NONE;
}

export function rigid_role_checks(): void {
  let tmp = 0;
  if (G.flags.initrole === ROLE_RANDOM) {
    G.flags.initrole = pick_role(G.flags.initrace, G.flags.initgend, G.flags.initalign, PICK_RANDOM);
    if (G.flags.initrole < 0) {
      G.flags.initrole = randrole_filtered();
    }
  }
  if (G.flags.initrace === ROLE_RANDOM && (tmp = pick_race(G.flags.initrole, G.flags.initgend, G.flags.initalign, PICK_RANDOM)) !== ROLE_NONE) {
    G.flags.initrace = tmp;
  }
  if (G.flags.initalign === ROLE_RANDOM && (tmp = pick_align(G.flags.initrole, G.flags.initrace, G.flags.initgend, PICK_RANDOM)) !== ROLE_NONE) {
    G.flags.initalign = tmp;
  }
  if (G.flags.initgend === ROLE_RANDOM && (tmp = pick_gend(G.flags.initrole, G.flags.initrace, G.flags.initalign, PICK_RANDOM)) !== ROLE_NONE) {
    G.flags.initgend = tmp;
  }
  if (G.flags.initrole !== ROLE_NONE) {
    if (G.flags.initrace === ROLE_NONE) {
      G.flags.initrace = pick_race(G.flags.initrole, G.flags.initgend, G.flags.initalign, PICK_RIGID);
    }
    if (G.flags.initalign === ROLE_NONE) {
      G.flags.initalign = pick_align(G.flags.initrole, G.flags.initrace, G.flags.initgend, PICK_RIGID);
    }
    if (G.flags.initgend === ROLE_NONE) {
      G.flags.initgend = pick_gend(G.flags.initrole, G.flags.initrace, G.flags.initalign, PICK_RIGID);
    }
  }
}

export function setrolefilter(bufp: Ptr | null): number {
  let i = 0;
  let reslt = TRUE;
  if ((i = str2role(bufp)) !== ROLE_NONE && i !== ROLE_RANDOM) {
    rfilter.roles[i] = TRUE;
  } else if ((i = str2race(bufp)) !== ROLE_NONE && i !== ROLE_RANDOM) {
    rfilter.mask = (rfilter.mask | G.races[i].selfmask) << 16 >> 16;
  } else if ((i = str2gend(bufp)) !== ROLE_NONE && i !== ROLE_RANDOM) {
    rfilter.mask = (rfilter.mask | G.genders[i].allow) << 16 >> 16;
  } else if ((i = str2align(bufp)) !== ROLE_NONE && i !== ROLE_RANDOM) {
    rfilter.mask = (rfilter.mask | G.aligns[i].allow) << 16 >> 16;
  } else {
    reslt = FALSE;
  }
  return reslt;
}

export function gotrolefilter(): number {
  let i = 0;
  if (rfilter.mask) {
    return TRUE;
  }
  for (i = 0; i < (Math.trunc(4032 / 288) | 0); ++i) {
    if (rfilter.roles[i]) {
      return TRUE;
    }
  }
  return FALSE;
}

export function clearrolefilter(): void {
  let i = 0;
  for (i = 0; i < (Math.trunc(4032 / 288) | 0); ++i) {
    rfilter.roles[i] = FALSE;
  }
  rfilter.mask = 0;
}

function promptsep(buf: Ptr | null, num_post_attribs: number): Ptr | null {
  let conjuct = S("and ");
  if (num_post_attribs > 1 && post_attribs < num_post_attribs && post_attribs > 1) {
    strcat(buf, S(","));
  }
  strcat(buf, S(" "));
  post_attribs = post_attribs - 1 << 24 >> 24;
  if (!post_attribs && num_post_attribs > 1) {
    strcat(buf, conjuct);
  }
  return buf;
}

function role_gendercount(rolenum: number): number {
  let gendcount = 0;
  if (validrole(rolenum)) {
    if (G.roles[rolenum].allow & ROLE_MALE) {
      ++gendcount;
    }
    if (G.roles[rolenum].allow & ROLE_FEMALE) {
      ++gendcount;
    }
    if (G.roles[rolenum].allow & ROLE_NEUTER) {
      ++gendcount;
    }
  }
  return gendcount;
}

function race_alignmentcount(racenum: number): number {
  let aligncount = 0;
  if (racenum !== ROLE_NONE && racenum !== ROLE_RANDOM) {
    if (G.races[racenum].allow & ROLE_CHAOTIC) {
      ++aligncount;
    }
    if (G.races[racenum].allow & ROLE_LAWFUL) {
      ++aligncount;
    }
    if (G.races[racenum].allow & ROLE_NEUTRAL) {
      ++aligncount;
    }
  }
  return aligncount;
}

export function root_plselection_prompt(suppliedbuf: Ptr | null, buflen: number, rolenum: number, racenum: number, gendnum: number, alignnum: number): Ptr | null {
  let k = 0;
  let gendercount = 0;
  let aligncount = 0;
  let buf = new Int8Array(256);
  let donefirst = FALSE;
  if (!suppliedbuf || buflen < 1) {
    return P(root_plselection_prompt$err_ret);
  }
  post_attribs = 0;
  for (k = 0; k < NUM_BP; ++k) {
    pa[k] = 0;
  }
  buf[0] = 0;
  suppliedbuf.a[suppliedbuf.o] = 0;
  if (racenum !== ROLE_NONE && racenum !== ROLE_RANDOM) {
    aligncount = race_alignmentcount(racenum);
  }
  if (alignnum !== ROLE_NONE && alignnum !== ROLE_RANDOM && ok_align(rolenum, racenum, gendnum, alignnum)) {
    if (racenum >= 0 && aligncount > 1) {
      if (donefirst) {
        strcat(P(buf), S(" "));
      }
      strcat(P(buf), G.aligns[alignnum].adj);
      donefirst = TRUE;
    } else {
      if (donefirst) {
        strcat(P(buf), S(" "));
      }
      strcat(P(buf), G.aligns[alignnum].adj);
      donefirst = TRUE;
    }
  } else {
    if (alignnum !== ROLE_RANDOM) {
      alignnum = ROLE_NONE;
    }
    if (racenum !== ROLE_NONE && racenum !== ROLE_RANDOM && ok_race(rolenum, racenum, gendnum, alignnum) && aligncount > 1 || (racenum === ROLE_NONE || racenum === ROLE_RANDOM)) {
      pa[BP_ALIGN] = 1;
      post_attribs = post_attribs + 1 << 24 >> 24;
    }
  }
  if (validrole(rolenum)) {
    gendercount = role_gendercount(rolenum);
  }
  if (gendnum !== ROLE_NONE && gendnum !== ROLE_RANDOM) {
    if (validrole(rolenum)) {
      if (rolenum !== ROLE_NONE && gendercount > 1 && !G.roles[rolenum].name.f) {
        if (donefirst) {
          strcat(P(buf), S(" "));
        }
        strcat(P(buf), G.genders[gendnum].adj);
        donefirst = TRUE;
      }
    } else {
      if (donefirst) {
        strcat(P(buf), S(" "));
      }
      strcat(P(buf), G.genders[gendnum].adj);
      donefirst = TRUE;
    }
  } else {
    if (validrole(rolenum) && gendercount > 1 || !validrole(rolenum)) {
      pa[BP_GEND] = 1;
      post_attribs = post_attribs + 1 << 24 >> 24;
    }
  }
  if (racenum !== ROLE_NONE && racenum !== ROLE_RANDOM) {
    if (validrole(rolenum) && ok_race(rolenum, racenum, gendnum, alignnum)) {
      if (donefirst) {
        strcat(P(buf), S(" "));
      }
      strcat(P(buf), rolenum === ROLE_NONE ? G.races[racenum].noun : G.races[racenum].adj);
      donefirst = TRUE;
    } else if (!validrole(rolenum)) {
      if (donefirst) {
        strcat(P(buf), S(" "));
      }
      strcat(P(buf), G.races[racenum].noun);
      donefirst = TRUE;
    } else {
      pa[BP_RACE] = 1;
      post_attribs = post_attribs + 1 << 24 >> 24;
    }
  } else {
    pa[BP_RACE] = 1;
    post_attribs = post_attribs + 1 << 24 >> 24;
  }
  if (validrole(rolenum)) {
    if (donefirst) {
      strcat(P(buf), S(" "));
    }
    if (gendnum !== ROLE_NONE) {
      if (gendnum === 1 && G.roles[rolenum].name.f) {
        strcat(P(buf), G.roles[rolenum].name.f);
      } else {
        strcat(P(buf), G.roles[rolenum].name.m);
      }
    } else {
      if (G.roles[rolenum].name.f) {
        strcat(P(buf), G.roles[rolenum].name.m);
        strcat(P(buf), S("/"));
        strcat(P(buf), G.roles[rolenum].name.f);
      } else {
        strcat(P(buf), G.roles[rolenum].name.m);
      }
    }
    donefirst = TRUE;
  } else if (rolenum === ROLE_NONE) {
    pa[BP_ROLE] = 1;
    post_attribs = post_attribs + 1 << 24 >> 24;
  }
  if ((racenum === ROLE_NONE || racenum === ROLE_RANDOM) && !validrole(rolenum)) {
    if (donefirst) {
      strcat(P(buf), S(" "));
    }
    strcat(P(buf), S("character"));
    donefirst = TRUE;
  }
  if (buflen > (strlen(P(buf)) + 1 | 0)) {
    strcpy(suppliedbuf, P(buf));
    return suppliedbuf;
  } else {
    return P(root_plselection_prompt$err_ret);
  }
}

export function build_plselection_prompt(buf: Ptr | null, buflen: number, rolenum: number, racenum: number, gendnum: number, alignnum: number): Ptr | null {
  let defprompt = S("Shall I pick a character for you? [ynaq] ");
  let num_post_attribs = 0;
  let tmpbuf = new Int8Array(256);
  let p = null;
  if (buflen < QBUFSZ) {
    return defprompt;
  }
  strcpy(P(tmpbuf), S("Shall I pick "));
  if (racenum !== ROLE_NONE || validrole(rolenum)) {
    strcat(P(tmpbuf), S("your "));
  } else {
    strcat(P(tmpbuf), S("a "));
  }
  root_plselection_prompt(eos(P(tmpbuf)), $u64(buflen) - strlen(P(tmpbuf)) | 0, rolenum, racenum, gendnum, alignnum);
  strsubst(P(tmpbuf), S("pick a character"), S("pick character"));
  sprintf(buf, S("%s"), s_suffix(P(tmpbuf)));
  if (!!(p = strstri(buf, S("priest/priestess'"))) && p.a[p.o + (18 - 1)] === 0) {
    strkitten(buf, 115);
  }
  num_post_attribs = post_attribs;
  if (!num_post_attribs) {
    if (G.flags.initrole === ROLE_NONE && !pa[BP_ROLE]) {
      pa[BP_ROLE] = post_attribs = post_attribs + 1 << 24 >> 24;
    }
    if (G.flags.initrace === ROLE_NONE && !pa[BP_RACE]) {
      pa[BP_RACE] = post_attribs = post_attribs + 1 << 24 >> 24;
    }
    if (G.flags.initalign === ROLE_NONE && !pa[BP_ALIGN]) {
      pa[BP_ALIGN] = post_attribs = post_attribs + 1 << 24 >> 24;
    }
    if (G.flags.initgend === ROLE_NONE && !pa[BP_GEND]) {
      pa[BP_GEND] = post_attribs = post_attribs + 1 << 24 >> 24;
    }
    num_post_attribs = post_attribs;
  }
  if (num_post_attribs) {
    if (pa[BP_RACE]) {
      promptsep(eos(buf), num_post_attribs);
      strcat(buf, S("race"));
    }
    if (pa[BP_ROLE]) {
      promptsep(eos(buf), num_post_attribs);
      strcat(buf, S("role"));
    }
    if (pa[BP_GEND]) {
      promptsep(eos(buf), num_post_attribs);
      strcat(buf, S("gender"));
    }
    if (pa[BP_ALIGN]) {
      promptsep(eos(buf), num_post_attribs);
      strcat(buf, S("alignment"));
    }
  }
  strcat(buf, S(" for you? [ynaq] "));
  return buf;
}

export async function plnamesuffix(): Promise<void> {
  let $t1: any, $t2: any;
  let sptr = null;
  let eptr = null;
  let i = 0;
  if (G.sysopt.genericusers) {
    if (G.sysopt.genericusers.a[G.sysopt.genericusers.o] === 42) {
      $wr(P(G.plname), 0, 0);
    } else {
      i = strlen(P(G.plname)) | 0;
      if (!!(sptr = strstri(G.sysopt.genericusers, P(G.plname))) && ($peq(sptr, G.sysopt.genericusers) || sptr.a[sptr.o + -1] === 32) && (sptr.a[sptr.o + i] === 32 || sptr.a[sptr.o + i] === 0)) {
        $wr(P(G.plname), 0, 0);
      }
    }
  }
  do {
    if (!$rd(P(G.plname))) {
      await G.windowprocs.win_askname();
    }
    if (!!(eptr = strchr(P(G.plname), 45))) {
      $wr(($t1 = eptr, eptr = $t1.add(1), $t1), 0, 0);
    }
    while (eptr) {
      sptr = eptr;
      if (!!(eptr = strchr(sptr, 45))) {
        $wr(($t2 = eptr, eptr = $t2.add(1), $t2), 0, 0);
      }
      if ((i = str2role(sptr)) !== ROLE_NONE) {
        G.flags.initrole = i;
      } else if ((i = str2race(sptr)) !== ROLE_NONE) {
        G.flags.initrace = i;
      } else if ((i = str2gend(sptr)) !== ROLE_NONE) {
        G.flags.initgend = i;
      } else if ((i = str2align(sptr)) !== ROLE_NONE) {
        G.flags.initalign = i;
      }
    }
  } while (!$rd(P(G.plname)) && !G.iflags.defer_plname);
  for (sptr = P(G.plname); sptr.a[sptr.o]; sptr = sptr.add(1)) {
    if (sptr.a[sptr.o] === 44) {
      sptr.a[sptr.o] = 32;
    }
  }
}

export async function role_selection_prolog(which: number, where: number): Promise<void> {
  let buf = new Int8Array(256);
  let r = 0;
  let c = 0;
  let g = 0;
  let a = 0;
  let allowmask = 0;
  r = G.flags.initrole;
  c = G.flags.initrace;
  g = G.flags.initgend;
  a = G.flags.initalign;
  if (r >= 0) {
    allowmask = G.roles[r].allow;
    if ((allowmask & ROLE_RACEMASK) === MH_HUMAN) {
      c = 0;
    } else if (c >= 0 && !(allowmask & ROLE_RACEMASK & G.races[c].allow)) {
      c = ROLE_RANDOM;
    }
    if ((allowmask & ROLE_GENDMASK) === ROLE_MALE) {
      g = 0;
    } else if ((allowmask & ROLE_GENDMASK) === ROLE_FEMALE) {
      g = 1;
    }
    if ((allowmask & ROLE_ALIGNMASK) === AM_LAWFUL) {
      a = 0;
    } else if ((allowmask & ROLE_ALIGNMASK) === AM_NEUTRAL) {
      a = 1;
    } else if ((allowmask & ROLE_ALIGNMASK) === AM_CHAOTIC) {
      a = 2;
    }
  }
  if (c >= 0) {
    allowmask = G.races[c].allow;
    if ((allowmask & ROLE_ALIGNMASK) === AM_LAWFUL) {
      a = 0;
    } else if ((allowmask & ROLE_ALIGNMASK) === AM_NEUTRAL) {
      a = 1;
    } else if ((allowmask & ROLE_ALIGNMASK) === AM_CHAOTIC) {
      a = 2;
    }
  }
  sprintf(P(buf), S("%12s "), S("name:"));
  strcat(P(buf), which === RS_NAME ? P(role_selection_prolog$choosing) : !$rd(P(G.plname)) ? P(role_selection_prolog$not_yet) : P(G.plname));
  await G.windowprocs.win_putstr(where, 0, P(buf));
  sprintf(P(buf), S("%12s "), S("role:"));
  strcat(P(buf), which === RS_ROLE ? P(role_selection_prolog$choosing) : r === ROLE_NONE ? P(role_selection_prolog$not_yet) : r === ROLE_RANDOM ? P(role_selection_prolog$rand_choice) : G.roles[r].name.m);
  if (r >= 0 && G.roles[r].name.f) {
    if (g === 1) {
      sprintf(strchr(P(buf), 58), S(": %s"), G.roles[r].name.f);
    } else if (g < 0) {
      sprintf(eos(P(buf)), S("/%s"), G.roles[r].name.f);
    }
  }
  await G.windowprocs.win_putstr(where, 0, P(buf));
  sprintf(P(buf), S("%12s "), S("race:"));
  strcat(P(buf), which === RS_RACE ? P(role_selection_prolog$choosing) : c === ROLE_NONE ? P(role_selection_prolog$not_yet) : c === ROLE_RANDOM ? P(role_selection_prolog$rand_choice) : G.races[c].noun);
  await G.windowprocs.win_putstr(where, 0, P(buf));
  sprintf(P(buf), S("%12s "), S("gender:"));
  strcat(P(buf), which === RS_GENDER ? P(role_selection_prolog$choosing) : g === ROLE_NONE ? P(role_selection_prolog$not_yet) : g === ROLE_RANDOM ? P(role_selection_prolog$rand_choice) : G.genders[g].adj);
  await G.windowprocs.win_putstr(where, 0, P(buf));
  sprintf(P(buf), S("%12s "), S("alignment:"));
  strcat(P(buf), which === RS_ALGNMNT ? P(role_selection_prolog$choosing) : a === ROLE_NONE ? P(role_selection_prolog$not_yet) : a === ROLE_RANDOM ? P(role_selection_prolog$rand_choice) : G.aligns[a].adj);
  await G.windowprocs.win_putstr(where, 0, P(buf));
}

export async function role_menu_extra(which: number, where: number, preselect: number): Promise<void> {
  let any = new union_any();
  let buf = new Int8Array(256);
  let what = null;
  let constrainer = null;
  let forcedvalue = null;
  let f = 0;
  let r = 0;
  let c = 0;
  let g = 0;
  let a = 0;
  let i = 0;
  let allowmask = 0;
  r = G.flags.initrole;
  c = G.flags.initrace;
  switch (which) {
  case 0:
    what = S("name");
    break;
  case 1:
    what = S("role");
    f = r;
    for (i = 0; i < (Math.trunc(4032 / 288) | 0); ++i) {
      if (i !== f && !rfilter.roles[i]) {
        break;
      }
    }
    if (i === (Math.trunc(4032 / 288) | 0)) {
      constrainer = S("filter");
      forcedvalue = S("role");
    }
    break;
  case 2:
    what = S("race");
    f = G.flags.initrace;
    c = ROLE_NONE;
    if (r >= 0) {
      allowmask = G.roles[r].allow & ROLE_RACEMASK;
      if (allowmask === MH_HUMAN) {
        c = 0;
      }
      if (c >= 0) {
        constrainer = S("role");
        forcedvalue = G.races[c].noun;
      } else if (f >= 0 && (allowmask & ~rfilter.mask) === G.races[f].selfmask) {
        constrainer = S("filter");
        forcedvalue = S("race");
      }
    }
    break;
  case 3:
    what = S("gender");
    f = G.flags.initgend;
    g = ROLE_NONE;
    if (r >= 0) {
      allowmask = G.roles[r].allow & ROLE_GENDMASK;
      if (allowmask === ROLE_MALE) {
        g = 0;
      } else if (allowmask === ROLE_FEMALE) {
        g = 1;
      }
      if (g >= 0) {
        constrainer = S("role");
        forcedvalue = G.genders[g].adj;
      } else if (f >= 0 && (allowmask & ~rfilter.mask) === G.genders[f].allow) {
        constrainer = S("filter");
        forcedvalue = S("gender");
      }
    }
    break;
  case 4:
    what = S("alignment");
    f = G.flags.initalign;
    a = ROLE_NONE;
    if (r >= 0) {
      allowmask = G.roles[r].allow & ROLE_ALIGNMASK;
      if (allowmask === AM_LAWFUL) {
        a = 0;
      } else if (allowmask === AM_NEUTRAL) {
        a = 1;
      } else if (allowmask === AM_CHAOTIC) {
        a = 2;
      }
      if (a >= 0) {
        constrainer = S("role");
      }
    }
    if (c >= 0 && !constrainer) {
      allowmask = G.races[c].allow & ROLE_ALIGNMASK;
      if (allowmask === AM_LAWFUL) {
        a = 0;
      } else if (allowmask === AM_NEUTRAL) {
        a = 1;
      } else if (allowmask === AM_CHAOTIC) {
        a = 2;
      }
      if (a >= 0) {
        constrainer = S("race");
      }
    }
    if (f >= 0 && !constrainer && (ROLE_ALIGNMASK & ~rfilter.mask) === G.aligns[f].allow) {
      constrainer = S("filter");
      forcedvalue = S("alignment");
    }
    if (a >= 0) {
      forcedvalue = G.aligns[a].adj;
    }
    break;
  }
  any.$cp(G.zeroany);
  if (constrainer) {
    any.a_int = 0;
    sprintf(P(buf), S("%4s%s forces %s"), S(""), constrainer, forcedvalue);
    await G.windowprocs.win_add_menu(where, NO_GLYPH, any, 0, 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  } else if (what) {
    any.a_int = -2 - (which + 1);
    sprintf(P(buf), S("Pick%s %s first"), f >= 0 ? S(" another") : S(""), what);
    await G.windowprocs.win_add_menu(where, NO_GLYPH, any, role_menu_extra$RS_menu_let[which], 0, ATR_NONE, P(buf), MENU_UNSELECTED);
  } else if (which === RS_filter) {
    any.a_int = -2 - (5 + 1);
    await G.windowprocs.win_add_menu(where, NO_GLYPH, any, 126, 0, ATR_NONE, S("Reset role/race/&c filtering"), MENU_UNSELECTED);
  } else if (which === ROLE_RANDOM) {
    any.a_int = ROLE_RANDOM;
    await G.windowprocs.win_add_menu(where, NO_GLYPH, any, 42, 0, ATR_NONE, S("Random"), preselect ? MENU_SELECTED : MENU_UNSELECTED);
  } else if (which === ROLE_NONE) {
    any.a_int = ROLE_NONE;
    await G.windowprocs.win_add_menu(where, NO_GLYPH, any, 113, 0, ATR_NONE, S("Quit"), preselect ? MENU_SELECTED : MENU_UNSELECTED);
  } else {
    await impossible(S("role_menu_extra: bad arg (%d)"), which);
  }
}

export async function role_init(): Promise<void> {
  let alignmnt = 0;
  let pm = null;
  await plnamesuffix();
  if (!validrole(G.flags.initrole)) {
    if ((G.flags.initrole = str2role(P(G.pl_character))) < 0) {
      G.flags.initrole = randrole_filtered();
    }
  }
  strcpy(P(G.pl_character), G.roles[G.flags.initrole].name.m);
  G.pl_character[PL_CSIZ - 1] = 0;
  if (!validrace(G.flags.initrole, G.flags.initrace)) {
    G.flags.initrace = randrace(G.flags.initrole);
  }
  if (G.flags.pantheon === -1) {
    if (!validgend(G.flags.initrole, G.flags.initrace, G.flags.female)) {
      G.flags.female = (!G.flags.female ? 1 : 0) << 24 >> 24;
    }
  }
  if (!validgend(G.flags.initrole, G.flags.initrace, G.flags.initgend)) {
    G.flags.initgend = G.flags.female;
  }
  if (!validalign(G.flags.initrole, G.flags.initrace, G.flags.initalign)) {
    G.flags.initalign = randalign(G.flags.initrole, G.flags.initrace);
  }
  alignmnt = G.aligns[G.flags.initalign].value;
  G.urole.$cp(G.roles[G.flags.initrole]);
  G.urace.$cp(G.races[G.flags.initrace]);
  if (G.urole.ldrnum !== NON_PM) {
    pm = $sat(G.mons, G.urole.ldrnum);
    pm.msound = MS_LEADER;
    pm.mflags2 = (pm.mflags2 | M2_PEACEFUL) >>> 0;
    pm.mflags3 = (pm.mflags3 | M3_CLOSE) & 0xffff;
    pm.maligntyp = alignmnt * 3 << 24 >> 24;
    G.quest_status.ldrgend = (((pm.mflags2 & 262144) >>> 0 !== 0 ? 2 : (pm.mflags2 & 131072) >>> 0 !== 0 ? 1 : (pm.mflags2 & 65536) >>> 0 !== 0 ? 0 : rn2(100) < 50 ? 1 : 0) >>> 0) & 3;
  }
  if (G.urole.guardnum !== NON_PM) {
    pm = $sat(G.mons, G.urole.guardnum);
    pm.mflags2 = (pm.mflags2 | M2_PEACEFUL) >>> 0;
    pm.maligntyp = alignmnt * 3 << 24 >> 24;
  }
  if (G.urole.neminum !== NON_PM) {
    pm = $sat(G.mons, G.urole.neminum);
    pm.msound = MS_NEMESIS;
    pm.mflags2 = (pm.mflags2 & ~M2_PEACEFUL >>> 0) >>> 0;
    pm.mflags2 = (pm.mflags2 | (M2_NASTY | M2_STALK | M2_HOSTILE)) >>> 0;
    pm.mflags3 = (pm.mflags3 & ~M3_CLOSE) & 0xffff;
    pm.mflags3 = (pm.mflags3 | (M3_WANTSARTI | M3_WAITFORU)) & 0xffff;
    G.quest_status.nemgend = (((pm.mflags2 & 262144) >>> 0 !== 0 ? 2 : (pm.mflags2 & 131072) >>> 0 !== 0 ? 1 : (pm.mflags2 & 65536) >>> 0 !== 0 ? 0 : rn2(100) < 50 ? 1 : 0) >>> 0) & 3;
  }
  if (G.flags.pantheon === -1) {
    G.flags.pantheon = G.flags.initrole;
    while (!G.roles[G.flags.pantheon].lgod) {
      G.flags.pantheon = randrole(FALSE);
    }
  }
  if (!G.urole.lgod) {
    G.urole.lgod = G.roles[G.flags.pantheon].lgod;
    G.urole.ngod = G.roles[G.flags.pantheon].ngod;
    G.urole.cgod = G.roles[G.flags.pantheon].cgod;
  }
  G.quest_status.godgend = ((!strncmpi(align_gtitle(alignmnt), S("goddess"), -1) ? 1 : 0) >>> 0) & 3;
  return;
}

export function Hello(mtmp: struct_monst | null): Ptr | null {
  switch (G.urole.malenum) {
  case 333:
    return S("Salutations");
  case 339:
    return mtmp && mtmp.data === $sat(G.mons, PM_SHOPKEEPER) ? S("Irasshaimase") : S("Konnichi wa");
  case 340:
    return S("Aloha");
  case 341:
    return mtmp && mtmp.data === $sat(G.mons, PM_MAIL_DAEMON) ? S("Hallo") : S("Velkommen");
  default:
    return S("Hello");
  }
}

export function Goodbye(): Ptr | null {
  switch (G.urole.malenum) {
  case 333:
    return S("Fare thee well");
  case 339:
    return S("Sayonara");
  case 340:
    return S("Aloha");
  case 341:
    return S("Farvel");
  default:
    return S("Goodbye");
  }
}

export function $init(): void {
  G.roles = $sarrOf([struct_Role.$of(struct_RoleName.$of(S("Archeologist")), $sarrOf([struct_RoleName.$of(S("Digger")),
struct_RoleName.$of(S("Field Worker")),
struct_RoleName.$of(S("Investigator")),
struct_RoleName.$of(S("Exhumer")),
struct_RoleName.$of(S("Excavator")),
struct_RoleName.$of(S("Spelunker")),
struct_RoleName.$of(S("Speleologist")),
struct_RoleName.$of(S("Collector")),
struct_RoleName.$of(S("Curator"))]), S("Quetzalcoatl"), S("Camaxtli"), S("Huhetotl"), S("Arc"), S("the College of Archeology"), S("the Tomb of the Toltec Kings"), PM_ARCHEOLOGIST, NON_PM, NON_PM, PM_LORD_CARNARVON, PM_STUDENT, PM_MINION_OF_HUHETOTL, NON_PM, PM_HUMAN_MUMMY, S_SNAKE, S_MUMMY, ART_ORB_OF_DETECTION, MH_HUMAN | MH_DWARF | MH_GNOME | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL | ROLE_NEUTRAL, $ta(Int8Array, 6, [7, 10, 10, 7, 7, 7]), $ta(Int8Array, 6, [20, 20, 20, 10, 20, 10]), struct_RoleAdvance.$of(11, 0, 0, 8, 1), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 14, 10, 5, 0, 2, 10, A_INT, SPE_MAGIC_MAPPING, -4),
struct_Role.$of(struct_RoleName.$of(S("Barbarian")), $sarrOf([struct_RoleName.$of(S("Plunderer"), S("Plunderess")),
struct_RoleName.$of(S("Pillager")),
struct_RoleName.$of(S("Bandit")),
struct_RoleName.$of(S("Brigand")),
struct_RoleName.$of(S("Raider")),
struct_RoleName.$of(S("Reaver")),
struct_RoleName.$of(S("Slayer")),
struct_RoleName.$of(S("Chieftain"), S("Chieftainess")),
struct_RoleName.$of(S("Conqueror"), S("Conqueress"))]), S("Mitra"), S("Crom"), S("Set"), S("Bar"), S("the Camp of the Duali Tribe"), S("the Duali Oasis"), PM_BARBARIAN, NON_PM, NON_PM, PM_PELIAS, PM_CHIEFTAIN, PM_THOTH_AMON, PM_OGRE, PM_TROLL, S_OGRE, S_TROLL, ART_HEART_OF_AHRIMAN, MH_HUMAN | MH_ORC | ROLE_MALE | ROLE_FEMALE | ROLE_NEUTRAL | ROLE_CHAOTIC, $ta(Int8Array, 6, [16, 7, 7, 15, 16, 6]), $ta(Int8Array, 6, [30, 6, 7, 20, 30, 7]), struct_RoleAdvance.$of(14, 0, 0, 10, 2), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 10, 10, 14, 0, 0, 8, A_INT, SPE_HASTE_SELF, -4),
struct_Role.$of(struct_RoleName.$of(S("Caveman"), S("Cavewoman")), $sarrOf([struct_RoleName.$of(S("Troglodyte")),
struct_RoleName.$of(S("Aborigine")),
struct_RoleName.$of(S("Wanderer")),
struct_RoleName.$of(S("Vagrant")),
struct_RoleName.$of(S("Wayfarer")),
struct_RoleName.$of(S("Roamer")),
struct_RoleName.$of(S("Nomad")),
struct_RoleName.$of(S("Rover")),
struct_RoleName.$of(S("Pioneer"))]), S("Anu"), S("_Ishtar"), S("Anshar"), S("Cav"), S("the Caves of the Ancestors"), S("the Dragon's Lair"), PM_CAVEMAN, PM_CAVEWOMAN, PM_LITTLE_DOG, PM_SHAMAN_KARNOV, PM_NEANDERTHAL, PM_CHROMATIC_DRAGON, PM_BUGBEAR, PM_HILL_GIANT, S_HUMANOID, S_GIANT, ART_SCEPTRE_OF_MIGHT, MH_HUMAN | MH_DWARF | MH_GNOME | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL | ROLE_NEUTRAL, $ta(Int8Array, 6, [10, 7, 7, 7, 8, 6]), $ta(Int8Array, 6, [30, 6, 7, 20, 30, 7]), struct_RoleAdvance.$of(14, 0, 0, 8, 2), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 10, 0, 12, 0, 1, 8, A_INT, SPE_DIG, -4),
struct_Role.$of(struct_RoleName.$of(S("Healer")), $sarrOf([struct_RoleName.$of(S("Rhizotomist")),
struct_RoleName.$of(S("Empiric")),
struct_RoleName.$of(S("Embalmer")),
struct_RoleName.$of(S("Dresser")),
struct_RoleName.$of(S("Medicus ossium"), S("Medica ossium")),
struct_RoleName.$of(S("Herbalist")),
struct_RoleName.$of(S("Magister"), S("Magistra")),
struct_RoleName.$of(S("Physician")),
struct_RoleName.$of(S("Chirurgeon"))]), S("_Athena"), S("Hermes"), S("Poseidon"), S("Hea"), S("the Temple of Epidaurus"), S("the Temple of Coeus"), PM_HEALER, NON_PM, NON_PM, PM_HIPPOCRATES, PM_ATTENDANT, PM_CYCLOPS, PM_GIANT_RAT, PM_SNAKE, S_RODENT, S_YETI, ART_STAFF_OF_AESCULAPIUS, MH_HUMAN | MH_GNOME | ROLE_MALE | ROLE_FEMALE | ROLE_NEUTRAL, $ta(Int8Array, 6, [7, 7, 13, 7, 11, 16]), $ta(Int8Array, 6, [15, 20, 20, 15, 25, 5]), struct_RoleAdvance.$of(11, 0, 0, 8, 1), struct_RoleAdvance.$of(1, 4, 0, 1, 0, 2), 20, 10, 3, -3, 2, 10, A_WIS, SPE_CURE_SICKNESS, -4),
struct_Role.$of(struct_RoleName.$of(S("Knight")), $sarrOf([struct_RoleName.$of(S("Gallant")),
struct_RoleName.$of(S("Esquire")),
struct_RoleName.$of(S("Bachelor")),
struct_RoleName.$of(S("Sergeant")),
struct_RoleName.$of(S("Knight")),
struct_RoleName.$of(S("Banneret")),
struct_RoleName.$of(S("Chevalier"), S("Chevaliere")),
struct_RoleName.$of(S("Seignieur"), S("Dame")),
struct_RoleName.$of(S("Paladin"))]), S("Lugh"), S("_Brigit"), S("Manannan Mac Lir"), S("Kni"), S("Camelot Castle"), S("the Isle of Glass"), PM_KNIGHT, NON_PM, PM_PONY, PM_KING_ARTHUR, PM_PAGE, PM_IXOTH, PM_QUASIT, PM_OCHRE_JELLY, S_IMP, S_JELLY, ART_MAGIC_MIRROR_OF_MERLIN, MH_HUMAN | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL, $ta(Int8Array, 6, [13, 7, 14, 8, 10, 17]), $ta(Int8Array, 6, [30, 15, 15, 10, 20, 10]), struct_RoleAdvance.$of(14, 0, 0, 8, 2), struct_RoleAdvance.$of(1, 4, 0, 1, 0, 2), 10, 10, 8, -2, 0, 9, A_WIS, SPE_TURN_UNDEAD, -4),
struct_Role.$of(struct_RoleName.$of(S("Monk")), $sarrOf([struct_RoleName.$of(S("Candidate")),
struct_RoleName.$of(S("Novice")),
struct_RoleName.$of(S("Initiate")),
struct_RoleName.$of(S("Student of Stones")),
struct_RoleName.$of(S("Student of Waters")),
struct_RoleName.$of(S("Student of Metals")),
struct_RoleName.$of(S("Student of Winds")),
struct_RoleName.$of(S("Student of Fire")),
struct_RoleName.$of(S("Master"))]), S("Shan Lai Ching"), S("Chih Sung-tzu"), S("Huan Ti"), S("Mon"), S("the Monastery of Chan-Sune"), S("the Monastery of the Earth-Lord"), PM_MONK, NON_PM, NON_PM, PM_GRAND_MASTER, PM_ABBOT, PM_MASTER_KAEN, PM_EARTH_ELEMENTAL, PM_XORN, S_ELEMENTAL, S_XORN, ART_EYES_OF_THE_OVERWORLD, MH_HUMAN | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL | ROLE_NEUTRAL | ROLE_CHAOTIC, $ta(Int8Array, 6, [10, 7, 8, 8, 7, 7]), $ta(Int8Array, 6, [25, 10, 20, 20, 15, 10]), struct_RoleAdvance.$of(12, 0, 0, 8, 1), struct_RoleAdvance.$of(2, 2, 0, 2, 0, 2), 10, 10, 8, -2, 2, 20, A_WIS, SPE_RESTORE_ABILITY, -4),
struct_Role.$of(struct_RoleName.$of(S("Priest"), S("Priestess")), $sarrOf([struct_RoleName.$of(S("Aspirant")),
struct_RoleName.$of(S("Acolyte")),
struct_RoleName.$of(S("Adept")),
struct_RoleName.$of(S("Priest"), S("Priestess")),
struct_RoleName.$of(S("Curate")),
struct_RoleName.$of(S("Canon"), S("Canoness")),
struct_RoleName.$of(S("Lama")),
struct_RoleName.$of(S("Patriarch"), S("Matriarch")),
struct_RoleName.$of(S("High Priest"), S("High Priestess"))]), null, null, null, S("Pri"), S("the Great Temple"), S("the Temple of Nalzok"), PM_PRIEST, PM_PRIESTESS, NON_PM, PM_ARCH_PRIEST, PM_ACOLYTE, PM_NALZOK, PM_HUMAN_ZOMBIE, PM_WRAITH, S_ZOMBIE, S_WRAITH, ART_MITRE_OF_HOLINESS, MH_HUMAN | MH_ELF | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL | ROLE_NEUTRAL | ROLE_CHAOTIC, $ta(Int8Array, 6, [7, 7, 10, 7, 7, 7]), $ta(Int8Array, 6, [15, 10, 30, 15, 20, 10]), struct_RoleAdvance.$of(12, 0, 0, 8, 1), struct_RoleAdvance.$of(4, 3, 0, 2, 0, 2), 10, 0, 3, -2, 2, 10, A_WIS, SPE_REMOVE_CURSE, -4),
struct_Role.$of(struct_RoleName.$of(S("Rogue")), $sarrOf([struct_RoleName.$of(S("Footpad")),
struct_RoleName.$of(S("Cutpurse")),
struct_RoleName.$of(S("Rogue")),
struct_RoleName.$of(S("Pilferer")),
struct_RoleName.$of(S("Robber")),
struct_RoleName.$of(S("Burglar")),
struct_RoleName.$of(S("Filcher")),
struct_RoleName.$of(S("Magsman"), S("Magswoman")),
struct_RoleName.$of(S("Thief"))]), S("Issek"), S("Mog"), S("Kos"), S("Rog"), S("the Thieves' Guild Hall"), S("the Assassins' Guild Hall"), PM_ROGUE, NON_PM, NON_PM, PM_MASTER_OF_THIEVES, PM_THUG, PM_MASTER_ASSASSIN, PM_LEPRECHAUN, PM_GUARDIAN_NAGA, S_NYMPH, S_NAGA, ART_MASTER_KEY_OF_THIEVERY, MH_HUMAN | MH_ORC | ROLE_MALE | ROLE_FEMALE | ROLE_CHAOTIC, $ta(Int8Array, 6, [7, 7, 7, 10, 7, 6]), $ta(Int8Array, 6, [20, 10, 10, 30, 20, 10]), struct_RoleAdvance.$of(10, 0, 0, 8, 1), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 11, 10, 8, 0, 1, 9, A_INT, SPE_DETECT_TREASURE, -4),
struct_Role.$of(struct_RoleName.$of(S("Ranger")), $sarrOf([struct_RoleName.$of(S("Tenderfoot")),
struct_RoleName.$of(S("Lookout")),
struct_RoleName.$of(S("Trailblazer")),
struct_RoleName.$of(S("Reconnoiterer"), S("Reconnoiteress")),
struct_RoleName.$of(S("Scout")),
struct_RoleName.$of(S("Arbalester")),
struct_RoleName.$of(S("Archer")),
struct_RoleName.$of(S("Sharpshooter")),
struct_RoleName.$of(S("Marksman"), S("Markswoman"))]), S("Mercury"), S("_Venus"), S("Mars"), S("Ran"), S("Orion's camp"), S("the cave of the wumpus"), PM_RANGER, NON_PM, PM_LITTLE_DOG, PM_ORION, PM_HUNTER, PM_SCORPIUS, PM_FOREST_CENTAUR, PM_SCORPION, S_CENTAUR, S_SPIDER, ART_LONGBOW_OF_DIANA, MH_HUMAN | MH_ELF | MH_GNOME | MH_ORC | ROLE_MALE | ROLE_FEMALE | ROLE_NEUTRAL | ROLE_CHAOTIC, $ta(Int8Array, 6, [13, 13, 13, 9, 13, 7]), $ta(Int8Array, 6, [30, 10, 10, 20, 20, 10]), struct_RoleAdvance.$of(13, 0, 0, 6, 1), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 12, 10, 9, 2, 1, 10, A_INT, SPE_INVISIBILITY, -4),
struct_Role.$of(struct_RoleName.$of(S("Samurai")), $sarrOf([struct_RoleName.$of(S("Hatamoto")),
struct_RoleName.$of(S("Ronin")),
struct_RoleName.$of(S("Ninja"), S("Kunoichi")),
struct_RoleName.$of(S("Joshu")),
struct_RoleName.$of(S("Ryoshu")),
struct_RoleName.$of(S("Kokushu")),
struct_RoleName.$of(S("Daimyo")),
struct_RoleName.$of(S("Kuge")),
struct_RoleName.$of(S("Shogun"))]), S("_Amaterasu Omikami"), S("Raijin"), S("Susanowo"), S("Sam"), S("the Castle of the Taro Clan"), S("the Shogun's Castle"), PM_SAMURAI, NON_PM, PM_LITTLE_DOG, PM_LORD_SATO, PM_ROSHI, PM_ASHIKAGA_TAKAUJI, PM_WOLF, PM_STALKER, S_DOG, S_ELEMENTAL, ART_TSURUGI_OF_MURAMASA, MH_HUMAN | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL, $ta(Int8Array, 6, [10, 8, 7, 10, 17, 6]), $ta(Int8Array, 6, [30, 10, 8, 30, 14, 8]), struct_RoleAdvance.$of(13, 0, 0, 8, 1), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 11, 10, 10, 0, 0, 8, A_INT, SPE_CLAIRVOYANCE, -4),
struct_Role.$of(struct_RoleName.$of(S("Tourist")), $sarrOf([struct_RoleName.$of(S("Rambler")),
struct_RoleName.$of(S("Sightseer")),
struct_RoleName.$of(S("Excursionist")),
struct_RoleName.$of(S("Peregrinator"), S("Peregrinatrix")),
struct_RoleName.$of(S("Traveler")),
struct_RoleName.$of(S("Journeyer")),
struct_RoleName.$of(S("Voyager")),
struct_RoleName.$of(S("Explorer")),
struct_RoleName.$of(S("Adventurer"))]), S("Blind Io"), S("_The Lady"), S("Offler"), S("Tou"), S("Ankh-Morpork"), S("the Thieves' Guild Hall"), PM_TOURIST, NON_PM, NON_PM, PM_TWOFLOWER, PM_GUIDE, PM_MASTER_OF_THIEVES, PM_GIANT_SPIDER, PM_FOREST_CENTAUR, S_SPIDER, S_CENTAUR, ART_YENDORIAN_EXPRESS_CARD, MH_HUMAN | ROLE_MALE | ROLE_FEMALE | ROLE_NEUTRAL, $ta(Int8Array, 6, [7, 10, 6, 7, 7, 10]), $ta(Int8Array, 6, [15, 10, 10, 15, 30, 20]), struct_RoleAdvance.$of(8, 0, 0, 8), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 14, 0, 5, 1, 2, 10, A_INT, SPE_CHARM_MONSTER, -4),
struct_Role.$of(struct_RoleName.$of(S("Valkyrie")), $sarrOf([struct_RoleName.$of(S("Stripling")),
struct_RoleName.$of(S("Skirmisher")),
struct_RoleName.$of(S("Fighter")),
struct_RoleName.$of(S("Man-at-arms"), S("Woman-at-arms")),
struct_RoleName.$of(S("Warrior")),
struct_RoleName.$of(S("Swashbuckler")),
struct_RoleName.$of(S("Hero"), S("Heroine")),
struct_RoleName.$of(S("Champion")),
struct_RoleName.$of(S("Lord"), S("Lady"))]), S("Tyr"), S("Odin"), S("Loki"), S("Val"), S("the Shrine of Destiny"), S("the cave of Surtur"), PM_VALKYRIE, NON_PM, NON_PM, PM_NORN, PM_WARRIOR, PM_LORD_SURTUR, PM_FIRE_ANT, PM_FIRE_GIANT, S_ANT, S_GIANT, ART_ORB_OF_FATE, MH_HUMAN | MH_DWARF | ROLE_FEMALE | ROLE_LAWFUL | ROLE_NEUTRAL, $ta(Int8Array, 6, [10, 7, 7, 7, 10, 7]), $ta(Int8Array, 6, [30, 6, 7, 20, 30, 7]), struct_RoleAdvance.$of(14, 0, 0, 8, 2), struct_RoleAdvance.$of(1, 0, 0, 1, 0, 1), 10, 0, 10, -2, 0, 9, A_WIS, SPE_CONE_OF_COLD, -4),
struct_Role.$of(struct_RoleName.$of(S("Wizard")), $sarrOf([struct_RoleName.$of(S("Evoker")),
struct_RoleName.$of(S("Conjurer")),
struct_RoleName.$of(S("Thaumaturge")),
struct_RoleName.$of(S("Magician")),
struct_RoleName.$of(S("Enchanter"), S("Enchantress")),
struct_RoleName.$of(S("Sorcerer"), S("Sorceress")),
struct_RoleName.$of(S("Necromancer")),
struct_RoleName.$of(S("Wizard")),
struct_RoleName.$of(S("Mage"))]), S("Ptah"), S("Thoth"), S("Anhur"), S("Wiz"), S("the Lonely Tower"), S("the Tower of Darkness"), PM_WIZARD, NON_PM, PM_KITTEN, PM_NEFERET_THE_GREEN, PM_APPRENTICE, PM_DARK_ONE, PM_VAMPIRE_BAT, PM_XORN, S_BAT, S_WRAITH, ART_EYE_OF_THE_AETHIOPICA, MH_HUMAN | MH_ELF | MH_GNOME | MH_ORC | ROLE_MALE | ROLE_FEMALE | ROLE_NEUTRAL | ROLE_CHAOTIC, $ta(Int8Array, 6, [7, 10, 7, 7, 7, 7]), $ta(Int8Array, 6, [10, 30, 10, 20, 20, 10]), struct_RoleAdvance.$of(10, 0, 0, 8, 1), struct_RoleAdvance.$of(4, 3, 0, 2, 0, 3), 12, 0, 1, 0, 3, 10, A_INT, SPE_MAGIC_MISSILE, -4),
struct_Role.$of(struct_RoleName.$of(), $sarr(struct_RoleName, 9), null, null, null, null, null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new Int8Array(6), new Int8Array(6), new struct_RoleAdvance(), new struct_RoleAdvance())]);
  G.urole = struct_Role.$of(struct_RoleName.$of(S("Undefined")), $sarrOf([struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of(),
struct_RoleName.$of()]), S("L"), S("N"), S("C"), S("Xxx"), S("home"), S("locate"), NON_PM, NON_PM, NON_PM, NON_PM, NON_PM, NON_PM, NON_PM, NON_PM, 0, 0, 0, 0, $ta(Int8Array, 6, [7, 7, 7, 7, 7, 7]), $ta(Int8Array, 6, [20, 15, 15, 20, 20, 10]), struct_RoleAdvance.$of(10, 0, 0, 8, 1), struct_RoleAdvance.$of(2, 0, 0, 2, 0, 3), 14, 0, 10, 0, 0, 4, A_INT, 0, -3);
  G.races = $sarrOf([struct_Race.$of(S("human"), S("human"), S("humanity"), S("Hum"), struct_RoleName.$of(S("man"), S("woman")), PM_HUMAN, NON_PM, PM_HUMAN_MUMMY, PM_HUMAN_ZOMBIE, MH_HUMAN | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL | ROLE_NEUTRAL | ROLE_CHAOTIC, MH_HUMAN, 0, MH_GNOME | MH_ORC, $ta(Int8Array, 6, [3, 3, 3, 3, 3, 3]), $ta(Int8Array, 6, [18 + 100, 18, 18, 18, 18, 18]), struct_RoleAdvance.$of(2, 0, 0, 2, 1), struct_RoleAdvance.$of(1, 0, 2, 0, 2)),
struct_Race.$of(S("elf"), S("elven"), S("elvenkind"), S("Elf"), struct_RoleName.$of(), PM_ELF, NON_PM, PM_ELF_MUMMY, PM_ELF_ZOMBIE, MH_ELF | ROLE_MALE | ROLE_FEMALE | ROLE_CHAOTIC, MH_ELF, MH_ELF, MH_ORC, $ta(Int8Array, 6, [3, 3, 3, 3, 3, 3]), $ta(Int8Array, 6, [18, 20, 20, 18, 16, 18]), struct_RoleAdvance.$of(1, 0, 0, 1, 1), struct_RoleAdvance.$of(2, 0, 3, 0, 3)),
struct_Race.$of(S("dwarf"), S("dwarven"), S("dwarvenkind"), S("Dwa"), struct_RoleName.$of(), PM_DWARF, NON_PM, PM_DWARF_MUMMY, PM_DWARF_ZOMBIE, MH_DWARF | ROLE_MALE | ROLE_FEMALE | ROLE_LAWFUL, MH_DWARF, MH_DWARF | MH_GNOME, MH_ORC, $ta(Int8Array, 6, [3, 3, 3, 3, 3, 3]), $ta(Int8Array, 6, [18 + 100, 16, 16, 20, 20, 16]), struct_RoleAdvance.$of(4, 0, 0, 3, 2), struct_RoleAdvance.$of()),
struct_Race.$of(S("gnome"), S("gnomish"), S("gnomehood"), S("Gno"), struct_RoleName.$of(), PM_GNOME, NON_PM, PM_GNOME_MUMMY, PM_GNOME_ZOMBIE, MH_GNOME | ROLE_MALE | ROLE_FEMALE | ROLE_NEUTRAL, MH_GNOME, MH_DWARF | MH_GNOME, MH_HUMAN, $ta(Int8Array, 6, [3, 3, 3, 3, 3, 3]), $ta(Int8Array, 6, [18 + 50, 19, 18, 18, 18, 18]), struct_RoleAdvance.$of(1, 0, 0, 1), struct_RoleAdvance.$of(2, 0, 2, 0, 2)),
struct_Race.$of(S("orc"), S("orcish"), S("orcdom"), S("Orc"), struct_RoleName.$of(), PM_ORC, NON_PM, PM_ORC_MUMMY, PM_ORC_ZOMBIE, MH_ORC | ROLE_MALE | ROLE_FEMALE | ROLE_CHAOTIC, MH_ORC, 0, MH_HUMAN | MH_ELF | MH_DWARF, $ta(Int8Array, 6, [3, 3, 3, 3, 3, 3]), $ta(Int8Array, 6, [18 + 50, 16, 16, 18, 18, 16]), struct_RoleAdvance.$of(1, 0, 0, 1), struct_RoleAdvance.$of(1, 0, 1, 0, 1)),
struct_Race.$of(null, null, null, null, new struct_RoleName(), 0, 0, 0, 0, 0, 0, 0, 0, new Int8Array(6), new Int8Array(6), new struct_RoleAdvance(), new struct_RoleAdvance())]);
  G.urace = struct_Race.$of(S("something"), S("undefined"), S("something"), S("Xxx"), struct_RoleName.$of(), NON_PM, NON_PM, NON_PM, NON_PM, 0, 0, 0, 0, $ta(Int8Array, 6, [3, 3, 3, 3, 3, 3]), $ta(Int8Array, 6, [18 + 100, 18, 18, 18, 18, 18]), struct_RoleAdvance.$of(2, 0, 0, 2, 1), struct_RoleAdvance.$of(1, 0, 2, 0, 2));
  G.genders = $sarrOf([struct_Gender.$of(S("male"), S("he"), S("him"), S("his"), S("Mal"), ROLE_MALE), struct_Gender.$of(S("female"), S("she"), S("her"), S("her"), S("Fem"), ROLE_FEMALE), struct_Gender.$of(S("neuter"), S("it"), S("it"), S("its"), S("Ntr"), ROLE_NEUTER)]);
  G.aligns = $sarrOf([struct_Align.$of(S("law"), S("lawful"), S("Law"), ROLE_LAWFUL, A_LAWFUL),
struct_Align.$of(S("balance"), S("neutral"), S("Neu"), ROLE_NEUTRAL, A_NEUTRAL),
struct_Align.$of(S("chaos"), S("chaotic"), S("Cha"), ROLE_CHAOTIC, A_CHAOTIC),
struct_Align.$of(S("evil"), S("unaligned"), S("Una"), 0, A_NONE)]);
  rfilter = new anon_role_c_769();
  randomstr = $cs("random", 7);
  pa = new Int8Array(4);
  post_attribs = 0;
  root_plselection_prompt$err_ret = $cs(" character's", 13);
  role_selection_prolog$choosing = $cs(" choosing now", 14);
  role_selection_prolog$not_yet = $cs(" not yet specified", 19);
  role_selection_prolog$rand_choice = $cs(" random", 8);
  role_menu_extra$RS_menu_let = $ta(Int8Array, 5, [61, 63, 47, 34, 91]);
}
