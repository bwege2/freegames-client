// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JColorChooser.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../jre/index.ts';
import { JDialog } from './JDialog.ts';
import { WindowAdapter } from '../../java/awt/event/WindowAdapter.ts';
import { ComponentAdapter } from '../../java/awt/event/ComponentAdapter.ts';

let BorderLayout, FlowLayout, KeyEvent, AbstractAction, JButton, JComponent, JPanel, JRootPane, KeyStroke, UIManager, SwingUtilities2;

export class ColorChooserDialog extends JDialog {
  initialColor: Color = null;
  chooserPane: JColorChooser = null;
  cancelButton: JButton = null;
  _ColorChooserDialog$Dialog$String$boolean$Component$JColorChooser$ActionListener$ActionListener(owner: Dialog, title: string, modal: boolean, c: Component, chooserPane: JColorChooser, okListener: ActionListener, cancelListener: ActionListener): this {
    this._JDialog$Dialog$String$boolean(owner, title, modal);
    this.initColorChooserDialog(c, chooserPane, okListener, cancelListener);
    return this;
  }
  _ColorChooserDialog$Frame$String$boolean$Component$JColorChooser$ActionListener$ActionListener(owner: Frame, title: string, modal: boolean, c: Component, chooserPane: JColorChooser, okListener: ActionListener, cancelListener: ActionListener): this {
    this._JDialog$Frame$String$boolean(owner, title, modal);
    this.initColorChooserDialog(c, chooserPane, okListener, cancelListener);
    return this;
  }
  initColorChooserDialog(c: Component, chooserPane: JColorChooser, okListener: ActionListener, cancelListener: ActionListener): void {
    this.chooserPane = chooserPane;
    let locale = this.getLocale$();
    let okString = UIManager.getString$Object$Locale('ColorChooser.okText', locale);
    let cancelString = UIManager.getString$Object$Locale('ColorChooser.cancelText', locale);
    let resetString = UIManager.getString$Object$Locale('ColorChooser.resetText', locale);
    let contentPane = this.getContentPane();
    contentPane.setLayout(new BorderLayout()._BorderLayout$());
    contentPane.add$Component$Object(chooserPane, BorderLayout.CENTER);
    let buttonPane = new JPanel()._JPanel$();
    buttonPane.setLayout(new FlowLayout()._FlowLayout$int(FlowLayout.CENTER));
    let okButton = new JButton()._JButton$String(okString);
    this.getRootPane().setDefaultButton(okButton);
    okButton.getAccessibleContext().setAccessibleDescription(okString);
    okButton.setActionCommand('OK');
    okButton.addActionListener((e) => {
      this.hide();
    });
    if (okListener != null) {
      okButton.addActionListener(okListener);
    }
    buttonPane.add$Component(okButton);
    this.cancelButton = new JButton()._JButton$String(cancelString);
    this.cancelButton.getAccessibleContext().setAccessibleDescription(cancelString);
    let cancelKeyAction = new (ColorChooserDialog$2())().$o(this)._AbstractAction$();
    let cancelKeyStroke = KeyStroke.getKeyStroke$int$int(KeyEvent.VK_ESCAPE, 0);
    let inputMap = this.cancelButton.getInputMap$int(JComponent.WHEN_IN_FOCUSED_WINDOW);
    let actionMap = this.cancelButton.getActionMap$();
    if (inputMap != null && actionMap != null) {
      inputMap.put(cancelKeyStroke, 'cancel');
      actionMap.put$Object$Action('cancel', cancelKeyAction);
    }
    this.cancelButton.setActionCommand('cancel');
    this.cancelButton.addActionListener((e) => {
      this.hide();
    });
    if (cancelListener != null) {
      this.cancelButton.addActionListener(cancelListener);
    }
    buttonPane.add$Component(this.cancelButton);
    let resetButton = new JButton()._JButton$String(resetString);
    resetButton.getAccessibleContext().setAccessibleDescription(resetString);
    resetButton.addActionListener((e) => {
      this.reset();
    });
    let mnemonic = SwingUtilities2.getUIDefaultsInt$Object$Locale$int('ColorChooser.resetMnemonic', locale, -1);
    if (mnemonic !== -1) {
      resetButton.setMnemonic$int(mnemonic);
    }
    buttonPane.add$Component(resetButton);
    contentPane.add$Component$Object(buttonPane, BorderLayout.SOUTH);
    if (JDialog.isDefaultLookAndFeelDecorated()) {
      let supportsWindowDecorations = UIManager.getLookAndFeel().getSupportsWindowDecorations();
      if (supportsWindowDecorations) {
        this.getRootPane().setWindowDecorationStyle(JRootPane.COLOR_CHOOSER_DIALOG);
      }
    }
    this.applyComponentOrientation(((c == null) ? this.getRootPane() : c).getComponentOrientation());
    this.pack();
    this.setLocationRelativeTo(c);
    this.addWindowListener(new ColorChooserDialog$Closer().$o(this)._ColorChooserDialog$Closer());
  }
  show$(): void {
    this.initialColor = this.chooserPane.getColor();
    super.show$();
  }
  reset(): void {
    this.chooserPane.setColor$Color(this.initialColor);
  }
}

