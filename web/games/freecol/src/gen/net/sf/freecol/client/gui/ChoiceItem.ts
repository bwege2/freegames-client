// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/ChoiceItem.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

let Messages, AbstractGoods, AbstractUnit, Player, Utils;

/**
 * Can be used as a single choice for the
 * {@link FreeColChoiceDialog}.
 * @param <T> The type of the contained item.
 */
export class ChoiceItem<T> extends JObject {
  text_: string = null;
  object: T = null;
  icon: ImageIcon = null;
  enabled: boolean = false;
  optionOK: boolean = false;
  optionCancel: boolean = false;
  optionDefault: boolean = false;
  $init_ChoiceItem() {
    this.optionOK = false;
    this.optionCancel = false;
    this.optionDefault = false;
  }
  /**
   * Creates a new {@code ChoiceItem} with the
   * given object.
   *
   * @param text The text that should be used to represent this choice.
   * @param object The object contained by this choice.
   * @param enable Sets if the option should be enabled or not
   */
  _ChoiceItem$String$Object$boolean(text: string, object$: T, enable: boolean): this {
    this.$init_ChoiceItem();
    this.text_ = text;
    this.object = object$;
    this.icon = null;
    this.enabled = enable;
    this.optionOK = this.optionCancel = this.optionDefault = false;
    return this;
  }
  /**
   * Creates a new {@code ChoiceItem} with the
   * given object.
   *
   * @param text The text that should be used to represent this choice.
   * @param object The object contained by this choice.
   */
  _ChoiceItem$String$Object(text: string, object$: T): this {
    this._ChoiceItem$String$Object$boolean(text, object$, true);
    return this;
  }
  /**
   * Creates a new {@code ChoiceItem} with the
   * given object.
   *
   * @param object The object contained by this choice.
   */
  _ChoiceItem$Object(object$: T): this {
    this._ChoiceItem$String$Object$boolean(Messages.message$String($J.str(object$)), object$, true);
    if (object$ instanceof AbstractGoods) {
      this.text_ = Messages.message$StringTemplate((object$).getLabel$());
    } else if (object$ instanceof AbstractUnit) {
      this.text_ = Messages.message$String((object$).getId());
    } else if (object$ instanceof Player) {
      this.text_ = Messages.message$StringTemplate((object$).getLabel());
    }
    return this;
  }
  /**
   * Gets the {@code Object} contained by this choice.
   *
   * @return The {@code Object}.
   */
  getObject(): T {
    return this.object;
  }
  /**
   * Gets the choice as an {@code int}.
   *
   * @return The number representing this object.
   * @exception ClassCastException if the {@link #getObject object} is
   *            not an {@code Integer}.
   */
  getChoice(): number {
    return (this.object);
  }
  /**
   * Should this item be enabled or not?
   *
   * @return The enable status.
   */
  isEnabled(): boolean {
    return this.enabled;
  }
  /**
   * Set the enable state of this choice.
   *
   * @param enable The new enable state.
   * @return The old enable state.
   */
  setEnabled(enable: boolean): boolean {
    let ret = this.enabled;
    this.enabled = enable;
    return ret;
  }
  /**
   * Get any icon associated with this choice.
   *
   * @return An icon if present, or null if not found.
   */
  getIcon(): ImageIcon {
    return this.icon;
  }
  /**
   * Add an icon to this choice.
   *
   * @param icon The {@code ImageIcon} to add.
   * @return This choice.
   */
  setIcon(icon: ImageIcon): ChoiceItem<T> {
    this.icon = icon;
    return this;
  }
  /**
   * Is this choice the "OK" choice?
   *
   * @return True if this is the "OK" choice.
   */
  isOK(): boolean {
    return this.optionOK;
  }
  /**
   * Make this choice the "OK" option.
   *
   * @return This choice.
   */
  okOption(): ChoiceItem<T> {
    this.optionOK = true;
    return this;
  }
  /**
   * Is this choice the "cancel" choice?
   *
   * @return True if this is the "cancel" choice.
   */
  isCancel(): boolean {
    return this.optionCancel;
  }
  /**
   * Make this choice the "cancel" option.
   *
   * @return This choice.
   */
  cancelOption(): ChoiceItem<T> {
    this.optionCancel = true;
    return this;
  }
  /**
   * Is this choice the default choice?
   *
   * @return True if this is the default choice.
   */
  isDefault(): boolean {
    return this.optionDefault;
  }
  /**
   * Make this choice the default.
   *
   * @return This choice.
   */
  defaultOption(): ChoiceItem<T> {
    this.optionDefault = true;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  compareTo(other: ChoiceItem<T>): number {
    return (this.text_ == null) ? -1 : (other.text_ == null) ? 1 : $J.compareTo(this.text_, other.text_);
  }
  /**
   * {@inheritDoc}
   */
  equals(o: any): boolean {
    if (this === o) {
      return true;
    }
    if (o instanceof ChoiceItem) {
      let other = o;
      return Utils.equals(this.text_, other.toString()) && Utils.equals(this.getObject(), other.getObject());
    }
    return false;
  }
  /**
   * {@inheritDoc}
   */
  hashCode(): number {
    let hash = super.hashCode();
    hash = (Math.imul(31, hash) + Utils.hashCode(this.text_)) | 0;
    hash = (Math.imul(31, hash) + Utils.hashCode(this.object)) | 0;
    hash = (Math.imul(31, hash) + ((this.enabled) ? 1 : 0)) | 0;
    hash = (Math.imul(31, hash) + ((this.optionOK) ? 1 : 0)) | 0;
    hash = (Math.imul(31, hash) + ((this.optionCancel) ? 1 : 0)) | 0;
    hash = (Math.imul(31, hash) + ((this.optionDefault) ? 1 : 0)) | 0;
    return hash;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.text_;
  }
}

$J.define(ChoiceItem, 'net.sf.freecol.client.gui.ChoiceItem', { kind: 'class', ifaces: ['java.lang.Comparable'], sup: 'java.lang.Object', ctors: { 'java.lang.Object': '_ChoiceItem$Object', 'java.lang.String,java.lang.Object': '_ChoiceItem$String$Object', 'java.lang.String,java.lang.Object,boolean': '_ChoiceItem$String$Object$boolean' }, returns: { 'hashCode': 'int', 'isDefault': 'boolean', 'isCancel': 'boolean', 'isOK': 'boolean', 'getIcon': 'javax.swing.ImageIcon', 'isEnabled': 'boolean', 'getChoice': 'int' } });
$J.module(() => {
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Player = $J.load('net.sf.freecol.common.model.Player');
  Utils = $J.load('net.sf.freecol.common.util.Utils');
});
