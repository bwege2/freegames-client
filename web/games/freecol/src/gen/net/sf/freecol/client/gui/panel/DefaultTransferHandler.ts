// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/DefaultTransferHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, DataFlavor, Exception, JObject, Logger, RuntimeException, Toolkit } from '../../../../../../../jre/index.ts';
import { TransferHandler } from '../../../../../../javax/swing/TransferHandler.ts';
import { DragGestureRecognizer } from '../../../../../../java/awt/dnd/DragGestureRecognizer.ts';

let Point, DragSource, MouseEvent, ImageIcon, JComponent, JLabel, JPanel, AbstractGoodsLabel, AbstractGoodsLabel$AmountType, Draggable, GoodsLabel, GoodsTypeLabel, MarketLabel, UnitLabel, CargoPanel, DropTarget, GoodsTypePanel, ImageSelection, InPortPanel, PortPanel, Ability, GoodsContainer, GoodsLocation, CollectionUtils, ImageUtils;

/**
 * A {@code TransferHandler} for {@code ImageSelection} {@code Transferable}s.
 *
 * The DefaultTransferHandler should be attached to JPanels or custom JLabels.
 */
export class DefaultTransferHandler extends TransferHandler {
  static logger: Logger = null;
  static flavor: DataFlavor = null;
  static recognizer: DefaultTransferHandler$FreeColDragGestureRecognizer = null;
  /**
   * The enclosing client.
   */
  freeColClient: FreeColClient = null;
  /**
   * The panel where the transfer begins.
   */
  parentPanel: FreeColPanel = null;
  /**
   * Creates the default FreeCol transfer handler.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param parentPanel The layered pane that holds all kinds of information.
   */
  _DefaultTransferHandler(freeColClient: FreeColClient, parentPanel: FreeColPanel): this {
    this._TransferHandler$();
    this.freeColClient = freeColClient;
    this.parentPanel = parentPanel;
    return this;
  }
  getDropTarget(component: JComponent): JComponent {
    return ($J.isa(component, DropTarget)) ? component : (component.getParent() instanceof JComponent) ? this.getDropTarget(component.getParent()) : null;
  }
  restoreSelection(oldSelectedUnit: UnitLabel): void {
    if (oldSelectedUnit != null && oldSelectedUnit.getParent() instanceof InPortPanel) {
      (this.parentPanel).setSelectedUnitLabel(oldSelectedUnit);
    }
  }
  equipUnitIfPossible(unitLabel: UnitLabel, goods: AbstractGoods): boolean {
    let unit = unitLabel.getUnit();
    if (!unit.hasAbility$String(Ability.CAN_BE_EQUIPPED) || unit.getRole().hasAbility$String(Ability.ESTABLISH_MISSION)) {
      return false;
    }
    for (const $it0 = (CollectionUtils.transform$Stream$Predicate(unit.getAvailableRoles(null), (r) => !r.isDefaultRole())).iterator(); $it0.hasNext(); ) {
      let role = $it0.next();
      let required = unit.getGoodsDifference(role, 1);
      let count: number;
      if (required.size() === 1 && required.get(0).getType() === goods.getType() && (count = Math.min(role.getMaximumCount(), $J.idiv(goods.getAmount(), required.get(0).getAmount()))) > 0 && (role !== unit.getRole() || count !== unit.getRoleCount())) {
        this.freeColClient.getInGameController().equipUnitForRole(unit, role, count);
        unitLabel.updateIcon();
        return true;
      }
    }
    return false;
  }
  /**
   * Displays an input dialog box where the user should specify a
   * goods transfer amount.
   *
   * @param goodsType The {@code GoodsType} to transfer.
   * @param available The amount of goods available.
   * @param defaultAmount The default amount of goods to offer.
   * @param needToPay If true limit by available funds.
   * @return The selected amount of goods.
   */
  getAmount(goodsType: GoodsType, available: number, defaultAmount: number, needToPay: boolean): number {
    return this.freeColClient.getGUI().showSelectAmountDialog(goodsType, available, defaultAmount, needToPay);
  }
  /**
   * Complain about import failure.
   *
   * @param comp The importing component.
   * @param data A description of the data being imported.
   * @return Always false.
   */
  importFail(comp: JComponent, data: string): boolean {
    DefaultTransferHandler.logger.warning('Transfer of ' + data + ' invalid at: ' + $J.str(comp));
    return false;
  }
  /**
   * Import goods type specified by label to a component.
   *
   * @param comp The component to import to.
   * @param label The {@code GoodsTypeLabel} specifying the goods.
   * @return True if the import succeeds.
   */
  importGoodsType(comp: JComponent, label: GoodsTypeLabel): boolean {
    if (comp instanceof GoodsTypePanel) {
      let gtp = comp;
      let gt = label.getType();
      if (!gtp.accepts$GoodsType(gt)) {
        return this.importFail(gtp, 'unacceptable goods type: ' + $J.str(gt));
      }
      return gtp.add$Component$boolean(label, false) != null;
    }
    return false;
  }
  /**
   * Import goods specified by label to a component.
   *
   * @param comp The component to import to.
   * @param label The {@code GoodsLabel} specifying the goods.
   * @param oldSelectedUnit A label for the old {@code Unit} to restore
   *     selection to.
   * @return True if the import succeeds.
   */
  importGoods(comp: JComponent, label: GoodsLabel, oldSelectedUnit: UnitLabel): boolean {
    let goods = label.getGoods();
    if (!(comp instanceof UnitLabel) && !($J.isa(comp, DropTarget))) {
      return this.importFail(comp, 'goods');
    }
    if (label.isSuperFullChosen()) {
      if (goods.getLocation() instanceof GoodsLocation) {
        let loc = goods.getLocation();
        let amountToTransfer = loc.getGoodsCount(goods.getType());
        if ($J.isa(comp, DropTarget)) {
          let dt = comp;
          if (dt instanceof CargoPanel) {
            let cp = dt;
            let carrier = cp.getCarrier();
            let spaceTaken = carrier.getCargoSpaceTaken();
            let availableHolds = (carrier.getCargoCapacity() - spaceTaken) | 0;
            if (amountToTransfer > Math.imul(GoodsContainer.CARGO_SIZE, availableHolds)) {
              amountToTransfer = Math.imul(GoodsContainer.CARGO_SIZE, availableHolds);
              label.setAmount(amountToTransfer);
            }
          }
        }
      }
    } else if (label.isPartialChosen()) {
      let defaultAmount = goods.getAmount();
      if (goods.getLocation() instanceof GoodsLocation) {
        let loc = goods.getLocation();
        if (goods.getAmount() > loc.getGoodsCapacity()) {
          defaultAmount = Math.min(GoodsContainer.CARGO_SIZE, (goods.getAmount() - loc.getGoodsCapacity()) | 0);
        }
      }
      if ($J.isa(comp, DropTarget)) {
        let alt = (comp).suggested(goods.getType());
        if (alt >= 0 && alt < defaultAmount) {
          defaultAmount = alt;
        }
      }
      if ($J.isa(comp, DropTarget)) {
        let origAmount = goods.getAmount();
        let target = comp;
        goods.setAmount(defaultAmount);
        if (defaultAmount <= 0 || !target.accepts$Goods(goods)) {
          return this.importFail(comp, 'unacceptable goods pre dialog (' + $J.str(goods) + ')');
        }
        goods.setAmount(origAmount);
      }
      let amount = this.getAmount(goods.getType(), goods.getAmount(), defaultAmount, false);
      if (amount <= 0) {
        return this.importFail(comp, 'weird goods amount (' + amount + ')');
      }
      goods.setAmount(amount);
    } else if (label.isFullChosen()) {
    } else if (goods.getAmount() > GoodsContainer.CARGO_SIZE) {
      goods.setAmount(GoodsContainer.CARGO_SIZE);
    }
    if (comp instanceof UnitLabel) {
      return this.equipUnitIfPossible(comp, goods);
    } else if ($J.isa(comp, DropTarget)) {
      let target = comp;
      if (!target.accepts$Goods(goods)) {
        return this.importFail(comp, 'unacceptable goods (' + $J.str(goods) + ')');
      }
      target.add$Component$boolean(label, true);
      this.restoreSelection(oldSelectedUnit);
      comp.revalidate();
      return true;
    }
    return this.importFail(comp, 'goods');
  }
  /**
   * Import from a market specified by label to a component.
   *
   * @param comp The component to import to.
   * @param label The {@code MarketLabel} specifying the goods.
   * @return True if the import succeeds.
   */
  importMarket(comp: JComponent, label: MarketLabel): boolean {
    if (!(comp instanceof UnitLabel) && !(comp instanceof CargoPanel)) {
      return false;
    }
    if (label.isPartialChosen()) {
      if (comp instanceof CargoPanel) {
        let cargoPanel = comp;
        if (cargoPanel.getCarrier() == null) {
          return false;
        }
        if (cargoPanel.getCarrier().getLoadableAmount(label.getType()) <= 0) {
          return false;
        }
      }
      let amount = this.getAmount(label.getType(), label.getAmount(), -1, true);
      if (amount <= 0) {
        return false;
      }
      label.setAmount(amount);
    }
    if (comp instanceof UnitLabel) {
      if (this.equipUnitIfPossible(comp, label.getAbstractGoods())) {
        return true;
      }
      if (comp.getParent() instanceof JComponent) {
        comp = comp.getParent();
      } else {
        return this.importFail(comp, 'equipping market goods');
      }
    }
    if (comp instanceof CargoPanel) {
      (comp).add$Component$boolean(label, true);
      comp.revalidate();
      return true;
    }
    return this.importFail(comp, 'market goods');
  }
  /**
   * Import a unit specified by its label to a component.
   *
   * @param comp The component to import to.
   * @param label The {@code UnitLabel} specifying the unit.
   * @param oldSelectedUnit A label for the old {@code Unit} to restore
   *     selection to.
   * @return True if the import succeeds.
   */
  importUnit(comp: JComponent, label: UnitLabel, oldSelectedUnit: UnitLabel): boolean {
    if (!($J.isa(comp, DropTarget))) {
      return this.importFail(comp, 'unit');
    }
    let target = comp;
    let unit = label.getUnit();
    if (!target.accepts$Unit(unit)) {
      return this.importFail(comp, 'unacceptable unit (' + $J.str(unit) + ')');
    }
    target.add$Component$boolean(label, true);
    this.restoreSelection(oldSelectedUnit);
    comp.revalidate();
    return true;
  }
  /**
   * {@inheritDoc}
   */
  canImport$JComponent$DataFlavorArr(comp: JComponent, flavor: DataFlavor[]): boolean {
    return (comp instanceof JPanel || comp instanceof JLabel) && CollectionUtils.any$ObjectArr$Predicate(flavor, CollectionUtils.matchKeyEquals$Object(DefaultTransferHandler.flavor));
  }
  /**
   * {@inheritDoc}
   */
  createTransferable(comp: JComponent): Transferable {
    return (comp instanceof JLabel) ? new ImageSelection()._ImageSelection(comp) : null;
  }
  /**
   * {@inheritDoc}
   */
  exportAsDrag(comp: JComponent, e: InputEvent, action: number): void {
    let srcActions = this.getSourceActions(comp);
    let dragAction = (e instanceof MouseEvent) ? (srcActions & action) : TransferHandler.NONE;
    if (dragAction !== TransferHandler.NONE) {
      DefaultTransferHandler.recognizer.gestured(comp, e, srcActions, dragAction);
    } else {
      this.exportDone(comp, null, TransferHandler.NONE);
    }
  }
  /**
   * {@inheritDoc}
   */
  getSourceActions(comp: JComponent): number {
    return TransferHandler.COPY_OR_MOVE;
  }
  /**
   * {@inheritDoc}
   */
  importData$JComponent$Transferable(comp: JComponent, t: Transferable): boolean {
    if (!t.isDataFlavorSupported(DefaultTransferHandler.flavor)) {
      return this.importFail(comp, 'data flavor');
    }
    let ret: boolean;
    let oldSelectedUnit = null;
    try {
      let data = t.getTransferData(DefaultTransferHandler.flavor);
      if (comp === data) {
        return false;
      }
      if (comp instanceof AbstractGoodsLabel || comp instanceof GoodsTypeLabel) {
        comp = this.getDropTarget(comp);
      } else if (comp instanceof UnitLabel) {
        let unitLabel = comp;
        if (unitLabel.getUnit().isCarrier() && unitLabel.getParent() instanceof InPortPanel && this.parentPanel instanceof PortPanel) {
          let portPanel = this.parentPanel;
          if ($J.isa(data, Draggable) && (data).isOnCarrier()) {
            oldSelectedUnit = portPanel.getSelectedUnitLabel();
          }
          portPanel.setSelectedUnitLabel(unitLabel);
          comp = portPanel.getCargoPanel();
        } else if (data instanceof AbstractGoodsLabel && unitLabel.getUnit().hasAbility$String(Ability.CAN_BE_EQUIPPED)) {
        } else {
          comp = this.getDropTarget(comp);
        }
      }
      ret = (data.getParent() === comp) ? this.importFail(comp, 'data-already-present') : (data instanceof GoodsTypeLabel) ? this.importGoodsType(comp, data) : (data instanceof GoodsLabel) ? this.importGoods(comp, data, oldSelectedUnit) : (data instanceof MarketLabel) ? this.importMarket(comp, data) : (data instanceof UnitLabel) ? this.importUnit(comp, data, oldSelectedUnit) : this.importFail(comp, data.toString());
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        ret = this.importFail(comp, 'crash: ' + $J.str(e));
      } else {
        throw $e1;
      }
    }
    return ret;
  }
  static $clinit() {
    DefaultTransferHandler.logger = Logger.getLogger($J.cls(DefaultTransferHandler).getName());
    DefaultTransferHandler.flavor = new DataFlavor($J.cls(ImageSelection), 'ImageSelection');
    DefaultTransferHandler.recognizer = new DefaultTransferHandler$FreeColDragGestureRecognizer()._DefaultTransferHandler$FreeColDragGestureRecognizer(new DefaultTransferHandler$FreeColDragHandler()._DefaultTransferHandler$FreeColDragHandler());
  }
}

