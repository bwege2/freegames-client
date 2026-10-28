// game_save.cpp: Save and restore games and monster memory info
//
// The save file is written and read through bytefile.ts (C's FILE*) on the platform's files, byte for
// byte as the original writes it. open()/access()/chmod()/unlink() of the original are the platform's
// files.exists()/write()/remove(): the platform has no file permissions, so a chmod() always succeeds.
import { ByteFile, EOF, SEEK_CUR } from './bytefile.ts';
import { config } from './config.ts';
import {
  CURRENT_VERSION_MAJOR, CURRENT_VERSION_MINOR, CURRENT_VERSION_PATCH, LEVEL_MAX_OBJECTS, MAX_HEIGHT, MAX_WIDTH,
  MON_MAX_ATTACKS, MON_MAX_CREATURES, MON_TOTAL_ALLOCATIONS, OBJECT_IDENT_SIZE, PLAYER_INVENTORY_SIZE, PLAYER_MAX_LEVEL,
  PLAYER_NAME_SIZE, PlayerEquipment, STORE_MAX_DISCRETE_ITEMS, UCHAR_MAX,
} from './constants.ts';
import { exitProgram, isCurrentGameVersion, randomNumber, validGameVersion } from './game.ts';
import { creature_recall, dg, game, globals, messages, monsters, objects_identified, py, stores } from './globals.ts';
import { getCurrentUnixTime } from './helpers.ts';
import { cstr, idiv, type Ref, to_string } from './libc.ts';
import { platform } from './platform.ts';
import { playerChangeSpeed, playerDisturb, playerStrength } from './player.ts';
import { onReset } from './reset.ts';
import { playerCalculateTotalPoints } from './scores.ts';
import { storeMaintenance } from './store_inventory.ts';
import type { HighScore_t, Inventory_t, Monster_t } from './structs.ts';
import { clearScreen, getInputConfirmation, getStringInput, printMessage, putQIO, putString, putStringClearToEOL } from './ui_io.ts';

// For debugging the save file code on systems with broken compilers.
// (DEBUG(x) expands to nothing.)

// these are used for the save file, to avoid having to pass them to every procedure
let fileptr: ByteFile | null = null;
let xor_byte = 0; // uint8_t
let from_save_file = 0; // can overwrite old save file when save
let start_time = 0; // uint32_t: time that play started

onReset(() => {
  fileptr = null;
  xor_byte = 0;
  from_save_file = 0;
  start_time = 0;
});

/** The open file (C would crash on a null FILE*). */
function fp(): ByteFile {
  if (fileptr === null) {
    throw new Error('game_save: no file');
  }
  return fileptr;
}

// This save package was brought to by                -JWT-
// and                                                -RAK-
// and has been completely rewritten for UNIX by      -JEW-
// and has been completely rewritten again by         -CJS-
// and completely rewritten again! for portability by -JEW-

// Set up prior to actual save, do the save, then clean up
export async function saveGame(): Promise<boolean> {
  const input = { v: '' }; // vtype_t input = {'\0'};
  let output: string;

  while (!(await saveChar(config.files.save_game))) {
    output = "Save file '" + config.files.save_game + "' fails.";
    await printMessage(output);

    let i = 0;
    // access(config::files::save_game, 0) < 0 || ... || (i = unlink(...)) < 0
    if (!platform().files.exists(config.files.save_game) ||
      !(await getInputConfirmation('File exists. Delete old save file?')) ||
      (i = platform().files.remove(config.files.save_game) ? 0 : -1) < 0) {
      if (i < 0) {
        output = "Can't delete '" + config.files.save_game + "'";
        await printMessage(output);
      }
      await putStringClearToEOL('New Save file [ESC to give up]:', { y: 0, x: 0 });
      if (!(await getStringInput(input, { y: 0, x: 31 }, 45))) {
        return false;
      }
      if (input.v.length !== 0) {
        // (void) strcpy(config::files::save_game, input);
        config.files.save_game = input.v;
      }
    }
    output = "Saving with '" + config.files.save_game + "'...";
    await putStringClearToEOL(output, { y: 0, x: 0 });
  }

  return true;
}

