// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTreeUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, ArrayList, Hashtable, InternalError, JObject, JString, NullPointerException, StringBuilder } from '../../../../../jre/index.ts';
import { TreeUI } from '../TreeUI.ts';
import { ComponentAdapter } from '../../../../java/awt/event/ComponentAdapter.ts';
import { AbstractLayoutCache$NodeDimensions } from '../../tree/AbstractLayoutCache.ts';
import { TransferHandler } from '../../TransferHandler.ts';
import { UIAction } from '../../../../sun/swing/UIAction.ts';

let BasicStroke, Component$BaselineResizeBehavior, Dimension, Point, Rectangle, MouseMotionListener, CellRendererPane, JComponent, JScrollPane, JTextField, JTree, JViewport, KeyStroke, LookAndFeel, SwingConstants, SwingUtilities, Timer, UIManager, UIResource, BasicGraphicsUtils, BasicLookAndFeel, BasicTransferable, DragRecognitionSupport, LazyActionMap, Position$Bias, DefaultTreeCellEditor, DefaultTreeCellRenderer, FixedHeightLayoutCache, TreePath, TreeSelectionModel, VariableHeightLayoutCache, AWTAccessor, DefaultLookup, SwingUtilities2;

/**
 * The basic L&amp;F for a hierarchical data structure.
 *
 * @author Scott Violet
 * @author Shannon Hickey (drag and drop)
 */
