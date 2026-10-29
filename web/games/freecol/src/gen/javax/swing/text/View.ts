// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/text/View.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2015, Oracle and/or its affiliates. All rights reserved.
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
import { $J, IllegalArgumentException, JObject } from '../../../../jre/index.ts';

let Rectangle, SwingConstants, DocumentEvent$EventType, BadLocationException, Position$Bias, Utilities;

/**
 * <p>
 * A very important part of the text package is the <code>View</code> class.
 * As the name suggests it represents a view of the text model,
 * or a piece of the text model.
 * It is this class that is responsible for the look of the text component.
 * The view is not intended to be some completely new thing that one must
 * learn, but rather is much like a lightweight component.
 * <p>
 * By default, a view is very light.  It contains a reference to the parent
 * view from which it can fetch many things without holding state, and it
 * contains a reference to a portion of the model (<code>Element</code>).
 * A view does not
 * have to exactly represent an element in the model, that is simply a typical
 * and therefore convenient mapping.  A view can alternatively maintain a couple
 * of Position objects to maintain its location in the model (i.e. represent
 * a fragment of an element).  This is typically the result of formatting where
 * views have been broken down into pieces.  The convenience of a substantial
 * relationship to the element makes it easier to build factories to produce the
 * views, and makes it easier  to keep track of the view pieces as the model is
 * changed and the view must be changed to reflect the model.  Simple views
 * therefore represent an Element directly and complex views do not.
 * <p>
 * A view has the following responsibilities:
 *  <dl>
 *
 *    <dt><b>Participate in layout.</b>
 *    <dd>
 *    <p>The view has a <code>setSize</code> method which is like
 *    <code>doLayout</code> and <code>setSize</code> in <code>Component</code> combined.
 *    The view has a <code>preferenceChanged</code> method which is
 *    like <code>invalidate</code> in <code>Component</code> except that one can
 *    invalidate just one axis
 *    and the child requesting the change is identified.
 *    <p>A View expresses the size that it would like to be in terms of three
 *    values, a minimum, a preferred, and a maximum span.  Layout in a view is
 *    can be done independently upon each axis.  For a properly functioning View
 *    implementation, the minimum span will be &lt;= the preferred span which in turn
 *    will be &lt;= the maximum span.
 *    </p>
 *    <p style="text-align:center"><img src="doc-files/View-flexibility.jpg"
 *                     alt="The above text describes this graphic.">
 *    <p>The minimum set of methods for layout are:
 *    <ul>
 *    <li>{@link #getMinimumSpan(int) getMinimumSpan}
 *    <li>{@link #getPreferredSpan(int) getPreferredSpan}
 *    <li>{@link #getMaximumSpan(int) getMaximumSpan}
 *    <li>{@link #getAlignment(int) getAlignment}
 *    <li>{@link #preferenceChanged(javax.swing.text.View, boolean, boolean) preferenceChanged}
 *    <li>{@link #setSize(float, float) setSize}
 *    </ul>
 *
 *  <p>The <code>setSize</code> method should be prepared to be called a number of times
 *    (i.e. It may be called even if the size didn't change).
 *    The <code>setSize</code> method
 *    is generally called to make sure the View layout is complete prior to trying
 *    to perform an operation on it that requires an up-to-date layout.  A view's
 *    size should <em>always</em> be set to a value within the minimum and maximum
 *    span specified by that view.  Additionally, the view must always call the
 *    <code>preferenceChanged</code> method on the parent if it has changed the
 *    values for the
 *    layout it would like, and expects the parent to honor.  The parent View is
 *    not required to recognize a change until the <code>preferenceChanged</code>
 *    has been sent.
 *    This allows parent View implementations to cache the child requirements if
 *    desired.  The calling sequence looks something like the following:
 *    </p>
 *    <p style="text-align:center">
 *      <img src="doc-files/View-layout.jpg"
 *       alt="Sample calling sequence between parent view and child view:
 *       setSize, getMinimum, getPreferred, getMaximum, getAlignment, setSize">
 *    <p>The exact calling sequence is up to the layout functionality of
 *    the parent view (if the view has any children).  The view may collect
 *    the preferences of the children prior to determining what it will give
 *    each child, or it might iteratively update the children one at a time.
 *    </p>
 *
 *    <dt><b>Render a portion of the model.</b>
 *    <dd>
 *    <p>This is done in the paint method, which is pretty much like a component
 *    paint method.  Views are expected to potentially populate a fairly large
 *    tree.  A <code>View</code> has the following semantics for rendering:
 *    </p>
 *    <ul>
 *    <li>The view gets its allocation from the parent at paint time, so it
 *    must be prepared to redo layout if the allocated area is different from
 *    what it is prepared to deal with.
 *    <li>The coordinate system is the same as the hosting <code>Component</code>
 *    (i.e. the <code>Component</code> returned by the
 *    {@link #getContainer getContainer} method).
 *    This means a child view lives in the same coordinate system as the parent
 *    view unless the parent has explicitly changed the coordinate system.
 *    To schedule itself to be repainted a view can call repaint on the hosting
 *    <code>Component</code>.
 *    <li>The default is to <em>not clip</em> the children.  It is more efficient
 *    to allow a view to clip only if it really feels it needs clipping.
 *    <li>The <code>Graphics</code> object given is not initialized in any way.
 *    A view should set any settings needed.
 *    <li>A <code>View</code> is inherently transparent.  While a view may render into its
 *    entire allocation, typically a view does not.  Rendering is performed by
 *    traversing down the tree of <code>View</code> implementations.
 *    Each <code>View</code> is responsible
 *    for rendering its children.  This behavior is depended upon for thread
 *    safety.  While view implementations do not necessarily have to be implemented
 *    with thread safety in mind, other view implementations that do make use of
 *    concurrency can depend upon a tree traversal to guarantee thread safety.
 *    <li>The order of views relative to the model is up to the implementation.
 *    Although child views will typically be arranged in the same order that they
 *    occur in the model, they may be visually arranged in an entirely different
 *    order.  View implementations may have Z-Order associated with them if the
 *    children are overlapping.
 *    </ul>
 *    <p>The methods for rendering are:
 *    <ul>
 *    <li>{@link #paint(java.awt.Graphics, java.awt.Shape) paint}
 *    </ul>
 *
 *    <dt><b>Translate between the model and view coordinate systems.</b>
 *    <dd>
 *    <p>Because the view objects are produced from a factory and therefore cannot
 *    necessarily be counted upon to be in a particular pattern, one must be able
 *    to perform translation to properly locate spatial representation of the model.
 *    The methods for doing this are:
 *    <ul>
 *    <li>{@link #modelToView(int, javax.swing.text.Position.Bias, int, javax.swing.text.Position.Bias, java.awt.Shape) modelToView}
 *    <li>{@link #viewToModel(float, float, java.awt.Shape, javax.swing.text.Position.Bias[]) viewToModel}
 *    <li>{@link #getDocument() getDocument}
 *    <li>{@link #getElement() getElement}
 *    <li>{@link #getStartOffset() getStartOffset}
 *    <li>{@link #getEndOffset() getEndOffset}
 *    </ul>
 *    <p>The layout must be valid prior to attempting to make the translation.
 *    The translation is not valid, and must not be attempted while changes
 *    are being broadcasted from the model via a <code>DocumentEvent</code>.
 *    </p>
 *
 *    <dt><b>Respond to changes from the model.</b>
 *    <dd>
 *    <p>If the overall view is represented by many pieces (which is the best situation
 *    if one want to be able to change the view and write the least amount of new code),
 *    it would be impractical to have a huge number of <code>DocumentListener</code>s.
 *    If each
 *    view listened to the model, only a few would actually be interested in the
 *    changes broadcasted at any given time.   Since the model has no knowledge of
 *    views, it has no way to filter the broadcast of change information.  The view
 *    hierarchy itself is instead responsible for propagating the change information.
 *    At any level in the view hierarchy, that view knows enough about its children to
 *    best distribute the change information further.   Changes are therefore broadcasted
 *    starting from the root of the view hierarchy.
 *    The methods for doing this are:
 *    <ul>
 *    <li>{@link #insertUpdate insertUpdate}
 *    <li>{@link #removeUpdate removeUpdate}
 *    <li>{@link #changedUpdate changedUpdate}
 *    </ul>
 * </dl>
 *
 * @author  Timothy Prinzing
 */
