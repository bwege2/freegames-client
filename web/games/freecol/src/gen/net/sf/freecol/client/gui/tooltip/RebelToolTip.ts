// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/tooltip/RebelToolTip.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../../jre/index.ts';
import { JToolTip } from '../../../../../../javax/swing/JToolTip.ts';

let BorderLayout, JLabel, MigLayout, ModifierFormat, ProductionLabel, FreeColProgressBar, MigPanel, Utility, Messages, AbstractGoods, Colony, FeatureContainer, Modifier, StringTemplate, GameOptions, CollectionUtils;

/**
 * This panel provides detailed information about rebels in a colony.
 */
export class RebelToolTip extends JToolTip {
  /**
   * Creates a RebelToolTip.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colony The {@code Colony} for which to display information.
   */
  _RebelToolTip(freeColClient: FreeColClient, colony: Colony): this {
    this._JToolTip();
    let spec = colony.getSpecification();
    let libertyGoods = spec.getLibertyGoodsTypeList();
    let population = colony.getUnitCount();
    let solPercent = colony.getSonsOfLiberty();
    let rebelCount = Colony.calculateRebelCount(population, solPercent);
    let turn = colony.getGame().getTurn();
    this.setLayout(new BorderLayout()._BorderLayout$());
    let content = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String$String('fill, wrap 3', '[300px][50px, right][50px, right]', ''));
    content.add$Component(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('rebelToolTip.rebelLabel').addName$String$String('%number%', '')));
    content.add$Component(new JLabel()._JLabel$String(String(rebelCount)));
    content.add$Component(new JLabel()._JLabel$String(solPercent + '%'));
    content.add$Component(Utility.localizedLabel$StringTemplate(StringTemplate.template$String('rebelToolTip.royalistLabel').addName$String$String('%number%', '')));
    content.add$Component(new JLabel()._JLabel$String(String((population - rebelCount) | 0)));
    content.add$Component(new JLabel()._JLabel$String(((100 - solPercent) | 0) + '%'));
    let libertyProduction = 0;
    for (const $it0 = libertyGoods.iterator(); $it0.hasNext(); ) {
      let goodsType = $it0.next();
      content.add$Component(new JLabel()._JLabel$String(Messages.getName$Named(goodsType)));
      let production = colony.getNetProductionOf(goodsType);
      libertyProduction = (libertyProduction + production) | 0;
      content.add$Component$Object(new ProductionLabel()._ProductionLabel$FreeColClient$AbstractGoods(freeColClient, new AbstractGoods()._AbstractGoods$GoodsType$int(goodsType, production)), 'span 2');
    }
    libertyProduction = $J.d2i(FeatureContainer.applyModifiers$float$Turn$Stream(Math.fround(libertyProduction), turn, colony.getOwner().getModifiers$String(Modifier.LIBERTY)));
    CollectionUtils.forEach$Stream$Consumer(colony.getOwner().getModifiers$String(Modifier.LIBERTY), (m) => {
      for (let j of ModifierFormat.getModifierLabels(m, null, turn)) {
        content.add$Component(j);
      }
    });
    let capped = spec.getBoolean(GameOptions.BELL_ACCUMULATION_CAPPED) && colony.getSonsOfLiberty() >= 100;
    let liberty = colony.getLiberty();
    let modulo = liberty % Colony.LIBERTY_PER_REBEL;
    let progress = new FreeColProgressBar()._FreeColProgressBar$FreeColClient$GoodsType$int$int$int$int(freeColClient, libertyGoods.get(0), 0, Colony.LIBERTY_PER_REBEL, modulo, ((capped) ? 0 : libertyProduction));
    content.add$Component$Object(progress, 'span 3, alignx center, height 20:');
    let turnsNext = -1;
    let turns50 = -1;
    let turns100 = -1;
    if (libertyProduction > 0 && !capped) {
      let bonus = colony.rebelHelper(libertyProduction);
      turnsNext = bonus.get(0);
      turns50 = bonus.get(1);
      turns100 = bonus.get(2);
    }
    let na = Messages.message$String('notApplicable');
    content.add$Component(Utility.localizedLabel$String('rebelToolTip.nextMember'));
    content.add$Component$Object(new JLabel()._JLabel$String((turnsNext < 0) ? na : String($J.d2i(Math.ceil(turnsNext)))), 'skip');
    if (turns50 > 0) {
      content.add$Component(Utility.localizedLabel$String('rebelToolTip.50percent'));
      content.add$Component$Object(new JLabel()._JLabel$String(String($J.d2i(Math.ceil(turns50)))), 'skip');
    }
    if (turns100 > 0) {
      content.add$Component(Utility.localizedLabel$String('rebelToolTip.100percent'));
      content.add$Component$Object(new JLabel()._JLabel$String(String($J.d2i(Math.ceil(turns100)))), 'skip');
    }
    let grow = colony.getPreferredSizeChange();
    if (grow >= Colony.CHANGE_UPPER_BOUND) {
      content.add$Component(Utility.localizedLabel$String('rebelToolTip.changeMore'));
      content.add$Component$Object(Utility.localizedLabel$String('many'), 'skip');
    } else if (grow >= 0) {
      content.add$Component(Utility.localizedLabel$String('rebelToolTip.changeMore'));
      content.add$Component$Object(new JLabel()._JLabel$String(String(grow)), 'skip');
    } else {
      content.add$Component(Utility.localizedLabel$String('rebelToolTip.changeLess'));
      content.add$Component$Object(new JLabel()._JLabel$String(String(-grow)), 'skip');
    }
    this.setPreferredSize(content.getPreferredSize$());
    this.add$Component$Object(content, BorderLayout.CENTER);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.setLayout(null);
  }
}

$J.define(RebelToolTip, 'net.sf.freecol.client.gui.tooltip.RebelToolTip', { kind: 'class', sup: 'javax.swing.JToolTip', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.common.model.Colony': '_RebelToolTip' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  JLabel = $J.load('javax.swing.JLabel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  ProductionLabel = $J.load('net.sf.freecol.client.gui.label.ProductionLabel');
  FreeColProgressBar = $J.load('net.sf.freecol.client.gui.panel.FreeColProgressBar');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  AbstractGoods = $J.load('net.sf.freecol.common.model.AbstractGoods');
  Colony = $J.load('net.sf.freecol.common.model.Colony');
  FeatureContainer = $J.load('net.sf.freecol.common.model.FeatureContainer');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  GameOptions = $J.load('net.sf.freecol.common.option.GameOptions');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
