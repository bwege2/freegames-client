// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/ScrollThread.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, InterruptedException, Level, Logger, Thread } from '../../../../../../jre/index.ts';

let SwingUtilities, FreeCol;

/**
 * Scrolls the view of the Map by moving its focus.
 */
export class ScrollThread extends Thread {
  static logger: Logger = null;
  /**
   * Delay between scroll steps in ms.
   */
  static readonly SCROLL_DELAY: number = 50;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The direction to scroll in.
   */
  direction: Direction = null;
  aborted: boolean = false;
  /**
   * The constructor to use.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   */
  _ScrollThread(freeColClient: FreeColClient): this {
    this._Thread(FreeCol.CLIENT_THREAD + 'Mouse scroller');
    this.direction = null;
    this.aborted = false;
    this.freeColClient = freeColClient;
    return this;
  }
  /**
   * Sets the direction in which this ScrollThread will scroll.
   *
   * @param d The {@code Direction} in which this ScrollThread
   *     will scroll.
   */
  setDirection(d: Direction): void {
    this.direction = d;
  }
  isAborted(): boolean {
    return this.aborted;
  }
  abort(): void {
    this.aborted = true;
    this.direction = null;
  }
  /**
   * Performs the actual scrolling.
   * Run until interrupted or scrolling fails.
   */
  run(): void {
    let gui = this.freeColClient.getGUI();
    this.normalScrolling(gui);
    gui.resetScrollSpeed();
  }
  normalScrolling(gui: GUI): void {
    while (true) {
      if (this.isAborted()) {
        break;
      }
      let d = this.direction;
      if (d == null) {
        this.abort();
        break;
      }
      let start = $J.system_currentTimeMillis();
      try {
        SwingUtilities.invokeAndWait(() => {
          if (!gui.scrollMap(d, true)) {
            this.abort();
            return;
          }
        });
      } catch ($e0) {
        if ($J.isa($e0, Exception)) {
          let ex = $J.exc($e0);
          ScrollThread.logger.log(Level.WARNING, 'Exception while scrolling', ex);
          this.abort();
          break;
        } else {
          throw $e0;
        }
      }
      if (this.isAborted()) {
        break;
      }
      try {
        let time = $J.system_currentTimeMillis() - start;
        Thread.sleep(Math.max(2, ScrollThread.SCROLL_DELAY - time));
      } catch ($e1) {
        if ($J.isa($e1, InterruptedException)) {
          let e = $J.exc($e1);
          this.abort();
          break;
        } else {
          throw $e1;
        }
      }
    }
  }
  static $clinit() {
    ScrollThread.logger = Logger.getLogger($J.cls(ScrollThread).getName());
  }
}

$J.define(ScrollThread, 'net.sf.freecol.client.gui.ScrollThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { 'net.sf.freecol.client.FreeColClient': '_ScrollThread' }, returns: { 'isAborted': 'boolean' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
});
