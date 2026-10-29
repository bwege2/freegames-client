// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/Mission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalArgumentException, IllegalStateException, JString, Logger, RuntimeException } from '../../../../../../../jre/index.ts';
import { AIObject } from '../AIObject.ts';

let DebugUtils, Ability, Colony, Direction, Europe, Location, Map_, Ownable, Settlement, Stance, Tension$Level, Unit, Unit$MoveType, CollectionUtils, LogBuilder, StringUtils, AIMessage, TransportMission, UnitSeekAndDestroyMission;

/**
 * A mission describes what a unit should do; attack, build colony,
 * wander etc.  Every {@link AIUnit} should have a mission. By
 * extending this class, you create different missions.
 */
export class Mission extends AIObject {
  static logger: Logger = null;
  /**
   * A transport can be used.
   */
  static readonly MINIMUM_TRANSPORT_PRIORITY: number = 60;
  /**
   * Transport is required.
   */
  static readonly NORMAL_TRANSPORT_PRIORITY: number = 100;
  static readonly NO_PATH_TO_TARGET: number = -2;
  static readonly NO_MORE_MOVES_LEFT: number = -1;
  static readonly AIUNITNULL: string = 'aiUnit-null';
  static readonly AIUNITDIED: string = 'aiUnit-died';
  static readonly TARGETNULL: string = 'target-null';
  static readonly TARGETINVALID: string = 'target-invalid';
  static readonly TARGETOWNERSHIP: string = 'target-ownership';
  static readonly TARGETNOTFOUND: string = 'target-not-found';
  static readonly UNITNOTAPERSON: string = 'unit-not-a-person';
  static readonly UNITNOTOFFENSIVE: string = 'unit-not-offensive';
  static readonly UNITNOTOFREQUIREDTYPE: string = 'unit-not-required-type';
  static readonly UNITNOTONMAP: string = 'unit-not-on-map';
  /**
   * The unit to undertake the mission.
   */
  aiUnit: AIUnit = null;
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * Note that missions are attached to their units, and thus do
   * not need AI ids, hence the plain superclass constructor.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   */
  _Mission(aiMain: AIMain, aiUnit: AIUnit): this {
    this._AIObject$AIMain(aiMain);
    this.aiUnit = aiUnit;
    this.setInitialized();
    if (aiUnit != null && aiUnit.getMission$() !== this) {
      aiUnit.changeMission(this);
    }
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getAIUnit() != null;
  }
  /**
   * Gets the AI-unit this mission has been created for.
   *
   * @return The {@code AIUnit}.
   */
  getAIUnit(): AIUnit {
    return this.aiUnit;
  }
  /**
   * Gets the unit this mission has been created for.
   *
   * @return The {@code Unit}.
   */
  getUnit(): Unit {
    return (this.aiUnit == null) ? null : this.aiUnit.getUnit();
  }
  /**
   * Convenience accessor for the owning player.
   *
   * @return The {@code Player} that owns the mission unit.
   */
  getPlayer(): Player {
    return (this.getUnit() == null) ? null : this.getUnit().getOwner();
  }
  /**
   * Convenience accessor for the owning AI player.
   *
   * @return The {@code AIPlayer}.
   */
  getAIPlayer(): MissionAIPlayer {
    return this.getAIMain().getAIPlayer(this.getUnit().getOwner());
  }
  /**
   * Convenience accessor for the owning European AI player.
   *
   * @return The {@code EuropeanAIPlayer}.
   */
  getEuropeanAIPlayer(): EuropeanAIPlayer {
    let player = this.getUnit().getOwner();
    if (!player.isEuropean()) {
      throw new IllegalArgumentException('Not a European player: ' + $J.str(player));
    }
    return this.getAIMain().getAIPlayer(player);
  }
  /**
   * Convenience accessor for the unit/player PRNG.
   *
   * @return A {@code Random} to use.
   */
  getAIRandom(): Random {
    return this.aiUnit.getAIRandom();
  }
  /**
   * Is this mission valid?
   *
   * @return True if the mission is valid.
   */
  isValid(): boolean {
    return this.invalidReason() == null;
  }
  /**
   * Is an invalidity reason due to a target failure?
   *
   * @param reason The reason to check.
   * @return True if the reason starts with "target-".
   */
  static isTargetReason(reason: string): boolean {
    return reason != null && reason.startsWith('target-');
  }
  /**
   * Is a unit able to perform a mission of a particular type?
   *
   * @param unit The {@code Unit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidUnitReason(unit: Unit): string {
    return (unit == null) ? 'unit-null' : (!unit.isInitialized()) ? 'unit-uninitialized' : (unit.isDisposed()) ? 'unit-disposed' : (unit.isDamagedAndUnderForcedRepair()) ? 'unit-under-repair' : null;
  }
  /**
   * Is an AI unit able to perform a mission of a particular type?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidAIUnitReason(aiUnit: AIUnit): string {
    let reason: string;
    return (aiUnit == null) ? Mission.AIUNITNULL : ((reason = Mission.invalidUnitReason(aiUnit.getUnit())) != null) ? reason : null;
  }
  /**
   * Is an AI unable to perform a new mission because it already has
   * a valid, non-onetime mission?
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return "mission-exists" if a valid mission is found, or null
   *     if none found.
   */
  static invalidNewMissionReason(aiUnit: AIUnit): string {
    return (aiUnit == null) ? Mission.AIUNITNULL : (aiUnit.hasMission$() && !aiUnit.getMission$().isOneTime() && aiUnit.getMission$().isValid()) ? 'mission-exists' : null;
  }
  /**
   * Is a target a valid mission target?
   *
   * @param target The target {@code Location} to check.
   * @return A reason for the target to be invalid, or null if none found.
   */
  static invalidTargetReason$Location(target: Location): string {
    return (target == null) ? Mission.TARGETNULL : ((target).isDisposed()) ? 'target-disposed' : null;
  }
  /**
   * Is a target a valid mission target?
   *
   * @param target The target {@code Location} to check.
   * @param owner A {@code Player} that should own
   *     the target.
   * @return A reason for the target to be invalid, or null if none found.
   */
  static invalidTargetReason$Location$Player(target: Location, owner: Player): string {
    let reason = Mission.invalidTargetReason$Location(target);
    return (reason != null) ? reason : (target instanceof Europe && !owner.owns(target)) ? Mission.TARGETOWNERSHIP : (target instanceof Settlement && !owner.owns(target)) ? Mission.TARGETOWNERSHIP : null;
  }
  /**
   * Is there a reason to invalidate mission to move a transportable?
   *
   * @param t The {@code TransportableAIObject} to check.
   * @return A reason for the transport to be invalid, or null if
   *     none found.
   */
  static invalidTransportableReason(t: TransportableAIObject): string {
    if (t == null) {
      return 'null-transportable';
    }
    let l = t.getTransportLocatable();
    if (l == null) {
      return 'null-locatable';
    }
    let carrier = (l.getLocation() instanceof Unit) ? (l.getLocation()) : null;
    let transport = t.getTransport();
    let owner: Player;
    let loc: Location;
    let checkSrc = transport == null;
    if (carrier != null && transport != null && carrier !== transport.getUnit()) {
      return 'transportable-on-other-carrier';
    }
    if (checkSrc) {
      let s: Settlement;
      if ((loc = t.getTransportSource()) == null) {
        return 'transportable-source-missing-' + $J.str(t);
      } else if ((loc).isDisposed()) {
        return 'transportable-source-disposed';
      } else if (loc instanceof Settlement && $J.isa(l, Ownable) && !(l).getOwner().owns(s = loc)) {
        return 'transportable-source-' + s.getName() + '-captured-by-' + s.getOwner().getDebugName();
      }
    } else {
      loc = t.getTransportDestination();
      if (loc != null && (loc).isDisposed()) {
        return 'transportable-destination-disposed';
      }
    }
    return null;
  }
  /**
   * Is another player a valid attack target?
   *
   * @param aiUnit The {@code AIUnit} that will attack.
   * @param other The {@code Player} to attack.
   * @return A reason why the attack would be invalid, or null if none found.
   */
  static invalidAttackReason(aiUnit: AIUnit, other: Player): string {
    let unit = aiUnit.getUnit();
    let player = unit.getOwner();
    return (player === other) ? Mission.TARGETOWNERSHIP : (player.isIndian() && player.getTension$Player(other).getLevel().compareTo(Tension$Level.CONTENT) <= 0) ? 'target-native-tension-too-low' : (player.isEuropean() && !(player.getStance(other) === Stance.WAR || (unit.hasAbility$String(Ability.PIRACY) && player.getStance(other) !== Stance.ALLIANCE))) ? 'target-european-war-absent' : null;
  }
  /**
   * Is an AI unit able to perform a different mission?
   *
   * AIPlayers will call FooMission.invalidReason(aiUnit) to
   * determine whether it is valid to assign some unit to a
   * FooMission, so `interesting' Mission subclasses with complex
   * validity requirements must implement a routine with this
   * signature.  Conversely, simple Missions that are always possible
   * need not.
   *
   * Implementations should usually start by calling this routine
   * (i.e. Mission.invalidReason(AIUnit)).
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return Mission.invalidAIUnitReason(aiUnit);
  }
  /**
   * Is an AI unit able to perform a mission with a specified target?
   *
   * Specific Missions can be invalid for target-related reasons.
   * Such Missions need to implement a routine with this signature,
   * as it will be called by the GoalDeciders in map path find/searches
   * to choose a Mission target.
   *
   * Implementations should usually start by calling either
   * invalidAIUnitReason() or this routine if the target checking is
   * trivial.
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The target {@code Location} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    return (reason != null) ? reason : Mission.invalidTargetReason$Location(loc);
  }
  /**
   * State where a unit is.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @return This {@code Mission}.
   */
  lbAt(lb: LogBuilder): Mission {
    let unit = this.getUnit();
    lb.add([', at ', Location.upLoc(unit.getLocation())]);
    return this;
  }
  /**
   * State that the unit has made an attack.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @param what What is being attacked (a {@code Unit} or
   *     {@code Settlement}).
   * @return This {@code Mission}.
   */
  lbAttack(lb: LogBuilder, what: Location): Mission {
    lb.add([', attacking ', what]);
    return this;
  }
  /**
   * State that the unit is dodging.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @return This {@code Mission}.
   */
  lbDodge(lb: LogBuilder): Mission {
    let unit = this.getUnit();
    lb.add([', dodging at ', unit.getLocation()]);
    unit.setMovesLeft(0);
    return this;
  }
  /**
   * State that this mission has completed successfully.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @param cont If true, the mission should continue, otherwise drop the
   *     mission.
   * @param reasons Reasons for the successful completion.
   * @return The current {@code Mission} of the unit, which may
   *     now be different from {@code this}.
   */
  lbDone(lb: LogBuilder, cont: boolean, reasons: any[]): Mission {
    lb.add([', COMPLETED: ', reasons]);
    return (cont) ? this.aiUnit.getMission$() : this.lbDrop(lb, []);
  }
  /**
   * Drop the current mission.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @param reasons Optional reasons to drop the mission.
   * @return Null, which is now the current {@code Mission} of
   *     this unit.
   */
  lbDrop(lb: LogBuilder, reasons: any[]): Mission {
    lb.add([', DROPPED', reasons]);
    return (this.aiUnit == null) ? null : this.aiUnit.changeMission(null);
  }
  /**
   * The current mission has failed.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @param cont If true, the mission should continue, otherwise drop the
   *     mission.
   * @param reasons Reasons for the successful completion.
   * @return The current {@code Mission} of the unit, which may
   *     not be different from {@code this}.
   */
  lbFail(lb: LogBuilder, cont: boolean, reasons: any[]): Mission {
    lb.add([', FAILED: ', reasons]);
    return (cont) ? this.aiUnit.getMission$() : this.lbDrop(lb, []);
  }
  /**
   * State that a bad move has occurred.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @param mt The bad {@code MoveType}.
   * @return This {@code Mission}.
   */
  lbMove(lb: LogBuilder, mt: Unit$MoveType): Mission {
    lb.add([', bad move type at ', this.getUnit().getLocation(), ': ', mt]);
    return this;
  }
  /**
   * State that the mission has been retargeted.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @return This {@code Mission}.
   */
  lbRetarget(lb: LogBuilder): Mission {
    lb.add([', retargeted ', this.getTarget()]);
    return this;
  }
  /**
   * State that the unit is waiting for something.
   *
   * @param lb A {@code LogBuilder} to log to.
   * @param reasons Reasons for the wait.
   * @return This {@code Mission}.
   */
  lbWait(lb: LogBuilder, reasons: any[]): Mission {
    lb.add(reasons);
    this.getUnit().setMovesLeft(0);
    return this;
  }
  /**
   * Finds a target for a unit without considering its movement
   * abilities.  This is used by missions when the current unit
   * can not find a target with the normal path finding routines,
   * and thus should consider targets that may require a carrier.
   *
   * @param aiUnit The {@code AIUnit} that is searching.
   * @param gd The {@code GoalDecider} that selects targets.
   * @param radius A maximum radius from the unit location to search within.
   * @param deferOK If true, fall back to the nearest port to Europe.
   * @return The best target {@code Tile} found, or null if none.
   */
  static findCircleTarget(aiUnit: AIUnit, gd: GoalDecider, radius: number, deferOK: boolean): Location {
    let unit = aiUnit.getUnit();
    let start = unit.getTile$();
    if (start == null) {
      if (!deferOK) {
        return null;
      }
      let settlement = unit.getOwner().getClosestPortForEurope();
      return (settlement == null) ? null : settlement;
    }
    return unit.getGame().getMap().searchCircle(start, gd, radius);
  }
  /**
   * We have been blocked on the way to a target.  Is it valid to
   * attack the blockage, or should it just be avoided?
   *
   * @param aiUnit The {@code AIUnit} that was blocked.
   * @param target The target {@code Location}.
   * @return The blockage to attack, or null if not.
   */
  static resolveBlockage(aiUnit: AIUnit, target: Location): Location {
    let unit = aiUnit.getUnit();
    let path = unit.findPath$Location(target);
    let d = null;
    if (path != null && path.next_ != null) {
      let tile = path.next_.getTile();
      let settlement = tile.getSettlement();
      let blocker = (settlement != null) ? settlement : tile.getDefendingUnit(unit);
      if (UnitSeekAndDestroyMission.invalidMissionReason$AIUnit$Location(aiUnit, blocker) == null) {
        return blocker;
      }
    }
    return null;
  }
  /**
   * Moves a unit one step randomly.
   *
   * @param logMe A string to log the random number generation with.
   * @param direction An optional preferred {@code Direction}.
   * @return The direction of the move, or null if no move was made.
   */
  moveRandomly(logMe: string, direction: Direction): Direction {
    let unit = this.getUnit();
    if (unit.getMovesLeft() <= 0 || !unit.hasTile()) {
      return null;
    }
    if (logMe == null) {
      logMe = 'moveRandomly';
    }
    let aiRandom = this.getAIRandom();
    if (direction == null) {
      direction = Direction.getRandomDirection(logMe, Mission.logger, aiRandom);
    }
    let directions = direction.getClosestDirections(logMe, Mission.logger, aiRandom);
    for (let d of directions) {
      let moveTo = unit.getTile$().getNeighbourOrNull(d);
      if (moveTo != null && unit.getMoveType$Direction(d) === Unit$MoveType.MOVE && this.aiUnit.move(d)) {
        return d;
      }
    }
    return null;
  }
  /**
   * Moves a unit randomly for the rest of its turn.
   *
   * @param logMe A string to log the random number generation with.
   */
  moveRandomlyTurn(logMe: string): void {
    let direction = null;
    while ((direction = this.moveRandomly(logMe, direction)) != null) {
    }
    this.getUnit().setMovesLeft(0);
  }
  /**
   * Finds the best existing settlement to use as a target.
   * Useful for missions where the unit might be in Europe, but should
   * go to a safe spot in the New World and proceed from there.
   *
   * @param player The {@code Player} that is searching.
   * @return A good settlement to restart a Mission from.
   */
  static getBestSettlement(player: Player): Settlement {
    let comp = CollectionUtils.cachingIntComparator((s) => {
      let value = (s.getUnitCount() + s.getTile$().getUnitCount()) | 0;
      if (s instanceof Colony) {
        let colony = s;
        value = (value + (((colony.isConnectedPort()) ? 10 : 0) + colony.getAvailableWorkLocationsList().size())) | 0;
      }
      return value;
    });
    return CollectionUtils.maximize$Stream$Comparator(player.getSettlements(), comp);
  }
  /**
   * Tries to move this mission's unit to a target location.
   *
   * First check for units in transit, that is units on a carrier that
   * are going to but not yet in Europe, or going to but not yet at
   * a Tile and whose path still requires the carrier.  These need to
   * be handled by the carrier's TransportMission, not by the unit's
   * Mission.
   *
   * Similarly check for units not in transit but should be, that
   * is units not on a carrier but can not get to their target
   * without one.  These must just wait.
   *
   * If there is no impediment to the unit moving towards the target,
   * do so.  Return an indicative MoveType for the result of the travel.
   * - MOVE if the unit has arrived at the target, although it may
   *     have exhausted its moves
   * - MOVE_HIGH_SEAS if the unit has set sail to/from Europe
   * - MOVE_NO_MOVES is underway but ran out of moves
   * - MOVE_NO_ACCESS_EMBARK if progress depends on a carrier, either
   *     currently boarded or due to collect the unit
   * - MOVE_NO_REPAIR if the unit died for whatever reason
   * - MOVE_NO_TILE if there is no path (usually transitory on rivers)
   * - MOVE_ILLEGAL if there is an error or permanent restriction
   * - other legal results (e.g. ENTER_INDIAN_SETTLEMENT*) if that would
   *   occur if the unit proceeded.  Such moves require special handling
   *   and are not performed here, the calling mission code must
   *   handle them.
   *
   * @param target The destination {@code Location}.
   * @param costDecider The {@code CostDecider} to use in any path
   *     finding.
   * @param lb A {@code LogBuilder} to log to.
   * @return The type of move the unit stopped at.
   */
  travelToTarget(target: Location, costDecider: CostDecider, lb: LogBuilder): Unit$MoveType {
    if (target == null) {
      return Unit$MoveType.MOVE_ILLEGAL;
    }
    let targetTile = target.getTile$();
    if (!(target instanceof Europe) && targetTile == null) {
      throw new RuntimeException('Target neither Europe nor Tile: ' + $J.str(target));
    }
    let unit = this.getUnit();
    let aiCarrier = this.aiUnit.getTransport();
    let map = unit.getGame().getMap();
    let path = null;
    let useTransport = false;
    target = Location.upLoc(target);
    if (unit.isAtSea()) {
      lb.add([', at sea']);
      return Unit$MoveType.MOVE_HIGH_SEAS;
    } else if (unit.isOnCarrier()) {
      lb.add([', on carrier']);
      return Unit$MoveType.MOVE_NO_ACCESS_EMBARK;
    } else if (unit.isAtLocation(target)) {
      return Unit$MoveType.MOVE;
    } else if (unit.isInEurope()) {
      if (!unit.getOwner().canMoveToEurope()) {
        lb.add([', impossible move from Europe']);
        return Unit$MoveType.MOVE_ILLEGAL;
      }
      if (unit.getType().canMoveToHighSeas()) {
        unit.setDestination(target);
        if (AIMessage.askMoveTo(this.aiUnit, map)) {
          lb.add([', sailed for ', target]);
          return Unit$MoveType.MOVE_HIGH_SEAS;
        } else {
          lb.add([', failed to sail for ', target]);
          return Unit$MoveType.MOVE_ILLEGAL;
        }
      }
      useTransport = true;
    } else if (!unit.hasTile()) {
      return Unit$MoveType.MOVE_ILLEGAL;
    } else {
      if (target instanceof Europe) {
        if (!unit.getOwner().canMoveToEurope()) {
          lb.add([', impossible move to Europe']);
          return Unit$MoveType.MOVE_ILLEGAL;
        }
        if (!unit.getType().canMoveToHighSeas() || aiCarrier != null) {
          useTransport = true;
        } else {
          path = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(unit.getLocation(), target, null, costDecider, null);
        }
      } else if (aiCarrier != null) {
        useTransport = true;
      } else if (!unit.getType().canMoveToHighSeas() && !Map_.isSameContiguity(target, unit.getLocation())) {
        useTransport = true;
      } else {
        path = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(unit.getLocation(), target, null, costDecider, null);
      }
    }
    if (useTransport) {
      if (aiCarrier != null) {
        let pick: Location;
        let tm: TransportMission;
        let waiting = false;
        let ownPath: PathNode;
        let pathTurns: number;
        let ownTurns: number;
        if ((tm = aiCarrier.getMission$Class($J.cls(TransportMission))) == null) {
          lb.add([', had bogus carrier ', aiCarrier.getUnit()]);
          Mission.logger.warning($J.str(unit) + ' has transport ' + $J.str(aiCarrier) + ' without transport mission');
          this.aiUnit.dropTransport();
          aiCarrier = null;
        } else if ((pick = tm.getTransportTarget(this.aiUnit)) == null) {
          lb.add([', had bogus transport on ', aiCarrier.getUnit()]);
          Mission.logger.warning($J.str(unit) + ' has transport ' + $J.str(aiCarrier) + ' with transport mission but null transport target\n' + tm.toFullString());
          this.aiUnit.dropTransport();
          aiCarrier = null;
        } else if (Map_.isSameLocation(pick, unit.getLocation())) {
          waiting = true;
        } else if ((path = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(unit.getLocation(), pick, null, costDecider, null)) == null) {
          this.lbAt(lb);
          lb.add([', no path to meet ', aiCarrier.getUnit(), ' at ', pick]);
          path = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(unit.getLocation(), target, null, costDecider, null);
          if (path == null) {
            return Unit$MoveType.MOVE_NO_TILE;
          }
          lb.add([', dropped carrier']);
          this.aiUnit.dropTransport();
          aiCarrier = null;
          useTransport = false;
        } else if ((ownPath = unit.findPath$Location$Location$Unit$CostDecider$LogBuilder(unit.getLocation(), target, null, costDecider, null)) == null || (ownTurns = ownPath.getTotalTurns()) > (pathTurns = path.getTotalTurns())) {
          let ret = this.followMapPath(path.next_, lb);
          if (ret !== Unit$MoveType.MOVE) {
            return ret;
          }
          waiting = true;
        } else {
          lb.add([', dropping carrier', aiCarrier.getUnit(), ' as it is faster (', ownTurns, '<', pathTurns, ' without it']);
          this.aiUnit.dropTransport();
          aiCarrier = null;
          path = ownPath;
          useTransport = false;
        }
        if (waiting) {
          this.lbAt(lb);
          lb.add([', wait for ', aiCarrier.getUnit()]);
          return (aiCarrier.getUnit().getMovesLeft() > 0) ? Unit$MoveType.MOVE_NO_ACCESS_EMBARK : Unit$MoveType.MOVE_NO_MOVES;
        }
      }
      if (useTransport && aiCarrier == null) {
        lb.add([', needs transport to ', target]);
        return Unit$MoveType.MOVE_NO_ACCESS_EMBARK;
      }
    }
    if (path == null) {
      this.lbAt(lb);
      lb.add([', no path to ', target]);
      return Unit$MoveType.MOVE_NO_TILE;
    }
    if (path.next_ == null) {
      throw new IllegalStateException('Trivial path found ' + path.fullPathToString() + ' from ' + $J.str(unit.getLocation()) + ' to target ' + $J.str(target) + ' result=' + unit.isAtLocation(target));
    }
    return this.followMapPath(path.next_, lb);
  }
  /**
   * Follow a path that is on the map (except perhaps the last node)
   * and does not use a carrier.
   *
   * @param path The {@code PathNode} to follow.
   * @param lb A {@code LogBuilder} to log to.
   * @return The type of move the unit stopped at.
   */
  followMapPath(path: PathNode, lb: LogBuilder): Unit$MoveType {
    let unit = this.getUnit();
    let target = path.getLastNode().getLocation();
    for (; path != null; path = path.next_) {
      if (unit.isDisposed()) {
        lb.add([', died going to ', Location.upLoc(path.getLocation())]);
        return Unit$MoveType.MOVE_NO_REPAIR;
      } else if (unit.getMovesLeft() <= 0) {
        this.lbAt(lb);
        lb.add([', en route to ', Location.upLoc(target)]);
        return Unit$MoveType.MOVE_NO_MOVES;
      }
      if (path.getLocation() instanceof Europe) {
        if (AIMessage.askMoveTo(this.aiUnit, path.getLocation())) {
          lb.add([', sailed to Europe']);
          return Unit$MoveType.MOVE_HIGH_SEAS;
        } else {
          lb.add([', failed to sail for Europe']);
          return Unit$MoveType.MOVE_ILLEGAL;
        }
      }
      let mt = unit.getMoveType$Direction(path.getDirection());
      if (mt === Unit$MoveType.MOVE_NO_MOVES) {
        unit.setMovesLeft(0);
        this.lbAt(lb);
        return Unit$MoveType.MOVE_NO_MOVES;
      }
      if (!mt.isProgress()) {
        return mt;
      }
      if (!this.aiUnit.move(path.getDirection())) {
        this.lbAt(lb);
        lb.add([', failed to move to ', Location.upLoc(path.getLocation())]);
        return Unit$MoveType.MOVE_ILLEGAL;
      }
    }
    return Unit$MoveType.MOVE;
  }
  /**
   * Retarget a mission because of some problem.
   *
   * @param reason The reason for the retarget.
   * @param lb A {@code LogBuilder} to log to.
   * @return The current {@code Mission}, which has been set to
   *     null on failure to retarget.
   */
  retargetMission(reason: string, lb: LogBuilder): Mission {
    lb.add([', failing(', reason, ')']);
    let newTarget = this.findTarget();
    if (newTarget != null) {
      this.setTarget(newTarget);
      return this.lbRetarget(lb);
    }
    lb.add([', retarget failed']);
    return this.lbDrop(lb, []);
  }
  /**
   * Disposes this mission by removing any references to it.
   */
  dispose(): void {
  }
  /**
   * Get the base transport priority for the unit performing this mission.
   *
   * @return A base transport priority.
   */
  getBaseTransportPriority(): number {
    return 0;
  }
  /**
   * Gets the destination of a required transport.
   *
   * Override this in the child mission classes if there is a useful
   * intermediate point to deliver the unit distinct from the
   * target.
   *
   * @return The mission target, or null if the mission is invalid,
   *     otherwise lacks a target (e.g. UnitWanderHostile), or the
   *     unit does not need transport.
   */
  getTransportDestination(): Location {
    let loc: Location;
    return (!this.isValid()) ? null : ((loc = this.getTarget()) == null) ? null : (!this.getUnit().shouldTakeTransportTo(loc)) ? null : loc;
  }
  /**
   * Should this mission be considered a mere fallback to be replaced
   * at will?
   *
   * Missions are not one-time by default, true one-time missions
   * must override this routine.
   *
   * @return False.
   */
  isOneTime(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  toXML$FreeColXMLWriter(xw: FreeColXMLWriter): void {
    if (this.isValid()) {
      this.toXML$FreeColXMLWriter$String(xw, this.getXMLTagName());
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add([StringUtils.lastPart($J.getClass(this).getName(), '.'), '@', this.hashCode(), '-', this.aiUnit.getUnit(), '->', this.getTarget()]);
    return lb.toString();
  }
  /**
   * A short string explaining the status of the mission.
   *
   * This is used by "Display additional AI mission information" in the debug menu.
   */
  toStringForDebugExtraMissionInfo(): string {
    let targetString = DebugUtils.locationDisplayString(this.getTarget());
    return targetString;
  }
  static $clinit() {
    Mission.logger = Logger.getLogger($J.cls(Mission).getName());
  }
}

$J.define(Mission, 'net.sf.freecol.server.ai.mission.Mission', { kind: 'class', sup: 'net.sf.freecol.server.ai.AIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit': '_Mission' }, returns: { 'isOneTime': 'boolean', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'getBaseTransportPriority': 'int', 'isValid': 'boolean', 'getAIRandom': 'java.util.Random', 'getEuropeanAIPlayer': 'net.sf.freecol.server.ai.EuropeanAIPlayer', 'getAIPlayer': 'net.sf.freecol.server.ai.MissionAIPlayer', 'getPlayer': 'net.sf.freecol.common.model.Player', 'getUnit': 'net.sf.freecol.common.model.Unit', 'getAIUnit': 'net.sf.freecol.server.ai.AIUnit' }, meths: { 'toXML(net.sf.freecol.common.io.FreeColXMLWriter)': 'toXML$FreeColXMLWriter', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit', 'invalidTargetReason(net.sf.freecol.common.model.Location,net.sf.freecol.common.model.Player)': 'invalidTargetReason$Location$Player', 'invalidTargetReason(net.sf.freecol.common.model.Location)': 'invalidTargetReason$Location' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Direction = $J.load('net.sf.freecol.common.model.Direction');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
});
