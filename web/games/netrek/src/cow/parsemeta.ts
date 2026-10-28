// @ts-nocheck
// COW 3.3.3 parsemeta.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { booleanDefault, findfile, getdefault, intDefault } from './defaults.ts';
import { W_DrawImage, W_DrawScreenShot, W_DropImage, W_NextScreenShot, W_ReadImage, W_SetBackgroundImage } from './x11sprite.ts';
import { W_DestroyMenu, W_DestroyWindow, W_EventsPending, W_Flush, W_IsMapped, W_MakeMenu, W_MakeWindow, W_MapWindow, W_NextEvent, W_ReinitMenu, W_RenameWindow, W_ResizeMenu, W_Socket, W_UnmapWindow, W_WriteText } from './x11window.ts';
import { struct_event, struct_fd_set, struct_servers, struct_sockaddr, struct_sockaddr_in, struct_timeval } from './structs.ts';
import { $cast, $pcast, $peq, $rd, $sadd, $salloc, $sarr, $shl64, $u64, $wr, G, P, R, S, _exit, atoi, bind, close, execvp, exit, fclose, fopen, fork, fprintf, fread, free, fwrite, gethostbyname, htons, inet_addr, inet_ntoa, memcpy, perror, realloc, recvfrom, rename, select, sendto, setpgid, signal, snprintf, socket, sprintf, strcat, strcmp, strcpy, strdup, strlen, strncat, strncpy, strtok, time, unlink, waitpid } from '../rt/index.ts';
import { AF_INET, B_ADD, B_HELP, B_QUIT, B_REFRESH, DEFAULT_PORT, EINTR, EXIT_BADVERSION_BASE, EXIT_FORK_FAILURE, EXIT_UNKNOWN, FD_SETSIZE, INADDR_ANY, LINE, MAXBADVERSION, MAXMETABYTES, N_OVERHEAD, PATCHLEVEL, SOCK_DGRAM, WNOHANG, W_Key_Down, W_Key_Up, W_LBUTTON, W_MBUTTON, W_RBUTTON, statusCantConnect, statusNoConnect, statusNobody, statusNull, statusOpen, statusTout, statusWait } from './consts.ts';

let badversion_long_strings: any;
let badversion_short_strings: any;
let msock: number;
let sent: number;
let seen: number;
let verbose: number;
let last: number;
let num_servers: any;
let chosen: number;
let metaHeight: number;
let metaWindowName: Ptr | null;
let statusLevel: any;
let metaWin: Ptr | null;
let metaList: Ptr | null;
let metaHelpWin: Ptr | null;
let metawindow_background: any;
let logo: any;
let defaultStatLevel: number;
let add_buffer: any;
let add_offset: number;
let metareap_needed: number;
let ReadMetasSend$req: Ptr | null;
let ReadMetasSend$reqlen: number;
let metawindow$lastHeight: number;

function make_help(): void {
  let i = 0;
  let l = 0;
  let h = 0;
  let w = 0;
  h = Math.trunc(408 / 8) | 0;
  w = 0;
  for (i = 0; i < h; ++i) {
    let line = G.metahelp_message[i];
    if (!line) {
      break;
    }
    l = strlen(line) | 0;
    if (l > w) {
      w = l;
    }
  }
  metaHelpWin = W_MakeWindow(S("Netrek Server List - Help"), 500, 500, Math.imul(w, G.W_Textwidth) + 40, Math.imul(h, G.W_Textheight) + 40, null, 2, G.foreColor);
}

function expo_help(): void {
  let i = 0;
  let h = 0;
  h = Math.trunc(408 / 8) | 0;
  for (i = 0; i < h; ++i) {
    let line = G.metahelp_message[i];
    if (!line) {
      break;
    }
    W_WriteText(metaHelpWin, 20, Math.imul(i, G.W_Textheight) + 20, G.textColor, line, -1, G.W_RegularFont);
  }
}

function show_help(): void {
  W_MapWindow(metaHelpWin);
}

function hide_help(): void {
  W_UnmapWindow(metaHelpWin);
}

function toggle_help(): void {
  if (W_IsMapped(metaHelpWin)) {
    hide_help();
  } else {
    show_help();
  }
}

