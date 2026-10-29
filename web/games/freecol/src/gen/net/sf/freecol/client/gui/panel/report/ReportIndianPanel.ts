// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/report/ReportIndianPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, BufferedImage, JString } from '../../../../../../../../jre/index.ts';
import { ReportPanel } from './ReportPanel.ts';

let ImageIcon, JLabel, JSeparator, SwingConstants, MigLayout, FontLibrary, FreeColPanel, Utility, Messages, Ability, StringTemplate, Unit$UnitLabelType, ResourceManager, CollectionUtils;

/**
 * This panel displays the Native Affairs Advisor.
 */
export class ReportIndianPanel extends ReportPanel {
  static headlines: string[] = null;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ReportIndianPanel(freeColClient: FreeColClient): this {
    this._ReportPanel(freeColClient, 'reportIndianAction');
    let player = this.getMyPlayer();
    this.reportPanel.setLayout(new MigLayout()._MigLayout$String$String$String('wrap 6, fillx, insets 0', '[]20px[center]', '[top]'));
    let needsSeperator = false;
    for (const $it0 = (CollectionUtils.transform$Stream$Predicate(this.getGame().getLiveNativePlayers([]), (p) => player.hasContacted(p))).iterator(); $it0.hasNext(); ) {
      let opponent = $it0.next();
      if (needsSeperator) {
        this.reportPanel.add$Component$Object(new JSeparator()._JSeparator$int(SwingConstants.HORIZONTAL), 'newline 20, span, growx, wrap 20');
      }
      this.buildIndianAdvisorPanel(player, opponent);
      needsSeperator = true;
    }
    this.scrollPane.getViewport().setOpaque(false);
    this.reportPanel.setOpaque(true);
    this.reportPanel.doLayout();
    return this;
  }
  buildIndianAdvisorPanel(player: Player, opponent: Player): void {
    let ns = this.igc().nationSummary(opponent);
    let nativeSettlements = opponent.getIndianSettlementList();
    let numSettlements = String(nativeSettlements.size()) + ' / ' + ((ns == null) ? '?' : String(ns.getNumberOfSettlements()));
    let lib = this.getImageLibrary();
    let villageLabel = new JLabel()._JLabel$();
    villageLabel.setIcon(new ImageIcon()._ImageIcon$Image(lib.getScaledSettlementTypeImage(opponent.getNationType().getCapitalType())));
    this.reportPanel.add$Component$Object(villageLabel, FreeColPanel.SPAN_SPLIT_2);
    let headline = Utility.localizedLabel$StringTemplate(opponent.getNationLabel());
    headline.setFont(FontLibrary.getScaledFont$String('normal-bold-small'));
    this.reportPanel.add$Component$Object(headline, 'wrap 20, aligny center');
    let label = Utility.localizedLabel$String('report.indian.chieftain');
    let font = FontLibrary.getScaledFont$String('normal-bold-tiny');
    label.setFont(font);
    this.reportPanel.add$Component(label);
    this.reportPanel.add$Component$Object(Utility.localizedLabel$String(opponent.getName()), 'left, wrap');
    label = Utility.localizedLabel$String('report.indian.typeOfSettlements');
    label.setFont(font);
    this.reportPanel.add$Component(label);
    this.reportPanel.add$Component$Object(Utility.localizedLabel$String(Messages.nameKey$String(opponent.getNationType().getCapitalType().getId())), 'left, wrap');
    label = Utility.localizedLabel$String('report.indian.numberOfSettlements');
    this.reportPanel.add$Component(label);
    label.setFont(font);
    this.reportPanel.add$Component$Object(new JLabel()._JLabel$String(numSettlements), 'left, wrap');
    label = Utility.localizedLabel$String('report.indian.tribeTension');
    this.reportPanel.add$Component(label);
    label.setFont(font);
    this.reportPanel.add$Component$Object(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('report.indian.tensionStance').addNamed$String$Named('%tension%', opponent.getTension$Player(player)).addNamed$String$Named('%stance%', opponent.getStance(player))), 'left, wrap 20');
    if (nativeSettlements.isEmpty()) {
      this.reportPanel.add$Component(Utility.localizedLabel$String('report.indian.noKnownSettlements'));
    } else {
      for (let key of ReportIndianPanel.headlines) {
        let head = Utility.localizedLabel$String(key);
        head.setFont(font);
        this.reportPanel.add$Component(head);
      }
      let settlements = new ArrayList(nativeSettlements.size());
      for (const $it1 = nativeSettlements.iterator(); $it1.hasNext(); ) {
        let is$ = $it1.next();
        if (is$.isCapital()) {
          settlements.add(0, is$);
        } else {
          settlements.add(is$);
        }
      }
      for (const $it2 = settlements.iterator(); $it2.hasNext(); ) {
        let is$ = $it2.next();
        let tile = is$.getTile$();
        let known = tile.isExplored();
        let contacted = is$.hasContacted(player);
        let visited = is$.hasVisited(player);
        let locationName = Messages.message$StringTemplate(is$.getLocationLabelFor(player));
        if (known && is$.isCapital()) {
          locationName += ResourceManager.getString$String('indianSettlementChip.capital');
        }
        if (is$.worthScouting(player)) {
          locationName += ResourceManager.getString$String('unscoutedIndianSettlement');
        }
        let settlementButton = Utility.getLinkButton(locationName, null, is$.getTile$().getId());
        Utility.localizeToolTip$JComponent$StringTemplate(settlementButton, is$.getTile$().getLocationLabelFor(player));
        settlementButton.addActionListener($J.fn(this, 'actionPerformed'));
        this.reportPanel.add$Component$Object(settlementButton, 'newline 15');
        let missionary = is$.getMissionary();
        let missionLabel = new JLabel()._JLabel$String('');
        if (missionary != null) {
          let dummy = new BufferedImage(1, 1, 2);
          let g = dummy.createGraphics();
          missionLabel.setIcon(new ImageIcon()._ImageIcon$Image(lib.getMissionChip(g, missionary.getOwner(), missionary.hasAbility$String(Ability.EXPERT_MISSIONARY))));
          g.dispose();
          Utility.localizeToolTip$JComponent$String(missionLabel, Messages.message$StringTemplate(missionary.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL)));
        }
        this.reportPanel.add$Component(missionLabel);
        this.reportPanel.add$Component(Utility.localizedLabel$String(is$.getAlarmLevelKey(player)));
        let skillType = is$.getLearnableSkill();
        let skillLabel: JLabel;
        if (visited && skillType != null) {
          skillLabel = new JLabel()._JLabel$String('');
          skillLabel.setIcon(new ImageIcon()._ImageIcon$Image(lib.getSmallUnitTypeImage$UnitType(skillType)));
          Utility.localizeToolTip$JComponent$String(skillLabel, Messages.message$StringTemplate(is$.getLearnableSkillLabel(visited)));
        } else {
          skillLabel = Utility.localizedLabel$StringTemplate(is$.getLearnableSkillLabel(visited));
        }
        this.reportPanel.add$Component(skillLabel);
        this.reportPanel.add$Component(Utility.localizedLabel$StringTemplate(is$.getMostHatedLabel(contacted)));
        let n = (visited) ? is$.getWantedGoodsCount() : 1;
        let x = (n > 1) ? 'split ' + String(n) : null;
        for (let i = 0; i < n; i++) {
          let goodsLabel: JLabel;
          let gt: GoodsType;
          let gl = is$.getWantedGoodsLabel(i, player);
          if (visited && (gt = is$.getWantedGoods$int(i)) != null) {
            goodsLabel = new JLabel()._JLabel$String('');
            goodsLabel.setIcon(new ImageIcon()._ImageIcon$Image(lib.getSmallGoodsTypeImage(gt)));
            Utility.localizeToolTip$JComponent$String(goodsLabel, Messages.message$StringTemplate(gl.get(0)));
          } else {
            goodsLabel = Utility.localizedLabel$StringTemplate(gl.get(0));
          }
          this.reportPanel.add$Component$Object(goodsLabel, x);
          x = null;
        }
      }
    }
  }
  static $clinit() {
    ReportIndianPanel.headlines = ['settlement', 'mission', 'report.indian.tension', 'skillTaught', 'report.indian.mostHated', 'report.indian.tradeInterests'];
  }
}

$J.define(ReportIndianPanel, 'net.sf.freecol.client.gui.panel.report.ReportIndianPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.report.ReportPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ReportIndianPanel' }, clinit: true, lazy: ['headlines'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  JSeparator = $J.load('javax.swing.JSeparator');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FontLibrary = $J.load('net.sf.freecol.client.gui.FontLibrary');
  FreeColPanel = $J.load('net.sf.freecol.client.gui.panel.FreeColPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
