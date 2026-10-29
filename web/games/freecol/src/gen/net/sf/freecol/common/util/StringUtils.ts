// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/util/StringUtils.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Character, JObject, JString, Locale, StringBuilder } from '../../../../../../jre/index.ts';

/**
 * Collection of small static helper methods using Strings.
 */
export class StringUtils extends JObject {
  _StringUtils(): this {
    return this;
  }
  /**
   * Joins the given strings.
   *
   * In Java 8, we can use String.join.
   *
   * @param delimiter The delimiter to place between the individual strings.
   * @param strings The strings to be joined.
   * @return Each of the strings in the given array delimited by the given
   *         string.
   */
  static join$String$StringArr(delimiter: string, strings: string[]): string {
    if (strings == null || strings.length === 0) {
      return null;
    } else {
      let result = new StringBuilder(strings[0]);
      for (let i = 1; i < strings.length; i++) {
        result.append(delimiter);
        result.append(strings[i]);
      }
      return result.toString();
    }
  }
  /**
   * Joins the given strings.
   *
   * @param delimiter The delimiter to place between the individual strings.
   * @param strings The strings to be joined.
   * @return Each of the strings in the given array delimited by the given
   *         string.
   */
  static join$String$Collection(delimiter: string, strings: Collection<string>): string {
    return StringUtils.join$String$StringArr(delimiter, $J.toArrayInto(strings.toArray(), $J.newArray(0, null)));
  }
  /**
   * Truncate a string to a maximum length.
   *
   * @param str The string to chop.
   * @param maxLength The maximum length.
   * @return A string not exceeding maxLength.
   */
  static chop(str: string, maxLength: number): string {
    return (str.length > maxLength) ? str.substring(0, maxLength) : str;
  }
  /**
   * Gets the first part of a string before a supplied delimiter.
   *
   * @param s The string to operate on.
   * @param delim The delimiter.
   * @return The first part of the string before the first instance of
   *     the delimiter, or the original string if the delimiter is
   *     not present.
   */
  static firstPart(s: string, delim: string): string {
    let idx = (s == null) ? -1 : s.indexOf(delim);
    return (idx >= 0) ? s.substring(0, idx) : s;
  }
  /**
   * Gets the last part of a string after a supplied delimiter.
   *
   * @param s The string to operate on.
   * @param delim The delimiter.
   * @return The last part of the string after the last instance of
   *     the delimiter, or the original string if the delimiter is
   *     not present.
   */
  static lastPart(s: string, delim: string): string {
    let idx = (s == null) ? -1 : s.lastIndexOf(delim);
    return (idx >= 0) ? s.substring((idx + delim.length) | 0, s.length) : s;
  }
  /**
   * Get the standard form an enum is used as a key.
   *
   * Convert to lower case, and remove underscores uppercasing the
   * next letter.
   *
   * @param value The enum value.
   * @return A suitable key.
   */
  static getEnumKey(value: JEnum<any>): string {
    let base = StringUtils.downCase$String(value.toString());
    let len = base.length;
    let sb = new StringBuilder(len);
    let idx: number;
    let from = 0;
    for (; ; ) {
      if ((idx = base.indexOf(String.fromCharCode(95 /* '_' */), from)) < 0) {
        sb.append(base.substring(from));
        break;
      }
      sb.append(base.substring(from, idx));
      from = (idx + 1) | 0;
      if (from >= len) {
        break;
      }
      let ch = base.charCodeAt(from);
      if (Character.isLetter(ch)) {
        sb.append(String.fromCharCode(Character.toUpperCase(ch)));
        from++;
      }
    }
    return sb.toString();
  }
  /**
   * Find a breaking point in a line between two words.  The
   * breaking point is as close to the center as possible.
   *
   * @param string The line for which we should determine a breaking point.
   * @return The best breaking point or negative if none found.
   */
  static getBreakingPoint$String(string$: string): number {
    return StringUtils.getBreakingPoint$String$String(string$, ' ');
  }
  /**
   * Find a breaking point in a line between two words.  The
   * breaking point is as close to the center as possible.
   *
   * @param string The line for which we should determine a breaking point.
   * @param delim Characters to consider as word delimiting.
   * @return The best breaking point or negative if none found.
   */
  static getBreakingPoint$String$String(string$: string, delim: string): number {
    let center = $J.idiv(string$.length, 2);
    for (let offset = 0; offset < center; offset++) {
      if (delim.indexOf(String.fromCharCode(string$.charCodeAt((center + offset) | 0))) >= 0) {
        return (center + offset) | 0;
      } else if (delim.indexOf(String.fromCharCode(string$.charCodeAt((center - offset) | 0))) >= 0) {
        return (center - offset) | 0;
      }
    }
    return -1;
  }
  /**
   * Split some text at word boundaries into a list of strings that
   * take up no more than a given width.
   *
   * @param text The text to split.
   * @param delim Characters to consider as word delimiting.
   * @param fontMetrics {@code FontMetrics} used to calculate
   *     text width.
   * @param width The text width maximum.
   * @return A list of split text.
   */
  static splitText(text: string, delim: string, fontMetrics: FontMetrics, width: number): List<string> {
    let result = new ArrayList();
    let len = text.length;
    let i = 0;
    let start: number;
    let top = '';
    let d = null;
    for (; ; ) {
      for (; i < len; i++) {
        if (delim.indexOf(String.fromCharCode(text.charCodeAt(i))) < 0) {
          break;
        }
      }
      if (i >= len) {
        break;
      }
      start = i;
      for (; i < len; i++) {
        if (delim.indexOf(String.fromCharCode(text.charCodeAt(i))) >= 0) {
          break;
        }
      }
      let s = text.substring(start, i);
      let t = ((top.length === 0)) ? s : top + $J.cstr(d) + s;
      if (fontMetrics.stringWidth(t) > width) {
        if ((top.length === 0)) {
          result.add(s);
        } else {
          result.add(top);
          top = s;
        }
      } else {
        top = t;
      }
      if (i >= len) {
        if (!(top.length === 0)) {
          result.add(top);
        }
        break;
      }
      d = text.charCodeAt(i);
    }
    return result;
  }
  /**
   * Capitalize a string in the default locale.
   *
   * @param s The {@code String} to capitalize.
   * @return The capitalized string.
   */
  static capitalize$String(s: string): string {
    return StringUtils.capitalize$String$Locale(s, Locale.US);
  }
  /**
   * Capitalize a string in a specific locale.
   *
   * @param s The {@code String} to capitalize.
   * @param locale The {@code Locale} to apply.
   * @return The capitalized string.
   */
  static capitalize$String$Locale(s: string, locale: Locale): string {
    return (s == null || s.length === 0) ? s : StringUtils.upCase$String$Locale(s.substring(0, 1), locale) + s.substring(1);
  }
  /**
   * Downcase a string in the default locale.
   *
   * @param s The {@code String} to convert to lower case.
   * @return The converted string.
   */
  static downCase$String(s: string): string {
    return StringUtils.downCase$String$Locale(s, Locale.US);
  }
  /**
   * Downcase a string in a specific locale.
   *
   * @param s The {@code String} to convert to lower case.
   * @param locale The {@code Locale} to apply.
   * @return The converted string.
   */
  static downCase$String$Locale(s: string, locale: Locale): string {
    return (s == null || s.length === 0) ? s : s.toLowerCase();
  }
  /**
   * Upcase a string in the default locale.
   *
   * @param s The {@code String} to convert to upper case.
   * @return The converted string.
   */
  static upCase$String(s: string): string {
    return StringUtils.upCase$String$Locale(s, Locale.US);
  }
  /**
   * Upcase a string in a specific locale.
   *
   * @param s The {@code String} to convert to upper case.
   * @param locale The {@code Locale} to apply.
   * @return The converted string.
   */
  static upCase$String$Locale(s: string, locale: Locale): string {
    return (s == null || s.length === 0) ? s : s.toUpperCase();
  }
}

$J.define(StringUtils, 'net.sf.freecol.common.util.StringUtils', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_StringUtils' }, meths: { 'upCase(java.lang.String,java.util.Locale)': 'upCase$String$Locale', 'upCase(java.lang.String)': 'upCase$String', 'downCase(java.lang.String,java.util.Locale)': 'downCase$String$Locale', 'downCase(java.lang.String)': 'downCase$String', 'capitalize(java.lang.String,java.util.Locale)': 'capitalize$String$Locale', 'capitalize(java.lang.String)': 'capitalize$String', 'getBreakingPoint(java.lang.String,java.lang.String)': 'getBreakingPoint$String$String', 'getBreakingPoint(java.lang.String)': 'getBreakingPoint$String', 'join(java.lang.String,java.util.Collection)': 'join$String$Collection', 'join(java.lang.String,java.lang.String[])': 'join$String$StringArr' } });
