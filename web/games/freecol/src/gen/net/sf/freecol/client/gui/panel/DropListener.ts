// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/DropListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, Toolkit } from '../../../../../../../jre/index.ts';
import { MouseAdapter } from '../../../../../../java/awt/event/MouseAdapter.ts';

let DefaultTransferHandler;

/**
 * A DropListener should be attached to Swing components that have a
 * TransferHandler attached.  The DropListener will make sure that the
 * Swing component to which it is attached can accept draggable data.
 */
export class DropListener extends MouseAdapter {
  static logger: Logger = null;
  _DropListener(): this {
    this._MouseAdapter();
    return this;
  }
  /**
   * Gets called when the mouse was released on a Swing component
   * that has this object as a MouseListener.
   *
   * @param e The event that holds the information about the mouse click.
   */
  mouseReleased(e: MouseEvent): void {
    let clipboard = Toolkit.getDefaultToolkit().getSystemClipboard();
    let clipData = clipboard.getContents(clipboard);
    if (clipData != null) {
      if (clipData.isDataFlavorSupported(DefaultTransferHandler.flavor)) {
        let comp = e.getSource();
        let handler = comp.getTransferHandler();
        handler.importData$JComponent$Transferable(comp, clipData);
      }
    }
  }
  static $clinit() {
    DropListener.logger = Logger.getLogger($J.cls(DropListener).getName());
  }
}

$J.define(DropListener, 'net.sf.freecol.client.gui.panel.DropListener', { kind: 'class', sup: 'java.awt.event.MouseAdapter', ctors: { '': '_DropListener' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  DefaultTransferHandler = $J.load('net.sf.freecol.client.gui.panel.DefaultTransferHandler');
});
