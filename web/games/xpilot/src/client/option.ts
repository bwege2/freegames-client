// option.c: the client's options (every module stores its table), the key bindings, xpilotrc
// reading and writing (the file lives in account storage, sys.readFile/writeFile), \set and \get.
import { G } from './G.ts';
import { sys, ClientExit } from './sys.ts';
import { audioInit } from './caudio.ts';
import { KEY_DUMMY, XP_KS_UNKNOWN, XP_OPTFLAG_KEEP, XP_OPTFLAG_NEVER_SAVE, MSG_LEN, MAX_CHARS } from './consts.ts';
import { atof, atoi, isspace, LIMIT, onReset, snprintf, sprintf, strcasecmp, strlcpy, strncasecmp, strtokAll } from './cutil.ts';
import { ON, OFF } from './xpmath.ts';
import { warn } from './error.ts';
import { Add_message } from './messages.ts';
import { XStringToKeysym, NoSymbol } from '../xlib/xlib.ts';

export const xp_noarg_option = 0, xp_bool_option = 1, xp_int_option = 2, xp_double_option = 3, xp_string_option = 4, xp_key_option = 5;
export const xp_option_origin_default = 0, xp_option_origin_cmdline = 1, xp_option_origin_env = 2, xp_option_origin_xpilotrc = 3,
  xp_option_origin_config = 4, xp_option_origin_setcmd = 5;

export interface Ref<T> { get(): T; set(v: T): void }
/** &obj.key */
export function ref<O, K extends keyof O>(o: O | (() => O), k: K): Ref<O[K]> {
  const obj = typeof o === 'function' ? (o as () => O) : () => o as O;
  return { get: () => obj()[k], set: (v) => { obj()[k] = v; } };
}

export interface xp_option_t {
  type: number;
  name: string;
  flags: number;
  origin: number;
  help: string;
  private_data: unknown;
  noarg_ptr: Ref<boolean> | null;
  bool_defval: boolean;
  bool_ptr: Ref<boolean> | null;
  bool_setfunc: ((opt: xp_option_t, v: boolean) => boolean) | null;
  int_defval: number;
  int_minval: number;
  int_maxval: number;
  int_ptr: Ref<number> | null;
  int_setfunc: ((opt: xp_option_t, v: number) => boolean) | null;
  dbl_defval: number;
  dbl_minval: number;
  dbl_maxval: number;
  dbl_ptr: Ref<number> | null;
  dbl_setfunc: ((opt: xp_option_t, v: number) => boolean) | null;
  str_defval: string | null;
  str_ptr: Ref<string> | null;
  str_size: number;
  str_setfunc: ((opt: xp_option_t, v: string) => boolean) | null;
  str_getfunc: ((opt: xp_option_t) => string) | null;
  key_defval: string | null;
  key_string: string | null;
  key: number;
}

function blank(type: number, name: string, flags: number, help: string): xp_option_t {
  return {
    type, name, flags, origin: xp_option_origin_default, help, private_data: null, noarg_ptr: null,
    bool_defval: false, bool_ptr: null, bool_setfunc: null,
    int_defval: 0, int_minval: 0, int_maxval: 0, int_ptr: null, int_setfunc: null,
    dbl_defval: 0, dbl_minval: 0, dbl_maxval: 0, dbl_ptr: null, dbl_setfunc: null,
    str_defval: null, str_ptr: null, str_size: 0, str_setfunc: null, str_getfunc: null,
    key_defval: null, key_string: null, key: KEY_DUMMY,
  };
}