function svWrite(): boolean {
  // clear the game.character_is_dead flag when creating a HANGUP save file,
  // so that player can see tombstone when restart
  if (globals.eof_flag !== 0) {
    game.character_is_dead = false;
  }

  let l = 0; // uint32_t

  if (config.options.run_cut_corners) {
    l |= 0x1;
  }
  if (config.options.run_examine_corners) {
    l |= 0x2;
  }
  if (config.options.run_print_self) {
    l |= 0x4;
  }
  if (config.options.find_bound) {
    l |= 0x8;
  }
  if (config.options.prompt_to_pickup) {
    l |= 0x10;
  }
  if (config.options.use_roguelike_keys) {
    l |= 0x20;
  }
  if (config.options.show_inventory_weights) {
    l |= 0x40;
  }
  if (config.options.highlight_seams) {
    l |= 0x80;
  }
  if (config.options.run_ignore_doors) {
    l |= 0x100;
  }
  if (config.options.error_beep_sound) {
    l |= 0x200;
  }
  if (config.options.display_counts) {
    l |= 0x400;
  }
  if (game.character_is_dead) {
    // Sign bit
    l = (l | 0x80000000) >>> 0;
  }
  if (game.total_winner) {
    l = (l | 0x40000000) >>> 0;
  }

  for (let i = 0; i < MON_MAX_CREATURES; i++) {
    const r = creature_recall[i];
    if (r.movement !== 0 || r.defenses !== 0 || r.kills !== 0 || r.spells !== 0 || r.deaths !== 0 ||
      r.attacks[0] !== 0 || r.attacks[1] !== 0 || r.attacks[2] !== 0 || r.attacks[3] !== 0) {
      wrShort(i);
      wrLong(r.movement);
      wrLong(r.spells);
      wrShort(r.kills);
      wrShort(r.deaths);
      wrShort(r.defenses);
      wrByte(r.wake);
      wrByte(r.ignore);
      wrBytes(r.attacks, MON_MAX_ATTACKS);
    }
  }

  // sentinel to indicate no more monster info
  wrShort(0xFFFF);

  wrLong(l);

  wrString(py.misc.name);
  wrBool(py.misc.gender);
  wrLong(py.misc.au);
  wrLong(py.misc.max_exp);
  wrLong(py.misc.exp);
  wrShort(py.misc.exp_fraction);
  wrShort(py.misc.age);
  wrShort(py.misc.height);
  wrShort(py.misc.weight);
  wrShort(py.misc.level);
  wrShort(py.misc.max_dungeon_depth);
  wrShort(py.misc.chance_in_search);
  wrShort(py.misc.fos);
  wrShort(py.misc.bth);
  wrShort(py.misc.bth_with_bows);
  wrShort(py.misc.mana);
  wrShort(py.misc.max_hp);
  wrShort(py.misc.plusses_to_hit);
  wrShort(py.misc.plusses_to_damage);
  wrShort(py.misc.ac);
  wrShort(py.misc.magical_ac);
  wrShort(py.misc.display_to_hit);
  wrShort(py.misc.display_to_damage);
  wrShort(py.misc.display_ac);
  wrShort(py.misc.display_to_ac);
  wrShort(py.misc.disarm);
  wrShort(py.misc.saving_throw);
  wrShort(py.misc.social_class);
  wrShort(py.misc.stealth_factor);
  wrByte(py.misc.class_id);
  wrByte(py.misc.race_id);
  wrByte(py.misc.hit_die);
  wrByte(py.misc.experience_factor);
  wrShort(py.misc.current_mana);
  wrShort(py.misc.current_mana_fraction);
  wrShort(py.misc.current_hp);
  wrShort(py.misc.current_hp_fraction);
  for (const entry of py.misc.history) {
    wrString(entry);
  }

  wrBytes(py.stats.max, 6);
  wrBytes(py.stats.current, 6);
  wrShorts(py.stats.modified, 6);
  wrBytes(py.stats.used, 6);

  wrLong(py.flags.status);
  wrShort(py.flags.rest);
  wrShort(py.flags.blind);
  wrShort(py.flags.paralysis);
  wrShort(py.flags.confused);
  wrShort(py.flags.food);
  wrShort(py.flags.food_digested);
  wrShort(py.flags.protection);
  wrShort(py.flags.speed);
  wrShort(py.flags.fast);
  wrShort(py.flags.slow);
  wrShort(py.flags.afraid);
  wrShort(py.flags.poisoned);
  wrShort(py.flags.image);
  wrShort(py.flags.protect_evil);
  wrShort(py.flags.invulnerability);
  wrShort(py.flags.heroism);
  wrShort(py.flags.super_heroism);
  wrShort(py.flags.blessed);
  wrShort(py.flags.heat_resistance);
  wrShort(py.flags.cold_resistance);
  wrShort(py.flags.detect_invisible);
  wrShort(py.flags.word_of_recall);
  wrShort(py.flags.see_infra);
  wrShort(py.flags.timed_infra);
  wrBool(py.flags.see_invisible);
  wrBool(py.flags.teleport);
  wrBool(py.flags.free_action);
  wrBool(py.flags.slow_digest);
  wrBool(py.flags.aggravate);
  wrBool(py.flags.resistant_to_fire);
  wrBool(py.flags.resistant_to_cold);
  wrBool(py.flags.resistant_to_acid);
  wrBool(py.flags.regenerate_hp);
  wrBool(py.flags.resistant_to_light);
  wrBool(py.flags.free_fall);
  wrBool(py.flags.sustain_str);
  wrBool(py.flags.sustain_int);
  wrBool(py.flags.sustain_wis);
  wrBool(py.flags.sustain_con);
  wrBool(py.flags.sustain_dex);
  wrBool(py.flags.sustain_chr);
  wrBool(py.flags.confuse_monster);
  wrByte(py.flags.new_spells_to_learn);

  wrShort(globals.missiles_counter);
  wrLong(dg.game_turn);
  wrShort(py.pack.unique_items);
  for (let i = 0; i < py.pack.unique_items; i++) {
    wrItem(py.inventory[i]);
  }
  for (let i = PlayerEquipment.Wield; i < PLAYER_INVENTORY_SIZE; i++) {
    wrItem(py.inventory[i]);
  }
  wrShort(py.pack.weight);
  wrShort(py.equipment_count);
  wrLong(py.flags.spells_learnt);
  wrLong(py.flags.spells_worked);
  wrLong(py.flags.spells_forgotten);
  wrBytes(py.flags.spells_learned_order, 32);
  wrBytes(objects_identified, OBJECT_IDENT_SIZE);
  wrLong(game.magic_seed);
  wrLong(game.town_seed);
  wrShort(globals.last_message_id);
  for (const message of messages) {
    wrString(message);
  }

  // this indicates 'cheating' if it is a one
  wrShort(globals.panic_save ? 1 : 0);
  wrShort(game.total_winner ? 1 : 0);
  wrShort(game.noscore);
  wrShorts(py.base_hp_levels, PLAYER_MAX_LEVEL);

  for (const store of stores) {
    wrLong(store.turns_left_before_closing);
    wrShort(store.insults_counter);
    wrByte(store.owner_id);
    wrByte(store.unique_items_counter);
    wrShort(store.good_purchases);
    wrShort(store.bad_purchases);
    for (let j = 0; j < store.unique_items_counter; j++) {
      wrLong(store.inventory[j].cost);
      wrItem(store.inventory[j].item);
    }
  }

  // save the current time in the save file
  l = getCurrentUnixTime();

  if (l < start_time) {
    // someone is messing with the clock!,
    // assume that we have been playing for 1 day
    l = (start_time + 86400) >>> 0;
  }
  wrLong(l);

  // put game.character_died_from string in save file
  wrString(game.character_died_from);

  // put the max_score in the save file
  l = playerCalculateTotalPoints() >>> 0;
  wrLong(l);

  // put the date_of_birth in the save file
  wrLong(py.misc.date_of_birth);

  // only level specific info follows, this allows characters to be
  // resurrected, the dungeon level info is not needed for a resurrection
  if (game.character_is_dead) {
    return !(fp().error() || fp().flush() === EOF);
  }

  wrShort(dg.current_level);
  wrShort(py.pos.y);
  wrShort(py.pos.x);
  wrShort(globals.monster_multiply_total);
  wrShort(dg.height);
  wrShort(dg.width);
  wrShort(dg.panel.max_rows);
  wrShort(dg.panel.max_cols);

  for (let i = 0; i < MAX_HEIGHT; i++) {
    for (let j = 0; j < MAX_WIDTH; j++) {
      if (dg.floor[i][j].creature_id !== 0) {
        wrByte(i);
        wrByte(j);
        wrByte(dg.floor[i][j].creature_id);
      }
    }
  }

  // marks end of creature_id info
  wrByte(0xFF);

  for (let i = 0; i < MAX_HEIGHT; i++) {
    for (let j = 0; j < MAX_WIDTH; j++) {
      if (dg.floor[i][j].treasure_id !== 0) {
        wrByte(i);
        wrByte(j);
        wrByte(dg.floor[i][j].treasure_id);
      }
    }
  }

  // marks end of treasure_id info
  wrByte(0xFF);

  // must set counter to zero, note that code may write out two bytes unnecessarily
  let count = 0;
  let prev_char = 0; // uint8_t

  for (const row of dg.floor) {
    for (const tile of row) {
      const char_tmp = (tile.feature_id | ((tile.perma_lit_room ? 1 : 0) << 4) | ((tile.field_mark ? 1 : 0) << 5) |
        ((tile.permanent_light ? 1 : 0) << 6) | ((tile.temporary_light ? 1 : 0) << 7)) & 0xff;

      if (char_tmp !== prev_char || count === UCHAR_MAX) {
        wrByte(count);
        wrByte(prev_char);
        prev_char = char_tmp;
        count = 1;
      } else {
        count++;
      }
    }
  }

  // save last entry
  wrByte(count);
  wrByte(prev_char);

  wrShort(game.treasure.current_id);
  for (let i = config.treasure.MIN_TREASURE_LIST_ID; i < game.treasure.current_id; i++) {
    wrItem(game.treasure.list[i]);
  }
  wrShort(globals.next_free_monster_id);
  for (let i = config.monsters.MON_MIN_INDEX_ID; i < globals.next_free_monster_id; i++) {
    wrMonster(monsters[i]);
  }

  return !(fp().error() || fp().flush() === EOF);
}

