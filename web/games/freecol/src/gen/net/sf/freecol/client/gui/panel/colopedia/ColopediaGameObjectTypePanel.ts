// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/ColopediaGameObjectTypePanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, Exception, Level, Logger } from '../../../../../../../../jre/index.ts';
import { FreeColPanel } from '../FreeColPanel.ts';

let ImageIcon, JLabel, SwingConstants, BadLocationException, StyleConstants, DefaultMutableTreeNode, ModifierFormat, Utility, ColopediaTreeItem, Messages, CollectionUtils, ImageUtils;

/**
 * This panel displays details of game objects in the Colopedia.
 */
export class ColopediaGameObjectTypePanel<T> extends FreeColPanel {
  static logger: Logger = null;
  /**
   * The enclosing colopedia panel.
   */
  colopediaPanel: ColopediaPanel = null;
  /**
   * The specific panel id.
   */
  id_: string = null;
  /**
   * Create a new Colopedia game object type panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param colopediaPanel The parent {@code ColopediaPanel}.
   * @param id The panel type identifier.
   */
  _ColopediaGameObjectTypePanel(freeColClient: FreeColClient, colopediaPanel: ColopediaPanel, id: string): this {
    this._FreeColPanel$FreeColClient(freeColClient);
    this.colopediaPanel = colopediaPanel;
    this.id_ = 'colopediaAction.' + id;
    return this;
  }
  /**
   * Get the panel id.
   *
   * @return The panel id, usually "colopediaAction.*".
   */
  getId(): string {
    return this.id_;
  }
  /**
   * Get the name of this ColopediaDetailPanel, which is generally
   * used to label the root node of its sub-tree.
   *
   * @return The panel name.
   */
  getName$(): string {
    return Messages.getName$String(this.id_);
  }
  /**
   * Builds a subtree including all the given objects.
   *
   * @param root a {@code DefaultMutableTreeNode}
   * @param types a List of FreeColSpecObjectTypes
   */
  addSubTrees$DefaultMutableTreeNode$List(root: DefaultMutableTreeNode, types: List<T>): void {
    this.addSubTrees$DefaultMutableTreeNode$String$List(root, this.id_, types);
  }
  /**
   * Builds a subtree including all the given objects.
   *
   * @param root a {@code DefaultMutableTreeNode}
   * @param id The object identifier of the new branch node.
   * @param types a List of FreeColSpecObjectTypes
   */
  addSubTrees$DefaultMutableTreeNode$String$List(root: DefaultMutableTreeNode, id: string, types: List<T>): void {
    let lib = this.getImageLibrary();
    let name = this.getName$();
    let cti = new ColopediaTreeItem()._ColopediaTreeItem(this, id, name, null);
    let node = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(cti);
    for (const $it0 = types.iterator(); $it0.hasNext(); ) {
      let type$ = $it0.next();
      let image = ImageUtils.createCenteredImage$BufferedImage$Dimension(lib.getObjectImage$FreeColObject(type$), this.getListItemIconSize());
      node.add(this.buildItem(type$, new ImageIcon()._ImageIcon$Image(image)));
    }
    root.add(node);
  }
  buildItem(type$: FreeColSpecObjectType, icon: ImageIcon): DefaultMutableTreeNode {
    let name = Messages.getName$Named(type$);
    return new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(this, type$.getId(), name, icon));
  }
  getButton$FreeColSpecObjectType$String$ImageIcon(type$: FreeColSpecObjectType, text: string, icon: ImageIcon): JButton {
    let button = Utility.getLinkButton((text != null) ? text : Messages.getName$Named(type$), icon, type$.getId());
    button.addActionListener($J.fn(this.colopediaPanel, 'actionPerformed'));
    return button;
  }
  getButton$PanelType$String$ImageIcon(panelType: ColopediaAction$PanelType, text: string, icon: ImageIcon): JButton {
    let button = Utility.getLinkButton(text, icon, 'colopediaAction.' + panelType.getKey());
    button.addActionListener($J.fn(this.colopediaPanel, 'actionPerformed'));
    return button;
  }
  getButton$FreeColSpecObjectType(type$: FreeColSpecObjectType): JButton {
    return this.getButton$FreeColSpecObjectType$String$ImageIcon(type$, null, null);
  }
  getResourceButton(resourceType: ResourceType): JButton {
    return this.getButton$FreeColSpecObjectType$String$ImageIcon(resourceType, null, new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledResourceTypeImage(resourceType)));
  }
  getGoodsButton$GoodsType(goodsType: GoodsType): JButton {
    return this.getGoodsButton$GoodsType$String(goodsType, null);
  }
  getGoodsButton$GoodsType$int(goodsType: GoodsType, amount: number): JButton {
    return this.getGoodsButton$GoodsType$String(goodsType, String(amount));
  }
  getGoodsButton$AbstractGoods(goods: AbstractGoods): JButton {
    return this.getGoodsButton$GoodsType$int(goods.getType(), goods.getAmount());
  }
  getGoodsButton$GoodsType$String(goodsType: GoodsType, text: string): JButton {
    let result = this.getButton$FreeColSpecObjectType$String$ImageIcon(goodsType, text, new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getScaledGoodsTypeImage(goodsType)));
    result.setToolTipText(Messages.getName$Named(goodsType));
    return result;
  }
  getUnitButton$AbstractUnit(au: AbstractUnit): JButton {
    return this.getUnitButton$UnitType$String(au.getType(this.getSpecification()), au.getRoleId());
  }
  getUnitButton$UnitType$String(unitType: UnitType, roleId: string): JButton {
    let unitIcon = new ImageIcon()._ImageIcon$Image(this.getImageLibrary().getSmallUnitTypeImage$UnitType$String$boolean(unitType, roleId, false));
    let unitButton = this.getButton$FreeColSpecObjectType$String$ImageIcon(unitType, null, unitIcon);
    unitButton.setHorizontalAlignment(SwingConstants.LEFT);
    return unitButton;
  }
  getUnitButton$UnitType(unitType: UnitType): JButton {
    return this.getUnitButton$UnitType$String(unitType, unitType.getDisplayRoleId());
  }
  getModifierComponent(modifier: Modifier): JComponent {
    try {
      let goodsType = this.getSpecification().getGoodsType(modifier.getId());
      let bonus = ModifierFormat.getModifierAsString(modifier);
      return this.getGoodsButton$GoodsType$String(goodsType, bonus);
    } catch ($e1) {
      if ($J.isa($e1, Exception)) {
        let e = $J.exc($e1);
        let label = new JLabel()._JLabel$String(ModifierFormat.getFeatureAsString(modifier) + ': ' + ModifierFormat.getModifierAsString(modifier));
        label.setToolTipText(Messages.getShortDescription$ObjectWithId(modifier));
        return label;
      } else {
        throw $e1;
      }
    }
  }
  getAbilityComponent(ability: Ability): JLabel {
    if (ability.getValue()) {
      let label = new JLabel()._JLabel$String(ModifierFormat.getFeatureAsString(ability));
      label.setToolTipText(Messages.getShortDescription$ObjectWithId(ability));
      return label;
    } else {
      return null;
    }
  }
  appendRequiredAbility(doc: StyledDocument, key: string, value: boolean): void {
    let spec = this.getSpecification();
    try {
      doc.insertString(doc.getLength(), Messages.getName$String(key), doc.getStyle('regular'));
      let requiredTypes = CollectionUtils.transform$Collection$Predicate$Function(spec.getTypesProviding(key, value), CollectionUtils.alwaysTrue(), (t) => {
        let typeButton = this.getButton$FreeColSpecObjectType(t);
        typeButton.addActionListener($J.fn(this, 'actionPerformed'));
        return typeButton;
      });
      let rt = CollectionUtils.first$Collection(requiredTypes);
      if (rt != null) {
        doc.insertString(doc.getLength(), ' (', doc.getStyle('regular'));
        StyleConstants.setComponent(doc.getStyle('button'), rt);
        doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
        for (let index = 1; index < requiredTypes.size(); index++) {
          let button = requiredTypes.get(index);
          doc.insertString(doc.getLength(), ' / ', doc.getStyle('regular'));
          StyleConstants.setComponent(doc.getStyle('button'), button);
          doc.insertString(doc.getLength(), ' ', doc.getStyle('button'));
        }
        doc.insertString(doc.getLength(), ')', doc.getStyle('regular'));
      }
      doc.insertString(doc.getLength(), '\n', doc.getStyle('regular'));
    } catch ($e2) {
      if ($J.isa($e2, BadLocationException)) {
        let ble = $J.exc($e2);
        ColopediaGameObjectTypePanel.logger.log(Level.WARNING, 'Insert fail', ble);
      } else {
        throw $e2;
      }
    }
  }
  getListItemIconSize(): Dimension {
    return this.colopediaPanel.getListItemIconSize();
  }
  static $clinit() {
    ColopediaGameObjectTypePanel.logger = Logger.getLogger($J.cls(ColopediaGameObjectTypePanel).getName());
  }
}

