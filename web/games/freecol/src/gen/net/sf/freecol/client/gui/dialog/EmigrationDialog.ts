// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/EmigrationDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList } from '../../../../../../../jre/index.ts';
import { FreeColChoiceDialog } from './FreeColChoiceDialog.ts';

let ImageIcon, MigLayout, ChoiceItem, FreeColDialog, MigPanel, Utility, Messages, Europe$MigrationType, LostCityRumour$RumourType;

/**
 * The panel that allows a user to choose which unit will emigrate from Europe.
 */
export class EmigrationDialog extends FreeColChoiceDialog {
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param europe The {@code Europe} where we can find the
   *     units that are prepared to emigrate.
   * @param foy Is this emigration due to a fountain of youth?
   */
  _EmigrationDialog(freeColClient: FreeColClient, frame: JFrame, europe: Europe, foy: boolean): this {
    this._FreeColChoiceDialog$FreeColClient$JFrame(freeColClient, frame);
    let recruitables = new ArrayList(europe.getExpandedRecruitables(false));
    let header = Utility.localizedTextArea$String('emigrationDialog.chooseImmigrant');
    if (foy) {
      header.insert(Messages.message$String(LostCityRumour$RumourType.FOUNTAIN_OF_YOUTH.getDescriptionKey()) + '\n\n', 0);
    }
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '[fill]', ''));
    panel.add$Component$Object(header, 'wrap 20');
    panel.setSize$Dimension(panel.getPreferredSize$());
    let c = FreeColDialog.choices();
    let i = Europe$MigrationType.getDefaultSlot();
    let a0 = recruitables.removeAt(0);
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(a0.getSingleLabel()), i++).defaultOption().setIcon(new ImageIcon()._ImageIcon$Image(this.getSmallAbstractUnitImage(a0))));
    for (const $it0 = recruitables.iterator(); $it0.hasNext(); ) {
      let au = $it0.next();
      c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$StringTemplate(au.getSingleLabel()), i++).setIcon(new ImageIcon()._ImageIcon$Image(this.getSmallAbstractUnitImage(au))));
    }
    this.initializeChoiceDialog(frame, false, panel, null, null, c);
    return this;
  }
}

$J.define(EmigrationDialog, 'net.sf.freecol.client.gui.dialog.EmigrationDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColChoiceDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Europe,boolean': '_EmigrationDialog' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Europe$MigrationType = $J.load('net.sf.freecol.common.model.Europe$MigrationType');
  LostCityRumour$RumourType = $J.load('net.sf.freecol.common.model.LostCityRumour$RumourType');
});
