// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/UnitSeekAndDestroyMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Colony, IndianSettlement, Settlement, Unit, Unit$MoveType, CostDeciders, CollectionUtils, AIMessage, EuropeanAIPlayer;

/**
 * Mission for attacking a specific target, be it a Unit or a Settlement.
 */
export class UnitSeekAndDestroyMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'unitSeekAndDestroyMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI seek+destroyer';
  /**
   * The object we are trying to destroy. This can be a
   * either {@code Settlement} or a {@code Unit}.
   */
  target: Location = null;
  /**
   * The object we are trying to destroy. This can be a
   * either {@code Settlement} or a {@code Unit}.
   */
  transportTarget: Location = null;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The object we are trying to destroy.  This can be
   *     either a {@code Settlement} or a {@code Unit}.
   */
  _UnitSeekAndDestroyMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code UnitSeekAndDestroyMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _UnitSeekAndDestroyMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Extract a valid target for this mission from a path.
   *
   * @param aiUnit The {@code AIUnit} to perform the mission.
   * @param path A {@code PathNode} to extract a target from.
   * @return A target for this mission, or null if none found.
   */
  static extractTarget(aiUnit: AIUnit, path: PathNode): Location {
    let loc = (path == null) ? null : path.getLastNode().getLocation();
    let t: Tile;
    let u: Unit;
    return (loc == null || aiUnit == null || aiUnit.getUnit() == null) ? null : (UnitSeekAndDestroyMission.invalidSettlementReason(aiUnit, loc.getSettlement()) == null) ? loc.getSettlement() : ((t = loc.getTile$()) != null && (UnitSeekAndDestroyMission.invalidTargetReason(aiUnit, u = t.getDefendingUnit(aiUnit.getUnit()))) == null) ? u : null;
  }
  /**
   * Scores a potential attack on a settlement.
   *
   * Do not cheat and look inside the settlement.
   * Just use visible facts about it.
   *
   * FIXME: if we are the REF and there is a significant Tory
   * population inside, assume traitors have briefed us.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path The {@code PathNode} to take to the settlement.
   * @param settlement The {@code Settlement} to attack.
   * @return A score of the desirability of the mission.
   */
  static scoreSettlementPath(aiUnit: AIUnit, path: PathNode, settlement: Settlement): number {
    if (UnitSeekAndDestroyMission.invalidSettlementReason(aiUnit, settlement) != null) {
      return -2147483648;
    }
    let unit = aiUnit.getUnit();
    let combatModel = unit.getGame().getCombatModel();
    let value = 1020;
    value = (value - Math.imul(path.getTotalTurns(), 100)) | 0;
    let off = combatModel.getOffencePower$FreeColGameObject$FreeColGameObject(unit, settlement);
    value = (value + (($J.round(off * 50)) | 0)) | 0;
    value = settlement.calculateSettlementValue(value, unit);
    return (aiUnit.getAIOwner()).adjustMission(aiUnit, path, $J.cls(UnitSeekAndDestroyMission), value);
  }
  /**
   * Scores a potential attack on a unit.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path The {@code PathNode} to take to the settlement.
   * @param defender The {@code Unit} to attack.
   * @return A score of the desirability of the mission.
   */
  static scoreUnitPath(aiUnit: AIUnit, path: PathNode, defender: Unit): number {
    if (UnitSeekAndDestroyMission.invalidMissionReason$AIUnit$Location(aiUnit, defender) != null) {
      return -2147483648;
    }
    let unit = aiUnit.getUnit();
    let tile = path.getLastNode().getTile();
    let turns = path.getTotalTurns();
    let combatModel = unit.getGame().getCombatModel();
    let off = combatModel.getOffencePower$FreeColGameObject$FreeColGameObject(unit, defender);
    let def = combatModel.getDefencePower$FreeColGameObject$FreeColGameObject(unit, defender);
    if (tile == null || off <= 0) {
      return -2147483648;
    }
    let value = (1020 - Math.imul(turns, 100)) | 0;
    value = (value + $J.d2i((100 * (off - def)))) | 0;
    value = (value + Math.imul(1000, CollectionUtils.count$Stream$Predicate(tile.getUnits(), (u) => u.canCarryTreasure() && u.getTreasureAmount() > 0))) | 0;
    if (defender.isNaval()) {
      if (tile.isLand()) {
        value = (value + 500) | 0;
      }
    } else {
      if (defender.hasAbility$String(Ability.EXPERT_SOLDIER) && !defender.isArmed()) {
        value = (value + 100) | 0;
      }
    }
    return (aiUnit.getAIOwner()).adjustMission(aiUnit, path, $J.cls(UnitSeekAndDestroyMission), value);
  }
  /**
   * Evaluate a potential seek and destroy mission for a given unit
   * to a given tile.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path A {@code PathNode} to take to the target.
   * @return A score for the proposed mission.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode, onlySettlements: boolean, noNativeSettlements: boolean): number {
    let loc = UnitSeekAndDestroyMission.extractTarget(aiUnit, path);
    if (loc instanceof Settlement) {
      if (noNativeSettlements && (loc instanceof IndianSettlement)) {
        return -2147483648;
      }
      return UnitSeekAndDestroyMission.scoreSettlementPath(aiUnit, path, loc);
    }
    if (onlySettlements) {
      return -2147483648;
    }
    if (loc instanceof Unit) {
      UnitSeekAndDestroyMission.scoreUnitPath(aiUnit, path, loc);
    }
    return -2147483648;
  }
  /**
   * Gets a {@code GoalDecider} for finding the best colony
   * {@code Tile}, optionally falling back to the nearest colony.
   *
   * @param aiUnit The {@code AIUnit} that is searching.
   * @param onlySettlements Only have settlements as targets.
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit, onlySettlements: boolean, noNativeSettlements: boolean): GoalDecider {
    return new (UnitSeekAndDestroyMission$1())().$c(aiUnit, onlySettlements, noNativeSettlements).$init_anon();
  }
  /**
   * Finds a suitable seek-and-destroy target path for an AI unit.
   *
   * @param aiUnit The {@code AIUnit} to find a target for.
   * @param range An upper bound on the number of moves.
   * @param onlySettlements Only have settlements as targets.
   * @return A path to the target, or null if none found.
   */
  static findTargetPath(aiUnit: AIUnit, range: number, onlySettlements: boolean, noNativeSettlements: boolean): PathNode {
    if (Mission.invalidAIUnitReason(aiUnit) != null) {
      return null;
    }
    let unit = aiUnit.getUnit();
    let start = unit.getPathStartLocation();
    return unit.search(start, UnitSeekAndDestroyMission.getGoalDecider(aiUnit, onlySettlements, noNativeSettlements), CostDeciders.avoidIllegal(), range, unit.getCarrier());
  }
  /**
   * Finds a suitable seek-and-destroy target for an AI unit.
   *
   * @param aiUnit The {@code AIUnit} to find a target for.
   * @param range An upper bound on the number of moves.
   * @param onlySettlements Only have settlements as targets.
   * @return A suitable target, or null if none found.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, onlySettlements: boolean, noNativeSettlements: boolean): Location {
    let path = UnitSeekAndDestroyMission.findTargetPath(aiUnit, range, onlySettlements, noNativeSettlements);
    return (path != null) ? UnitSeekAndDestroyMission.extractTarget(aiUnit, path) : null;
  }
  /**
   * Why would a UnitSeekAndDestroyMission be invalid with the given unit.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    return (reason != null) ? reason : (!aiUnit.getUnit().isOffensiveUnit()) ? Mission.UNITNOTOFFENSIVE : (aiUnit.getUnit().hasAbility$String(Ability.SPEAK_WITH_CHIEF)) ? 'scouts-should-not-seek-and-destroy' : null;
  }
  /**
   * Why would a UnitSeekAndDestroyMission be invalid with the given unit
   * and settlement.
   *
   * @param aiUnit The {@code AIUnit} to seek-and-destroy with.
   * @param settlement The {@code Settlement} to test.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidSettlementReason(aiUnit: AIUnit, settlement: Settlement): string {
    let reason = Mission.invalidTargetReason$Location(settlement);
    if (reason != null) {
      return reason;
    }
    let unit = aiUnit.getUnit();
    return (unit.isNaval()) ? 'unit-is-naval' : (settlement.getOwner() === unit.getOwner()) ? Mission.TARGETOWNERSHIP : Mission.invalidAttackReason(aiUnit, settlement.getOwner());
  }
  /**
   * Why would a UnitSeekAndDestroyMission be invalid with the given unit
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
    return (tile == null) ? 'target-not-on-map' : (aiUnit.getUnit().getOwner() === unit.getOwner()) ? Mission.TARGETOWNERSHIP : (tile.hasSettlement()) ? 'target-in-settlement' : (!aiUnit.getUnit().isTileAccessible(tile)) ? 'target-incompatible' : Mission.invalidAttackReason(aiUnit, unit.getOwner());
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return UnitSeekAndDestroyMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = UnitSeekAndDestroyMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Settlement) ? UnitSeekAndDestroyMission.invalidSettlementReason(aiUnit, loc) : (loc instanceof Unit) ? UnitSeekAndDestroyMission.invalidTargetReason(aiUnit, loc) : Mission.TARGETINVALID;
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return (Mission.NORMAL_TRANSPORT_PRIORITY - 5) | 0;
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
    if (target == null || target instanceof Unit || target instanceof Settlement) {
      this.target = target;
      let unit = this.getUnit();
      this.transportTarget = null;
      if (unit.shouldTakeTransportTo(target) && (target instanceof Settlement)) {
        let settlement = target;
        if (settlement.isConnectedPort()) {
          this.transportTarget = settlement.getTile$().getBestDisembarkTile(unit.getOwner());
          UnitSeekAndDestroyMission.logger.finest(UnitSeekAndDestroyMission.tag + ' chose dropoff ' + $J.str(this.transportTarget) + ' for attack on ' + ((settlement.canBombardEnemyShip()) ? 'hazardous' : 'normal') + ' settlement ' + settlement.getName() + ': ' + $J.str(this));
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return UnitSeekAndDestroyMission.findMissionTarget(this.getAIUnit(), 4, false, false);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return UnitSeekAndDestroyMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([UnitSeekAndDestroyMission.tag]);
    let aiUnit = this.getAIUnit();
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      let colony: Colony;
      let m: Mission;
      if ($J.equals(Mission.TARGETOWNERSHIP, reason) && this.getTarget() instanceof Colony && (colony = this.getTarget()) != null && this.getPlayer().owns(colony) && (m = this.getAIPlayer().getDefendSettlementMission$AIUnit$Settlement(aiUnit, colony)) != null) {
        return this.lbDone(lb, true, [' capturing colony ', colony.getName()]);
      }
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let noNativeSettlementsAttack = this.getAIPlayer() != null && (this.getAIPlayer() instanceof EuropeanAIPlayer) && !(this.getAIPlayer()).isLikesAttackingNatives();
    let unit = this.getUnit();
    let nearbyTarget = (unit.isOnCarrier()) ? null : UnitSeekAndDestroyMission.findMissionTarget(aiUnit, 1, false, noNativeSettlementsAttack);
    if (nearbyTarget != null) {
      if (this.getTarget() == null) {
        this.setTarget(nearbyTarget);
        return this.lbRetarget(lb);
      }
      if (nearbyTarget === this.getTarget()) {
        nearbyTarget = null;
      } else {
        let now = unit.getTile$();
        let nearbyTile = nearbyTarget.getTile$();
        let targetTile = this.getTarget().getTile$();
        if (now != null && nearbyTile != null && targetTile != null && (now.getDistanceTo(nearbyTile) >= now.getDistanceTo(targetTile))) {
          nearbyTarget = null;
        } else {
          lb.add([', found target of opportunity ', nearbyTarget]);
        }
      }
    }
    let currentTarget = (nearbyTarget != null) ? nearbyTarget : this.getTarget();
    let mt = this.travelToTarget(currentTarget, CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
    {
      let unitTile: Tile, settlement: Settlement, d: Direction;
      switch (mt) {
        case Unit$MoveType.MOVE_HIGH_SEAS:
        case Unit$MoveType.MOVE_NO_MOVES:
        case Unit$MoveType.MOVE_ILLEGAL:
          return this.lbWait(lb, []);
        case Unit$MoveType.MOVE_NO_REPAIR:
          return this.lbFail(lb, false, [Mission.AIUNITDIED]);
        case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
        case Unit$MoveType.MOVE_NO_TILE:
          return this;
        case Unit$MoveType.ATTACK_UNIT:
        case Unit$MoveType.ATTACK_SETTLEMENT:
          unitTile = unit.getTile$();
          settlement = unitTile.getSettlement();
          if (settlement != null && settlement.getUnitCount() < 2) {
            let m = this.getAIPlayer().getDefendSettlementMission$AIUnit$Settlement(aiUnit, settlement);
            return this.lbDone(lb, m != null, [' desperate defence of ', settlement]);
          }
          d = unitTile.getDirection(currentTarget.getTile$());
          if (d == null) {
            UnitSeekAndDestroyMission.logger.warning('SDDM bogus ' + $J.str(mt) + ' with ' + $J.str(unit) + ' from ' + $J.str(unitTile) + ' to ' + $J.str(currentTarget) + ' at ' + $J.str(currentTarget.getTile$()));
            return this.lbWait(lb, []);
          }
          AIMessage.askAttack(aiUnit, d);
          return this.lbAttack(lb, currentTarget);
        default:
          return this.lbMove(lb, mt);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(UnitSeekAndDestroyMission.TARGET_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), UnitSeekAndDestroyMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitSeekAndDestroyMission.TAG;
  }
  static $clinit() {
    UnitSeekAndDestroyMission.logger = Logger.getLogger($J.cls(UnitSeekAndDestroyMission).getName());
  }
}

let $UnitSeekAndDestroyMission$1: any = null;
/** An anonymous class (UnitSeekAndDestroyMission.java:233). */
function UnitSeekAndDestroyMission$1(): any {
  return $UnitSeekAndDestroyMission$1 ??= $J.local(class extends JObject {
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
      let value = UnitSeekAndDestroyMission.scorePath(this.$cv_aiUnit, path, this.$cv_onlySettlements, this.$cv_noNativeSettlements);
      if (this.bestValue < value) {
        this.bestValue = value;
        this.bestPath = path;
        return true;
      }
      return false;
    }
    $c($aiUnit, $onlySettlements, $noNativeSettlements): this {
      this.$cv_aiUnit = $aiUnit; this.$cv_onlySettlements = $onlySettlements; this.$cv_noNativeSettlements = $noNativeSettlements;
      return this;
    }
  }, 'net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(UnitSeekAndDestroyMission, 'net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_UnitSeekAndDestroyMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_UnitSeekAndDestroyMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  EuropeanAIPlayer = $J.load('net.sf.freecol.server.ai.EuropeanAIPlayer');
});