export class View extends JObject {
  /**
   * The weight to indicate a view is a bad break
   * opportunity for the purpose of formatting.  This
   * value indicates that no attempt should be made to
   * break the view into fragments as the view has
   * not been written to support fragmenting.
   *
   * @see #getBreakWeight
   * @see #GoodBreakWeight
   * @see #ExcellentBreakWeight
   * @see #ForcedBreakWeight
   */
  static readonly BadBreakWeight: number = 0;
  /**
   * The weight to indicate a view supports breaking,
   * but better opportunities probably exist.
   *
   * @see #getBreakWeight
   * @see #BadBreakWeight
   * @see #ExcellentBreakWeight
   * @see #ForcedBreakWeight
   */
  static readonly GoodBreakWeight: number = 1000;
  /**
   * The weight to indicate a view supports breaking,
   * and this represents a very attractive place to
   * break.
   *
   * @see #getBreakWeight
   * @see #BadBreakWeight
   * @see #GoodBreakWeight
   * @see #ForcedBreakWeight
   */
  static readonly ExcellentBreakWeight: number = 2000;
  /**
   * The weight to indicate a view supports breaking,
   * and must be broken to be represented properly
   * when placed in a view that formats its children
   * by breaking them.
   *
   * @see #getBreakWeight
   * @see #BadBreakWeight
   * @see #GoodBreakWeight
   * @see #ExcellentBreakWeight
   */
  static readonly ForcedBreakWeight: number = 3000;
  /**
   * Axis for format/break operations.
   */
  static readonly X_AXIS: number = 0;
  /**
   * Axis for format/break operations.
   */
  static readonly Y_AXIS: number = 1;
  static sharedBiasReturn: Position$Bias[] = null;
  parent: View = null;
  elem: Element = null;
  /**
   * The index of the first child view to be notified.
   */
  firstUpdateIndex: number = 0;
  /**
   * The index of the last child view to be notified.
   */
  lastUpdateIndex: number = 0;
  /**
   * Creates a new <code>View</code> object.
   *
   * @param elem the <code>Element</code> to represent
   */
  _View(elem: Element): this {
    this.elem = elem;
    return this;
  }
  /**
   * Returns the parent of the view.
   *
   * @return the parent, or <code>null</code> if none exists
   */
  getParent(): View {
    return this.parent;
  }
  /**
   * Determines the minimum span for this view along an
   * axis.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @return  the minimum span the view can be rendered into
   * @see View#getPreferredSpan
   */
  getMinimumSpan(axis: number): number {
    let w = this.getResizeWeight(axis);
    if (w === 0) {
      return this.getPreferredSpan(axis);
    }
    return 0;
  }
  /**
   * Determines the maximum span for this view along an
   * axis.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @return  the maximum span the view can be rendered into
   * @see View#getPreferredSpan
   */
  getMaximumSpan(axis: number): number {
    let w = this.getResizeWeight(axis);
    if (w === 0) {
      return this.getPreferredSpan(axis);
    }
    return Math.fround(2147483647);
  }
  /**
   * Child views can call this on the parent to indicate that
   * the preference has changed and should be reconsidered
   * for layout.  By default this just propagates upward to
   * the next parent.  The root view will call
   * <code>revalidate</code> on the associated text component.
   *
   * @param child the child view
   * @param width true if the width preference has changed
   * @param height true if the height preference has changed
   * @see javax.swing.JComponent#revalidate
   */
  preferenceChanged(child: View, width: boolean, height: boolean): void {
    let parent = this.getParent();
    if (parent != null) {
      parent.preferenceChanged(this, width, height);
    }
  }
  /**
   * Determines the desired alignment for this view along an
   * axis.  The desired alignment is returned.  This should be
   * a value &gt;= 0.0 and &lt;= 1.0, where 0 indicates alignment at
   * the origin and 1.0 indicates alignment to the full span
   * away from the origin.  An alignment of 0.5 would be the
   * center of the view.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @return the value 0.5
   */
  getAlignment(axis: number): number {
    return 0.5;
  }
  /**
   * Establishes the parent view for this view.  This is
   * guaranteed to be called before any other methods if the
   * parent view is functioning properly.  This is also
   * the last method called, since it is called to indicate
   * the view has been removed from the hierarchy as
   * well. When this method is called to set the parent to
   * null, this method does the same for each of its children,
   * propagating the notification that they have been
   * disconnected from the view tree. If this is
   * reimplemented, <code>super.setParent()</code> should
   * be called.
   *
   * @param parent the new parent, or <code>null</code> if the view is
   *          being removed from a parent
   */
  setParent(parent: View): void {
    if (parent == null) {
      for (let i = 0; i < this.getViewCount(); i++) {
        if (this.getView(i).getParent() === this) {
          this.getView(i).setParent(null);
        }
      }
    }
    this.parent = parent;
  }
  /**
   * Returns the number of views in this view.  Since
   * the default is to not be a composite view this
   * returns 0.
   *
   * @return the number of views &gt;= 0
   */
  getViewCount(): number {
    return 0;
  }
  /**
   * Gets the <i>n</i>th child view.  Since there are no
   * children by default, this returns <code>null</code>.
   *
   * @param n the number of the view to get, &gt;= 0 &amp;&amp; &lt; getViewCount()
   * @return the view
   */
  getView(n: number): View {
    return null;
  }
  /**
   * Appends a single child view.  This is a convenience
   * call to <code>replace</code>.
   *
   * @param v the view
   * @see #replace
   * @since 1.3
   */
  append(v: View): void {
    let one = $J.newArray(1, null);
    one[0] = v;
    this.replace(this.getViewCount(), 0, one);
  }
  /**
   * Replaces child views.  If there are no views to remove
   * this acts as an insert.  If there are no views to
   * add this acts as a remove.  Views being removed will
   * have the parent set to <code>null</code>, and the internal reference
   * to them removed so that they can be garbage collected.
   * This is implemented to do nothing, because by default
   * a view has no children.
   *
   * @param offset the starting index into the child views to insert
   *   the new views.  This should be a value &gt;= 0 and &lt;= getViewCount
   * @param length the number of existing child views to remove
   *   This should be a value &gt;= 0 and &lt;= (getViewCount() - offset).
   * @param views the child views to add.  This value can be
   *   <code>null</code> to indicate no children are being added
   *   (useful to remove).
   * @since 1.3
   */
  replace(offset: number, length: number, views: View[]): void {
  }
  /**
   * Returns the child view index representing the given position in
   * the model.  By default a view has no children so this is implemented
   * to return -1 to indicate there is no valid child index for any
   * position.
   *
   * @param pos the position &gt;= 0
   * @param b the bias
   * @return  index of the view representing the given position, or
   *   -1 if no view represents that position
   * @since 1.3
   */
  getViewIndex$int$Bias(pos: number, b: Position$Bias): number {
    return -1;
  }
  /**
   * Fetches the allocation for the given child view.
   * This enables finding out where various views
   * are located, without assuming how the views store
   * their location.  This returns <code>null</code> since the
   * default is to not have any child views.
   *
   * @param index the index of the child, &gt;= 0 &amp;&amp; &lt;
   *          <code>getViewCount()</code>
   * @param a  the allocation to this view
   * @return the allocation to the child
   */
  getChildAllocation(index: number, a: Shape): Shape {
    return null;
  }
  /**
   * Provides a way to determine the next visually represented model
   * location at which one might place a caret.
   * Some views may not be visible,
   * they might not be in the same order found in the model, or they just
   * might not allow access to some of the locations in the model.
   * This method enables specifying a position to convert
   * within the range of &gt;=0.  If the value is -1, a position
   * will be calculated automatically.  If the value &lt; -1,
   * the {@code BadLocationException} will be thrown.
   *
   * @param pos the position to convert
   * @param b the bias
   * @param a the allocated region in which to render
   * @param direction the direction from the current position that can
   *  be thought of as the arrow keys typically found on a keyboard.
   *  This will be one of the following values:
   * <ul>
   * <li>SwingConstants.WEST
   * <li>SwingConstants.EAST
   * <li>SwingConstants.NORTH
   * <li>SwingConstants.SOUTH
   * </ul>
   * @param biasRet the returned bias
   * @return the location within the model that best represents the next
   *  location visual position
   * @throws BadLocationException the given position is not a valid
   *                                 position within the document
   * @throws IllegalArgumentException if <code>direction</code>
   *          doesn't have one of the legal values above
   */
  getNextVisualPositionFrom(pos: number, b: Position$Bias, a: Shape, direction: number, biasRet: Position$Bias[]): number {
    if (pos < -1 || pos > this.getDocument().getLength()) {
      throw new BadLocationException()._BadLocationException('Invalid position', pos);
    }
    biasRet[0] = Position$Bias.Forward;
    switch (direction) {
      case SwingConstants.NORTH:
      case SwingConstants.SOUTH:
        {
          if (pos === -1) {
            pos = (direction === SwingConstants.NORTH) ? Math.max(0, (this.getEndOffset() - 1) | 0) : this.getStartOffset();
            break;
          }
          let target = this.getContainer();
          let c = (target != null) ? target.getCaret() : null;
          let mcp: Point;
          if (c != null) {
            mcp = c.getMagicCaretPosition();
          } else {
            mcp = null;
          }
          let x: number;
          if (mcp == null) {
            let loc = target.modelToView(pos);
            x = (loc == null) ? 0 : loc.x_;
          } else {
            x = mcp.x_;
          }
          if (direction === SwingConstants.NORTH) {
            pos = Utilities.getPositionAbove$JTextComponent$int$int(target, pos, x);
          } else {
            pos = Utilities.getPositionBelow$JTextComponent$int$int(target, pos, x);
          }
        }
        break;
      case SwingConstants.WEST:
        if (pos === -1) {
          pos = Math.max(0, (this.getEndOffset() - 1) | 0);
        } else {
          pos = Math.max(0, (pos - 1) | 0);
        }
        break;
      case SwingConstants.EAST:
        if (pos === -1) {
          pos = this.getStartOffset();
        } else {
          pos = Math.min((pos + 1) | 0, this.getDocument().getLength());
        }
        break;
      default:
        throw new IllegalArgumentException('Bad direction: ' + direction);
    }
    return pos;
  }
  /**
   * Provides a mapping, for a given region,
   * from the document model coordinate space
   * to the view coordinate space. The specified region is
   * created as a union of the first and last character positions.
   *
   * @param p0 the position of the first character (&gt;=0)
   * @param b0 the bias of the first character position,
   *  toward the previous character or the
   *  next character represented by the offset, in case the
   *  position is a boundary of two views; <code>b0</code> will have one
   *  of these values:
   * <ul style="list-style-type:none">
   * <li> <code>Position.Bias.Forward</code>
   * <li> <code>Position.Bias.Backward</code>
   * </ul>
   * @param p1 the position of the last character (&gt;=0)
   * @param b1 the bias for the second character position, defined
   *          one of the legal values shown above
   * @param a the area of the view, which encompasses the requested region
   * @return the bounding box which is a union of the region specified
   *          by the first and last character positions
   * @throws BadLocationException  if the given position does
   *   not represent a valid location in the associated document
   * @throws IllegalArgumentException if <code>b0</code> or
   *          <code>b1</code> are not one of the
   *          legal <code>Position.Bias</code> values listed above
   * @see View#viewToModel
   */
  modelToView$int$Bias$int$Bias$Shape(p0: number, b0: Position$Bias, p1: number, b1: Position$Bias, a: Shape): Shape {
    let s0 = this.modelToView$int$Shape$Bias(p0, a, b0);
    let s1: Shape;
    if (p1 === this.getEndOffset()) {
      try {
        s1 = this.modelToView$int$Shape$Bias(p1, a, b1);
      } catch ($e0) {
        if ($J.isa($e0, BadLocationException)) {
          let ble = $J.exc($e0);
          s1 = null;
        } else {
          throw $e0;
        }
      }
      if (s1 == null) {
        let alloc = (a instanceof Rectangle) ? a : a.getBounds();
        s1 = new Rectangle()._Rectangle$int$int$int$int((alloc.x_ + alloc.width_ - 1) | 0, alloc.y_, 1, alloc.height_);
      }
    } else {
      s1 = this.modelToView$int$Shape$Bias(p1, a, b1);
    }
    let r0 = s0.getBounds();
    let r1 = (s1 instanceof Rectangle) ? s1 : s1.getBounds();
    if (r0.y_ !== r1.y_) {
      let alloc = (a instanceof Rectangle) ? a : a.getBounds();
      r0.x_ = alloc.x_;
      r0.width_ = alloc.width_;
    }
    r0.add$Rectangle(r1);
    return r0;
  }
  /**
   * Gives notification that something was inserted into
   * the document in a location that this view is responsible for.
   * To reduce the burden to subclasses, this functionality is
   * spread out into the following calls that subclasses can
   * reimplement:
   * <ol>
   * <li>{@link #updateChildren updateChildren} is called
   * if there were any changes to the element this view is
   * responsible for.  If this view has child views that are
   * represent the child elements, then this method should do
   * whatever is necessary to make sure the child views correctly
   * represent the model.
   * <li>{@link #forwardUpdate forwardUpdate} is called
   * to forward the DocumentEvent to the appropriate child views.
   * <li>{@link #updateLayout updateLayout} is called to
   * give the view a chance to either repair its layout, to reschedule
   * layout, or do nothing.
   * </ol>
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#removeUpdate
   * @see View#changedUpdate
   */
  insertUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    if (this.getViewCount() > 0) {
      let elem = this.getElement();
      let ec = e.getChange(elem);
      if (ec != null) {
        if (!this.updateChildren$ElementChange$DocumentEvent$ViewFactory(ec, e, f)) {
          ec = null;
        }
      }
      this.forwardUpdate(ec, e, a, f);
      this.updateLayout(ec, e, a);
    }
  }
  /**
   * Gives notification that something was removed from the document
   * in a location that this view is responsible for.
   * To reduce the burden to subclasses, this functionality is
   * spread out into the following calls that subclasses can
   * reimplement:
   * <ol>
   * <li>{@link #updateChildren updateChildren} is called
   * if there were any changes to the element this view is
   * responsible for.  If this view has child views that are
   * represent the child elements, then this method should do
   * whatever is necessary to make sure the child views correctly
   * represent the model.
   * <li>{@link #forwardUpdate forwardUpdate} is called
   * to forward the DocumentEvent to the appropriate child views.
   * <li>{@link #updateLayout updateLayout} is called to
   * give the view a chance to either repair its layout, to reschedule
   * layout, or do nothing.
   * </ol>
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#insertUpdate
   * @see View#changedUpdate
   */
  removeUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    if (this.getViewCount() > 0) {
      let elem = this.getElement();
      let ec = e.getChange(elem);
      if (ec != null) {
        if (!this.updateChildren$ElementChange$DocumentEvent$ViewFactory(ec, e, f)) {
          ec = null;
        }
      }
      this.forwardUpdate(ec, e, a, f);
      this.updateLayout(ec, e, a);
    }
  }
  /**
   * Gives notification from the document that attributes were changed
   * in a location that this view is responsible for.
   * To reduce the burden to subclasses, this functionality is
   * spread out into the following calls that subclasses can
   * reimplement:
   * <ol>
   * <li>{@link #updateChildren updateChildren} is called
   * if there were any changes to the element this view is
   * responsible for.  If this view has child views that are
   * represent the child elements, then this method should do
   * whatever is necessary to make sure the child views correctly
   * represent the model.
   * <li>{@link #forwardUpdate forwardUpdate} is called
   * to forward the DocumentEvent to the appropriate child views.
   * <li>{@link #updateLayout updateLayout} is called to
   * give the view a chance to either repair its layout, to reschedule
   * layout, or do nothing.
   * </ol>
   *
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see View#insertUpdate
   * @see View#removeUpdate
   */
  changedUpdate(e: DocumentEvent, a: Shape, f: ViewFactory): void {
    if (this.getViewCount() > 0) {
      let elem = this.getElement();
      let ec = e.getChange(elem);
      if (ec != null) {
        if (!this.updateChildren$ElementChange$DocumentEvent$ViewFactory(ec, e, f)) {
          ec = null;
        }
      }
      this.forwardUpdate(ec, e, a, f);
      this.updateLayout(ec, e, a);
    }
  }
  /**
   * Fetches the model associated with the view.
   *
   * @return the view model, <code>null</code> if none
   */
  getDocument(): Document {
    return this.elem.getDocument();
  }
  /**
   * Fetches the portion of the model for which this view is
   * responsible.
   *
   * @return the starting offset into the model &gt;= 0
   * @see View#getEndOffset
   */
  getStartOffset(): number {
    return this.elem.getStartOffset();
  }
  /**
   * Fetches the portion of the model for which this view is
   * responsible.
   *
   * @return the ending offset into the model &gt;= 0
   * @see View#getStartOffset
   */
  getEndOffset(): number {
    return this.elem.getEndOffset();
  }
  /**
   * Fetches the structural portion of the subject that this
   * view is mapped to.  The view may not be responsible for the
   * entire portion of the element.
   *
   * @return the subject
   */
  getElement(): Element {
    return this.elem;
  }
  /**
   * Fetches the attributes to use when rendering.  By default
   * this simply returns the attributes of the associated element.
   * This method should be used rather than using the element
   * directly to obtain access to the attributes to allow
   * view-specific attributes to be mixed in or to allow the
   * view to have view-specific conversion of attributes by
   * subclasses.
   * Each view should document what attributes it recognizes
   * for the purpose of rendering or layout, and should always
   * access them through the <code>AttributeSet</code> returned
   * by this method.
   * @return the attributes to use when rendering
   */
  getAttributes(): AttributeSet {
    return this.elem.getAttributes();
  }
  /**
   * Tries to break this view on the given axis.  This is
   * called by views that try to do formatting of their
   * children.  For example, a view of a paragraph will
   * typically try to place its children into row and
   * views representing chunks of text can sometimes be
   * broken down into smaller pieces.
   * <p>
   * This is implemented to return the view itself, which
   * represents the default behavior on not being
   * breakable.  If the view does support breaking, the
   * starting offset of the view returned should be the
   * given offset, and the end offset should be less than
   * or equal to the end offset of the view being broken.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @param offset the location in the document model
   *   that a broken fragment would occupy &gt;= 0.  This
   *   would be the starting offset of the fragment
   *   returned
   * @param pos the position along the axis that the
   *  broken view would occupy &gt;= 0.  This may be useful for
   *  things like tab calculations
   * @param len specifies the distance along the axis
   *  where a potential break is desired &gt;= 0
   * @return the fragment of the view that represents the
   *  given span, if the view can be broken.  If the view
   *  doesn't support breaking behavior, the view itself is
   *  returned.
   * @see ParagraphView
   */
  breakView$int$int$float$float(axis: number, offset: number, pos: number, len: number): View {
    return this;
  }
  /**
   * Creates a view that represents a portion of the element.
   * This is potentially useful during formatting operations
   * for taking measurements of fragments of the view.  If
   * the view doesn't support fragmenting (the default), it
   * should return itself.
   *
   * @param p0 the starting offset &gt;= 0.  This should be a value
   *   greater or equal to the element starting offset and
   *   less than the element ending offset.
   * @param p1 the ending offset &gt; p0.  This should be a value
   *   less than or equal to the elements end offset and
   *   greater than the elements starting offset.
   * @return the view fragment, or itself if the view doesn't
   *   support breaking into fragments
   * @see LabelView
   */
  createFragment(p0: number, p1: number): View {
    return this;
  }
  /**
   * Determines how attractive a break opportunity in
   * this view is.  This can be used for determining which
   * view is the most attractive to call <code>breakView</code>
   * on in the process of formatting.  A view that represents
   * text that has whitespace in it might be more attractive
   * than a view that has no whitespace, for example.  The
   * higher the weight, the more attractive the break.  A
   * value equal to or lower than <code>BadBreakWeight</code>
   * should not be considered for a break.  A value greater
   * than or equal to <code>ForcedBreakWeight</code> should
   * be broken.
   * <p>
   * This is implemented to provide the default behavior
   * of returning <code>BadBreakWeight</code> unless the length
   * is greater than the length of the view in which case the
   * entire view represents the fragment.  Unless a view has
   * been written to support breaking behavior, it is not
   * attractive to try and break the view.  An example of
   * a view that does support breaking is <code>LabelView</code>.
   * An example of a view that uses break weight is
   * <code>ParagraphView</code>.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @param pos the potential location of the start of the
   *   broken view &gt;= 0.  This may be useful for calculating tab
   *   positions
   * @param len specifies the relative length from <em>pos</em>
   *   where a potential break is desired &gt;= 0
   * @return the weight, which should be a value between
   *   ForcedBreakWeight and BadBreakWeight
   * @see LabelView
   * @see ParagraphView
   * @see #BadBreakWeight
   * @see #GoodBreakWeight
   * @see #ExcellentBreakWeight
   * @see #ForcedBreakWeight
   */
  getBreakWeight$int$float$float(axis: number, pos: number, len: number): number {
    if (len > this.getPreferredSpan(axis)) {
      return View.GoodBreakWeight;
    }
    return View.BadBreakWeight;
  }
  /**
   * Determines the resizability of the view along the
   * given axis.  A value of 0 or less is not resizable.
   *
   * @param axis may be either <code>View.X_AXIS</code> or
   *          <code>View.Y_AXIS</code>
   * @return the weight
   */
  getResizeWeight(axis: number): number {
    return 0;
  }
  /**
   * Sets the size of the view.  This should cause
   * layout of the view along the given axis, if it
   * has any layout duties.
   *
   * @param width the width &gt;= 0
   * @param height the height &gt;= 0
   */
  setSize(width: number, height: number): void {
  }
  /**
   * Fetches the container hosting the view.  This is useful for
   * things like scheduling a repaint, finding out the host
   * components font, etc.  The default implementation
   * of this is to forward the query to the parent view.
   *
   * @return the container, <code>null</code> if none
   */
  getContainer(): Container {
    let v = this.getParent();
    return (v != null) ? v.getContainer() : null;
  }
  /**
   * Fetches the <code>ViewFactory</code> implementation that is feeding
   * the view hierarchy.  Normally the views are given this
   * as an argument to updates from the model when they
   * are most likely to need the factory, but this
   * method serves to provide it at other times.
   *
   * @return the factory, <code>null</code> if none
   */
  getViewFactory(): ViewFactory {
    let v = this.getParent();
    return (v != null) ? v.getViewFactory() : null;
  }
  /**
   * Returns the tooltip text at the specified location. The default
   * implementation returns the value from the child View identified by
   * the passed in location.
   * @param x the x coordinate
   * @param y the y coordinate
   * @param allocation current allocation of the View.
   * @return the tooltip text at the specified location
   *
   * @since 1.4
   * @see JTextComponent#getToolTipText
   */
  getToolTipText(x: number, y: number, allocation: Shape): string {
    let viewIndex = this.getViewIndex$float$float$Shape(x, y, allocation);
    if (viewIndex >= 0) {
      allocation = this.getChildAllocation(viewIndex, allocation);
      let rect = (allocation instanceof Rectangle) ? allocation : allocation.getBounds();
      if (rect.contains$double$double(x, y)) {
        return this.getView(viewIndex).getToolTipText(x, y, allocation);
      }
    }
    return null;
  }
  /**
   * Returns the child view index representing the given position in
   * the view. This iterates over all the children returning the
   * first with a bounds that contains <code>x</code>, <code>y</code>.
   *
   * @param x the x coordinate
   * @param y the y coordinate
   * @param allocation current allocation of the View.
   * @return  index of the view representing the given location, or
   *   -1 if no view represents that position
   * @since 1.4
   */
  getViewIndex$float$float$Shape(x: number, y: number, allocation: Shape): number {
    for (let counter = (this.getViewCount() - 1) | 0; counter >= 0; counter--) {
      let childAllocation = this.getChildAllocation(counter, allocation);
      if (childAllocation != null) {
        let rect = (childAllocation instanceof Rectangle) ? childAllocation : childAllocation.getBounds();
        if (rect.contains$double$double(x, y)) {
          return counter;
        }
      }
    }
    return -1;
  }
  /**
   * Updates the child views in response to receiving notification
   * that the model changed, and there is change record for the
   * element this view is responsible for.  This is implemented
   * to assume the child views are directly responsible for the
   * child elements of the element this view represents.  The
   * <code>ViewFactory</code> is used to create child views for each element
   * specified as added in the <code>ElementChange</code>, starting at the
   * index specified in the given <code>ElementChange</code>.  The number of
   * child views representing the removed elements specified are
   * removed.
   *
   * @param ec the change information for the element this view
   *  is responsible for.  This should not be <code>null</code> if
   *  this method gets called
   * @param e the change information from the associated document
   * @param f the factory to use to build child views
   * @return whether or not the child views represent the
   *  child elements of the element this view is responsible
   *  for.  Some views create children that represent a portion
   *  of the element they are responsible for, and should return
   *  false.  This information is used to determine if views
   *  in the range of the added elements should be forwarded to
   *  or not
   * @see #insertUpdate
   * @see #removeUpdate
   * @see #changedUpdate
   * @since 1.3
   */
  updateChildren$ElementChange$DocumentEvent$ViewFactory(ec: DocumentEvent$ElementChange, e: DocumentEvent, f: ViewFactory): boolean {
    let removedElems = ec.getChildrenRemoved();
    let addedElems = ec.getChildrenAdded();
    let added = null;
    if (addedElems != null) {
      added = $J.newArray(addedElems.length, null);
      for (let i = 0; i < addedElems.length; i++) {
        added[i] = f.create(addedElems[i]);
      }
    }
    let nremoved = 0;
    let index = ec.getIndex();
    if (removedElems != null) {
      nremoved = removedElems.length;
    }
    this.replace(index, nremoved, added);
    return true;
  }
  /**
   * Forwards the given <code>DocumentEvent</code> to the child views
   * that need to be notified of the change to the model.
   * If there were changes to the element this view is
   * responsible for, that should be considered when
   * forwarding (i.e. new child views should not get
   * notified).
   *
   * @param ec changes to the element this view is responsible
   *  for (may be <code>null</code> if there were no changes).
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see #insertUpdate
   * @see #removeUpdate
   * @see #changedUpdate
   * @since 1.3
   */
  forwardUpdate(ec: DocumentEvent$ElementChange, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    this.calculateUpdateIndexes(e);
    let hole0 = (this.lastUpdateIndex + 1) | 0;
    let hole1 = hole0;
    let addedElems = (ec != null) ? ec.getChildrenAdded() : null;
    if ((addedElems != null) && (addedElems.length > 0)) {
      hole0 = ec.getIndex();
      hole1 = (hole0 + addedElems.length - 1) | 0;
    }
    for (let i = this.firstUpdateIndex; i <= this.lastUpdateIndex; i++) {
      if (!((i >= hole0) && (i <= hole1))) {
        let v = this.getView(i);
        if (v != null) {
          let childAlloc = this.getChildAllocation(i, a);
          this.forwardUpdateToView(v, e, childAlloc, f);
        }
      }
    }
  }
  /**
   * Calculates the first and the last indexes of the child views
   * that need to be notified of the change to the model.
   * @param e the change information from the associated document
   */
  calculateUpdateIndexes(e: DocumentEvent): void {
    let pos = e.getOffset();
    this.firstUpdateIndex = this.getViewIndex$int$Bias(pos, Position$Bias.Forward);
    if (this.firstUpdateIndex === -1 && e.getType() === DocumentEvent$EventType.REMOVE && pos >= this.getEndOffset()) {
      this.firstUpdateIndex = (this.getViewCount() - 1) | 0;
    }
    this.lastUpdateIndex = this.firstUpdateIndex;
    let v = (this.firstUpdateIndex >= 0) ? this.getView(this.firstUpdateIndex) : null;
    if (v != null) {
      if ((v.getStartOffset() === pos) && (pos > 0)) {
        this.firstUpdateIndex = Math.max((this.firstUpdateIndex - 1) | 0, 0);
      }
    }
    if (e.getType() !== DocumentEvent$EventType.REMOVE) {
      this.lastUpdateIndex = this.getViewIndex$int$Bias((pos + e.getLength()) | 0, Position$Bias.Forward);
      if (this.lastUpdateIndex < 0) {
        this.lastUpdateIndex = (this.getViewCount() - 1) | 0;
      }
    }
    this.firstUpdateIndex = Math.max(this.firstUpdateIndex, 0);
  }
  /**
   * Updates the view to reflect the changes.
   */
  updateAfterChange(): void {
  }
  /**
   * Forwards the <code>DocumentEvent</code> to the give child view.  This
   * simply messages the view with a call to <code>insertUpdate</code>,
   * <code>removeUpdate</code>, or <code>changedUpdate</code> depending
   * upon the type of the event.  This is called by
   * {@link #forwardUpdate forwardUpdate} to forward
   * the event to children that need it.
   *
   * @param v the child view to forward the event to
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @param f the factory to use to rebuild if the view has children
   * @see #forwardUpdate
   * @since 1.3
   */
  forwardUpdateToView(v: View, e: DocumentEvent, a: Shape, f: ViewFactory): void {
    let type$ = e.getType();
    if (type$ === DocumentEvent$EventType.INSERT) {
      v.insertUpdate(e, a, f);
    } else if (type$ === DocumentEvent$EventType.REMOVE) {
      v.removeUpdate(e, a, f);
    } else {
      v.changedUpdate(e, a, f);
    }
  }
  /**
   * Updates the layout in response to receiving notification of
   * change from the model.  This is implemented to call
   * <code>preferenceChanged</code> to reschedule a new layout
   * if the <code>ElementChange</code> record is not <code>null</code>.
   *
   * @param ec changes to the element this view is responsible
   *  for (may be <code>null</code> if there were no changes)
   * @param e the change information from the associated document
   * @param a the current allocation of the view
   * @see #insertUpdate
   * @see #removeUpdate
   * @see #changedUpdate
   * @since 1.3
   */
  updateLayout(ec: DocumentEvent$ElementChange, e: DocumentEvent, a: Shape): void {
    if ((ec != null) && (a != null)) {
      this.preferenceChanged(null, true, true);
      let host = this.getContainer();
      if (host != null) {
        host.repaint$();
      }
    }
  }
  static $clinit() {
    View.sharedBiasReturn = $J.newArray(1, null);
  }
}

