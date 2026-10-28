// @ts-nocheck
// COW 3.3.3 socket.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { terminate } from './cowmain.ts';
import { booleanDefault, intDefault } from './defaults.ts';
import { dmessage } from './dmessage.ts';
import { handleFeature } from './feature.ts';
import { getship } from './getship.ts';
import { ns_init, ns_record_update } from './netstat.ts';
import { motd_refresh, newMotdLine } from './newwin.ts';
import { handlePing } from './ping.ts';
import { ckRecordPacket } from './playback.ts';
import { redrawTstats } from './redraw.ts';
import { encryptReservedPacket } from './reserved.ts';
import { rotate_coord, rotate_dir } from './rotate.ts';
import { handleSMessage, handleSWarning, handleSelfShip, handleSelfShort, handleShortReply, handleVKills, handleVPhaser, handleVPlanet, handleVPlayer, handleVTorp, handleVTorpInfo, handle_s_Stats, resetWeaponInfo } from './short.ts';
import { calibrate_stats, redrawStats } from './stats.ts';
import { udprefresh } from './udpopt.ts';
import { warning } from './warning.ts';
import { W_Beep, W_ChangeBorder, W_Socket } from './x11window.ts';
import { struct_badversion_spacket, struct_beam_cpacket, struct_bomb_cpacket, struct_cloak_cpacket, struct_copilot_cpacket, struct_det_mytorp_cpacket, struct_dir_cpacket, struct_dockperm_cpacket, struct_fd_set, struct_feature_cpacket, struct_flags_spacket, struct_generic_32_spacket, struct_generic_32_spacket_a, struct_generic_32_spacket_b, struct_hostile_spacket, struct_kills_spacket, struct_login_cpacket, struct_login_spacket, struct_ltd_spacket, struct_ltd_stats, struct_mask_spacket, struct_mesg_cpacket, struct_mesg_s_spacket, struct_mesg_spacket, struct_motd_spacket, struct_options_cpacket, struct_orbit_cpacket, struct_outfit_cpacket, struct_packet_handler, struct_phaser_cpacket, struct_phaser_s_spacket, struct_phaser_spacket, struct_pickok_spacket, struct_ping_cpacket, struct_ping_spacket, struct_planet_loc_spacket, struct_planet_s_spacket, struct_planet_spacket, struct_planlock_cpacket, struct_plasma_cpacket, struct_plasma_info_spacket, struct_plasma_spacket, struct_player, struct_player_s_spacket, struct_player_spacket, struct_playlock_cpacket, struct_plyr_info_spacket, struct_plyr_login_spacket, struct_pstatus_spacket, struct_queue_spacket, struct_rank, struct_rank_spacket, struct_refit_cpacket, struct_repair_cpacket, struct_repress_cpacket, struct_reserved_cpacket, struct_reserved_spacket, struct_resetstats_cpacket, struct_sc_sequence_spacket, struct_sequence_cpacket, struct_sequence_spacket, struct_shield_cpacket, struct_ship_cap_spacket, struct_shortreply_spacket, struct_shortreq_cpacket, struct_sockaddr, struct_sockaddr_in, struct_socket_cpacket, struct_speed_cpacket, struct_stats_spacket, struct_status_spacket, struct_threshold_cpacket, struct_timeval, struct_torp_cpacket, struct_torp_info_spacket, struct_torp_spacket, struct_tractor_cpacket, struct_udp_reply_spacket, struct_udp_req_cpacket, struct_updates_cpacket, struct_war_cpacket, struct_warning_s_spacket, struct_warning_spacket, struct_you_spacket, struct_youshort_spacket, struct_youss_spacket } from './structs.ts';
import { $bytes, $cast, $pcast, $rd, $sadd, $sarrOf, $shl64, $ta, $u64, $view8, $wr, G, P, R, S, accept, bind, bzero, close, connect, ctime, exit, fclose, fprintf, fwrite, gethostbyaddr, gethostbyname, getpeername, getpid, getprotobyname, getsockname, htonl, htons, inet_addr, inet_ntoa, listen, memccpy, memcpy, memset, ntohl, ntohs, perror, printf, random, read, realloc, recvfrom, select, setsockopt, shutdown, sleep, socket, sqrt, strcpy, strdup, strlen, time, write } from '../rt/index.ts';
import { AF_INET, ALLTEAM, BUFSIZE, COMM_MODE, COMM_TCP, COMM_UDP, COMM_UPDATE, COMM_VERIFY, CONNMODE_PACKET, CONNMODE_PORT, CP_DET_MYTORP, CP_LOGIN, CP_MESSAGE, CP_OPTIONS, CP_OUTFIT, CP_REPRESS, CP_SOCKET, CP_S_MESSAGE, CP_TRACTOR, CP_UDP_REQ, CP_UPDATES, ECONNREFUSED, EINTR, EXIT_BADVERSION_BASE, FED, GENERIC_32_VERSION_A, GENERIC_32_VERSION_B, GU_UNSAFE, GWIDTH, INADDR_ANY, LTD_VERSION, MAXBADVERSION, MAXPLANETS, MAXPLASMA, MAXPLAYER, MAXTORP, MAX_PORT_RETRY, MODE_SIMPLE, MODE_TCP, NOBODY, NUMDETFRAMES, ORI, PALIVE, PDEAD, PEXPLODE, PFCLOAK, PFPLOCK, PFREE, PHASER_UPDATE_FUSE, PHHIT, PLCLEAR, PLREDRAW, PTEXPLODE, PTFREE, SCALE, SHORTVERSION, SHORT_WARNING, SOCKVERSION, SOCK_DGRAM, SOCK_STREAM, SOL_SOCKET, SO_REUSEADDR, SP_SC_SEQUENCE, SP_SEQUENCE, SP_S_8_TORP, STARBASE, STAT_CONNECTED, STAT_SWITCH_TCP, STAT_SWITCH_UDP, STAT_VERIFY_UDP, STEXTE_STRING, ST_KEEPPEACE, ST_MAPMODE, ST_NAMEMODE, ST_SHOWGLOBAL, ST_SHOWLOCAL, ST_SHOWSHIELDS, TCP_NODELAY, TEXPLODE, TFREE, UDPVERSION, UDP_CURRENT, UDP_DROPPED, UDP_RECENT_INTR, UDP_STATUS, VPLANET_SIZE, h_addr } from './consts.ts';

let badversion_long_strings: any;
let badversion_short_strings: any;
let vtsize: any;
let udpLocalPort: number;
let udpServerPort: number;
let serveraddr: number;
let sequence: number;
let drop_flag: number;
let chan: number;
let fSpeed: number;
let fDirection: number;
let fShield: number;
let fOrbit: number;
let fRepair: number;
let fBeamup: number;
let fBeamdown: number;
let fCloak: number;
let fBomb: number;
let fDockperm: number;
let fPhaser: number;
let fPlasma: number;
let fPlayLock: number;
let fPlanLock: number;
let fTractor: number;
let fRepress: number;
let Max_CPS: number;
let Max_CPSout: number;
let Start_Time: any;
let s2: number;
let sumpl: number;
let numpl: number;
let outdata_this_sec: number;
let sout2: number;
let sumout: number;
let vari_sizes: any;
let cp_msg_size: number;
let handleSelf$seen: number;
let handlePlyrInfo$lastship: number;
let handleGeneric32_b$unsafe: number;
let handleGeneric32_b$idling: number;
let handleGeneric32_b$saved_ups: number;
let handleSequence$recent_count: number;
let handleSequence$recent_dropped: number;
let Log_Packet$lasttime: number;
let Log_Packet$data_this_sec: number;

export function dummy(): void {
}

export function print_sp_s_torp(sbuf: Ptr | null, type: number): void {
  let which = 0;
  let data = null;
  let infobitset = 0;
  let infodata = null;
  let bitset = 0;
  let dx = 0;
  let dy = 0;
  let shiftvar = 0;
  let i = 0;
  let status = 0;
  let war = 0;
  let shift = 0;
  if (type === 1 || type === 2) {
    if (sbuf.a[sbuf.o] === SP_S_8_TORP) {
      bitset = 255;
      which = sbuf.a[sbuf.o + 1] & 0xff;
      data = $view8(sbuf.add(2), false);
    } else {
      bitset = sbuf.a[sbuf.o + 1] & 0xff;
      which = sbuf.a[sbuf.o + 2] & 0xff;
      data = $view8(sbuf.add(3), false);
    }
    fprintf(R.stderr, S("  bitset=0x%0X, which=%d, "), bitset, which);
    for (shift = 0, i = 0; i < 8; ++i, bitset = bitset >> 1 & 0xff) {
      if (bitset & 1) {
        dx = data.a[data.o] >> shift;
        data = data.add(1);
        shiftvar = data.a[data.o];
        shiftvar = shiftvar << 8 - shift;
        dx |= shiftvar & 511;
        ++shift;
        dy = data.a[data.o] >> shift;
        data = data.add(1);
        shiftvar = data.a[data.o];
        shiftvar = shiftvar << 8 - shift;
        dy |= shiftvar & 511;
        ++shift;
        if (shift === 8) {
          shift = 0;
          data = data.add(1);
        }
        fprintf(R.stderr, S("dx=%d, dy=%d, "), dx, dy);
      }
    }
  } else if (type === 3) {
    bitset = sbuf.a[sbuf.o + 1] & 0xff;
    which = sbuf.a[sbuf.o + 2] & 0xff;
    infobitset = sbuf.a[sbuf.o + 3] & 0xff;
    data = $view8(sbuf.add(4), false);
    fprintf(R.stderr, S("  bitset=0x%0X, which=%d, infobitset=0x%0X, "), bitset, which, infobitset);
    infodata = $view8(sbuf.add(G.vtisize[G.numofbits[sbuf.a[sbuf.o + 1] & 0xff]]), false);
    for (shift = 0, i = 0; i < 8; bitset = bitset >> 1 & 0xff, infobitset = infobitset >> 1 & 0xff, ++i) {
      if (bitset & 1) {
        dx = data.a[data.o] >> shift;
        data = data.add(1);
        shiftvar = data.a[data.o];
        shiftvar = shiftvar << 8 - shift;
        dx |= shiftvar & 511;
        ++shift;
        dy = data.a[data.o] >> shift;
        data = data.add(1);
        shiftvar = data.a[data.o];
        shiftvar = shiftvar << 8 - shift;
        dy |= shiftvar & 511;
        ++shift;
        if (shift === 8) {
          shift = 0;
          data = data.add(1);
        }
        fprintf(R.stderr, S("dx=%d, dy=%d, "), dx, dy);
      }
      if (infobitset & 1) {
        war = (infodata.a[infodata.o] & 15) << 24 >> 24;
        status = ((infodata.a[infodata.o] & 240) >> 4) << 24 >> 24;
        infodata = infodata.add(1);
        fprintf(R.stderr, S("war=0x%0X, status=0x%0X, "), war, status);
      }
    }
  }
}

function resetForce(): void {
  fSpeed = fDirection = fShield = fOrbit = fRepair = fBeamup = fBeamdown = fCloak = fBomb = fDockperm = fPhaser = fPlasma = fPlayLock = fPlanLock = fTractor = fRepress = -1;
}

export function checkForce(): void {
  let speedReq = new struct_speed_cpacket();
  let tractorReq = new struct_tractor_cpacket();
  {
    if (fSpeed > 0) {
      if (G.me.p_speed !== (fSpeed & 255)) {
        speedReq.type = 2;
        speedReq.speed = (fSpeed & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 2, fSpeed & 255);
          }
        }
        ;
        fSpeed = fSpeed - 256 << 16 >> 16;
        if (fSpeed < 256) {
          fSpeed = -1;
        }
      } else {
        fSpeed = -1;
      }
    }
  }
  ;
  {
    if (fShield > 0) {
      if (((G.me.p_flags & 1) >>> 0 && 1 ? 1 : 0) ^ (fShield & 255 && 1 ? 1 : 0)) {
        speedReq.type = 12;
        speedReq.speed = (fShield & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 12, fShield & 255);
          }
        }
        ;
        fShield = fShield - 256 << 16 >> 16;
        if (fShield < 256) {
          fShield = -1;
        }
      } else {
        fShield = -1;
      }
    }
  }
  ;
  {
    if (fOrbit > 0) {
      if (((G.me.p_flags & 8) >>> 0 && 1 ? 1 : 0) ^ (fOrbit & 255 && 1 ? 1 : 0)) {
        speedReq.type = 14;
        speedReq.speed = (fOrbit & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 14, fOrbit & 255);
          }
        }
        ;
        fOrbit = fOrbit - 256 << 16 >> 16;
        if (fOrbit < 256) {
          fOrbit = -1;
        }
      } else {
        fOrbit = -1;
      }
    }
  }
  ;
  {
    if (fRepair > 0) {
      if (((G.me.p_flags & 2) >>> 0 && 1 ? 1 : 0) ^ (fRepair & 255 && 1 ? 1 : 0)) {
        speedReq.type = 13;
        speedReq.speed = (fRepair & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 13, fRepair & 255);
          }
        }
        ;
        fRepair = fRepair - 256 << 16 >> 16;
        if (fRepair < 256) {
          fRepair = -1;
        }
      } else {
        fRepair = -1;
      }
    }
  }
  ;
  {
    if (fBeamup > 0) {
      if (((G.me.p_flags & 256) >>> 0 && 1 ? 1 : 0) ^ (fBeamup & 255 && 1 ? 1 : 0)) {
        speedReq.type = 18;
        speedReq.speed = (fBeamup & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 18, fBeamup & 255);
          }
        }
        ;
        fBeamup = fBeamup - 256 << 16 >> 16;
        if (fBeamup < 256) {
          fBeamup = -1;
        }
      } else {
        fBeamup = -1;
      }
    }
  }
  ;
  {
    if (fBeamdown > 0) {
      if (((G.me.p_flags & 512) >>> 0 && 1 ? 1 : 0) ^ (fBeamdown & 255 && 1 ? 1 : 0)) {
        speedReq.type = 18;
        speedReq.speed = (fBeamdown & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 18, fBeamdown & 255);
          }
        }
        ;
        fBeamdown = fBeamdown - 256 << 16 >> 16;
        if (fBeamdown < 256) {
          fBeamdown = -1;
        }
      } else {
        fBeamdown = -1;
      }
    }
  }
  ;
  {
    if (fCloak > 0) {
      if (((G.me.p_flags & 16) >>> 0 && 1 ? 1 : 0) ^ (fCloak & 255 && 1 ? 1 : 0)) {
        speedReq.type = 19;
        speedReq.speed = (fCloak & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 19, fCloak & 255);
          }
        }
        ;
        fCloak = fCloak - 256 << 16 >> 16;
        if (fCloak < 256) {
          fCloak = -1;
        }
      } else {
        fCloak = -1;
      }
    }
  }
  ;
  {
    if (fBomb > 0) {
      if (((G.me.p_flags & 4) >>> 0 && 1 ? 1 : 0) ^ (fBomb & 255 && 1 ? 1 : 0)) {
        speedReq.type = 17;
        speedReq.speed = (fBomb & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 17, fBomb & 255);
          }
        }
        ;
        fBomb = fBomb - 256 << 16 >> 16;
        if (fBomb < 256) {
          fBomb = -1;
        }
      } else {
        fBomb = -1;
      }
    }
  }
  ;
  {
    if (fDockperm > 0) {
      if (((G.me.p_flags & 16777216) >>> 0 && 1 ? 1 : 0) ^ (fDockperm & 255 && 1 ? 1 : 0)) {
        speedReq.type = 30;
        speedReq.speed = (fDockperm & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 30, fDockperm & 255);
          }
        }
        ;
        fDockperm = fDockperm - 256 << 16 >> 16;
        if (fDockperm < 256) {
          fDockperm = -1;
        }
      } else {
        fDockperm = -1;
      }
    }
  }
  ;
  {
    if (fPhaser > 0) {
      if ($sadd(G.phasers, G.me.p_no).ph_status !== (fPhaser & 255)) {
        speedReq.type = 4;
        speedReq.speed = (fPhaser & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 4, fPhaser & 255);
          }
        }
        ;
        fPhaser = fPhaser - 256 << 16 >> 16;
        if (fPhaser < 256) {
          fPhaser = -1;
        }
      } else {
        fPhaser = -1;
      }
    }
  }
  ;
  {
    if (fPlasma > 0) {
      if ($sadd(G.plasmatorps, G.me.p_no).pt_status !== (fPlasma & 255)) {
        speedReq.type = 5;
        speedReq.speed = (fPlasma & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 5, fPlasma & 255);
          }
        }
        ;
        fPlasma = fPlasma - 256 << 16 >> 16;
        if (fPlasma < 256) {
          fPlasma = -1;
        }
      } else {
        fPlasma = -1;
      }
    }
  }
  ;
  {
    if (fPlayLock > 0) {
      if (((G.me.p_flags & 16384) >>> 0 && 1 ? 1 : 0) ^ (fPlayLock & 255 && 1 ? 1 : 0)) {
        speedReq.type = 16;
        speedReq.speed = (fPlayLock & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 16, fPlayLock & 255);
          }
        }
        ;
        fPlayLock = fPlayLock - 256 << 16 >> 16;
        if (fPlayLock < 256) {
          fPlayLock = -1;
        }
      } else {
        fPlayLock = -1;
      }
    }
  }
  ;
  {
    if (fPlanLock > 0) {
      if (((G.me.p_flags & 32768) >>> 0 && 1 ? 1 : 0) ^ (fPlanLock & 255 && 1 ? 1 : 0)) {
        speedReq.type = 15;
        speedReq.speed = (fPlanLock & 255) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, speedReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d\n"), 15, fPlanLock & 255);
          }
        }
        ;
        fPlanLock = fPlanLock - 256 << 16 >> 16;
        if (fPlanLock < 256) {
          fPlanLock = -1;
        }
      } else {
        fPlanLock = -1;
      }
    }
  }
  ;
  {
    if (fTractor > 0) {
      if (((G.me.p_flags & 4194304) >>> 0 && 1 ? 1 : 0) ^ (fTractor & 255 && 1 ? 1 : 0)) {
        tractorReq.type = 24;
        tractorReq.state = ((fTractor & 255) >= 64 ? 1 : 0) << 24 >> 24;
        tractorReq.pnum = (fTractor & 255 & ~64) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, tractorReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d/%d\n"), 24, tractorReq.state, tractorReq.pnum);
          }
        }
        ;
        fTractor = fTractor - 256 << 16 >> 16;
        if (fTractor < 256) {
          fTractor = -1;
        }
      } else {
        fTractor = -1;
      }
    }
  }
  ;
  {
    if (fRepress > 0) {
      if (((G.me.p_flags & 8388608) >>> 0 && 1 ? 1 : 0) ^ (fRepress & 255 && 1 ? 1 : 0)) {
        tractorReq.type = 25;
        tractorReq.state = ((fRepress & 255) >= 64 ? 1 : 0) << 24 >> 24;
        tractorReq.pnum = (fRepress & 255 & ~64) << 24 >> 24;
        sendServerPacket($cast(struct_player_spacket, tractorReq));
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Forced %d:%d/%d\n"), 25, tractorReq.state, tractorReq.pnum);
          }
        }
        ;
        fRepress = fRepress - 256 << 16 >> 16;
        if (fRepress < 256) {
          fRepress = -1;
        }
      } else {
        fRepress = -1;
      }
    }
  }
  ;
}

