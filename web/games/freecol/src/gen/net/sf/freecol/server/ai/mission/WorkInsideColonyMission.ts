// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/WorkInsideColonyMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Colony, Unit$MoveType, CostDeciders;

/**
 * Mission for working inside an AI colony.
 */
export class WorkInsideColonyMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'workInsideColonyMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI worker';
  /**
   * The target colony to work inside.
   */
  colony: Colony = null;
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param aiColony The {@code AIColony} the unit should be
   *     working in.
   */
  _WorkInsideColonyMission$AIMain$AIUnit$AIColony(aiMain: AIMain, aiUnit: AIUnit, aiColony: AIColony): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(aiColony.getColony());
    return this;
  }
  /**
   * Creates a new {@code WorkInsideColonyMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _WorkInsideColonyMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Convenience accessor for the colony to work in.
   *
   * @return The {@code AIColony} to work in.
   */
  getAIColony(): AIColony {
    return this.getAIMain().getAIColony(this.colony);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason(aiUnit: AIUnit, loc: Location): string {
    let reason: string;
    return ((reason = Mission.invalidAIUnitReason(aiUnit)) != null) ? reason : (!aiUnit.getUnit().isPerson()) ? Mission.UNITNOTAPERSON : ((reason = Mission.invalidTargetReason$Location$Player(loc, aiUnit.getUnit().getOwner())) != null) ? reason : null;
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return Mission.NORMAL_TRANSPORT_PRIORITY;
  }
  /**
   * {@inheritDoc}
   */
  getTarget(): Location {
    return this.colony;
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
    if (target instanceof Colony) {
      this.colony = target;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return this.getTarget();
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return WorkInsideColonyMission.invalidMissionReason(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([WorkInsideColonyMission.tag]);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let unit = this.getUnit();
    let mt = this.travelToTarget(this.getTarget(), CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
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
    this.lbAt(lb);
    if (unit.isInColony()) {
      lb.add([', working']);
    }
    return this.lbWait(lb, []);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(WorkInsideColonyMission.COLONY_TAG, this.colony);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.colony = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), WorkInsideColonyMission.COLONY_TAG, $J.cls(Colony), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return WorkInsideColonyMission.TAG;
  }
  static $clinit() {
    WorkInsideColonyMission.logger = Logger.getLogger($J.cls(WorkInsideColonyMission).getName());
  }
}

$J.define(WorkInsideColonyMission, 'net.sf.freecol.server.ai.mission.WorkInsideColonyMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_WorkInsideColonyMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.server.ai.AIColony': '_WorkInsideColonyMission$AIMain$AIUnit$AIColony' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int', 'getAIColony': 'net.sf.freecol.server.ai.AIColony' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
});
