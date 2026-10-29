// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/PortPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let UnitLabel;

/**
 * This class provides common functionality for panels that display
 * ports, such as the ColonyPanel and the EuropePanel.  This includes
 * an InPortPanel for displaying the carriers in port, and a
 * CargoPanel for displaying the cargo aboard that carrier.
 */
export class PortPanel extends FreeColPanel {
  cargoPanel: CargoPanel = null;
  inPortPanel: InPortPanel = null;
  selectedUnitLabel: UnitLabel = null;
  defaultTransferHandler: DefaultTransferHandler = null;
  pressListener: MouseListener = null;
  /**
   * Create a new port panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param layout The {@code LayoutManager} to be used.
   */
  _PortPanel(freeColClient: FreeColClient, layout: LayoutManager): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, layout);
    this.selectedUnitLabel = null;
    return this;
  }
  /**
   * Get the cargo panel.
   *
   * @return The cargo panel.
   */
  getCargoPanel(): CargoPanel {
    return this.cargoPanel;
  }
  /**
   * Get the currently select unit.
   *
   * @return The currently select unit.
   */
  getSelectedUnit(): Unit {
    return (this.selectedUnitLabel == null) ? null : this.selectedUnitLabel.getUnit();
  }
  /**
   * Select a given unit.
   *
   * @param unit The {@code Unit} to select.
   * @return True if the selection succeeds.
   */
  setSelectedUnit(unit: Unit): boolean {
    for (let component of this.getComponents()) {
      if (component instanceof UnitLabel) {
        let label = component;
        if (label.getUnit() === unit) {
          this.setSelectedUnitLabel(label);
          return true;
        }
      }
    }
    return false;
  }
  /**
   * Get the currently select unit label.
   *
   * @return The currently select unit label.
   */
  getSelectedUnitLabel(): UnitLabel {
    return this.selectedUnitLabel;
  }
  /**
   * Set the selected unit label.
   *
   * @param label The unit label to select.
   */
  setSelectedUnitLabel(label: UnitLabel): void {
    this.selectedUnitLabel = label;
  }
  /**
   * Get the press listener.  Associated UnitPanels often add this
   * mouse listener to their contained UnitLabels.
   *
   * @return The press listener.
   */
  getPressListener(): MouseListener {
    return this.pressListener;
  }
  /**
   * {@inheritDoc}
   */
  getTransferHandler(): TransferHandler {
    return this.defaultTransferHandler;
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.cargoPanel = null;
    this.inPortPanel = null;
    this.defaultTransferHandler = null;
    this.pressListener = null;
    this.selectedUnitLabel = null;
  }
}

$J.define(PortPanel, 'net.sf.freecol.client.gui.panel.PortPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.LayoutManager': '_PortPanel' }, returns: { 'getTransferHandler': 'javax.swing.TransferHandler', 'getUnitList': 'java.util.List', 'getPressListener': 'java.awt.event.MouseListener', 'getSelectedUnitLabel': 'net.sf.freecol.client.gui.label.UnitLabel', 'getSelectedUnit': 'net.sf.freecol.common.model.Unit', 'getCargoPanel': 'net.sf.freecol.client.gui.panel.CargoPanel' } });
$J.module(() => {
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
});
