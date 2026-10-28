// @ts-nocheck
// COW 3.3.3 short.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { makedistress } from './distress.ts';
import { dmessage } from './dmessage.ts';
import { rotate_coord, rotate_dir } from './rotate.ts';
import { become, handleMessage, sendServerPacket, sendUdpReq } from './socket.ts';
import { sprefresh } from './spopt.ts';
import { calibrate_stats, redrawStats } from './stats.ts';
import { warning } from './warning.ts';
import { W_SetSensitive } from './x11window.ts';
import { struct_distress, struct_mesg_s_spacket, struct_mesg_spacket, struct_phaser_s_spacket, struct_planet_s_spacket, struct_player_s2_spacket, struct_player_s_spacket, struct_player_spacket, struct_shortreply_spacket, struct_shortreq_cpacket, struct_stats_s_spacket, struct_threshold_cpacket, struct_warning_s_spacket, struct_warning_spacket, struct_youshort_spacket, struct_youss_spacket } from './structs.ts';
import { $cast, $pcast, $rd, $sadd, $ta, $u64, $view8, $wr, G, P, R, S, bzero, fprintf, ntohl, ntohs, printf, sprintf, strcpy, strlen } from '../rt/index.ts';
import { COMM_UPDATE, CP_S_REQ, CP_S_THRS, GWIDTH, MALL, MAXPLANETS, MAXPLASMA, MAXPLAYER, MAXTORP, MBOMB, MDEST, MINDIV, MKILL, MKILLP, MTAKE, MTEAM, MVALID, NUMDETFRAMES, OLDSHORTVERSION, PALIVE, PEXPLODE, PFCLOAK, PFDOCKOK, PFGREEN, PFPRESS, PFRED, PFREE, PFREPAIR, PFSHIELD, PFTRACT, PFYELLOW, PHASER_UPDATE_FUSE, PHFREE, PLREDRAW, POUTFIT, PTFREE, SCALE, SHORTVERSION, SPK_ALL, SPK_KFIELD, SPK_MFIELD, SPK_SALL, SPK_VFIELD, SPK_VON, SPK_WFIELD, SPWINSIDE, SP_MESSAGE, SP_S_8_TORP, STARBASE, TEXPLODE, TFREE, TMOVE, TWINSIDE, rcm } from './consts.ts';

let handleSelfShort$seen: number;
let handleSWarning$arg3: number;
let handleSWarning$arg4: number;
let handleSWarning$karg3: number;
let handleSWarning$karg4: number;
let handleSWarning$karg5: number;

export function sendThreshold(v: number): void {
  let p = new struct_threshold_cpacket();
  p.type = CP_S_THRS;
  p.thresh = v;
  sendServerPacket($cast(struct_player_spacket, p));
}

