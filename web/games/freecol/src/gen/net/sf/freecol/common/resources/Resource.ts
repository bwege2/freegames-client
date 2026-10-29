// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/Resource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, Objects } from '../../../../../../jre/index.ts';

/**
 * Represents a resource that either has been or can be loaded using a
 * {@code URI}.  There can only be one instance of
 * {@code Resource} having the same (as in URI's equals, not the
 * identity) {@code URI}.
 */
export class Resource extends JObject {
  /**
   * The {@code URI} used when loading this resource.
   */
  resourceLocator: URI = null;
  /**
   * The key for the resource to be used for caching purposes.
   *
   * This is used when multiple keys are pointing to the same {@code Resource}.
   */
  cachingKey: string = null;
  /**
   * Trivial constructor.
   *
   * @param cachingKey The key used for caching the image.
   */
  _Resource$String(cachingKey: string): this {
    this._Resource$String$URI(cachingKey, null);
    return this;
  }
  /**
   * Do not use directly.
   *
   * @param cachingKey The key for the primary version of the resource,
   *      that is the key when the {@code Resource} was created.
   * @param resourceLocator The {@code URI} used when loading this
   *      resource.
   */
  _Resource$String$URI(cachingKey: string, resourceLocator: URI): this {
    this.cachingKey = Objects.requireNonNull(cachingKey);
    this.resourceLocator = resourceLocator;
    return this;
  }
  /**
   * The caching key of the resource. This key is used for caching
   * purposes since it will be the same for a resource no matter how
   * many keys point to the same resource.
   *
   * Beware: All variations and sizes share the same primary key.
   *
   * @return The key.
   */
  getCachingKey(): string {
    return this.cachingKey;
  }
  /**
   * Returns the {@code URI} used for loading the resource.
   * @return The {@code URI}.
   */
  getResourceLocator(): URI {
    return this.resourceLocator;
  }
}

/**
 * Implement the Cleanable interface if a Resource has a use for
 * calls to a clean method.
 */
export class Resource$Cleanable {
}

$J.define(Resource, 'net.sf.freecol.common.resources.Resource', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.String,java.net.URI': '_Resource$String$URI', 'java.lang.String': '_Resource$String' }, returns: { 'getResourceLocator': 'java.net.URI', 'getCachingKey': 'java.lang.String' } });
$J.define(Resource$Cleanable, 'net.sf.freecol.common.resources.Resource$Cleanable', { kind: 'interface' });
