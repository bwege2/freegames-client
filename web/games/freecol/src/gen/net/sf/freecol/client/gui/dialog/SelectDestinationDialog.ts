// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/dialog/SelectDestinationDialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, AtomicBoolean, AtomicReference, Comparator, JFunction, JObject, Logger } from '../../../../../../../jre/index.ts';
import { FreeColDialog } from './FreeColDialog.ts';
import { FreeColComboBoxRenderer } from '../plaf/FreeColComboBoxRenderer.ts';

let Dimension, MouseAdapter, DefaultListModel, ImageIcon, JCheckBox, JComboBox, JList, JScrollPane, ListSelectionModel, MigLayout, ChoiceItem, FreeColDialog$DialogType, MigPanel, Utility, Messages, Ability, Colony, Constants, Europe, IndianSettlement, Map_, Settlement, Stance, StringTemplate, Unit, UnitChangeType, GoalDeciders$MultipleAdjacentDecider, ResourceManager, CollectionUtils, LogBuilder;

/**
 * Select a location as the destination for a given unit.
 */
export class SelectDestinationDialog extends FreeColDialog {
  static logger: Logger = null;
  /**
   * The size of each destination cell.
   */
  static readonly CELL_HEIGHT: number = 48;
  /**
   * Show only the player colonies.  FIXME: make a client option.
   */
  static showOnlyMyColonies: AtomicBoolean = null;
  /**
   * How to order the destinations.
   */
  static destinationComparator: AtomicReference<Comparator<SelectDestinationDialog$Destination>> = null;
  /**
   * The available destinations.
   */
  destinations: List<SelectDestinationDialog$Destination> = null;
  /**
   * The list of destinations.
   */
  destinationList: JList<SelectDestinationDialog$Destination> = null;
  /**
   * Restrict to only the player colonies?
   */
  onlyMyColoniesBox: JCheckBox = null;
  /**
   * Choice of the comparator.
   */
  comparatorBox: JComboBox<string> = null;
  /**
   * The constructor to use.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param frame The owner frame.
   * @param unit The {@code Unit} to plan for.
   */
  _SelectDestinationDialog(freeColClient: FreeColClient, frame: JFrame, unit: Unit): this {
    this._FreeColDialog$FreeColClient$JFrame(freeColClient, frame);
    this.destinations = new ArrayList();
    let lib = this.getImageLibrary();
    let goodsTypes = CollectionUtils.transform$Collection$Predicate$Function(unit.getCompactGoodsList(), CollectionUtils.alwaysTrue(), ($p0) => $p0.getType());
    this.loadDestinations(unit, goodsTypes);
    let model = new DefaultListModel()._DefaultListModel();
    this.destinationList = new JList()._JList$ListModel(model);
    this.destinationList.setCellRenderer(new SelectDestinationDialog$LocationRenderer()._SelectDestinationDialog$LocationRenderer(lib));
    this.destinationList.setFixedCellHeight(SelectDestinationDialog.CELL_HEIGHT);
    this.destinationList.setSelectionMode(ListSelectionModel.SINGLE_SELECTION);
    this.destinationList.addListSelectionListener($J.fn(this, 'valueChanged'));
    this.destinationList.addMouseListener(new (SelectDestinationDialog$1())().$o(this)._MouseAdapter());
    this.updateDestinationList();
    let listScroller = new JScrollPane()._JScrollPane$Component(this.destinationList);
    listScroller.setPreferredSize(new Dimension()._Dimension$int$int(300, 300));
    let omcb = Messages.message$String('selectDestinationDialog.onlyMyColonies');
    this.onlyMyColoniesBox = new JCheckBox()._JCheckBox$String$boolean(omcb, SelectDestinationDialog.showOnlyMyColonies.get());
    this.onlyMyColoniesBox.addChangeListener((event) => {
      SelectDestinationDialog.showOnlyMyColonies.set(this.onlyMyColoniesBox.isSelected());
      this.updateDestinationList();
    });
    this.comparatorBox = new JComboBox()._JComboBox$ObjectArr([Messages.message$String('selectDestinationDialog.sortByOwner'), Messages.message$String('selectDestinationDialog.sortByName'), Messages.message$String('selectDestinationDialog.sortByDistance')]);
    this.comparatorBox.addItemListener((event) => {
      this.updateDestinationComparator();
      let dc = this.getDestinationComparator();
      this.destinations.sort(dc);
      this.updateDestinationList();
    });
    let dc = this.getDestinationComparator();
    this.comparatorBox.setSelectedIndex(SelectDestinationDialog$Destination.getDestinationComparatorIndex(dc));
    let panel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('wrap 1, fill', '[align center]', ''));
    panel.add$Component(Utility.localizedHeader('selectDestinationDialog.text', Utility.FONTSPEC_SUBTITLE));
    panel.add$Component$Object(listScroller, 'newline 30, growx, growy');
    panel.add$Component$Object(this.onlyMyColoniesBox, 'left');
    panel.add$Component$Object(this.comparatorBox, 'left');
    panel.setSize$Dimension(panel.getPreferredSize$());
    let c = FreeColDialog.choices();
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('ok'), null).okOption());
    c.add(new ChoiceItem()._ChoiceItem$String$Object(Messages.message$String('selectDestinationDialog.cancel'), null).cancelOption().defaultOption());
    this.initializeDialog(frame, FreeColDialog$DialogType.QUESTION, true, panel, new ImageIcon()._ImageIcon$Image(lib.getSmallUnitImage$Unit(unit)), c);
    return this;
  }
  /**
   * Get the current destination comparator.
   *
   * @return The destination comparator.
   */
  getDestinationComparator(): Comparator<SelectDestinationDialog$Destination> {
    let ret = SelectDestinationDialog.destinationComparator.get();
    if (ret == null) {
      ret = SelectDestinationDialog$Destination.getDestinationComparator(0);
      SelectDestinationDialog.destinationComparator.set(ret);
    }
    return ret;
  }
  /**
   * Set the current destination comparator.
   *
   * @param dc The new destination comparator.
   */
  setDestinationComparator(dc: Comparator<SelectDestinationDialog$Destination>): void {
    SelectDestinationDialog.destinationComparator.set(dc);
  }
  /**
   * Load destinations for a given unit and carried goods types.
   *
   * @param unit The {@code Unit} to select destinations for.
   * @param goodsTypes A list of {@code GoodsType}s carried.
   */
  loadDestinations(unit: Unit, goodsTypes: List<GoodsType>): void {
    if (unit.isInEurope() && !unit.getType().canMoveToHighSeas()) {
      return;
    }
    let player = unit.getOwner();
    let inSettlement = unit.getSettlement();
    let canTrade = player.hasAbility$String(Ability.TRADE_WITH_FOREIGN_COLONIES);
    let europe = player.getEurope();
    let game = this.getGame();
    let map = game.getMap();
    let canReach = (s) => (unit.isNaval()) ? s.isConnectedPort() : Map_.isSameContiguity(unit.getLocation(), s.getTile$());
    let td = new ArrayList();
    if (unit.isInEurope()) {
      td.add(new SelectDestinationDialog$Destination()._SelectDestinationDialog$Destination(map, unit.getSailTurns(), unit, goodsTypes));
    } else if (europe != null && player.canMoveToEurope() && unit.getType().canMoveToHighSeas()) {
      let turns = unit.getTurnsToReach$Location(europe);
      if (turns < Unit.MANY_TURNS) {
        td.add(new SelectDestinationDialog$Destination()._SelectDestinationDialog$Destination(europe, turns, unit, goodsTypes));
      }
    }
    td.addAll(CollectionUtils.transform$Stream$Predicate$Function(player.getSettlements(), (s) => s !== inSettlement && canReach(s), (s) => new SelectDestinationDialog$Destination()._SelectDestinationDialog$Destination(s, unit.getTurnsToReach$Location(s), unit, goodsTypes)));
    let tradePred = (p) => p.hasContacted(player) && (canTrade || !p.isEuropean());
    let settlementTileMapper = (p) => (CollectionUtils.transform$Stream$Predicate$Function(p.getSettlements(), (s) => canReach(s) && s.hasContacted(p), (s) => s.getTile$())).stream();
    let locs = CollectionUtils.toList$Stream(CollectionUtils.flatten$Stream$Predicate$Function(game.getLivePlayers([player]), tradePred, settlementTileMapper));
    let md = new GoalDeciders$MultipleAdjacentDecider()._GoalDeciders$MultipleAdjacentDecider(locs);
    unit.search(unit.getLocation(), md.getGoalDecider(), null, Constants.INFINITY, null);
    let dmapper = (e) => {
      let s = e.getKey().getTile$().getSettlement();
      let p = e.getValue();
      if (s == null) {
        SelectDestinationDialog.logger.warning('BR#3149 null settlement: ' + Messages.message$StringTemplate(e.getKey().getLocationLabel()) + ' path=' + p.fullPathToString());
        return null;
      }
      let turns = p.getTotalTurns();
      if (unit.isInEurope()) {
        turns = (turns + unit.getSailTurns()) | 0;
      }
      if (p.getMovesLeft() < unit.getInitialMovesLeft()) {
        turns++;
      }
      return new SelectDestinationDialog$Destination()._SelectDestinationDialog$Destination(s, turns, unit, goodsTypes);
    };
    td.addAll(CollectionUtils.transform$Collection$Predicate$Function(md.getResults().entrySet(), CollectionUtils.isNotNull$(), dmapper));
    this.destinations.addAll(CollectionUtils.transform$Collection$Predicate$Function$Comparator(td, (d) => d.turns < Unit.MANY_TURNS, JFunction.identity(), this.getDestinationComparator()));
  }
  /**
   * Reset the destinations in the model.
   */
  updateDestinationList(): void {
    let player = this.getMyPlayer();
    let selected = this.destinationList.getSelectedValue();
    let model = new DefaultListModel()._DefaultListModel();
    for (const $it0 = this.destinations.iterator(); $it0.hasNext(); ) {
      let d = $it0.next();
      if (SelectDestinationDialog.showOnlyMyColonies.get()) {
        if (d.location_ instanceof Europe || d.location_ instanceof Map_ || (d.location_ instanceof Colony && player.owns(d.location_))) {
          model.addElement(d);
        }
      } else {
        model.addElement(d);
      }
    }
    this.destinationList.setModel(model);
    this.destinationList.setSelectedValue(selected, true);
    if (this.destinationList.getSelectedIndex() < 0) {
      this.destinationList.setSelectedIndex(0);
    }
    this.recenter(this.destinationList.getSelectedValue());
  }
  /**
   * Show a destination on the map.
   *
   * @param destination The {@code Destination} to display.
   */
  recenter(destination: SelectDestinationDialog$Destination): void {
    if (destination != null && destination.location_.getTile$() != null) {
      this.getGUI().setFocus(destination.location_.getTile$());
    }
  }
  /**
   * Set the selected destination comparator.
   */
  updateDestinationComparator(): void {
    this.setDestinationComparator(SelectDestinationDialog$Destination.getDestinationComparator(this.comparatorBox.getSelectedIndex()));
  }
  /**
   * {@inheritDoc}
   */
  valueChanged(e: ListSelectionEvent): void {
    if (e.getValueIsAdjusting()) {
      return;
    }
    this.recenter(this.destinationList.getSelectedValue());
  }
  /**
   * {@inheritDoc}
   */
  getResponse(): Location {
    let value = this.getValue();
    if (this.options.get(0).equals(value)) {
      let d = this.destinationList.getSelectedValue();
      if (d != null) {
        return d.location_;
      }
    }
    return null;
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.destinations.clear();
    this.onlyMyColoniesBox = null;
    this.comparatorBox = null;
  }
  /**
   * {@inheritDoc}
   */
  requestFocus$(): void {
    this.destinationList.requestFocus$();
  }
  static $clinit() {
    SelectDestinationDialog.logger = Logger.getLogger($J.cls(SelectDestinationDialog).getName());
    SelectDestinationDialog.showOnlyMyColonies = new AtomicBoolean(true);
    SelectDestinationDialog.destinationComparator = new AtomicReference(null);
  }
}

