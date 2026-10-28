// @ts-nocheck
// COW 3.3.3 playerlist.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { booleanDefault, getdefault, intDefault } from './defaults.ts';
import { format, ftoa, itoapad } from './string_util.ts';
import { W_ClearArea, W_ClearWindow, W_IsMapped, W_WriteText } from './x11window.ts';
import { struct_event, struct_player } from './structs.ts';
import { $cast, $rd, $sadd, $sidx, $wr, G, P, R, S, fprintf, fputs, memccpy, printf } from '../rt/index.ts';
import { BUFSIZ, FALSE, MAXPLAYER, MaxPlistField, NOBODY, NUMTEAM, PALIVE, PFREE, PLISTLASTSTYLE, STARBASE, TRUE } from './consts.ts';

let plistLayout: Ptr | null;
let plistPos: any;
let plistWidth: number;
let my_classes: any;
let WriteSortedPlist$plistLastRow: number;
let WriteSortedPlist$blankLine: number;
let WriteSortedPlist$blankLine2: number;
let WriteSortedPlist$myTeam: number;
let WriteUnsortedPlist$myTeam: number;

export function InitPlayerList(): void {
  G.plistCustomLayout = getdefault(S("playerlist"));
  G.plistStyle = intDefault(S("playerListStyle"), -1);
  if (!G.plistStyle && !G.plistCustomLayout) {
    fputs(S("Warning: `playerListStyle' set to 0 but `playerlist' is not set.\n"), R.stderr);
    fputs(S("\tPlease correct your defaults (.xtrekrc) file.\n"), R.stderr);
    G.plistStyle = -1;
  }
  if (G.plistStyle > PLISTLASTSTYLE) {
    G.plistStyle = PLISTLASTSTYLE;
  } else if (G.plistStyle === -1) {
    if (G.plistCustomLayout) {
      G.plistStyle = 0;
    } else if (booleanDefault(S("newPlist"), FALSE)) {
      G.plistStyle = 2;
    } else {
      G.plistStyle = 1;
    }
  }
  G.partitionPlist = booleanDefault(S("partitionPlist"), G.partitionPlist);
  G.sortPlayers = booleanDefault(S("sortPlayers"), G.sortPlayers);
  G.sortMyTeamFirst = booleanDefault(S("sortMyTeamFirst"), G.sortMyTeamFirst);
  RedrawPlayerList(null);
}

export function PlistMaxWidth(): number {
  G.plistCustomLayout = getdefault(S("playerlist"));
  if (G.plistCustomLayout) {
    plistWidth = PlistHeader(G.plistCustomLayout, FALSE);
  } else {
    plistWidth = 0;
  }
  if (plistWidth < 83) {
    plistWidth = 83;
  }
  return plistWidth;
}

export function RedrawPlayerList(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  if (!G.me || !W_IsMapped(G.playerw)) {
    return;
  }
  switch (G.plistStyle) {
  case 0:
    if (!G.plistCustomLayout) {
      plistLayout = S("");
      printf(S("??? empty plistLayout? This can't happen!\n"));
    } else {
      plistLayout = G.plistCustomLayout;
    }
    break;
  case 1:
    plistLayout = S("nTRNKWLr O D d ");
    break;
  case 2:
    plistLayout = S("nTR N  K lrSd");
    break;
  case 3:
    plistLayout = S("nTK  RNlr Sd");
    break;
  case 4:
    plistLayout = S("nTR N  K l M");
    break;
  default:
    fprintf(R.stderr, S("Unknown plistStyle %d in RedrawPlayerList().\n"), G.plistStyle);
    break;
  }
  W_ClearWindow(G.playerw);
  PlistHeader(plistLayout, TRUE);
  G.plistReorder = TRUE;
  G.plistUpdated = TRUE;
  for (i = 0; i < MAXPLAYER; ++i) {
    G.updatePlayer[i] = TRUE;
  }
  UpdatePlistFn();
}

