// Runs a command script of re/gnugo/oracle/oracle.c against the port and prints what the oracle prints,
// so that test/oracle.test.ts can compare the two outputs line by line. "randgame" is not run: the
// oracle echoes the moves it played as "> play" lines, and the port replays those.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import {
  BLACK, BOARDMAX, BOARDMIN, EMPTY, IS_STONE, MAXLIBS, ON_BOARD, PASS_MOVE, POS, I, J, WHITE, add_stone,
  accuratelib, approxlib, black_captured, board, board_hash, board_ko_pos, clear_board, find_origin, findlib,
  findstones, g, hashdata_to_string, init_board, is_allowed_move, is_ko, is_legal, is_self_atari, is_suicide,
  play_move, undo_move, white_captured,
} from '../src/engine/board.ts';
import {
  clear_unconditionally_meaningless_moves, find_unconditionally_meaningless_moves, unconditional_life,
  unconditionally_meaningless_move,
} from '../src/engine/unconditional.ts';
import { mc_load_patterns_from_db, uct_genmove } from '../src/engine/montecarlo.ts';
import { gg_srand, gg_urand } from '../src/engine/random.ts';

let loaded = false;
export function init(): void {
  init_board(1);
  if (!loaded) {
    mc_load_patterns_from_db(readFileSync(join(import.meta.dirname, '../assets/mc_montegnu_classic.db'), 'latin1'));
    loaded = true;
  }
  g.board_size = 9;
  clear_board();
}

export function pos_str(pos: number): string {
  if (pos === PASS_MOVE) return 'pass';
  const j = J(pos);
  return String.fromCharCode(65 + j + (j >= 8 ? 1 : 0)) + (g.board_size - I(pos));
}

function parse_pos(s: string): number {
  if (s === 'pass') return PASS_MOVE;
  const c = s[0].toUpperCase();
  let j = c.charCodeAt(0) - 65;
  if (c > 'I') j--;
  return POS(g.board_size - parseInt(s.slice(1), 10), j);
}

const parse_color = (s: string): number => (s[0] === 'b' || s[0] === 'B' ? BLACK : WHITE);

/** %.9g of a float */
function g9(v: number): string {
  if (v === 0) return '0';
  let s = v.toPrecision(9);
  if (s.includes('e')) return s;
  if (s.includes('.')) s = s.replace(/0+$/, '').replace(/\.$/, '');
  return s;
}

function dump(out: string[]): void {
  let s = 'board';
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) if (ON_BOARD(pos)) s += board[pos];
  out.push(s);
  out.push(`ko ${pos_str(board_ko_pos())} captured w ${white_captured()} b ${black_captured()} hash ${hashdata_to_string(board_hash)}`);
  const libs: number[] = [];
  const stones: number[] = [];
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!ON_BOARD(pos) || !IS_STONE(board[pos]) || find_origin(pos) !== pos) continue;
    const n = findstones(pos, BOARDMAX, stones);
    let line = `string ${pos_str(pos)} size ${n} stones`;
    for (let k = 0; k < n; k++) line += ' ' + pos_str(stones[k]);
    let l = findlib(pos, MAXLIBS, libs);
    line += ` libs ${l}`;
    for (let k = 0; k < l; k++) line += ' ' + pos_str(libs[k]);
    l = findlib(pos, 3, libs);
    line += ' first';
    for (let k = 0; k < l && k < 3; k++) line += ' ' + pos_str(libs[k]);
    out.push(line);
  }
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
    if (!ON_BOARD(pos) || board[pos] !== EMPTY) continue;
    let line = `point ${pos_str(pos)}`;
    for (let c = WHITE; c <= BLACK; c++) {
      const ko = is_ko(pos, c);
      const b = (x: boolean): number => (x ? 1 : 0);
      line +=
        ` ${c === WHITE ? 'w' : 'b'} legal ${b(is_legal(pos, c))} allowed ${b(is_allowed_move(pos, c))}` +
        ` suicide ${b(is_suicide(pos, c))} selfatari ${b(is_self_atari(pos, c))} approx ${approxlib(pos, c, 4, null)}` +
        ` accurate ${accuratelib(pos, c, MAXLIBS, null)} ko ${ko ? 1 : 0} ${ko ? pos_str(ko - 1) : '-'}`;
    }
    out.push(line);
  }
}

