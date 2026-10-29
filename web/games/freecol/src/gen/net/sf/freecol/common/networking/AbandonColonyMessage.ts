// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/AbandonColonyMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Colony, Message$MessagePriority;

/**
 * The message sent when the client requests abandoning of a colony.
 */
export class AbandonColonyMessage extends AttributeMessage {
  static readonly TAG: string = 'abandonColony';
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Create a new {@code AbandonColonyMessage} with the specified
   * colony.
   *
   * @param colony The {@code Colony} to abandon.
   */
  _AbandonColonyMessage$Colony(colony: Colony): this {
    this._AttributeMessage$String$StringArr(AbandonColonyMessage.TAG, [AbandonColonyMessage.COLONY_TAG, colony.getId()]);
    return this;
  }
  /**
   * Create a new {@code AbandonColonyMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _AbandonColonyMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(AbandonColonyMessage.TAG, xr, [AbandonColonyMessage.COLONY_TAG]);
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
    let colonyId = this.getStringAttribute(AbandonColonyMessage.COLONY_TAG);
    let colony: Colony;
    try {
      colony = serverPlayer.getOurFreeColGameObject(colonyId, $J.cls(Colony));
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        return serverPlayer.clientError$String(e.getMessage());
      } else {
        throw $e0;
      }
    }
    let count = colony.getUnitCount();
    if (count !== 0) {
      return serverPlayer.clientError$String('Attempt to abandon colony ' + colonyId + ' with non-zero unit count ' + String(count));
    }
    return this.igc$FreeColServer(freeColServer).abandonSettlement(serverPlayer, colony);
  }
}

$J.define(AbandonColonyMessage, 'net.sf.freecol.common.networking.AbandonColonyMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_AbandonColonyMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Colony': '_AbandonColonyMessage$Colony' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
