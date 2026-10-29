// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/IllegalComponentStateException.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, IllegalStateException } from '../../../jre/index.ts';

/**
 * Signals that an AWT component is not in an appropriate state for
 * the requested operation.
 *
 * @author      Jonni Kanerva
 */
export class IllegalComponentStateException extends IllegalStateException {
  /**
   * Constructs an IllegalComponentStateException with the specified detail
   * message.  A detail message is a String that describes this particular
   * exception.
   * @param s the String that contains a detailed message
   */
  _IllegalComponentStateException$String(s: string): this {
    this._IllegalStateException(s);
    return this;
  }
}

$J.define(IllegalComponentStateException, 'java.awt.IllegalComponentStateException', { kind: 'class', sup: 'java.lang.IllegalStateException', ctors: { 'java.lang.String': '_IllegalComponentStateException$String', '': '_IllegalComponentStateException$' } });
