// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JTree.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2021, Oracle and/or its affiliates. All rights reserved.
 * DO NOT ALTER OR REMOVE COPYRIGHT NOTICES OR THIS FILE HEADER.
 *
 * This code is free software; you can redistribute it and/or modify it
 * under the terms of the GNU General Public License version 2 only, as
 * published by the Free Software Foundation.  Oracle designates this
 * particular file as subject to the "Classpath" exception as provided
 * by Oracle in the LICENSE file that accompanied this code.
 *
 * This code is distributed in the hope that it will be useful, but WITHOUT
 * ANY WARRANTY; without even the implied warranty of MERCHANTABILITY or
 * FITNESS FOR A PARTICULAR PURPOSE.  See the GNU General Public License
 * version 2 for more details (a copy is included in the LICENSE file that
 * accompanied this code).
 *
 * You should have received a copy of the GNU General Public License version
 * 2 along with this work; if not, write to the Free Software Foundation,
 * Inc., 51 Franklin St, Fifth Floor, Boston, MA 02110-1301 USA.
 *
 * Please contact Oracle, 500 Oracle Parkway, Redwood Shores, CA 94065 USA
 * or visit www.oracle.com if you need additional information or have any
 * questions.
 */
import { $J, Collections, Hashtable, IllegalArgumentException, JObject, JString, Stack, Vector } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { TransferHandler$DropLocation } from './TransferHandler.ts';
import { Timer } from './Timer.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';
import { AccessibleContext } from '../accessibility/AccessibleContext.ts';

let Dimension, MouseEvent, PropertyChangeEvent, Accessible, AccessibleState, DropMode, JViewport, SwingConstants, SwingUtilities, UIManager, TreeExpansionEvent, TreeExpansionListener, TreeSelectionListener, TreeWillExpandListener, Position$Bias, DefaultTreeSelectionModel, ExpandVetoException, TreePath, AWTAccessor, SwingAccessor, SwingUtilities2, SwingUtilities2$Section;

/**
 * A control that displays a set of hierarchical data as an outline.
 * You can find task-oriented documentation and examples of using trees in
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/tree.html">How to Use Trees</a>,
 * a section in <em>The Java Tutorial.</em>
 * <p>
 * A specific node in a tree can be identified either by a
 * <code>TreePath</code> (an object
 * that encapsulates a node and all of its ancestors), or by its
 * display row, where each row in the display area displays one node.
 * An <i>expanded</i> node is a non-leaf node (as identified by
 * <code>TreeModel.isLeaf(node)</code> returning false) that will displays
 * its children when all its ancestors are <i>expanded</i>.
 * A <i>collapsed</i>
 * node is one which hides them. A <i>hidden</i> node is one which is
 * under a collapsed ancestor. All of a <i>viewable</i> nodes parents
 * are expanded, but may or may not be displayed. A <i>displayed</i> node
 * is both viewable and in the display area, where it can be seen.
 * </p>
 * The following <code>JTree</code> methods use "visible" to mean "displayed":
 * <ul>
 * <li><code>isRootVisible()</code>
 * <li><code>setRootVisible()</code>
 * <li><code>scrollPathToVisible()</code>
 * <li><code>scrollRowToVisible()</code>
 * <li><code>getVisibleRowCount()</code>
 * <li><code>setVisibleRowCount()</code>
 * </ul>
 * The next group of <code>JTree</code> methods use "visible" to mean
 * "viewable" (under an expanded parent):
 * <ul>
 * <li><code>isVisible()</code>
 * <li><code>makeVisible()</code>
 * </ul>
 * If you are interested in knowing when the selection changes implement
 * the <code>TreeSelectionListener</code> interface and add the instance
 * using the method <code>addTreeSelectionListener</code>.
 * <code>valueChanged</code> will be invoked when the
 * selection changes, that is if the user clicks twice on the same
 * node <code>valueChanged</code> will only be invoked once.
 * <p>
 * If you are interested in detecting either double-click events or when
 * a user clicks on a node, regardless of whether or not it was selected,
 * we recommend you do the following:
 * </p>
 * <pre>
 * final JTree tree = ...;
 *
 * MouseListener ml = new MouseAdapter() {
 *     public void <b>mousePressed</b>(MouseEvent e) {
 *         int selRow = tree.getRowForLocation(e.getX(), e.getY());
 *         TreePath selPath = tree.getPathForLocation(e.getX(), e.getY());
 *         if(selRow != -1) {
 *             if(e.getClickCount() == 1) {
 *                 mySingleClick(selRow, selPath);
 *             }
 *             else if(e.getClickCount() == 2) {
 *                 myDoubleClick(selRow, selPath);
 *             }
 *         }
 *     }
 * };
 * tree.addMouseListener(ml);
 * </pre>
 * NOTE: This example obtains both the path and row, but you only need to
 * get the one you're interested in.
 * <p>
 * To use <code>JTree</code> to display compound nodes
 * (for example, nodes containing both
 * a graphic icon and text), subclass {@link TreeCellRenderer} and use
 * {@link #setCellRenderer} to tell the tree to use it. To edit such nodes,
 * subclass {@link TreeCellEditor} and use {@link #setCellEditor}.
 * </p>
 * <p>
 * Like all <code>JComponent</code> classes, you can use {@link InputMap} and
 * {@link ActionMap}
 * to associate an {@link Action} object with a {@link KeyStroke}
 * and execute the action under specified conditions.
 * </p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 * </p>
 *
 * @author Rob Davis
 * @author Ray Ryan
 * @author Scott Violet
 * @since 1.2
 */
