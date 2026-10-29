// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/ChooseFoundingFatherDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColDialog } from './FreeColDialog.ts';

let JButton, JTabbedPane, SwingConstants, MigLayout, ChoiceItem, FreeColDialog$DialogType, MigPanel, Utility, ColopediaPanel, FatherDetailPanel, Messages;

/**
 * This panel displays the different Founding Fathers the player can work
 * towards recruiting.
 *
 * @see FoundingFather
 */
export class ChooseFoundingFatherDialog extends FreeColDialog {
  static logger: Logger = null;
  tb: JTabbedPane = null;
  possibleFathers: List<FoundingFather> = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param possibleFoundingFathers The {@code FoundingFather}s
   *     which can be selected. The length of the array is the same
   *     as the number of {@code FoundingFather} categories and the
   *     values identifies a {@code FoundingFather} to be picked in
   *     each of those categories.
   */
  _ChooseFoundingFatherDialog(freeColClient: FreeColClient, frame: JFrame, possibleFoundingFathers: List<FoundingFather>): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.possibleFathers = possibleFoundingFathers;
    this.tb = new JTabbedPane()._JTabbedPane$int(SwingConstants.TOP);
    let helpButton = new JButton()._JButton$Action(freeColClient.getActionManager().getFreeColAction('colopediaAction.fathers'));
    helpButton.setText(Messages.message$String('help'));
    let details = new FatherDetailPanel()._FatherDetailPanel(freeColClient, new ColopediaPanel()._ColopediaPanel$FreeColClient(freeColClient));
    for (const $it0 = possibleFoundingFathers.iterator(); $it0.hasNext(); ) {
      let father = $it0.next();
      let jp = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$());
      details.buildDetail$FoundingFather$JPanel(father, jp);
      jp.validate();
      this.tb.addTab$String$Component(Messages.message$String(father.getTypeKey()), jp);
    }
    this.tb.setSelectedIndex(0);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 1', 'align center'));
    panel.add$Component(Utility.localizedHeader('chooseFoundingFatherDialog.title', Utility.FONTSPEC_TITLE));
    panel.add$Component$Object(helpButton, 'tag help');
    panel.add$Component$Object(this.tb, 'width 100%, height 400!');
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('ok'), null).okOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, false, panel, null, c);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): FoundingFather {
    let value = this.getValue();
    if (this.options.get(0).equals(value)) {
      return this.possibleFathers.get(this.tb.getSelectedIndex());
    }
    return null;
  }
  static $clinit() {
    ChooseFoundingFatherDialog.logger = Logger.getLogger($J.cls(ChooseFoundingFatherDialog).getName());
  }
}

$J.define(ChooseFoundingFatherDialog, 'net.sf.freecol.client.gui.dialog.ChooseFoundingFatherDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,java.util.List': '_ChooseFoundingFatherDialog' }, returns: { 'getResponse': 'net.sf.freecol.common.model.FoundingFather' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  JButton = $J.load('javax.swing.JButton');
  JTabbedPane = $J.load('javax.swing.JTabbedPane');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel');
  FatherDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.FatherDetailPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
