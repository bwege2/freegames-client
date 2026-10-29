// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/SlidingSpinner.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2008, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Integer, JObject } from '../../../../jre/index.ts';

let JSlider, JSpinner, SpinnerNumberModel, ValueFormatter;

export class SlidingSpinner extends JObject {
  panel: ColorPanel = null;
  label: JComponent = null;
  model: SpinnerNumberModel = null;
  slider: JSlider = null;
  spinner: JSpinner = null;
  value_: number = 0;
  internal: boolean = false;
  _SlidingSpinner(panel: ColorPanel, label: JComponent): this {
    this.model = new SpinnerNumberModel()._SpinnerNumberModel$();
    this.slider = new JSlider()._JSlider$();
    this.spinner = new JSpinner()._JSpinner$SpinnerModel(this.model);
    this.panel = panel;
    this.label = label;
    this.slider.addChangeListener($J.fn(this, 'stateChanged'));
    this.spinner.addChangeListener($J.fn(this, 'stateChanged'));
    let editor = this.spinner.getEditor();
    ValueFormatter.init(3, false, editor.getTextField());
    editor.setFocusable(false);
    this.spinner.setFocusable(false);
    return this;
  }
  getLabel(): JComponent {
    return this.label;
  }
  getSlider(): JSlider {
    return this.slider;
  }
  getSpinner(): JSpinner {
    return this.spinner;
  }
  getValue(): number {
    return this.value_;
  }
  setValue(value: number): void {
    let min = this.slider.getMinimum();
    let max = this.slider.getMaximum();
    this.internal = true;
    this.slider.setValue((min + $J.d2i((Math.fround(value * Math.fround(((max - min) | 0)))))) | 0);
    this.spinner.setValue(this.slider.getValue());
    this.internal = false;
    this.value_ = value;
  }
  setRange(min: number, max: number): void {
    this.internal = true;
    this.slider.setMinimum(min);
    this.slider.setMaximum(max);
    this.model.setMinimum(min);
    this.model.setMaximum(max);
    this.internal = false;
  }
  setVisible(visible: boolean): void {
    this.label.setVisible(visible);
    this.slider.setVisible(visible);
    this.spinner.setVisible(visible);
  }
  isVisible(): boolean {
    return this.slider.isVisible$();
  }
  stateChanged(event: ChangeEvent): void {
    if (!this.internal) {
      if (this.spinner === event.getSource()) {
        let value = this.spinner.getValue();
        if ($J.isa(value, Integer)) {
          this.internal = true;
          this.slider.setValue(value);
          this.internal = false;
        }
      }
      let value = this.slider.getValue();
      this.internal = true;
      this.spinner.setValue(value);
      this.internal = false;
      let min = this.slider.getMinimum();
      let max = this.slider.getMaximum();
      this.value_ = Math.fround(Math.fround(((value - min) | 0)) / Math.fround(((max - min) | 0)));
      this.panel.colorChanged();
    }
  }
}

$J.define(SlidingSpinner, 'javax.swing.colorchooser.SlidingSpinner', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.colorchooser.ColorPanel,javax.swing.JComponent': '_SlidingSpinner' } });
$J.module(() => {
  JSlider = $J.load('javax.swing.JSlider');
  JSpinner = $J.load('javax.swing.JSpinner');
  SpinnerNumberModel = $J.load('javax.swing.SpinnerNumberModel');
  ValueFormatter = $J.load('javax.swing.colorchooser.ValueFormatter');
});
