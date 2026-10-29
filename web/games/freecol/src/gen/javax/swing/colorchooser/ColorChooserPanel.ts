// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/ColorChooserPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Integer } from '../../../../jre/index.ts';
import { AbstractColorChooserPanel } from './AbstractColorChooserPanel.ts';

let Color, Container, GridBagConstraints, GridBagLayout, JComponent, JFormattedTextField, JLabel, SwingConstants, ColorPanel, DiagramComponent, ValueFormatter;

export class ColorChooserPanel extends AbstractColorChooserPanel {
  static readonly MASK: number = -16777216;
  model: ColorModel = null;
  panel: ColorPanel = null;
  slider: DiagramComponent = null;
  diagram: DiagramComponent = null;
  text_: JFormattedTextField = null;
  label: JLabel = null;
  _ColorChooserPanel(model: ColorModel): this {
    this._AbstractColorChooserPanel();
    this.model = model;
    this.panel = new ColorPanel()._ColorPanel(this.model);
    this.slider = new DiagramComponent()._DiagramComponent(this.panel, false);
    this.diagram = new DiagramComponent()._DiagramComponent(this.panel, true);
    this.text_ = new JFormattedTextField()._JFormattedTextField$();
    this.label = new JLabel()._JLabel$String$Icon$int(null, null, SwingConstants.RIGHT);
    ValueFormatter.init(6, true, this.text_);
    return this;
  }
  setEnabled(enabled: boolean): void {
    super.setEnabled(enabled);
    ColorChooserPanel.setEnabled(this, enabled);
  }
  static setEnabled(container: Container, enabled: boolean): void {
    for (let component of container.getComponents()) {
      component.setEnabled(enabled);
      if (component instanceof Container) {
        ColorChooserPanel.setEnabled(component, enabled);
      }
    }
  }
  updateChooser(): void {
    let color = this.getColorFromModel();
    if (color != null) {
      this.panel.setColor(color);
      this.text_.setValue$Object(color.getRGB());
      this.slider.repaint$();
      this.diagram.repaint$();
    }
  }
  buildChooser(): void {
    if (0 === this.getComponentCount()) {
      this.setLayout(new GridBagLayout()._GridBagLayout());
      let gbc = new GridBagConstraints()._GridBagConstraints$();
      gbc.gridx = 3;
      gbc.gridwidth = 2;
      gbc.weighty = 1;
      gbc.anchor = GridBagConstraints.NORTH;
      gbc.fill_ = GridBagConstraints.HORIZONTAL;
      gbc.insets_.top = 10;
      gbc.insets_.right = 10;
      this.add$Component$Object(this.panel, gbc);
      gbc.gridwidth = 1;
      gbc.weightx = 1;
      gbc.weighty = 0;
      gbc.anchor = GridBagConstraints.CENTER;
      gbc.insets_.right = 5;
      gbc.insets_.bottom = 10;
      this.add$Component$Object(this.label, gbc);
      gbc.gridx = 4;
      gbc.weightx = 0;
      gbc.insets_.right = 10;
      this.add$Component$Object(this.text_, gbc);
      gbc.gridx = 2;
      gbc.gridheight = 2;
      gbc.anchor = GridBagConstraints.NORTH;
      gbc.ipadx = this.text_.getPreferredSize$().height_;
      gbc.ipady = this.getPreferredSize$().height_;
      this.add$Component$Object(this.slider, gbc);
      gbc.gridx = 1;
      gbc.insets_.left = 10;
      gbc.ipadx = gbc.ipady;
      this.add$Component$Object(this.diagram, gbc);
      this.label.setLabelFor(this.text_);
      this.text_.addPropertyChangeListener$String$PropertyChangeListener('value', $J.fn(this, 'propertyChange'));
      this.slider.setBorder(this.text_.getBorder());
      this.diagram.setBorder(this.text_.getBorder());
      ColorChooserPanel.setInheritsPopupMenu(this, true);
    }
    let label = this.model.getText(this, 'HexCode');
    let visible = label != null;
    this.text_.setVisible(visible);
    this.text_.getAccessibleContext().setAccessibleDescription(label);
    this.label.setVisible(visible);
    if (visible) {
      this.label.setText(label);
      let mnemonic = this.model.getInteger(this, 'HexCodeMnemonic');
      if (mnemonic > 0) {
        this.label.setDisplayedMnemonic$int(mnemonic);
        mnemonic = this.model.getInteger(this, 'HexCodeMnemonicIndex');
        if (mnemonic >= 0) {
          this.label.setDisplayedMnemonicIndex(mnemonic);
        }
      }
    }
    this.panel.buildPanel();
  }
  getDisplayName(): string {
    return this.model.getText(this, 'Name');
  }
  getMnemonic(): number {
    return this.model.getInteger(this, 'Mnemonic');
  }
  getDisplayedMnemonicIndex(): number {
    return this.model.getInteger(this, 'DisplayedMnemonicIndex');
  }
  setColorTransparencySelectionEnabled(b: boolean): void {
    let oldValue = this.isColorTransparencySelectionEnabled();
    if (b !== oldValue) {
      this.panel.setColorTransparencySelectionEnabled(b);
      this.firePropertyChange$String$boolean$boolean(AbstractColorChooserPanel.TRANSPARENCY_ENABLED_PROPERTY, oldValue, b);
    }
  }
  isColorTransparencySelectionEnabled(): boolean {
    return this.panel.isColorTransparencySelectionEnabled();
  }
  propertyChange(event: PropertyChangeEvent): void {
    let model = this.getColorSelectionModel();
    if (model != null) {
      let object$ = event.getNewValue();
      if ($J.isa(object$, Integer)) {
        let value = ColorChooserPanel.MASK & model.getSelectedColor().getRGB() | object$;
        model.setSelectedColor(new Color()._Color$int$boolean(value, true));
      }
    }
    this.text_.selectAll();
  }
  /**
   * Allows to show context popup for all components recursively.
   *
   * @param component  the root component of the tree
   * @param value      whether or not the popup menu is inherited
   */
  static setInheritsPopupMenu(component: JComponent, value: boolean): void {
    component.setInheritsPopupMenu(value);
    for (let object$ of component.getComponents()) {
      if (object$ instanceof JComponent) {
        ColorChooserPanel.setInheritsPopupMenu(object$, value);
      }
    }
  }
}

$J.define(ColorChooserPanel, 'javax.swing.colorchooser.ColorChooserPanel', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.colorchooser.AbstractColorChooserPanel', ctors: { 'javax.swing.colorchooser.ColorModel': '_ColorChooserPanel' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Container = $J.load('java.awt.Container');
  GridBagConstraints = $J.load('java.awt.GridBagConstraints');
  GridBagLayout = $J.load('java.awt.GridBagLayout');
  JComponent = $J.load('javax.swing.JComponent');
  JFormattedTextField = $J.load('javax.swing.JFormattedTextField');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  ColorPanel = $J.load('javax.swing.colorchooser.ColorPanel');
  DiagramComponent = $J.load('javax.swing.colorchooser.DiagramComponent');
  ValueFormatter = $J.load('javax.swing.colorchooser.ValueFormatter');
});
