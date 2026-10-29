// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/MultipleMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Level, StringBuilder } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let FreeColException, ChangeSet, ChangeSet$See, Message;

/**
 * The message that contains other messages.
 */
export class MultipleMessage extends AttributeMessage {
  static readonly TAG: string = 'multiple';
  /**
   * The list of messages.
   */
  messages: List<Message> = null;
  $init_MultipleMessage() {
    this.messages = new ArrayList();
  }
  /**
   * Create a new {@code MultipleMessage}.
   */
  _MultipleMessage$(): this {
    this._AttributeMessage$String(MultipleMessage.TAG);
    this.$init_MultipleMessage();
    this.messages.clear();
    return this;
  }
  /**
   * Create a new {@code MultipleMessage} with the given messages.
   *
   * @param messages The {@code Message}s to add.
   */
  _MultipleMessage$List(messages: List<Message>): this {
    this._MultipleMessage$();
    if (messages != null) {
      this.messages.addAll(messages);
    }
    return this;
  }
  /**
   * Create a new {@code MultipleMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   * @exception FreeColException if the internal message can not be read.
   */
  _MultipleMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._MultipleMessage$();
    this.setStringAttributeMap(xr.getAllAttributes());
    this.messages.clear();
    while (xr.moreTags()) {
      let mt = xr.getLocalName();
      let m = Message.read(game, xr);
      if (m != null) {
        this.messages.add(m);
      }
      xr.expectTag(mt);
    }
    xr.expectTag(MultipleMessage.TAG);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  isEmpty(): boolean {
    return super.isEmpty() && this.messages.isEmpty();
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let conn = aiPlayer.getConnection();
    if (conn == null) {
      return;
    }
    if (!this.messages.isEmpty()) {
      for (const $it0 = this.messages.iterator(); $it0.hasNext(); ) {
        let m = $it0.next();
        let ret = conn.handle(m);
        // assert ret == null
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let conn = freeColClient.askServer().getConnection();
    if (conn == null) {
      return;
    }
    if (!this.messages.isEmpty()) {
      for (const $it1 = this.messages.iterator(); $it1.hasNext(); ) {
        let m = $it1.next();
        let ret = conn.handle(m);
        // assert ret == null
      }
    }
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let conn = serverPlayer.getConnection();
    if (conn == null) {
      return null;
    }
    if (!this.messages.isEmpty()) {
      let cs = new ChangeSet()._ChangeSet$();
      for (const $it2 = this.messages.iterator(); $it2.hasNext(); ) {
        let m = $it2.next();
        try {
          let r = conn.handle(m);
          if (r != null) {
            cs.add$See$Message(ChangeSet$See.only(serverPlayer), r);
          }
        } catch ($e3) {
          if ($J.isa($e3, FreeColException)) {
            let fce = $J.exc($e3);
            Message.logger.log(Level.WARNING, 'MultipleMessage server fail', fce);
          } else {
            throw $e3;
          }
        }
      }
      return (cs.isEmpty()) ? null : cs;
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    for (const $it4 = this.messages.iterator(); $it4.hasNext(); ) {
      let m = $it4.next();
      m.toXML(xw);
    }
  }
  /**
   * Simplify this message.
   *
   * Called from ChangeSet.build with the intent of minimizing traffic.
   *
   * @return A simplified {@code Message}.
   */
  simplify(): Message {
    let ret: Message;
    switch (this.messages.size()) {
      case 0:
        ret = (this.isEmpty()) ? null : this;
        break;
      case 1:
        ret = this.messages.get(0);
        if (this.getStringAttributeMap().isEmpty()) {
        } else if (ret instanceof AttributeMessage) {
          ret.setStringAttributeMap(this.getStringAttributeMap());
        } else {
          ret = this;
        }
        break;
      default:
        ret = this;
        break;
    }
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(64);
    sb.append(String.fromCharCode(91 /* '[' */));
    Message.pretty(sb, this.getType$(), this.getStringAttributeMap(), null);
    for (const $it5 = this.messages.iterator(); $it5.hasNext(); ) {
      let m = $it5.next();
      sb.append(String.fromCharCode(32 /* ' ' */)).append($J.str(m));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
}

$J.define(MultipleMessage, 'net.sf.freecol.common.networking.MultipleMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_MultipleMessage$Game$FreeColXMLReader', 'java.util.List': '_MultipleMessage$List', '': '_MultipleMessage$' }, returns: { 'isEmpty': 'boolean' } });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  Message = $J.load('net.sf.freecol.common.networking.Message');
});
