// recall.cpp: Monster memory info -CJS-
//
// creature_recall (the monster memories) is in globals.ts.
import { config } from './config.ts';
import { ESCAPE, MON_MAX_ATTACKS, MON_MAX_CREATURES, MORIA_MESSAGE_SIZE, SHRT_MAX, UCHAR_MAX } from './constants.ts';
import { type Creature_t, creatures_list, monster_attacks } from './data_creatures.ts';
import {
  recall_description_attack_method, recall_description_attack_type, recall_description_breath, recall_description_how_much,
  recall_description_move, recall_description_spell, recall_description_weakness,
} from './data_recall.ts';
import { creature_recall, game, py } from './globals.ts';
import { chr, idiv, ord, sprintf } from './libc.ts';
import { onReset } from './reset.ts';
import { Recall_t } from './structs.ts';
import {
  eraseLine, getInputConfirmationWithAbort, getKeyInput, putStringClearToEOL, terminalRestoreScreen, terminalSaveScreen,
} from './ui_io.ts';

// Line buffer (vtype_t roff_buffer), as single characters.
const roff_buffer: string[] = new Array<string>(MORIA_MESSAGE_SIZE).fill('\0');
let roff_buffer_pointer = 0; // Pointer into line buffer (an index of roff_buffer).
let roff_print_line = 0; // Place to print line now being loaded.

onReset(() => {
  roff_buffer.fill('\0');
  roff_buffer_pointer = 0;
  roff_print_line = 0;
});

// #define plural(c, ss, sp) ((c) == 1 ? (ss) : (sp))
function plural(c: number, ss: string, sp: string): string {
  return c === 1 ? ss : sp;
}

// Number of kills needed for information.
// the higher the level of the monster, the fewer the attacks you need,
// the more damage an attack does, the more attacks you need.
// #define knowdamage(l, a, d) ((4 + (l)) * (a) > 80 * (d))
function knowdamage(l: number, a: number, d: number): boolean {
  return (4 + l) * a > 80 * d;
}

/** The C string in roff_buffer: up to its first NUL. */
function roffBufferString(): string {
  let s = '';
  for (let i = 0; i < roff_buffer.length && roff_buffer[i] !== '\0'; i++) {
    s += roff_buffer[i];
  }
  return s;
}

// Print out strings, filling up lines as we go.
async function memoryPrint(p: string): Promise<void> {
  for (let pi = 0; pi < p.length && p[pi] !== '\0'; pi++) {
    roff_buffer[roff_buffer_pointer] = p[pi];

    if (p[pi] === '\n' || roff_buffer_pointer >= MORIA_MESSAGE_SIZE - 1) {
      let q = roff_buffer_pointer;
      if (p[pi] !== '\n') {
        while (roff_buffer[q] !== ' ') {
          q--;
        }
      }
      roff_buffer[q] = '\0';
      await putStringClearToEOL(roffBufferString(), { y: roff_print_line, x: 0 });
      roff_print_line++;

      let r = 0;

      while (q < roff_buffer_pointer) {
        q++;
        roff_buffer[r] = roff_buffer[q];
        r++;
      }
      roff_buffer_pointer = r;
    } else {
      roff_buffer_pointer++;
    }
  }
}

// Do we know anything about this monster?
function memoryMonsterKnown(memory: Recall_t): boolean {
  if (game.wizard_mode) {
    return true;
  }

  if (memory.movement !== 0 || memory.defenses !== 0 || memory.kills !== 0 || memory.spells !== 0 || memory.deaths !== 0) {
    return true;
  }

  for (const attack of memory.attacks) {
    if (attack !== 0) {
      return true;
    }
  }

  return false;
}

