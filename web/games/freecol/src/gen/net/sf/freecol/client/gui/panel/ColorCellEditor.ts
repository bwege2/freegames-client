// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ColorCellEditor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 * Copyright (C) 2002-2022   The FreeCol Team
 * <p>
 * This file is part of FreeCol.
 * <p>
 * FreeCol is free software: you can redistribute it and/or modify
 * it under the terms of the GNU General Public License as published by
 * the Free Software Foundation, either version 2 of the License, or
 * (at your option) any later version.
 * <p>
 * FreeCol is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * <p>
 * You should have received a copy of the GNU General Public License
 * along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { AbstractCellEditor } from '../../../../../../javax/swing/AbstractCellEditor.ts';

let JButton, FreeColPanel;

/**
 * A table cell editor that can be used to edit colors.
 */
export class ColorCellEditor extends AbstractCellEditor {
  static logger: Logger = null;
  freeColClient: FreeColClient = null;
  colorEditButton: JButton = null;
  colorChooserPanel: ColorChooserPanel = null;
  currentColor: Color = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The top level component that holds all
   *     other components.
   */
  _ColorCellEditor(freeColClient: FreeColClient): this {
    this._AbstractCellEditor();
    this.colorChooserPanel = null;
    this.freeColClient = freeColClient;
    this.colorEditButton = new JButton()._JButton$();
    this.colorEditButton.addActionListener((ae) => this.colorChooserPanel = freeColClient.getGUI().showColorChooserPanel($J.fn(this, 'actionPerformed')));
    this.colorEditButton.setBorderPainted(false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellEditorComponent(table: JTable, value: any, hasFocus: boolean, row: number, column: number): Component {
    this.currentColor = value;
    return this.colorEditButton;
  }
  /**
   * {@inheritDoc}
   */
  getCellEditorValue(): any {
    return this.currentColor;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    let gui = this.freeColClient.getGUI();
    if (null != command) {
      switch (command) {
        case FreeColPanel.OK:
          if (this.colorChooserPanel != null) {
            this.currentColor = this.colorChooserPanel.getColor();
            gui.removeComponent(this.colorChooserPanel);
          }
          this.fireEditingStopped();
          break;
        case FreeColPanel.CANCEL:
          if (this.colorChooserPanel != null) {
            gui.removeComponent(this.colorChooserPanel);
          }
          this.fireEditingCanceled();
          break;
        default:
          ColorCellEditor.logger.warning('Bad event: ' + command);
          break;
      }
    }
  }
  static $clinit() {
    ColorCellEditor.logger = Logger.getLogger($J.cls(ColorCellEditor).getName());
  }
}

$J.define(ColorCellEditor, 'net.sf.freecol.client.gui.panel.ColorCellEditor', { kind: 'class', ifaces: ['javax.swing.table.TableCellEditor', 'java.awt.event.ActionListener'], sup: 'javax.swing.AbstractCellEditor', ctors: { 'net.sf.freecol.client.FreeColClient': '_ColorCellEditor' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  JButton = $J.load('javax.swing.JButton');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
});
