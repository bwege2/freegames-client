// @ts-nocheck
// COW 3.3.3 dmessage.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { rcdlite } from './beeplite.ts';
import { censor } from './censor.ts';
import { HandleGenDistr, makedistress } from './distress.ts';
import { pmessage } from './smessage.ts';
import { W_WriteText } from './x11window.ts';
import { struct_distress } from './structs.ts';
import { $sadd, $u64, G, P, R, S, fflush, fprintf, localtime, printf, sprintf, strlen, strncmp, time } from '../rt/index.ts';
import { MALL, MBOMB, MCONFIG, MCONQ, MDEST, MDISTR, MINDIV, MKILL, MKILLA, MKILLP, MTAKE, MTEAM, MVALID, PATCHLEVEL } from './consts.ts';

let version_sent: number;

export function dmessage(message: Ptr | null, flags: number, from: number, to: number): void {
  let len = 0;
  let color = 0;
  let timebuf = new Int8Array(10);
  const curtime = new Float64Array(1);
  let tm = null;
  let take = 0;
  let destroy = 0;
  let team = 0;
  let kill = 0;
  let killp = 0;
  let killa = 0;
  let bomb = 0;
  let conq = 0;
  let dist = new struct_distress();
  take = MTEAM + MTAKE + MVALID;
  destroy = MTEAM + MDEST + MVALID;
  kill = MALL + MKILL + MVALID;
  killp = MALL + MKILLP + MVALID;
  killa = MALL + MKILLA + MVALID;
  bomb = MTEAM + MBOMB + MVALID;
  team = MTEAM + MVALID;
  conq = MALL + MCONQ + MVALID;
  time(P(curtime, 0));
  tm = localtime(P(curtime, 0));
  sprintf(P(timebuf), S("%02d:%02d:%02d"), tm.tm_hour, tm.tm_min, tm.tm_sec);
  len = strlen(message) | 0;
  if (from === 255) {
    color = G.textColor;
  } else {
    color = G.me === $sadd(G.players, from) || (G.me.p_flags & 134217728) >>> 0 && (G.me.p_flags & 16384) >>> 0 && G.me.p_playerl === $sadd(G.players, from).p_no ? G.myColor : G.shipCol[G.remap[$sadd(G.players, from).p_team]];
  }
  if (G.censorMessages) {
    if (flags !== kill && flags !== killp && flags !== killa && flags !== bomb && flags !== take && flags !== destroy) {
      censor(message);
    }
  }
  if (flags === (MTEAM | MDISTR | MVALID)) {
    HandleGenDistr(message, from, to, dist);
    len = makedistress(dist, message, $sadd(G.distmacro, dist.distype).macro);
    if (G.UseLite) {
      rcdlite(dist);
    }
    if (len <= 0) {
      return;
    }
    flags = (flags ^ MDISTR) & 0xff;
  }
  if (G.niftyNewMessages) {
    if (G.logmess) {
      if (!!G.logFile) {
        fprintf(G.logFile, S("%s: %s\n"), P(timebuf), message);
        fflush(G.logFile);
      } else {
        printf(S("%s: %s\n"), P(timebuf), message);
      }
    }
    if (!(G.logmess && !G.logFile) && flags === conq) {
      fprintf(R.stdout, S("%s\n"), message);
      if (instr(message, S("kill"))) {
        fprintf(R.stdout, S("NOTE: The server here does not properly set message flags\n"));
        fprintf(R.stdout, S("You should probably pester the server god to update....\n"));
      }
    }
    if (flags === MCONFIG + MINDIV + MVALID) {
      return;
    }
    if (flags === team || flags === take || flags === destroy) {
      W_WriteText(G.messwt, 0, 0, color, message, len, G.me === G.me ? G.W_HighlightFont : !(G.me.p_team & (G.me.p_swar | G.me.p_hostile)) && !(G.me.p_team & (G.me.p_swar | G.me.p_hostile)) ? G.W_HighlightFont : G.W_RegularFont);
      if (flags === team && !strncmp(message.add(10), S("     "), 5) && message.a[message.o + 15] === 0) {
        printf(S("dmessage:flags==team PIG call from=%d\n"), from);
        if (!G.versionHide) {
          pmessage(S("COW 3.3"), from, MINDIV);
        }
      }
    } else if (flags === kill || flags === killp || flags === killa || flags === bomb) {
      W_WriteText(G.messwk, 0, 0, color, message, len, null);
      if (!G.reportKills) {
        return;
      }
    } else if (flags & MINDIV) {
      W_WriteText(G.messwi, 0, 0, color, message, len, null);
      if (!strncmp(message.add(10), S("     "), 5) && message.a[message.o + 15] === 0) {
        printf(S("dmessage:MINDIV PIG call from=%d\n"), from);
        if (!G.versionHide) {
          pmessage(S("COW 3.3"), from, MINDIV);
        }
      }
    } else {
      W_WriteText(G.messwa, 0, 0, color, message, len, null);
      if (!strncmp(message.add(10), S("     "), 5) && message.a[message.o + 15] === 0) {
        if (!G.versionHide) {
          pmessage(S("COW 3.3"), from, MINDIV);
        }
      }
    }
    W_WriteText(G.reviewWin, 0, 0, color, message, len, null);
  } else {
    if (strncmp(message, S("GOD->ALL"), 8) === 0 && (instr(message, S("was kill")) || instr(message, S("killed by"))) || message.a[message.o] !== 32 && instr(message, S("We are being attacked"))) {
      W_WriteText(G.messwk, 0, 0, color, message, len, null);
      if (!G.reportKills) {
        return;
      }
      W_WriteText(G.reviewWin, 0, 0, color, message, len, null);
      if (G.logmess) {
        if (!!G.logFile) {
          fprintf(G.logFile, S("%s "), P(timebuf));
          fprintf(G.logFile, S("%s\n"), message);
          fflush(G.logFile);
        } else {
          printf(S("%s "), message);
          printf(S("%s\n"), P(timebuf));
        }
      }
      return;
    }
    switch (flags & (MTEAM | MINDIV | MALL)) {
    case 4:
      W_WriteText(G.messwt, 0, 0, color, message, len, null);
      if (!strncmp(message.add(10), S("     "), 5) && message.a[message.o + 15] === 0) {
        if (!G.versionHide) {
          pmessage(S("COW 3.3"), from, MINDIV);
        }
      }
      if (G.logmess) {
        if (!!G.logFile) {
          fprintf(G.logFile, S("%s "), P(timebuf));
          fprintf(G.logFile, S("%s\n"), message);
          fflush(G.logFile);
        } else {
          printf(S("%s "), message);
          printf(S("%s\n"), P(timebuf));
        }
      }
      break;
    case 2:
      if (!(flags & MCONFIG)) {
        W_WriteText(G.messwi, 0, 0, color, message, len, null);
      }
      if (!strncmp(message.add(10), S("     "), 5) && message.a[message.o + 15] === 0) {
        if (!G.versionHide) {
          pmessage(S("COW 3.3"), from, MINDIV);
        }
      }
      if (G.logmess) {
        if (!!G.logFile) {
          fprintf(G.logFile, S("%s "), P(timebuf));
          fprintf(G.logFile, S("%s\n"), message);
          fflush(G.logFile);
        } else {
          printf(S("%s "), message);
          printf(S("%s\n"), P(timebuf));
        }
      }
      break;
    default:
      W_WriteText(G.messwa, 0, 0, color, message, len, null);
      if (!strncmp(message.add(10), S("     "), 5) && message.a[message.o + 15] === 0) {
        if (!G.versionHide) {
          pmessage(S("COW 3.3"), from, MINDIV);
        }
      }
      if (G.logmess) {
        if (!!G.logFile) {
          fprintf(G.logFile, S("%s "), P(timebuf));
          fprintf(G.logFile, S("%s\n"), message);
          fflush(G.logFile);
        } else {
          printf(S("%s"), message);
          printf(S("%s\n"), P(timebuf));
        }
      }
      break;
    }
    W_WriteText(G.reviewWin, 0, 0, color, message, len, null);
  }
}

function instr(string1: Ptr | null, string2: Ptr | null): number {
  let s = null;
  let length = 0;
  length = strlen(string2) | 0;
  for (s = string1; s.a[s.o] !== 0; s = s.add(1)) {
    if (s.a[s.o] === string2.a[string2.o] && strncmp(s, string2, $u64(length)) === 0) {
      return 1;
    }
  }
  return 0;
}

export function sendVersion(): void {
  let client_ver = new Int8Array(80);
  if (!version_sent) {
    version_sent = 1;
    sprintf(P(client_ver), S("@netrek-client-cow %s.%d"), S("3.3"), PATCHLEVEL);
    pmessage(P(client_ver), G.me.p_no, MINDIV | MCONFIG);
  }
}

export function $init(): void {
  version_sent = 0;
}
