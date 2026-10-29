// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalIconFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, BufferedImage, JObject, Vector } from '../../../../../jre/index.ts';
import { CachedPainter } from '../../../../sun/swing/CachedPainter.ts';

let Dimension, Graphics2D, Polygon, Transparency, JMenu, MetalBumps, MetalLookAndFeel, MetalUtils, SwingUtilities2;

/**
 * Factory object that vends <code>Icon</code>s for
 * the Java look and feel (Metal).
 * These icons are used extensively in Metal via the defaults mechanism.
 * While other look and feels often use GIFs for icons, creating icons
 * in code facilitates switching to other themes.
 *
 * <p>
 * Each method in this class returns
 * either an <code>Icon</code> or <code>null</code>,
 * where <code>null</code> implies that there is no default icon.
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
 * @author Michael C. Albers
 */
export class MetalIconFactory extends JObject {
  static fileChooserDetailViewIcon: Icon = null;
  static fileChooserHomeFolderIcon: Icon = null;
  static fileChooserListViewIcon: Icon = null;
  static fileChooserNewFolderIcon: Icon = null;
  static fileChooserUpFolderIcon: Icon = null;
  static internalFrameAltMaximizeIcon: Icon = null;
  static internalFrameCloseIcon: Icon = null;
  static internalFrameDefaultMenuIcon: Icon = null;
  static internalFrameMaximizeIcon: Icon = null;
  static internalFrameMinimizeIcon: Icon = null;
  static radioButtonIcon: Icon = null;
  static treeComputerIcon: Icon = null;
  static treeFloppyDriveIcon: Icon = null;
  static treeHardDriveIcon: Icon = null;
  static menuArrowIcon: Icon = null;
  static menuItemArrowIcon: Icon = null;
  static checkBoxMenuItemIcon: Icon = null;
  static radioButtonMenuItemIcon: Icon = null;
  static checkBoxIcon: Icon = null;
  static oceanHorizontalSliderThumb: Icon = null;
  static oceanVerticalSliderThumb: Icon = null;
  /**
   * {@code DARK} is used for the property {@code Tree.expandedIcon}.
   */
  static readonly DARK: boolean = false;
  /**
   * {@code LIGHT} is used for the property {@code Tree.collapsedIcon}.
   */
  static readonly LIGHT: boolean = true;
  static folderIcon16Size: Dimension = null;
  static fileIcon16Size: Dimension = null;
  static treeControlSize: Dimension = null;
  static menuArrowIconSize: Dimension = null;
  static menuCheckIconSize: Dimension = null;
  static readonly xOff: number = 4;
  /**
   * Returns the instance of {@code FileChooserDetailViewIcon}.
   *
   * @return the instance of {@code FileChooserDetailViewIcon}
   */
  static getFileChooserDetailViewIcon(): Icon {
    if (MetalIconFactory.fileChooserDetailViewIcon == null) {
      MetalIconFactory.fileChooserDetailViewIcon = new MetalIconFactory$FileChooserDetailViewIcon()._MetalIconFactory$FileChooserDetailViewIcon();
    }
    return MetalIconFactory.fileChooserDetailViewIcon;
  }
  /**
   * Returns the instance of {@code FileChooserHomeFolderIcon}.
   *
   * @return the instance of {@code FileChooserHomeFolderIcon}
   */
  static getFileChooserHomeFolderIcon(): Icon {
    if (MetalIconFactory.fileChooserHomeFolderIcon == null) {
      MetalIconFactory.fileChooserHomeFolderIcon = new MetalIconFactory$FileChooserHomeFolderIcon()._MetalIconFactory$FileChooserHomeFolderIcon();
    }
    return MetalIconFactory.fileChooserHomeFolderIcon;
  }
  /**
   * Returns the instance of {@code FileChooserListViewIcon}.
   *
   * @return the instance of {@code FileChooserListViewIcon}
   */
  static getFileChooserListViewIcon(): Icon {
    if (MetalIconFactory.fileChooserListViewIcon == null) {
      MetalIconFactory.fileChooserListViewIcon = new MetalIconFactory$FileChooserListViewIcon()._MetalIconFactory$FileChooserListViewIcon();
    }
    return MetalIconFactory.fileChooserListViewIcon;
  }
  /**
   * Returns the instance of {@code FileChooserNewFolderIcon}.
   *
   * @return the instance of {@code FileChooserNewFolderIcon}
   */
  static getFileChooserNewFolderIcon(): Icon {
    if (MetalIconFactory.fileChooserNewFolderIcon == null) {
      MetalIconFactory.fileChooserNewFolderIcon = new MetalIconFactory$FileChooserNewFolderIcon()._MetalIconFactory$FileChooserNewFolderIcon();
    }
    return MetalIconFactory.fileChooserNewFolderIcon;
  }
  /**
   * Returns the instance of {@code FileChooserUpFolderIcon}.
   *
   * @return the instance of {@code FileChooserUpFolderIcon}
   */
  static getFileChooserUpFolderIcon(): Icon {
    if (MetalIconFactory.fileChooserUpFolderIcon == null) {
      MetalIconFactory.fileChooserUpFolderIcon = new MetalIconFactory$FileChooserUpFolderIcon()._MetalIconFactory$FileChooserUpFolderIcon();
    }
    return MetalIconFactory.fileChooserUpFolderIcon;
  }
  /**
   * Constructs a new instance of {@code InternalFrameAltMaximizeIcon}.
   *
   * @param size the size of the icon
   * @return a new instance of {@code InternalFrameAltMaximizeIcon}
   */
  static getInternalFrameAltMaximizeIcon(size: number): Icon {
    return new MetalIconFactory$InternalFrameAltMaximizeIcon()._MetalIconFactory$InternalFrameAltMaximizeIcon(size);
  }
  /**
   * Constructs a new instance of {@code InternalFrameCloseIcon}.
   *
   * @param size the size of the icon
   * @return a new instance of {@code InternalFrameCloseIcon}
   */
  static getInternalFrameCloseIcon(size: number): Icon {
    return new MetalIconFactory$InternalFrameCloseIcon()._MetalIconFactory$InternalFrameCloseIcon(size);
  }
  /**
   * Returns the instance of {@code InternalFrameDefaultMenuIcon}.
   *
   * @return the instance of {@code InternalFrameDefaultMenuIcon}
   */
  static getInternalFrameDefaultMenuIcon(): Icon {
    if (MetalIconFactory.internalFrameDefaultMenuIcon == null) {
      MetalIconFactory.internalFrameDefaultMenuIcon = new MetalIconFactory$InternalFrameDefaultMenuIcon()._MetalIconFactory$InternalFrameDefaultMenuIcon();
    }
    return MetalIconFactory.internalFrameDefaultMenuIcon;
  }
  /**
   * Constructs a new instance of {@code InternalFrameMaximizeIcon}.
   *
   * @param size the size of the icon
   * @return a new instance of {@code InternalFrameMaximizeIcon}
   */
  static getInternalFrameMaximizeIcon(size: number): Icon {
    return new MetalIconFactory$InternalFrameMaximizeIcon()._MetalIconFactory$InternalFrameMaximizeIcon(size);
  }
  /**
   * Constructs a new instance of {@code InternalFrameMinimizeIcon}.
   *
   * @param size the size of the icon
   * @return a new instance of {@code InternalFrameMinimizeIcon}
   */
  static getInternalFrameMinimizeIcon(size: number): Icon {
    return new MetalIconFactory$InternalFrameMinimizeIcon()._MetalIconFactory$InternalFrameMinimizeIcon(size);
  }
  /**
   * Returns the instance of {@code RadioButtonIcon}.
   *
   * @return the instance of {@code RadioButtonIcon}
   */
  static getRadioButtonIcon(): Icon {
    if (MetalIconFactory.radioButtonIcon == null) {
      MetalIconFactory.radioButtonIcon = new MetalIconFactory$RadioButtonIcon()._MetalIconFactory$RadioButtonIcon();
    }
    return MetalIconFactory.radioButtonIcon;
  }
  /**
   * Returns a checkbox icon.
   *
   * @return a checkbox icon
   * @since 1.3
   */
  static getCheckBoxIcon(): Icon {
    if (MetalIconFactory.checkBoxIcon == null) {
      MetalIconFactory.checkBoxIcon = new MetalIconFactory$CheckBoxIcon()._MetalIconFactory$CheckBoxIcon();
    }
    return MetalIconFactory.checkBoxIcon;
  }
  /**
   * Returns the instance of {@code TreeComputerIcon}.
   *
   * @return the instance of {@code TreeComputerIcon}
   */
  static getTreeComputerIcon(): Icon {
    if (MetalIconFactory.treeComputerIcon == null) {
      MetalIconFactory.treeComputerIcon = new MetalIconFactory$TreeComputerIcon()._MetalIconFactory$TreeComputerIcon();
    }
    return MetalIconFactory.treeComputerIcon;
  }
  /**
   * Returns the instance of {@code TreeFloppyDriveIcon}.
   *
   * @return the instance of {@code TreeFloppyDriveIcon}
   */
  static getTreeFloppyDriveIcon(): Icon {
    if (MetalIconFactory.treeFloppyDriveIcon == null) {
      MetalIconFactory.treeFloppyDriveIcon = new MetalIconFactory$TreeFloppyDriveIcon()._MetalIconFactory$TreeFloppyDriveIcon();
    }
    return MetalIconFactory.treeFloppyDriveIcon;
  }
  /**
   * Constructs a new instance of {@code TreeFolderIcon}.
   *
   * @return a new instance of {@code TreeFolderIcon}
   */
  static getTreeFolderIcon(): Icon {
    return new MetalIconFactory$TreeFolderIcon()._MetalIconFactory$TreeFolderIcon();
  }
  /**
   * Returns the instance of {@code TreeHardDriveIcon}.
   *
   * @return the instance of {@code TreeHardDriveIcon}
   */
  static getTreeHardDriveIcon(): Icon {
    if (MetalIconFactory.treeHardDriveIcon == null) {
      MetalIconFactory.treeHardDriveIcon = new MetalIconFactory$TreeHardDriveIcon()._MetalIconFactory$TreeHardDriveIcon();
    }
    return MetalIconFactory.treeHardDriveIcon;
  }
  /**
   * Constructs a new instance of {@code TreeLeafIcon}.
   *
   * @return a new instance of {@code TreeLeafIcon}
   */
  static getTreeLeafIcon(): Icon {
    return new MetalIconFactory$TreeLeafIcon()._MetalIconFactory$TreeLeafIcon();
  }
  /**
   * Constructs a new instance of {@code TreeControlIcon}.
   *
   * @param isCollapsed if {@code true} the icon is collapsed
   * @return a new instance of {@code TreeControlIcon}
   */
  static getTreeControlIcon(isCollapsed: boolean): Icon {
    return new MetalIconFactory$TreeControlIcon()._MetalIconFactory$TreeControlIcon(isCollapsed);
  }
  /**
   * Returns an icon to be used by {@code JMenu}.
   *
   * @return an icon to be used by {@code JMenu}
   */
  static getMenuArrowIcon(): Icon {
    if (MetalIconFactory.menuArrowIcon == null) {
      MetalIconFactory.menuArrowIcon = new MetalIconFactory$MenuArrowIcon()._MetalIconFactory$MenuArrowIcon();
    }
    return MetalIconFactory.menuArrowIcon;
  }
  /**
   * Returns an icon to be used by <code>JCheckBoxMenuItem</code>.
   *
   * @return the default icon for check box menu items,
   *         or <code>null</code> if no default exists
   */
  static getMenuItemCheckIcon(): Icon {
    return null;
  }
  /**
   * Returns an icon to be used by {@code JMenuItem}.
   *
   * @return an icon to be used by {@code JMenuItem}
   */
  static getMenuItemArrowIcon(): Icon {
    if (MetalIconFactory.menuItemArrowIcon == null) {
      MetalIconFactory.menuItemArrowIcon = new MetalIconFactory$MenuItemArrowIcon()._MetalIconFactory$MenuItemArrowIcon();
    }
    return MetalIconFactory.menuItemArrowIcon;
  }
  /**
   * Returns an icon to be used by {@code JCheckBoxMenuItem}.
   *
   * @return an icon to be used by {@code JCheckBoxMenuItem}
   */
  static getCheckBoxMenuItemIcon(): Icon {
    if (MetalIconFactory.checkBoxMenuItemIcon == null) {
      MetalIconFactory.checkBoxMenuItemIcon = new MetalIconFactory$CheckBoxMenuItemIcon()._MetalIconFactory$CheckBoxMenuItemIcon();
    }
    return MetalIconFactory.checkBoxMenuItemIcon;
  }
  /**
   * Returns an icon to be used by {@code JRadioButtonMenuItem}.
   *
   * @return an icon to be used by {@code JRadioButtonMenuItem}
   */
  static getRadioButtonMenuItemIcon(): Icon {
    if (MetalIconFactory.radioButtonMenuItemIcon == null) {
      MetalIconFactory.radioButtonMenuItemIcon = new MetalIconFactory$RadioButtonMenuItemIcon()._MetalIconFactory$RadioButtonMenuItemIcon();
    }
    return MetalIconFactory.radioButtonMenuItemIcon;
  }
  /**
   * Returns a thumb icon to be used by horizontal slider.
   *
   * @return a thumb icon to be used by horizontal slider
   */
  static getHorizontalSliderThumbIcon(): Icon {
    if (MetalLookAndFeel.usingOcean()) {
      if (MetalIconFactory.oceanHorizontalSliderThumb == null) {
        MetalIconFactory.oceanHorizontalSliderThumb = new MetalIconFactory$OceanHorizontalSliderThumbIcon()._MetalIconFactory$OceanHorizontalSliderThumbIcon();
      }
      return MetalIconFactory.oceanHorizontalSliderThumb;
    }
    return new MetalIconFactory$HorizontalSliderThumbIcon()._MetalIconFactory$HorizontalSliderThumbIcon();
  }
  /**
   * Returns a thumb icon to be used by vertical slider.
   *
   * @return a thumb icon to be used by vertical slider
   */
  static getVerticalSliderThumbIcon(): Icon {
    if (MetalLookAndFeel.usingOcean()) {
      if (MetalIconFactory.oceanVerticalSliderThumb == null) {
        MetalIconFactory.oceanVerticalSliderThumb = new MetalIconFactory$OceanVerticalSliderThumbIcon()._MetalIconFactory$OceanVerticalSliderThumbIcon();
      }
      return MetalIconFactory.oceanVerticalSliderThumb;
    }
    return new MetalIconFactory$VerticalSliderThumbIcon()._MetalIconFactory$VerticalSliderThumbIcon();
  }
  static $clinit() {
    MetalIconFactory.folderIcon16Size = new Dimension()._Dimension$int$int(16, 16);
    MetalIconFactory.fileIcon16Size = new Dimension()._Dimension$int$int(16, 16);
    MetalIconFactory.treeControlSize = new Dimension()._Dimension$int$int(18, 18);
    MetalIconFactory.menuArrowIconSize = new Dimension()._Dimension$int$int(4, 8);
    MetalIconFactory.menuCheckIconSize = new Dimension()._Dimension$int$int(10, 10);
  }
}

