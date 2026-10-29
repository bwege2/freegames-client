// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/BufferedImageOp.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2006, Oracle and/or its affiliates. All rights reserved.
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

/**
 * This interface describes single-input/single-output
 * operations performed on {@code BufferedImage} objects.
 * It is implemented by {@code AffineTransformOp},
 * {@code ConvolveOp}, {@code ColorConvertOp}, {@code RescaleOp},
 * and {@code LookupOp}.  These objects can be passed into
 * a {@code BufferedImageFilter} to operate on a
 * {@code BufferedImage} in the
 * ImageProducer-ImageFilter-ImageConsumer paradigm.
 * <p>
 * Classes that implement this
 * interface must specify whether or not they allow in-place filtering--
 * filter operations where the source object is equal to the destination
 * object.
 * <p>
 * This interface cannot be used to describe more sophisticated operations
 * such as those that take multiple sources. Note that this restriction also
 * means that the values of the destination pixels prior to the operation are
 * not used as input to the filter operation.
 *
 * @see BufferedImage
 * @see BufferedImageFilter
 * @see AffineTransformOp
 * @see BandCombineOp
 * @see ColorConvertOp
 * @see ConvolveOp
 * @see LookupOp
 * @see RescaleOp
 */
export class BufferedImageOp {
}

$J.define(BufferedImageOp, 'java.awt.image.BufferedImageOp', { kind: 'interface', meths: { 'createCompatibleDestImage(java.awt.image.BufferedImage,java.awt.image.ColorModel)': 'createCompatibleDestImage$BufferedImage$ColorModel', 'getBounds2D(java.awt.image.BufferedImage)': 'getBounds2D$BufferedImage', 'filter(java.awt.image.BufferedImage,java.awt.image.BufferedImage)': 'filter$BufferedImage$BufferedImage' } });
