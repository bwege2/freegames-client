// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalDesktopIconUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2003, Oracle and/or its affiliates. All rights reserved.
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
import { BasicDesktopIconUI } from '../basic/BasicDesktopIconUI.ts';

let BorderLayout, Dimension, JButton, JLabel, LookAndFeel, UIManager, MatteBorder, MetalBumps, MetalLookAndFeel;

/**
 * Metal desktop icon.
 *
 * @author Steve Wilson
 */
export class MetalDesktopIconUI extends BasicDesktopIconUI {
  button: JButton = null;
  label: JLabel = null;
  titleListener: MetalDesktopIconUI$TitleListener = null;
  width_: number = 0;
  /**
   * Constructs a new instance of {@code MetalDesktopIconUI}.
   */
  _MetalDesktopIconUI(): this {
    this._BasicDesktopIconUI();
    return this;
  }
  /**
   * Constructs a new instance of {@code MetalDesktopIconUI}.
   *
   * @param c a component
   * @return a new instance of {@code MetalDesktopIconUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalDesktopIconUI()._MetalDesktopIconUI();
  }
  installDefaults(): void {
    super.installDefaults();
    LookAndFeel.installColorsAndFont(this.desktopIcon, 'DesktopIcon.background', 'DesktopIcon.foreground', 'DesktopIcon.font');
    this.width_ = UIManager.getInt$Object('DesktopIcon.width');
  }
  installComponents(): void {
    this.frame = this.desktopIcon.getInternalFrame();
    let icon = this.frame.getFrameIcon();
    let title = this.frame.getTitle();
    this.button = new JButton()._JButton$String$Icon(title, icon);
    this.button.addActionListener((e) => {
      this.deiconize();
    });
    this.button.setFont(this.desktopIcon.getFont());
    this.button.setBackground(this.desktopIcon.getBackground());
    this.button.setForeground(this.desktopIcon.getForeground());
    let buttonH = this.button.getPreferredSize$().height_;
    let drag = new MetalBumps()._MetalBumps(($J.idiv(buttonH, 3)), buttonH, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlDarkShadow(), MetalLookAndFeel.getControl());
    this.label = new JLabel()._JLabel$Icon(drag);
    this.label.setBorder(new MatteBorder()._MatteBorder$int$int$int$int$Color(0, 2, 0, 1, this.desktopIcon.getBackground()));
    this.desktopIcon.setLayout(new BorderLayout()._BorderLayout$int$int(2, 0));
    this.desktopIcon.add$Component$Object(this.button, BorderLayout.CENTER);
    this.desktopIcon.add$Component$Object(this.label, BorderLayout.WEST);
  }
  uninstallComponents(): void {
    this.desktopIcon.setLayout(null);
    this.desktopIcon.remove$Component(this.label);
    this.desktopIcon.remove$Component(this.button);
    this.button = null;
    this.frame = null;
  }
  installListeners(): void {
    super.installListeners();
    this.desktopIcon.getInternalFrame().addPropertyChangeListener$PropertyChangeListener($J.fn(this.titleListener = new MetalDesktopIconUI$TitleListener().$o(this)._MetalDesktopIconUI$TitleListener(), 'propertyChange'));
  }
  uninstallListeners(): void {
    this.desktopIcon.getInternalFrame().removePropertyChangeListener$PropertyChangeListener($J.fn(this.titleListener, 'propertyChange'));
    this.titleListener = null;
    super.uninstallListeners();
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return this.getMinimumSize(c);
  }
  getMinimumSize(c: JComponent): Dimension {
    return new Dimension()._Dimension$int$int(this.width_, this.desktopIcon.getLayout().minimumLayoutSize(this.desktopIcon).height_);
  }
  getMaximumSize(c: JComponent): Dimension {
    return this.getMinimumSize(c);
  }
}

export class MetalDesktopIconUI$TitleListener extends JObject {
  _MetalDesktopIconUI$TitleListener(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    if ($J.equals(e.getPropertyName(), 'title')) {
      this.$outer.button.setText(e.getNewValue());
    }
    if ($J.equals(e.getPropertyName(), 'frameIcon')) {
      this.$outer.button.setIcon(e.getNewValue());
    }
  }
}

$J.define(MetalDesktopIconUI, 'javax.swing.plaf.metal.MetalDesktopIconUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicDesktopIconUI', ctors: { '': '_MetalDesktopIconUI' }, meths: { 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(MetalDesktopIconUI$TitleListener, 'javax.swing.plaf.metal.MetalDesktopIconUI$TitleListener', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_MetalDesktopIconUI$TitleListener' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Dimension = $J.load('java.awt.Dimension');
  JButton = $J.load('javax.swing.JButton');
  JLabel = $J.load('javax.swing.JLabel');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  UIManager = $J.load('javax.swing.UIManager');
  MatteBorder = $J.load('javax.swing.border.MatteBorder');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
});
