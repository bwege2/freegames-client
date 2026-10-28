// @ts-nocheck
// NetHack 3.6.7 quest.c, translated to TypeScript by re/nethack/tools/c2ts (do not edit).
import { adjalign, exercise } from './attrib.ts';
import { yn_function } from './cmd.ts';
import { schedule_goto } from './do.ts';
import { Monnam, mon_nam } from './do_name.ts';
import { Is_special, dungeon_branch, on_level, remdun_mapseen } from './dungeon.ts';
import { carrying, fully_identify_obj, update_inventory } from './invent.ts';
import { angry_guards, monnear } from './mon.ts';
import { You, impossible, pline, verbalize } from './pline.ts';
import { align_str } from './priest.ts';
import { com_pager, find_quest_artifact, is_quest_artifact, qt_pager } from './questpgr.ts';
import { rn2 } from './rnd.ts';
import { deltrap } from './trap.ts';
import { worm_known } from './worm.ts';
import { struct_monst, struct_obj } from './structs.ts';
import { $rd, $sat, $wr, G, S } from './rt/index.ts';
import { AMULET_OF_YENDOR, A_CURRENT, A_ORIGINAL, A_WIS, BELL_OF_OPENING, BLINDED, FALSE, INFRAVISION, MAGIC_PORTAL, MAX_QUEST_TRIES, MIN_QUEST_ALIGN, MIN_QUEST_LEVEL, MS_NEMESIS, OBJ_BURIED, OBJ_FLOOR, OBJ_MINVENT, PM_PRISONER, QT_ALTGOAL, QT_ASSIGNQUEST, QT_BADALIGN, QT_BADLEVEL, QT_BANISHED, QT_FIRSTGOAL, QT_FIRSTLEADER, QT_FIRSTLOCATE, QT_FIRSTNEMESIS, QT_FIRSTTIME, QT_GOTIT, QT_HASAMULET, QT_KILLEDNEM, QT_LASTLEADER, QT_NEMWANTSIT, QT_NEXTGOAL, QT_NEXTLEADER, QT_NEXTLOCATE, QT_NEXTNEMESIS, QT_NEXTTIME, QT_OFFEREDIT, QT_OFFEREDIT2, QT_OTHERNEMESIS, QT_OTHERTIME, QT_POSTHANKS, SEE_INVIS, STRAT_WAITMASK, TRUE } from './consts.ts';


async function on_start(): Promise<void> {
  if (!G.quest_status.first_start) {
    await qt_pager(QT_FIRSTTIME);
    G.quest_status.first_start = (TRUE) & 1;
  } else if (G.u.uz0.dnum !== G.u.uz.dnum || G.u.uz0.dlevel < G.u.uz.dlevel) {
    if ((G.quest_status.not_ready | 0) <= 2) {
      await qt_pager(QT_NEXTTIME);
    } else {
      await qt_pager(QT_OTHERTIME);
    }
  }
}

async function on_locate(): Promise<void> {
  let from_above = (G.u.uz0.dlevel < G.u.uz.dlevel ? 1 : 0) << 24 >> 24;
  if (G.quest_status.killed_nemesis) {
    return;
  } else if (!G.quest_status.first_locate) {
    if (from_above) {
      await qt_pager(QT_FIRSTLOCATE);
    }
    G.quest_status.first_locate = (TRUE) & 1;
  } else {
    if (from_above) {
      await qt_pager(QT_NEXTLOCATE);
    }
  }
}

async function on_goal(): Promise<void> {
  if (G.quest_status.killed_nemesis) {
    return;
  } else if (!G.quest_status.made_goal) {
    await qt_pager(QT_FIRSTGOAL);
    G.quest_status.made_goal = 1;
  } else {
    let whichobjchains = 1 << OBJ_FLOOR | 1 << OBJ_MINVENT | 1 << OBJ_BURIED;
    let qarti = find_quest_artifact(whichobjchains);
    await qt_pager(qarti ? QT_NEXTGOAL : QT_ALTGOAL);
    if ((G.quest_status.made_goal | 0) < 7) {
      G.quest_status.made_goal = (G.quest_status.made_goal + 1 >>> 0) & 7;
    }
  }
}

