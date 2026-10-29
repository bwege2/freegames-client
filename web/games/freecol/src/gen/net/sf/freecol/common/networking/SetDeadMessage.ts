// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetDeadMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Player, Message, Message$MessagePriority;

/**
 * The message to signal a player has died.
 */
export class SetDeadMessage extends AttributeMessage {
  static readonly TAG: string = 'setDead';
  static readonly PLAYER_TAG: string = 'player';
  /**
   * Create a new {@code SetDeadMessage} for a given player.
   *
   * @param player The {@code Player} that has died.
   */
  _SetDeadMessage$Player(player: Player): this {
    this._AttributeMessage$String$StringArr(SetDeadMessage.TAG, [SetDeadMessage.PLAYER_TAG, player.getId()]);
    return this;
  }
  /**
   * Create a new {@code SetDeadMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetDeadMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetDeadMessage.TAG, xr, [SetDeadMessage.PLAYER_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.EARLY;
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
    let player = this.getPlayer(game);
    if (player == null) {
      Message.logger.warning('Invalid player for setDead');
      return;
    }
    this.igc$FreeColClient(freeColClient).setDeadHandler(player);
    this.clientGeneric(freeColClient);
  }
  /**
   * Who died?
   *
   * @param game The {@code Game} the player is in.
   * @return The {@code Player} that has died.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetDeadMessage.PLAYER_TAG), $J.cls(Player));
  }
}

$J.define(SetDeadMessage, 'net.sf.freecol.common.networking.SetDeadMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetDeadMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player': '_SetDeadMessage$Player' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
