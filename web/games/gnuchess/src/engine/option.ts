// Port of src/engine/option.cpp of GNU Chess 6.3.0 (Fruit 2.1 by Fabien Letouzey)

import { PKGDATADIR } from '../host.ts';
import { atoi } from '../libc.ts';
import { send } from './protocol.ts';
import { my_fatal, my_string_equal } from './util.ts';

// types
interface option_t {
  var: string;
  declare: boolean;
  init: string;
  type: string;
  extra: string;
  val: string | null;
}

// variables
const OptionTable: readonly (readonly [string, boolean, string, string, string])[] = [
  ['Hash', true, '16', 'spin', 'min 4 max 1024'],
  ['Ponder', true, 'false', 'check', ''],
  ['OwnBook', true, 'false', 'check', ''],
  ['BookFile', true, 'smallbook.bin', 'string', ''],
  ['NullMove Pruning', true, 'Fail High', 'combo', 'var Always var Fail High var Never'],
  ['NullMove Reduction', true, '3', 'spin', 'min 1 max 3'],
  ['Verification Search', true, 'Endgame', 'combo', 'var Always var Endgame var Never'],
  ['Verification Reduction', true, '5', 'spin', 'min 1 max 6'],
  ['History Pruning', true, 'true', 'check', ''],
  ['History Threshold', true, '60', 'spin', 'min 0 max 100'],
  ['Futility Pruning', true, 'false', 'check', ''],
  ['Futility Margin', true, '100', 'spin', 'min 0 max 500'],
  ['Delta Pruning', true, 'false', 'check', ''],
  ['Delta Margin', true, '50', 'spin', 'min 0 max 500'],
  ['Quiescence Check Plies', true, '1', 'spin', 'min 0 max 2'],
  ['Material', true, '100', 'spin', 'min 0 max 400'],
  ['Piece Activity', true, '100', 'spin', 'min 0 max 400'],
  ['King Safety', true, '100', 'spin', 'min 0 max 400'],
  ['Pawn Structure', true, '100', 'spin', 'min 0 max 400'],
  ['Passed Pawns', true, '100', 'spin', 'min 0 max 400'],
];

let Option: option_t[] = [];

// functions

// option_init()
export function option_init(): void {
  Option = OptionTable.map(([v, declare, init, type, extra]) => ({ var: v, declare, init, type, extra, val: null }));
  for (const opt of Option) {
    option_set(opt.var, opt.init);
  }
  // Add default book path
  const MaxFileNameSize = 256;
  option_set('BookFile', get_default_book_file_path(MaxFileNameSize, option_get('BookFile')));
}

// option_list()
export function option_list(): void {
  for (const opt of Option) {
    if (opt.declare) {
      if (opt.extra !== '') {
        send('option name %s type %s default %s %s', opt.var, opt.type, opt.val, opt.extra);
      } else {
        send('option name %s type %s default %s', opt.var, opt.type, opt.val);
      }
    }
  }
}

// option_set()
export function option_set(v: string, val: string): boolean {
  const opt = option_find(v);
  if (opt === null) return false;
  opt.val = val;
  return true;
}

// option_get()
export function option_get(v: string): string {
  const opt = option_find(v);
  if (opt === null) my_fatal('option_get(): unknown option "%s"\n', v);
  return opt.val as string;
}

// option_get_bool()
export function option_get_bool(v: string): boolean {
  const val = option_get(v);
  if (my_string_equal(val, 'true') || my_string_equal(val, 'yes') || my_string_equal(val, '1')) {
    return true;
  } else if (my_string_equal(val, 'false') || my_string_equal(val, 'no') || my_string_equal(val, '0')) {
    return false;
  }
  return false;
}

// option_get_int()
export function option_get_int(v: string): number {
  return atoi(option_get(v));
}

// option_get_string()
export function option_get_string(v: string): string {
  return option_get(v);
}

// option_find()
function option_find(v: string): option_t | null {
  for (const opt of Option) {
    if (my_string_equal(opt.var, v)) return opt;
  }
  return null;
}

// get_default_book_file_path(): PKGDATADIR "/" bookFile, if it fits (else the buffer stays uninitialised;
// the path always fits here)
function get_default_book_file_path(maxFilePathLength: number, bookFile: string): string {
  if (PKGDATADIR.length + 1 + bookFile.length <= maxFilePathLength) {
    return PKGDATADIR + '/' + bookFile;
  }
  return '';
}