export function handleVTorp(sbuf: Ptr | null): void {
  sbuf = $view8(sbuf, false);
  let $t1: any, $t2: any;
  let which = null;
  let data = null;
  let bitset = 0;
  let thetorp = null;
  let dx = 0;
  let dy = 0;
  let shiftvar = 0;
  let i = 0;
  let shift = 0;
  if (sbuf.a[sbuf.o] === SP_S_8_TORP) {
    bitset = 255;
    which = sbuf.add(1);
    data = sbuf.add(2);
  } else {
    bitset = sbuf.a[sbuf.o + 1];
    which = sbuf.add(2);
    data = sbuf.add(3);
  }
  G.weaponUpdate = 1;
  thetorp = $sadd(G.torps, which.a[which.o] * 8);
  for (shift = 0, i = 0; i < 8; ++i, thetorp = $sadd(thetorp, 1), bitset = bitset >> 1 & 0xff) {
    thetorp.t_updateFuse = (2 > (6 * G.server_ups / 5 | 0) ? 2 : 6 * G.server_ups / 5 | 0) & 0xff;
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
      if (thetorp.t_status === TFREE) {
        thetorp.t_status = TMOVE;
        ($t1 = $sadd(G.players, thetorp.t_owner), $t1.p_ntorp = $t1.p_ntorp + 1 << 16 >> 16);
      } else if (thetorp.t_owner === G.me.p_no && thetorp.t_status === TEXPLODE) {
        thetorp.t_status = TMOVE;
      }
      if (dx > SPWINSIDE || dy > SPWINSIDE) {
        thetorp.t_x = -100000;
        thetorp.t_y = -100000;
      } else {
        thetorp.t_x = G.my_x + Math.imul(dx - (SPWINSIDE / 2 | 0), SCALE);
        thetorp.t_y = G.my_y + Math.imul(dy - (SPWINSIDE / 2 | 0), SCALE);
        if (G.rotate) {
          rotate_coord(P(thetorp, "t_x"), P(thetorp, "t_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
        }
      }
    } else {
      if (thetorp.t_status && thetorp.t_status !== TEXPLODE) {
        ($t2 = $sadd(G.players, thetorp.t_owner), $t2.p_ntorp = $t2.p_ntorp - 1 << 16 >> 16);
        thetorp.t_status = TFREE;
      }
    }
  }
}

export function handleSelfShort(packet: struct_youshort_spacket | null): void {
  packet = $cast(struct_youshort_spacket, packet);
  let pl = null;
  pl = $sadd(G.players, packet.pnum);
  if (handleSelfShort$seen && packet.pnum !== G.me.p_no) {
    become(pl);
  }
  ++handleSelfShort$seen;
  if (!G.F_many_self) {
    G.me = G.ghoststart ? $sadd(G.players, G.ghost_pno) : pl;
    G.myship = G.me.p_ship;
    G.mystats = G.me.p_stats;
  }
  pl.p_hostile = packet.hostile;
  pl.p_swar = packet.swar;
  pl.p_armies = packet.armies;
  pl.p_flags = ntohl(packet.flags);
  pl.p_whydead = packet.whydead;
  pl.p_whodead = packet.whodead;
}

export function handleSelfShip(packet: struct_youss_spacket | null): void {
  packet = $cast(struct_youss_spacket, packet);
  let pl = null;
  if (G.F_many_self) {
    pl = $sadd(G.players, packet.pad1);
  } else {
    if (!G.me) {
      return;
    }
    pl = G.me;
    if (G.F_self_8flags) {
      G.me.p_flags = ((G.me.p_flags & 4294967040) >>> 0 | packet.pad1 & 0xff) >>> 0;
    } else if (G.F_self_8flags2) {
      let new_flags = (G.me.p_flags & 4282370028) >>> 0;
      new_flags = (new_flags | (packet.pad1 & PFSHIELD | packet.pad1 & PFREPAIR | (packet.pad1 & PFCLOAK >> 2) << 2 | (packet.pad1 & PFGREEN >> 7) << 7 | (packet.pad1 & PFYELLOW >> 7) << 7 | (packet.pad1 & PFRED >> 7) << 7 | (packet.pad1 & PFTRACT >> 15) << 15 | (packet.pad1 & PFPRESS >> 15) << 15) >>> 0) >>> 0;
      G.me.p_flags = new_flags;
    }
  }
  pl.p_damage = ntohs(packet.damage);
  pl.p_shield = ntohs(packet.shield);
  pl.p_fuel = ntohs(packet.fuel);
  pl.p_etemp = ntohs(packet.etemp);
  pl.p_wtemp = ntohs(packet.wtemp);
}

export function handleVPlayer(sbuf: Ptr | null): void {
  sbuf = $view8(sbuf, false);
  let $t1: any, $t2: any, $t3: any, $t4: any, $t5: any, $t6: any;
  let x = 0;
  let y = 0;
  let i = 0;
  let numofplayers = 0;
  let pl_no = 0;
  let save = 0;
  let pl = null;
  numofplayers = sbuf.a[sbuf.o + 1] & 63;
  if (sbuf.a[sbuf.o + 1] & 128) {
    sbuf = sbuf.add(4);
    for (i = 0; i < numofplayers; ++i) {
      pl_no = (sbuf.a[sbuf.o] & 31) + 32;
      if (pl_no >= MAXPLAYER) {
        continue;
      }
      save = sbuf.a[sbuf.o];
      sbuf = sbuf.add(1);
      pl = $sadd(G.players, pl_no);
      pl.p_speed = sbuf.a[sbuf.o] & 15;
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
      G.Pdir[pl_no] = sbuf.a[sbuf.o] >> 4 & 0xff;
      pl.p_dir = G.Pdir[pl_no] * 16 & 0xff;
      sbuf = sbuf.add(1);
      x = $rd(($t1 = sbuf, sbuf = $t1.add(1), $t1));
      y = $rd(($t2 = sbuf, sbuf = $t2.add(1), $t2));
      if (save & 0xff & 64) {
        x |= 256;
      }
      if (save & 0xff & 128) {
        y |= 256;
      }
      if (save & 32) {
        if (x === 501 || y === 501) {
          G.Pgx[pl_no] = -500;
          G.Pgy[pl_no] = -500;
        } else {
          G.Pgx[pl_no] = x;
          G.Pgy[pl_no] = y;
        }
        G.Plx[pl_no] = -1;
        G.Ply[pl_no] = -1;
        G.redrawPlayer[pl.p_no] = 1;
        pl.p_x = Math.imul(G.Pgx[pl_no], GWIDTH) / SPWINSIDE | 0;
        pl.p_y = Math.imul(G.Pgy[pl_no], GWIDTH) / SPWINSIDE | 0;
        if (G.rotate) {
          rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(pl, "p_dir"), G.rotate_deg);
        }
      } else {
        G.Plx[pl_no] = x;
        G.Ply[pl_no] = y;
        G.redrawPlayer[pl.p_no] = 1;
        pl.p_x = G.me.p_x + Math.imul(G.Plx[pl_no] - (SPWINSIDE / 2 | 0), SCALE);
        pl.p_y = G.me.p_y + Math.imul(G.Ply[pl_no] - (SPWINSIDE / 2 | 0), SCALE);
        G.Pgx[pl_no] = Math.imul(pl.p_x, SPWINSIDE) / GWIDTH | 0;
        G.Pgy[pl_no] = Math.imul(pl.p_y, SPWINSIDE) / GWIDTH | 0;
        pl.p_x = G.my_x + Math.imul(x - (SPWINSIDE / 2 | 0), SCALE);
        pl.p_y = G.my_y + Math.imul(y - (SPWINSIDE / 2 | 0), SCALE);
        if (G.rotate) {
          rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(pl, "p_dir"), G.rotate_deg);
        }
      }
    }
  } else if (sbuf.a[sbuf.o + 1] & 64) {
    if (G.shortversion === SHORTVERSION) {
      if (sbuf.a[sbuf.o + 2] === 2) {
        let tmp = $pcast(sbuf.add(4), 4, true, false);
        new_flags(ntohl(tmp.a[tmp.o] >>> 0), sbuf.a[sbuf.o + 3]);
        tmp = tmp.add(1);
        new_flags(ntohl(tmp.a[tmp.o] >>> 0), 0);
        sbuf = sbuf.add(8);
      } else if (sbuf.a[sbuf.o + 2] === 1) {
        let tmp = $pcast(sbuf.add(4), 4, true, false);
        new_flags(ntohl(tmp.a[tmp.o] >>> 0), sbuf.a[sbuf.o + 3]);
        sbuf = sbuf.add(4);
      }
    }
    sbuf = sbuf.add(4);
    for (i = 0; i < numofplayers; ++i) {
      pl_no = sbuf.a[sbuf.o] & 31;
      if (pl_no >= MAXPLAYER) {
        continue;
      }
      save = sbuf.a[sbuf.o];
      sbuf = sbuf.add(1);
      pl = $sadd(G.players, pl_no);
      pl.p_speed = sbuf.a[sbuf.o] & 15;
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
      G.Pdir[pl_no] = sbuf.a[sbuf.o] >> 4 & 0xff;
      pl.p_dir = G.Pdir[pl_no] * 16 & 0xff;
      sbuf = sbuf.add(1);
      x = $rd(($t3 = sbuf, sbuf = $t3.add(1), $t3));
      y = $rd(($t4 = sbuf, sbuf = $t4.add(1), $t4));
      if (save & 0xff & 64) {
        x |= 256;
      }
      if (save & 0xff & 128) {
        y |= 256;
      }
      if (save & 32) {
        if (x === 501 || y === 501) {
          G.Pgx[pl_no] = -500;
          G.Pgy[pl_no] = -500;
        } else {
          G.Pgx[pl_no] = x;
          G.Pgy[pl_no] = y;
        }
        G.Plx[pl_no] = -1;
        G.Ply[pl_no] = -1;
        G.redrawPlayer[pl.p_no] = 1;
        pl.p_x = Math.imul(G.Pgx[pl_no], GWIDTH) / SPWINSIDE | 0;
        pl.p_y = Math.imul(G.Pgy[pl_no], GWIDTH) / SPWINSIDE | 0;
        if (G.rotate) {
          rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(pl, "p_dir"), G.rotate_deg);
        }
      } else {
        G.Plx[pl_no] = x;
        G.Ply[pl_no] = y;
        G.redrawPlayer[pl.p_no] = 1;
        pl.p_x = G.me.p_x + Math.imul(G.Plx[pl_no] - (SPWINSIDE / 2 | 0), SCALE);
        pl.p_y = G.me.p_y + Math.imul(G.Ply[pl_no] - (SPWINSIDE / 2 | 0), SCALE);
        G.Pgx[pl_no] = Math.imul(pl.p_x, SPWINSIDE) / GWIDTH | 0;
        G.Pgy[pl_no] = Math.imul(pl.p_y, SPWINSIDE) / GWIDTH | 0;
        pl.p_x = G.my_x + Math.imul(x - (SPWINSIDE / 2 | 0), SCALE);
        pl.p_y = G.my_y + Math.imul(y - (SPWINSIDE / 2 | 0), SCALE);
        if (G.rotate) {
          rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(pl, "p_dir"), G.rotate_deg);
        }
      }
    }
  } else {
    let packet = $cast(struct_player_s_spacket, sbuf);
    pl = $sadd(G.players, G.me.p_no);
    pl.p_dir = packet.dir;
    G.Pdir[G.me.p_no] = (((pl.p_dir + 8) / 16 | 0) & 15) & 0xff;
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
    if (G.shortversion === SHORTVERSION) {
      let pa2 = $cast(struct_player_s2_spacket, sbuf);
      x = Math.imul(SCALE, ntohs(pa2.x & 0xffff) << 16 >> 16);
      y = Math.imul(SCALE, ntohs(pa2.y & 0xffff) << 16 >> 16);
      new_flags(ntohl(pa2.flags), 0);
    } else {
      x = ntohl(packet.x >>> 0) | 0;
      y = ntohl(packet.y >>> 0) | 0;
    }
    pl.p_x = G.my_x = x;
    pl.p_y = G.my_y = y;
    G.Plx[G.me.p_no] = TWINSIDE / 2 | 0;
    G.Ply[G.me.p_no] = TWINSIDE / 2 | 0;
    G.Pgx[G.me.p_no] = Math.imul(pl.p_x, G.small_screen ? 400 : 500) / GWIDTH | 0;
    G.Pgy[G.me.p_no] = Math.imul(pl.p_y, G.small_screen ? 400 : 500) / GWIDTH | 0;
    G.redrawPlayer[G.me.p_no] = 1;
    if (G.rotate) {
      rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
      rotate_dir(P(pl, "p_dir"), G.rotate_deg);
    }
    if (sbuf.a[sbuf.o + 1] === 0) {
      return;
    }
    sbuf = sbuf.add(12);
    for (i = 0; i < numofplayers; ++i) {
      pl_no = sbuf.a[sbuf.o] & 31;
      if (pl_no >= MAXPLAYER) {
        continue;
      }
      save = sbuf.a[sbuf.o];
      sbuf = sbuf.add(1);
      pl = $sadd(G.players, pl_no);
      pl.p_speed = sbuf.a[sbuf.o] & 15;
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
      G.Pdir[pl_no] = sbuf.a[sbuf.o] >> 4 & 0xff;
      pl.p_dir = G.Pdir[pl_no] * 16 & 0xff;
      sbuf = sbuf.add(1);
      x = $rd(($t5 = sbuf, sbuf = $t5.add(1), $t5));
      y = $rd(($t6 = sbuf, sbuf = $t6.add(1), $t6));
      if (save & 0xff & 64) {
        x |= 256;
      }
      if (save & 0xff & 128) {
        y |= 256;
      }
      if (save & 32) {
        if (x === 501 || y === 501) {
          G.Pgx[pl_no] = -500;
          G.Pgy[pl_no] = -500;
        } else {
          G.Pgx[pl_no] = x;
          G.Pgy[pl_no] = y;
        }
        G.Plx[pl_no] = -1;
        G.Ply[pl_no] = -1;
        G.redrawPlayer[pl.p_no] = 1;
        pl.p_x = Math.imul(G.Pgx[pl_no], GWIDTH) / SPWINSIDE | 0;
        pl.p_y = Math.imul(G.Pgy[pl_no], GWIDTH) / SPWINSIDE | 0;
        if (G.rotate) {
          rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(pl, "p_dir"), G.rotate_deg);
        }
      } else {
        G.Plx[pl_no] = x;
        G.Ply[pl_no] = y;
        G.redrawPlayer[pl.p_no] = 1;
        pl.p_x = G.me.p_x + Math.imul(G.Plx[pl_no] - (SPWINSIDE / 2 | 0), SCALE);
        pl.p_y = G.me.p_y + Math.imul(G.Ply[pl_no] - (SPWINSIDE / 2 | 0), SCALE);
        G.Pgx[pl_no] = Math.imul(pl.p_x, SPWINSIDE) / GWIDTH | 0;
        G.Pgy[pl_no] = Math.imul(pl.p_y, SPWINSIDE) / GWIDTH | 0;
        pl.p_x = G.my_x + Math.imul(x - (SPWINSIDE / 2 | 0), SCALE);
        pl.p_y = G.my_y + Math.imul(y - (SPWINSIDE / 2 | 0), SCALE);
        if (G.rotate) {
          rotate_coord(P(pl, "p_x"), P(pl, "p_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
          rotate_dir(P(pl, "p_dir"), G.rotate_deg);
        }
      }
    }
  }
}