export async function connectToServer(port: number): Promise<void> {
  let $t1: any, $t2: any;
  let $g = 0;
  let s = 0;
  let addr = new struct_sockaddr_in();
  let naddr = new struct_sockaddr_in();
  let len = new Uint32Array(1);
  let readfds = new struct_fd_set();
  let timeout = new struct_timeval();
  let hp = null;
  let optval = new Int32Array(1);
  $L: for (;;) {
    switch ($g) {
    case 0:
      addr = new struct_sockaddr_in();
      naddr = new struct_sockaddr_in();
      readfds = new struct_fd_set();
      timeout = new struct_timeval();
      G.serverDead = 0;
      if (G.sock !== -1) {
        shutdown(G.sock, 2);
        close(G.sock);
        G.sock = -1;
      }
      printf(S("Waiting for connection (port %d). \n"), port);
      if ((s = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
        printf(S("I can't create a socket\n"));
        terminate(2);
      }
      optval[0] = 1;
      if (setsockopt(s, SOL_SOCKET, SO_REUSEADDR, $pcast(P(optval, 0), 1, true, false), 4) < 0) {
        perror(S("setsockopt"));
      }
      addr.sin_family = AF_INET;
      addr.sin_addr.s_addr = INADDR_ANY;
      addr.sin_port = htons(port & 0xffff);
      if (bind(s, $cast(struct_sockaddr, addr), 16) < 0) {
        perror(S("bind"));
        terminate(1);
      }
      if (listen(s, 1) < 0) {
        perror(S("listen"));
      }
      len[0] = 16;
    case 1: // tryagain
      timeout.tv_sec = 240;
      timeout.tv_usec = 0;
      do {
        let __i = 0;
        let __arr = readfds;
        for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
          __arr.__fds_bits[__i] = 0;
        }
      } while (0);
      ($t1 = readfds.__fds_bits, $t2 = s / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, s % (8 * 8)));
      if (s >= G.max_fd) {
        G.max_fd = s + 1;
      }
      if (await select(G.max_fd, readfds, null, null, timeout) === 0) {
        printf(S("Well, I think the server died!\n"));
        terminate(0);
      }
      G.sock = accept(s, $cast(struct_sockaddr, naddr), P(len, 0));
      if (G.sock === -1) {
        { $g = 1; continue $L; }
      }
      if (G.sock >= G.max_fd) {
        G.max_fd = G.sock + 1;
      }
      printf(S("Got connection.\n"));
      close(s);
      pickSocket(port);
      len[0] = 16;
      if (getpeername(G.sock, $cast(struct_sockaddr, addr), P(len, 0)) < 0) {
        perror(S("unable to get peername"));
        G.serverName = S("nowhere");
        printf(S("Connection from server\n"));
      } else {
        serveraddr = addr.sin_addr.s_addr | 0;
        hp = gethostbyaddr($pcast(P(addr.sin_addr, "s_addr"), 1, true, false), 4, AF_INET);
        if (!!hp) {
          G.serverName = P(new Int8Array((strlen(hp.h_name) + 1)));
          strcpy(G.serverName, hp.h_name);
          printf(S("Connection from server %s (%s)\n"), G.serverName, inet_ntoa(addr.sin_addr.$clone()));
        } else {
          G.serverName = P(new Int8Array((strlen(inet_ntoa(addr.sin_addr.$clone())) + 1)));
          strcpy(G.serverName, inet_ntoa(addr.sin_addr.$clone()));
          printf(S("Connection from server %s\n"), G.serverName);
        }
      }
    }
    break;
  }
}

function set_tcp_opts(s: number): void {
  const optval = new Int32Array(1);
  optval[0] = 1;
  let ent = null;
  ent = getprotobyname(S("TCP"));
  if (!ent) {
    fprintf(R.stderr, S("TCP protocol not found.\n"));
    return;
  }
  if (setsockopt(s, ent.p_proto, TCP_NODELAY, P(optval, 0), 4) < 0) {
    perror(S("setsockopt"));
  }
}

export function callServer(port: number, server: Ptr | null): void {
  let s = 0;
  let addr = new struct_sockaddr_in();
  let hp = null;
  G.serverDead = 0;
  fprintf(R.stderr, S("connecting to %s on port %d\n"), server, port);
  if ((s = socket(AF_INET, SOCK_STREAM, 0)) < 0) {
    perror(S("failed in socket"));
    terminate(1);
  }
  set_tcp_opts(s);
  addr.sin_family = AF_INET;
  addr.sin_port = htons(port & 0xffff);
  if ((addr.sin_addr.s_addr = inet_addr(server)) === 4294967295) {
    if (!(hp = gethostbyname(server))) {
      printf(S("unable to resolve hostname %s\n"), server);
      terminate(1);
    } else {
      addr.sin_addr.s_addr = $rd($pcast(hp.h_addr_list.a[hp.h_addr_list.o + h_addr], 4, true, false)) >>> 0;
    }
  }
  serveraddr = addr.sin_addr.s_addr | 0;
  if (connect(s, $cast(struct_sockaddr, addr), 16) < 0) {
    perror(S("failed in connect"));
    fprintf(R.stderr, S("connection failed\n"));
    terminate(1);
  }
  fprintf(R.stderr, S("connected\n"));
  G.sock = s;
  if (G.sock >= G.max_fd) {
    G.max_fd = G.sock + 1;
  }
  pickSocket(port);
}

export async function socketPauseCommon(wake_on_user_input: number): Promise<void> {
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let timeout = new struct_timeval();
  let readfds = new struct_fd_set();
  let retval = 0;
  timeout.tv_sec = 1;
  timeout.tv_usec = 0;
  do {
    let __i = 0;
    let __arr = readfds;
    for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
      __arr.__fds_bits[__i] = 0;
    }
  } while (0);
  ($t1 = readfds.__fds_bits, $t2 = G.sock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, G.sock % (8 * 8)));
  if (G.udpSock >= 0) {
    ($t3 = readfds.__fds_bits, $t4 = G.udpSock / (8 * 8) | 0, $t3[$t4] = $t3[$t4] | $shl64(1, G.udpSock % (8 * 8)));
  }
  if (wake_on_user_input) {
    ($t5 = readfds.__fds_bits, $t6 = W_Socket() / (8 * 8) | 0, $t5[$t6] = $t5[$t6] | $shl64(1, W_Socket() % (8 * 8)));
  }
  retval = await select(G.max_fd, readfds, null, null, timeout);
  if (retval < 0) {
    perror(S("select"));
  }
}

export async function socketPauseNoUser(): Promise<void> {
  await socketPauseCommon(0);
}

export async function socketPause(): Promise<void> {
  await socketPauseCommon(1);
}

export async function readFromServer(readfds: struct_fd_set | null): Promise<number> {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let retval = 0;
  if (G.serverDead) {
    return 0;
  }
  if (!readfds) {
    let timeout = new struct_timeval();
    let rs = 0;
    let mask = new struct_fd_set();
    readfds = mask;
    do {
      let __i = 0;
      let __arr = readfds;
      for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
        __arr.__fds_bits[__i] = 0;
      }
    } while (0);
    ($t1 = readfds.__fds_bits, $t2 = G.sock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, G.sock % (8 * 8)));
    if (G.udpSock >= 0) {
      ($t3 = readfds.__fds_bits, $t4 = G.udpSock / (8 * 8) | 0, $t3[$t4] = $t3[$t4] | $shl64(1, G.udpSock % (8 * 8)));
    }
    timeout.tv_sec = 0;
    timeout.tv_usec = 0;
    if ((rs = await select(G.max_fd, readfds, null, null, timeout)) === 0) {
      dotimers();
      return 0;
    }
    if (rs < 0) {
      if ($rd(P(R, "errno")) === EINTR) {
        return 0;
      }
      perror(S("select"));
      await sleep(1);
    }
  }
  if (G.udpSock >= 0 && (readfds.__fds_bits[G.udpSock / (8 * 8) | 0] & $shl64(1, G.udpSock % (8 * 8))) !== 0) {
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("Activity on UDP socket\n"));
      }
    }
    ;
    chan = G.udpSock;
    if (G.commStatus === STAT_VERIFY_UDP) {
      sequence = 0;
      resetForce();
      printUdpInfo();
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("UDP connection established.\n"));
        }
      }
      ;
      G.commMode = COMM_UDP;
      G.commStatus = STAT_CONNECTED;
      G.commSwitchTimeout = 0;
      if (G.udpClientRecv !== MODE_SIMPLE) {
        await sendUdpReq(COMM_MODE + G.udpClientRecv);
      }
      if (G.udpWin) {
        udprefresh(UDP_CURRENT);
        udprefresh(UDP_STATUS);
      }
    }
    retval += await doRead(G.udpSock);
  }
  if ((readfds.__fds_bits[G.sock / (8 * 8) | 0] & $shl64(1, G.sock % (8 * 8))) !== 0) {
    chan = G.sock;
    if (G.commMode === COMM_TCP) {
      drop_flag = 0;
    }
    retval += await doRead(G.sock);
  }
  dotimers();
  return retval !== 0 ? 1 : 0;
}

function dotimers(): void {
  if (G.commSwitchTimeout > 0) {
    if (!--G.commSwitchTimeout) {
      G.commModeReq = G.commMode = COMM_TCP;
      G.commStatus = STAT_CONNECTED;
      if (G.udpSock >= 0) {
        closeUdpConn();
      }
      if (G.udpWin) {
        udprefresh(UDP_CURRENT);
        udprefresh(UDP_STATUS);
      }
      warning(S("Timed out waiting for UDP response from server"));
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Timed out waiting for UDP response from server\n"));
        }
      }
      ;
    }
  }
  if (G.udpClientSend > 1 && G.commMode === COMM_UDP) {
    checkForce();
  }
}

export function getvpsize(bufptr: Ptr | null): number {
  let size = 0;
  switch (bufptr.a[bufptr.o]) {
  case 41:
    size = bufptr.a[bufptr.o + 4] & 0xff;
    break;
  case 42:
    if ((bufptr.a[bufptr.o + 1] & 0xff) === STEXTE_STRING || (bufptr.a[bufptr.o + 1] & 0xff) === SHORT_WARNING) {
      size = bufptr.a[bufptr.o + 3] & 0xff;
    } else {
      size = 4;
    }
    break;
  case 45:
    if (bufptr.a[bufptr.o + 1] & 0xff & 128) {
      size = ((bufptr.a[bufptr.o + 1] & 63) & 0xff) * 4 + 4;
    } else if (bufptr.a[bufptr.o + 1] & 0xff & 64) {
      if (G.shortversion >= SHORTVERSION) {
        size = ((bufptr.a[bufptr.o + 1] & 63) & 0xff) * 4 + 4 + bufptr.a[bufptr.o + 2] * 4;
      } else {
        size = ((bufptr.a[bufptr.o + 1] & 63) & 0xff) * 4 + 4;
      }
    } else {
      size = (bufptr.a[bufptr.o + 1] & 0xff) * 4 + 12;
    }
    break;
  case 47:
    size = vtsize[G.numofbits[bufptr.a[bufptr.o + 1] & 0xff]];
    break;
  case 48:
    size = G.vtisize[G.numofbits[bufptr.a[bufptr.o + 1] & 0xff]] + G.numofbits[bufptr.a[bufptr.o + 3] & 0xff];
    break;
  case 50:
    size = Math.imul(bufptr.a[bufptr.o + 1] & 0xff, VPLANET_SIZE) + 2;
    break;
  case 57:
    switch (bufptr.a[bufptr.o + 1] & 0xff & 15) {
    case 0:
    case 1:
    case 2:
      size = 4;
      break;
    case 4:
      size = 8;
      break;
    default:
      size = 12;
      break;
    }
    break;
  case 58:
    size = (bufptr.a[bufptr.o + 1] & 0xff) * 2 + 2;
    break;
  default:
    fprintf(R.stderr, S("Unknown variable packet\n"));
    return -1;
    break;
  }
  if (size % 4 !== 0) {
    size += 4 - size % 4;
  }
  return size;
}

async function doRead(asock: number): Promise<number> {
  let $t1: any, $t2: any;
  let $g = 0;
  let timeout = new struct_timeval();
  let readfds = new struct_fd_set();
  let bufptr = null;
  let size = 0;
  let count = 0;
  let temp = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      timeout = new struct_timeval();
      readfds = new struct_fd_set();
      timeout.tv_sec = 0;
      timeout.tv_usec = 0;
      count = read(asock, P(G.buf), BUFSIZE) | 0;
      if (G.netstat && (asock === G.udpSock || G.commMode !== COMM_UDP || G.udpClientRecv === MODE_TCP)) {
        ns_record_update(count);
      }
      if (G.debug) {
        printf(S("read %d bytes from %s socket\n"), count, asock === G.udpSock ? S("UDP") : S("TCP"));
      }
      if (count <= 0) {
        if (asock === G.udpSock) {
          if ($rd(P(R, "errno")) === ECONNREFUSED) {
            let addr = new struct_sockaddr_in();
            {
              if (G.udpDebug === 2) {
                printf(S("UDP: "));
                printf(S("asock=%d, sock=%d, udpSock=%d, errno=%d\n"), asock, G.sock, G.udpSock, $rd(P(R, "errno")));
              }
            }
            ;
            {
              if (G.udpDebug === 2) {
                printf(S("UDP: "));
                printf(S("count=%d\n"), count);
              }
            }
            ;
            {
              if (G.udpDebug === 2) {
                printf(S("UDP: "));
                printf(S("Hiccup(%d)!  Reconnecting\n"), $rd(P(R, "errno")));
              }
            }
            ;
            addr.sin_addr.s_addr = serveraddr >>> 0;
            addr.sin_port = htons(udpServerPort & 0xffff);
            addr.sin_family = AF_INET;
            if (connect(G.udpSock, $cast(struct_sockaddr, addr), 16) < 0) {
              perror(S("connect"));
              {
                if (G.udpDebug === 2) {
                  printf(S("UDP: "));
                  printf(S("Unable to reconnect\n"));
                }
              }
              ;
            } else {
              {
                if (G.udpDebug === 2) {
                  printf(S("UDP: "));
                  printf(S("Reconnect successful\n"));
                }
              }
              ;
              return 0;
            }
          }
          {
            if (G.udpDebug === 2) {
              printf(S("UDP: "));
              printf(S("*** UDP disconnected (res=%d, err=%d)\n"), count, $rd(P(R, "errno")));
            }
          }
          ;
          warning(S("UDP link severed"));
          printUdpInfo();
          closeUdpConn();
          G.commMode = G.commModeReq = COMM_TCP;
          G.commStatus = STAT_CONNECTED;
          if (G.udpWin) {
            udprefresh(UDP_STATUS);
            udprefresh(UDP_CURRENT);
          }
          return 0;
        }
        printf(S("server disconnected\n"));
        close(asock);
        G.serverDead = 1;
        return 0;
      }
      bufptr = P(G.buf);
    case 2:
      if (!(bufptr.o < P(G.buf).add(count).o)) { $g = 3; continue $L; }
    case 1: // computesize
      if (bufptr.a[bufptr.o] < 1 || $u64(bufptr.a[bufptr.o]) > Math.trunc(1008 / 16) - 1 || G.handlers[bufptr.a[bufptr.o] & 0xff].size === 0) {
        let i = 0;
        fprintf(R.stderr, S("netrek protocol stream alignment failure, next byte %d (0x%02x)\n"), bufptr.a[bufptr.o], bufptr.a[bufptr.o]);
        fprintf(R.stderr, S("protocol buffer dump, bytes %d, [bufptr] at %d :\n"), count, bufptr.o - P(G.buf).o | 0);
        for (i = 0; i < count; ++i) {
          if (i === bufptr.o - P(G.buf).o) {
            fprintf(R.stderr, S("[%02x]"), (G.buf[i] >>> 0 & 255) >>> 0);
          } else {
            fprintf(R.stderr, S(" %02x "), (G.buf[i] >>> 0 & 255) >>> 0);
          }
        }
        fprintf(R.stderr, S("\n"));
        return 0;
      }
      size = G.handlers[bufptr.a[bufptr.o] & 0xff].size;
      if (size === -1) {
        size = getvpsize(bufptr);
        if (size <= 0) {
          fprintf(R.stderr, S("Bad short-packet size value (%d)\n"), size);
          return 0;
        }
        if (G.debug) {
          printf(S("read variable packet size %d, type %d\n"), size, bufptr.a[bufptr.o]);
        }
      }
      if (size === 0) {
        fprintf(R.stderr, S("Variable packet has 0 length! type=%d Trying to read more!\n"), bufptr.a[bufptr.o]);
      }
      while (size > count + (P(G.buf).o - bufptr.o) || size === 0) {
        timeout.tv_sec = 20;
        timeout.tv_usec = 0;
        do {
          let __i = 0;
          let __arr = readfds;
          for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
            __arr.__fds_bits[__i] = 0;
          }
        } while (0);
        ($t1 = readfds.__fds_bits, $t2 = asock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, asock % (8 * 8)));
        if ((temp = await select(G.max_fd, readfds, null, null, timeout)) === 0) {
          printf(S("Packet fragment.  Server must be dead\n"));
          G.serverDead = 1;
          close(G.sock);
          return 0;
        }
        if (size === 0) {
          temp = read(asock, P(G.buf).add(count), 88) | 0;
        } else {
          temp = read(asock, P(G.buf).add(count), $u64(size - (count + (P(G.buf).o - bufptr.o)))) | 0;
        }
        count += temp;
        if (temp <= 0) {
          printf(S("2) Got read() of %d.  Server is dead\n"), temp);
          G.serverDead = 1;
          close(G.sock);
          return 0;
        }
        if (size === 0) {
          { $g = 1; continue $L; }
        }
      }
      if (!!G.handlers[bufptr.a[bufptr.o] & 0xff].handler) {
        if (asock !== G.udpSock || (!drop_flag || bufptr.a[bufptr.o] === SP_SEQUENCE || bufptr.a[bufptr.o] === SP_SC_SEQUENCE)) {
          if (G.debug) {
            printf(S("read packet %d\n"), bufptr.a[bufptr.o]);
          }
          if (!!G.recordFile && ckRecordPacket(bufptr.a[bufptr.o])) {
            if (fwrite(bufptr, $u64(size), 1, G.recordFile) !== 1) {
              perror(S("write: (recordFile)"));
              fclose(G.recordFile);
              G.recordFile = null;
            }
          }
          if (G.log_packets) {
            Log_Packet(bufptr.a[bufptr.o], size);
            print_packet(bufptr, size);
          }
          if (asock === G.udpSock) {
            ++G.packets_received;
          }
          await G.handlers[bufptr.a[bufptr.o] & 0xff].handler(bufptr, asock);
        } else {
          if (G.debug) {
            if (drop_flag) {
              printf(S("%d bytes dropped.\n"), size);
            }
          }
          {
            if (G.udpDebug === 2) {
              printf(S("UDP: "));
              printf(S("Ignored type %d\n"), bufptr.a[bufptr.o]);
            }
          }
          ;
        }
      } else {
        printf(S("Handler for packet %d not installed...\n"), bufptr.a[bufptr.o]);
      }
      bufptr = bufptr.add(size);
      { $g = 2; continue $L; }
    case 3:
      return 1;
    }
    break;
  }
}

