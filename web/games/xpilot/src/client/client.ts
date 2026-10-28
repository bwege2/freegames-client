// client.c: the client's model of the world, filled by the packet handlers (Handle_*), the map from
// the setup (init_polymap), and the frame timing. The block map code (oldServer: servers before
// 4.F.0.9, whose setup is a block map) is not ported: this client speaks 4.F.1.5 only.
import { G, newOther } from './G.ts';
import type { other_t, homebase_t, debris_t, ipos_t } from './G.ts';
import {
  BLOCK_SZ, MAX_STATION_FUEL, TEAM_PLAY, MAX_TEAMS, SETUP_BASE_RIGHT, SETUP_BASE_UP, SETUP_BASE_LEFT, SETUP_BASE_DOWN,
  DEBRIS_TYPES, FUEL_NOTIFY_TIME, OLD_GAME_OVER, OLD_PAUSE, OLD_PLAYING, RES, MAX_POINTER_MOVES, TARGET_DAMAGE,
  RadarEnemy, RadarFriend, MAX_CHARS,
} from './consts.ts';
import { BIT, onReset, sprintf, strcasecmp, strlcpy, strncasecmp } from './cutil.ts';
import { Calculate_shield_radius, Convert_shape_str, Parse_shape_str, type shipshape_t } from './shipshape.ts';
import { Make_table } from './xpmath.ts';
import { warn } from './error.ts';
import { sys } from './sys.ts';
import { Add_message, Alloc_history, Alloc_msgs, Free_msgs, Free_selectionAndHistory } from './messages.ts';
import { Paint_frame, Paint_init, Paint_cleanup, Play_beep } from './xpaint.ts';
import { Radar_hide_target, Radar_show_target } from './paintradar.ts';
import { Bitmap_add } from './bitmaps.ts';
import { Colors_init_style_colors } from './colors.ts';
import { Init_playing_windows, Raise_window, Platform_specific_cleanup } from './xinit.ts';
import { Key_init, Reset_shields, Pointer_control_set_state } from './event.ts';
import { Send_pointer_move, Net_cleanup, Client_fps_request } from './netclient.ts';
import { crippleTalk } from './clientcommand.ts';
import { ClientExit } from './sys.ts';
import { audioUpdate } from './caudio.ts';

// ---------------------------------------------------------------- map objects

export function Handle_fuel(ind: number, fuel: number): number {
  if (ind < 0 || ind >= G.num_fuels) {
    warn(`Bad fuelstation index (${ind})`);
    return -1;
  }
  G.fuels[ind].fuel = fuel;
  return 0;
}

export function Handle_cannon(ind: number, dead_time: number): number {
  if (ind < 0 || ind >= G.num_cannons) {
    warn(`Bad cannon index (${ind})`);
    return 0;
  }
  G.cannons[ind].dead_time = dead_time;
  return 0;
}

export function Handle_target(num: number, dead_time: number, damage: number): number {
  if (num < 0 || num >= G.num_targets) {
    warn(`Bad target index (${num})`);
    return 0;
  }
  if (dead_time === 0 && (damage <= 0.0 || damage > TARGET_DAMAGE)) warn(`BUG target ${num}, dead ${dead_time}, damage ${damage}`);
  const t = G.targets[num];
  const sy = G.Setup!.y;
  if (t.dead_time > 0 && dead_time === 0) Radar_show_target(Math.trunc(t.pos / sy), t.pos % sy);
  else if (t.dead_time === 0 && dead_time > 0) Radar_hide_target(Math.trunc(t.pos / sy), t.pos % sy);
  t.dead_time = dead_time;
  t.damage = damage;
  return 0;
}

export function Target_by_index(ind: number): { x: number; y: number; dead_time: number; damage: number } | null {
  if (ind < 0 || ind >= G.num_targets) return null;
  const t = G.targets[ind];
  return { x: Math.trunc(t.pos / G.Setup!.y), y: t.pos % G.Setup!.y, dead_time: t.dead_time, damage: t.damage };
}

