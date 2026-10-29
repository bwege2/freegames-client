// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/ScoutingMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Ability, Colony, IndianSettlement, Location, Settlement, Tension$Level, Tile, Unit$MoveType, CostDeciders, GoalDeciders, CollectionUtils, RandomUtils, AIMessage;

/**
 * Mission for controlling a scout.
 */
export class ScoutingMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'scoutingMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI scout';
  /**
   * The target for this mission.
   * - A tile with an LCR
   * - A native settlement to talk to the chief of
   * - A player colony to retarget from
   * - An unexplored tile
   */
  target: Location = null;
  /**
   * A Tile to go to before going to the real target.
   */
  precedingTile: Location = null;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The target {@code Location}.
   */
  _ScoutingMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code ScoutingMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _ScoutingMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Does a supplied unit have horses?
   *
   * @param aiUnit The scout {@code AIUnit} to check.
   * @return True if the scout has horses.
   */
  static canScoutNatives(aiUnit: AIUnit): boolean {
    return aiUnit.getUnit().hasAbility$String(Ability.SPEAK_WITH_CHIEF);
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
    return (loc == null) ? null : (ScoutingMission.invalidSettlementReason(aiUnit, loc.getSettlement()) == null) ? loc.getSettlement() : (ScoutingMission.invalidTileReason(aiUnit, loc.getTile$()) == null) ? loc.getTile$() : null;
  }
  /**
   * Evaluate a potential scouting mission for a given unit and
   * path.
   *
   * @param aiUnit The {@code AIUnit} to do the mission.
   * @param path A {@code PathNode} to take to the target.
   * @return A score for the proposed mission.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode): number {
    let loc = (path == null) ? null : ScoutingMission.extractTarget(aiUnit, path);
    return (loc instanceof Colony) ? $J.idiv(12, ((path.getTotalTurns() + 1) | 0)) : (loc instanceof IndianSettlement) ? $J.idiv(2000, ((path.getTotalTurns() + 1) | 0)) : (loc instanceof Tile && (loc).hasLostCityRumour()) ? $J.idiv(1000, ((path.getTotalTurns() + 1) | 0)) : -2147483648;
  }
  /**
   * Gets a {@code GoalDecider} for finding the best colony
   * {@code Tile}, optionally falling back to the nearest colony.
   *
   * @param aiUnit The {@code AIUnit} that is searching.
   * @param deferOK Enable colony fallback.
   * @return A suitable {@code GoalDecider}.
   */
  static getGoalDecider(aiUnit: AIUnit, deferOK: boolean): GoalDecider {
    let gd = new (ScoutingMission$1())().$c(aiUnit).$init_anon();
    return (deferOK) ? GoalDeciders.getComposedGoalDecider(false, [gd, GoalDeciders.getOurClosestSettlementGoalDecider()]) : gd;
  }
  /**
   * Finds a suitable scouting target for the supplied unit.
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
    let gd = ScoutingMission.getGoalDecider(aiUnit, deferOK);
    let standardCd = CostDeciders.avoidIllegal();
    return unit.search(start, gd, standardCd, range, carrier);
  }
  /**
   * Finds a suitable scouting target for the supplied unit.
   * Falls back to the best settlement if a path is not found.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param range An upper bound on the number of moves.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A {@code PathNode} to the target, or null if none found.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = ScoutingMission.findTargetPath(aiUnit, range, deferOK);
    return Location.upLoc((path != null) ? ScoutingMission.extractTarget(aiUnit, path) : Mission.findCircleTarget(aiUnit, ScoutingMission.getGoalDecider(aiUnit, deferOK), Math.imul(range, 3), deferOK));
  }
  /**
   * Prepare a unit for this mission.  Allow even experts to proceed
   * even if not mounted.
   *
   * @param aiUnit The {@code AIUnit} to prepare.
   * @return A reason why the unit can not perform this mission, or null
   *     if none.
   */
  static prepare(aiUnit: AIUnit): string {
    let reason = ScoutingMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (ScoutingMission.canScoutNatives(aiUnit) || aiUnit.equipForRole(aiUnit.getUnit().getSpecification().getScoutRole()) || aiUnit.getUnit().hasAbility$String(Ability.EXPERT_SCOUT)) ? null : 'unit-unprepared-to-SCOUT';
  }
  /**
   * Why would this mission be invalid with the given unit.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason why the mission would be invalid with the unit,
   *     or null if none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    return (reason != null) ? reason : (!ScoutingMission.canScoutNatives(aiUnit)) ? 'unit-not-a-SCOUT' : null;
  }
  /**
   * Why is this mission invalid with a given colony target?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param colony The potential target {@code Colony}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidColonyReason(aiUnit: AIUnit, colony: Colony): string {
    return Mission.invalidTargetReason$Location$Player(colony, aiUnit.getUnit().getOwner());
  }
  /**
   * Why is this mission invalid with a given native settlement target?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param is The potential target {@code IndianSettlement}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidIndianSettlementReason(aiUnit: AIUnit, is$: IndianSettlement): string {
    let unit = aiUnit.getUnit();
    let owner = unit.getOwner();
    let tension: Tension;
    let reason = Mission.invalidTargetReason$Location(is$);
    return (reason != null) ? reason : (is$.hasScouted(owner)) ? 'settlement-scouted' : ((tension = is$.getAlarm$Player(owner)) != null && tension.getValue() >= Tension$Level.HATEFUL.getLimit()) ? 'settlement-hateful' : null;
  }
  /**
   * Is this a valid scouting target because it is a suitable native
   * settlement or an intermediate colony.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param settlement The {@code Settlement} to test.
   * @return A reason why the mission would be invalid, or null if none found.
   */
  static invalidSettlementReason(aiUnit: AIUnit, settlement: Settlement): string {
    return (settlement instanceof Colony) ? ScoutingMission.invalidColonyReason(aiUnit, settlement) : (settlement instanceof IndianSettlement) ? ScoutingMission.invalidIndianSettlementReason(aiUnit, settlement) : Mission.TARGETINVALID;
  }
  /**
   * Is this a valid scouting target because it is a suitable tile.
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @param tile The {@code Tile} to test.
   * @return A reason why the mission would be invalid, or null if none found.
   */
  static invalidTileReason(aiUnit: AIUnit, tile: Tile): string {
    return (tile == null) ? 'tile-null' : (tile.hasLostCityRumour()) ? null : (!tile.isExploredBy(aiUnit.getUnit().getOwner())) ? null : 'explored-tile-lacks-rumour';
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return ScoutingMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = ScoutingMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Settlement) ? ScoutingMission.invalidSettlementReason(aiUnit, loc) : (loc instanceof Tile) ? ScoutingMission.invalidTileReason(aiUnit, loc) : Mission.TARGETINVALID;
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
    return (this.precedingTile != null) ? this.precedingTile : this.target;
  }
  /**
   * {@inheritDoc}
   */
  setTarget(target: Location): void {
    if (target == null || target instanceof Tile || target instanceof Colony) {
      this.target = target;
      this.precedingTile = null;
    } else if (target instanceof IndianSettlement) {
      let aiUnit = this.getAIUnit();
      let unit = aiUnit.getUnit();
      let t = target.getTile$();
      if (!unit.hasTile() || unit.getTile$().getContiguity() !== t.getContiguity()) {
        let tiles = CollectionUtils.toList$Collection(t.getContiguityAdjacent(t.getContiguity()));
        let coast = CollectionUtils.transform$Collection$Predicate(tiles, ($p0) => $p0.isCoastland());
        this.precedingTile = RandomUtils.getRandomMember$Logger$String$List$Random(ScoutingMission.logger, 'scout-tile', (coast.isEmpty()) ? tiles : coast, aiUnit.getAIRandom());
      } else {
        this.precedingTile = null;
      }
      this.target = target;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return ScoutingMission.findMissionTarget(this.getAIUnit(), 20, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return ScoutingMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.getTarget());
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([ScoutingMission.tag]);
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      return this.retargetMission(reason, lb);
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let aiUnit = this.getAIUnit();
    let unit = this.getUnit();
    let d: Direction;
    let mt = this.travelToTarget(this.getTarget(), CostDeciders.avoidSettlementsAndBlockingUnits(), lb);
    switch (mt) {
      case Unit$MoveType.MOVE:
        if (this.precedingTile != null) {
          this.precedingTile = null;
          return this.doMission(lb);
        }
        break;
      case Unit$MoveType.MOVE_HIGH_SEAS:
      case Unit$MoveType.MOVE_NO_MOVES:
      case Unit$MoveType.MOVE_ILLEGAL:
        return this.lbWait(lb, []);
      case Unit$MoveType.MOVE_NO_REPAIR:
        return this.lbFail(lb, false, [Mission.AIUNITDIED]);
      case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
        this.setTarget(this.target);
        return this;
      case Unit$MoveType.MOVE_NO_TILE:
        this.moveRandomly(ScoutingMission.tag, null);
        return this.lbDodge(lb);
      case Unit$MoveType.ATTACK_UNIT:
        this.moveRandomly(ScoutingMission.tag, unit.getTile$().getDirection(this.getTarget().getTile$()));
        return this.lbDodge(lb);
      case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT:
        d = unit.getTile$().getDirection(this.getTarget().getTile$());
        // assert d != null && getTarget() instanceof IndianSettlement
        if (AIMessage.askScoutSpeakToChief(aiUnit, this.getTarget())) {
          this.lbDone(lb, true, ['speak-with-chief at ', this.getTarget()]);
        } else {
          this.lbFail(lb, true, ['unexpected failure to speak at ', this.getTarget()]);
        }
        break;
      case Unit$MoveType.EXPLORE_LOST_CITY_RUMOUR:
        d = unit.getTile$().getDirection(this.getTarget().getTile$());
        // assert d != null
        if (AIMessage.askMove(aiUnit, d)) {
          this.lbDone(lb, true, ['explore at ', this.getTarget()]);
        } else {
          this.lbFail(lb, true, ['unexpected failure at ', this.getTarget()]);
        }
        break;
      default:
        return this.lbMove(lb, mt);
    }
    if (unit.isDisposed()) {
      return this;
    }
    this.lbAt(lb);
    let completed = this.getTarget();
    let newTarget = ScoutingMission.findMissionTarget(aiUnit, 20, false);
    if (newTarget == null || (completed instanceof Colony && newTarget === completed)) {
      if (completed instanceof Colony && ScoutingMission.canScoutNatives(aiUnit)) {
        aiUnit.equipForRole(this.getSpecification().getDefaultRole());
      }
      return this.lbFail(lb, false, [', found no targets']);
    }
    this.setTarget(newTarget);
    return this.lbRetarget(lb);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(ScoutingMission.TARGET_TAG, this.target.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), ScoutingMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return ScoutingMission.TAG;
  }
  static $clinit() {
    ScoutingMission.logger = Logger.getLogger($J.cls(ScoutingMission).getName());
  }
}

let $ScoutingMission$1: any = null;
/** An anonymous class (ScoutingMission.java:166). */
function ScoutingMission$1(): any {
  return $ScoutingMission$1 ??= $J.local(class extends JObject {
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
      let loc = ScoutingMission.extractTarget(this.$cv_aiUnit, path);
      if (loc instanceof IndianSettlement || loc instanceof Tile) {
        let value = ScoutingMission.scorePath(this.$cv_aiUnit, path);
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
  }, 'net.sf.freecol.server.ai.mission.ScoutingMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(ScoutingMission, 'net.sf.freecol.server.ai.mission.ScoutingMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_ScoutingMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_ScoutingMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
