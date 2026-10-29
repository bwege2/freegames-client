// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/UnitWanderHostileMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Direction, RandomUtils;

/**
 * Mission for wandering around, attacking targets owned by a player we 
 * do not like.
 */
export class UnitWanderHostileMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'unitWanderHostileMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI hostile-wanderer';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   */
  _UnitWanderHostileMission$AIMain$AIUnit(aiMain: AIMain, aiUnit: AIUnit): this {
    this._Mission(aiMain, aiUnit);
    return this;
  }
  /**
   * Creates a new {@code UnitWanderHostileMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _UnitWanderHostileMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Why would this mission be invalid with the given unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason why the mission would be invalid with the unit,
   *     or null if none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    if (reason != null) {
      return reason;
    }
    let unit = aiUnit.getUnit();
    return (!unit.isOffensiveUnit()) ? Mission.UNITNOTOFFENSIVE : (!unit.hasTile()) ? Mission.UNITNOTONMAP : null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return UnitWanderHostileMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    return UnitWanderHostileMission.invalidMissionReason$AIUnit(aiUnit);
  }
  /**
   * {@inheritDoc}
   */
  getTarget(): Location {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  isOneTime(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return UnitWanderHostileMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), null);
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([UnitWanderHostileMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let unit = this.getUnit();
    let aiUnit = this.getAIUnit();
    let check = 0;
    let checkTurns = RandomUtils.randomInt(UnitWanderHostileMission.logger, 'Hostile', this.getAIRandom(), 4);
    let d = Direction.getRandomDirection(UnitWanderHostileMission.tag, UnitWanderHostileMission.logger, this.getAIRandom());
    while (unit.getMovesLeft() > 0) {
      if (check === 0) {
        let m = this.getAIPlayer().getSeekAndDestroyMission$AIUnit$int(aiUnit, 1);
        if (m != null) {
          return this.lbDone(lb, true, ['found target ', m.getTarget()]);
        }
        check = checkTurns;
      } else {
        check--;
      }
      if ((d = this.moveRandomly(UnitWanderHostileMission.tag, d)) == null) {
        break;
      }
    }
    return this.lbAt(lb);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitWanderHostileMission.TAG;
  }
  static $clinit() {
    UnitWanderHostileMission.logger = Logger.getLogger($J.cls(UnitWanderHostileMission).getName());
  }
}

$J.define(UnitWanderHostileMission, 'net.sf.freecol.server.ai.mission.UnitWanderHostileMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_UnitWanderHostileMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit': '_UnitWanderHostileMission$AIMain$AIUnit' }, returns: { 'getXMLTagName': 'java.lang.String', 'isOneTime': 'boolean', 'getTarget': 'net.sf.freecol.common.model.Location' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
});