export class MetalIconFactory$FileChooserDetailViewIcon extends JObject {
  _MetalIconFactory$FileChooserDetailViewIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(2, 2, 5, 2);
    g.drawLine(2, 3, 2, 7);
    g.drawLine(3, 7, 6, 7);
    g.drawLine(6, 6, 6, 3);
    g.drawLine(2, 10, 5, 10);
    g.drawLine(2, 11, 2, 15);
    g.drawLine(3, 15, 6, 15);
    g.drawLine(6, 14, 6, 11);
    g.drawLine(8, 5, 15, 5);
    g.drawLine(8, 13, 15, 13);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.drawRect(3, 3, 2, 3);
    g.drawRect(3, 11, 2, 3);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine(4, 4, 4, 5);
    g.drawLine(4, 12, 4, 13);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 18;
  }
  getIconHeight(): number {
    return 18;
  }
}

export class MetalIconFactory$FileChooserHomeFolderIcon extends JObject {
  _MetalIconFactory$FileChooserHomeFolderIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(8, 1, 1, 8);
    g.drawLine(8, 1, 15, 8);
    g.drawLine(11, 2, 11, 3);
    g.drawLine(12, 2, 12, 4);
    g.drawLine(3, 7, 3, 15);
    g.drawLine(13, 7, 13, 15);
    g.drawLine(4, 15, 12, 15);
    g.drawLine(6, 9, 6, 14);
    g.drawLine(10, 9, 10, 14);
    g.drawLine(7, 9, 9, 9);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.fillRect(8, 2, 1, 1);
    g.fillRect(7, 3, 3, 1);
    g.fillRect(6, 4, 5, 1);
    g.fillRect(5, 5, 7, 1);
    g.fillRect(4, 6, 9, 2);
    g.drawLine(9, 12, 9, 12);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.drawLine(4, 8, 12, 8);
    g.fillRect(4, 9, 2, 6);
    g.fillRect(11, 9, 2, 6);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 18;
  }
  getIconHeight(): number {
    return 18;
  }
}

export class MetalIconFactory$FileChooserListViewIcon extends JObject {
  _MetalIconFactory$FileChooserListViewIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(2, 2, 5, 2);
    g.drawLine(2, 3, 2, 7);
    g.drawLine(3, 7, 6, 7);
    g.drawLine(6, 6, 6, 3);
    g.drawLine(10, 2, 13, 2);
    g.drawLine(10, 3, 10, 7);
    g.drawLine(11, 7, 14, 7);
    g.drawLine(14, 6, 14, 3);
    g.drawLine(2, 10, 5, 10);
    g.drawLine(2, 11, 2, 15);
    g.drawLine(3, 15, 6, 15);
    g.drawLine(6, 14, 6, 11);
    g.drawLine(10, 10, 13, 10);
    g.drawLine(10, 11, 10, 15);
    g.drawLine(11, 15, 14, 15);
    g.drawLine(14, 14, 14, 11);
    g.drawLine(8, 5, 8, 5);
    g.drawLine(16, 5, 16, 5);
    g.drawLine(8, 13, 8, 13);
    g.drawLine(16, 13, 16, 13);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.drawRect(3, 3, 2, 3);
    g.drawRect(11, 3, 2, 3);
    g.drawRect(3, 11, 2, 3);
    g.drawRect(11, 11, 2, 3);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine(4, 4, 4, 5);
    g.drawLine(12, 4, 12, 5);
    g.drawLine(4, 12, 4, 13);
    g.drawLine(12, 12, 12, 13);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 18;
  }
  getIconHeight(): number {
    return 18;
  }
}

export class MetalIconFactory$FileChooserNewFolderIcon extends JObject {
  _MetalIconFactory$FileChooserNewFolderIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.fillRect(3, 5, 12, 9);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(1, 6, 1, 14);
    g.drawLine(2, 14, 15, 14);
    g.drawLine(15, 13, 15, 5);
    g.drawLine(2, 5, 9, 5);
    g.drawLine(10, 6, 14, 6);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine(2, 6, 2, 13);
    g.drawLine(3, 6, 9, 6);
    g.drawLine(10, 7, 14, 7);
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawLine(11, 3, 15, 3);
    g.drawLine(10, 4, 15, 4);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 18;
  }
  getIconHeight(): number {
    return 18;
  }
}

export class MetalIconFactory$FileChooserUpFolderIcon extends JObject {
  _MetalIconFactory$FileChooserUpFolderIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.fillRect(3, 5, 12, 9);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(1, 6, 1, 14);
    g.drawLine(2, 14, 15, 14);
    g.drawLine(15, 13, 15, 5);
    g.drawLine(2, 5, 9, 5);
    g.drawLine(10, 6, 14, 6);
    g.drawLine(8, 13, 8, 16);
    g.drawLine(8, 9, 8, 9);
    g.drawLine(7, 10, 9, 10);
    g.drawLine(6, 11, 10, 11);
    g.drawLine(5, 12, 11, 12);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine(2, 6, 2, 13);
    g.drawLine(3, 6, 9, 6);
    g.drawLine(10, 7, 14, 7);
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawLine(11, 3, 15, 3);
    g.drawLine(10, 4, 15, 4);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 18;
  }
  getIconHeight(): number {
    return 18;
  }
}

/**
 * Defines an icon for Palette close
 * @since 1.3
 */
export class MetalIconFactory$PaletteCloseIcon extends JObject {
  iconSize: number = 0;
  /**
   * Constructs a {@code PaletteCloseIcon}.
   */
  _MetalIconFactory$PaletteCloseIcon(): this {
    this.iconSize = 7;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let parentButton = c;
    let buttonModel = parentButton.getModel();
    let back: Color;
    let highlight = MetalLookAndFeel.getPrimaryControlHighlight();
    let shadow = MetalLookAndFeel.getPrimaryControlInfo();
    if (buttonModel.isPressed() && buttonModel.isArmed()) {
      back = shadow;
    } else {
      back = MetalLookAndFeel.getPrimaryControlDarkShadow();
    }
    g.translate$int$int(x, y);
    g.setColor(back);
    g.drawLine(0, 1, 5, 6);
    g.drawLine(1, 0, 6, 5);
    g.drawLine(1, 1, 6, 6);
    g.drawLine(6, 1, 1, 6);
    g.drawLine(5, 0, 0, 5);
    g.drawLine(5, 1, 1, 5);
    g.setColor(highlight);
    g.drawLine(6, 2, 5, 3);
    g.drawLine(2, 6, 3, 5);
    g.drawLine(6, 6, 6, 6);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return this.iconSize;
  }
  getIconHeight(): number {
    return this.iconSize;
  }
}

export class MetalIconFactory$InternalFrameCloseIcon extends JObject {
  iconSize: number = 0;
  _MetalIconFactory$InternalFrameCloseIcon(size: number): this {
    this.iconSize = 16;
    this.iconSize = size;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let parentButton = c;
    let buttonModel = parentButton.getModel();
    let backgroundColor = MetalLookAndFeel.getPrimaryControl();
    let internalBackgroundColor = MetalLookAndFeel.getPrimaryControl();
    let mainItemColor = MetalLookAndFeel.getPrimaryControlDarkShadow();
    let darkHighlightColor = MetalLookAndFeel.getBlack();
    let xLightHighlightColor = MetalLookAndFeel.getWhite();
    let boxLightHighlightColor = MetalLookAndFeel.getWhite();
    if (parentButton.getClientProperty('paintActive') !== true) {
      backgroundColor = MetalLookAndFeel.getControl();
      internalBackgroundColor = backgroundColor;
      mainItemColor = MetalLookAndFeel.getControlDarkShadow();
      if (buttonModel.isPressed() && buttonModel.isArmed()) {
        internalBackgroundColor = MetalLookAndFeel.getControlShadow();
        xLightHighlightColor = internalBackgroundColor;
        mainItemColor = darkHighlightColor;
      }
    } else if (buttonModel.isPressed() && buttonModel.isArmed()) {
      internalBackgroundColor = MetalLookAndFeel.getPrimaryControlShadow();
      xLightHighlightColor = internalBackgroundColor;
      mainItemColor = darkHighlightColor;
    }
    let oneHalf = $J.idiv(this.iconSize, 2);
    g.translate$int$int(x, y);
    g.setColor(backgroundColor);
    g.fillRect(0, 0, this.iconSize, this.iconSize);
    g.setColor(internalBackgroundColor);
    g.fillRect(3, 3, (this.iconSize - 6) | 0, (this.iconSize - 6) | 0);
    g.setColor(darkHighlightColor);
    g.drawRect(1, 1, (this.iconSize - 3) | 0, (this.iconSize - 3) | 0);
    g.drawRect(2, 2, (this.iconSize - 5) | 0, (this.iconSize - 5) | 0);
    g.setColor(boxLightHighlightColor);
    g.drawRect(2, 2, (this.iconSize - 3) | 0, (this.iconSize - 3) | 0);
    g.setColor(mainItemColor);
    g.drawRect(2, 2, (this.iconSize - 4) | 0, (this.iconSize - 4) | 0);
    g.drawLine(3, (this.iconSize - 3) | 0, 3, (this.iconSize - 3) | 0);
    g.drawLine((this.iconSize - 3) | 0, 3, (this.iconSize - 3) | 0, 3);
    g.setColor(darkHighlightColor);
    g.drawLine(4, 5, 5, 4);
    g.drawLine(4, (this.iconSize - 6) | 0, (this.iconSize - 6) | 0, 4);
    g.setColor(xLightHighlightColor);
    g.drawLine(6, (this.iconSize - 5) | 0, (this.iconSize - 5) | 0, 6);
    g.drawLine(oneHalf, (oneHalf + 2) | 0, (oneHalf + 2) | 0, oneHalf);
    g.drawLine((this.iconSize - 5) | 0, (this.iconSize - 5) | 0, (this.iconSize - 4) | 0, (this.iconSize - 5) | 0);
    g.drawLine((this.iconSize - 5) | 0, (this.iconSize - 4) | 0, (this.iconSize - 5) | 0, (this.iconSize - 4) | 0);
    g.setColor(mainItemColor);
    g.drawLine(5, 5, (this.iconSize - 6) | 0, (this.iconSize - 6) | 0);
    g.drawLine(6, 5, (this.iconSize - 5) | 0, (this.iconSize - 6) | 0);
    g.drawLine(5, 6, (this.iconSize - 6) | 0, (this.iconSize - 5) | 0);
    g.drawLine(5, (this.iconSize - 5) | 0, (this.iconSize - 5) | 0, 5);
    g.drawLine(5, (this.iconSize - 6) | 0, (this.iconSize - 6) | 0, 5);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return this.iconSize;
  }
  getIconHeight(): number {
    return this.iconSize;
  }
}

