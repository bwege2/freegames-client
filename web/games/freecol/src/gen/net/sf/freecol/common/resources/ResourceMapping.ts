// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/ResourceMapping.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JObject, JString, Logger } from '../../../../../../jre/index.ts';

let AudioResource, ColorResource, FAFileResource, FontResource, ImageResource, SZAResource, StringResource, VideoResource;

/**
 * Represents a mapping between identifiers and resources.
 *
 * @see Resource
 */
export class ResourceMapping extends JObject {
  static logger: Logger = null;
  colorResources: JMap<string, ColorResource> = null;
  fontResources: JMap<string, FontResource> = null;
  stringResources: JMap<string, StringResource> = null;
  fafResources: JMap<string, FAFileResource> = null;
  szaResources: JMap<string, SZAResource> = null;
  audioResources: JMap<string, AudioResource> = null;
  videoResources: JMap<string, VideoResource> = null;
  imageResources: JMap<string, ImageResource> = null;
  resourceTypes: JMap<JClass<any>, ResourceMapping$ResourceType<any>> = null;
  /**
   * Creates a new empty {@code ResourceMapping}.
   */
  _ResourceMapping(): this {
    this.colorResources = new HashMap();
    this.fontResources = new HashMap();
    this.stringResources = new HashMap();
    this.fafResources = new HashMap();
    this.szaResources = new HashMap();
    this.audioResources = new HashMap();
    this.videoResources = new HashMap();
    this.imageResources = new HashMap();
    this.resourceTypes = ResourceMapping.mapFrom([new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(ColorResource), 'color.', this.colorResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(FontResource), 'font.', this.fontResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(StringResource), null, this.stringResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(FAFileResource), 'animatedfont.', this.fafResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(SZAResource), 'animation.', this.szaResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(AudioResource), 'sound.', this.audioResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(VideoResource), 'video.', this.videoResources), new ResourceMapping$ResourceType()._ResourceMapping$ResourceType($J.cls(ImageResource), 'image.', this.imageResources)]);
    return this;
  }
  add(key: string, resource: Resource): boolean {
    let resourceType = this.resourceTypes.get(resource.getClass());
    return resourceType.put(key, resource);
  }
  /**
   * Create another mapping for a Resource under a different key.
   *
   * @param key The key to find the existing Resource.
   * @param keyNew The new key for the duplicate.
   * @return true on success
   */
  duplicateResource(key: string, keyNew: string): boolean {
    let cr = this.colorResources.get(key);
    if (cr != null) {
      return this.add(keyNew, cr);
    }
    let fr = this.fontResources.get(key);
    if (fr != null) {
      return this.add(keyNew, fr);
    }
    let sr = this.stringResources.get(key);
    if (sr != null) {
      return this.add(keyNew, sr);
    }
    let far = this.fafResources.get(key);
    if (far != null) {
      return this.add(keyNew, far);
    }
    let szr = this.szaResources.get(key);
    if (szr != null) {
      return this.add(keyNew, szr);
    }
    let ar = this.audioResources.get(key);
    if (ar != null) {
      return this.add(keyNew, ar);
    }
    let vr = this.videoResources.get(key);
    if (vr != null) {
      return this.add(keyNew, vr);
    }
    let ir = this.imageResources.get(key);
    if (ir != null) {
      return this.add(keyNew, ir);
    }
    return false;
  }
  /**
   * Adds all mappings from the given {@code ResourceMapping} to
   * this object.
   *
   * @param rc The {@code ResourceMapping}.
   */
  addAll(rc: ResourceMapping): void {
    if (rc == null) {
      return;
    }
    this.colorResources.putAll(rc.colorResources);
    this.fontResources.putAll(rc.fontResources);
    this.stringResources.putAll(rc.stringResources);
    this.fafResources.putAll(rc.fafResources);
    this.szaResources.putAll(rc.szaResources);
    this.audioResources.putAll(rc.audioResources);
    this.videoResources.putAll(rc.videoResources);
    this.imageResources.putAll(rc.imageResources);
  }
  /**
   * Get an {@code AudioResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code AudioResource} found.
   */
  getAudioResource(key: string): AudioResource {
    return this.audioResources.get(key);
  }
  /**
   * Get an {@code ColorResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code ColorResource} found.
   */
  getColorResource(key: string): ColorResource {
    return this.colorResources.get(key);
  }
  /**
   * Get an {@code FAFileResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code FAFileResource} found.
   */
  getFAFileResource(key: string): FAFileResource {
    return this.fafResources.get(key);
  }
  /**
   * Get an {@code FontResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code FontResource} found.
   */
  getFontResource(key: string): FontResource {
    return this.fontResources.get(key);
  }
  /**
   * Get an {@code ImageResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code ImageResource} found.
   */
  getImageResource(key: string): ImageResource {
    return this.imageResources.get(key);
  }
  /**
   * Get an {@code StringResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code StringResource} found.
   */
  getStringResource(key: string): StringResource {
    return this.stringResources.get(key);
  }
  /**
   * Get an {@code SZAResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code SZAResource} found.
   */
  getSZAResource(key: string): SZAResource {
    return this.szaResources.get(key);
  }
  /**
   * Get an {@code VideoResource} by identifier.
   *
   * @param key The resource identifier.
   * @return The {@code VideoResource} found.
   */
  getVideoResource(key: string): VideoResource {
    return this.videoResources.get(key);
  }
  /**
   * Get the image keys in this mapping.
   *
   * @return A set of keys.
   */
  getImageKeySet(): JSet<string> {
    return this.imageResources.keySet();
  }
  /**
   * Preload all resources in this mapping.
   *
   * @param preloadController The {@code PreloadController} handling
   *     this preload.
   * @return The number of resources loaded.
   */
  preload(preloadController: ResourceMapping$PreloadController): number {
    let ret = 0;
    for (const $it0 = this.colorResources.values().iterator(); $it0.hasNext(); ) {
      let r = $it0.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it1 = this.fontResources.values().iterator(); $it1.hasNext(); ) {
      let r = $it1.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it2 = this.stringResources.values().iterator(); $it2.hasNext(); ) {
      let r = $it2.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it3 = this.videoResources.values().iterator(); $it3.hasNext(); ) {
      let r = $it3.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it4 = this.imageResources.values().iterator(); $it4.hasNext(); ) {
      let r = $it4.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it5 = this.fafResources.values().iterator(); $it5.hasNext(); ) {
      let r = $it5.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it6 = this.szaResources.values().iterator(); $it6.hasNext(); ) {
      let r = $it6.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    for (const $it7 = this.audioResources.values().iterator(); $it7.hasNext(); ) {
      let r = $it7.next();
      if (!$J.fn(preloadController, 'shouldContinue')()) {
        return ret;
      }
      r.preload();
      ret++;
    }
    return ret;
  }
  clearCaches(): void {
    this.imageResources.values().stream().forEach((r) => r.clean());
  }
  static mapFrom(resourceTypes: ResourceMapping$ResourceType<any>[]): JMap<JClass<any>, ResourceMapping$ResourceType<any>> {
    let map = new HashMap();
    for (let r of resourceTypes) {
      map.put(r.clazz, r);
    }
    return map;
  }
  static $clinit() {
    ResourceMapping.logger = Logger.getLogger($J.cls(ResourceMapping).getName());
  }
}

