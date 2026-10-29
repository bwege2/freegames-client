// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/TradeRouteInputPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, DataFlavor, IOException, IllegalStateException, JObject, Level, Logger, RuntimeException, UnsupportedFlavorException } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { JLabel } from '../../../../../../javax/swing/JLabel.ts';
import { GoodsTypePanel } from './GoodsTypePanel.ts';
import { TransferHandler } from '../../../../../../javax/swing/TransferHandler.ts';

let GridLayout, KeyEvent, AbstractAction, DefaultListModel, ImageIcon, JCheckBox, JComboBox, JList, JPanel, JScrollPane, JTextField, SwingConstants, MigLayout, GoodsTypeLabel, DefaultTransferHandler, DragListener, Utility, FreeColSelectedPanelUI, Messages, Colony, Europe, Location, StringTemplate, TradeLocation, TradeRouteStop, CollectionUtils;

/**
 * Allows the user to edit trade routes.
 */
export class TradeRouteInputPanel extends FreeColPanel {
  static logger: Logger = null;
  static STOP_FLAVOR: DataFlavor = null;
  /**
   * The original route passed to this panel.  We are careful not to
   * modify it until we are sure all is well.
   */
  newRoute_: TradeRoute = null;
  /**
   * The TransferHandler for the cargo labels.
   */
  transferHandler: TransferHandler = null;
  /**
   * Mouse listener to use throughout.
   */
  dragListener: MouseListener = null;
  /**
   * Model to contain the current stops.
   */
  stopListModel: DefaultListModel<TradeRouteStop> = null;
  /**
   * The list of stops to show.
   */
  stopList: JList<TradeRouteStop> = null;
  /**
   * The user-editable name of the trade route.
   */
  tradeRouteName: JTextField = null;
  /**
   * A box to select stops to add.
   */
  destinationSelector: JComboBox<string> = null;
  /**
   * Toggle message display.
   */
  messagesBox: JCheckBox = null;
  /**
   * A button to add stops with.
   */
  addStopButton: JButton = null;
  /**
   * A button to remove stops with.
   */
  removeStopButton: JButton = null;
  /**
   * The panel displaying all goods types that could be transported.
   */
  allGoodsTypesPanel: TradeRouteInputPanel$AllGoodsTypesPanel = null;
  /**
   * The panel displaying the goods types to collect at the selected stop.
   */
  stopGoodsTypesPanel: TradeRouteInputPanel$StopGoodsTypesPanel = null;
  /**
   * Create a panel to define trade route cargos.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param newRoute The {@code TradeRoute} to operate on.
   */
  _TradeRouteInputPanel(freeColClient: FreeColClient, newRoute: TradeRoute): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String('wrap 4, fill', '[]20[fill]rel'));
    let game = freeColClient.getGame();
    let player = this.getMyPlayer();
    let tradeRoute = newRoute.copy$Game(game);
    this.newRoute_ = newRoute;
    this.transferHandler = new DefaultTransferHandler()._DefaultTransferHandler(freeColClient, this);
    this.dragListener = new DragListener()._DragListener(freeColClient, this);
    this.stopListModel = new DefaultListModel()._DefaultListModel();
    for (const $it0 = tradeRoute.getStopList().iterator(); $it0.hasNext(); ) {
      let stop = $it0.next();
      this.stopListModel.addElement(stop);
    }
    this.stopList = new JList()._JList$ListModel(this.stopListModel);
    this.stopList.setCellRenderer(new TradeRouteInputPanel$StopRenderer().$o(this)._TradeRouteInputPanel$StopRenderer());
    this.stopList.setDragEnabled(true);
    this.stopList.setTransferHandler(new TradeRouteInputPanel$StopListHandler().$o(this)._TradeRouteInputPanel$StopListHandler());
    this.stopList.addKeyListener(new (TradeRouteInputPanel$1())().$o(this));
    this.stopList.addListSelectionListener($J.fn(this, 'valueChanged'));
    let tradeRouteView = new JScrollPane()._JScrollPane$Component(this.stopList);
    let nameLabel = Utility.localizedLabel$String('tradeRouteInputPanel.nameLabel');
    this.tradeRouteName = new JTextField()._JTextField$String(tradeRoute.getName());
    let destinationLabel = Utility.localizedLabel$String('tradeRouteInputPanel.destinationLabel');
    this.destinationSelector = new JComboBox()._JComboBox$();
    this.destinationSelector.setRenderer(new TradeRouteInputPanel$DestinationCellRenderer().$o(this)._TradeRouteInputPanel$DestinationCellRenderer());
    let template = StringTemplate.template$String('tradeRouteInputPanel.allColonies');
    this.destinationSelector.addItem(Messages.message$StringTemplate(template));
    if (player.getEurope() != null) {
      this.destinationSelector.addItem(player.getEurope().getId());
    }
    for (const $it1 = player.getColonyList().iterator(); $it1.hasNext(); ) {
      let colony = $it1.next();
      this.destinationSelector.addItem(colony.getId());
    }
    this.messagesBox = new JCheckBox()._JCheckBox$String(Messages.message$String('tradeRouteInputPanel.silence'));
    this.messagesBox.setSelected(tradeRoute.isSilent());
    this.messagesBox.addActionListener((ae) => {
      tradeRoute.setSilent(this.messagesBox.isSelected());
    });
    this.addStopButton = Utility.localizedButton$String('tradeRouteInputPanel.addStop');
    this.addStopButton.addActionListener((ae) => {
      this.addSelectedStops();
    });
    this.removeStopButton = Utility.localizedButton$String('tradeRouteInputPanel.removeStop');
    this.removeStopButton.addActionListener((ae) => {
      this.deleteCurrentlySelectedStops();
    });
    let gtl = this.getSpecification().getGoodsTypeList();
    this.allGoodsTypesPanel = new TradeRouteInputPanel$AllGoodsTypesPanel().$o(this)._TradeRouteInputPanel$AllGoodsTypesPanel(CollectionUtils.transform$Collection$Predicate$Function(gtl, ($p0) => $p0.isStorable(), (gt) => this.buildCargoLabel(gt)));
    this.allGoodsTypesPanel.setTransferHandler(this.transferHandler);
    this.allGoodsTypesPanel.setEnabled(false);
    this.stopGoodsTypesPanel = new TradeRouteInputPanel$StopGoodsTypesPanel().$o(this)._TradeRouteInputPanel$StopGoodsTypesPanel();
    this.stopGoodsTypesPanel.setTransferHandler(this.transferHandler);
    let cancelButton = Utility.localizedButton$String('cancel');
    cancelButton.setActionCommand(FreeColPanel.CANCEL);
    cancelButton.addActionListener($J.fn(this, 'actionPerformed'));
    this.setEscapeAction(new (TradeRouteInputPanel$2())().$o(this)._AbstractAction$());
    this.add$Component$Object(Utility.localizedHeader('tradeRouteInputPanel.editRoute', Utility.FONTSPEC_TITLE), 'span, align center');
    this.add$Component$Object(tradeRouteView, 'span 1 5, grow');
    this.add$Component(nameLabel);
    this.add$Component$Object(this.tradeRouteName, 'span');
    this.add$Component(destinationLabel);
    this.add$Component$Object(this.destinationSelector, 'span');
    this.add$Component(this.messagesBox);
    this.add$Component(this.addStopButton);
    this.add$Component$Object(this.removeStopButton, 'span');
    this.add$Component$Object(this.allGoodsTypesPanel, 'span');
    let iconHeight = $J.d2i((Math.fround(80 * this.getImageLibrary().getScaleFactor())));
    this.add$Component$Object(this.stopGoodsTypesPanel, 'span, height ' + iconHeight + 'px:, growy');
    this.add$Component$Object(this.okButton, 'newline 20, span, split 2, tag ok');
    this.add$Component$Object(cancelButton, 'tag cancel');
    this.setEscapeAction(new (TradeRouteInputPanel$3())().$o(this).$c(cancelButton)._AbstractAction$());
    if (this.stopListModel.getSize() > 0) {
      this.stopList.setSelectedIndex(0);
      this.updateCargoPanel(this.stopListModel.firstElement());
    }
    this.updateButtons();
    this.getGUI().restoreSavedSize(this, this.getPreferredSize$());
    return this;
  }
  /**
   * Update the cargo panel to show a given stop.
   *
   * @param stop The {@code TradeRouteStop} to select.
   */
  updateCargoPanel(stop: TradeRouteStop): void {
    this.stopGoodsTypesPanel.setLabels((stop == null) ? null : CollectionUtils.transform$Collection$Predicate$Function(stop.getCargo(), ($p0) => $p0.isStorable(), (gt) => this.buildCargoLabel(gt)));
  }
  /**
   * Import new goods at the selected stops.
   *
   * @param gt The {@code GoodsType} to import.
   */
  enableImport(gt: GoodsType): void {
    if (gt == null) {
      return;
    }
    for (let stopIndex of this.stopList.getSelectedIndices()) {
      let stop = this.stopListModel.get(stopIndex);
      stop.addCargo(gt);
      let idx = this.stopList.getSelectedIndices();
      if (idx.length > 0) {
        this.updateCargoPanel(this.stopListModel.get(idx[0]));
      }
    }
    this.stopList.revalidate();
    this.stopList.repaint$();
  }
  /**
   * Cancel import of goods at the selected stops.
   *
   * @param gt The {@code GoodsType} to stop importing.
   */
  cancelImport(gtl: GoodsTypeLabel): void {
    this.stopGoodsTypesPanel.remove$Component(gtl);
    let gt = gtl.getType();
    for (let stopIndex of this.stopList.getSelectedIndices()) {
      let stop = this.stopListModel.get(stopIndex);
      let cargo = new ArrayList(stop.getCargo());
      let cargoIndex = cargo.indexOf(gt);
      if (cargoIndex >= 0) {
        cargo.removeAt(cargoIndex);
        stop.setCargo(cargo);
      }
    }
    this.stopList.revalidate();
    this.stopList.repaint$();
    this.stopGoodsTypesPanel.revalidate();
    this.stopGoodsTypesPanel.repaint$();
  }
  /**
   * Add any stops selected in the destination selector.
   */
  addSelectedStops(): void {
    let startIndex = -1;
    let endIndex = -1;
    let sel = this.destinationSelector.getSelectedIndex();
    if (sel === 0) {
      startIndex = 1;
      endIndex = this.destinationSelector.getItemCount();
    } else {
      startIndex = sel;
      endIndex = (startIndex + 1) | 0;
    }
    let cargo = CollectionUtils.transform$ObjectArr$Predicate$Function(this.stopGoodsTypesPanel.getComponents(), (c) => c instanceof GoodsTypeLabel, (c) => (c).getType());
    let maxIndex = this.stopList.getMaxSelectionIndex();
    for (let i = startIndex; i < endIndex; i++) {
      let id = this.destinationSelector.getItemAt(i);
      let fcgo = this.getGame().getFreeColGameObject$String(id);
      if ($J.isa(fcgo, Location)) {
        let stop = new TradeRouteStop()._TradeRouteStop$Game$Location(this.getGame(), fcgo);
        stop.setCargo(cargo);
        if (maxIndex < 0) {
          this.stopListModel.addElement(stop);
        } else {
          maxIndex++;
          this.stopListModel.add(maxIndex, stop);
        }
      }
    }
  }
  /**
   * Convenience function to build a new {@code GoodsTypeLabel}.
   *
   * @param gt The {@code GoodsType} for the label.
   * @return A {@code GoodsTypeLabel} for the goods type.
   */
  buildCargoLabel(gt: GoodsType): GoodsTypeLabel {
    let label = new GoodsTypeLabel()._GoodsTypeLabel$FreeColClient$GoodsType(this.getFreeColClient(), gt);
    label.setTransferHandler(this.transferHandler);
    label.addMouseListener(this.dragListener);
    return label;
  }
  /**
   * Delete any stops currently selected in the stop list.
   */
  deleteCurrentlySelectedStops(): void {
    let count = 0;
    let lastIndex = 0;
    for (let index of this.stopList.getSelectedIndices()) {
      this.stopListModel.remove((index - count) | 0);
      count++;
      lastIndex = index;
    }
    if (this.stopListModel.getSize() > 0) {
      this.stopList.setSelectedIndex((lastIndex - count + 1) | 0);
    }
  }
  /**
   * Make sure the original route is invalid and remove this panel.
   *
   * Public so that this panel can be signalled to close if the parent
   * TradeRoutePanel is closed.
   */
  cancelTradeRoute(): void {
    this.newRoute_.setName(null);
    this.getGUI().removeComponent(this);
  }
  /**
   * Enables the remove stop button if a stop is selected and disables it
   * otherwise.
   */
  updateButtons(): void {
    this.addStopButton.setEnabled(this.stopListModel.getSize() < ((this.destinationSelector.getItemCount() - 1) | 0));
    this.removeStopButton.setEnabled(this.stopList.getSelectedIndices().length > 0);
  }
  /**
   * Check that the trade route is valid.
   *
   * @return True if the trade route is valid.
   */
  verifyNewTradeRoute(): boolean {
    this.newRoute_.setName(this.tradeRouteName.getText$());
    this.newRoute_.clearStops();
    for (let index = 0; index < this.stopListModel.getSize(); index++) {
      this.newRoute_.addStop(this.stopListModel.get(index));
    }
    this.newRoute_.setSilent(this.messagesBox.isSelected());
    let err = this.newRoute_.verify();
    if (err != null) {
      this.getGUI().showInformationPanel$StringTemplate(err);
      this.newRoute_.setName(null);
      return false;
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if (command == null) {
      return;
    }
    switch (command) {
      case FreeColPanel.OK:
        if (!this.verifyNewTradeRoute()) {
          return;
        }
        super.actionPerformed(ae);
        break;
      case FreeColPanel.CANCEL:
        this.cancelTradeRoute();
        break;
      default:
        super.actionPerformed(ae);
        break;
    }
  }
  /**
   * {@inheritDoc}
   */
  valueChanged(e: ListSelectionEvent): void {
    if (e.getValueIsAdjusting()) {
      return;
    }
    let idx = this.stopList.getSelectedIndices();
    if (idx.length > 0) {
      this.updateCargoPanel(this.stopListModel.get(idx[0]));
      this.allGoodsTypesPanel.setEnabled(true);
    } else {
      this.allGoodsTypesPanel.setEnabled(false);
    }
    this.updateButtons();
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    this.transferHandler = null;
    this.dragListener = null;
    this.stopListModel.clear();
    this.stopListModel = null;
    this.stopList = null;
    this.tradeRouteName = null;
    this.destinationSelector = null;
    this.messagesBox = null;
    this.addStopButton = null;
    this.removeStopButton = null;
    this.stopGoodsTypesPanel = null;
    this.allGoodsTypesPanel = null;
    super.removeNotify();
  }
  static $clinit() {
    TradeRouteInputPanel.logger = Logger.getLogger($J.cls(TradeRouteInputPanel).getName());
    TradeRouteInputPanel.STOP_FLAVOR = new DataFlavor($J.cls(TradeRouteStop), 'Stop');
  }
}

