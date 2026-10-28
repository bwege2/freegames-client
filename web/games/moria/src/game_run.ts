// game_run.cpp: Run the game: the main loop
import { characterCreate } from './character.ts';
import { config } from './config.ts';
import {
  CTRL_KEY, DELETE, ESCAPE, MAX_DUNGEON_OBJECTS, MESSAGE_HISTORY_SIZE, MON_MAX_CREATURES, MON_MAX_LEVELS, MON_TOTAL_ALLOCATIONS,
  PLAYER_INVENTORY_SIZE, PlayerAttr, PlayerEquipment, SCREEN_HEIGHT, SCREEN_WIDTH, SHRT_MAX, TREASURE_MAX_LEVELS, TV_CLOSED_DOOR,
  TV_DOWN_STAIR, TV_FLASK, TV_MAGIC_BOOK, TV_MAX_ENCHANT, TV_MIN_ENCHANT, TV_NEVER, TV_NOTHING, TV_OPEN_DOOR, TV_PRAYER_BOOK, TV_SPIKE,
  TV_SWORD, TV_UP_STAIR,
} from './constants.ts';
import { creatures_list } from './data_creatures.ts';
import { class_base_provisions, classes, magic_spells } from './data_player.ts';
import { game_objects } from './data_treasure.ts';
import { dungeonDisplayMap } from './dungeon.ts';
import { generateCave } from './dungeon_generate.ts';
import { look } from './dungeon_los.ts';
import { getDirectionWithMemory, randomNumber, seedsInitialize, setGameOptions } from './game.ts';
import { endGame } from './game_death.ts';
import { displaySplashScreen, displayTextHelpFile, outputRandomLevelObjectsToFile } from './game_files.ts';
import { loadGame, saveGame } from './game_save.ts';
import {
  dg, game, globals, messages, monster_levels, monsters, py, sorted_objects, treasure_levels,
} from './globals.ts';
import { getAndClearFirstBit, getCurrentUnixTime } from './helpers.ts';
import {
  identifyGameObject, itemAppendToInscription, itemIdentifyAsStoreBought, itemInscribe, itemTypeRemainingCountDescription,
  magicInitializeItemNames, spellItemIdentified,
} from './identification.ts';
import { inventoryCarryItem, inventoryDestroyItem, inventoryFindRange, inventoryItemCopyTo, inventoryItemIsCursed } from './inventory.ts';
import { chr, i16, i32, idiv, ord, ref, type Ref, sprintf, u16, u8 } from './libc.ts';
import { getAndCastMagicSpell } from './mage_spells.ts';
import { updateMonsters } from './monster.ts';
import { compactMonsters, monsterPlaceNewWithinDistance } from './monster_manager.ts';
import { platform } from './platform.ts';
import {
  playerCalculateAllowedSpellsCount, playerChangeSpeed, playerCloseDoor, playerDisturb, playerGainMana, playerGainSpells, playerMovePosition,
  playerNoLight, playerOpenClosedObject, playerRecalculateBonuses, playerRestOff, playerRestOn, playerSearch, playerSearchOff, playerSearchOn,
  playerStrength, playerTakesHit, playerTeleport,
} from './player.ts';
import { playerBash } from './player_bash.ts';
import { playerEat } from './player_eat.ts';
import { playerMove } from './player_move.ts';
import { pray } from './player_pray.ts';
import { quaff } from './player_quaff.ts';
import { playerEndRunning, playerFindInitialize, playerRunAndFind } from './player_run.ts';
import { playerInitializeBaseExperienceLevels, playerStatAdjustmentConstitution } from './player_stats.ts';
import { playerThrowItem } from './player_throw.ts';
import { playerDisarmTrap } from './player_traps.ts';
import { playerTunnel } from './player_tunnel.ts';
import { showScoresScreen } from './scores.ts';
import { scrollRead } from './scrolls.ts';
import { spellIdentifyItem, spellMapCurrentArea, spellMassGenocide } from './spells.ts';
import { staffUse, wandAim } from './staves.ts';
import { storeInitializeOwners } from './store.ts';
import { storeMaintenance } from './store_inventory.ts';
import { Inventory_t } from './structs.ts';
import {
  changeCharacterName, coordOutsidePanel, displayCharacterStats, displaySpellsList, drawDungeonPanel, dungeonResetView,
  printCharacterBlindStatus, printCharacterConfusedState, printCharacterCurrentArmorClass, printCharacterCurrentDepth,
  printCharacterCurrentHitPoints, printCharacterCurrentMana, printCharacterFearState, printCharacterHungerStatus,
  printCharacterMaxHitPoints, printCharacterMovementState, printCharacterPoisonedState, printCharacterSpeed, printCharacterStatsBlock,
  printCharacterStudyInstruction, printCharacterWinner,
} from './ui.ts';
import { inventoryExecuteCommand, inventoryGetInputForItemId, playerItemWearingDescription } from './ui_inventory.ts';
import {
  checkForNonBlockingKeyPress, clearScreen, eraseLine, flushInputBuffer, getCommand, getInputConfirmation, getKeyInput, messageLineClear,
  panelMoveCursor, printMessage, printMessageNoCommandInterrupt, putQIO, putString, putStringClearToEOL, terminalBellSound,
  terminalRestoreScreen, terminalSaveScreen, waitForContinueKey,
} from './ui_io.ts';
import {
  enterWizardMode, wizardCharacterAdjustment, wizardCreateObjects, wizardCureAll, wizardDropRandomItems, wizardGainExperience,
  wizardGenerateObject, wizardJumpLevel, wizardLightUpDungeon, wizardSummonMonster,
} from './wizard.ts';

export async function startMoria(seed: number, start_new_game: boolean): Promise<void> {
  // Roguelike keys are disabled by default.
  // This will be overridden by the setting in the game save file.
  config.options.use_roguelike_keys = false;

  priceAdjust();

  // Show the game splash screen
  await displaySplashScreen();

  // Grab a random seed from the clock
  seedsInitialize(seed >>> 0);

  // Init monster and treasure levels for allocate
  initializeMonsterLevels();
  initializeTreasureLevels();

  // Init the store inventories
  storeInitializeOwners();

  // NOTE: base exp levels need initializing before loading a game
  playerInitializeBaseExperienceLevels();

  // initialize some player fields - may or may not be needed -MRC-
  py.flags.spells_learnt = 0;
  py.flags.spells_worked = 0;
  py.flags.spells_forgotten = 0;

  // If -n is not passed, the calling routine will know
  // save file name, hence, this code is not necessary.

  // This restoration of a saved character may get ONLY the monster memory. In
  // this case, `loadGame()` returns false. It may also resurrect a dead character
  // (if you are the wizard). In this case, it returns true, but also sets the
  // parameter "generate" to true, as it does not recover any cave details.

  let result = false;
  const generate = ref(false);

  // access(config::files::save_game.c_str(), 0) == 0: the save file exists
  if (!start_new_game && platform().files.exists(config.files.save_game) && (await loadGame(generate))) {
    result = true;
  }

  // enter wizard mode before showing the character display, but must wait
  // until after loadGame() in case it was just a resurrection
  if (game.to_be_wizard) {
    if (!(await enterWizardMode())) {
      await endGame();
    }
  }

  if (result) {
    await changeCharacterName();

    // could be restoring a dead character after a signal or HANGUP
    if (py.misc.current_hp < 0) {
      game.character_is_dead = true;
    }
  } else {
    // Create character
    await characterCreate();

    py.misc.date_of_birth = getCurrentUnixTime();

    initializeCharacterInventory();
    py.flags.food = 7500;
    py.flags.food_digested = 2;

    // Spell and Mana based on class: Mage or Clerical realm.
    if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
      await clearScreen(); // makes spell list easier to read
      await playerCalculateAllowedSpellsCount(PlayerAttr.A_INT);
      playerGainMana(PlayerAttr.A_INT);
    } else if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_PRIEST) {
      await playerCalculateAllowedSpellsCount(PlayerAttr.A_WIS);
      await clearScreen(); // force out the 'learn prayer' message
      playerGainMana(PlayerAttr.A_WIS);
    }

    // Set some default values -MRC-
    py.temporary_light_only = false;
    py.weapon_is_heavy = false;
    py.pack.heaviness = 0;

    // prevent ^c quit from entering score into scoreboard,
    // and prevent signal from creating panic save until this
    // point, all info needed for save file is now valid.
    game.character_generated = true;
    generate.v = true;
  }

  magicInitializeItemNames();

  //
  // Begin the game
  //
  await clearScreen();
  putString('Press ? for help', { y: 0, x: 63 });
  printCharacterStatsBlock();

  if (generate.v) {
    await generateCave();
  }

  // Loop till dead, or exit
  while (!game.character_is_dead) {
    // Dungeon logic
    await playDungeon();

    // check for eof here, see getKeyInput() in io.c
    // eof can occur if the process gets a HANGUP signal
    if (globals.eof_flag !== 0) {
      game.character_died_from = '(end of input: saved)';
      if (!(await saveGame())) {
        game.character_died_from = 'unexpected eof';
      }

      // should not reach here, but if we do, this guarantees exit
      game.character_is_dead = true;
    }

    // New level if not dead
    if (!game.character_is_dead) {
      await generateCave();
    }
  }

  // Character gets buried.
  await endGame();
}

