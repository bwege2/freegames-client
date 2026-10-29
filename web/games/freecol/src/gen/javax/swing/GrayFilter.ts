// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/GrayFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, MultiResolutionCachedImage, Toolkit } from '../../../jre/index.ts';
import { RGBImageFilter } from '../../java/awt/image/RGBImageFilter.ts';

let FilteredImageSource, MultiResolutionImage;

/**
 * An image filter that "disables" an image by turning
 * it into a grayscale image, and brightening the pixels
 * in the image. Used by buttons to create an image for
 * a disabled button.
 *
 * @author      Jeff Dinkins
 * @author      Tom Ball
 * @author      Jim Graham
 * @since 1.2
 */
export class GrayFilter extends RGBImageFilter {
  brighter_: boolean = false;
  percent: number = 0;
  /**
   * Constructs a GrayFilter object that filters a color image to a
   * grayscale image. Used by buttons to create disabled ("grayed out")
   * button images.
   *
   * @param b  a boolean -- true if the pixels should be brightened
   * @param p  an int in the range 0..100 that determines the percentage
   *           of gray, where 100 is the darkest gray, and 0 is the lightest
   */
  _GrayFilter(b: boolean, p: number): this {
    this._RGBImageFilter();
    this.brighter_ = b;
    this.percent = p;
    this.canFilterIndexColorModel = true;
    return this;
  }
  /**
   * Creates a disabled image
   *
   * @param i  an {@code Image} to be created as disabled
   * @return  the new grayscale image created from {@code i}
   */
  static createDisabledImage(i: Image): Image {
    if ($J.isa(i, MultiResolutionImage)) {
      return MultiResolutionCachedImage.map(i, (img) => GrayFilter.createDisabledImageImpl(img));
    }
    return GrayFilter.createDisabledImageImpl(i);
  }
  static createDisabledImageImpl(i: Image): Image {
    let filter = new GrayFilter()._GrayFilter(true, 50);
    let prod = new FilteredImageSource()._FilteredImageSource(i.getSource(), filter);
    let grayImage = Toolkit.getDefaultToolkit().createImage(prod);
    return grayImage;
  }
}

$J.define(GrayFilter, 'javax.swing.GrayFilter', { kind: 'class', sup: 'java.awt.image.RGBImageFilter', ctors: { 'boolean,int': '_GrayFilter' } });
$J.module(() => {
  FilteredImageSource = $J.load('java.awt.image.FilteredImageSource');
  MultiResolutionImage = $J.load('java.awt.image.MultiResolutionImage');
});
