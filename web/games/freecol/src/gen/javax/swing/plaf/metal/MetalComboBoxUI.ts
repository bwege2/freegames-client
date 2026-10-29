// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalComboBoxUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, NullPointerException } from '../../../../../jre/index.ts';
import { BasicComboBoxUI } from '../basic/BasicComboBoxUI.ts';
import { BasicComboBoxUI$PropertyChangeHandler } from '../basic/BasicComboBoxUI.ts';
import { BasicComboBoxUI$ComboBoxLayoutManager } from '../basic/BasicComboBoxUI.ts';

let Dimension, Insets, MetalBorders, MetalComboBoxButton, MetalComboBoxEditor$UIResource, MetalComboBoxIcon, MetalLookAndFeel, MetalUtils;

/**
 * Metal UI for JComboBox
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
 * @see MetalComboBoxEditor
 * @see MetalComboBoxButton
 * @author Tom Santos
 */
export class MetalComboBoxUI extends BasicComboBoxUI {
  /**
   * Constructs a {@code MetalComboBoxUI}.
   */
  _MetalComboBoxUI(): this {
    this._BasicComboBoxUI();
    return this;
  }
  /**
   * Constructs an instance of {@code MetalComboBoxUI}.
   *
   * @param c a component
   * @return an instance of {@code MetalComboBoxUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalComboBoxUI()._MetalComboBoxUI();
  }
  paint(g: Graphics, c: JComponent): void {
    if (MetalLookAndFeel.usingOcean()) {
      super.paint(g, c);
    }
  }
  /**
   * If necessary paints the currently selected item.
   *
   * @param g Graphics to paint to
   * @param bounds Region to paint current value to
   * @param hasFocus whether or not the JComboBox has focus
   * @throws NullPointerException if any of the arguments are null.
   * @since 1.5
   */
  paintCurrentValue(g: Graphics, bounds: Rectangle, hasFocus: boolean): void {
    if (MetalLookAndFeel.usingOcean()) {
      bounds.x_ = (bounds.x_ + 2) | 0;
      bounds.width_ = (bounds.width_ - 3) | 0;
      if (this.arrowButton != null) {
        let buttonInsets = this.arrowButton.getInsets$();
        bounds.y_ = (bounds.y_ + buttonInsets.top) | 0;
        bounds.height_ = (bounds.height_ - (buttonInsets.top + buttonInsets.bottom)) | 0;
      } else {
        bounds.y_ = (bounds.y_ + 2) | 0;
        bounds.height_ = (bounds.height_ - 4) | 0;
      }
      super.paintCurrentValue(g, bounds, hasFocus);
    } else if (g == null || bounds == null) {
      throw new NullPointerException('Must supply a non-null Graphics and Rectangle');
    }
  }
  /**
   * If necessary paints the background of the currently selected item.
   *
   * @param g Graphics to paint to
   * @param bounds Region to paint background to
   * @param hasFocus whether or not the JComboBox has focus
   * @throws NullPointerException if any of the arguments are null.
   * @since 1.5
   */
  paintCurrentValueBackground(g: Graphics, bounds: Rectangle, hasFocus: boolean): void {
    if (MetalLookAndFeel.usingOcean()) {
      g.setColor(MetalLookAndFeel.getControlDarkShadow());
      g.drawRect(bounds.x_, bounds.y_, bounds.width_, (bounds.height_ - 1) | 0);
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.drawRect((bounds.x_ + 1) | 0, (bounds.y_ + 1) | 0, (bounds.width_ - 2) | 0, (bounds.height_ - 3) | 0);
      if (hasFocus && !this.isPopupVisible(this.comboBox) && this.arrowButton != null) {
        g.setColor(this.listBox.getSelectionBackground());
        let buttonInsets = this.arrowButton.getInsets$();
        if (buttonInsets.top > 2) {
          g.fillRect((bounds.x_ + 2) | 0, (bounds.y_ + 2) | 0, (bounds.width_ - 3) | 0, (buttonInsets.top - 2) | 0);
        }
        if (buttonInsets.bottom > 2) {
          g.fillRect((bounds.x_ + 2) | 0, (bounds.y_ + bounds.height_ - buttonInsets.bottom) | 0, (bounds.width_ - 3) | 0, (buttonInsets.bottom - 2) | 0);
        }
      }
    } else if (g == null || bounds == null) {
      throw new NullPointerException('Must supply a non-null Graphics and Rectangle');
    }
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    let baseline: number;
    if (MetalLookAndFeel.usingOcean() && height >= 4) {
      height = (height - 4) | 0;
      baseline = super.getBaseline$JComponent$int$int(c, width, height);
      if (baseline >= 0) {
        baseline = (baseline + 2) | 0;
      }
    } else {
      baseline = super.getBaseline$JComponent$int$int(c, width, height);
    }
    return baseline;
  }
  createEditor(): ComboBoxEditor {
    return new MetalComboBoxEditor$UIResource()._MetalComboBoxEditor$UIResource();
  }
  createPopup(): ComboPopup {
    return super.createPopup();
  }
  createArrowButton(): JButton {
    let iconOnly = (this.comboBox.isEditable() || MetalLookAndFeel.usingOcean());
    let button = new MetalComboBoxButton()._MetalComboBoxButton$JComboBox$Icon$boolean$CellRendererPane$JList(this.comboBox, new MetalComboBoxIcon()._MetalComboBoxIcon(), iconOnly, this.currentValuePane, this.listBox);
    button.setMargin(new Insets()._Insets(0, 1, 1, 3));
    if (MetalLookAndFeel.usingOcean()) {
      button.putClientProperty(MetalBorders.NO_BUTTON_ROLLOVER, true);
    }
    this.updateButtonForOcean(button);
    return button;
  }
  /**
   * Resets the necessary state on the ComboBoxButton for ocean.
   */
  updateButtonForOcean(button: JButton): void {
    if (MetalLookAndFeel.usingOcean()) {
      button.setFocusPainted(this.comboBox.isEditable());
    }
  }
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(new MetalComboBoxUI$MetalPropertyChangeListener().$o(this)._MetalComboBoxUI$MetalPropertyChangeListener(), 'propertyChange');
  }
  createLayoutManager(): LayoutManager {
    return new MetalComboBoxUI$MetalComboBoxLayoutManager().$o(this)._MetalComboBoxUI$MetalComboBoxLayoutManager();
  }
  /**
   * Lays out the {@code JComboBox} in the {@code parent} container.
   *
   * @param parent a container
   * @param manager an instance of {@code MetalComboBoxLayoutManager}
   */
  layoutComboBox(parent: Container, manager: MetalComboBoxUI$MetalComboBoxLayoutManager): void {
    if (this.comboBox.isEditable() && !MetalLookAndFeel.usingOcean()) {
      manager.superLayout(parent);
      return;
    }
    if (this.arrowButton != null) {
      if (MetalLookAndFeel.usingOcean()) {
        let insets = this.comboBox.getInsets$();
        let buttonWidth = this.arrowButton.getMinimumSize$().width_;
        this.arrowButton.setBounds$int$int$int$int(MetalUtils.isLeftToRight(this.comboBox) ? ((this.comboBox.getWidth() - insets.right - buttonWidth) | 0) : insets.left, insets.top, buttonWidth, (this.comboBox.getHeight() - insets.top - insets.bottom) | 0);
      } else {
        let insets = this.comboBox.getInsets$();
        let width = this.comboBox.getWidth();
        let height = this.comboBox.getHeight();
        this.arrowButton.setBounds$int$int$int$int(insets.left, insets.top, (width - (insets.left + insets.right)) | 0, (height - (insets.top + insets.bottom)) | 0);
      }
    }
    if (this.editor != null && MetalLookAndFeel.usingOcean()) {
      let cvb = this.rectangleForCurrentValue();
      this.editor.setBounds$Rectangle(cvb);
    }
  }
  configureEditor(): void {
    super.configureEditor();
  }
  unconfigureEditor(): void {
    super.unconfigureEditor();
  }
  getMinimumSize(c: JComponent): Dimension {
    if (!this.isMinimumSizeDirty) {
      return new Dimension()._Dimension$Dimension(this.cachedMinimumSize);
    }
    let size = null;
    if (!this.comboBox.isEditable() && this.arrowButton != null) {
      let buttonInsets = this.arrowButton.getInsets$();
      let insets = this.comboBox.getInsets$();
      size = this.getDisplaySize();
      size.width_ = (size.width_ + (insets.left + insets.right)) | 0;
      size.width_ = (size.width_ + buttonInsets.right) | 0;
      size.width_ = (size.width_ + this.arrowButton.getMinimumSize$().width_) | 0;
      size.height_ = (size.height_ + (insets.top + insets.bottom)) | 0;
      size.height_ = (size.height_ + (buttonInsets.top + buttonInsets.bottom)) | 0;
    } else if (this.comboBox.isEditable() && this.arrowButton != null && this.editor != null) {
      size = super.getMinimumSize(c);
      let margin = this.arrowButton.getMargin();
      size.height_ = (size.height_ + (margin.top + margin.bottom)) | 0;
      size.width_ = (size.width_ + (margin.left + margin.right)) | 0;
    } else {
      size = super.getMinimumSize(c);
    }
    this.cachedMinimumSize.setSize$int$int(size.width_, size.height_);
    this.isMinimumSizeDirty = false;
    return new Dimension()._Dimension$Dimension(this.cachedMinimumSize);
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code MetalComboBoxUI}.
 */
