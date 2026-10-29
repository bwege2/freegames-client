// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/FreeColChoiceDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
 * A simple modal choice dialog.
 */
export class FreeColChoiceDialog<T> extends FreeColDialog {
  /**
   * Internal constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _FreeColChoiceDialog$FreeColClient$JFrame(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    return this;
  }
  /**
   * Create a new {@code FreeColChoiceDialog} with a text and a
   * ok/cancel option.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param tmpl A {@code StringTemplate} with an explanatory message.
   * @param icon An optional icon to display.
   * @param cancelKey Key for the text of the optional cancel button.
   * @param choices A list of {@code ChoiceItem}s to create buttons for.
   */
  _FreeColChoiceDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$List(freeColClient: FreeColClient, frame: JFrame, modal: boolean, tmpl: StringTemplate, icon: ImageIcon, cancelKey: string, choices: List<ChoiceItem<T>>): this {
    this._FreeColChoiceDialog$FreeColClient$JFrame(freeColClient, frame);
    this.initializeChoiceDialog(frame, modal, Utility.localizedTextPanel(tmpl, icon), null, cancelKey, choices);
    return this;
  }
  /**
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param jc An object that explains the choice for the user.
   * @param icon An optional icon to display.
   * @param cancelKey Key for the text of the optional cancel button.
   * @param choices A list of {@code ChoiceItem}s to create buttons for.
   */
  initializeChoiceDialog(frame: JFrame, modal: boolean, jc: JComponent, icon: ImageIcon, cancelKey: string, choices: List<ChoiceItem<T>>): void {
    if (cancelKey != null) {
      choices.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(cancelKey), null).cancelOption().defaultOption());
    }
    this.initializeDialog(frame, FreeColDialog$DialogType.PLAIN, modal, jc, icon, choices);
  }
}

$J.define(FreeColChoiceDialog, 'net.sf.freecol.client.gui.dialog.FreeColChoiceDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.util.List': '_FreeColChoiceDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$List', 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_FreeColChoiceDialog$FreeColClient$JFrame' } });
$J.module(() => {
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
