// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/LoadingSavegameInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * Used for transferring data for the savegame to be loaded.
 */
export class LoadingSavegameInfo extends JObject {
  singlePlayer: boolean = false;
  address: InetAddress = null;
  port: number = 0;
  serverName: string = null;
  publicServer: boolean = false;
  _LoadingSavegameInfo(singlePlayer: boolean, address: InetAddress, port: number, serverName: string, publicServer: boolean): this {
    this.singlePlayer = singlePlayer;
    this.address = address;
    this.port = port;
    this.serverName = serverName;
    this.publicServer = publicServer;
    return this;
  }
  /**
   * Is a single player game selected?
   *
   * @return True if single player is selected.
   */
  isSinglePlayer(): boolean {
    return this.singlePlayer;
  }
  /**
   * Get the selected address;
   *
   * @return The {@code InetAddress}.
   */
  getAddress(): InetAddress {
    return this.address;
  }
  /**
   * Get the selected port number.
   *
   * @return The port number.
   */
  getPort(): number {
    return this.port;
  }
  /**
   * Get the specified server name.
   *
   * @return The server name.
   */
  getServerName(): string {
    return this.serverName;
  }
  /**
   * Is this a public server?
   *
   * @return True if this is a public server.
   */
  isPublicServer(): boolean {
    return this.publicServer;
  }
}

$J.define(LoadingSavegameInfo, 'net.sf.freecol.client.gui.LoadingSavegameInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { 'boolean,java.net.InetAddress,int,java.lang.String,boolean': '_LoadingSavegameInfo' }, returns: { 'isPublicServer': 'boolean', 'getServerName': 'java.lang.String', 'getPort': 'int', 'getAddress': 'java.net.InetAddress', 'isSinglePlayer': 'boolean' } });