const territory = (t: Int32Array): string => {
  let s = 'territory ';
  for (let pos = BOARDMIN; pos < BOARDMAX; pos++) if (ON_BOARD(pos)) s += t[pos];
  return s;
};

/** runs the commands of the oracle's output (its "> " lines) and returns the port's output */
export function run(oracleOutput: string): string[] {
  const out: string[] = [];
  for (const raw of oracleOutput.split('\n')) {
    if (!raw.startsWith('> ')) continue;
    const [cmd, a, b, d] = raw.slice(2).split(' ');
    if (cmd === 'size') {
      g.board_size = parseInt(a, 10);
      clear_board();
      out.push(raw);
    } else if (cmd === 'komi') {
      g.komi = Math.fround(parseFloat(a));
      out.push(raw);
    } else if (cmd === 'play' || cmd === 'add') {
      const color = parse_color(a);
      const pos = parse_pos(b);
      if (cmd === 'play') play_move(pos, color);
      else add_stone(pos, color);
      out.push(raw);
    } else if (cmd === 'undo') {
      out.push(raw);
      out.push(`undo ${undo_move(parseInt(a, 10)) ? 1 : 0}`);
    } else if (cmd === 'dump') {
      out.push(raw);
      dump(out);
    } else if (cmd === 'uncond') {
      out.push(raw);
      const t = new Int32Array(BOARDMAX);
      unconditional_life(t, parse_color(a));
      out.push(territory(t));
    } else if (cmd === 'meaningless') {
      out.push(raw);
      clear_unconditionally_meaningless_moves();
      const t = new Int32Array(BOARDMAX);
      for (let color = WHITE; color <= BLACK; color++) {
        unconditional_life(t, color);
        find_unconditionally_meaningless_moves(t, color);
      }
      for (let color = WHITE; color <= BLACK; color++) {
        let line = `meaningless ${color === WHITE ? 'w' : 'b'}`;
        for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
          if (ON_BOARD(pos) && board[pos] === EMPTY) {
            const r = unconditionally_meaningless_move(pos, color);
            if (r !== -1) line += ` ${pos_str(pos)}>${pos_str(r)}`;
          }
        out.push(line);
      }
    } else if (cmd === 'uct') {
      out.push(raw);
      const color = parse_color(a);
      const black_t = new Int32Array(BOARDMAX);
      const white_t = new Int32Array(BOARDMAX);
      const forbidden = new Int32Array(BOARDMAX);
      const allowed = new Int32Array(BOARDMAX);
      unconditional_life(black_t, BLACK);
      unconditional_life(white_t, WHITE);
      for (let pos = BOARDMIN; pos < BOARDMAX; pos++) {
        if (!ON_BOARD(pos)) continue;
        forbidden[pos] = black_t[pos] ? BLACK : white_t[pos] ? WHITE : 0;
        allowed[pos] = board[pos] === EMPTY && is_allowed_move(pos, color) ? 1 : 0;
      }
      gg_srand(parseInt(d, 10));
      const r = uct_genmove(color, forbidden, allowed, parseInt(b, 10));
      out.push(`best ${pos_str(r.move)}`);
      for (let pos = BOARDMIN; pos < BOARDMAX; pos++)
        if (ON_BOARD(pos) && r.move_frequencies[pos])
          out.push(`move ${pos_str(pos)} ${r.move_frequencies[pos]} ${g9(r.move_values[pos])}`);
      out.push(`rand ${gg_urand()}`);
    }
  }
  return out;
}
