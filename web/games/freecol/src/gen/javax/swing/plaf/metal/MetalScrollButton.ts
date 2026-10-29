// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalScrollButton.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicArrowButton } from '../basic/BasicArrowButton.ts';

let Dimension, SwingConstants, UIManager, MetalLookAndFeel, MetalUtils;

/**
 * JButton object for Metal scrollbar arrows.
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
 * @author Tom Santos
 * @author Steve Wilson
 */
export class MetalScrollButton extends BasicArrowButton {
  static shadowColor: Color = null;
  static highlightColor: Color = null;
  isFreeStanding: boolean = false;
  buttonWidth: number = 0;
  /**
   * Constructs an instance of {@code MetalScrollButton}.
   *
   * @param direction the direction
   * @param width the width
   * @param freeStanding the free standing value
   */
  _MetalScrollButton(direction: number, width: number, freeStanding: boolean): this {
    this._BasicArrowButton$int(direction);
    this.isFreeStanding = false;
    MetalScrollButton.shadowColor = UIManager.getColor$Object('ScrollBar.darkShadow');
    MetalScrollButton.highlightColor = UIManager.getColor$Object('ScrollBar.highlight');
    this.buttonWidth = width;
    this.isFreeStanding = freeStanding;
    return this;
  }
  /**
   * Sets the free standing value.
   *
   * @param freeStanding the free standing value
   */
  setFreeStanding(freeStanding: boolean): void {
    this.isFreeStanding = freeStanding;
  }
  paint(g: Graphics): void {
    let leftToRight = MetalUtils.isLeftToRight(this);
    let isEnabled = this.getParent().isEnabled();
    let arrowColor = isEnabled ? MetalLookAndFeel.getControlInfo() : MetalLookAndFeel.getControlDisabled();
    let isPressed = this.getModel().isPressed();
    let width = this.getWidth();
    let height = this.getHeight();
    let w = width;
    let h = height;
    let arrowHeight = $J.idiv(((height + 1) | 0), 4);
    let arrowWidth = $J.idiv(((height + 1) | 0), 2);
    if (isPressed) {
      g.setColor(MetalLookAndFeel.getControlShadow());
    } else {
      g.setColor(this.getBackground());
    }
    g.fillRect(0, 0, width, height);
    if (this.getDirection() === SwingConstants.NORTH) {
      if (!this.isFreeStanding) {
        height = (height + 1) | 0;
        g.translate$int$int(0, -1);
        width = (width + 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(-1, 0);
        }
      }
      g.setColor(arrowColor);
      let startY = $J.idiv(((h + 1 - arrowHeight) | 0), 2);
      let startX = ($J.idiv(w, 2));
      g.translate$int$int(startX, startY);
      g.fillPolygon$intArr$intArr$int([0, 1, (arrowHeight + 1) | 0, -arrowHeight], [0, 0, arrowHeight, arrowHeight], 4);
      g.translate$int$int(-startX, -startY);
      if (isEnabled) {
        g.setColor(MetalScrollButton.highlightColor);
        if (!isPressed) {
          g.drawLine(1, 1, (width - 3) | 0, 1);
          g.drawLine(1, 1, 1, (height - 1) | 0);
        }
        g.drawLine((width - 1) | 0, 1, (width - 1) | 0, (height - 1) | 0);
        g.setColor(MetalScrollButton.shadowColor);
        g.drawLine(0, 0, (width - 2) | 0, 0);
        g.drawLine(0, 0, 0, (height - 1) | 0);
        g.drawLine((width - 2) | 0, 2, (width - 2) | 0, (height - 1) | 0);
      } else {
        MetalUtils.drawDisabledBorder(g, 0, 0, width, (height + 1) | 0);
      }
      if (!this.isFreeStanding) {
        height = (height - 1) | 0;
        g.translate$int$int(0, 1);
        width = (width - 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(1, 0);
        }
      }
    } else if (this.getDirection() === SwingConstants.SOUTH) {
      if (!this.isFreeStanding) {
        height = (height + 1) | 0;
        width = (width + 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(-1, 0);
        }
      }
      g.setColor(arrowColor);
      let startY = (($J.idiv(((h + 1 - arrowHeight) | 0), 2)) + arrowHeight - 1) | 0;
      let startX = ($J.idiv(w, 2));
      g.translate$int$int(startX, startY);
      g.fillPolygon$intArr$intArr$int([0, 1, (arrowHeight + 1) | 0, -arrowHeight], [0, 0, -arrowHeight, -arrowHeight], 4);
      g.translate$int$int(-startX, -startY);
      if (isEnabled) {
        g.setColor(MetalScrollButton.highlightColor);
        if (!isPressed) {
          g.drawLine(1, 0, (width - 3) | 0, 0);
          g.drawLine(1, 0, 1, (height - 3) | 0);
        }
        g.drawLine(1, (height - 1) | 0, (width - 1) | 0, (height - 1) | 0);
        g.drawLine((width - 1) | 0, 0, (width - 1) | 0, (height - 1) | 0);
        g.setColor(MetalScrollButton.shadowColor);
        g.drawLine(0, 0, 0, (height - 2) | 0);
        g.drawLine((width - 2) | 0, 0, (width - 2) | 0, (height - 2) | 0);
        g.drawLine(2, (height - 2) | 0, (width - 2) | 0, (height - 2) | 0);
      } else {
        MetalUtils.drawDisabledBorder(g, 0, -1, width, (height + 1) | 0);
      }
      if (!this.isFreeStanding) {
        height = (height - 1) | 0;
        width = (width - 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(1, 0);
        }
      }
    } else if (this.getDirection() === SwingConstants.EAST) {
      if (!this.isFreeStanding) {
        height = (height + 2) | 0;
        width = (width + 1) | 0;
      }
      g.setColor(arrowColor);
      let startX = (($J.idiv(((w + 1 - arrowHeight) | 0), 2)) + arrowHeight - 1) | 0;
      let startY = ($J.idiv(h, 2));
      g.translate$int$int(startX, startY);
      g.fillPolygon$intArr$intArr$int([0, 0, -arrowHeight, -arrowHeight], [0, 1, (arrowHeight + 1) | 0, -arrowHeight], 4);
      g.translate$int$int(-startX, -startY);
      if (isEnabled) {
        g.setColor(MetalScrollButton.highlightColor);
        if (!isPressed) {
          g.drawLine(0, 1, (width - 3) | 0, 1);
          g.drawLine(0, 1, 0, (height - 3) | 0);
        }
        g.drawLine((width - 1) | 0, 1, (width - 1) | 0, (height - 1) | 0);
        g.drawLine(0, (height - 1) | 0, (width - 1) | 0, (height - 1) | 0);
        g.setColor(MetalScrollButton.shadowColor);
        g.drawLine(0, 0, (width - 2) | 0, 0);
        g.drawLine((width - 2) | 0, 2, (width - 2) | 0, (height - 2) | 0);
        g.drawLine(0, (height - 2) | 0, (width - 2) | 0, (height - 2) | 0);
      } else {
        MetalUtils.drawDisabledBorder(g, -1, 0, (width + 1) | 0, height);
      }
      if (!this.isFreeStanding) {
        height = (height - 2) | 0;
        width = (width - 1) | 0;
      }
    } else if (this.getDirection() === SwingConstants.WEST) {
      if (!this.isFreeStanding) {
        height = (height + 2) | 0;
        width = (width + 1) | 0;
        g.translate$int$int(-1, 0);
      }
      g.setColor(arrowColor);
      let startX = ($J.idiv(((w + 1 - arrowHeight) | 0), 2));
      let startY = ($J.idiv(h, 2));
      g.translate$int$int(startX, startY);
      g.fillPolygon$intArr$intArr$int([0, 0, arrowHeight, arrowHeight], [0, 1, (arrowHeight + 1) | 0, -arrowHeight], 4);
      g.translate$int$int(-startX, -startY);
      if (isEnabled) {
        g.setColor(MetalScrollButton.highlightColor);
        if (!isPressed) {
          g.drawLine(1, 1, (width - 1) | 0, 1);
          g.drawLine(1, 1, 1, (height - 3) | 0);
        }
        g.drawLine(1, (height - 1) | 0, (width - 1) | 0, (height - 1) | 0);
        g.setColor(MetalScrollButton.shadowColor);
        g.drawLine(0, 0, (width - 1) | 0, 0);
        g.drawLine(0, 0, 0, (height - 2) | 0);
        g.drawLine(2, (height - 2) | 0, (width - 1) | 0, (height - 2) | 0);
      } else {
        MetalUtils.drawDisabledBorder(g, 0, 0, (width + 1) | 0, height);
      }
      if (!this.isFreeStanding) {
        height = (height - 2) | 0;
        width = (width - 1) | 0;
        g.translate$int$int(1, 0);
      }
    }
  }
  getPreferredSize$(): Dimension {
    if (this.getDirection() === SwingConstants.NORTH) {
      return new Dimension()._Dimension$int$int(this.buttonWidth, (this.buttonWidth - 2) | 0);
    } else if (this.getDirection() === SwingConstants.SOUTH) {
      return new Dimension()._Dimension$int$int(this.buttonWidth, (this.buttonWidth - (this.isFreeStanding ? 1 : 2)) | 0);
    } else if (this.getDirection() === SwingConstants.EAST) {
      return new Dimension()._Dimension$int$int((this.buttonWidth - (this.isFreeStanding ? 1 : 2)) | 0, this.buttonWidth);
    } else if (this.getDirection() === SwingConstants.WEST) {
      return new Dimension()._Dimension$int$int((this.buttonWidth - 2) | 0, this.buttonWidth);
    } else {
      return new Dimension()._Dimension$int$int(0, 0);
    }
  }
  getMinimumSize$(): Dimension {
    return this.getPreferredSize$();
  }
  getMaximumSize(): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
}

$J.define(MetalScrollButton, 'javax.swing.plaf.metal.MetalScrollButton', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicArrowButton', ctors: { 'int,int,boolean': '_MetalScrollButton' }, meths: { 'getMinimumSize()': 'getMinimumSize$', 'getPreferredSize()': 'getPreferredSize$' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
