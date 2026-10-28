// @ts-nocheck
// COW 3.3.3 findslot.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { terminate } from './cowmain.ts';
import { booleanDefault } from './defaults.ts';
import { showMotd } from './newwin.ts';
import { readFromServer, socketPause, socketPauseNoUser } from './socket.ts';
import { Exit_Sound } from './sound.ts';
import { W_Beep, W_ClearWindow, W_DestroyWindow, W_EventsPending, W_MakeWindow, W_MapWindow, W_NextEvent, W_SetWindowName, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $peq, $u64, G, P, R, S, fprintf, sprintf, strcpy, strlen } from '../rt/index.ts';
import { BM, TWINSIDE, WQ_H, WQ_HEAD, WQ_W } from './consts.ts';


function xc(s: Ptr | null): number {
  return $u64((WQ_W / 6 | 0) - BM) - Math.trunc(strlen(s) * $u64(G.W_Textwidth) / 2) | 0;
}

function draw_heading(w: Ptr | null): void {
  let buf = new Int8Array(60);
  sprintf(P(buf), S("You are on the queue at %s, please wait."), G.serverName);
  W_WriteText(w, 10, 10, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
}

function draw_b_quit(w: Ptr | null): void {
  let s = S("Quit");
  W_WriteText(w, xc(s), 25, G.textColor, s, strlen(s) | 0, G.W_RegularFont);
}

function draw_b_count(ww: Ptr | null, cw: Ptr | null, count: number): void {
  let s1 = S("queue");
  let s2 = S("position");
  let buf = new Int8Array(80);
  W_WriteText(cw, xc(s1), 5, G.textColor, s1, strlen(s1) | 0, G.W_RegularFont);
  W_WriteText(cw, xc(s2), 15, G.textColor, s2, strlen(s2) | 0, G.W_RegularFont);
  sprintf(P(buf), S("   %d   "), count);
  if (count === -1) {
    strcpy(P(buf), S("   ?   "));
  }
  W_WriteText(cw, xc(P(buf)), 35, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  sprintf(P(buf), S("Q%d @ %s"), count, G.serverName);
  W_SetWindowName(ww, P(buf));
}

function draw_b_motd(w: Ptr | null): void {
  let s1 = S("show server");
  let s2 = S("welcome message");
  W_WriteText(w, xc(s1), 20, G.textColor, s1, strlen(s1) | 0, G.W_RegularFont);
  W_WriteText(w, xc(s2), 30, G.textColor, s2, strlen(s2) | 0, G.W_RegularFont);
}

export async function findslot(): Promise<number> {
  let oldcount = -1;
  let w = null;
  let b_quit = null;
  let b_count = null;
  let b_motd = null;
  let w_motd = null;
  let WaitMotdLine = 0;
  let mapMotd = booleanDefault(S("showMotd"), 0);
  let event = new struct_event();
  while (G.queuePos === -1) {
    await socketPauseNoUser();
    if (G.serverDead) {
      Exit_Sound();
      fprintf(R.stderr, S("server connection lost, during pre-queue\n"));
      terminate(0);
    }
    await readFromServer(null);
    if (!!G.me) {
      return G.me.p_no;
    }
  }
  w = W_MakeWindow(S("wait"), 0, 0, WQ_W, WQ_H, null, 2, G.foreColor);
  b_quit = W_MakeWindow(S("waitquit"), BM, WQ_HEAD + BM, (WQ_W / 3 | 0) - BM * 2, WQ_H - WQ_HEAD - 2 - BM * 2, w, 2, G.W_Red);
  b_count = W_MakeWindow(S("count"), (WQ_W / 3 | 0) + BM, WQ_HEAD + BM, (WQ_W / 3 | 0) - BM * 2, WQ_H - WQ_HEAD - 2 - BM * 2, w, 2, G.W_Yellow);
  b_motd = W_MakeWindow(S("motdbutton"), (2 * WQ_W / 3 | 0) + BM, WQ_HEAD + BM, (WQ_W / 3 | 0) - BM * 2, WQ_H - WQ_HEAD - 2 - BM * 2, w, 2, G.W_Green);
  W_MapWindow(w);
  W_MapWindow(b_count);
  W_MapWindow(b_motd);
  W_MapWindow(b_quit);
  if (mapMotd) {
    w_motd = W_MakeWindow(S("waitmotd"), 1, WQ_W + 1, TWINSIDE, TWINSIDE, null, 2, G.foreColor);
    W_MapWindow(w_motd);
    showMotd(w_motd, WaitMotdLine);
  }
  for (; ; ) {
    await socketPause();
    await readFromServer(null);
    if (G.serverDead) {
      Exit_Sound();
      fprintf(R.stderr, S("server connection lost, during queue wait\n"));
      terminate(0);
    }
    while (await W_EventsPending()) {
      await W_NextEvent(event);
      switch (event.type) {
      case 3:
      case 2:
        if (mapMotd && $peq(event.Window, w_motd)) {
          if (event.key === 32 || event.key === 113) {
            W_DestroyWindow(w_motd);
            mapMotd = !mapMotd ? 1 : 0;
          } else {
            if (event.key === 98) {
              WaitMotdLine -= 28;
              WaitMotdLine = WaitMotdLine > 0 ? WaitMotdLine : 0;
            } else {
              WaitMotdLine += 28;
              if (WaitMotdLine > G.motd_last) {
                WaitMotdLine = 0;
              }
            }
            W_ClearWindow(w_motd);
            showMotd(w_motd, WaitMotdLine);
            break;
          }
        } else if ($peq(event.Window, b_motd)) {
          if (mapMotd) {
            W_DestroyWindow(w_motd);
          } else {
            w_motd = W_MakeWindow(S("waitmotd"), 1, WQ_W + 1, TWINSIDE, TWINSIDE, null, 2, G.foreColor);
            W_MapWindow(w_motd);
            WaitMotdLine = 0;
            showMotd(w_motd, WaitMotdLine);
          }
          mapMotd = !mapMotd ? 1 : 0;
        } else if ($peq(event.Window, b_quit) || event.key === 113) {
          Exit_Sound();
          fprintf(R.stderr, S("you selected quit\n"));
          terminate(0);
        }
        break;
      case 1:
        if ($peq(event.Window, w)) {
          draw_heading(w);
        } else if ($peq(event.Window, w_motd)) {
          showMotd(w_motd, WaitMotdLine);
        } else if ($peq(event.Window, b_quit)) {
          draw_b_quit(b_quit);
        } else if ($peq(event.Window, b_count)) {
          draw_b_count(w, b_count, G.queuePos);
        } else if ($peq(event.Window, b_motd)) {
          draw_b_motd(b_motd);
        }
        break;
      case 6:
        if ($peq(event.Window, w)) {
          fprintf(R.stderr, S("you quit, by closing the wait window\n"));
          terminate(0);
        } else if ($peq(event.Window, w_motd)) {
          W_DestroyWindow(w_motd);
          mapMotd = 0;
        }
        break;
      default:
        break;
      }
    }
    if (G.queuePos !== oldcount) {
      draw_b_count(w, b_count, G.queuePos);
      oldcount = G.queuePos;
    }
    if (!!G.me) {
      W_DestroyWindow(w);
      if (mapMotd) {
        W_DestroyWindow(w_motd);
      }
      W_Beep();
      W_Beep();
      return G.me.p_no;
    }
  }
}

export function $init(): void {
}
