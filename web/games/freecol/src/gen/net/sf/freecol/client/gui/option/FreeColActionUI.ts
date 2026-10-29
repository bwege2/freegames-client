// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/FreeColActionUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2022   The FreeCol Team
 *
 *  This file is part of FreeCol.
 *
 *  FreeCol is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 2 of the License, or
 *  (at your option) any later version.
 *
 *  FreeCol is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with FreeCol.  If not, see <http://www.gnu.org/licenses/>.
 */
import { $J, JString } from '../../../../../../../jre/index.ts';
import { OptionUI } from './OptionUI.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';

let BasicStroke, Color, Dimension, InputEvent, KeyEvent, ImageIcon, JButton, JPanel, KeyStroke, SwingConstants, Timer, FontLibrary, Utility, ImageUtils;

/**
 * User interface for displaying/changing a keyboard accelerator for a
 * {@code FreeColAction}.
 */
export class FreeColActionUI extends OptionUI {
  optionGroupUI: OptionGroupUI = null;
  keyStroke: KeyStroke = null;
  recordButton: JButton = null;
  removeButton: JButton = null;
  bl: FreeColActionUI$BlinkingLabel = null;
  panel: JPanel = null;
  /**
   * Creates a new {@code FreeColActionUI} for the
   * given {@code FreeColAction}.
   *
   * @param option The {@code FreeColAction} to make a user
   *       interface for.
   * @param editable boolean whether user can modify the setting
   */
  _FreeColActionUI(option: FreeColAction, editable: boolean): this {
    this._OptionUI(option, editable);
    this.panel = new JPanel()._JPanel$();
    this.optionGroupUI = null;
    this.keyStroke = option.getAccelerator();
    this.panel.add$Component(this.getJLabel());
    this.bl = new FreeColActionUI$BlinkingLabel().$o(this)._FreeColActionUI$BlinkingLabel();
    this.panel.add$Component(this.bl);
    this.recordButton = new JButton()._JButton$Icon(FreeColActionUI.getRecordImage());
    this.recordButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.panel.add$Component(this.recordButton);
    this.removeButton = new JButton()._JButton$Icon(FreeColActionUI.getRemoveImage());
    this.removeButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.panel.add$Component(this.removeButton);
    this.initialize();
    return this;
  }
  /**
   * Creates an icon for symbolizing the recording of a {@code KeyStroke}.
   * @return The {@code ImageIcon}.
   */
  static getRecordImage(): ImageIcon {
    let imageSize = $J.d2i((Math.fround(9 * FontLibrary.getFontScaling())));
    let strokeSize = $J.d2i((Math.fround(1 * FontLibrary.getFontScaling())));
    let circleSize = (imageSize - Math.imul(strokeSize, 2)) | 0;
    let bi = ImageUtils.createBufferedImage$int$int(imageSize, imageSize);
    let g = bi.createGraphics();
    g.setColor(Color.RED);
    g.fillOval(strokeSize, strokeSize, circleSize, circleSize);
    g.setColor(Color.BLACK);
    g.drawOval(strokeSize, strokeSize, circleSize, circleSize);
    g.dispose();
    return new ImageIcon()._ImageIcon$Image(bi);
  }
  /**
   * Creates an icon to be used on the button that removes a keyboard accelerator.
   * @return The {@code ImageIcon}.
   */
  static getRemoveImage(): ImageIcon {
    let imageSize = $J.d2i((Math.fround(9 * FontLibrary.getFontScaling())));
    let strokeSize = $J.d2i((Math.fround(2 * FontLibrary.getFontScaling())));
    let bi = ImageUtils.createBufferedImage$int$int(imageSize, imageSize);
    let g = bi.createGraphics();
    g.setColor(Color.BLACK);
    g.setStroke(new BasicStroke()._BasicStroke$float(Math.fround((strokeSize + 1) | 0)));
    g.drawLine(strokeSize, strokeSize, (imageSize - strokeSize) | 0, (imageSize - strokeSize) | 0);
    g.drawLine((imageSize - strokeSize) | 0, strokeSize, strokeSize, (imageSize - strokeSize) | 0);
    g.setColor(Color.RED);
    g.setStroke(new BasicStroke()._BasicStroke$float(Math.fround(strokeSize)));
    g.drawLine(strokeSize, strokeSize, (imageSize - strokeSize) | 0, (imageSize - strokeSize) | 0);
    g.drawLine((imageSize - strokeSize) | 0, strokeSize, strokeSize, (imageSize - strokeSize) | 0);
    return new ImageIcon()._ImageIcon$Image(bi);
  }
  /**
   * Gets a string to represent the given {@code KeyStroke} to the user.
   *
   * @param keyStroke {@code java.awt.event.KeyStroke}
   * @return String
   */
  static getHumanKeyStrokeText(keyStroke: KeyStroke): string {
    if (keyStroke == null) {
      return ' ';
    }
    let s = InputEvent.getModifiersExText(keyStroke.getModifiers());
    if (!(s.length === 0)) {
      s += '+';
    }
    return s + KeyEvent.getKeyText(keyStroke.getKeyCode());
  }
  /**
   * Removes the given {@code KeyStroke}. That is:
   * This action's {@code KeyStroke} is set to
   * {@code null} if it is the same as the given
   * {@code KeyStroke}.
   *
   * @param k The {@code KeyStroke} to be removed.
   */
  removeKeyStroke(k: KeyStroke): void {
    if (k != null && this.keyStroke != null && k.getKeyCode() === this.keyStroke.getKeyCode() && k.getModifiers() === this.keyStroke.getModifiers()) {
      this.keyStroke = null;
      this.bl.setText(' ');
    }
  }
  setOptionGroupUI(ui: OptionGroupUI): void {
    this.optionGroupUI = ui;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (ae.getSource() === this.recordButton) {
      this.bl.startBlinking();
      this.bl.requestFocus$();
    } else if (ae.getSource() === this.removeButton) {
      this.bl.stopBlinking();
      this.bl.setText(' ');
      this.keyStroke = null;
    }
  }
  /**
   * {@inheritDoc}
   */
  getComponent(): JPanel {
    return this.panel;
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    this.getOption().setAccelerator(this.keyStroke);
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    this.keyStroke = this.getOption().getAccelerator();
    this.bl.setText(FreeColActionUI.getHumanKeyStrokeText(this.keyStroke));
  }
}