async function saveChar(filename: string): Promise<boolean> {
  if (game.character_saved) {
    return true; // Nothing to save.
  }

  await putQIO();
  await playerDisturb(1, 0); // Turn off resting and searching.
  playerChangeSpeed(-py.pack.heaviness); // Fix the speed
  py.pack.heaviness = 0;
  let ok = false;

  fileptr = null; // Do not assume it has been init'ed

  const files = platform().files;

  // open(filename, O_RDWR | O_CREAT | O_EXCL, 0600): fails if the file exists
  let fd = files.exists(filename) ? -1 : files.write(filename, new Uint8Array(0)) ? 0 : -1;

  if (fd < 0 && files.exists(filename) &&
    (from_save_file !== 0 || (game.wizard_mode && (await getInputConfirmation("Can't make new save file. Overwrite old?"))))) {
    // (void) chmod(filename.c_str(), 0600); then open(filename, O_RDWR | O_TRUNC, 0600)
    fd = files.write(filename, new Uint8Array(0)) ? 0 : -1;
  }

  if (fd >= 0) {
    // (void) close(fd);
    fileptr = ByteFile.open(config.files.save_game, 'wb');
  }

  if (fileptr !== null) {
    xor_byte = 0;
    wrByte(CURRENT_VERSION_MAJOR);
    xor_byte = 0;
    wrByte(CURRENT_VERSION_MINOR);
    xor_byte = 0;
    wrByte(CURRENT_VERSION_PATCH);
    xor_byte = 0;

    const char_tmp = (randomNumber(256) - 1) & 0xff;
    wrByte(char_tmp);
    // Note that xor_byte is now equal to char_tmp

    ok = svWrite();

    if (fp().close() === EOF) {
      ok = false;
    }
  }

  if (!ok) {
    if (fd >= 0) {
      files.remove(filename);
    }

    let output: string;
    if (fd >= 0) {
      output = "Error writing to file '" + filename + "'";
    } else {
      output = "Can't create new file '" + filename + "'";
    }
    await printMessage(output);

    return false;
  }

  game.character_saved = true;
  dg.game_turn = -1;

  return true;
}

