// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ColorModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, Arrays, CMSManager, Collections, ColorSpace, ICC_Profile, IllegalArgumentException, JObject, UnsupportedOperationException, WeakHashMap } from '../../../../jre/index.ts';

let Transparency, DataBuffer, DirectColorModel;

/**
 * The {@code ColorModel} abstract class encapsulates the
 * methods for translating a pixel value to color components
 * (for example, red, green, and blue) and an alpha component.
 * In order to render an image to the screen, a printer, or another
 * image, pixel values must be converted to color and alpha components.
 * As arguments to or return values from methods of this class,
 * pixels are represented as 32-bit ints or as arrays of primitive types.
 * The number, order, and interpretation of color components for a
 * {@code ColorModel} is specified by its {@code ColorSpace}.
 * A {@code ColorModel} used with pixel data that does not include
 * alpha information treats all pixels as opaque, which is an alpha
 * value of 1.0.
 * <p>
 * This {@code ColorModel} class supports two representations of
 * pixel values.  A pixel value can be a single 32-bit int or an
 * array of primitive types.  The Java(tm) Platform 1.0 and 1.1 APIs
 * represented pixels as single {@code byte} or single
 * {@code int} values.  For purposes of the {@code ColorModel}
 * class, pixel value arguments were passed as ints.  The Java(tm) 2
 * Platform API introduced additional classes for representing images.
 * With {@link BufferedImage} or {@link RenderedImage}
 * objects, based on {@link Raster} and {@link SampleModel} classes, pixel
 * values might not be conveniently representable as a single int.
 * Consequently, {@code ColorModel} now has methods that accept
 * pixel values represented as arrays of primitive types.  The primitive
 * type used by a particular {@code ColorModel} object is called its
 * transfer type.
 * <p>
 * {@code ColorModel} objects used with images for which pixel values
 * are not conveniently representable as a single int throw an
 * {@link IllegalArgumentException} when methods taking a single int pixel
 * argument are called.  Subclasses of {@code ColorModel} must
 * specify the conditions under which this occurs.  This does not
 * occur with {@link DirectColorModel} or {@link IndexColorModel} objects.
 * <p>
 * Currently, the transfer types supported by the Java 2D(tm) API are
 * DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT, DataBuffer.TYPE_INT,
 * DataBuffer.TYPE_SHORT, DataBuffer.TYPE_FLOAT, and DataBuffer.TYPE_DOUBLE.
 * Most rendering operations will perform much faster when using ColorModels
 * and images based on the first three of these types.  In addition, some
 * image filtering operations are not supported for ColorModels and
 * images based on the latter three types.
 * The transfer type for a particular {@code ColorModel} object is
 * specified when the object is created, either explicitly or by default.
 * All subclasses of {@code ColorModel} must specify what the
 * possible transfer types are and how the number of elements in the
 * primitive arrays representing pixels is determined.
 * <p>
 * For {@code BufferedImages}, the transfer type of its
 * {@code Raster} and of the {@code Raster} object's
 * {@code SampleModel} (available from the
 * {@code getTransferType} methods of these classes) must match that
 * of the {@code ColorModel}.  The number of elements in an array
 * representing a pixel for the {@code Raster} and
 * {@code SampleModel} (available from the
 * {@code getNumDataElements} methods of these classes) must match
 * that of the {@code ColorModel}.
 * <p>
 * The algorithm used to convert from pixel values to color and alpha
 * components varies by subclass.  For example, there is not necessarily
 * a one-to-one correspondence between samples obtained from the
 * {@code SampleModel} of a {@code BufferedImage} object's
 * {@code Raster} and color/alpha components.  Even when
 * there is such a correspondence, the number of bits in a sample is not
 * necessarily the same as the number of bits in the corresponding color/alpha
 * component.  Each subclass must specify how the translation from
 * pixel values to color/alpha components is done.
 * <p>
 * Methods in the {@code ColorModel} class use two different
 * representations of color and alpha components - a normalized form
 * and an unnormalized form.  In the normalized form, each component is a
 * {@code float} value between some minimum and maximum values.  For
 * the alpha component, the minimum is 0.0 and the maximum is 1.0.  For
 * color components the minimum and maximum values for each component can
 * be obtained from the {@code ColorSpace} object.  These values
 * will often be 0.0 and 1.0 (e.g. normalized component values for the
 * default sRGB color space range from 0.0 to 1.0), but some color spaces
 * have component values with different upper and lower limits.  These
 * limits can be obtained using the {@code getMinValue} and
 * {@code getMaxValue} methods of the {@code ColorSpace}
 * class.  Normalized color component values are not premultiplied.
 * All {@code ColorModels} must support the normalized form.
 * <p>
 * In the unnormalized
 * form, each component is an unsigned integral value between 0 and
 * 2<sup>n</sup> - 1, where n is the number of significant bits for a
 * particular component.  If pixel values for a particular
 * {@code ColorModel} represent color samples premultiplied by
 * the alpha sample, unnormalized color component values are
 * also premultiplied.  The unnormalized form is used only with instances
 * of {@code ColorModel} whose {@code ColorSpace} has minimum
 * component values of 0.0 for all components and maximum values of
 * 1.0 for all components.
 * The unnormalized form for color and alpha components can be a convenient
 * representation for {@code ColorModels} whose normalized component
 * values all lie
 * between 0.0 and 1.0.  In such cases the integral value 0 maps to 0.0 and
 * the value 2<sup>n</sup> - 1 maps to 1.0.  In other cases, such as
 * when the normalized component values can be either negative or positive,
 * the unnormalized form is not convenient.  Such {@code ColorModel}
 * objects throw an {@link IllegalArgumentException} when methods involving
 * an unnormalized argument are called.  Subclasses of {@code ColorModel}
 * must specify the conditions under which this occurs.
 *
 * @see IndexColorModel
 * @see ComponentColorModel
 * @see PackedColorModel
 * @see DirectColorModel
 * @see java.awt.Image
 * @see BufferedImage
 * @see RenderedImage
 * @see java.awt.color.ColorSpace
 * @see SampleModel
 * @see Raster
 * @see DataBuffer
 */
