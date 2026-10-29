// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/label/AbstractGoodsLabel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JEnum } from '../../../../../../../jre/index.ts';
import { FreeColLabel } from './FreeColLabel.ts';

let ImageIcon, Messages, Utils;

/**
 * This label represents AbstractGoods.
 */
export class AbstractGoodsLabel extends FreeColLabel {
  lib: ImageLibrary = null;
  abstractGoods: AbstractGoods = null;
  amountType: AbstractGoodsLabel$AmountType = null;
  /**
   * Initializes this JLabel with the given goods data.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   * @param abstractGoods The {@code AbstractGoods} that this JLabel
   *     will visually represent.
   */
  _AbstractGoodsLabel(freeColClient: FreeColClient, abstractGoods: AbstractGoods): this {
    this._FreeColLabel$Icon(new ImageIcon()._ImageIcon$Image(freeColClient.getGUI().getFixedImageLibrary().getScaledGoodsTypeImage(abstractGoods.getType())));
    this.amountType = AbstractGoodsLabel$AmountType.DEFAULT;
    this.lib = freeColClient.getGUI().getFixedImageLibrary();
    this.abstractGoods = abstractGoods;
    this.setToolTipText(Messages.getName$Named(abstractGoods));
    return this;
  }
  /**
   * Get the image library for this label.
   *
   * @return The {@code ImageLibrary}.
   */
  getImageLibrary(): ImageLibrary {
    return this.lib;
  }
  /**
   * Sets the type of transfer being used on drag.
   * @param amountType
   */
  setAmountType(amountType: AbstractGoodsLabel$AmountType): void {
    this.amountType = (amountType == null) ? AbstractGoodsLabel$AmountType.DEFAULT : amountType;
  }
  /**
   * Has the SHIFT-ALT been pressed on drag?
   *
   * @return True if this label was dragged with SHIFT-ALT
   */
  isSuperFullChosen(): boolean {
    return this.amountType === AbstractGoodsLabel$AmountType.SUPER_FULL;
  }
  /**
   * Has a partial amount been selected?
   *
   * @return True if a partial amount has been selected.
   */
  isPartialChosen(): boolean {
    return this.amountType === AbstractGoodsLabel$AmountType.PARTIAL;
  }
  /**
   * Has full amount been selected?
   *
   * @return True if a full amount has been selected.
   */
  isFullChosen(): boolean {
    return this.amountType === AbstractGoodsLabel$AmountType.FULL;
  }
  /**
   * Get the goods data.
   *
   * @return The goods data for this label.
   */
  getAbstractGoods(): AbstractGoods {
    return this.abstractGoods;
  }
  /**
   * Get the goods type.
   *
   * @return The goods type for this label.
   */
  getType(): GoodsType {
    return this.abstractGoods.getType();
  }
  /**
   * Get the goods amount.
   *
   * @return The goods amount.
   */
  getAmount(): number {
    return this.abstractGoods.getAmount();
  }
  /**
   * Set the goods amount.
   *
   * @param amount The amount of goods.
   */
  setAmount(amount: number): void {
    this.abstractGoods.setAmount(amount);
  }
  /**
   * Sets the amount of the goods wrapped by this Label to a default
   * value.  By default, do nothing.  Override this method if
   * necessary.
   */
  setDefaultAmount(): void {
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof AbstractGoodsLabel) {
      let other = o;
      return Utils.equals(this.abstractGoods, other.abstractGoods) && this.amountType === other.amountType;
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + Utils.hashCode(this.abstractGoods)) | 0;
    hash = (Math.imul(31, hash) + this.amountType.ordinal()) | 0;
    return hash;
  }
}

export class AbstractGoodsLabel$AmountType extends JEnum {
  static DEFAULT: AbstractGoodsLabel$AmountType = null;
  static PARTIAL: AbstractGoodsLabel$AmountType = null;
  static FULL: AbstractGoodsLabel$AmountType = null;
  static SUPER_FULL: AbstractGoodsLabel$AmountType = null;
  static $VALUES: AbstractGoodsLabel$AmountType[] = null;
  _AbstractGoodsLabel$AmountType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): AbstractGoodsLabel$AmountType[] { return AbstractGoodsLabel$AmountType.$VALUES.slice(); }
  static valueOf(name: string): AbstractGoodsLabel$AmountType { return $J.enumValueOf(AbstractGoodsLabel$AmountType, name); }
  static $clinit() {
    AbstractGoodsLabel$AmountType.DEFAULT = new AbstractGoodsLabel$AmountType()._AbstractGoodsLabel$AmountType('DEFAULT', 0);
    AbstractGoodsLabel$AmountType.PARTIAL = new AbstractGoodsLabel$AmountType()._AbstractGoodsLabel$AmountType('PARTIAL', 1);
    AbstractGoodsLabel$AmountType.FULL = new AbstractGoodsLabel$AmountType()._AbstractGoodsLabel$AmountType('FULL', 2);
    AbstractGoodsLabel$AmountType.SUPER_FULL = new AbstractGoodsLabel$AmountType()._AbstractGoodsLabel$AmountType('SUPER_FULL', 3);
    AbstractGoodsLabel$AmountType.$VALUES = [AbstractGoodsLabel$AmountType.DEFAULT, AbstractGoodsLabel$AmountType.PARTIAL, AbstractGoodsLabel$AmountType.FULL, AbstractGoodsLabel$AmountType.SUPER_FULL];
  }
}

$J.define(AbstractGoodsLabel, 'net.sf.freecol.client.gui.label.AbstractGoodsLabel', { kind: 'class', sup: 'net.sf.freecol.client.gui.label.FreeColLabel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.AbstractGoods': '_AbstractGoodsLabel' }, returns: { 'hashCode': 'int', 'getAmount': 'int', 'getType': 'net.sf.freecol.common.model.GoodsType', 'getAbstractGoods': 'net.sf.freecol.common.model.AbstractGoods', 'isFullChosen': 'boolean', 'isPartialChosen': 'boolean', 'isSuperFullChosen': 'boolean', 'getImageLibrary': 'net.sf.freecol.client.gui.ImageLibrary' } });
$J.define(AbstractGoodsLabel$AmountType, 'net.sf.freecol.client.gui.label.AbstractGoodsLabel$AmountType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_AbstractGoodsLabel$AmountType' }, clinit: true, lazy: ['$VALUES', 'DEFAULT', 'PARTIAL', 'FULL', 'SUPER_FULL'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
