// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AttributeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap } from '../../../../../../jre/index.ts';
import { TrivialMessage } from './TrivialMessage.ts';

let Message$MessagePriority;

/**
 * The basic message with optional attributes.
 */
export class AttributeMessage extends TrivialMessage {
  static readonly TAG: string = 'attribute';
  /**
   * The key,value attribute pairs.
   */
  attributes: JMap<string, string> = null;
  /**
   * Whether this message is trivially mergeable.
   */
  mergeable: boolean = false;
  $init_AttributeMessage() {
    this.attributes = new HashMap();
    this.mergeable = false;
  }
  /**
   * Create a new {@code AttributeMessage} of a given type.
   *
   * @param type The message type.
   */
  _AttributeMessage$String(type$: string): this {
    this._TrivialMessage$String(type$);
    this.$init_AttributeMessage();
    this.attributes.clear();
    return this;
  }
  /**
   * Create a new {@code AttributeMessage} of a given type and attributes.
   *
   * @param type The message type.
   * @param attributes The key,value pairs.
   */
  _AttributeMessage$String$StringArr(type$: string, attributes: string[]): this {
    this._AttributeMessage$String(type$);
    this.setStringAttributes$StringArr(attributes);
    return this;
  }
  /**
   * Create a new {@code AttributeMessage} of a given type and attributes.
   *
   * @param type The message type.
   * @param attributeMap A map of key,value pairs.
   */
  _AttributeMessage$String$Map(type$: string, attributeMap: JMap<string, string>): this {
    this._AttributeMessage$String(type$);
    this.setStringAttributeMap(attributeMap);
    return this;
  }
  /**
   * Create a new {@code AttributeMessage} from a stream.
   *
   * Should only be called by direct subclasses of AttributeMessage
   * as the entire message is consumed.
   *
   * @param type The message type.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @param attributes The attributes to read.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _AttributeMessage$String$FreeColXMLReader$StringArr(type$: string, xr: FreeColXMLReader, attributes: string[]): this {
    this._AttributeMessage$String$Map(type$, xr.getAttributeMap(attributes));
    xr.closeTag$String(type$);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  hasAttribute(key: string): boolean {
    return this.attributes.containsKey(key);
  }
  /**
   * {@inheritDoc}
   */
  getStringAttribute(key: string): string {
    return this.attributes.get(key);
  }
  /**
   * {@inheritDoc}
   */
  setStringAttribute(key: string, value: string): void {
    if (key != null && value != null) {
      this.attributes.put(key, value);
    }
  }
  /**
   * {@inheritDoc}
   */
  getStringAttributeMap(): JMap<string, string> {
    return this.attributes;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.ATTRIBUTE;
  }
  /**
   * {@inheritDoc}
   */
  canMerge(): boolean {
    return this.mergeable;
  }
  /**
   * Set the mergeable state of this message.
   *
   * @param mergeable The new mergeable state.
   * @return This message.
   */
  setMergeable(mergeable: boolean): AttributeMessage {
    this.mergeable = mergeable;
    return this;
  }
}

$J.define(AttributeMessage, 'net.sf.freecol.common.networking.AttributeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.TrivialMessage', ctors: { 'java.lang.String,net.sf.freecol.common.io.FreeColXMLReader,java.lang.String[]': '_AttributeMessage$String$FreeColXMLReader$StringArr', 'java.lang.String,java.util.Map': '_AttributeMessage$String$Map', 'java.lang.String,java.lang.String[]': '_AttributeMessage$String$StringArr', 'java.lang.String': '_AttributeMessage$String' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getStringAttributeMap': 'java.util.Map' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
