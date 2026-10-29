// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/IndexColorModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays, BufferedImage, ColorSpace, IllegalArgumentException, UnsupportedOperationException } from '../../../../jre/index.ts';
import { ColorModel } from './ColorModel.ts';

let Transparency, DataBuffer, DirectColorModel, Raster;

/**
 * The {@code IndexColorModel} class is a {@code ColorModel}
 * class that works with pixel values consisting of a
 * single sample that is an index into a fixed colormap in the default
 * sRGB color space.  The colormap specifies red, green, blue, and
 * optional alpha components corresponding to each index.  All components
 * are represented in the colormap as 8-bit unsigned integral values.
 * Some constructors allow the caller to specify "holes" in the colormap
 * by indicating which colormap entries are valid and which represent
 * unusable colors via the bits set in a {@code BigInteger} object.
 * This color model is similar to an X11 PseudoColor visual.
 * <p>
 * Some constructors provide a means to specify an alpha component
 * for each pixel in the colormap, while others either provide no
 * such means or, in some cases, a flag to indicate whether the
 * colormap data contains alpha values.  If no alpha is supplied to
 * the constructor, an opaque alpha component (alpha = 1.0) is
 * assumed for each entry.
 * An optional transparent pixel value can be supplied that indicates a
 * pixel to be made completely transparent, regardless of any alpha
 * component supplied or assumed for that pixel value.
 * Note that the color components in the colormap of an
 * {@code IndexColorModel} objects are never pre-multiplied with
 * the alpha components.
 * <p>
 * <a id="transparency">
 * The transparency of an {@code IndexColorModel} object is
 * determined by examining the alpha components of the colors in the
 * colormap and choosing the most specific value after considering
 * the optional alpha values and any transparent index specified.
 * The transparency value is {@code Transparency.OPAQUE}
 * only if all valid colors in
 * the colormap are opaque and there is no valid transparent pixel.
 * If all valid colors
 * in the colormap are either completely opaque (alpha = 1.0) or
 * completely transparent (alpha = 0.0), which typically occurs when
 * a valid transparent pixel is specified,
 * the value is {@code Transparency.BITMASK}.
 * Otherwise, the value is {@code Transparency.TRANSLUCENT}, indicating
 * that some valid color has an alpha component that is
 * neither completely transparent nor completely opaque
 * (0.0 &lt; alpha &lt; 1.0).
 * </a>
 *
 * <p>
 * If an {@code IndexColorModel} object has
 * a transparency value of {@code Transparency.OPAQUE},
 * then the {@code hasAlpha}
 * and {@code getNumComponents} methods
 * (both inherited from {@code ColorModel})
 * return false and 3, respectively.
 * For any other transparency value,
 * {@code hasAlpha} returns true
 * and {@code getNumComponents} returns 4.
 *
 * <p>
 * <a id="index_values">
 * The values used to index into the colormap are taken from the least
 * significant <em>n</em> bits of pixel representations where
 * <em>n</em> is based on the pixel size specified in the constructor.
 * For pixel sizes smaller than 8 bits, <em>n</em> is rounded up to a
 * power of two (3 becomes 4 and 5,6,7 become 8).
 * For pixel sizes between 8 and 16 bits, <em>n</em> is equal to the
 * pixel size.
 * Pixel sizes larger than 16 bits are not supported by this class.
 * Higher order bits beyond <em>n</em> are ignored in pixel representations.
 * Index values greater than or equal to the map size, but less than
 * 2<sup><em>n</em></sup>, are undefined and return 0 for all color and
 * alpha components.
 * </a>
 * <p>
 * For those methods that use a primitive array pixel representation of
 * type {@code transferType}, the array length is always one.
 * The transfer types supported are {@code DataBuffer.TYPE_BYTE} and
 * {@code DataBuffer.TYPE_USHORT}.  A single int pixel
 * representation is valid for all objects of this class, since it is
 * always possible to represent pixel values used with this class in a
 * single int.  Therefore, methods that use this representation do
 * not throw an {@code IllegalArgumentException} due to an invalid
 * pixel value.
 * <p>
 * Many of the methods in this class are final.  The reason for
 * this is that the underlying native graphics code makes assumptions
 * about the layout and operation of this class and those assumptions
 * are reflected in the implementations of the methods here that are
 * marked final.  You can subclass this class for other reasons, but
 * you cannot override or modify the behaviour of those methods.
 *
 * @see ColorModel
 * @see ColorSpace
 * @see DataBuffer
 */
