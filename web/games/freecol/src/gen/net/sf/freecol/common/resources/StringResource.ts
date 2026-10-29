// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/StringResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../jre/index.ts';
import { Resource } from './Resource.ts';

/**
 * A {@code Resource} wrapping an {@code String}.
 * @see Resource
 */
export class StringResource extends Resource {
  static readonly REPLACEMENT_STRING: string = 'X';
  data: string = null;
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *      resource.
   */
  _StringResource(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    this.data = resourceLocator.getPath();
    if (this.data.endsWith('"')) {
      this.data = this.data.substring(0, (this.data.length - 1) | 0);
    }
    let idx = this.data.lastIndexOf(String.fromCharCode(34 /* '"' */));
    if (idx > 0) {
      this.data = this.data.substring((idx + 1) | 0);
    }
    return this;
  }
  /**
   * {@inheritDoc}
   */
  preload(): void {
  }
  /**
   * Gets the {@code String} represented by this resource.
   *
   * @return The string resource.
   */
  getString(): string {
    return this.data;
  }
}

$J.define(StringResource, 'net.sf.freecol.common.resources.StringResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_StringResource' }, returns: { 'getString': 'java.lang.String' } });
