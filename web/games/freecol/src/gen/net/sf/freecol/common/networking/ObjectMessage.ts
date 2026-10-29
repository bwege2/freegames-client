// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ObjectMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

/**
 * The basic message with optional objects.
 */
export class ObjectMessage extends AttributeMessage {
  /**
   * The attached FreeColObjects.
   */
  objects: List<FreeColObject> = null;
  $init_ObjectMessage() {
    this.objects = new ArrayList();
  }
  /**
   * Create a new {@code ObjectMessage} of a given type.
   *
   * @param type The message type.
   */
  _ObjectMessage$String(type$: string): this {
    this._AttributeMessage$String(type$);
    this.$init_ObjectMessage();
    this.objects.clear();
    return this;
  }
  /**
   * Create a new {@code ObjectMessage} of a given type, with
   * attributes and optional objects.
   *
   * @param type The message type.
   * @param attributes A list of key,value pairs.
   */
  _ObjectMessage$String$StringArr(type$: string, attributes: string[]): this {
    this._AttributeMessage$String$StringArr(type$, attributes);
    this.$init_ObjectMessage();
    this.objects.clear();
    return this;
  }
  /**
   * Create a new {@code AttributeMessage} from a stream.
   *
   * @param type The message type.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param attributes The attributes to read.
   */
  _ObjectMessage$String$FreeColXMLReader$StringArr(type$: string, xr: FreeColXMLReader, attributes: string[]): this {
    this._AttributeMessage$String$Map(type$, xr.getAttributeMap(attributes));
    this.$init_ObjectMessage();
    this.objects.clear();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getChildCount(): number {
    return this.objects.size();
  }
  /**
   * {@inheritDoc}
   */
  getChildren$(): List<FreeColObject> {
    return this.objects;
  }
  /**
   * {@inheritDoc}
   */
  setChildren(fcos: List<FreeColObject>): void {
    this.objects.clear();
    this.objects.addAll(fcos);
  }
  /**
   * {@inheritDoc}
   */
  appendChild<T>(fco: T): void {
    if (fco != null) {
      this.objects.add(fco);
    }
  }
  /**
   * {@inheritDoc}
   */
  appendChildren<T>(fcos: Collection<T>): void {
    if (fcos != null) {
      this.objects.addAll(fcos);
    }
  }
}

$J.define(ObjectMessage, 'net.sf.freecol.common.networking.ObjectMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'java.lang.String,net.sf.freecol.common.io.FreeColXMLReader,java.lang.String[]': '_ObjectMessage$String$FreeColXMLReader$StringArr', 'java.lang.String,java.lang.String[]': '_ObjectMessage$String$StringArr', 'java.lang.String': '_ObjectMessage$String' }, returns: { 'getChildren$': 'java.util.List', 'getChildCount': 'int' }, meths: { 'getChildren()': 'getChildren$' } });
