// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/RemoveMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Message$MessagePriority, CollectionUtils;

/**
 * The message sent when removing a FreeColGameObject.
 */
export class RemoveMessage extends AttributeMessage {
  static readonly TAG: string = 'remove';
  static readonly DIVERT_TAG: string = 'divert';
  /**
   * Create a new {@code RemoveMessage}.
   *
   * @param divertId The identifier of an object to divert message
   *     attribution to.
   * @param objects A list of {@code FreeColGameObject}s to remove.
   */
  _RemoveMessage$String$List(divertId: string, objects: List<FreeColGameObject>): this {
    this._AttributeMessage$String$StringArr(RemoveMessage.TAG, [RemoveMessage.DIVERT_TAG, divertId]);
    this.setArrayAttributes$List(CollectionUtils.transform$Collection$Predicate$Function(objects, CollectionUtils.alwaysTrue(), ($p0) => $p0.getId()));
    return this;
  }
  /**
   * Create a new {@code RemoveMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr A {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _RemoveMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$Map(RemoveMessage.TAG, RemoveMessage.getAttributeMap(xr));
    xr.closeTag$String(RemoveMessage.TAG);
    return this;
  }
  /**
   * Get the attributes as a map.
   *
   * @param xr A {@code FreeColXMLReader} to read from.
   * @return A map of the attributes.
   */
  static getAttributeMap(xr: FreeColXMLReader): JMap<string, string> {
    let ret = xr.getArrayAttributeMap();
    ret.put(RemoveMessage.DIVERT_TAG, xr.getAttribute$String$String(RemoveMessage.DIVERT_TAG, null));
    return ret;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.REMOVE;
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
    let divert = this.getDivertObject(game);
    let objects = this.getRemovals(game);
    if (objects.isEmpty()) {
      return;
    }
    this.igc$FreeColClient(freeColClient).removeHandler(objects, divert);
    this.clientGeneric(freeColClient);
  }
  /**
   * Get the divert object.
   *
   * @param game The {@code Game} to look in.
   * @return The divert object, or null if none found.
   */
  getDivertObject(game: Game): FreeColGameObject {
    return game.getFreeColGameObject$String(this.getStringAttribute(RemoveMessage.DIVERT_TAG));
  }
  /**
   * Get the objects to remove.
   *
   * @param game The {@code Game} to look in.
   * @return A list of {@code FreeColGameObject}s to remove.
   */
  getRemovals(game: Game): List<FreeColGameObject> {
    let ret = new ArrayList();
    for (const $it0 = this.getArrayAttributes().iterator(); $it0.hasNext(); ) {
      let id = $it0.next();
      let fcgo = game.getFreeColGameObject$String(id);
      if (fcgo != null) {
        ret.add(fcgo);
      }
    }
    return ret;
  }
}

$J.define(RemoveMessage, 'net.sf.freecol.common.networking.RemoveMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_RemoveMessage$Game$FreeColXMLReader', 'java.lang.String,java.util.List': '_RemoveMessage$String$List' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
