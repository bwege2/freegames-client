// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/RiverStyleDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColChoiceDialog } from './FreeColChoiceDialog.ts';

let ImageIcon, JPanel, ChoiceItem, FreeColDialog, Utility;

/**
 * A panel for adjusting the river style.
 *
 * This panel is only used when running in
 * {@link net.sf.freecol.client.FreeColClient#isMapEditor()} map editor mode.
 */
export class RiverStyleDialog extends FreeColChoiceDialog {
  static logger: Logger = null;
  /**
   * Creates a dialog to choose a river style.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param styles The river styles a choice is made from.
   */
  _RiverStyleDialog(freeColClient: FreeColClient, frame: JFrame, styles: List<string>): this {
    this._FreeColChoiceDialog$FreeColClient$JFrame(freeColClient, frame);
    let panel = new JPanel()._JPanel$();
    panel.add$Component$Object(Utility.localizedHeader('riverStyleDialog.text', Utility.FONTSPEC_TITLE), 'span, align center');
    let c = FreeColDialog.choices();
    for (const $it0 = styles.iterator(); $it0.hasNext(); ) {
      let style = $it0.next();
      c.add(new ChoiceItem()._ChoiceItem$String$Object(null, style).setIcon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallerRiverImage(style))));
    }
    this.initializeChoiceDialog(frame, true, panel, null, 'cancel', c);
    return this;
  }
  static $clinit() {
    RiverStyleDialog.logger = Logger.getLogger($J.cls(RiverStyleDialog).getName());
  }
}

$J.define(RiverStyleDialog, 'net.sf.freecol.client.gui.dialog.RiverStyleDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColChoiceDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,java.util.List': '_RiverStyleDialog' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JPanel = $J.load('javax.swing.JPanel');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
