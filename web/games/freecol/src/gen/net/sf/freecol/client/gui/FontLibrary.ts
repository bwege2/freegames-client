// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/FontLibrary.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JEnum, JObject, JString, Logger, RuntimeException } from '../../../../../../jre/index.ts';

let Font, Size, ResourceManager, CollectionUtils, StringUtils;

/**
 * Wraps anything {@code Font} related.
 *
 * Should be used for getting a {@code Font} everywhere it is needed.
 */
export class FontLibrary extends JObject {
  static logger: Logger = null;
  static readonly DEFAULT_UNSCALED_MAIN_FONT_SIZE: number = 12;
  /**
   * Default size, used for the main-font.
   */
  static mainFontSize: number = 0;
  /**
   * Conversion map for getFontKey.
   */
  static keyMap: JMap<FontLibrary$FontType, string> = null;
  /**
   * Cache for the (optional) custom main Font.
   */
  static mainFont: Font = null;
  /**
   * The font cache.
   */
  static fontCache: JMap<string, Font> = null;
  _FontLibrary(): this {
    return this;
  }
  /**
   * Convert a {@code FontType} to a resource key.
   *
   * @param fontType The {@code FontType} to convert.
   * @return The resource key, or null if the main font should be used.
   */
  static getFontKey(fontType: FontLibrary$FontType): string {
    return (fontType === FontLibrary$FontType.NORMAL && FontLibrary.mainFont != null) ? null : FontLibrary.keyMap.getOrDefault(fontType, null);
  }
  static setMainFontSize(newMainFontSize: number): void {
    FontLibrary.mainFontSize = newMainFontSize;
  }
  static getMainFontSize(): number {
    return FontLibrary.mainFontSize;
  }
  /**
   * Convert a font size and scale factor to float.
   *
   * @param fontSize The font size expressed as a {@code Size}.
   * @param scaleFactor A secondary scaling.
   * @return The conversion result.
   */
  static getScaledSize(fontSize: Size, scaleFactor: number): number {
    return Math.fround(fontSize.forFont() * scaleFactor);
  }
  /**
   * Create a default {@code Font} set on initialization of the GUI.
   *
   * @param fontName Can be used to choose a different font from a
   *     user-provided name.
   * @return The new {@code Font}.
   */
  static createMainFont(fontName: string): Font {
    let font = null;
    if (fontName != null) {
      font = Font.decode(fontName);
    }
    if (font == null) {
      font = ResourceManager.getFont('font.normal');
    }
    FontLibrary.mainFont = font = font.deriveFont$float(FontLibrary.mainFontSize);
    return font;
  }
  static getMainFont(): Font {
    return FontLibrary.mainFont.deriveFont$float(FontLibrary.mainFontSize);
  }
  /**
   * Is a given font non-null and is it able to display some optional text?
   *
   * @param font The {@code Font} to check.
   * @param text Optional text to that the font must be able to represent.
   * @return True if the tests pass.
   */
  static displayTest(font: Font, text: string): boolean {
    return font != null && (text == null || font.canDisplayUpTo$String(text) < 0);
  }
  /**
   * Try to find a basic font that of a given type that can display some text.
   *
   * @param type The {@code FontType} to try.
   * @param text Optional text that the font must be able to represent.
   * @return The {@code Font} found.
   */
  static tryFont(type$: FontLibrary$FontType, text: string): Font {
    let fontKey = FontLibrary.getFontKey(type$);
    if (fontKey == null) {
      return null;
    }
    let ret = ResourceManager.getFont(fontKey);
    return (FontLibrary.displayTest(ret, text)) ? ret : null;
  }
  /**
   * Get an unscaled font with a simple text specification.
   *
   * @param spec The font specification.
   * @return The {@code Font} found.
   */
  static getUnscaledFont$String(spec: string): Font {
    return FontLibrary.getUnscaledFont$String$String(spec, null);
  }
  /**
   * Get an unscaled font with a simple text specification and optional
   * test string.
   *
   * The spec is a '-' delimited string with three parts.
   *   1. The type, a case-independent value of the FontType enum.
   *   2. The style, '+' delimited strings in ["plain", "bold", "italic"]
   *   3. The (absolute) size, a case-independent name of a Size enum.
   *
   * This routine *should* always return a font, but it is allowed to
   * throw exceptions if the font spec is bad.  It should not take too
   * long to find bad font specs.  AFAICT the only way there can be a
   * null result is if Font.deriveFont were to fail, which it is not
   * documented to do.
   *
   * Synchronized so as to be able to use a cache.
   *
   * @param spec The font specification.
   * @param text Optional text that the font must be able to represent.
   * @return The {@code Font} found.
   */
  static getUnscaledFont$String$String(spec: string, text: string): Font {
    let ret = FontLibrary.fontCache.get(spec);
    if (ret != null) {
      if (FontLibrary.displayTest(ret, text)) {
        return ret;
      }
      FontLibrary.logger.warning('Fontlibrary cached font for ' + spec + ' failed to display: ' + text);
    }
    let a = JString.split(spec, '-');
    if (a.length !== 3) {
      throw new RuntimeException('Bad font spec: ' + spec);
    }
    let type$ = $J.enumValueOf($J.cls(FontLibrary$FontType), StringUtils.upCase$String(a[0]));
    let styles = JString.split(StringUtils.upCase$String(a[1]), '\\+');
    let style = 0;
    for (let s of styles) {
      let x = ($J.equals('PLAIN', s)) ? Font.PLAIN : ($J.equals('BOLD', s)) ? Font.BOLD : ($J.equals('ITALIC', s)) ? Font.ITALIC : -1;
      if (x < 0) {
        throw new RuntimeException('Bad font style: ' + s);
      }
      style |= x;
    }
    let size = $J.enumValueOf($J.cls(Size), StringUtils.upCase$String(a[2]));
    ret = FontLibrary.tryFont(type$, text);
    if (ret == null && type$ !== FontLibrary$FontType.NORMAL) {
      ret = FontLibrary.tryFont(FontLibrary$FontType.NORMAL, text);
    }
    if (ret == null && type$ !== FontLibrary$FontType.SIMPLE) {
      ret = FontLibrary.tryFont(FontLibrary$FontType.SIMPLE, text);
    }
    if (ret == null) {
      if (text != null) {
        FontLibrary.logger.warning('FontLibrary found no font for: ' + text);
      }
      ret = FontLibrary.mainFont;
    }
    ret = ret.deriveFont$int$float(style, size.forFont());
    if (ret == null) {
      FontLibrary.logger.warning('FontLibrary could not derive font for: ' + spec);
    } else {
      FontLibrary.fontCache.put(spec, ret);
    }
    return ret;
  }
  /**
   * Get a scaled font with a simple text specification.
   *
   * Beware the null return here.  Callers need to handle potential failure.
   *
   * @param spec The font specification.
   * @return The {@code Font} found, or null if scaling fails.
   */
  static getScaledFont$String(spec: string): Font {
    return FontLibrary.getScaledFont$String$String(spec, null);
  }
  /**
   * Get a scaled font with a simple text specification.
   *
   * Beware the null return here.  Callers need to handle potential failure.
   *
   * @param spec The font specification.
   * @param text Optional text that the font must be able to represent.
   * @return The {@code Font} found, or null if scaling fails.
   */
  static getScaledFont$String$String(spec: string, text: string): Font {
    let scaleFactor = FontLibrary.getFontScaling();
    return FontLibrary.getScaledFont$String$float$String(spec, scaleFactor, text);
  }
  /**
   * Gets the scaling factor for the main font.
   *
   * @return A scaling factor that can be used when scaling resources
   *      that should scale together with the font.
   */
  static getFontScaling(): number {
    return Math.fround(FontLibrary.mainFontSize / FontLibrary.DEFAULT_UNSCALED_MAIN_FONT_SIZE);
  }
  /**
   * Get a scaled font with a simple text specification.
   *
   * Beware the null return here.  Callers need to handle potential failure.
   *
   * @param spec The font specification.
   * @param scale The font scale (in addition to that in the specification).
   * @param text Optional text that the font must be able to represent.
   * @return The {@code Font} found, or null if scaling fails.
   */
  static getScaledFont$String$float$String(spec: string, scale: number, text: string): Font {
    let a = JString.split(spec, '-');
    if (a.length !== 3) {
      throw new RuntimeException('Bad font spec: ' + spec);
    }
    let unscaledFont = FontLibrary.getUnscaledFont$String$String(spec, text);
    let size = $J.enumValueOf($J.cls(Size), StringUtils.upCase$String(a[2]));
    let fontSize = Math.fround($J.roundf(Math.fround(size.forFont() * scale)));
    return unscaledFont.deriveFont$float(fontSize);
  }
  static $clinit() {
    FontLibrary.logger = Logger.getLogger($J.cls(FontLibrary).getName());
    FontLibrary.mainFontSize = 12;
    FontLibrary.keyMap = CollectionUtils.makeUnmodifiableMap([FontLibrary$FontType.NORMAL, FontLibrary$FontType.SIMPLE, FontLibrary$FontType.HEADER], ['font.normal', 'font.simple', 'font.header']);
    FontLibrary.mainFont = null;
    FontLibrary.fontCache = new HashMap();
  }
}

