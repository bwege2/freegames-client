// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/FullScreenFrameListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

let Frame;

/**
 * The WindowListener for the FullScreenFrame class.
 */
export class FullScreenFrameListener extends JObject {
  freeColClient: FreeColClient = null;
  frame: FreeColFrame = null;
  /**
   * Constructs this WindowListener.
   *
   * @param freeColClient The {@code FreeColClient} to notify.
   * @param frame The frame.
   */
  _FullScreenFrameListener(freeColClient: FreeColClient, frame: FreeColFrame): this {
    this.freeColClient = freeColClient;
    this.frame = frame;
    return this;
  }
  /**
   * Invoked when the window gets activated.
   *
   * @param event The event that has information on the action.
   */
  windowActivated(event: WindowEvent): void {
  }
  /**
   * Invoked when the window gets closed.
   *
   * @param event The event that has information on the action.
   */
  windowClosed(event: WindowEvent): void {
  }
  /**
   * Invoked when the window is closing.
   *
   * @param event The event that has information on the action.
   */
  windowClosing(event: WindowEvent): void {
    if (this.freeColClient.isInGame() || this.freeColClient.isMapEditor()) {
      this.freeColClient.askToQuit();
    } else {
      this.freeColClient.quit();
    }
  }
  /**
   * Invoked when the window gets deactivated.
   *
   * @param event The event that has information on the action.
   */
  windowDeactivated(event: WindowEvent): void {
  }
  /**
   * Invoked when the window gets deiconified.
   *
   * @param event The event that has information on the action.
   */
  windowDeiconified(event: WindowEvent): void {
  }
  /**
   * Invoked when the window gets iconified.
   *
   * @param event The event that has information on the action.
   */
  windowIconified(event: WindowEvent): void {
    this.frame.setExtendedState(Frame.NORMAL);
  }
  /**
   * Invoked when the window gets opened.
   *
   * @param event The event that has information on the action.
   */
  windowOpened(event: WindowEvent): void {
  }
}

$J.define(FullScreenFrameListener, 'net.sf.freecol.client.gui.FullScreenFrameListener', { kind: 'class', ifaces: ['java.awt.event.WindowListener'], sup: 'java.lang.Object', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.FreeColFrame': '_FullScreenFrameListener' } });
$J.module(() => {
  Frame = $J.load('java.awt.Frame');
});
