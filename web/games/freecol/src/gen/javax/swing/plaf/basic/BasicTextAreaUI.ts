// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicTextAreaUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JError } from '../../../../../jre/index.ts';
import { BasicTextUI } from './BasicTextUI.ts';
import { ParagraphView } from '../../text/ParagraphView.ts';
import { CompositeView } from '../../text/CompositeView.ts';

let Component$BaselineResizeBehavior, JTextArea, BasicHTML, AbstractDocument, BoxView, GlyphView, PlainView, StyleConstants, View, WrappedPlainView;

/**
 * Provides the look and feel for a plain text editor.  In this
 * implementation the default UI is extended to act as a simple
 * view factory.
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
 * @author  Timothy Prinzing
 */
export class BasicTextAreaUI extends BasicTextUI {
  /**
   * Constructs a new BasicTextAreaUI object.
   */
  _BasicTextAreaUI(): this {
    this._BasicTextUI();
    return this;
  }
  /**
   * Creates a UI for a JTextArea.
   *
   * @param ta a text area
   * @return the UI
   */
  static createUI(ta: JComponent): ComponentUI {
    return new BasicTextAreaUI()._BasicTextAreaUI();
  }
  /**
   * Fetches the name used as a key to look up properties through the
   * UIManager.  This is used as a prefix to all the standard
   * text properties.
   *
   * @return the name ("TextArea")
   */
  getPropertyPrefix(): string {
    return 'TextArea';
  }
  installDefaults(): void {
    super.installDefaults();
  }
  /**
   * This method gets called when a bound property is changed
   * on the associated JTextComponent.  This is a hook
   * which UI implementations may change to reflect how the
   * UI displays bound properties of JTextComponent subclasses.
   * This is implemented to rebuild the View when the
   * <em>WrapLine</em> or the <em>WrapStyleWord</em> property changes.
   *
   * @param evt the property change event
   */
  propertyChange(evt: PropertyChangeEvent): void {
    super.propertyChange(evt);
    if ($J.equals(evt.getPropertyName(), 'lineWrap') || $J.equals(evt.getPropertyName(), 'wrapStyleWord') || $J.equals(evt.getPropertyName(), 'tabSize')) {
      this.modelChanged();
    } else if ($J.equals('editable', evt.getPropertyName())) {
      this.updateFocusTraversalKeys();
    }
  }
  /**
   * The method is overridden to take into account caret width.
   *
   * @param c the editor component
   * @return the preferred size
   * @throws IllegalArgumentException if invalid value is passed
   *
   * @since 1.5
   */
  getPreferredSize$JComponent(c: JComponent): Dimension {
    return super.getPreferredSize$JComponent(c);
  }
  /**
   * The method is overridden to take into account caret width.
   *
   * @param c the editor component
   * @return the minimum size
   * @throws IllegalArgumentException if invalid value is passed
   *
   * @since 1.5
   */
  getMinimumSize(c: JComponent): Dimension {
    return super.getMinimumSize(c);
  }
  /**
   * Creates a view for an element.
   *
   * @param elem the element
   * @return the view for the element
   */
  create(elem: Element): View {
    let doc = elem.getDocument();
    let i18nFlag = doc.getProperty('i18n');
    if ((i18nFlag != null) && $J.equals(i18nFlag, true)) {
      return this.createI18N(elem);
    } else {
      let c = this.getComponent();
      if (c instanceof JTextArea) {
        let area = c;
        let v: View;
        if (area.getLineWrap()) {
          v = new WrappedPlainView()._WrappedPlainView$Element$boolean(elem, area.getWrapStyleWord());
        } else {
          v = new PlainView()._PlainView(elem);
        }
        return v;
      }
    }
    return null;
  }
  createI18N(elem: Element): View {
    let kind = elem.getName();
    if (kind != null) {
      if ($J.equals(kind, AbstractDocument.ContentElementName)) {
        return new BasicTextAreaUI$PlainParagraph()._BasicTextAreaUI$PlainParagraph(elem);
      } else if ($J.equals(kind, AbstractDocument.ParagraphElementName)) {
        return new BoxView()._BoxView(elem, View.Y_AXIS);
      }
    }
    return null;
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
    let i18nFlag = (c).getDocument().getProperty('i18n');
    let insets = c.getInsets$();
    if ($J.equals(true, i18nFlag)) {
      let rootView = this.getRootView(c);
      if (rootView.getViewCount() > 0) {
        height = (height - insets.top - insets.bottom) | 0;
        let baseline = insets.top;
        let fieldBaseline = BasicHTML.getBaseline$View$int$int(rootView.getView(0), (width - insets.left - insets.right) | 0, height);
        if (fieldBaseline < 0) {
          return -1;
        }
        return (baseline + fieldBaseline) | 0;
      }
      return -1;
    }
    let fm = c.getFontMetrics(c.getFont());
    return (insets.top + fm.getAscent()) | 0;
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
}

/**
 * Paragraph for representing plain-text lines that support
 * bidirectional text.
 */
export class BasicTextAreaUI$PlainParagraph extends ParagraphView {
  _BasicTextAreaUI$PlainParagraph(elem: Element): this {
    this._ParagraphView(elem);
    this.layoutPool = new BasicTextAreaUI$PlainParagraph$LogicalView()._BasicTextAreaUI$PlainParagraph$LogicalView(elem);
    this.layoutPool.setParent(this);
    return this;
  }
  setParent(parent: View): void {
    super.setParent(parent);
    if (parent != null) {
      this.setPropertiesFromAttributes();
    }
  }
  setPropertiesFromAttributes(): void {
    let c = this.getContainer();
    if ((c != null) && (!c.getComponentOrientation().isLeftToRight())) {
      this.setJustification(StyleConstants.ALIGN_RIGHT);
    } else {
      this.setJustification(StyleConstants.ALIGN_LEFT);
    }
  }
  /**
   * Fetch the constraining span to flow against for
   * the given child index.
   */
  getFlowSpan(index: number): number {
    let c = this.getContainer();
    if (c instanceof JTextArea) {
      let area = c;
      if (!area.getLineWrap()) {
        return 2147483647;
      }
    }
    return super.getFlowSpan(index);
  }
  calculateMinorAxisRequirements(axis: number, r: SizeRequirements): SizeRequirements {
    let req = super.calculateMinorAxisRequirements(axis, r);
    let c = this.getContainer();
    if (c instanceof JTextArea) {
      let area = c;
      if (!area.getLineWrap()) {
        req.minimum = req.preferred_;
      } else {
        req.minimum = 0;
        req.preferred_ = this.getWidth();
        if (req.preferred_ === 2147483647) {
          req.preferred_ = 100;
        }
      }
    }
    return req;
  }
  /**
   * Sets the size of the view.  If the size has changed, layout
   * is redone.  The size is the full size of the view including
   * the inset areas.
   *
   * @param width the width >= 0
   * @param height the height >= 0
   */
  setSize(width: number, height: number): void {
    if ($J.d2i(width) !== this.getWidth()) {
      this.preferenceChanged(null, true, true);
    }
    super.setSize(width, height);
  }
}

/**
 * This class can be used to represent a logical view for
 * a flow.  It keeps the children updated to reflect the state
 * of the model, gives the logical child views access to the
 * view hierarchy, and calculates a preferred span.  It doesn't
 * do any rendering, layout, or model/view translation.
 */
export class BasicTextAreaUI$PlainParagraph$LogicalView extends CompositeView {
  _BasicTextAreaUI$PlainParagraph$LogicalView(elem: Element): this {
    this._CompositeView(elem);
    return this;
  }
  getViewIndexAtPosition(pos: number): number {
    let elem = this.getElement();
    if (elem.getElementCount() > 0) {
      return elem.getElementIndex(pos);
    }
    return 0;
  }
  updateChildren$ElementChange$DocumentEvent$ViewFactory(ec: DocumentEvent$ElementChange, e: DocumentEvent, f: ViewFactory): boolean {
    return false;
  }
  loadChildren(f: ViewFactory): void {
    let elem = this.getElement();
    if (elem.getElementCount() > 0) {
      super.loadChildren(f);
    } else {
      let v = new GlyphView()._GlyphView(elem);
      this.append(v);
    }
  }
  getPreferredSpan(axis: number): number {
    if (this.getViewCount() !== 1) {
      throw new JError('One child view is assumed.');
    }
    let v = this.getView(0);
    return v.getPreferredSpan(axis);
  }
  /**
   * Forward the DocumentEvent to the given child view.  This
   * is implemented to reparent the child to the logical view
   * (the children may have been parented by a row in the flow
   * if they fit without breaking) and then execute the superclass
   * behavior.
   *
   * @param v the child view to forward the event to.
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see #forwardUpdate
   * @since 1.3
   */
  forwardUpdateToView(v: View, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    v.setParent(this);
    super.forwardUpdateToView(v, e, a, f);
  }
  paint(g: Graphics, allocation: Shape): void {
  }
  isBefore(x: number, y: number, alloc: Rectangle): boolean {
    return false;
  }
  isAfter(x: number, y: number, alloc: Rectangle): boolean {
    return false;
  }
  getViewAtPoint(x: number, y: number, alloc: Rectangle): View {
    return null;
  }
  childAllocation(index: number, a: Rectangle): void {
  }
}

$J.define(BasicTextAreaUI, 'javax.swing.plaf.basic.BasicTextAreaUI', { kind: 'class', sup: 'javax.swing.plaf.basic.BasicTextUI', ctors: { '': '_BasicTextAreaUI' }, meths: { 'getBaseline(javax.swing.JComponent,int,int)': 'getBaseline$JComponent$int$int', 'getPreferredSize(javax.swing.JComponent)': 'getPreferredSize$JComponent' } });
$J.define(BasicTextAreaUI$PlainParagraph, 'javax.swing.plaf.basic.BasicTextAreaUI$PlainParagraph', { kind: 'class', sup: 'javax.swing.text.ParagraphView', ctors: { 'javax.swing.text.Element': '_BasicTextAreaUI$PlainParagraph' } });
$J.define(BasicTextAreaUI$PlainParagraph$LogicalView, 'javax.swing.plaf.basic.BasicTextAreaUI$PlainParagraph$LogicalView', { kind: 'class', sup: 'javax.swing.text.CompositeView', ctors: { 'javax.swing.text.Element': '_BasicTextAreaUI$PlainParagraph$LogicalView' }, meths: { 'updateChildren(javax.swing.event.DocumentEvent$ElementChange,javax.swing.event.DocumentEvent,javax.swing.text.ViewFactory)': 'updateChildren$ElementChange$DocumentEvent$ViewFactory' } });
$J.module(() => {
  Component$BaselineResizeBehavior = $J.load('java.awt.Component$BaselineResizeBehavior');
  JTextArea = $J.load('javax.swing.JTextArea');
  BasicHTML = $J.load('javax.swing.plaf.basic.BasicHTML');
  AbstractDocument = $J.load('javax.swing.text.AbstractDocument');
  BoxView = $J.load('javax.swing.text.BoxView');
  GlyphView = $J.load('javax.swing.text.GlyphView');
  PlainView = $J.load('javax.swing.text.PlainView');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  View = $J.load('javax.swing.text.View');
  WrappedPlainView = $J.load('javax.swing.text.WrappedPlainView');
});