export class MetalIconFactory$InternalFrameAltMaximizeIcon extends JObject {
  iconSize: number = 0;
  _MetalIconFactory$InternalFrameAltMaximizeIcon(size: number): this {
    this.iconSize = 16;
    this.iconSize = size;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let parentButton = c;
    let buttonModel = parentButton.getModel();
    let backgroundColor = MetalLookAndFeel.getPrimaryControl();
    let internalBackgroundColor = MetalLookAndFeel.getPrimaryControl();
    let mainItemColor = MetalLookAndFeel.getPrimaryControlDarkShadow();
    let darkHighlightColor = MetalLookAndFeel.getBlack();
    let ulLightHighlightColor = MetalLookAndFeel.getWhite();
    let lrLightHighlightColor = MetalLookAndFeel.getWhite();
    if (parentButton.getClientProperty('paintActive') !== true) {
      backgroundColor = MetalLookAndFeel.getControl();
      internalBackgroundColor = backgroundColor;
      mainItemColor = MetalLookAndFeel.getControlDarkShadow();
      if (buttonModel.isPressed() && buttonModel.isArmed()) {
        internalBackgroundColor = MetalLookAndFeel.getControlShadow();
        ulLightHighlightColor = internalBackgroundColor;
        mainItemColor = darkHighlightColor;
      }
    } else if (buttonModel.isPressed() && buttonModel.isArmed()) {
      internalBackgroundColor = MetalLookAndFeel.getPrimaryControlShadow();
      ulLightHighlightColor = internalBackgroundColor;
      mainItemColor = darkHighlightColor;
    }
    g.translate$int$int(x, y);
    g.setColor(backgroundColor);
    g.fillRect(0, 0, this.iconSize, this.iconSize);
    g.setColor(internalBackgroundColor);
    g.fillRect(3, 6, (this.iconSize - 9) | 0, (this.iconSize - 9) | 0);
    g.setColor(darkHighlightColor);
    g.drawRect(1, 5, (this.iconSize - 8) | 0, (this.iconSize - 8) | 0);
    g.drawLine(1, (this.iconSize - 2) | 0, 1, (this.iconSize - 2) | 0);
    g.setColor(lrLightHighlightColor);
    g.drawRect(2, 6, (this.iconSize - 7) | 0, (this.iconSize - 7) | 0);
    g.setColor(ulLightHighlightColor);
    g.drawRect(3, 7, (this.iconSize - 9) | 0, (this.iconSize - 9) | 0);
    g.setColor(mainItemColor);
    g.drawRect(2, 6, (this.iconSize - 8) | 0, (this.iconSize - 8) | 0);
    g.setColor(ulLightHighlightColor);
    g.drawLine((this.iconSize - 6) | 0, 8, (this.iconSize - 6) | 0, 8);
    g.drawLine((this.iconSize - 9) | 0, 6, (this.iconSize - 7) | 0, 8);
    g.setColor(mainItemColor);
    g.drawLine(3, (this.iconSize - 3) | 0, 3, (this.iconSize - 3) | 0);
    g.setColor(darkHighlightColor);
    g.drawLine((this.iconSize - 6) | 0, 9, (this.iconSize - 6) | 0, 9);
    g.setColor(backgroundColor);
    g.drawLine((this.iconSize - 9) | 0, 5, (this.iconSize - 9) | 0, 5);
    g.setColor(mainItemColor);
    g.fillRect((this.iconSize - 7) | 0, 3, 3, 5);
    g.drawLine((this.iconSize - 6) | 0, 5, (this.iconSize - 3) | 0, 2);
    g.drawLine((this.iconSize - 6) | 0, 6, (this.iconSize - 2) | 0, 2);
    g.drawLine((this.iconSize - 6) | 0, 7, (this.iconSize - 3) | 0, 7);
    g.setColor(darkHighlightColor);
    g.drawLine((this.iconSize - 8) | 0, 2, (this.iconSize - 7) | 0, 2);
    g.drawLine((this.iconSize - 8) | 0, 3, (this.iconSize - 8) | 0, 7);
    g.drawLine((this.iconSize - 6) | 0, 4, (this.iconSize - 3) | 0, 1);
    g.drawLine((this.iconSize - 4) | 0, 6, (this.iconSize - 3) | 0, 6);
    g.setColor(lrLightHighlightColor);
    g.drawLine((this.iconSize - 6) | 0, 3, (this.iconSize - 6) | 0, 3);
    g.drawLine((this.iconSize - 4) | 0, 5, (this.iconSize - 2) | 0, 3);
    g.drawLine((this.iconSize - 4) | 0, 8, (this.iconSize - 3) | 0, 8);
    g.drawLine((this.iconSize - 2) | 0, 8, (this.iconSize - 2) | 0, 7);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return this.iconSize;
  }
  getIconHeight(): number {
    return this.iconSize;
  }
}

export class MetalIconFactory$InternalFrameDefaultMenuIcon extends JObject {
  _MetalIconFactory$InternalFrameDefaultMenuIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let windowBodyColor = MetalLookAndFeel.getWindowBackground();
    let titleColor = MetalLookAndFeel.getPrimaryControl();
    let edgeColor = MetalLookAndFeel.getPrimaryControlDarkShadow();
    g.translate$int$int(x, y);
    g.setColor(titleColor);
    g.fillRect(0, 0, 16, 16);
    g.setColor(windowBodyColor);
    g.fillRect(2, 6, 13, 9);
    g.drawLine(2, 2, 2, 2);
    g.drawLine(5, 2, 5, 2);
    g.drawLine(8, 2, 8, 2);
    g.drawLine(11, 2, 11, 2);
    g.setColor(edgeColor);
    g.drawRect(1, 1, 13, 13);
    g.drawLine(1, 0, 14, 0);
    g.drawLine(15, 1, 15, 14);
    g.drawLine(1, 15, 14, 15);
    g.drawLine(0, 1, 0, 14);
    g.drawLine(2, 5, 13, 5);
    g.drawLine(3, 3, 3, 3);
    g.drawLine(6, 3, 6, 3);
    g.drawLine(9, 3, 9, 3);
    g.drawLine(12, 3, 12, 3);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 16;
  }
  getIconHeight(): number {
    return 16;
  }
}

export class MetalIconFactory$InternalFrameMaximizeIcon extends JObject {
  iconSize: number = 0;
  _MetalIconFactory$InternalFrameMaximizeIcon(size: number): this {
    this.iconSize = 16;
    this.iconSize = size;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let parentButton = c;
    let buttonModel = parentButton.getModel();
    let backgroundColor = MetalLookAndFeel.getPrimaryControl();
    let internalBackgroundColor = MetalLookAndFeel.getPrimaryControl();
    let mainItemColor = MetalLookAndFeel.getPrimaryControlDarkShadow();
    let darkHighlightColor = MetalLookAndFeel.getBlack();
    let ulLightHighlightColor = MetalLookAndFeel.getWhite();
    let lrLightHighlightColor = MetalLookAndFeel.getWhite();
    if (parentButton.getClientProperty('paintActive') !== true) {
      backgroundColor = MetalLookAndFeel.getControl();
      internalBackgroundColor = backgroundColor;
      mainItemColor = MetalLookAndFeel.getControlDarkShadow();
      if (buttonModel.isPressed() && buttonModel.isArmed()) {
        internalBackgroundColor = MetalLookAndFeel.getControlShadow();
        ulLightHighlightColor = internalBackgroundColor;
        mainItemColor = darkHighlightColor;
      }
    } else if (buttonModel.isPressed() && buttonModel.isArmed()) {
      internalBackgroundColor = MetalLookAndFeel.getPrimaryControlShadow();
      ulLightHighlightColor = internalBackgroundColor;
      mainItemColor = darkHighlightColor;
    }
    g.translate$int$int(x, y);
    g.setColor(backgroundColor);
    g.fillRect(0, 0, this.iconSize, this.iconSize);
    g.setColor(internalBackgroundColor);
    g.fillRect(3, 7, (this.iconSize - 10) | 0, (this.iconSize - 10) | 0);
    g.setColor(ulLightHighlightColor);
    g.drawRect(3, 7, (this.iconSize - 10) | 0, (this.iconSize - 10) | 0);
    g.setColor(lrLightHighlightColor);
    g.drawRect(2, 6, (this.iconSize - 7) | 0, (this.iconSize - 7) | 0);
    g.setColor(darkHighlightColor);
    g.drawRect(1, 5, (this.iconSize - 7) | 0, (this.iconSize - 7) | 0);
    g.drawRect(2, 6, (this.iconSize - 9) | 0, (this.iconSize - 9) | 0);
    g.setColor(mainItemColor);
    g.drawRect(2, 6, (this.iconSize - 8) | 0, (this.iconSize - 8) | 0);
    g.setColor(darkHighlightColor);
    g.drawLine(3, (this.iconSize - 5) | 0, (this.iconSize - 9) | 0, 7);
    g.drawLine((this.iconSize - 6) | 0, 4, (this.iconSize - 5) | 0, 3);
    g.drawLine((this.iconSize - 7) | 0, 1, (this.iconSize - 7) | 0, 2);
    g.drawLine((this.iconSize - 6) | 0, 1, (this.iconSize - 2) | 0, 1);
    g.setColor(ulLightHighlightColor);
    g.drawLine(5, (this.iconSize - 4) | 0, (this.iconSize - 8) | 0, 9);
    g.setColor(lrLightHighlightColor);
    g.drawLine((this.iconSize - 6) | 0, 3, (this.iconSize - 4) | 0, 5);
    g.drawLine((this.iconSize - 4) | 0, 5, (this.iconSize - 4) | 0, 6);
    g.drawLine((this.iconSize - 2) | 0, 7, (this.iconSize - 1) | 0, 7);
    g.drawLine((this.iconSize - 1) | 0, 2, (this.iconSize - 1) | 0, 6);
    g.setColor(mainItemColor);
    g.drawLine(3, (this.iconSize - 4) | 0, (this.iconSize - 3) | 0, 2);
    g.drawLine(3, (this.iconSize - 3) | 0, (this.iconSize - 2) | 0, 2);
    g.drawLine(4, (this.iconSize - 3) | 0, 5, (this.iconSize - 3) | 0);
    g.drawLine((this.iconSize - 7) | 0, 8, (this.iconSize - 7) | 0, 9);
    g.drawLine((this.iconSize - 6) | 0, 2, (this.iconSize - 4) | 0, 2);
    g.drawRect((this.iconSize - 3) | 0, 3, 1, 3);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return this.iconSize;
  }
  getIconHeight(): number {
    return this.iconSize;
  }
}

