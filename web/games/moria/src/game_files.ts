// game_files.cpp: Misc code to access files used by Moria
//
// The installation's text files (data/*.txt) and the files the player writes (character records,
// object samplings) are C FILE*s of bytefile.ts on the platform. open() with O_CREAT | O_EXCL is the
// platform's files.exists()/write().
import { ByteFile } from './bytefile.ts';
import { config } from './config.ts';
import {
  BTH_PER_PLUS_TO_HIT_ADJUST, CTRL_KEY, ESCAPE, PLAYER_INVENTORY_SIZE, PLAYER_MAX_LEVEL, PlayerAttr, PlayerClassLevelAdj,
  PlayerEquipment, TV_NOTHING,
} from './constants.ts';
import { character_races, class_level_adj, classes } from './data_player.ts';
import { popt, pusht, itemGetRandomObjectId } from './game_objects.ts';
import { game, py, sorted_objects } from './globals.ts';
import { stringToNumber } from './helpers.ts';
import { itemAppendToInscription, itemDescription, itemIdentifyAsStoreBought } from './identification.ts';
import { idiv, ref, sprintf } from './libc.ts';
import { inventoryItemCopyTo, inventoryItemIsCursed } from './inventory.ts';
import { platform } from './platform.ts';
import { playerGetGenderLabel, playerRankTitle } from './player.ts';
import { playerDisarmAdjustment, playerStatAdjustmentWisdomIntelligence } from './player_stats.ts';
import { magicTreasureMagicalAbility } from './treasure.ts';
import { statRating, statsAsString } from './ui.ts';
import {
  clearScreen, getInputConfirmation, getKeyInput, getStringInput, printMessage, putQIO, putString, putStringClearToEOL,
  terminalRestoreScreen, terminalSaveScreen, waitForContinueKey,
} from './ui_io.ts';

//  initializeScoreFile
//  Open the score file while we still have the setuid privileges.  Later
//  when the score is being written out, you must be sure to flock the file
//  so we don't have multiple people trying to write to it at the same time.
//  Craig Norborg (doc)    Mon Aug 10 16:41:59 EST 1987
export function initializeScoreFile(): boolean {
  // highscore_fp = fopen(config::files::scores, "rb+"): the handle is never used again
  const highscore_fp = ByteFile.open(config.files.scores, 'rb+');

  return highscore_fp !== null;
}

// Attempt to open and print the file containing the intro splash screen text -RAK-
export async function displaySplashScreen(): Promise<void> {
  let in_line: string | null;

  const screen_file = ByteFile.open(config.files.splash_screen, 'r');
  if (screen_file !== null) {
    await clearScreen();
    for (let i = 0; (in_line = screen_file.gets(80)) !== null; i++) {
      putString(in_line, { y: i, x: 0 });
    }
    await waitForContinueKey(23);

    screen_file.close();
  }
}

// Open and display a text help file
// File perusal, primitive, but portable -CJS-
export async function displayTextHelpFile(filename: string): Promise<void> {
  const file = ByteFile.open(filename, 'r');
  if (file === null) {
    await putStringClearToEOL("Can not find help file '" + filename + "'.", { y: 0, x: 0 });
    return;
  }

  terminalSaveScreen();

  const max_line_length = 80;
  let line_buffer: string | null;

  while (!file.eof()) {
    await clearScreen();

    for (let i = 0; i < 23; i++) {
      if ((line_buffer = file.gets(max_line_length - 1)) !== null) {
        putString(line_buffer, { y: i, x: 0 });
      }
    }

    await putStringClearToEOL('[ press any key to continue ]', { y: 23, x: 23 });
    if ((await getKeyInput()) === ESCAPE) {
      break;
    }
  }

  file.close();

  terminalRestoreScreen();
}

// Open and display a "death" text file
export async function displayDeathFile(filename: string): Promise<void> {
  const file = ByteFile.open(filename, 'r');
  if (file === null) {
    await putStringClearToEOL("Can not find help file '" + filename + "'.", { y: 0, x: 0 });
    return;
  }

  await clearScreen();

  const max_line_length = 80;
  let line_buffer: string | null;

  for (let i = 0; i < 23 && !file.eof(); i++) {
    if ((line_buffer = file.gets(max_line_length - 1)) !== null) {
      putString(line_buffer, { y: i, x: 0 });
    }
  }
  file.close();
}

