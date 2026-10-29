// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/Video.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../jre/index.ts';

/**
 * Represents a video.
 */
export class Video extends JObject {
  url: URL = null;
  /**
   * Create a {@code Video}.
   *
   * @param url The {@code URL} to create the video from.
   */
  _Video(url: URL): this {
    this.url = url;
    return this;
  }
  getURL(): URL {
    return this.url;
  }
}

$J.define(Video, 'net.sf.freecol.common.resources.Video', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.net.URL': '_Video' }, returns: { 'getURL': 'java.net.URL' } });
