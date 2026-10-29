// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/DefaultSwatchChooserPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { SwatchPanel } from './SwatchPanel.ts';

let Dimension, UIManager;

export class RecentSwatchPanel extends SwatchPanel {
  _RecentSwatchPanel(): this {
    this._SwatchPanel();
    return this;
  }
  initValues(): void {
    this.swatchSize = UIManager.getDimension$Object$Locale('ColorChooser.swatchesRecentSwatchSize', this.getLocale$());
    this.numSwatches = new Dimension()._Dimension$int$int(5, 7);
    this.gap_ = new Dimension()._Dimension$int$int(1, 1);
  }
  initColors(): void {
    let defaultRecentColor = UIManager.getColor$Object$Locale('ColorChooser.swatchesDefaultRecentColor', this.getLocale$());
    let numColors = Math.imul(this.numSwatches.width_, this.numSwatches.height_);
    this.colors = $J.newArray(numColors, null);
    for (let i = 0; i < numColors; i++) {
      this.colors[i] = defaultRecentColor;
    }
  }
  setMostRecentColor(c: Color): void {
    $J.system_arraycopy(this.colors, 0, this.colors, 1, (this.colors.length - 1) | 0);
    this.colors[0] = c;
    this.repaint$();
  }
}

$J.define(RecentSwatchPanel, 'javax.swing.colorchooser.RecentSwatchPanel', { kind: 'class', sup: 'javax.swing.colorchooser.SwatchPanel', ctors: { '': '_RecentSwatchPanel' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  UIManager = $J.load('javax.swing.UIManager');
});
