// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/ComponentColorModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays, ICC_ColorSpace, IllegalArgumentException, UnsupportedOperationException } from '../../../../jre/index.ts';
import { ColorModel } from './ColorModel.ts';

let ComponentSampleModel, DataBuffer, PixelInterleavedSampleModel, Raster;

/**
 * A {@code ColorModel} class that works with pixel values that
 * represent color and alpha information as separate samples and that
 * store each sample in a separate data element.  This class can be
 * used with an arbitrary {@code ColorSpace}.  The number of
 * color samples in the pixel values must be same as the number of
 * color components in the {@code ColorSpace}. There may be a
 * single alpha sample.
 * <p>
 * For those methods that use
 * a primitive array pixel representation of type {@code transferType},
 * the array length is the same as the number of color and alpha samples.
 * Color samples are stored first in the array followed by the alpha
 * sample, if present.  The order of the color samples is specified
 * by the {@code ColorSpace}.  Typically, this order reflects the
 * name of the color space type. For example, for {@code TYPE_RGB},
 * index 0 corresponds to red, index 1 to green, and index 2 to blue.
 * <p>
 * The translation from pixel sample values to color/alpha components for
 * display or processing purposes is based on a one-to-one correspondence of
 * samples to components.
 * Depending on the transfer type used to create an instance of
 * {@code ComponentColorModel}, the pixel sample values
 * represented by that instance may be signed or unsigned and may
 * be of integral type or float or double (see below for details).
 * The translation from sample values to normalized color/alpha components
 * must follow certain rules.  For float and double samples, the translation
 * is an identity, i.e. normalized component values are equal to the
 * corresponding sample values.  For integral samples, the translation
 * should be only a simple scale and offset, where the scale and offset
 * constants may be different for each component.  The result of
 * applying the scale and offset constants is a set of color/alpha
 * component values, which are guaranteed to fall within a certain
 * range.  Typically, the range for a color component will be the range
 * defined by the {@code getMinValue} and {@code getMaxValue}
 * methods of the {@code ColorSpace} class.  The range for an
 * alpha component should be 0.0 to 1.0.
 * <p>
 * Instances of {@code ComponentColorModel} created with transfer types
 * {@code DataBuffer.TYPE_BYTE}, {@code DataBuffer.TYPE_USHORT},
 * and {@code DataBuffer.TYPE_INT} have pixel sample values which
 * are treated as unsigned integral values.
 * The number of bits in a color or alpha sample of a pixel value might not
 * be the same as the number of bits for the corresponding color or alpha
 * sample passed to the
 * {@code ComponentColorModel(ColorSpace, int[], boolean, boolean, int, int)}
 * constructor.  In
 * that case, this class assumes that the least significant n bits of a sample
 * value hold the component value, where n is the number of significant bits
 * for the component passed to the constructor.  It also assumes that
 * any higher-order bits in a sample value are zero.  Thus, sample values
 * range from 0 to 2<sup>n</sup> - 1.  This class maps these sample values
 * to normalized color component values such that 0 maps to the value
 * obtained from the {@code ColorSpace's getMinValue}
 * method for each component and 2<sup>n</sup> - 1 maps to the value
 * obtained from {@code getMaxValue}.  To create a
 * {@code ComponentColorModel} with a different color sample mapping
 * requires subclassing this class and overriding the
 * {@code getNormalizedComponents(Object, float[], int)} method.
 * The mapping for an alpha sample always maps 0 to 0.0 and
 * 2<sup>n</sup> - 1 to 1.0.
 * <p>
 * For instances with unsigned sample values,
 * the unnormalized color/alpha component representation is only
 * supported if two conditions hold.  First, sample value 0 must
 * map to normalized component value 0.0 and sample value 2<sup>n</sup> - 1
 * to 1.0.  Second the min/max range of all color components of the
 * {@code ColorSpace} must be 0.0 to 1.0.  In this case, the
 * component representation is the n least
 * significant bits of the corresponding sample.  Thus each component is
 * an unsigned integral value between 0 and 2<sup>n</sup> - 1, where
 * n is the number of significant bits for a particular component.
 * If these conditions are not met, any method taking an unnormalized
 * component argument will throw an {@code IllegalArgumentException}.
 * <p>
 * Instances of {@code ComponentColorModel} created with transfer types
 * {@code DataBuffer.TYPE_SHORT}, {@code DataBuffer.TYPE_FLOAT}, and
 * {@code DataBuffer.TYPE_DOUBLE} have pixel sample values which
 * are treated as signed short, float, or double values.
 * Such instances do not support the unnormalized color/alpha component
 * representation, so any methods taking such a representation as an argument
 * will throw an {@code IllegalArgumentException} when called on one
 * of these instances.  The normalized component values of instances
 * of this class have a range which depends on the transfer
 * type as follows: for float samples, the full range of the float data
 * type; for double samples, the full range of the float data type
 * (resulting from casting double to float); for short samples,
 * from approximately -maxVal to +maxVal, where maxVal is the per
 * component maximum value for the {@code ColorSpace}
 * (-32767 maps to -maxVal, 0 maps to 0.0, and 32767 maps
 * to +maxVal).  A subclass may override the scaling for short sample
 * values to normalized component values by overriding the
 * {@code getNormalizedComponents(Object, float[], int)} method.
 * For float and double samples, the normalized component values are
 * taken to be equal to the corresponding sample values, and subclasses
 * should not attempt to add any non-identity scaling for these transfer
 * types.
 * <p>
 * Instances of {@code ComponentColorModel} created with transfer types
 * {@code DataBuffer.TYPE_SHORT}, {@code DataBuffer.TYPE_FLOAT}, and
 * {@code DataBuffer.TYPE_DOUBLE}
 * use all the bits of all sample values.  Thus all color/alpha components
 * have 16 bits when using {@code DataBuffer.TYPE_SHORT}, 32 bits when
 * using {@code DataBuffer.TYPE_FLOAT}, and 64 bits when using
 * {@code DataBuffer.TYPE_DOUBLE}.  When the
 * {@code ComponentColorModel(ColorSpace, int[], boolean, boolean, int, int)}
 * form of constructor is used with one of these transfer types, the
 * bits array argument is ignored.
 * <p>
 * It is possible to have color/alpha sample values
 * which cannot be reasonably interpreted as component values for rendering.
 * This can happen when {@code ComponentColorModel} is subclassed to
 * override the mapping of unsigned sample values to normalized color
 * component values or when signed sample values outside a certain range
 * are used.  (As an example, specifying an alpha component as a signed
 * short value outside the range 0 to 32767, normalized range 0.0 to 1.0, can
 * lead to unexpected results.) It is the
 * responsibility of applications to appropriately scale pixel data before
 * rendering such that color components fall within the normalized range
 * of the {@code ColorSpace} (obtained using the {@code getMinValue}
 * and {@code getMaxValue} methods of the {@code ColorSpace} class)
 * and the alpha component is between 0.0 and 1.0.  If color or alpha
 * component values fall outside these ranges, rendering results are
 * indeterminate.
 * <p>
 * Methods that use a single int pixel representation throw
 * an {@code IllegalArgumentException}, unless the number of components
 * for the {@code ComponentColorModel} is one and the component
 * value is unsigned -- in other words,  a single color component using
 * a transfer type of {@code DataBuffer.TYPE_BYTE},
 * {@code DataBuffer.TYPE_USHORT}, or {@code DataBuffer.TYPE_INT}
 * and no alpha.
 * <p>
 * A {@code ComponentColorModel} can be used in conjunction with a
 * {@code ComponentSampleModel}, a {@code BandedSampleModel},
 * or a {@code PixelInterleavedSampleModel} to construct a
 * {@code BufferedImage}.
 *
 * @see ColorModel
 * @see ColorSpace
 * @see ComponentSampleModel
 * @see BandedSampleModel
 * @see PixelInterleavedSampleModel
 * @see BufferedImage
 */
