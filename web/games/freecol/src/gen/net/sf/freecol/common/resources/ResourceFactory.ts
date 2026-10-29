// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/ResourceFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, IOException, JObject, JString, Level, Logger } from '../../../../../../jre/index.ts';

let AudioResource, ColorResource, FAFileResource, FontResource, ImageResource, SZAResource, StringResource, VideoResource;

/**
 * A factory class for creating {@code Resource} instances.
 * @see Resource
 */
export class ResourceFactory extends JObject {
  static logger: Logger = null;
  /**
   * Ensures that only one {@code Resource} is created given the same {@code URI}.
   */
  resources: JMap<URI, Resource> = null;
  _ResourceFactory(): this {
    this.resources = new HashMap();
    return this;
  }
  /**
   * Returns an instance of {@code Resource} with the
   * given {@code URI} as the parameter.
   *
   * @param key The key part of the resource mapping.
   * @param cachingKey The caching key.
   * @param uri The {@code URI} used when creating the instance.
   * @return The <code>Resource</code> if created.
   */
  createResource(key: string, cachingKey: string, uri: URI): Resource {
    let r = this.resources.get(uri);
    if (r != null) {
      return r;
    }
    let pathPart: string;
    if (uri.getPath() != null) {
      pathPart = uri.getPath();
    } else if (uri.toString().indexOf('!/') >= 0) {
      pathPart = uri.toString().substring((uri.toString().indexOf('!/') + 2) | 0);
    } else {
      pathPart = null;
    }
    try {
      let resource: Resource;
      if ($J.equals('urn', uri.getScheme())) {
        if (uri.getSchemeSpecificPart().startsWith(ColorResource.SCHEME)) {
          resource = new ColorResource()._ColorResource$String$URI(cachingKey, uri);
        } else if (uri.getSchemeSpecificPart().startsWith(FontResource.SCHEME)) {
          resource = new FontResource()._FontResource$String$URI(cachingKey, uri);
        } else {
          ResourceFactory.logger.log(Level.WARNING, 'Unknown urn part: ' + uri.getSchemeSpecificPart());
          return null;
        }
      } else if (pathPart.endsWith('"') && pathPart.lastIndexOf(String.fromCharCode(34 /* '"' */), (pathPart.length - 1) | 0) >= 0) {
        resource = new StringResource()._StringResource(cachingKey, uri);
      } else if (pathPart.endsWith('.faf')) {
        resource = new FAFileResource()._FAFileResource$String$URI(cachingKey, uri);
      } else if (pathPart.endsWith('.sza')) {
        resource = new SZAResource()._SZAResource(cachingKey, uri);
      } else if (pathPart.endsWith('.ttf')) {
        resource = new FontResource()._FontResource$String$URI(cachingKey, uri);
      } else if (pathPart.endsWith('.wav')) {
        resource = new AudioResource()._AudioResource(cachingKey, uri);
      } else if (pathPart.endsWith('.ogg')) {
        if (pathPart.endsWith('.video.ogg')) {
          resource = new VideoResource()._VideoResource(cachingKey, uri);
        } else {
          resource = new AudioResource()._AudioResource(cachingKey, uri);
        }
      } else if (key.startsWith('sound.')) {
        resource = new AudioResource()._AudioResource(cachingKey, uri);
      } else {
        resource = new ImageResource()._ImageResource(cachingKey, uri);
      }
      this.resources.put(uri, resource);
      return resource;
    } catch ($e0) {
      if ($J.isa($e0, IOException)) {
        let ioe = $J.exc($e0);
        ResourceFactory.logger.log(Level.WARNING, 'Failed to create ' + $J.str(uri), ioe);
        return null;
      } else {
        throw $e0;
      }
    }
  }
  static $clinit() {
    ResourceFactory.logger = Logger.getLogger($J.cls(ResourceFactory).getName());
  }
}

$J.define(ResourceFactory, 'net.sf.freecol.common.resources.ResourceFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ResourceFactory' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AudioResource = $J.load('net.sf.freecol.common.resources.AudioResource');
  ColorResource = $J.load('net.sf.freecol.common.resources.ColorResource');
  FAFileResource = $J.load('net.sf.freecol.common.resources.FAFileResource');
  FontResource = $J.load('net.sf.freecol.common.resources.FontResource');
  ImageResource = $J.load('net.sf.freecol.common.resources.ImageResource');
  SZAResource = $J.load('net.sf.freecol.common.resources.SZAResource');
  StringResource = $J.load('net.sf.freecol.common.resources.StringResource');
  VideoResource = $J.load('net.sf.freecol.common.resources.VideoResource');
});
