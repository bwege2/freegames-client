// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/ResourcesDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Collectors, JString } from '../../../../../../../../jre/index.ts';
import { ColopediaGameObjectTypePanel } from './ColopediaGameObjectTypePanel.ts';

let JPanel, MigLayout, ModifierFormat, ColopediaAction$PanelType, Utility, Messages, Modifier, CollectionUtils;

/**
 * This panel displays details of resources in the Colopedia.
 */
export class ResourcesDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Creates a new instance of this ColopediaDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent ColopediaPanel.
   */
  _ResourcesDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.RESOURCES.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    super.addSubTrees$DefaultMutableTreeNode$List(root, this.getSpecification().getResourceTypeList());
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(this.getId(), id)) {
      return;
    }
    let spec = this.getSpecification();
    let type$ = spec.getResourceType(id);
    panel.setLayout(new MigLayout()._MigLayout$String$String('wrap 2', '[]20[]'));
    let name = Utility.localizedHeaderLabel$Named$String(type$, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(name, 'span, align center, wrap 40');
    panel.add$Component(Utility.localizedLabel$String('colopedia.resource.bonusProduction'));
    let goodsPanel = new JPanel()._JPanel$();
    goodsPanel.setOpaque(false);
    let mods = CollectionUtils.sort$Stream$Comparator(type$.getModifiers$(), Modifier.ascendingModifierIndexComparator);
    for (const $it0 = mods.iterator(); $it0.hasNext(); ) {
      let modifier = $it0.next();
      let text = ModifierFormat.getModifierAsString(modifier);
      if (modifier.hasScope()) {
        let scopes = CollectionUtils.transform$Stream$Predicate$Function$Collector(modifier.getScopes(), CollectionUtils.isNotNull$Function(($p0) => $p0.getType()), (s) => Messages.getName$Named(spec.getType(s.getType())), Collectors.joining(', '));
        if (!(scopes.length === 0)) {
          text += ' (' + scopes + ')';
        }
      }
      let goodsType = spec.getGoodsType(modifier.getId());
      let goodsButton = this.getGoodsButton$GoodsType$String(goodsType, text);
      goodsPanel.add$Component(goodsButton);
    }
    panel.add$Component(goodsPanel);
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.resource.description'), 'newline 20');
    panel.add$Component$Object(Utility.localizedTextArea$String$int(Messages.descriptionKey$ObjectWithId(type$), 30), 'growx');
  }
}

$J.define(ResourcesDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.ResourcesDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_ResourcesDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  JPanel = $J.load('javax.swing.JPanel');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  Modifier = $J.load('net.sf.freecol.common.model.Modifier');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
});
