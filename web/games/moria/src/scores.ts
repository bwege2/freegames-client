// scores.cpp: Handle reading, writing, and displaying of high scores.
//
// The score file is the platform's (platform().scores): in the browser the server's score table
// shared by every player (index.ts), in the tests the original's scores.dat (scorefile.ts). What
// recordNewHighScore() enters and how showScoresScreen() shows it is the original's.
import { ESCAPE } from './constants.ts';
import { character_races, classes } from './data_player.ts';
import { dg, game, globals, py } from './globals.ts';
import { cstr, isspace, ord, sprintf } from './libc.ts';
import { platform } from './platform.ts';
import { playerIsMale } from './player.ts';
import { storeItemValue } from './store_inventory.ts';
import { HighScore_t } from './structs.ts';
import { clearScreen, eraseLine, getKeyInput, printMessage, putStringClearToEOL } from './ui_io.ts';

function highScoreGenderLabel(): number {
  if (playerIsMale()) {
    return ord('M');
  }
  return ord('F');
}

/** The died-from text as recordNewHighScore() copies it: without a leading "a " or "an ". */
export function scoreDiedFrom(died_from: string): string {
  let tmp = cstr(died_from);
  let i = 0;
  if (tmp[0] === 'a') {
    if (tmp[++i] === 'n') {
      i++;
    }
    while (i < tmp.length && isspace(tmp[i])) {
      i++;
    }
  } else {
    i = 0;
  }
  tmp = tmp.slice(i);
  return tmp;
}

// Enters a players name on the top twenty list -JWT-
export async function recordNewHighScore(): Promise<void> {
  await clearScreen();

  if (game.noscore !== 0) {
    return;
  }

  if (globals.panic_save) {
    await printMessage('Sorry, scores for games restored from panic save files are not saved.');
    return;
  }

  const new_entry = new HighScore_t();
  new_entry.points = playerCalculateTotalPoints();
  new_entry.birth_date = py.misc.date_of_birth;
  new_entry.uid = 0; // NOTE: do we not want to use `getuid()`? -MRC-
  new_entry.mhp = py.misc.max_hp;
  new_entry.chp = py.misc.current_hp;
  new_entry.dungeon_depth = dg.current_level;
  new_entry.level = py.misc.level;
  new_entry.deepest_dungeon_depth = py.misc.max_dungeon_depth;
  new_entry.gender = highScoreGenderLabel();
  new_entry.race = py.misc.race_id;
  new_entry.character_class = py.misc.class_id;
  new_entry.name = py.misc.name;

  // strcpy into char died_from[25]: the record keeps 25 bytes
  new_entry.died_from = scoreDiedFrom(game.character_died_from).slice(0, 25);

  const error = await platform().scores.record(new_entry);
  if (error !== null) {
    await printMessage(error);
    await printMessage(null);
  }
}

export async function showScoresScreen(): Promise<void> {
  const scores = await platform().scores.read();
  if (typeof scores === 'string') {
    await printMessage(scores);
    await printMessage(null);
    return;
  }

  let n = 0;
  const eof = (): boolean => n >= scores.length;

  let i = 0;
  let rank = 1;

  while (!eof()) {
    i = 1;
    await clearScreen();
    // Put twenty scores on each page, on lines 2 through 21.
    while (!eof() && i < 21) {
      const score = scores[n];
      const msg = sprintf('%-4d%8d %-19.19s %c %-10.10s %-7.7s%3d %-22.22s',
        rank,
        score.points,
        cstr(score.name),
        score.gender,
        character_races[score.race]?.name ?? '',
        classes[score.character_class]?.title ?? '',
        score.level,
        cstr(score.died_from));
      i++;
      await putStringClearToEOL(msg, { y: i, x: 0 });
      rank++;
      n++;
    }
    await putStringClearToEOL('Rank  Points Name              Sex Race       Class  Lvl Killed By', { y: 0, x: 0 });
    await eraseLine({ y: 1, x: 0 });
    await putStringClearToEOL('[ press any key to continue ]', { y: 23, x: 23 });
    if ((await getKeyInput()) === ESCAPE) {
      break;
    }
  }
}

// Calculates the total number of points earned -JWT-
export function playerCalculateTotalPoints(): number {
  let total = py.misc.max_exp + 100 * py.misc.max_dungeon_depth;
  total += Math.trunc(py.misc.au / 100);

  for (const item of py.inventory) {
    total += storeItemValue(item);
  }

  total += dg.current_level * 50;

  // Don't ever let the score decrease from one save to the next.
  if (py.max_score > total) {
    return py.max_score;
  }

  return total | 0;
}
