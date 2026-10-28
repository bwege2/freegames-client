// @ts-nocheck
// COW 3.3.3 ping.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { updatePStats } from './pingstats.ts';
import { gwrite } from './socket.ts';
import { W_IsMapped } from './x11window.ts';
import { struct_ping_cpacket, struct_ping_spacket } from './structs.ts';
import { $bytes, $cast, $u64, G, S, bzero, htonl, ntohs, printf, sqrt } from '../rt/index.ts';
import { CP_PING_RESPONSE } from './consts.ts';

let sum: number;
let n: number;
let M: number;
let var_: number;
let s2: number;
let startPing$packet: struct_ping_cpacket;
let stopPing$packet: struct_ping_cpacket;

export function handlePing(packet: struct_ping_spacket | null): void {
  packet = $cast(struct_ping_spacket, packet);
  G.ping = 1;
  sendServerPingResponse(packet.number);
  G.ping_lag = ntohs(packet.lag);
  G.ping_iloss_sc = packet.iloss_sc;
  G.ping_iloss_cs = packet.iloss_cs;
  G.ping_tloss_sc = packet.tloss_sc;
  G.ping_tloss_cs = packet.tloss_cs;
  calc_lag();
  if (W_IsMapped(G.pStats)) {
    updatePStats();
  }
}

export function startPing(): void {
  startPing$packet.type = CP_PING_RESPONSE;
  startPing$packet.pingme = 1;
  if ($u64(gwrite(G.sock, $bytes(startPing$packet), 12)) !== 12) {
    printf(S("gwrite failed.\n"));
    G.serverDead = 1;
  }
}

export function stopPing(): void {
  stopPing$packet.type = CP_PING_RESPONSE;
  stopPing$packet.pingme = 0;
  if ($u64(gwrite(G.sock, $bytes(stopPing$packet), 12)) !== 12) {
    printf(S("gwrite failed.\n"));
    G.serverDead = 1;
  }
}

function sendServerPingResponse(number: number): void {
  let packet = new struct_ping_cpacket();
  let s = 0;
  if (G.udpSock >= 0) {
    s = G.udpSock;
    ++G.packets_sent;
  } else {
    s = G.sock;
  }
  bzero(packet, 12);
  packet.type = CP_PING_RESPONSE;
  packet.pingme = G.ping << 24 >> 24;
  packet.number = number & 0xff;
  packet.cp_sent = htonl(G.packets_sent >>> 0) | 0;
  packet.cp_recv = htonl(G.packets_received >>> 0) | 0;
  if (s === -1) {
    return;
  }
  if ($u64(gwrite(s, $bytes(packet), 12)) !== 12) {
    if (s === G.udpSock) {
      s = G.sock;
      if ($u64(gwrite(s, $bytes(packet), 12)) !== 12) {
        G.serverDead = 1;
        printf(S("gwrite failed again.\n"));
      }
    }
  }
}

function calc_lag(): void {
  ++n;
  sum += G.ping_lag;
  s2 = s2 + Math.imul(G.ping_lag, G.ping_lag);
  if (n === 1) {
    return;
  }
  M = sum / n | 0;
  var_ = Math.trunc((s2 - Math.imul(M, sum)) / (n - 1)) | 0;
  G.ping_av = M;
  G.ping_sd = Math.trunc(sqrt(var_)) | 0;
}

export function $init(): void {
  G.ping_iloss_sc = 0;
  G.ping_iloss_cs = 0;
  G.ping_tloss_sc = 0;
  G.ping_tloss_cs = 0;
  G.ping_lag = 0;
  G.ping_av = 0;
  G.ping_sd = 0;
  sum = 0;
  n = 0;
  M = 0;
  var_ = 0;
  s2 = 0;
  startPing$packet = new struct_ping_cpacket();
  stopPing$packet = new struct_ping_cpacket();
}