function ReadMetasSend(): number {
  let metaservers = null;
  let token = null;
  let address = new struct_sockaddr_in();
  last = time(null);
  if (!!getdefault(S("metaserver"))) {
    G.metaserver = getdefault(S("metaserver"));
  }
  G.metaport = intDefault(S("metaport"), G.metaport);
  verbose = booleanDefault(S("metaverbose"), verbose);
  if (msock < 0) {
    msock = socket(AF_INET, SOCK_DGRAM, 0);
    if (msock < 0) {
      perror(S("ReadMetasSend: socket"));
      return 0;
    }
    address.sin_addr.s_addr = INADDR_ANY;
    address.sin_family = AF_INET;
    address.sin_port = 0;
    if (bind(msock, $cast(struct_sockaddr, address), 16) < 0) {
      perror(S("ReadMetasSend: bind"));
      close(msock);
      return 0;
    }
    ReadMetasSend$req = P(new Int8Array(80));
    snprintf(ReadMetasSend$req, 80, S("?version=netrek-client-cow-%s.%d"), S("3.3"), PATCHLEVEL);
    ReadMetasSend$reqlen = strlen(ReadMetasSend$req) | 0;
  }
  address.sin_family = AF_INET;
  address.sin_port = htons(G.metaport & 0xffff);
  address.sin_addr.s_addr = inet_addr(S("224.0.0.1"));
  if (verbose) {
    fprintf(R.stderr, S("requesting player list from nearby servers on %s\n"), inet_ntoa(address.sin_addr.$clone()));
  }
  if (sendto(msock, ReadMetasSend$req, $u64(ReadMetasSend$reqlen), 0, $cast(struct_sockaddr, address), 16) < 0) {
    perror(S("ReadMetasSend: sendto"));
  } else {
    ++sent;
  }
  metaservers = strdup(G.metaserver);
  token = strtok(metaservers, S(","));
  while (!!token) {
    address.sin_family = AF_INET;
    address.sin_port = htons(G.metaport & 0xffff);
    while (token.a[token.o] === 32) {
      token = token.add(1);
    }
    if ((address.sin_addr.s_addr = inet_addr(token)) === 4294967295) {
      let hp = null;
      if (!(hp = gethostbyname(token))) {
        fprintf(R.stderr, S("cannot resolve host %s, check for DNS problems?\n"), token);
      } else {
        let i = 0;
        for (i = 0; ; ++i) {
          if (!hp.h_addr_list.a[hp.h_addr_list.o + i]) {
            break;
          }
          address.sin_addr.s_addr = $rd($pcast(hp.h_addr_list.a[hp.h_addr_list.o + i], 8, true, false)) >>> 0;
          if (verbose) {
            fprintf(R.stderr, S("requesting player list from metaserver %s at %s\n"), token, inet_ntoa(address.sin_addr.$clone()));
          }
          if (sendto(msock, ReadMetasSend$req, $u64(ReadMetasSend$reqlen), 0, $cast(struct_sockaddr, address), 16) < 0) {
            perror(S("ReadMetasSend: sendto"));
          } else {
            ++sent;
          }
        }
      }
    } else {
      if (verbose) {
        fprintf(R.stderr, S("requesting player list from metaserver %s\n"), inet_ntoa(address.sin_addr.$clone()));
      }
      if (sendto(msock, ReadMetasSend$req, $u64(ReadMetasSend$reqlen), 0, $cast(struct_sockaddr, address), 16) < 0) {
        perror(S("ReadMetasSend: sendto"));
      } else {
        ++sent;
      }
    }
    token = strtok(null, S(","));
  }
  free(metaservers);
  metaWindowName = S("Netrek Server List");
  return sent;
}

function grow(servers: number): void {
  let size = 0;
  if (!G.serverlist) {
    size = 256 * $u64(servers) | 0;
    G.serverlist = $salloc(struct_servers, $u64(size));
  } else {
    size = 256 * $u64(servers + num_servers[0]) | 0;
    G.serverlist = $cast(struct_servers, realloc(G.serverlist, $u64(size)));
    if (!G.serverlist) {
      fprintf(R.stderr, S("unable to allocate memory to grow server list\n"));
      exit(1);
    }
  }
}

function server_find(address: Ptr | null, port: number): struct_servers | null {
  let j = 0;
  for (j = 0; j < num_servers[0]; ++j) {
    let sp = $sadd(G.serverlist, j);
    if (!strcmp(P(sp.address), address) && sp.port === port) {
      return sp;
    }
  }
  return null;
}

