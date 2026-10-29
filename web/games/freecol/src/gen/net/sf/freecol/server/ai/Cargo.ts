// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/Cargo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, IllegalStateException, JEnum, JObject, JString, Logger, XMLStreamException } from '../../../../../../jre/index.ts';

let FreeColException, Europe, FreeColGameObject, FreeColObject, Location, Map_, Unit, CollectionUtils, LogBuilder, StringUtils, AIGoods, AIUnit;

/**
 * An class describing the action needed to make progress in a
 * transportation action for a specific transportable.
 */
export class Cargo extends JObject {
  static logger: Logger = null;
  static readonly TAG: string = 'cargo';
  /**
   * Abandon cargo after three blockages.
   */
  static readonly MAX_TRY: number = 3;
  /**
   * The AI object to be transported.
   */
  transportable: TransportableAIObject = null;
  /**
   * The carrier that is providing transportation.
   */
  carrier: Unit = null;
  /**
   * Counter for failed tries.
   */
  tries: number = 0;
  /**
   * Space left on the carrier.
   */
  spaceLeft: number = 0;
  /**
   * Wrap location for cargoes of the same destination.
   */
  wrapped: List<Cargo> = null;
  /**
   * The plan to execute the transport.
   */
  plan: Cargo$CargoPlan = null;
  static readonly CDST_TAG: string = 'cdst';
  static readonly CWAIT_TAG: string = 'cwait';
  static readonly CARRIER_TAG: string = 'carrier';
  static readonly FALLBACK_TAG: string = 'fallback';
  static readonly MODE_TAG: string = 'mode';
  static readonly SPACELEFT_TAG: string = 'space';
  static readonly TDST_TAG: string = 'tdst';
  static readonly TRIES_TAG: string = 'tries';
  static readonly TURNS_TAG: string = 'turns';
  static readonly TWAIT_TAG: string = 'twait';
  /**
   * Create a new cargo.
   *
   * @param transportable The {@code TransportableAIObject}
   *     to transport.
   * @param carrier The carrier {@code Unit}.
   * @param plan The {@code CargoPlan} to perform.
   */
  _Cargo$TransportableAIObject$Unit$CargoPlan(transportable: TransportableAIObject, carrier: Unit, plan: Cargo$CargoPlan): this {
    this.transportable = transportable;
    this.carrier = carrier;
    this.tries = 0;
    this.spaceLeft = carrier.getSpaceLeft();
    this.wrapped = null;
    this.plan = plan;
    return this;
  }
  /**
   * Create a new cargo from a stream.
   *
   * @param aiMain The {@code AIMain} root.
   * @param xr The input stream containing the XML.
   * @exception XMLStreamException if a problem was encountered
   *     during parsing.
   */
  _Cargo$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this.readFromXML(aiMain, xr);
    return this;
  }
  /**
   * Initialize this cargo.
   *
   * @param destination The destination {@code Location} to take
   *     the transportable to, defaulting to the transport destination
   *     if null.
   * @param allowFallback Allow a fallback transport.
   * @return A reason the planning failed, null if it succeeded.
   */
  initialize(destination: Location, allowFallback: boolean): string {
    return this.plan.initialize(this.transportable, this.carrier, destination, allowFallback);
  }
  /**
   * Update the current delivery at the current fallback tolerance.
   *
   * @return A reason the planning failed, null if it succeeded.
   */
  update(): string {
    return this.plan.initialize(this.transportable, this.carrier, null, this.plan.fallback);
  }
  /**
   * Make a new cargo with given transportable and carrier.
   *
   * @param t The {@code TransportableAIObject} to transport.
   * @param carrier The carrier {@code Unit} to perform the transport.
   * @return The new {@code Cargo}.
   * @exception FreeColException on failure of the planning stage.
   */
  static newCargo$TransportableAIObject$Unit(t: TransportableAIObject, carrier: Unit): Cargo {
    return Cargo.newCargo$TransportableAIObject$Unit$Location$boolean(t, carrier, t.getTransportDestination(), true);
  }
  /**
   * Make a new cargo with given transportable, carrier and explicit
   * destination and fallback state.
   *
   * @param t The {@code TransportableAIObject} to transport.
   * @param carrier The carrier {@code Unit} to perform the transport.
   * @param destination The destination {@code Location} for
   *     the transportable.
   * @param allowFallback Allow a fallback destination.
   * @return The new {@code Cargo}.
   * @exception FreeColException on failure of the planning stage.
   */
  static newCargo$TransportableAIObject$Unit$Location$boolean(t: TransportableAIObject, carrier: Unit, destination: Location, allowFallback: boolean): Cargo {
    let cargo = new Cargo()._Cargo$TransportableAIObject$Unit$CargoPlan(t, carrier, new Cargo$CargoPlan()._Cargo$CargoPlan());
    let reason = cargo.plan.initialize(t, carrier, destination, allowFallback);
    if (reason != null) {
      throw new FreeColException()._FreeColException$String(reason);
    }
    return cargo;
  }
  /**
   * Reset this cargo to dump to the nearest available location.
   *
   * @return A reason for failing to reset, or null on succes.
   */
  dump(): string {
    if (!this.isCarried()) {
      return 'not-carried';
    }
    let path = this.carrier.getTrivialPath();
    if (path == null) {
      return 'no-trivial-path';
    }
    let reason = this.initialize(path.getLastNode().getLocation(), false);
    if (reason != null) {
      return reason;
    }
    this.plan.mode = Cargo$CargoMode.DUMP;
    return null;
  }
  /**
   * Get the transportable.
   *
   * @return The {@code TransportableAIObject} to transport.
   */
  getTransportable(): TransportableAIObject {
    return this.transportable;
  }
  getCarrier(): Unit {
    return this.carrier;
  }
  getTries(): number {
    return this.tries;
  }
  getSpaceLeft(): number {
    return this.spaceLeft;
  }
  setSpaceLeft(spaceLeft: number): void {
    this.spaceLeft = spaceLeft;
  }
  isValid(): boolean {
    return this.plan != null && this.plan.mode != null;
  }
  getMode(): Cargo$CargoMode {
    return this.plan.mode;
  }
  getModeString(): string {
    let mode = this.getMode();
    return (mode == null) ? 'null' : StringUtils.downCase$String(mode.toString());
  }
  getTurns(): number {
    return this.plan.turns;
  }
  isFallback(): boolean {
    return this.plan.fallback;
  }
  getTransportTarget(): Location {
    return (this.getMode().isCollection()) ? this.plan.twait : this.plan.tdst;
  }
  getCarrierTarget(): Location {
    return (this.getMode().isCollection()) ? this.plan.cwait : this.plan.cdst;
  }
  clear(): void {
    this.transportable = null;
    this.carrier = null;
    this.plan.mode = null;
  }
  /**
   * Is the transportable on board the carrier?
   *
   * @return True if the transportable is being carried by the carrier.
   */
  isCarried(): boolean {
    return this.transportable != null && this.transportable.getLocation() === this.carrier;
  }
  /**
   * Is this cargo collectable?  That is, is it and the carrier
   * at their collection points, and in a collectable mode.
   *
   * @return True if the cargo can be collected.
   */
  isCollectable(): boolean {
    if (!this.getMode().isCollection() || this.isCarried()) {
      return false;
    }
    return Map_.isSameLocation(this.plan.twait, this.transportable.getLocation()) && Map_.isSameLocation(this.plan.cwait, this.carrier.getLocation());
  }
  /**
   * Is this cargo deliverable?  That is, has it arrived at the target
   * on board the carrier in a deliverable mode.
   *
   * @return True if the cargo can be delivered to the target.
   */
  isDeliverable(): boolean {
    if (this.getMode().isCollection() || !this.isCarried()) {
      return false;
    }
    return Map_.isSameLocation(this.plan.cdst, this.carrier.getLocation());
  }
  /**
   * Is this cargo delivered, or otherwise removed?  That is, is the
   * cargo not on board the carrier in a deliverable mode?
   *
   * @return True if the cargo has been delivered.
   */
  isDelivered(): boolean {
    return !this.getMode().isCollection() && !this.isCarried();
  }
  /**
   * Does this cargo have a potential delivery path?
   *
   * @return True if the carrier can deliver the cargo.
   */
  hasPath(): boolean {
    return this.carrier.findPath$Location(this.getCarrierTarget()) != null;
  }
  /**
   * Get the movement direction to join the carrier.
   *
   * @return The {@code Direction} to join by.
   */
  getJoinDirection(): Direction {
    return (this.carrier.isInEurope() || this.plan.cwait === this.plan.twait) ? null : this.carrier.getGame().getMap().getDirection(this.plan.twait.getTile$(), this.plan.cwait.getTile$());
  }
  /**
   * Get the movement direction to leave the carrier.
   *
   * @return The {@code Direction} to leave by.
   */
  getLeaveDirection(): Direction {
    if (!this.carrier.hasTile() || this.plan.cdst === this.plan.tdst) {
      return null;
    }
    let t = this.getTransportable();
    let path = t.getDeliveryPath(this.getCarrier(), this.plan.tdst);
    return (path == null || path.next_ == null) ? null : path.next_.getDirection();
  }
  /**
   * How much space would be needed to add this transportable?
   *
   * @return The extra space required.
   */
  getNewSpace(): number {
    if (!this.isValid()) {
      return 0;
    }
    let ret = 0;
    ret = (ret + ((this.getMode().isCollection()) ? this.getTransportable().getSpaceTaken() : -this.getTransportable().getSpaceTaken())) | 0;
    if (this.hasWrapped()) {
      ret = (ret + (CollectionUtils.sum$Collection$ToIntFunction(this.wrapped, ($p0) => $p0.getNewSpace()))) | 0;
    }
    return ret;
  }
  /**
   * Does this cargo wrap others?
   *
   * @return True if wrapped transportables are present.
   */
  hasWrapped(): boolean {
    return this.wrapped != null;
  }
  /**
   * TransportableAIObjects can be `wrapped' if they have the
   * same target and advancing them reduces the space on the carrier.
   *
   * @param other The other {@code TransportableAIObject}
   *     to consider.
   * @return True if the transportables can be wrapped.
   */
  couldWrap(other: Cargo): boolean {
    return this.getCarrierTarget() === other.getCarrierTarget() && this.getNewSpace() < 0 && other.getNewSpace() < 0;
  }
  /**
   * Wrap a Cargo into this one.
   *
   * @param other The other {@code Cargo} to wrap.
   */
  wrap(other: Cargo): void {
    if (other === this) {
      throw new IllegalStateException('Autowrap at' + $J.str(this));
    }
    if (this.wrapped == null) {
      this.wrapped = new ArrayList();
    }
    this.wrapped.add(other);
  }
  /**
   * Unwrap this cargo.
   *
   * @return The cargoes that were wrapped.
   */
  unwrap(): List<Cargo> {
    if (this.wrapped == null) {
      throw new IllegalStateException('Bogus unwrap ' + $J.str(this));
    }
    let result = this.wrapped;
    this.wrapped = null;
    return result;
  }
  /**
   * Should this {@code Cargo} be retried after encountering
   * a blockage?  For now, just tries three times.
   *
   * FIXME: be smarter.
   *
   * @return True if the {@code Cargo} should be retried.
   */
  retry(): boolean {
    return this.tries++ < Cargo.MAX_TRY;
  }
  /**
   * Reset the tries counter.
   */
  resetTries(): void {
    this.tries = 0;
  }
  /**
   * Does this cargo involve trade with Europe in a given goods type?
   *
   * @param type The {@code GoodsType} to check.
   * @return True if this cargo is of the given type and to be
   *     collected or delivered to Europe.
   */
  isEuropeanTrade(type$: GoodsType): boolean {
    return this.transportable instanceof AIGoods && (this.transportable).getGoodsType() === type$ && this.getCarrierTarget() instanceof Europe;
  }
  /**
   * Check the integrity of this cargo.
   *
   * @param aiCarrier The {@code AIUnit} version of the carrier.
   * @return A reason for integrity failure, or null if none.
   */
  check(aiCarrier: AIUnit): string {
    if (this.transportable == null) {
      return 'null transportable';
    } else if (this.transportable.isDisposed()) {
      return 'disposed transportable';
    }
    let l = this.transportable.getTransportLocatable();
    if (l == null) {
      return 'null locatable: ' + $J.str(this.transportable);
    } else if (l instanceof FreeColGameObject && (l).isDisposed()) {
      return 'locatable disposed';
    }
    let tLoc = l.getLocation();
    if (tLoc instanceof Unit && tLoc !== this.carrier) {
      return 'carrier usurped';
    }
    return null;
  }
  /**
   * Can this cargo be queued at the given index in a list of cargoes?
   *
   * TODO: be smarter and break out of the loop if the cargo reaches
   * its delivery point.
   *
   * @param carrier The {@code Unit} to queue to.
   * @param index The queuing position to test.
   * @param cargoes A list of {@code Cargo}s.
   * @return True if there is space to add the cargo.
   */
  canQueueAt(carrier: Unit, index: number, cargoes: List<Cargo>): boolean {
    let maxHolds = carrier.getCargoCapacity();
    let newSpace = this.getNewSpace();
    for (let j = index; j < cargoes.size(); j++) {
      let holds = (j === 0) ? carrier.getCargoSpaceTaken() : (maxHolds - cargoes.get((j - 1) | 0).getSpaceLeft()) | 0;
      holds = (holds + newSpace) | 0;
      if (holds < 0 || holds > maxHolds) {
        return false;
      }
    }
    return true;
  }
  /**
   * Abbreviated string representation for this cargo.
   *
   * @return A short descriptive string.
   */
  toShortString(): string {
    let lb = new LogBuilder()._LogBuilder(32);
    lb.add([this.getModeString(), ' ', this.transportable]);
    let lt = this.getTransportTarget();
    lb.add([' @ ', ((lt == null) ? 'null' : lt.toShortString())]);
    let ct = this.getCarrierTarget();
    if (ct !== lt) {
      lb.add(['/', ((ct == null) ? 'null' : ct.toShortString())]);
    }
    return lb.toString();
  }
  toXML(xw: FreeColXMLWriter): void {
    xw.writeStartElement(Cargo.TAG);
    xw.writeAttribute$String$FreeColObject(FreeColObject.ID_ATTRIBUTE_TAG, this.getTransportable());
    xw.writeAttribute$String$FreeColObject(Cargo.CARRIER_TAG, this.getCarrier());
    xw.writeAttribute$String$int(Cargo.TRIES_TAG, this.getTries());
    xw.writeAttribute$String$int(Cargo.SPACELEFT_TAG, this.getSpaceLeft());
    if (this.plan.twait != null) {
      xw.writeLocationAttribute(Cargo.TWAIT_TAG, this.plan.twait);
    }
    if (this.plan.cwait != null) {
      xw.writeLocationAttribute(Cargo.CWAIT_TAG, this.plan.cwait);
    }
    if (this.plan.cdst != null) {
      xw.writeLocationAttribute(Cargo.CDST_TAG, this.plan.cdst);
    }
    if (this.plan.tdst != null) {
      xw.writeLocationAttribute(Cargo.TDST_TAG, this.plan.tdst);
    }
    xw.writeAttribute$String$int(Cargo.TURNS_TAG, this.plan.turns);
    xw.writeAttribute$String$Enum(Cargo.MODE_TAG, this.plan.mode);
    xw.writeAttribute$String$boolean(Cargo.FALLBACK_TAG, this.plan.fallback);
    xw.writeEndElement();
  }
  readFromXML(aiMain: AIMain, xr: FreeColXMLReader): void {
    let game = aiMain.getGame();
    let tid = xr.readId();
    let tao = null;
    if (tid != null) {
      let aio = aiMain.getAIObject$String(tid);
      if (aio == null) {
        if (tid.startsWith(Unit.TAG)) {
          tao = new AIUnit()._AIUnit$AIMain$String(aiMain, tid);
        } else if (tid.startsWith(AIGoods.TAG)) {
          tao = new AIGoods()._AIGoods$AIMain$String(aiMain, tid);
        }
      } else {
        tao = aio;
      }
    }
    if (tao == null) {
      throw new XMLStreamException('Transportable expected: ' + tid);
    }
    this.transportable = tao;
    this.carrier = xr.getAttribute$Game$String$Class$FreeColObject(game, Cargo.CARRIER_TAG, $J.cls(Unit), null);
    this.tries = xr.getAttribute$String$int(Cargo.TRIES_TAG, 0);
    this.spaceLeft = xr.getAttribute$String$int(Cargo.SPACELEFT_TAG, -1);
    this.wrapped = null;
    this.plan = new Cargo$CargoPlan()._Cargo$CargoPlan();
    this.plan.twait = xr.getLocationAttribute(game, Cargo.TWAIT_TAG, false);
    this.plan.cwait = xr.getLocationAttribute(game, Cargo.CWAIT_TAG, false);
    this.plan.cdst = xr.getLocationAttribute(game, Cargo.CDST_TAG, false);
    this.plan.tdst = xr.getLocationAttribute(game, Cargo.TDST_TAG, false);
    this.plan.turns = xr.getAttribute$String$int(Cargo.TURNS_TAG, -1);
    this.plan.mode = xr.getAttribute$String$Class$Enum(Cargo.MODE_TAG, $J.cls(Cargo$CargoMode), null);
    this.plan.fallback = xr.getAttribute$String$boolean(Cargo.FALLBACK_TAG, false);
    xr.closeTag$String(Cargo.TAG);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return Cargo.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['[', this.transportable, ' ', this.getModeString(), ' ', this.getTurns(), '/', this.tries, ' space=', this.spaceLeft, ((this.wrapped == null) ? '' : ' wrap')]);
    if (this.plan.twait != null && this.plan.cwait != null) {
      lb.add([' ', this.plan.twait.toShortString(), '/', this.plan.cwait.toShortString()]);
    }
    if (this.plan.cdst != null && this.plan.tdst != null) {
      lb.add(['->', this.plan.cdst.toShortString(), '/', this.plan.tdst.toShortString()]);
    }
    lb.add([' ', this.plan.fallback, ']']);
    return lb.toString();
  }
  static $clinit() {
    Cargo.logger = Logger.getLogger($J.cls(Cargo).getName());
  }
}