export function handleTorp(packet: struct_torp_spacket | null): void {
  packet = $cast(struct_torp_spacket, packet);
  let thetorp = null;
  if (ntohs(packet.tnum) >= Math.imul(MAXPLAYER, MAXTORP)) {
    fprintf(R.stderr, S("handleTorp: bad index %d\n"), ntohs(packet.tnum));
    return;
  }
  G.weaponUpdate = 1;
  thetorp = $sadd(G.torps, ntohs(packet.tnum));
  thetorp.t_x = ntohl(packet.x >>> 0) | 0;
  thetorp.t_y = ntohl(packet.y >>> 0) | 0;
  thetorp.t_dir = packet.dir;
  thetorp.t_updateFuse = (2 > (6 * G.server_ups / 5 | 0) ? 2 : 6 * G.server_ups / 5 | 0) & 0xff;
  if (G.rotate) {
    rotate_coord(P(thetorp, "t_x"), P(thetorp, "t_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
    rotate_dir(P(thetorp, "t_dir"), G.rotate_deg);
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_TORP:\t"));
    fprintf(R.stderr, S("%d\t%u\t%u\t%u"), packet.dir, ntohs(packet.tnum), ntohl(packet.x >>> 0), ntohl(packet.y >>> 0));
  }
}

export function handleTorpInfo(packet: struct_torp_info_spacket | null): void {
  packet = $cast(struct_torp_info_spacket, packet);
  let $t1: any, $t2: any;
  let thetorp = null;
  if (ntohs(packet.tnum) >= Math.imul(MAXPLAYER, MAXTORP)) {
    fprintf(R.stderr, S("handleTorpInfo: bad index %d\n"), ntohs(packet.tnum));
    return;
  }
  G.weaponUpdate = 1;
  thetorp = $sadd(G.torps, ntohs(packet.tnum));
  thetorp.t_updateFuse = (2 > (6 * G.server_ups / 5 | 0) ? 2 : 6 * G.server_ups / 5 | 0) & 0xff;
  if (packet.status === TEXPLODE && thetorp.t_status === TFREE) {
    return;
  }
  if (packet.status && thetorp.t_status === TFREE) {
    ($t1 = $sadd(G.players, thetorp.t_owner), $t1.p_ntorp = $t1.p_ntorp + 1 << 16 >> 16);
  }
  if (packet.status === TFREE && thetorp.t_status) {
    ($t2 = $sadd(G.players, thetorp.t_owner), $t2.p_ntorp = $t2.p_ntorp - 1 << 16 >> 16);
  }
  thetorp.t_war = packet.war;
  if (packet.status !== thetorp.t_status) {
    thetorp.t_status = packet.status & 0xff;
    if (thetorp.t_status === TEXPLODE) {
      thetorp.t_fuse = (Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0) << 16 >> 16;
    }
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_TORP_INFO:\t"));
    fprintf(R.stderr, S("%d\t%d\t%u"), packet.war, packet.status, ntohs(packet.tnum));
  }
}

export function handleStatus(packet: struct_status_spacket | null): void {
  packet = $cast(struct_status_spacket, packet);
  G.status.tourn = packet.tourn & 0xff;
  G.status.armsbomb = ntohl(packet.armsbomb);
  G.status.planets = ntohl(packet.planets);
  G.status.kills = ntohl(packet.kills);
  G.status.losses = ntohl(packet.losses);
  G.status.time = ntohl(packet.time);
  G.status.timeprod = ntohl(packet.timeprod);
  if (G.debug) {
    printf(S("SERVER STATS:\n"));
    printf(S("time: %d\n"), G.status.time / (60 * 60 * 10) >>> 0);
    printf(S("kills: %d\n"), G.status.kills);
    printf(S("losses: %d\n"), G.status.losses);
    printf(S("planets: %d\n"), G.status.planets);
    printf(S("armsbomb: %d\n"), G.status.armsbomb);
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_STATUS:\t"));
    fprintf(R.stderr, S("\t%d\t%u\t%u\t%u\t%u\t%u\t%u"), packet.tourn, ntohl(packet.armsbomb), ntohl(packet.planets), ntohl(packet.kills), ntohl(packet.losses), ntohl(packet.time), ntohl(packet.timeprod));
  }
}

export function become(pl: struct_player | null): void {
  let p_no = 0;
  p_no = pl.p_no;
  memcpy(pl.p_ship, G.me.p_ship, 40);
  memcpy(pl.p_stats, G.me.p_stats, 568);
  memcpy(pl, G.me, 816);
  pl.p_no = p_no;
  G.me.p_status = PFREE;
}

export function handleSelf(packet: struct_you_spacket | null): void {
  packet = $cast(struct_you_spacket, packet);
  let pl = null;
  pl = $sadd(G.players, (packet.pnum & 0xff));
  if (packet.pnum < 0 || packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handleSelf: bad index %d\n"), packet.pnum);
    return;
  }
  if (handleSelf$seen && packet.pnum !== G.me.p_no) {
    become(pl);
  }
  ++handleSelf$seen;
  if (!G.F_many_self) {
    G.me = G.ghoststart ? $sadd(G.players, G.ghost_pno) : pl;
    G.myship = G.me.p_ship;
    G.mystats = G.me.p_stats;
  }
  pl.p_hostile = packet.hostile;
  pl.p_swar = packet.swar;
  pl.p_armies = packet.armies;
  pl.p_flags = ntohl(packet.flags);
  if ((pl.p_flags & PFPLOCK) >>> 0) {
    G.redrawPlayer[pl.p_playerl] = 1;
  }
  pl.p_damage = ntohl(packet.damage >>> 0) | 0;
  pl.p_shield = ntohl(packet.shield >>> 0) | 0;
  pl.p_fuel = ntohl(packet.fuel >>> 0) | 0;
  pl.p_etemp = ntohs(packet.etemp);
  pl.p_wtemp = ntohs(packet.wtemp);
  pl.p_whydead = ntohs(packet.whydead) << 16 >> 16;
  pl.p_whodead = ntohs(packet.whodead) << 16 >> 16;
  if (packet.tractor & 64) {
    pl.p_tractor = (packet.tractor & ~64) << 16 >> 16;
  }
}

export function handlePlayer(packet: struct_player_spacket | null): void {
  packet = $cast(struct_player_spacket, packet);
  let pl = null;
  let x = 0;
  let y = 0;
  if (packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handlePlayer: bad index %d\n"), packet.pnum);
    return;
  }
  pl = $sadd(G.players, (packet.pnum & 0xff));
  pl.p_dir = packet.dir;
  pl.p_speed = packet.speed;
  {
  }
  ;
  ;
  if (G.F_cloak_maxwarp && pl !== G.me) {
    if (pl.p_speed === 15) {
      pl.p_flags = (pl.p_flags | PFCLOAK) >>> 0;
    } else if ((pl.p_flags & PFCLOAK) >>> 0) {
      pl.p_flags = (pl.p_flags & 4294967279) >>> 0;
    }
  }
  x = ntohl(packet.x >>> 0) | 0;
  y = ntohl(packet.y >>> 0) | 0;
  pl.p_x = x;
  pl.p_y = y;
  G.redrawPlayer[packet.pnum & 0xff] = 1;
  if (G.me === pl) {
    G.my_x = x;
    G.my_y = y;
  }
  if (G.rotate) {
    rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
    rotate_dir(P(pl, "p_dir"), G.rotate_deg);
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PLAYER:\t"));
    fprintf(R.stderr, S("%d\t%u\t%d\t%d\t%d"), packet.pnum, packet.dir, packet.speed, ntohl(packet.x >>> 0), ntohl(packet.y >>> 0));
  }
}

export function handleWarning(packet: struct_warning_spacket | null): void {
  packet = $cast(struct_warning_spacket, packet);
  packet.mesg[80 - 1] = 0;
  warning(P(packet.mesg));
}

export function sendShortPacket(type: number, state: number): void {
  let speedReq = new struct_speed_cpacket();
  bzero(speedReq, 4);
  speedReq.type = type;
  speedReq.speed = state;
  sendServerPacket($cast(struct_player_spacket, speedReq));
  if (G.commMode === COMM_UDP && G.udpClientSend >= 2) {
    switch (type) {
    case 2:
      fSpeed = (state | 256) << 16 >> 16;
      break;
    case 3:
      fDirection = (state | 256) << 16 >> 16;
      break;
    case 12:
      fShield = (state | 2560) << 16 >> 16;
      break;
    case 14:
      fOrbit = (state | 2560) << 16 >> 16;
      break;
    case 13:
      fRepair = (state | 2560) << 16 >> 16;
      break;
    case 19:
      fCloak = (state | 2560) << 16 >> 16;
      break;
    case 17:
      fBomb = (state | 2560) << 16 >> 16;
      break;
    case 30:
      fDockperm = (state | 2560) << 16 >> 16;
      break;
    case 16:
      fPlayLock = (state | 2560) << 16 >> 16;
      break;
    case 15:
      fPlanLock = (state | 2560) << 16 >> 16;
      break;
    case 18:
      if (state === 1) {
        fBeamup = 1 | 1280;
      } else {
        fBeamdown = 2 | 1280;
      }
      break;
    }
    if (G.udpClientSend >= 3) {
      switch (type) {
      case 4:
        fPhaser = (state | 256) << 16 >> 16;
        break;
      case 5:
        fPlasma = (state | 256) << 16 >> 16;
        break;
      }
    }
  }
}

export function sendServerPacket(buffer: any): void {
  let $g = 0;
  let size = 0;
  let packet = null;
  $L: for (;;) {
    switch ($g) {
    case 0:
      packet = $cast(struct_player_spacket, buffer);
      if (G.sock === -1) {
        return;
      }
      if (G.serverDead) {
        return;
      }
      if (packet.type < 1 || $u64(packet.type) > Math.trunc(244 / 4) - 1 || G.sizes[packet.type & 0xff] === 0) {
        printf(S("Attempt to send strange packet %d!\n"), packet.type);
        return;
      }
      size = G.sizes[packet.type & 0xff];
      if (G.log_packets) {
        Log_OPacket(packet.type, size);
        print_opacket($bytes(packet), size);
      }
      if (G.commMode === COMM_UDP) {
      }
      if (!(G.commMode === COMM_TCP || !G.udpClientSend)) { $g = 3; continue $L; }
      {
        if (packet.type === CP_UDP_REQ) {
          if ($cast(struct_udp_req_cpacket, packet).request === COMM_VERIFY) {
            { $g = 1; continue $L; }
          }
        }
        if (gwrite(G.sock, $bytes(packet), size) !== size) {
          printf(S("gwrite failed.  Server must be dead\n"));
          G.serverDead = 1;
        }
      }
      { $g = 2; continue $L; }
    case 3:
      switch (packet.type) {
      case 2: { $g = 5; continue $L; }
      case 3: { $g = 6; continue $L; }
      case 4: { $g = 7; continue $L; }
      case 5: { $g = 8; continue $L; }
      case 6: { $g = 9; continue $L; }
      case 7: { $g = 10; continue $L; }
      case 11: { $g = 11; continue $L; }
      case 12: { $g = 12; continue $L; }
      case 13: { $g = 13; continue $L; }
      case 14: { $g = 14; continue $L; }
      case 15: { $g = 15; continue $L; }
      case 16: { $g = 16; continue $L; }
      case 17: { $g = 17; continue $L; }
      case 18: { $g = 18; continue $L; }
      case 19: { $g = 19; continue $L; }
      case 20: { $g = 20; continue $L; }
      case 21: { $g = 21; continue $L; }
      case 23: { $g = 22; continue $L; }
      case 24: { $g = 23; continue $L; }
      case 25: { $g = 24; continue $L; }
      case 26: { $g = 25; continue $L; }
      case 30: { $g = 26; continue $L; }
      case 42: { $g = 27; continue $L; }
      default: { $g = 28; continue $L; }
      }
    case 5:
    case 6:
    case 7:
    case 8:
    case 9:
    case 10:
    case 11:
    case 12:
    case 13:
    case 14:
    case 15:
    case 16:
    case 17:
    case 18:
    case 19:
    case 20:
    case 21:
    case 22:
    case 23:
    case 24:
    case 25:
    case 26:
    case 27:
    case 1: // send_udp
      ++G.packets_sent;
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Sent %d on UDP port\n"), packet.type);
        }
      }
      ;
      if (gwrite(G.udpSock, $bytes(packet), size) !== size) {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("gwrite on UDP failed.  Closing UDP connection\n"));
          }
        }
        ;
        warning(S("UDP link severed"));
        G.commModeReq = G.commMode = COMM_TCP;
        G.commStatus = STAT_CONNECTED;
        G.commSwitchTimeout = 0;
        if (G.udpWin) {
          udprefresh(UDP_STATUS);
          udprefresh(UDP_CURRENT);
        }
        if (G.udpSock >= 0) {
          closeUdpConn();
        }
      }
      { $g = 4; continue $L; };
    case 28:
      if (gwrite(G.sock, $bytes(packet), size) !== size) {
        printf(S("gwrite failed.  Server must be dead\n"));
        G.serverDead = 1;
      }
    case 4:
    case 2:
    }
    break;
  }
}

export function handlePlanet(packet: struct_planet_spacket | null): void {
  packet = $cast(struct_planet_spacket, packet);
  let plan = null;
  let redraw = 0;
  if (packet.pnum >= MAXPLANETS) {
    fprintf(R.stderr, S("handlePlanet: bad index %d\n"), packet.pnum);
    return;
  }
  plan = $sadd(G.planets, (packet.pnum & 0xff));
  if (plan.pl_owner !== packet.owner) {
    redraw = 1;
  }
  plan.pl_owner = packet.owner;
  if (plan.pl_owner < FED || plan.pl_owner > ORI) {
    plan.pl_owner = NOBODY;
  }
  if (plan.pl_info !== packet.info) {
    redraw = 1;
  }
  plan.pl_info = packet.info;
  if (plan.pl_flags !== ntohs(packet.flags)) {
    redraw = 1;
  }
  plan.pl_flags = ntohs(packet.flags);
  if (plan.pl_armies >>> 0 !== ntohl(packet.armies >>> 0)) {
    let planetarmies = ntohl(packet.armies >>> 0) | 0;
    if (plan.pl_armies < 5 && planetarmies > 4 || plan.pl_armies > 4 && planetarmies < 5) {
      redraw = 1;
    }
  }
  plan.pl_armies = ntohl(packet.armies >>> 0) | 0;
  if (redraw) {
    plan.pl_flags |= PLREDRAW;
  }
}