function version_r(address: struct_sockaddr_in | null): void {
  let p = null;
  let servers = 0;
  let i = 0;
  let now = time(null);
  p = strtok(null, S("\n"));
  if (!p) {
    return;
  }
  servers = atoi(p);
  if (servers > 2048) {
    return;
  }
  if (servers < 0) {
    return;
  }
  if (verbose) {
    fprintf(R.stderr, S("metaserver at %s responded with %d server%s\n"), inet_ntoa(address.sin_addr.$clone()), servers, servers === 1 ? S("") : S("s"));
  }
  if (servers === 0) {
    return;
  }
  for (i = 0; i < servers; ++i) {
    let sp = null;
    let host = null;
    let type = 0;
    let port = 0;
    let status = 0;
    let age = 0;
    let players = 0;
    let queue = 0;
    let throwaway = 0;
    throwaway = 0;
    host = strtok(null, S(","));
    if (!host) {
      continue;
    }
    p = strtok(null, S(","));
    if (!p) {
      continue;
    }
    port = atoi(p);
    p = strtok(null, S(","));
    if (!p) {
      continue;
    }
    status = atoi(p);
    if (status > statusLevel[0]) {
      ++throwaway;
    }
    if (status === 6) {
      if (status - 3 <= statusLevel[0]) {
        --throwaway;
      }
    }
    p = strtok(null, S(","));
    if (!p) {
      continue;
    }
    age = atoi(p);
    p = strtok(null, S(","));
    if (!p) {
      continue;
    }
    players = atoi(p);
    p = strtok(null, S(","));
    if (!p) {
      continue;
    }
    queue = atoi(p);
    p = strtok(null, S("\n"));
    if (!p) {
      continue;
    }
    type = p.a[p.o];
    if (type === 80) {
      ++throwaway;
    }
    if (throwaway) {
      continue;
    }
    sp = server_find(host, port);
    if (!!sp) {
      if (now - age < sp.when - sp.age) {
        sp.age = now - (sp.when - sp.age) | 0;
        sp.when = now;
        sp.refresh = 1;
        sp.lifetime = 20;
        continue;
      } else {
        sp.age = age;
        sp.when = now;
        sp.lifetime = 20;
      }
    } else {
      grow(1);
      sp = $sadd(G.serverlist, num_servers[0]);
      ++num_servers[0];
      strncpy(P(sp.address), host, LINE);
      sp.port = port;
      sp.age = age;
      sp.when = now;
      sp.lifetime = 4;
    }
    sp.refresh = 1;
    switch (status) {
    case 1:
      sp.status = statusWait;
      sp.players = queue;
      break;
    case 2:
      sp.status = statusOpen;
      sp.players = players;
      break;
    case 3:
      sp.status = statusNobody;
      sp.players = 0;
      break;
    case 6:
      sp.status = statusTout;
      sp.players = 0;
      break;
    case 4:
    case 0:
    case 5:
    default:
      sp.status = statusNoConnect;
      sp.players = 0;
      break;
    }
    sp.typeflag = type;
    strcpy(P(sp.comment), S(""));
    sp.pid = -1;
    sp.exitstatus = 0;
    sp.observer = 0;
  }
}

function version_s(address: struct_sockaddr_in | null): void {
  let p = null;
  let now = time(null);
  let host = inet_ntoa(address.sin_addr.$clone());
  if (verbose) {
    fprintf(R.stderr, S("server at %s responded\n"), host);
  }
  p = strtok(null, S(","));
  if (!p) {
    return;
  }
  let type = p.a[p.o];
  if (type === 80) {
    return;
  }
  p = strtok(null, S(","));
  if (!p) {
    return;
  }
  let comment = strdup(p);
  if (strlen(comment) > LINE) {
    comment.a[comment.o + LINE] = 0;
  }
  p = strtok(null, S(","));
  if (!p) {
    return;
  }
  p = strtok(null, S(","));
  if (!p) {
    return;
  }
  let port = atoi(p);
  p = strtok(null, S(","));
  if (!p) {
    return;
  }
  let players = atoi(p);
  p = strtok(null, S(","));
  if (!p) {
    return;
  }
  let sp = server_find(host, port);
  if (!sp) {
    grow(1);
    sp = $sadd(G.serverlist, num_servers[0]);
    ++num_servers[0];
  }
  strncpy(P(sp.address), host, LINE);
  sp.port = port;
  sp.age = 0;
  sp.when = now;
  sp.refresh = 1;
  sp.lifetime = 20;
  sp.players = players;
  if (type === 117 && players === 0) {
    sp.status = statusNobody;
  } else {
    sp.status = statusOpen;
  }
  sp.typeflag = type;
  strncpy(P(sp.comment), comment, LINE);
  sp.pid = -1;
  sp.exitstatus = 0;
  sp.observer = 0;
  free(comment);
}

