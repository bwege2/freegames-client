// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ImageSelection.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';

let DefaultTransferHandler;

/**
 * Represents an image selection that can be selected and
 * dragged/dropped to/from Swing components.
 */
export class ImageSelection extends JObject {
  /**
   * The {@code JLabel} to transfer.
   */
  label: JLabel = null;
  /**
   * Create a new image selection.
   *
   * @param label The {@code JLabel} that this selection should hold.
   */
  _ImageSelection(label: JLabel): this {
    this.label = label;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getTransferData(flavor: DataFlavor): any {
    return (this.isDataFlavorSupported(flavor)) ? this.label : null;
  }
  /**
   * {@inheritDoc}
   */
  getTransferDataFlavors(): DataFlavor[] {
    return [DefaultTransferHandler.flavor];
  }
  /**
   * {@inheritDoc}
   */
  isDataFlavorSupported(flavor: DataFlavor): boolean {
    return flavor.equals(DefaultTransferHandler.flavor);
  }
}

$J.define(ImageSelection, 'net.sf.freecol.client.gui.panel.ImageSelection', { kind: 'class', ifaces: ['java.awt.datatransfer.Transferable'], sup: 'java.lang.Object', ctors: { 'javax.swing.JLabel': '_ImageSelection' } });
$J.module(() => {
  DefaultTransferHandler = $J.load('net.sf.freecol.client.gui.panel.DefaultTransferHandler');
});