export function handlePhaser(packet: struct_phaser_spacket | null): void {
  packet = $cast(struct_phaser_spacket, packet);
  let phas = null;
  if (packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handlePhaser: bad index %d\n"), packet.pnum);
    return;
  }
  if (packet.status === PHHIT && (ntohl(packet.target >>> 0) < 0 || ntohl(packet.target >>> 0) >= MAXPLAYER)) {
    fprintf(R.stderr, S("handlePhaser: bad target %d\n"), ntohl(packet.target >>> 0));
    return;
  }
  G.weaponUpdate = 1;
  phas = $sadd(G.phasers, (packet.pnum & 0xff));
  phas.ph_status = packet.status & 0xff;
  phas.ph_dir = packet.dir;
  phas.ph_x = ntohl(packet.x >>> 0) | 0;
  phas.ph_y = ntohl(packet.y >>> 0) | 0;
  phas.ph_target = ntohl(packet.target >>> 0) << 16 >> 16;
  phas.ph_fuse = 0;
  phas.sound_phaser = 1;
  phas.ph_updateFuse = (Math.imul(PHASER_UPDATE_FUSE, G.server_ups) / 10 | 0) << 16 >> 16;
  if (G.rotate) {
    rotate_coord(P(phas, "ph_x"), P(phas, "ph_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
    rotate_dir(P(phas, "ph_dir"), G.rotate_deg);
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PHASER\t"));
    fprintf(R.stderr, S("%d\t%d\t%u\t%d\t%d\t%d"), packet.pnum, packet.status, packet.dir, ntohl(packet.x >>> 0), ntohl(packet.y >>> 0), ntohl(packet.target >>> 0));
  }
}

export function handleMessage(packet: struct_mesg_spacket | null): void {
  packet = $cast(struct_mesg_spacket, packet);
  if (packet.m_from >= MAXPLAYER) {
    packet.m_from = 255;
  }
  packet.mesg[80 - 1] = 0;
  dmessage(P(packet.mesg), packet.m_flags, packet.m_from, packet.m_recpt);
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_MESSAGE:\t"));
    fprintf(R.stderr, S("0x%0X\t%d\t%d\t%s"), packet.m_flags, packet.m_recpt, packet.m_from, P(packet.mesg));
  }
}

export function handleQueue(packet: struct_queue_spacket | null): void {
  packet = $cast(struct_queue_spacket, packet);
  G.queuePos = ntohs(packet.pos);
}

export function sendTeamReq(team: number, ship: number): void {
  let outfitReq = new struct_outfit_cpacket();
  bzero(outfitReq, 4);
  outfitReq.type = CP_OUTFIT;
  outfitReq.team = team << 24 >> 24;
  outfitReq.ship = ship << 24 >> 24;
  sendServerPacket(outfitReq);
}

export function handlePickok(packet: struct_pickok_spacket | null): void {
  packet = $cast(struct_pickok_spacket, packet);
  G.pickOk = packet.state;
}

export function sendLoginReq(name: Ptr | null, pass: Ptr | null, login: Ptr | null, query: number): void {
  let packet = new struct_login_cpacket();
  bzero(packet, 52);
  strcpy(P(packet.name), name);
  strcpy(P(packet.password), pass);
  if (strlen(login) > 15) {
    login.a[login.o + 15] = 0;
  }
  strcpy(P(packet.login), login);
  packet.type = CP_LOGIN;
  packet.query = query;
  sendServerPacket($cast(struct_player_spacket, packet));
}

export function handleLogin(packet: struct_login_spacket | null): void {
  packet = $cast(struct_login_spacket, packet);
  G.loginAccept = packet.accept;
  if (packet.accept) {
    G.mystats.st_flags = ntohl(packet.flags >>> 0) | 0;
  }
}

export function sendTractorReq(state: number, pnum: number): void {
  let tractorReq = new struct_tractor_cpacket();
  memset(tractorReq, 0, 4);
  tractorReq.type = CP_TRACTOR;
  tractorReq.state = state;
  tractorReq.pnum = pnum;
  sendServerPacket($cast(struct_player_spacket, tractorReq));
  if (state) {
    fTractor = (pnum | 64) << 16 >> 16;
  } else {
    fTractor = 0;
  }
}

export function sendRepressReq(state: number, pnum: number): void {
  let repressReq = new struct_repress_cpacket();
  memset(repressReq, 0, 4);
  repressReq.type = CP_REPRESS;
  repressReq.state = state;
  repressReq.pnum = pnum;
  sendServerPacket($cast(struct_player_spacket, repressReq));
  if (state) {
    fRepress = (pnum | 64) << 16 >> 16;
  } else {
    fRepress = 0;
  }
}

export function sendDetMineReq(torp: number): void {
  let detReq = new struct_det_mytorp_cpacket();
  memset(detReq, 0, 4);
  detReq.type = CP_DET_MYTORP;
  detReq.tnum = htons(torp & 0xffff);
  sendServerPacket($cast(struct_player_spacket, detReq));
}

export function handlePlasmaInfo(packet: struct_plasma_info_spacket | null): void {
  packet = $cast(struct_plasma_info_spacket, packet);
  let $t1: any, $t2: any;
  let thetorp = null;
  if (ntohs(packet.pnum) >= Math.imul(MAXPLAYER, MAXPLASMA)) {
    fprintf(R.stderr, S("handlePlasmaInfo: bad index %d\n"), packet.pnum);
    return;
  }
  G.weaponUpdate = 1;
  thetorp = $sadd(G.plasmatorps, ntohs(packet.pnum));
  thetorp.pt_updateFuse = (2 > (6 * G.server_ups / 5 | 0) ? 2 : 6 * G.server_ups / 5 | 0) << 16 >> 16;
  if (packet.status === PTEXPLODE && thetorp.pt_status === PTFREE) {
    return;
  }
  if (!thetorp.pt_status && packet.status) {
    ($t1 = $sadd(G.players, thetorp.pt_owner), $t1.p_nplasmatorp = $t1.p_nplasmatorp + 1 << 16 >> 16);
  }
  if (thetorp.pt_status && !packet.status) {
    ($t2 = $sadd(G.players, thetorp.pt_owner), $t2.p_nplasmatorp = $t2.p_nplasmatorp - 1 << 16 >> 16);
  }
  thetorp.pt_war = packet.war;
  if (thetorp.pt_status !== packet.status) {
    thetorp.pt_status = packet.status & 0xff;
    if (thetorp.pt_status === PTEXPLODE) {
      thetorp.pt_fuse = (Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0) << 16 >> 16;
    }
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PLASMA_INFO:\t"));
    fprintf(R.stderr, S("%d\t%d\t%u"), packet.war, packet.status, ntohs(packet.pnum));
  }
}

export function handlePlasma(packet: struct_plasma_spacket | null): void {
  packet = $cast(struct_plasma_spacket, packet);
  let thetorp = null;
  if (ntohs(packet.pnum) >= Math.imul(MAXPLAYER, MAXPLASMA)) {
    fprintf(R.stderr, S("handlePlasma: bad index %d\n"), packet.pnum);
    return;
  }
  G.weaponUpdate = 1;
  thetorp = $sadd(G.plasmatorps, ntohs(packet.pnum));
  thetorp.pt_x = ntohl(packet.x >>> 0) | 0;
  thetorp.pt_y = ntohl(packet.y >>> 0) | 0;
  thetorp.pt_updateFuse = (2 > (6 * G.server_ups / 5 | 0) ? 2 : 6 * G.server_ups / 5 | 0) << 16 >> 16;
  if (G.rotate) {
    rotate_coord(P(thetorp, "pt_x"), P(thetorp, "pt_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PLASMA:\t%u\t%d\t%d"), ntohs(packet.pnum), ntohl(packet.x >>> 0), ntohl(packet.y >>> 0));
  }
}

export function handleFlags(packet: struct_flags_spacket | null): void {
  packet = $cast(struct_flags_spacket, packet);
  let pl = null;
  pl = $sadd(G.players, (packet.pnum & 0xff));
  if (packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handleFlags: bad index %d\n"), packet.pnum);
    return;
  }
  if (pl.p_flags !== ntohl(packet.flags) || pl.p_tractor !== (packet.tractor & ~64)) {
    G.redrawPlayer[packet.pnum & 0xff] = 1;
  } else {
    return;
  }
  pl.p_flags = ntohl(packet.flags);
  if (packet.tractor & 64) {
    pl.p_tractor = (packet.tractor & ~64) << 16 >> 16;
  } else {
    pl.p_tractor = -1;
  }
}

export function handleKills(packet: struct_kills_spacket | null): void {
  packet = $cast(struct_kills_spacket, packet);
  if (packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handleKills: bad index %d\n"), packet.pnum);
    return;
  }
  if ($sadd(G.players, (packet.pnum & 0xff)).p_kills !== ntohl(packet.kills) / 100) {
    $sadd(G.players, (packet.pnum & 0xff)).p_kills = ntohl(packet.kills) / 100;
    {
      G.updatePlayer[packet.pnum & 0xff] = 1;
      G.plistUpdated = 1;
    }
    ;
    if (G.me === $sadd(G.players, (packet.pnum & 0xff))) {
      calibrate_stats();
      redrawStats(null);
    }
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_KILLS:\t"));
    fprintf(R.stderr, S("%d\t%u"), packet.pnum, ntohl(packet.kills));
  }
}

export function handlePStatus(packet: struct_pstatus_spacket | null): void {
  packet = $cast(struct_pstatus_spacket, packet);
  let j = null;
  if (packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handlePStatus: bad index %d\n"), packet.pnum);
    return;
  }
  j = $sadd(G.players, (packet.pnum & 0xff));
  if (packet.status === j.p_status) {
    return;
  }
  if (packet.status === PEXPLODE) {
    j.p_explode = 0;
  } else if (packet.status === PDEAD) {
    packet.status = PEXPLODE;
    if (j.p_status === PEXPLODE) {
      return;
    }
  } else if (packet.status === PALIVE && j.p_status !== PALIVE) {
    j.p_kills = 0;
  }
  {
    G.updatePlayer[packet.pnum & 0xff] = 1;
    G.plistUpdated = 1;
  }
  ;
  if (j.p_status === PFREE || packet.status === PFREE) {
    G.plistReorder = 1;
  }
  ;
  j.p_status = packet.status;
  G.redrawPlayer[packet.pnum & 0xff] = 1;
}

export function handleMotd(packet: struct_motd_spacket | null): void {
  packet = $cast(struct_motd_spacket, packet);
  packet.line[80 - 1] = 0;
  newMotdLine(P(packet.line));
}

export function sendMessage(mes: Ptr | null, group: number, indiv: number): void {
  let mesPacket = new struct_mesg_cpacket();
  bzero(mesPacket, 84);
  if (G.recv_short) {
    let size = 0;
    size = strlen(mes) | 0;
    size += 5;
    if (size % 4 !== 0) {
      size += 4 - size % 4;
    }
    mesPacket.pad1 = size << 24 >> 24;
    G.sizes[CP_S_MESSAGE] = size;
    mesPacket.type = CP_S_MESSAGE;
  } else {
    mesPacket.type = CP_MESSAGE;
  }
  mesPacket.group = group << 24 >> 24;
  mesPacket.indiv = indiv << 24 >> 24;
  memccpy(P(mesPacket.mesg), mes, 0, 80);
  sendServerPacket($cast(struct_player_spacket, mesPacket));
}

export function handleMask(packet: struct_mask_spacket | null): void {
  packet = $cast(struct_mask_spacket, packet);
  motd_refresh();
  G.tournMask = packet.mask;
}

export function sendOptionsPacket(): void {
  let optPacket = new struct_options_cpacket();
  bzero(optPacket, 104);
  optPacket.type = CP_OPTIONS;
  optPacket.flags = htonl(ST_MAPMODE + Math.imul(ST_NAMEMODE, G.namemode) + ST_SHOWSHIELDS + Math.imul(ST_KEEPPEACE, G.keeppeace) + Math.imul(ST_SHOWLOCAL, G.showlocal) + Math.imul(ST_SHOWGLOBAL, G.showgalactic) >>> 0);
  memcpy(P(optPacket.keymap), P(G.mystats.st_keymap), 96);
  sendServerPacket($cast(struct_player_spacket, optPacket));
}

function pickSocket(old: number): void {
  let newsocket = 0;
  let sockPack = new struct_socket_cpacket();
  if (G.baseLocalPort) {
    newsocket = G.baseLocalPort;
  } else {
    newsocket = getpid() & 32767;
  }
  while (newsocket < 2048 || newsocket === old) {
    if (G.baseLocalPort) {
      ++newsocket;
    } else {
      newsocket = newsocket + 10687 & 32767;
    }
  }
  bzero(sockPack, 8);
  sockPack.type = CP_SOCKET;
  sockPack.socket = htonl(newsocket >>> 0);
  sockPack.version = SOCKVERSION;
  sockPack.udp_version = UDPVERSION;
  sendServerPacket($cast(struct_player_spacket, sockPack));
  if (G.serverDead) {
    return;
  }
  G.nextSocket = newsocket;
}

function handleBadVersionSorry(reason: Ptr | null): void {
  printf(S("%s\nTry again later.\n"), reason);
}

export function handleBadVersion(packet: struct_badversion_spacket | null): void {
  packet = $cast(struct_badversion_spacket, packet);
  let badversion = packet.why;
  if (badversion >= 0 && badversion <= MAXBADVERSION) {
    handleBadVersionSorry(badversion_long_strings[badversion]);
  }
  terminate(EXIT_BADVERSION_BASE + badversion);
}

export function gwrite(fd: number, buf: Ptr | null, bytes: number): number {
  let orig = bytes;
  let n = 0;
  while (bytes) {
    n = write(fd, buf, $u64(bytes)) | 0;
    if (n < 0) {
      if (fd === G.udpSock) {
        fprintf(R.stderr, S("Tried to write %d, %d\n"), fd, bytes);
        perror(S("write"));
        printUdpInfo();
      }
      return -1;
    }
    bytes -= n;
    buf = buf.add(n);
  }
  return orig;
}

export function handleHostile(packet: struct_hostile_spacket | null): void {
  packet = $cast(struct_hostile_spacket, packet);
  let p_no = packet.pnum;
  let pl = null;
  if (p_no < 0 || p_no >= MAXPLAYER) {
    fprintf(R.stderr, S("handleHostile: bad index %d\n"), p_no);
    return;
  }
  pl = $sadd(G.players, p_no);
  if (pl.p_swar !== packet.war || pl.p_hostile !== packet.hostile) {
    pl.p_swar = packet.war;
    pl.p_hostile = packet.hostile;
    {
    }
    ;
    ;
    G.redrawPlayer[p_no] = 1;
  }
}

export function handlePlyrLogin(packet: struct_plyr_login_spacket | null, sock: number): void {
  packet = $cast(struct_plyr_login_spacket, packet);
  let p_no = packet.pnum;
  let pl = null;
  if (sock === -1) {
    return;
  }
  if (sock === G.udpSock) {
    fprintf(R.stderr, S("garbage packet discarded.\n"));
    return;
  }
  if (packet.pnum < 0 || packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handlePlyrLogin: bad index %d\n"), p_no);
    return;
  }
  packet.name[16 - 1] = 0;
  packet.monitor[16 - 1] = 0;
  packet.login[16 - 1] = 0;
  pl = $sadd(G.players, p_no);
  if (G.identityBlind) {
    strcpy(P(pl.p_name), S(""));
    strcpy(P(pl.p_monitor), S(""));
    strcpy(P(pl.p_login), S(""));
    pl.p_stats.st_rank = 0;
  } else {
    strcpy(P(pl.p_name), P(packet.name));
    strcpyp_return(P(pl.p_monitor), P(packet.monitor), 16);
    strcpy(P(pl.p_login), P(packet.login));
    pl.p_stats.st_rank = packet.rank;
  }
  if (p_no === G.me.p_no) {
    if (G.lastRank === -1) {
      if (G.loggedIn) {
        G.lastRank = packet.rank;
      }
    } else {
      if (G.lastRank !== packet.rank) {
        G.lastRank = packet.rank;
        G.promoted = 1;
      }
    }
  }
  {
    G.updatePlayer[p_no] = 1;
    G.plistUpdated = 1;
  }
  ;
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PL_LOGIN:\t"));
    fprintf(R.stderr, S("%d\t%d\t%s\t%s\t%s"), packet.pnum, packet.rank, P(packet.name), P(packet.monitor), P(packet.login));
  }
}

export function handleStats(packet: struct_stats_spacket | null): void {
  packet = $cast(struct_stats_spacket, packet);
  let p_no = packet.pnum;
  let pl = null;
  if (p_no < 0 || p_no >= MAXPLAYER) {
    fprintf(R.stderr, S("handleStats: bad index %d\n"), p_no);
    return;
  }
  pl = $sadd(G.players, p_no);
  pl.p_stats.st_tkills = ntohl(packet.tkills >>> 0) | 0;
  pl.p_stats.st_tlosses = ntohl(packet.tlosses >>> 0) | 0;
  pl.p_stats.st_kills = ntohl(packet.kills >>> 0) | 0;
  pl.p_stats.st_losses = ntohl(packet.losses >>> 0) | 0;
  pl.p_stats.st_tticks = ntohl(packet.tticks >>> 0) | 0;
  pl.p_stats.st_tplanets = ntohl(packet.tplanets >>> 0) | 0;
  pl.p_stats.st_tarmsbomb = ntohl(packet.tarmies >>> 0) | 0;
  pl.p_stats.st_sbkills = ntohl(packet.sbkills >>> 0) | 0;
  pl.p_stats.st_sblosses = ntohl(packet.sblosses >>> 0) | 0;
  pl.p_stats.st_armsbomb = ntohl(packet.armies >>> 0) | 0;
  pl.p_stats.st_planets = ntohl(packet.planets >>> 0) | 0;
  if (pl.p_ship.s_type === STARBASE && G.SBhours) {
    pl.p_stats.st_sbticks = ntohl(packet.maxkills >>> 0) | 0;
  } else {
    pl.p_stats.st_maxkills = ntohl(packet.maxkills >>> 0) / 100;
  }
  pl.p_stats.st_sbmaxkills = ntohl(packet.sbmaxkills >>> 0) / 100;
  if (pl.p_status !== PFREE) {
    G.updatePlayer[p_no] = 1;
    G.plistUpdated = 1;
  }
  ;
}

export function handlePlyrInfo(packet: struct_plyr_info_spacket | null): void {
  packet = $cast(struct_plyr_info_spacket, packet);
  let p_no = packet.pnum;
  let pl = null;
  if (p_no < 0 || p_no >= MAXPLAYER) {
    fprintf(R.stderr, S("handlePlyrInfo: bad index %d\n"), p_no);
    return;
  }
  if (packet.team > ALLTEAM) {
    fprintf(R.stderr, S("handlePlyrInfo: bad team %d\n"), packet.team);
    return;
  }
  pl = $sadd(G.players, p_no);
  {
    G.updatePlayer[p_no] = 1;
    G.plistUpdated = 1;
  }
  ;
  if (pl.p_team !== packet.team || pl.p_team === 0 && pl.p_mapchars[0] !== G.teamlet[0]) {
    pl.p_team = packet.team;
    pl.p_mapchars[0] = G.teamlet[pl.p_team];
    {
      G.plistReorder = 1;
    }
    ;
    if (pl === G.me) {
      G.redrawall = 1;
    }
  }
  getship(pl.p_ship, packet.shiptype);
  pl.p_mapchars[1] = G.shipnos.a[G.shipnos.o + pl.p_no];
  if (G.me === pl && handlePlyrInfo$lastship !== G.me.p_ship.s_type) {
    redrawTstats(null);
    calibrate_stats();
    redrawStats(null);
  }
  G.redrawPlayer[p_no] = 1;
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PLAYER_INFO:\t"));
    fprintf(R.stderr, S("%d\t%d\t%d"), packet.pnum, packet.shiptype, packet.team);
  }
}

export function sendUpdatePacket(speed: number): void {
  let packet = new struct_updates_cpacket();
  bzero(packet, 8);
  packet.type = CP_UPDATES;
  G.timerDelay = speed;
  packet.usecs = htonl(speed >>> 0);
  sendServerPacket($cast(struct_player_spacket, packet));
}

