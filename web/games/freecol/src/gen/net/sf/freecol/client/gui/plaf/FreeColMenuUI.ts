// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColMenuUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../../../jre/index.ts';
import { BasicMenuUI } from '../../../../../../javax/swing/plaf/basic/BasicMenuUI.ts';

let AlphaComposite, Color, BorderFactory, JMenuBar, FontLibrary, ImageLibrary, FreeColImageBorder, LAFUtilities, ImageUtils;

/**
 * UI-class for menu items.
 */
export class FreeColMenuUI extends BasicMenuUI {
  ancestorListener: AncestorListener = null;
  topLevelMenuItem: boolean = false;
  _FreeColMenuUI(): this {
    this._BasicMenuUI();
    this.ancestorListener = this.createAncestorListener();
    this.topLevelMenuItem = false;
    return this;
  }
  static createUI(c: JComponent): ComponentUI {
    return new FreeColMenuUI()._FreeColMenuUI();
  }
  installUI(c: JComponent): void {
    super.installUI(c);
    c.addAncestorListener(this.ancestorListener);
    c.setOpaque(false);
  }
  paint(g: Graphics, c: JComponent): void {
    LAFUtilities.setProperties(g, c);
    if (this.topLevelMenuItem) {
      let insets = c.getInsets$();
      let g2d = g;
      let oldComposite = g2d.getComposite();
      g2d.setComposite(AlphaComposite.getInstance$int$float(AlphaComposite.SRC_OVER, Math.fround(0.7)));
      ImageUtils.fillTexture(g2d, ImageLibrary.getMenuBackground(), insets.left, insets.top, (c.getWidth() - insets.right - insets.left) | 0, (c.getHeight() - insets.top - insets.bottom) | 0);
      g2d.setComposite(oldComposite);
    }
    super.paint(g, c);
  }
  paintBackground(g: Graphics, menuItem: JMenuItem, bgColor: Color): void {
    if (!this.topLevelMenuItem) {
      super.paintBackground(g, menuItem, bgColor);
      return;
    }
    let model = menuItem.getModel();
    let bgColorModified = (model.isSelected()) ? new Color()._Color$int$int$int$int(255, 255, 255, 128) : bgColor;
    super.paintBackground(g, menuItem, bgColorModified);
  }
  createAncestorListener(): AncestorListener {
    return new (FreeColMenuUI$1())().$o(this);
  }
}

let $FreeColMenuUI$1: any = null;
/** An anonymous class (FreeColMenuUI.java:103). */
function FreeColMenuUI$1(): any {
  return $FreeColMenuUI$1 ??= $J.local(class extends JObject {
    ancestorRemoved(event: AncestorEvent): void {
    }
    ancestorMoved(event: AncestorEvent): void {
    }
    ancestorAdded(event: AncestorEvent): void {
      let c = event.getComponent();
      if (c.getParent() instanceof JMenuBar) {
        let padding = $J.d2i((Math.fround(2 * FontLibrary.getFontScaling())));
        c.setBorder(BorderFactory.createCompoundBorder$Border$Border(BorderFactory.createEmptyBorder$int$int$int$int(padding, padding, padding, padding), FreeColImageBorder.simpleButtonBorder));
        this.$outer.topLevelMenuItem = true;
      } else {
        c.setBorder(null);
        this.$outer.topLevelMenuItem = false;
      }
    }
  }, 'net.sf.freecol.client.gui.plaf.FreeColMenuUI$1', ['javax.swing.event.AncestorListener']);
}

$J.define(FreeColMenuUI, 'net.sf.freecol.client.gui.plaf.FreeColMenuUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicMenuUI', ctors: { '': '_FreeColMenuUI' } });
$J.module(() => {
  AlphaComposite = $J.load('java.awt.AlphaComposite');
  Color = $J.load('java.awt.Color');
  BorderFactory = $J.load('javax.swing.BorderFactory');
  JMenuBar = $J.load('javax.swing.JMenuBar');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  FreeColImageBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColImageBorder');
  LAFUtilities = $J.load('net.sf.freecol.client.gui.plaf.LAFUtilities');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
