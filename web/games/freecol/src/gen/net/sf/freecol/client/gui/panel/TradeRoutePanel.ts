// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/TradeRoutePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Comparator, HashMap, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, DefaultListCellRenderer, DefaultListModel, ImageIcon, JLabel, JList, JScrollPane, MigLayout, Utility, Messages, Unit$UnitLabelType;

/**
 * Allows the user to edit trade routes.
 */
export class TradeRoutePanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * Compare trade routes by name.
   */
  static tradeRouteComparator: Comparator<TradeRoute> = null;
  /**
   * The unit to assign/deassign trade routes for.
   */
  unit: Unit = null;
  /**
   * The list model describing the players trade routes.
   */
  listModel: DefaultListModel<TradeRoute> = null;
  /**
   * The list of trade routes to display.
   */
  tradeRoutes: JList<TradeRoute> = null;
  /**
   * A map of trade route to the number of units using it.
   */
  counts: JMap<TradeRoute, number> = null;
  /**
   * The button to create a new trade route.
   */
  newRouteButton: JButton = null;
  /**
   * The button to edit an existing trade route.
   */
  editRouteButton: JButton = null;
  /**
   * The button to delete a trade route.
   */
  deleteRouteButton: JButton = null;
  /**
   * The button to deassing the unit from a trade route.
   */
  deassignRouteButton: JButton = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param unit The optional {@code Unit} to operate on.
   */
  _TradeRoutePanel(freeColClient: FreeColClient, unit: Unit): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String('wrap 2', '[fill][fill]'));
    this.listModel = new DefaultListModel()._DefaultListModel();
    this.counts = new HashMap();
    let player = this.getMyPlayer();
    this.unit = unit;
    this.tradeRoutes = new JList()._JList$ListModel(this.listModel);
    this.tradeRoutes.addListSelectionListener((e) => {
      this.updateButtons();
    });
    this.tradeRoutes.setCellRenderer(new (TradeRoutePanel$1())().$o(this)._DefaultListCellRenderer());
    let tradeRouteView = new JScrollPane()._JScrollPane$Component(this.tradeRoutes);
    this.newRouteButton = Utility.localizedButton$String('tradeRoutePanel.newRoute');
    Utility.localizeToolTip$JComponent$String(this.newRouteButton, 'tradeRoutePanel.new.tooltip');
    this.newRouteButton.addActionListener((ae) => this.newRoute());
    this.editRouteButton = Utility.localizedButton$String('tradeRoutePanel.editRoute');
    Utility.localizeToolTip$JComponent$String(this.editRouteButton, 'tradeRoutePanel.edit.tooltip');
    this.editRouteButton.addActionListener((ae) => {
      let selected = this.tradeRoutes.getSelectedValue();
      let name = selected.getName();
      this.getGUI().showTradeRouteInputPanel(selected).addClosingCallback(() => {
        let template = null;
        if (selected.getName() == null) {
          selected.setName(name);
        } else if ((template = selected.verify()) == null && (template = selected.verifyUniqueName()) == null) {
          this.igc().updateTradeRoute(selected);
          this.updateList(selected);
        } else {
          this.getGUI().showInformationPanel$StringTemplate(template);
        }
      });
    });
    this.deleteRouteButton = Utility.localizedButton$String('tradeRoutePanel.deleteRoute');
    Utility.localizeToolTip$JComponent$String(this.deleteRouteButton, 'tradeRoutePanel.delete.tooltip');
    this.deleteRouteButton.addActionListener((ae) => {
      let route = this.getRoute();
      if (route != null) {
        for (const $it0 = route.getAssignedUnits().iterator(); $it0.hasNext(); ) {
          let u = $it0.next();
          this.igc().assignTradeRoute(u, null);
        }
        this.igc().deleteTradeRoute(route);
        this.updateList(null);
      }
    });
    this.deassignRouteButton = Utility.localizedButton$String('tradeRoutePanel.deassignRoute');
    Utility.localizeToolTip$JComponent$String(this.deassignRouteButton, 'tradeRoutePanel.deassign.tooltip');
    this.deassignRouteButton.addActionListener((ae) => {
      if (this.unit != null && this.getRoute() === this.unit.getTradeRoute()) {
        this.igc().clearOrders(this.unit);
      }
      this.getGUI().removeComponent(this);
    });
    let cancelButton = Utility.localizedButton$String('cancel');
    cancelButton.addActionListener((ae) => this.getGUI().removeTradeRoutePanel(this));
    this.updateButtons();
    this.updateList((this.unit == null || this.unit.getTradeRoute() == null) ? null : unit.getTradeRoute());
    this.add$Component$Object(Utility.localizedHeader(Messages.nameKey$String('tradeRoutePanel'), Utility.FONTSPEC_TITLE), 'span, align center');
    if (this.unit != null && this.unit.getLocation() != null) {
      let unitLabel = new JLabel()._JLabel$String(this.unit.getDescription$UnitLabelType(Unit$UnitLabelType.NATIONAL));
      unitLabel.setIcon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallerUnitImage(this.unit)));
      this.add$Component(unitLabel);
      let loc = this.unit.getLocation();
      let locLabel = Utility.localizedLabel$StringTemplate(loc.getLocationLabelFor(player));
      this.add$Component(locLabel);
    }
    this.add$Component$Object(tradeRouteView, 'height 360:400, width 250:');
    this.add$Component$Object(this.newRouteButton, 'split 4, flowy, growx');
    this.add$Component$Object(this.editRouteButton, 'growx');
    this.add$Component$Object(this.deleteRouteButton, 'growx');
    this.add$Component(this.deassignRouteButton);
    this.add$Component$Object(this.okButton, 'newline 20, span, split 2, tag ok');
    this.add$Component$Object(cancelButton, 'tag cancel');
    this.setEscapeAction(new (TradeRoutePanel$2())().$o(this).$c(cancelButton)._AbstractAction$());
    this.getGUI().restoreSavedSize(this, this.getPreferredSize$());
    return this;
  }
  /**
   * Gets the currently selected route.
   *
   * @return The selected {@code TradeRoute}.
   */
  getRoute(): TradeRoute {
    return this.tradeRoutes.getSelectedValue();
  }
  /**
   * Handle a new route request.
   */
  newRoute(): void {
    let player = this.getMyPlayer();
    let u = this.unit;
    let newRoute = this.igc().newTradeRoute(player);
    this.getGUI().showTradeRouteInputPanel(newRoute).addClosingCallback(() => {
      let template = null;
      let name = newRoute.getName();
      if (name == null) {
        this.igc().deleteTradeRoute(newRoute);
        this.updateList(null);
      } else if ((template = newRoute.verify()) != null && (template = newRoute.verifyUniqueName()) != null) {
        this.updateList(null);
        this.getGUI().showInformationPanel$StringTemplate(template);
      } else {
        this.igc().updateTradeRoute(newRoute);
        if (u != null) {
          this.igc().assignTradeRoute(u, newRoute);
        }
        this.updateList(newRoute);
      }
    });
  }
  /**
   * Update the buttons on the panel.
   */
  updateButtons(): void {
    this.newRouteButton.setEnabled(true);
    if (this.tradeRoutes.getSelectedIndex() < 0) {
      this.editRouteButton.setEnabled(false);
      this.deleteRouteButton.setEnabled(false);
      this.deassignRouteButton.setEnabled(false);
    } else {
      this.editRouteButton.setEnabled(true);
      this.deleteRouteButton.setEnabled(true);
      this.deassignRouteButton.setEnabled(this.unit != null && this.unit.getTradeRoute() != null);
    }
  }
  /**
   * Update the list of routes displayed.
   *
   * @param selectRoute An optional {@code TradeRoute} to select.
   */
  updateList(selectRoute: TradeRoute): void {
    let player = this.getMyPlayer();
    let routes = new ArrayList();
    for (const $it1 = player.getTradeRoutes().iterator(); $it1.hasNext(); ) {
      let tr = $it1.next();
      let st = tr.verify();
      if (st == null) {
        routes.add(tr);
      } else {
        this.igc().deleteTradeRoute(tr);
        TradeRoutePanel.logger.warning('Dropped trade route: ' + Messages.message$StringTemplate(st));
      }
    }
    routes.sort(TradeRoutePanel.tradeRouteComparator);
    this.counts.clear();
    for (const $it2 = player.getUnitSet().iterator(); $it2.hasNext(); ) {
      let u = $it2.next();
      let tradeRoute = u.getTradeRoute();
      if (tradeRoute != null && routes.contains(tradeRoute)) {
        let i = this.counts.get(tradeRoute);
        let value = (i == null) ? 0 : i;
        this.counts.put(tradeRoute, (value + 1) | 0);
      }
    }
    this.listModel.clear();
    for (const $it3 = routes.iterator(); $it3.hasNext(); ) {
      let route = $it3.next();
      this.listModel.addElement(route);
    }
    if (selectRoute != null && this.tradeRoutes != null) {
      this.tradeRoutes.setSelectedValue(selectRoute, true);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (null == command) {
      return;
    }
    if ($J.equals(FreeColPanel.OK, command)) {
      let route = this.getRoute();
      if (this.unit != null && route != null) {
        this.igc().assignTradeRoute(this.unit, route);
      }
    }
    super.actionPerformed(ae);
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    this.listModel.clear();
    this.tradeRoutes = null;
    this.counts.clear();
    this.newRouteButton = null;
    this.editRouteButton = null;
    this.deleteRouteButton = null;
    this.deassignRouteButton = null;
    super.removeNotify();
  }
  static $clinit() {
    TradeRoutePanel.logger = Logger.getLogger($J.cls(TradeRoutePanel).getName());
    TradeRoutePanel.tradeRouteComparator = Comparator.comparing(($p0) => $p0.getName());
  }
}

