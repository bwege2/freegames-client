// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/CenterLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../../jre/index.ts';

let Dimension;

/**
 * Center-positioning layout manager.
 * @author Tom Santos
 * @author Steve Wilson
 */
export class CenterLayout extends JObject {
  _CenterLayout(): this {
    return this;
  }
  addLayoutComponent$String$Component(name: string, comp: Component): void {
  }
  removeLayoutComponent(comp: Component): void {
  }
  preferredLayoutSize(container: Container): Dimension {
    let c = container.getComponent$int(0);
    if (c != null) {
      let size = c.getPreferredSize$();
      let insets = container.getInsets$();
      return new Dimension()._Dimension$int$int((size.width_ + insets.left + insets.right) | 0, (size.height_ + insets.top + insets.bottom) | 0);
    } else {
      return new Dimension()._Dimension$int$int(0, 0);
    }
  }
  minimumLayoutSize(cont: Container): Dimension {
    return this.preferredLayoutSize(cont);
  }
  layoutContainer$Container(container: Container): void {
    if (container.getComponentCount() > 0) {
      let c = container.getComponent$int(0);
      let pref = c.getPreferredSize$();
      let containerWidth = container.getWidth();
      let containerHeight = container.getHeight();
      let containerInsets = container.getInsets$();
      containerWidth = (containerWidth - (containerInsets.left + containerInsets.right)) | 0;
      containerHeight = (containerHeight - (containerInsets.top + containerInsets.bottom)) | 0;
      let left = ($J.idiv(((containerWidth - pref.width_) | 0), 2) + containerInsets.left) | 0;
      let right = ($J.idiv(((containerHeight - pref.height_) | 0), 2) + containerInsets.top) | 0;
      c.setBounds$int$int$int$int(left, right, pref.width_, pref.height_);
    }
  }
}

$J.define(CenterLayout, 'javax.swing.plaf.basic.CenterLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_CenterLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
});
