// messages.c: the talk and game message lines (with pending buffers while a selection is cut), the
// message scan (kill ratio, ball statistics, base warning, ball/safe/cover/pop flags) and the
// round end summaries.
import { G } from './G.ts';
import type { message_t, other_t } from './G.ts';
import {
  MAX_MSGS, MSG_LEN, MSG_LIFE_TIME, SEL_PENDING, SEL_EMPHASIZED, SEL_SELECTED, SEL_NONE, BmsNone, BmsBall, BmsSafe,
  BmsCover, BmsPop, TEAM_PLAY, LIMITED_LIVES,
} from './consts.ts';
import { BIT, atoi, onReset, snprintf, sprintf, strchrc } from './cutil.ts';
import { warn, xpprintf } from './error.ts';
import { Other_by_id, Other_by_name, Using_score_decimals } from './client.ts';
import { Add_rank_Death, Add_rank_Kill } from './clientrank.ts';
import { Add_alert_message } from './xeventhandlers.ts';
export { Add_alert_message, Clear_alert_messages } from './xeventhandlers.ts';

const M = {
  ball_shout: false, need_cover: false,
  killratio_kills: 0, killratio_deaths: 0, killratio_totalkills: 0, killratio_totaldeaths: 0,
  ballstats_cashes: 0, ballstats_replaces: 0, ballstats_teamcashes: 0, ballstats_lostballs: 0, rounds_played: 0,
  killratio_buf: '',
};
const Mdefaults = { ...M };
onReset(() => Object.assign(M, Mdefaults));

const shottypes = ['a shot'];
const head_first = ' head first';
const crashes = ['crashed', 'smashed', 'smacked', 'was trashed'];
const obstacles = ['wall', 'target', 'treasure', 'cannon'];
const teamnames = ['2', '4', '0', '1', '3', '5', '6', '7', '8', '9'];
const MSG_MAX_NAMES = 3;

interface msgnames_t { index: number; nick_name: string[] }
const newNames = (): msgnames_t => ({ index: 0, nick_name: new Array(MSG_MAX_NAMES).fill('') });

/** recursive descent parser for messages; names are stored deepest first */
function Msg_match_fmt(msg: string, fmt: string, mn: msgnames_t): boolean {
  const fp = fmt.indexOf('%');
  if (fp < 0) return msg.startsWith(fmt);
  if (msg.slice(0, fp) !== fmt.slice(0, fp)) return false;
  const kind = fmt[fp + 1];
  fmt = fmt.slice(fp + 2);
  msg = msg.slice(fp);
  switch (kind) {
    case 'n':
      for (let i = 0; i < G.num_others; i++) {
        const nick = G.Others[i].nick_name;
        if (msg.startsWith(nick) && Msg_match_fmt(msg.slice(nick.length), fmt, mn)) {
          mn.nick_name[mn.index++] = nick;
          return true;
        }
      }
      break;
    case 's':
      for (const s of shottypes) if (msg.startsWith(s)) return Msg_match_fmt(msg.slice(s.length), fmt, mn);
      break;
    case 'h':
      if (msg.startsWith(head_first)) msg = msg.slice(head_first.length);
      return Msg_match_fmt(msg, fmt, mn);
    case 'o':
      for (const s of obstacles) if (msg.startsWith(s)) return Msg_match_fmt(msg.slice(s.length), fmt, mn);
      break;
    case 'c':
      for (const s of crashes) if (msg.startsWith(s)) return Msg_match_fmt(msg.slice(s.length), fmt, mn);
      break;
    case 't':
      for (const s of teamnames) {
        if (msg.startsWith(s)) {
          mn.nick_name[mn.index++] = s;
          return Msg_match_fmt(msg.slice(s.length), fmt, mn);
        }
      }
      break;
    default:
      break;
  }
  return false;
}

function Want_scan(): boolean {
  if (G.num_others < 2) return false;
  if (!G.self || strchrc('PW', G.self.mychar)) return false;
  let num_playing = 0;
  for (let i = 0; i < G.num_others; i++) if (strchrc(' DR', G.Others[i].mychar)) num_playing++;
  return num_playing > 1;
}