export class MetalComboBoxUI$MetalPropertyChangeListener extends BasicComboBoxUI$PropertyChangeHandler {
  /**
   * Constructs a {@code MetalPropertyChangeListener}.
   */
  _MetalComboBoxUI$MetalPropertyChangeListener(): this {
    this._BasicComboBoxUI$PropertyChangeHandler();
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    super.propertyChange(e);
    let propertyName = e.getPropertyName();
    if (propertyName === 'editable') {
      if (this.$outer.arrowButton instanceof MetalComboBoxButton) {
        let button = this.$outer.arrowButton;
        button.setIconOnly(this.$outer.comboBox.isEditable() || MetalLookAndFeel.usingOcean());
      }
      this.$outer.comboBox.repaint$();
      this.$outer.updateButtonForOcean(this.$outer.arrowButton);
    } else if (propertyName === 'background') {
      let color = e.getNewValue();
      this.$outer.arrowButton.setBackground(color);
      this.$outer.listBox.setBackground(color);
    } else if (propertyName === 'foreground') {
      let color = e.getNewValue();
      this.$outer.arrowButton.setForeground(color);
      this.$outer.listBox.setForeground(color);
    }
  }
}

/**
 * This class should be treated as a &quot;protected&quot; inner class.
 * Instantiate it only within subclasses of {@code MetalComboBoxUI}.
 */
