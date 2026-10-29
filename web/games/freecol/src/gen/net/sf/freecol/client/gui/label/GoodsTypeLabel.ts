// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/GoodsTypeLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { FreeColLabel } from './FreeColLabel.ts';

let ImageIcon, Messages, Utils;

/**
 * This label represents a goods type.
 */
export class GoodsTypeLabel extends FreeColLabel {
  /**
   * The image library used for this label.
   */
  imageLibrary: ImageLibrary = null;
  /**
   * The goods type represented.
   */
  goodsType: GoodsType = null;
  /**
   * Initializes this label with the given goods type data.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param goodsType The {@code GoodsType} to represent.
   */
  _GoodsTypeLabel$FreeColClient$GoodsType(freeColClient: FreeColClient, goodsType: GoodsType): this {
    this._GoodsTypeLabel$ImageLibrary$GoodsType(freeColClient.getGUI().getFixedImageLibrary(), goodsType);
    return this;
  }
  _GoodsTypeLabel$GoodsTypeLabel(goodsTypeLabel: GoodsTypeLabel): this {
    this._GoodsTypeLabel$ImageLibrary$GoodsType(goodsTypeLabel.getImageLibrary(), goodsTypeLabel.getType());
    return this;
  }
  /**
   * Initializes this label with the given goods type data.
   *
   * @param imageLibrary The {@code ImageLibrary} to create the icon with.
   * @param goodsType The {@code GoodsType} to represent.
   */
  _GoodsTypeLabel$ImageLibrary$GoodsType(imageLibrary: ImageLibrary, goodsType: GoodsType): this {
    this._FreeColLabel$Icon(new ImageIcon()._ImageIcon$Image(imageLibrary.getScaledGoodsTypeImage(goodsType)));
    this.imageLibrary = imageLibrary;
    this.goodsType = goodsType;
    this.setToolTipText(Messages.getName$Named(goodsType));
    return this;
  }
  /**
   * Get the image library for this label.
   *
   * @return The {@code ImageLibrary}.
   */
  getImageLibrary(): ImageLibrary {
    return this.imageLibrary;
  }
  /**
   * Get the goods type of this label.
   *
   * @return The {@code GoodsType}.
   */
  getType(): GoodsType {
    return this.goodsType;
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof GoodsTypeLabel) {
      let other = o;
      return Utils.equals(this.goodsType, other.goodsType);
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + Utils.hashCode(this.goodsType)) | 0;
    return hash;
  }
}

$J.define(GoodsTypeLabel, 'net.sf.freecol.client.gui.label.GoodsTypeLabel', { kind: 'class', sup: 'net.sf.freecol.client.gui.label.FreeColLabel', ctors: { 'net.sf.freecol.client.gui.ImageLibrary,net.sf.freecol.common.model.GoodsType': '_GoodsTypeLabel$ImageLibrary$GoodsType', 'net.sf.freecol.client.gui.label.GoodsTypeLabel': '_GoodsTypeLabel$GoodsTypeLabel', 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.GoodsType': '_GoodsTypeLabel$FreeColClient$GoodsType' }, returns: { 'hashCode': 'int', 'getType': 'net.sf.freecol.common.model.GoodsType', 'getImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary' } });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
