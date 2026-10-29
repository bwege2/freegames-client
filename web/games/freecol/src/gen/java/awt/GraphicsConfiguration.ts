// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/GraphicsConfiguration.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BufferedImage, IllegalArgumentException, JObject, SunVolatileImage } from '../../../jre/index.ts';
import { BufferCapabilities } from './BufferCapabilities.ts';

let AWTException, ImageCapabilities, Transparency;

/**
 * The {@code GraphicsConfiguration} class describes the
 * characteristics of a graphics destination such as a printer or monitor.
 * There can be many {@code GraphicsConfiguration} objects associated
 * with a single graphics device, representing different drawing modes or
 * capabilities.  The corresponding native structure will vary from platform
 * to platform.  For example, on X11 windowing systems,
 * each visual is a different {@code GraphicsConfiguration}.
 * On Microsoft Windows, {@code GraphicsConfiguration}s represent
 * PixelFormats available in the current resolution and color depth.
 * <p>
 * In a virtual device multi-screen environment in which the desktop
 * area could span multiple physical screen devices, the bounds of the
 * {@code GraphicsConfiguration} objects are relative to the
 * virtual coordinate system.  When setting the location of a
 * component, use {@link #getBounds() getBounds} to get the bounds of
 * the desired {@code GraphicsConfiguration} and offset the location
 * with the coordinates of the {@code GraphicsConfiguration},
 * as the following code sample illustrates:
 * </p>
 *
 * <pre>
 *      Frame f = new Frame(gc);  // where gc is a GraphicsConfiguration
 *      Rectangle bounds = gc.getBounds();
 *      f.setLocation(10 + bounds.x, 10 + bounds.y); </pre>
 *
 * <p>
 * To determine if your environment is a virtual device
 * environment, call {@code getBounds} on all of the
 * {@code GraphicsConfiguration} objects in your system.  If
 * any of the origins of the returned bounds is not (0,&nbsp;0),
 * your environment is a virtual device environment.
 *
 * <p>
 * You can also use {@code getBounds} to determine the bounds
 * of the virtual device.  To do this, first call {@code getBounds} on all
 * of the {@code GraphicsConfiguration} objects in your
 * system.  Then calculate the union of all of the bounds returned
 * from the calls to {@code getBounds}.  The union is the
 * bounds of the virtual device.  The following code sample
 * calculates the bounds of the virtual device.
 *
 * <pre>{@code
 *      Rectangle virtualBounds = new Rectangle();
 *      GraphicsEnvironment ge = GraphicsEnvironment.
 *              getLocalGraphicsEnvironment();
 *      GraphicsDevice[] gs =
 *              ge.getScreenDevices();
 *      for (int j = 0; j < gs.length; j++) {
 *          GraphicsDevice gd = gs[j];
 *          GraphicsConfiguration[] gc =
 *              gd.getConfigurations();
 *          for (int i=0; i < gc.length; i++) {
 *              virtualBounds =
 *                  virtualBounds.union(gc[i].getBounds());
 *          }
 *      } }</pre>
 *
 * @see Window
 * @see Frame
 * @see GraphicsEnvironment
 * @see GraphicsDevice
 */
