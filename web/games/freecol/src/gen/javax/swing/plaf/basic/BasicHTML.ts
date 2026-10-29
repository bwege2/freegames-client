// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicHTML.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1998, 2019, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, GetBooleanAction, HTMLDocument, HTMLEditorKit, HTMLEditorKit_HTMLFactory, HTML_Tag, IllegalArgumentException, ImageView, JError, JObject, JString, StringReader, StyleSheet, Throwable, URL } from '../../../../../jre/index.ts';
import { View } from '../../text/View.ts';

let Rectangle, AccessibleContext, BadLocationException, ParagraphView, StyleConstants, SwingAccessor, SwingUtilities2;

/**
 * Support for providing html views for the swing components.
 * This translates a simple html string to a javax.swing.text.View
 * implementation that can render the html and provide the necessary
 * layout semantics.
 *
 * @author  Timothy Prinzing
 * @since 1.3
 */
export class BasicHTML extends JObject {
  /**
   * If this client property of a JComponent is set to Boolean.TRUE
   * the component's 'text' property is never treated as HTML.
   */
  static readonly htmlDisable: string = 'html.disable';
  /**
   * Key to use for the html renderer when stored as a
   * client property of a JComponent.
   */
  static readonly propertyKey: string = 'html';
  /**
   * Key stored as a client property to indicate the base that relative
   * references are resolved against. For example, lets say you keep
   * your images in the directory resources relative to the code path,
   * you would use the following the set the base:
   * <pre>
   *   jComponent.putClientProperty(documentBaseKey,
   *                                xxx.class.getResource("resources/"));
   * </pre>
   */
  static readonly documentBaseKey: string = 'html.base';
  /**
   * The source of the html renderers
   */
  static basicHTMLFactory: BasicHTML$BasicEditorKit = null;
  /**
   * Creates the Views that visually represent the model.
   */
  static basicHTMLViewFactory: ViewFactory = null;
  /**
   * Overrides to the default stylesheet.  Should consider
   * just creating a completely fresh stylesheet.
   */
  static readonly styleChanges: string = 'p { margin-top: 0; margin-bottom: 0; margin-left: 0; margin-right: 0 }body { margin-top: 0; margin-bottom: 0; margin-left: 0; margin-right: 0 }';
  /**
   * Create an html renderer for the given component and
   * string of html.
   *
   * @param c a component
   * @param html an HTML string
   * @return an HTML renderer
   */
  static createHTMLView(c: JComponent, html: string): View {
    let kit = BasicHTML.getFactory();
    let doc = kit.createDefaultDocument$Font$Color(c.getFont(), c.getForeground());
    let base = c.getClientProperty(BasicHTML.documentBaseKey);
    if ($J.isa(base, URL)) {
      (doc).setBase(base);
    }
    let r = new StringReader(html);
    try {
      kit.read(r, doc, 0);
    } catch ($e0) {
      {
        let e = $J.exc($e0);
      }
    }
    let f = kit.getViewFactory();
    let hview = f.create(doc.getDefaultRootElement());
    let v = new BasicHTML$Renderer()._BasicHTML$Renderer(c, f, hview);
    return v;
  }
  /**
   * Returns the baseline for the html renderer.
   *
   * @param view the View to get the baseline for
   * @param w the width to get the baseline for
   * @param h the height to get the baseline for
   * @throws IllegalArgumentException if width or height is &lt; 0
   * @return baseline or a value &lt; 0 indicating there is no reasonable
   *                  baseline
   * @see java.awt.FontMetrics
   * @see javax.swing.JComponent#getBaseline(int,int)
   * @since 1.6
   */
  static getHTMLBaseline(view: View, w: number, h: number): number {
    if (w < 0 || h < 0) {
      throw new IllegalArgumentException('Width and height must be >= 0');
    }
    if (view instanceof BasicHTML$Renderer) {
      return BasicHTML.getBaseline$View$int$int(view.getView(0), w, h);
    }
    return -1;
  }
  /**
   * Gets the baseline for the specified component.  This digs out
   * the View client property, and if non-null the baseline is calculated
   * from it.  Otherwise the baseline is the value <code>y + ascent</code>.
   */
  static getBaseline$JComponent$int$int$int$int(c: JComponent, y: number, ascent: number, w: number, h: number): number {
    let view = c.getClientProperty(BasicHTML.propertyKey);
    if (view != null) {
      let baseline = BasicHTML.getHTMLBaseline(view, w, h);
      if (baseline < 0) {
        return baseline;
      }
      return (y + baseline) | 0;
    }
    return (y + ascent) | 0;
  }
  /**
   * Gets the baseline for the specified View.
   */
  static getBaseline$View$int$int(view: View, w: number, h: number): number {
    if (BasicHTML.hasParagraph(view)) {
      view.setSize(Math.fround(w), Math.fround(h));
      return BasicHTML.getBaseline$View$Shape(view, new Rectangle()._Rectangle$int$int$int$int(0, 0, w, h));
    }
    return -1;
  }
  static getBaseline$View$Shape(view: View, bounds: Shape): number {
    if (view.getViewCount() === 0) {
      return -1;
    }
    let attributes = view.getElement().getAttributes();
    let name = null;
    if (attributes != null) {
      name = attributes.getAttribute(StyleConstants.NameAttribute);
    }
    let index = 0;
    if (name === HTML_Tag.HTML && view.getViewCount() > 1) {
      index++;
    }
    bounds = view.getChildAllocation(index, bounds);
    if (bounds == null) {
      return -1;
    }
    let child = view.getView(index);
    if (view instanceof ParagraphView) {
      let rect: Rectangle;
      if (bounds instanceof Rectangle) {
        rect = bounds;
      } else {
        rect = bounds.getBounds();
      }
      return (rect.y_ + $J.d2i((Math.fround(rect.height_ * child.getAlignment(View.Y_AXIS))))) | 0;
    }
    return BasicHTML.getBaseline$View$Shape(child, bounds);
  }
  static hasParagraph(view: View): boolean {
    if (view instanceof ParagraphView) {
      return true;
    }
    if (view.getViewCount() === 0) {
      return false;
    }
    let attributes = view.getElement().getAttributes();
    let name = null;
    if (attributes != null) {
      name = attributes.getAttribute(StyleConstants.NameAttribute);
    }
    let index = 0;
    if (name === HTML_Tag.HTML && view.getViewCount() > 1) {
      index = 1;
    }
    return BasicHTML.hasParagraph(view.getView(index));
  }
  /**
   * Check the given string to see if it should trigger the
   * html rendering logic in a non-text component that supports
   * html rendering.
   *
   * @param s a text
   * @return {@code true} if the given string should trigger the
   *         html rendering logic in a non-text component
   */
  static isHTMLString(s: string): boolean {
    if (s != null) {
      if ((s.length >= 6) && (s.charCodeAt(0) === 60 /* '<' */) && (s.charCodeAt(5) === 62 /* '>' */)) {
        let tag = s.substring(1, 5);
        return JString.equalsIgnoreCase(tag, BasicHTML.propertyKey);
      }
    }
    return false;
  }
  /**
   * Stash the HTML render for the given text into the client
   * properties of the given JComponent. If the given text is
   * <em>NOT HTML</em> the property will be cleared of any
   * renderer.
   * <p>
   * This method is useful for ComponentUI implementations
   * that are static (i.e. shared) and get their state
   * entirely from the JComponent.
   *
   * @param c a component
   * @param text a text
   */
  static updateRenderer(c: JComponent, text: string): void {
    let value = null;
    let oldValue = c.getClientProperty(BasicHTML.propertyKey);
    let htmlDisabled = c.getClientProperty(BasicHTML.htmlDisable);
    if (!($J.equals(true, htmlDisabled)) && BasicHTML.isHTMLString(text)) {
      value = BasicHTML.createHTMLView(c, text);
    }
    if (value !== oldValue && oldValue != null) {
      for (let i = 0; i < oldValue.getViewCount(); i++) {
        oldValue.getView(i).setParent(null);
      }
    }
    c.putClientProperty(BasicHTML.propertyKey, value);
    let currentAccessibleNameProperty = c.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    let previousParsedText = null;
    if (currentAccessibleNameProperty != null && oldValue != null) {
      try {
        previousParsedText = JString.strip((oldValue.getDocument().getText$int$int(0, oldValue.getDocument().getLength())));
      } catch ($e1) {
        if ($J.isa($e1, BadLocationException)) {
          let e = $J.exc($e1);
        } else {
          throw $e1;
        }
      }
    }
    if (currentAccessibleNameProperty == null || $J.equals(currentAccessibleNameProperty, previousParsedText)) {
      let parsedText = null;
      if (value != null) {
        try {
          parsedText = JString.strip((value.getDocument().getText$int$int(0, value.getDocument().getLength())));
        } catch ($e2) {
          if ($J.isa($e2, BadLocationException)) {
            let e = $J.exc($e2);
          } else {
            throw $e2;
          }
        }
      }
      c.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, parsedText);
    }
  }
  static getFactory(): BasicHTML$BasicEditorKit {
    if (BasicHTML.basicHTMLFactory == null) {
      BasicHTML.basicHTMLViewFactory = new BasicHTML$BasicHTMLViewFactory()._BasicHTML$BasicHTMLViewFactory();
      BasicHTML.basicHTMLFactory = new BasicHTML$BasicEditorKit()._BasicHTML$BasicEditorKit();
    }
    return BasicHTML.basicHTMLFactory;
  }
}

