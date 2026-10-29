// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/debug/DebugUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Comparator, HashMap, JObject, JString, Logger, NullPointerException, NumberFormatException } from '../../../../../../jre/index.ts';

let JMenuItem, ChoiceItem, FreeColDebugger, FreeColDebugger$DebugMode, Messages, FreeColXMLWriter$WriteScope, AbstractGoods, Colony, Colony$NoBuildReason, Europe, Game$LogoutReason, GoodsContainer, IndianSettlement, LostCityRumour$RumourType, Map_, Monarch$MonarchAction, Player, Player$NoValueType, Settlement, StringTemplate, Tile, Unit, Unit$UnitLabelType, GameOptions, CollectionUtils, LogBuilder, StringUtils, TransportMission, ServerBuilding, ServerColony, ServerPlayer, ServerUnit;

/**
 * Utilities for in-game debug support.
 *
 * Several client GUI features have optional debug routines.  These
 * routines are typically quite special in that they need to intrusive
 * things with the server, and do not have much in common with the
 * client code while still sometimes needing user interaction.  They
 * also have considerable similarity amongst themselves.  So they have
 * been collected here.
 *
 * The client GUI features that are the source of these routines are:
 *   - The colony panel
 *   - The debug menu
 *   - The tile popup menu
 */
export class DebugUtils extends JObject {
  static logger: Logger = null;
  _DebugUtils(): this {
    return this;
  }
  /**
   * Reconnect utility.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static reconnect(freeColClient: FreeColClient): void {
    freeColClient.getConnectController().requestLogout(Game$LogoutReason.RECONNECT);
  }
  /**
   * Debug action to add buildings to the user colonies.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param title A label for the choice dialog.
   */
  static addBuildings(freeColClient: FreeColClient, title: string): void {
    let server = freeColClient.getFreeColServer();
    let game = freeColClient.getGame();
    let spec = game.getSpecification();
    let gui = freeColClient.getGUI();
    let player = freeColClient.getMyPlayer();
    let mapper = (bt) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(bt), bt);
    let tmpl = StringTemplate.name_(title);
    let buildingType = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function$Comparator(spec.getBuildingTypeList(), CollectionUtils.alwaysTrue(), mapper, Comparator.naturalOrder()));
    if (buildingType == null) {
      return;
    }
    let sGame = server.getGame();
    let sBuildingType = server.getSpecification().getBuildingType(buildingType.getId());
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(Player));
    let fails = 0;
    let sColonies = sPlayer.getColonyList();
    let results = new ArrayList(sColonies.size());
    for (const $it0 = sColonies.iterator(); $it0.hasNext(); ) {
      let sColony = $it0.next();
      let reason = sColony.getNoBuildReason(sBuildingType, null);
      results.add(sColony.getName() + ': ' + $J.str(reason));
      if (reason === Colony$NoBuildReason.NONE) {
        let sBuilding = sColony.getBuilding(sBuildingType);
        let present = (sBuilding == null) ? Collections.emptyList() : sBuilding.getUnitList();
        if (sBuildingType.isDefenceType()) {
          sColony.getTile$().cacheUnseen$();
        }
        sBuilding = new ServerBuilding()._ServerBuilding$Game$Colony$BuildingType(sGame, sColony, sBuildingType);
        sColony.addBuilding(sBuilding);
        for (const $it1 = present.iterator(); $it1.hasNext(); ) {
          let u = $it1.next();
          u.setLocation(sBuilding);
        }
      } else {
        fails++;
      }
    }
    gui.showInformationPanel$String(StringUtils.join$String$Collection(', ', results));
    if (fails < sPlayer.getSettlementCount()) {
      DebugUtils.reconnect(freeColClient);
    }
  }
  /**
   * Debug action to add a founding father.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param fatherTitle A label for the choice dialog.
   */
  static addFathers(freeColClient: FreeColClient, fatherTitle: string): void {
    let server = freeColClient.getFreeColServer();
    let gui = freeColClient.getGUI();
    let player = freeColClient.getMyPlayer();
    let sGame = server.getGame();
    let sSpec = sGame.getSpecification();
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(Player));
    let noFatherPred = (f) => !sPlayer.hasFather(f);
    let mapper = (f) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(f), f);
    let tmpl = StringTemplate.name_(fatherTitle);
    let father = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function$Comparator(sSpec.getFoundingFathers(), noFatherPred, mapper, Comparator.naturalOrder()));
    if (father != null) {
      server.getInGameController().addFoundingFather(sPlayer, father);
    }
  }
  /**
   * Debug action to add gold.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static addGold(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    let gui = freeColClient.getGUI();
    let player = freeColClient.getMyPlayer();
    let sGame = server.getGame();
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(Player));
    let response = gui.getInput(null, StringTemplate.template$String('prompt.selectGold'), String(1000), 'ok', 'cancel');
    if (response == null || (response.length === 0)) {
      return;
    }
    let gold: number;
    try {
      gold = $J.parseInt(response);
    } catch ($e2) {
      if ($J.isa($e2, NumberFormatException)) {
        let x = $J.exc($e2);
        return;
      } else {
        throw $e2;
      }
    }
    player.modifyGold(gold);
    sPlayer.modifyGold(gold);
  }
  /**
   * Add an "add goods" menu item to a unit menu.
   *
   * @param fcc The enclosing {@code FreeColClient}.
   * @param unit The {@code Unit} to add goods to.
   * @param menu The {@code JPopupMenu} to add the entry to.
   */
  static addGoodsAdditionEntry(fcc: FreeColClient, unit: Unit, menu: JPopupMenu): void {
    let addg = new JMenuItem()._JMenuItem$String('Add goods');
    addg.setOpaque(false);
    addg.addActionListener((ae) => {
      DebugUtils.addUnitGoods(fcc, unit);
    });
    addg.setEnabled(true);
    menu.add$JMenuItem(addg);
  }
  /**
   * Debug action to add immigration.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static addImmigration(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    let gui = freeColClient.getGUI();
    let player = freeColClient.getMyPlayer();
    let sGame = server.getGame();
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(Player));
    let response = gui.getInput(null, StringTemplate.template$String('prompt.selectImmigration'), String(100), 'ok', 'cancel');
    if (response == null || (response.length === 0)) {
      return;
    }
    let crosses: number;
    try {
      crosses = $J.parseInt(response);
    } catch ($e3) {
      if ($J.isa($e3, NumberFormatException)) {
        let x = $J.exc($e3);
        return;
      } else {
        throw $e3;
      }
    }
    player.modifyImmigration(crosses);
    sPlayer.modifyImmigration(crosses);
  }
  /**
   * Debug action to add liberty to the player colonies.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static addLiberty(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    let gui = freeColClient.getGUI();
    let player = freeColClient.getMyPlayer();
    let sGame = server.getGame();
    let response = gui.getInput(null, StringTemplate.template$String('prompt.selectLiberty'), String(100), 'ok', 'cancel');
    if (response == null || (response.length === 0)) {
      return;
    }
    let liberty: number;
    try {
      liberty = $J.parseInt(response);
    } catch ($e4) {
      if ($J.isa($e4, NumberFormatException)) {
        let x = $J.exc($e4);
        return;
      } else {
        throw $e4;
      }
    }
    for (const $it5 = player.getColonyList().iterator(); $it5.hasNext(); ) {
      let c = $it5.next();
      c.addLiberty(liberty);
      sGame.getFreeColGameObject$String$Class(c.getId(), $J.cls(Colony)).addLiberty(liberty);
    }
  }
  /**
   * Adds a change listener to a menu (the debug menu in fact),
   * that changes the label on a menu item when the skip status changes.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param menu The menu to add the change listener to.
   * @param item The menu item whose label should change.
   */
  static addSkipChangeListener(freeColClient: FreeColClient, menu: JMenu, item: JMenuItem): void {
    let server = freeColClient.getFreeColServer();
    if (server == null) {
      return;
    }
    menu.addChangeListener((e) => {
      let skipping = server.getInGameController().getSkippedTurns() > 0;
      item.setText(Messages.message$String((skipping) ? 'menuBar.debug.stopSkippingTurns' : 'menuBar.debug.skipTurns'));
    });
  }
  /**
   * Debug action to add a new unit to a tile.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param tile The {@code Tile} to add to.
   */
  static addNewUnitToTile(freeColClient: FreeColClient, tile: Tile): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sSpec = sGame.getSpecification();
    let player = freeColClient.getMyPlayer();
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(Player));
    let sTile = sGame.getFreeColGameObject$String$Class(tile.getId(), $J.cls(Tile));
    let gui = freeColClient.getGUI();
    let mapper = (ut) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(ut), ut);
    let tmpl = StringTemplate.template$String('prompt.selectUnitType');
    let unitChoice = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function$Comparator(sSpec.getUnitTypeList(), CollectionUtils.alwaysTrue(), mapper, Comparator.naturalOrder()));
    if (unitChoice == null) {
      return;
    }
    let sCarrier = (sTile.isLand() || unitChoice.isNaval()) ? null : CollectionUtils.find$Collection$Predicate(sTile.getUnitList(), (u) => u.isNaval() && u.getSpaceLeft() >= unitChoice.getSpaceTaken());
    let sUnit = new ServerUnit()._ServerUnit$Game$Location$Player$UnitType(sGame, ((sCarrier != null) ? sCarrier : sTile), sPlayer, unitChoice);
    (sPlayer).exploreForUnit(sUnit);
    sUnit.setMovesLeft(sUnit.getInitialMovesLeft());
    sPlayer.invalidateCanSeeTiles();
    DebugUtils.reconnect(freeColClient);
    let game = freeColClient.getGame();
    if (game != null) {
      let unit = game.getFreeColGameObject$String$Class(sUnit.getId(), $J.cls(Unit));
      if (unit != null) {
        gui.changeView$Unit$boolean(unit, false);
      }
    }
  }
  /**
   * Debug action to add goods to a unit.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to add to.
   */
  static addUnitGoods(freeColClient: FreeColClient, unit: Unit): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sSpec = sGame.getSpecification();
    let gui = freeColClient.getGUI();
    let goodsPred = (gt) => !gt.isFoodType() || gt === sSpec.getPrimaryFoodType();
    let mapper = (gt) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(gt), gt);
    let tmpl = StringTemplate.template$String('prompt.selectGoodsType');
    let goodsType = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function$Comparator(sSpec.getGoodsTypeList(), goodsPred, mapper, Comparator.naturalOrder()));
    if (goodsType == null) {
      return;
    }
    let amount = gui.getInput(null, StringTemplate.template$String('prompt.selectGoodsAmount'), '20', 'ok', 'cancel');
    if (amount == null) {
      return;
    }
    let a: number;
    try {
      a = $J.parseInt(amount);
    } catch ($e6) {
      if ($J.isa($e6, NumberFormatException)) {
        let nfe = $J.exc($e6);
        return;
      } else {
        throw $e6;
      }
    }
    let sGoodsType = sSpec.getGoodsType(goodsType.getId());
    let ugc = unit.getGoodsContainer();
    let sgc = sGame.getFreeColGameObject$String$Class(ugc.getId(), $J.cls(GoodsContainer));
    ugc.setAmount(goodsType, a);
    sgc.setAmount(sGoodsType, a);
  }
  /**
   * Debug action to apply a disaster to a colony.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} to apply a disaster to.
   */
  static applyDisaster(freeColClient: FreeColClient, colony: Colony): void {
    let gui = freeColClient.getGUI();
    let mapper = (rc) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(rc.getObject()) + ' ' + String(rc.getProbability()), rc.getObject());
    let disasters = CollectionUtils.transform$Stream$Predicate$Function$Comparator(colony.getDisasterChoices(), CollectionUtils.alwaysTrue(), mapper, Comparator.naturalOrder());
    if (disasters.isEmpty()) {
      gui.showErrorPanel$StringTemplate(StringTemplate.template$String('error.disasterNotAvailable').addName$String$String('%colony%', colony.getName()));
      return;
    }
    let tmpl = StringTemplate.template$String('prompt.selectDisaster');
    let disaster = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', disasters);
    if (disaster == null) {
      return;
    }
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sColony = sGame.getFreeColGameObject$String$Class(colony.getId(), $J.cls(ServerColony));
    let sDisaster = sGame.getSpecification().getDisaster(disaster.getId());
    if (server.getInGameController().debugApplyDisaster(sColony, sDisaster) <= 0) {
      gui.showErrorPanel$StringTemplate(StringTemplate.template$String('error.disasterAvoided').addName$String$String('%colony%', colony.getName()).addNamed$String$Named('%disaster%', disaster));
    }
    freeColClient.getInGameController().nextModelMessage();
  }
  /**
   * Debug action to change ownership of a colony.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} to take ownership of.
   */
  static changeOwnership$FreeColClient$Colony(freeColClient: FreeColClient, colony: Colony): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sColony = sGame.getFreeColGameObject$String$Class(colony.getId(), $J.cls(ServerColony));
    let gui = freeColClient.getGUI();
    let game = freeColClient.getGame();
    let mapper = (p) => new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(p.getCountryLabel()), p);
    let tmpl = StringTemplate.template$String('prompt.selectOwner');
    let player = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Stream$Predicate$Function$Comparator(game.getLiveEuropeanPlayers([colony.getOwner()]), CollectionUtils.alwaysTrue(), mapper, Comparator.naturalOrder()));
    if (player == null) {
      return;
    }
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(ServerPlayer));
    server.getInGameController().debugChangeOwner$ServerColony$ServerPlayer(sColony, sPlayer);
    let myPlayer = freeColClient.getMyPlayer();
    if (gui.getActiveUnit() != null && gui.getActiveUnit().getOwner() !== myPlayer) {
      freeColClient.getInGameController().nextActiveUnit();
    }
  }
  /**
   * Debug action to change ownership of a unit.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to take ownership of.
   */
  static changeOwnership$FreeColClient$Unit(freeColClient: FreeColClient, unit: Unit): void {
    let server = freeColClient.getFreeColServer();
    let gui = freeColClient.getGUI();
    let game = unit.getGame();
    let mapper = (p) => new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(p.getCountryLabel()), p);
    let tmpl = StringTemplate.template$String('prompt.selectOwner');
    let player = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Stream$Predicate$Function$Comparator(game.getLivePlayers([]), (p) => unit.getType().isAvailableTo([p]), mapper, Comparator.naturalOrder()));
    if (player == null || unit.getOwner() === player) {
      return;
    }
    let sGame = server.getGame();
    let sUnit = sGame.getFreeColGameObject$String$Class(unit.getId(), $J.cls(ServerUnit));
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(ServerPlayer));
    server.getInGameController().debugChangeOwner$ServerUnit$ServerPlayer(sUnit, sPlayer);
    let myPlayer = freeColClient.getMyPlayer();
    if (myPlayer.owns(unit)) {
      gui.changeView$Unit$boolean(unit, true);
    }
  }
  /**
   * Debug action to change the roles of a unit.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to change the role of.
   */
  static changeRole(freeColClient: FreeColClient, unit: Unit): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sUnit = sGame.getFreeColGameObject$String$Class(unit.getId(), $J.cls(Unit));
    let gui = freeColClient.getGUI();
    let roleMapper = (r) => new ChoiceItem()._ChoiceItem$String$Object(r.getId(), r);
    let tmpl = StringTemplate.template$String('prompt.selectRole');
    let roleChoice = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Stream$Predicate$Function$Comparator(sGame.getSpecification().getRoles(), CollectionUtils.alwaysTrue(), roleMapper, Comparator.naturalOrder()));
    if (roleChoice == null) {
      return;
    }
    sUnit.changeRole(roleChoice, roleChoice.getMaximumCount());
    DebugUtils.reconnect(freeColClient);
  }
  /**
   * Debug action to check for client-server desynchronization.
   *
   * Called from the debug menu and client controller.
   * TODO: This is still fairly new and messy.  Defer i18n for a while.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @return True if desynchronization found.
   */
  static checkDesyncAction(freeColClient: FreeColClient): boolean {
    let server = freeColClient.getFreeColServer();
    let cGame = freeColClient.getGame();
    let cPlayer = freeColClient.getMyPlayer();
    let sGame = server.getGame();
    let sMap = sGame.getMap();
    let sPlayer = sGame.getFreeColGameObject$String$Class(cPlayer.getId(), $J.cls(ServerPlayer));
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['Desynchronization detected\n']);
    lb.mark();
    sMap.forEachTile$Predicate$Consumer((t) => sPlayer.canSee(t), (t) => DebugUtils.checkDesyncTile(cGame, sPlayer, t, lb));
    let problemDetected = lb.grew([]);
    let goodsProblemDetected = false;
    let cMarket = cPlayer.getMarket();
    let sMarket = sPlayer.getMarket();
    if (sMarket != null && cMarket != null) {
      for (const $it7 = sGame.getSpecification().getGoodsTypeList().iterator(); $it7.hasNext(); ) {
        let sg = $it7.next();
        let sPrice = sMarket.getBidPrice(sg, 1);
        let cg = cGame.getSpecification().getGoodsType(sg.getId());
        let cPrice = cMarket.getBidPrice(cg, 1);
        if (sPrice !== cPrice) {
          lb.add(['Goods prices for ', sg, ' differ: ', sPrice, '!=', cPrice, ' ']);
          goodsProblemDetected = true;
        }
      }
    }
    if (goodsProblemDetected) {
      lb.add(['  Server:\n', sPlayer.getMarket(), '\n', '  Client:\n', cPlayer.getMarket(), '\n']);
      problemDetected = true;
    }
    if (problemDetected) {
      lb.shrink('\n');
      let err = lb.toString();
      freeColClient.getGUI().showInformationPanel$String(err);
      DebugUtils.logger.severe(err);
    }
    return problemDetected;
  }
  /**
   * Check if a tile is desynchronized.
   *
   * @param cGame The client-side {@code Game}.
   * @param sPlayer The server-side {@code ServerPlayer} to check for.
   * @param sTile The server-side {@code Tile} to check.
   * @param lb A {@code LogBuilder} to log problems to.
   */
  static checkDesyncTile(cGame: Game, sPlayer: ServerPlayer, sTile: Tile, lb: LogBuilder): void {
    let cTile = cGame.getFreeColGameObject$String$Class(sTile.getId(), $J.cls(Tile));
    for (const $it8 = (CollectionUtils.transform$Stream$Predicate(sTile.getUnits(), (u) => sPlayer.canSeeUnit(u))).iterator(); $it8.hasNext(); ) {
      let su = $it8.next();
      let cu = cGame.getFreeColGameObject$String$Class(su.getId(), $J.cls(Unit));
      if (cu == null) {
        lb.add(['Unit missing on client-side.\n', '  Server: ', su.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL), '(', su.getId(), ') from: ', su.getLocation().getId(), '.\n']);
        try {
          lb.add(['  Client: ', cTile.getFirstUnit(), '\n']);
        } catch ($e9) {
          if ($J.isa($e9, NullPointerException)) {
            let npe = $J.exc($e9);
          } else {
            throw $e9;
          }
        }
      } else {
        if (cu.hasTile() && !$J.equals(cu.getTile$().getId(), su.getTile$().getId())) {
          lb.add(['Unit located on different tiles.\n', '  Server: ', su.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL), '(', su.getId(), ') from: ', su.getLocation().getId(), '\n', '  Client: ', cu.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL), '(', cu.getId(), ') at: ', cu.getLocation().getId(), '\n']);
        }
      }
    }
    let sSettlement = sTile.getSettlement();
    let cSettlement = cTile.getSettlement();
    if (sSettlement == null) {
      if (cSettlement == null) {
      } else {
        lb.add(['Settlement still present in client: ', cSettlement]);
      }
    } else {
      if (cSettlement == null) {
        lb.add(['Settlement not present in client: ', sSettlement]);
      } else if ($J.equals(sSettlement.getId(), cSettlement.getId())) {
      } else {
        lb.add(['Settlements differ.\n  Server: ', sSettlement.toString(), '\n  Client: ', cSettlement.toString(), '\n']);
      }
    }
  }
  /**
   * Debug action to display an AI colony plan.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} to summarize.
   */
  static displayColonyPlan(freeColClient: FreeColClient, colony: Colony): void {
    let server = freeColClient.getFreeColServer();
    let aiMain = server.getAIMain();
    let aiColony = aiMain.getAIColony(colony);
    if (aiColony == null) {
      freeColClient.getGUI().showErrorPanel$StringTemplate(StringTemplate.template$String('error.notAIColony').addName$String$String('%colony%', colony.getName()));
    } else {
      freeColClient.getGUI().showInformationPanel$String(aiColony.planToString());
    }
  }
  /**
   * Debug action to create a string showing the colony value for
   * a given tile and player.
   *
   * Note: passing the freeColClient is redundant for now, but will
   * be needed if/when we move getColonyValue into the AI.
   *
   * @param tile The colony {@code Tile} to evaluate.
   * @return A string describing the colony value of a tile.
   */
  static getColonyValue(tile: Tile): string {
    let player = FreeColDebugger.debugDisplayColonyValuePlayer();
    if (player == null) {
      return null;
    }
    let value = player.getColonyValue(tile);
    if (value < 0) {
      return Player$NoValueType.fromValue(value).toString();
    }
    return String(value);
  }
  /**
   * Debug action to display Europe.
   *
   * Called from the debug popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static displayEurope(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let aiMain = server.getAIMain();
    let lb = new LogBuilder()._LogBuilder(256);
    let inEurope = new ArrayList();
    let toEurope = new ArrayList();
    let toAmerica = new ArrayList();
    let units = new HashMap();
    for (const $it10 = sGame.getLiveEuropeanPlayerList([]).iterator(); $it10.hasNext(); ) {
      let tp = $it10.next();
      let p = sGame.getFreeColGameObject$String$Class(tp.getId(), $J.cls(Player));
      if (p.getEurope() == null) {
        continue;
      }
      inEurope.clear();
      toEurope.clear();
      toAmerica.clear();
      units.clear();
      units.put(Messages.message$String('sailingToEurope'), toEurope);
      units.put(Messages.getName$Named(p.getEurope()), inEurope);
      units.put(Messages.message$String('sailingToAmerica'), toAmerica);
      lb.add(['\n==', Messages.message$StringTemplate(p.getCountryLabel()), '==\n']);
      for (const $it11 = p.getEurope().getUnitList().iterator(); $it11.hasNext(); ) {
        let u = $it11.next();
        if (u.getDestination() instanceof Map_) {
          toAmerica.add(u);
        } else if (u.getDestination() instanceof Europe) {
          toEurope.add(u);
        } else {
          inEurope.add(u);
        }
      }
      CollectionUtils.forEachMapEntry$Map$Consumer(units, (e) => DebugUtils.logEurope(aiMain, lb, e.getKey(), e.getValue()));
      lb.add(['\n->', Messages.message$String('immigrants'), '\n\n']);
      for (const $it12 = p.getEurope().getExpandedRecruitables(false).iterator(); $it12.hasNext(); ) {
        let au = $it12.next();
        lb.add([Messages.message$StringTemplate(au.getSingleLabel()), '\n']);
      }
      lb.add(['\n']);
    }
    freeColClient.getGUI().showInformationPanel$String(lb.toString());
  }
  /**
   * Log European unit lists.
   *
   * @param aiMain The main AI object.
   * @param lb The {@code LogBuilder} to log to.
   * @param label A label for the group of units.
   * @param units The {@code Unit}s to log.
   */
  static logEurope(aiMain: AIMain, lb: LogBuilder, label: string, units: List<Unit>): void {
    if (units.isEmpty()) {
      return;
    }
    lb.add(['\n->', label, '\n']);
    for (const $it13 = units.iterator(); $it13.hasNext(); ) {
      let u = $it13.next();
      lb.add(['\n', u.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL)]);
      if (u.isDamagedAndUnderForcedRepair()) {
        lb.add([' (', Messages.message$StringTemplate(u.getRepairLabel()), ')']);
      } else {
        lb.add(['    ']);
        let aiu = aiMain.getAIUnit(u);
        if (!aiu.hasMission$()) {
          lb.add([' (', Messages.message$String('none'), ')']);
        } else {
          lb.add([JString.replaceAll(aiu.getMission$().toString(), '\n', '    \n')]);
        }
      }
    }
    lb.add(['\n']);
  }
  /**
   * Debug action to display a mission.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to display.
   */
  static displayMission(freeColClient: FreeColClient, unit: Unit): void {
    let server = freeColClient.getFreeColServer();
    let aiMain = server.getAIMain();
    let aiUnit = aiMain.getAIUnit(unit);
    let m = aiUnit.getMission$();
    let msg = (m == null) ? Messages.message$String('none') : (m instanceof TransportMission) ? (m).toFullString() : m.toString();
    freeColClient.getGUI().showInformationPanel$String(msg);
  }
  /**
   * Debug action to dump a players units/iterators to stderr.
   *
   * Called from the debug menu.
   * TODO: missing i18n
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static displayUnits(freeColClient: FreeColClient): void {
    let player = freeColClient.getMyPlayer();
    let all = player.getUnitSet();
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add(['\nActive units:\n']);
    let u: Unit;
    let first = player.getNextActiveUnit();
    if (first != null) {
      lb.add([first.toString(), '\nat ', first.getLocation(), '\n']);
      all.remove(first);
      while (player.hasNextActiveUnit() && (u = player.getNextActiveUnit()) !== first) {
        lb.add([u, '\nat ', u.getLocation(), '\n']);
        all.remove(u);
      }
    }
    lb.add(['Going-to units:\n']);
    first = player.getNextGoingToUnit();
    if (first != null) {
      all.remove(first);
      lb.add([first, '\nat ', first.getLocation(), '\n']);
      while (player.hasNextGoingToUnit() && (u = player.getNextGoingToUnit()) !== first) {
        lb.add([u, '\nat ', u.getLocation(), '\n']);
        all.remove(u);
      }
    }
    lb.add(['Remaining units:\n']);
    for (const $it14 = all.iterator(); $it14.hasNext(); ) {
      let x = $it14.next();
      lb.add([x, '\nat ', x.getLocation(), '\n']);
    }
    freeColClient.getGUI().showInformationPanel$String(lb.toString());
  }
  /**
   * Debug action to dump a tile to stderr.
   *
   * Called from tile popup menu.
   * Not concerned with i18n for stderr output.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param tile The {@code Tile} to dump.
   */
  static dumpTile(freeColClient: FreeColClient, tile: Tile): void {
    let server = freeColClient.getFreeColServer();
    let game = freeColClient.getGame();
    let sGame = server.getGame();
    let player = freeColClient.getMyPlayer();
    $J.err.println('\nClient (' + game.getClientUserName() + '/' + player.getId() + '):');
    tile.save$OutputStream$WriteScope$boolean($J.err, FreeColXMLWriter$WriteScope.toClient(player), true);
    $J.err.println('\n\nServer:');
    let sTile = sGame.getFreeColGameObject$String$Class(tile.getId(), $J.cls(Tile));
    sTile.save$OutputStream$WriteScope$boolean($J.err, FreeColXMLWriter$WriteScope.toServer(), true);
    $J.err.println('\n\nSave:');
    sTile.save$OutputStream$WriteScope$boolean($J.err, FreeColXMLWriter$WriteScope.toSave(), true);
    $J.err.println(String.fromCharCode(10 /* \u000a */));
  }
  /**
   * Debug action to reset the moves left of the units on a tile.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param units The {@code Unit}s to reactivate.
   */
  static resetMoves(freeColClient: FreeColClient, units: List<Unit>): void {
    if (units.isEmpty()) {
      return;
    }
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let gui = freeColClient.getGUI();
    for (const $it15 = units.iterator(); $it15.hasNext(); ) {
      let u = $it15.next();
      let su = sGame.getFreeColGameObject$String$Class(u.getId(), $J.cls(Unit));
      u.setMovesLeft(u.getInitialMovesLeft());
      su.setMovesLeft(su.getInitialMovesLeft());
      for (const $it16 = u.getUnitList().iterator(); $it16.hasNext(); ) {
        let u2 = $it16.next();
        let su2 = sGame.getFreeColGameObject$String$Class(u2.getId(), $J.cls(Unit));
        u2.setMovesLeft(u2.getInitialMovesLeft());
        su2.setMovesLeft(su2.getInitialMovesLeft());
      }
    }
    let unit = units.get(0);
    gui.changeView$Unit$boolean(unit, true);
  }
  /**
   * Debug action to reveal or hide the map.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param reveal If true, reveal the map, else hide the map.
   */
  static revealMap(freeColClient: FreeColClient, reveal: boolean): void {
    let server = freeColClient.getFreeColServer();
    let game = freeColClient.getGame();
    let spec = game.getSpecification();
    server.exploreMapForAllPlayers(reveal);
    if (reveal) {
      FreeColDebugger.setNormalGameFogOfWar(spec.getBoolean(GameOptions.FOG_OF_WAR));
      spec.setBoolean(GameOptions.FOG_OF_WAR, false);
    } else {
      spec.setBoolean(GameOptions.FOG_OF_WAR, FreeColDebugger.getNormalGameFogOfWar());
    }
  }
  /**
   * Debug action to set the amount of goods in a colony.
   *
   * Called from the colony panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} to set goods amounts in.
   */
  static setColonyGoods(freeColClient: FreeColClient, colony: Colony): void {
    let spec = colony.getSpecification();
    let gui = freeColClient.getGUI();
    let goodsPred = (gt) => !gt.isFoodType() || gt === spec.getPrimaryFoodType();
    let mapper = (gt) => new ChoiceItem()._ChoiceItem$String$Object(Messages.getName$Named(gt), gt);
    let tmpl = StringTemplate.template$String('prompt.selectGoodsType');
    let goodsType = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$Collection$Predicate$Function$Comparator(spec.getGoodsTypeList(), goodsPred, mapper, Comparator.naturalOrder()));
    if (goodsType == null) {
      return;
    }
    let response = gui.getInput(null, StringTemplate.template$String('prompt.selectGoodsAmount'), String(colony.getGoodsCount(goodsType)), 'ok', 'cancel');
    if (response == null || (response.length === 0)) {
      return;
    }
    let a: number;
    try {
      a = $J.parseInt(response);
    } catch ($e17) {
      if ($J.isa($e17, NumberFormatException)) {
        let nfe = $J.exc($e17);
        return;
      } else {
        throw $e17;
      }
    }
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sSpec = server.getSpecification();
    let sGoodsType = sSpec.getGoodsType(goodsType.getId());
    let cgc = colony.getGoodsContainer();
    let sgc = sGame.getFreeColGameObject$String$Class(cgc.getId(), $J.cls(GoodsContainer));
    cgc.setAmount(goodsType, a);
    sgc.setAmount(sGoodsType, a);
  }
  /**
   * Set COMMS logging.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param log If true, enable COMMS logging.
   */
  static setCommsLogging(freeColClient: FreeColClient, log: boolean): void {
    let server = freeColClient.getFreeColServer();
    if (server != null) {
      server.getServer().setCommsLogging(log);
    }
  }
  /**
   * Debug action to set the next monarch action.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param monarchTitle A label for the choice dialog.
   */
  static setMonarchAction(freeColClient: FreeColClient, monarchTitle: string): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let player = freeColClient.getMyPlayer();
    let sPlayer = sGame.getFreeColGameObject$String$Class(player.getId(), $J.cls(ServerPlayer));
    let gui = freeColClient.getGUI();
    let mapper = (a) => new ChoiceItem()._ChoiceItem$Object(a);
    let tmpl = StringTemplate.name_(monarchTitle);
    let action = gui.getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$ObjectArr$Predicate$Function$Comparator(Monarch$MonarchAction.values(), CollectionUtils.alwaysTrue(), mapper, Comparator.naturalOrder()));
    if (action == null) {
      return;
    }
    server.getInGameController().setMonarchAction(sPlayer, action);
  }
  /**
   * Debug action to set the lost city rumour type on a tile.
   *
   * Called from tile popup menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param tile The {@code Tile} to operate on.
   */
  static setRumourType(freeColClient: FreeColClient, tile: Tile): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let sTile = sGame.getFreeColGameObject$String$Class(tile.getId(), $J.cls(Tile));
    let realRumourPred = (r) => r !== LostCityRumour$RumourType.NO_SUCH_RUMOUR;
    let mapper = (r) => new ChoiceItem()._ChoiceItem$String$Object(r.toString(), r);
    let tmpl = StringTemplate.template$String('prompt.selectLostCityRumour');
    let rumourChoice = freeColClient.getGUI().getChoice$StringTemplate$String$List(tmpl, 'cancel', CollectionUtils.transform$ObjectArr$Predicate$Function$Comparator(LostCityRumour$RumourType.values(), realRumourPred, mapper, Comparator.naturalOrder()));
    if (rumourChoice == null) {
      return;
    }
    tile.getTileItemContainer().getLostCityRumour().setType(rumourChoice);
    sTile.getTileItemContainer().getLostCityRumour().setType(rumourChoice);
  }
  /**
   * Consider showing a foreign colony.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} to display.
   */
  static showForeignColony(freeColClient: FreeColClient, colony: Colony): void {
    if (colony == null || !FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS)) {
      return;
    }
    let server = freeColClient.getFreeColServer();
    if (server == null) {
      return;
    }
    colony = server.getGame().getFreeColGameObject$String$Class(colony.getId(), $J.cls(Colony));
    freeColClient.getGUI().showColonyPanel(colony, null);
  }
  /**
   * Debug action to skip turns.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static skipTurns(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    if (server != null && server.getInGameController().getSkippedTurns() > 0) {
      freeColClient.skipTurns(0);
      return;
    }
    freeColClient.skipTurns(0);
    let response = freeColClient.getGUI().getInput(null, StringTemplate.key$String('prompt.selectTurnsToSkip'), String(10), 'ok', 'cancel');
    if (response == null || (response.length === 0)) {
      return;
    }
    let skip: number;
    try {
      skip = $J.parseInt(response);
    } catch ($e18) {
      if ($J.isa($e18, NumberFormatException)) {
        let nfe = $J.exc($e18);
        skip = -1;
      } else {
        throw $e18;
      }
    }
    if (skip > 0) {
      freeColClient.skipTurns(skip);
    }
  }
  /**
   * Debug action to display statistics.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static statistics(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let cGame = freeColClient.getGame();
    let gui = freeColClient.getGUI();
    let serverStats = sGame.getStatistics();
    serverStats.putAll(server.getAIMain().getAIStatistics());
    let clientStats = cGame.getStatistics();
    gui.showStatisticsPanel(serverStats, clientStats);
  }
  /**
   * Debug action to step the random number generator.
   *
   * Called from the debug menu.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  static stepRNG(freeColClient: FreeColClient): void {
    let server = freeColClient.getFreeColServer();
    let gui = freeColClient.getGUI();
    let more = true;
    while (more) {
      let val = server.getInGameController().stepRandom();
      more = gui.confirm$StringTemplate$String$String(StringTemplate.template$String('prompt.stepRNG').addAmount('%value%', val), 'more', 'cancel');
    }
  }
  /**
   * Debug action to summarize information about a native settlement
   * that is normally hidden.
   *
   * Called from tile popup menu.
   * TODO: missing i18n
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param is The {@code IndianSettlement} to summarize.
   */
  static summarizeSettlement(freeColClient: FreeColClient, is$: IndianSettlement): void {
    let server = freeColClient.getFreeColServer();
    let sGame = server.getGame();
    let aiMain = server.getAIMain();
    let sSpec = sGame.getSpecification();
    let sis = sGame.getFreeColGameObject$String$Class(is$.getId(), $J.cls(IndianSettlement));
    let sGoodsTypes = sSpec.getGoodsTypeList();
    let lb = new LogBuilder()._LogBuilder(256);
    lb.add([sis.getName(), '\n\nAlarm\n']);
    let mostHated = sis.getMostHated();
    for (const $it19 = sGame.getLiveEuropeanPlayerList([]).iterator(); $it19.hasNext(); ) {
      let p = $it19.next();
      let tension = sis.getAlarm$Player(p);
      lb.add([Messages.message$StringTemplate(p.getNationLabel()), ' ', ((tension == null) ? '(none)' : String(tension.getValue())), ((mostHated === p) ? ' (most hated)' : ''), ' ', Messages.message$String(sis.getAlarmLevelKey(p)), ' ', sis.getContactLevel(p), '\n']);
    }
    lb.add(['\nGoods\n']);
    for (const $it20 = sGoodsTypes.iterator(); $it20.hasNext(); ) {
      let gt = $it20.next();
      let amount = sis.getGoodsCount(gt);
      let prod = sis.getTotalProductionOf(gt);
      if (amount > 0 || prod !== 0) {
        lb.add([Messages.message$StringTemplate(new AbstractGoods()._AbstractGoods$GoodsType$int(gt, amount).getLabel$()), ' ', ((prod > 0) ? '+' : ''), prod, '\n']);
      }
    }
    lb.add(['\nPotential sales\n']);
    for (const $it21 = sis.getSellGoods(null).iterator(); $it21.hasNext(); ) {
      let g = $it21.next();
      lb.add([Messages.getName$Named(g.getType()), ' ', g.getAmount(), ' = ', sis.getPriceToSell$GoodsType$int(g.getType(), g.getAmount()), '\n']);
    }
    lb.add(['\nPrices (buy 1/100 / sell 1/100)\n']);
    let wanted = sis.getWantedGoods$();
    for (const $it22 = sSpec.getStorableGoodsTypeList().iterator(); $it22.hasNext(); ) {
      let type$ = $it22.next();
      let idx = wanted.indexOf(type$);
      lb.add([Messages.getName$Named(type$), ': ', sis.getPriceToBuy$GoodsType$int(type$, 1), '/', sis.getPriceToBuy$GoodsType$int(type$, 100), ' / ', sis.getPriceToSell$GoodsType$int(type$, 1), '/', sis.getPriceToSell$GoodsType$int(type$, 100), ((idx < 0) ? '' : ' wanted[' + String(idx) + ']'), '\n']);
    }
    lb.add(['\nUnits present\n']);
    for (const $it23 = sis.getUnitList().iterator(); $it23.hasNext(); ) {
      let u = $it23.next();
      let m = aiMain.getAIUnit(u).getMission$();
      lb.add([u, ' at ', u.getLocation()]);
      if (m != null) {
        lb.add([' ', m.getClass(), '.']);
      }
      lb.add(['\n']);
    }
    lb.add(['\nUnits owned\n']);
    for (const $it24 = sis.getOwnedUnitList().iterator(); $it24.hasNext(); ) {
      let u = $it24.next();
      let m = aiMain.getAIUnit(u).getMission$();
      lb.add([u, ' at ', u.getLocation()]);
      if (m != null) {
        lb.add([' ', m.getClass(), '.']);
      }
      lb.add(['\n']);
    }
    lb.add(['\nTiles\n']);
    for (const $it25 = sis.getOwnedTiles().iterator(); $it25.hasNext(); ) {
      let t = $it25.next();
      lb.add([t, '\n']);
    }
    lb.add(['\nConvert Progress = ', sis.getConvertProgress()]);
    lb.add(['\nLast Tribute = ', sis.getLastTribute()]);
    freeColClient.getGUI().showInformationPanel$String(lb.toString());
  }
  static locationDisplayString(target: Location): string {
    if (target == null) {
      return 'No target';
    }
    if (target.getTile$() == null) {
      return target.toString();
    }
    let tileCoordinates = '(' + target.getTile$().getX() + ', ' + target.getTile$().getY() + ')';
    if (target instanceof Settlement) {
      return (target).getName() + '\n ' + tileCoordinates;
    }
    if (target instanceof Unit) {
      let unit = target;
      return Messages.message$StringTemplate(unit.getLabel$()) + '\n' + tileCoordinates;
    }
    if (target instanceof Tile) {
      return tileCoordinates;
    }
    return target.toString();
  }
  static $clinit() {
    DebugUtils.logger = Logger.getLogger($J.cls(DebugUtils).getName());
  }
}

