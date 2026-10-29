// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/FreeColServer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Files, IOException, ImageIO, InetAddress, JEnum, JObject, JarEntry, JarOutputStream, Level, Logger, Properties, Random, UnknownHostException, XMLStreamException } from '../../../../../jre/index.ts';

let FreeCol, FreeColException, FreeColSeed, FreeColDebugger, FreeColDirectories, FreeColSavegameFile, FreeColXMLReader$ReadScope, FreeColXMLWriter, FreeColXMLWriter$WriteScope, MetaServerUtils, ServerInfo, Constants$IntegrityType, Game, Game$LogoutReason, NationOptions$NationState, Player, Specification, Stance, Tension, Tension$Level, ChangeSet, ChangeSet$See, Connection, GameStateMessage, LogoutMessage, TrivialMessage, VacantPlayersMessage, GameOptions, MapGeneratorOptions, CollectionUtils, LogBuilder, Utils, AIInGameInputHandler, AIMain, InGameController, PreGameController, ServerInputHandler, UserConnectionHandler, SimpleMapGenerator, ServerGame, ServerPlayer, Session, DummyConnection, Server;

/**
 * The main control class for the FreeCol server.  This class both
 * starts and keeps references to all of the server objects and the
 * game model objects.
 *
 * If you would like to start a new server you just create a new
 * object of this class.
 */
