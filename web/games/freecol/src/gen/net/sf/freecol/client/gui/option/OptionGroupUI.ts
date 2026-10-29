// @ts-nocheck
// FreeCol 1.2.0 src/net/sf/freecol/client/gui/option/OptionGroupUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, HashMap, Logger } from '../../../../../../../jre/index.ts';
import { MigPanel } from '../panel/MigPanel.ts';
import { JTree } from '../../../../../../javax/swing/JTree.ts';

let Color, JScrollPane, JSplitPane, ScrollPaneConstants, DefaultMutableTreeNode, DefaultTreeModel, TreePath, MigLayout, FreeColActionUI, OptionUI, Messages, OptionGroup;

/**
 * This panel displays an OptionGroup using a JTree.
 */
export class OptionGroupUI extends MigPanel {
  static logger: Logger = null;
  optionUpdaters: List<OptionUpdater> = null;
  optionUIs: HashMap<string, OptionUI> = null;
  optionGroupSelectionPath: JMap<string, TreeNode[]> = null;
  detailPanel: JPanel = null;
  tree: JTree = null;
  gui: GUI = null;
  group: OptionGroup = null;
  editable: boolean = false;
  /**
   * The constructor that will add the items to this panel.
   *
   * @param gui The enclosing {@code GUI}.
   * @param group The {@code OptionGroup} encapsulate.
   * @param editable Is the group editable.
   */
  _OptionGroupUI(gui: GUI, group: OptionGroup, editable: boolean): this {
    this._MigPanel$String$LayoutManager('ReportPanelUI', new MigLayout()._MigLayout$String('fill, insets 0'));
    this.optionUpdaters = new ArrayList();
    this.optionUIs = new HashMap();
    this.optionGroupSelectionPath = new HashMap();
    this.gui = gui;
    this.group = group;
    this.editable = editable;
    let root = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(group);
    this.buildTree(group, root);
    this.tree = new OptionGroupUI$OptionTree()._OptionGroupUI$OptionTree(new DefaultTreeModel()._DefaultTreeModel$TreeNode(root));
    this.tree.setOpaque(false);
    this.tree.addTreeSelectionListener(this);
    this.detailPanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String$String('wrap 2, fillx', '[fill]related[fill]'));
    this.detailPanel.setOpaque(true);
    let treePanel = new MigPanel()._MigPanel$LayoutManager(new MigLayout()._MigLayout$String('fill'));
    treePanel.add$Component$Object(this.tree, 'grow');
    let treeScrollPane = new JScrollPane()._JScrollPane$Component$int$int(treePanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    treeScrollPane.setOpaque(false);
    let detailsScrollPane = new JScrollPane()._JScrollPane$Component$int$int(this.detailPanel, ScrollPaneConstants.VERTICAL_SCROLLBAR_AS_NEEDED, ScrollPaneConstants.HORIZONTAL_SCROLLBAR_AS_NEEDED);
    detailsScrollPane.setOpaque(false);
    let splitPane = new JSplitPane()._JSplitPane$int$Component$Component(JSplitPane.HORIZONTAL_SPLIT, treeScrollPane, detailsScrollPane);
    for (let i = 0; i < this.tree.getRowCount(); i++) {
      this.tree.expandRow(i);
    }
    this.add$Component$Object(splitPane, 'grow');
    return this;
  }
  getTree(): JTree {
    return this.tree;
  }
  selectOption(key: string): void {
    let path = this.optionGroupSelectionPath.get(key);
    if (path != null) {
      this.tree.setSelectionPath(new TreePath()._TreePath$ObjectArr(path));
    }
  }
  /**
   * Builds the JTree which represents the navigation menu and then
   * returns it
   *
   * @param group The {@code OptionGroup} to build from.
   * @param parent The tree to build onto.
   */
  buildTree(group: OptionGroup, parent: DefaultMutableTreeNode): void {
    for (const $it0 = group.getOptions().iterator(); $it0.hasNext(); ) {
      let option = $it0.next();
      if (option instanceof OptionGroup) {
        if (!(option).isVisible()) {
          continue;
        }
        let branch = new DefaultMutableTreeNode()._DefaultMutableTreeNode$Object(option);
        parent.add(branch);
        this.buildTree(option, branch);
        this.optionGroupSelectionPath.put(option.getId(), branch.getPath());
      }
    }
  }
  /**
   * This function analyses a tree selection event and calls the
   * right methods to take care of building the requested unit's
   * details.
   *
   * @param event The incoming TreeSelectionEvent.
   */
  valueChanged(event: TreeSelectionEvent): void {
    this.detailPanel.removeAll();
    let node = this.tree.getLastSelectedPathComponent();
    if (node != null) {
      if (node.isLeaf()) {
        let group = node.getUserObject();
        for (const $it1 = group.getOptions().iterator(); $it1.hasNext(); ) {
          let option = $it1.next();
          this.addOptionUI(option, this.editable && group.isEditable());
        }
      } else {
        this.tree.expandPath(event.getPath());
      }
    }
    this.detailPanel.revalidate();
    this.detailPanel.repaint$();
  }
  /**
   * Removes the given {@code KeyStroke} from all of this
   * {@code OptionGroupUI}'s children.
   *
   * @param keyStroke The {@code KeyStroke} to be removed.
   */
  removeKeyStroke(keyStroke: KeyStroke): void {
    for (const $it2 = this.optionUpdaters.iterator(); $it2.hasNext(); ) {
      let optionUpdater = $it2.next();
      if (optionUpdater instanceof FreeColActionUI) {
        (optionUpdater).removeKeyStroke(keyStroke);
      }
    }
  }
  getOptionUI$String(key: string): OptionUI {
    return this.optionUIs.get(key);
  }
  getOptionUI$String$Class<T>(key: string, clazz: JClass<T>): T {
    return clazz.cast(this.optionUIs.get(key));
  }
  addOptionUI(option: Option, editable: boolean): void {
    let ui = this.optionUIs.get(option.getId());
    if (ui == null) {
      ui = OptionUI.getOptionUI(this.gui, option, editable);
      if (ui == null) {
        OptionGroupUI.logger.warning('Unknown option type: ' + option.toString());
        return;
      }
      if (option.getEnabledBy() != null) {
        let enabler = this.optionUIs.get(option.getEnabledBy());
        let theUI = ui;
        enabler.addActionListener((e) => {
          theUI.initialize();
        });
        ui.setEnabler(enabler);
      }
      if (ui instanceof FreeColActionUI) {
        (ui).setOptionGroupUI(this);
      }
      if (option.getId() != null) {
        this.optionUIs.put(option.getId(), ui);
      }
    }
    let label = ui.getJLabel();
    if (label == null) {
      this.detailPanel.add$Component$Object(ui.getComponent(), 'newline, span');
    } else {
      this.detailPanel.add$Component(label);
      this.detailPanel.add$Component(ui.getComponent());
    }
    if (this.group.isEditable()) {
      this.optionUpdaters.add(ui);
    }
  }
  /**
   * {@inheritDoc}
   */
  updateOption(): void {
    for (const $it3 = this.optionUpdaters.iterator(); $it3.hasNext(); ) {
      let optionUpdater = $it3.next();
      optionUpdater.updateOption();
    }
  }
  /**
   * {@inheritDoc}
   */
  reset(): void {
    for (const $it4 = this.optionUpdaters.iterator(); $it4.hasNext(); ) {
      let optionUpdater = $it4.next();
      optionUpdater.reset();
    }
  }
  static $clinit() {
    OptionGroupUI.logger = Logger.getLogger($J.cls(OptionGroupUI).getName());
  }
}

