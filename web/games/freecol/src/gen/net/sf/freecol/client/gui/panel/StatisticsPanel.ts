// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/StatisticsPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, JString, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { AbstractTableModel } from '../../../../../../javax/swing/table/AbstractTableModel.ts';

let BorderLayout, Component, Dimension, GridLayout, AbstractAction, Box, BoxLayout, JLabel, JPanel, JScrollPane, JTable, ScrollPaneConstants, Utility, Messages, CollectionUtils;

/**
 * Display the current game statistics.
 */
export class StatisticsPanel extends FreeColPanel {
  static logger: Logger = null;
  static memoryKeys: string[] = null;
  /**
   * Creates the statistics panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param serverStatistics A map of key,value pairs of server statistics.
   * @param clientStatistics A map of key,value pairs of client statistics.
   */
  _StatisticsPanel(freeColClient: FreeColClient, serverStatistics: JMap<string, string>, clientStatistics: JMap<string, string>): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new BorderLayout()._BorderLayout$());
    let header = new JPanel()._JPanel$();
    this.add$Component$Object(header, BorderLayout.PAGE_START);
    header.add$Component$Object(Utility.localizedLabel$String('statistics'), $J.boxF(Component.CENTER_ALIGNMENT));
    let statsPanel = new JPanel()._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(1, 2));
    let scrollPane = new JScrollPane()._JScrollPane$Component$int$int(statsPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    scrollPane.getViewport().setOpaque(false);
    scrollPane.setBorder(null);
    this.add$Component$Object(scrollPane, BorderLayout.CENTER);
    statsPanel.add$Component(this.displayStatsMessage('client', clientStatistics));
    statsPanel.add$Component(this.displayStatsMessage('server', serverStatistics));
    this.add$Component$Object(this.okButton, BorderLayout.PAGE_END);
    this.setEscapeAction(new (StatisticsPanel$1())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  displayStatsMessage(title: string, stats: JMap<string, string>): JPanel {
    let panel = new JPanel()._JPanel$();
    panel.setBorder(Utility.localizedBorder$String(title));
    let b = new Box()._Box(BoxLayout.PAGE_AXIS);
    panel.add$Component(b);
    let memory = new HashMap(StatisticsPanel.memoryKeys.length);
    let ai = new HashMap();
    for (let k of StatisticsPanel.memoryKeys) {
      memory.put(Messages.message$String('memoryManager.' + k), stats.remove(k));
    }
    for (const $it0 = new ArrayList(stats.keySet()).iterator(); $it0.hasNext(); ) {
      let k = $it0.next();
      if (k.startsWith('AI')) {
        ai.put(k, stats.remove(k));
      }
    }
    b.add$Component(this.createStatsTable('Memory', memory));
    b.add$Component(this.createStatsTable('Game', stats));
    if (ai.isEmpty()) {
      b.add$Component(new JLabel()._JLabel$());
    } else {
      b.add$Component(this.createStatsTable('AI', ai));
    }
    return panel;
  }
  createStatsTable(title: string, data: JMap<string, string>): JPanel {
    let panel = new JPanel()._JPanel$();
    panel.setLayout(new BorderLayout()._BorderLayout$());
    panel.add$Component$Object(new JLabel()._JLabel$String(title), BorderLayout.PAGE_START);
    let model = new StatisticsPanel$StatisticsModel()._StatisticsPanel$StatisticsModel();
    model.setData(data);
    let table = new JTable()._JTable$TableModel(model);
    table.setAutoCreateColumnsFromModel(true);
    table.setAutoResizeMode(JTable.AUTO_RESIZE_ALL_COLUMNS);
    table.setAutoCreateRowSorter(true);
    let scrollPane = new JScrollPane()._JScrollPane$Component(table);
    table.addNotify();
    scrollPane.getViewport().setOpaque(false);
    scrollPane.getColumnHeader().setOpaque(false);
    panel.add$Component$Object(scrollPane, BorderLayout.CENTER);
    panel.setPreferredSize(new Dimension()._Dimension$int$int(300, Math.imul(((data.size() + 2) | 0), 17)));
    return panel;
  }
  static $clinit() {
    StatisticsPanel.logger = Logger.getLogger($J.cls(StatisticsPanel).getName());
    StatisticsPanel.memoryKeys = ['freeMemory', 'totalMemory', 'maxMemory'];
  }
}

export class StatisticsPanel$StatisticsModel extends AbstractTableModel {
  static readonly NAME_COLUMN: number = 0;
  static readonly VALUE_COLUMN: number = 1;
  columnNames: string[] = null;
  data: any[][] = null;
  /**
   * A standard constructor.
   */
  _StatisticsPanel$StatisticsModel(): this {
    this._AbstractTableModel();
    this.columnNames = ['name', 'value'];
    this.data = null;
    return this;
  }
  /**
   * Gives this table model the data that is being used in the
   * table. This method should only be called to initialize the
   * data set. To modify or extend the data set use other
   * methods.
   *
   * @param statsData The map of key,value pairs to enter.
   */
  setData(statsData: JMap<string, string>): void {
    this.data = $J.newArrayN([2, statsData.size()], null);
    let i = 0;
    for (const $it1 = CollectionUtils.mapEntriesByKey$Map(statsData).iterator(); $it1.hasNext(); ) {
      let e = $it1.next();
      this.data[StatisticsPanel$StatisticsModel.NAME_COLUMN][i] = e.getKey();
      this.data[StatisticsPanel$StatisticsModel.VALUE_COLUMN][i] = e.getValue();
      i++;
    }
  }
  /**
   * {@inheritDoc}
   */
  getColumnClass(column: number): JClass<any> {
    return $J.cls(JString);
  }
  /**
   * {@inheritDoc}
   */
  getColumnName(column: number): string {
    return Messages.message$String(this.columnNames[column]);
  }
  /**
   * {@inheritDoc}
   */
  getColumnCount(): number {
    return this.columnNames.length;
  }
  /**
   * {@inheritDoc}
   */
  getRowCount(): number {
    return this.data[StatisticsPanel$StatisticsModel.NAME_COLUMN].length;
  }
  /**
   * {@inheritDoc}
   */
  getValueAt(row: number, column: number): any {
    if (0 <= row && 0 <= column && row < this.getRowCount() && column < this.getColumnCount()) {
      switch (column) {
        case StatisticsPanel$StatisticsModel.NAME_COLUMN:
          return this.data[StatisticsPanel$StatisticsModel.NAME_COLUMN][row];
        case StatisticsPanel$StatisticsModel.VALUE_COLUMN:
          return this.data[StatisticsPanel$StatisticsModel.VALUE_COLUMN][row];
      }
    }
    return null;
  }
}

let $StatisticsPanel$1: any = null;
/** An anonymous class (StatisticsPanel.java:186). */
function StatisticsPanel$1(): any {
  return $StatisticsPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.StatisticsPanel$1', []);
}

$J.define(StatisticsPanel, 'net.sf.freecol.client.gui.panel.StatisticsPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.util.Map,java.util.Map': '_StatisticsPanel' }, clinit: true, lazy: ['logger', 'memoryKeys'] });
$J.define(StatisticsPanel$StatisticsModel, 'net.sf.freecol.client.gui.panel.StatisticsPanel$StatisticsModel', { kind: 'class', sup: 'javax.swing.table.AbstractTableModel', ctors: { '': '_StatisticsPanel$StatisticsModel' }, returns: { 'getRowCount': 'int', 'getColumnCount': 'int' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Component = $J.load('java.awt.Component');
  Dimension = $J.load('java.awt.Dimension');
  GridLayout = $J.load('java.awt.GridLayout');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  Box = $J.load('javax.swing.Box');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTable = $J.load('javax.swing.JTable');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
