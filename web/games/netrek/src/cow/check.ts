// @ts-nocheck
// COW 3.3.3 check.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { terminate } from './cowmain.ts';
import { struct_sockaddr, struct_sockaddr_in } from './structs.ts';
import { $cast, $pcast, $rd, $u64, $wr, G, P, R, S, close, connect, fprintf, fwrite, gethostbyname, htons, inet_addr, perror, printf, read, socket } from '../rt/index.ts';
import { AF_INET, BUF_SIZE, SOCK_STREAM, h_addr } from './consts.ts';

let buf: any;

export function check(): void {
  let addr = new struct_sockaddr_in();
  let hp = null;
  let cc = 0;
  let sock = 0;
  if ((addr.sin_addr.s_addr = inet_addr(G.serverName)) === 4294967295) {
    if (!(hp = gethostbyname(G.serverName))) {
      fprintf(R.stderr, S("unknown host '%s'\n"), G.serverName);
      terminate(0);
    } else {
      addr.sin_addr.s_addr = $rd($pcast(hp.h_addr_list.a[hp.h_addr_list.o + h_addr], 4, true, false)) >>> 0;
    }
  }
  addr.sin_family = AF_INET;
  addr.sin_port = htons(G.xtrekPort & 0xffff);
  if ((sock = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
    perror(S("socket"));
    terminate(0);
  }
  printf(S("checking %s on port %d\n"), G.serverName, G.xtrekPort);
  if (connect(sock, $cast(struct_sockaddr, addr), 16) < 0) {
    perror(S("connect"));
    close(sock);
    terminate(0);
  }
  while ((cc = read(sock, P(buf), BUF_SIZE) | 0) > 0) {
    if (fwrite(P(buf), $u64(cc), 1, R.stdout) !== 1) {
      perror(S("fwrite"));
      close(sock);
      terminate(0);
    }
  }
  if (cc < 0) {
    perror(S("read"));
  }
  close(sock);
  terminate(0);
}

export function $init(): void {
  buf = new Int8Array(4096);
}