// Certain checks are omitted for the wizard. -CJS-
export async function loadGame(generate: Ref<boolean>): Promise<boolean> {
  let c: number;
  let time_saved = 0; // uint32_t
  let version_maj = 0;
  let version_min = 0;
  let patch_level = 0;

  generate.v = true;
  let fd = -1;
  let total_count = 0;

  const files = platform().files;

  // Not required for Mac, because the file name is obtained through a dialog.
  // There is no way for a nonexistent file to be specified. -BS-
  if (!files.exists(config.files.save_game)) {
    await printMessage('Save file does not exist.');
    return false; // Don't bother with messages here. File absent.
  }

  await clearScreen();

  const filename = "Save file '" + config.files.save_game + "' present. Attempting restore.";
  putString(filename, { y: 23, x: 0 });

  // FIXME: check this if/else logic! -- MRC
  if (dg.game_turn >= 0) {
    await printMessage('IMPOSSIBLE! Attempt to restore while still alive!');
  } else if ((fd = files.exists(config.files.save_game) ? 0 : -1) < 0 &&
    // chmod(config::files::save_game, 0400) < 0 || (fd = open(...)) < 0
    (!files.exists(config.files.save_game) || (fd = files.exists(config.files.save_game) ? 0 : -1) < 0)) {
    // Allow restoring a file belonging to someone else, if we can delete it.
    // Hence first try to read without doing a chmod.

    await printMessage("Can't open file for reading.");
  } else {
    dg.game_turn = -1;
    let ok = true;

    // (void) close(fd);
    fd = -1; // Make sure it isn't closed again
    fileptr = ByteFile.open(config.files.save_game, 'rb');

    // where the reading went: 0 = to the end, 1 = `goto error`, 2 = `goto closefiles`
    let jump = 0;

    read: {
      if (fileptr === null) {
        jump = 1;
        break read;
      }

      await putStringClearToEOL('Restoring Memory...', { y: 0, x: 0 });
      await putQIO();

      // Note: setting these xor_byte is correct!
      xor_byte = 0;
      version_maj = rdByte();
      xor_byte = 0;
      version_min = rdByte();
      xor_byte = 0;
      patch_level = rdByte();

      xor_byte = getByte();

      if (!validGameVersion(version_maj, version_min, patch_level)) {
        await putStringClearToEOL('Sorry. This save file is from a different version of umoria.', { y: 2, x: 0 });
        jump = 1;
        break read;
      }

      let uint_16_t_tmp: number;
      let l: number; // uint32_t

      uint_16_t_tmp = rdShort();
      while (uint_16_t_tmp !== 0xFFFF) {
        if (uint_16_t_tmp >= MON_MAX_CREATURES) {
          jump = 1;
          break read;
        }
        const memory = creature_recall[uint_16_t_tmp];
        memory.movement = rdLong();
        memory.spells = rdLong();
        memory.kills = rdShort();
        memory.deaths = rdShort();
        memory.defenses = rdShort();
        memory.wake = rdByte();
        memory.ignore = rdByte();
        rdBytes(memory.attacks, MON_MAX_ATTACKS);
        uint_16_t_tmp = rdShort();
      }

      l = rdLong();

      config.options.run_cut_corners = (l & 0x1) !== 0;
      config.options.run_examine_corners = (l & 0x2) !== 0;
      config.options.run_print_self = (l & 0x4) !== 0;
      config.options.find_bound = (l & 0x8) !== 0;
      config.options.prompt_to_pickup = (l & 0x10) !== 0;
      config.options.use_roguelike_keys = (l & 0x20) !== 0;
      config.options.show_inventory_weights = (l & 0x40) !== 0;
      config.options.highlight_seams = (l & 0x80) !== 0;
      config.options.run_ignore_doors = (l & 0x100) !== 0;
      config.options.error_beep_sound = (l & 0x200) !== 0;
      config.options.display_counts = (l & 0x400) !== 0;

      // Don't allow resurrection of game.total_winner characters.  It causes
      // problems because the character level is out of the allowed range.
      if (game.to_be_wizard && (l & 0x40000000) !== 0) {
        await printMessage('Sorry, this character is retired from moria.');
        await printMessage('You can not resurrect a retired character.');
      } else if (game.to_be_wizard && (l & 0x80000000) !== 0 && (await getInputConfirmation('Resurrect a dead character?'))) {
        l = (l & ~0x80000000) >>> 0;
      }

      if ((l & 0x80000000) === 0) {
        py.misc.name = rdString();
        py.misc.gender = rdBool();
        py.misc.au = rdLong();
        py.misc.max_exp = rdLong();
        py.misc.exp = rdLong();
        py.misc.exp_fraction = rdShort();
        py.misc.age = rdShort();
        py.misc.height = rdShort();
        py.misc.weight = rdShort();
        py.misc.level = rdShort();
        py.misc.max_dungeon_depth = rdShort();
        py.misc.chance_in_search = rdShort();
        py.misc.fos = rdShort();
        py.misc.bth = rdShort();
        py.misc.bth_with_bows = rdShort();
        py.misc.mana = rdShort();
        py.misc.max_hp = rdShort();
        py.misc.plusses_to_hit = rdShort();
        py.misc.plusses_to_damage = rdShort();
        py.misc.ac = rdShort();
        py.misc.magical_ac = rdShort();
        py.misc.display_to_hit = rdShort();
        py.misc.display_to_damage = rdShort();
        py.misc.display_ac = rdShort();
        py.misc.display_to_ac = rdShort();
        py.misc.disarm = rdShort();
        py.misc.saving_throw = rdShort();
        py.misc.social_class = rdShort();
        py.misc.stealth_factor = rdShort();
        py.misc.class_id = rdByte();
        py.misc.race_id = rdByte();
        py.misc.hit_die = rdByte();
        py.misc.experience_factor = rdByte();
        py.misc.current_mana = rdShort();
        py.misc.current_mana_fraction = rdShort();
        py.misc.current_hp = rdShort();
        py.misc.current_hp_fraction = rdShort();
        for (let i = 0; i < py.misc.history.length; i++) {
          py.misc.history[i] = rdString();
        }

        rdBytes(py.stats.max, 6);
        rdBytes(py.stats.current, 6);
        rdShorts(py.stats.modified, 6);
        rdBytes(py.stats.used, 6);

        py.flags.status = rdLong();
        py.flags.rest = rdShort();
        py.flags.blind = rdShort();
        py.flags.paralysis = rdShort();
        py.flags.confused = rdShort();
        py.flags.food = rdShort();
        py.flags.food_digested = rdShort();
        py.flags.protection = rdShort();
        py.flags.speed = rdShort();
        py.flags.fast = rdShort();
        py.flags.slow = rdShort();
        py.flags.afraid = rdShort();
        py.flags.poisoned = rdShort();
        py.flags.image = rdShort();
        py.flags.protect_evil = rdShort();
        py.flags.invulnerability = rdShort();
        py.flags.heroism = rdShort();
        py.flags.super_heroism = rdShort();
        py.flags.blessed = rdShort();
        py.flags.heat_resistance = rdShort();
        py.flags.cold_resistance = rdShort();
        py.flags.detect_invisible = rdShort();
        py.flags.word_of_recall = rdShort();
        py.flags.see_infra = rdShort();
        py.flags.timed_infra = rdShort();
        py.flags.see_invisible = rdBool();
        py.flags.teleport = rdBool();
        py.flags.free_action = rdBool();
        py.flags.slow_digest = rdBool();
        py.flags.aggravate = rdBool();
        py.flags.resistant_to_fire = rdBool();
        py.flags.resistant_to_cold = rdBool();
        py.flags.resistant_to_acid = rdBool();
        py.flags.regenerate_hp = rdBool();
        py.flags.resistant_to_light = rdBool();
        py.flags.free_fall = rdBool();
        py.flags.sustain_str = rdBool();
        py.flags.sustain_int = rdBool();
        py.flags.sustain_wis = rdBool();
        py.flags.sustain_con = rdBool();
        py.flags.sustain_dex = rdBool();
        py.flags.sustain_chr = rdBool();
        py.flags.confuse_monster = rdBool();
        py.flags.new_spells_to_learn = rdByte();

        globals.missiles_counter = rdShort();
        dg.game_turn = rdLong();
        py.pack.unique_items = rdShort();
        if (py.pack.unique_items > PlayerEquipment.Wield) {
          jump = 1;
          break read;
        }
        for (let i = 0; i < py.pack.unique_items; i++) {
          rdItem(py.inventory[i]);
        }
        for (let i = PlayerEquipment.Wield; i < PLAYER_INVENTORY_SIZE; i++) {
          rdItem(py.inventory[i]);
        }
        py.pack.weight = rdShort();
        py.equipment_count = rdShort();
        py.flags.spells_learnt = rdLong();
        py.flags.spells_worked = rdLong();
        py.flags.spells_forgotten = rdLong();
        rdBytes(py.flags.spells_learned_order, 32);
        rdBytes(objects_identified, OBJECT_IDENT_SIZE);
        game.magic_seed = rdLong();
        game.town_seed = rdLong();
        globals.last_message_id = rdShort();
        for (let i = 0; i < messages.length; i++) {
          messages[i] = rdString();
        }

        const panic_save_short = rdShort();
        const total_winner_short = rdShort();
        globals.panic_save = panic_save_short !== 0;
        game.total_winner = total_winner_short !== 0;

        game.noscore = rdShort();
        rdShorts(py.base_hp_levels, PLAYER_MAX_LEVEL);

        for (const store of stores) {
          store.turns_left_before_closing = rdLong();
          store.insults_counter = rdShort();
          store.owner_id = rdByte();
          store.unique_items_counter = rdByte();
          store.good_purchases = rdShort();
          store.bad_purchases = rdShort();
          if (store.unique_items_counter > STORE_MAX_DISCRETE_ITEMS) {
            jump = 1;
            break read;
          }
          for (let j = 0; j < store.unique_items_counter; j++) {
            store.inventory[j].cost = rdLong();
            rdItem(store.inventory[j].item);
          }
        }

        time_saved = rdLong();
        game.character_died_from = rdString();
        py.max_score = rdLong();
        py.misc.date_of_birth = rdLong();
      }

      c = fp().getc();
      if (c === EOF || (l & 0x80000000) !== 0) {
        if ((l & 0x80000000) === 0) {
          if (!game.to_be_wizard || dg.game_turn < 0) {
            jump = 1;
            break read;
          }
          await putStringClearToEOL('Attempting a resurrection!', { y: 0, x: 0 });
          if (py.misc.current_hp < 0) {
            py.misc.current_hp = 0;
            py.misc.current_hp_fraction = 0;
          }

          // don't let them starve to death immediately
          if (py.flags.food < 0) {
            py.flags.food = 0;
          }

          // don't let them immediately die of poison again
          if (py.flags.poisoned > 1) {
            py.flags.poisoned = 1;
          }

          dg.current_level = 0; // Resurrect on the town level.
          game.character_generated = true;

          // set `noscore` to indicate a resurrection, and don't enter wizard mode
          game.to_be_wizard = false;
          game.noscore |= 0x1;
        } else {
          // Make sure that this message is seen, since it is a bit
          // more interesting than the other messages.
          await printMessage('Restoring Memory of a departed spirit...');
          dg.game_turn = -1;
        }
        await putQIO();
        jump = 2;
        break read;
      }
      if (ungetc(c) === EOF) {
        jump = 1;
        break read;
      }

      await putStringClearToEOL('Restoring Character...', { y: 0, x: 0 });
      await putQIO();

      // only level specific info should follow,
      // not present for dead characters

      dg.current_level = rdShort();
      py.pos.y = rdShort();
      py.pos.x = rdShort();
      globals.monster_multiply_total = rdShort();
      dg.height = rdShort();
      dg.width = rdShort();
      dg.panel.max_rows = rdShort();
      dg.panel.max_cols = rdShort();

      let char_tmp: number, ychar: number, xchar: number, count: number;

      // read in the creature ptr info
      char_tmp = rdByte();
      while (char_tmp !== 0xFF) {
        ychar = char_tmp;
        xchar = rdByte();
        char_tmp = rdByte();
        if (xchar > MAX_WIDTH || ychar > MAX_HEIGHT) {
          jump = 1;
          break read;
        }
        dg.floor[ychar][xchar].creature_id = char_tmp;
        char_tmp = rdByte();
      }

      // read in the treasure ptr info
      char_tmp = rdByte();
      while (char_tmp !== 0xFF) {
        ychar = char_tmp;
        xchar = rdByte();
        char_tmp = rdByte();
        if (xchar > MAX_WIDTH || ychar > MAX_HEIGHT) {
          jump = 1;
          break read;
        }
        dg.floor[ychar][xchar].treasure_id = char_tmp;
        char_tmp = rdByte();
      }

      // read in the rest of the cave info
      let tile = 0; // tile = &dg.floor[0][0], as an index into the floor
      total_count = 0;
      while (total_count !== MAX_HEIGHT * MAX_WIDTH) {
        count = rdByte();
        char_tmp = rdByte();
        for (let i = count; i > 0; i--) {
          if (tile >= MAX_HEIGHT * MAX_WIDTH) {
            jump = 1;
            break read;
          }
          const t = dg.floor[idiv(tile, MAX_WIDTH)][tile % MAX_WIDTH];
          t.feature_id = char_tmp & 0xF;
          t.perma_lit_room = ((char_tmp >> 4) & 0x1) !== 0;
          t.field_mark = ((char_tmp >> 5) & 0x1) !== 0;
          t.permanent_light = ((char_tmp >> 6) & 0x1) !== 0;
          t.temporary_light = ((char_tmp >> 7) & 0x1) !== 0;
          tile++;
        }
        total_count += count;
      }

      game.treasure.current_id = rdShort();
      if (game.treasure.current_id > LEVEL_MAX_OBJECTS) {
        jump = 1;
        break read;
      }
      for (let i = config.treasure.MIN_TREASURE_LIST_ID; i < game.treasure.current_id; i++) {
        rdItem(game.treasure.list[i]);
      }
      globals.next_free_monster_id = rdShort();
      if (globals.next_free_monster_id > MON_TOTAL_ALLOCATIONS) {
        jump = 1;
        break read;
      }
      for (let i = config.monsters.MON_MIN_INDEX_ID; i < globals.next_free_monster_id; i++) {
        rdMonster(monsters[i]);
      }

      generate.v = false; // We have restored a cave - no need to generate.

      if (fp().error()) {
        jump = 1;
        break read;
      }
    }

    if (jump === 1 || (jump === 0 && dg.game_turn < 0)) {
      // error:
      ok = false; // Assume bad data.
    } else if (jump === 0) {
      // don't overwrite the killed by string if character is dead
      if (py.misc.current_hp >= 0) {
        game.character_died_from = '(alive and well)';
      }
      game.character_generated = true;
    }

    // closefiles:

    if (fileptr !== null) {
      if (fileptr.close() < 0) {
        ok = false;
      }
    }
    if (fd >= 0) {
      // (void) close(fd);
    }

    if (!ok) {
      await printMessage('Error during reading of file.');
    } else {
      // let the user overwrite the old save file when save/quit
      from_save_file = 1;

      if (globals.panic_save) {
        await printMessage('This game is from a panic save.  Score will not be added to scoreboard.');
      } else if (((game.noscore === 0 ? 1 : 0) & 0x04) !== 0) {
        await printMessage('This character is already on the scoreboard; it will not be scored again.');
        game.noscore |= 0x4;
      }

      if (dg.game_turn >= 0) { // Only if a full restoration.
        py.weapon_is_heavy = false;
        py.pack.heaviness = 0;
        await playerStrength();

        // rotate store inventory, depending on how old the save file
        // is foreach day old (rounded up), call storeMaintenance
        // calculate age in seconds
        start_time = getCurrentUnixTime();

        let age: number; // uint32_t

        // check for reasonable values of time here ...
        if (start_time < time_saved) {
          age = 0;
        } else {
          age = (start_time - time_saved) >>> 0;
        }

        age = Math.trunc((age + 43200) / 86400) >>> 0; // age in days
        if (age > 10) {
          age = 10; // in case save file is very old
        }

        for (let i = 0; i < age; i++) {
          await storeMaintenance();
        }
      }

      if (game.noscore !== 0) {
        await printMessage('This save file cannot be used to get on the score board.');
      }
      if (validGameVersion(version_maj, version_min, patch_level) && !isCurrentGameVersion(version_maj, version_min, patch_level)) {
        let msg = 'Save file version ';
        msg += to_string(version_maj) + '.' + to_string(version_min);
        msg += ' accepted on game version ';
        msg += to_string(CURRENT_VERSION_MAJOR) + '.' + to_string(CURRENT_VERSION_MINOR) + '.';
        await printMessage(msg);
      }

      // if false: only restored options and monster memory.
      return dg.game_turn >= 0;
    }
  }
  dg.game_turn = -1;
  await putStringClearToEOL('Please try again without that save file.', { y: 1, x: 0 });

  // We have messages for the player to read, this will ask for a keypress
  await printMessage(null);

  await exitProgram();

  return false; // not reached
}