/**
 * The views produced for the ComponentUI implementations aren't
 * going to be edited and don't need full html support.  This kit
 * alters the HTMLEditorKit to try and trim things down a bit.
 * It does the following:
 * <ul>
 * <li>It doesn't produce Views for things like comments,
 * head, title, unknown tags, etc.
 * <li>It installs a different set of css settings from the default
 * provided by HTMLEditorKit.
 * </ul>
 */
export class BasicHTML$BasicEditorKit extends HTMLEditorKit {
  /**
   * Shared base style for all documents created by us use.
   */
  static defaultStyles: StyleSheet = null;
  _BasicHTML$BasicEditorKit(): this {
    this._HTMLEditorKit();
    return this;
  }
  /**
   * Overridden to return our own slimmed down style sheet.
   */
  getStyleSheet(): StyleSheet {
    if (BasicHTML$BasicEditorKit.defaultStyles == null) {
      BasicHTML$BasicEditorKit.defaultStyles = new StyleSheet();
      let r = new StringReader(BasicHTML.styleChanges);
      try {
        BasicHTML$BasicEditorKit.defaultStyles.loadRules(r, null);
      } catch ($e3) {
        {
          let e = $J.exc($e3);
        }
      }
      r.close();
      BasicHTML$BasicEditorKit.defaultStyles.addStyleSheet(super.getStyleSheet());
    }
    return BasicHTML$BasicEditorKit.defaultStyles;
  }
  /**
   * Sets the async policy to flush everything in one chunk, and
   * to not display unknown tags.
   */
  createDefaultDocument$Font$Color(defaultFont: Font, foreground: Color): Document {
    let styles = this.getStyleSheet();
    let ss = new StyleSheet();
    ss.addStyleSheet(styles);
    let doc = new BasicHTML$BasicDocument()._BasicHTML$BasicDocument(ss, defaultFont, foreground);
    doc.setAsynchronousLoadPriority(2147483647);
    doc.setPreservesUnknownTags(false);
    return doc;
  }
  /**
   * Returns the ViewFactory that is used to make sure the Views don't
   * load in the background.
   */
  getViewFactory(): ViewFactory {
    return BasicHTML.basicHTMLViewFactory;
  }
}

