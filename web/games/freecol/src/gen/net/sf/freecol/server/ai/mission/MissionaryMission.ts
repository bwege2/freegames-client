// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/MissionaryMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Ability, Colony, IndianSettlement, Settlement, Unit$MoveType, CostDeciders, GoalDeciders, AIMessage;

/**
 * Mission for sending a missionary to a native settlement.
 */
export class MissionaryMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'missionaryMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI missionary';
  /**
   * The target to aim for, used for a TransportMission.
   * Either an IndianSettlement, or a backup Colony to head for before
   * retargeting.
   */
  target: Location = null;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a missionary mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The target {@code Location} for this mission.
   */
  _MissionaryMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code MissionaryMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _MissionaryMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Extract a valid target for this mission from a path.
   *
   * @param aiUnit A {@code AIUnit} to perform the mission.
   * @param path A {@code PathNode} to extract a target from,
   *     (uses the unit location if null).
   * @return A target for this mission, or null if none found.
   */
  static extractTarget(aiUnit: AIUnit, path: PathNode): Location {
    if (path == null) {
      return null;
    }
    let loc = path.getLastNode().getLocation();
    let settlement = (loc == null) ? null : loc.getSettlement();
    return (settlement instanceof IndianSettlement && MissionaryMission.invalidIndianSettlementReason(aiUnit, settlement) == null) ? settlement : (settlement instanceof Colony && MissionaryMission.invalidColonyReason(aiUnit, settlement) == null) ? settlement : null;
  }
  /**
   * Evaluate a potential cashin mission for a given unit and
   * path.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path A {@code PathNode} to take to the target.
   * @return A score for the proposed mission.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode): number {
    let loc = MissionaryMission.extractTarget(aiUnit, path);
    return (loc instanceof IndianSettlement) ? $J.idiv(1000, ((path.getTotalTurns() + 1) | 0)) : -2147483648;
  }
  /**
   * Makes a goal decider that checks for potential missions.
   *
   * @param aiUnit The {@code AIUnit} to find a mission with.
   * @param deferOK Enable deferring to a fallback colony.
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit, deferOK: boolean): GoalDecider {
    let gd = new (MissionaryMission$1())().$c(aiUnit).$init_anon();
    return (deferOK) ? GoalDeciders.getComposedGoalDecider(false, [gd, GoalDeciders.getOurClosestSettlementGoalDecider()]) : gd;
  }
  /**
   * Find a suitable mission location for this unit.
   *
   * @param aiUnit The {@code AIUnit} to execute this mission.
   * @param range An upper bound on the number of moves.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A path to the new target, or null if none found.
   */
  static findTargetPath(aiUnit: AIUnit, range: number, deferOK: boolean): PathNode {
    if (Mission.invalidAIUnitReason(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let start = unit.getPathStartLocation();
    let carrier = unit.getCarrier();
    let gd = MissionaryMission.getGoalDecider(aiUnit, deferOK);
    let standardCd = CostDeciders.avoidSettlementsAndBlockingUnits();
    return unit.search(start, gd, standardCd, range, carrier);
  }
  /**
   * Finds a suitable mission target for the supplied unit.
   * Falls back to the best colony if a path is not found.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param range An upper bound on the number of moves.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A new target for this mission.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = MissionaryMission.findTargetPath(aiUnit, range, deferOK);
    return (path == null) ? null : MissionaryMission.extractTarget(aiUnit, path);
  }
  /**
   * Prepare a unit for a Missionary mission.
   *
   * @param aiUnit The {@code AIUnit} to prepare.
   * @return A reason why the unit can not perform this mission, or null
   *     if none.
   */
  static prepare(aiUnit: AIUnit): string {
    let reason = MissionaryMission.invalidUnitReason(aiUnit);
    if (reason == null) {
      let unit = aiUnit.getUnit();
      if (!unit.hasAbility$String(Ability.ESTABLISH_MISSION) && ((unit.getLocation()).hasAbility$String(Ability.DRESS_MISSIONARY))) {
        aiUnit.equipForRole(unit.getSpecification().getMissionaryRole());
      }
      reason = (unit.hasAbility$String(Ability.ESTABLISH_MISSION)) ? null : 'unit-can-not-establish-mission';
    }
    return reason;
  }
  /**
   * Why would this mission be invalid with the given unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason to not perform the mission, or null if none.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    if (reason != null) {
      return reason;
    }
    let unit = aiUnit.getUnit();
    return (!unit.isPerson()) ? Mission.UNITNOTAPERSON : (unit.getSkillLevel() >= -1 && !unit.hasAbility$String(Ability.EXPERT_MISSIONARY)) ? 'unit-is-not-subskilled-or-expertMissionary' : (unit.isInEurope() || unit.isAtSea()) ? ((!unit.getOwner().hasSettlements()) ? 'unit-off-map-but-missing-initial-settlement' : null) : (unit.isInMission()) ? 'unit-is-already-at-mission' : null;
  }
  /**
   * Why would a MissionaryMission be invalid with the given Colony?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param colony The {@code Colony} to check.
   * @return A reason to not perform the mission, or null if none.
   */
  static invalidColonyReason(aiUnit: AIUnit, colony: Colony): string {
    return Mission.invalidTargetReason$Location$Player(colony, aiUnit.getUnit().getOwner());
  }
  /**
   * Why would a MissionaryMission be invalid with the given
   * IndianSettlement?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param is The {@code IndianSettlement} to check.
   * @return A reason to not perform the mission, or null if none.
   */
  static invalidIndianSettlementReason(aiUnit: AIUnit, is$: IndianSettlement): string {
    let reason = Mission.invalidTargetReason$Location(is$);
    if (reason != null) {
      return reason;
    }
    let owner = aiUnit.getUnit().getOwner();
    return (!owner.hasContacted(is$.getOwner())) ? 'target-is-uncontacted' : (is$.getOwner().atWarWith(owner)) ? 'target-at-war' : (is$.hasMissionary$Player(owner)) ? 'target-has-our-mission' : null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return MissionaryMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = MissionaryMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof IndianSettlement) ? MissionaryMission.invalidIndianSettlementReason(aiUnit, loc) : (loc instanceof Colony) ? MissionaryMission.invalidColonyReason(aiUnit, loc) : Mission.TARGETINVALID;
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
    return this.target;
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
    if (target == null || target instanceof Settlement) {
      this.target = target;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return MissionaryMission.findMissionTarget(this.getAIUnit(), 20, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return MissionaryMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([MissionaryMission.tag]);
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let aiUnit = this.getAIUnit();
    let unit = this.getUnit();
    let mt = this.travelToTarget(this.getTarget(), CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
    {
      let completed: Location, newTarget: Location;
      switch (mt) {
        case Unit$MoveType.MOVE:
          this.lbAt(lb);
          completed = this.getTarget();
          newTarget = MissionaryMission.findMissionTarget(aiUnit, 20, false);
          if (newTarget == null || newTarget === completed) {
            return this.lbFail(lb, false, ['retarget failed']);
          }
          this.setTarget(newTarget);
          return this.lbRetarget(lb);
        case Unit$MoveType.MOVE_HIGH_SEAS:
        case Unit$MoveType.MOVE_NO_MOVES:
        case Unit$MoveType.MOVE_ILLEGAL:
          return this.lbWait(lb, []);
        case Unit$MoveType.MOVE_NO_REPAIR:
          return this.lbFail(lb, false, [Mission.AIUNITDIED]);
        case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
        case Unit$MoveType.MOVE_NO_TILE:
          return this;
        case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY:
          break;
        default:
          return this.lbMove(lb, mt);
      }
    }
    this.lbAt(lb);
    let d = unit.getTile$().getDirection(this.getTarget().getTile$());
    // assert d != null
    let is$ = this.getTarget();
    AIMessage.askEstablishMission(aiUnit, d, is$.hasMissionary$());
    return (is$.hasMissionary$Player(unit.getOwner()) && unit.isInMission()) ? this.lbDone(lb, false, ['established']) : this.lbFail(lb, false, ['establish']);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(MissionaryMission.TARGET_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), MissionaryMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return MissionaryMission.TAG;
  }
  static $clinit() {
    MissionaryMission.logger = Logger.getLogger($J.cls(MissionaryMission).getName());
  }
}

let $MissionaryMission$1: any = null;
/** An anonymous class (MissionaryMission.java:145). */
function MissionaryMission$1(): any {
  return $MissionaryMission$1 ??= $J.local(class extends JObject {
    bestPath: PathNode = null;
    bestValue: number = 0;
    $init_anon() {
      this.bestPath = null;
      this.bestValue = -2147483648;
      return this;
    }
    getGoal(): PathNode {
      return this.bestPath;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, path: PathNode): boolean {
      if (path.getLastNode().getLocation().getSettlement() instanceof IndianSettlement) {
        let value = MissionaryMission.scorePath(this.$cv_aiUnit, path);
        if (this.bestValue < value) {
          this.bestValue = value;
          this.bestPath = path;
          return true;
        }
      }
      return false;
    }
    $c($aiUnit): this {
      this.$cv_aiUnit = $aiUnit;
      return this;
    }
  }, 'net.sf.freecol.server.ai.mission.MissionaryMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(MissionaryMission, 'net.sf.freecol.server.ai.mission.MissionaryMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_MissionaryMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_MissionaryMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
