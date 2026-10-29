// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/ColopediaTreeCellRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../../../jre/index.ts';
import { DefaultTreeCellRenderer } from '../../../../../../../javax/swing/tree/DefaultTreeCellRenderer.ts';

let Color, ImageIcon, ImageUtils;

/**
 * This TreeCellRenderer is responsible for rendering tree items in
 * the Colopedia.
 */
export class ColopediaTreeCellRenderer extends DefaultTreeCellRenderer {
  colopediaPanel: ColopediaPanel = null;
  lib: ImageLibrary = null;
  /**
   * The constructor makes sure that the backgrounds are transparent.
   *
   * @param colopediaPanel The parent panel.
   * @param lib The {@code ImageLibrary} to use.
   */
  _ColopediaTreeCellRenderer(colopediaPanel: ColopediaPanel, lib: ImageLibrary): this {
    this._DefaultTreeCellRenderer();
    this.colopediaPanel = colopediaPanel;
    this.lib = lib;
    this.setBackgroundNonSelectionColor(new Color()._Color$int$int$int$int(0, 0, 0, 1));
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTreeCellRendererComponent(tree: JTree, value: any, selected: boolean, expanded: boolean, leaf: boolean, row: number, hasFocus: boolean): Component {
    let node = value;
    super.getTreeCellRendererComponent(tree, value, selected, expanded, leaf, row, hasFocus);
    let nodeItem = node.getUserObject();
    if (nodeItem.getIcon() != null) {
      this.setIcon(nodeItem.getIcon());
    } else if (!leaf) {
      let image = ImageUtils.createCenteredImage$BufferedImage$Dimension(this.lib.getColopediaCellImage(expanded), this.colopediaPanel.getListItemIconSize());
      this.setIcon(new ImageIcon()._ImageIcon$Image(image));
    }
    return this;
  }
}

$J.define(ColopediaTreeCellRenderer, 'net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeCellRenderer', { kind: 'class', sup: 'javax.swing.tree.DefaultTreeCellRenderer', ctors: { 'net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel,net.sf.freecol.client.gui.ImageLibrary': '_ColopediaTreeCellRenderer' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
