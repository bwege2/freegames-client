// paint.c and paint.h: the view (extended view, world origin), the frame timing (loopsSlow), the
// score list order; WINSCALE and the coordinate macros.
import { G } from './G.ts';
import type { other_t } from './G.ts';
import { MIN_VIEW_SIZE, MAX_VIEW_SIZE, WRAP_PLAY, TEAM_PLAY, TIMING, LIMITED_LIVES, MAX_TEAMS } from './consts.ts';
import { BIT, f32, LIMIT, onReset, sprintf, strchrc, toInt } from './cutil.ts';
import { warn } from './error.ts';
import { Send_display } from './netclient.ts';
import { Paint_score_entry, Paint_score_start } from './xpaint.ts';
import { Add_roundend_messages } from './messages.ts';

/** paint.h WINSCALE: (int)(|x| * fscale + 0.5) in float, at least 1, the sign kept */
export function WINSCALE(x: number): number {
  x = Math.trunc(x);
  if (x === 0) return 0;
  let t = x, negative = false;
  if (t < 0) { negative = true; t = -t; }
  const f = f32(f32(t) * G.clData.fscale);
  let y = Math.trunc(f32(f + f32(0.5)));
  if (y < 1) y = 1;
  return negative ? -y : y;
}
export const UWINSCALE = (x: number): number => WINSCALE(x) >>> 0;
export const SCALEX = (co: number): number => WINSCALE(co) - WINSCALE(G.world.x);
export const SCALEY = (co: number): number => WINSCALE(G.world.y + G.ext_view_height) - WINSCALE(co);
export const X = (co: number): number => Math.trunc(co - G.world.x);
export const Y = (co: number): number => Math.trunc(G.world.y + G.ext_view_height - co);
/** X and Y of a float (position_t) coordinate: the subtraction is done in float */
export const XF = (co: number): number => Math.trunc(f32(co - G.world.x));
export const YF = (co: number): number => Math.trunc(f32(G.world.y + G.ext_view_height - co));

let time_counter = 0.0;
onReset(() => { time_counter = 0.0; });

export function Check_view_dimensions(): number {
  const width_wanted = toInt(G.draw_width * G.clData.scaleFactor + 0.5);
  const height_wanted = toInt(G.draw_height * G.clData.scaleFactor + 0.5);
  let srv_width = width_wanted, srv_height = height_wanted;
  srv_height = LIMIT(srv_height, MIN_VIEW_SIZE, MAX_VIEW_SIZE);
  srv_width = LIMIT(srv_width, MIN_VIEW_SIZE, MAX_VIEW_SIZE);
  const sd = G.server_display;
  if (sd.view_width !== srv_width || sd.view_height !== srv_height || sd.num_spark_colors !== G.num_spark_colors || sd.spark_rand !== G.spark_rand) {
    if (Send_display(srv_width, srv_height, G.spark_rand, G.num_spark_colors)) return -1;
  }
  G.spark_rand = sd.spark_rand;
  G.active_view_width = sd.view_width;
  G.active_view_height = sd.view_height;
  G.ext_view_x_offset = 0;
  G.ext_view_y_offset = 0;
  if (width_wanted > G.active_view_width) {
    G.ext_view_width = (width_wanted << 16) >> 16;
    G.ext_view_x_offset = Math.trunc((width_wanted - G.active_view_width) / 2);
  } else G.ext_view_width = (G.active_view_width << 16) >> 16;
  if (height_wanted > G.active_view_height) {
    G.ext_view_height = (height_wanted << 16) >> 16;
    G.ext_view_y_offset = Math.trunc((height_wanted - G.active_view_height) / 2);
  } else G.ext_view_height = (G.active_view_height << 16) >> 16;
  return 0;
}

export function Paint_frame_start(): void {
  Check_view_dimensions();
  G.world.x = G.selfPos.x - Math.trunc(G.ext_view_width / 2);
  G.world.y = G.selfPos.y - Math.trunc(G.ext_view_height / 2);
  G.realWorld = { ...G.world };
  const S = G.Setup!;
  if (BIT(S.mode, WRAP_PLAY)) {
    if (G.world.x < 0 && G.world.x + G.ext_view_width < S.width) G.world.x += S.width;
    else if (G.world.x > 0 && G.world.x + G.ext_view_width >= S.width) G.realWorld.x -= S.width;
    if (G.world.y < 0 && G.world.y + G.ext_view_height < S.height) G.world.y += S.height;
    else if (G.world.y > 0 && G.world.y + G.ext_view_height >= S.height) G.realWorld.y -= S.height;
  }
  if (G.start_loops !== G.end_loops) warn(`Start neq. End (${G.start_loops},${G.end_loops},${G.loops})`);
  G.loops = G.end_loops;
  if (G.newSecond) {
    G.recordFPS = toInt(G.clientFPS + 0.5);
    G.timePerFrame = 1.0 / G.recordFPS;
    if (G.newSecond && G.self && !strchrc('PW', G.self.mychar)) G.played_this_round = true;
  }
  time_counter += G.timePerFrame;
  if (time_counter >= 1.0 / 12) {
    G.loopsSlow++;
    time_counter -= 1.0 / 12;
  }
}