export class MetalIconFactory$InternalFrameMinimizeIcon extends JObject {
  iconSize: number = 0;
  _MetalIconFactory$InternalFrameMinimizeIcon(size: number): this {
    this.iconSize = 16;
    this.iconSize = size;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let parentButton = c;
    let buttonModel = parentButton.getModel();
    let backgroundColor = MetalLookAndFeel.getPrimaryControl();
    let internalBackgroundColor = MetalLookAndFeel.getPrimaryControl();
    let mainItemColor = MetalLookAndFeel.getPrimaryControlDarkShadow();
    let darkHighlightColor = MetalLookAndFeel.getBlack();
    let ulLightHighlightColor = MetalLookAndFeel.getWhite();
    let lrLightHighlightColor = MetalLookAndFeel.getWhite();
    if (parentButton.getClientProperty('paintActive') !== true) {
      backgroundColor = MetalLookAndFeel.getControl();
      internalBackgroundColor = backgroundColor;
      mainItemColor = MetalLookAndFeel.getControlDarkShadow();
      if (buttonModel.isPressed() && buttonModel.isArmed()) {
        internalBackgroundColor = MetalLookAndFeel.getControlShadow();
        ulLightHighlightColor = internalBackgroundColor;
        mainItemColor = darkHighlightColor;
      }
    } else if (buttonModel.isPressed() && buttonModel.isArmed()) {
      internalBackgroundColor = MetalLookAndFeel.getPrimaryControlShadow();
      ulLightHighlightColor = internalBackgroundColor;
      mainItemColor = darkHighlightColor;
    }
    g.translate$int$int(x, y);
    g.setColor(backgroundColor);
    g.fillRect(0, 0, this.iconSize, this.iconSize);
    g.setColor(internalBackgroundColor);
    g.fillRect(4, 11, (this.iconSize - 13) | 0, (this.iconSize - 13) | 0);
    g.setColor(lrLightHighlightColor);
    g.drawRect(2, 10, (this.iconSize - 10) | 0, (this.iconSize - 11) | 0);
    g.setColor(ulLightHighlightColor);
    g.drawRect(3, 10, (this.iconSize - 12) | 0, (this.iconSize - 12) | 0);
    g.setColor(darkHighlightColor);
    g.drawRect(1, 8, (this.iconSize - 10) | 0, (this.iconSize - 10) | 0);
    g.drawRect(2, 9, (this.iconSize - 12) | 0, (this.iconSize - 12) | 0);
    g.setColor(mainItemColor);
    g.drawRect(2, 9, (this.iconSize - 11) | 0, (this.iconSize - 11) | 0);
    g.drawLine((this.iconSize - 10) | 0, 10, (this.iconSize - 10) | 0, 10);
    g.drawLine(3, (this.iconSize - 3) | 0, 3, (this.iconSize - 3) | 0);
    g.setColor(mainItemColor);
    g.fillRect((this.iconSize - 7) | 0, 3, 3, 5);
    g.drawLine((this.iconSize - 6) | 0, 5, (this.iconSize - 3) | 0, 2);
    g.drawLine((this.iconSize - 6) | 0, 6, (this.iconSize - 2) | 0, 2);
    g.drawLine((this.iconSize - 6) | 0, 7, (this.iconSize - 3) | 0, 7);
    g.setColor(darkHighlightColor);
    g.drawLine((this.iconSize - 8) | 0, 2, (this.iconSize - 7) | 0, 2);
    g.drawLine((this.iconSize - 8) | 0, 3, (this.iconSize - 8) | 0, 7);
    g.drawLine((this.iconSize - 6) | 0, 4, (this.iconSize - 3) | 0, 1);
    g.drawLine((this.iconSize - 4) | 0, 6, (this.iconSize - 3) | 0, 6);
    g.setColor(lrLightHighlightColor);
    g.drawLine((this.iconSize - 6) | 0, 3, (this.iconSize - 6) | 0, 3);
    g.drawLine((this.iconSize - 4) | 0, 5, (this.iconSize - 2) | 0, 3);
    g.drawLine((this.iconSize - 7) | 0, 8, (this.iconSize - 3) | 0, 8);
    g.drawLine((this.iconSize - 2) | 0, 8, (this.iconSize - 2) | 0, 7);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return this.iconSize;
  }
  getIconHeight(): number {
    return this.iconSize;
  }
}

export class MetalIconFactory$CheckBoxIcon extends JObject {
  _MetalIconFactory$CheckBoxIcon(): this {
    return this;
  }
  getControlSize(): number {
    return 13;
  }
  paintOceanIcon(c: Component, g: Graphics, x: number, y: number): void {
    let model = (c).getModel();
    g.translate$int$int(x, y);
    let w = this.getIconWidth();
    let h = this.getIconHeight();
    if (model.isEnabled()) {
      if (model.isPressed() && model.isArmed()) {
        g.setColor(MetalLookAndFeel.getControlShadow());
        g.fillRect(0, 0, w, h);
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.fillRect(0, 0, w, 2);
        g.fillRect(0, 2, 2, (h - 2) | 0);
        g.fillRect((w - 1) | 0, 1, 1, (h - 1) | 0);
        g.fillRect(1, (h - 1) | 0, (w - 2) | 0, 1);
      } else if (model.isRollover()) {
        MetalUtils.drawGradient(c, g, 'CheckBox.gradient', 0, 0, w, h, true);
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
        g.setColor(MetalLookAndFeel.getPrimaryControl());
        g.drawRect(1, 1, (w - 3) | 0, (h - 3) | 0);
        g.drawRect(2, 2, (w - 5) | 0, (h - 5) | 0);
      } else {
        MetalUtils.drawGradient(c, g, 'CheckBox.gradient', 0, 0, w, h, true);
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
      }
      g.setColor(MetalLookAndFeel.getControlInfo());
    } else {
      g.setColor(MetalLookAndFeel.getControlDarkShadow());
      g.drawRect(0, 0, (w - 1) | 0, (h - 1) | 0);
    }
    g.translate$int$int(-x, -y);
    if (model.isSelected()) {
      this.drawCheck(c, g, x, y);
    }
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (MetalLookAndFeel.usingOcean()) {
      this.paintOceanIcon(c, g, x, y);
      return;
    }
    let model = (c).getModel();
    let controlSize = this.getControlSize();
    if (model.isEnabled()) {
      if (model.isPressed() && model.isArmed()) {
        g.setColor(MetalLookAndFeel.getControlShadow());
        g.fillRect(x, y, (controlSize - 1) | 0, (controlSize - 1) | 0);
        MetalUtils.drawPressed3DBorder$Graphics$int$int$int$int(g, x, y, controlSize, controlSize);
      } else {
        MetalUtils.drawFlush3DBorder$Graphics$int$int$int$int(g, x, y, controlSize, controlSize);
      }
      g.setColor(c.getForeground());
    } else {
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.drawRect(x, y, (controlSize - 2) | 0, (controlSize - 2) | 0);
    }
    if (model.isSelected()) {
      this.drawCheck(c, g, x, y);
    }
  }
  drawCheck(c: Component, g: Graphics, x: number, y: number): void {
    let controlSize = this.getControlSize();
    let csx = (controlSize - 3) | 0;
    let csy1 = (controlSize - 6) | 0;
    let csy2 = (controlSize - 4) | 0;
    let csy3 = (controlSize - 3) | 0;
    let xPoints = [3, 5, 5, csx, csx, 5, 5, 3];
    let yPoints = [5, 5, csy1, 2, 4, csy2, csy3, csy3];
    g.translate$int$int(x, y);
    g.fillPolygon$intArr$intArr$int(xPoints, yPoints, 8);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return this.getControlSize();
  }
  getIconHeight(): number {
    return this.getControlSize();
  }
}

export class MetalIconFactory$RadioButtonIcon extends JObject {
  _MetalIconFactory$RadioButtonIcon(): this {
    return this;
  }
  paintOceanIcon(c: Component, g: Graphics, x: number, y: number): void {
    let model = (c).getModel();
    let enabled = model.isEnabled();
    let pressed = (enabled && model.isPressed() && model.isArmed());
    let rollover = (enabled && model.isRollover());
    g.translate$int$int(x, y);
    if (enabled && !pressed) {
      MetalUtils.drawGradient(c, g, 'RadioButton.gradient', 1, 1, 10, 10, true);
      g.setColor(c.getBackground());
      g.fillRect(1, 1, 1, 1);
      g.fillRect(10, 1, 1, 1);
      g.fillRect(1, 10, 1, 1);
      g.fillRect(10, 10, 1, 1);
    } else if (pressed || !enabled) {
      if (pressed) {
        g.setColor(MetalLookAndFeel.getPrimaryControl());
      } else {
        g.setColor(MetalLookAndFeel.getControl());
      }
      g.fillOval(1, 1, 9, 9);
    }
    if (!enabled) {
      g.setColor(MetalLookAndFeel.getInactiveControlTextColor());
    } else {
      g.setColor(MetalLookAndFeel.getControlDarkShadow());
    }
    g.drawOval(0, 0, 11, 11);
    if (pressed) {
      g.drawArc(1, 1, 10, 10, 60, 160);
    } else if (rollover) {
      g.setColor(MetalLookAndFeel.getPrimaryControl());
      g.drawOval(2, 2, 7, 7);
    }
    if (model.isSelected()) {
      if (enabled) {
        g.setColor(MetalLookAndFeel.getControlInfo());
      } else {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
      }
      g.fillOval(2, 2, 7, 7);
    }
    g.translate$int$int(-x, -y);
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let aaHint = SwingUtilities2.getAndSetAntialisingHintForScaledGraphics(g);
    if (MetalLookAndFeel.usingOcean()) {
      this.paintOceanIcon(c, g, x, y);
      SwingUtilities2.setAntialiasingHintForScaledGraphics(g, aaHint);
      return;
    }
    let rb = c;
    let model = rb.getModel();
    let drawDot = model.isSelected();
    let background = c.getBackground();
    let dotColor = c.getForeground();
    let shadow = MetalLookAndFeel.getControlShadow();
    let darkCircle = MetalLookAndFeel.getControlDarkShadow();
    let whiteInnerLeftArc = MetalLookAndFeel.getControlHighlight();
    let whiteOuterRightArc = MetalLookAndFeel.getControlHighlight();
    let interiorColor = background;
    if (!model.isEnabled()) {
      whiteInnerLeftArc = whiteOuterRightArc = background;
      darkCircle = dotColor = shadow;
    } else if (model.isPressed() && model.isArmed()) {
      whiteInnerLeftArc = interiorColor = shadow;
    }
    g.translate$int$int(x, y);
    if (c.isOpaque()) {
      g.setColor(interiorColor);
      g.fillRect(2, 2, 9, 9);
    }
    g.setColor(darkCircle);
    g.drawOval(0, 0, 11, 11);
    g.setColor(whiteInnerLeftArc);
    g.drawArc(1, 1, 10, 10, 60, 160);
    g.setColor(whiteOuterRightArc);
    g.drawArc(-1, -1, 13, 13, 235, 180);
    if (drawDot) {
      g.setColor(dotColor);
      g.fillOval(2, 2, 7, 7);
    }
    g.translate$int$int(-x, -y);
    SwingUtilities2.setAntialiasingHintForScaledGraphics(g, aaHint);
  }
  getIconWidth(): number {
    return 13;
  }
  getIconHeight(): number {
    return 13;
  }
}

export class MetalIconFactory$TreeComputerIcon extends JObject {
  _MetalIconFactory$TreeComputerIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.fillRect(5, 4, 6, 4);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(2, 2, 2, 8);
    g.drawLine(13, 2, 13, 8);
    g.drawLine(3, 1, 12, 1);
    g.drawLine(12, 9, 12, 9);
    g.drawLine(3, 9, 3, 9);
    g.drawLine(4, 4, 4, 7);
    g.drawLine(5, 3, 10, 3);
    g.drawLine(11, 4, 11, 7);
    g.drawLine(5, 8, 10, 8);
    g.drawLine(1, 10, 14, 10);
    g.drawLine(14, 10, 14, 14);
    g.drawLine(1, 14, 14, 14);
    g.drawLine(1, 10, 1, 14);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.drawLine(6, 12, 8, 12);
    g.drawLine(10, 12, 12, 12);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 16;
  }
  getIconHeight(): number {
    return 16;
  }
}

