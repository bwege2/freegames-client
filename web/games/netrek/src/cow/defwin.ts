// @ts-nocheck
// COW 3.3.3 defwin.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { getdefault } from './defaults.ts';
import { W_MakeTextWindow, W_MapWindow, W_Mono, W_ResizeTextWindow, W_WriteText } from './x11window.ts';
import { anon_defwin_c_53, struct_def } from './structs.ts';
import { $sadd, $sarrOf, $u64, G, P, R, S, fprintf, sprintf, strlen } from '../rt/index.ts';
import { BOOL_DEF, BORDER, INDENT, INT_DEF, MAX_VLINES, NAME_WIDTH, SINT_DEF, STR_DEF } from './consts.ts';

let def_messages: any;
let itos$value: any;

function itos(v: number): Ptr | null {
  sprintf(P(itos$value), S("%d"), v);
  return P(itos$value);
}

function btoa(v: number): Ptr | null {
  if (v) {
    return S("on");
  } else {
    return S("off");
  }
}

export function showdef(): void {
  let i = 0;
  let j = 0;
  let x = 0;
  let y = 0;
  let xo = 0;
  let yo = 0;
  let max_desc = 0;
  let height = 1;
  let width = 1;
  let d = null;
  let val = null;
  G.name = getdefault(S("name"));
  G.keymap = getdefault(S("keymap"));
  G.ckeymap = getdefault(S("ckeymap"));
  G.plist = getdefault(S("playerlist"));
  G.cloak_chars = P(G.cloakChars);
  G.bmap = getdefault(S("buttonmap"));
  if (!G.defWin) {
    G.defWin = W_MakeTextWindow(S("xtrekrc_help"), 1, 100, 174, 41, null, BORDER);
  }
  for (i = 0, d = def_messages[0]; $u64(i) < Math.trunc(11424 / 272); ++i, d = $sadd(d, 1)) {
    x = xo;
    y = yo;
    W_WriteText(G.defWin, x, y, G.W_Yellow, d.name, strlen(d.name) | 0, G.W_HighlightFont);
    x += NAME_WIDTH;
    W_WriteText(G.defWin, x, y, G.textColor, d.desc, strlen(d.desc) | 0, G.W_RegularFont);
    if (strlen(d.desc) > $u64(max_desc)) {
      max_desc = strlen(d.desc) | 0;
      width = width > x + max_desc ? width : x + max_desc;
    }
    ++y;
    x = xo + INDENT;
    if (d.type !== STR_DEF) {
      if (!d.values[0].desc && d.variable) {
        if (d.type === SINT_DEF) {
          val = itos(d.variable.a[d.variable.o]);
        } else {
          val = itos(d.values[0].i_value);
        }
        W_WriteText(G.defWin, x, y, G.W_Green, val, strlen(val) | 0, G.W_RegularFont);
        ++y;
      }
      for (j = 0; d.values[j].desc; ++j) {
        switch (d.type) {
        case 0:
          val = itos(d.values[j].i_value);
          if (d.values[j].i_value === d.variable.a[d.variable.o]) {
            W_WriteText(G.defWin, x, y, G.W_Green, val, strlen(val) | 0, G.W_HighlightFont);
            if (W_Mono()) {
              W_WriteText(G.defWin, x + 1, y, G.W_Green, S("*"), 1, G.W_RegularFont);
            }
          } else {
            W_WriteText(G.defWin, x, y, G.textColor, val, strlen(val) | 0, G.W_RegularFont);
          }
          x = xo + NAME_WIDTH;
          W_WriteText(G.defWin, x, y, G.textColor, d.values[j].desc, strlen(d.values[j].desc) | 0, G.W_RegularFont);
          ++y;
          x = xo + INDENT;
          break;
        case 1:
          val = btoa(d.variable.a[d.variable.o]);
          W_WriteText(G.defWin, x, y, G.W_Green, val, strlen(val) | 0, G.W_RegularFont);
          ++y;
          x = xo + INDENT;
          break;
        default:
          fprintf(R.stderr, S("Unknown type.\n"));
          break;
        }
      }
    } else if (d.variable && d.variable.a[d.variable.o]) {
      W_WriteText(G.defWin, x, y, G.W_Green, d.variable.a[d.variable.o], strlen(d.variable.a[d.variable.o]) | 0, G.W_RegularFont);
      ++y;
    }
    height = height > y ? height : y;
    if (y > MAX_VLINES) {
      yo = 0;
      xo += NAME_WIDTH + max_desc + 2;
      max_desc = 0;
    } else {
      yo = y + 1;
    }
  }
  W_ResizeTextWindow(G.defWin, width, height);
  W_MapWindow(G.defWin);
}

