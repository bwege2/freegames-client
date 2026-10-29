// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/LayoutComparator.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, ClassCastException, JObject } from '../../../jre/index.ts';

let Window;

/**
 * Comparator which attempts to sort Components based on their size and
 * position. Code adapted from original javax.swing.DefaultFocusManager
 * implementation.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans has been added to the <code>java.beans</code> package.
 *
 * @author David Mendenhall
 */
export class LayoutComparator extends JObject {
  static readonly ROW_TOLERANCE: number = 10;
  horizontal: boolean = false;
  leftToRight_: boolean = false;
  _LayoutComparator(): this {
    this.horizontal = true;
    this.leftToRight_ = true;
    return this;
  }
  setComponentOrientation(orientation: ComponentOrientation): void {
    this.horizontal = orientation.isHorizontal();
    this.leftToRight_ = orientation.isLeftToRight();
  }
  compare(a: Component, b: Component): number {
    if (a === b) {
      return 0;
    }
    if (a.getParent() !== b.getParent()) {
      let aAncestory = new ArrayList();
      for (; a != null; a = a.getParent()) {
        aAncestory.add(a);
        if (a instanceof Window) {
          break;
        }
      }
      if (a == null) {
        throw new ClassCastException();
      }
      let bAncestory = new ArrayList();
      for (; b != null; b = b.getParent()) {
        bAncestory.add(b);
        if (b instanceof Window) {
          break;
        }
      }
      if (b == null) {
        throw new ClassCastException();
      }
      for (let aIter = aAncestory.listIterator(aAncestory.size()), bIter = bAncestory.listIterator(bAncestory.size()); ; ) {
        if (aIter.hasPrevious()) {
          a = aIter.previous();
        } else {
          return -1;
        }
        if (bIter.hasPrevious()) {
          b = bIter.previous();
        } else {
          return 1;
        }
        if (a !== b) {
          break;
        }
      }
    }
    let ax = a.getX();
    let ay = a.getY();
    let bx = b.getX();
    let by = b.getY();
    let zOrder = (a.getParent().getComponentZOrder(a) - b.getParent().getComponentZOrder(b)) | 0;
    if (this.horizontal) {
      if (this.leftToRight_) {
        if ((Math.abs((ay - by) | 0)) < LayoutComparator.ROW_TOLERANCE) {
          return (ax < bx) ? -1 : ((ax > bx) ? 1 : zOrder);
        } else {
          return (ay < by) ? -1 : 1;
        }
      } else {
        if ((Math.abs((ay - by) | 0)) < LayoutComparator.ROW_TOLERANCE) {
          return (ax > bx) ? -1 : ((ax < bx) ? 1 : zOrder);
        } else {
          return (ay < by) ? -1 : 1;
        }
      }
    } else {
      if (this.leftToRight_) {
        if ((Math.abs((ax - bx) | 0)) < LayoutComparator.ROW_TOLERANCE) {
          return (ay < by) ? -1 : ((ay > by) ? 1 : zOrder);
        } else {
          return (ax < bx) ? -1 : 1;
        }
      } else {
        if ((Math.abs((ax - bx) | 0)) < LayoutComparator.ROW_TOLERANCE) {
          return (ay < by) ? -1 : ((ay > by) ? 1 : zOrder);
        } else {
          return (ax > bx) ? -1 : 1;
        }
      }
    }
  }
}

$J.define(LayoutComparator, 'javax.swing.LayoutComparator', { kind: 'class', ifaces: ['java.util.Comparator', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_LayoutComparator' } });
$J.module(() => {
  Window = $J.load('java.awt.Window');
});
