// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/EmbeddedFrame.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Applet } from '../../../jre/index.ts';
import { Frame } from '../../java/awt/Frame.ts';

/**
 * A generic container used for embedding Java components, usually applets.
 * An EmbeddedFrame has two related uses:
 *
 * . Within a Java-based application, an EmbeddedFrame serves as a sort of
 *   firewall, preventing the contained components or applets from using
 *   getParent() to find parent components, such as menubars.
 *
 * . Within a C-based application, an EmbeddedFrame contains a window handle
 *   which was created by the application, which serves as the top-level
 *   Java window.  EmbeddedFrames created for this purpose are passed-in a
 *   handle of an existing window created by the application.  The window
 *   handle should be of the appropriate native type for a specific
 *   platform, as stored in the pData field of the ComponentPeer.
 *
 * @author      Thomas Ball
 */
export class EmbeddedFrame extends Frame {
  isCursorAllowed_: boolean = false;
  supportsXEmbed_: boolean = false;
  appletKFM: KeyboardFocusManager = null;
  static readonly FORWARD: boolean = true;
  static readonly BACKWARD: boolean = false;
  $init_EmbeddedFrame() {
    this.isCursorAllowed_ = true;
    this.supportsXEmbed_ = false;
  }
  /**
   * Checks if the component is in an EmbeddedFrame. If so,
   * returns the applet found in the hierarchy or null if
   * not found.
   * @return the parent applet or {@code null}
   * @since 1.6
   *
   * @deprecated The Applet API is deprecated. See the
   * <a href="../../java/applet/package-summary.html"> java.applet package
   * documentation</a> for further information.
   */
  static getAppletIfAncestorOf(comp: Component): Applet {
    let parent = comp.getParent();
    let applet = null;
    while (parent != null && !(parent instanceof EmbeddedFrame)) {
      if ($J.isa(parent, Applet)) {
        applet = parent;
      }
      parent = parent.getParent();
    }
    return parent == null ? null : applet;
  }
}

$J.define(EmbeddedFrame, 'sun.awt.EmbeddedFrame', { kind: 'class', ifaces: ['java.awt.KeyEventDispatcher', 'java.beans.PropertyChangeListener'], sup: 'java.awt.Frame', ctors: { 'long,boolean': '_EmbeddedFrame$long$boolean', 'long': '_EmbeddedFrame$long', 'int': '_EmbeddedFrame$int', '': '_EmbeddedFrame$', 'boolean': '_EmbeddedFrame$boolean' }, meths: { 'remove(java.awt.MenuComponent)': 'remove$MenuComponent', 'setMenuBar(java.awt.MenuBar)': 'setMenuBar$MenuBar', 'show()': 'show$' } });
