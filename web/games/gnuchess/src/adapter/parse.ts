// Port of src/adapter/parse.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)
// match() truncates each star of the C string in place; here Star[] holds the truncated strings.

import { my_string_equal } from './util.ts';

// constants

export const STAR_NUMBER = 16;
export const KEYWORD_NUMBER = 256;

const StringSize = 256;

// types

export class parse_t {
   string = '';
   pos = 0;
   keyword_nb = 0;
   keyword: string[] = [];
}

// variables

export const Star: string[] = new Array<string>(STAR_NUMBER).fill('');

// functions

// match()

export function match(string: string, pattern: string): boolean {
   return match_rec(string, 0, pattern, 0, 0);
}

// match_rec()

function match_rec(string: string, s: number, pattern: string, p: number, star: number): boolean {
   let c: string;
   // iterative matches
   while ((c = pattern[p++] ?? '\0') !== '*') {
      if (c === '\0') { // end of pattern
         while (string[s] === ' ') s++; // skip trailing spaces
         return s >= string.length;
      } else if (c === ' ') { // spaces
         if (string[s++] !== ' ') return false; // mismatch
         while (string[s] === ' ') s++; // skip trailing spaces
      } else { // normal character
         if (string[s++] !== c) return false; // mismatch
      }
   }
   // recursive wildcard match
   while (string[s] === ' ') s++; // skip leading spaces
   const start = s; // remember beginning of star
   while (s < string.length) { // reject empty-string match
      c = string[s++];
      if (c !== ' ' && match_rec(string, s, pattern, p, star + 1)) { // shortest match
         if (star < STAR_NUMBER) Star[star] = string.slice(start, s); // truncate star
         return true;
      }
   }
   return false;
}

// parse_is_ok()

export function parse_is_ok(parse: parse_t): boolean {
   if (parse.pos < 0 || parse.pos > parse.string.length) return false;
   if (parse.keyword_nb < 0 || parse.keyword_nb >= KEYWORD_NUMBER) return false;
   return true;
}

// parse_open()

export function parse_open(parse: parse_t, string: string): void {
   parse.string = string;
   parse.pos = 0;
   parse.keyword_nb = 0;
   parse.keyword = [];
}

// parse_close()

export function parse_close(parse: parse_t): void {
   parse.string = '';
   parse.pos = 0;
   parse.keyword = [];
   parse.keyword_nb = 0;
}

// parse_add_keyword()

export function parse_add_keyword(parse: parse_t, keyword: string): void {
   if (parse.keyword_nb < KEYWORD_NUMBER) {
      parse.keyword[parse.keyword_nb] = keyword;
      parse.keyword_nb++;
   }
}

const at = (s: string, i: number): string => (i < s.length ? s[i] : '\0');

// parse_get_word(): the word (empty when there is none; C returns pos > 0 and the word in string)

export function parse_get_word(parse: parse_t, size: number): string {
   // skip blanks
   for (; at(parse.string, parse.pos) === ' '; parse.pos++);
   // copy word
   let string = '';
   while (true) {
      let c = at(parse.string, parse.pos);
      if (c === ' ' || string.length >= size - 1) c = '\0';
      if (c === '\0') break;
      string += c;
      parse.pos++;
   }
   return string; // non-empty word?
}

// parse_get_string()

export function parse_get_string(parse: parse_t, size: number): string {
   // skip blanks
   for (; at(parse.string, parse.pos) === ' '; parse.pos++);
   // copy string
   let string = '';
   while (true) {
      const before = parse.pos;
      if (string.length >= size - 1 && before > 0 && at(parse.string, before) === ' ') break; // C loops forever here
      const parse_2 = new parse_t();
      parse_open(parse_2, parse.string.slice(parse.pos));
      const word = parse_get_word(parse_2, StringSize);
      if (word === '') {
         parse_close(parse_2);
         break;
      }
      let keyword = false;
      for (let i = 0; i < parse.keyword_nb; i++) {
         if (my_string_equal(parse.keyword[i], word)) {
            keyword = true;
            break;
         }
      }
      parse_close(parse_2);
      if (keyword) break;
      // copy spaces
      while (true) {
         let c = at(parse.string, parse.pos);
         if (c !== ' ') break;
         if (string.length >= size - 1) c = '\0';
         if (c === '\0') break;
         string += c;
         parse.pos++;
      }
      // copy non spaces
      while (true) {
         let c = at(parse.string, parse.pos);
         if (c === ' ' || string.length >= size - 1) c = '\0';
         if (c === '\0') break;
         string += c;
         parse.pos++;
      }
   }
   return string; // non-empty string?
}
