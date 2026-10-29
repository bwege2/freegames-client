// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Transparency.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2013, Oracle and/or its affiliates. All rights reserved.
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
 * The {@code Transparency} interface defines the common transparency
 * modes for implementing classes.
 */
export class Transparency {
  /**
   * Represents image data that is guaranteed to be completely opaque,
   * meaning that all pixels have an alpha value of 1.0.
   */
  static readonly OPAQUE: number = 1;
  /**
   * Represents image data that is guaranteed to be either completely
   * opaque, with an alpha value of 1.0, or completely transparent,
   * with an alpha value of 0.0.
   */
  static readonly BITMASK: number = 2;
  /**
   * Represents image data that contains or might contain arbitrary
   * alpha values between and including 0.0 and 1.0.
   */
  static readonly TRANSLUCENT: number = 3;
}

$J.define(Transparency, 'java.awt.Transparency', { kind: 'interface' });