/** ungetc(c, fileptr) of the byte just read: c, or EOF */
function ungetc(c: number): number {
  return fp().seek(-1, SEEK_CUR) === 0 ? c : EOF;
}

function wrBool(value: boolean): void {
  wrByte(value ? 1 : 0);
}

function wrByte(value: number): void {
  xor_byte = (xor_byte ^ value) & 0xff;
  fp().putc(xor_byte);
}

function wrShort(value: number): void {
  xor_byte = (xor_byte ^ (value & 0xFF)) & 0xff;
  fp().putc(xor_byte);
  xor_byte = (xor_byte ^ ((value >> 8) & 0xFF)) & 0xff;
  fp().putc(xor_byte);
}

function wrLong(value: number): void {
  value = value >>> 0;
  xor_byte = (xor_byte ^ (value & 0xFF)) & 0xff;
  fp().putc(xor_byte);
  xor_byte = (xor_byte ^ ((value >>> 8) & 0xFF)) & 0xff;
  fp().putc(xor_byte);
  xor_byte = (xor_byte ^ ((value >>> 16) & 0xFF)) & 0xff;
  fp().putc(xor_byte);
  xor_byte = (xor_byte ^ ((value >>> 24) & 0xFF)) & 0xff;
  fp().putc(xor_byte);
}

