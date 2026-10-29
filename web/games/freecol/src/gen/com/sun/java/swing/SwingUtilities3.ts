// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/com/sun/java/swing/SwingUtilities3.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2002, 2025, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, Collections, JObject, JString, Region, StringBuilder, SunToolkit, WeakHashMap } from '../../../../../jre/index.ts';

let Graphics2D, AffineTransform, JComponent, JMenu, SwingUtilities2;

/**
 * A collection of utility methods for Swing.
 * <p>
 * <b>WARNING:</b> While this class is public, it should not be treated as
 * public API and its API may change in incompatible ways between dot dot
 * releases and even patch releases. You should not rely on this class even
 * existing.
 *
 * This is a second part of sun.swing.SwingUtilities2. It is required
 * to provide services for JavaFX applets.
 */
export class SwingUtilities3 extends JObject {
  /**
   * The {@code clientProperty} key for delegate {@code RepaintManager}
   */
  static DELEGATE_REPAINT_MANAGER_KEY: any = null;
  static vsyncedMap: JMap<Container, boolean> = null;
  _SwingUtilities3(): this {
    return this;
  }
  /**
   * Registers delegate RepaintManager for {@code JComponent}.
   */
  static setDelegateRepaintManager(component: JComponent, repaintManager: RepaintManager): void {
    AppContext.getAppContext().put(SwingUtilities3.DELEGATE_REPAINT_MANAGER_KEY, true);
    component.putClientProperty(SwingUtilities3.DELEGATE_REPAINT_MANAGER_KEY, repaintManager);
  }
  /**
   * Sets vsyncRequested state for the {@code rootContainer}.  If
   * {@code isRequested} is {@code true} then vsynced
   * {@code BufferStrategy} is enabled for this {@code rootContainer}.
   *
   * Note: requesting vsynced painting does not guarantee one. The outcome
   * depends on current RepaintManager's RepaintManager.PaintManager
   * and on the capabilities of the graphics hardware/software and what not.
   *
   * @param rootContainer topmost container. Should be either {@code Window}
   *  or {@code Applet}
   * @param isRequested the value to set vsyncRequested state to
   */
  static setVsyncRequested(rootContainer: Container, isRequested: boolean): void {
    // assert (rootContainer instanceof Applet) || (rootContainer instanceof Window)
    if (isRequested) {
      SwingUtilities3.vsyncedMap.put(rootContainer, true);
    } else {
      SwingUtilities3.vsyncedMap.remove(rootContainer);
    }
  }
  /**
   * Checks if vsync painting is requested for {@code rootContainer}
   *
   * @param rootContainer topmost container. Should be either Window or Applet
   * @return {@code true} if vsync painting is requested for {@code rootContainer}
   */
  static isVsyncRequested(rootContainer: Container): boolean {
    // assert (rootContainer instanceof Applet) || (rootContainer instanceof Window)
    return true === SwingUtilities3.vsyncedMap.get(rootContainer);
  }
  /**
   * Returns delegate {@code RepaintManager} for {@code component} hierarchy.
   */
  static getDelegateRepaintManager(component: Component): RepaintManager {
    let delegate = null;
    if (true === SunToolkit.targetToAppContext(component).get(SwingUtilities3.DELEGATE_REPAINT_MANAGER_KEY)) {
      while (delegate == null && component != null) {
        while (component != null && !(component instanceof JComponent)) {
          component = component.getParent();
        }
        if (component != null) {
          delegate = (component).getClientProperty(SwingUtilities3.DELEGATE_REPAINT_MANAGER_KEY);
          component = component.getParent();
        }
      }
    }
    return delegate;
  }
  static applyInsets$Rectangle$Insets(rect: Rectangle, insets: Insets): void {
    SwingUtilities3.applyInsets$Rectangle$Insets$boolean(rect, insets, true);
  }
  static applyInsets$Rectangle$Insets$boolean(rect: Rectangle, insets: Insets, leftToRight: boolean): void {
    if (insets != null) {
      rect.x_ = (rect.x_ + (leftToRight ? insets.left : insets.right)) | 0;
      rect.y_ = (rect.y_ + insets.top) | 0;
      rect.width_ = (rect.width_ - (insets.left + insets.right)) | 0;
      rect.height_ = (rect.height_ - (insets.top + insets.bottom)) | 0;
    }
  }
  static paintCheckIcon(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, holdc: Color, foreground: Color): void {
    if (lh.getCheckIcon() != null) {
      let model = lh.getMenuItem().getModel();
      if (model.isArmed() || (lh.getMenuItem() instanceof JMenu && model.isSelected())) {
        g.setColor(foreground);
      } else {
        g.setColor(holdc);
      }
      if (lh.useCheckAndArrow()) {
        lh.getCheckIcon().paintIcon(lh.getMenuItem(), g, lr.getCheckRect().x_, lr.getCheckRect().y_);
      }
      g.setColor(holdc);
    }
  }
  static paintIcon(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, holdc: Color): void {
    if (lh.getIcon$() != null) {
      let icon: Icon;
      let model = lh.getMenuItem().getModel();
      if (!model.isEnabled()) {
        icon = lh.getMenuItem().getDisabledIcon();
      } else if (model.isPressed() && model.isArmed()) {
        icon = lh.getMenuItem().getPressedIcon();
        if (icon == null) {
          icon = lh.getMenuItem().getIcon();
        }
      } else {
        icon = lh.getMenuItem().getIcon();
      }
      if (icon != null) {
        icon.paintIcon(lh.getMenuItem(), g, lr.getIconRect().x_, lr.getIconRect().y_);
        g.setColor(holdc);
      }
    }
  }
  static paintAccText(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, disabledForeground: Color, acceleratorSelectionForeground: Color, acceleratorForeground: Color): void {
    if (!(lh.getAccText$().length === 0)) {
      let model = lh.getMenuItem().getModel();
      g.setFont(lh.getAccFontMetrics().getFont());
      if (!model.isEnabled()) {
        if (disabledForeground != null) {
          g.setColor(disabledForeground);
          SwingUtilities2.drawString$JComponent$Graphics$String$int$int(lh.getMenuItem(), g, lh.getAccText$(), lr.getAccRect().x_, (lr.getAccRect().y_ + lh.getAccFontMetrics().getAscent()) | 0);
        } else {
          g.setColor(lh.getMenuItem().getBackground().brighter());
          SwingUtilities2.drawString$JComponent$Graphics$String$int$int(lh.getMenuItem(), g, lh.getAccText$(), lr.getAccRect().x_, (lr.getAccRect().y_ + lh.getAccFontMetrics().getAscent()) | 0);
          g.setColor(lh.getMenuItem().getBackground().darker());
          SwingUtilities2.drawString$JComponent$Graphics$String$int$int(lh.getMenuItem(), g, lh.getAccText$(), (lr.getAccRect().x_ - 1) | 0, (lr.getAccRect().y_ + lh.getFontMetrics().getAscent() - 1) | 0);
        }
      } else {
        if (model.isArmed() || (lh.getMenuItem() instanceof JMenu && model.isSelected())) {
          g.setColor(acceleratorSelectionForeground);
        } else {
          g.setColor(acceleratorForeground);
        }
        SwingUtilities2.drawString$JComponent$Graphics$String$int$int(lh.getMenuItem(), g, lh.getAccText$(), lr.getAccRect().x_, (lr.getAccRect().y_ + lh.getAccFontMetrics().getAscent()) | 0);
      }
    }
  }
  static paintArrowIcon(g: Graphics, lh: MenuItemLayoutHelper, lr: MenuItemLayoutHelper$LayoutResult, foreground: Color): void {
    if (lh.getArrowIcon() != null) {
      let model = lh.getMenuItem().getModel();
      if (model.isArmed() || (lh.getMenuItem() instanceof JMenu && model.isSelected())) {
        g.setColor(foreground);
      }
      if (lh.useCheckAndArrow()) {
        lh.getArrowIcon().paintIcon(lh.getMenuItem(), g, lr.getArrowRect().x_, lr.getArrowRect().y_);
      }
    }
  }
  /**
   * Paints the border for a component ensuring its sides have consistent
   * thickness at different scales.
   * <p>
   * It performs the following steps:
   * <ol>
   *     <li>Reset the scale transform on the {@code Graphics},</li>
   *     <li>Call {@code painter} to paint the border,</li>
   *     <li>Restores the transform.</li>
   * </ol>
   *
   * @param c the component for which this border is being painted
   * @param g the paint graphics
   * @param x the x position of the painted border
   * @param y the y position of the painted border
   * @param w the width of the painted border
   * @param h the height of the painted border
   * @param painter the painter object which paints the border after
   *                the transform on the {@code Graphics} is reset
   */
  static paintBorder(c: Component, g: Graphics, x: number, y: number, w: number, h: number, painter: SwingUtilities3$UnscaledBorderPainter): void {
    let at = null;
    let oldStroke = null;
    let resetTransform = false;
    let scaleFactor = 1;
    let xtranslation = x;
    let ytranslation = y;
    let width = w;
    let height = h;
    if (g instanceof Graphics2D) {
      let g2d = g;
      at = g2d.getTransform();
      oldStroke = g2d.getStroke();
      scaleFactor = Math.min(at.getScaleX(), at.getScaleY());
      resetTransform = ((at.getShearX() === 0) && (at.getShearY() === 0)) && ((at.getScaleX() > 1) || (at.getScaleY() > 1));
      if (resetTransform) {
        g2d.setTransform(new AffineTransform()._AffineTransform$());
        let xx = at.getScaleX() * x + at.getTranslateX();
        let yy = at.getScaleY() * y + at.getTranslateY();
        xtranslation = Region.clipRound(xx);
        ytranslation = Region.clipRound(yy);
        width = (Region.clipRound(at.getScaleX() * w + xx) - xtranslation) | 0;
        height = (Region.clipRound(at.getScaleY() * h + yy) - ytranslation) | 0;
      }
    }
    g.translate$int$int(xtranslation, ytranslation);
    $J.fn(painter, 'paintUnscaledBorder')(c, g, width, height, scaleFactor);
    g.translate$int$int(-xtranslation, -ytranslation);
    if (g instanceof Graphics2D) {
      let g2d = g;
      g2d.setStroke(oldStroke);
      if (resetTransform) {
        g2d.setTransform(at);
      }
    }
  }
  static $clinit() {
    SwingUtilities3.DELEGATE_REPAINT_MANAGER_KEY = new StringBuilder('DelegateRepaintManagerKey');
    SwingUtilities3.vsyncedMap = Collections.synchronizedMap(new WeakHashMap());
  }
}