export class JTree extends JComponent {
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TreeUI';
  /**
   * The model that defines the tree displayed by this object.
   */
  treeModel: TreeModel = null;
  /**
   * Models the set of selected nodes in this tree.
   */
  selectionModel: TreeSelectionModel = null;
  /**
   * True if the root node is displayed, false if its children are
   * the highest visible nodes.
   */
  rootVisible: boolean = false;
  /**
   * The cell used to draw nodes. If <code>null</code>, the UI uses a default
   * <code>cellRenderer</code>.
   */
  cellRenderer: TreeCellRenderer = null;
  /**
   * Height to use for each display row. If this is &lt;= 0 the renderer
   * determines the height for each row.
   */
  rowHeight: number = 0;
  rowHeightSet: boolean = false;
  /**
   * Maps from <code>TreePath</code> to <code>Boolean</code>
   * indicating whether or not the
   * particular path is expanded. This ONLY indicates whether a
   * given path is expanded, and NOT if it is visible or not. That
   * information must be determined by visiting all the parent
   * paths and seeing if they are visible.
   */
  expandedState: Hashtable<TreePath, boolean> = null;
  /**
   * True if handles are displayed at the topmost level of the tree.
   * <p>
   * A handle is a small icon that displays adjacent to the node which
   * allows the user to click once to expand or collapse the node. A
   * common interface shows a plus sign (+) for a node which can be
   * expanded and a minus sign (-) for a node which can be collapsed.
   * Handles are always shown for nodes below the topmost level.
   * <p>
   * If the <code>rootVisible</code> setting specifies that the root
   * node is to be displayed, then that is the only node at the topmost
   * level. If the root node is not displayed, then all of its
   * children are at the topmost level of the tree. Handles are
   * always displayed for nodes other than the topmost.
   * <p>
   * If the root node isn't visible, it is generally a good to make
   * this value true. Otherwise, the tree looks exactly like a list,
   * and users may not know that the "list entries" are actually
   * tree nodes.
   *
   * @see #rootVisible
   */
  showsRootHandles: boolean = false;
  showsRootHandlesSet: boolean = false;
  /**
   * Creates a new event and passed it off the
   * <code>selectionListeners</code>.
   */
  selectionRedirector: JTree$TreeSelectionRedirector = null;
  /**
   * Editor for the entries.  Default is <code>null</code>
   * (tree is not editable).
   */
  cellEditor: TreeCellEditor = null;
  /**
   * Is the tree editable? Default is false.
   */
  editable: boolean = false;
  /**
   * Is this tree a large model? This is a code-optimization setting.
   * A large model can be used when the cell height is the same for all
   * nodes. The UI will then cache very little information and instead
   * continually message the model. Without a large model the UI caches
   * most of the information, resulting in fewer method calls to the model.
   * <p>
   * This value is only a suggestion to the UI. Not all UIs will
   * take advantage of it. Default value is false.
   */
  largeModel: boolean = false;
  /**
   * Number of rows to make visible at one time. This value is used for
   * the <code>Scrollable</code> interface. It determines the preferred
   * size of the display area.
   */
  visibleRowCount: number = 0;
  /**
   * If true, when editing is to be stopped by way of selection changing,
   * data in tree changing or other means <code>stopCellEditing</code>
   * is invoked, and changes are saved. If false,
   * <code>cancelCellEditing</code> is invoked, and changes
   * are discarded. Default is false.
   */
  invokesStopCellEditing: boolean = false;
  /**
   * If true, when a node is expanded, as many of the descendants are
   * scrolled to be visible.
   */
  scrollsOnExpand: boolean = false;
  scrollsOnExpandSet: boolean = false;
  /**
   * Number of mouse clicks before a node is expanded.
   */
  toggleClickCount: number = 0;
  /**
   * Updates the <code>expandedState</code>.
   */
  treeModelListener: TreeModelListener = null;
  /**
   * Used when <code>setExpandedState</code> is invoked,
   * will be a <code>Stack</code> of <code>Stack</code>s.
   */
  expandedStack: Stack<Stack<TreePath>> = null;
  /**
   * Lead selection path, may not be <code>null</code>.
   */
  leadPath: TreePath = null;
  /**
   * Anchor path.
   */
  anchorPath: TreePath = null;
  /**
   * True if paths in the selection should be expanded.
   */
  expandsSelectedPaths: boolean = false;
  /**
   * This is set to true for the life of the <code>setUI</code> call.
   */
  settingUI: boolean = false;
  /**
   * If true, mouse presses on selections initiate a drag operation.
   */
  dragEnabled: boolean = false;
  /**
   * The drop mode for this component.
   */
  dropMode: DropMode = null;
  /**
   * The drop location.
   */
  dropLocation: JTree$DropLocation = null;
  /**
   * Flag to indicate UI update is in progress
   */
  updateInProgress: boolean = false;
  /**
   * The row to expand during DnD.
   */
  expandRow_: number = 0;
  /**
   * A timer to expand nodes during drop.
   */
  dropTimer: JTree$TreeTimer = null;
  /**
   * When <code>addTreeExpansionListener</code> is invoked,
   * and <code>settingUI</code> is true, this ivar gets set to the passed in
   * <code>Listener</code>. This listener is then notified first in
   * <code>fireTreeCollapsed</code> and <code>fireTreeExpanded</code>.
   * <p>This is an ugly workaround for a way to have the UI listener
   * get notified before other listeners.
   */
  uiTreeExpansionListener: TreeExpansionListener = null;
  /**
   * Max number of stacks to keep around.
   */
  static TEMP_STACK_SIZE: number = 0;
  /**
   * Bound property name for <code>cellRenderer</code>.
   */
  static readonly CELL_RENDERER_PROPERTY: string = 'cellRenderer';
  /**
   * Bound property name for <code>treeModel</code>.
   */
  static readonly TREE_MODEL_PROPERTY: string = 'model';
  /**
   * Bound property name for <code>rootVisible</code>.
   */
  static readonly ROOT_VISIBLE_PROPERTY: string = 'rootVisible';
  /**
   * Bound property name for <code>showsRootHandles</code>.
   */
  static readonly SHOWS_ROOT_HANDLES_PROPERTY: string = 'showsRootHandles';
  /**
   * Bound property name for <code>rowHeight</code>.
   */
  static readonly ROW_HEIGHT_PROPERTY: string = 'rowHeight';
  /**
   * Bound property name for <code>cellEditor</code>.
   */
  static readonly CELL_EDITOR_PROPERTY: string = 'cellEditor';
  /**
   * Bound property name for <code>editable</code>.
   */
  static readonly EDITABLE_PROPERTY: string = 'editable';
  /**
   * Bound property name for <code>largeModel</code>.
   */
  static readonly LARGE_MODEL_PROPERTY: string = 'largeModel';
  /**
   * Bound property name for selectionModel.
   */
  static readonly SELECTION_MODEL_PROPERTY: string = 'selectionModel';
  /**
   * Bound property name for <code>visibleRowCount</code>.
   */
  static readonly VISIBLE_ROW_COUNT_PROPERTY: string = 'visibleRowCount';
  /**
   * Bound property name for <code>messagesStopCellEditing</code>.
   */
  static readonly INVOKES_STOP_CELL_EDITING_PROPERTY: string = 'invokesStopCellEditing';
  /**
   * Bound property name for <code>scrollsOnExpand</code>.
   */
  static readonly SCROLLS_ON_EXPAND_PROPERTY: string = 'scrollsOnExpand';
  /**
   * Bound property name for <code>toggleClickCount</code>.
   */
  static readonly TOGGLE_CLICK_COUNT_PROPERTY: string = 'toggleClickCount';
  /**
   * Bound property name for <code>leadSelectionPath</code>.
   * @since 1.3
   */
  static readonly LEAD_SELECTION_PATH_PROPERTY: string = 'leadSelectionPath';
  /**
   * Bound property name for anchor selection path.
   * @since 1.3
   */
  static readonly ANCHOR_SELECTION_PATH_PROPERTY: string = 'anchorSelectionPath';
  /**
   * Bound property name for expands selected paths property
   * @since 1.3
   */
  static readonly EXPANDS_SELECTED_PATHS_PROPERTY: string = 'expandsSelectedPaths';
  $init_JTree() {
    this.rowHeightSet = false;
    this.showsRootHandlesSet = false;
    this.scrollsOnExpandSet = false;
    this.dropMode = DropMode.USE_SELECTION;
    this.expandRow_ = -1;
  }
  /**
   * Returns an instance of <code>JTree</code> which displays the root node
   * -- the tree is created using the specified data model.
   *
   * @param newModel  the <code>TreeModel</code> to use as the data model
   */
  _JTree$TreeModel(newModel: TreeModel): this {
    this._JComponent();
    this.$init_JTree();
    this.expandedStack = new Stack();
    this.toggleClickCount = 2;
    this.expandedState = new Hashtable();
    this.setLayout(null);
    this.rowHeight = 16;
    this.visibleRowCount = 20;
    this.rootVisible = true;
    this.selectionModel = new DefaultTreeSelectionModel()._DefaultTreeSelectionModel();
    this.cellRenderer = null;
    this.scrollsOnExpand = true;
    this.expandsSelectedPaths = true;
    this.updateUI();
    this.setModel(newModel);
    return this;
  }
  /**
   * Returns the L&amp;F object that renders this component.
   *
   * @return the <code>TreeUI</code> object that renders this component
   */
  getUI(): TreeUI {
    return this.ui;
  }
  /**
   * Sets the L&amp;F object that renders this component.
   * <p>
   * This is a bound property.
   *
   * @param ui  the <code>TreeUI</code> L&amp;F object
   * @see UIDefaults#getUI
   */
  setUI$TreeUI(ui: TreeUI): void {
    if (this.ui !== ui) {
      this.settingUI = true;
      this.uiTreeExpansionListener = null;
      try {
        super.setUI$ComponentUI(ui);
      } finally {
        this.settingUI = false;
      }
    }
  }
  /**
   * Notification from the <code>UIManager</code> that the L&amp;F has changed.
   * Replaces the current UI object with the latest version from the
   * <code>UIManager</code>.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    if (!this.updateInProgress) {
      this.updateInProgress = true;
      try {
        this.setUI$TreeUI(UIManager.getUI(this));
        SwingUtilities.updateRendererOrEditorUI(this.getCellRenderer());
        SwingUtilities.updateRendererOrEditorUI(this.getCellEditor());
      } finally {
        this.updateInProgress = false;
      }
    }
  }
  /**
   * Returns the name of the L&amp;F class that renders this component.
   *
   * @return the string "TreeUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTree.uiClassID;
  }
  /**
   * Returns the current <code>TreeCellRenderer</code>
   *  that is rendering each cell.
   *
   * @return the <code>TreeCellRenderer</code> that is rendering each cell
   */
  getCellRenderer(): TreeCellRenderer {
    return this.cellRenderer;
  }
  /**
   * Sets the <code>TreeCellRenderer</code> that will be used to
   * draw each cell.
   * <p>
   * This is a bound property.
   *
   * @param x  the <code>TreeCellRenderer</code> that is to render each cell
   */
  setCellRenderer(x: TreeCellRenderer): void {
    let oldValue = this.cellRenderer;
    this.cellRenderer = x;
    this.firePropertyChange$String$Object$Object(JTree.CELL_RENDERER_PROPERTY, oldValue, this.cellRenderer);
    this.invalidate();
  }
  /**
   * Returns true if the tree is editable.
   *
   * @return true if the tree is editable
   */
  isEditable(): boolean {
    return this.editable;
  }
  /**
   * Sets the cell editor.  A <code>null</code> value implies that the
   * tree cannot be edited.  If this represents a change in the
   * <code>cellEditor</code>, the <code>propertyChange</code>
   * method is invoked on all listeners.
   * <p>
   * This is a bound property.
   *
   * @param cellEditor the <code>TreeCellEditor</code> to use
   */
  setCellEditor(cellEditor: TreeCellEditor): void {
    let oldEditor = this.cellEditor;
    this.cellEditor = cellEditor;
    this.firePropertyChange$String$Object$Object(JTree.CELL_EDITOR_PROPERTY, oldEditor, cellEditor);
    this.invalidate();
  }
  /**
   * Returns the editor used to edit entries in the tree.
   *
   * @return the <code>TreeCellEditor</code> in use,
   *          or <code>null</code> if the tree cannot be edited
   */
  getCellEditor(): TreeCellEditor {
    return this.cellEditor;
  }
  /**
   * Returns the <code>TreeModel</code> that is providing the data.
   *
   * @return the <code>TreeModel</code> that is providing the data
   */
  getModel(): TreeModel {
    return this.treeModel;
  }
  /**
   * Sets the <code>TreeModel</code> that will provide the data.
   * <p>
   * This is a bound property.
   *
   * @param newModel the <code>TreeModel</code> that is to provide the data
   */
  setModel(newModel: TreeModel): void {
    this.clearSelection();
    let oldModel = this.treeModel;
    if (this.treeModel != null && this.treeModelListener != null) {
      this.treeModel.removeTreeModelListener(this.treeModelListener);
    }
    if (this.accessibleContext != null) {
      if (this.treeModel != null) {
        this.treeModel.removeTreeModelListener(this.accessibleContext);
      }
      if (newModel != null) {
        newModel.addTreeModelListener(this.accessibleContext);
      }
    }
    this.treeModel = newModel;
    this.clearToggledPaths();
    if (this.treeModel != null) {
      if (this.treeModelListener == null) {
        this.treeModelListener = this.createTreeModelListener();
      }
      if (this.treeModelListener != null) {
        this.treeModel.addTreeModelListener(this.treeModelListener);
      }
      let treeRoot = this.treeModel.getRoot();
      if (treeRoot != null && !this.treeModel.isLeaf(treeRoot)) {
        this.expandedState.put(new TreePath()._TreePath$Object(treeRoot), true);
      }
    }
    this.firePropertyChange$String$Object$Object(JTree.TREE_MODEL_PROPERTY, oldModel, this.treeModel);
    this.invalidate();
  }
  /**
   * Returns true if the root node of the tree is displayed.
   *
   * @return true if the root node of the tree is displayed
   * @see #rootVisible
   */
  isRootVisible(): boolean {
    return this.rootVisible;
  }
  /**
   * Determines whether or not the root node from
   * the <code>TreeModel</code> is visible.
   * <p>
   * This is a bound property.
   *
   * @param rootVisible true if the root node of the tree is to be displayed
   * @see #rootVisible
   */
  setRootVisible(rootVisible: boolean): void {
    let oldValue = this.rootVisible;
    this.rootVisible = rootVisible;
    this.firePropertyChange$String$boolean$boolean(JTree.ROOT_VISIBLE_PROPERTY, oldValue, this.rootVisible);
    if (this.accessibleContext != null) {
      (this.accessibleContext).fireVisibleDataPropertyChange();
    }
  }
  /**
   * Sets the value of the <code>showsRootHandles</code> property,
   * which specifies whether the node handles should be displayed.
   * The default value of this property depends on the constructor
   * used to create the <code>JTree</code>.
   * Some look and feels might not support handles;
   * they will ignore this property.
   * <p>
   * This is a bound property.
   *
   * @param newValue <code>true</code> if root handles should be displayed;
   *                 otherwise, <code>false</code>
   * @see #showsRootHandles
   * @see #getShowsRootHandles
   */
  setShowsRootHandles(newValue: boolean): void {
    let oldValue = this.showsRootHandles;
    let model = this.getModel();
    this.showsRootHandles = newValue;
    this.showsRootHandlesSet = true;
    this.firePropertyChange$String$boolean$boolean(JTree.SHOWS_ROOT_HANDLES_PROPERTY, oldValue, this.showsRootHandles);
    if (this.accessibleContext != null) {
      (this.accessibleContext).fireVisibleDataPropertyChange();
    }
    this.invalidate();
  }
  /**
   * Returns the value of the <code>showsRootHandles</code> property.
   *
   * @return the value of the <code>showsRootHandles</code> property
   * @see #showsRootHandles
   */
  getShowsRootHandles(): boolean {
    return this.showsRootHandles;
  }
  /**
   * Sets the height of each cell, in pixels.  If the specified value
   * is less than or equal to zero the current cell renderer is
   * queried for each row's height.
   * <p>
   * This is a bound property.
   *
   * @param rowHeight the height of each cell, in pixels
   */
  setRowHeight(rowHeight: number): void {
    let oldValue = this.rowHeight;
    this.rowHeight = rowHeight;
    this.rowHeightSet = true;
    this.firePropertyChange$String$int$int(JTree.ROW_HEIGHT_PROPERTY, oldValue, this.rowHeight);
    this.invalidate();
  }
  /**
   * Returns the height of each row.  If the returned value is less than
   * or equal to 0 the height for each row is determined by the
   * renderer.
   *
   * @return the height of each row
   */
  getRowHeight(): number {
    return this.rowHeight;
  }
  /**
   * Returns true if the height of each display row is a fixed size.
   *
   * @return true if the height of each row is a fixed size
   */
  isFixedRowHeight(): boolean {
    return (this.rowHeight > 0);
  }
  /**
   * Returns true if the tree is configured for a large model.
   *
   * @return true if a large model is suggested
   * @see #largeModel
   */
  isLargeModel(): boolean {
    return this.largeModel;
  }
  /**
   * Returns the indicator that tells what happens when editing is
   * interrupted.
   *
   * @return the indicator that tells what happens when editing is
   *         interrupted
   * @see #setInvokesStopCellEditing
   */
  getInvokesStopCellEditing(): boolean {
    return this.invokesStopCellEditing;
  }
  /**
   * Sets the <code>scrollsOnExpand</code> property,
   * which determines whether the
   * tree might scroll to show previously hidden children.
   * If this property is <code>true</code> (the default),
   * when a node expands
   * the tree can use scrolling to make
   * the maximum possible number of the node's descendants visible.
   * In some look and feels, trees might not need to scroll when expanded;
   * those look and feels will ignore this property.
   * <p>
   * This is a bound property.
   *
   * @param newValue <code>false</code> to disable scrolling on expansion;
   *                 <code>true</code> to enable it
   * @see #getScrollsOnExpand
   */
  setScrollsOnExpand(newValue: boolean): void {
    let oldValue = this.scrollsOnExpand;
    this.scrollsOnExpand = newValue;
    this.scrollsOnExpandSet = true;
    this.firePropertyChange$String$boolean$boolean(JTree.SCROLLS_ON_EXPAND_PROPERTY, oldValue, newValue);
  }
  /**
   * Returns the value of the <code>scrollsOnExpand</code> property.
   *
   * @return the value of the <code>scrollsOnExpand</code> property
   */
  getScrollsOnExpand(): boolean {
    return this.scrollsOnExpand;
  }
  /**
   * Returns the number of mouse clicks needed to expand or close a node.
   *
   * @return number of mouse clicks before node is expanded
   * @since 1.3
   */
  getToggleClickCount(): number {
    return this.toggleClickCount;
  }
  /**
   * Returns the <code>expandsSelectedPaths</code> property.
   * @return true if selection changes result in the parent path being
   *         expanded
   * @since 1.3
   * @see #setExpandsSelectedPaths
   */
  getExpandsSelectedPaths(): boolean {
    return this.expandsSelectedPaths;
  }
  /**
   * Returns whether or not automatic drag handling is enabled.
   *
   * @return the value of the {@code dragEnabled} property
   * @see #setDragEnabled
   * @since 1.4
   */
  getDragEnabled(): boolean {
    return this.dragEnabled;
  }
  /**
   * Calculates a drop location in this component, representing where a
   * drop at the given point should insert data.
   *
   * @param p the point to calculate a drop location for
   * @return the drop location, or <code>null</code>
   */
  dropLocationForPoint$Point(p: Point): JTree$DropLocation {
    let location = null;
    let row = this.getClosestRowForLocation(p.x_, p.y_);
    let bounds = this.getRowBounds(row);
    let model = this.getModel();
    let root = (model == null) ? null : model.getRoot();
    let rootPath = (root == null) ? null : new TreePath()._TreePath$Object(root);
    let child: TreePath;
    let parent: TreePath;
    let outside = row === -1 || p.y_ < bounds.y_ || p.y_ >= ((bounds.y_ + bounds.height_) | 0);
    {
      let checkOn: boolean, section: SwingUtilities2$Section;
      switch (this.dropMode) {
        case DropMode.USE_SELECTION:
        case DropMode.ON:
          if (outside) {
            location = new JTree$DropLocation()._JTree$DropLocation(p, null, -1);
          } else {
            location = new JTree$DropLocation()._JTree$DropLocation(p, this.getPathForRow(row), -1);
          }
          break;
        case DropMode.INSERT:
        case DropMode.ON_OR_INSERT:
          if (row === -1) {
            if (root != null && !model.isLeaf(root) && this.isExpanded$TreePath(rootPath)) {
              location = new JTree$DropLocation()._JTree$DropLocation(p, rootPath, 0);
            } else {
              location = new JTree$DropLocation()._JTree$DropLocation(p, null, -1);
            }
            break;
          }
          checkOn = this.dropMode === DropMode.ON_OR_INSERT || !model.isLeaf(this.getPathForRow(row).getLastPathComponent());
          section = SwingUtilities2.liesInVertical(bounds, p, checkOn);
          if (section === SwingUtilities2$Section.LEADING) {
            child = this.getPathForRow(row);
            parent = child.getParentPath();
          } else if (section === SwingUtilities2$Section.TRAILING) {
            let index = (row + 1) | 0;
            if (index >= this.getRowCount()) {
              if (model.isLeaf(root) || !this.isExpanded$TreePath(rootPath)) {
                location = new JTree$DropLocation()._JTree$DropLocation(p, null, -1);
              } else {
                parent = rootPath;
                index = model.getChildCount(root);
                location = new JTree$DropLocation()._JTree$DropLocation(p, parent, index);
              }
              break;
            }
            child = this.getPathForRow(index);
            parent = child.getParentPath();
            let prev = this.getPathForRow(row).getParentPath();
            if (prev != null && !prev.equals(parent)) {
              location = new JTree$DropLocation()._JTree$DropLocation(p, prev, model.getChildCount(prev.getLastPathComponent()));
              break;
            }
          } else {
            // assert checkOn
            location = new JTree$DropLocation()._JTree$DropLocation(p, this.getPathForRow(row), -1);
            break;
          }
          if (parent != null) {
            location = new JTree$DropLocation()._JTree$DropLocation(p, parent, model.getIndexOfChild(parent.getLastPathComponent(), child.getLastPathComponent()));
          } else if (checkOn || !model.isLeaf(root)) {
            location = new JTree$DropLocation()._JTree$DropLocation(p, rootPath, -1);
          } else {
            location = new JTree$DropLocation()._JTree$DropLocation(p, null, -1);
          }
          break;
        default:
          // assert false
      }
    }
    if (outside || row !== this.expandRow_) {
      this.cancelDropTimer();
    }
    if (!outside && row !== this.expandRow_) {
      if (this.isCollapsed$int(row)) {
        this.expandRow_ = row;
        this.startDropTimer();
      }
    }
    return location;
  }
  /**
   * Called to set or clear the drop location during a DnD operation.
   * In some cases, the component may need to use it's internal selection
   * temporarily to indicate the drop location. To help facilitate this,
   * this method returns and accepts as a parameter a state object.
   * This state object can be used to store, and later restore, the selection
   * state. Whatever this method returns will be passed back to it in
   * future calls, as the state parameter. If it wants the DnD system to
   * continue storing the same state, it must pass it back every time.
   * Here's how this is used:
   * <p>
   * Let's say that on the first call to this method the component decides
   * to save some state (because it is about to use the selection to show
   * a drop index). It can return a state object to the caller encapsulating
   * any saved selection state. On a second call, let's say the drop location
   * is being changed to something else. The component doesn't need to
   * restore anything yet, so it simply passes back the same state object
   * to have the DnD system continue storing it. Finally, let's say this
   * method is messaged with <code>null</code>. This means DnD
   * is finished with this component for now, meaning it should restore
   * state. At this point, it can use the state parameter to restore
   * said state, and of course return <code>null</code> since there's
   * no longer anything to store.
   *
   * @param location the drop location (as calculated by
   *        <code>dropLocationForPoint</code>) or <code>null</code>
   *        if there's no longer a valid drop location
   * @param state the state object saved earlier for this component,
   *        or <code>null</code>
   * @param forDrop whether or not the method is being called because an
   *        actual drop occurred
   * @return any saved state for this component, or <code>null</code> if none
   */
  setDropLocation$DropLocation$Object$boolean(location: TransferHandler$DropLocation, state: any, forDrop: boolean): any {
    let retVal = null;
    let treeLocation = location;
    if (this.dropMode === DropMode.USE_SELECTION) {
      if (treeLocation == null) {
        if (!forDrop && state != null) {
          this.setSelectionPaths((state)[0]);
          this.setAnchorSelectionPath((state)[1][0]);
          this.setLeadSelectionPath((state)[1][1]);
        }
      } else {
        if (this.dropLocation == null) {
          let paths = this.getSelectionPaths();
          if (paths == null) {
            paths = $J.newArray(0, null);
          }
          retVal = [paths, [this.getAnchorSelectionPath(), this.getLeadSelectionPath()]];
        } else {
          retVal = state;
        }
        this.setSelectionPath(treeLocation.getPath());
      }
    }
    let old = this.dropLocation;
    this.dropLocation = treeLocation;
    this.firePropertyChange$String$Object$Object('dropLocation', old, this.dropLocation);
    return retVal;
  }
  /**
   * Called to indicate to this component that DnD is done.
   * Allows for us to cancel the expand timer.
   */
  dndDone(): void {
    this.cancelDropTimer();
    this.dropTimer = null;
  }
  /**
   * Returns the location that this component should visually indicate
   * as the drop location during a DnD operation over the component,
   * or {@code null} if no location is to currently be shown.
   * <p>
   * This method is not meant for querying the drop location
   * from a {@code TransferHandler}, as the drop location is only
   * set after the {@code TransferHandler}'s <code>canImport</code>
   * has returned and has allowed for the location to be shown.
   * <p>
   * When this property changes, a property change event with
   * name "dropLocation" is fired by the component.
   *
   * @return the drop location
   * @see #setDropMode
   * @see TransferHandler#canImport(TransferHandler.TransferSupport)
   * @since 1.6
   */
  getDropLocation(): JTree$DropLocation {
    return this.dropLocation;
  }
  startDropTimer(): void {
    if (this.dropTimer == null) {
      this.dropTimer = new JTree$TreeTimer().$o(this)._JTree$TreeTimer();
    }
    this.dropTimer.start();
  }
  cancelDropTimer(): void {
    if (this.dropTimer != null && this.dropTimer.isRunning()) {
      this.expandRow_ = -1;
      this.dropTimer.stop();
    }
  }
  /**
   * Returns <code>isEditable</code>. This is invoked from the UI before
   * editing begins to insure that the given path can be edited. This
   * is provided as an entry point for subclassers to add filtered
   * editing without having to resort to creating a new editor.
   *
   * @param path a {@code TreePath} identifying a node
   * @return true if every parent node and the node itself is editable
   * @see #isEditable
   */
  isPathEditable(path: TreePath): boolean {
    return this.isEditable();
  }
  /**
   * Overrides <code>JComponent</code>'s <code>getToolTipText</code>
   * method in order to allow
   * renderer's tips to be used if it has text set.
   * <p>
   * NOTE: For <code>JTree</code> to properly display tooltips of its
   * renderers, <code>JTree</code> must be a registered component with the
   * <code>ToolTipManager</code>.  This can be done by invoking
   * <code>ToolTipManager.sharedInstance().registerComponent(tree)</code>.
   * This is not done automatically!
   *
   * @param event the <code>MouseEvent</code> that initiated the
   *          <code>ToolTip</code> display
   * @return a string containing the  tooltip or <code>null</code>
   *          if <code>event</code> is null
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    let tip = null;
    if (event != null) {
      let p = event.getPoint();
      let selRow = this.getRowForLocation(p.x_, p.y_);
      let r = this.getCellRenderer();
      if (selRow !== -1 && r != null) {
        let path = this.getPathForRow(selRow);
        let lastPath = path.getLastPathComponent();
        let rComponent = r.getTreeCellRendererComponent(this, lastPath, this.isRowSelected(selRow), this.isExpanded$int(selRow), this.getModel().isLeaf(lastPath), selRow, true);
        if (rComponent instanceof JComponent) {
          let newEvent: MouseEvent;
          let pathBounds = this.getPathBounds(path);
          p.translate(-pathBounds.x_, -pathBounds.y_);
          let modifiers = event.getModifiers();
          newEvent = new MouseEvent()._MouseEvent$Component$int$long$int$int$int$int$int$int$boolean$int(rComponent, event.getID(), event.getWhen(), modifiers, p.x_, p.y_, event.getXOnScreen(), event.getYOnScreen(), event.getClickCount(), event.isPopupTrigger(), MouseEvent.NOBUTTON);
          let meAccessor = AWTAccessor.getMouseEventAccessor();
          meAccessor.setCausedByTouchEvent(newEvent, meAccessor.isCausedByTouchEvent(event));
          tip = (rComponent).getToolTipText$MouseEvent(newEvent);
        }
      }
    }
    if (tip == null) {
      tip = this.getToolTipText$();
    }
    return tip;
  }
  /**
   * Called by the renderers to convert the specified value to
   * text. This implementation returns <code>value.toString</code>, ignoring
   * all other arguments. To control the conversion, subclass this
   * method and use any of the arguments you need.
   *
   * @param value the <code>Object</code> to convert to text
   * @param selected true if the node is selected
   * @param expanded true if the node is expanded
   * @param leaf  true if the node is a leaf node
   * @param row  an integer specifying the node's display row, where 0 is
   *             the first row in the display
   * @param hasFocus true if the node has the focus
   * @return the <code>String</code> representation of the node's value
   */
  convertValueToText(value: any, selected: boolean, expanded: boolean, leaf: boolean, row: number, hasFocus: boolean): string {
    if (value != null) {
      let sValue = $J.str(value);
      if (sValue != null) {
        return sValue;
      }
    }
    return '';
  }
  /**
   * Returns the number of viewable nodes. A node is viewable if all of its
   * parents are expanded. The root is only included in this count if
   * {@code isRootVisible()} is {@code true}. This returns {@code 0} if
   * the UI has not been set.
   *
   * @return the number of viewable nodes
   */
  getRowCount(): number {
    let tree = this.getUI();
    if (tree != null) {
      return tree.getRowCount(this);
    }
    return 0;
  }
  /**
   * Selects the node identified by the specified path. If any
   * component of the path is hidden (under a collapsed node), and
   * <code>getExpandsSelectedPaths</code> is true it is
   * exposed (made viewable).
   *
   * @param path the <code>TreePath</code> specifying the node to select
   */
  setSelectionPath(path: TreePath): void {
    this.getSelectionModel().setSelectionPath(path);
  }
  /**
   * Selects the nodes identified by the specified array of paths.
   * If any component in any of the paths is hidden (under a collapsed
   * node), and <code>getExpandsSelectedPaths</code> is true
   * it is exposed (made viewable).
   *
   * @param paths an array of <code>TreePath</code> objects that specifies
   *          the nodes to select
   */
  setSelectionPaths(paths: TreePath[]): void {
    this.getSelectionModel().setSelectionPaths(paths);
  }
  /**
   * Sets the path identifies as the lead. The lead may not be selected.
   * The lead is not maintained by <code>JTree</code>,
   * rather the UI will update it.
   * <p>
   * This is a bound property.
   *
   * @param newPath  the new lead path
   * @since 1.3
   */
  setLeadSelectionPath(newPath: TreePath): void {
    let oldValue = this.leadPath;
    this.leadPath = newPath;
    this.firePropertyChange$String$Object$Object(JTree.LEAD_SELECTION_PATH_PROPERTY, oldValue, newPath);
    if (this.accessibleContext != null) {
      (this.accessibleContext).fireActiveDescendantPropertyChange(oldValue, newPath);
    }
  }
  /**
   * Sets the path identified as the anchor.
   * The anchor is not maintained by <code>JTree</code>, rather the UI will
   * update it.
   * <p>
   * This is a bound property.
   *
   * @param newPath  the new anchor path
   * @since 1.3
   */
  setAnchorSelectionPath(newPath: TreePath): void {
    let oldValue = this.anchorPath;
    this.anchorPath = newPath;
    this.firePropertyChange$String$Object$Object(JTree.ANCHOR_SELECTION_PATH_PROPERTY, oldValue, newPath);
  }
  /**
   * Selects the node at the specified row in the display.
   *
   * @param row  the row to select, where 0 is the first row in
   *             the display
   */
  setSelectionRow(row: number): void {
    let rows = [row];
    this.setSelectionRows(rows);
  }
  /**
   * Selects the nodes corresponding to each of the specified rows
   * in the display. If a particular element of <code>rows</code> is
   * &lt; 0 or &gt;= <code>getRowCount</code>, it will be ignored.
   * If none of the elements
   * in <code>rows</code> are valid rows, the selection will
   * be cleared. That is it will be as if <code>clearSelection</code>
   * was invoked.
   *
   * @param rows  an array of ints specifying the rows to select,
   *              where 0 indicates the first row in the display
   */
  setSelectionRows(rows: number[]): void {
    let ui = this.getUI();
    if (ui != null && rows != null) {
      let numRows = rows.length;
      let paths = $J.newArray(numRows, null);
      for (let counter = 0; counter < numRows; counter++) {
        paths[counter] = ui.getPathForRow(this, rows[counter]);
      }
      this.setSelectionPaths(paths);
    }
  }
  /**
   * Adds the node identified by the specified <code>TreePath</code>
   * to the current selection. If any component of the path isn't
   * viewable, and <code>getExpandsSelectedPaths</code> is true it is
   * made viewable.
   * <p>
   * Note that <code>JTree</code> does not allow duplicate nodes to
   * exist as children under the same parent -- each sibling must be
   * a unique object.
   *
   * @param path the <code>TreePath</code> to add
   */
  addSelectionPath(path: TreePath): void {
    this.getSelectionModel().addSelectionPath(path);
  }
  /**
   * Adds each path in the array of paths to the current selection. If
   * any component of any of the paths isn't viewable and
   * <code>getExpandsSelectedPaths</code> is true, it is
   * made viewable.
   * <p>
   * Note that <code>JTree</code> does not allow duplicate nodes to
   * exist as children under the same parent -- each sibling must be
   * a unique object.
   *
   * @param paths an array of <code>TreePath</code> objects that specifies
   *          the nodes to add
   */
  addSelectionPaths(paths: TreePath[]): void {
    this.getSelectionModel().addSelectionPaths(paths);
  }
  /**
   * Adds the path at the specified row to the current selection.
   *
   * @param row  an integer specifying the row of the node to add,
   *             where 0 is the first row in the display
   */
  addSelectionRow(row: number): void {
    let rows = [row];
    this.addSelectionRows(rows);
  }
  /**
   * Adds the paths at each of the specified rows to the current selection.
   *
   * @param rows  an array of ints specifying the rows to add,
   *              where 0 indicates the first row in the display
   */
  addSelectionRows(rows: number[]): void {
    let ui = this.getUI();
    if (ui != null && rows != null) {
      let numRows = rows.length;
      let paths = $J.newArray(numRows, null);
      for (let counter = 0; counter < numRows; counter++) {
        paths[counter] = ui.getPathForRow(this, rows[counter]);
      }
      this.addSelectionPaths(paths);
    }
  }
  /**
   * Returns the last path component of the selected path. This is
   * a convenience method for
   * {@code getSelectionModel().getSelectionPath().getLastPathComponent()}.
   * This is typically only useful if the selection has one path.
   *
   * @return the last path component of the selected path, or
   *         <code>null</code> if nothing is selected
   * @see TreePath#getLastPathComponent
   */
  getLastSelectedPathComponent(): any {
    let selPath = this.getSelectionModel().getSelectionPath();
    if (selPath != null) {
      return selPath.getLastPathComponent();
    }
    return null;
  }
  /**
   * Returns the path identified as the lead.
   * @return path identified as the lead
   */
  getLeadSelectionPath(): TreePath {
    return this.leadPath;
  }
  /**
   * Returns the path identified as the anchor.
   * @return path identified as the anchor
   * @since 1.3
   */
  getAnchorSelectionPath(): TreePath {
    return this.anchorPath;
  }
  /**
   * Returns the path to the first selected node.
   *
   * @return the <code>TreePath</code> for the first selected node,
   *          or <code>null</code> if nothing is currently selected
   */
  getSelectionPath(): TreePath {
    return this.getSelectionModel().getSelectionPath();
  }
  /**
   * Returns the paths of all selected values.
   *
   * @return an array of <code>TreePath</code> objects indicating the selected
   *         nodes, or <code>null</code> if nothing is currently selected
   */
  getSelectionPaths(): TreePath[] {
    let selectionPaths = this.getSelectionModel().getSelectionPaths();
    return (selectionPaths != null && selectionPaths.length > 0) ? selectionPaths : null;
  }
  /**
   * Returns the number of nodes selected.
   *
   * @return the number of nodes selected
   */
  getSelectionCount(): number {
    return this.selectionModel.getSelectionCount();
  }
  /**
   * Returns the smallest selected row. If the selection is empty, or
   * none of the selected paths are viewable, {@code -1} is returned.
   *
   * @return the smallest selected row
   */
  getMinSelectionRow(): number {
    return this.getSelectionModel().getMinSelectionRow();
  }
  /**
   * Returns the row index corresponding to the lead path.
   *
   * @return an integer giving the row index of the lead path,
   *          where 0 is the first row in the display; or -1
   *          if <code>leadPath</code> is <code>null</code>
   */
  getLeadSelectionRow(): number {
    let leadPath = this.getLeadSelectionPath();
    if (leadPath != null) {
      return this.getRowForPath(leadPath);
    }
    return -1;
  }
  /**
   * Returns true if the item identified by the path is currently selected.
   *
   * @param path a <code>TreePath</code> identifying a node
   * @return true if the node is selected
   */
  isPathSelected(path: TreePath): boolean {
    return this.getSelectionModel().isPathSelected(path);
  }
  /**
   * Returns true if the node identified by row is selected.
   *
   * @param row  an integer specifying a display row, where 0 is the first
   *             row in the display
   * @return true if the node is selected
   */
  isRowSelected(row: number): boolean {
    return this.getSelectionModel().isRowSelected(row);
  }
  /**
   * Returns an <code>Enumeration</code> of the descendants of the
   * path <code>parent</code> that
   * are currently expanded. If <code>parent</code> is not currently
   * expanded, this will return <code>null</code>.
   * If you expand/collapse nodes while
   * iterating over the returned <code>Enumeration</code>
   * this may not return all
   * the expanded paths, or may return paths that are no longer expanded.
   *
   * @param parent  the path which is to be examined
   * @return an <code>Enumeration</code> of the descendents of
   *          <code>parent</code>, or <code>null</code> if
   *          <code>parent</code> is not currently expanded
   */
  getExpandedDescendants(parent: TreePath): Enumeration<TreePath> {
    if (!this.isExpanded$TreePath(parent)) {
      return null;
    }
    let toggledPaths = this.expandedState.keys();
    let elements = null;
    let path: TreePath;
    let value: boolean;
    if (toggledPaths != null) {
      while (toggledPaths.hasMoreElements()) {
        path = toggledPaths.nextElement();
        value = this.expandedState.get(path);
        if (path !== parent && value != null && value && parent.isDescendant(path) && this.isVisible$TreePath(path)) {
          if (elements == null) {
            elements = new Vector();
          }
          elements.addElement(path);
        }
      }
    }
    if (elements == null) {
      let empty = Collections.emptySet();
      return Collections.enumeration(empty);
    }
    return elements.elements();
  }
  /**
   * Returns true if the node identified by the path has ever been
   * expanded.
   *
   * @param path a {@code TreePath} identifying a node
   * @return true if the <code>path</code> has ever been expanded
   */
  hasBeenExpanded(path: TreePath): boolean {
    return (path != null && this.expandedState.get(path) != null);
  }
  /**
   * Returns true if the node identified by the path is currently expanded,
   *
   * @param path  the <code>TreePath</code> specifying the node to check
   * @return false if any of the nodes in the node's path are collapsed,
   *               true if all nodes in the path are expanded
   */
  isExpanded$TreePath(path: TreePath): boolean {
    if (path == null) {
      return false;
    }
    let value: boolean;
    do {
      value = this.expandedState.get(path);
      if (value == null || !value) {
        return false;
      }
    } while ((path = path.getParentPath()) != null);
    return true;
  }
  /**
   * Returns true if the node at the specified display row is currently
   * expanded.
   *
   * @param row  the row to check, where 0 is the first row in the
   *             display
   * @return true if the node is currently expanded, otherwise false
   */
  isExpanded$int(row: number): boolean {
    let tree = this.getUI();
    if (tree != null) {
      let path = tree.getPathForRow(this, row);
      if (path != null) {
        let value = this.expandedState.get(path);
        return (value != null && value);
      }
    }
    return false;
  }
  /**
   * Returns true if the node at the specified display row is collapsed.
   *
   * @param row  the row to check, where 0 is the first row in the
   *             display
   * @return true if the node is currently collapsed, otherwise false
   */
  isCollapsed$int(row: number): boolean {
    return !this.isExpanded$int(row);
  }
  /**
   * Ensures that the node identified by path is currently viewable.
   *
   * @param path  the <code>TreePath</code> to make visible
   */
  makeVisible(path: TreePath): void {
    if (path != null) {
      let parentPath = path.getParentPath();
      if (parentPath != null) {
        this.expandPath(parentPath);
      }
    }
  }
  /**
   * Returns true if the value identified by path is currently viewable,
   * which means it is either the root or all of its parents are expanded.
   * Otherwise, this method returns false.
   *
   * @param path {@code TreePath} identifying a node
   * @return true if the node is viewable, otherwise false
   */
  isVisible$TreePath(path: TreePath): boolean {
    if (path != null) {
      let parentPath = path.getParentPath();
      if (parentPath != null) {
        return this.isExpanded$TreePath(parentPath);
      }
      return true;
    }
    return false;
  }
  /**
   * Returns the <code>Rectangle</code> that the specified node will be drawn
   * into. Returns <code>null</code> if any component in the path is hidden
   * (under a collapsed parent).
   * <p>
   * Note:<br>
   * This method returns a valid rectangle, even if the specified
   * node is not currently displayed.
   *
   * @param path the <code>TreePath</code> identifying the node
   * @return the <code>Rectangle</code> the node is drawn in,
   *          or <code>null</code>
   */
  getPathBounds(path: TreePath): Rectangle {
    let tree = this.getUI();
    if (tree != null) {
      return tree.getPathBounds$JTree$TreePath(this, path);
    }
    return null;
  }
  /**
   * Returns the <code>Rectangle</code> that the node at the specified row is
   * drawn in.
   *
   * @param row  the row to be drawn, where 0 is the first row in the
   *             display
   * @return the <code>Rectangle</code> the node is drawn in
   */
  getRowBounds(row: number): Rectangle {
    return this.getPathBounds(this.getPathForRow(row));
  }
  /**
   * Makes sure all the path components in path are expanded (except
   * for the last path component) and scrolls so that the
   * node identified by the path is displayed. Only works when this
   * <code>JTree</code> is contained in a <code>JScrollPane</code>.
   *
   * @param path  the <code>TreePath</code> identifying the node to
   *          bring into view
   */
  scrollPathToVisible(path: TreePath): void {
    if (path != null) {
      this.makeVisible(path);
      let bounds = this.getPathBounds(path);
      if (bounds != null) {
        this.scrollRectToVisible(bounds);
        if (this.accessibleContext != null) {
          (this.accessibleContext).fireVisibleDataPropertyChange();
        }
      }
    }
  }
  /**
   * Returns the path for the specified row.  If <code>row</code> is
   * not visible, or a {@code TreeUI} has not been set, <code>null</code>
   * is returned.
   *
   * @param row  an integer specifying a row
   * @return the <code>TreePath</code> to the specified node,
   *          <code>null</code> if <code>row &lt; 0</code>
   *          or <code>row &gt;= getRowCount()</code>
   */
  getPathForRow(row: number): TreePath {
    let tree = this.getUI();
    if (tree != null) {
      return tree.getPathForRow(this, row);
    }
    return null;
  }
  /**
   * Returns the row that displays the node identified by the specified
   * path.
   *
   * @param path  the <code>TreePath</code> identifying a node
   * @return an integer specifying the display row, where 0 is the first
   *         row in the display, or -1 if any of the elements in path
   *         are hidden under a collapsed parent.
   */
  getRowForPath(path: TreePath): number {
    let tree = this.getUI();
    if (tree != null) {
      return tree.getRowForPath(this, path);
    }
    return -1;
  }
  /**
   * Ensures that the node identified by the specified path is
   * expanded and viewable. If the last item in the path is a
   * leaf, this will have no effect.
   *
   * @param path  the <code>TreePath</code> identifying a node
   */
  expandPath(path: TreePath): void {
    let model = this.getModel();
    if (path != null && model != null && !model.isLeaf(path.getLastPathComponent())) {
      this.setExpandedState(path, true);
    }
  }
  /**
   * Ensures that the node in the specified row is expanded and
   * viewable.
   * <p>
   * If <code>row</code> is &lt; 0 or &gt;= <code>getRowCount</code> this
   * will have no effect.
   *
   * @param row  an integer specifying a display row, where 0 is the
   *             first row in the display
   */
  expandRow(row: number): void {
    this.expandPath(this.getPathForRow(row));
  }
  /**
   * Ensures that the node identified by the specified path is
   * collapsed and viewable.
   *
   * @param path  the <code>TreePath</code> identifying a node
   */
  collapsePath(path: TreePath): void {
    this.setExpandedState(path, false);
  }
  /**
   * Ensures that the node in the specified row is collapsed.
   * <p>
   * If <code>row</code> is &lt; 0 or &gt;= <code>getRowCount</code> this
   * will have no effect.
   *
   * @param row  an integer specifying a display row, where 0 is the
   *             first row in the display
   */
  collapseRow(row: number): void {
    this.collapsePath(this.getPathForRow(row));
  }
  /**
   * Returns the path for the node at the specified location.
   *
   * @param x an integer giving the number of pixels horizontally from
   *          the left edge of the display area, minus any left margin
   * @param y an integer giving the number of pixels vertically from
   *          the top of the display area, minus any top margin
   * @return  the <code>TreePath</code> for the node at that location
   */
  getPathForLocation(x: number, y: number): TreePath {
    let closestPath = this.getClosestPathForLocation(x, y);
    if (closestPath != null) {
      let pathBounds = this.getPathBounds(closestPath);
      if (pathBounds != null && x >= pathBounds.x_ && x < ((pathBounds.x_ + pathBounds.width_) | 0) && y >= pathBounds.y_ && y < ((pathBounds.y_ + pathBounds.height_) | 0)) {
        return closestPath;
      }
    }
    return null;
  }
  /**
   * Returns the row for the specified location.
   *
   * @param x an integer giving the number of pixels horizontally from
   *          the left edge of the display area, minus any left margin
   * @param y an integer giving the number of pixels vertically from
   *          the top of the display area, minus any top margin
   * @return the row corresponding to the location, or -1 if the
   *         location is not within the bounds of a displayed cell
   * @see #getClosestRowForLocation
   */
  getRowForLocation(x: number, y: number): number {
    return this.getRowForPath(this.getPathForLocation(x, y));
  }
  /**
   * Returns the path to the node that is closest to x,y.  If
   * no nodes are currently viewable, or there is no model, returns
   * <code>null</code>, otherwise it always returns a valid path.  To test if
   * the node is exactly at x, y, get the node's bounds and
   * test x, y against that.
   *
   * @param x an integer giving the number of pixels horizontally from
   *          the left edge of the display area, minus any left margin
   * @param y an integer giving the number of pixels vertically from
   *          the top of the display area, minus any top margin
   * @return  the <code>TreePath</code> for the node closest to that location,
   *          <code>null</code> if nothing is viewable or there is no model
   *
   * @see #getPathForLocation
   * @see #getPathBounds
   */
  getClosestPathForLocation(x: number, y: number): TreePath {
    let tree = this.getUI();
    if (tree != null) {
      return tree.getClosestPathForLocation(this, x, y);
    }
    return null;
  }
  /**
   * Returns the row to the node that is closest to x,y.  If no nodes
   * are viewable or there is no model, returns -1. Otherwise,
   * it always returns a valid row.  To test if the returned object is
   * exactly at x, y, get the bounds for the node at the returned
   * row and test x, y against that.
   *
   * @param x an integer giving the number of pixels horizontally from
   *          the left edge of the display area, minus any left margin
   * @param y an integer giving the number of pixels vertically from
   *          the top of the display area, minus any top margin
   * @return the row closest to the location, -1 if nothing is
   *         viewable or there is no model
   *
   * @see #getRowForLocation
   * @see #getRowBounds
   */
  getClosestRowForLocation(x: number, y: number): number {
    return this.getRowForPath(this.getClosestPathForLocation(x, y));
  }
  /**
   * Returns true if the tree is being edited. The item that is being
   * edited can be obtained using <code>getSelectionPath</code>.
   *
   * @return true if the user is currently editing a node
   * @see #getSelectionPath
   */
  isEditing(): boolean {
    let tree = this.getUI();
    if (tree != null) {
      return tree.isEditing(this);
    }
    return false;
  }
  /**
   * Cancels the current editing session. Has no effect if the
   * tree isn't being edited.
   */
  cancelEditing(): void {
    let tree = this.getUI();
    if (tree != null) {
      tree.cancelEditing(this);
    }
  }
  /**
   * Selects the node identified by the specified path and initiates
   * editing.  The edit-attempt fails if the <code>CellEditor</code>
   * does not allow
   * editing for the specified item.
   *
   * @param path  the <code>TreePath</code> identifying a node
   */
  startEditingAtPath(path: TreePath): void {
    let tree = this.getUI();
    if (tree != null) {
      tree.startEditingAtPath(this, path);
    }
  }
  /**
   * Returns the model for selections. This should always return a
   * non-<code>null</code> value. If you don't want to allow anything
   * to be selected
   * set the selection model to <code>null</code>, which forces an empty
   * selection model to be used.
   *
   * @return the model for selections
   * @see #setSelectionModel
   */
  getSelectionModel(): TreeSelectionModel {
    return this.selectionModel;
  }
  /**
   * Returns the paths (inclusive) between the specified rows. If
   * the specified indices are within the viewable set of rows, or
   * bound the viewable set of rows, then the indices are
   * constrained by the viewable set of rows. If the specified
   * indices are not within the viewable set of rows, or do not
   * bound the viewable set of rows, then an empty array is
   * returned. For example, if the row count is {@code 10}, and this
   * method is invoked with {@code -1, 20}, then the specified
   * indices are constrained to the viewable set of rows, and this is
   * treated as if invoked with {@code 0, 9}. On the other hand, if
   * this were invoked with {@code -10, -1}, then the specified
   * indices do not bound the viewable set of rows, and an empty
   * array is returned.
   * <p>
   * The parameters are not order dependent. That is, {@code
   * getPathBetweenRows(x, y)} is equivalent to
   * {@code getPathBetweenRows(y, x)}.
   * <p>
   * An empty array is returned if the row count is {@code 0}, or
   * the specified indices do not bound the viewable set of rows.
   *
   * @param index0 the first index in the range
   * @param index1 the last index in the range
   * @return the paths (inclusive) between the specified row indices
   */
  getPathBetweenRows(index0: number, index1: number): TreePath[] {
    let tree = this.getUI();
    if (tree != null) {
      let rowCount = this.getRowCount();
      if (rowCount > 0 && !((index0 < 0 && index1 < 0) || (index0 >= rowCount && index1 >= rowCount))) {
        index0 = Math.min((rowCount - 1) | 0, Math.max(index0, 0));
        index1 = Math.min((rowCount - 1) | 0, Math.max(index1, 0));
        let minIndex = Math.min(index0, index1);
        let maxIndex = Math.max(index0, index1);
        let selection = $J.newArray((maxIndex - minIndex + 1) | 0, null);
        for (let counter = minIndex; counter <= maxIndex; counter++) {
          (selection[(counter - minIndex) | 0]) = tree.getPathForRow(this, counter);
        }
        return selection;
      }
    }
    return $J.newArray(0, null);
  }
  /**
   * Selects the rows in the specified interval (inclusive). If
   * the specified indices are within the viewable set of rows, or bound
   * the viewable set of rows, then the specified rows are constrained by
   * the viewable set of rows. If the specified indices are not within the
   * viewable set of rows, or do not bound the viewable set of rows, then
   * the selection is cleared. For example, if the row count is {@code
   * 10}, and this method is invoked with {@code -1, 20}, then the
   * specified indices bounds the viewable range, and this is treated as
   * if invoked with {@code 0, 9}. On the other hand, if this were
   * invoked with {@code -10, -1}, then the specified indices do not
   * bound the viewable set of rows, and the selection is cleared.
   * <p>
   * The parameters are not order dependent. That is, {@code
   * setSelectionInterval(x, y)} is equivalent to
   * {@code setSelectionInterval(y, x)}.
   *
   * @param index0 the first index in the range to select
   * @param index1 the last index in the range to select
   */
  setSelectionInterval(index0: number, index1: number): void {
    let paths = this.getPathBetweenRows(index0, index1);
    this.getSelectionModel().setSelectionPaths(paths);
  }
  /**
   * Adds the specified rows (inclusive) to the selection. If the
   * specified indices are within the viewable set of rows, or bound
   * the viewable set of rows, then the specified indices are
   * constrained by the viewable set of rows. If the indices are not
   * within the viewable set of rows, or do not bound the viewable
   * set of rows, then the selection is unchanged. For example, if
   * the row count is {@code 10}, and this method is invoked with
   * {@code -1, 20}, then the specified indices bounds the viewable
   * range, and this is treated as if invoked with {@code 0, 9}. On
   * the other hand, if this were invoked with {@code -10, -1}, then
   * the specified indices do not bound the viewable set of rows,
   * and the selection is unchanged.
   * <p>
   * The parameters are not order dependent. That is, {@code
   * addSelectionInterval(x, y)} is equivalent to
   * {@code addSelectionInterval(y, x)}.
   *
   * @param index0 the first index in the range to add to the selection
   * @param index1 the last index in the range to add to the selection
   */
  addSelectionInterval(index0: number, index1: number): void {
    let paths = this.getPathBetweenRows(index0, index1);
    if (paths != null && paths.length > 0) {
      this.getSelectionModel().addSelectionPaths(paths);
    }
  }
  /**
   * Removes the specified rows (inclusive) from the selection. If
   * the specified indices are within the viewable set of rows, or bound
   * the viewable set of rows, then the specified indices are constrained by
   * the viewable set of rows. If the specified indices are not within the
   * viewable set of rows, or do not bound the viewable set of rows, then
   * the selection is unchanged. For example, if the row count is {@code
   * 10}, and this method is invoked with {@code -1, 20}, then the
   * specified range bounds the viewable range, and this is treated as
   * if invoked with {@code 0, 9}. On the other hand, if this were
   * invoked with {@code -10, -1}, then the specified range does not
   * bound the viewable set of rows, and the selection is unchanged.
   * <p>
   * The parameters are not order dependent. That is, {@code
   * removeSelectionInterval(x, y)} is equivalent to
   * {@code removeSelectionInterval(y, x)}.
   *
   * @param index0 the first row to remove from the selection
   * @param index1 the last row to remove from the selection
   */
  removeSelectionInterval(index0: number, index1: number): void {
    let paths = this.getPathBetweenRows(index0, index1);
    if (paths != null && paths.length > 0) {
      this.getSelectionModel().removeSelectionPaths(paths);
    }
  }
  /**
   * Removes the node identified by the specified path from the current
   * selection.
   *
   * @param path  the <code>TreePath</code> identifying a node
   */
  removeSelectionPath(path: TreePath): void {
    this.getSelectionModel().removeSelectionPath(path);
  }
  /**
   * Removes the nodes identified by the specified paths from the
   * current selection.
   *
   * @param paths an array of <code>TreePath</code> objects that
   *              specifies the nodes to remove
   */
  removeSelectionPaths(paths: TreePath[]): void {
    this.getSelectionModel().removeSelectionPaths(paths);
  }
  /**
   * Removes the row at the index <code>row</code> from the current
   * selection.
   *
   * @param row  the row to remove
   */
  removeSelectionRow(row: number): void {
    let rows = [row];
    this.removeSelectionRows(rows);
  }
  /**
   * Removes the rows that are selected at each of the specified
   * rows.
   *
   * @param rows  an array of ints specifying display rows, where 0 is
   *             the first row in the display
   */
  removeSelectionRows(rows: number[]): void {
    let ui = this.getUI();
    if (ui != null && rows != null) {
      let numRows = rows.length;
      let paths = $J.newArray(numRows, null);
      for (let counter = 0; counter < numRows; counter++) {
        paths[counter] = ui.getPathForRow(this, rows[counter]);
      }
      this.removeSelectionPaths(paths);
    }
  }
  /**
   * Clears the selection.
   */
  clearSelection(): void {
    this.getSelectionModel().clearSelection();
  }
  /**
   * Adds a listener for <code>TreeExpansion</code> events.
   *
   * @param tel a TreeExpansionListener that will be notified when
   *            a tree node is expanded or collapsed (a "negative
   *            expansion")
   */
  addTreeExpansionListener(tel: TreeExpansionListener): void {
    if (this.settingUI) {
      this.uiTreeExpansionListener = tel;
    }
    this.listenerList.add($J.cls(TreeExpansionListener), tel);
  }
  /**
   * Removes a listener for <code>TreeExpansion</code> events.
   *
   * @param tel the <code>TreeExpansionListener</code> to remove
   */
  removeTreeExpansionListener(tel: TreeExpansionListener): void {
    this.listenerList.remove($J.cls(TreeExpansionListener), tel);
    if (this.uiTreeExpansionListener === tel) {
      this.uiTreeExpansionListener = null;
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the <code>path</code> parameter.
   *
   * @param path the <code>TreePath</code> indicating the node that was
   *          expanded
   * @see EventListenerList
   */
  fireTreeExpanded(path: TreePath): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    if (this.uiTreeExpansionListener != null) {
      e = new TreeExpansionEvent()._TreeExpansionEvent(this, path);
      this.uiTreeExpansionListener.treeExpanded(e);
    }
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeExpansionListener) && (listeners[(i + 1) | 0]) !== this.uiTreeExpansionListener) {
        if (e == null) {
          e = new TreeExpansionEvent()._TreeExpansionEvent(this, path);
        }
        (listeners[(i + 1) | 0]).treeExpanded(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the <code>path</code> parameter.
   *
   * @param path the <code>TreePath</code> indicating the node that was
   *          collapsed
   * @see EventListenerList
   */
  fireTreeCollapsed(path: TreePath): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    if (this.uiTreeExpansionListener != null) {
      e = new TreeExpansionEvent()._TreeExpansionEvent(this, path);
      this.uiTreeExpansionListener.treeCollapsed(e);
    }
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeExpansionListener) && (listeners[(i + 1) | 0]) !== this.uiTreeExpansionListener) {
        if (e == null) {
          e = new TreeExpansionEvent()._TreeExpansionEvent(this, path);
        }
        (listeners[(i + 1) | 0]).treeCollapsed(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the <code>path</code> parameter.
   *
   * @param path the <code>TreePath</code> indicating the node that was
   *          expanded
   * @throws ExpandVetoException if the expansion is prevented from occurring
   * @see EventListenerList
   */
  fireTreeWillExpand(path: TreePath): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeWillExpandListener)) {
        if (e == null) {
          e = new TreeExpansionEvent()._TreeExpansionEvent(this, path);
        }
        (listeners[(i + 1) | 0]).treeWillExpand(e);
      }
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.  The event instance
   * is lazily created using the <code>path</code> parameter.
   *
   * @param path the <code>TreePath</code> indicating the node that was
   *          expanded
   * @throws ExpandVetoException if the collapse is prevented from occurring
   * @see EventListenerList
   */
  fireTreeWillCollapse(path: TreePath): void {
    let listeners = this.listenerList.getListenerList();
    let e = null;
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeWillExpandListener)) {
        if (e == null) {
          e = new TreeExpansionEvent()._TreeExpansionEvent(this, path);
        }
        (listeners[(i + 1) | 0]).treeWillCollapse(e);
      }
    }
  }
  /**
   * Adds a listener for <code>TreeSelection</code> events.
   *
   * @param tsl the <code>TreeSelectionListener</code> that will be notified
   *            when a node is selected or deselected (a "negative
   *            selection")
   */
  addTreeSelectionListener(tsl: TreeSelectionListener): void {
    this.listenerList.add($J.cls(TreeSelectionListener), tsl);
    if (this.listenerList.getListenerCount$Class($J.cls(TreeSelectionListener)) !== 0 && this.selectionRedirector == null) {
      this.selectionRedirector = new JTree$TreeSelectionRedirector().$o(this)._JTree$TreeSelectionRedirector();
      this.selectionModel.addTreeSelectionListener(this.selectionRedirector);
    }
  }
  /**
   * Removes a <code>TreeSelection</code> listener.
   *
   * @param tsl the <code>TreeSelectionListener</code> to remove
   */
  removeTreeSelectionListener(tsl: TreeSelectionListener): void {
    this.listenerList.remove($J.cls(TreeSelectionListener), tsl);
    if (this.listenerList.getListenerCount$Class($J.cls(TreeSelectionListener)) === 0 && this.selectionRedirector != null) {
      this.selectionModel.removeTreeSelectionListener(this.selectionRedirector);
      this.selectionRedirector = null;
    }
  }
  /**
   * Notifies all listeners that have registered interest for
   * notification on this event type.
   *
   * @param e the <code>TreeSelectionEvent</code> to be fired;
   *          generated by the
   *          <code>TreeSelectionModel</code>
   *          when a node is selected or deselected
   * @see EventListenerList
   */
  fireValueChanged(e: TreeSelectionEvent): void {
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(TreeSelectionListener)) {
        (listeners[(i + 1) | 0]).valueChanged(e);
      }
    }
  }
  /**
   * Sent when the tree has changed enough that we need to resize
   * the bounds, but not enough that we need to remove the
   * expanded node set (e.g nodes were expanded or collapsed, or
   * nodes were inserted into the tree). You should never have to
   * invoke this, the UI will invoke this as it needs to.
   */
  treeDidChange(): void {
    this.revalidate();
    this.repaint$();
  }
  /**
   * Returns the number of rows that are displayed in the display area.
   *
   * @return the number of rows displayed
   */
  getVisibleRowCount(): number {
    return this.visibleRowCount;
  }
  /**
   * Returns the TreePath to the next tree element that
   * begins with a prefix. To handle the conversion of a
   * <code>TreePath</code> into a String, <code>convertValueToText</code>
   * is used.
   *
   * @param prefix the string to test for a match
   * @param startingRow the row for starting the search
   * @param bias the search direction, either
   * Position.Bias.Forward or Position.Bias.Backward.
   * @return the TreePath of the next tree element that
   * starts with the prefix; otherwise null
   * @throws IllegalArgumentException if prefix is null
   * or startingRow is out of bounds
   * @since 1.4
   */
  getNextMatch(prefix: string, startingRow: number, bias: Position$Bias): TreePath {
    let max = this.getRowCount();
    if (prefix == null) {
      throw new IllegalArgumentException();
    }
    if (startingRow < 0 || startingRow >= max) {
      throw new IllegalArgumentException();
    }
    prefix = prefix.toUpperCase();
    let increment = (bias === Position$Bias.Forward) ? 1 : -1;
    let row = startingRow;
    do {
      let path = this.getPathForRow(row);
      let text = this.convertValueToText(path.getLastPathComponent(), this.isRowSelected(row), this.isExpanded$int(row), true, row, false);
      if (text.toUpperCase().startsWith(prefix)) {
        return path;
      }
      row = ((row + increment + max) | 0) % max;
    } while (row !== startingRow);
    return null;
  }
  /**
   * Returns the preferred display size of a <code>JTree</code>. The height is
   * determined from <code>getVisibleRowCount</code> and the width
   * is the current preferred width.
   *
   * @return a <code>Dimension</code> object containing the preferred size
   */
  getPreferredScrollableViewportSize(): Dimension {
    let width = this.getPreferredSize$().width_;
    let visRows = this.getVisibleRowCount();
    let height = -1;
    if (this.isFixedRowHeight()) {
      height = Math.imul(visRows, this.getRowHeight());
    } else {
      let ui = this.getUI();
      if (ui != null && visRows > 0) {
        let rc = ui.getRowCount(this);
        if (rc >= visRows) {
          let bounds = this.getRowBounds((visRows - 1) | 0);
          if (bounds != null) {
            height = (bounds.y_ + bounds.height_) | 0;
          }
        } else if (rc > 0) {
          let bounds = this.getRowBounds(0);
          if (bounds != null) {
            height = Math.imul(bounds.height_, visRows);
          }
        }
      }
      if (height === -1) {
        height = Math.imul(16, visRows);
      }
    }
    return new Dimension()._Dimension$int$int(width, height);
  }
  /**
   * Returns the amount to increment when scrolling. The amount is
   * the height of the first displayed row that isn't completely in view
   * or, if it is totally displayed, the height of the next row in the
   * scrolling direction.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation either <code>SwingConstants.VERTICAL</code>
   *          or <code>SwingConstants.HORIZONTAL</code>
   * @param direction less than zero to scroll up/left,
   *          greater than zero for down/right
   * @return the "unit" increment for scrolling in the specified direction
   * @see JScrollBar#setUnitIncrement(int)
   */
  getScrollableUnitIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    if (orientation === SwingConstants.VERTICAL) {
      let rowBounds: Rectangle;
      let firstIndex = this.getClosestRowForLocation(0, visibleRect.y_);
      if (firstIndex !== -1) {
        rowBounds = this.getRowBounds(firstIndex);
        if (rowBounds.y_ !== visibleRect.y_) {
          if (direction < 0) {
            return Math.max(0, ((visibleRect.y_ - rowBounds.y_) | 0));
          }
          return ((rowBounds.y_ + rowBounds.height_ - visibleRect.y_) | 0);
        }
        if (direction < 0) {
          if (firstIndex !== 0) {
            rowBounds = this.getRowBounds((firstIndex - 1) | 0);
            return rowBounds.height_;
          }
        } else {
          return rowBounds.height_;
        }
      }
      return 0;
    }
    return 4;
  }
  /**
   * Returns the amount for a block increment, which is the height or
   * width of <code>visibleRect</code>, based on <code>orientation</code>.
   *
   * @param visibleRect the view area visible within the viewport
   * @param orientation either <code>SwingConstants.VERTICAL</code>
   *          or <code>SwingConstants.HORIZONTAL</code>
   * @param direction less than zero to scroll up/left,
   *          greater than zero for down/right.
   * @return the "block" increment for scrolling in the specified direction
   * @see JScrollBar#setBlockIncrement(int)
   */
  getScrollableBlockIncrement(visibleRect: Rectangle, orientation: number, direction: number): number {
    return (orientation === SwingConstants.VERTICAL) ? visibleRect.height_ : visibleRect.width_;
  }
  /**
   * Returns false to indicate that the width of the viewport does not
   * determine the width of the table, unless the preferred width of
   * the tree is smaller than the viewports width.  In other words:
   * ensure that the tree is never smaller than its viewport.
   *
   * @return whether the tree should track the width of the viewport
   * @see Scrollable#getScrollableTracksViewportWidth
   */
  getScrollableTracksViewportWidth(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      return parent.getWidth() > this.getPreferredSize$().width_;
    }
    return false;
  }
  /**
   * Returns false to indicate that the height of the viewport does not
   * determine the height of the table, unless the preferred height
   * of the tree is smaller than the viewports height.  In other words:
   * ensure that the tree is never smaller than its viewport.
   *
   * @return whether the tree should track the height of the viewport
   * @see Scrollable#getScrollableTracksViewportHeight
   */
  getScrollableTracksViewportHeight(): boolean {
    let parent = SwingUtilities.getUnwrappedParent(this);
    if (parent instanceof JViewport) {
      return parent.getHeight() > this.getPreferredSize$().height_;
    }
    return false;
  }
  /**
   * Sets the expanded state of this <code>JTree</code>.
   * If <code>state</code> is
   * true, all parents of <code>path</code> and path are marked as
   * expanded. If <code>state</code> is false, all parents of
   * <code>path</code> are marked EXPANDED, but <code>path</code> itself
   * is marked collapsed.<p>
   * This will fail if a <code>TreeWillExpandListener</code> vetos it.
   *
   * @param path a {@code TreePath} identifying a node
   * @param state if {@code true}, all parents of {@code path} and path are marked as expanded.
   *              Otherwise, all parents of {@code path} are marked EXPANDED,
   *              but {@code path} itself is marked collapsed.
   */
  setExpandedState(path: TreePath, state: boolean): void {
    if (path != null) {
      let stack: Stack<TreePath>;
      let parentPath = path.getParentPath();
      if (this.expandedStack.size() === 0) {
        stack = new Stack();
      } else {
        stack = this.expandedStack.pop();
      }
      try {
        while (parentPath != null) {
          if (this.isExpanded$TreePath(parentPath)) {
            parentPath = null;
          } else {
            stack.push(parentPath);
            parentPath = parentPath.getParentPath();
          }
        }
        for (let counter = (stack.size() - 1) | 0; counter >= 0; counter--) {
          parentPath = stack.pop();
          if (!this.isExpanded$TreePath(parentPath)) {
            try {
              this.fireTreeWillExpand(parentPath);
            } catch ($e0) {
              if ($J.isa($e0, ExpandVetoException)) {
                let eve = $J.exc($e0);
                return;
              } else {
                throw $e0;
              }
            }
            this.expandedState.put(parentPath, true);
            this.fireTreeExpanded(parentPath);
            if (this.accessibleContext != null) {
              (this.accessibleContext).fireVisibleDataPropertyChange();
            }
          }
        }
      } finally {
        if (this.expandedStack.size() < JTree.TEMP_STACK_SIZE) {
          stack.removeAllElements();
          this.expandedStack.push(stack);
        }
      }
      if (!state) {
        let cValue = this.expandedState.get(path);
        if (cValue != null && cValue) {
          try {
            this.fireTreeWillCollapse(path);
          } catch ($e1) {
            if ($J.isa($e1, ExpandVetoException)) {
              let eve = $J.exc($e1);
              return;
            } else {
              throw $e1;
            }
          }
          this.expandedState.put(path, false);
          this.fireTreeCollapsed(path);
          if (this.removeDescendantSelectedPaths$TreePath$boolean(path, false) && !this.isPathSelected(path)) {
            this.addSelectionPath(path);
          }
          if (this.accessibleContext != null) {
            (this.accessibleContext).fireVisibleDataPropertyChange();
          }
        }
      } else {
        let cValue = this.expandedState.get(path);
        if (cValue == null || !cValue) {
          try {
            this.fireTreeWillExpand(path);
          } catch ($e2) {
            if ($J.isa($e2, ExpandVetoException)) {
              let eve = $J.exc($e2);
              return;
            } else {
              throw $e2;
            }
          }
          this.expandedState.put(path, true);
          this.fireTreeExpanded(path);
          if (this.accessibleContext != null) {
            (this.accessibleContext).fireVisibleDataPropertyChange();
          }
        }
      }
    }
  }
  /**
   * Clears the cache of toggled tree paths. This does NOT send out
   * any <code>TreeExpansionListener</code> events.
   */
  clearToggledPaths(): void {
    this.expandedState.clear();
  }
  /**
   * Creates and returns an instance of <code>TreeModelHandler</code>.
   * The returned
   * object is responsible for updating the expanded state when the
   * <code>TreeModel</code> changes.
   * <p>
   * For more information on what expanded state means, see the
   * {@link JTree JTree description} above.
   *
   * @return the instance of {@code TreeModelHandler}
   */
  createTreeModelListener(): TreeModelListener {
    return new JTree$TreeModelHandler().$o(this)._JTree$TreeModelHandler();
  }
  /**
   * Removes any paths in the selection that are descendants of
   * <code>path</code>. If <code>includePath</code> is true and
   * <code>path</code> is selected, it will be removed from the selection.
   *
   * @param path a path
   * @param includePath is {@code true} and {@code path} is selected,
   *                    it will be removed from the selection.
   * @return true if a descendant was selected
   * @since 1.3
   */
  removeDescendantSelectedPaths$TreePath$boolean(path: TreePath, includePath: boolean): boolean {
    let toRemove = this.getDescendantSelectedPaths(path, includePath);
    if (toRemove != null) {
      this.getSelectionModel().removeSelectionPaths(toRemove);
      return true;
    }
    return false;
  }
  /**
   * Returns an array of paths in the selection that are descendants of
   * <code>path</code>. The returned array may contain <code>null</code>s.
   */
  getDescendantSelectedPaths(path: TreePath, includePath: boolean): TreePath[] {
    let sm = this.getSelectionModel();
    let selPaths = (sm != null) ? sm.getSelectionPaths() : null;
    if (selPaths != null) {
      let shouldRemove = false;
      for (let counter = (selPaths.length - 1) | 0; counter >= 0; counter--) {
        if (selPaths[counter] != null && path.isDescendant(selPaths[counter]) && (!path.equals(selPaths[counter]) || includePath)) {
          shouldRemove = true;
        } else {
          selPaths[counter] = null;
        }
      }
      if (!shouldRemove) {
        selPaths = null;
      }
      return selPaths;
    }
    return null;
  }
  setUIProperty(propertyName: string, value: any): void {
    if (propertyName === 'rowHeight') {
      if (!this.rowHeightSet) {
        this.setRowHeight($J.d2i(+(value)));
        this.rowHeightSet = false;
      }
    } else if (propertyName === 'scrollsOnExpand') {
      if (!this.scrollsOnExpandSet) {
        this.setScrollsOnExpand((value));
        this.scrollsOnExpandSet = false;
      }
    } else if (propertyName === 'showsRootHandles') {
      if (!this.showsRootHandlesSet) {
        this.setShowsRootHandles((value));
        this.showsRootHandlesSet = false;
      }
    } else {
      super.setUIProperty(propertyName, value);
    }
  }
  /**
   * Returns a string representation of this <code>JTree</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this <code>JTree</code>.
   */
  paramString(): string {
    let rootVisibleString = (this.rootVisible ? 'true' : 'false');
    let showsRootHandlesString = (this.showsRootHandles ? 'true' : 'false');
    let editableString = (this.editable ? 'true' : 'false');
    let largeModelString = (this.largeModel ? 'true' : 'false');
    let invokesStopCellEditingString = (this.invokesStopCellEditing ? 'true' : 'false');
    let scrollsOnExpandString = (this.scrollsOnExpand ? 'true' : 'false');
    return super.paramString() + ',editable=' + editableString + ',invokesStopCellEditing=' + invokesStopCellEditingString + ',largeModel=' + largeModelString + ',rootVisible=' + rootVisibleString + ',rowHeight=' + this.rowHeight + ',scrollsOnExpand=' + scrollsOnExpandString + ',showsRootHandles=' + showsRootHandlesString + ',toggleClickCount=' + this.toggleClickCount + ',visibleRowCount=' + this.visibleRowCount;
  }
  /**
   * Gets the AccessibleContext associated with this JTree.
   * For JTrees, the AccessibleContext takes the form of an
   * AccessibleJTree.
   * A new AccessibleJTree instance is created if necessary.
   *
   * @return an AccessibleJTree that serves as the
   *         AccessibleContext of this JTree
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTree$AccessibleJTree().$o(this)._JTree$AccessibleJTree();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    JTree.TEMP_STACK_SIZE = 11;
  }
}

/**
 * A subclass of <code>TransferHandler.DropLocation</code> representing
 * a drop location for a <code>JTree</code>.
 *
 * @see #getDropLocation
 * @since 1.6
 */
