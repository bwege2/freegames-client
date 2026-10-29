// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/networking/LoginMessage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collectors, JString } from '../../../../../../jre/index.ts';
import { ObjectMessage } from './ObjectMessage.ts';

let FreeCol, FreeColXMLWriter$WriteScope, Game, StringTemplate, ChangeSet, ChangeSet$See, Message$MessagePriority, CollectionUtils, FreeColServer, FreeColServer$ServerState, ServerPlayer;

/**
 * The message sent when logging in.
 */
export class LoginMessage extends ObjectMessage {
  static readonly TAG: string = 'login';
  static readonly CURRENT_PLAYER_TAG: string = 'currentPlayer';
  static readonly SINGLE_PLAYER_TAG: string = 'singlePlayer';
  static readonly STATE_TAG: string = 'state';
  static readonly USER_NAME_TAG: string = 'userName';
  static readonly NATION_ID_TAG: string = 'nationId';
  static readonly VERSION_TAG: string = 'version';
  /**
   * The player in the attached game, if any.
   */
  player: Player = null;
  $init_LoginMessage() {
    this.player = null;
  }
  /**
   * Create a new {@code LoginMessage} with the supplied parameters.
   *
   * @param player The {@code player} to send to.
   * @param userName The name of the user logging in.
   * @param nationId The nationId when the client is selecting a player. 
   * @param version The version of FreeCol at the client.
   * @param state The server state.
   * @param singlePlayer True in single player games.
   * @param currentPlayer True if this player is the current player.
   * @param game The entire game.
   */
  _LoginMessage$Player$String$String$String$ServerState$boolean$boolean$Game(player: Player, userName: string, nationId: string, version: string, state: FreeColServer$ServerState, singlePlayer: boolean, currentPlayer: boolean, game: Game): this {
    this._ObjectMessage$String$StringArr(LoginMessage.TAG, [LoginMessage.USER_NAME_TAG, userName, LoginMessage.NATION_ID_TAG, nationId, LoginMessage.VERSION_TAG, version, LoginMessage.SINGLE_PLAYER_TAG, String(singlePlayer), LoginMessage.CURRENT_PLAYER_TAG, String(currentPlayer)]);
    this.$init_LoginMessage();
    this.player = player;
    if (state != null) {
      this.setStringAttribute(LoginMessage.STATE_TAG, state.toString());
    }
    this.appendChild(game);
    return this;
  }
  /**
   * Create a new {@code LoginMessage} from a stream.
   *
   * @param ignoredGame A {@code Game} (not actually used, the
   *     actual game is read from the stream).
   * @param xr The {@code FreeColXMLReader} to read the message from.
   * @exception XMLStreamException if there is a problem reading the stream.
   */
  _LoginMessage$Game$FreeColXMLReader(ignoredGame: Game, xr: FreeColXMLReader): this {
    this._ObjectMessage$String$FreeColXMLReader$StringArr(LoginMessage.TAG, xr, [LoginMessage.USER_NAME_TAG, LoginMessage.NATION_ID_TAG, LoginMessage.VERSION_TAG, LoginMessage.STATE_TAG, LoginMessage.SINGLE_PLAYER_TAG, LoginMessage.CURRENT_PLAYER_TAG]);
    this.$init_LoginMessage();
    let game = null;
    while (xr.moreTags()) {
      let tag = xr.getLocalName();
      if ($J.equals(Game.TAG, tag)) {
        game = new Game()._Game$Game$FreeColXMLReader(null, xr);
      } else {
        this.expected(Game.TAG, tag);
      }
    }
    xr.expectTag(LoginMessage.TAG);
    this.appendChild(game);
    this.player = (game == null) ? null : this.getPlayer(game);
    return this;
  }
  getUserName(): string {
    return this.getStringAttribute(LoginMessage.USER_NAME_TAG);
  }
  getNationId(): string {
    return this.getStringAttribute(LoginMessage.NATION_ID_TAG);
  }
  getVersion(): string {
    return this.getStringAttribute(LoginMessage.VERSION_TAG);
  }
  getState(): FreeColServer$ServerState {
    return this.getEnumAttribute(LoginMessage.STATE_TAG, $J.cls(FreeColServer$ServerState), null);
  }
  getSinglePlayer(): boolean {
    return this.getBooleanAttribute(LoginMessage.SINGLE_PLAYER_TAG, false);
  }
  getCurrentPlayer(): boolean {
    return this.getBooleanAttribute(LoginMessage.CURRENT_PLAYER_TAG, false);
  }
  getGame(): Game {
    return this.getChild(0, $J.cls(Game));
  }
  /**
   * Get the player (if any) with the current name in a given game.
   *
   * @param game The {@code Game} to look up.
   * @return The {@code ServerPlayer} found.
   */
  getPlayer(game: Game): Player {
    let playerByUsername = game.getPlayerByName(this.getUserName());
    if (playerByUsername != null) {
      return playerByUsername;
    }
    return game.getPlayerByNationId(this.getNationId());
  }
  /**
   * {@inheritDoc}
   */
  getPriority(): Message$MessagePriority {
    return Message$MessagePriority.EARLY;
  }
  /**
   * {@inheritDoc}
   */
  clientHandler(freeColClient: FreeColClient): void {
    let game = this.getGame();
    freeColClient.getConnectController().login(this.getState(), game, this.getUserName(), this.getSinglePlayer(), this.getCurrentPlayer());
  }
  /**
   * {@inheritDoc}
   */
  toXML(xw: FreeColXMLWriter): void {
    let ws = null;
    if (this.player != null) {
      ws = xw.replaceScope(FreeColXMLWriter$WriteScope.toClient(this.player));
    }
    super.toXML(xw);
    if (this.player != null) {
      xw.replaceScope(ws);
    }
  }
  /**
   * Handle login to a completely new game.
   *
   * @param freeColServer The {@code FreeColServer} to log into.
   * @param connection The incoming {@code Connection} that is logging in.
   * @return A {@code ChangeSet} with the result.
   */
  preGameLogin(freeColServer: FreeColServer, connection: Connection): ChangeSet {
    let userName = this.getUserName();
    let serverGame: ServerGame;
    let present: Player;
    let nation: Nation;
    let ret: ChangeSet;
    if ((serverGame = freeColServer.waitForGame()) == null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.timeOut'));
    } else if ((nation = serverGame.getVacantNation()) == null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.maximumPlayers'));
    } else if ((present = this.getPlayer(serverGame)) != null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.userNameInUse').addName$String$String('%name%', userName));
    } else {
      let serverPlayer = new ServerPlayer()._ServerPlayer$Game$Connection(serverGame, connection);
      serverPlayer.initialize(serverGame, serverGame.getLivePlayerList([]).isEmpty(), nation);
      serverPlayer.setName(userName);
      ret = new ChangeSet()._ChangeSet$();
      serverGame.addPlayer(serverPlayer);
      ret.addNewPlayer(serverPlayer);
      if (serverGame.getCurrentPlayer() == null) {
        serverGame.setCurrentPlayer(serverPlayer);
      }
      let conn = serverPlayer.getConnection();
      freeColServer.addPlayerConnection(conn);
      conn.setWriteScope(FreeColXMLWriter$WriteScope.toClient(serverPlayer));
      ret.add$See$Message(ChangeSet$See.only(serverPlayer), new LoginMessage()._LoginMessage$Player$String$String$String$ServerState$boolean$boolean$Game(serverPlayer, userName, serverPlayer.getNationId(), this.getVersion(), freeColServer.getServerState(), freeColServer.getSinglePlayer(), serverGame.getCurrentPlayer() === serverPlayer, serverGame));
      serverGame.sendToOthers(serverPlayer, ret);
    }
    return ret;
  }
  /**
   * Handle login that loads an existing game.
   *
   * @param freeColServer The {@code FreeColServer} to log into.
   * @param connection The incoming {@code Connection} that is logging in.
   * @return A {@code ChangeSet} with the result.
   */
  loadGameLogin(freeColServer: FreeColServer, connection: Connection): ChangeSet {
    let userName = this.getUserName();
    let serverGame: ServerGame;
    let present: Player;
    let ret: ChangeSet;
    if ($J.equals(FreeColServer.MAP_EDITOR_NAME, userName)) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('error.mapEditorGame'));
    } else if ((serverGame = freeColServer.getGame()) == null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.noSuchGame'));
    } else if ((present = this.getPlayer(serverGame)) == null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.userNameNotPresent').addName$String$String('%name%', userName).addName$String$String('%names%', CollectionUtils.transform$Stream$Predicate$Function$Collector(serverGame.getLiveEuropeanPlayers([]), CollectionUtils.alwaysTrue(), ($p0) => $p0.getName(), Collectors.joining(', '))));
    } else if (present.isConnected()) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.userNameInUse').addName$String$String('%name%', userName));
    } else if (present.isAI()) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.userNameInUse').addName$String$String('%name%', userName));
    } else {
      present.setConnection(connection);
      if (serverGame.getCurrentPlayer() == null) {
        serverGame.setCurrentPlayer(present);
      }
      freeColServer.addPlayerConnection(connection);
      connection.setWriteScope(FreeColXMLWriter$WriteScope.toClient(present));
      ret = ChangeSet.simpleChange$Player$Message(present, new LoginMessage()._LoginMessage$Player$String$String$String$ServerState$boolean$boolean$Game(present, userName, present.getNationId(), this.getVersion(), freeColServer.getServerState(), freeColServer.getSinglePlayer(), serverGame.getCurrentPlayer() === present, serverGame));
    }
    return ret;
  }
  /**
   * Handle login to a running game.
   *
   * @param freeColServer The {@code FreeColServer} to log into.
   * @param connection The incoming {@code Connection} that is logging in.
   * @return A {@code ChangeSet} with the result.
   */
  inGameLogin(freeColServer: FreeColServer, connection: Connection): ChangeSet {
    let userName = this.getUserName();
    let serverGame: ServerGame;
    let present: Player;
    let ret: ChangeSet;
    if ((serverGame = freeColServer.getGame()) == null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.noSuchGame'));
    } else if ((present = this.getPlayer(serverGame)) == null) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.userNameNotPresent').addName$String$String('%name%', userName).addName$String$String('%names%', CollectionUtils.transform$Stream$Predicate$Function$Collector(serverGame.getLiveEuropeanPlayers([]), CollectionUtils.alwaysTrue(), ($p0) => $p0.getName(), Collectors.joining(', '))));
    } else if (!present.isAI() && present.isConnected()) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.userNameInUse').addName$String$String('%name%', userName));
    } else {
      if (present.isAI()) {
        serverGame.changeAI(present, false);
      }
      present.setName(userName);
      present.setConnection(connection);
      freeColServer.addPlayerConnection(connection);
      connection.setWriteScope(FreeColXMLWriter$WriteScope.toClient(present));
      ret = ChangeSet.simpleChange$Player$Message(present, new LoginMessage()._LoginMessage$Player$String$String$String$ServerState$boolean$boolean$Game(present, userName, present.getNationId(), this.getVersion(), freeColServer.getServerState(), freeColServer.getSinglePlayer(), serverGame.getCurrentPlayer() === present, serverGame));
    }
    return ret;
  }
  /**
   * Special purpose handler for the UserConnectionHandler.
   *
   * @param freeColServer The server to connect to.
   * @param connection The incoming {@code Connection}.
   * @return A {@code ChangeSet} encapsulating the login.
   */
  loginHandler(freeColServer: FreeColServer, connection: Connection): ChangeSet {
    let userName = this.getUserName();
    let version = this.getVersion();
    let ret: ChangeSet;
    if (userName == null || (userName.length === 0)) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.missingUserName'));
    } else if (version == null || (version.length === 0)) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.missingVersion'));
    } else if (!$J.equals(version, FreeCol.getVersion())) {
      ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.wrongFreeColVersion').addName$String$String('%clientVersion%', version).addName$String$String('%serverVersion%', FreeCol.getVersion()));
    } else {
      switch (freeColServer.getServerState()) {
        case FreeColServer$ServerState.PRE_GAME:
          ret = this.preGameLogin(freeColServer, connection);
          break;
        case FreeColServer$ServerState.LOAD_GAME:
          ret = this.loadGameLogin(freeColServer, connection);
          break;
        case FreeColServer$ServerState.IN_GAME:
          ret = this.inGameLogin(freeColServer, connection);
          break;
        case FreeColServer$ServerState.END_GAME:
        default:
          ret = ChangeSet.clientError$Player$StringTemplate(null, StringTemplate.template$String('server.couldNotLogin'));
          break;
      }
    }
    return ret;
  }
}

