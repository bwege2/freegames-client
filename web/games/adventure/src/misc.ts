// misc.c of Open Adventure 1.22: I/O and support routines, the random number generator.
// SPDX-FileCopyrightText: (C) 1977, 2005 by Will Crowther and Don Woods
// SPDX-License-Identifier: BSD-2-Clause
import {
  ACT_NULL, NACTIONS, NMOTIONS, NOBJECTS, NO_OBJECT, PART, PLEASE_ANSWER, TWO_WORDS, BIRD,
  LOC_NOWHERE, NDWARVES, actions, arbitrary_messages, ignore, motions, objects,
} from './dungeon.ts';
import {
  ACTION, CARRIED, EXIT_FAILURE, EXIT_SUCCESS, GIVEN, INSIDE, LCG_A, LCG_C, LCG_M, LINESIZE, MOTION, NO_WORD_TYPE,
  NUMERIC, OBJECT, PROMPT, TOKENIZED, TOKLEN, WORD_EMPTY, WORD_NOT_FOUND, EMPTY, unknown, touch, look, hear, study,
  change, game, settings, host, out, exit, isdigit, tolower, toupper, strncaseeq, strcaseeq, scan_words,
  zzword_str, type command_t, type WFILE,
} from './advent.ts';
import { myreadline } from './main.ts';

/** The program's version (the Makefile's VERSION, from NEWS.adoc) */
export const VERSION = '1.22';

/** A va_list: the arguments after the format, taken in order. */
type Arg = number | string;

/*  I/O routines (speak, pspeak, rspeak, sspeak, get_input, yes) */

function vspeak(msg: string | null | undefined, blank: boolean, ap: Arg[]): void {
  /* Engine for various speak functions */
  // Do nothing if we got a null pointer.
  if (msg == null) {
    return;
  }

  // Do nothing if we got an empty string.
  if (msg.length === 0) {
    return;
  }

  if (blank === true) {
    out('\n');
  }

  const msglen = msg.length;

  // Rendered string (truncate to 4K).
  let size = 4096;
  let rendered = '';
  let next = 0; // va_arg

  // Handle format specifiers (including the custom %S) by
  // adjusting the parameter accordingly, and replacing the
  // specifier with %s.
  let pluralize = false;
  for (let i = 0; i < msglen && size > 1; i++) {
    if (msg[i] !== '%') {
      /* Ugh.  Least obtrusive way to deal with artifacts "on
       * the floor" being dropped outside of both cave and
       * building. */
      const after = i + 5 < msglen ? msg[i + 5] : '\0'; // strchr(" .", c) also finds the terminator
      if (msg.startsWith('floor', i) && (after === ' ' || after === '.' || after === '\0') && !INSIDE(game.loc)) {
        let copy = size - 1;
        if (copy > 'ground'.length) {
          copy = 'ground'.length;
        }
        rendered += 'ground'.slice(0, copy);
        size -= copy;
        i += 4;
      } else {
        rendered += msg[i];
        size--;
      }
    } else {
      i++;
      const c = i < msglen ? msg[i] : '\0';
      // Integer specifier.
      if (c === 'd') {
        const arg = ap[next++] as number;
        const s = String(arg);
        const ret = s.length;
        if (ret > 0) {
          if (ret >= size) {
            rendered += s.slice(0, size - 1);
            size = 1;
          } else {
            rendered += s;
            size -= ret;
          }
        }
        pluralize = arg !== 1;
      }

      // Unmodified string specifier.
      if (c === 's') {
        const arg = ap[next++] as string;
        let len = arg.length;
        if (len >= size) {
          len = size - 1;
        }
        if (len > 0) {
          rendered += arg.slice(0, len);
          size -= len;
        }
      }

      // Singular/plural specifier.
      if (c === 'S') {
        // look at the *previous* numeric parameter
        if (pluralize && size > 1) {
          rendered += 's';
          size--;
        }
      }

      /* Version specifier */
      if (c === 'V') {
        let len = VERSION.length;
        if (len >= size) {
          len = size - 1;
        }
        if (len > 0) {
          rendered += VERSION.slice(0, len);
          size -= len;
        }
      }
    }
  }

  // Print the message.
  out(`${rendered}\n`);
}

export function speak(msg: string | null | undefined, ...ap: Arg[]): void {
  /* speak a specified string */
  vspeak(msg, true, ap);
}

