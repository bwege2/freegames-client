// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/PropertyList.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject, JString, NullPointerException } from '../../../../../../jre/index.ts';

/**
 * Allows properties to be stored in strings. This is used when storing several
 * property strings that should all be overriden when one of them are.
 */
export class PropertyList extends JObject {
  values_: JMap<string, string> = null;
  _PropertyList(propertiesString: string): this {
    this.values_ = new HashMap();
    for (let pair of JString.split(propertiesString, ',')) {
      let s = JString.split(pair, '=');
      this.values_.put(s[0], s[1]);
    }
    return this;
  }
  getString(key: string): string {
    return this.values_.get(key);
  }
  getInt$String$int(key: string, defaultValue: number): number {
    let value = this.values_.get(key);
    if (value != null) {
      return $J.parseInt(value);
    }
    return defaultValue;
  }
  getInt$String(key: string): number {
    let value = this.values_.get(key);
    if (value == null) {
      throw new NullPointerException('Missing value for key: ' + key);
    }
    return $J.parseInt(value);
  }
}

$J.define(PropertyList, 'net.sf.freecol.common.resources.PropertyList', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String': '_PropertyList' }, meths: { 'getInt(java.lang.String)': 'getInt$String', 'getInt(java.lang.String,int)': 'getInt$String$int' } });
