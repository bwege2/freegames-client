// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragSourceEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, EventObject } from '../../../../jre/index.ts';

/**
 * This class is the base class for
 * {@code DragSourceDragEvent} and
 * {@code DragSourceDropEvent}.
 * <p>
 * {@code DragSourceEvent}s are generated whenever the drag enters, moves
 * over, or exits a drop site, when the drop action changes, and when the drag
 * ends. The location for the generated {@code DragSourceEvent} specifies
 * the mouse cursor location in screen coordinates at the moment this event
 * occurred.
 * <p>
 * In a multi-screen environment without a virtual device, the cursor location is
 * specified in the coordinate system of the <i>initiator</i>
 * {@code GraphicsConfiguration}. The <i>initiator</i>
 * {@code GraphicsConfiguration} is the {@code GraphicsConfiguration}
 * of the {@code Component} on which the drag gesture for the current drag
 * operation was recognized. If the cursor location is outside the bounds of
 * the initiator {@code GraphicsConfiguration}, the reported coordinates are
 * clipped to fit within the bounds of that {@code GraphicsConfiguration}.
 * <p>
 * In a multi-screen environment with a virtual device, the location is specified
 * in the corresponding virtual coordinate system. If the cursor location is
 * outside the bounds of the virtual device the reported coordinates are
 * clipped to fit within the bounds of the virtual device.
 *
 * @since 1.2
 */
export class DragSourceEvent extends EventObject {
  /**
   * The {@code boolean} indicating whether the cursor location
   * is specified for this event.
   *
   * @serial
   */
  locationSpecified: boolean = false;
  /**
   * The horizontal coordinate for the cursor location at the moment this
   * event occurred if the cursor location is specified for this event;
   * otherwise zero.
   *
   * @serial
   */
  x_: number = 0;
  /**
   * The vertical coordinate for the cursor location at the moment this event
   * occurred if the cursor location is specified for this event;
   * otherwise zero.
   *
   * @serial
   */
  y_: number = 0;
}

$J.define(DragSourceEvent, 'java.awt.dnd.DragSourceEvent', { kind: 'class', sup: 'java.util.EventObject', ctors: { 'java.awt.dnd.DragSourceContext,int,int': '_DragSourceEvent$DragSourceContext$int$int', 'java.awt.dnd.DragSourceContext': '_DragSourceEvent$DragSourceContext' } });
