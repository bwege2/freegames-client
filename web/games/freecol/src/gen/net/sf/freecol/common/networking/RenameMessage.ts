// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/RenameMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let FreeColGameObject, Nameable, Message$MessagePriority;

/**
 * The message sent when renaming a FreeColGameObject.
 */
export class RenameMessage extends AttributeMessage {
  static readonly TAG: string = 'rename';
  static readonly NAMEABLE_TAG: string = 'nameable';
  static readonly NAME_TAG: string = 'name';
  /**
   * Create a new {@code RenameMessage} with the
   * supplied name.
   *
   * @param object The {@code FreeColGameObject} to rename.
   * @param newName The new name for the object.
   */
  _RenameMessage$FreeColGameObject$String(object$: FreeColGameObject, newName: string): this {
    this._AttributeMessage$String$StringArr(RenameMessage.TAG, [RenameMessage.NAMEABLE_TAG, object$.getId(), RenameMessage.NAME_TAG, newName]);
    return this;
  }
  /**
   * Create a new {@code RenameMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _RenameMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(RenameMessage.TAG, xr, [RenameMessage.NAMEABLE_TAG, RenameMessage.NAME_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  currentPlayerMessage(): boolean {
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.NORMAL;
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let nameableId = this.getStringAttribute(RenameMessage.NAMEABLE_TAG);
    let fcgo: FreeColGameObject;
    try {
      fcgo = serverPlayer.getOurFreeColGameObject(nameableId, $J.cls(FreeColGameObject));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    if (!($J.isa(fcgo, Nameable))) {
      return serverPlayer.clientError$String('Not a nameable: ' + nameableId);
    }
    return this.igc$FreeColServer(freeColServer).renameObject(serverPlayer, fcgo, this.getStringAttribute(RenameMessage.NAME_TAG));
  }
}

$J.define(RenameMessage, 'net.sf.freecol.common.networking.RenameMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_RenameMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.FreeColGameObject,java.lang.String': '_RenameMessage$FreeColGameObject$String' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  FreeColGameObject = $J.load('net.sf.freecol.common.model.FreeColGameObject');
  Nameable = $J.load('net.sf.freecol.common.model.Nameable');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
