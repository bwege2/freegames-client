// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/WorkerWish.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, NullPointerException } from '../../../../../../jre/index.ts';
import { Wish } from './Wish.ts';

let UnitType, LogBuilder, Utils, AIUnit;

/**
 * Represents the need for a worker within a {@code Colony}.
 */
export class WorkerWish extends Wish {
  static logger: Logger = null;
  static readonly TAG: string = 'workerWish';
  /**
   * The type of unit required.
   */
  unitType: UnitType = null;
  /**
   * Whether the exact type is needed.
   */
  expertNeeded: boolean = false;
  static readonly EXPERT_NEEDED_TAG: string = 'expertNeeded';
  static readonly TRANSPORTABLE_TAG: string = 'transportable';
  static readonly UNIT_TYPE_TAG: string = 'unitType';
  /**
   * Creates a new uninitialized {@code WorkerWish} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param id The object identifier.
   */
  _WorkerWish$AIMain$String(aiMain: AIMain, id: string): this {
    this._Wish$AIMain$String(aiMain, id);
    this.unitType = null;
    this.expertNeeded = false;
    this.initialized = false;
    return this;
  }
  /**
   * Creates a new {@code WorkerWish}.
   *
   * @param aiMain The main AI-object.
   * @param destination The {@code Location} in which the
   *       {@link Wish#getTransportable transportable} assigned to
   *       this {@code WorkerWish} will have to reach.
   * @param value The value identifying the importance of
   *       this {@code Wish}.
   * @param unitType The type of unit needed for releasing this wish
   *       completely.
   * @param expertNeeded Determines wether the {@code unitType} is
   *       required or not.
   */
  _WorkerWish$AIMain$Location$int$UnitType$boolean(aiMain: AIMain, destination: Location, value: number, unitType: UnitType, expertNeeded: boolean): this {
    this._WorkerWish$AIMain$String(aiMain, WorkerWish.TAG + ':' + aiMain.getNextId());
    if (destination == null) {
      throw new NullPointerException('destination == null: ' + $J.str(this));
    }
    this.destination = destination;
    this.setValue(value);
    this.unitType = unitType;
    this.expertNeeded = expertNeeded;
    this.setInitialized();
    return this;
  }
  /**
   * Creates a new {@code WorkerWish} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   */
  _WorkerWish$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._Wish$AIMain$FreeColXMLReader(aiMain, xr);
    this.setInitialized();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setInitialized(): void {
    this.initialized = this.destination != null && this.unitType != null;
  }
  /**
   * Updates this {@code WorkerWish} with the given attributes.
   *
   * @param unitType The {@code UnitType} to wish for.
   * @param expertNeeded Is an expert unit required?
   * @param value The urgency of the wish.
   */
  update(unitType: UnitType, expertNeeded: boolean, value: number): void {
    this.setValue(value);
    this.unitType = unitType;
    this.expertNeeded = expertNeeded;
    if (this.transportable != null) {
      this.transportable.setTransportPriority(value);
    }
  }
  /**
   * Gets the type of unit needed for releasing this wish.
   *
   * @return The type of unit.
   */
  getUnitType(): UnitType {
    return this.unitType;
  }
  /**
   * Does a specified unit satisfy this wish?
   *
   * @param unit The {@code Unit} to test.
   * @return True if the unit either matches exactly if expertRequired,
   *     or at least matches in a land/naval sense if not.
   */
  satisfiedBy$Unit(unit: Unit): boolean {
    return (this.expertNeeded) ? unit.getType() === this.unitType : unit.getType().isNaval() === this.unitType.isNaval();
  }
  /**
   * {@inheritDoc}
   */
  satisfiedBy$AbstractGoods<T>(goods: T): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  checkIntegrity$boolean$LogBuilder(fix: boolean, lb: LogBuilder): Constants$IntegrityType {
    let result = super.checkIntegrity$boolean$LogBuilder(fix, lb);
    if (this.unitType == null) {
      lb.add(['\n  Wish unit without type: ', this.getId()]);
      result = result.fail();
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(WorkerWish.UNIT_TYPE_TAG, this.unitType);
    xw.writeAttribute$String$boolean(WorkerWish.EXPERT_NEEDED_TAG, this.expertNeeded);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let aiMain = this.getAIMain();
    let spec = this.getSpecification();
    this.transportable = (xr.hasAttribute(WorkerWish.TRANSPORTABLE_TAG)) ? xr.makeAIObject(aiMain, WorkerWish.TRANSPORTABLE_TAG, $J.cls(AIUnit), null, true) : null;
    this.unitType = xr.getType(spec, WorkerWish.UNIT_TYPE_TAG, $J.cls(UnitType), null);
    this.expertNeeded = xr.getAttribute$String$boolean(WorkerWish.EXPERT_NEEDED_TAG, false);
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return WorkerWish.TAG;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (!(o instanceof WorkerWish)) {
      return false;
    }
    let other = o;
    return this.expertNeeded === other.expertNeeded && Utils.equals(this.unitType, other.unitType) && super.equals(other);
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(37, hash) + Utils.hashCode(this.unitType)) | 0;
    return (Math.imul(37, hash) + ((this.expertNeeded) ? 1 : 0)) | 0;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let lb = new LogBuilder()._LogBuilder(64);
    lb.add(['[', this.getId(), ' ', ((this.unitType == null) ? 'null' : this.unitType.getSuffix$()), ((this.expertNeeded) ? '/expert' : ''), ' -> ', this.destination, ' (', this.getValue(), ')]']);
    return lb.toString();
  }
  static $clinit() {
    WorkerWish.logger = Logger.getLogger($J.cls(WorkerWish).getName());
  }
}

$J.define(WorkerWish, 'net.sf.freecol.server.ai.WorkerWish', { kind: 'class', sup: 'net.sf.freecol.server.ai.Wish', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_WorkerWish$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.model.Location,int,net.sf.freecol.common.model.UnitType,boolean': '_WorkerWish$AIMain$Location$int$UnitType$boolean', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_WorkerWish$AIMain$String' }, returns: { 'hashCode': 'int', 'getXMLTagName': 'java.lang.String', 'getUnitType': 'net.sf.freecol.common.model.UnitType' }, meths: { 'checkIntegrity(boolean,net.sf.freecol.common.util.LogBuilder)': 'checkIntegrity$boolean$LogBuilder', 'satisfiedBy(net.sf.freecol.common.model.AbstractGoods)': 'satisfiedBy$AbstractGoods', 'satisfiedBy(net.sf.freecol.common.model.Unit)': 'satisfiedBy$Unit' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIUnit = $J.load('net.sf.freecol.server.ai.AIUnit');
});
