// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/LogoutMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Game$LogoutReason, Player, ChangeSet, ChangeSet$See, Message, Message$MessagePriority, FreeColServer$ServerState;

/**
 * The message sent when logging out.
 */
export class LogoutMessage extends AttributeMessage {
  static readonly TAG: string = 'logout';
  static readonly PLAYER_TAG: string = 'player';
  static readonly REASON_TAG: string = 'reason';
  /**
   * Create a new {@code LogoutMessage}.
   *
   * Note: The logout reason is non-i18n for now as it is just logged.
   *
   * @param player The {@code Player} that has logged out.
   * @param reason A reason for logging out.
   */
  _LogoutMessage$Player$LogoutReason(player: Player, reason: Game$LogoutReason): this {
    this._AttributeMessage$String$StringArr(LogoutMessage.TAG, [LogoutMessage.PLAYER_TAG, player.getId(), LogoutMessage.REASON_TAG, $J.str(reason)]);
    return this;
  }
  /**
   * Create a new {@code LogoutMessage} from a stream.
   *
   * @param game The {@code Game} to read within.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _LogoutMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(LogoutMessage.TAG, xr, [LogoutMessage.PLAYER_TAG, LogoutMessage.REASON_TAG]);
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
    let player = this.getPlayer(game);
    let reason = this.getReason();
    if (player == null) {
      return;
    }
    if (freeColClient.isInGame()) {
      this.igc$FreeColClient(freeColClient).logoutHandler(player, reason);
    } else {
      this.pgc$FreeColClient(freeColClient).logoutHandler(player, reason);
    }
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      return null;
    }
    Message.logger.info('Handling logout by ' + serverPlayer.getName());
    let reason = this.getReason();
    let cs = null;
    {
      let endTurn: boolean;
      switch (freeColServer.getServerState()) {
        case FreeColServer$ServerState.PRE_GAME:
        case FreeColServer$ServerState.LOAD_GAME:
          break;
        case FreeColServer$ServerState.IN_GAME:
          endTurn = false;
          switch (reason) {
            case Game$LogoutReason.DEFEATED:
              endTurn = true;
              break;
            case Game$LogoutReason.LOGIN:
              break;
            case Game$LogoutReason.MAIN_TITLE:
            case Game$LogoutReason.NEW_GAME:
            case Game$LogoutReason.QUIT:
              if (freeColServer.getSinglePlayer() || serverPlayer.isAdmin()) {
                freeColServer.endGame();
              } else {
                endTurn = true;
              }
              break;
            case Game$LogoutReason.RECONNECT:
              break;
          }
          if (endTurn && freeColServer.getGame().getCurrentPlayer() === serverPlayer) {
            cs = freeColServer.getInGameController().endTurn(serverPlayer);
          }
          break;
        case FreeColServer$ServerState.END_GAME:
          return null;
      }
    }
    if (cs == null) {
      cs = new ChangeSet()._ChangeSet$();
    }
    cs.add$See$Message(ChangeSet$See.only(serverPlayer), new LogoutMessage()._LogoutMessage$Player$LogoutReason(serverPlayer, reason));
    freeColServer.updateMetaServer();
    return cs;
  }
  /**
   * Get the player logging out.
   *
   * @param game A {@code Game} to find the player in.
   * @return The player found.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(LogoutMessage.PLAYER_TAG), $J.cls(Player));
  }
  /**
   * Get the reason for logging out.
   *
   * @return The {@code LogoutReason}.
   */
  getReason(): Game$LogoutReason {
    return $J.enumValueOf($J.cls(Game$LogoutReason), this.getStringAttribute(LogoutMessage.REASON_TAG));
  }
}

$J.define(LogoutMessage, 'net.sf.freecol.common.networking.LogoutMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_LogoutMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Game$LogoutReason': '_LogoutMessage$Player$LogoutReason' }, returns: { 'getReason': 'net.sf.freecol.common.model.Game$LogoutReason', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  Player = $J.load('net.sf.freecol.common.model.Player');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  FreeColServer$ServerState = $J.load('net.sf.freecol.server.FreeColServer$ServerState');
});
