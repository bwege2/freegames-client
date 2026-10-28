// @ts-nocheck
// COW 3.3.3 beeplite.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { makedistress } from './distress.ts';
import { Play_Sound } from './sound.ts';
import { warning } from './warning.ts';
import { W_Beep, W_TTSTextWidth } from './x11window.ts';
import { struct_distress, struct_planet, struct_player } from './structs.ts';
import { $rd, $sadd, $wr, G, P, R, S, fprintf } from '../rt/index.ts';
import { LITE_PLANETS, LITE_PLAYERS_LOCAL, LITE_PLAYERS_MAP, LITE_SELF, LITE_SOUNDS, LITE_TTS, MESSAGE1_SOUND, MESSAGE2_SOUND, MESSAGE3_SOUND, MESSAGE4_SOUND, MESSAGE5_SOUND, MESSAGE6_SOUND, MESSAGE7_SOUND, MESSAGE8_SOUND, MESSAGE9_SOUND, MESSAGE_SOUND, PFCLOAK, PLREDRAW, base_ogg, generic, pickup, take } from './consts.ts';


export function rcdlite(dist: struct_distress | null): void {
  let message = new Int8Array(100);
  let len = 0;
  if (!dist || !G.distlite[dist.distype]) {
    return;
  }
  len = makedistress(dist, P(message), G.distlite[dist.distype]);
  if (len <= 0) {
    return;
  }
  makelite(dist, P(message));
}

export function litedefaults(): void {
  if (!G.distlite[take]) {
    G.distlite[take] = S("/c/l");
  }
  if (!G.distlite[base_ogg]) {
    G.distlite[base_ogg] = S("/g/m");
  }
  if (!G.distlite[pickup]) {
    G.distlite[pickup] = S("/p");
  }
  if (!G.distlite[generic]) {
    G.distlite[generic] = S("%?%S=SB%{/c%}");
  }
}

function liteplanet(l: struct_planet | null): void {
  G.emph_planet_seq_n[l.pl_no] = Math.imul(G.beep_lite_cycle_time_planet, G.server_ups) / 5 | 0;
  l.pl_flags |= PLREDRAW;
}

function liteplayer(j: struct_player | null): void {
  if (!j || (j.p_flags & PFCLOAK) >>> 0) {
    return;
  }
  G.redrawPlayer[j.p_no] = 1;
  G.emph_player_seq_n[j.p_no] = Math.imul(G.beep_lite_cycle_time_player, G.server_ups) / 5 | 0;
}

function makelite(dist: struct_distress | null, pm: Ptr | null): number {
  let $t1: any, $t2: any;
  let sender = null;
  let j = null;
  let l = null;
  let c = 0;
  sender = $sadd(G.players, dist.sender);
  if (!pm.a[pm.o]) {
    return 0;
  }
  while (pm.a[pm.o]) {
    if (pm.a[pm.o] === 47) {
      pm = pm.add(1);
      if (!pm) {
        continue;
      }
      switch (c = $rd(($t1 = pm, pm = $t1.add(1), $t1))) {
      case 80:
      case 71:
      case 72:
      case 112:
      case 103:
      case 104:
        switch (c) {
        case 112:
          j = $sadd(G.players, dist.tclose_j);
          break;
        case 103:
          j = $sadd(G.players, dist.tclose_fr);
          break;
        case 104:
          j = $sadd(G.players, dist.tclose_en);
          break;
        case 80:
          j = $sadd(G.players, dist.close_j);
          break;
        case 71:
          j = $sadd(G.players, dist.close_fr);
          break;
        default:
          j = $sadd(G.players, dist.close_en);
          break;
        }
        G.liteflag = G.F_beeplite_flags & (LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL);
        liteplayer(j);
        break;
      case 66:
      case 98:
        l = $sadd(G.planets, dist.close_pl);
        if (G.F_beeplite_flags & LITE_PLANETS) {
          liteplanet(l);
        }
        break;
      case 76:
      case 108:
        l = $sadd(G.planets, dist.tclose_pl);
        if (G.F_beeplite_flags & LITE_PLANETS) {
          liteplanet(l);
        }
        break;
      case 85:
      case 117:
        j = $sadd(G.players, dist.tclose_en);
        G.liteflag = G.F_beeplite_flags & (LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL);
        liteplayer(j);
        break;
      case 99:
      case 73:
      case 105:
        G.liteflag = G.F_beeplite_flags & (LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL);
        liteplayer(sender);
        break;
      case 77:
      case 109:
        if (G.F_beeplite_flags & LITE_SELF) {
          G.liteflag = LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL;
          liteplayer(G.me);
        }
        break;
      case 48:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          if (G.sound_toggle) {
            Play_Sound(MESSAGE_SOUND);
          } else {
            W_Beep();
          }
        }
        break;
      case 49:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE1_SOUND);
        }
        break;
      case 50:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE2_SOUND);
        }
        break;
      case 51:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE3_SOUND);
        }
        break;
      case 52:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE4_SOUND);
        }
        break;
      case 53:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE5_SOUND);
        }
        break;
      case 54:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE6_SOUND);
        }
        break;
      case 55:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE7_SOUND);
        }
        break;
      case 56:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE8_SOUND);
        }
        break;
      case 57:
        if (G.F_beeplite_flags & LITE_SOUNDS) {
          Play_Sound(MESSAGE9_SOUND);
        }
        break;
      case 124:
        if (G.F_beeplite_flags & LITE_TTS) {
          for (G.tts_len = 0; pm.a[pm.o] !== 124 && G.tts_len < G.tts_max_len; ++G.tts_len) {
            G.lastIn[G.tts_len] = $rd(($t2 = pm, pm = $t2.add(1), $t2));
          }
          G.lastIn[G.tts_len] = 0;
          G.tts_width = W_TTSTextWidth(P(G.lastIn), G.tts_len);
          G.tts_timer = Math.imul(G.tts_time, G.server_ups) / 5 | 0;
        }
        break;
      default:
        warning(S("Bad Macro character in distress!"));
        fprintf(R.stderr, S("Unrecognizable special character in distress pass 1: %c\n"), $rd(pm.add(-1)));
        break;
      }
    } else {
      pm = pm.add(1);
    }
  }
  return 1;
}

export function $init(): void {
}