export class MetalIconFactory$TreeHardDriveIcon extends JObject {
  _MetalIconFactory$TreeHardDriveIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(1, 4, 1, 5);
    g.drawLine(2, 3, 3, 3);
    g.drawLine(4, 2, 11, 2);
    g.drawLine(12, 3, 13, 3);
    g.drawLine(14, 4, 14, 5);
    g.drawLine(12, 6, 13, 6);
    g.drawLine(4, 7, 11, 7);
    g.drawLine(2, 6, 3, 6);
    g.drawLine(1, 7, 1, 8);
    g.drawLine(2, 9, 3, 9);
    g.drawLine(4, 10, 11, 10);
    g.drawLine(12, 9, 13, 9);
    g.drawLine(14, 7, 14, 8);
    g.drawLine(1, 10, 1, 11);
    g.drawLine(2, 12, 3, 12);
    g.drawLine(4, 13, 11, 13);
    g.drawLine(12, 12, 13, 12);
    g.drawLine(14, 10, 14, 11);
    g.setColor(MetalLookAndFeel.getControlShadow());
    g.drawLine(7, 6, 7, 6);
    g.drawLine(9, 6, 9, 6);
    g.drawLine(10, 5, 10, 5);
    g.drawLine(11, 6, 11, 6);
    g.drawLine(12, 5, 13, 5);
    g.drawLine(13, 4, 13, 4);
    g.drawLine(7, 9, 7, 9);
    g.drawLine(9, 9, 9, 9);
    g.drawLine(10, 8, 10, 8);
    g.drawLine(11, 9, 11, 9);
    g.drawLine(12, 8, 13, 8);
    g.drawLine(13, 7, 13, 7);
    g.drawLine(7, 12, 7, 12);
    g.drawLine(9, 12, 9, 12);
    g.drawLine(10, 11, 10, 11);
    g.drawLine(11, 12, 11, 12);
    g.drawLine(12, 11, 13, 11);
    g.drawLine(13, 10, 13, 10);
    g.setColor(MetalLookAndFeel.getControlHighlight());
    g.drawLine(4, 3, 5, 3);
    g.drawLine(7, 3, 9, 3);
    g.drawLine(11, 3, 11, 3);
    g.drawLine(2, 4, 6, 4);
    g.drawLine(8, 4, 8, 4);
    g.drawLine(2, 5, 3, 5);
    g.drawLine(4, 6, 4, 6);
    g.drawLine(2, 7, 3, 7);
    g.drawLine(2, 8, 3, 8);
    g.drawLine(4, 9, 4, 9);
    g.drawLine(2, 10, 3, 10);
    g.drawLine(2, 11, 3, 11);
    g.drawLine(4, 12, 4, 12);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 16;
  }
  getIconHeight(): number {
    return 16;
  }
}

export class MetalIconFactory$TreeFloppyDriveIcon extends JObject {
  _MetalIconFactory$TreeFloppyDriveIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.fillRect(2, 2, 12, 12);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(1, 1, 13, 1);
    g.drawLine(14, 2, 14, 14);
    g.drawLine(1, 14, 14, 14);
    g.drawLine(1, 1, 1, 14);
    g.setColor(MetalLookAndFeel.getControlDarkShadow());
    g.fillRect(5, 2, 6, 5);
    g.drawLine(4, 8, 11, 8);
    g.drawLine(3, 9, 3, 13);
    g.drawLine(12, 9, 12, 13);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.fillRect(8, 3, 2, 3);
    g.fillRect(4, 9, 8, 5);
    g.setColor(MetalLookAndFeel.getPrimaryControlShadow());
    g.drawLine(5, 10, 9, 10);
    g.drawLine(5, 12, 8, 12);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 16;
  }
  getIconHeight(): number {
    return 16;
  }
}

/**
 * Utility class for caching icon images.  This is necessary because
 * we need a new image whenever we are rendering into a new
 * GraphicsConfiguration, but we do not want to keep recreating icon
 * images for GC's that we have already seen (for example,
 * dragging a window back and forth between monitors on a multimon
 * system, or drawing an icon to different Components that have different
 * GC's).
 * So now whenever we create a new icon image for a given GC, we
 * cache that image with the GC for later retrieval.
 */
export class MetalIconFactory$ImageCacher extends JObject {
  images: Vector<MetalIconFactory$ImageCacher$ImageGcPair> = null;
  currentImageGcPair: MetalIconFactory$ImageCacher$ImageGcPair = null;
  _MetalIconFactory$ImageCacher(): this {
    this.images = new Vector(1, 1);
    return this;
  }
  getImage(newGC: GraphicsConfiguration): Image {
    if ((this.currentImageGcPair == null) || !(this.currentImageGcPair.hasSameConfiguration(newGC))) {
      for (const $it0 = this.images.iterator(); $it0.hasNext(); ) {
        let imgGcPair = $it0.next();
        if (imgGcPair.hasSameConfiguration(newGC)) {
          this.currentImageGcPair = imgGcPair;
          return imgGcPair.image;
        }
      }
      return null;
    }
    return this.currentImageGcPair.image;
  }
  cacheImage(image: Image, gc: GraphicsConfiguration): void {
    let imgGcPair = new MetalIconFactory$ImageCacher$ImageGcPair()._MetalIconFactory$ImageCacher$ImageGcPair(image, gc);
    this.images.addElement(imgGcPair);
    this.currentImageGcPair = imgGcPair;
  }
}

export class MetalIconFactory$ImageCacher$ImageGcPair extends JObject {
  image: Image = null;
  gc: GraphicsConfiguration = null;
  _MetalIconFactory$ImageCacher$ImageGcPair(image: Image, gc: GraphicsConfiguration): this {
    this.image = image;
    this.gc = gc;
    return this;
  }
  hasSameConfiguration(newGC: GraphicsConfiguration): boolean {
    return ((newGC != null) && (newGC.equals(this.gc))) || ((newGC == null) && (this.gc == null));
  }
}

/**
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class MetalIconFactory$FolderIcon16 extends JObject {
  imageCacher: MetalIconFactory$ImageCacher = null;
  /**
   * Constructs a {@code FolderIcon16}.
   */
  _MetalIconFactory$FolderIcon16(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let gc = c.getGraphicsConfiguration();
    if (this.imageCacher == null) {
      this.imageCacher = new MetalIconFactory$ImageCacher()._MetalIconFactory$ImageCacher();
    }
    let image = this.imageCacher.getImage(gc);
    if (image == null) {
      if (gc != null) {
        image = gc.createCompatibleImage$int$int$int(this.getIconWidth(), this.getIconHeight(), Transparency.BITMASK);
      } else {
        image = new BufferedImage(this.getIconWidth(), this.getIconHeight(), 2);
      }
      let imageG = image.getGraphics();
      this.paintMe(c, imageG);
      imageG.dispose();
      this.imageCacher.cacheImage(image, gc);
    }
    g.drawImage$Image$int$int$ImageObserver(image, x, (y + this.getShift()) | 0, null);
  }
  paintMe(c: Component, g: Graphics): void {
    let right = (MetalIconFactory.folderIcon16Size.width_ - 1) | 0;
    let bottom = (MetalIconFactory.folderIcon16Size.height_ - 1) | 0;
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawLine((right - 5) | 0, 3, right, 3);
    g.drawLine((right - 6) | 0, 4, right, 4);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.fillRect(2, 7, 13, 8);
    g.setColor(MetalLookAndFeel.getPrimaryControlShadow());
    g.drawLine((right - 6) | 0, 5, (right - 1) | 0, 5);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(0, 6, 0, bottom);
    g.drawLine(1, 5, (right - 7) | 0, 5);
    g.drawLine((right - 6) | 0, 6, (right - 1) | 0, 6);
    g.drawLine(right, 5, right, bottom);
    g.drawLine(0, bottom, right, bottom);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine(1, 6, 1, (bottom - 1) | 0);
    g.drawLine(1, 6, (right - 7) | 0, 6);
    g.drawLine((right - 6) | 0, 7, (right - 1) | 0, 7);
  }
  getIconWidth(): number {
    return MetalIconFactory.folderIcon16Size.width_;
  }
  getIconHeight(): number {
    return (MetalIconFactory.folderIcon16Size.height_ + this.getAdditionalHeight()) | 0;
  }
}

/**
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class MetalIconFactory$TreeFolderIcon extends MetalIconFactory$FolderIcon16 {
  /**
   * Constructs a {@code TreeFolderIcon}.
   */
  _MetalIconFactory$TreeFolderIcon(): this {
    this._MetalIconFactory$FolderIcon16();
    return this;
  }
  getShift(): number {
    return -1;
  }
  getAdditionalHeight(): number {
    return 2;
  }
}

/**
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class MetalIconFactory$FileIcon16 extends JObject {
  imageCacher: MetalIconFactory$ImageCacher = null;
  /**
   * Constructs a {@code FileIcon16}.
   */
  _MetalIconFactory$FileIcon16(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let gc = c.getGraphicsConfiguration();
    if (this.imageCacher == null) {
      this.imageCacher = new MetalIconFactory$ImageCacher()._MetalIconFactory$ImageCacher();
    }
    let image = this.imageCacher.getImage(gc);
    if (image == null) {
      if (gc != null) {
        image = gc.createCompatibleImage$int$int$int(this.getIconWidth(), this.getIconHeight(), Transparency.BITMASK);
      } else {
        image = new BufferedImage(this.getIconWidth(), this.getIconHeight(), 2);
      }
      let imageG = image.getGraphics();
      this.paintMe(c, imageG);
      imageG.dispose();
      this.imageCacher.cacheImage(image, gc);
    }
    g.drawImage$Image$int$int$ImageObserver(image, x, (y + this.getShift()) | 0, null);
  }
  paintMe(c: Component, g: Graphics): void {
    let right = (MetalIconFactory.fileIcon16Size.width_ - 1) | 0;
    let bottom = (MetalIconFactory.fileIcon16Size.height_ - 1) | 0;
    g.setColor(MetalLookAndFeel.getWindowBackground());
    g.fillRect(4, 2, 9, 12);
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    g.drawLine(2, 0, 2, bottom);
    g.drawLine(2, 0, (right - 4) | 0, 0);
    g.drawLine(2, bottom, (right - 1) | 0, bottom);
    g.drawLine((right - 1) | 0, 6, (right - 1) | 0, bottom);
    g.drawLine((right - 6) | 0, 2, (right - 2) | 0, 6);
    g.drawLine((right - 5) | 0, 1, (right - 4) | 0, 1);
    g.drawLine((right - 3) | 0, 2, (right - 3) | 0, 3);
    g.drawLine((right - 2) | 0, 4, (right - 2) | 0, 5);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.drawLine(3, 1, 3, (bottom - 1) | 0);
    g.drawLine(3, 1, (right - 6) | 0, 1);
    g.drawLine((right - 2) | 0, 7, (right - 2) | 0, (bottom - 1) | 0);
    g.drawLine((right - 5) | 0, 2, (right - 3) | 0, 4);
    g.drawLine(3, (bottom - 1) | 0, (right - 2) | 0, (bottom - 1) | 0);
  }
  getIconWidth(): number {
    return MetalIconFactory.fileIcon16Size.width_;
  }
  getIconHeight(): number {
    return (MetalIconFactory.fileIcon16Size.height_ + this.getAdditionalHeight()) | 0;
  }
}

/**
 * The class represents a tree leaf icon.
 */
export class MetalIconFactory$TreeLeafIcon extends MetalIconFactory$FileIcon16 {
  /**
   * Constructs a {@code TreeLeafIcon}.
   */
  _MetalIconFactory$TreeLeafIcon(): this {
    this._MetalIconFactory$FileIcon16();
    return this;
  }
  getShift(): number {
    return 2;
  }
  getAdditionalHeight(): number {
    return 4;
  }
}