async function ReadMetasRecv(x: number): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let address = new struct_sockaddr_in();
  const length = new Uint32Array(1);
  let bytes = 0;
  let readfds = new struct_fd_set();
  let timeout = new struct_timeval();
  let packet = new Int8Array(2048);
  let p = null;
  do {
    let __i = 0;
    let __arr = readfds;
    for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
      __arr.__fds_bits[__i] = 0;
    }
  } while (0);
  if (msock >= 0) {
    ($t1 = readfds.__fds_bits, $t2 = msock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, msock % (8 * 8)));
  }
  timeout.tv_sec = 0;
  timeout.tv_usec = 100000;
  if (x !== -1) {
    ($t3 = readfds.__fds_bits, $t4 = x / (8 * 8) | 0, $t3[$t4] = $t3[$t4] | $shl64(1, x % (8 * 8)));
  }
  if (await select(FD_SETSIZE, readfds, null, null, timeout) < 0) {
    if ($rd(P(R, "errno")) === EINTR) {
      return 0;
    }
    perror(S("ReadMetasRecv: select"));
    return 0;
  }
  if (x !== -1 && (readfds.__fds_bits[x / (8 * 8) | 0] & $shl64(1, x % (8 * 8))) !== 0) {
    return 0;
  }
  if (msock < 0) {
    return 0;
  }
  if (!((readfds.__fds_bits[msock / (8 * 8) | 0] & $shl64(1, msock % (8 * 8))) !== 0)) {
    return 0;
  }
  length[0] = 16;
  bytes = recvfrom(msock, P(packet), MAXMETABYTES, 0, $cast(struct_sockaddr, address), P(length, 0)) | 0;
  if (bytes < 0) {
    perror(S("ReadMetasRecv: recvfrom"));
    return 0;
  }
  packet[bytes] = 0;
  p = strtok(P(packet), S(","));
  if (!p) {
    return 0;
  }
  switch (p.a[p.o]) {
  case 114:
    version_r(address);
    ++seen;
    break;
  case 115:
    version_s(address);
    ++seen;
    break;
  }
  return 1;
}

function SaveMetasCache(): void {
  let cache = null;
  let cacheFileName = new Int8Array(4096);
  let tmpFileName = new Int8Array(4096);
  let cacheName = null;
  let len = 0;
  cacheName = getdefault(S("metaUDPCache"));
  if (cacheName && !findfile(cacheName, P(cacheFileName))) {
    strcpy(P(cacheFileName), cacheName);
  }
  if (cacheName) {
    len = strlen(P(cacheFileName)) | 0;
    strcpy(P(tmpFileName), P(cacheFileName));
    if (cacheFileName[len - 1] === 84 || cacheFileName[len - 1] === 116) {
      tmpFileName[len - 1] = 82;
    } else {
      tmpFileName[len - 1] = 84;
    }
    cache = fopen(P(tmpFileName), S("w"));
    if (!cache) {
      fprintf(R.stderr, S("Cannot create a metaUDPCache temporary file `%s'\n"), P(tmpFileName));
      fprintf(R.stderr, S("Meta-server read will not be cached.\n"));
    }
  } else {
    cache = null;
  }
  if (!!cache) {
    if (fwrite(P(statusLevel, 0), 4, 1, cache) !== 1 || fwrite(P(num_servers, 0), 4, 1, cache) !== 1 || fwrite(G.serverlist, 256, $u64(num_servers[0]), cache) !== $u64(num_servers[0])) {
      let xerrno = $rd(P(R, "errno"));
      fclose(cache);
      unlink(P(tmpFileName));
      $wr(P(R, "errno"), 0, xerrno);
      perror(S("Could not write to the new cache file"));
    } else {
      fclose(cache);
    }
    if (rename(P(tmpFileName), cacheName) === -1) {
      perror(S("Could not rename new cache file"));
    }
  }
}

function LoadMetasCache(): void {
  let $t1: any, $t2: any;
  let cache = null;
  let cacheName = null;
  let cacheFileName = new Int8Array(4096);
  const i = new Int32Array(1);
  cacheName = getdefault(S("metaUDPCache"));
  if (!cacheName) {
    num_servers[0] = 0;
    return;
  }
  findfile(cacheName, P(cacheFileName));
  cache = fopen(P(cacheFileName), S("r"));
  if (!cache) {
    num_servers[0] = 0;
    return;
  }
  if (fread(P(i, 0), 4, 1, cache) !== 1 || i[0] !== statusLevel[0]) {
    num_servers[0] = 0;
    fclose(cache);
    return;
  }
  if (fread(P(num_servers, 0), 4, 1, cache) !== 1) {
    num_servers[0] = 0;
    fclose(cache);
    return;
  }
  G.serverlist = $sarr(struct_servers, 256 * $u64(num_servers[0]) / 256)[0];
  if (fread(G.serverlist, 256, $u64(num_servers[0]), cache) !== $u64(num_servers[0])) {
    free(G.serverlist);
    G.serverlist = null;
    num_servers[0] = 0;
    fclose(cache);
    return;
  }
  fclose(cache);
  for (i[0] = 0; i[0] < num_servers[0]; ++i[0]) {
    let j = 0;
    $sadd(G.serverlist, i[0]).refresh = 1;
    if (($t1 = $sadd(G.serverlist, i[0]), $t2 = $t1.lifetime, $t1.lifetime = $t2 - 1, $t2) > 0) {
      continue;
    }
    for (j = i[0]; j < num_servers[0] - 1; ++j) {
      memcpy($sadd(G.serverlist, j), $sadd(G.serverlist, (j + 1)), 256);
    }
    --i[0];
    --num_servers[0];
    G.serverlist = $cast(struct_servers, realloc(G.serverlist, 256 * $u64(num_servers[0])));
    if (!G.serverlist) {
      fprintf(R.stderr, S("unable to allocate memory to grow server list\n"));
      exit(1);
    }
  }
}