export class TradeRouteInputPanel$DestinationCellRenderer extends JLabel {
  _TradeRouteInputPanel$DestinationCellRenderer(): this {
    this._JLabel$();
    this.setOpaque(true);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<string>, value: string, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    let fcgo = this.$outer.getGame().getFreeColGameObject$String(value);
    if ($J.isa(fcgo, Location)) {
      this.setText(Messages.message$StringTemplate((fcgo).getLocationLabel()));
    } else {
      this.setText(value);
    }
    this.setForeground((isSelected) ? list.getSelectionForeground() : list.getForeground());
    this.setBackground((isSelected) ? list.getSelectionBackground() : list.getBackground());
    return this;
  }
}

/**
 * Panel for all types of goods that can be loaded onto a carrier.
 * This should *not* change under drag/drop, but a drop indicates
 * that the dropped goods type is no longer needed to be loaded
 * at the currently selected stop.
 */
export class TradeRouteInputPanel$AllGoodsTypesPanel extends GoodsTypePanel {
  /**
   * The currently selected goods types.
   */
  labels: List<GoodsTypeLabel> = null;
  _TradeRouteInputPanel$AllGoodsTypesPanel(labels: List<GoodsTypeLabel>): this {
    this._GoodsTypePanel$LayoutManager$boolean(new GridLayout()._GridLayout$int$int$int$int(0, 4, FreeColPanel.MARGIN, FreeColPanel.MARGIN), true);
    this.labels = labels;
    this.setOpaque(false);
    this.setBorder(Utility.localizedBorder$String('goods'));
    this.reset();
    return this;
  }
  reset(): void {
    this.setLabels(this.labels);
  }
  /**
   * {@inheritDoc}
   */
  setEnabled(enable: boolean): void {
    super.setEnabled(enable);
    for (let child of this.getComponents()) {
      if (child instanceof GoodsTypeLabel) {
        child.setEnabled(enable);
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (comp instanceof GoodsTypeLabel) {
      let gtl = comp;
      this.$outer.cancelImport(gtl);
      return comp;
    } else {
      return super.add$Component(comp);
    }
  }
}

/**
 * Panel for the types of goods that are to be loaded onto the carrier
 * at the current stop.  This changes under drag/drop, and a drop
 * adds the dropped goods type to be loaded at the currently selected
 * stop.
 */
export class TradeRouteInputPanel$StopGoodsTypesPanel extends GoodsTypePanel {
  _TradeRouteInputPanel$StopGoodsTypesPanel(): this {
    this._GoodsTypePanel$LayoutManager$boolean(new MigLayout()._MigLayout$String('wrap 10'), false);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  add$Component$boolean(comp: Component, editState: boolean): Component {
    if (comp instanceof GoodsTypeLabel) {
      let dndComp = comp;
      let newComp = super.add$Component$boolean(new GoodsTypeLabel()._GoodsTypeLabel$GoodsTypeLabel(dndComp), editState);
      this.$outer.enableImport(dndComp.getType());
      this.revalidate();
      this.repaint$();
      return newComp;
    } else {
      return super.add$Component(comp);
    }
  }
}

export class TradeRouteInputPanel$StopListTransferable extends JObject {
  stops: List<TradeRouteStop> = null;
  _TradeRouteInputPanel$StopListTransferable(stops: List<TradeRouteStop>): this {
    this.stops = stops;
    return this;
  }
  getStops(): List<TradeRouteStop> {
    return this.stops;
  }
  /**
   * {@inheritDoc}
   */
  getTransferData(flavor: DataFlavor): any {
    return (flavor === TradeRouteInputPanel.STOP_FLAVOR) ? this.stops : null;
  }
  /**
   * {@inheritDoc}
   */
  getTransferDataFlavors(): DataFlavor[] {
    return [TradeRouteInputPanel.STOP_FLAVOR];
  }
  /**
   * {@inheritDoc}
   */
  isDataFlavorSupported(flavor: DataFlavor): boolean {
    return flavor === TradeRouteInputPanel.STOP_FLAVOR;
  }
}

/**
 * TransferHandler for Stops.
 */
export class TradeRouteInputPanel$StopListHandler extends TransferHandler {
  _TradeRouteInputPanel$StopListHandler(): this {
    this._TransferHandler$();
    return this;
  }
  /**
   * {@inheritDoc}
   */
  canImport$JComponent$DataFlavorArr(c: JComponent, flavors: DataFlavor[]): boolean {
    return CollectionUtils.any$ObjectArr$Predicate(flavors, CollectionUtils.matchKeyEquals$Object(TradeRouteInputPanel.STOP_FLAVOR));
  }
  /**
   * {@inheritDoc}
   */
  createTransferable(c: JComponent): Transferable {
    let list = c;
    let model = list.getModel();
    let indicies = list.getSelectedIndices();
    let stops = new ArrayList(indicies.length);
    for (let i of indicies) {
      stops.add(model.get(i));
    }
    return new TradeRouteInputPanel$StopListTransferable()._TradeRouteInputPanel$StopListTransferable(stops);
  }
  /**
   * {@inheritDoc}
   */
  getSourceActions(c: JComponent): number {
    return TransferHandler.MOVE;
  }
  /**
   * {@inheritDoc}
   */
  importData$JComponent$Transferable(target: JComponent, data: Transferable): boolean {
    let stl = this.$outer.stopList;
    try {
      if (target === stl && this.canImport$JComponent$DataFlavorArr(target, data.getTransferDataFlavors())) {
        let stops = data.getTransferData(TradeRouteInputPanel.STOP_FLAVOR);
        let newModel = new DefaultListModel()._DefaultListModel();
        let targetIndex = stl.getMaxSelectionIndex();
        let oldList = this.getAllValues(stl);
        if (targetIndex < 0) {
          oldList.removeAll(stops);
          newModel.addAll$Collection(oldList);
          newModel.addAll$Collection(stops);
        } else {
          let beforeList = new ArrayList(oldList.subList(0, targetIndex));
          beforeList.removeAll(stops);
          let afterList = new ArrayList(oldList.subList(targetIndex, oldList.size()));
          afterList.removeAll(stops);
          newModel.addAll$Collection(beforeList);
          newModel.addAll$Collection(stops);
          newModel.addAll$Collection(afterList);
        }
        this.$outer.stopListModel = newModel;
        stl.setModel(newModel);
        if (targetIndex < 0) {
          stl.setSelectedIndex((newModel.getSize() - 1) | 0);
        } else {
          stl.setSelectedIndex(targetIndex);
        }
        stl.invalidate();
        stl.repaint$();
        return true;
      }
    } catch ($e2) {
      if ($J.isa($e2, IOException)) {
        let e = $J.exc($e2);
        TradeRouteInputPanel.logger.log(Level.WARNING, 'Drag&drop failed.', e);
        return false;
      } else if ($J.isa($e2, UnsupportedFlavorException)) {
        let e = $J.exc($e2);
        TradeRouteInputPanel.logger.log(Level.WARNING, 'Drag&drop failed.', e);
        return false;
      } else if ($J.isa($e2, RuntimeException)) {
        let e = $J.exc($e2);
        TradeRouteInputPanel.logger.log(Level.WARNING, 'Drag&drop failed.', e);
        throw e;
      } else {
        throw $e2;
      }
    }
    return false;
  }
  getAllValues(jList: JList<TradeRouteStop>): List<TradeRouteStop> {
    let oldList = new ArrayList();
    for (let i = 0; i < jList.getModel().getSize(); i++) {
      oldList.add(jList.getModel().getElementAt(i));
    }
    return oldList;
  }
  /**
   * {@inheritDoc}
   */
  exportDone(source: JComponent, data: Transferable, action: number): void {
  }
}

export class TradeRouteInputPanel$StopRenderer extends JObject {
  SELECTED_COMPONENT: JPanel = null;
  NORMAL_COMPONENT: JPanel = null;
  _TradeRouteInputPanel$StopRenderer(): this {
    this.SELECTED_COMPONENT = new JPanel()._JPanel$();
    this.NORMAL_COMPONENT = new JPanel()._JPanel$();
    this.NORMAL_COMPONENT.setLayout(new MigLayout()._MigLayout$String$String('', '[center][]'));
    this.NORMAL_COMPONENT.setOpaque(false);
    this.SELECTED_COMPONENT.setLayout(new MigLayout()._MigLayout$String$String('', '[center][]'));
    this.SELECTED_COMPONENT.setOpaque(false);
    this.SELECTED_COMPONENT.setUI$PanelUI(FreeColSelectedPanelUI.createUI(this.SELECTED_COMPONENT));
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<TradeRouteStop>, value: TradeRouteStop, index: number, isSelected: boolean, hasFocus: boolean): Component {
    let panel = (isSelected) ? this.SELECTED_COMPONENT : this.NORMAL_COMPONENT;
    panel.removeAll();
    panel.setForeground(list.getForeground());
    panel.setFont(list.getFont());
    let location = value.getLocation();
    let lib = this.$outer.getImageLibrary();
    let ii: ImageIcon;
    let name: JLabel;
    if ($J.isa(location, TradeLocation)) {
      let tl = location;
      if (tl.canBeInput() === true) {
        name = tl.getNameAsJlabel();
      } else {
        throw new IllegalStateException('Bogus location: ' + $J.str(location));
      }
    } else {
      throw new IllegalStateException('Bogus location: ' + $J.str(location));
    }
    if (location instanceof Europe) {
      let owner = (location).getOwner();
      ii = new ImageIcon()._ImageIcon$Image(lib.getSmallerNationImage(owner.getNation()));
    } else if (location instanceof Colony) {
      let colony = location;
      ii = new ImageIcon()._ImageIcon$Image(lib.getSmallerSettlementImage(colony));
    } else {
      throw new IllegalStateException('Bogus location: ' + $J.str(location));
    }
    name.setVerticalTextPosition(SwingConstants.CENTER);
    let width = $J.d2i((Math.fround(80 * this.$outer.getImageLibrary().getScaleFactor())));
    let height = $J.d2i((Math.fround(60 * this.$outer.getImageLibrary().getScaleFactor())));
    panel.add$Component$Object(new JLabel()._JLabel$Icon(ii), 'spany, width ' + width + ', height ' + height);
    panel.add$Component$Object(name, 'span, wrap');
    for (const $it3 = value.getCargo().iterator(); $it3.hasNext(); ) {
      let cargo = $it3.next();
      ii = new ImageIcon()._ImageIcon$Image(lib.getSmallerGoodsTypeImage(cargo));
      panel.add$Component(new JLabel()._JLabel$Icon(ii));
    }
    return panel;
  }
}

let $TradeRouteInputPanel$1: any = null;
/** An anonymous class (TradeRouteInputPanel.java:493). */
function TradeRouteInputPanel$1(): any {
  return $TradeRouteInputPanel$1 ??= $J.local(class extends JObject {
    keyTyped(e: KeyEvent): void {
      if (e.getKeyChar() === KeyEvent.VK_DELETE) {
        this.$outer.deleteCurrentlySelectedStops();
      }
    }
    keyPressed(e: KeyEvent): void {
    }
    keyReleased(e: KeyEvent): void {
    }
  }, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$1', ['java.awt.event.KeyListener']);
}

let $TradeRouteInputPanel$2: any = null;
/** An anonymous class (TradeRouteInputPanel.java:560). */
function TradeRouteInputPanel$2(): any {
  return $TradeRouteInputPanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.cancelTradeRoute();
    }
  }, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$2', []);
}

let $TradeRouteInputPanel$3: any = null;
/** An anonymous class (TradeRouteInputPanel.java:585). */
function TradeRouteInputPanel$3(): any {
  return $TradeRouteInputPanel$3 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$cv_cancelButton.doClick$();
    }
    $c($cancelButton): this {
      this.$cv_cancelButton = $cancelButton;
      return this;
    }
  }, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$3', []);
}