/**
 * This is the default drag handler for drag and drop operations that
 * use the {@code TransferHandler}.
 */
export class DefaultTransferHandler$FreeColDragHandler extends JObject {
  scrolls: boolean = false;
  _DefaultTransferHandler$FreeColDragHandler(): this {
    return this;
  }
  updatePartialChosen(comp: JComponent, partial: boolean): void {
    if (comp instanceof AbstractGoodsLabel) {
      if (partial) {
        (comp).setAmountType(AbstractGoodsLabel$AmountType.PARTIAL);
      }
    }
  }
  /**
   * Get a suitable cursor for the given component.
   *
   * @param c The component to consider.
   * @return A suitable {@code Cursor}, or null on failure.
   */
  getCursor(c: JComponent): Cursor {
    if (c instanceof JLabel && (c).getIcon() instanceof ImageIcon) {
      let tk = Toolkit.getDefaultToolkit();
      let imageIcon = ((c).getIcon());
      let bestSize = tk.getBestCursorSize(imageIcon.getIconWidth(), imageIcon.getIconHeight());
      if (bestSize.width_ === 0 || bestSize.height_ === 0) {
        return null;
      }
      if (bestSize.width_ > bestSize.height_) {
        bestSize.height_ = $J.d2i((((bestSize.width_) / (imageIcon.getIconWidth())) * imageIcon.getIconHeight()));
      } else {
        bestSize.width_ = $J.d2i((((bestSize.height_) / (imageIcon.getIconHeight())) * imageIcon.getIconWidth()));
      }
      let scaled = ImageUtils.createResizedImage$Image$int$int(imageIcon.getImage(), bestSize.width_, bestSize.height_);
      let point = new Point()._Point$int$int($J.idiv(bestSize.width_, 2), $J.idiv(bestSize.height_, 2));
      return tk.createCustomCursor(scaled, point, 'freeColDragIcon');
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  dragGestureRecognized(dge: DragGestureEvent): void {
    let c = dge.getComponent();
    let th = c.getTransferHandler();
    let t = th.createTransferable(c);
    if (t == null) {
      DefaultTransferHandler.logger.warning('Unable to create transferable for: ' + $J.str(dge));
      th.exportDone(c, null, TransferHandler.NONE);
      return;
    }
    this.scrolls = c.getAutoscrolls();
    c.setAutoscrolls(false);
    try {
      let cursor = this.getCursor(c);
      dge.startDrag$Cursor$Transferable$DragSourceListener(cursor, t, this);
    } catch ($e2) {
      if ($J.isa($e2, RuntimeException)) {
        let re = $J.exc($e2);
        c.setAutoscrolls(this.scrolls);
      } else {
        throw $e2;
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  dragEnter(dsde: DragSourceDragEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  dragOver(dsde: DragSourceDragEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  dragExit(dsde: DragSourceEvent): void {
  }
  /**
   * {@inheritDoc}
   */
  dragDropEnd(dsde: DragSourceDropEvent): void {
    let dsc = dsde.getDragSourceContext();
    let c = dsc.getComponent();
    if (c.getTransferHandler() instanceof DefaultTransferHandler) {
      let dth = (c.getTransferHandler());
      if (dsde.getDropSuccess()) {
        dth.exportDone(c, dsc.getTransferable(), dsde.getDropAction());
      } else {
        dth.exportDone(c, null, TransferHandler.NONE);
      }
      c.setAutoscrolls(this.scrolls);
    }
  }
  /**
   * {@inheritDoc}
   */
  dropActionChanged(dsde: DragSourceDragEvent): void {
    let dsc = dsde.getDragSourceContext();
    let comp = dsc.getComponent();
    this.updatePartialChosen(comp, dsde.getUserAction() === TransferHandler.MOVE);
  }
}

export class DefaultTransferHandler$FreeColDragGestureRecognizer extends DragGestureRecognizer {
  _DefaultTransferHandler$FreeColDragGestureRecognizer(dgl: DragGestureListener): this {
    this._DragGestureRecognizer$DragSource$Component$int$DragGestureListener(DragSource.getDefaultDragSource(), null, TransferHandler.NONE, dgl);
    return this;
  }
  gestured(c: JComponent, e: MouseEvent, srcActions: number, action: number): void {
    this.setComponent(c);
    this.setSourceActions(srcActions);
    this.appendEvent(e);
    this.fireDragGestureRecognized(action, e.getPoint());
  }
  /**
   * {@inheritDoc}
   */
  registerListeners(): void {
  }
  /**
   * {@inheritDoc}
   */
  unregisterListeners(): void {
  }
}

$J.define(DefaultTransferHandler, 'net.sf.freecol.client.gui.panel.DefaultTransferHandler', { kind: 'class', sup: 'javax.swing.TransferHandler', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.FreeColPanel': '_DefaultTransferHandler' }, meths: { 'importData(javax.swing.JComponent,java.awt.datatransfer.Transferable)': 'importData$JComponent$Transferable', 'canImport(javax.swing.JComponent,java.awt.datatransfer.DataFlavor[])': 'canImport$JComponent$DataFlavorArr' }, clinit: true, lazy: ['logger', 'flavor', 'recognizer'] });
$J.define(DefaultTransferHandler$FreeColDragHandler, 'net.sf.freecol.client.gui.panel.DefaultTransferHandler$FreeColDragHandler', { kind: 'class', ifaces: ['java.awt.dnd.DragGestureListener', 'java.awt.dnd.DragSourceListener'], sup: 'java.lang.Object', ctors: { '': '_DefaultTransferHandler$FreeColDragHandler' } });
$J.define(DefaultTransferHandler$FreeColDragGestureRecognizer, 'net.sf.freecol.client.gui.panel.DefaultTransferHandler$FreeColDragGestureRecognizer', { kind: 'class', sup: 'java.awt.dnd.DragGestureRecognizer', ctors: { 'java.awt.dnd.DragGestureListener': '_DefaultTransferHandler$FreeColDragGestureRecognizer' } });
$J.module(() => {
  Point = $J.load('java.awt.Point');
  DragSource = $J.load('java.awt.dnd.DragSource');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  AbstractGoodsLabel = $J.load('net.sf.freecol.client.gui.label.AbstractGoodsLabel');
  AbstractGoodsLabel$AmountType = $J.load('net.sf.freecol.client.gui.label.AbstractGoodsLabel$AmountType');
  Draggable = $J.load('net.sf.freecol.client.gui.label.Draggable');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  GoodsTypeLabel = $J.load('net.sf.freecol.client.gui.label.GoodsTypeLabel');
  MarketLabel = $J.load('net.sf.freecol.client.gui.label.MarketLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  CargoPanel = $J.load('net.sf.freecol.client.gui.panel.CargoPanel');
  DropTarget = $J.load('net.sf.freecol.client.gui.panel.DropTarget');
  GoodsTypePanel = $J.load('net.sf.freecol.client.gui.panel.GoodsTypePanel');
  ImageSelection = $J.load('net.sf.freecol.client.gui.panel.ImageSelection');
  InPortPanel = $J.load('net.sf.freecol.client.gui.panel.InPortPanel');
  PortPanel = $J.load('net.sf.freecol.client.gui.panel.PortPanel');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsLocation = $J.load('net.sf.freecol.common.model.GoodsLocation');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
