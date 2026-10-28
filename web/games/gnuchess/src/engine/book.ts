// Port of src/engine/book.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)
// The book file (PolyGlot format: 16-byte big-endian entries) is read whole through the host's files.

import type { board_t } from './board.ts';
import { list_t } from './list.ts';
import { MOVE_FROM, MOVE_TO, MoveNone } from './move.ts';
import { gen_legal_moves } from './move_gen.ts';
import { A1, A8, C1, C8, E1, E8, G1, G8, H1, H8 } from './square.ts';
import { host, my_fatal, my_random } from './util.ts';

// types
class entry_t {
  key_hi = 0; // uint64 key: the two halves as uint32 numbers
  key_lo = 0;
  move = 0;
  count = 0;
  n = 0;
  sum = 0;
}

// variables
let BookFile: Uint8Array | null = null;
let BookSize = 0;

// scratch objects, made on first use
let entry_scratch: entry_t | undefined;
let list_scratch: list_t | undefined;

// functions

// book_init()
export function book_init(): void {
  BookFile = null;
  BookSize = 0;
}

// book_open()
export function book_open(file_name: string): void {
  BookFile = host.files.read(file_name);
  if (BookFile !== null) {
    BookSize = Math.floor(BookFile.length / 16);
  } else {
    my_fatal('book_open(): can\'t open file "%s": %s\n', file_name, 'No such file or directory');
  }
}

// book_close()
export function book_close(): void {
  BookFile = null;
}

// book_move()
export function book_move(board: board_t): number {
  if (BookFile !== null && BookSize !== 0) {
    const entry = (entry_scratch ??= new entry_t());
    const key_hi = board.key_hi >>> 0, key_lo = board.key_lo >>> 0;
    // draw a move according to a fixed probability distribution
    let best_move = MoveNone;
    let best_score = 0;
    for (let pos = find_pos(key_hi, key_lo); pos < BookSize; pos++) {
      read_entry(entry, pos);
      if (entry.key_hi !== key_hi || entry.key_lo !== key_lo) break;
      const move = entry.move;
      const score = entry.count;
      // pick this move?
      best_score += score;
      if (my_random(best_score) < score) best_move = move;
    }
    if (best_move !== MoveNone) {
      // convert PolyGlot move into Fruit move; TODO: handle promotes
      const list = (list_scratch ??= new list_t());
      gen_legal_moves(list, board);
      for (let i = 0; i < list.size; i++) {
        const move = list.move[i];
        // fix for correct handling of castling moves - PK
        if (MOVE_FROM(move) === E1 && MOVE_TO(move) === G1
          && MOVE_FROM(best_move) === E1 && MOVE_TO(best_move) === H1) return move;
        if (MOVE_FROM(move) === E1 && MOVE_TO(move) === C1
          && MOVE_FROM(best_move) === E1 && MOVE_TO(best_move) === A1) return move;
        if (MOVE_FROM(move) === E8 && MOVE_TO(move) === G8
          && MOVE_FROM(best_move) === E8 && MOVE_TO(best_move) === H8) return move;
        if (MOVE_FROM(move) === E8 && MOVE_TO(move) === C8
          && MOVE_FROM(best_move) === E8 && MOVE_TO(best_move) === A8) return move;
        if ((move & 0o7777) === best_move) return move;
      }
    }
  }
  return MoveNone;
}

// find_pos(): binary search (finds the leftmost entry)
function find_pos(key_hi: number, key_lo: number): number {
  const entry = (entry_scratch ??= new entry_t());
  let left = 0;
  let right = BookSize - 1;
  while (left < right) {
    const mid = ((left + right) / 2) | 0;
    read_entry(entry, mid);
    if (key_hi < entry.key_hi || (key_hi === entry.key_hi && key_lo <= entry.key_lo)) {
      right = mid;
    } else {
      left = mid + 1;
    }
  }
  read_entry(entry, left);
  return (entry.key_hi === key_hi && entry.key_lo === key_lo) ? left : BookSize;
}

// read_entry()
function read_entry(entry: entry_t, n: number): void {
  const b = BookFile as Uint8Array;
  const p = n * 16;
  if (p + 16 > b.length) my_fatal('read_integer(): fgetc(): EOF reached\n');
  entry.key_hi = ((b[p] << 24) | (b[p + 1] << 16) | (b[p + 2] << 8) | b[p + 3]) >>> 0;
  entry.key_lo = ((b[p + 4] << 24) | (b[p + 5] << 16) | (b[p + 6] << 8) | b[p + 7]) >>> 0;
  entry.move = (b[p + 8] << 8) | b[p + 9];
  entry.count = (b[p + 10] << 8) | b[p + 11];
  entry.n = (b[p + 12] << 8) | b[p + 13];
  entry.sum = (b[p + 14] << 8) | b[p + 15];
}
