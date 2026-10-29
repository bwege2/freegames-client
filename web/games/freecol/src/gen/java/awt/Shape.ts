// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Shape.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../jre/index.ts';

/**
 * The {@code Shape} interface provides definitions for objects
 * that represent some form of geometric shape.  The {@code Shape}
 * is described by a {@link PathIterator} object, which can express the
 * outline of the {@code Shape} as well as a rule for determining
 * how the outline divides the 2D plane into interior and exterior
 * points.  Each {@code Shape} object provides callbacks to get the
 * bounding box of the geometry, determine whether points or
 * rectangles lie partly or entirely within the interior
 * of the {@code Shape}, and retrieve a {@code PathIterator}
 * object that describes the trajectory path of the {@code Shape}
 * outline.
 * <p>
 * <a id="def_insideness"><b>Definition of insideness:</b></a>
 * A point is considered to lie inside a
 * {@code Shape} if and only if:
 * <ul>
 * <li> it lies completely
 * inside the {@code Shape} boundary <i>or</i>
 * <li>
 * it lies exactly on the {@code Shape} boundary <i>and</i> the
 * space immediately adjacent to the
 * point in the increasing {@code X} direction is
 * entirely inside the boundary <i>or</i>
 * <li>
 * it lies exactly on a horizontal boundary segment <b>and</b> the
 * space immediately adjacent to the point in the
 * increasing {@code Y} direction is inside the boundary.
 * </ul>
 * <p>The {@code contains} and {@code intersects} methods
 * consider the interior of a {@code Shape} to be the area it
 * encloses as if it were filled.  This means that these methods
 * consider
 * unclosed shapes to be implicitly closed for the purpose of
 * determining if a shape contains or intersects a rectangle or if a
 * shape contains a point.
 *
 * @see java.awt.geom.PathIterator
 * @see java.awt.geom.AffineTransform
 * @see java.awt.geom.FlatteningPathIterator
 * @see java.awt.geom.GeneralPath
 *
 * @author Jim Graham
 * @since 1.2
 */
export class Shape {
}

$J.define(Shape, 'java.awt.Shape', { kind: 'interface', meths: { 'getPathIterator(java.awt.geom.AffineTransform,double)': 'getPathIterator$AffineTransform$double', 'getPathIterator(java.awt.geom.AffineTransform)': 'getPathIterator$AffineTransform', 'contains(java.awt.geom.Rectangle2D)': 'contains$Rectangle2D', 'contains(double,double,double,double)': 'contains$double$double$double$double', 'intersects(java.awt.geom.Rectangle2D)': 'intersects$Rectangle2D', 'intersects(double,double,double,double)': 'intersects$double$double$double$double', 'contains(java.awt.geom.Point2D)': 'contains$Point2D', 'contains(double,double)': 'contains$double$double' } });
