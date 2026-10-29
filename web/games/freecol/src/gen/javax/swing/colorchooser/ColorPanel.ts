// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, NumberFormatException } from '../../../../jre/index.ts';
import { JPanel } from '../JPanel.ts';

let Color, GridBagConstraints, GridBagLayout, ButtonGroup, JLabel, JRadioButton, EmptyBorder, ColorChooserPanel, SlidingSpinner;

export class ColorPanel extends JPanel {
  spinners: SlidingSpinner[] = null;
  values_: number[] = null;
  model: ColorModel = null;
  color: Color = null;
  x$ColorPanel: number = 0;
  y$ColorPanel: number = 0;
  z: number = 0;
  _ColorPanel(model: ColorModel): this {
    this._JPanel$LayoutManager(new GridBagLayout()._GridBagLayout());
    this.spinners = $J.newArray(5, null);
    this.values_ = $J.newArray(this.spinners.length, 0);
    this.x$ColorPanel = 1;
    this.y$ColorPanel = 2;
    let gbc = new GridBagConstraints()._GridBagConstraints$();
    gbc.fill_ = GridBagConstraints.HORIZONTAL;
    gbc.gridx = 1;
    let group = new ButtonGroup()._ButtonGroup();
    let border = null;
    for (let i = 0; i < this.spinners.length; i++) {
      if (i < 3) {
        let button = new JRadioButton()._JRadioButton$();
        if (i === 0) {
          let insets = button.getInsets$();
          insets.left = button.getPreferredSize$().width_;
          border = new EmptyBorder()._EmptyBorder$Insets(insets);
          button.setSelected(true);
          gbc.insets_.top = 5;
        }
        this.add$Component$Object(button, gbc);
        group.add(button);
        button.setActionCommand(String(i));
        button.addActionListener($J.fn(this, 'actionPerformed'));
        this.spinners[i] = new SlidingSpinner()._SlidingSpinner(this, button);
      } else {
        let label = new JLabel()._JLabel$();
        this.add$Component$Object(label, gbc);
        label.setBorder(border);
        label.setFocusable(false);
        this.spinners[i] = new SlidingSpinner()._SlidingSpinner(this, label);
      }
    }
    gbc.gridx = 2;
    gbc.weightx = 1;
    gbc.insets_.top = 0;
    gbc.insets_.left = 5;
    for (let spinner of this.spinners) {
      this.add$Component$Object(spinner.getSlider(), gbc);
      gbc.insets_.top = 5;
    }
    gbc.gridx = 3;
    gbc.weightx = 0;
    gbc.insets_.top = 0;
    for (let spinner of this.spinners) {
      this.add$Component$Object(spinner.getSpinner(), gbc);
      gbc.insets_.top = 5;
    }
    this.setFocusable(false);
    this.model = model;
    return this;
  }
  actionPerformed(event: ActionEvent): void {
    try {
      this.z = $J.parseInt(event.getActionCommand());
      this.y$ColorPanel = (this.z !== 2) ? 2 : 1;
      this.x$ColorPanel = (this.z !== 0) ? 0 : 1;
      this.getParent().repaint$();
    } catch ($e0) {
      if ($J.isa($e0, NumberFormatException)) {
        let exception = $J.exc($e0);
      } else {
        throw $e0;
      }
    }
  }
  buildPanel(): void {
    let count = this.model.getCount();
    this.spinners[4].setVisible(count > 4);
    for (let i = 0; i < count; i++) {
      let text = this.model.getLabel(this, i);
      let object$ = this.spinners[i].getLabel();
      if (object$ instanceof JRadioButton) {
        let button = object$;
        button.setText(text);
        button.getAccessibleContext().setAccessibleDescription(text);
      } else if (object$ instanceof JLabel) {
        let label = object$;
        label.setText(text);
      }
      this.spinners[i].setRange(this.model.getMinimum(i), this.model.getMaximum(i));
      this.spinners[i].setValue(this.values_[i]);
      this.spinners[i].getSlider().getAccessibleContext().setAccessibleName(text);
      this.spinners[i].getSpinner().getAccessibleContext().setAccessibleName(text);
      let editor = this.spinners[i].getSpinner().getEditor();
      editor.getTextField().getAccessibleContext().setAccessibleName(text);
      this.spinners[i].getSlider().getAccessibleContext().setAccessibleDescription(text);
      this.spinners[i].getSpinner().getAccessibleContext().setAccessibleDescription(text);
      editor.getTextField().getAccessibleContext().setAccessibleDescription(text);
    }
  }
  colorChanged(): void {
    this.color = new Color()._Color$int$boolean(this.getColor$int$ColorPanel(0), this.isColorTransparencySelectionEnabled());
    let parent = this.getParent();
    if (parent instanceof ColorChooserPanel) {
      let chooser = parent;
      chooser.setSelectedColor(this.color);
      chooser.repaint$();
    }
  }
  getValueX(): number {
    return this.spinners[this.x$ColorPanel].getValue();
  }
  getValueY(): number {
    return Math.fround(1 - this.spinners[this.y$ColorPanel].getValue());
  }
  getValueZ(): number {
    return Math.fround(1 - this.spinners[this.z].getValue());
  }
  setValue$float(z: number): void {
    this.spinners[this.z].setValue(Math.fround(1 - z));
    this.colorChanged();
  }
  setValue$float$float(x: number, y: number): void {
    this.spinners[this.x$ColorPanel].setValue(x);
    this.spinners[this.y$ColorPanel].setValue(Math.fround(1 - y));
    this.colorChanged();
  }
  getColor$float(z: number): number {
    this.setDefaultValue(this.x$ColorPanel);
    this.setDefaultValue(this.y$ColorPanel);
    this.values_[this.z] = Math.fround(1 - z);
    return this.getColor$int$ColorPanel(3);
  }
  getColor$float$float(x: number, y: number): number {
    this.values_[this.x$ColorPanel] = x;
    this.values_[this.y$ColorPanel] = Math.fround(1 - y);
    this.setValue$int$ColorPanel(this.z);
    return this.getColor$int$ColorPanel(3);
  }
  setColor(color: Color): void {
    if (!color.equals(this.color)) {
      this.color = color;
      this.model.setColor(color.getRGB(), this.values_);
      for (let i = 0; i < this.model.getCount(); i++) {
        this.spinners[i].setValue(this.values_[i]);
      }
    }
  }
  getColor$int$ColorPanel(index: number): number {
    while (index < this.model.getCount()) {
      this.setValue$int$ColorPanel(index++);
    }
    return this.model.getColor(this.values_);
  }
  setColorTransparencySelectionEnabled(b: boolean): void {
    if ((this.spinners[(this.model.getCount() - 1) | 0]).isVisible() !== b) {
      (this.spinners[(this.model.getCount() - 1) | 0]).setVisible(b);
      this.colorChanged();
    }
  }
  isColorTransparencySelectionEnabled(): boolean {
    return (this.spinners[(this.model.getCount() - 1) | 0]).isVisible();
  }
  setValue$int$ColorPanel(index: number): void {
    this.values_[index] = this.spinners[index].getValue();
  }
  setDefaultValue(index: number): void {
    let value = this.model.getDefault(index);
    this.values_[index] = (value < 0) ? this.spinners[index].getValue() : value;
  }
}

$J.define(ColorPanel, 'javax.swing.colorchooser.ColorPanel', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'javax.swing.JPanel', ctors: { 'javax.swing.colorchooser.ColorModel': '_ColorPanel' }, meths: { 'setValue(int)': 'setValue$int$ColorPanel', 'getColor(int)': 'getColor$int$ColorPanel', 'getColor(float,float)': 'getColor$float$float', 'getColor(float)': 'getColor$float', 'setValue(float,float)': 'setValue$float$float', 'setValue(float)': 'setValue$float' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  GridBagConstraints = $J.load('java.awt.GridBagConstraints');
  GridBagLayout = $J.load('java.awt.GridBagLayout');
  ButtonGroup = $J.load('javax.swing.ButtonGroup');
  JLabel = $J.load('javax.swing.JLabel');
  JRadioButton = $J.load('javax.swing.JRadioButton');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  ColorChooserPanel = $J.load('javax.swing.colorchooser.ColorChooserPanel');
  SlidingSpinner = $J.load('javax.swing.colorchooser.SlidingSpinner');
});
