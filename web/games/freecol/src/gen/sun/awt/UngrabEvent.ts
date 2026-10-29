// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/sun/awt/UngrabEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';
import { AWTEvent } from '../../java/awt/AWTEvent.ts';

/**
 * Sent when one of the following events occur on the grabbed window: <ul>
 * <li> it looses focus, but not to one of the owned windows
 * <li> mouse click on the outside area happens (except for one of the owned windows)
 * <li> switch to another application or desktop happens
 * <li> click in the non-client area of the owning window or this window happens
 * </ul>
 *
 * <p>Notice that this event is not generated on mouse click inside of the window area.
 * <p>To listen for this event, install AWTEventListener with {@value sun.awt.SunToolkit#GRAB_EVENT_MASK}
 */
export class UngrabEvent extends AWTEvent {
  static readonly UNGRAB_EVENT_ID: number = 1998;
  _UngrabEvent(source: Component): this {
    this._AWTEvent$Object$int(source, UngrabEvent.UNGRAB_EVENT_ID);
    return this;
  }
  toString(): string {
    return 'sun.awt.UngrabEvent[' + $J.str(this.getSource()) + ']';
  }
}

$J.define(UngrabEvent, 'sun.awt.UngrabEvent', { kind: 'class', sup: 'java.awt.AWTEvent', ctors: { 'java.awt.Component': '_UngrabEvent' } });
