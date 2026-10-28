// @ts-nocheck
// COW 3.3.3 option.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { showdef } from './defwin.ts';
import { showdocs, showxtrekrc } from './docwin.ts';
import { nswindow } from './netstatopt.ts';
import { redrawPStats } from './pingstats.ts';
import { RedrawPlayerList } from './playerlist.ts';
import { rotate_coord, rotate_dir } from './rotate.ts';
import { sendOptionsPacket, sendUpdatePacket } from './socket.ts';
import { soundwindow } from './sound.ts';
import { spwindow } from './spopt.ts';
import { udpwindow } from './udpopt.ts';
import { W_Beep, W_DefineArrowCursor, W_IsMapped, W_MakeMenu, W_MapWindow, W_SetWindowButtonHandler, W_SetWindowKeyDownHandler, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event, struct_int_range, struct_option, struct_option_menu } from './structs.ts';
import { $cast, $peq, $rd, $sadd, $sarrOf, $wr, G, P, R, S, __ctype_b_loc, fprintf, perror, sprintf, strcat, strcpy, strlen, toupper } from '../rt/index.ts';
import { BORDER, GWIDTH, MAXPLANETS, MAXPLAYER, NO_BG_PIX, NO_CLK_PIX, NO_EXP_PIX, NO_FED_PIX, NO_HALOS, NO_IND_PIX, NO_KLI_PIX, NO_MAP_PIX, NO_ORI_PIX, NO_ROM_PIX, NO_WEP_PIX, OPTIONBORDER, OPTIONLEN, PALIVE, PLISTLASTSTYLE, TWINSIDE, W_EV_BUTTON, W_EV_KEY, W_LBUTTON, W_MBUTTON, W_RBUTTON, _IScntrl, _ISlower, _ISspace } from './consts.ts';

let old_rotate: number;
let old_rotate_deg: number;
let newkeys: any;
let lockoptions: any;
let plistoptions: any;
let dashboardoptions: any;
let phaserdispmess: any;
let phaserstatmess: any;

export function optionwindow(): void {
  G.notdone = 1;
  $wr(P(newkeys), 0, 0);
  if (!G.FirstMenu) {
    G.MaxOptions = InitOptionMenus();
    if (G.MaxOptions < 0) {
      fprintf(R.stderr, S("InitOptionMenus() error %d!\n"), G.MaxOptions);
      G.notdone = 0;
      return;
    }
  }
  if (!G.optionWin) {
    G.optionWin = W_MakeMenu(S("option"), TWINSIDE + 10, -BORDER + 10, OPTIONLEN, G.MaxOptions, G.baseWin, OPTIONBORDER);
    W_SetWindowKeyDownHandler(G.optionWin, optionaction);
    W_SetWindowButtonHandler(G.optionWin, optionaction);
    W_DefineArrowCursor(G.optionWin);
    G.CurrentMenu = G.FirstMenu;
    RefreshOptions();
  }
  W_MapWindow(G.optionWin);
}

function RefreshOptions(): void {
  let i = 0;
  let option = null;
  if (G.notdone === 0 || !(option = G.CurrentMenu)) {
    return;
  }
  for (i = 0; i < option.numopt; ++i) {
    optionrefresh($sadd(option.menu, i));
  }
  if (option.numopt < G.MaxOptions) {
    for (i = option.numopt; i < G.MaxOptions; ++i) {
      OptionClear(i);
    }
  }
}

function OptionClear(i: number): void {
  let blanktext = S("                                               ");
  if (G.optionWin && G.notdone) {
    W_WriteText(G.optionWin, 0, i, G.textColor, blanktext, OPTIONLEN, null);
  }
}

export function optionredrawtarget(win: Ptr | null): void {
  let op = null;
  if (G.notdone === 0) {
    return;
  }
  for (op = G.CurrentMenu.menu; op.op_text; op = $sadd(op, 1)) {
    if (op.op_targetwin && $peq(win, op.op_targetwin.a[op.op_targetwin.o])) {
      optionrefresh(op);
      break;
    }
  }
}