export function handleSMessage(packet: struct_mesg_s_spacket | null): void {
  packet = $cast(struct_mesg_s_spacket, packet);
  let buf = new Int8Array(100);
  let addrbuf = new Int8Array(9);
  if (G.debug) {
    printf(S("Length of Message is: %zd  total Size %d \n"), strlen(P(packet, "mesg")), packet.length);
  }
  if (packet.m_from >= MAXPLAYER) {
    packet.m_from = 255;
  }
  if (packet.m_from === 255) {
    strcpy(P(addrbuf), S("GOD->"));
  } else {
    sprintf(P(addrbuf), S(" %c%c->"), G.teamlet[$sadd(G.players, packet.m_from).p_team], G.shipnos.a[G.shipnos.o + $sadd(G.players, packet.m_from).p_no]);
  }
  switch (packet.m_flags & (MTEAM | MINDIV | MALL)) {
  case 8:
    sprintf(P(addrbuf).add(5), S("ALL"));
    break;
  case 4:
    sprintf(P(addrbuf).add(5), S("%s"), G.teamshort[G.me.p_team]);
    break;
  case 2:
    sprintf(P(addrbuf).add(5), S("%c%c "), G.teamlet[$sadd(G.players, packet.m_recpt).p_team], G.shipnos.a[G.shipnos.o + packet.m_recpt]);
    break;
  default:
    sprintf(P(addrbuf).add(5), S("ALL"));
    break;
  }
  sprintf(P(buf), S("%-9s%s"), P(addrbuf), P(packet, "mesg"));
  dmessage(P(buf), packet.m_flags, packet.m_from, packet.m_recpt);
}

