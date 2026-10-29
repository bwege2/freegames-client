// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/AWTPermissions.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2013, Oracle and/or its affiliates. All rights reserved.
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

let AWTPermission;

/**
 * Defines the {@code AWTPermission} objects used for permission checks.
 */
export class AWTPermissions extends JObject {
  static TOPLEVEL_WINDOW_PERMISSION: AWTPermission = null;
  static ACCESS_CLIPBOARD_PERMISSION: AWTPermission = null;
  static CHECK_AWT_EVENTQUEUE_PERMISSION: AWTPermission = null;
  static TOOLKIT_MODALITY_PERMISSION: AWTPermission = null;
  static READ_DISPLAY_PIXELS_PERMISSION: AWTPermission = null;
  static CREATE_ROBOT_PERMISSION: AWTPermission = null;
  static WATCH_MOUSE_PERMISSION: AWTPermission = null;
  static SET_WINDOW_ALWAYS_ON_TOP_PERMISSION: AWTPermission = null;
  static ALL_AWT_EVENTS_PERMISSION: AWTPermission = null;
  static ACCESS_SYSTEM_TRAY_PERMISSION: AWTPermission = null;
  static $clinit() {
    AWTPermissions.TOPLEVEL_WINDOW_PERMISSION = new AWTPermission()._AWTPermission$String('showWindowWithoutWarningBanner');
    AWTPermissions.ACCESS_CLIPBOARD_PERMISSION = new AWTPermission()._AWTPermission$String('accessClipboard');
    AWTPermissions.CHECK_AWT_EVENTQUEUE_PERMISSION = new AWTPermission()._AWTPermission$String('accessEventQueue');
    AWTPermissions.TOOLKIT_MODALITY_PERMISSION = new AWTPermission()._AWTPermission$String('toolkitModality');
    AWTPermissions.READ_DISPLAY_PIXELS_PERMISSION = new AWTPermission()._AWTPermission$String('readDisplayPixels');
    AWTPermissions.CREATE_ROBOT_PERMISSION = new AWTPermission()._AWTPermission$String('createRobot');
    AWTPermissions.WATCH_MOUSE_PERMISSION = new AWTPermission()._AWTPermission$String('watchMousePointer');
    AWTPermissions.SET_WINDOW_ALWAYS_ON_TOP_PERMISSION = new AWTPermission()._AWTPermission$String('setWindowAlwaysOnTop');
    AWTPermissions.ALL_AWT_EVENTS_PERMISSION = new AWTPermission()._AWTPermission$String('listenToAllAWTEvents');
    AWTPermissions.ACCESS_SYSTEM_TRAY_PERMISSION = new AWTPermission()._AWTPermission$String('accessSystemTray');
  }
}

$J.define(AWTPermissions, 'sun.awt.AWTPermissions', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_AWTPermissions' }, clinit: true, lazy: ['TOPLEVEL_WINDOW_PERMISSION', 'ACCESS_CLIPBOARD_PERMISSION', 'CHECK_AWT_EVENTQUEUE_PERMISSION', 'TOOLKIT_MODALITY_PERMISSION', 'READ_DISPLAY_PIXELS_PERMISSION', 'CREATE_ROBOT_PERMISSION', 'WATCH_MOUSE_PERMISSION', 'SET_WINDOW_ALWAYS_ON_TOP_PERMISSION', 'ALL_AWT_EVENTS_PERMISSION', 'ACCESS_SYSTEM_TRAY_PERMISSION'] });
$J.module(() => {
  AWTPermission = $J.load('java.awt.AWTPermission');
});