// Prints a list of random objects to a file. -RAK-
// Note that the objects produced is a sampling of objects
// which be expected to appear on that level.
export async function outputRandomLevelObjectsToFile(): Promise<void> {
  const input = ref('');

  await putStringClearToEOL('Produce objects on what level?: ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 32 }, 10))) {
    return;
  }

  const level = ref(0);
  if (!stringToNumber(input.v, level)) {
    return;
  }

  await putStringClearToEOL('Produce how many objects?: ', { y: 0, x: 0 });
  if (!(await getStringInput(input, { y: 0, x: 27 }, 10))) {
    return;
  }

  const count = ref(0);
  if (!stringToNumber(input.v, count)) {
    return;
  }

  if (count.v < 1 || level.v < 0 || level.v > 1200) {
    await putStringClearToEOL('Parameters no good.', { y: 0, x: 0 });
    return;
  }

  if (count.v > 10000) {
    count.v = 10000;
  }

  const small_objects = await getInputConfirmation('Small objects only?');

  await putStringClearToEOL('File name: ', { y: 0, x: 0 });

  const filename = ref('');

  if (!(await getStringInput(filename, { y: 0, x: 11 }, 64))) {
    return;
  }
  if (filename.v.length === 0) {
    return;
  }

  const file_ptr = ByteFile.open(filename.v, 'w');
  if (file_ptr === null) {
    await putStringClearToEOL('File could not be opened.', { y: 0, x: 0 });
    return;
  }

  input.v = sprintf('%d', count.v);
  input.v += ' random objects being produced...';
  await putStringClearToEOL(input.v, { y: 0, x: 0 });

  await putQIO();

  file_ptr.puts('*** Random Object Sampling:\n');
  file_ptr.puts(sprintf('*** %d objects\n', count.v));
  file_ptr.puts(sprintf('*** For Level %d\n', level.v));
  file_ptr.puts('\n');
  file_ptr.puts('\n');

  const treasure_id = await popt();

  for (let i = 0; i < count.v; i++) {
    const object_id = itemGetRandomObjectId(level.v, small_objects);
    inventoryItemCopyTo(sorted_objects[object_id], game.treasure.list[treasure_id]);

    magicTreasureMagicalAbility(treasure_id, level.v);

    const item = game.treasure.list[treasure_id];
    itemIdentifyAsStoreBought(item);

    if (inventoryItemIsCursed(item)) {
      itemAppendToInscription(item, config.identification.ID_DAMD);
    }

    itemDescription(input, item, true);
    file_ptr.puts(sprintf('%d %s\n', item.depth_first_found, input.v));
  }

  pusht(treasure_id & 0xff);

  file_ptr.close();

  await putStringClearToEOL('Completed.', { y: 0, x: 0 });
}