export function XP_NOARG_OPTION(name: string, ptr: Ref<boolean>, flags: number, help: string): xp_option_t {
  return { ...blank(xp_noarg_option, name, flags, help), noarg_ptr: ptr };
}
export function XP_BOOL_OPTION(name: string, defval: boolean, ptr: Ref<boolean>, setfunc: xp_option_t['bool_setfunc'], flags: number, help: string): xp_option_t {
  return { ...blank(xp_bool_option, name, flags, help), bool_defval: defval, bool_ptr: ptr, bool_setfunc: setfunc };
}
export function XP_INT_OPTION(name: string, defval: number, minval: number, maxval: number, ptr: Ref<number>, setfunc: xp_option_t['int_setfunc'], flags: number, help: string): xp_option_t {
  return { ...blank(xp_int_option, name, flags, help), int_defval: defval, int_minval: minval, int_maxval: maxval, int_ptr: ptr, int_setfunc: setfunc };
}
export function COLOR_INDEX_OPTION(name: string, defval: number, ptr: Ref<number>, help: string): xp_option_t {
  return XP_INT_OPTION(name, defval, 0, 16 - 1, ptr, null, 1 << 2, help);
}
export function COLOR_INDEX_OPTION_WITH_SETFUNC(name: string, defval: number, ptr: Ref<number>, setfunc: xp_option_t['int_setfunc'], help: string): xp_option_t {
  return XP_INT_OPTION(name, defval, 0, 16 - 1, ptr, setfunc, 1 << 2, help);
}
export function XP_DOUBLE_OPTION(name: string, defval: number, minval: number, maxval: number, ptr: Ref<number>, setfunc: xp_option_t['dbl_setfunc'], flags: number, help: string): xp_option_t {
  return { ...blank(xp_double_option, name, flags, help), dbl_defval: defval, dbl_minval: minval, dbl_maxval: maxval, dbl_ptr: ptr, dbl_setfunc: setfunc };
}
export function XP_STRING_OPTION(name: string, defval: string, ptr: Ref<string> | null, size: number, setfunc: xp_option_t['str_setfunc'],
  private_data: unknown, getfunc: xp_option_t['str_getfunc'], flags: number, help: string): xp_option_t {
  return { ...blank(xp_string_option, name, flags, help), private_data, str_defval: defval, str_ptr: ptr, str_size: size, str_setfunc: setfunc, str_getfunc: getfunc };
}
export function XP_KEY_OPTION(name: string, defval: string, key: number, help: string): xp_option_t {
  return { ...blank(xp_key_option, name, 0, help), key_defval: defval, key };
}

/** the stored options (the global array) and the key definitions */
export const O = {
  options: [] as xp_option_t[],
  keydefs: [] as { keysym: number; key: number }[],
  xpilotrc_lines: [] as { opt: xp_option_t | null; comment: string | null }[],
  num_ok_options: 0,
  lookup_i: 0,
};
onReset(() => Object.assign(O, { options: [], keydefs: [], xpilotrc_lines: [], num_ok_options: 0, lookup_i: 0 }));

export const num_options = (): number => O.options.length;
export const Option_by_index = (ind: number): xp_option_t | null => (ind < 0 || ind >= O.options.length ? null : O.options[ind]);

export function Find_option(name: string): xp_option_t | null {
  for (const o of O.options) if (!strcasecmp(name, o.name)) return o;
  return null;
}

export function Set_noarg_option(opt: xp_option_t, value: boolean, origin: number): boolean {
  opt.noarg_ptr!.set(value);
  opt.origin = origin;
  return true;
}

export function Set_bool_option(opt: xp_option_t, value: boolean, origin: number): boolean {
  let retval = true;
  if (opt.bool_setfunc) retval = opt.bool_setfunc(opt, value);
  else opt.bool_ptr!.set(value);
  if (retval) opt.origin = origin;
  return retval;
}

export function Set_int_option(opt: xp_option_t, value: number, origin: number): boolean {
  let retval = true;
  if (origin === xp_option_origin_setcmd) {
    if (value < opt.int_minval) Add_message(snprintf(MSG_LEN, 'Minimum value for option %s is %d. [*Client reply*]', opt.name, opt.int_minval));
    if (value > opt.int_maxval) Add_message(snprintf(MSG_LEN, 'Maximum value for option %s is %d. [*Client reply*]', opt.name, opt.int_maxval));
  } else if (!(value >= opt.int_minval && value <= opt.int_maxval)) {
    warn(`Bad value ${value} for option "${opt.name}", using default...`);
    value = opt.int_defval;
  }
  value = LIMIT(value, opt.int_minval, opt.int_maxval);
  if (opt.int_setfunc) retval = opt.int_setfunc(opt, value);
  else opt.int_ptr!.set(value);
  if (retval) opt.origin = origin;
  return retval;
}

