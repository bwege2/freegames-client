// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalScrollBarUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicScrollBarUI } from '../basic/BasicScrollBarUI.ts';
import { BasicScrollBarUI$PropertyChangeHandler } from '../basic/BasicScrollBarUI.ts';

let Adjustable, Dimension, UIManager, MetalBumps, MetalLookAndFeel, MetalScrollButton, MetalUtils, SwingUtilities2;

/**
 * Implementation of ScrollBarUI for the Metal Look and Feel
 *
 * @author Tom Santos
 * @author Steve Wilson
 */
export class MetalScrollBarUI extends BasicScrollBarUI {
  static shadowColor: Color = null;
  static highlightColor: Color = null;
  static darkShadowColor: Color = null;
  static thumbColor: Color = null;
  static thumbShadow: Color = null;
  static thumbHighlightColor: Color = null;
  /**
   * The metal bumps.
   */
  bumps: MetalBumps = null;
  /**
   * The increase button.
   */
  increaseButton: MetalScrollButton = null;
  /**
   * The decrease button.
   */
  decreaseButton: MetalScrollButton = null;
  /**
   * The width of the scroll bar.
   */
  scrollBarWidth$MetalScrollBarUI: number = 0;
  /**
   * The property {@code JScrollBar.isFreeStanding}.
   */
  static readonly FREE_STANDING_PROP: string = 'JScrollBar.isFreeStanding';
  /**
   * The value of the property {@code JScrollBar.isFreeStanding}.
   */
  isFreeStanding: boolean = false;
  /**
   * Constructs a {@code MetalScrollBarUI}.
   */
  _MetalScrollBarUI(): this {
    this._BasicScrollBarUI();
    this.isFreeStanding = true;
    return this;
  }
  /**
   * Constructs a new {@code MetalScrollBarUI} instance.
   *
   * @param c a component
   * @return a new {@code MetalScrollBarUI} instance
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalScrollBarUI()._MetalScrollBarUI();
  }
  installDefaults(): void {
    this.scrollBarWidth$MetalScrollBarUI = (+((UIManager.get$Object('ScrollBar.width'))));
    super.installDefaults();
    this.bumps = new MetalBumps()._MetalBumps(10, 10, MetalScrollBarUI.thumbHighlightColor, MetalScrollBarUI.thumbShadow, MetalScrollBarUI.thumbColor);
  }
  installListeners(): void {
    super.installListeners();
    ($J.unfn(this.propertyChangeListener)).handlePropertyChange(this.scrollbar.getClientProperty(MetalScrollBarUI.FREE_STANDING_PROP));
  }
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(new MetalScrollBarUI$ScrollBarListener().$o(this)._MetalScrollBarUI$ScrollBarListener(), 'propertyChange');
  }
  configureScrollBarColors(): void {
    super.configureScrollBarColors();
    MetalScrollBarUI.shadowColor = UIManager.getColor$Object('ScrollBar.shadow');
    MetalScrollBarUI.highlightColor = UIManager.getColor$Object('ScrollBar.highlight');
    MetalScrollBarUI.darkShadowColor = UIManager.getColor$Object('ScrollBar.darkShadow');
    MetalScrollBarUI.thumbColor = UIManager.getColor$Object('ScrollBar.thumb');
    MetalScrollBarUI.thumbShadow = UIManager.getColor$Object('ScrollBar.thumbShadow');
    MetalScrollBarUI.thumbHighlightColor = UIManager.getColor$Object('ScrollBar.thumbHighlight');
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    if (this.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      return new Dimension()._Dimension$int$int(this.scrollBarWidth$MetalScrollBarUI, (Math.imul(this.scrollBarWidth$MetalScrollBarUI, 3) + 10) | 0);
    } else {
      return new Dimension()._Dimension$int$int((Math.imul(this.scrollBarWidth$MetalScrollBarUI, 3) + 10) | 0, this.scrollBarWidth$MetalScrollBarUI);
    }
  }
  /**
   * Returns the view that represents the decrease view.
   */
  createDecreaseButton(orientation: number): JButton {
    this.decreaseButton = new MetalScrollButton()._MetalScrollButton(orientation, this.scrollBarWidth$MetalScrollBarUI, this.isFreeStanding);
    return this.decreaseButton;
  }
  /**
   * Returns the view that represents the increase view.
   */
  createIncreaseButton(orientation: number): JButton {
    this.increaseButton = new MetalScrollButton()._MetalScrollButton(orientation, this.scrollBarWidth$MetalScrollBarUI, this.isFreeStanding);
    return this.increaseButton;
  }
  paintTrack(g: Graphics, c: JComponent, trackBounds: Rectangle): void {
    g.translate$int$int(trackBounds.x_, trackBounds.y_);
    let leftToRight = MetalUtils.isLeftToRight(c);
    if (this.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      if (!this.isFreeStanding) {
        trackBounds.width_ = (trackBounds.width_ + 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(-1, 0);
        }
      }
      if (c.isEnabled()) {
        g.setColor(MetalScrollBarUI.darkShadowColor);
        SwingUtilities2.drawVLine(g, 0, 0, (trackBounds.height_ - 1) | 0);
        SwingUtilities2.drawVLine(g, (trackBounds.width_ - 2) | 0, 0, (trackBounds.height_ - 1) | 0);
        SwingUtilities2.drawHLine(g, 2, (trackBounds.width_ - 1) | 0, (trackBounds.height_ - 1) | 0);
        SwingUtilities2.drawHLine(g, 2, (trackBounds.width_ - 2) | 0, 0);
        g.setColor(MetalScrollBarUI.shadowColor);
        SwingUtilities2.drawVLine(g, 1, 1, (trackBounds.height_ - 2) | 0);
        SwingUtilities2.drawHLine(g, 1, (trackBounds.width_ - 3) | 0, 1);
        if (this.scrollbar.getValue() !== this.scrollbar.getMaximum()) {
          let y = (this.thumbRect.y_ + this.thumbRect.height_ - trackBounds.y_) | 0;
          SwingUtilities2.drawHLine(g, 1, (trackBounds.width_ - 1) | 0, y);
        }
        g.setColor(MetalScrollBarUI.highlightColor);
        SwingUtilities2.drawVLine(g, (trackBounds.width_ - 1) | 0, 0, (trackBounds.height_ - 1) | 0);
      } else {
        MetalUtils.drawDisabledBorder(g, 0, 0, trackBounds.width_, trackBounds.height_);
      }
      if (!this.isFreeStanding) {
        trackBounds.width_ = (trackBounds.width_ - 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(1, 0);
        }
      }
    } else {
      if (!this.isFreeStanding) {
        trackBounds.height_ = (trackBounds.height_ + 2) | 0;
      }
      if (c.isEnabled()) {
        g.setColor(MetalScrollBarUI.darkShadowColor);
        SwingUtilities2.drawHLine(g, 0, (trackBounds.width_ - 1) | 0, 0);
        SwingUtilities2.drawVLine(g, 0, 2, (trackBounds.height_ - 2) | 0);
        SwingUtilities2.drawHLine(g, 0, (trackBounds.width_ - 1) | 0, (trackBounds.height_ - 2) | 0);
        SwingUtilities2.drawVLine(g, (trackBounds.width_ - 1) | 0, 2, (trackBounds.height_ - 1) | 0);
        g.setColor(MetalScrollBarUI.shadowColor);
        SwingUtilities2.drawHLine(g, 1, (trackBounds.width_ - 2) | 0, 1);
        SwingUtilities2.drawVLine(g, 1, 1, (trackBounds.height_ - 3) | 0);
        SwingUtilities2.drawHLine(g, 0, (trackBounds.width_ - 1) | 0, (trackBounds.height_ - 1) | 0);
        if (this.scrollbar.getValue() !== this.scrollbar.getMaximum()) {
          let x = (this.thumbRect.x_ + this.thumbRect.width_ - trackBounds.x_) | 0;
          SwingUtilities2.drawVLine(g, x, 1, (trackBounds.height_ - 1) | 0);
        }
      } else {
        MetalUtils.drawDisabledBorder(g, 0, 0, trackBounds.width_, trackBounds.height_);
      }
      if (!this.isFreeStanding) {
        trackBounds.height_ = (trackBounds.height_ - 2) | 0;
      }
    }
    g.translate$int$int(-trackBounds.x_, -trackBounds.y_);
  }
  paintThumb(g: Graphics, c: JComponent, thumbBounds: Rectangle): void {
    if (!c.isEnabled()) {
      return;
    }
    if (MetalLookAndFeel.usingOcean()) {
      this.oceanPaintThumb(g, c, thumbBounds);
      return;
    }
    let leftToRight = MetalUtils.isLeftToRight(c);
    g.translate$int$int(thumbBounds.x_, thumbBounds.y_);
    if (this.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      if (!this.isFreeStanding) {
        thumbBounds.width_ = (thumbBounds.width_ + 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(-1, 0);
        }
      }
      g.setColor(MetalScrollBarUI.thumbColor);
      g.fillRect(0, 0, (thumbBounds.width_ - 2) | 0, (thumbBounds.height_ - 1) | 0);
      g.setColor(MetalScrollBarUI.thumbShadow);
      SwingUtilities2.drawRect(g, 0, 0, (thumbBounds.width_ - 2) | 0, (thumbBounds.height_ - 1) | 0);
      g.setColor(MetalScrollBarUI.thumbHighlightColor);
      SwingUtilities2.drawHLine(g, 1, (thumbBounds.width_ - 3) | 0, 1);
      SwingUtilities2.drawVLine(g, 1, 1, (thumbBounds.height_ - 2) | 0);
      this.bumps.setBumpArea$int$int((thumbBounds.width_ - 6) | 0, (thumbBounds.height_ - 7) | 0);
      this.bumps.paintIcon(c, g, 3, 4);
      if (!this.isFreeStanding) {
        thumbBounds.width_ = (thumbBounds.width_ - 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(1, 0);
        }
      }
    } else {
      if (!this.isFreeStanding) {
        thumbBounds.height_ = (thumbBounds.height_ + 2) | 0;
      }
      g.setColor(MetalScrollBarUI.thumbColor);
      g.fillRect(0, 0, (thumbBounds.width_ - 1) | 0, (thumbBounds.height_ - 2) | 0);
      g.setColor(MetalScrollBarUI.thumbShadow);
      SwingUtilities2.drawRect(g, 0, 0, (thumbBounds.width_ - 1) | 0, (thumbBounds.height_ - 2) | 0);
      g.setColor(MetalScrollBarUI.thumbHighlightColor);
      SwingUtilities2.drawHLine(g, 1, (thumbBounds.width_ - 3) | 0, 1);
      SwingUtilities2.drawVLine(g, 1, 1, (thumbBounds.height_ - 3) | 0);
      this.bumps.setBumpArea$int$int((thumbBounds.width_ - 7) | 0, (thumbBounds.height_ - 6) | 0);
      this.bumps.paintIcon(c, g, 4, 3);
      if (!this.isFreeStanding) {
        thumbBounds.height_ = (thumbBounds.height_ - 2) | 0;
      }
    }
    g.translate$int$int(-thumbBounds.x_, -thumbBounds.y_);
  }
  oceanPaintThumb(g: Graphics, c: JComponent, thumbBounds: Rectangle): void {
    let leftToRight = MetalUtils.isLeftToRight(c);
    g.translate$int$int(thumbBounds.x_, thumbBounds.y_);
    if (this.scrollbar.getOrientation() === Adjustable.VERTICAL) {
      if (!this.isFreeStanding) {
        thumbBounds.width_ = (thumbBounds.width_ + 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(-1, 0);
        }
      }
      if (MetalScrollBarUI.thumbColor != null) {
        g.setColor(MetalScrollBarUI.thumbColor);
        g.fillRect(0, 0, (thumbBounds.width_ - 2) | 0, (thumbBounds.height_ - 1) | 0);
      }
      g.setColor(MetalScrollBarUI.thumbShadow);
      SwingUtilities2.drawRect(g, 0, 0, (thumbBounds.width_ - 2) | 0, (thumbBounds.height_ - 1) | 0);
      g.setColor(MetalScrollBarUI.thumbHighlightColor);
      SwingUtilities2.drawHLine(g, 1, (thumbBounds.width_ - 3) | 0, 1);
      SwingUtilities2.drawVLine(g, 1, 1, (thumbBounds.height_ - 2) | 0);
      MetalUtils.drawGradient(c, g, 'ScrollBar.gradient', 2, 2, (thumbBounds.width_ - 4) | 0, (thumbBounds.height_ - 3) | 0, false);
      let gripSize = (thumbBounds.width_ - 8) | 0;
      if (gripSize > 2 && thumbBounds.height_ >= 10) {
        g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
        let gripY = ($J.idiv(thumbBounds.height_, 2) - 2) | 0;
        for (let counter = 0; counter < 6; counter = (counter + 2) | 0) {
          g.fillRect(4, (counter + gripY) | 0, gripSize, 1);
        }
        g.setColor(MetalLookAndFeel.getWhite());
        gripY++;
        for (let counter = 0; counter < 6; counter = (counter + 2) | 0) {
          g.fillRect(5, (counter + gripY) | 0, gripSize, 1);
        }
      }
      if (!this.isFreeStanding) {
        thumbBounds.width_ = (thumbBounds.width_ - 2) | 0;
        if (!leftToRight) {
          g.translate$int$int(1, 0);
        }
      }
    } else {
      if (!this.isFreeStanding) {
        thumbBounds.height_ = (thumbBounds.height_ + 2) | 0;
      }
      if (MetalScrollBarUI.thumbColor != null) {
        g.setColor(MetalScrollBarUI.thumbColor);
        g.fillRect(0, 0, (thumbBounds.width_ - 1) | 0, (thumbBounds.height_ - 2) | 0);
      }
      g.setColor(MetalScrollBarUI.thumbShadow);
      SwingUtilities2.drawRect(g, 0, 0, (thumbBounds.width_ - 1) | 0, (thumbBounds.height_ - 2) | 0);
      g.setColor(MetalScrollBarUI.thumbHighlightColor);
      SwingUtilities2.drawHLine(g, 1, (thumbBounds.width_ - 2) | 0, 1);
      SwingUtilities2.drawVLine(g, 1, 1, (thumbBounds.height_ - 3) | 0);
      MetalUtils.drawGradient(c, g, 'ScrollBar.gradient', 2, 2, (thumbBounds.width_ - 3) | 0, (thumbBounds.height_ - 4) | 0, true);
      let gripSize = (thumbBounds.height_ - 8) | 0;
      if (gripSize > 2 && thumbBounds.width_ >= 10) {
        g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
        let gripX = ($J.idiv(thumbBounds.width_, 2) - 2) | 0;
        for (let counter = 0; counter < 6; counter = (counter + 2) | 0) {
          g.fillRect((gripX + counter) | 0, 4, 1, gripSize);
        }
        g.setColor(MetalLookAndFeel.getWhite());
        gripX++;
        for (let counter = 0; counter < 6; counter = (counter + 2) | 0) {
          g.fillRect((gripX + counter) | 0, 5, 1, gripSize);
        }
      }
      if (!this.isFreeStanding) {
        thumbBounds.height_ = (thumbBounds.height_ - 2) | 0;
      }
    }
    g.translate$int$int(-thumbBounds.x_, -thumbBounds.y_);
  }
  getMinimumThumbSize(): Dimension {
    return new Dimension()._Dimension$int$int(this.scrollBarWidth$MetalScrollBarUI, this.scrollBarWidth$MetalScrollBarUI);
  }
  /**
   * This is overridden only to increase the invalid area.  This
   * ensures that the "Shadow" below the thumb is invalidated
   */
  setThumbBounds(x: number, y: number, width: number, height: number): void {
    if ((this.thumbRect.x_ === x) && (this.thumbRect.y_ === y) && (this.thumbRect.width_ === width) && (this.thumbRect.height_ === height)) {
      return;
    }
    let minX = Math.min(x, this.thumbRect.x_);
    let minY = Math.min(y, this.thumbRect.y_);
    let maxX = Math.max((x + width) | 0, (this.thumbRect.x_ + this.thumbRect.width_) | 0);
    let maxY = Math.max((y + height) | 0, (this.thumbRect.y_ + this.thumbRect.height_) | 0);
    this.thumbRect.setBounds$int$int$int$int(x, y, width, height);
    this.scrollbar.repaint$int$int$int$int(minX, minY, (maxX - minX + 1) | 0, (maxY - minY + 1) | 0);
  }
}