export function UpdatePlistFn(): void {
  let count = 0;
  G.plistUpdated = FALSE;
  if (!W_IsMapped(G.playerw)) {
    return;
  }
  if (!G.plistReorder) {
    for (count = 0; count < MAXPLAYER; ++count) {
      if (!G.updatePlayer[count]) {
        continue;
      }
      G.updatePlayer[count] = FALSE;
      if ($sadd(G.players, count).p_status !== PFREE) {
        PlistLine($sadd(G.players, count), plistPos[count]);
      }
    }
  } else {
    G.plistReorder = FALSE;
    if (G.sortPlayers) {
      WriteSortedPlist();
    } else {
      WriteUnsortedPlist();
    }
  }
}

function WriteSortedPlist(): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let row = 0;
  let i = 0;
  let last = 0;
  let current = null;
  let teamPos = new Int32Array(5);
  let pos = null;
  if (G.remap[G.me.p_team] !== WriteSortedPlist$myTeam) {
    WriteSortedPlist$myTeam = G.remap[G.me.p_team];
    for (pos = P(plistPos).add(MAXPLAYER).add(-1); pos.o >= P(plistPos).o; pos = pos.add(-1)) {
      pos.a[pos.o] = -1;
    }
  }
  if (!G.partitionPlist) {
    WriteSortedPlist$blankLine = -1;
    WriteSortedPlist$blankLine2 = -1;
  }
  for (i = NUMTEAM; i >= 0; --i) {
    teamPos[i] = 0;
  }
  for (current = $sadd($sadd(G.players, MAXPLAYER), -1); $sidx(current) >= $sidx(G.players); current = $sadd(current, -1)) {
    if (current.p_status !== PFREE) {
      ($t1 = teamPos, $t2 = G.remap[current.p_team], $t1[$t2] = $t1[$t2] + 1);
    }
  }
  last = 1;
  if (G.sortMyTeamFirst) {
    last += teamPos[WriteSortedPlist$myTeam];
    teamPos[WriteSortedPlist$myTeam] = last;
    if (G.partitionPlist) {
      if (WriteSortedPlist$blankLine !== last) {
        WriteSortedPlist$blankLine = last;
        W_ClearArea(G.playerw, 0, last, plistWidth, 1);
      }
      ++last;
    }
  }
  for (i = 1; i <= NUMTEAM; ++i) {
    if (i !== WriteSortedPlist$myTeam) {
      last += teamPos[i];
      teamPos[i] = last;
    }
  }
  if (!G.sortMyTeamFirst) {
    if (G.partitionPlist) {
      if (WriteSortedPlist$blankLine !== last) {
        WriteSortedPlist$blankLine = last;
        W_ClearArea(G.playerw, 0, last, plistWidth, 1);
      }
      ++last;
    }
    last += teamPos[WriteSortedPlist$myTeam];
    teamPos[WriteSortedPlist$myTeam] = last;
  }
  if (WriteSortedPlist$myTeam !== NOBODY) {
    if (G.partitionPlist) {
      if (WriteSortedPlist$blankLine2 !== last) {
        WriteSortedPlist$blankLine2 = last;
        W_ClearArea(G.playerw, 0, last, plistWidth, 1);
      }
      ++last;
    }
    last += teamPos[NOBODY];
    teamPos[NOBODY] = last;
  }
  for (row = last; row < WriteSortedPlist$plistLastRow; ++row) {
    W_ClearArea(G.playerw, 0, row, plistWidth, 1);
  }
  WriteSortedPlist$plistLastRow = last;
  for (i = MAXPLAYER - 1, current = $sadd($sadd(G.players, MAXPLAYER), -1); i >= 0; --i, current = $sadd(current, -1)) {
    if (current.p_status === PFREE) {
      G.updatePlayer[i] = FALSE;
      continue;
    }
    row = ($t3 = teamPos, $t4 = G.remap[current.p_team], $t3[$t4] = $t3[$t4] - 1);
    if (!G.updatePlayer[i] && plistPos[i] === row) {
      continue;
    }
    plistPos[i] = row;
    G.updatePlayer[i] = FALSE;
    PlistLine(current, row);
  }
}