// Init players with some belongings -RAK-
function initializeCharacterInventory(): void {
  const item = new Inventory_t();

  // this is needed for bash to work right, it can't hurt anyway
  for (const entry of py.inventory) {
    inventoryItemCopyTo(config.dungeon.objects.OBJ_NOTHING, entry);
  }

  for (const item_id of class_base_provisions[py.misc.class_id]) {
    inventoryItemCopyTo(item_id, item);

    // this makes it spellItemIdentifyAndRemoveRandomInscription and itemSetAsIdentified
    itemIdentifyAsStoreBought(item);

    // must set this bit to display to_hit/to_damage for stiletto
    if (item.category_id === TV_SWORD) {
      item.identification |= config.identification.ID_SHOW_HIT_DAM;
    }

    inventoryCarryItem(item);
  }

  // weird place for it, but why not?
  py.flags.spells_learned_order.fill(99);
}

// Initializes M_LEVEL array for use with PLACE_MONSTER -RAK-
function initializeMonsterLevels(): void {
  monster_levels.fill(0);

  for (let i = 0; i < MON_MAX_CREATURES - config.monsters.MON_ENDGAME_MONSTERS; i++) {
    monster_levels[creatures_list[i].level]++;
  }

  for (let i = 1; i <= MON_MAX_LEVELS; i++) {
    monster_levels[i] += monster_levels[i - 1];
  }
}

// Initializes T_LEVEL array for use with PLACE_OBJECT -RAK-
function initializeTreasureLevels(): void {
  treasure_levels.fill(0);

  for (let i = 0; i < MAX_DUNGEON_OBJECTS; i++) {
    treasure_levels[game_objects[i].depth_first_found]++;
  }

  for (let i = 1; i <= TREASURE_MAX_LEVELS; i++) {
    treasure_levels[i] += treasure_levels[i - 1];
  }

  // now produce an array with object indexes sorted by level,
  // by using the info in treasure_levels, this is an O(n) sort!
  // this is not a stable sort, but that does not matter
  const indexes = new Array<number>(TREASURE_MAX_LEVELS + 1).fill(1);

  for (let i = 0; i < MAX_DUNGEON_OBJECTS; i++) {
    const level = game_objects[i].depth_first_found;
    const object_id = treasure_levels[level] - indexes[level];

    sorted_objects[object_id] = i16(i);

    indexes[level]++;
  }
}

// Adjust prices of objects -RAK-
function priceAdjust(): void {
  // #if (COST_ADJUSTMENT != 100): COST_ADJUSTMENT is 100, so the prices stay as they are
  //   round half-way cases up
  //   for (auto &item : game_objects) item.cost = ((item.cost * COST_ADJUSTMENT) + 50) / 100;
}

// Moria game module -RAK-
// The code in this section has gone through many revisions, and
// some of it could stand some more hard work. -RAK-

// It has had a bit more hard work. -CJS-

// Reset flags and initialize variables
function resetDungeonFlags(): void {
  game.command_count = 0;
  dg.generate_new_level = false;
  py.running_tracker = 0;
  game.teleport_player = false;
  globals.monster_multiply_total = 0;
  dg.floor[py.pos.y][py.pos.x].creature_id = 1;
}

// Check light status for dungeon setup
function playerInitializePlayerLight(): void {
  py.carrying_light = py.inventory[PlayerEquipment.Light].misc_use > 0;
}

// Check for a maximum level
function playerUpdateMaxDungeonDepth(): void {
  if (dg.current_level > py.misc.max_dungeon_depth) {
    py.misc.max_dungeon_depth = u16(dg.current_level);
  }
}

// Check light status
async function playerUpdateLightStatus(): Promise<void> {
  const item = py.inventory[PlayerEquipment.Light];

  if (py.carrying_light) {
    if (item.misc_use > 0) {
      item.misc_use--;

      if (item.misc_use === 0) {
        py.carrying_light = false;
        await printMessage('Your light has gone out!');
        await playerDisturb(0, 1);

        // unlight creatures
        await updateMonsters(false);
      } else if (item.misc_use < 40 && randomNumber(5) === 1 && py.flags.blind < 1) {
        await playerDisturb(0, 0);
        await printMessage('Your light is growing faint.');
      }
    } else {
      py.carrying_light = false;
      await playerDisturb(0, 1);

      // unlight creatures
      await updateMonsters(false);
    }
  } else if (item.misc_use > 0) {
    item.misc_use--;
    py.carrying_light = true;
    await playerDisturb(0, 1);

    // light creatures
    await updateMonsters(false);
  }
}

async function playerActivateHeroism(): Promise<void> {
  py.flags.status |= config.player.status.PY_HERO;
  await playerDisturb(0, 0);

  py.misc.max_hp += 10;
  py.misc.current_hp += 10;
  py.misc.bth += 12;
  py.misc.bth_with_bows += 12;

  await printMessage('You feel like a HERO!');
  printCharacterMaxHitPoints();
  printCharacterCurrentHitPoints();
}

async function playerDisableHeroism(): Promise<void> {
  py.flags.status &= ~config.player.status.PY_HERO;
  await playerDisturb(0, 0);

  py.misc.max_hp -= 10;
  if (py.misc.current_hp > py.misc.max_hp) {
    py.misc.current_hp = py.misc.max_hp;
    py.misc.current_hp_fraction = 0;
    printCharacterCurrentHitPoints();
  }
  py.misc.bth -= 12;
  py.misc.bth_with_bows -= 12;

  await printMessage('The heroism wears off.');
  printCharacterMaxHitPoints();
}

async function playerActivateSuperHeroism(): Promise<void> {
  py.flags.status |= config.player.status.PY_SHERO;
  await playerDisturb(0, 0);

  py.misc.max_hp += 20;
  py.misc.current_hp += 20;
  py.misc.bth += 24;
  py.misc.bth_with_bows += 24;

  await printMessage('You feel like a SUPER HERO!');
  printCharacterMaxHitPoints();
  printCharacterCurrentHitPoints();
}

async function playerDisableSuperHeroism(): Promise<void> {
  py.flags.status &= ~config.player.status.PY_SHERO;
  await playerDisturb(0, 0);

  py.misc.max_hp -= 20;
  if (py.misc.current_hp > py.misc.max_hp) {
    py.misc.current_hp = py.misc.max_hp;
    py.misc.current_hp_fraction = 0;
    printCharacterCurrentHitPoints();
  }
  py.misc.bth -= 24;
  py.misc.bth_with_bows -= 24;

  await printMessage('The super heroism wears off.');
  printCharacterMaxHitPoints();
}

async function playerUpdateHeroStatus(): Promise<void> {
  // Heroism
  if (py.flags.heroism > 0) {
    if ((py.flags.status & config.player.status.PY_HERO) === 0) {
      await playerActivateHeroism();
    }

    py.flags.heroism--;

    if (py.flags.heroism === 0) {
      await playerDisableHeroism();
    }
  }

  // Super Heroism
  if (py.flags.super_heroism > 0) {
    if ((py.flags.status & config.player.status.PY_SHERO) === 0) {
      await playerActivateSuperHeroism();
    }

    py.flags.super_heroism--;

    if (py.flags.super_heroism === 0) {
      await playerDisableSuperHeroism();
    }
  }
}

async function playerFoodConsumption(): Promise<number> {
  // Regenerate hp and mana
  let regen_amount: number = config.player.PLAYER_REGEN_NORMAL;

  if (py.flags.food < config.player.PLAYER_FOOD_ALERT) {
    if (py.flags.food < config.player.PLAYER_FOOD_WEAK) {
      if (py.flags.food < 0) {
        regen_amount = 0;
      } else if (py.flags.food < config.player.PLAYER_FOOD_FAINT) {
        regen_amount = config.player.PLAYER_REGEN_FAINT;
      } else if (py.flags.food < config.player.PLAYER_FOOD_WEAK) {
        regen_amount = config.player.PLAYER_REGEN_WEAK;
      }

      if ((py.flags.status & config.player.status.PY_WEAK) === 0) {
        py.flags.status |= config.player.status.PY_WEAK;
        await printMessage('You are getting weak from hunger.');
        await playerDisturb(0, 0);
        printCharacterHungerStatus();
      }

      if (py.flags.food < config.player.PLAYER_FOOD_FAINT && randomNumber(8) === 1) {
        py.flags.paralysis += randomNumber(5);
        await printMessage('You faint from the lack of food.');
        await playerDisturb(1, 0);
      }
    } else if ((py.flags.status & config.player.status.PY_HUNGRY) === 0) {
      py.flags.status |= config.player.status.PY_HUNGRY;
      await printMessage('You are getting hungry.');
      await playerDisturb(0, 0);
      printCharacterHungerStatus();
    }
  }

  // Food consumption
  // Note: Sped up characters really burn up the food!
  if (py.flags.speed < 0) {
    py.flags.food -= py.flags.speed * py.flags.speed;
  }

  py.flags.food -= py.flags.food_digested;

  if (py.flags.food < 0) {
    playerTakesHit(idiv(-py.flags.food, 16), 'starvation'); // -CJS-
    await playerDisturb(1, 0);
  }

  return regen_amount;
}