/**
 * FontType is used for choosing the typeface of the {@code Font}.
 *
 * Choices are:
 * <ul>
 * <li>NORMAL -- a normal system typeface</li>
 * <li>SIMPLE -- a simple typeface</li>
 * <li>HEADER -- a stylized old-fashioned typeface for headers</li>
 * </ul>
 */
export class FontLibrary$FontType extends JEnum {
  static NORMAL: FontLibrary$FontType = null;
  static SIMPLE: FontLibrary$FontType = null;
  static HEADER: FontLibrary$FontType = null;
  static $VALUES: FontLibrary$FontType[] = null;
  _FontLibrary$FontType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): FontLibrary$FontType[] { return FontLibrary$FontType.$VALUES.slice(); }
  static valueOf(name: string): FontLibrary$FontType { return $J.enumValueOf(FontLibrary$FontType, name); }
  static $clinit() {
    FontLibrary$FontType.NORMAL = new FontLibrary$FontType()._FontLibrary$FontType('NORMAL', 0);
    FontLibrary$FontType.SIMPLE = new FontLibrary$FontType()._FontLibrary$FontType('SIMPLE', 1);
    FontLibrary$FontType.HEADER = new FontLibrary$FontType()._FontLibrary$FontType('HEADER', 2);
    FontLibrary$FontType.$VALUES = [FontLibrary$FontType.NORMAL, FontLibrary$FontType.SIMPLE, FontLibrary$FontType.HEADER];
  }
}

$J.define(FontLibrary, 'net.sf.freecol.client.gui.FontLibrary', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_FontLibrary' }, meths: { 'getScaledFont(java.lang.String,float,java.lang.String)': 'getScaledFont$String$float$String', 'getScaledFont(java.lang.String,java.lang.String)': 'getScaledFont$String$String', 'getScaledFont(java.lang.String)': 'getScaledFont$String', 'getUnscaledFont(java.lang.String,java.lang.String)': 'getUnscaledFont$String$String', 'getUnscaledFont(java.lang.String)': 'getUnscaledFont$String' }, clinit: true, lazy: ['logger', 'mainFontSize', 'keyMap', 'mainFont', 'fontCache'] });
$J.define(FontLibrary$FontType, 'net.sf.freecol.client.gui.FontLibrary$FontType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_FontLibrary$FontType' }, clinit: true, lazy: ['$VALUES', 'NORMAL', 'SIMPLE', 'HEADER'] });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  Size = $J.load('net.sf.freecol.client.gui.Size');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
