// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/PointerInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../jre/index.ts';

/**
 * A class that describes the pointer position.
 * It provides the {@code GraphicsDevice} where the pointer is and
 * the {@code Point} that represents the coordinates of the pointer.
 * <p>
 * Instances of this class should be obtained via
 * {@link MouseInfo#getPointerInfo}.
 * The {@code PointerInfo} instance is not updated dynamically as the mouse
 * moves. To get the updated location, you must call
 * {@link MouseInfo#getPointerInfo} again.
 *
 * @see MouseInfo#getPointerInfo
 * @author Roman Poborchiy
 * @since 1.5
 */
export class PointerInfo extends JObject {
  device: GraphicsDevice = null;
  location_: Point = null;
  /**
   * Package-private constructor to prevent instantiation.
   */
  _PointerInfo(device: GraphicsDevice, location: Point): this {
    this.device = device;
    this.location_ = location;
    return this;
  }
  /**
   * Returns the {@code GraphicsDevice} where the mouse pointer was at the
   * moment this {@code PointerInfo} was created.
   *
   * @return {@code GraphicsDevice} corresponding to the pointer
   * @since 1.5
   */
  getDevice(): GraphicsDevice {
    return this.device;
  }
  /**
   * Returns the {@code Point} that represents the coordinates of the pointer
   * on the screen. See {@link MouseInfo#getPointerInfo} for more information
   * about coordinate calculation for multiscreen systems.
   *
   * @return coordinates of mouse pointer
   * @see MouseInfo
   * @see MouseInfo#getPointerInfo
   * @since 1.5
   */
  getLocation(): Point {
    return this.location_;
  }
}

$J.define(PointerInfo, 'java.awt.PointerInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.GraphicsDevice,java.awt.Point': '_PointerInfo' } });
