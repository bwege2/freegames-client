// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/colorchooser/DefaultPreviewPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { JPanel } from '../JPanel.ts';

let Color, Dimension, Font, JColorChooser, SwingUtilities, UIManager, SwingUtilities2;

/**
 * The standard preview panel for the color chooser.
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
 * @see JColorChooser
 */
export class DefaultPreviewPanel extends JPanel {
  squareSize: number = 0;
  squareGap: number = 0;
  innerGap: number = 0;
  textGap: number = 0;
  font$DefaultPreviewPanel: Font = null;
  sampleText: string = null;
  swatchWidth: number = 0;
  oldColor: Color = null;
  _DefaultPreviewPanel(): this {
    this._JPanel$();
    this.squareSize = 25;
    this.squareGap = 5;
    this.innerGap = 5;
    this.textGap = 5;
    this.font$DefaultPreviewPanel = new Font()._Font$String$int$int(Font.DIALOG, Font.PLAIN, 12);
    this.swatchWidth = 50;
    this.oldColor = null;
    return this;
  }
  getColorChooser(): JColorChooser {
    return SwingUtilities.getAncestorOfClass($J.cls(JColorChooser), this);
  }
  getPreferredSize$(): Dimension {
    let host = this.getColorChooser();
    if (host == null) {
      host = this;
    }
    let fm = host.getFontMetrics(this.getFont());
    let ascent = fm.getAscent();
    let height = fm.getHeight();
    let width = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(host, fm, this.getSampleText());
    let y = (Math.imul(height, 3) + Math.imul(this.textGap, 3)) | 0;
    let x = (Math.imul(this.squareSize, 3) + Math.imul(this.squareGap, 2) + this.swatchWidth + width + Math.imul(this.textGap, 3)) | 0;
    return new Dimension()._Dimension$int$int(x, y);
  }
  paintComponent(g: Graphics): void {
    if (this.oldColor == null) {
      this.oldColor = this.getForeground();
    }
    g.setColor(this.getBackground());
    g.fillRect(0, 0, this.getWidth(), this.getHeight());
    if (this.getComponentOrientation().isLeftToRight()) {
      let squareWidth = this.paintSquares(g, 0);
      let textWidth = this.paintText(g, squareWidth);
      this.paintSwatch(g, (squareWidth + textWidth) | 0);
    } else {
      let swatchWidth = this.paintSwatch(g, 0);
      let textWidth = this.paintText(g, swatchWidth);
      this.paintSquares(g, (swatchWidth + textWidth) | 0);
    }
  }
  paintSwatch(g: Graphics, offsetX: number): number {
    let swatchX = offsetX;
    g.setColor(this.oldColor);
    g.fillRect(swatchX, 0, this.swatchWidth, ((this.squareSize) + ($J.idiv(this.squareGap, 2))) | 0);
    g.setColor(this.getForeground());
    g.fillRect(swatchX, ((this.squareSize) + ($J.idiv(this.squareGap, 2))) | 0, this.swatchWidth, ((this.squareSize) + ($J.idiv(this.squareGap, 2))) | 0);
    return ((swatchX + this.swatchWidth) | 0);
  }
  paintText(g: Graphics, offsetX: number): number {
    g.setFont(this.getFont());
    let host = this.getColorChooser();
    if (host == null) {
      host = this;
    }
    let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(host, g);
    let ascent = fm.getAscent();
    let height = fm.getHeight();
    let width = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(host, fm, this.getSampleText());
    let textXOffset = (offsetX + this.textGap) | 0;
    let color = this.getForeground();
    g.setColor(color);
    SwingUtilities2.drawString$JComponent$Graphics$String$int$int(host, g, this.getSampleText(), (textXOffset + ($J.idiv(this.textGap, 2))) | 0, (ascent + 2) | 0);
    g.fillRect(textXOffset, ((height) + this.textGap) | 0, (width + (this.textGap)) | 0, (height + 2) | 0);
    g.setColor(Color.black);
    SwingUtilities2.drawString$JComponent$Graphics$String$int$int(host, g, this.getSampleText(), (textXOffset + ($J.idiv(this.textGap, 2))) | 0, (height + ascent + this.textGap + 2) | 0);
    g.setColor(Color.white);
    g.fillRect(textXOffset, Math.imul(((height + this.textGap) | 0), 2), (width + (this.textGap)) | 0, (height + 2) | 0);
    g.setColor(color);
    SwingUtilities2.drawString$JComponent$Graphics$String$int$int(host, g, this.getSampleText(), (textXOffset + ($J.idiv(this.textGap, 2))) | 0, ((Math.imul(((height + this.textGap) | 0), 2)) + ascent + 2) | 0);
    return (width + Math.imul(this.textGap, 3)) | 0;
  }
  paintSquares(g: Graphics, offsetX: number): number {
    let squareXOffset = offsetX;
    let color = this.getForeground();
    g.setColor(Color.white);
    g.fillRect(squareXOffset, 0, this.squareSize, this.squareSize);
    g.setColor(color);
    g.fillRect((squareXOffset + this.innerGap) | 0, this.innerGap, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0);
    g.setColor(Color.white);
    g.fillRect((squareXOffset + Math.imul(this.innerGap, 2)) | 0, Math.imul(this.innerGap, 2), (this.squareSize - (Math.imul(this.innerGap, 4))) | 0, (this.squareSize - (Math.imul(this.innerGap, 4))) | 0);
    g.setColor(color);
    g.fillRect(squareXOffset, (this.squareSize + this.squareGap) | 0, this.squareSize, this.squareSize);
    g.translate$int$int((this.squareSize + this.squareGap) | 0, 0);
    g.setColor(Color.black);
    g.fillRect(squareXOffset, 0, this.squareSize, this.squareSize);
    g.setColor(color);
    g.fillRect((squareXOffset + this.innerGap) | 0, this.innerGap, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0);
    g.setColor(Color.white);
    g.fillRect((squareXOffset + Math.imul(this.innerGap, 2)) | 0, Math.imul(this.innerGap, 2), (this.squareSize - (Math.imul(this.innerGap, 4))) | 0, (this.squareSize - (Math.imul(this.innerGap, 4))) | 0);
    g.translate$int$int(-((this.squareSize + this.squareGap) | 0), 0);
    g.translate$int$int((this.squareSize + this.squareGap) | 0, (this.squareSize + this.squareGap) | 0);
    g.setColor(Color.white);
    g.fillRect(squareXOffset, 0, this.squareSize, this.squareSize);
    g.setColor(color);
    g.fillRect((squareXOffset + this.innerGap) | 0, this.innerGap, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0);
    g.translate$int$int(-((this.squareSize + this.squareGap) | 0), -((this.squareSize + this.squareGap) | 0));
    g.translate$int$int(Math.imul(((this.squareSize + this.squareGap) | 0), 2), 0);
    g.setColor(Color.white);
    g.fillRect(squareXOffset, 0, this.squareSize, this.squareSize);
    g.setColor(color);
    g.fillRect((squareXOffset + this.innerGap) | 0, this.innerGap, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0);
    g.setColor(Color.black);
    g.fillRect((squareXOffset + Math.imul(this.innerGap, 2)) | 0, Math.imul(this.innerGap, 2), (this.squareSize - (Math.imul(this.innerGap, 4))) | 0, (this.squareSize - (Math.imul(this.innerGap, 4))) | 0);
    g.translate$int$int(-(Math.imul(((this.squareSize + this.squareGap) | 0), 2)), 0);
    g.translate$int$int(Math.imul(((this.squareSize + this.squareGap) | 0), 2), ((this.squareSize + this.squareGap) | 0));
    g.setColor(Color.black);
    g.fillRect(squareXOffset, 0, this.squareSize, this.squareSize);
    g.setColor(color);
    g.fillRect((squareXOffset + this.innerGap) | 0, this.innerGap, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0, (this.squareSize - (Math.imul(this.innerGap, 2))) | 0);
    g.translate$int$int(-(Math.imul(((this.squareSize + this.squareGap) | 0), 2)), -((this.squareSize + this.squareGap) | 0));
    return ((Math.imul(this.squareSize, 3) + Math.imul(this.squareGap, 2)) | 0);
  }
  getSampleText(): string {
    if (this.sampleText == null) {
      this.sampleText = UIManager.getString$Object$Locale('ColorChooser.sampleText', this.getLocale$());
    }
    return this.sampleText;
  }
}

$J.define(DefaultPreviewPanel, 'javax.swing.colorchooser.DefaultPreviewPanel', { kind: 'class', sup: 'javax.swing.JPanel', ctors: { '': '_DefaultPreviewPanel' }, meths: { 'getPreferredSize()': 'getPreferredSize$' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  Font = $J.load('java.awt.Font');
  JColorChooser = $J.load('javax.swing.JColorChooser');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
