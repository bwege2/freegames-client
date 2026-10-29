// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/ColopediaTreeItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../../jre/index.ts';

/**
 * TreeCellItems are used to represent the name and icon of a node in
 * the Colopedia's tree.
 */
export class ColopediaTreeItem extends JObject {
  detailPanel: ColopediaDetailPanel = null;
  id_: string = null;
  text_: string = null;
  icon: ImageIcon = null;
  /**
   * The default constructor for a ColopediaTreeItem that
   * corresponds to a leaf node.
   *
   * @param detailPanel A {@code ColopediaDetailPanel} value.
   * @param id The object identifier.
   * @param text a {@code String} value
   * @param icon an {@code ImageIcon} value
   */
  _ColopediaTreeItem(detailPanel: ColopediaDetailPanel, id: string, text: string, icon: ImageIcon): this {
    this.detailPanel = detailPanel;
    this.id_ = id;
    this.text_ = text;
    this.icon = icon;
    return this;
  }
  /**
   * Returns the panel type this item belongs to.
   *
   * @return the panel type this item belongs to.
   */
  getPanelType(): ColopediaDetailPanel {
    return this.detailPanel;
  }
  getId(): string {
    return this.id_;
  }
  getText(): string {
    return this.text_;
  }
  /**
   * Returns the item's icon.
   *
   * @return the item's icon.
   */
  getIcon(): ImageIcon {
    return this.icon;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.text_;
  }
}

$J.define(ColopediaTreeItem, 'net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.gui.panel.colopedia.ColopediaDetailPanel,java.lang.String,java.lang.String,javax.swing.ImageIcon': '_ColopediaTreeItem' }, returns: { 'getIcon': 'javax.swing.ImageIcon', 'getText': 'java.lang.String', 'getId': 'java.lang.String', 'getPanelType': 'net.sf.freecol.client.gui.panel.colopedia.ColopediaDetailPanel' } });
