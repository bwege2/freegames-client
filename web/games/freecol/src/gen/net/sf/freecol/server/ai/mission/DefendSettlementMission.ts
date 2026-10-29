// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/DefendSettlementMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Colony, Direction, Settlement, Unit$MoveType, Unit$UnitState, CostDeciders, AIMessage;

/**
 * Mission for defending a {@code Settlement}.
 */
export class DefendSettlementMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'defendSettlementMission';
  /**
   * The tag for this mission.
   */
  tag_: string = null;
  /**
   * Maximum number of turns to travel to the settlement.
   */
  static readonly MAX_TURNS: number = 20;
  /**
   * The settlement to be protected.
   */
  target: Location = null;
  static readonly SETTLEMENT_TAG: string = 'settlement';
  $init_DefendSettlementMission() {
    this.tag_ = 'AI defender';
  }
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission
   *        is created for.
   * @param settlement The {@code Settlement} to defend.
   */
  _DefendSettlementMission$AIMain$AIUnit$Settlement(aiMain: AIMain, aiUnit: AIUnit, settlement: Settlement): this {
    this._Mission(aiMain, aiUnit);
    this.$init_DefendSettlementMission();
    this.setTarget(settlement);
    return this;
  }
  /**
   * Creates a new {@code DefendSettlementMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _DefendSettlementMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.$init_DefendSettlementMission();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Extract a valid target for this mission from a path.
   *
   * @param aiUnit The {@code AIUnit} to perform the mission.
   * @param path A {@code PathNode} to extract a target from.
   * @return A target for a {@code DefendSettlementMission}, or null
   *     if none found.
   */
  static extractTarget(aiUnit: AIUnit, path: PathNode): Location {
    if (path == null) {
      return null;
    }
    let loc = path.getLastNode().getLocation();
    let settlement = loc.getSettlement();
    return (DefendSettlementMission.invalidSettlementReason(aiUnit, settlement) == null) ? settlement : null;
  }
  /**
   * Evaluate allocating a unit to the defence of a settlement.
   *
   * @param aiUnit The {@code AIUnit} that is to defend.
   * @param path A {@code PathNode} to take to the settlement.
   * @return A value for such a mission.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode): number {
    let loc = DefendSettlementMission.extractTarget(aiUnit, path);
    return (loc instanceof Settlement) ? (aiUnit.getAIOwner()).adjustMission(aiUnit, path, $J.cls(DefendSettlementMission), $J.d2i((1000 * (loc).getDefenceRatio() / ((path.getTotalTurns() + 1) | 0)))) : -2147483648;
  }
  /**
   * Gets a {@code GoalDecider} for finding the best colony
   * {@code Tile}, optionally falling back to the nearest colony.
   *
   * @param aiUnit The {@code AIUnit} that is searching.
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit): GoalDecider {
    return new (DefendSettlementMission$1())().$c(aiUnit).$init_anon();
  }
  /**
   * Finds a path to the best nearby settlement to defend.
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
    return unit.search(start, DefendSettlementMission.getGoalDecider(aiUnit), CostDeciders.avoidSettlementsAndBlockingUnits(), range, unit.getCarrier());
  }
  /**
   * Finds a path to the best nearby settlement to defend.
   *
   * @param aiUnit The {@code AIUnit} that is searching.
   * @param range An upper bound on the number of moves.
   * @param deferOK Enables deferral (not implemented in this mission).
   * @return A suitable target, or null if none found.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = DefendSettlementMission.findTargetPath(aiUnit, range, deferOK);
    return (path != null) ? DefendSettlementMission.extractTarget(aiUnit, path) : null;
  }
  /**
   * Why would a DefendSettlementMission be invalid with the given unit?
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
    let cm = unit.getGame().getCombatModel();
    return (cm.getDefencePower$FreeColGameObject$FreeColGameObject(null, unit) <= 0) ? 'unit-not-defender' : null;
  }
  /**
   * Why is this mission invalid with a given settlement target?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param settlement The potential target {@code Settlement}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidSettlementReason(aiUnit: AIUnit, settlement: Settlement): string {
    return Mission.invalidTargetReason$Location$Player(settlement, aiUnit.getUnit().getOwner());
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    let reason = DefendSettlementMission.invalidUnitReason(aiUnit);
    if (reason != null) {
      return reason;
    }
    if (!aiUnit.getUnit().getOwner().hasSettlements()) {
      return Mission.TARGETNOTFOUND;
    }
    if (aiUnit.getUnit().getOwner().isIndian()) {
      return null;
    }
    if (!aiUnit.getUnit().isDefensiveUnit() || aiUnit.getUnit().hasAbility$String(Ability.SPEAK_WITH_CHIEF)) {
      return Mission.UNITNOTOFREQUIREDTYPE;
    }
    return null;
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = DefendSettlementMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Settlement) ? DefendSettlementMission.invalidSettlementReason(aiUnit, loc) : Mission.TARGETINVALID;
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return (Mission.NORMAL_TRANSPORT_PRIORITY + 5) | 0;
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
    return DefendSettlementMission.findMissionTarget(this.getAIUnit(), 4, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return DefendSettlementMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([this.tag_]);
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
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
    let aiMain = this.getAIMain();
    let aiUnit = this.getAIUnit();
    let m = null;
    if (this.getTarget() instanceof Colony) {
      let colony = this.getTarget();
      if (unit.isInColony() || (unit.isPerson() && colony.getUnitCount() < 1)) {
        m = this.getEuropeanAIPlayer().getWorkInsideColonyMission(aiUnit, aiMain.getAIColony(colony));
        return this.lbDone(lb, m != null, ['bolster ', colony]);
      }
    }
    switch (unit.getState()) {
      case Unit$UnitState.FORTIFIED:
        return this.lbWait(lb, [', fortified']);
      case Unit$UnitState.FORTIFYING:
        return this.lbWait(lb, [', fortifying']);
      default:
        break;
    }
    let settlement = this.getTarget();
    let defenderCount = 0;
    let fortifyCount = 0;
    for (const $it0 = settlement.getAllUnitsList().iterator(); $it0.hasNext(); ) {
      let u = $it0.next();
      let aiu = this.getAIMain().getAIUnit(u);
      if (DefendSettlementMission.invalidMissionReason$AIUnit(aiu) == null) {
        defenderCount++;
        switch (u.getState()) {
          case Unit$UnitState.FORTIFIED:
          case Unit$UnitState.FORTIFYING:
            fortifyCount++;
            break;
          default:
            break;
        }
      }
    }
    if (defenderCount <= 2 || fortifyCount <= 1) {
      return (!unit.checkSetState(Unit$UnitState.FORTIFYING)) ? this.lbWait(lb, [', waiting to fortify at ', settlement]) : (AIMessage.askChangeState(aiUnit, Unit$UnitState.FORTIFYING) && unit.getState() === Unit$UnitState.FORTIFYING) ? this.lbWait(lb, [', now fortifying at ', settlement]) : this.lbFail(lb, false, [', fortify failed at ', settlement]);
    }
    if (!unit.isOffensiveUnit()) {
      return this.lbFail(lb, false, ['not-offensive-unit']);
    }
    let cm = unit.getGame().getCombatModel();
    let bestTarget = null;
    let bestDifference = 4.9E-324;
    let bestDirection = null;
    for (let d of Direction.getRandomDirections('defendSettlements', DefendSettlementMission.logger, this.getAIRandom())) {
      let t = unit.getTile$().getNeighbourOrNull(d);
      if (t == null) {
        continue;
      }
      let defender = t.getFirstUnit();
      if (defender != null && defender.getOwner().atWarWith(unit.getOwner()) && unit.getMoveType$Direction(d).isAttack()) {
        let enemyUnit = t.getDefendingUnit(unit);
        let enemyAttack = cm.getOffencePower$FreeColGameObject$FreeColGameObject(enemyUnit, unit);
        let weAttack = cm.getOffencePower$FreeColGameObject$FreeColGameObject(unit, enemyUnit);
        let enemyDefend = cm.getDefencePower$FreeColGameObject$FreeColGameObject(unit, enemyUnit);
        let weDefend = cm.getDefencePower$FreeColGameObject$FreeColGameObject(enemyUnit, unit);
        let difference = weAttack / (weAttack + enemyDefend) - enemyAttack / (enemyAttack + weDefend);
        if (difference > bestDifference) {
          if (difference > 0 || weAttack > enemyDefend) {
            bestDifference = difference;
            bestTarget = enemyUnit;
            bestDirection = d;
          }
        }
      }
    }
    if (bestTarget != null) {
      AIMessage.askAttack(this.getAIUnit(), bestDirection);
      return this.lbAttack(lb, bestTarget);
    }
    return this.lbWait(lb, [', alert at ', this.getTarget()]);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(DefendSettlementMission.SETTLEMENT_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getAttribute$Game$String$Class$FreeColObject(this.getGame(), DefendSettlementMission.SETTLEMENT_TAG, $J.cls(Settlement), null);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return DefendSettlementMission.TAG;
  }
  static $clinit() {
    DefendSettlementMission.logger = Logger.getLogger($J.cls(DefendSettlementMission).getName());
  }
}

let $DefendSettlementMission$1: any = null;
/** An anonymous class (DefendSettlementMission.java:141). */
function DefendSettlementMission$1(): any {
  return $DefendSettlementMission$1 ??= $J.local(class extends JObject {
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
      let value = DefendSettlementMission.scorePath(this.$cv_aiUnit, path);
      if (this.bestValue < value) {
        this.bestValue = value;
        this.bestPath = path;
        return true;
      }
      return false;
    }
    $c($aiUnit): this {
      this.$cv_aiUnit = $aiUnit;
      return this;
    }
  }, 'net.sf.freecol.server.ai.mission.DefendSettlementMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(DefendSettlementMission, 'net.sf.freecol.server.ai.mission.DefendSettlementMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_DefendSettlementMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Settlement': '_DefendSettlementMission$AIMain$AIUnit$Settlement' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
