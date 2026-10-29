// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicToolTipUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2019, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { ToolTipUI } from '../ToolTipUI.ts';

let Dimension, Rectangle, LookAndFeel, UIManager, BasicHTML, View, SwingUtilities2;

/**
 * Standard tool tip L&amp;F.
 *
 * @author Dave Moore
 */
export class BasicToolTipUI extends ToolTipUI {
  static sharedInstance: BasicToolTipUI = null;
  /**
   * Global <code>PropertyChangeListener</code> that
   * <code>createPropertyChangeListener</code> returns.
   */
  static sharedPropertyChangedListener: PropertyChangeListener = null;
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * Constructs a new instance of {@code BasicToolTipUI}.
   */
  _BasicToolTipUI(): this {
    this._ToolTipUI();
    return this;
  }
  /**
   * Returns the instance of {@code BasicToolTipUI}.
   *
   * @param c a component
   * @return the instance of {@code BasicToolTipUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return BasicToolTipUI.sharedInstance;
  }
  installUI(c: JComponent): void {
    this.installDefaults(c);
    this.installComponents(c);
    this.installListeners(c);
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults(c);
    this.uninstallComponents(c);
    this.uninstallListeners(c);
  }
  /**
   * Installs default properties.
   *
   * @param c a component
   */
  installDefaults(c: JComponent): void {
    LookAndFeel.installColorsAndFont(c, 'ToolTip.background', 'ToolTip.foreground', 'ToolTip.font');
    LookAndFeel.installProperty(c, 'opaque', true);
    this.componentChanged(c);
  }
  /**
   * Uninstalls default properties.
   *
   * @param c a component
   */
  uninstallDefaults(c: JComponent): void {
    LookAndFeel.uninstallBorder(c);
  }
  installComponents(c: JComponent): void {
    BasicHTML.updateRenderer(c, (c).getTipText());
  }
  uninstallComponents(c: JComponent): void {
    BasicHTML.updateRenderer(c, '');
  }
  /**
   * Registers listeners.
   *
   * @param c a component
   */
  installListeners(c: JComponent): void {
    this.propertyChangeListener = this.createPropertyChangeListener(c);
    c.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
  }
  /**
   * Unregisters listeners.
   *
   * @param c a component
   */
  uninstallListeners(c: JComponent): void {
    c.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.propertyChangeListener = null;
  }
  createPropertyChangeListener(c: JComponent): PropertyChangeListener {
    if (BasicToolTipUI.sharedPropertyChangedListener == null) {
      BasicToolTipUI.sharedPropertyChangedListener = $J.fn(new BasicToolTipUI$PropertyChangeHandler()._BasicToolTipUI$PropertyChangeHandler(), 'propertyChange');
    }
    return BasicToolTipUI.sharedPropertyChangedListener;
  }
  paint(g: Graphics, c: JComponent): void {
    let font = c.getFont();
    let metrics = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(c, g, font);
    let size = c.getSize$();
    g.setColor(c.getForeground());
    let tipText = (c).getTipText();
    if (tipText == null) {
      tipText = '';
    }
    let insets = c.getInsets$();
    let paintTextR = new Rectangle()._Rectangle$int$int$int$int((insets.left + 3) | 0, insets.top, (size.width_ - (insets.left + insets.right) - 6) | 0, (size.height_ - (insets.top + insets.bottom)) | 0);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      v.paint(g, paintTextR);
    } else {
      g.setFont(font);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(c, g, tipText, paintTextR.x_, (paintTextR.y_ + metrics.getAscent()) | 0);
    }
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let font = c.getFont();
    let fm = c.getFontMetrics(font);
    let insets = c.getInsets$();
    let prefSize = new Dimension()._Dimension$int$int((insets.left + insets.right) | 0, (insets.top + insets.bottom) | 0);
    let text = (c).getTipText();
    if (text == null) {
      text = '';
    } else {
      let v = (c != null) ? c.getClientProperty('html') : null;
      if (v != null) {
        prefSize.width_ = (prefSize.width_ + ($J.d2i(v.getPreferredSpan(View.X_AXIS)) + 6)) | 0;
        prefSize.height_ = (prefSize.height_ + $J.d2i(v.getPreferredSpan(View.Y_AXIS))) | 0;
      } else {
        prefSize.width_ = (prefSize.width_ + (SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, text) + 6)) | 0;
        prefSize.height_ = (prefSize.height_ + fm.getHeight()) | 0;
      }
    }
    return prefSize;
  }
  getMinimumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d.width_ = $J.d2i(Math.fround(d.width_ - Math.fround(v.getPreferredSpan(View.X_AXIS) - v.getMinimumSpan(View.X_AXIS))));
    }
    return d;
  }
  getMaximumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d.width_ = $J.d2i(Math.fround(d.width_ + Math.fround(v.getMaximumSpan(View.X_AXIS) - v.getPreferredSpan(View.X_AXIS))));
    }
    return d;
  }
  /**
   * Invoked when the <code>JCompoment</code> associated with the
   * <code>JToolTip</code> has changed, or at initialization time. This
   * should update any state dependent upon the <code>JComponent</code>.
   *
   * @param c the JToolTip the JComponent has changed on.
   */
  componentChanged(c: JComponent): void {
    let comp = (c).getComponent$();
    if (comp != null && !(comp.isEnabled())) {
      if (UIManager.getBorder$Object('ToolTip.borderInactive') != null) {
        LookAndFeel.installBorder(c, 'ToolTip.borderInactive');
      } else {
        LookAndFeel.installBorder(c, 'ToolTip.border');
      }
      if (UIManager.getColor$Object('ToolTip.backgroundInactive') != null) {
        LookAndFeel.installColors(c, 'ToolTip.backgroundInactive', 'ToolTip.foregroundInactive');
      } else {
        LookAndFeel.installColors(c, 'ToolTip.background', 'ToolTip.foreground');
      }
    } else {
      LookAndFeel.installBorder(c, 'ToolTip.border');
      LookAndFeel.installColors(c, 'ToolTip.background', 'ToolTip.foreground');
    }
  }
  static $clinit() {
    BasicToolTipUI.sharedInstance = new BasicToolTipUI()._BasicToolTipUI();
  }
}

export class BasicToolTipUI$PropertyChangeHandler extends JObject {
  _BasicToolTipUI$PropertyChangeHandler(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    if ($J.equals(name, 'tiptext') || $J.equals('foreground', name) || $J.equals('font', name) || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
      let tip = (e.getSource());
      let text = tip.getTipText();
      BasicHTML.updateRenderer(tip, text);
    } else if ($J.equals('component', name)) {
      let tip = (e.getSource());
      if (tip.getUI() instanceof BasicToolTipUI) {
        (tip.getUI()).componentChanged(tip);
      }
    }
  }
}

$J.define(BasicToolTipUI, 'javax.swing.plaf.basic.BasicToolTipUI', { kind: 'class', sup: 'javax.swing.plaf.ToolTipUI', ctors: { '': '_BasicToolTipUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['sharedInstance', 'sharedPropertyChangedListener'] });
$J.define(BasicToolTipUI$PropertyChangeHandler, 'javax.swing.plaf.basic.BasicToolTipUI$PropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicToolTipUI$PropertyChangeHandler' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  Rectangle = $J.load('java.awt.Rectangle');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  View = $J.load('javax.swing.text.View');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
