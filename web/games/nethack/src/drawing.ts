// @ts-nocheck
// NetHack 3.6.7 drawing.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { struct_class_sym, struct_symdef, struct_symparse, struct_symsetentry } from './structs.ts';
import { $cs, $sarr, $sarrOf, $ta, G, S, free } from './rt/index.ts';
import { AMULET_CLASS, AMULET_SYM, ARMOR_CLASS, ARMOR_SYM, BALL_CLASS, BALL_SYM, CHAIN_CLASS, CHAIN_SYM, COIN_CLASS, DEF_ANGEL, DEF_ANT, DEF_BAT, DEF_BLOB, DEF_CENTAUR, DEF_COCKATRICE, DEF_DEMON, DEF_DOG, DEF_DRAGON, DEF_EEL, DEF_ELEMENTAL, DEF_EYE, DEF_FELINE, DEF_FUNGUS, DEF_GHOST, DEF_GIANT, DEF_GNOME, DEF_GOLEM, DEF_GREMLIN, DEF_HUMAN, DEF_HUMANOID, DEF_IMP, DEF_INVISIBLE, DEF_JABBERWOCK, DEF_JELLY, DEF_KOBOLD, DEF_KOP, DEF_LEPRECHAUN, DEF_LICH, DEF_LIGHT, DEF_LIZARD, DEF_MIMIC, DEF_MIMIC_DEF, DEF_MUMMY, DEF_NAGA, DEF_NYMPH, DEF_OGRE, DEF_ORC, DEF_PIERCER, DEF_PUDDING, DEF_QUADRUPED, DEF_QUANTMECH, DEF_RODENT, DEF_RUSTMONST, DEF_SNAKE, DEF_SPIDER, DEF_TRAPPER, DEF_TROLL, DEF_UMBER, DEF_UNICORN, DEF_VAMPIRE, DEF_VORTEX, DEF_WORM, DEF_WORM_TAIL, DEF_WRAITH, DEF_XAN, DEF_XORN, DEF_YETI, DEF_ZOMBIE, DEF_ZRUTY, FALSE, FOOD_CLASS, FOOD_SYM, GEM_CLASS, GEM_SYM, GOLD_SYM, H_UNK, ILLOBJ_CLASS, ILLOBJ_SYM, MAXMCLASSES, MAXOCLASSES, MAXOTHER, MAXPCHARS, POTION_CLASS, POTION_SYM, PRIMARY, RING_CLASS, RING_SYM, ROCK_CLASS, ROCK_SYM, ROGUESET, SCROLL_CLASS, SCROLL_SYM, SPBOOK_CLASS, SPBOOK_SYM, SYM_BOULDER, SYM_CONTROL, SYM_HERO_OVERRIDE, SYM_INVISIBLE, SYM_MAX, SYM_MON, SYM_OC, SYM_OFF_M, SYM_OFF_O, SYM_OFF_P, SYM_OFF_W, SYM_OFF_X, SYM_OTH, SYM_PCHAR, SYM_PET_OVERRIDE, S_ANGEL, S_ANT, S_BAT, S_BLOB, S_CENTAUR, S_COCKATRICE, S_DEMON, S_DOG, S_DRAGON, S_EEL, S_ELEMENTAL, S_EYE, S_FELINE, S_FUNGUS, S_GHOST, S_GIANT, S_GNOME, S_GOLEM, S_GREMLIN, S_HUMAN, S_HUMANOID, S_IMP, S_JABBERWOCK, S_JELLY, S_KOBOLD, S_KOP, S_LEPRECHAUN, S_LICH, S_LIGHT, S_LIZARD, S_MIMIC, S_MIMIC_DEF, S_MUMMY, S_NAGA, S_NYMPH, S_OGRE, S_ORC, S_PIERCER, S_PUDDING, S_QUADRUPED, S_QUANTMECH, S_RODENT, S_RUSTMONST, S_SNAKE, S_SPIDER, S_TRAPPER, S_TROLL, S_UMBER, S_UNICORN, S_VAMPIRE, S_VORTEX, S_WORM, S_WORM_TAIL, S_WRAITH, S_XAN, S_XORN, S_YETI, S_ZOMBIE, S_ZRUTY, S_air, S_altar, S_anti_magic_trap, S_arrow_trap, S_bars, S_bear_trap, S_blcorn, S_boomleft, S_boomright, S_brcorn, S_cloud, S_corr, S_crwall, S_darkroom, S_dart_trap, S_digbeam, S_dnladder, S_dnstair, S_explode1, S_explode2, S_explode3, S_explode4, S_explode5, S_explode6, S_explode7, S_explode8, S_explode9, S_falling_rock_trap, S_fire_trap, S_flashbeam, S_fountain, S_goodpos, S_grave, S_hbeam, S_hcdbridge, S_hcdoor, S_hodbridge, S_hodoor, S_hole, S_hwall, S_ice, S_land_mine, S_lava, S_level_teleporter, S_litcorr, S_lslant, S_magic_portal, S_magic_trap, S_ndoor, S_pit, S_poisoncloud, S_polymorph_trap, S_pool, S_rolling_boulder_trap, S_room, S_rslant, S_rust_trap, S_sink, S_sleeping_gas_trap, S_spiked_pit, S_squeaky_board, S_ss1, S_ss2, S_ss3, S_ss4, S_statue_trap, S_stone, S_sw_bc, S_sw_bl, S_sw_br, S_sw_ml, S_sw_mr, S_sw_tc, S_sw_tl, S_sw_tr, S_tdwall, S_teleportation_trap, S_throne, S_tlcorn, S_tlwall, S_trap_door, S_trcorn, S_tree, S_trwall, S_tuwall, S_upladder, S_upstair, S_vbeam, S_vcdbridge, S_vcdoor, S_vibrating_square, S_vodbridge, S_vodoor, S_vwall, S_water, S_web, TOOL_CLASS, TOOL_SYM, VENOM_CLASS, VENOM_SYM, WAND_CLASS, WAND_SYM, WARNCOUNT, WEAPON_CLASS, WEAPON_SYM } from './consts.ts';

