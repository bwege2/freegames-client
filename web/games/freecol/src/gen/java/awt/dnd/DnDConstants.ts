// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DnDConstants.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../jre/index.ts';

/**
 * This class contains constant values representing
 * the type of action(s) to be performed by a Drag and Drop operation.
 * @since 1.2
 */
export class DnDConstants extends JObject {
  /**
   * An {@code int} representing no action.
   */
  static readonly ACTION_NONE: number = 0;
  /**
   * An {@code int} representing a "copy" action.
   */
  static readonly ACTION_COPY: number = 1;
  /**
   * An {@code int} representing a "move" action.
   */
  static readonly ACTION_MOVE: number = 2;
  /**
   * An {@code int} representing a "copy" or
   * "move" action.
   */
  static readonly ACTION_COPY_OR_MOVE: number = 3;
  /**
   * An {@code int} representing a "link" action.
   *
   * The link verb is found in many, if not all native DnD platforms, and the
   * actual interpretation of LINK semantics is both platform
   * and application dependent. Broadly speaking, the
   * semantic is "do not copy, or move the operand, but create a reference
   * to it". Defining the meaning of "reference" is where ambiguity is
   * introduced.
   *
   * The verb is provided for completeness, but its use is not recommended
   * for DnD operations between logically distinct applications where
   * misinterpretation of the operations semantics could lead to confusing
   * results for the user.
   */
  static readonly ACTION_LINK: number = 1073741824;
  /**
   * An {@code int} representing a "reference"
   * action (synonym for ACTION_LINK).
   */
  static readonly ACTION_REFERENCE: number = 1073741824;
}

$J.define(DnDConstants, 'java.awt.dnd.DnDConstants', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_DnDConstants' } });
