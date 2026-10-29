// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicLabelUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AppContext, JObject, JString } from '../../../../../jre/index.ts';
import { LabelUI } from '../LabelUI.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let Component$BaselineResizeBehavior, Container, Dimension, Rectangle, KeyEvent, JComponent, KeyStroke, LookAndFeel, SwingConstants, SwingUtilities, ComponentInputMapUIResource, InputMapUIResource, BasicHTML, BasicLookAndFeel, LazyActionMap, View, SwingUtilities2;

/**
 * A Windows L&amp;F implementation of LabelUI.  This implementation
 * is completely static, i.e. there's only one UIView implementation
 * that's shared by all JLabel objects.
 *
 * @author Hans Muller
 */
export class BasicLabelUI extends LabelUI {
  /**
   * The default <code>BasicLabelUI</code> instance. This field might
   * not be used. To change the default instance use a subclass which
   * overrides the <code>createUI</code> method, and place that class
   * name in defaults table under the key "LabelUI".
   */
  static labelUI: BasicLabelUI = null;
  static BASIC_LABEL_UI_KEY: any = null;
  paintIconR: Rectangle = null;
  paintTextR: Rectangle = null;
  /**
   * Constructs a {@code BasicLabelUI}.
   */
  _BasicLabelUI(): this {
    this._LabelUI();
    this.paintIconR = new Rectangle()._Rectangle$();
    this.paintTextR = new Rectangle()._Rectangle$();
    return this;
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicLabelUI$Actions()._BasicLabelUI$Actions(BasicLabelUI$Actions.PRESS));
    map.put$Action(new BasicLabelUI$Actions()._BasicLabelUI$Actions(BasicLabelUI$Actions.RELEASE));
  }
  /**
   * Forwards the call to SwingUtilities.layoutCompoundLabel().
   * This method is here so that a subclass could do Label specific
   * layout and to shorten the method name a little.
   *
   * @param label an instance of {@code JLabel}
   * @param fontMetrics a font metrics
   * @param text a text
   * @param icon an icon
   * @param viewR a bounding rectangle to lay out label
   * @param iconR a bounding rectangle to lay out icon
   * @param textR a bounding rectangle to lay out text
   * @return a possibly clipped version of the compound labels string
   * @see SwingUtilities#layoutCompoundLabel
   */
  layoutCL(label: JLabel, fontMetrics: FontMetrics, text: string, icon: Icon, viewR: Rectangle, iconR: Rectangle, textR: Rectangle): string {
    return SwingUtilities.layoutCompoundLabel$JComponent$FontMetrics$String$Icon$int$int$int$int$Rectangle$Rectangle$Rectangle$int(label, fontMetrics, text, icon, label.getVerticalAlignment(), label.getHorizontalAlignment(), label.getVerticalTextPosition(), label.getHorizontalTextPosition(), viewR, iconR, textR, label.getIconTextGap());
  }
  /**
   * Paint clippedText at textX, textY with the labels foreground color.
   *
   * @param l an instance of {@code JLabel}
   * @param g an instance of {@code Graphics}
   * @param s a text
   * @param textX an X coordinate
   * @param textY an Y coordinate
   * @see #paint
   * @see #paintDisabledText
   */
  paintEnabledText(l: JLabel, g: Graphics, s: string, textX: number, textY: number): void {
    let mnemIndex = l.getDisplayedMnemonicIndex();
    g.setColor(l.getForeground());
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(l, g, s, mnemIndex, textX, textY);
  }
  /**
   * Paint clippedText at textX, textY with background.lighter() and then
   * shifted down and to the right by one pixel with background.darker().
   *
   * @param l an instance of {@code JLabel}
   * @param g an instance of {@code Graphics}
   * @param s a text
   * @param textX an X coordinate
   * @param textY an Y coordinate
   * @see #paint
   * @see #paintEnabledText
   */
  paintDisabledText(l: JLabel, g: Graphics, s: string, textX: number, textY: number): void {
    let accChar = l.getDisplayedMnemonicIndex();
    let background = l.getBackground();
    g.setColor(background.brighter());
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(l, g, s, accChar, (textX + 1) | 0, (textY + 1) | 0);
    g.setColor(background.darker());
    SwingUtilities2.drawStringUnderlineCharAt$JComponent$Graphics$String$int$int$int(l, g, s, accChar, textX, textY);
  }
  /**
   * Paints the label text with the foreground color, if the label is opaque
   * then paints the entire background with the background color. The Label
   * text is drawn by {@link #paintEnabledText} or {@link #paintDisabledText}.
   * The locations of the label parts are computed by {@link #layoutCL}.
   *
   * @see #paintEnabledText
   * @see #paintDisabledText
   * @see #layoutCL
   */
  paint(g: Graphics, c: JComponent): void {
    let label = c;
    let text = label.getText();
    let icon = (label.isEnabled()) ? label.getIcon() : label.getDisabledIcon();
    if ((icon == null) && (text == null)) {
      return;
    }
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(label, g);
    let clippedText = this.layout(label, fm, c.getWidth(), c.getHeight());
    if (icon != null) {
      icon.paintIcon(c, g, this.paintIconR.x_, this.paintIconR.y_);
    }
    if (text != null) {
      let v = c.getClientProperty(BasicHTML.propertyKey);
      if (v != null) {
        v.paint(g, this.paintTextR);
      } else {
        let textX = this.paintTextR.x_;
        let textY = (this.paintTextR.y_ + fm.getAscent()) | 0;
        if (label.isEnabled()) {
          this.paintEnabledText(label, g, clippedText, textX, textY);
        } else {
          this.paintDisabledText(label, g, clippedText, textX, textY);
        }
      }
    }
  }
  layout(label: JLabel, fm: FontMetrics, width: number, height: number): string {
    let insets = label.getInsets$Insets(null);
    let text = label.getText();
    let icon = (label.isEnabled()) ? label.getIcon() : label.getDisabledIcon();
    let paintViewR = new Rectangle()._Rectangle$();
    paintViewR.x_ = insets.left;
    paintViewR.y_ = insets.top;
    paintViewR.width_ = (width - (insets.left + insets.right)) | 0;
    paintViewR.height_ = (height - (insets.top + insets.bottom)) | 0;
    this.paintIconR.x_ = this.paintIconR.y_ = this.paintIconR.width_ = this.paintIconR.height_ = 0;
    this.paintTextR.x_ = this.paintTextR.y_ = this.paintTextR.width_ = this.paintTextR.height_ = 0;
    return this.layoutCL(label, fm, text, icon, paintViewR, this.paintIconR, this.paintTextR);
  }
  getPreferredSize$JComponent(c: JComponent): Dimension {
    let label = c;
    let text = label.getText();
    let icon = (label.isEnabled()) ? label.getIcon() : label.getDisabledIcon();
    let insets = label.getInsets$Insets(null);
    let font = label.getFont();
    let dx = (insets.left + insets.right) | 0;
    let dy = (insets.top + insets.bottom) | 0;
    if ((icon == null) && ((text == null) || ((text != null) && (font == null)))) {
      return new Dimension()._Dimension$int$int(dx, dy);
    } else if ((text == null) || ((icon != null) && (font == null))) {
      return new Dimension()._Dimension$int$int((icon.getIconWidth() + dx) | 0, (icon.getIconHeight() + dy) | 0);
    } else {
      let fm = label.getFontMetrics(font);
      let iconR = new Rectangle()._Rectangle$();
      let textR = new Rectangle()._Rectangle$();
      let viewR = new Rectangle()._Rectangle$();
      iconR.x_ = iconR.y_ = iconR.width_ = iconR.height_ = 0;
      textR.x_ = textR.y_ = textR.width_ = textR.height_ = 0;
      viewR.x_ = dx;
      viewR.y_ = dy;
      viewR.width_ = viewR.height_ = 32767;
      this.layoutCL(label, fm, text, icon, viewR, iconR, textR);
      let x1 = Math.min(iconR.x_, textR.x_);
      let x2 = Math.max((iconR.x_ + iconR.width_) | 0, (textR.x_ + textR.width_) | 0);
      let y1 = Math.min(iconR.y_, textR.y_);
      let y2 = Math.max((iconR.y_ + iconR.height_) | 0, (textR.y_ + textR.height_) | 0);
      let rv = new Dimension()._Dimension$int$int((x2 - x1) | 0, (y2 - y1) | 0);
      rv.width_ = (rv.width_ + dx) | 0;
      rv.height_ = (rv.height_ + dy) | 0;
      return rv;
    }
  }
  /**
   * @return getPreferredSize(c)
   */
  getMinimumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d.width_ = $J.d2i(Math.fround(d.width_ - Math.fround(v.getPreferredSpan(View.X_AXIS) - v.getMinimumSpan(View.X_AXIS))));
    }
    return d;
  }
  /**
   * @return getPreferredSize(c)
   */
  getMaximumSize(c: JComponent): Dimension {
    let d = this.getPreferredSize$JComponent(c);
    let v = c.getClientProperty(BasicHTML.propertyKey);
    if (v != null) {
      d.width_ = $J.d2i(Math.fround(d.width_ + Math.fround(v.getMaximumSpan(View.X_AXIS) - v.getPreferredSpan(View.X_AXIS))));
    }
    return d;
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let label = c;
    let text = label.getText();
    if (text == null || (text.length === 0) || label.getFont() == null) {
      return -1;
    }
    let fm = label.getFontMetrics(label.getFont());
    this.layout(label, fm, width, height);
    return BasicHTML.getBaseline$JComponent$int$int$int$int(label, this.paintTextR.y_, fm.getAscent(), this.paintTextR.width_, this.paintTextR.height_);
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    if (c.getClientProperty(BasicHTML.propertyKey) != null) {
      return Component$BaselineResizeBehavior.OTHER;
    }
    switch ((c).getVerticalAlignment()) {
      case SwingConstants.TOP:
        return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
      case SwingConstants.BOTTOM:
        return Component$BaselineResizeBehavior.CONSTANT_DESCENT;
      case SwingConstants.CENTER:
        return Component$BaselineResizeBehavior.CENTER_OFFSET;
    }
    return Component$BaselineResizeBehavior.OTHER;
  }
  installUI(c: JComponent): void {
    this.installDefaults(c);
    this.installComponents(c);
    this.installListeners(c);
    this.installKeyboardActions(c);
  }
  uninstallUI(c: JComponent): void {
    this.uninstallDefaults(c);
    this.uninstallComponents(c);
    this.uninstallListeners(c);
    this.uninstallKeyboardActions(c);
  }
  /**
   * Installs default properties.
   *
   * @param c an instance of {@code JLabel}
   */
  installDefaults(c: JLabel): void {
    LookAndFeel.installColorsAndFont(c, 'Label.background', 'Label.foreground', 'Label.font');
    LookAndFeel.installProperty(c, 'opaque', false);
  }
  /**
   * Registers listeners.
   *
   * @param c an instance of {@code JLabel}
   */
  installListeners(c: JLabel): void {
    c.addPropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * Registers components.
   *
   * @param c an instance of {@code JLabel}
   */
  installComponents(c: JLabel): void {
    BasicHTML.updateRenderer(c, c.getText());
    c.setInheritsPopupMenu(true);
  }
  /**
   * Registers keyboard actions.
   *
   * @param l an instance of {@code JLabel}
   */
  installKeyboardActions(l: JLabel): void {
    let dka = l.getDisplayedMnemonic();
    let lf = l.getLabelFor();
    if ((dka !== 0) && (lf != null)) {
      LazyActionMap.installLazyActionMap(l, $J.cls(BasicLabelUI), 'Label.actionMap');
      let inputMap = SwingUtilities.getUIInputMap(l, JComponent.WHEN_IN_FOCUSED_WINDOW);
      if (inputMap == null) {
        inputMap = new ComponentInputMapUIResource()._ComponentInputMapUIResource(l);
        SwingUtilities.replaceUIInputMap(l, JComponent.WHEN_IN_FOCUSED_WINDOW, inputMap);
      }
      inputMap.clear();
      inputMap.put(KeyStroke.getKeyStroke$int$int$boolean(dka, BasicLookAndFeel.getFocusAcceleratorKeyMask(), false), 'press');
      inputMap.put(KeyStroke.getKeyStroke$int$int$boolean(dka, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()), false), 'press');
    } else {
      let inputMap = SwingUtilities.getUIInputMap(l, JComponent.WHEN_IN_FOCUSED_WINDOW);
      if (inputMap != null) {
        inputMap.clear();
      }
    }
  }
  /**
   * Uninstalls default properties.
   *
   * @param c an instance of {@code JLabel}
   */
  uninstallDefaults(c: JLabel): void {
  }
  /**
   * Unregisters listeners.
   *
   * @param c an instance of {@code JLabel}
   */
  uninstallListeners(c: JLabel): void {
    c.removePropertyChangeListener$PropertyChangeListener($J.fn(this, 'propertyChange'));
  }
  /**
   * Unregisters components.
   *
   * @param c an instance of {@code JLabel}
   */
  uninstallComponents(c: JLabel): void {
    BasicHTML.updateRenderer(c, '');
  }
  /**
   * Unregisters keyboard actions.
   *
   * @param c an instance of {@code JLabel}
   */
  uninstallKeyboardActions(c: JLabel): void {
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_FOCUSED, null);
    SwingUtilities.replaceUIInputMap(c, JComponent.WHEN_IN_FOCUSED_WINDOW, null);
    SwingUtilities.replaceUIActionMap(c, null);
  }
  /**
   * Returns an instance of {@code BasicLabelUI}.
   *
   * @param c a component
   * @return an instance of {@code BasicLabelUI}
   */
  static createUI(c: JComponent): ComponentUI {
    if ($J.system_getSecurityManager() != null) {
      let appContext = AppContext.getAppContext();
      let safeBasicLabelUI = appContext.get(BasicLabelUI.BASIC_LABEL_UI_KEY);
      if (safeBasicLabelUI == null) {
        safeBasicLabelUI = new BasicLabelUI()._BasicLabelUI();
        appContext.put(BasicLabelUI.BASIC_LABEL_UI_KEY, safeBasicLabelUI);
      }
      return safeBasicLabelUI;
    }
    return BasicLabelUI.labelUI;
  }
  propertyChange(e: PropertyChangeEvent): void {
    let name = e.getPropertyName();
    if (name === 'text' || 'font' === name || 'foreground' === name || SwingUtilities2.isScaleChanged$PropertyChangeEvent(e)) {
      let lbl = (e.getSource());
      let text = lbl.getText();
      BasicHTML.updateRenderer(lbl, text);
    } else if (name === 'labelFor' || name === 'displayedMnemonic') {
      this.installKeyboardActions(e.getSource());
    }
  }
  static $clinit() {
    BasicLabelUI.labelUI = new BasicLabelUI()._BasicLabelUI();
    BasicLabelUI.BASIC_LABEL_UI_KEY = new JObject();
  }
}

