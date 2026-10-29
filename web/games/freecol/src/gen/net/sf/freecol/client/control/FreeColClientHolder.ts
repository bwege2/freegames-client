// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/FreeColClientHolder.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * This base class provides access to a
 * {@link net.sf.freecol.client.FreeColClient} for several subclasses.
 */
export class FreeColClientHolder extends JObject {
  /**
   * The main client object.
   */
  freeColClient: FreeColClient = null;
  /**
   * Simple constructor.
   *
   * @param freeColClient The {@code FreeColClient} to hold.
   */
  _FreeColClientHolder(freeColClient: FreeColClient): this {
    this.freeColClient = freeColClient;
    return this;
  }
  /**
   * Meaningfully named access to the server API.
   *
   * @return The {@code ServerAPI}.
   */
  askServer(): ServerAPI {
    return this.freeColClient.askServer();
  }
  /**
   * Check if the current player is the client player.
   *
   * @return True if the client player is current.
   */
  currentPlayerIsMyPlayer(): boolean {
    return this.freeColClient.currentPlayerIsMyPlayer();
  }
  /**
   * Get the client options.
   *
   * @return The {@code ClientOptions} held by the client.
   */
  getClientOptions(): ClientOptions {
    return this.freeColClient.getClientOptions();
  }
  /**
   * Get the connect controller.
   *
   * @return The {@code ConnectController} held by the client.
   */
  getConnectController(): ConnectController {
    return this.freeColClient.getConnectController();
  }
  /**
   * Get the main client object.
   *
   * @return The {@code FreeColClient} held by this object.
   */
  getFreeColClient(): FreeColClient {
    return this.freeColClient;
  }
  /**
   * Get the server.
   *
   * @return The {@code FreeColServer} held by the client.
   */
  getFreeColServer(): FreeColServer {
    return this.freeColClient.getFreeColServer();
  }
  /**
   * Get the game.
   *
   * @return The {@code Game} held by the client.
   */
  getGame(): Game {
    return this.freeColClient.getGame();
  }
  /**
   * Get the Map.
   *
   * @return The game {@code Map}.
   */
  getMap(): Map_ {
    let game = this.getGame();
    return (game == null) ? null : game.getMap();
  }
  /**
   * Get the GUI.
   *
   * @return The {@code GUI} held by the client.
   */
  getGUI(): GUI {
    return this.freeColClient.getGUI();
  }
  /**
   * Get the client player.
   *
   * @return The {@code Player} associated with the client.
   */
  getMyPlayer(): Player {
    return this.freeColClient.getMyPlayer();
  }
  /**
   * Get the specification.
   *
   * @return The {@code Specification} held by the game.
   */
  getSpecification(): Specification {
    let game = this.getGame();
    return (game == null) ? null : game.getSpecification();
  }
  /**
   * Get the in-game controller.
   *
   * @return The {@code InGameController} for the client.
   */
  igc(): InGameController {
    return this.freeColClient.getInGameController();
  }
  /**
   * Get the pre-game controller.
   *
   * @return The {@code PreGameController} for the client.
   */
  pgc(): PreGameController {
    return this.freeColClient.getPreGameController();
  }
}

$J.define(FreeColClientHolder, 'net.sf.freecol.client.control.FreeColClientHolder', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient': '_FreeColClientHolder' }, returns: { 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getMyPlayer': 'net.sf.freecol.common.model.Player', 'getGUI': 'net.sf.freecol.client.gui.GUI', 'getMap': 'net.sf.freecol.common.model.Map', 'getGame': 'net.sf.freecol.common.model.Game', 'getFreeColServer': 'net.sf.freecol.server.FreeColServer', 'getFreeColClient': 'net.sf.freecol.client.FreeColClient', 'getConnectController': 'net.sf.freecol.client.control.ConnectController', 'getClientOptions': 'net.sf.freecol.client.ClientOptions' } });