function playerUpdateRegeneration(amount: number): void {
  if (py.flags.regenerate_hp) {
    amount = idiv(amount * 3, 2);
  }

  if ((py.flags.status & config.player.status.PY_SEARCH) !== 0 || py.flags.rest !== 0) {
    amount = amount * 2;
  }

  if (py.flags.poisoned < 1 && py.misc.current_hp < py.misc.max_hp) {
    playerRegenerateHitPoints(amount);
  }

  if (py.misc.current_mana < py.misc.mana) {
    playerRegenerateMana(amount);
  }
}

async function playerUpdateBlindness(): Promise<void> {
  if (py.flags.blind <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_BLIND) === 0) {
    py.flags.status |= config.player.status.PY_BLIND;

    await drawDungeonPanel();
    printCharacterBlindStatus();
    await playerDisturb(0, 1);

    // unlight creatures
    await updateMonsters(false);
  }

  py.flags.blind--;

  if (py.flags.blind === 0) {
    py.flags.status &= ~config.player.status.PY_BLIND;

    printCharacterBlindStatus();
    await drawDungeonPanel();
    await playerDisturb(0, 1);

    // light creatures
    await updateMonsters(false);

    await printMessage('The veil of darkness lifts.');
  }
}

async function playerUpdateConfusion(): Promise<void> {
  if (py.flags.confused <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_CONFUSED) === 0) {
    py.flags.status |= config.player.status.PY_CONFUSED;
    printCharacterConfusedState();
  }

  py.flags.confused--;

  if (py.flags.confused === 0) {
    py.flags.status &= ~config.player.status.PY_CONFUSED;

    printCharacterConfusedState();
    await printMessage('You feel less confused now.');

    if (py.flags.rest !== 0) {
      await playerRestOff();
    }
  }
}

async function playerUpdateFearState(): Promise<void> {
  if (py.flags.afraid <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_FEAR) === 0) {
    if (py.flags.super_heroism + py.flags.heroism > 0) {
      py.flags.afraid = 0;
    } else {
      py.flags.status |= config.player.status.PY_FEAR;
      printCharacterFearState();
    }
  } else if (py.flags.super_heroism + py.flags.heroism > 0) {
    py.flags.afraid = 1;
  }

  py.flags.afraid--;

  if (py.flags.afraid === 0) {
    py.flags.status &= ~config.player.status.PY_FEAR;

    printCharacterFearState();
    await printMessage('You feel bolder now.');
    await playerDisturb(0, 0);
  }
}

async function playerUpdatePoisonedState(): Promise<void> {
  if (py.flags.poisoned <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_POISONED) === 0) {
    py.flags.status |= config.player.status.PY_POISONED;
    printCharacterPoisonedState();
  }

  py.flags.poisoned--;

  if (py.flags.poisoned === 0) {
    py.flags.status &= ~config.player.status.PY_POISONED;

    printCharacterPoisonedState();
    await printMessage('You feel better.');
    await playerDisturb(0, 0);

    return;
  }

  let damage: number;

  switch (playerStatAdjustmentConstitution()) {
    case -4:
      damage = 4;
      break;
    case -3:
    case -2:
      damage = 3;
      break;
    case -1:
      damage = 2;
      break;
    case 0:
      damage = 1;
      break;
    case 1:
    case 2:
    case 3:
      damage = dg.game_turn % 2 === 0 ? 1 : 0;
      break;
    case 4:
    case 5:
      damage = dg.game_turn % 3 === 0 ? 1 : 0;
      break;
    case 6:
      damage = dg.game_turn % 4 === 0 ? 1 : 0;
      break;
    default:
      damage = 0;
      break;
  }

  playerTakesHit(damage, 'poison');
  await playerDisturb(1, 0);
}

async function playerUpdateFastness(): Promise<void> {
  if (py.flags.fast <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_FAST) === 0) {
    py.flags.status |= config.player.status.PY_FAST;
    playerChangeSpeed(-1);

    await printMessage('You feel yourself moving faster.');
    await playerDisturb(0, 0);
  }

  py.flags.fast--;

  if (py.flags.fast === 0) {
    py.flags.status &= ~config.player.status.PY_FAST;
    playerChangeSpeed(1);

    await printMessage('You feel yourself slow down.');
    await playerDisturb(0, 0);
  }
}

async function playerUpdateSlowness(): Promise<void> {
  if (py.flags.slow <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_SLOW) === 0) {
    py.flags.status |= config.player.status.PY_SLOW;
    playerChangeSpeed(1);

    await printMessage('You feel yourself moving slower.');
    await playerDisturb(0, 0);
  }

  py.flags.slow--;

  if (py.flags.slow === 0) {
    py.flags.status &= ~config.player.status.PY_SLOW;
    playerChangeSpeed(-1);

    await printMessage('You feel yourself speed up.');
    await playerDisturb(0, 0);
  }
}

async function playerUpdateSpeed(): Promise<void> {
  await playerUpdateFastness();
  await playerUpdateSlowness();
}

// Resting is over?
async function playerUpdateRestingState(): Promise<void> {
  if (py.flags.rest > 0) {
    py.flags.rest--;

    // Resting over
    if (py.flags.rest === 0) {
      await playerRestOff();
    }
  } else if (py.flags.rest < 0) {
    // Rest until reach max mana and max hit points.
    py.flags.rest++;

    if ((py.misc.current_hp === py.misc.max_hp && py.misc.current_mana === py.misc.mana) || py.flags.rest === 0) {
      await playerRestOff();
    }
  }
}

// Hallucinating?   (Random characters appear!)
async function playerUpdateHallucination(): Promise<void> {
  if (py.flags.image <= 0) {
    return;
  }

  playerEndRunning();

  py.flags.image--;

  if (py.flags.image === 0) {
    // Used to draw entire screen! -CJS-
    await drawDungeonPanel();
  }
}

async function playerUpdateParalysis(): Promise<void> {
  if (py.flags.paralysis <= 0) {
    return;
  }

  // when paralysis true, you can not see any movement that occurs
  py.flags.paralysis--;

  await playerDisturb(1, 0);
}

// Protection from evil counter
async function playerUpdateEvilProtection(): Promise<void> {
  if (py.flags.protect_evil <= 0) {
    return;
  }

  py.flags.protect_evil--;

  if (py.flags.protect_evil === 0) {
    await printMessage('You no longer feel safe from evil.');
  }
}

async function playerUpdateInvulnerability(): Promise<void> {
  if (py.flags.invulnerability <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_INVULN) === 0) {
    py.flags.status |= config.player.status.PY_INVULN;
    await playerDisturb(0, 0);

    py.misc.ac += 100;
    py.misc.display_ac += 100;

    printCharacterCurrentArmorClass();
    await printMessage('Your skin turns into steel!');
  }

  py.flags.invulnerability--;

  if (py.flags.invulnerability === 0) {
    py.flags.status &= ~config.player.status.PY_INVULN;
    await playerDisturb(0, 0);

    py.misc.ac -= 100;
    py.misc.display_ac -= 100;

    printCharacterCurrentArmorClass();
    await printMessage('Your skin returns to normal.');
  }
}

async function playerUpdateBlessedness(): Promise<void> {
  if (py.flags.blessed <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_BLESSED) === 0) {
    py.flags.status |= config.player.status.PY_BLESSED;
    await playerDisturb(0, 0);

    py.misc.bth += 5;
    py.misc.bth_with_bows += 5;
    py.misc.ac += 2;
    py.misc.display_ac += 2;

    await printMessage('You feel righteous!');
    printCharacterCurrentArmorClass();
  }

  py.flags.blessed--;

  if (py.flags.blessed === 0) {
    py.flags.status &= ~config.player.status.PY_BLESSED;
    await playerDisturb(0, 0);

    py.misc.bth -= 5;
    py.misc.bth_with_bows -= 5;
    py.misc.ac -= 2;
    py.misc.display_ac -= 2;

    await printMessage('The prayer has expired.');
    printCharacterCurrentArmorClass();
  }
}

// Resist Heat
async function playerUpdateHeatResistance(): Promise<void> {
  if (py.flags.heat_resistance <= 0) {
    return;
  }

  py.flags.heat_resistance--;

  if (py.flags.heat_resistance === 0) {
    await printMessage('You no longer feel safe from flame.');
  }
}

async function playerUpdateColdResistance(): Promise<void> {
  if (py.flags.cold_resistance <= 0) {
    return;
  }

  py.flags.cold_resistance--;

  if (py.flags.cold_resistance === 0) {
    await printMessage('You no longer feel safe from cold.');
  }
}

async function playerUpdateDetectInvisible(): Promise<void> {
  if (py.flags.detect_invisible <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_DET_INV) === 0) {
    py.flags.status |= config.player.status.PY_DET_INV;
    py.flags.see_invisible = true;

    // light but don't move creatures
    await updateMonsters(false);
  }

  py.flags.detect_invisible--;

  if (py.flags.detect_invisible === 0) {
    py.flags.status &= ~config.player.status.PY_DET_INV;

    // may still be able to see_invisible if wearing magic item
    playerRecalculateBonuses();

    // unlight but don't move creatures
    await updateMonsters(false);
  }
}

