// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/UnitTypeChange.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AtomicInteger, StringBuilder } from '../../../../../../jre/index.ts';
import { FreeColSpecObjectType } from './FreeColSpecObjectType.ts';

let UnitType;

/**
 * Simple container for individual type changes.
 */
export class UnitTypeChange extends FreeColSpecObjectType {
  static readonly TAG: string = 'unit-type-change';
  /**
   * The unit type to change from.
   */
  from: UnitType = null;
  /**
   * The unit type to change to.
   */
  to: UnitType = null;
  /**
   * The percentage chance of the change occurring.
   */
  probability: number = 0;
  /**
   * The number of turns for the change to take, if not immediate.
   */
  turns: number = 0;
  static fakeIdIndex: AtomicInteger = null;
  static readonly FROM_TAG: string = 'from';
  static readonly PROBABILITY_TAG: string = 'probability';
  static readonly TO_TAG: string = 'to';
  static readonly TURNS_TAG: string = 'turns';
  /**
   * Trivial constructor.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to use.
   */
  _UnitTypeChange$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObjectType$String$Specification(id, specification);
    return this;
  }
  /**
   * Read a unit change from a stream.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param spec The {@code Specification} to read within.
   * @exception XMLStreamException if there is a problem reading
   *     the stream.
   */
  _UnitTypeChange$FreeColXMLReader$Specification(xr: FreeColXMLReader, spec: Specification): this {
    this._UnitTypeChange$String$Specification(xr.readId(), spec);
    this.readFromXML(xr);
    return this;
  }
  /**
   * Helper to check if a change is available to a player.
   * This is useful when the change involves a transfer of ownership.
   *
   * @param player The {@code Player} to test.
   * @return True if the player can use the to-unit-type.
   */
  isAvailableTo(player: Player): boolean {
    return this.to.isAvailableTo([player]);
  }
  /**
   * {@inheritDoc}
   */
  copyIn<T>(other: T): boolean {
    let o = this.copyInCast(other, $J.cls(UnitTypeChange));
    if (o == null || !super.copyIn(o)) {
      return false;
    }
    this.from = o.from;
    this.to = o.to;
    this.probability = o.probability;
    this.turns = o.turns;
    return true;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$FreeColObject(UnitTypeChange.FROM_TAG, this.from);
    xw.writeAttribute$String$FreeColObject(UnitTypeChange.TO_TAG, this.to);
    xw.writeAttribute$String$int(UnitTypeChange.PROBABILITY_TAG, this.probability);
    if (this.turns > 0) {
      xw.writeAttribute$String$int(UnitTypeChange.TURNS_TAG, this.turns);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    let spec = this.getSpecification();
    super.readAttributes(xr);
    this.from = xr.getType(spec, UnitTypeChange.FROM_TAG, $J.cls(UnitType), null);
    this.to = xr.getType(spec, UnitTypeChange.TO_TAG, $J.cls(UnitType), null);
    this.probability = xr.getAttribute$String$int(UnitTypeChange.PROBABILITY_TAG, 0);
    this.turns = xr.getAttribute$String$int(UnitTypeChange.TURNS_TAG, -1);
    let id = this.getId();
    if (id == null || $J.equals('', id)) {
      this.setId('model.unitChange.faked.' + UnitTypeChange.fakeIdIndex.incrementAndGet());
    }
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return UnitTypeChange.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(32);
    sb.append(this.from.getSuffix$()).append('->').append(this.to.getSuffix$()).append(String.fromCharCode(47 /* \u002f */)).append(String(this.probability));
    if (this.turns > 0) {
      sb.append(String.fromCharCode(47 /* \u002f */)).append(String(this.turns));
    }
    return sb.toString();
  }
  static $clinit() {
    UnitTypeChange.fakeIdIndex = new AtomicInteger(0);
  }
}

$J.define(UnitTypeChange, 'net.sf.freecol.common.model.UnitTypeChange', { kind: 'class', sup: 'net.sf.freecol.common.model.FreeColSpecObjectType', ctors: { 'net.sf.freecol.common.io.FreeColXMLReader,net.sf.freecol.common.model.Specification': '_UnitTypeChange$FreeColXMLReader$Specification', 'java.lang.String,net.sf.freecol.common.model.Specification': '_UnitTypeChange$String$Specification' }, returns: { 'getXMLTagName': 'java.lang.String' }, clinit: true, lazy: ['fakeIdIndex'] });
$J.module(() => {
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
});
