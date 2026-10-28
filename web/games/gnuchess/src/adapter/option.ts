// Port of src/adapter/option.cpp of GNU Chess 6.3.0 (PolyGlot 1.4 by Fabien Letouzey)

import { PKGDATADIR } from '../host.ts';
import { atof, atoi } from '../libc.ts';
import { H, MaxFileNameSize, my_fatal, my_log, my_string_case_equal, my_string_equal } from './util.ts';

// constants

const UseDebug = false;

// types

interface option_t {
   var: string;
   val: string | null;
}

// variables

const OptionNames = [
   'OptionFile', // string
   // options
   'EngineName', // string
   'EngineDir', // string
   'EngineCommand', // string
   'Log', // true/false
   'LogFile', // string
   'Chess960', // true/false
   'Resign', // true/false
   'ResignMoves', // move number
   'ResignScore', // centipawns
   'MateScore', // centipawns
   'Book', // true/false
   'BookFile', // string
   'BookRandom', // true/false
   'BookWorst', // true/false
   'BookLearn', // true/false
   'KibitzMove', // true/false
   'KibitzPV', // true/false
   'KibitzCommand', // string
   'KibitzDelay', // seconds
   'ShowPonder', // true/false
   // work-arounds
   'UCIVersion', // 1-
   'CanPonder', // true/false
   'SyncStop', // true/false
   'PromoteWorkAround', // true/false
];

let Option: option_t[] = [];

// functions

// option_init()

export function option_init(): void {
   Option = OptionNames.map((v) => ({ var: v, val: null }));
   // option file
   const optionName = 'gnuchess.ini';
   const xdg_config_home = H.getenv('XDG_CONFIG_HOME');
   const xdg_config_subdir = '/gnuchess/';
   const homedir = H.getenv('HOME');
   const home_subdir = '/.config/gnuchess/';
   let file_found: string | null = null;
   if (xdg_config_home !== undefined && xdg_config_home.length > 0) {
      file_found = option_file_find(xdg_config_home, xdg_config_subdir, optionName);
   }
   if (file_found === null && homedir !== undefined) {
      file_found = option_file_find(homedir, home_subdir, optionName);
   }
   // options
   if (file_found !== null) {
      option_set('OptionFile', file_found);
   }
   option_set('EngineName', 'GNU Chess');
   option_set('EngineDir', '.');
   option_set('EngineCommand', '<empty>');
   option_set('Log', 'false');
   option_set('LogFile', 'adapter.log');
   option_set('Chess960', 'false');
   option_set('Resign', 'false');
   option_set('ResignMoves', '3');
   option_set('ResignScore', '600');
   option_set('MateScore', '10000');
   option_set('Book', 'false');
   const bookFilePath = get_default_book_file_path(MaxFileNameSize, 'smallbook.bin');
   option_set('BookFile', bookFilePath);
   option_set('BookRandom', 'true');
   option_set('BookWorst', 'false');
   option_set('BookLearn', 'false');
   option_set('KibitzMove', 'false');
   option_set('KibitzPV', 'false');
   option_set('KibitzCommand', 'tellall');
   option_set('KibitzDelay', '5');
   option_set('ShowPonder', 'true');
   // work-arounds
   option_set('UCIVersion', '2');
   option_set('CanPonder', 'false');
   option_set('SyncStop', 'false');
   option_set('PromoteWorkAround', 'false');
   // option_set("","");
}

// option_set()

export function option_set(var_: string, val: string): boolean {
   const opt = option_find(var_);
   if (opt === null) return false;
   opt.val = val;
   if (UseDebug) my_log('POLYGLOT OPTION SET "%s" -> "%s"\n', opt.var, opt.val);
   return true;
}

// option_get()

export function option_get(var_: string): string | null {
   const opt = option_find(var_);
   if (opt === null) {
      my_fatal('option_get(): unknown option "%s"\n', var_);
      return null;
   }
   if (UseDebug) my_log('POLYGLOT OPTION GET "%s" -> "%s"\n', opt.var, opt.val);
   return opt.val;
}

// option_get_bool()

export function option_get_bool(var_: string): boolean {
   const val = option_get(var_) ?? '';
   if (my_string_case_equal(val, 'true') || my_string_case_equal(val, 'yes') || my_string_equal(val, '1')) {
      return true;
   } else if (my_string_case_equal(val, 'false') || my_string_case_equal(val, 'no') || my_string_equal(val, '0')) {
      return false;
   }
   return false;
}

// option_get_double()

export function option_get_double(var_: string): number {
   return atof(option_get(var_) ?? '');
}

// option_get_int()

export function option_get_int(var_: string): number {
   return atoi(option_get(var_) ?? '');
}

// option_get_string(): NULL for OptionFile when no option file was found

export function option_get_string(var_: string): string | null {
   return option_get(var_);
}

// option_find()

function option_find(var_: string): option_t | null {
   for (const opt of Option) {
      if (my_string_case_equal(opt.var, var_)) return opt;
   }
   return null;
}

// option_file_find(): the file's path if it can be read, else null

function option_file_find(dir: string, subdir: string, filename: string): string | null {
   if (dir.length + subdir.length + filename.length <= MaxFileNameSize) {
      const optionFile = dir + subdir + filename;
      if (H.files.exists(optionFile)) { // access(optionFile, R_OK) == 0
         return optionFile;
      }
   } else {
      my_fatal('option_file_find(): option file name is too long. "%s%s%s". Max chars: %d.\n', dir, subdir, filename);
   }
   return null;
}

// get_default_book_file_path

function get_default_book_file_path(maxFilePathLength: number, bookFile: string): string {
   if (PKGDATADIR.length + 1 + bookFile.length <= maxFilePathLength) {
      return PKGDATADIR + '/' + bookFile;
   }
   return ''; // the C buffer stays uninitialised
}
