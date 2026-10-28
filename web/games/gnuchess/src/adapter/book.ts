// Port of src/adapter/book.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// The PolyGlot opening book: 16-byte entries (key, move, count, n, sum), big-endian, sorted by key.

import type { board_t } from './board.ts';
import { MoveNone } from './move.ts';
import { move_is_legal } from './move_legal.ts';
import { move_to_san } from './san.ts';
import { EOF, ExitSignal, fflush, fgetc, feof, fopen, fputc, fseek, ftell, H, my_fatal, my_random_int, SEEK_END, SEEK_SET, strerror, errno, type FILE } from './util.ts';
import { sprintf } from '../libc.ts';

// constants

export const BookReadOnly = 1;
export const BookReadWrite = 2;

// types

class entry_t {
   key = 0n;
   move = 0;
   count = 0;
   n = 0;
   sum = 0;
}

// variables

let BookFile: FILE | null = null;
let BookSize = 0;

// functions

// book_clear()

export function book_clear(): void {
   BookFile = null;
   BookSize = 0;
}

// book_open()

export function book_open(file_name: string | null, mode: number): void {
   let file_open_mode: string;
   if (mode === BookReadWrite) {
      file_open_mode = 'rb+';
   } else {
      file_open_mode = 'rb';
   }
   BookFile = fopen(file_name, file_open_mode);
   if (BookFile === null) {
      my_fatal('book_open(): can\'t open file "%s": %s\n', file_name, strerror(errno));
   } else {
      fseek(BookFile, 0, SEEK_END);
      BookSize = Math.trunc(ftell(BookFile) / 16);
      if (BookSize === 0) my_fatal('book_open(): empty file\n');
   }
}

// book_close()

export function book_close(): void {
   if (BookFile !== null) fflush(BookFile);
}

// is_in_book()

export function is_in_book(board: board_t): boolean {
   const entry = new entry_t();
   for (let pos = find_pos(board.key); pos < BookSize; pos++) {
      read_entry(entry, pos);
      if (entry.key === board.key) return true;
   }
   return false;
}

// book_move() (both of book.cpp's book_move(board,random) and book_move(board,random,worst): the
// two-argument one is the three-argument one with worst false)

export function book_move(board: board_t, random: boolean, worst = false): number {
   let worst_move: number;
   let worst_score: number;
   let best_move: number;
   let best_score: number;
   const entry = new entry_t();
   let move: number;
   let score: number;
   worst_move = MoveNone;
   worst_score = 10000;
   best_move = MoveNone;
   best_score = 0;
   for (let pos = find_pos(board.key); pos < BookSize; pos++) {
      read_entry(entry, pos);
      if (entry.key !== board.key) break;
      move = entry.move;
      score = entry.count;
      if (move !== MoveNone && move_is_legal(move, board)) {
         // pick this move?
         if (worst) {
            if (score < worst_score) {
               worst_move = move;
               worst_score = score;
            }
         } else if (random) {
            best_score += score;
            if (my_random_int(best_score) < score) best_move = move;
         } else {
            if (score > best_score) {
               best_move = move;
               best_score = score;
            }
         }
      }
   }
   if (worst) {
      best_move = worst_move;
   }
   return best_move;
}

// book_disp()

export function book_disp(board: board_t): void {
   let sum: number;
   let pos: number;
   const entry = new entry_t();
   let move: number;
   let score: number;
   const first_pos = find_pos(board.key);
   // sum
   sum = 0;
   for (pos = first_pos; pos < BookSize; pos++) {
      read_entry(entry, pos);
      if (entry.key !== board.key) break;
      sum += entry.count;
   }
   // disp
   for (pos = first_pos; pos < BookSize; pos++) {
      read_entry(entry, pos);
      if (entry.key !== board.key) break;
      move = entry.move;
      score = entry.count;
      if (score > 0 && move !== MoveNone && move_is_legal(move, board)) {
         const move_string = move_to_san(move, board);
         H.stdout(sprintf(' %s (%.0f%%)\n', move_string, (score / sum) * 100.0));
      }
   }
   H.stdout('\n');
}

// book_learn_move()

export function book_learn_move(board: board_t, move: number, result: number): void {
   const entry = new entry_t();
   for (let pos = find_pos(board.key); pos < BookSize; pos++) {
      read_entry(entry, pos);
      if (entry.key !== board.key) break;
      if (entry.move === move) {
         entry.n = (entry.n + 1) & 0xFFFF;
         entry.sum = (entry.sum + result + 1) & 0xFFFF;
         write_entry(entry, pos);
         break;
      }
   }
}

// book_flush()

export function book_flush(): void {
   if (BookFile === null) return; // fflush(NULL) flushes every stream
   if (fflush(BookFile) === EOF) {
      my_fatal('book_flush(): fflush(): %s\n', strerror(errno));
   }
}

// find_pos()

function find_pos(key: bigint): number {
   let left: number, right: number, mid: number;
   const entry = new entry_t();
   // binary search (finds the leftmost entry)
   left = 0;
   right = BookSize - 1;
   while (left < right) {
      mid = Math.trunc((left + right) / 2);
      read_entry(entry, mid);
      if (key <= entry.key) {
         right = mid;
      } else {
         left = mid + 1;
      }
   }
   read_entry(entry, left);
   return entry.key === key ? left : BookSize;
}

/** a NULL BookFile (the book could not be opened) makes the original crash in fseek() */
function book_file(): FILE {
   if (BookFile === null) {
      H.stderr('Segmentation fault\n');
      H.exit(139);
      throw new ExitSignal(139);
   }
   return BookFile;
}

// read_entry()

function read_entry(entry: entry_t, n: number): void {
   const file = book_file();
   fseek(file, n * 16, SEEK_SET);
   entry.key = read_integer(file, 8);
   entry.move = Number(read_integer(file, 2));
   entry.count = Number(read_integer(file, 2));
   entry.n = Number(read_integer(file, 2));
   entry.sum = Number(read_integer(file, 2));
}

// write_entry()

function write_entry(entry: entry_t, n: number): void {
   const file = book_file();
   fseek(file, n * 16, SEEK_SET);
   write_integer(file, 8, entry.key);
   write_integer(file, 2, BigInt(entry.move));
   write_integer(file, 2, BigInt(entry.count));
   write_integer(file, 2, BigInt(entry.n));
   write_integer(file, 2, BigInt(entry.sum));
}

// read_integer()

function read_integer(file: FILE, size: number): bigint {
   let n = 0n;
   for (let i = 0; i < size; i++) {
      const b = fgetc(file);
      if (b === EOF) {
         if (feof(file)) {
            my_fatal('read_integer(): fgetc(): EOF reached\n');
         }
         n = 0xFFFFFFFFFFFFFFFFn; // (n << 8) | EOF in C
         continue;
      }
      n = ((n << 8n) | BigInt(b)) & 0xFFFFFFFFFFFFFFFFn;
   }
   return n;
}

// write_integer()

function write_integer(file: FILE, size: number, n: bigint): void {
   for (let i = size - 1; i >= 0; i--) {
      const b = Number((n >> BigInt(i * 8)) & 0xFFn);
      fputc(b, file);
   }
}