// Timed infra-vision
async function playerUpdateInfraVision(): Promise<void> {
  if (py.flags.timed_infra <= 0) {
    return;
  }

  if ((py.flags.status & config.player.status.PY_TIM_INFRA) === 0) {
    py.flags.status |= config.player.status.PY_TIM_INFRA;
    py.flags.see_infra++;

    // light but don't move creatures
    await updateMonsters(false);
  }

  py.flags.timed_infra--;

  if (py.flags.timed_infra === 0) {
    py.flags.status &= ~config.player.status.PY_TIM_INFRA;
    py.flags.see_infra--;

    // unlight but don't move creatures
    await updateMonsters(false);
  }
}

// Word-of-Recall  Note: Word-of-Recall is a delayed action
async function playerUpdateWordOfRecall(): Promise<void> {
  if (py.flags.word_of_recall <= 0) {
    return;
  }

  if (py.flags.word_of_recall === 1) {
    dg.generate_new_level = true;

    py.flags.paralysis++;
    py.flags.word_of_recall = 0;

    if (dg.current_level > 0) {
      dg.current_level = 0;
      await printMessage('You feel yourself yanked upwards!');
    } else if (py.misc.max_dungeon_depth !== 0) {
      dg.current_level = py.misc.max_dungeon_depth;
      await printMessage('You feel yourself yanked downwards!');
    }
  } else {
    py.flags.word_of_recall--;
  }
}

function playerUpdateStatusFlags(): void {
  if ((py.flags.status & config.player.status.PY_SPEED) !== 0) {
    py.flags.status &= ~config.player.status.PY_SPEED;
    printCharacterSpeed();
  }

  if ((py.flags.status & config.player.status.PY_PARALYSED) !== 0 && py.flags.paralysis < 1) {
    printCharacterMovementState();
    py.flags.status &= ~config.player.status.PY_PARALYSED;
  } else if (py.flags.paralysis > 0) {
    printCharacterMovementState();
    py.flags.status |= config.player.status.PY_PARALYSED;
  } else if (py.flags.rest !== 0) {
    printCharacterMovementState();
  }

  if ((py.flags.status & config.player.status.PY_ARMOR) !== 0) {
    printCharacterCurrentArmorClass();
    py.flags.status &= ~config.player.status.PY_ARMOR;
  }

  if ((py.flags.status & config.player.status.PY_STATS) !== 0) {
    for (let n = 0; n < 6; n++) {
      if (((config.player.status.PY_STR << n) & py.flags.status) !== 0) {
        displayCharacterStats(n);
      }
    }

    py.flags.status &= ~config.player.status.PY_STATS;
  }

  if ((py.flags.status & config.player.status.PY_HP) !== 0) {
    printCharacterMaxHitPoints();
    printCharacterCurrentHitPoints();
    py.flags.status &= ~config.player.status.PY_HP;
  }

  if ((py.flags.status & config.player.status.PY_MANA) !== 0) {
    printCharacterCurrentMana();
    py.flags.status &= ~config.player.status.PY_MANA;
  }
}

// Allow for a slim chance of detect enchantment -CJS-
async function playerDetectEnchantment(): Promise<void> {
  for (let i = 0; i < PLAYER_INVENTORY_SIZE; i++) {
    if (i === py.pack.unique_items) {
      i = 22;
    }

    const item = py.inventory[i];

    // if in inventory, succeed 1 out of 50 times,
    // if in equipment list, success 1 out of 10 times
    const chance = i < 22 ? 50 : 10;

    if (item.category_id !== TV_NOTHING && itemEnchanted(item) && randomNumber(chance) === 1) {
      const tmp_str = sprintf('There\'s something about what you are %s...', playerItemWearingDescription(i));
      await playerDisturb(0, 0);
      await printMessage(tmp_str);
      itemAppendToInscription(item, config.identification.ID_MAGIK);
    }
  }
}

async function getCommandRepeatCount(last_input_command: Ref<string>): Promise<number> {
  await putStringClearToEOL('Repeat count:', { y: 0, x: 0 });

  if (last_input_command.v === '#') {
    last_input_command.v = '0';
  }

  let text_buffer: string;
  let repeat_count = 0;

  while (true) {
    if (last_input_command.v === DELETE || last_input_command.v === CTRL_KEY('H')) {
      repeat_count = idiv(repeat_count, 10);
      text_buffer = sprintf('%d', i16(repeat_count));
      await putStringClearToEOL(text_buffer, { y: 0, x: 14 });
    } else if (last_input_command.v >= '0' && last_input_command.v <= '9') {
      if (repeat_count > 99) {
        await terminalBellSound();
      } else {
        repeat_count = repeat_count * 10 + ord(last_input_command.v) - ord('0');
        text_buffer = sprintf('%d', repeat_count);
        await putStringClearToEOL(text_buffer, { y: 0, x: 14 });
      }
    } else {
      break;
    }
    last_input_command.v = await getKeyInput();
  }

  if (repeat_count === 0) {
    repeat_count = 99;
    text_buffer = sprintf('%d', repeat_count);
    await putStringClearToEOL(text_buffer, { y: 0, x: 14 });
  }

  // a special hack to allow numbers as commands
  if (last_input_command.v === ' ') {
    await putStringClearToEOL('Command:', { y: 0, x: 20 });
    last_input_command.v = await getKeyInput();
  }

  return repeat_count;
}

async function parseAlternateCtrlInput(last_input_command_in: string): Promise<string> {
  const last_input_command = ref(last_input_command_in);

  if (game.command_count > 0) {
    printCharacterMovementState();
  }

  if (await getCommand('Control-', last_input_command)) {
    if (last_input_command.v >= 'A' && last_input_command.v <= 'Z') {
      last_input_command.v = chr(ord(last_input_command.v) - (ord('A') - 1));
    } else if (last_input_command.v >= 'a' && last_input_command.v <= 'z') {
      last_input_command.v = chr(ord(last_input_command.v) - (ord('a') - 1));
    } else {
      last_input_command.v = ' ';
      await printMessage('Type ^ <letter> for a control char');
    }
  } else {
    last_input_command.v = ' ';
  }

  return last_input_command.v;
}

// Accept a command and execute it
async function executeInputCommands(command: Ref<string>, find_count: Ref<number>): Promise<void> {
  const last_input_command = ref(command.v);

  // Accept a command and execute it
  do {
    if ((py.flags.status & config.player.status.PY_REPEAT) !== 0) {
      printCharacterMovementState();
    }

    game.use_last_direction = false;
    game.player_free_turn = false;

    if (py.running_tracker !== 0) {
      await playerRunAndFind();
      find_count.v -= 1;

      if (find_count.v === 0) {
        playerEndRunning();
      }

      await putQIO();
      continue;
    }

    if (game.doing_inventory_command !== '\0') {
      await inventoryExecuteCommand(game.doing_inventory_command);
      continue;
    }

    // move the cursor to the players character
    panelMoveCursor(py.pos);

    globals.message_ready_to_print = false;

    if (game.command_count > 0) {
      game.use_last_direction = true;
    } else {
      last_input_command.v = await getKeyInput();

      // Get a count for a command.
      let repeat_count = 0;
      if ((config.options.use_roguelike_keys && last_input_command.v >= '0' && last_input_command.v <= '9') ||
        (!config.options.use_roguelike_keys && last_input_command.v === '#')) {
        repeat_count = await getCommandRepeatCount(last_input_command);
      }

      // Another way of typing control codes -CJS-
      if (last_input_command.v === '^') {
        last_input_command.v = await parseAlternateCtrlInput(last_input_command.v);
      }

      // move cursor to player char again, in case it moved
      panelMoveCursor(py.pos);

      // Commands are always converted to rogue form. -CJS-
      if (!config.options.use_roguelike_keys) {
        last_input_command.v = await originalCommands(last_input_command.v);
      }

      if (repeat_count > 0) {
        if (!validCountCommand(last_input_command.v)) {
          game.player_free_turn = true;
          last_input_command.v = ' ';
          await printMessage('Invalid command with a count.');
        } else {
          game.command_count = repeat_count;
          printCharacterMovementState();
        }
      }
    }

    // Flash the message line.
    messageLineClear();
    panelMoveCursor(py.pos);
    await putQIO();

    await doCommand(last_input_command.v);

    // Find is counted differently, as the command changes.
    if (py.running_tracker !== 0) {
      find_count.v = game.command_count - 1;
      game.command_count = 0;
    } else if (game.player_free_turn) {
      game.command_count = 0;
    } else if (game.command_count !== 0) {
      game.command_count--;
    }
  } while (game.player_free_turn && !dg.generate_new_level && globals.eof_flag === 0);

  command.v = last_input_command.v;
}

