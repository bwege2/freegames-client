// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/FirstContactMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Player, Tile, Message, Message$MessagePriority;

/**
 * The message sent when making first contact between players.
 */
export class FirstContactMessage extends AttributeMessage {
  static readonly TAG: string = 'firstContact';
  static readonly CAMPS_TAG: string = 'camps';
  static readonly OTHER_TAG: string = 'other';
  static readonly PLAYER_TAG: string = 'player';
  static readonly RESULT_TAG: string = 'result';
  static readonly TILE_TAG: string = 'tile';
  /**
   * Create a new {@code FirstContactMessage}.
   *
   * @param player The {@code Player} making contact.
   * @param other The {@code Player} being contacted.
   * @param tile An optional {@code Tile} to offer.
   */
  _FirstContactMessage$Player$Player$Tile(player: Player, other: Player, tile: Tile): this {
    this._AttributeMessage$String$StringArr(FirstContactMessage.TAG, [FirstContactMessage.PLAYER_TAG, player.getId(), FirstContactMessage.OTHER_TAG, other.getId(), FirstContactMessage.TILE_TAG, (tile == null) ? null : tile.getId(), FirstContactMessage.CAMPS_TAG, ((other.isEuropean()) ? null : String(other.getSettlementCount()))]);
    return this;
  }
  /**
   * Create a new {@code FirstContactMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _FirstContactMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(FirstContactMessage.TAG, xr, [FirstContactMessage.PLAYER_TAG, FirstContactMessage.OTHER_TAG, FirstContactMessage.TILE_TAG, FirstContactMessage.CAMPS_TAG, FirstContactMessage.RESULT_TAG]);
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
    let game = freeColServer.getGame();
    let contactor = this.getPlayer(game);
    let contactee = this.getOtherPlayer(game);
    let tile = this.getTile(game);
    aiPlayer.firstContactHandler(contactor, contactee, tile);
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = freeColClient.getGame();
    let player = this.getPlayer(game);
    let other = this.getOtherPlayer(game);
    let tile = this.getTile(game);
    let n = this.getSettlementCount();
    if (player == null || player !== freeColClient.getMyPlayer()) {
      Message.logger.warning('firstContact with bad player: ' + $J.str(player));
      return;
    }
    if (other == null || other === player || !other.isIndian()) {
      Message.logger.warning('firstContact with bad other player: ' + $J.str(other));
      return;
    }
    if (tile != null && tile.getOwner() !== other) {
      Message.logger.warning('firstContact with bad tile: ' + $J.str(tile));
      return;
    }
    this.igc$FreeColClient(freeColClient).firstContactHandler(player, other, tile, n);
    this.clientGeneric(freeColClient);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    let game = freeColServer.getGame();
    let playerId = this.getStringAttribute(FirstContactMessage.PLAYER_TAG);
    let otherId = this.getStringAttribute(FirstContactMessage.OTHER_TAG);
    let first = this.getPlayer(game);
    if (first == null) {
      return serverPlayer.clientError$String('Invalid player: ' + playerId);
    } else if ($J.equals(serverPlayer.getId(), playerId)) {
    } else {
      return serverPlayer.clientError$String('Not our player: ' + playerId);
    }
    let otherPlayer = this.getOtherPlayer(game);
    if (otherPlayer == null) {
      return serverPlayer.clientError$String('Invalid other player: ' + otherId);
    } else if (otherPlayer === serverPlayer) {
      return serverPlayer.clientError$String('First contact with self!?!');
    }
    return this.igc$FreeColServer(freeColServer).nativeFirstContact(serverPlayer, otherPlayer, this.getTile(game), this.getResult());
  }
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(FirstContactMessage.PLAYER_TAG), $J.cls(Player));
  }
  getOtherPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(FirstContactMessage.OTHER_TAG), $J.cls(Player));
  }
  getTile(game: Game): Tile {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(FirstContactMessage.TILE_TAG), $J.cls(Tile));
  }
  getSettlementCount(): number {
    return this.getIntegerAttribute(FirstContactMessage.CAMPS_TAG, -1);
  }
  getResult(): boolean {
    return this.getBooleanAttribute(FirstContactMessage.RESULT_TAG, null);
  }
  setResult(result: boolean): FirstContactMessage {
    this.setBooleanAttribute(FirstContactMessage.RESULT_TAG, result);
    return this;
  }
}

$J.define(FirstContactMessage, 'net.sf.freecol.common.networking.FirstContactMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_FirstContactMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Tile': '_FirstContactMessage$Player$Player$Tile' }, returns: { 'getResult': 'boolean', 'getSettlementCount': 'int', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  Player = $J.load('net.sf.freecol.common.model.Player');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
