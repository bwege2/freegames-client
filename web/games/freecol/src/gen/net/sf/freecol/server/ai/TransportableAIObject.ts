// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/TransportableAIObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { ValuedAIObject } from './ValuedAIObject.ts';

let Unit, Utils, AIUnit, TransportMission;

/**
 * A single item in a carrier's transport list.  Any {@link Locatable}
 * which should be able to be transported by a carrier using the
 * {@link net.sf.freecol.server.ai.mission.TransportMission}, 
 * should extend this class.
 *
 * @see net.sf.freecol.server.ai.mission.TransportMission
 */
export class TransportableAIObject extends ValuedAIObject {
  /**
   * The priority for a goods that are hitting the warehouse limit.
   */
  static readonly IMPORTANT_DELIVERY: number = 110;
  /**
   * The priority for goods that provide at least a full cargo load.
   */
  static readonly FULL_DELIVERY: number = 100;
  /**
   * The priority of tools intended for a Colony with none stored
   * at the present (and with no special needs).
   */
  static readonly TOOLS_FOR_COLONY_PRIORITY: number = 10;
  /**
   * The extra priority value added to the base value of
   * {@link #TOOLS_FOR_COLONY_PRIORITY}
   * for each ColonyTile needing a terrain improvement.
   */
  static readonly TOOLS_FOR_IMPROVEMENT: number = 10;
  /**
   * The extra priority value added to the base value of
   * {@link #TOOLS_FOR_COLONY_PRIORITY}
   * if a Pioneer is lacking tools
   */
  static readonly TOOLS_FOR_PIONEER: number = 90;
  /**
   * The extra priority value added to the base value of
   * {@link #TOOLS_FOR_COLONY_PRIORITY}
   * if a building is lacking tools. The number of tools
   * is also added to the total amount.
   */
  static readonly TOOLS_FOR_BUILDING: number = 100;
  /**
   * The {@code AIUnit} which has been allocated to transport
   * this object.
   */
  transport: AIUnit = null;
  static readonly TRANSPORT_TAG: string = 'transport';
  /**
   * Create a new uninitialized transportable AI object.
   *
   * @param aiMain an {@code AIMain} value
   * @param id The object identifier.
   */
  _TransportableAIObject$AIMain$String(aiMain: AIMain, id: string): this {
    this._ValuedAIObject$AIMain$String(aiMain, id);
    this.transport = null;
    return this;
  }
  /**
   * Creates a new transportable AI object from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   */
  _TransportableAIObject$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._ValuedAIObject$AIMain$FreeColXMLReader(aiMain, xr);
    return this;
  }
  /**
   * Gets the priority of transporting this object to its destination.
   *
   * @return The priority of the transport.
   */
  getTransportPriority(): number {
    return this.getValue();
  }
  /**
   * Sets the priority of getting this object to its destination.
   *
   * @param transportPriority The priority.
   */
  setTransportPriority(transportPriority: number): void {
    this.setValue(transportPriority);
  }
  /**
   * Increases the transport priority.
   */
  incrementTransportPriority(): void {
    this.setValue((this.getValue() + 1) | 0);
  }
  /**
   * Gets the carrier responsible for transporting this object.
   *
   * @return The {@code AIUnit} which will transport this object.
   */
  getTransport(): AIUnit {
    return this.transport;
  }
  /**
   * Sets the carrier responsible for transporting this object.
   *
   * @param transport The new carrier {@code AIUnit}.
   */
  setTransport(transport: AIUnit): void {
    this.transport = transport;
  }
  /**
   * Gets the number of cargo slots taken by this transportable.
   *
   * @return The number of cargo slots taken.
   */
  getSpaceTaken(): number {
    let l = this.getTransportLocatable();
    return (l == null) ? 0 : l.getSpaceTaken();
  }
  /**
   * Drop the current transport, keeping the transport mission consistent.
   *
   * Public so removeAIObject can drop its responsibilities.
   *
   * @return True if the unit has no allocated transport.
   */
  dropTransport(): boolean {
    let transport = this.getTransport();
    if (transport != null) {
      if (!transport.isDisposed() && this.getLocation() !== transport.getUnit()) {
        let tm = transport.getMission$Class($J.cls(TransportMission));
        if (tm != null) {
          tm.removeTransportable(this);
        }
      }
      this.setTransport(null);
    }
    return this.getTransport() == null;
  }
  /**
   * Change the allocated transport for this transportable to a different
   * carrier unit.
   *
   * FIXME: partial attempt to maintain consistency of any carrier
   * TransportMission lists, and disembark from the old carrier if
   * possible.
   *
   * @param aiCarrier The new carrier {@code AIUnit}.
   * @return True if the transport was changed, false if the transportable
   *     was unable to disembark from the old carrier or unable to be
   *     added to the new carrier transport list.
   */
  changeTransport(aiCarrier: AIUnit): boolean {
    let now: Location;
    let l = this.getTransportLocatable();
    if (l != null && (now = l.getLocation()) instanceof Unit && !(aiCarrier != null && aiCarrier.getUnit() === now)) {
      if (!this.leaveTransport$()) {
        return false;
      }
    }
    let old = this.getTransport();
    if (old != null) {
      if (old === aiCarrier) {
        return true;
      }
      let tm = old.getMission$Class($J.cls(TransportMission));
      if (tm != null) {
        tm.removeTransportable(this);
      }
    }
    this.setTransport(null);
    if (aiCarrier != null) {
      this.setTransport(aiCarrier);
    }
    return true;
  }
  /**
   * Get the transportables location if any.
   *
   * @return The transportable {@code Location}.
   */
  getLocation(): Location {
    let l = this.getTransportLocatable();
    return (l == null) ? null : l.getLocation();
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.transport != null) {
      let u = this.transport.getUnit();
      if (u != null && !u.isDisposed()) {
        xw.writeAttribute$String$FreeColObject(TransportableAIObject.TRANSPORT_TAG, u);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    this.transport = (xr.hasAttribute(TransportableAIObject.TRANSPORT_TAG)) ? xr.makeAIObject(aiMain, TransportableAIObject.TRANSPORT_TAG, $J.cls(AIUnit), null, true) : null;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof TransportableAIObject)) {
      return false;
    }
    let other = o;
    return Utils.equals(this.transport, other.transport) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + Utils.hashCode(this.transport)) | 0;
  }
}

$J.define(TransportableAIObject, 'net.sf.freecol.server.ai.TransportableAIObject', { kind: 'class', sup: 'net.sf.freecol.server.ai.ValuedAIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_TransportableAIObject$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_TransportableAIObject$AIMain$String' }, returns: { 'hashCode': 'int', 'getTransportDestination': 'net.sf.freecol.common.model.Location', 'getTransportSource': 'net.sf.freecol.common.model.Location', 'getTransportLocatable': 'net.sf.freecol.common.model.Locatable', 'getLocation': 'net.sf.freecol.common.model.Location', 'getSpaceTaken': 'int', 'getTransport': 'net.sf.freecol.server.ai.AIUnit', 'getTransportPriority': 'int' }, meths: { 'leaveTransport(net.sf.freecol.common.model.Direction)': 'leaveTransport$Direction', 'leaveTransport()': 'leaveTransport$' } });
$J.module(() => {
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
});