export function optionredrawoption(ip: Ptr | null): void {
  let op = null;
  if (G.notdone === 0) {
    return;
  }
  for (op = G.CurrentMenu.menu; op.op_num >= 0; op = $sadd(op, 1)) {
    if ($peq(ip, op.op_option)) {
      optionrefresh(op);
      break;
    }
  }
}

function optionrefresh(op: struct_option | null): void {
  let on = 0;
  let buf = new Int8Array(8192);
  if (!op || G.notdone === 0) {
    return;
  }
  if (op.op_string) {
    sprintf(P(buf), op.op_text, op.op_string);
  } else if (op.op_array) {
    strcpy(P(buf), op.op_array.a[op.op_array.o + op.op_option.a[op.op_option.o]]);
  } else if (op.op_range) {
    sprintf(P(buf), op.op_text, op.op_option.a[op.op_option.o]);
  } else {
    if (op.op_option) {
      if (op.op_size) {
        on = !(op.op_option.a[op.op_option.o] & op.op_size) ? 1 : 0;
      } else {
        on = op.op_option.a[op.op_option.o];
      }
    } else if (op.op_targetwin) {
      on = W_IsMapped(op.op_targetwin.a[op.op_targetwin.o]);
    } else {
      on = 1;
    }
    if (!on) {
      strcpy(P(buf), S("Don't "));
    } else {
      buf[0] = 0;
    }
    strcat(P(buf), op.op_text);
  }
  if ($rd($rd(__ctype_b_loc()), buf[0]) & _ISlower) {
    buf[0] = toupper(buf[0]) << 24 >> 24;
  }
  W_WriteText(G.optionWin, 0, op.op_num, G.textColor, P(buf), strlen(P(buf)) | 0, null);
}

