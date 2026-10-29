// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/tree/DefaultTreeCellRenderer.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2017, Oracle and/or its affiliates. All rights reserved.
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
import { $J } from '../../../../jre/index.ts';
import { JLabel } from '../JLabel.ts';

let Color, Dimension, UIManager, BorderUIResource$EmptyBorderUIResource, ColorUIResource, FontUIResource, UIResource, BasicGraphicsUtils, BasicHTML, DefaultLookup, SwingUtilities2;

/**
 * Displays an entry in a tree.
 * <code>DefaultTreeCellRenderer</code> is not opaque and
 * unless you subclass paint you should not change this.
 * See <a
 * href="https://docs.oracle.com/javase/tutorial/uiswing/components/tree.html">How to Use Trees</a>
 * in <em>The Java Tutorial</em>
 * for examples of customizing node display using this class.
 * <p>
 * The set of icons and colors used by {@code DefaultTreeCellRenderer}
 * can be configured using the various setter methods. The value for
 * each property is initialized from the defaults table. When the
 * look and feel changes ({@code updateUI} is invoked), any properties
 * that have a value of type {@code UIResource} are refreshed from the
 * defaults table. The following table lists the mapping between
 * {@code DefaultTreeCellRenderer} property and defaults table key:
 *
 * <table class="striped">
 * <caption>Properties</caption>
 * <thead>
 *   <tr>
 *     <th scope="col">Property
 *     <th scope="col">Key
 *   </tr>
 * </thead>
 * <tbody>
 *   <tr>
 *     <th scope="row">"leafIcon"
 *     <td>"Tree.leafIcon"
 *   <tr>
 *     <th scope="row">"closedIcon"
 *     <td>"Tree.closedIcon"
 *   <tr>
 *     <th scope="row">"openIcon"
 *     <td>"Tree.openIcon"
 *   <tr>
 *     <th scope="row">"textSelectionColor"
 *     <td>"Tree.selectionForeground"
 *   <tr>
 *     <th scope="row">"textNonSelectionColor"
 *     <td>"Tree.textForeground"
 *   <tr>
 *     <th scope="row">"backgroundSelectionColor"
 *     <td>"Tree.selectionBackground"
 *   <tr>
 *     <th scope="row">"backgroundNonSelectionColor"
 *     <td>"Tree.textBackground"
 *   <tr>
 *     <th scope="row">"borderSelectionColor"
 *     <td>"Tree.selectionBorderColor"
 * </tbody>
 * </table>
 * <p>
 * <strong><a id="override">Implementation Note:</a></strong>
 * This class overrides
 * <code>invalidate</code>,
 * <code>validate</code>,
 * <code>revalidate</code>,
 * <code>repaint</code>,
 * and
 * <code>firePropertyChange</code>
 * solely to improve performance.
 * If not overridden, these frequently called methods would execute code paths
 * that are unnecessary for the default tree cell renderer.
 * If you write your own renderer,
 * take care to weigh the benefits and
 * drawbacks of overriding these methods.
 *
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
 * @author Rob Davis
 * @author Ray Ryan
 * @author Scott Violet
 */