export class BasicLabelUI$Actions extends UIAction {
  static readonly PRESS: string = 'press';
  static readonly RELEASE: string = 'release';
  _BasicLabelUI$Actions(key: string): this {
    this._UIAction(key);
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    let label = e.getSource();
    let key = this.getName();
    if (key === BasicLabelUI$Actions.PRESS) {
      this.doPress(label);
    } else if (key === BasicLabelUI$Actions.RELEASE) {
      this.doRelease(label, e.getActionCommand() != null);
    }
  }
  doPress(label: JLabel): void {
    let labelFor = label.getLabelFor();
    if (labelFor != null && labelFor.isEnabled()) {
      let inputMap = SwingUtilities.getUIInputMap(label, JComponent.WHEN_FOCUSED);
      if (inputMap == null) {
        inputMap = new InputMapUIResource()._InputMapUIResource();
        SwingUtilities.replaceUIInputMap(label, JComponent.WHEN_FOCUSED, inputMap);
      }
      let dka = label.getDisplayedMnemonic();
      this.putOnRelease(inputMap, dka, BasicLookAndFeel.getFocusAcceleratorKeyMask());
      this.putOnRelease(inputMap, dka, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()));
      this.putOnRelease(inputMap, dka, 0);
      this.putOnRelease(inputMap, KeyEvent.VK_ALT, 0);
      label.requestFocus$();
    }
  }
  doRelease(label: JLabel, isCommand: boolean): void {
    let labelFor = label.getLabelFor();
    if (labelFor != null && labelFor.isEnabled()) {
      if (label.hasFocus()) {
        let inputMap = SwingUtilities.getUIInputMap(label, JComponent.WHEN_FOCUSED);
        if (inputMap != null) {
          let dka = label.getDisplayedMnemonic();
          this.removeOnRelease(inputMap, dka, BasicLookAndFeel.getFocusAcceleratorKeyMask());
          this.removeOnRelease(inputMap, dka, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()));
          this.removeOnRelease(inputMap, dka, 0);
          this.removeOnRelease(inputMap, KeyEvent.VK_ALT, 0);
        }
        inputMap = SwingUtilities.getUIInputMap(label, JComponent.WHEN_IN_FOCUSED_WINDOW);
        if (inputMap == null) {
          inputMap = new InputMapUIResource()._InputMapUIResource();
          SwingUtilities.replaceUIInputMap(label, JComponent.WHEN_IN_FOCUSED_WINDOW, inputMap);
        }
        let dka = label.getDisplayedMnemonic();
        if (isCommand) {
          this.putOnRelease(inputMap, KeyEvent.VK_ALT, 0);
        } else {
          this.putOnRelease(inputMap, dka, BasicLookAndFeel.getFocusAcceleratorKeyMask());
          this.putOnRelease(inputMap, dka, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()));
          this.putOnRelease(inputMap, dka, 0);
        }
        if (labelFor instanceof Container && (labelFor).isFocusCycleRoot$()) {
          labelFor.requestFocus$();
        } else {
          SwingUtilities2.compositeRequestFocus(labelFor);
        }
      } else {
        let inputMap = SwingUtilities.getUIInputMap(label, JComponent.WHEN_IN_FOCUSED_WINDOW);
        let dka = label.getDisplayedMnemonic();
        if (inputMap != null) {
          if (isCommand) {
            this.removeOnRelease(inputMap, dka, BasicLookAndFeel.getFocusAcceleratorKeyMask());
            this.removeOnRelease(inputMap, dka, SwingUtilities2.setAltGraphMask(BasicLookAndFeel.getFocusAcceleratorKeyMask()));
            this.removeOnRelease(inputMap, dka, 0);
          } else {
            this.removeOnRelease(inputMap, KeyEvent.VK_ALT, 0);
          }
        }
      }
    }
  }
  putOnRelease(inputMap: InputMap, keyCode: number, modifiers: number): void {
    inputMap.put(KeyStroke.getKeyStroke$int$int$boolean(keyCode, modifiers, true), BasicLabelUI$Actions.RELEASE);
  }
  removeOnRelease(inputMap: InputMap, keyCode: number, modifiers: number): void {
    inputMap.remove(KeyStroke.getKeyStroke$int$int$boolean(keyCode, modifiers, true));
  }
}

$J.define(BasicLabelUI, 'javax.swing.plaf.basic.BasicLabelUI', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'javax.swing.plaf.LabelUI', ctors: { '': '_BasicLabelUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' }, clinit: true, lazy: ['labelUI', 'BASIC_LABEL_UI_KEY'] });
$J.define(BasicLabelUI$Actions, 'javax.swing.plaf.basic.BasicLabelUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicLabelUI$Actions' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Container = $J.load('java.awt.Container');
  Dimension = $J.load('java.awt.Dimension');
  Rectangle = $J.load('java.awt.Rectangle');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  JComponent = $J.load('javax.swing.JComponent');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ComponentInputMapUIResource = $J.load('javax.swing.plaf.ComponentInputMapUIResource');
  InputMapUIResource = $J.load('javax.swing.plaf.InputMapUIResource');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  View = $J.load('javax.swing.text.View');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
