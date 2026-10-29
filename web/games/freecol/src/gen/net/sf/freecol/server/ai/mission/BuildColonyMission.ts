// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/BuildColonyMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Level, Logger } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let Colony, Constants, FreeColObject, Location, Player, Player$NoClaimReason, Tile, Unit$MoveType, CostDeciders, GoalDeciders, CollectionUtils, LogBuilder, RandomUtils, AIMessage;

/**
 * Mission for building a {@code Colony}.
 *
 * @see net.sf.freecol.common.model.Colony Colony
 */
export class BuildColonyMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'buildColonyMission';
  /**
   * The tag for this mission.
   */
  static readonly tag: string = 'AI colony builder';
  /**
   * The target of this mission.  It can either be a Tile where a
   * Colony should be built, or an existing connected Colony owned
   * by this player to go to before retargeting.
   */
  target: Location = null;
  /**
   * The value of a target {@code Tile}.
   */
  colonyValue: number = 0;
  static readonly TARGET_TAG: string = 'target';
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param target The target {@code Location} for this mission.
   */
  _BuildColonyMission$AIMain$AIUnit$Location(aiMain: AIMain, aiUnit: AIUnit, target: Location): this {
    this._Mission(aiMain, aiUnit);
    this.setTarget(target);
    return this;
  }
  /**
   * Creates a new {@code BuildColonyMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _BuildColonyMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Get the colony value for a tile.
   *
   * @param tile The {@code Tile} to test.
   * @return The colony value for this player.
   */
  getColonyValue(tile: Tile): number {
    let owner = this.getAIUnit().getUnit().getOwner();
    return owner.getColonyValue(tile);
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
    let tile = loc.getTile$();
    let colony = loc.getColony();
    return (BuildColonyMission.invalidMissionReason$AIUnit$Location(aiUnit, tile) == null) ? tile : (BuildColonyMission.invalidMissionReason$AIUnit$Location(aiUnit, colony) == null) ? colony : null;
  }
  /**
   * Gets the value of a path to a colony building site.
   *
   * @param aiUnit The {@code AIUnit} to build the colony.
   * @param path The {@code PathNode} to check.
   * @return A score for the target.
   */
  static scorePath(aiUnit: AIUnit, path: PathNode): number {
    let loc: Location;
    if (path == null || !((loc = BuildColonyMission.extractTarget(aiUnit, path)) instanceof Tile)) {
      return Math.fround(-2147483648);
    }
    let tile = loc;
    let player = aiUnit.getUnit().getOwner();
    let turns = Math.fround(path.getTotalTurns() + 3);
    return Math.fround((Math.imul(3, player.getColonyValue(tile))) / turns);
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
    let gd = new (BuildColonyMission$1())().$c(aiUnit).$init_anon();
    return (deferOK) ? GoalDeciders.getComposedGoalDecider(false, [gd, GoalDeciders.getOurClosestSettlementGoalDecider()]) : gd;
  }
  /**
   * Finds a site for a new colony.  Favour closer sites.
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
    let gd = BuildColonyMission.getGoalDecider(aiUnit, deferOK);
    let standardCd = CostDeciders.avoidSettlementsAndBlockingUnits();
    return unit.search(start, gd, standardCd, range, carrier);
  }
  /**
   * Finds a site for a new colony or a backup colony to go to.
   *
   * @param aiUnit The {@code AIUnit} to find a colony site with.
   * @param range An upper bound on the number of moves.
   * @param deferOK Enables deferring to a fallback colony.
   * @return A new target for this mission.
   */
  static findMissionTarget(aiUnit: AIUnit, range: number, deferOK: boolean): Location {
    let path = BuildColonyMission.findTargetPath(aiUnit, range, deferOK);
    return (path != null) ? BuildColonyMission.extractTarget(aiUnit, path) : Location.upLoc(Mission.findCircleTarget(aiUnit, BuildColonyMission.getGoalDecider(aiUnit, deferOK), Math.imul(range, 3), deferOK));
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
    return (reason != null) ? reason : (!aiUnit.getUnit().getOwner().canBuildColonies()) ? 'player-not-a-colony-founder' : (!aiUnit.getUnit().getType().canBuildColony()) ? 'unit-not-a-colony-founder' : null;
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
   * Why is this mission invalid with a given tile target?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param tile The potential target {@code Tile}.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidTileReason(aiUnit: AIUnit, tile: Tile): string {
    let owner = aiUnit.getUnit().getOwner();
    let reason = owner.canClaimToFoundSettlementReason(tile);
    switch (reason) {
      case Player$NoClaimReason.NONE:
      case Player$NoClaimReason.NATIVES:
        return null;
      default:
        break;
    }
    return 'target-' + $J.str(reason);
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return BuildColonyMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = BuildColonyMission.invalidMissionReason$AIUnit(aiUnit);
    return (reason != null) ? reason : (loc instanceof Colony) ? BuildColonyMission.invalidColonyReason(aiUnit, loc) : (loc instanceof Tile) ? BuildColonyMission.invalidTileReason(aiUnit, loc) : Mission.TARGETINVALID;
  }
  /**
   * {@inheritDoc}
   */
  getBaseTransportPriority(): number {
    return (Mission.NORMAL_TRANSPORT_PRIORITY + 10) | 0;
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
      this.colonyValue = (target instanceof Tile) ? this.getColonyValue(target) : -1;
    }
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return BuildColonyMission.findMissionTarget(this.getAIUnit(), 5, true);
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    return BuildColonyMission.invalidMissionReason$AIUnit$Location(this.getAIUnit(), this.target);
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([BuildColonyMission.tag]);
    let aiMain = this.getAIMain();
    let aiUnit = this.getAIUnit();
    let unit = this.getUnit();
    let player = unit.getOwner();
    let euaip = this.getEuropeanAIPlayer();
    let retarget = false;
    let reason = this.invalidReason();
    if (Mission.isTargetReason(reason)) {
      let c: Colony;
      if (this.target instanceof Tile && (c = this.target.getColony()) != null && player.owns(c)) {
        let m = euaip.getPioneeringMission(aiUnit, c.getTile$());
        if (m != null) {
          return this.lbDrop(lb, [', improving with ', m]);
        }
        this.setTarget(c);
        return this.lbRetarget(lb);
      }
    } else if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    } else {
      if (this.target instanceof Tile) {
        let newValue = this.getColonyValue(this.target);
        if (newValue < this.colonyValue) {
          reason = 'target tile ' + this.target.toShortString() + ' value ' + this.colonyValue + ' -> ' + newValue;
          retarget = true;
        }
      }
    }
    if (retarget) {
      return this.retargetMission(reason, lb);
    }
    for (; ; ) {
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
      if (this.getTarget() instanceof Colony) {
        let colony = this.getTarget();
        let m = euaip.getPioneeringMission(aiUnit, colony.getTile$());
        if (m != null) {
          return this.lbDrop(lb, [', improving with ', m]);
        }
        if (colony.getUnitCount() <= 1) {
          this.setTarget(colony);
          return this.lbDrop(lb, [', join small colony']);
        }
        let newTarget: Location;
        if ((newTarget = BuildColonyMission.findMissionTarget(aiUnit, 5, false)) != null) {
          this.setTarget(newTarget);
          return this.lbRetarget(lb);
        }
        let smallPred = (c) => c !== colony && c.getUnitCount() < colony.getUnitCount();
        let closeComp = CollectionUtils.cachingIntComparator((c) => unit.getTurnsToReach$Location(c));
        let best = CollectionUtils.minimize$Stream$Predicate$Comparator(player.getColonies(), smallPred, closeComp);
        if (best != null) {
          lb.add([', going to smaller ', best.getUnitCount(), '<', colony.getUnitCount(), ' colony']);
          this.setTarget(best);
          return this.lbRetarget(lb);
        }
        return this.lbDrop(lb, [', joining']);
      }
      if (!(this.getTarget() instanceof Tile)) {
        return this.lbFail(lb, false, ['bogus target ', this.getTarget()]);
      }
      let tile = this.getTarget();
      if (unit.getMovesLeft() <= 0) {
        return this.lbWait(lb, [', waiting to build at ', tile]);
      }
      if (tile.getOwner() == null) {
      } else if (player.owns(tile)) {
        let colony = tile.getOwningSettlement();
        if (colony != null) {
          BuildColonyMission.logger.warning('Building on colony tile: ' + $J.str(tile));
          return this.lbFail(lb, false, ['building on colony tile ', tile]);
        }
      } else {
        let price = player.getLandPrice(tile);
        let fail = price < 0;
        if (price > 0 && !player.checkGold(price)) {
          if (RandomUtils.randomInt(BuildColonyMission.logger, 'Land gold?', this.getAIRandom(), 4) === 0) {
            lb.add([', ']);
            euaip.cheatGold(price, lb);
            lb.add([' to buy ', tile]);
          }
        }
        if (price >= 0) {
          fail = !AIMessage.askClaimLand$Tile$AIUnit$int(tile, aiUnit, ((price === 0) ? 0 : (player.checkGold(price)) ? price : Constants.STEAL_LAND)) || !player.owns(tile);
        }
        if (fail) {
          return this.retargetMission('tile-claim-at-' + $J.str(tile), lb);
        }
        lb.add([', claimed colony tile']);
      }
      if (BuildColonyMission.logger.isLoggable(Level.FINE)) {
        let l2 = new LogBuilder()._LogBuilder(64);
        l2.add([BuildColonyMission.tag, ' score-at-foundation ', tile, ':']);
        for (const $it0 = player.getAllColonyValues(tile).iterator(); $it0.hasNext(); ) {
          let d = $it0.next();
          l2.add([' ', d]);
        }
        l2.log(BuildColonyMission.logger, Level.FINE);
      }
      if (AIMessage.askBuildColony(aiUnit, Player.ASSIGN_SETTLEMENT_NAME) && tile.getColony() != null) {
        let colony = tile.getColony();
        let aiColony = aiMain.getAIColony(colony);
        aiColony.requestRearrange();
        let m = euaip.getWorkInsideColonyMission(aiUnit, aiColony);
        return this.lbDone(lb, m != null, [colony]);
      }
      return this.lbFail(lb, false, ['build at ', tile]);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeAttribute(BuildColonyMission.TARGET_TAG, this.target.getId());
      if (this.colonyValue > 0) {
        xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, this.colonyValue);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), BuildColonyMission.TARGET_TAG, false);
    this.colonyValue = xr.getAttribute$String$int(FreeColObject.VALUE_TAG, -1);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return BuildColonyMission.TAG;
  }
  static $clinit() {
    BuildColonyMission.logger = Logger.getLogger($J.cls(BuildColonyMission).getName());
  }
}

