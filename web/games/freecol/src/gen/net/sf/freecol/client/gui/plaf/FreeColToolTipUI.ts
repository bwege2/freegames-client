// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColToolTipUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AttributedString, JString, LineBreakMeasurer, Pattern } from '../../../../../../../jre/index.ts';
import { BasicToolTipUI } from '../../../../../../javax/swing/plaf/basic/BasicToolTipUI.ts';

let Color, Dimension, FontRenderContext, TextAttribute, ImageLibrary, ImageUtils;

/**
 * Draw the "image.background.FreeColToolTip" resource as a tiled background
 * image on tool tip popups.
 */
export class FreeColToolTipUI extends BasicToolTipUI {
  static sharedInstance: FreeColToolTipUI = null;
  static frc: FontRenderContext = null;
  static readonly margin: number = 5;
  static maximumWidth: number = 0;
  static fontSize: number = 0;
  static readonly LEADING: number = 5;
  static lineBreak: Pattern = null;
  _FreeColToolTipUI(): this {
    this._BasicToolTipUI();
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return FreeColToolTipUI.sharedInstance;
  }
  static setFontScaling(fontScaleFactor: number): void {
    FreeColToolTipUI.maximumWidth = $J.d2i((Math.fround(300 * fontScaleFactor)));
    FreeColToolTipUI.fontSize = $J.d2i((Math.fround(11 * fontScaleFactor)));
  }
  paint(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getToolTipBackground(), g, c, null);
    }
    g.setColor(Color.BLACK);
    let graphics = g;
    let x = Math.fround(FreeColToolTipUI.margin);
    let y = Math.fround(FreeColToolTipUI.margin);
    for (let line of FreeColToolTipUI.lineBreak.split((c).getTipText())) {
      if ((line.length === 0)) {
        y = Math.fround(y + FreeColToolTipUI.LEADING);
        continue;
      }
      let attributedString = new AttributedString(line);
      attributedString.addAttribute(TextAttribute.SIZE, FreeColToolTipUI.fontSize);
      let styledText = attributedString.getIterator();
      let measurer = new LineBreakMeasurer(styledText, FreeColToolTipUI.frc);
      while (measurer.getPosition() < styledText.getEndIndex()) {
        let layout = measurer.nextLayout(Math.fround(FreeColToolTipUI.maximumWidth));
        y = Math.fround(y + (layout.getAscent()));
        let dx = layout.isLeftToRight() ? 0 : (Math.fround(FreeColToolTipUI.maximumWidth - layout.getAdvance()));
        layout.draw(graphics, Math.fround(x + dx), y);
        y = Math.fround(y + Math.fround(layout.getDescent() + layout.getLeading()));
      }
    }
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let tipText = (c).getTipText();
    if (tipText == null || (tipText.length === 0)) {
      return new Dimension()._Dimension$int$int(0, 0);
    }
    let x = 0;
    let y = 0;
    for (let line of FreeColToolTipUI.lineBreak.split(tipText)) {
      if ((line.length === 0)) {
        y = Math.fround(y + FreeColToolTipUI.LEADING);
        continue;
      }
      let attributedString = new AttributedString(line);
      attributedString.addAttribute(TextAttribute.SIZE, FreeColToolTipUI.fontSize);
      let styledText = attributedString.getIterator();
      let measurer = new LineBreakMeasurer(styledText, FreeColToolTipUI.frc);
      while (measurer.getPosition() < styledText.getEndIndex()) {
        let layout = measurer.nextLayout(Math.fround(FreeColToolTipUI.maximumWidth));
        x = Math.max(x, layout.getVisibleAdvance());
        y = Math.fround(y + Math.fround(Math.fround(layout.getAscent() + layout.getDescent()) + layout.getLeading()));
      }
    }
    return new Dimension()._Dimension$int$int($J.d2i((Math.fround(x + Math.imul(2, FreeColToolTipUI.margin)))), $J.d2i((Math.fround(y + Math.imul(2, FreeColToolTipUI.margin)))));
  }
  getMinimumSize(c: JComponent): Dimension {
    return this.getPreferredSize$JComponent(c);
  }
  getMaximumSize(c: JComponent): Dimension {
    return this.getPreferredSize$JComponent(c);
  }
  static $clinit() {
    FreeColToolTipUI.sharedInstance = new FreeColToolTipUI()._FreeColToolTipUI();
    FreeColToolTipUI.frc = new FontRenderContext()._FontRenderContext$AffineTransform$boolean$boolean(null, true, false);
    FreeColToolTipUI.maximumWidth = 300;
    FreeColToolTipUI.fontSize = 11;
    FreeColToolTipUI.lineBreak = Pattern.compile('\n');
  }
}

$J.define(FreeColToolTipUI, 'net.sf.freecol.client.gui.plaf.FreeColToolTipUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicToolTipUI', ctors: { '': '_FreeColToolTipUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['sharedInstance', 'frc', 'maximumWidth', 'fontSize', 'lineBreak'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  FontRenderContext = $J.load('java.awt.font.FontRenderContext');
  TextAttribute = $J.load('java.awt.font.TextAttribute');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
