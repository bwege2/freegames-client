// The original's score file, scores.dat in the working directory, as scores.cpp reads and writes it
// (recordNewHighScore's insertion, the version bytes, the records of game_save.cpp's
// saveHighScore/readHighScore). The tests use it, so that the file can be compared byte for byte with
// the one the original writes; in the browser the score file is the server's table (index.ts), which
// enters scores by the same rules (server/.../games/moria/MoriaModule.java).
import { ByteFile, SEEK_CUR, SEEK_SET } from './bytefile.ts';
import { config } from './config.ts';
import { CURRENT_VERSION_MAJOR, CURRENT_VERSION_MINOR, CURRENT_VERSION_PATCH, MAX_HIGH_SCORE_ENTRIES } from './constants.ts';
import { validGameVersion } from './game.ts';
import { readHighScore, saveHighScore, setFileptr } from './game_save.ts';
import type { ScoreFile } from './platform.ts';
import { HighScore_t } from './structs.ts';

/** sizeof(HighScore_t) */
const HIGH_SCORE_SIZE = 72;

/**
 * The original's rule for one entry per character: under unix only one gender/race/class combo per
 * person (uid != 0); on a single user system an entry "(saved)" of the same character (birth date,
 * gender, race, class) is replaced.
 */
export function sameCharacter(new_entry: HighScore_t, old_entry: HighScore_t): boolean {
  return ((new_entry.uid !== 0 && new_entry.uid === old_entry.uid) ||
      (new_entry.uid === 0 && old_entry.died_from === '(saved)' && new_entry.birth_date === old_entry.birth_date)) &&
    new_entry.gender === old_entry.gender && new_entry.race === old_entry.race && new_entry.character_class === old_entry.character_class;
}

export class LocalScoreFile implements ScoreFile {
  async record(new_entry: HighScore_t): Promise<string | null> {
    const highscore_fp = ByteFile.open(config.files.scores, 'rb+');
    if (highscore_fp === null) {
      return `Error opening score file '${config.files.scores}'.`;
    }

    // Search file to find where to insert this character, if uid != 0 and
    // find same uid/gender/race/class combo then exit without saving this score.
    // Seek to the beginning of the file just to be safe.
    highscore_fp.seek(0, SEEK_SET);

    // Read version numbers from the score file, and check for validity.
    const version_maj = highscore_fp.getc() & 0xff;
    const version_min = highscore_fp.getc() & 0xff;
    const patch_level = highscore_fp.getc() & 0xff;

    // If this is a new score file, it should be empty.
    // Write the current version numbers to the score file.
    if (highscore_fp.eof()) {
      // Seek to the beginning of the file just to be safe.
      highscore_fp.seek(0, SEEK_SET);

      highscore_fp.putc(CURRENT_VERSION_MAJOR);
      highscore_fp.putc(CURRENT_VERSION_MINOR);
      highscore_fp.putc(CURRENT_VERSION_PATCH);

      // must fseek() before can change read/write mode
      highscore_fp.seek(0, SEEK_CUR);
    } else if (!validGameVersion(version_maj, version_min, patch_level)) {
      // No need to print a message, a subsequent call to
      // showScoresScreen() will print a message.
      highscore_fp.close();
      return null;
    }

    // set the static fileptr in save.c to the high score file pointer
    setFileptr(highscore_fp);

    const old_entry = new HighScore_t();
    const entry = new HighScore_t();

    let i = 0;
    let curpos = highscore_fp.tell();
    readHighScore(old_entry);

    while (!highscore_fp.eof()) {
      if (new_entry.points >= old_entry.points) {
        break;
      }

      if (sameCharacter(new_entry, old_entry)) {
        highscore_fp.close();
        return null;
      }

      // only allow one thousand scores in the score file
      i++;
      if (i >= MAX_HIGH_SCORE_ENTRIES) {
        highscore_fp.close();
        return null;
      }

      curpos = highscore_fp.tell();
      readHighScore(old_entry);
    }

    if (highscore_fp.eof()) {
      // write out new_entry at end of file
      highscore_fp.seek(curpos, SEEK_SET);

      saveHighScore(new_entry);
    } else {
      entry.assign(new_entry);

      while (!highscore_fp.eof()) {
        highscore_fp.seek(-HIGH_SCORE_SIZE - 1, SEEK_CUR);

        saveHighScore(entry);

        if (sameCharacter(new_entry, old_entry)) {
          break;
        }
        entry.assign(old_entry);

        // must fseek() before can change read/write mode
        highscore_fp.seek(0, SEEK_CUR);

        curpos = highscore_fp.tell();
        readHighScore(old_entry);
      }
      if (highscore_fp.eof()) {
        highscore_fp.seek(curpos, SEEK_SET);

        saveHighScore(entry);
      }
    }

    highscore_fp.close();
    return null;
  }

  async read(): Promise<HighScore_t[] | string> {
    const highscore_fp = ByteFile.open(config.files.scores, 'rb');
    if (highscore_fp === null) {
      return `Error opening score file '${config.files.scores}'.`;
    }

    highscore_fp.seek(0, SEEK_SET);

    // Read version numbers from the score file, and check for validity.
    const version_maj = highscore_fp.getc() & 0xff;
    const version_min = highscore_fp.getc() & 0xff;
    const patch_level = highscore_fp.getc() & 0xff;

    // If score data present, check if a valid game version
    if (!highscore_fp.eof() && !validGameVersion(version_maj, version_min, patch_level)) {
      highscore_fp.close();
      return 'Sorry. This score file is from a different version of umoria.';
    }

    // set the static fileptr in save.c to the high score file pointer
    setFileptr(highscore_fp);

    const scores: HighScore_t[] = [];
    const score = new HighScore_t();
    readHighScore(score);
    while (!highscore_fp.eof()) {
      scores.push(score.clone());
      readHighScore(score);
    }

    highscore_fp.close();
    return scores;
  }
}
