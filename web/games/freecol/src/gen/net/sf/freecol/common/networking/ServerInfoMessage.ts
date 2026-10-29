// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ServerInfoMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ServerInfo;

/**
 * The type of message that contains server information.
 */
export class ServerInfoMessage extends AttributeMessage {
  static readonly ADDRESS_TAG: string = 'address';
  static readonly CURRENTLY_PLAYING_TAG: string = 'currentlyPlaying';
  static readonly GAME_STATE_TAG: string = 'gameState';
  static readonly IS_GAME_STARTED_TAG: string = 'isGameStarted';
  static readonly NAME_TAG: string = 'name';
  static readonly PORT_TAG: string = 'port';
  static readonly SLOTS_AVAILABLE_TAG: string = 'slotsAvailable';
  static readonly VERSION_TAG: string = 'version';
  /**
   * Create a new {@code ServerInfoMessage}.
   *
   * @param tag The tag for this message.
   * @param si The {@code ServerInfo} to encapsulate.
   */
  _ServerInfoMessage$String$ServerInfo(tag: string, si: ServerInfo): this {
    this._AttributeMessage$String$StringArr(tag, [ServerInfoMessage.NAME_TAG, si.getName(), ServerInfoMessage.ADDRESS_TAG, si.getAddress(), ServerInfoMessage.PORT_TAG, String(si.getPort()), ServerInfoMessage.SLOTS_AVAILABLE_TAG, String(si.getSlotsAvailable()), ServerInfoMessage.CURRENTLY_PLAYING_TAG, String(si.getCurrentlyPlaying()), ServerInfoMessage.IS_GAME_STARTED_TAG, String(si.getIsGameStarted()), ServerInfoMessage.VERSION_TAG, si.getVersion(), ServerInfoMessage.GAME_STATE_TAG, String(si.getGameState())]);
    return this;
  }
  /**
   * Create a new {@code ServerInfoMessage} from a stream.
   *
   * @param tag The actual message tag.
   * @param game The {@code Game}, which is null and ignored.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ServerInfoMessage$String$Game$FreeColXMLReader(tag: string, game: Game, xr: FreeColXMLReader): this {
    this._AttributeMessage$String$FreeColXMLReader$StringArr(tag, xr, [ServerInfoMessage.NAME_TAG, ServerInfoMessage.ADDRESS_TAG, ServerInfoMessage.PORT_TAG, ServerInfoMessage.SLOTS_AVAILABLE_TAG, ServerInfoMessage.CURRENTLY_PLAYING_TAG, ServerInfoMessage.IS_GAME_STARTED_TAG, ServerInfoMessage.VERSION_TAG, ServerInfoMessage.GAME_STATE_TAG]);
    return this;
  }
  /**
   * Get the server information encapsulated in this message.
   *
   * @return The {@code ServerInfo} found.
   */
  getServerInfo(): ServerInfo {
    return new ServerInfo()._ServerInfo(this.getStringAttribute(ServerInfoMessage.NAME_TAG), this.getStringAttribute(ServerInfoMessage.ADDRESS_TAG), this.getIntegerAttribute(ServerInfoMessage.PORT_TAG, -1), this.getIntegerAttribute(ServerInfoMessage.SLOTS_AVAILABLE_TAG, -1), this.getIntegerAttribute(ServerInfoMessage.CURRENTLY_PLAYING_TAG, -1), this.getBooleanAttribute(ServerInfoMessage.IS_GAME_STARTED_TAG, false), this.getStringAttribute(ServerInfoMessage.VERSION_TAG), this.getIntegerAttribute(ServerInfoMessage.GAME_STATE_TAG, -1));
  }
  /**
   * Get the address.
   *
   * @return The address attribute.
   */
  getAddress(): string {
    return this.getStringAttribute(ServerInfoMessage.ADDRESS_TAG);
  }
  /**
   * Override the address attribute.
   *
   * @param address The new address.
   */
  setAddress(address: string): void {
    this.setStringAttribute(ServerInfoMessage.ADDRESS_TAG, address);
  }
  /**
   * Get the port.
   *
   * @return The port attribute.
   */
  getPort(): number {
    return this.getIntegerAttribute(ServerInfoMessage.PORT_TAG, -1);
  }
}

$J.define(ServerInfoMessage, 'net.sf.freecol.common.networking.ServerInfoMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.AttributeMessage', ctors: { 'java.lang.String,net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ServerInfoMessage$String$Game$FreeColXMLReader', 'java.lang.String,net.sf.freecol.common.metaserver.ServerInfo': '_ServerInfoMessage$String$ServerInfo' }, returns: { 'getPort': 'int', 'getAddress': 'java.lang.String', 'getServerInfo': 'net.sf.freecol.common.metaserver.ServerInfo' } });
$J.module(() => {
  ServerInfo = $J.load('net.sf.freecol.common.metaserver.ServerInfo');
});