let def_r_oc_syms: any;

export function def_char_to_objclass(ch: number): number {
  let i = 0;
  for (i = 1; i < MAXOCLASSES; ++i) {
    if (ch === G.def_oc_syms[i].sym) {
      break;
    }
  }
  return i;
}

export function def_char_to_monclass(ch: number): number {
  let i = 0;
  for (i = 1; i < MAXMCLASSES; ++i) {
    if (ch === G.def_monsyms[i].sym) {
      break;
    }
  }
  return i;
}

export function init_symbols(): void {
  init_ov_primary_symbols();
  init_ov_rogue_symbols();
  init_primary_symbols();
  init_showsyms();
  init_rogue_symbols();
}

export function init_showsyms(): void {
  let i = 0;
  for (i = 0; i < MAXPCHARS; ++i) {
    G.showsyms[i + SYM_OFF_P] = G.defsyms[i].sym;
  }
  for (i = 0; i < MAXOCLASSES; ++i) {
    G.showsyms[i + SYM_OFF_O] = G.def_oc_syms[i].sym & 0xff;
  }
  for (i = 0; i < MAXMCLASSES; ++i) {
    G.showsyms[i + SYM_OFF_M] = G.def_monsyms[i].sym & 0xff;
  }
  for (i = 0; i < WARNCOUNT; ++i) {
    G.showsyms[i + SYM_OFF_W] = G.def_warnsyms[i].sym;
  }
  for (i = 0; i < MAXOTHER; ++i) {
    G.showsyms[i + SYM_OFF_X] = get_othersym(i, PRIMARY);
  }
}

export function init_ov_rogue_symbols(): void {
  let i = 0;
  for (i = 0; i < SYM_MAX; ++i) {
    G.ov_rogue_syms[i] = 0;
  }
}

export function init_ov_primary_symbols(): void {
  let i = 0;
  for (i = 0; i < SYM_MAX; ++i) {
    G.ov_primary_syms[i] = 0;
  }
}

export function get_othersym(idx: number, which_set: number): number {
  let sym = 0;
  let oidx = idx + SYM_OFF_X;
  if (which_set === ROGUESET) {
    sym = (G.ov_rogue_syms[oidx] ? G.ov_rogue_syms[oidx] : G.rogue_syms[oidx]) & 0xff;
  } else {
    sym = (G.ov_primary_syms[oidx] ? G.ov_primary_syms[oidx] : G.primary_syms[oidx]) & 0xff;
  }
  if (!sym) {
    switch (idx) {
    case 0:
      sym = G.def_oc_syms[ROCK_CLASS].sym & 0xff;
      break;
    case 1:
      sym = DEF_INVISIBLE;
      break;
    }
  }
  return sym;
}

export function init_primary_symbols(): void {
  let i = 0;
  for (i = 0; i < MAXPCHARS; ++i) {
    G.primary_syms[i + SYM_OFF_P] = G.defsyms[i].sym;
  }
  for (i = 0; i < MAXOCLASSES; ++i) {
    G.primary_syms[i + SYM_OFF_O] = G.def_oc_syms[i].sym & 0xff;
  }
  for (i = 0; i < MAXMCLASSES; ++i) {
    G.primary_syms[i + SYM_OFF_M] = G.def_monsyms[i].sym & 0xff;
  }
  for (i = 0; i < WARNCOUNT; ++i) {
    G.primary_syms[i + SYM_OFF_W] = G.def_warnsyms[i].sym;
  }
  for (i = 0; i < MAXOTHER; ++i) {
    G.primary_syms[i + SYM_OFF_X] = get_othersym(i, PRIMARY);
  }
  clear_symsetentry(PRIMARY, FALSE);
}

export function init_rogue_symbols(): void {
  let i = 0;
  for (i = 0; i < MAXPCHARS; ++i) {
    G.rogue_syms[i + SYM_OFF_P] = G.defsyms[i].sym;
  }
  G.rogue_syms[S_vodoor] = G.rogue_syms[S_hodoor] = G.rogue_syms[S_ndoor] = 43;
  G.rogue_syms[S_upstair] = G.rogue_syms[S_dnstair] = 37;
  for (i = 0; i < MAXOCLASSES; ++i) {
    G.rogue_syms[i + SYM_OFF_O] = def_r_oc_syms[i];
  }
  for (i = 0; i < MAXMCLASSES; ++i) {
    G.rogue_syms[i + SYM_OFF_M] = G.def_monsyms[i].sym & 0xff;
  }
  for (i = 0; i < WARNCOUNT; ++i) {
    G.rogue_syms[i + SYM_OFF_W] = G.def_warnsyms[i].sym;
  }
  for (i = 0; i < MAXOTHER; ++i) {
    G.rogue_syms[i + SYM_OFF_X] = get_othersym(i, ROGUESET);
  }
  clear_symsetentry(ROGUESET, FALSE);
  G.symset[ROGUESET].nocolor = 1;
}

export function assign_graphics(whichset: number): void {
  let i = 0;
  switch (whichset) {
  case 1:
    for (i = 0; i < SYM_MAX; ++i) {
      G.showsyms[i] = (G.ov_rogue_syms[i] ? G.ov_rogue_syms[i] : G.rogue_syms[i]) & 0xff;
    }
    G.currentgraphics = ROGUESET;
    break;
  case 0:
  default:
    for (i = 0; i < SYM_MAX; ++i) {
      G.showsyms[i] = (G.ov_primary_syms[i] ? G.ov_primary_syms[i] : G.primary_syms[i]) & 0xff;
    }
    G.currentgraphics = PRIMARY;
    break;
  }
}

