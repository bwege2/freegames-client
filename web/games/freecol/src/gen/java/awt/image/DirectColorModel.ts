// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/DirectColorModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ClassCastException, ColorSpace, IllegalArgumentException, UnsupportedOperationException } from '../../../../jre/index.ts';
import { PackedColorModel } from './PackedColorModel.ts';

let Transparency, ColorModel, DataBuffer, Raster;

/**
 * The {@code DirectColorModel} class is a {@code ColorModel}
 * class that works with pixel values that represent RGB
 * color and alpha information as separate samples and that pack all
 * samples for a single pixel into a single int, short, or byte quantity.
 * This class can be used only with ColorSpaces of type ColorSpace.TYPE_RGB.
 * In addition, for each component of the ColorSpace, the minimum
 * normalized component value obtained via the {@code getMinValue()}
 * method of ColorSpace must be 0.0, and the maximum value obtained via
 * the {@code getMaxValue()} method must be 1.0 (these min/max
 * values are typical for RGB spaces).
 * There must be three color samples in the pixel values and there can
 * be a single alpha sample.  For those methods that use a primitive array
 * pixel representation of type {@code transferType}, the array
 * length is always one.  The transfer
 * types supported are DataBuffer.TYPE_BYTE,
 * DataBuffer.TYPE_USHORT, and DataBuffer.TYPE_INT.
 * Color and alpha samples are stored in the single
 * element of the array in bits indicated by bit masks.  Each bit mask
 * must be contiguous and masks must not overlap.  The same masks apply to
 * the single int pixel representation used by other methods.  The
 * correspondence of masks and color/alpha samples is as follows:
 * <ul>
 * <li> Masks are identified by indices running from 0 through 2
 * if no alpha is present, or 3 if an alpha is present.
 * <li> The first three indices refer to color samples;
 * index 0 corresponds to red, index 1 to green, and index 2 to blue.
 * <li> Index 3 corresponds to the alpha sample, if present.
 * </ul>
 * <p>
 * The translation from pixel values to color/alpha components for
 * display or processing purposes is a one-to-one correspondence of
 * samples to components.  A {@code DirectColorModel} is
 * typically used with image data which uses masks to define packed
 * samples.  For example, a {@code DirectColorModel} can be used in
 * conjunction with a {@code SinglePixelPackedSampleModel} to
 * construct a {@link BufferedImage}.  Normally the masks used by the
 * {@link SampleModel} and the {@code ColorModel} would be the
 * same.  However, if they are different, the color interpretation
 * of pixel data will be done according to the masks of the
 * {@code ColorModel}.
 * <p>
 * A single int pixel representation is valid for all objects of this
 * class, since it is always possible to represent pixel values used with
 * this class in a single int.  Therefore, methods which use this
 * representation will not throw an {@code IllegalArgumentException}
 * due to an invalid pixel value.
 * <p>
 * This color model is similar to an X11 TrueColor visual.
 * The default RGB ColorModel specified by the
 * {@link ColorModel#getRGBdefault() getRGBdefault} method is a
 * {@code DirectColorModel} with the following parameters:
 * <pre>
 * Number of bits:        32
 * Red mask:              0x00ff0000
 * Green mask:            0x0000ff00
 * Blue mask:             0x000000ff
 * Alpha mask:            0xff000000
 * Color space:           sRGB
 * isAlphaPremultiplied:  False
 * Transparency:          Transparency.TRANSLUCENT
 * transferType:          DataBuffer.TYPE_INT
 * </pre>
 * <p>
 * Many of the methods in this class are final. This is because the
 * underlying native graphics code makes assumptions about the layout
 * and operation of this class and those assumptions are reflected in
 * the implementations of the methods here that are marked final.  You
 * can subclass this class for other reasons, but you cannot override
 * or modify the behavior of those methods.
 *
 * @see ColorModel
 * @see ColorSpace
 * @see SinglePixelPackedSampleModel
 * @see BufferedImage
 * @see ColorModel#getRGBdefault
 */
