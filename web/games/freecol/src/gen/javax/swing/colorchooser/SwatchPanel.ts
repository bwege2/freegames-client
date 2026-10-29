// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/DefaultSwatchChooserPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { JPanel } from '../JPanel.ts';

let Color, Dimension, FocusAdapter, KeyAdapter, KeyEvent;

export class SwatchPanel extends JPanel {
  colors: Color[] = null;
  swatchSize: Dimension = null;
  numSwatches: Dimension = null;
  gap_: Dimension = null;
  selRow: number = 0;
  selCol: number = 0;
  _SwatchPanel(): this {
    this._JPanel$();
    this.initValues();
    this.initColors();
    this.setToolTipText('');
    this.setOpaque(true);
    this.setBackground(Color.white);
    this.setFocusable(true);
    this.setInheritsPopupMenu(true);
    this.addFocusListener(new (SwatchPanel$1())().$o(this)._FocusAdapter());
    this.addKeyListener(new (SwatchPanel$2())().$o(this)._KeyAdapter());
    return this;
  }
  getSelectedColor(): Color {
    return this.getColorForCell(this.selCol, this.selRow);
  }
  paintComponent(g: Graphics): void {
    g.setColor(this.getBackground());
    g.fillRect(0, 0, this.getWidth(), this.getHeight());
    for (let row = 0; row < this.numSwatches.height_; row++) {
      let y = Math.imul(row, ((this.swatchSize.height_ + this.gap_.height_) | 0));
      for (let column = 0; column < this.numSwatches.width_; column++) {
        let c = this.getColorForCell(column, row);
        g.setColor(c);
        let x: number;
        if (!this.getComponentOrientation().isLeftToRight()) {
          x = Math.imul(((this.numSwatches.width_ - column - 1) | 0), ((this.swatchSize.width_ + this.gap_.width_) | 0));
        } else {
          x = Math.imul(column, ((this.swatchSize.width_ + this.gap_.width_) | 0));
        }
        g.fillRect(x, y, this.swatchSize.width_, this.swatchSize.height_);
        g.setColor(Color.black);
        g.drawLine((x + this.swatchSize.width_ - 1) | 0, y, (x + this.swatchSize.width_ - 1) | 0, (y + this.swatchSize.height_ - 1) | 0);
        g.drawLine(x, (y + this.swatchSize.height_ - 1) | 0, (x + this.swatchSize.width_ - 1) | 0, (y + this.swatchSize.height_ - 1) | 0);
        if (this.selRow === row && this.selCol === column && this.isFocusOwner()) {
          let c2 = new Color()._Color$int$int$int(c.getRed() < 125 ? 255 : 0, c.getGreen() < 125 ? 255 : 0, c.getBlue() < 125 ? 255 : 0);
          g.setColor(c2);
          g.drawLine(x, y, (x + this.swatchSize.width_ - 1) | 0, y);
          g.drawLine(x, y, x, (y + this.swatchSize.height_ - 1) | 0);
          g.drawLine((x + this.swatchSize.width_ - 1) | 0, y, (x + this.swatchSize.width_ - 1) | 0, (y + this.swatchSize.height_ - 1) | 0);
          g.drawLine(x, (y + this.swatchSize.height_ - 1) | 0, (x + this.swatchSize.width_ - 1) | 0, (y + this.swatchSize.height_ - 1) | 0);
          g.drawLine(x, y, (x + this.swatchSize.width_ - 1) | 0, (y + this.swatchSize.height_ - 1) | 0);
          g.drawLine(x, (y + this.swatchSize.height_ - 1) | 0, (x + this.swatchSize.width_ - 1) | 0, y);
        }
      }
    }
  }
  getPreferredSize$(): Dimension {
    let x = (Math.imul(this.numSwatches.width_, ((this.swatchSize.width_ + this.gap_.width_) | 0)) - 1) | 0;
    let y = (Math.imul(this.numSwatches.height_, ((this.swatchSize.height_ + this.gap_.height_) | 0)) - 1) | 0;
    return new Dimension()._Dimension$int$int(x, y);
  }
  getToolTipText$MouseEvent(e: MouseEvent): string {
    let color = this.getColorForLocation(e.getX(), e.getY());
    return color.getRed() + ', ' + color.getGreen() + ', ' + color.getBlue();
  }
  setSelectedColorFromLocation(x: number, y: number): void {
    if (!this.getComponentOrientation().isLeftToRight()) {
      this.selCol = (this.numSwatches.width_ - $J.idiv(x, ((this.swatchSize.width_ + this.gap_.width_) | 0)) - 1) | 0;
    } else {
      this.selCol = $J.idiv(x, ((this.swatchSize.width_ + this.gap_.width_) | 0));
    }
    this.selRow = $J.idiv(y, ((this.swatchSize.height_ + this.gap_.height_) | 0));
    this.repaint$();
  }
  getColorForLocation(x: number, y: number): Color {
    let column: number;
    if (!this.getComponentOrientation().isLeftToRight()) {
      column = (this.numSwatches.width_ - $J.idiv(x, ((this.swatchSize.width_ + this.gap_.width_) | 0)) - 1) | 0;
    } else {
      column = $J.idiv(x, ((this.swatchSize.width_ + this.gap_.width_) | 0));
    }
    let row = $J.idiv(y, ((this.swatchSize.height_ + this.gap_.height_) | 0));
    return this.getColorForCell(column, row);
  }
  getColorForCell(column: number, row: number): Color {
    return this.colors[((Math.imul(row, this.numSwatches.width_)) + column) | 0];
  }
}