export class BasicTreeUI extends TreeUI {
  static BASELINE_COMPONENT_KEY: StringBuilder = null;
  static SHARED_ACTION: BasicTreeUI$Actions = null;
  /**
   * The collapsed icon.
   */
  collapsedIcon: Icon = null;
  /**
   * The expanded icon.
   */
  expandedIcon: Icon = null;
  /**
   * Color used to draw hash marks.  If <code>null</code> no hash marks
   * will be drawn.
   */
  hashColor: Color = null;
  /**
   * Distance between left margin and where vertical dashes will be
   * drawn.
   */
  leftChildIndent: number = 0;
  /**
   * Distance to add to leftChildIndent to determine where cell
   * contents will be drawn.
   */
  rightChildIndent: number = 0;
  /**
   * Total distance that will be indented.  The sum of leftChildIndent
   * and rightChildIndent.
   */
  totalChildIndent: number = 0;
  /**
   * Minimum preferred size.
   */
  preferredMinSize: Dimension = null;
  /**
   * Index of the row that was last selected.
   */
  lastSelectedRow: number = 0;
  /**
   * Component that we're going to be drawing into.
   */
  tree: JTree = null;
  /**
   * Renderer that is being used to do the actual cell drawing.
   */
  currentCellRenderer: TreeCellRenderer = null;
  /**
   * Set to true if the renderer that is currently in the tree was
   * created by this instance.
   */
  createdRenderer: boolean = false;
  /**
   * Editor for the tree.
   */
  cellEditor: TreeCellEditor = null;
  /**
   * Set to true if editor that is currently in the tree was
   * created by this instance.
   */
  createdCellEditor: boolean = false;
  /**
   * Set to false when editing and shouldSelectCell() returns true meaning
   * the node should be selected before editing, used in completeEditing.
   */
  stopEditingInCompleteEditing: boolean = false;
  /**
   * Used to paint the TreeCellRenderer.
   */
  rendererPane: CellRendererPane = null;
  /**
   * Size needed to completely display all the nodes.
   */
  preferredSize_: Dimension = null;
  /**
   * Is the preferredSize valid?
   */
  validCachedPreferredSize: boolean = false;
  /**
   * Object responsible for handling sizing and expanded issues.
   */
  treeState: AbstractLayoutCache = null;
  /**
   * Used for minimizing the drawing of vertical lines.
   */
  drawingCache: Hashtable<TreePath, boolean> = null;
  /**
   * True if doing optimizations for a largeModel. Subclasses that
   * don't support this may wish to override createLayoutCache to not
   * return a FixedHeightLayoutCache instance.
   */
  largeModel: boolean = false;
  /**
   * Responsible for telling the TreeState the size needed for a node.
   */
  nodeDimensions: AbstractLayoutCache$NodeDimensions = null;
  /**
   * Used to determine what to display.
   */
  treeModel: TreeModel = null;
  /**
   * Model maintaining the selection.
   */
  treeSelectionModel: TreeSelectionModel = null;
  /**
   * How much the depth should be offset to properly calculate
   * x locations. This is based on whether or not the root is visible,
   * and if the root handles are visible.
   */
  depthOffset: number = 0;
  /**
   * When editing, this will be the Component that is doing the actual
   * editing.
   */
  editingComponent: Component = null;
  /**
   * Path that is being edited.
   */
  editingPath: TreePath = null;
  /**
   * Row that is being edited. Should only be referenced if
   * editingComponent is not null.
   */
  editingRow: number = 0;
  /**
   * Set to true if the editor has a different size than the renderer.
   */
  editorHasDifferentSize: boolean = false;
  /**
   * Row correspondin to lead path.
   */
  leadRow: number = 0;
  /**
   * If true, the property change event for LEAD_SELECTION_PATH_PROPERTY,
   * or ANCHOR_SELECTION_PATH_PROPERTY will not generate a repaint.
   */
  ignoreLAChange: boolean = false;
  /**
   * Indicates the orientation.
   */
  leftToRight_: boolean = false;
  propertyChangeListener: PropertyChangeListener = null;
  selectionModelPropertyChangeListener: PropertyChangeListener = null;
  mouseListener: MouseListener = null;
  focusListener: FocusListener = null;
  keyListener: KeyListener = null;
  /**
   * Used for large models, listens for moved/resized events and
   * updates the validCachedPreferredSize bit accordingly.
   */
  componentListener: ComponentListener = null;
  /**
   * Listens for CellEditor events.
   */
  cellEditorListener: CellEditorListener = null;
  /**
   * Updates the display when the selection changes.
   */
  treeSelectionListener: TreeSelectionListener = null;
  /**
   * Is responsible for updating the display based on model events.
   */
  treeModelListener: TreeModelListener = null;
  /**
   * Updates the treestate as the nodes expand.
   */
  treeExpansionListener: TreeExpansionListener = null;
  /**
   * UI property indicating whether to paint lines
   */
  paintLines: boolean = false;
  /**
   * UI property for painting dashed lines
   */
  lineTypeDashed: boolean = false;
  /**
   * The time factor to treat the series of typed alphanumeric key
   * as prefix for first letter navigation.
   */
  timeFactor: number = 0;
  handler: BasicTreeUI$Handler = null;
  /**
   * A temporary variable for communication between startEditingOnRelease
   * and startEditing.
   */
  releaseEvent: MouseEvent = null;
  static defaultTransferHandler: TransferHandler = null;
  /**
   * Constructs a new instance of {@code BasicTreeUI}.
   */
  _BasicTreeUI(): this {
    this._TreeUI();
    this.paintLines = true;
    this.timeFactor = 1000;
    return this;
  }
  /**
   * Constructs a new instance of {@code BasicTreeUI}.
   *
   * @param x a component
   * @return a new instance of {@code BasicTreeUI}
   */
  static createUI(x: JComponent): ComponentUI {
    return new BasicTreeUI()._BasicTreeUI();
  }
  static loadActionMap(map: LazyActionMap): void {
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_PREVIOUS));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_PREVIOUS_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_PREVIOUS_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_NEXT));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_NEXT_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_NEXT_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_CHILD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_CHILD_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_PARENT));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_PARENT_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_UP_CHANGE_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_UP_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_UP_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_DOWN_CHANGE_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_DOWN_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_DOWN_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_FIRST));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_FIRST_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_FIRST_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_LAST));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_LAST_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_LAST_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.TOGGLE));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.CANCEL_EDITING));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.START_EDITING));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SELECT_ALL));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.CLEAR_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_LEFT));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_RIGHT));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_LEFT_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_RIGHT_EXTEND_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_RIGHT_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.SCROLL_LEFT_CHANGE_LEAD));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.EXPAND));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.COLLAPSE));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.MOVE_SELECTION_TO_PARENT));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.ADD_TO_SELECTION));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.TOGGLE_AND_ANCHOR));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.EXTEND_TO));
    map.put$Action(new BasicTreeUI$Actions()._BasicTreeUI$Actions$String(BasicTreeUI$Actions.MOVE_SELECTION_TO));
    map.put$Action(TransferHandler.getCutAction());
    map.put$Action(TransferHandler.getCopyAction());
    map.put$Action(TransferHandler.getPasteAction());
  }
  /**
   * Returns the hash color.
   *
   * @return the hash color
   */
  getHashColor(): Color {
    return this.hashColor;
  }
  /**
   * Sets the hash color.
   *
   * @param color the hash color
   */
  setHashColor(color: Color): void {
    this.hashColor = color;
  }
  /**
   * Sets the left child indent.
   *
   * @param newAmount the left child indent
   */
  setLeftChildIndent(newAmount: number): void {
    this.leftChildIndent = newAmount;
    this.totalChildIndent = (this.leftChildIndent + this.rightChildIndent) | 0;
    if (this.treeState != null) {
      this.treeState.invalidateSizes();
    }
    this.updateSize();
  }
  /**
   * Sets the right child indent.
   *
   * @param newAmount the right child indent
   */
  setRightChildIndent(newAmount: number): void {
    this.rightChildIndent = newAmount;
    this.totalChildIndent = (this.leftChildIndent + this.rightChildIndent) | 0;
    if (this.treeState != null) {
      this.treeState.invalidateSizes();
    }
    this.updateSize();
  }
  /**
   * Returns the right child indent.
   *
   * @return the right child indent
   */
  getRightChildIndent(): number {
    return this.rightChildIndent;
  }
  /**
   * Sets the expanded icon.
   *
   * @param newG the expanded icon
   */
  setExpandedIcon(newG: Icon): void {
    this.expandedIcon = newG;
  }
  /**
   * Returns the expanded icon.
   *
   * @return the expanded icon
   */
  getExpandedIcon(): Icon {
    return this.expandedIcon;
  }
  /**
   * Sets the collapsed icon.
   *
   * @param newG the collapsed icon
   */
  setCollapsedIcon(newG: Icon): void {
    this.collapsedIcon = newG;
  }
  /**
   * Returns the collapsed icon.
   *
   * @return the collapsed icon
   */
  getCollapsedIcon(): Icon {
    return this.collapsedIcon;
  }
  /**
   * Sets the {@code largeModel}.
   *
   * Called when the {@code largeModel} property is changed in the drawn tree
   * component.
   *
   * @param largeModel the new value of the {@code largeModel} property
   */
  setLargeModel(largeModel: boolean): void {
    if (this.getRowHeight() < 1) {
      largeModel = false;
    }
    if (this.largeModel !== largeModel) {
      this.completeEditing$();
      this.largeModel = largeModel;
      this.treeState = this.createLayoutCache();
      this.configureLayoutCache();
      this.updateLayoutCacheExpandedNodesIfNecessary();
      this.updateSize();
    }
  }
  /**
   * Returns {@code true} if large model is set.
   *
   * @return {@code true} if large model is set
   */
  isLargeModel(): boolean {
    return this.largeModel;
  }
  /**
   * Sets the row height, this is forwarded to the treeState.
   *
   * Called when the {@code rowHeight} property is changed in
   * the drawn tree component.
   *
   * @param rowHeight the new value of the {@code rowHeight} property
   */
  setRowHeight(rowHeight: number): void {
    this.completeEditing$();
    if (this.treeState != null) {
      this.setLargeModel(this.tree.isLargeModel());
      this.treeState.setRowHeight(rowHeight);
      this.updateSize();
    }
  }
  /**
   * Returns the height of each row in the drawn tree component. If the
   * returned value is less than or equal to 0 the height for each row is
   * determined by the renderer.
   *
   * @return the height of each row, in pixels
   */
  getRowHeight(): number {
    return (this.tree == null) ? -1 : this.tree.getRowHeight();
  }
  /**
   * Sets the {@code TreeCellRenderer} to {@code tcr}. This invokes
   * {@code updateRenderer}.
   *
   * Called when the {@code cellRenderer} property is changed in
   * the drawn tree component.
   *
   * @param tcr the new value of the {@code cellRenderer} property
   */
  setCellRenderer(tcr: TreeCellRenderer): void {
    this.completeEditing$();
    this.updateRenderer();
    if (this.treeState != null) {
      this.treeState.invalidateSizes();
      this.updateSize();
    }
  }
  /**
   * Sets the {@code TreeModel}.
   *
   * @param model the new value
   */
  setModel(model: TreeModel): void {
    this.completeEditing$();
    if (this.treeModel != null && this.treeModelListener != null) {
      this.treeModel.removeTreeModelListener(this.treeModelListener);
    }
    this.treeModel = model;
    if (this.treeModel != null) {
      if (this.treeModelListener != null) {
        this.treeModel.addTreeModelListener(this.treeModelListener);
      }
    }
    if (this.treeState != null) {
      this.treeState.setModel(model);
      this.updateLayoutCacheExpandedNodesIfNecessary();
      this.updateSize();
    }
  }
  /**
   * Returns the tree model.
   *
   * @return the tree model
   */
  getModel(): TreeModel {
    return this.treeModel;
  }
  /**
   * Sets the root to being visible.
   *
   * Called when the {@code rootVisible} property is changed in the drawn tree
   * component.
   *
   * @param newValue the new value of the {@code rootVisible} property
   */
  setRootVisible(newValue: boolean): void {
    this.completeEditing$();
    this.updateDepthOffset();
    if (this.treeState != null) {
      this.treeState.setRootVisible(newValue);
      this.treeState.invalidateSizes();
      this.updateSize();
    }
  }
  /**
   * Returns whether the root node of the drawn tree component should be displayed.
   *
   * @return {@code true} if the root node of the tree is displayed
   */
  isRootVisible(): boolean {
    return (this.tree != null) ? this.tree.isRootVisible() : false;
  }
  /**
   * Determines whether the node handles are to be displayed.
   *
   * Called when the {@code showsRootHandles} property is changed in the drawn
   * tree component.
   *
   * @param newValue the new value of the {@code showsRootHandles} property
   */
  setShowsRootHandles(newValue: boolean): void {
    this.completeEditing$();
    this.updateDepthOffset();
    if (this.treeState != null) {
      this.treeState.invalidateSizes();
      this.updateSize();
    }
  }
  /**
   * Returns {@code true} if the root handles are to be displayed.
   *
   * @return {@code true} if the root handles are to be displayed
   */
  getShowsRootHandles(): boolean {
    return (this.tree != null) ? this.tree.getShowsRootHandles() : false;
  }
  /**
   * Sets the cell editor.
   *
   * Called when the {@code cellEditor} property is changed in the drawn tree
   * component.
   *
   * @param editor the new value of the {@code cellEditor} property
   */
  setCellEditor(editor: TreeCellEditor): void {
    this.updateCellEditor();
  }
  /**
   * Configures the receiver to allow, or not allow, editing.
   *
   * Called when the {@code editable} property is changed in the drawn tree
   * component.
   *
   * @param newValue the new value of the {@code editable} property
   */
  setEditable(newValue: boolean): void {
    this.updateCellEditor();
  }
  /**
   * Resets the selection model. The appropriate listener are installed
   * on the model.
   *
   * Called when the {@code selectionModel} property is changed in the drawn tree
   * component.
   *
   * @param newLSM the new value of the {@code selectionModel} property
   */
  setSelectionModel(newLSM: TreeSelectionModel): void {
    this.completeEditing$();
    if (this.selectionModelPropertyChangeListener != null && this.treeSelectionModel != null) {
      this.treeSelectionModel.removePropertyChangeListener(this.selectionModelPropertyChangeListener);
    }
    if (this.treeSelectionListener != null && this.treeSelectionModel != null) {
      this.treeSelectionModel.removeTreeSelectionListener(this.treeSelectionListener);
    }
    this.treeSelectionModel = newLSM;
    if (this.treeSelectionModel != null) {
      if (this.selectionModelPropertyChangeListener != null) {
        this.treeSelectionModel.addPropertyChangeListener(this.selectionModelPropertyChangeListener);
      }
      if (this.treeSelectionListener != null) {
        this.treeSelectionModel.addTreeSelectionListener(this.treeSelectionListener);
      }
      if (this.treeState != null) {
        this.treeState.setSelectionModel(this.treeSelectionModel);
      }
    } else if (this.treeState != null) {
      this.treeState.setSelectionModel(null);
    }
    if (this.tree != null) {
      this.tree.repaint$();
    }
  }
  /**
   * Returns the current instance of the {@link TreeSelectionModel} which is
   * the model for selections.
   *
   * @return the {@link TreeSelectionModel} instance
   */
  getSelectionModel(): TreeSelectionModel {
    return this.treeSelectionModel;
  }
  /**
   * Returns the Rectangle enclosing the label portion that the
   * last item in path will be drawn into.  Will return null if
   * any component in path is currently invalid.
   */
  getPathBounds$JTree$TreePath(tree: JTree, path: TreePath): Rectangle {
    if (tree != null && this.treeState != null) {
      return this.getPathBounds$TreePath$Insets$Rectangle$BasicTreeUI(path, tree.getInsets$(), new Rectangle()._Rectangle$());
    }
    return null;
  }
  getPathBounds$TreePath$Insets$Rectangle$BasicTreeUI(path: TreePath, insets: Insets, bounds: Rectangle): Rectangle {
    bounds = this.treeState.getBounds$TreePath$Rectangle(path, bounds);
    if (bounds != null) {
      if (this.leftToRight_) {
        bounds.x_ = (bounds.x_ + insets.left) | 0;
      } else {
        bounds.x_ = (this.tree.getWidth() - (bounds.x_ + bounds.width_) - insets.right) | 0;
      }
      bounds.y_ = (bounds.y_ + insets.top) | 0;
    }
    return bounds;
  }
  /**
   * Returns the path for passed in row.  If row is not visible
   * null is returned.
   */
  getPathForRow(tree: JTree, row: number): TreePath {
    return (this.treeState != null) ? this.treeState.getPathForRow(row) : null;
  }
  /**
   * Returns the row that the last item identified in path is visible
   * at.  Will return -1 if any of the elements in path are not
   * currently visible.
   */
  getRowForPath(tree: JTree, path: TreePath): number {
    return (this.treeState != null) ? this.treeState.getRowForPath(path) : -1;
  }
  /**
   * Returns the number of rows that are being displayed.
   */
  getRowCount(tree: JTree): number {
    return (this.treeState != null) ? this.treeState.getRowCount() : 0;
  }
  /**
   * Returns the path to the node that is closest to x,y.  If
   * there is nothing currently visible this will return null, otherwise
   * it'll always return a valid path.  If you need to test if the
   * returned object is exactly at x, y you should get the bounds for
   * the returned path and test x, y against that.
   */
  getClosestPathForLocation(tree: JTree, x: number, y: number): TreePath {
    if (tree != null && this.treeState != null) {
      y = (y - tree.getInsets$().top) | 0;
      return this.treeState.getPathClosestTo(x, y);
    }
    return null;
  }
  /**
   * Returns true if the tree is being edited.  The item that is being
   * edited can be returned by getEditingPath().
   */
  isEditing(tree: JTree): boolean {
    return (this.editingComponent != null);
  }
  /**
   * Stops the current editing session.  This has no effect if the
   * tree isn't being edited.  Returns true if the editor allows the
   * editing session to stop.
   */
  stopEditing(tree: JTree): boolean {
    if (this.editingComponent != null && this.cellEditor.stopCellEditing()) {
      this.completeEditing$boolean$boolean$boolean(false, false, true);
      return true;
    }
    return false;
  }
  /**
   * Cancels the current editing session.
   */
  cancelEditing(tree: JTree): void {
    if (this.editingComponent != null) {
      this.completeEditing$boolean$boolean$boolean(false, true, false);
    }
  }
  /**
   * Selects the last item in path and tries to edit it.  Editing will
   * fail if the CellEditor won't allow it for the selected item.
   */
  startEditingAtPath(tree: JTree, path: TreePath): void {
    tree.scrollPathToVisible(path);
    if (path != null && tree.isVisible$TreePath(path)) {
      this.startEditing(path, null);
    }
  }
  installUI(c: JComponent): void {
    if (c == null) {
      throw new NullPointerException('null component passed to BasicTreeUI.installUI()');
    }
    this.tree = c;
    this.prepareForUIInstall();
    this.installDefaults();
    this.installKeyboardActions();
    this.installComponents();
    this.installListeners();
    this.completeUIInstall();
  }
  /**
   * Invoked after the {@code tree} instance variable has been
   * set, but before any defaults/listeners have been installed.
   */
  prepareForUIInstall(): void {
    this.drawingCache = new Hashtable(7);
    this.leftToRight_ = BasicGraphicsUtils.isLeftToRight(this.tree);
    this.stopEditingInCompleteEditing = true;
    this.lastSelectedRow = -1;
    this.leadRow = -1;
    this.preferredSize_ = new Dimension()._Dimension$();
    this.largeModel = this.tree.isLargeModel();
    if (this.getRowHeight() <= 0) {
      this.largeModel = false;
    }
    this.setModel(this.tree.getModel());
  }
  /**
   * Invoked from installUI after all the defaults/listeners have been
   * installed.
   */
  completeUIInstall(): void {
    this.setShowsRootHandles(this.tree.getShowsRootHandles());
    this.updateRenderer();
    this.updateDepthOffset();
    this.setSelectionModel(this.tree.getSelectionModel());
    this.treeState = this.createLayoutCache();
    this.configureLayoutCache();
    this.updateSize();
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    if (this.tree.getBackground() == null || $J.isa(this.tree.getBackground(), UIResource)) {
      this.tree.setBackground(UIManager.getColor$Object('Tree.background'));
    }
    if (this.getHashColor() == null || $J.isa(this.getHashColor(), UIResource)) {
      this.setHashColor(UIManager.getColor$Object('Tree.hash'));
    }
    if (this.tree.getFont() == null || $J.isa(this.tree.getFont(), UIResource)) {
      this.tree.setFont(UIManager.getFont$Object('Tree.font'));
    }
    this.setExpandedIcon(UIManager.get$Object('Tree.expandedIcon'));
    this.setCollapsedIcon(UIManager.get$Object('Tree.collapsedIcon'));
    this.setLeftChildIndent((+(UIManager.get$Object('Tree.leftChildIndent'))));
    this.setRightChildIndent((+(UIManager.get$Object('Tree.rightChildIndent'))));
    LookAndFeel.installProperty(this.tree, 'rowHeight', UIManager.get$Object('Tree.rowHeight'));
    this.largeModel = (this.tree.isLargeModel() && this.tree.getRowHeight() > 0);
    let scrollsOnExpand = UIManager.get$Object('Tree.scrollsOnExpand');
    if (scrollsOnExpand != null) {
      LookAndFeel.installProperty(this.tree, 'scrollsOnExpand', scrollsOnExpand);
    }
    this.paintLines = UIManager.getBoolean$Object('Tree.paintLines');
    this.lineTypeDashed = UIManager.getBoolean$Object('Tree.lineTypeDashed');
    let l = UIManager.get$Object('Tree.timeFactor');
    this.timeFactor = (l != null) ? (+l) : 1000;
    let showsRootHandles = UIManager.get$Object('Tree.showsRootHandles');
    if (showsRootHandles != null) {
      LookAndFeel.installProperty(this.tree, JTree.SHOWS_ROOT_HANDLES_PROPERTY, showsRootHandles);
    }
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    if ((this.propertyChangeListener = this.createPropertyChangeListener()) != null) {
      this.tree.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if ((this.mouseListener = this.createMouseListener()) != null) {
      this.tree.addMouseListener(this.mouseListener);
      if ($J.isa(this.mouseListener, MouseMotionListener)) {
        this.tree.addMouseMotionListener(this.mouseListener);
      }
    }
    if ((this.focusListener = this.createFocusListener()) != null) {
      this.tree.addFocusListener(this.focusListener);
    }
    if ((this.keyListener = this.createKeyListener()) != null) {
      this.tree.addKeyListener(this.keyListener);
    }
    if ((this.treeExpansionListener = this.createTreeExpansionListener()) != null) {
      this.tree.addTreeExpansionListener(this.treeExpansionListener);
    }
    if ((this.treeModelListener = this.createTreeModelListener()) != null && this.treeModel != null) {
      this.treeModel.addTreeModelListener(this.treeModelListener);
    }
    if ((this.selectionModelPropertyChangeListener = this.createSelectionModelPropertyChangeListener()) != null && this.treeSelectionModel != null) {
      this.treeSelectionModel.addPropertyChangeListener(this.selectionModelPropertyChangeListener);
    }
    if ((this.treeSelectionListener = this.createTreeSelectionListener()) != null && this.treeSelectionModel != null) {
      this.treeSelectionModel.addTreeSelectionListener(this.treeSelectionListener);
    }
    let th = this.tree.getTransferHandler();
    if (th == null || $J.isa(th, UIResource)) {
      this.tree.setTransferHandler(BasicTreeUI.defaultTransferHandler);
      if ($J.isa(this.tree.getDropTarget(), UIResource)) {
        this.tree.setDropTarget(null);
      }
    }
    LookAndFeel.installProperty(this.tree, 'opaque', true);
  }
  /**
   * Registers keyboard actions.
   */
  installKeyboardActions(): void {
    let km = this.getInputMap(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    SwingUtilities.replaceUIInputMap(this.tree, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, km);
    km = this.getInputMap(JComponent.WHEN_FOCUSED);
    SwingUtilities.replaceUIInputMap(this.tree, JComponent.WHEN_FOCUSED, km);
    LazyActionMap.installLazyActionMap(this.tree, $J.cls(BasicTreeUI), 'Tree.actionMap');
  }
  getInputMap(condition: number): InputMap {
    if (condition === JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT) {
      return DefaultLookup.get(this.tree, this, 'Tree.ancestorInputMap');
    } else if (condition === JComponent.WHEN_FOCUSED) {
      let keyMap = DefaultLookup.get(this.tree, this, 'Tree.focusInputMap');
      let rtlKeyMap: InputMap;
      if (this.tree.getComponentOrientation().isLeftToRight() || ((rtlKeyMap = DefaultLookup.get(this.tree, this, 'Tree.focusInputMap.RightToLeft')) == null)) {
        return keyMap;
      } else {
        rtlKeyMap.setParent(keyMap);
        return rtlKeyMap;
      }
    }
    return null;
  }
  /**
   * Intalls the subcomponents of the tree, which is the renderer pane.
   */
  installComponents(): void {
    if ((this.rendererPane = this.createCellRendererPane()) != null) {
      this.tree.add$Component(this.rendererPane);
    }
  }
  /**
   * Creates an instance of {@code NodeDimensions} that is able to determine
   * the size of a given node in the tree.
   *
   * @return an instance of {@code NodeDimensions}
   */
  createNodeDimensions(): AbstractLayoutCache$NodeDimensions {
    return new BasicTreeUI$NodeDimensionsHandler().$o(this)._BasicTreeUI$NodeDimensionsHandler();
  }
  /**
   * Creates a listener that is responsible that updates the UI based on
   * how the tree changes.
   *
   * @return an instance of the {@code PropertyChangeListener}
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  getHandler(): BasicTreeUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicTreeUI$Handler().$o(this)._BasicTreeUI$Handler();
    }
    return this.handler;
  }
  /**
   * Creates the listener responsible for updating the selection based on
   * mouse events.
   *
   * @return an instance of the {@code MouseListener}
   */
  createMouseListener(): MouseListener {
    return this.getHandler();
  }
  /**
   * Creates a listener that is responsible for updating the display
   * when focus is lost/gained.
   *
   * @return an instance of the {@code FocusListener}
   */
  createFocusListener(): FocusListener {
    return this.getHandler();
  }
  /**
   * Creates the listener responsible for getting key events from
   * the tree.
   *
   * @return an instance of the {@code KeyListener}
   */
  createKeyListener(): KeyListener {
    return this.getHandler();
  }
  /**
   * Creates the listener responsible for getting property change
   * events from the selection model.
   *
   * @return an instance of the {@code PropertyChangeListener}
   */
  createSelectionModelPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Creates the listener that updates the display based on selection change
   * methods.
   *
   * @return an instance of the {@code TreeSelectionListener}
   */
  createTreeSelectionListener(): TreeSelectionListener {
    return this.getHandler();
  }
  /**
   * Creates a listener to handle events from the current editor.
   *
   * @return an instance of the {@code CellEditorListener}
   */
  createCellEditorListener(): CellEditorListener {
    return this.getHandler();
  }
  /**
   * Creates and returns a new ComponentHandler. This is used for
   * the large model to mark the validCachedPreferredSize as invalid
   * when the component moves.
   *
   * @return an instance of the {@code ComponentListener}
   */
  createComponentListener(): ComponentListener {
    return new BasicTreeUI$ComponentHandler().$o(this)._BasicTreeUI$ComponentHandler();
  }
  /**
   * Creates and returns the object responsible for updating the treestate
   * when nodes expanded state changes.
   *
   * @return an instance of the {@code TreeExpansionListener}
   */
  createTreeExpansionListener(): TreeExpansionListener {
    return this.getHandler();
  }
  /**
   * Creates the object responsible for managing what is expanded, as
   * well as the size of nodes.
   *
   * @return the object responsible for managing what is expanded
   */
  createLayoutCache(): AbstractLayoutCache {
    if (this.isLargeModel() && this.getRowHeight() > 0) {
      return new FixedHeightLayoutCache()._FixedHeightLayoutCache();
    }
    return new VariableHeightLayoutCache()._VariableHeightLayoutCache();
  }
  /**
   * Returns the renderer pane that renderer components are placed in.
   *
   * @return an instance of the {@code CellRendererPane}
   */
  createCellRendererPane(): CellRendererPane {
    return new CellRendererPane()._CellRendererPane();
  }
  /**
   * Creates a default cell editor.
   *
   * @return a default cell editor
   */
  createDefaultCellEditor(): TreeCellEditor {
    var defaultRenderer;
    if ((defaultRenderer = this.currentCellRenderer) instanceof DefaultTreeCellRenderer) {
      let editor = new DefaultTreeCellEditor()._DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer(this.tree, defaultRenderer);
      return editor;
    }
    return new DefaultTreeCellEditor()._DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer(this.tree, null);
  }
  /**
   * Returns the default cell renderer that is used to do the
   * stamping of each node.
   *
   * @return an instance of {@code TreeCellRenderer}
   */
  createDefaultCellRenderer(): TreeCellRenderer {
    return new DefaultTreeCellRenderer()._DefaultTreeCellRenderer();
  }
  /**
   * Returns a listener that can update the tree when the model changes.
   *
   * @return an instance of the {@code TreeModelListener}.
   */
  createTreeModelListener(): TreeModelListener {
    return this.getHandler();
  }
  uninstallUI(c: JComponent): void {
    this.completeEditing$();
    this.prepareForUIUninstall();
    this.uninstallDefaults();
    this.uninstallListeners();
    this.uninstallKeyboardActions();
    this.uninstallComponents();
    this.completeUIUninstall();
  }
  /**
   * Invoked before uninstallation of UI.
   */
  prepareForUIUninstall(): void {
  }
  /**
   * Uninstalls UI.
   */
  completeUIUninstall(): void {
    if (this.createdRenderer) {
      this.tree.setCellRenderer(null);
    }
    if (this.createdCellEditor) {
      this.tree.setCellEditor(null);
    }
    this.cellEditor = null;
    this.currentCellRenderer = null;
    this.rendererPane = null;
    this.componentListener = null;
    this.propertyChangeListener = null;
    this.mouseListener = null;
    this.focusListener = null;
    this.keyListener = null;
    this.setSelectionModel(null);
    this.treeState = null;
    this.drawingCache = null;
    this.selectionModelPropertyChangeListener = null;
    this.tree = null;
    this.treeModel = null;
    this.treeSelectionModel = null;
    this.treeSelectionListener = null;
    this.treeExpansionListener = null;
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    if ($J.isa(this.tree.getTransferHandler(), UIResource)) {
      this.tree.setTransferHandler(null);
    }
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    if (this.componentListener != null) {
      this.tree.removeComponentListener(this.componentListener);
    }
    if (this.propertyChangeListener != null) {
      this.tree.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
    if (this.mouseListener != null) {
      this.tree.removeMouseListener(this.mouseListener);
      if ($J.isa(this.mouseListener, MouseMotionListener)) {
        this.tree.removeMouseMotionListener(this.mouseListener);
      }
    }
    if (this.focusListener != null) {
      this.tree.removeFocusListener(this.focusListener);
    }
    if (this.keyListener != null) {
      this.tree.removeKeyListener(this.keyListener);
    }
    if (this.treeExpansionListener != null) {
      this.tree.removeTreeExpansionListener(this.treeExpansionListener);
    }
    if (this.treeModel != null && this.treeModelListener != null) {
      this.treeModel.removeTreeModelListener(this.treeModelListener);
    }
    if (this.selectionModelPropertyChangeListener != null && this.treeSelectionModel != null) {
      this.treeSelectionModel.removePropertyChangeListener(this.selectionModelPropertyChangeListener);
    }
    if (this.treeSelectionListener != null && this.treeSelectionModel != null) {
      this.treeSelectionModel.removeTreeSelectionListener(this.treeSelectionListener);
    }
    this.handler = null;
  }
  /**
   * Unregisters keyboard actions.
   */
  uninstallKeyboardActions(): void {
    SwingUtilities.replaceUIActionMap(this.tree, null);
    SwingUtilities.replaceUIInputMap(this.tree, JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT, null);
    SwingUtilities.replaceUIInputMap(this.tree, JComponent.WHEN_FOCUSED, null);
  }
  /**
   * Uninstalls the renderer pane.
   */
  uninstallComponents(): void {
    if (this.rendererPane != null) {
      this.tree.remove$Component(this.rendererPane);
    }
  }
  /**
   * Recomputes the right margin, and invalidates any tree states
   */
  redoTheLayout(): void {
    if (this.treeState != null) {
      this.treeState.invalidateSizes();
    }
  }
  /**
   * Returns the baseline.
   *
   * @throws NullPointerException {@inheritDoc}
   * @throws IllegalArgumentException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaseline$JComponent$int$int(c: JComponent, width: number, height: number): number {
    super.getBaseline$JComponent$int$int(c, width, height);
    let lafDefaults = UIManager.getLookAndFeelDefaults();
    let renderer = lafDefaults.get(BasicTreeUI.BASELINE_COMPONENT_KEY);
    if (renderer == null) {
      let tcr = this.createDefaultCellRenderer();
      renderer = tcr.getTreeCellRendererComponent(this.tree, 'a', false, false, false, -1, false);
      lafDefaults.put(BasicTreeUI.BASELINE_COMPONENT_KEY, renderer);
    }
    let rowHeight = this.tree.getRowHeight();
    let baseline: number;
    if (rowHeight > 0) {
      baseline = renderer.getBaseline(2147483647, rowHeight);
    } else {
      let pref = renderer.getPreferredSize$();
      baseline = renderer.getBaseline(pref.width_, pref.height_);
    }
    return (baseline + this.tree.getInsets$().top) | 0;
  }
  /**
   * Returns an enum indicating how the baseline of the component
   * changes as the size changes.
   *
   * @throws NullPointerException {@inheritDoc}
   * @see javax.swing.JComponent#getBaseline(int, int)
   * @since 1.6
   */
  getBaselineResizeBehavior(c: JComponent): Component$BaselineResizeBehavior {
    super.getBaselineResizeBehavior(c);
    return Component$BaselineResizeBehavior.CONSTANT_ASCENT;
  }
  paint(g: Graphics, c: JComponent): void {
    if (this.tree !== c) {
      throw new InternalError('incorrect component');
    }
    if (this.treeState == null) {
      return;
    }
    let paintBounds = g.getClipBounds$();
    let insets = this.tree.getInsets$();
    let initialPath = this.getClosestPathForLocation(this.tree, 0, paintBounds.y_);
    let paintingEnumerator = this.treeState.getVisiblePathsFrom(initialPath);
    let row = this.treeState.getRowForPath(initialPath);
    let endY = (paintBounds.y_ + paintBounds.height_) | 0;
    this.drawingCache.clear();
    if (initialPath != null && paintingEnumerator != null) {
      let parentPath = initialPath;
      parentPath = parentPath.getParentPath();
      while (parentPath != null) {
        this.paintVerticalPartOfLeg(g, paintBounds, insets, parentPath);
        this.drawingCache.put(parentPath, true);
        parentPath = parentPath.getParentPath();
      }
      let done = false;
      let isExpanded: boolean;
      let hasBeenExpanded: boolean;
      let isLeaf: boolean;
      let boundsBuffer = new Rectangle()._Rectangle$();
      let bounds: Rectangle;
      let path: TreePath;
      let rootVisible = this.isRootVisible();
      while (!done && paintingEnumerator.hasMoreElements()) {
        path = paintingEnumerator.nextElement();
        if (path != null) {
          isLeaf = this.treeModel.isLeaf(path.getLastPathComponent());
          if (isLeaf) {
            isExpanded = hasBeenExpanded = false;
          } else {
            isExpanded = this.treeState.getExpandedState(path);
            hasBeenExpanded = this.tree.hasBeenExpanded(path);
          }
          bounds = this.getPathBounds$TreePath$Insets$Rectangle$BasicTreeUI(path, insets, boundsBuffer);
          if (bounds == null) {
            return;
          }
          parentPath = path.getParentPath();
          if (parentPath != null) {
            if (this.drawingCache.get(parentPath) == null) {
              this.paintVerticalPartOfLeg(g, paintBounds, insets, parentPath);
              this.drawingCache.put(parentPath, true);
            }
            this.paintHorizontalPartOfLeg(g, paintBounds, insets, bounds, path, row, isExpanded, hasBeenExpanded, isLeaf);
          } else if (rootVisible && row === 0) {
            this.paintHorizontalPartOfLeg(g, paintBounds, insets, bounds, path, row, isExpanded, hasBeenExpanded, isLeaf);
          }
          if (this.shouldPaintExpandControl(path, row, isExpanded, hasBeenExpanded, isLeaf)) {
            this.paintExpandControl(g, paintBounds, insets, bounds, path, row, isExpanded, hasBeenExpanded, isLeaf);
          }
          this.paintRow(g, paintBounds, insets, bounds, path, row, isExpanded, hasBeenExpanded, isLeaf);
          if (((bounds.y_ + bounds.height_) | 0) >= endY) {
            done = true;
          }
        } else {
          done = true;
        }
        row++;
      }
    }
    this.paintDropLine(g);
    this.rendererPane.removeAll();
    this.drawingCache.clear();
  }
  /**
   * Tells if a {@code DropLocation} should be indicated by a line between
   * nodes. This is meant for {@code javax.swing.DropMode.INSERT} and
   * {@code javax.swing.DropMode.ON_OR_INSERT} drop modes.
   *
   * @param loc a {@code DropLocation}
   * @return {@code true} if the drop location should be shown as a line
   * @since 1.7
   */
  isDropLine(loc: JTree$DropLocation): boolean {
    return loc != null && loc.getPath() != null && loc.getChildIndex() !== -1;
  }
  /**
   * Paints the drop line.
   *
   * @param g {@code Graphics} object to draw on
   * @since 1.7
   */
  paintDropLine(g: Graphics): void {
    let loc = this.tree.getDropLocation();
    if (!this.isDropLine(loc)) {
      return;
    }
    let c = UIManager.getColor$Object('Tree.dropLineColor');
    if (c != null) {
      g.setColor(c);
      let rect = this.getDropLineRect(loc);
      g.fillRect(rect.x_, rect.y_, rect.width_, rect.height_);
    }
  }
  /**
   * Returns a unbounding box for the drop line.
   *
   * @param loc a {@code DropLocation}
   * @return bounding box for the drop line
   * @since 1.7
   */
  getDropLineRect(loc: JTree$DropLocation): Rectangle {
    let rect: Rectangle;
    let path = loc.getPath();
    let index = loc.getChildIndex();
    let ltr = this.leftToRight_;
    let insets = this.tree.getInsets$();
    if (this.tree.getRowCount() === 0) {
      rect = new Rectangle()._Rectangle$int$int$int$int(insets.left, insets.top, (this.tree.getWidth() - insets.left - insets.right) | 0, 0);
    } else {
      let model = this.getModel();
      let root = model.getRoot();
      if (path.getLastPathComponent() === root && index >= model.getChildCount(root)) {
        rect = this.tree.getRowBounds((this.tree.getRowCount() - 1) | 0);
        rect.y_ = (rect.y_ + rect.height_) | 0;
        let xRect: Rectangle;
        if (!this.tree.isRootVisible()) {
          xRect = this.tree.getRowBounds(0);
        } else if (model.getChildCount(root) === 0) {
          xRect = this.tree.getRowBounds(0);
          xRect.x_ = (xRect.x_ + this.totalChildIndent) | 0;
          xRect.width_ = (xRect.width_ - (this.totalChildIndent + this.totalChildIndent)) | 0;
        } else {
          let lastChildPath = path.pathByAddingChild(model.getChild(root, (model.getChildCount(root) - 1) | 0));
          xRect = this.tree.getPathBounds(lastChildPath);
        }
        rect.x_ = xRect.x_;
        rect.width_ = xRect.width_;
      } else {
        if (index >= model.getChildCount(path.getLastPathComponent())) {
          rect = this.tree.getPathBounds(path.pathByAddingChild(model.getChild(path.getLastPathComponent(), (index - 1) | 0)));
          rect.y_ = (rect.y_ + rect.height_) | 0;
        } else {
          rect = this.tree.getPathBounds(path.pathByAddingChild(model.getChild(path.getLastPathComponent(), index)));
        }
      }
    }
    if (rect.y_ !== 0) {
      rect.y_--;
    }
    if (!ltr) {
      rect.x_ = (rect.x_ + rect.width_ - 100) | 0;
    }
    rect.width_ = 100;
    rect.height_ = 2;
    return rect;
  }
  /**
   * Paints the horizontal part of the leg. The receiver should
   * NOT modify {@code clipBounds}, or {@code insets}.<p>
   * NOTE: {@code parentRow} can be -1 if the root is not visible.
   *
   * @param g a graphics context
   * @param clipBounds a clipped rectangle
   * @param insets insets
   * @param bounds a bounding rectangle
   * @param path a tree path
   * @param row a row
   * @param isExpanded {@code true} if the path is expanded
   * @param hasBeenExpanded {@code true} if the path has been expanded
   * @param isLeaf {@code true} if the path is leaf
   */
  paintHorizontalPartOfLeg(g: Graphics, clipBounds: Rectangle, insets: Insets, bounds: Rectangle, path: TreePath, row: number, isExpanded: boolean, hasBeenExpanded: boolean, isLeaf: boolean): void {
    if (!this.paintLines) {
      return;
    }
    let depth = (path.getPathCount() - 1) | 0;
    if ((depth === 0 || (depth === 1 && !this.isRootVisible())) && !this.getShowsRootHandles()) {
      return;
    }
    let clipLeft = clipBounds.x_;
    let clipRight = (clipBounds.x_ + clipBounds.width_) | 0;
    let clipTop = clipBounds.y_;
    let clipBottom = (clipBounds.y_ + clipBounds.height_) | 0;
    let lineY = (bounds.y_ + $J.idiv(bounds.height_, 2)) | 0;
    if (this.leftToRight_) {
      let leftX = (bounds.x_ - this.getRightChildIndent()) | 0;
      let nodeX = (bounds.x_ - this.getHorizontalLegBuffer()) | 0;
      if (lineY >= clipTop && lineY < clipBottom && nodeX >= clipLeft && leftX < clipRight && leftX < nodeX) {
        g.setColor(this.getHashColor());
        this.paintHorizontalLine(g, this.tree, lineY, leftX, (nodeX - 1) | 0);
      }
    } else {
      let nodeX = (bounds.x_ + bounds.width_ + this.getHorizontalLegBuffer()) | 0;
      let rightX = (bounds.x_ + bounds.width_ + this.getRightChildIndent()) | 0;
      if (lineY >= clipTop && lineY < clipBottom && rightX >= clipLeft && nodeX < clipRight && nodeX < rightX) {
        g.setColor(this.getHashColor());
        this.paintHorizontalLine(g, this.tree, lineY, nodeX, (rightX - 1) | 0);
      }
    }
  }
  /**
   * Paints the vertical part of the leg. The receiver should
   * NOT modify {@code clipBounds}, {@code insets}.
   *
   * @param g a graphics context
   * @param clipBounds a clipped rectangle
   * @param insets insets
   * @param path a tree path
   */
  paintVerticalPartOfLeg(g: Graphics, clipBounds: Rectangle, insets: Insets, path: TreePath): void {
    if (!this.paintLines) {
      return;
    }
    let depth = (path.getPathCount() - 1) | 0;
    if (depth === 0 && !this.getShowsRootHandles() && !this.isRootVisible()) {
      return;
    }
    let lineX = this.getRowX(-1, (depth + 1) | 0);
    if (this.leftToRight_) {
      lineX = (lineX - this.getRightChildIndent() + insets.left) | 0;
    } else {
      lineX = (this.tree.getWidth() - lineX - insets.right + this.getRightChildIndent() - 1) | 0;
    }
    let clipLeft = clipBounds.x_;
    let clipRight = (clipBounds.x_ + (clipBounds.width_ - 1)) | 0;
    if (lineX >= clipLeft && lineX <= clipRight) {
      let clipTop = clipBounds.y_;
      let clipBottom = (clipBounds.y_ + clipBounds.height_) | 0;
      let parentBounds = this.getPathBounds$JTree$TreePath(this.tree, path);
      let lastChildBounds = this.getPathBounds$JTree$TreePath(this.tree, this.getLastChildPath(path));
      if (lastChildBounds == null) {
        return;
      }
      let top: number;
      if (parentBounds == null) {
        top = Math.max((insets.top + this.getVerticalLegBuffer()) | 0, clipTop);
      } else {
        top = Math.max((parentBounds.y_ + parentBounds.height_ + this.getVerticalLegBuffer()) | 0, clipTop);
      }
      if (depth === 0 && !this.isRootVisible()) {
        let model = this.getModel();
        if (model != null) {
          let root = model.getRoot();
          if (model.getChildCount(root) > 0) {
            parentBounds = this.getPathBounds$JTree$TreePath(this.tree, path.pathByAddingChild(model.getChild(root, 0)));
            if (parentBounds != null) {
              top = Math.max((insets.top + this.getVerticalLegBuffer()) | 0, (parentBounds.y_ + $J.idiv(parentBounds.height_, 2)) | 0);
            }
          }
        }
      }
      let bottom = Math.min((lastChildBounds.y_ + ($J.idiv(lastChildBounds.height_, 2))) | 0, clipBottom);
      if (top <= bottom) {
        g.setColor(this.getHashColor());
        this.paintVerticalLine(g, this.tree, lineX, top, bottom);
      }
    }
  }
  /**
   * Paints the expand (toggle) part of a row. The receiver should
   * NOT modify {@code clipBounds}, or {@code insets}.
   *
   * @param g a graphics context
   * @param clipBounds a clipped rectangle
   * @param insets insets
   * @param bounds a bounding rectangle
   * @param path a tree path
   * @param row a row
   * @param isExpanded {@code true} if the path is expanded
   * @param hasBeenExpanded {@code true} if the path has been expanded
   * @param isLeaf {@code true} if the row is leaf
   */
  paintExpandControl(g: Graphics, clipBounds: Rectangle, insets: Insets, bounds: Rectangle, path: TreePath, row: number, isExpanded: boolean, hasBeenExpanded: boolean, isLeaf: boolean): void {
    let value = path.getLastPathComponent();
    if (!isLeaf && (!hasBeenExpanded || this.treeModel.getChildCount(value) > 0)) {
      let middleXOfKnob: number;
      if (this.leftToRight_) {
        middleXOfKnob = (bounds.x_ - this.getRightChildIndent() + 1) | 0;
      } else {
        middleXOfKnob = (bounds.x_ + bounds.width_ + this.getRightChildIndent() - 1) | 0;
      }
      let middleYOfKnob = (bounds.y_ + ($J.idiv(bounds.height_, 2))) | 0;
      if (isExpanded) {
        let expandedIcon = this.getExpandedIcon();
        if (expandedIcon != null) {
          this.drawCentered(this.tree, g, expandedIcon, middleXOfKnob, middleYOfKnob);
        }
      } else {
        let collapsedIcon = this.getCollapsedIcon();
        if (collapsedIcon != null) {
          this.drawCentered(this.tree, g, collapsedIcon, middleXOfKnob, middleYOfKnob);
        }
      }
    }
  }
  /**
   * Paints the renderer part of a row. The receiver should
   * NOT modify {@code clipBounds}, or {@code insets}.
   *
   * @param g a graphics context
   * @param clipBounds a clipped rectangle
   * @param insets insets
   * @param bounds a bounding rectangle
   * @param path a tree path
   * @param row a row
   * @param isExpanded {@code true} if the path is expanded
   * @param hasBeenExpanded {@code true} if the path has been expanded
   * @param isLeaf {@code true} if the path is leaf
   */
  paintRow(g: Graphics, clipBounds: Rectangle, insets: Insets, bounds: Rectangle, path: TreePath, row: number, isExpanded: boolean, hasBeenExpanded: boolean, isLeaf: boolean): void {
    if (this.editingComponent != null && this.editingRow === row) {
      return;
    }
    let leadIndex: number;
    if (this.tree.hasFocus()) {
      leadIndex = this.getLeadSelectionRow();
    } else {
      leadIndex = -1;
    }
    let component: Component;
    component = this.currentCellRenderer.getTreeCellRendererComponent(this.tree, path.getLastPathComponent(), this.tree.isRowSelected(row), isExpanded, isLeaf, row, (leadIndex === row));
    this.rendererPane.paintComponent$Graphics$Component$Container$int$int$int$int$boolean(g, component, this.tree, bounds.x_, bounds.y_, bounds.width_, bounds.height_, true);
  }
  /**
   * Returns {@code true} if the expand (toggle) control should be drawn for
   * the specified row.
   *
   * @param path a tree path
   * @param row a row
   * @param isExpanded {@code true} if the path is expanded
   * @param hasBeenExpanded {@code true} if the path has been expanded
   * @param isLeaf {@code true} if the row is leaf
   * @return {@code true} if the expand (toggle) control should be drawn
   *         for the specified row
   */
  shouldPaintExpandControl(path: TreePath, row: number, isExpanded: boolean, hasBeenExpanded: boolean, isLeaf: boolean): boolean {
    if (isLeaf) {
      return false;
    }
    let depth = (path.getPathCount() - 1) | 0;
    if ((depth === 0 || (depth === 1 && !this.isRootVisible())) && !this.getShowsRootHandles()) {
      return false;
    }
    return true;
  }
  /**
   * Paints a vertical line.
   *
   * @param g a graphics context
   * @param c a component
   * @param x an X coordinate
   * @param top an Y1 coordinate
   * @param bottom an Y2 coordinate
   */
  paintVerticalLine(g: Graphics, c: JComponent, x: number, top: number, bottom: number): void {
    if (this.lineTypeDashed) {
      this.drawDashedVerticalLine(g, x, top, bottom);
    } else {
      g.drawLine(x, top, x, bottom);
    }
  }
  /**
   * Paints a horizontal line.
   *
   * @param g a graphics context
   * @param c a component
   * @param y an Y coordinate
   * @param left an X1 coordinate
   * @param right an X2 coordinate
   */
  paintHorizontalLine(g: Graphics, c: JComponent, y: number, left: number, right: number): void {
    if (this.lineTypeDashed) {
      this.drawDashedHorizontalLine(g, y, left, right);
    } else {
      g.drawLine(left, y, right, y);
    }
  }
  /**
   * The vertical element of legs between nodes starts at the bottom of the
   * parent node by default.  This method makes the leg start below that.
   *
   * @return the vertical leg buffer
   */
  getVerticalLegBuffer(): number {
    return 0;
  }
  /**
   * The horizontal element of legs between nodes starts at the
   * right of the left-hand side of the child node by default.  This
   * method makes the leg end before that.
   *
   * @return the horizontal leg buffer
   */
  getHorizontalLegBuffer(): number {
    return 0;
  }
  findCenteredX(x: number, iconWidth: number): number {
    return this.leftToRight_ ? (x - $J.d2i(Math.ceil(iconWidth / 2))) | 0 : (x - $J.d2i(Math.floor(iconWidth / 2))) | 0;
  }
  /**
   * Draws the {@code icon} centered at (x,y).
   *
   * @param c a component
   * @param graphics a graphics context
   * @param icon an icon
   * @param x an X coordinate
   * @param y an Y coordinate
   */
  drawCentered(c: Component, graphics: Graphics, icon: Icon, x: number, y: number): void {
    icon.paintIcon(c, graphics, this.findCenteredX(x, icon.getIconWidth()), (y - $J.idiv(icon.getIconHeight(), 2)) | 0);
  }
  /**
   * Draws a horizontal dashed line. It is assumed {@code x1} &lt;= {@code x2}.
   * If {@code x1} is greater than {@code x2}, the method draws nothing.
   *
   * @param g an instance of {@code Graphics}
   * @param y an Y coordinate
   * @param x1 an X1 coordinate
   * @param x2 an X2 coordinate
   */
  drawDashedHorizontalLine(g: Graphics, y: number, x1: number, x2: number): void {
    this.drawDashedLine(g, y, x1, x2, false);
  }
  /**
   * Draws a vertical dashed line. It is assumed {@code y1} &lt;= {@code y2}.
   * If {@code y1} is greater than {@code y2}, the method draws nothing.
   *
   * @param g an instance of {@code Graphics}
   * @param x an X coordinate
   * @param y1 an Y1 coordinate
   * @param y2 an Y2 coordinate
   */
  drawDashedVerticalLine(g: Graphics, x: number, y1: number, y2: number): void {
    this.drawDashedLine(g, x, y1, y2, true);
  }
  drawDashedLine(g: Graphics, v: number, v1: number, v2: number, isVertical: boolean): void {
    if (v1 >= v2) {
      return;
    }
    v1 = (v1 + (v1 % 2)) | 0;
    let g2d = g;
    let oldStroke = g2d.getStroke();
    let dashedStroke = new BasicStroke()._BasicStroke$float$int$int$float$floatArr$float(1, BasicStroke.CAP_BUTT, BasicStroke.JOIN_ROUND, 0, [1], 0);
    g2d.setStroke(dashedStroke);
    if (isVertical) {
      g2d.drawLine(v, v1, v, v2);
    } else {
      g2d.drawLine(v1, v, v2, v);
    }
    g2d.setStroke(oldStroke);
  }
  /**
   * Returns the location, along the x-axis, to render a particular row
   * at. The return value does not include any Insets specified on the JTree.
   * This does not check for the validity of the row or depth, it is assumed
   * to be correct and will not throw an Exception if the row or depth
   * doesn't match that of the tree.
   *
   * @param row Row to return x location for
   * @param depth Depth of the row
   * @return amount to indent the given row.
   * @since 1.5
   */
  getRowX(row: number, depth: number): number {
    return Math.imul(this.totalChildIndent, ((depth + this.depthOffset) | 0));
  }
  /**
   * Makes all the nodes that are expanded in JTree expanded in LayoutCache.
   * This invokes updateExpandedDescendants with the root path.
   */
  updateLayoutCacheExpandedNodes(): void {
    if (this.treeModel != null && this.treeModel.getRoot() != null) {
      this.updateExpandedDescendants(new TreePath()._TreePath$Object(this.treeModel.getRoot()));
    }
  }
  updateLayoutCacheExpandedNodesIfNecessary(): void {
    if (this.treeModel != null && this.treeModel.getRoot() != null) {
      let rootPath = new TreePath()._TreePath$Object(this.treeModel.getRoot());
      if (this.tree.isExpanded$TreePath(rootPath)) {
        this.updateLayoutCacheExpandedNodes();
      } else {
        this.treeState.setExpandedState(rootPath, false);
      }
    }
  }
  /**
   * Updates the expanded state of all the descendants of {@code path}
   * by getting the expanded descendants from the tree and forwarding
   * to the tree state.
   *
   * @param path a tree path
   */
  updateExpandedDescendants(path: TreePath): void {
    this.completeEditing$();
    if (this.treeState != null) {
      this.treeState.setExpandedState(path, true);
      let descendants = this.tree.getExpandedDescendants(path);
      if (descendants != null) {
        while (descendants.hasMoreElements()) {
          path = descendants.nextElement();
          this.treeState.setExpandedState(path, true);
        }
      }
      this.updateLeadSelectionRow();
      this.updateSize();
    }
  }
  /**
   * Returns a path to the last child of {@code parent}.
   *
   * @param parent a tree path
   * @return a path to the last child of {@code parent}
   */
  getLastChildPath(parent: TreePath): TreePath {
    if (this.treeModel != null) {
      let childCount = this.treeModel.getChildCount(parent.getLastPathComponent());
      if (childCount > 0) {
        return parent.pathByAddingChild(this.treeModel.getChild(parent.getLastPathComponent(), (childCount - 1) | 0));
      }
    }
    return null;
  }
  /**
   * Updates how much each depth should be offset by.
   */
  updateDepthOffset(): void {
    if (this.isRootVisible()) {
      if (this.getShowsRootHandles()) {
        this.depthOffset = 1;
      } else {
        this.depthOffset = 0;
      }
    } else if (!this.getShowsRootHandles()) {
      this.depthOffset = -1;
    } else {
      this.depthOffset = 0;
    }
  }
  /**
   * Updates the cellEditor based on the editability of the JTree that
   * we're contained in.  If the tree is editable but doesn't have a
   * cellEditor, a basic one will be used.
   */
  updateCellEditor(): void {
    let newEditor: TreeCellEditor;
    this.completeEditing$();
    if (this.tree == null) {
      newEditor = null;
    } else {
      if (this.tree.isEditable()) {
        newEditor = this.tree.getCellEditor();
        if (newEditor == null) {
          newEditor = this.createDefaultCellEditor();
          if (newEditor != null) {
            this.tree.setCellEditor(newEditor);
            this.createdCellEditor = true;
          }
        }
      } else {
        newEditor = null;
      }
    }
    if (newEditor !== this.cellEditor) {
      if (this.cellEditor != null && this.cellEditorListener != null) {
        this.cellEditor.removeCellEditorListener(this.cellEditorListener);
      }
      this.cellEditor = newEditor;
      if (this.cellEditorListener == null) {
        this.cellEditorListener = this.createCellEditorListener();
      }
      if (newEditor != null && this.cellEditorListener != null) {
        newEditor.addCellEditorListener(this.cellEditorListener);
      }
      this.createdCellEditor = false;
    }
  }
  /**
   * Messaged from the tree we're in when the renderer has changed.
   */
  updateRenderer(): void {
    if (this.tree != null) {
      let newCellRenderer: TreeCellRenderer;
      newCellRenderer = this.tree.getCellRenderer();
      if (newCellRenderer == null) {
        this.tree.setCellRenderer(this.createDefaultCellRenderer());
        this.createdRenderer = true;
      } else {
        this.createdRenderer = false;
        this.currentCellRenderer = newCellRenderer;
        if (this.createdCellEditor) {
          this.tree.setCellEditor(null);
        }
      }
    } else {
      this.createdRenderer = false;
      this.currentCellRenderer = null;
    }
    this.updateCellEditor();
  }
  /**
   * Resets the TreeState instance based on the tree we're providing the
   * look and feel for.
   */
  configureLayoutCache(): void {
    if (this.treeState != null && this.tree != null) {
      if (this.nodeDimensions == null) {
        this.nodeDimensions = this.createNodeDimensions();
      }
      this.treeState.setNodeDimensions(this.nodeDimensions);
      this.treeState.setRootVisible(this.tree.isRootVisible());
      this.treeState.setRowHeight(this.tree.getRowHeight());
      this.treeState.setSelectionModel(this.getSelectionModel());
      if (this.treeState.getModel() !== this.tree.getModel()) {
        this.treeState.setModel(this.tree.getModel());
      }
      this.updateLayoutCacheExpandedNodesIfNecessary();
      if (this.isLargeModel()) {
        if (this.componentListener == null) {
          this.componentListener = this.createComponentListener();
          if (this.componentListener != null) {
            this.tree.addComponentListener(this.componentListener);
          }
        }
      } else if (this.componentListener != null) {
        this.tree.removeComponentListener(this.componentListener);
        this.componentListener = null;
      }
    } else if (this.componentListener != null) {
      this.tree.removeComponentListener(this.componentListener);
      this.componentListener = null;
    }
  }
  /**
   * Marks the cached size as being invalid, and messages the
   * tree with <code>treeDidChange</code>.
   */
  updateSize(): void {
    this.validCachedPreferredSize = false;
    this.tree.treeDidChange();
  }
  updateSize0(): void {
    this.validCachedPreferredSize = false;
    this.tree.revalidate();
  }
  /**
   * Updates the <code>preferredSize</code> instance variable,
   * which is returned from <code>getPreferredSize()</code>.<p>
   * For left to right orientations, the size is determined from the
   * current AbstractLayoutCache. For RTL orientations, the preferred size
   * becomes the width minus the minimum x position.
   */
  updateCachedPreferredSize(): void {
    if (this.treeState != null) {
      let i = this.tree.getInsets$();
      if (this.isLargeModel()) {
        let visRect = this.tree.getVisibleRect();
        if (visRect.x_ === 0 && visRect.y_ === 0 && visRect.width_ === 0 && visRect.height_ === 0 && this.tree.getVisibleRowCount() > 0) {
          visRect.width_ = 1;
          visRect.height_ = Math.imul(this.tree.getRowHeight(), this.tree.getVisibleRowCount());
        } else {
          visRect.x_ = (visRect.x_ - i.left) | 0;
          visRect.y_ = (visRect.y_ - i.top) | 0;
        }
        let component = SwingUtilities.getUnwrappedParent(this.tree);
        if (component instanceof JViewport) {
          component = component.getParent();
          if (component instanceof JScrollPane) {
            let pane = component;
            let bar = pane.getHorizontalScrollBar();
            if ((bar != null) && bar.isVisible$()) {
              let height = bar.getHeight();
              visRect.y_ = (visRect.y_ - height) | 0;
              visRect.height_ = (visRect.height_ + height) | 0;
            }
          }
        }
        this.preferredSize_.width_ = this.treeState.getPreferredWidth(visRect);
      } else {
        this.preferredSize_.width_ = this.treeState.getPreferredWidth(null);
      }
      this.preferredSize_.height_ = this.treeState.getPreferredHeight();
      this.preferredSize_.width_ = (this.preferredSize_.width_ + (i.left + i.right)) | 0;
      this.preferredSize_.height_ = (this.preferredSize_.height_ + (i.top + i.bottom)) | 0;
    }
    this.validCachedPreferredSize = true;
  }
  /**
   * Ensures that the rows identified by {@code beginRow} through
   * {@code endRow} are visible.
   *
   * @param beginRow the begin row
   * @param endRow the end row
   */
  ensureRowsAreVisible(beginRow: number, endRow: number): void {
    if (this.tree != null && beginRow >= 0 && endRow < this.getRowCount(this.tree)) {
      let scrollVert = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.tree, this, 'Tree.scrollsHorizontallyAndVertically', false);
      if (beginRow === endRow) {
        let scrollBounds = this.getPathBounds$JTree$TreePath(this.tree, this.getPathForRow(this.tree, beginRow));
        if (scrollBounds != null) {
          if (!scrollVert) {
            scrollBounds.x_ = this.tree.getVisibleRect().x_;
            scrollBounds.width_ = 1;
          }
          this.tree.scrollRectToVisible(scrollBounds);
        }
      } else {
        let beginRect = this.getPathBounds$JTree$TreePath(this.tree, this.getPathForRow(this.tree, beginRow));
        if (beginRect != null) {
          let visRect = this.tree.getVisibleRect();
          let testRect = beginRect;
          let beginY = beginRect.y_;
          let maxY = (beginY + visRect.height_) | 0;
          for (let counter = (beginRow + 1) | 0; counter <= endRow; counter++) {
            testRect = this.getPathBounds$JTree$TreePath(this.tree, this.getPathForRow(this.tree, counter));
            if (testRect == null) {
              return;
            }
            if (((testRect.y_ + testRect.height_) | 0) > maxY) {
              counter = endRow;
            }
          }
          this.tree.scrollRectToVisible(new Rectangle()._Rectangle$int$int$int$int(visRect.x_, beginY, 1, (testRect.y_ + testRect.height_ - beginY) | 0));
        }
      }
    }
  }
  /**
   * Returns the minimum preferred size.
   *
   * @return the minimum preferred size
   */
  getPreferredMinSize(): Dimension {
    if (this.preferredMinSize == null) {
      return null;
    }
    return new Dimension()._Dimension$Dimension(this.preferredMinSize);
  }
  /**
   * Returns the preferred size to properly display the tree,
   * this is a cover method for {@code getPreferredSize(c, true)}.
   *
   * @param c a component
   * @return the preferred size to represent the tree in the component
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return this.getPreferredSize$JComponent$boolean(c, true);
  }
  /**
   * Returns the preferred size to represent the tree in
   * <I>c</I>.  If <I>checkConsistency</I> is {@code true}
   * <b>checkConsistency</b> is messaged first.
   *
   * @param c a component
   * @param checkConsistency if {@code true} consistency is checked
   * @return the preferred size to represent the tree in the component
   */
  getPreferredSize$JComponent$boolean(c: JComponent, checkConsistency: boolean): Dimension {
    let pSize = this.getPreferredMinSize();
    if (!this.validCachedPreferredSize) {
      this.updateCachedPreferredSize();
    }
    if (this.tree != null) {
      if (pSize != null) {
        return new Dimension()._Dimension$int$int(Math.max(pSize.width_, this.preferredSize_.width_), Math.max(pSize.height_, this.preferredSize_.height_));
      }
      return new Dimension()._Dimension$int$int(this.preferredSize_.width_, this.preferredSize_.height_);
    } else if (pSize != null) {
      return pSize;
    } else {
      return new Dimension()._Dimension$int$int(0, 0);
    }
  }
  /**
   * Returns the minimum size for this component.  Which will be
   * the min preferred size or 0, 0.
   */
  getMinimumSize(c: JComponent): Dimension {
    if (this.getPreferredMinSize() != null) {
      return this.getPreferredMinSize();
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Returns the maximum size for this component, which will be the
   * preferred size if the instance is currently in a JTree, or 0, 0.
   */
  getMaximumSize(c: JComponent): Dimension {
    if (this.tree != null) {
      return this.getPreferredSize$JComponent(this.tree);
    }
    if (this.getPreferredMinSize() != null) {
      return this.getPreferredMinSize();
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
  /**
   * Messages to stop the editing session. If the UI the receiver
   * is providing the look and feel for returns true from
   * <code>getInvokesStopCellEditing</code>, stopCellEditing will
   * invoked on the current editor. Then completeEditing will
   * be messaged with false, true, false to cancel any lingering
   * editing.
   */
  completeEditing$(): void {
    if (this.tree.getInvokesStopCellEditing() && this.stopEditingInCompleteEditing && this.editingComponent != null) {
      this.cellEditor.stopCellEditing();
    }
    this.completeEditing$boolean$boolean$boolean(false, true, false);
  }
  /**
   * Stops the editing session. If {@code messageStop} is {@code true} the editor
   * is messaged with {@code stopEditing}, if {@code messageCancel}
   * is {@code true} the editor is messaged with {@code cancelEditing}.
   * If {@code messageTree} is {@code true} the {@code treeModel} is messaged
   * with {@code valueForPathChanged}.
   *
   * @param messageStop message to stop editing
   * @param messageCancel message to cancel editing
   * @param messageTree message to tree
   */
  completeEditing$boolean$boolean$boolean(messageStop: boolean, messageCancel: boolean, messageTree: boolean): void {
    if (this.stopEditingInCompleteEditing && this.editingComponent != null) {
      let oldComponent = this.editingComponent;
      let oldPath = this.editingPath;
      let oldEditor = this.cellEditor;
      let newValue = oldEditor.getCellEditorValue();
      let editingBounds = this.getPathBounds$JTree$TreePath(this.tree, this.editingPath);
      let requestFocus = (this.tree != null && (this.tree.hasFocus() || SwingUtilities.findFocusOwner(this.editingComponent) != null));
      this.editingComponent = null;
      this.editingPath = null;
      if (messageStop) {
        oldEditor.stopCellEditing();
      } else if (messageCancel) {
        oldEditor.cancelCellEditing();
      }
      this.tree.remove$Component(oldComponent);
      if (this.editorHasDifferentSize) {
        this.treeState.invalidatePathBounds(oldPath);
        this.updateSize();
      } else if (editingBounds != null) {
        editingBounds.x_ = 0;
        editingBounds.width_ = this.tree.getSize$().width_;
        this.tree.repaint$Rectangle(editingBounds);
      }
      if (requestFocus) {
        this.tree.requestFocus$();
      }
      if (messageTree) {
        this.treeModel.valueForPathChanged(oldPath, newValue);
      }
    }
  }
  startEditingOnRelease(path: TreePath, event: MouseEvent, releaseEvent: MouseEvent): boolean {
    this.releaseEvent = releaseEvent;
    try {
      return this.startEditing(path, event);
    } finally {
      this.releaseEvent = null;
    }
  }
  /**
   * Will start editing for node if there is a {@code cellEditor} and
   * {@code shouldSelectCell} returns {@code true}.<p>
   * This assumes that path is valid and visible.
   *
   * @param path a tree path
   * @param event a mouse event
   * @return {@code true} if the editing is successful
   */
  startEditing(path: TreePath, event: MouseEvent): boolean {
    if (this.isEditing(this.tree) && this.tree.getInvokesStopCellEditing() && !this.stopEditing(this.tree)) {
      return false;
    }
    this.completeEditing$();
    if (this.cellEditor != null && this.tree.isPathEditable(path)) {
      let row = this.getRowForPath(this.tree, path);
      if (this.cellEditor.isCellEditable(event)) {
        this.editingComponent = this.cellEditor.getTreeCellEditorComponent(this.tree, path.getLastPathComponent(), this.tree.isPathSelected(path), this.tree.isExpanded$TreePath(path), this.treeModel.isLeaf(path.getLastPathComponent()), row);
        let nodeBounds = this.getPathBounds$JTree$TreePath(this.tree, path);
        if (nodeBounds == null) {
          return false;
        }
        this.editingRow = row;
        let editorSize = this.editingComponent.getPreferredSize$();
        if (editorSize.height_ !== nodeBounds.height_ && this.getRowHeight() > 0) {
          editorSize.height_ = this.getRowHeight();
        }
        if (editorSize.width_ !== nodeBounds.width_ || editorSize.height_ !== nodeBounds.height_) {
          this.editorHasDifferentSize = true;
          this.treeState.invalidatePathBounds(path);
          this.updateSize();
          nodeBounds = this.getPathBounds$JTree$TreePath(this.tree, path);
          if (nodeBounds == null) {
            return false;
          }
        } else {
          this.editorHasDifferentSize = false;
        }
        this.tree.add$Component(this.editingComponent);
        this.editingComponent.setBounds$int$int$int$int(nodeBounds.x_, nodeBounds.y_, nodeBounds.width_, nodeBounds.height_);
        this.editingPath = path;
        AWTAccessor.getComponentAccessor().revalidateSynchronously(this.editingComponent);
        this.editingComponent.repaint$();
        if (this.cellEditor.shouldSelectCell(event)) {
          this.stopEditingInCompleteEditing = false;
          this.tree.setSelectionRow(row);
          this.stopEditingInCompleteEditing = true;
        }
        let focusedComponent = SwingUtilities2.compositeRequestFocus(this.editingComponent);
        let selectAll = true;
        if (event != null) {
          let componentPoint = SwingUtilities.convertPoint$Component$Point$Component(this.tree, new Point()._Point$int$int(event.getX(), event.getY()), this.editingComponent);
          let activeComponent = SwingUtilities.getDeepestComponentAt(this.editingComponent, componentPoint.x_, componentPoint.y_);
          if (activeComponent != null) {
            let handler = new BasicTreeUI$MouseInputHandler().$o(this)._BasicTreeUI$MouseInputHandler$Component$Component$MouseEvent$Component(this.tree, activeComponent, event, focusedComponent);
            if (this.releaseEvent != null) {
              handler.mouseReleased(this.releaseEvent);
            }
            selectAll = false;
          }
        }
        if (selectAll && focusedComponent instanceof JTextField) {
          (focusedComponent).selectAll();
        }
        return true;
      } else {
        this.editingComponent = null;
      }
    }
    return false;
  }
  /**
   * If the {@code mouseX} and {@code mouseY} are in the
   * expand/collapse region of the {@code row}, this will toggle
   * the row.
   *
   * @param path a tree path
   * @param mouseX an X coordinate
   * @param mouseY an Y coordinate
   */
  checkForClickInExpandControl(path: TreePath, mouseX: number, mouseY: number): void {
    if (this.isLocationInExpandControl$TreePath$int$int(path, mouseX, mouseY)) {
      this.handleExpandControlClick(path, mouseX, mouseY);
    }
  }
  /**
   * Returns {@code true} if {@code mouseX} and {@code mouseY} fall
   * in the area of row that is used to expand/collapse the node and
   * the node at {@code row} does not represent a leaf.
   *
   * @param path a tree path
   * @param mouseX an X coordinate
   * @param mouseY an Y coordinate
   * @return {@code true} if the mouse cursor fall in the area of row that
   *         is used to expand/collapse the node and the node is not a leaf.
   */
  isLocationInExpandControl$TreePath$int$int(path: TreePath, mouseX: number, mouseY: number): boolean {
    if (path != null && !this.treeModel.isLeaf(path.getLastPathComponent())) {
      let boxWidth: number;
      let i = this.tree.getInsets$();
      if (this.getExpandedIcon() != null) {
        boxWidth = this.getExpandedIcon().getIconWidth();
      } else {
        boxWidth = 8;
      }
      let boxLeftX = this.getRowX(this.tree.getRowForPath(path), (path.getPathCount() - 1) | 0);
      if (this.leftToRight_) {
        boxLeftX = (boxLeftX + i.left - this.getRightChildIndent() + 1) | 0;
      } else {
        boxLeftX = (this.tree.getWidth() - boxLeftX - i.right + this.getRightChildIndent() - 1) | 0;
      }
      boxLeftX = this.findCenteredX(boxLeftX, boxWidth);
      return (mouseX >= boxLeftX && mouseX < ((boxLeftX + boxWidth) | 0));
    }
    return false;
  }
  /**
   * Messaged when the user clicks the particular row, this invokes
   * {@code toggleExpandState}.
   *
   * @param path a tree path
   * @param mouseX an X coordinate
   * @param mouseY an Y coordinate
   */
  handleExpandControlClick(path: TreePath, mouseX: number, mouseY: number): void {
    this.toggleExpandState(path);
  }
  /**
   * Expands path if it is not expanded, or collapses row if it is expanded.
   * If expanding a path and {@code JTree} scrolls on expand,
   * {@code ensureRowsAreVisible} is invoked to scroll as many of the children
   * to visible as possible (tries to scroll to last visible descendant of path).
   *
   * @param path a tree path
   */
  toggleExpandState(path: TreePath): void {
    if (!this.tree.isExpanded$TreePath(path)) {
      let row = this.getRowForPath(this.tree, path);
      this.tree.expandPath(path);
      this.updateSize();
      if (row !== -1) {
        if (this.tree.getScrollsOnExpand()) {
          this.ensureRowsAreVisible(row, (row + this.treeState.getVisibleChildCount(path)) | 0);
        } else {
          this.ensureRowsAreVisible(row, row);
        }
      }
    } else {
      this.tree.collapsePath(path);
      this.updateSize();
    }
  }
  /**
   * Returning {@code true} signifies a mouse event on the node should toggle
   * the selection of only the row under mouse.
   *
   * @param event a mouse event
   * @return {@code true} if a mouse event on the node should toggle the selection
   */
  isToggleSelectionEvent(event: MouseEvent): boolean {
    return (SwingUtilities.isLeftMouseButton(event) && BasicGraphicsUtils.isMenuShortcutKeyDown(event));
  }
  /**
   * Returning {@code true} signifies a mouse event on the node should select
   * from the anchor point.
   *
   * @param event a mouse event
   * @return {@code true} if a mouse event on the node should select
   *         from the anchor point
   */
  isMultiSelectEvent(event: MouseEvent): boolean {
    return (SwingUtilities.isLeftMouseButton(event) && event.isShiftDown());
  }
  /**
   * Returning {@code true} indicates the row under the mouse should be toggled
   * based on the event. This is invoked after {@code checkForClickInExpandControl},
   * implying the location is not in the expand (toggle) control.
   *
   * @param event a mouse event
   * @return {@code true} if the row under the mouse should be toggled
   */
  isToggleEvent(event: MouseEvent): boolean {
    if (!SwingUtilities.isLeftMouseButton(event)) {
      return false;
    }
    let clickCount = this.tree.getToggleClickCount();
    if (clickCount <= 0) {
      return false;
    }
    return ((event.getClickCount() % clickCount) === 0);
  }
  /**
   * Messaged to update the selection based on a {@code MouseEvent} over a
   * particular row. If the event is a toggle selection event, the
   * row is either selected, or deselected. If the event identifies
   * a multi selection event, the selection is updated from the
   * anchor point. Otherwise the row is selected, and if the event
   * specified a toggle event the row is expanded/collapsed.
   *
   * @param path the selected path
   * @param event the mouse event
   */
  selectPathForEvent(path: TreePath, event: MouseEvent): void {
    if (this.isMultiSelectEvent(event)) {
      let anchor = this.getAnchorSelectionPath();
      let anchorRow = (anchor == null) ? -1 : this.getRowForPath(this.tree, anchor);
      if (anchorRow === -1 || this.tree.getSelectionModel().getSelectionMode() === TreeSelectionModel.SINGLE_TREE_SELECTION) {
        this.tree.setSelectionPath(path);
      } else {
        let row = this.getRowForPath(this.tree, path);
        let lastAnchorPath = anchor;
        if (this.isToggleSelectionEvent(event)) {
          if (this.tree.isRowSelected(anchorRow)) {
            this.tree.addSelectionInterval(anchorRow, row);
          } else {
            this.tree.removeSelectionInterval(anchorRow, row);
            this.tree.addSelectionInterval(row, row);
          }
        } else if (row < anchorRow) {
          this.tree.setSelectionInterval(row, anchorRow);
        } else {
          this.tree.setSelectionInterval(anchorRow, row);
        }
        this.lastSelectedRow = row;
        this.setAnchorSelectionPath(lastAnchorPath);
        this.setLeadSelectionPath$TreePath$BasicTreeUI(path);
      }
    } else if (this.isToggleSelectionEvent(event)) {
      if (this.tree.isPathSelected(path)) {
        this.tree.removeSelectionPath(path);
      } else {
        this.tree.addSelectionPath(path);
      }
      this.lastSelectedRow = this.getRowForPath(this.tree, path);
      this.setAnchorSelectionPath(path);
      this.setLeadSelectionPath$TreePath$BasicTreeUI(path);
    } else if (SwingUtilities.isLeftMouseButton(event)) {
      this.tree.setSelectionPath(path);
      if (this.isToggleEvent(event)) {
        this.toggleExpandState(path);
      }
    }
  }
  /**
   * Returns {@code true} if the node at {@code row} is a leaf.
   *
   * @param row a row
   * @return {@code true} if the node at {@code row} is a leaf
   */
  isLeaf(row: number): boolean {
    let path = this.getPathForRow(this.tree, row);
    if (path != null) {
      return this.treeModel.isLeaf(path.getLastPathComponent());
    }
    return true;
  }
  setAnchorSelectionPath(newPath: TreePath): void {
    this.ignoreLAChange = true;
    try {
      this.tree.setAnchorSelectionPath(newPath);
    } finally {
      this.ignoreLAChange = false;
    }
  }
  getAnchorSelectionPath(): TreePath {
    return this.tree.getAnchorSelectionPath();
  }
  setLeadSelectionPath$TreePath$BasicTreeUI(newPath: TreePath): void {
    this.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(newPath, false);
  }
  setLeadSelectionPath$TreePath$boolean$BasicTreeUI(newPath: TreePath, repaint: boolean): void {
    let bounds = repaint ? this.getPathBounds$JTree$TreePath(this.tree, this.getLeadSelectionPath()) : null;
    this.ignoreLAChange = true;
    try {
      this.tree.setLeadSelectionPath(newPath);
    } finally {
      this.ignoreLAChange = false;
    }
    this.leadRow = this.getRowForPath(this.tree, newPath);
    if (repaint) {
      if (bounds != null) {
        this.tree.repaint$Rectangle(this.getRepaintPathBounds(bounds));
      }
      bounds = this.getPathBounds$JTree$TreePath(this.tree, newPath);
      if (bounds != null) {
        this.tree.repaint$Rectangle(this.getRepaintPathBounds(bounds));
      }
    }
  }
  getRepaintPathBounds(bounds: Rectangle): Rectangle {
    if (UIManager.getBoolean$Object('Tree.repaintWholeRow')) {
      bounds.x_ = 0;
      bounds.width_ = this.tree.getWidth();
    }
    return bounds;
  }
  getLeadSelectionPath(): TreePath {
    return this.tree.getLeadSelectionPath();
  }
  /**
   * Updates the lead row of the selection.
   * @since 1.7
   */
  updateLeadSelectionRow(): void {
    this.leadRow = this.getRowForPath(this.tree, this.getLeadSelectionPath());
  }
  /**
   * Returns the lead row of the selection.
   *
   * @return selection lead row
   * @since 1.7
   */
  getLeadSelectionRow(): number {
    return this.leadRow;
  }
  /**
   * Extends the selection from the anchor to make <code>newLead</code>
   * the lead of the selection. This does not scroll.
   */
  extendSelection(newLead: TreePath): void {
    let aPath = this.getAnchorSelectionPath();
    let aRow = (aPath == null) ? -1 : this.getRowForPath(this.tree, aPath);
    let newIndex = this.getRowForPath(this.tree, newLead);
    if (aRow === -1) {
      this.tree.setSelectionRow(newIndex);
    } else {
      if (aRow < newIndex) {
        this.tree.setSelectionInterval(aRow, newIndex);
      } else {
        this.tree.setSelectionInterval(newIndex, aRow);
      }
      this.setAnchorSelectionPath(aPath);
      this.setLeadSelectionPath$TreePath$BasicTreeUI(newLead);
    }
  }
  /**
   * Invokes <code>repaint</code> on the JTree for the passed in TreePath,
   * <code>path</code>.
   */
  repaintPath(path: TreePath): void {
    if (path != null) {
      let bounds = this.getPathBounds$JTree$TreePath(this.tree, path);
      if (bounds != null) {
        this.tree.repaint$int$int$int$int(bounds.x_, bounds.y_, bounds.width_, bounds.height_);
      }
    }
  }
  static $clinit() {
    BasicTreeUI.BASELINE_COMPONENT_KEY = new StringBuilder('Tree.baselineComponent');
    BasicTreeUI.SHARED_ACTION = new BasicTreeUI$Actions()._BasicTreeUI$Actions$();
    BasicTreeUI.defaultTransferHandler = new BasicTreeUI$TreeTransferHandler()._BasicTreeUI$TreeTransferHandler();
  }
}

/**
 * Updates the preferred size when scrolling (if necessary).
 */
export class BasicTreeUI$ComponentHandler extends ComponentAdapter {
  /**
   * Timer used when inside a scrollpane and the scrollbar is
   * adjusting.
   */
  timer: Timer = null;
  /**
   * ScrollBar that is being adjusted.
   */
  scrollBar: JScrollBar = null;
  /**
   * Constructs a {@code ComponentHandler}.
   */
  _BasicTreeUI$ComponentHandler(): this {
    this._ComponentAdapter();
    return this;
  }
  componentMoved(e: ComponentEvent): void {
    if (this.timer == null) {
      let scrollPane = this.getScrollPane();
      if (scrollPane == null) {
        this.$outer.updateSize();
      } else {
        this.scrollBar = scrollPane.getVerticalScrollBar();
        if (this.scrollBar == null || !this.scrollBar.getValueIsAdjusting()) {
          if ((this.scrollBar = scrollPane.getHorizontalScrollBar()) != null && this.scrollBar.getValueIsAdjusting()) {
            this.startTimer();
          } else {
            this.$outer.updateSize();
          }
        } else {
          this.startTimer();
        }
      }
    }
  }
  /**
   * Creates, if necessary, and starts a Timer to check if need to
   * resize the bounds.
   */
  startTimer(): void {
    if (this.timer == null) {
      this.timer = new Timer()._Timer(200, $J.fn(this, 'actionPerformed'));
      this.timer.setRepeats(true);
    }
    this.timer.start();
  }
  /**
   * Returns the {@code JScrollPane} housing the {@code JTree},
   * or null if one isn't found.
   *
   * @return the {@code JScrollPane} housing the {@code JTree}
   */
  getScrollPane(): JScrollPane {
    let c = this.$outer.tree.getParent();
    while (c != null && !(c instanceof JScrollPane)) {
      c = c.getParent();
    }
    if (c instanceof JScrollPane) {
      return c;
    }
    return null;
  }
  /**
   * Public as a result of Timer. If the scrollBar is null, or
   * not adjusting, this stops the timer and updates the sizing.
   */
  actionPerformed(ae: ActionEvent): void {
    if (this.scrollBar == null || !this.scrollBar.getValueIsAdjusting()) {
      if (this.timer != null) {
        this.timer.stop();
      }
      this.$outer.updateSize();
      this.timer = null;
      this.scrollBar = null;
    }
  }
}

/**
 * Class responsible for getting size of node, method is forwarded
 * to BasicTreeUI method. X location does not include insets, that is
 * handled in getPathBounds.
 */
export class BasicTreeUI$NodeDimensionsHandler extends AbstractLayoutCache$NodeDimensions {
  /**
   * Constructs a {@code NodeDimensionsHandler}.
   */
  _BasicTreeUI$NodeDimensionsHandler(): this {
    this._AbstractLayoutCache$NodeDimensions();
    return this;
  }
  /**
   * Responsible for getting the size of a particular node.
   */
  getNodeDimensions(value: any, row: number, depth: number, expanded: boolean, size: Rectangle): Rectangle {
    if (this.$outer.editingComponent != null && this.$outer.editingRow === row) {
      let prefSize = this.$outer.editingComponent.getPreferredSize$();
      let rh = this.$outer.getRowHeight();
      if (rh > 0 && rh !== prefSize.height_) {
        prefSize.height_ = rh;
      }
      if (size != null) {
        size.x_ = this.getRowX(row, depth);
        size.width_ = prefSize.width_;
        size.height_ = prefSize.height_;
      } else {
        size = new Rectangle()._Rectangle$int$int$int$int(this.getRowX(row, depth), 0, prefSize.width_, prefSize.height_);
      }
      return size;
    }
    if (this.$outer.currentCellRenderer != null) {
      let aComponent: Component;
      aComponent = this.$outer.currentCellRenderer.getTreeCellRendererComponent(this.$outer.tree, value, this.$outer.tree.isRowSelected(row), expanded, this.$outer.treeModel.isLeaf(value), row, false);
      if (this.$outer.tree != null) {
        this.$outer.rendererPane.add$Component(aComponent);
        aComponent.validate();
      }
      let prefSize = aComponent.getPreferredSize$();
      if (size != null) {
        size.x_ = this.getRowX(row, depth);
        size.width_ = prefSize.width_;
        size.height_ = prefSize.height_;
      } else {
        size = new Rectangle()._Rectangle$int$int$int$int(this.getRowX(row, depth), 0, prefSize.width_, prefSize.height_);
      }
      return size;
    }
    return null;
  }
  /**
   * Returns amount to indent the given row.
   *
   * @param row a row
   * @param depth a depth
   * @return amount to indent the given row
   */
  getRowX(row: number, depth: number): number {
    return this.$outer.getRowX(row, depth);
  }
}

/**
 * MouseInputHandler handles passing all mouse events,
 * including mouse motion events, until the mouse is released to
 * the destination it is constructed with. It is assumed all the
 * events are currently target at source.
 */
export class BasicTreeUI$MouseInputHandler extends JObject {
  /**
   * Source that events are coming from.
   */
  source: Component = null;
  /**
   * Destination that receives all events.
   */
  destination: Component = null;
  focusComponent: Component = null;
  dispatchedEvent: boolean = false;
  _BasicTreeUI$MouseInputHandler$Component$Component$MouseEvent$Component(source: Component, destination: Component, event: MouseEvent, focusComponent: Component): this {
    this.source = source;
    this.destination = destination;
    this.source.addMouseListener(this);
    this.source.addMouseMotionListener(this);
    SwingUtilities2.setSkipClickCount(destination, (event.getClickCount() - 1) | 0);
    destination.dispatchEvent(SwingUtilities.convertMouseEvent(source, event, destination));
    this.focusComponent = focusComponent;
    return this;
  }
  mouseClicked(e: MouseEvent): void {
    if (this.destination != null) {
      this.dispatchedEvent = true;
      this.destination.dispatchEvent(SwingUtilities.convertMouseEvent(this.source, e, this.destination));
    }
  }
  mousePressed(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
    if (this.destination != null) {
      this.destination.dispatchEvent(SwingUtilities.convertMouseEvent(this.source, e, this.destination));
    }
    this.removeFromSource();
  }
  mouseEntered(e: MouseEvent): void {
    if (!SwingUtilities.isLeftMouseButton(e)) {
      this.removeFromSource();
    }
  }
  mouseExited(e: MouseEvent): void {
    if (!SwingUtilities.isLeftMouseButton(e)) {
      this.removeFromSource();
    }
  }
  mouseDragged(e: MouseEvent): void {
    if (this.destination != null) {
      this.dispatchedEvent = true;
      this.destination.dispatchEvent(SwingUtilities.convertMouseEvent(this.source, e, this.destination));
    }
  }
  mouseMoved(e: MouseEvent): void {
    this.removeFromSource();
  }
  /**
   * Removes an event from the source.
   */
  removeFromSource(): void {
    if (this.source != null) {
      this.source.removeMouseListener(this);
      this.source.removeMouseMotionListener(this);
      if (this.focusComponent != null && this.focusComponent === this.destination && !this.dispatchedEvent && (this.focusComponent instanceof JTextField)) {
        (this.focusComponent).selectAll();
      }
    }
    this.source = this.destination = null;
  }
}

export class BasicTreeUI$TreeTransferHandler extends TransferHandler {
  tree: JTree = null;
  _BasicTreeUI$TreeTransferHandler(): this {
    this._TransferHandler$();
    return this;
  }
  /**
   * Create a Transferable to use as the source for a data transfer.
   *
   * @param c  The component holding the data to be transferred.  This
   *  argument is provided to enable sharing of TransferHandlers by
   *  multiple components.
   * @return  The representation of the data to be transferred.
   */
  createTransferable(c: JComponent): Transferable {
    if (c instanceof JTree) {
      this.tree = c;
      let paths = this.tree.getSelectionPaths();
      if (paths == null || paths.length === 0) {
        return null;
      }
      let plainStr = new StringBuilder();
      let htmlStr = new StringBuilder();
      htmlStr.append('<html>\n<body>\n<ul>\n');
      let model = this.tree.getModel();
      let lastPath = null;
      let displayPaths = this.getDisplayOrderPaths(paths);
      for (let path of displayPaths) {
        let node = path.getLastPathComponent();
        let leaf = model.isLeaf(node);
        let label = this.getDisplayString(path, true, leaf);
        plainStr.append(label).append(String.fromCharCode(10 /* \u000a */));
        htmlStr.append('  <li>').append(label).append(String.fromCharCode(10 /* \u000a */));
      }
      plainStr.deleteCharAt((plainStr.length() - 1) | 0);
      htmlStr.append('</ul>\n</body>\n</html>');
      this.tree = null;
      return new BasicTransferable()._BasicTransferable(plainStr.toString(), htmlStr.toString());
    }
    return null;
  }
  compare(o1: TreePath, o2: TreePath): number {
    let row1 = this.tree.getRowForPath(o1);
    let row2 = this.tree.getRowForPath(o2);
    return (row1 - row2) | 0;
  }
  getDisplayString(path: TreePath, selected: boolean, leaf: boolean): string {
    let row = this.tree.getRowForPath(path);
    let hasFocus = this.tree.getLeadSelectionRow() === row;
    let node = path.getLastPathComponent();
    return this.tree.convertValueToText(node, selected, this.tree.isExpanded$int(row), leaf, row, hasFocus);
  }
  /**
   * Selection paths are in selection order.  The conversion to
   * HTML requires display order.  This method resorts the paths
   * to be in the display order.
   */
  getDisplayOrderPaths(paths: TreePath[]): TreePath[] {
    let selOrder = new ArrayList();
    for (let path of paths) {
      selOrder.add(path);
    }
    selOrder.sort($J.fn(this, 'compare'));
    let n = selOrder.size();
    let displayPaths = $J.newArray(n, null);
    for (let i = 0; i < n; i++) {
      displayPaths[i] = selOrder.get(i);
    }
    return displayPaths;
  }
  getSourceActions(c: JComponent): number {
    return TransferHandler.COPY;
  }
}

export class BasicTreeUI$Handler extends JObject {
  prefix: string = null;
  typedString: string = null;
  lastTime: number = 0;
  dragPressDidSelection: boolean = false;
  dragStarted: boolean = false;
  pressedPath: TreePath = null;
  pressedEvent: MouseEvent = null;
  valueChangedOnPress: boolean = false;
  _BasicTreeUI$Handler(): this {
    this.prefix = '';
    this.typedString = '';
    this.lastTime = 0;
    return this;
  }
  /**
   * Invoked when a key has been typed.
   *
   * Moves the keyboard focus to the first element whose prefix matches the
   * sequence of alphanumeric keys pressed by the user with delay less
   * than value of <code>timeFactor</code> property (or 1000 milliseconds
   * if it is not defined). Subsequent same key presses move the keyboard
   * focus to the next object that starts with the same letter until another
   * key is pressed, then it is treated as the prefix with appropriate number
   * of the same letters followed by first typed another letter.
   */
  keyTyped(e: KeyEvent): void {
    if (this.$outer.tree != null && this.$outer.tree.getRowCount() > 0 && this.$outer.tree.hasFocus() && this.$outer.tree.isEnabled()) {
      if (e.isAltDown() || BasicGraphicsUtils.isMenuShortcutKeyDown(e) || this.isNavigationKey(e)) {
        return;
      }
      let startingFromSelection = true;
      let c = e.getKeyChar();
      let time = e.getWhen();
      let startingRow = this.$outer.tree.getLeadSelectionRow();
      if (time - this.lastTime < this.$outer.timeFactor) {
        this.typedString += String.fromCharCode(c);
        if ((this.prefix.length === 1) && (c === this.prefix.charCodeAt(0))) {
          startingRow++;
        } else {
          this.prefix = this.typedString;
        }
      } else {
        startingRow++;
        this.typedString = '' + String.fromCharCode(c);
        this.prefix = this.typedString;
      }
      this.lastTime = time;
      if (startingRow < 0 || startingRow >= this.$outer.tree.getRowCount()) {
        startingFromSelection = false;
        startingRow = 0;
      }
      let path = this.$outer.tree.getNextMatch(this.prefix, startingRow, Position$Bias.Forward);
      if (path != null) {
        this.$outer.tree.setSelectionPath(path);
        let row = this.$outer.getRowForPath(this.$outer.tree, path);
        this.$outer.ensureRowsAreVisible(row, row);
      } else if (startingFromSelection) {
        path = this.$outer.tree.getNextMatch(this.prefix, 0, Position$Bias.Forward);
        if (path != null) {
          this.$outer.tree.setSelectionPath(path);
          let row = this.$outer.getRowForPath(this.$outer.tree, path);
          this.$outer.ensureRowsAreVisible(row, row);
        }
      }
    }
  }
  /**
   * Invoked when a key has been pressed.
   *
   * Checks to see if the key event is a navigation key to prevent
   * dispatching these keys for the first letter navigation.
   */
  keyPressed(e: KeyEvent): void {
    if (this.$outer.tree != null && this.isNavigationKey(e)) {
      this.prefix = '';
      this.typedString = '';
      this.lastTime = 0;
    }
  }
  keyReleased(e: KeyEvent): void {
  }
  /**
   * Returns whether or not the supplied key event maps to a key that is used for
   * navigation.  This is used for optimizing key input by only passing non-
   * navigation keys to the first letter navigation mechanism.
   */
  isNavigationKey(event: KeyEvent): boolean {
    let inputMap = this.$outer.tree.getInputMap$int(JComponent.WHEN_ANCESTOR_OF_FOCUSED_COMPONENT);
    let key = KeyStroke.getKeyStrokeForEvent(event);
    return inputMap != null && inputMap.get(key) != null;
  }
  propertyChange(event: PropertyChangeEvent): void {
    if (event.getSource() === this.$outer.treeSelectionModel) {
      this.$outer.treeSelectionModel.resetRowSelection();
    } else if (event.getSource() === this.$outer.tree) {
      let changeName = event.getPropertyName();
      if (changeName === JTree.LEAD_SELECTION_PATH_PROPERTY) {
        if (!this.$outer.ignoreLAChange) {
          this.$outer.updateLeadSelectionRow();
          this.$outer.repaintPath(event.getOldValue());
          this.$outer.repaintPath(event.getNewValue());
        }
      } else if (changeName === JTree.ANCHOR_SELECTION_PATH_PROPERTY) {
        if (!this.$outer.ignoreLAChange) {
          this.$outer.repaintPath(event.getOldValue());
          this.$outer.repaintPath(event.getNewValue());
        }
      }
      if (changeName === JTree.CELL_RENDERER_PROPERTY) {
        this.$outer.setCellRenderer(event.getNewValue());
        this.$outer.redoTheLayout();
      } else if (changeName === JTree.TREE_MODEL_PROPERTY) {
        this.$outer.setModel(event.getNewValue());
      } else if (changeName === JTree.ROOT_VISIBLE_PROPERTY) {
        this.$outer.setRootVisible((event.getNewValue()));
      } else if (changeName === JTree.SHOWS_ROOT_HANDLES_PROPERTY) {
        this.$outer.setShowsRootHandles((event.getNewValue()));
      } else if (changeName === JTree.ROW_HEIGHT_PROPERTY) {
        this.$outer.setRowHeight((+(event.getNewValue())));
      } else if (changeName === JTree.CELL_EDITOR_PROPERTY) {
        this.$outer.setCellEditor(event.getNewValue());
      } else if (changeName === JTree.EDITABLE_PROPERTY) {
        this.$outer.setEditable((event.getNewValue()));
      } else if (changeName === JTree.LARGE_MODEL_PROPERTY) {
        this.$outer.setLargeModel(this.$outer.tree.isLargeModel());
      } else if (changeName === JTree.SELECTION_MODEL_PROPERTY) {
        this.$outer.setSelectionModel(this.$outer.tree.getSelectionModel());
      } else if (changeName === 'font' || SwingUtilities2.isScaleChanged$PropertyChangeEvent(event)) {
        this.$outer.completeEditing$();
        if (this.$outer.treeState != null) {
          this.$outer.treeState.invalidateSizes();
        }
        this.$outer.updateSize();
      } else if (changeName === 'componentOrientation') {
        if (this.$outer.tree != null) {
          this.$outer.leftToRight_ = BasicGraphicsUtils.isLeftToRight(this.$outer.tree);
          this.$outer.redoTheLayout();
          this.$outer.tree.treeDidChange();
          let km = this.$outer.getInputMap(JComponent.WHEN_FOCUSED);
          SwingUtilities.replaceUIInputMap(this.$outer.tree, JComponent.WHEN_FOCUSED, km);
        }
      } else if ('dropLocation' === changeName) {
        let oldValue = event.getOldValue();
        this.repaintDropLocation(oldValue);
        this.repaintDropLocation(this.$outer.tree.getDropLocation());
      }
    }
  }
  repaintDropLocation(loc: JTree$DropLocation): void {
    if (loc == null) {
      return;
    }
    let r: Rectangle;
    if (this.$outer.isDropLine(loc)) {
      r = this.$outer.getDropLineRect(loc);
    } else {
      r = this.$outer.tree.getPathBounds(loc.getPath());
    }
    if (r != null) {
      this.$outer.tree.repaint$Rectangle(r);
    }
  }
  isActualPath(path: TreePath, x: number, y: number): boolean {
    if (path == null) {
      return false;
    }
    let bounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, path);
    if (bounds == null || y > ((bounds.y_ + bounds.height_) | 0)) {
      return false;
    }
    return (x >= bounds.x_) && (x <= ((bounds.x_ + bounds.width_) | 0));
  }
  mouseClicked(e: MouseEvent): void {
  }
  mouseEntered(e: MouseEvent): void {
  }
  mouseExited(e: MouseEvent): void {
  }
  /**
   * Invoked when a mouse button has been pressed on a component.
   */
  mousePressed(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.tree)) {
      return;
    }
    if (this.$outer.isEditing(this.$outer.tree) && this.$outer.tree.getInvokesStopCellEditing() && !this.$outer.stopEditing(this.$outer.tree)) {
      return;
    }
    this.$outer.completeEditing$();
    this.pressedPath = this.$outer.getClosestPathForLocation(this.$outer.tree, e.getX(), e.getY());
    if (this.$outer.tree.getDragEnabled()) {
      this.mousePressedDND(e);
    } else {
      SwingUtilities2.adjustFocus(this.$outer.tree);
      this.handleSelection(e);
    }
  }
  mousePressedDND(e: MouseEvent): void {
    this.pressedEvent = e;
    let grabFocus = true;
    this.dragStarted = false;
    this.valueChangedOnPress = false;
    if (this.isActualPath(this.pressedPath, e.getX(), e.getY()) && DragRecognitionSupport.mousePressed(e)) {
      this.dragPressDidSelection = false;
      if (BasicGraphicsUtils.isMenuShortcutKeyDown(e)) {
        return;
      } else if (!e.isShiftDown() && this.$outer.tree.isPathSelected(this.pressedPath)) {
        this.$outer.setAnchorSelectionPath(this.pressedPath);
        this.$outer.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(this.pressedPath, true);
        return;
      }
      this.dragPressDidSelection = true;
      grabFocus = false;
    }
    if (grabFocus) {
      SwingUtilities2.adjustFocus(this.$outer.tree);
    }
    this.handleSelection(e);
  }
  handleSelection(e: MouseEvent): void {
    if (this.pressedPath != null) {
      let bounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, this.pressedPath);
      if (bounds == null || e.getY() >= ((bounds.y_ + bounds.height_) | 0)) {
        return;
      }
      if (SwingUtilities.isLeftMouseButton(e)) {
        this.$outer.checkForClickInExpandControl(this.pressedPath, e.getX(), e.getY());
      }
      let x = e.getX();
      if (x >= bounds.x_ && x < ((bounds.x_ + bounds.width_) | 0)) {
        if (this.$outer.tree.getDragEnabled() || !this.$outer.startEditing(this.pressedPath, e)) {
          this.$outer.selectPathForEvent(this.pressedPath, e);
        }
      }
    }
  }
  dragStarting(me: MouseEvent): void {
    this.dragStarted = true;
    if (BasicGraphicsUtils.isMenuShortcutKeyDown(me)) {
      this.$outer.tree.addSelectionPath(this.pressedPath);
      this.$outer.setAnchorSelectionPath(this.pressedPath);
      this.$outer.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(this.pressedPath, true);
    }
    this.pressedEvent = null;
    this.pressedPath = null;
  }
  mouseDragged(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.tree)) {
      return;
    }
    if (this.$outer.tree.getDragEnabled()) {
      DragRecognitionSupport.mouseDragged(e, this);
    }
  }
  /**
   * Invoked when the mouse button has been moved on a component
   * (with no buttons no down).
   */
  mouseMoved(e: MouseEvent): void {
  }
  mouseReleased(e: MouseEvent): void {
    if (SwingUtilities2.shouldIgnore(e, this.$outer.tree)) {
      return;
    }
    if (this.$outer.tree.getDragEnabled()) {
      this.mouseReleasedDND(e);
    }
    this.pressedEvent = null;
    this.pressedPath = null;
  }
  mouseReleasedDND(e: MouseEvent): void {
    let me = DragRecognitionSupport.mouseReleased(e);
    if (me != null) {
      SwingUtilities2.adjustFocus(this.$outer.tree);
      if (!this.dragPressDidSelection) {
        this.handleSelection(me);
      }
    }
    if (!this.dragStarted) {
      if (this.pressedPath != null && !this.valueChangedOnPress && this.isActualPath(this.pressedPath, this.pressedEvent.getX(), this.pressedEvent.getY())) {
        this.$outer.startEditingOnRelease(this.pressedPath, this.pressedEvent, e);
      }
    }
  }
  focusGained(e: FocusEvent): void {
    if (this.$outer.tree != null) {
      let pBounds: Rectangle;
      pBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, this.$outer.tree.getLeadSelectionPath());
      if (pBounds != null) {
        this.$outer.tree.repaint$Rectangle(this.$outer.getRepaintPathBounds(pBounds));
      }
      pBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, this.$outer.getLeadSelectionPath());
      if (pBounds != null) {
        this.$outer.tree.repaint$Rectangle(this.$outer.getRepaintPathBounds(pBounds));
      }
    }
  }
  focusLost(e: FocusEvent): void {
    this.focusGained(e);
  }
  editingStopped(e: ChangeEvent): void {
    this.$outer.completeEditing$boolean$boolean$boolean(false, false, true);
  }
  /**
   * Messaged when editing has been canceled in the tree.
   */
  editingCanceled(e: ChangeEvent): void {
    this.$outer.completeEditing$boolean$boolean$boolean(false, false, false);
  }
  valueChanged(event: TreeSelectionEvent): void {
    this.valueChangedOnPress = true;
    this.$outer.completeEditing$();
    if (this.$outer.tree.getExpandsSelectedPaths() && this.$outer.treeSelectionModel != null) {
      let paths = this.$outer.treeSelectionModel.getSelectionPaths();
      if (paths != null) {
        for (let counter = (paths.length - 1) | 0; counter >= 0; counter--) {
          let path = paths[counter].getParentPath();
          let expand = true;
          while (path != null) {
            if (this.$outer.treeModel.isLeaf(path.getLastPathComponent())) {
              expand = false;
              path = null;
            } else {
              path = path.getParentPath();
            }
          }
          if (expand) {
            this.$outer.tree.makeVisible(paths[counter]);
          }
        }
      }
    }
    let oldLead = this.$outer.getLeadSelectionPath();
    this.$outer.lastSelectedRow = this.$outer.tree.getMinSelectionRow();
    let lead = this.$outer.tree.getSelectionModel().getLeadSelectionPath();
    this.$outer.setAnchorSelectionPath(lead);
    this.$outer.setLeadSelectionPath$TreePath$BasicTreeUI(lead);
    let changedPaths = event.getPaths();
    let nodeBounds: Rectangle;
    let visRect = this.$outer.tree.getVisibleRect();
    let paintPaths = true;
    let nWidth = this.$outer.tree.getWidth();
    if (changedPaths != null) {
      let counter: number;
      let maxCounter = changedPaths.length;
      if (maxCounter > 4) {
        this.$outer.tree.repaint$();
        paintPaths = false;
      } else {
        for (counter = 0; counter < maxCounter; counter++) {
          nodeBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, changedPaths[counter]);
          if (nodeBounds != null && visRect.intersects$Rectangle(nodeBounds)) {
            this.$outer.tree.repaint$int$int$int$int(0, nodeBounds.y_, nWidth, nodeBounds.height_);
          }
        }
      }
    }
    if (paintPaths) {
      nodeBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, oldLead);
      if (nodeBounds != null && visRect.intersects$Rectangle(nodeBounds)) {
        this.$outer.tree.repaint$int$int$int$int(0, nodeBounds.y_, nWidth, nodeBounds.height_);
      }
      nodeBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, lead);
      if (nodeBounds != null && visRect.intersects$Rectangle(nodeBounds)) {
        this.$outer.tree.repaint$int$int$int$int(0, nodeBounds.y_, nWidth, nodeBounds.height_);
      }
    }
  }
  treeExpanded(event: TreeExpansionEvent): void {
    if (event != null && this.$outer.tree != null) {
      let path = event.getPath();
      this.$outer.updateExpandedDescendants(path);
    }
  }
  treeCollapsed(event: TreeExpansionEvent): void {
    if (event != null && this.$outer.tree != null) {
      let path = event.getPath();
      this.$outer.completeEditing$();
      if (path != null && this.$outer.tree.isVisible$TreePath(path)) {
        this.$outer.treeState.setExpandedState(path, false);
        this.$outer.updateLeadSelectionRow();
        this.$outer.updateSize();
      }
    }
  }
  treeNodesChanged(e: TreeModelEvent): void {
    if (this.$outer.treeState != null && e != null) {
      let parentPath = SwingUtilities2.getTreePath(e, this.$outer.getModel());
      let indices = e.getChildIndices();
      if (indices == null || indices.length === 0) {
        this.$outer.treeState.treeNodesChanged(e);
        this.$outer.updateSize();
      } else if (this.$outer.treeState.isExpanded(parentPath)) {
        let minIndex = indices[0];
        for (let i = (indices.length - 1) | 0; i > 0; i--) {
          minIndex = Math.min(indices[i], minIndex);
        }
        let minChild = this.$outer.treeModel.getChild(parentPath.getLastPathComponent(), minIndex);
        let minPath = parentPath.pathByAddingChild(minChild);
        let minBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, minPath);
        this.$outer.treeState.treeNodesChanged(e);
        this.$outer.updateSize0();
        let newMinBounds = this.$outer.getPathBounds$JTree$TreePath(this.$outer.tree, minPath);
        if (minBounds == null || newMinBounds == null) {
          return;
        }
        if (indices.length === 1 && newMinBounds.height_ === minBounds.height_) {
          this.$outer.tree.repaint$int$int$int$int(0, minBounds.y_, this.$outer.tree.getWidth(), minBounds.height_);
        } else {
          this.$outer.tree.repaint$int$int$int$int(0, minBounds.y_, this.$outer.tree.getWidth(), (this.$outer.tree.getHeight() - minBounds.y_) | 0);
        }
      } else {
        this.$outer.treeState.treeNodesChanged(e);
      }
    }
  }
}