export class JTree$DropLocation extends TransferHandler$DropLocation {
  path: TreePath = null;
  index_: number = 0;
  _JTree$DropLocation(p: Point, path: TreePath, index: number): this {
    this._TransferHandler$DropLocation(p);
    this.path = path;
    this.index_ = index;
    return this;
  }
  /**
   * Returns the index where the dropped data should be inserted
   * with respect to the path returned by <code>getPath()</code>.
   * <p>
   * For drop modes <code>DropMode.USE_SELECTION</code> and
   * <code>DropMode.ON</code>, this index is unimportant (and it will
   * always be <code>-1</code>) as the only interesting data is the
   * path over which the drop operation occurred.
   * <p>
   * For drop mode <code>DropMode.INSERT</code>, this index
   * indicates the index at which the data should be inserted into
   * the parent path represented by <code>getPath()</code>.
   * <code>-1</code> indicates that the drop occurred over the
   * parent itself, and in most cases should be treated as inserting
   * into either the beginning or the end of the parent's list of
   * children.
   * <p>
   * For <code>DropMode.ON_OR_INSERT</code>, this value will be
   * an insert index, as described above, or <code>-1</code> if
   * the drop occurred over the path itself.
   *
   * @return the child index
   * @see #getPath
   */
  getChildIndex(): number {
    return this.index_;
  }
  /**
   * Returns the path where dropped data should be placed in the
   * tree.
   * <p>
   * Interpretation of this value depends on the drop mode set on the
   * component. If the drop mode is <code>DropMode.USE_SELECTION</code>
   * or <code>DropMode.ON</code>, the return value is the path in the
   * tree over which the data has been (or will be) dropped.
   * <code>null</code> indicates that the drop is over empty space,
   * not associated with a particular path.
   * <p>
   * If the drop mode is <code>DropMode.INSERT</code>, the return value
   * refers to the path that should become the parent of the new data,
   * in which case <code>getChildIndex()</code> indicates where the
   * new item should be inserted into this parent path. A
   * <code>null</code> path indicates that no parent path has been
   * determined, which can happen for multiple reasons:
   * <ul>
   *    <li>The tree has no model
   *    <li>There is no root in the tree
   *    <li>The root is collapsed
   *    <li>The root is a leaf node
   * </ul>
   * It is up to the developer to decide if and how they wish to handle
   * the <code>null</code> case.
   * <p>
   * If the drop mode is <code>DropMode.ON_OR_INSERT</code>,
   * <code>getChildIndex</code> can be used to determine whether the
   * drop is on top of the path itself (<code>-1</code>) or the index
   * at which it should be inserted into the path (values other than
   * <code>-1</code>).
   *
   * @return the drop path
   * @see #getChildIndex
   */
  getPath(): TreePath {
    return this.path;
  }
  /**
   * Returns a string representation of this drop location.
   * This method is intended to be used for debugging purposes,
   * and the content and format of the returned string may vary
   * between implementations.
   *
   * @return a string representation of this drop location
   */
  toString(): string {
    return $J.getClass(this).getName() + '[dropPoint=' + $J.str(this.getDropPoint()) + ',path=' + $J.str(this.path) + ',childIndex=' + this.index_ + ']';
  }
}

