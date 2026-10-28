// @ts-nocheck
// COW 3.3.3 udpopt.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { closeUdpConn, sendUdpReq } from './socket.ts';
import { W_Beep, W_MapWindow, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event } from './structs.ts';
import { $cast, G, P, R, S, fprintf, printf, sprintf, strcat, strcpy, strlen } from '../rt/index.ts';
import { COMM_MODE, COMM_TCP, COMM_UDP, COMM_UPDATE, MODE_DOUBLE, STAT_CONNECTED, UDP_DEBUG, UDP_NUMOPTS, UDP_RECENT_INTR, UDP_RECV, UDP_SEND, UDP_SEQUENCE } from './consts.ts';


export function udpwindow(): void {
  let i = 0;
  for (i = 0; i < UDP_NUMOPTS; ++i) {
    udprefresh(i);
  }
  W_MapWindow(G.udpWin);
}

export function udprefresh(i: number): void {
  let buf = new Int8Array(8192);
  switch (i) {
  case 0:
    sprintf(P(buf), S("UDP channel is %s"), G.commMode === COMM_TCP ? S("CLOSED") : S("OPEN"));
    break;
  case 1:
    strcpy(P(buf), S("> Status: "));
    switch (G.commStatus) {
    case 0:
      strcat(P(buf), S("Connected, yay us!"));
      break;
    case 1:
      strcat(P(buf), S("Requesting switch to UDP"));
      break;
    case 2:
      strcat(P(buf), S("Requesting switch to TCP"));
      break;
    case 3:
      strcat(P(buf), S("Verifying UDP connection"));
      break;
    default:
      fprintf(R.stderr, S("netrek: UDP error: bad commStatus (%d)\n"), G.commStatus);
    }
    break;
  case 2:
    sprintf(P(buf), S("> UDP trans dropped: %d (%d%% | %d%%)"), G.udpDropped, G.udpDropped * 100 / G.udpTotal | 0, G.udpRecentDropped * 100 / UDP_RECENT_INTR | 0);
    break;
  case 3:
    sprintf(P(buf), S("Sequence checking is %s"), G.udpSequenceChk ? S("ON") : S("OFF"));
    break;
  case 6:
    sprintf(P(buf), S("Debugging info is "));
    switch (G.udpDebug) {
    case 0:
      strcat(P(buf), S("OFF"));
      break;
    case 1:
      strcat(P(buf), S("ON (connect msgs only)"));
      break;
    case 2:
      strcat(P(buf), S("ON (verbose output)"));
      break;
    }
    break;
  case 4:
    sprintf(P(buf), S("Sending with "));
    switch (G.udpClientSend) {
    case 0:
      strcat(P(buf), S("TCP only"));
      break;
    case 1:
      strcat(P(buf), S("simple UDP"));
      break;
    case 2:
      strcat(P(buf), S("enforced UDP (state only)"));
      break;
    case 3:
      strcat(P(buf), S("enforced UDP (state & weap)"));
      break;
    }
    break;
  case 5:
    sprintf(P(buf), S("Receiving with "));
    switch (G.udpClientRecv) {
    case 0:
      strcat(P(buf), S("TCP only"));
      break;
    case 1:
      strcat(P(buf), S("simple UDP"));
      break;
    case 2:
      strcat(P(buf), S("fat UDP"));
      break;
    }
    break;
  case 7:
    sprintf(P(buf), S("Force reset to TCP"));
    break;
  case 8:
    sprintf(P(buf), S("Request full update (=)"));
    break;
  case 9:
    strcpy(P(buf), S("Done"));
    break;
  default:
    fprintf(R.stderr, S("netrek: UDP error: bad udprefresh(%d) call\n"), i);
  }
  W_WriteText(G.udpWin, 0, i, G.textColor, P(buf), strlen(P(buf)) | 0, null);
}

export async function udpaction(data: struct_event | null): Promise<void> {
  data = $cast(struct_event, data);
  let i = 0;
  switch (data.y) {
  case 0:
    if (G.commMode === COMM_TCP) {
      await sendUdpReq(COMM_UDP);
    } else {
      await sendUdpReq(COMM_TCP);
    }
    break;
  case 1:
  case 2:
    W_Beep();
    break;
  case 3:
    G.udpSequenceChk = !G.udpSequenceChk ? 1 : 0;
    udprefresh(UDP_SEQUENCE);
    break;
  case 4:
    ++G.udpClientSend;
    if (G.udpClientSend > 3) {
      G.udpClientSend = 0;
    }
    udprefresh(UDP_SEND);
    break;
  case 5:
    ++G.udpClientRecv;
    if (G.udpClientRecv >= MODE_DOUBLE) {
      G.udpClientRecv = 0;
    }
    udprefresh(UDP_RECV);
    await sendUdpReq(COMM_MODE + G.udpClientRecv);
    break;
  case 6:
    ++G.udpDebug;
    if (G.udpDebug > 2) {
      G.udpDebug = 0;
    }
    udprefresh(UDP_DEBUG);
    break;
  case 7:
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("*** FORCE RESET REQUESTED\n"));
      }
    }
    ;
    await sendUdpReq(COMM_TCP);
    G.commMode = G.commModeReq = COMM_TCP;
    G.commStatus = STAT_CONNECTED;
    G.commSwitchTimeout = 0;
    G.udpClientSend = G.udpClientRecv = G.udpSequenceChk = G.udpTotal = 1;
    G.udpDebug = G.udpDropped = G.udpRecentDropped = 0;
    if (G.udpSock >= 0) {
      closeUdpConn();
    }
    for (i = 0; i < UDP_NUMOPTS; ++i) {
      udprefresh(i);
    }
    break;
  case 8:
    await sendUdpReq(COMM_UPDATE);
    break;
  case 9:
    udpdone();
    break;
  }
}

export function udpdone(): void {
  W_UnmapWindow(G.udpWin);
}

export function $init(): void {
}
