// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/mission/GoToMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AbstractMission } from './AbstractMission.ts';

let Mission$MissionState;

/**
 * The GoToMission causes a Unit to move towards its destination.
 */
export class GoToMission extends AbstractMission {
  static readonly TAG: string = 'goToMission';
  /**
   * The number of turns this mission has been blocked.
   */
  blockedCount: number = 0;
  /**
   * The destination of this Mission.
   */
  destination: Location = null;
  static readonly BLOCKED_COUNT_TAG: string = 'blockedCount';
  static readonly DESTINATION_TAG: string = 'destination';
  /**
   * Creates a new {@code GoToMission} instance.
   *
   * @param game a {@code Game} value
   */
  _GoToMission$Game(game: Game): this {
    this._AbstractMission$Game(game);
    return this;
  }
  /**
   * Creates a new {@code GoToMission} instance.
   *
   * @param game a {@code Game} value
   * @param xr a {@code FreeColXMLReader} value
   */
  _GoToMission$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AbstractMission$Game$FreeColXMLReader(game, xr);
    return this;
  }
  /**
   * Creates a new {@code GoToMission} instance.
   *
   * @param game a {@code Game} value
   * @param id The object identifier.
   */
  _GoToMission$Game$String(game: Game, id: string): this {
    this._AbstractMission$Game$String(game, id);
    return this;
  }
  /**
   * Get the {@code Destination} value.
   *
   * @return an {@code Location} value
   */
  getDestination(): Location {
    return this.destination;
  }
  /**
   * Set the {@code Destination} value.
   *
   * @param newDestination The new Destination value.
   */
  setDestination(newDestination: Location): void {
    this.destination = newDestination;
  }
  /**
   * Get the {@code BlockedCount} value.
   *
   * @return an {@code int} value
   */
  getBlockedCount(): number {
    return this.blockedCount;
  }
  /**
   * Set the {@code BlockedCount} value.
   *
   * @param newBlockedCount The new BlockedCount value.
   */
  setBlockedCount(newBlockedCount: number): void {
    this.blockedCount = newBlockedCount;
  }
  /**
   * {@inheritDoc}
   */
  doMission(): Mission$MissionState {
    return Mission$MissionState.OK;
  }
  /**
   * Returns true if the mission is still valid.
   *
   * @return a {@code boolean} value
   */
  isValid(): boolean {
    return this.destination != null && this.destination.canAdd(this.getUnit()) && super.isValid();
  }
  /**
   * Returns true if the given Unit has movement points. At the
   * moment, this is true for all units.
   *
   * @param unit an {@code Unit} value
   * @return false
   */
  static isValidFor(unit: Unit): boolean {
    return unit.getInitialMovesLeft() > 0;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$Object(GoToMission.DESTINATION_TAG, this.destination);
    xw.writeAttribute$String$int(GoToMission.BLOCKED_COUNT_TAG, this.blockedCount);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.destination = xr.getLocationAttribute(this.getGame(), GoToMission.DESTINATION_TAG, false);
    this.blockedCount = xr.getAttribute$String$int(GoToMission.BLOCKED_COUNT_TAG, 0);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return GoToMission.TAG;
  }
}

$J.define(GoToMission, 'net.sf.freecol.common.model.mission.GoToMission', { kind: 'class', sup: 'net.sf.freecol.common.model.mission.AbstractMission', ctors: { 'net.sf.freecol.common.model.Game,java.lang.String': '_GoToMission$Game$String', 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_GoToMission$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Game': '_GoToMission$Game' }, returns: { 'getXMLTagName': 'java.lang.String', 'isValid': 'boolean', 'getBlockedCount': 'int', 'getDestination': 'net.sf.freecol.common.model.Location' } });
$J.module(() => {
  Mission$MissionState = $J.load('net.sf.freecol.common.model.mission.Mission$MissionState');
});
