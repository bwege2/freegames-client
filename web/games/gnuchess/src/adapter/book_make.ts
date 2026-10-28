// Port of src/adapter/book_make.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// What the frontend's "book add FILE.pgn" runs: reads the games, keeps the moves played often enough
// and writes a PolyGlot book (book.bin in the working directory).

import { board_start, board_t } from './board.ts';
import { colour_is_black, colour_is_white } from './colour.ts';
import { MoveNone } from './move.ts';
import { move_is_legal } from './move_legal.ts';
import { move_do } from './move_do.ts';
import { pgn_close, pgn_next_game, pgn_next_move, pgn_open, pgn_t } from './pgn.ts';
import { move_from_san } from './san.ts';
import { errno, fclose, fopen, fputc, H, my_fatal, my_string_equal, strerror, type FILE } from './util.ts';
import { atof, atoi, sprintf } from '../libc.ts';

// constants

const COUNT_MAX = 16384;

const NIL = -1;

// types

/** the book's entries as parallel arrays (entry_t: key, move, n, sum, colour; 16 bytes each in C) */
class book_t {
   size = 0;
   alloc = 0;
   mask = 0; // uint32
   key: bigint[] = [];
   key_lo: number[] = []; // the key's low 32 bits, for the hash index
   move: number[] = []; // uint16
   n: number[] = []; // uint16
   sum: number[] = []; // uint16
   colour: number[] = []; // uint16
   hash = new Int32Array(0);
}

// variables

let MaxPly = 0;
let MinGame = 0;
let MinScore = 0.0;
let RemoveWhite = false, RemoveBlack = false;
let Uniform = false;

let Book = new book_t();

// functions

// book_make()

export function book_make(argc: number, argv: (string | null)[]): void {
   let i: number;
   let pgn_file = 'book.pgn';
   let bin_file = 'book.bin';
   MaxPly = 1024;
   MinGame = 3;
   MinScore = 0.0;
   RemoveWhite = false;
   RemoveBlack = false;
   Uniform = false;
   const arg = (j: number): string | null => (j < argc ? argv[j] : null);
   for (i = 1; i < argc; i++) {
      const a = arg(i) ?? '';
      if (my_string_equal(a, 'make-book')) {
         // skip
      } else if (my_string_equal(a, '-pgn')) {
         i++;
         if (arg(i) === null) my_fatal('book_make(): missing argument\n');
         pgn_file = arg(i) ?? '';
      } else if (my_string_equal(a, '-bin')) {
         i++;
         if (arg(i) === null) my_fatal('book_make(): missing argument\n');
         bin_file = arg(i) ?? '';
      } else if (my_string_equal(a, '-max-ply')) {
         i++;
         if (arg(i) === null) my_fatal('book_make(): missing argument\n');
         MaxPly = atoi(arg(i) ?? '');
      } else if (my_string_equal(a, '-min-game')) {
         i++;
         if (arg(i) === null) my_fatal('book_make(): missing argument\n');
         MinGame = atoi(arg(i) ?? '');
      } else if (my_string_equal(a, '-min-score')) {
         i++;
         if (arg(i) === null) my_fatal('book_make(): missing argument\n');
         MinScore = atof(arg(i) ?? '') / 100.0;
      } else if (my_string_equal(a, '-only-white')) {
         RemoveWhite = false;
         RemoveBlack = true;
      } else if (my_string_equal(a, '-only-black')) {
         RemoveWhite = true;
         RemoveBlack = false;
      } else if (my_string_equal(a, '-uniform')) {
         Uniform = true;
      } else {
         my_fatal('book_make(): unknown option "%s"\n', a);
      }
   }
   book_clear();
   H.stdout('inserting games ...\n');
   book_insert(pgn_file);
   H.stdout('filtering entries ...\n');
   book_filter();
   H.stdout('sorting entries ...\n');
   book_sort();
   H.stdout('saving entries ...\n');
   book_save(bin_file);
   H.stdout('all done!\n');
}

