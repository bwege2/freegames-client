// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalInternalFrameUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2009, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, JString } from '../../../../../jre/index.ts';
import { BasicInternalFrameUI } from '../basic/BasicInternalFrameUI.ts';
import { BasicInternalFrameUI$BorderListener } from '../basic/BasicInternalFrameUI.ts';

let Rectangle, JComponent, JInternalFrame, LookAndFeel, SwingUtilities, EmptyBorder, UIResource, MetalInternalFrameTitlePane, MetalUtils;

/**
 * Metal implementation of JInternalFrame.
 *
 * @author Steve Wilson
 */
export class MetalInternalFrameUI extends BasicInternalFrameUI {
  static metalPropertyChangeListener: PropertyChangeListener = null;
  static handyEmptyBorder: Border = null;
  /**
   * The property {@code JInternalFrame.isPalette}.
   */
  static IS_PALETTE: string = null;
  static IS_PALETTE_KEY: string = null;
  static FRAME_TYPE: string = null;
  static NORMAL_FRAME: string = null;
  static PALETTE_FRAME: string = null;
  static OPTION_DIALOG: string = null;
  /**
   * Constructs a new {@code MetalInternalFrameUI} instance.
   *
   * @param b an internal frame
   */
  _MetalInternalFrameUI(b: JInternalFrame): this {
    this._BasicInternalFrameUI(b);
    return this;
  }
  /**
   * Constructs a new {@code MetalInternalFrameUI} instance.
   *
   * @param c a component
   * @return a new {@code MetalInternalFrameUI} instance
   */
  static createUI(c: JComponent): ComponentUI {
    return new MetalInternalFrameUI()._MetalInternalFrameUI(c);
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    let paletteProp = c.getClientProperty(MetalInternalFrameUI.IS_PALETTE_KEY);
    if (paletteProp != null) {
      this.setPalette((paletteProp));
    }
    let content = this.frame.getContentPane();
    this.stripContentBorder(content);
  }
  uninstallUI(c: JComponent): void {
    this.frame = c;
    let cont = ((c)).getContentPane();
    if (cont instanceof JComponent) {
      let content = cont;
      if (content.getBorder() === MetalInternalFrameUI.handyEmptyBorder) {
        content.setBorder(null);
      }
    }
    super.uninstallUI(c);
  }
  installListeners(): void {
    super.installListeners();
    this.frame.addPropertyChangeListener$PropertyChangeListener(MetalInternalFrameUI.metalPropertyChangeListener);
  }
  uninstallListeners(): void {
    this.frame.removePropertyChangeListener$PropertyChangeListener(MetalInternalFrameUI.metalPropertyChangeListener);
    super.uninstallListeners();
  }
  installKeyboardActions(): void {
    super.installKeyboardActions();
    let map = SwingUtilities.getUIActionMap(this.frame);
    if (map != null) {
      map.remove('showSystemMenu');
    }
  }
  uninstallKeyboardActions(): void {
    super.uninstallKeyboardActions();
  }
  uninstallComponents(): void {
    this.titlePane = null;
    super.uninstallComponents();
  }
  stripContentBorder(c: any): void {
    if (c instanceof JComponent) {
      let contentComp = c;
      let contentBorder = contentComp.getBorder();
      if (contentBorder == null || $J.isa(contentBorder, UIResource)) {
        contentComp.setBorder(MetalInternalFrameUI.handyEmptyBorder);
      }
    }
  }
  createNorthPane(w: JInternalFrame): JComponent {
    return new MetalInternalFrameTitlePane()._MetalInternalFrameTitlePane(w);
  }
  setFrameType(frameType: string): void {
    if ($J.equals(frameType, MetalInternalFrameUI.OPTION_DIALOG)) {
      LookAndFeel.installBorder(this.frame, 'InternalFrame.optionDialogBorder');
      (this.titlePane).setPalette(false);
    } else if ($J.equals(frameType, MetalInternalFrameUI.PALETTE_FRAME)) {
      LookAndFeel.installBorder(this.frame, 'InternalFrame.paletteBorder');
      (this.titlePane).setPalette(true);
    } else {
      LookAndFeel.installBorder(this.frame, 'InternalFrame.border');
      (this.titlePane).setPalette(false);
    }
  }
  /**
   * If {@code isPalette} is {@code true}, sets palette border and title
   *
   * @param isPalette if {@code true}, sets palette border and title
   */
  setPalette(isPalette: boolean): void {
    if (isPalette) {
      LookAndFeel.installBorder(this.frame, 'InternalFrame.paletteBorder');
    } else {
      LookAndFeel.installBorder(this.frame, 'InternalFrame.border');
    }
    (this.titlePane).setPalette(isPalette);
  }
  /**
   * Returns the <code>MouseInputAdapter</code> that will be installed
   * on the TitlePane.
   *
   * @param w the <code>JInternalFrame</code>
   * @return the <code>MouseInputAdapter</code> that will be installed
   * on the TitlePane.
   * @since 1.6
   */
  createBorderListener(w: JInternalFrame): MouseInputAdapter {
    return new MetalInternalFrameUI$BorderListener1().$o(this)._MetalInternalFrameUI$BorderListener1();
  }
  static $clinit() {
    MetalInternalFrameUI.metalPropertyChangeListener = $J.fn(new MetalInternalFrameUI$MetalPropertyChangeHandler()._MetalInternalFrameUI$MetalPropertyChangeHandler(), 'propertyChange');
    MetalInternalFrameUI.handyEmptyBorder = new EmptyBorder()._EmptyBorder$int$int$int$int(0, 0, 0, 0);
    MetalInternalFrameUI.IS_PALETTE = 'JInternalFrame.isPalette';
    MetalInternalFrameUI.IS_PALETTE_KEY = 'JInternalFrame.isPalette';
    MetalInternalFrameUI.FRAME_TYPE = 'JInternalFrame.frameType';
    MetalInternalFrameUI.NORMAL_FRAME = 'normal';
    MetalInternalFrameUI.PALETTE_FRAME = 'palette';
    MetalInternalFrameUI.OPTION_DIALOG = 'optionDialog';
  }
}