$J.define(View, 'javax.swing.text.View', { kind: 'class', ifaces: ['javax.swing.SwingConstants'], sup: 'java.lang.Object', ctors: { 'javax.swing.text.Element': '_View' }, meths: { 'viewToModel(float,float,java.awt.Shape)': 'viewToModel$float$float$Shape', 'modelToView(int,java.awt.Shape)': 'modelToView$int$Shape', 'updateChildren(javax.swing.event.DocumentEvent$ElementChange,javax.swing.event.DocumentEvent,javax.swing.text.ViewFactory)': 'updateChildren$ElementChange$DocumentEvent$ViewFactory', 'getViewIndex(float,float,java.awt.Shape)': 'getViewIndex$float$float$Shape', 'getBreakWeight(int,float,float)': 'getBreakWeight$int$float$float', 'breakView(int,int,float,float)': 'breakView$int$int$float$float', 'viewToModel(float,float,java.awt.Shape,javax.swing.text.Position.Bias[])': 'viewToModel$float$float$Shape$BiasArr', 'modelToView(int,javax.swing.text.Position$Bias,int,javax.swing.text.Position$Bias,java.awt.Shape)': 'modelToView$int$Bias$int$Bias$Shape', 'modelToView(int,java.awt.Shape,javax.swing.text.Position$Bias)': 'modelToView$int$Shape$Bias', 'getViewIndex(int,javax.swing.text.Position$Bias)': 'getViewIndex$int$Bias' }, clinit: true, lazy: ['sharedBiasReturn'] });
$J.module(() => {
  Rectangle = $J.load('java.awt.Rectangle');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  DocumentEvent$EventType = $J.load('javax.swing.event.DocumentEvent$EventType');
  BadLocationException = $J.load('javax.swing.text.BadLocationException');
  Position$Bias = $J.load('javax.swing.text.Position$Bias');
  Utilities = $J.load('javax.swing.text.Utilities');
});
