// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/PioneeringMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator, JObject, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let DebugUtils, Messages, Ability, Colony, Constants, Location, Map_, Tile, Unit$MoveType, Unit$UnitState, CostDeciders, GoalDeciders, CollectionUtils, AIMessage, TileImprovementPlan;

/**
 * Mission for controlling a pioneer.
 */
export class PioneeringMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'pioneeringMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI pioneer';
  /**
   * Default distance in turns to a threatening unit.
   */
  static readonly DEFAULT_THREAT_TURNS: number = 3;
  /**
   * The improvement this pioneer is to work on.
   */
  tileImprovementPlan: TileImprovementPlan = null;
  /**
   * The target location to go to:
   *   - a tile where the tileImprovement is
   *   - a colony to go to to equip
   *   - just an initial colony to retarget from
   */
  target: Location = null;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a pioneering mission for the given {@code AIUnit}.
   * Note that PioneeringMission.isValid(aiUnit) should be called
   * before this, to guarantee that
   * findTileImprovementPlan/findColonyWithTools succeed.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The target {@code Location}.
   */
  _PioneeringMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code PioneeringMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _PioneeringMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the best improvement associated with a tile.
   *
   * @param tile The {@code Tile} to get a plan for.
   * @return The {@code TileImprovementPlan}, or null if not found.
   */
  getBestPlan(tile: Tile): TileImprovementPlan {
    return this.getEuropeanAIPlayer().getBestPlan(tile);
  }
  /**
   * Get the best improvement associated with a tile for a given unit.
   * Take care to first check if the unit has a plan already, if so,
   * return that.
   *
   * @param aiUnit The {@code AIUnit} to get a plan for.
   * @param tile The {@code Tile} to get a plan for.
   * @return The {@code TileImprovementPlan}, or null if not found.
   */
  static getBestMissionPlan(aiUnit: AIUnit, tile: Tile): TileImprovementPlan {
    return (aiUnit.getAIOwner()).getBestPlan(tile);
  }
  /**
   * Gets the {@code TileImprovementPlan} for this mission.
   *
   * @return The {@code TileImprovementPlan}.
   */
  getTileImprovementPlan(): TileImprovementPlan {
    return this.tileImprovementPlan;
  }
  /**
   * Sets the {@code TileImprovementPlan} which should
   * be the next target.
   *
   * @param tip The {@code TileImprovementPlan}.
   */
  setTileImprovementPlan(tip: TileImprovementPlan): void {
    let old = this.tileImprovementPlan;
    this.tileImprovementPlan = tip;
    let aiUnit = this.getAIUnit();
    if (old !== this.tileImprovementPlan) {
      if (old != null && old.getPioneer() === aiUnit) {
        old.setPioneer(null);
      }
      if (this.tileImprovementPlan != null) {
        this.tileImprovementPlan.setPioneer(aiUnit);
        this.getEuropeanAIPlayer().removeTileImprovementPlan(tip);
      }
    }
  }
  /**
   * Abandons the current plan if any.
   */
  abandonTileImprovementPlan(): void {
    if (this.tileImprovementPlan != null) {
      if (this.tileImprovementPlan.getPioneer() === this.getAIUnit()) {
        this.tileImprovementPlan.setPioneer(null);
      }
      this.setTileImprovementPlan(null);
    }
  }
  /**
   * Disposes of this pioneering mission.
   */
  dispose(): void {
    this.abandonTileImprovementPlan();
    super.dispose();
  }
  /**
   * Does a supplied unit have tools?
   *
   * @param aiUnit The pioneer {@code AIUnit} to check.
   * @return True if the pioneer has tools.
   */
  static hasMissionTools(aiUnit: AIUnit): boolean {
    return aiUnit.getUnit().hasAbility$String(Ability.IMPROVE_TERRAIN);
  }
  /**
   * Does this pioneer have tools?
   *
   * @return True if the pioneer has tools.
   */
  hasTools(): boolean {
    return PioneeringMission.hasMissionTools(this.getAIUnit());
  }
  /**
   * Extract a valid target for this mission from a path.
   *
   * @param aiUnit A {@code AIUnit} to perform the mission.
   * @param path A {@code PathNode} to extract a target from.
   * @return A target for this mission, or null if none found.
   */
  static extractTarget(aiUnit: AIUnit, path: PathNode): Location {
    if (path == null) {
      return null;
    }
    let loc = path.getLastNode().getLocation();
    return (loc == null) ? null : ((PioneeringMission.hasMissionTools(aiUnit)) ? ((PioneeringMission.invalidTileReason(aiUnit, loc.getTile$()) != null) ? null : loc.getTile$()) : ((PioneeringMission.invalidColonyReason(aiUnit, loc.getColony()) != null) ? null : loc.getColony()));
  }
  /**
   * Evaluate a potential pioneering mission for a given unit and
   * path.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path A {@code PathNode} to take to the target.
   * @return A score for the proposed mission.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode): number {
    let loc = PioneeringMission.extractTarget(aiUnit, path);
    if (PioneeringMission.hasMissionTools(aiUnit)) {
      let tip: TileImprovementPlan;
      if (loc instanceof Tile && (tip = PioneeringMission.getBestMissionPlan(aiUnit, loc)) != null) {
        return $J.idiv(Math.imul(1000, tip.getValue()), ((path.getTotalTurns() + 1) | 0));
      }
    } else {
      if (loc instanceof Colony) {
        return $J.idiv(1000, ((path.getTotalTurns() + 1) | 0));
      }
    }
    return -2147483648;
  }
  /**
   * Makes a goal decider that checks pioneering sites.
   *
   * @param aiUnit The {@code AIUnit} to search with.
   * @param deferOK Keep track of the nearest colonies to use as a
   *     fallback destination.
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit, deferOK: boolean): GoalDecider {
    let gd = new (PioneeringMission$1())().$c(aiUnit).$init_anon();
    return (deferOK) ? GoalDeciders.getComposedGoalDecider(false, [gd, GoalDeciders.getOurClosestSettlementGoalDecider()]) : gd;
  }
  /**
   * Finds a suitable pioneering target for the supplied unit.
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
    let gd = PioneeringMission.getGoalDecider(aiUnit, deferOK);
    let standardCd = CostDeciders.avoidSettlementsAndBlockingUnits();
    return unit.search(start, gd, standardCd, range, carrier);
  }
  /**
   * Gets the Colony that most needs a pioneer.
   *
   * @param aiUnit The pioneer {@code AIUnit}.
   * @return The colony with the most outstanding tile improvement plans.
   */
  static getBestPioneeringColony(aiUnit: AIUnit): Colony {
    let comp = Comparator.comparingInt((c) => c.getTileImprovementPlans().size());
    let owner = aiUnit.getAIOwner();
    let bestColony = CollectionUtils.maximize$Collection$Comparator(owner.getAIColonies(), comp);
    let path: PathNode;
    let colony: Colony;
    return (bestColony == null) ? null : ((colony = bestColony.getColony()).isConnectedPort() || (path = aiUnit.getUnit().findOurNearestPort()) == null) ? colony : path.getLastNode().getLocation().getColony();
  }
  /**
   * Finds a suitable pioneering target for the supplied unit.
   * Falls back to the best settlement if the unit is not on the map.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param range An upper bound on the number of moves.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A target for this mission.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = PioneeringMission.findTargetPath(aiUnit, range, false);
    if (path != null) {
      return PioneeringMission.extractTarget(aiUnit, path);
    }
    if (deferOK) {
      return PioneeringMission.getBestPioneeringColony(aiUnit);
    }
    let loc = Mission.findCircleTarget(aiUnit, PioneeringMission.getGoalDecider(aiUnit, false), Math.imul(range, 3), false);
    return (PioneeringMission.hasMissionTools(aiUnit)) ? loc : Location.upLoc(loc);
  }
  /**
   * Prepare a unit for this mission.
   *
   * @param aiUnit The {@code AIUnit} to prepare.
   * @return A reason why the unit can not perform this mission, or null
   *     if none.
   */
  static prepare(aiUnit: AIUnit): string {
    let reason = PioneeringMission.invalidUnitReason(aiUnit);
    if (reason != null) {
      return reason;
    }
    let unit = aiUnit.getUnit();
    if (!PioneeringMission.hasMissionTools(aiUnit) && !aiUnit.equipForRole(unit.getSpecification().getPioneerRole())) {
      return 'unit-could-not-equip';
    }
    return (PioneeringMission.hasMissionTools(aiUnit) || unit.hasAbility$String(Ability.EXPERT_PIONEER)) ? null : 'unit-missing-tools';
  }
  /**
   * Why would a PioneeringMission be invalid with the given unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason why the mission would be invalid with the unit,
   *     or null if none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    return (reason != null) ? reason : (!aiUnit.getUnit().isPerson()) ? Mission.UNITNOTAPERSON : null;
  }
  /**
   * Why would a PioneeringMission be invalid with the given unit and colony.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param colony The {@code Colony} to check.
   * @return A reason why the mission would be invalid, or null if
   *     none found.
   */
  static invalidColonyReason(aiUnit: AIUnit, colony: Colony): string {
    let reason = Mission.invalidTargetReason$Location$Player(colony, aiUnit.getUnit().getOwner());
    let role = aiUnit.getUnit().getSpecification().getRole('model.role.pioneer');
    return (reason != null) ? reason : (!PioneeringMission.hasMissionTools(aiUnit) && !colony.canProvideGoods(role.getRequiredGoodsList$())) ? 'colony-can-not-provide-equipment' : null;
  }
  /**
   * Gets the existing tile improvement plan for a unit and tile.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param tile The {@code Tile} to check.
   * @return The associated {@code TileImprovementPlan}.
   */
  static getPlan(aiUnit: AIUnit, tile: Tile): TileImprovementPlan {
    let pm = aiUnit.getMission$Class($J.cls(PioneeringMission));
    return (pm != null && pm.getTileImprovementPlan() != null && pm.getTileImprovementPlan().getTarget() === tile) ? pm.getTileImprovementPlan() : null;
  }
  /**
   * Why would a PioneeringMission be invalid with the given unit and tile.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param tile The {@code Tile} to check.
   * @return A reason why the mission would be invalid, or null if
   *      none found.
   */
  static invalidTileReason(aiUnit: AIUnit, tile: Tile): string {
    return (tile == null) ? Mission.TARGETINVALID : (!PioneeringMission.hasMissionTools(aiUnit)) ? 'unit-needs-tools' : (PioneeringMission.getPlan(aiUnit, tile) == null && PioneeringMission.getBestMissionPlan(aiUnit, tile) == null) ? 'tile-has-no-plan' : (tile.getOwningSettlement() != null) ? Mission.invalidTargetReason$Location$Player(tile.getOwningSettlement(), aiUnit.getUnit().getOwner()) : null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return PioneeringMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = PioneeringMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Tile) ? PioneeringMission.invalidTileReason(aiUnit, loc) : (loc instanceof Colony) ? ((aiUnit.getUnit().isOnTile()) ? PioneeringMission.invalidColonyReason(aiUnit, loc) : Mission.invalidTargetReason$Location$Player(loc, aiUnit.getUnit().getOwner())) : Mission.TARGETINVALID;
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
    if (target == null || target instanceof Colony || target instanceof Tile) {
      this.target = target;
      this.setTileImprovementPlan((target instanceof Tile) ? this.getBestPlan(target) : null);
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return PioneeringMission.findMissionTarget(this.getAIUnit(), 10, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    if (this.tileImprovementPlan != null) {
      if (this.tileImprovementPlan.isDisposed()) {
        return 'target-plan-disposed';
      }
      if (this.tileImprovementPlan.isComplete()) {
        return null;
      }
    }
    return PioneeringMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  lbFail(lb: LogBuilder, cont: boolean, reasons: any[]): Mission {
    if (this.hasTools() && this.getUnit().getColony() != null) {
      this.getAIUnit().equipForRole(this.getSpecification().getDefaultRole());
    }
    return super.lbFail(lb, false, reasons);
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([PioneeringMission.tag]);
    let aiUnit = this.getAIUnit();
    if (this.tileImprovementPlan != null) {
      if (this.tileImprovementPlan.isComplete()) {
        this.lbDone(lb, true, [this.tileImprovementPlan.getType(), ' at ', this.getTarget()]);
        this.setTarget(null);
      } else if (!this.tileImprovementPlan.validate()) {
        this.lbFail(lb, true, ['abandoned invalid plan at ', this.getTarget(), '/', this.tileImprovementPlan]);
        this.setTarget(null);
      }
    }
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let unit = this.getUnit();
    let player = unit.getOwner();
    let aiPlayer = this.getEuropeanAIPlayer();
    let costDecider = CostDeciders.avoidSettlementsAndBlockingUnits();
    let newTarget: Location;
    if (!this.hasTools()) {
      let mt = this.travelToTarget(this.getTarget(), costDecider, lb);
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
      if (aiUnit.equipForRole(this.getSpecification().getPioneerRole()) && this.hasTools()) {
        lb.add([', equips']);
        newTarget = PioneeringMission.findMissionTarget(aiUnit, 10, false);
        if (newTarget == null) {
          return this.lbFail(lb, false, ['no pioneering target']);
        }
      } else {
        lb.add([', fails to equip']);
        newTarget = PioneeringMission.findMissionTarget(aiUnit, 10, false);
        if (newTarget == null || Map_.isSameLocation(newTarget, this.getTarget())) {
          return this.lbFail(lb, false, ['no tools target']);
        }
      }
      this.setTarget(newTarget);
      return this.lbRetarget(lb);
    }
    if (this.getTarget() instanceof Colony && Mission.invalidTargetReason$Location$Player(this.getTarget(), player) == null) {
      let mt = this.travelToTarget(this.getTarget(), costDecider, lb);
      switch (mt) {
        case Unit$MoveType.MOVE:
          break;
        case Unit$MoveType.MOVE_HIGH_SEAS:
          return this.lbWait(lb, []);
        case Unit$MoveType.MOVE_NO_REPAIR:
          return this.lbFail(lb, false, [Mission.AIUNITDIED]);
        case Unit$MoveType.MOVE_NO_MOVES:
        case Unit$MoveType.MOVE_NO_TILE:
        case Unit$MoveType.MOVE_ILLEGAL:
          return this;
        default:
          return this.lbMove(lb, mt);
      }
      this.lbAt(lb);
      newTarget = PioneeringMission.findMissionTarget(aiUnit, 10, false);
      if (newTarget == null) {
        return this.lbFail(lb, false, ['found no pioneering target']);
      }
      this.setTarget(newTarget);
      return this.lbRetarget(lb);
    }
    let tile = this.getTarget().getTile$();
    for (; ; ) {
      let mt = this.travelToTarget(this.getTarget(), costDecider, lb);
      {
        let d: Direction;
        switch (mt) {
          case Unit$MoveType.MOVE:
            break;
          case Unit$MoveType.MOVE_HIGH_SEAS:
            return this.lbWait(lb, []);
          case Unit$MoveType.MOVE_NO_REPAIR:
            return this.lbFail(lb, false, [Mission.AIUNITDIED]);
          case Unit$MoveType.MOVE_NO_MOVES:
          case Unit$MoveType.MOVE_NO_TILE:
          case Unit$MoveType.MOVE_ILLEGAL:
            return this;
          case Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN:
            d = unit.getTile$().getDirection(tile);
            if (d != null) {
              this.moveRandomly(PioneeringMission.tag, d);
            }
            continue;
          default:
            return this.lbMove(lb, mt);
        }
      }
      break;
    }
    this.lbAt(lb);
    if (!player.owns(tile)) {
      let fail: boolean;
      let price = player.getLandPrice(tile);
      if (price < 0) {
        fail = true;
      } else {
        if (price > 0 && !player.checkGold(price)) {
          price = Constants.STEAL_LAND;
        }
        fail = !AIMessage.askClaimLand$Tile$AIUnit$int(tile, aiUnit, price) || !player.owns(tile);
      }
      if (fail) {
        aiPlayer.removeTileImprovementPlan(this.tileImprovementPlan);
        this.tileImprovementPlan.dispose();
        lb.add([', land claim failed at ', tile]);
        if ((newTarget = PioneeringMission.findMissionTarget(aiUnit, 10, false)) == null) {
          return this.lbFail(lb, false, ['no alternate target']);
        }
        this.setTarget(newTarget);
        return this.lbRetarget(lb);
      }
    }
    if (unit.getState() === Unit$UnitState.IMPROVING) {
      return this.lbWait(lb, [', improving ', this.tileImprovementPlan]);
    } else if (unit.checkSetState(Unit$UnitState.IMPROVING)) {
      aiPlayer.removeTileImprovementPlan(this.tileImprovementPlan);
      if (AIMessage.askChangeWorkImprovementType(aiUnit, this.tileImprovementPlan.getType())) {
        return this.lbWait(lb, [', began ', this.tileImprovementPlan]);
      } else {
        this.tileImprovementPlan.dispose();
        return this.lbFail(lb, false, ['to change work type at ', tile]);
      }
    }
    return this.lbWait(lb, [', waiting to improve at ', tile]);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(PioneeringMission.TARGET_TAG, this.target.getId());
      if (this.tileImprovementPlan != null) {
        xw.writeAttribute$String$FreeColObject(TileImprovementPlan.TAG, this.tileImprovementPlan);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    this.target = xr.getLocationAttribute(this.getGame(), PioneeringMission.TARGET_TAG, false);
    this.tileImprovementPlan = (xr.hasAttribute(TileImprovementPlan.TAG)) ? xr.makeAIObject(aiMain, TileImprovementPlan.TAG, $J.cls(TileImprovementPlan), null, true) : null;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return PioneeringMission.TAG;
  }
  toStringForDebugExtraMissionInfo(): string {
    let targetString = DebugUtils.locationDisplayString(this.getTarget());
    let tileImprovement = (this.tileImprovementPlan != null) ? Messages.message$String(this.tileImprovementPlan.getType().getNameKey()) : 'No plan';
    return tileImprovement + ' at ' + targetString;
  }
  static $clinit() {
    PioneeringMission.logger = Logger.getLogger($J.cls(PioneeringMission).getName());
  }
}

let $PioneeringMission$1: any = null;
/** An anonymous class (PioneeringMission.java:267). */
function PioneeringMission$1(): any {
  return $PioneeringMission$1 ??= $J.local(class extends JObject {
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
      let value = PioneeringMission.scorePath(this.$cv_aiUnit, path);
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
  }, 'net.sf.freecol.server.ai.mission.PioneeringMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(PioneeringMission, 'net.sf.freecol.server.ai.mission.PioneeringMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_PioneeringMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_PioneeringMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int', 'hasTools': 'boolean', 'getTileImprovementPlan': 'net.sf.freecol.server.ai.TileImprovementPlan' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  TileImprovementPlan = $J.load('net.sf.freecol.server.ai.TileImprovementPlan');
});