export class FreeColServer extends JObject {
  static logger: Logger = null;
  /**
   * The name to use as the owner of maps that have been edited by
   * the map editor.
   *
   * This is used so we can tell when a user tries to start a map
   * (which may be lacking vital pieces) as a game.  Make sure all
   * the maps in data/maps have this owner.
   *
   * TODO: Make loading a map as a game work.
   */
  static readonly MAP_EDITOR_NAME: string = 'mapEditor';
  static readonly ACTIVE_UNIT_TAG: string = 'activeUnit';
  static readonly OLD_SERVER_OBJECTS_TAG: string = 'serverObjects';
  static readonly DEBUG_TAG: string = 'debug';
  static readonly RANDOM_STATE_TAG: string = 'randomState';
  static readonly OWNER_TAG: string = 'owner';
  static readonly PUBLIC_SERVER_TAG: string = 'publicServer';
  static readonly SAVED_GAME_TAG: string = 'savedGame';
  static readonly SINGLE_PLAYER_TAG: string = 'singleplayer';
  /**
   * The save game format used for saving games.
   *
   * Version 7-10 were used in 0.9.x.
   * Version 11 made a lot of changes and was introduced for 0.10.0.
   * Version 12 was introduced with HighSeas post-0.10.1.
   * Version 13 coincides with the start of the 0.11.x series.
   * Version 14 coincides with the start of the 0.12.x series.
   *
   * Please add to this comment if you increase the version.
   * These days we *try* to change this only for (semi-)major
   * releases (i.e. when x changes in 0.x.y).
   */
  static readonly SAVEGAME_VERSION: number = 14;
  /**
   * The oldest save game format that can still be loaded.
   * The promise is that FreeCol 0.n.* can load 0.(n-1).* games.
   *
   * Revisit the numbering scheme and save compatibility promise
   * when 1.0 is released?
   */
  static readonly MINIMUM_SAVEGAME_VERSION: number = 12;
  /**
   * The ruleset to use when loading old format games where a spec
   * may not be readily available.
   */
  static readonly DEFAULT_SPEC: string = 'freecol';
  /**
   * The name of this server.
   */
  name: string = null;
  /**
   * Should this game be listed on the meta-server?
   */
  publicServer: boolean = false;
  /**
   * Is this a single player game?
   */
  singlePlayer: boolean = false;
  /**
   * The internal provider of random numbers.
   */
  random: Random = null;
  /**
   * The game underway.
   */
  serverGame: ServerGame = null;
  /**
   * The underlying interface to the network.
   */
  server: Server = null;
  /**
   * The current state of the game.
   */
  serverState: FreeColServer$ServerState = null;
  /**
   * The handler for new user connections.
   */
  userConnectionHandler: UserConnectionHandler = null;
  /**
   * The pre-game controller.
   */
  preGameController: PreGameController = null;
  /**
   * The in-game controller.
   */
  inGameController: InGameController = null;
  /**
   * The input handler.
   */
  inputHandler: ServerInputHandler = null;
  /**
   * The AI controller.
   */
  aiMain: AIMain = null;
  /**
   * The map generator.
   */
  mapGenerator: MapGenerator = null;
  /**
   * The game integrity state.
   */
  integrity: Constants$IntegrityType = null;
  $init_FreeColServer() {
    this.publicServer = false;
    this.random = null;
    this.serverState = FreeColServer$ServerState.PRE_GAME;
    this.mapGenerator = null;
    this.integrity = Constants$IntegrityType.INTEGRITY_GOOD;
  }
  /**
   * Base constructor common to the following new-game and
   * saved-game constructors.
   *
   * @param name An optional name for the server.
   * @param address The address to use for the public socket.
   * @param port The TCP port to use for the public socket.
   * @exception IOException on failure to open the port.
   */
  _FreeColServer$String$InetAddress$int(name: string, address: InetAddress, port: number): this {
    this.$init_FreeColServer();
    this.name = name;
    this.server = this.createServer(address, port);
    this.server.start();
    this.userConnectionHandler = new UserConnectionHandler()._UserConnectionHandler(this);
    this.preGameController = new PreGameController()._PreGameController(this);
    this.inGameController = new InGameController()._InGameController(this);
    this.inputHandler = new ServerInputHandler()._ServerInputHandler(this);
    return this;
  }
  /**
   * Starts a new server, with a new game.
   *
   * @param publicServer If true, add to the meta-server.
   * @param singlePlayer True if this is a single player game.
   * @param specification The {@code Specification} to use in this game.
   * @param address The address to use for the public socket.
   * @param port The TCP port to use for the public socket.
   * @param name An optional name for the server.
   * @exception IOException If the public socket cannot be created.
   */
  _FreeColServer$boolean$boolean$Specification$InetAddress$int$String(publicServer: boolean, singlePlayer: boolean, specification: Specification, address: InetAddress, port: number, name: string): this {
    this._FreeColServer$String$InetAddress$int(name, address, port);
    this.setPublicServer(publicServer);
    this.singlePlayer = singlePlayer;
    this.random = new Random();
    this.serverGame = new ServerGame()._ServerGame$Specification$Random(specification, this.random);
    this.inGameController.setRandom(this.random);
    this.mapGenerator = new SimpleMapGenerator()._SimpleMapGenerator(this.random);
    return this;
  }
  /**
   * Starts a new networked server, initializing from a saved game.
   *
   * The specification is usually null, which means it will be
   * initialized by extracting it from the saved game.  However
   * MapConverter does call this with an overriding specification.
   *
   * @param savegame The file where the game data is located.
   * @param specification An optional {@code Specification} to use.
   * @param address The address to use for the public socket.
   * @param port The TCP port to use for the public socket.
   * @param name An optional name for the server.
   * @exception IOException If save game can not be found.
   * @exception FreeColException If the savegame could not be loaded.
   * @exception XMLStreamException If the server comms fail.
   */
  _FreeColServer$FreeColSavegameFile$Specification$InetAddress$int$String(savegame: FreeColSavegameFile, specification: Specification, address: InetAddress, port: number, name: string): this {
    this._FreeColServer$String$InetAddress$int(name, address, port);
    this.serverGame = this.loadGame$FreeColSavegameFile$Specification$FreeColServer(savegame, specification);
    Session.clearAll();
    if (FreeColSeed.hasFreeColSeed()) {
      this.random = new Random(FreeColSeed.getFreeColSeed());
    }
    this.inGameController.setRandom(this.random);
    this.mapGenerator = null;
    return this;
  }
  /**
   * Create a Server at port.
   *
   * If the port is specified, just try once.
   * If the port is unspecified (negative), try multiple times.
   *
   * @param address The address to use for the public socket.
   * @param firstPort The port to start trying to connect at.
   * @return A started {@code Server}.
   * @exception IOException on failure to open the port.
   */
  createServer(address: InetAddress, firstPort: number): Server {
    let addresses = new ArrayList();
    if (address == null) {
      addresses.add(InetAddress.getLoopbackAddress());
      try {
        addresses.add(InetAddress.getLocalHost());
      } catch ($e0) {
        if ($J.isa($e0, UnknownHostException)) {
          let uhe = $J.exc($e0);
          FreeColServer.logger.warning('Could not resolve local host name');
        } else {
          throw $e0;
        }
      }
    } else {
      addresses.add(address);
    }
    let tryMax = 1;
    if (firstPort < 0) {
      firstPort = FreeCol.getServerPort();
      tryMax = 10;
    }
    let ex = null;
    for (const $it1 = addresses.iterator(); $it1.hasNext(); ) {
      let ia = $it1.next();
      let host = ia.getHostAddress();
      let port = firstPort;
      for (let i = tryMax; i > 0; i--) {
        try {
          let ret = new Server()._Server(this, host, port);
          FreeColServer.logger.finest('Server started: ' + ret.getHost() + ', ' + ret.getPort());
          return ret;
        } catch ($e2) {
          if ($J.isa($e2, IOException)) {
            let ioe = $J.exc($e2);
            ex = ioe;
          } else {
            throw $e2;
          }
        }
        port++;
      }
    }
    throw ex;
  }
  /**
   * Gets the name of this server.
   *
   * @return The name.
   */
  getName(): string {
    return this.name;
  }
  /**
   * Sets the name of this server.
   *
   * @param name The new name.
   */
  setName(name: string): void {
    this.name = name;
  }
  /**
   * Get the public server state.
   *
   * @return The public server state.
   */
  getPublicServer(): boolean {
    return this.publicServer;
  }
  /**
   * Sets the public server state.
   *
   * @param publicServer The new public server state.
   */
  setPublicServer(publicServer: boolean): void {
    this.publicServer = publicServer;
  }
  /**
   * Is the user playing in single player mode?
   *
   * @return True if this is a single player game.
   */
  getSinglePlayer(): boolean {
    return this.singlePlayer;
  }
  /**
   * Sets the single/multiplayer state of the game.
   *
   * @param singlePlayer The new single/multiplayer status.
   */
  setSinglePlayer(singlePlayer: boolean): void {
    this.singlePlayer = singlePlayer;
  }
  /**
   * Gets the server random number generator.
   *
   * @return The server random number generator.
   */
  getServerRandom(): Random {
    return this.random;
  }
  /**
   * Sets the server random number generator.
   *
   * @param random The new random number generator.
   */
  setServerRandom(random: Random): void {
    this.random = random;
  }
  /**
   * Gets the {@code Game} that is being played.
   *
   * @return The {@code Game} which is the main class of the game-model
   *     being used in this game.
   */
  getGame(): ServerGame {
    return this.serverGame;
  }
  /**
   * Sets the {@code Game} that is being played.
   *
   * @param serverGame The new {@code Game}.
   */
  setGame(serverGame: ServerGame): void {
    this.serverGame = serverGame;
  }
  /**
   * Gets the specification from the game run by this server.
   *
   * @return The specification from the game.
   */
  getSpecification(): Specification {
    return (this.serverGame == null) ? null : this.serverGame.getSpecification();
  }
  /**
   * Gets the network server responsible of handling the connections.
   *
   * @return The network server.
   */
  getServer(): Server {
    return this.server;
  }
  /**
   * Gets the host this FreeColServer was started on.
   *
   * @return The host.
   */
  getHost(): string {
    return (this.server == null) ? null : this.server.getHost();
  }
  /**
   * Gets the port this FreeColServer was started on.
   *
   * @return The port.
   */
  getPort(): number {
    return (this.server == null) ? -1 : this.server.getPort();
  }
  /**
   * Shut down this FreeColServer.
   */
  shutdown(): void {
    this.server.shutdown();
  }
  /**
   * Gets the current state of the server.
   *
   * @return The current {@code ServerState}.
   */
  getServerState(): FreeColServer$ServerState {
    return this.serverState;
  }
  /**
   * Change the server state.
   *
   * @param serverState The new {@code ServerState}.
   * @return The old server state.
   */
  changeServerState(serverState: FreeColServer$ServerState): FreeColServer$ServerState {
    let ret = this.serverState;
    switch (this.serverState = serverState) {
      case FreeColServer$ServerState.PRE_GAME:
      case FreeColServer$ServerState.LOAD_GAME:
      case FreeColServer$ServerState.IN_GAME:
        this.getServer().setMessageHandlerToAllConnections(this.inputHandler);
        break;
      case FreeColServer$ServerState.END_GAME:
      default:
        this.getServer().setMessageHandlerToAllConnections(null);
        break;
    }
    return ret;
  }
  /**
   * Gets the {@code UserConnectionHandler}.
   *
   * @return The {@code UserConnectionHandler} that is used when a
   *     new client connects.
   */
  getUserConnectionHandler(): UserConnectionHandler {
    return this.userConnectionHandler;
  }
  /**
   * Gets the {@code Controller}.
   *
   * @return The {@code Controller}.
   */
  getController(): Controller {
    return (this.getServerState() === FreeColServer$ServerState.IN_GAME) ? this.inGameController : this.preGameController;
  }
  /**
   * Get the current input handler.
   *
   * @return The {@code ServerInputHandler} for the current server state.
   */
  getInputHandler(): ServerInputHandler {
    switch (this.serverState) {
      case FreeColServer$ServerState.PRE_GAME:
      case FreeColServer$ServerState.LOAD_GAME:
      case FreeColServer$ServerState.IN_GAME:
        return this.inputHandler;
      default:
        break;
    }
    return null;
  }
  /**
   * Gets the {@code PreGameController}.
   *
   * @return The {@code PreGameController}.
   */
  getPreGameController(): PreGameController {
    return this.preGameController;
  }
  /**
   * Gets the controller being used while the game is running.
   *
   * @return The controller from making a new turn etc.
   */
  getInGameController(): InGameController {
    return this.inGameController;
  }
  /**
   * Sets the main AI-object.
   *
   * @param aiMain The main AI-object which is responsible for controlling,
   *            updating and saving the AI objects.
   */
  setAIMain(aiMain: AIMain): void {
    this.aiMain = aiMain;
  }
  /**
   * Gets the main AI-object.
   *
   * @return The main AI-object which is responsible for controlling, updating
   *         and saving the AI objects.
   */
  getAIMain(): AIMain {
    return this.aiMain;
  }
  /**
   * Get the map generator.
   *
   * @return The {@code MapGenerator}.
   */
  getMapGenerator(): MapGenerator {
    return this.mapGenerator;
  }
  /**
   * Set the map generator.
   *
   * @param mapGenerator The new {@code MapGenerator}.
   */
  setMapGenerator(mapGenerator: MapGenerator): void {
    this.mapGenerator = mapGenerator;
  }
  /**
   * Gets the integrity check result.
   *
   * @return The integrity check result.
   */
  getIntegrity(): Constants$IntegrityType {
    return this.integrity;
  }
  /**
   * The game is ending, tell all the non-admin players to quit.
   */
  endGame(): void {
    this.changeServerState(FreeColServer$ServerState.END_GAME);
    for (const $it3 = this.getGame().getLiveEuropeanPlayerList([]).iterator(); $it3.hasNext(); ) {
      let p = $it3.next();
      if (p.isAdmin()) {
        continue;
      }
      p.send(new ChangeSet()._ChangeSet$().add$See$Message(ChangeSet$See.only(p), new LogoutMessage()._LogoutMessage$Player$LogoutReason(p, Game$LogoutReason.QUIT)));
    }
  }
  /**
   * Add a new user connection.  That is a new connection to the server
   * that has not yet logged in as a player.
   *
   * @param socket The client {@code Socket} the connection arrives on.
   * @exception FreeColException on extreme confusion.
   * @exception IOException if the socket was already broken.
   * @exception XMLStreamException on stream problem.
   */
  addNewUserConnection(socket: Socket): void {
    let name = $J.str(socket.getInetAddress()) + ':' + socket.getPort();
    let c = (new Connection()._Connection$Socket$String(socket, FreeCol.SERVER_THREAD + name)).setMessageHandler(this.userConnectionHandler);
    this.getServer().addConnection(c);
    c.startReceiving();
    c.send(new GameStateMessage()._GameStateMessage$ServerState(this.serverState));
    if (this.serverState === FreeColServer$ServerState.IN_GAME) {
      c.send(new VacantPlayersMessage()._VacantPlayersMessage$().setVacantPlayers(this.getGame()));
    }
    FreeColServer.logger.info('Client connected from ' + name);
  }
  /**
   * Add player connection.  That is, a user connection is now
   * transitioning to a player connection.
   *
   * @param connection The new {@code Connection}.
   */
  addPlayerConnection(connection: Connection): void {
    switch (this.serverState) {
      case FreeColServer$ServerState.PRE_GAME:
      case FreeColServer$ServerState.LOAD_GAME:
      case FreeColServer$ServerState.IN_GAME:
        connection.setMessageHandler(this.inputHandler);
        break;
      case FreeColServer$ServerState.END_GAME:
      default:
        return;
    }
    this.getServer().addConnection(connection);
    this.updateMetaServer();
  }
  /**
   * Remove a player connection.
   *
   * @param player The {@code Player} to disconnect.
   */
  removePlayerConnection(player: Player): void {
    let conn = player.getConnection();
    if (conn != null) {
      this.getServer().removeConnection(conn);
      conn.close();
      player.setConnection(null);
    }
  }
  /**
   * Establish the connections for an AI player.
   *
   * @param aiPlayer The AI {@code Player} to connect.
   */
  addAIConnection(aiPlayer: Player): void {
    let theConnection = new DummyConnection()._DummyConnection('Server-to-AI-' + aiPlayer.getSuffix$());
    theConnection.setMessageHandler(this.inputHandler);
    theConnection.setWriteScope(FreeColXMLWriter$WriteScope.toClient(aiPlayer));
    let aiConnection = new DummyConnection()._DummyConnection('AI-' + aiPlayer.getSuffix$() + '-to-Server');
    aiConnection.setMessageHandler(new AIInGameInputHandler()._AIInGameInputHandler(this, aiPlayer, this.getAIMain()));
    aiConnection.setWriteScope(FreeColXMLWriter$WriteScope.toServer());
    aiConnection.setOtherConnection(theConnection);
    theConnection.setOtherConnection(aiConnection);
    aiPlayer.setConnection(theConnection);
    this.getServer().addDummyConnection(theConnection);
  }
  /**
   * Wait until the game has been created.
   *
   * 2017: This should not be needed, but just occasionally the
   * client and server threads conspire to race in a way that
   * causes a hang.  Check this again in due course.
   *
   * @return The {@code ServerGame}, or null if the wait times out.
   */
  waitForGame(): ServerGame {
    let timeStep = 1000;
    let timeOut = 20000;
    let serverGame = null;
    while ((serverGame = this.getGame()) == null) {
      Utils.delay(timeStep, 'waitForGame delay interrupt');
      if ((timeOut = (timeOut - timeStep) | 0) <= 0) {
        break;
      }
    }
    return serverGame;
  }
  /**
   * Start the game.
   *
   * Called from PreGameController following a requestLaunch message
   * (or from the test suite).
   *
   * <ol>
   *   <li>Creates the game.
   *   <li>Sends updated game information to the clients.
   *   <li>Changes the game state to
   *         {@link net.sf.freecol.server.FreeColServer.ServerState#IN_GAME}.
   *   <li>Sends the "startGame"-message to the clients.
   *   <li>Switches to using the in-game version of the input handler.
   * </ol>
   *
   * @exception FreeColException if there is a problem creating the game.
   */
  startGame(): void {
    FreeColServer.logger.info('Server starting game: ' + $J.str(this.serverState));
    {
      let game: Game;
      switch (this.serverState) {
        case FreeColServer$ServerState.PRE_GAME:
          game = this.buildGame();
          for (const $it4 = (CollectionUtils.transform$Stream$Predicate(game.getLivePlayers([]), (p) => !p.isAI())).iterator(); $it4.hasNext(); ) {
            let player = $it4.next();
            player.invalidateCanSeeTiles();
            let cs = new ChangeSet()._ChangeSet$();
            cs.add$See$FreeColGameObjectArr(ChangeSet$See.only(player), [game]);
            player.send(cs);
          }
          break;
        case FreeColServer$ServerState.LOAD_GAME:
          break;
        default:
          FreeColServer.logger.warning('Invalid startGame when server state = ' + $J.str(this.serverState));
          return;
      }
    }
    this.changeServerState(FreeColServer$ServerState.IN_GAME);
    this.sendToAll$Message$Player(TrivialMessage.startGameMessage, null);
    this.updateMetaServer();
  }
  /**
   * Send a message to all connections.
   *
   * @param msg The {@code Message} to send.
   * @param conn An optional {@code Connection} to omit.
   */
  sendToAll$Message$Connection$FreeColServer(msg: Message, conn: Connection): void {
    this.getServer().sendToAll$Message$Connection(msg, conn);
  }
  /**
   * Send a message to all connections.
   *
   * @param msg The {@code Message} to send.
   * @param player An optional {@code Player} to omit.
   */
  sendToAll$Message$Player(msg: Message, player: Player): void {
    this.sendToAll$Message$Connection$FreeColServer(msg, (player == null) ? null : player.getConnection());
  }
  /**
   * Save a game from the map editor.
   *
   * @param file The file where the data will be written.
   * @param image A thumbnail image for the map.
   * @exception IOException If a problem was encountered while trying
   *     to open, write or close the file.
   */
  saveMapEditorGame(file: File, image: BufferedImage): void {
    this.setAIMain(null);
    let spec = this.getSpecification();
    this.getGame().setSpecification(null);
    this.saveGame$File$String$OptionGroup$Unit$BufferedImage$FreeColServer(file, FreeColServer.MAP_EDITOR_NAME, null, null, image);
    this.getGame().setSpecification(spec);
  }
  /**
   * Saves a normal (non-map-editor) game.
   *
   * @param file The file where the data will be written.
   * @param options The client options to save.
   * @param active An optional active {@code Unit}.
   * @exception IOException If a problem was encountered while trying
   *     to open, write or close the file.
   */
  saveGame$File$OptionGroup$Unit(file: File, options: OptionGroup, active: Unit): void {
    this.saveGame$File$String$OptionGroup$Unit$BufferedImage$FreeColServer(file, null, options, active, null);
  }
  /**
   * Saves a game.
   *
   * @param file The file where the data will be written.
   * @param owner An optional name to use as the owner of the game.
   * @param options Optional client options to save in the game.
   * @param active An optional active {@code Unit}.
   * @param image A thumbnail {@code Image} value to save in the game.
   * @exception IOException If a problem was encountered while trying
   *     to open, write or close the file.
   */
  saveGame$File$String$OptionGroup$Unit$BufferedImage$FreeColServer(file: File, owner: string, options: OptionGroup, active: Unit, image: BufferedImage): void {
    Utils.garbageCollect();
    {
      try {
        const fos = new JarOutputStream(Files.newOutputStream(file.toPath()));
        try {
          if (image != null) {
            fos.putNextEntry(new JarEntry(FreeColSavegameFile.THUMBNAIL_FILE));
            ImageIO.write(image, 'png', fos);
            fos.closeEntry();
          }
          if (options != null) {
            fos.putNextEntry(new JarEntry(FreeColSavegameFile.CLIENT_OPTIONS));
            options.save$OutputStream$WriteScope$boolean(fos, null, true);
            fos.closeEntry();
          }
          let properties = new Properties();
          properties.setProperty('map.width', String(this.serverGame.getMap().getWidth()));
          properties.setProperty('map.height', String(this.serverGame.getMap().getHeight()));
          fos.putNextEntry(new JarEntry(FreeColSavegameFile.SAVEGAME_PROPERTIES));
          properties.store(fos, null);
          fos.closeEntry();
          fos.putNextEntry(new JarEntry(FreeColSavegameFile.SAVEGAME_FILE));
          {
            const xw = new FreeColXMLWriter()._FreeColXMLWriter$OutputStream$WriteScope$boolean(fos, FreeColXMLWriter$WriteScope.toSave(), false);
            try {
              xw.writeStartDocument('UTF-8', '1.0');
              xw.writeComment(FreeCol.getConfiguration().toString());
              xw.writeCharacters('\n');
              xw.writeStartElement(FreeColServer.SAVED_GAME_TAG);
              xw.writeAttribute(FreeColServer.OWNER_TAG, (owner != null) ? owner : FreeCol.getName());
              xw.writeAttribute$String$boolean(FreeColServer.PUBLIC_SERVER_TAG, this.getPublicServer());
              xw.writeAttribute$String$boolean(FreeColServer.SINGLE_PLAYER_TAG, this.singlePlayer);
              xw.writeAttribute$String$int(FreeColSavegameFile.VERSION_TAG, FreeColServer.SAVEGAME_VERSION);
              xw.writeAttribute(FreeColServer.RANDOM_STATE_TAG, Utils.getRandomState(this.random));
              xw.writeAttribute(FreeColServer.DEBUG_TAG, FreeColDebugger.getDebugModes());
              if (active != null) {
                this.serverGame.setInitialActiveUnitId(active.getId());
              }
              this.serverGame.toXML$FreeColXMLWriter(xw);
              if (this.aiMain != null) {
                this.aiMain.toXML$FreeColXMLWriter(xw);
              }
              xw.writeEndElement();
              xw.writeEndDocument();
            } finally {
              if (xw != null) xw.close();
            }
          }
          fos.closeEntry();
        } finally {
          if (fos != null) fos.close();
        }
      } catch ($e5) {
        if ($J.isa($e5, XMLStreamException)) {
          let e = $J.exc($e5);
          throw new IOException('Failed to save (XML): ' + file.getName(), e);
        } else {
          throw $e5;
        }
      }
    }
  }
  /**
   * Loads a game.
   *
   * @param fis The file where the game data is located.
   * @return The game found in the stream.
   * @exception FreeColException if the savegame contains incompatible data.
   * @exception IOException if the stream can not be created.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  loadGame$FreeColSavegameFile(fis: FreeColSavegameFile): ServerGame {
    return this.loadGame$FreeColSavegameFile$Specification$FreeColServer(fis, null);
  }
  /**
   * Read just the map part from a file.
   *
   * When the specification is not supplied, the one found in the saved
   * game will be used.
   *
   * @param file The {@code File} to read from.
   * @param spec An optional {@code Specification} to use.
   * @return The {@code Map} found in the stream.
   * @exception FreeColException if the format is incompatible.
   * @exception IOException if the stream can not be created.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  static readMap(file: File, spec: Specification): Map_ {
    let serverGame = FreeColServer.readGame$File$Specification$FreeColServer(file, spec, null);
    return (serverGame == null) ? null : serverGame.getMap();
  }
  /**
   * Read just the game part from a file.
   *
   * When the specification is not supplied, the one found in the saved
   * game will be used.
   *
   * @param file The {@code File} to read from.
   * @param spec An optional {@code Specification} to use.
   * @param freeColServer Use this (optional) server to load into.
   * @return The game found in the stream.
   * @exception FreeColException if the format is incompatible.
   * @exception IOException if the stream can not be created.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  static readGame$File$Specification$FreeColServer(file: File, spec: Specification, freeColServer: FreeColServer): ServerGame {
    let serverGame = FreeColServer.readGame$FreeColSavegameFile$Specification$FreeColServer(new FreeColSavegameFile()._FreeColSavegameFile(file), spec, freeColServer);
    FreeColServer.logger.info('Read file ' + file.getPath());
    let startGame = FreeColDirectories.getStartMapFile();
    if (startGame != null && $J.equals(startGame.getPath(), file.getPath())) {
      Utils.deleteFile(file);
    }
    return serverGame;
  }
  /**
   * Reads just the game part from a save game from a stream.
   *
   * When the specification is not supplied, the one found in the saved
   * game will be used.
   *
   * @param fis The stream to read from.
   * @param specification An optional {@code Specification} to use.
   * @param freeColServer Use this (optional) server to load into.
   * @return The game found in the stream.
   * @exception FreeColException if the format is incompatible.
   * @exception IOException if the stream can not be created.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  static readGame$FreeColSavegameFile$Specification$FreeColServer(fis: FreeColSavegameFile, specification: Specification, freeColServer: FreeColServer): ServerGame {
    let savegameVersion = fis.getSavegameVersion();
    FreeColServer.logger.info('Found savegame version ' + savegameVersion);
    if (savegameVersion < FreeColServer.MINIMUM_SAVEGAME_VERSION) {
      throw new FreeColException()._FreeColException$String('server.incompatibleVersions: ' + savegameVersion + ' < ' + FreeColServer.MINIMUM_SAVEGAME_VERSION);
    }
    let serverGame = null;
    {
      const xr = fis.getSavedGameFreeColXMLReader();
      try {
        xr.setReadScope(FreeColXMLReader$ReadScope.SERVER);
        let active = null;
        xr.nextTag();
        if (freeColServer != null) {
          let owner = xr.getAttribute$String$String(FreeColServer.OWNER_TAG, null);
          if (specification == null && $J.equals(FreeColServer.MAP_EDITOR_NAME, owner)) {
            throw new FreeColException()._FreeColException$String('Can not start a map editor map as a game: ' + fis.getPath());
          }
          freeColServer.setSinglePlayer(xr.getAttribute$String$boolean(FreeColServer.SINGLE_PLAYER_TAG, true));
          freeColServer.setPublicServer(xr.getAttribute$String$boolean(FreeColServer.PUBLIC_SERVER_TAG, false));
          let r = xr.getAttribute$String$String(FreeColServer.RANDOM_STATE_TAG, null);
          freeColServer.setServerRandom(Utils.restoreRandomState(r));
          FreeColDebugger.setDebugModes(xr.getAttribute$String$String(FreeColServer.DEBUG_TAG, null));
          active = xr.getAttribute$String$String(FreeColServer.ACTIVE_UNIT_TAG, null);
        }
        while (xr.moreTags()) {
          let tag = xr.getLocalName();
          if ($J.equals(FreeColServer.OLD_SERVER_OBJECTS_TAG, tag)) {
            xr.swallowTag(FreeColServer.OLD_SERVER_OBJECTS_TAG);
          } else if ($J.equals(Game.TAG, tag)) {
            serverGame = new ServerGame()._ServerGame$Specification$FreeColXMLReader(specification, xr);
            serverGame.setCurrentPlayer(null);
            if (freeColServer != null) {
              freeColServer.setGame(serverGame);
            }
          } else if ($J.equals(AIMain.TAG, tag)) {
            if (freeColServer != null) {
              let aiMain = new AIMain()._AIMain$FreeColServer$FreeColXMLReader(freeColServer, xr);
              freeColServer.setAIMain(aiMain);
            } else {
              xr.swallowTag(AIMain.TAG);
            }
          } else {
            throw new XMLStreamException('Unknown tag reading server game: ' + tag);
          }
        }
        if (serverGame != null && active != null) {
          serverGame.setInitialActiveUnitId(active);
        }
      } finally {
        if (xr != null) xr.close();
      }
    }
    return serverGame;
  }
  /**
   * Loads a game.
   *
   * @param fis The file where the game data is located.
   * @param specification The {@code Specification} to refer to.
   * @return The new game.
   * @exception FreeColException if the savegame contains incompatible data.
   * @exception IOException if the stream can not be created.
   * @exception XMLStreamException if there a problem reading the stream.
   */
  loadGame$FreeColSavegameFile$Specification$FreeColServer(fis: FreeColSavegameFile, specification: Specification): ServerGame {
    this.changeServerState(FreeColServer$ServerState.LOAD_GAME);
    let serverGame = FreeColServer.readGame$FreeColSavegameFile$Specification$FreeColServer(fis, specification, this);
    let lb = new LogBuilder()._LogBuilder(512);
    this.integrity = serverGame.checkIntegrity(true, lb);
    switch (this.integrity) {
      case Constants$IntegrityType.INTEGRITY_GOOD:
        FreeColServer.logger.info('Game integrity test succeeded.');
        break;
      case Constants$IntegrityType.INTEGRITY_FIXED:
        FreeColServer.logger.info('Game integrity test failed, but fixed.' + $J.str(lb));
        break;
      default:
        FreeColServer.logger.warning('Game integrity test failed.' + $J.str(lb));
        break;
    }
    serverGame.getMap().resetContiguity();
    serverGame.establishUnknownEnemy();
    specification = this.getSpecification();
    specification.disableEditing();
    let aiMain = this.getAIMain();
    lb.truncate(0);
    let aiIntegrity = Constants$IntegrityType.INTEGRITY_GOOD;
    if (aiMain == null) {
      aiIntegrity = aiIntegrity.fail();
      lb.add(['\n  AIMain missing.']);
    } else {
      aiIntegrity = aiMain.checkIntegrity(true, lb);
    }
    switch (aiIntegrity) {
      case Constants$IntegrityType.INTEGRITY_GOOD:
        FreeColServer.logger.info('AI integrity test succeeded.');
        break;
      case Constants$IntegrityType.INTEGRITY_FIXED:
        FreeColServer.logger.info('AI integrity test failed, but fixed.' + $J.str(lb));
        break;
      default:
        aiMain = new AIMain()._AIMain$FreeColServer(this);
        aiMain.findNewObjects(true);
        this.setAIMain(aiMain);
        FreeColServer.logger.warning('AI integrity test failed, replaced AIMain.' + $J.str(lb));
        break;
    }
    serverGame.setFreeColGameObjectListener(aiMain);
    serverGame.sortPlayers(Player.playerComparator);
    for (const $it6 = serverGame.getLivePlayerList([]).iterator(); $it6.hasNext(); ) {
      let player = $it6.next();
      if (player.isAI()) {
        this.addAIConnection(player);
      }
      if (player.isEuropean()) {
        player.canSee(serverGame.getMap().getTile$int$int(0, 0));
      }
    }
    return serverGame;
  }
  /**
   * Builds a new game using the parameters that exist in the game
   * as it stands.
   *
   * @return The updated {@code Game}.
   * @exception FreeColException on map generation failure.
   */
  buildGame(): Game {
    let serverGame = this.getGame();
    let spec = serverGame.getSpecification();
    if (this.getAIMain() == null) {
      let aiMain = new AIMain()._AIMain$FreeColServer(this);
      serverGame.setFreeColGameObjectListener(aiMain);
      this.setAIMain(aiMain);
    }
    serverGame.establishUnknownEnemy();
    let availablePred = (e) => e.getValue() !== NationOptions$NationState.NOT_AVAILABLE && serverGame.getPlayerByNationId(e.getKey().getId()) == null;
    let toUpdate = CollectionUtils.transform$Collection$Predicate$Function$Comparator(serverGame.getNationOptions().getNations().entrySet(), availablePred, (e) => this.makeAIPlayer(e.getKey()), Player.playerComparator);
    toUpdate.add(serverGame.getUnknownEnemy());
    serverGame.updatePlayers(toUpdate);
    if (serverGame.getMap() == null) {
      this.generateMap(true);
      spec.generateDynamicOptions();
      let random = this.getServerRandom();
      for (const $it7 = serverGame.getLivePlayerList([]).iterator(); $it7.hasNext(); ) {
        let player = $it7.next();
        (player).randomizeGame(random);
        if (player.isIndian()) {
          let alarm = $J.idiv(((Tension$Level.HAPPY.getLimit() + Tension$Level.CONTENT.getLimit()) | 0), 2);
          for (const $it8 = serverGame.getLiveNativePlayerList([player]).iterator(); $it8.hasNext(); ) {
            let other = $it8.next();
            player.setStance(other, Stance.PEACE);
            for (const $it9 = player.getIndianSettlementList().iterator(); $it9.hasNext(); ) {
              let is$ = $it9.next();
              is$.setAlarm$Player$Tension(other, new Tension()._Tension$int(alarm));
            }
          }
        }
      }
    }
    spec.getMapGeneratorOptions().setEditable(false);
    spec.getGameOptions().setEditable(false);
    spec.getOptionGroup(Specification.DIFFICULTY_LEVELS).setEditable(false);
    this.getAIMain().findNewObjects(true);
    return serverGame;
  }
  /**
   * Generate an empty map in this server/game.
   *
   * Public for the map generator.
   *
   * @param width The map width.
   * @param height The map height.
   * @return The new empty {@code Map}.
   */
  generateEmptyMap(width: number, height: number): Map_ {
    return this.getMapGenerator().generateEmptyMap(this.getGame(), width, height, new LogBuilder()._LogBuilder(-1));
  }
  /**
   * Generate a new map in this server/game.
   *
   * @param generateEuropeanPlayerUnits If {@code true}, then the european player units are generated.
   * @return The {@code Map} that was created.
   */
  generateMap(generateEuropeanPlayerUnits: boolean): Map_ {
    let serverGame = this.getGame();
    let lb = new LogBuilder()._LogBuilder(256);
    let importFile = serverGame.getMapGeneratorOptions().getFile(MapGeneratorOptions.IMPORT_FILE);
    let importMap = null;
    if (importFile != null) {
      try {
        importMap = FreeColServer.readMap(importFile, serverGame.getSpecification());
      } catch ($e10) {
        if ($J.isa($e10, FreeColException) || $J.isa($e10, IOException) || $J.isa($e10, XMLStreamException)) {
          let ex = $J.exc($e10);
          FreeColServer.logger.log(Level.WARNING, 'Failed to import map: ' + importFile.getName(), ex);
        } else {
          throw $e10;
        }
      }
    }
    let ret = this.getMapGenerator().generateMap(serverGame, importMap, generateEuropeanPlayerUnits, lb);
    lb.shrink('\n');
    lb.log(FreeColServer.logger, Level.FINER);
    return ret;
  }
  /**
   * Make a new AI player and add it to the game.
   *
   * Public so the controller can add REF players.
   *
   * @param nation The {@code Nation} to add.
   * @return The new AI {@code ServerPlayer}.
   */
  makeAIPlayer(nation: Nation): ServerPlayer {
    let aiPlayer = new ServerPlayer()._ServerPlayer$Game$boolean$Nation(this.getGame(), false, nation);
    aiPlayer.setAI(true);
    aiPlayer.setReady(true);
    this.addAIConnection(aiPlayer);
    this.getGame().addPlayer(aiPlayer);
    this.getAIMain().setFreeColGameObject(aiPlayer.getId(), aiPlayer);
    return aiPlayer;
  }
  /**
   * Reveals or hides the entire map for all players.
   * Debug menu helper.
   *
   * @param reveal If true, reveal, if false, hide.
   */
  exploreMapForAllPlayers(reveal: boolean): void {
    let spec = this.getSpecification();
    for (const $it11 = this.getGame().getLiveEuropeanPlayerList([]).iterator(); $it11.hasNext(); ) {
      let p = $it11.next();
      (p).exploreMap(reveal);
    }
    if (reveal) {
      FreeColDebugger.setNormalGameFogOfWar(spec.getBoolean(GameOptions.FOG_OF_WAR));
      spec.setBoolean(GameOptions.FOG_OF_WAR, false);
    } else {
      spec.setBoolean(GameOptions.FOG_OF_WAR, FreeColDebugger.getNormalGameFogOfWar());
    }
    for (const $it12 = this.getGame().getLiveEuropeanPlayerList([]).iterator(); $it12.hasNext(); ) {
      let p = $it12.next();
      p.getConnection().sendReconnect();
    }
  }
  /**
   * Get a {@code ServerPlayer} by connection.
   *
   * @param conn The {@code Connection} to use while searching for a
   *     {@code ServerPlayer}.
   * @return The {@code ServerPlayer} found, or null if none.
   */
  getPlayer(conn: Connection): ServerPlayer {
    let connPred = CollectionUtils.matchKeyEquals$Object$Function(conn, ($p0) => $p0.getConnection());
    return this.getGame().getPlayer(connPred);
  }
  /**
   * Gets the AI player corresponding to a given player.
   *
   * @param player The {@code Player} to look up.
   * @return The corresponding AI player, or null if not found.
   */
  getAIPlayer(player: Player): AIPlayer {
    return this.getAIMain().getAIPlayer(player);
  }
  /**
   * Create a {@code ServerInfo} record for this server and connection.
   *
   * @return A suitable record.
   */
  getServerInfo(): ServerInfo {
    let absentAI = (p) => !p.isREF() && p.isAI() && !p.isConnected();
    let liveHuman = (p) => !p.isAI() && p.isConnected();
    let slots = CollectionUtils.count$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([]), absentAI);
    let players = CollectionUtils.count$Stream$Predicate(this.getGame().getLiveEuropeanPlayers([]), liveHuman);
    return new ServerInfo()._ServerInfo(this.getName(), this.getHost(), this.getPort(), slots, players, this.serverState === FreeColServer$ServerState.IN_GAME, FreeCol.getVersion(), this.getServerState().getMetaServerState());
  }
  /**
   * Register this FreeColServer with the meta-server.
   *
   * @return True if the meta-server was updated.
   */
  registerWithMetaServer(): boolean {
    if (!this.publicServer) {
      return true;
    }
    return MetaServerUtils.registerServer(this.getServerInfo());
  }
  /**
   * Removes this server from the meta-server.
   *
   * @return True if the meta-server was updated.
   */
  removeFromMetaServer(): boolean {
    if (!this.publicServer) {
      return false;
    }
    let ret = MetaServerUtils.removeServer(this.getServerInfo());
    return ret;
  }
  /**
   * Update this FreeColServer with the meta-server.
   *
   * @return True if the meta-server was updated.
   */
  updateMetaServer(): boolean {
    if (!this.publicServer) {
      return false;
    }
    let ret = MetaServerUtils.updateServer(this.getServerInfo());
    return ret;
  }
  static $clinit() {
    FreeColServer.logger = Logger.getLogger($J.cls(FreeColServer).getName());
  }
}