export function Handle_base(id: number, ind: number): number {
  if (ind < 0 || ind >= G.num_bases) {
    warn(`Bad homebase index (${ind})`);
    return -1;
  }
  for (let i = 0; i < G.num_bases; i++) if (G.bases[i].id === id) G.bases[i].id = -1;
  G.bases[ind].id = id;
  return 0;
}

export function Check_pos_by_index(ind: number): [number, number] {
  if (ind < 0 || ind >= G.num_checks) {
    warn(`Bad checkpoint index (${ind})`);
    return [0, 0];
  }
  return [Math.trunc(G.checks[ind].pos / G.Setup!.y), G.checks[ind].pos % G.Setup!.y];
}

// ---------------------------------------------------------------- the map from the setup

function parse_styles(b: Uint8Array, p: number): number {
  const get32 = () => { const v = (b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]; p += 4; return v | 0; };
  G.num_polygon_styles = b[p++];
  G.num_edge_styles = b[p++];
  const num_bmaps = b[p++];
  G.polygon_styles = [];
  G.edge_styles = [];
  for (let i = 0; i < Math.max(1, G.num_polygon_styles); i++) G.polygon_styles.push({ color: 0, rgb: 0, texture: 0, flags: 0, def_edge_style: 0 });
  for (let i = 0; i < Math.max(1, G.num_edge_styles); i++) G.edge_styles.push({ width: 0, color: 0, rgb: 0, style: 0 });
  for (let i = 0; i < G.num_polygon_styles; i++) {
    const ps = G.polygon_styles[i];
    ps.rgb = get32();
    ps.texture = b[p++];
    ps.def_edge_style = b[p++];
    ps.flags = b[p++];
  }
  if (G.num_polygon_styles === 0) {
    G.polygon_styles[0].flags = 0;
    G.polygon_styles[0].def_edge_style = 0;
    G.num_polygon_styles = 1;
  }
  for (let i = 0; i < G.num_edge_styles; i++) {
    const es = G.edge_styles[i];
    es.width = (b[p++] << 24) >> 24;
    es.rgb = get32();
    es.style = b[p] === 1 ? 1 : b[p] === 2 ? 2 : 0;
    p++;
  }
  for (let i = 0; i < num_bmaps; i++) {
    let fname = '';
    let k = p;
    while (b[k] !== 0) fname += String.fromCharCode(b[k++]);
    fname = strlcpy(fname, 30);
    p += fname.length + 1;
    const flags = b[p++];
    Bitmap_add(fname, 1, flags !== 0);
  }
  return p;
}

