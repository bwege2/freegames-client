// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorChooserComponentFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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

let ColorChooserPanel, ColorModel, ColorModelCMYK, ColorModelHSL, ColorModelHSV, DefaultPreviewPanel, DefaultSwatchChooserPanel;

/**
 * A class designed to produce preconfigured "accessory" objects to
 * insert into color choosers.
 *
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @author Steve Wilson
 */
export class ColorChooserComponentFactory extends JObject {
  /**
   * Returns the default chooser panels.
   * @return the default chooser panels
   */
  static getDefaultChooserPanels(): AbstractColorChooserPanel[] {
    return [new DefaultSwatchChooserPanel()._DefaultSwatchChooserPanel(), new ColorChooserPanel()._ColorChooserPanel(new ColorModelHSV()._ColorModelHSV()), new ColorChooserPanel()._ColorChooserPanel(new ColorModelHSL()._ColorModelHSL()), new ColorChooserPanel()._ColorChooserPanel(new ColorModel()._ColorModel$()), new ColorChooserPanel()._ColorChooserPanel(new ColorModelCMYK()._ColorModelCMYK())];
  }
  /**
   * Returns the preview panel.
   * @return the preview panel
   */
  static getPreviewPanel(): JComponent {
    return new DefaultPreviewPanel()._DefaultPreviewPanel();
  }
}

$J.define(ColorChooserComponentFactory, 'javax.swing.colorchooser.ColorChooserComponentFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_ColorChooserComponentFactory' } });
$J.module(() => {
  ColorChooserPanel = $J.load('javax.swing.colorchooser.ColorChooserPanel');
  ColorModel = $J.load('javax.swing.colorchooser.ColorModel');
  ColorModelCMYK = $J.load('javax.swing.colorchooser.ColorModelCMYK');
  ColorModelHSL = $J.load('javax.swing.colorchooser.ColorModelHSL');
  ColorModelHSV = $J.load('javax.swing.colorchooser.ColorModelHSV');
  DefaultPreviewPanel = $J.load('javax.swing.colorchooser.DefaultPreviewPanel');
  DefaultSwatchChooserPanel = $J.load('javax.swing.colorchooser.DefaultSwatchChooserPanel');
});
