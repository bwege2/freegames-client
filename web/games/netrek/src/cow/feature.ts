// @ts-nocheck
// COW 3.3.3 feature.c, translated to TypeScript by re/netrek/tools/c2ts (do not edit).
import { strcmpi } from './defaults.ts';
import { sendServerPacket } from './socket.ts';
import { W_WriteText } from './x11window.ts';
import { struct_feature, struct_feature_cpacket, struct_player_spacket } from './structs.ts';
import { $cast, $rd, $sadd, $sarrOf, $wr, G, P, R, S, bzero, fprintf, htonl, memccpy, ntohl, printf, sprintf, strcat, strcmp, strcpy, strlen } from '../rt/index.ts';
import { CP_FEATURE, GENERIC_32_VERSION, LITE_COLOR, LITE_PLANETS, LITE_PLAYERS_LOCAL, LITE_PLAYERS_MAP, LITE_SELF, LITE_SOUNDS, LITE_TTS } from './consts.ts';

let _dummy: any;

export function checkFeature(packet: struct_feature_cpacket | null): void {
  let i = 0;
  let value = ntohl(packet.value >>> 0) | 0;
  let buf = new Int8Array(100);
  sprintf(P(buf), S("%s: %s(%d)"), P(packet.name, 0), value === 1 ? S("ON") : value === 0 ? S("OFF") : S("UNKNOWN"), value);
  W_WriteText(G.toolsWin, 0, 0, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
  for (i = 0; !!G.features[i].name; ++i) {
    if (strcmpi(P(packet.name), G.features[i].name) === 0) {
      $wr(G.features[i].var, 0, value === -1 ? G.features[i].feature_type === 83 ? 0 : G.features[i].value : value);
      if (G.features[i].arg1) {
        $wr(G.features[i].arg1, 0, packet.arg1);
      }
      if (G.features[i].arg2) {
        $wr(G.features[i].arg2, 0, packet.arg2);
      }
      break;
    }
  }
  if (strcmpi(P(packet.name), S("FPS")) === 0 && value !== -1) {
    G.server_fps = value;
    if (G.client_ups > G.server_fps) {
      fprintf(R.stderr, S("server FPS of %d limits your updatespersec\n"), value);
      G.client_ups = G.server_fps;
    }
    return;
  }
  if (strcmpi(P(packet.name), S("UPS")) === 0 && value !== -1) {
    G.server_ups = value;
    if (G.client_ups > G.server_ups) {
      fprintf(R.stderr, S("server UPS of %d limits your updatespersec\n"), value);
      G.client_ups = G.server_ups;
    }
    return;
  }
  if (!G.features[i].name) {
    printf(S("Feature %s from server unknown to client!\n"), P(packet.name));
  }
  if (strcmpi(P(packet.name), S("FEATURE_PACKETS")) === 0) {
    reportFeatures();
  }
  if (strcmpi(P(packet.name), S("FEATURE_PACKETS")) === 0) {
    if (value === -1) {
      G.F_agri_pix = 0;
    }
  }
  if (strcmpi(P(packet.name), S("RC_DISTRESS")) === 0 && G.gen_distress) {
    G.distmacro = G.dist_prefered[0];
  }
  if (strcmpi(P(packet.name), S("BEEPLITE")) === 0) {
    switch (value) {
    case -1:
      G.F_beeplite_flags = LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL | LITE_SELF | LITE_PLANETS | LITE_SOUNDS | LITE_COLOR | LITE_TTS;
      break;
    case 1:
      if (G.F_beeplite_flags === 0) {
        G.F_beeplite_flags = LITE_PLAYERS_MAP | LITE_PLAYERS_LOCAL | LITE_SELF | LITE_PLANETS | LITE_SOUNDS | LITE_COLOR | LITE_TTS;
      }
      strcpy(P(buf), S("  disabled:"));
      if (!(G.F_beeplite_flags & LITE_PLAYERS_MAP)) {
        strcat(P(buf), S(" LITE_PLAYERS_MAP"));
      }
      if (!(G.F_beeplite_flags & LITE_PLAYERS_LOCAL)) {
        strcat(P(buf), S(" LITE_PLAYERS_LOCAL"));
      }
      if (!(G.F_beeplite_flags & LITE_SELF)) {
        strcat(P(buf), S(" LITE_SELF"));
      }
      if (!(G.F_beeplite_flags & LITE_PLANETS)) {
        strcat(P(buf), S(" LITE_PLANETS"));
      }
      if (!(G.F_beeplite_flags & LITE_SOUNDS)) {
        strcat(P(buf), S(" LITE_SOUNDS\n"));
      }
      if (!(G.F_beeplite_flags & LITE_COLOR)) {
        strcat(P(buf), S(" LITE_COLOR"));
      }
      if (!(G.F_beeplite_flags & LITE_TTS)) {
        strcat(P(buf), S(" LITE_TTS"));
      }
      if (strcmp(P(buf), S("  disabled:"))) {
        W_WriteText(G.toolsWin, 0, 0, G.textColor, P(buf), strlen(P(buf)) | 0, G.W_RegularFont);
      }
      break;
    case 0:
      G.F_beeplite_flags = 0;
      break;
    default:
      break;
    }
  }
}

export function sendFeature(name: Ptr | null, feature_type: number, value: number, arg1: number, arg2: number): void {
  let packet = new struct_feature_cpacket();
  bzero(packet, 88);
  memccpy(P(packet.name), name, 0, 80);
  packet.type = CP_FEATURE;
  packet.name[80 - 1] = 0;
  packet.feature_type = feature_type;
  packet.value = htonl(value >>> 0) | 0;
  packet.arg1 = arg1;
  packet.arg2 = arg2;
  sendServerPacket($cast(struct_player_spacket, packet));
}

export function reportFeatures(): void {
  let f = null;
  let value = 0;
  let arg1 = 0;
  let arg2 = 0;
  for (f = G.features[0]; !!f.name; f = $sadd(f, 1)) {
    if (strcmpi(f.name, S("FEATURE_PACKETS")) !== 0) {
      value = f.value;
      arg1 = (f.arg1 ? f.arg1.a[f.arg1.o] : 0) << 24 >> 24;
      arg2 = (f.arg2 ? f.arg2.a[f.arg2.o] : 0) << 24 >> 24;
      if (!strcmp(f.name, S("SP_GENERIC_32"))) {
        value = 1;
        arg1 = GENERIC_32_VERSION;
      }
      sendFeature(f.name, f.feature_type, value, arg1, arg2);
    }
  }
}

export function handleFeature(packet: struct_feature_cpacket | null): void {
  packet = $cast(struct_feature_cpacket, packet);
  checkFeature(packet);
}

export function $init(): void {
  _dummy = new Int32Array(1);
  _dummy[0] = 0;
  G.features = $sarrOf([struct_feature.$of(S("FEATURE_PACKETS"), P(G, "F_feature_packets"), 83, 1),
struct_feature.$of(S("SHOW_ALL_TRACTORS"), P(G, "F_show_all_tractors"), 83, 1),
struct_feature.$of(S("CONTINUOUS_MOUSE"), P(G, "motion_mouse_enablable"), 67, 1),
struct_feature.$of(S("CONTINUOUS_STEER"), P(G, "motion_mouse_steering"), 67),
struct_feature.$of(S("NEWMACRO"), P(G, "UseNewMacro"), 67, 1),
struct_feature.$of(S("SMARTMACRO"), P(G, "UseSmartMacro"), 67, 1),
struct_feature.$of(S("WHY_DEAD"), P(G, "why_dead"), 83, 1),
struct_feature.$of(S("RC_DISTRESS"), P(G, "gen_distress"), 83, 1),
struct_feature.$of(S("MULTIMACROS"), P(G, "multiline_enabled"), 83, 1),
struct_feature.$of(S("SBHOURS"), P(G, "SBhours"), 83, 1),
struct_feature.$of(S("CLOAK_MAXWARP"), P(G, "F_cloak_maxwarp"), 83, 1),
struct_feature.$of(S("SELF_8FLAGS"), P(G, "F_self_8flags"), 83, 1),
struct_feature.$of(S("SELF_8FLAGS2"), P(G, "F_self_8flags2"), 83),
struct_feature.$of(S("SHIP_CAP"), P(G, "F_ship_cap"), 83, 1),
struct_feature.$of(S("SP_GENERIC_32"), P(G, "F_sp_generic_32"), 83, 1, P(G, "A_sp_generic_32")),
struct_feature.$of(S("BEEPLITE"), P(_dummy, 0), 67, 1, P(G, "F_beeplite_flags")),
struct_feature.$of(S("AGRI_PIXMAP"), P(G, "F_agri_pix"), 67, 1),
struct_feature.$of(S("MANY_SELF"), P(G, "F_many_self"), 83),
struct_feature.$of(S("LAME_BASE_REFIT"), P(_dummy, 0), 83),
struct_feature.$of(S("UPS"), P(_dummy, 0), 83),
struct_feature.$of(S("FPS"), P(_dummy, 0), 83),
struct_feature.$of(S("SP_RANK"), P(G, "F_sp_rank"), 83, 1),
struct_feature.$of(S("SP_LTD"), P(G, "F_sp_ltd"), 83, 1),
struct_feature.$of(S("TIPS"), P(G, "F_tips"), 83, 1),
struct_feature.$of()]);
}