let $BuildColonyMission$1: any = null;
/** An anonymous class (BuildColonyMission.java:165). */
function BuildColonyMission$1(): any {
  return $BuildColonyMission$1 ??= $J.local(class extends JObject {
    bestPath: PathNode = null;
    bestValue: number = 0;
    $init_anon() {
      this.bestPath = null;
      this.bestValue = 0;
      return this;
    }
    getGoal(): PathNode {
      return this.bestPath;
    }
    hasSubGoals(): boolean {
      return true;
    }
    check(u: Unit, path: PathNode): boolean {
      let loc = BuildColonyMission.extractTarget(this.$cv_aiUnit, path);
      if (loc instanceof Tile) {
        let value = BuildColonyMission.scorePath(this.$cv_aiUnit, path);
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
  }, 'net.sf.freecol.server.ai.mission.BuildColonyMission$1', ['net.sf.freecol.common.model.pathfinding.GoalDecider']);
}

$J.define(BuildColonyMission, 'net.sf.freecol.server.ai.mission.BuildColonyMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_BuildColonyMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location': '_BuildColonyMission$AIMain$AIUnit$Location' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Player$NoClaimReason = $J.load('net.sf.freecol.common.model.Player$NoClaimReason');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  GoalDeciders = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  RandomUtils = $J.load('net.sf.freecol.common.util.RandomUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
});