function Msg_scan_for_total_reset(message: string): boolean {
  if (message.includes('Total reset')) {
    Object.assign(M, {
      killratio_kills: 0, killratio_deaths: 0, killratio_totalkills: 0, killratio_totaldeaths: 0, ballstats_cashes: 0,
      ballstats_replaces: 0, ballstats_teamcashes: 0, ballstats_lostballs: 0, rounds_played: 0,
    });
    G.played_this_round = false;
    return true;
  }
  return false;
}

function Msg_scan_for_replace_treasure(message: string): boolean {
  if (!G.self || !Want_scan()) return false;
  const mn = newNames();
  if (Msg_match_fmt(message, ' < %n (team %t) has replaced the treasure >', mn)) {
    const replacer_team = atoi(mn.nick_name[0]);
    const replacer = mn.nick_name[1];
    if (replacer_team === G.self.team) {
      Bms_set_state(BmsSafe);
      if (replacer === G.self.nick_name) M.ballstats_replaces++;
      return true;
    }
    if (G.num_playing_teams === 2) Bms_set_state(BmsPop);
    return true;
  }
  return false;
}

function Msg_scan_for_ball_destruction(message: string): boolean {
  if (!G.self || !Want_scan()) return false;
  const mn = newNames();
  if (Msg_match_fmt(message, " < %n's (%t) team has destroyed team %t treasure >", mn)) {
    const destroyer_team = atoi(mn.nick_name[0]);
    const destroyed_team = atoi(mn.nick_name[1]);
    const destroyer = mn.nick_name[2];
    if (destroyer_team === G.self.team) {
      M.ballstats_teamcashes++;
      if (destroyer === G.self.nick_name) M.ballstats_cashes++;
    }
    if (destroyed_team === G.self.team) M.ballstats_lostballs++;
    return true;
  }
  return false;
}

function Msg_scan_death(id: number): void {
  if (G.version >= 0x4f12) return;
  const other = Other_by_id(id);
  if (!other) return;
  if (BIT(G.Setup!.mode, LIMITED_LIVES) && other.life === 0) return;
  for (let i = 0; i < G.num_bases; i++) {
    if (G.bases[i].id === id) {
      G.bases[i].appeartime = Math.trunc(G.end_loops + 3 * G.clientFPS);
      break;
    }
  }
}

function Msg_is_game_msg(message: string): boolean {
  if (message[message.length - 1] === ']' || message.startsWith(' <')) return false;
  return true;
}

