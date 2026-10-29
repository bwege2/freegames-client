// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/io/FreeColDirectories.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, ArrayList, AtomicReference, Collections, Comparator, Exception, File, FileSystemView, Files, IOException, JFunction, JObject, JString, Locale, PosixFilePermission, Predicate, SecurityException, Stream, StringBuilder, UnsupportedOperationException } from '../../../../../../jre/index.ts';

let FreeCol, FreeColException, FreeColDebugger, StringTemplate, CollectionUtils, OSUtils, StringUtils, Utils;

/**
 * Simple container for the freecol file and directory structure model.
 */
export class FreeColDirectories extends JObject {
  static fileModificationComparator: Comparator<File> = null;
  static fileNameComparator: Comparator<File> = null;
  static readonly AUTOSAVE_DIRECTORY: string = 'autosave';
  static readonly BASE_DIRECTORY: string = 'base';
  static readonly CLASSIC_DIRECTORY: string = 'classic';
  static readonly DATA_DIRECTORY: string = 'data';
  static readonly FREECOL_DIRECTORY: string = 'freecol';
  static readonly HIGH_SCORE_FILE: string = 'HighScores.xml';
  static readonly I18N_DIRECTORY: string = 'strings';
  static readonly LOG_FILE: string = 'FreeCol.log';
  static readonly LOG_COMMS_FILE_NAME: string = 'FreeColComms.log';
  static readonly MAPS_DIRECTORY: string = 'maps';
  static readonly MESSAGE_FILE_PREFIX: string = 'FreeColMessages';
  static readonly MESSAGE_FILE_SUFFIX: string = '.properties';
  static readonly MODS_DIRECTORY: string = 'mods';
  static readonly MOD_FILE_SUFFIX: string = '.fmd';
  static readonly MOD_MESSAGE_FILE_PREFIX: string = 'ModMessages';
  static readonly PLURALS_FILE_NAME: string = 'plurals.xml';
  static readonly RESOURCE_FILE_PREFIX: string = 'resources';
  static readonly RESOURCE_FILE_SUFFIX: string = '.properties';
  static readonly RULES_DIRECTORY: string = 'rules';
  static readonly SAVE_DIRECTORY: string = 'save';
  static readonly SPECIFICATION_FILE_NAME: string = 'specification.xml';
  static readonly START_MAP_NAME: string = 'startMap.fsg';
  static SEPARATOR: string = null;
  static readonly USER_MAPS_DIRECTORY: string = 'maps';
  static readonly ZIP_FILE_SUFFIX: string = '.zip';
  static readonly XDG_CONFIG_HOME_ENV: string = 'XDG_CONFIG_HOME';
  static readonly XDG_CONFIG_HOME_DEFAULT: string = '.config';
  static readonly XDG_DATA_HOME_ENV: string = 'XDG_DATA_HOME';
  static readonly XDG_DATA_HOME_DEFAULT: string = '.local/share';
  static readonly XDG_CACHE_HOME_ENV: string = 'XDG_CACHE_HOME';
  static readonly XDG_CACHE_HOME_DEFAULT: string = '.cache';
  static readonly BASE_CLIENT_OPTIONS_FILE_NAME: string = 'client-options.xml';
  static readonly CLIENT_OPTIONS_FILE_NAME: string = 'options.xml';
  static readonly CUSTOM_DIFFICULTY_FILE_NAME: string = 'custom.xml';
  static readonly GAME_OPTIONS_FILE_NAME: string = 'game_options.xml';
  static readonly MAP_FILE_NAME: string = 'my_map.fsg';
  static readonly MAP_EDITOR_FILE_NAME: string = 'my_map.fsm';
  static readonly MAP_GENERATOR_OPTIONS_FILE_NAME: string = 'map_generator_options.xml';
  static readonly MOD_DESCRIPTOR_FILE_NAME: string = 'mod.xml';
  /**
   * Predicate to filter suitable candidates to be made into mods.
   */
  static modFileFilter: Predicate<File> = null;
  /**
   * Predicate to select readable files that look like saved games.
   * Public for SaveGameValidator.
   */
  static saveGameFilter: Predicate<File> = null;
  /**
   * Predicate to select readable files that look like maps.
   */
  static mapFilter: Predicate<File> = null;
  /**
   * Predicate to filter suitable candidates to be made into TCs.
   */
  static rulesFileFilter: Predicate<File> = null;
  /**
   * Posix file mode 0700.
   */
  static mode0700: JSet<PosixFilePermission> = null;
  /**
   * The directory containing automatically created save games.  At
   * program start, the path of this directory is based on the path
   * where to store regular save games.  If the saved game is
   * changed by the user during the game, then the value of
   * autosaveDirectory will not change.
   */
  static autosaveDirectory: File = null;
  /**
   * A file containing the client options.
   *
   * Can be overridden at the command line.
   */
  static clientOptionsFile: File = null;
  /**
   * The directory where the standard freecol data is installed.
   *
   * Can be overridden at the command line.
   *
   * FIXME: defaults lamely to ./data.  Do something better in the
   * installer.
   */
  static dataDirectory: File = null;
  /**
   * The path to the log file.
   *
   * Can be overridden at the command line.
   */
  static logFilePath: string = null;
  /**
   * Where games are saved.
   *
   * Can be overridden in game or from the command line by
   * specifying the save game file.
   */
  static saveDirectory: File = null;
  /**
   * The current save game file.
   *
   * Can be modified in game.
   */
  static savegameFile: File = null;
  /**
   * The directory where freecol saves transient information.
   */
  static userCacheDirectory: File = null;
  /**
   * The directory where freecol saves user configuration.
   *
   * This will be set by default but can be overridden at the
   * command line.
   */
  static userConfigDirectory: File = null;
  /**
   * The directory where freecol saves user data.
   *
   * This will be set by default but can be overridden at the
   * command line.
   */
  static userDataDirectory: File = null;
  /**
   * An optional directory containing user mods.
   */
  static userModsDirectory: File = null;
  /**
   * The comms writer.
   */
  static commsWriter: AtomicReference<Writer> = null;
  _FreeColDirectories(): this {
    return this;
  }
  /**
   * Get the user home directory.
   *
   * @return The user home directory.
   */
  static getUserDefaultDirectory(): File {
    return FileSystemView.getFileSystemView().getDefaultDirectory();
  }
  /**
   * Check a directory for read and write access.
   *
   * @param dir The {@code File} that must be a usable directory.
   * @return Null on success, an error message key on failure.
   */
  static checkDir(dir: File): string {
    return (dir == null || !dir.exists()) ? 'cli.error.home.notExists' : (!dir.isDirectory()) ? 'cli.error.home.notDir' : (!dir.canRead()) ? 'cli.error.home.noRead' : (!dir.canWrite()) ? 'cli.error.home.noWrite' : null;
  }
  /**
   * Is the specified file a writable directory?
   *
   * @param f The {@code File} to check.
   * @return True if the file is a writable directory.
   */
  static isGoodDirectory(f: File): boolean {
    return f != null && f.exists() && f.isDirectory() && f.canWrite();
  }
  /**
   * Create the given directory if it does not exist, otherwise expect
   * it to be writable.
   *
   * @param dir The {@code File} specifying the required directory.
   * @return The required directory, or null on failure.
   */
  static requireDirectory(dir: File): File {
    if (dir.exists()) {
      if (dir.isDirectory() && dir.canWrite()) {
        return dir;
      }
    } else {
      if (dir.mkdir()) {
        try {
          Files.setPosixFilePermissions(dir.toPath(), FreeColDirectories.mode0700);
        } catch ($e0) {
          if ($J.isa($e0, IOException) || $J.isa($e0, UnsupportedOperationException)) {
            let ex = $J.exc($e0);
            $J.err.println('Failed to change permissions of ' + dir.getPath());
          } else {
            throw $e0;
          }
        }
        return dir;
      }
    }
    return null;
  }
  static bad(): StringTemplate {
    return StringTemplate.key$String('main.userDir.fail');
  }
  static badHome(): StringTemplate {
    return StringTemplate.key$String('main.userDir.noHome');
  }
  static badDir(d: File): StringTemplate {
    return StringTemplate.template$String('main.userDir.badDir').addName$String$String('%name%', d.getPath());
  }
  static badConfig(f: File): StringTemplate {
    return StringTemplate.template$String('main.userDir.badConfig').addName$String$String('%name%', f.getPath());
  }
  static badData(f: File): StringTemplate {
    return StringTemplate.template$String('main.userDir.badData').addName$String$String('%name%', f.getPath());
  }
  static badCache(f: File): StringTemplate {
    return StringTemplate.template$String('main.userDir.badCache').addName$String$String('%name%', f.getPath());
  }
  /**
   * Get directories for XDG compliant systems.
   *
   * XDG say: 
   *   If, when attempting to write a file, the destination
   *   directory is non-existant an attempt should be made to create
   *   it with permission 0700.
   *
   * @param dirs An array of {@code File} to be filled in with the
   *     XDG directory if it is present or created.
   * @return Null on success, an error message on error.
   */
  static getXDGDirs(dirs: File[]): StringTemplate {
    let home = FreeColDirectories.getUserDefaultDirectory();
    if (home == null) {
      return FreeColDirectories.badHome();
    }
    let env = $J.system_getenv(FreeColDirectories.XDG_CONFIG_HOME_ENV);
    let d = (env != null) ? new File(env) : new File(home, FreeColDirectories.XDG_CONFIG_HOME_DEFAULT);
    let xd: File;
    if ((xd = FreeColDirectories.requireDirectory(d)) == null) {
      return FreeColDirectories.badDir(d);
    }
    let f = new File(xd, FreeColDirectories.FREECOL_DIRECTORY);
    if ((d = FreeColDirectories.requireDirectory(f)) == null) {
      return FreeColDirectories.badConfig(f);
    }
    dirs[0] = d;
    env = $J.system_getenv(FreeColDirectories.XDG_DATA_HOME_ENV);
    d = (env != null) ? new File(env) : new File(home, FreeColDirectories.XDG_DATA_HOME_DEFAULT);
    if ((xd = FreeColDirectories.requireDirectory(d)) == null) {
      return FreeColDirectories.badDir(d);
    }
    f = new File(xd, FreeColDirectories.FREECOL_DIRECTORY);
    if ((d = FreeColDirectories.requireDirectory(f)) == null) {
      return FreeColDirectories.badData(f);
    }
    dirs[1] = d;
    env = $J.system_getenv(FreeColDirectories.XDG_CACHE_HOME_ENV);
    d = (env != null) ? new File(env) : new File(home, FreeColDirectories.XDG_CACHE_HOME_DEFAULT);
    if ((xd = FreeColDirectories.requireDirectory(d)) == null) {
      return FreeColDirectories.badDir(d);
    }
    f = new File(xd, FreeColDirectories.FREECOL_DIRECTORY);
    if ((d = FreeColDirectories.requireDirectory(f)) == null) {
      return FreeColDirectories.badCache(f);
    }
    dirs[2] = d;
    return null;
  }
  /**
   * Get FreeCol directories for MacOSX.
   *
   * No separate cache directory here.
   *
   * @param dirs An array of {@code File} to be filled in with the
   *     MacOSX freecol directories.
   * @return Null on success, an error message on failure.
   */
  static getMacOSXDirs(dirs: File[]): StringTemplate {
    let home = FreeColDirectories.getUserDefaultDirectory();
    if (home == null) {
      return FreeColDirectories.badHome();
    }
    let libDir = new File(home, 'Library');
    if (!FreeColDirectories.isGoodDirectory(libDir)) {
      return FreeColDirectories.badDir(libDir);
    }
    let prefsDir = new File(libDir, 'Preferences');
    if (!FreeColDirectories.isGoodDirectory(prefsDir)) {
      return FreeColDirectories.badDir(prefsDir);
    }
    let d = new File(prefsDir, FreeColDirectories.FREECOL_DIRECTORY);
    let d2 = FreeColDirectories.requireDirectory(d);
    if (d2 == null) {
      return FreeColDirectories.badConfig(d);
    }
    dirs[0] = d2;
    let appsDir = new File(libDir, 'Application Support');
    if (!FreeColDirectories.isGoodDirectory(appsDir)) {
      return FreeColDirectories.badDir(appsDir);
    }
    d = new File(appsDir, FreeColDirectories.FREECOL_DIRECTORY);
    d2 = FreeColDirectories.requireDirectory(d);
    if (d2 == null) {
      return FreeColDirectories.badData(d);
    }
    dirs[1] = dirs[2] = d2;
    return null;
  }
  /**
   * Get FreeCol directories for Windows.
   *
   * Simple case, everything is in the one directory.
   *
   * Result is:
   * - Negative on failure.
   * - Zero if a migration is needed.
   * - Positive if no migration is needed.
   *
   * @param dirs An array of {@code File} to be filled in with the
   *     Windows freecol directories.
   * @return Null on success, an error message on failure.
   */
  static getWindowsDirs(dirs: File[]): StringTemplate {
    let home = FreeColDirectories.getUserDefaultDirectory();
    if (home == null) {
      return FreeColDirectories.badHome();
    }
    let d = new File(home, FreeColDirectories.FREECOL_DIRECTORY);
    let d2 = FreeColDirectories.requireDirectory(d);
    if (d2 == null) {
      return FreeColDirectories.badDir(d);
    }
    dirs[0] = dirs[1] = dirs[2] = d;
    return null;
  }
  /**
   * Insist that a directory either already exists, or is created.
   *
   * @param file A {@code File} specifying where to make the directory.
   * @return True if the directory is now there.
   */
  static insistDirectory(file: File): boolean {
    let ret: boolean;
    if (file.exists()) {
      if (!(ret = file.isDirectory())) {
        $J.err.println('Could not create directory ' + file.getPath() + ' because a non-directory with that name is already there.');
      }
    } else {
      try {
        ret = file.mkdir();
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          ret = false;
          $J.err.println('Could not make directory ' + file.getPath() + ': ' + e.getMessage());
        } else {
          throw $e1;
        }
      }
    }
    return ret;
  }
  /**
   * Safely derive a subdirectory of a root.
   *
   * @param root The root directory.
   * @param subdir The name of the subdirectory to find or create.
   * @return The directory found, or null on error.
   */
  static deriveDirectory(root: File, subdir: string): File {
    let dir: File;
    return (FreeColDirectories.isGoodDirectory(root) && (FreeColDirectories.insistDirectory(dir = new File(root, subdir)))) ? dir : null;
  }
  /**
   * Derive the directory for the autosave files from the save directory.
   *
   * @return The new autosave directory, or null if not possible.
   */
  static deriveAutosaveDirectory(): File {
    if (FreeColDirectories.saveDirectory != null && FreeColDirectories.saveDirectory.toPath().endsWith(FreeColDirectories.AUTOSAVE_DIRECTORY)) {
      return FreeColDirectories.saveDirectory;
    }
    return FreeColDirectories.deriveDirectory(FreeColDirectories.saveDirectory, FreeColDirectories.AUTOSAVE_DIRECTORY);
  }
  /**
   * Collect files from a directory that match a predicate.
   *
   * @param dir The directory to load from.
   * @param pred A {@code Predicate} to match files with.
   * @return A list of {@code File}s.
   */
  static collectFiles(dir: File, pred: Predicate<File>): List<File> {
    return CollectionUtils.transform$Stream$Predicate$Function$Comparator(CollectionUtils.fileStream$File(dir), pred, JFunction.identity(), FreeColDirectories.fileNameComparator);
  }
  /**
   * Sets the data directory.
   *
   * Insist that the base resources and i18n subdirectories are present.
   *
   * @param path The path to the new data directory, or null to
   *     apply the default.
   * @return A (non-i18n) error message on failure, null on success.
   */
  static setDataDirectory(path: string): string {
    if (path == null) {
      path = FreeColDirectories.DATA_DIRECTORY;
    }
    let dir = new File(path);
    if (!dir.isDirectory()) {
      return 'Not a directory: ' + path;
    }
    if (!dir.canRead()) {
      return 'Can not read directory: ' + path;
    }
    FreeColDirectories.dataDirectory = dir;
    if (!FreeColDirectories.getBaseDirectory().exists()) {
      return 'Base data directory missing from: ' + path;
    }
    return null;
  }
  /**
   * Set the user directories for the current user.
   *
   * - on XDG standard compliant Unixes:
   *   - config:  ~/.config/freecol
   *   - data:    ~/.local/share/freecol
   *   - logging: ~/.cache/freecol
   * - on Mac:
   *   - config:  ~/Library/Preferences/freecol
   *   - else:    ~/Library/Application Support/freecol
   * - on Windows:
   *   - everything in <em>default directory</em>/freecol
   *
   * Note: the freecol data directory is set independently and earlier
   * in initialization than this routine.
   *
   * FIXME: Should the default location of the main user and data
   * directories be determined by the installer?
   *
   * @return Null on success, otherwise an error message template.
   */
  static setUserDirectories(): StringTemplate {
    let dirs = [null, null, null];
    let err = (OSUtils.onMacOSX()) ? FreeColDirectories.getMacOSXDirs(dirs) : (OSUtils.onUnix()) ? FreeColDirectories.getXDGDirs(dirs) : (OSUtils.onWindows()) ? FreeColDirectories.getWindowsDirs(dirs) : FreeColDirectories.bad();
    if (err != null) {
      return err;
    }
    if (FreeColDirectories.userConfigDirectory == null || !FreeColDirectories.isGoodDirectory(FreeColDirectories.userConfigDirectory)) {
      FreeColDirectories.userConfigDirectory = dirs[0];
    }
    if (FreeColDirectories.userDataDirectory == null || !FreeColDirectories.isGoodDirectory(FreeColDirectories.userDataDirectory)) {
      FreeColDirectories.userDataDirectory = dirs[1];
    }
    if (FreeColDirectories.userCacheDirectory == null || !FreeColDirectories.isGoodDirectory(FreeColDirectories.userCacheDirectory)) {
      FreeColDirectories.userCacheDirectory = dirs[2];
    }
    if (FreeColDirectories.logFilePath == null) {
      FreeColDirectories.logFilePath = $J.str(FreeColDirectories.getUserCacheDirectory()) + FreeColDirectories.SEPARATOR + FreeColDirectories.LOG_FILE;
    }
    if (FreeColDirectories.saveDirectory == null) {
      FreeColDirectories.saveDirectory = new File(FreeColDirectories.getUserDataDirectory(), FreeColDirectories.SAVE_DIRECTORY);
      if (!FreeColDirectories.insistDirectory(FreeColDirectories.saveDirectory)) {
        return FreeColDirectories.badDir(FreeColDirectories.saveDirectory);
      }
    }
    let dir = FreeColDirectories.deriveAutosaveDirectory();
    FreeColDirectories.setAutosaveDirectory(dir);
    FreeColDirectories.userModsDirectory = new File(FreeColDirectories.getUserDataDirectory(), FreeColDirectories.MODS_DIRECTORY);
    if (!FreeColDirectories.insistDirectory(FreeColDirectories.userModsDirectory)) {
      FreeColDirectories.userModsDirectory = null;
    }
    return null;
  }
  /**
   * Remove disallowed parts of a user supplied file name.
   *
   * @param fileName The input file name.
   * @return A sanitized file name.
   */
  static sanitize(fileName: string): string {
    let strings = new ArrayList();
    for (let i = 0; i < fileName.length; i++) {
      let s = fileName.substring(i, (i + 1) | 0);
      if ($J.equals(FreeColDirectories.SEPARATOR, s)) {
        continue;
      }
      strings.add(s);
    }
    return StringUtils.join$String$Collection('', strings);
  }
  /**
   * Gets the directory where the automatically saved games should be put.
   *
   * @return The autosave directory.
   */
  static getAutosaveDirectory(): File {
    if (!FreeColDirectories.isGoodDirectory(FreeColDirectories.autosaveDirectory)) {
      let dir = FreeColDirectories.deriveAutosaveDirectory();
      FreeColDirectories.setAutosaveDirectory(dir);
    }
    return FreeColDirectories.autosaveDirectory;
  }
  /**
   * Set the autosave directory.
   *
   * @param dir The new autosave directory.
   */
  static setAutosaveDirectory(dir: File): void {
    FreeColDirectories.autosaveDirectory = dir;
  }
  /**
   * Get a specific autosave file.
   *
   * @param fileName The name of the file.
   * @return The {@code File} found, or null on error.
   */
  static getAutosaveFile(fileName: string): File {
    let dir = FreeColDirectories.getAutosaveDirectory();
    return (dir == null) ? null : new File(dir, FreeColDirectories.sanitize(fileName));
  }
  /**
   * Get the autosave files.
   *
   * @param prefix The autosave file prefix.
   * @param pred A {@code Predicate} to select files with.
   * @return A list of of autosaved {@code File}s.
   */
  static getAutosaveFiles(prefix: string, pred: Predicate<File>): List<File> {
    let suffix = '.' + FreeCol.FREECOL_SAVE_EXTENSION;
    let asd = FreeColDirectories.getAutosaveDirectory();
    let fullPred = Predicate.and(pred, (f) => f.getName().startsWith(prefix) && f.getName().endsWith(suffix));
    return (asd == null) ? Collections.emptyList() : FreeColDirectories.collectFiles(asd, fullPred);
  }
  /**
   * Remove out of date autosaves. This only removed generic autosaves, not
   * the last-turn autosave, which can be useful for continuing the game on
   * the next play-session.
   *
   * @param prefix The autosave file prefix.
   * @param excludeSuffixes Only files not ending with any of these prefixes
   *     will be removed.
   * @param validDays Only files older than this amount of days will
   *     be removed.
   * @return A suitable log message, or null if nothing was deleted.
   */
  static removeOutdatedAutosaves(prefix: string, excludeSuffixes: List<string>, validDays: number): string {
    if (validDays <= 0) {
      return null;
    }
    let validMS = 1000 * 24 * 60 * 60 * validDays;
    let timeNow = Utils.now();
    let outdatedPred = (f) => f.lastModified() + validMS < timeNow;
    let extension = '.' + FreeCol.FREECOL_SAVE_EXTENSION;
    let ex = CollectionUtils.transform$Collection$Predicate$Function(excludeSuffixes, CollectionUtils.alwaysTrue(), (s) => FreeColDirectories.sanitize(s));
    let suffixPred = (f) => ex.stream().noneMatch((suf) => f.getName().endsWith(suf + extension));
    let files = FreeColDirectories.getAutosaveFiles(FreeColDirectories.sanitize(prefix), Predicate.and(outdatedPred, suffixPred));
    if (files.isEmpty()) {
      return null;
    }
    Utils.deleteFiles(files);
    let sb = new StringBuilder();
    sb.append('Deleted outdated (> ').append(String(validDays)).append(' old) autosave/s: ');
    for (const $it2 = files.iterator(); $it2.hasNext(); ) {
      let f = $it2.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(f.getPath());
    }
    return sb.toString();
  }
  /**
   * Remove all autosave files.
   *
   * @param prefix The autosave file prefix.
   * @return A suitable log message, or null if nothing was deleted.
   */
  static removeAutosaves(prefix: string): string {
    let files = FreeColDirectories.getAutosaveFiles(FreeColDirectories.sanitize(prefix), CollectionUtils.alwaysTrue());
    if (files.isEmpty()) {
      return null;
    }
    Utils.deleteFiles(files);
    let sb = new StringBuilder();
    sb.append('Deleted autosave/s: ');
    for (const $it3 = files.iterator(); $it3.hasNext(); ) {
      let f = $it3.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append(f.getPath());
    }
    return sb.toString();
  }
  /**
   * Gets the base resources directory.
   *
   * @return The base resources directory.
   */
  static getBaseDirectory(): File {
    return new File(FreeColDirectories.getDataDirectory(), FreeColDirectories.BASE_DIRECTORY);
  }
  /**
   * Gets the base client options file.
   *
   * @return The base client options file.
   */
  static getBaseClientOptionsFile(): File {
    return new File(FreeColDirectories.getBaseDirectory(), FreeColDirectories.BASE_CLIENT_OPTIONS_FILE_NAME);
  }
  /**
   * Gets the file containing the client options.
   *
   * @return The client options file, if any.
   */
  static getClientOptionsFile(): File {
    return (FreeColDirectories.clientOptionsFile != null) ? FreeColDirectories.clientOptionsFile : FreeColDirectories.getOptionsFile(FreeColDirectories.CLIENT_OPTIONS_FILE_NAME);
  }
  /**
   * Sets the client options file.
   *
   * @param path The new client options file.
   * @return True if the file was set successfully.
   */
  static setClientOptionsFile(path: string): boolean {
    let file = new File(path);
    if (file.exists() && file.isFile() && file.canRead()) {
      FreeColDirectories.clientOptionsFile = file;
      return true;
    }
    return false;
  }
  /**
   * Get a compatibility file.
   *
   * Not sanitizing the file name as it is fixed in all current uses.
   *
   * @param fileName The name of the compatibility file.
   * @return The {@code File} found.
   */
  static getCompatibilityFile(fileName: string): File {
    return new File(FreeColDirectories.getBaseDirectory(), fileName);
  }
  /**
   * Gets the data directory.
   *
   * @return The directory where the data files are located.
   */
  static getDataDirectory(): File {
    return FreeColDirectories.dataDirectory;
  }
  /**
   * Get the debug-run save file.
   *
   * @return The save {@code File}, if any.
   */
  static getDebugRunSaveFile(): File {
    return new File($J.system_getProperty('user.dir'), FreeColDebugger.getDebugRunSave());
  }
  /**
   * Gets the high score file.
   *
   * @return The high score file, if it exists.
   */
  static getHighScoreFile(): File {
    return new File(FreeColDirectories.getUserDataDirectory(), FreeColDirectories.HIGH_SCORE_FILE);
  }
  /**
   * Gets the directory containing language property files.
   *
   * @return The FreeCol i18n directory.
   */
  static getI18nDirectory(): File {
    return new File(FreeColDirectories.getDataDirectory(), FreeColDirectories.I18N_DIRECTORY);
  }
  /**
   * Get the contents of the log file.
   *
   * @return A string of the log file contents, or null on error.
   */
  static getLogFileContents(): string {
    return Utils.getUTF8Contents(new File(FreeColDirectories.getLogFilePath()));
  }
  /**
   * Get a list of candidate message file names for a given locale.
   *
   * @param locale The {@code Locale} to generate file names for.
   * @return A list of message {@code File}s.
   */
  static getI18nMessageFileList(locale: Locale): List<File> {
    let result = new ArrayList();
    let i18nDirectory = FreeColDirectories.getI18nDirectory();
    for (const $it4 = FreeColDirectories.getMessageFileNameList(locale).iterator(); $it4.hasNext(); ) {
      let name = $it4.next();
      let f = new File(i18nDirectory, name);
      if (f.canRead()) {
        result.add(f);
      }
    }
    return result;
  }
  /**
   * Get the i18n plurals file.
   *
   * @return The plurals {@code File}.
   */
  static getI18nPluralsFile(): File {
    return new File(FreeColDirectories.getI18nDirectory(), FreeColDirectories.PLURALS_FILE_NAME);
  }
  /**
   * Get a list of all the supported language identifiers.
   *
   * @return A list of language identifiers for which there is an
   *     i18n-message file.
   */
  static getLanguageIdList(): List<string> {
    let files = FreeColDirectories.getI18nDirectory().listFiles();
    return (files == null) ? Collections.emptyList() : CollectionUtils.transform$ObjectArr$Predicate$Function(files, ($p0) => $p0.canRead(), (f) => FreeColDirectories.getLanguageId(f));
  }
  /**
   * If this a messages file, work out which language identifier it
   * belongs to.
   *
   * @param file The {@code File} to test.
   * @return The language identifier found, or null on failure.
   */
  static getLanguageId(file: File): string {
    if (file == null) {
      return null;
    }
    let name = file.getName();
    if (name == null || !name.startsWith(FreeColDirectories.MESSAGE_FILE_PREFIX) || !name.endsWith(FreeColDirectories.MESSAGE_FILE_SUFFIX)) {
      return null;
    }
    let languageId = name.substring(FreeColDirectories.MESSAGE_FILE_PREFIX.length, (name.length - FreeColDirectories.MESSAGE_FILE_SUFFIX.length) | 0);
    return ($J.equals('', languageId)) ? 'en' : ($J.equals('_qqq', languageId)) ? null : (languageId.startsWith('_')) ? languageId.substring(1) : languageId;
  }
  /**
   * Gets a list containing the names of all possible message files
   * for a locale.
   *
   * @param prefix The file name prefix.
   * @param suffix The file name suffix.
   * @param locale The {@code Locale} to generate file names for.
   * @return A list of candidate file names.
   */
  static getLocaleFileNames(prefix: string, suffix: string, locale: Locale): List<string> {
    let language = locale.getLanguage();
    let country = locale.getCountry();
    let variant = locale.getVariant();
    let result = new ArrayList(4);
    if (!(language.length === 0)) {
      language = '_' + language;
    }
    if (!(country.length === 0)) {
      country = '_' + country;
    }
    if (!(variant.length === 0)) {
      variant = '_' + variant;
    }
    result.add(prefix + suffix);
    let filename = prefix + language + suffix;
    if (!result.contains(filename)) {
      result.add(filename);
    }
    filename = prefix + language + country + suffix;
    if (!result.contains(filename)) {
      result.add(filename);
    }
    filename = prefix + language + country + variant + suffix;
    if (!result.contains(filename)) {
      result.add(filename);
    }
    return result;
  }
  /**
   * Gets the log file path.
   *
   * @return The log file path.
   */
  static getLogFilePath(): string {
    return FreeColDirectories.logFilePath;
  }
  /**
   * Sets the log file path.
   *
   * @param path The new log file path.
   */
  static setLogFilePath(path: string): void {
    FreeColDirectories.logFilePath = path;
  }
  /**
   * Gets a new log writer.
   *
   * @return The log {@code Writer}.
   * @exception FreeColException if there was a problem creating the writer.
   */
  static getLogWriter(): Writer {
    let path = FreeColDirectories.getLogFilePath();
    let file = new File(path);
    if (file.exists()) {
      if (file.isDirectory()) {
        throw new FreeColException()._FreeColException$String('Log file "' + path + '" could not be created.');
      } else if (file.isFile()) {
        Utils.deleteFile(file);
      }
    }
    try {
      if (!file.createNewFile()) {
        throw new FreeColException()._FreeColException$String('Log file "' + path + '" creation failed.');
      }
    } catch ($e5) {
      if ($J.isa($e5, IOException) || $J.isa($e5, SecurityException)) {
        let e = $J.exc($e5);
        throw new FreeColException()._FreeColException$String$Throwable('Log file "' + path + '" could not be created.', e);
      } else {
        throw $e5;
      }
    }
    if (!file.canWrite()) {
      throw new FreeColException()._FreeColException$String('Can not write in log file "' + path + '".');
    }
    let writer = Utils.getFileUTF8Writer(file);
    if (writer == null) {
      throw new FreeColException()._FreeColException$String('Can not create writer for log file "' + path + '".');
    }
    return writer;
  }
  /**
   * Get a writer for the comms log file.
   *
   * @return A suitable {@code Writer}.
   * @exception FreeColException on error.
   */
  static getLogCommsWriter(): Writer {
    let writer = FreeColDirectories.commsWriter.get();
    if (writer == null) {
      let file = new File(FreeColDirectories.getUserCacheDirectory(), FreeCol.getName() + '-' + FreeColDirectories.LOG_COMMS_FILE_NAME);
      if (file.exists()) {
        Utils.deleteFile(file);
      }
      writer = Utils.getFileUTF8AppendWriter(file);
      if (writer == null) {
        throw new FreeColException()._FreeColException$String('Can not create writer for comms log file: ' + file.getPath());
      }
      FreeColDirectories.commsWriter.set(writer);
    }
    return writer;
  }
  /**
   * Gets the directory containing the predefined maps.
   *
   * @return The predefined maps.
   */
  static getMapsDirectory(): File {
    return new File(FreeColDirectories.getDataDirectory(), FreeColDirectories.MAPS_DIRECTORY);
  }
  /**
   * Get the map files.
   *
   * @return A list of map files which may be empty.
   */
  static getMapFileList(): List<File> {
    let ret = new ArrayList();
    for (let f of [FreeColDirectories.getMapsDirectory(), FreeColDirectories.getUserMapsDirectory()]) {
      if (f != null && f.isDirectory()) {
        ret.addAll(FreeColDirectories.collectFiles(f, FreeColDirectories.mapFilter));
      }
    }
    return ret;
  }
  /**
   * Get the message file names for a given locale.
   *
   * @param locale The {@code Locale} to generate names for.
   * @return A list of potential message file names.
   */
  static getMessageFileNameList(locale: Locale): List<string> {
    return FreeColDirectories.getLocaleFileNames(FreeColDirectories.MESSAGE_FILE_PREFIX, FreeColDirectories.MESSAGE_FILE_SUFFIX, locale);
  }
  /**
   * Get the mod message file names for a given locale.
   *
   * @param locale The {@code Locale} to generate names for.
   * @return A list of potential mod message file names.
   */
  static getModMessageFileNames(locale: Locale): List<string> {
    return FreeColDirectories.getLocaleFileNames(FreeColDirectories.MOD_MESSAGE_FILE_PREFIX, FreeColDirectories.MESSAGE_FILE_SUFFIX, locale);
  }
  /**
   * Get a list of the standard and current user mod files.
   *
   * @return A list of mod {@code File}s.
   */
  static getModFileList(): List<File> {
    let ret = new ArrayList();
    ret.addAll(FreeColDirectories.collectFiles(FreeColDirectories.getStandardModsDirectory(), FreeColDirectories.modFileFilter));
    ret.addAll(FreeColDirectories.collectFiles(FreeColDirectories.getUserModsDirectory(), FreeColDirectories.modFileFilter));
    return ret;
  }
  /**
   * Gets the directory where the user options are saved.
   *
   * @return The directory to save user options in.
   */
  static getOptionsDirectory(): File {
    let dir = new File(FreeColDirectories.getUserConfigDirectory(), FreeCol.getRules());
    return (FreeColDirectories.insistDirectory(dir)) ? dir : null;
  }
  /**
   * Get an options file from the options directory.
   *
   * @param fileName The name of the file within the options directory.
   * @return The options file.
   */
  static getOptionsFile(fileName: string): File {
    let dir = FreeColDirectories.getOptionsDirectory();
    return (dir == null) ? null : new File(dir, FreeColDirectories.sanitize(fileName));
  }
  /**
   * Get a list of candidate resource file names for a given locale.
   *
   * @return A list of resource file names.
   */
  static getResourceFileNames(): List<string> {
    return FreeColDirectories.getLocaleFileNames(FreeColDirectories.RESOURCE_FILE_PREFIX, FreeColDirectories.RESOURCE_FILE_SUFFIX, Locale.getDefault());
  }
  /**
   * Gets the directory containing the classic rules.
   *
   * @return The classic rules directory.
   */
  static getRulesClassicDirectory(): File {
    return new File(FreeColDirectories.getRulesDirectory(), FreeColDirectories.CLASSIC_DIRECTORY);
  }
  /**
   * Gets the directory containing the various rulesets.
   *
   * @return The ruleset directory.
   */
  static getRulesDirectory(): File {
    return new File(FreeColDirectories.getDataDirectory(), FreeColDirectories.RULES_DIRECTORY);
  }
  /**
   * Gets the directory where the savegames should be put.
   *
   * @return The save directory.
   */
  static getSaveDirectory(): File {
    return FreeColDirectories.saveDirectory;
  }
  /**
   * Gets the save game file.
   *
   * @return The save game file.
   */
  static getSavegameFile(): File {
    return FreeColDirectories.savegameFile;
  }
  /**
   * Gets the save game files in a given directory.
   *
   * @param directory The base directory, or the default locations if null.
   * @return A stream of save game {@code File}s.
   */
  static getSavegameFiles(directory: File): Stream<File> {
    return (directory == null) ? (CollectionUtils.flatten$Stream$Function(Stream.of(FreeColDirectories.getSaveDirectory(), FreeColDirectories.getAutosaveDirectory()), (d) => CollectionUtils.fileStream$File$Predicate(d, FreeColDirectories.saveGameFilter))) : CollectionUtils.fileStream$File$Predicate(directory, FreeColDirectories.saveGameFilter);
  }
  /**
   * Gets the save game files in a given directory.
   *
   * @param directory The base directory, or the default locations if null.
   * @return A list of save game {@code File}s.
   */
  static getSavegameFileList(directory: File): List<File> {
    return CollectionUtils.toList$Stream(FreeColDirectories.getSavegameFiles(directory));
  }
  /**
   * Sets the save game file.
   *
   * @param path The path to the new save game file.
   * @return True if the setting succeeds.
   */
  static setSavegameFile(path: string): boolean {
    let file = new File(path);
    if (!file.exists() || !file.isFile() || !file.canRead()) {
      file = new File(FreeColDirectories.getSaveDirectory(), path);
      if (!file.exists() || !file.isFile() || !file.canRead()) {
        return false;
      }
    }
    FreeColDirectories.savegameFile = file;
    let parent = file.getParentFile();
    if (parent == null) {
      parent = new File('.');
    }
    FreeColDirectories.saveDirectory = parent;
    let dir = FreeColDirectories.deriveAutosaveDirectory();
    FreeColDirectories.setAutosaveDirectory(dir);
    return true;
  }
  /**
   * Gets the most recently saved game file, or <b>null</b>.  (This
   * may be either from a recent arbitrary user operation or an
   * autosave function.)
   *
   * @return The recent save game {@code File}, or null if not found.
   */
  static getLastSaveGameFile(): File {
    return CollectionUtils.maximize$Stream$Comparator(FreeColDirectories.getSavegameFiles(null), FreeColDirectories.fileModificationComparator);
  }
  /**
   * Gets the standard mods directory.
   *
   * @return The directory where the standard mods are located.
   */
  static getStandardModsDirectory(): File {
    return new File(FreeColDirectories.getDataDirectory(), FreeColDirectories.MODS_DIRECTORY);
  }
  /**
   * Get the map file to start from, if any.
   *
   * @return The start map file, or null on error.
   */
  static getStartMapFile(): File {
    let dir = FreeColDirectories.getAutosaveDirectory();
    return (dir == null) ? null : new File(dir, FreeColDirectories.START_MAP_NAME);
  }
  /**
   * Get all available rules files.
   *
   * @return A list of {@code File}s containing rulesets.
   */
  static getRulesFileList(): List<File> {
    return FreeColDirectories.collectFiles(FreeColDirectories.getRulesDirectory(), FreeColDirectories.rulesFileFilter);
  }
  /**
   * Gets the user cache directory, that is the directory under which
   * the transient user files live.
   *
   * @return The user cache directory.
   */
  static getUserCacheDirectory(): File {
    return FreeColDirectories.userCacheDirectory;
  }
  /**
   * Sets the user cache directory, that is the directory under which
   * the user-specific cache files live.
   *
   * @param path The path to the new user cache directory.
   * @return Null on success, an error message key on failure.
   */
  static setUserCacheDirectory(path: string): string {
    let dir = new File(path);
    let ret = FreeColDirectories.checkDir(dir);
    if (ret == null) {
      FreeColDirectories.userCacheDirectory = dir;
    }
    return ret;
  }
  /**
   * Gets the user config directory, that is the directory under which
   * the user-specific config files live.
   *
   * @return The user config directory.
   */
  static getUserConfigDirectory(): File {
    return FreeColDirectories.userConfigDirectory;
  }
  /**
   * Sets the user config directory, that is the directory under which
   * the user-specific config files live.
   *
   * @param path The path to the new user config directory.
   * @return Null on success, an error message key on failure.
   */
  static setUserConfigDirectory(path: string): string {
    let dir = new File(path);
    let ret = FreeColDirectories.checkDir(dir);
    if (ret == null) {
      FreeColDirectories.userConfigDirectory = dir;
    }
    return ret;
  }
  /**
   * Gets the user data directory, that is the directory under which
   * the user-specific data lives.
   *
   * @return The user data directory.
   */
  static getUserDataDirectory(): File {
    return FreeColDirectories.userDataDirectory;
  }
  /**
   * Sets the main user data directory, creating it if necessary.
   * If pre-existing, it must be a directory, readable and writable.
   *
   * @param path The path to the new main data user directory, or
   *     null to apply the default.
   * @return Null on success, an error message key on failure.
   */
  static setUserDataDirectory(path: string): string {
    let dir = new File(path);
    let ret = FreeColDirectories.checkDir(dir);
    if (ret == null) {
      FreeColDirectories.userDataDirectory = dir;
    }
    return ret;
  }
  /**
   * Get the user maps directory.
   *
   * @return The directory to save user maps to, or null if none.
   */
  static getUserMapsDirectory(): File {
    return FreeColDirectories.deriveDirectory(FreeColDirectories.getUserDataDirectory(), FreeColDirectories.USER_MAPS_DIRECTORY);
  }
  /**
   * Gets the user mods directory.
   *
   * @return The directory where user mods are located, or null if none.
   */
  static getUserModsDirectory(): File {
    return FreeColDirectories.userModsDirectory;
  }
  static $clinit() {
    FreeColDirectories.fileModificationComparator = Comparator.comparingLong(($p0) => $p0.lastModified());
    FreeColDirectories.fileNameComparator = Comparator.comparing(($p0) => $p0.getName());
    FreeColDirectories.SEPARATOR = $J.system_getProperty('file.separator');
    FreeColDirectories.modFileFilter = (f) => Utils.fileAnySuffix(f, [FreeColDirectories.MOD_FILE_SUFFIX, FreeColDirectories.ZIP_FILE_SUFFIX]) || Utils.directoryAllPresent(f, [FreeColDirectories.MOD_DESCRIPTOR_FILE_NAME]);
    FreeColDirectories.saveGameFilter = (f) => f.isFile() && f.canRead() && f.getName().endsWith('.' + FreeCol.FREECOL_SAVE_EXTENSION);
    FreeColDirectories.mapFilter = (f) => f.isFile() && f.canRead() && f.getName().endsWith('.' + FreeCol.FREECOL_MAP_EXTENSION);
    FreeColDirectories.rulesFileFilter = (f) => Utils.fileAnySuffix(f, [FreeColDirectories.ZIP_FILE_SUFFIX]) || Utils.directoryAllPresent(f, [FreeColDirectories.MOD_DESCRIPTOR_FILE_NAME, FreeColDirectories.SPECIFICATION_FILE_NAME]);
    FreeColDirectories.mode0700 = CollectionUtils.makeUnmodifiableSet([PosixFilePermission.OWNER_READ, PosixFilePermission.OWNER_WRITE, PosixFilePermission.OWNER_EXECUTE]);
    FreeColDirectories.autosaveDirectory = null;
    FreeColDirectories.clientOptionsFile = null;
    FreeColDirectories.dataDirectory = new File(FreeColDirectories.DATA_DIRECTORY);
    FreeColDirectories.logFilePath = null;
    FreeColDirectories.saveDirectory = null;
    FreeColDirectories.savegameFile = null;
    FreeColDirectories.userCacheDirectory = null;
    FreeColDirectories.userConfigDirectory = null;
    FreeColDirectories.userDataDirectory = null;
    FreeColDirectories.userModsDirectory = null;
    FreeColDirectories.commsWriter = new AtomicReference(null);
  }
}

$J.define(FreeColDirectories, 'net.sf.freecol.common.io.FreeColDirectories', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeColDirectories' }, clinit: true, lazy: ['fileModificationComparator', 'fileNameComparator', 'SEPARATOR', 'modFileFilter', 'saveGameFilter', 'mapFilter', 'rulesFileFilter', 'mode0700', 'autosaveDirectory', 'clientOptionsFile', 'dataDirectory', 'logFilePath', 'saveDirectory', 'savegameFile', 'userCacheDirectory', 'userConfigDirectory', 'userDataDirectory', 'userModsDirectory', 'commsWriter'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  OSUtils = $J.load('net.sf.freecol.common.util.OSUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
