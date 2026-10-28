// @ts-nocheck
// COW 3.3.3 playback.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { initCensoring } from './censor.ts';
import { booleanDefault, initDefaults, resetdefaults, shipchange } from './defaults.ts';
import { enter, init_hockey_lines, openmem } from './enter.ts';
import { getship } from './getship.ts';
import { destroyInfo } from './inform.ts';
import { initkeymap, process_event } from './input.ts';
import { redrawLMeter } from './lagmeter.ts';
import { mapAll, newwin } from './newwin.ts';
import { redrawPStats } from './pingstats.ts';
import { intrupt } from './redraw.ts';
import { getvpsize } from './socket.ts';
import { Init_Sound, Play_Sound } from './sound.ts';
import { calibrate_stats } from './stats.ts';
import { W_CameraSnap, W_ClearWindow, W_EventsQueuedCk, W_Flush, W_IsMapped, W_MapWindow, W_WriteText } from './x11window.ts';
import { struct_LocPacketInfo, struct_flags_spacket, struct_hostile_spacket, struct_kills_spacket, struct_phaser_s_spacket, struct_phaser_spacket, struct_planet_loc_spacket, struct_planet_s_spacket, struct_planet_spacket, struct_plasma_info_spacket, struct_plasma_spacket, struct_player, struct_player_spacket, struct_plyr_info_spacket, struct_plyr_login_spacket, struct_pstatus_spacket, struct_stats_s_spacket, struct_stats_spacket, struct_torp_info_spacket, struct_torp_spacket, struct_you_spacket, struct_youshort_spacket, struct_youss_spacket } from './structs.ts';
import { $cast, $cs, $rd, $sadd, $u64, $wr, G, LongJmp, P, R, S, bsearch, exit, fopen, fprintf, fread, fseek, ftell, fwrite, getpid, memcpy, memset, ntohs, perror, printf, qsort, realloc, rewind, sprintf, srandom, strcat, strlen, strncpy, strtol, time, usleep } from '../rt/index.ts';
import { CRUISER, ENTER_SHIP_SOUND, EXPANDCOUNT, FED, FILENAME_MAX, JUMP_MAX, KLI, ORI, PALIVE, PL_FORWARD, PL_PAUSE, PL_REVERSE, RETURNBASE, ROM, RPB_NORMAL_SEQUENCE, RPB_NORMAL_STATUS, RPB_PLANET_INFO, RPB_PLANET_MAX, RPB_PLANET_OFFSET, RPB_PLANET_POSITION, RPB_PLASMA_INFO, RPB_PLASMA_MAX, RPB_PLASMA_OFFSET, RPB_PLASMA_POSITION, RPB_PLAYER_ARMIES, RPB_PLAYER_FLAGS, RPB_PLAYER_FUEL, RPB_PLAYER_HOSTILE, RPB_PLAYER_INFO, RPB_PLAYER_KILLS, RPB_PLAYER_LOGIN, RPB_PLAYER_MAX, RPB_PLAYER_OFFSET, RPB_PLAYER_PHASER, RPB_PLAYER_POSITION, RPB_PLAYER_STATS, RPB_PLAYER_STATUS, RPB_TORP_INFO, RPB_TORP_MAX, RPB_TORP_OFFSET, RPB_TORP_POSITION, RPB_TOTAL, SEEK_SET, SHORTVERSION, SP_SC_SEQUENCE, SP_SEQUENCE, SP_S_8_TORP, SP_S_MESSAGE, SP_S_SEQUENCE, ST_KEEPPEACE, ST_MAPMODE, ST_NAMEMODE, ST_SHOWGLOBAL, ST_SHOWLOCAL, ST_SHOWSHIELDS } from './consts.ts';

let packet_size: number;
let pbsetspeed$jump_str: any;
let pbsetspeed$jump_idx: number;
let pbsetspeed$jump_on: number;
let pbsetspeed$tmp_playback: number;
let pbsetspeed$tmp_pbdelay: number;
let readFromFile0$aligned_buf: any;
let readFromFile0$num_context_written: number;

