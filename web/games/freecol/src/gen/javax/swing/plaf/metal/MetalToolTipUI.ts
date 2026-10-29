// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalToolTipUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../jre/index.ts';
import { BasicToolTipUI } from '../basic/BasicToolTipUI.ts';

let Font, Rectangle, KeyEvent, AbstractButton, JComponent, UIManager, BasicHTML, MetalLookAndFeel, SwingUtilities2;

/**
 * A Metal L&amp;F extension of BasicToolTipUI.
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
 */
export class MetalToolTipUI extends BasicToolTipUI {
  static sharedInstance: MetalToolTipUI = null;
  smallFont: Font = null;
  tip: JToolTip = null;
  /**
   * The space between strings.
   */
  static readonly padSpaceBetweenStrings: number = 12;
  acceleratorDelimiter: string = null;
  /**
   * Constructs an instance of the {@code MetalToolTipUI}.
   */
  _MetalToolTipUI(): this {
    this._BasicToolTipUI();
    return this;
  }
  /**
   * Returns an instance of the {@code MetalToolTipUI}.
   *
   * @param c a component
   * @return an instance of the {@code MetalToolTipUI}.
   */
  static createUI(c: JComponent): ComponentUI {
    return MetalToolTipUI.sharedInstance;
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    this.tip = c;
    let f = c.getFont();
    this.smallFont = new Font()._Font$String$int$int(f.getName(), f.getStyle(), (f.getSize() - 2) | 0);
    this.acceleratorDelimiter = UIManager.getString$Object('MenuItem.acceleratorDelimiter');
    if (this.acceleratorDelimiter == null) {
      this.acceleratorDelimiter = '-';
    }
  }
  uninstallUI(c: JComponent): void {
    super.uninstallUI(c);
    this.tip = null;
  }
  paint(g: Graphics, c: JComponent): void {
    let tip = c;
    let font = c.getFont();
    let metrics = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(c, g, font);
    let size = c.getSize$();
    let accelBL: number;
    g.setColor(c.getForeground());
    let tipText = tip.getTipText();
    if (tipText == null) {
      tipText = '';
    }
    let accelString = this.getAcceleratorString$JToolTip$MetalToolTipUI(tip);
    let accelMetrics = SwingUtilities2.getFontMetrics$JComponent$Graphics$Font(c, g, this.smallFont);
    let accelSpacing = this.calcAccelSpacing(c, accelMetrics, accelString);
    let insets = tip.getInsets$();
    let paintTextR = new Rectangle()._Rectangle$int$int$int$int((insets.left + 3) | 0, insets.top, (size.width_ - (insets.left + insets.right) - 6 - accelSpacing) | 0, (size.height_ - (insets.top + insets.bottom)) | 0);
    if (paintTextR.width_ <= 0 || paintTextR.height_ <= 0) {
      return;
    }
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      v.paint(g, paintTextR);
      accelBL = BasicHTML.getHTMLBaseline(v, paintTextR.width_, paintTextR.height_);
    } else {
      g.setFont(font);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(tip, g, tipText, paintTextR.x_, (paintTextR.y_ + metrics.getAscent()) | 0);
      accelBL = metrics.getAscent();
    }
    if (!(accelString.length === 0)) {
      g.setFont(this.smallFont);
      g.setColor(MetalLookAndFeel.getPrimaryControlDarkShadow());
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(tip, g, accelString, (tip.getWidth() - 1 - insets.right - accelSpacing + MetalToolTipUI.padSpaceBetweenStrings - 3) | 0, (paintTextR.y_ + accelBL) | 0);
    }
  }
  calcAccelSpacing(c: JComponent, fm: FontMetrics, accel: string): number {
    return (accel.length === 0) ? 0 : (MetalToolTipUI.padSpaceBetweenStrings + SwingUtilities2.stringWidth$JComponent$FontMetrics$String(c, fm, accel)) | 0;
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let d = super.getPreferredSize$JComponent(c);
    let key = this.getAcceleratorString$JToolTip$MetalToolTipUI(c);
    if (!(key.length === 0)) {
      d.width_ = (d.width_ + this.calcAccelSpacing(c, c.getFontMetrics(this.smallFont), key)) | 0;
    }
    return d;
  }
  /**
   * If the accelerator is hidden, the method returns {@code true},
   * otherwise, returns {@code false}.
   *
   * @return {@code true} if the accelerator is hidden.
   */
  isAcceleratorHidden(): boolean {
    let b = UIManager.get$Object('ToolTip.hideAccelerator');
    return b != null && b;
  }
  getAcceleratorString$JToolTip$MetalToolTipUI(tip: JToolTip): string {
    this.tip = tip;
    let retValue = this.getAcceleratorString$();
    this.tip = null;
    return retValue;
  }
  /**
   * Returns the accelerator string.
   *
   * @return the accelerator string.
   */
  getAcceleratorString$(): string {
    if (this.tip == null || this.isAcceleratorHidden()) {
      return '';
    }
    let comp = this.tip.getComponent$();
    if (!(comp instanceof AbstractButton)) {
      return '';
    }
    let keys = comp.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW).keys();
    if (keys == null) {
      return '';
    }
    let controlKeyStr = '';
    for (let i = 0; i < keys.length; i++) {
      let mod = keys[i].getModifiers();
      controlKeyStr = KeyEvent.getKeyModifiersText(mod) + this.acceleratorDelimiter + KeyEvent.getKeyText(keys[i].getKeyCode());
      break;
    }
    return controlKeyStr;
  }
  static $clinit() {
    MetalToolTipUI.sharedInstance = new MetalToolTipUI()._MetalToolTipUI();
  }
}

$J.define(MetalToolTipUI, 'javax.swing.plaf.metal.MetalToolTipUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicToolTipUI', ctors: { '': '_MetalToolTipUI' }, meths: { 'getAcceleratorString()': 'getAcceleratorString$', 'getAcceleratorString(javax.swing.JToolTip)': 'getAcceleratorString$JToolTip$MetalToolTipUI', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['sharedInstance'] });
$J.module(() => {
  Font = $J.load('java.awt.Font');
  Rectangle = $J.load('java.awt.Rectangle');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  AbstractButton = $J.load('javax.swing.AbstractButton');
  JComponent = $J.load('javax.swing.JComponent');
  UIManager = $J.load('javax.swing.UIManager');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