export function handlePlanetLoc(packet: struct_planet_loc_spacket | null): void {
  packet = $cast(struct_planet_loc_spacket, packet);
  let pl_no = packet.pnum;
  let pl = null;
  if (pl_no < 0 || pl_no >= MAXPLANETS) {
    fprintf(R.stderr, S("handlePlanetLoc: bad index\n"));
    return;
  }
  pl = $sadd(G.planets, pl_no);
  G.pl_update[pl_no].plu_x = pl.pl_x;
  G.pl_update[pl_no].plu_y = pl.pl_y;
  if (G.pl_update[pl_no].plu_update !== -1) {
    G.pl_update[pl_no].plu_update = 1;
  } else {
    G.pl_update[pl_no].plu_update = 0;
  }
  pl.pl_x = ntohl(packet.x >>> 0) | 0;
  pl.pl_y = ntohl(packet.y >>> 0) | 0;
  strcpy(P(pl.pl_name), P(packet.name));
  pl.pl_namelen = strlen(P(packet.name)) | 0;
  pl.pl_flags |= PLREDRAW | PLCLEAR;
  G.reinitPlanets = 1;
  if (G.rotate) {
    rotate_coord(P(pl, "pl_x"), P(pl, "pl_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
  }
  if (G.gather_stats) {
    fprintf(R.stderr, S("\nSTATS_SP_PLANET_LOC:\t"));
    fprintf(R.stderr, S("%d\t%d\t%d\t%s"), packet.pnum, ntohl(packet.x >>> 0), ntohl(packet.y >>> 0), P(packet.name));
  }
}

export function handleReserved(packet: struct_reserved_spacket | null, sock: number): void {
  packet = $cast(struct_reserved_spacket, packet);
  let response = new struct_reserved_cpacket();
  bzero(response, 36);
  if (sock === -1) {
    return;
  }
  if (sock === G.udpSock) {
    fprintf(R.stderr, S("garbage Reserved packet discarded.\n"));
    return;
  }
  encryptReservedPacket(packet, response, G.serverName, G.me.p_no);
  sendServerPacket($cast(struct_player_spacket, response));
}

export function handleShipCap(packet: struct_ship_cap_spacket | null): void {
  packet = $cast(struct_ship_cap_spacket, packet);
  let stype = 0;
  stype = ntohs(packet.s_type);
  G.shipvals[stype].s_torpspeed = ntohs(packet.s_torpspeed);
  G.shipvals[stype].s_maxshield = ntohl(packet.s_maxshield >>> 0) | 0;
  G.shipvals[stype].s_maxdamage = ntohl(packet.s_maxdamage >>> 0) | 0;
  G.shipvals[stype].s_maxegntemp = ntohl(packet.s_maxegntemp >>> 0) | 0;
  G.shipvals[stype].s_maxwpntemp = ntohl(packet.s_maxwpntemp >>> 0) | 0;
  G.shipvals[stype].s_maxarmies = ntohs(packet.s_maxarmies) << 16 >> 16;
  G.shipvals[stype].s_maxfuel = ntohl(packet.s_maxfuel >>> 0) | 0;
  G.shipvals[stype].s_maxspeed = ntohl(packet.s_maxspeed >>> 0) | 0;
  G.shipvals[stype].s_width = ntohs(packet.s_width) << 16 >> 16;
  G.shipvals[stype].s_height = ntohs(packet.s_height) << 16 >> 16;
  G.shipvals[stype].s_phaserdamage = ntohs(packet.s_phaserrange) << 16 >> 16;
  getship(G.myship, G.myship.s_type);
}

function handleGeneric32_a(packet: struct_generic_32_spacket_a | null): void {
  G.me.p_repair_time = packet.repair_time << 16 >> 16;
  G.me.pl_orbit = packet.pl_orbit << 16 >> 16;
}

function handleGeneric32_b(packet: struct_generic_32_spacket_b | null): void {
  let rate = 0;
  G.me.p_repair_time = ntohs(packet.repair_time) << 16 >> 16;
  G.me.pl_orbit = packet.pl_orbit;
  G.context.gameup = ntohs(packet.gameup) << 16 >> 16;
  G.context.tournament_teams = packet.tournament_teams;
  G.context.tournament_age = packet.tournament_age;
  G.context.tournament_age_units = packet.tournament_age_units;
  G.context.tournament_remain = packet.tournament_remain;
  G.context.tournament_remain_units = packet.tournament_remain_units;
  G.context.starbase_remain = packet.starbase_remain;
  G.context.team_remain = packet.team_remain;
  rate = intDefault(S("updatespersec.idle"), 1);
  if ((handleGeneric32_b$unsafe ^ G.context.gameup) & GU_UNSAFE) {
    handleGeneric32_b$unsafe = G.context.gameup;
    if (G.context.gameup & GU_UNSAFE) {
      if (handleGeneric32_b$idling) {
        if (rate < 0) {
          warning(S("Safe idle stop."));
        } else {
          sendUpdatePacket(1000000 / handleGeneric32_b$saved_ups | 0);
          warning(S("Safe idle stop, normal update rate resumed."));
        }
        if (G.context.tournament_age_units === 115 && G.context.tournament_age < 5 && booleanDefault(S("game-begin-while-idle-beep"), 1)) {
          W_Beep();
        }
        handleGeneric32_b$idling = 0;
      }
    } else {
      if (!(G.context.gameup & GU_UNSAFE)) {
        if (!handleGeneric32_b$idling) {
          if (rate < 0) {
            warning(S("Safe idle start."));
          } else {
            handleGeneric32_b$saved_ups = G.client_ups;
            sendUpdatePacket(1000000 / rate | 0);
            ++handleGeneric32_b$idling;
            warning(S("Safe idle start, update rate reduced."));
          }
        }
      }
    }
  }
}

function handleGeneric32(packet: struct_generic_32_spacket | null): void {
  packet = $cast(struct_generic_32_spacket, packet);
  switch (packet.version) {
  case 96 + GENERIC_32_VERSION_A:
    handleGeneric32_a($cast(struct_generic_32_spacket_a, packet));
    break;
  case 96 + GENERIC_32_VERSION_B:
    handleGeneric32_b($cast(struct_generic_32_spacket_b, packet));
    break;
  }
}

export function handleRank(packet: struct_rank_spacket | null): void {
  packet = $cast(struct_rank_spacket, packet);
  let i = packet.rnum;
  let j = packet.rmax + 1;
  if (i < 0 || j < 0 || i > j) {
    return;
  }
  if (j > G.nranks) {
    G.ranks = $cast(struct_rank, realloc(G.ranks, $u64(j) * 32));
    if (!G.ranks) {
      fprintf(R.stderr, S("unable to allocate memory to grow ranks\n"));
      exit(1);
    }
    memset($sadd(G.ranks, G.nranks), 0, $u64(j - G.nranks) * 32);
  }
  G.nranks = j;
  W_ChangeBorder(G.rankw, G.gColor);
  packet.name[15] = 0;
  $sadd(G.ranks, i).name = strdup(P(packet.name));
  packet.cname[7] = 0;
  $sadd(G.ranks, i).cname = strdup(P(packet.cname));
  $sadd(G.ranks, i).hours = ntohl(packet.hours >>> 0) / 100;
  $sadd(G.ranks, i).ratings = ntohl(packet.ratings >>> 0) / 100;
  $sadd(G.ranks, i).offense = ntohl(packet.offense >>> 0) / 100;
}

function dump_prefix(abbr: Ptr | null, name: Ptr | null): void {
  fprintf(R.stderr, S("%-10s %-30s "), abbr, name);
}

export function handleLtd(packet: struct_ltd_spacket | null, sock: number): void {
  packet = $cast(struct_ltd_spacket, packet);
  if (packet.version !== LTD_VERSION) {
    return;
  }
  let ltd = new struct_ltd_stats();
  ltd.kills.total = ntohl(packet.kt);
  ltd.kills.max = ntohl(packet.kmax) / 100;
  ltd.kills.first = ntohl(packet.k1);
  ltd.kills.first_potential = ntohl(packet.k1p);
  ltd.kills.first_converted = ntohl(packet.k1c);
  ltd.kills.second = ntohl(packet.k2);
  ltd.kills.second_potential = ntohl(packet.k2p);
  ltd.kills.second_converted = ntohl(packet.k2c);
  ltd.kills.phasered = ntohl(packet.kbp);
  ltd.kills.torped = ntohl(packet.kbt);
  ltd.kills.plasmaed = ntohl(packet.kbs);
  ltd.deaths.total = ntohl(packet.dt);
  ltd.deaths.potential = ntohl(packet.dpc);
  ltd.deaths.converted = ntohl(packet.dcc);
  ltd.deaths.dooshed = ntohl(packet.ddc);
  ltd.deaths.phasered = ntohl(packet.dbp);
  ltd.deaths.torped = ntohl(packet.dbt);
  ltd.deaths.plasmaed = ntohl(packet.dbs);
  ltd.deaths.acc = ntohl(packet.acc);
  ltd.planets.taken = ntohl(packet.ptt);
  ltd.planets.destroyed = ntohl(packet.pdt);
  ltd.bomb.planets = ntohl(packet.bpt);
  ltd.bomb.planets_8 = ntohl(packet.bp8);
  ltd.bomb.planets_core = ntohl(packet.bpc);
  ltd.bomb.armies = ntohl(packet.bat);
  ltd.bomb.armies_8 = ntohl(packet.ba8);
  ltd.bomb.armies_core = ntohl(packet.bac);
  ltd.ogged.armies = ntohl(packet.oat);
  ltd.ogged.dooshed = ntohl(packet.odc);
  ltd.ogged.converted = ntohl(packet.occ);
  ltd.ogged.potential = ntohl(packet.opc);
  ltd.ogged.bigger_ship = ntohl(packet.ogc);
  ltd.ogged.same_ship = ntohl(packet.oec);
  ltd.ogged.smaller_ship = ntohl(packet.olc);
  ltd.ogged.sb_armies = ntohl(packet.osba);
  ltd.ogged.friendly = ntohl(packet.ofc);
  ltd.ogged.friendly_armies = ntohl(packet.ofa);
  ltd.armies.total = ntohl(packet.at);
  ltd.armies.attack = ntohl(packet.aa);
  ltd.armies.reinforce = ntohl(packet.ar);
  ltd.armies.ferries = ntohl(packet.af);
  ltd.armies.killed = ntohl(packet.ak);
  ltd.carries.total = ntohl(packet.ct);
  ltd.carries.partial = ntohl(packet.cp);
  ltd.carries.completed = ntohl(packet.cc);
  ltd.carries.attack = ntohl(packet.ca);
  ltd.carries.reinforce = ntohl(packet.cr);
  ltd.carries.ferries = ntohl(packet.cf);
  ltd.ticks.total = ntohl(packet.tt);
  ltd.ticks.yellow = ntohl(packet.tyel);
  ltd.ticks.red = ntohl(packet.tred);
  ltd.ticks.zone[0] = ntohl(packet.tz0);
  ltd.ticks.zone[1] = ntohl(packet.tz1);
  ltd.ticks.zone[2] = ntohl(packet.tz2);
  ltd.ticks.zone[3] = ntohl(packet.tz3);
  ltd.ticks.zone[4] = ntohl(packet.tz4);
  ltd.ticks.zone[5] = ntohl(packet.tz5);
  ltd.ticks.zone[6] = ntohl(packet.tz6);
  ltd.ticks.zone[7] = ntohl(packet.tz7);
  ltd.ticks.potential = ntohl(packet.tpc);
  ltd.ticks.carrier = ntohl(packet.tcc);
  ltd.ticks.repair = ntohl(packet.tr);
  ltd.damage_repaired = ntohl(packet.dr);
  ltd.weapons.phaser.fired = ntohl(packet.wpf);
  ltd.weapons.phaser.hit = ntohl(packet.wph);
  ltd.weapons.phaser.damage.inflicted = ntohl(packet.wpdi);
  ltd.weapons.phaser.damage.taken = ntohl(packet.wpdt);
  ltd.weapons.torps.fired = ntohl(packet.wtf);
  ltd.weapons.torps.hit = ntohl(packet.wth);
  ltd.weapons.torps.detted = ntohl(packet.wtd);
  ltd.weapons.torps.selfdetted = ntohl(packet.wts);
  ltd.weapons.torps.wall = ntohl(packet.wtw);
  ltd.weapons.torps.damage.inflicted = ntohl(packet.wtdi);
  ltd.weapons.torps.damage.taken = ntohl(packet.wtdt);
  ltd.weapons.plasma.fired = ntohl(packet.wsf);
  ltd.weapons.plasma.hit = ntohl(packet.wsh);
  ltd.weapons.plasma.phasered = ntohl(packet.wsp);
  ltd.weapons.plasma.wall = ntohl(packet.wsw);
  ltd.weapons.plasma.damage.inflicted = ntohl(packet.wsdi);
  ltd.weapons.plasma.damage.taken = ntohl(packet.wsdt);
  return;
  fprintf(R.stderr, S("SP_LTD test output begins\n"));
  dump_prefix(S("kt"), S("kills total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.total);
  }
  ;
  dump_prefix(S("kmax"), S("kills max"));
  {
    fprintf(R.stderr, S(" %8u\n"), Math.trunc(ltd.kills.max) >>> 0);
  }
  ;
  dump_prefix(S("k1"), S("kills first"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.first);
  }
  ;
  dump_prefix(S("k1p"), S("kills first potential"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.first_potential);
  }
  ;
  dump_prefix(S("k1c"), S("kills first converted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.first_converted);
  }
  ;
  dump_prefix(S("k2"), S("kills second"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.second);
  }
  ;
  dump_prefix(S("k2p"), S("kills second potential"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.second_potential);
  }
  ;
  dump_prefix(S("k2c"), S("kills second converted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.second_converted);
  }
  ;
  dump_prefix(S("kbp"), S("kills by phaser"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.phasered);
  }
  ;
  dump_prefix(S("kbt"), S("kills by torp"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.torped);
  }
  ;
  dump_prefix(S("kbs"), S("kills by smack"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.kills.plasmaed);
  }
  ;
  dump_prefix(S("dt"), S("deaths total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.total);
  }
  ;
  dump_prefix(S("dpc"), S("deaths as potential carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.potential);
  }
  ;
  dump_prefix(S("dcc"), S("deaths as converted carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.converted);
  }
  ;
  dump_prefix(S("ddc"), S("deaths as dooshed carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.dooshed);
  }
  ;
  dump_prefix(S("dbp"), S("deaths by phaser"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.phasered);
  }
  ;
  dump_prefix(S("dbt"), S("deaths by torp"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.torped);
  }
  ;
  dump_prefix(S("dbs"), S("deaths by smack"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.plasmaed);
  }
  ;
  dump_prefix(S("acc"), S("actual carriers created"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.deaths.acc);
  }
  ;
  dump_prefix(S("ptt"), S("planets taken total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.planets.taken);
  }
  ;
  dump_prefix(S("pdt"), S("planets destroyed total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.planets.destroyed);
  }
  ;
  dump_prefix(S("bpt"), S("bombed planets total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.bomb.planets);
  }
  ;
  dump_prefix(S("bp8"), S("bombed planets <=8"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.bomb.planets_8);
  }
  ;
  dump_prefix(S("bpc"), S("bombed planets core"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.bomb.planets_core);
  }
  ;
  dump_prefix(S("bat"), S("bombed armies total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.bomb.armies);
  }
  ;
  dump_prefix(S("ba8"), S("bombed_armies <= 8"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.bomb.armies_8);
  }
  ;
  dump_prefix(S("bac"), S("bombed armies core"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.bomb.armies_core);
  }
  ;
  dump_prefix(S("oat"), S("ogged armies total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.armies);
  }
  ;
  dump_prefix(S("odc"), S("ogged dooshed carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.dooshed);
  }
  ;
  dump_prefix(S("occ"), S("ogged converted carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.converted);
  }
  ;
  dump_prefix(S("opc"), S("ogged potential carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.potential);
  }
  ;
  dump_prefix(S("o>c"), S("ogged bigger carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.bigger_ship);
  }
  ;
  dump_prefix(S("o=c"), S("ogged same carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.same_ship);
  }
  ;
  dump_prefix(S("o<c"), S("ogger smaller carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.smaller_ship);
  }
  ;
  dump_prefix(S("osba"), S("ogged sb armies"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.sb_armies);
  }
  ;
  dump_prefix(S("ofc"), S("ogged friendly carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.friendly);
  }
  ;
  dump_prefix(S("ofa"), S("ogged friendly armies"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ogged.friendly_armies);
  }
  ;
  dump_prefix(S("at"), S("armies carried total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.armies.total);
  }
  ;
  dump_prefix(S("aa"), S("armies used to attack"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.armies.attack);
  }
  ;
  dump_prefix(S("ar"), S("armies used to reinforce"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.armies.reinforce);
  }
  ;
  dump_prefix(S("af"), S("armies ferried"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.armies.ferries);
  }
  ;
  dump_prefix(S("ak"), S("armies killed"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.armies.killed);
  }
  ;
  dump_prefix(S("ct"), S("carries total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.carries.total);
  }
  ;
  dump_prefix(S("cp"), S("carries partial"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.carries.partial);
  }
  ;
  dump_prefix(S("cc"), S("carries completed"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.carries.completed);
  }
  ;
  dump_prefix(S("ca"), S("carries to attack"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.carries.attack);
  }
  ;
  dump_prefix(S("cr"), S("carries to reinforce"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.carries.reinforce);
  }
  ;
  dump_prefix(S("cf"), S("carries to ferry"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.carries.ferries);
  }
  ;
  dump_prefix(S("tt"), S("ticks total"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.total);
  }
  ;
  dump_prefix(S("tyel"), S("ticks in yellow"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.yellow);
  }
  ;
  dump_prefix(S("tred"), S("ticks in red"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.red);
  }
  ;
  dump_prefix(S("tz0"), S("ticks in zone 0"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[0]);
  }
  ;
  dump_prefix(S("tz1"), S("ticks in zone 1"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[1]);
  }
  ;
  dump_prefix(S("tz2"), S("ticks in zone 2"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[2]);
  }
  ;
  dump_prefix(S("tz3"), S("ticks in zone 3"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[3]);
  }
  ;
  dump_prefix(S("tz4"), S("ticks in zone 4"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[4]);
  }
  ;
  dump_prefix(S("tz5"), S("ticks in zone 5"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[5]);
  }
  ;
  dump_prefix(S("tz6"), S("ticks in zone 6"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[6]);
  }
  ;
  dump_prefix(S("tz7"), S("ticks in zone 7"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.zone[7]);
  }
  ;
  dump_prefix(S("tpc"), S("ticks as potential carrier"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.potential);
  }
  ;
  dump_prefix(S("tcc"), S("ticks as carrier++"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.carrier);
  }
  ;
  dump_prefix(S("tr"), S("ticks in repair"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.ticks.repair);
  }
  ;
  dump_prefix(S("dr"), S("damage repaired"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.damage_repaired);
  }
  ;
  dump_prefix(S("wpf"), S("weap phaser fired"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.phaser.fired);
  }
  ;
  dump_prefix(S("wph"), S("weap phaser hit"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.phaser.hit);
  }
  ;
  dump_prefix(S("wpdi"), S("weap phaser damage inflicted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.phaser.damage.inflicted);
  }
  ;
  dump_prefix(S("wpdt"), S("weap phaser damage taken"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.phaser.damage.taken);
  }
  ;
  dump_prefix(S("wtf"), S("weap torp fired"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.fired);
  }
  ;
  dump_prefix(S("wth"), S("weap torp hit"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.hit);
  }
  ;
  dump_prefix(S("wtd"), S("weap torp detted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.detted);
  }
  ;
  dump_prefix(S("wts"), S("weap torp self detted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.selfdetted);
  }
  ;
  dump_prefix(S("wtw"), S("weap torp hit wall"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.wall);
  }
  ;
  dump_prefix(S("wtdi"), S("weap torp damage inflicted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.damage.inflicted);
  }
  ;
  dump_prefix(S("wtdt"), S("weap torp damage taken"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.torps.damage.taken);
  }
  ;
  dump_prefix(S("wsf"), S("weap smack fired"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.plasma.fired);
  }
  ;
  dump_prefix(S("wsh"), S("weap smack hit"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.plasma.hit);
  }
  ;
  dump_prefix(S("wsp"), S("weap smack phasered"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.plasma.phasered);
  }
  ;
  dump_prefix(S("wsw"), S("weap smack hit wall"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.plasma.wall);
  }
  ;
  dump_prefix(S("wsdi"), S("weap smack damage inflicted"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.plasma.damage.inflicted);
  }
  ;
  dump_prefix(S("wsdt"), S("weap smack damage taken"));
  {
    fprintf(R.stderr, S(" %8u\n"), ltd.weapons.plasma.damage.taken);
  }
  ;
  fprintf(R.stderr, S("SP_LTD test output ends\n"));
}

export async function sendUdpReq(req: number): Promise<void> {
  let packet = new struct_udp_req_cpacket();
  memset(packet, 0, 8);
  packet.type = CP_UDP_REQ;
  packet.request = req << 24 >> 24;
  if (req >= COMM_MODE) {
    packet.request = COMM_MODE;
    packet.connmode = req - COMM_MODE << 24 >> 24;
    sendServerPacket($cast(struct_player_spacket, packet));
    return;
  }
  if (req === COMM_UPDATE) {
    if (G.recv_short) {
      resetWeaponInfo();
    }
    sendServerPacket($cast(struct_player_spacket, packet));
    warning(S("Sent request for full update"));
    return;
  }
  if (req === G.commModeReq) {
    warning(S("Request is in progress, do not disturb"));
    return;
  }
  if (req === COMM_UDP) {
    if (openUdpConn() >= 0) {
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Bound to local port %d on fd %d\n"), udpLocalPort, G.udpSock);
        }
      }
      ;
    } else {
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Bind to local port %d failed\n"), udpLocalPort);
        }
      }
      ;
      G.commModeReq = COMM_TCP;
      G.commStatus = STAT_CONNECTED;
      G.commSwitchTimeout = 0;
      if (G.udpWin) {
        udprefresh(UDP_STATUS);
      }
      warning(S("Unable to establish UDP connection"));
      return;
    }
  }
  packet.type = CP_UDP_REQ;
  packet.request = req << 24 >> 24;
  packet.port = htonl(udpLocalPort >>> 0) | 0;
  if (G.portSwap) {
    packet.connmode = CONNMODE_PORT;
  } else {
    packet.connmode = CONNMODE_PACKET;
  }
  sendServerPacket($cast(struct_player_spacket, packet));
  G.commModeReq = req;
  if (req === COMM_TCP) {
    G.commStatus = STAT_SWITCH_TCP;
  } else {
    G.commStatus = STAT_SWITCH_UDP;
  }
  G.commSwitchTimeout = 25;
  {
    if (G.udpDebug === 2) {
      printf(S("UDP: "));
      printf(S("Sent request for %s mode\n"), req === 0 ? S("TCP") : S("UDP"));
    }
  }
  ;
  if (!G.portSwap) {
    if (req === COMM_UDP && await recvUdpConn() < 0) {
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Sending TCP reset message\n"));
        }
      }
      ;
      packet.request = COMM_TCP;
      packet.port = 0;
      G.commModeReq = COMM_TCP;
      sendServerPacket($cast(struct_player_spacket, packet));
      G.commModeReq = COMM_TCP;
      G.commStatus = STAT_CONNECTED;
      G.commSwitchTimeout = 0;
    }
  }
  if (G.udpWin) {
    udprefresh(UDP_STATUS);
  }
}

export function handleUdpReply(packet: struct_udp_reply_spacket | null): void {
  packet = $cast(struct_udp_reply_spacket, packet);
  let $g = 0;
  let response = new struct_udp_req_cpacket();
  $L: for (;;) {
    switch ($g) {
    case 0:
      response = new struct_udp_req_cpacket();
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Received UDP reply %d\n"), packet.reply);
        }
      }
      ;
      G.commSwitchTimeout = 0;
      memset(response, 0, 8);
      response.type = CP_UDP_REQ;
      switch (packet.reply) {
      case 0: { $g = 3; continue $L; }
      case 1: { $g = 4; continue $L; }
      case 2: { $g = 5; continue $L; }
      case 3: { $g = 6; continue $L; }
      default: { $g = 7; continue $L; }
      }
    case 3:
      if (G.commMode === COMM_TCP) {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Got SWITCH_TCP_OK while in TCP mode; ignoring\n"));
          }
        }
        ;
      } else {
        G.commMode = COMM_TCP;
        G.commStatus = STAT_CONNECTED;
        warning(S("Switched to TCP-only connection"));
        closeUdpConn();
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("UDP port closed\n"));
          }
        }
        ;
        if (G.udpWin) {
          udprefresh(UDP_STATUS);
          udprefresh(UDP_CURRENT);
        }
      }
      { $g = 2; continue $L; };
    case 4:
      if (!(G.commMode === COMM_UDP)) { $g = 9; continue $L; }
      {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Got SWITCH_UDP_OK while in UDP mode; ignoring\n"));
          }
        }
        ;
      }
      { $g = 8; continue $L; }
    case 9:
      if (!(G.commModeReq !== COMM_UDP)) { $g = 11; continue $L; }
      {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Got unsolicited SWITCH_UDP_OK; ignoring\n"));
          }
        }
        ;
      }
      { $g = 10; continue $L; }
    case 11:
      if (G.portSwap) {
        udpServerPort = ntohl(packet.port >>> 0) | 0;
        if (connUdpConn() < 0) {
          {
            if (G.udpDebug === 2) {
              printf(S("UDP: "));
              printf(S("Unable to connect, resetting\n"));
            }
          }
          ;
          warning(S("Connection attempt failed"));
          G.commModeReq = COMM_TCP;
          G.commStatus = STAT_CONNECTED;
          if (G.udpSock >= 0) {
            closeUdpConn();
          }
          if (G.udpWin) {
            udprefresh(UDP_STATUS);
            udprefresh(UDP_CURRENT);
          }
          response.request = COMM_TCP;
          response.port = 0;
          { $g = 1; continue $L; }
        }
      }
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Connected to server's UDP port\n"));
        }
      }
      ;
      G.commStatus = STAT_VERIFY_UDP;
      if (G.udpWin) {
        udprefresh(UDP_STATUS);
      }
      response.request = COMM_VERIFY;
      response.port = 0;
      G.commSwitchTimeout = 25;
    case 1: // send
      sendServerPacket($cast(struct_player_spacket, response));
    case 10:
    case 8:
      { $g = 2; continue $L; };
    case 5:
      if (ntohs(packet.port & 0xffff)) {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Switch to UDP failed (different version)\n"));
          }
        }
        ;
        warning(S("UDP protocol request failed (bad version)"));
      } else {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("Switch to UDP denied\n"));
          }
        }
        ;
        warning(S("UDP protocol request denied"));
      }
      G.commModeReq = G.commMode;
      G.commStatus = STAT_CONNECTED;
      G.commSwitchTimeout = 0;
      if (G.udpWin) {
        udprefresh(UDP_STATUS);
      }
      if (G.udpSock >= 0) {
        closeUdpConn();
      }
      { $g = 2; continue $L; };
    case 6:
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("Received UDP verification\n"));
        }
      }
      ;
      { $g = 2; continue $L; };
    case 7:
      fprintf(R.stderr, S("netrek: Got funny reply (%d) in UDP_REPLY packet\n"), packet.reply);
      { $g = 2; continue $L; };
    case 2:
    }
    break;
  }
}

