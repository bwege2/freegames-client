// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalScrollPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { BasicScrollPaneUI } from '../basic/BasicScrollPaneUI.ts';

let MetalBorders$ScrollPaneBorder, MetalScrollBarUI;

/**
 * A Metal L&amp;F implementation of ScrollPaneUI.
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
export class MetalScrollPaneUI extends BasicScrollPaneUI {
  scrollBarSwapListener: PropertyChangeListener = null;
  /**
   * Constructs a {@code MetalScrollPaneUI}.
   */
  _MetalScrollPaneUI(): this {
    this._BasicScrollPaneUI();
    return this;
  }
  /**
   * Constructs a new {@code MetalScrollPaneUI}.
   *
   * @param x a component
   * @return a new {@code MetalScrollPaneUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new MetalScrollPaneUI()._MetalScrollPaneUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    let sp = c;
    this.updateScrollbarsFreeStanding();
  }
  uninstallUI(c: JComponent): void {
    super.uninstallUI(c);
    let sp = c;
    let hsb = sp.getHorizontalScrollBar();
    let vsb = sp.getVerticalScrollBar();
    if (hsb != null) {
      hsb.putClientProperty(MetalScrollBarUI.FREE_STANDING_PROP, null);
    }
    if (vsb != null) {
      vsb.putClientProperty(MetalScrollBarUI.FREE_STANDING_PROP, null);
    }
  }
  installListeners(scrollPane: JScrollPane): void {
    super.installListeners(scrollPane);
    this.scrollBarSwapListener = this.createScrollBarSwapListener();
    scrollPane.addPropertyChangeListener$PropertyChangeListener(this.scrollBarSwapListener);
  }
  /**
   * {@inheritDoc}
   */
  uninstallListeners$JComponent(c: JComponent): void {
    super.uninstallListeners$JComponent(c);
    c.removePropertyChangeListener$PropertyChangeListener(this.scrollBarSwapListener);
  }
  /**
   * If the border of the scrollpane is an instance of
   * <code>MetalBorders.ScrollPaneBorder</code>, the client property
   * <code>FREE_STANDING_PROP</code> of the scrollbars
   * is set to false, otherwise it is set to true.
   */
  updateScrollbarsFreeStanding(): void {
    if (this.scrollpane == null) {
      return;
    }
    let border = this.scrollpane.getBorder();
    let value: any;
    if (border instanceof MetalBorders$ScrollPaneBorder) {
      value = false;
    } else {
      value = true;
    }
    let sb = this.scrollpane.getHorizontalScrollBar();
    if (sb != null) {
      sb.putClientProperty(MetalScrollBarUI.FREE_STANDING_PROP, value);
    }
    sb = this.scrollpane.getVerticalScrollBar();
    if (sb != null) {
      sb.putClientProperty(MetalScrollBarUI.FREE_STANDING_PROP, value);
    }
  }
  /**
   * Returns a new {@code PropertyChangeListener} for scroll bar swap events.
   *
   * @return a new {@code PropertyChangeListener} for scroll bar swap events.
   */
  createScrollBarSwapListener(): PropertyChangeListener {
    return (e) => {
      let propertyName = e.getPropertyName();
      if ($J.equals(propertyName, 'verticalScrollBar') || $J.equals(propertyName, 'horizontalScrollBar')) {
        let oldSB = e.getOldValue();
        if (oldSB != null) {
          oldSB.putClientProperty(MetalScrollBarUI.FREE_STANDING_PROP, null);
        }
        let newSB = e.getNewValue();
        if (newSB != null) {
          newSB.putClientProperty(MetalScrollBarUI.FREE_STANDING_PROP, false);
        }
      } else if ($J.equals('border', propertyName)) {
        this.updateScrollbarsFreeStanding();
      }
    };
  }
}

$J.define(MetalScrollPaneUI, 'javax.swing.plaf.metal.MetalScrollPaneUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicScrollPaneUI', ctors: { '': '_MetalScrollPaneUI' }, meths: { 'uninstallListeners(javax.swing.JScrollPane)': 'uninstallListeners$JScrollPane', 'uninstallListeners(javax.swing.JComponent)': 'uninstallListeners$JComponent' } });
$J.module(() => {
  MetalBorders$ScrollPaneBorder = $J.load('javax.swing.plaf.metal.MetalBorders$ScrollPaneBorder');
  MetalScrollBarUI = $J.load('javax.swing.plaf.metal.MetalScrollBarUI');
});