export function parsemeta(): void {
  statusLevel[0] = intDefault(S("metaStatusLevel"), defaultStatLevel);
  if (statusLevel[0] < 0) {
    statusLevel[0] = 0;
  } else if (statusLevel[0] >= statusNull) {
    statusLevel[0] = statusNull - 1;
  }
  ReadMetasSend();
  LoadMetasCache();
  metaHeight = 2 + N_OVERHEAD + 4 + N_OVERHEAD;
}

function redraw(i: number): void {
  let buf = new Int8Array(101);
  let sp = null;
  if (i >= num_servers[0]) {
    if (i < metaHeight - 3) {
      W_WriteText(metaList, 0, i + 1, G.W_White, S(""), 0, null);
    }
    return;
  }
  sp = $sadd(G.serverlist, i);
  let comment = new Int8Array(40);
  if (strlen(P(sp.comment)) > 0) {
    strncpy(P(comment), P(sp.comment), 40);
  } else {
    strncpy(P(comment), P(sp.address), 40);
  }
  snprintf(P(buf), LINE, S("%-40s          "), P(comment));
  buf[80] = 0;
  let str = P(buf).add(strlen(P(buf)));
  let size = LINE - strlen(P(buf));
  switch (sp.status) {
  case statusOpen:
    snprintf(str, $u64(sp.players + 1), S("################"));
    str = str.add(sp.players);
    size = size - $u64(sp.players);
    snprintf(str, $u64(16 - sp.players + 1), S("                "));
    strncat(P(buf), S("    "), LINE);
    break;
  case statusWait:
    snprintf(str, size, S("################ Q%2d"), sp.players);
    break;
  default:
    snprintf(str, size, S("%-16s    "), G.statusStrings[sp.status]);
    break;
  }
  switch (sp.typeflag) {
  case 80:
    strcat(P(buf), S("Paradise"));
    break;
  case 66:
    strcat(P(buf), S("Bronco  "));
    break;
  case 67:
    strcat(P(buf), S("Chaos   "));
    break;
  case 69:
    strcat(P(buf), S("Empire  "));
    break;
  case 73:
    strcat(P(buf), S("INL     "));
    break;
  case 83:
    strcat(P(buf), S("Sturgeon"));
    break;
  case 72:
    strcat(P(buf), S("Hockey  "));
    break;
  case 70:
    strcat(P(buf), S("Dogfight"));
    break;
  default:
    strcat(P(buf), S("Unknown "));
    break;
  }
  {
    let age = sp.age;
    let units = null;
    if (age > 86400) {
      age = age / 86400 | 0;
      units = S("d");
    } else if (age > 3600) {
      age = age / 3600 | 0;
      units = S("h");
    } else if (age > 90) {
      age = age / 60 | 0;
      units = S("m");
    } else {
      units = S("s");
    }
    sprintf(P(buf).add(strlen(P(buf))), S(" %4d%s"), age, units);
  }
  strcat(P(buf), S("    "));
  if (sp.pid !== -1) {
    strcat(P(buf), sp.observer ? S("Observing") : S("Playing"));
  } else {
    switch (sp.exitstatus) {
    case -2:
      strcat(P(buf), S("Cannot Start"));
      break;
    case -1:
    case 0:
      break;
    case 1:
      strcat(P(buf), S("Connect Fail"));
      break;
    case 2:
      strcat(P(buf), S("Login Fail"));
      break;
    default:
      {
        let badversion = sp.exitstatus - EXIT_BADVERSION_BASE;
        if (badversion >= 0 && badversion <= MAXBADVERSION) {
          strcat(P(buf), badversion_short_strings[badversion]);
        } else {
          strcat(P(buf), S("Unknown Response"));
        }
      }
      break;
    }
  }
  let color = G.W_White;
  if (i === chosen) {
    color = G.W_Green;
  }
  if (sp.status === statusCantConnect) {
    color = G.W_Red;
  }
  if (sp.pid !== -1) {
    color = G.W_Cyan;
  }
  W_WriteText(metaList, 0, i + 1, color, P(buf), -1, null);
  sp.refresh = 0;
}

function add_init(): void {
  add_buffer[0] = 0;
  add_offset = 0;
}

