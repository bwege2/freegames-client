// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/Turn.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, JString } from '../../../../../../jre/index.ts';

let Messages, NameCache, Constants, StringTemplate;

/**
 * Represents a given turn in the game.
 */
export class Turn extends JObject {
  /**
   * The starting year (1492 in Col1).
   */
  static startingYear: number = 0;
  /**
   * The year where the seasons split (1600 in Col1).
   */
  static seasonYear: number = 0;
  /**
   * The number of seasons.
   */
  static seasonNumber: number = 0;
  /**
   * The numerical value of the Turn, never less than one.
   */
  turn: number = 0;
  /**
   * Creates a new {@code Turn} instance.
   *
   * @param turn The numeric value of the turn.
   */
  _Turn(turn: number): this {
    this.turn = 1;
    this.turn = turn;
    return this;
  }
  /**
   * Initialize the fundamental Turn year constants.  Called from
   * the spec cleanup when the values are available and checked.
   *
   * @param newStartingYear The starting year for the game.
   * @param newSeasonYear The year at which the seasons split.
   * @param newSeasonNumber The number of seasons in the year.
   */
  static initialize(newStartingYear: number, newSeasonYear: number, newSeasonNumber: number): void {
    Turn.startingYear = newStartingYear;
    Turn.seasonYear = newSeasonYear;
    Turn.seasonNumber = newSeasonNumber;
  }
  /**
   * Gets the starting year.
   *
   * @return The numeric value of the starting year.
   */
  static getStartingYear(): number {
    return Turn.startingYear;
  }
  /**
   * Gets the season year (the year the seasons split).
   *
   * @return The numeric value of the season year.
   */
  static getSeasonYear(): number {
    return Turn.seasonYear;
  }
  /**
   * Gets the number of seasons.
   *
   * @return The number of seasons.
   */
  static getSeasonNumber(): number {
    return Turn.seasonNumber;
  }
  /**
   * Converts a year to a turn number.
   *
   * @param year The year to convert.
   * @return The integer value of the corresponding turn.
   */
  static yearToTurn$int(year: number): number {
    return Turn.yearToTurn$int$int(year, 0);
  }
  /**
   * Converts an integer year and specified season to a turn-integer-value.
   *
   * Public for the test suite.
   *
   * @param year The year to convert.
   * @param season The season index.
   * @return The integer value of the corresponding turn.
   */
  static yearToTurn$int$int(year: number, season: number): number {
    let ret = 1;
    let startingYear = Turn.getStartingYear();
    if (year >= startingYear) {
      ret = (ret + (year - startingYear)) | 0;
      let seasonYear = Turn.getSeasonYear();
      if (year >= seasonYear) {
        ret = (ret + (Math.imul(((year - seasonYear) | 0), ((Turn.getSeasonNumber() - 1) | 0)) + season)) | 0;
      }
    }
    return ret;
  }
  /**
   * Get the next turn, with a turn number one greater.
   *
   * @return The new {@code Turn}.
   */
  next(): Turn {
    return new Turn()._Turn((this.turn + 1) | 0);
  }
  /**
   * Gets the turn number.
   *
   * @return The number of turns.
   */
  getNumber(): number {
    return this.turn;
  }
  /**
   * Gets the year this turn is in.
   *
   * @return The calculated year based on the turn number.
   */
  getYear(): number {
    return Turn.getTurnYear(this.turn);
  }
  /**
   * Gets the year the given turn is in.
   *
   * Public for the test suite.
   *
   * @param turn The turn number to get the year for.
   * @return The calculated year based on the turn number.
   */
  static getTurnYear(turn: number): number {
    let year = (turn - 1 + Turn.getStartingYear()) | 0;
    let seasonYear = Turn.getSeasonYear();
    return (year < seasonYear) ? year : (seasonYear + $J.idiv(((year - seasonYear) | 0), Turn.getSeasonNumber())) | 0;
  }
  /**
   * Gets the season index of the given turn number.
   *
   * Public for the test suite.
   *
   * @param turn The turn number to calculate from.
   * @return The season index corresponding to the turn number or negative
   *     if before the season year.
   */
  static getTurnSeason(turn: number): number {
    let year = (turn - 1 + Turn.getStartingYear()) | 0;
    return (year < Turn.getSeasonYear()) ? -1 : ((year - Turn.seasonYear) | 0) % Turn.getSeasonNumber();
  }
  /**
   * Gets the season index of this turn.
   *
   * @return The season index corresponding to the current turn
   *     number, or negative if before the season year.
   */
  getSeason(): number {
    return Turn.getTurnSeason(this.turn);
  }
  /**
   * Gets a localization template for this turn.
   *
   * @return A {@code StringTemplate} describing the turn.
   */
  getLabel(): StringTemplate {
    return Turn.getTurnLabel(this.turn);
  }
  /**
   * Gets a localization template for a given turn.
   *
   * @param turn The integer value of the turn to describe.
   * @return A {@code StringTemplate} describing the turn.
   */
  static getTurnLabel(turn: number): StringTemplate {
    let season = Turn.getTurnSeason(turn);
    let t = StringTemplate.label('');
    if (season >= 0) {
      t.addName$String(NameCache.getSeasonName(season));
      t.addName$String(' ');
    }
    t.addName$String(String(Turn.getTurnYear(turn)));
    return t;
  }
  /**
   * Is this turn the first one?
   *
   * @return True if this turn is the first turn.
   */
  isFirstTurn(): boolean {
    return this.turn === 1;
  }
  /**
   * Is this turn the season year?
   *
   * @return True if this turn is the season year.
   */
  isFirstSeasonTurn(): boolean {
    return this.turn === Turn.yearToTurn$int(Turn.getSeasonYear());
  }
  /**
   * Get the suffix for a save game name for this turn.
   *
   * @return The save game suffix.
   */
  getSaveGameSuffix(): string {
    let season = this.getSeason();
    let result = String(this.getYear());
    if (season >= 0) {
      let SeasonNumberDigits = String(Turn.getSeasonNumber()).length;
      result += '_' + (JString.format('%0' + String(SeasonNumberDigits) + 'd', (season + 1) | 0)) + '_' + NameCache.getSeasonName(season);
    }
    return result;
  }
  /**
   * Gets a string describing the number of turns.
   *
   * @param turns The number of turns.
   * @return A descriptive string.
   */
  static getTurnsText(turns: number): string {
    return (turns === Constants.UNDEFINED) ? Messages.message$String('notApplicable') : (turns >= 0) ? String(turns) : '>' + (String((-turns - 1) | 0));
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof Turn) {
      return this.turn === (o).turn;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    return this.turn;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return String(this.turn);
  }
  static $clinit() {
    Turn.startingYear = 1492;
    Turn.seasonYear = 1600;
    Turn.seasonNumber = 2;
  }
}

$J.define(Turn, 'net.sf.freecol.common.model.Turn', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_Turn' }, returns: { 'hashCode': 'int', 'getSaveGameSuffix': 'java.lang.String', 'isFirstSeasonTurn': 'boolean', 'isFirstTurn': 'boolean', 'getLabel': 'net.sf.freecol.common.model.StringTemplate', 'getSeason': 'int', 'getYear': 'int', 'getNumber': 'int' }, meths: { 'yearToTurn(int,int)': 'yearToTurn$int$int', 'yearToTurn(int)': 'yearToTurn$int' }, clinit: true, lazy: ['startingYear', 'seasonYear', 'seasonNumber'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
