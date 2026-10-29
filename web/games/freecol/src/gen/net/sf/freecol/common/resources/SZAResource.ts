// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/SZAResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, IOException, Level, Logger } from '../../../../../../jre/index.ts';
import { Resource } from './Resource.ts';

let SimpleZippedAnimation;

/**
 * A {@code Resource} wrapping a {@code SimpleZippedAnimation}.
 *
 * @see Resource
 * @see SimpleZippedAnimation
 */
export class SZAResource extends Resource {
  static logger: Logger = null;
  static DEFAULT_SCALE: number = null;
  cache: HashMap<number, SimpleZippedAnimation> = null;
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *     resource.
   */
  _SZAResource(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    this.cache = new HashMap();
    return this;
  }
  /**
   * Preloading the animation.
   */
  preload(): void {
    {
      if (!this.cache.isEmpty()) {
        return;
      }
      try {
        let sza = new SimpleZippedAnimation()._SimpleZippedAnimation$URL(this.getResourceLocator().toURL());
        this.cache.put(SZAResource.DEFAULT_SCALE, sza);
      } catch ($e0) {
        if ($J.isa($e0, IOException)) {
          let e = $J.exc($e0);
          SZAResource.logger.log(Level.WARNING, 'Could not load SimpleZippedAnimation: ' + $J.str(this.getResourceLocator()), e);
        } else {
          throw $e0;
        }
      }
    }
  }
  /**
   * Gets the {@code SimpleZippedAnimation} represented by this
   * resource.
   *
   * @return The {@code SimpleZippedAnimation} in it's original size.
   */
  getSimpleZippedAnimation$(): SimpleZippedAnimation {
    return this.getSimpleZippedAnimation$float(+SZAResource.DEFAULT_SCALE);
  }
  /**
   * Get the {@code SimpleZippedAnimation} using the specified scale.
   *
   * @param scale The scale of the requested animation.
   * @return The {@code SimpleZippedAnimation}.
   */
  getSimpleZippedAnimation$float(scale: number): SimpleZippedAnimation {
    let cached = this.cache.get($J.boxF(scale));
    if (cached != null) {
      return cached;
    }
    let sza = this.cache.get(SZAResource.DEFAULT_SCALE).createScaledVersion(scale);
    this.cache.put($J.boxF(scale), sza);
    return sza;
  }
  static $clinit() {
    SZAResource.logger = Logger.getLogger($J.cls(SZAResource).getName());
    SZAResource.DEFAULT_SCALE = $J.boxF(1);
  }
}

$J.define(SZAResource, 'net.sf.freecol.common.resources.SZAResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_SZAResource' }, returns: { 'getSimpleZippedAnimation$': 'net.sf.freecol.common.io.sza.SimpleZippedAnimation' }, meths: { 'getSimpleZippedAnimation(float)': 'getSimpleZippedAnimation$float', 'getSimpleZippedAnimation()': 'getSimpleZippedAnimation$' }, clinit: true, lazy: ['logger', 'DEFAULT_SCALE'] });
$J.module(() => {
  SimpleZippedAnimation = $J.load('net.sf.freecol.common.io.sza.SimpleZippedAnimation');
});
