// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalComboBoxIcon.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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

let MetalLookAndFeel;

/**
 * This utility class draws the horizontal bars which indicate a MetalComboBox
 *
 * @see MetalComboBoxUI
 * @author Tom Santos
 */
export class MetalComboBoxIcon extends JObject {
  /**
   * Constructs a {@code MetalComboBoxIcon}.
   */
  _MetalComboBoxIcon(): this {
    return this;
  }
  /**
   * Paints the horizontal bars for the
   */
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let component = c;
    let iconWidth = this.getIconWidth();
    g.translate$int$int(x, y);
    g.setColor(component.isEnabled() ? MetalLookAndFeel.getControlInfo() : MetalLookAndFeel.getControlShadow());
    g.fillPolygon$intArr$intArr$int([0, 5, (iconWidth - 5) | 0, iconWidth], [0, 5, 5, 0], 4);
    g.translate$int$int(-x, -y);
  }
  /**
   * Created a stub to satisfy the interface.
   */
  getIconWidth(): number {
    return 10;
  }
  /**
   * Created a stub to satisfy the interface.
   */
  getIconHeight(): number {
    return 5;
  }
}

$J.define(MetalComboBoxIcon, 'javax.swing.plaf.metal.MetalComboBoxIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalComboBoxIcon' } });
$J.module(() => {
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
});