function wrBytes(value: ArrayLike<number>, count: number): void {
  for (let i = 0; i < count; i++) {
    xor_byte = (xor_byte ^ value[i]) & 0xff;
    fp().putc(xor_byte);
  }
}

function wrString(str: string): void {
  const s = cstr(str);
  for (let i = 0; i < s.length; i++) {
    xor_byte = (xor_byte ^ s.charCodeAt(i)) & 0xff;
    fp().putc(xor_byte);
  }
  // the terminating NUL
  xor_byte ^= 0;
  fp().putc(xor_byte);
}

function wrShorts(value: ArrayLike<number>, count: number): void {
  for (let i = 0; i < count; i++) {
    xor_byte = (xor_byte ^ (value[i] & 0xFF)) & 0xff;
    fp().putc(xor_byte);
    xor_byte = (xor_byte ^ ((value[i] >> 8) & 0xFF)) & 0xff;
    fp().putc(xor_byte);
  }
}

function wrItem(item: Inventory_t): void {
  wrShort(item.id);
  wrByte(item.special_name_id);
  wrString(item.inscription);
  wrLong(item.flags);
  wrByte(item.category_id);
  wrByte(item.sprite);
  wrShort(item.misc_use);
  wrLong(item.cost);
  wrByte(item.sub_category_id);
  wrByte(item.items_count);
  wrShort(item.weight);
  wrShort(item.to_hit);
  wrShort(item.to_damage);
  wrShort(item.ac);
  wrShort(item.to_ac);
  wrByte(item.damage.dice);
  wrByte(item.damage.sides);
  wrByte(item.depth_first_found);
  wrByte(item.identification);
}