/** vprintf for the messages sspeak() prints: %s, %d and %% */
function vprintf(fmt: string, ap: Arg[]): void {
  let s = '';
  let next = 0;
  for (let i = 0; i < fmt.length; i++) {
    if (fmt[i] !== '%') {
      s += fmt[i];
      continue;
    }
    const c = fmt[++i];
    if (c === 's') s += ap[next++] as string;
    else if (c === 'd') s += String(ap[next++] as number);
    else if (c === '%') s += '%';
    else throw new Error(`vprintf: %${c} not supported`);
  }
  out(s);
}

export function sspeak(msg: number, ...ap: Arg[]): void {
  /* Speak a message from the arbitrary-messages list */
  out('\n');
  vprintf(arbitrary_messages[msg]!, ap);
  out('\n');
}

export function pspeak(msg: number, mode: number, blank: boolean, skip: number, ...ap: Arg[]): void {
  /* Find the skip+1st message from msg and print it.  Modes are:
   * feel = for inventory, what you can touch
   * look = the full description for the state the object is in
   * listen = the sound for the state the object is in
   * study = text on the object. */
  switch (mode) {
    case touch:
      vspeak(objects[msg].inventory, blank, ap);
      break;
    case look:
      vspeak(objects[msg].descriptions[skip], blank, ap);
      break;
    case hear:
      vspeak(objects[msg].sounds[skip], blank, ap);
      break;
    case study:
      vspeak(objects[msg].texts[skip], blank, ap);
      break;
    case change:
      vspeak(objects[msg].changes[skip], blank, ap);
      break;
  }
}

export function rspeak(i: number, ...ap: Arg[]): void {
  /* Print the i-th "random" message (section 6 of database). */
  vspeak(arbitrary_messages[i], true, ap);
}

/** echo_input(destination, input_prompt, input): destination is stdout (null) or the log file */
export function echo_input(destination: WFILE | null, input_prompt: string, input: string): void {
  const prompt_and_input = input_prompt + input;
  if (destination === null) out(`${prompt_and_input}\n`);
  else destination.data += `${prompt_and_input}\n`;
}

function word_count(str: string): number {
  const delims = ' \t';
  let count = 0;
  let inblanks = true;

  for (const s of str) {
    if (inblanks) {
      if (!delims.includes(s)) {
        ++count;
        inblanks = false;
      }
    } else {
      if (delims.includes(s)) {
        inblanks = true;
      }
    }
  }

  return count;
}

async function get_input(): Promise<string | null> {
  // Set up the prompt
  let input_prompt = PROMPT;
  if (!settings.prompt) {
    input_prompt = '';
  }

  // Print a blank line
  out('\n');

  let input: string | null;
  for (;;) {
    input = await myreadline(input_prompt);

    if (input === null) { // Got EOF; return with it.
      return input;
    }
    if (input[0] === '#') { // Ignore comments.
      continue;
    }
    // We have a 'normal' line; leave the loop.
    break;
  }

  // Strip trailing newlines from the input
  const nl = input.indexOf('\n');
  if (nl >= 0) input = input.slice(0, nl);

  // add_history(input): the browser's line input keeps no history (README)

  if (!host.isatty) {
    echo_input(null, input_prompt, input);
  }

  if (settings.logfp) {
    echo_input(settings.logfp, '', input);
  }

  return input;
}

/** The first word of a reply in lower case, as yes_or_no() gets it with sscanf("%s") and tolower(). */
function first_word_lower(reply: string): string {
  return [...scan_words(reply, 1)[0]].map(tolower).join('');
}

export async function silent_yes_or_no(): Promise<boolean> {
  let outcome = false;

  for (;;) {
    const reply = await get_input();
    if (reply === null) {
      // Should be unreachable. Reply should never be NULL
      exit(EXIT_SUCCESS);
    }
    if (reply.length === 0) {
      rspeak(PLEASE_ANSWER);
      continue;
    }

    const firstword = first_word_lower(reply);

    const yes = firstword.slice(0, 3) === 'yes';
    const y = firstword.slice(0, 1) === 'y';
    const no = firstword.slice(0, 2) === 'no';
    const n = firstword.slice(0, 1) === 'n';

    if (yes || y) {
      outcome = true;
      break;
    } else if (no || n) {
      outcome = false;
      break;
    } else {
      rspeak(PLEASE_ANSWER);
    }
  }
  return outcome;
}