/**
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class MetalIconFactory$TreeControlIcon extends JObject {
  /**
   * if {@code true} the icon is collapsed.
   * NOTE: This data member should not have been exposed. It's called
   * {@code isLight}, but now it really means {@code isCollapsed}.
   * Since we can't change any APIs... that's life.
   */
  isLight: boolean = false;
  imageCacher: MetalIconFactory$ImageCacher = null;
  cachedOrientation: boolean = false;
  /**
   * Constructs an instance of {@code TreeControlIcon}.
   *
   * @param isCollapsed if {@code true} the icon is collapsed
   */
  _MetalIconFactory$TreeControlIcon(isCollapsed: boolean): this {
    this.cachedOrientation = true;
    this.isLight = isCollapsed;
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let gc = c.getGraphicsConfiguration();
    if (this.imageCacher == null) {
      this.imageCacher = new MetalIconFactory$ImageCacher()._MetalIconFactory$ImageCacher();
    }
    let image = this.imageCacher.getImage(gc);
    if (image == null || this.cachedOrientation !== MetalUtils.isLeftToRight(c)) {
      this.cachedOrientation = MetalUtils.isLeftToRight(c);
      if (gc != null) {
        image = gc.createCompatibleImage$int$int$int(this.getIconWidth(), this.getIconHeight(), Transparency.BITMASK);
      } else {
        image = new BufferedImage(this.getIconWidth(), this.getIconHeight(), 2);
      }
      let imageG = image.getGraphics();
      this.paintMe(c, imageG, x, y);
      imageG.dispose();
      this.imageCacher.cacheImage(image, gc);
    }
    if (MetalUtils.isLeftToRight(c)) {
      if (this.isLight) {
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(image, (x + 5) | 0, (y + 3) | 0, (x + 18) | 0, (y + 13) | 0, 4, 3, 17, 13, null);
      } else {
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(image, (x + 5) | 0, (y + 3) | 0, (x + 18) | 0, (y + 17) | 0, 4, 3, 17, 17, null);
      }
    } else {
      if (this.isLight) {
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(image, (x + 3) | 0, (y + 3) | 0, (x + 16) | 0, (y + 13) | 0, 4, 3, 17, 13, null);
      } else {
        g.drawImage$Image$int$int$int$int$int$int$int$int$ImageObserver(image, (x + 3) | 0, (y + 3) | 0, (x + 16) | 0, (y + 17) | 0, 4, 3, 17, 17, null);
      }
    }
  }
  /**
   * Paints the {@code TreeControlIcon}.
   *
   * @param c a component
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y an Y coordinate
   */
  paintMe(c: Component, g: Graphics, x: number, y: number): void {
    g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    let xoff = (MetalUtils.isLeftToRight(c)) ? 0 : 4;
    g.drawLine((xoff + 4) | 0, 6, (xoff + 4) | 0, 9);
    g.drawLine((xoff + 5) | 0, 5, (xoff + 5) | 0, 5);
    g.drawLine((xoff + 6) | 0, 4, (xoff + 9) | 0, 4);
    g.drawLine((xoff + 10) | 0, 5, (xoff + 10) | 0, 5);
    g.drawLine((xoff + 11) | 0, 6, (xoff + 11) | 0, 9);
    g.drawLine((xoff + 10) | 0, 10, (xoff + 10) | 0, 10);
    g.drawLine((xoff + 6) | 0, 11, (xoff + 9) | 0, 11);
    g.drawLine((xoff + 5) | 0, 10, (xoff + 5) | 0, 10);
    g.drawLine((xoff + 7) | 0, 7, (xoff + 8) | 0, 7);
    g.drawLine((xoff + 7) | 0, 8, (xoff + 8) | 0, 8);
    if (this.isLight) {
      if (MetalUtils.isLeftToRight(c)) {
        g.drawLine(12, 7, 15, 7);
        g.drawLine(12, 8, 15, 8);
      } else {
        g.drawLine(4, 7, 7, 7);
        g.drawLine(4, 8, 7, 8);
      }
    } else {
      g.drawLine((xoff + 7) | 0, 12, (xoff + 7) | 0, 15);
      g.drawLine((xoff + 8) | 0, 12, (xoff + 8) | 0, 15);
    }
    g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    g.drawLine((xoff + 5) | 0, 6, (xoff + 5) | 0, 9);
    g.drawLine((xoff + 6) | 0, 5, (xoff + 9) | 0, 5);
    g.setColor(MetalLookAndFeel.getPrimaryControlShadow());
    g.drawLine((xoff + 6) | 0, 6, (xoff + 6) | 0, 6);
    g.drawLine((xoff + 9) | 0, 6, (xoff + 9) | 0, 6);
    g.drawLine((xoff + 6) | 0, 9, (xoff + 6) | 0, 9);
    g.drawLine((xoff + 10) | 0, 6, (xoff + 10) | 0, 9);
    g.drawLine((xoff + 6) | 0, 10, (xoff + 9) | 0, 10);
    g.setColor(MetalLookAndFeel.getPrimaryControl());
    g.drawLine((xoff + 6) | 0, 7, (xoff + 6) | 0, 8);
    g.drawLine((xoff + 7) | 0, 6, (xoff + 8) | 0, 6);
    g.drawLine((xoff + 9) | 0, 7, (xoff + 9) | 0, 7);
    g.drawLine((xoff + 7) | 0, 9, (xoff + 7) | 0, 9);
    g.setColor(MetalLookAndFeel.getPrimaryControlHighlight());
    g.drawLine((xoff + 8) | 0, 9, (xoff + 9) | 0, 9);
    g.drawLine((xoff + 9) | 0, 8, (xoff + 9) | 0, 8);
  }
  getIconWidth(): number {
    return MetalIconFactory.treeControlSize.width_;
  }
  getIconHeight(): number {
    return MetalIconFactory.treeControlSize.height_;
  }
}

export class MetalIconFactory$MenuArrowIcon extends JObject {
  _MetalIconFactory$MenuArrowIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let b = c;
    let model = b.getModel();
    g.translate$int$int(x, y);
    if (!model.isEnabled()) {
      g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
    } else {
      if (model.isArmed() || (c instanceof JMenu && model.isSelected())) {
        g.setColor(MetalLookAndFeel.getMenuSelectedForeground());
      } else {
        g.setColor(b.getForeground());
      }
    }
    if (MetalUtils.isLeftToRight(b)) {
      let xPoints = [0, 3, 3, 0];
      let yPoints = [0, 3, 4, 7];
      g.fillPolygon$intArr$intArr$int(xPoints, yPoints, 4);
      g.drawPolygon$intArr$intArr$int(xPoints, yPoints, 4);
    } else {
      let xPoints = [4, 4, 1, 1];
      let yPoints = [0, 7, 4, 3];
      g.fillPolygon$intArr$intArr$int(xPoints, yPoints, 4);
      g.drawPolygon$intArr$intArr$int(xPoints, yPoints, 4);
    }
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return MetalIconFactory.menuArrowIconSize.width_;
  }
  getIconHeight(): number {
    return MetalIconFactory.menuArrowIconSize.height_;
  }
}

export class MetalIconFactory$MenuItemArrowIcon extends JObject {
  _MetalIconFactory$MenuItemArrowIcon(): this {
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
  }
  getIconWidth(): number {
    return MetalIconFactory.menuArrowIconSize.width_;
  }
  getIconHeight(): number {
    return MetalIconFactory.menuArrowIconSize.height_;
  }
}

export class MetalIconFactory$CheckBoxMenuItemIcon extends JObject {
  _MetalIconFactory$CheckBoxMenuItemIcon(): this {
    return this;
  }
  paintOceanIcon(c: Component, g: Graphics, x: number, y: number): void {
    let model = (c).getModel();
    let isSelected = model.isSelected();
    let isEnabled = model.isEnabled();
    let isPressed = model.isPressed();
    let isArmed = model.isArmed();
    g.translate$int$int(x, y);
    if (isEnabled) {
      MetalUtils.drawGradient(c, g, 'CheckBoxMenuItem.gradient', 1, 1, 7, 7, true);
      if (isPressed || isArmed) {
        g.setColor(MetalLookAndFeel.getControlInfo());
        g.drawLine(0, 0, 8, 0);
        g.drawLine(0, 0, 0, 8);
        g.drawLine(8, 2, 8, 8);
        g.drawLine(2, 8, 8, 8);
        g.setColor(MetalLookAndFeel.getPrimaryControl());
        g.drawLine(9, 1, 9, 9);
        g.drawLine(1, 9, 9, 9);
      } else {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawLine(0, 0, 8, 0);
        g.drawLine(0, 0, 0, 8);
        g.drawLine(8, 2, 8, 8);
        g.drawLine(2, 8, 8, 8);
        g.setColor(MetalLookAndFeel.getControlHighlight());
        g.drawLine(9, 1, 9, 9);
        g.drawLine(1, 9, 9, 9);
      }
    } else {
      g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      g.drawRect(0, 0, 8, 8);
    }
    if (isSelected) {
      if (isEnabled) {
        if (isArmed || (c instanceof JMenu && isSelected)) {
          g.setColor(MetalLookAndFeel.getMenuSelectedForeground());
        } else {
          g.setColor(MetalLookAndFeel.getControlInfo());
        }
      } else {
        g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      }
      this.drawCheck(g);
    }
    g.translate$int$int(-x, -y);
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (MetalLookAndFeel.usingOcean()) {
      this.paintOceanIcon(c, g, x, y);
      return;
    }
    let b = c;
    let model = b.getModel();
    let isSelected = model.isSelected();
    let isEnabled = model.isEnabled();
    let isPressed = model.isPressed();
    let isArmed = model.isArmed();
    g.translate$int$int(x, y);
    if (isEnabled) {
      if (isPressed || isArmed) {
        g.setColor(MetalLookAndFeel.getControlInfo());
        g.drawLine(0, 0, 8, 0);
        g.drawLine(0, 0, 0, 8);
        g.drawLine(8, 2, 8, 8);
        g.drawLine(2, 8, 8, 8);
        g.setColor(MetalLookAndFeel.getPrimaryControl());
        g.drawLine(1, 1, 7, 1);
        g.drawLine(1, 1, 1, 7);
        g.drawLine(9, 1, 9, 9);
        g.drawLine(1, 9, 9, 9);
      } else {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawLine(0, 0, 8, 0);
        g.drawLine(0, 0, 0, 8);
        g.drawLine(8, 2, 8, 8);
        g.drawLine(2, 8, 8, 8);
        g.setColor(MetalLookAndFeel.getControlHighlight());
        g.drawLine(1, 1, 7, 1);
        g.drawLine(1, 1, 1, 7);
        g.drawLine(9, 1, 9, 9);
        g.drawLine(1, 9, 9, 9);
      }
    } else {
      g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      g.drawRect(0, 0, 8, 8);
    }
    if (isSelected) {
      if (isEnabled) {
        if (model.isArmed() || (c instanceof JMenu && model.isSelected())) {
          g.setColor(MetalLookAndFeel.getMenuSelectedForeground());
        } else {
          g.setColor(b.getForeground());
        }
      } else {
        g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      }
      this.drawCheck(g);
    }
    g.translate$int$int(-x, -y);
  }
  drawCheck(g: Graphics): void {
    let xPoints = [2, 3, 3, 8, 9, 3, 2];
    let yPoints = [2, 2, 5, 0, 0, 6, 6];
    g.drawPolygon$intArr$intArr$int(xPoints, yPoints, 7);
  }
  getIconWidth(): number {
    return MetalIconFactory.menuCheckIconSize.width_;
  }
  getIconHeight(): number {
    return MetalIconFactory.menuCheckIconSize.height_;
  }
}

