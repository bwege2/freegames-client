// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/UnitWanderMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

/**
 * Mission for wandering in random directions.
 */
export class UnitWanderMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'unitWanderMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI wanderer';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   */
  _UnitWanderMission$AIMain$AIUnit(aiMain: AIMain, aiUnit: AIUnit): this {
    this._Mission(aiMain, aiUnit);
    return this;
  }
  /**
   * Creates a new {@code UnitWanderMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _UnitWanderMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
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
    return Mission.invalidAIUnitReason(this.getAIUnit());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([UnitWanderMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    this.moveRandomlyTurn(UnitWanderMission.tag);
    return this.lbAt(lb);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitWanderMission.TAG;
  }
  static $clinit() {
    UnitWanderMission.logger = Logger.getLogger($J.cls(UnitWanderMission).getName());
  }
}

$J.define(UnitWanderMission, 'net.sf.freecol.server.ai.mission.UnitWanderMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_UnitWanderMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit': '_UnitWanderMission$AIMain$AIUnit' }, returns: { 'getXMLTagName': 'java.lang.String', 'isOneTime': 'boolean', 'getTarget': 'net.sf.freecol.common.model.Location' }, clinit: true, lazy: ['logger'] });