function wrMonster(monster: Monster_t): void {
  wrShort(monster.hp);
  wrShort(monster.sleep_count);
  wrShort(monster.speed);
  wrShort(monster.creature_id);
  wrByte(monster.pos.y);
  wrByte(monster.pos.x);
  wrByte(monster.distance_from_player);
  wrBool(monster.lit);
  wrByte(monster.stunned_amount);
  wrByte(monster.confused_amount);
}

// get_byte reads a single byte from a file, without any xor_byte encryption
function getByte(): number {
  return fp().getc() & 0xFF;
}

function rdBool(): boolean {
  return rdByte() !== 0;
}

function rdByte(): number {
  const c = getByte();
  const decoded_byte = (c ^ xor_byte) & 0xff;
  xor_byte = c;

  return decoded_byte;
}

function rdShort(): number {
  const c = getByte();
  let decoded_int = (c ^ xor_byte) & 0xff;

  xor_byte = getByte();
  decoded_int |= ((c ^ xor_byte) & 0xff) << 8;

  return decoded_int;
}

function rdLong(): number {
  let c = getByte();
  let decoded_long = (c ^ xor_byte) & 0xff;

  xor_byte = getByte();
  decoded_long |= ((c ^ xor_byte) & 0xff) << 8;

  c = getByte();
  decoded_long |= ((c ^ xor_byte) & 0xff) << 16;

  xor_byte = getByte();
  decoded_long |= ((c ^ xor_byte) & 0xff) << 24;

  return decoded_long >>> 0;
}

