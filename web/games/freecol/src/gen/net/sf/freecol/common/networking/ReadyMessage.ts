// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ReadyMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let Player, Message, Message$MessagePriority;

/**
 * The message that signals a player is ready.
 */
export class ReadyMessage extends AttributeMessage {
  static readonly TAG: string = 'ready';
  static readonly PLAYER_TAG: string = 'player';
  static readonly VALUE_TAG: string = 'value';
  /**
   * Create a new {@code ReadyMessage} with the given player and state.
   *
   * @param player The {@code Player} to set.
   * @param ready True if the player is ready.
   */
  _ReadyMessage$Player$boolean(player: Player, ready: boolean): this {
    this._AttributeMessage$String$StringArr(ReadyMessage.TAG, [ReadyMessage.PLAYER_TAG, (player == null) ? null : player.getId(), ReadyMessage.VALUE_TAG, String(ready)]);
    return this;
  }
  /**
   * Create a new {@code ReadyMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _ReadyMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(ReadyMessage.TAG, xr, [ReadyMessage.PLAYER_TAG, ReadyMessage.VALUE_TAG]);
    return this;
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
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let player = this.getPlayer(game);
    let ready = this.getValue();
    if (player == null) {
      return;
    }
    this.pgc$FreeColClient(freeColClient).readyHandler(player, ready);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      Message.logger.warning('Ready from unknown player.');
    }
    let ready = this.getValue();
    return this.pgc$FreeColServer(freeColServer).ready(serverPlayer, ready);
  }
  /**
   * Which player is to be set?
   *
   * @param game The {@code Game} the player is in.
   * @return The {@code Player} to set the AI state of.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(ReadyMessage.PLAYER_TAG), $J.cls(Player));
  }
  /**
   * Get the ready state.
   *
   * @return True if the player is ready.
   */
  getValue(): boolean {
    return this.getBooleanAttribute(ReadyMessage.VALUE_TAG, false);
  }
}

$J.define(ReadyMessage, 'net.sf.freecol.common.networking.ReadyMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ReadyMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,boolean': '_ReadyMessage$Player$boolean' }, returns: { 'getValue': 'boolean', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
