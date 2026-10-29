// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/PartialMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AttributeMessage } from './AttributeMessage.ts';

let Message, Message$MessagePriority;

/**
 * The message sent by the server to partially update client game objects.
 */
export class PartialMessage extends AttributeMessage {
  static readonly TAG: string = 'partial';
  static readonly ID_TAG: string = 'id';
  /**
   * Create a new {@code PartialMessage}.
   *
   * @param map A map of key,value pairs to update.
   */
  _PartialMessage$Map(map: JMap<string, string>): this {
    this._AttributeMessage$String$Map(PartialMessage.TAG, map);
    return this;
  }
  /**
   * Create a new {@code PartialMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _PartialMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$Map(PartialMessage.TAG, xr.getAllAttributes());
    xr.closeTag$String(PartialMessage.TAG);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.PARTIAL;
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
    let game = freeColClient.getGame();
    let id = this.getStringAttribute(PartialMessage.ID_TAG);
    if (id == null) {
      Message.logger.warning('Partial update is missing identifier attribute');
      return;
    }
    let fcgo = game.getFreeColGameObject$String(id);
    if (fcgo == null) {
      Message.logger.warning('Partial update of missing object: ' + id);
      return;
    }
    if (freeColClient.isInGame()) {
      this.igc$FreeColClient(freeColClient).partialHandler(fcgo, this.getStringAttributeMap());
    } else {
      Message.logger.warning('Partial update when not in game.');
    }
    this.clientGeneric(freeColClient);
  }
}

$J.define(PartialMessage, 'net.sf.freecol.common.networking.PartialMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_PartialMessage$Game$FreeColXMLReader', 'java.util.Map': '_PartialMessage$Map' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