export class BasicTreeUI$Actions extends UIAction {
  static readonly SELECT_PREVIOUS: string = 'selectPrevious';
  static readonly SELECT_PREVIOUS_CHANGE_LEAD: string = 'selectPreviousChangeLead';
  static readonly SELECT_PREVIOUS_EXTEND_SELECTION: string = 'selectPreviousExtendSelection';
  static readonly SELECT_NEXT: string = 'selectNext';
  static readonly SELECT_NEXT_CHANGE_LEAD: string = 'selectNextChangeLead';
  static readonly SELECT_NEXT_EXTEND_SELECTION: string = 'selectNextExtendSelection';
  static readonly SELECT_CHILD: string = 'selectChild';
  static readonly SELECT_CHILD_CHANGE_LEAD: string = 'selectChildChangeLead';
  static readonly SELECT_PARENT: string = 'selectParent';
  static readonly SELECT_PARENT_CHANGE_LEAD: string = 'selectParentChangeLead';
  static readonly SCROLL_UP_CHANGE_SELECTION: string = 'scrollUpChangeSelection';
  static readonly SCROLL_UP_CHANGE_LEAD: string = 'scrollUpChangeLead';
  static readonly SCROLL_UP_EXTEND_SELECTION: string = 'scrollUpExtendSelection';
  static readonly SCROLL_DOWN_CHANGE_SELECTION: string = 'scrollDownChangeSelection';
  static readonly SCROLL_DOWN_EXTEND_SELECTION: string = 'scrollDownExtendSelection';
  static readonly SCROLL_DOWN_CHANGE_LEAD: string = 'scrollDownChangeLead';
  static readonly SELECT_FIRST: string = 'selectFirst';
  static readonly SELECT_FIRST_CHANGE_LEAD: string = 'selectFirstChangeLead';
  static readonly SELECT_FIRST_EXTEND_SELECTION: string = 'selectFirstExtendSelection';
  static readonly SELECT_LAST: string = 'selectLast';
  static readonly SELECT_LAST_CHANGE_LEAD: string = 'selectLastChangeLead';
  static readonly SELECT_LAST_EXTEND_SELECTION: string = 'selectLastExtendSelection';
  static readonly TOGGLE: string = 'toggle';
  static readonly CANCEL_EDITING: string = 'cancel';
  static readonly START_EDITING: string = 'startEditing';
  static readonly SELECT_ALL: string = 'selectAll';
  static readonly CLEAR_SELECTION: string = 'clearSelection';
  static readonly SCROLL_LEFT: string = 'scrollLeft';
  static readonly SCROLL_RIGHT: string = 'scrollRight';
  static readonly SCROLL_LEFT_EXTEND_SELECTION: string = 'scrollLeftExtendSelection';
  static readonly SCROLL_RIGHT_EXTEND_SELECTION: string = 'scrollRightExtendSelection';
  static readonly SCROLL_RIGHT_CHANGE_LEAD: string = 'scrollRightChangeLead';
  static readonly SCROLL_LEFT_CHANGE_LEAD: string = 'scrollLeftChangeLead';
  static readonly EXPAND: string = 'expand';
  static readonly COLLAPSE: string = 'collapse';
  static readonly MOVE_SELECTION_TO_PARENT: string = 'moveSelectionToParent';
  static readonly ADD_TO_SELECTION: string = 'addToSelection';
  static readonly TOGGLE_AND_ANCHOR: string = 'toggleAndAnchor';
  static readonly EXTEND_TO: string = 'extendTo';
  static readonly MOVE_SELECTION_TO: string = 'moveSelectionTo';
  _BasicTreeUI$Actions$(): this {
    this._UIAction(null);
    return this;
  }
  _BasicTreeUI$Actions$String(key: string): this {
    this._UIAction(key);
    return this;
  }
  accept(o: any): boolean {
    if (o instanceof JTree) {
      if (this.getName() === BasicTreeUI$Actions.CANCEL_EDITING) {
        return (o).isEditing();
      }
    }
    return true;
  }
  actionPerformed(e: ActionEvent): void {
    let tree = e.getSource();
    let ui = BasicLookAndFeel.getUIOfType(tree.getUI(), $J.cls(BasicTreeUI));
    if (ui == null) {
      return;
    }
    let key = this.getName();
    if (key === BasicTreeUI$Actions.SELECT_PREVIOUS) {
      this.increment(tree, ui, -1, false, true);
    } else if (key === BasicTreeUI$Actions.SELECT_PREVIOUS_CHANGE_LEAD) {
      this.increment(tree, ui, -1, false, false);
    } else if (key === BasicTreeUI$Actions.SELECT_PREVIOUS_EXTEND_SELECTION) {
      this.increment(tree, ui, -1, true, true);
    } else if (key === BasicTreeUI$Actions.SELECT_NEXT) {
      this.increment(tree, ui, 1, false, true);
    } else if (key === BasicTreeUI$Actions.SELECT_NEXT_CHANGE_LEAD) {
      this.increment(tree, ui, 1, false, false);
    } else if (key === BasicTreeUI$Actions.SELECT_NEXT_EXTEND_SELECTION) {
      this.increment(tree, ui, 1, true, true);
    } else if (key === BasicTreeUI$Actions.SELECT_CHILD) {
      this.traverse(tree, ui, 1, true);
    } else if (key === BasicTreeUI$Actions.SELECT_CHILD_CHANGE_LEAD) {
      this.traverse(tree, ui, 1, false);
    } else if (key === BasicTreeUI$Actions.SELECT_PARENT) {
      this.traverse(tree, ui, -1, true);
    } else if (key === BasicTreeUI$Actions.SELECT_PARENT_CHANGE_LEAD) {
      this.traverse(tree, ui, -1, false);
    } else if (key === BasicTreeUI$Actions.SCROLL_UP_CHANGE_SELECTION) {
      this.page(tree, ui, -1, false, true);
    } else if (key === BasicTreeUI$Actions.SCROLL_UP_CHANGE_LEAD) {
      this.page(tree, ui, -1, false, false);
    } else if (key === BasicTreeUI$Actions.SCROLL_UP_EXTEND_SELECTION) {
      this.page(tree, ui, -1, true, true);
    } else if (key === BasicTreeUI$Actions.SCROLL_DOWN_CHANGE_SELECTION) {
      this.page(tree, ui, 1, false, true);
    } else if (key === BasicTreeUI$Actions.SCROLL_DOWN_EXTEND_SELECTION) {
      this.page(tree, ui, 1, true, true);
    } else if (key === BasicTreeUI$Actions.SCROLL_DOWN_CHANGE_LEAD) {
      this.page(tree, ui, 1, false, false);
    } else if (key === BasicTreeUI$Actions.SELECT_FIRST) {
      this.home(tree, ui, -1, false, true);
    } else if (key === BasicTreeUI$Actions.SELECT_FIRST_CHANGE_LEAD) {
      this.home(tree, ui, -1, false, false);
    } else if (key === BasicTreeUI$Actions.SELECT_FIRST_EXTEND_SELECTION) {
      this.home(tree, ui, -1, true, true);
    } else if (key === BasicTreeUI$Actions.SELECT_LAST) {
      this.home(tree, ui, 1, false, true);
    } else if (key === BasicTreeUI$Actions.SELECT_LAST_CHANGE_LEAD) {
      this.home(tree, ui, 1, false, false);
    } else if (key === BasicTreeUI$Actions.SELECT_LAST_EXTEND_SELECTION) {
      this.home(tree, ui, 1, true, true);
    } else if (key === BasicTreeUI$Actions.TOGGLE) {
      this.toggle(tree, ui);
    } else if (key === BasicTreeUI$Actions.CANCEL_EDITING) {
      this.cancelEditing(tree, ui);
    } else if (key === BasicTreeUI$Actions.START_EDITING) {
      this.startEditing(tree, ui);
    } else if (key === BasicTreeUI$Actions.SELECT_ALL) {
      this.selectAll(tree, ui, true);
    } else if (key === BasicTreeUI$Actions.CLEAR_SELECTION) {
      this.selectAll(tree, ui, false);
    } else if (key === BasicTreeUI$Actions.ADD_TO_SELECTION) {
      if (ui.getRowCount(tree) > 0) {
        let lead = ui.getLeadSelectionRow();
        if (!tree.isRowSelected(lead)) {
          let aPath = ui.getAnchorSelectionPath();
          tree.addSelectionRow(lead);
          ui.setAnchorSelectionPath(aPath);
        }
      }
    } else if (key === BasicTreeUI$Actions.TOGGLE_AND_ANCHOR) {
      if (ui.getRowCount(tree) > 0) {
        let lead = ui.getLeadSelectionRow();
        let lPath = ui.getLeadSelectionPath();
        if (!tree.isRowSelected(lead)) {
          tree.addSelectionRow(lead);
        } else {
          tree.removeSelectionRow(lead);
          ui.setLeadSelectionPath$TreePath$BasicTreeUI(lPath);
        }
        ui.setAnchorSelectionPath(lPath);
      }
    } else if (key === BasicTreeUI$Actions.EXTEND_TO) {
      this.extendSelection(tree, ui);
    } else if (key === BasicTreeUI$Actions.MOVE_SELECTION_TO) {
      if (ui.getRowCount(tree) > 0) {
        let lead = ui.getLeadSelectionRow();
        tree.setSelectionInterval(lead, lead);
      }
    } else if (key === BasicTreeUI$Actions.SCROLL_LEFT) {
      this.scroll(tree, ui, SwingConstants.HORIZONTAL, -10);
    } else if (key === BasicTreeUI$Actions.SCROLL_RIGHT) {
      this.scroll(tree, ui, SwingConstants.HORIZONTAL, 10);
    } else if (key === BasicTreeUI$Actions.SCROLL_LEFT_EXTEND_SELECTION) {
      this.scrollChangeSelection(tree, ui, -1, true, true);
    } else if (key === BasicTreeUI$Actions.SCROLL_RIGHT_EXTEND_SELECTION) {
      this.scrollChangeSelection(tree, ui, 1, true, true);
    } else if (key === BasicTreeUI$Actions.SCROLL_RIGHT_CHANGE_LEAD) {
      this.scrollChangeSelection(tree, ui, 1, false, false);
    } else if (key === BasicTreeUI$Actions.SCROLL_LEFT_CHANGE_LEAD) {
      this.scrollChangeSelection(tree, ui, -1, false, false);
    } else if (key === BasicTreeUI$Actions.EXPAND) {
      this.expand(tree, ui);
    } else if (key === BasicTreeUI$Actions.COLLAPSE) {
      this.collapse(tree, ui);
    } else if (key === BasicTreeUI$Actions.MOVE_SELECTION_TO_PARENT) {
      this.moveSelectionToParent(tree, ui);
    }
  }
  scrollChangeSelection(tree: JTree, ui: BasicTreeUI, direction: number, addToSelection: boolean, changeSelection: boolean): void {
    let rowCount: number;
    if ((rowCount = ui.getRowCount(tree)) > 0 && ui.treeSelectionModel != null) {
      let newPath: TreePath;
      let visRect = tree.getVisibleRect();
      if (direction === -1) {
        newPath = ui.getClosestPathForLocation(tree, visRect.x_, visRect.y_);
        visRect.x_ = Math.max(0, (visRect.x_ - visRect.width_) | 0);
      } else {
        visRect.x_ = Math.min(Math.max(0, (tree.getWidth() - visRect.width_) | 0), (visRect.x_ + visRect.width_) | 0);
        newPath = ui.getClosestPathForLocation(tree, visRect.x_, (visRect.y_ + visRect.height_) | 0);
      }
      tree.scrollRectToVisible(visRect);
      if (addToSelection) {
        ui.extendSelection(newPath);
      } else if (changeSelection) {
        tree.setSelectionPath(newPath);
      } else {
        ui.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(newPath, true);
      }
    }
  }
  scroll(component: JTree, ui: BasicTreeUI, direction: number, amount: number): void {
    let visRect = component.getVisibleRect();
    let size = component.getSize$();
    if (direction === SwingConstants.HORIZONTAL) {
      visRect.x_ = (visRect.x_ + amount) | 0;
      visRect.x_ = Math.max(0, visRect.x_);
      visRect.x_ = Math.min(Math.max(0, (size.width_ - visRect.width_) | 0), visRect.x_);
    } else {
      visRect.y_ = (visRect.y_ + amount) | 0;
      visRect.y_ = Math.max(0, visRect.y_);
      visRect.y_ = Math.min(Math.max(0, (size.width_ - visRect.height_) | 0), visRect.y_);
    }
    component.scrollRectToVisible(visRect);
  }
  extendSelection(tree: JTree, ui: BasicTreeUI): void {
    if (ui.getRowCount(tree) > 0) {
      let lead = ui.getLeadSelectionRow();
      if (lead !== -1) {
        let leadP = ui.getLeadSelectionPath();
        let aPath = ui.getAnchorSelectionPath();
        let aRow = ui.getRowForPath(tree, aPath);
        if (aRow === -1) {
          aRow = 0;
        }
        tree.setSelectionInterval(aRow, lead);
        ui.setLeadSelectionPath$TreePath$BasicTreeUI(leadP);
        ui.setAnchorSelectionPath(aPath);
      }
    }
  }
  selectAll(tree: JTree, ui: BasicTreeUI, selectAll: boolean): void {
    let rowCount = ui.getRowCount(tree);
    if (rowCount > 0) {
      if (selectAll) {
        if (tree.getSelectionModel().getSelectionMode() === TreeSelectionModel.SINGLE_TREE_SELECTION) {
          let lead = ui.getLeadSelectionRow();
          if (lead !== -1) {
            tree.setSelectionRow(lead);
          } else if (tree.getMinSelectionRow() === -1) {
            tree.setSelectionRow(0);
            ui.ensureRowsAreVisible(0, 0);
          }
          return;
        }
        let lastPath = ui.getLeadSelectionPath();
        let aPath = ui.getAnchorSelectionPath();
        if (lastPath != null && !tree.isVisible$TreePath(lastPath)) {
          lastPath = null;
        }
        tree.setSelectionInterval(0, (rowCount - 1) | 0);
        if (lastPath != null) {
          ui.setLeadSelectionPath$TreePath$BasicTreeUI(lastPath);
        }
        if (aPath != null && tree.isVisible$TreePath(aPath)) {
          ui.setAnchorSelectionPath(aPath);
        }
      } else {
        let lastPath = ui.getLeadSelectionPath();
        let aPath = ui.getAnchorSelectionPath();
        tree.clearSelection();
        ui.setAnchorSelectionPath(aPath);
        ui.setLeadSelectionPath$TreePath$BasicTreeUI(lastPath);
      }
    }
  }
  startEditing(tree: JTree, ui: BasicTreeUI): void {
    let lead = ui.getLeadSelectionPath();
    let editRow = (lead != null) ? ui.getRowForPath(tree, lead) : -1;
    if (editRow !== -1) {
      tree.startEditingAtPath(lead);
    }
  }
  cancelEditing(tree: JTree, ui: BasicTreeUI): void {
    tree.cancelEditing();
  }
  toggle(tree: JTree, ui: BasicTreeUI): void {
    let selRow = ui.getLeadSelectionRow();
    if (selRow !== -1 && !ui.isLeaf(selRow)) {
      let aPath = ui.getAnchorSelectionPath();
      let lPath = ui.getLeadSelectionPath();
      ui.toggleExpandState(ui.getPathForRow(tree, selRow));
      ui.setAnchorSelectionPath(aPath);
      ui.setLeadSelectionPath$TreePath$BasicTreeUI(lPath);
    }
  }
  expand(tree: JTree, ui: BasicTreeUI): void {
    let selRow = ui.getLeadSelectionRow();
    tree.expandRow(selRow);
  }
  collapse(tree: JTree, ui: BasicTreeUI): void {
    let selRow = ui.getLeadSelectionRow();
    tree.collapseRow(selRow);
  }
  increment(tree: JTree, ui: BasicTreeUI, direction: number, addToSelection: boolean, changeSelection: boolean): void {
    if (!addToSelection && !changeSelection && tree.getSelectionModel().getSelectionMode() !== TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION) {
      changeSelection = true;
    }
    let rowCount: number;
    if (ui.treeSelectionModel != null && (rowCount = tree.getRowCount()) > 0) {
      let selIndex = ui.getLeadSelectionRow();
      let newIndex: number;
      if (selIndex === -1) {
        if (direction === 1) {
          newIndex = 0;
        } else {
          newIndex = (rowCount - 1) | 0;
        }
      } else {
        newIndex = Math.min((rowCount - 1) | 0, Math.max(0, ((selIndex + direction) | 0)));
      }
      if (addToSelection && ui.treeSelectionModel.getSelectionMode() !== TreeSelectionModel.SINGLE_TREE_SELECTION) {
        ui.extendSelection(tree.getPathForRow(newIndex));
      } else if (changeSelection) {
        tree.setSelectionInterval(newIndex, newIndex);
      } else {
        ui.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(tree.getPathForRow(newIndex), true);
      }
      ui.ensureRowsAreVisible(newIndex, newIndex);
      ui.lastSelectedRow = newIndex;
    }
  }
  traverse(tree: JTree, ui: BasicTreeUI, direction: number, changeSelection: boolean): void {
    if (!changeSelection && tree.getSelectionModel().getSelectionMode() !== TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION) {
      changeSelection = true;
    }
    let rowCount: number;
    if ((rowCount = tree.getRowCount()) > 0) {
      let minSelIndex = ui.getLeadSelectionRow();
      let newIndex: number;
      if (minSelIndex === -1) {
        newIndex = 0;
      } else {
        if (direction === 1) {
          let minSelPath = ui.getPathForRow(tree, minSelIndex);
          let childCount = tree.getModel().getChildCount(minSelPath.getLastPathComponent());
          newIndex = -1;
          if (!ui.isLeaf(minSelIndex)) {
            if (!tree.isExpanded$int(minSelIndex)) {
              ui.toggleExpandState(minSelPath);
            } else if (childCount > 0) {
              newIndex = Math.min((minSelIndex + 1) | 0, (rowCount - 1) | 0);
            }
          }
        } else {
          if (!ui.isLeaf(minSelIndex) && tree.isExpanded$int(minSelIndex)) {
            ui.toggleExpandState(ui.getPathForRow(tree, minSelIndex));
            newIndex = -1;
          } else {
            let path = ui.getPathForRow(tree, minSelIndex);
            if (path != null && path.getPathCount() > 1) {
              newIndex = ui.getRowForPath(tree, path.getParentPath());
            } else {
              newIndex = -1;
            }
          }
        }
      }
      if (newIndex !== -1) {
        if (changeSelection) {
          tree.setSelectionInterval(newIndex, newIndex);
        } else {
          ui.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(ui.getPathForRow(tree, newIndex), true);
        }
        ui.ensureRowsAreVisible(newIndex, newIndex);
      }
    }
  }
  moveSelectionToParent(tree: JTree, ui: BasicTreeUI): void {
    let selRow = ui.getLeadSelectionRow();
    let path = ui.getPathForRow(tree, selRow);
    if (path != null && path.getPathCount() > 1) {
      let newIndex = ui.getRowForPath(tree, path.getParentPath());
      if (newIndex !== -1) {
        tree.setSelectionInterval(newIndex, newIndex);
        ui.ensureRowsAreVisible(newIndex, newIndex);
      }
    }
  }
  page(tree: JTree, ui: BasicTreeUI, direction: number, addToSelection: boolean, changeSelection: boolean): void {
    if (!addToSelection && !changeSelection && tree.getSelectionModel().getSelectionMode() !== TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION) {
      changeSelection = true;
    }
    let rowCount: number;
    if ((rowCount = ui.getRowCount(tree)) > 0 && ui.treeSelectionModel != null) {
      let maxSize = tree.getSize$();
      let lead = ui.getLeadSelectionPath();
      let newPath: TreePath;
      let visRect = tree.getVisibleRect();
      if (direction === -1) {
        newPath = ui.getClosestPathForLocation(tree, visRect.x_, visRect.y_);
        if (newPath.equals(lead)) {
          visRect.y_ = Math.max(0, (visRect.y_ - visRect.height_) | 0);
          newPath = tree.getClosestPathForLocation(visRect.x_, visRect.y_);
        }
      } else {
        visRect.y_ = Math.min(maxSize.height_, (visRect.y_ + visRect.height_ - 1) | 0);
        newPath = tree.getClosestPathForLocation(visRect.x_, visRect.y_);
        if (newPath.equals(lead)) {
          visRect.y_ = Math.min(maxSize.height_, (visRect.y_ + visRect.height_ - 1) | 0);
          newPath = tree.getClosestPathForLocation(visRect.x_, visRect.y_);
        }
      }
      let newRect = ui.getPathBounds$JTree$TreePath(tree, newPath);
      if (newRect != null) {
        newRect.x_ = visRect.x_;
        newRect.width_ = visRect.width_;
        if (direction === -1) {
          newRect.height_ = visRect.height_;
        } else {
          newRect.y_ = (newRect.y_ - (visRect.height_ - newRect.height_)) | 0;
          newRect.height_ = visRect.height_;
        }
        if (addToSelection) {
          ui.extendSelection(newPath);
        } else if (changeSelection) {
          tree.setSelectionPath(newPath);
        } else {
          ui.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(newPath, true);
        }
        tree.scrollRectToVisible(newRect);
      }
    }
  }
  home(tree: JTree, ui: BasicTreeUI, direction: number, addToSelection: boolean, changeSelection: boolean): void {
    if (!addToSelection && !changeSelection && tree.getSelectionModel().getSelectionMode() !== TreeSelectionModel.DISCONTIGUOUS_TREE_SELECTION) {
      changeSelection = true;
    }
    let rowCount = ui.getRowCount(tree);
    if (rowCount > 0) {
      if (direction === -1) {
        ui.ensureRowsAreVisible(0, 0);
        if (addToSelection) {
          let aPath = ui.getAnchorSelectionPath();
          let aRow = (aPath == null) ? -1 : ui.getRowForPath(tree, aPath);
          if (aRow === -1) {
            tree.setSelectionInterval(0, 0);
          } else {
            tree.setSelectionInterval(0, aRow);
            ui.setAnchorSelectionPath(aPath);
            ui.setLeadSelectionPath$TreePath$BasicTreeUI(ui.getPathForRow(tree, 0));
          }
        } else if (changeSelection) {
          tree.setSelectionInterval(0, 0);
        } else {
          ui.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(ui.getPathForRow(tree, 0), true);
        }
      } else {
        ui.ensureRowsAreVisible((rowCount - 1) | 0, (rowCount - 1) | 0);
        if (addToSelection) {
          let aPath = ui.getAnchorSelectionPath();
          let aRow = (aPath == null) ? -1 : ui.getRowForPath(tree, aPath);
          if (aRow === -1) {
            tree.setSelectionInterval((rowCount - 1) | 0, (rowCount - 1) | 0);
          } else {
            tree.setSelectionInterval(aRow, (rowCount - 1) | 0);
            ui.setAnchorSelectionPath(aPath);
            ui.setLeadSelectionPath$TreePath$BasicTreeUI(ui.getPathForRow(tree, (rowCount - 1) | 0));
          }
        } else if (changeSelection) {
          tree.setSelectionInterval((rowCount - 1) | 0, (rowCount - 1) | 0);
        } else {
          ui.setLeadSelectionPath$TreePath$boolean$BasicTreeUI(ui.getPathForRow(tree, (rowCount - 1) | 0), true);
        }
        if (ui.isLargeModel()) {
          SwingUtilities.invokeLater(() => {
            ui.ensureRowsAreVisible((rowCount - 1) | 0, (rowCount - 1) | 0);
          });
        }
      }
    }
  }
}