function memoryWizardModeInit(memory: Recall_t, creature: Creature_t): void {
  memory.kills = SHRT_MAX;
  memory.wake = memory.ignore = UCHAR_MAX;

  let move = ((creature.movement & config.monsters.move.CM_4D2_OBJ) !== 0 ? 1 : 0) * 8;
  move += ((creature.movement & config.monsters.move.CM_2D2_OBJ) !== 0 ? 1 : 0) * 4;
  move += ((creature.movement & config.monsters.move.CM_1D2_OBJ) !== 0 ? 1 : 0) * 2;
  move += (creature.movement & config.monsters.move.CM_90_RANDOM) !== 0 ? 1 : 0;
  move += (creature.movement & config.monsters.move.CM_60_RANDOM) !== 0 ? 1 : 0;

  memory.movement = ((creature.movement & ~config.monsters.move.CM_TREASURE) | (move << config.monsters.move.CM_TR_SHIFT)) >>> 0;
  memory.defenses = creature.defenses;

  if ((creature.spells & config.monsters.spells.CS_FREQ) !== 0) {
    memory.spells = (creature.spells | config.monsters.spells.CS_FREQ) >>> 0;
  } else {
    memory.spells = creature.spells;
  }

  for (let i = 0; i < MON_MAX_ATTACKS; i++) {
    if (creature.damage[i] === 0) break;
    memory.attacks[i] = UCHAR_MAX;
  }

  // A little hack to enable the display of info for Quylthulgs.
  if ((memory.movement & config.monsters.move.CM_ONLY_MAGIC) !== 0) {
    memory.attacks[0] = UCHAR_MAX;
  }
}

// Conflict history.
async function memoryConflictHistory(deaths: number, kills: number): Promise<void> {
  let desc: string;

  if (deaths !== 0) {
    desc = sprintf('%d of the contributors to your monster memory %s', deaths, plural(deaths, 'has', 'have'));
    await memoryPrint(desc);
    await memoryPrint(' been killed by this creature, and ');
    if (kills === 0) {
      await memoryPrint('it is not ever known to have been defeated.');
    } else {
      desc = sprintf('at least %d of the beasts %s been exterminated.', kills, plural(kills, 'has', 'have'));
      await memoryPrint(desc);
    }
  } else if (kills !== 0) {
    desc = sprintf('At least %d of these creatures %s', kills, plural(kills, 'has', 'have'));
    await memoryPrint(desc);
    await memoryPrint(' been killed by contributors to your monster memory.');
  } else {
    await memoryPrint('No known battles to the death are recalled.');
  }
}

// Immediately obvious.
async function memoryDepthFoundAt(level: number, kills: number): Promise<boolean> {
  let known = false;

  if (level === 0) {
    known = true;
    await memoryPrint(' It lives in the town');
  } else if (kills !== 0) {
    known = true;

    // The Balrog is a level 100 monster, but appears at 50 feet.
    if (level > config.monsters.MON_ENDGAME_LEVEL) {
      level = config.monsters.MON_ENDGAME_LEVEL;
    }

    const desc = sprintf(' It is normally found at depths of %d feet', level * 50);
    await memoryPrint(desc);
  }

  return known;
}

async function memoryMovement(rc_move: number, monster_speed: number, is_known: boolean): Promise<boolean> {
  // the creatures_list speed value is 10 greater, so that it can be a uint8_t
  monster_speed -= 10;

  if ((rc_move & config.monsters.move.CM_ALL_MV_FLAGS) !== 0) {
    if (is_known) {
      await memoryPrint(', and');
    } else {
      await memoryPrint(' It');
      is_known = true;
    }

    await memoryPrint(' moves');

    if ((rc_move & config.monsters.move.CM_RANDOM_MOVE) !== 0) {
      await memoryPrint(recall_description_how_much[(rc_move & config.monsters.move.CM_RANDOM_MOVE) >>> 3]);
      await memoryPrint(' erratically');
    }

    if (monster_speed === 1) {
      await memoryPrint(' at normal speed');
    } else {
      if ((rc_move & config.monsters.move.CM_RANDOM_MOVE) !== 0) {
        await memoryPrint(', and');
      }

      if (monster_speed <= 0) {
        if (monster_speed === -1) {
          await memoryPrint(' very');
        } else if (monster_speed < -1) {
          await memoryPrint(' incredibly');
        }
        await memoryPrint(' slowly');
      } else {
        if (monster_speed === 3) {
          await memoryPrint(' very');
        } else if (monster_speed > 3) {
          await memoryPrint(' unbelievably');
        }
        await memoryPrint(' quickly');
      }
    }
  }

  if ((rc_move & config.monsters.move.CM_ATTACK_ONLY) !== 0) {
    if (is_known) {
      await memoryPrint(', but');
    } else {
      await memoryPrint(' It');
      is_known = true;
    }

    await memoryPrint(' does not deign to chase intruders');
  }

  if ((rc_move & config.monsters.move.CM_ONLY_MAGIC) !== 0) {
    if (is_known) {
      await memoryPrint(', but');
    } else {
      await memoryPrint(' It');
      is_known = true;
    }

    await memoryPrint(' always moves and attacks by using magic');
  }

  return is_known;
}

