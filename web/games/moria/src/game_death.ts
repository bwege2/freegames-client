// game_death.cpp: Code executed when player dies
import { config } from './config.ts';
import { ESCAPE, PLAYER_MAX_LEVEL } from './constants.ts';
import { classes } from './data_player.ts';
import { exitProgram } from './game.ts';
import { displayDeathFile, outputPlayerCharacterToFile } from './game_files.ts';
import { saveGame } from './game_save.ts';
import { dg, game, py } from './globals.ts';
import { humanDateString } from './helpers.ts';
import { itemSetAsIdentified, spellItemIdentifyAndRemoveRandomInscription } from './identification.ts';
import { idiv, ref, to_string } from './libc.ts';
import { playerIsMale, playerRankTitle, playerRecalculateBonuses } from './player.ts';
import { recordNewHighScore, showScoresScreen } from './scores.ts';
import { spellRestorePlayerLevels } from './spells.ts';
import { printCharacter } from './ui.ts';
import { displayEquipment, displayInventoryItems } from './ui_inventory.ts';
import {
  clearScreen, clearToBottom, eraseLine, flushInputBuffer, getKeyInput, getStringInput, printMessage, putString, waitForContinueKey,
} from './ui_io.ts';

/** (int) (26 - text.length() / 2): size_t arithmetic, then converted to int */
function centered(text: string): number {
  return ((26 - idiv(text.length, 2)) >>> 0) | 0;
}

// Prints the gravestone of the character -RAK-
async function printTomb(): Promise<void> {
  await displayDeathFile(config.files.death_tomb);

  let text: string;

  text = py.misc.name;
  putString(text, { y: 6, x: centered(text) });

  if (!game.total_winner) {
    text = playerRankTitle();
  } else {
    text = 'Magnificent';
  }
  putString(text, { y: 8, x: centered(text) });

  if (!game.total_winner) {
    text = classes[py.misc.class_id].title;
  } else if (playerIsMale()) {
    text = '*King*';
  } else {
    text = '*Queen*';
  }
  putString(text, { y: 10, x: centered(text) });

  text = to_string(py.misc.level);
  putString(text, { y: 11, x: 30 });

  text = to_string(py.misc.exp) + ' Exp';
  putString(text, { y: 12, x: centered(text) });

  text = to_string(py.misc.au) + ' Au';
  putString(text, { y: 13, x: centered(text) });

  text = to_string(dg.current_level);
  putString(text, { y: 14, x: 34 });

  text = game.character_died_from;
  putString(text, { y: 16, x: centered(text) });

  const day = ref('');
  humanDateString(day);
  text = day.v;
  putString(text, { y: 17, x: centered(text) });

  retry: for (;;) {
    flushInputBuffer();

    putString('(ESC to abort, return to print on screen, or file name)', { y: 23, x: 0 });
    putString('Character record?', { y: 22, x: 0 });

    const str = ref('');
    if (await getStringInput(str, { y: 22, x: 18 }, 60)) {
      for (const item of py.inventory) {
        itemSetAsIdentified(item.category_id, item.sub_category_id);
        spellItemIdentifyAndRemoveRandomInscription(item);
      }

      playerRecalculateBonuses();

      if (str.v.length !== 0) {
        if (!(await outputPlayerCharacterToFile(str.v))) {
          continue retry;
        }
      } else {
        await clearScreen();
        await printCharacter();
        putString('Type ESC to skip the inventory:', { y: 23, x: 0 });
        if ((await getKeyInput()) !== ESCAPE) {
          await clearScreen();
          await printMessage('You are using:');
          await displayEquipment(true, 0);
          await printMessage(null);
          await printMessage('You are carrying:');
          clearToBottom(1);
          await displayInventoryItems(0, py.pack.unique_items - 1, true, 0, null);
          await printMessage(null);
        }
      }
    }
    break;
  }
}

// Let the player know they did good.
async function printCrown(): Promise<void> {
  await displayDeathFile(config.files.death_royal);
  if (playerIsMale()) {
    putString('King!', { y: 17, x: 45 });
  } else {
    putString('Queen!', { y: 17, x: 45 });
  }
  flushInputBuffer();
  await waitForContinueKey(23);
}

// Change the player into a King! -RAK-
async function kingly(): Promise<void> {
  // Change the character attributes.
  dg.current_level = 0;
  game.character_died_from = 'Ripe Old Age';

  await spellRestorePlayerLevels();

  py.misc.level += PLAYER_MAX_LEVEL;
  py.misc.au += 250000;
  py.misc.max_exp += 5000000;
  py.misc.exp = py.misc.max_exp;

  await printCrown();
}

// What happens upon dying -RAK-
// Handles the gravestone and top-twenty routines -RAK-
export async function endGame(): Promise<void> {
  await printMessage(null);

  // flush all input
  flushInputBuffer();

  // If the game has been saved, then save sets turn back to -1,
  // which inhibits the printing of the tomb.
  if (dg.game_turn >= 0) {
    if (game.total_winner) {
      await kingly();
    }
    await printTomb();
  }

  // Save the memory at least.
  if (game.character_generated && !game.character_saved) {
    await saveGame();
  }

  // add score to score file if applicable
  if (game.character_generated) {
    // Clear `game.character_saved`, strange thing to do, but it prevents
    // getKeyInput() from recursively calling endGame() when there has
    // been an eof on stdin detected.
    game.character_saved = false;
    await recordNewHighScore();
    await showScoresScreen();
  }
  await eraseLine({ y: 23, x: 0 });

  await exitProgram();
}
