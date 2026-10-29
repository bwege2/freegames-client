// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/UpdateMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, FreeColXMLWriter$WriteScope, Message$MessagePriority;

/**
 * The message sent to update game objects.
 */
export class UpdateMessage extends ObjectMessage {
  static readonly TAG: string = 'update';
  /**
   * The player to specialize the objects for.
   */
  destination: Player = null;
  /**
   * Create a new {@code UpdateMessage}.
   *
   * @param destination The destination {@code Player}.
   */
  _UpdateMessage$Player(destination: Player): this {
    this._ObjectMessage$String(UpdateMessage.TAG);
    this.destination = destination;
    return this;
  }
  /**
   * Create a new {@code UpdateMessage}.
   *
   * @param destination The destination {@code Player}.
   * @param fcgo A {@code FreeColGameObject}s to add.
   */
  _UpdateMessage$Player$FreeColGameObject(destination: Player, fcgo: FreeColGameObject): this {
    this._UpdateMessage$Player(destination);
    this.appendChild(fcgo);
    return this;
  }
  /**
   * Create a new {@code UpdateMessage}.
   *
   * @param destination The destination {@code Player}.
   * @param fcgos A list of {@code FreeColObject}s to add.
   */
  _UpdateMessage$Player$List(destination: Player, fcgos: List<FreeColGameObject>): this {
    this._UpdateMessage$Player(destination);
    this.appendChildren(fcgos);
    return this;
  }
  /**
   * Create a new {@code UpdateMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _UpdateMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._UpdateMessage$Player(null);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let fcos = new ArrayList();
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        fcos.add(xr.readFreeColObject$Game(game));
        xr.expectTag(tag);
      }
      xr.expectTag(UpdateMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChildren(fcos);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.UPDATE;
  }
  /**
   * {@inheritDoc}
   */
  merge(message: Message): boolean {
    if (message instanceof UpdateMessage) {
      let other = message;
      this.appendChildren(other.getChildren$());
      return true;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  toXML(xw: FreeColXMLWriter): void {
    let ws = null;
    if (this.destination != null) {
      ws = xw.replaceScope(FreeColXMLWriter$WriteScope.toClient(this.destination));
    }
    super.toXML(xw);
    if (this.destination != null) {
      xw.replaceScope(ws);
    }
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    if (freeColClient.isInGame()) {
      this.igc$FreeColClient(freeColClient).updateHandler(this.getChildren$());
      this.clientGeneric(freeColClient);
    } else {
      this.pgc$FreeColClient(freeColClient).updateHandler(this.getChildren$());
    }
  }
}

$J.define(UpdateMessage, 'net.sf.freecol.common.networking.UpdateMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_UpdateMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,java.util.List': '_UpdateMessage$Player$List', 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.FreeColGameObject': '_UpdateMessage$Player$FreeColGameObject', 'net.sf.freecol.common.model.Player': '_UpdateMessage$Player' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
