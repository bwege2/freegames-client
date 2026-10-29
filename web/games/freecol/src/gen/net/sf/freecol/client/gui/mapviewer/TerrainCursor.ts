// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/mapviewer/TerrainCursor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ActionEvent, ActionListener, Timer, EventListenerList;

/**
 * The blinking cursor on the map.
 */
export class TerrainCursor extends JObject {
  static readonly OFF: number = 0;
  static readonly ON: number = 1;
  static readonly blinkDelay: number = 500;
  /**
   * Is the cursor active?
   */
  active: boolean = false;
  /**
   * A timer for the blinking action.
   */
  blinkTimer: Timer = null;
  /**
   * The listeners watching for a blink.
   */
  listenerList: EventListenerList = null;
  /**
   * Creates a new {@code TerrainCursor} instance.
   */
  _TerrainCursor(): this {
    this.listenerList = new EventListenerList()._EventListenerList();
    this.active = true;
    this.blinkTimer = new Timer()._Timer(TerrainCursor.blinkDelay, $J.fn(this, 'actionPerformed'));
    return this;
  }
  /**
   * Is this TerrainCursor active?
   *
   * @return True if the cursor is active.
   */
  isActive(): boolean {
    return this.active;
  }
  startBlinking(): void {
    if (!this.blinkTimer.isRunning()) {
      this.blinkTimer.start();
    }
  }
  stopBlinking(): void {
    if (this.blinkTimer.isRunning()) {
      this.blinkTimer.stop();
      this.active = true;
    }
  }
  addActionListener(listener: ActionListener): void {
    this.listenerList.add($J.cls(ActionListener), listener);
  }
  removeActionListener(listener: ActionListener): void {
    this.listenerList.remove($J.cls(ActionListener), listener);
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (!this.blinkTimer.isRunning()) {
      return;
    }
    this.active = !this.active;
    let eventId = (this.active) ? TerrainCursor.ON : TerrainCursor.OFF;
    let blinkEvent = new ActionEvent()._ActionEvent$Object$int$String(this, eventId, 'blink');
    for (let al of this.listenerList.getListeners($J.cls(ActionListener))) {
      $J.fn(al, 'actionPerformed')(blinkEvent);
    }
  }
}

$J.define(TerrainCursor, 'net.sf.freecol.client.gui.mapviewer.TerrainCursor', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_TerrainCursor' }, returns: { 'isActive': 'boolean' } });
$J.module(() => {
  ActionEvent = $J.load('java.awt.event.ActionEvent');
  ActionListener = $J.load('java.awt.event.ActionListener');
  Timer = $J.load('javax.swing.Timer');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
});