export class DefaultTreeCellRenderer extends JLabel {
  /**
   * Last tree the renderer was painted in.
   */
  tree: JTree = null;
  /**
   * Is the value currently selected.
   */
  selected: boolean = false;
  /**
   * True if has focus.
   */
  hasFocus_: boolean = false;
  /**
   * True if draws focus border around icon as well.
   */
  drawsFocusBorderAroundIcon: boolean = false;
  /**
   * If true, a dashed line is drawn as the focus indicator.
   */
  drawDashedFocusIndicator: boolean = false;
  /**
   * Background color of the tree.
   */
  treeBGColor: Color = null;
  /**
   * Color to draw the focus indicator in, determined from the background.
   * color.
   */
  focusBGColor: Color = null;
  /**
   * Icon used to show non-leaf nodes that aren't expanded.
   */
  closedIcon: Icon = null;
  /**
   * Icon used to show leaf nodes.
   */
  leafIcon: Icon = null;
  /**
   * Icon used to show non-leaf nodes that are expanded.
   */
  openIcon: Icon = null;
  /**
   * Color to use for the foreground for selected nodes.
   */
  textSelectionColor: Color = null;
  /**
   * Color to use for the foreground for non-selected nodes.
   */
  textNonSelectionColor: Color = null;
  /**
   * Color to use for the background when a node is selected.
   */
  backgroundSelectionColor: Color = null;
  /**
   * Color to use for the background when the node isn't selected.
   */
  backgroundNonSelectionColor: Color = null;
  /**
   * Color to use for the focus indicator when the node has focus.
   */
  borderSelectionColor: Color = null;
  isDropCell: boolean = false;
  fillBackground: boolean = false;
  /**
   * Set to true after the constructor has run.
   */
  inited: boolean = false;
  /**
   * Creates a {@code DefaultTreeCellRenderer}. Icons and text color are
   * determined from the {@code UIManager}.
   */
  _DefaultTreeCellRenderer(): this {
    this._JLabel$();
    this.inited = true;
    return this;
  }
  /**
   * {@inheritDoc}
   *
   * @since 1.7
   */
  updateUI(): void {
    super.updateUI();
    if (!this.inited || ($J.isa(this.getLeafIcon(), UIResource))) {
      this.setLeafIcon(DefaultLookup.getIcon$JComponent$ComponentUI$String(this, this.ui, 'Tree.leafIcon'));
    }
    if (!this.inited || ($J.isa(this.getClosedIcon(), UIResource))) {
      this.setClosedIcon(DefaultLookup.getIcon$JComponent$ComponentUI$String(this, this.ui, 'Tree.closedIcon'));
    }
    if (!this.inited || ($J.isa(this.getOpenIcon(), UIResource))) {
      this.setOpenIcon(DefaultLookup.getIcon$JComponent$ComponentUI$String(this, this.ui, 'Tree.openIcon'));
    }
    if (!this.inited || ($J.isa(this.getTextSelectionColor(), UIResource))) {
      this.setTextSelectionColor(DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.selectionForeground'));
    }
    if (!this.inited || ($J.isa(this.getTextNonSelectionColor(), UIResource))) {
      this.setTextNonSelectionColor(DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.textForeground'));
    }
    if (!this.inited || ($J.isa(this.getBackgroundSelectionColor(), UIResource))) {
      this.setBackgroundSelectionColor(DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.selectionBackground'));
    }
    if (!this.inited || ($J.isa(this.getBackgroundNonSelectionColor(), UIResource))) {
      this.setBackgroundNonSelectionColor(DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.textBackground'));
    }
    if (!this.inited || ($J.isa(this.getBorderSelectionColor(), UIResource))) {
      this.setBorderSelectionColor(DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.selectionBorderColor'));
    }
    this.drawsFocusBorderAroundIcon = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this, this.ui, 'Tree.drawsFocusBorderAroundIcon', false);
    this.drawDashedFocusIndicator = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this, this.ui, 'Tree.drawDashedFocusIndicator', false);
    this.fillBackground = DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this, this.ui, 'Tree.rendererFillBackground', true);
    if (!this.inited || $J.isa(this.getBorder(), UIResource)) {
      let margins = DefaultLookup.getInsets$JComponent$ComponentUI$String(this, this.ui, 'Tree.rendererMargins');
      if (margins != null) {
        this.setBorder(new BorderUIResource$EmptyBorderUIResource()._BorderUIResource$EmptyBorderUIResource$Insets(margins));
      } else {
        this.setBorder(new BorderUIResource$EmptyBorderUIResource()._BorderUIResource$EmptyBorderUIResource$int$int$int$int(0, 0, 0, 0));
      }
    }
    this.setName('Tree.cellRenderer');
  }
  /**
   * Sets the icon used to represent non-leaf nodes that are expanded.
   *
   * @param newIcon the icon to be used for expanded non-leaf nodes
   */
  setOpenIcon(newIcon: Icon): void {
    this.openIcon = newIcon;
  }
  /**
   * Returns the icon used to represent non-leaf nodes that are expanded.
   *
   * @return the icon used to represent non-leaf nodes that are expanded
   */
  getOpenIcon(): Icon {
    return this.openIcon;
  }
  /**
   * Sets the icon used to represent non-leaf nodes that are not expanded.
   *
   * @param newIcon the icon to be used for not expanded non-leaf nodes
   */
  setClosedIcon(newIcon: Icon): void {
    this.closedIcon = newIcon;
  }
  /**
   * Returns the icon used to represent non-leaf nodes that are not
   * expanded.
   *
   * @return the icon used to represent non-leaf nodes that are not
   *         expanded
   */
  getClosedIcon(): Icon {
    return this.closedIcon;
  }
  /**
   * Sets the icon used to represent leaf nodes.
   *
   * @param newIcon icon to be used for leaf nodes
   */
  setLeafIcon(newIcon: Icon): void {
    this.leafIcon = newIcon;
  }
  /**
   * Returns the icon used to represent leaf nodes.
   *
   * @return the icon used to represent leaf nodes
   */
  getLeafIcon(): Icon {
    return this.leafIcon;
  }
  /**
   * Sets the color the text is drawn with when the node is selected.
   *
   * @param newColor color to be used for text when the node is selected
   */
  setTextSelectionColor(newColor: Color): void {
    this.textSelectionColor = newColor;
  }
  /**
   * Returns the color the text is drawn with when the node is selected.
   *
   * @return the color the text is drawn with when the node is selected
   */
  getTextSelectionColor(): Color {
    return this.textSelectionColor;
  }
  /**
   * Sets the color the text is drawn with when the node isn't selected.
   *
   * @param newColor color to be used for text when the node isn't selected
   */
  setTextNonSelectionColor(newColor: Color): void {
    this.textNonSelectionColor = newColor;
  }
  /**
   * Returns the color the text is drawn with when the node isn't selected.
   *
   * @return the color the text is drawn with when the node isn't selected.
   */
  getTextNonSelectionColor(): Color {
    return this.textNonSelectionColor;
  }
  /**
   * Sets the color to use for the background if node is selected.
   *
   * @param newColor to be used for the background if the node is selected
   */
  setBackgroundSelectionColor(newColor: Color): void {
    this.backgroundSelectionColor = newColor;
  }
  /**
   * Returns the color to use for the background if node is selected.
   *
   * @return the color to use for the background if node is selected
   */
  getBackgroundSelectionColor(): Color {
    return this.backgroundSelectionColor;
  }
  /**
   * Sets the background color to be used for non selected nodes.
   *
   * @param newColor color to be used for the background for non selected nodes
   */
  setBackgroundNonSelectionColor(newColor: Color): void {
    this.backgroundNonSelectionColor = newColor;
  }
  /**
   * Returns the background color to be used for non selected nodes.
   *
   * @return the background color to be used for non selected nodes.
   */
  getBackgroundNonSelectionColor(): Color {
    return this.backgroundNonSelectionColor;
  }
  /**
   * Sets the color to use for the border.
   *
   * @param newColor color to be used for the border
   */
  setBorderSelectionColor(newColor: Color): void {
    this.borderSelectionColor = newColor;
  }
  /**
   * Returns the color the border is drawn.
   *
   * @return the color the border is drawn
   */
  getBorderSelectionColor(): Color {
    return this.borderSelectionColor;
  }
  /**
   * Subclassed to map <code>FontUIResource</code>s to null. If
   * <code>font</code> is null, or a <code>FontUIResource</code>, this
   * has the effect of letting the font of the JTree show
   * through. On the other hand, if <code>font</code> is non-null, and not
   * a <code>FontUIResource</code>, the font becomes <code>font</code>.
   */
  setFont(font: Font): void {
    if (font instanceof FontUIResource) {
      font = null;
    }
    super.setFont(font);
  }
  /**
   * Gets the font of this component.
   * @return this component's font; if a font has not been set
   * for this component, the font of its parent is returned
   */
  getFont(): Font {
    let font = super.getFont();
    if (font == null && this.tree != null) {
      font = this.tree.getFont();
    }
    return font;
  }
  /**
   * Subclassed to map <code>ColorUIResource</code>s to null. If
   * <code>color</code> is null, or a <code>ColorUIResource</code>, this
   * has the effect of letting the background color of the JTree show
   * through. On the other hand, if <code>color</code> is non-null, and not
   * a <code>ColorUIResource</code>, the background becomes
   * <code>color</code>.
   */
  setBackground(color: Color): void {
    if (color instanceof ColorUIResource) {
      color = null;
    }
    super.setBackground(color);
  }
  /**
   * Configures the renderer based on the passed in components.
   * The value is set from messaging the tree with
   * <code>convertValueToText</code>, which ultimately invokes
   * <code>toString</code> on <code>value</code>.
   * The foreground color is set based on the selection and the icon
   * is set based on the <code>leaf</code> and <code>expanded</code>
   * parameters.
   */
  getTreeCellRendererComponent(tree: JTree, value: any, sel: boolean, expanded: boolean, leaf: boolean, row: number, hasFocus: boolean): Component {
    let stringValue = tree.convertValueToText(value, sel, expanded, leaf, row, hasFocus);
    this.tree = tree;
    this.hasFocus_ = hasFocus;
    this.setText(stringValue);
    let fg = null;
    this.isDropCell = false;
    let dropLocation = tree.getDropLocation();
    if (dropLocation != null && dropLocation.getChildIndex() === -1 && tree.getRowForPath(dropLocation.getPath()) === row) {
      let col = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.dropCellForeground');
      if (col != null) {
        fg = col;
      } else {
        fg = this.getTextSelectionColor();
      }
      this.isDropCell = true;
    } else if (sel) {
      fg = this.getTextSelectionColor();
    } else {
      fg = this.getTextNonSelectionColor();
    }
    this.setForeground(fg);
    let icon = null;
    if (leaf) {
      icon = this.getLeafIcon();
    } else if (expanded) {
      icon = this.getOpenIcon();
    } else {
      icon = this.getClosedIcon();
    }
    if (!tree.isEnabled()) {
      this.setEnabled(false);
      let laf = UIManager.getLookAndFeel();
      let disabledIcon = laf.getDisabledIcon(tree, icon);
      if (disabledIcon != null) {
        icon = disabledIcon;
      }
      this.setDisabledIcon(icon);
    } else {
      this.setEnabled(true);
      this.setIcon(icon);
    }
    this.setComponentOrientation(tree.getComponentOrientation());
    this.selected = sel;
    return this;
  }
  /**
   * Paints the value.  The background is filled based on selected.
   */
  paint(g: Graphics): void {
    let bColor: Color;
    if (this.isDropCell) {
      bColor = DefaultLookup.getColor$JComponent$ComponentUI$String(this, this.ui, 'Tree.dropCellBackground');
      if (bColor == null) {
        bColor = this.getBackgroundSelectionColor();
      }
    } else if (this.selected) {
      bColor = this.getBackgroundSelectionColor();
    } else {
      bColor = this.getBackgroundNonSelectionColor();
      if (bColor == null) {
        bColor = this.getBackground();
      }
    }
    let imageOffset = -1;
    if (bColor != null && this.fillBackground) {
      imageOffset = this.getLabelStart();
      g.setColor(bColor);
      if (this.getComponentOrientation().isLeftToRight()) {
        g.fillRect(imageOffset, 0, (this.getWidth() - imageOffset) | 0, this.getHeight());
      } else {
        g.fillRect(0, 0, (this.getWidth() - imageOffset) | 0, this.getHeight());
      }
    }
    if (this.hasFocus_) {
      if (this.drawsFocusBorderAroundIcon) {
        imageOffset = 0;
      } else if (imageOffset === -1) {
        imageOffset = this.getLabelStart();
      }
      if (this.getComponentOrientation().isLeftToRight()) {
        this.paintFocus(g, imageOffset, 0, (this.getWidth() - imageOffset) | 0, this.getHeight(), bColor);
      } else {
        this.paintFocus(g, 0, 0, (this.getWidth() - imageOffset) | 0, this.getHeight(), bColor);
      }
    }
    super.paint(g);
  }
  paintFocus(g: Graphics, x: number, y: number, w: number, h: number, notColor: Color): void {
    let bsColor = this.getBorderSelectionColor();
    if (bsColor != null && (this.selected || !this.drawDashedFocusIndicator)) {
      g.setColor(bsColor);
      g.drawRect(x, y, (w - 1) | 0, (h - 1) | 0);
    }
    if (this.drawDashedFocusIndicator && notColor != null) {
      if (this.treeBGColor !== notColor) {
        this.treeBGColor = notColor;
        this.focusBGColor = new Color()._Color$int(~notColor.getRGB());
      }
      g.setColor(this.focusBGColor);
      BasicGraphicsUtils.drawDashedRect(g, x, y, w, h);
    }
  }
  getLabelStart(): number {
    let currentI = this.getIcon();
    if (currentI != null && this.getText() != null) {
      return (currentI.getIconWidth() + (Math.max(0, (this.getIconTextGap() - 1) | 0))) | 0;
    }
    return 0;
  }
  /**
   * Overrides <code>JComponent.getPreferredSize</code> to
   * return slightly wider preferred size value.
   */
  getPreferredSize$(): Dimension {
    let retDimension = super.getPreferredSize$();
    if (retDimension != null) {
      retDimension = new Dimension()._Dimension$int$int((retDimension.width_ + 3) | 0, retDimension.height_);
    }
    return retDimension;
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  validate(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   *
   * @since 1.5
   */
  invalidate(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  revalidate(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  repaint$long$int$int$int$int(tm: number, x: number, y: number, width: number, height: number): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  repaint$Rectangle(r: Rectangle): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   *
   * @since 1.5
   */
  repaint$(): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$Object$Object(propertyName: string, oldValue: any, newValue: any): void {
    if (propertyName === 'text' || ((SwingUtilities2.isScaleChanged$String$Object$Object(propertyName, oldValue, newValue) || propertyName === 'font' || propertyName === 'foreground') && oldValue !== newValue && this.getClientProperty(BasicHTML.propertyKey) != null)) {
      super.firePropertyChange$String$Object$Object(propertyName, oldValue, newValue);
    }
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$int$int(propertyName: string, oldValue: number, newValue: number): void {
  }
  /**
   * Overridden for performance reasons.
   * See the <a href="#override">Implementation Note</a>
   * for more information.
   */
  firePropertyChange$String$boolean$boolean(propertyName: string, oldValue: boolean, newValue: boolean): void {
  }
}

$J.define(DefaultTreeCellRenderer, 'javax.swing.tree.DefaultTreeCellRenderer', { kind: 'class', ifaces: ['javax.swing.tree.TreeCellRenderer'], sup: 'javax.swing.JLabel', ctors: { '': '_DefaultTreeCellRenderer' }, meths: { 'firePropertyChange(java.lang.String,boolean,boolean)': 'firePropertyChange$String$boolean$boolean', 'firePropertyChange(java.lang.String,double,double)': 'firePropertyChange$String$double$double', 'firePropertyChange(java.lang.String,float,float)': 'firePropertyChange$String$float$float', 'firePropertyChange(java.lang.String,long,long)': 'firePropertyChange$String$long$long', 'firePropertyChange(java.lang.String,int,int)': 'firePropertyChange$String$int$int', 'firePropertyChange(java.lang.String,short,short)': 'firePropertyChange$String$short$short', 'firePropertyChange(java.lang.String,char,char)': 'firePropertyChange$String$char$char', 'firePropertyChange(java.lang.String,byte,byte)': 'firePropertyChange$String$byte$byte', 'firePropertyChange(java.lang.String,java.lang.Object,java.lang.Object)': 'firePropertyChange$String$Object$Object', 'repaint()': 'repaint$', 'repaint(java.awt.Rectangle)': 'repaint$Rectangle', 'repaint(long,int,int,int,int)': 'repaint$long$int$int$int$int', 'getPreferredSize()': 'getPreferredSize$' } });
$J.module(() => {
  Color = $J.load('java.awt.Color');
  Dimension = $J.load('java.awt.Dimension');
  UIManager = $J.load('javax.swing.UIManager');
  BorderUIResource$EmptyBorderUIResource = $J.load('javax.swing.plaf.BorderUIResource$EmptyBorderUIResource');
  ColorUIResource = $J.load('javax.swing.plaf.ColorUIResource');
  FontUIResource = $J.load('javax.swing.plaf.FontUIResource');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  BasicGraphicsUtils = $J.load('javax.swing.plaf.basic.BasicGraphicsUtils');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
