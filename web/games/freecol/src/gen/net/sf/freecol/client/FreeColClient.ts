// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/FreeColClient.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Exception, FileNotFoundException, IOException, JError, JObject, Level, Logger, Runtime, Thread, Throwable, XMLStreamException } from '../../../../../jre/index.ts';

let SwingUtilities, FreeCol, ClientOptions, ClientInputHandler, ConnectController, InGameController, MapEditorController, PreGameController, SoundController, GUI, SwingGUI, ActionManager, UserServerAPI, FreeColDebugger, Messages, FreeColDataFile, FreeColDirectories, FreeColSavegameFile, FreeColTcFile, Game$LogoutReason, Player$PlayerType, StringTemplate, ImageResource, ResourceManager, FreeColServer, FreeColServer$ServerState;

/**
 * The main control class for the FreeCol client.  This class both
 * starts and keeps references to the GUI and the control objects.
 */
export class FreeColClient extends JObject {
  static logger: Logger = null;
  memoryToBeFreedOnOutOfMemory: number[] = null;
  connectController: ConnectController = null;
  preGameController: PreGameController = null;
  inGameController: InGameController = null;
  inputHandler: ClientInputHandler = null;
  mapEditorController: MapEditorController = null;
  soundController: SoundController = null;
  /**
   * The server that has been started from the client-GUI.
   */
  freeColServer: FreeColServer = null;
  /**
   * Encapsulation of the server API.
   */
  serverAPI: ServerAPI = null;
  /**
   * The GUI encapsulation.
   */
  gui: GUI = null;
  /**
   * The encapsulation of the actions.
   */
  actionManager: ActionManager = null;
  /**
   * The game itself.
   */
  game: Game = null;
  /**
   * The player that `owns' this client.
   */
  player: Player = null;
  /**
   * The client options specific to this player.
   */
  clientOptions: ClientOptions = null;
  /**
   * Indicates if the game has started, has nothing to do with
   * whether or not the client is logged in.
   */
  inGame: boolean = false;
  /**
   * Are we using the map editor?
   */
  mapEditor: boolean = false;
  /**
   * Is this a single player game?
   */
  singlePlayer: boolean = false;
  /**
   * Indicated whether or not there is an open connection to the
   * server. This is not an indication of the existence of a
   * Connection Object, but instead it is an indication of an
   * approved login to a server.
   */
  loggedIn: boolean = false;
  /**
   * Cached value of server state.
   */
  cachedServerState: FreeColServer$ServerState = null;
  /**
   * Cached list of vacant players.
   */
  cachedVacantPlayerNames: List<string> = null;
  /**
   * Creates a new {@code FreeColClient}.  Creates the control
   * objects.
   *
   * @param splashScreen An optional splash screen to display.
   * @param fontName An optional override of the main font.
   * @param windowSize An optional window size.
   * @param userMsg An optional message key to be displayed early.
   * @param sound True if sounds should be played
   * @param showOpeningVideo Display the opening video.
   * @param savedGame An optional saved game.
   * @param spec If non-null, a {@code Specification} to use to start
   *     a new game immediately.
   */
  _FreeColClient(splashScreen: SplashScreen, fontName: string, windowSize: Dimension, userMsg: string, sound: boolean, showOpeningVideo: boolean, savedGame: File, spec: Specification): this {
    this.memoryToBeFreedOnOutOfMemory = $J.newArray(Math.imul(Math.imul(10, 1024), 1024), 0);
    this.freeColServer = null;
    this.inGame = false;
    this.loggedIn = false;
    this.cachedServerState = null;
    this.cachedVacantPlayerNames = new ArrayList();
    let quitName = FreeCol.CLIENT_THREAD + 'Quit Game';
    Runtime.getRuntime().addShutdownHook(new (FreeColClient$1())().$o(this)._Thread(quitName));
    if (FreeCol.getHeadless() && savedGame == null && spec == null) {
      FreeCol.fatal$Logger$String(FreeColClient.logger, Messages.message$String('client.headlessRequires'));
    }
    this.mapEditor = false;
    let baseDirectory = FreeColDirectories.getBaseDirectory();
    let baseData = null;
    let ioeMessage = null;
    if (baseDirectory.exists() && baseDirectory.isDirectory()) {
      try {
        baseData = new FreeColDataFile()._FreeColDataFile(baseDirectory);
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let ioe = $J.exc($e0);
          ioeMessage = ioe.getMessage();
        } else {
          throw $e0;
        }
      }
    }
    if (baseData == null) {
      FreeCol.fatal$Logger$String(FreeColClient.logger, Messages.message$StringTemplate(StringTemplate.template$String('client.baseData').addName$String$String('%dir%', baseDirectory.getName())) + ((ioeMessage == null) ? '' : '\n' + ioeMessage));
    }
    this.serverAPI = new UserServerAPI()._UserServerAPI();
    this.connectController = new ConnectController()._ConnectController(this);
    this.preGameController = new PreGameController()._PreGameController(this);
    this.inGameController = new InGameController()._InGameController(this);
    this.mapEditorController = new MapEditorController()._MapEditorController(this);
    this.inputHandler = new ClientInputHandler()._ClientInputHandler(this);
    this.setMessageHandler(this.inputHandler);
    ResourceManager.setBaseData(baseData);
    let tcData = FreeColTcFile.getFreeColTcFile(FreeCol.getTc());
    ResourceManager.setTcData(tcData);
    this.actionManager = new ActionManager()._ActionManager(this);
    this.actionManager.initializeActions(this.inGameController, this.connectController);
    this.clientOptions = this.loadClientOptions(savedGame);
    this.clientOptions.fixClientOptions();
    ResourceManager.setMods(this.clientOptions.getActiveMods());
    if (this.clientOptions.getRange(ClientOptions.GRAPHICS_QUALITY) === ClientOptions.GRAPHICS_QUALITY_LOWEST) {
      ImageResource.forceLowestQuality(true);
    }
    this.gui = (FreeCol.getHeadless()) ? new GUI()._GUI(this) : new SwingGUI()._SwingGUI(this);
    if (!FreeCol.getHeadless()) {
      try {
        this.gui.installLookAndFeel(fontName);
      } catch ($e1) {
        if ($J.isa($e1, Exception)) {
          let e = $J.exc($e1);
          FreeCol.fatal$Logger$String(FreeColClient.logger, Messages.message$String('client.laf') + '\n' + e.getMessage());
        } else {
          throw $e1;
        }
      }
    }
    this.soundController = new SoundController()._SoundController(this, sound);
    this.overrideDefaultUncaughtExceptionHandler();
    ResourceManager.startPreloading(() => {
      SwingUtilities.invokeLater(() => {
        if (splashScreen != null) {
          splashScreen.setVisible(false);
          splashScreen.dispose();
        }
        this.gui.startGUI(windowSize);
        if (this.actionManager != null) {
          this.updateActions();
        }
        this.startFirstTaskInGui(userMsg, showOpeningVideo, savedGame, spec);
      });
    });
    return this;
  }
  startFirstTaskInGui(userMsg: string, showOpeningVideo: boolean, savedGame: File, spec: Specification): void {
    SwingUtilities.invokeLater(() => {
      if (savedGame != null) {
        this.gui.showStatusPanel(Messages.message$String('status.loadingGame'));
        SwingUtilities.invokeLater(() => {
          if (this.connectController.startSavedGame(savedGame)) {
            this.gui.closeStatusPanel();
            if (userMsg != null) {
              this.gui.showInformationPanel$String(userMsg);
            }
          } else {
            this.gui.playSound('sound.intro.general');
            this.gui.closeStatusPanel();
            this.gui.showMainPanel(userMsg);
          }
        });
      } else if (spec != null) {
        this.gui.playSound('sound.intro.general');
        if (!this.connectController.startSinglePlayerGame(spec)) {
          this.gui.showMainPanel(userMsg);
        }
      } else if (showOpeningVideo) {
        this.gui.showOpeningVideo(userMsg, () => {
          this.gui.playSound('sound.intro.general');
          this.gui.showMainPanel(userMsg);
        });
      } else {
        this.gui.playSound('sound.intro.general');
        this.gui.showMainPanel(userMsg);
      }
    });
  }
  /**
   * Loads the client options.
   * There are several sources:
   *   1) Base options (data/base/client-options.xml)
   *   2) Standard action manager actions
   *   3) Saved game
   *   4) User options
   *
   * The base and action manager options are definitive, so they can
   * just be added/loaded.  The others are from sources that may be
   * out of date (i.e. options can be in the wrong group, or no longer
   * exist), so they must be merged cautiously.
   *
   * @param savedGameFile An optional saved game {@code File}
   *     to load options from.
   * @return The loaded {@code ClientOptions}.
   */
  loadClientOptions(savedGameFile: File): ClientOptions {
    let clop = new ClientOptions()._ClientOptions();
    FreeColClient.logger.info('Load default client options.');
    clop.load$File(FreeColDirectories.getBaseClientOptionsFile());
    if (this.actionManager != null) {
      FreeColClient.logger.info('Load client options from the action manager.');
      clop.add(this.actionManager);
    }
    if (savedGameFile != null) {
      try {
        let fcsf = new FreeColSavegameFile()._FreeColSavegameFile(savedGameFile);
        FreeColClient.logger.info('Merge client options from saved game: ' + savedGameFile.getPath());
        clop.merge$FreeColSavegameFile(fcsf);
      } catch ($e2) {
        if ($J.isa($e2, IOException)) {
          let ioe = $J.exc($e2);
          FreeColClient.logger.log(Level.WARNING, 'Could not open saved game ' + savedGameFile.getPath(), ioe);
        } else {
          throw $e2;
        }
      }
    }
    let userOptions = FreeColDirectories.getClientOptionsFile();
    if (userOptions != null && userOptions.exists()) {
      FreeColClient.logger.info('Merge client options from user options file: ' + userOptions.getPath());
      clop.load$File(userOptions);
    }
    return clop;
  }
  /**
   * Gets the controller responsible for starting a server and
   * connecting to it.
   *
   * @return The {@code ConnectController}.
   */
  getConnectController(): ConnectController {
    return this.connectController;
  }
  /**
   * Gets the controller that will be used before the game has been started.
   *
   * @return The {@code PreGameController}.
   */
  getPreGameController(): PreGameController {
    return this.preGameController;
  }
  /**
   * Gets the controller that will be used when the game has been started.
   *
   * @return The {@code InGameController}.
   */
  getInGameController(): InGameController {
    return this.inGameController;
  }
  /**
   * Gets the controller for the map editor, if we are in the map editor.
   *
   * @return The map editor controller, if any.
   */
  getMapEditorController(): MapEditorController {
    return this.mapEditorController;
  }
  /**
   * Gets the controller for the sound.
   *
   * @return The sound controller, if any.
   */
  getSoundController(): SoundController {
    return this.soundController;
  }
  /**
   * Gets the {@code FreeColServer} started by the client.
   *
   * @return The {@code FreeColServer} or {@code null} if no
   *     server has been started.
   */
  getFreeColServer(): FreeColServer {
    return this.freeColServer;
  }
  /**
   * Sets the {@code FreeColServer} which has been started by the
   * client gui.
   *
   * @param freeColServer The {@code FreeColServer}.
   * @see #getFreeColServer()
   */
  setFreeColServer(freeColServer: FreeColServer): void {
    this.freeColServer = freeColServer;
  }
  /**
   * Meaningfully named access to the ServerAPI.
   *
   * @return The user wrapper for the {@code ServerAPI}.
   */
  askServer(): ServerAPI {
    return this.serverAPI;
  }
  /**
   * Gets the GUI attached to this client.
   *
   * @return The current {@code GUI}.
   */
  getGUI(): GUI {
    return this.gui;
  }
  /**
   * Gets the action manager.
   *
   * @return The action manager.
   */
  getActionManager(): ActionManager {
    return this.actionManager;
  }
  /**
   * Gets the {@code Game} that we are currently playing.
   *
   * @return The current {@code Game}.
   * @see #setGame
   */
  getGame(): Game {
    return this.game;
  }
  /**
   * Sets the {@code Game} that we are currently playing.
   *
   * @param game The new {@code Game}.
   * @see #getGame
   */
  setGame(game: Game): void {
    this.game = game;
  }
  /**
   * Gets the {@code Player} that uses this client.
   *
   * @return The {@code Player} made to represent this clients user.
   * @see #setMyPlayer(Player)
   */
  getMyPlayer(): Player {
    return this.player;
  }
  /**
   * Sets the {@code Player} that uses this client.
   *
   * @param player The {@code Player} made to represent this clients
   *            user.
   * @see #getMyPlayer()
   */
  setMyPlayer(player: Player): void {
    this.player = player;
  }
  /**
   * Gets the object keeping the current client options.
   *
   * @return The {@code ClientOptions} attached to this
   *     {@code FreeColClient}.
   */
  getClientOptions(): ClientOptions {
    return this.clientOptions;
  }
  /**
   * Toggle the value of a boolean client option.
   *
   * @param op The name of the option to toggle.
   */
  toggleClientOption(op: string): void {
    let value = this.clientOptions.getBoolean(op);
    this.clientOptions.setBoolean(op, !value);
  }
  /**
   * Convenience accessor for checking whether to display tutorial messages.
   *
   * @return True if tutorial messages should be displayed.
   */
  tutorialMode(): boolean {
    return this.getClientOptions().getBoolean('model.option.guiShowTutorial');
  }
  /**
   * Has the game started?
   *
   * @return True if the game has started.
   */
  isInGame(): boolean {
    return this.inGame;
  }
  /**
   * Change the client in-game state (either in or pre-game).
   *
   * @param inGame If true, change to in-game state.
   */
  changeClientState(inGame: boolean): void {
    this.inGame = inGame;
  }
  /**
   * Is the client ready to switch to in-game mode?
   *
   * @return True if in pre-game mode, the game is present, and it has a map.
   */
  isReadyToStart(): boolean {
    if (this.isInGame()) {
      return false;
    }
    let game = this.getGame();
    return (game == null) ? false : game.getMap() != null;
  }
  /**
   * Are we using the map editor?
   *
   * @return True if the map editor is enabled.
   */
  isMapEditor(): boolean {
    return this.mapEditor;
  }
  /**
   * Sets the map editor state.
   *
   * @param mapEditor True if the map editor is enabled.
   */
  setMapEditor(mapEditor: boolean): void {
    this.mapEditor = mapEditor;
  }
  /**
   * Is the user playing in single player mode?
   *
   * @return True if the user is playing in single player mode.
   * @see #setSinglePlayer
   */
  getSinglePlayer(): boolean {
    return this.singlePlayer;
  }
  /**
   * Sets whether or not this game is a single player game.
   *
   * @param singlePlayer Whether or not this game is a single player game.
   */
  setSinglePlayer(singlePlayer: boolean): void {
    this.singlePlayer = singlePlayer;
  }
  /**
   * Is this client logged in to a server?
   *
   * @return True if this client is logged in to a server.
   */
  isLoggedIn(): boolean {
    return this.loggedIn;
  }
  /**
   * Get the server state, or at least our most recently cached value.
   *
   * @return A server state.
   */
  getServerState(): FreeColServer$ServerState {
    return (this.freeColServer == null) ? this.cachedServerState : this.freeColServer.getServerState();
  }
  /**
   * Set the cached server state.
   *
   * @param state The new {@code ServerState}.
   */
  setServerState(state: FreeColServer$ServerState): void {
    this.cachedServerState = state;
  }
  /**
   * Get the cached list of vacant player names.
   *
   * @return A list of available player names.
   */
  getVacantPlayerNames(): List<string> {
    return this.cachedVacantPlayerNames;
  }
  /**
   * Set the cached list of vacant player names.
   *
   * @param names The new vacant player names.
   */
  setVacantPlayerNames(names: List<string>): void {
    this.cachedVacantPlayerNames.clear();
    this.cachedVacantPlayerNames.addAll(names);
  }
  /**
   * Set a message handler to handle messages from the server.
   * Used when switching from pre-game to in-game.
   *
   * @param messageHandler The new {@code MessageHandler}.
   */
  setMessageHandler(messageHandler: MessageHandler): void {
    this.askServer().setMessageHandler(messageHandler);
  }
  /**
   * Updates the game actions.  Generally useful when menu actions
   * should change due to the current game context.
   */
  updateActions(): void {
    this.actionManager.update();
  }
  /**
   * Sets the actions derived from the specification.
   *
   * @param specification The {@code Specification} to use.
   */
  addSpecificationActions(specification: Specification): void {
    SwingUtilities.invokeLater(() => {
      this.actionManager.addSpecificationActions(specification);
      SwingUtilities.invokeLater(() => {
        this.getGUI().resetMenuBar();
        this.getGUI().resetMapControls();
      });
    });
  }
  /**
   * Checks if this client is the game admin.
   *
   * @return True if the client is the game admin and the game has begun.
   */
  isAdmin(): boolean {
    return this.player != null && this.player.isAdmin();
  }
  /**
   * Verifies if this client can save the current game
   *
   * Clients that do not have the server running, or that have not
   * the required permissions cannot save and should have the menu
   * entry disabled
   *
   * @return True if this client can save the game in progress.
   */
  canSaveCurrentGame(): boolean {
    return this.freeColServer != null && (this.isAdmin() || this.freeColServer.getServerState() !== FreeColServer$ServerState.IN_GAME);
  }
  /**
   * Is the current player the client owner player?
   *
   * @return True if the current player is owned by this client.
   */
  currentPlayerIsMyPlayer(): boolean {
    return this.game != null && this.isInGame() && this.player != null && this.player.equals(this.game.getCurrentPlayer());
  }
  /**
   * Common utility routine to retrieve animation speed.
   *
   * @param player The {@code Player} to be animated.
   * @return The animation speed.
   */
  getAnimationSpeed(player: Player): number {
    let key = (this.getMyPlayer() === player) ? ClientOptions.MOVE_ANIMATION_SPEED : (this.getMyPlayer().isPotentialFriend(player)) ? ClientOptions.ENEMY_MOVE_ANIMATION_SPEED : ClientOptions.FRIENDLY_MOVE_ANIMATION_SPEED;
    return this.getClientOptions().getInteger(key);
  }
  /**
   * Set up the GUI after the game starts or a player reconnects.
   *
   * @param player The client {@code Player}.
   */
  restoreGUI(player: Player): void {
    let u = player.restoreActiveUnit();
    this.getGUI().reconnectGUI((u != null && player.owns(u)) ? u : null, player.getFallbackTile());
  }
  /**
   * Fail to start a server due to an exception.  Complain and fail back
   * to the main panel.
   *
   * @param ex The {@code Exception} that causes the trouble.
   * @param template A {@code StringTemplate} with the error message.
   * @return Null.
   */
  failToMain$Exception$StringTemplate$FreeColClient(ex: Exception, template: StringTemplate): FreeColServer {
    if (FreeCol.getHeadless() || FreeColDebugger.getDebugRunTurns() >= 0) {
      let t = FreeCol.errorFromException$Exception$StringTemplate(ex, template);
      let msg = Messages.message$StringTemplate(t);
      FreeCol.fatal$Logger$String(null, msg);
    } else {
      this.getGUI().showErrorPanel$Exception$StringTemplate(ex, template);
    }
    return null;
  }
  /**
   * Fail to start a server due to an exception.  Complain and fail back
   * to the main panel.
   *
   * @param ex The {@code Exception} that causes the trouble.
   * @param key A message key with the error.
   * @return Null.
   */
  failToMain$Exception$String$FreeColClient(ex: Exception, key: string): FreeColServer {
    return this.failToMain$Exception$StringTemplate$FreeColClient(ex, StringTemplate.template$String(key));
  }
  /**
   * Shut down an existing server on a given port.
   *
   * @param port The port to unblock.
   * @return True if there should be no blocking server remaining.
   */
  unblockServer(port: number): boolean {
    let freeColServer = this.getFreeColServer();
    if (freeColServer != null) {
      if (!this.getGUI().confirm$String$String$String('stopServer.text', 'stopServer.yes', 'stopServer.no')) {
        return false;
      }
      this.stopServer();
    }
    return true;
  }
  /**
   * Stop a server if present.
   *
   * Public for FreeColClient.quit and showMain.
   */
  stopServer(): void {
    let freeColServer = this.getFreeColServer();
    if (freeColServer != null) {
      freeColServer.getController().shutdown();
      this.setFreeColServer(null);
    }
  }
  /**
   * Start a server.
   *
   * @param publicServer If true, add to the meta-server.
   * @param singlePlayer True if this is a single player game.
   * @param spec The {@code Specification} to use in this game.
   * @param address The address to use for the public socket.
   * @param port The TCP port to use for the public socket. If null, try
   *      ports until 
   * @return A new {@code FreeColServer} or null on error.
   */
  startServer$boolean$boolean$Specification$InetAddress$int(publicServer: boolean, singlePlayer: boolean, spec: Specification, address: InetAddress, port: number): FreeColServer {
    let fcs: FreeColServer;
    try {
      fcs = new FreeColServer()._FreeColServer$boolean$boolean$Specification$InetAddress$int$String(publicServer, singlePlayer, spec, address, port, null);
      if (!fcs.registerWithMetaServer()) {
        fcs.shutdown();
        return this.failToMain$Exception$String$FreeColClient(null, 'server.noRouteToServer');
      }
    } catch ($e3) {
      if ($J.isa($e3, IOException)) {
        let ioe = $J.exc($e3);
        return this.failToMain$Exception$String$FreeColClient(ioe, 'server.initialize');
      } else {
        throw $e3;
      }
    }
    this.setFreeColServer(fcs);
    this.setSinglePlayer(singlePlayer);
    return fcs;
  }
  /**
   * Start a server with a saved game.
   *
   * @param publicServer If true, add to the meta-server.
   * @param singlePlayer True if this is a single player game.
   * @param saveFile The saved game {@code File}.
   * @param address The TCP address to use for the public socket.
   * @param port The TCP port to use for the public socket.
   * @param name An optional name for the server.
   * @return A new {@code FreeColServer}, or null on error.
   */
  startServer$boolean$boolean$File$InetAddress$int$String(publicServer: boolean, singlePlayer: boolean, saveFile: File, address: InetAddress, port: number, name: string): FreeColServer {
    let fsg: FreeColSavegameFile;
    try {
      fsg = new FreeColSavegameFile()._FreeColSavegameFile(saveFile);
    } catch ($e4) {
      if ($J.isa($e4, FileNotFoundException)) {
        let fnfe = $J.exc($e4);
        return this.failToMain$Exception$StringTemplate$FreeColClient(fnfe, FreeCol.badFile('error.couldNotFind', saveFile));
      } else if ($J.isa($e4, IOException)) {
        let ioe = $J.exc($e4);
        return this.failToMain$Exception$String$FreeColClient(ioe, 'server.initialize');
      } else {
        throw $e4;
      }
    }
    let fcs: FreeColServer;
    try {
      fcs = new FreeColServer()._FreeColServer$FreeColSavegameFile$Specification$InetAddress$int$String(fsg, null, address, port, name);
      fcs.setPublicServer(publicServer);
      if (!fcs.registerWithMetaServer()) {
        return this.failToMain$Exception$String$FreeColClient(null, 'server.noRouteToServer');
      }
    } catch ($e5) {
      if ($J.isa($e5, XMLStreamException)) {
        let xse = $J.exc($e5);
        return this.failToMain$Exception$StringTemplate$FreeColClient(xse, FreeCol.badFile('error.couldNotLoad', saveFile));
      } else if ($J.isa($e5, Exception)) {
        let ex = $J.exc($e5);
        return this.failToMain$Exception$String$FreeColClient(ex, 'server.initialize');
      } else {
        throw $e5;
      }
    }
    this.setFreeColServer(fcs);
    this.setSinglePlayer(singlePlayer);
    this.inGameController.setGameConnected();
    ResourceManager.setSavegameFile(fsg);
    return fcs;
  }
  /**
   * Log in to a new game.
   *
   * Called when the ConnectController processes a login.
   *
   * @param inGame Whether the server is in-game.
   * @param game The new {@code Game}.
   * @param player The new client {@code Player}.
   * @param single True if this is a single player game.
   */
  login(inGame: boolean, game: Game, player: Player, single: boolean): void {
    this.loggedIn = true;
    this.changeClientState(inGame);
    this.setGame(game);
    this.setMyPlayer(player);
    this.setSinglePlayer(single);
    this.addSpecificationActions(game.getSpecification());
    if (player != null) {
      let co = this.getClientOptions();
      player.setColonyComparator(co.getColonyComparator());
    }
  }
  /**
   * Log this client out.
   *
   * Called when the ConnectController processes a logout.
   *
   * @param inGame Whether the server is in-game.
   */
  logout(inGame: boolean): void {
    this.loggedIn = false;
    this.changeClientState(inGame);
    this.setGame(null);
    this.setMyPlayer(null);
  }
  /**
   * Continue playing after winning the game.
   */
  continuePlaying(): void {
    this.askServer().continuePlaying();
  }
  /**
   * Start the game skipping turns.
   *
   * @param turns The number of turns to skip.
   */
  skipTurns(turns: number): void {
    if (this.freeColServer == null) {
      return;
    }
    if (turns <= 0) {
      this.freeColServer.getInGameController().setSkippedTurns(0);
      return;
    }
    this.gui.closeMenus();
    this.freeColServer.getInGameController().setSkippedTurns(turns);
    this.askServer().startSkipping();
  }
  /**
   * Quits the application.
   */
  askToQuit(): void {
    if (this.gui.confirm$String$String$String('quitDialog.areYouSure.text', 'ok', 'cancel')) {
      let player = this.getMyPlayer();
      if (player == null) {
        this.quit();
      } else {
        this.getConnectController().requestLogout(Game$LogoutReason.QUIT);
        this.quit();
      }
    }
  }
  /**
   * Retire from the game.
   */
  retire(): void {
    if (this.gui.confirm$String$String$String('retireDialog.areYouSure.text', 'ok', 'cancel')) {
      let player = this.getMyPlayer();
      player.changePlayerType(Player$PlayerType.RETIRED);
      let highScore = this.askServer().retire();
      this.getInGameController().highScore(highScore);
    }
  }
  /**
   * Quits the application without any questions.
   */
  quit(): void {
    this.stopServer();
    let co = this.getClientOptions();
    let excludeSuffixes = new ArrayList(2);
    excludeSuffixes.add(co.getText(ClientOptions.LAST_TURN_NAME));
    excludeSuffixes.add(co.getText(ClientOptions.BEFORE_LAST_TURN_NAME));
    let logMe = FreeColDirectories.removeOutdatedAutosaves(co.getText(ClientOptions.AUTO_SAVE_PREFIX), excludeSuffixes, co.getInteger(ClientOptions.AUTOSAVE_VALIDITY));
    if (logMe != null) {
      FreeColClient.logger.info(logMe);
    }
    try {
      this.gui.quitGUI();
    } catch ($e6) {
      if ($J.isa($e6, Exception)) {
        let e = $J.exc($e6);
        FreeCol.fatal$Logger$String(FreeColClient.logger, 'Failed to shutdown gui: ' + $J.str(e));
      } else {
        throw $e6;
      }
    }
    FreeCol.quit(0);
  }
  overrideDefaultUncaughtExceptionHandler(): void {
    Thread.setDefaultUncaughtExceptionHandler($J.lambdaObj((thread, e) => {
      if ($J.isa(e, JError)) {
        this.memoryToBeFreedOnOutOfMemory = null;
        this.gui.emergencyPurge();
      }
      let seriousError = ($J.isa(e, JError));
      try {
        FreeColClient.logger.log(Level.WARNING, 'Uncaught exception from thread: ' + $J.str(thread), e);
        if (seriousError) {
          this.gui.showErrorPanel$String$Runnable(Messages.message$String('error.seriousError'), () => {
            $J.system_exit(1);
          });
        }
      } catch ($e7) {
        {
          let t = $J.exc($e7);
          if (seriousError) {
            t.printStackTrace();
            $J.system_exit(1);
          }
        }
      }
    }, 'uncaughtException', 'java.lang.Thread$UncaughtExceptionHandler'));
  }
  static $clinit() {
    FreeColClient.logger = Logger.getLogger($J.cls(FreeColClient).getName());
  }
}