function init_polymap(): number {
  G.oldServer = 0;
  const b = G.Setup!.map_data;
  const get_ushort = (): number => { const v = (b[p] << 8) | b[p + 1]; p += 2; return v; };
  const get_short = (): number => { const v = (b[p] << 8) | b[p + 1]; p += 2; return (v << 16) >> 16; };
  let p = parse_styles(b, 0);
  G.num_polygons = get_ushort();
  G.polygons = [];
  for (let i = 0; i < G.num_polygons; i++) {
    const style = b[p++];
    let current_estyle = G.polygon_styles[style].def_edge_style;
    let ecount = get_ushort();
    let ep = p;
    const eget = (): number => { const v = (b[ep] << 8) | b[ep + 1]; ep += 2; return v; };
    let edgechange = ecount ? eget() : 0x7fffffff;
    p += ecount * 2;
    const pc = get_ushort();
    const points: ipos_t[] = new Array(pc);
    const styles: number[] | null = ecount ? new Array(pc).fill(0) : null;
    const startx = get_ushort(), starty = get_ushort();
    let cx = startx, cy = starty;
    let minx = startx, maxx = startx, miny = starty, maxy = starty;
    points[0] = { x: startx, y: starty };
    if (!edgechange) {
      current_estyle = eget();
      ecount--;
      if (ecount) edgechange = eget();
    }
    if (styles) styles[0] = current_estyle;
    for (let j = 1; j < pc; j++) {
      const dx = get_short(), dy = get_short();
      cx += dx;
      cy += dy;
      if (minx > cx) minx = cx;
      if (miny > cy) miny = cy;
      if (maxx < cx) maxx = cx;
      if (maxy < cy) maxy = cy;
      points[j] = { x: dx, y: dy };
      if (edgechange === j) {
        current_estyle = eget();
        ecount--;
        if (ecount) edgechange = eget();
      }
      if (styles) styles[j] = current_estyle;
    }
    G.polygons.push({ points, edge_styles: styles, num_points: pc, bounds: { x: minx, y: miny, w: maxx - minx, h: maxy - miny }, style });
  }
  G.num_bases = b[p++];
  G.bases = [];
  for (let i = 0; i < G.num_bases; i++) {
    const team = b[p++];
    const cx = get_ushort(), cy = get_ushort();
    const d = b[p];
    const type = d < 16 ? SETUP_BASE_RIGHT : d < 48 ? SETUP_BASE_UP : d < 80 ? SETUP_BASE_LEFT : d < 112 ? SETUP_BASE_DOWN : SETUP_BASE_RIGHT;
    p++;
    G.bases.push({ pos: 0, id: -1, team, bounds: { x: cx - Math.trunc(BLOCK_SZ / 2), y: cy - Math.trunc(BLOCK_SZ / 2), w: BLOCK_SZ, h: BLOCK_SZ }, type, appeartime: 0 });
  }
  G.num_fuels = get_ushort();
  G.fuels = [];
  for (let i = 0; i < G.num_fuels; i++) {
    const cx = get_ushort(), cy = get_ushort();
    G.fuels.push({ pos: 0, fuel: MAX_STATION_FUEL, bounds: { x: cx - Math.trunc(BLOCK_SZ / 2), y: cy - Math.trunc(BLOCK_SZ / 2), w: BLOCK_SZ, h: BLOCK_SZ } });
  }
  G.num_checks = b[p++];
  G.checks = [];
  for (let i = 0; i < G.num_checks; i++) {
    const cx = get_ushort(), cy = get_ushort();
    G.checks.push({ pos: 0, bounds: { x: cx - Math.trunc(BLOCK_SZ / 2), y: cy - Math.trunc(BLOCK_SZ / 2), w: BLOCK_SZ, h: BLOCK_SZ } });
  }
  // the map's textures from data_url (mapdata.c Mapdata_setup) are not fetched: the port's server
  // sends no data_url, and the textures of lib/textures are the client's own
  Colors_init_style_colors();
  return 0;
}

function Map_cleanup(): void {
  G.num_bases = 0; G.bases = [];
  G.num_fuels = 0; G.fuels = [];
  G.num_targets = 0; G.targets = [];
  G.num_cannons = 0; G.cannons = [];
}

// ---------------------------------------------------------------- players

export function Homebase_by_id(id: number): homebase_t | null {
  if (id !== -1) for (let i = 0; i < G.num_bases; i++) if (G.bases[i].id === id) return G.bases[i];
  return null;
}

export function Other_by_id(id: number): other_t | null {
  if (id !== -1) for (let i = 0; i < G.num_others; i++) if (G.Others[i].id === id) return G.Others[i];
  return null;
}

export function Other_by_name(name: string | null, show_error_msg: boolean): other_t | null {
  let found: other_t | null = null;
  const len = name ? name.length : 0;
  if (!name || len === 0) {
    if (show_error_msg) Add_message('Name does not match any player. [*Client reply*]');
    return null;
  }
  for (let i = 0; i < G.num_others; i++) if (!strcasecmp(G.Others[i].nick_name, name)) return G.Others[i];
  for (let i = 0; i < G.num_others; i++) {
    const o = G.Others[i];
    if (!strncasecmp(o.nick_name, name, len)) {
      if (found) { if (show_error_msg) Add_message('Name matches several players. [*Client reply*]'); return null; }
      found = o;
    }
  }
  if (found) return found;
  for (let i = 0; i < G.num_others; i++) {
    const o = G.Others[i];
    for (let j = 0; j < 1 + o.nick_name.length - len; j++) {
      if (!strncasecmp(o.nick_name.slice(j), name, len)) {
        if (found) { if (show_error_msg) Add_message('Name matches several players. [*Client reply*]'); return null; }
        found = o;
        break;
      }
    }
  }
  if (found) return found;
  if (show_error_msg) Add_message('Name does not match any player. [*Client reply*]');
  return null;
}

