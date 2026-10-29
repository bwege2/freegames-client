// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/swing/CachedPainter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2004, 2023, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, BufferedImage, HashMap, JObject, SurfaceManager } from '../../../jre/index.ts';
import { AbstractMultiResolutionImage } from '../../java/awt/image/AbstractMultiResolutionImage.ts';

let VolatileImage, ImageCache;

/**
 * A base class used for icons or images that are expensive to paint.
 * A subclass will do the following:
 * <ol>
 * <li>Invoke <code>paint</code> when you want to paint the image,
 *     if you are implementing <code>Icon</code> you'll invoke this from
 *     <code>paintIcon</code>.
 *     The args argument is useful when additional state is needed.
 * <li>Override <code>paintToImage</code> to render the image.  The code that
 *     lives here is equivalent to what previously would go in
 *     <code>paintIcon</code>, for an <code>Icon</code>.
 * </ol>
 * The two ways to use this class are:
 * <ol>
 * <li>Invoke <code>paint</code> to draw the cached representation at
 *     the specified location.
 * <li>Invoke <code>getImage</code> to get the cached representation and
 *     draw the image yourself.  This is primarily useful when you are not
 *     using <code>VolatileImage</code>.
 * </ol>
 */
export class CachedPainter extends JObject {
  static cacheMap: JMap<any, ImageCache> = null;
  /**
   * Creates an instance of <code>CachedPainter</code> that will cache up
   * to <code>cacheCount</code> images of this class.
   *
   * @param cacheCount Max number of images to cache
   */
  _CachedPainter(cacheCount: number): this {
    CachedPainter.getCache($J.getClass(this)).setMaxCount(cacheCount);
    return this;
  }
  static getCache(key: any): ImageCache {
    {
      let cache = CachedPainter.cacheMap.get(key);
      if (cache == null) {
        if (key === $J.cls(CachedPainter$PainterMultiResolutionCachedImage)) {
          cache = new ImageCache()._ImageCache(32);
        } else {
          cache = new ImageCache()._ImageCache(1);
        }
        CachedPainter.cacheMap.put(key, cache);
      }
      return cache;
    }
  }
  /**
   * Renders the cached image to the passed in <code>Graphic</code>.
   * If there is no cached image <code>paintToImage</code> will be invoked.
   * <code>paintImage</code> is invoked to paint the cached image.
   *
   * @param c Component rendering to, this may be null.
   * @param g Graphics to paint to
   * @param x X-coordinate to render to
   * @param y Y-coordinate to render to
   * @param w Width to render in
   * @param h Height to render in
   * @param args Variable arguments that will be passed to paintToImage
   */
  paint$Component$Graphics$int$int$int$int$ObjectArr(c: Component, g: Graphics, x: number, y: number, w: number, h: number, args: any[]): void {
    if (w <= 0 || h <= 0) {
      return;
    }
    {
      this.paint0(c, g, x, y, w, h, args);
    }
  }
  getImage(key: any, c: Component, baseWidth: number, baseHeight: number, w: number, h: number, args: any[]): Image {
    let config = this.getGraphicsConfiguration(c);
    let cache = CachedPainter.getCache(key);
    let image = cache.getImage(key, config, w, h, args);
    let attempts = 0;
    let volatileImage = (image instanceof VolatileImage) ? image : null;
    do {
      let draw = false;
      if (volatileImage != null) {
        switch (volatileImage.validate(config)) {
          case VolatileImage.IMAGE_INCOMPATIBLE:
            volatileImage.flush();
            image = null;
            break;
          case VolatileImage.IMAGE_RESTORED:
            draw = true;
            break;
        }
      }
      if (image == null) {
        if (config != null && (w !== baseHeight || h !== baseWidth)) {
          let tx = config.getDefaultTransform();
          let sx = tx.getScaleX();
          let sy = tx.getScaleY();
          if ($J.dcmp(sx, 1) !== 0 || $J.dcmp(sy, 1) !== 0) {
            if (Math.abs(sx * baseWidth - w) < 1 && Math.abs(sy * baseHeight - h) < 1) {
              w = baseWidth;
              h = baseHeight;
            } else {
              w = $J.d2i(Math.ceil(w / sx));
              h = $J.d2i(Math.ceil(w / sy));
            }
          }
        }
        image = this.createImage(c, w, h, config, args);
        cache.setImage(key, config, w, h, args, image);
        draw = true;
        volatileImage = (image instanceof VolatileImage) ? image : null;
      }
      if (draw) {
        let g2 = image.getGraphics();
        if (volatileImage == null) {
          if (w !== baseWidth || h !== baseHeight) {
            g2.scale(w / baseWidth, h / baseHeight);
          }
          this.paintToImage(c, image, g2, baseWidth, baseHeight, args);
        } else {
          let sd = SurfaceManager.getManager(volatileImage).getPrimarySurfaceData();
          let sx = sd.getDefaultScaleX();
          let sy = sd.getDefaultScaleY();
          if ($J.dcmp(sx, 1) !== 0 || $J.dcmp(sy, 1) !== 0) {
            g2.scale(1 / sx, 1 / sy);
          }
          this.paintToImage(c, image, g2, $J.d2i(Math.ceil(w * sx)), $J.d2i(Math.ceil(h * sy)), args);
        }
        g2.dispose();
      }
    } while ((volatileImage != null) && volatileImage.contentsLost() && ++attempts < 3);
    return image;
  }
  paint0(c: Component, g: Graphics, x: number, y: number, w: number, h: number, args: any[]): void {
    let key = $J.getClass(this);
    let config = this.getGraphicsConfiguration(c);
    let cache = CachedPainter.getCache(key);
    let image = cache.getImage(key, config, w, h, args);
    if (image == null) {
      image = new CachedPainter$PainterMultiResolutionCachedImage().$o(this)._CachedPainter$PainterMultiResolutionCachedImage(w, h);
      cache.setImage(key, config, w, h, args, image);
    }
    if (image instanceof CachedPainter$PainterMultiResolutionCachedImage) {
      (image).setParams(c, args);
    }
    this.paintImage(c, g, x, y, w, h, image, args);
  }
  /**
   * Paints the image to the specified location.
   *
   * @param c Component painting to
   * @param g Graphics to paint to
   * @param x X coordinate to paint to
   * @param y Y coordinate to paint to
   * @param w Width to paint to
   * @param h Height to paint to
   * @param image Image to paint
   * @param args Arguments supplied to <code>paint</code>
   */
  paintImage(c: Component, g: Graphics, x: number, y: number, w: number, h: number, image: Image, args: any[]): void {
    g.drawImage$Image$int$int$ImageObserver(image, x, y, null);
  }
  /**
   * Creates the image to cache.  This returns an opaque image, subclasses
   * that require translucency or transparency will need to override this
   * method.
   *
   * @param c Component painting to
   * @param w Width of image to create
   * @param h Height to image to create
   * @param config GraphicsConfiguration that will be
   *        rendered to, this may be null.
   * @param args Arguments passed to paint
   */
  createImage(c: Component, w: number, h: number, config: GraphicsConfiguration, args: any[]): Image {
    if (config == null) {
      return new BufferedImage(w, h, 1);
    }
    return config.createCompatibleVolatileImage$int$int(w, h);
  }
  getGraphicsConfiguration(c: Component): GraphicsConfiguration {
    if (c == null) {
      return null;
    }
    return c.getGraphicsConfiguration();
  }
  static $clinit() {
    CachedPainter.cacheMap = new HashMap();
  }
}