// book_clear()

function book_clear(): void {
   Book = new book_t();
   Book.alloc = 1;
   Book.mask = (Book.alloc * 2) - 1;
   Book.size = 0;
   Book.hash = new Int32Array(Book.alloc * 2).fill(NIL);
}

// book_insert()

function book_insert(file_name: string): void {
   let game_nb: number;
   const pgn = new pgn_t();
   const board = new board_t();
   let ply: number;
   let result: number;
   let string: string | null;
   let move: number;
   let pos: number;
   // init
   game_nb = 0;
   // scan loop
   pgn_open(pgn, file_name);
   while (pgn_next_game(pgn)) {
      board_start(board);
      ply = 0;
      result = 0;
      if (my_string_equal(pgn.result, '1-0')) {
         result = +1;
      } else if (my_string_equal(pgn.result, '0-1')) {
         result = -1;
      }
      while ((string = pgn_next_move(pgn, 256)) !== null) {
         if (ply < MaxPly) {
            move = move_from_san(string, board);
            if (move === MoveNone || !move_is_legal(move, board)) {
               my_fatal('book_insert(): illegal move "%s" at line %d, column %d\n', string, pgn.move_line, pgn.move_column);
            }
            pos = find_entry(board, move);
            Book.n[pos] = (Book.n[pos] + 1) & 0xFFFF;
            Book.sum[pos] = (Book.sum[pos] + result + 1) & 0xFFFF;
            if (Book.n[pos] >= COUNT_MAX) {
               halve_stats(board.key);
            }
            move_do(board, move);
            ply++;
            result = -result;
         }
      }
      game_nb++;
      if (game_nb % 10000 === 0) H.stdout(sprintf('%d games ...\n', game_nb));
   }
   pgn_close(pgn);
   H.stdout(sprintf('%d game%s.\n', game_nb, game_nb > 1 ? 's' : ''));
   H.stdout(sprintf('%d entries.\n', Book.size));
}

// book_filter()

function book_filter(): void {
   let src: number, dst: number;
   // entry loop
   dst = 0;
   for (src = 0; src < Book.size; src++) {
      if (keep_entry(src)) {
         Book.key[dst] = Book.key[src];
         Book.key_lo[dst] = Book.key_lo[src];
         Book.move[dst] = Book.move[src];
         Book.n[dst] = Book.n[src];
         Book.sum[dst] = Book.sum[src];
         Book.colour[dst] = Book.colour[src];
         dst++;
      }
   }
   Book.size = dst;
   H.stdout(sprintf('%d entries.\n', Book.size));
}

// book_sort()

function book_sort(): void {
   // sort keys for binary search (glibc's qsort() is a merge sort: stable, as Array.prototype.sort)
   const order: number[] = [];
   for (let i = 0; i < Book.size; i++) order.push(i);
   order.sort((p1, p2) => key_compare(p1, p2));
   const key = order.map((i) => Book.key[i]);
   const key_lo = order.map((i) => Book.key_lo[i]);
   const move = order.map((i) => Book.move[i]);
   const n = order.map((i) => Book.n[i]);
   const sum = order.map((i) => Book.sum[i]);
   const colour = order.map((i) => Book.colour[i]);
   Book.key = key;
   Book.key_lo = key_lo;
   Book.move = move;
   Book.n = n;
   Book.sum = sum;
   Book.colour = colour;
}

// book_save()

function book_save(file_name: string): void {
   const file = fopen(file_name, 'wb');
   if (file === null) {
      my_fatal('book_save(): can\'t open file "%s" for writing: %s\n', file_name, strerror(errno));
      return;
   }
   // entry loop
   for (let pos = 0; pos < Book.size; pos++) {
      write_integer(file, 8, Book.key[pos]);
      write_integer(file, 2, BigInt(Book.move[pos]));
      write_integer(file, 2, BigInt(entry_score(pos)));
      write_integer(file, 2, 0n);
      write_integer(file, 2, 0n);
   }
   fclose(file);
}