export function Ship_by_id(id: number): shipshape_t {
  const other = Other_by_id(id);
  if (!other) return Parse_shape_str(null);
  return other.ship!;
}

export function Handle_leave(id: number): number {
  const other = Other_by_id(id);
  if (other) {
    if (other === G.self) {
      warn('Self left?!');
      G.self = null;
    }
    other.ship = null;
    if (other.mychar !== 0x54 && other.mychar !== 0x52) Add_message(sprintf('%s left this world.', other.nick_name));
    G.num_others--;
    const k = G.Others.indexOf(other);
    for (let i = k; i < G.num_others; i++) Object.assign(G.Others[i], G.Others[i + 1]);
    G.scoresChanged = 1;
  }
  return 0;
}

export function Handle_player(id: number, player_team: number, mychar: number, nick_name: string, user_name: string,
  host_name: string, shape: string, myself: number): number {
  if (BIT(G.Setup!.mode, TEAM_PLAY) && (player_team < 0 || player_team >= MAX_TEAMS)) {
    warn(`Illegal team ${player_team} for received player, setting to 0`);
    player_team = 0;
  }
  let other = Other_by_id(id);
  if (!other) {
    if (G.num_others >= G.max_others) {
      G.max_others += 5;
      while (G.Others.length < G.max_others) G.Others.push(newOther());
    }
    other = G.Others[G.num_others++];
  }
  if (G.self === null && (myself || (G.version < 0x4f10 && G.connectParam.nick_name === nick_name))) {
    if (other !== G.Others[0]) {
      // make 'self' the first member of Others[]
      Object.assign(other, G.Others[0]);
      other = G.Others[0];
    }
    G.self = other;
  }
  Object.assign(other, newOther());
  other.id = id;
  other.team = player_team;
  other.mychar = mychar;
  other.nick_name = strlcpy(nick_name, MAX_CHARS);
  other.user_name = strlcpy(user_name, MAX_CHARS);
  other.host_name = strlcpy(host_name, MAX_CHARS);
  other.id_string = strlcpy(nick_name, MAX_CHARS);
  other.max_chars_in_names = -1;
  G.scoresChanged = 1;
  other.ship = Convert_shape_str(shape);
  Calculate_shield_radius(other.ship);
  return 0;
}

export function Handle_team(id: number, pl_team: number): number {
  const other = Other_by_id(id);
  if (!other) {
    warn(`Received packet to change team for nonexistent id ${id}`);
    return 0;
  }
  if (BIT(G.Setup!.mode, TEAM_PLAY) && (pl_team < 0 || pl_team >= MAX_TEAMS)) {
    warn(`Illegal team ${pl_team} received for player id ${id}`);
    return 0;
  }
  other.team = pl_team;
  G.scoresChanged = 1;
  return 0;
}

export function Handle_score(id: number, score: number, life: number, mychar: number, alliance: number): number {
  const other = Other_by_id(id);
  if (!other) {
    warn(sprintf("Can't update score for non-existing player %d,%.2f,%d", id, score, life));
    return 0;
  }
  if (other.score !== score || other.life !== life || other.mychar !== mychar || other.alliance !== alliance) {
    other.score = score;
    other.life = life;
    other.mychar = mychar;
    other.alliance = alliance;
    G.scoresChanged = 1;
  }
  return 0;
}

export function Handle_team_score(team: number, score: number): number {
  if (G.teamscores[team] !== score) {
    G.teamscores[team] = score;
    G.scoresChanged = 1;
  }
  return 0;
}

export function Handle_timing(id: number, check: number, round: number, tloops: number): number {
  const other = Other_by_id(id);
  if (!other) {
    warn(`Can't update timing for non-existing player ${id},${check},${round}`);
    return 0;
  }
  if (other.check !== check || other.round !== round) {
    other.check = check;
    other.round = round;
    other.timing = (round * G.num_checks + check) << 16 >> 16;
    other.timing_loops = tloops;
    G.scoresChanged = 1;
  }
  return 0;
}

