// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/BuildQueuePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Arrays, Collections, DataFlavor, HashMap, HashSet, IOException, JObject, Level, List, Logger, UnsupportedFlavorException } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';
import { TransferHandler } from '../../../../../../javax/swing/TransferHandler.ts';
import { MouseAdapter } from '../../../../../../java/awt/event/MouseAdapter.ts';

let Dimension, MouseEvent, AbstractAction, DefaultListModel, ImageIcon, JCheckBox, JComponent, JLabel, JList, JScrollPane, KeyStroke, ListSelectionModel, SwingConstants, MigLayout, FontLibrary, ConstructionPanel, MigPanel, Utility, FreeColComboBoxRenderer, FreeColSelectedPanelUI, Messages, Ability, BuildingType, FeatureContainer, Named, StringTemplate, UnitType, GameOptions, CollectionUtils, StringUtils;

/**
 * The panel used to display a colony build queue.
 * <p>
 * Panel Layout:
 * <p style="display: block; font-family: monospace; white-space: pre; margin: 1em 0;">
 * | ----------------------------------------------------- |
 * |                         header                        |
 * | --------------- | ----------------- | --------------- |
 * |     bqpUnits    |   bpqBuildQueue   |  bqpBuildings   |
 * | --------------- | ----------------- | --------------- |
 * |     unitList    | constructionPanel |  buildingList   |
 * |                 | ----------------- |                 |
 * |                 |   buildQueueList  |                 |
 * |                 |                   |                 |
 * | ----------------------------------------------------- |
 * | [buyBuildable] []compactBox []showAllBox   [okButton] |
 * | ----------------------------------------------------- |
 */
