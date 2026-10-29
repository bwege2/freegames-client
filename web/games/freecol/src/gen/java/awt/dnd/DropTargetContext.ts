// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/dnd/DropTargetContext.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2022, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';

let AWTAccessor;

/**
 * A {@code DropTargetContext} is created
 * whenever the logical cursor associated
 * with a Drag and Drop operation coincides with the visible geometry of
 * a {@code Component} associated with a {@code DropTarget}.
 * The {@code DropTargetContext} provides
 * the mechanism for a potential receiver
 * of a drop operation to both provide the end user with the appropriate
 * drag under feedback, but also to effect the subsequent data transfer
 * if appropriate.
 *
 * @since 1.2
 */
export class DropTargetContext extends JObject {
  /**
   * The DropTarget associated with this DropTargetContext.
   *
   * @serial
   */
  dropTarget: DropTarget = null;
  dropTargetContextPeer: DropTargetContextPeer = null;
  transferable: Transferable = null;
  /**
   * Construct a {@code DropTargetContext}
   * given a specified {@code DropTarget}.
   *
   * @param dt the DropTarget to associate with
   */
  _DropTargetContext(dt: DropTarget): this {
    this.dropTarget = dt;
    return this;
  }
  /**
   * This method returns the {@code DropTarget} associated with this
   * {@code DropTargetContext}.
   *
   * @return the {@code DropTarget} associated with this {@code DropTargetContext}
   */
  getDropTarget(): DropTarget {
    return this.dropTarget;
  }
  /**
   * This method sets the current actions acceptable to
   * this {@code DropTarget}.
   *
   * @param actions an {@code int} representing the supported action(s)
   */
  setTargetActions(actions: number): void {
    let peer = this.getDropTargetContextPeer();
    if (peer != null) {
      {
        peer.setTargetActions(actions);
        this.getDropTarget().doSetDefaultActions(actions);
      }
    } else {
      this.getDropTarget().doSetDefaultActions(actions);
    }
  }
  /**
   * Get the {@code DropTargetContextPeer}
   *
   * @return the platform peer
   */
  getDropTargetContextPeer(): DropTargetContextPeer {
    return this.dropTargetContextPeer;
  }
  static $clinit() {
    AWTAccessor.setDropTargetContextAccessor(new (DropTargetContext$1())());
  }
}

let $DropTargetContext$1: any = null;
/** An anonymous class (DropTargetContext.java:65). */
function DropTargetContext$1(): any {
  return $DropTargetContext$1 ??= $J.local(class extends JObject {
  }, 'java.awt.dnd.DropTargetContext$1', ['sun.awt.AWTAccessor$DropTargetContextAccessor']);
}

$J.define(DropTargetContext, 'java.awt.dnd.DropTargetContext', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'java.awt.dnd.DropTarget': '_DropTargetContext' }, clinit: true, lazy: [] });
$J.module(() => {
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