// Kill it once to know experience, and quality (evil, undead, monstrous).
// The quality of being a dragon is obvious.
async function memoryKillPoints(creature_defense: number, monster_exp: number, level: number): Promise<void> {
  await memoryPrint(' A kill of this');

  if ((creature_defense & config.monsters.defense.CD_ANIMAL) !== 0) {
    await memoryPrint(' natural');
  }
  if ((creature_defense & config.monsters.defense.CD_EVIL) !== 0) {
    await memoryPrint(' evil');
  }
  if ((creature_defense & config.monsters.defense.CD_UNDEAD) !== 0) {
    await memoryPrint(' undead');
  }

  // calculate the integer exp part, can be larger than 64K when first
  // level character looks at Balrog info, so must store in long
  const quotient = idiv(monster_exp * level, py.misc.level);

  // calculate the fractional exp part scaled by 100,
  // must use long arithmetic to avoid overflow
  const remainder = idiv(idiv(((monster_exp * level) % py.misc.level) * 1000, py.misc.level) + 5, 10);

  let plural_char: string;
  if (quotient === 1 && remainder === 0) {
    plural_char = '\0';
  } else {
    plural_char = 's';
  }

  // a '\0' plural ends the C string after "point"; memoryPrint() stops at it
  let desc = sprintf(' creature is worth %d.%02d point%c', quotient, remainder, plural_char);
  await memoryPrint(desc);

  let p: string;

  if (idiv(py.misc.level, 10) === 1) {
    p = 'th';
  } else {
    const ord_ = py.misc.level % 10;
    if (ord_ === 1) {
      p = 'st';
    } else if (ord_ === 2) {
      p = 'nd';
    } else if (ord_ === 3) {
      p = 'rd';
    } else {
      p = 'th';
    }
  }

  let q: string;
  if (py.misc.level === 8 || py.misc.level === 11 || py.misc.level === 18) {
    q = 'n';
  } else {
    q = '';
  }

  desc = sprintf(' for a%s %d%s level character.', q, py.misc.level, p);
  await memoryPrint(desc);
}

// Spells known, if have been used against us.
// Breath weapons or resistance might be known only because we cast spells at it.
async function memoryMagicSkills(memory_spell_flags: number, monster_spell_flags: number, creature_spell_flags: number): Promise<void> {
  let known = true;

  let spell_flags = memory_spell_flags >>> 0;

  for (let i = 0; (spell_flags & config.monsters.spells.CS_BREATHE) !== 0; i++) {
    if ((spell_flags & (config.monsters.spells.CS_BR_LIGHT << i)) !== 0) {
      spell_flags = (spell_flags & ~(config.monsters.spells.CS_BR_LIGHT << i)) >>> 0;

      if (known) {
        if ((monster_spell_flags & config.monsters.spells.CS_FREQ) !== 0) {
          await memoryPrint(' It can breathe ');
        } else {
          await memoryPrint(' It is resistant to ');
        }
        known = false;
      } else if ((spell_flags & config.monsters.spells.CS_BREATHE) !== 0) {
        await memoryPrint(', ');
      } else {
        await memoryPrint(' and ');
      }
      await memoryPrint(recall_description_breath[i]);
    }
  }

  known = true;

  for (let i = 0; (spell_flags & config.monsters.spells.CS_SPELLS) !== 0; i++) {
    if ((spell_flags & (config.monsters.spells.CS_TEL_SHORT << i)) !== 0) {
      spell_flags = (spell_flags & ~(config.monsters.spells.CS_TEL_SHORT << i)) >>> 0;

      if (known) {
        if ((memory_spell_flags & config.monsters.spells.CS_BREATHE) !== 0) {
          await memoryPrint(', and is also');
        } else {
          await memoryPrint(' It is');
        }
        await memoryPrint(' magical, casting spells which ');
        known = false;
      } else if ((spell_flags & config.monsters.spells.CS_SPELLS) !== 0) {
        await memoryPrint(', ');
      } else {
        await memoryPrint(' or ');
      }
      await memoryPrint(recall_description_spell[i]);
    }
  }

  if ((memory_spell_flags & (config.monsters.spells.CS_BREATHE | config.monsters.spells.CS_SPELLS)) !== 0) {
    // Could offset by level
    if ((monster_spell_flags & config.monsters.spells.CS_FREQ) > 5) {
      const temp = sprintf('; 1 time in %d', creature_spell_flags & config.monsters.spells.CS_FREQ);
      await memoryPrint(temp);
    }
    await memoryPrint('.');
  }
}

