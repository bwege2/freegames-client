// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalSliderUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { BasicSliderUI } from '../basic/BasicSliderUI.ts';
import { BasicSliderUI$PropertyChangeHandler } from '../basic/BasicSliderUI.ts';

let Dimension, Rectangle, SwingConstants, UIManager, MetalLookAndFeel, MetalUtils;

/**
 * A Java L&amp;F implementation of SliderUI.
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
 */
export class MetalSliderUI extends BasicSliderUI {
  /**
   * The buffer of a tick.
   */
  TICK_BUFFER: number = 0;
  /**
   * The value of the property {@code JSlider.isFilled}.
   * By default, {@code false} if the property is not set,
   * {@code true} for Ocean theme.
   */
  filledSlider: boolean = false;
  /**
   * The color of a thumb
   */
  static thumbColor: Color = null;
  /**
   * The color of highlighting.
   */
  static highlightColor: Color = null;
  /**
   * The color of dark shadow.
   */
  static darkShadowColor: Color = null;
  /**
   * The width of a track.
   */
  static trackWidth: number = 0;
  /**
   * The length of a tick.
   */
  static tickLength: number = 0;
  safeLength: number = 0;
  /**
   * A default horizontal thumb <code>Icon</code>. This field might not be
   * used. To change the <code>Icon</code> used by this delegate directly set it
   * using the <code>Slider.horizontalThumbIcon</code> UIManager property.
   */
  static horizThumbIcon: Icon = null;
  /**
   * A default vertical thumb <code>Icon</code>. This field might not be
   * used. To change the <code>Icon</code> used by this delegate directly set it
   * using the <code>Slider.verticalThumbIcon</code> UIManager property.
   */
  static vertThumbIcon: Icon = null;
  static SAFE_HORIZ_THUMB_ICON: Icon = null;
  static SAFE_VERT_THUMB_ICON: Icon = null;
  /**
   * Property for {@code JSlider.isFilled}.
   */
  SLIDER_FILL: string = null;
  /**
   * Constructs a {@code MetalSliderUI} instance.
   */
  _MetalSliderUI(): this {
    this._BasicSliderUI$JSlider(null);
    this.TICK_BUFFER = 4;
    this.filledSlider = false;
    this.SLIDER_FILL = 'JSlider.isFilled';
    return this;
  }
  /**
   * Constructs a {@code MetalSliderUI} instance.
   *
   * @param c a component
   * @return a {@code MetalSliderUI} instance
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalSliderUI()._MetalSliderUI();
  }
  static getHorizThumbIcon(): Icon {
    if ($J.system_getSecurityManager() != null) {
      return MetalSliderUI.SAFE_HORIZ_THUMB_ICON;
    } else {
      return MetalSliderUI.horizThumbIcon;
    }
  }
  static getVertThumbIcon(): Icon {
    if ($J.system_getSecurityManager() != null) {
      return MetalSliderUI.SAFE_VERT_THUMB_ICON;
    } else {
      return MetalSliderUI.vertThumbIcon;
    }
  }
  installUI(c: JComponent): void {
    MetalSliderUI.trackWidth = (+(UIManager.get$Object('Slider.trackWidth')));
    MetalSliderUI.tickLength = this.safeLength = (+(UIManager.get$Object('Slider.majorTickLength')));
    MetalSliderUI.horizThumbIcon = MetalSliderUI.SAFE_HORIZ_THUMB_ICON = UIManager.getIcon$Object('Slider.horizontalThumbIcon');
    MetalSliderUI.vertThumbIcon = MetalSliderUI.SAFE_VERT_THUMB_ICON = UIManager.getIcon$Object('Slider.verticalThumbIcon');
    super.installUI(c);
    MetalSliderUI.thumbColor = UIManager.getColor$Object('Slider.thumb');
    MetalSliderUI.highlightColor = UIManager.getColor$Object('Slider.highlight');
    MetalSliderUI.darkShadowColor = UIManager.getColor$Object('Slider.darkShadow');
    this.scrollListener.setScrollByBlock(false);
    this.prepareFilledSliderField();
  }
  /**
   * Constructs {@code MetalPropertyListener}.
   *
   * @param slider a {@code JSlider}
   * @return the {@code MetalPropertyListener}
   */
  createPropertyChangeListener(slider: JSlider): PropertyChangeListener {
    return $J.fn(new MetalSliderUI$MetalPropertyListener().$o(this)._MetalSliderUI$MetalPropertyListener(), 'propertyChange');
  }
  prepareFilledSliderField(): void {
    this.filledSlider = MetalLookAndFeel.usingOcean();
    let sliderFillProp = this.slider.getClientProperty(this.SLIDER_FILL);
    if (sliderFillProp != null) {
      this.filledSlider = (sliderFillProp);
    }
  }
  paintThumb(g: Graphics): void {
    let knobBounds = this.thumbRect;
    g.translate$int$int(knobBounds.x_, knobBounds.y_);
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      MetalSliderUI.getHorizThumbIcon().paintIcon(this.slider, g, 0, 0);
    } else {
      MetalSliderUI.getVertThumbIcon().paintIcon(this.slider, g, 0, 0);
    }
    g.translate$int$int(-knobBounds.x_, -knobBounds.y_);
  }
  /**
   * Returns a rectangle enclosing the track that will be painted.
   */
  getPaintTrackRect(): Rectangle {
    let trackLeft = 0;
    let trackRight: number;
    let trackTop = 0;
    let trackBottom: number;
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      trackBottom = (this.trackRect.height_ - 1 - this.getThumbOverhang()) | 0;
      trackTop = (trackBottom - (this.getTrackWidth() - 1)) | 0;
      trackRight = (this.trackRect.width_ - 1) | 0;
    } else {
      if (MetalUtils.isLeftToRight(this.slider)) {
        trackLeft = (this.trackRect.width_ - this.getThumbOverhang() - this.getTrackWidth()) | 0;
        trackRight = (this.trackRect.width_ - this.getThumbOverhang() - 1) | 0;
      } else {
        trackLeft = this.getThumbOverhang();
        trackRight = (this.getThumbOverhang() + this.getTrackWidth() - 1) | 0;
      }
      trackBottom = (this.trackRect.height_ - 1) | 0;
    }
    return new Rectangle()._Rectangle$int$int$int$int((this.trackRect.x_ + trackLeft) | 0, (this.trackRect.y_ + trackTop) | 0, (trackRight - trackLeft) | 0, (trackBottom - trackTop) | 0);
  }
  paintTrack(g: Graphics): void {
    if (MetalLookAndFeel.usingOcean()) {
      this.oceanPaintTrack(g);
      return;
    }
    let trackColor = !this.slider.isEnabled() ? MetalLookAndFeel.getControlShadow() : this.slider.getForeground();
    let leftToRight = MetalUtils.isLeftToRight(this.slider);
    g.translate$int$int(this.trackRect.x_, this.trackRect.y_);
    let trackLeft = 0;
    let trackTop = 0;
    let trackRight: number;
    let trackBottom: number;
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      trackBottom = (this.trackRect.height_ - 1 - this.getThumbOverhang()) | 0;
      trackTop = (trackBottom - (this.getTrackWidth() - 1)) | 0;
      trackRight = (this.trackRect.width_ - 1) | 0;
    } else {
      if (leftToRight) {
        trackLeft = (this.trackRect.width_ - this.getThumbOverhang() - this.getTrackWidth()) | 0;
        trackRight = (this.trackRect.width_ - this.getThumbOverhang() - 1) | 0;
      } else {
        trackLeft = this.getThumbOverhang();
        trackRight = (this.getThumbOverhang() + this.getTrackWidth() - 1) | 0;
      }
      trackBottom = (this.trackRect.height_ - 1) | 0;
    }
    if (this.slider.isEnabled()) {
      g.setColor(MetalLookAndFeel.getControlDarkShadow());
      g.drawRect(trackLeft, trackTop, (trackRight - trackLeft - 1) | 0, (trackBottom - trackTop - 1) | 0);
      g.setColor(MetalLookAndFeel.getControlHighlight());
      g.drawLine((trackLeft + 1) | 0, trackBottom, trackRight, trackBottom);
      g.drawLine(trackRight, (trackTop + 1) | 0, trackRight, trackBottom);
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.drawLine((trackLeft + 1) | 0, (trackTop + 1) | 0, (trackRight - 2) | 0, (trackTop + 1) | 0);
      g.drawLine((trackLeft + 1) | 0, (trackTop + 1) | 0, (trackLeft + 1) | 0, (trackBottom - 2) | 0);
    } else {
      g.setColor(MetalLookAndFeel.getControlShadow());
      g.drawRect(trackLeft, trackTop, (trackRight - trackLeft - 1) | 0, (trackBottom - trackTop - 1) | 0);
    }
    if (this.filledSlider) {
      let middleOfThumb: number;
      let fillTop: number;
      let fillLeft: number;
      let fillBottom: number;
      let fillRight: number;
      if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
        middleOfThumb = (this.thumbRect.x_ + ($J.idiv(this.thumbRect.width_, 2))) | 0;
        middleOfThumb = (middleOfThumb - this.trackRect.x_) | 0;
        fillTop = !this.slider.isEnabled() ? trackTop : (trackTop + 1) | 0;
        fillBottom = !this.slider.isEnabled() ? (trackBottom - 1) | 0 : (trackBottom - 2) | 0;
        if (!this.drawInverted()) {
          fillLeft = !this.slider.isEnabled() ? trackLeft : (trackLeft + 1) | 0;
          fillRight = middleOfThumb;
        } else {
          fillLeft = middleOfThumb;
          fillRight = !this.slider.isEnabled() ? (trackRight - 1) | 0 : (trackRight - 2) | 0;
        }
      } else {
        middleOfThumb = (this.thumbRect.y_ + ($J.idiv(this.thumbRect.height_, 2))) | 0;
        middleOfThumb = (middleOfThumb - this.trackRect.y_) | 0;
        fillLeft = !this.slider.isEnabled() ? trackLeft : (trackLeft + 1) | 0;
        fillRight = !this.slider.isEnabled() ? (trackRight - 1) | 0 : (trackRight - 2) | 0;
        if (!this.drawInverted()) {
          fillTop = middleOfThumb;
          fillBottom = !this.slider.isEnabled() ? (trackBottom - 1) | 0 : (trackBottom - 2) | 0;
        } else {
          fillTop = !this.slider.isEnabled() ? trackTop : (trackTop + 1) | 0;
          fillBottom = middleOfThumb;
        }
      }
      if (this.slider.isEnabled()) {
        g.setColor(this.slider.getBackground());
        g.drawLine(fillLeft, fillTop, fillRight, fillTop);
        g.drawLine(fillLeft, fillTop, fillLeft, fillBottom);
        g.setColor(MetalLookAndFeel.getControlShadow());
        g.fillRect((fillLeft + 1) | 0, (fillTop + 1) | 0, (fillRight - fillLeft) | 0, (fillBottom - fillTop) | 0);
      } else {
        g.setColor(MetalLookAndFeel.getControlShadow());
        g.fillRect(fillLeft, fillTop, (fillRight - fillLeft) | 0, (fillBottom - fillTop) | 0);
      }
    }
    g.translate$int$int(-this.trackRect.x_, -this.trackRect.y_);
  }
  oceanPaintTrack(g: Graphics): void {
    let leftToRight = MetalUtils.isLeftToRight(this.slider);
    let drawInverted = this.drawInverted();
    let sliderAltTrackColor = UIManager.get$Object('Slider.altTrackColor');
    let paintRect = this.getPaintTrackRect();
    g.translate$int$int(paintRect.x_, paintRect.y_);
    let w = paintRect.width_;
    let h = paintRect.height_;
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      let middleOfThumb = (this.thumbRect.x_ + $J.idiv(this.thumbRect.width_, 2) - paintRect.x_) | 0;
      if (this.slider.isEnabled()) {
        let fillMinX: number;
        let fillMaxX: number;
        if (middleOfThumb > 0) {
          g.setColor(drawInverted ? MetalLookAndFeel.getControlDarkShadow() : MetalLookAndFeel.getPrimaryControlDarkShadow());
          g.drawRect(0, 0, (middleOfThumb - 1) | 0, (h - 1) | 0);
        }
        if (middleOfThumb < w) {
          g.setColor(drawInverted ? MetalLookAndFeel.getPrimaryControlDarkShadow() : MetalLookAndFeel.getControlDarkShadow());
          g.drawRect(middleOfThumb, 0, (w - middleOfThumb - 1) | 0, (h - 1) | 0);
        }
        if (this.filledSlider) {
          g.setColor(MetalLookAndFeel.getPrimaryControlShadow());
          if (drawInverted) {
            fillMinX = middleOfThumb;
            fillMaxX = (w - 2) | 0;
            g.drawLine(1, 1, middleOfThumb, 1);
          } else {
            fillMinX = 1;
            fillMaxX = middleOfThumb;
            g.drawLine(middleOfThumb, 1, (w - 1) | 0, 1);
          }
          if (h === 6) {
            g.setColor(MetalLookAndFeel.getWhite());
            g.drawLine(fillMinX, 1, fillMaxX, 1);
            g.setColor(sliderAltTrackColor);
            g.drawLine(fillMinX, 2, fillMaxX, 2);
            g.setColor(MetalLookAndFeel.getControlShadow());
            g.drawLine(fillMinX, 3, fillMaxX, 3);
            g.setColor(MetalLookAndFeel.getPrimaryControlShadow());
            g.drawLine(fillMinX, 4, fillMaxX, 4);
          }
        }
      } else {
        g.setColor(MetalLookAndFeel.getControlShadow());
        if (middleOfThumb > 0) {
          if (!drawInverted && this.filledSlider) {
            g.fillRect(0, 0, (middleOfThumb - 1) | 0, (h - 1) | 0);
          } else {
            g.drawRect(0, 0, (middleOfThumb - 1) | 0, (h - 1) | 0);
          }
        }
        if (middleOfThumb < w) {
          if (drawInverted && this.filledSlider) {
            g.fillRect(middleOfThumb, 0, (w - middleOfThumb - 1) | 0, (h - 1) | 0);
          } else {
            g.drawRect(middleOfThumb, 0, (w - middleOfThumb - 1) | 0, (h - 1) | 0);
          }
        }
      }
    } else {
      let middleOfThumb = (this.thumbRect.y_ + ($J.idiv(this.thumbRect.height_, 2)) - paintRect.y_) | 0;
      if (this.slider.isEnabled()) {
        let fillMinY: number;
        let fillMaxY: number;
        if (middleOfThumb > 0) {
          g.setColor(drawInverted ? MetalLookAndFeel.getPrimaryControlDarkShadow() : MetalLookAndFeel.getControlDarkShadow());
          g.drawRect(0, 0, (w - 1) | 0, (middleOfThumb - 1) | 0);
        }
        if (middleOfThumb < h) {
          g.setColor(drawInverted ? MetalLookAndFeel.getControlDarkShadow() : MetalLookAndFeel.getPrimaryControlDarkShadow());
          g.drawRect(0, middleOfThumb, (w - 1) | 0, (h - middleOfThumb - 1) | 0);
        }
        if (this.filledSlider) {
          g.setColor(MetalLookAndFeel.getPrimaryControlShadow());
          if (this.drawInverted()) {
            fillMinY = 1;
            fillMaxY = middleOfThumb;
            if (leftToRight) {
              g.drawLine(1, middleOfThumb, 1, (h - 1) | 0);
            } else {
              g.drawLine((w - 2) | 0, middleOfThumb, (w - 2) | 0, (h - 1) | 0);
            }
          } else {
            fillMinY = middleOfThumb;
            fillMaxY = (h - 2) | 0;
            if (leftToRight) {
              g.drawLine(1, 1, 1, middleOfThumb);
            } else {
              g.drawLine((w - 2) | 0, 1, (w - 2) | 0, middleOfThumb);
            }
          }
          if (w === 6) {
            g.setColor(leftToRight ? MetalLookAndFeel.getWhite() : MetalLookAndFeel.getPrimaryControlShadow());
            g.drawLine(1, fillMinY, 1, fillMaxY);
            g.setColor(leftToRight ? sliderAltTrackColor : MetalLookAndFeel.getControlShadow());
            g.drawLine(2, fillMinY, 2, fillMaxY);
            g.setColor(leftToRight ? MetalLookAndFeel.getControlShadow() : sliderAltTrackColor);
            g.drawLine(3, fillMinY, 3, fillMaxY);
            g.setColor(leftToRight ? MetalLookAndFeel.getPrimaryControlShadow() : MetalLookAndFeel.getWhite());
            g.drawLine(4, fillMinY, 4, fillMaxY);
          }
        }
      } else {
        g.setColor(MetalLookAndFeel.getControlShadow());
        if (middleOfThumb > 0) {
          if (drawInverted && this.filledSlider) {
            g.fillRect(0, 0, (w - 1) | 0, (middleOfThumb - 1) | 0);
          } else {
            g.drawRect(0, 0, (w - 1) | 0, (middleOfThumb - 1) | 0);
          }
        }
        if (middleOfThumb < h) {
          if (!drawInverted && this.filledSlider) {
            g.fillRect(0, middleOfThumb, (w - 1) | 0, (h - middleOfThumb - 1) | 0);
          } else {
            g.drawRect(0, middleOfThumb, (w - 1) | 0, (h - middleOfThumb - 1) | 0);
          }
        }
      }
    }
    g.translate$int$int(-paintRect.x_, -paintRect.y_);
  }
  paintFocus(g: Graphics): void {
  }
  getThumbSize(): Dimension {
    let size = new Dimension()._Dimension$();
    if (this.slider.getOrientation() === SwingConstants.VERTICAL) {
      size.width_ = MetalSliderUI.getVertThumbIcon().getIconWidth();
      size.height_ = MetalSliderUI.getVertThumbIcon().getIconHeight();
    } else {
      size.width_ = MetalSliderUI.getHorizThumbIcon().getIconWidth();
      size.height_ = MetalSliderUI.getHorizThumbIcon().getIconHeight();
    }
    return size;
  }
  /**
   * Gets the height of the tick area for horizontal sliders and the width of the
   * tick area for vertical sliders.  BasicSliderUI uses the returned value to
   * determine the tick area rectangle.
   */
  getTickLength(): number {
    return this.slider.getOrientation() === SwingConstants.HORIZONTAL ? (this.safeLength + this.TICK_BUFFER + 1) | 0 : (this.safeLength + this.TICK_BUFFER + 3) | 0;
  }
  /**
   * Returns the shorter dimension of the track.
   *
   * @return the shorter dimension of the track
   */
  getTrackWidth(): number {
    let kIdealTrackWidth = 7;
    let kIdealThumbHeight = 16;
    let kWidthScalar = kIdealTrackWidth / kIdealThumbHeight;
    if (this.slider.getOrientation() === SwingConstants.HORIZONTAL) {
      return $J.d2i((kWidthScalar * this.thumbRect.height_));
    } else {
      return $J.d2i((kWidthScalar * this.thumbRect.width_));
    }
  }
  /**
   * Returns the amount that the thumb goes past the slide bar.
   *
   * @return the amount that the thumb goes past the slide bar
   */
  getThumbOverhang(): number {
    return $J.idiv($J.d2i((this.getThumbSize().getHeight() - this.getTrackWidth())), 2);
  }
  scrollDueToClickInTrack(dir: number): void {
    this.scrollByUnit(dir);
  }
  paintMinorTickForHorizSlider(g: Graphics, tickBounds: Rectangle, x: number): void {
    g.setColor(this.slider.isEnabled() ? this.slider.getForeground() : MetalLookAndFeel.getControlShadow());
    g.drawLine(x, this.TICK_BUFFER, x, (this.TICK_BUFFER + ($J.idiv(this.safeLength, 2))) | 0);
  }
  paintMajorTickForHorizSlider(g: Graphics, tickBounds: Rectangle, x: number): void {
    g.setColor(this.slider.isEnabled() ? this.slider.getForeground() : MetalLookAndFeel.getControlShadow());
    g.drawLine(x, this.TICK_BUFFER, x, (this.TICK_BUFFER + (this.safeLength - 1)) | 0);
  }
  paintMinorTickForVertSlider(g: Graphics, tickBounds: Rectangle, y: number): void {
    g.setColor(this.slider.isEnabled() ? this.slider.getForeground() : MetalLookAndFeel.getControlShadow());
    if (MetalUtils.isLeftToRight(this.slider)) {
      g.drawLine(this.TICK_BUFFER, y, (this.TICK_BUFFER + ($J.idiv(this.safeLength, 2))) | 0, y);
    } else {
      g.drawLine(0, y, $J.idiv(this.safeLength, 2), y);
    }
  }
  paintMajorTickForVertSlider(g: Graphics, tickBounds: Rectangle, y: number): void {
    g.setColor(this.slider.isEnabled() ? this.slider.getForeground() : MetalLookAndFeel.getControlShadow());
    if (MetalUtils.isLeftToRight(this.slider)) {
      g.drawLine(this.TICK_BUFFER, y, (this.TICK_BUFFER + this.safeLength) | 0, y);
    } else {
      g.drawLine(0, y, this.safeLength, y);
    }
  }
}

/**
 * {@code PropertyListener} for {@code JSlider.isFilled}.
 */
export class MetalSliderUI$MetalPropertyListener extends BasicSliderUI$PropertyChangeHandler {
  /**
   * Constructs a {@code MetalPropertyListener}.
   */
  _MetalSliderUI$MetalPropertyListener(): this {
    this._BasicSliderUI$PropertyChangeHandler();
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    super.propertyChange(e);
    if ($J.equals(e.getPropertyName(), this.$outer.SLIDER_FILL)) {
      this.$outer.prepareFilledSliderField();
    }
  }
}

$J.define(MetalSliderUI, 'javax.swing.plaf.metal.MetalSliderUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicSliderUI', ctors: { '': '_MetalSliderUI' } });
$J.define(MetalSliderUI$MetalPropertyListener, 'javax.swing.plaf.metal.MetalSliderUI$MetalPropertyListener', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicSliderUI$PropertyChangeHandler', ctors: { '': '_MetalSliderUI$MetalPropertyListener' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Rectangle = $J.load('java.awt.Rectangle');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
