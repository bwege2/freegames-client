// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/CanvasMapEditorMouseListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, Level, Logger } from '../../../../../../jre/index.ts';
import { FreeColClientHolder } from '../control/FreeColClientHolder.ts';

let Color, MouseEvent, MapEditorTransformPanel$TileTypeTransform, TerrainGenerator;

/**
 * Listens to the mouse being moved at the level of the Canvas.
 */
export class CanvasMapEditorMouseListener extends FreeColClientHolder {
  static logger: Logger = null;
  scrolling: Scrolling = null;
  endPoint: Point = null;
  startPoint: Point = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The enclosing {@code FreeColClient}.
   */
  _CanvasMapEditorMouseListener(freeColClient: FreeColClient, scrolling: Scrolling): this {
    this._FreeColClientHolder(freeColClient);
    this.scrolling = scrolling;
    return this;
  }
  /**
   * Draw a box on screen.
   *
   * @param component The {@code JComponent} to draw on.
   * @param startPoint The starting {@code Point}.
   * @param endPoint The end {@code Point}.
   */
  drawBox(component: JComponent, startPoint: Point, endPoint: Point): void {
    if (startPoint == null || endPoint == null || startPoint.distance$Point2D(endPoint) === 0 || this.getFreeColClient().getMapEditorController() == null) {
      return;
    }
    let graphics = component.getGraphics();
    graphics.setColor(Color.WHITE);
    let x = Math.min(startPoint.x_, endPoint.x_);
    let y = Math.min(startPoint.y_, endPoint.y_);
    let width = Math.abs((startPoint.x_ - endPoint.x_) | 0);
    let height = Math.abs((startPoint.y_ - endPoint.y_) | 0);
    graphics.drawRect(x, y, width, height);
  }
  /**
   * {@inheritDoc}
   */
  mouseClicked(e: MouseEvent): void {
    if (this.getMap() == null) {
      return;
    }
    try {
      if (e.getClickCount() > 1) {
        let t = this.getGUI().tileAt(e.getX(), e.getY());
        if (t != null) {
          this.getGUI().showTilePanel(t);
        }
      }
    } catch ($e0) {
      if ($J.isa($e0, Exception)) {
        let ex = $J.exc($e0);
        CanvasMapEditorMouseListener.logger.log(Level.WARNING, 'Error in mouseClicked!', ex);
      } else {
        throw $e0;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  mousePressed(e: MouseEvent): void {
    if (this.getMap() == null || !e.getComponent().isEnabled()) {
      return;
    }
    try {
      if (e.getButton() === MouseEvent.BUTTON1) {
        let tile = this.getGUI().tileAt(e.getX(), e.getY());
        if (tile != null) {
          this.getGUI().changeView$Tile(tile);
        }
        this.startPoint = this.endPoint = null;
      } else if (e.getButton() === MouseEvent.BUTTON2) {
        this.startPoint = this.endPoint = e.getPoint();
        let component = e.getSource();
        this.drawBox(component, this.startPoint, this.endPoint);
      } else if (e.getButton() === MouseEvent.BUTTON3 || e.isPopupTrigger()) {
        this.startPoint = this.endPoint = e.getPoint();
        let tile = this.getGUI().tileAt(e.getX(), e.getY());
        if (tile != null) {
          if (tile.getIndianSettlement() != null) {
            this.getGUI().showEditSettlementDialog(tile.getIndianSettlement());
          }
        }
      }
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let ex = $J.exc($e1);
        CanvasMapEditorMouseListener.logger.log(Level.WARNING, 'Error in mousePressed!', ex);
      } else {
        throw $e1;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  mouseReleased(e: MouseEvent): void {
    if (this.getMap() == null || e.getButton() === MouseEvent.BUTTON1) {
      return;
    }
    let component = e.getSource();
    let controller = this.getFreeColClient().getMapEditorController();
    let isTransformActive = controller.getMapTransform() != null;
    this.endPoint = e.getPoint();
    if (this.startPoint == null) {
      this.startPoint = this.endPoint;
    }
    this.drawBox(component, this.startPoint, this.endPoint);
    let start = this.getGUI().tileAt(this.startPoint.x_, this.startPoint.y_);
    let end = (this.startPoint === this.endPoint) ? start : this.getGUI().tileAt(this.endPoint.x_, this.endPoint.y_);
    if (!isTransformActive) {
      if (end.getX() >= 0 && end.getY() >= 0) {
        this.getGUI().setFocus(end);
      }
      return;
    }
    let min_x: number;
    let max_x: number;
    let min_y: number;
    let max_y: number;
    if (start.getX() < end.getX()) {
      min_x = start.getX();
      max_x = end.getX();
    } else {
      min_x = end.getX();
      max_x = start.getX();
    }
    if (start.getY() < end.getY()) {
      min_y = start.getY();
      max_y = end.getY();
    } else {
      min_y = end.getY();
      max_y = start.getY();
    }
    let t = null;
    for (let x = min_x; x <= max_x; x++) {
      for (let y = min_y; y <= max_y; y++) {
        t = this.getMap().getTile$int$int(x, y);
        if (t != null) {
          controller.transform(t);
        }
      }
    }
    if (controller.getMapTransform() instanceof MapEditorTransformPanel$TileTypeTransform) {
      for (let x = (min_x - 2) | 0; x <= ((max_x + 2) | 0); x++) {
        for (let y = (min_y - 2) | 0; y <= ((max_y + 2) | 0); y++) {
          t = this.getMap().getTile$int$int(x, y);
          if (t != null && t.getType().isWater()) {
            TerrainGenerator.encodeStyle(t);
          }
        }
      }
    }
    this.getGUI().refresh();
  }
  /**
   * {@inheritDoc}
   */
  mouseEntered(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mouseExited(e: MouseEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  mouseDragged(e: MouseEvent): void {
    if (this.getMap() == null) {
      return;
    }
    let component = e.getSource();
    this.drawBox(component, this.startPoint, this.endPoint);
    this.endPoint = e.getPoint();
    this.drawBox(component, this.startPoint, this.endPoint);
    this.scrolling.performDragScrollIfActive(e);
    this.getGUI().repaint();
  }
  /**
   * {@inheritDoc}
   */
  mouseMoved(e: MouseEvent): void {
    if (this.getMap() == null) {
      return;
    }
    this.scrolling.performAutoScrollIfActive(e);
  }
  static $clinit() {
    CanvasMapEditorMouseListener.logger = Logger.getLogger($J.cls(CanvasMapEditorMouseListener).getName());
  }
}

$J.define(CanvasMapEditorMouseListener, 'net.sf.freecol.client.gui.CanvasMapEditorMouseListener', { kind: 'class', ifaces: ['java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener'], sup: 'net.sf.freecol.client.control.FreeColClientHolder', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.Scrolling': '_CanvasMapEditorMouseListener' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  MapEditorTransformPanel$TileTypeTransform = $J.load('net.sf.freecol.client.gui.panel.MapEditorTransformPanel$TileTypeTransform');
  TerrainGenerator = $J.load('net.sf.freecol.server.generator.TerrainGenerator');
});