export class BuildQueuePanel extends FreeColPanel {
  static logger: Logger = null;
  static BUILD_LIST_FLAVOR: DataFlavor = null;
  static readonly FAIL: string = 'FAIL';
  static readonly BUY: string = 'buy';
  static readonly UNABLE_TO_BUILD: number = -1;
  /**
   * Default setting for the compact box.
   */
  static defaultCompact: boolean = false;
  /**
   * Default setting for the showAll box.
   */
  static defaultShowAll: boolean = false;
  /**
   * The enclosing colony.
   */
  colony: Colony = null;
  /**
   * A feature container for potential features from queued buildables.
   */
  featureContainer: FeatureContainer = null;
  /**
   * A transfer handler for the build queue lists.
   */
  buildQueueHandler: BuildQueuePanel$BuildQueueTransferHandler = null;
  /**
   * The list of buildable unit types.
   */
  unitList: JList<UnitType> = null;
  /**
   * The panel showing the current buildable.
   */
  constructionPanel: ConstructionPanel = null;
  /**
   * The build queue.
   */
  buildQueueList: JList<BuildableType> = null;
  /**
   * The list of buildable building types.
   */
  buildingList: JList<BuildingType> = null;
  /**
   * A button to buy the current buildable.
   */
  buyBuildable: JButton = null;
  /**
   * The check box to enable compact mode.
   */
  compactBox: JCheckBox = null;
  /**
   * The check box to enable showing all buildables.
   */
  showAllBox: JCheckBox = null;
  lockReasons: JMap<BuildableType, string> = null;
  /**
   * Create a new build queue panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The enclosing {@code Colony}.
   */
  _BuildQueuePanel(freeColClient: FreeColClient, colony: Colony): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('fill, wrap 3', '[150:260:][fill][150:260:]', '[][][150:400:, growprio 150,shrinkprio 50][]'));
    this.buildQueueHandler = new BuildQueuePanel$BuildQueueTransferHandler().$o(this)._BuildQueuePanel$BuildQueueTransferHandler();
    this.lockReasons = new HashMap();
    this.colony = colony;
    this.featureContainer = new FeatureContainer()._FeatureContainer();
    let current = new DefaultListModel()._DefaultListModel();
    for (const $it0 = this.colony.getBuildQueue().iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      current.addElement(type$);
      this.featureContainer.addFeatures(type$);
    }
    let adapter = new BuildQueuePanel$BuildQueueMouseAdapter().$o(this)._BuildQueuePanel$BuildQueueMouseAdapter(true);
    let addAction = new (BuildQueuePanel$1())().$o(this)._AbstractAction$();
    let fontSubHead = FontLibrary.getScaledFont$String('normal-bold-smaller');
    let header = Utility.localizedHeaderLabel$String$int$String('buildQueuePanel.buildQueue', SwingConstants.LEADING, Utility.FONTSPEC_TITLE);
    let bqpUnits = Utility.localizedLabel$String('buildQueuePanel.units');
    bqpUnits.setFont(fontSubHead);
    let bpqBuildQueue = Utility.localizedLabel$String('buildQueuePanel.buildQueue');
    bpqBuildQueue.setFont(fontSubHead);
    bpqBuildQueue.setHorizontalAlignment(SwingConstants.CENTER);
    let bqpBuildings = Utility.localizedLabel$String('buildQueuePanel.buildings');
    bqpBuildings.setFont(fontSubHead);
    let units = new DefaultListModel()._DefaultListModel();
    this.unitList = new JList()._JList$ListModel(units);
    this.unitList.setTransferHandler(this.buildQueueHandler);
    this.unitList.setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
    this.unitList.setDragEnabled(true);
    this.unitList.addMouseListener(adapter);
    this.unitList.getInputMap$().put(KeyStroke.getKeyStroke$String('ENTER'), 'add');
    this.unitList.getActionMap$().put$Object$Action('add', addAction);
    this.constructionPanel = new ConstructionPanel()._ConstructionPanel(freeColClient, this.colony, false);
    this.constructionPanel.setDefaultLabel(StringTemplate.template$String('buildQueuePanel.currentlyBuilding').add$String$String('%buildable%', 'nothing'));
    this.buildQueueList = new JList()._JList$ListModel(current);
    this.buildQueueList.setTransferHandler(this.buildQueueHandler);
    this.buildQueueList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    this.buildQueueList.setDragEnabled(true);
    this.buildQueueList.addMouseListener(new BuildQueuePanel$BuildQueueMouseAdapter().$o(this)._BuildQueuePanel$BuildQueueMouseAdapter(false));
    this.buildQueueList.getInputMap$().put(KeyStroke.getKeyStroke$String('DELETE'), 'delete');
    this.buildQueueList.getActionMap$().put$Object$Action('delete', new (BuildQueuePanel$2())().$o(this)._AbstractAction$());
    let buildings = new DefaultListModel()._DefaultListModel();
    this.buildingList = new JList()._JList$ListModel(buildings);
    this.buildingList.setTransferHandler(this.buildQueueHandler);
    this.buildingList.setSelectionMode(ListSelectionModel.MULTIPLE_INTERVAL_SELECTION);
    this.buildingList.setDragEnabled(true);
    this.buildingList.addMouseListener(adapter);
    this.buildingList.getInputMap$().put(KeyStroke.getKeyStroke$String('ENTER'), 'add');
    this.buildingList.getActionMap$().put$Object$Action('add', addAction);
    this.buyBuildable = Utility.localizedButton$String('none');
    this.setBuyLabel(null);
    this.buyBuildable.setActionCommand(BuildQueuePanel.BUY);
    this.buyBuildable.addActionListener($J.fn(this, 'actionPerformed'));
    this.compactBox = new JCheckBox()._JCheckBox$String(Messages.message$String('buildQueuePanel.compactView'));
    this.compactBox.addItemListener($J.fn(this, 'itemStateChanged'));
    this.compactBox.setSelected(BuildQueuePanel.defaultCompact);
    this.showAllBox = new JCheckBox()._JCheckBox$String(Messages.message$String('buildQueuePanel.showAll'));
    this.showAllBox.addItemListener($J.fn(this, 'itemStateChanged'));
    this.showAllBox.setSelected(BuildQueuePanel.defaultShowAll);
    this.updateDetailView();
    this.updateAllLists();
    this.add$Component$Object(header, 'span 3, align center, wrap 40');
    this.add$Component$Object(bqpUnits, 'align center');
    this.add$Component$Object(bpqBuildQueue, 'align center');
    this.add$Component$Object(bqpBuildings, 'align center');
    this.add$Component$Object(new JScrollPane()._JScrollPane$Component(this.unitList), 'grow');
    this.add$Component$Object(this.constructionPanel, 'split 2, flowy');
    this.add$Component$Object(new JScrollPane()._JScrollPane$Component(this.buildQueueList), 'grow');
    this.add$Component$Object(new JScrollPane()._JScrollPane$Component(this.buildingList), 'grow, wrap 20');
    this.add$Component$Object(this.buyBuildable, 'span, split 4');
    this.add$Component(this.compactBox);
    this.add$Component(this.showAllBox);
    this.add$Component$Object(this.okButton, 'tag ok');
    this.setEscapeAction(new (BuildQueuePanel$3())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  /**
   * Get the colony for this build queue.
   *
   * @return The {@code Colony}.
   */
  getColony(): Colony {
    return this.colony;
  }
  /**
   * Convert a component to an actual part of this panel,
   * recovering its list type.
   *
   * @param comp The {@code JComponent} to convert.
   * @return The actual panel component {@code JList}, or
   *     null on error.
   */
  convertJComp(comp: JComponent): JList<BuildableType> {
    return (comp === this.unitList) ? this.unitList : (comp === this.buildQueueList) ? this.buildQueueList : (comp === this.buildingList) ? this.buildingList : null;
  }
  removeBuildable(type$: any): void {
    let model = this.buildQueueList.getModel();
    model.removeElement(type$);
  }
  checkAbilities(bt: BuildableType, lockReason: List<string>): boolean {
    let spec = this.getSpecification();
    let oldSize = lockReason.size();
    CollectionUtils.forEachMapEntry$Map$Consumer(bt.getRequiredAbilities(), (e) => {
      let id = e.getKey();
      let value = e.getValue();
      if (this.featureContainer.hasAbility(id, null, null) !== value && this.colony.hasAbility$String(id) !== value) {
        let source = CollectionUtils.first$Collection(spec.getTypesProviding(id, value));
        lockReason.add((source != null) ? Messages.getName$Named(source) : Messages.getName$Named(bt));
      }
    });
    return lockReason.size() === oldSize;
  }
  /**
   * Update the list of available buildings to build
   *
   * This method will verify whether a building can be built by
   *      checking against the following criteria:
   *       * Does the Colony meet the population limit to build?
   *       * Does the new building require a special circumstance,
   *              such as a prerequisite unit or building?
   */
  updateBuildingList(): void {
    let spec = this.getSpecification();
    let current = this.buildQueueList.getModel();
    let buildings = this.buildingList.getModel();
    buildings.clear();
    let unbuildableTypes = new HashSet();
    for (const $it3 = spec.getBuildingTypeList().iterator(); $it3.hasNext(); ) {
      let bt = $it3.next();
      if (unbuildableTypes.contains(bt)) {
        continue;
      }
      if (bt.getUpgradesFrom() != null && unbuildableTypes.contains(bt.getUpgradesFrom())) {
        unbuildableTypes.add(bt);
        continue;
      }
      if (!bt.needsGoodsToBuild()) {
        continue;
      }
      if (current.contains(bt) || this.hasBuildingType(bt)) {
        continue;
      }
      let reasons = new ArrayList(8);
      if (bt.hasAbility$String(Ability.COASTAL_ONLY) && !this.colony.getTile$().isCoastland()) {
        reasons.add(Messages.message$StringTemplate(StringTemplate.template$String('buildQueuePanel.coastalOnly')));
      }
      if (bt.getRequiredPopulation() > this.colony.getUnitCount()) {
        reasons.add(Messages.message$StringTemplate(StringTemplate.template$String('buildQueuePanel.populationTooSmall').addAmount('%number%', bt.getRequiredPopulation())));
      }
      for (const $it4 = (CollectionUtils.transform$Collection$Predicate(bt.getLimits(), (l) => !l.evaluate$Settlement(this.colony))).iterator(); $it4.hasNext(); ) {
        let limit = $it4.next();
        reasons.add(Messages.getDescription$ObjectWithId(limit));
      }
      if (!this.checkAbilities(bt, reasons)) {
        unbuildableTypes.add(bt);
      }
      let colonyBuilding = this.colony.getBuilding(bt);
      let up = bt.getUpgradesFrom();
      if (up != null && !current.contains(up) && (colonyBuilding == null || colonyBuilding.getType() !== up)) {
        reasons.add(Messages.getName$Named(up));
      }
      this.lockReasons.put(bt, (reasons.isEmpty()) ? null : Messages.message$StringTemplate(StringTemplate.template$String('buildQueuePanel.requires').addName$String$String('%string%', StringUtils.join$String$Collection('/', reasons))));
      if (reasons.isEmpty() || this.showAllBox.isSelected()) {
        buildings.addElement(bt);
      }
    }
  }
  /**
   * Update the list of available units (ships, wagon, artillery) to build
   *
   * This method will verify whether a unit can be built by
   *      checking against the following criteria:
   *       * Does the Colony meet the population limit to build?
   *       * Does the new building require a special circumstance,
   *              such as a prerequisite unit or building?
   */
  updateUnitList(): void {
    let spec = this.getSpecification();
    let turn = this.getGame().getTurn();
    let units = this.unitList.getModel();
    units.clear();
    let unbuildableTypes = new HashSet();
    for (const $it5 = spec.getBuildableUnitTypes().iterator(); $it5.hasNext(); ) {
      let ut = $it5.next();
      if (unbuildableTypes.contains(ut)) {
        continue;
      }
      let reasons = new ArrayList(8);
      if (ut.getRequiredPopulation() > this.colony.getUnitCount()) {
        reasons.add(Messages.message$StringTemplate(StringTemplate.template$String('buildQueuePanel.populationTooSmall').addAmount('%number%', ut.getRequiredPopulation())));
      }
      for (const $it6 = (CollectionUtils.transform$Collection$Predicate(ut.getLimits(), (l) => !l.evaluate$Settlement(this.colony))).iterator(); $it6.hasNext(); ) {
        let limit = $it6.next();
        reasons.add(Messages.getDescription$ObjectWithId(limit));
      }
      if (!this.checkAbilities(ut, reasons)) {
        unbuildableTypes.add(ut);
      }
      if (!this.featureContainer.hasAbility(Ability.BUILD, ut, null) && !this.colony.hasAbility$String$FreeColSpecObjectType$Turn(Ability.BUILD, ut, turn)) {
        let buildAbility = CollectionUtils.find$Stream$Predicate(spec.getAbilities(Ability.BUILD), (a) => (a.appliesTo$FreeColObject(ut) && a.getValue() && a.getSource() != null && !unbuildableTypes.contains(a.getSource())));
        reasons.add((buildAbility != null) ? (($J.isa(buildAbility.getSource(), Named)) ? Messages.getName$Named(buildAbility.getSource()) : Messages.getName$Named(buildAbility)) : Messages.getName$Named(ut));
      }
      this.lockReasons.put(ut, (reasons.isEmpty()) ? null : Messages.message$StringTemplate(StringTemplate.template$String('buildQueuePanel.requires').addName$String$String('%string%', StringUtils.join$String$Collection('/', reasons))));
      if (reasons.isEmpty() || this.showAllBox.isSelected()) {
        units.addElement(ut);
      }
    }
  }
  /**
   * Update all the lists and buttons, using
   *      {@link #updateBuildingList()} and
   *      {@link #updateUnitList()}
   */
  updateAllLists(): void {
    let current = this.buildQueueList.getModel();
    this.featureContainer.clear();
    for (let e = current.elements(); e.hasMoreElements(); ) {
      let type$ = e.nextElement();
      if (this.getMinimumIndex(type$) >= 0) {
        this.featureContainer.addFeatures(type$);
      } else {
        current.removeElement(type$);
      }
    }
    this.updateBuildingList();
    this.updateUnitList();
    let pay = this.getSpecification().getBoolean(GameOptions.PAY_FOR_BUILDING);
    let bt = (current.getSize() <= 0) ? null : current.getElementAt(0);
    this.buyBuildable.setEnabled(bt != null && pay && this.colony.canPayToFinishBuilding$BuildableType(bt));
    this.setBuyLabel(bt);
    if (current.getSize() > 0) {
      this.constructionPanel.update$BuildableType(current.getElementAt(0));
    } else if (current.getSize() === 0) {
      this.constructionPanel.update$();
    }
  }
  setBuyLabel(buildable: BuildableType): void {
    this.buyBuildable.setText(Messages.message$StringTemplate((buildable == null) ? StringTemplate.template$String('buildQueuePanel.buyBuilding').addStringTemplate$String$StringTemplate('%buildable%', StringTemplate.key$String('nothing')) : StringTemplate.template$String('buildQueuePanel.buyBuilding').addNamed$String$Named('%buildable%', buildable)));
  }
  /**
   * Checks whether a specified {@code BuildingType} exists
   * within a colony
   *
   * @param buildingType The {@code BuildingType} to check
   * @return boolean
   */
  hasBuildingType(buildingType: BuildingType): boolean {
    while (true) {
      if (this.colony.getBuilding(buildingType) == null) {
        return false;
      } else if (this.colony.getBuilding(buildingType).getType() === buildingType) {
        return true;
      } else if (buildingType.getUpgradesTo() != null) {
        buildingType = buildingType.getUpgradesTo();
      } else {
        return false;
      }
    }
  }
  getBuildableTypes(list: JList<BuildableType>): List<BuildableType> {
    if (list == null) {
      return Collections.emptyList();
    }
    let model = list.getModel();
    let result = new ArrayList(model.getSize());
    for (let index = 0; index < model.getSize(); index++) {
      result.add(model.getElementAt(index));
    }
    return result;
  }
  getMinimumIndex(buildableType: BuildableType): number {
    return buildableType.getMinimumIndex(this.getColony(), this.buildQueueList, BuildQueuePanel.UNABLE_TO_BUILD);
  }
  getMaximumIndex(buildableType: BuildableType): number {
    return buildableType.getMaximumIndex(this.getColony(), this.buildQueueList, BuildQueuePanel.UNABLE_TO_BUILD);
  }
  /**
   * Set the correct cell renderer in the buildables lists.
   */
  updateDetailView(): void {
    let cellRenderer = (this.compactBox.isSelected()) ? new FreeColComboBoxRenderer()._FreeColComboBoxRenderer$() : new BuildQueuePanel$DefaultBuildQueueCellRenderer().$o(this)._BuildQueuePanel$DefaultBuildQueueCellRenderer();
    this.buildQueueList.setCellRenderer(cellRenderer);
    this.buildingList.setCellRenderer(cellRenderer);
    this.unitList.setCellRenderer(cellRenderer);
  }
  static updateCompact(selected: boolean): void {
    BuildQueuePanel.defaultCompact = selected;
  }
  static updateLists(selected: boolean): void {
    BuildQueuePanel.defaultShowAll = selected;
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    if (this.colony.getOwner() === this.getMyPlayer()) {
      let command = ae.getActionCommand();
      let buildables = this.getBuildableTypes(this.buildQueueList);
      let bt: BuildableType;
      while ((bt = CollectionUtils.first$Collection(buildables)) != null && this.lockReasons.get(bt) != null) {
        this.getGUI().showInformationPanel$FreeColObject$StringTemplate(bt, this.colony.getUnbuildableMessage(bt));
        command = BuildQueuePanel.FAIL;
        this.removeBuildable(buildables.removeAt(0));
      }
      this.igc().setBuildQueue(this.colony, buildables);
      if (null != command) {
        switch (command) {
          case BuildQueuePanel.FAIL:
            this.updateAllLists();
            return;
          case FreeColPanel.OK:
            break;
          case BuildQueuePanel.BUY:
            this.igc().payForBuilding(this.colony);
            break;
          default:
            super.actionPerformed(ae);
            break;
        }
      }
    }
    this.getGUI().removeComponent(this);
    this.getGUI().refreshTile(this.colony.getTile$());
  }
  /**
   * Override {@link ItemListener} for this panel's use.
   *      This function evaluates whether a the user has
   *      clicked the {@link #compactBox} or the
   *      {@link #showAllBox} has been checked.
   *
   * {@inheritDoc}
   */
  itemStateChanged(event: ItemEvent): void {
    if (event.getSource() === this.compactBox) {
      this.updateDetailView();
      BuildQueuePanel.updateCompact(this.compactBox.isSelected());
    } else if (event.getSource() === this.showAllBox) {
      this.updateAllLists();
      BuildQueuePanel.updateLists(this.showAllBox.isSelected());
    }
  }
  static $clinit() {
    BuildQueuePanel.logger = Logger.getLogger($J.cls(BuildQueuePanel).getName());
    BuildQueuePanel.BUILD_LIST_FLAVOR = new DataFlavor($J.cls(List), 'IndexedBuildableFlavor');
    BuildQueuePanel.defaultCompact = false;
    BuildQueuePanel.defaultShowAll = false;
  }
}

