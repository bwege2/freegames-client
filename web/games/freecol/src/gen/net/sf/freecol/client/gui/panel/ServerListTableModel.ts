// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ServerListTableModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { AbstractTableModel } from '../../../../../../javax/swing/table/AbstractTableModel.ts';

let Messages;

export class ServerListTableModel extends AbstractTableModel {
  static columnNames: string[] = null;
  items: List<ServerInfo> = null;
  _ServerListTableModel(items: List<ServerInfo>): this {
    this._AbstractTableModel();
    this.items = items;
    return this;
  }
  /**
   * Sets the items that should be contained by this model.
   *
   * @param items The {@code ArrayList} containing the items.
   */
  setItems(items: List<ServerInfo>): void {
    this.items = items;
  }
  /**
   * Gets the given item.
   *
   * @param row The row-number identifying a {@code ServerInfo}-line.
   * @return The {@code ServerInfo}.
   */
  getItem(row: number): ServerInfo {
    return this.items.get(row);
  }
  /**
   * Returns the amount of columns in this statesTable.
   *
   * @return The amount of columns in this statesTable.
   */
  getColumnCount(): number {
    return ServerListTableModel.columnNames.length;
  }
  /**
   * Returns the name of the specified column.
   *
   * @return The name of the specified column.
   */
  getColumnName(column: number): string {
    return ServerListTableModel.columnNames[column];
  }
  /**
   * Returns the amount of rows in this statesTable.
   *
   * @return The amount of rows in this statesTable.
   */
  getRowCount(): number {
    return this.items.size();
  }
  /**
   * Returns the value at the requested location.
   *
   * @param row The requested row.
   * @param column The requested column.
   * @return The value at the requested location.
   */
  getValueAt(row: number, column: number): any {
    if (0 <= row && 0 <= column && row < this.getRowCount() && column < this.getColumnCount()) {
      let si = this.items.get(row);
      switch (column) {
        case 0:
          return si.getName();
        case 1:
          return si.getAddress();
        case 2:
          return String(si.getPort());
        case 3:
          return String(si.getCurrentlyPlaying()) + '/' + (String((si.getCurrentlyPlaying() + si.getSlotsAvailable()) | 0));
        case 4:
          return Messages.message$String('serverListPanel.gameState.' + String(si.getGameState()));
        default:
          return null;
      }
    }
    return null;
  }
  static $clinit() {
    ServerListTableModel.columnNames = [Messages.message$String('name'), Messages.message$String('host'), Messages.message$String('port'), Messages.message$String('serverListPanel.players'), Messages.message$String('serverListPanel.gameState')];
  }
}

$J.define(ServerListTableModel, 'net.sf.freecol.client.gui.panel.ServerListTableModel', { kind: 'class', sup: 'javax.swing.table.AbstractTableModel', ctors: { 'java.util.List': '_ServerListTableModel' }, returns: { 'getRowCount': 'int', 'getColumnCount': 'int' }, clinit: true, lazy: ['columnNames'] });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
