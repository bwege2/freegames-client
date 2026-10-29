// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/Wish.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { ValuedAIObject } from './ValuedAIObject.ts';

let Colony, Utils;

/**
 * Represents a need for something at a given {@code Location}.
 */
export class Wish extends ValuedAIObject {
  static logger: Logger = null;
  /**
   * The requesting location of this wish.
   */
  destination: Location = null;
  /**
   * The {@code TransportableAIObject} which will realize the wish,
   * or null if none has been assigned.
   */
  transportable: TransportableAIObject = null;
  static readonly DESTINATION_TAG: string = 'destination';
  static readonly TRANSPORTABLE_TAG: string = 'transportable';
  /**
   * Creates a new uninitialized {@code Wish}.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _Wish$AIMain$String(aiMain: AIMain, id: string): this {
    this._ValuedAIObject$AIMain$String(aiMain, id);
    this.destination = null;
    this.transportable = null;
    return this;
  }
  /**
   * Creates a new {@code Wish} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   */
  _Wish$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._ValuedAIObject$AIMain$FreeColXMLReader(aiMain, xr);
    let ac = this.getDestinationAIColony();
    if (ac != null) {
      ac.addWish(this);
    }
    return this;
  }
  /**
   * Checks if this {@code Wish} needs to be stored in a savegame.
   *
   * @return True if it has been allocated a transportable.
   */
  shouldBeStored(): boolean {
    return this.transportable != null;
  }
  /**
   * Gets the {@code TransportableAIObject} assigned to this wish.
   *
   * @see #setTransportable
   * @see net.sf.freecol.server.ai.mission.WishRealizationMission
   * @return The {@code TransportableAIObject} which will
   *     realize this wish, or null if none has been assigned.
   */
  getTransportable(): TransportableAIObject {
    return this.transportable;
  }
  /**
   * Assigns a {@code TransportableAIObject} to this {@code Wish}.
   *
   * @param transportable The {@code TransportableAIObject}
   *     which should realize this wish.
   * @see #getTransportable
   * @see net.sf.freecol.server.ai.mission.WishRealizationMission
   */
  setTransportable(transportable: TransportableAIObject): void {
    this.transportable = transportable;
  }
  /**
   * Gets the destination of this {@code Wish}.
   *
   * @return The {@code Location} in which the
   *     {@link #getTransportable transportable} assigned to
   *     this {@code Wish} will have to reach.
   */
  getDestination(): Location {
    return this.destination;
  }
  /**
   * Gets the destination AI colony, if any.
   *
   * @return The destination {@code AIColony}.
   */
  getDestinationAIColony(): AIColony {
    return (this.destination instanceof Colony) ? this.getAIMain().getAIColony(this.destination) : null;
  }
  /**
   * Disposes of this {@code AIObject} by removing any references
   * to this object.
   */
  dispose(): void {
    this.destination = null;
    this.transportable = null;
    super.dispose();
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    if (this.transportable != null) {
      result = result.combine(this.transportable.checkIntegrity$boolean$LogBuilder(fix, lb));
    }
    if (this.destination == null) {
      lb.add(['\n  Wish destination null for: ', this.getId()]);
      result = result.fail();
    } else if ((this.destination).isDisposed()) {
      lb.add(['\n  Wish destination disposed for: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.destination != null) {
      xw.writeAttribute(Wish.DESTINATION_TAG, this.destination.getId());
      if (this.transportable != null) {
        xw.writeAttribute(Wish.TRANSPORTABLE_TAG, this.transportable.getId());
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    this.destination = xr.getLocationAttribute(aiMain.getGame(), Wish.DESTINATION_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof Wish)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.destination, other.destination) && Utils.equals(this.transportable, other.transportable) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.destination)) | 0;
    return (Math.imul(37, hash) + Utils.hashCode(this.transportable)) | 0;
  }
  static $clinit() {
    Wish.logger = Logger.getLogger($J.cls(Wish).getName());
  }
}

$J.define(Wish, 'net.sf.freecol.server.ai.Wish', { kind: 'class', sup: 'net.sf.freecol.server.ai.ValuedAIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_Wish$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_Wish$AIMain$String' }, returns: { 'hashCode': 'int', 'getDestinationAIColony': 'net.sf.freecol.server.ai.AIColony', 'getDestination': 'net.sf.freecol.common.model.Location', 'getTransportable': 'net.sf.freecol.server.ai.TransportableAIObject' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder', 'satisfiedBy(net.sf.freecol.common.model.AbstractGoods)': 'satisfiedBy$AbstractGoods', 'satisfiedBy(net.sf.freecol.common.model.Unit)': 'satisfiedBy$Unit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
