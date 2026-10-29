// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/EscortUnitMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Unit, Unit$MoveType, CostDeciders, AIMessage;

/**
 * Mission for attacking a specific target, be it a Unit or a Settlement.
 */
export class EscortUnitMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'escortUnitMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI escorter';
  /**
   * The object we are trying to escort. This can only be a {@code Unit}.
   */
  target: Location = null;
  /**
   * The object we are trying to escort. This can only be a {@code Unit}.
   */
  transportTarget: Location = null;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The object we are trying to escort.
   */
  _EscortUnitMission$AIMain$AIUnit$Unit(aiMain: AIMain, aiUnit: AIUnit, target: Unit): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code EscortUnitMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _EscortUnitMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Why would a EscortUnitMission be invalid with the given unit.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    return (reason != null) ? reason : (!aiUnit.getUnit().isOffensiveUnit()) ? Mission.UNITNOTOFFENSIVE : null;
  }
  /**
   * Why would a EscortUnitMission be invalid with the given unit
   * and target unit.
   *
   * @param aiUnit The {@code AIUnit} to seek-and-destroy with.
   * @param unit The target {@code Unit} to test.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidTargetReason(aiUnit: AIUnit, unit: Unit): string {
    let reason = Mission.invalidTargetReason$Location(unit);
    if (reason != null) {
      return reason;
    }
    let tile = unit.getTile$();
    return (tile == null) ? 'target-not-on-map' : (aiUnit.getUnit().getOwner() !== unit.getOwner()) ? Mission.TARGETOWNERSHIP : (aiUnit.getUnit().isNaval() !== unit.isNaval()) ? 'target-incompatible' : null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return EscortUnitMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = EscortUnitMission.invalidMissionReason$AIUnit(aiUnit);
    if (reason != null) {
      return reason;
    }
    return EscortUnitMission.invalidTargetReason(aiUnit, loc);
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
  getTransportDestination(): Location {
    if (!this.isValid()) {
      return null;
    }
    let loc = (this.transportTarget != null) ? this.transportTarget : this.target;
    return (this.getUnit().shouldTakeTransportTo(loc)) ? loc : null;
  }
  /**
   * {@inheritDoc}
   */
  getTarget(): Location {
    return this.target;
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
    if (target != null && !(target instanceof Unit)) {
      throw new IllegalArgumentException('Target not supported: ' + $J.str(target));
    }
    this.target = target;
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
  invalidReason(): string {
    return EscortUnitMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([EscortUnitMission.tag]);
    let aiUnit = this.getAIUnit();
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.lbDrop(lb, [reason]);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let currentTarget = this.getTarget();
    let mt = this.travelToTarget(currentTarget, CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
    {
      let unitTile: Tile, d: Direction;
      switch (mt) {
        case Unit$MoveType.MOVE_HIGH_SEAS:
        case Unit$MoveType.MOVE_NO_MOVES:
        case Unit$MoveType.MOVE_ILLEGAL:
          this.lbWait(lb, []);
          break;
        case Unit$MoveType.MOVE_NO_REPAIR:
          return this.lbFail(lb, false, [Mission.AIUNITDIED]);
        case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
        case Unit$MoveType.MOVE_NO_TILE:
          break;
        case Unit$MoveType.ATTACK_UNIT:
        case Unit$MoveType.ATTACK_SETTLEMENT:
          unitTile = this.getUnit().getTile$();
          d = unitTile.getDirection(currentTarget.getTile$());
          if (d == null) {
            EscortUnitMission.logger.warning('SDDM bogus ' + $J.str(mt) + ' with ' + $J.str(this.getUnit()) + ' from ' + $J.str(unitTile) + ' to ' + $J.str(currentTarget) + ' at ' + $J.str(currentTarget.getTile$()));
            return this.lbWait(lb, []);
          }
          AIMessage.askAttack(aiUnit, d);
          return this.lbAttack(lb, currentTarget);
        default:
          this.lbMove(lb, mt);
          break;
      }
    }
    return this;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(EscortUnitMission.TARGET_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), EscortUnitMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return EscortUnitMission.TAG;
  }
  static $clinit() {
    EscortUnitMission.logger = Logger.getLogger($J.cls(EscortUnitMission).getName());
  }
}

$J.define(EscortUnitMission, 'net.sf.freecol.server.ai.mission.EscortUnitMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_EscortUnitMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Unit': '_EscortUnitMission$AIMain$AIUnit$Unit' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
