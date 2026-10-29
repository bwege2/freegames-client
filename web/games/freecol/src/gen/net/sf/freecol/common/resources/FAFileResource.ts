// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/FAFileResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { Resource } from './Resource.ts';

let FAFile;

/**
 * A {@code Resource} wrapping a {@code FAFile}.
 *
 * @see Resource
 * @see FAFile
 */
export class FAFileResource extends Resource {
  FAFile: FAFile = null;
  _FAFileResource$String$FAFile(primaryKey: string, FAFile: FAFile): this {
    this._Resource$String(primaryKey);
    this.FAFile = FAFile;
    return this;
  }
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *     resource.
   * @exception IOException if FAFile can not be opened.
   */
  _FAFileResource$String$URI(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    let url = resourceLocator.toURL();
    this.FAFile = new FAFile()._FAFile(url.openStream());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  preload(): void {
  }
  /**
   * Gets the {@code FAFile} represented by this resource.
   *
   * @return The {@code FAFile} for this resource, or the default
   *     Java FAFile if none found.
   */
  getFAFile(): FAFile {
    return this.FAFile;
  }
}

$J.define(FAFileResource, 'net.sf.freecol.common.resources.FAFileResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_FAFileResource$String$URI', 'java.lang.String,net.sf.freecol.common.resources.FAFile': '_FAFileResource$String$FAFile' }, returns: { 'getFAFile': 'net.sf.freecol.common.resources.FAFile' } });
$J.module(() => {
  FAFile = $J.load('net.sf.freecol.common.resources.FAFile');
});
