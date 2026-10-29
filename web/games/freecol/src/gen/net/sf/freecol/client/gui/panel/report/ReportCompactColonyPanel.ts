// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportCompactColonyPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Collectors, Comparator, HashMap, IllegalStateException, JEnum, JFunction, JObject, JString, StringBuilder } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let Color, Font, ImageIcon, JLabel, JSeparator, SwingConstants, MigLayout, ImageLibrary, Utility, Messages, Ability, AbstractGoods, Building, Colony, Constants, GoodsContainer, GoodsType, StringTemplate, Unit$UnitLabelType, Unit$UnitState, WorkLocation$Suggestion, ResourceManager, CollectionUtils;

/**
 * This panel displays the compact colony report.
 */
export class ReportCompactColonyPanel extends ReportPanel {
  /**
   * Predicate to select units that are not working.
   */
  static notWorkingPred: Predicate<Unit> = null;
  /**
   * Predicate to select the goods to report on.
   */
  static reportGoodsPred: Predicate<GoodsType> = null;
  static readonly BUILDQUEUE: string = 'buildQueue.';
  static readonly cAlarmKey: string = 'color.report.colony.alarm';
  static readonly cWarnKey: string = 'color.report.colony.warning';
  static readonly cPlainKey: string = 'color.report.colony.plain';
  static readonly cExportKey: string = 'color.report.colony.export';
  static readonly cGoodKey: string = 'color.report.colony.good';
  static cAlarm: Color = null;
  static cWarn: Color = null;
  static cPlain: Color = null;
  static cExport: Color = null;
  static cGood: Color = null;
  spec_: Specification = null;
  lib: ImageLibrary = null;
  colonies: List<List<Colony>> = null;
  market: Market = null;
  goodsTypes: List<GoodsType> = null;
  /**
   * Creates a compact colony report.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportCompactColonyPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportColonyAction');
    this.colonies = new ArrayList();
    this.goodsTypes = new ArrayList();
    this.spec_ = this.getSpecification();
    this.lib = this.getImageLibrary();
    let player = this.getMyPlayer();
    this.market = player.getMarket();
    let continents = new HashMap();
    for (const $it0 = player.getColonyList().iterator(); $it0.hasNext(); ) {
      let c = $it0.next();
      if (c.getUnitCount() > 0) {
        CollectionUtils.appendToMapList(continents, c.getTile$().getContiguity(), c);
      }
    }
    let colonyComparator = freeColClient.getClientOptions().getColonyComparator();
    let firstColonyComparator = Comparator.comparing((l) => CollectionUtils.first$Collection(l), colonyComparator);
    this.colonies.addAll(CollectionUtils.sort$Collection$Comparator(continents.values(), firstColonyComparator));
    this.goodsTypes.addAll(CollectionUtils.transform$Collection$Predicate$Function$Comparator(this.spec_.getGoodsTypeList(), ReportCompactColonyPanel.reportGoodsPred, JFunction.identity(), GoodsType.goodsTypeComparator));
    this.loadResources();
    this.update$$ReportCompactColonyPanel();
    return this;
  }
  loadResources(): void {
    if (ReportCompactColonyPanel.cAlarm != null) {
      return;
    }
    ReportCompactColonyPanel.cAlarm = ImageLibrary.getColor$String$Color(ReportCompactColonyPanel.cAlarmKey, Color.RED);
    ReportCompactColonyPanel.cWarn = ImageLibrary.getColor$String$Color(ReportCompactColonyPanel.cWarnKey, Color.MAGENTA);
    ReportCompactColonyPanel.cPlain = ImageLibrary.getColor$String$Color(ReportCompactColonyPanel.cPlainKey, Color.DARK_GRAY);
    ReportCompactColonyPanel.cExport = ImageLibrary.getColor$String$Color(ReportCompactColonyPanel.cExportKey, Color.GREEN);
    ReportCompactColonyPanel.cGood = ImageLibrary.getColor$String$Color(ReportCompactColonyPanel.cGoodKey, Color.BLUE);
  }
  static stpl(messageId: string): StringTemplate {
    return (Messages.containsKey(messageId)) ? StringTemplate.template$String(messageId) : null;
  }
  static stpld(messageId: string): StringTemplate {
    messageId = Messages.descriptionKey$String(messageId);
    return ReportCompactColonyPanel.stpl(messageId);
  }
  newLabel$String$ImageIcon$Color$ReportCompactColonyPanel(h: string, i: ImageIcon, c: Color): JLabel {
    let l = new JLabel()._JLabel$String$Icon$int(h, i, SwingConstants.CENTER);
    l.setForeground((c == null) ? Color.BLACK : c);
    return l;
  }
  newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(h: string, i: ImageIcon, c: Color, t: StringTemplate): JLabel {
    if (h != null && Messages.containsKey(h)) {
      h = Messages.message$String(h);
    }
    let l = this.newLabel$String$ImageIcon$Color$ReportCompactColonyPanel(h, i, c);
    if (t != null) {
      Utility.localizeToolTip$JComponent$StringTemplate(l, t);
    }
    return l;
  }
  newButton(action: string, h: string, i: ImageIcon, c: Color, t: StringTemplate): JButton {
    if (h != null && Messages.containsKey(h)) {
      h = Messages.message$String(h);
    }
    let b = Utility.getLinkButton(h, i, action);
    b.setForeground((c == null) ? Color.BLACK : c);
    if (t != null) {
      Utility.localizeToolTip$JComponent$StringTemplate(b, t);
    }
    b.addActionListener($J.fn(this, 'actionPerformed'));
    return b;
  }
  addTogether(components: List<JComponent>): void {
    if (components.isEmpty()) {
      this.reportPanel.add$Component(new JLabel()._JLabel$());
      return;
    }
    let layout = (components.size() > 1) ? 'split ' + components.size() : null;
    for (const $it1 = components.iterator(); $it1.hasNext(); ) {
      let jc = $it1.next();
      this.reportPanel.add$Component$Object(jc, layout);
      layout = null;
    }
  }
  /**
   * Update a single colony.
   *
   * @param s The {@code ColonySummary} to update from.
   */
  updateColony(s: ReportCompactColonyPanel$ColonySummary): void {
    let cac = s.colony.getId();
    let defaultUnitType = this.spec_.getDefaultUnitType$Player(s.colony.getOwner());
    let buttons = new ArrayList(16);
    let b: JButton;
    let c: Color;
    let t: StringTemplate;
    let building: Building;
    c = (s.bonus <= -2) ? ReportCompactColonyPanel.cAlarm : (s.bonus === -1) ? ReportCompactColonyPanel.cWarn : (s.bonus === 0) ? ReportCompactColonyPanel.cPlain : (s.bonus === 1) ? ReportCompactColonyPanel.cExport : ReportCompactColonyPanel.cGood;
    let annotations = '';
    let key: string;
    t = StringTemplate.label(',');
    if ((building = s.colony.getStockade()) == null) {
      key = 'annotation.unfortified';
      t.add$String(Messages.message$String('report.colony.annotation.unfortified'));
    } else {
      key = 'annotation.' + building.getType().getSuffix$();
      t.add$String(Messages.message$StringTemplate(building.getLabel()));
    }
    if (ResourceManager.getStringResource(key, false) != null) {
      annotations += ResourceManager.getString$String(key);
    }
    if (!s.colony.getTile$().isCoastland()) {
      key = 'annotation.inland';
      t.add$String(Messages.message$String('report.colony.annotation.inland'));
    } else if ((building = s.colony.getWorkLocationWithAbility$String$Class(Ability.PRODUCE_IN_WATER, $J.cls(Building))) == null) {
      key = 'annotation.coastal';
      t.add$String(Messages.message$String('report.colony.annotation.coastal'));
    } else {
      key = 'annotation.' + building.getType().getSuffix$();
      t.add$String(Messages.message$StringTemplate(building.getLabel()));
    }
    if (ResourceManager.getStringResource(key, false) != null) {
      annotations += ResourceManager.getString$String(key);
    }
    if ((building = s.colony.getWorkLocationWithAbility$String$Class(Ability.EXPORT, $J.cls(Building))) != null) {
      annotations += '*';
      t.add$String(Messages.message$StringTemplate(building.getLabel()));
    }
    b = this.newButton(cac, s.colony.getName() + annotations, null, c, StringTemplate.label(': ').add$String(s.colony.getName()).add$String(Messages.message$StringTemplate(t)));
    if (s.famine) {
      b.setFont(b.getFont().deriveFont$int(Font.BOLD));
    }
    this.reportPanel.add$Component$Object(b, 'newline');
    c = ReportCompactColonyPanel.cGood;
    t = ReportCompactColonyPanel.stpld('report.colony.size');
    this.reportPanel.add$Component(this.newButton(cac, String(s.unitCount), null, c, t));
    if (s.unitsToAdd > 0) {
      c = ReportCompactColonyPanel.cGood;
      t = ReportCompactColonyPanel.stpld('report.colony.growing').addName$String$String('%colony%', s.colony.getName()).addAmount('%amount%', s.unitsToAdd);
      b = this.newButton(cac, String(s.unitsToAdd), null, c, t);
    } else {
      b = null;
    }
    this.reportPanel.add$Component((b == null) ? new JLabel()._JLabel$() : b);
    if (s.unitsToRemove > 0) {
      c = s.bonus < 0 ? ReportCompactColonyPanel.cAlarm : ReportCompactColonyPanel.cGood;
      t = ReportCompactColonyPanel.stpld('report.colony.shrinking').addName$String$String('%colony%', s.colony.getName()).addAmount('%amount%', s.unitsToRemove);
      b = this.newButton(cac, String(s.unitsToRemove), null, c, t);
    } else {
      b = null;
    }
    this.reportPanel.add$Component((b == null) ? new JLabel()._JLabel$() : b);
    let n = CollectionUtils.count$Collection$Predicate(s.tileSuggestions, ($p0) => $p0.isExploration());
    if (n > 0) {
      t = ReportCompactColonyPanel.stpld('report.colony.exploring').addName$String$String('%colony%', s.colony.getName()).addAmount('%amount%', n);
      b = this.newButton(cac, String(n), null, ReportCompactColonyPanel.cAlarm, t);
    } else {
      b = null;
    }
    this.reportPanel.add$Component((b == null) ? new JLabel()._JLabel$() : b);
    for (const $it2 = this.spec_.getTileImprovementTypeList().iterator(); $it2.hasNext(); ) {
      let ti = $it2.next();
      if (ti.isNatural()) {
        continue;
      }
      n = 0;
      let center = false;
      for (const $it3 = s.tileSuggestions.iterator(); $it3.hasNext(); ) {
        let tis = $it3.next();
        if (tis.tileImprovementType === ti) {
          n++;
          if (tis.tile === s.colony.getTile$()) {
            center = true;
          }
        }
      }
      if (n > 0) {
        c = ReportCompactColonyPanel.cAlarm;
        if (n === 1) {
          let tis = CollectionUtils.first$Collection(s.tileSuggestions);
          if (CollectionUtils.any$Stream$Predicate(tis.tile.getUnits(), (u) => (u.getState() === Unit$UnitState.IMPROVING && u.getWorkImprovement() != null && u.getWorkImprovement().getType() === tis.tileImprovementType))) {
            c = ReportCompactColonyPanel.cWarn;
          }
          t = (ReportCompactColonyPanel.stpld('report.colony.tile.' + ti.getSuffix$() + '.specific')).addName$String$String('%colony%', s.colony.getName()).addStringTemplate$String$StringTemplate('%location%', tis.tile.getColonyTileLocationLabel(s.colony));
        } else {
          t = (ReportCompactColonyPanel.stpld('report.colony.tile.' + ti.getSuffix$())).addName$String$String('%colony%', s.colony.getName()).addAmount('%amount%', n);
        }
        b = this.newButton(cac, String(n), null, c, t);
        if (center) {
          b.setFont(b.getFont().deriveFont$int(Font.BOLD));
        }
      } else {
        b = null;
      }
      this.reportPanel.add$Component((b == null) ? new JLabel()._JLabel$() : b);
    }
    for (const $it4 = this.goodsTypes.iterator(); $it4.hasNext(); ) {
      let gt = $it4.next();
      let gp = s.production.get(gt);
      switch (gp.status_) {
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.FAIL:
          c = ReportCompactColonyPanel.cAlarm;
          t = ReportCompactColonyPanel.stpld('report.colony.production.low').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', -gp.amount).addAmount('%turns%', gp.extra);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.BAD:
          c = ReportCompactColonyPanel.cWarn;
          t = ReportCompactColonyPanel.stpld('report.colony.production').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE:
          c = null;
          t = null;
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.ZERO:
          c = ReportCompactColonyPanel.cPlain;
          t = ReportCompactColonyPanel.stpld('report.colony.production').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD:
          c = ReportCompactColonyPanel.cGood;
          t = ReportCompactColonyPanel.stpld('report.colony.production').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXPORT:
          c = ReportCompactColonyPanel.cExport;
          t = ReportCompactColonyPanel.stpld('report.colony.production.export').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount).addAmount('%export%', gp.extra);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXCESS:
          c = ReportCompactColonyPanel.cWarn;
          t = ReportCompactColonyPanel.stpld('report.colony.production.high').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount).addAmount('%turns%', gp.extra);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.OVERFLOW:
          c = ReportCompactColonyPanel.cAlarm;
          t = ReportCompactColonyPanel.stpld('report.colony.production.waste').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount).addAmount('%waste%', gp.extra);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.PRODUCTION:
          c = ReportCompactColonyPanel.cWarn;
          t = ReportCompactColonyPanel.stpld('report.colony.production.maxProduction').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount).addAmount('%more%', gp.extra);
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.CONSUMPTION:
          c = ReportCompactColonyPanel.cWarn;
          t = ReportCompactColonyPanel.stpld('report.colony.production.maxConsumption').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%goods%', gt).addAmount('%amount%', gp.amount).addAmount('%more%', gp.extra);
          break;
        default:
          throw new IllegalStateException('Bogus status: ' + $J.str(gp.status_));
      }
      this.reportPanel.add$Component((c == null) ? new JLabel()._JLabel$() : this.newButton(cac, String(gp.amount), null, c, t));
    }
    if (s.newColonist > 0) {
      t = ReportCompactColonyPanel.stpld('report.colony.arriving').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%unit%', defaultUnitType).addAmount('%turns%', s.newColonist);
      b = this.newButton(cac, String(s.newColonist), null, ReportCompactColonyPanel.cGood, t);
    } else if (s.newColonist < 0) {
      c = (s.famine) ? ReportCompactColonyPanel.cAlarm : ReportCompactColonyPanel.cWarn;
      t = ReportCompactColonyPanel.stpld('report.colony.starving').addName$String$String('%colony%', s.colony.getName()).addAmount('%turns%', -s.newColonist);
      b = this.newButton(cac, String(-s.newColonist), null, c, t);
      if (s.famine) {
        b.setFont(b.getFont().deriveFont$int(Font.BOLD));
      }
    } else {
      b = null;
    }
    this.reportPanel.add$Component((b == null) ? new JLabel()._JLabel$() : b);
    let qac = ReportCompactColonyPanel.BUILDQUEUE + cac;
    if (s.build_ != null) {
      let turns = s.completeTurns;
      let bname = Messages.getName$Named(s.build_);
      if (turns === Constants.UNDEFINED) {
        t = ReportCompactColonyPanel.stpld('report.colony.making.noconstruction').addName$String$String('%colony%', s.colony.getName());
        b = this.newButton(qac, bname, null, ReportCompactColonyPanel.cWarn, t);
      } else if (turns >= 0) {
        t = ReportCompactColonyPanel.stpld('report.colony.making.constructing').addName$String$String('%colony%', s.colony.getName()).addNamed$String$Named('%buildable%', s.build_).addAmount('%turns%', turns);
        b = this.newButton(qac, bname + ' ' + String(turns), null, ReportCompactColonyPanel.cGood, t);
      } else {
        turns = -((turns + 1) | 0);
        t = ReportCompactColonyPanel.stpld('report.colony.making.blocking').addName$String$String('%colony%', s.colony.getName()).addAmount('%amount%', s.needed.getAmount()).addNamed$String$Named('%goods%', s.needed.getType()).addNamed$String$Named('%buildable%', s.build_).addAmount('%turns%', turns);
        b = this.newButton(qac, bname + ' ' + String(turns), null, ReportCompactColonyPanel.cAlarm, t);
        if (turns === 0) {
          b.setFont(b.getFont().deriveFont$int(Font.BOLD));
        }
      }
      buttons.add(b);
    }
    let empty = 0;
    let school = s.colony.getWorkLocationWithAbility$String$Class(Ability.TEACH, $J.cls(Building));
    if (school != null) {
      empty = school.getType().getWorkPlaces();
    }
    for (const $it5 = CollectionUtils.mapEntriesByValue$Map$Comparator(s.teachers, CollectionUtils.descendingIntegerComparator).iterator(); $it5.hasNext(); ) {
      let e = $it5.next();
      let u = e.getKey();
      let ii = new ImageIcon()._ImageIcon$Image(this.lib.getTinyUnitImage(u));
      if (e.getValue() <= 0) {
        t = ReportCompactColonyPanel.stpld('report.colony.making.noteach').addName$String$String('%colony%', s.colony.getName()).addStringTemplate$String$StringTemplate('%teacher%', u.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL));
        b = this.newButton(cac, String(0), ii, ReportCompactColonyPanel.cAlarm, t);
      } else {
        t = ReportCompactColonyPanel.stpld('report.colony.making.educating').addName$String$String('%colony%', s.colony.getName()).addStringTemplate$String$StringTemplate('%teacher%', u.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)).addAmount('%turns%', e.getValue());
        b = this.newButton(cac, String(e.getValue()), ii, ReportCompactColonyPanel.cPlain, t);
      }
      buttons.add(b);
      empty--;
    }
    if (empty > 0) {
      let emptyIcon = new ImageIcon()._ImageIcon$Image(this.lib.getTinyUnitTypeImage$UnitType$boolean(defaultUnitType, true));
      t = ReportCompactColonyPanel.stpld('report.colony.making.educationVacancy').addName$String$String('%colony%', s.colony.getName()).addAmount('%number%', empty);
      for (; empty > 0; empty--) {
        buttons.add(this.newButton(cac, '', emptyIcon, ReportCompactColonyPanel.cPlain, t));
      }
    }
    this.addTogether(buttons);
    if (s.improve_.isEmpty() && s.want.isEmpty()) {
      this.reportPanel.add$Component(new JLabel()._JLabel$());
    } else {
      buttons.clear();
      buttons.addAll(this.unitButtons(s.improve_, s.couldWork, s.colony));
      buttons.add(new JLabel()._JLabel$String('/'));
      for (const $it6 = s.improve_.keySet().iterator(); $it6.hasNext(); ) {
        let ut = $it6.next();
        s.want.remove(ut);
      }
      buttons.addAll(this.unitButtons(s.want, s.couldWork, s.colony));
      this.addTogether(buttons);
    }
  }
  unitButtons(suggestions: JMap<UnitType, WorkLocation$Suggestion>, have: List<UnitType>, colony: Colony): List<JButton> {
    let cac = colony.getId();
    let result = new ArrayList(suggestions.size());
    let buttonComparator = Comparator.comparing((ut) => suggestions.get(ut), WorkLocation$Suggestion.descendingAmountComparator);
    for (const $it7 = CollectionUtils.sort$Collection$Comparator(suggestions.keySet(), buttonComparator).iterator(); $it7.hasNext(); ) {
      let type$ = $it7.next();
      let present = have.contains(type$);
      let suggestion = suggestions.get(type$);
      let label = String(suggestion.amount);
      let icon = new ImageIcon()._ImageIcon$Image(this.lib.getTinyUnitTypeImage$UnitType$boolean(type$, false));
      let tip = (suggestion.oldType == null) ? ReportCompactColonyPanel.stpld('report.colony.wanting').addName$String$String('%colony%', colony.getName()).addNamed$String$Named('%unit%', type$).addStringTemplate$String$StringTemplate('%location%', suggestion.workLocation.getLabel()).addNamed$String$Named('%goods%', suggestion.goodsType).addAmount('%amount%', suggestion.amount) : ReportCompactColonyPanel.stpld('report.colony.improving').addName$String$String('%colony%', colony.getName()).addNamed$String$Named('%oldUnit%', suggestion.oldType).addNamed$String$Named('%unit%', type$).addStringTemplate$String$StringTemplate('%location%', suggestion.workLocation.getLabel()).addNamed$String$Named('%goods%', suggestion.goodsType).addAmount('%amount%', suggestion.amount);
      let b = this.newButton(cac, label, icon, (present) ? ReportCompactColonyPanel.cGood : ReportCompactColonyPanel.cPlain, tip);
      if (present) {
        b.setFont(b.getFont().deriveFont$int(Font.BOLD));
      }
      result.add(b);
    }
    return result;
  }
  /**
   * Update several colonies.
   *
   * @param summaries A list of {@code ColonySummary}s to update from.
   */
  updateCombinedColonies(summaries: List<ReportCompactColonyPanel$ColonySummary>): void {
    let l: JLabel;
    let c: Color;
    let t: StringTemplate;
    this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'newline, span, growx');
    let rRegionMap = new HashMap();
    let rTileSuggestions = new ArrayList();
    let rUnitCount = 0;
    let rUnitsToAdd = 0;
    let rUnitsToRemove = 0;
    let teacherLen = 0;
    let improveLen = 0;
    let rNewColonist = 0;
    let rProduction = new HashMap();
    let rTeachers = new HashMap();
    let rImprove = new HashMap();
    let rNeeded = new HashMap();
    for (const $it8 = summaries.iterator(); $it8.hasNext(); ) {
      let s = $it8.next();
      CollectionUtils.accumulateToMap(rRegionMap, s.colony.getTile$().getRegion(), 1, CollectionUtils.integerAccumulator);
      rTileSuggestions.addAll(s.tileSuggestions);
      if (s.newColonist > 0) {
        rNewColonist += s.newColonist;
      }
      rUnitCount = (rUnitCount + s.unitCount) | 0;
      rUnitsToAdd = (rUnitsToAdd + s.unitsToAdd) | 0;
      if (s.bonus < 0) {
        rUnitsToRemove = (rUnitsToRemove + s.unitsToRemove) | 0;
      }
      CollectionUtils.accumulateMap(rProduction, s.production, ReportCompactColonyPanel$ColonySummary$GoodsProduction.goodsProductionAccumulator);
      teacherLen = Math.max(teacherLen, s.teachers.size());
      for (const $it9 = s.teachers.keySet().iterator(); $it9.hasNext(); ) {
        let u = $it9.next();
        CollectionUtils.accumulateToMap(rTeachers, u.getType(), 1, CollectionUtils.integerAccumulator);
      }
      improveLen = Math.max(improveLen, (s.improve_.size() + s.want.size()) | 0);
      for (const $it10 = s.improve_.keySet().iterator(); $it10.hasNext(); ) {
        let ut = $it10.next();
        CollectionUtils.accumulateToMap(rImprove, ut, 1, CollectionUtils.integerAccumulator);
      }
      for (const $it11 = s.want.keySet().iterator(); $it11.hasNext(); ) {
        let ut = $it11.next();
        CollectionUtils.accumulateToMap(rImprove, ut, 1, CollectionUtils.integerAccumulator);
      }
      if (s.needed != null && s.needed.getType().isStorable()) {
        CollectionUtils.accumulateToMap(rNeeded, s.needed.getType(), $J.boxD(s.needed.getAmount() / s.completeTurns), CollectionUtils.doubleAccumulator);
      }
    }
    rNewColonist = $J.round(rNewColonist / summaries.size());
    t = CollectionUtils.mapEntriesByValue$Map$Comparator(rRegionMap, CollectionUtils.descendingIntegerComparator).get(0).getKey().getLabel();
    this.reportPanel.add$Component$Object(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(Messages.message$StringTemplate(t), null, ReportCompactColonyPanel.cPlain, ReportCompactColonyPanel.stpld('report.colony.name.summary')), 'newline');
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(rUnitCount), null, ReportCompactColonyPanel.cGood, ReportCompactColonyPanel.stpld('report.colony.size.summary')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(rUnitsToAdd), null, ReportCompactColonyPanel.cGood, ReportCompactColonyPanel.stpld('report.colony.growing.summary')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(rUnitsToRemove), null, (rUnitsToRemove > 0) ? ReportCompactColonyPanel.cAlarm : ReportCompactColonyPanel.cGood, ReportCompactColonyPanel.stpld('report.colony.shrinking.summary')));
    let tiles = CollectionUtils.transform$Collection$Predicate$Function$Collector(rTileSuggestions, ($p0) => $p0.isExploration(), (ts) => ts.tile, Collectors.toSet());
    this.reportPanel.add$Component((tiles.isEmpty()) ? new JLabel()._JLabel$() : this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(tiles.size()), null, ReportCompactColonyPanel.cAlarm, ReportCompactColonyPanel.stpld('report.colony.exploring.summary')));
    for (const $it12 = this.spec_.getTileImprovementTypeList().iterator(); $it12.hasNext(); ) {
      let ti = $it12.next();
      if (ti.isNatural()) {
        continue;
      }
      tiles.clear();
      tiles.addAll(CollectionUtils.transform$Collection$Predicate$Function$Collector(rTileSuggestions, CollectionUtils.matchKey$Object$Function(ti, (ts) => ts.tileImprovementType), (ts) => ts.tile, Collectors.toSet()));
      this.reportPanel.add$Component((tiles.isEmpty()) ? new JLabel()._JLabel$() : this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(tiles.size()), null, ReportCompactColonyPanel.cAlarm, ReportCompactColonyPanel.stpld('report.colony.tile.' + ti.getSuffix$() + '.summary')));
    }
    for (const $it13 = this.goodsTypes.iterator(); $it13.hasNext(); ) {
      let gt = $it13.next();
      let gp = rProduction.get(gt);
      switch (gp.status_) {
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.BAD:
          c = ReportCompactColonyPanel.cWarn;
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE:
          c = null;
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.ZERO:
          c = ReportCompactColonyPanel.cPlain;
          break;
        case ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD:
          c = ReportCompactColonyPanel.cGood;
          break;
        default:
          throw new IllegalStateException('Bogus status: ' + $J.str(gp.status_));
      }
      this.reportPanel.add$Component((c == null) ? new JLabel()._JLabel$() : this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(gp.amount), null, c, ReportCompactColonyPanel.stpld('report.colony.production.summary').addNamed$String$Named('%goods%', gt)));
    }
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String($J.d2i(rNewColonist)), null, (rNewColonist < 0) ? ReportCompactColonyPanel.cWarn : ReportCompactColonyPanel.cGood, ReportCompactColonyPanel.stpld('report.colony.arriving.summary')));
    let labels = CollectionUtils.transform$Collection$Predicate$Function(CollectionUtils.mapEntriesByValue$Map$Comparator(rNeeded, CollectionUtils.descendingDoubleComparator), CollectionUtils.alwaysTrue(), (e) => this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(JString.format('%4.1f %s', $J.boxD(e.getValue()), Messages.getName$Named(e.getKey())), null, ReportCompactColonyPanel.cPlain, ReportCompactColonyPanel.stpld('report.colony.making.summary').addNamed$String$Named('%goods%', e.getKey())));
    teacherLen = Math.max(3, teacherLen);
    labels.addAll(this.unitTypeLabels(rTeachers, teacherLen, ReportCompactColonyPanel.stpld('report.colony.making.educating.summary')));
    this.addTogether(labels);
    this.addTogether(this.unitTypeLabels(rImprove, improveLen, ReportCompactColonyPanel.stpld('report.colony.improving.summary')));
  }
  unitTypeLabels(unitTypeMap: JMap<UnitType, number>, maxSize: number, t: StringTemplate): List<JLabel> {
    let result = new ArrayList(maxSize);
    let n = 0;
    for (const $it14 = CollectionUtils.mapEntriesByValue$Map$Comparator(unitTypeMap, CollectionUtils.descendingIntegerComparator).iterator(); $it14.hasNext(); ) {
      let e = $it14.next();
      let icon = new ImageIcon()._ImageIcon$Image(this.lib.getTinyUnitTypeImage$UnitType$boolean(e.getKey(), false));
      result.add(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(String(e.getValue()), icon, ReportCompactColonyPanel.cPlain, t));
      if (++n >= maxSize) {
        break;
      }
    }
    return result;
  }
  /**
   * Display the header area for the concise panel.
   *
   * @param market A {@code Market} to check goods arrears
   *     status with.
   */
  conciseHeaders(market: Market): void {
    this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'newline, span, growx');
    this.reportPanel.add$Component$Object(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.name.header', null, null, ReportCompactColonyPanel.stpld('report.colony.name')), 'newline');
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.size.header', null, null, ReportCompactColonyPanel.stpld('report.colony.size')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.grow.header', null, null, ReportCompactColonyPanel.stpld('report.colony.grow')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.shrink.header', null, null, ReportCompactColonyPanel.stpld('report.colony.shrink')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.explore.header', null, null, ReportCompactColonyPanel.stpld('report.colony.explore')));
    for (const $it15 = this.spec_.getTileImprovementTypeList().iterator(); $it15.hasNext(); ) {
      let ti = $it15.next();
      if (ti.isNatural()) {
        continue;
      }
      let key = 'report.colony.tile.' + ti.getSuffix$() + '.header';
      this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(key, null, null, ReportCompactColonyPanel.stpld(key)));
    }
    for (const $it16 = this.goodsTypes.iterator(); $it16.hasNext(); ) {
      let gt = $it16.next();
      let icon = new ImageIcon()._ImageIcon$Image(this.lib.getSmallGoodsTypeImage(gt));
      let l = this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(null, icon, null, ReportCompactColonyPanel.stpl('report.colony.production.header').addNamed$String$Named('%goods%', gt));
      l.setEnabled(market == null || market.getArrears(gt) <= 0);
      this.reportPanel.add$Component(l);
    }
    let type$ = this.spec_.getDefaultUnitType$Player(this.getMyPlayer());
    let colonistIcon = new ImageIcon()._ImageIcon$Image(this.lib.getTinyUnitTypeImage$UnitType(type$));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel(null, colonistIcon, null, ReportCompactColonyPanel.stpld('report.colony.birth')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.making.header', null, null, ReportCompactColonyPanel.stpld('report.colony.making')));
    this.reportPanel.add$Component(this.newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel('report.colony.improve.header', null, null, ReportCompactColonyPanel.stpld('report.colony.improve')));
    this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'newline, span, growx');
  }
  /**
   * Update the panel.
   */
  update$$ReportCompactColonyPanel(): void {
    this.reportPanel.removeAll();
    let sb = new StringBuilder(64);
    sb.append('[l][c][c][c]');
    for (let i = 0; i < this.goodsTypes.size(); i++) {
      sb.append('[c]');
    }
    sb.append('[c][c][l][l][l]');
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('fillx, insets 0, gap 0 0', sb.toString(), ''));
    this.conciseHeaders(this.market);
    let summaries = new ArrayList();
    for (const $it17 = this.colonies.iterator(); $it17.hasNext(); ) {
      let cs = $it17.next();
      summaries.clear();
      for (const $it18 = cs.iterator(); $it18.hasNext(); ) {
        let c = $it18.next();
        let s = new ReportCompactColonyPanel$ColonySummary()._ReportCompactColonyPanel$ColonySummary(c, this.goodsTypes);
        summaries.add(s);
        this.updateColony(s);
      }
      if (cs.size() > 1) {
        this.updateCombinedColonies(summaries);
      }
      this.conciseHeaders(this.market);
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let game = this.getGame();
    let command = ae.getActionCommand();
    if (command.startsWith(ReportCompactColonyPanel.BUILDQUEUE)) {
      command = command.substring(ReportCompactColonyPanel.BUILDQUEUE.length);
      let colony = game.getFreeColGameObject$String$Class(command, $J.cls(Colony));
      if (colony != null) {
        this.getGUI().showBuildQueuePanel(colony).addClosingCallback(() => {
          this.update$$ReportCompactColonyPanel();
        });
        return;
      }
    } else {
      let colony = game.getFreeColGameObject$String$Class(command, $J.cls(Colony));
      if (colony != null) {
        this.getGUI().showColonyPanel(colony, null).addClosingCallback(() => {
          this.update$$ReportCompactColonyPanel();
        });
        return;
      }
    }
    super.actionPerformed(ae);
  }
  static $clinit() {
    ReportCompactColonyPanel.notWorkingPred = (u) => u.getState() !== Unit$UnitState.FORTIFIED && u.getState() !== Unit$UnitState.SENTRY;
    ReportCompactColonyPanel.reportGoodsPred = (gt) => (gt.isStorable() && !gt.isTradeGoods()) || gt.isLibertyType();
    ReportCompactColonyPanel.cAlarm = null;
  }
}