export class JTree$TreeTimer extends Timer {
  _JTree$TreeTimer(): this {
    this._Timer(2000, null);
    this.setRepeats(false);
    return this;
  }
  fireActionPerformed(ae: ActionEvent): void {
    this.$outer.expandRow(this.$outer.expandRow_);
  }
}

/**
 * Handles creating a new <code>TreeSelectionEvent</code> with the
 * <code>JTree</code> as the
 * source and passing it off to all the listeners.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JTree$TreeSelectionRedirector extends JObject {
  /**
   * Constructs a {@code TreeSelectionRedirector}.
   */
  _JTree$TreeSelectionRedirector(): this {
    return this;
  }
  /**
   * Invoked by the <code>TreeSelectionModel</code> when the
   * selection changes.
   *
   * @param e the <code>TreeSelectionEvent</code> generated by the
   *              <code>TreeSelectionModel</code>
   */
  valueChanged(e: TreeSelectionEvent): void {
    let newE: TreeSelectionEvent;
    newE = e.cloneWithSource(this.$outer);
    this.$outer.fireValueChanged(newE);
  }
}

/**
 * Listens to the model and updates the <code>expandedState</code>
 * accordingly when nodes are removed, or changed.
 */
export class JTree$TreeModelHandler extends JObject {
  /**
   * Constructs a {@code TreeModelHandler}.
   */
  _JTree$TreeModelHandler(): this {
    return this;
  }
  treeNodesChanged(e: TreeModelEvent): void {
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTree</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to tree user-interface elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JTree$AccessibleJTree extends JComponent$AccessibleJComponent {
  leadSelectionPath: TreePath = null;
  leadSelectionAccessible: Accessible = null;
  /**
   * Constructs {@code AccessibleJTree}
   */
  _JTree$AccessibleJTree(): this {
    this._JComponent$AccessibleJComponent();
    let model = this.$outer.getModel();
    if (model != null) {
      model.addTreeModelListener(this);
    }
    this.$outer.addTreeExpansionListener(this);
    this.$outer.addTreeSelectionListener(this);
    this.leadSelectionPath = this.$outer.getLeadSelectionPath();
    this.leadSelectionAccessible = (this.leadSelectionPath != null) ? new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, this.leadSelectionPath, this.$outer) : null;
    return this;
  }
  /**
   * Tree Selection Listener value change method. Used to fire the
   * property change
   *
   * @param e ListSelectionEvent
   */
  valueChanged(e: TreeSelectionEvent): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY, false, true);
  }
  /**
   * Fire a visible data property change notification.
   * A 'visible' data property is one that represents
   * something about the way the component appears on the
   * display, where that appearance isn't bound to any other
   * property. It notifies screen readers  that the visual
   * appearance of the component has changed, so they can
   * notify the user.
   */
  fireVisibleDataPropertyChange(): void {
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, false, true);
  }
  /**
   * Tree Model Node change notification.
   *
   * @param e  a Tree Model event
   */
  treeNodesChanged(e: TreeModelEvent): void {
    this.fireVisibleDataPropertyChange();
  }
  /**
   * Tree Collapsed notification.
   *
   * @param e  a TreeExpansionEvent
   */
  treeCollapsed(e: TreeExpansionEvent): void {
    this.fireVisibleDataPropertyChange();
    let path = e.getPath();
    if (path != null) {
      let node = new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, path, null);
      let pce = new PropertyChangeEvent()._PropertyChangeEvent(node, AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.EXPANDED, AccessibleState.COLLAPSED);
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, pce);
    }
  }
  /**
   * Tree Model Expansion notification.
   *
   * @param e  a Tree node insertion event
   */
  treeExpanded(e: TreeExpansionEvent): void {
    this.fireVisibleDataPropertyChange();
    let path = e.getPath();
    if (path != null) {
      let node = new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, path, null);
      let pce = new PropertyChangeEvent()._PropertyChangeEvent(node, AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.COLLAPSED, AccessibleState.EXPANDED);
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, pce);
    }
  }
  /**
   * Fire an active descendant property change notification.
   *  The active descendant is used for objects such as list,
   *  tree, and table, which may have transient children.
   *  It notifies screen readers the active child of the component
   *  has been changed so user can be notified from there.
   *
   * @param oldPath - lead path of previous active child
   * @param newPath - lead path of current active child
   */
  fireActiveDescendantPropertyChange(oldPath: TreePath, newPath: TreePath): void {
    if (oldPath !== newPath) {
      let oldLSA = (oldPath != null) ? new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, oldPath, null) : null;
      let newLSA = (newPath != null) ? new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, newPath, null) : null;
      this.firePropertyChange(AccessibleContext.ACCESSIBLE_ACTIVE_DESCENDANT_PROPERTY, oldLSA, newLSA);
    }
  }
  /**
   * Returns the number of top-level children nodes of this
   * JTree.  Each of these nodes may in turn have children nodes.
   *
   * @return the number of accessible children nodes in the tree.
   */
  getAccessibleChildrenCount(): number {
    let model = this.$outer.getModel();
    if (model == null) {
      return 0;
    }
    if (this.$outer.isRootVisible()) {
      return 1;
    }
    let treeRoot = model.getRoot();
    if (treeRoot == null) {
      return 0;
    }
    return model.getChildCount(treeRoot);
  }
  /**
   * Return the nth Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the nth Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    let model = this.$outer.getModel();
    if (model == null) {
      return null;
    }
    let treeRoot = model.getRoot();
    if (treeRoot == null) {
      return null;
    }
    if (this.$outer.isRootVisible()) {
      if (i === 0) {
        let objPath = [treeRoot];
        let path = new TreePath()._TreePath$ObjectArr(objPath);
        return new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, path, this.$outer);
      } else {
        return null;
      }
    }
    let count = model.getChildCount(treeRoot);
    if (i < 0 || i >= count) {
      return null;
    }
    let obj = model.getChild(treeRoot, i);
    if (obj == null) {
      return null;
    }
    let objPath = [treeRoot, obj];
    let path = new TreePath()._TreePath$ObjectArr(objPath);
    return new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, path, this.$outer);
  }
  /**
   * Get the index of this object in its accessible parent.
   *
   * @return the index of this object in its parent.  Since a JTree
   * top-level object does not have an accessible parent.
   * @see #getAccessibleParent
   */
  getAccessibleIndexInParent(): number {
    return super.getAccessibleIndexInParent();
  }
  /**
   * Get the AccessibleSelection associated with this object.  In the
   * implementation of the Java Accessibility API for this class,
   * return this object, which is responsible for implementing the
   * AccessibleSelection interface on behalf of itself.
   *
   * @return this object
   */
  getAccessibleSelection$(): AccessibleSelection {
    return this;
  }
  /**
   * Returns an Accessible representing the specified selected item
   * in the object.  If there isn't a selection, or there are
   * fewer items selected than the integer passed in, the return
   * value will be null.
   *
   * @param i the zero-based index of selected items
   * @return an Accessible containing the selected item
   */
  getAccessibleSelection$int(i: number): Accessible {
    if (i === 0) {
      let rootPath = $J.newArray(1, null);
      rootPath[0] = this.$outer.treeModel.getRoot();
      if (rootPath[0] == null) {
        return null;
      }
      let childPath = new TreePath()._TreePath$ObjectArr(rootPath);
      if (this.$outer.isPathSelected(childPath)) {
        return new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer, childPath, this.$outer);
      }
    }
    return null;
  }
  /**
   * Returns true if the current child of this object is selected.
   *
   * @param i the zero-based index of the child in this Accessible object.
   * @see AccessibleContext#getAccessibleChild
   */
  isAccessibleChildSelected(i: number): boolean {
    if (i === 0) {
      let rootPath = $J.newArray(1, null);
      rootPath[0] = this.$outer.treeModel.getRoot();
      if (rootPath[0] == null) {
        return false;
      }
      let childPath = new TreePath()._TreePath$ObjectArr(rootPath);
      return this.$outer.isPathSelected(childPath);
    } else {
      return false;
    }
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTree</code> child.  It provides an implementation of the
 * Java Accessibility API appropriate to tree nodes.
 */
export class JTree$AccessibleJTree$AccessibleJTreeNode extends AccessibleContext {
  tree: JTree = null;
  treeModel: TreeModel = null;
  obj: any = null;
  path: TreePath = null;
  accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode: Accessible = null;
  index_: number = 0;
  isLeaf_: boolean = false;
  /**
   * Constructs an AccessibleJTreeNode
   *
   * @param t an instance of {@code JTree}
   * @param p an instance of {@code TreePath}
   * @param ap an instance of {@code Accessible}
   * @since 1.4
   */
  _JTree$AccessibleJTree$AccessibleJTreeNode(t: JTree, p: TreePath, ap: Accessible): this {
    this._AccessibleContext();
    this.tree = null;
    this.treeModel = null;
    this.obj = null;
    this.path = null;
    this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode = null;
    this.index_ = 0;
    this.isLeaf_ = false;
    this.tree = t;
    this.path = p;
    this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode = ap;
    this.treeModel = t.getModel();
    this.obj = p.getLastPathComponent();
    if (this.treeModel != null) {
      this.isLeaf_ = this.treeModel.isLeaf(this.obj);
    }
    return this;
  }
  getChildTreePath(i: number): TreePath {
    if (i < 0 || i >= this.getAccessibleChildrenCount()) {
      return null;
    } else {
      let childObj = this.treeModel.getChild(this.obj, i);
      let objPath = this.path.getPath();
      let objChildPath = $J.newArray((objPath.length + 1) | 0, null);
      $J.system_arraycopy(objPath, 0, objChildPath, 0, objPath.length);
      (objChildPath[(objChildPath.length - 1) | 0]) = childObj;
      return new TreePath()._TreePath$ObjectArr(objChildPath);
    }
  }
  /**
   * Get the AccessibleContext associated with this tree node.
   * In the implementation of the Java Accessibility API for
   * this class, return this object, which is its own
   * AccessibleContext.
   *
   * @return this object
   */
  getAccessibleContext(): AccessibleContext {
    return this;
  }
  getCurrentAccessibleContext(): AccessibleContext {
    let c = this.getCurrentComponent();
    if ($J.isa(c, Accessible)) {
      return c.getAccessibleContext();
    } else {
      return null;
    }
  }
  getCurrentComponent(): Component {
    if (this.tree.isVisible$TreePath(this.path)) {
      let r = this.tree.getCellRenderer();
      if (r == null) {
        return null;
      }
      let ui = this.tree.getUI();
      if (ui != null) {
        let row = ui.getRowForPath(this.$outer.$outer, this.path);
        let selected = this.tree.isPathSelected(this.path);
        let expanded = this.tree.isExpanded$TreePath(this.path);
        let hasFocus = false;
        return r.getTreeCellRendererComponent(this.tree, this.obj, selected, expanded, this.isLeaf_, row, hasFocus);
      }
    }
    return null;
  }
  /**
   * Get the accessible name of this object.
   *
   * @return the localized name of the object; null if this
   * object does not have a name
   */
  getAccessibleName(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      let name = ac.getAccessibleName();
      if ((name != null) && (name !== '')) {
        return ac.getAccessibleName();
      } else {
        return null;
      }
    }
    if ((this.accessibleName != null) && (this.accessibleName !== '')) {
      return this.accessibleName;
    } else {
      return this.$outer.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    }
  }
  /**
   * Set the localized accessible name of this object.
   *
   * @param s the new localized name of the object.
   */
  setAccessibleName(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleName(s);
    } else {
      super.setAccessibleName(s);
    }
  }
  /**
   * Get the accessible description of this object.
   *
   * @return the localized description of the object; null if
   * this object does not have a description
   */
  getAccessibleDescription(): string {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      return ac.getAccessibleDescription();
    } else {
      return super.getAccessibleDescription();
    }
  }
  /**
   * Set the accessible description of this object.
   *
   * @param s the new localized description of the object
   */
  setAccessibleDescription(s: string): void {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null) {
      ac.setAccessibleDescription(s);
    } else {
      super.setAccessibleDescription(s);
    }
  }
  /**
   * Get the Accessible parent of this object.
   *
   * @return the Accessible parent of this object; null if this
   * object does not have an Accessible parent
   */
  getAccessibleParent(): Accessible {
    if (this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode == null) {
      let objPath = this.path.getPath();
      if (objPath.length > 1) {
        let objParent = objPath[(objPath.length - 2) | 0];
        if (this.treeModel != null) {
          this.index_ = this.treeModel.getIndexOfChild(objParent, this.obj);
        }
        let objParentPath = $J.newArray((objPath.length - 1) | 0, null);
        $J.system_arraycopy(objPath, 0, objParentPath, 0, (objPath.length - 1) | 0);
        let parentPath = new TreePath()._TreePath$ObjectArr(objParentPath);
        this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode = new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this.$outer)._JTree$AccessibleJTree$AccessibleJTreeNode(this.tree, parentPath, null);
        this.setAccessibleParent(this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode);
      } else if (this.treeModel != null) {
        this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode = this.tree;
        this.index_ = 0;
        this.setAccessibleParent(this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode);
      }
    }
    return this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode;
  }
  /**
   * Get the index of this object in its accessible parent.
   *
   * @return the index of this object in its parent; -1 if this
   * object does not have an accessible parent.
   * @see #getAccessibleParent
   */
  getAccessibleIndexInParent(): number {
    if (this.accessibleParent$JTree_AccessibleJTree_AccessibleJTreeNode == null) {
      this.getAccessibleParent();
    }
    let objPath = this.path.getPath();
    if (objPath.length > 1) {
      let objParent = objPath[(objPath.length - 2) | 0];
      if (this.treeModel != null) {
        this.index_ = this.treeModel.getIndexOfChild(objParent, this.obj);
      }
    }
    return this.index_;
  }
  /**
   * Returns the number of accessible children in the object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    return this.treeModel.getChildCount(this.obj);
  }
  /**
   * Return the specified Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the Accessible child of the object
   */
  getAccessibleChild(i: number): Accessible {
    if (i < 0 || i >= this.getAccessibleChildrenCount()) {
      return null;
    } else {
      let childObj = this.treeModel.getChild(this.obj, i);
      let objPath = this.path.getPath();
      let objChildPath = $J.newArray((objPath.length + 1) | 0, null);
      $J.system_arraycopy(objPath, 0, objChildPath, 0, objPath.length);
      (objChildPath[(objChildPath.length - 1) | 0]) = childObj;
      let childPath = new TreePath()._TreePath$ObjectArr(objChildPath);
      return new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this.$outer)._JTree$AccessibleJTree$AccessibleJTreeNode(this.$outer.$outer, childPath, this);
    }
  }
  /**
   * Get the AccessibleSelection associated with this object if one
   * exists.  Otherwise return null.
   *
   * @return the AccessibleSelection, or null
   */
  getAccessibleSelection$(): AccessibleSelection {
    let ac = this.getCurrentAccessibleContext();
    if (ac != null && this.isLeaf_) {
      return this.getCurrentAccessibleContext().getAccessibleSelection$();
    } else {
      return this;
    }
  }
  /**
   * Returns an Accessible representing the specified selected item
   * in the object.  If there isn't a selection, or there are
   * fewer items selected than the integer passed in, the return
   * value will be null.
   *
   * @param i the zero-based index of selected items
   * @return an Accessible containing the selected item
   */
  getAccessibleSelection$int(i: number): Accessible {
    let childCount = this.getAccessibleChildrenCount();
    if (i < 0 || i >= childCount) {
      return null;
    }
    let count = 0;
    for (let j = 0; j < childCount && i >= count; j++) {
      let childPath = this.getChildTreePath(j);
      if (this.tree.isPathSelected(childPath)) {
        if (count === i) {
          return new JTree$AccessibleJTree$AccessibleJTreeNode().$o(this.$outer)._JTree$AccessibleJTree$AccessibleJTreeNode(this.tree, childPath, this);
        } else {
          count++;
        }
      }
    }
    return null;
  }
  /**
   * Returns true if the current child of this object is selected.
   *
   * @param i the zero-based index of the child in this Accessible
   * object.
   * @see AccessibleContext#getAccessibleChild
   */
  isAccessibleChildSelected(i: number): boolean {
    let childCount = this.getAccessibleChildrenCount();
    if (i < 0 || i >= childCount) {
      return false;
    } else {
      let childPath = this.getChildTreePath(i);
      return this.tree.isPathSelected(childPath);
    }
  }
  static $clinit() {
    SwingAccessor.setAccessibleComponentAccessor(new JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor()._JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor());
  }
}

