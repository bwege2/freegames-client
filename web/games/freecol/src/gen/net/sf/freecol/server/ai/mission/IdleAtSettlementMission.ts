// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/IdleAtSettlementMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Location, Unit$MoveType;

/**
 * Mission for idling in a settlement.
 */
export class IdleAtSettlementMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'idleAtSettlementMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI idler';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   */
  _IdleAtSettlementMission$AIMain$AIUnit(aiMain: AIMain, aiUnit: AIUnit): this {
    this._Mission(aiMain, aiUnit);
    return this;
  }
  /**
   * Creates a new {@code IdleAtSettlementMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _IdleAtSettlementMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Is the unit in a safe location where it can idle, or should it move?
   *
   * @return True if the unit is safe.
   */
  isSafe(): boolean {
    let unit = this.getUnit();
    return unit.isInEurope() || !unit.hasTile() || unit.getTile$().hasSettlement();
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return Mission.MINIMUM_TRANSPORT_PRIORITY;
  }
  /**
   * {@inheritDoc}
   */
  getTarget(): Location {
    return (this.isSafe()) ? null : this.findTarget();
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
    if (this.isSafe()) {
      return null;
    }
    let unit = this.getAIUnit().getUnit();
    let path = unit.findOurNearestOtherSettlement();
    return (path == null) ? null : Location.upLoc(path.getLastNode().getLocation());
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
    lb.add([IdleAtSettlementMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    if (this.isSafe()) {
      lb.add([', idling']);
      return this.lbAt(lb);
    }
    let target = this.getTarget();
    if (target == null) {
      this.moveRandomlyTurn(IdleAtSettlementMission.tag);
      return this.lbWait(lb, []);
    }
    let mt = this.travelToTarget(this.getTarget(), null, lb);
    switch (mt) {
      case Unit$MoveType.MOVE:
        break;
      case Unit$MoveType.MOVE_HIGH_SEAS:
      case Unit$MoveType.MOVE_NO_MOVES:
      case Unit$MoveType.MOVE_ILLEGAL:
        return this.lbWait(lb, []);
      case Unit$MoveType.MOVE_NO_REPAIR:
        return this.lbFail(lb, false, [Mission.AIUNITDIED]);
      case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
      case Unit$MoveType.MOVE_NO_TILE:
        return this;
      default:
        return this.lbMove(lb, mt);
    }
    return this.lbAt(lb);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return IdleAtSettlementMission.TAG;
  }
  static $clinit() {
    IdleAtSettlementMission.logger = Logger.getLogger($J.cls(IdleAtSettlementMission).getName());
  }
}

$J.define(IdleAtSettlementMission, 'net.sf.freecol.server.ai.mission.IdleAtSettlementMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_IdleAtSettlementMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit': '_IdleAtSettlementMission$AIMain$AIUnit' }, returns: { 'getXMLTagName': 'java.lang.String', 'isOneTime': 'boolean', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int', 'isSafe': 'boolean' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Location = $J.load('net.sf.freecol.common.model.Location');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
});
