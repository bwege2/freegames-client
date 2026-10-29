// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/FreeColStringInputDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColInputDialog } from './FreeColInputDialog.ts';

let BorderLayout, JPanel, JTextField, Utility;

/**
 * A simple input dialog to collect a string.
 */
export class FreeColStringInputDialog extends FreeColInputDialog {
  /**
   * The text field for the user to set.
   */
  textField: JTextField = null;
  /**
   * Creates a dialog to input a string field.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param modal True if this dialog should be modal.
   * @param tmpl A {@code StringTemplate} to explain the action to the user.
   * @param defaultValue The default value appearing in the text field.
   * @param okKey A key displayed on the "ok"-button.
   * @param cancelKey A key displayed on the optional "cancel"-button.
   */
  _FreeColStringInputDialog(freeColClient: FreeColClient, frame: JFrame, modal: boolean, tmpl: StringTemplate, defaultValue: string, okKey: string, cancelKey: string): this {
    this._FreeColInputDialog$FreeColClient$JFrame(freeColClient, frame);
    this.textField = new JTextField()._JTextField$String(defaultValue);
    this.textField.setOpaque(false);
    let panel = new (FreeColStringInputDialog$1())().$o(this)._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    panel.setOpaque(false);
    panel.add$Component(Utility.localizedTextArea$StringTemplate(tmpl));
    panel.add$Component$Object(this.textField, BorderLayout.PAGE_END);
    this.initializeInputDialog(frame, modal, panel, null, okKey, cancelKey);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getInputValue(): string {
    return this.textField.getText$();
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.textField.requestFocus$();
  }
}

let $FreeColStringInputDialog$1: any = null;
/** An anonymous class (FreeColStringInputDialog.java:61). */
function FreeColStringInputDialog$1(): any {
  return $FreeColStringInputDialog$1 ??= $J.local(class extends JPanel {
    requestFocus$(): void {
      this.$outer.textField.requestFocus$();
    }
  }, 'net.sf.freecol.client.gui.dialog.FreeColStringInputDialog$1', []);
}

$J.define(FreeColStringInputDialog, 'net.sf.freecol.client.gui.dialog.FreeColStringInputDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColInputDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,boolean,net.sf.freecol.common.model.StringTemplate,java.lang.String,java.lang.String,java.lang.String': '_FreeColStringInputDialog' }, returns: { 'getInputValue': 'java.lang.String' }, meths: { 'requestFocus()': 'requestFocus$' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  JPanel = $J.load('javax.swing.JPanel');
  JTextField = $J.load('javax.swing.JTextField');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