export class ComponentColorModel extends ColorModel {
  /**
   * {@code signed}  is {@code true} for {@code short},
   * {@code float}, and {@code double} transfer types; it
   * is {@code false} for {@code byte}, {@code ushort},
   * and {@code int} transfer types.
   */
  signed: boolean = false;
  is_sRGB_stdScale: boolean = false;
  is_LinearRGB_stdScale: boolean = false;
  is_LinearGray_stdScale: boolean = false;
  is_ICCGray_stdScale: boolean = false;
  tosRGB8LUT: number[] = null;
  fromsRGB8LUT8: number[] = null;
  fromsRGB8LUT16: number[] = null;
  fromLinearGray16ToOtherGray8LUT: number[] = null;
  fromLinearGray16ToOtherGray16LUT: number[] = null;
  needScaleInit: boolean = false;
  noUnnorm: boolean = false;
  nonStdScale: boolean = false;
  min: number[] = null;
  diffMinMax: number[] = null;
  compOffset: number[] = null;
  compScale: number[] = null;
  hashCode_: number = 0;
  /**
   * Constructs a {@code ComponentColorModel} from the specified
   * parameters. Color components will be in the specified
   * {@code ColorSpace}.  The supported transfer types are
   * {@code DataBuffer.TYPE_BYTE}, {@code DataBuffer.TYPE_USHORT},
   * {@code DataBuffer.TYPE_INT},
   * {@code DataBuffer.TYPE_SHORT}, {@code DataBuffer.TYPE_FLOAT},
   * and {@code DataBuffer.TYPE_DOUBLE}.
   * If not null, the {@code bits} array specifies the
   * number of significant bits per color and alpha component and its
   * length should be at least the number of components in the
   * {@code ColorSpace} if there is no alpha
   * information in the pixel values, or one more than this number if
   * there is alpha information.  When the {@code transferType} is
   * {@code DataBuffer.TYPE_SHORT}, {@code DataBuffer.TYPE_FLOAT},
   * or {@code DataBuffer.TYPE_DOUBLE} the {@code bits} array
   * argument is ignored.  {@code hasAlpha} indicates whether alpha
   * information is present.  If {@code hasAlpha} is true, then
   * the boolean {@code isAlphaPremultiplied}
   * specifies how to interpret color and alpha samples in pixel values.
   * If the boolean is true, color samples are assumed to have been
   * multiplied by the alpha sample. The {@code transparency}
   * specifies what alpha values can be represented by this color model.
   * The acceptable {@code transparency} values are
   * {@code OPAQUE}, {@code BITMASK} or {@code TRANSLUCENT}.
   * The {@code transferType} is the type of primitive array used
   * to represent pixel values.
   *
   * @param colorSpace       The {@code ColorSpace} associated
   *                         with this color model.
   * @param bits             The number of significant bits per component.
   *                         May be null, in which case all bits of all
   *                         component samples will be significant.
   *                         Ignored if transferType is one of
   *                         {@code DataBuffer.TYPE_SHORT},
   *                         {@code DataBuffer.TYPE_FLOAT}, or
   *                         {@code DataBuffer.TYPE_DOUBLE},
   *                         in which case all bits of all component
   *                         samples will be significant.
   * @param hasAlpha         If true, this color model supports alpha.
   * @param isAlphaPremultiplied If true, alpha is premultiplied.
   * @param transparency     Specifies what alpha values can be represented
   *                         by this color model.
   * @param transferType     Specifies the type of primitive array used to
   *                         represent pixel values.
   *
   * @throws IllegalArgumentException If the {@code bits} array
   *         argument is not null, its length is less than the number of
   *         color and alpha components, and transferType is one of
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT}, or
   *         {@code DataBuffer.TYPE_INT}.
   * @throws IllegalArgumentException If transferType is not one of
   *         {@code DataBuffer.TYPE_BYTE},
   *         {@code DataBuffer.TYPE_USHORT},
   *         {@code DataBuffer.TYPE_INT},
   *         {@code DataBuffer.TYPE_SHORT},
   *         {@code DataBuffer.TYPE_FLOAT}, or
   *         {@code DataBuffer.TYPE_DOUBLE}.
   *
   * @see ColorSpace
   * @see java.awt.Transparency
   */
  _ComponentColorModel$ColorSpace$intArr$boolean$boolean$int$int(colorSpace: ColorSpace, bits: number[], hasAlpha: boolean, isAlphaPremultiplied: boolean, transparency: number, transferType: number): this {
    this._ColorModel$int$intArr$ColorSpace$boolean$boolean$int$int(ComponentColorModel.bitsHelper(transferType, colorSpace, hasAlpha), ComponentColorModel.bitsArrayHelper(bits, transferType, colorSpace, hasAlpha), colorSpace, hasAlpha, isAlphaPremultiplied, transparency, transferType);
    switch (transferType) {
      case DataBuffer.TYPE_BYTE:
      case DataBuffer.TYPE_USHORT:
      case DataBuffer.TYPE_INT:
        this.signed = false;
        this.needScaleInit = true;
        break;
      case DataBuffer.TYPE_SHORT:
        this.signed = true;
        this.needScaleInit = true;
        break;
      case DataBuffer.TYPE_FLOAT:
      case DataBuffer.TYPE_DOUBLE:
        this.signed = true;
        this.needScaleInit = false;
        this.noUnnorm = true;
        this.nonStdScale = false;
        break;
      default:
        throw new IllegalArgumentException('This constructor is not compatible with transferType ' + transferType);
    }
    this.setupLUTs();
    return this;
  }
  static bitsHelper(transferType: number, colorSpace: ColorSpace, hasAlpha: boolean): number {
    let numBits = DataBuffer.getDataTypeSize(transferType);
    let numComponents = colorSpace.getNumComponents();
    if (hasAlpha) {
      ++numComponents;
    }
    return Math.imul(numBits, numComponents);
  }
  static bitsArrayHelper(origBits: number[], transferType: number, colorSpace: ColorSpace, hasAlpha: boolean): number[] {
    switch (transferType) {
      case DataBuffer.TYPE_BYTE:
      case DataBuffer.TYPE_USHORT:
      case DataBuffer.TYPE_INT:
        if (origBits != null) {
          return origBits;
        }
        break;
      default:
        break;
    }
    let numBits = DataBuffer.getDataTypeSize(transferType);
    let numComponents = colorSpace.getNumComponents();
    if (hasAlpha) {
      ++numComponents;
    }
    let bits = $J.newArray(numComponents, 0);
    for (let i = 0; i < numComponents; i++) {
      bits[i] = numBits;
    }
    return bits;
  }
  setupLUTs(): void {
    if (this.is_sRGB) {
      this.is_sRGB_stdScale = true;
      this.nonStdScale = false;
    } else if (ColorModel.isLinearRGBspace(this.colorSpace)) {
      this.is_LinearRGB_stdScale = true;
      this.nonStdScale = false;
      if (this.transferType === DataBuffer.TYPE_BYTE) {
        this.tosRGB8LUT = ColorModel.getLinearRGB8TosRGB8LUT();
        this.fromsRGB8LUT8 = ColorModel.getsRGB8ToLinearRGB8LUT();
      } else {
        this.tosRGB8LUT = ColorModel.getLinearRGB16TosRGB8LUT();
        this.fromsRGB8LUT16 = ColorModel.getsRGB8ToLinearRGB16LUT();
      }
    } else if ((this.colorSpaceType === 6) && ($J.isa(this.colorSpace, ICC_ColorSpace)) && (this.colorSpace.getMinValue(0) === 0) && (this.colorSpace.getMaxValue(0) === 1)) {
      let ics = this.colorSpace;
      this.is_ICCGray_stdScale = true;
      this.nonStdScale = false;
      this.fromsRGB8LUT16 = ColorModel.getsRGB8ToLinearRGB16LUT();
      if (ColorModel.isLinearGRAYspace(ics)) {
        this.is_LinearGray_stdScale = true;
        if (this.transferType === DataBuffer.TYPE_BYTE) {
          this.tosRGB8LUT = ColorModel.getGray8TosRGB8LUT(ics);
        } else {
          this.tosRGB8LUT = ColorModel.getGray16TosRGB8LUT(ics);
        }
      } else {
        if (this.transferType === DataBuffer.TYPE_BYTE) {
          this.tosRGB8LUT = ColorModel.getGray8TosRGB8LUT(ics);
          this.fromLinearGray16ToOtherGray8LUT = ColorModel.getLinearGray16ToOtherGray8LUT(ics);
        } else {
          this.tosRGB8LUT = ColorModel.getGray16TosRGB8LUT(ics);
          this.fromLinearGray16ToOtherGray16LUT = ColorModel.getLinearGray16ToOtherGray16LUT(ics);
        }
      }
    } else if (this.needScaleInit) {
      this.nonStdScale = false;
      for (let i = 0; i < this.numColorComponents; i++) {
        if ((this.colorSpace.getMinValue(i) !== 0) || (this.colorSpace.getMaxValue(i) !== 1)) {
          this.nonStdScale = true;
          break;
        }
      }
      if (this.nonStdScale) {
        this.min = $J.newArray(this.numColorComponents, 0);
        this.diffMinMax = $J.newArray(this.numColorComponents, 0);
        for (let i = 0; i < this.numColorComponents; i++) {
          this.min[i] = this.colorSpace.getMinValue(i);
          this.diffMinMax[i] = Math.fround(this.colorSpace.getMaxValue(i) - this.min[i]);
        }
      }
    }
  }
  initScale(): void {
    this.needScaleInit = false;
    if (this.nonStdScale || this.signed) {
      this.noUnnorm = true;
    } else {
      this.noUnnorm = false;
    }
    let lowVal: number[];
    let highVal: number[];
    switch (this.transferType) {
      case DataBuffer.TYPE_BYTE:
        {
          let bpixel = $J.newArray(this.numComponents, 0);
          if (this.supportsAlpha) {
            bpixel[this.numColorComponents] = (((((1 << this.nBits[this.numColorComponents]) - 1) | 0)) << 24) >> 24;
          }
          lowVal = this.getNormalizedComponents$Object$floatArr$int(bpixel, null, 0);
          for (let i = 0; i < this.numColorComponents; i++) {
            bpixel[i] = (((((1 << this.nBits[i]) - 1) | 0)) << 24) >> 24;
          }
          highVal = this.getNormalizedComponents$Object$floatArr$int(bpixel, null, 0);
        }
        break;
      case DataBuffer.TYPE_USHORT:
        {
          let uspixel = $J.newArray(this.numComponents, 0);
          if (this.supportsAlpha) {
            uspixel[this.numColorComponents] = (((((1 << this.nBits[this.numColorComponents]) - 1) | 0)) << 16) >> 16;
          }
          lowVal = this.getNormalizedComponents$Object$floatArr$int(uspixel, null, 0);
          for (let i = 0; i < this.numColorComponents; i++) {
            uspixel[i] = (((((1 << this.nBits[i]) - 1) | 0)) << 16) >> 16;
          }
          highVal = this.getNormalizedComponents$Object$floatArr$int(uspixel, null, 0);
        }
        break;
      case DataBuffer.TYPE_INT:
        {
          let ipixel = $J.newArray(this.numComponents, 0);
          if (this.supportsAlpha) {
            ipixel[this.numColorComponents] = (((1 << this.nBits[this.numColorComponents]) - 1) | 0);
          }
          lowVal = this.getNormalizedComponents$Object$floatArr$int(ipixel, null, 0);
          for (let i = 0; i < this.numColorComponents; i++) {
            ipixel[i] = (((1 << this.nBits[i]) - 1) | 0);
          }
          highVal = this.getNormalizedComponents$Object$floatArr$int(ipixel, null, 0);
        }
        break;
      case DataBuffer.TYPE_SHORT:
        {
          let spixel = $J.newArray(this.numComponents, 0);
          if (this.supportsAlpha) {
            spixel[this.numColorComponents] = 32767;
          }
          lowVal = this.getNormalizedComponents$Object$floatArr$int(spixel, null, 0);
          for (let i = 0; i < this.numColorComponents; i++) {
            spixel[i] = 32767;
          }
          highVal = this.getNormalizedComponents$Object$floatArr$int(spixel, null, 0);
        }
        break;
      default:
        lowVal = highVal = null;
        break;
    }
    this.nonStdScale = false;
    for (let i = 0; i < this.numColorComponents; i++) {
      if ((lowVal[i] !== 0) || (highVal[i] !== 1)) {
        this.nonStdScale = true;
        break;
      }
    }
    if (this.nonStdScale) {
      this.noUnnorm = true;
      this.is_sRGB_stdScale = false;
      this.is_LinearRGB_stdScale = false;
      this.is_LinearGray_stdScale = false;
      this.is_ICCGray_stdScale = false;
      this.compOffset = $J.newArray(this.numColorComponents, 0);
      this.compScale = $J.newArray(this.numColorComponents, 0);
      for (let i = 0; i < this.numColorComponents; i++) {
        this.compOffset[i] = lowVal[i];
        this.compScale[i] = Math.fround(1 / (Math.fround(highVal[i] - lowVal[i])));
      }
    }
  }
  /**
   * Returns an array of unnormalized color/alpha components given a pixel
   * in this {@code ColorModel}.  The pixel value is specified by an
   * array of data elements of type {@code transferType} passed in as
   * an object reference.
   * An IllegalArgumentException is thrown if the component values for this
   * {@code ColorModel} are not conveniently representable in the
   * unnormalized form.
   * Color/alpha components are stored in the {@code components} array
   * starting at  {@code offset} (even if the array is allocated by
   * this method).  Since {@code ComponentColorModel} can be
   * subclassed, subclasses inherit the
   * implementation of this method and if they don't override it then
   * this method might throw an exception if they use an unsupported
   * {@code transferType}.
   *
   * @param pixel A pixel value specified by an array of data elements of
   * type {@code transferType}.
   * @param components An integer array in which to store the unnormalized
   * color/alpha components. If the {@code components} array is null,
   * a new array is allocated.
   * @param offset An offset into the {@code components} array.
   *
   * @return The {@code components} array.
   *
   * @throws IllegalArgumentException If this
   * {@code ComponentColorModel} does not support the unnormalized form
   * @throws UnsupportedOperationException in some cases iff the
   * transfer type of this {@code ComponentColorModel}
   * is not one of the following transfer types:
   * {@code DataBuffer.TYPE_BYTE}, {@code DataBuffer.TYPE_USHORT},
   * or {@code DataBuffer.TYPE_INT}.
   * @throws ClassCastException If {@code pixel} is not a primitive
   * array of type {@code transferType}.
   * @throws IllegalArgumentException If the {@code components} array is
   * not null and is not large enough to hold all the color and alpha
   * components (starting at offset), or if {@code pixel} is not large
   * enough to hold a pixel value for this ColorModel.
   */
  getComponents$Object$intArr$int(pixel: any, components: number[], offset: number): number[] {
    let intpixel: number[];
    if (this.needScaleInit) {
      this.initScale();
    }
    if (this.noUnnorm) {
      throw new IllegalArgumentException('This ColorModel does not support the unnormalized form');
    }
    if (Array.isArray(pixel)) {
      intpixel = pixel;
    } else {
      intpixel = DataBuffer.toIntArray(pixel);
      if (intpixel == null) {
        throw new UnsupportedOperationException('This method has not been implemented for transferType ' + this.transferType);
      }
    }
    if (intpixel.length < this.numComponents) {
      throw new IllegalArgumentException('Length of pixel array < number of components in model');
    }
    if (components == null) {
      components = $J.newArray((offset + this.numComponents) | 0, 0);
    } else if (((components.length - offset) | 0) < this.numComponents) {
      throw new IllegalArgumentException('Length of components array < number of components in model');
    }
    $J.system_arraycopy(intpixel, 0, components, offset, this.numComponents);
    return components;
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
   * @throws IllegalArgumentException If this
   * {@code ComponentColorModel} does not support the unnormalized form
   * @throws IllegalArgumentException if the length of
   *          {@code normComponents} minus {@code normOffset}
   *          is less than {@code numComponents}
   */
  getUnnormalizedComponents(normComponents: number[], normOffset: number, components: number[], offset: number): number[] {
    if (this.needScaleInit) {
      this.initScale();
    }
    if (this.noUnnorm) {
      throw new IllegalArgumentException('This ColorModel does not support the unnormalized form');
    }
    return super.getUnnormalizedComponents(normComponents, normOffset, components, offset);
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
   * @param components an array containing unnormalized components
   * @param offset the offset into the {@code components} array at
   * which to start retrieving unnormalized components
   * @param normComponents an array that receives the normalized components
   * @param normOffset the index into {@code normComponents} at
   * which to begin storing normalized components
   * @return an array containing normalized color and alpha
   * components.
   * @throws IllegalArgumentException If this
   * {@code ComponentColorModel} does not support the unnormalized form
   */
  getNormalizedComponents$intArr$int$floatArr$int(components: number[], offset: number, normComponents: number[], normOffset: number): number[] {
    if (this.needScaleInit) {
      this.initScale();
    }
    if (this.noUnnorm) {
      throw new IllegalArgumentException('This ColorModel does not support the unnormalized form');
    }
    return super.getNormalizedComponents$intArr$int$floatArr$int(components, offset, normComponents, normOffset);
  }
  /**
   * Returns a data element array representation of a pixel in this
   * {@code ColorModel}, given an array of unnormalized color/alpha
   * components. This array can then be passed to the {@code setDataElements}
   * method of a {@code WritableRaster} object.
   *
   * @param components An array of unnormalized color/alpha components.
   * @param offset The integer offset into the {@code components} array.
   * @param obj The object in which to store the data element array
   * representation of the pixel. If {@code obj} variable is null,
   * a new array is allocated.  If {@code obj} is not null, it must
   * be a primitive array of type {@code transferType}. An
   * {@code ArrayIndexOutOfBoundsException} is thrown if
   * {@code obj} is not large enough to hold a pixel value
   * for this {@code ColorModel}.  Since
   * {@code ComponentColorModel} can be subclassed, subclasses
   * inherit the implementation of this method and if they don't
   * override it then they throw an exception if they use an
   * unsupported {@code transferType}.
   *
   * @return The data element array representation of a pixel
   * in this {@code ColorModel}.
   *
   * @throws IllegalArgumentException If the components array
   * is not large enough to hold all the color and alpha components
   * (starting at offset).
   * @throws ClassCastException If {@code obj} is not null and is not a
   * primitive  array of type {@code transferType}.
   * @throws ArrayIndexOutOfBoundsException If {@code obj} is not large
   * enough to hold a pixel value for this {@code ColorModel}.
   * @throws IllegalArgumentException If this
   * {@code ComponentColorModel} does not support the unnormalized form
   * @throws UnsupportedOperationException If the transfer type of
   * this {@code ComponentColorModel}
   * is not one of the following transfer types:
   * {@code DataBuffer.TYPE_BYTE}, {@code DataBuffer.TYPE_USHORT},
   * or {@code DataBuffer.TYPE_INT}.
   *
   * @see WritableRaster#setDataElements
   * @see SampleModel#setDataElements
   */
  getDataElements$intArr$int$Object(components: number[], offset: number, obj: any): any {
    if (this.needScaleInit) {
      this.initScale();
    }
    if (this.noUnnorm) {
      throw new IllegalArgumentException('This ColorModel does not support the unnormalized form');
    }
    if (((components.length - offset) | 0) < this.numComponents) {
      throw new IllegalArgumentException('Component array too small (should be ' + this.numComponents);
    }
    switch (this.transferType) {
      case DataBuffer.TYPE_INT:
        {
          let pixel: number[];
          if (obj == null) {
            pixel = $J.newArray(this.numComponents, 0);
          } else {
            pixel = obj;
          }
          $J.system_arraycopy(components, offset, pixel, 0, this.numComponents);
          return pixel;
        }
      case DataBuffer.TYPE_BYTE:
        {
          let pixel: number[];
          if (obj == null) {
            pixel = $J.newArray(this.numComponents, 0);
          } else {
            pixel = obj;
          }
          for (let i = 0; i < this.numComponents; i++) {
            pixel[i] = ((((components[(offset + i) | 0]) & 255)) << 24) >> 24;
          }
          return pixel;
        }
      case DataBuffer.TYPE_USHORT:
        {
          let pixel: number[];
          if (obj == null) {
            pixel = $J.newArray(this.numComponents, 0);
          } else {
            pixel = obj;
          }
          for (let i = 0; i < this.numComponents; i++) {
            pixel[i] = ((((components[(offset + i) | 0]) & 65535)) << 16) >> 16;
          }
          return pixel;
        }
      default:
        throw new UnsupportedOperationException('This method has not been implemented for transferType ' + this.transferType);
    }
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
    let needAlpha = this.supportsAlpha && this.isAlphaPremultiplied_;
    let stdNormComponents: number[];
    if (this.needScaleInit) {
      this.initScale();
    }
    if (this.nonStdScale) {
      stdNormComponents = $J.newArray(this.numComponents, 0);
      for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
        stdNormComponents[c] = Math.fround((Math.fround(normComponents[nc] - this.compOffset[c])) * this.compScale[c]);
        if (stdNormComponents[c] < 0) {
          stdNormComponents[c] = 0;
        }
        if (stdNormComponents[c] > 1) {
          stdNormComponents[c] = 1;
        }
      }
      if (this.supportsAlpha) {
        stdNormComponents[this.numColorComponents] = normComponents[(this.numColorComponents + normOffset) | 0];
      }
      normOffset = 0;
    } else {
      stdNormComponents = normComponents;
    }
    {
      let bpixel: number[], uspixel: number[], ipixel: number[], spixel: number[], fpixel: number[], dpixel: number[];
      switch (this.transferType) {
        case DataBuffer.TYPE_BYTE:
          if (obj == null) {
            bpixel = $J.newArray(this.numComponents, 0);
          } else {
            bpixel = obj;
          }
          if (needAlpha) {
            let alpha = stdNormComponents[(this.numColorComponents + normOffset) | 0];
            for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
              bpixel[c] = (($J.d2i((Math.fround(Math.fround((Math.fround(stdNormComponents[nc] * alpha)) * (Math.fround((((1 << this.nBits[c]) - 1) | 0)))) + 0.5)))) << 24) >> 24;
            }
            bpixel[this.numColorComponents] = (($J.d2i((Math.fround(Math.fround(alpha * (Math.fround((((1 << this.nBits[this.numColorComponents]) - 1) | 0)))) + 0.5)))) << 24) >> 24;
          } else {
            for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
              bpixel[c] = (($J.d2i((Math.fround(Math.fround(stdNormComponents[nc] * (Math.fround((((1 << this.nBits[c]) - 1) | 0)))) + 0.5)))) << 24) >> 24;
            }
          }
          return bpixel;
        case DataBuffer.TYPE_USHORT:
          if (obj == null) {
            uspixel = $J.newArray(this.numComponents, 0);
          } else {
            uspixel = obj;
          }
          if (needAlpha) {
            let alpha = stdNormComponents[(this.numColorComponents + normOffset) | 0];
            for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
              uspixel[c] = (($J.d2i((Math.fround(Math.fround((Math.fround(stdNormComponents[nc] * alpha)) * (Math.fround((((1 << this.nBits[c]) - 1) | 0)))) + 0.5)))) << 16) >> 16;
            }
            uspixel[this.numColorComponents] = (($J.d2i((Math.fround(Math.fround(alpha * (Math.fround((((1 << this.nBits[this.numColorComponents]) - 1) | 0)))) + 0.5)))) << 16) >> 16;
          } else {
            for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
              uspixel[c] = (($J.d2i((Math.fround(Math.fround(stdNormComponents[nc] * (Math.fround((((1 << this.nBits[c]) - 1) | 0)))) + 0.5)))) << 16) >> 16;
            }
          }
          return uspixel;
        case DataBuffer.TYPE_INT:
          if (obj == null) {
            ipixel = $J.newArray(this.numComponents, 0);
          } else {
            ipixel = obj;
          }
          if (needAlpha) {
            let alpha = stdNormComponents[(this.numColorComponents + normOffset) | 0];
            for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
              ipixel[c] = $J.d2i((Math.fround(Math.fround((Math.fround(stdNormComponents[nc] * alpha)) * (Math.fround((((1 << this.nBits[c]) - 1) | 0)))) + 0.5)));
            }
            ipixel[this.numColorComponents] = $J.d2i((Math.fround(Math.fround(alpha * (Math.fround((((1 << this.nBits[this.numColorComponents]) - 1) | 0)))) + 0.5)));
          } else {
            for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
              ipixel[c] = $J.d2i((Math.fround(Math.fround(stdNormComponents[nc] * (Math.fround((((1 << this.nBits[c]) - 1) | 0)))) + 0.5)));
            }
          }
          return ipixel;
        case DataBuffer.TYPE_SHORT:
          if (obj == null) {
            spixel = $J.newArray(this.numComponents, 0);
          } else {
            spixel = obj;
          }
          if (needAlpha) {
            let alpha = stdNormComponents[(this.numColorComponents + normOffset) | 0];
            for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
              spixel[c] = (($J.d2i((Math.fround(Math.fround(Math.fround(stdNormComponents[nc] * alpha) * 32767) + 0.5)))) << 16) >> 16;
            }
            spixel[this.numColorComponents] = (($J.d2i((Math.fround(Math.fround(alpha * 32767) + 0.5)))) << 16) >> 16;
          } else {
            for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
              spixel[c] = (($J.d2i((Math.fround(Math.fround(stdNormComponents[nc] * 32767) + 0.5)))) << 16) >> 16;
            }
          }
          return spixel;
        case DataBuffer.TYPE_FLOAT:
          if (obj == null) {
            fpixel = $J.newArray(this.numComponents, 0);
          } else {
            fpixel = obj;
          }
          if (needAlpha) {
            let alpha = normComponents[(this.numColorComponents + normOffset) | 0];
            for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
              fpixel[c] = Math.fround(normComponents[nc] * alpha);
            }
            fpixel[this.numColorComponents] = alpha;
          } else {
            for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
              fpixel[c] = normComponents[nc];
            }
          }
          return fpixel;
        case DataBuffer.TYPE_DOUBLE:
          if (obj == null) {
            dpixel = $J.newArray(this.numComponents, 0);
          } else {
            dpixel = obj;
          }
          if (needAlpha) {
            let alpha = (normComponents[(this.numColorComponents + normOffset) | 0]);
            for (let c = 0, nc = normOffset; c < this.numColorComponents; c++, nc++) {
              dpixel[c] = normComponents[nc] * alpha;
            }
            dpixel[this.numColorComponents] = alpha;
          } else {
            for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
              dpixel[c] = normComponents[nc];
            }
          }
          return dpixel;
        default:
          throw new UnsupportedOperationException('This method has not been implemented for transferType ' + this.transferType);
      }
    }
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
   * <p>
   * This method must be overridden by a subclass if that subclass
   * is designed to translate pixel sample values to color component values
   * in a non-default way.  The default translations implemented by this
   * class is described in the class comments.  Any subclass implementing
   * a non-default translation must follow the constraints on allowable
   * translations defined there.
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
   * @since 1.4
   */
  getNormalizedComponents$Object$floatArr$int(pixel: any, normComponents: number[], normOffset: number): number[] {
    if (normComponents == null) {
      normComponents = $J.newArray((this.numComponents + normOffset) | 0, 0);
    }
    {
      let bpixel: number[], uspixel: number[], ipixel: number[], spixel: number[], fpixel: number[], dpixel: number[];
      switch (this.transferType) {
        case DataBuffer.TYPE_BYTE:
          bpixel = pixel;
          for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
            normComponents[nc] = Math.fround((Math.fround((bpixel[c] & 255))) / (Math.fround((((1 << this.nBits[c]) - 1) | 0))));
          }
          break;
        case DataBuffer.TYPE_USHORT:
          uspixel = pixel;
          for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
            normComponents[nc] = Math.fround((Math.fround((uspixel[c] & 65535))) / (Math.fround((((1 << this.nBits[c]) - 1) | 0))));
          }
          break;
        case DataBuffer.TYPE_INT:
          ipixel = pixel;
          for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
            normComponents[nc] = Math.fround((Math.fround(ipixel[c])) / (Math.fround((((1 << this.nBits[c]) - 1) | 0))));
          }
          break;
        case DataBuffer.TYPE_SHORT:
          spixel = pixel;
          for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
            normComponents[nc] = Math.fround((Math.fround(spixel[c])) / 32767);
          }
          break;
        case DataBuffer.TYPE_FLOAT:
          fpixel = pixel;
          for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
            normComponents[nc] = fpixel[c];
          }
          break;
        case DataBuffer.TYPE_DOUBLE:
          dpixel = pixel;
          for (let c = 0, nc = normOffset; c < this.numComponents; c++, nc++) {
            normComponents[nc] = Math.fround(dpixel[c]);
          }
          break;
        default:
          throw new UnsupportedOperationException('This method has not been implemented for transferType ' + this.transferType);
      }
    }
    if (this.supportsAlpha && this.isAlphaPremultiplied_) {
      let alpha = normComponents[(this.numColorComponents + normOffset) | 0];
      if (alpha !== 0) {
        let invAlpha = Math.fround(1 / alpha);
        for (let c = normOffset; c < ((this.numColorComponents + normOffset) | 0); c++) {
          normComponents[c] = Math.fround(normComponents[c] * invAlpha);
        }
      }
    }
    if (this.min != null) {
      for (let c = 0; c < this.numColorComponents; c++) {
        (normComponents[(c + normOffset) | 0]) = Math.fround(this.min[c] + Math.fround(this.diffMinMax[c] * (normComponents[(c + normOffset) | 0])));
      }
    }
    return normComponents;
  }
  /**
   * Creates a {@code WritableRaster} with the specified width and height,
   * that  has a data layout ({@code SampleModel}) compatible with
   * this {@code ColorModel}.
   *
   * @param w The width of the {@code WritableRaster} you want to create.
   * @param h The height of the {@code WritableRaster} you want to create.
   *
   * @return A {@code WritableRaster} that is compatible with
   * this {@code ColorModel}.
   * @see WritableRaster
   * @see SampleModel
   */
  createCompatibleWritableRaster(w: number, h: number): WritableRaster {
    let dataSize = Math.imul(Math.imul(w, h), this.numComponents);
    let raster = null;
    {
      let sm: SampleModel, db: DataBuffer;
      switch (this.transferType) {
        case DataBuffer.TYPE_BYTE:
        case DataBuffer.TYPE_USHORT:
          raster = Raster.createInterleavedRaster$int$int$int$int$Point(this.transferType, w, h, this.numComponents, null);
          break;
        default:
          sm = this.createCompatibleSampleModel(w, h);
          db = sm.createDataBuffer();
          raster = Raster.createWritableRaster$SampleModel$DataBuffer$Point(sm, db, null);
      }
    }
    return raster;
  }
  /**
   * Creates a {@code SampleModel} with the specified width and height,
   * that  has a data layout compatible with this {@code ColorModel}.
   *
   * @param w The width of the {@code SampleModel} you want to create.
   * @param h The height of the {@code SampleModel} you want to create.
   *
   * @return A {@code SampleModel} that is compatible with this
   * {@code ColorModel}.
   *
   * @see SampleModel
   */
  createCompatibleSampleModel(w: number, h: number): SampleModel {
    let bandOffsets = $J.newArray(this.numComponents, 0);
    for (let i = 0; i < this.numComponents; i++) {
      bandOffsets[i] = i;
    }
    switch (this.transferType) {
      case DataBuffer.TYPE_BYTE:
      case DataBuffer.TYPE_USHORT:
        return new PixelInterleavedSampleModel()._PixelInterleavedSampleModel(this.transferType, w, h, this.numComponents, Math.imul(w, this.numComponents), bandOffsets);
      default:
        return new ComponentSampleModel()._ComponentSampleModel$int$int$int$int$int$intArr(this.transferType, w, h, this.numComponents, Math.imul(w, this.numComponents), bandOffsets);
    }
  }
  /**
   * Tests if the specified {@code Object} is an instance
   * of {@code ComponentColorModel} and equals this
   * {@code ComponentColorModel}.
   * @param obj the {@code Object} to test for equality
   * @return {@code true} if the specified {@code Object}
   * is an instance of {@code ComponentColorModel} and equals this
   * {@code ComponentColorModel}; {@code false} otherwise.
   */
  equals(obj: any): boolean {
    if (!(obj instanceof ComponentColorModel)) {
      return false;
    }
    let cm = obj;
    if (this.supportsAlpha !== cm.hasAlpha() || this.isAlphaPremultiplied_ !== cm.isAlphaPremultiplied() || this.pixel_bits !== cm.getPixelSize() || this.transparency !== cm.getTransparency() || this.numComponents !== cm.getNumComponents() || (!($J.equals(this.colorSpace, cm.colorSpace))) || this.transferType !== cm.transferType) {
      return false;
    }
    if (!(Arrays.equals(this.nBits, cm.getComponentSize$()))) {
      return false;
    }
    return true;
  }
  /**
   * Returns the hash code for this ComponentColorModel.
   *
   * @return    a hash code for this ComponentColorModel.
   */
  hashCode(): number {
    let result = this.hashCode_;
    if (result === 0) {
      result = 7;
      result = (Math.imul(89, result) + this.pixel_bits) | 0;
      result = (Math.imul(89, result) + Arrays.hashCode(this.nBits)) | 0;
      result = (Math.imul(89, result) + this.transparency) | 0;
      result = (Math.imul(89, result) + (this.supportsAlpha ? 1 : 0)) | 0;
      result = (Math.imul(89, result) + (this.isAlphaPremultiplied_ ? 1 : 0)) | 0;
      result = (Math.imul(89, result) + this.numComponents) | 0;
      result = (Math.imul(89, result) + $J.hashCode(this.colorSpace)) | 0;
      result = (Math.imul(89, result) + this.transferType) | 0;
      this.hashCode_ = result;
    }
    return result;
  }
}

