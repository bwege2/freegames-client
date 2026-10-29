// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetAIMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Player, Message$MessagePriority;

/**
 * The message that changes the AI state of a player.
 */
export class SetAIMessage extends AttributeMessage {
  static readonly TAG: string = 'setAI';
  static readonly AI_TAG: string = 'ai';
  static readonly PLAYER_TAG: string = 'player';
  /**
   * Create a new {@code SetAIMessage} with the given player and state.
   *
   * @param player The {@code Player} to set.
   * @param ai The new AI state.
   */
  _SetAIMessage$Player$boolean(player: Player, ai: boolean): this {
    this._AttributeMessage$String$StringArr(SetAIMessage.TAG, [SetAIMessage.PLAYER_TAG, player.getId(), SetAIMessage.AI_TAG, String(ai)]);
    return this;
  }
  /**
   * Create a new {@code SetAIMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr A {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetAIMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetAIMessage.TAG, xr, [SetAIMessage.PLAYER_TAG, SetAIMessage.AI_TAG]);
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
  aiHandler(freeColServer: FreeColServer, aiPlayer: AIPlayer): void {
    let player = this.getPlayer(freeColServer.getGame());
    let ai = this.getAI();
    if (player == null) {
      return;
    }
    aiPlayer.setAIHandler(player, ai);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let player = this.getPlayer(freeColClient.getGame());
    let ai = this.getAI();
    if (player == null) {
      return;
    }
    this.igc$FreeColClient(freeColClient).setAIHandler(player, ai);
  }
  /**
   * Which player is to be set?
   *
   * @param game The {@code Game} the player is in.
   * @return The {@code Player} to set the AI state of.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetAIMessage.PLAYER_TAG), $J.cls(Player));
  }
  /**
   * What AI state should be set?
   *
   * @return The AI state.
   */
  getAI(): boolean {
    return this.getBooleanAttribute(SetAIMessage.AI_TAG, false);
  }
}

$J.define(SetAIMessage, 'net.sf.freecol.common.networking.SetAIMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetAIMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,boolean': '_SetAIMessage$Player$boolean' }, returns: { 'getAI': 'boolean', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
