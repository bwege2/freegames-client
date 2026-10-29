// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/InPortPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { UnitPanel } from './UnitPanel.ts';

let UnitLabel;

/**
 * This class displays the carriers present in a port.
 *
 * @see PortPanel
 */
export class InPortPanel extends UnitPanel {
  /**
   * Create an InPortPanel.
   *
   * @param layout The {@code LayoutManager} to use.
   * @param portPanel The {@code PortPanel} to enclose.
   * @param name An optional name for the panel.
   * @param editable Is this panel editable?
   */
  _InPortPanel(layout: LayoutManager, portPanel: PortPanel, name: string, editable: boolean): this {
    this._UnitPanel('InPortPanelUI', layout, portPanel, name, editable);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  selectLabel(): void {
    let portPanel = this.getPortPanel();
    if (portPanel == null) {
      return;
    }
    let selectedUnit = portPanel.getSelectedUnit();
    let lastCarrier = null;
    for (let component of this.getComponents()) {
      if (component instanceof UnitLabel) {
        let label = component;
        let unit = label.getUnit();
        if (unit === selectedUnit) {
          portPanel.setSelectedUnitLabel(label);
          return;
        }
        if (unit.isCarrier() && unit.getTradeRoute() == null) {
          lastCarrier = label;
        }
      }
    }
    if (lastCarrier != null) {
      portPanel.setSelectedUnitLabel(lastCarrier);
    }
  }
}

$J.define(InPortPanel, 'net.sf.freecol.client.gui.panel.InPortPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.UnitPanel', ctors: { 'java.awt.LayoutManager,net.sf.freecol.client.gui.panel.PortPanel,java.lang.String,boolean': '_InPortPanel' } });
$J.module(() => {
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
});