export class JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor extends JObject {
  _JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor(): this {
    return this;
  }
}

$J.define(JTree, 'javax.swing.JTree', { kind: 'class', ifaces: ['javax.swing.Scrollable', 'javax.accessibility.Accessible'], sup: 'javax.swing.JComponent', ctors: { 'javax.swing.tree.TreeModel': '_JTree$TreeModel', 'javax.swing.tree.TreeNode,boolean': '_JTree$TreeNode$boolean', 'javax.swing.tree.TreeNode': '_JTree$TreeNode', 'java.util.Hashtable': '_JTree$Hashtable', 'java.util.Vector': '_JTree$Vector', 'java.lang.Object[]': '_JTree$ObjectArr', '': '_JTree$' }, meths: { 'removeDescendantSelectedPaths(javax.swing.event.TreeModelEvent)': 'removeDescendantSelectedPaths$TreeModelEvent', 'removeDescendantSelectedPaths(javax.swing.tree.TreePath,boolean)': 'removeDescendantSelectedPaths$TreePath$boolean', 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JTree', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTree', 'isVisible(javax.swing.tree.TreePath)': 'isVisible$TreePath', 'isCollapsed(int)': 'isCollapsed$int', 'isCollapsed(javax.swing.tree.TreePath)': 'isCollapsed$TreePath', 'isExpanded(int)': 'isExpanded$int', 'isExpanded(javax.swing.tree.TreePath)': 'isExpanded$TreePath', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'setDropLocation(javax.swing.TransferHandler$DropLocation,java.lang.Object,boolean)': 'setDropLocation$DropLocation$Object$boolean', 'dropLocationForPoint(java.awt.Point)': 'dropLocationForPoint$Point', 'setUI(javax.swing.plaf.TreeUI)': 'setUI$TreeUI' }, clinit: true, lazy: ['TEMP_STACK_SIZE'] });
$J.define(JTree$DropLocation, 'javax.swing.JTree$DropLocation', { kind: 'class', sup: 'javax.swing.TransferHandler$DropLocation', ctors: { 'java.awt.Point,javax.swing.tree.TreePath,int': '_JTree$DropLocation' } });
$J.define(JTree$TreeTimer, 'javax.swing.JTree$TreeTimer', { kind: 'class', sup: 'javax.swing.Timer', ctors: { '': '_JTree$TreeTimer' }, inner: true });
$J.define(JTree$TreeSelectionRedirector, 'javax.swing.JTree$TreeSelectionRedirector', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.swing.event.TreeSelectionListener'], sup: 'java.lang.Object', ctors: { '': '_JTree$TreeSelectionRedirector' }, inner: true });
$J.define(JTree$TreeModelHandler, 'javax.swing.JTree$TreeModelHandler', { kind: 'class', ifaces: ['javax.swing.event.TreeModelListener'], sup: 'java.lang.Object', ctors: { '': '_JTree$TreeModelHandler' }, inner: true });
$J.define(JTree$AccessibleJTree, 'javax.swing.JTree$AccessibleJTree', { kind: 'class', ifaces: ['javax.accessibility.AccessibleSelection', 'javax.swing.event.TreeSelectionListener', 'javax.swing.event.TreeModelListener', 'javax.swing.event.TreeExpansionListener'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JTree$AccessibleJTree' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JTree$AccessibleJTree$AccessibleJTreeNode, 'javax.swing.JTree$AccessibleJTree$AccessibleJTreeNode', { kind: 'class', ifaces: ['javax.accessibility.Accessible', 'javax.accessibility.AccessibleComponent', 'javax.accessibility.AccessibleSelection', 'javax.accessibility.AccessibleAction'], sup: 'javax.accessibility.AccessibleContext', ctors: { 'javax.swing.JTree,javax.swing.tree.TreePath,javax.accessibility.Accessible': '_JTree$AccessibleJTree$AccessibleJTreeNode' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, clinit: true, lazy: [], inner: true });
$J.define(JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor, 'javax.swing.JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor', { kind: 'class', ifaces: ['sun.swing.SwingAccessor$AccessibleComponentAccessor'], sup: 'java.lang.Object', ctors: { '': '_JTree$AccessibleJTree$AccessibleJTreeNode$AccessibleJTreeNodeAccessor' } });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  PropertyChangeEvent = $J.load('java.beans.PropertyChangeEvent');
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  DropMode = $J.load('javax.swing.DropMode');
  JViewport = $J.load('javax.swing.JViewport');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  TreeExpansionEvent = $J.load('javax.swing.event.TreeExpansionEvent');
  TreeExpansionListener = $J.load('javax.swing.event.TreeExpansionListener');
  TreeSelectionListener = $J.load('javax.swing.event.TreeSelectionListener');
  TreeWillExpandListener = $J.load('javax.swing.event.TreeWillExpandListener');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  DefaultTreeSelectionModel = $J.load('javax.swing.tree.DefaultTreeSelectionModel');
  ExpandVetoException = $J.load('javax.swing.tree.ExpandVetoException');
  TreePath = $J.load('javax.swing.tree.TreePath');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
  SwingUtilities2$Section = $J.load('sun.swing.SwingUtilities2$Section');
});