function WriteUnsortedPlist(): void {
  let count = 0;
  let pos = 0;
  if (G.remap[G.me.p_team] !== WriteUnsortedPlist$myTeam) {
    WriteUnsortedPlist$myTeam = G.remap[G.me.p_team];
    for (count = 0; count < MAXPLAYER; ++count) {
      G.updatePlayer[count] = TRUE;
    }
  }
  for (count = 0; count < MAXPLAYER; ++count) {
    if (!G.updatePlayer[count]) {
      continue;
    }
    G.updatePlayer[count] = FALSE;
    pos = count + 1;
    plistPos[count] = pos;
    if ($sadd(G.players, count).p_status !== PFREE) {
      PlistLine($sadd(G.players, count), pos);
    } else {
      W_ClearArea(G.playerw, 0, pos, plistWidth, 1);
    }
  }
}

function PlistHeader(layout: Ptr | null, doWrite: number): number {
  let header = new Int8Array(8192);
  let num = 0;
  for (; layout.a[layout.o]; layout = layout.add(1)) {
    if (num + MaxPlistField >= BUFSIZ) {
      fprintf(R.stderr, S("Playerlist truncated to fit buffer.\n"));
      layout = null;
      break;
    }
    switch (layout.a[layout.o]) {
    case 110:
      memccpy(P(header, num), S(" No"), 0, 3);
      num += 3;
      break;
    case 84:
      memccpy(P(header, num), S(" Ty"), 0, 3);
      num += 3;
      break;
    case 67:
      memccpy(P(header, num), S(" Rank"), 0, 5);
      num += 5;
      break;
    case 82:
      memccpy(P(header, num), S(" Rank      "), 0, 11);
      num += 11;
      break;
    case 78:
      memccpy(P(header, num), S(" Name            "), 0, 17);
      num += 17;
      break;
    case 75:
      memccpy(P(header, num), S(" Kills"), 0, 6);
      num += 6;
      break;
    case 108:
      memccpy(P(header, num), S(" Login           "), 0, 17);
      num += 17;
      break;
    case 79:
      memccpy(P(header, num), S(" Offse"), 0, 6);
      num += 6;
      break;
    case 87:
      memccpy(P(header, num), S("  Wins"), 0, 6);
      num += 6;
      break;
    case 68:
      memccpy(P(header, num), S(" Defse"), 0, 6);
      num += 6;
      break;
    case 76:
      memccpy(P(header, num), S("  Loss"), 0, 6);
      num += 6;
      break;
    case 83:
      memccpy(P(header, num), S(" Stats"), 0, 6);
      num += 6;
      break;
    case 114:
      memccpy(P(header, num), S(" Ratio"), 0, 6);
      num += 6;
      break;
    case 100:
      memccpy(P(header, num), S("      DI"), 0, 8);
      num += 8;
      break;
    case 32:
      header[num] = 32;
      num += 1;
      break;
    case 66:
      memccpy(P(header, num), S(" Bmbng"), 0, 6);
      num += 6;
      break;
    case 98:
      memccpy(P(header, num), S(" Bmbed"), 0, 6);
      num += 6;
      break;
    case 80:
      memccpy(P(header, num), S(" Plnts"), 0, 6);
      num += 6;
      break;
    case 112:
      memccpy(P(header, num), S(" Plnts"), 0, 6);
      num += 6;
      break;
    case 77:
      memccpy(P(header, num), S(" Host Machine    "), 0, 17);
      num += 17;
      break;
    case 72:
      memccpy(P(header, num), S(" Hours "), 0, 7);
      num += 7;
      break;
    case 107:
      memccpy(P(header, num), S(" Max K"), 0, 6);
      num += 6;
      break;
    case 86:
      memccpy(P(header, num), S("   KPH"), 0, 6);
      num += 6;
      break;
    case 118:
      memccpy(P(header, num), S("   DPH"), 0, 6);
      num += 6;
      break;
    default:
      fprintf(R.stderr, S("%c is not an option for the playerlist\n"), layout.a[layout.o]);
      break;
    }
  }
  header[num] = 0;
  if (doWrite) {
    W_WriteText(G.playerw, 0, 0, G.textColor, P(header), num, G.W_RegularFont);
  }
  return num;
}