export class GraphicsConfiguration extends JObject {
  static defaultBufferCaps: BufferCapabilities = null;
  static defaultImageCaps: ImageCapabilities = null;
  /**
   * This is an abstract class that cannot be instantiated directly.
   * Instances must be obtained from a suitable factory or query method.
   *
   * @see GraphicsDevice#getConfigurations
   * @see GraphicsDevice#getDefaultConfiguration
   * @see GraphicsDevice#getBestConfiguration
   * @see Graphics2D#getDeviceConfiguration
   */
  _GraphicsConfiguration(): this {
    return this;
  }
  /**
   * Returns a {@link BufferedImage} with a data layout and color model
   * compatible with this {@code GraphicsConfiguration}.  This
   * method has nothing to do with memory-mapping
   * a device.  The returned {@code BufferedImage} has
   * a layout and color model that is closest to this native device
   * configuration and can therefore be optimally blitted to this
   * device.
   * @param width the width of the returned {@code BufferedImage}
   * @param height the height of the returned {@code BufferedImage}
   * @return a {@code BufferedImage} whose data layout and color
   * model is compatible with this {@code GraphicsConfiguration}.
   */
  createCompatibleImage$int$int(width: number, height: number): BufferedImage {
    let model = this.getColorModel$();
    let raster = model.createCompatibleWritableRaster(width, height);
    return new BufferedImage(model, raster, model.isAlphaPremultiplied(), null);
  }
  /**
   * Returns a {@code BufferedImage} that supports the specified
   * transparency and has a data layout and color model
   * compatible with this {@code GraphicsConfiguration}.  This
   * method has nothing to do with memory-mapping
   * a device. The returned {@code BufferedImage} has a layout and
   * color model that can be optimally blitted to a device
   * with this {@code GraphicsConfiguration}.
   * @param width the width of the returned {@code BufferedImage}
   * @param height the height of the returned {@code BufferedImage}
   * @param transparency the specified transparency mode
   * @return a {@code BufferedImage} whose data layout and color
   * model is compatible with this {@code GraphicsConfiguration}
   * and also supports the specified transparency.
   * @throws IllegalArgumentException if the transparency is not a valid value
   * @see Transparency#OPAQUE
   * @see Transparency#BITMASK
   * @see Transparency#TRANSLUCENT
   */
  createCompatibleImage$int$int$int(width: number, height: number, transparency: number): BufferedImage {
    if (this.getColorModel$().getTransparency() === transparency) {
      return this.createCompatibleImage$int$int(width, height);
    }
    let cm = this.getColorModel$int(transparency);
    if (cm == null) {
      throw new IllegalArgumentException('Unknown transparency: ' + transparency);
    }
    let wr = cm.createCompatibleWritableRaster(width, height);
    return new BufferedImage(cm, wr, cm.isAlphaPremultiplied(), null);
  }
  /**
   * Returns a {@link VolatileImage} with a data layout and color model
   * compatible with this {@code GraphicsConfiguration}.
   * The returned {@code VolatileImage}
   * may have data that is stored optimally for the underlying graphics
   * device and may therefore benefit from platform-specific rendering
   * acceleration.
   * @param width the width of the returned {@code VolatileImage}
   * @param height the height of the returned {@code VolatileImage}
   * @return a {@code VolatileImage} whose data layout and color
   * model is compatible with this {@code GraphicsConfiguration}.
   * @see Component#createVolatileImage(int, int)
   * @since 1.4
   */
  createCompatibleVolatileImage$int$int(width: number, height: number): VolatileImage {
    let vi = null;
    try {
      vi = this.createCompatibleVolatileImage$int$int$ImageCapabilities$int(width, height, null, Transparency.OPAQUE);
    } catch ($e0) {
      if ($J.isa($e0, AWTException)) {
        let e = $J.exc($e0);
        // assert false
      } else {
        throw $e0;
      }
    }
    return vi;
  }
  /**
   * Returns a {@link VolatileImage} with a data layout and color model
   * compatible with this {@code GraphicsConfiguration}.
   * The returned {@code VolatileImage}
   * may have data that is stored optimally for the underlying graphics
   * device and may therefore benefit from platform-specific rendering
   * acceleration.
   * @param width the width of the returned {@code VolatileImage}
   * @param height the height of the returned {@code VolatileImage}
   * @param transparency the specified transparency mode
   * @return a {@code VolatileImage} whose data layout and color
   * model is compatible with this {@code GraphicsConfiguration}.
   * @throws IllegalArgumentException if the transparency is not a valid value
   * @see Transparency#OPAQUE
   * @see Transparency#BITMASK
   * @see Transparency#TRANSLUCENT
   * @see Component#createVolatileImage(int, int)
   * @since 1.5
   */
  createCompatibleVolatileImage$int$int$int(width: number, height: number, transparency: number): VolatileImage {
    let vi = null;
    try {
      vi = this.createCompatibleVolatileImage$int$int$ImageCapabilities$int(width, height, null, transparency);
    } catch ($e1) {
      if ($J.isa($e1, AWTException)) {
        let e = $J.exc($e1);
        // assert false
      } else {
        throw $e1;
      }
    }
    return vi;
  }
  /**
   * Returns a {@link VolatileImage} with a data layout and color model
   * compatible with this {@code GraphicsConfiguration}, using
   * the specified image capabilities.
   * If the {@code caps} parameter is null, it is effectively ignored
   * and this method will create a VolatileImage without regard to
   * {@code ImageCapabilities} constraints.
   *
   * The returned {@code VolatileImage} has
   * a layout and color model that is closest to this native device
   * configuration and can therefore be optimally blitted to this
   * device.
   * @return a {@code VolatileImage} whose data layout and color
   * model is compatible with this {@code GraphicsConfiguration}.
   * @param width the width of the returned {@code VolatileImage}
   * @param height the height of the returned {@code VolatileImage}
   * @param caps the image capabilities
   * @throws AWTException if the supplied image capabilities could not
   * be met by this graphics configuration
   * @since 1.4
   */
  createCompatibleVolatileImage$int$int$ImageCapabilities(width: number, height: number, caps: ImageCapabilities): VolatileImage {
    return this.createCompatibleVolatileImage$int$int$ImageCapabilities$int(width, height, caps, Transparency.OPAQUE);
  }
  /**
   * Returns a {@link VolatileImage} with a data layout and color model
   * compatible with this {@code GraphicsConfiguration}, using
   * the specified image capabilities and transparency value.
   * If the {@code caps} parameter is null, it is effectively ignored
   * and this method will create a VolatileImage without regard to
   * {@code ImageCapabilities} constraints.
   *
   * The returned {@code VolatileImage} has
   * a layout and color model that is closest to this native device
   * configuration and can therefore be optimally blitted to this
   * device.
   * @param width the width of the returned {@code VolatileImage}
   * @param height the height of the returned {@code VolatileImage}
   * @param caps the image capabilities
   * @param transparency the specified transparency mode
   * @return a {@code VolatileImage} whose data layout and color
   * model is compatible with this {@code GraphicsConfiguration}.
   * @see Transparency#OPAQUE
   * @see Transparency#BITMASK
   * @see Transparency#TRANSLUCENT
   * @throws IllegalArgumentException if the transparency is not a valid value
   * @throws AWTException if the supplied image capabilities could not
   * be met by this graphics configuration
   * @see Component#createVolatileImage(int, int)
   * @since 1.5
   */
  createCompatibleVolatileImage$int$int$ImageCapabilities$int(width: number, height: number, caps: ImageCapabilities, transparency: number): VolatileImage {
    let vi = new SunVolatileImage(this, width, height, transparency, caps);
    if (caps != null && caps.isAccelerated() && !vi.getCapabilities$().isAccelerated()) {
      throw new AWTException()._AWTException('Supplied image capabilities could not be met by this graphics configuration.');
    }
    return vi;
  }
  /**
   * Returns the buffering capabilities of this
   * {@code GraphicsConfiguration}.
   * @return the buffering capabilities of this graphics
   * configuration object
   * @since 1.4
   */
  getBufferCapabilities(): BufferCapabilities {
    if (GraphicsConfiguration.defaultBufferCaps == null) {
      GraphicsConfiguration.defaultBufferCaps = new GraphicsConfiguration$DefaultBufferCapabilities()._GraphicsConfiguration$DefaultBufferCapabilities(this.getImageCapabilities());
    }
    return GraphicsConfiguration.defaultBufferCaps;
  }
  /**
   * Returns the image capabilities of this
   * {@code GraphicsConfiguration}.
   * @return the image capabilities of this graphics
   * configuration object
   * @since 1.4
   */
  getImageCapabilities(): ImageCapabilities {
    if (GraphicsConfiguration.defaultImageCaps == null) {
      GraphicsConfiguration.defaultImageCaps = new ImageCapabilities()._ImageCapabilities(false);
    }
    return GraphicsConfiguration.defaultImageCaps;
  }
  /**
   * Returns whether this {@code GraphicsConfiguration} supports
   * the {@link GraphicsDevice.WindowTranslucency#PERPIXEL_TRANSLUCENT
   * PERPIXEL_TRANSLUCENT} kind of translucency.
   *
   * @return whether the given GraphicsConfiguration supports
   *         the translucency effects.
   *
   * @see Window#setBackground(Color)
   *
   * @since 1.7
   */
  isTranslucencyCapable(): boolean {
    return false;
  }
}