export class MetalInternalFrameUI$MetalPropertyChangeHandler extends JObject {
  _MetalInternalFrameUI$MetalPropertyChangeHandler(): this {
    return this;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    let jif = e.getSource();
    if (!(jif.getUI() instanceof MetalInternalFrameUI)) {
      return;
    }
    let ui = jif.getUI();
    if ($J.equals(name, MetalInternalFrameUI.FRAME_TYPE)) {
      if ($J.isa(e.getNewValue(), JString)) {
        ui.setFrameType(e.getNewValue());
      }
    } else if ($J.equals(name, MetalInternalFrameUI.IS_PALETTE_KEY)) {
      if (e.getNewValue() != null) {
        ui.setPalette((e.getNewValue()));
      } else {
        ui.setPalette(false);
      }
    } else if ($J.equals(name, JInternalFrame.CONTENT_PANE_PROPERTY)) {
      ui.stripContentBorder(e.getNewValue());
    }
  }
}

export class MetalInternalFrameUI$BorderListener1 extends BasicInternalFrameUI$BorderListener {
  _MetalInternalFrameUI$BorderListener1(): this {
    this._BasicInternalFrameUI$BorderListener();
    return this;
  }
  getIconBounds(): Rectangle {
    let leftToRight = MetalUtils.isLeftToRight(this.$outer.frame);
    let xOffset = leftToRight ? 5 : (this.$outer.titlePane.getWidth() - 5) | 0;
    let rect = null;
    let icon = this.$outer.frame.getFrameIcon();
    if (icon != null) {
      if (!leftToRight) {
        xOffset = (xOffset - icon.getIconWidth()) | 0;
      }
      let iconY = ((($J.idiv(this.$outer.titlePane.getHeight(), 2)) - ($J.idiv(icon.getIconHeight(), 2))) | 0);
      rect = new Rectangle()._Rectangle$int$int$int$int(xOffset, iconY, icon.getIconWidth(), icon.getIconHeight());
    }
    return rect;
  }
  mouseClicked(e: MouseEvent): void {
    if (e.getClickCount() === 2 && e.getSource() === this.$outer.getNorthPane() && this.$outer.frame.isClosable() && !this.$outer.frame.isIcon()) {
      let rect = this.getIconBounds();
      if ((rect != null) && rect.contains$int$int(e.getX(), e.getY())) {
        this.$outer.frame.doDefaultCloseAction();
      } else {
        super.mouseClicked(e);
      }
    } else {
      super.mouseClicked(e);
    }
  }
}

$J.define(MetalInternalFrameUI, 'javax.swing.plaf.metal.MetalInternalFrameUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicInternalFrameUI', ctors: { 'javax.swing.JInternalFrame': '_MetalInternalFrameUI' }, clinit: true, lazy: ['metalPropertyChangeListener', 'handyEmptyBorder', 'IS_PALETTE', 'IS_PALETTE_KEY', 'FRAME_TYPE', 'NORMAL_FRAME', 'PALETTE_FRAME', 'OPTION_DIALOG'] });
$J.define(MetalInternalFrameUI$MetalPropertyChangeHandler, 'javax.swing.plaf.metal.MetalInternalFrameUI$MetalPropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_MetalInternalFrameUI$MetalPropertyChangeHandler' } });
$J.define(MetalInternalFrameUI$BorderListener1, 'javax.swing.plaf.metal.MetalInternalFrameUI$BorderListener1', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'javax.swing.plaf.basic.BasicInternalFrameUI$BorderListener', ctors: { '': '_MetalInternalFrameUI$BorderListener1' }, inner: true });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  JComponent = $J.load('javax.swing.JComponent');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalInternalFrameTitlePane = $J.load('javax.swing.plaf.metal.MetalInternalFrameTitlePane');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
});