let $TradeRoutePanel$1: any = null;
/** An anonymous class (TradeRoutePanel.java:102). */
function TradeRoutePanel$1(): any {
  return $TradeRoutePanel$1 ??= $J.local(class extends DefaultListCellRenderer {
    getListCellRendererComponent(list: JList, value: any, index: number, selected: boolean, focus: boolean): Component {
      let ret = super.getListCellRendererComponent(list, value, index, selected, focus);
      let tradeRoute = value;
      let name = tradeRoute.getName();
      let n = this.$outer.counts.get(tradeRoute);
      if (n == null || n <= 0) {
        this.setText(name);
      } else {
        this.setText(name + '  (' + n + ')');
      }
      return ret;
    }
  }, 'net.sf.freecol.client.gui.panel.TradeRoutePanel$1', []);
}

let $TradeRoutePanel$2: any = null;
/** An anonymous class (TradeRoutePanel.java:202). */
function TradeRoutePanel$2(): any {
  return $TradeRoutePanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$cv_cancelButton.doClick$();
    }
    $c($cancelButton): this {
      this.$cv_cancelButton = $cancelButton;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.TradeRoutePanel$2', []);
}

$J.define(TradeRoutePanel, 'net.sf.freecol.client.gui.panel.TradeRoutePanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Unit': '_TradeRoutePanel' }, returns: { 'getRoute': 'net.sf.freecol.common.model.TradeRoute' }, clinit: true, lazy: ['logger', 'tradeRouteComparator'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  DefaultListCellRenderer = $J.load('javax.swing.DefaultListCellRenderer');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
});
