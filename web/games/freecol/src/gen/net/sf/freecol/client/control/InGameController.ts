// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/control/InGameController.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Comparator, HashMap, IOException, IllegalStateException, JEnum, JFunction, JString, Level, Logger, NullPointerException, RuntimeException, SecurityException } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from './FreeColClientHolder.ts';

let FreeCol, ClientOptions, ChoiceItem, FreeColActionUI, FreeColException, DebugUtils, FreeColDebugger, FreeColDebugger$DebugMode, Messages, NameCache, FreeColDirectories, Ability, AbstractGoods, Colony, ColonyWas, Constants, Constants$ArmedUnitSettlementAction, Constants$ClaimAction, Constants$IndianDemandAction, Constants$MissionaryAction, Constants$ScoutColonyAction, Constants$ScoutIndianSettlementAction, Constants$TradeAction, Constants$TradeBuyAction, Constants$TradeSellAction, DiplomaticTrade, DiplomaticTrade$TradeContext, DiplomaticTrade$TradeStatus, Europe, Europe$MigrationType, EuropeWas, Game$LogoutReason, GoldTradeItem, HistoryEvent, IndianSettlement, LastSale, LostCityRumour$RumourType, Map_, MarketWas, ModelMessage, ModelMessage$MessageType, Modifier, Monarch$MonarchAction, NativeTrade$NativeTradeAction, NativeTradeItem, Ownable, Player, Player$NoClaimReason, Player$PlayerType, Settlement, Stance, StringTemplate, Tile, TradeRoute, Turn, Unit, Unit$MoveType, Unit$UnitLabelType, Unit$UnitState, UnitChangeType, UnitWas, GameOptions, CollectionUtils, Introspector, Introspector$IntrospectorException, LogBuilder, Utils;

/**
 * The controller that will be used while the game is played.
 */
