// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/DragListener.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger, Toolkit } from '../../../../../../../jre/index.ts';
import { MouseAdapter } from '../../../../../../java/awt/event/MouseAdapter.ts';

let MouseEvent, JPopupMenu$Separator, TransferHandler, AbstractGoodsLabel, AbstractGoodsLabel$AmountType, GoodsTypeLabel, UnitLabel, PortPanel, QuickActionMenu, OSUtils;

/**
 * A DragListener should be attached to Swing components that have a
 * TransferHandler attached.  The DragListener will make sure that the
 * Swing component to which it is attached is draggable (moveable to
 * be precise).
 */
export class DragListener extends MouseAdapter {
  static logger: Logger = null;
  /**
   * The maximum numbers of pixels of the user's screen height
   * before triggering the small flag.
   */
  static readonly maxWindowHeight: number = 768;
  /**
   * The user's screen height.
   */
  static windowHeight: number = 0;
  /**
   * Whether the user's screen height is smaller than the maximum
   * height allowed
   */
  static small: boolean = false;
  /**
   * Enable windows workaround.
   */
  windows: boolean = false;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The panel within which the drag occurs.
   */
  parentPanel: FreeColPanel = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param parentPanel The layered pane that contains the
   *     components to which a DragListener might be attached.
   */
  _DragListener(freeColClient: FreeColClient, parentPanel: FreeColPanel): this {
    this._MouseAdapter();
    this.windows = OSUtils.onWindows();
    this.freeColClient = freeColClient;
    this.parentPanel = parentPanel;
    return this;
  }
  /**
   * Gets called when the mouse was pressed on a Swing component
   * that has this object as a MouseListener.
   *
   * @param e The event that holds the information about the mouse click.
   */
  mousePressed(e: MouseEvent): void {
    let comp = e.getSource();
    if (e.getButton() === MouseEvent.BUTTON3 || e.isPopupTrigger()) {
      if (!this.parentPanel.isEditable()) {
        return;
      }
      let menu = new QuickActionMenu()._QuickActionMenu(this.freeColClient, this.parentPanel).addMenuItems(comp);
      while (true) {
        let lastIdx = (menu.getComponentCount() - 1) | 0;
        if (lastIdx < 0 || !(menu.getComponent$int(lastIdx) instanceof JPopupMenu$Separator)) {
          break;
        }
        menu.remove$int(lastIdx);
      }
      if (menu.getComponentCount() <= 0) {
        return;
      }
      let gui = this.freeColClient.getGUI();
      if ((gui.isWindowed() && this.windows) || (DragListener.small && !gui.isWindowed())) {
        gui.showPopupMenu(menu, menu.getLocation$().x_, 0);
      } else {
        menu.show$Component$int$int(comp, e.getX(), e.getY());
      }
      return;
    }
    if (comp instanceof AbstractGoodsLabel) {
      let label = comp;
      if (e.isShiftDown() && e.isAltDown()) {
        let cArr = comp.getParent().getComponents();
        let sum = 0;
        for (let i = 0; i < cArr.length; i++) {
          if (cArr[i] instanceof AbstractGoodsLabel) {
            let abGoods = cArr[i];
            if (abGoods.getAbstractGoods().getType().equals(label.getAbstractGoods().getType())) {
              sum = (sum + abGoods.getAmount()) | 0;
            }
          }
        }
        label.setAmountType(AbstractGoodsLabel$AmountType.SUPER_FULL);
        label.setAmount(sum);
      } else if (e.isShiftDown()) {
        label.setAmountType(AbstractGoodsLabel$AmountType.PARTIAL);
      } else if (e.isControlDown()) {
        label.setAmountType(AbstractGoodsLabel$AmountType.FULL);
      } else {
        label.setAmountType(AbstractGoodsLabel$AmountType.DEFAULT);
        label.setDefaultAmount();
      }
    } else if (comp instanceof UnitLabel) {
      let label = comp;
      let u = label.getUnit();
      if (u.isCarrier() && !u.isAtSea() && this.parentPanel instanceof PortPanel) {
        (this.parentPanel).setSelectedUnitLabel(label);
      }
    } else if (comp instanceof GoodsTypeLabel) {
    } else {
      $J.err.println('DragListener did not recognize:' + $J.str(comp));
    }
    let handler = comp.getTransferHandler();
    if (handler != null) {
      handler.exportAsDrag(comp, e, TransferHandler.COPY);
    }
  }
  static $clinit() {
    DragListener.logger = Logger.getLogger($J.cls(DragListener).getName());
    DragListener.windowHeight = $J.d2i(Math.floor(Toolkit.getDefaultToolkit().getScreenSize().getHeight()));
    DragListener.small = DragListener.windowHeight < DragListener.maxWindowHeight;
  }
}

$J.define(DragListener, 'net.sf.freecol.client.gui.panel.DragListener', { kind: 'class', sup: 'java.awt.event.MouseAdapter', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.FreeColPanel': '_DragListener' }, clinit: true, lazy: ['logger', 'windowHeight', 'small'] });
$J.module(() => {
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  JPopupMenu$Separator = $J.load('javax.swing.JPopupMenu$Separator');
  TransferHandler = $J.load('javax.swing.TransferHandler');
  AbstractGoodsLabel = $J.load('net.sf.freecol.client.gui.label.AbstractGoodsLabel');
  AbstractGoodsLabel$AmountType = $J.load('net.sf.freecol.client.gui.label.AbstractGoodsLabel$AmountType');
  GoodsTypeLabel = $J.load('net.sf.freecol.client.gui.label.GoodsTypeLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  PortPanel = $J.load('net.sf.freecol.client.gui.panel.PortPanel');
  QuickActionMenu = $J.load('net.sf.freecol.client.gui.panel.QuickActionMenu');
  OSUtils = $J.load('net.sf.freecol.common.util.OSUtils');
});
