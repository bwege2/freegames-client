// @ts-nocheck
// COW 3.3.3 cowmain.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { initCensoring } from './censor.ts';
import { check } from './check.ts';
import { booleanDefault, getdefault, initDefaults, intDefault, resetdefaults, shipchange } from './defaults.ts';
import { sendVersion } from './dmessage.ts';
import { enter, init_hockey_lines, openmem } from './enter.ts';
import { sendFeature } from './feature.ts';
import { findslot } from './findslot.ts';
import { getname } from './getname.ts';
import { getship } from './getship.ts';
import { initkeymap, input } from './input.ts';
import { redrawLMeter } from './lagmeter.ts';
import { entrywindow, mapAll, newwin, newwinmeta } from './newwin.ts';
import { metainput, metawindow, parsemeta } from './parsemeta.ts';
import { startPing } from './ping.ts';
import { redrawPStats } from './pingstats.ts';
import { sendShortReq } from './short.ts';
import { DisplayMessage } from './smessage.ts';
import { Dump_Packet_Log_Info, callServer, connectToServer, sendOptionsPacket, sendShortPacket, sendUdpReq } from './socket.ts';
import { Exit_Sound, Init_Sound, Play_Sound } from './sound.ts';
import { calibrate_stats } from './stats.ts';
import { warning } from './warning.ts';
import { W_ClearArea, W_ClearWindow, W_Deinitialize, W_DestroyWindow, W_Flush, W_FullScreenOff, W_IsMapped, W_MapWindow, W_WriteText } from './x11window.ts';
import { struct___jmp_buf_tag } from './structs.ts';
import { $sadd, $sarr, G, LongJmp, P, R, S, exit, fclose, fopen, fprintf, getpid, getpwuid, getuid, longjmp, memccpy, perror, printf, signal, sprintf, srandom, strcpy, strlen, time } from '../rt/index.ts';
import { ALLTEAM, COMM_UDP, COMM_UPDATE, CRUISER, DEFAULT_PORT, ENTER_SHIP_SOUND, FED, KLI, KQUIT, ORI, PALIVE, PFENG, PFGREEN, PFRED, PFSHIELD, PFYELLOW, POUTFIT, RETURNBASE, ROM, SPK_VON } from './consts.ts';


