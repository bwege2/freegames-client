// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MiniMapFreeColPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2024   The FreeCol Team
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
import { FreeColPanel } from './FreeColPanel.ts';

let BorderFactory, SwingGUI$PopupPosition, Messages;

export class MiniMapFreeColPanel extends FreeColPanel {
  _MiniMapFreeColPanel(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, null);
    this.setFocusable(false);
    this.setBorder(BorderFactory.createEmptyBorder$());
    return this;
  }
  getFramePopupPosition(): SwingGUI$PopupPosition {
    return SwingGUI$PopupPosition.UPPER_LEFT;
  }
  getFrameTitle(): string {
    return Messages.message$String('minimapPanel.title');
  }
}

$J.define(MiniMapFreeColPanel, 'net.sf.freecol.client.gui.panel.MiniMapFreeColPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_MiniMapFreeColPanel' }, returns: { 'getFrameTitle': 'java.lang.String', 'getFramePopupPosition': 'net.sf.freecol.client.gui.SwingGUI$PopupPosition' } });
$J.module(() => {
  BorderFactory = $J.load('javax.swing.BorderFactory');
  SwingGUI$PopupPosition = $J.load('net.sf.freecol.client.gui.SwingGUI$PopupPosition');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