function Msg_scan_game_msg(message: string): void {
  let killer: string | null = null, victim: string | null = null, victim2: string | null = null;
  let i_am_killer = false, i_am_victim = false, i_am_victim2 = false;
  if (message.includes('There is no Deadly Player') || message.includes('is the Deadliest Player with') || message.includes('are the Deadly Players with')) {
    Bms_set_state(BmsNone);
    if (G.played_this_round) {
      G.played_this_round = false;
      M.rounds_played++;
    }
    G.roundend = true;
    M.killratio_totalkills += M.killratio_kills;
    M.killratio_totaldeaths += M.killratio_deaths;
    return;
  }
  const self = G.self;
  if (!self) {
    warn("Variable 'self' is NULL!");
    return;
  }
  const mn = newNames();
  const n = mn.nick_name;
  if (Msg_match_fmt(message, '%n was killed by %s from %n.', mn)) {
    killer = n[0];
    victim = n[1];
  } else if (Msg_match_fmt(message, '%n %c%h against a %o.', mn)) {
    victim = n[0];
  } else if (Msg_match_fmt(message, '%n and %n crashed.', mn)) {
    victim = n[1];
    victim2 = n[0];
  } else if (Msg_match_fmt(message, '%n ran over %n.', mn)) {
    killer = n[1];
    victim = n[0];
  } else if (Msg_match_fmt(message, '%n %c%h against a %o with help from %n', mn)) {
    killer = n[0];
    victim = n[1];
  } else if (Msg_match_fmt(message, '%n has committed suicide.', mn)) {
    victim = n[0];
  } else if (Msg_match_fmt(message, '%n was killed by a ball.', mn)) {
    victim = n[0];
  } else if (Msg_match_fmt(message, '%n was killed by a ball owned by %n.', mn)) {
    killer = n[0];
    victim = n[1];
  } else if (Msg_match_fmt(message, '%n succumbed to an explosion.', mn)) {
    victim = n[0];
  } else if (Msg_match_fmt(message, '%n succumbed to an explosion from %n.', mn)) {
    killer = n[0];
    victim = n[1];
  } else if (Msg_match_fmt(message, "%n got roasted alive by %n's laser.", mn)) {
    killer = n[0];
    victim = n[1];
  } else if (Msg_match_fmt(message, '%n was hit by cannonfire.', mn)) {
    victim = n[0];
  } else return;

  if (killer !== null && killer === self.nick_name) i_am_killer = true;
  if (victim !== null && victim === self.nick_name) i_am_victim = true;
  if (victim2 !== null && victim2 === self.nick_name) i_am_victim2 = true;
  if (victim !== null) {
    const other = Other_by_name(victim, false);
    if (other !== null) Msg_scan_death(other.id);
  }
  if (victim2 !== null) {
    const other = Other_by_name(victim, false);
    if (other !== null) Msg_scan_death(other.id);
  }
  if (i_am_killer && !i_am_victim) {
    M.killratio_kills++;
    if (M.killratio_kills % 10 === 0) {
      if (M.killratio_deaths > 0) {
        M.killratio_buf = sprintf('Current kill ratio: %d/%d (%.03f).', M.killratio_kills, M.killratio_deaths, M.killratio_kills / M.killratio_deaths);
      }
      Add_message(M.killratio_buf);
    }
  }
  if (i_am_victim || i_am_victim2) M.killratio_deaths++;
  if (G.instruments.clientRanker) {
    if (killer !== null && victim !== null) {
      if (i_am_killer && !i_am_victim) Add_rank_Death(victim);
      if (!i_am_killer && i_am_victim) Add_rank_Kill(killer);
    }
  }
}

function Msg_is_in_angle_brackets(message: string): boolean {
  if (!message.startsWith(' < ')) return false;
  return message[message.length - 1] === '>';
}

function Msg_scan_angle_bracketed_msg(message: string): void {
  if (Msg_scan_for_total_reset(message)) return;
  if (Msg_scan_for_ball_destruction(message)) return;
  Msg_scan_for_replace_treasure(message);
}

function Msg_do_bms(message: string): number {
  const has = (...t: string[]) => t.some((s) => message.includes(s));
  if (has('SAFE', 'Safe', 'safe', 'S A F E')) return BmsSafe;
  if (has('COVER', 'Cover', 'cover', 'INCOMING', 'Incoming', 'incoming')) return BmsCover;
  if (has('POP', 'Pop', 'pop')) return BmsPop;
  if (has('BALL', 'Ball', 'VAKK', 'B A L L', 'ball')) return BmsBall;
  return BmsNone;
}

/** the message without its "[sender]" when someone of our team sent it, else null */
function Msg_is_from_our_team(message: string): string | null {
  const self = G.self;
  if (self === null) return null;
  const len = message.length;
  // strlcpy(buf, message, len - strlen(buf)): with size 0 the buffer keeps "[sender]"
  const cut = (buf: string) => (len - buf.length === 0 ? buf : message.slice(0, len - buf.length - 1));
  for (let i = 0; i < G.num_others; i++) {
    const other = G.Others[i];
    if (other.team !== self.team) continue;
    let buf = `[${other.nick_name}]`;
    if (len < buf.length) continue;
    if (message.slice(len - buf.length) === buf) return cut(buf);
    buf = `[${other.nick_name}]:[${other.team}]`;
    if (len < buf.length) continue;
    if (message.slice(len - buf.length) === buf) return cut(buf);
  }
  return null;
}

const newMsg = (): message_t => ({ txt: '', len: 0, lifeTime: 0.0, bmsinfo: 0 });