function openUdpConn(): number {
  let addr = new struct_sockaddr_in();
  let hp = null;
  let attempts = 0;
  if (G.udpSock >= 0) {
    fprintf(R.stderr, S("netrek: tried to open udpSock twice\n"));
    return 0;
  }
  if ((G.udpSock = socket(AF_INET, SOCK_DGRAM, 0)) < 0) {
    perror(S("netrek: unable to create DGRAM socket"));
    return -1;
  }
  if (G.udpSock >= G.max_fd) {
    G.max_fd = G.udpSock + 1;
  }
  addr.sin_addr.s_addr = INADDR_ANY;
  addr.sin_family = AF_INET;
  $wr(P(R, "errno"), 0, 0);
  udpLocalPort = (getpid() & 32767) + random() % 256 | 0;
  if (G.baseLocalPort) {
    udpLocalPort = G.baseLocalPort;
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("using base port %d\n"), G.baseLocalPort);
      }
    }
    ;
  }
  for (attempts = 0; attempts < MAX_PORT_RETRY; ++attempts) {
    while (udpLocalPort < 2048) {
      udpLocalPort = udpLocalPort + 10687 & 32767;
    }
    addr.sin_port = htons(udpLocalPort & 0xffff);
    if (bind(G.udpSock, $cast(struct_sockaddr, addr), 16) >= 0) {
      break;
    }
    if (G.baseLocalPort) {
      ++udpLocalPort;
    } else {
      udpLocalPort = udpLocalPort + 10687 & 32767;
    }
  }
  if (attempts === MAX_PORT_RETRY) {
    perror(S("netrek: bind"));
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("Unable to find a local port to bind to\n"));
      }
    }
    ;
    close(G.udpSock);
    G.udpSock = -1;
    return -1;
  }
  {
    if (G.udpDebug === 2) {
      printf(S("UDP: "));
      printf(S("Local port is %d\n"), udpLocalPort);
    }
  }
  ;
  if (!serveraddr) {
    if ((addr.sin_addr.s_addr = inet_addr(G.serverName)) === 4294967295) {
      if (!(hp = gethostbyname(G.serverName))) {
        printf(S("Who is %s?\n"), G.serverName);
        terminate(0);
      } else {
        addr.sin_addr.s_addr = $rd($pcast(hp.h_addr_list.a[hp.h_addr_list.o + h_addr], 4, true, false)) >>> 0;
      }
    }
    serveraddr = addr.sin_addr.s_addr | 0;
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("Found serveraddr == %s\n"), inet_ntoa(addr.sin_addr.$clone()));
      }
    }
    ;
  }
  return 0;
}

export function connUdpConn(): number {
  let addr = new struct_sockaddr_in();
  addr.sin_addr.s_addr = serveraddr >>> 0;
  addr.sin_family = AF_INET;
  addr.sin_port = htons(udpServerPort & 0xffff);
  {
    if (G.udpDebug === 2) {
      printf(S("UDP: "));
      printf(S("Connecting to host %s on port %d\n"), inet_ntoa(addr.sin_addr.$clone()), udpServerPort);
    }
  }
  ;
  if (connect(G.udpSock, $cast(struct_sockaddr, addr), 16) < 0) {
    perror(S("netrek: unable to connect UDP socket"));
    printUdpInfo();
    return -1;
  }
  return 0;
}

async function recvUdpConn(): Promise<number> {
  let $t1: any, $t2: any;
  let readfds = new struct_fd_set();
  let to = new struct_timeval();
  let from = new struct_sockaddr_in();
  let res = 0;
  const fromlen = new Uint32Array(1);
  memset(from, 0, 16);
  ns_init(3);
  {
    if (G.udpDebug === 2) {
      printf(S("UDP: "));
      printf(S("Issuing recvfrom() call\n"));
    }
  }
  ;
  printUdpInfo();
  fromlen[0] = 16;
  do {
    let __i = 0;
    let __arr = readfds;
    for (__i = 0; __i < Math.trunc(128 / 8); __i = __i + 1 >>> 0) {
      __arr.__fds_bits[__i] = 0;
    }
  } while (0);
  ($t1 = readfds.__fds_bits, $t2 = G.udpSock / (8 * 8) | 0, $t1[$t2] = $t1[$t2] | $shl64(1, G.udpSock % (8 * 8)));
  to.tv_sec = 6;
  to.tv_usec = 0;
  if ((res = await select(G.max_fd, readfds, null, null, to)) <= 0) {
    if (!res) {
      {
        if (G.udpDebug === 2) {
          printf(S("UDP: "));
          printf(S("timed out waiting for response\n"));
        }
      }
      ;
      warning(S("UDP connection request timed out"));
      return -1;
    } else {
      perror(S("select() before recvfrom()"));
      return -1;
    }
  }
  if (recvfrom(G.udpSock, P(G.buf), BUFSIZE, 0, $cast(struct_sockaddr, from), P(fromlen, 0)) < 0) {
    perror(S("recvfrom"));
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("recvfrom failed, aborting UDP attempt\n"));
      }
    }
    ;
    return -1;
  }
  if (from.sin_addr.s_addr !== serveraddr >>> 0) {
    serveraddr = from.sin_addr.s_addr | 0;
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("Warning: from different IP\n"));
      }
    }
    ;
  }
  if (from.sin_family !== AF_INET) {
    {
      if (G.udpDebug === 2) {
        printf(S("UDP: "));
        printf(S("Warning: not AF_INET (%d)\n"), from.sin_family);
      }
    }
    ;
  }
  udpServerPort = ntohs(from.sin_port);
  {
    if (G.udpDebug === 2) {
      printf(S("UDP: "));
      printf(S("recvfrom() succeeded; will use server port %d\n"), udpServerPort);
    }
  }
  ;
  if (connect(G.udpSock, $cast(struct_sockaddr, from), 16) < 0) {
    perror(S("netrek: unable to connect UDP socket after recvfrom()"));
    close(G.udpSock);
    G.udpSock = -1;
    return -1;
  }
  return 0;
}

export function closeUdpConn(): number {
  {
    if (G.udpDebug === 2) {
      printf(S("UDP: "));
      printf(S("Closing UDP socket\n"));
    }
  }
  ;
  if (G.udpSock < 0) {
    fprintf(R.stderr, S("netrek: tried to close a closed UDP socket\n"));
    return -1;
  }
  shutdown(G.udpSock, 2);
  close(G.udpSock);
  G.udpSock = -1;
  return 0;
}

export function printUdpInfo(): void {
  let addr = new struct_sockaddr_in();
  const len = new Uint32Array(1);
  len[0] = 16;
  if (getsockname(G.udpSock, $cast(struct_sockaddr, addr), P(len, 0)) < 0) {
    return;
  }
  {
    if (G.udpDebug) {
      printf(S("UDP: "));
      printf(S("LOCAL: addr=0x%x, family=%d, port=%d\n"), addr.sin_addr.s_addr, addr.sin_family, ntohs(addr.sin_port));
    }
  }
  ;
  if (getpeername(G.udpSock, $cast(struct_sockaddr, addr), P(len, 0)) < 0) {
    return;
  }
  {
    if (G.udpDebug) {
      printf(S("UDP: "));
      printf(S("PEER : addr=0x%x, family=%d, port=%d\n"), addr.sin_addr.s_addr, addr.sin_family, ntohs(addr.sin_port));
    }
  }
  ;
}

export function handleSequence(packet: struct_sequence_spacket | null): void {
  packet = $cast(struct_sequence_spacket, packet);
  let newseq = 0;
  drop_flag = 0;
  if (chan !== G.udpSock) {
    return;
  }
  ++G.udpTotal;
  ++handleSequence$recent_count;
  if (!(G.udpTotal & 255)) {
    if (G.udpWin) {
      udprefresh(UDP_DROPPED);
    }
  }
  newseq = ntohs(packet.sequence);
  if ((sequence & 0xffff) > 65000 && (newseq & 0xffff) < 1000) {
    sequence = ((sequence + 65536 >>> 0 & 4294901760) >>> 0 | newseq >>> 0) >>> 0 | 0;
  } else {
    newseq |= (sequence >>> 0 & 4294901760) >>> 0;
    if (!G.udpSequenceChk) {
      sequence = newseq;
      return;
    }
    if (newseq > sequence) {
      if (newseq !== sequence + 1) {
        G.udpDropped += newseq - sequence - 1;
        G.udpTotal += newseq - sequence - 1;
        handleSequence$recent_dropped += newseq - sequence - 1;
        handleSequence$recent_count += newseq - sequence - 1;
        if (G.udpWin) {
          udprefresh(UDP_DROPPED);
        }
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("sequence=%d, newseq=%d, we lost some\n"), sequence, newseq);
          }
        }
        ;
      }
      sequence = newseq;
      if (G.shortversion === SHORTVERSION && G.recv_short) {
        G.me.p_flags = ((G.me.p_flags & 4294902015) >>> 0 | packet.flag16 << 8 >>> 0) >>> 0;
      }
    } else {
      if (packet.type === SP_SC_SEQUENCE) {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("(ignoring repeat %d)\n"), newseq);
          }
        }
        ;
      } else {
        {
          if (G.udpDebug === 2) {
            printf(S("UDP: "));
            printf(S("sequence=%d, newseq=%d, ignoring transmission\n"), sequence, newseq);
          }
        }
        ;
      }
      --G.packets_received;
      drop_flag = 1;
    }
  }
  if (handleSequence$recent_count > UDP_RECENT_INTR) {
    G.udpRecentDropped = handleSequence$recent_dropped;
    handleSequence$recent_count = handleSequence$recent_dropped = 0;
    if (G.udpWin) {
      udprefresh(UDP_DROPPED);
    }
  }
}

export function Log_Packet(type: number, act_size: number): void {
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let this_sec = 0;
  if (G.log_packets === 0) {
    return;
  }
  if (type <= 0 && $u64(type) > Math.trunc(1008 / 16) - 1) {
    fprintf(R.stderr, S("Attempted to log a bad packet? \n"));
    return;
  }
  ($t1 = G.packet_log, $t2 = type >>> 0, $t1[$t2] = $t1[$t2] + 1);
  Log_Packet$data_this_sec += act_size;
  G.ALL_BYTES += act_size;
  if (G.handlers[type >>> 0].size === -1) {
    ($t3 = vari_sizes, $t4 = type >>> 0, $t3[$t4] = $t3[$t4] + act_size);
  }
  this_sec = time(null);
  if (this_sec !== Log_Packet$lasttime) {
    Log_Packet$lasttime = this_sec;
    if (G.log_packets > 1) {
      fprintf(R.stdout, S("%d %d %d\n"), this_sec - Start_Time[0] | 0, Log_Packet$data_this_sec, outdata_this_sec);
    }
    if (Start_Time[0] === 0) {
      Start_Time[0] = this_sec;
    }
    if (Log_Packet$lasttime > Start_Time[0] + 10) {
      if (Log_Packet$data_this_sec > Max_CPS) {
        Max_CPS = Log_Packet$data_this_sec;
      }
      if (outdata_this_sec > Max_CPSout) {
        Max_CPSout = outdata_this_sec;
      }
      sumpl += Log_Packet$data_this_sec;
      s2 = s2 + Math.imul(Log_Packet$data_this_sec, Log_Packet$data_this_sec);
      sout2 = sout2 + Math.imul(outdata_this_sec, outdata_this_sec);
      sumout += outdata_this_sec;
      ++numpl;
    }
    Log_Packet$data_this_sec = 0;
    outdata_this_sec = 0;
  }
}

export function Log_OPacket(type: number, size: number): void {
  if (G.log_packets === 0) {
    return;
  }
  ++G.outpacket_log[type];
  outdata_this_sec += size;
  if (type === CP_S_MESSAGE) {
    cp_msg_size += size;
  }
}

export function Dump_Packet_Log_Info(): void {
  let i = 0;
  const Now = new Float64Array(1);
  let total_bytes = 0;
  let outtotal_bytes = 0;
  let calc_temp = 0;
  Now[0] = time(null);
  printf(S("Packet Logging Summary:\n"));
  printf(S("Start time: %s "), ctime(P(Start_Time, 0)));
  printf(S(" End time: %s Elapsed play time: %3.2f min\n"), ctime(P(Now, 0)), Math.trunc((Now[0] - Start_Time[0]) / 60));
  printf(S("Maximum CPS in during normal play: %d bytes per sec\n"), Max_CPS);
  printf(S("Standard deviation in: %d\n"), Math.trunc(sqrt((numpl * s2 - Math.imul(sumpl, sumpl)) / Math.imul(numpl, numpl - 1))) | 0);
  printf(S("Maximum CPS out during normal play: %d bytes per sec\n"), Max_CPSout);
  printf(S("Standard deviation out: %d\n"), Math.trunc(sqrt((numpl * sout2 - Math.imul(sumout, sumout)) / Math.imul(numpl, numpl - 1))) | 0);
  for (i = 0; $u64(i) <= Math.trunc(1008 / 16) - 1; ++i) {
    if (G.handlers[i].size !== -1) {
      total_bytes += Math.imul(G.handlers[i].size, G.packet_log[i]);
    } else {
      total_bytes += vari_sizes[i];
    }
  }
  for (i = 0; $u64(i) <= Math.trunc(244 / 4) - 1; ++i) {
    if (G.handlers[i].size !== -1) {
      outtotal_bytes += Math.imul(G.outpacket_log[i], G.sizes[i]);
    } else {
      outtotal_bytes += cp_msg_size;
    }
  }
  printf(S("Total bytes received %d, average CPS: %4.1f\n"), total_bytes, Math.trunc(total_bytes / (Now[0] - Start_Time[0])));
  printf(S("Server Packets Summary:\n"));
  printf(S("Num #Rcvd    Size   TotlBytes   %%Total\n"));
  for (i = 0; $u64(i) <= Math.trunc(1008 / 16) - 1; ++i) {
    if (G.handlers[i].size !== -1) {
      calc_temp = Math.imul(G.handlers[i].size, G.packet_log[i]);
    } else {
      calc_temp = vari_sizes[i];
    }
    printf(S("%3d %5d    %4d   %9d   %3.2f\n"), i, G.packet_log[i], G.handlers[i].size, calc_temp, calc_temp * 100 / total_bytes | 0);
  }
  printf(S("Total bytes sent %d, average CPS: %4.1f\n"), outtotal_bytes, Math.trunc(outtotal_bytes / (Now[0] - Start_Time[0])));
  printf(S("Client Packets Summary:\n"));
  printf(S("Num #Sent    Size   TotlBytes   %%Total\n"));
  for (i = 0; $u64(i) <= Math.trunc(244 / 4) - 1; ++i) {
    if (G.sizes[i] === -1) {
      calc_temp = cp_msg_size;
    } else {
      calc_temp = Math.imul(G.sizes[i], G.outpacket_log[i]);
    }
    printf(S("%3d %5d    %4d   %9d   %3.2f\n"), i, G.outpacket_log[i], G.sizes[i], calc_temp, calc_temp * 100 / outtotal_bytes | 0);
  }
}