/**
 * A container for a destination location, with associated
 * distance and extra characteristics.
 */
export class SelectDestinationDialog$Destination extends JObject {
  /**
   * Basic destination comparator, that just uses the name field.
   */
  static nameComparator: Comparator<SelectDestinationDialog$Destination> = null;
  /**
   * Distance comparator, uses turns field then falls back to names.
   */
  static distanceComparator: Comparator<SelectDestinationDialog$Destination> = null;
  /**
   * Owner comparator, uses the owner field then falls back to names.
   */
  static ownerComparator: Comparator<SelectDestinationDialog$Destination> = null;
  /**
   * The unit that is travelling.
   */
  unit: Unit = null;
  /**
   * The location to travel to.
   */
  location_: Location = null;
  /**
   * The displayed name of the location (needed in text and comparator)
   */
  name: string = null;
  /**
   * The number of turns to reach the destination.
   */
  turns: number = 0;
  /**
   * Extra special information about the destination
   */
  extras: string = null;
  /**
   * A magic score for the destination for the comparator/s.
   */
  score: number = 0;
  /**
   * The full text to display.
   */
  text_: string = null;
  /**
   * Create a destination.
   *
   * @param location The {@code Location} to go to.
   * @param turns The number of turns it takes to get to the location.
   * @param unit The {@code Unit} that is moving.
   * @param goodsTypes A list of goods types the unit is carrying.
   */
  _SelectDestinationDialog$Destination(location: Location, turns: number, unit: Unit, goodsTypes: List<GoodsType>): this {
    this.unit = unit;
    this.location_ = location;
    this.name = Messages.message$StringTemplate(location.getLocationLabelFor(unit.getOwner()));
    this.turns = turns;
    this.extras = this.getExtras(location, unit, goodsTypes);
    this.score = this.calculateScore();
    this.text_ = Messages.message$StringTemplate(StringTemplate.template$String('selectDestinationDialog.destinationTurns').addName$String$String('%location%', this.name).addAmount('%turns%', this.turns).addName$String$String('%extras%', this.extras));
    return this;
  }
  /**
   * Collected extra annotations of interest to a unit proposing to
   * visit a location.
   *
   * @param loc The {@code Location} to visit.
   * @param unit The {@code Unit} proposing to visit.
   * @param goodsTypes A list of goods types the unit is carrying.
   * @return A string containing interesting annotations about the visit
   *         or an empty string if nothing is of interest.
   */
  getExtras(loc: Location, unit: Unit, goodsTypes: List<GoodsType>): string {
    let sep = ', ';
    let owner = unit.getOwner();
    let lb = new LogBuilder()._LogBuilder(32);
    let dropSep = false;
    if (loc instanceof IndianSettlement && (loc).hasMissionary$Player(owner)) {
      lb.add([ResourceManager.getString$String('cross')]);
    }
    if (loc instanceof Europe && !goodsTypes.isEmpty()) {
      let market = owner.getMarket();
      for (const $it1 = goodsTypes.iterator(); $it1.hasNext(); ) {
        let goodsType = $it1.next();
        lb.add([Messages.getName$Named(goodsType), ' ', market.getSalePrice$GoodsType$int(goodsType, 1), sep]);
        dropSep = true;
      }
    } else if (loc instanceof Settlement && owner.owns(loc)) {
    } else if (loc instanceof Settlement && (loc).getOwner().atWarWith(owner)) {
      lb.add(['[', Messages.getName$Named(Stance.WAR), ']']);
    } else if (loc instanceof Settlement) {
      if (loc instanceof IndianSettlement) {
        let is$ = loc;
        let sk = is$.getLearnableSkill();
        if (sk != null) {
          let upgradePred = (u) => u.getUnitChange$String(UnitChangeType.NATIVES) != null;
          let up = (unit.isCarrier()) ? CollectionUtils.find$Stream$Predicate(unit.getUnits(), upgradePred) : (upgradePred(unit)) ? unit : null;
          if (up != null) {
            lb.add(['[', Messages.getName$Named(sk), ']']);
          }
        }
      }
      if (!goodsTypes.isEmpty()) {
        for (const $it2 = goodsTypes.iterator(); $it2.hasNext(); ) {
          let g = $it2.next();
          let sale = owner.getLastSaleString(loc, g);
          let more = null;
          if (loc instanceof IndianSettlement) {
            let is$ = loc;
            more = (g === is$.getWantedGoods$int(0)) ? '***' : (g === is$.getWantedGoods$int(1)) ? '**' : (g === is$.getWantedGoods$int(2)) ? '*' : null;
          }
          if (sale != null && more != null) {
            lb.add([Messages.getName$Named(g), ' ', sale, more, sep]);
            dropSep = true;
          }
        }
      }
    }
    if (dropSep) {
      lb.shrink(sep);
    }
    return lb.toString();
  }
  calculateScore(): number {
    return (this.location_ instanceof Europe || this.location_ instanceof Map_) ? 10 : (this.location_ instanceof Colony) ? ((this.unit.getOwner().owns(this.location_)) ? 20 : 30) : (this.location_ instanceof IndianSettlement) ? 40 : 100;
  }
  getTurns(): number {
    return this.turns;
  }
  getScore(): number {
    return this.score;
  }
  static getDestinationComparatorIndex(dc: Comparator<SelectDestinationDialog$Destination>): number {
    return (dc === SelectDestinationDialog$Destination.nameComparator) ? 1 : (dc === SelectDestinationDialog$Destination.distanceComparator) ? 2 : 0;
  }
  static getDestinationComparator(index: number): Comparator<SelectDestinationDialog$Destination> {
    return (index === 1) ? SelectDestinationDialog$Destination.nameComparator : (index === 2) ? SelectDestinationDialog$Destination.distanceComparator : SelectDestinationDialog$Destination.ownerComparator;
  }
  static $clinit() {
    SelectDestinationDialog$Destination.nameComparator = (d1, d2) => {
      if (!(d1.location_ instanceof Settlement)) {
        return -1;
      }
      if (!(d2.location_ instanceof Settlement)) {
        return 1;
      }
      return $J.compareTo(d1.name, d2.name);
    };
    SelectDestinationDialog$Destination.distanceComparator = Comparator.thenComparing((Comparator.comparingInt(($p0) => $p0.getTurns())), SelectDestinationDialog$Destination.nameComparator);
    SelectDestinationDialog$Destination.ownerComparator = Comparator.thenComparing((Comparator.comparingInt(($p0) => $p0.getScore())), SelectDestinationDialog$Destination.nameComparator);
  }
}

