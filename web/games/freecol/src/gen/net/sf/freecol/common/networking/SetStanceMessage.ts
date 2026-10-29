// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetStanceMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Player, Stance, Message, Message$MessagePriority;

/**
 * The message sent to the clients to signal a stance change.
 */
export class SetStanceMessage extends AttributeMessage {
  static readonly TAG: string = 'setStance';
  static readonly FIRST_TAG: string = 'first';
  static readonly SECOND_TAG: string = 'second';
  static readonly STANCE_TAG: string = 'stance';
  /**
   * Create a new {@code SetStanceMessage} with the given stance and players.
   *
   * @param stance The new {@code Stance}.
   * @param first The {@code Player} whose stance is changing.
   * @param second The {@code Player} the stance is changed with respect to.
   */
  _SetStanceMessage$Stance$Player$Player(stance: Stance, first: Player, second: Player): this {
    this._AttributeMessage$String$StringArr(SetStanceMessage.TAG, [SetStanceMessage.STANCE_TAG, $J.str(stance), SetStanceMessage.FIRST_TAG, first.getId(), SetStanceMessage.SECOND_TAG, second.getId()]);
    return this;
  }
  /**
   * Create a new {@code SetStanceMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetStanceMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetStanceMessage.TAG, xr, [SetStanceMessage.STANCE_TAG, SetStanceMessage.FIRST_TAG, SetStanceMessage.SECOND_TAG]);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.STANCE;
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
    let stance = this.getStance();
    let p1 = this.getFirstPlayer(game);
    let p2 = this.getSecondPlayer(game);
    if (p1 == null) {
      Message.logger.warning('Invalid player1 for setStance');
      return;
    }
    if (p2 == null) {
      Message.logger.warning('Invalid player2 for setStance');
      return;
    }
    this.igc$FreeColClient(freeColClient).setStanceHandler(stance, p1, p2);
    this.clientGeneric(freeColClient);
  }
  /**
   * Get the stance that changed.
   *
   * @return The {@code Stance} value.
   */
  getStance(): Stance {
    return $J.enumValueOf($J.cls(Stance), this.getStringAttribute(SetStanceMessage.STANCE_TAG));
  }
  /**
   * Which player is changing stance?
   *
   * @param game The {@code Game} the player is in.
   * @return The player whose stance changes.
   */
  getFirstPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetStanceMessage.FIRST_TAG), $J.cls(Player));
  }
  /**
   * Which player is the stance changed with respect to?
   *
   * @param game The {@code Game} the player is in.
   * @return The player the stance changed to.
   */
  getSecondPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetStanceMessage.SECOND_TAG), $J.cls(Player));
  }
}

$J.define(SetStanceMessage, 'net.sf.freecol.common.networking.SetStanceMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetStanceMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Stance,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player': '_SetStanceMessage$Stance$Player$Player' }, returns: { 'getStance': 'net.sf.freecol.common.model.Stance', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