export class CachedPainter$PainterMultiResolutionCachedImage extends AbstractMultiResolutionImage {
  baseWidth: number = 0;
  baseHeight: number = 0;
  c: Component = null;
  args: any[] = null;
  _CachedPainter$PainterMultiResolutionCachedImage(baseWidth: number, baseHeight: number): this {
    this._AbstractMultiResolutionImage();
    this.baseWidth = baseWidth;
    this.baseHeight = baseHeight;
    return this;
  }
  setParams(c: Component, args: any[]): void {
    this.c = c;
    this.args = args;
  }
  getWidth$ImageObserver(observer: ImageObserver): number {
    return this.baseWidth;
  }
  getHeight$ImageObserver(observer: ImageObserver): number {
    return this.baseHeight;
  }
  getResolutionVariant(destWidth: number, destHeight: number): Image {
    let w = $J.d2i(Math.floor(destWidth + 0.5));
    let h = $J.d2i(Math.floor(destHeight + 0.5));
    return this.$outer.getImage($J.cls(CachedPainter$PainterMultiResolutionCachedImage), this.c, this.baseWidth, this.baseHeight, w, h, this.args);
  }
  getBaseImage(): Image {
    return this.getResolutionVariant(this.baseWidth, this.baseHeight);
  }
}

$J.define(CachedPainter, 'sun.swing.CachedPainter', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int': '_CachedPainter' }, meths: { 'paint(java.awt.Component,java.awt.Graphics,int,int,int,int,java.lang.Object[])': 'paint$Component$Graphics$int$int$int$int$ObjectArr' }, clinit: true, lazy: ['cacheMap'] });
$J.define(CachedPainter$PainterMultiResolutionCachedImage, 'sun.swing.CachedPainter$PainterMultiResolutionCachedImage', { kind: 'class', sup: 'java.awt.image.AbstractMultiResolutionImage', ctors: { 'int,int': '_CachedPainter$PainterMultiResolutionCachedImage' }, meths: { 'getHeight(java.awt.image.ImageObserver)': 'getHeight$ImageObserver', 'getWidth(java.awt.image.ImageObserver)': 'getWidth$ImageObserver' }, inner: true });
$J.module(() => {
  VolatileImage = $J.load('java.awt.image.VolatileImage');
  ImageCache = $J.load('sun.swing.ImageCache');
});
