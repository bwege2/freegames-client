// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/PackedColorModel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays, IllegalArgumentException } from '../../../../jre/index.ts';
import { ColorModel } from './ColorModel.ts';

let Transparency;

/**
 * The {@code PackedColorModel} class is an abstract
 * {@link ColorModel} class that works with pixel values which represent
 * color and alpha information as separate samples and which pack all
 * samples for a single pixel into a single int, short, or byte quantity.
 * This class can be used with an arbitrary {@link ColorSpace}.  The number of
 * color samples in the pixel values must be the same as the number of color
 * components in the {@code ColorSpace}.  There can be a single alpha
 * sample.  The array length is always 1 for those methods that use a
 * primitive array pixel representation of type {@code transferType}.
 * The transfer types supported are DataBuffer.TYPE_BYTE,
 * DataBuffer.TYPE_USHORT, and DataBuffer.TYPE_INT.
 * Color and alpha samples are stored in the single element of the array
 * in bits indicated by bit masks.  Each bit mask must be contiguous and
 * masks must not overlap.  The same masks apply to the single int
 * pixel representation used by other methods.  The correspondence of
 * masks and color/alpha samples is as follows:
 * <ul>
 * <li> Masks are identified by indices running from 0 through
 * {@link ColorModel#getNumComponents() getNumComponents}&nbsp;-&nbsp;1.
 * <li> The first
 * {@link ColorModel#getNumColorComponents() getNumColorComponents}
 * indices refer to color samples.
 * <li> If an alpha sample is present, it corresponds the last index.
 * <li> The order of the color indices is specified
 * by the {@code ColorSpace}.  Typically, this reflects the name of
 * the color space type (for example, TYPE_RGB), index 0
 * corresponds to red, index 1 to green, and index 2 to blue.
 * </ul>
 * <p>
 * The translation from pixel values to color/alpha components for
 * display or processing purposes is a one-to-one correspondence of
 * samples to components.
 * A {@code PackedColorModel} is typically used with image data
 * that uses masks to define packed samples.  For example, a
 * {@code PackedColorModel} can be used in conjunction with a
 * {@link SinglePixelPackedSampleModel} to construct a
 * {@link BufferedImage}.  Normally the masks used by the
 * {@link SampleModel} and the {@code ColorModel} would be the same.
 * However, if they are different, the color interpretation of pixel data is
 * done according to the masks of the {@code ColorModel}.
 * <p>
 * A single {@code int} pixel representation is valid for all objects
 * of this class since it is always possible to represent pixel values
 * used with this class in a single {@code int}.  Therefore, methods
 * that use this representation do not throw an
 * {@code IllegalArgumentException} due to an invalid pixel value.
 * <p>
 * A subclass of {@code PackedColorModel} is {@link DirectColorModel},
 * which is similar to an X11 TrueColor visual.
 *
 * @see DirectColorModel
 * @see SinglePixelPackedSampleModel
 * @see BufferedImage
 */
