// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalSplitPaneDivider.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../jre/index.ts';
import { BasicSplitPaneDivider } from '../basic/BasicSplitPaneDivider.ts';

let Cursor, JButton, JSplitPane, UIManager, MetalBumps, MetalLookAndFeel;

/**
 * Metal's split pane divider
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
 * @author Steve Wilson
 * @author Ralph kar
 */
export class MetalSplitPaneDivider extends BasicSplitPaneDivider {
  bumps: MetalBumps = null;
  focusBumps: MetalBumps = null;
  inset: number = 0;
  controlColor: Color = null;
  primaryControlColor: Color = null;
  _MetalSplitPaneDivider(ui: BasicSplitPaneUI): this {
    this._BasicSplitPaneDivider(ui);
    this.bumps = new MetalBumps()._MetalBumps(10, 10, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlDarkShadow(), MetalLookAndFeel.getControl());
    this.focusBumps = new MetalBumps()._MetalBumps(10, 10, MetalLookAndFeel.getPrimaryControlHighlight(), MetalLookAndFeel.getPrimaryControlDarkShadow(), UIManager.getColor$Object('SplitPane.dividerFocusColor'));
    this.inset = 2;
    this.controlColor = MetalLookAndFeel.getControl();
    this.primaryControlColor = UIManager.getColor$Object('SplitPane.dividerFocusColor');
    return this;
  }
  paint(g: Graphics): void {
    let usedBumps: MetalBumps;
    if (this.splitPane.hasFocus()) {
      usedBumps = this.focusBumps;
      g.setColor(this.primaryControlColor);
    } else {
      usedBumps = this.bumps;
      g.setColor(this.controlColor);
    }
    let clip = g.getClipBounds$();
    let insets = this.getInsets$();
    g.fillRect(clip.x_, clip.y_, clip.width_, clip.height_);
    let size = this.getSize$();
    size.width_ = (size.width_ - Math.imul(this.inset, 2)) | 0;
    size.height_ = (size.height_ - Math.imul(this.inset, 2)) | 0;
    let drawX = this.inset;
    let drawY = this.inset;
    if (insets != null) {
      size.width_ = (size.width_ - (insets.left + insets.right)) | 0;
      size.height_ = (size.height_ - (insets.top + insets.bottom)) | 0;
      drawX = (drawX + insets.left) | 0;
      drawY = (drawY + insets.top) | 0;
    }
    usedBumps.setBumpArea$Dimension(size);
    usedBumps.paintIcon(this, g, drawX, drawY);
    super.paint(g);
  }
  /**
   * Creates and return an instance of JButton that can be used to
   * collapse the left component in the metal split pane.
   */
  createLeftOneTouchButton(): JButton {
    let b = new (MetalSplitPaneDivider$1())().$o(this)._JButton$().$init_anon();
    b.setRequestFocusEnabled(false);
    b.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
    b.setFocusPainted(false);
    b.setBorderPainted(false);
    this.maybeMakeButtonOpaque(b);
    return b;
  }
  /**
   * If necessary <code>c</code> is made opaque.
   */
  maybeMakeButtonOpaque(c: JComponent): void {
    let opaque = UIManager.get$Object('SplitPane.oneTouchButtonsOpaque');
    if (opaque != null) {
      c.setOpaque((opaque));
    }
  }
  /**
   * Creates and return an instance of JButton that can be used to
   * collapse the right component in the metal split pane.
   */
  createRightOneTouchButton(): JButton {
    let b = new (MetalSplitPaneDivider$2())().$o(this)._JButton$().$init_anon();
    b.setCursor$Cursor(Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR));
    b.setFocusPainted(false);
    b.setBorderPainted(false);
    b.setRequestFocusEnabled(false);
    this.maybeMakeButtonOpaque(b);
    return b;
  }
  getOneTouchSizeFromSuper(): number {
    return BasicSplitPaneDivider.ONE_TOUCH_SIZE;
  }
  getOrientationFromSuper(): number {
    return this.orientation;
  }
  getSplitPaneFromSuper(): JSplitPane {
    return this.splitPane;
  }
}