export function $init(): void {
  G.name = null;
  G.cloak_chars = null;
  G.bmap = null;
  G.keymap = null;
  G.plist = null;
  G.ckeymap = null;
  def_messages = $sarrOf([struct_def.$of(S("extraAlertBorder"), BOOL_DEF, S("Show alert on local border"), P(G, "extraBorder"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("keepPeace"), BOOL_DEF, S("Stay peaceful when reborn"), P(G, "keeppeace"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("keepInfo"), SINT_DEF, S("No. of updates to keep info windows"), P(G, "keepInfo"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("netStatFreq"), SINT_DEF, S("Frequency of updates to calc lag"), P(G, "netstatfreq"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("enemyPhasers"), SINT_DEF, S("Width of enemy phasers"), P(G, "enemyPhasers"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("netStats"), BOOL_DEF, S("Lag stats and lag meter display"), P(G, "netstat"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("warnHull"), BOOL_DEF, S("Warn hull state based on damage"), P(G, "vary_hull"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("varyShields"), BOOL_DEF, S("Vary shields base on damage"), P(G, "VShieldBitmaps"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("warnShields"), BOOL_DEF, S("Shiild color based on alert status"), P(G, "warnShields"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("newPlist"), BOOL_DEF, S("Show new player list"), P(G, "newPlist"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("reportKills"), BOOL_DEF, S("Report kill messages"), P(G, "reportKills"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("showGalactic"), INT_DEF, S("Galactic planet bitmaps"), P(G, "showgalactic"), $sarrOf([anon_defwin_c_53.$of(0, null, S("show nothing on galactic map")),
anon_defwin_c_53.$of(1, null, S("show owner on galactic map")),
anon_defwin_c_53.$of(2, null, S("show standard resources on galactic map")),
anon_defwin_c_53.$of(3, null, S("show MOO resources on galactic map")),
anon_defwin_c_53.$of(4, null, S("show rabbit ears on galactic map")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("showLocal"), INT_DEF, S("Local planet bitmaps"), P(G, "showlocal"), $sarrOf([anon_defwin_c_53.$of(0, null, S("show nothing on local map")),
anon_defwin_c_53.$of(1, null, S("show owner on local map")),
anon_defwin_c_53.$of(2, null, S("show standard resources on local map")),
anon_defwin_c_53.$of(3, null, S("show MOO resources on local map")),
anon_defwin_c_53.$of(4, null, S("show rabbit ears on local map")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("showLock"), INT_DEF, S("Lock display for planets/players"), P(G, "showLock"), $sarrOf([anon_defwin_c_53.$of(0, null, S("don't show lock")),
anon_defwin_c_53.$of(1, null, S("show lock on galactic only")),
anon_defwin_c_53.$of(2, null, S("show lock on tactical only")),
anon_defwin_c_53.$of(3, null, S("show lock on both")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("name"), STR_DEF, S("Default player name"), P(G, "name"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("keymap"), STR_DEF, S("Keyboard map"), P(G, "keymap"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("ckeymap"), STR_DEF, S("Control keyboard map"), P(G, "ckeymap"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("buttonmap"), STR_DEF, S("Mouse button map"), P(G, "bmap"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("cloakChars"), STR_DEF, S("Cloak chars for map"), P(G, "cloak_chars"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("playerListStyle"), INT_DEF, S("The style for the playerlist"), P(G, "plistStyle"), $sarrOf([anon_defwin_c_53.$of(0, null, S("Custom player list")),
anon_defwin_c_53.$of(1, null, S("Old Player List")),
anon_defwin_c_53.$of(2, null, S("COW Player List")),
anon_defwin_c_53.$of(3, null, S("Kill Watch Player List")),
anon_defwin_c_53.$of(4, null, S("BRMH Player List")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("playerlist"), STR_DEF, S("What to show on custom player list"), P(G, "plistCustomLayout"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("partitionPlist"), BOOL_DEF, S("Use blank space in player list"), P(G, "partitionPlist"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("showPlanetNames"), BOOL_DEF, S("Show names on map/local"), P(G, "namemode"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("showTractorPressor"), BOOL_DEF, S("Show my tract/press"), P(G, "showTractorPressor"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("continuetractor"), BOOL_DEF, S("Keep showing tract/press"), P(G, "continuetractor"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("tryShort"), BOOL_DEF, S("Try SHORT-PACKETS at startup"), P(G, "tryShort1"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("tryUdp"), BOOL_DEF, S("Try UDP automatically"), P(G, "tryUdp1"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("udpClientReceive"), INT_DEF, S("UDP receive mode"), P(G, "udpClientRecv"), $sarrOf([anon_defwin_c_53.$of(0, null, S("TCP only")),
anon_defwin_c_53.$of(1, null, S("simple UDP")),
anon_defwin_c_53.$of(2, null, S("fat UDP")),
anon_defwin_c_53.$of(3, null, S("double UDP (obsolete)")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("udpClientSend"), INT_DEF, S("UDP send mode"), P(G, "udpClientSend"), $sarrOf([anon_defwin_c_53.$of(0, null, S("TCP only")),
anon_defwin_c_53.$of(1, null, S("simple UDP")),
anon_defwin_c_53.$of(2, null, S("enforced UDP (state only)")),
anon_defwin_c_53.$of(3, null, S("enforced UDP (state & weapon)")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("udpSequenceCheck"), BOOL_DEF, S("UDP sequence checking"), P(G, "udpSequenceChk"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("newdashboard"), INT_DEF, S("Use new dashboard"), P(G, "newDashboard"), $sarrOf([anon_defwin_c_53.$of(0, null, S("Text dashboard")),
anon_defwin_c_53.$of(1, null, S("COW style dashboard")),
anon_defwin_c_53.$of(2, null, S("KRP style dashboard")),
anon_defwin_c_53.$of(3, null, S("LABs new dashboard")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("lite"), BOOL_DEF, S("Use message highlighting"), P(G, "UseLite"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("DefLite"), BOOL_DEF, S("Use default lites"), P(G, "DefLite"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("newDistress"), BOOL_DEF, S("Use new distress call"), P(G, "UseNewDistress"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("rejectMacro"), BOOL_DEF, S("Reject macros"), P(G, "rejectMacro"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("showIND"), BOOL_DEF, S("Show independent planets w/X"), P(G, "showIND"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("ignoreSignals"), BOOL_DEF, S("Ignore SIGSEGV and SIGBUS"), P(G, "ignore_signals"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("continuousMouse"), BOOL_DEF, S("Continuous mouse input"), P(G, "motion_mouse"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("motionThresh"), SINT_DEF, S("Threshold for above"), P(G, "user_motion_thresh"), $sarrOf([anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("ignoreCaps"), BOOL_DEF, S("Ignore the Capslock key"), P(G, "ignoreCaps"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("shiftedMouse"), BOOL_DEF, S("More mouse buttons with shift"), P(G, "extended_mouse"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()])),
struct_def.$of(S("useTNGBitmaps"), BOOL_DEF, S("Use next generation bitmaps"), P(G, "use_tng_fed_bitmaps"), $sarrOf([anon_defwin_c_53.$of(0, null, S("")),
anon_defwin_c_53.$of(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53(),
new anon_defwin_c_53()]))]);
  itos$value = new Int8Array(10);
}
