// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/GrayLayer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { JComponent } from '../../../../../javax/swing/JComponent.ts';

let Color, Font, Rectangle, ImageIcon, ClientOptions, InfoPanel, Messages;

/**
 * Custom component to paint turn progress.
 * <p>
 * Currently the component darken out background using alpha channel and
 * then paints the player's icon and wait message.
 */
export class GrayLayer extends JComponent {
  /**
   * Color for graying out background component
   */
  static MASK_COLOR: Color = null;
  /**
   * Default font size for message text
   */
  static readonly DEFAULT_FONT_SIZE: number = 18;
  /**
   * Font size decrement for message text to reduce length
   */
  static readonly FONT_SIZE_DECREMENT: number = 2;
  /**
   * Maximum text width to show.  This is additional constraint to
   * the component's bounds
   */
  static readonly MAX_TEXT_WIDTH: number = 640;
  /**
   * The client for this FreeCol game
   */
  freeColClient: FreeColClient = null;
  /**
   * Player object or {@code null}
   */
  player: Player = null;
  /**
   * Create a gray layer.
   *
   * @param freeColClient The client for the game.
   */
  _GrayLayer(freeColClient: FreeColClient): this {
    this._JComponent();
    this.freeColClient = freeColClient;
    this.setOpaque(false);
    return this;
  }
  /**
   * Executes painting.  The method shadows the background image, and
   * paints the message with icon (if available) and text.
   *
   * @param g The {@code Graphics} to paint on.
   */
  paintComponent(g: Graphics): void {
    let clipArea = g.getClipBounds$();
    if (clipArea == null) {
      clipArea = this.getBounds$();
      clipArea.x_ = clipArea.y_ = 0;
    }
    if (clipArea.isEmpty()) {
      return;
    }
    if (!this.freeColClient.getClientOptions().getBoolean(ClientOptions.DISABLE_GRAY_LAYER)) {
      g.setColor(GrayLayer.MASK_COLOR);
      g.fillRect(clipArea.x_, clipArea.y_, clipArea.width_, clipArea.height_);
    }
    let coatOfArmsIcon = null;
    let message = null;
    let colour = null;
    if (this.player == null) {
      message = Messages.message$StringTemplate(this.freeColClient.getGame().getTurn().getLabel());
      colour = Color.WHITE;
    } else {
      let lib = this.freeColClient.getGUI().getFixedImageLibrary();
      coatOfArmsIcon = new ImageIcon()._ImageIcon$Image(lib.getNationImage$Nation$float(this.player.getNation(), 1));
      message = Messages.message$StringTemplate(this.player.getWaitingLabel());
      colour = this.player.getNationColor();
    }
    let nameFont = this.getFont();
    let textBounds: Rectangle;
    let fontSize = GrayLayer.DEFAULT_FONT_SIZE;
    let maxWidth = Math.min(GrayLayer.MAX_TEXT_WIDTH, this.getSize$().width_);
    do {
      nameFont = nameFont.deriveFont$int$float(Font.BOLD, Math.fround(fontSize));
      let nameFontMetrics = this.getFontMetrics(nameFont);
      textBounds = nameFontMetrics.getStringBounds$String$Graphics(message, g).getBounds();
      fontSize = (fontSize - GrayLayer.FONT_SIZE_DECREMENT) | 0;
    } while (textBounds.width_ > maxWidth);
    let size = this.getSize$();
    textBounds.x_ = $J.idiv(((size.width_ - textBounds.width_) | 0), 2);
    textBounds.y_ = (size.height_ - $J.d2i(InfoPanel.PREFERRED_SIZE.getHeight()) - Math.imul(2, textBounds.height_)) | 0;
    if (textBounds.intersects$Rectangle(clipArea)) {
      g.setFont(nameFont);
      g.setColor(colour);
      g.drawString$String$int$int(message, textBounds.x_, (textBounds.y_ + textBounds.height_) | 0);
    }
    if (coatOfArmsIcon != null) {
      let iconBounds = new Rectangle()._Rectangle$();
      iconBounds.width_ = coatOfArmsIcon.getIconWidth();
      iconBounds.height_ = coatOfArmsIcon.getIconHeight();
      iconBounds.x_ = $J.idiv(((size.width_ - iconBounds.width_) | 0), 2);
      iconBounds.y_ = (textBounds.y_ + $J.idiv(Math.imul(3, textBounds.height_), 2)) | 0;
      if (iconBounds.intersects$Rectangle(clipArea)) {
        coatOfArmsIcon.paintIcon(this, g, iconBounds.x_, iconBounds.y_);
      }
    }
  }
  /**
   * Set the player for which we paint.  If the player is already
   * set, then nothing happens, otherwise a repaint event is sent.
   *
   * @param player The {@code Player} for status information.
   */
  setPlayer(player: Player): void {
    if (this.player === player) {
      return;
    }
    this.player = player;
    this.repaint$();
  }
  static $clinit() {
    GrayLayer.MASK_COLOR = new Color()._Color$float$float$float$float(0, 0, 0, Math.fround(0.6));
  }
}

$J.define(GrayLayer, 'net.sf.freecol.client.gui.GrayLayer', { kind: 'class', sup: 'javax.swing.JComponent', ctors: { 'net.sf.freecol.client.FreeColClient': '_GrayLayer' }, clinit: true, lazy: ['MASK_COLOR'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Font = $J.load('java.awt.Font');
  Rectangle = $J.load('java.awt.Rectangle');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  InfoPanel = $J.load('net.sf.freecol.client.gui.panel.InfoPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