export function Using_score_decimals(): boolean {
  return G.showScoreDecimals > 0 && G.version >= 0x4500 && (G.version < 0x4f09 || G.version >= 0x4f11);
}

export function Handle_score_object(score: number, x: number, y: number, msg: string): number {
  const sobj = G.score_objects[G.score_object];
  sobj.score = score;
  sobj.x = x;
  sobj.y = y;
  sobj.life_time = G.scoreObjectTime;
  const round = () => Math.trunc(score >= 0.0 ? score + 0.5 : score - 0.5);
  if (msg.length) {
    sobj.hud_msg = Using_score_decimals() ? sprintf('%s %.*f', msg, G.showScoreDecimals, score) : sprintf('%s %d', msg, round());
    sobj.hud_msg_len = sobj.hud_msg.length;
    sobj.hud_msg_width = -1;
  } else sobj.hud_msg_len = 0;
  sobj.msg = Using_score_decimals() ? sprintf('%.*f', G.showScoreDecimals, score) : sprintf('%d', round());
  sobj.msg_len = sobj.msg.length;
  sobj.msg_width = -1;
  G.score_object = (G.score_object + 1) % G.score_objects.length;
  return 0;
}

// ---------------------------------------------------------------- frames

export function Handle_start(server_loops: number): number {
  if (sys.onFrame) sys.onFrame(server_loops);
  G.start_loops = server_loops;
  G.num_refuel = 0;
  G.num_connector = 0;
  G.num_missile = 0;
  G.num_ball = 0;
  G.num_ship = 0;
  G.num_mine = 0;
  G.num_itemtype = 0;
  G.num_ecm = 0;
  G.num_trans = 0;
  G.num_paused = 0;
  G.num_radar = 0;
  G.num_vcannon = 0;
  G.num_vfuel = 0;
  G.num_vbase = 0;
  G.num_vdecor = 0;
  for (let i = 0; i < DEBRIS_TYPES; i++) G.num_debris[i] = 0;
  G.damaged = 0;
  G.destruct = 0;
  G.shutdown_delay = 0;
  G.shutdown_count = -1;
  G.eyesId = G.self !== null ? G.self.id : 0;
  G.eyes = Other_by_id(G.eyesId);
  G.thrusttime = -1;
  G.shieldtime = -1;
  G.phasingtime = -1;
  return 0;
}

const T = { frame_counter: 0, old_sec: 0, old_usec: 0, old_status: 0 };
onReset(() => Object.assign(T, { frame_counter: 0, old_sec: 0, old_usec: 0, old_status: 0 }));

function update_timing(): void {
  T.frame_counter++;
  const now = sys.nowUs();
  const sec = Math.floor(now / 1e6), usec = now - sec * 1e6;
  if (sec !== T.old_sec) {
    G.currentTime = sys.time();
    const usecs = 1e6 + (usec - T.old_usec);
    const fps = (1e6 * T.frame_counter) / usecs;
    T.old_sec = sec;
    T.old_usec = usec;
    G.newSecond = true;
    G.clientFPS = Math.max(1.0, fps);
    T.frame_counter = 0;
  } else G.newSecond = false;
}

export function Handle_end(server_loops: number): number {
  G.end_loops = server_loops;
  G.snooping = G.self !== null && G.eyesId !== G.self.id;
  update_timing();
  if (sys.onFrameEnd) sys.onFrameEnd(server_loops);
  Paint_frame();
  if (sys.sound) audioUpdate();
  return 0;
}

export function Handle_self_items(newNumItems: Uint8Array): number {
  G.numItems.set(newNumItems);
  return 0;
}

function update_status(status: number): void {
  const old = T.old_status;
  if (BIT(old, OLD_GAME_OVER) && !BIT(status, OLD_GAME_OVER) && !BIT(status, OLD_PAUSE)) Raise_window();
  if (BIT(old, OLD_PLAYING | OLD_PAUSE | OLD_GAME_OVER) !== OLD_PLAYING) {
    if (BIT(status, OLD_PLAYING | OLD_PAUSE | OLD_GAME_OVER) === OLD_PLAYING) Reset_shields();
  }
  T.old_status = status;
}

