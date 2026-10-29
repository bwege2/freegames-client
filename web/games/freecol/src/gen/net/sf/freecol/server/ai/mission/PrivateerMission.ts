// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/PrivateerMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Colony, Europe, Settlement, Tile, Unit, Unit$MoveType, CostDeciders, AIMessage;

/**
 * A mission for a Privateer unit.
 */
export class PrivateerMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'privateerMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI privateer';
  /**
   * The target for this mission.
   * - A port location to drop off plunder
   * - A unit to attack
   * - An unexplored tile
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
  _PrivateerMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
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
  _PrivateerMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
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
    let unit = aiUnit.getUnit();
    let owner = unit.getOwner();
    let loc = path.getLastNode().getLocation();
    let settlement = loc.getSettlement();
    let tile = loc.getTile$();
    let other = (tile == null) ? null : tile.getDefendingUnit(unit);
    return (loc instanceof Europe) ? loc : (other != null && PrivateerMission.invalidMissionReason$AIUnit$Location(aiUnit, other) == null) ? other : (settlement != null && Mission.invalidTargetReason$Location$Player(settlement, owner) == null) ? settlement : null;
  }
  /**
   * Score a potential attack on a unit.
   *
   * @param aiUnit The {@code AIUnit} that may attack.
   * @param defender The {@code Unit} to attack.
   * @return A score for the attack.
   */
  static scoreUnit(aiUnit: AIUnit, defender: Unit): number {
    let attacker = aiUnit.getUnit();
    let value = 100;
    value = (value + Math.imul(defender.getVisibleGoodsCount(), 200)) | 0;
    if (defender.isOffensiveUnit()) {
      let co = attacker.getGame().getCombatModel().calculateCombatOdds$FreeColGameObject$FreeColGameObject(attacker, defender);
      if (co != null) {
        value = (value + $J.d2i(((co.win - 0.5) * 200))) | 0;
      }
    }
    return value;
  }
  /**
   * Evaluate a potential mission for a given unit and path.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path A {@code PathNode} to take to the target.
   * @return A score for the proposed mission.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode): number {
    let loc = PrivateerMission.extractTarget(aiUnit, path);
    let totalTurns = (path.getTotalTurns() + 1) | 0;
    if (loc instanceof Europe || loc instanceof Colony) {
      return $J.idiv(1000, totalTurns);
    } else if (loc instanceof Unit) {
      return $J.idiv(PrivateerMission.scoreUnit(aiUnit, loc), totalTurns);
    } else if (loc instanceof Tile) {
      return $J.idiv(50, totalTurns);
    } else {
      return -2147483648;
    }
  }
  /**
   * Gets a {@code GoalDecider} for this mission.
   *
   * @param aiUnit The {@code AIUnit} that is searching.
   * @param deferOK Enable colony fallback (not implemented).
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit, deferOK: boolean): GoalDecider {
    return new (PrivateerMission$1())().$c(aiUnit).$init_anon();
  }
  /**
   * Finds a suitable privateering target for the supplied unit.
   *
   * @param aiUnit The {@code AIUnit} to find a path for.
   * @param range The maximum number of turns to seek for a target.
   * @param deferOK Not implemented in this mission.
   * @return A path to the new target.
   */
  static findTargetPath(aiUnit: AIUnit, range: number, deferOK: boolean): PathNode {
    if (Mission.invalidAIUnitReason(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let start = unit.getPathStartLocation();
    return unit.search(start, PrivateerMission.getGoalDecider(aiUnit, deferOK), CostDeciders.avoidIllegal(), range, null);
  }
  /**
   * Finds a suitable privateering target for the supplied unit.
   *
   * @param aiUnit The {@code AIUnit} to find a path for.
   * @param range The maximum number of turns to seek for a target.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A {@code PathNode} to the target, or null if none found.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = PrivateerMission.findTargetPath(aiUnit, range, deferOK);
    return (path != null) ? PrivateerMission.extractTarget(aiUnit, path) : null;
  }
  /**
   * Why would a PrivateeringMission be invalid with the given unit.
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
    return (!unit.isCarrier()) ? 'unit-not-a-carrier' : (!unit.isOffensiveUnit()) ? Mission.UNITNOTOFFENSIVE : (!unit.isEmpty() || !unit.getCompactGoodsList().isEmpty()) ? 'unit-has-cargo' : null;
  }
  /**
   * Is this a valid target because it is one of our colonies.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param settlement The {@code Settlement} to test.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidSettlementReason(aiUnit: AIUnit, settlement: Settlement): string {
    return (settlement instanceof Colony) ? Mission.invalidTargetReason$Location$Player(settlement, aiUnit.getUnit().getOwner()) : Mission.TARGETINVALID;
  }
  /**
   * Is this a valid target because it is a hostile unit.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param unit The {@code Unit} to test.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidAttackReason(aiUnit: AIUnit, unit: Unit): string {
    let player = aiUnit.getUnit().getOwner();
    let reason: string;
    return (unit == null) ? Mission.TARGETINVALID : (!unit.isNaval()) ? 'privateer-ignores-land-unit' : (player.owns(unit)) ? Mission.TARGETOWNERSHIP : ((reason = Mission.invalidAttackReason(aiUnit, unit.getOwner())) != null) ? reason : (PrivateerMission.scoreUnit(aiUnit, unit) <= 0) ? 'privateer-avoids-trouble' : null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return PrivateerMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let owner = aiUnit.getUnit().getOwner();
    let reason = PrivateerMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (aiUnit.getUnit().isInEurope()) ? null : (loc == null) ? null : (loc instanceof Europe) ? Mission.invalidTargetReason$Location$Player(loc, owner) : (loc instanceof Settlement) ? PrivateerMission.invalidSettlementReason(aiUnit, loc) : (loc instanceof Unit) ? PrivateerMission.invalidAttackReason(aiUnit, loc) : (loc instanceof Tile) ? (((loc).isExploredBy(owner)) ? 'tile-is-explored' : null) : Mission.TARGETINVALID;
  }
  /**
   * {@inheritDoc}
   */
  getTransportDestination(): Location {
    return null;
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
    if (target == null || target instanceof Colony || target instanceof Europe || target instanceof Unit) {
      this.target = target;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return PrivateerMission.findMissionTarget(this.getAIUnit(), 8, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return PrivateerMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([PrivateerMission.tag]);
    let aiUnit = this.getAIUnit();
    if (aiUnit.hasCargo()) {
      let m = this.getEuropeanAIPlayer().getTransportMission(aiUnit);
      return this.lbDone(lb, m != null, [' transporting']);
    }
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let unit = this.getUnit();
    if (unit.isInEurope()) {
      let settlement = Mission.getBestSettlement(unit.getOwner());
      let tile = (settlement != null) ? settlement.getTile$() : unit.getFullEntryLocation();
      unit.setDestination(tile);
      aiUnit.moveToAmerica();
    }
    if (unit.isAtSea()) {
      return this.lbAt(lb);
    }
    let newTarget = PrivateerMission.findMissionTarget(aiUnit, 1, true);
    if (newTarget == null) {
      this.moveRandomlyTurn(PrivateerMission.tag);
      return this.lbAt(lb);
    }
    this.setTarget(newTarget);
    let mt = this.travelToTarget(newTarget, null, lb);
    {
      let direction: Direction;
      switch (mt) {
        case Unit$MoveType.MOVE:
          break;
        case Unit$MoveType.MOVE_HIGH_SEAS:
        case Unit$MoveType.MOVE_NO_MOVES:
        case Unit$MoveType.MOVE_ILLEGAL:
          return this.lbWait(lb, []);
        case Unit$MoveType.MOVE_NO_REPAIR:
          return this.lbFail(lb, false, [Mission.AIUNITDIED]);
        case Unit$MoveType.MOVE_NO_TILE:
          this.moveRandomly(PrivateerMission.tag, null);
          return this.lbDodge(lb);
        case Unit$MoveType.ATTACK_UNIT:
          direction = unit.getTile$().getDirection(this.getTarget().getTile$());
          if (direction != null) {
            AIMessage.askAttack(aiUnit, direction);
            this.lbAttack(lb, this.getTarget());
          } else {
            let blocker = Mission.resolveBlockage(aiUnit, this.getTarget());
            if (blocker instanceof Unit && PrivateerMission.scoreUnit(aiUnit, blocker) > 0) {
              AIMessage.askAttack(aiUnit, unit.getTile$().getDirection(blocker.getTile$()));
              this.lbAttack(lb, blocker);
            } else {
              this.moveRandomlyTurn(PrivateerMission.tag);
              lb.add([' avoiding ', blocker, '.']);
            }
          }
          return this;
        case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
        default:
          return this.lbMove(lb, mt);
      }
    }
    return this.lbAt(lb);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(PrivateerMission.TARGET_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), PrivateerMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return PrivateerMission.TAG;
  }
  static $clinit() {
    PrivateerMission.logger = Logger.getLogger($J.cls(PrivateerMission).getName());
  }
}

let $PrivateerMission$1: any = null;
/** An anonymous class (PrivateerMission.java:173). */
function PrivateerMission$1(): any {
  return $PrivateerMission$1 ??= $J.local(class extends JObject {
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
      let value = PrivateerMission.scorePath(this.$cv_aiUnit, path);
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
  }, 'net.sf.freecol.server.ai.mission.PrivateerMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(PrivateerMission, 'net.sf.freecol.server.ai.mission.PrivateerMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_PrivateerMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_PrivateerMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Location' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
