// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/SelectAmountDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Integer, Logger } from '../../../../../../../jre/index.ts';
import { FreeColInputDialog } from './FreeColInputDialog.ts';

let InputVerifier, JComboBox, MigLayout, MigPanel, Utility;

/**
 * The panel that allows a choice of goods amount.
 */
export class SelectAmountDialog extends FreeColInputDialog {
  static logger: Logger = null;
  static readonly SELECT_CANCEL: number = -1;
  /**
   * The default amounts to try.
   */
  static amounts: number[] = null;
  /**
   * The combo box to input the amount through.
   */
  comboBox: JComboBox<number> = null;
  /**
   * The maximum amount of goods available.
   */
  available_: number = 0;
  /**
   * The constructor to use.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param frame The owner frame.
   * @param goodsType The {@code GoodsType} to select an amount of.
   * @param available The amount of goods available.
   * @param defaultAmount The amount to select to start with.
   * @param pay If true, check the player has sufficient funds.
   */
  _SelectAmountDialog(freeColClient: FreeColClient, frame: JFrame, goodsType: GoodsType, available: number, defaultAmount: number, pay: boolean): this {
    this._FreeColInputDialog$FreeColClient$JFrame(freeColClient, frame);
    if (pay) {
      let player = this.getMyPlayer();
      let gold = player.getGold();
      let price = player.getMarket().getCostToBuy(goodsType);
      available = Math.min(available, $J.idiv(gold, price));
    }
    this.available_ = available;
    let question = Utility.localizedTextArea$String('selectAmountDialog.text');
    let values = new ArrayList();
    let defaultIndex = -1;
    for (let index = 0; index < SelectAmountDialog.amounts.length; index++) {
      if (SelectAmountDialog.amounts[index] < available) {
        if (SelectAmountDialog.amounts[index] === defaultAmount) {
          defaultIndex = index;
        }
        values.add(SelectAmountDialog.amounts[index]);
      } else {
        if (available === defaultAmount) {
          defaultIndex = index;
        }
        values.add(available);
        break;
      }
    }
    if (defaultAmount > 0 && defaultIndex < 0) {
      for (let index = 0; index < values.size(); index++) {
        if (defaultAmount < values.get(index)) {
          values.add(index, defaultAmount);
          defaultIndex = index;
          break;
        }
      }
    }
    this.comboBox = new JComboBox()._JComboBox$ObjectArr($J.toArrayInto(values.toArray(), $J.newArray(0, null)));
    this.comboBox.setEditable(true);
    if (defaultIndex >= 0) {
      this.comboBox.setSelectedIndex(defaultIndex);
    }
    this.comboBox.setInputVerifier(new (SelectAmountDialog$1())().$o(this)._InputVerifier());
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    panel.add$Component(question);
    panel.add$Component$Object(this.comboBox, 'wrap 20, growx');
    panel.setSize$Dimension(panel.getPreferredSize$());
    this.initializeInputDialog(frame, true, panel, null, 'ok', 'cancel');
    return this;
  }
  /**
   * Verify the contents of the JComboBox.
   *
   * @param box The {@code JComboBox} to verify.
   * @return True if all is well.
   */
  verifyWholeBox(box: JComboBox<number>): boolean {
    let n = box.getItemCount();
    for (let i = 0; i < n; i++) {
      let v = box.getItemAt(i);
      if (v < 0 || v > this.available_) {
        return false;
      }
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  getInputValue(): number {
    let value = this.comboBox.getSelectedItem();
    return ($J.isa(value, Integer)) ? value : -1;
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.comboBox.requestFocus$();
  }
  static $clinit() {
    SelectAmountDialog.logger = Logger.getLogger($J.cls(SelectAmountDialog).getName());
    SelectAmountDialog.amounts = [20, 40, 50, 60, 80, 100];
  }
}

let $SelectAmountDialog$1: any = null;
/** An anonymous class (SelectAmountDialog.java:111). */
function SelectAmountDialog$1(): any {
  return $SelectAmountDialog$1 ??= $J.local(class extends InputVerifier {
    verify(input: JComponent): boolean {
      return this.$outer.verifyWholeBox(input);
    }
  }, 'net.sf.freecol.client.gui.dialog.SelectAmountDialog$1', []);
}

$J.define(SelectAmountDialog, 'net.sf.freecol.client.gui.dialog.SelectAmountDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColInputDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.GoodsType,int,int,boolean': '_SelectAmountDialog' }, returns: { 'getInputValue': 'java.lang.Integer' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger', 'amounts'] });
$J.module(() => {
  InputVerifier = $J.load('javax.swing.InputVerifier');
  JComboBox = $J.load('javax.swing.JComboBox');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
