// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/beans/BeanInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2012, Oracle and/or its affiliates. All rights reserved.
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
 * Use the {@code BeanInfo} interface
 * to create a {@code BeanInfo} class
 * and provide explicit information about the methods,
 * properties, events, and other features of your beans.
 * <p>
 * When developing your bean, you can implement
 * the bean features required for your application task
 * omitting the rest of the {@code BeanInfo} features.
 * They will be obtained through the automatic analysis
 * by using the low-level reflection of the bean methods
 * and applying standard design patterns.
 * You have an opportunity to provide additional bean information
 * through various descriptor classes.
 * <p>
 * See the {@link SimpleBeanInfo} class that is
 * a convenient basic class for {@code BeanInfo} classes.
 * You can override the methods and properties of
 * the {@code SimpleBeanInfo} class to define specific information.
 * <p>
 * See also the {@link Introspector} class to learn more about bean behavior.
 *
 * @since 1.1
 */
export class BeanInfo {
  /**
   * Constant to indicate a 16 x 16 color icon.
   */
  static readonly ICON_COLOR_16x16: number = 1;
  /**
   * Constant to indicate a 32 x 32 color icon.
   */
  static readonly ICON_COLOR_32x32: number = 2;
  /**
   * Constant to indicate a 16 x 16 monochrome icon.
   */
  static readonly ICON_MONO_16x16: number = 3;
  /**
   * Constant to indicate a 32 x 32 monochrome icon.
   */
  static readonly ICON_MONO_32x32: number = 4;
}

$J.define(BeanInfo, 'java.beans.BeanInfo', { kind: 'interface' });