// Write character sheet to the file
async function writeCharacterSheetToFile(char_file: ByteFile): Promise<void> {
  await putStringClearToEOL('Writing character sheet...', { y: 0, x: 0 });
  await putQIO();

  const colon = ':';
  const blank = ' ';

  const stat_description = ref('');

  char_file.puts(sprintf('%c\n\n', CTRL_KEY('L')));

  char_file.puts(sprintf(' Name%9s %-23s', colon, py.misc.name));
  char_file.puts(sprintf(' Age%11s %6d', colon, py.misc.age));
  statsAsString(py.stats.used[PlayerAttr.A_STR], stat_description);
  char_file.puts(sprintf('   STR : %s\n', stat_description.v));
  char_file.puts(sprintf(' Race%9s %-23s', colon, character_races[py.misc.race_id].name));
  char_file.puts(sprintf(' Height%8s %6d', colon, py.misc.height));
  statsAsString(py.stats.used[PlayerAttr.A_INT], stat_description);
  char_file.puts(sprintf('   INT : %s\n', stat_description.v));
  char_file.puts(sprintf(' Sex%10s %-23s', colon, playerGetGenderLabel()));
  char_file.puts(sprintf(' Weight%8s %6d', colon, py.misc.weight));
  statsAsString(py.stats.used[PlayerAttr.A_WIS], stat_description);
  char_file.puts(sprintf('   WIS : %s\n', stat_description.v));
  char_file.puts(sprintf(' Class%8s %-23s', colon, classes[py.misc.class_id].title));
  char_file.puts(sprintf(' Social Class : %6d', py.misc.social_class));
  statsAsString(py.stats.used[PlayerAttr.A_DEX], stat_description);
  char_file.puts(sprintf('   DEX : %s\n', stat_description.v));
  char_file.puts(sprintf(' Title%8s %-23s', colon, playerRankTitle()));
  char_file.puts(sprintf('%22s', blank));
  statsAsString(py.stats.used[PlayerAttr.A_CON], stat_description);
  char_file.puts(sprintf('   CON : %s\n', stat_description.v));
  char_file.puts(sprintf('%34s', blank));
  char_file.puts(sprintf('%26s', blank));
  statsAsString(py.stats.used[PlayerAttr.A_CHR], stat_description);
  char_file.puts(sprintf('   CHR : %s\n\n', stat_description.v));

  char_file.puts(sprintf(' + To Hit    : %6d', py.misc.display_to_hit));
  char_file.puts(sprintf('%7sLevel      : %7d', blank, py.misc.level));
  char_file.puts(sprintf('    Max Hit Points : %6d\n', py.misc.max_hp));
  char_file.puts(sprintf(' + To Damage : %6d', py.misc.display_to_damage));
  char_file.puts(sprintf('%7sExperience : %7d', blank, py.misc.exp));
  char_file.puts(sprintf('    Cur Hit Points : %6d\n', py.misc.current_hp));
  char_file.puts(sprintf(' + To AC     : %6d', py.misc.display_to_ac));
  char_file.puts(sprintf('%7sMax Exp    : %7d', blank, py.misc.max_exp));
  char_file.puts(sprintf('    Max Mana%8s %6d\n', colon, py.misc.mana));
  char_file.puts(sprintf('   Total AC  : %6d', py.misc.display_ac));
  if (py.misc.level >= PLAYER_MAX_LEVEL) {
    char_file.puts(sprintf('%7sExp to Adv : *******', blank));
  } else {
    // (int32_t)(uint32_t base_exp_levels[] * experience_factor / 100): unsigned arithmetic
    char_file.puts(sprintf('%7sExp to Adv : %7d', blank,
      Math.trunc(((py.base_exp_levels[py.misc.level - 1] * py.misc.experience_factor) >>> 0) / 100) | 0));
  }
  char_file.puts(sprintf('    Cur Mana%8s %6d\n', colon, py.misc.current_mana));
  char_file.puts(sprintf('%28sGold%8s %7d\n\n', blank, colon, py.misc.au));

  const xbth = py.misc.bth + py.misc.plusses_to_hit * BTH_PER_PLUS_TO_HIT_ADJUST + //
    (class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTH] * py.misc.level);
  const xbthb = py.misc.bth_with_bows + py.misc.plusses_to_hit * BTH_PER_PLUS_TO_HIT_ADJUST + //
    (class_level_adj[py.misc.class_id][PlayerClassLevelAdj.BTHB] * py.misc.level);

  // this results in a range from 0 to 29
  let xfos = 40 - py.misc.fos;
  if (xfos < 0) {
    xfos = 0;
  }
  const xsrh = py.misc.chance_in_search;

  // this results in a range from 0 to 9
  const xstl = py.misc.stealth_factor + 1;
  const xdis = py.misc.disarm + 2 * playerDisarmAdjustment() + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT) + //
    idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DISARM] * py.misc.level, 3);
  const xsave = py.misc.saving_throw + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_WIS) + //
    idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.SAVE] * py.misc.level, 3);
  const xdev = py.misc.saving_throw + playerStatAdjustmentWisdomIntelligence(PlayerAttr.A_INT) + //
    idiv(class_level_adj[py.misc.class_id][PlayerClassLevelAdj.DEVICE] * py.misc.level, 3);

  const xinfra = sprintf('%d feet', py.flags.see_infra * 10);

  char_file.puts('(Miscellaneous Abilities)\n\n');
  char_file.puts(sprintf(' Fighting    : %-10s', statRating({ y: 12, x: xbth })));
  char_file.puts(sprintf('   Stealth     : %-10s', statRating({ y: 1, x: xstl })));
  char_file.puts(sprintf('   Perception  : %s\n', statRating({ y: 3, x: xfos })));
  char_file.puts(sprintf(' Bows/Throw  : %-10s', statRating({ y: 12, x: xbthb })));
  char_file.puts(sprintf('   Disarming   : %-10s', statRating({ y: 8, x: xdis })));
  char_file.puts(sprintf('   Searching   : %s\n', statRating({ y: 6, x: xsrh })));
  char_file.puts(sprintf(' Saving Throw: %-10s', statRating({ y: 6, x: xsave })));
  char_file.puts(sprintf('   Magic Device: %-10s', statRating({ y: 6, x: xdev })));
  char_file.puts(sprintf('   Infra-Vision: %s\n\n', xinfra));

  // Write out the character's history
  char_file.puts('Character Background\n');
  for (const entry of py.misc.history) {
    char_file.puts(sprintf(' %s\n', entry));
  }
}