export class DirectColorModel extends PackedColorModel {
  red_mask: number = 0;
  green_mask: number = 0;
  blue_mask: number = 0;
  alpha_mask: number = 0;
  red_offset: number = 0;
  green_offset: number = 0;
  blue_offset: number = 0;
  alpha_offset: number = 0;
  red_scale: number = 0;
  green_scale: number = 0;
  blue_scale: number = 0;
  alpha_scale: number = 0;
  is_LinearRGB: boolean = false;
  lRGBprecision: number = 0;
  tosRGB8LUT: number[] = null;
  fromsRGB8LUT8: number[] = null;
  fromsRGB8LUT16: number[] = null;
  /**
   * Constructs a {@code DirectColorModel} from the specified masks
   * that indicate which bits in an {@code int} pixel representation
   * contain the red, green and blue color samples.  As pixel values do not
   * contain alpha information, all pixels are treated as opaque, which
   * means that alpha&nbsp;=&nbsp;1.0.  All of the bits
   * in each mask must be contiguous and fit in the specified number
   * of least significant bits of an {@code int} pixel representation.
   *  The {@code ColorSpace} is the default sRGB space. The
   * transparency value is Transparency.OPAQUE.  The transfer type
   * is the smallest of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
   * or DataBuffer.TYPE_INT that can hold a single pixel.
   * @param bits the number of bits in the pixel values; for example,
   *         the sum of the number of bits in the masks.
   * @param rmask specifies a mask indicating which bits in an
   *         integer pixel contain the red component
   * @param gmask specifies a mask indicating which bits in an
   *         integer pixel contain the green component
   * @param bmask specifies a mask indicating which bits in an
   *         integer pixel contain the blue component
   */
  _DirectColorModel$int$int$int$int(bits: number, rmask: number, gmask: number, bmask: number): this {
    this._DirectColorModel$int$int$int$int$int(bits, rmask, gmask, bmask, 0);
    return this;
  }
  /**
   * Constructs a {@code DirectColorModel} from the specified masks
   * that indicate which bits in an {@code int} pixel representation
   * contain the red, green and blue color samples and the alpha sample,
   * if present.  If {@code amask} is 0, pixel values do not contain
   * alpha information and all pixels are treated as opaque, which means
   * that alpha&nbsp;=&nbsp;1.0.  All of the bits in each mask must
   * be contiguous and fit in the specified number of least significant bits
   * of an {@code int} pixel representation.  Alpha, if present, is not
   * premultiplied.  The {@code ColorSpace} is the default sRGB space.
   * The transparency value is Transparency.OPAQUE if no alpha is
   * present, or Transparency.TRANSLUCENT otherwise.  The transfer type
   * is the smallest of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT,
   * or DataBuffer.TYPE_INT that can hold a single pixel.
   * @param bits the number of bits in the pixel values; for example,
   *         the sum of the number of bits in the masks.
   * @param rmask specifies a mask indicating which bits in an
   *         integer pixel contain the red component
   * @param gmask specifies a mask indicating which bits in an
   *         integer pixel contain the green component
   * @param bmask specifies a mask indicating which bits in an
   *         integer pixel contain the blue component
   * @param amask specifies a mask indicating which bits in an
   *         integer pixel contain the alpha component
   */
  _DirectColorModel$int$int$int$int$int(bits: number, rmask: number, gmask: number, bmask: number, amask: number): this {
    this._PackedColorModel$ColorSpace$int$int$int$int$int$boolean$int$int(ColorSpace.getInstance(1000), bits, rmask, gmask, bmask, amask, false, amask === 0 ? Transparency.OPAQUE : Transparency.TRANSLUCENT, ColorModel.getDefaultTransferType(bits));
    this.setFields();
    return this;
  }
  /**
   * Constructs a {@code DirectColorModel} from the specified
   * parameters.  Color components are in the specified
   * {@code ColorSpace}, which must be of type ColorSpace.TYPE_RGB
   * and have minimum normalized component values which are all 0.0
   * and maximum values which are all 1.0.
   * The masks specify which bits in an {@code int} pixel
   * representation contain the red, green and blue color samples and
   * the alpha sample, if present.  If {@code amask} is 0, pixel
   * values do not contain alpha information and all pixels are treated
   * as opaque, which means that alpha&nbsp;=&nbsp;1.0.  All of the
   * bits in each mask must be contiguous and fit in the specified number
   * of least significant bits of an {@code int} pixel
   * representation.  If there is alpha, the {@code boolean}
   * {@code isAlphaPremultiplied} specifies how to interpret
   * color and alpha samples in pixel values.  If the {@code boolean}
   * is {@code true}, color samples are assumed to have been
   * multiplied by the alpha sample.  The transparency value is
   * Transparency.OPAQUE, if no alpha is present, or
   * Transparency.TRANSLUCENT otherwise.  The transfer type
   * is the type of primitive array used to represent pixel values and
   * must be one of DataBuffer.TYPE_BYTE, DataBuffer.TYPE_USHORT, or
   * DataBuffer.TYPE_INT.
   * @param space the specified {@code ColorSpace}
   * @param bits the number of bits in the pixel values; for example,
   *         the sum of the number of bits in the masks.
   * @param rmask specifies a mask indicating which bits in an
   *         integer pixel contain the red component
   * @param gmask specifies a mask indicating which bits in an
   *         integer pixel contain the green component
   * @param bmask specifies a mask indicating which bits in an
   *         integer pixel contain the blue component
   * @param amask specifies a mask indicating which bits in an
   *         integer pixel contain the alpha component
   * @param isAlphaPremultiplied {@code true} if color samples are
   *        premultiplied by the alpha sample; {@code false} otherwise
   * @param transferType the type of array used to represent pixel values
   * @throws IllegalArgumentException if {@code space} is not a
   *         TYPE_RGB space or if the min/max normalized component
   *         values are not 0.0/1.0.
   */
  _DirectColorModel$ColorSpace$int$int$int$int$int$boolean$int(space: ColorSpace, bits: number, rmask: number, gmask: number, bmask: number, amask: number, isAlphaPremultiplied: boolean, transferType: number): this {
    this._PackedColorModel$ColorSpace$int$int$int$int$int$boolean$int$int(space, bits, rmask, gmask, bmask, amask, isAlphaPremultiplied, amask === 0 ? Transparency.OPAQUE : Transparency.TRANSLUCENT, transferType);
    if (ColorModel.isLinearRGBspace(this.colorSpace)) {
      this.is_LinearRGB = true;
      if (this.maxBits <= 8) {
        this.lRGBprecision = 8;
        this.tosRGB8LUT = ColorModel.getLinearRGB8TosRGB8LUT();
        this.fromsRGB8LUT8 = ColorModel.getsRGB8ToLinearRGB8LUT();
      } else {
        this.lRGBprecision = 16;
        this.tosRGB8LUT = ColorModel.getLinearRGB16TosRGB8LUT();
        this.fromsRGB8LUT16 = ColorModel.getsRGB8ToLinearRGB16LUT();
      }
    } else if (!this.is_sRGB) {
      for (let i = 0; i < 3; i++) {
        if ((space.getMinValue(i) !== 0) || (space.getMaxValue(i) !== 1)) {
          throw new IllegalArgumentException('Illegal min/max RGB component value');
        }
      }
    }
    this.setFields();
    return this;
  }
  /**
   * Returns the mask indicating which bits in an {@code int} pixel
   * representation contain the red color component.
   * @return the mask, which indicates which bits of the {@code int}
   *         pixel representation contain the red color sample.
   */
  getRedMask(): number {
    return this.maskArray[0];
  }
  /**
   * Returns the mask indicating which bits in an {@code int} pixel
   * representation contain the green color component.
   * @return the mask, which indicates which bits of the {@code int}
   *         pixel representation contain the green color sample.
   */
  getGreenMask(): number {
    return this.maskArray[1];
  }
  /**
   * Returns the mask indicating which bits in an {@code int} pixel
   * representation contain the blue color component.
   * @return the mask, which indicates which bits of the {@code int}
   *         pixel representation contain the blue color sample.
   */
  getBlueMask(): number {
    return this.maskArray[2];
  }
  /**
   * Returns the mask indicating which bits in an {@code int} pixel
   * representation contain the alpha component.
   * @return the mask, which indicates which bits of the {@code int}
   *         pixel representation contain the alpha sample.
   */
  getAlphaMask(): number {
    if (this.supportsAlpha) {
      return this.maskArray[3];
    } else {
      return 0;
    }
  }
  /**
   * Returns an array of unnormalized color/alpha components given a pixel
   * in this {@code ColorModel}.  The pixel value is specified as an
   * {@code int}.  If the {@code components} array is
   * {@code null}, a new array is allocated.  The
   * {@code components} array is returned.  Color/alpha components are
   * stored in the {@code components} array starting at
   * {@code offset}, even if the array is allocated by this method.
   * An {@code ArrayIndexOutOfBoundsException} is thrown if the
   * {@code components} array is not {@code null} and is not large
   * enough to hold all the color and alpha components, starting at
   * {@code offset}.
   * @param pixel the specified pixel
   * @param components the array to receive the color and alpha
   * components of the specified pixel
   * @param offset the offset into the {@code components} array at
   * which to start storing the color and alpha components
   * @return an array containing the color and alpha components of the
   * specified pixel starting at the specified offset.
   */
  getComponents$int$intArr$int(pixel: number, components: number[], offset: number): number[] {
    if (components == null) {
      components = $J.newArray((offset + this.numComponents) | 0, 0);
    }
    for (let i = 0; i < this.numComponents; i++) {
      (components[(offset + i) | 0]) = (pixel & this.maskArray[i]) >>> this.maskOffsets[i];
    }
    return components;
  }
  /**
   * Returns an array of unnormalized color/alpha components given a pixel
   * in this {@code ColorModel}.  The pixel value is specified by an
   * array of data elements of type {@code transferType} passed in as
   * an object reference.  If {@code pixel} is not a primitive array
   * of type {@code transferType}, a {@code ClassCastException}
   * is thrown.  An {@code ArrayIndexOutOfBoundsException} is
   * thrown if {@code pixel} is not large enough to hold a
   * pixel value for this {@code ColorModel}.  If the
   * {@code components} array is {@code null}, a new
   * array is allocated.  The {@code components} array is returned.
   * Color/alpha components are stored in the {@code components} array
   * starting at {@code offset}, even if the array is allocated by
   * this method.  An {@code ArrayIndexOutOfBoundsException}
   * is thrown if the {@code components} array is not
   * {@code null} and is not large enough to hold all the color and
   * alpha components, starting at {@code offset}.
   * Since {@code DirectColorModel} can be subclassed, subclasses
   * inherit the implementation of this method and if they don't
   * override it then they throw an exception if they use an unsupported
   * {@code transferType}.
   * @param pixel the specified pixel
   * @param components the array to receive the color and alpha
   *        components of the specified pixel
   * @param offset the offset into the {@code components} array at
   *        which to start storing the color and alpha components
   * @return an array containing the color and alpha components of the
   * specified pixel starting at the specified offset.
   * @throws ClassCastException if {@code pixel}
   *  is not a primitive array of type {@code transferType}
   * @throws ArrayIndexOutOfBoundsException if
   *  {@code pixel} is not large enough to hold a pixel value
   *  for this {@code ColorModel}, or if {@code components}
   *  is not {@code null} and is not large enough to hold all the
   *  color and alpha components, starting at {@code offset}
   * @throws UnsupportedOperationException if this
   *            {@code transferType} is not supported by this
   *            color model
   */
  getComponents$Object$intArr$int(pixel: any, components: number[], offset: number): number[] {
    let intpixel = 0;
    {
      let bdata: number[], sdata: number[], idata: number[];
      switch (this.transferType) {
        case DataBuffer.TYPE_BYTE:
          bdata = pixel;
          intpixel = bdata[0] & 255;
          break;
        case DataBuffer.TYPE_USHORT:
          sdata = pixel;
          intpixel = sdata[0] & 65535;
          break;
        case DataBuffer.TYPE_INT:
          idata = pixel;
          intpixel = idata[0];
          break;
        default:
          throw new UnsupportedOperationException('This method has not been implemented for transferType ' + this.transferType);
      }
    }
    return this.getComponents$int$intArr$int(intpixel, components, offset);
  }
  /**
   * Creates a {@code WritableRaster} with the specified width and
   * height that has a data layout ({@code SampleModel}) compatible
   * with this {@code ColorModel}.
   * @param w the width to apply to the new {@code WritableRaster}
   * @param h the height to apply to the new {@code WritableRaster}
   * @return a {@code WritableRaster} object with the specified
   * width and height.
   * @throws IllegalArgumentException if {@code w} or {@code h}
   *         is less than or equal to zero
   * @see WritableRaster
   * @see SampleModel
   */
  createCompatibleWritableRaster(w: number, h: number): WritableRaster {
    if ((w <= 0) || (h <= 0)) {
      throw new IllegalArgumentException('Width (' + w + ') and height (' + h + ') cannot be <= 0');
    }
    let bandmasks: number[];
    if (this.supportsAlpha) {
      bandmasks = $J.newArray(4, 0);
      bandmasks[3] = this.alpha_mask;
    } else {
      bandmasks = $J.newArray(3, 0);
    }
    bandmasks[0] = this.red_mask;
    bandmasks[1] = this.green_mask;
    bandmasks[2] = this.blue_mask;
    if (this.pixel_bits > 16) {
      return Raster.createPackedRaster$int$int$int$intArr$Point(DataBuffer.TYPE_INT, w, h, bandmasks, null);
    } else if (this.pixel_bits > 8) {
      return Raster.createPackedRaster$int$int$int$intArr$Point(DataBuffer.TYPE_USHORT, w, h, bandmasks, null);
    } else {
      return Raster.createPackedRaster$int$int$int$intArr$Point(DataBuffer.TYPE_BYTE, w, h, bandmasks, null);
    }
  }
  /**
   * Returns a data element array representation of a pixel in this
   * {@code ColorModel}, given an array of unnormalized color/alpha
   * components.
   * This array can then be passed to the {@code setDataElements}
   * method of a {@code WritableRaster} object.
   * An {@code ArrayIndexOutOfBoundsException} is thrown if the
   * {@code components} array
   * is not large enough to hold all the color and alpha components,
   * starting at offset.  If the {@code obj} variable is
   * {@code null}, a new array is allocated.  If {@code obj} is
   * not {@code null}, it must be a primitive array
   * of type {@code transferType}; otherwise, a
   * {@code ClassCastException} is thrown.
   * An {@code ArrayIndexOutOfBoundsException} is thrown if
   * {@code obj} is not large enough to hold a pixel value for this
   * {@code ColorModel}.
   * Since {@code DirectColorModel} can be subclassed, subclasses
   * inherit the implementation of this method and if they don't
   * override it then they throw an exception if they use an unsupported
   * {@code transferType}.
   * @param components an array of unnormalized color and alpha
   * components
   * @param offset the index into {@code components} at which to
   * begin retrieving color and alpha components
   * @param obj the {@code Object} representing an array of color
   * and alpha components
   * @return an {@code Object} representing an array of color and
   * alpha components.
   * @throws ClassCastException if {@code obj}
   *  is not a primitive array of type {@code transferType}
   * @throws ArrayIndexOutOfBoundsException if
   *  {@code obj} is not large enough to hold a pixel value
   *  for this {@code ColorModel} or the {@code components}
   *  array is not large enough to hold all of the color and alpha
   *  components starting at {@code offset}
   * @throws UnsupportedOperationException if this
   *            {@code transferType} is not supported by this
   *            color model
   * @see WritableRaster#setDataElements
   * @see SampleModel#setDataElements
   */
  getDataElements$intArr$int$Object(components: number[], offset: number, obj: any): any {
    let pixel = 0;
    for (let i = 0; i < this.numComponents; i++) {
      pixel |= (((components[(offset + i) | 0]) << this.maskOffsets[i]) & this.maskArray[i]);
    }
    switch (this.transferType) {
      case DataBuffer.TYPE_BYTE:
        if (Array.isArray(obj)) {
          let bdata = obj;
          bdata[0] = (((pixel & 255)) << 24) >> 24;
          return bdata;
        } else {
          let bdata = [(((pixel & 255)) << 24) >> 24];
          return bdata;
        }
      case DataBuffer.TYPE_USHORT:
        if (Array.isArray(obj)) {
          let sdata = obj;
          sdata[0] = (((pixel & 65535)) << 16) >> 16;
          return sdata;
        } else {
          let sdata = [(((pixel & 65535)) << 16) >> 16];
          return sdata;
        }
      case DataBuffer.TYPE_INT:
        if (Array.isArray(obj)) {
          let idata = obj;
          idata[0] = pixel;
          return idata;
        } else {
          let idata = [pixel];
          return idata;
        }
      default:
        throw new ClassCastException('This method has not been implemented for transferType ' + this.transferType);
    }
  }
  setFields(): void {
    this.red_mask = this.maskArray[0];
    this.red_offset = this.maskOffsets[0];
    this.green_mask = this.maskArray[1];
    this.green_offset = this.maskOffsets[1];
    this.blue_mask = this.maskArray[2];
    this.blue_offset = this.maskOffsets[2];
    if (this.nBits[0] < 8) {
      this.red_scale = ((1 << this.nBits[0]) - 1) | 0;
    }
    if (this.nBits[1] < 8) {
      this.green_scale = ((1 << this.nBits[1]) - 1) | 0;
    }
    if (this.nBits[2] < 8) {
      this.blue_scale = ((1 << this.nBits[2]) - 1) | 0;
    }
    if (this.supportsAlpha) {
      this.alpha_mask = this.maskArray[3];
      this.alpha_offset = this.maskOffsets[3];
      if (this.nBits[3] < 8) {
        this.alpha_scale = ((1 << this.nBits[3]) - 1) | 0;
      }
    }
  }
  /**
   * Returns a {@code String} that represents this
   * {@code DirectColorModel}.
   * @return a {@code String} representing this
   * {@code DirectColorModel}.
   */
  toString(): string {
    return 'DirectColorModel: rmask=' + $J.Integer_toHexString(this.red_mask) + ' gmask=' + $J.Integer_toHexString(this.green_mask) + ' bmask=' + $J.Integer_toHexString(this.blue_mask) + ' amask=' + $J.Integer_toHexString(this.alpha_mask);
  }
}

