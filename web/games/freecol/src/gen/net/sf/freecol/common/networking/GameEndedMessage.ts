// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/GameEndedMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let FreeColDebugger, Player, Message, Message$MessagePriority;

/**
 * The message to signal the end of the game.
 */
export class GameEndedMessage extends AttributeMessage {
  static readonly TAG: string = 'gameEnded';
  static readonly HIGH_SCORE_TAG: string = 'highScore';
  static readonly WINNER_TAG: string = 'winner';
  /**
   * Create a new {@code GameEndedMessage} with the supplied winner.
   *
   * @param winner The {@code Player} that has won.
   * @param highScore True if a new high score was reached.
   */
  _GameEndedMessage$Player$boolean(winner: Player, highScore: boolean): this {
    this._AttributeMessage$String$StringArr(GameEndedMessage.TAG, [GameEndedMessage.WINNER_TAG, winner.getId(), GameEndedMessage.HIGH_SCORE_TAG, String(highScore)]);
    return this;
  }
  /**
   * Create a new {@code GameEndedMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _GameEndedMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(GameEndedMessage.TAG, xr, [GameEndedMessage.WINNER_TAG, GameEndedMessage.HIGH_SCORE_TAG]);
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
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let winner = this.getWinner(game);
    let highScore = this.getScore();
    if (winner == null) {
      Message.logger.warning('Invalid player for gameEnded');
      return;
    }
    FreeColDebugger.finishDebugRun(freeColClient, true);
    if (winner !== freeColClient.getMyPlayer()) {
      return;
    }
    this.igc$FreeColClient(freeColClient).gameEndedHandler(highScore);
  }
  /**
   * Who won?
   *
   * @param game The {@code Game} the winner is in.
   * @return The {@code Player} that won.
   */
  getWinner(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(GameEndedMessage.WINNER_TAG), $J.cls(Player));
  }
  /**
   * Get the high score attribute.
   *
   * Note: *not* a boolean, due to a kludge in client.IGIH.
   *
   * @return The score attribute.
   */
  getScore(): string {
    return this.getStringAttribute(GameEndedMessage.HIGH_SCORE_TAG);
  }
}

$J.define(GameEndedMessage, 'net.sf.freecol.common.networking.GameEndedMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_GameEndedMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,boolean': '_GameEndedMessage$Player$boolean' }, returns: { 'getScore': 'java.lang.String', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