export function Set_double_option(opt: xp_option_t, value: number, origin: number): boolean {
  let retval = true;
  if (origin === xp_option_origin_setcmd) {
    if (value < opt.dbl_minval) Add_message(snprintf(MSG_LEN, 'Minimum value for option %s is %.3f. [*Client reply*]', opt.name, opt.dbl_minval));
    if (value > opt.dbl_maxval) Add_message(snprintf(MSG_LEN, 'Maximum value for option %s is %.3f. [*Client reply*]', opt.name, opt.dbl_maxval));
  } else if (!(value >= opt.dbl_minval && value <= opt.dbl_maxval)) {
    warn(sprintf('Bad value %.3f for option "%s", using default...', value, opt.name));
    value = opt.dbl_defval;
  }
  value = LIMIT(value, opt.dbl_minval, opt.dbl_maxval);
  if (opt.dbl_setfunc) retval = opt.dbl_setfunc(opt, value);
  else opt.dbl_ptr!.set(value);
  if (retval) opt.origin = origin;
  return retval;
}

export function Set_string_option(opt: xp_option_t, value: string, origin: number): boolean {
  let retval = true;
  if (opt.str_setfunc) retval = opt.str_setfunc(opt, value);
  else opt.str_ptr!.set(strlcpy(value, opt.str_size));
  if (retval) opt.origin = origin;
  return retval;
}

/** option.c Generic_lookup_key: the next key bound to keysym ks (reset: from the start) */
export function Generic_lookup_key(ks: number, reset: boolean): number {
  let ret = KEY_DUMMY;
  if (reset) O.lookup_i = 0;
  for (; O.lookup_i < O.keydefs.length; O.lookup_i++) {
    if (ks === O.keydefs[O.lookup_i].keysym) {
      ret = O.keydefs[O.lookup_i].key;
      O.lookup_i++;
      break;
    }
  }
  return ret;
}

function Store_keydef(ks: number, key: number): void {
  for (const kd of O.keydefs) if (kd.keysym === ks && kd.key === key) return;
  for (const kd of O.keydefs) {
    if (kd.key === KEY_DUMMY) {
      kd.keysym = ks;
      kd.key = key;
      return;
    }
  }
  O.keydefs.push({ keysym: ks, key });
}

function Remove_key_from_keydefs(key: number): void {
  for (const kd of O.keydefs) {
    if (kd.key === key) {
      kd.keysym = XP_KS_UNKNOWN;
      kd.key = KEY_DUMMY;
    }
  }
}

/** xdefault.c String_to_xp_keysym */
export function String_to_xp_keysym(str: string): number {
  const ks = XStringToKeysym(str);
  return ks === NoSymbol ? XP_KS_UNKNOWN : ks;
}

function Set_key_option(opt: xp_option_t, value: string, origin: number): boolean {
  opt.key_string = value;
  Remove_key_from_keydefs(opt.key);
  for (const str of strtokAll(value, ' \t\r\n')) {
    if (!strcasecmp(str, 'none')) continue;
    const ks = String_to_xp_keysym(str);
    if (ks === XP_KS_UNKNOWN) {
      warn(`Invalid keysym "${str}" for key "${opt.name}".`);
      continue;
    }
    Store_keydef(ks, opt.key);
  }
  opt.origin = origin;
  return true;
}

function is_legal_value(type: number, value: string): boolean {
  if (type === xp_noarg_option || type === xp_bool_option) return ON(value) || OFF(value);
  if (type === xp_int_option) return /^[ \t\n\r\v\f]*[+-]?\d/.test(value);
  if (type === xp_double_option) return /^[ \t\n\r\v\f]*[+-]?(\d|\.\d|inf|nan)/i.test(value);
  return true;
}

export function Set_option(name: string, value: string, origin: number): boolean {
  const opt = Find_option(name);
  if (!opt) return false;
  if (!is_legal_value(opt.type, value)) {
    if (origin !== xp_option_origin_setcmd) warn(`Bad value "${value}" for option ${opt.name}.`);
    else Add_message(snprintf(MSG_LEN, 'Bad value "%s" for option %s. [*Client reply*]', value, opt.name));
    return false;
  }
  switch (opt.type) {
    case xp_noarg_option: return Set_noarg_option(opt, ON(value), origin);
    case xp_bool_option: return Set_bool_option(opt, ON(value), origin);
    case xp_int_option: return Set_int_option(opt, atoi(value), origin);
    case xp_double_option: return Set_double_option(opt, atof(value), origin);
    case xp_string_option: return Set_string_option(opt, value, origin);
    case xp_key_option: return Set_key_option(opt, value, origin);
  }
  return false;
}

