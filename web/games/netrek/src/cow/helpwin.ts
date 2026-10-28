// @ts-nocheck
// COW 3.3.3 helpwin.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, $u64, G, P, S, memccpy, strlen } from '../rt/index.ts';
import { MAXHELP } from './consts.ts';


export function fillhelp(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  let row = 0;
  let column = 0;
  let helpmessage = new Int8Array(40);
  for (column = 0; column < 4; ++column) {
    for (row = 1; $u64(row) < Math.trunc(Math.trunc(640 / 8) / 4) + 1; ++row) {
      if (!G.help_message[i]) {
        break;
      } else {
        memccpy(P(helpmessage), G.help_message[i], 0, 40);
        update_Help_to_Keymap(P(helpmessage));
        W_WriteText(G.helpWin, Math.imul(MAXHELP, column), row - 1, G.textColor, P(helpmessage), strlen(P(helpmessage)) | 0, G.W_RegularFont);
        ++i;
      }
    }
    if (!G.help_message[i]) {
      break;
    }
  }
}

function update_Help_to_Keymap(helpmessage: Ptr | null): void {
  let i = 0;
  let num_mapped = 0;
  let key = 0;
  key = helpmessage.a[helpmessage.o];
  if (key < 32 || key > 126) {
    return;
  }
  if (strlen(helpmessage) < 6) {
    return;
  }
  for (i = 0; i < 96; ++i) {
    if (G.mystats.st_keymap[i] !== key) {
      continue;
    }
    if (i + 32 === key) {
      continue;
    }
    ++num_mapped;
    if (num_mapped > 3) {
      continue;
    }
    helpmessage.a[helpmessage.o + (1 + num_mapped)] = i + 32 << 24 >> 24;
  }
  switch (num_mapped) {
  case 0:
    helpmessage.a[helpmessage.o + 2] = 32;
  case 1:
    helpmessage.a[helpmessage.o + 3] = 32;
  case 2:
    helpmessage.a[helpmessage.o + 4] = 32;
  case 3:
  default:
    helpmessage.a[helpmessage.o + 5] = 32;
  }
  return;
}

export function $init(): void {
  G.help_message = [S("0     Set speed"),
S("1     Set speed"),
S("2     Set speed"),
S("3     Set speed"),
S("4     Set speed"),
S("5     Set speed"),
S("6     Set speed"),
S("7     Set speed"),
S("8     Set speed"),
S("9     Set speed"),
S(")     Speed = 10"),
S("!     Speed = 11"),
S("@     Speed = 12"),
S("%     Speed = maximum"),
S("#     Speed = 1/2 maximum"),
S("<     Speed down 1"),
S(">     Speed up 1"),
S("k     Course set"),
S("p     Fire phaser beam"),
S("t     Fire photon torpedo"),
S("f     Fire plasma torpedo"),
S("d     Detonate enemy torpedos"),
S("D     Detonate own torpedos"),
S("L     Players list on/off"),
S("P     Planets list on/off"),
S("S     Status graph on/off"),
S("]     Shields on"),
S("[     Shields off"),
S("u     Shields on/off"),
S("s     Shields on/off"),
S("i     Info on player/planet"),
S("I     Extended info on player"),
S("b     Bomb planet"),
S("z     Beam up armies"),
S("x     Beam down armies"),
S("c     Cloak on/off"),
S("{     Cloak on"),
S("}     Cloak off"),
S("T     Tractor beam on/off"),
S("y     Pressor beam on/off"),
S("_     Tractor beam on"),
S("^     Pressor beam on"),
S("$     Tractor/pressor beam off"),
S("R     Repair mode on"),
S("o     Orbit planet or dock to base"),
S("e     Docking permission on/off"),
S("r     Refit (change ship type)"),
S("Q     Quit"),
S("q     Fast quit"),
S("?     Message window on/off"),
S("l     Lock on to player/planet"),
S(";     Lock on to planet"),
S("h     Help window on/off"),
S("w     War declarations window on/off"),
S("N     Planet names on/off"),
S("V     Change local planet display"),
S("B     Change galactic planet display"),
S("*     Practice robot or transwarp"),
S("E     Send distress signal"),
S("F     Send armies carried report"),
S("U     Rankings window on/off"),
S("mA    Send message to ALL"),
S("mT    Send message to team"),
S("/     Sort player list on/off"),
S(":     Message logging on/off"),
S("+     UDP window on/off"),
S("=     Update all"),
S(",     Ping stats window on/off"),
S(".     Netstat window on/off"),
S("\\     LagMeter window on/off"),
S("`     Packet window on/off"),
S("-     Update small"),
S("|     Update medium"),
S("      (space) special windows off"),
S("X     Enter macro mode"),
S("X?    Show current macros"),
S("M     Shell tools window on/off"),
S("~     Sound control window on/off"),
S("&     Reread .xtrekrc"),
null];
}