/**
 * Container class for all the information about a colony.
 */
export class ReportCompactColonyPanel$ColonySummary extends JObject {
  /**
   * The colony being summarized.
   */
  colony: Colony = null;
  /**
   * Possible tile improvements.
   */
  tileSuggestions: List<Colony$TileImprovementSuggestion> = null;
  /**
   * Famine warning required?
   */
  famine: boolean = false;
  /**
   * Turns to new colonist if positive, no colonist if zero,
   * -turns-1 to starvation if negative.
   */
  newColonist: number = 0;
  /**
   * Current production bonus.
   */
  bonus: number = 0;
  unitCount: number = 0;
  unitsToAdd: number = 0;
  unitsToRemove: number = 0;
  /**
   * Goods production.
   */
  production: JMap<GoodsType, ReportCompactColonyPanel$ColonySummary$GoodsProduction> = null;
  /**
   * Teacher units mapped to turns to complete.
   */
  teachers: JMap<Unit, number> = null;
  /**
   * Units present that are not working.
   */
  notWorking: List<Unit> = null;
  /**
   * Units present that might be working.
   */
  couldWork: List<UnitType> = null;
  /**
   * Suggested better unit use.
   */
  improve_: JMap<UnitType, WorkLocation$Suggestion> = null;
  /**
   * Suggested new unit use.
   */
  want: JMap<UnitType, WorkLocation$Suggestion> = null;
  /**
   * Currently building.
   */
  build_: BuildableType = null;
  completeTurns: number = 0;
  needed: AbstractGoods = null;
  /**
   * Create the colony summary.
   *
   * @param colony The {@code Colony} to summarize.
   * @param goodsTypes A list of {@code GoodsType}s to include
   *     in the summary.
   */
  _ReportCompactColonyPanel$ColonySummary(colony: Colony, goodsTypes: List<GoodsType>): this {
    this.tileSuggestions = new ArrayList();
    this.production = new HashMap();
    this.teachers = new HashMap();
    this.notWorking = new ArrayList();
    this.couldWork = new ArrayList();
    this.improve_ = new HashMap();
    this.want = new HashMap();
    this.colony = colony;
    let spec = colony.getSpecification();
    this.tileSuggestions.clear();
    this.tileSuggestions.addAll(colony.getTileImprovementSuggestions());
    let starve = colony.getStarvationTurns();
    if (starve < 0) {
      this.famine = false;
      this.newColonist = colony.getNewColonistTurns();
    } else {
      this.famine = starve <= Colony.FAMINE_TURNS;
      this.newColonist = (-starve - 1) | 0;
    }
    this.bonus = colony.getProductionBonus();
    this.unitCount = colony.getUnitCount();
    this.unitsToAdd = colony.getUnitsToAdd();
    this.unitsToRemove = colony.getUnitsToRemove();
    for (const $it19 = goodsTypes.iterator(); $it19.hasNext(); ) {
      let gt = $it19.next();
      this.produce(gt);
    }
    this.notWorking.addAll(CollectionUtils.transform$Stream$Predicate(colony.getTile$().getUnits(), ReportCompactColonyPanel.notWorkingPred));
    for (const $it20 = (CollectionUtils.transform$Stream$Predicate(colony.getAvailableWorkLocations(), ($p0) => $p0.canBeWorked())).iterator(); $it20.hasNext(); ) {
      let wl = $it20.next();
      if (wl.canTeach()) {
        for (const $it21 = wl.getUnitList().iterator(); $it21.hasNext(); ) {
          let u = $it21.next();
          this.teachers.put(u, (u.getNeededTurnsOfTraining() - u.getTurnsOfTraining()) | 0);
        }
        continue;
      }
      this.notWorking.addAll(CollectionUtils.transform$Stream$Predicate(wl.getUnits(), (u) => (u.getTeacher() == null && u.getWorkType() == null)));
      CollectionUtils.forEachMapEntry$Map$Consumer(wl.getSuggestions(), (e) => this.addSuggestion(((e.getKey() == null) ? this.want : this.improve_), spec.getExpertForProducing(e.getValue().goodsType), e.getValue()));
    }
    let couldWorkPred = (u) => {
      let wl = u.getWorkLocation();
      return wl != null && (wl.getWorkFor(u) == null || wl.getWorkFor(u) !== u.getWorkType());
    };
    this.couldWork.addAll(CollectionUtils.transform$Collection$Predicate$Function(this.notWorking, couldWorkPred, ($p0) => $p0.getType()));
    this.build_ = colony.getCurrentlyBuilding();
    if (this.build_ == null) {
      this.completeTurns = -1;
      this.needed = null;
    } else {
      let needed = new AbstractGoods()._AbstractGoods$();
      this.completeTurns = colony.getTurnsToComplete$BuildableType$AbstractGoods(this.build_, needed);
      this.needed = (this.completeTurns < 0) ? needed : null;
    }
    return this;
  }
  /**
   * Set the production map values for the given goods type.
   *
   * @param goodsType The {@code GoodsType} to use.
   */
  produce(goodsType: GoodsType): void {
    let exportData = this.colony.getExportData$GoodsType(goodsType);
    let adjustment = $J.idiv(this.colony.getWarehouseCapacity(), GoodsContainer.CARGO_SIZE);
    let low = Math.imul(exportData.getLowLevel(), adjustment);
    let high = Math.imul(exportData.getHighLevel(), adjustment);
    let amount = this.colony.getGoodsCount(goodsType);
    let p = this.colony.getAdjustedNetProductionOf(goodsType);
    let status: ReportCompactColonyPanel$ColonySummary$ProductionStatus;
    let deficit: AbstractGoods;
    let extra = 0;
    if (p < 0) {
      status = (amount < low) ? ReportCompactColonyPanel$ColonySummary$ProductionStatus.FAIL : ReportCompactColonyPanel$ColonySummary$ProductionStatus.BAD;
      extra = ($J.idiv(-amount, p) + 1) | 0;
    } else if (p === 0 && !this.colony.isProducing(goodsType)) {
      status = (this.colony.isConsuming(goodsType)) ? ReportCompactColonyPanel$ColonySummary$ProductionStatus.FAIL : ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE;
    } else if (p === 0) {
      status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.ZERO;
      extra = 0;
      deficit = null;
      for (const $it22 = this.colony.getWorkLocationsForProducing(goodsType).iterator(); $it22.hasNext(); ) {
        let wl = $it22.next();
        let pi = this.colony.getProductionInfo(wl);
        if (pi == null) {
          continue;
        }
        deficit = CollectionUtils.find$Collection$Predicate(pi.getConsumptionDeficit(), AbstractGoods.matches(goodsType));
        if (deficit != null) {
          status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.CONSUMPTION;
          extra = deficit.getAmount();
          break;
        }
      }
    } else if (exportData.getExported()) {
      status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXPORT;
      extra = exportData.getExportLevel();
    } else if (goodsType.limitIgnored()) {
      status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD;
    } else if (((amount + p) | 0) > this.colony.getWarehouseCapacity()) {
      status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.OVERFLOW;
      extra = (amount + p - this.colony.getWarehouseCapacity()) | 0;
    } else if (amount >= high) {
      status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXCESS;
      extra = $J.idiv(((this.colony.getWarehouseCapacity() - amount) | 0), p);
    } else {
      status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD;
      extra = 0;
      deficit = null;
      for (const $it23 = this.colony.getWorkLocationsForProducing(goodsType).iterator(); $it23.hasNext(); ) {
        let wl = $it23.next();
        let pi = this.colony.getProductionInfo(wl);
        if (pi == null) {
          continue;
        }
        deficit = CollectionUtils.find$Collection$Predicate(pi.getProductionDeficit(), AbstractGoods.matches(goodsType));
        if (deficit != null) {
          status = ReportCompactColonyPanel$ColonySummary$ProductionStatus.PRODUCTION;
          extra = deficit.getAmount();
          break;
        }
      }
    }
    this.production.put(goodsType, new ReportCompactColonyPanel$ColonySummary$GoodsProduction()._ReportCompactColonyPanel$ColonySummary$GoodsProduction(p, status, extra));
  }
  addSuggestion(suggestions: JMap<UnitType, WorkLocation$Suggestion>, expert: UnitType, suggestion: WorkLocation$Suggestion): void {
    if (suggestion == null || expert == null) {
      return;
    }
    let now = suggestions.get(expert);
    if (now == null || now.amount < suggestion.amount) {
      suggestions.put(expert, suggestion);
    }
  }
}

