// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/EditOptionDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColConfirmDialog } from './FreeColConfirmDialog.ts';

let MigLayout, OptionUI, MigPanel;

/**
 * Dialog to edit options with.
 */
export class EditOptionDialog extends FreeColConfirmDialog {
  ui: OptionUI = null;
  /**
   * Create an EditOptionDialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param option The {@code Option} to operate on.
   */
  _EditOptionDialog(freeColClient: FreeColClient, frame: JFrame, option: Option): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    this.ui = OptionUI.getOptionUI(this.getGUI(), option, true);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$());
    panel.add$Component(this.ui.getComponent());
    this.initializeConfirmDialog(frame, true, panel, null, 'ok', 'cancel');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): boolean {
    let result = super.getResponse();
    if (this.ui != null && result) {
      this.ui.updateOption();
    }
    return result;
  }
}

$J.define(EditOptionDialog, 'net.sf.freecol.client.gui.dialog.EditOptionDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.option.Option': '_EditOptionDialog' }, returns: { 'getResponse': 'java.lang.Boolean' } });
$J.module(() => {
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  OptionUI = $J.load('net.sf.freecol.client.gui.option.OptionUI');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
});
