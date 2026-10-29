// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColOptionPaneUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString } from '../../../../../../../jre/index.ts';
import { BasicOptionPaneUI } from '../../../../../../javax/swing/plaf/basic/BasicOptionPaneUI.ts';

let Dimension, HierarchyEvent, Icon, JButton, SwingUtilities, MigLayout, ChoiceItem, ImageLibrary, MigPanel, Messages, ImageUtils;

/**
 * Draw the "image.background.FreeColOptionPane" resource as a tiled
 * background image.
 */
export class FreeColOptionPaneUI extends BasicOptionPaneUI {
  okIndex: number = 0;
  cancelIndex: number = 0;
  newButtons: List<JButton> = null;
  /**
   * Trivial internal constructor.
   */
  _FreeColOptionPaneUI(): this {
    this._BasicOptionPaneUI();
    this.okIndex = -1;
    this.cancelIndex = -1;
    this.newButtons = null;
    return this;
  }
  /**
   * Choose the number of columns for the OptionPane buttons.
   *
   * @param nButtons The number of buttons.
   * @return A suitable number of columns.
   */
  getColumns(nButtons: number): number {
    return (nButtons > 21) ? 4 : ((nButtons % 4) === 0 && nButtons > 12) ? 4 : ((nButtons % 3) === 0 && nButtons > 6) ? 3 : ((nButtons % 2) === 0 && nButtons > 4) ? 2 : (nButtons > 5) ? 2 : 1;
  }
  /**
   * Prepare the new buttons for this component and cache.
   *
   * @return A list of buttons.
   */
  prepareButtons(): List<JButton> {
    if (this.newButtons != null) {
      return this.newButtons;
    }
    let okLabel = Messages.message$String('ok');
    let cancelLabel = Messages.message$String('cancel');
    let buttons = this.getButtons();
    let newButtons = new ArrayList(buttons.length);
    let maxWidth = 0;
    let maxHeight = 0;
    for (let i = 0; i < buttons.length; i++) {
      let b: JButton;
      if (buttons[i] instanceof ChoiceItem) {
        let ci = buttons[i];
        let label = ci.toString();
        let icon = ci.getIcon();
        b = (label == null || (label.length === 0)) ? new JButton()._JButton$Icon(icon) : new JButton()._JButton$String$Icon(label, icon);
        b.setName('OptionPane.button.' + label);
        if (ci.isOK()) {
          this.okIndex = i;
        } else if (ci.isCancel()) {
          this.cancelIndex = i;
        }
      } else if ($J.isa(buttons[i], Icon)) {
        b = new JButton()._JButton$Icon(buttons[i]);
        b.setName('OptionPane.button.withIcon');
      } else {
        let label = $J.str(buttons[i]);
        b = new JButton()._JButton$String(label);
        b.setName('OptionPane.button.' + label);
        if ($J.equals(okLabel, label)) {
          this.okIndex = i;
        } else if ($J.equals(cancelLabel, label)) {
          this.cancelIndex = i;
        }
      }
      maxWidth = Math.max(maxWidth, b.getMinimumSize$().width_);
      maxHeight = Math.max(maxHeight, b.getMinimumSize$().height_);
      let buttonListener = this.createButtonActionListener(i);
      b.addActionListener(buttonListener);
      newButtons.add(b);
    }
    if (maxWidth > 0) {
      let dimension = new Dimension()._Dimension$int$int(maxWidth, maxHeight);
      for (let i = 0; i < buttons.length; i++) {
        if ($J.isa(buttons[i], Icon)) {
          continue;
        }
        let newb = newButtons.get(i);
        newb.setPreferredSize(dimension);
        newb.setMinimumSize(dimension);
      }
    }
    return newButtons;
  }
  /**
   * Get a button by index.
   *
   * @param index The index to look for.
   * @return The corresponding button.
   */
  getButton(index: number): JButton {
    return this.newButtons.get(index);
  }
  /**
   * {@inheritDoc}
   */
  static createUI(c: JComponent): ComponentUI {
    return new FreeColOptionPaneUI()._FreeColOptionPaneUI();
  }
  /**
   * {@inheritDoc}
   */
  createButtonArea(): Container {
    let buttons = this.getButtons();
    let bottom = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String((this.okIndex < 0) ? 'wrap ' + this.getColumns(buttons.length) : 'insets dialog'));
    bottom.setOpaque(false);
    bottom.setName('OptionPane.buttonArea');
    this.addButtonComponents(bottom, buttons, this.getInitialValueIndex());
    bottom.setSize$Dimension(bottom.getPreferredSize$());
    return bottom;
  }
  /**
   * {@inheritDoc}
   */
  addButtonComponents(container: Container, buttons: any[], initialIndex: number): void {
    if (buttons == null) {
      return;
    }
    this.newButtons = this.prepareButtons();
    let nButtons = this.newButtons.size();
    if (0 <= initialIndex && initialIndex < nButtons) {
      let b = this.getButton(initialIndex);
      this.initialFocusComponent = b;
      b.addHierarchyListener((e) => {
        if (($J.land(e.getChangeFlags(), HierarchyEvent.PARENT_CHANGED)) !== 0) {
          let button = e.getComponent();
          let root = SwingUtilities.getRootPane(button);
          if (root != null) {
            root.setDefaultButton(button);
          }
        }
      });
    }
    if (this.okIndex >= 0) {
      if (this.cancelIndex >= 0) {
        container.add$Component$Object(this.getButton(this.cancelIndex), 'tag cancel');
      }
      container.add$Component$Object(this.getButton(this.okIndex), 'tag ok');
      for (let i = 0; i < nButtons; i++) {
        if (i === this.okIndex || i === this.cancelIndex) {
          continue;
        }
        container.add$Component(this.getButton(i));
      }
    } else {
      for (let i = 0; i < nButtons; i++) {
        if (i === this.cancelIndex) {
          continue;
        }
        container.add$Component(this.getButton(i));
      }
      if (this.cancelIndex >= 0) {
        container.add$Component$Object(this.getButton(this.cancelIndex), 'newline 20, tag cancel');
      }
    }
    let prefer = container.getPreferredSize$();
    prefer = new Dimension()._Dimension$int$int($J.d2i((prefer.getWidth() + 100)), $J.d2i(prefer.getHeight()));
    container.setMinimumSize(prefer);
    container.setPreferredSize(prefer);
  }
  /**
   * {@inheritDoc}
   */
  selectInitialValue(op: JOptionPane): void {
    if (this.initialFocusComponent != null) {
      this.initialFocusComponent.requestFocus$();
      if (this.initialFocusComponent instanceof JButton) {
        let root = SwingUtilities.getRootPane(this.initialFocusComponent);
        if (root != null) {
          root.setDefaultButton(this.initialFocusComponent);
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  paint(g: Graphics, c: JComponent): void {
    if (c.isOpaque()) {
      ImageUtils.drawTiledImage(ImageLibrary.getOptionPaneBackground(), g, c, null);
    }
  }
}

$J.define(FreeColOptionPaneUI, 'net.sf.freecol.client.gui.plaf.FreeColOptionPaneUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicOptionPaneUI', ctors: { '': '_FreeColOptionPaneUI' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  Icon = $J.load('javax.swing.Icon');
  JButton = $J.load('javax.swing.JButton');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
