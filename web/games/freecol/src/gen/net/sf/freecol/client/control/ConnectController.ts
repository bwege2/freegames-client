// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/ConnectController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, FileNotFoundException, IOException, Level, Logger } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from './FreeColClientHolder.ts';

let SwingUtilities, FreeCol, ClientOptions, ChoiceItem, Messages, FreeColSavegameFile, Game$LogoutReason, StringTemplate, CollectionUtils, Utils, FreeColServer, FreeColServer$ServerState;

/**
 * The controller responsible for starting a server and connecting to it.
 */
export class ConnectController extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * Fixed argument list for startSavedGame.
   */
  static savedKeys: List<string> = null;
  /**
   * Creates a new {@code ConnectController}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ConnectController(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    return this;
  }
  /**
   * Establish the user connection.
   *
   * @param user The player name.
   * @param host The host name to connect to.
   * @param port The host port to connect to.
   * @return Null on success, an {@code StringTemplate} error
   *     message on failure.
   */
  connect(user: string, host: string, port: number): StringTemplate {
    if (this.askServer().isConnected()) {
      return null;
    }
    let err = null;
    try {
      if (this.askServer().connect(FreeCol.CLIENT_THREAD + user, host, port) != null) {
        this.getFreeColClient().changeClientState(false);
        ConnectController.logger.info('Connected to ' + host + ':' + port + ' as ' + user);
      } else {
        ConnectController.logger.warning('Failed to connect to ' + host + ':' + port + ' as ' + user);
        err = StringTemplate.template$String('server.couldNotConnect');
      }
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let ex = $J.exc($e0);
        ConnectController.logger.log(Level.SEVERE, 'Exception when connecting to ' + host + ':' + port + ' as ' + user, ex);
        err = FreeCol.errorFromException$Exception$String(ex, 'server.couldNotConnect');
      } else {
        throw $e0;
      }
    }
    return err;
  }
  /**
   * Request that this client log out from the server.
   *
   * @param reason The reason to logout from the server.
   * @return True if the player is already logged out,
   *     or a logout request was sent.
   */
  requestLogout(reason: Game$LogoutReason): boolean {
    let fcc = this.getFreeColClient();
    let player = fcc.getMyPlayer();
    if (!fcc.isLoggedIn()) {
      return true;
    }
    if (reason === Game$LogoutReason.RECONNECT) {
      let active = this.getGUI().getActiveUnit();
      if (active != null && player.owns(active)) {
        let fcs = fcc.getFreeColServer();
        if (fcs != null) {
          fcs.getGame().setInitialActiveUnitId(active.getId());
        }
      }
    }
    ConnectController.logger.info('Logout begin for client ' + player.getName() + ': ' + $J.str(reason));
    return this.askServer().logout(player, reason);
  }
  /**
   * Complete log out of this client from the server.
   *
   * @param reason The reason to logout from the server.
   * @return True if the logout completes.
   */
  logout(reason: Game$LogoutReason): boolean {
    let fcc = this.getFreeColClient();
    let player = fcc.getMyPlayer();
    ConnectController.logger.info('Logout end for client ' + player.getName() + ': ' + $J.str(reason));
    this.askServer().disconnect();
    switch (reason) {
      case Game$LogoutReason.DEFEATED:
      case Game$LogoutReason.QUIT:
        fcc.logout(false);
        SwingUtilities.invokeLater(() => {
          this.mainTitle();
        });
        break;
      case Game$LogoutReason.LOGIN:
        fcc.logout(false);
        break;
      case Game$LogoutReason.MAIN_TITLE:
        fcc.logout(false);
        break;
      case Game$LogoutReason.NEW_GAME:
        fcc.logout(false);
        break;
      case Game$LogoutReason.RECONNECT:
      default:
        fcc.logout(false);
        SwingUtilities.invokeLater(() => {
          let name = player.getName();
          try {
            if (this.askServer().reconnect() != null && this.askServer().login(name, player.getNationId(), FreeCol.getVersion(), fcc.getSinglePlayer(), fcc.currentPlayerIsMyPlayer())) {
              ConnectController.logger.info('Reconnected for client ' + name);
            } else {
              ConnectController.logger.severe('Reconnect failed for client ' + name);
              fcc.askToQuit();
            }
          } catch ($e1) {
            if ($J.isa($e1, IOException)) {
              let ioe = $J.exc($e1);
              ConnectController.logger.log(Level.SEVERE, 'Reconnect exception for client ' + name, ioe);
              fcc.quit();
            } else {
              throw $e1;
            }
          }
        });
        break;
    }
    return true;
  }
  /**
   * Request this client log in to <i>host:port</i>.
   *
   * Public for the test suite.
   *
   * @param user The name of the player to use.
   * @param nationId The nationId when the client is selecting a player.
   * @param host The name of the machine running the {@code FreeColServer}.
   * @param port The port to use when connecting to the host.
   * @return True if the player was already logged in, or if the login
   *     message was sent.
   */
  requestLogin(user: string, nationId: string, host: string, port: number): boolean {
    let fcc = this.getFreeColClient();
    if (fcc.isLoggedIn()) {
      return true;
    }
    fcc.setMapEditor(false);
    this.askServer().disconnect();
    let err = this.connect(user, host, port);
    if (err == null) {
      ConnectController.logger.info('Login request for client ' + FreeCol.getName());
      if (this.askServer().login(user, nationId, FreeCol.getVersion(), fcc.getSinglePlayer(), fcc.currentPlayerIsMyPlayer())) {
        return true;
      }
      err = StringTemplate.template$String('server.couldNotLogin');
    }
    this.getGUI().showErrorPanel$StringTemplate(err);
    return false;
  }
  /**
   * Complete a login.
   *
   * If we are joining a running game, there is little more
   * needed to be done.  If we are restoring from saved, the
   * game should include a map and a full complement of players,
   * including ours.
   *
   * Otherwise we may still need to select a nation, and optionally
   * change game or map options (using several possible messages).
   * {@link net.sf.freecol.client.gui.panel.StartGamePanel} does
   * this.
   *
   * When all the parameters are in place and all players are
   * ready (trivially true in single player, needs checking in
   * multiplayer) the client needs to send a requestLaunch
   * message to ask the server to start the game.  That is
   * either done here or by the start game panel.
   *
   * requestLaunch effectively transfers control to
   * {@link FreeColServer#startGame}.
   *
   * @param state The state of the server.
   * @param game The new {@code Game} to attach to.
   * @param user The name of the player in the game.
   * @param single True if this is a single player game.
   * @param current True if the player is the current player.
   */
  login(state: FreeColServer$ServerState, game: Game, user: string, single: boolean, current: boolean): void {
    let fcc = this.getFreeColClient();
    let player = game.getPlayerByName(user);
    if (player == null) {
      let err = StringTemplate.template$String('server.noSuchPlayer').addName$String$String('%player%', user);
      this.getGUI().showErrorPanel$StringTemplate(err);
      ConnectController.logger.warning(Messages.message$StringTemplate(err));
      return;
    }
    fcc.login(state === FreeColServer$ServerState.IN_GAME, game, player, single);
    if (current) {
      game.setCurrentPlayer(player);
    }
    ConnectController.logger.info('Login accepted for client ' + player.getName() + ' to ' + ((fcc.isInGame()) ? 'running' : (game.allPlayersReadyToLaunch()) ? 'ready' : 'new') + ' ' + ((single) ? 'single' : 'multi') + '-player game as ' + user + '/' + player.getId());
    if (fcc.isInGame()) {
      fcc.restoreGUI(player);
      this.igc().nextModelMessage();
    } else if (this.getMap() != null && game.allPlayersReadyToLaunch()) {
      this.pgc().requestLaunch();
    } else {
      this.getGUI().showStartGamePanel(game, player, single);
    }
  }
  /**
   * Starts a new single player game by connecting to the server.
   *
   * FIXME: connect client/server directly (not using network-classes)
   *
   * @param spec The {@code Specification} for the game.
   * @return True if the game starts successfully.
   */
  startSinglePlayerGame(spec: Specification): boolean {
    let fcc = this.getFreeColClient();
    fcc.setMapEditor(false);
    if (!fcc.unblockServer(FreeCol.getServerPort())) {
      return false;
    }
    if (fcc.isLoggedIn()) {
      ConnectController.logger.warning('startSinglePlayer while logged in!');
      this.requestLogout(Game$LogoutReason.LOGIN);
    }
    let mods = this.getClientOptions().getActiveMods();
    spec.loadMods(mods);
    Messages.loadActiveModMessageBundle(mods, FreeCol.getLocale());
    let fcs = fcc.startServer$boolean$boolean$Specification$InetAddress$int(false, true, spec, null, -1);
    return (fcs == null) ? false : this.requestLogin(FreeCol.getName(), null, fcs.getHost(), fcs.getPort());
  }
  /**
   * Loads and starts a game from the given file.
   *
   * @param file The saved game.
   * @return True if the game starts successully.
   */
  startSavedGame(file: File): boolean {
    let fcc = this.getFreeColClient();
    let gui = this.getGUI();
    fcc.setMapEditor(false);
    let options = this.getClientOptions();
    let defaultSinglePlayer: boolean;
    let defaultPublicServer: boolean;
    let fis = null;
    try {
      fis = new FreeColSavegameFile()._FreeColSavegameFile(file);
    } catch ($e2) {
      if ($J.isa($e2, FileNotFoundException)) {
        let fnfe = $J.exc($e2);
        ConnectController.logger.log(Level.WARNING, 'Can not find file: ' + file.getName(), fnfe);
        gui.showErrorPanel$Exception$StringTemplate(fnfe, FreeCol.badFile('error.couldNotFind', file));
        return false;
      } else if ($J.isa($e2, IOException)) {
        let ioe = $J.exc($e2);
        ConnectController.logger.log(Level.WARNING, 'Could not load file: ' + file.getName(), ioe);
        gui.showErrorPanel$Exception$StringTemplate(ioe, FreeCol.badFile('error.couldNotLoad', file));
        return false;
      } else {
        throw $e2;
      }
    }
    options.merge$FreeColSavegameFile(fis);
    options.fixClientOptions();
    let values = null;
    try {
      values = fis.peekAttributes(ConnectController.savedKeys);
    } catch ($e3) {
      if ($J.isa($e3, Exception)) {
        let ex = $J.exc($e3);
        ConnectController.logger.log(Level.WARNING, 'Could not read from: ' + file.getName(), ex);
        gui.showErrorPanel$Exception$StringTemplate(ex, FreeCol.badFile('error.couldNotLoad', file));
        return false;
      } else {
        throw $e3;
      }
    }
    if (values != null && values.size() === ConnectController.savedKeys.size()) {
      let str = values.get(0);
      if (str != null) {
        FreeCol.setName(str);
      }
      defaultSinglePlayer = $J.parseBoolean(values.get(1));
      defaultPublicServer = $J.parseBoolean(values.get(2));
    } else {
      defaultSinglePlayer = true;
      defaultPublicServer = false;
    }
    let publicServer = defaultPublicServer;
    let singlePlayer: boolean;
    let serverName: string;
    let address: InetAddress;
    let port: number;
    let sgo = options.getInteger(ClientOptions.SHOW_SAVEGAME_SETTINGS);
    let show = sgo === ClientOptions.SHOW_SAVEGAME_SETTINGS_ALWAYS || (!defaultSinglePlayer && sgo === ClientOptions.SHOW_SAVEGAME_SETTINGS_MULTIPLAYER);
    if (show) {
      let lsi = this.getGUI().showLoadingSavegameDialog(defaultPublicServer, defaultSinglePlayer);
      if (lsi == null) {
        return false;
      }
      singlePlayer = lsi.isSinglePlayer();
      serverName = lsi.getServerName();
      address = lsi.getAddress();
      port = lsi.getPort();
    } else {
      singlePlayer = defaultSinglePlayer;
      serverName = null;
      address = null;
      port = -1;
    }
    Messages.loadActiveModMessageBundle(options.getActiveMods(), FreeCol.getLocale());
    let fcs = fcc.startServer$boolean$boolean$File$InetAddress$int$String(publicServer, singlePlayer, file, address, port, serverName);
    if (fcs == null) {
      return false;
    }
    this.getGUI().refreshGuiUsingClientOptions();
    fcc.setFreeColServer(fcs);
    fcc.setSinglePlayer(true);
    return this.requestLogin(FreeCol.getName(), null, fcs.getHost(), fcs.getPort());
  }
  /**
   * Starts a multiplayer server and connects to it.
   *
   * @param specification The {@code Specification} for the game.
   * @param publicServer Whether to make the server public.
   * @param address The address in which the server should listen for new clients.
   * @param port The port in which the server should listen for new clients.
   * @return True if the game is started successfully.
   */
  startMultiplayerGame(specification: Specification, publicServer: boolean, address: InetAddress, port: number): boolean {
    let fcc = this.getFreeColClient();
    fcc.setMapEditor(false);
    if (!fcc.unblockServer(port)) {
      return false;
    }
    if (fcc.isLoggedIn()) {
      ConnectController.logger.warning('startMultiPlayer while logged in!');
      this.requestLogout(Game$LogoutReason.LOGIN);
    }
    let fcs = fcc.startServer$boolean$boolean$Specification$InetAddress$int(publicServer, false, specification, address, port);
    if (fcs == null) {
      return false;
    }
    fcc.setFreeColServer(fcs);
    fcc.setSinglePlayer(false);
    return this.requestLogin(FreeCol.getName(), null, fcs.getHost(), fcs.getPort());
  }
  /**
   * Join an existing multiplayer game.
   *
   * @param host The name of the machine running the server.
   * @param port The port to use when connecting to the host.
   * @return True if the game starts successfully.
   */
  joinMultiplayerGame(host: string, port: number): boolean {
    let fcc = this.getFreeColClient();
    fcc.setMapEditor(false);
    if (fcc.isLoggedIn()) {
      ConnectController.logger.warning('joinMultiPlayer while logged in!');
      this.requestLogout(Game$LogoutReason.LOGIN);
    }
    let name = FreeCol.getName();
    let err = this.connect(name, host, port);
    if (err != null) {
      this.getGUI().showErrorPanel$StringTemplate(err);
      return false;
    }
    while (fcc.getServerState() == null) {
      Utils.delay(1000, null);
    }
    this.askServer().disconnect();
    let nationId = null;
    {
      let names: List<string>, tmpl: StringTemplate;
      switch (fcc.getServerState()) {
        case FreeColServer$ServerState.PRE_GAME:
        case FreeColServer$ServerState.LOAD_GAME:
          break;
        case FreeColServer$ServerState.IN_GAME:
          names = fcc.getVacantPlayerNames();
          if (names.isEmpty()) {
            return false;
          }
          if (names.contains(name)) {
            break;
          }
          tmpl = StringTemplate.template$String('client.choicePlayer');
          nationId = this.getGUI().getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function(names, CollectionUtils.alwaysTrue(), (n) => new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(StringTemplate.template$String('countryName').add$String$String('%nation%', Messages.nameKey$String(n))), n)));
          if (nationId == null) {
            return false;
          }
          break;
        case FreeColServer$ServerState.END_GAME:
        default:
          this.getGUI().showErrorPanel$StringTemplate(StringTemplate.template$String('client.ending'));
          return false;
      }
    }
    return this.requestLogin(name, nationId, host, port);
  }
  /**
   * Reset to the MainPanel.
   *
   * Called from ShowMainAction.
   */
  mainTitle(): void {
    let fcc = this.getFreeColClient();
    if ((fcc.isLoggedIn() || fcc.isMapEditor()) && !this.getGUI().confirmStopGame()) {
      return;
    }
    if (fcc.isMapEditor()) {
      fcc.setMapEditor(false);
    }
    this.getGUI().showMainTitle();
    if (fcc.isLoggedIn()) {
      this.requestLogout(Game$LogoutReason.MAIN_TITLE);
    } else {
      fcc.logout(false);
    }
    fcc.stopServer();
  }
  /**
   * Reset to the NewPanel (except in the map editor).
   */
  newGame(): void {
    let fcc = this.getFreeColClient();
    if (fcc.isLoggedIn() && !this.getGUI().confirmStopGame()) {
      return;
    }
    if (fcc.isMapEditor()) {
      fcc.getMapEditorController().newMap();
      return;
    }
    this.getGUI().removeInGameComponents();
    this.getGUI().showNewPanel$Specification(null);
    if (fcc.isLoggedIn()) {
      this.requestLogout(Game$LogoutReason.NEW_GAME);
    }
    fcc.stopServer();
  }
  static $clinit() {
    ConnectController.logger = Logger.getLogger($J.cls(ConnectController).getName());
    ConnectController.savedKeys = CollectionUtils.makeUnmodifiableList([FreeColServer.OWNER_TAG, FreeColServer.SINGLE_PLAYER_TAG, FreeColServer.PUBLIC_SERVER_TAG]);
  }
}

$J.define(ConnectController, 'net.sf.freecol.client.control.ConnectController', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_ConnectController' }, clinit: true, lazy: ['logger', 'savedKeys'] });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColSavegameFile = $J.load('net.sf.freecol.common.io.FreeColSavegameFile');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  FreeColServer = $J.load('net.sf.freecol.server.FreeColServer');
  FreeColServer$ServerState = $J.load('net.sf.freecol.server.FreeColServer$ServerState');
});