interface team_score { score: number; life: number; playing: number }

const isIn = strchrc;

function Determine_team_order(team_order: team_score[], team: team_score[]): void {
  G.num_playing_teams = 0;
  for (let i = 0; i < MAX_TEAMS; i++) {
    if (team[i].playing) {
      let j: number;
      for (j = 0; j < G.num_playing_teams; j++) {
        if (team[i].score > team_order[j].score
          || (team[i].score === team_order[j].score
            && (BIT(G.Setup!.mode, LIMITED_LIVES) ? team[i].life > team_order[j].life : team[i].life < team_order[j].life))) {
          for (let k = i; k > j; k--) team_order[k] = team_order[k - 1];
          break;
        }
      }
      team_order[j] = team[i];
      G.num_playing_teams++;
    }
  }
}

function Determine_order(order: other_t[], team: team_score[]): void {
  const mode = G.Setup!.mode;
  for (let i = 0; i < G.num_others; i++) {
    const other = G.Others[i];
    let j: number;
    if (BIT(mode, TIMING)) {
      if (isIn('PTW', other.mychar)) j = i;
      else {
        for (j = 0; j < i; j++) {
          if (order[j].timing < other.timing) break;
          if (isIn('PTW', order[j].mychar)) break;
          if (order[j].timing === other.timing && order[j].timing_loops > other.timing_loops) break;
        }
      }
    } else {
      for (j = 0; j < i; j++) if (order[j].score < other.score) break;
    }
    for (let k = i; k > j; k--) order[k] = order[k - 1];
    order[j] = other;
    if (BIT(mode, TEAM_PLAY | TIMING) === TEAM_PLAY) {
      switch (String.fromCharCode(other.mychar)) {
        case 'P': case 'W': case 'T':
          break;
        case ' ': case 'R':
          if (BIT(mode, LIMITED_LIVES)) team[other.team].life += other.life + 1;
          else team[other.team].life += other.life;
          team[other.team].playing++;
          team[other.team].score += other.score;
          break;
        default:
          team[other.team].playing++;
          team[other.team].score += other.score;
          break;
      }
    }
  }
}

const TEAM_PAUSEHACK = 100;

function Team_heading(entrynum: number, teamnum: number, teamlives: number, teamscore: number): number {
  const tmp: other_t = {
    score: teamscore, id: -1, team: teamnum, check: 0, round: 0, timing_loops: 0, timing: 0, life: teamlives, mychar: 0x20, alliance: 0,
    name_width: 0, name_len: 0, max_chars_in_names: 0, ignorelevel: 0, ship: null,
    nick_name: teamnum !== TEAM_PAUSEHACK ? sprintf('TEAM %d', teamnum) : 'Pause Wusses', user_name: '', host_name: '', id_string: '',
  };
  tmp.user_name = tmp.nick_name;
  Paint_score_entry(entrynum++, tmp, true);
  return entrynum;
}

function Team_score_table(entrynum: number, teamnum: number, team: team_score, order: other_t[]): number {
  let drawn = false;
  for (let i = 0; i < G.num_others; i++) {
    const other = order[i];
    if (teamnum === TEAM_PAUSEHACK) {
      if (other.mychar !== 0x50) continue;
    } else if (other.team !== teamnum || other.mychar === 0x50) continue;
    if (!drawn) entrynum = Team_heading(entrynum, teamnum, team.life, team.score);
    Paint_score_entry(entrynum++, other, false);
    drawn = true;
  }
  if (drawn) entrynum += 1;
  return entrynum;
}

export function Paint_score_table(): void {
  if (!G.scoresChanged || !G.players_exposed) return;
  if (G.num_others < 1) {
    Paint_score_start();
    G.scoresChanged = 0;
    return;
  }
  const order: other_t[] = new Array(G.num_others);
  const team: team_score[] = Array.from({ length: MAX_TEAMS }, () => ({ score: 0, life: 0, playing: 0 }));
  const pausers: team_score = { score: 0, life: 0, playing: 0 };
  Determine_order(order, team);
  Paint_score_start();
  const mode = G.Setup!.mode;
  if (!(BIT(mode, TEAM_PLAY | TIMING) === TEAM_PLAY)) {
    for (let i = 0; i < G.num_others; i++) Paint_score_entry(i, order[i], false);
  } else {
    const team_order: team_score[] = new Array(MAX_TEAMS);
    Determine_team_order(team_order, team);
    let entrynum = 1;
    for (let i = 0; i < MAX_TEAMS; i++) entrynum = Team_score_table(entrynum, i, team[i], order);
    entrynum = Team_score_table(entrynum, TEAM_PAUSEHACK, pausers, order);
  }
  if (G.roundend) Add_roundend_messages(order);
  G.scoresChanged = 0;
}
