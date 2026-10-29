// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/ServerListMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let ServerInfo, ServerInfoMessage;

/**
 * The message sent to query and list the available servers.
 */
export class ServerListMessage extends ObjectMessage {
  static readonly TAG: string = 'serverList';
  /**
   * The list of information about the available servers.
   */
  servers: List<ServerInfo> = null;
  $init_ServerListMessage() {
    this.servers = new ArrayList();
  }
  /**
   * Create a new {@code ServerListMessage}.  Used to generate
   * a request for servers.
   */
  _ServerListMessage$(): this {
    this._ObjectMessage$String(ServerListMessage.TAG);
    this.$init_ServerListMessage();
    this.servers.clear();
    return this;
  }
  /**
   * Create a new {@code ServerListMessage} from a stream.
   *
   * @param game The {@code Game}, which is null and ignored.
   * @param xr The {@code FreeColXMLReader} to read from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _ServerListMessage$Game$FreeColXMLReader(game: Game, xr: FreeColXMLReader): this {
    this._ServerListMessage$();
    let svs = new ArrayList();
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(ServerInfo.TAG, tag)) {
        svs.add(new ServerInfoMessage()._ServerInfoMessage$String$Game$FreeColXMLReader(tag, game, xr).getServerInfo());
      } else {
        this.expected(ServerInfo.TAG, tag);
      }
    }
    xr.expectTag(ServerListMessage.TAG);
    this.addServers(svs);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  writeChildren(xw: FreeColXMLWriter): void {
    for (const $it0 = this.servers.iterator(); $it0.hasNext(); ) {
      let si = $it0.next();
      new ServerInfoMessage()._ServerInfoMessage$String$ServerInfo(ServerInfo.TAG, si).toXML(xw);
    }
  }
  /**
   * Get the server information.
   *
   * @return The list of {@code ServerInfo}.
   */
  getServers(): List<ServerInfo> {
    return this.servers;
  }
  /**
   * Add information about a server.
   *
   * @param si The {@code ServerInfo} to add.
   * @return This message.
   */
  addServer(si: ServerInfo): ServerListMessage {
    this.servers.add(si);
    return this;
  }
  /**
   * Add information about several servers.
   *
   * @param lsi The list of {@code ServerInfo} to add.
   * @return This message.
   */
  addServers(lsi: List<ServerInfo>): ServerListMessage {
    this.servers.addAll(lsi);
    return this;
  }
}

$J.define(ServerListMessage, 'net.sf.freecol.common.networking.ServerListMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_ServerListMessage$Game$FreeColXMLReader', '': '_ServerListMessage$' }, returns: { 'getServers': 'java.util.List' } });
$J.module(() => {
  ServerInfo = $J.load('net.sf.freecol.common.metaserver.ServerInfo');
  ServerInfoMessage = $J.load('net.sf.freecol.common.networking.ServerInfoMessage');
});
