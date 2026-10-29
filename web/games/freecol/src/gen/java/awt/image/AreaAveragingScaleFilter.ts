// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/AreaAveragingScaleFilter.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { ReplicateScaleFilter } from './ReplicateScaleFilter.ts';

let ColorModel;

/**
 * An ImageFilter class for scaling images using a simple area averaging
 * algorithm that produces smoother results than the nearest neighbor
 * algorithm.
 * <p>This class extends the basic ImageFilter Class to scale an existing
 * image and provide a source for a new image containing the resampled
 * image.  The pixels in the source image are blended to produce pixels
 * for an image of the specified size.  The blending process is analogous
 * to scaling up the source image to a multiple of the destination size
 * using pixel replication and then scaling it back down to the destination
 * size by simply averaging all the pixels in the supersized image that
 * fall within a given pixel of the destination image.  If the data from
 * the source is not delivered in TopDownLeftRight order then the filter
 * will back off to a simple pixel replication behavior and utilize the
 * requestTopDownLeftRightResend() method to refilter the pixels in a
 * better way at the end.
 * <p>It is meant to be used in conjunction with a FilteredImageSource
 * object to produce scaled versions of existing images.  Due to
 * implementation dependencies, there may be differences in pixel values
 * of an image filtered on different platforms.
 *
 * @see FilteredImageSource
 * @see ReplicateScaleFilter
 * @see ImageFilter
 *
 * @author      Jim Graham
 */
export class AreaAveragingScaleFilter extends ReplicateScaleFilter {
  static rgbmodel: ColorModel = null;
  static readonly neededHints: number = 6;
  passthrough: boolean = false;
  reds: number[] = null;
  greens: number[] = null;
  blues: number[] = null;
  alphas: number[] = null;
  savedy: number = 0;
  savedyrem: number = 0;
  /**
   * Constructs an AreaAveragingScaleFilter that scales the pixels from
   * its source Image as specified by the width and height parameters.
   * @param width the target width to scale the image
   * @param height the target height to scale the image
   * @throws IllegalArgumentException if {@code width} equals
   *         zero or {@code height} equals zero
   */
  _AreaAveragingScaleFilter(width: number, height: number): this {
    this._ReplicateScaleFilter(width, height);
    return this;
  }
  static $clinit() {
    AreaAveragingScaleFilter.rgbmodel = ColorModel.getRGBdefault();
  }
}

$J.define(AreaAveragingScaleFilter, 'java.awt.image.AreaAveragingScaleFilter', { kind: 'class', sup: 'java.awt.image.ReplicateScaleFilter', ctors: { 'int,int': '_AreaAveragingScaleFilter' }, meths: { 'setPixels(int,int,int,int,java.awt.image.ColorModel,int[],int,int)': 'setPixels$int$int$int$int$ColorModel$intArr$int$int', 'setPixels(int,int,int,int,java.awt.image.ColorModel,byte[],int,int)': 'setPixels$int$int$int$int$ColorModel$byteArr$int$int' }, clinit: true, lazy: ['rgbmodel'] });
$J.module(() => {
  ColorModel = $J.load('java.awt.image.ColorModel');
});