export async function switch_symbols(nondefault: number): Promise<void> {
  let i = 0;
  if (nondefault) {
    for (i = 0; i < SYM_MAX; ++i) {
      G.showsyms[i] = (G.ov_primary_syms[i] ? G.ov_primary_syms[i] : G.primary_syms[i]) & 0xff;
    }
    if (G.symset[G.currentgraphics].handling === 2 && G.decgraphics_mode_callback) {
      await G.decgraphics_mode_callback();
    }
  } else {
    init_primary_symbols();
    init_showsyms();
  }
}

export function update_ov_primary_symset(symp: struct_symparse | null, val: number): void {
  G.ov_primary_syms[symp.idx] = val & 0xff;
}

export function update_ov_rogue_symset(symp: struct_symparse | null, val: number): void {
  G.ov_rogue_syms[symp.idx] = val & 0xff;
}

export function update_primary_symset(symp: struct_symparse | null, val: number): void {
  G.primary_syms[symp.idx] = val & 0xff;
}

export function update_rogue_symset(symp: struct_symparse | null, val: number): void {
  G.rogue_syms[symp.idx] = val & 0xff;
}

export function clear_symsetentry(which_set: number, name_too: number): void {
  if (G.symset[which_set].desc) {
    free(G.symset[which_set].desc);
  }
  G.symset[which_set].desc = null;
  G.symset[which_set].handling = H_UNK;
  G.symset[which_set].nocolor = 0;
  G.symset[which_set].primary = 0;
  G.symset[which_set].rogue = 0;
  if (name_too) {
    if (G.symset[which_set].name) {
      free(G.symset[which_set].name);
    }
    G.symset[which_set].name = null;
  }
}

