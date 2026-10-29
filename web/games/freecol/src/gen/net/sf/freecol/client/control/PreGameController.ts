// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/PreGameController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, Thread } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from './FreeColClientHolder.ts';

let SwingUtilities, FreeCol, ClientOptions, FreeColDebugger, FreeColDebugger$DebugMode, Messages, FreeColDirectories, Game, StringTemplate, ResourceManager, Utils;

/**
 * The controller that will be used before the game starts.
 */
export class PreGameController extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _PreGameController(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    return this;
  }
  /**
   * Handle an addPlayer message.
   *
   * @param players The {@code Player}s to add.
   */
  addPlayerHandler(players: List<Player>): void {
    this.getGame().addPlayers(players);
    this.getFreeColClient().getGUI().refreshPlayersTable();
  }
  /**
   * Sends a chat message.
   *
   * @param message The text of the message.
   */
  sendChat(message: string): void {
    let player = this.getMyPlayer();
    this.askServer().chat(player, message);
  }
  /**
   * Display a chat message.
   *
   * @param sender The sender of the chat message.
   * @param message What to say.
   * @param color The message color.
   * @param pri If true, the message is private.
   */
  chatHandler(sender: string, message: string, color: Color, pri: boolean): void {
    this.getGUI().displayStartChat(sender, message, pri);
  }
  /**
   * Handle an error.
   *
   * @param template A {@code StringTemplate} describing the error.
   * @param message A backup string describing the error.
   */
  errorHandler(template: StringTemplate, message: string): void {
    this.getGUI().showErrorPanel$StringTemplate$String(template, message);
  }
  /**
   * Handle a player logging out.
   *
   * @param player The {@code Player} that is logging out.
   * @param reason The {@code LogoutReason} why the player left.
   */
  logoutHandler(player: Player, reason: Game$LogoutReason): void {
    let freeColClient = this.getFreeColClient();
    this.getGame().removePlayer(player);
    this.getGUI().refreshPlayersTable();
    if (player === this.getMyPlayer()) {
      freeColClient.getConnectController().logout(reason);
    }
  }
  /**
   * Handle a ready message.
   *
   * @param player The {@code Player} whose readiness changed.
   * @param ready The new readiness state.
   */
  readyHandler(player: Player, ready: boolean): void {
    player.setReady(ready);
    this.getGUI().refreshPlayersTable();
  }
  /**
   * Requests the game to be started.  This will only be successful
   * if all players are ready to start the game.
   */
  requestLaunch(): void {
    if (this.getGame().allPlayersReadyToLaunch()) {
      this.getGUI().showStatusPanel(Messages.message$String('status.startingGame'));
      this.askServer().requestLaunch();
    } else {
      this.getGUI().showErrorPanel$StringTemplate(StringTemplate.template$String('server.notAllReady'));
    }
  }
  /**
   * Sets a nation's state.
   *
   * @param nation The {@code Nation} to set.
   * @param state The {@code NationState} value to set.
   */
  setAvailable(nation: Nation, state: NationOptions$NationState): void {
    this.getGame().getNationOptions().getNations().put(nation, state);
    this.askServer().setAvailable(nation, state);
  }
  /**
   * Handle a setAvailable message.
   *
   * @param nation The {@code Nation} to set.
   * @param nationState The {@code NationState} value to set.
   */
  setAvailableHandler(nation: Nation, nationState: NationOptions$NationState): void {
    this.getGame().getNationOptions().setNationState(nation, nationState);
  }
  /**
   * Sets a nation's colour.
   *
   * @param nation The {@code Nation} to set the color for.
   * @param color The {@code Color} to set.
   */
  setColor(nation: Nation, color: Color): void {
    nation.setColor(color);
    this.askServer().setColor(nation, color);
  }
  /**
   * Handle a setColor message.
   *
   * @param nation The {@code Nation} to set the color for.
   * @param color The {@code Color} to set.
   */
  setColorHandler(nation: Nation, color: Color): void {
    nation.setColor(color);
  }
  /**
   * Sets this client's player's nation.
   *
   * @param nation Which {@code Nation} this player wishes to set.
   */
  setNation(nation: Nation): void {
    this.getMyPlayer().setNation(nation);
    this.askServer().setNation(nation);
  }
  /**
   * Sets this client's player's nation type.
   *
   * @param nationType Which nation type this player wishes to set.
   */
  setNationType(nationType: NationType): void {
    this.getMyPlayer().changeNationType(nationType);
    this.askServer().setNationType(nationType);
  }
  /**
   * Handle a nation type change.
   *
   * @param nationType Which nation type this player wishes to set.
   */
  setNationTypeHandler(nationType: NationType): void {
    this.getMyPlayer().changeNationType(nationType);
  }
  /**
   * Sets this client to be (or not be) ready to start the game.
   *
   * @param ready Indicates whether or not this client is ready to
   *     start the game.
   */
  setReady(ready: boolean): void {
    this.getMyPlayer().setReady(ready);
    this.askServer().setReady(ready);
  }
  /**
   * Handle starting the game.
   *
   * Wait until map is received from server (sometimes a startGame
   * message arrives arrives when map is still null).  Make sure we
   * do this in a new thread so as not to block the input handler
   * from receiving the map!
   */
  startGameHandler(): void {
    let fcc = this.getFreeColClient();
    let gui = this.getGUI();
    (new (PreGameController$1())().$o(this).$c(fcc, gui)._Thread(FreeCol.CLIENT_THREAD + 'Starting game')).start();
  }
  /**
   * Internal start of the game.
   *
   * @return True if the player should continue, false if we are in
   *     a debug run and should be skipping turns.
   */
  startGameInternal(): boolean {
    let fcc = this.getFreeColClient();
    let player = this.getMyPlayer();
    let gui = this.getGUI();
    gui.closeMainPanel();
    gui.closeMenus();
    gui.closeStatusPanel();
    gui.playSound(null);
    gui.playSound('sound.intro.' + player.getNationId());
    let defaultPlaylist = ResourceManager.getAudioResource('sound.music.playlist.default', true);
    if (defaultPlaylist != null) {
      this.getFreeColClient().getSoundController().setDefaultPlaylist(defaultPlaylist.getAllAudio());
    }
    fcc.changeClientState(true);
    fcc.restoreGUI(player);
    let co = this.getClientOptions();
    if (player.isAdmin() && co.getBoolean(ClientOptions.AUTOSAVE_DELETE)) {
      let logMe = FreeColDirectories.removeAutosaves(co.getText(ClientOptions.AUTO_SAVE_PREFIX));
      if (logMe != null) {
        PreGameController.logger.info(logMe);
      }
    }
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS) && FreeColDebugger.getDebugRunTurns() > 0) {
      fcc.skipTurns(FreeColDebugger.getDebugRunTurns());
      return false;
    }
    if (this.getGame().getTurn().getNumber() === 1) {
      player.addStartGameMessage();
    }
    this.igc().nextModelMessage();
    return true;
  }
  /**
   * Handles an update.
   *
   * @param objects The {@code FreeColObject}s to update.
   */
  updateHandler(objects: List<FreeColObject>): void {
    let game = this.getGame();
    for (const $it0 = objects.iterator(); $it0.hasNext(); ) {
      let fco = $it0.next();
      if (fco instanceof Game) {
        if (game.preGameUpdate(fco)) {
          let fcc = this.getFreeColClient();
          fcc.addSpecificationActions((fco).getSpecification());
        } else {
          PreGameController.logger.warning('Pre-game copy-in failed: ' + fco.getId());
        }
      } else {
        PreGameController.logger.warning('Game node expected: ' + fco.getId());
      }
    }
  }
  /**
   * Update the {@link GameOptions} at the server.
   * This method should be called after updating that object.
   */
  updateGameOptions(): void {
    let gameOptions = this.getGame().getGameOptions();
    this.getSpecification().clean('update game options (client initiated)');
    this.askServer().updateGameOptions(gameOptions);
  }
  /**
   * Handle new game options.
   *
   * @param gameOptions The {@code OptionGroup} containing the game options.
   */
  updateGameOptionsHandler(gameOptions: OptionGroup): void {
    if (!this.getSpecification().mergeGameOptions(gameOptions, 'client')) {
      PreGameController.logger.warning('Game option update failed');
    }
  }
  /**
   * Update the {@link MapGeneratorOptions} at the server.
   * This method should be called after updating that object.
   */
  updateMapGeneratorOptions(): void {
    let mgo = this.getGame().getMapGeneratorOptions();
    this.askServer().updateMapGeneratorOptions(mgo);
  }
  /**
   * Handle new map options.
   *
   * @param mapOptions An {@code OptionGroup} containing the map options.
   */
  updateMapGeneratorOptionsHandler(mapOptions: OptionGroup): void {
    if (!this.getSpecification().mergeMapGeneratorOptions(mapOptions, 'client')) {
      PreGameController.logger.warning('Map generator option update failed');
    }
  }
  static $clinit() {
    PreGameController.logger = Logger.getLogger($J.cls(PreGameController).getName());
  }
}

