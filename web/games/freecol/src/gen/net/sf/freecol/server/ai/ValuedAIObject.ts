// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/ValuedAIObject.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Comparator } from '../../../../../../jre/index.ts';
import { AIObject } from './AIObject.ts';

let FreeColObject;

/**
 * Abstract class of AI object with a simple enclosed comparable
 * integer value.
 */
export class ValuedAIObject extends AIObject {
  /**
   * A comparator by ascending AI object value.
   */
  static ascendingValueComparator: Comparator<any> = null;
  /**
   * A comparator by descending AI object value.
   */
  static descendingValueComparator: Comparator<any> = null;
  /**
   * The value of this AIObject.
   */
  value_: number = 0;
  /**
   * Creates a new {@code ValuedAIObject} instance.
   *
   * @param aiMain an {@code AIMain} value
   */
  _ValuedAIObject$AIMain(aiMain: AIMain): this {
    this._AIObject$AIMain(aiMain);
    return this;
  }
  /**
   * Creates a new uninitialized {@code ValuedAIObject} instance.
   *
   * @param aiMain an {@code AIMain} value
   * @param id The object identifier.
   */
  _ValuedAIObject$AIMain$String(aiMain: AIMain, id: string): this {
    this._AIObject$AIMain$String(aiMain, id);
    this.value_ = 0;
    return this;
  }
  /**
   * Creates a new {@code ValuedAIObject} from the given
   * XML-representation.
   *
   * @param aiMain The main AI-object.
   * @param xr The input stream containing the XML.
   * @throws XMLStreamException if a problem was encountered
   *      during parsing.
   */
  _ValuedAIObject$AIMain$FreeColXMLReader(aiMain: AIMain, xr: FreeColXMLReader): this {
    this._AIObject$AIMain$FreeColXMLReader(aiMain, xr);
    return this;
  }
  /**
   * Get the value.
   *
   * @return The value.
   */
  getValue(): number {
    return this.value_;
  }
  /**
   * Set the value.
   *
   * @param newValue The new value.
   */
  setValue(newValue: number): void {
    this.value_ = newValue;
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, this.value_);
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.setValue(xr.getAttribute$String$int(FreeColObject.VALUE_TAG, -1));
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (o instanceof ValuedAIObject) {
      let other = o;
      return this.value_ === other.value_ && super.equals(other);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    return (Math.imul(37, hash) + this.value_) | 0;
  }
  static $clinit() {
    ValuedAIObject.ascendingValueComparator = Comparator.comparingInt(($p0) => $p0.getValue());
    ValuedAIObject.descendingValueComparator = Comparator.reversed(ValuedAIObject.ascendingValueComparator);
  }
}

$J.define(ValuedAIObject, 'net.sf.freecol.server.ai.ValuedAIObject', { kind: 'class', sup: 'net.sf.freecol.server.ai.AIObject', ctors: { 'net.sf.freecol.server.ai.AIMain,net.sf.freecol.common.io.FreeColXMLReader': '_ValuedAIObject$AIMain$FreeColXMLReader', 'net.sf.freecol.server.ai.AIMain,java.lang.String': '_ValuedAIObject$AIMain$String', 'net.sf.freecol.server.ai.AIMain': '_ValuedAIObject$AIMain' }, returns: { 'hashCode': 'int', 'getValue': 'int' }, clinit: true, lazy: ['ascendingValueComparator', 'descendingValueComparator'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