export function Alloc_msgs(): number {
  G.TalkMsg = [];
  G.GameMsg = [];
  G.TalkMsg_pending = [];
  G.GameMsg_pending = [];
  for (let i = 0; i < 2 * MAX_MSGS; i++) {
    if (i < MAX_MSGS) {
      G.TalkMsg[i] = newMsg();
      G.TalkMsg_pending[i] = newMsg();
    } else {
      G.GameMsg[i - MAX_MSGS] = newMsg();
      G.GameMsg_pending[i - MAX_MSGS] = newMsg();
    }
  }
  return 0;
}

export function Free_msgs(): void { /* garbage collected */ }

export function Alloc_history(): number {
  G.HistoryMsg = [];
  for (let i = 0; i < G.maxLinesInHistory; i++) G.HistoryMsg[i] = '';
  return 0;
}

export function Free_selectionAndHistory(): void {
  G.HistoryMsg = [];
  G.selection.txt = null;
}

function Bms_clear(type: number): void {
  for (let i = 0; i < G.maxMessages && G.TalkMsg[i].len > 0; i++) if (G.TalkMsg[i].bmsinfo === type) G.TalkMsg[i].bmsinfo = BmsNone;
}

export function Bms_test_state(bms: number): boolean {
  switch (bms) {
    case BmsBall: return M.ball_shout;
    case BmsCover: return M.need_cover;
    case BmsSafe: return !M.ball_shout;
    case BmsPop: return !M.need_cover;
    default: return false;
  }
}

export function Bms_set_state(bms: number): void {
  switch (bms) {
    case BmsBall: M.ball_shout = true; Bms_clear(BmsSafe); break;
    case BmsSafe: M.ball_shout = false; Bms_clear(BmsBall); break;
    case BmsCover: M.need_cover = true; Bms_clear(BmsPop); break;
    case BmsPop: M.need_cover = false; Bms_clear(BmsCover); break;
    case BmsNone:
      M.ball_shout = false;
      M.need_cover = false;
      Bms_clear(BmsBall);
      Bms_clear(BmsSafe);
      Bms_clear(BmsCover);
      Bms_clear(BmsPop);
      break;
    default: break;
  }
}

export function Add_message(message: string): void {
  let bmsinfo = BmsNone;
  let is_drawn_talk_message = false;
  const scrolling = false;
  const sel = G.selection;
  const is_game_msg = Msg_is_game_msg(message);
  let msg_set: message_t[];
  if (!is_game_msg) {
    if (sel.draw.state === SEL_PENDING) msg_set = G.TalkMsg_pending;
    else {
      msg_set = G.TalkMsg;
      is_drawn_talk_message = true;
    }
  } else msg_set = sel.draw.state === SEL_PENDING ? G.GameMsg_pending : G.GameMsg;

  if (is_game_msg) Msg_scan_game_msg(message);
  else if (Msg_is_in_angle_brackets(message)) Msg_scan_angle_bracketed_msg(message);
  else if (BIT(G.Setup!.mode, TEAM_PLAY)) {
    const msg2 = Msg_is_from_our_team(message);
    if (msg2 !== null) bmsinfo = Msg_do_bms(msg2);
  }

  if (is_drawn_talk_message) {
    if (sel.keep_emphasizing) {
      sel.keep_emphasizing = false;
      sel.talk.state = SEL_NONE;
      sel.draw.state = SEL_EMPHASIZED;
      sel.draw.y1 = -1;
      sel.draw.y2 = -1;
    }
  }

  const msg = msg_set[G.maxMessages - 1];
  for (let i = G.maxMessages - 1; i > 0; i--) msg_set[i] = msg_set[i - 1];
  msg_set[0] = msg;
  msg.lifeTime = MSG_LIFE_TIME;
  msg.txt = message.slice(0, MSG_LEN - 1);
  msg.len = message.length;
  msg.bmsinfo = bmsinfo;

  if (bmsinfo !== BmsNone) Bms_set_state(bmsinfo);

  if (is_drawn_talk_message && sel.draw.state === SEL_EMPHASIZED) {
    if ((scrolling && sel.draw.y2 === 0) || sel.draw.y1 === G.maxMessages - 1) sel.draw.state = SEL_SELECTED;
    else {
      sel.draw.y1++;
      if (sel.draw.y2 === G.maxMessages - 1) sel.draw.x2 = msg_set[sel.draw.y2].len - 1;
      else sel.draw.y2++;
    }
  }

  if (G.messagesToStdout === 2 || (G.messagesToStdout === 1 && message.length > 0 && message[message.length - 1] === ']')) {
    xpprintf(`${message}\n`);
  }
}

