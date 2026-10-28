// talkmacros.c: the talk macros msg1..msg20 with their little language: #t team, #l/#s locked
// player/self followed by l n s t, #= comparisons, #r random choice, #n line break, #f file
// (not available in the browser, README.md), #h home directory.
import { G } from './G.ts';
import { MAX_CHARS, TEAM_PLAY, LIMITED_LIVES, XP_OPTFLAG_DEFAULT } from './consts.ts';
import { BIT, atoi, sprintf } from './cutil.ts';
import { error } from './error.ts';
import type { other_t } from './G.ts';
import { Net_talk } from './netclient.ts';
import { Other_by_id } from './client.ts';
import { randomMT } from './xpmath.ts';
import { STORE_OPTIONS, XP_STRING_OPTION } from './option.ts';
import type { xp_option_t } from './option.ts';

const TALK_FAST_NR_OF_MSGS = 20;
const TALK_FAST_MSG_FNLEN = 100;
const START = '[', END = ']', MIDDLE = '|', SPECIAL = '#';
const MSG_PARSED_FIELD_LEN = 20;

/** the number of fields of a [..|..] group at p, and the index after it (-1 when malformed) */
function Talk_macro_fields_info(buf: string, p: number): { next: number; n_fields: number } {
  let level = 0, n_fields = 0;
  for (;;) {
    const c = p < buf.length ? buf[p] : '\0';
    if (c === START) {
      if (level++ === 0) n_fields++;
    } else if (c === MIDDLE) {
      if (level === 1) n_fields++;
    } else if (c === END) {
      level--;
      if (level === 0) return { next: p + 1, n_fields };
      if (level < 0) return { next: -1, n_fields };
    } else if (c === '\0') return { next: -1, n_fields };
    p++;
  }
}

function Talk_macro_get_field(buf: string, p: number, wanted_field: number): string | null {
  let level = 0, field = 0, start = -1, end = -1;
  for (let finished = false; !finished; p++) {
    const c = p < buf.length ? buf[p] : '\0';
    if (c === START) {
      if (level === 0) {
        field++;
        if (field === wanted_field) start = p + 1;
      }
      level++;
    } else if (c === MIDDLE) {
      if (level === 1) {
        field++;
        if (field === wanted_field) start = p + 1;
        else if (field === wanted_field + 1) {
          end = p;
          finished = true;
        }
      }
    } else if (c === END) {
      level--;
      if (level === 0) {
        if (field === wanted_field) end = p;
        finished = true;
      } else if (level < 0) return null;
    } else if (c === '\0') return null;
  }
  if (start < 0 || end < start) return '';
  return buf.slice(start, end);
}

interface Out { buf: string[]; final: boolean }

