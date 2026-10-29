// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/TrayIcon.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, JObject } from '../../../jre/index.ts';

/**
 * A {@code TrayIcon} object represents a tray icon that can be
 * added to the {@link SystemTray system tray}. A
 * {@code TrayIcon} can have a tooltip (text), an image, a popup
 * menu, and a set of listeners associated with it.
 *
 * <p>A {@code TrayIcon} can generate various {@link MouseEvent
 * MouseEvents} and supports adding corresponding listeners to receive
 * notification of these events.  {@code TrayIcon} processes some
 * of the events by itself.  For example, by default, when the
 * right-mouse click is performed on the {@code TrayIcon} it
 * displays the specified popup menu.  When the mouse hovers
 * over the {@code TrayIcon} the tooltip is displayed (this behaviour is
 * platform dependent).
 *
 * <p><strong>Note:</strong> When the {@code MouseEvent} is
 * dispatched to its registered listeners its {@code component}
 * property will be set to {@code null}.  (See {@link
 * java.awt.event.ComponentEvent#getComponent}) The
 * {@code source} property will be set to this
 * {@code TrayIcon}. (See {@link
 * java.util.EventObject#getSource})
 *
 * <p><b>Note:</b> A well-behaved {@link TrayIcon} implementation
 * will assign different gestures to showing a popup menu and
 * selecting a tray icon.
 *
 * <p>A {@code TrayIcon} can generate an {@link ActionEvent
 * ActionEvent}.  On some platforms, this occurs when the user selects
 * the tray icon using either the mouse or keyboard.
 *
 * <p>If a SecurityManager is installed, the AWTPermission
 * {@code accessSystemTray} must be granted in order to create
 * a {@code TrayIcon}. Otherwise the constructor will throw a
 * SecurityException.
 *
 * <p> See the {@link SystemTray} class overview for an example on how
 * to use the {@code TrayIcon} API.
 *
 * @implNote
 * When the {@systemProperty apple.awt.enableTemplateImages} property is
 * set, all images associated with instances of this class are treated
 * as template images by the native desktop system. This means all color
 * information is discarded, and the image is adapted automatically to
 * be visible when desktop theme and/or colors change. This property
 * only affects MacOSX.
 *
 * @since 1.6
 * @see SystemTray#add
 * @see java.awt.event.ComponentEvent#getComponent
 * @see java.util.EventObject#getSource
 *
 * @author Bino George
 * @author Denis Mikhalkin
 * @author Sharon Zakhour
 * @author Anton Tarasov
 */
export class TrayIcon extends JObject {
  image: Image = null;
  tooltip: string = null;
  popup: PopupMenu = null;
  autosize: boolean = false;
  id_: number = 0;
  actionCommand: string = null;
  peer: TrayIconPeer = null;
  mouseListener: MouseListener = null;
  mouseMotionListener: MouseMotionListener = null;
  actionListener: ActionListener = null;
  acc: AccessControlContext = null;
  $init_TrayIcon() {
    this.acc = AccessController.getContext();
  }
}

$J.define(TrayIcon, 'java.awt.TrayIcon', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Image,java.lang.String,java.awt.PopupMenu': '_TrayIcon$Image$String$PopupMenu', 'java.awt.Image,java.lang.String': '_TrayIcon$Image$String', 'java.awt.Image': '_TrayIcon$Image', '': '_TrayIcon$' } });