function add_redraw(): void {
  let buf = new Int8Array(201);
  snprintf(P(buf), LINE + LINE, S("Add a server: %s_"), P(add_buffer));
  W_WriteText(metaList, 0, metaHeight - B_ADD, G.W_Yellow, P(buf), -1, null);
}

function add_commit(): void {
  let sp = null;
  grow(1);
  sp = $sadd(G.serverlist, num_servers[0]);
  ++num_servers[0];
  strncpy(P(sp.address), P(add_buffer), LINE);
  sp.port = 2592;
  sp.age = 0;
  sp.when = time(null);
  sp.refresh = 1;
  sp.lifetime = 20;
  sp.players = 0;
  sp.status = statusNobody;
  sp.typeflag = 85;
  strncpy(P(sp.comment), P(add_buffer), LINE);
  sp.pid = -1;
  sp.exitstatus = 0;
  sp.observer = 0;
  metawindow();
}

function add_key(data: struct_event | null): number {
  if (data.key === 13) {
    add_commit();
    add_init();
    add_redraw();
  } else if (data.key === 21) {
    add_init();
    add_redraw();
  } else if (data.key === 8 || data.key === 127) {
    if (add_offset > 0) {
      add_buffer[add_offset - 1] = 0;
      --add_offset;
      add_redraw();
    }
  } else if (add_offset < LINE - 1) {
    add_buffer[add_offset + 1] = 0;
    add_buffer[add_offset] = data.key << 24 >> 24;
    ++add_offset;
    add_redraw();
  }
  return 0;
}

export function metawindow(): void {
  let i = 0;
  let height = 0;
  let header = null;
  if (!metaWin) {
    height = 350 + Math.imul(metaHeight, G.W_Textheight + 8) + 4 * (metaHeight - 1);
    metaWin = W_MakeWindow(S("Netrek Server List"), 0, 0, 716, height, null, 2, G.foreColor);
    metawindow_background = W_SetBackgroundImage(metaWin, S("Misc/map_back.png"));
    logo = W_ReadImage(metaWin, S("netrek-green-white-300px.png"));
    metaList = W_MakeMenu(S("metalist"), 50, 200, LINE, metaHeight, metaWin, 1);
    metawindow$lastHeight = metaHeight;
    make_help();
  } else {
    if (metaHeight > metawindow$lastHeight) {
      W_ReinitMenu(metaList, LINE, metaHeight);
      W_ResizeMenu(metaList, LINE, metaHeight);
      metawindow$lastHeight = metaHeight;
    }
  }
  header = S("Server                                            Players            Type       Age");
  W_WriteText(metaList, 0, 0, G.W_Cyan, header, -1, null);
  for (i = 0; i < metaHeight; ++i) {
    redraw(i);
  }
  W_RenameWindow(metaWin, metaWindowName);
  W_WriteText(metaList, 0, metaHeight - B_REFRESH, G.W_Yellow, S("Refresh                                           (r)"), -1, null);
  add_redraw();
  W_WriteText(metaList, 0, metaHeight - B_HELP, G.W_Yellow, S("Help & Tips                                       (h)"), -1, null);
  W_WriteText(metaList, 0, metaHeight - B_QUIT, G.W_Yellow, S("Quit                                              (q)"), -1, null);
  W_MapWindow(metaList);
  W_MapWindow(metaWin);
}

function metadone(): void {
  SaveMetasCache();
  W_UnmapWindow(metaList);
  W_DestroyMenu(metaList);
  W_DropImage(logo);
  W_UnmapWindow(metaWin);
  W_DestroyWindow(metaWin);
  W_DropImage(metawindow_background);
  free(G.serverlist);
}

function refresh(): void {
  W_WriteText(metaList, 0, metaHeight - B_REFRESH, G.W_Red, S("Refresh (in progress)"), -1, null);
  W_NextScreenShot(metaWin, 0, 0);
  W_Flush();
  ReadMetasSend();
}

function refresh_cyclic(): void {
  let sp = null;
  let i = 0;
  let interval = 30;
  for (i = 0; i < num_servers[0]; ++i) {
    sp = $sadd(G.serverlist, i);
    if (sp.pid !== -1) {
      if (!sp.observer) {
        return;
      }
      interval = 90;
    }
  }
  if (time(null) - last > interval) {
    W_NextScreenShot(metaWin, 0, 0);
    ReadMetasSend();
  }
}