let $PreGameController$1: any = null;
/** An anonymous class (PreGameController.java:254). */
function PreGameController$1(): any {
  return $PreGameController$1 ??= $J.local(class extends Thread {
    run(): void {
      PreGameController.logger.info('Client starting game');
      for (let tries = 50; tries >= 0; tries--) {
        if (this.$cv_fcc.isReadyToStart()) {
          SwingUtilities.invokeLater(() => {
            this.$outer.startGameInternal();
          });
          return;
        }
        Utils.delay(200, 'StartGame has been interupted.');
      }
      let err = (this.$outer.getGame() == null) ? 'client.noGame' : 'client.noMap';
      this.$cv_gui.closeMainPanel();
      this.$cv_gui.closeMenus();
      this.$cv_gui.closeStatusPanel();
      this.$cv_gui.showMainPanel(Messages.message$StringTemplate(StringTemplate.template$String(err)));
    }
    $c($fcc, $gui): this {
      this.$cv_fcc = $fcc; this.$cv_gui = $gui;
      return this;
    }
  }, 'net.sf.freecol.client.control.PreGameController$1', []);
}

$J.define(PreGameController, 'net.sf.freecol.client.control.PreGameController', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_PreGameController' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  Game = $J.load('net.sf.freecol.common.model.Game');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
