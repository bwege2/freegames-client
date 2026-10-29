// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/common/resources/ImageCache.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, HashMap, IllegalStateException, InterruptedException, JObject, Level, Logger, ReferenceQueue, SoftReference, Thread } from '../../../../../../jre/index.ts';

let Dimension, FreeCol, ResourceManager;

/**
 * Wrapper around ResourceManager for caching image resources.
 */
export class ImageCache extends JObject {
  static logger: Logger = null;
  static readonly DEBUG_PRINT_CACHE_SIZES_TO_STDOUT: boolean = false;
  static readonly REPLACEMENT_IMAGE: string = 'image.miscicon.delete';
  /**
   * A cache of scaled (and possibly greyed) images.
   */
  cache: JMap<number, BufferedImage> = null;
  lowPriorityCache: JMap<number, ImageCache$CacheSoftReference<number, BufferedImage>> = null;
  lowPriorityCacheReferenceQueue: ReferenceQueue<BufferedImage> = null;
  cleanupThread: ImageCache$CacheCleanupThread = null;
  cacheSize: number = 0;
  lowPriorityCacheSize: number = 0;
  /**
   * Initialize this image cache.
   */
  _ImageCache(): this {
    this.lowPriorityCacheReferenceQueue = new ReferenceQueue();
    this.cleanupThread = new ImageCache$CacheCleanupThread().$o(this)._ImageCache$CacheCleanupThread();
    this.cacheSize = 0;
    this.lowPriorityCacheSize = 0;
    this.cache = new HashMap();
    this.lowPriorityCache = new HashMap();
    this.cleanupThread.start();
    return this;
  }
  /**
   * Get an image resource by key from the resource manager.
   *
   * Fall back to a replacement image on failure.  Failure to find
   * that is fatal.  Image resource failure has already been logged.
   *
   * @param key The key to look up.
   * @return The {@code ImageResource} found.
   */
  static getImageResource(key: string): ImageResource {
    let r = ResourceManager.getImageResource(key, false);
    if (r == null) {
      r = ResourceManager.getImageResource(ImageCache.REPLACEMENT_IMAGE, false);
      if (r == null) {
        FreeCol.fatal$Logger$String(ImageCache.logger, 'Replacement image not found: ' + ImageCache.REPLACEMENT_IMAGE);
      }
    }
    return r;
  }
  /**
   * Hash function for images.
   *
   * We accept the standard 32-bit int hashCode of the key, and
   * or it with 12 bits of the width and height, 6 bits for variations and
   * one more bit for the grayscale boolean.
   *
   * @param key The image key.
   * @param size The size of the image.
   * @param grayscale True if grayscale.
   * @param variation The image variation.
   * @return A unique hash of these parameters.
   */
  static imageHash(key: string, size: Dimension, grayscale: boolean, variation: number): number {
    if (variation >= 64) {
      throw new IllegalStateException('Update formula below in order to support more variations.');
    }
    if (size.width_ >= 4096) {
      throw new IllegalStateException('Update formula below in order to support larger image width.');
    }
    if (size.height_ >= 4096) {
      throw new IllegalStateException('Update formula below in order to support larger image heights.');
    }
    return $J.lxor($J.lxor($J.lxor($J.lxor(($J.land($J.hashCode(key), 4294967295)), ($J.lshl(($J.land(size.width_, 32767)), 32))), ($J.lshl(($J.land(size.height_, 32767)), 44))), (variation << 56)), ((grayscale) ? ($J.lshl(1, 62)) : 0) + variation);
  }
  /**
   * Get an image, checking first if it is in the cache.
   *
   * All requests for scaled images come through here, so this is
   * where to maintain the image cache.
   *
   * @param ir The {@code ImageResource} to load from.
   * @param size The size of the requested image.
   *     Rescaling will be performed if necessary.
   * @param grayscale If true return a grayscale image.
   * @param variation The image variation.
   * @return The image identified by {@code resource}.
   */
  getCachedImage(ir: ImageResource, size: Dimension, grayscale: boolean, variation: number): BufferedImage {
    let cacheKey = ImageCache.imageHash(ir.getCachingKey(), size, grayscale, variation);
    let cached = this.searchCaches(cacheKey);
    if (cached != null) {
      return cached;
    }
    let image = ir.getImage$int$Dimension$boolean(variation, size, grayscale);
    this.placeImageInCache(cacheKey, image);
    return image;
  }
  getCachedImageOrGenerate(key: string, size: Dimension, grayscale: boolean, variation: number, imageCreator: Callable<BufferedImage>): BufferedImage {
    let cacheKey = ImageCache.imageHash(key, size, grayscale, variation);
    let cached = this.searchCaches(cacheKey);
    if (cached != null) {
      return cached;
    }
    try {
      let image = imageCreator();
      this.placeImageInLowPriorityCache(cacheKey, image);
      return image;
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let e = $J.exc($e0);
        ImageCache.logger.log(Level.WARNING, 'Exception while producing image', e);
        return null;
      } else {
        throw $e0;
      }
    }
  }
  searchCaches(cacheKey: number): BufferedImage {
    let image = this.cache.get(cacheKey);
    if (image != null) {
      return image;
    }
    image = this.getFromLowPriorityCache(cacheKey);
    if (image != null) {
      return image;
    }
    return null;
  }
  getFromLowPriorityCache(cacheKey: number): BufferedImage {
    let ref = this.lowPriorityCache.get(cacheKey);
    return (ref != null) ? ref.get() : null;
  }
  placeImageInCache(hashKey: number, image: BufferedImage): void {
    if (image != null) {
      this.cache.put(hashKey, image);
      this.cacheSize += Math.imul(Math.imul(image.getWidth(), image.getHeight()), 4);
      this.debugPrintCacheSizes();
    }
  }
  placeImageInLowPriorityCache(hashKey: number, image: BufferedImage): void {
    if (image != null) {
      let size = Math.imul(Math.imul(image.getWidth(), image.getHeight()), 4);
      let ref = new ImageCache$CacheSoftReference().$o(this)._ImageCache$CacheSoftReference(hashKey, size, image, this.lowPriorityCacheReferenceQueue);
      this.lowPriorityCache.put(hashKey, ref);
      this.lowPriorityCacheSize += size;
      this.debugPrintCacheSizes();
    }
  }
  debugPrintCacheSizes(): void {
    if (ImageCache.DEBUG_PRINT_CACHE_SIZES_TO_STDOUT) {
      $J.out.format('Cache: %4sMB   Low priority cache: %4sMB\n', $J.roundf(Math.fround($J.ldiv(this.cacheSize, (Math.imul(1024, 1024))))), $J.roundf(Math.fround($J.ldiv(this.lowPriorityCacheSize, (Math.imul(1024, 1024))))));
    }
  }
  /**
   * Get the image specified by the given name, scale and grayscale.
   *
   * @param key The name of the resource to return.
   * @param scale A scaling to apply to the base image size.
   * @param grayscale If true return a grayscale image.
   * @return The image found.
   */
  getScaledImage(key: string, scale: number, grayscale: boolean): BufferedImage {
    let ir = ImageCache.getImageResource(key);
    let image = ir.getImage$();
    if (image == null) {
      return null;
    }
    let d = new Dimension()._Dimension$int$int($J.roundf(Math.fround(image.getWidth() * scale)), $J.roundf(Math.fround(image.getHeight() * scale)));
    return this.getCachedImage(ir, d, grayscale, 0);
  }
  /**
   * Get the image specified by the given name, size and grayscale.
   *
   * Please, avoid using too many different sizes!
   * For each is a scaled image cached here for a long time,
   * which wastes memory if you are not careful.
   *
   * @param key The name of the resource to return.
   * @param size The size of the requested image.
   * @param grayscale If true return a grayscale image.
   * @return The image found.
   */
  getSizedImage$String$Dimension$boolean(key: string, size: Dimension, grayscale: boolean): BufferedImage {
    return this.getSizedImage$String$Dimension$boolean$int(key, size, grayscale, 0);
  }
  /**
   * Get the image specified by the given name, size and grayscale.
   *
   * Please, avoid using too many different sizes!
   * For each is a scaled image cached here for a long time,
   * which wastes memory if you are not careful.
   *
   * @param key The name of the resource to return.
   * @param size The size of the requested image.
   * @param grayscale If true return a grayscale image.
   * @param seed A seed used for getting the same "random" picture every
   *      time.
   * @return The image found.
   */
  getSizedImage$String$Dimension$boolean$int(key: string, size: Dimension, grayscale: boolean, seed: number): BufferedImage {
    let ir = ImageCache.getImageResource(key);
    return this.getCachedImage(ir, size, grayscale, ir.getVariationNumberForSeed(seed));
  }
  /**
   * Clear this cache.
   */
  clear(): void {
    this.cache.clear();
    this.cacheSize = 0;
    this.clearLowPriorityCache();
  }
  clearLowPriorityCache(): void {
    this.lowPriorityCache.clear();
    this.lowPriorityCacheSize = 0;
  }
  static $clinit() {
    ImageCache.logger = Logger.getLogger($J.cls(ImageCache).getName());
  }
}