export async function cowmain(server: Ptr | null, port: number, name: Ptr | null): Promise<number> {
  const team = new Int32Array(1);
  const s_type = new Int32Array(1);
  let cp = null;
  let buf = new Int8Array(80);
  let pwent = null;
  let i = 0;
  let $sj1 = 0;
  $SJ1: for (;;) {
    try {
      i = $sj1;
      if (i >= RETURNBASE) {
        return i - RETURNBASE;
      }
      G.pseudo[0] = G.defpasswd[0] = 0;
      if (!!G.recordFileName) {
        G.recordFile = fopen(G.recordFileName, S("wb"));
        if (!G.recordFile) {
          perror(G.recordFileName);
          return 1;
        }
      }
      if (!!G.logFileName) {
        G.logFile = fopen(G.logFileName, S("a"));
        if (!G.logFile) {
          perror(G.logFileName);
          return 1;
        }
      }
      for (i = 0; i < 80; ++i) {
        G.outmessage[i] = 0;
      }
      signal(8, handle_exception);
      srandom(time(null) >>> 0);
      initDefaults(G.deffile);
      G.identityBlind = booleanDefault(S("identityBlind"), G.identityBlind);
      G.versionHide = booleanDefault(S("versionHide"), G.versionHide);
      G.xtrekPort = port;
      if (server) {
        if (G.xtrekPort < 0) {
          sprintf(P(G.defaulttmp), S("port.%s"), server);
          G.xtrekPort = intDefault(P(G.defaulttmp), -1);
          if (G.checking) {
            G.xtrekPort = G.xtrekPort - 1;
          }
        }
        sprintf(P(G.defaulttmp), S("server.%s"), server);
        G.serverName = getdefault(P(G.defaulttmp));
        if (!G.serverName) {
          G.serverName = server;
        }
      }
      srandom(getpid() * time(null) >>> 0);
      if (!G.passive) {
        if (!G.serverName) {
          G.serverName = getdefault(S("server"));
        }
        if (!G.serverName) {
          if (!G.usemeta) {
            fprintf(R.stderr, S("using metaserver\n"));
            G.usemeta = 1;
          }
        }
      }
      if (G.xtrekPort < 0) {
        G.xtrekPort = intDefault(S("port"), DEFAULT_PORT);
        if (G.checking) {
          G.xtrekPort = G.xtrekPort - 1;
        }
      }
      if (G.checking) {
        check();
      }
      if (!G.logFileName) {
        G.logFileName = getdefault(S("logfile"));
      }
      if (!!G.logFileName) {
        G.logFile = fopen(G.logFileName, S("a"));
        if (!G.logFile) {
          perror(G.logFileName);
          return 1;
        }
      }
      if (G.usemeta) {
        newwinmeta(G.display_host, name);
        parsemeta();
        metawindow();
        await metainput();
        W_Deinitialize();
        exit(0);
      }
      newwin(G.display_host, name);
      resetdefaults();
      if (G.censorMessages) {
        initCensoring();
      }
      openmem();
      cp = getdefault(S("login"));
      if (!cp) {
        if (!!(pwent = getpwuid(getuid()))) {
          cp = pwent.pw_name;
        } else {
          cp = S("Bozo");
        }
      }
      memccpy(P(G.login), cp, 0, 16);
      G.login[16 - 1] = 0;
      if (G.fastGuest) {
        strcpy(P(G.pseudo), S("guest"));
      } else if (G.pseudo[0] === 0) {
        if (!!(cp = getdefault(S("name")))) {
          memccpy(P(G.pseudo), cp, 0, 16);
        } else {
          memccpy(P(G.pseudo), P(G.login), 0, 16);
        }
      }
      G.pseudo[16 - 1] = 0;
      if (G.fastGuest) {
        strcpy(P(G.defpasswd), S("guest"));
      } else if (G.defpasswd[0] === 0) {
        if (!!(cp = getdefault(S("password")))) {
          memccpy(P(G.defpasswd), cp, 0, 16);
        }
      }
      G.defpasswd[16 - 1] = 0;
      if (!G.passive) {
        callServer(G.xtrekPort, G.serverName);
      } else {
        await connectToServer(G.xtrekPort);
      }
      sendFeature(S("FEATURE_PACKETS"), 83, 1, 0, 0);
      await findslot();
      mapAll();
      await getname(P(G.pseudo), P(G.defpasswd));
      G.loggedIn = 1;
      G.phaserWindow = booleanDefault(S("phaserWindow"), G.phaserWindow);
      initkeymap();
      sendOptionsPacket();
      G.me.p_hostile = FED | ROM | KLI | ORI;
      if (!G.newDashboard) {
        sprintf(P(buf), S("Maximum:      %2d  %3d %3d               %3d   %6d   %3d   %3d"), 0, 0, 0, 0, 0, 0, 0);
        W_WriteText(G.tstatw, 50, 27, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      }
      G.me.p_planets = 0;
      G.me.p_genoplanets = 0;
      G.me.p_armsbomb = 0;
      G.me.p_genoarmsbomb = 0;
      G.me.p_whydead = KQUIT;
      G.me.p_team = ALLTEAM;
      s_type[0] = CRUISER;
      startPing();
      await Init_Sound();
      G.isFirstEntry = 1;
      let $sj2 = 0;
      $SJ2: for (;;) {
        try {
          i = $sj2;
          if (i >= RETURNBASE) {
            W_FullScreenOff(G.baseWin);
            W_Flush();
            W_DestroyWindow(G.baseWin);
            W_Deinitialize();
            return i - RETURNBASE;
          }
          if (G.ignore_signals) {
            signal(7, reset_game);
            signal(11, reset_game);
          }
          if (G.died_from_signal) {
            G.died_from_signal = 0;
            await input();
          } else {
            if (G.ghoststart) {
              let getteam = S("IFR K   O");
              let i = 0;
              G.ghoststart = 0;
              for (i = 0; i < 9; ++i) {
                if (getteam.a[getteam.o + i] === G.me.p_mapchars[0]) {
                  break;
                }
              }
              G.me.p_team = i << 16 >> 16;
              if (G.me.p_damage > G.me.p_ship.s_maxdamage) {
                G.me.p_status = POUTFIT;
                await entrywindow(P(team, 0), P(s_type, 0));
              } else {
                G.me.p_status = PALIVE;
              }
            } else {
              await entrywindow(P(team, 0), P(s_type, 0));
            }
            if (team[0] === -1) {
              W_FullScreenOff(G.baseWin);
              W_Flush();
              W_DestroyWindow(G.baseWin);
              sendShortPacket(29, 0);
              fprintf(R.stderr, S("you quit\n"));
              Exit_Sound();
              if (!!G.logFile) {
                fclose(G.logFile);
              }
              if (G.log_packets) {
                Dump_Packet_Log_Info();
              }
              W_Deinitialize();
              return 0;
            }
            {
              let buf = new Int8Array(80);
              if (G.me.p_stats.st_rank < G.nranks) {
                sprintf(P(buf), S("Welcome aboard %s!"), $sadd(G.ranks, G.me.p_stats.st_rank).name);
              } else {
                sprintf(P(buf), S("Welcome aboard!"));
              }
              warning(P(buf));
              W_ClearArea(G.messagew, 5, 5, G.W_Textwidth * 80, G.W_Textheight);
            }
            sendVersion();
            getship(G.myship, G.myship.s_type);
            G.redrawall = 2;
            shipchange(s_type[0]);
            enter();
            calibrate_stats();
            W_ClearWindow(G.w);
            G.me.p_flags = (G.me.p_flags & 4294954943) >>> 0;
            G.me.p_flags = (G.me.p_flags | (PFGREEN | PFSHIELD)) >>> 0;
            G.me.p_status = PALIVE;
            {
              G.updatePlayer[G.me.p_no] = 1;
              G.plistUpdated = 1;
            }
            ;
            if (G.showStats) {
              W_MapWindow(G.statwin);
            }
            if (W_IsMapped(G.lMeter)) {
              redrawLMeter(null);
            }
            if (W_IsMapped(G.pStats)) {
              redrawPStats(null);
            }
            if (G.isFirstEntry) {
              if (G.tryUdp && G.commMode !== COMM_UDP) {
                await sendUdpReq(COMM_UDP);
              }
              if (G.tryShort) {
                sendShortReq(SPK_VON);
              } else {
                await sendUdpReq(COMM_UPDATE);
              }
              G.isFirstEntry = 0;
            }
            DisplayMessage();
            Play_Sound(ENTER_SHIP_SOUND);
            init_hockey_lines();
            await input();
          }
          return 0;
          break $SJ2;
        } catch ($e) {
          if (!($e instanceof LongJmp)) throw $e;
          $sj2 = $e.val || 1;
        }
      }
      break $SJ1;
    } catch ($e) {
      if (!($e instanceof LongJmp)) throw $e;
      $sj1 = $e.val || 1;
    }
  }
}

export function handle_exception(_dummy: number): void {
  printf(S("floating point exception error detected; attempting to continue\n"));
}

export function reset_game(_dummy: number): void {
  G.died_from_signal = 1;
  longjmp(G.env[0], 0);
}

export function terminate(error: number): void {
  if (G.recordFile) {
    fclose(G.recordFile);
  }
  longjmp(G.env[0], RETURNBASE + error);
}

export function $init(): void {
  G.takeNearest = 0;
  G.env = $sarr(struct___jmp_buf_tag, 1);
  G.isFirstEntry = 0;
  G.died_from_signal = 0;
  G.defaulttmp = new Int8Array(100);
  G.deffile = null;
  G.recordFileName = null;
  G.logFileName = null;
  G.display_host = null;
  G.passive = 0;
  G.checking = 0;
  G.usemeta = 0;
}