export class ResourceMapping$PreloadController {
}

export class ResourceMapping$ResourceType<T> extends JObject {
  clazz: JClass<T> = null;
  requiredKeyPrefix: string = null;
  resources: JMap<string, T> = null;
  _ResourceMapping$ResourceType(clazz: JClass<T>, requiredKeyPrefix: string, resources: JMap<string, T>): this {
    this.clazz = clazz;
    this.requiredKeyPrefix = requiredKeyPrefix;
    this.resources = resources;
    return this;
  }
  put(key: string, resource: any): boolean {
    if (this.requiredKeyPrefix != null && !key.startsWith(this.requiredKeyPrefix)) {
      ResourceMapping.logger.warning('Rejecting malformed resource key: "' + key + '". The key should have started with: "' + this.requiredKeyPrefix + '".');
      return false;
    }
    this.resources.put(key, this.clazz.cast(resource));
    return true;
  }
}

$J.define(ResourceMapping, 'net.sf.freecol.common.resources.ResourceMapping', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ResourceMapping' }, returns: { 'getImageKeySet': 'java.util.Set' }, clinit: true, lazy: ['logger'] });
$J.define(ResourceMapping$PreloadController, 'net.sf.freecol.common.resources.ResourceMapping$PreloadController', { kind: 'interface' });
$J.define(ResourceMapping$ResourceType, 'net.sf.freecol.common.resources.ResourceMapping$ResourceType', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.lang.Class,java.lang.String,java.util.Map': '_ResourceMapping$ResourceType' } });
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