export class ColorModel extends JObject {
  /**
   * The total number of bits in the pixel.
   */
  pixel_bits: number = 0;
  nBits: number[] = null;
  transparency: number = 0;
  supportsAlpha: boolean = false;
  isAlphaPremultiplied_: boolean = false;
  numComponents: number = 0;
  numColorComponents: number = 0;
  colorSpace: ColorSpace = null;
  colorSpaceType: number = 0;
  maxBits: number = 0;
  is_sRGB: boolean = false;
  /**
   * Data type of the array used to represent pixel values.
   */
  transferType: number = 0;
  /**
   * This is copied from java.awt.Toolkit since we need the library
   * loaded in java.awt.image also:
   *
   * WARNING: This is a temporary workaround for a problem in the
   * way the AWT loads native libraries. A number of classes in the
   * AWT package have a native method, initIDs(), which initializes
   * the JNI field and method ids used in the native portion of
   * their implementation.
   *
   * Since the use and storage of these ids is done by the
   * implementation libraries, the implementation of these method is
   * provided by the particular AWT implementations (for example,
   * "Toolkit"s/Peer), such as Motif, Microsoft Windows, or Tiny. The
   * problem is that this means that the native libraries must be
   * loaded by the java.* classes, which do not necessarily know the
   * names of the libraries to load. A better way of doing this
   * would be to provide a separate library which defines java.awt.*
   * initIDs, and exports the relevant symbols out to the
   * implementation libraries.
   *
   * For now, we know it's done by the implementation, and we assume
   * that the name of the library is "awt".  -br.
   */
  static loaded: boolean = false;
  static l8Tos8: number[] = null;
  static s8Tol8: number[] = null;
  static l16Tos8: number[] = null;
  static s8Tol16: number[] = null;
  static g8Tos8Map: JMap<ICC_ColorSpace, number[]> = null;
  static lg16Toog8Map: JMap<ICC_ColorSpace, number[]> = null;
  static g16Tos8Map: JMap<ICC_ColorSpace, number[]> = null;
  static lg16Toog16Map: JMap<ICC_ColorSpace, number[]> = null;
  $init_ColorModel() {
    this.transparency = Transparency.TRANSLUCENT;
    this.supportsAlpha = true;
    this.isAlphaPremultiplied_ = false;
    this.numComponents = -1;
    this.numColorComponents = -1;
    this.colorSpace = ColorSpace.getInstance(1000);
    this.colorSpaceType = 5;
    this.is_sRGB = true;
  }
  /**
   * Constructs a {@code ColorModel} that translates pixel values
   * to color/alpha components.  Color components will be in the
   * specified {@code ColorSpace}. {@code pixel_bits} is the
   * number of bits in the pixel values.  The bits array
   * specifies the number of significant bits per color and alpha component.
   * Its length should be the number of components in the
   * {@code ColorSpace} if there is no alpha information in the
   * pixel values, or one more than this number if there is alpha
   * information.  {@code hasAlpha} indicates whether or not alpha
   * information is present.  The {@code boolean}
   * {@code isAlphaPremultiplied} specifies how to interpret pixel
   * values in which color and alpha information are represented as
   * separate spatial bands.  If the {@code boolean}
   * is {@code true}, color samples are assumed to have been
   * multiplied by the alpha sample.  The {@code transparency}
   * specifies what alpha values can be represented by this color model.
   * The transfer type is the type of primitive array used to represent
   * pixel values.  Note that the bits array contains the number of
   * significant bits per color/alpha component after the translation
   * from pixel values.  For example, for an
   * {@code IndexColorModel} with {@code pixel_bits} equal to
   * 16, the bits array might have four elements with each element set
   * to 8.
   * @param pixel_bits the number of bits in the pixel values
   * @param bits array that specifies the number of significant bits
   *          per color and alpha component
   * @param cspace the specified {@code ColorSpace}
   * @param hasAlpha {@code true} if alpha information is present;
   *          {@code false} otherwise
   * @param isAlphaPremultiplied {@code true} if color samples are
   *          assumed to be premultiplied by the alpha samples;
   *          {@code false} otherwise
   * @param transparency what alpha values can be represented by this
   *          color model
   * @param transferType the type of the array used to represent pixel
   *          values
   * @throws IllegalArgumentException if the length of
   *          the bit array is less than the number of color or alpha
   *          components in this {@code ColorModel}, or if the
   *          transparency is not a valid value.
   * @throws IllegalArgumentException if the sum of the number
   *          of bits in {@code bits} is less than 1 or if
   *          any of the elements in {@code bits} is less than 0.
   * @see java.awt.Transparency
   */
  _ColorModel$int$intArr$ColorSpace$boolean$boolean$int$int(pixel_bits: number, bits: number[], cspace: ColorSpace, hasAlpha: boolean, isAlphaPremultiplied: boolean, transparency: number, transferType: number): this {
    this.$init_ColorModel();
    this.colorSpace = cspace;
    this.colorSpaceType = cspace.getType();
    this.numColorComponents = cspace.getNumComponents();
    this.numComponents = (this.numColorComponents + (hasAlpha ? 1 : 0)) | 0;
    this.supportsAlpha = hasAlpha;
    if (bits.length < this.numComponents) {
      throw new IllegalArgumentException('Number of color/alpha components should be ' + this.numComponents + ' but length of bits array is ' + bits.length);
    }
    if (transparency < Transparency.OPAQUE || transparency > Transparency.TRANSLUCENT) {
      throw new IllegalArgumentException('Unknown transparency: ' + transparency);
    }
    if (this.supportsAlpha === false) {
      this.isAlphaPremultiplied_ = false;
      this.transparency = Transparency.OPAQUE;
    } else {
      this.isAlphaPremultiplied_ = isAlphaPremultiplied;
      this.transparency = transparency;
    }
    this.nBits = Arrays.copyOf(bits, this.numComponents);
    this.pixel_bits = pixel_bits;
    if (pixel_bits <= 0) {
      throw new IllegalArgumentException('Number of pixel bits must be > 0');
    }
    this.maxBits = 0;
    for (let i = 0; i < bits.length; i++) {
      if (bits[i] < 0) {
        throw new IllegalArgumentException('Number of bits must be >= 0');
      }
      if (this.maxBits < bits[i]) {
        this.maxBits = bits[i];
      }
    }
    if (this.maxBits === 0) {
      throw new IllegalArgumentException('There must be at least one component with > 0 pixel bits.');
    }
    if (cspace !== ColorSpace.getInstance(1000)) {
      this.is_sRGB = false;
    }
    this.transferType = transferType;
    return this;
  }
  static loadLibraries(): void {
    if (!ColorModel.loaded) {
      AccessController.doPrivileged(new (ColorModel$1())());
      ColorModel.loaded = true;
    }
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.image.ColorModel', 'initIDs', this, $a);
  }
  /**
   * Returns a {@code DirectColorModel} that describes the default
   * format for integer RGB values used in many of the methods in the
   * AWT image interfaces for the convenience of the programmer.
   * The color space is the default {@link ColorSpace}, sRGB.
   * The format for the RGB values is an integer with 8 bits
   * each of alpha, red, green, and blue color components ordered
   * correspondingly from the most significant byte to the least
   * significant byte, as in:  0xAARRGGBB.  Color components are
   * not premultiplied by the alpha component.  This format does not
   * necessarily represent the native or the most efficient
   * {@code ColorModel} for a particular device or for all images.
   * It is merely used as a common color model format.
   * @return a {@code DirectColorModel} object describing default
   *          RGB values.
   */
  static getRGBdefault(): ColorModel {
    // class RGBdefault: ColorModel$1RGBdefault(), below
    return ColorModel$1RGBdefault().INSTANCE;
  }
  /**
   * Returns whether or not alpha is supported in this
   * {@code ColorModel}.
   * @return {@code true} if alpha is supported in this
   * {@code ColorModel}; {@code false} otherwise.
   */
  hasAlpha(): boolean {
    return this.supportsAlpha;
  }
  /**
   * Returns whether or not the alpha has been premultiplied in the
   * pixel values to be translated by this {@code ColorModel}.
   * If the boolean is {@code true}, this {@code ColorModel}
   * is to be used to interpret pixel values in which color and alpha
   * information are represented as separate spatial bands, and color
   * samples are assumed to have been multiplied by the
   * alpha sample.
   * @return {@code true} if the alpha values are premultiplied
   *          in the pixel values to be translated by this
   *          {@code ColorModel}; {@code false} otherwise.
   */
  isAlphaPremultiplied(): boolean {
    return this.isAlphaPremultiplied_;
  }
  /**
   * Returns the number of bits per pixel described by this
   * {@code ColorModel}.
   * @return the number of bits per pixel.
   */
  getPixelSize(): number {
    return this.pixel_bits;
  }
  /**
   * Returns an array of the number of bits per color/alpha component.
   * The array contains the color components in the order specified by the
   * {@code ColorSpace}, followed by the alpha component, if
   * present.
   * @return an array of the number of bits per color/alpha component
   */
  getComponentSize$(): number[] {
    if (this.nBits != null) {
      return this.nBits.slice();
    }
    return null;
  }
  /**
   * Returns the transparency.  Returns either OPAQUE, BITMASK,
   * or TRANSLUCENT.
   * @return the transparency of this {@code ColorModel}.
   * @see Transparency#OPAQUE
   * @see Transparency#BITMASK
   * @see Transparency#TRANSLUCENT
   */
  getTransparency(): number {
    return this.transparency;
  }
  /**
   * Returns the number of components, including alpha, in this
   * {@code ColorModel}.  This is equal to the number of color
   * components, optionally plus one, if there is an alpha component.
   * @return the number of components in this {@code ColorModel}
   */
  getNumComponents(): number {
    return this.numComponents;
  }
  /**
   * Returns the number of color components in this
   * {@code ColorModel}.
   * This is the number of components returned by
   * {@link ColorSpace#getNumComponents}.
   * @return the number of color components in this
   * {@code ColorModel}.
   * @see ColorSpace#getNumComponents
   */
  getNumColorComponents(): number {
    return this.numColorComponents;
  }
  /**
   * Returns an array of all of the color/alpha components in unnormalized
   * form, given a normalized component array.  Unnormalized components
   * are unsigned integral values between 0 and 2<sup>n</sup> - 1, where
   * n is the number of bits for a particular component.  Normalized
   * components are float values between a per component minimum and
   * maximum specified by the {@code ColorSpace} object for this
   * {@code ColorModel}.  An {@code IllegalArgumentException}
   * will be thrown if color component values for this
   * {@code ColorModel} are not conveniently representable in the
   * unnormalized form.  If the
   * {@code components} array is {@code null}, a new array
   * will be allocated.  The {@code components} array will
   * be returned.  Color/alpha components are stored in the
   * {@code components} array starting at {@code offset} (even
   * if the array is allocated by this method). An
   * {@code ArrayIndexOutOfBoundsException} is thrown if the
   * {@code components} array is not {@code null} and is not
   * large enough to hold all the color and alpha
   * components (starting at {@code offset}).  An
   * {@code IllegalArgumentException} is thrown if the
   * {@code normComponents} array is not large enough to hold
   * all the color and alpha components starting at
   * {@code normOffset}.
   * @param normComponents an array containing normalized components
   * @param normOffset the offset into the {@code normComponents}
   * array at which to start retrieving normalized components
   * @param components an array that receives the components from
   * {@code normComponents}
   * @param offset the index into {@code components} at which to
   * begin storing normalized components from
   * {@code normComponents}
   * @return an array containing unnormalized color and alpha
   * components.
   * @throws IllegalArgumentException If the component values for this
   * {@code ColorModel} are not conveniently representable in the
   * unnormalized form.
   * @throws IllegalArgumentException if the length of
   *          {@code normComponents} minus {@code normOffset}
   *          is less than {@code numComponents}
   * @throws UnsupportedOperationException if the
   *          constructor of this {@code ColorModel} called the
   *          {@code super(bits)} constructor, but did not
   *          override this method.  See the constructor,
   *          {@link #ColorModel(int)}.
   */
  getUnnormalizedComponents(normComponents: number[], normOffset: number, components: number[], offset: number): number[] {
    if (this.colorSpace == null) {
      throw new UnsupportedOperationException('This method is not supported by this color model.');
    }
    if (this.nBits == null) {
      throw new UnsupportedOperationException('This method is not supported.  Unable to determine #bits per component.');
    }
    if (((normComponents.length - normOffset) | 0) < this.numComponents) {
      throw new IllegalArgumentException('Incorrect number of components.  Expecting ' + this.numComponents);
    }
    if (components == null) {
      components = $J.newArray((offset + this.numComponents) | 0, 0);
    }
    if (this.supportsAlpha && this.isAlphaPremultiplied_) {
      let normAlpha = normComponents[(normOffset + this.numColorComponents) | 0];
      for (let i = 0; i < this.numColorComponents; i++) {
        (components[(offset + i) | 0]) = $J.d2i((Math.fround(Math.fround(Math.fround((normComponents[(normOffset + i) | 0]) * (((1 << this.nBits[i]) - 1) | 0)) * normAlpha) + 0.5)));
      }
      (components[(offset + this.numColorComponents) | 0]) = $J.d2i((Math.fround(Math.fround(normAlpha * (((1 << this.nBits[this.numColorComponents]) - 1) | 0)) + 0.5)));
    } else {
      for (let i = 0; i < this.numComponents; i++) {
        (components[(offset + i) | 0]) = $J.d2i((Math.fround(Math.fround((normComponents[(normOffset + i) | 0]) * (((1 << this.nBits[i]) - 1) | 0)) + 0.5)));
      }
    }
    return components;
  }
  /**
   * Returns an array of all of the color/alpha components in normalized
   * form, given an unnormalized component array.  Unnormalized components
   * are unsigned integral values between 0 and 2<sup>n</sup> - 1, where
   * n is the number of bits for a particular component.  Normalized
   * components are float values between a per component minimum and
   * maximum specified by the {@code ColorSpace} object for this
   * {@code ColorModel}.  An {@code IllegalArgumentException}
   * will be thrown if color component values for this
   * {@code ColorModel} are not conveniently representable in the
   * unnormalized form.  If the
   * {@code normComponents} array is {@code null}, a new array
   * will be allocated.  The {@code normComponents} array
   * will be returned.  Color/alpha components are stored in the
   * {@code normComponents} array starting at
   * {@code normOffset} (even if the array is allocated by this
   * method).  An {@code ArrayIndexOutOfBoundsException} is thrown
   * if the {@code normComponents} array is not {@code null}
   * and is not large enough to hold all the color and alpha components
   * (starting at {@code normOffset}).  An
   * {@code IllegalArgumentException} is thrown if the
   * {@code components} array is not large enough to hold all the
   * color and alpha components starting at {@code offset}.
   * <p>
   * Since {@code ColorModel} is an abstract class,
   * any instance is an instance of a subclass.  The default implementation
   * of this method in this abstract class assumes that component values
   * for this class are conveniently representable in the unnormalized
   * form.  Therefore, subclasses which may
   * have instances which do not support the unnormalized form must
   * override this method.
   * @param components an array containing unnormalized components
   * @param offset the offset into the {@code components} array at
   * which to start retrieving unnormalized components
   * @param normComponents an array that receives the normalized components
   * @param normOffset the index into {@code normComponents} at
   * which to begin storing normalized components
   * @return an array containing normalized color and alpha
   * components.
   * @throws IllegalArgumentException If the component values for this
   * {@code ColorModel} are not conveniently representable in the
   * unnormalized form.
   * @throws UnsupportedOperationException if the
   *          constructor of this {@code ColorModel} called the
   *          {@code super(bits)} constructor, but did not
   *          override this method.  See the constructor,
   *          {@link #ColorModel(int)}.
   * @throws UnsupportedOperationException if this method is unable
   *          to determine the number of bits per component
   */
  getNormalizedComponents$intArr$int$floatArr$int(components: number[], offset: number, normComponents: number[], normOffset: number): number[] {
    if (this.colorSpace == null) {
      throw new UnsupportedOperationException('This method is not supported by this color model.');
    }
    if (this.nBits == null) {
      throw new UnsupportedOperationException('This method is not supported.  Unable to determine #bits per component.');
    }
    if (((components.length - offset) | 0) < this.numComponents) {
      throw new IllegalArgumentException('Incorrect number of components.  Expecting ' + this.numComponents);
    }
    if (normComponents == null) {
      normComponents = $J.newArray((this.numComponents + normOffset) | 0, 0);
    }
    if (this.supportsAlpha && this.isAlphaPremultiplied_) {
      let normAlpha = Math.fround(components[(offset + this.numColorComponents) | 0]);
      normAlpha = Math.fround(normAlpha / Math.fround((((1 << this.nBits[this.numColorComponents]) - 1) | 0)));
      if (normAlpha !== 0) {
        for (let i = 0; i < this.numColorComponents; i++) {
          (normComponents[(normOffset + i) | 0]) = Math.fround((Math.fround(components[(offset + i) | 0])) / (Math.fround(normAlpha * (Math.fround((((1 << this.nBits[i]) - 1) | 0))))));
        }
      } else {
        for (let i = 0; i < this.numColorComponents; i++) {
          (normComponents[(normOffset + i) | 0]) = 0;
        }
      }
      (normComponents[(normOffset + this.numColorComponents) | 0]) = normAlpha;
    } else {
      for (let i = 0; i < this.numComponents; i++) {
        (normComponents[(normOffset + i) | 0]) = Math.fround((Math.fround(components[(offset + i) | 0])) / (Math.fround((((1 << this.nBits[i]) - 1) | 0))));
      }
    }
    return normComponents;
  }
  /**
   * Returns a data element array representation of a pixel in this
   * {@code ColorModel}, given an array of normalized color/alpha
   * components.  This array can then be passed to the
   * {@code setDataElements} method of a {@code WritableRaster}
   * object.  An {@code ArrayIndexOutOfBoundsException} is thrown
   * if the {@code normComponents} array is not large enough to hold
   * all the color and alpha components (starting at
   * {@code normOffset}).  If the {@code obj} variable is
   * {@code null}, a new array will be allocated.  If
   * {@code obj} is not {@code null}, it must be a primitive
   * array of type transferType; otherwise, a
   * {@code ClassCastException} is thrown.  An
   * {@code ArrayIndexOutOfBoundsException} is thrown if
   * {@code obj} is not large enough to hold a pixel value for this
   * {@code ColorModel}.
   * Since {@code ColorModel} is an abstract class,
   * any instance is an instance of a subclass.  The default implementation
   * of this method in this abstract class first converts from the
   * normalized form to the unnormalized form and then calls
   * {@code getDataElement(int[], int, Object)}.  Subclasses which may
   * have instances which do not support the unnormalized form must
   * override this method.
   * @param normComponents an array of normalized color and alpha
   * components
   * @param normOffset the index into {@code normComponents} at which to
   * begin retrieving color and alpha components
   * @param obj a primitive data array to hold the returned pixel
   * @return an {@code Object} which is a primitive data array
   * representation of a pixel
   * @throws ClassCastException if {@code obj}
   *  is not a primitive array of type {@code transferType}
   * @throws ArrayIndexOutOfBoundsException if
   *  {@code obj} is not large enough to hold a pixel value
   *  for this {@code ColorModel} or the {@code normComponents}
   *  array is not large enough to hold all of the color and alpha
   *  components starting at {@code normOffset}
   * @see WritableRaster#setDataElements
   * @see SampleModel#setDataElements
   * @since 1.4
   */
  getDataElements$floatArr$int$Object(normComponents: number[], normOffset: number, obj: any): any {
    let components = this.getUnnormalizedComponents(normComponents, normOffset, null, 0);
    return this.getDataElements$intArr$int$Object(components, 0, obj);
  }
  /**
   * Returns an array of all of the color/alpha components in normalized
   * form, given a pixel in this {@code ColorModel}.  The pixel
   * value is specified by an array of data elements of type transferType
   * passed in as an object reference.  If pixel is not a primitive array
   * of type transferType, a {@code ClassCastException} is thrown.
   * An {@code ArrayIndexOutOfBoundsException} is thrown if
   * {@code pixel} is not large enough to hold a pixel value for this
   * {@code ColorModel}.
   * Normalized components are float values between a per component minimum
   * and maximum specified by the {@code ColorSpace} object for this
   * {@code ColorModel}.  If the
   * {@code normComponents} array is {@code null}, a new array
   * will be allocated.  The {@code normComponents} array
   * will be returned.  Color/alpha components are stored in the
   * {@code normComponents} array starting at
   * {@code normOffset} (even if the array is allocated by this
   * method).  An {@code ArrayIndexOutOfBoundsException} is thrown
   * if the {@code normComponents} array is not {@code null}
   * and is not large enough to hold all the color and alpha components
   * (starting at {@code normOffset}).
   * Since {@code ColorModel} is an abstract class,
   * any instance is an instance of a subclass.  The default implementation
   * of this method in this abstract class first retrieves color and alpha
   * components in the unnormalized form using
   * {@code getComponents(Object, int[], int)} and then calls
   * {@code getNormalizedComponents(int[], int, float[], int)}.
   * Subclasses which may
   * have instances which do not support the unnormalized form must
   * override this method.
   * @param pixel the specified pixel
   * @param normComponents an array to receive the normalized components
   * @param normOffset the offset into the {@code normComponents}
   * array at which to start storing normalized components
   * @return an array containing normalized color and alpha
   * components.
   * @throws ClassCastException if {@code pixel} is not a primitive
   *          array of type transferType
   * @throws ArrayIndexOutOfBoundsException if
   *          {@code normComponents} is not large enough to hold all
   *          color and alpha components starting at {@code normOffset}
   * @throws ArrayIndexOutOfBoundsException if
   *          {@code pixel} is not large enough to hold a pixel
   *          value for this {@code ColorModel}.
   * @throws UnsupportedOperationException if the
   *          constructor of this {@code ColorModel} called the
   *          {@code super(bits)} constructor, but did not
   *          override this method.  See the constructor,
   *          {@link #ColorModel(int)}.
   * @throws UnsupportedOperationException if this method is unable
   *          to determine the number of bits per component
   * @since 1.4
   */
  getNormalizedComponents$Object$floatArr$int(pixel: any, normComponents: number[], normOffset: number): number[] {
    let components = this.getComponents$Object$intArr$int(pixel, null, 0);
    return this.getNormalizedComponents$intArr$int$floatArr$int(components, 0, normComponents, normOffset);
  }
  /**
   * Returns the {@code ColorSpace} associated with this
   * {@code ColorModel}.
   * @return the {@code ColorSpace} of this
   * {@code ColorModel}.
   */
  getColorSpace(): ColorSpace {
    return this.colorSpace;
  }
  /**
   * Returns the {@code String} representation of the contents of
   * this {@code ColorModel} object.
   * @return a {@code String} representing the contents of this
   * {@code ColorModel} object.
   */
  toString(): string {
    return 'ColorModel: #pixelBits = ' + this.pixel_bits + ' numComponents = ' + this.numComponents + ' color space = ' + $J.str(this.colorSpace) + ' transparency = ' + this.transparency + ' has alpha = ' + this.supportsAlpha + ' isAlphaPre = ' + this.isAlphaPremultiplied_;
  }
  static getDefaultTransferType(pixel_bits: number): number {
    if (pixel_bits <= 8) {
      return DataBuffer.TYPE_BYTE;
    } else if (pixel_bits <= 16) {
      return DataBuffer.TYPE_USHORT;
    } else if (pixel_bits <= 32) {
      return DataBuffer.TYPE_INT;
    } else {
      return DataBuffer.TYPE_UNDEFINED;
    }
  }
  static isLinearRGBspace(cs: ColorSpace): boolean {
    return cs === ColorSpace.getInstance(1004);
  }
  static isLinearGRAYspace(cs: ColorSpace): boolean {
    return cs === ColorSpace.getInstance(1003);
  }
  static getLinearRGB8TosRGB8LUT(): number[] {
    if (ColorModel.l8Tos8 == null) {
      ColorModel.l8Tos8 = $J.newArray(256, 0);
      let input: number;
      let output: number;
      for (let i = 0; i <= 255; i++) {
        input = Math.fround((Math.fround(i)) / 255);
        if (input <= Math.fround(0.0031308)) {
          output = Math.fround(input * Math.fround(12.92));
        } else {
          output = Math.fround(Math.fround(Math.fround(1.055) * (Math.fround($J.pow(input, (1 / 2.4))))) - Math.fround(0.055));
        }
        ColorModel.l8Tos8[i] = (($J.roundf(Math.fround(output * 255))) << 24) >> 24;
      }
    }
    return ColorModel.l8Tos8;
  }
  static getsRGB8ToLinearRGB8LUT(): number[] {
    if (ColorModel.s8Tol8 == null) {
      ColorModel.s8Tol8 = $J.newArray(256, 0);
      let input: number;
      let output: number;
      for (let i = 0; i <= 255; i++) {
        input = Math.fround((Math.fround(i)) / 255);
        if (input <= Math.fround(0.04045)) {
          output = Math.fround(input / Math.fround(12.92));
        } else {
          output = Math.fround($J.pow(Math.fround((Math.fround(input + Math.fround(0.055))) / Math.fround(1.055)), 2.4));
        }
        ColorModel.s8Tol8[i] = (($J.roundf(Math.fround(output * 255))) << 24) >> 24;
      }
    }
    return ColorModel.s8Tol8;
  }
  static getLinearRGB16TosRGB8LUT(): number[] {
    if (ColorModel.l16Tos8 == null) {
      ColorModel.l16Tos8 = $J.newArray(65536, 0);
      let input: number;
      let output: number;
      for (let i = 0; i <= 65535; i++) {
        input = Math.fround((Math.fround(i)) / 65535);
        if (input <= Math.fround(0.0031308)) {
          output = Math.fround(input * Math.fround(12.92));
        } else {
          output = Math.fround(Math.fround(Math.fround(1.055) * (Math.fround($J.pow(input, (1 / 2.4))))) - Math.fround(0.055));
        }
        ColorModel.l16Tos8[i] = (($J.roundf(Math.fround(output * 255))) << 24) >> 24;
      }
    }
    return ColorModel.l16Tos8;
  }
  static getsRGB8ToLinearRGB16LUT(): number[] {
    if (ColorModel.s8Tol16 == null) {
      ColorModel.s8Tol16 = $J.newArray(256, 0);
      let input: number;
      let output: number;
      for (let i = 0; i <= 255; i++) {
        input = Math.fround((Math.fround(i)) / 255);
        if (input <= Math.fround(0.04045)) {
          output = Math.fround(input / Math.fround(12.92));
        } else {
          output = Math.fround($J.pow(Math.fround((Math.fround(input + Math.fround(0.055))) / Math.fround(1.055)), 2.4));
        }
        ColorModel.s8Tol16[i] = (($J.roundf(Math.fround(output * 65535))) << 16) >> 16;
      }
    }
    return ColorModel.s8Tol16;
  }
  static getGray8TosRGB8LUT(grayCS: ICC_ColorSpace): number[] {
    if (ColorModel.isLinearGRAYspace(grayCS)) {
      return ColorModel.getLinearRGB8TosRGB8LUT();
    }
    if (ColorModel.g8Tos8Map != null) {
      let g8Tos8LUT = ColorModel.g8Tos8Map.get(grayCS);
      if (g8Tos8LUT != null) {
        return g8Tos8LUT;
      }
    }
    let g8Tos8LUT = $J.newArray(256, 0);
    for (let i = 0; i <= 255; i++) {
      g8Tos8LUT[i] = ((i) << 24) >> 24;
    }
    let srgb = ICC_Profile.getInstance(1000);
    let mdl = CMSManager.getModule();
    let t = mdl.createTransform(-1, grayCS.getProfile(), srgb);
    let tmp = t.colorConvert(g8Tos8LUT, null);
    for (let i = 0, j = 2; i <= 255; i++, j = (j + 3) | 0) {
      g8Tos8LUT[i] = tmp[j];
    }
    if (ColorModel.g8Tos8Map == null) {
      ColorModel.g8Tos8Map = Collections.synchronizedMap(new WeakHashMap(2));
    }
    ColorModel.g8Tos8Map.put(grayCS, g8Tos8LUT);
    return g8Tos8LUT;
  }
  static getLinearGray16ToOtherGray8LUT(grayCS: ICC_ColorSpace): number[] {
    if (ColorModel.lg16Toog8Map != null) {
      let lg16Toog8LUT = ColorModel.lg16Toog8Map.get(grayCS);
      if (lg16Toog8LUT != null) {
        return lg16Toog8LUT;
      }
    }
    let tmp = $J.newArray(65536, 0);
    for (let i = 0; i <= 65535; i++) {
      tmp[i] = ((i) << 16) >> 16;
    }
    let lg = ICC_Profile.getInstance(1003);
    let mdl = CMSManager.getModule();
    let t = mdl.createTransform(-1, lg, grayCS.getProfile());
    tmp = t.colorConvert(tmp, null);
    let lg16Toog8LUT = $J.newArray(65536, 0);
    for (let i = 0; i <= 65535; i++) {
      lg16Toog8LUT[i] = (($J.d2i((Math.fround(Math.fround((Math.fround((tmp[i] & 65535))) * (Math.fround(1 / 257))) + 0.5)))) << 24) >> 24;
    }
    if (ColorModel.lg16Toog8Map == null) {
      ColorModel.lg16Toog8Map = Collections.synchronizedMap(new WeakHashMap(2));
    }
    ColorModel.lg16Toog8Map.put(grayCS, lg16Toog8LUT);
    return lg16Toog8LUT;
  }
  static getGray16TosRGB8LUT(grayCS: ICC_ColorSpace): number[] {
    if (ColorModel.isLinearGRAYspace(grayCS)) {
      return ColorModel.getLinearRGB16TosRGB8LUT();
    }
    if (ColorModel.g16Tos8Map != null) {
      let g16Tos8LUT = ColorModel.g16Tos8Map.get(grayCS);
      if (g16Tos8LUT != null) {
        return g16Tos8LUT;
      }
    }
    let tmp = $J.newArray(65536, 0);
    for (let i = 0; i <= 65535; i++) {
      tmp[i] = ((i) << 16) >> 16;
    }
    let srgb = ICC_Profile.getInstance(1000);
    let mdl = CMSManager.getModule();
    let t = mdl.createTransform(-1, grayCS.getProfile(), srgb);
    tmp = t.colorConvert(tmp, null);
    let g16Tos8LUT = $J.newArray(65536, 0);
    for (let i = 0, j = 2; i <= 65535; i++, j = (j + 3) | 0) {
      g16Tos8LUT[i] = (($J.d2i((Math.fround(Math.fround((Math.fround((tmp[j] & 65535))) * (Math.fround(1 / 257))) + 0.5)))) << 24) >> 24;
    }
    if (ColorModel.g16Tos8Map == null) {
      ColorModel.g16Tos8Map = Collections.synchronizedMap(new WeakHashMap(2));
    }
    ColorModel.g16Tos8Map.put(grayCS, g16Tos8LUT);
    return g16Tos8LUT;
  }
  static getLinearGray16ToOtherGray16LUT(grayCS: ICC_ColorSpace): number[] {
    if (ColorModel.lg16Toog16Map != null) {
      let lg16Toog16LUT = ColorModel.lg16Toog16Map.get(grayCS);
      if (lg16Toog16LUT != null) {
        return lg16Toog16LUT;
      }
    }
    let tmp = $J.newArray(65536, 0);
    for (let i = 0; i <= 65535; i++) {
      tmp[i] = ((i) << 16) >> 16;
    }
    let lg = ICC_Profile.getInstance(1003);
    let mdl = CMSManager.getModule();
    let t = mdl.createTransform(-1, lg, grayCS.getProfile());
    let lg16Toog16LUT = t.colorConvert(tmp, null);
    if (ColorModel.lg16Toog16Map == null) {
      ColorModel.lg16Toog16Map = Collections.synchronizedMap(new WeakHashMap(2));
    }
    ColorModel.lg16Toog16Map.put(grayCS, lg16Toog16LUT);
    return lg16Toog16LUT;
  }
  static $clinit() {
    ColorModel.loaded = false;
    ColorModel.loadLibraries();
    ColorModel.initIDs();
    ColorModel.l8Tos8 = null;
    ColorModel.s8Tol8 = null;
    ColorModel.l16Tos8 = null;
    ColorModel.s8Tol16 = null;
    ColorModel.g8Tos8Map = null;
    ColorModel.lg16Toog8Map = null;
    ColorModel.g16Tos8Map = null;
    ColorModel.lg16Toog16Map = null;
  }
}

