// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalProgressBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicProgressBarUI } from '../basic/BasicProgressBarUI.ts';

let BasicStroke, Graphics2D, SwingConstants, MetalLookAndFeel, MetalUtils;

/**
 * The Metal implementation of ProgressBarUI.
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
export class MetalProgressBarUI extends BasicProgressBarUI {
  innards: Rectangle = null;
  box: Rectangle = null;
  /**
   * Constructs a {@code MetalProgressBarUI}.
   */
  _MetalProgressBarUI(): this {
    this._BasicProgressBarUI();
    return this;
  }
  /**
   * Constructs an instance of {@code MetalProgressBarUI}.
   *
   * @param c a component
   * @return an instance of {@code MetalProgressBarUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalProgressBarUI()._MetalProgressBarUI();
  }
  /**
   * Draws a bit of special highlighting on the progress bar.
   * The core painting is deferred to the BasicProgressBar's
   * <code>paintDeterminate</code> method.
   * @since 1.4
   */
  paintDeterminate(g: Graphics, c: JComponent): void {
    super.paintDeterminate(g, c);
    if (!(g instanceof Graphics2D)) {
      return;
    }
    if (this.progressBar.isBorderPainted()) {
      let b = this.progressBar.getInsets$();
      let barRectWidth = (this.progressBar.getWidth() - (b.left + b.right)) | 0;
      let barRectHeight = (this.progressBar.getHeight() - (b.top + b.bottom)) | 0;
      let amountFull = this.getAmountFull(b, barRectWidth, barRectHeight);
      let isLeftToRight = MetalUtils.isLeftToRight(c);
      let startX: number;
      let startY: number;
      let endX: number;
      let endY: number;
      startX = b.left;
      startY = b.top;
      endX = (b.left + barRectWidth - 1) | 0;
      endY = (b.top + barRectHeight - 1) | 0;
      let g2 = g;
      g2.setStroke(new BasicStroke()._BasicStroke$float(1));
      if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
        g2.setColor(MetalLookAndFeel.getControlShadow());
        g2.drawLine(startX, startY, endX, startY);
        if (amountFull > 0) {
          g2.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
          if (isLeftToRight) {
            g2.drawLine(startX, startY, (startX + amountFull - 1) | 0, startY);
          } else {
            g2.drawLine(endX, startY, (endX - amountFull + 1) | 0, startY);
            if (this.progressBar.getPercentComplete() !== 1) {
              g2.setColor(MetalLookAndFeel.getControlShadow());
            }
          }
        }
        g2.drawLine(startX, startY, startX, endY);
      } else {
        g2.setColor(MetalLookAndFeel.getControlShadow());
        g2.drawLine(startX, startY, startX, endY);
        if (amountFull > 0) {
          g2.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
          g2.drawLine(startX, endY, startX, (endY - amountFull + 1) | 0);
        }
        g2.setColor(MetalLookAndFeel.getControlShadow());
        if (this.progressBar.getPercentComplete() === 1) {
          g2.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
        }
        g2.drawLine(startX, startY, endX, startY);
      }
    }
  }
  /**
   * Draws a bit of special highlighting on the progress bar
   * and bouncing box.
   * The core painting is deferred to the BasicProgressBar's
   * <code>paintIndeterminate</code> method.
   * @since 1.4
   */
  paintIndeterminate(g: Graphics, c: JComponent): void {
    super.paintIndeterminate(g, c);
    if (!this.progressBar.isBorderPainted() || (!(g instanceof Graphics2D))) {
      return;
    }
    let b = this.progressBar.getInsets$();
    let barRectWidth = (this.progressBar.getWidth() - (b.left + b.right)) | 0;
    let barRectHeight = (this.progressBar.getHeight() - (b.top + b.bottom)) | 0;
    let amountFull = this.getAmountFull(b, barRectWidth, barRectHeight);
    let isLeftToRight = MetalUtils.isLeftToRight(c);
    let startX: number;
    let startY: number;
    let endX: number;
    let endY: number;
    let box = null;
    box = this.getBox(box);
    startX = b.left;
    startY = b.top;
    endX = (b.left + barRectWidth - 1) | 0;
    endY = (b.top + barRectHeight - 1) | 0;
    let g2 = g;
    g2.setStroke(new BasicStroke()._BasicStroke$float(1));
    if (this.progressBar.getOrientation() === SwingConstants.HORIZONTAL) {
      g2.setColor(MetalLookAndFeel.getControlShadow());
      g2.drawLine(startX, startY, endX, startY);
      g2.drawLine(startX, startY, startX, endY);
      g2.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
      g2.drawLine(box.x_, startY, (box.x_ + box.width_ - 1) | 0, startY);
    } else {
      g2.setColor(MetalLookAndFeel.getControlShadow());
      g2.drawLine(startX, startY, startX, endY);
      g2.drawLine(startX, startY, endX, startY);
      g2.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
      g2.drawLine(startX, box.y_, startX, (box.y_ + box.height_ - 1) | 0);
    }
  }
}

$J.define(MetalProgressBarUI, 'javax.swing.plaf.metal.MetalProgressBarUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicProgressBarUI', ctors: { '': '_MetalProgressBarUI' } });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Graphics2D = $J.load('java.awt.Graphics2D');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
