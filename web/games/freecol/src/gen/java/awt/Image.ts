// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Image.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject, SurfaceManager, SurfaceManager_ImageAccessor, Toolkit } from '../../../jre/index.ts';

let ImageCapabilities, AreaAveragingScaleFilter, FilteredImageSource, ReplicateScaleFilter;

/**
 * The abstract class {@code Image} is the superclass of all
 * classes that represent graphical images. The image must be
 * obtained in a platform-specific manner.
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @since       1.0
 */
export class Image extends JObject {
  /**
   * convenience object; we can use this single static object for
   * all images that do not create their own image caps; it holds the
   * default (unaccelerated) properties.
   */
  static defaultImageCaps: ImageCapabilities = null;
  /**
   * Priority for accelerating this image.  Subclasses are free to
   * set different default priorities and applications are free to
   * set the priority for specific images via the
   * {@code setAccelerationPriority(float)} method.
   * @since 1.5
   */
  accelerationPriority: number = 0;
  /**
   * The {@code UndefinedProperty} object should be returned whenever a
   * property which was not defined for a particular image is fetched.
   */
  static UndefinedProperty: any = null;
  /**
   * Use the default image-scaling algorithm.
   * @since 1.1
   */
  static readonly SCALE_DEFAULT: number = 1;
  /**
   * Choose an image-scaling algorithm that gives higher priority
   * to scaling speed than smoothness of the scaled image.
   * @since 1.1
   */
  static readonly SCALE_FAST: number = 2;
  /**
   * Choose an image-scaling algorithm that gives higher priority
   * to image smoothness than scaling speed.
   * @since 1.1
   */
  static readonly SCALE_SMOOTH: number = 4;
  /**
   * Use the image scaling algorithm embodied in the
   * {@code ReplicateScaleFilter} class.
   * The {@code Image} object is free to substitute a different filter
   * that performs the same algorithm yet integrates more efficiently
   * into the imaging infrastructure supplied by the toolkit.
   * @see        java.awt.image.ReplicateScaleFilter
   * @since      1.1
   */
  static readonly SCALE_REPLICATE: number = 8;
  /**
   * Use the Area Averaging image scaling algorithm.  The
   * image object is free to substitute a different filter that
   * performs the same algorithm yet integrates more efficiently
   * into the image infrastructure supplied by the toolkit.
   * @see java.awt.image.AreaAveragingScaleFilter
   * @since 1.1
   */
  static readonly SCALE_AREA_AVERAGING: number = 16;
  surfaceManager: SurfaceManager = null;
  /**
   * Constructor for subclasses to call.
   */
  _Image(): this {
    this.accelerationPriority = 0.5;
    return this;
  }
  /**
   * Creates a scaled version of this image.
   * A new {@code Image} object is returned which will render
   * the image at the specified {@code width} and
   * {@code height} by default.  The new {@code Image} object
   * may be loaded asynchronously even if the original source image
   * has already been loaded completely.
   *
   * <p>
   *
   * If either {@code width}
   * or {@code height} is a negative number then a value is
   * substituted to maintain the aspect ratio of the original image
   * dimensions. If both {@code width} and {@code height}
   * are negative, then the original image dimensions are used.
   *
   * @param width the width to which to scale the image.
   * @param height the height to which to scale the image.
   * @param hints flags to indicate the type of algorithm to use
   * for image resampling.
   * @return     a scaled version of the image.
   * @throws IllegalArgumentException if {@code width}
   *             or {@code height} is zero.
   * @see        java.awt.Image#SCALE_DEFAULT
   * @see        java.awt.Image#SCALE_FAST
   * @see        java.awt.Image#SCALE_SMOOTH
   * @see        java.awt.Image#SCALE_REPLICATE
   * @see        java.awt.Image#SCALE_AREA_AVERAGING
   * @since      1.1
   */
  getScaledInstance(width: number, height: number, hints: number): Image {
    let filter: ImageFilter;
    if ((hints & (Image.SCALE_SMOOTH | Image.SCALE_AREA_AVERAGING)) !== 0) {
      filter = new AreaAveragingScaleFilter()._AreaAveragingScaleFilter(width, height);
    } else {
      filter = new ReplicateScaleFilter()._ReplicateScaleFilter(width, height);
    }
    let prod: ImageProducer;
    prod = new FilteredImageSource()._FilteredImageSource(this.getSource(), filter);
    return Toolkit.getDefaultToolkit().createImage(prod);
  }
  /**
   * Flushes all reconstructable resources being used by this Image object.
   * This includes any pixel data that is being cached for rendering to
   * the screen as well as any system resources that are being used
   * to store data or pixels for the image if they can be recreated.
   * The image is reset to a state similar to when it was first created
   * so that if it is again rendered, the image data will have to be
   * recreated or fetched again from its source.
   * <p>
   * Examples of how this method affects specific types of Image object:
   * <ul>
   * <li>
   * BufferedImage objects leave the primary Raster which stores their
   * pixels untouched, but flush any information cached about those
   * pixels such as copies uploaded to the display hardware for
   * accelerated blits.
   * <li>
   * Image objects created by the Component methods which take a
   * width and height leave their primary buffer of pixels untouched,
   * but have all cached information released much like is done for
   * BufferedImage objects.
   * <li>
   * VolatileImage objects release all of their pixel resources
   * including their primary copy which is typically stored on
   * the display hardware where resources are scarce.
   * These objects can later be restored using their
   * {@link java.awt.image.VolatileImage#validate validate}
   * method.
   * <li>
   * Image objects created by the Toolkit and Component classes which are
   * loaded from files, URLs or produced by an {@link ImageProducer}
   * are unloaded and all local resources are released.
   * These objects can later be reloaded from their original source
   * as needed when they are rendered, just as when they were first
   * created.
   * </ul>
   */
  flush(): void {
    if (this.surfaceManager != null) {
      this.surfaceManager.flush();
    }
  }
  /**
   * Returns an ImageCapabilities object which can be
   * inquired as to the capabilities of this
   * Image on the specified GraphicsConfiguration.
   * This allows programmers to find
   * out more runtime information on the specific Image
   * object that they have created.  For example, the user
   * might create a BufferedImage but the system may have
   * no video memory left for creating an image of that
   * size on the given GraphicsConfiguration, so although the object
   * may be acceleratable in general, it
   * does not have that capability on this GraphicsConfiguration.
   * @param gc a {@code GraphicsConfiguration} object.  A value of null
   * for this parameter will result in getting the image capabilities
   * for the default {@code GraphicsConfiguration}.
   * @return an {@code ImageCapabilities} object that contains
   * the capabilities of this {@code Image} on the specified
   * GraphicsConfiguration.
   * @see java.awt.image.VolatileImage#getCapabilities()
   * VolatileImage.getCapabilities()
   * @since 1.5
   */
  getCapabilities$GraphicsConfiguration(gc: GraphicsConfiguration): ImageCapabilities {
    if (this.surfaceManager != null) {
      return this.surfaceManager.getCapabilities(gc);
    }
    return Image.defaultImageCaps;
  }
  /**
   * Sets a hint for this image about how important acceleration is.
   * This priority hint is used to compare to the priorities of other
   * Image objects when determining how to use scarce acceleration
   * resources such as video memory.  When and if it is possible to
   * accelerate this Image, if there are not enough resources available
   * to provide that acceleration but enough can be freed up by
   * de-accelerating some other image of lower priority, then that other
   * Image may be de-accelerated in deference to this one.  Images
   * that have the same priority take up resources on a first-come,
   * first-served basis.
   * @param priority a value between 0 and 1, inclusive, where higher
   * values indicate more importance for acceleration.  A value of 0
   * means that this Image should never be accelerated.  Other values
   * are used simply to determine acceleration priority relative to other
   * Images.
   * @throws IllegalArgumentException if {@code priority} is less
   * than zero or greater than 1.
   * @since 1.5
   */
  setAccelerationPriority(priority: number): void {
    if (priority < Math.fround(0) || priority > Math.fround(1)) {
      throw new IllegalArgumentException('Priority must be a value between 0 and 1, inclusive');
    }
    this.accelerationPriority = priority;
    if (this.surfaceManager != null) {
      this.surfaceManager.setAccelerationPriority(this.accelerationPriority);
    }
  }
  /**
   * Returns the current value of the acceleration priority hint.
   * @see #setAccelerationPriority(float priority) setAccelerationPriority
   * @return value between 0 and 1, inclusive, which represents the current
   * priority value
   * @since 1.5
   */
  getAccelerationPriority(): number {
    return this.accelerationPriority;
  }
  static $clinit() {
    Image.defaultImageCaps = new ImageCapabilities()._ImageCapabilities(false);
    Image.UndefinedProperty = new JObject();
    SurfaceManager.setImageAccessor(new (Image$1())()._SurfaceManager_ImageAccessor());
  }
}

