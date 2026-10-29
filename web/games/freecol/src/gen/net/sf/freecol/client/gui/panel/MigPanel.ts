// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/MigPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';

/**
 * A panel that clears its layout on close, working around a bug in
 * some versions of MigLayout.
 */
export class MigPanel extends JPanel {
  uiClassId: string = null;
  _MigPanel$String(uiClassId: string): this {
    this._JPanel$();
    // assert SwingUtilities.isEventDispatchThread()
    this.uiClassId = uiClassId;
    return this;
  }
  _MigPanel$LayoutManager(layout: LayoutManager): this {
    this._JPanel$LayoutManager(layout);
    // assert SwingUtilities.isEventDispatchThread()
    this.uiClassId = null;
    return this;
  }
  _MigPanel$String$LayoutManager(uiClassId: string, layout: LayoutManager): this {
    this._JPanel$LayoutManager(layout);
    // assert SwingUtilities.isEventDispatchThread()
    this.uiClassId = uiClassId;
    return this;
  }
  getMigLayout(): MigLayout {
    return this.getLayout();
  }
  /**
   * {@inheritDoc}
   */
  getUIClassID(): string {
    return (this.uiClassId != null) ? this.uiClassId : super.getUIClassID();
  }
}

$J.define(MigPanel, 'net.sf.freecol.client.gui.panel.MigPanel', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { 'java.lang.String,java.awt.LayoutManager': '_MigPanel$String$LayoutManager', 'java.awt.LayoutManager': '_MigPanel$LayoutManager', 'java.lang.String': '_MigPanel$String' }, returns: { 'getUIClassID': 'java.lang.String', 'getMigLayout': 'net.miginfocom.swing.MigLayout' } });