export class OptionGroupUI$OptionTree extends JTree {
  static bgColor: Color = null;
  /**
   * Build a new option tree.
   *
   * @param dtm The tree model.
   */
  _OptionGroupUI$OptionTree(dtm: DefaultTreeModel): this {
    this._JTree$TreeModel(dtm);
    let renderer = this.getCellRenderer();
    renderer.setBackgroundNonSelectionColor(OptionGroupUI$OptionTree.bgColor);
    return this;
  }
  /**
   * {@inheritDoc}
   */
  convertValueToText(value: any, selected: boolean, expanded: boolean, leaf: boolean, row: number, hasFocus: boolean): string {
    let node = value;
    let option = node.getUserObject();
    return Messages.getName$String(option.getId());
  }
  static $clinit() {
    OptionGroupUI$OptionTree.bgColor = new Color()._Color$int$int$int$int(0, 0, 0, 1);
  }
}

$J.define(OptionGroupUI, 'net.sf.freecol.client.gui.option.OptionGroupUI', { kind: 'class', ifaces: ['net.sf.freecol.client.gui.option.OptionUpdater', 'javax.swing.event.TreeSelectionListener'], sup: 'net.sf.freecol.client.gui.panel.MigPanel', ctors: { 'net.sf.freecol.client.gui.GUI,net.sf.freecol.common.option.OptionGroup,boolean': '_OptionGroupUI' }, returns: { 'getTree': 'javax.swing.JTree' }, meths: { 'getOptionUI(java.lang.String,java.lang.Class)': 'getOptionUI$String$Class', 'getOptionUI(java.lang.String)': 'getOptionUI$String' }, clinit: true, lazy: ['logger'] });
$J.define(OptionGroupUI$OptionTree, 'net.sf.freecol.client.gui.option.OptionGroupUI$OptionTree', { kind: 'class', sup: 'javax.swing.JTree', ctors: { 'javax.swing.tree.DefaultTreeModel': '_OptionGroupUI$OptionTree' }, clinit: true, lazy: ['bgColor'] });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JSplitPane = $J.load('javax.swing.JSplitPane');
  ScrollPaneConstants = $J.load('javax.swing.ScrollPaneConstants');
  DefaultMutableTreeNode = $J.load('javax.swing.tree.DefaultMutableTreeNode');
  DefaultTreeModel = $J.load('javax.swing.tree.DefaultTreeModel');
  TreePath = $J.load('javax.swing.tree.TreePath');
  MigLayout = $J.load('net.miginfocom.swing.MigLayout');
  FreeColActionUI = $J.load('net.sf.freecol.client.gui.option.FreeColActionUI');
  OptionUI = $J.load('net.sf.freecol.client.gui.option.OptionUI');
  Messages = $J.load('net.sf.freecol.common.i18n.Messages');
  OptionGroup = $J.load('net.sf.freecol.common.option.OptionGroup');
});