export class ImageCache$CacheCleanupThread extends Thread {
  _ImageCache$CacheCleanupThread(): this {
    this._Thread();
    return this;
  }
  run(): void {
    try {
      while (true) {
        let ref = this.$outer.lowPriorityCacheReferenceQueue.remove();
        if (ref == null) {
          continue;
        }
        this.$outer.lowPriorityCacheSize -= ref.getSize();
        this.$outer.lowPriorityCache.remove(ref.getKey());
      }
    } catch ($e1) {
      if ($J.isa($e1, InterruptedException)) {
        let e = $J.exc($e1);
      } else {
        throw $e1;
      }
    }
  }
}

export class ImageCache$CacheSoftReference<K, V> extends SoftReference {
  key: K = null;
  size_: number = 0;
  _ImageCache$CacheSoftReference(key: K, size: number, referent: V, q: ReferenceQueue<any>): this {
    this._SoftReference(referent, q);
    this.key = key;
    this.size_ = size;
    return this;
  }
  getKey(): K {
    return this.key;
  }
  getSize(): number {
    return this.size_;
  }
}

$J.define(ImageCache, 'net.sf.freecol.common.resources.ImageCache', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ImageCache' }, meths: { 'getSizedImage(java.lang.String,java.awt.Dimension,boolean,int)': 'getSizedImage$String$Dimension$boolean$int', 'getSizedImage(java.lang.String,java.awt.Dimension,boolean)': 'getSizedImage$String$Dimension$boolean' }, clinit: true, lazy: ['logger'] });
$J.define(ImageCache$CacheCleanupThread, 'net.sf.freecol.common.resources.ImageCache$CacheCleanupThread', { kind: 'class', sup: 'java.lang.Thread', ctors: { '': '_ImageCache$CacheCleanupThread' }, inner: true });
$J.define(ImageCache$CacheSoftReference, 'net.sf.freecol.common.resources.ImageCache$CacheSoftReference', { kind: 'class', sup: 'java.lang.ref.SoftReference', ctors: { 'java.lang.Object,long,java.lang.Object,java.lang.ref.ReferenceQueue': '_ImageCache$CacheSoftReference' }, returns: { 'getSize': 'long' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  FreeCol = $J.load('net.sf.freecol.FreeCol');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
});