// Do we know how hard they are to kill? Armor class, hit die.
async function memoryKillDifficulty(creature: Creature_t, monster_kills: number): Promise<void> {
  // the higher the level of the monster, the fewer the kills you need
  // Original knowarmor macro inlined
  if (monster_kills <= idiv(304, 4 + creature.level)) {
    return;
  }

  let description = sprintf(' It has an armor rating of %d', creature.ac);
  await memoryPrint(description);

  description = sprintf( //
    ' and a%s life rating of %dd%d.', //
    (creature.defenses & config.monsters.defense.CD_MAX_HP) !== 0 ? ' maximized' : '', //
    creature.hit_die.dice, //
    creature.hit_die.sides, //
  );
  await memoryPrint(description);
}

// Do we know how clever they are? Special abilities.
async function memorySpecialAbilities(move: number): Promise<void> {
  let known = true;

  move = move >>> 0;

  for (let i = 0; (move & config.monsters.move.CM_SPECIAL) !== 0; i++) {
    if ((move & (config.monsters.move.CM_INVISIBLE << i)) !== 0) {
      move = (move & ~(config.monsters.move.CM_INVISIBLE << i)) >>> 0;

      if (known) {
        await memoryPrint(' It can ');
        known = false;
      } else if ((move & config.monsters.move.CM_SPECIAL) !== 0) {
        await memoryPrint(', ');
      } else {
        await memoryPrint(' and ');
      }
      await memoryPrint(recall_description_move[i]);
    }
  }

  if (!known) {
    await memoryPrint('.');
  }
}

// Do we know its special weaknesses? Most defenses flags.
async function memoryWeaknesses(defense: number): Promise<void> {
  let known = true;

  defense = defense >>> 0;

  for (let i = 0; (defense & config.monsters.defense.CD_WEAKNESS) !== 0; i++) {
    if ((defense & (config.monsters.defense.CD_FROST << i)) !== 0) {
      defense = (defense & ~(config.monsters.defense.CD_FROST << i)) >>> 0;
      if (known) {
        await memoryPrint(' It is susceptible to ');
        known = false;
      } else if ((defense & config.monsters.defense.CD_WEAKNESS) !== 0) {
        await memoryPrint(', ');
      } else {
        await memoryPrint(' and ');
      }
      await memoryPrint(recall_description_weakness[i]);
    }
  }

  if (!known) {
    await memoryPrint('.');
  }
}

// Do we know how aware it is?
async function memoryAwareness(creature: Creature_t, memory: Recall_t): Promise<void> {
  if (memory.wake * memory.wake > creature.sleep_counter || memory.ignore === UCHAR_MAX || (creature.sleep_counter === 0 && memory.kills >= 10)) {
    await memoryPrint(' It ');

    if (creature.sleep_counter > 200) {
      await memoryPrint('prefers to ignore');
    } else if (creature.sleep_counter > 95) {
      await memoryPrint('pays very little attention to');
    } else if (creature.sleep_counter > 75) {
      await memoryPrint('pays little attention to');
    } else if (creature.sleep_counter > 45) {
      await memoryPrint('tends to overlook');
    } else if (creature.sleep_counter > 25) {
      await memoryPrint('takes quite a while to see');
    } else if (creature.sleep_counter > 10) {
      await memoryPrint('takes a while to see');
    } else if (creature.sleep_counter > 5) {
      await memoryPrint('is fairly observant of');
    } else if (creature.sleep_counter > 3) {
      await memoryPrint('is observant of');
    } else if (creature.sleep_counter > 1) {
      await memoryPrint('is very observant of');
    } else if (creature.sleep_counter !== 0) {
      await memoryPrint('is vigilant for');
    } else {
      await memoryPrint('is ever vigilant for');
    }

    const text = sprintf(' intruders, which it may notice from %d feet.', 10 * creature.area_affect_radius);
    await memoryPrint(text);
  }
}

