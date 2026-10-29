// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/SwingPaintEventDispatcher.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, AccessController, GetBooleanAction, GetPropertyAction, SunToolkit } from '../../../jre/index.ts';
import { PaintEventDispatcher } from '../../sun/awt/PaintEventDispatcher.ts';

let Rectangle, PaintEvent, RepaintManager, RootPaneContainer, SwingHeavyWeight, IgnorePaintEvent;

/**
 * Swing's PaintEventDispatcher.  If the component specified by the PaintEvent
 * is a top level Swing component (JFrame, JWindow, JDialog, JApplet), this
 * will forward the request to the RepaintManager for eventual painting.
 */
export class SwingPaintEventDispatcher extends PaintEventDispatcher {
  static SHOW_FROM_DOUBLE_BUFFER: boolean = false;
  static ERASE_BACKGROUND: boolean = false;
  _SwingPaintEventDispatcher(): this {
    this._PaintEventDispatcher();
    return this;
  }
  createPaintEvent(component: Component, x: number, y: number, w: number, h: number): PaintEvent {
    if ($J.isa(component, RootPaneContainer)) {
      let appContext = SunToolkit.targetToAppContext(component);
      let rm = RepaintManager.currentManager$AppContext(appContext);
      if (!SwingPaintEventDispatcher.SHOW_FROM_DOUBLE_BUFFER || !rm.show(component, x, y, w, h)) {
        rm.nativeAddDirtyRegion(appContext, component, x, y, w, h);
      }
      return new IgnorePaintEvent()._IgnorePaintEvent(component, PaintEvent.PAINT, new Rectangle()._Rectangle$int$int$int$int(x, y, w, h));
    } else if ($J.isa(component, SwingHeavyWeight)) {
      let appContext = SunToolkit.targetToAppContext(component);
      let rm = RepaintManager.currentManager$AppContext(appContext);
      rm.nativeAddDirtyRegion(appContext, component, x, y, w, h);
      return new IgnorePaintEvent()._IgnorePaintEvent(component, PaintEvent.PAINT, new Rectangle()._Rectangle$int$int$int$int(x, y, w, h));
    }
    return super.createPaintEvent(component, x, y, w, h);
  }
  static $clinit() {
    SwingPaintEventDispatcher.SHOW_FROM_DOUBLE_BUFFER = $J.equals('true', AccessController.doPrivileged(new GetPropertyAction('swing.showFromDoubleBuffer', 'true')));
    SwingPaintEventDispatcher.ERASE_BACKGROUND = AccessController.doPrivileged(new GetBooleanAction('swing.nativeErase'));
  }
}

$J.define(SwingPaintEventDispatcher, 'javax.swing.SwingPaintEventDispatcher', { kind: 'class', sup: 'sun.awt.PaintEventDispatcher', ctors: { '': '_SwingPaintEventDispatcher' }, clinit: true, lazy: ['SHOW_FROM_DOUBLE_BUFFER', 'ERASE_BACKGROUND'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  PaintEvent = $J.load('java.awt.event.PaintEvent');
  RepaintManager = $J.load('javax.swing.RepaintManager');
  RootPaneContainer = $J.load('javax.swing.RootPaneContainer');
  SwingHeavyWeight = $J.load('javax.swing.SwingHeavyWeight');
  IgnorePaintEvent = $J.load('sun.awt.event.IgnorePaintEvent');
});
