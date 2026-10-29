// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/SetAvailableMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let NationOptions$NationState, Message, Message$MessagePriority;

/**
 * The message that changes the player availability.
 */
export class SetAvailableMessage extends AttributeMessage {
  static readonly TAG: string = 'setAvailable';
  static readonly NATION_TAG: string = 'nation';
  static readonly STATE_TAG: string = 'state';
  /**
   * Create a new {@code SetAvailableMessage}.
   *
   * @param nation The {@code Nation} to make available.
   * @param state The {@code NationState} for that nation.
   */
  _SetAvailableMessage$Nation$NationState(nation: Nation, state: NationOptions$NationState): this {
    this._AttributeMessage$String$StringArr(SetAvailableMessage.TAG, [SetAvailableMessage.NATION_TAG, nation.getId(), SetAvailableMessage.STATE_TAG, state.toString()]);
    return this;
  }
  /**
   * Create a new {@code SetAvailableMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to (null here).
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if the stream is corrupt.
   */
  _SetAvailableMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(SetAvailableMessage.TAG, xr, [SetAvailableMessage.NATION_TAG, SetAvailableMessage.STATE_TAG]);
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
    let spec = game.getSpecification();
    let nation = this.getNation(spec);
    let nationState = this.getNationState();
    this.pgc$FreeColClient(freeColClient).setAvailableHandler(nation, nationState);
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      Message.logger.warning('setAvailable from unknown player');
    }
    let game = freeColServer.getGame();
    let spec = game.getSpecification();
    let nation = this.getNation(spec);
    let state = this.getNationState();
    return this.pgc$FreeColServer(freeColServer).setAvailable(serverPlayer, nation, state);
  }
  /**
   * Get the nation whose availability is changing.
   *
   * @param spec The {@code Specification} to look up the nation in.
   * @return The {@code Nation} found.
   */
  getNation(spec: Specification): Nation {
    return spec.getNation(this.getStringAttribute(SetAvailableMessage.NATION_TAG));
  }
  /**
   * Get the new nation availabiility.
   *
   * @return The new {@code NationState}.
   */
  getNationState(): NationOptions$NationState {
    return $J.enumValueOf($J.cls(NationOptions$NationState), this.getStringAttribute(SetAvailableMessage.STATE_TAG));
  }
}

$J.define(SetAvailableMessage, 'net.sf.freecol.common.networking.SetAvailableMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_SetAvailableMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Nation,net.sf.freecol.common.model.NationOptions$NationState': '_SetAvailableMessage$Nation$NationState' }, returns: { 'getNationState': 'net.sf.freecol.common.model.NationOptions$NationState', 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority' } });
$J.module(() => {
  NationOptions$NationState = $J.load('net.sf.freecol.common.model.NationOptions$NationState');
  Message = $J.load('net.sf.freecol.common.networking.Message');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
});