$J.define(TradeRouteInputPanel, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel', { kind: 'class', ifaces: ['javax.swing.event.ListSelectionListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.TradeRoute': '_TradeRouteInputPanel' }, clinit: true, lazy: ['logger', 'STOP_FLAVOR'] });
$J.define(TradeRouteInputPanel$DestinationCellRenderer, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$DestinationCellRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_TradeRouteInputPanel$DestinationCellRenderer' }, inner: true });
$J.define(TradeRouteInputPanel$AllGoodsTypesPanel, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$AllGoodsTypesPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.GoodsTypePanel', ctors: { 'java.util.List': '_TradeRouteInputPanel$AllGoodsTypesPanel' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean' }, inner: true });
$J.define(TradeRouteInputPanel$StopGoodsTypesPanel, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$StopGoodsTypesPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.GoodsTypePanel', ctors: { '': '_TradeRouteInputPanel$StopGoodsTypesPanel' }, meths: { 'add(java.awt.Component,boolean)': 'add$Component$boolean' }, inner: true });
$J.define(TradeRouteInputPanel$StopListTransferable, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$StopListTransferable', { kind: 'class', ifaces: ['java.awt.datatransfer.Transferable'], sup: 'java.lang.Object', ctors: { 'java.util.List': '_TradeRouteInputPanel$StopListTransferable' }, returns: { 'getStops': 'java.util.List' } });
$J.define(TradeRouteInputPanel$StopListHandler, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$StopListHandler', { kind: 'class', sup: 'javax.swing.TransferHandler', ctors: { '': '_TradeRouteInputPanel$StopListHandler' }, meths: { 'importData(javax.swing.JComponent,java.awt.datatransfer.Transferable)': 'importData$JComponent$Transferable', 'canImport(javax.swing.JComponent,java.awt.datatransfer.DataFlavor[])': 'canImport$JComponent$DataFlavorArr' }, inner: true });
$J.define(TradeRouteInputPanel$StopRenderer, 'net.sf.freecol.client.gui.panel.TradeRouteInputPanel$StopRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'java.lang.Object', ctors: { '': '_TradeRouteInputPanel$StopRenderer' }, inner: true });
$J.module(() => {
  GridLayout = $J.load('java.awt.GridLayout');
  KeyEvent = $J.load('java.awt.event.KeyEvent');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComboBox = $J.load('javax.swing.JComboBox');
  JList = $J.load('javax.swing.JList');
  JPanel = $J.load('javax.swing.JPanel');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTextField = $J.load('javax.swing.JTextField');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  GoodsTypeLabel = $J.load('net.sf.freecol.client.gui.label.GoodsTypeLabel');
  DefaultTransferHandler = $J.load('net.sf.freecol.client.gui.panel.DefaultTransferHandler');
  DragListener = $J.load('net.sf.freecol.client.gui.panel.DragListener');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColSelectedPanelUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColSelectedPanelUI');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  Location = $J.load('net.sf.freecol.common.model.Location');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  TradeLocation = $J.load('net.sf.freecol.common.model.TradeLocation');
  TradeRouteStop = $J.load('net.sf.freecol.common.model.TradeRouteStop');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