$J.define(DirectColorModel, 'java.awt.image.DirectColorModel', { kind: 'class', sup: 'java.awt.image.PackedColorModel', ctors: { 'java.awt.color.ColorSpace,int,int,int,int,int,boolean,int': '_DirectColorModel$ColorSpace$int$int$int$int$int$boolean$int', 'int,int,int,int,int': '_DirectColorModel$int$int$int$int$int', 'int,int,int,int': '_DirectColorModel$int$int$int$int' }, meths: { 'getDataElements(int[],int,java.lang.Object)': 'getDataElements$intArr$int$Object', 'getDataElement(int[],int)': 'getDataElement$intArr$int', 'getComponents(java.lang.Object,int[],int)': 'getComponents$Object$intArr$int', 'getComponents(int,int[],int)': 'getComponents$int$intArr$int', 'getDataElements(int,java.lang.Object)': 'getDataElements$int$Object', 'getRGB(java.lang.Object)': 'getRGB$Object', 'getAlpha(java.lang.Object)': 'getAlpha$Object', 'getBlue(java.lang.Object)': 'getBlue$Object', 'getGreen(java.lang.Object)': 'getGreen$Object', 'getRed(java.lang.Object)': 'getRed$Object', 'getRGB(int)': 'getRGB$int', 'getAlpha(int)': 'getAlpha$int', 'getBlue(int)': 'getBlue$int', 'getGreen(int)': 'getGreen$int', 'getRed(int)': 'getRed$int' } });
$J.module(() => {
  Transparency = $J.load('java.awt.Transparency');
  ColorModel = $J.load('java.awt.image.ColorModel');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  Raster = $J.load('java.awt.image.Raster');
});
