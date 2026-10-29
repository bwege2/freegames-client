// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/OceanTheme.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2003, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Arrays } from '../../../../../jre/index.ts';
import { DefaultMetalTheme } from './DefaultMetalTheme.ts';
import { IconUIResource } from '../IconUIResource.ts';

let Color, Insets, BorderUIResource$LineBorderUIResource, ColorUIResource, MetalTheme, MetalUtils, PrintColorUIResource, SwingUtilities2;

/**
 * The default theme for the {@code MetalLookAndFeel}.
 * <p>
 * The designers
 * of the Metal Look and Feel strive to keep the default look up to
 * date, possibly through the use of new themes in the future.
 * Therefore, developers should only use this class directly when they
 * wish to customize the "Ocean" look, or force it to be the current
 * theme, regardless of future updates.
 *
 * <p>
 * All colors returned by {@code OceanTheme} are completely
 * opaque.
 *
 * @since 1.5
 * @see MetalLookAndFeel#setCurrentTheme
 */
export class OceanTheme extends DefaultMetalTheme {
  static PRIMARY1: ColorUIResource = null;
  static PRIMARY2: ColorUIResource = null;
  static PRIMARY3: ColorUIResource = null;
  static SECONDARY1: ColorUIResource = null;
  static SECONDARY2: ColorUIResource = null;
  static SECONDARY3: ColorUIResource = null;
  static CONTROL_TEXT_COLOR: ColorUIResource = null;
  static INACTIVE_CONTROL_TEXT_COLOR: ColorUIResource = null;
  static MENU_DISABLED_FOREGROUND: ColorUIResource = null;
  static OCEAN_BLACK: ColorUIResource = null;
  static OCEAN_DROP: ColorUIResource = null;
  /**
   * Creates an instance of <code>OceanTheme</code>
   */
  _OceanTheme(): this {
    this._DefaultMetalTheme();
    return this;
  }
  /**
   * Add this theme's custom entries to the defaults table.
   *
   * @param table the defaults table, non-null
   * @throws NullPointerException if {@code table} is {@code null}
   */
  addCustomEntriesToTable(table: UIDefaults): void {
    let focusBorder = (t) => new BorderUIResource$LineBorderUIResource()._BorderUIResource$LineBorderUIResource$Color(this.getPrimary1());
    let buttonGradient = Arrays.asList(...[$J.boxF($J.boxF(Math.fround(0.3))), $J.boxF($J.boxF(0)), new ColorUIResource()._ColorUIResource$int(14543091), this.getWhite(), this.getSecondary2()]);
    let cccccc = new ColorUIResource()._ColorUIResource$int(13421772);
    let dadada = new ColorUIResource()._ColorUIResource$int(14342874);
    let c8ddf2 = new ColorUIResource()._ColorUIResource$int(13164018);
    let directoryIcon = this.getIconResource('icons/ocean/directory.gif');
    let fileIcon = this.getIconResource('icons/ocean/file.gif');
    let sliderGradient = Arrays.asList(...[$J.boxF($J.boxF(Math.fround(0.3))), $J.boxF($J.boxF(Math.fround(0.2))), c8ddf2, this.getWhite(), new ColorUIResource()._ColorUIResource$Color(OceanTheme.SECONDARY2)]);
    let defaults = ['Button.gradient', buttonGradient, 'Button.rollover', true, 'Button.toolBarBorderBackground', OceanTheme.INACTIVE_CONTROL_TEXT_COLOR, 'Button.disabledToolBarBorderBackground', cccccc, 'Button.rolloverIconType', 'ocean', 'CheckBox.rollover', true, 'CheckBox.gradient', buttonGradient, 'CheckBoxMenuItem.gradient', buttonGradient, 'FileChooser.homeFolderIcon', this.getIconResource('icons/ocean/homeFolder.gif'), 'FileChooser.newFolderIcon', this.getIconResource('icons/ocean/newFolder.gif'), 'FileChooser.upFolderIcon', this.getIconResource('icons/ocean/upFolder.gif'), 'FileView.computerIcon', this.getIconResource('icons/ocean/computer.gif'), 'FileView.directoryIcon', directoryIcon, 'FileView.hardDriveIcon', this.getIconResource('icons/ocean/hardDrive.gif'), 'FileView.fileIcon', fileIcon, 'FileView.floppyDriveIcon', this.getIconResource('icons/ocean/floppy.gif'), 'Label.disabledForeground', this.getInactiveControlTextColor(), 'Menu.opaque', false, 'MenuBar.gradient', Arrays.asList(...[$J.boxF($J.boxF(1)), $J.boxF($J.boxF(0)), this.getWhite(), dadada, new ColorUIResource()._ColorUIResource$Color(dadada)]), 'MenuBar.borderColor', cccccc, 'InternalFrame.activeTitleGradient', buttonGradient, 'InternalFrame.closeIcon', (table) => {
      return new OceanTheme$IFIcon()._OceanTheme$IFIcon(this.getHastenedIcon('icons/ocean/close.gif', table), this.getHastenedIcon('icons/ocean/close-pressed.gif', table));
    }, 'InternalFrame.iconifyIcon', (table) => {
      return new OceanTheme$IFIcon()._OceanTheme$IFIcon(this.getHastenedIcon('icons/ocean/iconify.gif', table), this.getHastenedIcon('icons/ocean/iconify-pressed.gif', table));
    }, 'InternalFrame.minimizeIcon', (table) => {
      return new OceanTheme$IFIcon()._OceanTheme$IFIcon(this.getHastenedIcon('icons/ocean/minimize.gif', table), this.getHastenedIcon('icons/ocean/minimize-pressed.gif', table));
    }, 'InternalFrame.icon', this.getIconResource('icons/ocean/menu.gif'), 'InternalFrame.maximizeIcon', (table) => {
      return new OceanTheme$IFIcon()._OceanTheme$IFIcon(this.getHastenedIcon('icons/ocean/maximize.gif', table), this.getHastenedIcon('icons/ocean/maximize-pressed.gif', table));
    }, 'InternalFrame.paletteCloseIcon', (table) => {
      return new OceanTheme$IFIcon()._OceanTheme$IFIcon(this.getHastenedIcon('icons/ocean/paletteClose.gif', table), this.getHastenedIcon('icons/ocean/paletteClose-pressed.gif', table));
    }, 'List.focusCellHighlightBorder', focusBorder, 'OptionPane.errorIcon', this.getIconResource('icons/ocean/error.png'), 'OptionPane.informationIcon', this.getIconResource('icons/ocean/info.png'), 'OptionPane.questionIcon', this.getIconResource('icons/ocean/question.png'), 'OptionPane.warningIcon', this.getIconResource('icons/ocean/warning.png'), 'RadioButton.gradient', buttonGradient, 'RadioButton.rollover', true, 'RadioButtonMenuItem.gradient', buttonGradient, 'ScrollBar.gradient', buttonGradient, 'Slider.altTrackColor', new ColorUIResource()._ColorUIResource$int(13820655), 'Slider.gradient', sliderGradient, 'Slider.focusGradient', sliderGradient, 'SplitPane.oneTouchButtonsOpaque', false, 'SplitPane.dividerFocusColor', c8ddf2, 'TabbedPane.borderHightlightColor', this.getPrimary1(), 'TabbedPane.contentAreaColor', c8ddf2, 'TabbedPane.contentBorderInsets', new Insets()._Insets(4, 2, 3, 3), 'TabbedPane.selected', c8ddf2, 'TabbedPane.tabAreaBackground', dadada, 'TabbedPane.tabAreaInsets', new Insets()._Insets(2, 2, 0, 6), 'TabbedPane.unselectedBackground', OceanTheme.SECONDARY3, 'Table.focusCellHighlightBorder', focusBorder, 'Table.gridColor', OceanTheme.SECONDARY1, 'TableHeader.focusCellBackground', c8ddf2, 'ToggleButton.gradient', buttonGradient, 'ToolBar.borderColor', cccccc, 'ToolBar.isRollover', true, 'Tree.closedIcon', directoryIcon, 'Tree.collapsedIcon', (table) => {
      return new OceanTheme$COIcon()._OceanTheme$COIcon(this.getHastenedIcon('icons/ocean/collapsed.gif', table), this.getHastenedIcon('icons/ocean/collapsed-rtl.gif', table));
    }, 'Tree.expandedIcon', this.getIconResource('icons/ocean/expanded.gif'), 'Tree.leafIcon', fileIcon, 'Tree.openIcon', directoryIcon, 'Tree.selectionBorderColor', this.getPrimary1(), 'Tree.dropLineColor', this.getPrimary1(), 'Table.dropLineColor', this.getPrimary1(), 'Table.dropLineShortColor', OceanTheme.OCEAN_BLACK, 'Table.dropCellBackground', OceanTheme.OCEAN_DROP, 'Tree.dropCellBackground', OceanTheme.OCEAN_DROP, 'List.dropCellBackground', OceanTheme.OCEAN_DROP, 'List.dropLineColor', this.getPrimary1()];
    table.putDefaults(defaults);
  }
  /**
   * Overridden to enable picking up the system fonts, if applicable.
   */
  isSystemTheme(): boolean {
    return true;
  }
  /**
   * Returns the primary 1 color. This returns a color with an rgb hex value
   * of {@code 0x6382BF}.
   *
   * @return the primary 1 color
   * @see java.awt.Color#decode
   */
  getPrimary1(): ColorUIResource {
    return OceanTheme.PRIMARY1;
  }
  /**
   * Returns the primary 2 color. This returns a color with an rgb hex value
   * of {@code 0xA3B8CC}.
   *
   * @return the primary 2 color
   * @see java.awt.Color#decode
   */
  getPrimary2(): ColorUIResource {
    return OceanTheme.PRIMARY2;
  }
  /**
   * Returns the primary 3 color. This returns a color with an rgb hex value
   * of {@code 0xB8CFE5}.
   *
   * @return the primary 3 color
   * @see java.awt.Color#decode
   */
  getPrimary3(): ColorUIResource {
    return OceanTheme.PRIMARY3;
  }
  /**
   * Returns the secondary 1 color. This returns a color with an rgb hex
   * value of {@code 0x7A8A99}.
   *
   * @return the secondary 1 color
   * @see java.awt.Color#decode
   */
  getSecondary1(): ColorUIResource {
    return OceanTheme.SECONDARY1;
  }
  /**
   * Returns the secondary 2 color. This returns a color with an rgb hex
   * value of {@code 0xB8CFE5}.
   *
   * @return the secondary 2 color
   * @see java.awt.Color#decode
   */
  getSecondary2(): ColorUIResource {
    return OceanTheme.SECONDARY2;
  }
  /**
   * Returns the secondary 3 color. This returns a color with an rgb hex
   * value of {@code 0xEEEEEE}.
   *
   * @return the secondary 3 color
   * @see java.awt.Color#decode
   */
  getSecondary3(): ColorUIResource {
    return OceanTheme.SECONDARY3;
  }
  /**
   * Returns the black color. This returns a color with an rgb hex
   * value of {@code 0x333333}.
   *
   * @return the black color
   * @see java.awt.Color#decode
   */
  getBlack(): ColorUIResource {
    return OceanTheme.OCEAN_BLACK;
  }
  /**
   * Returns the desktop color. This returns a color with an rgb hex
   * value of {@code 0xFFFFFF}.
   *
   * @return the desktop color
   * @see java.awt.Color#decode
   */
  getDesktopColor(): ColorUIResource {
    return MetalTheme.white;
  }
  /**
   * Returns the inactive control text color. This returns a color with an
   * rgb hex value of {@code 0x999999}.
   *
   * @return the inactive control text color
   */
  getInactiveControlTextColor(): ColorUIResource {
    return OceanTheme.INACTIVE_CONTROL_TEXT_COLOR;
  }
  /**
   * Returns the control text color. This returns a color with an
   * rgb hex value of {@code 0x333333}.
   *
   * @return the control text color
   */
  getControlTextColor(): ColorUIResource {
    return OceanTheme.CONTROL_TEXT_COLOR;
  }
  /**
   * Returns the menu disabled foreground color. This returns a color with an
   * rgb hex value of {@code 0x999999}.
   *
   * @return the menu disabled foreground color
   */
  getMenuDisabledForeground(): ColorUIResource {
    return OceanTheme.MENU_DISABLED_FOREGROUND;
  }
  getIconResource(iconID: string): any {
    return SwingUtilities2.makeIcon$Class$Class$String($J.getClass(this), $J.cls(OceanTheme), iconID);
  }
  getHastenedIcon(iconID: string, table: UIDefaults): Icon {
    let res = this.getIconResource(iconID);
    return $J.fn((res), 'createValue')(table);
  }
  static $clinit() {
    OceanTheme.PRIMARY1 = new ColorUIResource()._ColorUIResource$int(6521535);
    OceanTheme.PRIMARY2 = new ColorUIResource()._ColorUIResource$int(10729676);
    OceanTheme.PRIMARY3 = new ColorUIResource()._ColorUIResource$int(12111845);
    OceanTheme.SECONDARY1 = new ColorUIResource()._ColorUIResource$int(8030873);
    OceanTheme.SECONDARY2 = new ColorUIResource()._ColorUIResource$int(12111845);
    OceanTheme.SECONDARY3 = new ColorUIResource()._ColorUIResource$int(15658734);
    OceanTheme.CONTROL_TEXT_COLOR = new PrintColorUIResource()._PrintColorUIResource(3355443, Color.BLACK);
    OceanTheme.INACTIVE_CONTROL_TEXT_COLOR = new ColorUIResource()._ColorUIResource$int(10066329);
    OceanTheme.MENU_DISABLED_FOREGROUND = new ColorUIResource()._ColorUIResource$int(10066329);
    OceanTheme.OCEAN_BLACK = new PrintColorUIResource()._PrintColorUIResource(3355443, Color.BLACK);
    OceanTheme.OCEAN_DROP = new ColorUIResource()._ColorUIResource$int(13822463);
  }
}

