// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ServerListPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { DefaultTableCellRenderer } from '../../../../../../javax/swing/table/DefaultTableCellRenderer.ts';

let AbstractAction, JScrollPane, JTable, ListSelectionModel, MigLayout, FreeCol, ServerListTableModel, Utility, CollectionUtils;

/**
 * This panel is used to display the information received from the meta-server.
 */
export class ServerListPanel extends FreeColPanel {
  static logger: Logger = null;
  connectController: ConnectController = null;
  table: JTable = null;
  tableModel: ServerListTableModel = null;
  connect_: JButton = null;
  /**
   * Creates a panel to display the meta-server.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param connectController The controller responsible for creating new
   *     connections.
   */
  _ServerListPanel(freeColClient: FreeColClient, connectController: ConnectController): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('', '', ''));
    this.connectController = connectController;
    let cancel = Utility.localizedButton$String('cancel');
    let tableScroll: JScrollPane;
    this.connect_ = Utility.localizedButton$String('connect');
    this.tableModel = new ServerListTableModel()._ServerListTableModel(new ArrayList());
    this.table = new JTable()._JTable$TableModel(this.tableModel);
    let dtcr = new ServerListPanel$ServerListTableCellRenderer()._ServerListPanel$ServerListTableCellRenderer();
    for (let i = 0; i < this.table.getColumnModel().getColumnCount(); i++) {
      this.table.getColumnModel().getColumn(i).setCellRenderer(dtcr);
    }
    this.table.setRowHeight$int(22);
    this.table.setCellSelectionEnabled(false);
    this.table.setRowSelectionAllowed(true);
    this.table.setColumnSelectionAllowed(false);
    this.table.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    tableScroll = new JScrollPane()._JScrollPane$Component(this.table);
    this.table.addNotify();
    tableScroll.getViewport().setOpaque(false);
    tableScroll.getColumnHeader().setOpaque(false);
    this.connect_.addActionListener((ae) => {
      let si = this.tableModel.getItem(this.table.getSelectedRow());
      connectController.joinMultiplayerGame(si.getAddress(), si.getPort());
    });
    cancel.addActionListener((ae) => {
      this.getGUI().removeComponent(this);
      this.getGUI().showNewPanel$();
    });
    this.add$Component$Object(tableScroll, 'width 400:, height 350:');
    this.add$Component$Object(this.connect_, 'newline 20, split 2');
    this.add$Component$Object(cancel, 'tag cancel');
    this.setEscapeAction(new (ServerListPanel$1())().$o(this).$c(cancel)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  requestFocus$(): void {
    this.connect_.requestFocus$();
  }
  /**
   * Initializes the data that is displayed in this panel.
   *
   * @param servers A list of {@code ServerInfo}-objects to be
   *            displayed.
   */
  initialize(servers: List<ServerInfo>): void {
    CollectionUtils.removeInPlace$Collection$Predicate(servers, (si) => !$J.equals(si.getVersion(), FreeCol.getVersion()));
    this.tableModel.setItems(servers);
    this.setEnabled(true);
    if (servers.isEmpty()) {
      this.connect_.setEnabled(false);
    } else {
      this.table.setRowSelectionInterval(0, 0);
    }
  }
  /**
   * Sets whether or not this component is enabled. It also does this for its
   * children.
   *
   * @param enabled 'true' if this component and its children should be
   *            enabled, 'false' otherwise.
   */
  setEnabled(enabled: boolean): void {
    super.setEnabled(enabled);
    let components = this.getComponents();
    for (let component of components) {
      component.setEnabled(enabled);
    }
    this.table.setEnabled(enabled);
  }
  /**
   * Refreshes the table.
   */
  refreshTable(): void {
    this.tableModel.fireTableDataChanged();
  }
  static $clinit() {
    ServerListPanel.logger = Logger.getLogger($J.cls(ServerListPanel).getName());
  }
}

export class ServerListPanel$ServerListTableCellRenderer extends DefaultTableCellRenderer {
  _ServerListPanel$ServerListTableCellRenderer(): this {
    this._DefaultTableCellRenderer();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(t: JTable, o: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    this.setOpaque(isSelected);
    return super.getTableCellRendererComponent(t, o, isSelected, hasFocus, row, column);
  }
}

let $ServerListPanel$1: any = null;
/** An anonymous class (ServerListPanel.java:127). */
function ServerListPanel$1(): any {
  return $ServerListPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$cv_cancel.doClick$();
    }
    $c($cancel): this {
      this.$cv_cancel = $cancel;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.ServerListPanel$1', []);
}

$J.define(ServerListPanel, 'net.sf.freecol.client.gui.panel.ServerListPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.control.ConnectController': '_ServerListPanel' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.define(ServerListPanel$ServerListTableCellRenderer, 'net.sf.freecol.client.gui.panel.ServerListPanel$ServerListTableCellRenderer', { kind: 'class', sup: 'javax.swing.table.DefaultTableCellRenderer', ctors: { '': '_ServerListPanel$ServerListTableCellRenderer' } });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTable = $J.load('javax.swing.JTable');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ServerListTableModel = $J.load('net.sf.freecol.client.gui.panel.ServerListTableModel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
