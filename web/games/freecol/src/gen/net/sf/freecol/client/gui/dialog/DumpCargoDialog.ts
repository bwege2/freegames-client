// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/DumpCargoDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Logger } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';

let ImageIcon, JCheckBox, MigLayout, ChoiceItem, FreeColDialog$DialogType, MigPanel, Utility, Messages;

/**
 * This panel is used to handle dumping cargo.
 */
export class DumpCargoDialog extends FreeColDialog {
  static logger: Logger = null;
  /**
   * The list of goods to choose what to dump from.
   */
  goodsList: List<Goods> = null;
  /**
   * Check boxes corresponding to the goods list.
   */
  checkBoxes: List<JCheckBox> = null;
  /**
   * Creates a dialog for choosing cargo for a unit to dump.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param unit The {@code Unit} that is dumping cargo.
   */
  _DumpCargoDialog(freeColClient: FreeColClient, frame: JFrame, unit: Unit): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.goodsList = unit.getGoodsList();
    this.checkBoxes = new ArrayList(this.goodsList.size());
    for (const $it0 = this.goodsList.iterator(); $it0.hasNext(); ) {
      let goods = $it0.next();
      let checkBox = new JCheckBox()._JCheckBox$String$boolean(Messages.message$StringTemplate(goods.getLabel$boolean(true)), true);
      this.checkBoxes.add(checkBox);
    }
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '', ''));
    panel.add$Component(Utility.localizedHeader('dumpCargo', Utility.FONTSPEC_SUBTITLE));
    for (const $it1 = this.checkBoxes.iterator(); $it1.hasNext(); ) {
      let c = $it1.next();
      panel.add$Component(c);
    }
    panel.setSize$Dimension(panel.getPreferredSize$());
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('ok'), null).okOption().defaultOption());
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('cancel'), null).cancelOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, false, panel, new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledUnitImage$Unit(unit)), c);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): List<Goods> {
    let value = this.getValue();
    let gl = new ArrayList();
    if (this.options.get(0).equals(value)) {
      for (let i = 0; i < this.checkBoxes.size(); i++) {
        if (this.checkBoxes.get(i).isSelected()) {
          gl.add(this.goodsList.get(i));
        }
      }
    }
    return gl;
  }
  static $clinit() {
    DumpCargoDialog.logger = Logger.getLogger($J.cls(DumpCargoDialog).getName());
  }
}

$J.define(DumpCargoDialog, 'net.sf.freecol.client.gui.dialog.DumpCargoDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Unit': '_DumpCargoDialog' }, returns: { 'getResponse': 'java.util.List' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
