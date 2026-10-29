// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/DefaultSwatchChooserPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../jre/index.ts';
import { AbstractColorChooserPanel } from './AbstractColorChooserPanel.ts';
import { KeyAdapter } from '../../../java/awt/event/KeyAdapter.ts';
import { MouseAdapter } from '../../../java/awt/event/MouseAdapter.ts';

let BorderLayout, Color, GridBagConstraints, GridBagLayout, Insets, KeyEvent, AccessibleContext, JLabel, JPanel, UIManager, CompoundBorder, LineBorder, MainSwatchPanel, RecentSwatchPanel;

/**
 * The standard color swatch chooser.
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
export class DefaultSwatchChooserPanel extends AbstractColorChooserPanel {
  swatchPanel: SwatchPanel = null;
  recentSwatchPanel: RecentSwatchPanel = null;
  mainSwatchListener: MouseListener = null;
  recentSwatchListener: MouseListener = null;
  mainSwatchKeyListener: KeyListener = null;
  recentSwatchKeyListener: KeyListener = null;
  _DefaultSwatchChooserPanel(): this {
    this._AbstractColorChooserPanel();
    this.setInheritsPopupMenu(true);
    return this;
  }
  getDisplayName(): string {
    return UIManager.getString$Object$Locale('ColorChooser.swatchesNameText', this.getLocale$());
  }
  /**
   * Provides a hint to the look and feel as to the
   * <code>KeyEvent.VK</code> constant that can be used as a mnemonic to
   * access the panel. A return value <= 0 indicates there is no mnemonic.
   * <p>
   * The return value here is a hint, it is ultimately up to the look
   * and feel to honor the return value in some meaningful way.
   * <p>
   * This implementation looks up the value from the default
   * <code>ColorChooser.swatchesMnemonic</code>, or if it
   * isn't available (or not an <code>Integer</code>) returns -1.
   * The lookup for the default is done through the <code>UIManager</code>:
   * <code>UIManager.get("ColorChooser.swatchesMnemonic");</code>.
   *
   * @return KeyEvent.VK constant identifying the mnemonic; <= 0 for no
   *         mnemonic
   * @see #getDisplayedMnemonicIndex
   * @since 1.4
   */
  getMnemonic(): number {
    return this.getInt('ColorChooser.swatchesMnemonic', -1);
  }
  /**
   * Provides a hint to the look and feel as to the index of the character in
   * <code>getDisplayName</code> that should be visually identified as the
   * mnemonic. The look and feel should only use this if
   * <code>getMnemonic</code> returns a value > 0.
   * <p>
   * The return value here is a hint, it is ultimately up to the look
   * and feel to honor the return value in some meaningful way. For example,
   * a look and feel may wish to render each
   * <code>AbstractColorChooserPanel</code> in a <code>JTabbedPane</code>,
   * and further use this return value to underline a character in
   * the <code>getDisplayName</code>.
   * <p>
   * This implementation looks up the value from the default
   * <code>ColorChooser.rgbDisplayedMnemonicIndex</code>, or if it
   * isn't available (or not an <code>Integer</code>) returns -1.
   * The lookup for the default is done through the <code>UIManager</code>:
   * <code>UIManager.get("ColorChooser.swatchesDisplayedMnemonicIndex");</code>.
   *
   * @return Character index to render mnemonic for; -1 to provide no
   *                   visual identifier for this panel.
   * @see #getMnemonic
   * @since 1.4
   */
  getDisplayedMnemonicIndex(): number {
    return this.getInt('ColorChooser.swatchesDisplayedMnemonicIndex', -1);
  }
  /**
   * The background color, foreground color, and font are already set to the
   * defaults from the defaults table before this method is called.
   */
  installChooserPanel(enclosingChooser: JColorChooser): void {
    super.installChooserPanel(enclosingChooser);
  }
  buildChooser(): void {
    let recentStr = UIManager.getString$Object$Locale('ColorChooser.swatchesRecentText', this.getLocale$());
    let gb = new GridBagLayout()._GridBagLayout();
    let gbc = new GridBagConstraints()._GridBagConstraints$();
    let superHolder = new JPanel()._JPanel$LayoutManager(gb);
    this.swatchPanel = new MainSwatchPanel()._MainSwatchPanel();
    this.swatchPanel.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, this.getDisplayName());
    this.swatchPanel.setInheritsPopupMenu(true);
    this.recentSwatchPanel = new RecentSwatchPanel()._RecentSwatchPanel();
    this.recentSwatchPanel.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, recentStr);
    this.mainSwatchKeyListener = new DefaultSwatchChooserPanel$MainSwatchKeyListener().$o(this)._DefaultSwatchChooserPanel$MainSwatchKeyListener();
    this.mainSwatchListener = new DefaultSwatchChooserPanel$MainSwatchListener().$o(this)._DefaultSwatchChooserPanel$MainSwatchListener();
    this.swatchPanel.addMouseListener(this.mainSwatchListener);
    this.swatchPanel.addKeyListener(this.mainSwatchKeyListener);
    this.recentSwatchListener = new DefaultSwatchChooserPanel$RecentSwatchListener().$o(this)._DefaultSwatchChooserPanel$RecentSwatchListener();
    this.recentSwatchKeyListener = new DefaultSwatchChooserPanel$RecentSwatchKeyListener().$o(this)._DefaultSwatchChooserPanel$RecentSwatchKeyListener();
    this.recentSwatchPanel.addMouseListener(this.recentSwatchListener);
    this.recentSwatchPanel.addKeyListener(this.recentSwatchKeyListener);
    let mainHolder = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    let border = new CompoundBorder()._CompoundBorder$Border$Border(new LineBorder()._LineBorder$Color(Color.black), new LineBorder()._LineBorder$Color(Color.white));
    mainHolder.setBorder(border);
    mainHolder.add$Component$Object(this.swatchPanel, BorderLayout.CENTER);
    gbc.anchor = GridBagConstraints.LAST_LINE_START;
    gbc.gridwidth = 1;
    gbc.gridheight = 2;
    let oldInsets = gbc.insets_;
    gbc.insets_ = new Insets()._Insets(0, 0, 0, 10);
    superHolder.add$Component$Object(mainHolder, gbc);
    gbc.insets_ = oldInsets;
    this.recentSwatchPanel.setInheritsPopupMenu(true);
    let recentHolder = new JPanel()._JPanel$LayoutManager(new BorderLayout()._BorderLayout$());
    recentHolder.setBorder(border);
    recentHolder.setInheritsPopupMenu(true);
    recentHolder.add$Component$Object(this.recentSwatchPanel, BorderLayout.CENTER);
    let l = new JLabel()._JLabel$String(recentStr);
    l.setLabelFor(this.recentSwatchPanel);
    gbc.gridwidth = GridBagConstraints.REMAINDER;
    gbc.gridheight = 1;
    gbc.weighty = 1;
    superHolder.add$Component$Object(l, gbc);
    gbc.weighty = 0;
    gbc.gridheight = GridBagConstraints.REMAINDER;
    gbc.insets_ = new Insets()._Insets(0, 0, 0, 2);
    superHolder.add$Component$Object(recentHolder, gbc);
    superHolder.setInheritsPopupMenu(true);
    this.add$Component(superHolder);
  }
  uninstallChooserPanel(enclosingChooser: JColorChooser): void {
    super.uninstallChooserPanel(enclosingChooser);
    this.swatchPanel.removeMouseListener(this.mainSwatchListener);
    this.swatchPanel.removeKeyListener(this.mainSwatchKeyListener);
    this.recentSwatchPanel.removeMouseListener(this.recentSwatchListener);
    this.recentSwatchPanel.removeKeyListener(this.recentSwatchKeyListener);
    this.swatchPanel = null;
    this.recentSwatchPanel = null;
    this.mainSwatchListener = null;
    this.mainSwatchKeyListener = null;
    this.recentSwatchListener = null;
    this.recentSwatchKeyListener = null;
    this.removeAll();
  }
  updateChooser(): void {
  }
}