function parse(out: Out, inbuf: string, pos: number, max: number): number {
  let ip = 0;
  let done = false;
  let player: other_t | null = null;
  const ob = out.buf;
  const S = G.Setup!;
  while (!done && ip < inbuf.length && inbuf[ip] !== '\0') {
    let c = inbuf[ip++];
    if (pos >= max - 2) {
      if (out.final) {
        if (Net_talk(ob.slice(0, pos).join('')) === -1) return -1;
        pos = 0;
      } else break;
    }
    if (player !== null) {
      switch (c) {
        case 'l':
          if (BIT(S.mode, LIMITED_LIVES)) ob[pos++] = String.fromCharCode((player.life + 0x30) & 0xff);
          break;
        case 'n':
          for (let i = 0; i < player.nick_name.length && pos < max - 2; ++i) ob[pos++] = player.nick_name[i];
          break;
        case 's':
          if (pos < max - 1 - 6) for (const ch of sprintf('%.2f', player.score)) ob[pos++] = ch;
          break;
        case 't':
          if (BIT(S.mode, TEAM_PLAY)) ob[pos++] = String.fromCharCode((player.team + 0x30) & 0xff);
          break;
        default:
          break;
      }
      player = null;
      continue;
    }
    if (c === SPECIAL) {
      if (ip >= inbuf.length || inbuf[ip] === '\0') {
        ip++;
        done = true;
        continue;
      }
      c = inbuf[ip++];
      switch (c) {
        case '=': {
          const { next, n_fields } = Talk_macro_fields_info(inbuf, ip);
          if (n_fields < 3 || n_fields > 4 || next < 0) break;
          let t = Talk_macro_get_field(inbuf, ip, 1);
          if (t === null) {
            error('Talk_macro_get_field (1) error!');
            break;
          }
          const o1: Out = { buf: [], final: false };
          const p1 = parse(o1, t, 0, MSG_PARSED_FIELD_LEN);
          t = Talk_macro_get_field(inbuf, ip, 2);
          if (t === null) {
            error('Talk_macro_get_field (2) error!');
            break;
          }
          const o2: Out = { buf: [], final: false };
          const p2 = parse(o2, t, 0, MSG_PARSED_FIELD_LEN);
          if (o1.buf.slice(0, p1).join('') === o2.buf.slice(0, p2).join('')) {
            const t3 = Talk_macro_get_field(inbuf, ip, 3);
            if (t3 === null) {
              error('Talk_macro_get_field (3) error!');
              break;
            }
            pos = parse(out, t3, pos, max);
          } else if (n_fields === 4) {
            const t4 = Talk_macro_get_field(inbuf, ip, 4);
            if (t4 === null) {
              error('Talk_macro_get_field (4) error!');
              break;
            }
            pos = parse(out, t4, pos, max);
          }
          ip = next;
          break;
        }
        case 'f': {
          const { next, n_fields } = Talk_macro_fields_info(inbuf, ip);
          if (n_fields !== 1 || next < 0) break;
          const t = Talk_macro_get_field(inbuf, ip, 1);
          if (t === null) {
            error('Talk_macro_get_field error!');
            break;
          }
          ip = next;
          const fo: Out = { buf: [], final: false };
          parse(fo, t, 0, TALK_FAST_MSG_FNLEN);
          error(`Couldn't open file ${t}`);
          break;
        }
        case 'h':
          break;
        case 'r': {
          const { next, n_fields } = Talk_macro_fields_info(inbuf, ip);
          if (n_fields <= 0 || next < 0) break;
          const t = Talk_macro_get_field(inbuf, ip, (randomMT() % n_fields) + 1);
          if (t === null) {
            error('Talk_macro_get_field error (random)');
            break;
          }
          ip = next;
          pos = parse(out, t, pos, max);
          break;
        }
        case 'n':
          if (Net_talk(ob.slice(0, pos).join('')) === -1) return -1;
          pos = 0;
          break;
        case 'l':
          if ((player = Other_by_id(G.snooping ? G.eyesId : G.lock_id)) === null) {
            pos = 0;
            done = true;
          }
          break;
        case 's':
          player = G.self;
          break;
        case 't':
          if (BIT(S.mode, TEAM_PLAY)) ob[pos++] = String.fromCharCode((G.self!.team + 0x30) & 0xff);
          break;
        case SPECIAL:
          ob[pos++] = c;
          break;
        default:
          break;
      }
    } else if (c !== '\n') ob[pos++] = c;
  }
  ob.length = Math.max(0, pos);
  return pos;
}

export function Talk_macro(i: number): number {
  const str = G.talk_fast_msgs[i];
  if (str === null || str === undefined) return 1;
  const out: Out = { buf: [], final: true };
  const pos = parse(out, str, 0, MAX_CHARS);
  if (pos > 0) Net_talk(out.buf.slice(0, pos).join(''));
  return 0;
}

const index_by_option = (opt: xp_option_t) => atoi(opt.name.slice(3)) - 1;

export function Store_talk_macro_options(): void {
  const defaults = [
    '#t:***    BALL! Our ball is gone! Save it!   ***',
    '#t:*** SAFE! Our ball is safe. ***',
    '#t:*** COVER! The enemy ball is approaching our base. ***',
    '#t:*** POP! The enemy ball is back at the enemy base. ***',
    '#=[#t|2|/team 4|/team 2]',
  ];
  const opts: xp_option_t[] = [];
  for (let i = 0; i < TALK_FAST_NR_OF_MSGS; i++) {
    opts.push(XP_STRING_OPTION(`msg${i + 1}`, defaults[i] ?? '', null, 0,
      (opt, value) => { G.talk_fast_msgs[index_by_option(opt)] = value; return true; }, null,
      (opt) => G.talk_fast_msgs[index_by_option(opt)] ?? '', XP_OPTFLAG_DEFAULT, `Talkmessage ${i + 1}.\n`));
  }
  STORE_OPTIONS(opts);
}
