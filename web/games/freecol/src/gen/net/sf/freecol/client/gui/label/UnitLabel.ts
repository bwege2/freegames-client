// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/UnitLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColLabel } from './FreeColLabel.ts';

let Color, Dimension, ImageIcon, SwingConstants, ImageLibrary, ProductionLabel, ColonyPanel$OutsideColonyPanel, EuropePanel$EuropeanDocksPanel, InPortPanel, Utility, ReportPanel, Messages, AbstractGoods, Building, ColonyTile, Unit, Unit$UnitLabelType, Unit$UnitState, StringUtils;

/**
 * This label holds Unit data in addition to the JLabel data, which makes it
 * ideal to use for drag and drop purposes.
 */
export class UnitLabel extends FreeColLabel {
  static logger: Logger = null;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The unit this is a label for.
   */
  unit: Unit = null;
  /**
   * Is this a currently selected unit?
   */
  selected: boolean = false;
  /**
   * Is this a small label?
   */
  isSmall: boolean = false;
  /**
   * Should the location information be ignored for this label
   * description?
   */
  ignoreLocation: boolean = false;
  /**
   * Font for labels.
   */
  tinyFont: Font = null;
  /**
   * Creates a JLabel to display a unit.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to display.
   */
  _UnitLabel$FreeColClient$Unit(freeColClient: FreeColClient, unit: Unit): this {
    this._UnitLabel$FreeColClient$Unit$boolean(freeColClient, unit, false);
    return this;
  }
  /**
   * Creates a JLabel to display a unit.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to display.
   * @param isSmall The image will be smaller if set to {@code true}.
   */
  _UnitLabel$FreeColClient$Unit$boolean(freeColClient: FreeColClient, unit: Unit, isSmall: boolean): this {
    this._UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient, unit, isSmall, false);
    return this;
  }
  /**
   * Creates a JLabel to display a unit.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The {@code Unit} to display.
   * @param isSmall The image will be smaller if set to {@code true}.
   * @param ignoreLocation The image will not include production or state
   *            information if set to {@code true}.
   */
  _UnitLabel$FreeColClient$Unit$boolean$boolean(freeColClient: FreeColClient, unit: Unit, isSmall: boolean, ignoreLocation: boolean): this {
    this._FreeColLabel$();
    this.freeColClient = freeColClient;
    this.unit = unit;
    this.selected = false;
    this.isSmall = isSmall;
    this.ignoreLocation = ignoreLocation;
    this.tinyFont = freeColClient.getGUI().getFixedImageLibrary().getScaledFont('normal-plain-tiny', null);
    this.setHorizontalAlignment(SwingConstants.CENTER);
    this.updateIcon();
    return this;
  }
  /**
   * Internal GUI accessor.
   *
   * @return The current {@code GUI}.
   */
  getGUI(): GUI {
    return this.freeColClient.getGUI();
  }
  /**
   * Get the correct image library for this unit label.
   *
   * @return The {@code ImageLibrary} to use.
   */
  getImageLibrary(): ImageLibrary {
    return this.getGUI().getFixedImageLibrary();
  }
  /**
   * Get the associated unit.
   *
   * @return The {@code Unit} this is the label for.
   */
  getUnit(): Unit {
    return this.unit;
  }
  /**
   * Sets whether or not this unit should be selected.
   *
   * @param b Whether or not this unit should be selected.
   */
  setSelected(b: boolean): void {
    this.selected = b;
  }
  /**
   * Makes a smaller version.
   *
   * @param isSmall The image will be smaller if set to {@code true}.
   */
  setSmall(isSmall: boolean): void {
    let lib = this.getImageLibrary();
    if (isSmall) {
      this.setPreferredSize(null);
      this.setIcon(new ImageIcon()._ImageIcon$Image(lib.getSmallUnitImage$Unit(this.unit)));
      this.setBorder(Utility.blankBorder(0, 2, 0, 0));
    } else {
      let imageIcon = new ImageIcon()._ImageIcon$Image(lib.getScaledUnitImage$Unit(this.unit));
      if (this.unit.getLocation() instanceof ColonyTile) {
        this.setPreferredSize(new Dimension()._Dimension$int$int(lib.scale$Dimension(ImageLibrary.TILE_SIZE).width_, imageIcon.getIconHeight()));
      } else {
        this.setPreferredSize(null);
      }
      this.setIcon(imageIcon);
      this.setBorder((this.unit.getLocation() instanceof ColonyTile) ? Utility.blankBorder(0, 15, 0, 15) : Utility.blankBorder(0, 5, 0, 5));
    }
    this.isSmall = isSmall;
  }
  /**
   * Sets the description label.
   *
   * The description label is a tooltip with the unit name and description of
   * the terrain its on if applicable
   *
   * @param label The string to set the label to.
   */
  setDescriptionLabel(label: string): void {
    this.setToolTipText(label);
  }
  /**
   * Update the icon for this unit label.
   */
  updateIcon(): void {
    this.setDescriptionLabel(this.getUnit().getDescription$UnitLabelType(Unit$UnitLabelType.FULL));
    this.setSmall(this.isSmall);
  }
  /**
   * {@inheritDoc}
   */
  addCargo(comp: Component, carrier: Unit, cargoPanel: CargoPanel): boolean {
    let u = (comp).getUnit();
    if (carrier.canAdd(u)) {
      let oldParent = comp.getParent();
      if (cargoPanel.igc().boardShip(u, carrier)) {
        (comp).setSmall(false);
        if (oldParent != null) {
          oldParent.remove$Component(comp);
        }
        cargoPanel.update$();
        return true;
      }
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  removeCargo(comp: Component, cargoPanel: CargoPanel): void {
    let u = (comp).getUnit();
    cargoPanel.igc().leaveShip(u);
    cargoPanel.update$();
  }
  /**
   * {@inheritDoc}
   */
  isOnCarrier(): boolean {
    return this.unit != null && this.unit.isOnCarrier();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let game = this.freeColClient.getGame();
    let spec = game.getSpecification();
    let igc = this.freeColClient.getInGameController();
    let args = JString.split(ae.getActionCommand(), '/');
    let gt: GoodsType;
    {
      let colonyTile: ColonyTile, building: Building;
      switch ($J.enumValueOf($J.cls(UnitLabel$UnitAction), StringUtils.upCase$String(args[0]))) {
        case UnitLabel$UnitAction.ASSIGN:
          igc.assignTeacher(this.unit, game.getFreeColGameObject$String$Class(args[1], $J.cls(Unit)));
          break;
        case UnitLabel$UnitAction.WORK_COLONYTILE:
          if (args.length < 3) {
            break;
          }
          colonyTile = game.getFreeColGameObject$String$Class(args[1], $J.cls(ColonyTile));
          if (args.length >= 4 && $J.equals('!', args[3])) {
            if (!igc.claimTile(colonyTile.getWorkTile(), this.unit.getColony())) {
              break;
            }
          }
          if (colonyTile !== this.unit.getLocation()) {
            igc.work(this.unit, colonyTile);
          }
          if ((gt = spec.getGoodsType(args[2])) != null && this.unit.getWorkType() !== gt) {
            igc.changeWorkType(this.unit, gt);
          }
          break;
        case UnitLabel$UnitAction.WORK_BUILDING:
          if (args.length < 3) {
            break;
          }
          building = game.getFreeColGameObject$String$Class(args[1], $J.cls(Building));
          if (building !== this.unit.getLocation()) {
            igc.work(this.unit, building);
          }
          if ((gt = spec.getGoodsType(args[2])) != null && this.unit.getWorkType() !== gt) {
            igc.changeWorkType(this.unit, gt);
          }
          break;
        case UnitLabel$UnitAction.ACTIVATE_UNIT:
          igc.changeState(this.unit, Unit$UnitState.ACTIVE);
          this.getGUI().changeView$Unit$boolean(this.unit, false);
          break;
        case UnitLabel$UnitAction.FORTIFY:
          igc.changeState(this.unit, Unit$UnitState.FORTIFYING);
          break;
        case UnitLabel$UnitAction.SENTRY:
          igc.changeState(this.unit, Unit$UnitState.SENTRY);
          break;
        case UnitLabel$UnitAction.COLOPEDIA:
          this.getGUI().showColopediaPanel(this.unit.getType().getId());
          break;
        case UnitLabel$UnitAction.LEAVE_TOWN:
          igc.putOutsideColony(this.unit);
          break;
        case UnitLabel$UnitAction.CLEAR_SPECIALITY:
          igc.clearSpeciality(this.unit);
          break;
        case UnitLabel$UnitAction.CLEAR_ORDERS:
          igc.clearOrders(this.unit);
          break;
        case UnitLabel$UnitAction.ASSIGN_TRADE_ROUTE:
          this.getGUI().showTradeRoutePanel(this.unit);
          break;
        case UnitLabel$UnitAction.LEAVE_SHIP:
          igc.leaveShip(this.unit);
          break;
        case UnitLabel$UnitAction.UNLOAD:
          igc.unload(this.unit);
          break;
      }
    }
    this.updateIcon();
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    let player = this.freeColClient.getMyPlayer();
    let lib = this.getImageLibrary();
    super.paintComponent(g);
    if (this.ignoreLocation) {
      return;
    }
    if (this.unit.getLocation() instanceof ColonyTile) {
      let workType = this.unit.getWorkType();
      if (workType != null) {
        let production = (this.unit.getLocation()).getTotalProductionOf(workType);
        if (production > 0) {
          let pl = new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods(this.freeColClient, new AbstractGoods()._AbstractGoods$GoodsType$int(workType, production));
          let visualOffsetY = -lib.scaleInt(5);
          let size = this.getSize$();
          let plSize = pl.getPreferredSize$();
          let x = $J.idiv(((size.width_ - plSize.width_) | 0), 2);
          let y = ($J.idiv(((size.height_ - plSize.height_) | 0), 2) + visualOffsetY) | 0;
          g.translate$int$int(x, y);
          pl.paintComponent(g);
          g.translate$int$int(-x, -y);
        }
      }
    } else if (this.getParent() instanceof ColonyPanel$OutsideColonyPanel || this.getParent() instanceof InPortPanel || this.getParent() instanceof EuropePanel$EuropeanDocksPanel || this.getParent().getParent() instanceof ReportPanel) {
      let text = Messages.message$StringTemplate(this.unit.getOccupationLabel(player, false));
      g.drawImage$Image$int$int$ImageObserver(lib.getOccupationIndicatorChip(g, this.unit, text), 0, 0, null);
      if (this.unit.isDamaged()) {
        let underRepair = Messages.message$StringTemplate(this.unit.getRepairLabel());
        let idx = underRepair.indexOf(String.fromCharCode(40 /* '(' */));
        let underRepair1 = JString.trim(underRepair.substring(0, idx));
        let underRepair2 = JString.trim(underRepair.substring(idx));
        let repairImage1 = lib.getStringImage(g, underRepair1, Color.RED, this.tinyFont);
        let repairImage2 = lib.getStringImage(g, underRepair2, Color.RED, this.tinyFont);
        let textHeight = (repairImage1.getHeight$ImageObserver(null) + repairImage2.getHeight$ImageObserver(null)) | 0;
        let leftIndent = Math.min(5, Math.min((this.getWidth() - repairImage1.getWidth$ImageObserver(null)) | 0, (this.getWidth() - repairImage2.getWidth$ImageObserver(null)) | 0));
        g.drawImage$Image$int$int$ImageObserver(repairImage1, leftIndent, ($J.idiv(((this.getHeight() - textHeight) | 0), 2)), null);
        g.drawImage$Image$int$int$ImageObserver(repairImage2, leftIndent, (($J.idiv(((this.getHeight() - textHeight) | 0), 2)) + repairImage1.getHeight$ImageObserver(null)) | 0, null);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  setEnabled(b: boolean): void {
    if (!b) {
      let lib = this.getImageLibrary();
      let disabledImageIcon = (this.isSmall) ? new ImageIcon()._ImageIcon$Image(lib.getSmallUnitImage$Unit$boolean(this.unit, true)) : new ImageIcon()._ImageIcon$Image(lib.getScaledUnitImage$Unit$boolean(this.unit, true));
      this.setDisabledIcon(disabledImageIcon);
    }
    super.setEnabled(b);
  }
  static $clinit() {
    UnitLabel.logger = Logger.getLogger($J.cls(UnitLabel).getName());
  }
}

/**
 * The different actions a {@code Unit} is allowed to take.
 */
export class UnitLabel$UnitAction extends JEnum {
  static ASSIGN: UnitLabel$UnitAction = null;
  static CLEAR_SPECIALITY: UnitLabel$UnitAction = null;
  static ACTIVATE_UNIT: UnitLabel$UnitAction = null;
  static FORTIFY: UnitLabel$UnitAction = null;
  static SENTRY: UnitLabel$UnitAction = null;
  static COLOPEDIA: UnitLabel$UnitAction = null;
  static LEAVE_TOWN: UnitLabel$UnitAction = null;
  static WORK_COLONYTILE: UnitLabel$UnitAction = null;
  static WORK_BUILDING: UnitLabel$UnitAction = null;
  static CLEAR_ORDERS: UnitLabel$UnitAction = null;
  static ASSIGN_TRADE_ROUTE: UnitLabel$UnitAction = null;
  static LEAVE_SHIP: UnitLabel$UnitAction = null;
  static UNLOAD: UnitLabel$UnitAction = null;
  static $VALUES: UnitLabel$UnitAction[] = null;
  _UnitLabel$UnitAction($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): UnitLabel$UnitAction[] { return UnitLabel$UnitAction.$VALUES.slice(); }
  static valueOf(name: string): UnitLabel$UnitAction { return $J.enumValueOf(UnitLabel$UnitAction, name); }
  static $clinit() {
    UnitLabel$UnitAction.ASSIGN = new UnitLabel$UnitAction()._UnitLabel$UnitAction('ASSIGN', 0);
    UnitLabel$UnitAction.CLEAR_SPECIALITY = new UnitLabel$UnitAction()._UnitLabel$UnitAction('CLEAR_SPECIALITY', 1);
    UnitLabel$UnitAction.ACTIVATE_UNIT = new UnitLabel$UnitAction()._UnitLabel$UnitAction('ACTIVATE_UNIT', 2);
    UnitLabel$UnitAction.FORTIFY = new UnitLabel$UnitAction()._UnitLabel$UnitAction('FORTIFY', 3);
    UnitLabel$UnitAction.SENTRY = new UnitLabel$UnitAction()._UnitLabel$UnitAction('SENTRY', 4);
    UnitLabel$UnitAction.COLOPEDIA = new UnitLabel$UnitAction()._UnitLabel$UnitAction('COLOPEDIA', 5);
    UnitLabel$UnitAction.LEAVE_TOWN = new UnitLabel$UnitAction()._UnitLabel$UnitAction('LEAVE_TOWN', 6);
    UnitLabel$UnitAction.WORK_COLONYTILE = new UnitLabel$UnitAction()._UnitLabel$UnitAction('WORK_COLONYTILE', 7);
    UnitLabel$UnitAction.WORK_BUILDING = new UnitLabel$UnitAction()._UnitLabel$UnitAction('WORK_BUILDING', 8);
    UnitLabel$UnitAction.CLEAR_ORDERS = new UnitLabel$UnitAction()._UnitLabel$UnitAction('CLEAR_ORDERS', 9);
    UnitLabel$UnitAction.ASSIGN_TRADE_ROUTE = new UnitLabel$UnitAction()._UnitLabel$UnitAction('ASSIGN_TRADE_ROUTE', 10);
    UnitLabel$UnitAction.LEAVE_SHIP = new UnitLabel$UnitAction()._UnitLabel$UnitAction('LEAVE_SHIP', 11);
    UnitLabel$UnitAction.UNLOAD = new UnitLabel$UnitAction()._UnitLabel$UnitAction('UNLOAD', 12);
    UnitLabel$UnitAction.$VALUES = [UnitLabel$UnitAction.ASSIGN, UnitLabel$UnitAction.CLEAR_SPECIALITY, UnitLabel$UnitAction.ACTIVATE_UNIT, UnitLabel$UnitAction.FORTIFY, UnitLabel$UnitAction.SENTRY, UnitLabel$UnitAction.COLOPEDIA, UnitLabel$UnitAction.LEAVE_TOWN, UnitLabel$UnitAction.WORK_COLONYTILE, UnitLabel$UnitAction.WORK_BUILDING, UnitLabel$UnitAction.CLEAR_ORDERS, UnitLabel$UnitAction.ASSIGN_TRADE_ROUTE, UnitLabel$UnitAction.LEAVE_SHIP, UnitLabel$UnitAction.UNLOAD];
  }
}

$J.define(UnitLabel, 'net.sf.freecol.client.gui.label.UnitLabel', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'net.sf.freecol.client.gui.label.CargoLabel', 'net.sf.freecol.client.gui.label.Draggable'], sup: 'net.sf.freecol.client.gui.label.FreeColLabel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit,boolean,boolean': '_UnitLabel$FreeColClient$Unit$boolean$boolean', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit,boolean': '_UnitLabel$FreeColClient$Unit$boolean', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit': '_UnitLabel$FreeColClient$Unit' }, returns: { 'isOnCarrier': 'boolean', 'getUnit': 'net.sf.freecol.common.model.Unit', 'getImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary', 'getGUI': 'net.sf.freecol.client.gui.GUI' }, clinit: true, lazy: ['logger'] });
$J.define(UnitLabel$UnitAction, 'net.sf.freecol.client.gui.label.UnitLabel$UnitAction', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_UnitLabel$UnitAction' }, clinit: true, lazy: ['$VALUES', 'ASSIGN', 'CLEAR_SPECIALITY', 'ACTIVATE_UNIT', 'FORTIFY', 'SENTRY', 'COLOPEDIA', 'LEAVE_TOWN', 'WORK_COLONYTILE', 'WORK_BUILDING', 'CLEAR_ORDERS', 'ASSIGN_TRADE_ROUTE', 'LEAVE_SHIP', 'UNLOAD'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ProductionLabel = $J.load('net.sf.freecol.client.gui.label.ProductionLabel');
  ColonyPanel$OutsideColonyPanel = $J.load('net.sf.freecol.client.gui.panel.ColonyPanel$OutsideColonyPanel');
  EuropePanel$EuropeanDocksPanel = $J.load('net.sf.freecol.client.gui.panel.EuropePanel$EuropeanDocksPanel');
  InPortPanel = $J.load('net.sf.freecol.client.gui.panel.InPortPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ReportPanel = $J.load('net.sf.freecol.client.gui.panel.report.ReportPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Building = $J.load('net.sf.freecol.common.model.Building');
  ColonyTile = $J.load('net.sf.freecol.common.model.ColonyTile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