async function originalCommands(command: string): Promise<string> {
  const direction = ref(0);

  switch (command) {
    case CTRL_KEY('K'): // ^K = exit
      command = 'Q';
      break;
    case CTRL_KEY('J'):
    case CTRL_KEY('M'):
      command = '+';
      break;
    case CTRL_KEY('P'): // ^P = repeat
    case CTRL_KEY('W'): // ^W = password
    case CTRL_KEY('X'): // ^X = save
    case CTRL_KEY('V'): // ^V = view license
    case ' ':
    case '!':
    case '$':
      break;
    case '.':
      if (await getDirectionWithMemory(null, direction)) {
        switch (direction.v) {
          case 1:
            command = 'B';
            break;
          case 2:
            command = 'J';
            break;
          case 3:
            command = 'N';
            break;
          case 4:
            command = 'H';
            break;
          case 6:
            command = 'L';
            break;
          case 7:
            command = 'Y';
            break;
          case 8:
            command = 'K';
            break;
          case 9:
            command = 'U';
            break;
          default:
            command = ' ';
            break;
        }
      } else {
        command = ' ';
      }
      break;
    case '/':
    case '<':
    case '>':
    case '-':
    case '=':
    case '{':
    case '?':
    case 'A':
      break;
    case '1':
      command = 'b';
      break;
    case '2':
      command = 'j';
      break;
    case '3':
      command = 'n';
      break;
    case '4':
      command = 'h';
      break;
    case '5': // Rest one turn
      command = '.';
      break;
    case '6':
      command = 'l';
      break;
    case '7':
      command = 'y';
      break;
    case '8':
      command = 'k';
      break;
    case '9':
      command = 'u';
      break;
    case 'B':
      command = 'f';
      break;
    case 'C':
    case 'D':
    case 'E':
    case 'F':
    case 'G':
      break;
    case 'L':
      command = 'W';
      break;
    case 'M':
    case 'R':
      break;
    case 'S':
      command = '#';
      break;
    case 'T':
      if (await getDirectionWithMemory(null, direction)) {
        switch (direction.v) {
          case 1:
            command = CTRL_KEY('B');
            break;
          case 2:
            command = CTRL_KEY('J');
            break;
          case 3:
            command = CTRL_KEY('N');
            break;
          case 4:
            command = CTRL_KEY('H');
            break;
          case 6:
            command = CTRL_KEY('L');
            break;
          case 7:
            command = CTRL_KEY('Y');
            break;
          case 8:
            command = CTRL_KEY('K');
            break;
          case 9:
            command = CTRL_KEY('U');
            break;
          default:
            command = ' ';
            break;
        }
      } else {
        command = ' ';
      }
      break;
    case 'V':
      break;
    case 'a':
      command = 'z';
      break;
    case 'b':
      command = 'P';
      break;
    case 'c':
    case 'd':
    case 'e':
      break;
    case 'f':
      command = 't';
      break;
    case 'h':
      command = '?';
      break;
    case 'i':
      break;
    case 'j':
      command = 'S';
      break;
    case 'l':
      command = 'x';
      break;
    case 'm':
    case 'o':
    case 'p':
    case 'q':
    case 'r':
    case 's':
      break;
    case 't':
      command = 'T';
      break;
    case 'u':
      command = 'Z';
      break;
    case 'v':
    case 'w':
      break;
    case 'x':
      command = 'X';
      break;

    // wizard mode commands follow
    case CTRL_KEY('A'): // ^A = cure all
      break;
    case CTRL_KEY('B'): // ^B = objects
      command = CTRL_KEY('O');
      break;
    case CTRL_KEY('D'): // ^D = up/down
      break;
    case CTRL_KEY('H'): // ^H = wizhelp
      command = '\\';
      break;
    case CTRL_KEY('I'): // ^I = identify
      break;
    case CTRL_KEY('L'): // ^L = wizlight
      command = '*';
      break;
    case ':':
    case CTRL_KEY('T'): // ^T = teleport
    case CTRL_KEY('E'): // ^E = wizchar
    case CTRL_KEY('F'): // ^F = genocide
    case CTRL_KEY('G'): // ^G = treasure
    case '@':
    case '+':
      break;
    case CTRL_KEY('U'): // ^U = summon
      command = '&';
      break;
    default:
      command = '~'; // Anything illegal.
      break;
  }

  return command;
}

async function moveWithoutPickup(command: Ref<string>): Promise<boolean> {
  let cmd = command.v;

  // hack for move without pickup.  Map '-' to a movement command.
  if (cmd !== '-') {
    return true;
  }

  const direction = ref(0);

  // Save current game.command_count as getDirectionWithMemory() may change it
  const count_save = game.command_count;

  if (await getDirectionWithMemory(null, direction)) {
    // Restore game.command_count
    game.command_count = count_save;

    switch (direction.v) {
      case 1:
        cmd = 'b';
        break;
      case 2:
        cmd = 'j';
        break;
      case 3:
        cmd = 'n';
        break;
      case 4:
        cmd = 'h';
        break;
      case 6:
        cmd = 'l';
        break;
      case 7:
        cmd = 'y';
        break;
      case 8:
        cmd = 'k';
        break;
      case 9:
        cmd = 'u';
        break;
      default:
        cmd = '~';
        break;
    }
  } else {
    cmd = ' ';
  }

  command.v = cmd;

  return false;
}

async function commandQuit(): Promise<void> {
  flushInputBuffer();

  if (await getInputConfirmation('Do you really want to quit?')) {
    game.character_is_dead = true;
    dg.generate_new_level = true;

    game.character_died_from = 'Quitting';
  }
}

function calculateMaxMessageCount(): number {
  let max_messages = MESSAGE_HISTORY_SIZE;

  if (game.command_count > 0) {
    if (game.command_count < MESSAGE_HISTORY_SIZE) {
      max_messages = u8(game.command_count);
    }
    game.command_count = 0;
  } else if (game.last_command !== CTRL_KEY('P')) {
    max_messages = 1;
  }

  return max_messages;
}

async function commandPreviousMessage(): Promise<void> {
  let max_messages = calculateMaxMessageCount();

  if (max_messages <= 1) {
    // Distinguish real and recovered messages with a '>'. -CJS-
    putString('>', { y: 0, x: 0 });
    await putStringClearToEOL(messages[globals.last_message_id], { y: 0, x: 1 });
    return;
  }

  terminalSaveScreen();

  const line_number = max_messages;
  let msg_id = globals.last_message_id;

  while (max_messages > 0) {
    max_messages--;

    await putStringClearToEOL(messages[msg_id], { y: max_messages, x: 0 });

    if (msg_id === 0) {
      msg_id = MESSAGE_HISTORY_SIZE - 1;
    } else {
      msg_id--;
    }
  }

  await eraseLine({ y: line_number, x: 0 });
  await waitForContinueKey(line_number);
  terminalRestoreScreen();
}

async function commandFlipWizardMode(): Promise<void> {
  if (game.wizard_mode) {
    game.wizard_mode = false;
    await printMessage('Wizard mode off.');
  } else if (await enterWizardMode()) {
    await printMessage('Wizard mode on.');
  }

  printCharacterWinner();
}

async function commandSaveAndExit(): Promise<void> {
  if (game.total_winner) {
    await printMessage('You are a Total Winner,  your character must be retired.');

    if (config.options.use_roguelike_keys) {
      await printMessage("Use 'Q' to when you are ready to quit.");
    } else {
      await printMessage('Use <Control>-K when you are ready to quit.');
    }
  } else {
    game.character_died_from = '(saved)';
    await printMessage('Saving game...');

    if (await saveGame()) {
      await endGame();
    }

    game.character_died_from = '(alive and well)';
  }
}

async function commandLocateOnMap(): Promise<void> {
  if (py.flags.blind > 0 || playerNoLight()) {
    await printMessage("You can't see your map.");
    return;
  }

  const player_coord = { y: py.pos.y, x: py.pos.x };
  if (coordOutsidePanel({ y: player_coord.y, x: player_coord.x }, true)) {
    await drawDungeonPanel();
  }

  const dir_val = ref(0);
  let out_val: string;
  let tmp_str: string;

  const old_panel = { y: dg.panel.row, x: dg.panel.col };
  const panel = { y: 0, x: 0 };

  while (true) {
    panel.y = dg.panel.row;
    panel.x = dg.panel.col;

    if (panel.y === old_panel.y && panel.x === old_panel.x) {
      tmp_str = '';
    } else {
      tmp_str = sprintf(
        '%s%s of',
        panel.y < old_panel.y ? ' North' : panel.y > old_panel.y ? ' South' : '',
        panel.x < old_panel.x ? ' West' : panel.x > old_panel.x ? ' East' : '',
      );
    }

    out_val = sprintf('Map sector [%d,%d], which is%s your sector. Look which direction?', panel.y, panel.x, tmp_str);

    if (!(await getDirectionWithMemory(out_val, dir_val))) {
      break;
    }

    // -CJS-
    // Should really use the move function, but what the hell. This
    // is nicer, as it moves exactly to the same place in another
    // section. The direction calculation is not intuitive. Sorry.
    while (true) {
      player_coord.x += idiv((((dir_val.v - 1) % 3) - 1) * SCREEN_WIDTH, 2);
      player_coord.y -= idiv((idiv(dir_val.v - 1, 3) - 1) * SCREEN_HEIGHT, 2);

      if (player_coord.x < 0 || player_coord.y < 0 || player_coord.x >= dg.width || player_coord.y >= dg.width) {
        await printMessage("You've gone past the end of your map.");

        player_coord.x -= idiv((((dir_val.v - 1) % 3) - 1) * SCREEN_WIDTH, 2);
        player_coord.y += idiv((idiv(dir_val.v - 1, 3) - 1) * SCREEN_HEIGHT, 2);

        break;
      }

      if (coordOutsidePanel({ y: player_coord.y, x: player_coord.x }, true)) {
        await drawDungeonPanel();
        break;
      }
    }
  }

  // Move to a new panel - but only if really necessary.
  if (coordOutsidePanel({ y: py.pos.y, x: py.pos.x }, false)) {
    await drawDungeonPanel();
  }
}

