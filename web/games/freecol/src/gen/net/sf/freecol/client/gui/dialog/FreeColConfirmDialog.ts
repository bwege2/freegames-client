// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/FreeColConfirmDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColDialog } from './FreeColDialog.ts';

let ChoiceItem, FreeColDialog$DialogType, Utility, Messages;

/**
 * A simple modal ok/cancel dialog.
 */
export class FreeColConfirmDialog extends FreeColDialog {
  /**
   * Internal constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _FreeColConfirmDialog$FreeColClient$JFrame(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    return this;
  }
  /**
   * Create a new {@code FreeColConfirmDialog} with a text and a
   * ok/cancel option.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param tmpl A {@code StringTemplate} to explain the choice.
   * @param icon An optional icon to display.
   * @param okKey A key for the text displayed on the "ok"-button.
   * @param cancelKey A key for the text displayed on the "cancel"-button.
   */
  _FreeColConfirmDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$String(freeColClient: FreeColClient, frame: JFrame, modal: boolean, tmpl: StringTemplate, icon: ImageIcon, okKey: string, cancelKey: string): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    this.initializeConfirmDialog(frame, modal, Utility.localizedTextArea$StringTemplate(tmpl), icon, okKey, cancelKey);
    return this;
  }
  /**
   * Initialize this confirm dialog.
   *
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param jc The object that explains the choice for the user.
   * @param icon An optional icon to display.
   * @param okKey The text displayed on the "ok"-button.
   * @param cancelKey The text displayed on the "cancel"-button.
   */
  initializeConfirmDialog(frame: JFrame, modal: boolean, jc: JComponent, icon: ImageIcon, okKey: string, cancelKey: string): void {
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(okKey), true).okOption());
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(cancelKey), false).cancelOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, modal, jc, icon, c);
  }
}

$J.define(FreeColConfirmDialog, 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.lang.String': '_FreeColConfirmDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$String', 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_FreeColConfirmDialog$FreeColClient$JFrame' } });
$J.module(() => {
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
