// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/server/control/PreGameController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Level, Logger, RuntimeException } from '../../../../../../jre/index.ts';
import { Controller } from './Controller.ts';

let FreeColException, StringTemplate, ChangeSet, ReadyMessage, SetAvailableMessage, SetColorMessage, SetNationMessage, SetNationTypeMessage, UpdateGameOptionsMessage, UpdateMapGeneratorOptionsMessage, VacantPlayersMessage;

/**
 * The control object that is responsible for setting parameters and
 * starting a new game.
 *
 * The game enters the state
 * {@link net.sf.freecol.server.FreeColServer.ServerState#IN_GAME}, when the
 *  has successfully been invoked.
 */
export class PreGameController extends Controller {
  static logger: Logger = null;
  /**
   * Is the game launching yet.
   */
  launching: boolean = false;
  /**
   * The constructor to use.
   *
   * @param freeColServer The main {@code FreeColServer} object.
   */
  _PreGameController(freeColServer: FreeColServer): this {
    this._Controller(freeColServer);
    this.launching = false;
    return this;
  }
  /**
   * Set the launching state.
   *
   * @param launching The new launching state.
   * @return The former launching state.
   */
  setLaunching(launching: boolean): boolean {
    let old = this.launching;
    this.launching = launching;
    return old;
  }
  /**
   * A player changes its readiness.
   *
   * @param serverPlayer The {@code ServerPlayer} that changes its state.
   * @param ready The new readiness.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  ready(serverPlayer: ServerPlayer, ready: boolean): ChangeSet {
    serverPlayer.setReady(ready);
    this.getFreeColServer().sendToAll$Message$Player(new ReadyMessage()._ReadyMessage$Player$boolean(serverPlayer, ready), serverPlayer);
    return null;
  }
  /**
   * Launch the game if possible.
   *
   * @param serverPlayer The {@code ServerPlayer} that requested launching.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  requestLaunch(serverPlayer: ServerPlayer): ChangeSet {
    PreGameController.logger.info('Launching for ' + $J.str(serverPlayer));
    if (this.setLaunching(true)) {
      PreGameController.logger.warning('Already launching');
      return null;
    }
    let freeColServer = this.getFreeColServer();
    let game = this.getGame();
    let spec = game.getSpecification();
    if (!serverPlayer.isAdmin()) {
      this.setLaunching(false);
      return serverPlayer.clientError$StringTemplate(StringTemplate.template$String('server.onlyAdminCanLaunch'));
    }
    serverPlayer.setReady(true);
    let players = game.getLivePlayerList([]);
    let nations = new ArrayList(players.size());
    for (const $it0 = players.iterator(); $it0.hasNext(); ) {
      let p = $it0.next();
      let nation = spec.getNation(p.getNationId());
      if (nations.contains(nation)) {
        this.setLaunching(false);
        return serverPlayer.clientError$StringTemplate(StringTemplate.template$String('server.invalidPlayerNations'));
      }
      nations.add(nation);
    }
    if (!game.allPlayersReadyToLaunch()) {
      this.setLaunching(false);
      return serverPlayer.clientError$StringTemplate(StringTemplate.template$String('server.notAllReady'));
    }
    try {
      freeColServer.startGame();
    } catch ($e1) {
      if ($J.isa($e1, FreeColException) || $J.isa($e1, RuntimeException)) {
        let fce = $J.exc($e1);
        PreGameController.logger.log(Level.WARNING, 'Exception while trying to start the game', fce);
        return serverPlayer.clientError$String(fce.getMessage());
      } else {
        throw $e1;
      }
    }
    return null;
  }
  /**
   * Handle a player changing its availability.
   *
   * @param serverPlayer The {@code ServerPlayer} that changed.
   * @param nation The changed {@code Nation}.
   * @param state The new {@code NationState}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setAvailable(serverPlayer: ServerPlayer, nation: Nation, state: NationOptions$NationState): ChangeSet {
    this.getGame().getNationOptions().setNationState(nation, state);
    this.getFreeColServer().sendToAll$Message$Player(new SetAvailableMessage()._SetAvailableMessage$Nation$NationState(nation, state), serverPlayer);
    return null;
  }
  /**
   * Handle a player changing its color.
   *
   * @param serverPlayer The {@code ServerPlayer} that changed.
   * @param nation The changed {@code Nation}.
   * @param color The new {@code Color}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setColor(serverPlayer: ServerPlayer, nation: Nation, color: Color): ChangeSet {
    nation.setColor(color);
    this.getFreeColServer().sendToAll$Message$Player(new SetColorMessage()._SetColorMessage$Nation$Color(nation, color), serverPlayer);
    return null;
  }
  /**
   * Handle a player changing its nation.
   *
   * @param serverPlayer The {@code ServerPlayer} that changed.
   * @param nation The changed {@code Nation}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setNation(serverPlayer: ServerPlayer, nation: Nation): ChangeSet {
    serverPlayer.setNation(nation);
    this.getFreeColServer().sendToAll$Message$Player(new SetNationMessage()._SetNationMessage$Player$Nation(serverPlayer, nation), serverPlayer);
    return null;
  }
  /**
   * Handle a player changing its nation type.
   *
   * @param serverPlayer The {@code ServerPlayer} that changed.
   * @param nationType The changed {@code NationType}.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  setNationType(serverPlayer: ServerPlayer, nationType: NationType): ChangeSet {
    serverPlayer.changeNationType(nationType);
    this.getFreeColServer().sendToAll$Message$Player(new SetNationTypeMessage()._SetNationTypeMessage$Player$NationType(serverPlayer, nationType), serverPlayer);
    return null;
  }
  /**
   * Handle a player changing its game options.
   *
   * @param serverPlayer The {@code ServerPlayer} that changed.
   * @param options The new {@code OptionGroup} containing the game options.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  updateGameOptions(serverPlayer: ServerPlayer, options: OptionGroup): ChangeSet {
    let fcs = this.getFreeColServer();
    let game = fcs.getGame();
    let spec = game.getSpecification();
    if (!spec.mergeGameOptions(options, 'server')) {
      return serverPlayer.clientError$String('Game option merge failed');
    }
    fcs.sendToAll$Message$Player(new UpdateGameOptionsMessage()._UpdateGameOptionsMessage$OptionGroup(spec.getGameOptions()), serverPlayer);
    return null;
  }
  /**
   * Handle a player changing its map generator options.
   *
   * @param serverPlayer The {@code ServerPlayer} that changed.
   * @param options The new {@code OptionGroup} containing the map
   *     generator options.
   * @return A {@code ChangeSet} encapsulating this action.
   */
  updateMapGeneratorOptions(serverPlayer: ServerPlayer, options: OptionGroup): ChangeSet {
    let fcs = this.getFreeColServer();
    let game = fcs.getGame();
    let spec = game.getSpecification();
    if (!spec.mergeMapGeneratorOptions(options, 'server')) {
      return serverPlayer.clientError$String('Map option merge failed');
    }
    fcs.sendToAll$Message$Player(new UpdateMapGeneratorOptionsMessage()._UpdateMapGeneratorOptionsMessage$OptionGroup(spec.getMapGeneratorOptions()), serverPlayer);
    return null;
  }
  /**
   * Handle a request for vacant players.
   *
   * @return A {@code ChangeSet} encapsulating this action.
   */
  vacantPlayers(): ChangeSet {
    return ChangeSet.simpleChange$Player$Message(null, new VacantPlayersMessage()._VacantPlayersMessage$().setVacantPlayers(this.getFreeColServer().getGame()));
  }
  static $clinit() {
    PreGameController.logger = Logger.getLogger($J.cls(PreGameController).getName());
  }
}

$J.define(PreGameController, 'net.sf.freecol.server.control.PreGameController', { kind: 'class', sup: 'net.sf.freecol.server.control.Controller', ctors: { 'net.sf.freecol.server.FreeColServer': '_PreGameController' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ChangeSet = $J.load('net.sf.freecol.common.networking.ChangeSet');
  ReadyMessage = $J.load('net.sf.freecol.common.networking.ReadyMessage');
  SetAvailableMessage = $J.load('net.sf.freecol.common.networking.SetAvailableMessage');
  SetColorMessage = $J.load('net.sf.freecol.common.networking.SetColorMessage');
  SetNationMessage = $J.load('net.sf.freecol.common.networking.SetNationMessage');
  SetNationTypeMessage = $J.load('net.sf.freecol.common.networking.SetNationTypeMessage');
  UpdateGameOptionsMessage = $J.load('net.sf.freecol.common.networking.UpdateGameOptionsMessage');
  UpdateMapGeneratorOptionsMessage = $J.load('net.sf.freecol.common.networking.UpdateMapGeneratorOptionsMessage');
  VacantPlayersMessage = $J.load('net.sf.freecol.common.networking.VacantPlayersMessage');
});
