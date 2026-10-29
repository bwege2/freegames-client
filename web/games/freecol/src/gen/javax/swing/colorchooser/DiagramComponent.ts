// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/DiagramComponent.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, BufferedImage } from '../../../../jre/index.ts';
import { JComponent } from '../JComponent.ts';

let Color, Insets;

export class DiagramComponent extends JComponent {
  panel: ColorPanel = null;
  diagram: boolean = false;
  insets_: Insets = null;
  width$DiagramComponent: number = 0;
  height$DiagramComponent: number = 0;
  array: number[] = null;
  image: BufferedImage = null;
  _DiagramComponent(panel: ColorPanel, diagram: boolean): this {
    this._JComponent();
    this.insets_ = new Insets()._Insets(0, 0, 0, 0);
    this.panel = panel;
    this.diagram = diagram;
    this.addMouseListener(this);
    this.addMouseMotionListener(this);
    return this;
  }
  paintComponent(g: Graphics): void {
    this.getInsets$Insets(this.insets_);
    this.width$DiagramComponent = (this.getWidth() - this.insets_.left - this.insets_.right) | 0;
    this.height$DiagramComponent = (this.getHeight() - this.insets_.top - this.insets_.bottom) | 0;
    if ((this.width$DiagramComponent <= 0) || (this.height$DiagramComponent <= 0)) {
      return;
    }
    let update = (this.image == null) || (this.width$DiagramComponent !== this.image.getWidth()) || (this.height$DiagramComponent !== this.image.getHeight());
    if (update) {
      let size = Math.imul(this.width$DiagramComponent, this.height$DiagramComponent);
      if ((this.array == null) || (this.array.length < size)) {
        this.array = $J.newArray(size, 0);
      }
      this.image = new BufferedImage(this.width$DiagramComponent, this.height$DiagramComponent, 1);
    }
    {
      let dx = Math.fround(1 / Math.fround(((this.width$DiagramComponent - 1) | 0)));
      let dy = Math.fround(1 / Math.fround(((this.height$DiagramComponent - 1) | 0)));
      let offset = 0;
      let y = 0;
      for (let h = 0; h < this.height$DiagramComponent; h++, y = Math.fround(y + dy)) {
        if (this.diagram) {
          let x = 0;
          for (let w = 0; w < this.width$DiagramComponent; w++, x = Math.fround(x + dx), offset++) {
            this.array[offset] = this.panel.getColor$float$float(x, y);
          }
        } else {
          let color = this.panel.getColor$float(y);
          for (let w = 0; w < this.width$DiagramComponent; w++, offset++) {
            this.array[offset] = color;
          }
        }
      }
    }
    this.image.setRGB(0, 0, this.width$DiagramComponent, this.height$DiagramComponent, this.array, 0, this.width$DiagramComponent);
    g.drawImage$Image$int$int$int$int$ImageObserver(this.image, this.insets_.left, this.insets_.top, this.width$DiagramComponent, this.height$DiagramComponent, this);
    if (this.isEnabled()) {
      this.width$DiagramComponent--;
      this.height$DiagramComponent--;
      g.setXORMode(Color.WHITE);
      g.setColor(Color.BLACK);
      if (this.diagram) {
        let x = DiagramComponent.getValue$float$int$int(this.panel.getValueX(), this.insets_.left, this.width$DiagramComponent);
        let y = DiagramComponent.getValue$float$int$int(this.panel.getValueY(), this.insets_.top, this.height$DiagramComponent);
        g.drawLine((x - 8) | 0, y, (x + 8) | 0, y);
        g.drawLine(x, (y - 8) | 0, x, (y + 8) | 0);
      } else {
        let z = DiagramComponent.getValue$float$int$int(this.panel.getValueZ(), this.insets_.top, this.height$DiagramComponent);
        g.drawLine(this.insets_.left, z, (this.insets_.left + this.width$DiagramComponent) | 0, z);
      }
      g.setPaintMode();
    }
  }
  mousePressed(event: MouseEvent): void {
    this.mouseDragged(event);
  }
  mouseReleased(event: MouseEvent): void {
  }
  mouseClicked(event: MouseEvent): void {
  }
  mouseEntered(event: MouseEvent): void {
  }
  mouseExited(event: MouseEvent): void {
  }
  mouseMoved(event: MouseEvent): void {
  }
  mouseDragged(event: MouseEvent): void {
    if (this.isEnabled()) {
      let y = DiagramComponent.getValue$int$int$int(event.getY(), this.insets_.top, this.height$DiagramComponent);
      if (this.diagram) {
        let x = DiagramComponent.getValue$int$int$int(event.getX(), this.insets_.left, this.width$DiagramComponent);
        this.panel.setValue$float$float(x, y);
      } else {
        this.panel.setValue$float(y);
      }
    }
  }
  static getValue$float$int$int(value: number, min: number, max: number): number {
    return (min + $J.d2i((Math.fround(value * Math.fround((max)))))) | 0;
  }
  static getValue$int$int$int(value: number, min: number, max: number): number {
    if (min < value) {
      value = (value - min) | 0;
      return (value < max) ? Math.fround(Math.fround(value) / Math.fround(max)) : 1;
    }
    return 0;
  }
}

$J.define(DiagramComponent, 'javax.swing.colorchooser.DiagramComponent', { kind: 'class', ifaces: ['java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.colorchooser.ColorPanel,boolean': '_DiagramComponent' }, meths: { 'getValue(int,int,int)': 'getValue$int$int$int', 'getValue(float,int,int)': 'getValue$float$int$int' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Insets = $J.load('java.awt.Insets');
});