export class MetalScrollBarUI$ScrollBarListener extends BasicScrollBarUI$PropertyChangeHandler {
  _MetalScrollBarUI$ScrollBarListener(): this {
    this._BasicScrollBarUI$PropertyChangeHandler();
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    if ($J.equals(name, MetalScrollBarUI.FREE_STANDING_PROP)) {
      this.handlePropertyChange(e.getNewValue());
    } else {
      super.propertyChange(e);
    }
  }
  handlePropertyChange(newValue: any): void {
    if (newValue != null) {
      let temp = (newValue);
      let becameFlush = temp === false && this.$outer.isFreeStanding === true;
      let becameNormal = temp === true && this.$outer.isFreeStanding === false;
      this.$outer.isFreeStanding = temp;
      if (becameFlush) {
        this.toFlush();
      } else if (becameNormal) {
        this.toFreeStanding();
      }
    } else {
      if (!this.$outer.isFreeStanding) {
        this.$outer.isFreeStanding = true;
        this.toFreeStanding();
      }
    }
    if (this.$outer.increaseButton != null) {
      this.$outer.increaseButton.setFreeStanding(this.$outer.isFreeStanding);
    }
    if (this.$outer.decreaseButton != null) {
      this.$outer.decreaseButton.setFreeStanding(this.$outer.isFreeStanding);
    }
  }
  toFlush(): void {
    this.$outer.scrollBarWidth$MetalScrollBarUI = (this.$outer.scrollBarWidth$MetalScrollBarUI - 2) | 0;
  }
  toFreeStanding(): void {
    this.$outer.scrollBarWidth$MetalScrollBarUI = (this.$outer.scrollBarWidth$MetalScrollBarUI + 2) | 0;
  }
}

$J.define(MetalScrollBarUI, 'javax.swing.plaf.metal.MetalScrollBarUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicScrollBarUI', ctors: { '': '_MetalScrollBarUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(MetalScrollBarUI$ScrollBarListener, 'javax.swing.plaf.metal.MetalScrollBarUI$ScrollBarListener', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicScrollBarUI$PropertyChangeHandler', ctors: { '': '_MetalScrollBarUI$ScrollBarListener' }, inner: true });
$J.module(() => {
  Adjustable = $J.load('java.awt.Adjustable');
  Dimension = $J.load('java.awt.Dimension');
  UIManager = $J.load('javax.swing.UIManager');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalScrollButton = $J.load('javax.swing.plaf.metal.MetalScrollButton');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