function choose(way: number): void {
  let was = 0;
  let lo = 0;
  let hi = num_servers[0] - 1;
  if (hi < 0) {
    return;
  }
  was = chosen;
  if (chosen === -1) {
    chosen = lo;
    if (way > 0) {
      chosen = lo;
    }
    if (way < 0) {
      chosen = hi;
    }
  } else {
    if (way > 0) {
      ++chosen;
      if (chosen > hi) {
        chosen = hi;
      }
    }
    if (way < 0) {
      --chosen;
      if (chosen < lo) {
        chosen = lo;
      }
    }
  }
  if (was !== chosen) {
    if (was !== -1) {
      redraw(was);
    }
    redraw(chosen);
  }
}

function chose(which: number, key: number): number {
  let $t1: any;
  let sp = null;
  let pid = 0;
  if (which !== chosen) {
    let was = 0;
    was = chosen;
    chosen = which;
    if (was !== -1) {
      redraw(was);
    }
    redraw(chosen);
  }
  sp = $sadd(G.serverlist, which);
  G.xtrekPort = sp.port;
  if (key === W_RBUTTON) {
    ++G.xtrekPort;
    fprintf(R.stderr, S("you chose to observe on %s, guessing port %d\n"), P(sp.address), G.xtrekPort);
  }
  G.serverName = strdup(P(sp.address));
  sp.pid = -1;
  sp.exitstatus = EXIT_UNKNOWN;
  fprintf(R.stderr, S("you chose server %s port %d\n"), G.serverName, G.xtrekPort);
  if ((pid = fork()) === 0) {
    let args = new Array(16).fill(null);
    let argc = 0;
    setpgid(0, 0);
    args[argc++] = G.program;
    args[argc++] = S("--server");
    args[argc++] = G.serverName;
    if (G.xtrekPort !== DEFAULT_PORT) {
      let port = new Int8Array(32);
      sprintf(P(port), S("%d"), G.xtrekPort);
      args[argc++] = S("--port");
      ($t1 = strdup(P(port)), args[argc++] = $t1);
    }
    if (key === W_MBUTTON) {
      args[argc++] = S("--fast-guest");
    }
    args[argc++] = null;
    execvp(G.program, P(args));
    perror(S("execvp"));
    _exit(1);
  }
  if (pid < 0) {
    perror(S("fork"));
    sp.exitstatus = EXIT_FORK_FAILURE;
  } else {
    sp.pid = pid;
    sp.observer = key === W_RBUTTON ? 1 : 0;
  }
  redraw(which);
  W_Flush();
  return 0;
}

function button(data: struct_event | null): number {
  if (data.y > 0 && data.y <= num_servers[0]) {
    return chose(data.y - 1, data.key);
  }
  if (data.y === metaHeight - B_REFRESH) {
    refresh();
  } else if (data.y === metaHeight - B_HELP) {
    toggle_help();
  } else if (data.y === metaHeight - B_QUIT) {
    metadone();
    return 1;
  }
  return 0;
}

function key(data: struct_event | null): number {
  if (data.y === metaHeight - B_ADD) {
    return add_key(data);
  }
  if (data.key === 113 || data.key === 196) {
    metadone();
    return 1;
  } else if (data.key === 114 || data.key === 210) {
    refresh();
  } else if (data.key === W_Key_Up) {
    choose(-1);
  } else if (data.key === W_Key_Down) {
    choose(1);
  } else if (data.key === 13 || data.key === 32) {
    if (chosen !== -1) {
      return chose(chosen, W_LBUTTON);
    }
  } else if (data.key === 103) {
    if (chosen !== -1) {
      return chose(chosen, W_MBUTTON);
    }
  } else if (data.key === 111) {
    if (chosen !== -1) {
      return chose(chosen, W_RBUTTON);
    }
  } else if (data.key === 104) {
    toggle_help();
  } else {
    return button(data);
  }
  return 0;
}

function metareap(): number {
  let sp = null;
  let i = 0;
  const status = new Int32Array(1);
  let activity = 0;
  let pid = 0;
  metareap_needed = 0;
  activity = 0;
  for (i = 0; i < num_servers[0]; ++i) {
    sp = $sadd(G.serverlist, i);
    if (sp.pid !== -1) {
      pid = waitpid(sp.pid, P(status, 0), WNOHANG);
      if (pid === sp.pid) {
        sp.pid = -1;
        if ((status[0] & 127) === 0) {
          ++activity;
          sp.exitstatus = (status[0] & 65280) >> 8;
        }
        redraw(i);
        W_Flush();
      }
    }
  }
  return activity;
}

export function sigchld(ignored: number): void {
  ++metareap_needed;
}