let $SwatchPanel$1: any = null;
/** An anonymous class (DefaultSwatchChooserPanel.java:289). */
function SwatchPanel$1(): any {
  return $SwatchPanel$1 ??= $J.local(class extends FocusAdapter {
    focusGained(e: FocusEvent): void {
      this.$outer.repaint$();
    }
    focusLost(e: FocusEvent): void {
      this.$outer.repaint$();
    }
  }, 'javax.swing.colorchooser.SwatchPanel$1', []);
}

let $SwatchPanel$2: any = null;
/** An anonymous class (DefaultSwatchChooserPanel.java:299). */
function SwatchPanel$2(): any {
  return $SwatchPanel$2 ??= $J.local(class extends KeyAdapter {
    keyPressed(e: KeyEvent): void {
      let typed = e.getKeyCode();
      switch (typed) {
        case KeyEvent.VK_UP:
          if (this.$outer.selRow > 0) {
            this.$outer.selRow--;
            this.$outer.repaint$();
          }
          break;
        case KeyEvent.VK_DOWN:
          if (this.$outer.selRow < ((this.$outer.numSwatches.height_ - 1) | 0)) {
            this.$outer.selRow++;
            this.$outer.repaint$();
          }
          break;
        case KeyEvent.VK_LEFT:
          if (this.$outer.selCol > 0 && this.$outer.getComponentOrientation().isLeftToRight()) {
            this.$outer.selCol--;
            this.$outer.repaint$();
          } else if (this.$outer.selCol < ((this.$outer.numSwatches.width_ - 1) | 0) && !this.$outer.getComponentOrientation().isLeftToRight()) {
            this.$outer.selCol++;
            this.$outer.repaint$();
          }
          break;
        case KeyEvent.VK_RIGHT:
          if (this.$outer.selCol < ((this.$outer.numSwatches.width_ - 1) | 0) && this.$outer.getComponentOrientation().isLeftToRight()) {
            this.$outer.selCol++;
            this.$outer.repaint$();
          } else if (this.$outer.selCol > 0 && !this.$outer.getComponentOrientation().isLeftToRight()) {
            this.$outer.selCol--;
            this.$outer.repaint$();
          }
          break;
        case KeyEvent.VK_HOME:
          this.$outer.selCol = 0;
          this.$outer.selRow = 0;
          this.$outer.repaint$();
          break;
        case KeyEvent.VK_END:
          this.$outer.selCol = (this.$outer.numSwatches.width_ - 1) | 0;
          this.$outer.selRow = (this.$outer.numSwatches.height_ - 1) | 0;
          this.$outer.repaint$();
          break;
      }
    }
  }, 'javax.swing.colorchooser.SwatchPanel$2', []);
}

$J.define(SwatchPanel, 'javax.swing.colorchooser.SwatchPanel', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_SwatchPanel' }, meths: { 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'getPreferredSize()': 'getPreferredSize$' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  FocusAdapter = $J.load('java.awt.event.FocusAdapter');
  KeyAdapter = $J.load('java.awt.event.KeyAdapter');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
});
