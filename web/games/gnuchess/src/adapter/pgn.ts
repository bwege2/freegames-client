// Port of src/adapter/pgn.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// The PGN reader book_make.cpp uses. strchr() finds the terminating NUL too: a character 0 (or EOF,
// 256, which becomes 0 as a char) counts as a symbol character, as in the original.

import { isdigit, isspace, sprintf } from '../libc.ts';
import { c_strchr, EOF, errno, fclose, fgetc, fopen, H, my_fatal, my_log, my_string_equal, strerror, type FILE } from './util.ts';

// constants

export const PGN_STRING_SIZE = 256;

const DispMove = false;
const DispToken = false;
const DispChar = false;

const TAB_SIZE = 8;

const CHAR_EOF = 256;

// types

const TOKEN_ERROR = -1;
const TOKEN_EOF = 256;
const TOKEN_SYMBOL = 257;
const TOKEN_STRING = 258;
const TOKEN_INTEGER = 259;
const TOKEN_NAG = 260;
const TOKEN_RESULT = 261;

export class pgn_t {
   file: FILE | null = null;
   char_hack = 0;
   char_line = 0;
   char_column = 0;
   char_unread = false;
   char_first = false;
   token_type = 0;
   token_string = '';
   token_length = 0;
   token_line = 0;
   token_column = 0;
   token_unread = false;
   token_first = false;
   result = '';
   fen = '';
   move_line = 0;
   move_column = 0;
}

/** isspace()/isdigit() of an int: EOF (256 here) is neither */
const c_isspace = (c: number): boolean => c >= 0 && c < 256 && isspace(String.fromCharCode(c));
const c_isdigit = (c: number): boolean => c >= 0 && c < 256 && isdigit(String.fromCharCode(c));
/** (char) c */
const c_char = (c: number): string => String.fromCharCode(c & 255);

// functions

// pgn_open()

export function pgn_open(pgn: pgn_t, file_name: string): void {
   pgn.file = fopen(file_name, 'r');
   if (pgn.file === null) my_fatal('pgn_open(): can\'t open file "%s": %s\n', file_name, strerror(errno));
   pgn.char_hack = CHAR_EOF; // DEBUG
   pgn.char_line = 1;
   pgn.char_column = 0;
   pgn.char_unread = false;
   pgn.char_first = true;
   pgn.token_type = TOKEN_ERROR; // DEBUG
   pgn.token_string = '?'; // DEBUG
   pgn.token_length = -1; // DEBUG
   pgn.token_line = -1; // DEBUG
   pgn.token_column = -1; // DEBUG
   pgn.token_unread = false;
   pgn.token_first = true;
   pgn.result = '?'; // DEBUG
   pgn.fen = '?'; // DEBUG
   pgn.move_line = -1; // DEBUG
   pgn.move_column = -1; // DEBUG
}

// pgn_close()

export function pgn_close(pgn: pgn_t): void {
   if (pgn.file !== null) fclose(pgn.file);
}

// pgn_next_game()

export function pgn_next_game(pgn: pgn_t): boolean {
   let name: string;
   let value: string;
   // init
   pgn.result = '*';
   pgn.fen = '';
   // loop
   while (true) {
      pgn_token_read(pgn);
      if ((pgn.token_type as number) !== 0x5B) break; // '['
      // tag
      pgn_token_read(pgn);
      if ((pgn.token_type as number) !== TOKEN_SYMBOL) {
         my_fatal('pgn_next_game(): malformed tag at line %d, column %d\n', pgn.token_line, pgn.token_column);
      }
      name = pgn.token_string;
      pgn_token_read(pgn);
      if ((pgn.token_type as number) !== TOKEN_STRING) {
         my_fatal('pgn_next_game(): malformed tag at line %d, column %d\n', pgn.token_line, pgn.token_column);
      }
      value = pgn.token_string;
      pgn_token_read(pgn);
      if ((pgn.token_type as number) !== 0x5D) { // ']'
         if (my_string_equal(name, 'Result') || my_string_equal(name, 'FEN')) {
            my_fatal('pgn_next_game(): malformed tag at line %d, column %d\n', pgn.token_line, pgn.token_column);
         } else {
            // Ignore rest of line up to ']'
            my_log('pgn_next_game(): malformed tag at line %d, column %d\n', pgn.token_line, pgn.token_column);
            while ((pgn.char_hack as number) !== 0x5D) {
               pgn_char_read(pgn);
               if ((pgn.char_hack as number) === CHAR_EOF) { // the original reads EOF forever here
                  H.stderr('pgn_next_game(): EOF before \']\'\n');
                  break;
               }
            }
            pgn_char_unread(pgn);
            pgn_token_read(pgn);
            if ((pgn.token_type as number) !== 0x5D) {
               my_fatal('pgn_next_game(): malformed tag at line %d, column %d\n', pgn.token_line, pgn.token_column);
            }
         }
      }
      // special tag?
      if (my_string_equal(name, 'Result')) {
         pgn.result = value;
      } else if (my_string_equal(name, 'FEN')) {
         pgn.fen = value;
      }
   }
   if ((pgn.token_type as number) === TOKEN_EOF) return false;
   pgn_token_unread(pgn);
   return true;
}

