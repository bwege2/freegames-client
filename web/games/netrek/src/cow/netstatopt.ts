// @ts-nocheck
// COW 3.3.3 netstatopt.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { ns_get_lstat, ns_get_nfailures, ns_get_nfthresh_s, ns_get_tstat, ns_init, ns_set_nfthresh, ns_set_nfthresh_s } from './netstat.ts';
import { W_MapWindow, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, G, P, S, sprintf, sscanf, strlen } from '../rt/index.ts';
import { NETSTAT_DF_NFT, NETSTAT_FAILURES, NETSTAT_LOCAL, NETSTAT_NFTHRESH, NETSTAT_NUMFIELDS, NETSTAT_SWITCH, NETSTAT_TOTAL, W_EV_BUTTON, W_EV_KEY } from './consts.ts';


export function nswindow(): void {
  let i = 0;
  for (i = 0; i < NETSTAT_NUMFIELDS; ++i) {
    nsrefresh(i);
  }
  W_MapWindow(G.netstatWin);
}

export function nsrefresh(i: number): void {
  let buf = new Int8Array(8192);
  let color = 0;
  switch (i) {
  case 0:
    sprintf(P(buf), S("%sollect network stats"), G.netstat ? S("C") : S("Don't c"));
    color = G.textColor;
    break;
  case 1:
    sprintf(P(buf), S("Reset network stats"));
    color = G.textColor;
    break;
  case 2:
    sprintf(P(buf), S("Total              : %4.2f"), ns_get_tstat());
    color = G.yColor;
    break;
  case 3:
    sprintf(P(buf), S("This ship          : %4.2f"), ns_get_lstat());
    color = G.yColor;
    break;
  case 4:
    sprintf(P(buf), S("Network failures   : %d"), ns_get_nfailures());
    color = G.yColor;
    break;
  case 5:
    sprintf(P(buf), S("Network failure threshold: %s_"), ns_get_nfthresh_s());
    color = G.textColor;
    break;
  case 6:
    sprintf(P(buf), S("Done"));
    color = G.textColor;
    break;
  }
  W_WriteText(G.netstatWin, 0, i, color, P(buf), strlen(P(buf)) | 0, null);
}

export function nsaction(data: struct_event | null): void {
  data = $cast(struct_event, data);
  const v = new Int32Array(1);
  let i = 0;
  let cp = null;
  switch (data.y) {
  case 0:
    if (data.type === W_EV_BUTTON) {
      if (G.netstat) {
        G.netstat = 0;
        W_UnmapWindow(G.lMeter);
      } else {
        G.netstat = 1;
        ns_init(5);
      }
    }
    nsrefresh(NETSTAT_SWITCH);
    break;
  case 1:
    if (data.type === W_EV_BUTTON) {
      ns_init(0);
      nsrefresh(NETSTAT_TOTAL);
      nsrefresh(NETSTAT_LOCAL);
      nsrefresh(NETSTAT_FAILURES);
    }
    break;
  case 5:
    if (data.type === W_EV_KEY) {
      switch (data.key) {
      case 8:
      case 127:
        cp = ns_get_nfthresh_s();
        i = strlen(cp) | 0;
        if (i > 0) {
          cp = cp.add(i - 1);
          cp.a[cp.o] = 0;
        }
        break;
      case 21:
      case 24:
        ns_set_nfthresh_s(S(""));
        break;
      default:
        if (data.key >= 48 && data.key <= 57) {
          cp = ns_get_nfthresh_s();
          i = strlen(cp) | 0;
          if (i < 4) {
            cp = cp.add(i);
            cp.a[cp.o + 1] = 0;
            cp.a[cp.o] = data.key << 24 >> 24;
          }
        }
        break;
      }
      nsrefresh(NETSTAT_NFTHRESH);
    }
    break;
  case 6:
    if (data.type === W_EV_BUTTON) {
      if (sscanf(ns_get_nfthresh_s(), S("%d"), P(v, 0)) !== 1) {
        ns_set_nfthresh_s(S("2000"));
        ns_set_nfthresh(NETSTAT_DF_NFT);
      } else {
        ns_set_nfthresh(v[0]);
      }
      nsdone();
    }
    break;
  }
}

export function nsdone(): void {
  W_UnmapWindow(G.netstatWin);
}

export function $init(): void {
}