/**
 * The actions to perform at the target.
 */
export class Cargo$CargoMode extends JEnum {
  static LOAD: Cargo$CargoMode = null;
  static UNLOAD: Cargo$CargoMode = null;
  static PICKUP: Cargo$CargoMode = null;
  static DROPOFF: Cargo$CargoMode = null;
  static DUMP: Cargo$CargoMode = null;
  static $VALUES: Cargo$CargoMode[] = null;
  _Cargo$CargoMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  isCollection(): boolean {
    return this === Cargo$CargoMode.LOAD || this === Cargo$CargoMode.PICKUP;
  }
  static values(): Cargo$CargoMode[] { return Cargo$CargoMode.$VALUES.slice(); }
  static valueOf(name: string): Cargo$CargoMode { return $J.enumValueOf(Cargo$CargoMode, name); }
  static $clinit() {
    Cargo$CargoMode.LOAD = new Cargo$CargoMode()._Cargo$CargoMode('LOAD', 0);
    Cargo$CargoMode.UNLOAD = new Cargo$CargoMode()._Cargo$CargoMode('UNLOAD', 1);
    Cargo$CargoMode.PICKUP = new Cargo$CargoMode()._Cargo$CargoMode('PICKUP', 2);
    Cargo$CargoMode.DROPOFF = new Cargo$CargoMode()._Cargo$CargoMode('DROPOFF', 3);
    Cargo$CargoMode.DUMP = new Cargo$CargoMode()._Cargo$CargoMode('DUMP', 4);
    Cargo$CargoMode.$VALUES = [Cargo$CargoMode.LOAD, Cargo$CargoMode.UNLOAD, Cargo$CargoMode.PICKUP, Cargo$CargoMode.DROPOFF, Cargo$CargoMode.DUMP];
  }
}