export function print_packet(packet: Ptr | null, size: number): void {
  let $t1: any, $t2: any;
  let i = 0;
  let data = null;
  let kills = 0;
  let pnum = 0;
  let nplanets = 0;
  let plpacket = null;
  if (G.log_packets === 0) {
    return;
  }
  switch (packet.a[packet.o]) {
  case 1:
    fprintf(R.stderr, S("\nS->C SP_MESSAGE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  m_flags=0x%0X, m_recpt=%d, m_from=%d, mesg=\"%s\","), $cast(struct_mesg_spacket, packet).m_flags, $cast(struct_mesg_spacket, packet).m_recpt, $cast(struct_mesg_spacket, packet).m_from, P($cast(struct_mesg_spacket, packet).mesg));
    }
    break;
  case 2:
    fprintf(R.stderr, S("\nS->C SP_PLAYER_INFO\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, shiptype=%d, team=%d,"), $cast(struct_plyr_info_spacket, packet).pnum, $cast(struct_plyr_info_spacket, packet).shiptype, $cast(struct_plyr_info_spacket, packet).team);
    }
    break;
  case 3:
    fprintf(R.stderr, S("\nS->C SP_KILLS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, kills=%u,"), $cast(struct_kills_spacket, packet).pnum, ntohl($cast(struct_kills_spacket, packet).kills));
    }
    break;
  case 4:
    fprintf(R.stderr, S("\nS->C SP_PLAYER\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, dir=%u, speed=%d, x=%d, y=%d,"), $cast(struct_player_spacket, packet).pnum, $cast(struct_player_spacket, packet).dir, $cast(struct_player_spacket, packet).speed, ntohl($cast(struct_player_spacket, packet).x >>> 0), ntohl($cast(struct_player_spacket, packet).y >>> 0));
    }
    break;
  case 5:
    fprintf(R.stderr, S("\nS->C SP_TORP_INFO\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  war=%d, status=%d, tnum=%u,"), $cast(struct_torp_info_spacket, packet).war, $cast(struct_torp_info_spacket, packet).status, ntohs($cast(struct_torp_info_spacket, packet).tnum));
    }
    break;
  case 6:
    fprintf(R.stderr, S("\nS->C SP_TORP\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  dir=%d, tnum=%u, x=%u, y=%u,"), $cast(struct_torp_spacket, packet).dir, ntohs($cast(struct_torp_spacket, packet).tnum), ntohl($cast(struct_torp_spacket, packet).x >>> 0), ntohl($cast(struct_torp_spacket, packet).y >>> 0));
    }
    break;
  case 7:
    fprintf(R.stderr, S("\nS->C SP_PHASER\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, status=%d, dir=%u, x=%d, y=%d, target=%d,"), $cast(struct_phaser_spacket, packet).pnum, $cast(struct_phaser_spacket, packet).status, $cast(struct_phaser_spacket, packet).dir, ntohl($cast(struct_phaser_spacket, packet).x >>> 0), ntohl($cast(struct_phaser_spacket, packet).y >>> 0), ntohl($cast(struct_phaser_spacket, packet).target >>> 0));
    }
    break;
  case 8:
    fprintf(R.stderr, S("\nS->C SP_PLASMA_INFO\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  war=%d, status=%d  pnum=%u,"), $cast(struct_plasma_info_spacket, packet).war, $cast(struct_plasma_info_spacket, packet).status, ntohs($cast(struct_plasma_info_spacket, packet).pnum));
    }
    break;
  case 9:
    fprintf(R.stderr, S("\nS->C SP_PLASMA\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%u, x=%d, y=%d,"), ntohs($cast(struct_plasma_spacket, packet).pnum), ntohl($cast(struct_plasma_spacket, packet).x >>> 0), ntohl($cast(struct_plasma_spacket, packet).y >>> 0));
    }
    break;
  case 10:
    fprintf(R.stderr, S("\nS->C SP_WARNING\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  mesg=\"%s\","), P($cast(struct_warning_spacket, packet).mesg));
    }
    break;
  case 11:
    fprintf(R.stderr, S("\nS->C SP_MOTD\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  line=\"%s\","), P($cast(struct_motd_spacket, packet).line));
    }
    break;
  case 12:
    fprintf(R.stderr, S("\nS->C SP_YOU\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, hostile=%d, swar=%d, armies=%d, flags=0x%0X, damage=%d, shield=%d, fuel=%d, etemp=%u, wtemp=%u, whydead=%u, whodead=%u,"), $cast(struct_you_spacket, packet).pnum, $cast(struct_you_spacket, packet).hostile, $cast(struct_you_spacket, packet).swar, $cast(struct_you_spacket, packet).armies, ntohs($cast(struct_you_spacket, packet).flags & 0xffff), ntohl($cast(struct_you_spacket, packet).damage >>> 0), ntohl($cast(struct_you_spacket, packet).shield >>> 0), ntohl($cast(struct_you_spacket, packet).fuel >>> 0), ntohs($cast(struct_you_spacket, packet).etemp), ntohs($cast(struct_you_spacket, packet).wtemp), ntohs($cast(struct_you_spacket, packet).whydead), ntohs($cast(struct_you_spacket, packet).whodead));
    }
    break;
  case 13:
    fprintf(R.stderr, S("\nS->C SP_QUEUE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pos=%u,"), ntohs($cast(struct_queue_spacket, packet).pos));
    }
    break;
  case 14:
    fprintf(R.stderr, S("\nS->C SP_STATUS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  tourn=%d, armsbomb=%u, planets=%u, kills=%u, losses=%u, time=%u, timeprod=%u,"), $cast(struct_status_spacket, packet).tourn, ntohl($cast(struct_status_spacket, packet).armsbomb), ntohl($cast(struct_status_spacket, packet).planets), ntohl($cast(struct_status_spacket, packet).kills), ntohl($cast(struct_status_spacket, packet).losses), ntohl($cast(struct_status_spacket, packet).time), ntohl($cast(struct_status_spacket, packet).timeprod));
    }
    break;
  case 15:
    fprintf(R.stderr, S("\nS->C SP_PLANET\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, owner=%d, info=%d, flags=0x%0X, armies=%d,"), $cast(struct_planet_spacket, packet).pnum, $cast(struct_planet_spacket, packet).owner, $cast(struct_planet_spacket, packet).info, ntohs($cast(struct_planet_spacket, packet).flags), ntohl($cast(struct_planet_spacket, packet).armies >>> 0));
    }
    break;
  case 16:
    fprintf(R.stderr, S("\nS->C SP_PICKOK\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_pickok_spacket, packet).state);
    }
    break;
  case 17:
    fprintf(R.stderr, S("\nS->C SP_LOGIN\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  accept=%d, flags=0x%0X, keymap=\"%s\","), $cast(struct_login_spacket, packet).accept, ntohl($cast(struct_login_spacket, packet).flags >>> 0), P($cast(struct_login_spacket, packet).keymap));
    }
    break;
  case 18:
    fprintf(R.stderr, S("\nS->C SP_FLAGS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, flags=0x%0X,"), $cast(struct_flags_spacket, packet).pnum, ntohl($cast(struct_flags_spacket, packet).flags));
    }
    break;
  case 19:
    fprintf(R.stderr, S("\nS->C SP_MASK\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  mask=%d,"), $cast(struct_mask_spacket, packet).mask);
    }
    break;
  case 20:
    fprintf(R.stderr, S("\nS->C SP_PSTATUS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, status=%d,"), $cast(struct_pstatus_spacket, packet).pnum, $cast(struct_pstatus_spacket, packet).status);
    }
    break;
  case 21:
    fprintf(R.stderr, S("\nS->C SP_BADVERSION\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  why=%d,"), $cast(struct_badversion_spacket, packet).why);
    }
    break;
  case 22:
    fprintf(R.stderr, S("\nS->C SP_HOSTILE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, war=%d, hostile=%d,"), $cast(struct_hostile_spacket, packet).pnum, $cast(struct_hostile_spacket, packet).war, $cast(struct_hostile_spacket, packet).hostile);
    }
    break;
  case 23:
    fprintf(R.stderr, S("\nS->C SP_STATS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, tkills=%d, tlosses=%d, kills=%d, losses=%d, tticks=%d, tplanets=%d, tarmies=%d, sbkills=%d, sblosses=%d, armies=%d, planets=%d, maxkills=%d, sbmaxkills=%d,"), $cast(struct_stats_spacket, packet).pnum, ntohl($cast(struct_stats_spacket, packet).tkills >>> 0), ntohl($cast(struct_stats_spacket, packet).tlosses >>> 0), ntohl($cast(struct_stats_spacket, packet).kills >>> 0), ntohl($cast(struct_stats_spacket, packet).losses >>> 0), ntohl($cast(struct_stats_spacket, packet).tticks >>> 0), ntohl($cast(struct_stats_spacket, packet).tplanets >>> 0), ntohl($cast(struct_stats_spacket, packet).tarmies >>> 0), ntohl($cast(struct_stats_spacket, packet).sbkills >>> 0), ntohl($cast(struct_stats_spacket, packet).sblosses >>> 0), ntohl($cast(struct_stats_spacket, packet).armies >>> 0), ntohl($cast(struct_stats_spacket, packet).planets >>> 0), ntohl($cast(struct_stats_spacket, packet).maxkills >>> 0), ntohl($cast(struct_stats_spacket, packet).sbmaxkills >>> 0));
    }
    break;
  case 24:
    fprintf(R.stderr, S("\nS->C SP_PL_LOGIN\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, rank=%d, name=\"%s\", monitor=\"%s\", login=\"%s\","), $cast(struct_plyr_login_spacket, packet).pnum, $cast(struct_plyr_login_spacket, packet).rank, P($cast(struct_plyr_login_spacket, packet).name), P($cast(struct_plyr_login_spacket, packet).monitor), P($cast(struct_plyr_login_spacket, packet).login));
    }
    break;
  case 25:
    fprintf(R.stderr, S("\nS->C SP_RESERVED\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  data="));
      for (i = 0; i < 16; ++i) {
        fprintf(R.stderr, S("0x%0X "), $cast(struct_reserved_spacket, packet).data[i] & 0xff);
      }
      fprintf(R.stderr, S(","));
    }
    break;
  case 26:
    fprintf(R.stderr, S("\nS->C SP_PLANET_LOC\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, x=%d, y=%d, name=\"%s\","), $cast(struct_planet_loc_spacket, packet).pnum, ntohl($cast(struct_planet_loc_spacket, packet).x >>> 0), ntohl($cast(struct_planet_loc_spacket, packet).y >>> 0), P($cast(struct_planet_loc_spacket, packet).name));
    }
    break;
  case 28:
    fprintf(R.stderr, S("\nS->C SP_UDP_REPLY\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  reply=%d, port=%d,"), $cast(struct_udp_reply_spacket, packet).reply, ntohl($cast(struct_udp_reply_spacket, packet).port >>> 0));
    }
    break;
  case 29:
    fprintf(R.stderr, S("\nS->C SP_SEQUENCE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  flag16=0x%0X, sequence=%u,"), $cast(struct_sequence_spacket, packet).flag16, ntohs($cast(struct_sequence_spacket, packet).sequence));
    }
    break;
  case 30:
    fprintf(R.stderr, S("\nS->C SP_SC_SEQUENCE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  sequence=%u,"), ntohs($cast(struct_sc_sequence_spacket, packet).sequence));
    }
    break;
  case 32:
    fprintf(R.stderr, S("\nS->C SP_GENERIC_32\t"));
    if (G.log_packets > 1) {
      switch ($cast(struct_generic_32_spacket, packet).version) {
      case 96 + GENERIC_32_VERSION_A:
        fprintf(R.stderr, S("  version=%c, repair_time=%d, pl_orbit=%d,"), $cast(struct_generic_32_spacket_a, packet).version, $cast(struct_generic_32_spacket_a, packet).repair_time, $cast(struct_generic_32_spacket_a, packet).pl_orbit);
        break;
      case 96 + GENERIC_32_VERSION_B:
        fprintf(R.stderr, S("  version=%c, repair_time=%d, pl_orbit=%d, gameup=0x%x, tourn_teams=%d, tourn_age=%d, tourn_age_units=%c, tourn_remain=%d, tourn_remain_units=%c, starbase_remain=%d, team_remain=%d,"), $cast(struct_generic_32_spacket_b, packet).version, ntohs($cast(struct_generic_32_spacket_b, packet).repair_time), $cast(struct_generic_32_spacket_b, packet).pl_orbit, ntohs($cast(struct_generic_32_spacket_b, packet).gameup), $cast(struct_generic_32_spacket_b, packet).tournament_teams, $cast(struct_generic_32_spacket_b, packet).tournament_age, $cast(struct_generic_32_spacket_b, packet).tournament_age_units, $cast(struct_generic_32_spacket_b, packet).tournament_remain, $cast(struct_generic_32_spacket_b, packet).tournament_remain_units, $cast(struct_generic_32_spacket_b, packet).starbase_remain, $cast(struct_generic_32_spacket_b, packet).team_remain);
        break;
      default:
        fprintf(R.stderr, S("  version=0x%x (unknown)"), $cast(struct_generic_32_spacket, packet).version);
      }
    }
    break;
  case 39:
    fprintf(R.stderr, S("\nS->C SP_SHIP_CAP\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  operation=%d, s_type=%u, s_torpspeed=%u, s_phaserrange=%u, s_maxspeed=%d, s_maxfuel=%d, s_maxshield=%d, s_maxdamage=%d, s_maxwpntemp=%d, s_maxegntemp=%d, s_width=%u, s_height=%d, s_maxarmies=%d, s_letter=%d, s_name=\"%s\", s_desig1=%c, s_desig2=%c, s_bitmap=%u,"), $cast(struct_ship_cap_spacket, packet).operation, ntohs($cast(struct_ship_cap_spacket, packet).s_type), ntohs($cast(struct_ship_cap_spacket, packet).s_torpspeed), ntohs($cast(struct_ship_cap_spacket, packet).s_phaserrange), $cast(struct_ship_cap_spacket, packet).s_maxspeed, $cast(struct_ship_cap_spacket, packet).s_maxfuel, $cast(struct_ship_cap_spacket, packet).s_maxshield, $cast(struct_ship_cap_spacket, packet).s_maxdamage, $cast(struct_ship_cap_spacket, packet).s_maxwpntemp, $cast(struct_ship_cap_spacket, packet).s_maxegntemp, ntohs($cast(struct_ship_cap_spacket, packet).s_width), ntohs($cast(struct_ship_cap_spacket, packet).s_height), ntohs($cast(struct_ship_cap_spacket, packet).s_maxarmies), $cast(struct_ship_cap_spacket, packet).s_letter, P($cast(struct_ship_cap_spacket, packet).s_name), $cast(struct_ship_cap_spacket, packet).s_desig1, $cast(struct_ship_cap_spacket, packet).s_desig2, ntohs($cast(struct_ship_cap_spacket, packet).s_bitmap));
    }
    break;
  case 40:
    fprintf(R.stderr, S("\nS->C SP_S_REPLY\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  repl=%d, windside=%u, gwidth=%d,"), $cast(struct_shortreply_spacket, packet).repl, ntohs($cast(struct_shortreply_spacket, packet).winside), ntohl($cast(struct_shortreply_spacket, packet).gwidth >>> 0));
    }
    break;
  case 41:
    fprintf(R.stderr, S("\nS->C SP_S_MESSAGE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  m_flags=0x%0X, m_recpt=%u, m_from=%u, length=%u, mesg=\"%s\","), $cast(struct_mesg_s_spacket, packet).m_flags, $cast(struct_mesg_s_spacket, packet).m_recpt, $cast(struct_mesg_s_spacket, packet).m_from, $cast(struct_mesg_s_spacket, packet).length, P($cast(struct_mesg_s_spacket, packet), "mesg"));
    }
    break;
  case 42:
    fprintf(R.stderr, S("\nS->C SP_S_WARNING\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  whichmessage=%u, argument=%d, argument2=%d,"), $cast(struct_warning_s_spacket, packet).whichmessage, $cast(struct_warning_s_spacket, packet).argument, $cast(struct_warning_s_spacket, packet).argument2);
    }
    break;
  case 43:
    fprintf(R.stderr, S("\nS->C SP_S_YOU\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, hostile=%d, swar=%d, armies=%d, whydead=%d, whodead=%d, flags=0x%0X,"), $cast(struct_youshort_spacket, packet).pnum, $cast(struct_youshort_spacket, packet).hostile, $cast(struct_youshort_spacket, packet).swar, $cast(struct_youshort_spacket, packet).armies, $cast(struct_youshort_spacket, packet).whydead, $cast(struct_youshort_spacket, packet).whodead, ntohl($cast(struct_youshort_spacket, packet).flags));
    }
    break;
  case 44:
    fprintf(R.stderr, S("\nS->C SP_S_YOU_SS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  ddamage=%u, shield=%u, fuel=%u, etemp=%u, wtemp=%u,"), ntohs($cast(struct_youss_spacket, packet).damage), ntohs($cast(struct_youss_spacket, packet).shield), ntohs($cast(struct_youss_spacket, packet).fuel), ntohs($cast(struct_youss_spacket, packet).etemp), ntohs($cast(struct_youss_spacket, packet).wtemp));
    }
    break;
  case 45:
    fprintf(R.stderr, S("\nS->C SP_S_PLAYER\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  packets=%d, dir=%u, speed=%d, x=%d, y=%d,"), $cast(struct_player_s_spacket, packet).packets, ntohl($cast(struct_player_s_spacket, packet).dir), $cast(struct_player_s_spacket, packet).speed, ntohl($cast(struct_player_s_spacket, packet).x >>> 0), ntohl($cast(struct_player_s_spacket, packet).y >>> 0));
    }
    break;
  case 46:
    fprintf(R.stderr, S("\nS->C SP_PING\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  number=%u, lag=%u, tloss_sc=%u, tloss_cs=%u, iloss_sc=%u, iloss_cs=%u,"), $cast(struct_ping_spacket, packet).number, $cast(struct_ping_spacket, packet).lag, $cast(struct_ping_spacket, packet).tloss_sc, $cast(struct_ping_spacket, packet).tloss_cs, $cast(struct_ping_spacket, packet).iloss_sc, $cast(struct_ping_spacket, packet).iloss_cs);
    }
    break;
  case 60:
    fprintf(R.stderr, S("\nS->C SP_FEATURE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  feature_type=%c, arg1=%d, arg2=%d, value=%d, name=\"%s\","), $cast(struct_feature_cpacket, packet).feature_type, $cast(struct_feature_cpacket, packet).arg1, $cast(struct_feature_cpacket, packet).arg2, ntohl($cast(struct_feature_cpacket, packet).value >>> 0), P($cast(struct_feature_cpacket, packet).name));
    }
    break;
  case 61:
    fprintf(R.stderr, S("\nS->C SP_RANK\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  rnum=%d, rmax=%d, name=\"%s\", hours=%d, ratings=%d, offense=%d, cname=\"%s\""), $cast(struct_rank_spacket, packet).rnum, $cast(struct_rank_spacket, packet).rmax, P($cast(struct_rank_spacket, packet).name), ntohl($cast(struct_rank_spacket, packet).hours >>> 0), ntohl($cast(struct_rank_spacket, packet).ratings >>> 0), ntohl($cast(struct_rank_spacket, packet).offense >>> 0), P($cast(struct_rank_spacket, packet).cname));
    }
    break;
  case 62:
    fprintf(R.stderr, S("\nS->C SP_LTD\t"));
    if (G.log_packets > 2) {
      let lp = $cast(struct_ltd_spacket, packet);
      fprintf(R.stderr, S("  version='%c', kt=%d, kmax=%d/100, k1=%d, k1p=%d, k1c=%d, k2=%d, k2p=%d, k2c=%d, kbp=%d, kbt=%d, kbs=%d, dt=%d, dpc=%d, dcc=%d, ddc=%d, dbp=%d, dbt=%d, dbs=%d, acc=%d, ptt=%d, pdt=%d, bpt=%d, bp8=%d, bpc=%d, bat=%d, ba8=%d, bac=%d, oat=%d, odc=%d, occ=%d, opc=%d, ogc=%d, oec=%d, olc=%d, osba=%d, ofc=%d, ofa=%d, at=%d, aa=%d, ar=%d, af=%d, ak=%d, ct=%d, cp=%d, cc=%d, ca=%d, cr=%d, cf=%d, tt=%d, tyel=%d, tred=%d, tz0=%d, tz1=%d, tz2=%d, tz3=%d, tz4=%d, tz5=%d, tz6=%d, tz7=%d, tpc=%d, tcc=%d, tr=%d, dr=%d, wpf=%d, wph=%d, wpdi=%d, wpdt=%d, wtf=%d, wth=%d, wtd=%d, wts=%d, wtw=%d, wtdi=%d, wtdt=%d, wsf=%d, wsh=%d, wsp=%d, wsw=%d, wsdi=%d, wsdt=%d, \n"), lp.version, ntohl(lp.kt), ntohl(lp.kmax), ntohl(lp.k1), ntohl(lp.k1p), ntohl(lp.k1c), ntohl(lp.k2), ntohl(lp.k2p), ntohl(lp.k2c), ntohl(lp.kbp), ntohl(lp.kbt), ntohl(lp.kbs), ntohl(lp.dt), ntohl(lp.dpc), ntohl(lp.dcc), ntohl(lp.ddc), ntohl(lp.dbp), ntohl(lp.dbt), ntohl(lp.dbs), ntohl(lp.acc), ntohl(lp.ptt), ntohl(lp.pdt), ntohl(lp.bpt), ntohl(lp.bp8), ntohl(lp.bpc), ntohl(lp.bat), ntohl(lp.ba8), ntohl(lp.bac), ntohl(lp.oat), ntohl(lp.odc), ntohl(lp.occ), ntohl(lp.opc), ntohl(lp.ogc), ntohl(lp.oec), ntohl(lp.olc), ntohl(lp.osba), ntohl(lp.ofc), ntohl(lp.ofa), ntohl(lp.at), ntohl(lp.aa), ntohl(lp.ar), ntohl(lp.af), ntohl(lp.ak), ntohl(lp.ct), ntohl(lp.cp), ntohl(lp.cc), ntohl(lp.ca), ntohl(lp.cr), ntohl(lp.cf), ntohl(lp.tt), ntohl(lp.tyel), ntohl(lp.tred), ntohl(lp.tz0), ntohl(lp.tz1), ntohl(lp.tz2), ntohl(lp.tz3), ntohl(lp.tz4), ntohl(lp.tz5), ntohl(lp.tz6), ntohl(lp.tz7), ntohl(lp.tpc), ntohl(lp.tcc), ntohl(lp.tr), ntohl(lp.dr), ntohl(lp.wpf), ntohl(lp.wph), ntohl(lp.wpdi), ntohl(lp.wpdt), ntohl(lp.wtf), ntohl(lp.wth), ntohl(lp.wtd), ntohl(lp.wts), ntohl(lp.wtw), ntohl(lp.wtdi), ntohl(lp.wtdt), ntohl(lp.wsf), ntohl(lp.wsh), ntohl(lp.wsp), ntohl(lp.wsw), ntohl(lp.wsdi), ntohl(lp.wsdt));
    }
    break;
  case 47:
    fprintf(R.stderr, S("\nS->C SP_S_TORP\t"));
    if (G.log_packets > 1) {
      print_sp_s_torp(packet, 1);
    }
    break;
  case 48:
    fprintf(R.stderr, S("\nS->C SP_S_TORP_INFO\t"));
    if (G.log_packets > 1) {
      print_sp_s_torp(packet, 3);
    }
    break;
  case 49:
    fprintf(R.stderr, S("\nS->C SP_S_8_TORP\t"));
    if (G.log_packets > 1) {
      print_sp_s_torp(packet, 2);
    }
    break;
  case 50:
    fprintf(R.stderr, S("\nS->C SP_S_PLANET\t"));
    if (G.log_packets > 1) {
      plpacket = $cast(struct_planet_s_spacket, packet.add(2));
      nplanets = packet.a[packet.o + 1];
      fprintf(R.stderr, S("nplanets = %d, "), nplanets);
      for (i = 0; i < nplanets; ++i, plpacket = $sadd(plpacket, 1)) {
        fprintf(R.stderr, S("pnum = %d, pl_owner = %d, info = %d, flags = %d, armies = %d "), plpacket.pnum, plpacket.owner, plpacket.info, plpacket.armies, ntohs(plpacket.flags));
      }
    }
    fprintf(R.stderr, S("\n"));
    break;
  case 56:
    fprintf(R.stderr, S("\nS->C SP_S_SEQUENCE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  No struct defined,"));
    }
    break;
  case 57:
    fprintf(R.stderr, S("\nS->C SP_S_PHASER\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  status=%d, pnum=%d, target=%d, dir=%d, x=%d, y=%d"), $cast(struct_phaser_s_spacket, packet).status & 15, $cast(struct_phaser_s_spacket, packet).pnum & 63, $cast(struct_phaser_s_spacket, packet).target, $cast(struct_phaser_s_spacket, packet).dir, Math.imul(SCALE, ntohs($cast(struct_phaser_s_spacket, packet).x & 0xffff)), Math.imul(SCALE, ntohs($cast(struct_phaser_s_spacket, packet).y & 0xffff)));
    }
    break;
  case 58:
    fprintf(R.stderr, S("\nS->C SP_S_KILLS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, "), packet.a[packet.o + 1] & 0xff);
      data = $view8(packet.add(2), false);
      for (i = 0; i >>> 0 < packet.a[packet.o + 1] >>> 0; ++i) {
        kills = $rd(($t1 = data, data = $t1.add(1), $t1));
        kills |= (data.a[data.o] & 3) << 8 & 0xffff;
        pnum = $rd(($t2 = data, data = $t2.add(1), $t2)) >> 2;
        fprintf(R.stderr, S("pnum = %d, kills = %d "), pnum, kills);
      }
    }
    fprintf(R.stderr, S("\n"));
    break;
  case 59:
    fprintf(R.stderr, S("\nS->C SP_S_STATS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d, tplanets=%d, tkills=%d, tlosses=%d, kills=%d, losses=%d, tticks=%d, tarmies=%d, sbkills=%d, sblosses=%d, armies=%d, planets=%d, maxkills=%d, sbmaxkills=%d,"), $cast(struct_stats_spacket, packet).pnum, ntohs($cast(struct_stats_spacket, packet).tplanets & 0xffff), ntohs($cast(struct_stats_spacket, packet).tkills & 0xffff), ntohs($cast(struct_stats_spacket, packet).tlosses & 0xffff), ntohs($cast(struct_stats_spacket, packet).kills & 0xffff), ntohs($cast(struct_stats_spacket, packet).losses & 0xffff), ntohl($cast(struct_stats_spacket, packet).tticks >>> 0), ntohl($cast(struct_stats_spacket, packet).tarmies >>> 0), ntohs($cast(struct_stats_spacket, packet).sbkills & 0xffff), ntohs($cast(struct_stats_spacket, packet).sblosses & 0xffff), ntohs($cast(struct_stats_spacket, packet).armies & 0xffff), ntohs($cast(struct_stats_spacket, packet).planets & 0xffff), ntohl($cast(struct_stats_spacket, packet).maxkills >>> 0), ntohl($cast(struct_stats_spacket, packet).sbmaxkills >>> 0));
    }
    break;
  default:
    fprintf(R.stderr, S("\nS->C UNKNOWN\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  type=%d,"), packet.a[packet.o]);
    }
  }
}

