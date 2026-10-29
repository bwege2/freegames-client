// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/option/OptionContainer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let BooleanOption, FileOption, IntegerOption, ModListOption, OptionGroup, PercentageOption, RangeOption, SelectOption, StringOption, TextOption, UnitListOption;

/**
 * The routines common to option containers.
 */
export class OptionContainer {
  /**
   * Gets the value of a {@code BooleanOption}.
   *
   * @param id The object identifier.
   * @return The boolean value.
   */
  getBoolean(id: string): boolean {
    return this.getOption$String$Class(id, $J.cls(BooleanOption)).getValue$();
  }
  /**
   * Sets the value of a {@code BooleanOption}.
   *
   * @param id The object identifier.
   * @param value The new boolean value of the option.
   */
  setBoolean(id: string, value: boolean): void {
    this.getOption$String$Class(id, $J.cls(BooleanOption)).setValue$Object(value);
  }
  /**
   * Gets the file value of a {@code FileOption}.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getFile(id: string): File {
    return this.getOption$String$Class(id, $J.cls(FileOption)).getValue$();
  }
  /**
   * Sets the value of a {@code FileOption}.
   *
   * @param id The object identifier.
   * @param value The new value.
   */
  setFile(id: string, value: File): void {
    this.getOption$String$Class(id, $J.cls(FileOption)).setValue$Object(value);
  }
  /**
   * Gets the value of an {@code IntegerOption}.
   *
   * @param id The object identifier.
   * @return The integer value.
   */
  getInteger(id: string): number {
    return this.getOption$String$Class(id, $J.cls(IntegerOption)).getValue$();
  }
  /**
   * Sets the value of an {@code IntegerOption}.
   *
   * @param id The object identifier.
   * @param value The new integer value of the option.
   */
  setInteger(id: string, value: number): void {
    this.getOption$String$Class(id, $J.cls(IntegerOption)).setValue$Object(value);
  }
  /**
   * Gets the minimum value of an {@code IntegerOption}.
   *
   * @param id The object identifier.
   * @return value The minimum value.
   */
  getIntegerMinimum(id: string): number {
    return this.getOption$String$Class(id, $J.cls(IntegerOption)).getMinimumValue();
  }
  /**
   * Sets the minimum value of an {@code IntegerOption}.
   *
   * @param id The object identifier.
   * @param value The new minimum value.
   */
  setIntegerMinimum(id: string, value: number): void {
    this.getOption$String$Class(id, $J.cls(IntegerOption)).setMinimumValue(value);
  }
  /**
   * Gets the mod list from a {@code ModListOption}.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getModList(id: string): List<FreeColModFile> {
    return this.getOption$String$Class(id, $J.cls(ModListOption)).getOptionValues();
  }
  /**
   * Gets the value of an {@code OptionGroup}.
   *
   * @param id The object identifier.
   * @return The {@code OptionGroup} value.
   */
  getOptionGroup(id: string): OptionGroup {
    return this.getOption$String$Class(id, $J.cls(OptionGroup)).getValue$();
  }
  /**
   * Gets the percentage value of a {@code PercentageOption}.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getPercentage(id: string): number {
    return this.getOption$String$Class(id, $J.cls(PercentageOption)).getValue$();
  }
  /**
   * Gets the percentage value of a {@code PercentageOption} normalized
   * to double.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getPercentageMultiplier(id: string): number {
    return 0.01 * this.getPercentage(id);
  }
  /**
   * Gets the value of a {@code RangeOption}.
   *
   * @param id The object identifier.
   * @return The range value.
   */
  getRange(id: string): number {
    return this.getOption$String$Class(id, $J.cls(RangeOption)).getValue$();
  }
  /**
   * Gets the string value of an option.
   *
   * @param id The object identifier.
   * @return The string value.
   */
  getString(id: string): string {
    return this.getOption$String$Class(id, $J.cls(StringOption)).getValue$();
  }
  /**
   * Sets the string value of an option.
   *
   * @param id The object identifier.
   * @param value The new string value.
   */
  setString(id: string, value: string): void {
    this.getOption$String$Class(id, $J.cls(StringOption)).setValue$Object(value);
  }
  /**
   * Gets the value of a {@code SelectOption}.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getSelection(id: string): number {
    return this.getOption$String$Class(id, $J.cls(SelectOption)).getValue$();
  }
  /**
   * Gets the name associated with the current value of a
   * {@code SelectOption}.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getSelectionName(id: string): string {
    return this.getOption$String$Class(id, $J.cls(SelectOption)).getName();
  }
  /**
   * Gets the value of a {@code TextOption}.
   *
   * @param id The object identifier.
   * @return The string value.
   */
  getText(id: string): string {
    return this.getOption$String$Class(id, $J.cls(TextOption)).getValue$();
  }
  /**
   * Sets the value of a {@code TextOption}.
   *
   * @param id The object identifier.
   * @param value The new string value.
   */
  setText(id: string, value: string): void {
    this.getOption$String$Class(id, $J.cls(TextOption)).setValue$Object(value);
  }
  /**
   * Gets the unit list from a {@code UnitListOption}.
   *
   * @param id The object identifier.
   * @return The value.
   */
  getUnitList(id: string): List<AbstractUnit> {
    return this.getOption$String$Class(id, $J.cls(UnitListOption)).getOptionValues();
  }
}

$J.define(OptionContainer, 'net.sf.freecol.common.option.OptionContainer', { kind: 'interface', meths: { 'getOption(java.lang.String,java.lang.Class)': 'getOption$String$Class' } });
$J.module(() => {
  BooleanOption = $J.load('net.sf.freecol.common.option.BooleanOption');
  FileOption = $J.load('net.sf.freecol.common.option.FileOption');
  IntegerOption = $J.load('net.sf.freecol.common.option.IntegerOption');
  ModListOption = $J.load('net.sf.freecol.common.option.ModListOption');
  OptionGroup = $J.load('net.sf.freecol.common.option.OptionGroup');
  PercentageOption = $J.load('net.sf.freecol.common.option.PercentageOption');
  RangeOption = $J.load('net.sf.freecol.common.option.RangeOption');
  SelectOption = $J.load('net.sf.freecol.common.option.SelectOption');
  StringOption = $J.load('net.sf.freecol.common.option.StringOption');
  TextOption = $J.load('net.sf.freecol.common.option.TextOption');
  UnitListOption = $J.load('net.sf.freecol.common.option.UnitListOption');
});