export class IndexColorModel extends ColorModel {
  rgb: number[] = null;
  map_size: number = 0;
  pixel_mask: number = 0;
  transparent_index: number = 0;
  allgrayopaque: boolean = false;
  validBits: BigInteger = null;
  hashCode_: number = 0;
  colorData: BufImgSurfaceData_ICMColorData = null;
  static opaqueBits: number[] = null;
  static alphaBits: number[] = null;
  static readonly CACHESIZE: number = 40;
  lookupcache: number[] = null;
  $init_IndexColorModel() {
    this.transparent_index = -1;
    this.colorData = null;
    this.lookupcache = $J.newArray(IndexColorModel.CACHESIZE, 0);
  }
  /**
   * Constructs an {@code IndexColorModel} from an array of
   * ints where each int is comprised of red, green, blue, and
   * optional alpha components in the default RGB color model format.
   * The specified transparent index represents a pixel that is made
   * entirely transparent regardless of any alpha value specified
   * for it.  The array must have enough values in it to fill all
   * of the needed component arrays of the specified size.
   * The {@code ColorSpace} is the default sRGB space.
   * The transparency value may be any of {@code Transparency.OPAQUE},
   * {@code Transparency.BITMASK},
   * or {@code Transparency.TRANSLUCENT}
   * depending on the arguments, as specified
   * in the <a href="#transparency">class description</a> above.
   * @param bits      the number of bits each pixel occupies
   * @param size      the size of the color component arrays
   * @param cmap      the array of color components
   * @param start     the starting offset of the first color component
   * @param hasalpha  indicates whether alpha values are contained in
   *                  the {@code cmap} array
   * @param trans     the index of the fully transparent pixel
   * @param transferType the data type of the array used to represent
   *           pixel values.  The data type must be either
   *           {@code DataBuffer.TYPE_BYTE} or
   *           {@code DataBuffer.TYPE_USHORT}.
   * @throws IllegalArgumentException if {@code bits} is less
   *           than 1 or greater than 16
   * @throws IllegalArgumentException if {@code size} is less
   *           than 1
   * @throws IllegalArgumentException if {@code transferType} is not
   *           one of {@code DataBuffer.TYPE_BYTE} or
   *           {@code DataBuffer.TYPE_USHORT}
   */
  _IndexColorModel$int$int$intArr$int$boolean$int$int(bits: number, size: number, cmap: number[], start: number, hasalpha: boolean, trans: number, transferType: number): this {
    this._ColorModel$int$intArr$ColorSpace$boolean$boolean$int$int(bits, IndexColorModel.opaqueBits, ColorSpace.getInstance(1000), false, false, Transparency.OPAQUE, transferType);
    this.$init_IndexColorModel();
    if (bits < 1 || bits > 16) {
      throw new IllegalArgumentException('Number of bits must be between 1 and 16.');
    }
    if (size < 1) {
      throw new IllegalArgumentException('Map size (' + size + ') must be >= 1');
    }
    if ((transferType !== DataBuffer.TYPE_BYTE) && (transferType !== DataBuffer.TYPE_USHORT)) {
      throw new IllegalArgumentException('transferType must be eitherDataBuffer.TYPE_BYTE or DataBuffer.TYPE_USHORT');
    }
    this.setRGBs$int$intArr$int$boolean$IndexColorModel(size, cmap, start, hasalpha);
    this.setTransparentPixel(trans);
    this.calculatePixelMask();
    return this;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.image.IndexColorModel', 'initIDs', this, $a);
  }
  setRGBs$int$intArr$int$boolean$IndexColorModel(size: number, cmap: number[], start: number, hasalpha: boolean): void {
    this.map_size = size;
    this.rgb = $J.newArray(this.calcRealMapSize(this.pixel_bits, size), 0);
    let j = start;
    let transparency = Transparency.OPAQUE;
    let allgray = true;
    let validBits = this.validBits;
    for (let i = 0; i < size; i++, j++) {
      if (validBits != null && !validBits.testBit(i)) {
        continue;
      }
      let cmaprgb = cmap[j];
      let r = (cmaprgb >> 16) & 255;
      let g = (cmaprgb >> 8) & 255;
      let b = (cmaprgb) & 255;
      allgray = allgray && (r === g) && (g === b);
      if (hasalpha) {
        let alpha = cmaprgb >>> 24;
        if (alpha !== 255) {
          if (alpha === 0) {
            if (transparency === Transparency.OPAQUE) {
              transparency = Transparency.BITMASK;
            }
            if (this.transparent_index < 0) {
              this.transparent_index = i;
            }
          } else {
            transparency = Transparency.TRANSLUCENT;
          }
          allgray = false;
        }
      } else {
        cmaprgb |= -16777216;
      }
      this.rgb[i] = cmaprgb;
    }
    this.allgrayopaque = allgray;
    this.setTransparency(transparency);
  }
  calcRealMapSize(bits: number, size: number): number {
    let newSize = Math.max(1 << bits, size);
    return Math.max(newSize, 256);
  }
  /**
   * Returns the transparency.  Returns either OPAQUE, BITMASK,
   * or TRANSLUCENT
   * @return the transparency of this {@code IndexColorModel}
   * @see Transparency#OPAQUE
   * @see Transparency#BITMASK
   * @see Transparency#TRANSLUCENT
   */
  getTransparency(): number {
    return this.transparency;
  }
  /**
   * Returns an array of the number of bits for each color/alpha component.
   * The array contains the color components in the order red, green,
   * blue, followed by the alpha component, if present.
   * @return an array containing the number of bits of each color
   *         and alpha component of this {@code IndexColorModel}
   */
  getComponentSize$(): number[] {
    if (this.nBits == null) {
      if (this.supportsAlpha) {
        this.nBits = $J.newArray(4, 0);
        this.nBits[3] = 8;
      } else {
        this.nBits = $J.newArray(3, 0);
      }
      this.nBits[0] = this.nBits[1] = this.nBits[2] = 8;
    }
    return this.nBits.slice();
  }
  /**
   * Returns the size of the color/alpha component arrays in this
   * {@code IndexColorModel}.
   * @return the size of the color and alpha component arrays.
   */
  getMapSize(): number {
    return this.map_size;
  }
  /**
   * Converts data for each index from the color and alpha component
   * arrays to an int in the default RGB ColorModel format and copies
   * the resulting 32-bit ARGB values into the specified array.  Only
   * the initial entries of the array as specified by
   * {@code getMapSize} are
   * written.
   * @param rgb the specified array into which the converted ARGB
   *        values from this array of color and alpha components
   *        are copied.
   */
  getRGBs(rgb: number[]): void {
    $J.system_arraycopy(this.rgb, 0, rgb, 0, this.map_size);
  }
  setTransparentPixel(trans: number): void {
    if (trans >= 0 && trans < this.map_size) {
      this.rgb[trans] &= 16777215;
      this.transparent_index = trans;
      this.allgrayopaque = false;
      if (this.transparency === Transparency.OPAQUE) {
        this.setTransparency(Transparency.BITMASK);
      }
    }
  }
  setTransparency(transparency: number): void {
    if (this.transparency !== transparency) {
      this.transparency = transparency;
      if (transparency === Transparency.OPAQUE) {
        this.supportsAlpha = false;
        this.numComponents = 3;
        this.nBits = IndexColorModel.opaqueBits;
      } else {
        this.supportsAlpha = true;
        this.numComponents = 4;
        this.nBits = IndexColorModel.alphaBits;
      }
    }
  }
  /**
   * This method is called from the constructors to set the pixel_mask
   * value, which is based on the value of pixel_bits.  The pixel_mask
   * value is used to mask off the pixel parameters for methods such
   * as getRed(), getGreen(), getBlue(), getAlpha(), and getRGB().
   */
  calculatePixelMask(): void {
    let maskbits = this.pixel_bits;
    if (maskbits === 3) {
      maskbits = 4;
    } else if (maskbits > 4 && maskbits < 8) {
      maskbits = 8;
    }
    this.pixel_mask = ((1 << maskbits) - 1) | 0;
  }
  /**
   * Returns the red color component for the specified pixel, scaled
   * from 0 to 255 in the default RGB ColorSpace, sRGB.  The pixel value
   * is specified as an int.
   * Only the lower <em>n</em> bits of the pixel value, as specified in the
   * <a href="#index_values">class description</a> above, are used to
   * calculate the returned value.
   * The returned value is a non pre-multiplied value.
   * @param pixel the specified pixel
   * @return the value of the red color component for the specified pixel
   */
  getRed$int(pixel: number): number {
    return ((this.rgb[pixel & this.pixel_mask]) >> 16) & 255;
  }
  /**
   * Returns the green color component for the specified pixel, scaled
   * from 0 to 255 in the default RGB ColorSpace, sRGB.  The pixel value
   * is specified as an int.
   * Only the lower <em>n</em> bits of the pixel value, as specified in the
   * <a href="#index_values">class description</a> above, are used to
   * calculate the returned value.
   * The returned value is a non pre-multiplied value.
   * @param pixel the specified pixel
   * @return the value of the green color component for the specified pixel
   */
  getGreen$int(pixel: number): number {
    return ((this.rgb[pixel & this.pixel_mask]) >> 8) & 255;
  }
  /**
   * Returns the blue color component for the specified pixel, scaled
   * from 0 to 255 in the default RGB ColorSpace, sRGB.  The pixel value
   * is specified as an int.
   * Only the lower <em>n</em> bits of the pixel value, as specified in the
   * <a href="#index_values">class description</a> above, are used to
   * calculate the returned value.
   * The returned value is a non pre-multiplied value.
   * @param pixel the specified pixel
   * @return the value of the blue color component for the specified pixel
   */
  getBlue$int(pixel: number): number {
    return this.rgb[pixel & this.pixel_mask] & 255;
  }
  /**
   * Returns the alpha component for the specified pixel, scaled
   * from 0 to 255.  The pixel value is specified as an int.
   * Only the lower <em>n</em> bits of the pixel value, as specified in the
   * <a href="#index_values">class description</a> above, are used to
   * calculate the returned value.
   * @param pixel the specified pixel
   * @return the value of the alpha component for the specified pixel
   */
  getAlpha$int(pixel: number): number {
    return ((this.rgb[pixel & this.pixel_mask]) >> 24) & 255;
  }
  /**
   * Returns a data element array representation of a pixel in this
   * ColorModel, given an integer pixel representation in the
   * default RGB color model.  This array can then be passed to the
   * {@link WritableRaster#setDataElements(int, int, java.lang.Object) setDataElements}
   * method of a {@link WritableRaster} object.  If the pixel variable is
   * {@code null}, a new array is allocated.  If {@code pixel}
   * is not {@code null}, it must be
   * a primitive array of type {@code transferType}; otherwise, a
   * {@code ClassCastException} is thrown.  An
   * {@code ArrayIndexOutOfBoundsException} is
   * thrown if {@code pixel} is not large enough to hold a pixel
   * value for this {@code ColorModel}.  The pixel array is returned.
   * <p>
   * Since {@code IndexColorModel} can be subclassed, subclasses
   * inherit the implementation of this method and if they don't
   * override it then they throw an exception if they use an
   * unsupported {@code transferType}.
   *
   * @param rgb the integer pixel representation in the default RGB
   * color model
   * @param pixel the specified pixel
   * @return an array representation of the specified pixel in this
   *  {@code IndexColorModel}.
   * @throws ClassCastException if {@code pixel}
   *  is not a primitive array of type {@code transferType}
   * @throws ArrayIndexOutOfBoundsException if
   *  {@code pixel} is not large enough to hold a pixel value
   *  for this {@code ColorModel}
   * @throws UnsupportedOperationException if {@code transferType}
   *         is invalid
   * @see WritableRaster#setDataElements
   * @see SampleModel#setDataElements
   */
  getDataElements$int$Object(rgb: number, pixel: any): any {
    let red = (rgb >> 16) & 255;
    let green = (rgb >> 8) & 255;
    let blue = rgb & 255;
    let alpha = (rgb >>> 24);
    let pix = 0;
    for (let i = (IndexColorModel.CACHESIZE - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if ((pix = this.lookupcache[i]) === 0) {
        break;
      }
      if (rgb === (this.lookupcache[(i + 1) | 0])) {
        return this.installpixel(pixel, ~pix);
      }
    }
    if (this.allgrayopaque) {
      let minDist = 256;
      let d: number;
      let gray = $J.idiv(((Math.imul(red, 77) + Math.imul(green, 150) + Math.imul(blue, 29) + 128) | 0), 256);
      for (let i = 0; i < this.map_size; i++) {
        if (this.rgb[i] === 0) {
          continue;
        }
        d = ((this.rgb[i] & 255) - gray) | 0;
        if (d < 0) {
          d = -d;
        }
        if (d < minDist) {
          pix = i;
          if (d === 0) {
            break;
          }
          minDist = d;
        }
      }
    } else if (this.transparency === Transparency.OPAQUE) {
      let smallestError = 2147483647;
      let lut = this.rgb;
      let lutrgb: number;
      for (let i = 0; i < this.map_size; i++) {
        lutrgb = lut[i];
        if (lutrgb === rgb && lutrgb !== 0) {
          pix = i;
          smallestError = 0;
          break;
        }
      }
      if (smallestError !== 0) {
        for (let i = 0; i < this.map_size; i++) {
          lutrgb = lut[i];
          if (lutrgb === 0) {
            continue;
          }
          let tmp = (((lutrgb >> 16) & 255) - red) | 0;
          let currentError = Math.imul(tmp, tmp);
          if (currentError < smallestError) {
            tmp = (((lutrgb >> 8) & 255) - green) | 0;
            currentError = (currentError + Math.imul(tmp, tmp)) | 0;
            if (currentError < smallestError) {
              tmp = ((lutrgb & 255) - blue) | 0;
              currentError = (currentError + Math.imul(tmp, tmp)) | 0;
              if (currentError < smallestError) {
                pix = i;
                smallestError = currentError;
              }
            }
          }
        }
      }
    } else if (alpha === 0 && this.transparent_index >= 0) {
      pix = this.transparent_index;
    } else {
      let smallestError = 2147483647;
      let lut = this.rgb;
      for (let i = 0; i < this.map_size; i++) {
        let lutrgb = lut[i];
        if (lutrgb === rgb) {
          if (this.validBits != null && !this.validBits.testBit(i)) {
            continue;
          }
          pix = i;
          break;
        }
        let tmp = (((lutrgb >> 16) & 255) - red) | 0;
        let currentError = Math.imul(tmp, tmp);
        if (currentError < smallestError) {
          tmp = (((lutrgb >> 8) & 255) - green) | 0;
          currentError = (currentError + Math.imul(tmp, tmp)) | 0;
          if (currentError < smallestError) {
            tmp = ((lutrgb & 255) - blue) | 0;
            currentError = (currentError + Math.imul(tmp, tmp)) | 0;
            if (currentError < smallestError) {
              tmp = ((lutrgb >>> 24) - alpha) | 0;
              currentError = (currentError + Math.imul(tmp, tmp)) | 0;
              if (currentError < smallestError && (this.validBits == null || this.validBits.testBit(i))) {
                pix = i;
                smallestError = currentError;
              }
            }
          }
        }
      }
    }
    $J.system_arraycopy(this.lookupcache, 2, this.lookupcache, 0, (IndexColorModel.CACHESIZE - 2) | 0);
    (this.lookupcache[(IndexColorModel.CACHESIZE - 1) | 0]) = rgb;
    (this.lookupcache[(IndexColorModel.CACHESIZE - 2) | 0]) = ~pix;
    return this.installpixel(pixel, pix);
  }
  installpixel(pixel: any, pix: number): any {
    {
      let intObj: number[], byteObj: number[], shortObj: number[];
      switch (this.transferType) {
        case DataBuffer.TYPE_INT:
          if (pixel == null) {
            pixel = intObj = $J.newArray(1, 0);
          } else {
            intObj = pixel;
          }
          intObj[0] = pix;
          break;
        case DataBuffer.TYPE_BYTE:
          if (pixel == null) {
            pixel = byteObj = $J.newArray(1, 0);
          } else {
            byteObj = pixel;
          }
          byteObj[0] = ((pix) << 24) >> 24;
          break;
        case DataBuffer.TYPE_USHORT:
          if (pixel == null) {
            pixel = shortObj = $J.newArray(1, 0);
          } else {
            shortObj = pixel;
          }
          shortObj[0] = ((pix) << 16) >> 16;
          break;
        default:
          throw new UnsupportedOperationException('This method has not been implemented for transferType ' + this.transferType);
      }
    }
    return pixel;
  }
  /**
   * Returns an array of unnormalized color/alpha components for a
   * specified pixel in this {@code ColorModel}.  The pixel value
   * is specified as an int.  If the {@code components} array is {@code null},
   * a new array is allocated that contains
   * {@code offset + getNumComponents()} elements.
   * The {@code components} array is returned,
   * with the alpha component included
   * only if {@code hasAlpha} returns true.
   * Color/alpha components are stored in the {@code components} array starting
   * at {@code offset} even if the array is allocated by this method.
   * An {@code ArrayIndexOutOfBoundsException}
   * is thrown if  the {@code components} array is not {@code null} and is
   * not large enough to hold all the color and alpha components
   * starting at {@code offset}.
   * @param pixel the specified pixel
   * @param components the array to receive the color and alpha
   * components of the specified pixel
   * @param offset the offset into the {@code components} array at
   * which to start storing the color and alpha components
   * @return an array containing the color and alpha components of the
   * specified pixel starting at the specified offset.
   * @see ColorModel#hasAlpha
   * @see ColorModel#getNumComponents
   */
  getComponents$int$intArr$int(pixel: number, components: number[], offset: number): number[] {
    if (components == null) {
      components = $J.newArray((offset + this.numComponents) | 0, 0);
    }
    (components[(offset + 0) | 0]) = this.getRed$int(pixel);
    (components[(offset + 1) | 0]) = this.getGreen$int(pixel);
    (components[(offset + 2) | 0]) = this.getBlue$int(pixel);
    if (this.supportsAlpha && ((components.length - offset) | 0) > 3) {
      (components[(offset + 3) | 0]) = this.getAlpha$int(pixel);
    }
    return components;
  }
  /**
   * Returns an array of unnormalized color/alpha components for
   * a specified pixel in this {@code ColorModel}.  The pixel
   * value is specified by an array of data elements of type
   * {@code transferType} passed in as an object reference.
   * If {@code pixel} is not a primitive array of type
   * {@code transferType}, a {@code ClassCastException}
   * is thrown.  An {@code ArrayIndexOutOfBoundsException}
   * is thrown if {@code pixel} is not large enough to hold
   * a pixel value for this {@code ColorModel}.  If the
   * {@code components} array is {@code null}, a new array
   * is allocated that contains
   * {@code offset + getNumComponents()} elements.
   * The {@code components} array is returned,
   * with the alpha component included
   * only if {@code hasAlpha} returns true.
   * Color/alpha components are stored in the {@code components}
   * array starting at {@code offset} even if the array is
   * allocated by this method.  An
   * {@code ArrayIndexOutOfBoundsException} is also
   * thrown if  the {@code components} array is not
   * {@code null} and is not large enough to hold all the color
   * and alpha components starting at {@code offset}.
   * <p>
   * Since {@code IndexColorModel} can be subclassed, subclasses
   * inherit the implementation of this method and if they don't
   * override it then they throw an exception if they use an
   * unsupported {@code transferType}.
   *
   * @param pixel the specified pixel
   * @param components an array that receives the color and alpha
   * components of the specified pixel
   * @param offset the index into the {@code components} array at
   * which to begin storing the color and alpha components of the
   * specified pixel
   * @return an array containing the color and alpha components of the
   * specified pixel starting at the specified offset.
   * @throws ArrayIndexOutOfBoundsException if {@code pixel}
   *            is not large enough to hold a pixel value for this
   *            {@code ColorModel} or if the
   *            {@code components} array is not {@code null}
   *            and is not large enough to hold all the color
   *            and alpha components starting at {@code offset}
   * @throws ClassCastException if {@code pixel} is not a
   *            primitive array of type {@code transferType}
   * @throws UnsupportedOperationException if {@code transferType}
   *         is not one of the supported transfer types
   * @see ColorModel#hasAlpha
   * @see ColorModel#getNumComponents
   */
  getComponents$Object$intArr$int(pixel: any, components: number[], offset: number): number[] {
    let intpixel: number;
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
   * Returns a data element array representation of a pixel in this
   * {@code ColorModel} given an array of unnormalized color/alpha
   * components.  This array can then be passed to the
   * {@code setDataElements} method of a {@code WritableRaster}
   * object.  An {@code ArrayIndexOutOfBoundsException} is
   * thrown if the
   * {@code components} array is not large enough to hold all of the
   * color and alpha components starting at {@code offset}.
   * If the pixel variable is {@code null}, a new array
   * is allocated.  If {@code pixel} is not {@code null},
   * it must be a primitive array of type {@code transferType};
   * otherwise, a {@code ClassCastException} is thrown.
   * An {@code ArrayIndexOutOfBoundsException} is thrown if pixel
   * is not large enough to hold a pixel value for this
   * {@code ColorModel}.
   * <p>
   * Since {@code IndexColorModel} can be subclassed, subclasses
   * inherit the implementation of this method and if they don't
   * override it then they throw an exception if they use an
   * unsupported {@code transferType}
   *
   * @param components an array of unnormalized color and alpha
   * components
   * @param offset the index into {@code components} at which to
   * begin retrieving color and alpha components
   * @param pixel the {@code Object} representing an array of color
   * and alpha components
   * @return an {@code Object} representing an array of color and
   * alpha components.
   * @throws ClassCastException if {@code pixel}
   *  is not a primitive array of type {@code transferType}
   * @throws ArrayIndexOutOfBoundsException if
   *  {@code pixel} is not large enough to hold a pixel value
   *  for this {@code ColorModel} or the {@code components}
   *  array is not large enough to hold all of the color and alpha
   *  components starting at {@code offset}
   * @throws UnsupportedOperationException if {@code transferType}
   *         is not one of the supported transfer types
   * @see WritableRaster#setDataElements
   * @see SampleModel#setDataElements
   */
  getDataElements$intArr$int$Object(components: number[], offset: number, pixel: any): any {
    let rgb = ((components[(offset + 0) | 0]) << 16) | ((components[(offset + 1) | 0]) << 8) | (components[(offset + 2) | 0]);
    if (this.supportsAlpha) {
      rgb |= ((components[(offset + 3) | 0]) << 24);
    } else {
      rgb &= -16777216;
    }
    return this.getDataElements$int$Object(rgb, pixel);
  }
  /**
   * Creates a {@code WritableRaster} with the specified width
   * and height that has a data layout ({@code SampleModel})
   * compatible with this {@code ColorModel}.  This method
   * only works for color models with 16 or fewer bits per pixel.
   * <p>
   * Since {@code IndexColorModel} can be subclassed, any
   * subclass that supports greater than 16 bits per pixel must
   * override this method.
   *
   * @param w the width to apply to the new {@code WritableRaster}
   * @param h the height to apply to the new {@code WritableRaster}
   * @return a {@code WritableRaster} object with the specified
   * width and height.
   * @throws UnsupportedOperationException if the number of bits in a
   *         pixel is greater than 16
   * @see WritableRaster
   * @see SampleModel
   */
  createCompatibleWritableRaster(w: number, h: number): WritableRaster {
    let raster: WritableRaster;
    if (this.pixel_bits === 1 || this.pixel_bits === 2 || this.pixel_bits === 4) {
      raster = Raster.createPackedRaster$int$int$int$int$int$Point(DataBuffer.TYPE_BYTE, w, h, 1, this.pixel_bits, null);
    } else if (this.pixel_bits <= 8) {
      raster = Raster.createInterleavedRaster$int$int$int$int$Point(DataBuffer.TYPE_BYTE, w, h, 1, null);
    } else if (this.pixel_bits <= 16) {
      raster = Raster.createInterleavedRaster$int$int$int$int$Point(DataBuffer.TYPE_USHORT, w, h, 1, null);
    } else {
      throw new UnsupportedOperationException('This method is not supported  for pixel bits > 16.');
    }
    return raster;
  }
  /**
   * Returns {@code true} if {@code raster} is compatible
   * with this {@code ColorModel} or {@code false} if it
   * is not compatible with this {@code ColorModel}.
   * @param raster the {@link Raster} object to test for compatibility
   * @return {@code true} if {@code raster} is compatible
   * with this {@code ColorModel}; {@code false} otherwise.
   */
  isCompatibleRaster(raster: Raster): boolean {
    let size = raster.getSampleModel().getSampleSize$int(0);
    return ((raster.getTransferType() === this.transferType) && (raster.getNumBands() === 1) && ((1 << size) >= this.map_size));
  }
  /**
   * Returns a new {@code BufferedImage} of TYPE_INT_ARGB or
   * TYPE_INT_RGB that has a {@code Raster} with pixel data
   * computed by expanding the indices in the source {@code Raster}
   * using the color/alpha component arrays of this {@code ColorModel}.
   * Only the lower <em>n</em> bits of each index value in the source
   * {@code Raster}, as specified in the
   * <a href="#index_values">class description</a> above, are used to
   * compute the color/alpha values in the returned image.
   * If {@code forceARGB} is {@code true}, a TYPE_INT_ARGB image is
   * returned regardless of whether or not this {@code ColorModel}
   * has an alpha component array or a transparent pixel.
   * @param raster the specified {@code Raster}
   * @param forceARGB if {@code true}, the returned
   *     {@code BufferedImage} is TYPE_INT_ARGB; otherwise it is
   *     TYPE_INT_RGB
   * @return a {@code BufferedImage} created with the specified
   *     {@code Raster}
   * @throws IllegalArgumentException if the raster argument is not
   *           compatible with this IndexColorModel
   */
  convertToIntDiscrete(raster: Raster, forceARGB: boolean): BufferedImage {
    let cm: ColorModel;
    if (!this.isCompatibleRaster(raster)) {
      throw new IllegalArgumentException('This raster is not compatiblewith this IndexColorModel.');
    }
    if (forceARGB || this.transparency === Transparency.TRANSLUCENT) {
      cm = ColorModel.getRGBdefault();
    } else if (this.transparency === Transparency.BITMASK) {
      cm = new DirectColorModel()._DirectColorModel$int$int$int$int$int(25, 16711680, 65280, 255, 16777216);
    } else {
      cm = new DirectColorModel()._DirectColorModel$int$int$int$int(24, 16711680, 65280, 255);
    }
    let w = raster.getWidth();
    let h = raster.getHeight();
    let discreteRaster = cm.createCompatibleWritableRaster(w, h);
    let obj = null;
    let data = null;
    let rX = raster.getMinX();
    let rY = raster.getMinY();
    for (let y = 0; y < h; y++, rY++) {
      obj = raster.getDataElements$int$int$int$int$Object(rX, rY, w, 1, obj);
      if (Array.isArray(obj)) {
        data = obj;
      } else {
        data = DataBuffer.toIntArray(obj);
      }
      for (let x = 0; x < w; x++) {
        data[x] = this.rgb[data[x] & this.pixel_mask];
      }
      discreteRaster.setDataElements$int$int$int$int$Object(0, y, w, 1, data);
    }
    return new BufferedImage(cm, discreteRaster, false, null);
  }
  /**
   * Returns the {@code String} representation of the contents of
   * this {@code ColorModel} object.
   * @return a {@code String} representing the contents of this
   * {@code ColorModel} object.
   */
  toString(): string {
    return 'IndexColorModel: #pixelBits = ' + this.pixel_bits + ' numComponents = ' + this.numComponents + ' color space = ' + $J.str(this.colorSpace) + ' transparency = ' + this.transparency + ' transIndex   = ' + this.transparent_index + ' has alpha = ' + this.supportsAlpha + ' isAlphaPre = ' + this.isAlphaPremultiplied_;
  }
  /**
   * Tests if the specified {@code Object} is an
   * instance of {@code IndexColorModel}
   * and if it equals this {@code IndexColorModel}
   * @param obj the {@code Object} to test for equality
   * @return {@code true} if the specified {@code Object}
   * equals this {@code IndexColorModel}; {@code false} otherwise.
   */
  equals(obj: any): boolean {
    if (!(obj instanceof IndexColorModel)) {
      return false;
    }
    let cm = obj;
    if (this.supportsAlpha !== cm.hasAlpha() || this.isAlphaPremultiplied_ !== cm.isAlphaPremultiplied() || this.pixel_bits !== cm.getPixelSize() || this.transparency !== cm.getTransparency() || this.numComponents !== cm.getNumComponents() || (!($J.equals(this.colorSpace, cm.colorSpace))) || this.transferType !== cm.transferType || this.map_size !== cm.map_size || this.transparent_index !== cm.transparent_index) {
      return false;
    }
    if (!(Arrays.equals(this.nBits, cm.getComponentSize$()))) {
      return false;
    }
    let testValidBits: boolean;
    if (this.validBits === cm.validBits) {
      testValidBits = false;
    } else if (this.validBits == null || cm.validBits == null) {
      return false;
    } else if (this.validBits.equals(cm.validBits)) {
      testValidBits = false;
    } else {
      testValidBits = true;
    }
    if (testValidBits) {
      for (let i = 0; i < this.map_size; i++) {
        if (this.rgb[i] !== cm.rgb[i] || this.validBits.testBit(i) !== cm.validBits.testBit(i)) {
          return false;
        }
      }
    } else {
      for (let i = 0; i < this.map_size; i++) {
        if (this.rgb[i] !== cm.rgb[i]) {
          return false;
        }
      }
    }
    return true;
  }
  /**
   * Returns the hash code for IndexColorModel.
   *
   * @return    a hash code for IndexColorModel
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
      result = (Math.imul(89, result) + Arrays.hashCode(this.rgb)) | 0;
      result = (Math.imul(89, result) + this.map_size) | 0;
      result = (Math.imul(89, result) + this.transparent_index) | 0;
      this.hashCode_ = result;
    }
    return result;
  }
  static $clinit() {
    IndexColorModel.opaqueBits = [8, 8, 8];
    IndexColorModel.alphaBits = [8, 8, 8, 8];
    ColorModel.loadLibraries();
    IndexColorModel.initIDs();
  }
}

$J.define(IndexColorModel, 'java.awt.image.IndexColorModel', { kind: 'class', sup: 'java.awt.image.ColorModel', ctors: { 'int,int,int[],int,int,java.math.BigInteger': '_IndexColorModel$int$int$intArr$int$int$BigInteger', 'int,int,int[],int,boolean,int,int': '_IndexColorModel$int$int$intArr$int$boolean$int$int', 'int,int,byte[],int,boolean,int': '_IndexColorModel$int$int$byteArr$int$boolean$int', 'int,int,byte[],int,boolean': '_IndexColorModel$int$int$byteArr$int$boolean', 'int,int,byte[],byte[],byte[],byte[]': '_IndexColorModel$int$int$byteArr$byteArr$byteArr$byteArr', 'int,int,byte[],byte[],byte[],int': '_IndexColorModel$int$int$byteArr$byteArr$byteArr$int', 'int,int,byte[],byte[],byte[]': '_IndexColorModel$int$int$byteArr$byteArr$byteArr' }, meths: { 'isValid()': 'isValid$', 'isValid(int)': 'isValid$int', 'getDataElements(int[],int,java.lang.Object)': 'getDataElements$intArr$int$Object', 'getDataElement(int[],int)': 'getDataElement$intArr$int', 'getComponents(java.lang.Object,int[],int)': 'getComponents$Object$intArr$int', 'getComponents(int,int[],int)': 'getComponents$int$intArr$int', 'getDataElements(int,java.lang.Object)': 'getDataElements$int$Object', 'getRGB(int)': 'getRGB$int', 'getAlpha(int)': 'getAlpha$int', 'getBlue(int)': 'getBlue$int', 'getGreen(int)': 'getGreen$int', 'getRed(int)': 'getRed$int', 'getComponentSize()': 'getComponentSize$', 'setRGBs(int,int[],int,boolean)': 'setRGBs$int$intArr$int$boolean$IndexColorModel', 'setRGBs(int,byte[],byte[],byte[],byte[])': 'setRGBs$int$byteArr$byteArr$byteArr$byteArr$IndexColorModel' }, clinit: true, lazy: ['opaqueBits', 'alphaBits'] });
$J.module(() => {
  Transparency = $J.load('java.awt.Transparency');
  DataBuffer = $J.load('java.awt.image.DataBuffer');
  DirectColorModel = $J.load('java.awt.image.DirectColorModel');
  Raster = $J.load('java.awt.image.Raster');
});