export class ColorChooserDialog$Closer extends WindowAdapter {
  _ColorChooserDialog$Closer(): this {
    this._WindowAdapter();
    return this;
  }
  windowClosing(e: WindowEvent): void {
    this.$outer.cancelButton.doClick$int(0);
    let w = e.getWindow();
    w.hide();
  }
}

export class ColorChooserDialog$DisposeOnClose extends ComponentAdapter {
  _ColorChooserDialog$DisposeOnClose(): this {
    this._ComponentAdapter();
    return this;
  }
  componentHidden(e: ComponentEvent): void {
    let w = e.getComponent();
    w.dispose();
  }
}

let $ColorChooserDialog$2: any = null;
/** An anonymous class (JColorChooser.java:718). */
function ColorChooserDialog$2(): any {
  return $ColorChooserDialog$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(e: ActionEvent): void {
      (e.getSource()).fireActionPerformed(e);
    }
  }, 'javax.swing.ColorChooserDialog$2', []);
}

$J.define(ColorChooserDialog, 'javax.swing.ColorChooserDialog', { kind: 'class', sup: 'javax.swing.JDialog', ctors: { 'java.awt.Frame,java.lang.String,boolean,java.awt.Component,javax.swing.JColorChooser,java.awt.event.ActionListener,java.awt.event.ActionListener': '_ColorChooserDialog$Frame$String$boolean$Component$JColorChooser$ActionListener$ActionListener', 'java.awt.Dialog,java.lang.String,boolean,java.awt.Component,javax.swing.JColorChooser,java.awt.event.ActionListener,java.awt.event.ActionListener': '_ColorChooserDialog$Dialog$String$boolean$Component$JColorChooser$ActionListener$ActionListener' }, meths: { 'show()': 'show$' } });
$J.define(ColorChooserDialog$Closer, 'javax.swing.ColorChooserDialog$Closer', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.event.WindowAdapter', ctors: { '': '_ColorChooserDialog$Closer' }, inner: true });
$J.define(ColorChooserDialog$DisposeOnClose, 'javax.swing.ColorChooserDialog$DisposeOnClose', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.awt.event.ComponentAdapter', ctors: { '': '_ColorChooserDialog$DisposeOnClose' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  FlowLayout = $J.load('java.awt.FlowLayout');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JButton = $J.load('javax.swing.JButton');
  JComponent = $J.load('javax.swing.JComponent');
  JPanel = $J.load('javax.swing.JPanel');
  JRootPane = $J.load('javax.swing.JRootPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  UIManager = $J.load('javax.swing.UIManager');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