export function Handle_self(x: number, y: number, vx: number, vy: number, newHeading: number, newPower: number,
  newTurnspeed: number, newTurnresistance: number, newLockId: number, newLockDist: number, newLockBearing: number,
  newNextCheckPoint: number, newAutopilotLight: number, newNumItems: Uint8Array, newCurrentTank: number,
  newFuelSum: number, newFuelMax: number, newPacketSize: number, status: number): number {
  G.selfPos.x = x;
  G.selfPos.y = y;
  G.selfVel.x = vx;
  G.selfVel.y = vy;
  G.heading = newHeading;
  G.displayedPower = newPower;
  G.displayedTurnspeed = newTurnspeed;
  G.displayedTurnresistance = newTurnresistance;
  G.lock_id = newLockId;
  G.lock_dist = newLockDist;
  G.lock_dir = newLockBearing;
  G.nextCheckPoint = newNextCheckPoint;
  G.autopilotLight = newAutopilotLight;
  G.numItems.set(newNumItems);
  G.fuelCurrent = newCurrentTank;
  if (newFuelSum > G.fuelSum && G.selfVisible) G.fuelTime = FUEL_NOTIFY_TIME;
  G.fuelSum = newFuelSum;
  G.fuelMax = newFuelMax;
  G.selfVisible = 0;
  if (newPacketSize + 16 < G.packet_size) G.packet_size -= 16;
  else G.packet_size = newPacketSize;
  update_status(status);
  return 0;
}

export function Handle_eyes(id: number): number {
  G.eyesId = id;
  G.eyes = Other_by_id(G.eyesId);
  return 0;
}

export function Handle_damaged(dam: number): number { G.damaged = dam; return 0; }
export function Handle_modifiers(m: string): number { G.mods = m; return 0; }
export function Handle_destruct(count: number): number { G.destruct = count; return 0; }
export function Handle_shutdown(count: number, delay: number): number { G.shutdown_count = count; G.shutdown_delay = delay; return 0; }
export function Handle_thrusttime(count: number, max: number): number { G.thrusttime = count; G.thrusttimemax = max; return 0; }
export function Handle_shieldtime(count: number, max: number): number { G.shieldtime = count; G.shieldtimemax = max; return 0; }
export function Handle_phasingtime(count: number, max: number): number { G.phasingtime = count; G.phasingtimemax = max; return 0; }
export function Handle_rounddelay(count: number, max: number): number { G.roundDelay = count; G.roundDelayMax = max; return 0; }

/** STORE(): P[N++] = V */
function store<T>(arr: T[], n: number, v: T): number {
  arr[n] = v;
  return n + 1;
}

export function Handle_refuel(x0: number, y0: number, x1: number, y1: number): number {
  G.num_refuel = store(G.refuel_ptr, G.num_refuel, { x0, y0, x1, y1 });
  return 0;
}

export function Handle_connector(x0: number, y0: number, x1: number, y1: number, tractor: number): number {
  G.num_connector = store(G.connector_ptr, G.num_connector, { x0, y0, x1, y1, tractor });
  return 0;
}

export function Handle_laser(color: number, x: number, y: number, len: number, dir: number): number {
  G.num_laser = store(G.laser_ptr, G.num_laser, { color, x, y, len, dir });
  return 0;
}

export function Handle_missile(x: number, y: number, len: number, dir: number): number {
  G.num_missile = store(G.missile_ptr, G.num_missile, { x, y, dir, len });
  return 0;
}

export function Handle_ball(x: number, y: number, id: number, style: number): number {
  G.num_ball = store(G.ball_ptr, G.num_ball, { x, y, id, style });
  return 0;
}

