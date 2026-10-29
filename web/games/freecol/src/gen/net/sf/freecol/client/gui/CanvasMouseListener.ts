// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/CanvasMouseListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../control/FreeColClientHolder.ts';

let MouseEvent;

/**
 * Listens to mouse buttons being pressed at the level of the Canvas.
 */
export class CanvasMouseListener extends FreeColClientHolder {
  static logger: Logger = null;
  /**
   * Create a new mouse listener.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   */
  _CanvasMouseListener(freeColClient: FreeColClient): this {
    this._FreeColClientHolder(freeColClient);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  mouseEntered(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mouseExited(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mousePressed(e: MouseEvent): void {
    if (!e.getComponent().isEnabled()) {
      return;
    }
    let gui = this.getGUI();
    if (e.isPopupTrigger()) {
      gui.showTilePopup(gui.tileAt(e.getX(), e.getY()));
      return;
    }
    switch (e.getButton()) {
      case MouseEvent.BUTTON1:
        if (gui.isGotoStarted()) {
          gui.performGoto$int$int(e.getX(), e.getY());
          break;
        }
        gui.prepareDrag(e.getX(), e.getY());
        break;
      case MouseEvent.BUTTON2:
        gui.performGoto$int$int(e.getX(), e.getY());
        break;
      case MouseEvent.BUTTON3:
        gui.showTilePopup(gui.tileAt(e.getX(), e.getY()));
        break;
      default:
        break;
    }
  }
  /**
   * {@inheritDoc}
   */
  mouseReleased(e: MouseEvent): void {
    if (!e.getComponent().isEnabled()) {
      return;
    }
    if (e.getButton() !== MouseEvent.BUTTON1) {
      return;
    }
    this.getGUI().traverseGotoPath();
  }
  /**
   * {@inheritDoc}
   */
  mouseClicked(e: MouseEvent): void {
    if (!e.getComponent().isEnabled()) {
      return;
    }
    if (e.getButton() !== MouseEvent.BUTTON1) {
      return;
    }
    this.getGUI().clickAt(e.getClickCount(), e.getX(), e.getY());
  }
  static $clinit() {
    CanvasMouseListener.logger = Logger.getLogger($J.cls(CanvasMouseListener).getName());
  }
}

$J.define(CanvasMouseListener, 'net.sf.freecol.client.gui.CanvasMouseListener', { kind: 'class', ifaces: ['java.awt.event.MouseListener'], sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient': '_CanvasMouseListener' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  MouseEvent = $J.load('java.awt.event.MouseEvent');
});
