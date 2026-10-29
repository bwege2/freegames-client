// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/VolatileImage.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2020, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';
import { Image } from '../Image.ts';

let Transparency;

/**
 * VolatileImage is an image which can lose its
 * contents at any time due to circumstances beyond the control of the
 * application (e.g., situations caused by the operating system or by
 * other applications). Because of the potential for hardware acceleration,
 * a VolatileImage object can have significant performance benefits on
 * some platforms.
 * <p>
 * The drawing surface of an image (the memory where the image contents
 * actually reside) can be lost or invalidated, causing the contents of that
 * memory to go away.  The drawing surface thus needs to be restored
 * or recreated and the contents of that surface need to be
 * re-rendered.  VolatileImage provides an interface for
 * allowing the user to detect these problems and fix them
 * when they occur.
 * <p>
 * When a VolatileImage object is created, limited system resources
 * such as video memory (VRAM) may be allocated in order to support
 * the image.
 * When a VolatileImage object is no longer used, it may be
 * garbage-collected and those system resources will be returned,
 * but this process does not happen at guaranteed times.
 * Applications that create many VolatileImage objects (for example,
 * a resizing window may force recreation of its back buffer as the
 * size changes) may run out of optimal system resources for new
 * VolatileImage objects simply because the old objects have not
 * yet been removed from the system.
 * (New VolatileImage objects may still be created, but they
 * may not perform as well as those created in accelerated
 * memory).
 * The flush method may be called at any time to proactively release
 * the resources used by a VolatileImage so that it does not prevent
 * subsequent VolatileImage objects from being accelerated.
 * In this way, applications can have more control over the state
 * of the resources taken up by obsolete VolatileImage objects.
 * <p>
 * This image should not be subclassed directly but should be created
 * by using the {@link java.awt.Component#createVolatileImage(int, int)
 * Component.createVolatileImage} or
 * {@link java.awt.GraphicsConfiguration#createCompatibleVolatileImage(int, int)
 * GraphicsConfiguration.createCompatibleVolatileImage(int, int)} methods.
 * <P>
 * An example of using a VolatileImage object follows:
 * <pre>
 * // image creation
 * VolatileImage vImg = createVolatileImage(w, h);
 *
 *
 * // rendering to the image
 * void renderOffscreen() {
 *      do {
 *          if (vImg.validate(getGraphicsConfiguration()) ==
 *              VolatileImage.IMAGE_INCOMPATIBLE)
 *          {
 *              // old vImg doesn't work with new GraphicsConfig; re-create it
 *              vImg = createVolatileImage(w, h);
 *          }
 *          Graphics2D g = vImg.createGraphics();
 *          //
 *          // miscellaneous rendering commands...
 *          //
 *          g.dispose();
 *      } while (vImg.contentsLost());
 * }
 *
 *
 * // copying from the image (here, gScreen is the Graphics
 * // object for the onscreen window)
 * do {
 *      int returnCode = vImg.validate(getGraphicsConfiguration());
 *      if (returnCode == VolatileImage.IMAGE_RESTORED) {
 *          // Contents need to be restored
 *          renderOffscreen();      // restore contents
 *      } else if (returnCode == VolatileImage.IMAGE_INCOMPATIBLE) {
 *          // old vImg doesn't work with new GraphicsConfig; re-create it
 *          vImg = createVolatileImage(w, h);
 *          renderOffscreen();
 *      }
 *      gScreen.drawImage(vImg, 0, 0, this);
 * } while (vImg.contentsLost());
 * </pre>
 * <P>
 * Note that this class subclasses from the {@link Image} class, which
 * includes methods that take an {@link ImageObserver} parameter for
 * asynchronous notifications as information is received from
 * a potential {@link ImageProducer}.  Since this {@code VolatileImage}
 * is not loaded from an asynchronous source, the various methods that take
 * an {@code ImageObserver} parameter will behave as if the data has
 * already been obtained from the {@code ImageProducer}.
 * Specifically, this means that the return values from such methods
 * will never indicate that the information is not yet available and
 * the {@code ImageObserver} used in such methods will never
 * need to be recorded for an asynchronous callback notification.
 * @since 1.4
 */
export class VolatileImage extends Image {
  /**
   * Validated image is ready to use as-is.
   */
  static readonly IMAGE_OK: number = 0;
  /**
   * Validated image has been restored and is now ready to use.
   * Note that restoration causes contents of the image to be lost.
   */
  static readonly IMAGE_RESTORED: number = 1;
  /**
   * Validated image is incompatible with supplied
   * {@code GraphicsConfiguration} object and should be
   * re-created as appropriate.  Usage of the image as-is
   * after receiving this return code from {@code validate}
   * is undefined.
   */
  static readonly IMAGE_INCOMPATIBLE: number = 2;
  /**
   * The transparency value with which this image was created.
   * @see java.awt.GraphicsConfiguration#createCompatibleVolatileImage(int,
   *      int,int)
   * @see java.awt.GraphicsConfiguration#createCompatibleVolatileImage(int,
   *      int,ImageCapabilities,int)
   * @see Transparency
   * @since 1.5
   */
  transparency: number = 0;
  /**
   * Constructor for subclasses to call.
   */
  _VolatileImage(): this {
    this._Image();
    this.transparency = Transparency.TRANSLUCENT;
    return this;
  }
  /**
   * This returns an ImageProducer for this VolatileImage.
   * Note that the VolatileImage object is optimized for
   * rendering operations and blitting to the screen or other
   * VolatileImage objects, as opposed to reading back the
   * pixels of the image.  Therefore, operations such as
   * {@code getSource} may not perform as fast as
   * operations that do not rely on reading the pixels.
   * Note also that the pixel values read from the image are current
   * with those in the image only at the time that they are
   * retrieved. This method takes a snapshot
   * of the image at the time the request is made and the
   * ImageProducer object returned works with
   * that static snapshot image, not the original VolatileImage.
   * Calling getSource()
   * is equivalent to calling getSnapshot().getSource().
   * @return an {@link ImageProducer} that can be used to produce the
   * pixels for a {@code BufferedImage} representation of
   * this Image.
   * @see ImageProducer
   * @see #getSnapshot()
   */
  getSource(): ImageProducer {
    return this.getSnapshot().getSource();
  }
  /**
   * This method returns a {@link Graphics2D}, but is here
   * for backwards compatibility.  {@link #createGraphics() createGraphics} is more
   * convenient, since it is declared to return a
   * {@code Graphics2D}.
   * @return a {@code Graphics2D}, which can be used to draw into
   *          this image.
   */
  getGraphics(): Graphics {
    return this.createGraphics();
  }
  /**
   * Returns the transparency.  Returns either OPAQUE, BITMASK,
   * or TRANSLUCENT.
   * @return the transparency of this {@code VolatileImage}.
   * @see Transparency#OPAQUE
   * @see Transparency#BITMASK
   * @see Transparency#TRANSLUCENT
   * @since 1.5
   */
  getTransparency(): number {
    return this.transparency;
  }
}

$J.define(VolatileImage, 'java.awt.image.VolatileImage', { kind: 'class', ifaces: ['java.awt.Transparency'], sup: 'java.awt.Image', ctors: { '': '_VolatileImage' }, meths: { 'getCapabilities()': 'getCapabilities$', 'getHeight()': 'getHeight$', 'getWidth()': 'getWidth$' } });
$J.module(() => {
  Transparency = $J.load('java.awt.Transparency');
});