export function Add_newbie_message(message: string): void {
  if (!G.newbie) return;
  Add_alert_message(snprintf(MSG_LEN, '%s [*Newbie help*]', message), 10.0);
}

function Delete_pending_messages(): void {
  for (let i = 0; i < G.maxMessages; i++) {
    for (const msg of [G.TalkMsg_pending[i], G.GameMsg_pending[i]]) {
      if (msg.len > 0) {
        msg.txt = '';
        msg.len = 0;
      }
    }
  }
}

export function Add_pending_messages(): void {
  for (let i = G.maxMessages - 1; i >= 0; i--) {
    if (G.TalkMsg_pending[i].len > 0) Add_message(G.TalkMsg_pending[i].txt);
    if (G.GameMsg_pending[i].len > 0) Add_message(G.GameMsg_pending[i].txt);
  }
  Delete_pending_messages();
}

function Roundend(): void {
  G.roundend = false;
  Bms_set_state(BmsNone);
}

export function Add_roundend_messages(order: other_t[]): void {
  Roundend();
  let kdratio, killsperround;
  if (M.killratio_totalkills === 0) kdratio = '0';
  else if (M.killratio_totaldeaths === 0) kdratio = 'infinite';
  else kdratio = sprintf('%.2f', M.killratio_totalkills / M.killratio_totaldeaths);
  if (M.rounds_played === 0) killsperround = '0';
  else killsperround = sprintf('%.2f', M.killratio_totalkills / M.rounds_played);
  Add_message(sprintf('Kill ratio - Round: %d/%d Total: %d/%d (%s) Rounds played: %d  Avg.kills/round: %s',
    M.killratio_kills, M.killratio_deaths, M.killratio_totalkills, M.killratio_totaldeaths, kdratio, M.rounds_played, killsperround));
  M.killratio_kills = 0;
  M.killratio_deaths = 0;
  Add_message(sprintf('Ballstats - Cash/Repl/Team/Lost: %d/%d/%d/%d', M.ballstats_cashes, M.ballstats_replaces, M.ballstats_teamcashes, M.ballstats_lostballs));
  let s = 'Points - ';
  for (let i = 0; i < G.num_others; i++) {
    const other = order[i];
    if (other.mychar === 0x50) continue;
    let hackbuf2;
    if (Using_score_decimals()) hackbuf2 = sprintf('%s: %.*f ', other.nick_name, G.showScoreDecimals, other.score);
    else {
      const score = other.score;
      const sc = Math.trunc(score >= 0.0 ? score + 0.5 : score - 0.5);
      hackbuf2 = sprintf('%s: %d ', other.nick_name, sc);
    }
    if (s.length + hackbuf2.length > MSG_LEN) {
      Add_message(s);
      s = '';
    }
    s += hackbuf2;
  }
  Add_message(s);
}

export function Print_messages_to_stdout(): void {
  xpprintf('[talk messages]\n');
  for (let i = 0; i < G.maxMessages; i++) if (G.TalkMsg[i] && G.TalkMsg[i].len > 0) xpprintf(`  ${G.TalkMsg[i].txt}\n`);
  xpprintf('[server messages]\n');
  for (let i = G.maxMessages - 1; i >= 0; i--) if (G.GameMsg[i] && G.GameMsg[i].len > 0) xpprintf(`  ${G.GameMsg[i].txt}\n`);
  xpprintf('\n');
}
