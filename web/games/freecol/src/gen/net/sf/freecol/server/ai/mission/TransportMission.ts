// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/mission/TransportMission.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalStateException, JEnum, JString, Logger, RuntimeException, StringBuilder } from '../../../../../../../jre/index.ts';
import { Mission } from './Mission.ts';

let FreeColException, AbstractGoods, Colony, Constants, Europe, Goods, Location, Map_, Tile, Unit, Unit$MoveType, UnitLocation$NoAddReason, CostDeciders, CollectionUtils, LogBuilder, AIGoods, AIMessage, AIUnit, Cargo, Cargo$CargoMode;

/**
 * Mission for transporting units and goods on a carrier.
 *
 * @see net.sf.freecol.common.model.Unit Unit
 */
export class TransportMission extends Mission {
  static logger: Logger = null;
  static readonly TAG: string = 'transportMission';
  static readonly tag: string = 'AI transport';
  /**
   * Insist transport lists remain simple by imposing an upper bound
   * on the distinct destination locations to visit.
   */
  static readonly DESTINATION_UPPER_BOUND: number = 4;
  static readonly MINIMUM_GOLD_TO_STAY_IN_EUROPE: number = 600;
  /**
   * A list of {@code Cargo}s to work on.
   */
  cargoes: List<Cargo> = null;
  /**
   * The current target location to travel to.
   */
  target: Location = null;
  static readonly TARGET_TAG: string = 'target';
  $init_TransportMission() {
    this.cargoes = new ArrayList();
  }
  /**
   * Creates a mission for the given {@code AIUnit}.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   */
  _TransportMission$AIMain$AIUnit(aiMain: AIMain, aiUnit: AIUnit): this {
    this._Mission(aiMain, aiUnit);
    this.$init_TransportMission();
    this.setTarget(aiUnit.getTrivialTarget());
    return this;
  }
  /**
   * Creates a new {@code TransportMission} from a reader.
   *
   * @param aiMain The main AI-object.
   * @param aiUnit The {@code AIUnit} this mission is created for.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered during parsing.
   * @see net.sf.freecol.server.ai.AIObject#readFromXML
   */
  _TransportMission$AIMain$AIUnit$FreeColXMLReader(aiMain: AIMain, aiUnit: AIUnit, xr: FreeColXMLReader): this {
    this._Mission(aiMain, aiUnit);
    this.$init_TransportMission();
    this.readFromXML(xr);
    return this;
  }
  /**
   * Disposes of this {@code Mission}.
   */
  dispose(): void {
    TransportMission.logger.finest(TransportMission.tag + ' disposing (' + this.clearCargoes() + '): ' + $J.str(this));
    super.dispose();
  }
  /**
   * Checks if the carrier using this mission is carrying the given
   * {@code TransportableAIObject}.
   *
   * @param t The {@code TransportableAIObject} to check.
   * @return True if the carrier is carrying the transportable.
   */
  isCarrying(t: TransportableAIObject): boolean {
    return t != null && t.getLocation() === this.getUnit();
  }
  /**
   * Is a transportable waiting for delivery on the cargoes list?
   *
   * @param t The {@code TransportableAIObject} to check.
   * @return True if the transportable is queued in this mission.
   */
  isTransporting(t: TransportableAIObject): boolean {
    return this.tFind(t) != null;
  }
  /**
   * Decide if this unit has a good chance of defeating another.
   * If there is cargo aboard, be more conservative.
   *
   * FIXME: magic numbers to the spec.
   *
   * @param other The other {@code Unit} to attack.
   * @return True if the attack should proceed.
   */
  shouldAttack(other: Unit): boolean {
    if (Mission.invalidAttackReason(this.getAIUnit(), other.getOwner()) != null) {
      return false;
    }
    let carrier = this.getUnit();
    let cm = this.getGame().getCombatModel();
    let offence = cm.getOffencePower$FreeColGameObject$FreeColGameObject(carrier, other) * ((carrier.hasCargo()) ? 0.3 : 0.8);
    return offence > cm.getOffencePower$FreeColGameObject$FreeColGameObject(other, carrier);
  }
  /**
   * Gets the cargoes.
   *
   * @return A copy of the list of cargoes.
   */
  tCopy(): List<Cargo> {
    {
      return new ArrayList(this.cargoes);
    }
  }
  /**
   * Clears the cargoes list.
   *
   * @return The old cargoes list.
   */
  tClear(): List<Cargo> {
    let old = new ArrayList();
    {
      old.addAll(this.cargoes);
      this.cargoes.clear();
    }
    return old;
  }
  /**
   * Sets the cargoes to a new list.
   *
   * @param nxt The new cargoes list.
   * @param setSpace If true, call tSpace to reset the space left values.
   * @return The old cargoes list.
   */
  tSet(nxt: List<Cargo>, setSpace: boolean): List<Cargo> {
    let old = this.tCopy();
    {
      this.cargoes.clear();
      this.cargoes.addAll(CollectionUtils.transform$Collection$Predicate(nxt, ($p0) => $p0.isValid()));
      if (setSpace) {
        this.tSpace();
      }
    }
    this.tRetarget();
    return old;
  }
  /**
   * Gets the size of the cargoes.
   *
   * @return The size of the cargoes.
   */
  tSize(): number {
    let size: number;
    {
      size = this.cargoes.size();
    }
    return size;
  }
  /**
   * Find a {@code Cargo} with the given
   * {@code TransportableAIObject}.
   *
   * @param t The {@code TransportableAIObject} to look for.
   * @return The {@code Cargo} found, or null if none found.
   */
  tFind(t: TransportableAIObject): Cargo {
    {
      return CollectionUtils.find$Collection$Predicate(this.cargoes, (c) => c.getTransportable() === t);
    }
  }
  /**
   * Gets the first cargo.
   *
   * @return The first valid cargo, or null if none found.
   */
  tFirst(): Cargo {
    {
      return CollectionUtils.find$Collection$Predicate(this.cargoes, ($p0) => $p0.isValid());
    }
  }
  /**
   * Adds a cargo to the cargoes list.
   *
   * @param cargo The {@code Cargo} to add.
   * @param index The position to add it.
   * @return True if the addition succeeded or the cargo was already present.
   */
  tAdd(cargo: Cargo, index: number): boolean {
    if (!cargo.isValid()) {
      return false;
    }
    if (this.tFind(cargo.getTransportable()) != null) {
      return true;
    }
    let change = false;
    {
      change = this.cargoes.isEmpty() || index === 0;
      if (index >= 0) {
        this.cargoes.add(index, cargo);
      } else {
        this.cargoes.add(cargo);
      }
      this.tSpace();
    }
    if (change) {
      this.tRetarget();
    }
    return true;
  }
  /**
   * Remove a cargo from the cargoes list.
   *
   * @param cargo The {@code Cargo} to remove.
   * @return True if the remove succeeded.
   */
  tRemove(cargo: Cargo): boolean {
    let result = false;
    let change = false;
    let t = cargo.getTransportable();
    {
      for (let i = 0; i < this.cargoes.size(); i++) {
        if (this.cargoes.get(i).getTransportable() === t) {
          this.cargoes.removeAt(i);
          this.tSpace();
          change = i === 0;
          result = true;
          break;
        }
      }
    }
    if (change) {
      this.tRetarget();
    }
    return result;
  }
  /**
   * Sets the spaceLeft fields in the cargoes.
   * To be called with synchronized (cargoes).
   */
  tSpace(): void {
    let carrier = this.getUnit();
    let maxHolds = carrier.getCargoCapacity();
    let holds = carrier.getCargoSpaceTaken();
    for (const $it0 = this.cargoes.iterator(); $it0.hasNext(); ) {
      let cargo = $it0.next();
      if (!cargo.isValid()) {
        continue;
      }
      holds = (holds + cargo.getNewSpace()) | 0;
      cargo.setSpaceLeft((maxHolds - holds) | 0);
    }
  }
  /**
   * Reset the carrier target after a change to the first cargo.
   */
  tRetarget(): void {
    let c: Cargo;
    {
      c = CollectionUtils.find$Collection$Predicate(this.cargoes, ($p0) => $p0.isValid());
    }
    this.setTarget(Location.upLoc((c == null) ? this.getAIUnit().getTrivialTarget() : c.getCarrierTarget()));
  }
  /**
   * Count distinct non-adjacent destinations in a list of cargoes.
   *
   * @return The number of distinct destinations.
   */
  destinationCount(): number {
    let now = null;
    let ret = 0;
    for (const $it1 = this.tCopy().iterator(); $it1.hasNext(); ) {
      let cargo = $it1.next();
      let t = cargo.getCarrierTarget();
      if (!Map_.isSameLocation(now, t)) {
        ret++;
        now = t;
      }
    }
    return ret;
  }
  /**
   * How many more destinations are desirable on the current cargoes list?
   * Must be public!  This is checked in European AI player.
   *
   * @return The number of desired extra destinations.
   */
  destinationCapacity(): number {
    return (TransportMission.DESTINATION_UPPER_BOUND - this.destinationCount()) | 0;
  }
  /**
   * If this carrier is the current carrier of a transportable, drop it.
   *
   * @param t The {@code TransportableAIObject} to check.
   */
  dropTransportable(t: TransportableAIObject): void {
    let carrier = this.getAIUnit();
    if (t.getTransport() === carrier) {
      t.setTransport(null);
    }
  }
  /**
   * If this carrier is the not the current carrier of a
   * transportable, make it so.
   *
   * @param t The {@code TransportableAIObject} to check.
   */
  takeTransportable(t: TransportableAIObject): void {
    let carrier = this.getAIUnit();
    if (t.getTransport() !== carrier) {
      t.setTransport(carrier);
    }
  }
  /**
   * Get the collection location for an uncollected transportable.
   *
   * Public so that mobile transportables (units) can move to the
   * collection point.
   *
   * @param t The {@code TransportableAIObject} to collect.
   * @return The collection {@code Location}, or null if not found.
   */
  getTransportTarget(t: TransportableAIObject): Location {
    if (this.isCarrying(t)) {
      return null;
    }
    let cargo = this.tFind(t);
    return (cargo == null) ? null : cargo.getTransportTarget();
  }
  /**
   * Get the expected turns for an uncollected transport
   *
   * Public so that mobile transportables (units) can renege on
   * transport if they find themselves better able to get there
   * themselves.
   *
   * @param t The {@code TransportableAIObject} to collect.
   * @return The expected transport turns.
   */
  getTransportTurns(t: TransportableAIObject): number {
    if (this.isCarrying(t)) {
      return Constants.INFINITY;
    }
    let cargo = this.tFind(t);
    return (cargo == null) ? Constants.INFINITY : cargo.getTurns();
  }
  /**
   * Wrap up the compatible cargoes in a list.
   * O(N^2) alas.
   *
   * @return A wrapped list of cargoes.
   */
  wrapCargoes(): List<Cargo> {
    let ts = this.tCopy();
    for (let i = 0; i < ((ts.size() - 1) | 0); i++) {
      let head = ts.get(i);
      while (((i + 1) | 0) < ts.size() && head.couldWrap(ts.get((i + 1) | 0))) {
        head.wrap(ts.removeAt((i + 1) | 0));
      }
    }
    return ts;
  }
  /**
   * Unwrap a wrapped list of cargoes.
   *
   * @param ts The list of {@code Cargo}s to unwrap.
   * @return The unwrapped list of cargoes.
   */
  unwrapCargoes(ts: List<Cargo>): List<Cargo> {
    for (let i = 0; i < ts.size(); i++) {
      let t = ts.get(i);
      if (t.hasWrapped()) {
        let tl = t.unwrap();
        ts.addAll((i + 1) | 0, tl);
        i = (i + tl.size()) | 0;
      }
    }
    return ts;
  }
  /**
   * Clears all the cargoes.
   *
   * @return A message about the cargoes being cleared.
   */
  clearCargoes(): string {
    let sb = new StringBuilder(64);
    sb.append('cargoes cleared: ');
    for (const $it2 = this.tClear().iterator(); $it2.hasNext(); ) {
      let cargo = $it2.next();
      this.dropTransportable(cargo.getTransportable());
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(cargo));
    }
    this.tRetarget();
    return sb.toString();
  }
  /**
   * Is there nothing currently queued for this carrier?
   *
   * @return True if there is no work allocated to this carrier.
   */
  isEmpty(): boolean {
    return this.tSize() === 0;
  }
  /**
   * For a given transportable, work out where the carrier has to go to
   * advance the cargo (target), and what to do there (mode), allowing
   * a new {@code Cargo} to be defined.
   *
   * AIUnit cargo is harder than AIGoods, because AIUnits might have their
   * own inland paths, and thus we need to consider drop nodes.
   *
   * @param t The {@code TransportableAIObject} to consider.
   * @param lb A {@code LogBuilder} to log to.
   * @return A new {@code Cargo} defining the action to take
   *     with the {@code TransportableAIObject}, or null if impossible.
   */
  makeCargo(t: TransportableAIObject, lb: LogBuilder): Cargo {
    let carrier = this.getUnit();
    let reason: string;
    let cargo = null;
    if (t.getTransportDestination() == null) {
      if (!this.isCarrying(t)) {
        reason = 'null transport destination';
      } else {
        let path = carrier.getTrivialPath();
        if (path == null) {
          reason = 'null transport destination';
        } else {
          try {
            reason = null;
            cargo = Cargo.newCargo$TransportableAIObject$Unit$Location$boolean(t, carrier, path.getLastNode().getLocation(), true);
          } catch ($e3) {
            if ($J.isa($e3, FreeColException)) {
              let fce = $J.exc($e3);
              reason = fce.getMessage();
              cargo = null;
            } else {
              throw $e3;
            }
          }
        }
      }
    } else if (!this.isCarrying(t) && !t.carriableBy(carrier)) {
      reason = 'carrier ' + carrier.toShortString() + ' can not carry';
    } else {
      try {
        reason = null;
        cargo = Cargo.newCargo$TransportableAIObject$Unit(t, carrier);
      } catch ($e4) {
        if ($J.isa($e4, FreeColException)) {
          let fce = $J.exc($e4);
          reason = fce.getMessage();
          cargo = null;
        } else {
          throw $e4;
        }
      }
    }
    if (reason == null) {
      lb.add([', made ', cargo.toShortString()]);
      return cargo;
    } else {
      lb.add([', failed to make cargo for ', t, ' (', reason, ')']);
      return null;
    }
  }
  /**
   * Add the given Cargo to the cargoes list.
   *
   * @param cargo The {@code Cargo} to add.
   * @param index The index of where to add the cargo.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the cargo was added.
   */
  addCargo(cargo: Cargo, index: number, lb: LogBuilder): boolean {
    let result = this.tAdd(cargo, index);
    if (result) {
      this.takeTransportable(cargo.getTransportable());
    }
    if (result) {
      lb.add([', added ', cargo.toShortString(), ' at ', ((index < 0) ? 'end' : String(index))]);
    } else {
      lb.add([', failed to add ', cargo.toShortString()]);
    }
    return result;
  }
  /**
   * Removes the given Cargo from the cargoes list.
   *
   * @param cargo The {@code Cargo} to remove.
   */
  removeCargo(cargo: Cargo): void {
    if (!this.tRemove(cargo)) {
      throw new RuntimeException('removeCargo ' + cargo.toShortString());
    }
    this.dropTransportable(cargo.getTransportable());
  }
  /**
   * Is there space available for a new cargo?
   *
   * @param cargo The {@code Cargo} to check.
   * @return True if there is space available for this cargo.
   */
  spaceAvailable$Cargo(cargo: Cargo): boolean {
    return this.spaceAvailable$TransportableAIObject(cargo.getTransportable());
  }
  /**
   * Is there space available for a new cargo?
   *
   * @param t The {@code TransportableAIObject} to check.
   * @return True if there is space available for this transportable.
   */
  spaceAvailable$TransportableAIObject(t: TransportableAIObject): boolean {
    let ts = this.tCopy();
    let newSpace = t.getSpaceTaken();
    for (let i = (ts.size() - 1) | 0; i >= 0; i--) {
      if (ts.get(i).getSpaceLeft() < newSpace) {
        return false;
      }
    }
    return true;
  }
  /**
   * Incrementally queue a cargo to the cargoes list.
   *
   * If the carrier is at the collection point favour immediate
   * collection.  Otherwise try to place it with other cargoes with
   * the same target, but do not break the space restrictions.  If
   * this does not work, it has to go at the end.
   *
   * @param cargo The new {@code Cargo} to add.
   * @param requireMatch Fail if an existing destination is not matched.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the cargo was queued.
   */
  queueCargo(cargo: Cargo, requireMatch: boolean, lb: LogBuilder): boolean {
    let carrier = this.getUnit();
    let ts = this.tCopy();
    let candidate = -1;
    if (ts.isEmpty() || (Map_.isSameLocation(carrier.getLocation(), cargo.getCarrierTarget()) && cargo.canQueueAt(carrier, 0, ts))) {
      candidate = 0;
    }
    if (candidate < 0) {
      for (let i = 0; i < ts.size(); i++) {
        let tr = ts.get(i);
        if (Map_.isSameLocation(tr.getCarrierTarget(), cargo.getCarrierTarget())) {
          if (!cargo.canQueueAt(carrier, i, ts)) {
            continue;
          }
          candidate = i;
          break;
        }
      }
    }
    if (candidate < 0) {
      if (requireMatch) {
        return false;
      }
      candidate = ts.size();
    }
    return this.addCargo(cargo, candidate, lb);
  }
  /**
   * Dump a currently carried cargo.
   *
   * @param cargo The {@code Cargo} to dump.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the cargo is no longer on board and not on the
   *     transport list, or is on board but is scheduled to be dumped.
   */
  dumpCargo(cargo: Cargo, lb: LogBuilder): boolean {
    let t = cargo.getTransportable();
    if (this.isCarrying(t)) {
      t.leaveTransport$();
    }
    if (!this.isCarrying(t) && this.tFind(t) != null) {
      this.removeCargo(cargo);
    }
    if (this.tFind(t) != null) {
      let reason = cargo.dump();
      if (reason != null) {
        lb.add([', dump failed(', reason, ')']);
        return false;
      } else {
        lb.add([', dumping']);
      }
    }
    return true;
  }
  /**
   * Requeue an existing cargo.  Typically done when the target changes.
   *
   * @param cargo The {@code Cargo} to requeue.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the queuing succeeded.
   */
  requeueCargo(cargo: Cargo, lb: LogBuilder): boolean {
    let t = cargo.getTransportable();
    let ret = false;
    // assert tFind(t) == cargo
    let reason = cargo.update();
    if (reason != null) {
      lb.add([' requeue/update fail(', reason, ') ', cargo.toShortString()]);
      this.dumpCargo(cargo, lb);
    } else if (!this.tRemove(cargo)) {
      lb.add([' requeue/remove fail ', cargo.toShortString()]);
    } else if (!this.queueCargo(cargo, false, lb)) {
      lb.add([' requeue/queue fail ', cargo.toShortString()]);
      this.dropTransportable(t);
    } else {
      lb.add([' requeued(', cargo.getTransportTarget(), ') ', cargo.toShortString()]);
      this.takeTransportable(t);
      ret = true;
    }
    return ret;
  }
  /**
   * Checks for invalid cargoes, and units and goods on board but
   * not in the cargoes list.  On exit from this routine, every
   * cargo on board should be on the cargoes list but the list is
   * not necessarily going to be in a sensible order.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  checkCargoes(lb: LogBuilder): void {
    let carrier = this.getUnit();
    if (carrier.isAtSea()) {
      return;
    }
    let aiCarrier = this.getAIUnit();
    let unitsPresent = carrier.getUnitList();
    let goodsPresent = carrier.getCompactGoodsList();
    let todo = new ArrayList();
    let drop = new ArrayList();
    let reason: string;
    let path: PathNode;
    let dump: boolean;
    lb.add([' [check']);
    for (const $it5 = this.tCopy().iterator(); $it5.hasNext(); ) {
      let cargo = $it5.next();
      dump = false;
      let t = cargo.getTransportable();
      reason = TransportMission.invalidMissionReason$AIUnit$Location(aiCarrier, cargo.getCarrierTarget());
      if (reason != null || (reason = cargo.check(aiCarrier)) != null) {
        this.removeCargo(cargo);
        lb.add([', INVALID(', reason, ') ', cargo.toShortString()]);
      } else if (cargo.isDelivered()) {
        this.removeCargo(cargo);
        lb.add([', COMPLETED ', cargo.toShortString()]);
      } else if (!cargo.hasPath() && !cargo.retry()) {
        reason = ' no-path';
        dump = true;
      } else if (carrier.hasTile() && (reason = cargo.update()) != null) {
        if (reason.startsWith('invalid')) {
          this.removeCargo(cargo);
          lb.add([', FAIL(', reason, ') ', cargo.toShortString()]);
        } else if (cargo.retry()) {
          lb.add([', retry-', cargo.getTries(), '(', reason, ')']);
        } else {
          dump = true;
        }
      } else if (cargo.isCollectable()) {
        lb.add([', collect ', cargo.toShortString()]);
      } else if (cargo.isDeliverable()) {
        lb.add([', deliver ', cargo.toShortString()]);
      } else {
        lb.add([', ok ', cargo.toShortString()]);
        cargo.resetTries();
      }
      if (dump) {
        if (cargo.isCarried()) {
          this.dumpCargo(cargo, lb);
        } else {
          this.removeCargo(cargo);
          lb.add([', dropped(', reason, ') ', cargo.toShortString()]);
        }
      }
      if (t instanceof AIUnit) {
        unitsPresent.remove((t).getUnit());
      } else if (t instanceof AIGoods) {
        let goods = (t).getGoods();
        if (goods != null) {
          CollectionUtils.removeInPlace$Collection$Predicate(goodsPresent, AbstractGoods.matches(goods.getType()));
        }
      }
    }
    if (!unitsPresent.isEmpty()) {
      lb.add([', found unexpected units']);
      for (const $it6 = unitsPresent.iterator(); $it6.hasNext(); ) {
        let u = $it6.next();
        let aiu = this.getAIMain().getAIUnit(u);
        if (aiu == null) {
          throw new IllegalStateException('Bogus:' + $J.str(u));
        }
        todo.add(aiu);
      }
    }
    if (!goodsPresent.isEmpty()) {
      lb.add([', found unexpected goods']);
      for (const $it7 = goodsPresent.iterator(); $it7.hasNext(); ) {
        let g = $it7.next();
        let aig = new AIGoods()._AIGoods$AIMain$Location$GoodsType$int$Location(this.getAIMain(), carrier, g.getType(), g.getAmount(), null);
        todo.add(aig);
      }
    }
    while (!todo.isEmpty()) {
      let t = todo.removeAt(0);
      if (!this.queueTransportable(t, false, lb)) {
        drop.add(t);
      }
    }
    if (!drop.isEmpty()) {
      path = carrier.getTrivialPath();
      let end = (path == null) ? null : path.getLastNode().getLocation();
      while (!drop.isEmpty()) {
        let t = drop.removeAt(0);
        if (t.leaveTransport$()) {
          lb.add([' ', t, ' left']);
        } else if (end != null) {
          try {
            let cargo = Cargo.newCargo$TransportableAIObject$Unit$Location$boolean(t, carrier, end, false);
            let result = this.queueCargo(cargo, false, lb);
            lb.add([' to drop at ', Location.upLoc(end), '=', result]);
          } catch ($e8) {
            if ($J.isa($e8, FreeColException)) {
              let fce = $J.exc($e8);
              lb.add([' ', t, ' drop-fail(', fce.getMessage(), ')']);
            } else {
              throw $e8;
            }
          }
        } else {
          lb.add([' ', t, ' stuck']);
        }
      }
    }
    lb.add([']']);
  }
  /**
   * Check a {@code Cargo} for continued validity and
   * whether action is needed at the current location.
   *
   * @param cargo The {@code Cargo} to check.
   * @param lb A {@code LogBuilder} to log to.
   * @return TCONTINUE if the {@code Cargo} should continue,
   *     TDONE if it has completed,
   *     TFAIL if it has failed,
   *     TNEXT if it has progressed to the next stage,
   *     TRETRY if a blockage has occurred and it should be retried,
   */
  tryCargo(cargo: Cargo, lb: LogBuilder): TransportMission$CargoResult {
    let carrier = this.getUnit();
    let here = carrier.getLocation();
    let t = cargo.getTransportable();
    let l = t.getTransportLocatable();
    if (l == null) {
      TransportMission.logger.warning('Null-locatable: ' + $J.str(cargo));
      return TransportMission$CargoResult.TDONE;
    }
    if (!Map_.isSameLocation(here, cargo.getCarrierTarget())) {
      lb.add([', ', t, ' unready']);
      return TransportMission$CargoResult.TCONTINUE;
    }
    let d = null;
    let tloc = here;
    {
      let reason: string;
      switch (cargo.getMode()) {
        case Cargo$CargoMode.PICKUP:
          if (!t.canMove()) {
            lb.add([', ', t, ' out of moves']);
            return TransportMission$CargoResult.TCONTINUE;
          }
          if ((d = cargo.getJoinDirection()) == null) {
            TransportMission.logger.warning('Null pickup direction for ' + cargo.toShortString() + ' at ' + $J.str(t.getLocation()) + ' to ' + $J.str(carrier));
            return TransportMission$CargoResult.TFAIL;
          }
          tloc = tloc.getTile$().getNeighbourOrNull(d.getReverseDirection());
        case Cargo$CargoMode.LOAD:
          if (!Map_.isSameLocation(tloc, t.getLocation())) {
            lb.add([', ', t, ' at ', t.getLocation(), ' not ', tloc, ' # ', cargo.toShortString()]);
            return TransportMission$CargoResult.TCONTINUE;
          }
          switch (carrier.getNoAddReason(l)) {
            case UnitLocation$NoAddReason.NONE:
              if (!t.joinTransport(carrier, d)) {
                lb.add([', ', t, ' NO-JOIN']);
                return TransportMission$CargoResult.TFAIL;
              }
              break;
            case UnitLocation$NoAddReason.ALREADY_PRESENT:
              break;
            case UnitLocation$NoAddReason.CAPACITY_EXCEEDED:
              if (l instanceof Goods) {
                let g = l;
                let loadableAmount = carrier.getLoadableAmount(g.getType());
                if (loadableAmount > 0) {
                  g.setAmount(loadableAmount);
                  if (!t.joinTransport(carrier, d)) {
                    lb.add([', ', t, ' NO-JOIN-PARTIAL']);
                    return TransportMission$CargoResult.TFAIL;
                  }
                  break;
                }
              }
              lb.add([', ', t, ' NO-ROOM on ', carrier]);
              return TransportMission$CargoResult.TFAIL;
            default:
              lb.add([', ', t, ' retry-', carrier.getNoAddReason(l)]);
              return TransportMission$CargoResult.TRETRY;
          }
          reason = cargo.update();
          if (reason != null) {
            lb.add([', ', t, ' NO-UPDATE(', reason, ')']);
            return TransportMission$CargoResult.TFAIL;
          }
          lb.add([', ', t, ' collected']);
          return TransportMission$CargoResult.TNEXT;
        case Cargo$CargoMode.DROPOFF:
          if (!t.canMove()) {
            lb.add([', ', t, ' about to leave']);
            return TransportMission$CargoResult.TCONTINUE;
          }
          if ((d = cargo.getLeaveDirection()) == null) {
            let mt = (t).getUnit().getSimpleMoveType$Tile$Tile(t.getLocation().getTile$(), cargo.getTransportTarget().getTile$());
            {
              let path: PathNode;
              switch (mt) {
                case Unit$MoveType.ATTACK_UNIT:
                case Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN:
                  return TransportMission$CargoResult.TRETRY;
                default:
                  path = t.getDeliveryPath(carrier, cargo.getTransportTarget());
                  TransportMission.logger.warning('Null direction for ' + cargo.toShortString() + ' at ' + t.getLocation().toShortString() + '/' + carrier.getLocation().toShortString() + ' to ' + $J.str(cargo.getTransportTarget()) + ' mov=' + $J.str(mt) + ' path=' + ((path == null) ? 'null' : path.fullPathToString()));
                  return TransportMission$CargoResult.TFAIL;
              }
            }
          }
        case Cargo$CargoMode.UNLOAD:
          if (this.isCarrying(t) && !t.leaveTransport$Direction(d)) {
            let pn = t.getDeliveryPath(carrier, t.getTransportDestination());
            lb.add([', ', t, ' NO-LEAVE(', here, '~', cargo.getLeaveDirection(), '~', t.getTransportDestination(), ' ', ((pn == null) ? 'no-path' : pn.fullPathToString())]);
            return TransportMission$CargoResult.TRETRY;
          }
          lb.add([', ', t, ' COMPLETED']);
          break;
        case Cargo$CargoMode.DUMP:
          if (!t.leaveTransport$()) {
            lb.add([', ', t, ' STUCK']);
            return TransportMission$CargoResult.TCONTINUE;
          }
          lb.add([', ', t, ' DUMPED at ', t.getLocation()]);
          break;
      }
    }
    let colony: Colony;
    let aiColony: AIColony;
    if ((colony = (t.getLocation() == null) ? null : t.getLocation().getColony()) != null && (aiColony = this.getAIMain().getAIColony(colony)) != null && aiColony.completeWish$TransportableAIObject$LogBuilder(t, lb)) {
      aiColony.requestRearrange();
    }
    return TransportMission$CargoResult.TDONE;
  }
  /**
   * Perform the transport load/unload operations on arrival at the
   * target for the top cargo.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  doTransport(lb: LogBuilder): void {
    let unit = this.getUnit();
    if (this.tSize() > 0) {
      this.lbAt(lb);
      lb.add([', delivering']);
      let cont = new ArrayList();
      let next = new ArrayList();
      let curr = this.tClear();
      for (const $it9 = curr.iterator(); $it9.hasNext(); ) {
        let cargo = $it9.next();
        let result = (cargo.getMode().isCollection()) ? TransportMission$CargoResult.TCONTINUE : this.tryCargo(cargo, lb);
        switch (result) {
          case TransportMission$CargoResult.TCONTINUE:
            cont.add(cargo);
            break;
          case TransportMission$CargoResult.TRETRY:
            if (cargo.retry()) {
              cont.add(cargo);
              break;
            }
          case TransportMission$CargoResult.TFAIL:
            if (cargo.isCarried()) {
              cargo.dump();
              break;
            }
          case TransportMission$CargoResult.TDONE:
            this.dropTransportable(cargo.getTransportable());
            cargo.clear();
            break;
          case TransportMission$CargoResult.TNEXT:
          default:
            throw new RuntimeException('Can not happen: ' + $J.str(result));
        }
      }
      curr.clear();
      this.tSet(cont, true);
      lb.add([', collecting']);
      cont.clear();
      for (const $it10 = this.tClear().iterator(); $it10.hasNext(); ) {
        let cargo = $it10.next();
        let result = (cargo.getMode().isCollection()) ? this.tryCargo(cargo, lb) : TransportMission$CargoResult.TCONTINUE;
        switch (result) {
          case TransportMission$CargoResult.TCONTINUE:
          case TransportMission$CargoResult.TNEXT:
            cont.add(cargo);
            break;
          case TransportMission$CargoResult.TRETRY:
            if (cargo.retry()) {
              next.add(cargo);
              break;
            }
          case TransportMission$CargoResult.TFAIL:
          case TransportMission$CargoResult.TDONE:
            this.dropTransportable(cargo.getTransportable());
            cargo.clear();
            break;
          default:
            throw new RuntimeException('Can not happen: ' + $J.str(result));
        }
      }
      this.tSet(cont, true);
      if (!next.isEmpty()) {
        lb.add([', requeue']);
        for (const $it11 = next.iterator(); $it11.hasNext(); ) {
          let c = $it11.next();
          this.queueCargo(c, false, lb);
        }
      }
      this.checkCargoes(lb);
      this.optimizeCargoes(lb);
    }
    this.queueEasilyTransportedCargo(unit);
    let euaip = this.getEuropeanAIPlayer();
    while (this.destinationCapacity() > 0 && this.tSize() < $J.idiv(Math.imul(unit.getCargoCapacity(), 3), 2)) {
      let cargo = this.getBestCargo(unit);
      if (cargo == null) {
        break;
      }
      if (!this.queueCargo(cargo, false, lb)) {
        break;
      }
      euaip.claimTransportable(cargo.getTransportable());
    }
    this.queueEasilyTransportedCargo(unit);
  }
  /**
   * Calculates a score for a proposed list of
   * {@code Cargo}s using the current unit.  Disallows
   * routes that would overfill the carrier.
   *
   * Useful for comparing proposed cargo delivery routes.  The
   * score is based primarily on the number of turns it takes, but
   * to break ties we also consider the hold*turn product to reduce
   * the risk of losses due to enemy action.
   *
   * @param initialLocation The initial {@code Location}.
   * @param order An ordering of {@code Cargo}s.
   * @return A score for the cargo ordering.
   */
  scoreCargoOrder(initialLocation: Location, order: List<Cargo>): number {
    let carrier = this.getUnit();
    let maxHolds = carrier.getCargoCapacity();
    let holds = carrier.getCargoSpaceTaken();
    let now = initialLocation;
    let totalHoldTurns = 0;
    let totalTurns = 0;
    let favourEarly = 1;
    for (const $it12 = order.iterator(); $it12.hasNext(); ) {
      let cargo = $it12.next();
      let turns = carrier.getTurnsToReach$Location$Location(now, cargo.getCarrierTarget());
      totalTurns = Math.fround(totalTurns + turns);
      totalHoldTurns = Math.fround(totalHoldTurns + Math.fround(Math.imul(holds, turns) * favourEarly));
      holds = (holds + cargo.getNewSpace()) | 0;
      if (holds < 0 || holds > maxHolds) {
        return Math.fround(-1);
      }
      now = cargo.getCarrierTarget();
      favourEarly = Math.fround(favourEarly + Math.fround(0.1));
    }
    return Math.fround(totalTurns + Math.fround(Math.fround(0.001) * totalHoldTurns));
  }
  /**
   * Sets the current target.
   * Tries all permutations of cargoes and picks the fastest/safest one.
   *
   * Leaves the cargoes in the order they are expected to
   * execute, with valid spaceLeft values.
   *
   * @param lb A {@code LogBuilder} to log to.
   */
  optimizeCargoes(lb: LogBuilder): void {
    lb.add([', optimize']);
    let oldTarget = this.getTarget();
    let ts = this.wrapCargoes();
    let best = null;
    if (1 < ts.size() && ts.size() <= TransportMission.DESTINATION_UPPER_BOUND) {
      let current = this.getUnit().getLocation();
      let bestValue = Math.fround(Constants.INFINITY);
      for (const $it13 = CollectionUtils.getPermutations(ts).iterator(); $it13.hasNext(); ) {
        let tl = $it13.next();
        let value = this.scoreCargoOrder(current, tl);
        if (value > 0 && bestValue > value) {
          bestValue = value;
          best = tl;
        }
      }
    }
    if (best != null) {
      this.tSet(this.unwrapCargoes(best), true);
      if (oldTarget !== this.getTarget()) {
        lb.add(['->', this.getTarget()]);
      }
    } else {
      this.tSet(this.unwrapCargoes(ts), false);
    }
  }
  /**
   * What is the best transportable for a carrier to collect?
   *
   * @param carrier The carrier {@code Unit} to consider.
   * @return The best available new {@code Cargo}, or null if
   *     none found.
   */
  getBestCargo(carrier: Unit): Cargo {
    let euaip = this.getEuropeanAIPlayer();
    let bestDirect = null;
    let bestFallback = null;
    let bestDirectValue = 0;
    let bestFallbackValue = 0;
    for (const $it14 = euaip.getTransportables().iterator(); $it14.hasNext(); ) {
      let t = $it14.next();
      if (t.isDisposed() || !t.carriableBy(carrier)) {
        continue;
      }
      let cargo: Cargo;
      try {
        cargo = Cargo.newCargo$TransportableAIObject$Unit(t, carrier);
      } catch ($e15) {
        if ($J.isa($e15, FreeColException)) {
          let fce = $J.exc($e15);
          cargo = null;
        } else {
          throw $e15;
        }
      }
      if (cargo == null) {
        continue;
      }
      let value = Math.fround(t.getTransportPriority() / (Math.fround(cargo.getTurns() + 1)));
      if (cargo.isFallback()) {
        if (bestFallbackValue < value) {
          bestFallbackValue = value;
          bestFallback = cargo;
        }
      } else {
        if (bestDirectValue < value) {
          bestDirectValue = value;
          bestDirect = cargo;
        }
      }
    }
    return (bestDirect != null) ? bestDirect : (bestFallback != null) ? bestFallback : null;
  }
  /**
   * Queues extra transportables at the carrier's current location
   * that shares a destination with cargo already on the transport list.
   *
   * These transportables can be added to the transport list without
   * adding extra stops.
   *
   * @param carrier The carrier.
   */
  queueEasilyTransportedCargo(carrier: Unit): void {
    let euaip = this.getEuropeanAIPlayer();
    let ts = this.tCopy();
    let nextDestination = ts.stream().filter((c) => c.getCarrierTarget() != null && c.getCarrierTarget().getTile$() != null).map((c) => c.getCarrierTarget()).findFirst().orElse(null);
    if (nextDestination == null) {
      return;
    }
    for (const $it16 = euaip.getTransportables().iterator(); $it16.hasNext(); ) {
      let t = $it16.next();
      if (t.isDisposed() || !t.carriableBy(carrier)) {
        continue;
      }
      if (!Map_.isSameLocation(t.getTransportSource(), carrier.getLocation())) {
        continue;
      }
      if (Map_.isSameLocation(nextDestination, t.getTransportDestination())) {
        continue;
      }
      let cargo: Cargo;
      try {
        cargo = Cargo.newCargo$TransportableAIObject$Unit(t, carrier);
      } catch ($e17) {
        if ($J.isa($e17, FreeColException)) {
          let fce = $J.exc($e17);
          cargo = null;
        } else {
          throw $e17;
        }
      }
      if (cargo == null) {
        continue;
      }
      let spaceAvailable = (carrier.getCargoCapacity() - carrier.getCargoSpaceTaken()) | 0;
      if (spaceAvailable < cargo.getNewSpace()) {
        continue;
      }
      if (!t.joinTransport(carrier, null)) {
        TransportMission.logger.warning('Failed to add cargo there should be room for.');
      }
      cargo.update();
      if (!this.addCargo(cargo, 0, new LogBuilder()._LogBuilder(0))) {
        TransportMission.logger.warning('Failed to add cargo already on the transport.');
      }
      euaip.claimTransportable(t);
    }
  }
  /**
   * Why would an TransportMission be invalid with the given unit?
   *
   * @param aiUnit The {@code AIUnit} to test.
   * @return A reason why the mission would be invalid with the unit,
   *     or null if none found.
   */
  static invalidUnitReason(aiUnit: AIUnit): string {
    let reason = Mission.invalidAIUnitReason(aiUnit);
    return (reason != null) ? reason : (!aiUnit.getUnit().isCarrier()) ? 'unit-not-a-carrier' : null;
  }
  /**
   * Why would this mission be invalid with a given cargo?
   * Checks the cargo locations.
   * A location becomes invalid if:
   *   - step is a null location
   *   - step is disposed
   *   - step is a captured settlement
   *
   * @param cargo The {@code Cargo} to test.
   * @return A reason why the mission would be invalid,
   *     or null if none found.
   */
  static invalidCargoReason(cargo: Cargo): string {
    let t = cargo.getTransportable();
    let reason: string;
    return (t == null) ? 'null-transportable' : ((reason = t.invalidReason()) != null) ? 'cargo-' + reason : null;
  }
  /**
   * Why would this mission be invalid with the given AI unit?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @return A reason for mission invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit(aiUnit: AIUnit): string {
    return TransportMission.invalidUnitReason(aiUnit);
  }
  /**
   * Why would this mission be invalid with the given AI unit and location?
   *
   * @param aiUnit The {@code AIUnit} to check.
   * @param loc The {@code Location} to check.
   * @return A reason for invalidity, or null if none found.
   */
  static invalidMissionReason$AIUnit$Location(aiUnit: AIUnit, loc: Location): string {
    let reason: string;
    return ((reason = TransportMission.invalidMissionReason$AIUnit(aiUnit)) != null) ? reason : (loc instanceof Tile) ? null : (loc instanceof Europe || loc instanceof Colony) ? Mission.invalidTargetReason$Location$Player(loc, aiUnit.getUnit().getOwner()) : Mission.TARGETINVALID;
  }
  /**
   * Removes the given {@code TransportableAIObject} from the
   * cargo list.
   *
   * @param t The {@code TransportableAIObject} to remove.
   * @return True if the removal succeeded.
   */
  removeTransportable(t: TransportableAIObject): boolean {
    let cargo = this.tFind(t);
    return (cargo == null) ? false : this.tRemove(cargo);
  }
  /**
   * Retargets a transportable that should already be on board the carrier.
   *
   * @param t The {@code TransportableAIObject} to retarget.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the retargeting succeeded.
   */
  requeueTransportable(t: TransportableAIObject, lb: LogBuilder): boolean {
    let cargo = this.tFind(t);
    return (cargo == null) ? this.queueTransportable(t, false, lb) : this.requeueCargo(cargo, lb);
  }
  /**
   * Wrapper for queueCargo.
   * Public for the benefit of EuropeanAIPlayer.allocateTransportables
   * and CashInTreasureTrain.doMission.
   *
   * @param t The {@code TransportableAIObject} to add.
   * @param requireMatch Fail if an existing destination is not matched.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the transportable was queued.
   */
  queueTransportable(t: TransportableAIObject, requireMatch: boolean, lb: LogBuilder): boolean {
    let cargo = this.makeCargo(t, lb);
    return (cargo == null) ? false : this.queueCargo(cargo, requireMatch, lb);
  }
  /**
   * Dump a transportable.
   *
   * @param t The {@code TransportableAIObject} to dump.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the transportable is no longer on board, queued, or
   *     was reset to be dumped at the next stop.
   */
  dumpTransportable(t: TransportableAIObject, lb: LogBuilder): boolean {
    if (t == null) {
      return true;
    }
    let cargo = this.tFind(t);
    if (cargo == null) {
      return true;
    }
    if (!this.isCarrying(t)) {
      this.removeTransportable(t);
      return true;
    }
    return this.dumpCargo(cargo, lb);
  }
  /**
   * Drop all collections so that cargo is delivered only, then
   * collect this unit.  Useful for prioritizing treasure
   * collection.
   *
   * @param aiu The {@code AIUnit} to collect.
   * @param lb A {@code LogBuilder} to log to.
   * @return True if the unit was queued.
   */
  forceCollection(aiu: AIUnit, lb: LogBuilder): boolean {
    for (const $it18 = this.tCopy().iterator(); $it18.hasNext(); ) {
      let c = $it18.next();
      if (c.getMode().isCollection()) {
        this.removeCargo(c);
      }
    }
    return this.queueTransportable(aiu, false, lb);
  }
  /**
   * Suppress European trade in a type of goods which is about to be
   * boycotted.
   *
   * @param type The {@code GoodsType} to suppress.
   * @param lb A {@code LogBuilder} to log to.
   */
  suppressEuropeanTrade(type$: GoodsType, lb: LogBuilder): void {
    for (const $it19 = this.tCopy().iterator(); $it19.hasNext(); ) {
      let c = $it19.next();
      if (c.isEuropeanTrade(type$)) {
        this.removeCargo(c);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getTransportDestination(): Tile {
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
    this.target = target;
  }
  /**
   * {@inheritDoc}
   */
  findTarget(): Location {
    return null;
  }
  /**
   * {@inheritDoc}
   */
  invalidReason(): string {
    let aiUnit = this.getAIUnit();
    let reason = TransportMission.invalidMissionReason$AIUnit$Location(aiUnit, this.getTarget());
    let cargo: Cargo;
    return (reason != null) ? reason : ((cargo = this.tFirst()) == null) ? null : TransportMission.invalidCargoReason(cargo);
  }
  /**
   * {@inheritDoc}
   */
  doMission(lb: LogBuilder): Mission {
    lb.add([TransportMission.tag]);
    this.checkCargoes(lb);
    let reason = this.invalidReason();
    if (reason != null) {
      return this.lbFail(lb, false, [reason]);
    }
    let aiCarrier = this.getAIUnit();
    let unit = this.getUnit();
    let fallBackDecider = CostDeciders.avoidSettlementsAndBlockingUnits();
    let euaip = this.getEuropeanAIPlayer();
    let costDecider = CostDeciders.defaultCostDeciderFor(unit);
    for (; ; ) {
      let mt = this.travelToTarget(this.target, costDecider, lb);
      {
        let blocker: Location;
        switch (mt) {
          case Unit$MoveType.MOVE:
            this.doTransport(lb);
            if (this.isEmpty() && unit.isOffensiveUnit()) {
              let m = euaip.getPrivateerMission(aiCarrier, null);
              if (m != null) {
                return this.lbDone(lb, false, ['going pirate']);
              }
            }
            if ((reason = this.invalidReason()) != null) {
              TransportMission.logger.warning(TransportMission.tag + ' post-stop failure(' + reason + '): ' + this.toFullString());
              return this.lbFail(lb, false, [reason]);
            }
            if (unit.isAtLocation(this.target)) {
              return this.lbWait(lb, [', waiting at ', this.target]);
            }
            break;
          case Unit$MoveType.MOVE_HIGH_SEAS:
          case Unit$MoveType.MOVE_NO_MOVES:
          case Unit$MoveType.MOVE_ILLEGAL:
            return this.lbWait(lb, []);
          case Unit$MoveType.MOVE_NO_REPAIR:
            return this.lbFail(lb, false, [Mission.AIUNITDIED]);
          case Unit$MoveType.MOVE_NO_TILE:
            this.moveRandomly(TransportMission.tag, null);
            return this.lbDodge(lb);
          case Unit$MoveType.ATTACK_UNIT:
            blocker = Mission.resolveBlockage(aiCarrier, this.target);
            if (blocker instanceof Unit && this.shouldAttack(blocker)) {
              AIMessage.askAttack(aiCarrier, unit.getTile$().getDirection(blocker.getTile$()));
              return this.lbAttack(lb, blocker);
            }
          case Unit$MoveType.MOVE_NO_ATTACK_CIVILIAN:
            if (unit.getTile$().isAdjacent(this.target.getTile$()) || costDecider === fallBackDecider) {
              this.moveRandomly(TransportMission.tag, null);
              return this.lbDodge(lb);
            }
            costDecider = fallBackDecider;
            lb.add([', retry blockage at ', unit.getLocation()]);
            break;
          case Unit$MoveType.MOVE_NO_ACCESS_EMBARK:
          default:
            return this.lbMove(lb, mt);
        }
      }
    }
  }
  /**
   * More verbose version of toString().
   *
   * @return A summary of this mission including its transportables.
   */
  toFullString(): string {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add([this]);
    for (const $it20 = this.tCopy().iterator(); $it20.hasNext(); ) {
      let cargo = $it20.next();
      lb.add(['\n  ->', cargo]);
    }
    return lb.toString();
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.target != null) {
      xw.writeLocationAttribute(TransportMission.TARGET_TAG, this.target);
    }
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    let aiCarrier = this.getAIUnit();
    for (const $it21 = this.tCopy().iterator(); $it21.hasNext(); ) {
      let cargo = $it21.next();
      let reason = cargo.check(aiCarrier);
      if (reason != null) {
        continue;
      }
      if (cargo.getMode() === Cargo$CargoMode.DUMP) {
        continue;
      }
      cargo.toXML(xw);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.target = xr.getLocationAttribute(this.getGame(), TransportMission.TARGET_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  readChildren(xr: FreeColXMLReader): void {
    this.tClear();
    super.readChildren(xr);
  }
  /**
   * {@inheritDoc}
   */
  readChild(xr: FreeColXMLReader): void {
    let tag = xr.getLocalName();
    if ($J.equals(Cargo.TAG, tag)) {
      this.tAdd(new Cargo()._Cargo$AIMain$FreeColXMLReader(this.getAIMain(), xr), -1);
    } else {
      super.readChild(xr);
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return TransportMission.TAG;
  }
  static $clinit() {
    TransportMission.logger = Logger.getLogger($J.cls(TransportMission).getName());
  }
}

export class TransportMission$CargoResult extends JEnum {
  static TCONTINUE: TransportMission$CargoResult = null;
  static TDONE: TransportMission$CargoResult = null;
  static TFAIL: TransportMission$CargoResult = null;
  static TNEXT: TransportMission$CargoResult = null;
  static TRETRY: TransportMission$CargoResult = null;
  static $VALUES: TransportMission$CargoResult[] = null;
  _TransportMission$CargoResult($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): TransportMission$CargoResult[] { return TransportMission$CargoResult.$VALUES.slice(); }
  static valueOf(name: string): TransportMission$CargoResult { return $J.enumValueOf(TransportMission$CargoResult, name); }
  static $clinit() {
    TransportMission$CargoResult.TCONTINUE = new TransportMission$CargoResult()._TransportMission$CargoResult('TCONTINUE', 0);
    TransportMission$CargoResult.TDONE = new TransportMission$CargoResult()._TransportMission$CargoResult('TDONE', 1);
    TransportMission$CargoResult.TFAIL = new TransportMission$CargoResult()._TransportMission$CargoResult('TFAIL', 2);
    TransportMission$CargoResult.TNEXT = new TransportMission$CargoResult()._TransportMission$CargoResult('TNEXT', 3);
    TransportMission$CargoResult.TRETRY = new TransportMission$CargoResult()._TransportMission$CargoResult('TRETRY', 4);
    TransportMission$CargoResult.$VALUES = [TransportMission$CargoResult.TCONTINUE, TransportMission$CargoResult.TDONE, TransportMission$CargoResult.TFAIL, TransportMission$CargoResult.TNEXT, TransportMission$CargoResult.TRETRY];
  }
}

$J.define(TransportMission, 'net.sf.freecol.server.ai.mission.TransportMission', { kind: 'class', sup: 'net.sf.freecol.server.ai.mission.Mission', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.io.FreeColXMLReader': '_TransportMission$AIMain$AIUnit$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.server.ai.AIUnit': '_TransportMission$AIMain$AIUnit' }, returns: { 'getXMLTagName': 'java.lang.String', 'getTarget': 'net.sf.freecol.common.model.Location', 'getTransportDestination': 'net.sf.freecol.common.model.Tile', 'isEmpty': 'boolean' }, meths: { 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit,net.sf.freecol.common.model.Location)': 'invalidMissionReason$AIUnit$Location', 'invalidMissionReason(net.sf.freecol.server.ai.AIUnit)': 'invalidMissionReason$AIUnit', 'spaceAvailable(net.sf.freecol.server.ai.TransportableAIObject)': 'spaceAvailable$TransportableAIObject', 'spaceAvailable(net.sf.freecol.server.ai.Cargo)': 'spaceAvailable$Cargo' }, clinit: true, lazy: ['logger'] });
$J.define(TransportMission$CargoResult, 'net.sf.freecol.server.ai.mission.TransportMission$CargoResult', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_TransportMission$CargoResult' }, clinit: true, lazy: ['$VALUES', 'TCONTINUE', 'TDONE', 'TFAIL', 'TNEXT', 'TRETRY'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Goods = $J.load('net.sf.freecol.common.model.Goods');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  UnitLocation$NoAddReason = $J.load('net.sf.freecol.common.model.UnitLocation$NoAddReason');
  CostDeciders = $J.load('net.sf.freecol.common.model.pathfinding.CostDeciders');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  AIGoods = $J.load('net.sf.freecol.server.ai.AIGoods');
  AIMessage = $J.load('net.sf.freecol.server.ai.AIMessage');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
  Cargo = $J.load('net.sf.freecol.server.ai.Cargo');
  Cargo$CargoMode = $J.load('net.sf.freecol.server.ai.Cargo$CargoMode');
});
