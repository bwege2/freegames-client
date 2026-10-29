// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/CargoPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let Color, SwingConstants, MigLayout, CargoLabel, GoodsLabel, UnitLabel, DefaultTransferHandler, DragListener, Utility, StringTemplate, Unit, Unit$UnitLabelType;

/**
 * A panel that holds units and goods that represent Units and cargo
 * that are on board the currently selected ship.
 */
export class CargoPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The carrier that contains cargo.
   */
  carrier: Unit = null;
  defaultTransferHandler: DefaultTransferHandler = null;
  withStyling: boolean = false;
  /**
   * Creates this CargoPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param withTitle     Should the panel have a title?
   */
  _CargoPanel(freeColClient: FreeColClient, withTitle: boolean, withStyling: boolean): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, 'CargoPanelUI', new MigLayout()._MigLayout$String$String$String('wrap 6, gap 0 0, insets 0', '[79!, center][79!, center][79!, center][79!, center][79!, center][79!, center]', '[100!]'));
    this.defaultTransferHandler = null;
    this.carrier = null;
    this.defaultTransferHandler = new DefaultTransferHandler()._DefaultTransferHandler(this.getFreeColClient(), this);
    this.withStyling = withStyling;
    if (withTitle) {
      this.setBorder(Utility.localizedBorder$String('cargoOnCarrier'));
    } else {
      this.setBorder(null);
    }
    return this;
  }
  /**
   * Initialize this CargoPanel.
   */
  initialize(): void {
    this.addPropertyChangeListeners();
    this.update$();
  }
  /**
   * Clean up this CargoPanel.
   */
  cleanup(): void {
    this.removePropertyChangeListeners();
  }
  addPropertyChangeListeners(): void {
    if (this.carrier != null) {
      this.carrier.addPropertyChangeListener$String$PropertyChangeListener(Unit.CARGO_CHANGE, $J.fn(this, 'propertyChange'));
      this.carrier.getGoodsContainer().addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  removePropertyChangeListeners(): void {
    if (this.carrier != null) {
      this.carrier.removePropertyChangeListener$String$PropertyChangeListener(Unit.CARGO_CHANGE, $J.fn(this, 'propertyChange'));
      this.carrier.getGoodsContainer().removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
    }
  }
  /**
   * Update this CargoPanel.
   */
  update$(): void {
    this.removeAll();
    if (this.carrier != null) {
      let fcc = this.getFreeColClient();
      let dl = new DragListener()._DragListener(fcc, this);
      for (const $it0 = this.carrier.getUnitList().iterator(); $it0.hasNext(); ) {
        let unit = $it0.next();
        let label = new UnitLabel()._UnitLabel$FreeColClient$Unit(fcc, unit);
        if (this.isEditable()) {
          label.setTransferHandler(this.defaultTransferHandler);
          label.addMouseListener(dl);
        }
        this.add$Component(label);
      }
      for (const $it1 = this.carrier.getGoodsList().iterator(); $it1.hasNext(); ) {
        let g = $it1.next();
        let label = new GoodsLabel()._GoodsLabel$FreeColClient$Goods(fcc, g);
        if (this.withStyling) {
          label.setHorizontalTextPosition(SwingConstants.CENTER);
          label.setVerticalTextPosition(SwingConstants.BOTTOM);
          label.setForeground(Color.WHITE);
        }
        if (this.isEditable()) {
          label.setTransferHandler(this.defaultTransferHandler);
          label.addMouseListener(dl);
        }
        this.add$Component(label);
      }
    }
    this.updateTitle();
    this.revalidate();
    this.repaint$();
  }
  /**
   * Whether this panel is active.
   *
   * @return boolean <b>true</b> == active
   */
  isActive(): boolean {
    return this.carrier != null;
  }
  /**
   * Get the carrier unit.
   *
   * @return The carrier {@code Unit}.
   */
  getCarrier(): Unit {
    return this.carrier;
  }
  /**
   * Set the carrier unit.
   *
   * @param newCarrier The new carrier {@code Unit}.
   */
  setCarrier(newCarrier: Unit): void {
    if (newCarrier !== this.carrier) {
      this.cleanup();
      this.carrier = newCarrier;
      this.initialize();
    }
  }
  /**
   * Update the title of this CargoPanel.
   */
  updateTitle(): void {
    if (this.getBorder() == null) {
      return;
    }
    Utility.localizeBorder(this, (this.carrier == null) ? StringTemplate.key$String('cargoOnCarrier') : StringTemplate.template$String('cargoPanel.cargoAndSpace').addStringTemplate$String$StringTemplate('%name%', this.carrier.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addAmount('%space%', this.carrier.getSpaceLeft()));
  }
  /**
   * {@inheritDoc}
   */
  accepts$Goods(goods: Goods): boolean {
    return this.carrier != null && this.carrier.canAdd(goods);
  }
  /**
   * {@inheritDoc}
   */
  accepts$Unit(unit: Unit): boolean {
    return this.carrier != null && this.carrier.canAdd(unit);
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (this.carrier != null && $J.isa(comp, CargoLabel) && editState && (comp).addCargo(comp, this.carrier, this)) {
      return comp;
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  suggested(type$: GoodsType): number {
    return this.carrier.getLoadableAmount(type$);
  }
  propertyChange(event: PropertyChangeEvent): void {
    CargoPanel.logger.finest('CargoPanel change ' + event.getPropertyName() + ': ' + $J.str(event.getOldValue()) + ' -> ' + $J.str(event.getNewValue()));
    this.update$();
  }
  /**
   * {@inheritDoc}
   */
  remove$Component(comp: Component): void {
    if ($J.isa(comp, CargoLabel)) {
      (comp).removeCargo(comp, this);
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.removePropertyChangeListeners();
    this.defaultTransferHandler = null;
  }
  paintComponent(g: Graphics): void {
    super.paintComponent(g);
    if (!this.withStyling) {
      return;
    }
    let size = this.getSize$();
    let cargoHoldsPerRow = 6;
    let available = this.getImageLibrary().getScaledCargoHold(true);
    let unavailable = this.getImageLibrary().getScaledCargoHold(false);
    let totalAvailableHolds = (this.carrier != null) ? this.carrier.getCargoCapacity() : 0;
    let rows = ($J.idiv(totalAvailableHolds, cargoHoldsPerRow) + ((totalAvailableHolds % cargoHoldsPerRow > 0) ? 1 : 0)) | 0;
    if (rows === 0) {
      let x = 0;
      while (x < size.width_) {
        g.drawImage$Image$int$int$ImageObserver(unavailable, x, 0, null);
        x = (x + unavailable.getWidth()) | 0;
      }
      g.drawImage$Image$int$int$ImageObserver(unavailable, x, 0, null);
      return;
    }
    let y = 0;
    for (let row = 0; row < rows; row++) {
      let availableHolds = (row < ((rows - 1) | 0)) ? cargoHoldsPerRow : (totalAvailableHolds - Math.imul(cargoHoldsPerRow, row)) | 0;
      let x = 0;
      for (let i = 0; i < availableHolds; i++) {
        g.drawImage$Image$int$int$ImageObserver(available, x, y, null);
        x = (x + available.getWidth()) | 0;
      }
      while (x < size.width_) {
        g.drawImage$Image$int$int$ImageObserver(unavailable, x, y, null);
        x = (x + unavailable.getWidth()) | 0;
      }
      g.drawImage$Image$int$int$ImageObserver(unavailable, x, y, null);
      y = (y + available.getHeight()) | 0;
    }
  }
  static $clinit() {
    CargoPanel.logger = Logger.getLogger($J.cls(CargoPanel).getName());
  }
}

$J.define(CargoPanel, 'net.sf.freecol.client.gui.panel.CargoPanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.DropTarget', 'java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,boolean,boolean': '_CargoPanel' }, returns: { 'getCarrier': 'net.sf.freecol.common.model.Unit', 'isActive': 'boolean' }, meths: { 'remove(java.awt.Component)': 'remove$Component', 'add(java.awt.Component,boolean)': 'add$Component$boolean', 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'accepts(net.sf.freecol.common.model.Goods)': 'accepts$Goods', 'update()': 'update$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  CargoLabel = $J.load('net.sf.freecol.client.gui.label.CargoLabel');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  DefaultTransferHandler = $J.load('net.sf.freecol.client.gui.panel.DefaultTransferHandler');
  DragListener = $J.load('net.sf.freecol.client.gui.panel.DragListener');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
});
