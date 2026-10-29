// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/AbstractOption.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, XMLStreamException } from '../../../../../../jre/index.ts';
import { FreeColSpecObject } from '../model/FreeColSpecObject.ts';

let FreeColObject, AbstractUnitOption, AudioMixerOption, BooleanOption, FileOption, IntegerOption, LanguageOption, ModListOption, ModOption, OptionGroup, PercentageOption, RangeOption, SelectOption, StringOption, TextOption, UnitListOption, UnitTypeOption;

/**
 * The super class of all options.  GUI components making use of this
 * class can refer to its name and shortDescription properties.  The
 * complete keys of these properties consist of the identifier of the
 * option group (if any), followed by a "."  unless the option group
 * is null, followed by the identifier of the option object, followed
 * by a ".", followed by "name" or "shortDescription".
 */
export class AbstractOption<T> extends FreeColSpecObject {
  static logger: Logger = null;
  static readonly ENABLED_BY_TAG: string = 'enabledBy';
  /**
   * The option group prefix.
   */
  optionGroupId: string = null;
  /**
   * Determine if the option has been defined.  When defined an
   * option won't change when a default value is read from an XML file.
   */
  isDefined_: boolean = false;
  enabledBy: string = null;
  static readonly ACTION_TAG: string = 'action';
  static readonly DEFAULT_VALUE_TAG: string = 'defaultValue';
  $init_AbstractOption() {
    this.optionGroupId = '';
    this.isDefined_ = false;
    this.enabledBy = null;
  }
  /**
   * Creates a new {@code AbstractOption}.
   *
   * @param id The object identifier.
   * @param specification The {@code Specification} to refer to.
   */
  _AbstractOption$String$Specification(id: string, specification: Specification): this {
    this._FreeColSpecObject(specification);
    this.$init_AbstractOption();
    this.setId(id);
    return this;
  }
  /**
   * Creates a new {@code AbstractOption}.
   *
   * @param id The object identifier.
   */
  _AbstractOption$String(id: string): this {
    this._AbstractOption$String$Specification(id, null);
    return this;
  }
  /**
   * Creates a new {@code AbstractOption}.
   *
   * @param specification The {@code Specification} to refer to.
   */
  _AbstractOption$Specification(specification: Specification): this {
    this._AbstractOption$String$Specification(null, specification);
    return this;
  }
  /**
   * Sets the values from another option.
   *
   * @param source The other {@code AbstractOption}.
   */
  setValues(source: AbstractOption<T>): void {
    this.setId(source.getId());
    this.setSpecification(source.getSpecification());
    this.setValue$Object(source.getValue$());
    this.setGroup(source.getGroup());
    this.isDefined_ = source.isDefined_;
  }
  /**
   * Sets the value of this option from the given string
   * representation.  Both parameters must not be null at the same
   * time.  This method does nothing.  Override it if the option has
   * a suitable string representation.
   *
   * @param valueString The string representation of the value of
   *     this {@code Option}.
   * @param defaultValueString The string representation of the
   *     default value of this {@code Option}.
   * @exception XMLStreamException if the value is invalid.
   */
  setValue$String$String(valueString: string, defaultValueString: string): void {
    throw new XMLStreamException('setValue unsupported: ' + $J.str(this));
  }
  /**
   * Generate the choices to provide to the UI.
   *
   * Override if the subclass needs to determine its choices dynamically.
   */
  generateChoices(): void {
  }
  /**
   * Is null an acceptable value for this option?
   *
   * Override this in subclasses where necessary.
   *
   * @return False.
   */
  isNullValueOK(): boolean {
    return false;
  }
  /**
   * {@inheritDoc}
   */
  getGroup(): string {
    return this.optionGroupId;
  }
  /**
   * {@inheritDoc}
   */
  setGroup(group: string): void {
    this.optionGroupId = (group == null) ? '' : group;
  }
  /**
   * {@inheritDoc}
   */
  getEnabledBy(): string {
    return this.enabledBy;
  }
  /**
   * {@inheritDoc}
   */
  readAttributes(xr: FreeColXMLReader): void {
    super.readAttributes(xr);
    let defaultValue = xr.getAttribute$String$String(AbstractOption.DEFAULT_VALUE_TAG, null);
    let value = xr.getAttribute$String$String(FreeColObject.VALUE_TAG, null);
    if (defaultValue == null && value == null) {
      if (!this.isNullValueOK()) {
        throw new XMLStreamException('invalid option ' + this.getId() + ': no value nor default value found.');
      }
    } else {
      this.setValue$String$String(value, defaultValue);
    }
    this.enabledBy = xr.getAttribute$String$String(AbstractOption.ENABLED_BY_TAG, null);
  }
  /**
   * {@inheritDoc}
   */
  writeAttributes(xw: FreeColXMLWriter): void {
    super.writeAttributes(xw);
    if (this.enabledBy != null) {
      xw.writeAttribute(AbstractOption.ENABLED_BY_TAG, this.enabledBy);
    }
  }
  /**
   * General option reader routine.
   *
   * @param xr The {@code FreeColXMLReader} to read from.
   * @return An option.
   * @exception XMLStreamException on stream errors.
   */
  readOption(xr: FreeColXMLReader): AbstractOption {
    let spec = this.getSpecification();
    let tag = xr.getLocalName();
    let option = null;
    if ($J.equals(AbstractOption.ACTION_TAG, tag)) {
      xr.nextTag();
    } else if ($J.equals(AbstractUnitOption.TAG, tag)) {
      option = new AbstractUnitOption()._AbstractUnitOption$Specification(spec);
    } else if ($J.equals(AudioMixerOption.TAG, tag)) {
      option = new AudioMixerOption()._AudioMixerOption(spec);
    } else if ($J.equals(BooleanOption.TAG, tag)) {
      option = new BooleanOption()._BooleanOption$Specification(spec);
    } else if ($J.equals(FileOption.TAG, tag)) {
      option = new FileOption()._FileOption(spec);
    } else if ($J.equals(IntegerOption.TAG, tag)) {
      option = new IntegerOption()._IntegerOption$Specification(spec);
    } else if ($J.equals(LanguageOption.TAG, tag)) {
      option = new LanguageOption()._LanguageOption(spec);
    } else if ($J.equals(ModListOption.TAG, tag)) {
      option = new ModListOption()._ModListOption$Specification(spec);
    } else if ($J.equals(ModOption.TAG, tag)) {
      option = new ModOption()._ModOption(spec);
    } else if ($J.equals(OptionGroup.TAG, tag)) {
      option = new OptionGroup()._OptionGroup$Specification(spec);
    } else if ($J.equals(PercentageOption.TAG, tag)) {
      option = new PercentageOption()._PercentageOption$Specification(spec);
    } else if ($J.equals(RangeOption.TAG, tag)) {
      option = new RangeOption()._RangeOption$Specification(spec);
    } else if ($J.equals(SelectOption.TAG, tag)) {
      option = new SelectOption()._SelectOption$Specification(spec);
    } else if ($J.equals(StringOption.TAG, tag)) {
      option = new StringOption()._StringOption$Specification(spec);
    } else if ($J.equals(UnitListOption.TAG, tag)) {
      option = new UnitListOption()._UnitListOption$Specification(spec);
    } else if ($J.equals(UnitTypeOption.TAG, tag)) {
      option = new UnitTypeOption()._UnitTypeOption$Specification(spec);
    } else if ($J.equals(TextOption.TAG, tag)) {
      option = new TextOption()._TextOption$Specification(spec);
    } else {
      AbstractOption.logger.warning('Not an option type: ' + tag);
      xr.nextTag();
    }
    if (option != null) {
      option.readFromXML(xr);
      option.generateChoices();
    }
    return option;
  }
  static $clinit() {
    AbstractOption.logger = Logger.getLogger($J.cls(AbstractOption).getName());
  }
}

