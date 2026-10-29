// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIUnit.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, ClassCastException, Exception, Level, Logger, RuntimeException, XMLStreamException } from '../../../../../../jre/index.ts';
import { TransportableAIObject } from './TransportableAIObject.ts';

let FreeColException, FreeColDebugger, Ability, FreeColObject, Location, Map_, Unit, UnitLocation, Utils, AIMessage, EuropeanAIPlayer, BuildColonyMission, CashInTreasureTrainMission, DefendSettlementMission, EscortUnitMission, IdleAtSettlementMission, IndianBringGiftMission, IndianDemandMission, Mission, MissionaryMission, PioneeringMission, PrivateerMission, ScoutingMission, TransportMission, UnitSeekAndDestroyMission, UnitWanderHostileMission, UnitWanderMission, WishRealizationMission, WorkInsideColonyMission;

/**
 * Objects of this class contains AI-information for a single {@link Unit}.
 *
 * AIUnits are successfully initialized by a call to
 * {@link #setUnit(Unit)} with a non-null actual {@link Unit}.
 *
 * The method {@link #doMission(LogBuilder)} is called once each turn,
 * by {@link AIPlayer#startWorking()}, to perform the assigned
 * {@code Mission}.  Most of the methods in this class just
 * delegates the call to that mission.
 *
 * @see Mission
 */