/**
 * Types of production for a given goods type.
 */
export class ReportCompactColonyPanel$ColonySummary$ProductionStatus extends JEnum {
  static FAIL: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static BAD: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static NONE: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static ZERO: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static GOOD: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static EXPORT: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static EXCESS: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static OVERFLOW: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static PRODUCTION: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static CONSUMPTION: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  static $VALUES: ReportCompactColonyPanel$ColonySummary$ProductionStatus[] = null;
  _ReportCompactColonyPanel$ColonySummary$ProductionStatus($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): ReportCompactColonyPanel$ColonySummary$ProductionStatus[] { return ReportCompactColonyPanel$ColonySummary$ProductionStatus.$VALUES.slice(); }
  static valueOf(name: string): ReportCompactColonyPanel$ColonySummary$ProductionStatus { return $J.enumValueOf(ReportCompactColonyPanel$ColonySummary$ProductionStatus, name); }
  static $clinit() {
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.FAIL = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('FAIL', 0);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.BAD = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('BAD', 1);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('NONE', 2);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.ZERO = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('ZERO', 3);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('GOOD', 4);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXPORT = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('EXPORT', 5);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXCESS = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('EXCESS', 6);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.OVERFLOW = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('OVERFLOW', 7);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.PRODUCTION = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('PRODUCTION', 8);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.CONSUMPTION = new ReportCompactColonyPanel$ColonySummary$ProductionStatus()._ReportCompactColonyPanel$ColonySummary$ProductionStatus('CONSUMPTION', 9);
    ReportCompactColonyPanel$ColonySummary$ProductionStatus.$VALUES = [ReportCompactColonyPanel$ColonySummary$ProductionStatus.FAIL, ReportCompactColonyPanel$ColonySummary$ProductionStatus.BAD, ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE, ReportCompactColonyPanel$ColonySummary$ProductionStatus.ZERO, ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD, ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXPORT, ReportCompactColonyPanel$ColonySummary$ProductionStatus.EXCESS, ReportCompactColonyPanel$ColonySummary$ProductionStatus.OVERFLOW, ReportCompactColonyPanel$ColonySummary$ProductionStatus.PRODUCTION, ReportCompactColonyPanel$ColonySummary$ProductionStatus.CONSUMPTION];
  }
}

