// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/accessibility/AccessibleAction.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
 * The {@code AccessibleAction} interface should be supported by any object that
 * can perform one or more actions. This interface provides the standard
 * mechanism for an assistive technology to determine what those actions are as
 * well as tell the object to perform them. Any object that can be manipulated
 * should support this interface. Applications can determine if an object
 * supports the {@code AccessibleAction} interface by first obtaining its
 * {@code AccessibleContext} (see {@link Accessible}) and then calling the
 * {@link AccessibleContext#getAccessibleAction} method. If the return value is
 * not {@code null}, the object supports this interface.
 *
 * @author Peter Korn
 * @author Hans Muller
 * @author Willie Walker
 * @author Lynn Monsanto
 * @see Accessible
 * @see Accessible#getAccessibleContext
 * @see AccessibleContext
 * @see AccessibleContext#getAccessibleAction
 */
export class AccessibleAction {
  /**
   * An action which causes a tree node to collapse if expanded and expand if
   * collapsed.
   *
   * @since 1.5
   */
  static TOGGLE_EXPAND: string = null;
  /**
   * An action which increments a value.
   *
   * @since 1.5
   */
  static INCREMENT: string = null;
  /**
   * An action which decrements a value.
   *
   * @since 1.5
   */
  static DECREMENT: string = null;
  /**
   * An action which causes a component to execute its default action.
   *
   * @since 1.6
   */
  static CLICK: string = null;
  /**
   * An action which causes a popup to become visible if it is hidden and
   * hidden if it is visible.
   *
   * @since 1.6
   */
  static TOGGLE_POPUP: string = null;
}

$J.define(AccessibleAction, 'javax.accessibility.AccessibleAction', { kind: 'interface' });
