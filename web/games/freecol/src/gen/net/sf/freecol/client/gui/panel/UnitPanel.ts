// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/UnitPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, RuntimeException } from '../../../../../../../jre/index.ts';
import { MigPanel } from './MigPanel.ts';

let UnitLabel, FreeColDebugger, FreeColDebugger$DebugMode, Unit$UnitLabelType, CollectionUtils, StringUtils;

/**
 * This class provides common functionality for sub-panels of a
 * PortPanel that display UnitLabels.
 */
export class UnitPanel extends MigPanel {
  static logger: Logger = null;
  /**
   * The panel containing the units to display.
   */
  portPanel: PortPanel = null;
  /**
   * Whether this panel is editable.
   */
  editable: boolean = false;
  /**
   * Create a unit panel.
   *
   * @param uiClassId An optional L+F class to render this component.
   * @param layout The {@code LayoutManager} to use.
   * @param portPanel A {@code PortPanel} to supply units.
   * @param name An optional name for the panel.
   * @param editable True if the panel can be edited.
   */
  _UnitPanel(uiClassId: string, layout: LayoutManager, portPanel: PortPanel, name: string, editable: boolean): this {
    this._MigPanel$String$LayoutManager(uiClassId, layout);
    if (portPanel == null) {
      throw new RuntimeException('Null port panel for: ' + $J.str(this));
    }
    this.portPanel = portPanel;
    this.editable = editable;
    this.setName(name);
    return this;
  }
  /**
   * Initialize this unit panel.
   */
  initialize(): void {
    this.cleanup();
    this.addPropertyChangeListeners();
    this.update$();
    let active = this.portPanel.getGUI().getActiveUnit();
    if (active != null && active.isCarrier()) {
      this.setSelectedUnit(active);
    }
  }
  /**
   * Clean up this unit panel.
   */
  cleanup(): void {
    this.removePropertyChangeListeners();
  }
  /**
   * Add any property change listeners.
   */
  addPropertyChangeListeners(): void {
  }
  /**
   * Remove any property change listeners.
   */
  removePropertyChangeListeners(): void {
  }
  /**
   * Update this unit panel.
   */
  update$(): void {
    this.removeAll();
    if (this.portPanel != null) {
      for (const $it0 = (CollectionUtils.transform$Collection$Predicate(this.portPanel.getUnitList(), (u) => this.accepts$Unit(u))).iterator(); $it0.hasNext(); ) {
        let unit = $it0.next();
        let unitLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit(this.portPanel.getFreeColClient(), unit);
        let tradeRoute = unit.getTradeRoute();
        if (tradeRoute != null) {
          unitLabel.setDescriptionLabel(unit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL) + ' (' + tradeRoute.getName() + ')');
        }
        if (this.editable) {
          unitLabel.setTransferHandler(this.portPanel.getTransferHandler());
          unitLabel.addMouseListener(this.portPanel.getPressListener());
        }
        if (FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS) && FreeColDebugger.debugShowMission() && unit.getOwner().isAI() && this.portPanel.getFreeColClient().getFreeColServer() != null && this.portPanel.getFreeColClient().getFreeColServer().getAIMain() != null) {
          let au = this.portPanel.getFreeColClient().getFreeColServer().getAIMain().getAIUnit(unit);
          if (au != null) {
            unitLabel.setToolTipText((!au.hasMission$()) ? 'No mission' : StringUtils.lastPart(au.getMission$().getClass().toString(), '.'));
          }
        }
        this.add$Component(unitLabel);
      }
    }
    this.selectLabel();
    this.revalidate();
    this.repaint$();
  }
  /**
   * Get the port panel that supplies units to this panel.
   *
   * @return The {@code PortPanel}.
   */
  getPortPanel(): PortPanel {
    return this.portPanel;
  }
  /**
   * Is this panel editable?
   *
   * @return True if the panel is editable.
   */
  isEditable(): boolean {
    return this.editable;
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
          this.getPortPanel().setSelectedUnitLabel(label);
          return true;
        }
      }
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  propertyChange(event: PropertyChangeEvent): void {
    UnitPanel.logger.finest(this.getName$() + ' change ' + event.getPropertyName() + ': ' + $J.str(event.getOldValue()) + ' -> ' + $J.str(event.getNewValue()));
    this.update$();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removePropertyChangeListeners();
    this.portPanel = null;
  }
  static $clinit() {
    UnitPanel.logger = Logger.getLogger($J.cls(UnitPanel).getName());
  }
}

$J.define(UnitPanel, 'net.sf.freecol.client.gui.panel.UnitPanel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'java.lang.String,java.awt.LayoutManager,net.sf.freecol.client.gui.panel.PortPanel,java.lang.String,boolean': '_UnitPanel' }, returns: { 'isEditable': 'boolean', 'getPortPanel': 'net.sf.freecol.client.gui.panel.PortPanel' }, meths: { 'accepts(net.sf.freecol.common.model.Unit)': 'accepts$Unit', 'update()': 'update$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