export class DefaultSwatchChooserPanel$RecentSwatchKeyListener extends KeyAdapter {
  _DefaultSwatchChooserPanel$RecentSwatchKeyListener(): this {
    this._KeyAdapter();
    return this;
  }
  keyPressed(e: KeyEvent): void {
    if (KeyEvent.VK_SPACE === e.getKeyCode()) {
      let color = this.$outer.recentSwatchPanel.getSelectedColor();
      this.$outer.setSelectedColor(color);
    }
  }
}

export class DefaultSwatchChooserPanel$MainSwatchKeyListener extends KeyAdapter {
  _DefaultSwatchChooserPanel$MainSwatchKeyListener(): this {
    this._KeyAdapter();
    return this;
  }
  keyPressed(e: KeyEvent): void {
    if (KeyEvent.VK_SPACE === e.getKeyCode()) {
      let color = this.$outer.swatchPanel.getSelectedColor();
      this.$outer.setSelectedColor(color);
      this.$outer.recentSwatchPanel.setMostRecentColor(color);
    }
  }
}

export class DefaultSwatchChooserPanel$RecentSwatchListener extends MouseAdapter {
  _DefaultSwatchChooserPanel$RecentSwatchListener(): this {
    this._MouseAdapter();
    return this;
  }
  mousePressed(e: MouseEvent): void {
    if (this.$outer.isEnabled()) {
      let color = this.$outer.recentSwatchPanel.getColorForLocation(e.getX(), e.getY());
      this.$outer.recentSwatchPanel.setSelectedColorFromLocation(e.getX(), e.getY());
      this.$outer.setSelectedColor(color);
      this.$outer.recentSwatchPanel.requestFocusInWindow$();
    }
  }
}