$J.define(LoginMessage, 'net.sf.freecol.common.networking.LoginMessage', { kind: 'class', sup: 'net.sf.freecol.common.networking.ObjectMessage', ctors: { 'net.sf.freecol.common.model.Game,net.sf.freecol.common.io.FreeColXMLReader': '_LoginMessage$Game$FreeColXMLReader', 'net.sf.freecol.common.model.Player,java.lang.String,java.lang.String,java.lang.String,net.sf.freecol.server.FreeColServer$ServerState,boolean,boolean,net.sf.freecol.common.model.Game': '_LoginMessage$Player$String$String$String$ServerState$boolean$boolean$Game' }, returns: { 'getPriority': 'net.sf.freecol.common.networking.Message$MessagePriority', 'getGame': 'net.sf.freecol.common.model.Game', 'getCurrentPlayer': 'boolean', 'getSinglePlayer': 'boolean', 'getState': 'net.sf.freecol.server.FreeColServer$ServerState', 'getVersion': 'java.lang.String', 'getNationId': 'java.lang.String', 'getUserName': 'java.lang.String' } });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  Game = $J.load('net.sf.freecol.common.model.Game');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ChangeSet$See = $J.load('net.sf.freecol.common.networking.ChangeSet$See');
  Message$MessagePriority = $J.load('net.sf.freecol.common.networking.Message$MessagePriority');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  FreeColServer = $J.load('net.sf.freecol.server.FreeColServer');
  FreeColServer$ServerState = $J.load('net.sf.freecol.server.FreeColServer$ServerState');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
});
