// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalHighContrastTheme.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2001, 2002, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../../jre/index.ts';
import { DefaultMetalTheme } from './DefaultMetalTheme.ts';

let CompoundBorder, LineBorder, BorderUIResource, ColorUIResource, BasicBorders$MarginBorder;

/**
 * A high contrast theme. This is used on Windows if the system property
 * awt.highContrast.on is true.
 *
 * @author Michael C. Albers
 */
export class MetalHighContrastTheme extends DefaultMetalTheme {
  static primary1: ColorUIResource = null;
  static primary2: ColorUIResource = null;
  static primary3: ColorUIResource = null;
  static primaryHighlight: ColorUIResource = null;
  static secondary2: ColorUIResource = null;
  static secondary3: ColorUIResource = null;
  _MetalHighContrastTheme(): this {
    this._DefaultMetalTheme();
    return this;
  }
  getPrimary1(): ColorUIResource {
    return MetalHighContrastTheme.primary1;
  }
  getPrimary2(): ColorUIResource {
    return MetalHighContrastTheme.primary2;
  }
  getPrimary3(): ColorUIResource {
    return MetalHighContrastTheme.primary3;
  }
  getPrimaryControlHighlight(): ColorUIResource {
    return MetalHighContrastTheme.primaryHighlight;
  }
  getSecondary2(): ColorUIResource {
    return MetalHighContrastTheme.secondary2;
  }
  getSecondary3(): ColorUIResource {
    return MetalHighContrastTheme.secondary3;
  }
  getControlHighlight(): ColorUIResource {
    return MetalHighContrastTheme.secondary2;
  }
  getFocusColor(): ColorUIResource {
    return this.getBlack();
  }
  getTextHighlightColor(): ColorUIResource {
    return this.getBlack();
  }
  getHighlightedTextColor(): ColorUIResource {
    return this.getWhite();
  }
  getMenuSelectedBackground(): ColorUIResource {
    return this.getBlack();
  }
  getMenuSelectedForeground(): ColorUIResource {
    return this.getWhite();
  }
  getAcceleratorForeground(): ColorUIResource {
    return this.getBlack();
  }
  getAcceleratorSelectedForeground(): ColorUIResource {
    return this.getWhite();
  }
  addCustomEntriesToTable(table: UIDefaults): void {
    let blackLineBorder = new BorderUIResource()._BorderUIResource(new LineBorder()._LineBorder$Color(this.getBlack()));
    let whiteLineBorder = new BorderUIResource()._BorderUIResource(new LineBorder()._LineBorder$Color(this.getWhite()));
    let textBorder = new BorderUIResource()._BorderUIResource(new CompoundBorder()._CompoundBorder$Border$Border(blackLineBorder, new BasicBorders$MarginBorder()._BasicBorders$MarginBorder()));
    let defaults = ['ToolTip.border', blackLineBorder, 'TitledBorder.border', blackLineBorder, 'TextField.border', textBorder, 'PasswordField.border', textBorder, 'TextArea.border', textBorder, 'TextPane.border', textBorder, 'EditorPane.border', textBorder, 'ComboBox.background', this.getWindowBackground(), 'ComboBox.foreground', this.getUserTextColor(), 'ComboBox.selectionBackground', this.getTextHighlightColor(), 'ComboBox.selectionForeground', this.getHighlightedTextColor(), 'ProgressBar.foreground', this.getUserTextColor(), 'ProgressBar.background', this.getWindowBackground(), 'ProgressBar.selectionForeground', this.getWindowBackground(), 'ProgressBar.selectionBackground', this.getUserTextColor(), 'OptionPane.errorDialog.border.background', this.getPrimary1(), 'OptionPane.errorDialog.titlePane.foreground', this.getPrimary3(), 'OptionPane.errorDialog.titlePane.background', this.getPrimary1(), 'OptionPane.errorDialog.titlePane.shadow', this.getPrimary2(), 'OptionPane.questionDialog.border.background', this.getPrimary1(), 'OptionPane.questionDialog.titlePane.foreground', this.getPrimary3(), 'OptionPane.questionDialog.titlePane.background', this.getPrimary1(), 'OptionPane.questionDialog.titlePane.shadow', this.getPrimary2(), 'OptionPane.warningDialog.border.background', this.getPrimary1(), 'OptionPane.warningDialog.titlePane.foreground', this.getPrimary3(), 'OptionPane.warningDialog.titlePane.background', this.getPrimary1(), 'OptionPane.warningDialog.titlePane.shadow', this.getPrimary2()];
    table.putDefaults(defaults);
  }
  /**
   * Returns true if this is a theme provided by the core platform.
   */
  isSystemTheme(): boolean {
    return ($J.getClass(this) === $J.cls(MetalHighContrastTheme));
  }
  static $clinit() {
    MetalHighContrastTheme.primary1 = new ColorUIResource()._ColorUIResource$int$int$int(0, 0, 0);
    MetalHighContrastTheme.primary2 = new ColorUIResource()._ColorUIResource$int$int$int(204, 204, 204);
    MetalHighContrastTheme.primary3 = new ColorUIResource()._ColorUIResource$int$int$int(255, 255, 255);
    MetalHighContrastTheme.primaryHighlight = new ColorUIResource()._ColorUIResource$int$int$int(102, 102, 102);
    MetalHighContrastTheme.secondary2 = new ColorUIResource()._ColorUIResource$int$int$int(204, 204, 204);
    MetalHighContrastTheme.secondary3 = new ColorUIResource()._ColorUIResource$int$int$int(255, 255, 255);
  }
}

$J.define(MetalHighContrastTheme, 'javax.swing.plaf.metal.MetalHighContrastTheme', { kind: 'class', sup: 'javax.swing.plaf.metal.DefaultMetalTheme', ctors: { '': '_MetalHighContrastTheme' }, clinit: true, lazy: ['primary1', 'primary2', 'primary3', 'primaryHighlight', 'secondary2', 'secondary3'] });
$J.module(() => {
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  LineBorder = $J.load('javax.swing.border.LineBorder');
  BorderUIResource = $J.load('javax.swing.plaf.BorderUIResource');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  BasicBorders$MarginBorder = $J.load('javax.swing.plaf.basic.BasicBorders$MarginBorder');
});