function equipmentPlacementDescription(item_id: number): string {
  switch (item_id) {
    case PlayerEquipment.Wield:
      return 'You are wielding';
    case PlayerEquipment.Head:
      return 'Worn on head';
    case PlayerEquipment.Neck:
      return 'Worn around neck';
    case PlayerEquipment.Body:
      return 'Worn on body';
    case PlayerEquipment.Arm:
      return 'Worn on shield arm';
    case PlayerEquipment.Hands:
      return 'Worn on hands';
    case PlayerEquipment.Right:
      return 'Right ring finger';
    case PlayerEquipment.Left:
      return 'Left  ring finger';
    case PlayerEquipment.Feet:
      return 'Worn on feet';
    case PlayerEquipment.Outer:
      return 'Worn about body';
    case PlayerEquipment.Light:
      return 'Light source is';
    case PlayerEquipment.Auxiliary:
      return 'Secondary weapon';
    default:
      return '*Unknown value*';
  }
}

// Write out the equipment list.
function writeEquipmentListToFile(equip_file: ByteFile): void {
  equip_file.puts("\n  [Character's Equipment List]\n\n");

  if (py.equipment_count === 0) {
    equip_file.puts('  Character has no equipment in use.\n');
    return;
  }

  const description = ref('');
  let item_slot_id = 0;

  for (let i = PlayerEquipment.Wield; i < PLAYER_INVENTORY_SIZE; i++) {
    if (py.inventory[i].category_id === TV_NOTHING) {
      continue;
    }

    itemDescription(description, py.inventory[i], true);
    equip_file.puts(sprintf('  %c) %-19s: %s\n', item_slot_id + 97, equipmentPlacementDescription(i), description.v));

    item_slot_id++;
  }

  equip_file.puts(sprintf('%c\n\n', CTRL_KEY('L')));
}

// Write out the character's inventory.
function writeInventoryToFile(inv_file: ByteFile): void {
  inv_file.puts('  [General Inventory List]\n\n');

  if (py.pack.unique_items === 0) {
    inv_file.puts('  Character has no objects in inventory.\n');
    return;
  }

  const description = ref('');

  for (let i = 0; i < py.pack.unique_items; i++) {
    itemDescription(description, py.inventory[i], true);
    inv_file.puts(sprintf('%c) %s\n', i + 97, description.v));
  }

  inv_file.puts(sprintf('%c', CTRL_KEY('L')));
}

// Print the character to a file or device -RAK-
export async function outputPlayerCharacterToFile(filename: string): Promise<boolean> {
  const files = platform().files;

  // open(filename, O_WRONLY | O_CREAT | O_EXCL, 0644)
  const eexist = files.exists(filename);
  let fd = eexist ? -1 : files.write(filename, new Uint8Array(0)) ? 0 : -1;
  if (fd < 0 && eexist) {
    if (await getInputConfirmation('Replace existing file ' + filename + '?')) {
      // open(filename, O_WRONLY, 0644) of the existing file
      fd = 0;
    }
  }

  let file: ByteFile | null;
  if (fd >= 0) {
    // on some non-unix machines, fdopen() is not reliable,
    // hence must call close() and then fopen().
    file = ByteFile.open(filename, 'w');
  } else {
    file = null;
  }

  if (file === null) {
    const msg = sprintf("Can't open file %s:", filename);
    await printMessage(msg);
    return false;
  }

  await writeCharacterSheetToFile(file);
  writeEquipmentListToFile(file);
  writeInventoryToFile(file);

  file.close();

  await putStringClearToEOL('Completed.', { y: 0, x: 0 });

  return true;
}
