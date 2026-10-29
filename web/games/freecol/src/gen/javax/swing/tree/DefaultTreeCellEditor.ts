// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/DefaultTreeCellEditor.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject } from '../../../../jre/index.ts';
import { JTextField } from '../JTextField.ts';
import { Container } from '../../../java/awt/Container.ts';

let Dimension, MouseEvent, DefaultCellEditor, JTree, SwingUtilities, Timer, UIManager, FontUIResource;

/**
 * A <code>TreeCellEditor</code>. You need to supply an
 * instance of <code>DefaultTreeCellRenderer</code>
 * so that the icons can be obtained. You can optionally supply
 * a <code>TreeCellEditor</code> that will be laid out according
 * to the icon in the <code>DefaultTreeCellRenderer</code>.
 * If you do not supply a <code>TreeCellEditor</code>,
 * a <code>TextField</code> will be used. Editing is started
 * on a triple mouse click, or after a click, pause, click and
 * a delay of 1200 milliseconds.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 *
 * @see javax.swing.JTree
 *
 * @author Scott Violet
 */
export class DefaultTreeCellEditor extends JObject {
  /**
   * Editor handling the editing.
   */
  realEditor: TreeCellEditor = null;
  /**
   * Renderer, used to get border and offsets from.
   */
  renderer: DefaultTreeCellRenderer = null;
  /**
   * Editing container, will contain the <code>editorComponent</code>.
   */
  editingContainer: Container = null;
  /**
   * Component used in editing, obtained from the
   * <code>editingContainer</code>.
   */
  editingComponent: Component = null;
  /**
   * As of Java 2 platform v1.4 this field should no longer be used. If
   * you wish to provide similar behavior you should directly override
   * <code>isCellEditable</code>.
   */
  canEdit: boolean = false;
  /**
   * Used in editing. Indicates x position to place
   * <code>editingComponent</code>.
   */
  offset: number = 0;
  /**
   * <code>JTree</code> instance listening too.
   */
  tree: JTree = null;
  /**
   * Last path that was selected.
   */
  lastPath: TreePath = null;
  /**
   * Used before starting the editing session.
   */
  timer: Timer = null;
  /**
   * Row that was last passed into
   * <code>getTreeCellEditorComponent</code>.
   */
  lastRow: number = 0;
  /**
   * True if the border selection color should be drawn.
   */
  borderSelectionColor: Color = null;
  /**
   * Icon to use when editing.
   */
  editingIcon: Icon = null;
  /**
   * Font to paint with, <code>null</code> indicates
   * font of renderer is to be used.
   */
  font: Font = null;
  /**
   * Constructs a <code>DefaultTreeCellEditor</code>
   * object for a JTree using the specified renderer and
   * a default editor. (Use this constructor for normal editing.)
   *
   * @param tree      a <code>JTree</code> object
   * @param renderer  a <code>DefaultTreeCellRenderer</code> object
   */
  _DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer(tree: JTree, renderer: DefaultTreeCellRenderer): this {
    this._DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer$TreeCellEditor(tree, renderer, null);
    return this;
  }
  /**
   * Constructs a <code>DefaultTreeCellEditor</code>
   * object for a <code>JTree</code> using the
   * specified renderer and the specified editor. (Use this constructor
   * for specialized editing.)
   *
   * @param tree      a <code>JTree</code> object
   * @param renderer  a <code>DefaultTreeCellRenderer</code> object
   * @param editor    a <code>TreeCellEditor</code> object
   */
  _DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer$TreeCellEditor(tree: JTree, renderer: DefaultTreeCellRenderer, editor: TreeCellEditor): this {
    this.renderer = renderer;
    this.realEditor = editor;
    if (this.realEditor == null) {
      this.realEditor = this.createTreeCellEditor();
    }
    this.editingContainer = this.createContainer();
    this.setTree(tree);
    this.setBorderSelectionColor(UIManager.getColor$Object('Tree.editorBorderSelectionColor'));
    return this;
  }
  /**
   * Sets the color to use for the border.
   * @param newColor the new border color
   */
  setBorderSelectionColor(newColor: Color): void {
    this.borderSelectionColor = newColor;
  }
  /**
   * Returns the color the border is drawn.
   * @return the border selection color
   */
  getBorderSelectionColor(): Color {
    return this.borderSelectionColor;
  }
  /**
   * Gets the font used for editing.
   *
   * @return the editing <code>Font</code>
   * @see #setFont
   */
  getFont(): Font {
    return this.font;
  }
  /**
   * Configures the editor.  Passed onto the <code>realEditor</code>.
   */
  getTreeCellEditorComponent(tree: JTree, value: any, isSelected: boolean, expanded: boolean, leaf: boolean, row: number): Component {
    this.setTree(tree);
    this.lastRow = row;
    this.determineOffset(tree, value, isSelected, expanded, leaf, row);
    if (this.editingComponent != null) {
      this.editingContainer.remove$Component(this.editingComponent);
    }
    this.editingComponent = this.realEditor.getTreeCellEditorComponent(tree, value, isSelected, expanded, leaf, row);
    let newPath = tree.getPathForRow(row);
    this.canEdit = (this.lastPath != null && newPath != null && this.lastPath.equals(newPath));
    let font = this.getFont();
    if (font == null) {
      if (this.renderer != null) {
        font = this.renderer.getFont();
      }
      if (font == null) {
        font = tree.getFont();
      }
    }
    this.editingContainer.setFont(font);
    this.prepareForEditing();
    return this.editingContainer;
  }
  /**
   * Returns the value currently being edited.
   * @return the value currently being edited
   */
  getCellEditorValue(): any {
    return this.realEditor.getCellEditorValue();
  }
  /**
   * If the <code>realEditor</code> returns true to this
   * message, <code>prepareForEditing</code>
   * is messaged and true is returned.
   */
  isCellEditable(event: EventObject): boolean {
    let retValue = false;
    let editable = false;
    if (event != null) {
      if (event.getSource() instanceof JTree) {
        this.setTree(event.getSource());
        if (event instanceof MouseEvent) {
          let path = this.tree.getPathForLocation((event).getX(), (event).getY());
          editable = (this.lastPath != null && path != null && this.lastPath.equals(path));
          if (path != null) {
            this.lastRow = this.tree.getRowForPath(path);
            let value = path.getLastPathComponent();
            let isSelected = this.tree.isRowSelected(this.lastRow);
            let expanded = this.tree.isExpanded$TreePath(path);
            let treeModel = this.tree.getModel();
            let leaf = treeModel.isLeaf(value);
            this.determineOffset(this.tree, value, isSelected, expanded, leaf, this.lastRow);
          }
        }
      }
    }
    if (!this.realEditor.isCellEditable(event)) {
      return false;
    }
    if (this.canEditImmediately(event)) {
      retValue = true;
    } else if (editable && this.shouldStartEditingTimer(event)) {
      this.startEditingTimer();
    } else if (this.timer != null && this.timer.isRunning()) {
      this.timer.stop();
    }
    if (retValue) {
      this.prepareForEditing();
    }
    return retValue;
  }
  /**
   * Messages the <code>realEditor</code> for the return value.
   */
  shouldSelectCell(event: EventObject): boolean {
    return this.realEditor.shouldSelectCell(event);
  }
  /**
   * If the <code>realEditor</code> will allow editing to stop,
   * the <code>realEditor</code> is removed and true is returned,
   * otherwise false is returned.
   */
  stopCellEditing(): boolean {
    if (this.realEditor.stopCellEditing()) {
      this.cleanupAfterEditing();
      return true;
    }
    return false;
  }
  /**
   * Messages <code>cancelCellEditing</code> to the
   * <code>realEditor</code> and removes it from this instance.
   */
  cancelCellEditing(): void {
    this.realEditor.cancelCellEditing();
    this.cleanupAfterEditing();
  }
  /**
   * Adds the <code>CellEditorListener</code>.
   * @param l the listener to be added
   */
  addCellEditorListener(l: CellEditorListener): void {
    this.realEditor.addCellEditorListener(l);
  }
  /**
   * Removes the previously added <code>CellEditorListener</code>.
   * @param l the listener to be removed
   */
  removeCellEditorListener(l: CellEditorListener): void {
    this.realEditor.removeCellEditorListener(l);
  }
  /**
   * Resets <code>lastPath</code>.
   */
  valueChanged(e: TreeSelectionEvent): void {
    if (this.tree != null) {
      if (this.tree.getSelectionCount() === 1) {
        this.lastPath = this.tree.getSelectionPath();
      } else {
        this.lastPath = null;
      }
    }
    if (this.timer != null) {
      this.timer.stop();
    }
  }
  /**
   * Messaged when the timer fires, this will start the editing
   * session.
   */
  actionPerformed(e: ActionEvent): void {
    if (this.tree != null && this.lastPath != null) {
      this.tree.startEditingAtPath(this.lastPath);
    }
  }
  /**
   * Sets the tree currently editing for. This is needed to add
   * a selection listener.
   * @param newTree the new tree to be edited
   */
  setTree(newTree: JTree): void {
    if (this.tree !== newTree) {
      if (this.tree != null) {
        this.tree.removeTreeSelectionListener(this);
      }
      this.tree = newTree;
      if (this.tree != null) {
        this.tree.addTreeSelectionListener(this);
      }
      if (this.timer != null) {
        this.timer.stop();
      }
    }
  }
  /**
   * Returns true if <code>event</code> is a <code>MouseEvent</code>
   * and the click count is 1.
   *
   * @param event the event being studied
   * @return whether {@code event} should starts the editing timer
   */
  shouldStartEditingTimer(event: EventObject): boolean {
    if ((event instanceof MouseEvent) && SwingUtilities.isLeftMouseButton(event)) {
      let me = event;
      return (me.getClickCount() === 1 && this.inHitRegion(me.getX(), me.getY()));
    }
    return false;
  }
  /**
   * Starts the editing timer.
   */
  startEditingTimer(): void {
    if (this.timer == null) {
      this.timer = new Timer()._Timer(1200, $J.fn(this, 'actionPerformed'));
      this.timer.setRepeats(false);
    }
    this.timer.start();
  }
  /**
   * Returns true if <code>event</code> is <code>null</code>,
   * or it is a <code>MouseEvent</code> with a click count &gt; 2
   * and <code>inHitRegion</code> returns true.
   *
   * @param event the event being studied
   * @return whether editing can be started for the given {@code event}
   */
  canEditImmediately(event: EventObject): boolean {
    if ((event instanceof MouseEvent) && SwingUtilities.isLeftMouseButton(event)) {
      let me = event;
      return ((me.getClickCount() > 2) && this.inHitRegion(me.getX(), me.getY()));
    }
    return (event == null);
  }
  /**
   * Returns true if the passed in location is a valid mouse location
   * to start editing from. This is implemented to return false if
   * <code>x</code> is &lt;= the width of the icon and icon gap displayed
   * by the renderer. In other words this returns true if the user
   * clicks over the text part displayed by the renderer, and false
   * otherwise.
   * @param x the x-coordinate of the point
   * @param y the y-coordinate of the point
   * @return true if the passed in location is a valid mouse location
   */
  inHitRegion(x: number, y: number): boolean {
    if (this.lastRow !== -1 && this.tree != null) {
      let bounds = this.tree.getRowBounds(this.lastRow);
      let treeOrientation = this.tree.getComponentOrientation();
      if (treeOrientation.isLeftToRight()) {
        if (bounds != null && x <= ((bounds.x_ + this.offset) | 0) && this.offset < ((bounds.width_ - 5) | 0)) {
          return false;
        }
      } else if (bounds != null && (x >= ((bounds.x_ + bounds.width_ - this.offset + 5) | 0) || x <= ((bounds.x_ + 5) | 0)) && this.offset < ((bounds.width_ - 5) | 0)) {
        return false;
      }
    }
    return true;
  }
  /**
   * Determine the offset.
   * @param tree      a <code>JTree</code> object
   * @param value a value
   * @param isSelected selection status
   * @param expanded expansion status
   * @param leaf leaf status
   * @param row current row
   */
  determineOffset(tree: JTree, value: any, isSelected: boolean, expanded: boolean, leaf: boolean, row: number): void {
    if (this.renderer != null) {
      if (leaf) {
        this.editingIcon = this.renderer.getLeafIcon();
      } else if (expanded) {
        this.editingIcon = this.renderer.getOpenIcon();
      } else {
        this.editingIcon = this.renderer.getClosedIcon();
      }
      if (this.editingIcon != null) {
        this.offset = (this.renderer.getIconTextGap() + this.editingIcon.getIconWidth()) | 0;
      } else {
        this.offset = this.renderer.getIconTextGap();
      }
    } else {
      this.editingIcon = null;
      this.offset = 0;
    }
  }
  /**
   * Invoked just before editing is to start. Will add the
   * <code>editingComponent</code> to the
   * <code>editingContainer</code>.
   */
  prepareForEditing(): void {
    if (this.editingComponent != null) {
      this.editingContainer.add$Component(this.editingComponent);
    }
  }
  /**
   * Creates the container to manage placement of
   * <code>editingComponent</code>.
   *
   * @return new Container object
   */
  createContainer(): Container {
    return new DefaultTreeCellEditor$EditorContainer().$o(this)._DefaultTreeCellEditor$EditorContainer();
  }
  /**
   * This is invoked if a <code>TreeCellEditor</code>
   * is not supplied in the constructor.
   * It returns a <code>TextField</code> editor.
   * @return a new <code>TextField</code> editor
   */
  createTreeCellEditor(): TreeCellEditor {
    let aBorder = UIManager.getBorder$Object('Tree.editorBorder');
    let editor = new (DefaultTreeCellEditor$1())().$o(this)._DefaultCellEditor$JTextField(new DefaultTreeCellEditor$DefaultTextField().$o(this)._DefaultTreeCellEditor$DefaultTextField(aBorder));
    editor.setClickCountToStart(1);
    return editor;
  }
  /**
   * Cleans up any state after editing has completed. Removes the
   * <code>editingComponent</code> the <code>editingContainer</code>.
   */
  cleanupAfterEditing(): void {
    if (this.editingComponent != null) {
      this.editingContainer.remove$Component(this.editingComponent);
    }
    this.editingComponent = null;
  }
}

