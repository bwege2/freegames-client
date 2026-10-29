// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/CashInTreasureTrainMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Colony, Europe, Location, Unit$MoveType, CostDeciders, GoalDeciders, CollectionUtils, AIMessage, TransportMission;

/**
 * Mission for cashing in a treasure train.
 * FIXME: acquire protection
 * FIXME: Better avoidance of enemy units
 */
export class CashInTreasureTrainMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'cashInTreasureTrainMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI treasureTrain';
  /**
   * The location to cash this treasure train in at, either a Colony
   * or Europe.
   */
  target: Location = null;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The target {@code Location} for this mission.
   */
  _CashInTreasureTrainMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code CashInTreasureTrainMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _CashInTreasureTrainMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Assign a carrier for this treasure.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @return A suitable carrier {@code AIUnit}, to which this unit
   *     has been queued for transport.
   */
  assignCarrier(lb: LogBuilder): AIUnit {
    let aiUnit = this.getAIUnit();
    let unit = this.getUnit();
    let player = unit.getOwner();
    let europe = player.getEurope();
    let carriers = player.getCarriersForUnit(unit);
    if (carriers.isEmpty()) {
      return null;
    }
    let here = unit.getLocation();
    let comp = CollectionUtils.cachingIntComparator((u) => u.getTurnsToReach$Location(here));
    let closest = CollectionUtils.minimize$Collection$Comparator(carriers, comp);
    let aiMain = this.getAIMain();
    let tm: TransportMission;
    let aiCarrier: AIUnit;
    if (closest != null && (aiCarrier = aiMain.getAIUnit(closest)) != null && (tm = aiCarrier.getMission$Class($J.cls(TransportMission))) != null) {
      this.setTarget(europe);
      aiUnit.changeTransport(aiCarrier);
      if (tm.forceCollection(aiUnit, lb)) {
        lb.add([' forced collection on ', aiCarrier.getUnit()]);
        return aiCarrier;
      }
    }
    return null;
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
    let colony = loc.getColony();
    return (loc instanceof Europe && CashInTreasureTrainMission.invalidMissionReason$AIUnit$Location(aiUnit, loc) == null) ? loc : (colony != null && CashInTreasureTrainMission.invalidMissionReason$AIUnit$Location(aiUnit, colony) == null) ? colony : null;
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
    let loc: Location;
    if (path == null || (loc = CashInTreasureTrainMission.extractTarget(aiUnit, path)) == null || (loc instanceof Colony && CashInTreasureTrainMission.invalidFullColonyReason(aiUnit, loc.getColony()) != null)) {
      return -2147483648;
    }
    return $J.idiv(aiUnit.getUnit().getTreasureAmount(), ((path.getTotalTurns() + 1) | 0));
  }
  /**
   * Makes a goal decider that checks cash in sites.
   *
   * @param aiUnit The {@code AIUnit} to search with.
   * @param deferOK Keep track of the nearest colonies to use as a
   *     fallback destination.
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit, deferOK: boolean): GoalDecider {
    let gd = new (CashInTreasureTrainMission$1())().$c(aiUnit).$init_anon();
    return (deferOK) ? GoalDeciders.getComposedGoalDecider(false, [gd, GoalDeciders.getOurClosestSettlementGoalDecider()]) : gd;
  }
  /**
   * Find a suitable cash in location for this unit.
   *
   * @param aiUnit The {@code AIUnit} to execute this mission.
   * @param range The maximum number of moves to search.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A {@code PathNode} to the target, or null if not found
   *     which includes the case when Europe should be preferred (because
   *     the unit can not get there by itself).
   */
  static findTargetPath(aiUnit: AIUnit, range: number, deferOK: boolean): PathNode {
    if (Mission.invalidAIUnitReason(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let start = unit.getPathStartLocation();
    let player = unit.getOwner();
    let europe = player.getEurope();
    let carrier = unit.getCarrier();
    let standardCd = CostDeciders.avoidSettlementsAndBlockingUnits();
    if (!player.hasSettlements() || start == null) {
      return (europe == null) ? null : unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(unit.getLocation(), europe, carrier, standardCd, null);
    }
    return unit.search(start, CashInTreasureTrainMission.getGoalDecider(aiUnit, deferOK), standardCd, range, carrier);
  }
  /**
   * Finds a suitable cashin target for the supplied unit.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param range The maximum number of moves to search.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A {@code PathNode} to the target, or null if none found.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = CashInTreasureTrainMission.findTargetPath(aiUnit, range, deferOK);
    return (path != null) ? CashInTreasureTrainMission.extractTarget(aiUnit, path) : Location.upLoc(Mission.findCircleTarget(aiUnit, CashInTreasureTrainMission.getGoalDecider(aiUnit, deferOK), Math.imul(range, 3), deferOK));
  }
  /**
   * Why would this mission be invalid with the given unit?
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason why the mission would be invalid with the unit,
   *     or null if none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    if (reason != null) {
      return reason;
    }
    let unit = aiUnit.getUnit();
    return (!unit.canCarryTreasure()) ? 'unit-cannot-carry-treasure' : (unit.getTreasureAmount() <= 0) ? 'unit-treasure-nonpositive' : null;
  }
  /**
   * Why is this mission invalid with a given colony target, given that
   * intermediate colonies are excluded.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param colony The potential target {@code Colony}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidFullColonyReason(aiUnit: AIUnit, colony: Colony): string {
    let reason = Mission.invalidTargetReason$Location$Player(colony, aiUnit.getUnit().getOwner());
    return (reason != null) ? reason : (!aiUnit.getUnit().canCashInTreasureTrain$Location(colony.getTile$())) ? 'cashin-impossible-at-location' : null;
  }
  /**
   * Why is this mission invalid with a given colony target, given that
   * intermediate colonies are included.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param colony The potential target {@code Colony}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidColonyReason(aiUnit: AIUnit, colony: Colony): string {
    return Mission.invalidTargetReason$Location$Player(colony, aiUnit.getUnit().getOwner());
  }
  /**
   * Why is this mission invalid with a given Europe target?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param europe The potential target {@code Europe}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidEuropeReason(aiUnit: AIUnit, europe: Europe): string {
    return Mission.invalidTargetReason$Location$Player(europe, aiUnit.getUnit().getOwner());
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return CashInTreasureTrainMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = CashInTreasureTrainMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Colony) ? CashInTreasureTrainMission.invalidColonyReason(aiUnit, loc) : (loc instanceof Europe) ? CashInTreasureTrainMission.invalidEuropeReason(aiUnit, loc) : Mission.TARGETINVALID;
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return this.getUnit().getTreasureAmount();
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
    if (target == null || target instanceof Europe || target instanceof Colony) {
      this.target = target;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return CashInTreasureTrainMission.findMissionTarget(this.getAIUnit(), 20, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return CashInTreasureTrainMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.target);
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([CashInTreasureTrainMission.tag]);
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    for (; ; ) {
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
      let aiUnit = this.getAIUnit();
      let europe = this.getUnit().getOwner().getEurope();
      if (unit.canCashInTreasureTrain$()) {
        let aiCarrier = null;
        let cashin = europe == null || unit.isInEurope() || unit.getTransportFee() === 0;
        if (!cashin && aiUnit.getTransport() == null) {
          cashin = this.assignCarrier(lb) == null;
        }
        if (cashin) {
          return (AIMessage.askCashInTreasureTrain(aiUnit)) ? this.lbDone(lb, false, ['cashed in']) : this.lbFail(lb, false, ['cashin']);
        }
      }
      return this.retargetMission('transport expected', lb);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(CashInTreasureTrainMission.TARGET_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), CashInTreasureTrainMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return CashInTreasureTrainMission.TAG;
  }
  static $clinit() {
    CashInTreasureTrainMission.logger = Logger.getLogger($J.cls(CashInTreasureTrainMission).getName());
  }
}

let $CashInTreasureTrainMission$1: any = null;
/** An anonymous class (CashInTreasureTrainMission.java:183). */
function CashInTreasureTrainMission$1(): any {
  return $CashInTreasureTrainMission$1 ??= $J.local(class extends JObject {
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
      let loc = CashInTreasureTrainMission.extractTarget(this.$cv_aiUnit, path);
      if ((loc instanceof Colony && CashInTreasureTrainMission.invalidFullColonyReason(this.$cv_aiUnit, loc) == null) || loc instanceof Europe) {
        let value = CashInTreasureTrainMission.scorePath(this.$cv_aiUnit, path);
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
  }, 'net.sf.freecol.server.ai.mission.CashInTreasureTrainMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(CashInTreasureTrainMission, 'net.sf.freecol.server.ai.mission.CashInTreasureTrainMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_CashInTreasureTrainMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_CashInTreasureTrainMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
});