export function Option_value_to_string(opt: xp_option_t): string {
  switch (opt.type) {
    case xp_noarg_option: return opt.noarg_ptr!.get() ? 'yes' : 'no';
    case xp_bool_option: return opt.bool_ptr!.get() ? 'yes' : 'no';
    case xp_int_option: return sprintf('%d', opt.int_ptr!.get());
    case xp_double_option: return sprintf('%.3f', opt.dbl_ptr!.get());
    case xp_string_option: return opt.str_getfunc ? opt.str_getfunc(opt) : opt.str_ptr!.get();
    case xp_key_option: return opt.key_string ?? '';
  }
  return '';
}

/** the \set client command */
export function Set_command(args: string): void {
  const words = strtokAll(args, ' \t\r\n');
  const name = words[0] ?? '';
  const m = /^[ \t\r\n]*[^ \t\r\n]+[ \t\r\n]([\s\S]*)$/.exec(args);
  const value = m && m[1].length ? m[1] : null;
  const opt = Find_option(name);
  if (!opt) {
    Add_message(snprintf(MSG_LEN, 'Unknown option "%s". [*Client reply*]', name));
    return;
  }
  if (!value) {
    Add_message('Set command needs an option and a value. [*Client reply*]');
    return;
  }
  Set_option(name, value, xp_option_origin_setcmd);
  Add_message(snprintf(MSG_LEN, 'The value of %s is now %s. [*Client reply*]', opt.name, Option_value_to_string(opt)));
}

/** the \get client command */
export function Get_command(args: string): void {
  const name = strtokAll(args, ' \t\r\n')[0] ?? '';
  const opt = Find_option(name);
  if (opt) {
    const val = Option_value_to_string(opt);
    if (val && val.length > 0) Add_message(snprintf(MSG_LEN, 'The value of %s is %s. [*Client reply*]', opt.name, val));
    else Add_message(snprintf(MSG_LEN, 'The option %s has no value. [*Client reply*]', opt.name));
  } else Add_message(snprintf(MSG_LEN, 'No client option named "%s". [*Client reply*]', name));
}

export function Store_option(opt: xp_option_t): void {
  if (Find_option(opt.name) !== null) throw new Error(`Trying to store duplicate option "${opt.name}"`);
  const o = { ...opt };
  O.options.push(o);
  switch (o.type) {
    case xp_noarg_option: Set_noarg_option(o, false, xp_option_origin_default); break;
    case xp_bool_option: Set_bool_option(o, o.bool_defval, xp_option_origin_default); break;
    case xp_int_option: Set_int_option(o, o.int_defval, xp_option_origin_default); break;
    case xp_double_option: Set_double_option(o, o.dbl_defval, xp_option_origin_default); break;
    case xp_string_option: Set_string_option(o, o.str_defval!, xp_option_origin_default); break;
    case xp_key_option: Set_key_option(o, o.key_defval!, xp_option_origin_default); break;
  }
}

export function STORE_OPTIONS(a: xp_option_t[]): void {
  for (const o of a) Store_option(o);
}

// ---------------------------------------------------------------- xpilotrc

function Parse_xpilotrc_line(line: string): void {
  const comment_line = () => O.xpilotrc_lines.push({ opt: null, comment: line });
  if (!(strncasecmp(line, 'xpilot.', 7) === 0 || strncasecmp(line, 'xpilot*', 7) === 0)) return void comment_line();
  let l = line.slice(7);
  const colon = l.indexOf(':');
  if (colon < 0) {
    warn(`Xpilotrc line ${O.xpilotrc_lines.length + 1}:`);
    warn('Line has no colon after option name, ignoring.');
    return void comment_line();
  }
  let name = l.slice(0, colon);
  while (name.length && isspace(name[name.length - 1])) name = name.slice(0, -1);
  const opt = Find_option(name);
  if (opt === null) return void comment_line();
  if (opt.flags & XP_OPTFLAG_NEVER_SAVE) {
    warn(`Option ${name} must not be specified in xpilotrc.`);
    return;
  }
  for (const x of O.xpilotrc_lines) {
    if (x.opt === opt) {
      warn(`Option ${name} previously given, ignoring new value.`);
      return void comment_line();
    }
  }
  l = l.slice(colon + 1);
  let k = 0;
  while (isspace(l[k])) k++;
  let value = l.slice(k);
  let comment: string | null = null;
  const semi = value.indexOf(';');
  if (semi >= 0) {
    comment = value.slice(semi);
    value = value.slice(0, semi);
  }
  if (!Set_option(name, value, xp_option_origin_xpilotrc)) {
    warn(`Failed to set option ${name} value "${value}", ignoring.`);
    return void comment_line();
  }
  O.xpilotrc_lines.push({ opt, comment });
  O.num_ok_options++;
}