/**
 * BasicHTMLViewFactory extends HTMLFactory to force images to be loaded
 * synchronously.
 */
export class BasicHTML$BasicHTMLViewFactory extends HTMLEditorKit_HTMLFactory {
  static useOV: boolean = null;
  _BasicHTML$BasicHTMLViewFactory(): this {
    this._HTMLEditorKit_HTMLFactory();
    return this;
  }
  create(elem: Element): View {
    let view = null;
    try {
      BasicHTML$BasicHTMLViewFactory.setAllowHTMLObject();
      view = super.create(elem);
    } finally {
      BasicHTML$BasicHTMLViewFactory.clearAllowHTMLObject();
    }
    if ($J.isa(view, ImageView)) {
      (view).setLoadsSynchronously(true);
    }
    return view;
  }
  static setAllowHTMLObject(): void {
    if (BasicHTML$BasicHTMLViewFactory.useOV == null) {
      BasicHTML$BasicHTMLViewFactory.useOV = AccessController.doPrivileged(new GetBooleanAction('swing.html.object'));
    }
    SwingAccessor.setAllowHTMLObject(BasicHTML$BasicHTMLViewFactory.useOV);
  }
  static clearAllowHTMLObject(): void {
    SwingAccessor.setAllowHTMLObject(null);
  }
  static $clinit() {
    BasicHTML$BasicHTMLViewFactory.useOV = null;
  }
}

