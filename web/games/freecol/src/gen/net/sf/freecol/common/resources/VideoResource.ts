// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/VideoResource.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let Video;

/**
 * A {@code Resource} wrapping a {@code Video}.
 *
 * @see Resource
 * @see Video
 */
export class VideoResource extends Resource {
  video: Video = null;
  /**
   * Do not use directly.
   *
   * @param cachingKey The caching key.
   * @param resourceLocator The {@code URI} used when loading this
   *     resource.
   * @exception IOException if the URI is malformed.
   */
  _VideoResource(cachingKey: string, resourceLocator: URI): this {
    this._Resource$String$URI(cachingKey, resourceLocator);
    this.video = new Video()._Video(resourceLocator.toURL());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  preload(): void {
  }
  /**
   * Gets the {@code Video} represented by this resource.
   *
   * @return The {@code Video} in its original size.
   */
  getVideo(): Video {
    return this.video;
  }
}

$J.define(VideoResource, 'net.sf.freecol.common.resources.VideoResource', { kind: 'class', sup: 'net.sf.freecol.common.resources.Resource', ctors: { 'java.lang.String,java.net.URI': '_VideoResource' }, returns: { 'getVideo': 'net.sf.freecol.common.resources.Video' } });
$J.module(() => {
  Video = $J.load('net.sf.freecol.common.resources.Video');
});