// find_entry()

function find_entry(board: board_t, move: number): number {
   let index: number;
   let pos: number;
   // init
   const key = board.key;
   const lo = Number(key & 0xFFFFFFFFn);
   // search
   for (index = (lo & Book.mask) >>> 0; (pos = Book.hash[index]) !== NIL; index = ((index + 1) & Book.mask) >>> 0) {
      if (Book.key[pos] === key && Book.move[pos] === move) {
         return pos; // found
      }
   }
   // not found
   if (Book.size === Book.alloc) {
      // allocate more memory
      resize();
      for (index = (lo & Book.mask) >>> 0; Book.hash[index] !== NIL; index = ((index + 1) & Book.mask) >>> 0);
   }
   // create a new entry
   pos = Book.size++;
   Book.key[pos] = key;
   Book.key_lo[pos] = lo;
   Book.move[pos] = move;
   Book.n[pos] = 0;
   Book.sum[pos] = 0;
   Book.colour[pos] = board.turn;
   // insert into the hash table
   Book.hash[index] = pos;
   return pos;
}

// resize()

function resize(): void {
   let size: number;
   let index: number;
   Book.alloc *= 2;
   Book.mask = ((Book.alloc * 2) - 1) >>> 0;
   size = 0;
   size += Book.alloc * 16; // sizeof(entry_t)
   size += (Book.alloc * 2) * 4; // sizeof(sint32)
   if (size >= 1048576) H.stdout(sprintf('allocating %gMB ...\n', size / 1048576.0));
   // resize arrays
   Book.hash = new Int32Array(Book.alloc * 2);
   // rebuild hash table
   for (index = 0; index < Book.alloc * 2; index++) {
      Book.hash[index] = NIL;
   }
   for (let pos = 0; pos < Book.size; pos++) {
      for (index = (Book.key_lo[pos] & Book.mask) >>> 0; Book.hash[index] !== NIL; index = ((index + 1) & Book.mask) >>> 0);
      Book.hash[index] = pos;
   }
}

// halve_stats()

function halve_stats(key: bigint): void {
   let index: number;
   let pos: number;
   const lo = Number(key & 0xFFFFFFFFn);
   // search
   for (index = (lo & Book.mask) >>> 0; (pos = Book.hash[index]) !== NIL; index = ((index + 1) & Book.mask) >>> 0) {
      if (Book.key[pos] === key) {
         Book.n[pos] = Math.trunc((Book.n[pos] + 1) / 2);
         Book.sum[pos] = Math.trunc((Book.sum[pos] + 1) / 2);
      }
   }
}

// keep_entry()

function keep_entry(pos: number): boolean {
   // if (entry->n == 0) return false;
   if (Book.n[pos] < MinGame) return false;
   if (Book.sum[pos] === 0) return false;
   const score = (Book.sum[pos] / Book.n[pos]) / 2.0;
   if (score < MinScore) return false;
   const colour = Book.colour[pos];
   if ((RemoveWhite && colour_is_white(colour))
    || (RemoveBlack && colour_is_black(colour))) {
      return false;
   }
   if (entry_score(pos) === 0) return false; // REMOVE ME?
   return true;
}

// entry_score()

function entry_score(pos: number): number {
   let score: number;
   // score = entry->n; // popularity
   score = Book.sum[pos]; // "expectancy"
   if (Uniform) score = 1;
   return score;
}

// key_compare()

function key_compare(p1: number, p2: number): number {
   if (Book.key[p1] > Book.key[p2]) {
      return +1;
   } else if (Book.key[p1] < Book.key[p2]) {
      return -1;
   } else {
      return entry_score(p2) - entry_score(p1); // highest score first
   }
}

// write_integer()

function write_integer(file: FILE, size: number, n: bigint): void {
   for (let i = size - 1; i >= 0; i--) {
      const b = Number((n >> BigInt(i * 8)) & 0xFFn);
      fputc(b, file);
   }
}