export class MetalComboBoxUI$MetalComboBoxLayoutManager extends BasicComboBoxUI$ComboBoxLayoutManager {
  /**
   * Constructs a {@code MetalComboBoxLayoutManager}.
   */
  _MetalComboBoxUI$MetalComboBoxLayoutManager(): this {
    this._BasicComboBoxUI$ComboBoxLayoutManager();
    return this;
  }
  layoutContainer$Container(parent: Container): void {
    this.$outer.layoutComboBox(parent, this);
  }
  /**
   * Lays out the parent container.
   *
   * @param parent a container
   */
  superLayout(parent: Container): void {
    super.layoutContainer$Container(parent);
  }
}

$J.define(MetalComboBoxUI, 'javax.swing.plaf.metal.MetalComboBoxUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicComboBoxUI', ctors: { '': '_MetalComboBoxUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int' } });
$J.define(MetalComboBoxUI$MetalPropertyChangeListener, 'javax.swing.plaf.metal.MetalComboBoxUI$MetalPropertyChangeListener', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicComboBoxUI$PropertyChangeHandler', ctors: { '': '_MetalComboBoxUI$MetalPropertyChangeListener' }, inner: true });
$J.define(MetalComboBoxUI$MetalComboBoxLayoutManager, 'javax.swing.plaf.metal.MetalComboBoxUI$MetalComboBoxLayoutManager', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicComboBoxUI$ComboBoxLayoutManager', ctors: { '': '_MetalComboBoxUI$MetalComboBoxLayoutManager' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Insets = $J.load('java.awt.Insets');
  MetalBorders = $J.load('javax.swing.plaf.metal.MetalBorders');
  MetalComboBoxButton = $J.load('javax.swing.plaf.metal.MetalComboBoxButton');
  MetalComboBoxEditor$UIResource = $J.load('javax.swing.plaf.metal.MetalComboBoxEditor$UIResource');
  MetalComboBoxIcon = $J.load('javax.swing.plaf.metal.MetalComboBoxIcon');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