let $Image$1: any = null;
/** An anonymous class (Image.java:350). */
function Image$1(): any {
  return $Image$1 ??= $J.local(class extends SurfaceManager_ImageAccessor {
    getSurfaceManager(img: Image): SurfaceManager {
      return img.surfaceManager;
    }
    setSurfaceManager(img: Image, mgr: SurfaceManager): void {
      img.surfaceManager = mgr;
    }
  }, 'java.awt.Image$1', []);
}

$J.define(Image, 'java.awt.Image', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_Image' }, meths: { 'getCapabilities(java.awt.GraphicsConfiguration)': 'getCapabilities$GraphicsConfiguration', 'getHeight(java.awt.image.ImageObserver)': 'getHeight$ImageObserver', 'getWidth(java.awt.image.ImageObserver)': 'getWidth$ImageObserver' }, clinit: true, lazy: ['defaultImageCaps', 'UndefinedProperty'] });
$J.module(() => {
  ImageCapabilities = $J.load('java.awt.ImageCapabilities');
  AreaAveragingScaleFilter = $J.load('java.awt.image.AreaAveragingScaleFilter');
  FilteredImageSource = $J.load('java.awt.image.FilteredImageSource');
  ReplicateScaleFilter = $J.load('java.awt.image.ReplicateScaleFilter');
});