export async function yes_or_no(question: string | null, yes_response: string | null, no_response: string | null): Promise<boolean> {
  /*  Print message X, wait for yes/no answer.  If yes, print Y and return
   * true; if no, print Z and return false. */
  let outcome = false;

  for (;;) {
    speak(question);

    const reply = await get_input();
    if (reply === null) {
      // Should be unreachable. Reply should never be NULL
      exit(EXIT_SUCCESS);
    }

    if (reply.length === 0) {
      rspeak(PLEASE_ANSWER);
      continue;
    }

    const firstword = first_word_lower(reply);

    const yes = firstword.slice(0, 3) === 'yes';
    const y = firstword.slice(0, 1) === 'y';
    const no = firstword.slice(0, 2) === 'no';
    const n = firstword.slice(0, 1) === 'n';

    if (yes || y) {
      speak(yes_response);
      outcome = true;
      break;
    } else if (no || n) {
      speak(no_response);
      outcome = false;
      break;
    } else {
      rspeak(PLEASE_ANSWER);
    }
  }

  return outcome;
}

/*  Data structure routines */

function get_motion_vocab_id(word: string): number {
  // Return the first motion number that has 'word' as one of its words.
  for (let i = 0; i < NMOTIONS; ++i) {
    for (let j = 0; j < motions[i].words.length; ++j) {
      if (strncaseeq(word, motions[i].words[j], TOKLEN) &&
          (word.length > 1 || !ignore.includes(word[0]) || !settings.oldstyle)) {
        return i;
      }
    }
  }
  // If execution reaches here, we didn't find the word.
  return WORD_NOT_FOUND;
}

function get_object_vocab_id(word: string): number {
  // Return the first object number that has 'word' as one of its words.
  for (let i = 0; i < NOBJECTS; ++i) {
    for (let j = 0; j < objects[i].words.length; ++j) {
      if (strncaseeq(word, objects[i].words[j], TOKLEN)) {
        return i;
      }
    }
  }
  // If execution reaches here, we didn't find the word.
  return WORD_NOT_FOUND;
}

function get_action_vocab_id(word: string): number {
  // Return the first motion number that has 'word' as one of its words.
  for (let i = 0; i < NACTIONS; ++i) {
    for (let j = 0; j < actions[i].words.length; ++j) {
      if (strncaseeq(word, actions[i].words[j], TOKLEN) &&
          (word.length > 1 || !ignore.includes(word[0]) || !settings.oldstyle)) {
        return i;
      }
    }
  }
  // If execution reaches here, we didn't find the word.
  return WORD_NOT_FOUND;
}

function is_valid_int(str: string): boolean {
  /* Returns true if the string passed in is represents a valid integer,
   * that could then be parsed by atoi() */
  let i = 0;
  // Handle negative number
  if (str[i] === '-') {
    ++i;
  }

  // Handle empty string or just "-". Should never reach this
  // point, because this is only used with transitive verbs.
  if (i >= str.length) {
    return false;
  }

  // Check for non-digit chars in the rest of the string.
  while (i < str.length) {
    if (!isdigit(str[i])) {
      return false;
    } else {
      ++i;
    }
  }

  return true;
}

function get_vocab_metadata(word: string, w: { id: number; type: number }): void {
  /* Check for an empty string */
  if (word === '') {
    w.id = WORD_EMPTY;
    w.type = NO_WORD_TYPE;
    return;
  }

  let ref_num: number;

  ref_num = get_motion_vocab_id(word);
  // Second conjunct is because the magic-word placeholder is a bit
  // special
  if (ref_num !== WORD_NOT_FOUND) {
    w.id = ref_num;
    w.type = MOTION;
    return;
  }

  ref_num = get_object_vocab_id(word);
  if (ref_num !== WORD_NOT_FOUND) {
    w.id = ref_num;
    w.type = OBJECT;
    return;
  }

  ref_num = get_action_vocab_id(word);
  if (ref_num !== WORD_NOT_FOUND && ref_num !== PART) {
    w.id = ref_num;
    w.type = ACTION;
    return;
  }

  // Check for the reservoir magic word.
  if (strcaseeq(word, zzword_str())) {
    w.id = PART;
    w.type = ACTION;
    return;
  }

  // Check words that are actually numbers.
  if (is_valid_int(word)) {
    w.id = WORD_EMPTY;
    w.type = NUMERIC;
    return;
  }

  w.id = WORD_NOT_FOUND;
  w.type = NO_WORD_TYPE;
}

