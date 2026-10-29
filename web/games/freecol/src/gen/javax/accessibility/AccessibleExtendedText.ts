// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleExtendedText.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2017, Oracle and/or its affiliates. All rights reserved.
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
 * The {@code AccessibleExtendedText} interface contains additional methods not
 * provided by the {@code AccessibleText} interface.
 * <p>
 * Applications can determine if an object supports the
 * {@code AccessibleExtendedText} interface by first obtaining its
 * {@code AccessibleContext} (see {@link Accessible}) and then calling the
 * {@link AccessibleContext#getAccessibleText} method of
 * {@code AccessibleContext}. If the return value is an instance of
 * {@code AccessibleExtendedText}, the object supports this interface.
 *
 * @author Peter Korn
 * @author Lynn Monsanto
 * @see Accessible
 * @see Accessible#getAccessibleContext
 * @see AccessibleContext
 * @see AccessibleContext#getAccessibleText
 * @since 1.5
 */
export class AccessibleExtendedText {
  /**
   * Constant used to indicate that the part of the text that should be
   * retrieved is a line of text.
   *
   * @see AccessibleText#getAtIndex
   * @see AccessibleText#getAfterIndex
   * @see AccessibleText#getBeforeIndex
   */
  static readonly LINE: number = 4;
  /**
   * Constant used to indicate that the part of the text that should be
   * retrieved is contiguous text with the same text attributes.
   *
   * @see AccessibleText#getAtIndex
   * @see AccessibleText#getAfterIndex
   * @see AccessibleText#getBeforeIndex
   */
  static readonly ATTRIBUTE_RUN: number = 5;
}

$J.define(AccessibleExtendedText, 'javax.accessibility.AccessibleExtendedText', { kind: 'interface' });
