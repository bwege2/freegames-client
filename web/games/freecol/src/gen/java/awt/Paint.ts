// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Paint.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2008, Oracle and/or its affiliates. All rights reserved.
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
 * This {@code Paint} interface defines how color patterns
 * can be generated for {@link Graphics2D} operations.  A class
 * implementing the {@code Paint} interface is added to the
 * {@code Graphics2D} context in order to define the color
 * pattern used by the {@code draw} and {@code fill} methods.
 * <p>
 * Instances of classes implementing {@code Paint} must be
 * read-only because the {@code Graphics2D} does not clone
 * these objects when they are set as an attribute with the
 * {@code setPaint} method or when the {@code Graphics2D}
 * object is itself cloned.
 * @see PaintContext
 * @see Color
 * @see GradientPaint
 * @see TexturePaint
 * @see Graphics2D#setPaint
 * @version 1.36, 06/05/07
 */
export class Paint {
}

$J.define(Paint, 'java.awt.Paint', { kind: 'interface', ifaces: ['java.awt.Transparency'] });
