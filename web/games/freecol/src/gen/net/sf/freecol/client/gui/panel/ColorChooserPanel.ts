// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/ColorChooserPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, JColorChooser, MigLayout, Utility;

/**
 * This class represents a panel that holds a JColorChooser and OK
 * and cancel buttons.
 */
export class ColorChooserPanel extends FreeColPanel {
  colorChooser: JColorChooser = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The top level component that holds all
   *     other components.
   * @param l The ActionListener for the OK and cancel buttons.
   */
  _ColorChooserPanel(freeColClient: FreeColClient, l: ActionListener): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('', '', ''));
    this.colorChooser = new JColorChooser()._JColorChooser$();
    this.add$Component(this.colorChooser);
    this.add$Component$Object(this.okButton, 'newline 20, split 2, tag ok');
    this.okButton.addActionListener(l);
    let cancelButton = Utility.localizedButton$String('cancel');
    this.add$Component$Object(cancelButton, 'tag cancel');
    cancelButton.setActionCommand(FreeColPanel.CANCEL);
    cancelButton.addActionListener(l);
    this.setOpaque(true);
    this.setSize$Dimension(this.getPreferredSize$());
    this.setEscapeAction(new (ColorChooserPanel$1())().$o(this).$c(cancelButton)._AbstractAction$());
    return this;
  }
  getColor(): Color {
    return this.colorChooser.getColor();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
  }
}

let $ColorChooserPanel$1: any = null;
/** An anonymous class (ColorChooserPanel.java:69). */
function ColorChooserPanel$1(): any {
  return $ColorChooserPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$cv_cancelButton.doClick$();
    }
    $c($cancelButton): this {
      this.$cv_cancelButton = $cancelButton;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.ColorChooserPanel$1', []);
}

$J.define(ColorChooserPanel, 'net.sf.freecol.client.gui.panel.ColorChooserPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.awt.event.ActionListener': '_ColorChooserPanel' }, returns: { 'getColor': 'java.awt.Color' } });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JColorChooser = $J.load('javax.swing.JColorChooser');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
