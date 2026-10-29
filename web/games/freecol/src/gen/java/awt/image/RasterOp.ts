// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/image/RasterOp.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2000, Oracle and/or its affiliates. All rights reserved.
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
 * operations performed on Raster objects.  It is implemented by such
 * classes as AffineTransformOp, ConvolveOp, and LookupOp.  The Source
 * and Destination objects must contain the appropriate number
 * of bands for the particular classes implementing this interface.
 * Otherwise, an exception is thrown.  This interface cannot be used to
 * describe more sophisticated Ops such as ones that take multiple sources.
 * Each class implementing this interface will specify whether or not it
 * will allow an in-place filtering operation (i.e. source object equal
 * to the destination object).  Note that the restriction to single-input
 * operations means that the values of destination pixels prior to the
 * operation are not used as input to the filter operation.
 * @see AffineTransformOp
 * @see BandCombineOp
 * @see ColorConvertOp
 * @see ConvolveOp
 * @see LookupOp
 * @see RescaleOp
 */
export class RasterOp {
}

$J.define(RasterOp, 'java.awt.image.RasterOp', { kind: 'interface', meths: { 'getBounds2D(java.awt.image.Raster)': 'getBounds2D$Raster', 'filter(java.awt.image.Raster,java.awt.image.WritableRaster)': 'filter$Raster$WritableRaster' } });
