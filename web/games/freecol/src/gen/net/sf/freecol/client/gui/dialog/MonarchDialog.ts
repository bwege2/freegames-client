// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/MonarchDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalStateException } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';

let ImageIcon, SwingConstants, MigLayout, ChoiceItem, ImageLibrary, FreeColDialog$DialogType, MigPanel, Utility, Messages, Monarch$MonarchAction, StringTemplate;

/**
 * This panel is used to show monarch actions.
 *
 * Generally monarch actions require a choice to accept or reject, but
 * some do not.  Therefore the value of the dialog is boolean, but
 * there may not be a meaningful accept option in some cases.  This
 * prevents just extending FreeColConfirmDialog.
 */
export class MonarchDialog extends FreeColDialog {
  /**
   * Creates a dialog to handle monarch interactions.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param action The {@code MonarchAction} the monarch is performing.
   * @param template The {@code StringTemplate} describing the action.
   * @param monarchKey The resource key for the monarch image.
   */
  _MonarchDialog(freeColClient: FreeColClient, frame: JFrame, action: Monarch$MonarchAction, template: StringTemplate, monarchKey: string): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    let lib = this.getImageLibrary();
    let messageId = action.getTextKey();
    if (!Messages.containsKey(messageId)) {
      throw new IllegalStateException('Unrecognized monarch action: ' + $J.str(action));
    }
    let yesId = action.getYesKey();
    if (!Messages.containsKey(yesId)) {
      yesId = null;
    }
    let noId = action.getNoKey();
    if (!Messages.containsKey(noId)) {
      noId = 'close';
    }
    let hdrKey = action.getHeaderKey();
    if (!Messages.containsKey(hdrKey)) {
      hdrKey = 'monarchDialog.default';
    }
    let header = Utility.localizedHeaderLabel$String$int$String(hdrKey, SwingConstants.LEADING, Utility.FONTSPEC_SUBTITLE);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 2, insets 10', '[]20[]'));
    panel.add$Component$Object(header, 'span, align center, wrap 20');
    if (action === Monarch$MonarchAction.RAISE_TAX_ACT || action === Monarch$MonarchAction.RAISE_TAX_WAR) {
      let helpButton = Utility.localizedButton$String('help');
      helpButton.addActionListener((ae) => {
        this.getGUI().showColopediaPanel('colopedia.concepts.taxes');
      });
      panel.add$Component$Object(helpButton, 'tag help');
    }
    let text = (template == null) ? Utility.localizedTextArea$String$int(messageId, 30) : Utility.localizedTextArea$StringTemplate$int(StringTemplate.copy(messageId, template), 30);
    panel.add$Component(text);
    panel.setSize$Dimension(panel.getPreferredSize$());
    let c = FreeColDialog.choices();
    if (yesId != null) {
      c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(yesId), true).okOption());
    }
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String(noId), false).cancelOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, false, panel, new ImageIcon()._ImageIcon$Image(ImageLibrary.getMonarchImage$String(monarchKey)), c);
    return this;
  }
}

$J.define(MonarchDialog, 'net.sf.freecol.client.gui.dialog.MonarchDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Monarch$MonarchAction,net.sf.freecol.common.model.StringTemplate,java.lang.String': '_MonarchDialog' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Monarch$MonarchAction = $J.load('net.sf.freecol.common.model.Monarch$MonarchAction');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
