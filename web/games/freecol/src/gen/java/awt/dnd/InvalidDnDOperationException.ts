// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/InvalidDnDOperationException.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalStateException } from '../../../../jre/index.ts';

/**
 * This exception is thrown by various methods in the java.awt.dnd package.
 * It is usually thrown to indicate that the target in question is unable
 * to undertake the requested operation that the present time, since the
 * underlying DnD system is not in the appropriate state.
 *
 * @since 1.2
 */
export class InvalidDnDOperationException extends IllegalStateException {
  static dft_msg: string = null;
  /**
   * Create a default Exception
   */
  _InvalidDnDOperationException$(): this {
    this._IllegalStateException(InvalidDnDOperationException.dft_msg);
    return this;
  }
  static $clinit() {
    InvalidDnDOperationException.dft_msg = 'The operation requested cannot be performed by the DnD system since it is not in the appropriate state';
  }
}

$J.define(InvalidDnDOperationException, 'java.awt.dnd.InvalidDnDOperationException', { kind: 'class', sup: 'java.lang.IllegalStateException', ctors: { 'java.lang.String': '_InvalidDnDOperationException$String', '': '_InvalidDnDOperationException$' }, clinit: true, lazy: ['dft_msg'] });
