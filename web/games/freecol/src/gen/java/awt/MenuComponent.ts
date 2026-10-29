// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/MenuComponent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2022, Oracle and/or its affiliates. All rights reserved.
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
 * The abstract class {@code MenuComponent} is the superclass
 * of all menu-related components. In this respect, the class
 * {@code MenuComponent} is analogous to the abstract superclass
 * {@code Component} for AWT components.
 * <p>
 * Menu components receive and process AWT events, just as components do,
 * through the method {@code processEvent}.
 *
 * @author      Arthur van Hoff
 * @since       1.0
 */
export class MenuComponent extends JObject {
  peer: MenuComponentPeer = null;
  parent: MenuContainer = null;
  /**
   * The {@code AppContext} of the {@code MenuComponent}.
   * This is set in the constructor and never changes.
   */
  appContext: AppContext = null;
  /**
   * The menu component's font. This value can be
   * {@code null} at which point a default will be used.
   * This defaults to {@code null}.
   *
   * @serial
   * @see #setFont(Font)
   * @see #getFont()
   */
  font: Font = null;
  /**
   * The menu component's name, which defaults to {@code null}.
   * @serial
   * @see #getName()
   * @see #setName(String)
   */
  name: string = null;
  /**
   * A variable to indicate whether a name is explicitly set.
   * If {@code true} the name will be set explicitly.
   * This defaults to {@code false}.
   * @serial
   * @see #setName(String)
   */
  nameExplicitlySet: boolean = false;
  /**
   * Defaults to {@code false}.
   * @serial
   * @see #dispatchEvent(AWTEvent)
   */
  newEventsOnly: boolean = false;
  acc: AccessControlContext = null;
  static readonly actionListenerK: string = 'actionL';
  static readonly itemListenerK: string = 'itemL';
  /**
   * MenuComponent will contain all of the methods in interface Accessible,
   * though it won't actually implement the interface - that will be up
   * to the individual objects which extend MenuComponent.
   */
  accessibleContext: AccessibleContext = null;
}

$J.define(MenuComponent, 'java.awt.MenuComponent', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MenuComponent' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$MenuComponent' } });