/**
 * Container for a plan for a transportable to get to TWAIT where
 * a carrier collects it from CWAIT (may equal TWAIT) and takes it
 * to CDST, whence the transportable goes to TDST (may equal
 * CDST).
 */
export class Cargo$CargoPlan extends JObject {
  /**
   * The key locations along the path taken by cargo and carrier.
   */
  twait: Location = null;
  /**
   * The key locations along the path taken by cargo and carrier.
   */
  cwait: Location = null;
  /**
   * The key locations along the path taken by cargo and carrier.
   */
  cdst: Location = null;
  /**
   * The key locations along the path taken by cargo and carrier.
   */
  tdst: Location = null;
  /**
   * Expected total duration of this plan when it is initialized.
   */
  turns: number = 0;
  /**
   * Current state of the plan.
   */
  mode: Cargo$CargoMode = null;
  /**
   * Is the destination a fallback destination?
   */
  fallback: boolean = false;
  _Cargo$CargoPlan(): this {
    return this;
  }
  /**
   * Plan the transport of a transportable with a given carrier.
   *
   * @param t The {@code TransportableAIObject} to deliver.
   * @param carrier The carrier {@code Unit} to use.
   * @param destination The destination {@code Location} to take the
   *     transportable to, using the transport destination if null.
   * @param allowFallback Allow a fallback plan that does not complete
   *     the transport but does at least improve matters.
   * @return Null on success, an error message on failure.
   */
  initialize(t: TransportableAIObject, carrier: Unit, destination: Location, allowFallback: boolean): string {
    if (t.isDisposed()) {
      return 'invalid-disposed';
    } else if (carrier == null) {
      return 'invalid-null-carrier';
    } else if (destination == null && (destination = t.getTransportDestination()) == null) {
      return 'invalid-null-destination';
    }
    this.tdst = Location.upLoc(destination);
    let src = t.getLocation();
    let carrying = src === carrier;
    if (!carrying && src instanceof Unit) {
      return 'invalid-collected-elsewhere';
    }
    let deliver = t.getDeliveryPath(carrier, this.tdst);
    this.fallback = false;
    if (deliver == null && allowFallback) {
      deliver = t.getIntermediatePath(carrier, this.tdst);
      this.fallback = true;
    }
    if (deliver == null) {
      return 'no-deliver ' + $J.str(t) + '/' + carrier.toShortString() + ' -> ' + this.tdst.toShortString();
    }
    let pick = deliver.getCarrierMove();
    if (pick == null) {
      return 'invalid-transport-not-needed';
    }
    if (carrying) {
      this.twait = this.cwait = null;
    } else {
      this.cwait = Location.upLoc(pick.getLocation());
      let prev = (pick.previous_ == null) ? pick : pick.previous_;
      this.twait = Location.upLoc(prev.getLocation());
    }
    let collect = null;
    if (!carrying && (collect = carrier.findPath$Location(this.cwait)) == null) {
      return 'no-collect ' + $J.str(t) + '/' + carrier.toShortString() + ' at ' + this.cwait.toShortString();
    }
    let drop = pick.getTransportDropNode();
    if (drop.previous_ == null) {
      throw new IllegalStateException('Cargo failure ' + $J.str(t) + ' ' + deliver.fullPathToString() + ' ' + pick.fullPathToString() + ' ' + $J.str(drop));
    }
    this.cdst = Location.upLoc(drop.previous_.getLocation());
    this.tdst = Location.upLoc(deliver.getLastNode().getLocation());
    if (carrying) {
      this.turns = deliver.getTotalTurns();
      this.mode = (this.cdst instanceof Europe || this.cdst === this.tdst) ? Cargo$CargoMode.UNLOAD : Cargo$CargoMode.DROPOFF;
    } else {
      this.turns = (Math.max(pick.getTurns(), collect.getTotalTurns()) + pick.getTotalTurns()) | 0;
      this.mode = (this.cwait instanceof Europe || this.cwait === this.twait) ? Cargo$CargoMode.LOAD : Cargo$CargoMode.PICKUP;
    }
    return null;
  }
}