export async function handleShortReply(packet: struct_shortreply_spacket | null): Promise<void> {
  packet = $cast(struct_shortreply_spacket, packet);
  switch (packet.repl) {
  case 0:
    if (G.shortversion === SHORTVERSION && G.recv_short === 0) {
      printf(S("Using Short Packet Version 1.\n"));
      G.shortversion = OLDSHORTVERSION;
      sendShortReq(SPK_VON);
    } else {
      G.recv_short = 0;
      sprefresh(SPK_VFIELD);
      await sendUdpReq(COMM_UPDATE);
    }
    break;
  case 1:
    G.recv_short = 1;
    sprefresh(SPK_VFIELD);
    G.spwinside = ntohs(packet.winside);
    G.spgwidth = ntohl(packet.gwidth >>> 0) | 0;
    sendShortReq(SPK_SALL);
    break;
  case 2:
    G.recv_mesg = 0;
    sprefresh(SPK_MFIELD);
    W_SetSensitive(G.reviewWin, 0);
    break;
  case 3:
    G.recv_mesg = 1;
    sprefresh(SPK_MFIELD);
    W_SetSensitive(G.reviewWin, 1);
    break;
  case 4:
    G.recv_kmesg = 1;
    sprefresh(SPK_KFIELD);
    break;
  case 5:
    G.recv_kmesg = 0;
    sprefresh(SPK_KFIELD);
    break;
  case 7:
    G.recv_warn = 1;
    sprefresh(SPK_WFIELD);
    break;
  case 8:
    G.recv_warn = 0;
    sprefresh(SPK_WFIELD);
    break;
  case 6:
    break;
  default:
    fprintf(R.stderr, S("%s: unknown response packet value short-req: %d\n"), S("netrek"), packet.repl);
  }
}

