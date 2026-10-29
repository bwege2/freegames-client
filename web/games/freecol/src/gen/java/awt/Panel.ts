// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Panel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { Container } from './Container.ts';
import { Container$AccessibleAWTContainer } from './Container.ts';

/**
 * {@code Panel} is the simplest container class. A panel
 * provides space in which an application can attach any other
 * component, including other panels.
 * <p>
 * The default layout manager for a panel is the
 * {@code FlowLayout} layout manager.
 *
 * @author      Sami Shaio
 * @see     java.awt.FlowLayout
 * @since   1.0
 */
export class Panel extends Container {
  static readonly base: string = 'panel';
  static nameCounter: number = 0;
  /**
   * Creates a new panel with the specified layout manager.
   * @param layout the layout manager for this panel.
   * @since 1.1
   */
  _Panel$LayoutManager(layout: LayoutManager): this {
    this._Container();
    this.setLayout(layout);
    return this;
  }
  /**
   * Construct a name for this component.  Called by getName() when the
   * name is null.
   */
  constructComponentName(): string {
    {
      return Panel.base + Panel.nameCounter++;
    }
  }
  /**
   * Creates the Panel's peer.  The peer allows you to modify the
   * appearance of the panel without changing its functionality.
   */
  addNotify(): void {
    {
      if (this.peer == null) {
        this.peer = this.getComponentFactory().createPanel(this);
      }
      super.addNotify();
    }
  }
  /**
   * Gets the AccessibleContext associated with this Panel.
   * For panels, the AccessibleContext takes the form of an
   * AccessibleAWTPanel.
   * A new AccessibleAWTPanel instance is created if necessary.
   *
   * @return an AccessibleAWTPanel that serves as the
   *         AccessibleContext of this Panel
   * @since 1.3
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new Panel$AccessibleAWTPanel().$o(this)._Panel$AccessibleAWTPanel();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    Panel.nameCounter = 0;
  }
}

/**
 * This class implements accessibility support for the
 * {@code Panel} class.  It provides an implementation of the
 * Java Accessibility API appropriate to panel user-interface elements.
 * @since 1.3
 */
export class Panel$AccessibleAWTPanel extends Container$AccessibleAWTContainer {
  /**
   * Constructs an {@code AccessibleAWTPanel}.
   */
  _Panel$AccessibleAWTPanel(): this {
    this._Container$AccessibleAWTContainer();
    return this;
  }
}

$J.define(Panel, 'java.awt.Panel', { kind: 'class', ifaces: ['javax.accessibility.Accessible'], sup: 'java.awt.Container', ctors: { 'java.awt.LayoutManager': '_Panel$LayoutManager', '': '_Panel$' }, clinit: true, lazy: ['nameCounter'] });
$J.define(Panel$AccessibleAWTPanel, 'java.awt.Panel$AccessibleAWTPanel', { kind: 'class', sup: 'java.awt.Container$AccessibleAWTContainer', ctors: { '': '_Panel$AccessibleAWTPanel' }, meths: { 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
