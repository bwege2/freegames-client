// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/FreeColProgressBar.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString, StringBuilder } from '../../../../../../../jre/index.ts';
import { JPanel } from '../../../../../../javax/swing/JPanel.ts';

let Color, Dimension, RenderingHints, FontLibrary, ImageLibrary, Utility, Messages, StringTemplate, ImageUtils;

/**
 * Implements a simple progress bar suitable for use with
 * FreeCol. Unlike JProgressBar, it also displays the expected
 * increase next turn as well as the estimated time until completion.
 * Used in the colony panel for the building progress.
 */
export class FreeColProgressBar extends JPanel {
  /**
   * The minimum value of the progress bar.
   */
  min: number = 0;
  /**
   * The maximum value of the progress bar.
   */
  max_: number = 0;
  /**
   * The current value of the progress bar.
   */
  value_: number = 0;
  /**
   * The expected increase next turn.
   */
  step_: number = 0;
  /**
   * The type of goods this progress bar is for.  The default value
   * of null indicates no goods type.
   */
  goodsType: GoodsType = null;
  /**
   * An image for the goods type.
   */
  image: Image = null;
  /**
   * The font to use in the progress bar.
   */
  font$FreeColProgressBar: Font = null;
  $init_FreeColProgressBar() {
    this.min = 0;
    this.max_ = 100;
    this.value_ = 0;
    this.step_ = 0;
  }
  /**
   * Creates a new {@code FreeColProgressBar} instance.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param goodsType the type of goods produced
   */
  _FreeColProgressBar$FreeColClient$GoodsType(freeColClient: FreeColClient, goodsType: GoodsType): this {
    this._FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(freeColClient, goodsType, 0, 100, 0, 0);
    return this;
  }
  /**
   * Creates a new {@code FreeColProgressBar} instance.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param goodsType the type of goods produced
   * @param min the minimum value of the progress bar
   * @param max the maximum value of the progress bar
   */
  _FreeColProgressBar$FreeColClient$GoodsType$int$int(freeColClient: FreeColClient, goodsType: GoodsType, min: number, max: number): this {
    this._FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(freeColClient, goodsType, min, max, 0, 0);
    return this;
  }
  /**
   * Creates a new {@code FreeColProgressBar} instance.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param goodsType the type of goods produced
   * @param min the minimum value of the progress bar
   * @param max the maximum value of the progress bar
   * @param value the current value of the progress bar
   * @param step the expected increase next turn
   */
  _FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(freeColClient: FreeColClient, goodsType: GoodsType, min: number, max: number, value: number, step: number): this {
    this._JPanel$();
    this.$init_FreeColProgressBar();
    let lib = freeColClient.getGUI().getFixedImageLibrary();
    let iconHeight = $J.d2i((Math.fround(Math.fround(ImageLibrary.ICON_SIZE.height_ * lib.getScaleFactor()) / 2)));
    this.min = min;
    this.max_ = max;
    this.value_ = value;
    this.step_ = step;
    this.goodsType = goodsType;
    this.image = (goodsType == null) ? null : (lib.getGoodsTypeImage(goodsType, new Dimension()._Dimension$int$int(-1, iconHeight)));
    let font = FontLibrary.getScaledFont$String('simple-plain-tiny');
    let maxFontSize = lib.scaleInt(17);
    if (font.getSize() > maxFontSize) {
      font = font.deriveFont$float(Math.fround(maxFontSize));
    }
    this.font$FreeColProgressBar = font;
    let padding = $J.d2i((Math.fround(5 * lib.getScaleFactor())));
    let width = $J.d2i((Math.fround(200 * lib.getScaleFactor())));
    this.setBorder(Utility.PROGRESS_BORDER);
    this.setPreferredSize(new Dimension()._Dimension$int$int(width, (iconHeight + padding) | 0));
    return this;
  }
  /**
   * Update the data of the progress bar.
   *
   * @param value the current value of the progress bar
   * @param step the expected increase next turn
   */
  update$int$int(value: number, step: number): void {
    this.update$int$int$int$int$FreeColProgressBar(this.min, this.max_, value, step);
  }
  /**
   * Update the data of the progress bar.
   *
   * @param min the minimum value of the progress bar
   * @param max the maximum value of the progress bar
   * @param value the current value of the progress bar
   * @param step the expected increase next turn
   */
  update$int$int$int$int$FreeColProgressBar(min: number, max: number, value: number, step: number): void {
    this.min = min;
    this.max_ = max;
    this.value_ = value;
    this.step_ = step;
    this.repaint$();
  }
  /**
   * Render the FreeColProgressBar
   *
   * @param g The instance of the Graphics Library FreeCol is using
   */
  paintComponent(g: Graphics): void {
    let g2d = g.create$();
    g2d.setFont(this.font$FreeColProgressBar);
    let width = (this.getWidth() - this.getInsets$().left - this.getInsets$().right) | 0;
    let height = (this.getHeight() - this.getInsets$().top - this.getInsets$().bottom) | 0;
    if (this.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getProgressBarBackground(), g, this, this.getInsets$());
    }
    let dvalue = 0;
    if (this.value_ >= this.max_) {
      dvalue = width;
    } else if (this.max_ > 0) {
      dvalue = $J.idiv((Math.imul(width, this.value_)), this.max_);
    }
    if (dvalue > 0) {
      if (dvalue > width) {
        dvalue = width;
      }
      g2d.setColor(new Color()._Color$int$int$int$int(0, 0, 0, 70));
      g2d.fillRect(this.getInsets$().left, this.getInsets$().top, dvalue, height);
    }
    let dstep = 0;
    if (this.max_ > 0) {
      dstep = $J.idiv((Math.imul(width, this.step_)), this.max_);
      if (dstep > 0) {
        if (((dstep + dvalue) | 0) > width) {
          dstep = (width - dvalue) | 0;
        }
        g2d.setColor(new Color()._Color$int$int$int$int(0, 0, 0, 40));
        g2d.fillRect((this.getInsets$().left + dvalue) | 0, this.getInsets$().top, dstep, height);
      }
    }
    let stepSignal = (this.step_ < 0) ? '-' : '+';
    let progress = new StringBuilder(32);
    progress.append(String(this.value_)).append(stepSignal).append(String(Math.abs(this.step_))).append(String.fromCharCode(47 /* \u002f */)).append(String(this.max_));
    let turnsString: string;
    if (this.max_ <= this.value_) {
      turnsString = '0';
    } else if (this.step_ > 0) {
      let turns = $J.idiv(((this.max_ - this.value_) | 0), this.step_);
      if ((((this.max_ - this.value_) | 0) % this.step_) > 0) {
        turns++;
      }
      turnsString = String(turns);
    } else {
      turnsString = Messages.message$String('notApplicable');
    }
    let t = StringTemplate.template$String('freeColProgressBar.turnsToComplete').addName$String$String('%number%', turnsString);
    progress.append(String.fromCharCode(32 /* ' ' */)).append(Messages.message$StringTemplate(t));
    let stringWidth = g2d.getFontMetrics$().stringWidth(progress.toString());
    let stringHeight = (g2d.getFontMetrics$().getAscent() + g2d.getFontMetrics$().getDescent()) | 0;
    let restWidth = (this.getWidth() - stringWidth) | 0;
    let iconWidth = 0;
    let iconHeight = 0;
    if (this.image != null) {
      iconWidth = this.image.getWidth$ImageObserver(this);
      iconHeight = this.image.getHeight$ImageObserver(this);
      restWidth = (restWidth - Math.imul(iconWidth, 2)) | 0;
      g2d.drawImage$Image$int$int$ImageObserver(this.image, $J.idiv(restWidth, 2), $J.idiv(((this.getHeight() - iconHeight) | 0), 2), null);
    }
    g2d.setColor(Color.BLACK);
    g2d.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
    g2d.drawString$String$int$int(progress.toString(), ($J.idiv(((restWidth - iconWidth) | 0), 2) + Math.imul(iconWidth, 2)) | 0, ($J.idiv(this.getHeight(), 2) + $J.idiv(stringHeight, 4)) | 0);
    g2d.dispose();
  }
}

$J.define(FreeColProgressBar, 'net.sf.freecol.client.gui.panel.FreeColProgressBar', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.GoodsType,int,int,int,int': '_FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.GoodsType,int,int': '_FreeColProgressBar$FreeColClient$GoodsType$int$int', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.GoodsType': '_FreeColProgressBar$FreeColClient$GoodsType' }, meths: { 'update(int,int,int,int)': 'update$int$int$int$int$FreeColProgressBar', 'update(int,int)': 'update$int$int' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  RenderingHints = $J.load('java.awt.RenderingHints');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