export async function onquest(): Promise<void> {
  if (G.u.uevent.qcompleted | 0 || on_level(G.u.uz0, G.u.uz)) {
    return;
  }
  if (!Is_special(G.u.uz)) {
    return;
  }
  if ((G.dungeon_topology.d_qstart_level.dlevel || G.dungeon_topology.d_qstart_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qstart_level)) {
    await on_start();
  } else if ((G.dungeon_topology.d_qlocate_level.dlevel || G.dungeon_topology.d_qlocate_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_qlocate_level)) {
    await on_locate();
  } else if ((G.dungeon_topology.d_nemesis_level.dlevel || G.dungeon_topology.d_nemesis_level.dnum) && on_level(G.u.uz, G.dungeon_topology.d_nemesis_level)) {
    await on_goal();
  }
  return;
}

export async function nemdead(): Promise<void> {
  if (!G.quest_status.killed_nemesis) {
    G.quest_status.killed_nemesis = (TRUE) & 1;
    await qt_pager(QT_KILLEDNEM);
  }
}

export async function artitouch(obj: struct_obj | null): Promise<void> {
  if (!G.quest_status.touched_artifact) {
    obj.dknown = 1;
    G.quest_status.touched_artifact = (TRUE) & 1;
    await qt_pager(QT_GOTIT);
    await exercise(A_WIS, TRUE);
  }
}

export async function ok_to_quest(): Promise<number> {
  return ((G.quest_status.got_quest | 0 || G.quest_status.got_thanks | 0) && await is_pure(FALSE) > 0 ? 1 : 0) << 24 >> 24;
}

function not_capable(): number {
  return (G.u.ulevel < MIN_QUEST_LEVEL ? 1 : 0) << 24 >> 24;
}

async function is_pure(talk: number): Promise<number> {
  let purity = 0;
  let original_alignment = G.u.ualignbase[A_ORIGINAL];
  if (G.flags.debug && talk) {
    if (G.u.ualign.type !== original_alignment) {
      await You(S("are currently %s instead of %s."), align_str(G.u.ualign.type), align_str(original_alignment));
    } else if (G.u.ualignbase[A_CURRENT] !== original_alignment) {
      await You(S("have converted."));
    } else if (G.u.ualign.record < MIN_QUEST_ALIGN) {
      await You(S("are currently %d and require %d."), G.u.ualign.record, MIN_QUEST_ALIGN);
      if (await yn_function(S("adjust?"), null, 121) === 121) {
        G.u.ualign.record = MIN_QUEST_ALIGN;
      }
    }
  }
  purity = G.u.ualign.record >= MIN_QUEST_ALIGN && G.u.ualign.type === original_alignment && G.u.ualignbase[A_CURRENT] === original_alignment ? 1 : G.u.ualignbase[A_CURRENT] !== original_alignment ? -1 : 0;
  return purity;
}

async function expulsion(seal: number): Promise<void> {
  let br = null;
  let dest = null;
  let t = null;
  let portal_flag = 0;
  br = await dungeon_branch(S("The Quest"));
  dest = br.end1.dnum === G.u.uz.dnum ? br.end2 : br.end1;
  portal_flag = G.u.uevent.qexpelled | 0 ? 0 : !seal ? 1 : -1;
  await schedule_goto(dest, FALSE, FALSE, portal_flag, null, null);
  if (seal) {
    let reexpelled = G.u.uevent.qexpelled | 0;
    G.u.uevent.qexpelled = 1;
    remdun_mapseen(G.dungeon_topology.d_quest_dnum);
    for (t = G.ftrap; t; t = t.ntrap) {
      if ((t.ttyp | 0) === MAGIC_PORTAL) {
        break;
      }
    }
    if (t) {
      await deltrap(t);
    } else if (!reexpelled) {
      await impossible(S("quest portal already gone?"));
    }
  }
}