/**
 * This class represents a buildable, that is dragged/dropped
 * accompanied by its index in the source list where it is dragged from.
 */
export class BuildQueuePanel$IndexedBuildable extends JObject {
  buildable: BuildableType = null;
  index_: number = 0;
  _BuildQueuePanel$IndexedBuildable(buildable: BuildableType, index: number): this {
    this.buildable = buildable;
    this.index_ = index;
    return this;
  }
  getBuildable(): BuildableType {
    return this.buildable;
  }
  getIndex(): number {
    return this.index_;
  }
}

/**
 * This class implements a transfer handler able to transfer
 * {@code BuildQueueItem}s between the build queue list, the
 * unit list and the building list.
 */
export class BuildQueuePanel$BuildQueueTransferHandler extends TransferHandler {
  source: JList<BuildableType> = null;
  _BuildQueuePanel$BuildQueueTransferHandler(): this {
    this._TransferHandler$();
    this.source = null;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  importData$JComponent$Transferable(comp: JComponent, data: Transferable): boolean {
    if (!this.canImport$JComponent$DataFlavorArr(comp, data.getTransferDataFlavors())) {
      return false;
    }
    let target = this.$outer.convertJComp(comp);
    if (target == null) {
      BuildQueuePanel.logger.warning('Build queue import failed to: ' + $J.str(comp));
      return false;
    }
    let transferData: any;
    try {
      transferData = data.getTransferData(BuildQueuePanel.BUILD_LIST_FLAVOR);
    } catch ($e7) {
      if ($J.isa($e7, UnsupportedFlavorException) || $J.isa($e7, IOException)) {
        let e = $J.exc($e7);
        BuildQueuePanel.logger.log(Level.WARNING, 'BuildQueue import', e);
        return false;
      } else {
        throw $e7;
      }
    }
    if (!($J.isa(transferData, List))) {
      return false;
    }
    let transferList = transferData;
    let bql = this.$outer.buildQueueList;
    let queue = new ArrayList(transferList.size());
    for (const $it8 = transferList.iterator(); $it8.hasNext(); ) {
      let object$ = $it8.next();
      if (!(object$ instanceof BuildQueuePanel$IndexedBuildable) || ((object$).getBuildable() instanceof UnitType && target === this.$outer.buildingList) || ((object$).getBuildable() instanceof BuildingType && target === this.$outer.unitList)) {
        return false;
      }
      queue.add(object$);
    }
    let isOrderingQueue = false;
    if (this.source === bql) {
      if (target !== bql) {
        let sourceModel = this.source.getModel();
        for (const $it9 = queue.iterator(); $it9.hasNext(); ) {
          let obj = $it9.next();
          sourceModel.removeElement(obj);
        }
        return true;
      }
      isOrderingQueue = true;
    } else {
      if (target !== bql && target.getParent() !== bql) {
        return false;
      }
    }
    let targetModel = bql.getModel();
    let preferredIndex = target.getSelectedIndex();
    let maxIndex = targetModel.size();
    let prevPos = queue.get(0).getIndex();
    if (isOrderingQueue) {
      if (preferredIndex !== -1 && prevPos === preferredIndex) {
        return false;
      }
      let maximumIndex = this.$outer.getMaximumIndex(queue.get(0).getBuildable());
      if (preferredIndex > maximumIndex) {
        return false;
      }
      for (const $it10 = queue.iterator(); $it10.hasNext(); ) {
        let ib = $it10.next();
        targetModel.removeElementAt(ib.getIndex());
      }
    }
    if (preferredIndex < 0 || preferredIndex > maxIndex) {
      preferredIndex = maxIndex;
    }
    for (let index = 0; index < queue.size(); index++) {
      let toBuild = queue.get(index).getBuildable();
      let minimumIndex = this.$outer.getMinimumIndex(toBuild);
      if (minimumIndex < targetModel.size()) {
        let maximumIndex = this.$outer.getMaximumIndex(toBuild);
        if (minimumIndex !== maximumIndex) {
          if (minimumIndex < ((preferredIndex + index) | 0)) {
            minimumIndex = (preferredIndex + index) | 0;
          }
          minimumIndex = Math.min(Math.min(minimumIndex, targetModel.size()), maximumIndex);
        }
      }
      targetModel.add(minimumIndex, toBuild);
    }
    if (isOrderingQueue) {
      this.$outer.buildQueueList.setSelectedIndex(preferredIndex);
    }
    return true;
  }
  /**
   * {@inheritDoc}
   */
  exportDone(source: JComponent, data: Transferable, action: number): void {
    this.$outer.updateAllLists();
  }
  /**
   * {@inheritDoc}
   */
  canImport$JComponent$DataFlavorArr(comp: JComponent, flavors: DataFlavor[]): boolean {
    return flavors != null && CollectionUtils.any$ObjectArr$Predicate(flavors, CollectionUtils.matchKeyEquals$Object(BuildQueuePanel.BUILD_LIST_FLAVOR));
  }
  /**
   * {@inheritDoc}
   */
  createTransferable(comp: JComponent): Transferable {
    this.source = this.$outer.convertJComp(comp);
    if (this.source == null) {
      return null;
    }
    let indicesArray = this.source.getSelectedIndices();
    let buildableTypes = this.source.getSelectedValuesList();
    let indexedBuildables = new ArrayList(indicesArray.length);
    let i = 0;
    for (let index of indicesArray) {
      let bt = buildableTypes.get(i++);
      indexedBuildables.add(new BuildQueuePanel$IndexedBuildable()._BuildQueuePanel$IndexedBuildable(bt, index));
    }
    return new BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable().$o(this)._BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable(indexedBuildables);
  }
  /**
   * {@inheritDoc}
   */
  getSourceActions(comp: JComponent): number {
    return (comp === this.$outer.unitList) ? TransferHandler.COPY : TransferHandler.MOVE;
  }
}

/**
 * This class implements the {@code Transferable} interface.
 */
export class BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable extends JObject {
  indexedBuildables: List<BuildQueuePanel$IndexedBuildable> = null;
  supportedFlavors: DataFlavor[] = null;
  /**
   * Default constructor.
   *
   * @param indexedBuildables The build queue to transfer.
   */
  _BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable(indexedBuildables: List<BuildQueuePanel$IndexedBuildable>): this {
    this.supportedFlavors = [BuildQueuePanel.BUILD_LIST_FLAVOR];
    this.indexedBuildables = indexedBuildables;
    return this;
  }
  /**
   * Get the build queue from the {@code Transferable}.
   *
   * @return The build queue.
   */
  getBuildables(): List<BuildQueuePanel$IndexedBuildable> {
    return this.indexedBuildables;
  }
  /**
   * {@inheritDoc}
   */
  getTransferData(flavor: DataFlavor): any {
    if (this.isDataFlavorSupported(flavor)) {
      return this.indexedBuildables;
    }
    throw new UnsupportedFlavorException(flavor);
  }
  /**
   * {@inheritDoc}
   */
  getTransferDataFlavors(): DataFlavor[] {
    return Arrays.copyOf(this.supportedFlavors, this.supportedFlavors.length);
  }
  /**
   * {@inheritDoc}
   */
  isDataFlavorSupported(flavor: DataFlavor): boolean {
    return CollectionUtils.any$ObjectArr$Predicate(this.supportedFlavors, CollectionUtils.matchKeyEquals$Object(flavor));
  }
}

export class BuildQueuePanel$BuildQueueMouseAdapter extends MouseAdapter {
  add_: boolean = false;
  enabled: boolean = false;
  _BuildQueuePanel$BuildQueueMouseAdapter(add: boolean): this {
    this._MouseAdapter();
    this.add_ = true;
    this.enabled = false;
    this.add_ = add;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  mousePressed(e: MouseEvent): void {
    if (!this.enabled && e.getClickCount() === 1 && !e.isConsumed()) {
      this.enabled = true;
    }
    if (!this.enabled) {
      return;
    }
    let source = e.getSource();
    let jlist = (source instanceof JComponent) ? this.$outer.convertJComp(source) : null;
    if (jlist == null) {
      return;
    }
    if (e.getButton() === MouseEvent.BUTTON3 || e.isPopupTrigger()) {
      let index = jlist.locationToIndex(e.getPoint());
      let bt = jlist.getModel().getElementAt(index);
      this.$outer.getGUI().showColopediaPanel(bt.getId());
    } else if (e.getClickCount() > 1 && !e.isConsumed()) {
      let bql = this.$outer.buildQueueList;
      let model = bql.getModel();
      if (jlist.getSelectedIndex() < 0) {
        jlist.setSelectedIndex(jlist.locationToIndex(e.getPoint()));
      }
      for (let index of jlist.getSelectedIndices()) {
        if (this.add_) {
          model.addElement(jlist.getModel().getElementAt(index));
        } else {
          model.removeElementAt(index);
        }
      }
      this.$outer.updateAllLists();
    }
  }
}

/**
 * The cell renderer to use for the build queue.
 */
export class BuildQueuePanel$DefaultBuildQueueCellRenderer extends JObject {
  buildingDimension: Dimension = null;
  _BuildQueuePanel$DefaultBuildQueueCellRenderer(): this {
    this.buildingDimension = new Dimension()._Dimension$int$int(100, 48);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  getListCellRendererComponent(list: JList<BuildableType>, value: BuildableType, index: number, isSelected: boolean, cellHasFocus: boolean): Component {
    let lib = this.$outer.getImageLibrary();
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$());
    panel.setOpaque(false);
    if (isSelected) {
      panel.setUI$PanelUI(FreeColSelectedPanelUI.createUI(panel));
    }
    let imageLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(this.$outer.getImageLibrary().getSmallBuildableTypeImageWithWithSize(value, this.$outer.colony.getOwner(), this.buildingDimension)));
    let nameLabel = new JLabel()._JLabel$String(Messages.getName$Named(value));
    let reason = this.$outer.lockReasons.get(value);
    panel.add$Component$Object(imageLabel, 'span 1 2');
    if (reason == null) {
      panel.add$Component$Object(nameLabel, 'wrap');
    } else {
      panel.add$Component$Object(nameLabel, 'split 2');
      panel.add$Component$Object(lib.getLockLabel(), 'wrap');
      panel.setToolTipText(reason);
    }
    let required = value.getRequiredGoodsList$();
    let size = required.size();
    for (let i = 0; i < size; i++) {
      let goods = required.get(i);
      let icon = new ImageIcon()._ImageIcon$Image(lib.getSmallGoodsTypeImage(goods.getType()));
      let goodsLabel = new JLabel()._JLabel$String$Icon$int(String(goods.getAmount()), icon, SwingConstants.CENTER);
      if (i === 0 && size > 1) {
        panel.add$Component$Object(goodsLabel, 'split ' + size);
      } else {
        panel.add$Component(goodsLabel);
      }
    }
    return panel;
  }
}

let $BuildQueuePanel$1: any = null;
/** An anonymous class (BuildQueuePanel.java:574). */
function BuildQueuePanel$1(): any {
  return $BuildQueuePanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      let bql = this.$outer.buildQueueList;
      let model = bql.getModel();
      let btl = (ae.getSource() === this.$outer.unitList) ? this.$outer.unitList : (ae.getSource() === this.$outer.buildingList) ? this.$outer.buildingList : null;
      if (btl != null) {
        for (const $it1 = btl.getSelectedValuesList().iterator(); $it1.hasNext(); ) {
          let bt = $it1.next();
          model.addElement(bt);
        }
      }
      this.$outer.updateAllLists();
    }
  }, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$1', []);
}

