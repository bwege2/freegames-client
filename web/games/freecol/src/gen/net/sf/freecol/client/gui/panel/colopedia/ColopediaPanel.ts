// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/panel/colopedia/ColopediaPanel.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, HashMap, JString, Logger } from '../../../../../../../../jre/index.ts';
import { FreeColPanel } from '../FreeColPanel.ts';

let Dimension, AbstractAction, JScrollPane, JSplitPane, JTree, ScrollPaneConstants, HyperlinkEvent$EventType, DefaultMutableTreeNode, DefaultTreeModel, TreePath, MigLayout, ImageLibrary, MigPanel, Utility, BuildingDetailPanel, ColopediaTreeCellRenderer, ColopediaTreeItem, ConceptDetailPanel, FatherDetailPanel, GoodsDetailPanel, NationDetailPanel, NationTypeDetailPanel, ResourcesDetailPanel, TerrainDetailPanel, UnitDetailPanel, Messages, FreeColObject;

/**
 * This panel displays the Colopedia.
 */
export class ColopediaPanel extends FreeColPanel {
  static logger: Logger = null;
  listPanel: JPanel = null;
  detailPanel: JPanel = null;
  tree: JTree = null;
  nodeMap: JMap<string, DefaultMutableTreeNode> = null;
  $init_ColopediaPanel() {
    this.nodeMap = new HashMap();
  }
  /**
   * The constructor that will add the items to this panel.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   * @param id The object identifier of the item to select.
   */
  _ColopediaPanel$FreeColClient$String(freeColClient: FreeColClient, id: string): this {
    this._FreeColPanel$FreeColClient$String$LayoutManager(freeColClient, 'ColopediaPanelUI', new MigLayout()._MigLayout$String$String$String('fill', '[grow, fill]', '[][grow, fill][]'));
    this.$init_ColopediaPanel();
    this.add$Component$Object(Utility.localizedHeader('colopedia', Utility.FONTSPEC_TITLE), 'span, align center');
    this.listPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('fill'));
    this.listPanel.setOpaque(true);
    this.tree = this.buildTree();
    this.listPanel.add$Component$Object(this.tree, 'grow');
    let sl = new (ColopediaPanel$1())().$o(this)._JScrollPane$Component$int$int(this.listPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    sl.getVerticalScrollBar().setUnitIncrement(16);
    sl.getViewport().setOpaque(false);
    this.detailPanel = new MigPanel()._MigPanel$String('ColopediaPanelUI');
    this.detailPanel.setOpaque(true);
    let detail = new JScrollPane()._JScrollPane$Component$int$int(this.detailPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    detail.getVerticalScrollBar().setUnitIncrement(16);
    detail.getViewport().setOpaque(false);
    this.select(id);
    let width = this.getImageLibrary().scaleInt(1050);
    let height = this.getImageLibrary().scaleInt(725);
    this.getGUI().restoreSavedSize(this, new Dimension()._Dimension$int$int(width, height));
    let splitPane = new JSplitPane()._JSplitPane$int$Component$Component(JSplitPane.HORIZONTAL_SPLIT, sl, detail);
    this.add$Component$Object(splitPane, 'grow');
    this.add$Component$Object(this.okButton, 'newline, span, tag ok');
    this.setEscapeAction(new (ColopediaPanel$2())().$o(this)._AbstractAction$());
    return this;
  }
  /**
   * Creates a new {@code ColopediaPanel} instance suitable
   * only for the construction of ColopediaDetailPanels.
   *
   * FIXME: find a more elegant solution.
   *
   * @param freeColClient The {@code FreeColClient} for the game.
   */
  _ColopediaPanel$FreeColClient(freeColClient: FreeColClient): this {
    this._FreeColPanel$FreeColClient(freeColClient);
    this.$init_ColopediaPanel();
    return this;
  }
  /**
   * Builds the JTree which represents the navigation menu and then returns it
   *
   * @return The navigation tree.
   */
  buildTree(): JTree {
    let name = Messages.message$String('colopedia');
    let root = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(new ColopediaTreeItem()._ColopediaTreeItem(null, null, name, null));
    let fcc = this.getFreeColClient();
    new TerrainDetailPanel()._TerrainDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new ResourcesDetailPanel()._ResourcesDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new GoodsDetailPanel()._GoodsDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new UnitDetailPanel()._UnitDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new BuildingDetailPanel()._BuildingDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new FatherDetailPanel()._FatherDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new NationDetailPanel()._NationDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new NationTypeDetailPanel()._NationTypeDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    new ConceptDetailPanel()._ConceptDetailPanel(fcc, this).addSubTrees$DefaultMutableTreeNode(root);
    let treeModel = new DefaultTreeModel()._DefaultTreeModel$TreeNode(root);
    this.tree = new JTree()._JTree$TreeModel(treeModel);
    this.tree.setRootVisible(false);
    this.tree.setCellRenderer(new ColopediaTreeCellRenderer()._ColopediaTreeCellRenderer(this, this.getImageLibrary()));
    this.tree.setOpaque(false);
    this.tree.addTreeSelectionListener(this);
    let allNodes = root.depthFirstEnumeration();
    while (allNodes.hasMoreElements()) {
      let node = allNodes.nextElement();
      let item = node.getUserObject();
      this.nodeMap.put(item.getId(), node);
    }
    return this.tree;
  }
  /**
   * Gets the preferred size for the list item images in the colopedia tree.
   *
   * @return The {@code Dimension} to use.
   */
  getListItemIconSize(): Dimension {
    let width = this.getImageLibrary().scaleInt($J.idiv(Math.imul(ImageLibrary.ICON_SIZE.width_, 3), 2));
    let height = this.getImageLibrary().scaleInt(ImageLibrary.ICON_SIZE.height_);
    return new Dimension()._Dimension$int$int(width, height);
  }
  /**
   * This function analyzes a tree selection event and calls the
   * right methods to take care of building the requested unit's
   * details.
   *
   * @param event The incoming {@code TreeSelectionEvent}.
   */
  valueChanged(event: TreeSelectionEvent): void {
    let node = this.tree.getLastSelectedPathComponent();
    if (node != null) {
      this.showDetails(node.getUserObject());
    }
  }
  showDetails(nodeItem: ColopediaTreeItem): void {
    this.detailPanel.removeAll();
    if (nodeItem.getPanelType() != null && nodeItem.getId() != null) {
      nodeItem.getPanelType().buildDetail$String$JPanel(nodeItem.getId(), this.detailPanel);
    }
    this.detailPanel.revalidate();
    this.detailPanel.repaint$();
  }
  select(id: string): void {
    let node = this.nodeMap.get(id);
    if (node == null) {
      ColopediaPanel.logger.warning('Unable to find node with id \'' + id + '\'.');
    } else {
      let oldPath = this.tree.getSelectionPath();
      if (oldPath != null && oldPath.getParentPath() != null) {
        this.tree.collapsePath(oldPath.getParentPath());
      }
      let newPath = new TreePath()._TreePath$ObjectArr(node.getPath());
      this.tree.scrollPathToVisible(newPath);
      this.tree.expandPath(newPath);
      this.showDetails(node.getUserObject());
    }
  }
  hyperlinkUpdate(e: HyperlinkEvent): void {
    let type$ = e.getEventType();
    if (type$ === HyperlinkEvent$EventType.ACTIVATED) {
      let path = JString.split(e.getURL().getPath(), '/');
      if (null != path[1]) {
        switch (path[1]) {
          case FreeColObject.ID_ATTRIBUTE_TAG:
            this.select(path[2]);
            break;
          case 'action':
            this.getFreeColClient().getActionManager().getFreeColAction(path[2]).actionPerformed(null);
            break;
          default:
            break;
        }
      }
    }
  }
  /**
   * {@inheritDoc}
   */
  actionPerformed(ae: ActionEvent): void {
    let command = ae.getActionCommand();
    if ($J.equals(FreeColPanel.OK, command)) {
      this.getGUI().removeComponent(this);
    } else {
      this.select(command);
    }
  }
  /**
   * {@inheritDoc}
   */
  removeNotify(): void {
    super.removeNotify();
    this.removeAll();
    this.detailPanel = null;
    this.listPanel = null;
    this.tree = null;
    this.nodeMap = null;
  }
  static $clinit() {
    ColopediaPanel.logger = Logger.getLogger($J.cls(ColopediaPanel).getName());
  }
}

let $ColopediaPanel$1: any = null;
/** An anonymous class (ColopediaPanel.java:91). */
function ColopediaPanel$1(): any {
  return $ColopediaPanel$1 ??= $J.local(class extends JScrollPane {
    getPreferredSize$(): Dimension {
      let preferredSize = this.$outer.listPanel.getPreferredSize$();
      return new Dimension()._Dimension$int$int((preferredSize.width_ + 32) | 0, preferredSize.height_);
    }
  }, 'net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel$1', []);
}

let $ColopediaPanel$2: any = null;
/** An anonymous class (ColopediaPanel.java:121). */
function ColopediaPanel$2(): any {
  return $ColopediaPanel$2 ??= $J.local(class extends AbstractAction {
    actionPerformed(ae: ActionEvent): void {
      this.$outer.okButton.doClick$();
    }
  }, 'net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel$2', []);
}

$J.define(ColopediaPanel, 'net.sf.freecol.client.gui.panel.colopedia.ColopediaPanel', { kind: 'class', ifaces: ['javax.swing.event.HyperlinkListener', 'javax.swing.event.TreeSelectionListener'], sup: 'net.sf.freecol.client.gui.panel.FreeColPanel', ctors: { 'net.sf.freecol.client.FreeColClient': '_ColopediaPanel$FreeColClient', 'net.sf.freecol.client.FreeColClient,java.lang.String': '_ColopediaPanel$FreeColClient$String' }, returns: { 'getListItemIconSize': 'java.awt.Dimension' }, clinit: true, lazy: ['logger'] });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  AbstractAction = $J.load('javax.swing.AbstractAction');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JSplitPane = $J.load('javax.swing.JSplitPane');
  JTree = $J.load('javax.swing.JTree');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  HyperlinkEvent$EventType = $J.load('javax.swing.event.HyperlinkEvent$EventType');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  DefaultTreeModel = $J.load('javax.swing.tree.DefaultTreeModel');
  TreePath = $J.load('javax.swing.tree.TreePath');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  ImageLibrary = $J.load('net.sf.freecol.client.gui.ImageLibrary');
  MigPanel = $J.load('net.sf.freecol.client.gui.panel.MigPanel');
  Utility = $J.load('net.sf.freecol.client.gui.panel.Utility');
  BuildingDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.BuildingDetailPanel');
  ColopediaTreeCellRenderer = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeCellRenderer');
  ColopediaTreeItem = $J.load('net.sf.freecol.client.gui.panel.colopedia.ColopediaTreeItem');
  ConceptDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.ConceptDetailPanel');
  FatherDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.FatherDetailPanel');
  GoodsDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.GoodsDetailPanel');
  NationDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.NationDetailPanel');
  NationTypeDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.NationTypeDetailPanel');
  ResourcesDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.ResourcesDetailPanel');
  TerrainDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.TerrainDetailPanel');
  UnitDetailPanel = $J.load('net.sf.freecol.client.gui.panel.colopedia.UnitDetailPanel');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  FreeColObject = $J.load('net.sf.freecol.common.model.FreeColObject');
});
