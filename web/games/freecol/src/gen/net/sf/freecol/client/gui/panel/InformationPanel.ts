// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/InformationPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Dimension, AbstractAction, JLabel, JScrollPane, ScrollPaneConstants, MigLayout, MigPanel, Utility, Location, StringTemplate, Tile, Unit;

/**
 * A general panel for information display.
 *
 * Panel layout:
 * | ----------------------------|
 * |    skin image with person   |
 * | ----------------------------|
 * | images[i] | texts[i]        |
 * | ----------------------------|
 * |           | button (opt)    |
 * | ----------------------------|
 * |                    okButton |
 * | ----------------------------|
 *
 * Each group of images[i], texts[i] and the accompanying button (if
 * needed) is contained within an inner layout, wrapped in a layout
 * which contains the skin background image with the person at the top
 * as well as the okButton at the bottom.
 */
export class InformationPanel extends FreeColPanel {
  /**
   * The skin for this panel.
   */
  skin: BufferedImage = null;
  /**
   * Creates an information panel that shows the given
   * texts and images, and an "OK" button.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param texts The texts to be displayed in the panel.
   * @param fcos The source {@code FreeColObject}s for the text.
   * @param images The images to be displayed in the panel.
   */
  _InformationPanel(freeColClient: FreeColClient, texts: string[], fcos: FreeColObject[], images: ImageIcon[]): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$());
    this.skin = null;
    let fixedImageLibrary = freeColClient.getGUI().getFixedImageLibrary();
    this.skin = fixedImageLibrary.getInformationPanelSkin(freeColClient.getMyPlayer());
    let scaleFactor = fixedImageLibrary.getScaleFactor();
    let topInset = fixedImageLibrary.getInformationPanelSkinTopInset(freeColClient.getMyPlayer());
    let scaledTopInset = $J.d2i((Math.fround(topInset * scaleFactor)));
    let gap = 10;
    this.getMigLayout().setLayoutConstraints('fill, wrap 1, insets 0 0 0 0');
    this.getMigLayout().setColumnConstraints(gap + '[grow]' + gap);
    this.getMigLayout().setRowConstraints(scaledTopInset + 'px[grow]' + gap + '[]' + gap);
    let textPanel = this.createPanelWithAllContent(texts, fcos, images, gap);
    let scrollPane = new JScrollPane()._JScrollPane$Component$int$int(textPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_NEVER);
    scrollPane.getViewport().setOpaque(false);
    scrollPane.setBorder(null);
    this.add$Component$Object(scrollPane, 'grow');
    this.add$Component$Object(this.okButton, 'tag ok');
    this.setPreferredSize(new Dimension()._Dimension$int$int(this.skin.getWidth(), this.skin.getHeight()));
    this.setBorder(null);
    this.setEscapeAction(new (InformationPanel$1())().$o(this)._AbstractAction$());
    return this;
  }
  createPanelWithAllContent(texts: string[], fcos: FreeColObject[], images: ImageIcon[], gap: number): JPanel {
    let textPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('fill, wrap 2'));
    textPanel.setOpaque(false);
    for (let i = 0; i < texts.length; i++) {
      let txt = Utility.getDefaultTextArea$String(texts[i]);
      if (images[i] != null) {
        textPanel.add$Component(new JLabel()._JLabel$Icon(images[i]));
        textPanel.add$Component$Object(txt, 'gapleft ' + gap + ', growx');
      } else {
        textPanel.add$Component$Object(txt, 'skip, growx');
      }
      let disp = this.displayLabel(fcos[i]);
      if (disp != null) {
        let button = Utility.localizedButton$StringTemplate(StringTemplate.template$String('informationPanel.display').addStringTemplate$String$StringTemplate('%object%', disp));
        let fco = fcos[i];
        button.addActionListener((ae) => {
          this.getGUI().displayObject(fco);
        });
        if (((i + 1) | 0) < texts.length) {
          textPanel.add$Component$Object(button, 'skip, gapbottom 25');
        } else {
          textPanel.add$Component$Object(button, 'skip');
        }
      }
    }
    return textPanel;
  }
  /**
   * A label for an FCO that can meaningfully be displayed.
   *
   * @param fco The {@code FreeColObject} to check.
   * @return A {@code StringTemplate} label, or null if nothing found.
   */
  displayLabel(fco: FreeColObject): StringTemplate {
    return (fco instanceof Tile && (fco).hasSettlement()) ? this.displayLabel((fco).getSettlement()) : (fco instanceof Unit) ? this.displayLabel((fco).getLocation()) : ($J.isa(fco, Location)) ? (fco).getLocationLabelFor(this.getMyPlayer()) : null;
  }
  paintComponent(g: Graphics): void {
    g.drawImage$Image$int$int$ImageObserver(this.skin, 0, 0, this);
  }
}

let $InformationPanel$1: any = null;
/** An anonymous class (InformationPanel.java:107). */
function InformationPanel$1(): any {
  return $InformationPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.InformationPanel$1', []);
}

$J.define(InformationPanel, 'net.sf.freecol.client.gui.panel.InformationPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String[],net.sf.freecol.common.model.FreeColObject[],javax.swing.ImageIcon[]': '_InformationPanel' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JLabel = $J.load('javax.swing.JLabel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Location = $J.load('net.sf.freecol.common.model.Location');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Tile = $J.load('net.sf.freecol.common.model.Tile');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
});