export async function finish_quest(obj: struct_obj | null): Promise<void> {
  let otmp = null;
  if (G.u.uhave.amulet) {
    await qt_pager(QT_HASAMULET);
    if (!!(otmp = carrying(AMULET_OF_YENDOR))) {
      await fully_identify_obj(otmp);
    }
  } else {
    await qt_pager(!G.quest_status.got_thanks ? QT_OFFEREDIT : QT_OFFEREDIT2);
    if (!(otmp = carrying(BELL_OF_OPENING))) {
      await com_pager(5);
    }
  }
  G.quest_status.got_thanks = (TRUE) & 1;
  if (obj) {
    G.u.uevent.qcompleted = 1;
    await fully_identify_obj(obj);
    update_inventory();
  }
}

async function chat_with_leader(): Promise<void> {
  if (G.u.uhave.questart | 0 && !G.quest_status.met_nemesis) {
    G.quest_status.cheater = (TRUE) & 1;
  }
  if (G.quest_status.got_thanks) {
    if (G.u.uhave.amulet) {
      await finish_quest(null);
    } else {
      await qt_pager(QT_POSTHANKS);
    }
  } else if (G.u.uhave.questart) {
    let otmp = null;
    for (otmp = G.invent; otmp; otmp = otmp.nobj) {
      if (is_quest_artifact(otmp)) {
        break;
      }
    }
    await finish_quest(otmp);
  } else if (G.quest_status.got_quest) {
    await qt_pager(rn2(10) + 25);
  } else {
    if (!G.quest_status.met_leader) {
      await qt_pager(QT_FIRSTLEADER);
      G.quest_status.met_leader = (TRUE) & 1;
      G.quest_status.not_ready = 0;
    } else {
      await qt_pager(QT_NEXTLEADER);
    }
    if (!on_level(G.u.uz, G.dungeon_topology.d_qstart_level)) {
      return;
    }
    if (not_capable()) {
      await qt_pager(QT_BADLEVEL);
      await exercise(A_WIS, TRUE);
      await expulsion(FALSE);
    } else if (await is_pure(TRUE) < 0) {
      await com_pager(QT_BANISHED);
      await expulsion(TRUE);
    } else if (await is_pure(TRUE) === 0) {
      await qt_pager(QT_BADALIGN);
      if ((G.quest_status.not_ready | 0) === MAX_QUEST_TRIES) {
        await qt_pager(QT_LASTLEADER);
        await expulsion(TRUE);
      } else {
        G.quest_status.not_ready = (G.quest_status.not_ready + 1 >>> 0) & 7;
        await exercise(A_WIS, TRUE);
        await expulsion(FALSE);
      }
    } else {
      await qt_pager(QT_ASSIGNQUEST);
      await exercise(A_WIS, TRUE);
      G.quest_status.got_quest = (TRUE) & 1;
    }
  }
}

export async function leader_speaks(mtmp: struct_monst | null): Promise<void> {
  if (!mtmp.mpeaceful) {
    G.quest_status.pissed_off = (TRUE) & 1;
    mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
  }
  if (!on_level(G.u.uz, G.dungeon_topology.d_qstart_level)) {
    return;
  }
  if (G.quest_status.pissed_off) {
    await qt_pager(QT_LASTLEADER);
    await expulsion(TRUE);
  } else {
    await chat_with_leader();
  }
}

async function chat_with_nemesis(): Promise<void> {
  await qt_pager(rn2(10) + 60);
  if (!G.quest_status.met_nemesis) {
    G.quest_status.met_nemesis = (G.quest_status.met_nemesis + 1 >>> 0) & 1;
  }
}

