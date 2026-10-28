// clientcommand.c: the client's own talk commands (\ignore, \unignore, \help, \set, \get, \quit) and
// masking the text of ignored players.
import { G } from './G.ts';
import { MAX_CHARS, MAX_NAME_LEN } from './consts.ts';
import { snprintf } from './cutil.ts';
import { warn } from './error.ts';
import { Add_message } from './messages.ts';
import { Client_exit, Other_by_name } from './client.ts';
import { Get_command, Set_command } from './option.ts';

const c_commands = ['ignore', 'i', 'ignore!', 'i!', 'unignore', 'u', 'help', 'h', 'set', 's', 'get', 'g', 'quit', 'q'];

function print_ignorelist(): void {
  let buffer = '';
  let check = false;
  for (let i = 0; i < G.num_others; i++) {
    const o = G.Others[i];
    if (o.ignorelevel === 1) {
      if (buffer.length + o.nick_name.length + 17 > MAX_CHARS) {
        Add_message(buffer + '[*Client reply*]');
        buffer = '';
      }
      buffer += o.nick_name + ' ';
      check = true;
    } else if (o.ignorelevel === 2) {
      if (buffer.length + o.nick_name.length + 18 > MAX_CHARS) {
        Add_message(buffer + '[*Client reply*]');
        buffer = '';
      }
      buffer += '!' + o.nick_name + ' ';
      check = true;
    }
  }
  if (check) Add_message(buffer + '[*Client reply*]');
  else Add_message('Ignorelist is empty. [*Client reply*]');
}

function print_help(arg: string | null): void {
  if (arg === null) {
    let message = '';
    for (let i = 0; i < c_commands.length; i += 2) message += c_commands[i] + ' ';
    Add_message(message + '[*Client reply*]');
    return;
  }
  const i = c_commands.indexOf(arg);
  switch (i < 0 ? -1 : i >> 1) {
    case 0:
      Add_message("'\\ignore <player>' ignores <player> by changing text to ***'s. [*Client reply*]");
      Add_message("Just '\\ignore' shows list of ignored players [*Client reply*]");
      break;
    case 1:
      Add_message("'\\ignore! <player>' ignores <player> completely. [*Client reply*]");
      break;
    case 2:
      Add_message("'\\unignore <player>' allows messages from <player> again. [*Client reply*]");
      break;
    case 3:
      Add_message("'\\help <command>' shows help about <command>. Just '\\help' show avaiable commands [*Client reply*]");
      break;
    case 4:
      Add_message("'\\set <option> <value>' sets an option value. [*Client reply*]");
      break;
    case 5:
      Add_message("'\\get <option>' gets an option value. [*Client reply*]");
      break;
    case 6:
      Add_message("'\\quit' quits the game, no questions asked. [*Client reply*]");
      break;
    default:
      Add_message('No such command [*Client reply*]');
      break;
  }
}

function ignorePlayer(name: string, level: number): void {
  const other = Other_by_name(name, true);
  if (other !== null) {
    if (level === 1) Add_message(snprintf(64 + MAX_NAME_LEN, 'Ignoring %s (textmask). [*Client reply*]', other.nick_name));
    else Add_message(snprintf(64 + MAX_NAME_LEN, 'Ignoring %s (completely). [*Client reply*]', other.nick_name));
    other.ignorelevel = level;
  }
}

function unignorePlayer(name: string): void {
  const other = Other_by_name(name, true);
  if (other !== null) {
    Add_message(snprintf(64 + MAX_NAME_LEN, 'Stopped ignoring %s. [*Client reply*]', other.nick_name));
    other.ignorelevel = 0;
  }
}

export function executeCommand(talk_str: string): void {
  if (talk_str.length === 0) {
    Add_message('No clientcommand specified, try the \\help command. [*Client reply*]');
    return;
  }
  const str = talk_str.slice(0, MAX_CHARS - 1);
  // strtok(str, " ") and then strtok(NULL, ""): the rest after the delimiter that ended the command
  let p = 0;
  while (p < str.length && str[p] === ' ') p++;
  if (p >= str.length) {
    Add_message('Invalid clientcommand. [*Client reply*]');
    return;
  }
  let e = p;
  while (e < str.length && str[e] !== ' ') e++;
  const command = str.slice(p, e);
  const i = c_commands.indexOf(command);
  if (i < 0) {
    Add_message('Invalid clientcommand. [*Client reply*]');
    return;
  }
  const rest = e < str.length ? str.slice(e + 1) : '';
  const argument = rest.length > 0 ? rest : null;
  switch (i) {
    case 0: case 1: case 2: case 3:
      if (!argument) print_ignorelist();
      else ignorePlayer(argument, Math.trunc(i / 2) + 1);
      break;
    case 4: case 5:
      if (!argument) print_help(command);
      else unignorePlayer(argument);
      break;
    case 6: case 7:
      print_help(argument);
      break;
    case 8: case 9:
      if (!argument) print_help(command);
      else Set_command(argument);
      break;
    case 10: case 11:
      if (!argument) print_help(command);
      else Get_command(argument);
      break;
    case 12: case 13:
      Client_exit(0);
      break;
    default:
      warn(`BUG: bad command num ${i} in executeCommand()`);
      break;
  }
}

/** the message with every letter and digit before its " [sender]" made a '*' */
export function crippleTalk(msg: string): string {
  let i;
  for (i = msg.length - 1; i > 0; i--) if (msg[i - 1] === ' ' && msg[i] === '[') break;
  if (i <= 0) return msg;
  const msgEnd = i - 1;
  let out = '';
  for (let k = 0; k < msgEnd; k++) out += /[A-Za-z0-9]/.test(msg[k]) ? '*' : msg[k];
  return out + msg.slice(msgEnd);
}