$J.define(DebugUtils, 'net.sf.freecol.common.debug.DebugUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DebugUtils' }, meths: { 'changeOwnership(net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit)': 'changeOwnership$FreeColClient$Unit', 'changeOwnership(net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony)': 'changeOwnership$FreeColClient$Colony' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  JMenuItem = $J.load('javax.swing.JMenuItem');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColXMLWriter$WriteScope = $J.load('net.sf.freecol.common.io.FreeColXMLWriter$WriteScope');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Colony$NoBuildReason = $J.load('net.sf.freecol.common.model.Colony$NoBuildReason');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Game$LogoutReason = $J.load('net.sf.freecol.common.model.Game$LogoutReason');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  LostCityRumour$RumourType = $J.load('net.sf.freecol.common.model.LostCityRumour$RumourType');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Player$NoValueType = $J.load('net.sf.freecol.common.model.Player$NoValueType');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
  TransportMission = $J.load('net.sf.freecol.server.ai.mission.TransportMission');
  ServerBuilding = $J.load('net.sf.freecol.server.model.ServerBuilding');
  ServerColony = $J.load('net.sf.freecol.server.model.ServerColony');
  ServerPlayer = $J.load('net.sf.freecol.server.model.ServerPlayer');
  ServerUnit = $J.load('net.sf.freecol.server.model.ServerUnit');
});