export class PackedColorModel extends ColorModel {
  maskArray: number[] = null;
  maskOffsets: number[] = null;
  scaleFactors: number[] = null;
  hashCode_: number = 0;
  /**
   * Constructs a {@code PackedColorModel} from the specified
   * masks which indicate which bits in an {@code int} pixel
   * representation contain the alpha, red, green and blue color samples.
   * Color components are in the specified {@code ColorSpace}, which
   * must be of type ColorSpace.TYPE_RGB.  All of the bits in each
   * mask must be contiguous and fit in the specified number of
   * least significant bits of an {@code int} pixel representation.  If
   * {@code amask} is 0, there is no alpha.  If there is alpha,
   * the {@code boolean isAlphaPremultiplied}
   * specifies how to interpret color and alpha samples
   * in pixel values.  If the {@code boolean} is {@code true},
   * color samples are assumed to have been multiplied by the alpha sample.
   * The transparency, {@code trans}, specifies what alpha values
   * can be represented by this color model.
   * The transfer type is the type of primitive array used to represent
   * pixel values.
   * @param space the specified {@code ColorSpace}
   * @param bits the number of bits in the pixel values
   * @param rmask specifies the mask representing
   *         the bits of the pixel values that represent the red
   *         color component
   * @param gmask specifies the mask representing
   *         the bits of the pixel values that represent the green
   *         color component
   * @param bmask specifies the mask representing
   *         the bits of the pixel values that represent
   *         the blue color component
   * @param amask specifies the mask representing
   *         the bits of the pixel values that represent
   *         the alpha component
   * @param isAlphaPremultiplied {@code true} if color samples are
   *        premultiplied by the alpha sample; {@code false} otherwise
   * @param trans specifies the alpha value that can be represented by
   *        this color model
   * @param transferType the type of array used to represent pixel values
   * @throws IllegalArgumentException if {@code space} is not a
   *         TYPE_RGB space
   * @see ColorSpace
   */
  _PackedColorModel$ColorSpace$int$int$int$int$int$boolean$int$int(space: ColorSpace, bits: number, rmask: number, gmask: number, bmask: number, amask: number, isAlphaPremultiplied: boolean, trans: number, transferType: number): this {
    this._ColorModel$int$intArr$ColorSpace$boolean$boolean$int$int(bits, PackedColorModel.createBitsArray$int$int$int$int(rmask, gmask, bmask, amask), space, (amask === 0 ? false : true), isAlphaPremultiplied, trans, transferType);
    if (space.getType() !== 5) {
      throw new IllegalArgumentException('ColorSpace must be TYPE_RGB.');
    }
    this.maskArray = $J.newArray(this.numComponents, 0);
    this.maskOffsets = $J.newArray(this.numComponents, 0);
    this.scaleFactors = $J.newArray(this.numComponents, 0);
    this.DecomposeMask(rmask, 0, 'red');
    this.DecomposeMask(gmask, 1, 'green');
    this.DecomposeMask(bmask, 2, 'blue');
    if (amask !== 0) {
      this.DecomposeMask(amask, 3, 'alpha');
      if (this.nBits[3] === 1) {
        this.transparency = Transparency.BITMASK;
      }
    }
    return this;
  }
  /**
   * Returns the mask indicating which bits in a pixel
   * contain the specified color/alpha sample.  For color
   * samples, {@code index} corresponds to the placement of color
   * sample names in the color space.  Thus, an {@code index}
   * equal to 0 for a CMYK ColorSpace would correspond to
   * Cyan and an {@code index} equal to 1 would correspond to
   * Magenta.  If there is alpha, the alpha {@code index} would be:
   * <pre>
   *      alphaIndex = numComponents() - 1;
   * </pre>
   * @param index the specified color or alpha sample
   * @return the mask, which indicates which bits of the {@code int}
   *         pixel representation contain the color or alpha sample specified
   *         by {@code index}.
   * @throws ArrayIndexOutOfBoundsException if {@code index} is
   *         greater than the number of components minus 1 in this
   *         {@code PackedColorModel} or if {@code index} is
   *         less than zero
   */
  getMask(index: number): number {
    return this.maskArray[index];
  }
  DecomposeMask(mask: number, idx: number, componentName: string): void {
    let off = 0;
    let count = this.nBits[idx];
    this.maskArray[idx] = mask;
    if (mask !== 0) {
      while ((mask & 1) === 0) {
        mask >>>= 1;
        off++;
      }
    }
    if (((off + count) | 0) > this.pixel_bits) {
      throw new IllegalArgumentException(componentName + ' mask ' + $J.Integer_toHexString(this.maskArray[idx]) + ' overflows pixel (expecting ' + this.pixel_bits + ' bits');
    }
    this.maskOffsets[idx] = off;
    if (count === 0) {
      this.scaleFactors[idx] = 256;
    } else {
      this.scaleFactors[idx] = Math.fround(255 / (((1 << count) - 1) | 0));
    }
  }
  /**
   * Tests if the specified {@code Object} is an instance
   * of {@code PackedColorModel} and equals this
   * {@code PackedColorModel}.
   * @param obj the {@code Object} to test for equality
   * @return {@code true} if the specified {@code Object}
   * is an instance of {@code PackedColorModel} and equals this
   * {@code PackedColorModel}; {@code false} otherwise.
   */
  equals(obj: any): boolean {
    if (!(obj instanceof PackedColorModel)) {
      return false;
    }
    let cm = obj;
    if (this.supportsAlpha !== cm.hasAlpha() || this.isAlphaPremultiplied_ !== cm.isAlphaPremultiplied() || this.pixel_bits !== cm.getPixelSize() || this.transparency !== cm.getTransparency() || this.numComponents !== cm.getNumComponents() || (!($J.equals(this.colorSpace, cm.colorSpace))) || this.transferType !== cm.transferType) {
      return false;
    }
    let numC = cm.getNumComponents();
    for (let i = 0; i < numC; i++) {
      if (this.maskArray[i] !== cm.getMask(i)) {
        return false;
      }
    }
    if (!(Arrays.equals(this.nBits, cm.getComponentSize$()))) {
      return false;
    }
    return true;
  }
  /**
   * Returns the hash code for this PackedColorModel.
   *
   * @return    a hash code for this PackedColorModel.
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
      result = (Math.imul(89, result) + Arrays.hashCode(this.maskArray)) | 0;
      this.hashCode_ = result;
    }
    return result;
  }
  static createBitsArray$int$int$int$int(rmask: number, gmask: number, bmask: number, amask: number): number[] {
    let arr = $J.newArray((3 + (amask === 0 ? 0 : 1)) | 0, 0);
    arr[0] = PackedColorModel.countBits(rmask);
    arr[1] = PackedColorModel.countBits(gmask);
    arr[2] = PackedColorModel.countBits(bmask);
    if (arr[0] < 0) {
      throw new IllegalArgumentException('Noncontiguous red mask (' + $J.Integer_toHexString(rmask));
    } else if (arr[1] < 0) {
      throw new IllegalArgumentException('Noncontiguous green mask (' + $J.Integer_toHexString(gmask));
    } else if (arr[2] < 0) {
      throw new IllegalArgumentException('Noncontiguous blue mask (' + $J.Integer_toHexString(bmask));
    }
    if (amask !== 0) {
      arr[3] = PackedColorModel.countBits(amask);
      if (arr[3] < 0) {
        throw new IllegalArgumentException('Noncontiguous alpha mask (' + $J.Integer_toHexString(amask));
      }
    }
    return arr;
  }
  static countBits(mask: number): number {
    let count = 0;
    if (mask !== 0) {
      while ((mask & 1) === 0) {
        mask >>>= 1;
      }
      while ((mask & 1) === 1) {
        mask >>>= 1;
        count++;
      }
    }
    if (mask !== 0) {
      return -1;
    }
    return count;
  }
}

$J.define(PackedColorModel, 'java.awt.image.PackedColorModel', { kind: 'class', sup: 'java.awt.image.ColorModel', ctors: { 'java.awt.color.ColorSpace,int,int,int,int,int,boolean,int,int': '_PackedColorModel$ColorSpace$int$int$int$int$int$boolean$int$int', 'java.awt.color.ColorSpace,int,int[],int,boolean,int,int': '_PackedColorModel$ColorSpace$int$intArr$int$boolean$int$int' }, meths: { 'createBitsArray(int,int,int,int)': 'createBitsArray$int$int$int$int', 'createBitsArray(int[],int)': 'createBitsArray$intArr$int' } });
$J.module(() => {
  Transparency = $J.load('java.awt.Transparency');
});
