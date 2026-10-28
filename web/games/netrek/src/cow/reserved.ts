// @ts-nocheck
// COW 3.3.3 reserved.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { terminate } from './cowmain.ts';
import { struct_reserved_cpacket, struct_reserved_spacket, struct_sockaddr, struct_sockaddr_in } from './structs.ts';
import { $cast, $rows, $ta, G, P, S, getpeername, memcpy, perror, random } from '../rt/index.ts';
import { CP_RESERVED, SP_RESERVED } from './consts.ts';

let swap: any;

export function makeReservedPacket(packet: struct_reserved_spacket | null): void {
  let i = 0;
  for (i = 0; i < 16; ++i) {
    packet.data[i] = random() % 256 << 24 >> 24;
  }
  packet.type = SP_RESERVED;
}

export function encryptReservedPacket(spacket: struct_reserved_spacket | null, cpacket: struct_reserved_cpacket | null, server: Ptr | null, pno: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any, $t7: any, $t8: any, $t9: any, $t10: any;
  let saddr = new struct_sockaddr_in();
  let mixin1 = 0;
  let mixin2 = 0;
  let mixin3 = 0;
  let mixin4 = 0;
  let mixin5 = 0;
  let i = 0;
  let j = 0;
  let k = 0;
  let buf = new Int8Array(16);
  let s = null;
  const len = new Int32Array(1);
  let netaddr = 0;
  memcpy(P(cpacket.data), P(spacket.data), 16);
  memcpy(P(cpacket.resp), P(spacket.data), 16);
  cpacket.type = CP_RESERVED;
  if (netaddr === 0) {
    len[0] = 16;
    if (getpeername(G.sock, $cast(struct_sockaddr, saddr), P(len, 0)) < 0) {
      perror(S("getpeername(sock)"));
      terminate(1);
    }
    netaddr = saddr.sin_addr.s_addr;
  }
  mixin1 = (netaddr >>> 24 & 255) >>> 0 & 0xff;
  mixin2 = pno & 0xff;
  mixin3 = (netaddr >>> 16 & 255) >>> 0 & 0xff;
  mixin4 = (netaddr >>> 8 & 255) >>> 0 & 0xff;
  mixin5 = (netaddr & 255) >>> 0 & 0xff;
  j = 0;
  for (i = 0; i < 23; ++i) {
    j = j + cpacket.resp[j] & 15;
    s = P(swap[j]);
    ($t1 = cpacket.resp, $t2 = s.a[s.o + i % 7], $t1[$t2] = ($t1[$t2] ^ mixin1) << 24 >> 24);
    ($t3 = cpacket.resp, $t4 = s.a[s.o + i % 5], $t3[$t4] = ($t3[$t4] ^ mixin2) << 24 >> 24);
    ($t5 = cpacket.resp, $t6 = s.a[s.o + i % 13], $t5[$t6] = ($t5[$t6] ^ mixin3) << 24 >> 24);
    ($t7 = cpacket.resp, $t8 = s.a[s.o + i % 3], $t7[$t8] = ($t7[$t8] ^ mixin4) << 24 >> 24);
    ($t9 = cpacket.resp, $t10 = s.a[s.o + i % 11], $t9[$t10] = ($t9[$t10] ^ mixin5) << 24 >> 24);
    for (k = 0; k < 16; ++k) {
      buf[k] = cpacket.resp[s.a[s.o + k]];
    }
    memcpy(P(cpacket.resp), P(buf), 16);
  }
}

export function $init(): void {
  swap = $rows([$ta(Uint8Array, 16, [4, 13, 9, 7, 5, 8, 14, 2, 10, 11, 6, 3, 12, 15, 0, 1]),
$ta(Uint8Array, 16, [0, 4, 12, 5, 15, 2, 7, 3, 14, 6, 1, 10, 8, 13, 11, 9]),
$ta(Uint8Array, 16, [9, 5, 4, 2, 3, 6, 10, 12, 1, 7, 15, 14, 11, 0, 13, 8]),
$ta(Uint8Array, 16, [5, 8, 15, 4, 6, 9, 1, 12, 10, 3, 13, 11, 2, 7, 0, 14]),
$ta(Uint8Array, 16, [15, 13, 1, 14, 4, 0, 8, 12, 11, 9, 2, 10, 3, 6, 7, 5]),
$ta(Uint8Array, 16, [6, 7, 9, 11, 14, 1, 4, 13, 2, 12, 8, 15, 10, 0, 5, 3]),
$ta(Uint8Array, 16, [11, 0, 10, 14, 7, 12, 2, 4, 15, 13, 3, 9, 1, 5, 8, 6]),
$ta(Uint8Array, 16, [9, 8, 2, 10, 12, 14, 3, 7, 4, 0, 11, 1, 5, 15, 6, 13]),
$ta(Uint8Array, 16, [15, 12, 3, 0, 10, 8, 13, 9, 14, 2, 4, 5, 7, 6, 1, 11]),
$ta(Uint8Array, 16, [14, 3, 0, 11, 2, 10, 15, 12, 13, 1, 5, 4, 6, 8, 7, 9]),
$ta(Uint8Array, 16, [1, 2, 7, 3, 8, 0, 10, 14, 6, 5, 13, 12, 4, 9, 11, 15]),
$ta(Uint8Array, 16, [2, 1, 11, 9, 7, 3, 12, 6, 5, 8, 0, 10, 14, 4, 15, 13]),
$ta(Uint8Array, 16, [0, 12, 15, 1, 13, 7, 6, 5, 3, 14, 11, 8, 9, 10, 2, 4]),
$ta(Uint8Array, 16, [10, 9, 0, 6, 1, 14, 5, 12, 7, 4, 15, 13, 8, 2, 3, 11]),
$ta(Uint8Array, 16, [3, 11, 6, 12, 10, 5, 14, 1, 9, 15, 7, 2, 13, 8, 4]),
$ta(Uint8Array, 16, [12, 6, 5, 8, 14, 4, 13, 15, 10, 0, 11, 9, 3, 1, 7, 2])]);
}
