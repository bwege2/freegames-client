// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/TerrainDetailPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JString } from '../../../../../../../../jre/index.ts';
import { ColopediaGameObjectTypePanel } from './ColopediaGameObjectTypePanel.ts';

let Dimension, ImageIcon, JLabel, DefaultMutableTreeNode, MigLayout, ImageLibrary, ModifierFormat, ColopediaAction$PanelType, Utility, ColopediaTreeItem, Messages, CollectionUtils, ImageUtils;

/**
 * This panel displays details of terrain types in the Colopedia.
 */
export class TerrainDetailPanel extends ColopediaGameObjectTypePanel {
  /**
   * Creates a new instance of this TerrainDetailPanel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent {@code ColopediaPanel}.
   */
  _TerrainDetailPanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel): this {
    this._ColopediaGameObjectTypePanel(freeColClient, colopediaPanel, ColopediaAction$PanelType.TERRAIN.getKey());
    return this;
  }
  /**
   * {@inheritDoc}
   */
  addSubTrees$DefaultMutableTreeNode(root: DefaultMutableTreeNode): void {
    let node = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, this.getId(), this.getName$(), null));
    for (const $it0 = this.getSpecification().getTileTypeList().iterator(); $it0.hasNext(); ) {
      let t = $it0.next();
      let size = this.getListItemIconSize();
      let tileImage = this.getImageLibrary().getTileImageWithOverlayAndForest(t, new Dimension()._Dimension$int$int(-1, size.height_));
      let icon = new ImageIcon()._ImageIcon$Image(ImageUtils.createCenteredImage$BufferedImage$Dimension(tileImage, size));
      node.add(this.buildItem(t, icon));
    }
    root.add(node);
  }
  /**
   * {@inheritDoc}
   */
  buildDetail$String$JPanel(id: string, panel: JPanel): void {
    if ($J.equals(this.getId(), id)) {
      return;
    }
    let tileType = this.getSpecification().getTileType(id);
    panel.setLayout(new MigLayout()._MigLayout$String('wrap 4, gap 20'));
    let movementCost = String($J.idiv(tileType.getBasicMoveCost(), 3));
    let defenseBonus = Messages.message$String('none');
    let defenceModifier = CollectionUtils.first$Collection(tileType.getDefenceModifiers());
    if (defenceModifier != null) {
      defenseBonus = ModifierFormat.getModifierAsString(defenceModifier);
    }
    let nameLabel = Utility.localizedHeaderLabel$Named$String(tileType, Utility.FONTSPEC_SUBTITLE);
    panel.add$Component$Object(nameLabel, 'span, align center');
    panel.add$Component$Object(Utility.localizedLabel$String('colopedia.terrain.terrainImage'), 'spany 3');
    let terrainImage = this.getImageLibrary().getTileImageWithOverlayAndForest(tileType, ImageLibrary.TILE_OVERLAY_SIZE);
    panel.add$Component$Object(new JLabel()._JLabel$Icon(new ImageIcon()._ImageIcon$Image(terrainImage)), 'spany 3');
    let resourceList = tileType.getResourceTypeValues();
    let rt = CollectionUtils.first$Collection(resourceList);
    if (rt != null) {
      panel.add$Component(Utility.localizedLabel$String('colopedia.terrain.resource'));
      if (resourceList.size() > 1) {
        panel.add$Component$Object(this.getResourceButton(rt), 'split ' + resourceList.size());
        for (let index = 1; index < resourceList.size(); index++) {
          panel.add$Component(this.getResourceButton(resourceList.get(index)));
        }
      } else {
        panel.add$Component(this.getResourceButton(rt));
      }
    } else {
      panel.add$Component$Object(new JLabel()._JLabel$(), 'wrap');
    }
    panel.add$Component(Utility.localizedLabel$String('colopedia.terrain.movementCost'));
    panel.add$Component(new JLabel()._JLabel$String(movementCost));
    panel.add$Component(Utility.localizedLabel$String('colopedia.terrain.defenseBonus'));
    panel.add$Component(new JLabel()._JLabel$String(defenseBonus));
    panel.add$Component(Utility.localizedLabel$String('colopedia.terrain.unattendedProduction'));
    this.addProduction(panel, tileType.getPossibleProduction(true));
    panel.add$Component(Utility.localizedLabel$String('colopedia.terrain.colonistProduction'));
    this.addProduction(panel, tileType.getPossibleProduction(false));
    panel.add$Component(Utility.localizedLabel$String('colopedia.terrain.description'));
    panel.add$Component$Object(Utility.localizedTextArea$String(Messages.descriptionKey$ObjectWithId(tileType)), 'span, growx');
  }
  addProduction(panel: JPanel, production: Stream<AbstractGoods>): void {
    let pro = CollectionUtils.transform$Stream$Predicate(production, ($p0) => $p0.isPositive());
    let tag = null;
    switch (pro.size()) {
      case 0:
        panel.add$Component$Object(new JLabel()._JLabel$(), 'wrap');
        break;
      case 1:
        tag = 'span';
        break;
      default:
        tag = 'span, split ' + pro.size();
        break;
    }
    for (const $it1 = pro.iterator(); $it1.hasNext(); ) {
      let ag = $it1.next();
      panel.add$Component$Object(this.getGoodsButton$GoodsType$int(ag.getType(), ag.getAmount()), tag);
      tag = null;
    }
  }
}

$J.define(TerrainDetailPanel, 'net.sf.freecol.client.gui.panel.colopedia.TerrainDetailPanel', { kind: 'class', sup: 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel': '_TerrainDetailPanel' }, meths: { 'buildDetail(java.lang.String,javax.swing.JPanel)': 'buildDetail$String$JPanel', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode)': 'addSubTrees$DefaultMutableTreeNode' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  ColopediaAction$PanelType = $J.load('net.sf.freecol.client.gui.action.ColopediaAction$PanelType');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