/**
 * Container class for goods production.
 */
export class ReportCompactColonyPanel$ColonySummary$GoodsProduction extends JObject {
  /**
   * Binary accumulation operator for goods production.
   */
  static goodsProductionAccumulator: BinaryOperator<ReportCompactColonyPanel$ColonySummary$GoodsProduction> = null;
  amount: number = 0;
  status_: ReportCompactColonyPanel$ColonySummary$ProductionStatus = null;
  extra: number = 0;
  /**
   * Build a new goods production container.
   *
   * @param amount The amount of goods.
   * @param status The production status.
   * @param extra Extra production.
   */
  _ReportCompactColonyPanel$ColonySummary$GoodsProduction(amount: number, status: ReportCompactColonyPanel$ColonySummary$ProductionStatus, extra: number): this {
    this.amount = amount;
    this.status_ = status;
    this.extra = extra;
    return this;
  }
  /**
   * Accumulate other production into this one.
   *
   * @param other The other {@code GoodsProduction}.
   * @return This {@code GoodsProduction}.
   */
  accumulate(other: ReportCompactColonyPanel$ColonySummary$GoodsProduction): ReportCompactColonyPanel$ColonySummary$GoodsProduction {
    this.amount = (this.amount + other.amount) | 0;
    this.status_ = (this.status_ === ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE && other.status_ === ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE) ? ReportCompactColonyPanel$ColonySummary$ProductionStatus.NONE : (this.amount < 0) ? ReportCompactColonyPanel$ColonySummary$ProductionStatus.BAD : (this.amount > 0) ? ReportCompactColonyPanel$ColonySummary$ProductionStatus.GOOD : ReportCompactColonyPanel$ColonySummary$ProductionStatus.ZERO;
    this.extra = 0;
    return this;
  }
  static $clinit() {
    ReportCompactColonyPanel$ColonySummary$GoodsProduction.goodsProductionAccumulator = (g1, g2) => g1.accumulate(g2);
  }
}