// pgn_next_move(): the move, or null at the end of the game

export function pgn_next_move(pgn: pgn_t, size: number): string | null {
   let depth: number;
   let string = '';
   // init
   pgn.move_line = -1; // DEBUG
   pgn.move_column = -1; // DEBUG
   // loop
   depth = 0;
   while (true) {
      pgn_token_read(pgn);
      if ((pgn.token_type as number) === 0x28) { // '('
         // open RAV
         depth++;
      } else if ((pgn.token_type as number) === 0x29) { // ')'
         // close RAV
         if (depth === 0) {
            my_fatal('pgn_next_move(): malformed variation at line %d, column %d\n', pgn.token_line, pgn.token_column);
         }
         depth--;
      } else if ((pgn.token_type as number) === TOKEN_RESULT) {
         // game finished
         if (depth > 0) {
            my_fatal('pgn_next_move(): malformed variation at line %d, column %d\n', pgn.token_line, pgn.token_column);
         }
         return null;
      } else {
         // skip optional move number
         if ((pgn.token_type as number) === TOKEN_INTEGER) {
            do pgn_token_read(pgn); while ((pgn.token_type as number) === 0x2E); // '.'
         }
         // move must be a symbol
         if ((pgn.token_type as number) !== TOKEN_SYMBOL) {
            my_fatal('pgn_next_move(): malformed move at line %d, column %d\n', pgn.token_line, pgn.token_column);
         }
         // store move for later use
         if (depth === 0) {
            if (pgn.token_length >= size) {
               my_fatal('pgn_next_move(): move too long at line %d, column %d\n', pgn.token_line, pgn.token_column);
            }
            string = pgn.token_string;
            pgn.move_line = pgn.token_line;
            pgn.move_column = pgn.token_column;
         }
         // skip optional NAGs
         do pgn_token_read(pgn); while ((pgn.token_type as number) === TOKEN_NAG);
         pgn_token_unread(pgn);
         // return move
         if (depth === 0) {
            if (DispMove) H.stdout(sprintf('move="%s"\n', string));
            return string;
         }
      }
   }
}

// pgn_token_read()

function pgn_token_read(pgn: pgn_t): void {
   // token "stack"
   if (pgn.token_unread) {
      pgn.token_unread = false;
      return;
   }
   // consume the current token
   if (pgn.token_first) {
      pgn.token_first = false;
   }
   // read a new token
   pgn_read_token(pgn);
   if ((pgn.token_type as number) === TOKEN_ERROR) my_fatal('pgn_token_read(): lexical error at line %d, column %d\n', pgn.char_line, pgn.char_column);
   if (DispToken) H.stdout(sprintf('< L%d C%d "%s" (%03X)\n', pgn.token_line, pgn.token_column, pgn.token_string, pgn.token_type));
}

// pgn_token_unread()

function pgn_token_unread(pgn: pgn_t): void {
   pgn.token_unread = true;
}

// pgn_read_token()