$J.define(Cargo, 'net.sf.freecol.server.ai.Cargo', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_Cargo$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.TransportableAIObject,net.sf.freecol.common.model.Unit,net.sf.freecol.server.ai.Cargo$CargoPlan': '_Cargo$TransportableAIObject$Unit$CargoPlan' }, returns: { 'getXMLTagName': 'java.lang.String', 'hasWrapped': 'boolean', 'getNewSpace': 'int', 'getLeaveDirection': 'net.sf.freecol.common.model.Direction', 'getJoinDirection': 'net.sf.freecol.common.model.Direction', 'hasPath': 'boolean', 'isDelivered': 'boolean', 'isDeliverable': 'boolean', 'isCollectable': 'boolean', 'isCarried': 'boolean', 'getCarrierTarget': 'net.sf.freecol.common.model.Location', 'getTransportTarget': 'net.sf.freecol.common.model.Location', 'isFallback': 'boolean', 'getTurns': 'int', 'getModeString': 'java.lang.String', 'getMode': 'net.sf.freecol.server.ai.Cargo$CargoMode', 'isValid': 'boolean', 'getSpaceLeft': 'int', 'getTries': 'int', 'getCarrier': 'net.sf.freecol.common.model.Unit', 'getTransportable': 'net.sf.freecol.server.ai.TransportableAIObject' }, meths: { 'newCargo(net.sf.freecol.server.ai.TransportableAIObject,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Location,boolean)': 'newCargo$TransportableAIObject$Unit$Location$boolean', 'newCargo(net.sf.freecol.server.ai.TransportableAIObject,net.sf.freecol.common.model.Unit)': 'newCargo$TransportableAIObject$Unit' }, clinit: true, lazy: ['logger'] });
$J.define(Cargo$CargoMode, 'net.sf.freecol.server.ai.Cargo$CargoMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Cargo$CargoMode' }, returns: { 'isCollection': 'boolean' }, clinit: true, lazy: ['$VALUES', 'LOAD', 'UNLOAD', 'PICKUP', 'DROPOFF', 'DUMP'] });
$J.define(Cargo$CargoPlan, 'net.sf.freecol.server.ai.Cargo$CargoPlan', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Cargo$CargoPlan' } });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  FreeColGameObject = $J.load('net.sf.freecol.common.model.FreeColGameObject');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  Location = $J.load('net.sf.freecol.common.model.Location');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  AIGoods = $J.load('net.sf.freecol.server.ai.AIGoods');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
});