function predict_self_dir(received_dir: number): number {
  let pointer_delta = 0;
  let ind = G.pointer_move_next - 1;
  let count = 0;
  if (ind < 0) ind = MAX_POINTER_MOVES - 1;
  while (G.pointer_moves[ind].id > G.last_keyboard_ack && count < 50) {
    pointer_delta += G.pointer_moves[ind].movement * G.pointer_moves[ind].turnspeed;
    ind--;
    if (ind < 0) ind = MAX_POINTER_MOVES - 1;
    count++;
  }
  const dir_delta = pointer_delta / (RES / 2);
  let new_dir = received_dir - dir_delta;
  while (new_dir < 0) new_dir += RES;
  while (new_dir >= RES) new_dir -= RES;
  let int_new_dir = Math.trunc(new_dir + 0.5);
  while (int_new_dir >= RES) int_new_dir -= RES;
  return int_new_dir;
}

export function Handle_ship(x: number, y: number, id: number, dir: number, shield: number, cloak: number, eshield: number,
  phased: number, deflector: number): number {
  const d = G.dirPrediction && G.self && G.self.id === id ? predict_self_dir(dir) : dir;
  G.num_ship = store(G.ship_ptr, G.num_ship, { x, y, id, dir: d, shield, cloak, eshield, phased, deflector });
  if (!G.selfVisible && ((x === G.selfPos.x && y === G.selfPos.y) || (G.self && id === G.self.id))) {
    G.eyesId = id;
    G.eyes = Other_by_id(G.eyesId);
    if (G.eyes !== null) G.eyeTeam = G.eyes.team;
    G.selfVisible = G.self && id === G.self.id ? 1 : 0;
    return Handle_radar(x, y, 3);
  }
  return 0;
}

export function Handle_mine(x: number, y: number, teammine: number, id: number): number {
  G.num_mine = store(G.mine_ptr, G.num_mine, { x, y, teammine, id });
  return 0;
}

export function Handle_item(x: number, y: number, type: number): number {
  G.num_itemtype = store(G.itemtype_ptr, G.num_itemtype, { x, y, type });
  return 0;
}

/** Handle_fastshot/Handle_debris: the type's array becomes these points */
export function Handle_fastshot(type: number, p: debris_t[]): number {
  G.fastshot_ptr[type] = p.map((q) => ({ x: q.x, y: q.y }));
  G.num_fastshot[type] = p.length;
  return 0;
}

export function Handle_debris(type: number, p: debris_t[]): number {
  G.debris_ptr[type] = p.map((q) => ({ x: q.x, y: q.y }));
  G.num_debris[type] = p.length;
  return 0;
}

export function Handle_wreckage(x: number, y: number, wrecktype: number, size: number, rotation: number): number {
  G.num_wreckage = store(G.wreckage_ptr, G.num_wreckage, { x, y, wrecktype, size, rotation });
  return 0;
}

export function Handle_asteroid(x: number, y: number, type: number, size: number, rotation: number): number {
  G.num_asteroids = store(G.asteroid_ptr, G.num_asteroids, { x, y, type, size, rotation });
  return 0;
}

export function Handle_wormhole(x: number, y: number): number {
  G.num_wormholes = store(G.wormhole_ptr, G.num_wormholes, { x: x - Math.trunc(BLOCK_SZ / 2), y: y - Math.trunc(BLOCK_SZ / 2) });
  return 0;
}

export function Handle_polystyle(polyind: number, newstyle: number): number {
  G.polygons[polyind].style = newstyle;
  G.UpdateRadar = true;
  return 0;
}

export function Handle_ecm(x: number, y: number, size: number): number {
  G.num_ecm = store(G.ecm_ptr, G.num_ecm, { x, y, size });
  return 0;
}

export function Handle_trans(x1: number, y1: number, x2: number, y2: number): number {
  G.num_trans = store(G.trans_ptr, G.num_trans, { x1, y1, x2, y2 });
  return 0;
}

export function Handle_paused(x: number, y: number, count: number): number {
  G.num_paused = store(G.paused_ptr, G.num_paused, { x, y, count });
  return 0;
}

export function Handle_appearing(x: number, y: number, id: number, count: number): number {
  G.num_appearing = store(G.appearing_ptr, G.num_appearing, { x, y, id, count });
  return 0;
}