/**
 * The server is either starting, loading, being played, or ending.
 */
export class FreeColServer$ServerState extends JEnum {
  metaServerState: number = 0;
  static PRE_GAME: FreeColServer$ServerState = null;
  static LOAD_GAME: FreeColServer$ServerState = null;
  static IN_GAME: FreeColServer$ServerState = null;
  static END_GAME: FreeColServer$ServerState = null;
  static $VALUES: FreeColServer$ServerState[] = null;
  _FreeColServer$ServerState($name: string, $ordinal: number, metaServerState: number): this {
    this._JEnum($name, $ordinal);
    this.metaServerState = metaServerState;
    return this;
  }
  getMetaServerState(): number {
    return this.metaServerState;
  }
  static values(): FreeColServer$ServerState[] { return FreeColServer$ServerState.$VALUES.slice(); }
  static valueOf(name: string): FreeColServer$ServerState { return $J.enumValueOf(FreeColServer$ServerState, name); }
  static $clinit() {
    FreeColServer$ServerState.PRE_GAME = new FreeColServer$ServerState()._FreeColServer$ServerState('PRE_GAME', 0, 0);
    FreeColServer$ServerState.LOAD_GAME = new FreeColServer$ServerState()._FreeColServer$ServerState('LOAD_GAME', 1, 0);
    FreeColServer$ServerState.IN_GAME = new FreeColServer$ServerState()._FreeColServer$ServerState('IN_GAME', 2, 1);
    FreeColServer$ServerState.END_GAME = new FreeColServer$ServerState()._FreeColServer$ServerState('END_GAME', 3, 2);
    FreeColServer$ServerState.$VALUES = [FreeColServer$ServerState.PRE_GAME, FreeColServer$ServerState.LOAD_GAME, FreeColServer$ServerState.IN_GAME, FreeColServer$ServerState.END_GAME];
  }
}

