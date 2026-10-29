// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/ProductionLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, BufferedImage, JString, Logger } from '../../../../../../../jre/index.ts';
import { AbstractGoodsLabel } from './AbstractGoodsLabel.ts';

let Color, Dimension, ImageIcon, FreeCol, ClientOptions, Messages;

/**
 * The ProductionLabel represents Goods that are produced in a
 * WorkLocation or Settlement. It is similar to the GoodsLabel.
 */
export class ProductionLabel extends AbstractGoodsLabel {
  static logger: Logger = null;
  /**
   * The maximum number of goodsIcons to display.
   */
  maxIcons: number = 0;
  /**
   * Whether to display positive integers with a "+" sign.
   */
  drawPlus: boolean = false;
  /**
   * The goodsIcon for this type of production.
   */
  goodsIcon: ImageIcon = null;
  /**
   * The image to display.
   */
  stringImage: Image = null;
  $init_ProductionLabel() {
    this.maxIcons = 7;
  }
  /**
   * Creates a new production label.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param ag The {@code AbstractGoods} to create a label for.
   */
  _ProductionLabel$FreeColClient$AbstractGoods(freeColClient: FreeColClient, ag: AbstractGoods): this {
    this._ProductionLabel$FreeColClient$AbstractGoods$int(freeColClient, ag, -1);
    return this;
  }
  /**
   * Creates a new production label.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param ag The {@code AbstractGoods} to create a label for.
   * @param maximumProduction The maximum production.
   */
  _ProductionLabel$FreeColClient$AbstractGoods$int(freeColClient: FreeColClient, ag: AbstractGoods, maximumProduction: number): this {
    this._ProductionLabel$FreeColClient$AbstractGoods$int$int$boolean(freeColClient, ag, maximumProduction, 0, false);
    return this;
  }
  /**
   * Creates a new production label.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param ag The {@code AbstractGoods} to create a label for.
   * @param maximumProduction The maximum production.
   * @param stockNumber The lower bound on number of items to display.
   * @param showStockAmount Should the stockNumber be part of the label
   */
  _ProductionLabel$FreeColClient$AbstractGoods$int$int$boolean(freeColClient: FreeColClient, ag: AbstractGoods, maximumProduction: number, stockNumber: number, showStockAmount: boolean): this {
    this._AbstractGoodsLabel(freeColClient, ag);
    this.$init_ProductionLabel();
    let lib = this.getImageLibrary();
    if (this.getType() == null) {
      FreeCol.trace(ProductionLabel.logger, 'Bad production label (no type)');
    } else if (stockNumber < 0 && this.getAmount() === 0) {
      FreeCol.trace(ProductionLabel.logger, 'Bad production label: ' + $J.str(ag) + ' stock=' + stockNumber);
    }
    let options = freeColClient.getClientOptions();
    let horses = freeColClient.getGame().getSpecification().getGoodsType('model.goods.horses');
    this.maxIcons = (ag.getType() === horses) ? 1 : options.getInteger(ClientOptions.MAX_NUMBER_OF_GOODS_IMAGES);
    this.goodsIcon = (ag.getType() == null) ? null : new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(ag.getType()));
    this.setFont(lib.getScaledFont('simple-bold-tiny', null));
    this.setForeground((this.getAmount() < 0) ? Color.RED : Color.WHITE);
    this.setToolTipText((this.getType() == null || this.getAmount() === 0) ? null : Messages.message$StringTemplate(this.getAbstractGoods().getLabel$()));
    let amount = this.getAmount();
    let displayNumber = options.getInteger(ClientOptions.MIN_NUMBER_FOR_DISPLAYING_GOODS_COUNT);
    let showMax = amount > 0 && maximumProduction > amount;
    if (amount < 0 || amount >= displayNumber || amount > this.maxIcons || stockNumber > 0 || showMax) {
      let number$ = '';
      if (showStockAmount && stockNumber >= 0) {
        number$ = String(stockNumber);
        this.drawPlus = true;
      }
      if (amount >= 0 && this.drawPlus) {
        number$ += '+';
      }
      number$ += String(amount);
      if (showMax) {
        number$ += '/' + maximumProduction;
      }
      let dummy = new BufferedImage(1, 1, 2);
      let g = dummy.createGraphics();
      this.stringImage = lib.getStringImage(g, number$, this.getForeground(), this.getFont());
      g.dispose();
    } else {
      this.stringImage = null;
    }
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  paintComponent(g: Graphics): void {
    let actualWidth = this.getWidth();
    let drawImageCount = this.numberOfGoodsIconsToDisplay();
    let pixelsPerIcon = this.determinePixelsPerIcon();
    let goodsImagesWidth = (Math.imul(pixelsPerIcon, ((drawImageCount - 1) | 0)) + this.goodsIcon.getIconWidth()) | 0;
    let leftOffset = (goodsImagesWidth < actualWidth) ? $J.idiv(((actualWidth - goodsImagesWidth) | 0), 2) : 0;
    for (let i = 0; i < drawImageCount; i++) {
      this.goodsIcon.paintIcon(null, g, (leftOffset + Math.imul(i, pixelsPerIcon)) | 0, 0);
    }
    if (this.stringImage != null) {
      let textOffsetX = $J.idiv(((actualWidth - this.getProductionStringWidth()) | 0), 2);
      g.drawImage$Image$int$int$ImageObserver(this.stringImage, textOffsetX, $J.idiv(((this.goodsIcon.getIconHeight() - this.stringImage.getHeight$ImageObserver(null)) | 0), 2), null);
    }
  }
  determinePixelsPerIcon(): number {
    if (this.goodsIcon == null) {
      return 0;
    }
    let amount = Math.max(1, Math.abs(this.getAmount()));
    if (amount <= this.maxIcons) {
      return $J.idiv(this.goodsIcon.getIconWidth(), amount);
    } else {
      return $J.idiv(this.goodsIcon.getIconWidth(), 16);
    }
  }
  getMinimumSize$(): Dimension {
    return this.getPreferredSize$();
  }
  /**
   * {@inheritDoc}
   */
  getPreferredSize$(): Dimension {
    let drawImageCount = this.numberOfGoodsIconsToDisplay();
    let iconWidth = (this.goodsIcon) != null ? this.goodsIcon.getIconWidth() : 0;
    let pixelsPerIcon = this.determinePixelsPerIcon();
    let width = Math.max(this.getProductionStringWidth(), (Math.imul(pixelsPerIcon, ((drawImageCount - 1) | 0)) + iconWidth) | 0);
    let height = this.goodsIcon.getImage().getHeight$ImageObserver(null);
    return new Dimension()._Dimension$int$int(width, height);
  }
  numberOfGoodsIconsToDisplay(): number {
    return Math.max(1, Math.min(Math.abs(this.getAmount()), this.maxIcons));
  }
  getProductionStringWidth(): number {
    return (this.stringImage == null) ? 0 : this.stringImage.getWidth$ImageObserver(null);
  }
  static $clinit() {
    ProductionLabel.logger = Logger.getLogger($J.cls(ProductionLabel).getName());
  }
}

$J.define(ProductionLabel, 'net.sf.freecol.client.gui.label.ProductionLabel', { kind: 'class', sup: 'net.sf.freecol.client.gui.label.AbstractGoodsLabel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.AbstractGoods,int,int,boolean': '_ProductionLabel$FreeColClient$AbstractGoods$int$int$boolean', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.AbstractGoods,int': '_ProductionLabel$FreeColClient$AbstractGoods$int', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.AbstractGoods': '_ProductionLabel$FreeColClient$AbstractGoods' }, returns: { 'getProductionStringWidth': 'int', 'getPreferredSize$': 'java.awt.Dimension', 'getMinimumSize$': 'java.awt.Dimension' }, meths: { 'getPreferredSize()': 'getPreferredSize$', 'getMinimumSize()': 'getMinimumSize$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ClientOptions = $J.load('net.sf.freecol.client.ClientOptions');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
});