export class OceanTheme$COIcon extends IconUIResource {
  rtl: Icon = null;
  _OceanTheme$COIcon(ltr: Icon, rtl: Icon): this {
    this._IconUIResource(ltr);
    this.rtl = rtl;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (MetalUtils.isLeftToRight(c)) {
      super.paintIcon(c, g, x, y);
    } else {
      this.rtl.paintIcon(c, g, x, y);
    }
  }
}

export class OceanTheme$IFIcon extends IconUIResource {
  pressed: Icon = null;
  _OceanTheme$IFIcon(normal: Icon, pressed: Icon): this {
    this._IconUIResource(normal);
    this.pressed = pressed;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let model = (c).getModel();
    if (model.isPressed() && model.isArmed()) {
      this.pressed.paintIcon(c, g, x, y);
    } else {
      super.paintIcon(c, g, x, y);
    }
  }
}

$J.define(OceanTheme, 'javax.swing.plaf.metal.OceanTheme', { kind: 'class', sup: 'javax.swing.plaf.metal.DefaultMetalTheme', ctors: { '': '_OceanTheme' }, clinit: true, lazy: ['PRIMARY1', 'PRIMARY2', 'PRIMARY3', 'SECONDARY1', 'SECONDARY2', 'SECONDARY3', 'CONTROL_TEXT_COLOR', 'INACTIVE_CONTROL_TEXT_COLOR', 'MENU_DISABLED_FOREGROUND', 'OCEAN_BLACK', 'OCEAN_DROP'] });
$J.define(OceanTheme$COIcon, 'javax.swing.plaf.metal.OceanTheme$COIcon', { kind: 'class', sup: 'javax.swing.plaf.IconUIResource', ctors: { 'javax.swing.Icon,javax.swing.Icon': '_OceanTheme$COIcon' } });
$J.define(OceanTheme$IFIcon, 'javax.swing.plaf.metal.OceanTheme$IFIcon', { kind: 'class', sup: 'javax.swing.plaf.IconUIResource', ctors: { 'javax.swing.Icon,javax.swing.Icon': '_OceanTheme$IFIcon' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Insets = $J.load('java.awt.Insets');
  BorderUIResource$LineBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$LineBorderUIResource');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  MetalTheme = $J.load('javax.swing.plaf.metal.MetalTheme');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  PrintColorUIResource = $J.load('sun.swing.PrintColorUIResource');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