function rdBytes(value: { [i: number]: number }, count: number): void {
  for (let i = 0; i < count; i++) {
    const c = getByte();
    value[i] = (c ^ xor_byte) & 0xff;
    xor_byte = c;
  }
}

/** rdString(str): the string read (up to its NUL) */
function rdString(): string {
  let str = '';
  for (;;) {
    const c = getByte();
    const ch = (c ^ xor_byte) & 0xff;
    xor_byte = c;
    if (ch === 0) {
      break;
    }
    str += String.fromCharCode(ch);
  }
  return str;
}

function rdShorts(value: { [i: number]: number }, count: number): void {
  for (let i = 0; i < count; i++) {
    const c = getByte();
    let s = (c ^ xor_byte) & 0xff;
    xor_byte = getByte();
    s |= ((c ^ xor_byte) & 0xff) << 8;
    value[i] = s;
  }
}

function rdItem(item: Inventory_t): void {
  item.id = rdShort();
  item.special_name_id = rdByte();
  item.inscription = rdString();
  item.flags = rdLong();
  item.category_id = rdByte();
  item.sprite = rdByte();
  item.misc_use = rdShort();
  item.cost = rdLong();
  item.sub_category_id = rdByte();
  item.items_count = rdByte();
  item.weight = rdShort();
  item.to_hit = rdShort();
  item.to_damage = rdShort();
  item.ac = rdShort();
  item.to_ac = rdShort();
  item.damage.dice = rdByte();
  item.damage.sides = rdByte();
  item.depth_first_found = rdByte();
  item.identification = rdByte();
}

function rdMonster(monster: Monster_t): void {
  monster.hp = rdShort();
  monster.sleep_count = rdShort();
  monster.speed = rdShort();
  monster.creature_id = rdShort();
  monster.pos.y = rdByte();
  monster.pos.x = rdByte();
  monster.distance_from_player = rdByte();
  monster.lit = rdBool();
  monster.stunned_amount = rdByte();
  monster.confused_amount = rdByte();
}

// functions called from death.c to implement the score file

// set the local fileptr to the score file fileptr
export function setFileptr(file: ByteFile | null): void {
  fileptr = file;
}

/** A char[size] field of the score record: the string's bytes, then NULs (the record is zero-initialized). */
function charBuffer(str: string, size: number): Uint8Array {
  const b = new Uint8Array(size);
  const s = cstr(str);
  for (let i = 0; i < s.length && i < size; i++) {
    b[i] = s.charCodeAt(i) & 0xff;
  }
  return b;
}

/** The C string in a char[size] field read from the file. */
function charBufferString(b: Uint8Array): string {
  let s = '';
  for (let i = 0; i < b.length && b[i] !== 0; i++) {
    s += String.fromCharCode(b[i]);
  }
  return s;
}

export function saveHighScore(score: HighScore_t): void {
  // Save the encryption byte for robustness.
  wrByte(xor_byte);

  wrLong(score.points);
  wrLong(score.birth_date);
  wrShort(score.uid);
  wrShort(score.mhp);
  wrShort(score.chp);
  wrByte(score.dungeon_depth);
  wrByte(score.level);
  wrByte(score.deepest_dungeon_depth);
  wrByte(score.gender);
  wrByte(score.race);
  wrByte(score.character_class);
  wrBytes(charBuffer(score.name, PLAYER_NAME_SIZE), PLAYER_NAME_SIZE);
  wrBytes(charBuffer(score.died_from, 25), 25);
}

export function readHighScore(score: HighScore_t): void {
  // Read the encryption byte.
  xor_byte = getByte();

  score.points = rdLong();
  score.birth_date = rdLong();
  score.uid = rdShort();
  score.mhp = rdShort();
  score.chp = rdShort();
  score.dungeon_depth = rdByte();
  score.level = rdByte();
  score.deepest_dungeon_depth = rdByte();
  score.gender = rdByte();
  score.race = rdByte();
  score.character_class = rdByte();
  const name = new Uint8Array(PLAYER_NAME_SIZE);
  rdBytes(name, PLAYER_NAME_SIZE);
  score.name = charBufferString(name);
  const died_from = new Uint8Array(25);
  rdBytes(died_from, 25);
  score.died_from = charBufferString(died_from);
}