/**
 * Label for displaying a {@code KeyStroke}.
 */
export class FreeColActionUI$BlinkingLabel extends JLabel {
  blinkingTimer: Timer = null;
  blinkOn: boolean = false;
  _FreeColActionUI$BlinkingLabel(): this {
    this._JLabel$String$int(FreeColActionUI.getHumanKeyStrokeText(this.$outer.keyStroke), SwingConstants.CENTER);
    this.blinkingTimer = new Timer()._Timer(500, $J.fn(this, 'actionPerformed'));
    this.blinkOn = false;
    this.setOpaque(false);
    this.setBorder(Utility.getTrivialLineBorder());
    this.addKeyListener(this);
    this.addMouseListener(this);
    return this;
  }
  mouseClicked(e: MouseEvent): void {
    if (e.getClickCount() > 1) {
      this.startBlinking();
      this.requestFocus$();
    }
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  mousePressed(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
  }
  getMinimumSize$(): Dimension {
    return new Dimension()._Dimension$int$int($J.d2i((Math.fround(80 * FontLibrary.getFontScaling()))), super.getMinimumSize$().height_);
  }
  getPreferredSize$(): Dimension {
    return this.getMinimumSize$();
  }
  startBlinking(): void {
    this.blinkingTimer.start();
  }
  stopBlinking(): void {
    this.blinkingTimer.stop();
    this.setOpaque(false);
    this.repaint$();
  }
  keyPressed(e: KeyEvent): void {
  }
  keyTyped(e: KeyEvent): void {
  }
  keyReleased(e: KeyEvent): void {
    let ks = KeyStroke.getKeyStroke$int$int(e.getKeyCode(), e.getModifiersEx());
    if (this.$outer.optionGroupUI != null) {
      this.$outer.optionGroupUI.removeKeyStroke(ks);
    }
    this.$outer.keyStroke = ks;
    this.stopBlinking();
    this.setText(FreeColActionUI.getHumanKeyStrokeText(this.$outer.keyStroke));
    this.$outer.recordButton.requestFocus$();
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (!this.hasFocus()) {
      this.stopBlinking();
    }
    if (this.blinkOn) {
      this.setOpaque(false);
      this.blinkOn = false;
      this.repaint$();
    } else {
      this.setOpaque(true);
      this.setBackground(Color.RED);
      this.blinkOn = true;
      this.repaint$();
    }
  }
}

$J.define(FreeColActionUI, 'net.sf.freecol.client.gui.option.FreeColActionUI', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'net.sf.freecol.client.gui.option.OptionUI', ctors: { 'net.sf.freecol.client.gui.action.FreeColAction,boolean': '_FreeColActionUI' }, returns: { 'getComponent': 'javax.swing.JPanel' } });
$J.define(FreeColActionUI$BlinkingLabel, 'net.sf.freecol.client.gui.option.FreeColActionUI$BlinkingLabel', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'java.awt.event.KeyListener', 'java.awt.event.MouseListener'], sup: 'javax.swing.JLabel', ctors: { '': '_FreeColActionUI$BlinkingLabel' }, returns: { 'getPreferredSize$': 'java.awt.Dimension', 'getMinimumSize$': 'java.awt.Dimension' }, meths: { 'getPreferredSize()': 'getPreferredSize$', 'getMinimumSize()': 'getMinimumSize$' }, inner: true });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  InputEvent = $J.load('java.awt.event.InputEvent');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JButton = $J.load('javax.swing.JButton');
  JPanel = $J.load('javax.swing.JPanel');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  Timer = $J.load('javax.swing.Timer');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
