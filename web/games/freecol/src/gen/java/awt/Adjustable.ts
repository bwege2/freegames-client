// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Adjustable.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1996, 2013, Oracle and/or its affiliates. All rights reserved.
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
 * The interface for objects which have an adjustable numeric value
 * contained within a bounded range of values.
 *
 * @author Amy Fowler
 * @author Tim Prinzing
 */
export class Adjustable {
  /**
   * Indicates that the {@code Adjustable} has horizontal orientation.
   */
  static readonly HORIZONTAL: number = 0;
  /**
   * Indicates that the {@code Adjustable} has vertical orientation.
   */
  static readonly VERTICAL: number = 1;
  /**
   * Indicates that the {@code Adjustable} has no orientation.
   */
  static readonly NO_ORIENTATION: number = 2;
}

$J.define(Adjustable, 'java.awt.Adjustable', { kind: 'interface', meths: { 'getBlockIncrement()': 'getBlockIncrement$', 'getUnitIncrement()': 'getUnitIncrement$' } });
