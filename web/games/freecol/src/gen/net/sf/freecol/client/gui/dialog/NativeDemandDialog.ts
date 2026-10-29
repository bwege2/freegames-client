// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/NativeDemandDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColConfirmDialog } from './FreeColConfirmDialog.ts';

let ImageIcon, SwingConstants, MigLayout, MigPanel, Utility, Messages, StringTemplate;

/**
 * This panel is used to show native demands at a colony.
 */
export class NativeDemandDialog extends FreeColConfirmDialog {
  /**
   * Creates a dialog to handle native demands interactions.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param unit The demanding {@code Unit}.
   * @param colony The {@code Colony} being demanded of.
   * @param type The {@code GoodsType} demanded (may be null for gold).
   * @param amount The amount of goods demanded.
   */
  _NativeDemandDialog(freeColClient: FreeColClient, frame: JFrame, unit: Unit, colony: Colony, type$: GoodsType, amount: number): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    let nation = Messages.message$StringTemplate(unit.getOwner().getNationLabel());
    let template: StringTemplate;
    let yes: string;
    let no: string;
    if (type$ == null) {
      template = StringTemplate.template$String('indianDemand.gold.text').addName$String$String('%nation%', nation).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount);
      yes = 'accept';
      no = 'indianDemand.gold.no';
    } else if (type$.isFoodType()) {
      template = StringTemplate.template$String('indianDemand.food.text').addName$String$String('%nation%', nation).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount);
      yes = 'indianDemand.food.yes';
      no = 'indianDemand.food.no';
    } else {
      template = StringTemplate.template$String('indianDemand.other.text').addName$String$String('%nation%', nation).addName$String$String('%colony%', colony.getName()).addAmount('%amount%', amount).addNamed$String$Named('%goods%', type$);
      yes = 'accept';
      no = 'indianDemand.other.no';
    }
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 1, fill', '[400, align center]'));
    let t = StringTemplate.template$String('nativeDemandDialog.name').addName$String$String('%colony%', colony.getName());
    let header = Utility.localizedHeaderLabel$StringTemplate$int$String(t, SwingConstants.LEADING, Utility.FONTSPEC_TITLE);
    panel.add$Component(header);
    let text = Utility.localizedTextArea$StringTemplate(template);
    panel.add$Component(text);
    let lib = this.getImageLibrary();
    let icon = new ImageIcon()._ImageIcon$Image(lib.getSmallSettlementImage(colony));
    this.initializeConfirmDialog(frame, true, panel, icon, yes, no);
    return this;
  }
}

$J.define(NativeDemandDialog, 'net.sf.freecol.client.gui.dialog.NativeDemandDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Unit,net.sf.freecol.common.model.Colony,net.sf.freecol.common.model.GoodsType,int': '_NativeDemandDialog' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
