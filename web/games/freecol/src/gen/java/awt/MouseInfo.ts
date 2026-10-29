// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/MouseInfo.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, Toolkit } from '../../../jre/index.ts';

let GraphicsEnvironment, HeadlessException, Point, PointerInfo, AWTPermissions, ComponentFactory;

/**
 * {@code MouseInfo}  provides methods for getting information about the mouse,
 * such as mouse pointer location and the number of mouse buttons.
 *
 * @author     Roman Poborchiy
 * @since 1.5
 */
export class MouseInfo extends JObject {
  /**
   * Returns a {@code PointerInfo} instance that represents the current
   * location of the mouse pointer.
   * The {@code GraphicsDevice} stored in this {@code PointerInfo}
   * contains the mouse pointer. The coordinate system used for the mouse position
   * depends on whether or not the {@code GraphicsDevice} is part of a virtual
   * screen device.
   * For virtual screen devices, the coordinates are given in the virtual
   * coordinate system, otherwise they are returned in the coordinate system
   * of the {@code GraphicsDevice}. See {@link GraphicsConfiguration}
   * for more information about the virtual screen devices.
   * On systems without a mouse, returns {@code null}.
   * <p>
   * If there is a security manager, its {@code checkPermission} method
   * is called with an {@code AWTPermission("watchMousePointer")}
   * permission before creating and returning a {@code PointerInfo}
   * object. This may result in a {@code SecurityException}.
   *
   * @throws HeadlessException if GraphicsEnvironment.isHeadless() returns true
   * @throws SecurityException if a security manager exists and its
   *            {@code checkPermission} method doesn't allow the operation
   * @see       GraphicsConfiguration
   * @see       SecurityManager#checkPermission
   * @see       java.awt.AWTPermission
   * @return    location of the mouse pointer
   * @since     1.5
   */
  static getPointerInfo(): PointerInfo {
    if (GraphicsEnvironment.isHeadless()) {
      throw new HeadlessException()._HeadlessException$();
    }
    let security = $J.system_getSecurityManager();
    if (security != null) {
      security.checkPermission(AWTPermissions.WATCH_MOUSE_PERMISSION);
    }
    let toolkit = Toolkit.getDefaultToolkit();
    let point = new Point()._Point$int$int(0, 0);
    let deviceNum = 0;
    if ($J.isa(toolkit, ComponentFactory)) {
      deviceNum = (toolkit).getMouseInfoPeer().fillPointWithCoords(point);
    }
    let gds = GraphicsEnvironment.getLocalGraphicsEnvironment().getScreenDevices();
    let retval = null;
    if (MouseInfo.areScreenDevicesIndependent(gds)) {
      retval = new PointerInfo()._PointerInfo(gds[deviceNum], point);
    } else {
      for (let i = 0; i < gds.length; i++) {
        let gc = gds[i].getDefaultConfiguration();
        let bounds = gc.getBounds();
        if (bounds.contains$Point(point)) {
          retval = new PointerInfo()._PointerInfo(gds[i], point);
        }
      }
    }
    return retval;
  }
  static areScreenDevicesIndependent(gds: GraphicsDevice[]): boolean {
    for (let i = 0; i < gds.length; i++) {
      let bounds = gds[i].getDefaultConfiguration().getBounds();
      if (bounds.x_ !== 0 || bounds.y_ !== 0) {
        return false;
      }
    }
    return true;
  }
}

$J.define(MouseInfo, 'java.awt.MouseInfo', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MouseInfo' } });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  HeadlessException = $J.load('java.awt.HeadlessException');
  Point = $J.load('java.awt.Point');
  PointerInfo = $J.load('java.awt.PointerInfo');
  AWTPermissions = $J.load('sun.awt.AWTPermissions');
  ComponentFactory = $J.load('sun.awt.ComponentFactory');
});
