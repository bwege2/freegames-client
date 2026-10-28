// @ts-nocheck
// COW 3.3.3 main.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { cowmain } from './cowmain.ts';
import { pbmain } from './playback.ts';
import { $rd, $wr, G, P, R, S, atoi, exit, fprintf, fputs, memccpy, printf, setlocale, strcmp, strrchr } from '../rt/index.ts';
import { LC_ALL, NO_PIXMAPS } from './consts.ts';


export async function main(argc: number, argv: Ptr | null): Promise<number> {
  let $t1: any, $t2: any;
  let usage = 0;
  let err = 0;
  let inplayback = 0;
  let name = null;
  let ptr = null;
  let xtrekPort = -1;
  G.program = argv.a[argv.o];
  setlocale(LC_ALL, S(""));
  G.wm_argv = argv;
  G.wm_argc = argc;
  name = $rd(($t1 = argv, argv = $t1.add(1), $t1));
  --argc;
  if (!!(ptr = strrchr(name, 47))) {
    name = ptr.add(1);
  }
  G.pseudo[0] = G.defpasswd[0] = 0;
  while (argv.a[argv.o]) {
    if (!strcmp(argv.a[argv.o], S("--help"))) {
      printUsage(name);
      exit(0);
    }
    if (!strcmp(argv.a[argv.o], S("--fast-guest"))) {
      ++G.fastGuest;
      argv = argv.add(1);
      --argc;
      continue;
    }
    if (!strcmp(argv.a[argv.o], S("--small-screen"))) {
      ++G.small_screen;
      argv = argv.add(1);
      --argc;
      continue;
    }
    if (!strcmp(argv.a[argv.o], S("--server"))) {
      argv = argv.add(1);
      --argc;
      if (argv.a[argv.o]) {
        G.servertmp = argv.a[argv.o];
        argv = argv.add(1);
        --argc;
        continue;
      }
    }
    if (!strcmp(argv.a[argv.o], S("--port"))) {
      argv = argv.add(1);
      --argc;
      if (argv.a[argv.o]) {
        xtrekPort = atoi(argv.a[argv.o]);
        argv = argv.add(1);
        --argc;
        continue;
      }
    }
    if ($rd(argv.a[argv.o]) === 45) {
      argv.a[argv.o] = argv.a[argv.o].add(1);
    } else {
      break;
    }
    --argc;
    ptr = $rd(($t2 = argv, argv = $t2.add(1), $t2));
    while (ptr.a[ptr.o]) {
      switch (ptr.a[ptr.o]) {
      case 67:
        memccpy(P(G.pseudo), argv.a[argv.o], 0, 16);
        argv = argv.add(1);
        --argc;
        break;
      case 65:
        memccpy(P(G.defpasswd), argv.a[argv.o], 0, 16);
        argv = argv.add(1);
        --argc;
        break;
      case 117:
        ++usage;
        break;
      case 99:
        G.checking = 1;
        break;
      case 115:
        if (argv.a[argv.o]) {
          xtrekPort = atoi(argv.a[argv.o]);
          G.passive = 1;
          argv = argv.add(1);
          --argc;
        }
        break;
      case 70:
        inplayback = 1;
        if ($rd(ptr.add(1)) === 105) {
          G.pb_create_index = 1;
        }
      case 102:
        G.recordFileName = argv.a[argv.o];
        argv = argv.add(1);
        --argc;
        break;
      case 108:
        G.logFileName = argv.a[argv.o];
        G.logmess = 1;
        argv = argv.add(1);
        --argc;
        break;
      case 112:
        if (argv.a[argv.o]) {
          xtrekPort = atoi(argv.a[argv.o]);
          argv = argv.add(1);
          --argc;
        }
        break;
      case 100:
        G.display_host = argv.a[argv.o];
        --argc;
        argv = argv.add(1);
        break;
      case 109:
        if (G.usemeta && G.usemeta !== 1) {
          fputs(S("The options -k and -m and -M are mutually exclusive\n"), R.stderr);
          ++err;
        }
        G.usemeta = 1;
        break;
      case 107:
        if (G.usemeta && G.usemeta !== 2) {
          fputs(S("The options -k and -m and -M are mutually exclusive\n"), R.stderr);
          ++err;
        }
        G.usemeta = 2;
        break;
      case 77:
        if (G.usemeta && G.usemeta !== 3) {
          fputs(S("The options -k, -m and -M are mutually exclusive\n"), R.stderr);
          ++err;
        }
        G.usemeta = 3;
        break;
      case 82:
        printf(S("This client does not support RSA verification\n"));
      case 111:
        printf(S("Using standard binary verification\n"));
        break;
      case 104:
        G.servertmp = argv.a[argv.o];
        --argc;
        argv = argv.add(1);
        break;
      case 85:
        if ((G.baseLocalPort = atoi(argv.a[argv.o])) === 0) {
          fprintf(R.stderr, S("Error: -U requires a port number\n"));
          exit(1);
        }
        --argc;
        argv = argv.add(1);
        break;
      case 80:
        ++G.log_packets;
        break;
      case 71:
        if (argv.a[argv.o]) {
          ++G.ghoststart;
          G.ghost_pno = atoi(argv.a[argv.o]);
          printf(S("Emergency restart being attempted...\n"));
          argv = argv.add(1);
          --argc;
        }
        break;
      case 116:
        G.title = argv.a[argv.o];
        --argc;
        argv = argv.add(1);
        break;
      case 114:
        G.deffile = argv.a[argv.o];
        argv = argv.add(1);
        --argc;
        break;
      case 68:
        ++G.debug;
        break;
      case 105:
        printf(S("Ignoring signals SIGSEGV and SIGBUS\n"));
        G.ignore_signals = -1;
        break;
      case 110:
        G.takeNearest = 1;
        break;
      case 98:
        G.pixMissing |= NO_PIXMAPS;
        break;
      case 83:
        ++G.gather_stats;
        break;
      default:
        fprintf(R.stderr, S("%s: unknown option '%c'\n"), name, ptr.a[ptr.o]);
        ++err;
        break;
      }
      ptr = ptr.add(1);
    }
  }
  if (usage || err) {
    printUsage(name);
    exit(err);
  }
  if (inplayback) {
    err = await pbmain(name);
  } else {
    err = await cowmain(G.servertmp, xtrekPort, name);
  }
  exit(err);
}