export class MetalIconFactory$RadioButtonMenuItemIcon extends JObject {
  _MetalIconFactory$RadioButtonMenuItemIcon(): this {
    return this;
  }
  paintOceanIcon(c: Component, g: Graphics, x: number, y: number): void {
    let model = (c).getModel();
    let isSelected = model.isSelected();
    let isEnabled = model.isEnabled();
    let isPressed = model.isPressed();
    let isArmed = model.isArmed();
    g.translate$int$int(x, y);
    if (isEnabled) {
      MetalUtils.drawGradient(c, g, 'RadioButtonMenuItem.gradient', 1, 1, 7, 7, true);
      if (isPressed || isArmed) {
        g.setColor(MetalLookAndFeel.getPrimaryControl());
      } else {
        g.setColor(MetalLookAndFeel.getControlHighlight());
      }
      g.drawArc(-1, -1, 10, 10, 245, 140);
      if (isPressed || isArmed) {
        g.setColor(MetalLookAndFeel.getControlInfo());
      } else {
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
      }
    } else {
      g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
    }
    g.drawOval(0, 0, 8, 8);
    if (isSelected) {
      if (isEnabled) {
        if (isArmed || (c instanceof JMenu && model.isSelected())) {
          g.setColor(MetalLookAndFeel.getMenuSelectedForeground());
        } else {
          g.setColor(MetalLookAndFeel.getControlInfo());
        }
      } else {
        g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      }
      g.fillOval(2, 2, 4, 4);
      g.drawOval(2, 2, 4, 4);
    }
    g.translate$int$int(-x, -y);
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let aaHint = SwingUtilities2.getAndSetAntialisingHintForScaledGraphics(g);
    if (MetalLookAndFeel.usingOcean()) {
      this.paintOceanIcon(c, g, x, y);
      SwingUtilities2.setAntialiasingHintForScaledGraphics(g, aaHint);
      return;
    }
    let b = c;
    let model = b.getModel();
    let isSelected = model.isSelected();
    let isEnabled = model.isEnabled();
    let isPressed = model.isPressed();
    let isArmed = model.isArmed();
    g.translate$int$int(x, y);
    if (isEnabled) {
      if (isPressed || isArmed) {
        g.setColor(MetalLookAndFeel.getPrimaryControl());
        g.drawOval(1, 1, 8, 8);
        g.setColor(MetalLookAndFeel.getControlInfo());
        g.drawOval(0, 0, 8, 8);
      } else {
        g.setColor(MetalLookAndFeel.getControlHighlight());
        g.drawOval(1, 1, 8, 8);
        g.setColor(MetalLookAndFeel.getControlDarkShadow());
        g.drawOval(0, 0, 8, 8);
      }
    } else {
      g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      g.drawOval(0, 0, 8, 8);
    }
    if (isSelected) {
      if (isEnabled) {
        if (model.isArmed() || (c instanceof JMenu && model.isSelected())) {
          g.setColor(MetalLookAndFeel.getMenuSelectedForeground());
        } else {
          g.setColor(b.getForeground());
        }
      } else {
        g.setColor(MetalLookAndFeel.getMenuDisabledForeground());
      }
      g.fillOval(2, 2, 4, 4);
      g.drawOval(2, 2, 4, 4);
    }
    g.translate$int$int(-x, -y);
    SwingUtilities2.setAntialiasingHintForScaledGraphics(g, aaHint);
  }
  getIconWidth(): number {
    return MetalIconFactory.menuCheckIconSize.width_;
  }
  getIconHeight(): number {
    return MetalIconFactory.menuCheckIconSize.height_;
  }
}

export class MetalIconFactory$VerticalSliderThumbIcon extends JObject {
  static controlBumps: MetalBumps = null;
  static primaryBumps: MetalBumps = null;
  _MetalIconFactory$VerticalSliderThumbIcon(): this {
    MetalIconFactory$VerticalSliderThumbIcon.controlBumps = new MetalBumps()._MetalBumps(6, 10, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlInfo(), MetalLookAndFeel.getControl());
    MetalIconFactory$VerticalSliderThumbIcon.primaryBumps = new MetalBumps()._MetalBumps(6, 10, MetalLookAndFeel.getPrimaryControl(), MetalLookAndFeel.getPrimaryControlDarkShadow(), MetalLookAndFeel.getPrimaryControlShadow());
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    let leftToRight = MetalUtils.isLeftToRight(c);
    g.translate$int$int(x, y);
    let clip = g.getClipBounds$();
    g.clipRect(0, 0, this.getIconWidth(), this.getIconHeight());
    if (c.hasFocus()) {
      g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    } else {
      g.setColor(c.isEnabled() ? MetalLookAndFeel.getPrimaryControlInfo() : MetalLookAndFeel.getControlDarkShadow());
    }
    if (leftToRight) {
      g.drawLine(1, 0, 8, 0);
      g.drawLine(0, 1, 0, 13);
      g.drawLine(1, 14, 8, 14);
      g.drawLine(9, 1, 15, 7);
      g.drawLine(9, 13, 15, 7);
    } else {
      g.drawLine(7, 0, 14, 0);
      g.drawLine(15, 1, 15, 13);
      g.drawLine(7, 14, 14, 14);
      g.drawLine(0, 7, 6, 1);
      g.drawLine(0, 7, 6, 13);
    }
    if (c.hasFocus()) {
      g.setColor(c.getForeground());
    } else {
      g.setColor(MetalLookAndFeel.getControl());
    }
    if (leftToRight) {
      g.fillRect(1, 1, 8, 13);
      g.drawLine(9, 2, 9, 12);
      g.drawLine(10, 3, 10, 11);
      g.drawLine(11, 4, 11, 10);
      g.drawLine(12, 5, 12, 9);
      g.drawLine(13, 6, 13, 8);
      g.drawLine(14, 7, 14, 7);
    } else {
      g.fillRect(7, 1, 8, 13);
      g.drawLine(6, 3, 6, 12);
      g.drawLine(5, 4, 5, 11);
      g.drawLine(4, 5, 4, 10);
      g.drawLine(3, 6, 3, 9);
      g.drawLine(2, 7, 2, 8);
    }
    let offset = (leftToRight) ? 2 : 8;
    if (c.isEnabled()) {
      if (c.hasFocus()) {
        MetalIconFactory$VerticalSliderThumbIcon.primaryBumps.paintIcon(c, g, offset, 2);
      } else {
        MetalIconFactory$VerticalSliderThumbIcon.controlBumps.paintIcon(c, g, offset, 2);
      }
    }
    if (c.isEnabled()) {
      g.setColor(c.hasFocus() ? MetalLookAndFeel.getPrimaryControl() : MetalLookAndFeel.getControlHighlight());
      if (leftToRight) {
        g.drawLine(1, 1, 8, 1);
        g.drawLine(1, 1, 1, 13);
      } else {
        g.drawLine(8, 1, 14, 1);
        g.drawLine(1, 7, 7, 1);
      }
    }
    g.setClip$Shape(clip);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 16;
  }
  getIconHeight(): number {
    return 15;
  }
}

export class MetalIconFactory$HorizontalSliderThumbIcon extends JObject {
  static controlBumps: MetalBumps = null;
  static primaryBumps: MetalBumps = null;
  _MetalIconFactory$HorizontalSliderThumbIcon(): this {
    MetalIconFactory$HorizontalSliderThumbIcon.controlBumps = new MetalBumps()._MetalBumps(10, 6, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlInfo(), MetalLookAndFeel.getControl());
    MetalIconFactory$HorizontalSliderThumbIcon.primaryBumps = new MetalBumps()._MetalBumps(10, 6, MetalLookAndFeel.getPrimaryControl(), MetalLookAndFeel.getPrimaryControlDarkShadow(), MetalLookAndFeel.getPrimaryControlShadow());
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    g.translate$int$int(x, y);
    let clip = g.getClipBounds$();
    g.clipRect(0, 0, this.getIconWidth(), this.getIconHeight());
    if (c.hasFocus()) {
      g.setColor(MetalLookAndFeel.getPrimaryControlInfo());
    } else {
      g.setColor(c.isEnabled() ? MetalLookAndFeel.getPrimaryControlInfo() : MetalLookAndFeel.getControlDarkShadow());
    }
    g.drawLine(1, 0, 13, 0);
    g.drawLine(0, 1, 0, 8);
    g.drawLine(14, 1, 14, 8);
    g.drawLine(1, 9, 7, 15);
    g.drawLine(7, 15, 14, 8);
    if (c.hasFocus()) {
      g.setColor(c.getForeground());
    } else {
      g.setColor(MetalLookAndFeel.getControl());
    }
    g.fillRect(1, 1, 13, 8);
    g.drawLine(2, 9, 12, 9);
    g.drawLine(3, 10, 11, 10);
    g.drawLine(4, 11, 10, 11);
    g.drawLine(5, 12, 9, 12);
    g.drawLine(6, 13, 8, 13);
    g.drawLine(7, 14, 7, 14);
    if (c.isEnabled()) {
      if (c.hasFocus()) {
        MetalIconFactory$HorizontalSliderThumbIcon.primaryBumps.paintIcon(c, g, 2, 2);
      } else {
        MetalIconFactory$HorizontalSliderThumbIcon.controlBumps.paintIcon(c, g, 2, 2);
      }
    }
    if (c.isEnabled()) {
      g.setColor(c.hasFocus() ? MetalLookAndFeel.getPrimaryControl() : MetalLookAndFeel.getControlHighlight());
      g.drawLine(1, 1, 13, 1);
      g.drawLine(1, 1, 1, 8);
    }
    g.setClip$Shape(clip);
    g.translate$int$int(-x, -y);
  }
  getIconWidth(): number {
    return 15;
  }
  getIconHeight(): number {
    return 16;
  }
}

export class MetalIconFactory$OceanVerticalSliderThumbIcon extends CachedPainter {
  static LTR_THUMB_SHAPE: Polygon = null;
  static RTL_THUMB_SHAPE: Polygon = null;
  _MetalIconFactory$OceanVerticalSliderThumbIcon(): this {
    this._CachedPainter(3);
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (!(g instanceof Graphics2D)) {
      return;
    }
    this.paint$Component$Graphics$int$int$int$int$ObjectArr(c, g, x, y, this.getIconWidth(), this.getIconHeight(), [MetalUtils.isLeftToRight(c), c.hasFocus(), c.isEnabled(), MetalLookAndFeel.getCurrentTheme()]);
  }
  paintToImage(c: Component, image: Image, g2: Graphics, w: number, h: number, args: any[]): void {
    let g = g2;
    let leftToRight = (args[0]);
    let hasFocus = (args[1]);
    let enabled = (args[2]);
    let clip = g.getClipBounds$();
    if (leftToRight) {
      g.clip(MetalIconFactory$OceanVerticalSliderThumbIcon.LTR_THUMB_SHAPE);
    } else {
      g.clip(MetalIconFactory$OceanVerticalSliderThumbIcon.RTL_THUMB_SHAPE);
    }
    if (!enabled) {
      g.setColor(MetalLookAndFeel.getControl());
      g.fillRect(1, 1, 14, 14);
    } else if (hasFocus) {
      MetalUtils.drawGradient(c, g, 'Slider.focusGradient', 1, 1, 14, 14, false);
    } else {
      MetalUtils.drawGradient(c, g, 'Slider.gradient', 1, 1, 14, 14, false);
    }
    g.setClip$Shape(clip);
    if (hasFocus) {
      g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    } else {
      g.setColor(enabled ? MetalLookAndFeel.getPrimaryControlInfo() : MetalLookAndFeel.getControlDarkShadow());
    }
    if (leftToRight) {
      g.drawLine(1, 0, 8, 0);
      g.drawLine(0, 1, 0, 13);
      g.drawLine(1, 14, 8, 14);
      g.drawLine(9, 1, 15, 7);
      g.drawLine(9, 13, 15, 7);
    } else {
      g.drawLine(7, 0, 14, 0);
      g.drawLine(15, 1, 15, 13);
      g.drawLine(7, 14, 14, 14);
      g.drawLine(0, 7, 6, 1);
      g.drawLine(0, 7, 6, 13);
    }
    if (hasFocus && enabled) {
      g.setColor(MetalLookAndFeel.getPrimaryControl());
      if (leftToRight) {
        g.drawLine(1, 1, 8, 1);
        g.drawLine(1, 1, 1, 13);
        g.drawLine(1, 13, 8, 13);
        g.drawLine(9, 2, 14, 7);
        g.drawLine(9, 12, 14, 7);
      } else {
        g.drawLine(7, 1, 14, 1);
        g.drawLine(14, 1, 14, 13);
        g.drawLine(7, 13, 14, 13);
        g.drawLine(1, 7, 7, 1);
        g.drawLine(1, 7, 7, 13);
      }
    }
  }
  getIconWidth(): number {
    return 16;
  }
  getIconHeight(): number {
    return 15;
  }
  createImage(c: Component, w: number, h: number, config: GraphicsConfiguration, args: any[]): Image {
    if (config == null) {
      return new BufferedImage(w, h, 2);
    }
    return config.createCompatibleImage$int$int$int(w, h, Transparency.BITMASK);
  }
  static $clinit() {
    MetalIconFactory$OceanVerticalSliderThumbIcon.LTR_THUMB_SHAPE = new Polygon()._Polygon$intArr$intArr$int([0, 8, 15, 8, 0], [0, 0, 7, 14, 14], 5);
    MetalIconFactory$OceanVerticalSliderThumbIcon.RTL_THUMB_SHAPE = new Polygon()._Polygon$intArr$intArr$int([15, 15, 7, 0, 7], [0, 14, 14, 7, 0], 5);
  }
}