/**
 * <code>TextField</code> used when no editor is supplied.
 * This textfield locks into the border it is constructed with.
 * It also prefers its parents font over its font. And if the
 * renderer is not <code>null</code> and no font
 * has been specified the preferred height is that of the renderer.
 */
export class DefaultTreeCellEditor$DefaultTextField extends JTextField {
  /**
   * Border to use.
   */
  border$DefaultTreeCellEditor_DefaultTextField: Border = null;
  /**
   * Constructs a
   * <code>DefaultTreeCellEditor.DefaultTextField</code> object.
   *
   * @param border  a <code>Border</code> object
   * @since 1.4
   */
  _DefaultTreeCellEditor$DefaultTextField(border: Border): this {
    this._JTextField$();
    this.setBorder(border);
    return this;
  }
  /**
   * Sets the border of this component.<p>
   * This is a bound property.
   *
   * @param border the border to be rendered for this component
   * @see Border
   * @see CompoundBorder
   */
  setBorder(border: Border): void {
    super.setBorder(border);
    this.border$DefaultTreeCellEditor_DefaultTextField = border;
  }
  /**
   * Overrides <code>JComponent.getBorder</code> to
   * returns the current border.
   */
  getBorder(): Border {
    return this.border$DefaultTreeCellEditor_DefaultTextField;
  }
  getFont(): Font {
    let font = super.getFont();
    if (font instanceof FontUIResource) {
      let parent = this.getParent();
      if (parent != null && parent.getFont() != null) {
        font = parent.getFont();
      }
    }
    return font;
  }
  /**
   * Overrides <code>JTextField.getPreferredSize</code> to
   * return the preferred size based on current font, if set,
   * or else use renderer's font.
   * @return a <code>Dimension</code> object containing
   *   the preferred size
   */
  getPreferredSize$(): Dimension {
    let size = super.getPreferredSize$();
    if (this.$outer.renderer != null && this.$outer.getFont() == null) {
      let rSize = this.$outer.renderer.getPreferredSize$();
      size.height_ = rSize.height_;
    }
    return size;
  }
}