function printUsage(prog: Ptr | null): void {
  printf(S("%s\n"), S("COW 3.3"));
  printf(S("Usage: %s [options] [display-name]\n"), prog);
  printf(S("Options:\n"));
  printf(S(" [--server n]        Connect to a server immediately\n"));
  printf(S(" [--port n]          Port to connect to\n"));
  printf(S(" [--fast-guest]      Bypass login and play as guest\n"));
  printf(S(" [--small-screen]    Shrink windows to fit on an 800x600 screen\n"));
  printf(S(" [-r defaultsfile]   Specify defaults file\n"));
  printf(S(" [-s socketnum]      Specify listen socket port for manual start\n"));
  printf(S(" [-G playernum]      Reconnect after ghostbust.  Use with -s\n"));
  printf(S(" [-u]   show usage\n"));
  printf(S(" [-A]   character password\n"));
  printf(S(" [-C]   character name\n"));
  printf(S(" [-i]   ignore SIGSEGV and SIGBUS\n"));
  printf(S(" [-U port]       Specify client UDP or TCP port (useful for some firewalls)\n"));
  printf(S(" [-P]   Log server packets, repeat for increased information\n"));
  printf(S(" [-c]   to just do ck_players on the server\n"));
  printf(S(" [-f filename]   Record game into 'filename'\n"));
  printf(S(" [-F filename]   Plays the recorded game from 'filename'\n"));
  printf(S(" [-l filename]   Record messages into 'filename'\n"));
  printf(S(" [-m]   list servers, using UDP/IP to multiple metaservers\n"));
  printf(S(" [-M]   list servers, using TCP/IP to single metaserver\n"));
  printf(S(" [-k]   list servers from cache generated by -M\n"));
  printf(S(" [-n]   use nearest colors in shared colormap\n"));
  printf(S(" [-b]   do not attempt to load color pixmaps\n"));
}

export function $init(): void {
  G.servertmp = null;
}