function PlistLine(j: struct_player | null, pos: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any;
  let buf = new Int8Array(8192);
  let ptr = null;
  let buffPoint = null;
  let kills = 0;
  let losses = 0;
  let my_ticks = 0;
  let pRating = 0;
  let oRating = 0;
  let dRating = 0;
  let bRating = 0;
  let Ratings = 0;
  let KillsPerHour = 0;
  let LossesPerHour = 0;
  let ratio = 0;
  let max_kills = 0;
  if (j.p_ship.s_type === STARBASE) {
    kills = j.p_stats.st_sbkills;
    losses = j.p_stats.st_sblosses;
    max_kills = j.p_stats.st_sbmaxkills;
    if (G.SBhours) {
      my_ticks = j.p_stats.st_sbticks;
    } else {
      my_ticks = j.p_stats.st_tticks;
    }
    KillsPerHour = (my_ticks === 0 ? 1 : 0) ? 0 : kills * 36000 / my_ticks;
    LossesPerHour = (my_ticks === 0 ? 1 : 0) ? 0 : losses * 36000 / my_ticks;
  } else {
    kills = j.p_stats.st_kills + j.p_stats.st_tkills;
    losses = j.p_stats.st_losses + j.p_stats.st_tlosses;
    max_kills = j.p_stats.st_maxkills;
    my_ticks = j.p_stats.st_tticks;
    KillsPerHour = (my_ticks === 0 ? 1 : 0) ? 0 : j.p_stats.st_tkills * 36000 / my_ticks;
    LossesPerHour = (my_ticks === 0 ? 1 : 0) ? 0 : j.p_stats.st_tlosses * 36000 / my_ticks;
  }
  if (losses === 0) {
    ratio = kills;
  } else {
    ratio = kills / losses;
  }
  if (!j.p_stats.st_tticks) {
    oRating = pRating = bRating = Ratings = 0;
    dRating = j.p_stats.st_tticks * G.status.losses / (j.p_stats.st_tlosses !== 0 ? j.p_stats.st_tlosses * G.status.timeprod : G.status.timeprod);
  } else {
    oRating = j.p_stats.st_tkills * G.status.timeprod / (j.p_stats.st_tticks * G.status.kills);
    pRating = j.p_stats.st_tplanets * G.status.timeprod / (j.p_stats.st_tticks * G.status.planets);
    bRating = j.p_stats.st_tarmsbomb * G.status.timeprod / (j.p_stats.st_tticks * G.status.armsbomb);
    Ratings = oRating + pRating + bRating;
    dRating = j.p_stats.st_tticks * G.status.losses / (j.p_stats.st_tlosses !== 0 ? j.p_stats.st_tlosses * G.status.timeprod : G.status.timeprod);
    if (j.p_ship.s_type === STARBASE && G.SBhours) {
      oRating = KillsPerHour;
      dRating = LossesPerHour;
    }
  }
  buffPoint = P(buf);
  for (ptr = plistLayout; ptr.a[ptr.o]; ptr = ptr.add(1)) {
    $wr(($t1 = buffPoint, buffPoint = $t1.add(1), $t1), 0, 32);
    switch (ptr.a[ptr.o]) {
    case 110:
      if (j.p_status !== PALIVE) {
        $wr(($t2 = buffPoint, buffPoint = $t2.add(1), $t2), 0, 32);
        $wr(($t3 = buffPoint, buffPoint = $t3.add(1), $t3), 0, G.shipnos.a[G.shipnos.o + j.p_no]);
      } else {
        $wr(($t4 = buffPoint, buffPoint = $t4.add(1), $t4), 0, G.teamlet[j.p_team]);
        $wr(($t5 = buffPoint, buffPoint = $t5.add(1), $t5), 0, G.shipnos.a[G.shipnos.o + j.p_no]);
      }
      break;
    case 84:
      if (j.p_status !== PALIVE) {
        $wr(($t6 = buffPoint, buffPoint = $t6.add(1), $t6), 0, 32);
        $wr(($t7 = buffPoint, buffPoint = $t7.add(1), $t7), 0, 32);
      } else {
        $wr(($t8 = buffPoint, buffPoint = $t8.add(1), $t8), 0, $rd(my_classes[j.p_ship.s_type]));
        $wr(($t9 = buffPoint, buffPoint = $t9.add(1), $t9), 0, $rd(my_classes[j.p_ship.s_type], 1));
      }
      break;
    case 67:
      format(buffPoint, j.p_stats.st_rank < G.nranks ? $sadd(G.ranks, j.p_stats.st_rank).cname : S(""), 4, 0);
      buffPoint = buffPoint.add(4);
      break;
    case 82:
      format(buffPoint, j.p_stats.st_rank < G.nranks ? $sadd(G.ranks, j.p_stats.st_rank).name : S(""), 10, 0);
      buffPoint = buffPoint.add(10);
      break;
    case 78:
      format(buffPoint, P(j.p_name), 16, 0);
      buffPoint = buffPoint.add(16);
      break;
    case 75:
      if (j.p_kills === 0) {
        format(buffPoint, S("     "), 5, 0);
      } else {
        if (j.p_kills > 100) {
          ftoa(j.p_kills, buffPoint.add(-1), 0, 3, 2);
        } else {
          ftoa(j.p_kills, buffPoint, 0, 2, 2);
        }
      }
      buffPoint = buffPoint.add(5);
      break;
    case 108:
      format(buffPoint, P(j.p_login), 16, 0);
      buffPoint = buffPoint.add(16);
      break;
    case 79:
      ftoa(oRating, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 87:
      itoapad(kills, buffPoint, 0, 5);
      buffPoint = buffPoint.add(5);
      break;
    case 68:
      ftoa(dRating, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 76:
      itoapad(losses, buffPoint, 0, 5);
      buffPoint = buffPoint.add(5);
      break;
    case 83:
      ftoa(Ratings, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 114:
      ftoa(ratio, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 100:
      ftoa(Ratings * (j.p_stats.st_tticks / 36000), buffPoint, 0, 4, 2);
      buffPoint = buffPoint.add(7);
      break;
    case 32:
      break;
    case 66:
      ftoa(bRating, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 98:
      itoapad(j.p_stats.st_tarmsbomb + j.p_stats.st_armsbomb, buffPoint, 0, 5);
      buffPoint = buffPoint.add(5);
      break;
    case 80:
      ftoa(pRating, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 112:
      itoapad(j.p_stats.st_tplanets + j.p_stats.st_planets, buffPoint, 0, 5);
      buffPoint = buffPoint.add(5);
      break;
    case 77:
      format(buffPoint, P(j.p_monitor), 16, 0);
      buffPoint = buffPoint.add(16);
      break;
    case 72:
      ftoa(my_ticks / 36000, buffPoint, 0, 3, 2);
      buffPoint = buffPoint.add(6);
      break;
    case 107:
      ftoa(max_kills, buffPoint, 0, 2, 2);
      buffPoint = buffPoint.add(5);
      break;
    case 86:
      ftoa(KillsPerHour, buffPoint, 0, 3, 1);
      buffPoint = buffPoint.add(5);
      break;
    case 118:
      ftoa(LossesPerHour, buffPoint, 0, 3, 1);
      buffPoint = buffPoint.add(5);
      break;
    default:
      break;
    }
  }
  buffPoint.a[buffPoint.o] = 0;
  W_WriteText(G.playerw, 0, pos, G.me === j || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === j.p_no ? G.myColor : G.shipCol[G.remap[j.p_team]], P(buf), buffPoint.o - P(buf).o | 0, G.me === j ? G.W_HighlightFont : !(G.me.p_team & (j.p_swar | j.p_hostile)) && !(j.p_team & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
}

export function $init(): void {
  G.partitionPlist = FALSE;
  G.plistCustomLayout = null;
  G.plistReorder = FALSE;
  G.plistStyle = 0;
  G.plistUpdated = FALSE;
  G.sortMyTeamFirst = FALSE;
  G.sortPlayers = TRUE;
  G.updatePlayer = new Int8Array(36);
  plistLayout = S("");
  plistPos = new Int32Array(36);
  plistWidth = 0;
  my_classes = [S("SC"),
S("DD"),
S("CA"),
S("BB"),
S("AS"),
S("SB"),
S("GA"),
S("??")];
  WriteSortedPlist$plistLastRow = -1;
  WriteSortedPlist$blankLine = -1;
  WriteSortedPlist$blankLine2 = -1;
  WriteSortedPlist$myTeam = -1;
  WriteUnsortedPlist$myTeam = -1;
}
