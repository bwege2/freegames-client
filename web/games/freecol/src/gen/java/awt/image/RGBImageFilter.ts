// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/RGBImageFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { ImageFilter } from './ImageFilter.ts';

/**
 * This class provides an easy way to create an ImageFilter which modifies
 * the pixels of an image in the default RGB ColorModel.  It is meant to
 * be used in conjunction with a FilteredImageSource object to produce
 * filtered versions of existing images.  It is an abstract class that
 * provides the calls needed to channel all of the pixel data through a
 * single method which converts pixels one at a time in the default RGB
 * ColorModel regardless of the ColorModel being used by the ImageProducer.
 * The only method which needs to be defined to create a usable image
 * filter is the filterRGB method.  Here is an example of a definition
 * of a filter which swaps the red and blue components of an image:
 * <pre>{@code
 *
 *      class RedBlueSwapFilter extends RGBImageFilter {
 *          public RedBlueSwapFilter() {
 *              // The filter's operation does not depend on the
 *              // pixel's location, so IndexColorModels can be
 *              // filtered directly.
 *              canFilterIndexColorModel = true;
 *          }
 *
 *          public int filterRGB(int x, int y, int rgb) {
 *              return ((rgb & 0xff00ff00)
 *                      | ((rgb & 0xff0000) >> 16)
 *                      | ((rgb & 0xff) << 16));
 *          }
 *      }
 *
 * }</pre>
 *
 * @see FilteredImageSource
 * @see ImageFilter
 * @see ColorModel#getRGBdefault
 *
 * @author      Jim Graham
 */
export class RGBImageFilter extends ImageFilter {
  /**
   * The {@code ColorModel} to be replaced by
   * {@code newmodel} when the user calls
   * {@link #substituteColorModel(ColorModel, ColorModel) substituteColorModel}.
   */
  origmodel: ColorModel = null;
  /**
   * The {@code ColorModel} with which to
   * replace {@code origmodel} when the user calls
   * {@code substituteColorModel}.
   */
  newmodel: ColorModel = null;
  /**
   * This boolean indicates whether or not it is acceptable to apply
   * the color filtering of the filterRGB method to the color table
   * entries of an IndexColorModel object in lieu of pixel by pixel
   * filtering.  Subclasses should set this variable to true in their
   * constructor if their filterRGB method does not depend on the
   * coordinate of the pixel being filtered.
   * @see #substituteColorModel
   * @see #filterRGB
   * @see IndexColorModel
   */
  canFilterIndexColorModel: boolean = false;
  /**
   * Constructor for subclasses to call.
   */
  _RGBImageFilter(): this {
    this._ImageFilter();
    return this;
  }
}

$J.define(RGBImageFilter, 'java.awt.image.RGBImageFilter', { kind: 'class', sup: 'java.awt.image.ImageFilter', ctors: { '': '_RGBImageFilter' }, meths: { 'setPixels(int,int,int,int,java.awt.image.ColorModel,int[],int,int)': 'setPixels$int$int$int$int$ColorModel$intArr$int$int', 'setPixels(int,int,int,int,java.awt.image.ColorModel,byte[],int,int)': 'setPixels$int$int$int$int$ColorModel$byteArr$int$int' } });
