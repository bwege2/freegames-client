// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/IntegerOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Level, Logger, NumberFormatException, StringBuilder } from '../../../../../../jre/index.ts';
import { AbstractOption } from './AbstractOption.ts';

let FreeColObject;

/**
 * Represents an option where the valid choice is an integer.
 */
export class IntegerOption extends AbstractOption {
  static logger: Logger = null;
  static readonly TAG: string = 'integerOption';
  /**
   * The value of this option.
   */
  value_: number = 0;
  /**
   * The loaded value before any modification. This is used when reverting back
   * to the original value when "previewEnabled is used.
   */
  originalValue: number = 0;
  /**
   * A upper bound on the value of this option.
   */
  maximumValue: number = 0;
  /**
   * A lower bound on the value of this option.
   */
  minimumValue: number = 0;
  /**
   * The step size to be used when this option is displayed using a spinner.
   */
  stepSize: number = 0;
  /**
   * If <code>true</code>, the OptionUI will immediately apply the value when it's
   * changed. This is essential functionality when adjusting the volume in the client
   * options.
   */
  previewEnabled: boolean = false;
  static readonly MAXIMUM_VALUE_TAG: string = 'maximumValue';
  static readonly MINIMUM_VALUE_TAG: string = 'minimumValue';
  static readonly STEP_SIZE_TAG: string = 'stepSize';
  static readonly PREVIEW_ENABLED_TAG: string = 'previewEnabled';
  $init_IntegerOption() {
    this.maximumValue = 2147483647;
    this.minimumValue = -2147483648;
    this.stepSize = 0;
    this.previewEnabled = false;
  }
  /**
   * Creates a new {@code IntegerOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _IntegerOption$Specification(specification: Specification): this {
    this._AbstractOption$Specification(specification);
    this.$init_IntegerOption();
    return this;
  }
  /**
   * Creates a new {@code IntegerOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _IntegerOption$String$Specification(id: string, specification: Specification): this {
    this._AbstractOption$String$Specification(id, specification);
    this.$init_IntegerOption();
    return this;
  }
  /**
   * Checks if the option should have immediate effect when changed in
   * the {@code OptionUI}.
   *
   * @return If <code>true</code>, the OptionUI will immediately apply the
   *      value when it's changed.
   */
  isPreviewEnabled(): boolean {
    return this.previewEnabled;
  }
  /**
   * Sets if the option should have immediate effect when changed in
   * the {@code OptionUI}.
   *
   * @param previewEnabled The value to be applied.
   */
  setPreviewEnabled(previewEnabled: boolean): void {
    this.previewEnabled = previewEnabled;
  }
  /**
   * Resets the value to the original value.
   */
  resetValue(): void {
    this.setValue$Object(this.originalValue);
  }
  /**
   * Get the minimum allowed value.
   *
   * @return The minimum value allowed by this option.
   */
  getMinimumValue(): number {
    return this.minimumValue;
  }
  /**
   * Set the minimum allowed value.
   *
   * @param minimumValue The new minimum value.
   */
  setMinimumValue(minimumValue: number): void {
    this.minimumValue = minimumValue;
  }
  /**
   * Get the maximum allowed value.
   *
   * @return The maximum value allowed by this option.
   */
  getMaximumValue(): number {
    return this.maximumValue;
  }
  /**
   * Set the maximum allowed value.
   *
   * @param maximumValue The new maximum value.
   */
  setMaximumValue(maximumValue: number): void {
    this.maximumValue = maximumValue;
  }
  /**
   * Limit a value with respect to the limits of this option.
   *
   * @param value The value to limit.
   * @return The value limited by the option limits.
   */
  limitValue(value: number): number {
    return Math.min(Math.max(value, this.minimumValue), this.maximumValue);
  }
  /**
   * Gets the step size to be used when this option is displayed using
   * a spinner.
   *
   * @return The step size, if defined, or {@code 0}.
   */
  getStepSize(): number {
    return this.stepSize;
  }
  /**
   * {@inheritDoc}
   */
  cloneOption(): IntegerOption {
    let result = new IntegerOption()._IntegerOption$String$Specification(this.getId(), this.getSpecification());
    result.setValues(this);
    result.setMinimumValue(this.minimumValue);
    result.setMaximumValue(this.maximumValue);
    return result;
  }
  /**
   * {@inheritDoc}
   */
  getValue$(): number {
    return this.value_;
  }
  /**
   * {@inheritDoc}
   */
  setValue$Object(value: number): void {
    let oldValue = this.value_;
    this.value_ = this.limitValue(value);
    if (this.isDefined_ && value !== oldValue) {
      this.firePropertyChange$String$int$int(FreeColObject.VALUE_TAG, oldValue, value);
    }
    this.isDefined_ = true;
  }
  /**
   * {@inheritDoc}
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    let str = (valueString != null) ? valueString : defaultValueString;
    try {
      this.setValue$Object($J.parseInt(str));
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let nfe = $J.exc($e0);
        IntegerOption.logger.log(Level.WARNING, 'IntegerOption fail: ' + str, nfe);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    xw.writeAttribute$String$int(FreeColObject.VALUE_TAG, this.value_);
    if (this.maximumValue < 2147483647) {
      xw.writeAttribute$String$int(IntegerOption.MAXIMUM_VALUE_TAG, this.maximumValue);
    }
    if (this.minimumValue > -2147483648) {
      xw.writeAttribute$String$int(IntegerOption.MINIMUM_VALUE_TAG, this.minimumValue);
    }
    if (this.stepSize > 0) {
      xw.writeAttribute$String$int(IntegerOption.STEP_SIZE_TAG, this.stepSize);
    }
    if (this.previewEnabled) {
      xw.writeAttribute$String$boolean(IntegerOption.PREVIEW_ENABLED_TAG, this.previewEnabled);
    }
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    this.maximumValue = xr.getAttribute$String$int(IntegerOption.MAXIMUM_VALUE_TAG, 2147483647);
    this.minimumValue = xr.getAttribute$String$int(IntegerOption.MINIMUM_VALUE_TAG, -2147483648);
    this.stepSize = xr.getAttribute$String$int(IntegerOption.STEP_SIZE_TAG, 0);
    this.previewEnabled = xr.getAttribute$String$boolean(IntegerOption.PREVIEW_ENABLED_TAG, false);
    this.value_ = this.limitValue(this.value_);
    this.originalValue = this.value_;
  }
  /**
   * {@inheritDoc}
   */
  getXMLTagName(): string {
    return IntegerOption.TAG;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    let sb = new StringBuilder(16);
    sb.append(String.fromCharCode(91 /* '[' */)).append(this.getId()).append(' value=').append(String(this.value_));
    if (this.minimumValue > -2147483648) {
      sb.append(' min=').append(String(this.minimumValue));
    }
    if (this.maximumValue < 2147483647) {
      sb.append(' max=').append(String(this.maximumValue));
    }
    sb.append(String.fromCharCode(93 /* ']' */));
    return sb.toString();
  }
  static $clinit() {
    IntegerOption.logger = Logger.getLogger($J.cls(IntegerOption).getName());
  }
}

$J.define(IntegerOption, 'net.sf.freecol.common.option.IntegerOption', { kind: 'class', sup: 'net.sf.freecol.common.option.AbstractOption', ctors: { 'java.lang.String,net.sf.freecol.common.model.Specification': '_IntegerOption$String$Specification', 'net.sf.freecol.common.model.Specification': '_IntegerOption$Specification' }, returns: { 'getXMLTagName': 'java.lang.String', 'getValue$': 'java.lang.Integer', 'getStepSize': 'int', 'getMaximumValue': 'int', 'getMinimumValue': 'int', 'isPreviewEnabled': 'boolean' }, meths: { 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String', 'setValue(java.lang.Integer)': 'setValue$Object', 'getValue()': 'getValue$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
