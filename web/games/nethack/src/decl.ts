// @ts-nocheck
// NetHack 3.6.7 decl.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { struct_align, struct_attribs, struct_book_info, struct_c_color_names, struct_c_common_strings, struct_context_info, struct_d_level, struct_debug_flags, struct_dest_area, struct_dgn_topology, struct_dig_info, struct_dlevel_t, struct_dungeon, struct_flag, struct_instance_flags, struct_kinfo, struct_linfo, struct_mkroom, struct_monst, struct_multishot, struct_mvitals, struct_nhcoord, struct_novel_tracking, struct_obj, struct_obj_split, struct_polearm_info, struct_prop, struct_q_score, struct_savefile_info, struct_sinfo, struct_skills, struct_spell, struct_stairway, struct_takeoff_info, struct_tc_gbl_data, struct_tin_info, struct_tribute_info, struct_u_achieve, struct_u_conduct, struct_u_event, struct_u_have, struct_u_realtime, struct_u_roleplay, struct_victual_info, struct_warntype_info, struct_you, union_any, union_vptrs } from './structs.ts';
import { $cs, $rows, $sarr, $sarrOf, $ta, G, S } from './rt/index.ts';
import { CLR_BLACK, CLR_GREEN, CLR_ORANGE, CLR_WHITE, CLR_YELLOW, COLNO, HI_ZAP, MAXNROFROOMS, ROWNO, STRANGE_OBJECT, S_ss1, S_ss2, S_ss3, S_ss4 } from './consts.ts';


export function decl_init(): void {
  return;
}