$J.define(BasicTreeUI, 'javax.swing.plaf.basic.BasicTreeUI', { kind: 'class', sup: 'javax.swing.plaf.TreeUI', ctors: { '': '_BasicTreeUI' }, meths: { 'setLeadSelectionPath(javax.swing.tree.TreePath,boolean)': 'setLeadSelectionPath$TreePath$boolean$BasicTreeUI', 'setLeadSelectionPath(javax.swing.tree.TreePath)': 'setLeadSelectionPath$TreePath$BasicTreeUI', 'isLocationInExpandControl(javax.swing.tree.TreePath,int,int)': 'isLocationInExpandControl$TreePath$int$int', 'completeEditing(boolean,boolean,boolean)': 'completeEditing$boolean$boolean$boolean', 'completeEditing()': 'completeEditing$', 'getPreferredSize(javax.swing.JComponent,boolean)': 'getPreferredSize$JComponent$boolean', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent', 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'getPathBounds(javax.swing.tree.TreePath,java.awt.Insets,java.awt.Rectangle)': 'getPathBounds$TreePath$Insets$Rectangle$BasicTreeUI', 'getPathBounds(javax.swing.JTree,javax.swing.tree.TreePath)': 'getPathBounds$JTree$TreePath' }, clinit: true, lazy: ['BASELINE_COMPONENT_KEY', 'SHARED_ACTION', 'defaultTransferHandler'] });
$J.define(BasicTreeUI$ComponentHandler, 'javax.swing.plaf.basic.BasicTreeUI$ComponentHandler', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.awt.event.ComponentAdapter', ctors: { '': '_BasicTreeUI$ComponentHandler' }, inner: true });
$J.define(BasicTreeUI$NodeDimensionsHandler, 'javax.swing.plaf.basic.BasicTreeUI$NodeDimensionsHandler', { kind: 'class', sup: 'javax.swing.tree.AbstractLayoutCache$NodeDimensions', ctors: { '': '_BasicTreeUI$NodeDimensionsHandler' }, inner: true });
$J.define(BasicTreeUI$MouseInputHandler, 'javax.swing.plaf.basic.BasicTreeUI$MouseInputHandler', { kind: 'class', ifaces: ['javax.swing.event.MouseInputListener'], sup: 'java.lang.Object', ctors: { 'java.awt.Component,java.awt.Component,java.awt.event.MouseEvent,java.awt.Component': '_BasicTreeUI$MouseInputHandler$Component$Component$MouseEvent$Component', 'java.awt.Component,java.awt.Component,java.awt.event.MouseEvent': '_BasicTreeUI$MouseInputHandler$Component$Component$MouseEvent' }, inner: true });
$J.define(BasicTreeUI$TreeTransferHandler, 'javax.swing.plaf.basic.BasicTreeUI$TreeTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource', 'java.util.Comparator'], sup: 'javax.swing.TransferHandler', ctors: { '': '_BasicTreeUI$TreeTransferHandler' } });
$J.define(BasicTreeUI$Handler, 'javax.swing.plaf.basic.BasicTreeUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.CellEditorListener', 'java.awt.event.FocusListener', 'java.awt.event.KeyListener', 'java.awt.event.MouseListener', 'java.awt.event.MouseMotionListener', 'java.beans.PropertyChangeListener', 'javax.swing.event.TreeExpansionListener', 'javax.swing.event.TreeModelListener', 'javax.swing.event.TreeSelectionListener', 'javax.swing.plaf.basic.DragRecognitionSupport$BeforeDrag'], sup: 'java.lang.Object', ctors: { '': '_BasicTreeUI$Handler' }, inner: true });
$J.define(BasicTreeUI$Actions, 'javax.swing.plaf.basic.BasicTreeUI$Actions', { kind: 'class', sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_BasicTreeUI$Actions$String', '': '_BasicTreeUI$Actions$' } });
$J.module(() => {
  BasicStroke = $J.load('java.awt.BasicStroke');
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  MouseMotionListener = $J.load('java.awt.event.MouseMotionListener');
  CellRendererPane = $J.load('javax.swing.CellRendererPane');
  JComponent = $J.load('javax.swing.JComponent');
  JScrollPane = $J.load('javax.swing.JScrollPane');
  JTextField = $J.load('javax.swing.JTextField');
  JTree = $J.load('javax.swing.JTree');
  JViewport = $J.load('javax.swing.JViewport');
  KeyStroke = $J.load('javax.swing.KeyStroke');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicLookAndFeel = $J.load('javax.swing.plaf.basic.BasicLookAndFeel');
  BasicTransferable = $J.load('javax.swing.plaf.basic.BasicTransferable');
  DragRecognitionSupport = $J.load('javax.swing.plaf.basic.DragRecognitionSupport');
  LazyActionMap = $J.load('javax.swing.plaf.basic.LazyActionMap');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  DefaultTreeCellEditor = $J.load('javax.swing.tree.DefaultTreeCellEditor');
  DefaultTreeCellRenderer = $J.load('javax.swing.tree.DefaultTreeCellRenderer');
  FixedHeightLayoutCache = $J.load('javax.swing.tree.FixedHeightLayoutCache');
  TreePath = $J.load('javax.swing.tree.TreePath');
  TreeSelectionModel = $J.load('javax.swing.tree.TreeSelectionModel');
  VariableHeightLayoutCache = $J.load('javax.swing.tree.VariableHeightLayoutCache');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
