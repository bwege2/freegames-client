// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/DefaultFocusTraversalPolicy.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { ContainerOrderFocusTraversalPolicy } from './ContainerOrderFocusTraversalPolicy.ts';

let Window;

/**
 * A FocusTraversalPolicy that determines traversal order based on the order
 * of child Components in a Container. From a particular focus cycle root, the
 * policy makes a pre-order traversal of the Component hierarchy, and traverses
 * a Container's children according to the ordering of the array returned by
 * {@code Container.getComponents()}. Portions of the hierarchy that are
 * not visible and displayable will not be searched.
 * <p>
 * If client code has explicitly set the focusability of a Component by either
 * overriding {@code Component.isFocusTraversable()} or
 * {@code Component.isFocusable()}, or by calling
 * {@code Component.setFocusable()}, then a DefaultFocusTraversalPolicy
 * behaves exactly like a ContainerOrderFocusTraversalPolicy. If, however, the
 * Component is relying on default focusability, then a
 * DefaultFocusTraversalPolicy will reject all Components with non-focusable
 * peers. This is the default FocusTraversalPolicy for all AWT Containers.
 * <p>
 * The focusability of a peer is implementation-dependent. Sun recommends that
 * all implementations for a particular native platform construct peers with
 * the same focusability. The recommendations for Windows and Unix are that
 * Canvases, Labels, Panels, Scrollbars, ScrollPanes, Windows, and lightweight
 * Components have non-focusable peers, and all other Components have focusable
 * peers. These recommendations are used in the Sun AWT implementations. Note
 * that the focusability of a Component's peer is different from, and does not
 * impact, the focusability of the Component itself.
 * <p>
 * Please see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/misc/focus.html">
 * How to Use the Focus Subsystem</a>,
 * a section in <em>The Java Tutorial</em>, and the
 * <a href="doc-files/FocusSpec.html">Focus Specification</a>
 * for more information.
 *
 * @author David Mendenhall
 *
 * @see Container#getComponents
 * @see Component#isFocusable
 * @see Component#setFocusable
 * @since 1.4
 */
export class DefaultFocusTraversalPolicy extends ContainerOrderFocusTraversalPolicy {
  /**
   * Constructs a {@code DefaultFocusTraversalPolicy}.
   */
  _DefaultFocusTraversalPolicy(): this {
    this._ContainerOrderFocusTraversalPolicy();
    return this;
  }
  /**
   * Determines whether a Component is an acceptable choice as the new
   * focus owner. The Component must be visible, displayable, and enabled
   * to be accepted. If client code has explicitly set the focusability
   * of the Component by either overriding
   * {@code Component.isFocusTraversable()} or
   * {@code Component.isFocusable()}, or by calling
   * {@code Component.setFocusable()}, then the Component will be
   * accepted if and only if it is focusable. If, however, the Component is
   * relying on default focusability, then all Canvases, Labels, Panels,
   * Scrollbars, ScrollPanes, Windows, and lightweight Components will be
   * rejected.
   *
   * @param aComponent the Component whose fitness as a focus owner is to
   *        be tested
   * @return {@code true} if aComponent meets the above requirements;
   *         {@code false} otherwise
   */
  accept(aComponent: Component): boolean {
    if (!(aComponent.isVisible$() && aComponent.isDisplayable() && aComponent.isEnabled())) {
      return false;
    }
    if (!(aComponent instanceof Window)) {
      for (let enableTest = aComponent.getParent(); enableTest != null; enableTest = enableTest.getParent()) {
        if (!(enableTest.isEnabled() || enableTest.isLightweight())) {
          return false;
        }
        if (enableTest instanceof Window) {
          break;
        }
      }
    }
    let focusable = aComponent.isFocusable();
    if (aComponent.isFocusTraversableOverridden()) {
      return focusable;
    }
    let peer = aComponent.peer;
    return (peer != null && peer.isFocusable());
  }
}

$J.define(DefaultFocusTraversalPolicy, 'java.awt.DefaultFocusTraversalPolicy', { kind: 'class', sup: 'java.awt.ContainerOrderFocusTraversalPolicy', ctors: { '': '_DefaultFocusTraversalPolicy' } });
$J.module(() => {
  Window = $J.load('java.awt.Window');
});