async function commandToggleSearch(): Promise<void> {
  if ((py.flags.status & config.player.status.PY_SEARCH) !== 0) {
    await playerSearchOff();
  } else {
    playerSearchOn();
  }
}

async function doWizardCommands(command: string): Promise<void> {
  switch (command) {
    case CTRL_KEY('A'):
      // Cure all!
      await wizardCureAll();
      break;
    case CTRL_KEY('E'):
      // Edit Character
      await wizardCharacterAdjustment();
      messageLineClear();
      break;
    case CTRL_KEY('F'):
      // Mass Genocide, vanquish all monsters
      spellMassGenocide();
      break;
    case CTRL_KEY('G'):
      // Generate random items
      await wizardDropRandomItems();
      break;
    case CTRL_KEY('D'):
      // Go up/down to specified depth
      await wizardJumpLevel();
      break;
    case CTRL_KEY('O'):
      // Print random level object to a file
      await outputRandomLevelObjectsToFile();
      break;
    case '\\':
      // Display wizard help
      if (config.options.use_roguelike_keys) {
        await displayTextHelpFile(config.files.help_roguelike_wizard);
      } else {
        await displayTextHelpFile(config.files.help_wizard);
      }
      break;
    case CTRL_KEY('I'):
      // Identify an item
      await spellIdentifyItem();
      break;
    case '*':
      // Light up entire dungeon
      await wizardLightUpDungeon();
      break;
    case ':':
      // Light up current panel
      await spellMapCurrentArea();
      break;
    case CTRL_KEY('T'):
      // Random player teleportation
      await playerTeleport(100);
      break;
    case '%':
      // Generate a dungeon item!
      await wizardGenerateObject();
      await drawDungeonPanel();
      break;
    case '+':
      // Increase Experience
      await wizardGainExperience();
      break;
    case '&':
      // Summon a random monster
      await wizardSummonMonster();
      break;
    case '@':
      // Generate an object
      // NOTE: every field from the struct needs to be filled correctly
      await wizardCreateObjects();
      break;
    default:
      if (config.options.use_roguelike_keys) {
        await putStringClearToEOL("Type '?' or '\\' for help.", { y: 0, x: 0 });
      } else {
        await putStringClearToEOL("Type '?' or ^H for help.", { y: 0, x: 0 });
      }
  }
}

// TODO: use only commands here - don't just call the external functions.
// TODO: E.g. split playerEat() into command/action functions: commandEat(), playerEat().
// Possibly the "setup" happens in the command, such as the food check/selection of playerEat().
// The command then calls playerEat() in player_eat.cpp - passing the selected food `item_id`.
async function doCommand(command_in: string): Promise<void> {
  const command = ref(command_in);
  const do_pickup = await moveWithoutPickup(command);

  switch (command.v) {
    case 'Q': // (Q)uit    (^K)ill
      await commandQuit();
      game.player_free_turn = true;
      break;
    case CTRL_KEY('P'): // (^P)revious message.
      await commandPreviousMessage();
      game.player_free_turn = true;
      break;
    case CTRL_KEY('V'): // (^V)iew license
      await displayTextHelpFile(config.files.license);
      game.player_free_turn = true;
      break;
    case CTRL_KEY('W'): // (^W)izard mode
      await commandFlipWizardMode();
      game.player_free_turn = true;
      break;
    case CTRL_KEY('X'): // e(^X)it and save
      await commandSaveAndExit();
      game.player_free_turn = true;
      break;
    case '=': // (=) set options
      terminalSaveScreen();
      await setGameOptions();
      terminalRestoreScreen();
      game.player_free_turn = true;
      break;
    case '{': // ({) inscribe an object
      await itemInscribe();
      game.player_free_turn = true;
      break;
    case '!': // (!) escape to the shell
    case '$': // escaping to shell disabled -MRC-
    case ESCAPE: // (ESC)   do nothing.
    case ' ': // (space) do nothing.
      game.player_free_turn = true;
      break;
    case 'b': // (b) down, left  (1)
      await playerMove(1, do_pickup);
      break;
    case 'j': // (j) down    (2)
      await playerMove(2, do_pickup);
      break;
    case 'n': // (n) down, right  (3)
      await playerMove(3, do_pickup);
      break;
    case 'h': // (h) left    (4)
      await playerMove(4, do_pickup);
      break;
    case 'l': // (l) right    (6)
      await playerMove(6, do_pickup);
      break;
    case 'y': // (y) up, left    (7)
      await playerMove(7, do_pickup);
      break;
    case 'k': // (k) up    (8)
      await playerMove(8, do_pickup);
      break;
    case 'u': // (u) up, right  (9)
      await playerMove(9, do_pickup);
      break;
    case 'B': // (B) run down, left  (. 1)
      await playerFindInitialize(1);
      break;
    case 'J': // (J) run down    (. 2)
      await playerFindInitialize(2);
      break;
    case 'N': // (N) run down, right  (. 3)
      await playerFindInitialize(3);
      break;
    case 'H': // (H) run left    (. 4)
      await playerFindInitialize(4);
      break;
    case 'L': // (L) run right  (. 6)
      await playerFindInitialize(6);
      break;
    case 'Y': // (Y) run up, left  (. 7)
      await playerFindInitialize(7);
      break;
    case 'K': // (K) run up    (. 8)
      await playerFindInitialize(8);
      break;
    case 'U': // (U) run up, right  (. 9)
      await playerFindInitialize(9);
      break;
    case '/': // (/) identify a symbol
      await identifyGameObject();
      game.player_free_turn = true;
      break;
    case '.': // (.) stay in one place (5)
      await playerMove(5, do_pickup);

      if (game.command_count > 1) {
        game.command_count--;
        await playerRestOn();
      }
      break;
    case '<': // (<) go down a staircase
      await dungeonGoUpLevel();
      break;
    case '>': // (>) go up a staircase
      await dungeonGoDownLevel();
      break;
    case '?': // (?) help with commands
      if (config.options.use_roguelike_keys) {
        await displayTextHelpFile(config.files.help_roguelike);
      } else {
        await displayTextHelpFile(config.files.help);
      }
      game.player_free_turn = true;
      break;
    case 'f': // (f)orce    (B)ash
      await playerBash();
      break;
    case 'C': // (C)haracter description
      terminalSaveScreen();
      await changeCharacterName();
      terminalRestoreScreen();
      game.player_free_turn = true;
      break;
    case 'D': // (D)isarm trap
      await playerDisarmTrap();
      break;
    case 'E': // (E)at food
      await playerEat();
      break;
    case 'F': // (F)ill lamp
      await inventoryRefillLamp();
      break;
    case 'G': // (G)ain magic spells
      await playerGainSpells();
      break;
    case 'V': // (V)iew scores
      terminalSaveScreen();
      await showScoresScreen();
      terminalRestoreScreen();
      game.player_free_turn = true;
      break;
    case 'W': // (W)here are we on the map  (L)ocate on map
      await commandLocateOnMap();
      game.player_free_turn = true;
      break;
    case 'R': // (R)est a while
      await playerRestOn();
      break;
    case '#': // (#) search toggle  (S)earch toggle
      await commandToggleSearch();
      game.player_free_turn = true;
      break;
    case CTRL_KEY('B'): // (^B) tunnel down left  (T 1)
      await playerTunnel(1);
      break;
    case CTRL_KEY('M'): // cr must be treated same as lf.
    case CTRL_KEY('J'): // (^J) tunnel down    (T 2)
      await playerTunnel(2);
      break;
    case CTRL_KEY('N'): // (^N) tunnel down right  (T 3)
      await playerTunnel(3);
      break;
    case CTRL_KEY('H'): // (^H) tunnel left    (T 4)
      await playerTunnel(4);
      break;
    case CTRL_KEY('L'): // (^L) tunnel right    (T 6)
      await playerTunnel(6);
      break;
    case CTRL_KEY('Y'): // (^Y) tunnel up left    (T 7)
      await playerTunnel(7);
      break;
    case CTRL_KEY('K'): // (^K) tunnel up    (T 8)
      await playerTunnel(8);
      break;
    case CTRL_KEY('U'): // (^U) tunnel up right    (T 9)
      await playerTunnel(9);
      break;
    case 'z': // (z)ap a wand    (a)im a wand
      await wandAim();
      break;
    case 'M':
      await dungeonDisplayMap();
      game.player_free_turn = true;
      break;
    case 'P': // (P)eruse a book  (B)rowse in a book
      await examineBook();
      game.player_free_turn = true;
      break;
    case 'c': // (c)lose an object
      await playerCloseDoor();
      break;
    case 'd': // (d)rop something
      await inventoryExecuteCommand('d');
      break;
    case 'e': // (e)quipment list
      await inventoryExecuteCommand('e');
      break;
    case 't': // (t)hrow something  (f)ire something
      await playerThrowItem();
      break;
    case 'i': // (i)nventory list
      await inventoryExecuteCommand('i');
      break;
    case 'S': // (S)pike a door  (j)am a door
      await dungeonJamDoor();
      break;
    case 'x': // e(x)amine surrounds  (l)ook about
      await look();
      game.player_free_turn = true;
      break;
    case 'm': // (m)agic spells
      await getAndCastMagicSpell();
      break;
    case 'o': // (o)pen something
      await playerOpenClosedObject();
      break;
    case 'p': // (p)ray
      await pray();
      break;
    case 'q': // (q)uaff
      await quaff();
      break;
    case 'r': // (r)ead
      await scrollRead();
      break;
    case 's': // (s)earch for a turn
      await playerSearch({ y: py.pos.y, x: py.pos.x }, py.misc.chance_in_search);
      break;
    case 'T': // (T)ake off something  (t)ake off
      await inventoryExecuteCommand('t');
      break;
    case 'Z': // (Z)ap a staff  (u)se a staff
      await staffUse();
      break;
    case 'v': // (v)ersion of game
      await displayTextHelpFile(config.files.versions_history);
      game.player_free_turn = true;
      break;
    case 'w': // (w)ear or wield
      await inventoryExecuteCommand('w');
      break;
    case 'X': // e(X)change weapons  e(x)change
      await inventoryExecuteCommand('x');
      break;
    default:
      // Wizard commands are free moves
      game.player_free_turn = true;

      if (game.wizard_mode) {
        await doWizardCommands(command.v);
      } else {
        await putStringClearToEOL("Type '?' for help.", { y: 0, x: 0 });
      }
  }
  game.last_command = command.v;
}