export class MetalIconFactory$OceanHorizontalSliderThumbIcon extends CachedPainter {
  static THUMB_SHAPE: Polygon = null;
  _MetalIconFactory$OceanHorizontalSliderThumbIcon(): this {
    this._CachedPainter(3);
    return this;
  }
  paintIcon(c: Component, g: Graphics, x: number, y: number): void {
    if (!(g instanceof Graphics2D)) {
      return;
    }
    this.paint$Component$Graphics$int$int$int$int$ObjectArr(c, g, x, y, this.getIconWidth(), this.getIconHeight(), [c.hasFocus(), c.isEnabled(), MetalLookAndFeel.getCurrentTheme()]);
  }
  createImage(c: Component, w: number, h: number, config: GraphicsConfiguration, args: any[]): Image {
    if (config == null) {
      return new BufferedImage(w, h, 2);
    }
    return config.createCompatibleImage$int$int$int(w, h, Transparency.BITMASK);
  }
  paintToImage(c: Component, image: Image, g2: Graphics, w: number, h: number, args: any[]): void {
    let g = g2;
    let hasFocus = (args[0]);
    let enabled = (args[1]);
    let clip = g.getClipBounds$();
    g.clip(MetalIconFactory$OceanHorizontalSliderThumbIcon.THUMB_SHAPE);
    if (!enabled) {
      g.setColor(MetalLookAndFeel.getControl());
      g.fillRect(1, 1, 13, 14);
    } else if (hasFocus) {
      MetalUtils.drawGradient(c, g, 'Slider.focusGradient', 1, 1, 13, 14, true);
    } else {
      MetalUtils.drawGradient(c, g, 'Slider.gradient', 1, 1, 13, 14, true);
    }
    g.setClip$Shape(clip);
    if (hasFocus) {
      g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
    } else {
      g.setColor(enabled ? MetalLookAndFeel.getPrimaryControlInfo() : MetalLookAndFeel.getControlDarkShadow());
    }
    g.drawLine(1, 0, 13, 0);
    g.drawLine(0, 1, 0, 8);
    g.drawLine(14, 1, 14, 8);
    g.drawLine(1, 9, 7, 15);
    g.drawLine(7, 15, 14, 8);
    if (hasFocus && enabled) {
      g.setColor(MetalLookAndFeel.getPrimaryControl());
      g.fillRect(1, 1, 13, 1);
      g.fillRect(1, 2, 1, 7);
      g.fillRect(13, 2, 1, 7);
      g.drawLine(2, 9, 7, 14);
      g.drawLine(8, 13, 12, 9);
    }
  }
  getIconWidth(): number {
    return 15;
  }
  getIconHeight(): number {
    return 16;
  }
  static $clinit() {
    MetalIconFactory$OceanHorizontalSliderThumbIcon.THUMB_SHAPE = new Polygon()._Polygon$intArr$intArr$int([0, 14, 14, 7, 0], [0, 0, 8, 15, 8], 5);
  }
}

$J.define(MetalIconFactory, 'javax.swing.plaf.metal.MetalIconFactory', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory' }, clinit: true, lazy: ['fileChooserDetailViewIcon', 'fileChooserHomeFolderIcon', 'fileChooserListViewIcon', 'fileChooserNewFolderIcon', 'fileChooserUpFolderIcon', 'internalFrameAltMaximizeIcon', 'internalFrameCloseIcon', 'internalFrameDefaultMenuIcon', 'internalFrameMaximizeIcon', 'internalFrameMinimizeIcon', 'radioButtonIcon', 'treeComputerIcon', 'treeFloppyDriveIcon', 'treeHardDriveIcon', 'menuArrowIcon', 'menuItemArrowIcon', 'checkBoxMenuItemIcon', 'radioButtonMenuItemIcon', 'checkBoxIcon', 'oceanHorizontalSliderThumb', 'oceanVerticalSliderThumb', 'folderIcon16Size', 'fileIcon16Size', 'treeControlSize', 'menuArrowIconSize', 'menuCheckIconSize'] });
$J.define(MetalIconFactory$FileChooserDetailViewIcon, 'javax.swing.plaf.metal.MetalIconFactory$FileChooserDetailViewIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FileChooserDetailViewIcon' } });
$J.define(MetalIconFactory$FileChooserHomeFolderIcon, 'javax.swing.plaf.metal.MetalIconFactory$FileChooserHomeFolderIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FileChooserHomeFolderIcon' } });
$J.define(MetalIconFactory$FileChooserListViewIcon, 'javax.swing.plaf.metal.MetalIconFactory$FileChooserListViewIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FileChooserListViewIcon' } });
$J.define(MetalIconFactory$FileChooserNewFolderIcon, 'javax.swing.plaf.metal.MetalIconFactory$FileChooserNewFolderIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FileChooserNewFolderIcon' } });
$J.define(MetalIconFactory$FileChooserUpFolderIcon, 'javax.swing.plaf.metal.MetalIconFactory$FileChooserUpFolderIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FileChooserUpFolderIcon' } });
$J.define(MetalIconFactory$PaletteCloseIcon, 'javax.swing.plaf.metal.MetalIconFactory$PaletteCloseIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$PaletteCloseIcon' } });
$J.define(MetalIconFactory$InternalFrameCloseIcon, 'javax.swing.plaf.metal.MetalIconFactory$InternalFrameCloseIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int': '_MetalIconFactory$InternalFrameCloseIcon' } });
$J.define(MetalIconFactory$InternalFrameAltMaximizeIcon, 'javax.swing.plaf.metal.MetalIconFactory$InternalFrameAltMaximizeIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int': '_MetalIconFactory$InternalFrameAltMaximizeIcon' } });
$J.define(MetalIconFactory$InternalFrameDefaultMenuIcon, 'javax.swing.plaf.metal.MetalIconFactory$InternalFrameDefaultMenuIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$InternalFrameDefaultMenuIcon' } });
$J.define(MetalIconFactory$InternalFrameMaximizeIcon, 'javax.swing.plaf.metal.MetalIconFactory$InternalFrameMaximizeIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int': '_MetalIconFactory$InternalFrameMaximizeIcon' } });
$J.define(MetalIconFactory$InternalFrameMinimizeIcon, 'javax.swing.plaf.metal.MetalIconFactory$InternalFrameMinimizeIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'int': '_MetalIconFactory$InternalFrameMinimizeIcon' } });
$J.define(MetalIconFactory$CheckBoxIcon, 'javax.swing.plaf.metal.MetalIconFactory$CheckBoxIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$CheckBoxIcon' } });
$J.define(MetalIconFactory$RadioButtonIcon, 'javax.swing.plaf.metal.MetalIconFactory$RadioButtonIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$RadioButtonIcon' } });
$J.define(MetalIconFactory$TreeComputerIcon, 'javax.swing.plaf.metal.MetalIconFactory$TreeComputerIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$TreeComputerIcon' } });
$J.define(MetalIconFactory$TreeHardDriveIcon, 'javax.swing.plaf.metal.MetalIconFactory$TreeHardDriveIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$TreeHardDriveIcon' } });
$J.define(MetalIconFactory$TreeFloppyDriveIcon, 'javax.swing.plaf.metal.MetalIconFactory$TreeFloppyDriveIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$TreeFloppyDriveIcon' } });
$J.define(MetalIconFactory$ImageCacher, 'javax.swing.plaf.metal.MetalIconFactory$ImageCacher', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$ImageCacher' } });
$J.define(MetalIconFactory$ImageCacher$ImageGcPair, 'javax.swing.plaf.metal.MetalIconFactory$ImageCacher$ImageGcPair', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Image,java.awt.GraphicsConfiguration': '_MetalIconFactory$ImageCacher$ImageGcPair' } });
$J.define(MetalIconFactory$FolderIcon16, 'javax.swing.plaf.metal.MetalIconFactory$FolderIcon16', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FolderIcon16' } });
$J.define(MetalIconFactory$TreeFolderIcon, 'javax.swing.plaf.metal.MetalIconFactory$TreeFolderIcon', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalIconFactory$FolderIcon16', ctors: { '': '_MetalIconFactory$TreeFolderIcon' } });
$J.define(MetalIconFactory$FileIcon16, 'javax.swing.plaf.metal.MetalIconFactory$FileIcon16', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$FileIcon16' } });
$J.define(MetalIconFactory$TreeLeafIcon, 'javax.swing.plaf.metal.MetalIconFactory$TreeLeafIcon', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalIconFactory$FileIcon16', ctors: { '': '_MetalIconFactory$TreeLeafIcon' } });
$J.define(MetalIconFactory$TreeControlIcon, 'javax.swing.plaf.metal.MetalIconFactory$TreeControlIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { 'boolean': '_MetalIconFactory$TreeControlIcon' } });
$J.define(MetalIconFactory$MenuArrowIcon, 'javax.swing.plaf.metal.MetalIconFactory$MenuArrowIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$MenuArrowIcon' } });
$J.define(MetalIconFactory$MenuItemArrowIcon, 'javax.swing.plaf.metal.MetalIconFactory$MenuItemArrowIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$MenuItemArrowIcon' } });
$J.define(MetalIconFactory$CheckBoxMenuItemIcon, 'javax.swing.plaf.metal.MetalIconFactory$CheckBoxMenuItemIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$CheckBoxMenuItemIcon' } });
$J.define(MetalIconFactory$RadioButtonMenuItemIcon, 'javax.swing.plaf.metal.MetalIconFactory$RadioButtonMenuItemIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'javax.swing.plaf.UIResource', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$RadioButtonMenuItemIcon' } });
$J.define(MetalIconFactory$VerticalSliderThumbIcon, 'javax.swing.plaf.metal.MetalIconFactory$VerticalSliderThumbIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$VerticalSliderThumbIcon' } });
$J.define(MetalIconFactory$HorizontalSliderThumbIcon, 'javax.swing.plaf.metal.MetalIconFactory$HorizontalSliderThumbIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable', 'javax.swing.plaf.UIResource'], sup: 'java.lang.Object', ctors: { '': '_MetalIconFactory$HorizontalSliderThumbIcon' } });
$J.define(MetalIconFactory$OceanVerticalSliderThumbIcon, 'javax.swing.plaf.metal.MetalIconFactory$OceanVerticalSliderThumbIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable', 'javax.swing.plaf.UIResource'], sup: 'sun.swing.CachedPainter', ctors: { '': '_MetalIconFactory$OceanVerticalSliderThumbIcon' }, clinit: true, lazy: ['LTR_THUMB_SHAPE', 'RTL_THUMB_SHAPE'] });
$J.define(MetalIconFactory$OceanHorizontalSliderThumbIcon, 'javax.swing.plaf.metal.MetalIconFactory$OceanHorizontalSliderThumbIcon', { kind: 'class', ifaces: ['javax.swing.Icon', 'java.io.Serializable', 'javax.swing.plaf.UIResource'], sup: 'sun.swing.CachedPainter', ctors: { '': '_MetalIconFactory$OceanHorizontalSliderThumbIcon' }, clinit: true, lazy: ['THUMB_SHAPE'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Graphics2D = $J.load('java.awt.Graphics2D');
  Polygon = $J.load('java.awt.Polygon');
  Transparency = $J.load('java.awt.Transparency');
  JMenu = $J.load('javax.swing.JMenu');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