export class SelectDestinationDialog$LocationRenderer extends FreeColComboBoxRenderer {
  lib: ImageLibrary = null;
  /**
   * Create a new location renderer.
   *
   * @param lib The {@code ImageLibrary} to use to make icons.
   */
  _SelectDestinationDialog$LocationRenderer(lib: ImageLibrary): this {
    this._FreeColComboBoxRenderer$();
    this.lib = lib;
    return this;
  }
  /**
   * {@inheritDoc}
   */
  setLabelValues(label: JLabel, value: SelectDestinationDialog$Destination): void {
    label.setText(value.text_);
    let key = value.location_.getLocationImageKey();
    label.setIcon(new ImageIcon()._ImageIcon$Image(this.lib.getSizedImage(key, new Dimension()._Dimension$int$int(-1, SelectDestinationDialog.CELL_HEIGHT))));
  }
}

let $SelectDestinationDialog$1: any = null;
/** An anonymous class (SelectDestinationDialog.java:359). */
function SelectDestinationDialog$1(): any {
  return $SelectDestinationDialog$1 ??= $J.local(class extends MouseAdapter {
    mouseClicked(e: MouseEvent): void {
      if (e.getClickCount() !== 2) {
        return;
      }
      let d = this.$outer.destinationList.getSelectedValue();
      if (d != null) {
        this.$outer.setValue(CollectionUtils.first$Collection(this.$outer.options));
      }
    }
  }, 'net.sf.freecol.client.gui.dialog.SelectDestinationDialog$1', []);
}