function tokenize(raw: string, cmd: command_t): void {
  /*
   * Be careful about modifying this. We do not want to nuke the
   * the speech part or ID from the previous turn.
   */
  /* Bound prefix on the %s would be needed to prevent buffer
   * overflow. We shortstop this more simply by making each
   * raw-input buffer as long as the entire input buffer. */
  [cmd.word[0].raw, cmd.word[1].raw] = scan_words(raw, 2);

  /* (ESR) In oldstyle mode, simulate the uppercasing and truncating
   * effect on raw tokens of packing them into sixbit characters, 5
   * to a 32-bit word.  This is something the FORTRAN version did
   * because archaic FORTRAN had no string types.  Don Wood's
   * mechanical translation of 2.5 to C retained the packing and
   * thus this misfeature.
   *
   * It's philosophically questionable whether this is the right
   * thing to do even in oldstyle mode.  On one hand, the text
   * mangling was not authorial intent, but a result of limitations
   * in their tools. On the other, not simulating this misbehavior
   * goes against the goal of making oldstyle as accurate as
   * possible an emulation of the original UI.
   *
   * The definition of TRUNCLEN is dubious. It accurately reflects the
   * FORTRAN, but it's possible that was a bug and the proper definition
   * is (TOKLEN).
   */
  const TRUNCLEN = TOKLEN + TOKLEN;
  if (settings.oldstyle) {
    cmd.word[0].raw = [...cmd.word[0].raw.slice(0, TRUNCLEN)].map(toupper).join('');
    cmd.word[1].raw = [...cmd.word[1].raw.slice(0, TRUNCLEN)].map(toupper).join('');
  }

  /* populate command with parsed vocabulary metadata */
  get_vocab_metadata(cmd.word[0].raw, cmd.word[0]);
  get_vocab_metadata(cmd.word[1].raw, cmd.word[1]);
  cmd.state = TOKENIZED;
}

export async function get_command_input(command: command_t): Promise<boolean> {
  /* Get user input on stdin, parse and map to command */
  let input: string | null;

  for (;;) {
    input = await get_input();
    if (input === null) {
      return false;
    }
    if (word_count(input) > 2) {
      rspeak(TWO_WORDS);
      continue;
    }
    if (input !== '') {
      break;
    }
  }

  const inputbuf = input.slice(0, LINESIZE - 1);

  tokenize(inputbuf, command);

  command.state = GIVEN;
  return true;
}

export function clear_command(cmd: command_t): void {
  /* Resets the state of the command to empty */
  cmd.verb = ACT_NULL;
  cmd.part = unknown;
  game.oldobj = cmd.obj;
  cmd.obj = NO_OBJECT;
  cmd.state = EMPTY;
}

export function juggle(object: number): void {
  /*  Juggle an object by picking it up and putting it down again, the
   * purpose being to get the object to the front of the chain of things
   * at its loc. */
  const i = game.objects[object].place;
  const j = game.objects[object].fixed;
  move(object, i);
  move(object + NOBJECTS, j);
}

export function move(object: number, where: number): void {
  /*  Place any object anywhere by picking it up and dropping it.  May
   *  already be toting, in which case the carry is a no-op.  Mustn't
   *  pick up objects which are not at any loc, since carry wants to
   *  remove objects from game atloc chains. */
  let from: number;

  if (object >= NOBJECTS) {
    from = game.objects[object - NOBJECTS].fixed;
  } else {
    from = game.objects[object].place;
  }
  /* (ESR) Used to check for !SPECIAL(from). I *think* that was wrong...
   */
  if (from !== LOC_NOWHERE && from !== CARRIED) {
    carry(object, from);
  }
  drop(object, where);
}

export function put(object: number, where: number, pval: number): void {
  /* put() is the same as move(), except the object is stashed and
   * can no longer be picked up. */
  move(object, where);
  game.objects[object].prop = (-1 - pval) | 0; // OBJECT_STASHIFY(object, pval)
}