let $BuildQueuePanel$2: any = null;
/** An anonymous class (BuildQueuePanel.java:640). */
function BuildQueuePanel$2(): any {
  return $BuildQueuePanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      let bql = this.$outer.buildQueueList;
      for (const $it2 = bql.getSelectedValuesList().iterator(); $it2.hasNext(); ) {
        let bt = $it2.next();
        this.$outer.removeBuildable(bt);
      }
      this.$outer.updateAllLists();
    }
  }, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$2', []);
}

let $BuildQueuePanel$3: any = null;
/** An anonymous class (BuildQueuePanel.java:696). */
function BuildQueuePanel$3(): any {
  return $BuildQueuePanel$3 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$3', []);
}

$J.define(BuildQueuePanel, 'net.sf.freecol.client.gui.panel.BuildQueuePanel', { kind: 'class', ifaces: ['java.awt.event.ItemListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony': '_BuildQueuePanel' }, returns: { 'getColony': 'net.sf.freecol.common.model.Colony' }, clinit: true, lazy: ['logger', 'BUILD_LIST_FLAVOR', 'defaultCompact', 'defaultShowAll'] });
$J.define(BuildQueuePanel$IndexedBuildable, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$IndexedBuildable', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.BuildableType,int': '_BuildQueuePanel$IndexedBuildable' }, returns: { 'getIndex': 'int', 'getBuildable': 'net.sf.freecol.common.model.BuildableType' } });
$J.define(BuildQueuePanel$BuildQueueTransferHandler, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$BuildQueueTransferHandler', { kind: 'class', sup: 'javax.swing.TransferHandler', ctors: { '': '_BuildQueuePanel$BuildQueueTransferHandler' }, meths: { 'canImport(javax.swing.JComponent,java.awt.datatransfer.DataFlavor[])': 'canImport$JComponent$DataFlavorArr', 'importData(javax.swing.JComponent,java.awt.datatransfer.Transferable)': 'importData$JComponent$Transferable' }, inner: true });
$J.define(BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable', { kind: 'class', ifaces: ['java.awt.datatransfer.Transferable'], sup: 'java.lang.Object', ctors: { 'java.util.List': '_BuildQueuePanel$BuildQueueTransferHandler$BuildablesTransferable' }, returns: { 'getBuildables': 'java.util.List' }, inner: true });
$J.define(BuildQueuePanel$BuildQueueMouseAdapter, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$BuildQueueMouseAdapter', { kind: 'class', sup: 'java.awt.event.MouseAdapter', ctors: { 'boolean': '_BuildQueuePanel$BuildQueueMouseAdapter' }, inner: true });
$J.define(BuildQueuePanel$DefaultBuildQueueCellRenderer, 'net.sf.freecol.client.gui.panel.BuildQueuePanel$DefaultBuildQueueCellRenderer', { kind: 'class', ifaces: ['javax.swing.ListCellRenderer'], sup: 'java.lang.Object', ctors: { '': '_BuildQueuePanel$DefaultBuildQueueCellRenderer' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComponent = $J.load('javax.swing.JComponent');
  JLabel = $J.load('javax.swing.JLabel');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  ConstructionPanel = $J.load('net.sf.freecol.client.gui.panel.ConstructionPanel');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  FreeColComboBoxRenderer = $J.load('net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer');
  FreeColSelectedPanelUI = $J.load('net.sf.freecol.client.gui.plaf.FreeColSelectedPanelUI');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  BuildingType = $J.load('net.sf.freecol.common.model.BuildingType');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Named = $J.load('net.sf.freecol.common.model.Named');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  UnitType = $J.load('net.sf.freecol.common.model.UnitType');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  StringUtils = $J.load('net.sf.freecol.common.util.StringUtils');
});