/**
 * A task which paints an <i>unscaled</i> border after {@code Graphics}
 * transforms are removed. It's used with the
 * {@link #paintBorder(Component, Graphics, int, int, int, int, UnscaledBorderPainter)
 * SwingUtilities3.paintBorder} which manages changing the transforms and calculating
 * the coordinates and size of the border.
 */
export class SwingUtilities3$UnscaledBorderPainter {
}

$J.define(SwingUtilities3, 'com.sun.java.swing.SwingUtilities3', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_SwingUtilities3' }, meths: { 'applyInsets(java.awt.Rectangle,java.awt.Insets,boolean)': 'applyInsets$Rectangle$Insets$boolean', 'applyInsets(java.awt.Rectangle,java.awt.Insets)': 'applyInsets$Rectangle$Insets' }, clinit: true, lazy: ['DELEGATE_REPAINT_MANAGER_KEY', 'vsyncedMap'] });
$J.define(SwingUtilities3$UnscaledBorderPainter, 'com.sun.java.swing.SwingUtilities3$UnscaledBorderPainter', { kind: 'interface' });
$J.module(() => {
  Graphics2D = $J.load('java.awt.Graphics2D');
  AffineTransform = $J.load('java.awt.geom.AffineTransform');
  JComponent = $J.load('javax.swing.JComponent');
  JMenu = $J.load('javax.swing.JMenu');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
