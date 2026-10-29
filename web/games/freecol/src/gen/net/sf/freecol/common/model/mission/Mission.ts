// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/mission/Mission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../../jre/index.ts';

/**
 * The Mission interface describes some kind of order that can be
 * given to a {@link Unit}, such as the order to move to a certain
 * Tile, attack a certain Unit, or build a TileImprovement, for
 * example. Missions can be atomic, or combine a number of simpler
 * Missions.
 */
export class Mission {
}

export class Mission$MissionState extends JEnum {
  static OK: Mission$MissionState = null;
  static COMPLETED: Mission$MissionState = null;
  static BLOCKED: Mission$MissionState = null;
  static ABORTED: Mission$MissionState = null;
  static $VALUES: Mission$MissionState[] = null;
  _Mission$MissionState($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Mission$MissionState[] { return Mission$MissionState.$VALUES.slice(); }
  static valueOf(name: string): Mission$MissionState { return $J.enumValueOf(Mission$MissionState, name); }
  static $clinit() {
    Mission$MissionState.OK = new Mission$MissionState()._Mission$MissionState('OK', 0);
    Mission$MissionState.COMPLETED = new Mission$MissionState()._Mission$MissionState('COMPLETED', 1);
    Mission$MissionState.BLOCKED = new Mission$MissionState()._Mission$MissionState('BLOCKED', 2);
    Mission$MissionState.ABORTED = new Mission$MissionState()._Mission$MissionState('ABORTED', 3);
    Mission$MissionState.$VALUES = [Mission$MissionState.OK, Mission$MissionState.COMPLETED, Mission$MissionState.BLOCKED, Mission$MissionState.ABORTED];
  }
}

$J.define(Mission, 'net.sf.freecol.common.model.mission.Mission', { kind: 'interface', returns: { 'getUnit': 'net.sf.freecol.common.model.Unit', 'isValid': 'boolean' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter' } });
$J.define(Mission$MissionState, 'net.sf.freecol.common.model.mission.Mission$MissionState', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Mission$MissionState' }, clinit: true, lazy: ['$VALUES', 'OK', 'COMPLETED', 'BLOCKED', 'ABORTED'] });