let $MetalSplitPaneDivider$1: any = null;
/** An anonymous class (MetalSplitPaneDivider.java:106). */
function MetalSplitPaneDivider$1(): any {
  return $MetalSplitPaneDivider$1 ??= $J.local(class extends JButton {
    buffer: number[][] = null;
    $init_anon() {
      this.buffer = [[0, 0, 0, 2, 2, 0, 0, 0, 0], [0, 0, 2, 1, 1, 1, 0, 0, 0], [0, 2, 1, 1, 1, 1, 1, 0, 0], [2, 1, 1, 1, 1, 1, 1, 1, 0], [0, 3, 3, 3, 3, 3, 3, 3, 3]];
      return this;
    }
    setBorder(b: Border): void {
    }
    paint(g: Graphics): void {
      let splitPane = this.$outer.getSplitPaneFromSuper();
      if (splitPane != null) {
        let oneTouchSize = this.$outer.getOneTouchSizeFromSuper();
        let orientation = this.$outer.getOrientationFromSuper();
        let blockSize = Math.min(this.$outer.getDividerSize(), oneTouchSize);
        let colors = [this.getBackground(), MetalLookAndFeel.getPrimaryControlDarkShadow(), MetalLookAndFeel.getPrimaryControlInfo(), MetalLookAndFeel.getPrimaryControlHighlight()];
        g.setColor(this.getBackground());
        if (this.isOpaque()) {
          g.fillRect(0, 0, this.getWidth(), this.getHeight());
        }
        if (this.getModel().isPressed()) {
          colors[1] = colors[2];
        }
        if (orientation === JSplitPane.VERTICAL_SPLIT) {
          for (let i = 1; i <= this.buffer[0].length; i++) {
            for (let j = 1; j < blockSize; j++) {
              if (((this.buffer[(j - 1) | 0])[(i - 1) | 0]) === 0) {
                continue;
              } else {
                g.setColor(colors[(this.buffer[(j - 1) | 0])[(i - 1) | 0]]);
              }
              g.drawLine(i, j, i, j);
            }
          }
        } else {
          for (let i = 1; i <= this.buffer[0].length; i++) {
            for (let j = 1; j < blockSize; j++) {
              if (((this.buffer[(j - 1) | 0])[(i - 1) | 0]) === 0) {
                continue;
              } else {
                g.setColor(colors[(this.buffer[(j - 1) | 0])[(i - 1) | 0]]);
              }
              g.drawLine(j, i, j, i);
            }
          }
        }
      }
    }
    isFocusTraversable(): boolean {
      return false;
    }
  }, 'javax.swing.plaf.metal.MetalSplitPaneDivider$1', []);
}

let $MetalSplitPaneDivider$2: any = null;
/** An anonymous class (MetalSplitPaneDivider.java:216). */
function MetalSplitPaneDivider$2(): any {
  return $MetalSplitPaneDivider$2 ??= $J.local(class extends JButton {
    buffer: number[][] = null;
    $init_anon() {
      this.buffer = [[2, 2, 2, 2, 2, 2, 2, 2], [0, 1, 1, 1, 1, 1, 1, 3], [0, 0, 1, 1, 1, 1, 3, 0], [0, 0, 0, 1, 1, 3, 0, 0], [0, 0, 0, 0, 3, 0, 0, 0]];
      return this;
    }
    setBorder(border: Border): void {
    }
    paint(g: Graphics): void {
      let splitPane = this.$outer.getSplitPaneFromSuper();
      if (splitPane != null) {
        let oneTouchSize = this.$outer.getOneTouchSizeFromSuper();
        let orientation = this.$outer.getOrientationFromSuper();
        let blockSize = Math.min(this.$outer.getDividerSize(), oneTouchSize);
        let colors = [this.getBackground(), MetalLookAndFeel.getPrimaryControlDarkShadow(), MetalLookAndFeel.getPrimaryControlInfo(), MetalLookAndFeel.getPrimaryControlHighlight()];
        g.setColor(this.getBackground());
        if (this.isOpaque()) {
          g.fillRect(0, 0, this.getWidth(), this.getHeight());
        }
        if (this.getModel().isPressed()) {
          colors[1] = colors[2];
        }
        if (orientation === JSplitPane.VERTICAL_SPLIT) {
          for (let i = 1; i <= this.buffer[0].length; i++) {
            for (let j = 1; j < blockSize; j++) {
              if (((this.buffer[(j - 1) | 0])[(i - 1) | 0]) === 0) {
                continue;
              } else {
                g.setColor(colors[(this.buffer[(j - 1) | 0])[(i - 1) | 0]]);
              }
              g.drawLine(i, j, i, j);
            }
          }
        } else {
          for (let i = 1; i <= this.buffer[0].length; i++) {
            for (let j = 1; j < blockSize; j++) {
              if (((this.buffer[(j - 1) | 0])[(i - 1) | 0]) === 0) {
                continue;
              } else {
                g.setColor(colors[(this.buffer[(j - 1) | 0])[(i - 1) | 0]]);
              }
              g.drawLine(j, i, j, i);
            }
          }
        }
      }
    }
    isFocusTraversable(): boolean {
      return false;
    }
  }, 'javax.swing.plaf.metal.MetalSplitPaneDivider$2', []);
}

$J.define(MetalSplitPaneDivider, 'javax.swing.plaf.metal.MetalSplitPaneDivider', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicSplitPaneDivider', ctors: { 'javax.swing.plaf.basic.BasicSplitPaneUI': '_MetalSplitPaneDivider' } });
$J.module(() => {
  Cursor = $J.load('java.awt.Cursor');
  JButton = $J.load('javax.swing.JButton');
  JSplitPane = $J.load('javax.swing.JSplitPane');
  UIManager = $J.load('javax.swing.UIManager');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
});
