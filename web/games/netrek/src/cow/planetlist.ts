// @ts-nocheck
// COW 3.3.3 planetlist.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, $sadd, G, P, S, sprintf, strlen } from '../rt/index.ts';
import { FED, KLI, MAXPLANETS, ORI, PLAGRI, PLCORE, PLFUEL, PLREPAIR, ROM } from './consts.ts';

let teamname: any;

export function planetlist(_p0: struct_event | null): void {
  _p0 = $cast(struct_event, _p0);
  let i = 0;
  let k = 0;
  let buf = new Int8Array(8192);
  let j = null;
  sprintf(P(buf), S("Planet Name      own armies REPAIR FUEL AGRI CORE info"));
  W_WriteText(G.planetw, 2, 1, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  k = 2;
  for (i = 0, j = $sadd(G.planets, i); i < MAXPLANETS; ++i, j = $sadd(j, 1)) {
    if (j.pl_info & G.me.p_team) {
      sprintf(P(buf), S("%-16s %3s %3d    %6s %4s %4s %4s %c%c%c%c"), P(j.pl_name), teamname[j.pl_owner], j.pl_armies, j.pl_flags & PLREPAIR ? S("REPAIR") : S("      "), j.pl_flags & PLFUEL ? S("FUEL") : S("    "), j.pl_flags & PLAGRI ? S("AGRI") : S("    "), j.pl_flags & PLCORE ? S("CORE") : S("    "), j.pl_info & FED ? 70 : 32, j.pl_info & ROM ? 82 : 32, j.pl_info & KLI ? 75 : 32, j.pl_info & ORI ? 79 : 32);
      W_WriteText(G.planetw, 2, k++, j.pl_info & G.me.p_team || G.playback ? G.shipCol[G.remap[j.pl_owner]] : G.unColor, P(buf), strlen(P(buf)) | 0, G.me.p_team === j.pl_owner ? G.W_HighlightFont : j.pl_info & G.me.p_team && !(j.pl_owner & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
    } else {
      sprintf(P(buf), S("%-16s"), P(j.pl_name));
      W_WriteText(G.planetw, 2, k++, G.unColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
    }
  }
}

export function $init(): void {
  teamname = [S("IND"),
S("FED"),
S("ROM"),
S(""),
S("KLI"),
S(""),
S(""),
S(""),
S("ORI")];
}
