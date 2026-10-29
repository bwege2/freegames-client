// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/UnitDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, JString } from '../../../../../../../../jre/index.ts';
import { ColopediaGameObjectTypePanel } from './ColopediaGameObjectTypePanel.ts';

let GridLayout, JLabel, JPanel, MigLayout, ModifierFormat, ColopediaAction$PanelType, Utility, Messages, Ability, Modifier, StringTemplate, CollectionUtils;

/**
 * This panel displays details of units in the Colopedia.
 */
export class UnitDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Layout of production modifier panel.
   */
  static readonly MODIFIERS_PER_ROW: number = 5;
  /**
   * Creates a new instance of this colopedia subpanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _UnitDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.UNITS.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    super.addSubTrees$DefaultMutableTreeNode$String$List(root, this.getId(), new ArrayList(this.getSpecification().getUnitTypeList()));
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(this.getId(), id)) {
      return;
    }
    let spec = this.getSpecification();
    let type$ = spec.getUnitType(id);
    panel.setLayout(new MigLayout()._MigLayout$String$String('wrap 4', '[]20[]40[]20[]'));
    let name = Utility.localizedHeaderLabel$Named$String(type$, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(name, 'span, align center, wrap 40');
    panel.add$Component(Utility.localizedLabel$String('colopedia.unit.offensivePower'));
    panel.add$Component$Object(new JLabel()._JLabel$String(String($J.d2i(type$.getOffence()))), 'right');
    panel.add$Component(Utility.localizedLabel$String('colopedia.unit.defensivePower'));
    panel.add$Component$Object(new JLabel()._JLabel$String(String($J.d2i(type$.getDefence()))), 'right');
    panel.add$Component(Utility.localizedLabel$String('colopedia.unit.movement'));
    panel.add$Component$Object(new JLabel()._JLabel$String(String($J.idiv(type$.getMovement(), 3))), 'right');
    if (type$.canCarryGoods() || type$.canCarryUnits()) {
      panel.add$Component(Utility.localizedLabel$String('colopedia.unit.capacity'));
      panel.add$Component$Object(new JLabel()._JLabel$String(String(type$.getSpace())), 'right');
    }
    let player = this.getMyPlayer();
    let europe = (player == null) ? null : player.getEurope();
    let price = null;
    if (europe != null && europe.getUnitPrice(type$) > 0) {
      price = String(europe.getUnitPrice(type$));
    } else if (type$.getPrice() > 0) {
      price = String(type$.getPrice());
    }
    if (price != null) {
      panel.add$Component(Utility.localizedLabel$String('colopedia.unit.price'));
      panel.add$Component$Object(new JLabel()._JLabel$String(price), 'right');
    }
    if (type$.hasSkill()) {
      panel.add$Component(Utility.localizedLabel$String('colopedia.unit.skill'));
      panel.add$Component$Object(new JLabel()._JLabel$String(String(type$.getSkill())), 'right');
      let schools = CollectionUtils.transform$Collection$Predicate(spec.getBuildingTypeList(), (bt) => bt.hasAbility$String(Ability.TEACH) && bt.canAdd(type$));
      if (!schools.isEmpty()) {
        panel.add$Component$Object(Utility.localizedLabel$String('colopedia.unit.school'), 'newline');
        let count = 0;
        for (const $it0 = schools.iterator(); $it0.hasNext(); ) {
          let school = $it0.next();
          let label = this.getButton$FreeColSpecObjectType(school);
          if (count > 0 && count % 3 === 0) {
            panel.add$Component$Object(label, 'skip');
          } else {
            panel.add$Component(label);
          }
          count++;
        }
      }
      let nations = CollectionUtils.transform$Collection$Predicate(spec.getIndianNationTypes(), (nt) => CollectionUtils.any$Collection$Predicate(nt.getSkills(), CollectionUtils.matchKey$Object$Function(type$, ($p0) => $p0.getObject())));
      if (!nations.isEmpty()) {
        panel.add$Component$Object(Utility.localizedLabel$String('colopedia.unit.natives'), 'newline');
        let count = 0;
        for (const $it1 = nations.iterator(); $it1.hasNext(); ) {
          let nation = $it1.next();
          let label = this.getButton$FreeColSpecObjectType(nation);
          if (count > 0 && count % 3 === 0) {
            panel.add$Component$Object(label, 'skip');
          } else {
            panel.add$Component(label);
          }
          count++;
        }
      }
    }
    let abilities = type$.getRequiredAbilities();
    if (!abilities.isEmpty()) {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.unit.requirements'), 'newline, top');
      let textPane = Utility.getDefaultTextPane$();
      let doc = textPane.getStyledDocument();
      CollectionUtils.forEachMapEntry$Map$Consumer(type$.getRequiredAbilities(), (e) => this.appendRequiredAbility(doc, e.getKey(), e.getValue()));
      panel.add$Component$Object(textPane, 'span, width 60%');
    }
    let goodsMapper = (gt) => type$.getModifiers$String(gt.getId());
    let bonusList = CollectionUtils.sort$Stream$Comparator(CollectionUtils.flatten$Collection$Function(spec.getGoodsTypeList(), goodsMapper), Modifier.ascendingModifierIndexComparator);
    let bonusNumber = bonusList.size();
    if (bonusNumber > 0) {
      let template = StringTemplate.template$String('colopedia.unit.productionBonus').addAmount('%number%', bonusNumber);
      panel.add$Component$Object(Utility.localizedLabel$StringTemplate(template), 'newline 20, top');
      let productionPanel = new JPanel()._JPanel$LayoutManager(new GridLayout()._GridLayout$int$int(0, UnitDetailPanel.MODIFIERS_PER_ROW));
      productionPanel.setOpaque(false);
      for (const $it2 = bonusList.iterator(); $it2.hasNext(); ) {
        let productionBonus = $it2.next();
        let goodsType = spec.getGoodsType(productionBonus.getId());
        let bonus = ModifierFormat.getModifierAsString(productionBonus);
        productionPanel.add$Component(this.getGoodsButton$GoodsType$String(goodsType, bonus));
      }
      panel.add$Component$Object(productionPanel, 'span');
    }
    if (type$.needsGoodsToBuild()) {
      panel.add$Component$Object(Utility.localizedLabel$String('colopedia.unit.goodsRequired'), 'newline 20');
      let required = type$.getRequiredGoodsList$();
      let goods = CollectionUtils.first$Collection(required);
      if (required.size() > 1) {
        panel.add$Component$Object(this.getGoodsButton$GoodsType$int(goods.getType(), goods.getAmount()), 'span, split ' + required.size());
        for (let index = 1; index < required.size(); index++) {
          goods = required.get(index);
          panel.add$Component(this.getGoodsButton$GoodsType$int(goods.getType(), goods.getAmount()));
        }
      } else {
        panel.add$Component(this.getGoodsButton$GoodsType$int(goods.getType(), goods.getAmount()));
      }
    }
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.unit.description'), 'newline 20');
    panel.add$Component$Object(Utility.localizedTextArea$String$int(Messages.descriptionKey$ObjectWithId(type$), 30), 'span');
  }
}

$J.define(UnitDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.UnitDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_UnitDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  GridLayout = $J.load('java.awt.GridLayout');
  JLabel = $J.load('javax.swing.JLabel');
  JPanel = $J.load('javax.swing.JPanel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Ability = $J.load('net.sf.freecol.common.model.Ability');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  StringTemplate = $J.load('net.sf.freecol.common.model.StringTemplate');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