export function optionaction(data: struct_event | null): void {
  data = $cast(struct_event, data);
  let op = null;
  let i = 0;
  let cp = null;
  if (data.y >= G.CurrentMenu.numopt) {
    W_Beep();
    return;
  }
  if (G.notdone === 0) {
    return;
  }
  op = $sadd(G.CurrentMenu.menu, data.y);
  if (!op.op_string) {
    if (data.type === W_EV_KEY) {
      return;
    }
  } else {
    if (data.type === W_EV_BUTTON) {
      return;
    }
    switch (data.key) {
    case 8:
    case 127:
      cp = op.op_string;
      i = strlen(cp) | 0;
      if (i > 0) {
        cp = cp.add(i - 1);
        cp.a[cp.o] = 0;
      }
      break;
    case 23:
      cp = op.op_string;
      i = strlen(cp) | 0;
      while (--i >= 0 && $rd($rd(__ctype_b_loc()), cp.a[cp.o + i]) & _ISspace) {
        ;
      }
      ++i;
      while (--i >= 0 && !($rd($rd(__ctype_b_loc()), cp.a[cp.o + i]) & _ISspace)) {
        ;
      }
      ++i;
      cp.a[cp.o + i] = 0;
      break;
    case 21:
    case 24:
      op.op_string.a[op.op_string.o] = 0;
      break;
    default:
      if (data.key < 32 || data.key > 127) {
        break;
      }
      cp = op.op_string;
      i = strlen(cp) | 0;
      if (i < op.op_size - 1 && !($rd($rd(__ctype_b_loc()), data.key) & _IScntrl)) {
        cp = cp.add(i);
        cp.a[cp.o + 1] = 0;
        cp.a[cp.o] = data.key << 24 >> 24;
      } else {
        W_Beep();
      }
      break;
    }
  }
  if (op.op_array) {
    if (data.key === W_RBUTTON) {
      ++op.op_option.a[op.op_option.o];
      if ($rd(op.op_array.a[op.op_array.o + op.op_option.a[op.op_option.o]]) === 0) {
        op.op_option.a[op.op_option.o] = 0;
      }
    } else if (data.key === W_MBUTTON) {
      op.op_option.a[op.op_option.o] = 0;
    } else if (data.key === W_LBUTTON) {
      --op.op_option.a[op.op_option.o];
      if (op.op_option.a[op.op_option.o] < 0) {
        op.op_option.a[op.op_option.o] = 0;
        while ($rd(op.op_array.a[op.op_array.o + op.op_option.a[op.op_option.o]]) !== 0) {
          ++op.op_option.a[op.op_option.o];
        }
        --op.op_option.a[op.op_option.o];
      }
    }
    if ($peq(op.op_option, P(G, "plistStyle"))) {
      if (!G.plistCustomLayout && G.plistStyle === 0) {
        G.plistStyle = data.key === W_LBUTTON ? PLISTLASTSTYLE : 1;
      }
      RedrawPlayerList(null);
    } else if ($peq(op.op_option, P(G, "showgalactic"))) {
      G.redrawall = 1;
    } else if (G.rotate !== old_rotate) {
      let i = 0;
      let l = null;
      let j = null;
      G.redrawall = 1;
      G.reinitPlanets = 1;
      for (i = 0, l = G.planets; i < MAXPLANETS; ++i, l = $sadd(l, 1)) {
        if (G.rotate) {
          G.rotate_deg = -old_rotate_deg + G.rotate * 64;
          rotate_coord(P(l, "pl_x"), P(l, "pl_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          G.rotate_deg = G.rotate * 64;
        } else {
          G.rotate_deg = -old_rotate_deg;
          rotate_coord(P(l, "pl_x"), P(l, "pl_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          G.rotate_deg = 0;
        }
      }
      for (i = 0, j = G.players; i < MAXPLAYER; ++i, j = $sadd(j, 1)) {
        if (j.p_status !== PALIVE) {
          continue;
        }
        if (G.rotate) {
          G.rotate_deg = -old_rotate_deg + G.rotate * 64;
          rotate_coord(P(j, "p_x"), P(j, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(j, "p_dir"), G.rotate_deg);
          G.rotate_deg = G.rotate * 64;
        } else {
          G.rotate_deg = -old_rotate_deg;
          rotate_coord(P(j, "p_x"), P(j, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(j, "p_dir"), G.rotate_deg);
          G.rotate_deg = 0;
        }
      }
      old_rotate = G.rotate;
      old_rotate_deg = G.rotate_deg;
    }
  } else if (op.op_range) {
    if (data.key === W_RBUTTON) {
      op.op_option.a[op.op_option.o] += op.op_range.increment;
    } else if (data.key === W_MBUTTON) {
      op.op_option.a[op.op_option.o] = op.op_range.min_value;
    } else if (data.key === W_LBUTTON) {
      op.op_option.a[op.op_option.o] -= op.op_range.increment;
    }
    if (op.op_option.a[op.op_option.o] > op.op_range.max_value) {
      op.op_option.a[op.op_option.o] = op.op_range.min_value;
    }
    if (op.op_option.a[op.op_option.o] < op.op_range.min_value) {
      op.op_option.a[op.op_option.o] = op.op_range.max_value;
    }
    if ($peq(op.op_option, P(G, "client_ups"))) {
      switch (data.key) {
      case 1:
        switch (op.op_option.a[op.op_option.o]) {
        case 9:
          op.op_option.a[op.op_option.o] = 5;
          break;
        case 24:
          op.op_option.a[op.op_option.o] = 10;
          break;
        case 49:
          op.op_option.a[op.op_option.o] = 25;
          break;
        }
        break;
      case 2:
        op.op_option.a[op.op_option.o] = 5;
        break;
      case 3:
        switch (op.op_option.a[op.op_option.o]) {
        case 6:
          op.op_option.a[op.op_option.o] = 10;
          break;
        case 11:
          op.op_option.a[op.op_option.o] = 25;
          break;
        case 26:
          op.op_option.a[op.op_option.o] = 50;
          break;
        }
        break;
      }
      if (G.client_ups !== G.server_ups) {
        sendUpdatePacket(1000000 / G.client_ups | 0);
      }
    }
  } else if (op.op_option && op.op_size) {
    if (!(G.pixMissing & op.op_size)) {
      op.op_option.a[op.op_option.o] ^= op.op_size;
      if (op.op_size & (NO_MAP_PIX | NO_BG_PIX | NO_HALOS)) {
        G.redrawall = 1;
      }
    }
  } else if (op.op_option) {
    op.op_option.a[op.op_option.o] = !op.op_option.a[op.op_option.o] ? 1 : 0;
    if ($peq(op.op_option, P(G, "showPlanetOwner"))) {
      G.redrawall = 1;
    } else if ($peq(op.op_option, P(G, "partitionPlist"))) {
      RedrawPlayerList(null);
    } else if ($peq(op.op_option, P(G, "sortPlayers"))) {
      RedrawPlayerList(null);
    } else if ($peq(op.op_option, P(G, "sortMyTeamFirst"))) {
      RedrawPlayerList(null);
    }
  }
  if (op.op_targetwin) {
    if (W_IsMapped(op.op_targetwin.a[op.op_targetwin.o])) {
      W_UnmapWindow(op.op_targetwin.a[op.op_targetwin.o]);
    } else {
      W_MapWindow(op.op_targetwin.a[op.op_targetwin.o]);
      if ($peq(op.op_targetwin.a[op.op_targetwin.o], G.udpWin)) {
        udpwindow();
      }
      if ($peq(op.op_targetwin.a[op.op_targetwin.o], G.pStats)) {
        redrawPStats(null);
      }
      if ($peq(op.op_targetwin.a[op.op_targetwin.o], G.netstatWin)) {
        nswindow();
      }
      if ($peq(op.op_targetwin.a[op.op_targetwin.o], G.spWin)) {
        spwindow();
      }
      if (G.defWin && $peq(op.op_targetwin.a[op.op_targetwin.o], G.defWin)) {
        showdef();
      }
      if ($peq(op.op_targetwin.a[op.op_targetwin.o], G.soundWin)) {
        soundwindow();
      }
      if (G.docwin && $peq(op.op_targetwin.a[op.op_targetwin.o], G.docwin)) {
        showdocs(0);
      }
      if (G.xtrekrcwin && $peq(op.op_targetwin.a[op.op_targetwin.o], G.xtrekrcwin)) {
        showxtrekrc(0);
      }
    }
  }
  if (G.MenuPage !== G.CurrentMenu.page_num) {
    SetMenuPage(G.MenuPage);
    RefreshOptions();
  } else if (G.notdone) {
    optionrefresh(op);
  } else {
    optionrefresh(op);
    optiondone();
  }
  return;
}

export function SetMenuPage(pagenum: number): void {
  if (!!G.FirstMenu) {
    for (G.CurrentMenu = G.FirstMenu; !!G.CurrentMenu.Next && G.CurrentMenu.page_num !== pagenum; G.CurrentMenu = G.CurrentMenu.Next) {
      ;
    }
  }
}

export function optiondone(): void {
  let str = null;
  W_UnmapWindow(G.optionWin);
  for (str = P(newkeys); str.a[str.o] !== 0; str = str.add(2)) {
    if (str.a[str.o] >= 32 && str.a[str.o] < 127 || str.a[str.o] === 79) {
      if ($rd(str.add(1)) === 0) {
        break;
      }
      G.mystats.st_keymap[str.a[str.o] - 32] = $rd(str.add(1)) & 0xff;
    }
    if ($rd(str.add(1)) === 0) {
      break;
    }
  }
  $wr(P(newkeys), 0, 0);
  sendOptionsPacket();
}

function InitOptionMenus(): number {
  let i = 1;
  let maxopts = 0;
  AddOptMenu(G.Control_Menu[0], 0);
  AddOptMenu(G.Ship_Menu[0], 0);
  AddOptMenu(G.Planet_Menu[0], 0);
  AddOptMenu(G.Visual_Menu[0], 0);
  AddOptMenu(G.Window_Menu[0], 0);
  AddOptMenu(G.Pixmap_Menu[0], 0);
  for (i = 0, G.CurrentMenu = G.FirstMenu; !!G.CurrentMenu; ++i, G.CurrentMenu = G.CurrentMenu.Next) {
    G.CurrentMenu.page_num = i;
    if (G.CurrentMenu.numopt > maxopts) {
      maxopts = G.CurrentMenu.numopt;
    }
  }
  G.CurrentMenu = G.FirstMenu;
  G.Menus_Range.max_value = i - 1;
  return maxopts;
}

function AddOptMenu(NewMenu: struct_option | null, updated: number): void {
  let menuptr = null;
  let newmenu = null;
  let i = 0;
  menuptr = G.FirstMenu;
  newmenu = new struct_option_menu();
  if (!newmenu) {
    perror(S("Malloc Error adding a menu"));
    return;
  }
  if (!G.FirstMenu) {
    G.FirstMenu = newmenu;
  } else {
    for (i = 0, menuptr = G.FirstMenu; !!menuptr.Next; menuptr = menuptr.Next) {
      ++i;
    }
    menuptr.Next = newmenu;
  }
  newmenu.page_num = i;
  newmenu.Next = null;
  newmenu.numopt = NumOptions(NewMenu);
  newmenu.menu = NewMenu;
  newmenu.updated = updated;
}

function NumOptions(OpMenu: struct_option | null): number {
  let i = 0;
  let ptr = null;
  for (ptr = OpMenu, i = 0; ptr.op_num !== -1; ++i, ptr = $sadd(ptr, 1)) {
    ptr.op_num = i;
  }
  return i;
}

export function UpdateOptions(): void {
  if (G.notdone === 0) {
    return;
  }
  if (G.CurrentMenu.updated) {
    RefreshOptions();
  }
}

export function $init(): void {
  G.notdone = 0;
  old_rotate = 0;
  old_rotate_deg = 0;
  newkeys = new Int8Array(14);
  G.localmes = [S("Show nothing on local planets"),
S("Show owner on local planets"),
S("Show resources on local planets"),
S("Show MOO resources on local map"),
S("Show rabbit ears on local map"),
S("")];
  G.galacticmes = [S("Show nothing on galactic map"),
S("Show owner on galactic map"),
S("Show resources on galactic map"),
S("Show MOO resources on galactic map"),
S("Show rabbit ears on galactic map"),
S("")];
  G.rotatemess = [S("Don't rotate galaxy"),
S("Rotate galaxy 90 degrees"),
S("Rotate galaxy 180 degrees"),
S("Rotate galaxy 270 degrees"),
S("")];
  lockoptions = [S("Don't show lock icon"),
S("Show lock icon on galactic map only"),
S("Show lock icon on tactical map only"),
S("Show lock icon on both map windows"),
S("")];
  plistoptions = [S("Custom player list"),
S("Old Player List"),
S("COW Player List"),
S("Kill Watch Player List"),
S("BRMH Player List"),
S("")];
  dashboardoptions = [S("Text dashboard"),
S("COW style dashboard"),
S("KRP style dashboard"),
S("LABs new dashboard"),
S("")];
  phaserdispmess = [S("Don't log phaser hits"),
S("Log phasers on all window"),
S("Log phasers on team window"),
S("Log phasers on indiv window"),
S("Log phasers on kill window"),
S("Log phasers on review window"),
S("")];
  phaserstatmess = [S("Don't show phaser statistics"), S("Show phaser statistics"), S("")];
  G.FirstMenu = null;
  G.CurrentMenu = null;
  G.MenuPage = 0;
  G.MaxOptions = 0;
  G.MenuPages = struct_int_range.$of(0, 1, 1);
  G.client_ups_range = struct_int_range.$of(1, 50, 1);
  G.redraw_updates_range = struct_int_range.$of(0, 5, 1);
  G.phaserShrinkRng = struct_int_range.$of(0, 16, 1);
  G.Menus_Range = struct_int_range.$of(0, 1, 1);
  G.keepInfo_range = struct_int_range.$of(0, 100, 1);
  G.enPhasRng = struct_int_range.$of(0, 10, 1);
  G.Ship_Menu = $sarrOf([struct_option.$of(0, S("Ship Menu"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Page %d (click to change)"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("use ROMVLVS bitmap"), P(G, "ROMVLVS")),
struct_option.$of(1, S("use fed TNG bitmaps"), P(G, "use_tng_fed_bitmaps")),
struct_option.$of(1, S("vary shields bitmap"), P(G, "VShieldBitmaps")),
struct_option.$of(1, S("use warning shields"), P(G, "warnShields")),
struct_option.$of(1, S("warn hull"), P(G, "vary_hull")),
struct_option.$of(1, S("show tractor/pressor beams"), P(G, "showTractorPressor")),
struct_option.$of(1, S("show tractors after lock "), P(G, "continuetractor")),
struct_option.$of(1, S("enemy phaser width: %d"), P(G, "enemyPhasers"), null, null, 0, null, G.enPhasRng),
struct_option.$of(1, S("shrink my phaser by %d/16"), P(G, "phaserShrink"), null, null, 0, null, G.phaserShrinkRng),
struct_option.$of(1, S("shrink their phasers by %d/16"), P(G, "theirPhaserShrink"), null, null, 0, null, G.phaserShrinkRng),
struct_option.$of(1, S("shrink phasers on a miss"), P(G, "shrinkPhaserOnMiss")),
struct_option.$of(1, S("done"), P(G, "notdone")),
struct_option.$of(-1)]);
  G.Planet_Menu = $sarrOf([struct_option.$of(0, S("Planet Menu"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Page %d (click to change)"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S(""), P(G, "showlocal"), null, null, 0, P(G.localmes)),
struct_option.$of(1, S("Show planet names on local"), P(G, "namemode")),
struct_option.$of(1, S(""), P(G, "showgalactic"), null, null, 0, P(G.galacticmes)),
struct_option.$of(1, S("Show owner on galactic"), P(G, "showPlanetOwner")),
struct_option.$of(10, S("show IND planets"), P(G, "showIND")),
struct_option.$of(1, S(""), P(G, "showLock"), null, null, 0, P(lockoptions)),
struct_option.$of(1, S(""), P(G, "rotate"), null, null, 0, P(G.rotatemess)),
struct_option.$of(1, S("done"), P(G, "notdone")),
struct_option.$of(-1)]);
  G.Control_Menu = $sarrOf([struct_option.$of(0, S("Control Menu"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Page %d (click to change)"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("stay peaceful when reborn"), P(G, "keeppeace")),
struct_option.$of(1, S("use new distress"), P(G, "UseNewDistress")),
struct_option.$of(1, S("new keymap entries: %s"), null, null, P(newkeys), 13),
struct_option.$of(1, S("ignore the capslock key"), P(G, "ignoreCaps")),
struct_option.$of(1, S("%d updates per second"), P(G, "client_ups"), null, null, 0, null, G.client_ups_range),
struct_option.$of(1, S("%d 1/10 sec screen refresh delay"), P(G, "redrawDelay"), null, null, 0, null, G.redraw_updates_range),
struct_option.$of(1, S("avoid message kludge"), P(G, "niftyNewMessages")),
struct_option.$of(1, S("show shell tools window"), null, P(G, "toolsWin")),
struct_option.$of(1, S("show sound control window"), null, P(G, "soundWin")),
struct_option.$of(1, S("show UDP control window"), null, P(G, "udpWin")),
struct_option.$of(1, S("show ping stats window"), null, P(G, "pStats")),
struct_option.$of(1, S("show network statistic window"), null, P(G, "netstatWin")),
struct_option.$of(1, S("show LagMeter "), null, P(G, "lMeter")),
struct_option.$of(1, S("show Short Packets window"), null, P(G, "spWin")),
struct_option.$of(1, S("done"), P(G, "notdone")),
struct_option.$of(-1)]);
  G.Window_Menu = $sarrOf([struct_option.$of(0, S("Info Menu"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Page %d (click to change)"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("show \"all\" message window"), null, P(G, "messwa")),
struct_option.$of(1, S("show \"team\" message window"), null, P(G, "messwt")),
struct_option.$of(1, S("show \"your\" message window"), null, P(G, "messwi")),
struct_option.$of(1, S("show \"kill\" message window"), null, P(G, "messwk")),
struct_option.$of(1, S("show \"total\" message window"), null, P(G, "reviewWin")),
struct_option.$of(1, S("show phaser log window"), P(G, "phaserWindow"), P(G, "phaserwin")),
struct_option.$of(1, S("show statistic window"), null, P(G, "statwin")),
struct_option.$of(1, S("show help window"), null, P(G, "helpWin")),
struct_option.$of(1, S("show xtrekrc defaults window"), null, P(G, "defWin")),
struct_option.$of(1, S("show xtrekrc"), null, P(G, "xtrekrcwin")),
struct_option.$of(1, S("show documentation window"), null, P(G, "docwin")),
struct_option.$of(1, S("done"), P(G, "notdone")),
struct_option.$of(-1)]);
  G.Visual_Menu = $sarrOf([struct_option.$of(0, S("Visuals Menu"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Page %d (click to change)"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S(""), P(G, "plistStyle"), null, null, 0, P(plistoptions)),
struct_option.$of(1, S("sort the playerlist"), P(G, "sortPlayers")),
struct_option.$of(1, S("put my team first in the list"), P(G, "sortMyTeamFirst")),
struct_option.$of(1, S("partition the playerlist"), P(G, "partitionPlist")),
struct_option.$of(1, S(""), P(G, "newDashboard"), null, null, 0, P(dashboardoptions)),
struct_option.$of(1, S("keep info %d upds (0=don't remove)"), P(G, "keepInfo"), null, null, 0, null, G.keepInfo_range),
struct_option.$of(1, S("use RCD highlighting"), P(G, "UseLite")),
struct_option.$of(1, S("show hockey lines"), P(G, "hockey_s_lines")),
struct_option.$of(1, S("alert on extra border(s)"), P(G, "extraBorder")),
struct_option.$of(1, S(""), P(G, "showPhaser"), null, null, 0, P(phaserdispmess)),
struct_option.$of(1, S(""), P(G, "phaserShowStats"), null, null, 0, P(phaserstatmess)),
struct_option.$of(1, S("done"), P(G, "notdone")),
struct_option.$of(-1)]);
  G.Pixmap_Menu = $sarrOf([struct_option.$of(0, S("Pixmap Menu"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Page %d (click to change)"), P(G, "MenuPage"), null, null, 0, null, G.Menus_Range),
struct_option.$of(1, S("Use IND pixmaps"), P(G, "pixFlags"), null, null, NO_IND_PIX),
struct_option.$of(1, S("Use FED pixmaps"), P(G, "pixFlags"), null, null, NO_FED_PIX),
struct_option.$of(1, S("Use ROM pixmaps"), P(G, "pixFlags"), null, null, NO_ROM_PIX),
struct_option.$of(1, S("Use KLI pixmaps"), P(G, "pixFlags"), null, null, NO_KLI_PIX),
struct_option.$of(1, S("Use ORI pixmaps"), P(G, "pixFlags"), null, null, NO_ORI_PIX),
struct_option.$of(1, S("Use weapon pixmaps"), P(G, "pixFlags"), null, null, NO_WEP_PIX),
struct_option.$of(1, S("Use explosion pixmaps"), P(G, "pixFlags"), null, null, NO_EXP_PIX),
struct_option.$of(1, S("Use cloaking pixmaps"), P(G, "pixFlags"), null, null, NO_CLK_PIX),
struct_option.$of(1, S("Use planet pixmaps on map"), P(G, "pixFlags"), null, null, NO_MAP_PIX),
struct_option.$of(1, S("Use background images"), P(G, "pixFlags"), null, null, NO_BG_PIX),
struct_option.$of(1, S("Halo by owner on galactic"), P(G, "pixFlags"), null, null, NO_HALOS),
struct_option.$of(1, S("done"), P(G, "notdone")),
struct_option.$of(-1)]);
}
