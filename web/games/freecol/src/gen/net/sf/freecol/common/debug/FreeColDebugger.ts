// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/debug/FreeColDebugger.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AtomicReference, Collectors, Files, IOException, JEnum, JObject, JString, Logger, NumberFormatException, Paths, PrintStream, RuntimeException, StandardOpenOption, Thread } from '../../../../../../jre/index.ts';

let FreeColDirectories, CollectionUtils, LogBuilder, StringUtils;

/**
 * High-level debug handling.
 */
export class FreeColDebugger extends JObject {
  static logger: Logger = null;
  static debugMode: number = 0;
  /**
   * The number of turns to run without stopping.
   */
  static debugRunTurns: number = 0;
  /**
   * The name of a file to save to at the end of a debug run.
   */
  static debugRunSave: string = null;
  /**
   * Stores the standard fog of war setting when revealing all the map
   * Allows restore to previous state when re-enabling normal vision
   */
  static normalGameFogOfWar: boolean = false;
  /**
   * Displays elements for debugging the rendering.
   */
  static debugRendering_: boolean = false;
  /**
   * Display map coordinates?
   */
  static displayCoordinates: boolean = false;
  /**
   * Display tile values as a colony site for this player?
   */
  static displayColonyValuePlayer: Player = null;
  /**
   * Show the mission for an AI unit?
   */
  static showMission: boolean = false;
  /**
   * Show full mission information?
   */
  static showMissionInfo: boolean = false;
  /**
   * Stream for debugLog.
   */
  static debugStream: AtomicReference<PrintStream> = null;
  /**
   * Displays the defence map for this player
   */
  static defenceMapPlayer: Player = null;
  _FreeColDebugger(): this {
    return this;
  }
  /**
   * Is a debug mode enabled in this game?
   *
   * @return True if any debug mode is enabled.
   */
  static isInDebugMode$(): boolean {
    return FreeColDebugger.debugMode !== 0;
  }
  /**
   * Checks if automatic changing of the scaleFactor on window resize
   * has been enabled.
   *
   * @return {@code true} if any debug mode is enabled.
   */
  static isAutomaticRescalingOnWindowResize(): boolean {
    return FreeColDebugger.debugMode !== 0;
  }
  /**
   * Is a particular debug mode enabled in this game?
   *
   * @param mode The {@code DebugMode} to test.
   * @return True if the specified mode is enabled.
   */
  static isInDebugMode$DebugMode(mode: FreeColDebugger$DebugMode): boolean {
    return ((1 << mode.ordinal()) & FreeColDebugger.debugMode) !== 0;
  }
  /**
   * Set a debug mode.
   *
   * @param mode The {@code DebugMode} to set.
   * @param val The value to set to.
   */
  static setDebugMode(mode: FreeColDebugger$DebugMode, val: boolean): void {
    if (val) {
      FreeColDebugger.enableDebugMode(mode);
    } else {
      FreeColDebugger.disableDebugMode(mode);
    }
  }
  /**
   * Enables a particular debug mode.
   *
   * @param mode The {@code DebugMode} to enable.
   */
  static enableDebugMode(mode: FreeColDebugger$DebugMode): void {
    FreeColDebugger.debugMode |= 1 << mode.ordinal();
  }
  /**
   * Disable a particular debug mode.
   *
   * @param mode The {@code DebugMode} to disable.
   */
  static disableDebugMode(mode: FreeColDebugger$DebugMode): void {
    if (mode !== FreeColDebugger$DebugMode.MENUS) {
      FreeColDebugger.debugMode &= ~(1 << mode.ordinal());
    }
  }
  /**
   * Gets the debug modes.
   *
   * @return A string containing the modes as csv.
   */
  static getDebugModes(): string {
    return CollectionUtils.transform$ObjectArr$Predicate$Function$Collector(FreeColDebugger$DebugMode.values(), (m) => FreeColDebugger.isInDebugMode$DebugMode(m), ($p0) => $p0.toString(), Collectors.joining(','));
  }
  /**
   * Configures the debug modes.
   *
   * @param optionValue The command line option.
   * @return True if the modes were set as specified.
   */
  static setDebugModes(optionValue: string): boolean {
    if (optionValue == null) {
      return false;
    }
    if ((optionValue.length === 0)) {
      return true;
    }
    for (let s of JString.split(optionValue, ',')) {
      try {
        let mode = $J.enumValueOf($J.cls(FreeColDebugger$DebugMode), StringUtils.upCase$String(s));
        FreeColDebugger.enableDebugMode(mode);
      } catch ($e0) {
        if ($J.isa($e0, RuntimeException)) {
          let e = $J.exc($e0);
          FreeColDebugger.logger.warning('Unrecognized debug mode: ' + optionValue);
          return false;
        } else {
          throw $e0;
        }
      }
    }
    return true;
  }
  /**
   * Configures a debug run.
   *
   * @param option The command line option.
   */
  static configureDebugRun(option: string): void {
    let comma = option.indexOf(String.fromCharCode(44 /* ',' */));
    let turns = option.substring(0, (comma < 0) ? option.length : comma);
    try {
      FreeColDebugger.setDebugRunTurns($J.parseInt(turns));
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let e = $J.exc($e1);
        FreeColDebugger.setDebugRunTurns(-1);
      } else {
        throw $e1;
      }
    }
    if (comma > 0) {
      FreeColDebugger.setDebugRunSave(option.substring((comma + 1) | 0));
    }
  }
  /**
   * Gets the turns to run in debug mode.
   *
   * @return The turns to run in debug mode.
   */
  static getDebugRunTurns(): number {
    return FreeColDebugger.debugRunTurns;
  }
  /**
   * Sets the number of turns to run in debug mode.
   *
   * @param debugRunTurns The new number of debug turns.
   */
  static setDebugRunTurns(debugRunTurns: number): void {
    FreeColDebugger.debugRunTurns = debugRunTurns;
  }
  /**
   * Gets the debug save file name.
   *
   * @return The debug save file name.
   */
  static getDebugRunSave(): string {
    return FreeColDebugger.debugRunSave;
  }
  /**
   * Sets the debug save file name.
   *
   * @param debugRunSave The new debug save file name.
   */
  static setDebugRunSave(debugRunSave: string): void {
    FreeColDebugger.debugRunSave = debugRunSave;
  }
  /**
   * Get the normal fog of war setting.
   *
   * @return The normal fog of war setting.
   */
  static getNormalGameFogOfWar(): boolean {
    return FreeColDebugger.normalGameFogOfWar;
  }
  /**
   * Set the normal fog of war setting.
   *
   * @param normalGameFogOfWar The new normal fog of war setting.
   */
  static setNormalGameFogOfWar(normalGameFogOfWar: boolean): void {
    FreeColDebugger.normalGameFogOfWar = normalGameFogOfWar;
  }
  /**
   * Try to complete a debug run if one is happening.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param force Force early completion of a run.
   * @return True if a debug run was completed.
   */
  static finishDebugRun(freeColClient: FreeColClient, force: boolean): boolean {
    let turns = FreeColDebugger.getDebugRunTurns();
    if (turns < 0 || turns > 0 && !force) {
      return false;
    }
    FreeColDebugger.setDebugRunTurns(-1);
    if (FreeColDebugger.getDebugRunSave() != null) {
      let fcs = freeColClient.getFreeColServer();
      if (fcs != null) {
        try {
          fcs.saveGame$File$OptionGroup$Unit(FreeColDirectories.getDebugRunSaveFile(), freeColClient.getClientOptions(), null);
        } catch ($e2) {
          if ($J.isa($e2, IOException)) {
            let e = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
      }
      freeColClient.quit();
    }
    return true;
  }
  /**
   * Signal that a debug run should complete at the next suitable
   * opportunity.  Currently called from the server.
   */
  static signalEndDebugRun(): void {
    if (FreeColDebugger.debugRunTurns > 0) {
      FreeColDebugger.setDebugRunTurns(0);
    }
  }
  /**
   * Should elements for debugging the rendering be displayed?
   */
  static debugRendering(): boolean {
    return FreeColDebugger.debugRendering_;
  }
  /**
   * Displays elements for debugging the rendering.
   *
   * @param _debugRendering If true, displays elements for debugging the rendering.
   */
  static setDebugRendering(_debugRendering: boolean): void {
    FreeColDebugger.debugRendering_ = _debugRendering;
  }
  /**
   * Should the map viewer display tile coordinates?
   *
   * @return True if the map viewer should display coordinates.
   */
  static debugDisplayCoordinates(): boolean {
    return FreeColDebugger.displayCoordinates;
  }
  /**
   * Set the display tile coordinates state.
   *
   * @param display Whether to display or not.
   */
  static setDebugDisplayCoordinates(display: boolean): void {
    FreeColDebugger.displayCoordinates = display;
  }
  /**
   * Should the map viewer display colony values for a player?
   *
   * @return The {@code Player} to display colony values for,
   *     or null if not to display.
   */
  static debugDisplayColonyValuePlayer(): Player {
    return FreeColDebugger.displayColonyValuePlayer;
  }
  /**
   * Set the player to display colony values for.
   *
   * @param display The new {@code Player} to display for.
   */
  static setDebugDisplayColonyValuePlayer(display: Player): void {
    FreeColDebugger.displayColonyValuePlayer = display;
  }
  /**
   * Should the map viewer show AI missions?
   *
   * @return True if the map viewer should show AI missions?
   */
  static debugShowMission(): boolean {
    return FreeColDebugger.showMission;
  }
  /**
   * Set the display of AI missions state.
   *
   * @param display Whether to display or not.
   */
  static setDebugShowMission(display: boolean): void {
    FreeColDebugger.showMission = display;
  }
  /**
   * Should the map viewer show full AI mission info?
   *
   * @return True if the map viewer should show full AI mission info.
   */
  static debugShowMissionInfo(): boolean {
    return FreeColDebugger.showMissionInfo;
  }
  /**
   * Set the display of full AI mission info state.
   *
   * @param display Whether to display or not.
   */
  static setDebugShowMissionInfo(display: boolean): void {
    FreeColDebugger.showMissionInfo = display;
  }
  /**
   * Displays the {@link DefensiveMap} for a given player.
   */
  static setDebugShowDefenceMapForPlayer(defenceMapPlayer: Player): void {
    FreeColDebugger.defenceMapPlayer = defenceMapPlayer;
  }
  static debugShowDefenceMapForPlayer(): Player {
    return FreeColDebugger.defenceMapPlayer;
  }
  /**
   * Handler for log records that include a crash.
   */
  static handleCrash(): void {
    if (FreeColDebugger.debugRunSave != null) {
      FreeColDebugger.signalEndDebugRun();
    }
  }
  /**
   * Emergency run time log to use when the normal logging is failing.
   * It might as well be here.
   *
   * @param msg The message to log.
   */
  static debugLog(msg: string): void {
    let print = FreeColDebugger.debugStream.get();
    if (print == null) {
      let tmp = $J.system_getenv('TMPDIR');
      if (tmp == null) {
        tmp = '/tmp';
      }
      let path = Paths.get(tmp, 'freecol.debug');
      try {
        let fos = Files.newOutputStream(path, StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        print = new PrintStream(fos, true, 'UTF-8');
      } catch ($e3) {
        if ($J.isa($e3, IOException)) {
          let ex = $J.exc($e3);
        } else {
          throw $e3;
        }
      }
      FreeColDebugger.debugStream.set(print);
    }
    if (print != null) {
      print.println(msg);
    }
  }
  /**
   * Miscellaneous debug helper to get a string representation of
   * the current call stack.
   *
   * @return A stack trace as a string.
   */
  static stackTraceToString$(): string {
    return FreeColDebugger.stackTraceToString$Thread(Thread.currentThread());
  }
  /**
   * Miscellaneous debug helper to get a string representation of
   * the stack of a given thread.
   *
   * @param thread The {@code Thread} to print.
   * @return A stack trace as a string.
   */
  static stackTraceToString$Thread(thread: Thread): string {
    let lb = new LogBuilder()._LogBuilder(512);
    FreeColDebugger.addStackTrace$LogBuilder$Thread(lb, thread);
    return lb.toString();
  }
  /**
   * Helper that adds a stack trace for the current thread to a log builder.
   *
   * @param lb The {@code LogBuilder} to add to.
   */
  static addStackTrace$LogBuilder(lb: LogBuilder): void {
    FreeColDebugger.addStackTrace$LogBuilder$Thread(lb, Thread.currentThread());
  }
  /**
   * Helper that adds a stack trace to a log builder.
   *
   * @param lb The {@code LogBuilder} to add to.
   * @param thread The {@code Thread} to print.
   */
  static addStackTrace$LogBuilder$Thread(lb: LogBuilder, thread: Thread): void {
    for (let s of thread.getStackTrace()) {
      lb.add([s.toString(), '\n']);
    }
    lb.shrink('\n');
  }
  /**
   * Log a warning with a stack trace.
   *
   * @param logger The {@code Logger} to log to.
   * @param warn The warning message.
   */
  static trace(logger: Logger, warn: string): void {
    let lb = new LogBuilder()._LogBuilder(512);
    lb.add([warn, '\n']);
    FreeColDebugger.addStackTrace$LogBuilder(lb);
    if (logger == null) {
      $J.err.println(lb.toString());
    } else {
      logger.warning(lb.toString());
    }
  }
  static $clinit() {
    FreeColDebugger.logger = Logger.getLogger($J.cls(FreeColDebugger).getName());
    FreeColDebugger.debugMode = 0;
    FreeColDebugger.debugRunTurns = -1;
    FreeColDebugger.debugRunSave = null;
    FreeColDebugger.normalGameFogOfWar = false;
    FreeColDebugger.debugRendering_ = false;
    FreeColDebugger.displayCoordinates = false;
    FreeColDebugger.displayColonyValuePlayer = null;
    FreeColDebugger.showMission = false;
    FreeColDebugger.showMissionInfo = false;
    FreeColDebugger.debugStream = new AtomicReference(null);
    FreeColDebugger.defenceMapPlayer = null;
  }
}

/**
 * The debug modes, any of which may be active.
 */
export class FreeColDebugger$DebugMode extends JEnum {
  static COMMS: FreeColDebugger$DebugMode = null;
  static DESYNC: FreeColDebugger$DebugMode = null;
  static MENUS: FreeColDebugger$DebugMode = null;
  static INIT: FreeColDebugger$DebugMode = null;
  static PATHS: FreeColDebugger$DebugMode = null;
  static $VALUES: FreeColDebugger$DebugMode[] = null;
  _FreeColDebugger$DebugMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FreeColDebugger$DebugMode[] { return FreeColDebugger$DebugMode.$VALUES.slice(); }
  static valueOf(name: string): FreeColDebugger$DebugMode { return $J.enumValueOf(FreeColDebugger$DebugMode, name); }
  static $clinit() {
    FreeColDebugger$DebugMode.COMMS = new FreeColDebugger$DebugMode()._FreeColDebugger$DebugMode('COMMS', 0);
    FreeColDebugger$DebugMode.DESYNC = new FreeColDebugger$DebugMode()._FreeColDebugger$DebugMode('DESYNC', 1);
    FreeColDebugger$DebugMode.MENUS = new FreeColDebugger$DebugMode()._FreeColDebugger$DebugMode('MENUS', 2);
    FreeColDebugger$DebugMode.INIT = new FreeColDebugger$DebugMode()._FreeColDebugger$DebugMode('INIT', 3);
    FreeColDebugger$DebugMode.PATHS = new FreeColDebugger$DebugMode()._FreeColDebugger$DebugMode('PATHS', 4);
    FreeColDebugger$DebugMode.$VALUES = [FreeColDebugger$DebugMode.COMMS, FreeColDebugger$DebugMode.DESYNC, FreeColDebugger$DebugMode.MENUS, FreeColDebugger$DebugMode.INIT, FreeColDebugger$DebugMode.PATHS];
  }
}

$J.define(FreeColDebugger, 'net.sf.freecol.common.debug.FreeColDebugger', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FreeColDebugger' }, meths: { 'addStackTrace(net.sf.freecol.common.util.LogBuilder,java.lang.Thread)': 'addStackTrace$LogBuilder$Thread', 'addStackTrace(net.sf.freecol.common.util.LogBuilder)': 'addStackTrace$LogBuilder', 'stackTraceToString(java.lang.Thread)': 'stackTraceToString$Thread', 'stackTraceToString()': 'stackTraceToString$', 'isInDebugMode(net.sf.freecol.common.debug.FreeColDebugger$DebugMode)': 'isInDebugMode$DebugMode', 'isInDebugMode()': 'isInDebugMode$' }, clinit: true, lazy: ['logger', 'debugMode', 'debugRunTurns', 'debugRunSave', 'normalGameFogOfWar', 'debugRendering_', 'displayCoordinates', 'displayColonyValuePlayer', 'showMission', 'showMissionInfo', 'debugStream', 'defenceMapPlayer'] });
$J.define(FreeColDebugger$DebugMode, 'net.sf.freecol.common.debug.FreeColDebugger$DebugMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FreeColDebugger$DebugMode' }, clinit: true, lazy: ['$VALUES', 'COMMS', 'DESYNC', 'MENUS', 'INIT', 'PATHS'] });
$J.module(() => {
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