$J.define(SelectDestinationDialog, 'net.sf.freecol.client.gui.dialog.SelectDestinationDialog', { kind: 'class', ifaces: ['javax.swing.event.ListSelectionListener'], sup: 'net.sf.freecol.client.gui.dialog.FreeColDialog', ctors: { 'net.sf.freecol.client.FreeColClient,javax.swing.JFrame,net.sf.freecol.common.model.Unit': '_SelectDestinationDialog' }, returns: { 'getResponse': 'net.sf.freecol.common.model.Location', 'getDestinationComparator': 'java.util.Comparator' }, meths: { 'requestFocus()': 'requestFocus$' }, clinit: true, lazy: ['logger', 'showOnlyMyColonies', 'destinationComparator'] });
$J.define(SelectDestinationDialog$Destination, 'net.sf.freecol.client.gui.dialog.SelectDestinationDialog$Destination', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Location,int,net.sf.freecol.common.model.Unit,java.util.List': '_SelectDestinationDialog$Destination' }, returns: { 'getScore': 'int', 'getTurns': 'int' }, clinit: true, lazy: ['nameComparator', 'distanceComparator', 'ownerComparator'] });
$J.define(SelectDestinationDialog$LocationRenderer, 'net.sf.freecol.client.gui.dialog.SelectDestinationDialog$LocationRenderer', { kind: 'class', sup: 'net.sf.freecol.client.gui.plaf.FreeColComboBoxRenderer', ctors: { 'net.sf.freecol.client.gui.ImageLibrary': '_SelectDestinationDialog$LocationRenderer' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  MouseAdapter = $J.load('java.awt.event.MouseAdapter');
  DefaultListModel = $J.load('javax.swing.DefaultListModel');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JCheckBox = $J.load('javax.swing.JCheckBox');
  JComboBox = $J.load('javax.swing.JComboBox');
  JList = $J.load('javax.swing.JList');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  ListSelectionModel = $J.load('javax.swing.ListSelectionModel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ChoiceItem = $J.load('net.sf.freecol.client.gui.ChoiceItem');
  FreeColDialog$DialogType = $J.load('net.sf.freecol.client.gui.dialog.FreeColDialog$DialogType');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  IndianSettlement = $J.load('net.sf.freecol.common.model.IndianSettlement');
  Map_ = $J.load('net.sf.freecol.common.model.Map');
  Settlement = $J.load('net.sf.freecol.common.model.Settlement');
  Stance = $J.load('net.sf.freecol.common.model.Stance');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  UnitChangeType = $J.load('net.sf.freecol.common.model.UnitChangeType');
  GoalDeciders$MultipleAdjacentDecider = $J.load('net.sf.freecol.common.model.pathfinding.GoalDeciders$MultipleAdjacentDecider');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  LogBuilder = $J.load('net.sf.freecol.common.util.LogBuilder');
});