// Check whether this command will accept a count. -CJS-
function validCountCommand(command: string): boolean {
  switch (command) {
    case 'Q':
    case CTRL_KEY('W'):
    case CTRL_KEY('X'):
    case '=':
    case '{':
    case '/':
    case '<':
    case '>':
    case '?':
    case 'C':
    case 'E':
    case 'F':
    case 'G':
    case 'V':
    case '#':
    case 'z':
    case 'P':
    case 'c':
    case 'd':
    case 'e':
    case 't':
    case 'i':
    case 'x':
    case 'm':
    case 'p':
    case 'q':
    case 'r':
    case 'T':
    case 'Z':
    case 'v':
    case 'w':
    case 'W':
    case 'X':
    case CTRL_KEY('A'):
    case '\\':
    case CTRL_KEY('I'):
    case '*':
    case ':':
    case CTRL_KEY('T'):
    case CTRL_KEY('E'):
    case CTRL_KEY('F'):
    case CTRL_KEY('S'):
    case CTRL_KEY('Q'):
      return false;
    case CTRL_KEY('P'):
    case ESCAPE:
    case ' ':
    case '-':
    case 'b':
    case 'f':
    case 'j':
    case 'n':
    case 'h':
    case 'l':
    case 'y':
    case 'k':
    case 'u':
    case '.':
    case 'B':
    case 'J':
    case 'N':
    case 'H':
    case 'L':
    case 'Y':
    case 'K':
    case 'U':
    case 'D':
    case 'R':
    case CTRL_KEY('Y'):
    case CTRL_KEY('K'):
    case CTRL_KEY('U'):
    case CTRL_KEY('L'):
    case CTRL_KEY('N'):
    case CTRL_KEY('J'):
    case CTRL_KEY('B'):
    case CTRL_KEY('H'):
    case 'S':
    case 'o':
    case 's':
    case CTRL_KEY('D'):
    case CTRL_KEY('G'):
    case '+':
      return true;
    default:
      return false;
  }
}

// Regenerate hit points -RAK-
function playerRegenerateHitPoints(percent: number): void {
  const old_chp = py.misc.current_hp;
  const new_chp = i32(py.misc.max_hp * percent + config.player.PLAYER_REGEN_HPBASE);

  // div 65536
  py.misc.current_hp += new_chp >> 16;

  // check for overflow
  if (py.misc.current_hp < 0 && old_chp > 0) {
    py.misc.current_hp = SHRT_MAX;
  }

  // mod 65536
  const new_chp_fraction = (new_chp & 0xffff) + py.misc.current_hp_fraction;

  if (new_chp_fraction >= 0x10000) {
    py.misc.current_hp_fraction = u16(new_chp_fraction - 0x10000);
    py.misc.current_hp++;
  } else {
    py.misc.current_hp_fraction = u16(new_chp_fraction);
  }

  // must set frac to zero even if equal
  if (py.misc.current_hp >= py.misc.max_hp) {
    py.misc.current_hp = py.misc.max_hp;
    py.misc.current_hp_fraction = 0;
  }

  if (old_chp !== py.misc.current_hp) {
    printCharacterCurrentHitPoints();
  }
}

// Regenerate mana points -RAK-
function playerRegenerateMana(percent: number): void {
  const old_cmana = py.misc.current_mana;
  const new_mana = i32(py.misc.mana * percent + config.player.PLAYER_REGEN_MNBASE);

  // div 65536
  py.misc.current_mana += new_mana >> 16;

  // check for overflow
  if (py.misc.current_mana < 0 && old_cmana > 0) {
    py.misc.current_mana = SHRT_MAX;
  }

  // mod 65536
  const new_mana_fraction = (new_mana & 0xffff) + py.misc.current_mana_fraction;

  if (new_mana_fraction >= 0x10000) {
    py.misc.current_mana_fraction = u16(new_mana_fraction - 0x10000);
    py.misc.current_mana++;
  } else {
    py.misc.current_mana_fraction = u16(new_mana_fraction);
  }

  // must set frac to zero even if equal
  if (py.misc.current_mana >= py.misc.mana) {
    py.misc.current_mana = py.misc.mana;
    py.misc.current_mana_fraction = 0;
  }

  if (old_cmana !== py.misc.current_mana) {
    printCharacterCurrentMana();
  }
}

// Is an item an enchanted weapon or armor and we don't know? -CJS-
// only returns true if it is a good enchantment
function itemEnchanted(item: Inventory_t): boolean {
  if (item.category_id < TV_MIN_ENCHANT || item.category_id > TV_MAX_ENCHANT || inventoryItemIsCursed(item)) {
    return false;
  }

  if (spellItemIdentified(item)) {
    return false;
  }

  if ((item.identification & config.identification.ID_MAGIK) !== 0) {
    return false;
  }

  if (item.to_hit > 0 || item.to_damage > 0 || item.to_ac > 0) {
    return true;
  }

  if ((0x4000107f & item.flags) !== 0 && item.misc_use > 0) {
    return true;
  }

  return (0x07ffe980 & item.flags) !== 0;
}

// Examine a Book -RAK-
async function examineBook(): Promise<void> {
  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!inventoryFindRange(TV_MAGIC_BOOK, TV_PRAYER_BOOK, item_pos_start, item_pos_end)) {
    await printMessage('You are not carrying any books.');
    return;
  }

  if (py.flags.blind > 0) {
    await printMessage("You can't see to read your spell book!");
    return;
  }

  if (playerNoLight()) {
    await printMessage('You have no light to read by.');
    return;
  }

  if (py.flags.confused > 0) {
    await printMessage('You are too confused.');
    return;
  }

  const item_id = ref(0);
  if (await inventoryGetInputForItemId(item_id, 'Which Book?', item_pos_start.v, item_pos_end.v, null, null)) {
    const spell_index = new Array<number>(31).fill(0);
    let can_read = true;

    const treasure_type = py.inventory[item_id.v].category_id;

    if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_MAGE) {
      if (treasure_type !== TV_MAGIC_BOOK) {
        can_read = false;
      }
    } else if (classes[py.misc.class_id].class_to_use_mage_spells === config.spells.SPELL_TYPE_PRIEST) {
      if (treasure_type !== TV_PRAYER_BOOK) {
        can_read = false;
      }
    } else {
      can_read = false;
    }

    if (!can_read) {
      await printMessage('You do not understand the language.');
      return;
    }

    const item_flags = ref(py.inventory[item_id.v].flags);

    let spell_id = 0;
    while (item_flags.v !== 0) {
      item_pos_end.v = getAndClearFirstBit(item_flags);

      if (magic_spells[py.misc.class_id - 1][item_pos_end.v].level_required < 99) {
        spell_index[spell_id] = item_pos_end.v;
        spell_id++;
      }
    }

    terminalSaveScreen();
    await displaySpellsList(spell_index, spell_id, true, -1);
    await waitForContinueKey(0);
    terminalRestoreScreen();
  }
}

// Go up one level -RAK-
async function dungeonGoUpLevel(): Promise<void> {
  const tile_id = u8(dg.floor[py.pos.y][py.pos.x].treasure_id);

  if (tile_id !== 0 && game.treasure.list[tile_id].category_id === TV_UP_STAIR) {
    dg.current_level--;

    await printMessage('You enter a maze of up staircases.');
    await printMessage('You pass through a one-way door.');

    dg.generate_new_level = true;
  } else {
    await printMessage('I see no up staircase here.');
    game.player_free_turn = true;
  }
}