export async function metainput(): Promise<void> {
  let data = new struct_event();
  signal(17, sigchld);
  while (W_IsMapped(metaWin)) {
    while (1) {
      W_Flush();
      if (await W_EventsPending()) {
        break;
      }
      if (await ReadMetasRecv(W_Socket()) || metareap_needed) {
        metareap();
        metaHeight = num_servers[0] + N_OVERHEAD + 4 + N_OVERHEAD;
        metawindow();
        W_Flush();
      }
      refresh_cyclic();
    }
    await W_NextEvent(data);
    switch (data.type) {
    case 2:
      if ($peq(data.Window, metaList) || $peq(data.Window, metaWin)) {
        if (key(data)) {
          return;
        }
      }
      if ($peq(data.Window, metaHelpWin)) {
        hide_help();
      }
      break;
    case 3:
      if ($peq(data.Window, metaList)) {
        if (button(data)) {
          return;
        }
      }
      if ($peq(data.Window, metaHelpWin)) {
        hide_help();
      }
      if ($peq(data.Window, metaWin) && data.y < 200) {
        W_NextScreenShot(metaWin, 0, 0);
      }
      break;
    case 1:
      if ($peq(data.Window, metaHelpWin)) {
        expo_help();
      }
      if ($peq(data.Window, metaWin)) {
        W_DrawScreenShot(metaWin, 0, 0);
        W_DrawImage(200, 9, logo);
      }
      break;
    case 6:
      if ($peq(data.Window, metaWin)) {
        fprintf(R.stderr, S("you quit, by closing the server list window\n"));
        return;
      }
      break;
    default:
      break;
    }
  }
}

export function $init(): void {
  badversion_long_strings = [S("CP_SOCKET version does not match.\nYou need a new version of the client code."),
S("Access denied by server."),
S("No free slots on server queue."),
S("Banned from server."),
S("Game shutdown by server."),
S("Server daemon stalled, internal error."),
S("Server reports internal error.")];
  badversion_short_strings = [S("Bad Version"),
S("Access Denied"),
S("No Free Slots"),
S("Banned"),
S("Game Shut"),
S("Internal Error"),
S("Internal Error")];
  msock = -1;
  sent = 0;
  seen = 0;
  verbose = 0;
  last = 0;
  G.serverlist = null;
  num_servers = new Int32Array(1);
  num_servers[0] = 0;
  chosen = -1;
  metaHeight = 0;
  metaWindowName = null;
  statusLevel = new Int32Array(1);
  statusLevel[0] = 0;
  metaWin = null;
  metaList = null;
  metaHelpWin = null;
  metawindow_background = null;
  logo = null;
  G.statusStrings = [S(""),
S("Wait queue:"),
S("-"),
S("Timed out"),
S("No connection"),
S("Active"),
S("CANNOT CONNECT"),
S("DEFAULT SERVER")];
  defaultStatLevel = statusTout;
  G.metahelp_message = [S("Netrek Server List - Help"),
S(""),
S("This is a list of Netrek servers, from the Metaserver, or on your"),
S("local network.  You can do this:"),
S(""),
S("  -  click on a server to join the game there,"),
S(""),
S("  -  middle-click on a server to immediately join as guest,"),
S(""),
S("  -  right-click on a server to observe the game there,"),
S(""),
S("  -  click refresh to reload the list of servers,"),
S(""),
S("-- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- -- --"),
S(""),
S("Tips for new Netrek players:"),
S(""),
S("  1.  when you enter the game, press the number 4 to start moving,"),
S("  other numbers are slower or faster,"),
S(""),
S("  2.  you are the white ship in the centre of the left-hand screen,"),
S(""),
S("  3.  use right-click on the mouse to steer toward a point in space,"),
S("  you will find it easier to turn at lower speeds,"),
S(""),
S("  4.  use left-click on the mouse to fire a torpedo, they travel over"),
S("  time so you have to point ahead of your target, they hurt enemy"),
S("  ships but usually pass right through your team,"),
S(""),
S("  5.  use middle-click on your mouse to fire a phaser, they are"),
S("  instant so point at your target, but only work well close up,"),
S(""),
S("  6.  the aim of the game is to capture planets, killing enemies is"),
S("  only a means to an end, and dying is a good thing, because you get a"),
S("  new ship,"),
S(""),
S("  7.  but if someone kills you, they can begin to capture planets, so"),
S("  it is best to not die in vain,"),
S(""),
S("  8.  people in your team will try to communicate so that you can all"),
S("  do things together, because when you cooperate better than the other"),
S("  team, you win."),
S(""),
S("  9.  use the 'h' key to see a list of commands for your ship."),
S(""),
S("Observing is a good way to learn.  When you join as an observer, you"),
S("won't see much until you use 'l' (lower-case L) to lock on to a"),
S("player.  Choose a good player and watch what they do."),
S(""),
S("For more information on Netrek, visit http://netrek.org/beginner"),
null];
  add_buffer = new Int8Array(100);
  add_offset = 0;
  metareap_needed = 0;
  ReadMetasSend$req = null;
  ReadMetasSend$reqlen = 0;
  metawindow$lastHeight = 0;
}