// Do we know what it might carry?
async function memoryLootCarried(creature_move: number, memory_move: number): Promise<void> {
  if ((memory_move & (config.monsters.move.CM_CARRY_OBJ | config.monsters.move.CM_CARRY_GOLD)) === 0) {
    return;
  }

  await memoryPrint(' It may');

  const carrying_chance = (memory_move & config.monsters.move.CM_TREASURE) >>> config.monsters.move.CM_TR_SHIFT;

  if (carrying_chance === 1) {
    if (((creature_move & config.monsters.move.CM_TREASURE) >>> 0) === config.monsters.move.CM_60_RANDOM) {
      await memoryPrint(' sometimes');
    } else {
      await memoryPrint(' often');
    }
  } else if (carrying_chance === 2 && ((creature_move & config.monsters.move.CM_TREASURE) >>> 0) === ((config.monsters.move.CM_60_RANDOM | config.monsters.move.CM_90_RANDOM) >>> 0)) {
    await memoryPrint(' often');
  }

  await memoryPrint(' carry');

  let p: string;

  if ((memory_move & config.monsters.move.CM_SMALL_OBJ) !== 0) {
    p = ' small objects';
  } else {
    p = ' objects';
  }

  if (carrying_chance === 1) {
    if ((memory_move & config.monsters.move.CM_SMALL_OBJ) !== 0) {
      p = ' a small object';
    } else {
      p = ' an object';
    }
  } else if (carrying_chance === 2) {
    await memoryPrint(' one or two');
  } else {
    const msg = sprintf(' up to %d', carrying_chance);
    await memoryPrint(msg);
  }

  if ((memory_move & config.monsters.move.CM_CARRY_OBJ) !== 0) {
    await memoryPrint(p);
    if ((memory_move & config.monsters.move.CM_CARRY_GOLD) !== 0) {
      await memoryPrint(' or treasure');
      if (carrying_chance > 1) {
        await memoryPrint('s');
      }
    }
    await memoryPrint('.');
  } else if (carrying_chance !== 1) {
    await memoryPrint(' treasures.');
  } else {
    await memoryPrint(' treasure.');
  }
}

async function memoryAttackNumberAndDamage(memory: Recall_t, creature: Creature_t): Promise<void> {
  // We know about attacks it has used on us, and maybe the damage they do.
  // known_attacks is the total number of known attacks, used for punctuation
  let known_attacks = 0;

  for (const attack of memory.attacks) {
    if (attack !== 0) {
      known_attacks++;
    }
  }

  // attack_count counts the attacks as printed, used for punctuation
  let attack_count = 0;
  for (let i = 0; i < MON_MAX_ATTACKS; i++) {
    const attack_id = creature.damage[i];
    if (attack_id === 0) {
      break;
    }

    // don't print out unknown attacks
    if (memory.attacks[i] === 0) {
      continue;
    }

    let attack_type = monster_attacks[attack_id].type_id;
    let attack_description_id = monster_attacks[attack_id].description_id;
    const dice = monster_attacks[attack_id].dice;

    attack_count++;

    if (attack_count === 1) {
      await memoryPrint(' It can ');
    } else if (attack_count === known_attacks) {
      await memoryPrint(', and ');
    } else {
      await memoryPrint(', ');
    }

    if (attack_description_id > 19) {
      attack_description_id = 0;
    }

    await memoryPrint(recall_description_attack_method[attack_description_id]);

    if (attack_type !== 1 || (dice.dice > 0 && dice.sides > 0)) {
      await memoryPrint(' to ');

      if (attack_type > 24) {
        attack_type = 0;
      }

      await memoryPrint(recall_description_attack_type[attack_type]);

      if (dice.dice !== 0 && dice.sides !== 0) {
        if (knowdamage(creature.level, memory.attacks[i], dice.dice * dice.sides)) {
          // Loss of experience
          if (attack_type === 19) {
            await memoryPrint(' by');
          } else {
            await memoryPrint(' with damage');
          }

          const msg = sprintf(' %dd%d', dice.dice, dice.sides);
          await memoryPrint(msg);
        }
      }
    }
  }

  if (attack_count !== 0) {
    await memoryPrint('.');
  } else if (known_attacks > 0 && memory.attacks[0] >= 10) {
    await memoryPrint(' It has no physical attacks.');
  } else {
    await memoryPrint(' Nothing is known about its attack.');
  }
}

