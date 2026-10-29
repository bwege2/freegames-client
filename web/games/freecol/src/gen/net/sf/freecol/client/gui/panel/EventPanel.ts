// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/EventPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JLabel, MigLayout, FontLibrary, Utility;

/**
 * This panel is displayed when an imporantant event in the game has happened.
 */
export class EventPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param header The title.
   * @param key A resource key for the image to display.
   * @param footer Optional footer text.
   */
  _EventPanel(freeColClient: FreeColClient, header: string, key: string, footer: string): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 1', '[center]', '[]20'));
    let headerLabel = new JLabel()._JLabel$String(header);
    headerLabel.setFont(FontLibrary.getScaledFont$String$String(Utility.FONTSPEC_TITLE, header));
    let imageLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledImage(key)));
    let footerLabel = (footer == null) ? null : new JLabel()._JLabel$String(footer);
    this.add$Component(headerLabel);
    this.add$Component(imageLabel);
    if (footerLabel != null) {
      this.add$Component(footerLabel);
    }
    this.add$Component$Object(this.okButton, 'tag ok');
    this.setEscapeAction(new (EventPanel$1())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  static $clinit() {
    EventPanel.logger = Logger.getLogger($J.cls(EventPanel).getName());
  }
}

let $EventPanel$1: any = null;
/** An anonymous class (EventPanel.java:68). */
function EventPanel$1(): any {
  return $EventPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.EventPanel$1', []);
}

$J.define(EventPanel, 'net.sf.freecol.client.gui.panel.EventPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String,java.lang.String,java.lang.String': '_EventPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
});