export async function pbmain(name: Ptr | null): Promise<number> {
  let i = 0;
  let index_filename = new Int8Array(4097);
  let context_filename = new Int8Array(4097);
  strncpy(P(index_filename), G.recordFileName, FILENAME_MAX - 4);
  strncpy(P(context_filename), G.recordFileName, FILENAME_MAX - 4);
  index_filename[FILENAME_MAX - 4] = 0;
  context_filename[FILENAME_MAX - 4] = 0;
  strcat(P(index_filename), S(".idx"));
  strcat(P(context_filename), S(".cxt"));
  rpb_init();
  G.playback = PL_FORWARD;
  G.pseudo[0] = G.defpasswd[0] = 0;
  let $sj1 = 0;
  $SJ1: for (;;) {
    try {
      i = $sj1;
      if (i >= RETURNBASE) {
        return i - RETURNBASE;
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
      srandom(time(null) >>> 0);
      initDefaults(G.deffile);
      srandom(getpid() * time(null) >>> 0);
      newwin(G.display_host, name);
      resetdefaults();
      if (G.censorMessages) {
        initCensoring();
      }
      openmem();
      G.recordFile = fopen(G.recordFileName, S("rb"));
      if (!G.recordFile) {
        perror(G.recordFileName);
        return 1;
      }
      G.pb_index_exists = 1;
      if (!G.pb_create_index) {
        G.recordIndexFile = fopen(P(index_filename), S("r"));
        if (!G.recordIndexFile) {
          perror(P(index_filename));
          G.pb_index_exists = 0;
        }
        G.recordContextFile = fopen(P(context_filename), S("rb"));
        if (!G.recordContextFile) {
          perror(P(context_filename));
          G.pb_index_exists = 0;
        }
      } else {
        G.pb_index_exists = 0;
      }
      if (G.pb_create_index && !(G.recordIndexFile = fopen(P(index_filename), S("wb")))) {
        perror(S("Could not create index file."));
        exit(1);
      }
      if (G.pb_create_index && !(G.recordContextFile = fopen(P(context_filename), S("wb")))) {
        perror(S("Could not create context file."));
        exit(1);
      }
      if (G.pb_create_index) {
        G.pbdelay = 0;
        G.playback = PL_FORWARD;
        printf(S("Creating index.\n"));
      }
      G.me = G.dummyme;
      G.myship = G.me.p_ship;
      G.mystats = G.me.p_stats;
      G.me.p_x = G.me.p_y = 50000;
      getship(G.myship, CRUISER);
      shipchange(CRUISER);
      G.displayme = G.me;
      G.packetsme = G.me;
      pb_read_index();
      await readFromFile();
      G.displayme = G.packetsme;
      mapAll();
      memset(G.mystats, 0, 568);
      G.mystats.st_tticks = 1;
      for (i = 0; i < 95; ++i) {
        G.mystats.st_keymap[i] = i + 32 & 0xff;
        G.mystats.st_keymap[i + 96] = i + 32 + 96 & 0xff;
        G.mystats.st_keymap[i + 192] = i + 32 & 0xff;
        G.mystats.st_keymap[i + 288] = i + 32 & 0xff;
        G.mystats.st_keymap[i + 384] = i + 32 & 0xff;
      }
      G.mystats.st_keymap[95] = 0;
      G.mystats.st_flags = ST_MAPMODE + ST_NAMEMODE + ST_SHOWSHIELDS + ST_KEEPPEACE + ST_SHOWLOCAL * 2 + ST_SHOWGLOBAL * 2;
      G.phaserWindow = booleanDefault(S("phaserWindow"), G.phaserWindow);
      initkeymap();
      G.me.p_hostile = FED | ROM | KLI | ORI;
      if (!G.newDashboard) {
        let buf = new Int8Array(128);
        sprintf(P(buf), S("Maximum:      %2d  %3d %3d               %3d   %6d   %3d   %3d"), 0, 0, 0, 0, 0, 0, 0);
        W_WriteText(G.tstatw, 50, 27, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      }
      await Init_Sound();
      let $sj2 = 0;
      $SJ2: for (;;) {
        try {
          i = $sj2;
          if (i >= RETURNBASE) {
            return i - RETURNBASE;
          }
          G.redrawall = 2;
          getship(G.myship, G.myship.s_type);
          shipchange(G.myship.s_type);
          enter();
          calibrate_stats();
          W_ClearWindow(G.w);
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
          Play_Sound(ENTER_SHIP_SOUND);
          init_hockey_lines();
          while (1) {
            if (G.keepInfo > 0 && G.opened_info !== -2 && G.opened_info < 0 && G.infomapped) {
              destroyInfo();
            }
            if (G.keepInfo > 0 && G.opened_info !== -2) {
              --G.opened_info;
            }
            while (W_EventsQueuedCk()) {
              await process_event();
            }
            await intrupt(null);
            W_Flush();
            if (!G.pb_stepping) {
              await usleep(G.pbdelay >>> 0);
            }
            if (G.pb_snapping) {
              W_CameraSnap(G.w);
            }
          }
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

export function pbsetspeed(key: number): void {
  let $g = 0;
  let old_playback = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      old_playback = G.playback;
      if (pbsetspeed$jump_on) {
        switch (key) {
        case 48:
        case 49:
        case 50:
        case 51:
        case 52:
        case 53:
        case 54:
        case 55:
        case 56:
        case 57:
          if (pbsetspeed$jump_idx > JUMP_MAX - 2) {
            break;
          }
          pbsetspeed$jump_str[pbsetspeed$jump_idx] = key;
          ++pbsetspeed$jump_idx;
          pbsetspeed$jump_str[pbsetspeed$jump_idx] = 0;
          printf(S("Jump input: %s\n"), P(pbsetspeed$jump_str));
          break;
        case 74:
          pbsetspeed$jump_on = 0;
          G.playback = pbsetspeed$tmp_playback;
          printf(S("Aborting jump.\n"));
          pbsetspeed$jump_str[0] = 0;
          break;
        default:
          pbsetspeed$jump_str[pbsetspeed$jump_idx] = 0;
          G.pb_goto = strtol(P(pbsetspeed$jump_str), null, 10) | 0;
          if (G.pb_goto < 1) {
            G.pb_goto = 1;
          }
          pbsetspeed$jump_on = 0;
          pbsetspeed$jump_str[0] = 0;
          break;
        }
        { $g = 1; continue $L; }
      }
      if (G.playback === PL_PAUSE) {
        G.playback = PL_FORWARD;
      }
      switch (key) {
      case 8:
        ++G.pb_stepping;
        G.playback = PL_REVERSE;
        break;
      case 13:
        ++G.pb_stepping;
        break;
      case 32:
        if (old_playback === PL_PAUSE) {
          G.playback = PL_FORWARD;
        } else {
          ++G.pb_stepping;
        }
        break;
      case 48:
        G.playback = PL_PAUSE;
        break;
      case 49:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 800000;
        break;
      case 50:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 400000;
        break;
      case 51:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 200000;
        break;
      case 52:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 100000;
        break;
      case 53:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 50000;
        break;
      case 54:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 25000;
        break;
      case 55:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 12500;
        break;
      case 56:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 6250;
        break;
      case 57:
      case 35:
      case 33:
      case 64:
      case 37:
        pbsetspeed$tmp_pbdelay = G.pbdelay = 0;
        break;
      case 60:
        if (pbsetspeed$tmp_pbdelay === -1) {
          pbsetspeed$tmp_pbdelay = G.pbdelay = G.pbdelay / 2 | 0;
        } else {
          G.pbdelay = pbsetspeed$tmp_pbdelay = pbsetspeed$tmp_pbdelay / 2 | 0;
        }
        break;
      case 62:
        if (pbsetspeed$tmp_pbdelay === -1) {
          pbsetspeed$tmp_pbdelay = G.pbdelay = G.pbdelay * 2;
        } else {
          G.pbdelay = pbsetspeed$tmp_pbdelay = pbsetspeed$tmp_pbdelay * 2;
        }
        break;
      case 82:
        {
          rpb_init();
          fseek(G.recordFile, 0, SEEK_SET);
          G.playback = PL_FORWARD;
          G.pb_sequence_count = 0;
          break;
        }
      case 40:
        G.playback = PL_REVERSE;
        break;
      case 41:
        G.playback = PL_FORWARD;
        break;
      case 106:
        printf(S("Jumping..\n"));
        pbsetspeed$tmp_playback = G.playback;
        G.playback = PL_PAUSE;
        pbsetspeed$jump_on = 1;
        pbsetspeed$jump_idx = 0;
        pbsetspeed$jump_str[0] = 0;
        break;
      case 115:
        fprintf(R.stderr, S("toggle-snap\n"));
        G.pb_snapping = ~G.pb_snapping;
        break;
      }
    case 1: // end
      if (G.playback === PL_PAUSE && old_playback !== PL_PAUSE) {
        pbsetspeed$tmp_pbdelay = G.pbdelay;
        G.pbdelay = 100000;
      }
      if (old_playback === PL_PAUSE && G.playback !== PL_PAUSE && pbsetspeed$tmp_pbdelay !== -1) {
        G.pbdelay = pbsetspeed$tmp_pbdelay;
        pbsetspeed$tmp_pbdelay = -1;
      }
    }
    break;
  }
}

export function pblockplayer(who: number): void {
  G.me = G.displayme = $sadd(G.players, who);
}

export function pblockplanet(pl: number): void {
  G.me = G.dummyme;
  G.displayme.p_x = $sadd(G.planets, pl).pl_x;
  G.displayme.p_y = $sadd(G.planets, pl).pl_y;
  G.displayme = G.me;
}

export function ckRecordPacket(packet: number): number {
  return 1;
}

export async function pb_dopacket(buf: Ptr | null): Promise<number> {
  let size = 0;
  let count = 0;
  count = fread(buf, 1, 4, G.recordFile) | 0;
  if (count < 4) {
    return 1;
  }
  size = G.handlers[buf.a[buf.o] & 0xff].size;
  if (size === -1) {
    if (buf.a[buf.o] === SP_S_MESSAGE) {
      count += fread(buf.add(count), 1, 4, G.recordFile);
      if (count < 8) {
        return 1;
      }
    }
    size = getvpsize(buf);
  }
  packet_size = size;
  if (size > count) {
    count += fread(buf.add(count), 1, $u64(size - count), G.recordFile);
  }
  if (G.debug) {
    printf(S("Reading packet %d\n"), buf.a[buf.o]);
  }
  if (count < size) {
    return 1;
  }
  await G.handlers[buf.a[buf.o] & 0xff].handler(buf, -1);
  return 0;
}

export async function readFromFile(): Promise<number> {
  const offset = new Int32Array(1);
  offset[0] = ftell(G.recordFile) | 0;
  const jump_actual = new Int32Array(1);
  let tmp_file = null;
  let result = 0;
  let num_fast_forward = 0;
  if (G.pb_goto) {
    G.playback = PL_FORWARD;
    num_fast_forward = pb_get_index(G.pb_goto, P(jump_actual, 0), P(offset, 0), P(G, "pb_num_context"));
    if (G.pb_num_context > 0) {
      printf(S("Reading in %d context packets..\n"), G.pb_num_context);
      rewind(G.recordContextFile);
      tmp_file = G.recordFile;
      G.recordFile = G.recordContextFile;
      G.pb_sequence_count = 0;
      await readFromFile0();
      G.recordFile = tmp_file;
    }
    G.pb_sequence_count = jump_actual[0] - 1;
    G.pb_num_fast_forward = num_fast_forward;
    rpb_init();
  }
  fseek(G.recordFile, offset[0], SEEK_SET);
  result = await readFromFile0();
  if (G.pb_goto) {
    G.playback = PL_PAUSE;
    G.pb_goto = 0;
    printf(S("Done jumping.\n"));
  }
  return result;
}

async function readFromFile0(): Promise<number> {
  let buf = P(readFromFile0$aligned_buf);
  let diskpos = 0;
  let sequence_start_pos = -1;
  let sequence_num_context = 0;
  if (G.playback === PL_PAUSE) {
    return 1;
  } else if (G.playback === PL_REVERSE) {
    diskpos = ftell(G.recordFile) | 0;
    G.me = G.packetsme;
    await rpb_dorev(buf);
    G.packetsme = G.me;
    G.me = G.displayme;
    if (G.pb_stepping) {
      G.playback = PL_PAUSE;
      G.pb_stepping = 0;
    }
    return 1;
  }
  if (G.pb_stepping) {
    G.playback = PL_PAUSE;
    G.pb_stepping = 0;
  }
  while (1) {
    diskpos = ftell(G.recordFile) | 0;
    G.me = G.packetsme;
    if (sequence_start_pos === -1) {
      sequence_start_pos = diskpos;
    }
    if (await pb_dopacket(buf)) {
      G.playback = PL_PAUSE;
      G.pb_num_fast_forward = 0;
      G.packetsme = G.me;
      G.me = G.displayme;
      printf(S("End of file.\n"));
      if (G.pb_create_index) {
        exit(0);
      }
      return 1;
    }
    if (!G.pb_create_index && !G.pb_num_context) {
      rpb_analyze(diskpos, buf);
    }
    if (G.pb_num_context) {
      --G.pb_num_context;
      if (G.pb_num_context < 1) {
        printf(S("Done reading context packets.\n"));
        return 1;
      }
    }
    if (G.pb_create_index && (buf.a[buf.o] === 60 || buf.a[buf.o] === 14 || buf.a[buf.o] === 24 || buf.a[buf.o] === 2 || buf.a[buf.o] === 20 || buf.a[buf.o] === 58 || buf.a[buf.o] === 15 || buf.a[buf.o] === 26 || buf.a[buf.o] === 59 || buf.a[buf.o] === 50 || buf.a[buf.o] === 3)) {
      if (!fwrite(buf, 1, $u64(packet_size), G.recordContextFile)) {
        perror(S("Bad write on context file."));
        exit(1);
      }
      ++readFromFile0$num_context_written;
      ++sequence_num_context;
    }
    G.packetsme = G.me;
    G.me = G.displayme;
    if (buf.a[buf.o] === SP_SEQUENCE || buf.a[buf.o] === SP_SC_SEQUENCE || buf.a[buf.o] === SP_S_SEQUENCE) {
      ++G.pb_sequence_count;
      if (G.pb_num_fast_forward > 0) {
        --G.pb_num_fast_forward;
      }
      if (G.pb_create_index && !(G.pb_sequence_count % G.INDEX_GRANULARITY)) {
        fprintf(G.recordIndexFile, G.INDEX_FORMAT, G.pb_sequence_count, sequence_start_pos, readFromFile0$num_context_written - sequence_num_context);
        fprintf(G.recordIndexFile, S("\n"));
      }
      if (G.pb_create_index && !(G.pb_sequence_count % 1000)) {
        printf(S("Indexed %d sequences.\n"), G.pb_sequence_count);
      }
      if (G.pb_sequence_count > 1000000) {
        printf(S("I've seen enough, exiting!\n"));
        exit(0);
      }
      sequence_start_pos = -1;
      sequence_num_context = 0;
      if (G.pb_create_index || G.pb_num_fast_forward) {
        ;
      } else {
        return 1;
      }
    }
  }
}

// TRANSLATION FAILED: pb_read_index: cannot parse type 'char[MAXLINE + 1]' at 13
export function pb_read_index(...a: any[]): any { throw new Error("untranslated: pb_read_index"); }

export function pb_get_index(sequence_num: number, p_jump_actual: Ptr | null, offset: Ptr | null, num_context: Ptr | null): number {
  let $g = 0;
  let found = null;
  let jump_actual = new Int32Array(1);
  let num_left = 0;
  let first_index_num = 0;
  let last_index_num = 0;
  $L: for (;;) {
    switch ($g) {
    case 0:
      if (!G.pb_index_exists) {
        jump_actual[0] = 1;
        offset.a[offset.o] = 0;
        num_context.a[num_context.o] = 0;
        num_left = sequence_num - 1;
        { $g = 1; continue $L; }
      }
      first_index_num = G.pb_index.a[G.pb_index.o];
      last_index_num = G.pb_index.a[G.pb_index.o + (G.pb_num_index - 1) * 3];
      jump_actual[0] = Math.imul(sequence_num / G.INDEX_GRANULARITY | 0, G.INDEX_GRANULARITY) - G.INDEX_GRANULARITY;
      if (jump_actual[0] < first_index_num) {
        jump_actual[0] = 1;
        offset.a[offset.o] = 0;
        num_context.a[num_context.o] = 0;
        num_left = sequence_num - 1;
        { $g = 1; continue $L; }
      }
      if (jump_actual[0] > last_index_num) {
        printf(S("Jumping ahead to last sequence.\n"));
        jump_actual[0] = last_index_num;
      }
      num_left = sequence_num - jump_actual[0];
      found = bsearch(P(jump_actual, 0), G.pb_index, $u64(G.pb_num_index), 4 * 3, pb_index_compare);
      if (!found) {
        jump_actual[0] = 1;
        offset.a[offset.o] = 0;
        num_context.a[num_context.o] = 0;
        num_left = sequence_num - 1;
      } else {
        let f = found;
        offset.a[offset.o] = $rd(f.add(1));
        num_context.a[num_context.o] = $rd(f.add(2));
      }
    case 1: // end
      p_jump_actual.a[p_jump_actual.o] = jump_actual[0];
      ++num_left;
      return num_left;
    }
    break;
  }
}

export function pb_index_compare(a: any, b: any): number {
  let x = a.a[a.o];
  let y = b.a[b.o];
  if (x > y) {
    return 1;
  } else if (x < y) {
    return -1;
  } else {
    return 0;
  }
}

export function rpb_init(): void {
  let i = 0;
  for (i = 0; i < RPB_TOTAL; ++i) {
    G.lastPos[i] = -1;
  }
  G.current = 0;
}

export function rpb_insert(diskpos: number, hdl: number): void {
  if (G.current >= G.max_alloc) {
    G.max_alloc += EXPANDCOUNT;
    G.header = $cast(struct_LocPacketInfo, realloc(G.header, $u64(G.max_alloc) * 8));
    if (!G.header) {
      fprintf(R.stderr, S("unable to allocate memory to grow playback header\n"));
      exit(1);
    }
  }
  $sadd(G.header, G.current).prev = G.lastPos[hdl];
  $sadd(G.header, G.current).diskpos = diskpos >>> 0;
  G.lastPos[hdl] = G.current;
  ++G.current;
}

export function rpb_analyze(diskpos: number, packet: any): void {
  let id = 0;
  switch (packet.a[packet.o]) {
  case 14:
    rpb_insert(diskpos, RPB_NORMAL_STATUS);
    break;
  case 29:
  case 56:
  case 30:
    rpb_insert(diskpos, RPB_NORMAL_SEQUENCE);
    break;
  case 2:
    id = $cast(struct_plyr_info_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_INFO);
    break;
  case 24:
    id = $cast(struct_plyr_login_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_LOGIN);
    break;
  case 22:
    id = $cast(struct_hostile_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_HOSTILE);
    break;
  case 23:
    id = $cast(struct_stats_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_STATS);
    break;
  case 18:
    id = $cast(struct_flags_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_FLAGS);
    break;
  case 3:
    id = $cast(struct_kills_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_KILLS);
    break;
  case 4:
    id = $cast(struct_player_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_POSITION);
    break;
  case 12:
    id = $cast(struct_you_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_HOSTILE);
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_FLAGS);
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_FUEL);
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_ARMIES);
    break;
  case 20:
    id = $cast(struct_pstatus_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_STATUS);
    break;
  case 43:
    id = $cast(struct_youshort_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_HOSTILE);
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_FLAGS);
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_ARMIES);
    break;
  case 44:
    if (G.F_many_self) {
      id = $cast(struct_youss_spacket, packet).pad1;
    } else {
      id = G.me.p_no;
    }
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_FUEL);
    break;
  case 58:
    {
      let i = 0;
      let numofkills = 0;
      numofkills = packet.a[packet.o + 1];
      for (i = 0; i < numofkills; ++i) {
        id = packet.a[packet.o + (i * 2 + 3)] >> 2;
        rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_KILLS);
      }
    }
    break;
  case 45:
    {
      let i = 0;
      let numofplayers = 0;
      let offset = 0;
      let sbuf = packet;
      numofplayers = sbuf.a[sbuf.o + 1] & 63;
      if (sbuf.a[sbuf.o + 1] & 128) {
        offset = 32;
        sbuf = sbuf.add(4);
      } else if (sbuf.a[sbuf.o + 1] & 64) {
        offset = 0;
        if (G.shortversion === SHORTVERSION) {
          if (sbuf.a[sbuf.o + 2] === 2) {
            sbuf = sbuf.add(8);
          } else if (sbuf.a[sbuf.o + 2] === 1) {
            sbuf = sbuf.add(4);
          }
        }
      } else {
        offset = 0;
        sbuf = sbuf.add(12);
        id = G.me.p_no;
        rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_POSITION);
      }
      for (i = 0; i < numofplayers; ++i) {
        id = (sbuf.a[sbuf.o + i * 4] & 31) + offset;
        rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_POSITION);
      }
    }
    break;
  case 59:
    id = $cast(struct_stats_s_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_STATS);
    break;
  case 7:
    id = $cast(struct_phaser_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_PHASER);
    break;
  case 57:
    id = $cast(struct_phaser_s_spacket, packet).pnum & 63;
    rpb_insert(diskpos, RPB_PLAYER_OFFSET + Math.imul(id, RPB_PLAYER_MAX) + RPB_PLAYER_PHASER);
    break;
  case 8:
    id = ntohs($cast(struct_plasma_info_spacket, packet).pnum);
    rpb_insert(diskpos, RPB_PLASMA_OFFSET + Math.imul(id, RPB_PLASMA_MAX) + RPB_PLASMA_INFO);
    break;
  case 9:
    id = ntohs($cast(struct_plasma_spacket, packet).pnum);
    rpb_insert(diskpos, RPB_PLASMA_OFFSET + Math.imul(id, RPB_PLASMA_MAX) + RPB_PLASMA_POSITION);
    break;
  case 5:
    id = ntohs($cast(struct_torp_info_spacket, packet).tnum);
    rpb_insert(diskpos, RPB_TORP_OFFSET + Math.imul(id, RPB_TORP_MAX) + RPB_TORP_INFO);
    break;
  case 6:
    id = ntohs($cast(struct_torp_spacket, packet).tnum);
    rpb_insert(diskpos, RPB_TORP_OFFSET + Math.imul(id, RPB_TORP_MAX) + RPB_TORP_POSITION);
    break;
  case 49:
  case 47:
  case 48:
    {
      let i = 0;
      if (packet.a[packet.o] === SP_S_8_TORP) {
        id = packet.a[packet.o + 1] * 8;
      } else {
        id = packet.a[packet.o + 2] * 8;
      }
      for (i = 0; i < 8; ++i) {
        rpb_insert(diskpos, RPB_TORP_OFFSET + Math.imul(id + i, RPB_TORP_MAX) + RPB_TORP_INFO);
        rpb_insert(diskpos, RPB_TORP_OFFSET + Math.imul(id + i, RPB_TORP_MAX) + RPB_TORP_POSITION);
      }
    }
    break;
  case 15:
    id = $cast(struct_planet_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLANET_OFFSET + Math.imul(id, RPB_PLANET_MAX) + RPB_PLANET_INFO);
    break;
  case 26:
    id = $cast(struct_planet_loc_spacket, packet).pnum;
    rpb_insert(diskpos, RPB_PLANET_OFFSET + Math.imul(id, RPB_PLANET_MAX) + RPB_PLANET_POSITION);
    break;
  case 50:
    {
      let i = 0;
      let numofplanets = 0;
      let ppacket = null;
      numofplanets = packet.a[packet.o + 1];
      ppacket = $cast(struct_planet_s_spacket, packet.add(2));
      for (i = 0; i < numofplanets; ++i, ppacket = $sadd(ppacket, 1)) {
        id = ppacket.pnum;
        rpb_insert(diskpos, RPB_PLANET_OFFSET + Math.imul(id, RPB_PLANET_MAX) + RPB_PLANET_INFO);
      }
    }
    break;
  }
}

