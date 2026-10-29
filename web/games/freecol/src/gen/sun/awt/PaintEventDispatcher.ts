// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/PaintEventDispatcher.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2005, 2011, Oracle and/or its affiliates. All rights reserved.
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

let Rectangle, PaintEvent;

/**
 * PaintEventDispatcher is responsible for dispatching PaintEvents.  There
 * can be only one PaintEventDispatcher active at a particular time.
 */
export class PaintEventDispatcher extends JObject {
  /**
   * Singleton dispatcher.
   */
  static dispatcher: PaintEventDispatcher = null;
  _PaintEventDispatcher(): this {
    return this;
  }
  /**
   * Sets the current {@code PaintEventDispatcher}.
   *
   * @param dispatcher PaintEventDispatcher
   */
  static setPaintEventDispatcher(dispatcher: PaintEventDispatcher): void {
    {
      PaintEventDispatcher.dispatcher = dispatcher;
    }
  }
  /**
   * Returns the currently active {@code PaintEventDispatcher}.  This
   * will never return null.
   *
   * @return PaintEventDispatcher
   */
  static getPaintEventDispatcher(): PaintEventDispatcher {
    {
      if (PaintEventDispatcher.dispatcher == null) {
        PaintEventDispatcher.dispatcher = new PaintEventDispatcher()._PaintEventDispatcher();
      }
      return PaintEventDispatcher.dispatcher;
    }
  }
  /**
   * Creates and returns the {@code PaintEvent} that should be
   * dispatched for the specified component.  If this returns null
   * no {@code PaintEvent} is dispatched.
   * <p>
   * <b>WARNING:</b> This is invoked from the native thread, be careful
   * what methods you end up invoking here.
   */
  createPaintEvent(target: Component, x: number, y: number, w: number, h: number): PaintEvent {
    return new PaintEvent()._PaintEvent(target, PaintEvent.PAINT, new Rectangle()._Rectangle$int$int$int$int(x, y, w, h));
  }
}

$J.define(PaintEventDispatcher, 'sun.awt.PaintEventDispatcher', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PaintEventDispatcher' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  PaintEvent = $J.load('java.awt.event.PaintEvent');
});
