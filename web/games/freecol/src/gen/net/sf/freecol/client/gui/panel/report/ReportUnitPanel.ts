// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportUnitPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collections, Comparator, HashMap, JFunction } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let ImageIcon, JLabel, JSeparator, SwingConstants, MigLayout, GoodsLabel, UnitLabel, FreeColPanel, Utility, Messages, AbstractUnit, Colony, Europe, StringTemplate, Unit, CollectionUtils;

/**
 * This panel displays a unit Report.
 */
export class ReportUnitPanel extends ReportPanel {
  /**
   * Simple comparator to order miscellaneous locations.
   */
  static locationComparator: Comparator<Location> = null;
  /**
   * Comparator to order abstract unit lists with most common
   * type+role first.
   */
  static auComparator: Comparator<AbstractUnit> = null;
  /**
   * Where are the players reportable units?
   */
  where: JMap<Location, List<Unit>> = null;
  /**
   * Count the number of units of each type+role.
   */
  reportables: List<AbstractUnit> = null;
  /**
   * Count the relevant REF units.
   */
  reportableREF: List<AbstractUnit> = null;
  /**
   * Locations in the order to display them.
   */
  orderedLocations: List<Location> = null;
  /**
   * Whether to show colonies even if no selected units are present.
   */
  showColonies: boolean = false;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param key The report name key.
   * @param showColonies Whether to show colonies with no selected units.
   */
  _ReportUnitPanel(freeColClient: FreeColClient, key: string, showColonies: boolean): this {
    this._ReportPanel(freeColClient, key);
    this.where = new HashMap();
    this.reportables = new ArrayList();
    this.reportableREF = new ArrayList();
    this.orderedLocations = new ArrayList();
    this.showColonies = false;
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('fillx, wrap 12', '', ''));
    this.showColonies = showColonies;
    this.gatherData();
    this.display();
    return this;
  }
  gatherData(): void {
    let player = this.getMyPlayer();
    for (const $it0 = (CollectionUtils.transform$Stream$Predicate(player.getUnits(), (u) => this.isReportable$Unit(u))).iterator(); $it0.hasNext(); ) {
      let u = $it0.next();
      CollectionUtils.appendToMapList(this.where, u.getLocation().up(), u);
      let au = CollectionUtils.find$Collection$Predicate(this.reportables, AbstractUnit.matcher$Unit(u));
      if (au == null) {
        this.reportables.add(new AbstractUnit()._AbstractUnit$UnitType$String$int(u.getType(), u.getRole().getId(), 1));
      } else {
        au.addToNumber(1);
      }
    }
    this.reportables.sort(ReportUnitPanel.auComparator);
    let refUnits = player.getREFUnits();
    if (refUnits != null) {
      for (const $it1 = refUnits.iterator(); $it1.hasNext(); ) {
        let au = $it1.next();
        if (this.isReportableREF(au)) {
          this.reportableREF.add(au);
        }
      }
    }
    this.reportableREF.sort(ReportUnitPanel.auComparator);
    this.orderedLocations.addAll(CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.where.keySet(), (l) => !(l instanceof Colony || l instanceof Europe), JFunction.identity(), ReportUnitPanel.locationComparator));
    let europe = player.getEurope();
    if (europe != null) {
      this.orderedLocations.add(0, europe);
    }
    let colonies = player.getSortedColonies(this.getClientOptions().getColonyComparator());
    this.orderedLocations.addAll(0, colonies);
  }
  display(): void {
    let player = this.getMyPlayer();
    if (!this.reportableREF.isEmpty()) {
      let refNation = player.getNation().getREFNation();
      this.reportPanel.add$Component$Object(new JLabel()._JLabel$String(Messages.getName$Named(refNation)), FreeColPanel.SPAN_SPLIT_2);
      this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'growx');
      for (const $it2 = this.reportableREF.iterator(); $it2.hasNext(); ) {
        let au = $it2.next();
        this.reportPanel.add$Component$Object(this.createUnitTypeLabel(au), 'sg');
      }
    }
    this.reportPanel.add$Component$Object(Utility.localizedLabel$StringTemplate(player.getForcesLabel()), FreeColPanel.NL_SPAN_SPLIT_2);
    this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'growx');
    for (const $it3 = this.reportables.iterator(); $it3.hasNext(); ) {
      let au = $it3.next();
      if (au.getNumber() <= 0) {
        continue;
      }
      this.reportPanel.add$Component$Object(this.createUnitTypeLabel(au), 'sg');
    }
    for (const $it4 = this.orderedLocations.iterator(); $it4.hasNext(); ) {
      let loc = $it4.next();
      let present = this.where.get(loc);
      if (present == null) {
        present = Collections.emptyList();
      } else {
        present = CollectionUtils.sort$Collection$Comparator(present, Unit.typeRoleComparator);
      }
      if (!this.showColonies && present.isEmpty()) {
        continue;
      }
      let locName = Messages.message$StringTemplate(loc.getLocationLabelFor(player));
      let button = Utility.getLinkButton(locName, null, loc.getId());
      button.addActionListener($J.fn(this, 'actionPerformed'));
      this.reportPanel.add$Component$Object(button, FreeColPanel.NL_SPAN_SPLIT_2);
      this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'growx');
      if (present.isEmpty()) {
        this.reportPanel.add$Component$Object(Utility.localizedLabel$String('none'), 'sg');
      } else {
        let fcc = this.getFreeColClient();
        for (const $it5 = CollectionUtils.sort$Collection$Comparator(present, Unit.typeRoleComparator).iterator(); $it5.hasNext(); ) {
          let u = $it5.next();
          let unitButton = this.getUnitButton(u);
          if (u.isCarrier()) {
            this.reportPanel.add$Component$Object(unitButton, 'newline, sg');
            for (const $it6 = u.getGoodsList().iterator(); $it6.hasNext(); ) {
              let goods = $it6.next();
              let goodsLabel = new GoodsLabel()._GoodsLabel$FreeColClient$Goods(fcc, goods);
              this.reportPanel.add$Component(goodsLabel);
            }
            for (const $it7 = u.getUnitList().iterator(); $it7.hasNext(); ) {
              let unitLoaded = $it7.next();
              let unitLoadedLabel = new UnitLabel()._UnitLabel$FreeColClient$Unit$boolean(fcc, unitLoaded, true);
              this.reportPanel.add$Component(unitLoadedLabel);
            }
          } else {
            this.reportPanel.add$Component$Object(unitButton, 'sg');
          }
        }
      }
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Get a button for a unit.
   *
   * @param unit The {@code Unit} that needs a button.
   * @return A suitable {@code JButton}.
   */
  getUnitButton(unit: Unit): JButton {
    let icon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledUnitImage$Unit(unit));
    let button = Utility.getLinkButton('', icon, unit.getLocation().up().getId());
    button.addActionListener($J.fn(this, 'actionPerformed'));
    let tip = StringTemplate.label('\n').addStringTemplate$StringTemplate(unit.getLabel$());
    if (unit.getDestination() != null) {
      tip.addStringTemplate$StringTemplate(unit.getDestinationLabel());
    }
    Utility.localizeToolTip$JComponent$StringTemplate(button, tip);
    return button;
  }
  static $clinit() {
    ReportUnitPanel.locationComparator = (l1, l2) => {
      return $J.compareTo(l1.getId(), l2.getId());
    };
    ReportUnitPanel.auComparator = Comparator.reversed((Comparator.comparingInt(($p0) => $p0.getNumber())));
  }
}

$J.define(ReportUnitPanel, 'net.sf.freecol.client.gui.panel.report.ReportUnitPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient,java.lang.String,boolean': '_ReportUnitPanel' }, meths: { 'isReportable(net.sf.freecol.common.model.UnitType,net.sf.freecol.common.model.Role)': 'isReportable$UnitType$Role', 'isReportable(net.sf.freecol.common.model.Unit)': 'isReportable$Unit' }, clinit: true, lazy: ['locationComparator', 'auComparator'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JSeparator = $J.load('javax.swing.JSeparator');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  GoodsLabel = $J.load('net.sf.freecol.client.gui.label.GoodsLabel');
  UnitLabel = $J.load('net.sf.freecol.client.gui.label.UnitLabel');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractUnit = $J.load('net.sf.freecol.common.model.AbstractUnit');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Europe = $J.load('net.sf.freecol.common.model.Europe');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit = $J.load('net.sf.freecol.common.model.Unit');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
