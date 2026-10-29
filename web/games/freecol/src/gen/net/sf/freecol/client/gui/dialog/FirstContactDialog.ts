// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/FirstContactDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let ImageIcon, JLabel, SwingConstants, MigLayout, ImageLibrary, MigPanel, Utility, Messages, StringTemplate;

/**
 * Dialog to display on first contact with a native player.
 */
export class FirstContactDialog extends FreeColConfirmDialog {
  static readonly BASE_KEY: string = 'firstContactDialog.meeting.';
  static readonly NATIVES: string = 'natives';
  static readonly TUTORIAL_KEY: string = 'firstContactDialog.meeting.natives.tutorial';
  /**
   * Create an FirstContactDialog.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param player The {@code Player} making contact.
   * @param other The {@code Player} to contact.
   * @param tile An optional {@code Tile} on offer.
   * @param settlementCount The number of settlements the other
   *     player has.
   */
  _FirstContactDialog(freeColClient: FreeColClient, frame: JFrame, player: Player, other: Player, tile: Tile, settlementCount: number): this {
    this._FreeColConfirmDialog$FreeColClient$JFrame(freeColClient, frame);
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1', '[center]', '[]20'));
    panel.setOpaque(false);
    let headerKey = FirstContactDialog.BASE_KEY + other.getNation().getSuffix$();
    if (!Messages.containsKey(headerKey)) {
      headerKey = FirstContactDialog.BASE_KEY + FirstContactDialog.NATIVES;
    }
    let header = Utility.localizedHeaderLabel$String$int$String(headerKey, SwingConstants.LEADING, Utility.FONTSPEC_SUBTITLE);
    let image = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(ImageLibrary.getMeetingImage(other)));
    image.setOpaque(false);
    let tutorial = null;
    if (!player.hasContactedIndians() && freeColClient.tutorialMode()) {
      tutorial = Utility.localizedTextArea$String(FirstContactDialog.TUTORIAL_KEY);
    }
    let messageId = (tile != null) ? 'firstContactDialog.welcomeOffer.text' : 'firstContactDialog.welcomeSimple.text';
    let type$ = (other.getNationType()).getSettlementTypeKey(true);
    let text = Utility.localizedTextArea$StringTemplate(StringTemplate.template$String(messageId).addStringTemplate$String$StringTemplate('%nation%', other.getNationLabel()).addName$String$String('%camps%', String(settlementCount)).add$String$String('%settlementType%', type$));
    let columns = $J.d2i(Math.floor(text.getColumns() * image.getPreferredSize$().getWidth() / text.getPreferredSize$().getWidth()));
    text.setColumns(columns);
    text.setSize$Dimension(text.getPreferredSize$());
    if (tutorial != null) {
      tutorial.setColumns(columns);
      tutorial.setSize$Dimension(tutorial.getPreferredSize$());
    }
    panel.add$Component(header);
    panel.add$Component(image);
    if (tutorial != null) {
      panel.add$Component(tutorial);
    }
    panel.add$Component(text);
    panel.setSize$Dimension(panel.getPreferredSize$());
    let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledNationImage(other.getNation()));
    this.initializeConfirmDialog(frame, false, panel, icon, 'yes', 'no');
    return this;
  }
}

$J.define(FirstContactDialog, 'net.sf.freecol.client.gui.dialog.FirstContactDialog', { kind: 'class', sup: 'net.sf.freecol.client.gui.dialog.FreeColConfirmDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Player,net.sf.freecol.common.model.Tile,int': '_FirstContactDialog' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
});