export function print_opacket(packet: Ptr | null, size: number): void {
  let i = 0;
  switch (packet.a[packet.o]) {
  case 1:
    fprintf(R.stderr, S("\nC->S CP_MESSAGE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  group=%d, indiv=%d, mesg=\"%s\","), $cast(struct_mesg_cpacket, packet).group, $cast(struct_mesg_cpacket, packet).indiv, P($cast(struct_mesg_cpacket, packet).mesg));
    }
    break;
  case 2:
    fprintf(R.stderr, S("\nC->S CP_SPEED\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  speed=%d,"), $cast(struct_speed_cpacket, packet).speed);
    }
    break;
  case 3:
    fprintf(R.stderr, S("\nC->S CP_DIRECTION\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  dir=%u,"), $cast(struct_dir_cpacket, packet).dir);
    }
    break;
  case 4:
    fprintf(R.stderr, S("\nC->S CP_PHASER\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  dir=%u,"), $cast(struct_phaser_cpacket, packet).dir);
    }
    break;
  case 5:
    fprintf(R.stderr, S("\nC->S CP_PLAMSA\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  dir=%u,"), $cast(struct_plasma_cpacket, packet).dir);
    }
    break;
  case 6:
    fprintf(R.stderr, S("\nC->S CP_TORP\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  dir=%u,"), $cast(struct_torp_cpacket, packet).dir);
    }
    break;
  case 7:
    fprintf(R.stderr, S("\nC->S CP_QUIT\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no args,"));
    }
    break;
  case 8:
    fprintf(R.stderr, S("\nC->S CP_LOGIN\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  query=%d, name=\"%s\", password=\"%s\", login=\"%s\","), $cast(struct_login_cpacket, packet).query, P($cast(struct_login_cpacket, packet).name), P($cast(struct_login_cpacket, packet).password), P($cast(struct_login_cpacket, packet).login));
    }
    break;
  case 9:
    fprintf(R.stderr, S("\nC->S CP_OUTFIT\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  team=%d, ship=%d,"), $cast(struct_outfit_cpacket, packet).team, $cast(struct_outfit_cpacket, packet).ship);
    }
    break;
  case 10:
    fprintf(R.stderr, S("\nC->S CP_WAR\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  newmask=0x%0X,"), $cast(struct_war_cpacket, packet).newmask);
    }
    break;
  case 11:
    fprintf(R.stderr, S("\nC->S CP_PRACTR\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no args,"));
    }
    break;
  case 12:
    fprintf(R.stderr, S("\nC->S CP_SHIELD\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_shield_cpacket, packet).state);
    }
    break;
  case 13:
    fprintf(R.stderr, S("\nC->S CP_REPAIR\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_repair_cpacket, packet).state);
    }
    break;
  case 14:
    fprintf(R.stderr, S("\nC->S CP_ORBIT\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_orbit_cpacket, packet).state);
    }
    break;
  case 15:
    fprintf(R.stderr, S("\nC->S CP_PLANLOCK\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum = %d,"), $cast(struct_planlock_cpacket, packet).pnum);
    }
    break;
  case 16:
    fprintf(R.stderr, S("\nC->S CP_PLAYLOCK\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  pnum=%d,"), $cast(struct_playlock_cpacket, packet).pnum);
    }
    break;
  case 17:
    fprintf(R.stderr, S("\nC->S CP_BOMB\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_bomb_cpacket, packet).state);
    }
    break;
  case 18:
    fprintf(R.stderr, S("\nC->S CP_BEAM\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_beam_cpacket, packet).state);
    }
    break;
  case 19:
    fprintf(R.stderr, S("\nC->S CP_CLOAK\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_cloak_cpacket, packet).state);
    }
    break;
  case 20:
    fprintf(R.stderr, S("\nC->S CP_DET_TORPS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no args,"));
    }
    break;
  case 21:
    fprintf(R.stderr, S("\nC->S CP_DET_MYTORP\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  tnum=%u,"), ntohs($cast(struct_det_mytorp_cpacket, packet).tnum));
    }
    break;
  case 22:
    fprintf(R.stderr, S("\nC->S CP_COPILOT\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_copilot_cpacket, packet).state);
    }
    break;
  case 23:
    fprintf(R.stderr, S("\nC->S CP_REFIT\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  ship=%d,"), $cast(struct_refit_cpacket, packet).ship);
    }
    break;
  case 24:
    fprintf(R.stderr, S("\nC->S CP_TRACTOR\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d, pnum=%d,"), $cast(struct_tractor_cpacket, packet).state, $cast(struct_tractor_cpacket, packet).pnum);
    }
    break;
  case 25:
    fprintf(R.stderr, S("\nC->S CP_REPRESS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d, pnum=%d,"), $cast(struct_repress_cpacket, packet).state, $cast(struct_repress_cpacket, packet).pnum);
    }
    break;
  case 26:
    fprintf(R.stderr, S("\nC->S CP_COUP\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no args,"));
    }
    break;
  case 27:
    fprintf(R.stderr, S("\nC->S CP_SOCKET\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  version=%d, udp_version=%d\n, socket=%u,"), $cast(struct_socket_cpacket, packet).version, $cast(struct_socket_cpacket, packet).udp_version, ntohl($cast(struct_socket_cpacket, packet).socket));
    }
    break;
  case 28:
    fprintf(R.stderr, S("\nC->S CP_OPTIONS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  flags=0x%0X, keymap=\"%s\","), ntohl($cast(struct_options_cpacket, packet).flags), P($cast(struct_options_cpacket, packet).keymap));
    }
    break;
  case 29:
    fprintf(R.stderr, S("\nC->S CP_BYE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no args,"));
    }
    break;
  case 30:
    fprintf(R.stderr, S("\nC->S CP_DOCKPERM\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  state=%d,"), $cast(struct_dockperm_cpacket, packet).state);
    }
    break;
  case 31:
    fprintf(R.stderr, S("\nC->S CP_UPDATES\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  usecs=%u,"), ntohl($cast(struct_updates_cpacket, packet).usecs));
    }
    break;
  case 32:
    fprintf(R.stderr, S("\nC->S CP_RESETSTATS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  verify=%c,"), $cast(struct_resetstats_cpacket, packet).verify);
    }
    break;
  case 33:
    fprintf(R.stderr, S("\nC->S CP_RESERVED\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  data="));
      for (i = 0; i < 16; ++i) {
        fprintf(R.stderr, S("0x%0X "), $cast(struct_reserved_cpacket, packet).data[i] & 0xff);
      }
      fprintf(R.stderr, S(", resp="));
      for (i = 0; i < 16; ++i) {
        fprintf(R.stderr, S("0x%0X "), $cast(struct_reserved_cpacket, packet).resp[i] & 0xff);
      }
      fprintf(R.stderr, S(","));
    }
    break;
  case 35:
    fprintf(R.stderr, S("\nC->S CP_UDP_REQ\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  request=%d, connmode=%d, port=%d,"), $cast(struct_udp_req_cpacket, packet).request, $cast(struct_udp_req_cpacket, packet).connmode, ntohl($cast(struct_udp_req_cpacket, packet).port >>> 0));
    }
    break;
  case 36:
    fprintf(R.stderr, S("\nC->S CP_SEQUENCE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  sequence=%u,"), ntohs($cast(struct_sequence_cpacket, packet).sequence));
    }
    break;
  case 42:
    fprintf(R.stderr, S("\nC->S CP_PING_RESPONSE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  number=%u, pingme=%d, cp_sent=%d, cp_recv=%d"), $cast(struct_ping_cpacket, packet).number, $cast(struct_ping_cpacket, packet).pingme, ntohl($cast(struct_ping_cpacket, packet).cp_sent >>> 0), ntohl($cast(struct_ping_cpacket, packet).cp_recv >>> 0));
    }
    break;
  case 43:
    fprintf(R.stderr, S("\nC->S CP_S_REQ\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  req=%d, version=%d,"), $cast(struct_shortreq_cpacket, packet).req, $cast(struct_shortreq_cpacket, packet).version);
    }
    break;
  case 44:
    fprintf(R.stderr, S("\nC->S CP_S_THRS\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  thresh=%u,"), ntohs($cast(struct_threshold_cpacket, packet).thresh));
    }
    break;
  case 45:
    fprintf(R.stderr, S("\nC->S CP_S_MESSAGE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  size=%d, group=%d, indiv=%d, mess=\"%s\","), $cast(struct_mesg_cpacket, packet).pad1, $cast(struct_mesg_cpacket, packet).group, $cast(struct_mesg_cpacket, packet).indiv, P($cast(struct_mesg_cpacket, packet).mesg));
    }
    break;
  case 46:
    fprintf(R.stderr, S("\nC->S CP_S_RESERVED\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no struct defined,"));
    }
    break;
  case 47:
    fprintf(R.stderr, S("\nC->S CP_S_DUMMY\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  no struct defined,"));
    }
    break;
  case 60:
    fprintf(R.stderr, S("\nC->S CP_FEATURE\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  feature_type=%c, arg1=%d, arg2=%d, value=%d, name=\"%s\","), $cast(struct_feature_cpacket, packet).feature_type, $cast(struct_feature_cpacket, packet).arg1, $cast(struct_feature_cpacket, packet).arg2, ntohl($cast(struct_feature_cpacket, packet).value >>> 0), P($cast(struct_feature_cpacket, packet).name));
    }
    break;
  default:
    fprintf(R.stderr, S("\nC->S UNKNOWN\t"));
    if (G.log_packets > 1) {
      fprintf(R.stderr, S("  type=%d,"), packet.a[packet.o]);
    }
  }
}

export function strcpyp_return(s1: Ptr | null, s2: Ptr | null, length: number): Ptr | null {
  let $t1: any, $t2: any, $t3: any;
  while (length && s2.a[s2.o]) {
    $wr(($t1 = s1, s1 = $t1.add(1), $t1), 0, $rd(($t2 = s2, s2 = $t2.add(1), $t2)));
    --length;
  }
  if (length > 0) {
    while (length--) {
      $wr(($t3 = s1, s1 = $t3.add(1), $t3), 0, 32);
    }
  }
  return s1;
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
  G.gather_stats = 0;
  G.numofbits = $ta(Uint8Array, 256, [0, 1, 1, 2, 1, 2, 2, 3, 1, 2, 2, 3, 2, 3, 3, 4, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 1, 2, 2, 3, 2, 3, 3, 4, 2, 3, 3, 4, 3, 4, 4, 5, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 2, 3, 3, 4, 3, 4, 4, 5, 3, 4, 4, 5, 4, 5, 5, 6, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 3, 4, 4, 5, 4, 5, 5, 6, 4, 5, 5, 6, 5, 6, 6, 7, 4, 5, 5, 6, 5, 6, 6, 7, 5, 6, 6, 7, 6, 7, 7, 8]);
  vtsize = $ta(Int32Array, 9, [4, 8, 8, 12, 12, 16, 20, 20, 24]);
  G.vtisize = $ta(Int32Array, 9, [4, 7, 9, 11, 13, 16, 18, 20, 22]);
  G.shortversion = SHORTVERSION;
  G.handlers = $sarrOf([struct_packet_handler.$of(),
struct_packet_handler.$of(84, handleMessage),
struct_packet_handler.$of(4, handlePlyrInfo),
struct_packet_handler.$of(8, handleKills),
struct_packet_handler.$of(12, handlePlayer),
struct_packet_handler.$of(8, handleTorpInfo),
struct_packet_handler.$of(12, handleTorp),
struct_packet_handler.$of(16, handlePhaser),
struct_packet_handler.$of(8, handlePlasmaInfo),
struct_packet_handler.$of(12, handlePlasma),
struct_packet_handler.$of(84, handleWarning),
struct_packet_handler.$of(84, handleMotd),
struct_packet_handler.$of(32, handleSelf),
struct_packet_handler.$of(4, handleQueue),
struct_packet_handler.$of(28, handleStatus),
struct_packet_handler.$of(12, handlePlanet),
struct_packet_handler.$of(4, handlePickok),
struct_packet_handler.$of(104, handleLogin),
struct_packet_handler.$of(8, handleFlags),
struct_packet_handler.$of(4, handleMask),
struct_packet_handler.$of(4, handlePStatus),
struct_packet_handler.$of(4, handleBadVersion),
struct_packet_handler.$of(4, handleHostile),
struct_packet_handler.$of(56, handleStats),
struct_packet_handler.$of(52, handlePlyrLogin),
struct_packet_handler.$of(20, handleReserved),
struct_packet_handler.$of(28, handlePlanetLoc),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(8, handleUdpReply),
struct_packet_handler.$of(4, handleSequence),
struct_packet_handler.$of(4, handleSequence),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(32, handleGeneric32),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(60, handleShipCap),
struct_packet_handler.$of(8, handleShortReply),
struct_packet_handler.$of(-1, handleSMessage),
struct_packet_handler.$of(-1, handleSWarning),
struct_packet_handler.$of(12, handleSelfShort),
struct_packet_handler.$of(12, handleSelfShip),
struct_packet_handler.$of(-1, handleVPlayer),
struct_packet_handler.$of(8, handlePing),
struct_packet_handler.$of(-1, handleVTorp),
struct_packet_handler.$of(-1, handleVTorpInfo),
struct_packet_handler.$of(20, handleVTorp),
struct_packet_handler.$of(-1, handleVPlanet),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(0, dummy),
struct_packet_handler.$of(-1, handleVPhaser),
struct_packet_handler.$of(-1, handleVKills),
struct_packet_handler.$of(36, handle_s_Stats),
struct_packet_handler.$of(88, handleFeature),
struct_packet_handler.$of(40, handleRank),
struct_packet_handler.$of(324, handleLtd)]);
  G.sizes = $ta(Int32Array, 61, [0, 84, 4, 4, 4, 4, 4, 4, 52, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 4, 8, 104, 4, 4, 8, 4, 36, 0, 8, 4, 0, 0, 0, 0, 0, 12, 4, 4, -1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 88]);
  G.log_packets = 0;
  G.packet_log = new Int32Array(62);
  G.outpacket_log = new Int32Array(60);
  G.ALL_BYTES = 0;
  G.serverDead = 0;
  G.buf = new Int8Array(1280);
  udpLocalPort = 0;
  udpServerPort = 0;
  serveraddr = 0;
  sequence = 0;
  drop_flag = 0;
  chan = -1;
  fSpeed = 0;
  fDirection = 0;
  fShield = 0;
  fOrbit = 0;
  fRepair = 0;
  fBeamup = 0;
  fBeamdown = 0;
  fCloak = 0;
  fBomb = 0;
  fDockperm = 0;
  fPhaser = 0;
  fPlasma = 0;
  fPlayLock = 0;
  fPlanLock = 0;
  fTractor = 0;
  fRepress = 0;
  Max_CPS = 0;
  Max_CPSout = 0;
  Start_Time = new Float64Array(1);
  Start_Time[0] = 0;
  s2 = 0;
  sumpl = 0;
  numpl = 0;
  outdata_this_sec = 0;
  sout2 = 0;
  sumout = 0;
  vari_sizes = new Int32Array(62);
  cp_msg_size = 0;
  handleSelf$seen = 0;
  handlePlyrInfo$lastship = -1;
  handleGeneric32_b$unsafe = GU_UNSAFE;
  handleGeneric32_b$idling = 0;
  handleGeneric32_b$saved_ups = 0;
  handleSequence$recent_count = 0;
  handleSequence$recent_dropped = 0;
  Log_Packet$lasttime = 0;
  Log_Packet$data_this_sec = 0;
}