export async function nemesis_speaks(): Promise<void> {
  if (!G.quest_status.in_battle) {
    if (G.u.uhave.questart) {
      await qt_pager(QT_NEMWANTSIT);
    } else if ((G.quest_status.made_goal | 0) === 1 || !G.quest_status.met_nemesis) {
      await qt_pager(QT_FIRSTNEMESIS);
    } else if ((G.quest_status.made_goal | 0) < 4) {
      await qt_pager(QT_NEXTNEMESIS);
    } else if ((G.quest_status.made_goal | 0) < 7) {
      await qt_pager(QT_OTHERNEMESIS);
    } else if (!rn2(5)) {
      await qt_pager(rn2(10) + 60);
    }
    if ((G.quest_status.made_goal | 0) < 7) {
      G.quest_status.made_goal = (G.quest_status.made_goal + 1 >>> 0) & 7;
    }
    G.quest_status.met_nemesis = (TRUE) & 1;
  } else if (!rn2(5)) {
    await qt_pager(rn2(10) + 60);
  }
}

async function chat_with_guardian(): Promise<void> {
  if (G.u.uhave.questart | 0 && G.quest_status.killed_nemesis | 0) {
    await qt_pager(rn2(5) + 10);
  } else {
    await qt_pager(rn2(5) + 5);
  }
}

async function prisoner_speaks(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.data === $sat(G.mons, PM_PRISONER) && (mtmp.mstrategy & STRAT_WAITMASK) >>> 0) {
    if ((mtmp.wormno | 0 ? worm_known(mtmp) : $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 2 || !((G.u.uroleplay.blind || G.u.uprops[BLINDED].intrinsic || G.ublindf && G.ublindf.otyp !== 207 || !((G.youmonst.data.mflags1 & 4096) >>> 0 === 0)) && !(G.ublindf && G.ublindf.oartifact === 26)) && (G.u.uprops[INFRAVISION].intrinsic || G.u.uprops[INFRAVISION].extrinsic) && mtmp && mtmp.data.mflags3 & 512 && $rd(G.viz_array.a[G.viz_array.o + mtmp.my], mtmp.mx) & 1 ? 1 : 0) && ((!mtmp.minvis || (G.u.uprops[SEE_INVIS].intrinsic || G.u.uprops[SEE_INVIS].extrinsic)) && !mtmp.mundetected)) {
      await pline(S("%s speaks:"), await Monnam(mtmp));
    }
    await verbalize(S("I'm finally free!"));
    mtmp.mstrategy = (mtmp.mstrategy & ~STRAT_WAITMASK >>> 0) >>> 0;
    mtmp.mpeaceful = 1;
    adjalign(3);
    await angry_guards(FALSE);
  }
  return;
}

export async function quest_chat(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.m_id === G.quest_status.leader_m_id) {
    await chat_with_leader();
    return;
  }
  switch (mtmp.data.msound) {
  case 32:
    await chat_with_nemesis();
    break;
  case 33:
    await chat_with_guardian();
    break;
  default:
    await impossible(S("quest_chat: Unknown quest character %s."), await mon_nam(mtmp));
  }
}

export async function quest_talk(mtmp: struct_monst | null): Promise<void> {
  if (mtmp.m_id === G.quest_status.leader_m_id) {
    await leader_speaks(mtmp);
    return;
  }
  switch (mtmp.data.msound) {
  case 32:
    await nemesis_speaks();
    break;
  case 24:
    await prisoner_speaks(mtmp);
    break;
  default:
    break;
  }
}

export function quest_stat_check(mtmp: struct_monst | null): void {
  if (mtmp.data.msound === MS_NEMESIS) {
    G.quest_status.in_battle = ((mtmp.mcanmove | 0 && !mtmp.msleeping && monnear(mtmp, G.u.ux, G.u.uy) ? 1 : 0) >>> 0) & 1;
  }
}

export function $init(): void {
}