/**
 * The subclass of HTMLDocument that is used as the model. getForeground
 * is overridden to return the foreground property from the Component this
 * was created for.
 */
export class BasicHTML$BasicDocument extends HTMLDocument {
  /**
   * The host, that is where we are rendering.
   */
  _BasicHTML$BasicDocument(s: StyleSheet, defaultFont: Font, foreground: Color): this {
    this._HTMLDocument(s);
    this.setPreservesUnknownTags(false);
    this.setFontAndColor(defaultFont, foreground);
    return this;
  }
  /**
   * Sets the default font and default color. These are set by
   * adding a rule for the body that specifies the font and color.
   * This allows the html to override these should it wish to have
   * a custom font or color.
   */
  setFontAndColor(font: Font, fg: Color): void {
    this.getStyleSheet().addRule(SwingUtilities2.displayPropertiesToCSS(font, fg));
  }
}

/**
 * Root text view that acts as an HTML renderer.
 */
export class BasicHTML$Renderer extends View {
  width_: number = 0;
  view: View = null;
  factory: ViewFactory = null;
  host: JComponent = null;
  _BasicHTML$Renderer(c: JComponent, f: ViewFactory, v: View): this {
    this._View(null);
    this.host = c;
    this.factory = f;
    this.view = v;
    this.view.setParent(this);
    this.setSize(this.view.getPreferredSpan(View.X_AXIS), this.view.getPreferredSpan(View.Y_AXIS));
    return this;
  }
  /**
   * Fetches the attributes to use when rendering.  At the root
   * level there are no attributes.  If an attribute is resolved
   * up the view hierarchy this is the end of the line.
   */
  getAttributes(): AttributeSet {
    return null;
  }
  /**
   * Determines the preferred span for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the span the view would like to be rendered into.
   *         Typically the view is told to render into the span
   *         that is returned, although there is no guarantee.
   *         The parent may choose to resize or break the view.
   */
  getPreferredSpan(axis: number): number {
    if (axis === View.X_AXIS) {
      return Math.fround(this.width_);
    }
    return this.view.getPreferredSpan(axis);
  }
  /**
   * Determines the minimum span for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the span the view would like to be rendered into.
   *         Typically the view is told to render into the span
   *         that is returned, although there is no guarantee.
   *         The parent may choose to resize or break the view.
   */
  getMinimumSpan(axis: number): number {
    return this.view.getMinimumSpan(axis);
  }
  /**
   * Determines the maximum span for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the span the view would like to be rendered into.
   *         Typically the view is told to render into the span
   *         that is returned, although there is no guarantee.
   *         The parent may choose to resize or break the view.
   */
  getMaximumSpan(axis: number): number {
    return Math.fround(2147483647);
  }
  /**
   * Specifies that a preference has changed.
   * Child views can call this on the parent to indicate that
   * the preference has changed.  The root view routes this to
   * invalidate on the hosting component.
   * <p>
   * This can be called on a different thread from the
   * event dispatching thread and is basically unsafe to
   * propagate into the component.  To make this safe,
   * the operation is transferred over to the event dispatching
   * thread for completion.  It is a design goal that all view
   * methods be safe to call without concern for concurrency,
   * and this behavior helps make that true.
   *
   * @param child the child view
   * @param width true if the width preference has changed
   * @param height true if the height preference has changed
   */
  preferenceChanged(child: View, width: boolean, height: boolean): void {
    this.host.revalidate();
    this.host.repaint$();
  }
  /**
   * Determines the desired alignment for this view along an axis.
   *
   * @param axis may be either X_AXIS or Y_AXIS
   * @return the desired alignment, where 0.0 indicates the origin
   *     and 1.0 the full span away from the origin
   */
  getAlignment(axis: number): number {
    return this.view.getAlignment(axis);
  }
  /**
   * Renders the view.
   *
   * @param g the graphics context
   * @param allocation the region to render into
   */
  paint(g: Graphics, allocation: Shape): void {
    let alloc = allocation.getBounds();
    this.view.setSize(Math.fround(alloc.width_), Math.fround(alloc.height_));
    this.view.paint(g, allocation);
  }
  /**
   * Sets the view parent.
   *
   * @param parent the parent view
   */
  setParent(parent: View): void {
    throw new JError('Can\'t set parent on root view');
  }
  /**
   * Returns the number of views in this view.  Since
   * this view simply wraps the root of the view hierarchy
   * it has exactly one child.
   *
   * @return the number of views
   * @see #getView
   */
  getViewCount(): number {
    return 1;
  }
  /**
   * Gets the n-th view in this container.
   *
   * @param n the number of the view to get
   * @return the view
   */
  getView(n: number): View {
    return this.view;
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param pos the position to convert
   * @param a the allocated region to render into
   * @return the bounding box of the given position
   */
  modelToView$int$Shape$Bias(pos: number, a: Shape, b: Position$Bias): Shape {
    return this.view.modelToView$int$Shape$Bias(pos, a, b);
  }
  /**
   * Provides a mapping from the document model coordinate space
   * to the coordinate space of the view mapped to it.
   *
   * @param p0 the position to convert >= 0
   * @param b0 the bias toward the previous character or the
   *  next character represented by p0, in case the
   *  position is a boundary of two views.
   * @param p1 the position to convert >= 0
   * @param b1 the bias toward the previous character or the
   *  next character represented by p1, in case the
   *  position is a boundary of two views.
   * @param a the allocated region to render into
   * @return the bounding box of the given position is returned
   * @throws BadLocationException  if the given position does
   *   not represent a valid location in the associated document
   * @throws IllegalArgumentException for an invalid bias argument
   * @see View#viewToModel
   */
  modelToView$int$Bias$int$Bias$Shape(p0: number, b0: Position$Bias, p1: number, b1: Position$Bias, a: Shape): Shape {
    return this.view.modelToView$int$Bias$int$Bias$Shape(p0, b0, p1, b1, a);
  }
  /**
   * Provides a mapping from the view coordinate space to the logical
   * coordinate space of the model.
   *
   * @param x x coordinate of the view location to convert
   * @param y y coordinate of the view location to convert
   * @param a the allocated region to render into
   * @return the location within the model that best represents the
   *    given point in the view
   */
  viewToModel$float$float$Shape$BiasArr(x: number, y: number, a: Shape, bias: Position$Bias[]): number {
    return this.view.viewToModel$float$float$Shape$BiasArr(x, y, a, bias);
  }
  /**
   * Returns the document model underlying the view.
   *
   * @return the model
   */
  getDocument(): Document {
    return this.view.getDocument();
  }
  /**
   * Returns the starting offset into the model for this view.
   *
   * @return the starting offset
   */
  getStartOffset(): number {
    return this.view.getStartOffset();
  }
  /**
   * Returns the ending offset into the model for this view.
   *
   * @return the ending offset
   */
  getEndOffset(): number {
    return this.view.getEndOffset();
  }
  /**
   * Gets the element that this view is mapped to.
   *
   * @return the view
   */
  getElement(): Element {
    return this.view.getElement();
  }
  /**
   * Sets the view size.
   *
   * @param width the width
   * @param height the height
   */
  setSize(width: number, height: number): void {
    this.width_ = $J.d2i(width);
    this.view.setSize(width, height);
  }
  /**
   * Fetches the container hosting the view.  This is useful for
   * things like scheduling a repaint, finding out the host
   * components font, etc.  The default implementation
   * of this is to forward the query to the parent view.
   *
   * @return the container
   */
  getContainer(): Container {
    return this.host;
  }
  /**
   * Fetches the factory to be used for building the
   * various view fragments that make up the view that
   * represents the model.  This is what determines
   * how the model will be represented.  This is implemented
   * to fetch the factory provided by the associated
   * EditorKit.
   *
   * @return the factory
   */
  getViewFactory(): ViewFactory {
    return this.factory;
  }
}

$J.define(BasicHTML, 'javax.swing.plaf.basic.BasicHTML', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_BasicHTML' }, meths: { 'getBaseline(javax.swing.text.View,java.awt.Shape)': 'getBaseline$View$Shape', 'getBaseline(javax.swing.text.View,int,int)': 'getBaseline$View$int$int', 'getBaseline(javax.swing.JComponent,int,int,int,int)': 'getBaseline$JComponent$int$int$int$int' } });
$J.define(BasicHTML$BasicEditorKit, 'javax.swing.plaf.basic.BasicHTML$BasicEditorKit', { kind: 'class', sup: 'javax.swing.text.html.HTMLEditorKit', ctors: { '': '_BasicHTML$BasicEditorKit' }, meths: { 'createDefaultDocument(java.awt.Font,java.awt.Color)': 'createDefaultDocument$Font$Color' } });
$J.define(BasicHTML$BasicHTMLViewFactory, 'javax.swing.plaf.basic.BasicHTML$BasicHTMLViewFactory', { kind: 'class', sup: 'javax.swing.text.html.HTMLEditorKit$HTMLFactory', ctors: { '': '_BasicHTML$BasicHTMLViewFactory' }, clinit: true, lazy: ['useOV'] });
$J.define(BasicHTML$BasicDocument, 'javax.swing.plaf.basic.BasicHTML$BasicDocument', { kind: 'class', sup: 'javax.swing.text.html.HTMLDocument', ctors: { 'javax.swing.text.html.StyleSheet,java.awt.Font,java.awt.Color': '_BasicHTML$BasicDocument' } });
$J.define(BasicHTML$Renderer, 'javax.swing.plaf.basic.BasicHTML$Renderer', { kind: 'class', sup: 'javax.swing.text.View', ctors: { 'javax.swing.JComponent,javax.swing.text.ViewFactory,javax.swing.text.View': '_BasicHTML$Renderer' }, meths: { 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,javax.swing.text.Position$Bias,int,javax.swing.text.Position$Bias,java.awt.Shape)': 'modelToView$int$Bias$int$Bias$Shape', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias' } });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  ParagraphView = $J.load('javax.swing.text.ParagraphView');
  StyleConstants = $J.load('javax.swing.text.StyleConstants');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