function pgn_read_token(pgn: pgn_t): void {
   // skip white-space characters
   pgn_skip_blanks(pgn);
   // init
   pgn.token_type = TOKEN_ERROR;
   pgn.token_string = '';
   pgn.token_length = 0;
   pgn.token_line = pgn.char_line;
   pgn.token_column = pgn.char_column;
   // determine token type
   if ((pgn.char_hack as number) === CHAR_EOF) {
      pgn.token_type = TOKEN_EOF;
   } else if (c_strchr('.[]()<>', pgn.char_hack)) {
      // single-character token
      pgn.token_type = pgn.char_hack;
      pgn.token_string = c_char(pgn.char_hack);
      pgn.token_length = 1;
   } else if ((pgn.char_hack as number) === 0x2A) { // '*'
      pgn.token_type = TOKEN_RESULT;
      pgn.token_string = c_char(pgn.char_hack);
      pgn.token_length = 1;
   } else if ((pgn.char_hack as number) === 0x21) { // '!'
      pgn_char_read(pgn);
      if ((pgn.char_hack as number) === 0x21) { // "!!"
         pgn.token_type = TOKEN_NAG;
         pgn.token_string = '3';
         pgn.token_length = 1;
      } else if ((pgn.char_hack as number) === 0x3F) { // "!?"
         pgn.token_type = TOKEN_NAG;
         pgn.token_string = '5';
         pgn.token_length = 1;
      } else { // "!"
         pgn_char_unread(pgn);
         pgn.token_type = TOKEN_NAG;
         pgn.token_string = '1';
         pgn.token_length = 1;
      }
   } else if ((pgn.char_hack as number) === 0x3F) { // '?'
      pgn_char_read(pgn);
      if ((pgn.char_hack as number) === 0x3F) { // "??"
         pgn.token_type = TOKEN_NAG;
         pgn.token_string = '4';
         pgn.token_length = 1;
      } else if ((pgn.char_hack as number) === 0x21) { // "?!"
         pgn.token_type = TOKEN_NAG;
         pgn.token_string = '6';
         pgn.token_length = 1;
      } else { // "?"
         pgn_char_unread(pgn);
         pgn.token_type = TOKEN_NAG;
         pgn.token_string = '2';
         pgn.token_length = 1;
      }
   } else if (is_symbol_start(pgn.char_hack)) {
      // symbol, integer, or result
      pgn.token_type = TOKEN_INTEGER;
      pgn.token_length = 0;
      let s = '';
      do {
         if (pgn.token_length >= PGN_STRING_SIZE - 1) {
            my_fatal('pgn_read_token(): symbol too long at line %d, column %d\n', pgn.char_line, pgn.char_column);
         }
         if (!c_isdigit(pgn.char_hack)) pgn.token_type = TOKEN_SYMBOL;
         s += c_char(pgn.char_hack);
         pgn.token_length++;
         pgn_char_read(pgn);
      } while (is_symbol_next(pgn.char_hack));
      pgn_char_unread(pgn);
      // the C string ends at the first NUL
      const nul = s.indexOf('\0');
      pgn.token_string = nul < 0 ? s : s.slice(0, nul);
      if (my_string_equal(pgn.token_string, '1-0')
       || my_string_equal(pgn.token_string, '0-1')
       || my_string_equal(pgn.token_string, '1/2-1/2')) {
         pgn.token_type = TOKEN_RESULT;
      }
   } else if ((pgn.char_hack as number) === 0x22) { // '"'
      // string
      pgn.token_type = TOKEN_STRING;
      pgn.token_length = 0;
      let s = '';
      while (true) {
         pgn_char_read(pgn);
         if ((pgn.char_hack as number) === CHAR_EOF) {
            my_fatal('pgn_read_token(): EOF in string at line %d, column %d\n', pgn.char_line, pgn.char_column);
         }
         if ((pgn.char_hack as number) === 0x22) break;
         if ((pgn.char_hack as number) === 0x5C) { // '\\'
            pgn_char_read(pgn);
            if ((pgn.char_hack as number) === CHAR_EOF) {
               my_fatal('pgn_read_token(): EOF in string at line %d, column %d\n', pgn.char_line, pgn.char_column);
            }
            if ((pgn.char_hack as number) !== 0x22 && (pgn.char_hack as number) !== 0x5C) {
               // bad escape, ignore
               if (pgn.token_length >= PGN_STRING_SIZE - 1) {
                  my_fatal('pgn_read_token(): string too long at line %d, column %d\n', pgn.char_line, pgn.char_column);
               }
               s += '\\';
               pgn.token_length++;
            }
         }
         if (pgn.token_length >= PGN_STRING_SIZE - 1) {
            my_fatal('pgn_read_token(): string too long at line %d, column %d\n', pgn.char_line, pgn.char_column);
         }
         s += c_char(pgn.char_hack);
         pgn.token_length++;
      }
      const nul = s.indexOf('\0');
      pgn.token_string = nul < 0 ? s : s.slice(0, nul);
   } else if ((pgn.char_hack as number) === 0x24) { // '$'
      // NAG
      pgn.token_type = TOKEN_NAG;
      pgn.token_length = 0;
      let s = '';
      while (true) {
         pgn_char_read(pgn);
         if (!c_isdigit(pgn.char_hack)) break;
         if (pgn.token_length >= 3) {
            my_fatal('pgn_read_token(): NAG too long at line %d, column %d\n', pgn.char_line, pgn.char_column);
         }
         s += c_char(pgn.char_hack);
         pgn.token_length++;
      }
      pgn_char_unread(pgn);
      if (pgn.token_length === 0) {
         my_fatal('pgn_read_token(): malformed NAG at line %d, column %d\n', pgn.char_line, pgn.char_column);
      }
      pgn.token_string = s;
   } else {
      // unknown token
      // my_fatal("lexical error at line %d, column %d\n",pgn->char_line,pgn->char_column);
   }
}

