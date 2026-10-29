// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/UpdateMapGeneratorOptionsMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { ObjectMessage } from './ObjectMessage.ts';

let FreeColXMLReader$ReadScope, ChangeSet, Message$MessagePriority, OptionGroup, FreeColServer$ServerState;

/**
 * The message sent to update the map generator options.
 */
export class UpdateMapGeneratorOptionsMessage extends ObjectMessage {
  static readonly TAG: string = 'updateMapGeneratorOptions';
  /**
   * Create a new {@code UpdateMapGeneratorOptionsMessage} with the
   * supplied name.
   *
   * @param mapGeneratorOptions The map generator {@code OptionGroup}.
   */
  _UpdateMapGeneratorOptionsMessage$OptionGroup(mapGeneratorOptions: OptionGroup): this {
    this._ObjectMessage$String(UpdateMapGeneratorOptionsMessage.TAG);
    this.appendChild(mapGeneratorOptions);
    return this;
  }
  /**
   * Create a new {@code UpdateMapGeneratorOptionsMessage} from a stream.
   *
   * @param game The {@code Game} this message belongs to.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _UpdateMapGeneratorOptionsMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._UpdateMapGeneratorOptionsMessage$OptionGroup(null);
    let rs = xr.replaceScope(FreeColXMLReader$ReadScope.NOINTERN);
    let optionGroup = null;
    try {
      while (xr.moreTags()) {
        let tag = xr.getLocalName();
        if ($J.equals(OptionGroup.TAG, tag)) {
          if (optionGroup == null) {
            optionGroup = xr.readFreeColObject$Game$Class(game, $J.cls(OptionGroup));
          } else {
            this.expected(UpdateMapGeneratorOptionsMessage.TAG, tag);
          }
        } else {
          this.expected(OptionGroup.TAG, tag);
        }
        xr.expectTag(tag);
      }
      xr.expectTag(UpdateMapGeneratorOptionsMessage.TAG);
    } finally {
      xr.replaceScope(rs);
    }
    this.appendChild(optionGroup);
    return this;
  }
  /**
   * Get the associated option group.
   *
   * @return The options.
   */
  getMapGeneratorOptions(): OptionGroup {
    return this.getChild(0, $J.cls(OptionGroup));
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
    let mapOptions = this.getMapGeneratorOptions();
    if (freeColClient.isInGame()) {
    } else {
      this.pgc$FreeColClient(freeColClient).updateMapGeneratorOptionsHandler(mapOptions);
    }
  }
  /**
   * {@inheritDoc}
   */
  serverHandler(freeColServer: FreeColServer, serverPlayer: ServerPlayer): ChangeSet {
    if (serverPlayer == null) {
      return ChangeSet.clientError$See$String(null, 'Missing serverPlayer');
    } else if (!serverPlayer.isAdmin()) {
      return serverPlayer.clientError$String('Not an admin: ' + $J.str(serverPlayer));
    } else if (freeColServer.getServerState() !== FreeColServer$ServerState.PRE_GAME) {
      return serverPlayer.clientError$String('Can not change map generator options, server state = ' + $J.str(freeColServer.getServerState()));
    }
    let mapOptions = this.getMapGeneratorOptions();
    if (mapOptions == null) {
      return serverPlayer.clientError$String('No map generator options to merge');
    }
    return this.pgc$FreeColServer(freeColServer).updateMapGeneratorOptions(serverPlayer, mapOptions);
  }
}

$J.define(UpdateMapGeneratorOptionsMessage, 'net.sf.freecol.common.networking.UpdateMapGeneratorOptionsMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_UpdateMapGeneratorOptionsMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.option.OptionGroup': '_UpdateMapGeneratorOptionsMessage$OptionGroup' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getMapGeneratorOptions': 'net.sf.freecol.common.option.OptionGroup' } });
$J.module(() => {
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  OptionGroup = $J.load('net.sf.freecol.common.option.OptionGroup');
  FreeColServer$ServerState = $J.load('net.sf.freecol.server.FreeColServer$ServerState');
});
