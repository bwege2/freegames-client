// @ts-nocheck
// COW 3.3.3 spopt.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { sendShortReq, sendThreshold } from './short.ts';
import { W_MapWindow, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, G, P, S, sprintf, sscanf, strcpy, strlen } from '../rt/index.ts';
import { SPK_MOFF, SPK_MON, SPK_M_KILLS, SPK_M_NOKILLS, SPK_M_NOWARN, SPK_M_WARN, SPK_NUMFIELDS, SPK_TFIELD, SPK_VOFF, SPK_VON, W_EV_BUTTON, W_EV_KEY } from './consts.ts';


export function sprefresh(i: number): void {
  let buf = new Int8Array(8192);
  switch (i) {
  case 0:
    sprintf(P(buf), S("%seceive variable and short packets"), G.recv_short ? S("R") : S("Don't r"));
    break;
  case 1:
    sprintf(P(buf), S("%seceive messages"), G.recv_mesg ? S("R") : S("Don't r"));
    break;
  case 2:
    sprintf(P(buf), S("%seceive kill messages"), G.recv_kmesg ? S("R") : S("Don't r"));
    break;
  case 3:
    sprintf(P(buf), S("%seceive warning messages"), G.recv_warn ? S("R") : S("Don't r"));
    break;
  case 4:
    sprintf(P(buf), S("Receive threshold: %s_"), P(G.recv_threshold_s));
    break;
  case 5:
    sprintf(P(buf), S("Done"));
    break;
  }
  W_WriteText(G.spWin, 0, i, G.textColor, P(buf), strlen(P(buf)) | 0, null);
}

export function spaction(data: struct_event | null): void {
  data = $cast(struct_event, data);
  const v = new Int32Array(1);
  let i = 0;
  let cp = null;
  switch (data.y) {
  case 0:
    if (data.type === W_EV_BUTTON) {
      if (G.recv_short) {
        sendShortReq(SPK_VOFF);
      } else {
        sendShortReq(SPK_VON);
      }
    }
    break;
  case 1:
    if (data.type === W_EV_BUTTON) {
      if (G.recv_mesg) {
        sendShortReq(SPK_MOFF);
      } else {
        sendShortReq(SPK_MON);
      }
    }
    break;
  case 2:
    if (data.type === W_EV_BUTTON) {
      if (G.recv_kmesg) {
        sendShortReq(SPK_M_NOKILLS);
      } else {
        sendShortReq(SPK_M_KILLS);
      }
    }
    break;
  case 3:
    if (data.type === W_EV_BUTTON) {
      if (G.recv_warn) {
        sendShortReq(SPK_M_NOWARN);
      } else {
        sendShortReq(SPK_M_WARN);
      }
    }
    break;
  case 4:
    if (data.type === W_EV_KEY) {
      switch (data.key) {
      case 8:
      case 127:
        cp = P(G.recv_threshold_s);
        i = strlen(cp) | 0;
        if (i > 0) {
          cp = cp.add(i - 1);
          cp.a[cp.o] = 0;
        }
        break;
      case 21:
      case 24:
        G.recv_threshold_s[0] = 0;
        break;
      default:
        if (data.key >= 48 && data.key <= 57) {
          cp = P(G.recv_threshold_s);
          i = strlen(cp) | 0;
          if (i < 4) {
            cp = cp.add(i);
            cp.a[cp.o + 1] = 0;
            cp.a[cp.o] = data.key << 24 >> 24;
          }
        }
        break;
      }
      sprefresh(SPK_TFIELD);
    }
    break;
  case 5:
    if (data.type === W_EV_BUTTON) {
      if (sscanf(P(G.recv_threshold_s), S("%d"), P(v, 0)) !== 1) {
        strcpy(P(G.recv_threshold_s), S("0"));
      } else if (G.recv_threshold !== v[0]) {
        G.recv_threshold = v[0];
        sendThreshold(G.recv_threshold & 0xffff);
      }
      spdone();
    }
    break;
  }
}

export function spwindow(): void {
  let i = 0;
  for (i = 0; i < SPK_NUMFIELDS; ++i) {
    sprefresh(i);
  }
  W_MapWindow(G.spWin);
}

export function spdone(): void {
  W_UnmapWindow(G.spWin);
}

export function $init(): void {
}