export function Handle_fastradar(x: number, y: number, size: number): number {
  let type = RadarEnemy;
  if ((size & 0x80) !== 0) {
    type = RadarFriend;
    size &= ~0x80;
  }
  G.num_radar = store(G.radar_ptr, G.num_radar, { x, y, size, type });
  return 0;
}

export function Handle_radar(x: number, y: number, size: number): number {
  return Handle_fastradar(Math.trunc((x * G.RadarWidth) / G.Setup!.width + 0.5), Math.trunc((y * G.RadarHeight) / G.Setup!.height + 0.5), size);
}

export function Handle_message(msg: string): number {
  if (msg.length && msg[msg.length - 1] === ']') {
    let i: number;
    for (i = msg.length - 1; i > 0; i--) if (msg[i - 1] === ' ' && msg[i] === '[') break;
    if (i === 0) {
      Add_message(msg);
      return 0;
    }
    let ignoree = msg.slice(i + 1);
    const k = ignoree.indexOf(']');
    if (k >= 0) ignoree = ignoree.slice(0, k);
    const other = Other_by_name(ignoree, false);
    if (other === null || other.ignorelevel <= 0) {
      Add_message(msg);
      return 0;
    }
    if (other.ignorelevel >= 2) return 0;
    Add_message(crippleTalk(msg));
  } else Add_message(msg);
  return 0;
}

export function Handle_time_left(sec: number): number {
  if (sec >= 0 && sec < 10 && (G.time_left > sec || sec === 0)) Play_beep();
  G.time_left = sec >= 0 ? sec : 0;
  return 0;
}

// ---------------------------------------------------------------- start and end

export function Client_init(server: string, server_version: number): number {
  G.version = server_version;
  G.oldServer = server_version < 0x4f09 ? 1 : 0;
  Make_table();
  if (Paint_init() === -1) return -1;
  G.servername = strlcpy(server, MAX_CHARS);
  return 0;
}

export function Client_setup(): number {
  if (G.oldServer) {
    warn('Block map servers (before 4.F.0.9) are not supported');
    return -1;
  }
  if (init_polymap() === -1) return -1;
  G.RadarHeight = Math.trunc((G.RadarWidth * G.Setup!.height) / G.Setup!.width);
  if (Init_playing_windows() === -1) return -1;
  if (Alloc_msgs() === -1) return -1;
  if (Alloc_history() === -1) return -1;
  return 0;
}

export function Check_client_fps(): number {
  if (G.oldMaxFPS !== G.maxFPS) return Client_fps_request();
  return 0;
}

export function Client_start(): number {
  Key_init();
  return 0;
}

export function Client_cleanup(): void {
  Pointer_control_set_state(false);
  Platform_specific_cleanup();
  Free_selectionAndHistory();
  Free_msgs();
  G.Others = [];
  G.num_others = 0;
  G.max_others = 0;
  Map_cleanup();
  Paint_cleanup();
}

export function Client_pointer_move(movement: number): number {
  if (G.maxMouseTurnsPS === 0) return Send_pointer_move(movement);
  G.cumulativeMouseMovement += movement;
  return 0;
}

let last_send_interval_num = -1;
onReset(() => { last_send_interval_num = -1; });

/** microseconds to wait in select() before the next pointer move goes out */
export function Client_check_pointer_move_interval(): number {
  const now = sys.nowUs();
  const usec = now - Math.floor(now / 1e6) * 1e6;
  const interval_num = Math.trunc(usec / G.mouseMovementInterval);
  if (interval_num !== last_send_interval_num && G.cumulativeMouseMovement !== 0) {
    Send_pointer_move(G.cumulativeMouseMovement);
    G.cumulativeMouseMovement = 0;
    last_send_interval_num = interval_num;
  }
  if (G.cumulativeMouseMovement !== 0) return (interval_num + 1) * G.mouseMovementInterval - usec;
  return 1000000;
}

export function Client_exit(status: number): never {
  Net_cleanup();
  Client_cleanup();
  throw new ClientExit(status);
}