export function handleVTorpInfo(sbuf: Ptr | null): void {
  sbuf = $view8(sbuf, false);
  let $t1: any, $t2: any, $t3: any, $t4: any;
  let bitset = null;
  let which = null;
  let data = null;
  let infobitset = null;
  let infodata = null;
  let thetorp = null;
  let dx = 0;
  let dy = 0;
  let shiftvar = 0;
  let status = 0;
  let war = 0;
  let i = 0;
  let shift = 0;
  bitset = sbuf.add(1);
  which = sbuf.add(2);
  infobitset = sbuf.add(3);
  data = sbuf.add(4);
  infodata = sbuf.add(G.vtisize[G.numofbits[sbuf.a[sbuf.o + 1]]]);
  G.weaponUpdate = 1;
  thetorp = $sadd(G.torps, which.a[which.o] * 8);
  for (shift = 0, i = 0; i < 8; thetorp = $sadd(thetorp, 1), bitset.a[bitset.o] = bitset.a[bitset.o] >> 1 & 0xff, infobitset.a[infobitset.o] = infobitset.a[infobitset.o] >> 1 & 0xff, ++i) {
    thetorp.t_updateFuse = (2 > (6 * G.server_ups / 5 | 0) ? 2 : 6 * G.server_ups / 5 | 0) & 0xff;
    if (bitset.a[bitset.o] & 1) {
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
      if (!(infobitset.a[infobitset.o] & 1)) {
        if (thetorp.t_status === TFREE) {
          thetorp.t_status = TMOVE;
          ($t1 = $sadd(G.players, thetorp.t_owner), $t1.p_ntorp = $t1.p_ntorp + 1 << 16 >> 16);
        } else if (thetorp.t_owner === G.me.p_no && thetorp.t_status === TEXPLODE) {
          thetorp.t_status = TMOVE;
        }
      }
      if (dx > SPWINSIDE || dy > SPWINSIDE) {
        thetorp.t_x = -100000;
        thetorp.t_y = -100000;
      } else {
        thetorp.t_x = G.my_x + Math.imul(dx - (SPWINSIDE / 2 | 0), SCALE);
        thetorp.t_y = G.my_y + Math.imul(dy - (SPWINSIDE / 2 | 0), SCALE);
        if (G.rotate) {
          rotate_coord(P(thetorp, "t_x"), P(thetorp, "t_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
        }
      }
    } else {
      if (!(infobitset.a[infobitset.o] & 1)) {
        if (thetorp.t_status && thetorp.t_status !== TEXPLODE) {
          ($t2 = $sadd(G.players, thetorp.t_owner), $t2.p_ntorp = $t2.p_ntorp - 1 << 16 >> 16);
          thetorp.t_status = TFREE;
        }
      }
    }
    if (infobitset.a[infobitset.o] & 1) {
      war = (infodata.a[infodata.o] & 15) << 24 >> 24;
      status = ((infodata.a[infodata.o] & 240) >> 4) << 24 >> 24;
      infodata = infodata.add(1);
      if (status === TEXPLODE && thetorp.t_status === TFREE) {
        continue;
      }
      if (thetorp.t_status === TFREE && status) {
        ($t3 = $sadd(G.players, thetorp.t_owner), $t3.p_ntorp = $t3.p_ntorp + 1 << 16 >> 16);
      }
      if (thetorp.t_status && status === TFREE) {
        ($t4 = $sadd(G.players, thetorp.t_owner), $t4.p_ntorp = $t4.p_ntorp - 1 << 16 >> 16);
      }
      thetorp.t_war = war;
      if (status !== thetorp.t_status) {
        thetorp.t_status = status & 0xff;
        if (thetorp.t_status === TEXPLODE) {
          thetorp.t_fuse = (Math.imul(NUMDETFRAMES, G.server_ups) / 5 | 0) << 16 >> 16;
        }
      }
    }
  }
}

export function handleVPlanet(sbuf: Ptr | null): void {
  sbuf = $view8(sbuf, false);
  let i = 0;
  let numofplanets = 0;
  let plan = null;
  let packet = $cast(struct_planet_s_spacket, sbuf.add(2));
  numofplanets = sbuf.a[sbuf.o + 1];
  if (numofplanets > MAXPLANETS + 1) {
    return;
  }
  for (i = 0; i < numofplanets; ++i, packet = $sadd(packet, 1)) {
    if (packet.pnum >= MAXPLANETS) {
      continue;
    }
    plan = $sadd(G.planets, (packet.pnum & 0xff));
    plan.pl_owner = packet.owner;
    plan.pl_info = packet.info;
    plan.pl_flags = ntohs(packet.flags) | PLREDRAW;
    plan.pl_armies = packet.armies;
    if (G.gather_stats) {
      fprintf(R.stderr, S("\nSTATS_SP_S_PLANET:\t"));
      fprintf(R.stderr, S("%d\t%d\t%d\t%d\t%d"), packet.pnum, packet.owner, packet.info, packet.armies, ntohs(packet.flags));
    }
  }
}

export function resetWeaponInfo(): void {
  let i = 0;
  for (i = 0; i < Math.imul(MAXPLAYER, MAXTORP); ++i) {
    $sadd(G.torps, i).t_status = TFREE;
  }
  for (i = 0; i < Math.imul(MAXPLAYER, MAXPLASMA); ++i) {
    $sadd(G.plasmatorps, i).pt_status = PTFREE;
  }
  for (i = 0; i < MAXPLAYER; ++i) {
    $sadd(G.players, i).p_ntorp = 0;
    $sadd(G.players, i).p_nplasmatorp = 0;
    $sadd(G.phasers, i).ph_status = PHFREE;
  }
}

export function sendShortReq(state: number): void {
  let shortReq = new struct_shortreq_cpacket();
  bzero(shortReq, 4);
  shortReq.type = CP_S_REQ;
  shortReq.req = state;
  shortReq.version = G.shortversion << 24 >> 24;
  switch (state) {
  case 1:
    warning(S("Sending short packet request"));
    break;
  case 0:
    warning(S("Sending old packet request"));
    break;
  default:
    break;
  }
  if ((state === SPK_SALL || state === SPK_ALL) && G.recv_short) {
    resetWeaponInfo();
    if (state === SPK_SALL) {
      warning(S("Sent request for small update (weapons+planets+kills)"));
    } else if (state === SPK_ALL) {
      warning(S("Sent request for medium update (all except stats)"));
    } else {
      warning(S("Sent some unknown request..."));
    }
  }
  sendServerPacket(shortReq);
}

export function handleSWarning(packet: struct_warning_s_spacket | null): void {
  packet = $cast(struct_warning_s_spacket, packet);
  let buf = new Int8Array(80);
  let target = null;
  let damage = 0;
  let dist = new struct_distress();
  switch (packet.whichmessage) {
  case 0:
    damage = packet.argument & 0xff;
    damage |= (packet.argument2 & 0xff) << 8;
    if (damage === 38) {
      ++G.phaserStatTry;
      ++G.phaserStatHit;
    }
    if (damage === 37) {
      ++G.phaserStatTry;
    }
    if (damage === 37 && G.phaserShowStats) {
      let phstatmsg = new Int8Array(30);
      sprintf(P(phstatmsg), S("%s [%d%%]"), G.w_texts[damage], G.phaserStatTry ? G.phaserStatHit * 100 / G.phaserStatTry | 0 : 0);
      warning(P(phstatmsg));
    } else if (damage >= 0 && $u64(damage) < Math.trunc(832 / 8)) {
      warning(G.w_texts[damage]);
    }
    break;
  case 1:
    target = $sadd(G.players, (packet.argument & 0xff & 63));
    damage = packet.argument2 & 0xff;
    if (packet.argument & 0xff & 64) {
      damage |= 256;
    }
    if (packet.argument & 0xff & 128) {
      damage |= 512;
    }
    ++G.phaserStatTry;
    ++G.phaserStatHit;
    sprintf(P(buf), S("Phaser burst hit %s for %d points"), P(target.p_name), damage);
    warning(P(buf));
    break;
  case 2:
    sprintf(P(buf), S("Weapons Officer: Bombing is ineffective.  Only %d armies are defending."), packet.argument);
    warning(P(buf));
    break;
  case 3:
    sprintf(P(buf), S("Weapons Officer: Bombarding %s...  Sensors read %d armies left."), P($sadd(G.planets, (packet.argument & 0xff)).pl_name), packet.argument2 & 0xff);
    warning(P(buf));
    break;
  case 4:
    sprintf(P(buf), S("%s: Too few armies to beam up"), P($sadd(G.planets, (packet.argument & 0xff)).pl_name));
    warning(P(buf));
    break;
  case 5:
    sprintf(P(buf), S("Beaming up. (%d/%d)"), packet.argument & 0xff, packet.argument2 & 0xff);
    warning(P(buf));
    break;
  case 6:
    sprintf(P(buf), S("Starbase %s: Too few armies to beam up"), P($sadd(G.players, (packet.argument & 0xff)).p_name));
    warning(P(buf));
    break;
  case 7:
    sprintf(P(buf), S("No more armies to beam down to Starbase %s."), P($sadd(G.players, (packet.argument & 0xff)).p_name));
    warning(P(buf));
    break;
  case 8:
    sprintf(P(buf), S("No more armies to beam down to %s."), P($sadd(G.planets, (packet.argument & 0xff)).pl_name));
    warning(P(buf));
    break;
  case 9:
    sprintf(P(buf), S("Transporter Room:  Starbase %s reports all troop bunkers are full!"), P($sadd(G.players, (packet.argument & 0xff)).p_name));
    warning(P(buf));
    break;
  case 10:
    if ($u64(packet.argument) < Math.trunc(32 / 8)) {
      sprintf(P(buf), G.vari_texts[packet.argument & 0xff], packet.argument2 & 0xff);
      warning(P(buf));
    }
    break;
  case 11:
    sprintf(P(buf), S("Beaming down.  (%d/%d) %s has %d armies left"), handleSWarning$arg3, handleSWarning$arg4, P($sadd(G.planets, (packet.argument & 0xff)).pl_name), packet.argument2);
    warning(P(buf));
    break;
  case 12:
    handleSWarning$arg3 = packet.argument & 0xff;
    handleSWarning$arg4 = packet.argument2 & 0xff;
    break;
  case 13:
    sprintf(P(buf), S("Transferring units.  (%d/%d) Starbase %s has %d armies left"), handleSWarning$arg3 & 0xff, handleSWarning$arg4 & 0xff, P($sadd(G.players, (packet.argument & 0xff)).p_name), packet.argument2 & 0xff);
    warning(P(buf));
    break;
  case 14:
    sprintf(P(buf), S("Locking onto %s"), P($sadd(G.planets, (packet.argument & 0xff)).pl_name));
    warning(P(buf));
    break;
  case 16:
    sprintf(P(buf), S("You need a rank of %s or higher to command a starbase!"), $sadd(G.ranks, (packet.argument & 0xff)).name);
    warning(P(buf));
    break;
  case 17:
    sprintf(P(buf), S("Starbase %s refusing us docking permission captain."), P($sadd(G.players, (packet.argument & 0xff)).p_name));
    warning(P(buf));
    break;
  case 18:
    sprintf(P(buf), S("Starbase %s: Permission to dock denied, all bays occupied."), P($sadd(G.players, (packet.argument & 0xff)).p_name));
    warning(P(buf));
    break;
  case 19:
    sprintf(P(buf), S("Locking onto %s (%c%c)"), P($sadd(G.players, (packet.argument & 0xff)).p_name), G.teamlet[$sadd(G.players, (packet.argument & 0xff)).p_team], G.shipnos.a[G.shipnos.o + $sadd(G.players, (packet.argument & 0xff)).p_no]);
    warning(P(buf));
    break;
  case 20:
    sprintf(P(buf), S("Locking onto %s (%c%c) (docking is %s)"), P($sadd(G.players, (packet.argument & 0xff)).p_name), G.teamlet[$sadd(G.players, (packet.argument & 0xff)).p_team], G.shipnos.a[G.shipnos.o + $sadd(G.players, (packet.argument & 0xff)).p_no], ($sadd(G.players, (packet.argument & 0xff)).p_flags & PFDOCKOK) >>> 0 ? S("enabled") : S("disabled"));
    warning(P(buf));
    break;
  case 21:
  case 29:
    {
      let msg = new struct_mesg_spacket();
      let killer = 0;
      let victim = 0;
      let armies = 0;
      victim = (packet.argument & 0xff & 63) & 0xff;
      killer = (packet.argument2 & 0xff & 63) & 0xff;
      damage = handleSWarning$karg3 & 0xff;
      damage |= (handleSWarning$karg4 & 127) << 8;
      armies = ((packet.argument & 0xff) >> 6 | (packet.argument2 & 0xff & 192) >> 4) & 0xff;
      if (handleSWarning$karg4 & 128) {
        armies = (armies | 16) & 0xff;
      }
      dist.distype = rcm;
      dist.sender = victim;
      dist.tclose_j = killer;
      dist.arms = armies;
      dist.dam = (damage / 100 | 0) & 0xff;
      dist.shld = damage % 100 & 0xff;
      dist.wtmp = handleSWarning$karg5 & 0xff;
      makedistress(dist, P(msg.mesg), G.rcm_msg[1].macro);
      msg.m_flags = MALL | MVALID | MKILL;
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_recpt = 0;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 22:
    handleSWarning$karg3 = packet.argument & 0xff;
    handleSWarning$karg4 = packet.argument2 & 0xff;
    break;
  case 35:
    handleSWarning$karg5 = packet.argument & 0xff;
    break;
  case 23:
  case 28:
    {
      let msg = new struct_mesg_spacket();
      dist.distype = rcm;
      dist.sender = packet.argument & 0xff;
      dist.tclose_j = packet.argument & 0xff;
      dist.arms = 0;
      dist.dam = 0;
      dist.shld = 0;
      dist.tclose_pl = packet.argument2 & 0xff;
      dist.wtmp = handleSWarning$karg5 & 0xff;
      makedistress(dist, P(msg.mesg), G.rcm_msg[2].macro);
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_flags = MALL | MVALID | MKILLP;
      msg.m_recpt = 0;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 24:
    {
      let msg = new struct_mesg_spacket();
      dist.distype = rcm;
      dist.sender = packet.argument & 0xff;
      dist.tclose_j = packet.argument & 0xff;
      dist.arms = 0;
      dist.dam = handleSWarning$arg3 & 0xff;
      dist.shld = 0;
      dist.tclose_pl = packet.argument2 & 0xff;
      dist.wtmp = handleSWarning$karg5 & 0xff;
      makedistress(dist, P(msg.mesg), G.rcm_msg[3].macro);
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_flags = MTEAM | MBOMB | MVALID;
      msg.m_recpt = $sadd(G.planets, (packet.argument2 & 0xff)).pl_owner & 0xff;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 25:
    {
      let msg = new struct_mesg_spacket();
      dist.distype = rcm;
      dist.sender = packet.argument2 & 0xff;
      dist.tclose_j = packet.argument2 & 0xff;
      dist.arms = 0;
      dist.dam = 0;
      dist.shld = 0;
      dist.tclose_pl = packet.argument & 0xff;
      dist.wtmp = handleSWarning$karg5 & 0xff;
      makedistress(dist, P(msg.mesg), G.rcm_msg[4].macro);
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_flags = MTEAM | MDEST | MVALID;
      msg.m_recpt = $sadd(G.planets, (packet.argument & 0xff)).pl_owner & 0xff;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 26:
    {
      let msg = new struct_mesg_spacket();
      dist.distype = rcm;
      dist.sender = packet.argument2 & 0xff;
      dist.tclose_j = packet.argument2 & 0xff;
      dist.arms = 0;
      dist.dam = 0;
      dist.shld = 0;
      dist.tclose_pl = packet.argument & 0xff;
      dist.wtmp = handleSWarning$karg5 & 0xff;
      makedistress(dist, P(msg.mesg), G.rcm_msg[5].macro);
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_flags = MTEAM | MTAKE | MVALID;
      msg.m_recpt = $sadd(G.players, (packet.argument2 & 0xff)).p_team & 0xff;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 27:
    {
      let msg = new struct_mesg_spacket();
      let damage = 0;
      damage = handleSWarning$karg3 & 0xff;
      damage = (damage | ((handleSWarning$karg4 & 255) & 0xff) << 8) & 0xffff;
      dist.distype = rcm;
      dist.sender = packet.argument & 0xff;
      dist.tclose_j = packet.argument & 0xff;
      dist.arms = 0;
      dist.dam = (damage / 100 | 0) & 0xff;
      dist.shld = damage % 100 & 0xff;
      dist.wtmp = handleSWarning$karg5 & 0xff;
      makedistress(dist, P(msg.mesg), G.rcm_msg[6].macro);
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_flags = MALL | MVALID;
      msg.m_recpt = 0;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 30:
    {
      let msg = new struct_mesg_spacket();
      sprintf(P(msg.mesg), S(" Game will resume in %d seconds"), packet.argument & 0xff);
      msg.m_flags = MALL | MVALID;
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_recpt = 0;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 31:
    if ((packet.argument & 0xff) < Math.trunc(48 / 8)) {
      let msg = new struct_mesg_spacket();
      strcpy(P(msg.mesg), G.daemon_texts[packet.argument & 0xff]);
      msg.m_flags = MALL | MVALID;
      msg.type = SP_MESSAGE;
      msg.mesg[79] = 0;
      msg.m_recpt = 0;
      msg.m_from = 255;
      handleMessage(msg);
    }
    break;
  case 32:
    warning(G.s_texte[packet.argument & 0xff]);
    break;
  case 33:
    {
      let warn = $cast(struct_warning_spacket, packet);
      warning(P(warn.mesg));
    }
    break;
  case 34:
    {
      let warn = $cast(struct_warning_spacket, packet);
      warning(P(warn.mesg));
      G.s_texte[warn.pad2 & 0xff] = P(new Int8Array($u64(warn.pad3 - 4)));
      if (!G.s_texte[warn.pad2 & 0xff]) {
        G.s_texte[warn.pad2 & 0xff] = P(G.no_memory);
        warning(S("Could not add warning! (No memory!)"));
      } else {
        strcpy(G.s_texte[warn.pad2 & 0xff], P(warn.mesg));
      }
    }
    break;
  default:
    warning(S("Unknown Short Warning!"));
    break;
  }
}

export function add_whydead(s: Ptr | null, m: number): void {
  let b = new Int8Array(256);
  if ($u64(m) < Math.trunc(176 / 8)) {
    sprintf(P(b), S("%-50s %s"), s, G.whydeadmess[m]);
    b[79] = 0;
    strcpy(s, P(b));
  }
}

export function handleVKills(sbuf: Ptr | null): void {
  sbuf = $view8(sbuf, false);
  let $t1: any, $t2: any;
  let i = 0;
  let numofkills = 0;
  let pnum = 0;
  let pkills = 0;
  let data = sbuf.add(2);
  numofkills = sbuf.a[sbuf.o + 1];
  for (i = 0; i < numofkills; ++i) {
    pkills = $rd(($t1 = data, data = $t1.add(1), $t1));
    pkills = (pkills | (data.a[data.o] & 3) << 8 & 0xffff) & 0xffff;
    pnum = $rd(($t2 = data, data = $t2.add(1), $t2)) >> 2;
    if (pnum < 0 || pnum >= MAXPLAYER) {
      fprintf(R.stderr, S("handleKills: bad index %d\n"), pnum);
      return;
    }
    if ($sadd(G.players, pnum).p_kills !== pkills / 100) {
      $sadd(G.players, pnum).p_kills = pkills / 100;
      {
        G.updatePlayer[pnum] = 1;
        G.plistUpdated = 1;
      }
      ;
      if (G.me === $sadd(G.players, pnum)) {
        calibrate_stats();
        redrawStats(null);
      }
    }
  }
}

export function handleVPhaser(sbuf: Ptr | null): void {
  sbuf = $view8(sbuf, false);
  let phas = null;
  let packet = $cast(struct_phaser_s_spacket, sbuf.add(0));
  let pnum = 0;
  let status = 0;
  let target = 0;
  let x = 0;
  let y = 0;
  let dir = 0;
  status = packet.status & 15;
  pnum = packet.pnum & 63;
  G.weaponUpdate = 1;
  switch (status) {
  case 0:
    break;
  case 1:
    target = packet.target & 63;
    break;
  case 2:
    dir = packet.target;
    break;
  case 4:
    x = Math.imul(SCALE, ntohs(packet.x & 0xffff));
    y = Math.imul(SCALE, ntohs(packet.y & 0xffff));
    target = packet.target & 63;
    break;
  default:
    x = Math.imul(SCALE, ntohs(packet.x & 0xffff));
    y = Math.imul(SCALE, ntohs(packet.y & 0xffff));
    target = packet.target & 63;
    dir = packet.dir;
    break;
  }
  phas = $sadd(G.phasers, pnum);
  phas.ph_status = status & 0xff;
  phas.ph_dir = dir & 0xff;
  phas.ph_x = x;
  phas.ph_y = y;
  phas.ph_target = target << 16 >> 16;
  phas.ph_fuse = 0;
  phas.sound_phaser = 1;
  phas.ph_updateFuse = (Math.imul(PHASER_UPDATE_FUSE, G.server_ups) / 10 | 0) << 16 >> 16;
  if (G.rotate) {
    rotate_coord(P(phas, "ph_x"), P(phas, "ph_y"), G.rotate_deg, GWIDTH / 2 | 0, GWIDTH / 2 | 0);
    rotate_dir(P(phas, "ph_dir"), G.rotate_deg);
  }
}

export function handle_s_Stats(packet: struct_stats_s_spacket | null): void {
  packet = $cast(struct_stats_s_spacket, packet);
  let pl = null;
  if (packet.pnum < 0 || packet.pnum >= MAXPLAYER) {
    fprintf(R.stderr, S("handleStats: bad index %d\n"), packet.pnum);
    return;
  }
  pl = $sadd(G.players, (packet.pnum & 0xff));
  pl.p_stats.st_tkills = ntohs(packet.tkills);
  pl.p_stats.st_tlosses = ntohs(packet.tlosses);
  pl.p_stats.st_kills = ntohs(packet.kills);
  pl.p_stats.st_losses = ntohs(packet.losses);
  pl.p_stats.st_tticks = ntohl(packet.tticks) | 0;
  pl.p_stats.st_tplanets = ntohs(packet.tplanets);
  pl.p_stats.st_tarmsbomb = ntohl(packet.tarmies) | 0;
  pl.p_stats.st_sbkills = ntohs(packet.sbkills);
  pl.p_stats.st_sblosses = ntohs(packet.sblosses);
  pl.p_stats.st_armsbomb = ntohs(packet.armies);
  pl.p_stats.st_planets = ntohs(packet.planets);
  if (pl.p_ship.s_type === STARBASE && G.SBhours) {
    pl.p_stats.st_sbticks = ntohl(packet.maxkills) | 0;
  } else {
    pl.p_stats.st_maxkills = ntohl(packet.maxkills) / 100;
  }
  pl.p_stats.st_sbmaxkills = ntohl(packet.sbmaxkills) / 100;
  {
    G.updatePlayer[packet.pnum & 0xff] = 1;
    G.plistUpdated = 1;
  }
  ;
}

export function new_flags(data: number, which: number): void {
  let pnum = 0;
  let status = 0;
  let new_ = 0;
  let tmp = 0;
  let oldflags = 0;
  let j = null;
  tmp = data;
  for (pnum = which * 16; pnum < (which + 1) * 16 && pnum < MAXPLAYER; ++pnum) {
    new_ = (tmp & 3) >>> 0;
    tmp = tmp >>> 2;
    j = $sadd(G.players, pnum);
    oldflags = j.p_flags;
    switch (new_) {
    case 0:
      status = PEXPLODE;
      j.p_flags = (j.p_flags & 4294967279) >>> 0;
      break;
    case 1:
      status = PALIVE;
      j.p_flags = (j.p_flags | PFCLOAK) >>> 0;
      break;
    case 2:
      status = PALIVE;
      j.p_flags = (j.p_flags | PFSHIELD) >>> 0;
      j.p_flags = (j.p_flags & 4294967279) >>> 0;
      break;
    case 3:
      status = PALIVE;
      j.p_flags = (j.p_flags & 4294967278) >>> 0;
      break;
    default:
      break;
    }
    if (oldflags !== j.p_flags) {
      G.redrawPlayer[pnum] = 1;
    }
    if (j.p_status === status) {
      continue;
    }
    if (status === PEXPLODE) {
      if (j.p_status === PALIVE) {
        j.p_explode = 0;
        j.p_status = status;
      } else {
        continue;
      }
    } else {
      if (j === G.me) {
        if (j.p_status === POUTFIT || j.p_status === PFREE) {
          if (j.p_status !== PFREE) {
            j.p_kills = 0;
          } else {
            G.plistReorder = 1;
          }
          ;
          j.p_status = PALIVE;
        }
      } else {
        if (j.p_status !== PFREE) {
          j.p_kills = 0;
        } else {
          G.plistReorder = 1;
        }
        ;
        j.p_status = status;
      }
    }
    G.redrawPlayer[pnum] = 1;
    {
      G.updatePlayer[pnum] = 1;
      G.plistUpdated = 1;
    }
    ;
  }
}

export function $init(): void {
  G.daemon_texts = [S("Game is paused.  CONTINUE to continue."),
S("Game is no-longer paused!"),
S("Game is paused. Captains CONTINUE to continue."),
S("Game will continue in 10 seconds"),
S("Teams chosen.  Game will start in 1 minute."),
S("----------- Game will start in 1 minute -------------")];
  G.vari_texts = [S("Engineering:  Energizing transporters in %d seconds"),
S("Stand By ... Self Destruct in %d seconds"),
S("Helmsman:  Docking manuever completed Captain.  All moorings secured at port %d."),
S("Not constructed yet. %d minutes required for completion")];
  G.w_texts = [S("Tractor beams haven't been invented yet."),
S("Weapons's Officer:  Cannot tractor while cloaked, sir!"),
S("Weapon's Officer:  Vessel is out of range of our tractor beam."),
S("You must have one kill to throw a coup"),
S("You must orbit your home planet to throw a coup"),
S("You already own a planet!!!"),
S("You must orbit your home planet to throw a coup"),
S("Too many armies on planet to throw a coup"),
S("Planet not yet ready for a coup"),
S("I cannot allow that.  Pick another team"),
S("Please confirm change of teams.  Select the new team again."),
S("That is an illegal ship type.  Try again."),
S("That ship hasn't beed designed yet.  Try again."),
S("Your new starbase is still under construction"),
S("Your team is not capable of defending such an expensive ship!"),
S("Your team's stuggling economy cannot support such an expenditure!"),
S("Your side already has a starbase!"),
S("Plasmas haven't been invented yet."),
S("Weapon's Officer:  Captain, this ship is not armed with plasma torpedoes!"),
S("Plasma torpedo launch tube has exceeded the maximum safe temperature!"),
S("Our fire control system limits us to 1 live torpedo at a time captain!"),
S("Our fire control system limits us to 1 live torpedo at a time captain!"),
S("We don't have enough fuel to fire a plasma torpedo!"),
S("We cannot fire while our vessel is undergoing repairs."),
S("We are unable to fire while in cloak, captain!"),
S("Torpedo launch tubes have exceeded maximum safe temperature!"),
S("Our computers limit us to having 8 live torpedos at a time captain!"),
S("We don't have enough fuel to fire photon torpedos!"),
S("We cannot fire while our vessel is in repair mode."),
S("We are unable to fire while in cloak, captain!"),
S("We only have forward mounted cannons."),
S("Weapons Officer:  This ship is not armed with phasers, captain!"),
S("Phasers have not recharged"),
S("Not enough fuel for phaser"),
S("Can't fire while repairing"),
S("Weapons overheated"),
S("Cannot fire while cloaked"),
S("Phaser missed!!!"),
S("You destroyed the plasma torpedo!"),
S("Must be orbiting to bomb"),
S("Can't bomb your own armies.  Have you been reading Catch-22 again?"),
S("Must declare war first (no Pearl Harbor syndrome allowed here)."),
S("Bomb out of T-mode?  Please verify your order to bomb."),
S("Hoser!"),
S("Must be orbiting or docked to beam up."),
S("Those aren't our men."),
S("Comm Officer: We're not authorized to beam foriegn troops on board!"),
S("Must be orbiting or docked to beam down."),
S("Comm Officer: Starbase refuses permission to beam our troops over."),
S("Pausing ten seconds to re-program battle computers."),
S("You must orbit your HOME planet to apply for command reassignment!"),
S("You must orbit your home planet to apply for command reassignment!"),
S("Can only refit to starbase on your home planet."),
S("You must dock YOUR starbase to apply for command reassignment!"),
S("Must orbit home planet or dock your starbase to apply for command reassignment!"),
S("Central Command refuses to accept a ship in this condition!"),
S("You must beam your armies down before moving to your new ship"),
S("That ship hasn't been designed yet."),
S("Your side already has a starbase!"),
S("Your team is not capable of defending such an expensive ship"),
S("Your new starbase is still under construction"),
S("Your team's stuggling economy cannot support such an expenditure!"),
S("You are being transported to your new vessel .... "),
S("Engineering:  Energize. [ SFX: chimes ]"),
S("Wait, you forgot your toothbrush!"),
S("Nothing like turning in a used ship for a new one."),
S("First officer:  Oh no, not you again... we're doomed!"),
S("First officer:  Uh, I'd better run diagnostics on the escape pods."),
S("Shipyard controller:  This time, *please* be more careful, okay?"),
S("Weapons officer:  Not again!  This is absurd..."),
S("Weapons officer:  ... the whole ship's computer is down?"),
S("Weapons officer:  Just to twiddle a few bits of the ship's memory?"),
S("Weapons officer:  Bah! [ bangs fist on inoperative console ]"),
S("First Officer:  Easy, big guy... it's just one of those mysterious"),
S("First Officer:  laws of the universe, like 'tires on the ether'."),
S("First Officer:  laws of the universe, like 'Klingon bitmaps are ugly'."),
S("First Officer:  laws of the universe, like 'all admirals have scummed'."),
S("First Officer:  laws of the universe, like 'Mucus Pig exists'."),
S("First Officer:  laws of the universe, like 'guests advance 5x faster'."),
S("Helmsman: Captain, the maximum safe speed for docking or orbiting is warp 2!"),
S("Central Command regulations prohibit you from orbiting foreign planets"),
S("Helmsman:  Sensors read no valid targets in range to dock or orbit sir!"),
S("No more room on board for armies"),
S("You notice everyone on the bridge is staring at you."),
S("Can't send in practice robot with other players in the game."),
S("Self Destruct has been canceled"),
S("Be quiet"),
S("You are censured.  Message was not sent."),
S("You are ignoring that player.  Message was not sent."),
S("That player is censured.  Message was not sent."),
S("Self destruct initiated"),
S("Scanners haven't been invented yet"),
S("WARNING: BROKEN mode is enabled"),
S("Server can't do that UDP mode"),
S("Server will send with TCP only"),
S("Server will send with simple UDP"),
S("Request for fat UDP DENIED (set to simple)"),
S("Request for double UDP DENIED (set to simple)"),
S("Update request DENIED (chill out!)"),
S("Player lock lost while player dead."),
S("Can only lock on own team."),
S("You can only warp to your own team's planets!"),
S("Planet lock lost on change of ownership."),
S(" Weapons officer: Finally! systems are back online!")];
  G.Plx = new Int32Array(36);
  G.Ply = new Int32Array(36);
  G.Pgx = new Int32Array(36);
  G.Pgy = new Int32Array(36);
  G.Pdir = new Uint8Array(36);
  G.my_x = 0;
  G.my_y = 0;
  G.s_texte = new Array(256).fill(null);
  G.no_memory = $ta(Int8Array, 38, [S("Not enough memory for warning string!")]);
  G.shiptype = [S("SC"),
S("DD"),
S("CA"),
S("BB"),
S("AS"),
S("SB"),
S("??"),
null];
  G.spwinside = 500;
  G.spgwidth = GWIDTH;
  G.whydeadmess = [S(""),
S("[quit]"),
S("[photon]"),
S("[phaser]"),
S("[planet]"),
S("[explosion]"),
S("[daemon]"),
S("[winner]"),
S("[ghostbust]"),
S("[genocide]"),
S("[hacker]"),
S("[plasma]"),
S("[tournend]"),
S("[gameover]"),
S("[gamestart]"),
S("[bad binary]"),
S("[detted photon]"),
S("[chain explosion]"),
S("[zapped plasma]"),
S(""),
S("[team det]"),
S("[team explosion]")];
  handleSelfShort$seen = 0;
  handleSWarning$arg3 = 0;
  handleSWarning$arg4 = 0;
  handleSWarning$karg3 = 0;
  handleSWarning$karg4 = 0;
  handleSWarning$karg5 = 0;
}