// pgn_skip_blanks()

function pgn_skip_blanks(pgn: pgn_t): void {
   while (true) {
      pgn_char_read(pgn);
      if (c_isspace(pgn.char_hack)) {
         // skip white space
      } else if ((pgn.char_hack as number) === 0x3B) { // ';'
         // skip comment to EOL
         do {
            pgn_char_read(pgn);
            if ((pgn.char_hack as number) === CHAR_EOF) {
               my_fatal('pgn_skip_blanks(): EOF in comment at line %d, column %d\n', pgn.char_line, pgn.char_column);
            }
         } while ((pgn.char_hack as number) !== 0x0A);
      } else if ((pgn.char_hack as number) === 0x25 && pgn.char_column === 0) { // '%'
         // skip comment to EOL
         do {
            pgn_char_read(pgn);
            if ((pgn.char_hack as number) === CHAR_EOF) {
               my_fatal('pgn_skip_blanks(): EOF in comment at line %d, column %d\n', pgn.char_line, pgn.char_column);
            }
         } while ((pgn.char_hack as number) !== 0x0A);
      } else if ((pgn.char_hack as number) === 0x7B) { // '{'
         // skip comment to next '}'
         do {
            pgn_char_read(pgn);
            if ((pgn.char_hack as number) === CHAR_EOF) {
               my_fatal('pgn_skip_blanks(): EOF in comment at line %d, column %d\n', pgn.char_line, pgn.char_column);
            }
         } while ((pgn.char_hack as number) !== 0x7D);
      } else { // not a white space
         break;
      }
   }
}

// is_symbol_start()

function is_symbol_start(c: number): boolean {
   return c_strchr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789', c);
}

// is_symbol_next()

function is_symbol_next(c: number): boolean {
   return c_strchr('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789_+#=:-/', c);
}

// pgn_char_read()

function pgn_char_read(pgn: pgn_t): void {
   // char "stack"
   if (pgn.char_unread) {
      pgn.char_unread = false;
      return;
   }
   // consume the current character
   if (pgn.char_first) {
      pgn.char_first = false;
   } else {
      // update counters
      if ((pgn.char_hack as number) === 0x0A) {
         pgn.char_line++;
         pgn.char_column = 0;
      } else if ((pgn.char_hack as number) === 0x09) {
         pgn.char_column += TAB_SIZE - (pgn.char_column % TAB_SIZE);
      } else {
         pgn.char_column++;
      }
   }
   // read a new character
   pgn.char_hack = pgn.file === null ? EOF : fgetc(pgn.file);
   if ((pgn.char_hack as number) === EOF) {
      pgn.char_hack = TOKEN_EOF;
   }
   if (DispChar) H.stdout(sprintf("< L%d C%d '%c' (%02X)\n", pgn.char_line, pgn.char_column, pgn.char_hack, pgn.char_hack));
}

// pgn_char_unread()

function pgn_char_unread(pgn: pgn_t): void {
   pgn.char_unread = true;
}