export function carry(object: number, where: number): void {
  /*  Start toting an object, removing it from the list of things at its
   * former location.  Incr holdng unless it was already being toted.  If
   * object>NOBJECTS (moving "fixed" second loc), don't change game.place
   * or game.holdng. */
  let temp: number;

  if (object < NOBJECTS) {
    if (game.objects[object].place === CARRIED) {
      return;
    }
    game.objects[object].place = CARRIED;

    /*
     * Without this conditional your inventory is overcounted
     * when you pick up the bird while it's caged. This fixes
     * a cosmetic bug in the original.
     *
     * Possibly this check should be skipped whwn oldstyle is on.
     */
    if (object !== BIRD) {
      ++game.holdng;
    }
  }
  if (game.locs[where].atloc === object) {
    game.locs[where].atloc = game.link[object];
    return;
  }
  temp = game.locs[where].atloc;
  // (port) a broken chain (only a crafted save file makes one) would loop forever in C; stop instead
  for (let guard = 0; game.link[temp] !== object; guard++) {
    if (guard > NOBJECTS * 2) bug(-1, 'object not in its location chain');
    temp = game.link[temp];
  }
  game.link[temp] = game.link[object];
}

export function drop(object: number, where: number): void {
  /*  Place an object at a given loc, prefixing it onto the game atloc
   * list.  Decr game.holdng if the object was being toted. No state
   * change on the object. */
  if (object >= NOBJECTS) {
    game.objects[object - NOBJECTS].fixed = where;
  } else {
    if (game.objects[object].place === CARRIED) {
      if (object !== BIRD) {
        /* The bird has to be weightless.  This ugly
         * hack (and the corresponding code in the carry
         * function) brought to you by the fact that
         * when the bird is caged, we need to be able to
         * either 'take bird' or 'take cage' and have
         * the right thing happen.
         */
        --game.holdng;
      }
    }
    game.objects[object].place = where;
  }
  if (where === LOC_NOWHERE || where === CARRIED) {
    return;
  }
  game.link[object] = game.locs[where].atloc;
  game.locs[where].atloc = object;
}

export function atdwrf(where: number): number {
  /*  Return the index of first dwarf at the given location, zero if no
   * dwarf is there (or if dwarves not active yet), -1 if all dwarves are
   * dead.  Ignore the pirate (6th dwarf). */
  let at: number;

  at = 0;
  if (game.dflag < 2) {
    return at;
  }
  at = -1;
  for (let i = 1; i <= NDWARVES - 1; i++) {
    if (game.dwarves[i].loc === where) {
      return i;
    }
    if (game.dwarves[i].loc !== 0) {
      at = 0;
    }
  }
  return at;
}

/*  Utility routines (setbit, tstbit, set_seed, get_next_lcg_value,
 *  randrange) */

export function setbit(bit: number): number {
  /*  Returns 2**bit for use in constructing bit-masks. */
  return 1 << bit;
}

export function tstbit(mask: number, bit: number): boolean {
  /*  Returns true if the specified bit is set in the mask. */
  return (mask & (1 << bit)) !== 0;
}

export function set_seed(seedval: number): void {
  /* Set the LCG1 seed */
  game.lcg_x = seedval % LCG_M;
  if (game.lcg_x < 0) {
    game.lcg_x = LCG_M + game.lcg_x;
  }
  // once seed is set, we need to generate the Z`ZZZ word
  for (let i = 0; i < 5; ++i) {
    game.zzword[i] = 'A'.charCodeAt(0) + randrange(26);
  }
  game.zzword[1] = "'".charCodeAt(0); // force second char to apostrophe
  game.zzword[5] = 0;
}

function get_next_lcg_value(): number {
  /* Return the LCG's current value, and then iterate it. */
  const old_x = game.lcg_x;
  game.lcg_x = (LCG_A * game.lcg_x + LCG_C) % LCG_M; // long arithmetic: exact in a double
  if (settings.debug) {
    out(`# random ${old_x}\n`);
  }
  return old_x;
}

export function randrange(range: number): number {
  /* Return a random integer from [0, range). */
  return Math.trunc(Math.imul(range, get_next_lcg_value()) / LCG_M);
}

export function bug(num: number, error_string: string): never {
  host.stderr(`Fatal error ${num}, ${error_string}.\n`);
  exit(EXIT_FAILURE);
}

export function state_change(obj: number, state: number): void {
  /* Object must have a change-message list for this to be useful; only
   * some do */
  game.objects[obj].prop = state;
  pspeak(obj, change, true, state);
}