export class AIUnit extends TransportableAIObject {
  static logger: Logger = null;
  static readonly TAG: string = 'aiUnit';
  /**
   * The Unit this AIObject contains AI-information for.
   */
  unit: Unit = null;
  /**
   * The mission to which this AI unit has been assigned.
   */
  mission: Mission = null;
  /**
   * Creates a new uninitialized {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _AIUnit$AIMain$String(aiMain: AIMain, id: string): this {
    this._TransportableAIObject$AIMain$String(aiMain, id);
    this.unit = null;
    this.mission = null;
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param unit The unit to make an {@link AIObject} for.
   */
  _AIUnit$AIMain$Unit(aiMain: AIMain, unit: Unit): this {
    this._AIUnit$AIMain$String(aiMain, unit.getId());
    this.unit = unit;
    this.mission = null;
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code AIUnit} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _AIUnit$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._TransportableAIObject$AIMain$FreeColXMLReader(aiMain, xr);
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.getUnit() != null;
  }
  /**
   * Gets the {@code Unit} this {@code AIUnit} controls.
   *
   * @return The {@code Unit}.
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * Set the {@code Unit} this {@code AIUnit} controls.
   *
   * Note: it is an error to change the unit once it is set.
   *
   * @param unit The new {@code Unit}.
   */
  setUnit(unit: Unit): void {
    if (this.unit != null && unit !== this.unit) {
      throw new RuntimeException('Attempt to change AI Unit ' + this.getId() + ' to ' + $J.str(unit) + '\n' + FreeColDebugger.stackTraceToString$());
    }
    this.unit = unit;
  }
  /**
   * Checks if this unit has been assigned a mission.
   *
   * @return True if this unit has a mission.
   */
  hasMission$(): boolean {
    return this.mission != null;
  }
  /**
   * Gets the mission this unit has been assigned.
   *
   * @return The {@code Mission}.
   */
  getMission$(): Mission {
    return this.mission;
  }
  /**
   * Assigns a mission to unit. 
   *
   * @param mission The new {@code Mission}.
   */
  setMission(mission: Mission): void {
    this.mission = mission;
  }
  /**
   * Request a rearrangement of any colony at the current location.
   */
  requestLocalRearrange(): void {
    let loc: Location;
    let colony: Colony;
    let aiColony: AIColony;
    let unit = this.getUnit();
    if (unit != null && (loc = unit.getLocation()) != null && (colony = loc.getColony()) != null && (aiColony = this.getAIMain().getAIColony(colony)) != null) {
      aiColony.requestRearrange();
    }
  }
  /**
   * Take the current carrier as transport, keeping the transport mission/s
   * consistent.
   */
  takeTransport(): void {
    let carrier = this.getUnit().getCarrier();
    let aiCarrier = (carrier == null) ? null : this.getAIMain().getAIUnit(carrier);
    let transport = this.getTransport();
    if (transport !== aiCarrier) {
      if (transport != null) {
        AIUnit.logger.warning('Taking different transport: ' + $J.str(aiCarrier));
        this.dropTransport();
      }
      this.setTransport(aiCarrier);
    }
  }
  /**
   * Get the {@code Player} that owns this AIUnit.
   *
   * @return The owning {@code Player}.
   */
  getOwner(): Player {
    let unit = this.getUnit();
    return (unit == null) ? null : unit.getOwner();
  }
  /**
   * Gets the AIPlayer that owns this AIUnit.
   *
   * @return The owning AIPlayer.
   */
  getAIOwner(): AIPlayer {
    let owner = this.getOwner();
    return (owner == null) ? null : this.getAIMain().getAIPlayer(owner);
  }
  /**
   * Gets the PRNG to use with this unit.
   *
   * @return A {@code Random} instance.
   */
  getAIRandom(): Random {
    let aiOwner = this.getAIOwner();
    return (aiOwner == null) ? null : aiOwner.getAIRandom();
  }
  /**
   * Get a trivial target, usually a safe nearby settlement or Europe.
   *
   * @return A trivial target, or null if none found.
   */
  getTrivialTarget(): Location {
    let unit = this.getUnit();
    let path: PathNode;
    return (unit == null || (path = unit.getTrivialPath()) == null) ? null : Location.upLoc(path.getLastNode().getLocation());
  }
  /**
   * Is this AI unit carrying any cargo (units or goods).
   *
   * @return True if the unit has cargo aboard.
   */
  hasCargo(): boolean {
    let unit = this.getUnit();
    return (unit == null) ? false : unit.hasCargo();
  }
  /**
   * Does this unit have a particular class of mission?
   *
   * @param <T> The type of the mission.
   * @param returnClass The {@code Class} of mission to check.
   * @return True if the mission is of the given class.
   */
  hasMission$Class<T>(returnClass: JClass<T>): boolean {
    return this.getMission$Class(returnClass) != null;
  }
  /**
   * Get the unit mission if it is of a given class.
   *
   * @param <T> The type of the mission.
   * @param returnClass The {@code Class} of the mission.
   * @return The {@code Mission}, or null if it is not of the
   *     given class.
   */
  getMission$Class<T>(returnClass: JClass<T>): T {
    try {
      return returnClass.cast(this.mission);
    } catch ($e0) {
      if ($J.isa($e0, ClassCastException)) {
        let cce = $J.exc($e0);
        return null;
      } else {
        throw $e0;
      }
    }
  }
  /**
   * Performs the mission this unit has been assigned.
   *
   * Do *not* check mission validity.  The mission itself does that,
   * and has special case error handling.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  doMission(lb: LogBuilder): void {
    if (this.mission != null) {
      this.mission.doMission(lb);
    }
  }
  /**
   * Change the mission of a unit.
   *
   * @param mission The new {@code Mission}.
   * @return The new current {@code Mission}.
   */
  changeMission(mission: Mission): Mission {
    if (this.mission === mission) {
      return this.mission;
    }
    this.removeMission();
    this.setMission(mission);
    if (mission != null) {
      this.setTransportPriority(mission.getBaseTransportPriority());
    }
    return this.mission;
  }
  removeMission(): void {
    if (this.mission != null) {
      this.mission.dispose();
      this.mission = null;
    }
  }
  hasDefendSettlementMission(): boolean {
    return this.hasMission$Class($J.cls(DefendSettlementMission));
  }
  isCompleteWishRealizationMission(colony: Colony): boolean {
    let wm = this.getMission$Class($J.cls(WishRealizationMission));
    return (wm != null && Map_.isSameLocation(wm.getTarget(), colony));
  }
  isAvailableForWork(colony: Colony): boolean {
    let m = this.getMission$();
    return (m == null || (m instanceof BuildColonyMission && (Map_.isSameLocation(m.getTarget(), colony.getTile$()) || colony.getUnitCount() <= 1)) || m instanceof DefendSettlementMission || m instanceof IdleAtSettlementMission || m instanceof WorkInsideColonyMission);
  }
  tryWorkInsideColonyMission(aiColony: AIColony, lb: LogBuilder): boolean {
    let wic = this.getMission$Class($J.cls(WorkInsideColonyMission));
    if (wic == null) {
      let aiPlayer = this.getAIOwner();
      if (!(aiPlayer instanceof EuropeanAIPlayer) || (aiPlayer).getWorkInsideColonyMission(this, aiColony) == null) {
        return false;
      }
      lb.add([', ', this.getMission$()]);
      this.dropTransport();
    }
    return true;
  }
  tryPioneeringMission(lb: LogBuilder): boolean {
    let m = this.getMission$();
    let oldTarget = (m == null) ? null : m.getTarget();
    let aiPlayer = this.getAIOwner();
    if (aiPlayer instanceof EuropeanAIPlayer) {
      let euaiPlayer = aiPlayer;
      if (euaiPlayer.getPioneeringMission(this, null) != null) {
        lb.add([', ', this.getMission$()]);
        euaiPlayer.updateTransport(this, oldTarget, lb);
        return true;
      }
    }
    return false;
  }
  trySomeUsefulMission(colony: Colony, lb: LogBuilder): boolean {
    let m = this.getMission$();
    if (m instanceof BuildColonyMission || m instanceof DefendSettlementMission || m instanceof MissionaryMission || m instanceof PioneeringMission || m instanceof ScoutingMission || m instanceof UnitSeekAndDestroyMission) {
      return true;
    }
    let oldTarget = (m == null) ? null : m.getTarget();
    let aiPlayer = this.getAIOwner();
    let unit = this.getUnit();
    if (aiPlayer instanceof EuropeanAIPlayer) {
      let euaiPlayer = this.getAIOwner();
      if (unit.hasAbility$String(Ability.SPEAK_WITH_CHIEF) && (m = euaiPlayer.getScoutingMission(this)) != null) {
        lb.add([', ', m]);
        euaiPlayer.updateTransport(this, oldTarget, lb);
        return true;
      } else if (unit.isDefensiveUnit() && (m = euaiPlayer.getDefendSettlementMission$AIUnit$Settlement(this, colony)) != null) {
        lb.add([', ', m]);
        euaiPlayer.updateTransport(this, oldTarget, lb);
        return true;
      } else if (unit.hasAbility$String(Ability.ESTABLISH_MISSION) && (m = euaiPlayer.getMissionaryMission(this)) != null) {
        lb.add([', ', m]);
        euaiPlayer.updateTransport(this, oldTarget, lb);
        return true;
      }
    }
    return false;
  }
  removeTransportable(ag: AIGoods): void {
    let tm = this.getMission$Class($J.cls(TransportMission));
    if (tm != null) {
      tm.removeTransportable(ag);
    }
  }
  /**
   * Moves a unit to the new world.
   *
   * @return True if there was no c-s problem.
   */
  moveToAmerica(): boolean {
    return AIMessage.askMoveTo(this, this.getOwner().getGame().getMap());
  }
  /**
   * Moves a unit to Europe.
   *
   * @return True if there was no c-s problem.
   */
  moveToEurope(): boolean {
    return AIMessage.askMoveTo(this, this.getOwner().getEurope());
  }
  /**
   * Moves this AI unit.
   *
   * @param direction The {@code Direction} to move.
   * @return True if the move succeeded.
   */
  move(direction: Direction): boolean {
    let unit = this.getUnit();
    let start = unit.getTile$();
    return unit.getMoveType$Direction(direction).isProgress() && AIMessage.askMove(this, direction) && unit.getTile$() !== start;
  }
  /**
   * Equips this AI unit for a particular role.
   *
   * The unit must be at a location where the required goods are available
   * (possibly requiring a purchase, which may fail due to lack of gold
   * or boycotts in effect).
   *
   * @param role The {@code Role} to equip for identifier.
   * @return True if the role change was successful.
   */
  equipForRole(role: Role): boolean {
    let player = this.getOwner();
    let unit = this.getUnit();
    let loc = Location.upLoc(unit.getLocation());
    if (!(loc instanceof UnitLocation)) {
      return false;
    }
    let count = role.getMaximumCount();
    if (count > 0) {
      for (; count > 0; count--) {
        let req = unit.getGoodsDifference(role, count);
        try {
          let price = (loc).priceGoods(req);
          if (player.checkGold(price)) {
            break;
          }
        } catch ($e1) {
          if ($J.isa($e1, FreeColException)) {
            let fce = $J.exc($e1);
            continue;
          } else {
            throw $e1;
          }
        }
      }
      if (count <= 0) {
        return false;
      }
    }
    return AIMessage.askEquipForRole(this, role, count) && unit.getRole() === role && unit.getRoleCount() === count;
  }
  /**
   * Score this AI unit with its suitability for building.
   *
   * Favour unequipped freeColonists, and other unskilled over experts.
   * Also slightly favour units on the map.
   *
   * @return An integer score.
   */
  getBuilderScore(): number {
    let unit = this.getUnit();
    if (unit == null || BuildColonyMission.invalidMissionReason$AIUnit(this) != null) {
      return -1000;
    }
    let ret = (!unit.hasDefaultRole()) ? 0 : (unit.getSkillLevel() > 0) ? 100 : (500 + Math.imul(100, unit.getSkillLevel())) | 0;
    if (unit.hasTile()) {
      ret = (ret + 50) | 0;
    }
    return ret;
  }
  /**
   * Score this AI unit with its suitability for pioneering.
   *
   * @return An integer score.
   */
  getPioneerScore(): number {
    let unit = this.getUnit();
    return (unit == null) ? -1000 : unit.getPioneerScore();
  }
  /**
   * Score this AI unit with its suitability for scouting.
   *
   * @return An integer score.
   */
  getScoutScore(): number {
    let unit = this.getUnit();
    return (unit == null) ? -1000 : unit.getScoutScore();
  }
  /**
   * {@inheritDoc}
   */
  getTransportPriority(): number {
    return (this.hasMission$()) ? super.getTransportPriority() : 0;
  }
  /**
   * {@inheritDoc}
   */
  getTransportLocatable(): Locatable {
    return this.getUnit();
  }
  /**
   * {@inheritDoc}
   */
  getTransportSource(): Location {
    let unit = this.getUnit();
    return (unit == null || unit.isDisposed()) ? null : unit.getLocation();
  }
  /**
   * {@inheritDoc}
   */
  getTransportDestination(): Location {
    let unit = this.getUnit();
    return (unit == null || unit.isDisposed() || !this.hasMission$()) ? null : this.mission.getTransportDestination();
  }
  /**
   * {@inheritDoc}
   */
  getDeliveryPath(carrier: Unit, dst: Location): PathNode {
    if (dst == null) {
      dst = this.getTransportDestination();
      if (dst == null) {
        return null;
      }
    }
    dst = Location.upLoc(dst);
    let path: PathNode;
    let unit = this.getUnit();
    if (unit.getLocation() === carrier) {
      path = unit.findPath$Location$Location$Unit(carrier.getLocation(), dst, carrier);
      if (path == null && dst.getTile$() != null) {
        path = unit.findPathToNeighbour(carrier.getLocation(), dst.getTile$(), carrier, null);
      }
    } else if (unit.getLocation() instanceof Unit) {
      return null;
    } else {
      path = unit.findPath$Location$Location$Unit(unit.getLocation(), dst, carrier);
      if (path == null && dst.getTile$() != null) {
        path = unit.findPathToNeighbour(unit.getLocation(), dst.getTile$(), carrier, null);
      }
    }
    if (path != null) {
      path.ensureDisembark();
    }
    return path;
  }
  /**
   * {@inheritDoc}
   */
  getIntermediatePath(carrier: Unit, dst: Location): PathNode {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  setTransportDestination(destination: Location): void {
    throw new RuntimeException('AI unit transport destination set by mission:' + $J.str(destination));
  }
  /**
   * {@inheritDoc}
   */
  carriableBy(carrier: Unit): boolean {
    return carrier.couldCarry$Unit(this.getUnit());
  }
  /**
   * {@inheritDoc}
   */
  canMove(): boolean {
    return this.getUnit().getMovesLeft() > 0;
  }
  /**
   * {@inheritDoc}
   */
  leaveTransport$(): boolean {
    let unit = this.getUnit();
    if (!unit.isOnCarrier()) {
      return true;
    }
    if (unit.isInEurope()) {
      return this.leaveTransport$Direction(null);
    }
    let tile = unit.getTile$();
    if (tile == null) {
      return false;
    }
    let mission = this.getMission$();
    let target = (mission == null || !mission.isValid()) ? null : mission.getTarget();
    let direction: Direction;
    if (target != null) {
      if (Map_.isSameLocation(target, tile)) {
        return this.leaveTransport$Direction(null);
      }
      if (target.getTile$() != null && (direction = tile.getDirection(target.getTile$())) != null) {
        return this.leaveTransport$Direction(direction);
      }
      let path = unit.findPath$Location(target);
      if (path != null && (direction = tile.getDirection(path.next_.getTile())) != null) {
        try {
          return this.leaveTransport$Direction(direction);
        } catch ($e2) {
          if ($J.isa($e2, Exception)) {
            let e = $J.exc($e2);
            AIUnit.logger.log(Level.WARNING, 'Leave transport crash for ' + $J.str(this) + '/' + unit.getMovesLeft(), e);
          } else {
            throw $e2;
          }
        }
      }
    }
    if (tile.isLand()) {
      return this.leaveTransport$Direction(null);
    }
    let tiles = new ArrayList();
    for (const $it3 = tile.getSurroundingTiles$int(1).iterator(); $it3.hasNext(); ) {
      let t = $it3.next();
      if (!t.isBlocked(unit)) {
        if (t.getSettlement() != null) {
          return this.leaveTransport$Direction(tile.getDirection(t));
        }
        tiles.add(t);
      }
    }
    if (tiles.isEmpty()) {
      return false;
    }
    let player = this.getOwner();
    let safe = tiles.get(0);
    let best = null;
    let bestTurns = Unit.MANY_TURNS;
    let settlement = null;
    for (const $it4 = tiles.iterator(); $it4.hasNext(); ) {
      let t = $it4.next();
      if (settlement == null || t.isConnectedTo(settlement.getTile$())) {
        settlement = t.getNearestSettlement(player, 10, true);
      }
      if (settlement != null) {
        let turns = unit.getTurnsToReach$Location$Location(t, settlement);
        if (bestTurns > turns) {
          bestTurns = turns;
          best = t;
        }
      }
      if (safe.getDefenceValue() < t.getDefenceValue()) {
        safe = t;
      }
    }
    return this.leaveTransport$Direction(tile.getDirection((best != null) ? best : safe));
  }
  /**
   * {@inheritDoc}
   */
  leaveTransport$Direction(direction: Direction): boolean {
    let unit = this.getUnit();
    if (!unit.isOnCarrier()) {
      return false;
    }
    let carrier = unit.getCarrier();
    let result = (direction == null) ? (AIMessage.askDisembark(this) && unit.getLocation() === carrier.getLocation()) : this.move(direction);
    if (result) {
      this.requestLocalRearrange();
      this.dropTransport();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  joinTransport(carrier: Unit, direction: Direction): boolean {
    let aiCarrier = this.getAIMain().getAIUnit(carrier);
    if (aiCarrier == null) {
      return false;
    }
    let unit = this.getUnit();
    let result = AIMessage.askEmbark(aiCarrier, unit, direction) && unit.getLocation() === carrier;
    if (result) {
      this.requestLocalRearrange();
      this.takeTransport();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    let reason = Mission.invalidTransportableReason(this);
    return (reason != null) ? reason : (this.hasMission$()) ? this.getMission$().invalidReason() : null;
  }
  /**
   * Disposes this object and any attached mission.
   */
  dispose(): void {
    this.dropTransport();
    let aiOwner = this.getAIOwner();
    if (aiOwner != null) {
      aiOwner.removeAIObject(this);
    }
    if (this.mission != null) {
      this.mission.dispose();
      this.mission = null;
    }
    super.dispose();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    let unit = this.getUnit();
    if (unit == null) {
      lb.add(['\n  AIUnit with null unit: ', this.getId()]);
      result = result.fail();
    } else if (unit.isDisposed()) {
      lb.add(['\n  AIUnit with disposed unit: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    super.writeChildren(xw);
    if (this.mission != null && !this.mission.isOneTime() && this.mission.isValid()) {
      this.mission.toXML$FreeColXMLWriter(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    let u = xr.findFreeColGameObject(aiMain.getGame(), FreeColObject.ID_ATTRIBUTE_TAG, $J.cls(Unit), null, true);
    if (u.isInitialized()) {
      this.setUnit(u);
    } else {
      xr.nextTag();
      throw new XMLStreamException('AIUnit for uninitialized Unit: ' + u.getId());
    }
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let aiMain = this.getAIMain();
    let tag = xr.getLocalName();
    this.mission = null;
    if ($J.equals(BuildColonyMission.TAG, tag)) {
      this.mission = new BuildColonyMission()._BuildColonyMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(CashInTreasureTrainMission.TAG, tag)) {
      this.mission = new CashInTreasureTrainMission()._CashInTreasureTrainMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(DefendSettlementMission.TAG, tag)) {
      this.mission = new DefendSettlementMission()._DefendSettlementMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(EscortUnitMission.TAG, tag)) {
      this.mission = new EscortUnitMission()._EscortUnitMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(IdleAtSettlementMission.TAG, tag)) {
      this.mission = new IdleAtSettlementMission()._IdleAtSettlementMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(IndianBringGiftMission.TAG, tag)) {
      this.mission = new IndianBringGiftMission()._IndianBringGiftMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(IndianDemandMission.TAG, tag)) {
      this.mission = new IndianDemandMission()._IndianDemandMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(MissionaryMission.TAG, tag)) {
      this.mission = new MissionaryMission()._MissionaryMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(PioneeringMission.TAG, tag)) {
      this.mission = new PioneeringMission()._PioneeringMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(PrivateerMission.TAG, tag)) {
      this.mission = new PrivateerMission()._PrivateerMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(ScoutingMission.TAG, tag)) {
      this.mission = new ScoutingMission()._ScoutingMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(TransportMission.TAG, tag)) {
      this.mission = new TransportMission()._TransportMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(UnitSeekAndDestroyMission.TAG, tag)) {
      this.mission = new UnitSeekAndDestroyMission()._UnitSeekAndDestroyMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(UnitWanderHostileMission.TAG, tag)) {
      this.mission = new UnitWanderHostileMission()._UnitWanderHostileMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(UnitWanderMission.TAG, tag)) {
      this.mission = new UnitWanderMission()._UnitWanderMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(WishRealizationMission.TAG, tag)) {
      this.mission = new WishRealizationMission()._WishRealizationMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else if ($J.equals(WorkInsideColonyMission.TAG, tag)) {
      this.mission = new WorkInsideColonyMission()._WorkInsideColonyMission$AIMain$AIUnit$FreeColXMLReader(aiMain, this, xr);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return AIUnit.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof AIUnit)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.unit, other.unit) && Utils.equals(this.mission, other.mission) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.unit)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.mission)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return (this.unit == null) ? 'AIUnit-null' : this.unit.toString$String('AIUnit ');
  }
  static $clinit() {
    AIUnit.logger = Logger.getLogger($J.cls(AIUnit).getName());
  }
}

$J.define(AIUnit, 'net.sf.freecol.server.ai.AIUnit', { kind: 'class', sup: 'net.sf.freecol.server.ai.TransportableAIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_AIUnit$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Unit': '_AIUnit$AIMain$Unit', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_AIUnit$AIMain$String' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'getTransportSource': 'net.sf.freecol.common.model.Location', 'getTransportLocatable': 'net.sf.freecol.common.model.Locatable', 'getTransportPriority': 'int', 'getScoutScore': 'int', 'getPioneerScore': 'int', 'getBuilderScore': 'int', 'hasDefendSettlementMission': 'boolean', 'hasCargo': 'boolean', 'getTrivialTarget': 'net.sf.freecol.common.model.Location', 'getAIRandom': 'java.util.Random', 'getAIOwner': 'net.sf.freecol.server.ai.AIPlayer', 'getOwner': 'net.sf.freecol.common.model.Player', 'getMission$': 'net.sf.freecol.server.ai.mission.Mission', 'hasMission$': 'boolean', 'getUnit': 'net.sf.freecol.common.model.Unit' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder', 'leaveTransport(net.sf.freecol.common.model.Direction)': 'leaveTransport$Direction', 'leaveTransport()': 'leaveTransport$', 'getMission(java.lang.Class)': 'getMission$Class', 'hasMission(java.lang.Class)': 'hasMission$Class', 'getMission()': 'getMission$', 'hasMission()': 'hasMission$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  UnitLocation = $J.load('net.sf.freecol.common.model.UnitLocation');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  EuropeanAIPlayer = $J.load('net.sf.freecol.server.ai.EuropeanAIPlayer');
  BuildColonyMission = $J.load('net.sf.freecol.server.ai.mission.BuildColonyMission');
  CashInTreasureTrainMission = $J.load('net.sf.freecol.server.ai.mission.CashInTreasureTrainMission');
  DefendSettlementMission = $J.load('net.sf.freecol.server.ai.mission.DefendSettlementMission');
  EscortUnitMission = $J.load('net.sf.freecol.server.ai.mission.EscortUnitMission');
  IdleAtSettlementMission = $J.load('net.sf.freecol.server.ai.mission.IdleAtSettlementMission');
  IndianBringGiftMission = $J.load('net.sf.freecol.server.ai.mission.IndianBringGiftMission');
  IndianDemandMission = $J.load('net.sf.freecol.server.ai.mission.IndianDemandMission');
  Mission = $J.load('net.sf.freecol.server.ai.mission.Mission');
  MissionaryMission = $J.load('net.sf.freecol.server.ai.mission.MissionaryMission');
  PioneeringMission = $J.load('net.sf.freecol.server.ai.mission.PioneeringMission');
  PrivateerMission = $J.load('net.sf.freecol.server.ai.mission.PrivateerMission');
  ScoutingMission = $J.load('net.sf.freecol.server.ai.mission.ScoutingMission');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
  UnitSeekAndDestroyMission = $J.load('net.sf.freecol.server.ai.mission.UnitSeekAndDestroyMission');
  UnitWanderHostileMission = $J.load('net.sf.freecol.server.ai.mission.UnitWanderHostileMission');
  UnitWanderMission = $J.load('net.sf.freecol.server.ai.mission.UnitWanderMission');
  WishRealizationMission = $J.load('net.sf.freecol.server.ai.mission.WishRealizationMission');
  WorkInsideColonyMission = $J.load('net.sf.freecol.server.ai.mission.WorkInsideColonyMission');
});