let $ColorModel$1: any = null;
/** An anonymous class (ColorModel.java:209). */
function ColorModel$1(): any {
  return $ColorModel$1 ??= $J.local(class extends JObject {
    run(): Void {
      $J.system_loadLibrary('awt');
      return null;
    }
  }, 'java.awt.image.ColorModel$1', ['java.security.PrivilegedAction']);
}

let $ColorModel$1RGBdefault: any = null;
/** The local class RGBdefault (ColorModel.java:242). */
function ColorModel$1RGBdefault(): any {
  return $ColorModel$1RGBdefault ??= $J.local(class extends JObject {
    static INSTANCE: ColorModel = null;
    static $clinit() {
      RGBdefault.INSTANCE = new DirectColorModel()._DirectColorModel$int$int$int$int$int(32, 16711680, 65280, 255, -16777216);
    }
  }, 'java.awt.image.ColorModel$1RGBdefault', []);
}

$J.define(ColorModel, 'java.awt.image.ColorModel', { kind: 'class', ifaces: ['java.awt.Transparency'], sup: 'java.lang.Object', ctors: { 'int,int[],java.awt.color.ColorSpace,boolean,boolean,int,int': '_ColorModel$int$intArr$ColorSpace$boolean$boolean$int$int', 'int': '_ColorModel$int' }, meths: { 'getNormalizedComponents(java.lang.Object,float[],int)': 'getNormalizedComponents$Object$floatArr$int', 'getDataElements(float[],int,java.lang.Object)': 'getDataElements$floatArr$int$Object', 'getDataElement(float[],int)': 'getDataElement$floatArr$int', 'getDataElements(int[],int,java.lang.Object)': 'getDataElements$intArr$int$Object', 'getDataElement(int[],int)': 'getDataElement$intArr$int', 'getNormalizedComponents(int[],int,float[],int)': 'getNormalizedComponents$intArr$int$floatArr$int', 'getComponents(java.lang.Object,int[],int)': 'getComponents$Object$intArr$int', 'getComponents(int,int[],int)': 'getComponents$int$intArr$int', 'getDataElements(int,java.lang.Object)': 'getDataElements$int$Object', 'getRGB(java.lang.Object)': 'getRGB$Object', 'getAlpha(java.lang.Object)': 'getAlpha$Object', 'getBlue(java.lang.Object)': 'getBlue$Object', 'getGreen(java.lang.Object)': 'getGreen$Object', 'getRed(java.lang.Object)': 'getRed$Object', 'getRGB(int)': 'getRGB$int', 'getAlpha(int)': 'getAlpha$int', 'getBlue(int)': 'getBlue$int', 'getGreen(int)': 'getGreen$int', 'getRed(int)': 'getRed$int', 'getComponentSize()': 'getComponentSize$', 'getComponentSize(int)': 'getComponentSize$int' }, clinit: true, lazy: ['loaded', 'l8Tos8', 's8Tol8', 'l16Tos8', 's8Tol16', 'g8Tos8Map', 'lg16Toog8Map', 'g16Tos8Map', 'lg16Toog16Map'] });
$J.module(() => {
  Transparency = $J.load('java.awt.Transparency');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  DirectColorModel = $J.load('java.awt.image.DirectColorModel');
});