export function $init(): void {
  G.afternmv = null;
  G.occupation = null;
  G.hname = null;
  G.hackpid = 0;
  G.locknum = 0;
  G.chosen_windowtype = new Int8Array(16);
  G.bases = new Int32Array(18);
  G.multi = 0;
  G.multi_reason = null;
  G.nroom = 0;
  G.nsubroom = 0;
  G.occtime = 0;
  G.x_maze_max = COLNO - 1 & ~1;
  G.y_maze_max = ROWNO - 1 & ~1;
  G.otg_temp = 0;
  G.in_doagain = 0;
  G.dungeon_topology = struct_dgn_topology.$of(struct_d_level.$of(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), 0, 0, 0, 0, new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level(), new struct_d_level());
  G.quest_status = struct_q_score.$of();
  G.warn_obj_cnt = 0;
  G.smeq = new Int32Array(41);
  G.doorindex = 0;
  G.save_cm = null;
  G.killer = struct_kinfo.$of(null, 0, 0, new Int8Array(256));
  G.done_money = 0;
  G.nomovemsg = null;
  G.plname = new Int8Array(32);
  G.pl_character = new Int8Array(32);
  G.pl_race = 0;
  G.pl_fruit = new Int8Array(32);
  G.ffruit = null;
  G.tune = new Int8Array(6);
  G.ransacked = 0;
  G.occtxt = null;
  G.quitchars = $cs(" \r\n\x1b", 5);
  G.vowels = $cs("aeiouAEIOU", 11);
  G.ynchars = $cs("yn", 3);
  G.ynqchars = $cs("ynq", 4);
  G.ynaqchars = $cs("ynaq", 5);
  G.ynNaqchars = $cs("yn#aq", 6);
  G.yn_number = 0;
  G.disclosure_options = $cs("iavgco", 7);
  G.level_info = $sarr(struct_linfo, 512);
  G.program_state = new struct_sinfo();
  G.xdir = $ta(Int8Array, 10, [-1, -1, 0, 1, 1, 1, 0, -1]);
  G.ydir = $ta(Int8Array, 10, [0, -1, -1, -1, 0, 1, 1, 1]);
  G.zdir = $ta(Int8Array, 10, [0, 0, 0, 0, 0, 0, 0, 0, 1, -1]);
  G.tbx = 0;
  G.tby = 0;
  G.m_shot = struct_multishot.$of(0, 0, STRANGE_OBJECT);
  G.dungeons = $sarr(struct_dungeon, 16);
  G.sp_levchn = null;
  G.upstair = struct_stairway.$of(0, 0, struct_d_level.$of());
  G.dnstair = struct_stairway.$of(0, 0, struct_d_level.$of());
  G.upladder = struct_stairway.$of(0, 0, struct_d_level.$of());
  G.dnladder = struct_stairway.$of(0, 0, struct_d_level.$of());
  G.sstairs = struct_stairway.$of(0, 0, struct_d_level.$of());
  G.updest = struct_dest_area.$of();
  G.dndest = struct_dest_area.$of();
  G.inv_pos = struct_nhcoord.$of();
  G.defer_see_monsters = 0;
  G.in_mklev = 0;
  G.stoned = 0;
  G.unweapon = 0;
  G.mrg_to_wielded = 0;
  G.in_steed_dismounting = 0;
  G.has_strong_rngseed = 0;
  G.bhitpos = struct_nhcoord.$of();
  G.doors = $sarrOf([struct_nhcoord.$of(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord(),
new struct_nhcoord()]);
  G.rooms = $sarrOf([struct_mkroom.$of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new Array(24).fill(null)),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom(),
new struct_mkroom()]);
  G.subrooms = G.rooms[MAXNROFROOMS + 1];
  G.upstairs_room = null;
  G.dnstairs_room = null;
  G.sstairs_room = null;
  G.level = new struct_dlevel_t();
  G.ftrap = null;
  G.youmonst = struct_monst.$of(null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, $sarr(struct_nhcoord, 4));
  G.context = struct_context_info.$of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new struct_dig_info(), new struct_victual_info(), new struct_tin_info(), new struct_book_info(), new struct_takeoff_info(), new struct_warntype_info(), new struct_polearm_info(), new struct_obj_split(), new struct_tribute_info(), new struct_novel_tracking());
  G.flags = struct_flag.$of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new Int8Array(18), new Int8Array(18), new Int8Array(7));
  G.iflags = struct_instance_flags.$of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new struct_nhcoord(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, 0, 0, 0, 0, null, null, null, null, null, null, null, null, null, null, null, null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new struct_debug_flags());
  G.u = struct_you.$of(0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new struct_d_level(), new struct_d_level(), new struct_d_level(), 0, 0, 0, 0, 0, 0, 0, new Int8Array(5), new Int8Array(5), new Int8Array(5), new Int8Array(5), new Int8Array(5), new Int8Array(5), new Int8Array(5), 0, 0, $sarr(struct_prop, 68), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new struct_attribs(), new struct_attribs(), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new struct_u_achieve(), new struct_u_event(), new struct_u_have(), new struct_u_conduct(), new struct_u_roleplay(), new struct_attribs(), new struct_attribs(), new struct_attribs(), new struct_attribs(), new struct_attribs(), new struct_attribs(), new struct_align(), new Int8Array(2), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, new Int8Array(30), new Int8Array(30), 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, null, null, 0, 0, 0, 0, 0, 0, new Int8Array(60), $sarr(struct_skills, 39));
  G.ubirthday = 0;
  G.urealtime = struct_u_realtime.$of();
  G.lastseentyp = $rows([new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21),
new Int8Array(21)]);
  G.invent = null;
  G.uwep = null;
  G.uarm = null;
  G.uswapwep = null;
  G.uquiver = null;
  G.uarmu = null;
  G.uskin = null;
  G.uarmc = null;
  G.uarmh = null;
  G.uarms = null;
  G.uarmg = null;
  G.uarmf = null;
  G.uamul = null;
  G.uright = null;
  G.uleft = null;
  G.ublindf = null;
  G.uchain = null;
  G.uball = null;
  G.current_wand = null;
  G.thrownobj = null;
  G.kickedobj = null;
  G.zapcolors = $ta(Int32Array, 8, [HI_ZAP, CLR_ORANGE, CLR_WHITE, HI_ZAP, CLR_BLACK, CLR_WHITE, CLR_GREEN, CLR_YELLOW]);
  G.shield_static = $ta(Int32Array, 21, [S_ss1, S_ss2, S_ss3, S_ss2, S_ss1, S_ss2, S_ss4, S_ss1, S_ss2, S_ss3, S_ss2, S_ss1, S_ss2, S_ss4, S_ss1, S_ss2, S_ss3, S_ss2, S_ss1, S_ss2, S_ss4]);
  G.spl_book = $sarrOf([struct_spell.$of(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell(),
new struct_spell()]);
  G.moves = 1;
  G.monstermoves = 1;
  G.wailmsg = 0;
  G.migrating_objs = null;
  G.billobjs = null;
  G.zeroobj = struct_obj.$of(null, new union_vptrs());
  G.zeromonst = struct_monst.$of(null, null, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, $sarr(struct_nhcoord, 4));
  G.zeroany = new union_any();
  G.dogname = new Int8Array(63);
  G.catname = new Int8Array(63);
  G.horsename = new Int8Array(63);
  G.preferred_pet = 0;
  G.mydogs = null;
  G.migrating_mons = null;
  G.apelist = null;
  G.mvitals = $sarr(struct_mvitals, 382);
  G.domove_attempting = 0;
  G.domove_succeeded = 0;
  G.c_color_names = struct_c_color_names.$of(S("black"), S("amber"), S("golden"), S("light blue"), S("red"), S("green"), S("silver"), S("blue"), S("purple"), S("white"), S("orange"));
  G.menu_colorings = null;
  G.c_obj_colors = [S("black"),
S("red"),
S("green"),
S("brown"),
S("blue"),
S("magenta"),
S("cyan"),
S("gray"),
S("transparent"),
S("orange"),
S("bright green"),
S("yellow"),
S("bright blue"),
S("bright magenta"),
S("bright cyan"),
S("white")];
  G.c_common_strings = struct_c_common_strings.$of(S("Nothing happens."), S("That's enough tries!"), S("That is a silly thing to %s."), S("shudder for a moment."), S("something"), S("Something"), S("You can move again."), S("Never mind."), S("vision quickly clears."), [S("the"), S("your")], [S("mon"), S("you")]);
  G.materialnm = [S("mysterious"),
S("liquid"),
S("wax"),
S("organic"),
S("flesh"),
S("paper"),
S("cloth"),
S("leather"),
S("wooden"),
S("bone"),
S("dragonhide"),
S("iron"),
S("metal"),
S("copper"),
S("silver"),
S("gold"),
S("platinum"),
S("mithril"),
S("plastic"),
S("glass"),
S("gemstone"),
S("stone")];
  G.vision_full_recalc = 0;
  G.viz_array = null;
  G.WIN_MESSAGE = -1;
  G.WIN_STATUS = -1;
  G.WIN_MAP = -1;
  G.WIN_INVEN = -1;
  G.toplines = new Int8Array(300);
  G.tc_gbl_data = struct_tc_gbl_data.$of();
  G.fqn_prefix = [null,
null,
null,
null,
null,
null,
null,
null,
null,
null];
  G.sfcap = struct_savefile_info.$of();
  G.sfrestinfo = new struct_savefile_info();
  G.sfsaveinfo = struct_savefile_info.$of();
  G.plinemsg_types = null;
  G.nhUse_dummy = 0;
}
