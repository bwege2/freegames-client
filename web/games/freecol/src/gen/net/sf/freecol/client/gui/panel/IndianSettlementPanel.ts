// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/IndianSettlementPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Logger } from '../../../../../../../jre/index.ts';
import { FreeColPanel } from './FreeColPanel.ts';

let AbstractAction, ImageIcon, JLabel, SwingConstants, MigLayout, Utility, Messages, StringTemplate, Unit$UnitLabelType, ResourceManager;

/**
 * This panel is used to show information about an Indian settlement.
 */
export class IndianSettlementPanel extends FreeColPanel {
  static logger: Logger = null;
  /**
   * Creates a panel to show information about a native settlement.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param is The {@code IndianSettlement} to display.
   */
  _IndianSettlementPanel(freeColClient: FreeColClient, is$: IndianSettlement): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, null, new MigLayout()._MigLayout$String$String$String('wrap 2, gapx 20', '', ''));
    let lib = this.getImageLibrary();
    let settlementLabel = new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(lib.getScaledSettlementImage(is$)));
    let indian = is$.getOwner();
    let player = this.getMyPlayer();
    let contacted = is$.hasContacted(player);
    let visited = is$.hasVisited(player);
    let text = Messages.message$StringTemplate(is$.getLocationLabelFor(player)) + ', ' + Messages.message$StringTemplate((StringTemplate.template$String(is$.isCapital() ? 'indianSettlementPanel.indianCapital' : 'indianSettlementPanel.indianSettlement')).addStringTemplate$String$StringTemplate('%nation%', indian.getNationLabel()));
    let tension = is$.getAlarm$Player(player);
    if (tension != null) {
      text += ' (' + Messages.getName$Named(tension) + ')';
    }
    if (is$.worthScouting(player)) {
      text += ResourceManager.getString$String('unscoutedIndianSettlement');
    }
    settlementLabel.setText(text);
    this.add$Component(settlementLabel);
    let missionary = is$.getMissionary();
    if (missionary != null) {
      this.add$Component(Utility.localizedLabel$StringTemplate$Icon$int(missionary.getLabel$UnitLabelType(Unit$UnitLabelType.NATIONAL), new ImageIcon()._ImageIcon$Image(lib.getSmallUnitImage$Unit(missionary)), SwingConstants.CENTER));
    }
    this.add$Component$Object(Utility.localizedLabel$String('indianSettlementPanel.learnableSkill'), 'newline');
    let skillType = is$.getLearnableSkill();
    this.add$Component(Utility.localizedLabel$StringTemplate$Icon$int(is$.getLearnableSkillLabel(visited), ((visited && skillType != null) ? new ImageIcon()._ImageIcon$Image(lib.getSmallUnitTypeImage$UnitType(skillType)) : null), SwingConstants.CENTER));
    this.add$Component$Object(Utility.localizedLabel$String('indianSettlementPanel.mostHated'), 'newline');
    let mostHated = is$.getMostHated();
    this.add$Component(Utility.localizedLabel$StringTemplate$Icon$int(is$.getMostHatedLabel(contacted), ((contacted && mostHated != null) ? new ImageIcon()._ImageIcon$Image(lib.getSmallNationImage(mostHated.getNation())) : null), SwingConstants.CENTER));
    let gt: GoodsType;
    let wants = is$.getWantedGoodsLabel(0, player);
    this.add$Component$Object(Utility.localizedLabel$String('indianSettlementPanel.highlyWanted'), 'newline');
    let label = Utility.localizedLabel$StringTemplate$Icon$int(wants.get(0), ((visited && (gt = is$.getWantedGoods$int(0)) != null) ? new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(gt)) : null), SwingConstants.CENTER);
    if (wants.size() > 1) {
      Utility.localizeToolTip$JComponent$StringTemplate(label, wants.get(1));
    }
    this.add$Component(label);
    this.add$Component$Object(Utility.localizedLabel$String('indianSettlementPanel.otherWanted'), 'newline');
    let n = is$.getWantedGoodsCount();
    let x = 'split ' + ((n <= 1) ? '1' : String((n - 1) | 0));
    for (let i = 1; i < n; i++) {
      wants = is$.getWantedGoodsLabel(i, player);
      label = Utility.localizedLabel$StringTemplate$Icon$int(wants.get(0), ((visited && (gt = is$.getWantedGoods$int(i)) != null) ? new ImageIcon()._ImageIcon$Image(lib.getScaledGoodsTypeImage(gt)) : null), SwingConstants.CENTER);
      if (wants.size() > 1) {
        Utility.localizeToolTip$JComponent$StringTemplate(label, wants.get(1));
      }
      this.add$Component$Object(label, x);
      x = null;
    }
    this.add$Component$Object(this.okButton, 'newline 20, span, tag ok');
    this.setEscapeAction(new (IndianSettlementPanel$1())().$o(this)._AbstractAction$());
    this.setSize$Dimension(this.getPreferredSize$());
    return this;
  }
  static $clinit() {
    IndianSettlementPanel.logger = Logger.getLogger($J.cls(IndianSettlementPanel).getName());
  }
}

let $IndianSettlementPanel$1: any = null;
/** An anonymous class (IndianSettlementPanel.java:141). */
function IndianSettlementPanel$1(): any {
  return $IndianSettlementPanel$1 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.IndianSettlementPanel$1', []);
}

$J.define(IndianSettlementPanel, 'net.sf.freecol.client.gui.panel.IndianSettlementPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.IndianSettlement': '_IndianSettlementPanel' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  AbstractAction = $J.load('javax.swing.AbstractAction');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  Unit$UnitLabelType = $J.load('net.sf.freecol.common.model.Unit$UnitLabelType');
  ResourceManager = $J.load('net.sf.freecol.common.resources.ResourceManager');
});
