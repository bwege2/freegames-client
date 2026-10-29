// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/mission/AbstractMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 *  MERCHANTLIMIT or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J } from '../../../../../../../jre/index.ts';
import { FreeColGameObject } from '../FreeColGameObject.ts';

let Unit;

/**
 * The AbstractMission provides basic methods for building Missions.
 */
export class AbstractMission extends FreeColGameObject {
  /**
   * The Unit this mission was assigned to. Must not be null.
   */
  unit: Unit = null;
  /**
   * The number of times this mission should be repeated. Defaults
   * to 1.
   */
  repeatCount: number = 0;
  /**
   * The number of turns this mission will take to carry out. In
   * most cases, this will be zero, since most missions do not take
   * a fixed number of turns to carry out. Building TileImprovements
   * and learning in school would be exceptions, however.
   */
  turnCount: number = 0;
  static readonly REPEAT_COUNT_TAG: string = 'repeatCount';
  static readonly TURN_COUNT_TAG: string = 'turnCount';
  static readonly UNIT_TAG: string = 'unit';
  $init_AbstractMission() {
    this.repeatCount = 1;
  }
  /**
   * Creates a new {@code AbstractMission} instance.
   *
   * @param game a {@code Game} value
   * @param id The object identifier.
   */
  _AbstractMission$Game$String(game: Game, id: string): this {
    this._FreeColGameObject$Game$String(game, id);
    this.$init_AbstractMission();
    return this;
  }
  /**
   * Creates a new {@code AbstractMission} instance.
   *
   * @param game a {@code Game} value
   * @param xr a {@code FreeColXMLReader} value
   */
  _AbstractMission$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._FreeColGameObject$Game$String(game, null);
    this.$init_AbstractMission();
    return this;
  }
  /**
   * Creates a new {@code AbstractMission} instance.
   *
   * @param game a {@code Game} value
   */
  _AbstractMission$Game(game: Game): this {
    this._FreeColGameObject$Game(game);
    this.$init_AbstractMission();
    return this;
  }
  /**
   * Returns the Unit this mission was assigned to.
   *
   * @return an {@code Unit} value
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * Set the {@code Unit} value.
   *
   * @param newUnit The new Unit value.
   */
  setUnit(newUnit: Unit): void {
    this.unit = newUnit;
  }
  /**
   * Get the {@code RepeatCount} value.
   *
   * @return an {@code int} value
   */
  getRepeatCount(): number {
    return this.repeatCount;
  }
  /**
   * Set the {@code RepeatCount} value.
   *
   * @param newRepeatCount The new RepeatCount value.
   */
  setRepeatCount(newRepeatCount: number): void {
    this.repeatCount = newRepeatCount;
  }
  /**
   * Get the {@code TurnCount} value.
   *
   * @return an {@code int} value
   */
  getTurnCount(): number {
    return this.turnCount;
  }
  /**
   * Set the {@code TurnCount} value.
   *
   * @param newTurnCount The new TurnCount value.
   */
  setTurnCount(newTurnCount: number): void {
    this.turnCount = newTurnCount;
  }
  /**
   * Returns true if the Unit this mission was assigned to is
   * neither null nor has been disposed, and the repeat count of the
   * mission is greater than zero.
   *
   * @return a {@code boolean} value
   */
  isValid(): boolean {
    return this.repeatCount > 0 && this.unit != null && !this.unit.isDisposed();
  }
  /**
   * Returns true if this is a valid Mission for the given
   * Unit. This method always returns false and needs to be
   * overridden.
   *
   * @param unit an {@code Unit} value
   * @return false
   */
  static isValidFor(unit: Unit): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(AbstractMission.UNIT_TAG, this.unit);
    xw.writeAttribute$String$int(AbstractMission.TURN_COUNT_TAG, this.turnCount);
    xw.writeAttribute$String$int(AbstractMission.REPEAT_COUNT_TAG, this.repeatCount);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.unit = xr.makeFreeColObject(this.getGame(), AbstractMission.UNIT_TAG, $J.cls(Unit), true);
    this.turnCount = xr.getAttribute$String$int(AbstractMission.TURN_COUNT_TAG, 0);
    this.repeatCount = xr.getAttribute$String$int(AbstractMission.REPEAT_COUNT_TAG, 1);
  }
}

$J.define(AbstractMission, 'net.sf.freecol.common.model.mission.AbstractMission', { kind: 'class', ifaces: ['net.sf.freecol.common.model.mission.Mission'], sup: 'net.sf.freecol.common.model.FreeColGameObject', ctors: { 'net.sf.freecol.common.model.Game': '_AbstractMission$Game', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AbstractMission$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game,java.lang.String': '_AbstractMission$Game$String' }, returns: { 'isValid': 'boolean', 'getTurnCount': 'int', 'getRepeatCount': 'int', 'getUnit': 'net.sf.freecol.common.model.Unit' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
});