// Print out what we have discovered about this monster.
// Returns the key read (getKeyInput()) as its char code.
export async function memoryRecall(monster_id: number): Promise<number> {
  const memory = creature_recall[monster_id];
  const creature = creatures_list[monster_id];

  let saved_memory = new Recall_t();

  if (game.wizard_mode) {
    saved_memory = memory.clone();
    memoryWizardModeInit(memory, creature);
  }

  roff_print_line = 0;
  roff_buffer_pointer = 0;

  const spells = (memory.spells & creature.spells & ~config.monsters.spells.CS_FREQ) >>> 0;

  // the config::monsters::move::CM_WIN property is always known, set it if a win monster
  const move = (memory.movement | (creature.movement & config.monsters.move.CM_WIN)) >>> 0;

  const defense = memory.defenses & creature.defenses;

  let known: boolean;

  // Start the paragraph for the core monster description
  const msg = sprintf('The %s:\n', creature.name);
  await memoryPrint(msg);

  await memoryConflictHistory(memory.deaths, memory.kills);
  known = await memoryDepthFoundAt(creature.level, memory.kills);
  known = await memoryMovement(move, creature.speed, known);

  // Finish off the paragraph with a period!
  if (known) {
    await memoryPrint('.');
  }

  if (memory.kills !== 0) {
    await memoryKillPoints(creature.defenses, creature.kill_exp_value, creature.level);
  }

  await memoryMagicSkills(spells, memory.spells, creature.spells);

  await memoryKillDifficulty(creature, memory.kills);

  await memorySpecialAbilities(move);

  await memoryWeaknesses(defense);

  if ((defense & config.monsters.defense.CD_INFRA) !== 0) {
    await memoryPrint(' It is warm blooded');
  }

  if ((defense & config.monsters.defense.CD_NO_SLEEP) !== 0) {
    if ((defense & config.monsters.defense.CD_INFRA) !== 0) {
      await memoryPrint(', and');
    } else {
      await memoryPrint(' It');
    }
    await memoryPrint(' cannot be charmed or slept');
  }

  if ((defense & (config.monsters.defense.CD_NO_SLEEP | config.monsters.defense.CD_INFRA)) !== 0) {
    await memoryPrint('.');
  }

  await memoryAwareness(creature, memory);

  await memoryLootCarried(creature.movement, move);

  await memoryAttackNumberAndDamage(memory, creature);

  // Always know the win creature.
  if ((creature.movement & config.monsters.move.CM_WIN) !== 0) {
    await memoryPrint(' Killing one of these wins the game!');
  }

  await memoryPrint('\n');
  await putStringClearToEOL('--pause--', { y: roff_print_line, x: 0 });

  if (game.wizard_mode) {
    memory.assign(saved_memory);
  }

  return ord(await getKeyInput());
}

// Allow access to monster memory. -CJS-
export async function recallMonsterAttributes(command: string): Promise<void> {
  let n = 0;

  for (let i = MON_MAX_CREATURES - 1; i >= 0; i--) {
    if (creatures_list[i].sprite === ord(command) && memoryMonsterKnown(creature_recall[i])) {
      if (n === 0) {
        const confirmed = await getInputConfirmationWithAbort(40, 'You recall those details?');
        if (confirmed !== 1) {
          break;
        }

        await eraseLine({ y: 0, x: 40 });
        terminalSaveScreen();
      }
      n++;

      const query = chr(await memoryRecall(i));
      terminalRestoreScreen();
      if (query === ESCAPE) {
        break;
      }
    }
  }
}
