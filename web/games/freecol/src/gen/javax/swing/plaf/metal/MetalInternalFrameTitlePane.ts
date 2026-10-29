// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalInternalFrameTitlePane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Integer, JString } from '../../../../../jre/index.ts';
import { BasicInternalFrameTitlePane } from '../basic/BasicInternalFrameTitlePane.ts';
import { BasicInternalFrameTitlePane$PropertyChangeHandler } from '../basic/BasicInternalFrameTitlePane.ts';
import { BasicInternalFrameTitlePane$TitlePaneLayout } from '../basic/BasicInternalFrameTitlePane.ts';

let Dimension, Rectangle, JInternalFrame, JOptionPane, UIManager, EmptyBorder, MetalBumps, MetalLookAndFeel, MetalUtils, SwingUtilities2;

/**
 * Class that manages a JLF title bar
 * @author Steve Wilson
 * @author Brian Beck
 * @since 1.3
 */
export class MetalInternalFrameTitlePane extends BasicInternalFrameTitlePane {
  /**
   * The value {@code isPalette}
   */
  isPalette: boolean = false;
  /**
   * The palette close icon.
   */
  paletteCloseIcon: Icon = null;
  /**
   * The height of the palette title.
   */
  paletteTitleHeight: number = 0;
  static handyEmptyBorder: Border = null;
  /**
   * Key used to lookup Color from UIManager. If this is null,
   * <code>getWindowTitleBackground</code> is used.
   */
  selectedBackgroundKey: string = null;
  /**
   * Key used to lookup Color from UIManager. If this is null,
   * <code>getWindowTitleForeground</code> is used.
   */
  selectedForegroundKey: string = null;
  /**
   * Key used to lookup shadow color from UIManager. If this is null,
   * <code>getPrimaryControlDarkShadow</code> is used.
   */
  selectedShadowKey: string = null;
  /**
   * Boolean indicating the state of the <code>JInternalFrame</code>s
   * closable property at <code>updateUI</code> time.
   */
  wasClosable: boolean = false;
  buttonsWidth: number = 0;
  activeBumps: MetalBumps = null;
  inactiveBumps: MetalBumps = null;
  paletteBumps: MetalBumps = null;
  activeBumpsHighlight: Color = null;
  activeBumpsShadow: Color = null;
  /**
   * Constructs a new instance of {@code MetalInternalFrameTitlePane}
   *
   * @param f an instance of {@code JInternalFrame}
   */
  _MetalInternalFrameTitlePane(f: JInternalFrame): this {
    this._BasicInternalFrameTitlePane(f);
    this.isPalette = false;
    this.buttonsWidth = 0;
    this.activeBumps = new MetalBumps()._MetalBumps(0, 0, MetalLookAndFeel.getPrimaryControlHighlight(), MetalLookAndFeel.getPrimaryControlDarkShadow(), (UIManager.get$Object('InternalFrame.activeTitleGradient') != null) ? null : MetalLookAndFeel.getPrimaryControl());
    this.inactiveBumps = new MetalBumps()._MetalBumps(0, 0, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlDarkShadow(), (UIManager.get$Object('InternalFrame.inactiveTitleGradient') != null) ? null : MetalLookAndFeel.getControl());
    this.activeBumpsHighlight = MetalLookAndFeel.getPrimaryControlHighlight();
    this.activeBumpsShadow = MetalLookAndFeel.getPrimaryControlDarkShadow();
    return this;
  }
  addNotify(): void {
    super.addNotify();
    this.updateOptionPaneState();
  }
  installDefaults(): void {
    super.installDefaults();
    this.setFont(UIManager.getFont$Object('InternalFrame.titleFont'));
    this.paletteTitleHeight = UIManager.getInt$Object('InternalFrame.paletteTitleHeight');
    this.paletteCloseIcon = UIManager.getIcon$Object('InternalFrame.paletteCloseIcon');
    this.wasClosable = this.frame.isClosable();
    this.selectedForegroundKey = this.selectedBackgroundKey = null;
    if (MetalLookAndFeel.usingOcean()) {
      this.setOpaque(true);
    }
  }
  uninstallDefaults(): void {
    super.uninstallDefaults();
    if (this.wasClosable !== this.frame.isClosable()) {
      this.frame.setClosable(this.wasClosable);
    }
  }
  createButtons(): void {
    super.createButtons();
    let paintActive = this.frame.isSelected() ? true : false;
    this.iconButton.putClientProperty('paintActive', paintActive);
    this.iconButton.setBorder(MetalInternalFrameTitlePane.handyEmptyBorder);
    this.maxButton.putClientProperty('paintActive', paintActive);
    this.maxButton.setBorder(MetalInternalFrameTitlePane.handyEmptyBorder);
    this.closeButton.putClientProperty('paintActive', paintActive);
    this.closeButton.setBorder(MetalInternalFrameTitlePane.handyEmptyBorder);
    this.closeButton.setBackground(MetalLookAndFeel.getPrimaryControlShadow());
    if (MetalLookAndFeel.usingOcean()) {
      this.iconButton.setContentAreaFilled(false);
      this.maxButton.setContentAreaFilled(false);
      this.closeButton.setContentAreaFilled(false);
    }
  }
  /**
   * Override the parent's method to do nothing. Metal frames do not
   * have system menus.
   */
  assembleSystemMenu(): void {
  }
  /**
   * Override the parent's method to do nothing. Metal frames do not
   * have system menus.
   */
  addSystemMenuItems(systemMenu: JMenu): void {
  }
  /**
   * Override the parent's method to do nothing. Metal frames do not
   * have system menus.
   */
  showSystemMenu(): void {
  }
  /**
   * Override the parent's method avoid creating a menu bar. Metal frames
   * do not have system menus.
   */
  addSubComponents(): void {
    this.add$Component(this.iconButton);
    this.add$Component(this.maxButton);
    this.add$Component(this.closeButton);
  }
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(new MetalInternalFrameTitlePane$MetalPropertyChangeHandler().$o(this)._MetalInternalFrameTitlePane$MetalPropertyChangeHandler(), 'propertyChange');
  }
  createLayout(): LayoutManager {
    return new MetalInternalFrameTitlePane$MetalTitlePaneLayout().$o(this)._MetalInternalFrameTitlePane$MetalTitlePaneLayout();
  }
  /**
   * Paints palette.
   *
   * @param g a instance of {@code Graphics}
   */
  paintPalette(g: Graphics): void {
    let leftToRight = MetalUtils.isLeftToRight(this.frame);
    let width = this.getWidth();
    let height = this.getHeight();
    if (this.paletteBumps == null) {
      this.paletteBumps = new MetalBumps()._MetalBumps(0, 0, MetalLookAndFeel.getPrimaryControlHighlight(), MetalLookAndFeel.getPrimaryControlInfo(), MetalLookAndFeel.getPrimaryControlShadow());
    }
    let background = MetalLookAndFeel.getPrimaryControlShadow();
    let darkShadow = MetalLookAndFeel.getPrimaryControlDarkShadow();
    g.setColor(background);
    g.fillRect(0, 0, width, height);
    g.setColor(darkShadow);
    g.drawLine(0, (height - 1) | 0, width, (height - 1) | 0);
    let xOffset = leftToRight ? 4 : (this.buttonsWidth + 4) | 0;
    let bumpLength = (width - this.buttonsWidth - Math.imul(2, 4)) | 0;
    let bumpHeight = (this.getHeight() - 4) | 0;
    this.paletteBumps.setBumpArea$int$int(bumpLength, bumpHeight);
    this.paletteBumps.paintIcon(this, g, xOffset, 2);
  }
  paintComponent(g: Graphics): void {
    if (this.isPalette) {
      this.paintPalette(g);
      return;
    }
    let leftToRight = MetalUtils.isLeftToRight(this.frame);
    let isSelected = this.frame.isSelected();
    let width = this.getWidth();
    let height = this.getHeight();
    let background = null;
    let foreground = null;
    let shadow = null;
    let bumps: MetalBumps;
    let gradientKey: string;
    if (isSelected) {
      if (!MetalLookAndFeel.usingOcean()) {
        this.closeButton.setContentAreaFilled(true);
        this.maxButton.setContentAreaFilled(true);
        this.iconButton.setContentAreaFilled(true);
      }
      if (this.selectedBackgroundKey != null) {
        background = UIManager.getColor$Object(this.selectedBackgroundKey);
      }
      if (background == null) {
        background = MetalLookAndFeel.getWindowTitleBackground();
      }
      if (this.selectedForegroundKey != null) {
        foreground = UIManager.getColor$Object(this.selectedForegroundKey);
      }
      if (this.selectedShadowKey != null) {
        shadow = UIManager.getColor$Object(this.selectedShadowKey);
      }
      if (shadow == null) {
        shadow = MetalLookAndFeel.getPrimaryControlDarkShadow();
      }
      if (foreground == null) {
        foreground = MetalLookAndFeel.getWindowTitleForeground();
      }
      this.activeBumps.setBumpColors(this.activeBumpsHighlight, this.activeBumpsShadow, UIManager.get$Object('InternalFrame.activeTitleGradient') != null ? null : background);
      bumps = this.activeBumps;
      gradientKey = 'InternalFrame.activeTitleGradient';
    } else {
      if (!MetalLookAndFeel.usingOcean()) {
        this.closeButton.setContentAreaFilled(false);
        this.maxButton.setContentAreaFilled(false);
        this.iconButton.setContentAreaFilled(false);
      }
      background = MetalLookAndFeel.getWindowTitleInactiveBackground();
      foreground = MetalLookAndFeel.getWindowTitleInactiveForeground();
      shadow = MetalLookAndFeel.getControlDarkShadow();
      bumps = this.inactiveBumps;
      gradientKey = 'InternalFrame.inactiveTitleGradient';
    }
    if (!MetalUtils.drawGradient(this, g, gradientKey, 0, 0, width, height, true)) {
      g.setColor(background);
      g.fillRect(0, 0, width, height);
    }
    g.setColor(shadow);
    g.drawLine(0, (height - 1) | 0, width, (height - 1) | 0);
    g.drawLine(0, 0, 0, 0);
    g.drawLine((width - 1) | 0, 0, (width - 1) | 0, 0);
    let titleLength: number;
    let xOffset = leftToRight ? 5 : (width - 5) | 0;
    let frameTitle = this.frame.getTitle();
    let icon = this.frame.getFrameIcon();
    if (icon != null) {
      if (!leftToRight) {
        xOffset = (xOffset - icon.getIconWidth()) | 0;
      }
      let iconY = ((($J.idiv(height, 2)) - ($J.idiv(icon.getIconHeight(), 2))) | 0);
      icon.paintIcon(this.frame, g, xOffset, iconY);
      xOffset = (xOffset + (leftToRight ? (icon.getIconWidth() + 5) | 0 : -5)) | 0;
    }
    if (frameTitle != null) {
      let f = this.getFont();
      g.setFont(f);
      let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(this.frame, g, f);
      let fHeight = fm.getHeight();
      g.setColor(foreground);
      let yOffset = (($J.idiv(((height - fm.getHeight()) | 0), 2)) + fm.getAscent()) | 0;
      let rect = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
      if (this.frame.isIconifiable()) {
        rect = this.iconButton.getBounds$();
      } else if (this.frame.isMaximizable()) {
        rect = this.maxButton.getBounds$();
      } else if (this.frame.isClosable()) {
        rect = this.closeButton.getBounds$();
      }
      let titleW: number;
      if (leftToRight) {
        if (rect.x_ === 0) {
          rect.x_ = (this.frame.getWidth() - this.frame.getInsets$().right - 2) | 0;
        }
        titleW = (rect.x_ - xOffset - 4) | 0;
        frameTitle = this.getTitle(frameTitle, fm, titleW);
      } else {
        titleW = (xOffset - rect.x_ - rect.width_ - 4) | 0;
        frameTitle = this.getTitle(frameTitle, fm, titleW);
        xOffset = (xOffset - SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.frame, fm, frameTitle)) | 0;
      }
      titleLength = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.frame, fm, frameTitle);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(this.frame, g, frameTitle, xOffset, yOffset);
      xOffset = (xOffset + (leftToRight ? (titleLength + 5) | 0 : -5)) | 0;
    }
    let bumpXOffset: number;
    let bumpLength: number;
    if (leftToRight) {
      bumpLength = (width - this.buttonsWidth - xOffset - 5) | 0;
      bumpXOffset = xOffset;
    } else {
      bumpLength = (xOffset - this.buttonsWidth - 5) | 0;
      bumpXOffset = (this.buttonsWidth + 5) | 0;
    }
    let bumpYOffset = 3;
    let bumpHeight = (this.getHeight() - (Math.imul(2, bumpYOffset))) | 0;
    bumps.setBumpArea$int$int(bumpLength, bumpHeight);
    bumps.paintIcon(this, g, bumpXOffset, bumpYOffset);
  }
  /**
   * If {@code b} is {@code true}, sets palette icons.
   *
   * @param b if {@code true}, sets palette icons
   */
  setPalette(b: boolean): void {
    this.isPalette = b;
    if (this.isPalette) {
      this.closeButton.setIcon(this.paletteCloseIcon);
      if (this.frame.isMaximizable()) {
        this.remove$Component(this.maxButton);
      }
      if (this.frame.isIconifiable()) {
        this.remove$Component(this.iconButton);
      }
    } else {
      this.closeButton.setIcon(this.closeIcon);
      if (this.frame.isMaximizable()) {
        this.add$Component(this.maxButton);
      }
      if (this.frame.isIconifiable()) {
        this.add$Component(this.iconButton);
      }
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Updates any state dependent upon the JInternalFrame being shown in
   * a <code>JOptionPane</code>.
   */
  updateOptionPaneState(): void {
    let type$ = -2;
    let closable = this.wasClosable;
    let obj = this.frame.getClientProperty('JInternalFrame.messageType');
    if (obj == null) {
      return;
    }
    if ($J.isa(obj, Integer)) {
      type$ = (+(obj));
    }
    switch (type$) {
      case JOptionPane.ERROR_MESSAGE:
        this.selectedBackgroundKey = 'OptionPane.errorDialog.titlePane.background';
        this.selectedForegroundKey = 'OptionPane.errorDialog.titlePane.foreground';
        this.selectedShadowKey = 'OptionPane.errorDialog.titlePane.shadow';
        closable = false;
        break;
      case JOptionPane.QUESTION_MESSAGE:
        this.selectedBackgroundKey = 'OptionPane.questionDialog.titlePane.background';
        this.selectedForegroundKey = 'OptionPane.questionDialog.titlePane.foreground';
        this.selectedShadowKey = 'OptionPane.questionDialog.titlePane.shadow';
        closable = false;
        break;
      case JOptionPane.WARNING_MESSAGE:
        this.selectedBackgroundKey = 'OptionPane.warningDialog.titlePane.background';
        this.selectedForegroundKey = 'OptionPane.warningDialog.titlePane.foreground';
        this.selectedShadowKey = 'OptionPane.warningDialog.titlePane.shadow';
        closable = false;
        break;
      case JOptionPane.INFORMATION_MESSAGE:
      case JOptionPane.PLAIN_MESSAGE:
        this.selectedBackgroundKey = this.selectedForegroundKey = this.selectedShadowKey = null;
        closable = false;
        break;
      default:
        this.selectedBackgroundKey = this.selectedForegroundKey = this.selectedShadowKey = null;
        break;
    }
    if (closable !== this.frame.isClosable()) {
      this.frame.setClosable(closable);
    }
  }
  static $clinit() {
    MetalInternalFrameTitlePane.handyEmptyBorder = new EmptyBorder()._EmptyBorder$int$int$int$int(0, 0, 0, 0);
  }
}

export class MetalInternalFrameTitlePane$MetalPropertyChangeHandler extends BasicInternalFrameTitlePane$PropertyChangeHandler {
  _MetalInternalFrameTitlePane$MetalPropertyChangeHandler(): this {
    this._BasicInternalFrameTitlePane$PropertyChangeHandler();
    return this;
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let prop = evt.getPropertyName();
    if ($J.equals(prop, JInternalFrame.IS_SELECTED_PROPERTY)) {
      let b = evt.getNewValue();
      this.$outer.iconButton.putClientProperty('paintActive', b);
      this.$outer.closeButton.putClientProperty('paintActive', b);
      this.$outer.maxButton.putClientProperty('paintActive', b);
    } else if ($J.equals('JInternalFrame.messageType', prop)) {
      this.$outer.updateOptionPaneState();
      this.$outer.frame.repaint$();
    }
    super.propertyChange(evt);
  }
}

export class MetalInternalFrameTitlePane$MetalTitlePaneLayout extends BasicInternalFrameTitlePane$TitlePaneLayout {
  _MetalInternalFrameTitlePane$MetalTitlePaneLayout(): this {
    this._BasicInternalFrameTitlePane$TitlePaneLayout();
    return this;
  }
  addLayoutComponent$String$Component(name: string, c: Component): void {
  }
  removeLayoutComponent(c: Component): void {
  }
  preferredLayoutSize(c: Container): Dimension {
    return this.minimumLayoutSize(c);
  }
  minimumLayoutSize(c: Container): Dimension {
    let width = 30;
    if (this.$outer.frame.isClosable()) {
      width = (width + 21) | 0;
    }
    if (this.$outer.frame.isMaximizable()) {
      width = (width + (16 + (this.$outer.frame.isClosable() ? 10 : 4))) | 0;
    }
    if (this.$outer.frame.isIconifiable()) {
      width = (width + (16 + (this.$outer.frame.isMaximizable() ? 2 : (this.$outer.frame.isClosable() ? 10 : 4)))) | 0;
    }
    let fm = this.$outer.frame.getFontMetrics(this.$outer.getFont());
    let frameTitle = this.$outer.frame.getTitle();
    let title_w = frameTitle != null ? SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.$outer.frame, fm, frameTitle) : 0;
    let title_length = frameTitle != null ? frameTitle.length : 0;
    if (title_length > 2) {
      let subtitle_w = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(this.$outer.frame, fm, this.$outer.frame.getTitle().substring(0, 2) + '...');
      width = (width + ((title_w < subtitle_w) ? title_w : subtitle_w)) | 0;
    } else {
      width = (width + title_w) | 0;
    }
    let height: number;
    if (this.$outer.isPalette) {
      height = this.$outer.paletteTitleHeight;
    } else {
      let fontHeight = fm.getHeight();
      fontHeight = (fontHeight + 7) | 0;
      let icon = this.$outer.frame.getFrameIcon();
      let iconHeight = 0;
      if (icon != null) {
        iconHeight = Math.min(icon.getIconHeight(), 16);
      }
      iconHeight = (iconHeight + 5) | 0;
      height = Math.max(fontHeight, iconHeight);
    }
    return new Dimension()._Dimension$int$int(width, height);
  }
  layoutContainer$Container(c: Container): void {
    let leftToRight = MetalUtils.isLeftToRight(this.$outer.frame);
    let w = this.$outer.getWidth();
    let x = leftToRight ? w : 0;
    let y = 2;
    let spacing: number;
    let buttonHeight = this.$outer.closeButton.getIcon().getIconHeight();
    let buttonWidth = this.$outer.closeButton.getIcon().getIconWidth();
    if (this.$outer.frame.isClosable()) {
      if (this.$outer.isPalette) {
        spacing = 3;
        x = (x + (leftToRight ? (-spacing - (buttonWidth + 2)) | 0 : spacing)) | 0;
        this.$outer.closeButton.setBounds$int$int$int$int(x, y, (buttonWidth + 2) | 0, (this.$outer.getHeight() - 4) | 0);
        if (!leftToRight) {
          x = (x + (buttonWidth + 2)) | 0;
        }
      } else {
        spacing = 4;
        x = (x + (leftToRight ? (-spacing - buttonWidth) | 0 : spacing)) | 0;
        this.$outer.closeButton.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
        if (!leftToRight) {
          x = (x + buttonWidth) | 0;
        }
      }
    }
    if (this.$outer.frame.isMaximizable() && !this.$outer.isPalette) {
      spacing = this.$outer.frame.isClosable() ? 10 : 4;
      x = (x + (leftToRight ? (-spacing - buttonWidth) | 0 : spacing)) | 0;
      this.$outer.maxButton.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
      if (!leftToRight) {
        x = (x + buttonWidth) | 0;
      }
    }
    if (this.$outer.frame.isIconifiable() && !this.$outer.isPalette) {
      spacing = this.$outer.frame.isMaximizable() ? 2 : (this.$outer.frame.isClosable() ? 10 : 4);
      x = (x + (leftToRight ? (-spacing - buttonWidth) | 0 : spacing)) | 0;
      this.$outer.iconButton.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
      if (!leftToRight) {
        x = (x + buttonWidth) | 0;
      }
    }
    this.$outer.buttonsWidth = leftToRight ? (w - x) | 0 : x;
  }
}

$J.define(MetalInternalFrameTitlePane, 'javax.swing.plaf.metal.MetalInternalFrameTitlePane', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicInternalFrameTitlePane', ctors: { 'javax.swing.JInternalFrame': '_MetalInternalFrameTitlePane' }, clinit: true, lazy: ['handyEmptyBorder'] });
$J.define(MetalInternalFrameTitlePane$MetalPropertyChangeHandler, 'javax.swing.plaf.metal.MetalInternalFrameTitlePane$MetalPropertyChangeHandler', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$PropertyChangeHandler', ctors: { '': '_MetalInternalFrameTitlePane$MetalPropertyChangeHandler' }, inner: true });
$J.define(MetalInternalFrameTitlePane$MetalTitlePaneLayout, 'javax.swing.plaf.metal.MetalInternalFrameTitlePane$MetalTitlePaneLayout', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicInternalFrameTitlePane$TitlePaneLayout', ctors: { '': '_MetalInternalFrameTitlePane$MetalTitlePaneLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Rectangle = $J.load('java.awt.Rectangle');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JOptionPane = $J.load('javax.swing.JOptionPane');
  UIManager = $J.load('javax.swing.UIManager');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