export const XPILOTRC = '.xpilotrc';

export async function Xpilotrc_read(name: string): Promise<number> {
  const text = await sys.readFile(name);
  if (text === null) return -2;
  for (const raw of text.split('\n')) {
    let line = raw;
    const cr = line.indexOf('\r');
    if (cr >= 0) line = line.slice(0, cr);
    Parse_xpilotrc_line(line);
  }
  return 0;
}

function Xpilotrc_create_line(opt: xp_option_t | null, comment: string | null, comment_whole_line: boolean): string {
  let buf = comment_whole_line ? '; ' : '';
  if (opt) {
    let line = `xpilot.${opt.name}:`;
    const numtabs = Math.trunc((5 * 8 - 1 - line.length) / 8);
    for (let i = 0; i < numtabs; i++) line += '\t';
    line += Option_value_to_string(opt);
    buf = comment_whole_line ? buf + line : line;
  }
  if (comment) buf += comment;
  return buf;
}

export async function Xpilotrc_write(name: string): Promise<number> {
  for (const opt of O.options) {
    if (O.xpilotrc_lines.some((lp) => lp.opt === opt)) continue;
    if (opt.flags & XP_OPTFLAG_KEEP) continue;
    if (opt.flags & XP_OPTFLAG_NEVER_SAVE) continue;
    if (opt.origin === xp_option_origin_cmdline || opt.origin === xp_option_origin_env) continue;
    if (opt.origin === xp_option_origin_default) {
      const buf = Xpilotrc_create_line(opt, null, true);
      if (O.xpilotrc_lines.some((lp) => lp.opt === null && lp.comment === buf)) continue;
      O.xpilotrc_lines.push({ opt: null, comment: buf });
    } else O.xpilotrc_lines.push({ opt, comment: null });
  }
  let text = '';
  for (const lp of O.xpilotrc_lines) text += Xpilotrc_create_line(lp.opt, lp.comment, false) + '\n';
  return (await sys.writeFile(name, text)) ? 0 : -2;
}

/** Parse_options: xpilotrc, then the command line words; returns the remaining words (servers) */
export async function Parse_options(argv: string[]): Promise<string[]> {
  await Xpilotrc_read(XPILOTRC);
  const servers: string[] = [];
  let i = 0;
  while (i < argv.length) {
    if (argv[i][0] === '-') {
      let arg = argv[i].slice(1);
      if (arg[0] === '-') arg = arg.slice(1);
      const opt = Find_option(arg);
      if (opt && opt.type === xp_noarg_option) {
        Set_option(arg, 'true', xp_option_origin_cmdline);
        i++;
      } else {
        let ok = false;
        if (i + 1 < argv.length) ok = Set_option(arg, argv[i + 1], xp_option_origin_cmdline);
        if (!ok) {
          warn(`Unknown or incomplete option '${argv[i]}'`);
          warn('Type: xpilot-ng-x11 -help to see a list of options');
          throw new ClientExit(1);
        }
        i += 2;
      }
    } else servers.push(argv[i++]);
  }
  if (sys.sound) audioInit();
  return servers;
}

/** the help line and the option name of a key (configure.c, about.c) */
export function Get_keyHelpString(key: number): string | null {
  for (const opt of O.options) {
    if (opt.key === key) {
      let buf = strlcpy(opt.help, MAX_CHARS);
      const nl = buf.indexOf('\n');
      if (nl >= 0) buf = buf.slice(0, nl);
      return buf;
    }
  }
  return null;
}

export function Get_keyResourceString(key: number): string | null {
  for (const opt of O.options) if (opt.key === key) return opt.name;
  return null;
}

void G;