let $FreeColClient$1: any = null;
/** An anonymous class (FreeColClient.java:161). */
function FreeColClient$1(): any {
  return $FreeColClient$1 ??= $J.local(class extends Thread {
    /**
     * {@inheritDoc}
     */
    run(): void {
      this.$outer.stopServer();
    }
  }, 'net.sf.freecol.client.FreeColClient$1', []);
}

$J.define(FreeColClient, 'net.sf.freecol.client.FreeColClient', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.SplashScreen,java.lang.String,java.awt.Dimension,java.lang.String,boolean,boolean,java.io.File,net.sf.freecol.common.model.Specification': '_FreeColClient' }, returns: { 'isAdmin': 'boolean', 'getVacantPlayerNames': 'java.util.List', 'getServerState': 'net.sf.freecol.server.FreeColServer$ServerState', 'isLoggedIn': 'boolean', 'getSinglePlayer': 'boolean', 'isMapEditor': 'boolean', 'isReadyToStart': 'boolean', 'isInGame': 'boolean', 'getClientOptions': 'net.sf.freecol.client.ClientOptions', 'getMyPlayer': 'net.sf.freecol.common.model.Player', 'getGame': 'net.sf.freecol.common.model.Game', 'getActionManager': 'net.sf.freecol.client.gui.action.ActionManager', 'getGUI': 'net.sf.freecol.client.gui.GUI', 'getFreeColServer': 'net.sf.freecol.server.FreeColServer', 'getSoundController': 'net.sf.freecol.client.control.SoundController', 'getMapEditorController': 'net.sf.freecol.client.control.MapEditorController', 'getInGameController': 'net.sf.freecol.client.control.InGameController', 'getPreGameController': 'net.sf.freecol.client.control.PreGameController', 'getConnectController': 'net.sf.freecol.client.control.ConnectController' }, meths: { 'startServer(boolean,boolean,java.io.File,java.net.InetAddress,int,java.lang.String)': 'startServer$boolean$boolean$File$InetAddress$int$String', 'startServer(boolean,boolean,net.sf.freecol.common.model.Specification,java.net.InetAddress,int)': 'startServer$boolean$boolean$Specification$InetAddress$int', 'failToMain(java.lang.Exception,java.lang.String)': 'failToMain$Exception$String$FreeColClient', 'failToMain(java.lang.Exception,net.sf.freecol.common.model.StringTemplate)': 'failToMain$Exception$StringTemplate$FreeColClient' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ClientInputHandler = $J.load('net.sf.freecol.client.control.ClientInputHandler');
  ConnectController = $J.load('net.sf.freecol.client.control.ConnectController');
  InGameController = $J.load('net.sf.freecol.client.control.InGameController');
  MapEditorController = $J.load('net.sf.freecol.client.control.MapEditorController');
  PreGameController = $J.load('net.sf.freecol.client.control.PreGameController');
  SoundController = $J.load('net.sf.freecol.client.control.SoundController');
  GUI = $J.load('net.sf.freecol.client.gui.GUI');
  SwingGUI = $J.load('net.sf.freecol.client.gui.SwingGUI');
  ActionManager = $J.load('net.sf.freecol.client.gui.action.ActionManager');
  UserServerAPI = $J.load('net.sf.freecol.client.networking.UserServerAPI');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDataFile = $J.load('net.sf.freecol.common.io.FreeColDataFile');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColSavegameFile = $J.load('net.sf.freecol.common.io.FreeColSavegameFile');
  FreeColTcFile = $J.load('net.sf.freecol.common.io.FreeColTcFile');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ImageResource = $J.load('net.sf.freecol.common.resources.ImageResource');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  FreeColServer = $J.load('net.sf.freecol.server.FreeColServer');
  FreeColServer$ServerState = $J.load('net.sf.freecol.server.FreeColServer$ServerState');
});
