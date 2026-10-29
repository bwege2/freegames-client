// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/WrapperMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, StringBuilder } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Message;

/**
 * A wrapper message.  That is a message with just a reply identifier
 * attribute to be matched, and the underlying real message.
 */
export class WrapperMessage extends AttributeMessage {
  static readonly REPLY_ID_TAG: string = 'networkReplyId';
  /**
   * The encapsulated message.
   */
  message: Message = null;
  $init_WrapperMessage() {
    this.message = null;
  }
  /**
   * Create a new {@code WrapperMessage} of a given type.
   *
   * @param tag The actual message tag.
   * @param replyId The reply id.
   * @param message The {@code Message} to encapsulate.
   */
  _WrapperMessage$String$int$Message(tag: string, replyId: number, message: Message): this {
    this._AttributeMessage$String$StringArr(tag, [WrapperMessage.REPLY_ID_TAG, String(replyId)]);
    this.$init_WrapperMessage();
    this.message = message;
    return this;
  }
  /**
   * Create a new {@code WrapperMessage} from a stream.
   *
   * @param tag The actual message tag.
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   * @exception FreeColException if the internal message can not be read.
   */
  _WrapperMessage$String$Game$FreeColXMLReader(tag: string, game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$StringArr(tag, [WrapperMessage.REPLY_ID_TAG, xr.getAttribute$String$String(WrapperMessage.REPLY_ID_TAG, null)]);
    this.$init_WrapperMessage();
    this.message = null;
    while (xr.moreTags()) {
      let mt = xr.getLocalName();
      if (this.message == null) {
        this.message = Message.read(game, xr);
        xr.expectTag(mt);
      } else {
        xr.expectTag(tag);
      }
    }
    xr.expectTag(tag);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isEmpty(): boolean {
    return this.message == null && super.isEmpty();
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    if (this.message != null) {
      this.message.clientHandler(freeColClient);
    }
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    return (this.message == null) ? null : this.message.serverHandler(freeColServer, serverPlayer);
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    if (this.message != null) {
      this.message.toXML(xw);
    }
  }
  /**
   * Get the wrapped message.
   *
   * @return The {@code Message}.
   */
  getMessage(): Message {
    return this.message;
  }
  /**
   * {@inheritDoc}
   */
  getSubType(): string {
    return (this.message == null) ? null : this.message.getType$();
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */));
    Message.pretty(sb, this.getType$(), this.getStringAttributeMap(), null);
    if (this.message != null) {
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(this.message));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(WrapperMessage, 'net.sf.freecol.common.networking.WrapperMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'java.lang.String,net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_WrapperMessage$String$Game$FreeColXMLReader', 'java.lang.String,int,net.sf.freecol.common.networking.Message': '_WrapperMessage$String$int$Message' }, returns: { 'getSubType': 'java.lang.String', 'getMessage': 'net.sf.freecol.common.networking.Message', 'isEmpty': 'boolean' } });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
});
