// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/ScaleMapSizeDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, NumberFormatException } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';

let Dimension, FlowLayout, JPanel, JTextField, MigLayout, ChoiceItem, FreeColDialog$DialogType, MigPanel, Utility, Messages;

/**
 * A dialog to allow resizing of the map.
 */
export class ScaleMapSizeDialog extends FreeColDialog {
  static readonly COLUMNS: number = 5;
  oldMap: Map_ = null;
  inputWidth: JTextField = null;
  inputHeight: JTextField = null;
  /**
   * Create a ScaleMapSizeDialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _ScaleMapSizeDialog(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 1, center'));
    let widthPanel = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$());
    let heightPanel = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$());
    let str: string;
    this.oldMap = freeColClient.getGame().getMap();
    str = String(this.oldMap.getWidth());
    this.inputWidth = new JTextField()._JTextField$String$int(str, ScaleMapSizeDialog.COLUMNS);
    str = String(this.oldMap.getHeight());
    this.inputHeight = new JTextField()._JTextField$String$int(str, ScaleMapSizeDialog.COLUMNS);
    let widthLabel = Utility.localizedLabel$String('width');
    widthLabel.setLabelFor(this.inputWidth);
    let heightLabel = Utility.localizedLabel$String('height');
    heightLabel.setLabelFor(this.inputHeight);
    widthPanel.setOpaque(false);
    widthPanel.add$Component(widthLabel);
    widthPanel.add$Component(this.inputWidth);
    heightPanel.setOpaque(false);
    heightPanel.add$Component(heightLabel);
    heightPanel.add$Component(this.inputHeight);
    panel.add$Component(widthPanel);
    panel.add$Component(heightPanel);
    panel.setSize$Dimension(panel.getPreferredSize$());
    let al = (ae) => {
      this.checkFields();
    };
    this.inputWidth.addActionListener(al);
    this.inputHeight.addActionListener(al);
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('ok'), null).okOption());
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('cancel'), null).cancelOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, true, panel, null, c);
    return this;
  }
  /**
   * Force the text fields to contain non-negative integers.
   */
  checkFields(): void {
    try {
      let w = $J.parseInt(this.inputWidth.getText$());
      if (w <= 0) {
        throw new NumberFormatException();
      }
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
        this.inputWidth.setText(String(this.oldMap.getWidth()));
      } else {
        throw $e0;
      }
    }
    try {
      let h = $J.parseInt(this.inputHeight.getText$());
      if (h <= 0) {
        throw new NumberFormatException();
      }
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let nfe = $J.exc($e1);
        this.inputHeight.setText(String(this.oldMap.getHeight()));
      } else {
        throw $e1;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): Dimension {
    let value = this.getValue();
    if (this.options.get(0).equals(value)) {
      this.checkFields();
      return new Dimension()._Dimension$int$int($J.parseInt(this.inputWidth.getText$()), $J.parseInt(this.inputHeight.getText$()));
    }
    return null;
  }
  requestFocus$(): void {
    this.inputWidth.requestFocus$();
  }
}

$J.define(ScaleMapSizeDialog, 'net.sf.freecol.client.gui.dialog.ScaleMapSizeDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_ScaleMapSizeDialog' }, returns: { 'getResponse': 'java.awt.Dimension' }, meths: { 'requestFocus()': 'requestFocus$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  FlowLayout = $J.load('java.awt.FlowLayout');
  JPanel = $J.load('javax.swing.JPanel');
  JTextField = $J.load('javax.swing.JTextField');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