export function $init(): void {
  G.symset = $sarr(struct_symsetentry, 2);
  G.currentgraphics = 0;
  G.showsyms = new Uint8Array(185);
  G.primary_syms = new Uint8Array(185);
  G.rogue_syms = new Uint8Array(185);
  G.ov_primary_syms = new Uint8Array(185);
  G.ov_rogue_syms = new Uint8Array(185);
  G.warnsyms = new Uint8Array(6);
  G.invisexplain = $cs("remembered, unseen, creature", 29);
  G.altinvisexplain = $cs("unseen creature", 16);
  G.def_oc_syms = $sarrOf([struct_class_sym.$of(0, S(""), S("")),
struct_class_sym.$of(ILLOBJ_SYM, S("illegal objects"), S("strange object")),
struct_class_sym.$of(WEAPON_SYM, S("weapons"), S("weapon")),
struct_class_sym.$of(ARMOR_SYM, S("armor"), S("suit or piece of armor")),
struct_class_sym.$of(RING_SYM, S("rings"), S("ring")),
struct_class_sym.$of(AMULET_SYM, S("amulets"), S("amulet")),
struct_class_sym.$of(TOOL_SYM, S("tools"), S("useful item (pick-axe, key, lamp...)")),
struct_class_sym.$of(FOOD_SYM, S("food"), S("piece of food")),
struct_class_sym.$of(POTION_SYM, S("potions"), S("potion")),
struct_class_sym.$of(SCROLL_SYM, S("scrolls"), S("scroll")),
struct_class_sym.$of(SPBOOK_SYM, S("spellbooks"), S("spellbook")),
struct_class_sym.$of(WAND_SYM, S("wands"), S("wand")),
struct_class_sym.$of(GOLD_SYM, S("coins"), S("pile of coins")),
struct_class_sym.$of(GEM_SYM, S("rocks"), S("gem or rock")),
struct_class_sym.$of(ROCK_SYM, S("large stones"), S("boulder or statue")),
struct_class_sym.$of(BALL_SYM, S("iron balls"), S("iron ball")),
struct_class_sym.$of(CHAIN_SYM, S("chains"), S("iron chain")),
struct_class_sym.$of(VENOM_SYM, S("venoms"), S("splash of venom"))]);
  G.def_monsyms = $sarrOf([struct_class_sym.$of(0, S(""), S("")),
struct_class_sym.$of(DEF_ANT, S(""), S("ant or other insect")),
struct_class_sym.$of(DEF_BLOB, S(""), S("blob")),
struct_class_sym.$of(DEF_COCKATRICE, S(""), S("cockatrice")),
struct_class_sym.$of(DEF_DOG, S(""), S("dog or other canine")),
struct_class_sym.$of(DEF_EYE, S(""), S("eye or sphere")),
struct_class_sym.$of(DEF_FELINE, S(""), S("cat or other feline")),
struct_class_sym.$of(DEF_GREMLIN, S(""), S("gremlin")),
struct_class_sym.$of(DEF_HUMANOID, S(""), S("humanoid")),
struct_class_sym.$of(DEF_IMP, S(""), S("imp or minor demon")),
struct_class_sym.$of(DEF_JELLY, S(""), S("jelly")),
struct_class_sym.$of(DEF_KOBOLD, S(""), S("kobold")),
struct_class_sym.$of(DEF_LEPRECHAUN, S(""), S("leprechaun")),
struct_class_sym.$of(DEF_MIMIC, S(""), S("mimic")),
struct_class_sym.$of(DEF_NYMPH, S(""), S("nymph")),
struct_class_sym.$of(DEF_ORC, S(""), S("orc")),
struct_class_sym.$of(DEF_PIERCER, S(""), S("piercer")),
struct_class_sym.$of(DEF_QUADRUPED, S(""), S("quadruped")),
struct_class_sym.$of(DEF_RODENT, S(""), S("rodent")),
struct_class_sym.$of(DEF_SPIDER, S(""), S("arachnid or centipede")),
struct_class_sym.$of(DEF_TRAPPER, S(""), S("trapper or lurker above")),
struct_class_sym.$of(DEF_UNICORN, S(""), S("unicorn or horse")),
struct_class_sym.$of(DEF_VORTEX, S(""), S("vortex")),
struct_class_sym.$of(DEF_WORM, S(""), S("worm")),
struct_class_sym.$of(DEF_XAN, S(""), S("xan or other mythical/fantastic insect")),
struct_class_sym.$of(DEF_LIGHT, S(""), S("light")),
struct_class_sym.$of(DEF_ZRUTY, S(""), S("zruty")),
struct_class_sym.$of(DEF_ANGEL, S(""), S("angelic being")),
struct_class_sym.$of(DEF_BAT, S(""), S("bat or bird")),
struct_class_sym.$of(DEF_CENTAUR, S(""), S("centaur")),
struct_class_sym.$of(DEF_DRAGON, S(""), S("dragon")),
struct_class_sym.$of(DEF_ELEMENTAL, S(""), S("elemental")),
struct_class_sym.$of(DEF_FUNGUS, S(""), S("fungus or mold")),
struct_class_sym.$of(DEF_GNOME, S(""), S("gnome")),
struct_class_sym.$of(DEF_GIANT, S(""), S("giant humanoid")),
struct_class_sym.$of(0, S(""), S("invisible monster")),
struct_class_sym.$of(DEF_JABBERWOCK, S(""), S("jabberwock")),
struct_class_sym.$of(DEF_KOP, S(""), S("Keystone Kop")),
struct_class_sym.$of(DEF_LICH, S(""), S("lich")),
struct_class_sym.$of(DEF_MUMMY, S(""), S("mummy")),
struct_class_sym.$of(DEF_NAGA, S(""), S("naga")),
struct_class_sym.$of(DEF_OGRE, S(""), S("ogre")),
struct_class_sym.$of(DEF_PUDDING, S(""), S("pudding or ooze")),
struct_class_sym.$of(DEF_QUANTMECH, S(""), S("quantum mechanic")),
struct_class_sym.$of(DEF_RUSTMONST, S(""), S("rust monster or disenchanter")),
struct_class_sym.$of(DEF_SNAKE, S(""), S("snake")),
struct_class_sym.$of(DEF_TROLL, S(""), S("troll")),
struct_class_sym.$of(DEF_UMBER, S(""), S("umber hulk")),
struct_class_sym.$of(DEF_VAMPIRE, S(""), S("vampire")),
struct_class_sym.$of(DEF_WRAITH, S(""), S("wraith")),
struct_class_sym.$of(DEF_XORN, S(""), S("xorn")),
struct_class_sym.$of(DEF_YETI, S(""), S("apelike creature")),
struct_class_sym.$of(DEF_ZOMBIE, S(""), S("zombie")),
struct_class_sym.$of(DEF_HUMAN, S(""), S("human or elf")),
struct_class_sym.$of(DEF_GHOST, S(""), S("ghost")),
struct_class_sym.$of(DEF_GOLEM, S(""), S("golem")),
struct_class_sym.$of(DEF_DEMON, S(""), S("major demon")),
struct_class_sym.$of(DEF_EEL, S(""), S("sea monster")),
struct_class_sym.$of(DEF_LIZARD, S(""), S("lizard")),
struct_class_sym.$of(DEF_WORM_TAIL, S(""), S("long worm tail")),
struct_class_sym.$of(DEF_MIMIC_DEF, S(""), S("mimic"))]);
  G.def_warnsyms = $sarrOf([struct_symdef.$of(48, S("unknown creature causing you worry"), 15),
struct_symdef.$of(49, S("unknown creature causing you concern"), 1),
struct_symdef.$of(50, S("unknown creature causing you anxiety"), 1),
struct_symdef.$of(51, S("unknown creature causing you disquiet"), 1),
struct_symdef.$of(52, S("unknown creature causing you alarm"), 5),
struct_symdef.$of(53, S("unknown creature causing you dread"), 13)]);
  G.defsyms = $sarrOf([struct_symdef.$of(32, S("dark part of a room"), 8),
struct_symdef.$of(124, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(45, S("wall"), 7),
struct_symdef.$of(124, S("wall"), 7),
struct_symdef.$of(124, S("wall"), 7),
struct_symdef.$of(46, S("doorway"), 7),
struct_symdef.$of(45, S("open door"), 3),
struct_symdef.$of(124, S("open door"), 3),
struct_symdef.$of(43, S("closed door"), 3),
struct_symdef.$of(43, S("closed door"), 3),
struct_symdef.$of(35, S("iron bars"), 6),
struct_symdef.$of(35, S("tree"), 2),
struct_symdef.$of(46, S("floor of a room"), 7),
struct_symdef.$of(46, S("dark part of a room")),
struct_symdef.$of(35, S("corridor"), 7),
struct_symdef.$of(35, S("lit corridor"), 7),
struct_symdef.$of(60, S("staircase up"), 7),
struct_symdef.$of(62, S("staircase down"), 7),
struct_symdef.$of(60, S("ladder up"), 3),
struct_symdef.$of(62, S("ladder down"), 3),
struct_symdef.$of(95, S("altar"), 7),
struct_symdef.$of(124, S("grave"), 15),
struct_symdef.$of(92, S("opulent throne"), 11),
struct_symdef.$of(35, S("sink"), 7),
struct_symdef.$of(123, S("fountain"), 12),
struct_symdef.$of(125, S("water"), 4),
struct_symdef.$of(46, S("ice"), 6),
struct_symdef.$of(125, S("molten lava"), 1),
struct_symdef.$of(46, S("lowered drawbridge"), 3),
struct_symdef.$of(46, S("lowered drawbridge"), 3),
struct_symdef.$of(35, S("raised drawbridge"), 3),
struct_symdef.$of(35, S("raised drawbridge"), 3),
struct_symdef.$of(32, S("air"), 6),
struct_symdef.$of(35, S("cloud"), 7),
struct_symdef.$of(125, S("water"), 4),
struct_symdef.$of(94, S("arrow trap"), 6),
struct_symdef.$of(94, S("dart trap"), 6),
struct_symdef.$of(94, S("falling rock trap"), 7),
struct_symdef.$of(94, S("squeaky board"), 3),
struct_symdef.$of(94, S("bear trap"), 6),
struct_symdef.$of(94, S("land mine"), 1),
struct_symdef.$of(94, S("rolling boulder trap"), 7),
struct_symdef.$of(94, S("sleeping gas trap"), 12),
struct_symdef.$of(94, S("rust trap"), 4),
struct_symdef.$of(94, S("fire trap"), 9),
struct_symdef.$of(94, S("pit")),
struct_symdef.$of(94, S("spiked pit")),
struct_symdef.$of(94, S("hole"), 3),
struct_symdef.$of(94, S("trap door"), 3),
struct_symdef.$of(94, S("teleportation trap"), 5),
struct_symdef.$of(94, S("level teleporter"), 5),
struct_symdef.$of(94, S("magic portal"), 13),
struct_symdef.$of(34, S("web"), 7),
struct_symdef.$of(94, S("statue trap"), 7),
struct_symdef.$of(94, S("magic trap"), 12),
struct_symdef.$of(94, S("anti-magic field"), 12),
struct_symdef.$of(94, S("polymorph trap"), 10),
struct_symdef.$of(126, S("vibrating square"), 5),
struct_symdef.$of(124, S(""), 7),
struct_symdef.$of(45, S(""), 7),
struct_symdef.$of(92, S(""), 7),
struct_symdef.$of(47, S(""), 7),
struct_symdef.$of(42, S(""), 15),
struct_symdef.$of(33, S(""), 15),
struct_symdef.$of(41, S(""), 3),
struct_symdef.$of(40, S(""), 3),
struct_symdef.$of(48, S(""), 12),
struct_symdef.$of(35, S(""), 12),
struct_symdef.$of(64, S(""), 12),
struct_symdef.$of(42, S(""), 12),
struct_symdef.$of(35, S("poison cloud"), 10),
struct_symdef.$of(63, S("valid position"), 10),
struct_symdef.$of(47, S(""), 2),
struct_symdef.$of(45, S(""), 2),
struct_symdef.$of(92, S(""), 2),
struct_symdef.$of(124, S(""), 2),
struct_symdef.$of(124, S(""), 2),
struct_symdef.$of(92, S(""), 2),
struct_symdef.$of(45, S(""), 2),
struct_symdef.$of(47, S(""), 2),
struct_symdef.$of(47, S(""), 9),
struct_symdef.$of(45, S(""), 9),
struct_symdef.$of(92, S(""), 9),
struct_symdef.$of(124, S(""), 9),
struct_symdef.$of(32, S(""), 9),
struct_symdef.$of(124, S(""), 9),
struct_symdef.$of(92, S(""), 9),
struct_symdef.$of(45, S(""), 9),
struct_symdef.$of(47, S(""), 9)]);
  def_r_oc_syms = $ta(Uint8Array, 18, [0, ILLOBJ_SYM, WEAPON_SYM, 93, RING_SYM, 44, TOOL_SYM, 58, POTION_SYM, SCROLL_SYM, SPBOOK_SYM, WAND_SYM, GEM_SYM, GEM_SYM, ROCK_SYM, BALL_SYM, CHAIN_SYM, VENOM_SYM]);
  G.decgraphics_mode_callback = null;
  G.known_handling = [S("UNKNOWN"),
S("IBM"),
S("DEC"),
S("CURS"),
S("MAC"),
null];
  G.known_restrictions = [S("primary"), S("rogue"), null];
  G.loadsyms = $sarrOf([struct_symparse.$of(SYM_CONTROL, 0, S("start")),
struct_symparse.$of(SYM_CONTROL, 0, S("begin")),
struct_symparse.$of(SYM_CONTROL, 1, S("finish")),
struct_symparse.$of(SYM_CONTROL, 2, S("handling")),
struct_symparse.$of(SYM_CONTROL, 3, S("description")),
struct_symparse.$of(SYM_CONTROL, 4, S("color")),
struct_symparse.$of(SYM_CONTROL, 4, S("colour")),
struct_symparse.$of(SYM_CONTROL, 5, S("restrictions")),
struct_symparse.$of(SYM_PCHAR, S_stone, S("S_stone")),
struct_symparse.$of(SYM_PCHAR, S_vwall, S("S_vwall")),
struct_symparse.$of(SYM_PCHAR, S_hwall, S("S_hwall")),
struct_symparse.$of(SYM_PCHAR, S_tlcorn, S("S_tlcorn")),
struct_symparse.$of(SYM_PCHAR, S_trcorn, S("S_trcorn")),
struct_symparse.$of(SYM_PCHAR, S_blcorn, S("S_blcorn")),
struct_symparse.$of(SYM_PCHAR, S_brcorn, S("S_brcorn")),
struct_symparse.$of(SYM_PCHAR, S_crwall, S("S_crwall")),
struct_symparse.$of(SYM_PCHAR, S_tuwall, S("S_tuwall")),
struct_symparse.$of(SYM_PCHAR, S_tdwall, S("S_tdwall")),
struct_symparse.$of(SYM_PCHAR, S_tlwall, S("S_tlwall")),
struct_symparse.$of(SYM_PCHAR, S_trwall, S("S_trwall")),
struct_symparse.$of(SYM_PCHAR, S_ndoor, S("S_ndoor")),
struct_symparse.$of(SYM_PCHAR, S_vodoor, S("S_vodoor")),
struct_symparse.$of(SYM_PCHAR, S_hodoor, S("S_hodoor")),
struct_symparse.$of(SYM_PCHAR, S_vcdoor, S("S_vcdoor")),
struct_symparse.$of(SYM_PCHAR, S_hcdoor, S("S_hcdoor")),
struct_symparse.$of(SYM_PCHAR, S_bars, S("S_bars")),
struct_symparse.$of(SYM_PCHAR, S_tree, S("S_tree")),
struct_symparse.$of(SYM_PCHAR, S_room, S("S_room")),
struct_symparse.$of(SYM_PCHAR, S_darkroom, S("S_darkroom")),
struct_symparse.$of(SYM_PCHAR, S_corr, S("S_corr")),
struct_symparse.$of(SYM_PCHAR, S_litcorr, S("S_litcorr")),
struct_symparse.$of(SYM_PCHAR, S_upstair, S("S_upstair")),
struct_symparse.$of(SYM_PCHAR, S_dnstair, S("S_dnstair")),
struct_symparse.$of(SYM_PCHAR, S_upladder, S("S_upladder")),
struct_symparse.$of(SYM_PCHAR, S_dnladder, S("S_dnladder")),
struct_symparse.$of(SYM_PCHAR, S_altar, S("S_altar")),
struct_symparse.$of(SYM_PCHAR, S_grave, S("S_grave")),
struct_symparse.$of(SYM_PCHAR, S_throne, S("S_throne")),
struct_symparse.$of(SYM_PCHAR, S_sink, S("S_sink")),
struct_symparse.$of(SYM_PCHAR, S_fountain, S("S_fountain")),
struct_symparse.$of(SYM_PCHAR, S_pool, S("S_pool")),
struct_symparse.$of(SYM_PCHAR, S_ice, S("S_ice")),
struct_symparse.$of(SYM_PCHAR, S_lava, S("S_lava")),
struct_symparse.$of(SYM_PCHAR, S_vodbridge, S("S_vodbridge")),
struct_symparse.$of(SYM_PCHAR, S_hodbridge, S("S_hodbridge")),
struct_symparse.$of(SYM_PCHAR, S_vcdbridge, S("S_vcdbridge")),
struct_symparse.$of(SYM_PCHAR, S_hcdbridge, S("S_hcdbridge")),
struct_symparse.$of(SYM_PCHAR, S_air, S("S_air")),
struct_symparse.$of(SYM_PCHAR, S_cloud, S("S_cloud")),
struct_symparse.$of(SYM_PCHAR, S_poisoncloud, S("S_poisoncloud")),
struct_symparse.$of(SYM_PCHAR, S_water, S("S_water")),
struct_symparse.$of(SYM_PCHAR, S_arrow_trap, S("S_arrow_trap")),
struct_symparse.$of(SYM_PCHAR, S_dart_trap, S("S_dart_trap")),
struct_symparse.$of(SYM_PCHAR, S_falling_rock_trap, S("S_falling_rock_trap")),
struct_symparse.$of(SYM_PCHAR, S_squeaky_board, S("S_squeaky_board")),
struct_symparse.$of(SYM_PCHAR, S_bear_trap, S("S_bear_trap")),
struct_symparse.$of(SYM_PCHAR, S_land_mine, S("S_land_mine")),
struct_symparse.$of(SYM_PCHAR, S_rolling_boulder_trap, S("S_rolling_boulder_trap")),
struct_symparse.$of(SYM_PCHAR, S_sleeping_gas_trap, S("S_sleeping_gas_trap")),
struct_symparse.$of(SYM_PCHAR, S_rust_trap, S("S_rust_trap")),
struct_symparse.$of(SYM_PCHAR, S_fire_trap, S("S_fire_trap")),
struct_symparse.$of(SYM_PCHAR, S_pit, S("S_pit")),
struct_symparse.$of(SYM_PCHAR, S_spiked_pit, S("S_spiked_pit")),
struct_symparse.$of(SYM_PCHAR, S_hole, S("S_hole")),
struct_symparse.$of(SYM_PCHAR, S_trap_door, S("S_trap_door")),
struct_symparse.$of(SYM_PCHAR, S_teleportation_trap, S("S_teleportation_trap")),
struct_symparse.$of(SYM_PCHAR, S_level_teleporter, S("S_level_teleporter")),
struct_symparse.$of(SYM_PCHAR, S_magic_portal, S("S_magic_portal")),
struct_symparse.$of(SYM_PCHAR, S_web, S("S_web")),
struct_symparse.$of(SYM_PCHAR, S_statue_trap, S("S_statue_trap")),
struct_symparse.$of(SYM_PCHAR, S_magic_trap, S("S_magic_trap")),
struct_symparse.$of(SYM_PCHAR, S_anti_magic_trap, S("S_anti_magic_trap")),
struct_symparse.$of(SYM_PCHAR, S_polymorph_trap, S("S_polymorph_trap")),
struct_symparse.$of(SYM_PCHAR, S_vibrating_square, S("S_vibrating_square")),
struct_symparse.$of(SYM_PCHAR, S_vbeam, S("S_vbeam")),
struct_symparse.$of(SYM_PCHAR, S_hbeam, S("S_hbeam")),
struct_symparse.$of(SYM_PCHAR, S_lslant, S("S_lslant")),
struct_symparse.$of(SYM_PCHAR, S_rslant, S("S_rslant")),
struct_symparse.$of(SYM_PCHAR, S_digbeam, S("S_digbeam")),
struct_symparse.$of(SYM_PCHAR, S_flashbeam, S("S_flashbeam")),
struct_symparse.$of(SYM_PCHAR, S_boomleft, S("S_boomleft")),
struct_symparse.$of(SYM_PCHAR, S_boomright, S("S_boomright")),
struct_symparse.$of(SYM_PCHAR, S_goodpos, S("S_goodpos")),
struct_symparse.$of(SYM_PCHAR, S_ss1, S("S_ss1")),
struct_symparse.$of(SYM_PCHAR, S_ss2, S("S_ss2")),
struct_symparse.$of(SYM_PCHAR, S_ss3, S("S_ss3")),
struct_symparse.$of(SYM_PCHAR, S_ss4, S("S_ss4")),
struct_symparse.$of(SYM_PCHAR, S_sw_tl, S("S_sw_tl")),
struct_symparse.$of(SYM_PCHAR, S_sw_tc, S("S_sw_tc")),
struct_symparse.$of(SYM_PCHAR, S_sw_tr, S("S_sw_tr")),
struct_symparse.$of(SYM_PCHAR, S_sw_ml, S("S_sw_ml")),
struct_symparse.$of(SYM_PCHAR, S_sw_mr, S("S_sw_mr")),
struct_symparse.$of(SYM_PCHAR, S_sw_bl, S("S_sw_bl")),
struct_symparse.$of(SYM_PCHAR, S_sw_bc, S("S_sw_bc")),
struct_symparse.$of(SYM_PCHAR, S_sw_br, S("S_sw_br")),
struct_symparse.$of(SYM_PCHAR, S_explode1, S("S_explode1")),
struct_symparse.$of(SYM_PCHAR, S_explode2, S("S_explode2")),
struct_symparse.$of(SYM_PCHAR, S_explode3, S("S_explode3")),
struct_symparse.$of(SYM_PCHAR, S_explode4, S("S_explode4")),
struct_symparse.$of(SYM_PCHAR, S_explode5, S("S_explode5")),
struct_symparse.$of(SYM_PCHAR, S_explode6, S("S_explode6")),
struct_symparse.$of(SYM_PCHAR, S_explode7, S("S_explode7")),
struct_symparse.$of(SYM_PCHAR, S_explode8, S("S_explode8")),
struct_symparse.$of(SYM_PCHAR, S_explode9, S("S_explode9")),
struct_symparse.$of(SYM_OC, ILLOBJ_CLASS + SYM_OFF_O, S("S_strange_obj")),
struct_symparse.$of(SYM_OC, WEAPON_CLASS + SYM_OFF_O, S("S_weapon")),
struct_symparse.$of(SYM_OC, ARMOR_CLASS + SYM_OFF_O, S("S_armor")),
struct_symparse.$of(SYM_OC, ARMOR_CLASS + SYM_OFF_O, S("S_armour")),
struct_symparse.$of(SYM_OC, RING_CLASS + SYM_OFF_O, S("S_ring")),
struct_symparse.$of(SYM_OC, AMULET_CLASS + SYM_OFF_O, S("S_amulet")),
struct_symparse.$of(SYM_OC, TOOL_CLASS + SYM_OFF_O, S("S_tool")),
struct_symparse.$of(SYM_OC, FOOD_CLASS + SYM_OFF_O, S("S_food")),
struct_symparse.$of(SYM_OC, POTION_CLASS + SYM_OFF_O, S("S_potion")),
struct_symparse.$of(SYM_OC, SCROLL_CLASS + SYM_OFF_O, S("S_scroll")),
struct_symparse.$of(SYM_OC, SPBOOK_CLASS + SYM_OFF_O, S("S_book")),
struct_symparse.$of(SYM_OC, WAND_CLASS + SYM_OFF_O, S("S_wand")),
struct_symparse.$of(SYM_OC, COIN_CLASS + SYM_OFF_O, S("S_coin")),
struct_symparse.$of(SYM_OC, GEM_CLASS + SYM_OFF_O, S("S_gem")),
struct_symparse.$of(SYM_OC, ROCK_CLASS + SYM_OFF_O, S("S_rock")),
struct_symparse.$of(SYM_OC, BALL_CLASS + SYM_OFF_O, S("S_ball")),
struct_symparse.$of(SYM_OC, CHAIN_CLASS + SYM_OFF_O, S("S_chain")),
struct_symparse.$of(SYM_OC, VENOM_CLASS + SYM_OFF_O, S("S_venom")),
struct_symparse.$of(SYM_MON, S_ANT + SYM_OFF_M, S("S_ant")),
struct_symparse.$of(SYM_MON, S_BLOB + SYM_OFF_M, S("S_blob")),
struct_symparse.$of(SYM_MON, S_COCKATRICE + SYM_OFF_M, S("S_cockatrice")),
struct_symparse.$of(SYM_MON, S_DOG + SYM_OFF_M, S("S_dog")),
struct_symparse.$of(SYM_MON, S_EYE + SYM_OFF_M, S("S_eye")),
struct_symparse.$of(SYM_MON, S_FELINE + SYM_OFF_M, S("S_feline")),
struct_symparse.$of(SYM_MON, S_GREMLIN + SYM_OFF_M, S("S_gremlin")),
struct_symparse.$of(SYM_MON, S_HUMANOID + SYM_OFF_M, S("S_humanoid")),
struct_symparse.$of(SYM_MON, S_IMP + SYM_OFF_M, S("S_imp")),
struct_symparse.$of(SYM_MON, S_JELLY + SYM_OFF_M, S("S_jelly")),
struct_symparse.$of(SYM_MON, S_KOBOLD + SYM_OFF_M, S("S_kobold")),
struct_symparse.$of(SYM_MON, S_LEPRECHAUN + SYM_OFF_M, S("S_leprechaun")),
struct_symparse.$of(SYM_MON, S_MIMIC + SYM_OFF_M, S("S_mimic")),
struct_symparse.$of(SYM_MON, S_NYMPH + SYM_OFF_M, S("S_nymph")),
struct_symparse.$of(SYM_MON, S_ORC + SYM_OFF_M, S("S_orc")),
struct_symparse.$of(SYM_MON, S_PIERCER + SYM_OFF_M, S("S_piercer")),
struct_symparse.$of(SYM_MON, S_QUADRUPED + SYM_OFF_M, S("S_quadruped")),
struct_symparse.$of(SYM_MON, S_RODENT + SYM_OFF_M, S("S_rodent")),
struct_symparse.$of(SYM_MON, S_SPIDER + SYM_OFF_M, S("S_spider")),
struct_symparse.$of(SYM_MON, S_TRAPPER + SYM_OFF_M, S("S_trapper")),
struct_symparse.$of(SYM_MON, S_UNICORN + SYM_OFF_M, S("S_unicorn")),
struct_symparse.$of(SYM_MON, S_VORTEX + SYM_OFF_M, S("S_vortex")),
struct_symparse.$of(SYM_MON, S_WORM + SYM_OFF_M, S("S_worm")),
struct_symparse.$of(SYM_MON, S_XAN + SYM_OFF_M, S("S_xan")),
struct_symparse.$of(SYM_MON, S_LIGHT + SYM_OFF_M, S("S_light")),
struct_symparse.$of(SYM_MON, S_ZRUTY + SYM_OFF_M, S("S_zruty")),
struct_symparse.$of(SYM_MON, S_ANGEL + SYM_OFF_M, S("S_angel")),
struct_symparse.$of(SYM_MON, S_BAT + SYM_OFF_M, S("S_bat")),
struct_symparse.$of(SYM_MON, S_CENTAUR + SYM_OFF_M, S("S_centaur")),
struct_symparse.$of(SYM_MON, S_DRAGON + SYM_OFF_M, S("S_dragon")),
struct_symparse.$of(SYM_MON, S_ELEMENTAL + SYM_OFF_M, S("S_elemental")),
struct_symparse.$of(SYM_MON, S_FUNGUS + SYM_OFF_M, S("S_fungus")),
struct_symparse.$of(SYM_MON, S_GNOME + SYM_OFF_M, S("S_gnome")),
struct_symparse.$of(SYM_MON, S_GIANT + SYM_OFF_M, S("S_giant")),
struct_symparse.$of(SYM_MON, S_JABBERWOCK + SYM_OFF_M, S("S_jabberwock")),
struct_symparse.$of(SYM_MON, S_KOP + SYM_OFF_M, S("S_kop")),
struct_symparse.$of(SYM_MON, S_LICH + SYM_OFF_M, S("S_lich")),
struct_symparse.$of(SYM_MON, S_MUMMY + SYM_OFF_M, S("S_mummy")),
struct_symparse.$of(SYM_MON, S_NAGA + SYM_OFF_M, S("S_naga")),
struct_symparse.$of(SYM_MON, S_OGRE + SYM_OFF_M, S("S_ogre")),
struct_symparse.$of(SYM_MON, S_PUDDING + SYM_OFF_M, S("S_pudding")),
struct_symparse.$of(SYM_MON, S_QUANTMECH + SYM_OFF_M, S("S_quantmech")),
struct_symparse.$of(SYM_MON, S_RUSTMONST + SYM_OFF_M, S("S_rustmonst")),
struct_symparse.$of(SYM_MON, S_SNAKE + SYM_OFF_M, S("S_snake")),
struct_symparse.$of(SYM_MON, S_TROLL + SYM_OFF_M, S("S_troll")),
struct_symparse.$of(SYM_MON, S_UMBER + SYM_OFF_M, S("S_umber")),
struct_symparse.$of(SYM_MON, S_VAMPIRE + SYM_OFF_M, S("S_vampire")),
struct_symparse.$of(SYM_MON, S_WRAITH + SYM_OFF_M, S("S_wraith")),
struct_symparse.$of(SYM_MON, S_XORN + SYM_OFF_M, S("S_xorn")),
struct_symparse.$of(SYM_MON, S_YETI + SYM_OFF_M, S("S_yeti")),
struct_symparse.$of(SYM_MON, S_ZOMBIE + SYM_OFF_M, S("S_zombie")),
struct_symparse.$of(SYM_MON, S_HUMAN + SYM_OFF_M, S("S_human")),
struct_symparse.$of(SYM_MON, S_GHOST + SYM_OFF_M, S("S_ghost")),
struct_symparse.$of(SYM_MON, S_GOLEM + SYM_OFF_M, S("S_golem")),
struct_symparse.$of(SYM_MON, S_DEMON + SYM_OFF_M, S("S_demon")),
struct_symparse.$of(SYM_MON, S_EEL + SYM_OFF_M, S("S_eel")),
struct_symparse.$of(SYM_MON, S_LIZARD + SYM_OFF_M, S("S_lizard")),
struct_symparse.$of(SYM_MON, S_WORM_TAIL + SYM_OFF_M, S("S_worm_tail")),
struct_symparse.$of(SYM_MON, S_MIMIC_DEF + SYM_OFF_M, S("S_mimic_def")),
struct_symparse.$of(SYM_OTH, SYM_BOULDER + SYM_OFF_X, S("S_boulder")),
struct_symparse.$of(SYM_OTH, SYM_INVISIBLE + SYM_OFF_X, S("S_invisible")),
struct_symparse.$of(SYM_OTH, SYM_PET_OVERRIDE + SYM_OFF_X, S("S_pet_override")),
struct_symparse.$of(SYM_OTH, SYM_HERO_OVERRIDE + SYM_OFF_X, S("S_hero_override")),
struct_symparse.$of()]);
}
