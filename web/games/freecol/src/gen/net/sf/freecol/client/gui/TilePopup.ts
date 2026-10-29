// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/TilePopup.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { JPopupMenu } from '../../../../../javax/swing/JPopupMenu.ts';

let Font, JMenu, JMenuItem, JSeparator, FontLibrary, UnloadAction, Utility, DebugUtils, FreeColDebugger, FreeColDebugger$DebugMode, Messages, IndianSettlement, StringTemplate, Unit, Unit$UnitLabelType, Unit$UnitState, CollectionUtils, LogBuilder;

/**
 * Allows the user to obtain more info about a certain tile or to
 * activate a specific unit on the tile, or perform various debug mode
 * actions.
 */
export class TilePopup extends JPopupMenu {
  static logger: Logger = null;
  static readonly UNIT_LINES_IN_FIRST_MENU: number = 9;
  static readonly UNIT_LINES_IN_OTHER_MENUS: number = 19;
  freeColClient: FreeColClient = null;
  gui: GUI = null;
  font$TilePopup: Font = null;
  hasAnItem: boolean = false;
  /**
   * The constructor that will insert the MenuItems.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param tile The {@code Tile} to create a popup for.
   *       The popup menu also appears near this {@code Tile}.
   */
  _TilePopup(freeColClient: FreeColClient, tile: Tile): this {
    this._JPopupMenu$String(Messages.message$StringTemplate(tile.getSimpleLabel()));
    this.hasAnItem = false;
    this.freeColClient = freeColClient;
    this.gui = freeColClient.getGUI();
    this.font$TilePopup = FontLibrary.getScaledFont$String('normal-bold-tiny');
    let igc = freeColClient.getInGameController();
    let player = freeColClient.getMyPlayer();
    let activeUnit = this.gui.getActiveUnit();
    if (activeUnit != null) {
      let owned = player != null && player.owns(activeUnit);
      let unitTile = activeUnit.getTile$();
      if (owned && unitTile != null) {
        let gotoMenuItem = null;
        if (activeUnit.isOffensiveUnit() && unitTile.isAdjacent(tile) && activeUnit.getMoveType$Tile(tile).isAttack()) {
          gotoMenuItem = Utility.localizedMenuItem$StringTemplate(activeUnit.getCombatLabel(tile));
        } else if (activeUnit.getSimpleMoveType$Tile$Tile(unitTile, tile).isLegal()) {
          gotoMenuItem = Utility.localizedMenuItem$String('goToThisTile');
        }
        if (gotoMenuItem != null) {
          gotoMenuItem.addActionListener((ae) => {
            if (!freeColClient.currentPlayerIsMyPlayer()) {
              return;
            }
            this.gui.performGoto$Tile(tile);
          });
          this.add$JMenuItem(gotoMenuItem);
        }
        if (unitTile === tile) {
          if (activeUnit.canMoveToHighSeas()) {
            let europeMenuItem = Utility.localizedMenuItem$StringTemplate(StringTemplate.template$String('goToEurope'));
            europeMenuItem.addActionListener((ae) => {
              if (!freeColClient.currentPlayerIsMyPlayer()) {
                return;
              }
              igc.moveTo(activeUnit, player.getEurope());
            });
            this.add$JMenuItem(europeMenuItem);
            this.hasAnItem = true;
          }
          let ji = null;
          if (activeUnit.checkSetState(Unit$UnitState.ACTIVE)) {
            ji = Utility.localizedMenuItem$String('activateUnit');
            ji.addActionListener((ae) => {
              igc.changeState(activeUnit, Unit$UnitState.ACTIVE);
            });
            this.add$JMenuItem(ji);
            this.hasAnItem = true;
          }
          if (activeUnit.checkSetState(Unit$UnitState.FORTIFYING)) {
            ji = Utility.localizedMenuItem$String('fortify');
            ji.addActionListener((ae) => {
              igc.changeState(activeUnit, Unit$UnitState.FORTIFYING);
            });
            this.add$JMenuItem(ji);
            this.hasAnItem = true;
          }
          if (activeUnit.checkSetState(Unit$UnitState.SKIPPED)) {
            ji = Utility.localizedMenuItem$String('skip');
            ji.addActionListener((ae) => {
              igc.changeState(activeUnit, Unit$UnitState.SKIPPED);
            });
            this.add$JMenuItem(ji);
            this.hasAnItem = true;
          }
          if (activeUnit.canCarryTreasure() && activeUnit.canCashInTreasureTrain$()) {
            ji = Utility.localizedMenuItem$String('cashInTreasureTrain');
            ji.addActionListener((ae) => {
              igc.checkCashInTreasureTrain(activeUnit);
            });
            ji.setEnabled(true);
            this.add$JMenuItem(ji);
            this.hasAnItem = true;
          }
          if (activeUnit.getDestination() != null) {
            ji = Utility.localizedMenuItem$String('clearOrders');
            ji.addActionListener((ae) => {
              igc.clearOrders(activeUnit);
            });
            this.add$JMenuItem(ji);
            this.hasAnItem = true;
          }
        }
      }
      if (this.hasAnItem) {
        this.addSeparator();
      }
    }
    let settlement = tile.getSettlement();
    if (settlement != null) {
      if (settlement.getOwner() === player) {
        this.addColony((settlement));
      } else if (settlement instanceof IndianSettlement) {
        this.addIndianSettlement(settlement);
      }
      if (this.hasAnItem) {
        this.addSeparator();
      }
    }
    this.addTile(tile);
    this.addSeparator();
    let lineCount = 0;
    let maxUnits = TilePopup.UNIT_LINES_IN_FIRST_MENU;
    let currentMenu = this;
    let moreUnits = false;
    let firstUnit = tile.getFirstUnit();
    for (const $it0 = CollectionUtils.sort$Stream$Comparator(tile.getUnits(), Unit.typeRoleComparator).iterator(); $it0.hasNext(); ) {
      let u = $it0.next();
      if (lineCount > maxUnits) {
        let more = Utility.localizedMenu$String('more');
        more.setFont(more.getFont().deriveFont$int(Font.ITALIC));
        more.setOpaque(false);
        currentMenu.add$Component(more);
        currentMenu = more;
        moreUnits = true;
        lineCount = 0;
        maxUnits = TilePopup.UNIT_LINES_IN_OTHER_MENUS;
      }
      lineCount = (lineCount + this.addUnit(currentMenu, u, !u.isDamaged(), false)) | 0;
    }
    if (tile.getUnitCount() > 1 && player.owns(firstUnit)) {
      if (moreUnits) {
        this.addSeparator();
      }
      let activateAllItem = Utility.localizedMenuItem$StringTemplate(StringTemplate.template$String('activateAllUnits'));
      activateAllItem.addActionListener((ae) => {
        for (const $it1 = tile.getUnitList().iterator(); $it1.hasNext(); ) {
          let unit = $it1.next();
          igc.clearOrders(unit);
        }
        this.gui.changeView$Unit$boolean(tile.getFirstUnit(), false);
      });
      this.add$JMenuItem(activateAllItem);
    }
    if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS) && freeColClient.getFreeColServer() != null) {
      this.addDebugItems(freeColClient, tile);
    }
    let lastComponent = this.getComponent$int((this.getComponentCount() - 1) | 0);
    if (lastComponent instanceof JSeparator) {
      this.remove$Component(lastComponent);
    }
    return this;
  }
  /**
   * Build the debug entries for the TilePopup.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param tile The {@code Tile} to build menu items for.
   */
  addDebugItems(freeColClient: FreeColClient, tile: Tile): void {
    this.addSeparator();
    let changeOwnership = new JMenu()._JMenu$String('Change ownership');
    changeOwnership.setOpaque(false);
    let transportLists = new JMenu()._JMenu$String('Transport lists');
    transportLists.setOpaque(false);
    let changeRole = new JMenu()._JMenu$String('Change role');
    changeRole.setOpaque(false);
    for (const $it2 = tile.getUnitList().iterator(); $it2.hasNext(); ) {
      let unit = $it2.next();
      let toMenuItem = new JMenuItem()._JMenuItem$String(unit.toString());
      toMenuItem.addActionListener((ae) => {
        DebugUtils.changeOwnership$FreeColClient$Unit(freeColClient, unit);
      });
      changeOwnership.add$JMenuItem(toMenuItem);
      if (unit.isCarrier()) {
        let menuItem = new JMenuItem()._JMenuItem$String(unit.toString());
        menuItem.addActionListener((ae) => {
          DebugUtils.displayMission(freeColClient, unit);
        });
        transportLists.add$JMenuItem(menuItem);
      }
      if (unit.isPerson()) {
        let roleMenuItem = new JMenuItem()._JMenuItem$String(unit.toString());
        roleMenuItem.addActionListener((ae) => {
          DebugUtils.changeRole(freeColClient, unit);
        });
        changeRole.add$JMenuItem(roleMenuItem);
      }
    }
    if (transportLists.getItemCount() > 0) {
      this.add$JMenuItem(transportLists);
    }
    if (tile.getColony() != null) {
      if (changeOwnership.getItemCount() > 0) {
        changeOwnership.addSeparator();
      }
      let toMenuItem = new JMenuItem()._JMenuItem$String(tile.getColony().toString());
      let colony = tile.getColony();
      toMenuItem.addActionListener((ae) => {
        DebugUtils.changeOwnership$FreeColClient$Colony(freeColClient, colony);
      });
      changeOwnership.add$JMenuItem(toMenuItem);
      let displayColonyPlan = new JMenuItem()._JMenuItem$String('Display Colony Plan');
      displayColonyPlan.addActionListener((ae) => {
        DebugUtils.displayColonyPlan(freeColClient, colony);
      });
      this.add$JMenuItem(displayColonyPlan);
      let applyDisaster = new JMenuItem()._JMenuItem$String('Apply Disaster');
      applyDisaster.addActionListener((ae) => {
        DebugUtils.applyDisaster(freeColClient, colony);
      });
      this.add$JMenuItem(applyDisaster);
    }
    if (tile.getIndianSettlement() != null) {
      let displayGoods = new JMenuItem()._JMenuItem$String('Examine Settlement');
      let is$ = tile.getIndianSettlement();
      displayGoods.addActionListener((ae) => {
        DebugUtils.summarizeSettlement(freeColClient, is$);
      });
      this.add$JMenuItem(displayGoods);
    }
    if (changeOwnership.getItemCount() > 0) {
      this.add$JMenuItem(changeOwnership);
    }
    if (changeRole.getItemCount() > 0) {
      this.add$JMenuItem(changeRole);
    }
    if (tile.hasLostCityRumour()) {
      let rumourItem = new JMenuItem()._JMenuItem$String('Set Lost City Rumour type');
      rumourItem.setOpaque(false);
      rumourItem.addActionListener((ae) => {
        DebugUtils.setRumourType(freeColClient, tile);
      });
      this.add$JMenuItem(rumourItem);
    }
    let addu = new JMenuItem()._JMenuItem$String('Add unit');
    addu.setOpaque(false);
    addu.addActionListener((ae) => {
      DebugUtils.addNewUnitToTile(freeColClient, tile);
    });
    this.add$JMenuItem(addu);
    if (!tile.isEmpty()) {
      let adda = new JMenuItem()._JMenuItem$String('Reset moves');
      adda.setOpaque(false);
      let tileUnits = tile.getUnitList();
      adda.addActionListener((ae) => {
        DebugUtils.resetMoves(freeColClient, tileUnits);
      });
      this.add$JMenuItem(adda);
    }
    let activeUnit = this.gui.getActiveUnit();
    if (activeUnit != null && activeUnit.getTile$() != null) {
      let menuItem = new JMenuItem()._JMenuItem$String('Show search');
      menuItem.addActionListener((ae) => {
        if (!freeColClient.currentPlayerIsMyPlayer()) {
          return;
        }
        let currTile = activeUnit.getTile$();
        if (currTile === tile) {
          return;
        }
        let map = activeUnit.getGame().getMap();
        let lb = new LogBuilder()._LogBuilder(512);
        let path = activeUnit.findPath$Location$Location$Unit$CostDecider$LogBuilder(activeUnit.getTile$(), tile, activeUnit.getCarrier(), null, lb);
        this.gui.showInformationPanel$String(lb.toString());
        this.gui.setUnitPath(path);
        this.gui.refresh();
      });
      this.add$JMenuItem(menuItem);
    }
    let unit = CollectionUtils.find$Stream$Predicate(tile.getUnits(), (u) => u.canCarryGoods() && u.hasSpaceLeft());
    if (unit != null) {
      DebugUtils.addGoodsAdditionEntry(freeColClient, unit, this);
    }
    let dumpItem = new JMenuItem()._JMenuItem$String('Dump tile');
    dumpItem.setOpaque(false);
    dumpItem.addActionListener((ae) => {
      DebugUtils.dumpTile(freeColClient, tile);
    });
    this.add$JMenuItem(dumpItem);
  }
  /**
   * Adds a unit entry to this popup.
   *
   * @param menu a {@code Container} value
   * @param unit The unit that will be represented on the popup.
   * @param enabled The initial state for the menu item.
   * @param indent Should be {@code true} if the text should be
   *      indented on the menu.
   * @return an {@code int} value
   */
  addUnit(menu: Container, unit: Unit, enabled: boolean, indent: boolean): number {
    let occ = unit.getOccupationLabel(this.freeColClient.getMyPlayer(), true);
    let text = (indent ? '    ' : '') + unit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL) + ' (' + Messages.message$StringTemplate(occ) + String.fromCharCode(41 /* ')' */);
    let menuItem = new JMenuItem()._JMenuItem$String(text);
    menuItem.setFont(this.font$TilePopup);
    menuItem.addActionListener((ae) => {
      this.gui.changeView$Unit$boolean(unit, false);
    });
    if (indent) {
      menuItem.setFont(menuItem.getFont().deriveFont$int(Font.ITALIC));
    }
    menuItem.setEnabled(enabled);
    menu.add$Component(menuItem);
    let lineCount = (1 + (CollectionUtils.sum$Stream$ToIntFunction(unit.getUnits(), (u) => this.addUnit(menu, u, true, true)))) | 0;
    let hasGoods = false;
    for (const $it3 = unit.getGoodsList().iterator(); $it3.hasNext(); ) {
      let goods = $it3.next();
      text = (indent ? '         ' : '     ') + Messages.message$StringTemplate(goods.getLabel$boolean(true));
      menuItem = new JMenuItem()._JMenuItem$String(text);
      menuItem.setFont(menuItem.getFont().deriveFont$int(Font.ITALIC));
      menuItem.setEnabled(false);
      menu.add$Component(menuItem);
      lineCount++;
      hasGoods = true;
    }
    if (hasGoods) {
      let dumpItem = Utility.localizedMenuItem$String('dumpCargo');
      dumpItem.setAction(new UnloadAction()._UnloadAction$FreeColClient$Unit(this.freeColClient, unit));
      dumpItem.setText(Messages.message$String('dumpCargo'));
      menu.add$Component(dumpItem);
      lineCount++;
    }
    this.hasAnItem = true;
    return lineCount;
  }
  /**
   * Adds a colony entry to this popup.
   *
   * @param colony The colony that will be represented on the popup.
   */
  addColony(colony: Colony): void {
    let name = colony.getLocationLabelFor(this.freeColClient.getMyPlayer());
    let menuItem = Utility.localizedMenuItem$StringTemplate(name);
    menuItem.setFont(this.font$TilePopup);
    menuItem.addActionListener((ae) => {
      this.gui.showColonyPanel(colony, null);
    });
    this.add$JMenuItem(menuItem);
    menuItem = Utility.localizedMenuItem$String('rename');
    menuItem.addActionListener((ae) => {
      this.freeColClient.getInGameController().rename(colony);
    });
    this.add$JMenuItem(menuItem);
    this.hasAnItem = true;
  }
  /**
   * Adds an indian settlement entry to this popup.
   *
   * @param is The {@code IndianSettlement} that will be
   *     represented on the popup.
   */
  addIndianSettlement(is$: IndianSettlement): void {
    let name = is$.getLocationLabelFor(this.freeColClient.getMyPlayer());
    let menuItem = Utility.localizedMenuItem$StringTemplate(name);
    menuItem.setFont(this.font$TilePopup);
    menuItem.addActionListener((ae) => {
      this.gui.showIndianSettlementPanel(is$);
    });
    this.add$JMenuItem(menuItem);
    this.hasAnItem = true;
  }
  /**
   * Adds a tile entry to this popup.
   *
   * @param tile The tile that will be represented on the popup.
   */
  addTile(tile: Tile): void {
    let menuItem = new JMenuItem()._JMenuItem$String(Messages.message$StringTemplate(tile.getLabel()));
    if (tile.isExplored()) {
      menuItem.addActionListener((ae) => {
        this.gui.showTilePanel(tile);
      });
    }
    this.add$JMenuItem(menuItem);
  }
  /**
   * Returns true if this popup has at least one menuitem so that we
   * know that we can show it to the user. Returns false if there
   * are no menuitems.
   *
   * @return True if this popup has at least one menuitem, false otherwise.
   */
  hasItem(): boolean {
    return this.getComponentCount() > 0;
  }
  static $clinit() {
    TilePopup.logger = Logger.getLogger($J.cls(TilePopup).getName());
  }
}

$J.define(TilePopup, 'net.sf.freecol.client.gui.TilePopup', { kind: 'class', sup: 'javax.swing.JPopupMenu', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Tile': '_TilePopup' }, returns: { 'hasItem': 'boolean' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  JMenu = $J.load('javax.swing.JMenu');
  JMenuItem = $J.load('javax.swing.JMenuItem');
  JSeparator = $J.load('javax.swing.JSeparator');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  UnloadAction = $J.load('net.sf.freecol.client.gui.action.UnloadAction');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  DebugUtils = $J.load('net.sf.freecol.common.debug.DebugUtils');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
});