export class GraphicsConfiguration$DefaultBufferCapabilities extends BufferCapabilities {
  _GraphicsConfiguration$DefaultBufferCapabilities(imageCaps: ImageCapabilities): this {
    this._BufferCapabilities(imageCaps, imageCaps, null);
    return this;
  }
}

$J.define(GraphicsConfiguration, 'java.awt.GraphicsConfiguration', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_GraphicsConfiguration' }, meths: { 'getColorModel(int)': 'getColorModel$int', 'getColorModel()': 'getColorModel$', 'createCompatibleVolatileImage(int,int,java.awt.ImageCapabilities,int)': 'createCompatibleVolatileImage$int$int$ImageCapabilities$int', 'createCompatibleVolatileImage(int,int,java.awt.ImageCapabilities)': 'createCompatibleVolatileImage$int$int$ImageCapabilities', 'createCompatibleVolatileImage(int,int,int)': 'createCompatibleVolatileImage$int$int$int', 'createCompatibleVolatileImage(int,int)': 'createCompatibleVolatileImage$int$int', 'createCompatibleImage(int,int,int)': 'createCompatibleImage$int$int$int', 'createCompatibleImage(int,int)': 'createCompatibleImage$int$int' } });
$J.define(GraphicsConfiguration$DefaultBufferCapabilities, 'java.awt.GraphicsConfiguration$DefaultBufferCapabilities', { kind: 'class', sup: 'java.awt.BufferCapabilities', ctors: { 'java.awt.ImageCapabilities': '_GraphicsConfiguration$DefaultBufferCapabilities' } });
$J.module(() => {
  AWTException = $J.load('java.awt.AWTException');
  ImageCapabilities = $J.load('java.awt.ImageCapabilities');
  Transparency = $J.load('java.awt.Transparency');
});
