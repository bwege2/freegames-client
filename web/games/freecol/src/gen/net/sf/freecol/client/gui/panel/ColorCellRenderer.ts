// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ColorCellRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';

let Utility, StringTemplate;

/**
 * A table cell renderer that should be used to display the chosen
 * color in a table.  It is being used in the players table
 * (StartGamePanel).
 */
export class ColorCellRenderer extends JLabel {
  /**
   * The constructor to use.
   *
   * @param useBorder Indicated whether or not a border should be drawn.
   */
  _ColorCellRenderer(useBorder: boolean): this {
    this._JLabel$();
    if (useBorder) {
      this.setBorder(Utility.getColorCellBorder());
    }
    this.setOpaque(true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTableCellRendererComponent(table: JTable, color: any, isSelected: boolean, hasFocus: boolean, row: number, column: number): Component {
    let myColor = color;
    if (myColor != null) {
      this.setBackground(myColor);
      Utility.localizeToolTip$JComponent$StringTemplate(this, StringTemplate.template$String('info.rgb').addAmount('%red%', myColor.getRed()).addAmount('%green%', myColor.getGreen()).addAmount('%blue%', myColor.getBlue()));
    }
    return this;
  }
}

$J.define(ColorCellRenderer, 'net.sf.freecol.client.gui.panel.ColorCellRenderer', { kind: 'class', ifaces: ['javax.swing.table.TableCellRenderer'], sup: 'javax.swing.JLabel', ctors: { 'boolean': '_ColorCellRenderer' } });
$J.module(() => {
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
