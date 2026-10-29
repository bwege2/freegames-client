// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/ColorResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalAccessException, IllegalArgumentException, JString, Level, Logger, NoSuchFieldException, NumberFormatException, SecurityException } from '../../../../../../jre/index.ts';
import { Resource } from './Resource.ts';

let Color;

/**
 * A {@code Resource} wrapping a {@code Color}.
 *
 * @see Resource
 * @see Color
 */
export class ColorResource extends Resource {
  static logger: Logger = null;
  static REPLACEMENT_COLOR: Color = null;
  static readonly SCHEME: string = 'color:';
  color: Color = null;
  _ColorResource$String$Color(primaryKey: string, color: Color): this {
    this._Resource$String(primaryKey);
    this.color = color;
    return this;
  }
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *     resource.
   */
  _ColorResource$String$URI(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    let colorName = resourceLocator.getSchemeSpecificPart().substring(ColorResource.SCHEME.length);
    this.color = ColorResource.createColor(colorName);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  preload(): void {
  }
  /**
   * Gets the {@code Color} represented by this resource.
   *
   * @return The {@code Color} in it's original size.
   */
  getColor(): Color {
    return this.color;
  }
  static isHexString(str: string): boolean {
    if (str == null || !(str.startsWith('0x') || str.startsWith('0X')) || str.length <= 2) {
      return false;
    }
    for (let i = 2; i < str.length; i++) {
      if (!'0123456789ABCDEFabcdef'.includes(str.substring(i, (i + 1) | 0))) {
        return false;
      }
    }
    return true;
  }
  /**
   * Returns the {@code Color} identified by the given
   * string. This is either a hexadecimal integer prefixed with
   * "0x", or the name of a field of the Color class.
   *
   * @param colorName a {@code String} value
   * @return a {@code Color} value
   */
  static createColor(colorName: string): Color {
    if (ColorResource.isHexString(colorName)) {
      try {
        let col = ((+$J.Long_decode(colorName))) | 0;
        return new Color()._Color$int$boolean(col, colorName.length > 8);
      } catch ($e0) {
        if ($J.isa($e0, NumberFormatException)) {
          let e = $J.exc($e0);
          ColorResource.logger.warning('Failed to decode hex colour string: ' + colorName);
        } else {
          throw $e0;
        }
      }
    } else {
      try {
        let field = $J.cls(Color).getField(colorName);
        return field.get(null);
      } catch ($e1) {
        if ($J.isa($e1, IllegalAccessException) || $J.isa($e1, IllegalArgumentException) || $J.isa($e1, NoSuchFieldException) || $J.isa($e1, SecurityException)) {
          let e = $J.exc($e1);
          ColorResource.logger.log(Level.WARNING, 'Failed to decode colour', e);
        } else {
          throw $e1;
        }
      }
    }
    return ColorResource.REPLACEMENT_COLOR;
  }
  static $clinit() {
    ColorResource.logger = Logger.getLogger($J.cls(ColorResource).getName());
    ColorResource.REPLACEMENT_COLOR = Color.MAGENTA;
  }
}

$J.define(ColorResource, 'net.sf.freecol.common.resources.ColorResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_ColorResource$String$URI', 'java.lang.String,java.awt.Color': '_ColorResource$String$Color' }, returns: { 'getColor': 'java.awt.Color' }, clinit: true, lazy: ['logger', 'REPLACEMENT_COLOR'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
});
