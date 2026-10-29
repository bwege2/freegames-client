// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/ParametersDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let FlowLayout, JLabel, JPanel, JTextField, MigLayout, ChoiceItem, FreeColDialog$DialogType, Parameters, MigPanel, Messages;

/**
 * A dialog for editing parameters.
 */
export class ParametersDialog extends FreeColDialog {
  static readonly COLUMNS: number = 5;
  static readonly DEFAULT_distToLandFromHighSeas: number = 4;
  static readonly DEFAULT_maxDistanceToEdge: number = 12;
  inputD: JTextField = null;
  inputM: JTextField = null;
  /**
   * Create a new parameters dialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   */
  _ParametersDialog(freeColClient: FreeColClient, frame: JFrame): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('wrap 1, center'));
    let widthPanel = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$());
    let heightPanel = new JPanel()._JPanel$LayoutManager(new FlowLayout()._FlowLayout$());
    let str: string;
    str = String(ParametersDialog.DEFAULT_distToLandFromHighSeas);
    this.inputD = new JTextField()._JTextField$String$int(str, ParametersDialog.COLUMNS);
    str = String(ParametersDialog.DEFAULT_maxDistanceToEdge);
    this.inputM = new JTextField()._JTextField$String$int(str, ParametersDialog.COLUMNS);
    str = Messages.message$String('parametersDialog.determineHighSeas.distToLandFromHighSeas');
    let widthLabel = new JLabel()._JLabel$String(str);
    widthLabel.setLabelFor(this.inputD);
    str = Messages.message$String('parametersDialog.determineHighSeas.maxDistanceToEdge');
    let heightLabel = new JLabel()._JLabel$String(str);
    heightLabel.setLabelFor(this.inputM);
    widthPanel.setOpaque(false);
    widthPanel.add$Component(widthLabel);
    widthPanel.add$Component(this.inputD);
    heightPanel.setOpaque(false);
    heightPanel.add$Component(heightLabel);
    heightPanel.add$Component(this.inputM);
    panel.add$Component(widthPanel);
    panel.add$Component(heightPanel);
    panel.setSize$Dimension(panel.getPreferredSize$());
    let al = (ae) => {
      this.checkFields();
    };
    this.inputD.addActionListener(al);
    this.inputM.addActionListener(al);
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
      let d = $J.parseInt(this.inputD.getText$());
      if (d <= 0) {
        throw new NumberFormatException();
      }
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
        this.inputD.setText(String(ParametersDialog.DEFAULT_distToLandFromHighSeas));
      } else {
        throw $e0;
      }
    }
    try {
      let m = $J.parseInt(this.inputM.getText$());
      if (m <= 0) {
        throw new NumberFormatException();
      }
    } catch ($e1) {
      if ($J.isa($e1, NumberFormatException)) {
        let nfe = $J.exc($e1);
        this.inputM.setText(String(ParametersDialog.DEFAULT_maxDistanceToEdge));
      } else {
        throw $e1;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): Parameters {
    let value = this.getValue();
    if (this.options.get(0).equals(value)) {
      this.checkFields();
      return new Parameters()._Parameters($J.parseInt(this.inputD.getText$()), $J.parseInt(this.inputM.getText$()));
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.inputD.requestFocus$();
  }
}

$J.define(ParametersDialog, 'net.sf.freecol.client.gui.dialog.ParametersDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame': '_ParametersDialog' }, returns: { 'getResponse': 'net.sf.freecol.client.gui.dialog.Parameters' }, meths: { 'requestFocus()': 'requestFocus$' } });
$J.module(() => {
  FlowLayout = $J.load('java.awt.FlowLayout');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  JTextField = $J.load('javax.swing.JTextField');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  Parameters = $J.load('net.sf.freecol.client.gui.dialog.Parameters');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