$J.define(ColopediaGameObjectTypePanel, 'net.sf.freecol.client.gui.panel.colopedia.ColopediaGameObjectTypePanel', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.panel.colopedia.ColopediaDetailPanel'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient,net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel,java.lang.String': '_ColopediaGameObjectTypePanel' }, returns: { 'getListItemIconSize': 'java.awt.Dimension', 'getName$': 'java.lang.String', 'getId': 'java.lang.String' }, meths: { 'getUnitButton(net.sf.freecol.common.model.UnitType)': 'getUnitButton$UnitType', 'getUnitButton(net.sf.freecol.common.model.UnitType,java.lang.String)': 'getUnitButton$UnitType$String', 'getUnitButton(net.sf.freecol.common.model.AbstractUnit)': 'getUnitButton$AbstractUnit', 'getGoodsButton(net.sf.freecol.common.model.GoodsType,java.lang.String)': 'getGoodsButton$GoodsType$String', 'getGoodsButton(net.sf.freecol.common.model.AbstractGoods)': 'getGoodsButton$AbstractGoods', 'getGoodsButton(net.sf.freecol.common.model.GoodsType,int)': 'getGoodsButton$GoodsType$int', 'getGoodsButton(net.sf.freecol.common.model.GoodsType)': 'getGoodsButton$GoodsType', 'getButton(net.sf.freecol.common.model.FreeColSpecObjectType)': 'getButton$FreeColSpecObjectType', 'getButton(net.sf.freecol.client.gui.action.ColopediaAction$PanelType,java.lang.String,javax.swing.ImageIcon)': 'getButton$PanelType$String$ImageIcon', 'getButton(net.sf.freecol.common.model.FreeColSpecObjectType,java.lang.String,javax.swing.ImageIcon)': 'getButton$FreeColSpecObjectType$String$ImageIcon', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode,java.lang.String,java.util.List)': 'addSubTrees$DefaultMutableTreeNode$String$List', 'addSubTrees(javax.swing.tree.DefaultMutableTreeNode,java.util.List)': 'addSubTrees$DefaultMutableTreeNode$List', 'getName()': 'getName$' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  ImageIcon = $J.load('javax.swing.ImageIcon');
  JLabel = $J.load('javax.swing.JLabel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  ModifierFormat = $J.load('net.sf.freecol.client.gui.ModifierFormat');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  CollectionUtils = $J.load('net.sf.freecol.common.util.CollectionUtils');
  ImageUtils = $J.load('net.sf.freecol.common.util.ImageUtils');
});