/**
 * Container responsible for placing the <code>editingComponent</code>.
 */
export class DefaultTreeCellEditor$EditorContainer extends Container {
  /**
   * Constructs an <code>EditorContainer</code> object.
   */
  _DefaultTreeCellEditor$EditorContainer(): this {
    this._Container();
    this.setLayout(null);
    return this;
  }
  /**
   * Overrides <code>Container.paint</code> to paint the node's
   * icon and use the selection color for the background.
   */
  paint(g: Graphics): void {
    let width = this.getWidth();
    let height = this.getHeight();
    if (this.$outer.editingIcon != null) {
      let yLoc = this.calculateIconY(this.$outer.editingIcon);
      if (this.getComponentOrientation().isLeftToRight()) {
        this.$outer.editingIcon.paintIcon(this, g, 0, yLoc);
      } else {
        this.$outer.editingIcon.paintIcon(this, g, (width - this.$outer.editingIcon.getIconWidth()) | 0, yLoc);
      }
    }
    let background = this.$outer.getBorderSelectionColor();
    if (background != null) {
      g.setColor(background);
      g.drawRect(0, 0, (width - 1) | 0, (height - 1) | 0);
    }
    super.paint(g);
  }
  /**
   * Lays out this <code>Container</code>.  If editing,
   * the editor will be placed at
   * <code>offset</code> in the x direction and 0 for y.
   */
  doLayout(): void {
    if (this.$outer.editingComponent != null) {
      let width = this.getWidth();
      let height = this.getHeight();
      if (this.getComponentOrientation().isLeftToRight()) {
        this.$outer.editingComponent.setBounds$int$int$int$int(this.$outer.offset, 0, (width - this.$outer.offset) | 0, height);
      } else {
        this.$outer.editingComponent.setBounds$int$int$int$int(0, 0, (width - this.$outer.offset) | 0, height);
      }
    }
  }
  /**
   * Calculate the y location for the icon.
   */
  calculateIconY(icon: Icon): number {
    let iconHeight = icon.getIconHeight();
    let textHeight = this.$outer.editingComponent.getFontMetrics(this.$outer.editingComponent.getFont()).getHeight();
    let textY = ($J.idiv(iconHeight, 2) - $J.idiv(textHeight, 2)) | 0;
    let totalY = Math.min(0, textY);
    let totalHeight = ((Math.max(iconHeight, (textY + textHeight) | 0)) - totalY) | 0;
    return ($J.idiv(this.getHeight(), 2) - (totalY + ($J.idiv(totalHeight, 2)))) | 0;
  }
  /**
   * Returns the preferred size for the <code>Container</code>.
   * This will be at least preferred size of the editor plus
   * <code>offset</code>.
   * @return a <code>Dimension</code> containing the preferred
   *   size for the <code>Container</code>; if
   *   <code>editingComponent</code> is <code>null</code> the
   *   <code>Dimension</code> returned is 0, 0
   */
  getPreferredSize$(): Dimension {
    if (this.$outer.editingComponent != null) {
      let pSize = this.$outer.editingComponent.getPreferredSize$();
      pSize.width_ = (pSize.width_ + (this.$outer.offset + 5)) | 0;
      let rSize = (this.$outer.renderer != null) ? this.$outer.renderer.getPreferredSize$() : null;
      if (rSize != null) {
        pSize.height_ = Math.max(pSize.height_, rSize.height_);
      }
      if (this.$outer.editingIcon != null) {
        pSize.height_ = Math.max(pSize.height_, this.$outer.editingIcon.getIconHeight());
      }
      pSize.width_ = Math.max(pSize.width_, 100);
      return pSize;
    }
    return new Dimension()._Dimension$int$int(0, 0);
  }
}