$J.define(AbstractOption, 'net.sf.freecol.common.option.AbstractOption', { kind: 'class', ifaces: ['net.sf.freecol.common.option.Option'], sup: 'net.sf.freecol.common.model.FreeColSpecObject', ctors: { 'net.sf.freecol.common.model.Specification': '_AbstractOption$Specification', 'java.lang.String': '_AbstractOption$String', 'java.lang.String,net.sf.freecol.common.model.Specification': '_AbstractOption$String$Specification' }, returns: { 'getEnabledBy': 'java.lang.String', 'getGroup': 'java.lang.String', 'isNullValueOK': 'boolean' }, meths: { 'setValue(java.lang.Object)': 'setValue$Object', 'getValue()': 'getValue$', 'setValue(java.lang.String,java.lang.String)': 'setValue$String$String' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
  AbstractUnitOption = $J.load('net.sf.freecol.common.option.AbstractUnitOption');
  AudioMixerOption = $J.load('net.sf.freecol.common.option.AudioMixerOption');
  BooleanOption = $J.load('net.sf.freecol.common.option.BooleanOption');
  FileOption = $J.load('net.sf.freecol.common.option.FileOption');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  LanguageOption = $J.load('net.sf.freecol.common.option.LanguageOption');
  ModListOption = $J.load('net.sf.freecol.common.option.ModListOption');
  ModOption = $J.load('net.sf.freecol.common.option.ModOption');
  OptionGroup = $J.load('net.sf.freecol.common.option.OptionGroup');
  PercentageOption = $J.load('net.sf.freecol.common.option.PercentageOption');
  RangeOption = $J.load('net.sf.freecol.common.option.RangeOption');
  SelectOption = $J.load('net.sf.freecol.common.option.SelectOption');
  StringOption = $J.load('net.sf.freecol.common.option.StringOption');
  TextOption = $J.load('net.sf.freecol.common.option.TextOption');
  UnitListOption = $J.load('net.sf.freecol.common.option.UnitListOption');
  UnitTypeOption = $J.load('net.sf.freecol.common.option.UnitTypeOption');
});