$J.define(ComponentColorModel, 'java.awt.image.ComponentColorModel', { kind: 'class', sup: 'java.awt.image.ColorModel', ctors: { 'java.awt.color.ColorSpace,boolean,boolean,int,int': '_ComponentColorModel$ColorSpace$boolean$boolean$int$int', 'java.awt.color.ColorSpace,int[],boolean,boolean,int,int': '_ComponentColorModel$ColorSpace$intArr$boolean$boolean$int$int' }, meths: { 'getNormalizedComponents(java.lang.Object,float[],int)': 'getNormalizedComponents$Object$floatArr$int', 'getDataElements(float[],int,java.lang.Object)': 'getDataElements$floatArr$int$Object', 'getDataElement(float[],int)': 'getDataElement$floatArr$int', 'getDataElements(int[],int,java.lang.Object)': 'getDataElements$intArr$int$Object', 'getDataElement(int[],int)': 'getDataElement$intArr$int', 'getNormalizedComponents(int[],int,float[],int)': 'getNormalizedComponents$intArr$int$floatArr$int', 'getComponents(java.lang.Object,int[],int)': 'getComponents$Object$intArr$int', 'getComponents(int,int[],int)': 'getComponents$int$intArr$int', 'getDataElements(int,java.lang.Object)': 'getDataElements$int$Object', 'getRGB(java.lang.Object)': 'getRGB$Object', 'getAlpha(java.lang.Object)': 'getAlpha$Object', 'getBlue(java.lang.Object)': 'getBlue$Object', 'getGreen(java.lang.Object)': 'getGreen$Object', 'getRed(java.lang.Object)': 'getRed$Object', 'getRGBComponent(java.lang.Object,int)': 'getRGBComponent$Object$int$ComponentColorModel', 'getRGB(int)': 'getRGB$int', 'getAlpha(int)': 'getAlpha$int', 'getBlue(int)': 'getBlue$int', 'getGreen(int)': 'getGreen$int', 'getRed(int)': 'getRed$int', 'getRGBComponent(int,int)': 'getRGBComponent$int$int$ComponentColorModel' } });
$J.module(() => {
  ComponentSampleModel = $J.load('java.awt.image.ComponentSampleModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  PixelInterleavedSampleModel = $J.load('java.awt.image.PixelInterleavedSampleModel');
  Raster = $J.load('java.awt.image.Raster');
});
