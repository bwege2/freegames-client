// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/ai/AIInGameInputHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, NullPointerException, RuntimeException } from '../../../../../../jre/index.ts';
import { FreeColServerHolder } from '../control/FreeColServerHolder.ts';

let Message;

/**
 * Handles the network messages that arrives while in the game.
 */
export class AIInGameInputHandler extends FreeColServerHolder {
  static logger: Logger = null;
  /**
   * The player for whom I work.
   */
  player: Player = null;
  /**
   * The main AI object.
   */
  aiMain: AIMain = null;
  /**
   * The constructor to use.
   *
   * @param freeColServer The main server.
   * @param player The {@code Player} to manage.
   * @param aiMain The main AI-object.
   */
  _AIInGameInputHandler(freeColServer: FreeColServer, player: Player, aiMain: AIMain): this {
    this._FreeColServerHolder(freeColServer);
    if (player == null) {
      throw new NullPointerException('serverPlayer == null: ' + $J.str(this));
    } else if (!player.isAI()) {
      throw new RuntimeException('Applying AIInGameInputHandler to a non-AI player: ' + $J.str(player));
    } else if (aiMain == null) {
      throw new NullPointerException('aiMain == null: ' + $J.str(this));
    }
    this.player = player;
    this.aiMain = aiMain;
    return this;
  }
  /**
   * Get the AI player using this handler.
   *
   * @return The {@code AIPlayer}.
   */
  getMyAIPlayer(): AIPlayer {
    return this.aiMain.getAIPlayer(this.player);
  }
  /**
   * {@inheritDoc}
   */
  handle(connection: Connection, message: Message): Message {
    message.aiHandler(this.getFreeColServer(), this.getMyAIPlayer());
    return null;
  }
  /**
   * {@inheritDoc}
   */
  read(connection: Connection): Message {
    return Message.read(this.getGame(), connection.getFreeColXMLReader());
  }
  static $clinit() {
    AIInGameInputHandler.logger = Logger.getLogger($J.cls(AIInGameInputHandler).getName());
  }
}

$J.define(AIInGameInputHandler, 'net.sf.freecol.server.ai.AIInGameInputHandler', { kind: 'class', ifaces: ['net.sf.freecol.common.networking.MessageHandler'], sup: 'net.sf.freecol.server.control.FreeColServerHolder', ctors: { 'net.sf.freecol.server.FreeColServer,net.sf.freecol.common.model.Player,net.sf.freecol.server.ai.AIMain': '_AIInGameInputHandler' }, returns: { 'getMyAIPlayer': 'net.sf.freecol.server.ai.AIPlayer' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Message = $J.load('net.sf.freecol.common.networking.Message');
});
