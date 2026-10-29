// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/SelectTributeAmountDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, NumberFormatException } from '../../../../../../../jre/index.ts';
import { FreeColInputDialog } from './FreeColInputDialog.ts';

let JTextField, MigLayout, MigPanel, Utility;

/**
 * The panel that allows a choice of tribute amount.
 */
export class SelectTributeAmountDialog extends FreeColInputDialog {
  static logger: Logger = null;
  static readonly COLUMNS: number = 5;
  /**
   * The field to contain the input.
   */
  input: JTextField = null;
  /**
   * The maxumum amount allowed.
   */
  maximum: number = 0;
  /**
   * The constructor to use.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param frame The owner frame.
   * @param question A {@code StringTemplate} describing the
   *     input required.
   * @param maximum The inclusive maximum integer input value.
   */
  _SelectTributeAmountDialog(freeColClient: FreeColClient, frame: JFrame, question: StringTemplate, maximum: number): this {
    this._FreeColInputDialog$FreeColClient$JFrame(freeColClient, frame);
    this.maximum = maximum;
    this.input = new JTextField()._JTextField$String$int(String(maximum), SelectTributeAmountDialog.COLUMNS);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 1'));
    panel.add$Component(Utility.localizedTextArea$StringTemplate(question));
    panel.add$Component(this.input);
    panel.setSize$Dimension(panel.getPreferredSize$());
    this.initializeInputDialog(frame, true, panel, null, 'ok', 'cancel');
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getInputValue(): number {
    let result: number;
    try {
      result = $J.parseInt(this.input.getText$());
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
        return null;
      } else {
        throw $e0;
      }
    }
    return (result <= 0 || result > this.maximum) ? null : result;
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.input.requestFocus$();
  }
  static $clinit() {
    SelectTributeAmountDialog.logger = Logger.getLogger($J.cls(SelectTributeAmountDialog).getName());
  }
}

$J.define(SelectTributeAmountDialog, 'net.sf.freecol.client.gui.dialog.SelectTributeAmountDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColInputDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.StringTemplate,int': '_SelectTributeAmountDialog' }, returns: { 'getInputValue': 'java.lang.Integer' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  JTextField = $J.load('javax.swing.JTextField');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
