// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetNationMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, List } from '../../../../../../jre/index.ts';
import { AttributeMessage } from './AttributeMessage.ts';

let NationOptions$NationState, Player, StringTemplate, Message, Message$MessagePriority;

/**
 * The message that sets the player nation.
 */
export class SetNationMessage extends AttributeMessage {
  static readonly TAG: string = 'setNation';
  static readonly PLAYER_TAG: string = 'player';
  static readonly VALUE_TAG: string = 'value';
  /**
   * Create a new {@code SetNationMessage}.
   *
   * @param player The {@code Player} to set the nation for.
   * @param nation The {@code Nation} to set.
   */
  _SetNationMessage$Player$Nation(player: Player, nation: Nation): this {
    this._AttributeMessage$String$StringArr(SetNationMessage.TAG, [SetNationMessage.PLAYER_TAG, (player == null) ? null : player.getId(), SetNationMessage.VALUE_TAG, (nation == null) ? null : nation.getId()]);
    return this;
  }
  /**
   * Create a new {@code SetNationMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetNationMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetNationMessage.TAG, xr, [SetNationMessage.PLAYER_TAG, SetNationMessage.VALUE_TAG]);
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
    let nation = this.getValue(game.getSpecification());
    if (player != null && nation != null) {
      player.setNation(nation);
      if (!freeColClient.isInGame()) {
        this.pgc$FreeColClient(freeColClient).addPlayerHandler(List.of(player));
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      Message.logger.warning('setNation from unknown connection.');
    }
    let game = freeColServer.getGame();
    let other = this.getPlayer(game);
    if (other != null && other !== serverPlayer) {
      return serverPlayer.clientError$String('Player ' + other.getId() + ' set from ' + serverPlayer.getId());
    }
    let spec = game.getSpecification();
    let nation = this.getValue(spec);
    if (nation == null || game.getNationOptions().getNations().get(nation) !== NationOptions$NationState.AVAILABLE) {
      return serverPlayer.clientError$StringTemplate(StringTemplate.template$String('server.badNation').addName$String$String('%nation%', (nation == null) ? 'null' : nation.getId()));
    }
    return this.pgc$FreeColServer(freeColServer).setNation(serverPlayer, nation);
  }
  /**
   * Get the player that is setting its nation.
   *
   * @param game The {@code Game} to look up the player in.
   * @return The {@code Player} found, or null.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetNationMessage.PLAYER_TAG), $J.cls(Player));
  }
  /**
   * Get the nation to set.
   *
   * @param spec The {@code Specification} to look up the nation in.
   * @return The {@code Nation}.
   */
  getValue(spec: Specification): Nation {
    return spec.getNation(this.getStringAttribute(SetNationMessage.VALUE_TAG));
  }
}

$J.define(SetNationMessage, 'net.sf.freecol.common.networking.SetNationMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetNationMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Nation': '_SetNationMessage$Player$Nation' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  NationOptions$NationState = $J.load('net.sf.freecol.common.model.NationOptions$NationState');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
