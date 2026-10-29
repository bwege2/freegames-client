// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/model/TileImprovementStyle.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Character, HashMap, JObject, JString, StringBuilder } from '../../../../../../jre/index.ts';

/**
 * Represents the style of a tile improvement, such as a river or
 * road. Since TileImprovementStyles are immutable and some styles are
 * far more common than others (e.g. rivers with two branches are far
 * more common than rivers with a single branch, or three or four
 * branches), the class caches all styles actually used.
 *
 * As of 0.10.6 we use:
 *   - Four character encoded strings for rivers: a "0" for no connection,
 *     otherwise the string value of the integer magnitude of the river
 *     for each of Direction.longSides.
 *   - Eight character binary encoded strings for roads: a "0" or "1" for
 *     each of Direction.values()
 *   These are distinct so that the overlays can vary.
 */
export class TileImprovementStyle extends JObject {
  /**
   * Cache all TileImprovementStyles.
   */
  static cache: JMap<string, TileImprovementStyle> = null;
  /**
   * A key for the tile improvement style.
   */
  style: string = null;
  /**
   * A key for the forest overlay, derived from the above.
   */
  mask: string = null;
  /**
   * Private constructor, only called in getInstance() below.
   *
   * @param style The (decoded) style.
   */
  _TileImprovementStyle(style: string): this {
    this.style = style;
    let sb = new StringBuilder();
    for (let i = 0; i < style.length; i++) {
      let c = style.charCodeAt(i);
      if (Character.digit(c, 36) < 0) {
        break;
      }
      sb.append((c === 48 /* '0' */) ? '0' : '1');
    }
    this.mask = sb.toString();
    return this;
  }
  /**
   * Gets the key suitable for looking up an appropriate tile
   * improvement image.
   *
   * @return The tile improvement lookup key.
   */
  getString(): string {
    return this.style;
  }
  /**
   * Gets the key suitable for looking up an appropriate overlay
   * (forest) image.
   *
   * @return The overlay lookup key.
   */
  getMask(): string {
    return this.mask;
  }
  /**
   * Gets the style corresponding to the given string.
   *
   * @param key The key to look up.
   * @return The corresponding {@code TileImprovementStyle}.
   */
  static getInstance(key: string): TileImprovementStyle {
    if (key == null || (key.length !== 4 && key.length !== 8)) {
      return null;
    }
    let result = TileImprovementStyle.cache.get(key);
    if (result == null) {
      result = new TileImprovementStyle()._TileImprovementStyle(key);
      TileImprovementStyle.cache.put(key, result);
      if (!$J.equals(result.getString(), key)) {
        TileImprovementStyle.cache.put(result.getString(), result);
      }
    }
    return result;
  }
  /**
   * {@inheritDoc}
   */
  toString(): string {
    return this.style;
  }
  static $clinit() {
    TileImprovementStyle.cache = new HashMap();
  }
}

$J.define(TileImprovementStyle, 'net.sf.freecol.common.model.TileImprovementStyle', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_TileImprovementStyle' }, returns: { 'getMask': 'java.lang.String', 'getString': 'java.lang.String' }, clinit: true, lazy: ['cache'] });