export class DefaultSwatchChooserPanel$MainSwatchListener extends MouseAdapter {
  _DefaultSwatchChooserPanel$MainSwatchListener(): this {
    this._MouseAdapter();
    return this;
  }
  mousePressed(e: MouseEvent): void {
    if (this.$outer.isEnabled()) {
      let color = this.$outer.swatchPanel.getColorForLocation(e.getX(), e.getY());
      this.$outer.setSelectedColor(color);
      this.$outer.swatchPanel.setSelectedColorFromLocation(e.getX(), e.getY());
      this.$outer.recentSwatchPanel.setMostRecentColor(color);
      this.$outer.swatchPanel.requestFocusInWindow$();
    }
  }
}

$J.define(DefaultSwatchChooserPanel, 'javax.swing.colorchooser.DefaultSwatchChooserPanel', { kind: 'class', sup: 'javax.swing.colorchooser.AbstractColorChooserPanel', ctors: { '': '_DefaultSwatchChooserPanel' } });
$J.define(DefaultSwatchChooserPanel$RecentSwatchKeyListener, 'javax.swing.colorchooser.DefaultSwatchChooserPanel$RecentSwatchKeyListener', { kind: 'class', sup: 'java.awt.event.KeyAdapter', ctors: { '': '_DefaultSwatchChooserPanel$RecentSwatchKeyListener' }, inner: true });
$J.define(DefaultSwatchChooserPanel$MainSwatchKeyListener, 'javax.swing.colorchooser.DefaultSwatchChooserPanel$MainSwatchKeyListener', { kind: 'class', sup: 'java.awt.event.KeyAdapter', ctors: { '': '_DefaultSwatchChooserPanel$MainSwatchKeyListener' }, inner: true });
$J.define(DefaultSwatchChooserPanel$RecentSwatchListener, 'javax.swing.colorchooser.DefaultSwatchChooserPanel$RecentSwatchListener', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.event.MouseAdapter', ctors: { '': '_DefaultSwatchChooserPanel$RecentSwatchListener' }, inner: true });
$J.define(DefaultSwatchChooserPanel$MainSwatchListener, 'javax.swing.colorchooser.DefaultSwatchChooserPanel$MainSwatchListener', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.event.MouseAdapter', ctors: { '': '_DefaultSwatchChooserPanel$MainSwatchListener' }, inner: true });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Color = $J.load('java.awt.Color');
  GridBagConstraints = $J.load('java.awt.GridBagConstraints');
  GridBagLayout = $J.load('java.awt.GridBagLayout');
  Insets = $J.load('java.awt.Insets');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  UIManager = $J.load('javax.swing.UIManager');
  CompoundBorder = $J.load('javax.swing.border.CompoundBorder');
  LineBorder = $J.load('javax.swing.border.LineBorder');
  MainSwatchPanel = $J.load('javax.swing.colorchooser.MainSwatchPanel');
  RecentSwatchPanel = $J.load('javax.swing.colorchooser.RecentSwatchPanel');
});
