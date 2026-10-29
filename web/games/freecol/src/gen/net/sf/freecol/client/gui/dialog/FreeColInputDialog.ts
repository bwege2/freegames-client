// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/FreeColInputDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';

let ChoiceItem, FreeColDialog$DialogType, Utility, Messages;

/**
 * A FreeColDialog with input field/s.
 */
export class FreeColInputDialog<T> extends FreeColDialog {
  static logger: Logger = null;
  /**
   * Internal constructor.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _FreeColInputDialog$FreeColClient$JFrame(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    return this;
  }
  /**
   * Create a new {@code FreeColInputDialog} with an object and
   * a ok/cancel option.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param tmpl A {@code StringTemplate} containing the input fields and
   *     explanation to the user.
   * @param icon An optional icon to display.
   * @param okKey The key displayed on the "ok"-button.
   * @param cancelKey The key displayed on the optional "cancel"-button.
   */
  _FreeColInputDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$String(freeColClient: FreeColClient, frame: JFrame, modal: boolean, tmpl: StringTemplate, icon: ImageIcon, okKey: string, cancelKey: string): this {
    this._FreeColInputDialog$FreeColClient$JFrame(freeColClient, frame);
    this.initializeInputDialog(frame, modal, Utility.localizedTextArea$StringTemplate(tmpl), icon, okKey, cancelKey);
    return this;
  }
  /**
   * Initialize this input dialog.
   *
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param jc The object containing the input fields and
   *     explanation to the user.
   * @param icon An optional icon to display.
   * @param okKey The key displayed on the "ok"-button.
   * @param cancelKey The key displayed on the optional "cancel"-button.
   */
  initializeInputDialog(frame: JFrame, modal: boolean, jc: JComponent, icon: ImageIcon, okKey: string, cancelKey: string): void {
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(okKey), null).okOption());
    if (cancelKey != null) {
      c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(cancelKey), null).cancelOption().defaultOption());
    }
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, modal, jc, icon, c);
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): T {
    if (this.responded()) {
      let value = this.getValue();
      if (value === this.options.get(0)) {
        return this.getInputValue();
      }
    }
    return null;
  }
  static $clinit() {
    FreeColInputDialog.logger = Logger.getLogger($J.cls(FreeColInputDialog).getName());
  }
}

$J.define(FreeColInputDialog, 'net.sf.freecol.client.gui.dialog.FreeColInputDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean,net.sf.freecol.common.model.StringTemplate,javax.swing.ImageIcon,java.lang.String,java.lang.String': '_FreeColInputDialog$FreeColClient$JFrame$boolean$StringTemplate$ImageIcon$String$String', 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_FreeColInputDialog$FreeColClient$JFrame' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