export class InGameController extends FreeColClientHolder {
  static logger: Logger = null;
  static readonly UNIT_LAST_MOVE_DELAY: number = 300;
  /**
   * A template to use as a magic cookie for aborted trades.
   */
  static abortTrade: StringTemplate = null;
  /**
   * A comparator for ordering trade route units.
   */
  static tradeRouteUnitComparator: Comparator<Unit> = null;
  /**
   * Current mode for moving units.
   */
  moveMode: InGameController$MoveMode = null;
  /**
   * A map of messages to be ignored.
   */
  messagesToIgnore: JMap<string, number> = null;
  /**
   * The messages in the last turn report.
   */
  turnReportMessages: List<ModelMessage> = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _InGameController(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    this.moveMode = InGameController$MoveMode.NEXT_ACTIVE_UNIT;
    this.messagesToIgnore = Collections.synchronizedMap(new HashMap());
    this.turnReportMessages = new ArrayList();
    return this;
  }
  /**
   * Play a sound.
   *
   * @param soundKey The sound resource key.
   */
  sound(soundKey: string): void {
    this.getGUI().playSound(soundKey);
  }
  /**
   * Require that it is this client's player's turn.
   * Put up the notYourTurn message if not.
   *
   * @return True if it is our turn.
   */
  requireOurTurn(): boolean {
    if (this.currentPlayerIsMyPlayer()) {
      return true;
    }
    if (this.getFreeColClient().isInGame()) {
      this.showInformationPanel$FreeColObject$String$InGameController(null, 'info.notYourTurn');
    }
    return false;
  }
  /**
   * Convenience function to find an adjacent settlement.  Intended
   * to be called in contexts where we are expecting a settlement to
   * be there, such as when handling a particular move type.
   *
   * @param tile The {@code Tile} to start at.
   * @param direction The {@code Direction} to step.
   * @return A settlement on the adjacent tile if any.
   */
  getSettlementAt(tile: Tile, direction: Direction): Settlement {
    return tile.getNeighbourOrNull(direction).getSettlement();
  }
  /**
   * Convenience function to find the nation controlling an adjacent
   * settlement.  Intended to be called in contexts where we are
   * expecting a settlement or unit to be there, such as when
   * handling a particular move type.
   *
   * @param tile The {@code Tile} to start at.
   * @param direction The {@code Direction} to step.
   * @return The name of the nation controlling a settlement on the
   *         adjacent tile if any.
   */
  getNationAt(tile: Tile, direction: Direction): StringTemplate {
    let newTile = tile.getNeighbourOrNull(direction);
    let player = null;
    if (newTile.hasSettlement()) {
      player = newTile.getSettlement().getOwner();
    } else if (newTile.getFirstUnit() != null) {
      player = newTile.getFirstUnit().getOwner();
    } else {
      player = this.getGame().getUnknownEnemy();
    }
    return player.getNationLabel();
  }
  /**
   * Defer execution to the event thread.
   *
   * @param runnable The {@code Runnable} to run.
   */
  invokeLater(runnable: Runnable): void {
    this.getFreeColClient().getGUI().invokeNowOrLater(runnable);
  }
  /**
   * Wrapper for GUI.changeView.
   *
   * @param unit The {@code Unit} to select.
   * @param force Set true if the unit is the same, but *has*
   *     changed in some way (e.g. moves left).
   */
  changeView$Unit$boolean$InGameController(unit: Unit, force: boolean): void {
    this.invokeLater(() => this.getGUI().changeView$Unit$boolean(unit, force));
  }
  /**
   * Wrapper for GUI.changeView.
   *
   * @param tile An optional {@code Tile} to select.
   */
  changeView$Tile$InGameController(tile: Tile): void {
    this.invokeLater(() => {
      if (tile != null) {
        this.getGUI().changeView$Tile(tile);
      } else {
        this.getGUI().changeView$();
      }
    });
  }
  /**
   * Wrapper for GUI.displayChat.
   *
   * @param sender The sender of the chat message.
   * @param message What to say.
   * @param color The message color.
   * @param pri If true, the message is private.
   */
  displayChat(sender: string, message: string, color: Color, pri: boolean): void {
    this.invokeLater(() => this.getGUI().displayChat(sender, message, color, pri));
  }
  /**
   * Fire the changes for *Was objects.
   *
   * @param objs The *Was objects to fire changes for (nulls allowed).
   */
  fireChanges(objs: ObjectWas[]): void {
    this.invokeLater(() => {
      for (let o of objs) {
        if (o != null) {
          o.fireChanges();
        }
      }
    });
  }
  /**
   * Wrapper for GUI.showColonyPanel.
   *
   * @param colony The {@code Colony} to show.
   * @param unit An optional {@code Unit} to select within the panel.
   */
  showColonyPanel(colony: Colony, unit: Unit): void {
    this.invokeLater(() => {
      this.getGUI().showColonyPanel(colony, unit);
    });
  }
  /**
   * Display the colony panel for a colony, and select the unit that just
   * arrived there if it is a carrier.
   *
   * @param colony The {@code Colony} to display.
   * @param unit An optional {@code Unit} to select.
   */
  showColonyPanelWithCarrier(colony: Colony, unit: Unit): void {
    this.showColonyPanel(colony, (unit.isCarrier()) ? unit : null);
  }
  /**
   * Wrapper for GUI.showErrorPanel.
   *
   * @param template A {@code StringTemplate} to display.
   * @param message An extra non-i18n message to display if debugging.
   */
  error(template: StringTemplate, message: string): void {
    this.invokeLater(() => this.getGUI().showErrorPanel$StringTemplate$String(template, message));
  }
  /**
   * Wrapper for GUI.showEmigrationDialog
   *
   * @param player The {@code Player} who has migrating units.
   * @param foy True if this is a fountain of youth event.
   * @param n The number of migrants available.
   */
  showEmigrationDialog(player: Player, foy: boolean, n: number): void {
    this.invokeLater(() => this.getGUI().showEmigrationDialog(player, foy, (value) => {
      this.emigrate(player, Europe$MigrationType.convertToMigrantSlot(value), (n - 1) | 0, foy);
    }));
  }
  /**
   * Wrapper for GUI.showEventPanel.
   *
   * @param header The title.
   * @param imageKey A resource key for the image to display.
   * @param footer Optional footer text.
   */
  showEventPanel(header: string, imageKey: string, footer: string): void {
    this.invokeLater(() => this.getGUI().showEventPanel(header, imageKey, footer));
  }
  /**
   * Wrapper for GUI.showInformationPanel.
   *
   * @param disp An optional object to display in the panel.
   * @param messageId A message identifier.
   */
  showInformationPanel$FreeColObject$String$InGameController(disp: FreeColObject, messageId: string): void {
    this.showInformationPanel$FreeColObject$StringTemplate$InGameController(disp, StringTemplate.template$String(messageId));
  }
  /**
   * Wrapper for GUI.showInformationPanel.
   *
   * @param disp An optional object to display in the panel.
   * @param template A {@code StringTemplate} to display.
   */
  showInformationPanel$FreeColObject$StringTemplate$InGameController(disp: FreeColObject, template: StringTemplate): void {
    this.invokeLater(() => this.getGUI().showInformationPanel$FreeColObject$StringTemplate(disp, template));
  }
  /**
   * Wrapper for GUI.getMissionaryChoice
   *
   * @param unit The {@code Unit} that will enter the settlement.
   * @param is The {@code IndianSettlement} to check.
   * @param direction The {@code Direction} to move the unit.
   */
  getMissionaryChoice(unit: Unit, is$: IndianSettlement, direction: Direction): void {
    let player = unit.getOwner();
    let canEstablish = !is$.hasMissionary$();
    let canDenounce = !canEstablish && !is$.hasMissionary$Player(player);
    this.invokeLater(() => {
      let act = this.getGUI().getMissionaryChoice(unit, is$, canEstablish, canDenounce);
      if (act == null) {
        return;
      }
      {
        let enemy: Player;
        switch (act) {
          case Constants$MissionaryAction.MISSIONARY_ESTABLISH_MISSION:
          case Constants$MissionaryAction.MISSIONARY_DENOUNCE_HERESY:
            if (this.askServer().missionary(unit, direction, act === Constants$MissionaryAction.MISSIONARY_DENOUNCE_HERESY) && is$.hasMissionary$Player(player)) {
              this.sound('sound.event.missionEstablished');
              player.invalidateCanSeeTiles();
            }
            break;
          case Constants$MissionaryAction.MISSIONARY_INCITE_INDIANS:
            enemy = this.getGUI().getChoice$Tile$StringTemplate$Unit$String$List(unit.getTile$(), StringTemplate.key$String('missionarySettlement.inciteQuestion'), unit, 'missionarySettlement.cancel', CollectionUtils.transform$Stream$Predicate$Function(this.getGame().getLiveEuropeanPlayers([player]), CollectionUtils.alwaysTrue(), (p) => new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(p.getCountryLabel()), p)));
            if (enemy != null) {
              this.askServer().incite(unit, is$, enemy, -1);
            }
            break;
          default:
            InGameController.logger.warning('showUseMissionaryDialog fail');
            break;
        }
      }
    });
  }
  /**
   * Wrapper for GUI.showNamingDialog.
   *
   * @param template A message template.
   * @param defaultName The default name for the object.
   * @param unit The {@code Unit} that is naming.
   * @param handler A callback to handle the user response.
   */
  showNamingDialog(template: StringTemplate, defaultName: string, unit: Unit, handler: DialogHandler<string>): void {
    this.invokeLater(() => this.getGUI().showNamingDialog(template, defaultName, unit, handler));
  }
  /**
   * Wrapper for GUI.showNegotiationDialog and followup.
   *
   * @param unit The {@code Unit} that is negotiating.
   * @param settlement The {@code Settlement} that is negotiating.
   * @param agreement The proposed agreement.
   * @param comment An optional {@code StringTemplate} containing a
   *     commentary message.
   * @param direction An optional {@code Direction} to move the unit
   *     to the settlement on success.
   */
  showNegotiationDialog(unit: Unit, settlement: Settlement, agreement: DiplomaticTrade, comment: StringTemplate, direction: Direction): void {
    let player = unit.getOwner();
    this.invokeLater(() => {
      let dt = this.getGUI().showNegotiationDialog(unit, settlement, agreement, comment);
      if (direction != null && dt != null && dt.getStatus() !== DiplomaticTrade$TradeStatus.REJECT_TRADE) {
        this.moveDiplomacy(unit, direction, dt);
      }
    });
  }
  /**
   * Wrapper for GUI.showStatusPanel, but clear on null.
   *
   * @param message The text message to display on the status panel.
   */
  showStatusPanel(message: string): void {
    if (message == null) {
      this.invokeLater(() => this.getGUI().closeStatusPanel());
    } else {
      this.invokeLater(() => this.getGUI().showStatusPanel(message));
    }
  }
  /**
   * Makes a new unit active if any, or focus on a tile (useful if the
   * current unit just died).
   *
   * Displays any new {@code ModelMessage}s with
   * {@link #nextModelMessage}.
   *
   * @param tile The {@code Tile} to select if no new unit can
   *     be made active.
   * @return True if the active unit changes.
   */
  updateActiveUnit(tile: Tile): boolean {
    let player = this.getMyPlayer();
    if (this.moveMode !== InGameController$MoveMode.NEXT_ACTIVE_UNIT) {
      if (this.getGUI().getActiveUnit() != null) {
        this.moveMode = InGameController$MoveMode.NEXT_ACTIVE_UNIT;
      }
      return false;
    }
    if (player.hasNextActiveUnit()) {
      this.changeView$Unit$boolean$InGameController(player.getNextActiveUnit(), false);
      return true;
    }
    if (!this.doExecuteGotoOrders()) {
      return true;
    }
    this.changeView$Tile$InGameController(tile);
    let options = this.getClientOptions();
    if (options.getBoolean(ClientOptions.AUTO_END_TURN)) {
      this.doEndTurn(options.getBoolean(ClientOptions.SHOW_END_TURN_DIALOG));
    }
    return true;
  }
  /**
   * Update the GUI and the active unit, with a fallback tile.
   *
   * @param tile An optional fallback {@code Tile}.
   * @param updateUnit An override setting which if true forces a new
   *     active unit to be selected (useful for the Wait command).
   */
  updateGUI(tile: Tile, updateUnit: boolean): void {
    this.displayModelMessages(false, false);
    let gui = this.getGUI();
    let active = gui.getActiveUnit();
    let update = updateUnit || active == null || !active.isCandidateForNextActiveUnit() || !this.getMyPlayer().owns(active);
    this.invokeLater(() => {
      if (update) {
        this.updateActiveUnit(tile);
      }
      gui.updateMapControls();
      gui.updateMenuBar();
    });
  }
  /**
   * Ask the server to assign a trade route.
   *
   * @param unit The {@code Unit} to assign to.
   * @param tradeRoute The {@code TradeRoute} to assign.
   * @return True if the assignment succeeds.
   */
  askAssignTradeRoute(unit: Unit, tradeRoute: TradeRoute): boolean {
    if (tradeRoute === unit.getTradeRoute()) {
      return true;
    }
    if (tradeRoute != null && unit.getTradeRoute() != null) {
      if (!this.getGUI().confirmClearTradeRoute(unit)) {
        return false;
      }
    }
    return this.askServer().assignTradeRoute(unit, tradeRoute) && unit.getTradeRoute() === tradeRoute;
  }
  /**
   * Claim a tile.
   *
   * @param player The {@code Player} that is claiming.
   * @param tile The {@code Tile} to claim.
   * @param claimant The {@code Unit} or {@code Colony} claiming.
   * @param price The price required.
   * @return True if the claim succeeded.
   */
  askClaimTile(player: Player, tile: Tile, claimant: FreeColGameObject, price: number): boolean {
    let owner = tile.getOwner();
    if (price < 0) {
      return false;
    } else if (price > 0) {
      let act = this.getGUI().getClaimChoice(tile, player, price, owner);
      if (act == null) {
        return false;
      }
      switch (act) {
        case Constants$ClaimAction.CLAIM_ACCEPT:
          break;
        case Constants$ClaimAction.CLAIM_STEAL:
          price = Constants.STEAL_LAND;
          break;
        default:
          InGameController.logger.warning('Claim dialog fail: ' + $J.str(act));
          return false;
      }
    }
    return this.askServer().claimTile(tile, claimant, price) && player.owns(tile);
  }
  /**
   * Clears the goto orders of the given unit by setting its destination
   * to null.
   *
   * @param unit The {@code Unit} to clear the destination for.
   * @return True if the unit now has no destination or trade route.
   */
  askClearGotoOrders(unit: Unit): boolean {
    if (!this.askAssignTradeRoute(unit, null) || !this.askSetDestination(unit, null)) {
      return false;
    }
    this.getGUI().clearGotoPath();
    return true;
  }
  /**
   * Embark onto a carrier.
   *
   * @param unit The {@code Unit} to embark.
   * @param carrier The carrier {@code Unit} to board.
   * @return True if boarding succeeded.
   */
  askEmbark(unit: Unit, carrier: Unit): boolean {
    let colonyWas = (unit.getColony() != null) ? new ColonyWas()._ColonyWas(unit.getColony()) : null;
    let europeWas = (unit.isInEurope()) ? new EuropeWas()._EuropeWas(unit.getOwner().getEurope()) : null;
    let unitWas = new UnitWas()._UnitWas(unit);
    if (this.askServer().embark(unit, carrier, null) && unit.getLocation() === carrier) {
      this.sound('sound.event.loadCargo');
      this.fireChanges([unitWas, colonyWas, europeWas]);
      return true;
    }
    return false;
  }
  /**
   * A unit in Europe emigrates.
   *
   * This is unusual for an ask* routine in that it uses a *Was
   * structure, but it is needed to extract the unit.
   *
   * @param europe The {@code Europe} where the unit appears.
   * @param slot The slot to choose, [0..RECRUIT_COUNT].
   * @return The new {@code Unit} or null on failure.
   */
  askEmigrate(europe: Europe, slot: number): Unit {
    if (europe == null || !Europe$MigrationType.validMigrantSlot(slot)) {
      return null;
    }
    let europeWas = new EuropeWas()._EuropeWas(europe);
    let newUnit = null;
    if (this.askServer().emigrate(slot) && (newUnit = europeWas.getNewUnit()) != null) {
      this.fireChanges([europeWas]);
    }
    return newUnit;
  }
  /**
   * Select all the units to emigrate from Europe.  If they are all
   * the same they can be picked automatically, but otherwise use
   * the emigration dialog.  Only to be called if the player is
   * allowed to select the unit type (i.e. FoY or has Brewster).
   *
   * The server contains the count of available FoY-units, and
   * maintains the immigration/immigrationRequired amounts, so this
   * routine will fail harmlessly if it asks for too much.
   *
   * @param player The {@code Player} that owns the unit.
   * @param n The number of units known to be eligible to emigrate.
   * @param fountainOfYouth True if this migration if due to a FoY.
   */
  emigration(player: Player, n: number, fountainOfYouth: boolean): void {
    let europe = player.getEurope();
    if (europe == null) {
      return;
    }
    for (; n > 0 || player.checkEmigrate(); n--) {
      if (!CollectionUtils.allSame(europe.getExpandedRecruitables(false))) {
        this.showEmigrationDialog(player, fountainOfYouth, n);
        return;
      }
      let u = this.askEmigrate(europe, Europe$MigrationType.getDefaultSlot());
      if (u == null) {
        break;
      }
      player.addModelMessage(player.getEmigrationMessage(u));
    }
  }
  /**
   * Load some goods onto a carrier.
   *
   * @param loc The {@code Location} to load from.
   * @param type The {@code GoodsType} to load.
   * @param amount The amount of goods to load.
   * @param carrier The {@code Unit} to load onto.
   * @return True if the load succeeded.
   */
  askLoadGoods(loc: Location, type$: GoodsType, amount: number, carrier: Unit): boolean {
    let trl = carrier.getTradeLocation();
    if (trl == null) {
      return false;
    }
    let loadable = carrier.getLoadableAmount(type$);
    if (amount > loadable) {
      amount = loadable;
    }
    let player = carrier.getOwner();
    if (carrier.isInEurope()) {
      if (!player.canTrade$GoodsType(type$)) {
        return false;
      }
      if (!player.checkGold(player.getMarket().getBidPrice(type$, amount))) {
        this.showInformationPanel$FreeColObject$String$InGameController(null, 'info.notEnoughGold');
        return false;
      }
    }
    let oldAmount = carrier.getGoodsContainer().getGoodsCount(type$);
    if (this.askServer().loadGoods(loc, type$, amount, carrier) && carrier.getGoodsContainer().getGoodsCount(type$) !== oldAmount) {
      return true;
    }
    return false;
  }
  /**
   * Set a destination for a unit.
   *
   * @param unit The {@code Unit} to direct.
   * @param destination The destination {@code Location}.
   * @return True if the destination was set.
   */
  askSetDestination(unit: Unit, destination: Location): boolean {
    if (unit.getDestination() === destination) {
      return true;
    }
    return this.askServer().setDestination(unit, destination) && unit.getDestination() === destination;
  }
  /**
   * Unload some goods from a carrier.
   *
   * @param type The {@code GoodsType} to unload.
   * @param amount The amount of goods to unload.
   * @param carrier The {@code Unit} carrying the goods.
   * @return True if the unload succeeded.
   */
  askUnloadGoods(type$: GoodsType, amount: number, carrier: Unit): boolean {
    let player = this.getMyPlayer();
    let oldAmount = carrier.getGoodsContainer().getGoodsCount(type$);
    if (this.askServer().unloadGoods(type$, amount, carrier) && carrier.getGoodsContainer().getGoodsCount(type$) !== oldAmount) {
      return true;
    }
    return false;
  }
  /**
   * Get the trunk of the save game string.
   *
   * @param game The {@code Game} to query.
   * @return The trunk of the file name to use for saved games.
   */
  getSaveGameString(game: Game): string {
    let player = this.getMyPlayer();
    let gid = $J.Integer_toHexString(game.getUUID().hashCode());
    let turn = game.getTurn();
    return JString.replaceAll((gid + '_' + Messages.message$StringTemplate(player.getNationLabel()) + '_' + turn.getSaveGameSuffix() + '.' + FreeCol.FREECOL_SAVE_EXTENSION), ' ', '_');
  }
  /**
   * Creates at least one autosave game file of the currently played
   * game in the autosave directory.  Does nothing if there is no
   * game running.
   */
  autoSaveGame(): void {
    let game = this.getGame();
    if (game == null) {
      return;
    }
    let options = this.getClientOptions();
    let prefix = options.getText(ClientOptions.AUTO_SAVE_PREFIX);
    let lastTurnName = prefix + '-' + options.getText(ClientOptions.LAST_TURN_NAME) + '.' + FreeCol.FREECOL_SAVE_EXTENSION;
    let beforeLastTurnName = prefix + '-' + options.getText(ClientOptions.BEFORE_LAST_TURN_NAME) + '.' + FreeCol.FREECOL_SAVE_EXTENSION;
    let lastTurnFile = FreeColDirectories.getAutosaveFile(lastTurnName);
    let beforeLastTurnFile = FreeColDirectories.getAutosaveFile(beforeLastTurnName);
    if (lastTurnFile != null) {
      if (lastTurnFile.exists()) {
        if (beforeLastTurnFile.exists()) {
          Utils.deleteFile(beforeLastTurnFile);
        }
        try {
          if (!lastTurnFile.renameTo(beforeLastTurnFile)) {
            InGameController.logger.warning('Could not rename: ' + lastTurnFile.getPath());
          }
        } catch ($e0) {
          if ($J.isa($e0, NullPointerException) || $J.isa($e0, SecurityException)) {
            let ex = $J.exc($e0);
            InGameController.logger.log(Level.WARNING, 'Could not rename: ' + lastTurnFile.getPath(), ex);
          } else {
            throw $e0;
          }
        }
      }
      this.saveGame$File$InGameController(lastTurnFile);
    }
    let saveGamePeriod = options.getInteger(ClientOptions.AUTOSAVE_PERIOD);
    let turnNumber = game.getTurn().getNumber();
    if (saveGamePeriod >= 1 && turnNumber % saveGamePeriod === 0) {
      let fileName = prefix + '-' + this.getSaveGameString(game);
      this.saveGame$File$InGameController(FreeColDirectories.getAutosaveFile(fileName));
    }
  }
  /**
   * Saves the game to the given file.
   *
   * @param file The {@code File}.
   * @return True if the game was saved.
   */
  saveGame$File$InGameController(file: File): boolean {
    if (file == null) {
      return false;
    }
    let server = this.getFreeColServer();
    let result = false;
    if (server != null) {
      this.showStatusPanel(Messages.message$String('status.savingGame'));
      try {
        server.saveGame$File$OptionGroup$Unit(file, this.getClientOptions(), this.getGUI().getActiveUnit());
        result = true;
      } catch ($e1) {
        if ($J.isa($e1, IOException)) {
          let ioe = $J.exc($e1);
          this.error(FreeCol.badFile('error.couldNotSave', file), null);
          InGameController.logger.log(Level.WARNING, 'Save fail', ioe);
        } else {
          throw $e1;
        }
      } finally {
        this.showStatusPanel(null);
      }
    }
    return result;
  }
  /**
   * Start ignoring a kind of message.
   *
   * @param key The key for a message to ignore.
   * @param turn The current {@code Turn}.
   */
  startIgnoringMessage(key: string, turn: Turn): void {
    this.messagesToIgnore.put(key, turn.getNumber());
    InGameController.logger.finer('Ignore message start: ' + key);
  }
  /**
   * Stop ignoring a kind of message.
   *
   * @param key The key for a message to stop ignoring.
   */
  stopIgnoringMessage(key: string): void {
    this.messagesToIgnore.remove(key);
    InGameController.logger.finer('Ignore message stop: ' + key);
  }
  /**
   * Reap all ignored message keys that are older than the given turn.
   *
   * @param turn The {@code Turn} value to test against.
   */
  reapIgnoredMessages(turn: Turn): void {
    CollectionUtils.removeInPlace$Map$Predicate(this.messagesToIgnore, (e) => e.getValue() < turn.getNumber());
  }
  /**
   * See if messages with a given key were ignored last turn.  If so,
   * continue to ignore them.
   *
   * @param key The key to check.
   * @param turn The current {@code Turn}.
   * @return True if the message should continue to be ignored.
   */
  continueIgnoreMessage(key: string, turn: Turn): boolean {
    let value = -1;
    let ret = key != null && (value = this.messagesToIgnore.get(key)) != null && ((value + 1) | 0) === turn.getNumber();
    if (ret) {
      this.messagesToIgnore.put(key, (value + 1) | 0);
    }
    return ret;
  }
  /**
   * Displays the messages in the current turn report.
   */
  displayTurnReportMessages(): void {
    this.getGUI().showReportTurnPanel(this.turnReportMessages);
  }
  /**
   * Displays pending {@code ModelMessage}s.
   *
   * @param allMessages Display all messages or just the undisplayed ones.
   * @param endOfTurn Use a turn report panel if necessary.
   * @return True if any messages were displayed.
   */
  displayModelMessages(allMessages: boolean, endOfTurn: boolean): boolean {
    let co = this.getClientOptions();
    let player = this.getMyPlayer();
    let thisTurn = this.getGame().getTurn();
    let messages = new ArrayList();
    let todo = (allMessages) ? player.getModelMessages() : player.getNewModelMessages();
    for (const $it2 = todo.iterator(); $it2.hasNext(); ) {
      let m = $it2.next();
      let key = m.getOptionName();
      try {
        if ((key == null || co.getBoolean(key)) && !this.continueIgnoreMessage(m.getIgnoredMessageKey(), thisTurn)) {
          messages.add(m);
        }
      } catch ($e3) {
        if ($J.isa($e3, RuntimeException)) {
          let rte = $J.exc($e3);
          InGameController.logger.warning('Bogus ModelMessage with key<' + key + '>: ' + $J.str(m));
        } else {
          throw $e3;
        }
      }
      m.setDisplayed(true);
    }
    this.reapIgnoredMessages(thisTurn);
    if (!messages.isEmpty()) {
      let uiTask: Runnable;
      if (endOfTurn) {
        this.turnReportMessages.addAll(messages);
        uiTask = () => {
          this.displayTurnReportMessages();
        };
      } else {
        uiTask = () => {
          this.getGUI().showModelMessages(messages);
        };
      }
      this.getGUI().invokeNowOrWait(uiTask);
    }
    return !messages.isEmpty();
  }
  /**
   * Displays the next {@code ModelMessage}.
   *
   * Called from CC.reconnect, CargoPanel,
   * ColonyPanel.closeColonyPanel, EuropePanel.exitAction,
   * EuropePanel.MarketPanel
   *
   * @return True if any messages were displayed.
   */
  nextModelMessage(): boolean {
    return this.displayModelMessages(false, false);
  }
  /**
   * Do the goto orders operation.
   *
   * @return True if all goto orders have been performed and no units
   *     reached their destination and are free to move again.
   */
  doExecuteGotoOrders(): boolean {
    let player = this.getMyPlayer();
    let active = this.getGUI().getActiveUnit();
    let ret = true;
    this.moveMode = this.moveMode.maximize(InGameController$MoveMode.EXECUTE_GOTO_ORDERS);
    let messages = new ArrayList();
    let tradePred = (u) => u.isReadyToTrade() && player.owns(u);
    for (const $it4 = CollectionUtils.transform$Stream$Predicate$Function$Comparator(player.getUnits(), tradePred, JFunction.identity(), InGameController.tradeRouteUnitComparator).iterator(); $it4.hasNext(); ) {
      let unit = $it4.next();
      this.changeView$Unit$boolean$InGameController(unit, false);
      if (!this.moveToDestination(unit, messages)) {
        ret = false;
        break;
      }
    }
    if (!messages.isEmpty()) {
      this.turnReportMessages.addAll(messages);
      for (const $it5 = messages.iterator(); $it5.hasNext(); ) {
        let m = $it5.next();
        player.addModelMessage(m);
      }
      this.nextModelMessage();
      ret = false;
    }
    if (!ret) {
      return false;
    }
    if (this.getGUI().isPanelShowing()) {
      return false;
    }
    if (active != null) {
      player.setNextGoingToUnit(active);
    }
    while (player.hasNextGoingToUnit()) {
      let unit = player.getNextGoingToUnit();
      this.changeView$Unit$boolean$InGameController(unit, false);
      if (!this.moveToDestination(unit, null)) {
        ret = false;
        break;
      }
      if (active === unit) {
        active = null;
      }
    }
    this.nextModelMessage();
    if (ret) {
      this.changeView$Unit$boolean$InGameController(active, false);
    }
    return ret;
  }
  /**
   * End the turn.
   *
   * @param showDialog Show the end turn dialog?
   */
  doEndTurn(showDialog: boolean): void {
    let player = this.getMyPlayer();
    if (this.getGUI().isPanelShowing()) {
      return;
    }
    if (showDialog) {
      let units = CollectionUtils.transform$Stream$Predicate(player.getUnits(), ($p0) => $p0.isCandidateForNextActiveUnit());
      if (!units.isEmpty()) {
        this.getGUI().showEndTurnDialog(units, (value) => {
          if (value != null && value) {
            this.endTurn(false);
          }
        });
        return;
      }
    }
    this.moveMode = this.moveMode.maximize(InGameController$MoveMode.END_TURN);
    this.changeView$Tile$InGameController(null);
    let units = CollectionUtils.transform$Stream$Predicate(player.getUnits(), ($p0) => $p0.couldMove());
    units.stream().forEach((unit) => {
      if (unit.getState() !== Unit$UnitState.SKIPPED) {
        this.igc().changeState(unit, Unit$UnitState.SKIPPED);
      }
    });
    if (!this.doExecuteGotoOrders() || this.moveMode.ordinal() < InGameController$MoveMode.END_TURN.ordinal()) {
      return;
    }
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.DESYNC) && DebugUtils.checkDesyncAction(this.getFreeColClient())) {
      InGameController.logger.warning('Reconnecting on desync');
      this.getFreeColClient().getConnectController().requestLogout(Game$LogoutReason.RECONNECT);
      return;
    }
    this.getGUI().closeMenus();
    this.moveMode = InGameController$MoveMode.NEXT_ACTIVE_UNIT;
    this.turnReportMessages.clear();
    this.askServer().endTurn();
  }
  /**
   * Moves the given unit towards its destination/s if possible.
   *
   * @param unit The {@code Unit} to move.
   * @param messages An optional list in which to retain any
   *     trade route {@code ModelMessage}s generated.
   * @return True if all is well with the unit, false if the unit
   *     should be selected and examined by the user.
   */
  moveToDestination(unit: Unit, messages: List<ModelMessage>): boolean {
    let player = this.getMyPlayer();
    let destination = unit.getDestination();
    let path: PathNode;
    let ret: boolean;
    if (!this.requireOurTurn() || unit.isAtSea() || unit.getMovesLeft() <= 0 || unit.getState() === Unit$UnitState.SKIPPED) {
      ret = true;
    } else if (unit.getTradeRoute() != null) {
      ret = this.followTradeRoute(unit, messages);
    } else if (destination == null) {
      ret = true;
    } else if (!this.changeState(unit, Unit$UnitState.ACTIVE)) {
      ret = true;
    } else if ((path = unit.findPath$Location(destination)) == null) {
      let src = unit.getLocation().getLocationLabelFor(player);
      let dst = destination.getLocationLabelFor(player);
      let template = StringTemplate.template$String('info.moveToDestinationFailed').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addStringTemplate$String$StringTemplate('%location%', src).addStringTemplate$String$StringTemplate('%destination%', dst);
      this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, template);
      this.changeState(unit, Unit$UnitState.SKIPPED);
      ret = false;
    } else if (!this.movePath(unit, path)) {
      ret = false;
    } else if (unit.isAtLocation(destination)) {
      let colony = (unit.hasTile()) ? unit.getTile$().getColony() : null;
      if (!this.askClearGotoOrders(unit)) {
        ret = false;
      } else if (colony != null) {
        if (this.checkCashInTreasureTrain(unit)) {
          ret = true;
        } else {
          this.showColonyPanelWithCarrier(colony, unit);
          ret = false;
        }
      } else {
        ret = unit.getMovesLeft() === 0;
      }
    } else {
      ret = true;
    }
    return ret;
  }
  /**
   * Follow a path.
   *
   * @param unit The {@code Unit} to move.
   * @param path The path to follow.
   * @return True if automatic movement of the unit can proceed.
   */
  movePath(unit: Unit, path: PathNode): boolean {
    for (; path != null; path = path.next_) {
      if (unit.isAtLocation(path.getLocation())) {
        continue;
      }
      if (path.getLocation() instanceof Europe) {
        if (unit.hasTile() && unit.getTile$().isDirectlyHighSeasConnected()) {
          return this.moveTowardEurope(unit, path.getLocation());
        }
        InGameController.logger.warning('Can not move to Europe from ' + $J.str(unit.getLocation()) + ' on path: ' + path.fullPathToString());
        return false;
      } else if (path.getLocation() instanceof Tile) {
        if (path.getDirection() == null) {
          if (unit.isInEurope()) {
            return this.moveAwayFromEurope(unit, unit.getGame().getMap());
          }
          InGameController.logger.warning('Null direction on path: ' + path.fullPathToString());
          return false;
        }
        if (!this.moveDirection(unit, path.getDirection(), false)) {
          return unit.getMoveType$Direction(path.getDirection()) === Unit$MoveType.MOVE_NO_MOVES;
        }
      } else if (path.getLocation() instanceof Unit) {
        return this.moveEmbark(unit, path.getDirection());
      } else {
        InGameController.logger.warning('Bad path: ' + path.fullPathToString());
        return false;
      }
    }
    return true;
  }
  /**
   * Move a unit in a given direction.
   *
   * Public for the test suite.
   *
   * @param unit The {@code Unit} to move.
   * @param direction The {@code Direction} to move in.
   * @param interactive Interactive mode: play sounds and emit errors.
   * @return True if automatic movement of the unit can proceed.
   */
  moveDirection(unit: Unit, direction: Direction, interactive: boolean): boolean {
    let destination = unit.getDestination();
    let oldTile = unit.getTile$();
    let destinationImminent = destination != null && oldTile != null && Map_.isSameLocation(oldTile.getNeighbourOrNull(direction), destination);
    let mt = unit.getMoveType$Direction(direction);
    let result = mt.isLegal();
    switch (mt) {
      case Unit$MoveType.MOVE_HIGH_SEAS:
        result = (destination instanceof Europe && this.getMyPlayer().getEurope() != null) ? this.moveTowardEurope(unit, destination) : (destination == null) ? this.moveHighSeas(unit, direction) : this.moveTile(unit, direction);
        break;
      case Unit$MoveType.MOVE:
        result = this.moveTile(unit, direction);
        break;
      case Unit$MoveType.EXPLORE_LOST_CITY_RUMOUR:
        result = this.moveExplore(unit, direction);
        break;
      case Unit$MoveType.ATTACK_UNIT:
        result = this.moveAttack(unit, direction);
        break;
      case Unit$MoveType.ATTACK_SETTLEMENT:
        result = this.moveAttackSettlement(unit, direction);
        break;
      case Unit$MoveType.EMBARK:
        result = this.moveEmbark(unit, direction);
        break;
      case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST:
        result = this.moveLearnSkill(unit, direction);
        break;
      case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT:
        result = this.moveScoutIndianSettlement(unit, direction);
        break;
      case Unit$MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY:
        result = this.moveUseMissionary(unit, direction);
        break;
      case Unit$MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT:
        result = this.moveScoutColony(unit, direction);
        break;
      case Unit$MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS:
        result = this.moveTrade(unit, direction);
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_BEACHED:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessBeached').addStringTemplate$String$StringTemplate('%nation%', nation));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_CONTACT:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessContact').addStringTemplate$String$StringTemplate('%nation%', nation));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_GOODS:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessGoods').addStringTemplate$String$StringTemplate('%nation%', nation).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_LAND:
        if (!this.moveDisembark(unit, direction)) {
          if (interactive) {
            this.sound('sound.event.illegalMove');
          }
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_MISSION_BAN:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessMissionBan').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addStringTemplate$String$StringTemplate('%nation%', nation));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_SETTLEMENT:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessSettlement').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addStringTemplate$String$StringTemplate('%nation%', nation));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_SKILL:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessSkill').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_TRADE:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessTrade').addStringTemplate$String$StringTemplate('%nation%', nation));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_WAR:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          let nation = this.getNationAt(unit.getTile$(), direction);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessWar').addStringTemplate$String$StringTemplate('%nation%', nation));
        }
        break;
      case Unit$MoveType.MOVE_NO_ACCESS_WATER:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAccessWater').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
        }
        break;
      case Unit$MoveType.MOVE_NO_ATTACK_MARINE:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noAttackWater').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
        }
        break;
      case Unit$MoveType.MOVE_NO_MOVES:
        destinationImminent = false;
        this.changeState(unit, Unit$UnitState.SKIPPED);
        break;
      case Unit$MoveType.MOVE_NO_TILE:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('move.noTile').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
        }
        break;
      default:
        if (interactive || destinationImminent) {
          this.sound('sound.event.illegalMove');
        }
        result = false;
        break;
    }
    if (destinationImminent && !unit.isDisposed()) {
      if (!this.askClearGotoOrders(unit)) {
        result = false;
      }
    }
    if (unit === this.getGUI().getActiveUnit()) {
      this.changeView$Unit$boolean$InGameController(unit, true);
    }
    return result;
  }
  /**
   * Move a unit from off map to an on map location.
   *
   * @param unit The {@code Unit} to be moved.
   * @param destination The {@code Location} to be moved to.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveAwayFromEurope(unit: Unit, destination: Location): boolean {
    let ul: List<Unit>;
    if (this.getClientOptions().getBoolean(ClientOptions.AUTOLOAD_EMIGRANTS) && unit.isInEurope() && !(ul = CollectionUtils.transform$Stream$Predicate(unit.getOwner().getEurope().getUnits(), Unit.sentryPred)).isEmpty()) {
      this.moveAutoload(unit, ul);
    }
    let europeWas = (!unit.isInEurope()) ? null : new EuropeWas()._EuropeWas(unit.getOwner().getEurope());
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().moveTo(unit, destination);
    if (ret) {
      this.fireChanges([unitWas, europeWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Move a unit from on map towards Europe.
   *
   * @param unit The {@code Unit} to be moved.
   * @param europe The {@code Europe} to be moved to.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveTowardEurope(unit: Unit, europe: Europe): boolean {
    let unitWas = new UnitWas()._UnitWas(unit);
    if (this.askServer().moveTo(unit, europe)) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return false;
  }
  /**
   * Confirm attack or demand a tribute from a native settlement, following
   * an attacking move.
   *
   * @param unit The {@code Unit} to perform the attack.
   * @param direction The direction in which to attack.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveAttack(unit: Unit, direction: Direction): boolean {
    let tile = unit.getTile$();
    let target = tile.getNeighbourOrNull(direction);
    let u = target.getFirstUnit();
    if (u == null || unit.getOwner().owns(u)) {
      return false;
    }
    if (this.askClearGotoOrders(unit) && this.getGUI().confirmHostileAction(unit, target) && this.getGUI().confirmPreCombat(unit, target)) {
      this.askServer().attack(unit, direction);
      this.nextModelMessage();
    }
    return false;
  }
  attackRanged(unit: Unit, target: Tile): void {
    if (!unit.canAttackRanged(target)) {
      return;
    }
    if (this.askClearGotoOrders(unit) && this.getGUI().confirmHostileAction(unit, target) && this.getGUI().confirmPreCombat(unit, target)) {
      this.askServer().attackRanged(unit, target);
      this.nextModelMessage();
    }
  }
  /**
   * Confirm attack or demand a tribute from a settlement, following
   * an attacking move.
   *
   * @param unit The {@code Unit} to perform the attack.
   * @param direction The direction in which to attack.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveAttackSettlement(unit: Unit, direction: Direction): boolean {
    let tile = unit.getTile$();
    let target = tile.getNeighbourOrNull(direction);
    let settlement = target.getSettlement();
    if (settlement == null || unit.getOwner().owns(settlement)) {
      return false;
    }
    let act = this.getGUI().getArmedUnitSettlementChoice(settlement);
    if (act == null) {
      return false;
    }
    {
      let amount: number;
      switch (act) {
        case Constants$ArmedUnitSettlementAction.SETTLEMENT_ATTACK:
          if (this.getGUI().confirmHostileAction(unit, target) && this.getGUI().confirmPreCombat(unit, target)) {
            this.askServer().attack(unit, direction);
            let col = target.getColony();
            if (col != null && unit.getOwner().owns(col)) {
              this.showColonyPanel(col, unit);
            }
            this.nextModelMessage();
          }
          break;
        case Constants$ArmedUnitSettlementAction.SETTLEMENT_TRIBUTE:
          amount = (settlement instanceof Colony) ? this.getGUI().confirmEuropeanTribute(unit, settlement, this.nationSummary(settlement.getOwner())) : (settlement instanceof IndianSettlement) ? this.getGUI().confirmNativeTribute(unit, settlement) : -1;
          if (amount > 0) {
            return this.moveTribute(unit, amount, direction);
          }
          break;
        default:
          InGameController.logger.warning('showArmedUnitSettlementDialog fail: ' + $J.str(act));
          break;
      }
    }
    return false;
  }
  /**
   * Primitive to handle autoloading of a list of units onto a carrier.
   *
   * @param carrier The carrier {@code Unit} to load onto.
   * @param embark A list of {@code Unit}s to load.
   * @return True if automatic movement of the carrier can proceed.
   */
  moveAutoload(carrier: Unit, embark: List<Unit>): boolean {
    let update = false;
    for (const $it6 = embark.iterator(); $it6.hasNext(); ) {
      let u = $it6.next();
      if (!carrier.couldCarry$Unit(u)) {
        continue;
      }
      update = !!(update | this.askEmbark(u, carrier));
      if (u.getLocation() !== carrier) {
        this.changeState(u, Unit$UnitState.SKIPPED);
      }
    }
    if (update) {
      this.updateGUI(null, false);
    }
    return carrier.couldMove();
  }
  /**
   * Initiates diplomacy with a foreign power.
   *
   * @param unit The {@code Unit} negotiating.
   * @param direction The direction of a settlement to negotiate with.
   * @param dt The base {@code DiplomaticTrade} agreement to
   *     begin the negotiation with.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveDiplomacy(unit: Unit, direction: Direction, dt: DiplomaticTrade): boolean {
    let settlement = this.getSettlementAt(unit.getTile$(), direction);
    if (settlement instanceof Colony) {
      let player = unit.getOwner();
      let colony = settlement;
      let other = colony.getOwner();
      if (other === player.getREFPlayer()) {
        return false;
      }
      this.askServer().diplomacy(unit, colony, dt);
      player.clearNationSummary(player);
      player.clearNationSummary(other);
    }
    return false;
  }
  /**
   * Check the carrier for passengers to disembark, possibly
   * snatching a useful result from the jaws of a
   * MOVE_NO_ACCESS_LAND failure.
   *
   * @param unit The carrier containing the unit to disembark.
   * @param direction The direction in which to disembark the unit.
   * @return True if the disembark "succeeds" (which deliberately includes
   *     declined disembarks).
   */
  moveDisembark(unit: Unit, direction: Direction): boolean {
    let tile = unit.getTile$().getNeighbourOrNull(direction);
    if (tile.getFirstUnit() != null && tile.getFirstUnit().getOwner() !== unit.getOwner()) {
      return false;
    }
    let disembarkable = CollectionUtils.transform$Stream$Predicate(unit.getUnits(), (u) => u.getMoveType$Tile(tile).isProgress());
    if (disembarkable.isEmpty()) {
      return false;
    }
    for (const $it7 = disembarkable.iterator(); $it7.hasNext(); ) {
      let u = $it7.next();
      this.changeState(u, Unit$UnitState.ACTIVE);
    }
    if (disembarkable.size() === 1) {
      if (this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(tile, StringTemplate.key$String('disembark.text'), disembarkable.get(0), 'ok', 'cancel')) {
        this.moveDirection(disembarkable.get(0), direction, false);
      }
    } else {
      let choices = CollectionUtils.transform$Collection$Predicate$Function(disembarkable, CollectionUtils.alwaysTrue(), (u) => new ChoiceItem()._ChoiceItem$String$Object(u.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL), u));
      choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('all'), unit));
      let u = this.getGUI().getChoice$Tile$StringTemplate$Unit$String$List(unit.getTile$(), StringTemplate.key$String('disembark.text'), unit, 'none', choices);
      if (u == null) {
      } else if (u === unit) {
        for (const $it8 = disembarkable.iterator(); $it8.hasNext(); ) {
          let dUnit = $it8.next();
          this.moveDirection(dUnit, direction, false);
        }
      } else {
        this.moveDirection(u, direction, false);
      }
    }
    return true;
  }
  /**
   * Embarks the specified unit onto a carrier in a specified direction
   * following a move of MoveType.EMBARK.
   *
   * @param unit The {@code Unit} that wishes to embark.
   * @param direction The direction in which to embark.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveEmbark(unit: Unit, direction: Direction): boolean {
    if (unit.getColony() != null && !this.getGUI().confirmLeaveColony(unit)) {
      return false;
    }
    let sourceTile = unit.getTile$();
    let destinationTile = sourceTile.getNeighbourOrNull(direction);
    let carrier = null;
    let choices = CollectionUtils.transform$Stream$Predicate$Function(destinationTile.getUnits(), (u) => u.canAdd(unit), (u) => new ChoiceItem()._ChoiceItem$String$Object(u.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL), u));
    if (choices.isEmpty()) {
      throw new RuntimeException('Unit ' + unit.getId() + ' found no carrier to embark upon.');
    } else if (choices.size() === 1) {
      carrier = choices.get(0).getObject();
    } else {
      carrier = this.getGUI().getChoice$Tile$StringTemplate$Unit$String$List(unit.getTile$(), StringTemplate.key$String('embark.text'), unit, 'none', choices);
      if (carrier == null) {
        return false;
      }
    }
    if (this.askClearGotoOrders(unit) && this.askServer().embark(unit, carrier, direction) && unit.getLocation() === carrier) {
      unit.getOwner().invalidateCanSeeTiles();
    } else {
      this.changeState(unit, Unit$UnitState.SKIPPED);
    }
    return false;
  }
  /**
   * Confirm exploration of a lost city rumour, following a move of
   * MoveType.EXPLORE_LOST_CITY_RUMOUR.
   *
   * @param unit The {@code Unit} that is exploring.
   * @param direction The direction of a rumour.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveExplore(unit: Unit, direction: Direction): boolean {
    let now = unit.getTile$();
    let tile = now.getNeighbourOrNull(direction);
    if (!this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(now, StringTemplate.key$String('exploreLostCityRumour.text'), unit, 'exploreLostCityRumour.yes', 'exploreLostCityRumour.no')) {
      if (unit.getDestination() != null) {
        this.askClearGotoOrders(unit);
      }
      return false;
    }
    if (tile.getLostCityRumour().getType() === LostCityRumour$RumourType.MOUNDS && !this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(now, StringTemplate.key$String('exploreMoundsRumour.text'), unit, 'exploreLostCityRumour.yes', 'exploreLostCityRumour.no')) {
      this.askServer().declineMounds(unit, direction);
      return false;
    }
    this.moveTile(unit, direction);
    return false;
  }
  /**
   * Moves a unit onto the "high seas" in a specified direction following
   * a move of MoveType.MOVE_HIGH_SEAS.
   * This may result in a move to Europe, no move, or an ordinary move.
   *
   * @param unit The {@code Unit} to be moved.
   * @param direction The direction in which to move.
   * @return True if automatic movement of the unit can proceed.
   */
  moveHighSeas(unit: Unit, direction: Direction): boolean {
    let oldTile = unit.getTile$();
    let newTile = oldTile.getNeighbourOrNull(direction);
    if (newTile == null || (!oldTile.isDirectlyHighSeasConnected() && newTile.isDirectlyHighSeasConnected())) {
      let stop: TradeRouteStop;
      if (unit.getTradeRoute() != null && (stop = unit.getStop()) != null && TradeRoute.isStopValid$Unit$TradeRouteStop(unit, stop) && stop.getLocation() instanceof Europe) {
        return this.moveTowardEurope(unit, stop.getLocation());
      } else if (unit.getDestination() instanceof Europe) {
        return this.moveTowardEurope(unit, unit.getDestination());
      } else if (this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(oldTile, StringTemplate.template$String('highseas.text').addAmount('%number%', unit.getSailTurns()), unit, 'highseas.yes', 'highseas.no')) {
        return this.moveTowardEurope(unit, unit.getOwner().getEurope());
      }
    }
    return this.moveTile(unit, direction);
  }
  /**
   * Move a free colonist to a native settlement to learn a skill following
   * a move of MoveType.ENTER_INDIAN_SETTLEMENT_WITH_FREE_COLONIST.
   * The colonist does not physically get into the village, it will
   * just stay where it is and gain the skill.
   *
   * @param unit The {@code Unit} to learn the skill.
   * @param direction The direction in which the Indian settlement lies.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveLearnSkill(unit: Unit, direction: Direction): boolean {
    if (this.askClearGotoOrders(unit) && this.askServer().askSkill(unit, direction)) {
      let is$ = this.getSettlementAt(unit.getTile$(), direction);
      let skill = is$.getLearnableSkill();
      if (skill == null) {
        this.showInformationPanel$FreeColObject$String$InGameController(is$, 'info.noMoreSkill');
      } else if (unit.getUnitChange$String(UnitChangeType.NATIVES) == null) {
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(is$, StringTemplate.template$String('info.cantLearnSkill').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addNamed$String$Named('%skill%', skill));
      } else if (this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), StringTemplate.template$String('learnSkill.text').addNamed$String$Named('%skill%', skill), unit, 'learnSkill.yes', 'learnSkill.no')) {
        if (this.askServer().learnSkill(unit, direction)) {
          if (unit.isDisposed()) {
            this.showInformationPanel$FreeColObject$String$InGameController(is$, 'learnSkill.die');
          } else if (unit.getType() !== skill) {
            this.showInformationPanel$FreeColObject$String$InGameController(is$, 'learnSkill.leave');
          }
        }
      }
    }
    return false;
  }
  /**
   * Move a unit in a specified direction on the map, following a
   * move of MoveType.MOVE.
   *
   * @param unit The {@code Unit} to be moved.
   * @param direction The direction in which to move the Unit.
   * @return True if automatic movement of the unit can proceed.
   */
  moveTile(unit: Unit, direction: Direction): boolean {
    let options = this.getClientOptions();
    let ul: List<Unit>;
    if (unit.canCarryUnits() && unit.hasSpaceLeft() && options.getBoolean(ClientOptions.AUTOLOAD_SENTRIES) && unit.isInColony() && !(ul = unit.getTile$().getUnitList()).isEmpty()) {
      if (!this.moveAutoload(unit, CollectionUtils.transform$Collection$Predicate(ul, Unit.sentryPred))) {
        return false;
      }
    }
    let newTile = unit.getTile$().getNeighbourOrNull(direction);
    let discover = newTile != null && newTile.getDiscoverableRegion() != null;
    if (!this.askServer().move(unit, direction)) {
      this.changeState(unit, Unit$UnitState.SKIPPED);
      return false;
    }
    unit.getOwner().invalidateCanSeeTiles();
    if (unit.getMovesLeft() <= 0 && options.getBoolean(ClientOptions.UNIT_LAST_MOVE_DELAY)) {
      Utils.delay(InGameController.UNIT_LAST_MOVE_DELAY, 'Last move delay interrupted.');
    }
    let ret = !unit.isDisposed() && !this.checkCashInTreasureTrain(unit);
    if (ret) {
      let tile = unit.getTile$();
      if (unit.isInColony() && unit.isCarrier() && unit.getTradeRoute() == null && Map_.isSameLocation(tile, unit.getDestination())) {
        this.showColonyPanelWithCarrier(tile.getColony(), unit);
        ret = false;
      } else {
      }
    }
    return ret && !discover;
  }
  /**
   * Move to a foreign colony and either attack, negotiate with the
   * foreign power or spy on them.  Follows a move of
   * MoveType.ENTER_FOREIGN_COLONY_WITH_SCOUT.
   *
   * FIXME: Unify trade and negotiation.
   *
   * @param unit The unit that will spy, negotiate or attack.
   * @param direction The direction in which the foreign colony lies.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveScoutColony(unit: Unit, direction: Direction): boolean {
    let game = this.getGame();
    let colony = this.getSettlementAt(unit.getTile$(), direction);
    let canNeg = colony.getOwner() !== unit.getOwner().getREFPlayer();
    if (!this.askClearGotoOrders(unit)) {
      return false;
    }
    let act = this.getGUI().getScoutForeignColonyChoice(colony, unit, canNeg);
    if (act == null) {
      return true;
    }
    {
      let player: Player, agreement: DiplomaticTrade;
      switch (act) {
        case Constants$ScoutColonyAction.SCOUT_COLONY_ATTACK:
          return this.moveAttackSettlement(unit, direction);
        case Constants$ScoutColonyAction.SCOUT_COLONY_NEGOTIATE:
          player = unit.getOwner();
          agreement = new DiplomaticTrade()._DiplomaticTrade$Game$TradeContext$Player$Player$List$int(game, DiplomaticTrade$TradeContext.DIPLOMATIC, player, colony.getOwner(), null, 0);
          this.showNegotiationDialog(unit, colony, agreement, agreement.getSendMessage(player, colony), direction);
          return false;
        case Constants$ScoutColonyAction.SCOUT_COLONY_SPY:
          return this.moveSpy(unit, direction);
        default:
          InGameController.logger.warning('showScoutForeignColonyDialog fail: ' + $J.str(act));
          break;
      }
    }
    return true;
  }
  /**
   * Move a scout into an Indian settlement to speak with the chief,
   * or demand a tribute following a move of
   * MoveType.ENTER_INDIAN_SETTLEMENT_WITH_SCOUT.
   * The scout does not physically get into the village, it will
   * just stay where it is.
   *
   * @param unit The {@code Unit} that is scouting.
   * @param direction The direction in which the Indian settlement lies.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveScoutIndianSettlement(unit: Unit, direction: Direction): boolean {
    if (!this.askClearGotoOrders(unit) || !this.askServer().scoutSettlement(unit, direction)) {
      return false;
    }
    let unitTile = unit.getTile$();
    let tile = unitTile.getNeighbourOrNull(direction);
    let player = unit.getOwner();
    let is$ = tile.getIndianSettlement();
    let count = player.getNationSummary(is$.getOwner()).getNumberOfSettlements();
    let act = this.getGUI().getScoutIndianSettlementChoice(is$, (count <= 0) ? Messages.message$String('many') : String(count));
    if (act == null) {
      return false;
    }
    switch (act) {
      case Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_ATTACK:
        if (this.getGUI().confirmPreCombat(unit, tile)) {
          this.askServer().attack(unit, direction);
        }
        break;
      case Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_SPEAK:
        this.moveMode = this.moveMode.minimize(InGameController$MoveMode.EXECUTE_GOTO_ORDERS);
        this.askServer().scoutSpeakToChief(unit, is$);
        break;
      case Constants$ScoutIndianSettlementAction.SCOUT_SETTLEMENT_TRIBUTE:
        return this.moveTribute(unit, 1, direction);
      default:
        InGameController.logger.warning('showScoutIndianSettlementDialog fail: ' + $J.str(act));
        break;
    }
    return false;
  }
  /**
   * Spy on a foreign colony.
   *
   * @param unit The {@code Unit} that is spying.
   * @param direction The {@code Direction} of a colony to spy on.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveSpy(unit: Unit, direction: Direction): boolean {
    let settlement = this.getSettlementAt(unit.getTile$(), direction);
    if (settlement instanceof Colony && !unit.getOwner().owns(settlement)) {
      this.askServer().spy(unit, settlement);
    } else {
      InGameController.logger.warning('Unit ' + $J.str(unit) + ' can not spy on ' + $J.str(settlement));
    }
    return false;
  }
  /**
   * Arrive at a settlement with a laden carrier following a move of
   * MoveType.ENTER_SETTLEMENT_WITH_CARRIER_AND_GOODS.
   *
   * @param unit The carrier.
   * @param direction The direction to the settlement.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveTrade(unit: Unit, direction: Direction): boolean {
    if (!this.askClearGotoOrders(unit)) {
      return false;
    }
    let settlement = this.getSettlementAt(unit.getTile$(), direction);
    if (settlement instanceof Colony) {
      let game = this.getGame();
      let player = unit.getOwner();
      let agreement = new DiplomaticTrade()._DiplomaticTrade$Game$TradeContext$Player$Player$List$int(game, DiplomaticTrade$TradeContext.TRADE, player, settlement.getOwner(), null, 0);
      this.showNegotiationDialog(unit, settlement, agreement, agreement.getSendMessage(player, settlement), direction);
    } else if (settlement instanceof IndianSettlement) {
      this.askServer().newNativeTradeSession(unit, settlement);
      this.changeView$Unit$boolean$InGameController(unit, false);
    } else {
      throw new RuntimeException('Bogus settlement: ' + settlement.getId());
    }
    return false;
  }
  /**
   * Demand a tribute.
   *
   * @param unit The {@code Unit} to perform the attack.
   * @param amount An amount of tribute to demand.
   * @param direction The direction in which to attack.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveTribute(unit: Unit, amount: number, direction: Direction): boolean {
    let game = this.getGame();
    let player = unit.getOwner();
    let tile = unit.getTile$();
    let target = tile.getNeighbourOrNull(direction);
    let settlement = target.getSettlement();
    let other = settlement.getOwner();
    if (settlement.getOwner().isIndian()) {
      this.askServer().demandTribute(unit, direction);
      return false;
    }
    let agreement = DiplomaticTrade.makePeaceTreaty(DiplomaticTrade$TradeContext.TRIBUTE, player, other);
    agreement.add(new GoldTradeItem()._GoldTradeItem$Game$Player$Player$int(game, other, player, amount));
    return this.moveDiplomacy(unit, direction, agreement);
  }
  /**
   * Move a missionary into a native settlement, following a move of
   * MoveType.ENTER_INDIAN_SETTLEMENT_WITH_MISSIONARY.
   *
   * @param unit The {@code Unit} that will enter the settlement.
   * @param direction The direction in which the Indian settlement lies.
   * @return True if automatic movement of the unit can proceed (never).
   */
  moveUseMissionary(unit: Unit, direction: Direction): boolean {
    if (!this.askClearGotoOrders(unit)) {
      return false;
    }
    let is$ = this.getSettlementAt(unit.getTile$(), direction);
    this.getMissionaryChoice(unit, is$, direction);
    return false;
  }
  /**
   * Follows a trade route, doing load/unload actions, moving the unit,
   * and updating the stop and destination.
   *
   * @param unit The {@code Unit} on the route.
   * @param messages An optional list in which to retain any
   *     {@code ModelMessage}s generated.
   * @return True if automatic movement can proceed.
   */
  followTradeRoute(unit: Unit, messages: List<ModelMessage>): boolean {
    let player = unit.getOwner();
    let tr = unit.getTradeRoute();
    let detailed = this.getClientOptions().getBoolean(ClientOptions.SHOW_GOODS_MOVEMENT);
    let checkProduction = this.getClientOptions().getBoolean(ClientOptions.STOCK_ACCOUNTS_FOR_PRODUCTION);
    let stops = unit.getCurrentStops();
    let result = true;
    let lb = new LogBuilder()._LogBuilder((detailed && !tr.isSilent()) ? 256 : -1);
    lb.mark();
    let valid = true;
    for (const $it9 = stops.iterator(); $it9.hasNext(); ) {
      let trs = $it9.next();
      if (!TradeRoute.isStopValid$Unit$TradeRouteStop(unit, trs)) {
        lb.add([' ', Messages.message$StringTemplate(trs.invalidStopLabel(player))]);
        valid = false;
      }
    }
    if (!valid) {
      this.clearOrders(unit);
      stops.clear();
      result = false;
    }
    while (!stops.isEmpty()) {
      let stop = stops.removeAt(0);
      if (!unit.atStop(stop)) {
        if (unit.getMovesLeft() <= 0 || unit.getState() === Unit$UnitState.SKIPPED) {
          lb.add([' ', Messages.message$StringTemplate(stop.getLabelFor('tradeRoute.toStop', player))]);
          break;
        }
        let destination = stop.getLocation();
        let path = unit.findPath$Location(destination);
        if (path == null) {
          lb.add(['\n', Messages.message$StringTemplate(stop.getLabelFor('tradeRoute.pathStop', player))]);
          this.changeState(unit, Unit$UnitState.SKIPPED);
          break;
        }
        this.movePath(unit, path);
        if (!unit.atStop(stop)) {
          this.changeState(unit, Unit$UnitState.SKIPPED);
          break;
        }
      }
      lb.mark();
      this.unloadUnitAtStop(unit, lb);
      this.loadUnitAtStop(unit, lb);
      lb.grew(['\n', Messages.message$StringTemplate(stop.getLabelFor('tradeRoute.atStop', player))]);
      if (unit.getMovesLeft() <= 0) {
        break;
      }
      let next = null;
      let moreStops = unit.getCurrentStops();
      if (unit.atStop(moreStops.get(0))) {
        moreStops.removeAt(0);
      }
      for (const $it10 = moreStops.iterator(); $it10.hasNext(); ) {
        let trs = $it10.next();
        if (trs.hasWork(unit, (!checkProduction) ? 0 : unit.getTurnsToReach$Location(trs.getLocation()))) {
          next = trs;
          break;
        }
      }
      if (next == null) {
        lb.add([' ', Messages.message$String('tradeRoute.wait')]);
        this.changeState(unit, Unit$UnitState.SKIPPED);
        unit.setMovesLeft(0);
        break;
      }
      let skipped = tr.getStopSublist(stops.get(0), next);
      if (!skipped.isEmpty()) {
        let t = StringTemplate.label('').add$String('tradeRoute.skipped');
        let sep = ' ';
        for (const $it11 = skipped.iterator(); $it11.hasNext(); ) {
          let trs = $it11.next();
          t.addName$String(sep).addStringTemplate$StringTemplate(trs.getLocation().getLocationLabelFor(player));
          sep = ', ';
        }
        t.addName$String('.');
        lb.add([' ', Messages.message$StringTemplate(t)]);
      }
      while (!stops.isEmpty() && stops.get(0) !== next) {
        stops.removeAt(0);
      }
      if (!this.askServer().setCurrentStop(unit, tr.getIndex(next))) {
        this.changeState(unit, Unit$UnitState.SKIPPED);
        break;
      }
    }
    if (lb.grew([])) {
      let m = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.GOODS_MOVEMENT, 'tradeRoute.prefix', unit).addName$String$String('%route%', tr.getName()).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addName$String$String('%data%', lb.toString());
      if (messages != null) {
        messages.add(m);
      } else {
        player.addModelMessage(m);
        this.turnReportMessages.add(m);
      }
    }
    return result;
  }
  /**
   * Work out what goods to load onto a unit at a stop, and load them.
   *
   * @param unit The {@code Unit} to load.
   * @param lb A {@code LogBuilder} to update.
   * @return True if goods were loaded.
   */
  loadUnitAtStop(unit: Unit, lb: LogBuilder): boolean {
    let enhancedTradeRoutes = this.getSpecification().getBoolean(GameOptions.ENHANCED_TRADE_ROUTES);
    let tradeRoute = unit.getTradeRoute();
    let trl = unit.getTradeLocation();
    if (trl == null) {
      return false;
    }
    let stop = unit.getStop();
    let ret = false;
    let toLoad = stop.getCompactCargo();
    let unexpected = StringTemplate.label(', ');
    let noLoad = StringTemplate.label(', ');
    let left = StringTemplate.label(', ');
    let loaded = StringTemplate.label(', ');
    let nonePresent = StringTemplate.label(', ');
    for (const $it12 = unit.getCompactGoodsList().iterator(); $it12.hasNext(); ) {
      let g = $it12.next();
      let ag = CollectionUtils.find$Collection$Predicate(toLoad, AbstractGoods.matches(g.getType()));
      if (ag == null) {
        unexpected.addStringTemplate$StringTemplate(g.getLabel$());
      } else {
        let goodsAmount = g.getAmount();
        if (ag.getAmount() <= goodsAmount) {
          noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.carrier').addNamed$String$Named('%goodsType%', ag.getType()));
          toLoad.remove(ag);
        } else {
          ag.setAmount((ag.getAmount() - goodsAmount) | 0);
        }
      }
    }
    let limit = new HashMap();
    let iterator = toLoad.iterator();
    while (iterator.hasNext()) {
      let ag = iterator.next();
      let type$ = ag.getType();
      let present = stop.getAvailableGoodsCount(type$);
      let exportAmount = stop.getExportAmount(type$, 0);
      let importAmount = Constants.INFINITY;
      let unload = null;
      if (enhancedTradeRoutes) {
        let stops = unit.getCurrentStops();
        stops.removeAt(0);
        let start = unit.getLocation();
        let turns = 0;
        for (const $it13 = stops.iterator(); $it13.hasNext(); ) {
          let trs = $it13.next();
          turns = (turns + unit.getTurnsToReach$Location$Location(start, trs.getLocation())) | 0;
          let amountIn = trs.getImportAmount(type$, turns);
          let amountOut = trs.getExportAmount(type$, turns);
          if (CollectionUtils.none$Collection$Predicate(trs.getCompactCargo(), AbstractGoods.matches(type$)) || amountIn > amountOut) {
            importAmount = amountIn;
            unload = trs;
            break;
          }
          start = trs.getLocation();
        }
      }
      if (enhancedTradeRoutes && unload == null) {
        noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.noUnload').addNamed$String$Named('%goodsType%', type$));
        ag.setAmount(0);
      } else if (present <= 0) {
        nonePresent.addNamed$Named(type$);
        ag.setAmount(0);
      } else if (exportAmount <= 0) {
        noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.export').addNamed$String$Named('%goodsType%', type$).addAmount('%more%', present));
        ag.setAmount(0);
      } else if (importAmount <= 0) {
        noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.import').addNamed$String$Named('%goodsType%', type$).addAmount('%more%', present).addStringTemplate$String$StringTemplate('%location%', unload.getLocation().getLocationLabelFor(unit.getOwner())));
        ag.setAmount(0);
      } else if (exportAmount <= importAmount && exportAmount < ag.getAmount()) {
        ag.setAmount(exportAmount);
        limit.put(type$, stop.getLocation());
      } else if (importAmount <= exportAmount && importAmount < ag.getAmount()) {
        let already = unit.getGoodsCount(type$);
        if (already >= importAmount) {
          if (already > importAmount) {
            this.askUnloadGoods(type$, (already - importAmount) | 0, unit);
          }
          noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.already').addNamed$String$Named('%goodsType%', type$));
          ag.setAmount(0);
        } else {
          ag.setAmount((importAmount - already) | 0);
        }
        limit.put(type$, unload.getLocation());
      } else if (present > ag.getAmount()) {
        limit.put(type$, unit);
      } else {
        limit.put(type$, null);
      }
      if (ag.getAmount() <= 0) {
        iterator.remove();
      }
      InGameController.logger.log(Level.FINEST, 'Load ' + tradeRoute.getName() + ' with ' + unit.getId() + ' at ' + $J.str(stop.getLocation()) + ' of ' + type$.getSuffix$() + ' from ' + present + ' exporting ' + exportAmount + ' importing ' + importAmount + ' to ' + ((unload == null) ? '?' : unload.getLocation().toString()) + ' limited by ' + $J.str(limit.get(type$)) + ' -> ' + ag.getAmount());
    }
    if (enhancedTradeRoutes) {
      toLoad.sort(AbstractGoods.descendingAmountComparator);
    }
    let done = false;
    for (const $it14 = toLoad.iterator(); $it14.hasNext(); ) {
      let ag = $it14.next();
      let type$ = ag.getType();
      let amount = ag.getAmount();
      if (!done) {
        if (unit.getLoadableAmount(type$) < amount) {
          done = true;
        } else if (stop.getLocation() instanceof Europe) {
          done = !this.buyGoods(type$, amount, unit);
        } else {
          done = !this.askLoadGoods(stop.getLocation(), type$, amount, unit);
        }
      }
      if (done) {
        left.addNamed$Named(ag);
        continue;
      }
      let present = stop.getAvailableGoodsCount(type$);
      let why = limit.get(type$);
      if (present === 0) {
        loaded.addStringTemplate$StringTemplate(ag.getLabel$());
      } else if (why == null) {
        loaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.load.fail').addStringTemplate$String$StringTemplate('%goods%', ag.getLabel$()).addAmount('%more%', present));
      } else if (why === unit) {
        loaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.load.carrier').addStringTemplate$String$StringTemplate('%goods%', ag.getLabel$()).addAmount('%more%', present));
      } else if (Map_.isSameLocation(why, stop.getLocation())) {
        loaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.load.export').addStringTemplate$String$StringTemplate('%goods%', ag.getLabel$()).addAmount('%more%', present));
      } else {
        loaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.load.import').addStringTemplate$String$StringTemplate('%goods%', ag.getLabel$()).addAmount('%more%', present).addStringTemplate$String$StringTemplate('%location%', why.getLocationLabelFor(unit.getOwner())));
      }
      ret = true;
    }
    if (!loaded.isEmpty()) {
      lb.add(['\n  ', Messages.message$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.load').addStringTemplate$String$StringTemplate('%goodsList%', loaded))]);
    }
    if (!unexpected.isEmpty()) {
      lb.add(['\n  ', Messages.message$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.unexpected').addStringTemplate$String$StringTemplate('%goodsList%', unexpected))]);
    }
    if (!left.isEmpty()) {
      noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.left').addStringTemplate$String$StringTemplate('%goodsList%', left));
    }
    if (!nonePresent.isEmpty()) {
      noLoad.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad.goods').addStringTemplate$String$StringTemplate('%goodsList%', nonePresent));
    }
    if (!noLoad.isEmpty()) {
      lb.add(['\n  ', Messages.message$StringTemplate(StringTemplate.template$String('tradeRoute.loadStop.noLoad').addStringTemplate$String$StringTemplate('%goodsList%', noLoad))]);
    }
    return ret;
  }
  /**
   * Work out what goods to unload from a unit at a stop, and unload them.
   *
   * @param unit The {@code Unit} to unload.
   * @param lb A {@code LogBuilder} to update.
   * @return True if something was unloaded.
   */
  unloadUnitAtStop(unit: Unit, lb: LogBuilder): boolean {
    let trl = unit.getTradeLocation();
    if (trl == null) {
      return false;
    }
    let stop = unit.getStop();
    let goodsTypesToLoad = stop.getCargo();
    let unloaded = StringTemplate.label(', ');
    let noUnload = StringTemplate.label(', ');
    let ret = false;
    for (const $it15 = unit.getCompactGoodsList().iterator(); $it15.hasNext(); ) {
      let goods = $it15.next();
      let type$ = goods.getType();
      if (goodsTypesToLoad.contains(type$)) {
        continue;
      }
      let present = goods.getAmount();
      if (present <= 0) {
        InGameController.logger.warning('Unexpected empty goods unload ' + $J.str(goods));
        continue;
      }
      let toUnload = present;
      let atStop = trl.getImportAmount(type$, 0);
      let amount = toUnload;
      if (amount > atStop) {
        let locName = (trl).getLocationLabel();
        let option = this.getClientOptions().getInteger(ClientOptions.UNLOAD_OVERFLOW_RESPONSE);
        {
          let template: StringTemplate;
          switch (option) {
            case ClientOptions.UNLOAD_OVERFLOW_RESPONSE_ASK:
              template = StringTemplate.template$String('traderoute.warehouseCapacity').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addStringTemplate$String$StringTemplate('%colony%', locName).addAmount('%amount%', (toUnload - atStop) | 0).addNamed$String$Named('%goods%', goods);
              if (!this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), template, unit, 'yes', 'no')) {
                if (atStop === 0) {
                  continue;
                }
                amount = atStop;
              }
              break;
            case ClientOptions.UNLOAD_OVERFLOW_RESPONSE_NEVER:
              amount = atStop;
              break;
            case ClientOptions.UNLOAD_OVERFLOW_RESPONSE_ALWAYS:
              break;
            default:
              InGameController.logger.warning('Illegal UNLOAD_OVERFLOW_RESPONSE: ' + String(option));
              break;
          }
        }
      }
      if (amount === 0) {
        noUnload.addStringTemplate$StringTemplate(goods.getLabel$());
        continue;
      }
      ret = this.askUnloadGoods(type$, amount, unit);
      let retained = unit.getGoodsCount(type$);
      if (!ret || present === retained) {
        noUnload.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.unloadStop.noUnload.fail').addStringTemplate$String$StringTemplate('%goods%', goods.getLabel$()));
        ret = false;
        break;
      }
      if (((present - retained) | 0) !== amount) {
        unloaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.unloadStop.unload.fail').addNamed$String$Named('%goodsType%', type$).addAmount('%amount%', amount).addAmount('%more%', retained));
      } else if (amount > atStop) {
        if (retained > 0) {
          unloaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.unloadStop.unload.keep').addNamed$String$Named('%goodsType%', type$).addAmount('%amount%', atStop).addAmount('%more%', retained));
        } else {
          unloaded.addStringTemplate$StringTemplate(StringTemplate.template$String('tradeRoute.unloadStop.unload.overflow').addNamed$String$Named('%goodsType%', type$).addAmount('%amount%', atStop).addAmount('%more%', (amount - atStop) | 0));
        }
      } else {
        unloaded.addStringTemplate$StringTemplate(goods.getLabel$());
      }
    }
    if (!unloaded.isEmpty()) {
      lb.add(['\n  ', Messages.message$StringTemplate(StringTemplate.template$String('tradeRoute.unloadStop.unload').addStringTemplate$String$StringTemplate('%goodsList%', unloaded))]);
    }
    if (!noUnload.isEmpty()) {
      lb.add(['\n  ', Messages.message$StringTemplate(StringTemplate.template$String('tradeRoute.unloadStop.noUnload').addStringTemplate$String$StringTemplate('%goodsList%', noUnload))]);
    }
    return ret;
  }
  /**
   * Abandon a colony with no units.
   *
   * Called from ColonyPanel.closeColonyPanel
   *
   * @param colony The {@code Colony} to be abandoned.
   * @return True if the colony was abandoned.
   */
  abandonColony(colony: Colony): boolean {
    let player = this.getMyPlayer();
    if (colony == null || !player.owns(colony) || colony.getUnitCount() > 0 || !this.requireOurTurn()) {
      return false;
    }
    let tile = colony.getTile$();
    let ret = this.askServer().abandonColony(colony) && !tile.hasSettlement();
    if (ret) {
      player.invalidateCanSeeTiles();
      this.updateGUI(tile, false);
    }
    return ret;
  }
  /**
   * Handle an addPlayer message.
   *
   * @param players The {@code Player}s to add.
   */
  addPlayerHandler(players: List<Player>): void {
    this.getGame().addPlayers(players);
  }
  /**
   * Animate an attack.
   *
   * @param attacker The attacking {@code Unit}.
   * @param defender The defending {@code Unit}.
   * @param attackerTile The {@code Tile} the attack originates from.
   * @param defenderTile The {@code Tile} the defence takes place on.
   * @param success True if the attack succeeds.
   */
  animateAttackHandler(attacker: Unit, defender: Unit, attackerTile: Tile, defenderTile: Tile, success: boolean): void {
    this.invokeLater(() => {
      this.getGUI().animateUnitAttack(attacker, defender, attackerTile, defenderTile, success);
    });
  }
  /**
   * Animate a move.
   *
   * @param unit The {@code Unit} that moves.
   * @param oldTile The {@code Tile} the move begins at.
   * @param newTile The {@code Tile} the move ends at.
   */
  animateMoveHandler(unit: Unit, oldTile: Tile, newTile: Tile): void {
    this.invokeLater(() => {
      this.getGUI().animateUnitMove(unit, oldTile, newTile);
    });
  }
  /**
   * Assigns a student to a teacher.
   *
   * Called from UnitLabel
   *
   * @param student The student {@code Unit}.
   * @param teacher The teacher {@code Unit}.
   * @return True if the student was assigned.
   */
  assignTeacher(student: Unit, teacher: Unit): boolean {
    let player = this.getMyPlayer();
    if (student == null || !player.owns(student) || student.getColony() == null || !student.isInColony() || teacher == null || !player.owns(teacher) || !student.canBeStudent(teacher) || teacher.getColony() == null || student.getColony() !== teacher.getColony() || !teacher.getColony().canTrain$Unit(teacher) || !this.requireOurTurn()) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(student);
    let ret = this.askServer().assignTeacher(student, teacher) && student.getTeacher() === teacher;
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Assigns a trade route to a unit.
   *
   * Called from EuropePanel.DestinationPanel, TradeRoutePanel(),
   * TradeRoutePanel.newRoute
   *
   * @param unit The {@code Unit} to assign a trade route to.
   * @param tradeRoute The {@code TradeRoute} to assign.
   * @return True if the route was successfully assigned.
   */
  assignTradeRoute(unit: Unit, tradeRoute: TradeRoute): boolean {
    if (unit == null) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askAssignTradeRoute(unit, tradeRoute);
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Boards a specified unit onto a carrier.
   * The carrier must be at the same location as the boarding unit.
   *
   * Called from CargoPanel, TilePopup.
   *
   * @param unit The {@code Unit} which is to board the carrier.
   * @param carrier The location of this Unit.
   * @return True if the unit boards the carrier.
   */
  boardShip(unit: Unit, carrier: Unit): boolean {
    if (unit == null || unit.isCarrier() || carrier == null || !carrier.canCarryUnits() || !unit.isAtLocation(carrier.getLocation()) || !this.requireOurTurn()) {
      return false;
    }
    let ret = this.askEmbark(unit, carrier);
    if (ret) {
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Use the active unit to build a colony.
   *
   * Called from BuildColonyAction.
   *
   * @param unit The {@code Unit} to build the colony.
   * @return True if a colony was built.
   */
  buildColony(unit: Unit): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    let tile = unit.getTile$();
    if (tile == null) {
      return false;
    }
    if (!unit.canBuildColony()) {
      this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('buildColony.badUnit').addName$String$String('%unit%', unit.getName()));
      return false;
    }
    if (this.joinColony(unit) || tile.getColony() != null) {
      return false;
    }
    let player = this.getMyPlayer();
    let reason = player.canClaimToFoundSettlementReason(tile);
    switch (reason) {
      case Player$NoClaimReason.NONE:
      case Player$NoClaimReason.NATIVES:
        break;
      default:
        this.showInformationPanel$FreeColObject$String$InGameController(null, reason.getDescriptionKey());
        return false;
    }
    if (this.getClientOptions().getBoolean(ClientOptions.SHOW_COLONY_WARNINGS)) {
      let warnings = tile.getBuildColonyWarnings(unit);
      if (!warnings.isEmpty() && !this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(tile, warnings, unit, 'buildColony.yes', 'buildColony.no')) {
        return false;
      }
    }
    let name = this.getGUI().getNewColonyName(player, tile);
    if (name == null) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = player.owns(tile);
    if (!ret) {
      ret = this.askClaimTile(player, tile, unit, player.getLandPrice(tile));
      if (!ret) {
        NameCache.putSettlementName(player, name);
      }
    }
    if (ret) {
      ret = this.askServer().buildColony(name, unit) && tile.hasSettlement();
      if (ret) {
        this.sound('sound.event.buildingComplete');
        player.invalidateCanSeeTiles();
        this.fireChanges([unitWas]);
        for (const $it16 = tile.getUnitList().iterator(); $it16.hasNext(); ) {
          let u = $it16.next();
          this.checkCashInTreasureTrain(u);
        }
        this.updateGUI(null, false);
        this.showColonyPanelWithCarrier(tile.getSettlement(), unit);
      }
    }
    return ret;
  }
  /**
   * Buy goods in Europe.
   * The amount of goods is adjusted to the space in the carrier.
   *
   * Called from CargoPanel, TilePopup, loadCargo()
   *
   * @param type The type of goods to buy.
   * @param amount The amount of goods to buy.
   * @param carrier The {@code Unit} acting as carrier.
   * @return True if the purchase succeeds.
   */
  buyGoods(type$: GoodsType, amount: number, carrier: Unit): boolean {
    let player = this.getMyPlayer();
    if (type$ == null || amount <= 0 || carrier == null || !carrier.isInEurope() || !player.owns(carrier) || !this.requireOurTurn()) {
      return false;
    }
    let europe = player.getEurope();
    let europeWas = new EuropeWas()._EuropeWas(europe);
    let marketWas = new MarketWas()._MarketWas(player);
    let unitWas = new UnitWas()._UnitWas(carrier);
    let ret = this.askLoadGoods(europe, type$, amount, carrier);
    if (ret) {
      marketWas.add(new AbstractGoods()._AbstractGoods$GoodsType$int(type$, -amount));
      this.sound('sound.event.loadCargo');
      this.fireChanges([unitWas, europeWas, marketWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Sends a public chat message.
   *
   * Called from ChatPanel
   *
   * @param chat The text of the message.
   * @return True if the message was sent.
   */
  chat(chat: string): boolean {
    if (chat == null) {
      return false;
    }
    let player = this.getMyPlayer();
    let sent = this.askServer().chat(player, chat);
    this.displayChat(player.getName(), chat, player.getNationColor(), false);
    return sent;
  }
  /**
   * Chat with another player.
   *
   * @param sender The sender of the chat message.
   * @param message What to say.
   * @param color The message color.
   * @param pri If true, the message is private.
   */
  chatHandler(sender: string, message: string, color: Color, pri: boolean): void {
    this.displayChat(sender, message, color, pri);
  }
  /**
   * Changes the state of this {@code Unit}.
   *
   * Called from FortifyAction, SentryAction, TilePopup, UnitLabel
   *
   * @param unit The {@code Unit}
   * @param state The state of the unit.
   * @return True if the state was changed.
   */
  changeState(unit: Unit, state: Unit$UnitState): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    if (unit.getState() === state) {
      return true;
    }
    if (!unit.checkSetState(state)) {
      return false;
    }
    let player = this.getMyPlayer();
    if (state === Unit$UnitState.FORTIFYING && unit.isOffensiveUnit() && !unit.isOwnerHidden()) {
      let tile = unit.getTile$();
      if (tile != null && tile.getOwningSettlement() != null) {
        let enemy = tile.getOwningSettlement().getOwner();
        if (player !== enemy && player.getStance(enemy) !== Stance.ALLIANCE && !this.getGUI().confirmHostileAction(unit, tile)) {
          return false;
        }
      }
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().changeState(unit, state) && unit.getState() === state;
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Changes the work type of this {@code Unit}.
   *
   * Called from ImprovementAction.
   *
   * @param unit The {@code Unit}
   * @param improvementType a {@code TileImprovementType} value
   * @return True if the improvement was changed.
   */
  changeWorkImprovementType(unit: Unit, improvementType: TileImprovementType): boolean {
    if (unit == null || !unit.hasTile() || !unit.checkSetState(Unit$UnitState.IMPROVING) || improvementType == null || improvementType.isNatural() || !this.requireOurTurn()) {
      return false;
    }
    let player = this.getMyPlayer();
    let tile = unit.getTile$();
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = player.owns(tile) || this.askClaimTile(player, tile, unit, player.getLandPrice(tile));
    if (ret) {
      this.updateGUI(null, false);
      ret = this.askServer().changeWorkImprovementType(unit, improvementType) && unit.getWorkImprovement() != null && unit.getWorkImprovement().getType() === improvementType;
      if (ret) {
        this.fireChanges([unitWas]);
        this.updateGUI(null, false);
      }
    }
    return ret;
  }
  /**
   * Changes the work type of this {@code Unit}.
   *
   * Called from ColonyPanel.tryWork, UnitLabel
   *
   * @param unit The {@code Unit}
   * @param workType The new {@code GoodsType} to produce.
   * @return True if the work type was changed.
   */
  changeWorkType(unit: Unit, workType: GoodsType): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().changeWorkType(unit, workType) && unit.getWorkType() === workType;
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Check if a unit is a treasure train, and if it should be cashed in.
   * Transfers the gold carried by this unit to the {@link Player owner}.
   *
   * Called from TilePopup
   *
   * @param unit The {@code Unit} to be checked.
   * @return True if the unit was cashed in (and disposed).
   */
  checkCashInTreasureTrain(unit: Unit): boolean {
    if (unit == null || !unit.canCarryTreasure() || !unit.canCashInTreasureTrain$() || !this.requireOurTurn()) {
      return false;
    }
    let tile = unit.getTile$();
    let europe = unit.getOwner().getEurope();
    if (europe == null || unit.isInEurope()) {
    } else {
      let fee = unit.getTransportFee();
      let template: StringTemplate;
      if (fee === 0) {
        template = StringTemplate.template$String('cashInTreasureTrain.free');
      } else {
        let percent = this.getSpecification().getInteger(GameOptions.TREASURE_TRANSPORT_FEE);
        template = StringTemplate.template$String('cashInTreasureTrain.pay').addAmount('%fee%', percent);
      }
      if (!this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), template, unit, 'accept', 'reject')) {
        return false;
      }
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().cashInTreasureTrain(unit) && unit.isDisposed();
    if (ret) {
      this.sound('sound.event.cashInTreasureTrain');
      this.fireChanges([unitWas]);
    }
    return ret;
  }
  /**
   * Choose a founding father from an offered list.
   *
   * @param ffs A list of {@code FoundingFather}s to choose from.
   * @param ff The chosen {@code FoundingFather} (may be null).
   * @return True if a father was chosen.
   */
  chooseFoundingFather(ffs: List<FoundingFather>, ff: FoundingFather): boolean {
    if (ffs == null) {
      return false;
    }
    if (ff == null) {
      return false;
    }
    let player = this.getMyPlayer();
    player.setCurrentFather(ff);
    return this.askServer().chooseFoundingFather(ffs, ff);
  }
  /**
   * Choose a founding father from an offered list.
   *
   * @param ffs A list of {@code FoundingFather}s to choose from.
   */
  chooseFoundingFatherHandler(ffs: List<FoundingFather>): void {
    if (ffs == null || ffs.isEmpty()) {
      return;
    }
    this.invokeLater(() => this.getGUI().showChooseFoundingFatherDialog(ffs, (ff) => this.chooseFoundingFather(ffs, ff)));
  }
  /**
   * Claim a tile.
   *
   * Called from ColonyPanel.ASingleTilePanel, UnitLabel and work()
   *
   * @param tile The {@code Tile} to claim.
   * @param claimant The {@code Unit} or {@code Colony} claiming.
   * @return True if the claim succeeded.
   */
  claimTile(tile: Tile, claimant: FreeColGameObject): boolean {
    if (tile == null || claimant == null || !this.requireOurTurn()) {
      return false;
    }
    let player = this.getMyPlayer();
    let price = ((claimant instanceof Settlement) ? player.canClaimForSettlement(tile) : player.canClaimForImprovement(tile)) ? 0 : player.getLandPrice(tile);
    let unitWas = (claimant instanceof Unit) ? new UnitWas()._UnitWas(claimant) : null;
    let ret = this.askClaimTile(player, tile, claimant, price);
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Clears the goto orders of the given unit by setting its destination
   * to null.
   *
   * Called from CanvasMouseListener
   *
   * @param unit The {@code Unit} to clear the destination for.
   * @return True if the unit has no destination.
   */
  clearGotoOrders(unit: Unit): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askClearGotoOrders(unit);
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Clears the orders of the given unit.
   * Make the unit active and set a null destination and trade route.
   *
   * Called from ClearOrdersAction, TilePopup, TradeRoutePanel, UnitLabel
   *
   * @param unit The {@code Unit} to clear the orders of
   * @return boolean <b>true</b> if the orders were cleared
   */
  clearOrders(unit: Unit): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    if (unit.getState() === Unit$UnitState.IMPROVING && !this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), StringTemplate.template$String('clearOrders.text').addAmount('%turns%', unit.getWorkTurnsLeft()), unit, 'ok', 'cancel')) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askClearGotoOrders(unit) && this.changeState(unit, Unit$UnitState.ACTIVE);
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Clear the speciality of a Unit, making it a Free Colonist.
   *
   * Called from UnitLabel
   *
   * @param unit The {@code Unit} to clear the speciality of.
   * @return True if the speciality was cleared.
   */
  clearSpeciality(unit: Unit): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    let uc = unit.getUnitChange$String(UnitChangeType.CLEAR_SKILL);
    let newType = (uc == null) ? null : uc.to;
    if (newType == null) {
      this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, StringTemplate.template$String('clearSpeciality.impossible').addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
      return false;
    }
    let tile = (this.getGUI().isPanelShowing()) ? null : unit.getTile$();
    if (!this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(tile, StringTemplate.template$String('clearSpeciality.areYouSure').addStringTemplate$String$StringTemplate('%oldUnit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addNamed$String$Named('%unit%', newType), unit, 'ok', 'cancel')) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().clearSpeciality(unit) && unit.getType() === newType;
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Special handling when we close a colony panel.
   *
   * @param colony The {@code Colony} to close.
   * @param abandon True if abandoning, otherwise just update.
   */
  closeColony(colony: Colony, abandon: boolean): void {
    if (abandon) {
      this.abandonColony(colony);
    } else {
      this.updateGUI(colony.getTile$(), false);
    }
  }
  /**
   * Close any open GUI menus.
   *
   * @param panel The identifier for the panel to close.
   */
  closeHandler(panel: string): void {
    this.getGUI().closePanel(panel);
  }
  /**
   * Declares independence for the home country.
   *
   * Called from DeclareIndependenceAction
   *
   * @return True if independence was declared.
   */
  declareIndependence(): boolean {
    if (!this.requireOurTurn()) {
      return false;
    }
    let player = this.getMyPlayer();
    if (player.getNewLandName() == null) {
      return false;
    }
    let declare$ = player.checkDeclareIndependence();
    if (declare$ != null) {
      this.showInformationPanel$FreeColObject$StringTemplate$InGameController(null, declare$);
      return false;
    }
    let names = this.getGUI().showConfirmDeclarationDialog();
    if (names == null || names.get(0) == null || (names.get(0).length === 0) || names.get(1) == null || (names.get(1).length === 0)) {
      return false;
    }
    this.getGUI().showDeclarationPanel(() => {
      this.askServer().declareIndependence(names.get(0), names.get(1));
      this.updateGUI(null, false);
    });
    return true;
  }
  /**
   * Delete a trade route.
   *
   * Called from TradeRoutePanel button.
   *
   * @param tradeRoute The {@code TradeRoute} to delete.
   * @return True if the route was successfully deleted.
   */
  deleteTradeRoute(tradeRoute: TradeRoute): boolean {
    let player = this.getMyPlayer();
    let name = tradeRoute.getName();
    let ret = this.askServer().deleteTradeRoute(tradeRoute);
    return ret && player.getTradeRouteByName(name, null) == null;
  }
  /**
   * Handle a diplomatic offer.
   *
   * @param our Our {@code FreeColGameObject} that is negotiating.
   * @param other The other {@code FreeColGameObject}.
   * @param agreement The {@code DiplomaticTrade} agreement.
   */
  diplomacyHandler(our: FreeColGameObject, other: FreeColGameObject, agreement: DiplomaticTrade): void {
    let player = this.getMyPlayer();
    let otherPlayer = agreement.getOtherPlayer(player);
    let t: StringTemplate;
    let nation = otherPlayer.getNationLabel();
    {
      let visibilityChange: boolean, mm: ModelMessage;
      switch (agreement.getStatus()) {
        case DiplomaticTrade$TradeStatus.ACCEPT_TRADE:
          visibilityChange = false;
          for (const $it17 = agreement.getColoniesGivenBy(player).iterator(); $it17.hasNext(); ) {
            let c = $it17.next();
            player.removeSettlement(c);
            visibilityChange = true;
          }
          for (const $it18 = agreement.getUnitsGivenBy(player).iterator(); $it18.hasNext(); ) {
            let u = $it18.next();
            player.removeUnit(u);
            visibilityChange = true;
          }
          if (visibilityChange) {
            player.invalidateCanSeeTiles();
          }
          mm = new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.FOREIGN_DIPLOMACY, 'diplomacy.offerAccepted', otherPlayer).addStringTemplate$String$StringTemplate('%nation%', nation);
          player.addModelMessage(mm);
          this.updateGUI(null, false);
          break;
        case DiplomaticTrade$TradeStatus.REJECT_TRADE:
          t = StringTemplate.template$String('diplomacy.offerRejected').addStringTemplate$String$StringTemplate('%nation%', nation);
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(null, t);
          break;
        case DiplomaticTrade$TradeStatus.PROPOSE_TRADE:
          this.invokeLater(() => {
            let template = agreement.getReceiveMessage(otherPlayer);
            let ourAgreement = this.getGUI().showNegotiationDialog(our, other, agreement, template);
            if (ourAgreement == null) {
              ourAgreement = agreement;
              ourAgreement.setStatus(DiplomaticTrade$TradeStatus.REJECT_TRADE);
            }
            this.askServer().diplomacy(our, other, ourAgreement);
          });
          break;
        default:
          InGameController.logger.warning('Bogus trade status: ' + $J.str(agreement.getStatus()));
          break;
      }
    }
  }
  /**
   * Disbands the active unit.
   *
   * Called from DisbandUnitAction.
   *
   * @param unit The {@code Unit} to disband.
   * @return True if the unit was disbanded.
   */
  disbandUnit(unit: Unit): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    if (unit.getColony() != null && !this.getGUI().confirmLeaveColony(unit)) {
      return false;
    }
    let tile = (this.getGUI().isPanelShowing()) ? null : unit.getTile$();
    if (!this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(tile, StringTemplate.key$String('disbandUnit.text'), unit, 'disbandUnit.yes', 'cancel')) {
      return false;
    }
    let ret = this.askServer().disbandUnit(unit) && unit.isDisposed();
    if (ret) {
      this.updateGUI(tile, false);
    }
    if (this.getMyPlayer().getUnitCount$() === 0 && this.setDead()) {
      this.updateGUI(null, true);
    }
    return ret;
  }
  /**
   * Emigrate a unit from Europe.
   *
   * @param player The {@code Player} that owns the unit.
   * @param slot The slot to emigrate from, [0..RECRUIT_COUNT].
   * @param n The number of remaining units known to be eligible to migrate.
   * @param foY True if this migration is due to a fountain of youth event.
   */
  emigrate(player: Player, slot: number, n: number, foY: boolean): void {
    if (player == null || !player.isColonial() || !Europe$MigrationType.validMigrantSlot(slot)) {
      return;
    }
    if (this.askEmigrate(player.getEurope(), slot) != null) {
      this.emigration(player, n, foY);
    }
  }
  /**
   * End the turn command.
   *
   * Called from EndTurnAction, GUI.showEndTurnDialog
   *
   * @param showDialog If false, suppress showing the end turn dialog.
   */
  endTurn(showDialog: boolean): void {
    if (!this.requireOurTurn()) {
      return;
    }
    this.doEndTurn(showDialog && this.getClientOptions().getBoolean(ClientOptions.SHOW_END_TURN_DIALOG));
  }
  /**
   * Change the role-equipment a unit has.
   *
   * Called from DefaultTransferHandler, QuickActionMenu
   *
   * @param unit The {@code Unit}.
   * @param role The {@code Role} to assume.
   * @param roleCount The role count.
   * @return True if the role is taken.
   */
  equipUnitForRole(unit: Unit, role: Role, roleCount: number): boolean {
    if (unit == null || role == null || 0 > roleCount || roleCount > role.getMaximumCount() || !this.requireOurTurn()) {
      return false;
    }
    if (role === unit.getRole() && roleCount === unit.getRoleCount()) {
      return true;
    }
    let player = this.getMyPlayer();
    let colony = unit.getColony();
    let colonyWas = null;
    let europeWas = null;
    let marketWas = null;
    let price = -1;
    let req = unit.getGoodsDifference(role, roleCount);
    if (unit.isInEurope()) {
      europeWas = new EuropeWas()._EuropeWas(player.getEurope());
      marketWas = new MarketWas()._MarketWas(player);
      for (const $it19 = req.iterator(); $it19.hasNext(); ) {
        let ag = $it19.next();
        let goodsType = ag.getType();
        if (!player.canTrade$GoodsType(goodsType) && !this.payArrears(goodsType)) {
          return false;
        }
      }
      try {
        price = player.getEurope().priceGoods(req);
        if (!player.checkGold(price)) {
          return false;
        }
      } catch ($e20) {
        if ($J.isa($e20, FreeColException)) {
          let fce = $J.exc($e20);
          return false;
        } else {
          throw $e20;
        }
      }
      for (const $it21 = req.iterator(); $it21.hasNext(); ) {
        let ag = $it21.next();
        ag.setAmount(-ag.getAmount());
      }
      marketWas.addAll(req);
    } else if (colony != null) {
      colonyWas = new ColonyWas()._ColonyWas(colony);
      for (const $it22 = req.iterator(); $it22.hasNext(); ) {
        let ag = $it22.next();
        if (colony.getGoodsCount(ag.getType()) < ag.getAmount()) {
          let template = StringTemplate.template$String('equipUnit.impossible').addName$String$String('%colony%', colony.getName()).addNamed$String$Named('%equipment%', ag.getType()).addStringTemplate$String$StringTemplate('%unit%', unit.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL));
          this.showInformationPanel$FreeColObject$StringTemplate$InGameController(unit, template);
          return false;
        }
      }
    } else {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().equipUnitForRole(unit, role, roleCount) && unit.getRole() === role;
    if (ret) {
      this.fireChanges([colonyWas, europeWas, marketWas, unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Handle an error.
   *
   * @param template A {@code StringTemplate} to display.
   * @param message An extra non-i18n message to display if debugging.
   */
  errorHandler(template: StringTemplate, message: string): void {
    this.error(template, message);
  }
  /**
   * Execute goto orders command.
   *
   * Called from ExecuteGotoOrdersAction.
   *
   * @return True if all goto orders have been performed and no units
   *     reached their destination and are free to move again.
   */
  executeGotoOrders(): boolean {
    if (!this.requireOurTurn() || this.getGUI().isPanelShowing()) {
      return false;
    }
    return this.doExecuteGotoOrders();
  }
  /**
   * Handle feature changes.
   *
   * @param parent The parent {@code FreeColGameObject} to add to.
   * @param children The child {@code FreeColObject}s that change.
   * @param add If true, add the child, otherwise remove it.
   */
  featureChangeHandler(parent: FreeColGameObject, children: List<FreeColObject>, add: boolean): void {
    for (const $it23 = children.iterator(); $it23.hasNext(); ) {
      let fco = $it23.next();
      if (fco instanceof Ability) {
        if (add) {
          parent.addAbility(fco);
        } else {
          parent.removeAbility(fco);
        }
      } else if (fco instanceof Modifier) {
        if (add) {
          parent.addModifier(fco);
        } else {
          parent.removeModifier(fco);
        }
      } else if (fco instanceof HistoryEvent) {
        if (parent instanceof Player && add) {
          let player = parent;
          player.addHistory(fco);
        } else {
          InGameController.logger.warning('Feature change NYI: ' + $J.str(parent) + '/' + add + '/' + $J.str(fco));
        }
      } else if (fco instanceof LastSale) {
        if (parent instanceof Player && add) {
          let player = parent;
          player.addLastSale(fco);
        } else {
          InGameController.logger.warning('Feature change NYI: ' + $J.str(parent) + '/' + add + '/' + $J.str(fco));
        }
      } else if (fco instanceof ModelMessage) {
        if (parent instanceof Player && add) {
          let player = parent;
          player.addModelMessage(fco);
        } else {
          InGameController.logger.warning('Feature change NYI: ' + $J.str(parent) + '/' + add + '/' + $J.str(fco));
        }
      } else {
        InGameController.logger.warning('featureChange unrecognized: ' + $J.str(fco));
      }
    }
  }
  /**
   * A player makes first contact with a native player.
   *
   * @param player The {@code Player} making contact.
   * @param other The native {@code Player} being contacted.
   * @param tile An optional {@code Tile} to offer the player if
   *     they have made a first landing.
   * @param result Whether the initial treaty was accepted.
   * @return True if first contact occurs.
   */
  firstContact(player: Player, other: Player, tile: Tile, result: boolean): boolean {
    if (player == null || player === other || tile == null) {
      return false;
    }
    let ret = this.askServer().firstContact(player, other, tile, result);
    if (ret) {
      this.updateGUI(tile, false);
    }
    return ret;
  }
  /**
   * A player makes first contact with a native player.
   *
   * @param player The {@code Player} making contact.
   * @param other The native {@code Player} being contacted.
   * @param tile An optional {@code Tile} to offer the player if
   *     they have made a first landing.
   * @param n The number of settlements claimed by the native player.
   */
  firstContactHandler(player: Player, other: Player, tile: Tile, n: number): void {
    this.invokeLater(() => this.getGUI().showFirstContactDialog(player, other, tile, n, (b) => this.firstContact(player, other, tile, b)));
  }
  /**
   * Handle a fountain of youth event.
   *
   * @param n The number of migrants available for selection.
   */
  fountainOfYouthHandler(n: number): void {
    this.showEmigrationDialog(this.getMyPlayer(), true, n);
  }
  /**
   * The player has won, show the high scores and victory dialog.
   *
   * @param score If "true", a new high score was reached.
   */
  gameEndedHandler(score: string): void {
    this.invokeLater(() => {
      this.highScore(JString.equalsIgnoreCase('true', score));
      this.getGUI().showVictoryDialog((result) => this.victory(result));
    });
  }
  /**
   * Go to a tile.
   *
   * Called from CanvasMouseListener, TilePopup
   *
   * @param unit The {@code Unit} to move.
   * @param path The {@code Path} to move along.
   * @return True if the destination change was successful.
   */
  goToTile(unit: Unit, path: PathNode): boolean {
    if (unit == null || !this.getMyPlayer().owns(unit) || path == null || !this.requireOurTurn()) {
      return false;
    }
    if (!this.getGUI().confirmClearTradeRoute(unit)) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askSetDestination(unit, path.getLastNode().getLocation());
    if (ret) {
      this.moveToDestination(unit, null);
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Display the high scores.
   *
   * Called from ReportHighScoresAction
   *
   * @param high A {@code Boolean} whose values indicates whether
   *     a new high score has been achieved, or no information if null.
   * @return True if the server interaction succeeded.
   */
  highScore(high: boolean): boolean {
    return this.askServer().getHighScores((high == null) ? null : ((high) ? 'highscores.yes' : 'highscores.no'));
  }
  /**
   * Display the high scores.
   *
   * @param key An optional message key.
   * @param scores The list of {@code HighScore} records to display.
   */
  highScoresHandler(key: string, scores: List<HighScore>): void {
    this.invokeLater(() => this.getGUI().showHighScoresPanel(key, scores));
  }
  /**
   * Ignore this ModelMessage from now on until it is not generated
   * in a turn.
   *
   * Called from ReportTurnPanel
   *
   * @param message a {@code ModelMessage} value
   * @param flag whether to ignore the ModelMessage or not
   * @return True, ignore message status changes can not fail.
   */
  ignoreMessage(message: ModelMessage, flag: boolean): boolean {
    let key: string;
    if (message == null || (key = message.getIgnoredMessageKey()) == null) {
      return false;
    }
    if (flag) {
      let turn = this.getGame().getTurn();
      if (!this.continueIgnoreMessage(key, turn)) {
        this.startIgnoringMessage(key, turn);
      }
    } else {
      this.stopIgnoringMessage(key);
    }
    return true;
  }
  /**
   * Handle an incite response.
   *
   * @param unit The {@code Unit} that is inciting.
   * @param is The {@code IndianSettlement} being incited.
   * @param enemy The {@code Player} incited against.
   * @param gold The gold required by the natives to become hostile.
   */
  inciteHandler(unit: Unit, is$: IndianSettlement, enemy: Player, gold: number): void {
    let player = this.getMyPlayer();
    if (gold < 0) {
    } else if (!player.checkGold(gold)) {
      this.showInformationPanel$FreeColObject$StringTemplate$InGameController(is$, StringTemplate.template$String('missionarySettlement.inciteGoldFail').add$String$String('%player%', enemy.getName()).addAmount('%amount%', gold));
    } else {
      this.invokeLater(() => {
        if (this.getGUI().confirm$Tile$StringTemplate$Unit$String$String(unit.getTile$(), StringTemplate.template$String('missionarySettlement.inciteConfirm').addStringTemplate$String$StringTemplate('%enemy%', enemy.getNationLabel()).addAmount('%amount%', gold), unit, 'yes', 'no')) {
          this.askServer().incite(unit, is$, enemy, gold);
        }
      });
    }
  }
  /**
   * Handle a native demand at a colony.
   *
   * @param unit The native {@code Unit} making the demand.
   * @param colony The {@code Colony} demanded of.
   * @param type The {@code GoodsType} demanded (null means gold).
   * @param amount The amount of goods/gold demanded.
   */
  indianDemandHandler(unit: Unit, colony: Colony, type$: GoodsType, amount: number): void {
    let player = this.getMyPlayer();
    let accepted: boolean;
    let opt = this.getClientOptions().getInteger(ClientOptions.INDIAN_DEMAND_RESPONSE);
    switch (opt) {
      case ClientOptions.INDIAN_DEMAND_RESPONSE_ASK:
        this.invokeLater(() => this.getGUI().showNativeDemandDialog(unit, colony, type$, amount, (accept) => this.askServer().indianDemand(unit, colony, type$, amount, ((accept) ? Constants$IndianDemandAction.INDIAN_DEMAND_ACCEPT : Constants$IndianDemandAction.INDIAN_DEMAND_REJECT))));
        return;
      case ClientOptions.INDIAN_DEMAND_RESPONSE_ACCEPT:
        accepted = true;
        break;
      case ClientOptions.INDIAN_DEMAND_RESPONSE_REJECT:
        accepted = false;
        break;
      default:
        throw new RuntimeException('Impossible option value: ' + opt);
    }
    let nation = Messages.message$StringTemplate(unit.getOwner().getNationLabel());
    let m = (type$ == null) ? new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.DEMANDS, 'indianDemand.gold.text', colony, unit).addName$String$String('%nation%', nation).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount) : (type$.isFoodType()) ? new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.DEMANDS, 'indianDemand.food.text', colony, unit).addName$String$String('%nation%', nation).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount) : new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject$FreeColObject(ModelMessage$MessageType.DEMANDS, 'indianDemand.other.text', colony, unit).addName$String$String('%nation%', nation).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount).addNamed$String$Named('%goods%', type$);
    player.addModelMessage(m);
    this.invokeLater(() => this.nextModelMessage());
  }
  /**
   * Join the colony at a unit's current location.
   *
   * @param unit The {@code Unit} to use.
   * @return True if the unit joined a colony.
   */
  joinColony(unit: Unit): boolean {
    let tile = unit.getTile$();
    let colony = (tile == null) ? null : tile.getColony();
    let ret = colony != null && this.askServer().joinColony(unit, colony) && unit.getState() === Unit$UnitState.IN_COLONY;
    if (ret) {
      this.updateGUI(null, false);
      this.showColonyPanel(colony, unit);
    }
    return ret;
  }
  /**
   * Leave a ship.  The ship must be in harbour.
   *
   * Called from CargoPanel, ColonyPanel, EuropePanel.unloadAction,
   * UnitLabel
   *
   * @param unit The {@code Unit} which is to leave the ship.
   * @return True if the unit left the ship.
   */
  leaveShip(unit: Unit): boolean {
    let carrier: Unit;
    if (unit == null || (carrier = unit.getCarrier()) == null || !this.requireOurTurn()) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().disembark(unit) && unit.getLocation() !== carrier;
    if (ret) {
      this.checkCashInTreasureTrain(unit);
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Loads a cargo onto a carrier.
   *
   * Called from CargoPanel, ColonyPanel, LoadAction, TilePopup.
   *
   * @param goods The {@code Goods} which are going aboard the carrier.
   * @param carrier The {@code Unit} acting as carrier.
   * @return True if the goods were loaded.
   */
  loadCargo(goods: Goods, carrier: Unit): boolean {
    if (goods == null || goods.getAmount() <= 0 || goods.getLocation() == null || carrier == null || !carrier.isCarrier() || !this.requireOurTurn()) {
      return false;
    }
    if (goods.getLocation() instanceof Europe) {
      return this.buyGoods(goods.getType(), goods.getAmount(), carrier);
    }
    let carrierWas = new UnitWas()._UnitWas(carrier);
    let sourceWas = null;
    let colonyWas = null;
    if (goods.getLocation() instanceof Unit) {
      let source = goods.getLocation();
      sourceWas = new UnitWas()._UnitWas(source);
    } else {
      let colony = carrier.getColony();
      if (colony == null) {
        return false;
      }
      colonyWas = new ColonyWas()._ColonyWas(colony);
    }
    let ret = this.askLoadGoods(goods.getLocation(), goods.getType(), goods.getAmount(), carrier);
    if (ret) {
      this.sound('sound.event.loadCargo');
      this.fireChanges([colonyWas, sourceWas, carrierWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Opens a dialog where the user should specify the filename and
   * loads the game.
   *
   * Called from OpenAction.
   *
   * Returns no status as this game is stopped.
   */
  loadGame(): void {
    let file = this.getGUI().showLoadSaveFileDialog(FreeColDirectories.getSaveDirectory(), [FreeCol.FREECOL_SAVE_EXTENSION, '*']);
    if (file == null) {
      return;
    }
    let fcc = this.getFreeColClient();
    if (fcc.isInGame() && !this.getGUI().confirmStopGame()) {
      return;
    }
    if (fcc.isLoggedIn()) {
      fcc.getConnectController().requestLogout(Game$LogoutReason.LOGIN);
    }
    fcc.stopServer();
    this.getGUI().prepareShowingMainMenu();
    this.getGUI().repaint();
    FreeColDirectories.setSavegameFile(file.getPath());
    if (!this.getConnectController().startSavedGame(file)) {
      this.getGUI().showMainPanel(null);
    }
  }
  /**
   * Log out the current player.
   *
   * @param player The {@code Player} that is logging out.
   * @param reason The reason for logging out.
   */
  logoutHandler(player: Player, reason: Game$LogoutReason): void {
    if (player == null) {
      return;
    }
    let game = this.getGame();
    if (game.getCurrentPlayer() === player) {
      game.setCurrentPlayer(game.getNextPlayer());
    }
    if (this.getMyPlayer() === player) {
      this.getFreeColClient().getConnectController().logout(reason);
    }
  }
  /**
   * Loot some cargo.
   *
   * Called from GUI.showCaptureGoodsDialog
   *
   * @param unit The {@code Unit} that is looting.
   * @param goods A list of {@code Goods} to choose from.
   * @param defenderId The identifier of the defender unit (may have sunk).
   * @return True if looting occurs.
   */
  lootCargo(unit: Unit, goods: List<Goods>, defenderId: string): boolean {
    if (unit == null || goods == null || goods.isEmpty() || defenderId == null) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().loot(unit, defenderId, goods);
    if (ret) {
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Loot some cargo.
   *
   * @param unit The {@code Unit} that is looting.
   * @param goods A list of {@code Goods} to choose from.
   * @param loserId The identifier of the defender unit (may have sunk).
   */
  lootCargoHandler(unit: Unit, goods: List<Goods>, loserId: string): void {
    this.invokeLater(() => this.getGUI().showCaptureGoodsDialog(unit, goods, (gl) => this.lootCargo(unit, gl, loserId)));
  }
  /**
   * Accept or reject a monarch action.
   *
   * Called from GUI.showMonarchDialog
   *
   * @param action The {@code MonarchAction} performed.
   * @param accept If true, accept the action.
   * @return True if the monarch was answered.
   */
  monarchAction(action: Monarch$MonarchAction, accept: boolean): boolean {
    if (action == null) {
      return false;
    }
    let ret = false;
    switch (action) {
      case Monarch$MonarchAction.RAISE_TAX_ACT:
      case Monarch$MonarchAction.RAISE_TAX_WAR:
      case Monarch$MonarchAction.MONARCH_MERCENARIES:
      case Monarch$MonarchAction.HESSIAN_MERCENARIES:
        ret = this.askServer().answerMonarch(action, accept);
        break;
      default:
        break;
    }
    if (ret) {
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Do a monarch interaction.
   *
   * @param action The {@code MonarchAction} to perform.
   * @param template A {@code StringTemplate} describing the action.
   * @param monarchKey A key for the monarch involved.
   */
  monarchActionHandler(action: Monarch$MonarchAction, template: StringTemplate, monarchKey: string): void {
    this.invokeLater(() => this.getGUI().showMonarchDialog(action, template, monarchKey, (b) => this.monarchAction(action, b)));
  }
  /**
   * Moves the specified unit somewhere that requires crossing the
   * high seas.
   *
   * Called from EuropePanel.DestinationPanel, TilePopup
   *
   * @param unit The {@code Unit} to be moved.
   * @param destination The {@code Location} to be moved to.
   * @return True if automatic movement of the unit can proceed.
   */
  moveTo(unit: Unit, destination: Location): boolean {
    if (unit == null || destination == null || !this.requireOurTurn()) {
      return false;
    }
    if (destination instanceof Europe) {
      if (unit.isInEurope()) {
        this.sound('sound.event.illegalMove');
        return false;
      }
      return this.moveTowardEurope(unit, destination);
    } else if (destination instanceof Map_) {
      if (unit.hasTile() && unit.getTile$().getMap() === destination) {
        this.sound('sound.event.illegalMove');
        return false;
      }
      return this.moveAwayFromEurope(unit, destination);
    } else if (destination instanceof Settlement) {
      if (unit.hasTile()) {
        this.sound('sound.event.illegalMove');
        return false;
      }
      return this.moveAwayFromEurope(unit, destination);
    } else {
      return false;
    }
  }
  /**
   * Moves the active unit in a specified direction. This may result in an
   * attack, move... action.
   *
   * Called from MoveAction, CornerMapControls
   *
   * @param unit The {@code Unit} to move.
   * @param direction The {@code Direction} in which to move
   *     the active unit.
   */
  moveUnit(unit: Unit, direction: Direction): void {
    if (unit == null || !unit.hasTile() || direction == null || !this.requireOurTurn()) {
      return;
    }
    if (!this.askClearGotoOrders(unit)) {
      return;
    }
    let oldTile = unit.getTile$();
    let unitWas = new UnitWas()._UnitWas(unit);
    let colonyWas = (unit.getColony() == null) ? null : new ColonyWas()._ColonyWas(unit.getColony());
    this.changeState(unit, Unit$UnitState.ACTIVE);
    this.moveDirection(unit, direction, true);
    this.fireChanges([unitWas, colonyWas]);
    this.updateGUI(null, false);
    if (unit.getTile$() !== oldTile && !unit.couldMove() && !unit.isDisposed() && unit.hasTile()) {
      let colony = unit.getTile$().getColony();
      if (colony != null) {
        this.showColonyPanel(colony, unit);
      }
    }
  }
  /**
   * The player names a new region.
   *
   * Called from newRegionName, GUI.showNameNewRegionDialog
   *
   * @param tile The {@code Tile} within the region.
   * @param unit The {@code Unit} that has discovered the region.
   * @param region The {@code Region} to name.
   * @param name The name to offer.
   * @return True if the new region was named.
   */
  nameNewRegion(tile: Tile, unit: Unit, region: Region, name: string): boolean {
    if (tile == null || unit == null || region == null) {
      return false;
    }
    return this.askServer().newRegionName(region, tile, unit, name);
  }
  /**
   * Get the nation summary for a player.
   *
   * Called from DiplomaticTradePanel, ReportForeignAffairsPanel,
   * ReportIndianPanel
   *
   * @param player The {@code Player} to summarize.
   * @return A summary of that nation, or null on error.
   */
  nationSummary(player: Player): NationSummary {
    if (player == null) {
      return null;
    }
    let myPlayer = this.getMyPlayer();
    let ns = myPlayer.getNationSummary(player);
    if (ns != null) {
      return ns;
    }
    if (this.askServer().nationSummary(myPlayer, player)) {
      return myPlayer.getNationSummary(player);
    }
    return null;
  }
  /**
   * Handle a nation summary update.
   *
   * @param other The {@code Player} to update.
   * @param ns The {@code NationSummary} for the other player.
   */
  nationSummaryHandler(other: Player, ns: NationSummary): void {
    let player = this.getMyPlayer();
    player.putNationSummary(other, ns);
    InGameController.logger.info('Updated nation summary of ' + other.getSuffix$() + ' for ' + player.getSuffix$() + ' with ' + $J.str(ns));
  }
  /**
   * Cache a native trade update.
   *
   * @param action The {@code NativeTradeAction} to handle.
   * @param nt The {@code NativeTrade} underway.
   */
  nativeTradeHandler(action: NativeTrade$NativeTradeAction, nt: NativeTrade): void {
    if (nt == null) {
      return;
    }
    let gui = this.getGUI();
    let is$ = nt.getIndianSettlement();
    let unit = nt.getUnit();
    let player = this.getMyPlayer();
    if (!player.owns(unit)) {
      InGameController.logger.warning('We do not own the trading unit: ' + $J.str(unit));
      return;
    }
    let nti: NativeTradeItem;
    let act: Constants$TradeAction;
    let prompt: StringTemplate;
    switch (action) {
      case NativeTrade$NativeTradeAction.ACK_OPEN:
        nti = null;
        act = null;
        prompt = null;
        break;
      case NativeTrade$NativeTradeAction.ACK_BUY:
        nti = null;
        act = null;
        prompt = StringTemplate.template$String('trade.bought').addNamed$String$Named('%goodsType%', nt.getItem().getGoods().getType()).addStringTemplate$String$StringTemplate('%nation%', is$.getOwner().getNationLabel()).addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(player));
        break;
      case NativeTrade$NativeTradeAction.ACK_SELL:
        nti = null;
        act = null;
        prompt = StringTemplate.template$String('trade.sold').addNamed$String$Named('%goodsType%', nt.getItem().getGoods().getType()).addStringTemplate$String$StringTemplate('%nation%', is$.getOwner().getNationLabel()).addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(player));
        break;
      case NativeTrade$NativeTradeAction.ACK_GIFT:
        nti = null;
        act = null;
        prompt = StringTemplate.template$String('trade.gave').addNamed$String$Named('%goodsType%', nt.getItem().getGoods().getType()).addStringTemplate$String$StringTemplate('%nation%', is$.getOwner().getNationLabel()).addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(player));
        break;
      case NativeTrade$NativeTradeAction.ACK_BUY_HAGGLE:
        act = Constants$TradeAction.BUY;
        nti = nt.getItem();
        prompt = null;
        break;
      case NativeTrade$NativeTradeAction.ACK_SELL_HAGGLE:
        act = Constants$TradeAction.SELL;
        nti = nt.getItem();
        prompt = null;
        break;
      case NativeTrade$NativeTradeAction.NAK_GOODS:
        nti = null;
        act = null;
        prompt = StringTemplate.template$String('trade.noTradeGoods').addNamed$String$Named('%goodsType%', nt.getItem().getGoods().getType());
        break;
      case NativeTrade$NativeTradeAction.NAK_HAGGLE:
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(null, StringTemplate.template$String('trade.noTradeHaggle'));
        return;
      case NativeTrade$NativeTradeAction.NAK_HOSTILE:
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(null, StringTemplate.template$String('trade.noTradeHostile'));
        return;
      case NativeTrade$NativeTradeAction.NAK_NOSALE:
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(null, StringTemplate.template$String('trade.nothingToSell'));
        return;
      case NativeTrade$NativeTradeAction.NAK_INVALID:
      default:
        InGameController.logger.warning('Bogus native trade: ' + $J.str(nt));
        return;
    }
    this.invokeLater(() => {
      let current = gui.getActiveUnit();
      gui.changeView$Unit$boolean(unit, false);
      let uw = new UnitWas()._UnitWas(unit);
      this.nativeTrade(nt, act, nti, prompt);
      uw.fireChanges();
      gui.changeView$Unit$boolean(current, false);
    });
  }
  /**
   * Execute the native trade.
   *
   * @param nt The {@code NativeTrade} underway.
   * @param act The {@code TradeAction} to perform.
   * @param nti The {@code NativeTradeItem} being haggled over, if any.
   * @param prompt An action-specific base prompt, if any.
   */
  nativeTrade(nt: NativeTrade, act: Constants$TradeAction, nti: NativeTradeItem, prompt: StringTemplate): void {
    let is$ = nt.getIndianSettlement();
    let unit = nt.getUnit();
    let base = StringTemplate.template$String('trade.welcome').addStringTemplate$String$StringTemplate('%nation%', is$.getOwner().getNationLabel()).addStringTemplate$String$StringTemplate('%settlement%', is$.getLocationLabelFor(unit.getOwner()));
    nt.limitSettlementToUnit(3);
    let goodsMapper = (i) => {
      let label = Messages.message$StringTemplate(i.getGoods().getLabel$boolean(true));
      return new ChoiceItem()._ChoiceItem$String$Object(label, i);
    };
    while (!nt.getDone()) {
      if (act == null) {
        if (prompt == null) {
          prompt = base;
        }
        act = this.getGUI().getIndianSettlementTradeChoice(is$, prompt, nt.canBuy(), nt.canSell(), nt.canGift());
        if (act == null) {
          break;
        }
        prompt = base;
      }
      {
        let tba: Constants$TradeBuyAction, tsa: Constants$TradeSellAction;
        switch (act) {
          case Constants$TradeAction.BUY:
            act = null;
            if (nti == null) {
              nti = this.getGUI().getChoice$Tile$StringTemplate$Settlement$String$List(unit.getTile$(), StringTemplate.key$String('buyProposition.text'), is$, 'nothing', CollectionUtils.transform$Collection$Predicate$Function(nt.getSettlementToUnit(), ($p0) => $p0.priceIsValid(), goodsMapper));
              if (nti == null) {
                break;
              }
              nt.setItem(nti);
            }
            tba = this.getGUI().getBuyChoice(unit, is$, nti.getGoods(), nti.getPrice(), unit.getOwner().checkGold(nti.getPrice()));
            if (tba === Constants$TradeBuyAction.BUY) {
              this.askServer().nativeTrade(NativeTrade$NativeTradeAction.BUY, nt);
              return;
            } else if (tba === Constants$TradeBuyAction.HAGGLE) {
              nti.setPrice(NativeTradeItem.PRICE_UNSET);
              this.askServer().nativeTrade(NativeTrade$NativeTradeAction.BUY, nt);
              return;
            }
            break;
          case Constants$TradeAction.SELL:
            act = null;
            if (nti == null) {
              nti = this.getGUI().getChoice$Tile$StringTemplate$Settlement$String$List(unit.getTile$(), StringTemplate.key$String('sellProposition.text'), is$, 'nothing', CollectionUtils.transform$Collection$Predicate$Function(nt.getUnitToSettlement(), ($p0) => $p0.priceIsValid(), goodsMapper));
              if (nti == null) {
                break;
              }
              nt.setItem(nti);
            }
            tsa = this.getGUI().getSellChoice(unit, is$, nti.getGoods(), nti.getPrice());
            if (tsa === Constants$TradeSellAction.SELL) {
              this.askServer().nativeTrade(NativeTrade$NativeTradeAction.SELL, nt);
              return;
            } else if (tsa === Constants$TradeSellAction.HAGGLE) {
              nti.setPrice(NativeTradeItem.PRICE_UNSET);
              this.askServer().nativeTrade(NativeTrade$NativeTradeAction.SELL, nt);
              return;
            }
            break;
          case Constants$TradeAction.GIFT:
            act = null;
            nti = this.getGUI().getChoice$Tile$StringTemplate$Settlement$String$List(unit.getTile$(), StringTemplate.key$String('gift.text'), is$, 'cancel', CollectionUtils.transform$Collection$Predicate$Function(nt.getUnitToSettlement(), CollectionUtils.alwaysTrue(), goodsMapper));
            if (nti != null) {
              nt.setItem(nti);
              this.askServer().nativeTrade(NativeTrade$NativeTradeAction.GIFT, nt);
              return;
            }
            break;
          default:
            InGameController.logger.warning('showIndianSettlementTradeDialog fail: ' + $J.str(act));
            nt.setDone();
            break;
        }
      }
      nti = null;
    }
    this.askServer().nativeTrade(NativeTrade$NativeTradeAction.CLOSE, nt);
  }
  /**
   * A player names the New World.
   *
   * Called from GUI.showNameNewLandDialog
   *
   * @param unit The {@code Unit} that landed.
   * @param name The name to use.
   * @return True if the new land was named.
   */
  newLandName(unit: Unit, name: string): boolean {
    if (unit == null || name == null) {
      return false;
    }
    if (!this.askServer().newLandName(unit, name)) {
      return false;
    }
    let player = unit.getOwner();
    let t = StringTemplate.template$String('event.firstLanding').addName$String$String('%name%', name);
    this.invokeLater(() => {
      let firstLandinPanel = this.getGUI().showEventPanel(Messages.message$StringTemplate(t), 'image.flavor.event.firstLanding', null);
      firstLandinPanel.addClosingCallback(() => {
        let key = FreeColActionUI.getHumanKeyStrokeText(this.getFreeColClient().getActionManager().getFreeColAction('buildColonyAction').getAccelerator());
        player.addModelMessage(new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.TUTORIAL, 'buildColony.tutorial', player).addName$String$String('%colonyKey%', key).add$String$String('%colonyMenuItem%', 'buildColonyAction.name').add$String$String('%ordersMenuItem%', 'menuBar.orders'));
        this.nextModelMessage();
      });
    });
    return true;
  }
  /**
   * Ask the player to name the new land.
   *
   * @param unit The {@code Unit} that has landed.
   * @param defaultName The default name to use.
   */
  newLandNameHandler(unit: Unit, defaultName: string): void {
    this.showNamingDialog(StringTemplate.key$String('newLand.text'), defaultName, unit, (name) => this.newLandName(unit, (name == null || (name.length === 0)) ? defaultName : name));
  }
  /**
   * The player names a new region.
   *
   * @param tile The {@code Tile} within the region.
   * @param unit The {@code Unit} that has discovered the region.
   * @param region The {@code Region} to name.
   * @param name The name to offer.
   * @return True if the new region was named.
   */
  newRegionName(region: Region, tile: Tile, unit: Unit, name: string): boolean {
    if (tile == null || unit == null || region == null) {
      return false;
    }
    return this.askServer().newRegionName(region, tile, unit, name);
  }
  /**
   * Handle new region naming.
   *
   * @param region The {@code Region} to name.
   * @param tile The {@code Tile} the unit landed at.
   * @param unit The {@code Unit} that has landed.
   * @param name The default name to use.
   */
  newRegionNameHandler(region: Region, tile: Tile, unit: Unit, name: string): void {
    this.invokeLater(() => {
      if (region.hasName()) {
        if (region.isPacific()) {
          this.showEventPanel(Messages.message$String('event.discoverPacific'), 'image.flavor.event.discoverPacific', null);
        }
        this.newRegionName(region, tile, unit, name);
      } else {
        if (this.getClientOptions().getBoolean(ClientOptions.SHOW_REGION_NAMING)) {
          this.showNamingDialog(StringTemplate.template$String('nameRegion.text').addStringTemplate$String$StringTemplate('%type%', region.getLabel()), name, unit, (n) => this.newRegionName(region, tile, unit, (n == null || (n.length === 0)) ? name : n));
        } else {
          this.newRegionName(region, tile, unit, name);
        }
      }
    });
  }
  /**
   * Gets a new trade route for a player.
   *
   * Called from TradeRoutePanel.newRoute.  Relies on new trade routes
   * being added at the end of the trade route list.
   *
   * @param player The {@code Player} to get a new trade route for.
   * @return A new {@code TradeRoute}.
   */
  newTradeRoute(player: Player): TradeRoute {
    if (player == null) {
      return null;
    }
    let n = player.getTradeRouteCount();
    return (this.askServer().newTradeRoute() && player.getTradeRouteCount() === ((n + 1) | 0)) ? player.getNewestTradeRoute() : null;
  }
  /**
   * Handle a new trade route.
   *
   * @param tr The {@code TradeRoute} to add.
   */
  newTradeRouteHandler(tr: TradeRoute): void {
    let player = this.getMyPlayer();
    player.addTradeRoute(tr);
  }
  /**
   * Switch to a new turn.
   *
   * @param turn The turn number.
   * @return True if the new turn occurs.
   */
  newTurn(turn: number): boolean {
    let game = this.getGame();
    let player = this.getMyPlayer();
    if (turn < 0) {
      InGameController.logger.warning('Bad turn in newTurn: ' + turn);
      return false;
    }
    let newTurn = new Turn()._Turn(turn);
    game.setTurn(newTurn);
    InGameController.logger.info('New turn: ' + $J.str(newTurn) + '/' + turn);
    if (this.getClientOptions().getBoolean(ClientOptions.AUDIO_ALERTS)) {
      this.sound('sound.event.alertSound');
    }
    let currTurn = game.getTurn();
    if (currTurn.isFirstSeasonTurn()) {
      player.addModelMessage(new ModelMessage()._ModelMessage$MessageType$String$FreeColGameObject(ModelMessage$MessageType.WARNING, 'twoTurnsPerYear', player).addStringTemplate$String$StringTemplate('%year%', currTurn.getLabel()).addAmount('%amount%', Turn.getSeasonNumber()));
    }
    player.clearNationCache();
    return true;
  }
  /**
   * Handle the new turn.
   *
   * @param turn The new turn number.
   */
  newTurnHandler(turn: number): void {
    this.invokeLater(() => this.newTurn(turn));
  }
  /**
   * Makes a new unit active.
   *
   * Called from PGC.startGame, ColonyPanel.closeColonyPanel
   *
   * @return True unless it was not our turn.
   */
  nextActiveUnit(): boolean {
    if (!this.requireOurTurn()) {
      return false;
    }
    this.updateGUI(null, false);
    return true;
  }
  /**
   * Handle partial updates.
   *
   * @param fcgo The {@code FreeColGameObject} to update.
   * @param fields A map of fields to update.
   */
  partialHandler(fcgo: FreeColGameObject, fields: JMap<string, string>): void {
    for (const $it24 = fields.entrySet().iterator(); $it24.hasNext(); ) {
      let e = $it24.next();
      try {
        let intro = new Introspector()._Introspector(fcgo.getClass(), e.getKey());
        intro.setter(fcgo, e.getValue());
      } catch ($e25) {
        if ($J.isa($e25, Introspector$IntrospectorException)) {
          let ie = $J.exc($e25);
          InGameController.logger.log(Level.WARNING, 'Partial update setter fail: ' + fcgo.getId() + '/' + e.getKey() + '=' + e.getValue(), ie);
        } else {
          throw $e25;
        }
      }
    }
    let player = this.getMyPlayer();
    if ((fcgo instanceof Player && (fcgo === player)) || (($J.isa(fcgo, Ownable)) && player.owns(fcgo))) {
      player.invalidateCanSeeTiles();
    }
  }
  /**
   * Pays the tax arrears on this type of goods.
   *
   * Called from CargoPanel, EuropePanel.MarketPanel,
   * EuropePanel.unloadAction, QuickActionMenu
   *
   * @param type The type of goods for which to pay arrears.
   * @return True if the arrears were paid.
   */
  payArrears(type$: GoodsType): boolean {
    if (!this.requireOurTurn() || type$ == null) {
      return false;
    }
    let player = this.getMyPlayer();
    let arrears = player.getArrears(type$);
    if (arrears <= 0) {
      return false;
    }
    if (!player.checkGold(arrears)) {
      this.showInformationPanel$FreeColObject$StringTemplate$InGameController(null, StringTemplate.template$String('payArrears.noGold').addAmount('%amount%', arrears));
      return false;
    }
    let t = StringTemplate.template$String('payArrears.text').addAmount('%amount%', arrears);
    if (!this.getGUI().confirm$Tile$StringTemplate$GoodsType$String$String(null, t, type$, 'ok', 'cancel')) {
      return false;
    }
    let ret = this.askServer().payArrears(type$) && player.canTrade$GoodsType(type$);
    if (ret) {
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Buys the remaining hammers and tools for the {@link Building} currently
   * being built in the given {@code Colony}.
   *
   * Called from BuildQueuePanel
   *
   * @param colony The {@code Colony} where the building should be
   *     bought.
   * @return True if the building was bought.
   */
  payForBuilding(colony: Colony): boolean {
    if (!this.requireOurTurn() || colony == null) {
      return false;
    }
    if (!this.getSpecification().getBoolean(GameOptions.PAY_FOR_BUILDING)) {
      this.showInformationPanel$FreeColObject$String$InGameController(null, 'payForBuilding.disabled');
      return false;
    }
    if (!colony.canPayToFinishBuilding$()) {
      this.showInformationPanel$FreeColObject$String$InGameController(null, 'info.notEnoughGold');
      return false;
    }
    let price = colony.getPriceForBuilding$();
    let t = StringTemplate.template$String('payForBuilding.text').addAmount('%amount%', price);
    if (!this.getGUI().confirm$Tile$StringTemplate$Settlement$String$String(null, t, colony, 'yes', 'no')) {
      return false;
    }
    let colonyWas = new ColonyWas()._ColonyWas(colony);
    let ret = this.askServer().payForBuilding(colony) && colony.getPriceForBuilding$() === 0;
    if (ret) {
      this.fireChanges([colonyWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Puts the specified unit outside the colony.
   *
   * Called from ColonyPanel.OutsideColonyPanel, UnitLabel
   *
   * @param unit The {@code Unit}
   * @return True if the unit was successfully put outside the colony.
   */
  putOutsideColony(unit: Unit): boolean {
    let colony: Colony;
    if (unit == null || (colony = unit.getColony()) == null || !this.requireOurTurn()) {
      return false;
    }
    if (!this.getGUI().confirmLeaveColony(unit)) {
      return false;
    }
    let colonyWas = new ColonyWas()._ColonyWas(colony);
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().putOutsideColony(unit) && unit.getLocation() === colony.getTile$();
    if (ret) {
      this.fireChanges([colonyWas, unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Query whether the user wants to reconnect?
   *
   * Called from ReconnectAction.
   *
   * Returns no status, this game is going away.
   */
  reconnect(): void {
    let fcc = this.getFreeColClient();
    this.invokeLater(() => {
      if (this.getGUI().confirm$String$String$String('reconnect.text', 'reconnect.no', 'reconnect.yes')) {
        InGameController.logger.finest('Reconnect quit.');
        fcc.getConnectController().requestLogout(Game$LogoutReason.QUIT);
      } else {
        InGameController.logger.finest('Reconnect accepted.');
        fcc.getConnectController().requestLogout(Game$LogoutReason.RECONNECT);
      }
    });
  }
  /**
   * Handle a reconnect message.
   */
  reconnectHandler(): void {
    this.invokeLater(() => this.reconnect());
  }
  /**
   * Recruit a unit from a specified index in Europe.
   *
   * Called from RecruitPanel
   *
   * @param index The index in Europe to recruit from, [0..RECRUIT_COUNT).
   * @return True if a unit was recruited.
   */
  recruitUnitInEurope(index: number): boolean {
    if (!this.requireOurTurn() || !Europe$MigrationType.validMigrantIndex(index)) {
      return false;
    }
    let player = this.getMyPlayer();
    if (!player.isColonial()) {
      return false;
    }
    if (!player.checkGold(player.getEuropeanRecruitPrice())) {
      this.showInformationPanel$FreeColObject$String$InGameController(null, 'info.notEnoughGold');
      return false;
    }
    let newUnit = this.askEmigrate(player.getEurope(), Europe$MigrationType.migrantIndexToSlot(index));
    if (newUnit != null) {
      this.changeView$Unit$boolean$InGameController(newUnit, false);
      this.updateGUI(null, false);
    }
    return newUnit != null;
  }
  /**
   * Remove game objects.
   *
   * @param objects A list of {@code FreeColGameObject}s to remove.
   * @param divert An object to divert to when the original disappears.
   */
  removeHandler(objects: List<FreeColGameObject>, divert: FreeColGameObject): void {
    let player = this.getMyPlayer();
    let visibilityChange = false;
    let updateUnit = false;
    for (const $it26 = objects.iterator(); $it26.hasNext(); ) {
      let fcgo = $it26.next();
      if (divert != null) {
        player.divertModelMessages(fcgo, divert);
      }
      if (fcgo instanceof Settlement) {
        let settlement = fcgo;
        if (settlement.getOwner() != null) {
          settlement.getOwner().removeSettlement(settlement);
        }
        visibilityChange = true;
      } else if (fcgo instanceof Unit) {
        let u = fcgo;
        updateUnit = !!(updateUnit | u === this.getGUI().getActiveUnit());
        if (u.getOwner() != null) {
          u.getOwner().removeUnit(u);
        }
        visibilityChange = true;
      }
      fcgo.disposeResources();
    }
    if (visibilityChange) {
      player.invalidateCanSeeTiles();
    }
    if (updateUnit) {
      this.updateGUI(null, true);
    }
  }
  /**
   * Renames a {@code Nameable}.
   *
   * Apparently this can be done while it is not your turn.
   *
   * Called from RenameAction, TilePopup.
   *
   * @param object The object to rename.
   * @return True if the object was renamed.
   */
  rename(object$: Nameable): boolean {
    let player = this.getMyPlayer();
    if (!($J.isa(object$, Ownable)) || !player.owns(object$)) {
      return false;
    }
    let name = null;
    if (object$ instanceof Colony) {
      let colony = object$;
      name = this.getGUI().getInput(colony.getTile$(), StringTemplate.key$String('renameColony.text'), colony.getName(), 'rename', 'cancel');
      if (name == null) {
        return false;
      } else if ((name.length === 0)) {
        this.showInformationPanel$FreeColObject$String$InGameController(null, 'info.enterSomeText');
        return false;
      } else if ($J.equals(colony.getName(), name)) {
        return false;
      } else if (player.getSettlementByName(name) != null) {
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(object$, StringTemplate.template$String('nameColony.notUnique').addName$String$String('%name%', name));
        return false;
      }
    } else if (object$ instanceof Unit) {
      let unit = object$;
      name = this.getGUI().getInput(unit.getTile$(), StringTemplate.key$String('renameUnit.text'), unit.getName(), 'rename', 'cancel');
      if (name == null) {
        return false;
      }
    } else {
      InGameController.logger.warning('Tried to rename an unsupported Nameable: ' + $J.str(object$));
      return false;
    }
    if (this.askServer().rename(object$, name)) {
      this.invokeLater(() => {
        let gui = this.getGUI();
        gui.updateMapControls();
        gui.updateMenuBar();
        gui.refresh();
      });
      return true;
    }
    return false;
  }
  /**
   * Save and quit the game.
   *
   * Called from and SaveAndQuitAction.
   *
   * @return False if the game was not saved, otherwise the game quits.
   */
  saveAndQuit(): boolean {
    if (!this.saveGame$()) {
      return false;
    }
    this.getFreeColClient().quit();
    return true;
  }
  /**
   * Opens a dialog where the user should specify the filename and
   * saves the game.
   *
   * Called from SaveAction and SaveAndQuitAction.
   *
   * @return True if the game was saved.
   */
  saveGame$(): boolean {
    if (!this.getFreeColClient().canSaveCurrentGame()) {
      return false;
    }
    let game = this.getGame();
    if (game == null) {
      return false;
    }
    let fileName = this.getSaveGameString(game);
    let file = this.getGUI().showSaveDialog(FreeColDirectories.getSaveDirectory(), fileName);
    if (file == null) {
      return false;
    }
    if (!this.getClientOptions().getBoolean(ClientOptions.CONFIRM_SAVE_OVERWRITE) || !file.exists() || this.getGUI().confirm$String$String$String('saveConfirmationDialog.areYouSure.text', 'ok', 'cancel')) {
      FreeColDirectories.setSavegameFile(file.getPath());
      return this.saveGame$File$InGameController(file);
    }
    return false;
  }
  /**
   * Display the results of speaking to a chief.
   *
   * @param unit The {@code Unit} that was speaking.
   * @param is The {@code IndianSettlement} spoken to.
   * @param result The result.
   */
  scoutSpeakToChiefHandler(unit: Unit, is$: IndianSettlement, result: string): void {
    switch (result) {
      case '':
        break;
      case 'die':
        this.showInformationPanel$FreeColObject$String$InGameController(is$, 'scoutSettlement.speakDie');
        break;
      case 'expert':
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(is$, StringTemplate.template$String('scoutSettlement.expertScout').addNamed$String$Named('%unit%', unit.getType()));
        break;
      case 'tales':
        this.showInformationPanel$FreeColObject$String$InGameController(is$, 'scoutSettlement.speakTales');
        break;
      case 'nothing':
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(is$, StringTemplate.template$String('scoutSettlement.speakNothing').addStringTemplate$String$StringTemplate('%nation%', unit.getOwner().getNationLabel()));
        break;
      default:
        this.showInformationPanel$FreeColObject$StringTemplate$InGameController(is$, StringTemplate.template$String('scoutSettlement.speakBeads').add$String$String('%amount%', result));
        break;
    }
  }
  /**
   * Selects a destination for this unit. Europe and the player's
   * colonies are valid destinations.
   *
   * Called from GotoAction.
   *
   * @param unit The unit for which to select a destination.
   * @return True if the destination change succeeds.
   */
  selectDestination(unit: Unit): boolean {
    if (!this.requireOurTurn() || unit == null) {
      return false;
    }
    if (!this.getGUI().confirmClearTradeRoute(unit)) {
      return false;
    }
    let destination = this.getGUI().showSelectDestinationDialog(unit);
    if (destination == null) {
      return false;
    }
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askSetDestination(unit, destination);
    if (ret) {
      if (destination instanceof Europe) {
        if (unit.hasTile() && unit.getTile$().isDirectlyHighSeasConnected()) {
          this.moveTowardEurope(unit, destination);
        } else {
          this.moveToDestination(unit, null);
        }
      } else {
        if (unit.isInEurope()) {
          this.moveAwayFromEurope(unit, destination);
        } else {
          this.moveToDestination(unit, null);
        }
      }
      this.fireChanges([unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Sells goods in Europe.
   *
   * Called from EuropePanel.MarketPanel, EuropePanel.unloadAction,
   * unload(), unloadCargo()
   *
   * @param goods The goods to be sold.
   * @return True if the sale succeeds.
   */
  sellGoods(goods: Goods): boolean {
    if (goods == null || !(goods.getLocation() instanceof Unit) || !this.requireOurTurn()) {
      return false;
    }
    let player = this.getMyPlayer();
    let carrier = goods.getLocation();
    let europeWas = new EuropeWas()._EuropeWas(player.getEurope());
    let marketWas = new MarketWas()._MarketWas(player);
    let unitWas = new UnitWas()._UnitWas(carrier);
    let ret = this.askUnloadGoods(goods.getType(), goods.getAmount(), carrier);
    if (ret) {
      marketWas.add(new AbstractGoods()._AbstractGoods$GoodsType$int(goods.getType(), goods.getAmount()));
      this.sound('sound.event.sellCargo');
      this.fireChanges([europeWas, marketWas, unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Handle setting the AI state of a player.
   *
   * @param player The {@code Player} to set.
   * @param ai The new AI state.
   */
  setAIHandler(player: Player, ai: boolean): void {
    player.setAI(ai);
  }
  /**
   * Changes the current construction project of a {@code Colony}.
   *
   * Called from BuildQueuePanel
   *
   * @param colony The {@code Colony}
   * @param buildQueue List of {@code BuildableType}
   * @return True if the build queue was changed.
   */
  setBuildQueue(colony: Colony, buildQueue: List<BuildableType>): boolean {
    if (colony == null || buildQueue == null || !this.requireOurTurn()) {
      return false;
    }
    let colonyWas = new ColonyWas()._ColonyWas(colony);
    let ret = this.askServer().setBuildQueue(colony, buildQueue);
    if (ret) {
      this.fireChanges([colonyWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Set a player to be the new current player.
   *
   * @param player The {@code Player} to be the new current player.
   * @return True if the current player changes.
   */
  setCurrentPlayer(player: Player): boolean {
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS) && this.currentPlayerIsMyPlayer()) {
      this.getFreeColClient().getGUI().invokeNowOrWait(() => {
        this.getGUI().closeMenus();
      });
    }
    let game = this.getGame();
    game.setCurrentPlayer(player);
    if (this.getMyPlayer().equals(player)) {
      this.moveMode = InGameController$MoveMode.NEXT_ACTIVE_UNIT;
      FreeColDebugger.finishDebugRun(this.getFreeColClient(), false);
      if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.DESYNC) && DebugUtils.checkDesyncAction(this.getFreeColClient())) {
        FreeCol.fatal$Logger$String(InGameController.logger, 'Exiting on desynchronization');
      }
      if (this.getFreeColServer() != null && game.getTurn().getNumber() > 0) {
        this.autoSaveGame();
      }
      player.removeDisplayedModelMessages();
      this.displayModelMessages(true, true);
      player.invalidateCanSeeTiles();
      let europe = player.getEurope();
      if (player.hasAbility$String(Ability.SELECT_RECRUIT)) {
        this.emigration(player, 0, false);
      } else {
        while (player.checkEmigrate()) {
          this.askEmigrate(europe, Europe$MigrationType.getUnspecificSlot());
        }
      }
      if (!this.getFreeColClient().getSinglePlayer()) {
        this.sound('sound.anthem.' + player.getNationId());
      }
      player.resetIterators();
      this.updateGUI(player.getFallbackTile(), false);
      this.getGUI().refresh();
    }
    return true;
  }
  /**
   * Handle a current player setting.
   *
   * @param currentPlayer The new current {@code Player}.
   */
  setCurrentPlayerHandler(currentPlayer: Player): void {
    this.setCurrentPlayer(currentPlayer);
  }
  /**
   * This player has died.
   *
   * @return True if the player has risen as the undead.
   */
  setDead(): boolean {
    let fcc = this.getFreeColClient();
    let player = this.getMyPlayer();
    let reason = null;
    if (fcc.getSinglePlayer()) {
      if (player.getPlayerType() === Player$PlayerType.RETIRED) {
      } else {
        if (player.getPlayerType() !== Player$PlayerType.UNDEAD && this.getGUI().confirm$String$String$String('defeatedSinglePlayer.text', 'defeatedSinglePlayer.yes', 'quit')) {
          this.askServer().enterRevengeMode();
          return true;
        }
        reason = Game$LogoutReason.DEFEATED;
      }
    } else {
      if (!this.getGUI().confirm$String$String$String('defeated.text', 'defeated.yes', 'quit')) {
        reason = Game$LogoutReason.DEFEATED;
      }
    }
    FreeColDebugger.finishDebugRun(fcc, true);
    if (reason != null) {
      fcc.getConnectController().requestLogout(reason);
    }
    return false;
  }
  /**
   * Set a player to be dead.
   *
   * @param dead The dead {@code Player}.
   */
  setDeadHandler(dead: Player): void {
    let player = this.getMyPlayer();
    if (player === dead) {
      this.invokeLater(() => this.setDead());
    } else {
      player.setStance(dead, null);
    }
  }
  /**
   * Informs this controller that a game has been newly loaded.
   *
   * Called from ConnectController.startSavedGame
   *
   * No status returned to connect controller.
   */
  setGameConnected(): void {
    let player = this.getMyPlayer();
    if (player != null) {
      player.refilterModelMessages(this.getClientOptions());
    }
  }
  /**
   * Sets the export settings of the custom house.
   *
   * Called from WarehouseDialog
   *
   * @param colony The colony with the custom house.
   * @param goodsType The goods for which to set the settings.
   * @return True if the levels were set.
   */
  setGoodsLevels(colony: Colony, goodsType: GoodsType): boolean {
    if (colony == null || goodsType == null) {
      return false;
    }
    return this.askServer().setGoodsLevels(colony, colony.getExportData$GoodsType(goodsType));
  }
  /**
   * Sets the debug mode to include the extra menu commands.
   *
   * Called from DebugAction
   *
   * @return True, always succeeds.
   */
  setInDebugMode(): boolean {
    FreeColDebugger.enableDebugMode(FreeColDebugger$DebugMode.MENUS);
    this.getFreeColClient().getConnectController().requestLogout(Game$LogoutReason.RECONNECT);
    return true;
  }
  /**
   * Notify the player that the stance between two players has changed.
   *
   * @param stance The changed {@code Stance}.
   * @param first The first {@code Player}.
   * @param second The second {@code Player}.
   * @return True if the stance change succeeds.
   */
  setStanceHandler(stance: Stance, first: Player, second: Player): boolean {
    if (stance == null || first == null || second == null) {
      return false;
    }
    let player = this.getMyPlayer();
    let old = first.getStance(second);
    try {
      first.setStance(second, stance);
    } catch ($e27) {
      if ($J.isa($e27, IllegalStateException)) {
        let e = $J.exc($e27);
        InGameController.logger.log(Level.WARNING, 'Illegal stance transition', e);
        return false;
      } else {
        throw $e27;
      }
    }
    player.clearNationSummary(second);
    if (player === first && old === Stance.UNCONTACTED) {
      this.invokeLater(() => this.sound('sound.event.meet.' + second.getNationId()));
    }
    return true;
  }
  /**
   * Spy on a settlement.
   *
   * @param tile A special copy of the {@code Tile} with the settlement.
   */
  spySettlementHandler(tile: Tile): void {
    let colony = tile.getColony();
    if (colony != null) {
      this.showColonyPanel(colony, null);
    }
  }
  /**
   * Trains a unit of a specified type in Europe.
   *
   * Called from NewUnitPanel.
   *
   * @param unitType The type of unit to be trained.
   * @return True if a new unit was trained.
   */
  trainUnitInEurope(unitType: UnitType): boolean {
    if (!this.requireOurTurn() || unitType == null) {
      return false;
    }
    let player = this.getMyPlayer();
    let europe = player.getEurope();
    if (!player.checkGold(europe.getUnitPrice(unitType))) {
      this.showInformationPanel$FreeColObject$String$InGameController(null, 'info.notEnoughGold');
      return false;
    }
    let europeWas = new EuropeWas()._EuropeWas(europe);
    let newUnit = null;
    let ret = this.askServer().trainUnitInEurope(unitType) && (newUnit = europeWas.getNewUnit()) != null;
    if (ret) {
      this.fireChanges([europeWas]);
      this.changeView$Unit$boolean$InGameController(newUnit, false);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Unload, including dumping cargo.
   *
   * Called from UnloadAction, UnitLabel
   *
   * @param unit The {@code Unit} that is dumping.
   * @return True if the unit unloaded.
   */
  unload(unit: Unit): boolean {
    if (unit == null || !unit.isCarrier() || !this.requireOurTurn()) {
      return false;
    }
    let ret = true;
    let colony = unit.getColony();
    if (colony != null) {
      for (const $it28 = unit.getUnitList().iterator(); $it28.hasNext(); ) {
        let u = $it28.next();
        if (!this.leaveShip(u)) {
          ret = false;
        }
      }
      for (const $it29 = unit.getGoodsList().iterator(); $it29.hasNext(); ) {
        let goods = $it29.next();
        if (!this.unloadCargo(goods, false)) {
          ret = false;
        }
      }
    } else if (unit.isInEurope()) {
      let player = this.getMyPlayer();
      for (const $it30 = unit.getCompactGoodsList().iterator(); $it30.hasNext(); ) {
        let goods = $it30.next();
        if (player.canTrade$GoodsType(goods.getType())) {
          if (!this.sellGoods(goods)) {
            ret = false;
          }
        }
      }
      if (unit.hasGoodsCargo()) {
        this.getGUI().showDumpCargoDialog(unit, (goodsList) => {
          for (const $it31 = goodsList.iterator(); $it31.hasNext(); ) {
            let g = $it31.next();
            this.unloadCargo(g, true);
          }
        });
        return false;
      }
    } else {
      for (const $it32 = unit.getGoodsList().iterator(); $it32.hasNext(); ) {
        let goods = $it32.next();
        if (!this.unloadCargo(goods, false)) {
          ret = false;
        }
      }
    }
    return ret;
  }
  /**
   * Unload cargo.  If the unit carrying the cargo is not in a
   * harbour, or if the given boolean is true, the goods will be
   * dumped.
   *
   * Called from CargoPanel, ColonyPanel, EuropePanel.MarketPanel,
   * GUI.showDumpCargoDialog, QuickActionMenu, unload()
   *
   * @param goods The {@code Goods} to unload.
   * @param dump If true, dump the goods.
   * @return True if the unload succeeds.
   */
  unloadCargo(goods: Goods, dump: boolean): boolean {
    if (goods == null || goods.getAmount() <= 0 || !(goods.getLocation() instanceof Unit) || !this.requireOurTurn()) {
      return false;
    }
    let carrier = goods.getLocation();
    if (carrier.isInEurope()) {
      return this.sellGoods(goods);
    }
    let colony = carrier.getColony();
    let colonyWas = (colony == null) ? null : new ColonyWas()._ColonyWas(colony);
    let unitWas = new UnitWas()._UnitWas(carrier);
    let ret = this.askUnloadGoods(goods.getType(), goods.getAmount(), carrier);
    if (ret) {
      if (!dump) {
        this.sound('sound.event.unloadCargo');
      }
      this.fireChanges([colonyWas, unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  /**
   * Handle updates.
   *
   * @param objects The {@code FreeColObject}s to update.
   */
  updateHandler(objects: List<FreeColObject>): void {
    let game = this.getGame();
    let player = this.getMyPlayer();
    for (const $it33 = objects.iterator(); $it33.hasNext(); ) {
      let fco = $it33.next();
      let fcgo = game.getFreeColGameObject$String(fco.getId());
      if (fcgo == null) {
        InGameController.logger.warning('Update of missing FCGO: ' + fco.getId());
        continue;
      }
      if (!fcgo.copyIn(fco)) {
        InGameController.logger.warning('Update copy-in failed: ' + fco.getId());
        continue;
      } else if (fco instanceof Tile) {
        this.invokeLater(() => this.getGUI().refreshTile(fco));
      }
    }
    player.invalidateCanSeeTiles();
  }
  /**
   * Updates a trade route.
   *
   * Called from TradeRoutePanel(), TradeRoutePanel.newRoute
   *
   * @param route The trade route to update.
   * @return True if the trade route was updated.
   */
  updateTradeRoute(route: TradeRoute): boolean {
    if (route == null) {
      return false;
    }
    return this.askServer().updateTradeRoute(route);
  }
  /**
   * The player has won!
   *
   * @param quit If true, leave this game and start a new one.
   * @return True.
   */
  victory(quit: boolean): boolean {
    if (quit) {
      this.invokeLater(() => this.getFreeColClient().getConnectController().newGame());
    } else {
      this.askServer().continuePlaying();
    }
    return true;
  }
  /**
   * Tell a unit to wait.
   *
   * Called from WaitAction.
   *
   * @return True, this can not fail.
   */
  waitUnit(): boolean {
    if (!this.requireOurTurn()) {
      return false;
    }
    this.updateGUI(null, true);
    return true;
  }
  /**
   * Moves a {@code Unit} to a {@code WorkLocation}.
   *
   * Called from ColonyPanel.tryWork, UnitLabel
   *
   * @param unit The {@code Unit}.
   * @param workLocation The new {@code WorkLocation}.
   * @return True if the unit is now working at the new work location.
   */
  work(unit: Unit, workLocation: WorkLocation): boolean {
    if (unit == null || workLocation == null || !this.requireOurTurn()) {
      return false;
    }
    let template: StringTemplate;
    if (unit.getStudent() != null && !this.getGUI().confirmAbandonEducation(unit, false)) {
      return false;
    }
    let colony = workLocation.getColony();
    let tile = workLocation.getWorkTile();
    if (tile != null) {
      if (tile.hasLostCityRumour()) {
        this.showInformationPanel$FreeColObject$String$InGameController(null, 'tileHasRumour');
        return false;
      }
      if (!unit.getOwner().owns(tile)) {
        if (!this.claimTile(tile, colony)) {
          return false;
        }
      }
    }
    let colonyWas = new ColonyWas()._ColonyWas(colony);
    let unitWas = new UnitWas()._UnitWas(unit);
    let ret = this.askServer().work(unit, workLocation) && unit.getLocation() === workLocation;
    if (ret) {
      this.fireChanges([colonyWas, unitWas]);
      this.updateGUI(null, false);
    }
    return ret;
  }
  static $clinit() {
    InGameController.logger = Logger.getLogger($J.cls(InGameController).getName());
    InGameController.abortTrade = StringTemplate.template$String('');
    InGameController.tradeRouteUnitComparator = Comparator.thenComparingKey((Comparator.comparing((u) => u.getTradeRoute().getName())), JFunction.identity());
  }
}

/**
 * Selecting next unit depends on mode--- either from the active list,
 * from the going-to list, or flush going-to and end the turn.
 */
export class InGameController$MoveMode extends JEnum {
  static NEXT_ACTIVE_UNIT: InGameController$MoveMode = null;
  static EXECUTE_GOTO_ORDERS: InGameController$MoveMode = null;
  static END_TURN: InGameController$MoveMode = null;
  static $VALUES: InGameController$MoveMode[] = null;
  _InGameController$MoveMode($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  minimize(m: InGameController$MoveMode): InGameController$MoveMode {
    return (this.ordinal() > m.ordinal()) ? m : this;
  }
  maximize(m: InGameController$MoveMode): InGameController$MoveMode {
    return (this.ordinal() < m.ordinal()) ? m : this;
  }
  static values(): InGameController$MoveMode[] { return InGameController$MoveMode.$VALUES.slice(); }
  static valueOf(name: string): InGameController$MoveMode { return $J.enumValueOf(InGameController$MoveMode, name); }
  static $clinit() {
    InGameController$MoveMode.NEXT_ACTIVE_UNIT = new InGameController$MoveMode()._InGameController$MoveMode('NEXT_ACTIVE_UNIT', 0);
    InGameController$MoveMode.EXECUTE_GOTO_ORDERS = new InGameController$MoveMode()._InGameController$MoveMode('EXECUTE_GOTO_ORDERS', 1);
    InGameController$MoveMode.END_TURN = new InGameController$MoveMode()._InGameController$MoveMode('END_TURN', 2);
    InGameController$MoveMode.$VALUES = [InGameController$MoveMode.NEXT_ACTIVE_UNIT, InGameController$MoveMode.EXECUTE_GOTO_ORDERS, InGameController$MoveMode.END_TURN];
  }
}

$J.define(InGameController, 'net.sf.freecol.client.control.InGameController', { kind: 'class', sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_InGameController' }, meths: { 'saveGame()': 'saveGame$', 'saveGame(java.io.File)': 'saveGame$File$InGameController', 'showInformationPanel(net.sf.freecol.common.model.FreeColObject,net.sf.freecol.common.model.StringTemplate)': 'showInformationPanel$FreeColObject$StringTemplate$InGameController', 'showInformationPanel(net.sf.freecol.common.model.FreeColObject,java.lang.String)': 'showInformationPanel$FreeColObject$String$InGameController', 'changeView(net.sf.freecol.common.model.Tile)': 'changeView$Tile$InGameController', 'changeView(net.sf.freecol.common.model.Unit,boolean)': 'changeView$Unit$boolean$InGameController' }, clinit: true, lazy: ['logger', 'abortTrade', 'tradeRouteUnitComparator'] });
$J.define(InGameController$MoveMode, 'net.sf.freecol.client.control.InGameController$MoveMode', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_InGameController$MoveMode' }, clinit: true, lazy: ['$VALUES', 'NEXT_ACTIVE_UNIT', 'EXECUTE_GOTO_ORDERS', 'END_TURN'] });
$J.module(() => {
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColActionUI = $J.load('net.sf.freecol.client.gui.option.FreeColActionUI');
  FreeColException = $J.load('net.sf.freecol.common.FreeColException');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  NameCache = $J.load('net.sf.freecol.common.i18n.NameCache');
  FreeColDirectories = $J.load('net.sf.freecol.common.io.FreeColDirectories');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  ColonyWas = $J.load('net.sf.freecol.common.model.ColonyWas');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Constants$ArmedUnitSettlementAction = $J.load('net.sf.freecol.common.model.Constants$ArmedUnitSettlementAction');
  Constants$ClaimAction = $J.load('net.sf.freecol.common.model.Constants$ClaimAction');
  Constants$IndianDemandAction = $J.load('net.sf.freecol.common.model.Constants$IndianDemandAction');
  Constants$MissionaryAction = $J.load('net.sf.freecol.common.model.Constants$MissionaryAction');
  Constants$ScoutColonyAction = $J.load('net.sf.freecol.common.model.Constants$ScoutColonyAction');
  Constants$ScoutIndianSettlementAction = $J.load('net.sf.freecol.common.model.Constants$ScoutIndianSettlementAction');
  Constants$TradeAction = $J.load('net.sf.freecol.common.model.Constants$TradeAction');
  Constants$TradeBuyAction = $J.load('net.sf.freecol.common.model.Constants$TradeBuyAction');
  Constants$TradeSellAction = $J.load('net.sf.freecol.common.model.Constants$TradeSellAction');
  DiplomaticTrade = $J.load('net.sf.freecol.common.model.DiplomaticTrade');
  DiplomaticTrade$TradeContext = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeContext');
  DiplomaticTrade$TradeStatus = $J.load('net.sf.freecol.common.model.DiplomaticTrade$TradeStatus');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  EuropeWas = $J.load('net.sf.freecol.common.model.EuropeWas');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  GoldTradeItem = $J.load('net.sf.freecol.common.model.GoldTradeItem');
  HistoryEvent = $J.load('net.sf.freecol.common.model.HistoryEvent');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  LastSale = $J.load('net.sf.freecol.common.model.LastSale');
  LostCityRumour$RumourType = $J.load('net.sf.freecol.common.model.LostCityRumour$RumourType');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  MarketWas = $J.load('net.sf.freecol.common.model.MarketWas');
  ModelMessage = $J.load('net.sf.freecol.common.model.ModelMessage');
  ModelMessage$MessageType = $J.load('net.sf.freecol.common.model.ModelMessage$MessageType');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  NativeTrade$NativeTradeAction = $J.load('net.sf.freecol.common.model.NativeTrade$NativeTradeAction');
  NativeTradeItem = $J.load('net.sf.freecol.common.model.NativeTradeItem');
  Ownable = $J.load('net.sf.freecol.common.model.Ownable');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Player$NoClaimReason = $J.load('net.sf.freecol.common.model.Player$NoClaimReason');
  Player$PlayerType = $J.load('net.sf.freecol.common.model.Player$PlayerType');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  TradeRoute = $J.load('net.sf.freecol.common.model.TradeRoute');
  Turn = $J.load('net.sf.freecol.common.model.Turn');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$MoveType = $J.load('net.sf.freecol.common.model.Unit$MoveType');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  UnitWas = $J.load('net.sf.freecol.common.model.UnitWas');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  Introspector = $J.load('net.sf.freecol.common.util.Introspector');
  Introspector$IntrospectorException = $J.load('net.sf.freecol.common.util.Introspector$IntrospectorException');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
