// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/FrameMotionListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J } from '../../../../../../jre/index.ts';
import { MouseAdapter } from '../../../../../java/awt/event/MouseAdapter.ts';

let SwingUtilities, Canvas;

/**
 * The mouse adapter to handle frame movement.
 */
export class FrameMotionListener extends MouseAdapter {
  f: JInternalFrame = null;
  loc: Point = null;
  /**
   * Build a new frame motion listener.
   *
   * @param f The base internal frame.
   */
  _FrameMotionListener(f: JInternalFrame): this {
    this._MouseAdapter();
    this.loc = null;
    this.f = f;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  mouseDragged(e: MouseEvent): void {
    if (this.loc == null || this.f.getDesktopPane() == null || this.f.getDesktopPane().getDesktopManager() == null) {
      return;
    }
    let p = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    let moveX = (this.loc.x_ - p.x_) | 0;
    let moveY = (this.loc.y_ - p.y_) | 0;
    this.f.getDesktopPane().getDesktopManager().dragFrame(this.f, (this.f.getX() - moveX) | 0, (this.f.getY() - moveY) | 0);
    this.loc = p;
    this.f.putClientProperty(Canvas.PROPERTY_POPUP_POSITION, null);
  }
  /**
   * {@inheritDoc}
   */
  mousePressed(e: MouseEvent): void {
    if (this.f.getDesktopPane() == null || this.f.getDesktopPane().getDesktopManager() == null) {
      return;
    }
    this.loc = SwingUtilities.convertPoint$Component$int$int$Component(e.getSource(), e.getX(), e.getY(), null);
    this.f.getDesktopPane().getDesktopManager().beginDraggingFrame(this.f);
  }
  /**
   * {@inheritDoc}
   */
  mouseReleased(e: MouseEvent): void {
    if (this.loc == null || this.f.getDesktopPane() == null || this.f.getDesktopPane().getDesktopManager() == null) {
      return;
    }
    this.f.getDesktopPane().getDesktopManager().endDraggingFrame(this.f);
  }
}

$J.define(FrameMotionListener, 'net.sf.freecol.client.gui.FrameMotionListener', { kind: 'class', sup: 'java.awt.event.MouseAdapter', ctors: { 'javax.swing.JInternalFrame': '_FrameMotionListener' } });
$J.module(() => {
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Canvas = $J.load('net.sf.freecol.client.gui.Canvas');
});
