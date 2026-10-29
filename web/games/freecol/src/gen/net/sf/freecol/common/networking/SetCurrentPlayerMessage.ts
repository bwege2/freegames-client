// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetCurrentPlayerMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let FreeColException, Player, Message$MessagePriority;

/**
 * The message sent to the clients to signal a change of player.
 */
export class SetCurrentPlayerMessage extends AttributeMessage {
  static readonly TAG: string = 'setCurrentPlayer';
  static readonly PLAYER_TAG: string = 'player';
  /**
   * Create a new {@code SetCurrentPlayerMessage} with the given player.
   *
   * @param player The {@code Player} whose turn it is to be.
   */
  _SetCurrentPlayerMessage$Player(player: Player): this {
    this._AttributeMessage$String$StringArr(SetCurrentPlayerMessage.TAG, [SetCurrentPlayerMessage.PLAYER_TAG, player.getId()]);
    return this;
  }
  /**
   * Create a new {@code SetCurrentPlayerMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetCurrentPlayerMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetCurrentPlayerMessage.TAG, xr, [SetCurrentPlayerMessage.PLAYER_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.LATE;
  }
  /**
   * {@inheritDoc}
   */
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let currentPlayer = this.getPlayer(freeColServer.getGame());
    if (currentPlayer == null) {
      return;
    }
    aiPlayer.setCurrentPlayerHandler(currentPlayer);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let player = this.getPlayer(game);
    if (player == null) {
      throw new FreeColException()._FreeColException$String('Invalid player: ' + this.getStringAttribute(SetCurrentPlayerMessage.PLAYER_TAG));
    }
    this.igc$FreeColClient(freeColClient).setCurrentPlayerHandler(player);
    this.clientGeneric(freeColClient);
  }
  /**
   * Who is the new player?
   *
   * @param game The {@code Game} to find the player in.
   * @return The {@code Player} whose turn it now is.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetCurrentPlayerMessage.PLAYER_TAG), $J.cls(Player));
  }
}

$J.define(SetCurrentPlayerMessage, 'net.sf.freecol.common.networking.SetCurrentPlayerMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetCurrentPlayerMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player': '_SetCurrentPlayerMessage$Player' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
