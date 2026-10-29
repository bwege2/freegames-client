// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/plaf/FreeColInternalFrameUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/**
 *  Copyright (C) 2002-2024   The FreeCol Team
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
import { $J } from '../../../../../../../jre/index.ts';
import { MetalInternalFrameUI } from '../../../../../../javax/swing/plaf/metal/MetalInternalFrameUI.ts';
import { BasicInternalFrameUI$BorderListener } from '../../../../../../javax/swing/plaf/basic/BasicInternalFrameUI.ts';

let Cursor, SwingUtilities, FreeColBorder;

export class FreeColInternalFrameUI extends MetalInternalFrameUI {
  _FreeColInternalFrameUI(b: JInternalFrame): this {
    this._MetalInternalFrameUI(b);
    return this;
  }
  static createUI(b: JComponent): ComponentUI {
    return new FreeColInternalFrameUI()._FreeColInternalFrameUI(b);
  }
  createBorderListener(w: JInternalFrame): MouseInputAdapter {
    return new FreeColInternalFrameUI$FreeColBorderListener().$o(this)._FreeColInternalFrameUI$FreeColBorderListener();
  }
}

/**
 * Handles areas on the border that should be handled as out-of-bounds for
 * the component. This allows a border to have a non-rectangular shape.
 *
 * Events on areas that are considered out-of-bounds are delegated to the
 * internal frame's parent.
 */
export class FreeColInternalFrameUI$FreeColBorderListener extends BasicInternalFrameUI$BorderListener {
  resizing: boolean = false;
  _FreeColInternalFrameUI$FreeColBorderListener(): this {
    this._BasicInternalFrameUI$BorderListener();
    this.resizing = false;
    return this;
  }
  mousePressed(e: MouseEvent): void {
    if (this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      this.resizing = true;
      super.mousePressed(e);
    }
  }
  mouseReleased(e: MouseEvent): void {
    if (!this.resizing && this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      this.resizing = false;
      super.mouseReleased(e);
    }
  }
  mouseDragged(e: MouseEvent): void {
    if (!this.resizing && this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      super.mouseDragged(e);
    }
  }
  mouseMoved(e: MouseEvent): void {
    if (!this.resizing && this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      super.mouseMoved(e);
    }
  }
  mouseClicked(e: MouseEvent): void {
    if (!this.resizing && this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      super.mouseClicked(e);
    }
  }
  mouseEntered(e: MouseEvent): void {
    if (!this.resizing && this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      super.mouseEntered(e);
    }
  }
  mouseExited(e: MouseEvent): void {
    if (!this.resizing && this.isOutOfBounds(e)) {
      this.handleOutOfBounds(e);
    } else {
      super.mouseExited(e);
    }
  }
  handleOutOfBounds(e: MouseEvent): void {
    this.resetCursor();
    if (this.$outer.frame.getParent() == null) {
      return;
    }
    this.dispatchTo(e, this.$outer.frame.getParent());
  }
  resetCursor(): void {
    let lastCursor = this.$outer.frame.getLastCursor();
    if (lastCursor == null) {
      lastCursor = Cursor.getPredefinedCursor(Cursor.DEFAULT_CURSOR);
    }
    this.$outer.frame.setCursor$Cursor(lastCursor);
  }
  isOutOfBounds(e: MouseEvent): boolean {
    let border = this.$outer.frame.getBorder();
    if (!($J.isa(border, FreeColBorder))) {
      return false;
    }
    let bounds = (border).getOpenSpace(this.$outer.frame);
    return bounds.stream().anyMatch((b) => b.contains$Point(e.getPoint()));
  }
  dispatchTo(e: MouseEvent, target: Component): void {
    let source = e.getSource();
    let targetEvent = SwingUtilities.convertMouseEvent(source, e, target);
    target.dispatchEvent(targetEvent);
  }
}

$J.define(FreeColInternalFrameUI, 'net.sf.freecol.client.gui.plaf.FreeColInternalFrameUI', { kind: 'class', sup: 'javax.swing.plaf.metal.MetalInternalFrameUI', ctors: { 'javax.swing.JInternalFrame': '_FreeColInternalFrameUI' } });
$J.define(FreeColInternalFrameUI$FreeColBorderListener, 'net.sf.freecol.client.gui.plaf.FreeColInternalFrameUI$FreeColBorderListener', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicInternalFrameUI$BorderListener', ctors: { '': '_FreeColInternalFrameUI$FreeColBorderListener' }, inner: true });
$J.module(() => {
  Cursor = $J.load('java.awt.Cursor');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  FreeColBorder = $J.load('net.sf.freecol.client.gui.panel.FreeColBorder');
});