$J.define(FreeColServer, 'net.sf.freecol.server.FreeColServer', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.io.FreeColSavegameFile,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String': '_FreeColServer$FreeColSavegameFile$Specification$InetAddress$int$String', 'boolean,boolean,net.sf.freecol.common.model.Specification,java.net.InetAddress,int,java.lang.String': '_FreeColServer$boolean$boolean$Specification$InetAddress$int$String', 'java.lang.String,java.net.InetAddress,int': '_FreeColServer$String$InetAddress$int' }, returns: { 'getServerInfo': 'net.sf.freecol.common.metaserver.ServerInfo', 'getIntegrity': 'net.sf.freecol.common.model.Constants$IntegrityType', 'getMapGenerator': 'net.sf.freecol.server.generator.MapGenerator', 'getAIMain': 'net.sf.freecol.server.ai.AIMain', 'getInGameController': 'net.sf.freecol.server.control.InGameController', 'getPreGameController': 'net.sf.freecol.server.control.PreGameController', 'getInputHandler': 'net.sf.freecol.server.control.ServerInputHandler', 'getController': 'net.sf.freecol.server.control.Controller', 'getUserConnectionHandler': 'net.sf.freecol.server.control.UserConnectionHandler', 'getServerState': 'net.sf.freecol.server.FreeColServer$ServerState', 'getPort': 'int', 'getHost': 'java.lang.String', 'getServer': 'net.sf.freecol.server.networking.Server', 'getSpecification': 'net.sf.freecol.common.model.Specification', 'getGame': 'net.sf.freecol.server.model.ServerGame', 'getServerRandom': 'java.util.Random', 'getSinglePlayer': 'boolean', 'getPublicServer': 'boolean', 'getName': 'java.lang.String' }, meths: { 'loadGame(net.sf.freecol.common.io.FreeColSavegameFile,net.sf.freecol.common.model.Specification)': 'loadGame$FreeColSavegameFile$Specification$FreeColServer', 'readGame(net.sf.freecol.common.io.FreeColSavegameFile,net.sf.freecol.common.model.Specification,net.sf.freecol.server.FreeColServer)': 'readGame$FreeColSavegameFile$Specification$FreeColServer', 'readGame(java.io.File,net.sf.freecol.common.model.Specification,net.sf.freecol.server.FreeColServer)': 'readGame$File$Specification$FreeColServer', 'loadGame(net.sf.freecol.common.io.FreeColSavegameFile)': 'loadGame$FreeColSavegameFile', 'saveGame(java.io.File,java.lang.String,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit,java.awt.image.BufferedImage)': 'saveGame$File$String$OptionGroup$Unit$BufferedImage$FreeColServer', 'saveGame(java.io.File,net.sf.freecol.common.option.OptionGroup,net.sf.freecol.common.model.Unit)': 'saveGame$File$OptionGroup$Unit', 'sendToAll(net.sf.freecol.common.networking.Message,net.sf.freecol.common.model.Player)': 'sendToAll$Message$Player', 'sendToAll(net.sf.freecol.common.networking.Message,net.sf.freecol.common.networking.Connection)': 'sendToAll$Message$Connection$FreeColServer' }, clinit: true, lazy: ['logger'] });
$J.define(FreeColServer$ServerState, 'net.sf.freecol.server.FreeColServer$ServerState', { kind: 'enum', sup: 'java.lang.Enum', ctors: { 'int': '_FreeColServer$ServerState' }, returns: { 'getMetaServerState': 'int' }, clinit: true, lazy: ['$VALUES', 'PRE_GAME', 'LOAD_GAME', 'IN_GAME', 'END_GAME'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  FreeColSeed = $J.load('net.sf.freecol.common.FreeColSeed');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  FreeColSavegameFile = $J.load('net.sf.freecol.common.io.FreeColSavegameFile');
  FreeColXMLReader$ReadScope = $J.load('net.sf.freecol.common.io.FreeColXMLReader$ReadScope');
  FreeColXMLWriter = $J.load('net.sf.freecol.common.io.FreeColXMLWriter');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  MetaServerUtils = $J.load('net.sf.freecol.common.metaserver.MetaServerUtils');
  ServerInfo = $J.load('net.sf.freecol.common.metaserver.ServerInfo');
  Constants$IntegrityType = $J.load('net.sf.freecol.common.model.Constants$IntegrityType');
  Game = $J.load('net.sf.freecol.common.model.Game');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  NationOptions$NationState = $J.load('net.sf.freecol.common.model.NationOptions$NationState');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Specification = $J.load('net.sf.freecol.common.model.Specification');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  Tension = $J.load('net.sf.freecol.common.model.Tension');
  Tension$Level = $J.load('net.sf.freecol.common.model.Tension$Level');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  Connection = $J.load('net.sf.freecol.common.networking.Connection');
  GameStateMessage = $J.load('net.sf.freecol.common.networking.GameStateMessage');
  LogoutMessage = $J.load('net.sf.freecol.common.networking.LogoutMessage');
  TrivialMessage = $J.load('net.sf.freecol.common.networking.TrivialMessage');
  VacantPlayersMessage = $J.load('net.sf.freecol.common.networking.VacantPlayersMessage');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  MapGeneratorOptions = $J.load('net.sf.freecol.common.option.MapGeneratorOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
  AIInGameInputHandler = $J.load('net.sf.freecol.server.ai.AIInGameInputHandler');
  AIMain = $J.load('net.sf.freecol.server.ai.AIMain');
  InGameController = $J.load('net.sf.freecol.server.control.InGameController');
  PreGameController = $J.load('net.sf.freecol.server.control.PreGameController');
  ServerInputHandler = $J.load('net.sf.freecol.server.control.ServerInputHandler');
  UserConnectionHandler = $J.load('net.sf.freecol.server.control.UserConnectionHandler');
  SimpleMapGenerator = $J.load('net.sf.freecol.server.generator.SimpleMapGenerator');
  ServerGame = $J.load('net.sf.freecol.server.model.ServerGame');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
  Session = $J.load('net.sf.freecol.server.model.Session');
  DummyConnection = $J.load('net.sf.freecol.server.networking.DummyConnection');
  Server = $J.load('net.sf.freecol.server.networking.Server');
});
