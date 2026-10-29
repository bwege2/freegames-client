// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetNationTypeMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let NationOptions$Advantages, Player, StringTemplate, Message, Message$MessagePriority;

/**
 * The message that sets the player nationType.
 */
export class SetNationTypeMessage extends AttributeMessage {
  static readonly TAG: string = 'setNationType';
  static readonly PLAYER_TAG: string = 'player';
  static readonly VALUE_TAG: string = 'value';
  /**
   * Create a new {@code SetNationTypeMessage}.
   *
   * @param player The {@code Player} to change the type for.
   * @param nationType The {@code NationType} to set.
   */
  _SetNationTypeMessage$Player$NationType(player: Player, nationType: NationType): this {
    this._AttributeMessage$String$StringArr(SetNationTypeMessage.TAG, [SetNationTypeMessage.PLAYER_TAG, (player == null) ? null : player.getId(), SetNationTypeMessage.VALUE_TAG, nationType.getId()]);
    return this;
  }
  /**
   * Create a new {@code SetNationTypeMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetNationTypeMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetNationTypeMessage.TAG, xr, [SetNationTypeMessage.PLAYER_TAG, SetNationTypeMessage.VALUE_TAG]);
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
    let nationType = this.getValue(game.getSpecification());
    this.pgc$FreeColClient(freeColClient).setNationTypeHandler(nationType);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      Message.logger.warning('setNationType from unknown connection.');
      return null;
    }
    let game = freeColServer.getGame();
    let spec = game.getSpecification();
    let fixedNationType = spec.getNation(serverPlayer.getNationId()).getType();
    let nationType = this.getValue(spec);
    let ok: boolean;
    switch (game.getNationOptions().getNationalAdvantages()) {
      case NationOptions$Advantages.SELECTABLE:
        ok = true;
        break;
      case NationOptions$Advantages.FIXED:
        ok = nationType.equals(fixedNationType);
        break;
      case NationOptions$Advantages.NONE:
        ok = nationType === spec.getDefaultNationType();
        break;
      default:
        ok = false;
        break;
    }
    if (!ok) {
      return serverPlayer.clientError$StringTemplate(StringTemplate.template$String('server.badNationType').addName$String$String('%nationType%', $J.str(nationType)));
    }
    return this.pgc$FreeColServer(freeColServer).setNationType(serverPlayer, nationType);
  }
  /**
   * Get the player that is setting its nationType.
   *
   * @param game The {@code Game} to look up the player in.
   * @return The {@code Player} found, or null.
   */
  getPlayer(game: Game): Player {
    return game.getFreeColGameObject$String$Class(this.getStringAttribute(SetNationTypeMessage.PLAYER_TAG), $J.cls(Player));
  }
  /**
   * Get the nationType to set.
   *
   * @param spec The {@code Specification} to look up the nationType in.
   * @return The {@code NationType}.
   */
  getValue(spec: Specification): NationType {
    return spec.getNationType(this.getStringAttribute(SetNationTypeMessage.VALUE_TAG));
  }
}

$J.define(SetNationTypeMessage, 'net.sf.freecol.common.networking.SetNationTypeMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetNationTypeMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,net.sf.freecol.common.model.NationType': '_SetNationTypeMessage$Player$NationType' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  NationOptions$Advantages = $J.load('net.sf.freecol.common.model.NationOptions$Advantages');
  Player = $J.load('net.sf.freecol.common.model.Player');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