let $DefaultTreeCellEditor$1: any = null;
/** An anonymous class (DefaultTreeCellEditor.java:542). */
function DefaultTreeCellEditor$1(): any {
  return $DefaultTreeCellEditor$1 ??= $J.local(class extends DefaultCellEditor {
    shouldSelectCell(event: EventObject): boolean {
      let retValue = super.shouldSelectCell(event);
      return retValue;
    }
  }, 'javax.swing.tree.DefaultTreeCellEditor$1', []);
}

$J.define(DefaultTreeCellEditor, 'javax.swing.tree.DefaultTreeCellEditor', { kind: 'class', ifaces: ['java.awt.event.ActionListener', 'javax.swing.tree.TreeCellEditor', 'javax.swing.event.TreeSelectionListener'], sup: 'java.lang.Object', ctors: { 'javax.swing.JTree,javax.swing.tree.DefaultTreeCellRenderer,javax.swing.tree.TreeCellEditor': '_DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer$TreeCellEditor', 'javax.swing.JTree,javax.swing.tree.DefaultTreeCellRenderer': '_DefaultTreeCellEditor$JTree$DefaultTreeCellRenderer' } });
$J.define(DefaultTreeCellEditor$DefaultTextField, 'javax.swing.tree.DefaultTreeCellEditor$DefaultTextField', { kind: 'class', sup: 'javax.swing.JTextField', ctors: { 'javax.swing.border.Border': '_DefaultTreeCellEditor$DefaultTextField' }, meths: { 'getPreferredSize()': 'getPreferredSize$' }, inner: true });
$J.define(DefaultTreeCellEditor$EditorContainer, 'javax.swing.tree.DefaultTreeCellEditor$EditorContainer', { kind: 'class', sup: 'java.awt.Container', ctors: { '': '_DefaultTreeCellEditor$EditorContainer' }, meths: { 'getPreferredSize()': 'getPreferredSize$' }, inner: true });
$J.module(() => {
  Dimension = $J.load('java.awt.Dimension');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  DefaultCellEditor = $J.load('javax.swing.DefaultCellEditor');
  JTree = $J.load('javax.swing.JTree');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  UIManager = $J.load('javax.swing.UIManager');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
});
