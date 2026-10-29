// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DragSourceDropEvent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { DragSourceEvent } from './DragSourceEvent.ts';

let DnDConstants;

/**
 * The {@code DragSourceDropEvent} is delivered
 * from the {@code DragSourceContextPeer},
 * via the {@code DragSourceContext}, to the {@code dragDropEnd}
 * method of {@code DragSourceListener}s registered with that
 * {@code DragSourceContext} and with its associated
 * {@code DragSource}.
 * It contains sufficient information for the
 * originator of the operation
 * to provide appropriate feedback to the end user
 * when the operation completes.
 *
 * @since 1.2
 */
export class DragSourceDropEvent extends DragSourceEvent {
  /**
   * {@code true} if the drop was successful.
   *
   * @serial
   */
  dropSuccess: boolean = false;
  /**
   * The drop action.
   *
   * @serial
   */
  dropAction: number = 0;
  $init_DragSourceDropEvent() {
    this.dropAction = DnDConstants.ACTION_NONE;
  }
}

$J.define(DragSourceDropEvent, 'java.awt.dnd.DragSourceDropEvent', { kind: 'class', sup: 'java.awt.dnd.DragSourceEvent', ctors: { 'java.awt.dnd.DragSourceContext': '_DragSourceDropEvent$DragSourceContext', 'java.awt.dnd.DragSourceContext,int,boolean,int,int': '_DragSourceDropEvent$DragSourceContext$int$boolean$int$int', 'java.awt.dnd.DragSourceContext,int,boolean': '_DragSourceDropEvent$DragSourceContext$int$boolean' } });
$J.module(() => {
  DnDConstants = $J.load('java.awt.dnd.DnDConstants');
});