$J.define(ReportCompactColonyPanel, 'net.sf.freecol.client.gui.panel.report.ReportCompactColonyPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportCompactColonyPanel' }, meths: { 'update()': 'update$$ReportCompactColonyPanel', 'newLabel(java.lang.String,javax.swing.ImageIcon,java.awt.Color,net.sf.freecol.common.model.StringTemplate)': 'newLabel$String$ImageIcon$Color$StringTemplate$ReportCompactColonyPanel', 'newLabel(java.lang.String,javax.swing.ImageIcon,java.awt.Color)': 'newLabel$String$ImageIcon$Color$ReportCompactColonyPanel' }, clinit: true, lazy: ['notWorkingPred', 'reportGoodsPred', 'cAlarm', 'cWarn', 'cPlain', 'cExport', 'cGood'] });
$J.define(ReportCompactColonyPanel$ColonySummary, 'net.sf.freecol.client.gui.panel.report.ReportCompactColonyPanel$ColonySummary', { kind: 'class', sup: 'java.lang.Object', ctors: { 'net.sf.freecol.common.model.Colony,java.util.List': '_ReportCompactColonyPanel$ColonySummary' } });
$J.define(ReportCompactColonyPanel$ColonySummary$ProductionStatus, 'net.sf.freecol.client.gui.panel.report.ReportCompactColonyPanel$ColonySummary$ProductionStatus', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_ReportCompactColonyPanel$ColonySummary$ProductionStatus' }, clinit: true, lazy: ['$VALUES', 'FAIL', 'BAD', 'NONE', 'ZERO', 'GOOD', 'EXPORT', 'EXCESS', 'OVERFLOW', 'PRODUCTION', 'CONSUMPTION'] });
$J.define(ReportCompactColonyPanel$ColonySummary$GoodsProduction, 'net.sf.freecol.client.gui.panel.report.ReportCompactColonyPanel$ColonySummary$GoodsProduction', { kind: 'class', sup: 'java.lang.Object', ctors: { 'int,net.sf.freecol.client.gui.panel.report.ReportCompactColonyPanel$ColonySummary$ProductionStatus,int': '_ReportCompactColonyPanel$ColonySummary$GoodsProduction' }, clinit: true, lazy: ['goodsProductionAccumulator'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Font = $J.load('java.awt.Font');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JSeparator = $J.load('javax.swing.JSeparator');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Building = $J.load('net.sf.freecol.common.model.Building');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  Constants = $J.load('net.sf.freecol.common.model.Constants');
  GoodsContainer = $J.load('net.sf.freecol.common.model.GoodsContainer');
  GoodsType = $J.load('net.sf.freecol.common.model.GoodsType');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  Unit$UnitState = $J.load('net.sf.freecol.common.model.Unit$UnitState');
  WorkLocation$Suggestion = $J.load('net.sf.freecol.common.model.WorkLocation$Suggestion');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
