// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/action/DebugAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColAction } from './FreeColAction.ts';

let InputEvent, KeyEvent, KeyStroke, FreeColDebugger, FreeColDebugger$DebugMode;

/**
 * Switch debug mode on.
 */
export class DebugAction extends FreeColAction {
  static readonly id: string = 'debugAction';
  /**
   * Creates a new {@code DebugAction}.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _DebugAction(freeColClient: FreeColClient): this {
    this._FreeColAction(freeColClient, DebugAction.id);
    this.setAccelerator(KeyStroke.getKeyStroke$int$int(KeyEvent.VK_D, InputEvent.SHIFT_DOWN_MASK | InputEvent.CTRL_DOWN_MASK));
    return this;
  }
  /**
   * {@inheritDoc}
   */
  shouldBeEnabled(): boolean {
    return !FreeColDebugger.isInDebugMode$DebugMode(FreeColDebugger$DebugMode.MENUS);
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (this.shouldBeEnabled()) {
      this.igc().setInDebugMode();
    }
  }
}

$J.define(DebugAction, 'net.sf.freecol.client.gui.action.DebugAction', { kind: 'class', sup: 'net.sf.freecol.client.gui.action.FreeColAction', ctors: { 'net.sf.freecol.client.FreeColClient': '_DebugAction' } });
$J.module(() => {
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  FreeColDebugger = $J.load('net.sf.freecol.common.debug.FreeColDebugger');
  FreeColDebugger$DebugMode = $J.load('net.sf.freecol.common.debug.FreeColDebugger$DebugMode');
});
