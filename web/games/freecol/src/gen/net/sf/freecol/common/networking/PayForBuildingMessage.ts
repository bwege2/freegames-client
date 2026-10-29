// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/PayForBuildingMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * The message sent when paying for a building.
 */
export class PayForBuildingMessage extends AttributeMessage {
  static readonly TAG: string = 'payForBuilding';
  static readonly COLONY_TAG: string = 'colony';
  /**
   * Create a new {@code PayForBuildingMessage} with the
   * supplied colony.
   *
   * @param colony The {@code Colony} that is building.
   */
  _PayForBuildingMessage$Colony(colony: Colony): this {
    this._AttributeMessage$String$StringArr(PayForBuildingMessage.TAG, [PayForBuildingMessage.COLONY_TAG, colony.getId()]);
    return this;
  }
  /**
   * Create a new {@code PayForBuildingMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _PayForBuildingMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(PayForBuildingMessage.TAG, xr, [PayForBuildingMessage.COLONY_TAG]);
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
    let colonyId = this.getStringAttribute(PayForBuildingMessage.COLONY_TAG);
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
    return this.igc$FreeColServer(freeColServer).payForBuilding(serverPlayer, colony);
  }
}

$J.define(PayForBuildingMessage, 'net.sf.freecol.common.networking.PayForBuildingMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_PayForBuildingMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Colony': '_PayForBuildingMessage$Colony' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