// Go down one level -RAK-
async function dungeonGoDownLevel(): Promise<void> {
  const tile_id = u8(dg.floor[py.pos.y][py.pos.x].treasure_id);

  if (tile_id !== 0 && game.treasure.list[tile_id].category_id === TV_DOWN_STAIR) {
    dg.current_level++;

    await printMessage('You enter a maze of down staircases.');
    await printMessage('You pass through a one-way door.');

    dg.generate_new_level = true;
  } else {
    await printMessage('I see no down staircase here.');
    game.player_free_turn = true;
  }
}

// Jam a closed door -RAK-
async function dungeonJamDoor(): Promise<void> {
  game.player_free_turn = true;

  const coord = { y: py.pos.y, x: py.pos.x };

  const direction = ref(0);
  if (!(await getDirectionWithMemory(null, direction))) {
    return;
  }
  playerMovePosition(direction.v, coord);

  const tile = dg.floor[coord.y][coord.x];

  if (tile.treasure_id === 0) {
    await printMessage("That isn't a door!");
    return;
  }

  const item = game.treasure.list[tile.treasure_id];

  const item_id = item.category_id;
  if (item_id !== TV_CLOSED_DOOR && item_id !== TV_OPEN_DOOR) {
    await printMessage("That isn't a door!");
    return;
  }

  if (item_id === TV_OPEN_DOOR) {
    await printMessage('The door must be closed first.');
    return;
  }

  // If we reach here, the door is closed and we can try to jam it -MRC-

  if (tile.creature_id === 0) {
    const item_pos_start = ref(0);
    const item_pos_end = ref(0);
    if (inventoryFindRange(TV_SPIKE, TV_NEVER, item_pos_start, item_pos_end)) {
      game.player_free_turn = false;

      await printMessageNoCommandInterrupt('You jam the door with a spike.');

      if (item.misc_use > 0) {
        // Make locked to stuck.
        item.misc_use = -item.misc_use;
      }

      // Successive spikes have a progressively smaller effect.
      // Series is: 0 20 30 37 43 48 52 56 60 64 67 70 ...
      item.misc_use -= 1 + idiv(190, 10 - item.misc_use);

      if (py.inventory[item_pos_start.v].items_count > 1) {
        py.inventory[item_pos_start.v].items_count--;
        py.pack.weight -= py.inventory[item_pos_start.v].weight;
      } else {
        inventoryDestroyItem(item_pos_start.v);
      }
    } else {
      await printMessage('But you have no spikes.');
    }
  } else {
    game.player_free_turn = false;

    const msg = sprintf('The %s is in your way!', creatures_list[monsters[tile.creature_id].creature_id].name);
    await printMessage(msg);
  }
}

// Refill the players lamp -RAK-
async function inventoryRefillLamp(): Promise<void> {
  game.player_free_turn = true;

  if (py.inventory[PlayerEquipment.Light].sub_category_id !== 0) {
    await printMessage('But you are not using a lamp.');
    return;
  }

  const item_pos_start = ref(0);
  const item_pos_end = ref(0);
  if (!inventoryFindRange(TV_FLASK, TV_NEVER, item_pos_start, item_pos_end)) {
    await printMessage('You have no oil.');
    return;
  }

  game.player_free_turn = false;

  const item = py.inventory[PlayerEquipment.Light];
  item.misc_use += py.inventory[item_pos_start.v].misc_use;

  if (item.misc_use > config.treasure.OBJECT_LAMP_MAX_CAPACITY) {
    item.misc_use = config.treasure.OBJECT_LAMP_MAX_CAPACITY;
    await printMessage('Your lamp overflows, spilling oil on the ground.');
    await printMessage('Your lamp is full.');
  } else if (item.misc_use > idiv(config.treasure.OBJECT_LAMP_MAX_CAPACITY, 2)) {
    await printMessage('Your lamp is more than half full.');
  } else if (item.misc_use === idiv(config.treasure.OBJECT_LAMP_MAX_CAPACITY, 2)) {
    await printMessage('Your lamp is half full.');
  } else {
    await printMessage('Your lamp is less than half full.');
  }

  await itemTypeRemainingCountDescription(item_pos_start.v);
  inventoryDestroyItem(item_pos_start.v);
}

// Main procedure for dungeon. -RAK-
async function playDungeon(): Promise<void> {
  // Note: There is a lot of preliminary magic going on here at first
  playerInitializePlayerLight();
  playerUpdateMaxDungeonDepth();
  resetDungeonFlags();

  // Initialize find counter to `0`
  const find_count = ref(0);

  // Ensure we display the panel. Used to do this with a global var. -CJS-
  dg.panel.col = -1;
  dg.panel.row = dg.panel.col;

  // Light up the area around character
  await dungeonResetView();

  // must do this after `dg.panel.row` / `dg.panel.col` set to -1, because playerSearchOff() will
  // call dungeonResetView(), and so the panel_* variables must be valid before
  // playerSearchOff() is called
  if ((py.flags.status & config.player.status.PY_SEARCH) !== 0) {
    await playerSearchOff();
  }

  // Light,  but do not move critters
  await updateMonsters(false);

  // Print the depth
  await printCharacterCurrentDepth();

  // Note: yes, this last input command needs to be persisted
  // over different iterations of the main loop below -MRC-
  const last_input_command = ref('\0');

  // Loop until dead,  or new level
  // Exit when `dg.generate_new_level` and `eof_flag` are both set
  do {
    // Increment turn counter
    dg.game_turn++;

    // turn over the store contents every, say, 1000 turns
    if (dg.current_level !== 0 && dg.game_turn % 1000 === 0) {
      await storeMaintenance();
    }

    // Check for creature generation
    if (randomNumber(config.monsters.MON_CHANCE_OF_NEW) === 1) {
      await monsterPlaceNewWithinDistance(1, config.monsters.MON_MAX_SIGHT, false);
    }

    await playerUpdateLightStatus();

    //
    // Update counters and messages
    //

    // Heroism and Super Heroism must precede anything that can damage player
    await playerUpdateHeroStatus();

    const regen_amount = await playerFoodConsumption();
    playerUpdateRegeneration(regen_amount);

    await playerUpdateBlindness();
    await playerUpdateConfusion();
    await playerUpdateFearState();
    await playerUpdatePoisonedState();
    await playerUpdateSpeed();
    await playerUpdateRestingState();

    // Check for interrupts to find or rest.
    const microseconds = py.running_tracker !== 0 ? 0 : 10000;
    if ((game.command_count > 0 || py.running_tracker !== 0 || py.flags.rest !== 0) && checkForNonBlockingKeyPress(microseconds)) {
      await playerDisturb(0, 0);
    }

    await playerUpdateHallucination();
    await playerUpdateParalysis();
    await playerUpdateEvilProtection();
    await playerUpdateInvulnerability();
    await playerUpdateBlessedness();
    await playerUpdateHeatResistance();
    await playerUpdateColdResistance();
    await playerUpdateDetectInvisible();
    await playerUpdateInfraVision();
    await playerUpdateWordOfRecall();

    // Random teleportation
    if (py.flags.teleport && randomNumber(100) === 1) {
      await playerDisturb(0, 0);
      await playerTeleport(40);
    }

    // See if we are too weak to handle the weapon or pack. -CJS-
    if ((py.flags.status & config.player.status.PY_STR_WGT) !== 0) {
      await playerStrength();
    }

    if ((py.flags.status & config.player.status.PY_STUDY) !== 0) {
      printCharacterStudyInstruction();
    }

    playerUpdateStatusFlags();

    // Allow for a slim chance of detect enchantment -CJS-
    // for 1st level char, check once every 2160 turns
    // for 40th level char, check once every 416 turns
    const chance = 10 + idiv(750, 5 + py.misc.level);
    if ((dg.game_turn & 0xf) === 0 && py.flags.confused === 0 && randomNumber(chance) === 1) {
      await playerDetectEnchantment();
    }

    // Check the state of the monster list, and delete some monsters if
    // the monster list is nearly full.  This helps to avoid problems in
    // creature.c when monsters try to multiply.  Compact_monsters() is
    // much more likely to succeed if called from here, than if called
    // from within updateMonsters().
    if (MON_TOTAL_ALLOCATIONS - globals.next_free_monster_id < 10) {
      await compactMonsters();
    }

    // Accept a command?
    if (py.flags.paralysis < 1 && py.flags.rest === 0 && !game.character_is_dead) {
      await executeInputCommands(last_input_command, find_count);
    } else {
      // if paralyzed, resting, or dead, flush output
      // but first move the cursor onto the player, for aesthetics
      panelMoveCursor(py.pos);
      await putQIO();
    }

    // Teleport?
    if (game.teleport_player) {
      await playerTeleport(100);
    }

    // Move the creatures
    if (!dg.generate_new_level) {
      await updateMonsters(true);
    }
  } while (!dg.generate_new_level && globals.eof_flag === 0);
}