export function intcomp(a: any, b: any): number {
  if (a.a[a.o] < b.a[b.o]) {
    return -1;
  } else if (a.a[a.o] > b.a[b.o]) {
    return 1;
  } else {
    return 0;
  }
}

export async function rpb_dorev(buf: Ptr | null): Promise<void> {
  let startpos = 0;
  let i = 0;
  let temp = new Int32Array(1126);
  let last = -1;
  if (G.lastPos[RPB_NORMAL_SEQUENCE] === -1 || $sadd(G.header, G.lastPos[RPB_NORMAL_SEQUENCE]).prev === -1) {
    G.playback = PL_PAUSE;
    return;
  }
  startpos = $sadd(G.header, G.lastPos[RPB_NORMAL_SEQUENCE]).prev;
  for (i = 0; i < RPB_TOTAL; ++i) {
    while (G.lastPos[i] > startpos) {
      G.lastPos[i] = $sadd(G.header, G.lastPos[i]).prev;
    }
  }
  memcpy(P(temp), P(G.lastPos), 4504);
  qsort(P(temp), RPB_TOTAL, 4, intcomp);
  for (i = 0; i < RPB_TOTAL; ++i) {
    if (temp[i] !== last) {
      last = temp[i];
      fseek(G.recordFile, $sadd(G.header, last).diskpos, SEEK_SET);
      await pb_dopacket(buf);
    }
  }
  G.current = startpos + 1;
  --G.pb_sequence_count;
}

export function $init(): void {
  G.pbdelay = 200000;
  G.pb_index = null;
  G.pb_num_index = 0;
  G.pb_goto = 0;
  G.pb_create_index = 0;
  G.pb_index_exists = 0;
  G.pb_num_context = 0;
  G.pb_num_fast_forward = 0;
  G.pb_sequence_count = 0;
  G.pb_stepping = 0;
  G.pb_snapping = 0;
  G.INDEX_FORMAT = S("%d,%d,%d");
  G.INDEX_GRANULARITY = 100;
  packet_size = 0;
  G.dummyme = new struct_player();
  G.packetsme = null;
  G.displayme = null;
  G.header = null;
  G.lastPos = new Int32Array(1126);
  G.max_alloc = 0;
  G.current = 0;
  pbsetspeed$jump_str = $cs("", 7);
  pbsetspeed$jump_idx = 0;
  pbsetspeed$jump_on = 0;
  pbsetspeed$tmp_playback = 0;
  pbsetspeed$tmp_pbdelay = -1;
  readFromFile0$aligned_buf = new Uint32Array(81);
  readFromFile0$num_context_written = 0;
}
