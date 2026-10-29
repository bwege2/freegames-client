// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/TransferHandler.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, ClassNotFoundException, Clipboard, DataFlavor, Exception, IOException, IllegalArgumentException, IllegalStateException, Introspector, JObject, MethodUtil, NullPointerException, RuntimeException, SharedSecrets, SunToolkit, TooManyListenersException, UnsupportedFlavorException } from '../../../jre/index.ts';
import { DropTarget } from '../../java/awt/dnd/DropTarget.ts';
import { DragGestureRecognizer } from '../../java/awt/dnd/DragGestureRecognizer.ts';
import { UIAction } from '../../sun/swing/UIAction.ts';

let GraphicsEnvironment, Insets, Point, Rectangle, DragSource, DropTargetDragEvent, DropTargetListener, MouseEvent, IntrospectionException, Action, JComponent, Scrollable, SwingConstants, UIManager, EventListenerList, AWTAccessor, SwingAccessor, SwingUtilities2;

/**
 * This class is used to handle the transfer of a <code>Transferable</code>
 * to and from Swing components.  The <code>Transferable</code> is used to
 * represent data that is exchanged via a cut, copy, or paste
 * to/from a clipboard.  It is also used in drag-and-drop operations
 * to represent a drag from a component, and a drop to a component.
 * Swing provides functionality that automatically supports cut, copy,
 * and paste keyboard bindings that use the functionality provided by
 * an implementation of this class.  Swing also provides functionality
 * that automatically supports drag and drop that uses the functionality
 * provided by an implementation of this class.  The Swing developer can
 * concentrate on specifying the semantics of a transfer primarily by setting
 * the <code>transferHandler</code> property on a Swing component.
 * <p>
 * This class is implemented to provide a default behavior of transferring
 * a component property simply by specifying the name of the property in
 * the constructor.  For example, to transfer the foreground color from
 * one component to another either via the clipboard or a drag and drop operation
 * a <code>TransferHandler</code> can be constructed with the string "foreground".  The
 * built in support will use the color returned by <code>getForeground</code> as the source
 * of the transfer, and <code>setForeground</code> for the target of a transfer.
 * <p>
 * Please see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/dnd/index.html">
 * How to Use Drag and Drop and Data Transfer</a>,
 * a section in <em>The Java Tutorial</em>, for more information.
 *
 *
 * @author Timothy Prinzing
 * @author Shannon Hickey
 * @since 1.4
 */
export class TransferHandler extends JObject {
  /**
   * An <code>int</code> representing no transfer action.
   */
  static readonly NONE: number = 0;
  /**
   * An <code>int</code> representing a &quot;copy&quot; transfer action.
   * This value is used when data is copied to a clipboard
   * or copied elsewhere in a drag and drop operation.
   */
  static readonly COPY: number = 1;
  /**
   * An <code>int</code> representing a &quot;move&quot; transfer action.
   * This value is used when data is moved to a clipboard (i.e. a cut)
   * or moved elsewhere in a drag and drop operation.
   */
  static readonly MOVE: number = 2;
  /**
   * An <code>int</code> representing a source action capability of either
   * &quot;copy&quot; or &quot;move&quot;.
   */
  static readonly COPY_OR_MOVE: number = 3;
  /**
   * An <code>int</code> representing a &quot;link&quot; transfer action.
   * This value is used to specify that data should be linked in a drag
   * and drop operation.
   *
   * @see java.awt.dnd.DnDConstants#ACTION_LINK
   * @since 1.6
   */
  static readonly LINK: number = 1073741824;
  /**
   * image for the {@code startDrag} method
   *
   * @see java.awt.dnd.DragGestureEvent#startDrag(Cursor dragCursor, Image dragImage, Point imageOffset, Transferable transferable, DragSourceListener dsl)
   */
  dragImage: Image = null;
  /**
   * anchor offset for the {@code startDrag} method
   *
   * @see java.awt.dnd.DragGestureEvent#startDrag(Cursor dragCursor, Image dragImage, Point imageOffset, Transferable transferable, DragSourceListener dsl)
   */
  dragImageOffset: Point = null;
  propertyName: string = null;
  static recognizer: TransferHandler$SwingDragGestureRecognizer = null;
  static cutAction: Action = null;
  static copyAction: Action = null;
  static pasteAction: Action = null;
  /**
   * Constructs a transfer handler that can transfer a Java Bean property
   * from one component to another via the clipboard or a drag and drop
   * operation.
   *
   * @param property  the name of the property to transfer; this can
   *  be <code>null</code> if there is no property associated with the transfer
   *  handler (a subclass that performs some other kind of transfer, for example)
   */
  _TransferHandler$String(property: string): this {
    this.propertyName = property;
    return this;
  }
  /**
   * Convenience constructor for subclasses.
   */
  _TransferHandler$(): this {
    this._TransferHandler$String(null);
    return this;
  }
  /**
   * Returns an {@code Action} that performs cut operations to the
   * clipboard. When performed, this action operates on the {@code JComponent}
   * source of the {@code ActionEvent} by invoking {@code exportToClipboard},
   * with a {@code MOVE} action, on the component's {@code TransferHandler}.
   *
   * @return an {@code Action} for performing cuts to the clipboard
   */
  static getCutAction(): Action {
    return TransferHandler.cutAction;
  }
  /**
   * Returns an {@code Action} that performs copy operations to the
   * clipboard. When performed, this action operates on the {@code JComponent}
   * source of the {@code ActionEvent} by invoking {@code exportToClipboard},
   * with a {@code COPY} action, on the component's {@code TransferHandler}.
   *
   * @return an {@code Action} for performing copies to the clipboard
   */
  static getCopyAction(): Action {
    return TransferHandler.copyAction;
  }
  /**
   * Returns an {@code Action} that performs paste operations from the
   * clipboard. When performed, this action operates on the {@code JComponent}
   * source of the {@code ActionEvent} by invoking {@code importData},
   * with the clipboard contents, on the component's {@code TransferHandler}.
   *
   * @return an {@code Action} for performing pastes from the clipboard
   */
  static getPasteAction(): Action {
    return TransferHandler.pasteAction;
  }
  /**
   * Returns the drag image. If there is no image to drag,
   * the returned value is {@code null}.
   *
   * @return the reference to the drag image
   */
  getDragImage(): Image {
    return this.dragImage;
  }
  /**
   * Returns an anchor offset for the image to drag.
   *
   * @return a {@code Point} object that corresponds
   * to coordinates of an anchor offset of the image
   * relative to the upper left corner of the image.
   * The point {@code (0,0)} returns by default.
   */
  getDragImageOffset(): Point {
    if (this.dragImageOffset == null) {
      return new Point()._Point$int$int(0, 0);
    }
    return new Point()._Point$Point(this.dragImageOffset);
  }
  /**
   * Causes the Swing drag support to be initiated.  This is called by
   * the various UI implementations in the <code>javax.swing.plaf.basic</code>
   * package if the dragEnabled property is set on the component.
   * This can be called by custom UI
   * implementations to use the Swing drag support.  This method can also be called
   * by a Swing extension written as a subclass of <code>JComponent</code>
   * to take advantage of the Swing drag support.
   * <p>
   * The transfer <em>will not necessarily</em> have been completed at the
   * return of this call (i.e. the call does not block waiting for the drop).
   * The transfer will take place through the Swing implementation of the
   * <code>java.awt.dnd</code> mechanism, requiring no further effort
   * from the developer. The <code>exportDone</code> method will be called
   * when the transfer has completed.
   *
   * @param comp  the component holding the data to be transferred;
   *              provided to enable sharing of <code>TransferHandler</code>s
   * @param e     the event that triggered the transfer
   * @param action the transfer action initially requested;
   *               either {@code COPY}, {@code MOVE} or {@code LINK};
   *               the DnD system may change the action used during the
   *               course of the drag operation
   */
  exportAsDrag(comp: JComponent, e: InputEvent, action: number): void {
    let srcActions = this.getSourceActions(comp);
    if (!(e instanceof MouseEvent) || !(action === TransferHandler.COPY || action === TransferHandler.MOVE || action === TransferHandler.LINK) || (srcActions & action) === 0) {
      action = TransferHandler.NONE;
    }
    if (action !== TransferHandler.NONE && !GraphicsEnvironment.isHeadless()) {
      if (TransferHandler.recognizer == null) {
        TransferHandler.recognizer = new TransferHandler$SwingDragGestureRecognizer()._TransferHandler$SwingDragGestureRecognizer(new TransferHandler$DragHandler()._TransferHandler$DragHandler());
      }
      TransferHandler.recognizer.gestured(comp, e, srcActions, action);
    } else {
      this.exportDone(comp, null, TransferHandler.NONE);
    }
  }
  /**
   * Causes a transfer from the given component to the
   * given clipboard.  This method is called by the default cut and
   * copy actions registered in a component's action map.
   * <p>
   * The transfer will take place using the <code>java.awt.datatransfer</code>
   * mechanism, requiring no further effort from the developer. Any data
   * transfer <em>will</em> be complete and the <code>exportDone</code>
   * method will be called with the action that occurred, before this method
   * returns. Should the clipboard be unavailable when attempting to place
   * data on it, the <code>IllegalStateException</code> thrown by
   * {@link Clipboard#setContents(Transferable, ClipboardOwner)} will
   * be propagated through this method. However,
   * <code>exportDone</code> will first be called with an action
   * of <code>NONE</code> for consistency.
   *
   * @param comp  the component holding the data to be transferred;
   *              provided to enable sharing of <code>TransferHandler</code>s
   * @param clip  the clipboard to transfer the data into
   * @param action the transfer action requested; this should
   *  be a value of either <code>COPY</code> or <code>MOVE</code>;
   *  the operation performed is the intersection  of the transfer
   *  capabilities given by getSourceActions and the requested action;
   *  the intersection may result in an action of <code>NONE</code>
   *  if the requested action isn't supported
   * @throws IllegalStateException if the clipboard is currently unavailable
   * @see Clipboard#setContents(Transferable, ClipboardOwner)
   */
  exportToClipboard(comp: JComponent, clip: Clipboard, action: number): void {
    if ((action === TransferHandler.COPY || action === TransferHandler.MOVE) && (this.getSourceActions(comp) & action) !== 0) {
      let t = this.createTransferable(comp);
      if (t != null) {
        try {
          clip.setContents(t, null);
          this.exportDone(comp, t, action);
          return;
        } catch ($e0) {
          if ($J.isa($e0, IllegalStateException)) {
            let ise = $J.exc($e0);
            this.exportDone(comp, t, TransferHandler.NONE);
            throw ise;
          } else {
            throw $e0;
          }
        }
      }
    }
    this.exportDone(comp, null, TransferHandler.NONE);
  }
  /**
   * Causes a transfer to occur from a clipboard or a drag and
   * drop operation. The <code>Transferable</code> to be
   * imported and the component to transfer to are contained
   * within the <code>TransferSupport</code>.
   * <p>
   * While the drag and drop implementation calls {@code canImport}
   * to determine the suitability of a transfer before calling this
   * method, the implementation of paste does not. As such, it cannot
   * be assumed that the transfer is acceptable upon a call to
   * this method for paste. It is recommended that {@code canImport} be
   * explicitly called to cover this case.
   * <p>
   * Note: The <code>TransferSupport</code> object passed to this method
   * is only valid for the duration of the method call. It is undefined
   * what values it may contain after this method returns.
   *
   * @param support the object containing the details of
   *        the transfer, not <code>null</code>.
   * @return true if the data was inserted into the component,
   *         false otherwise
   * @throws NullPointerException if <code>support</code> is {@code null}
   * @see #canImport(TransferHandler.TransferSupport)
   * @since 1.6
   */
  importData$TransferSupport(support: TransferHandler$TransferSupport): boolean {
    return support.getComponent() instanceof JComponent ? this.importData$JComponent$Transferable(support.getComponent(), support.getTransferable()) : false;
  }
  /**
   * Causes a transfer to a component from a clipboard or a
   * DND drop operation.  The <code>Transferable</code> represents
   * the data to be imported into the component.
   * <p>
   * Note: Swing now calls the newer version of <code>importData</code>
   * that takes a <code>TransferSupport</code>, which in turn calls this
   * method (if the component in the {@code TransferSupport} is a
   * {@code JComponent}). Developers are encouraged to call and override the
   * newer version as it provides more information (and is the only
   * version that supports use with a {@code TransferHandler} set directly
   * on a {@code JFrame} or other non-{@code JComponent}).
   *
   * @param comp  the component to receive the transfer;
   *              provided to enable sharing of <code>TransferHandler</code>s
   * @param t     the data to import
   * @return  true if the data was inserted into the component, false otherwise
   * @see #importData(TransferHandler.TransferSupport)
   */
  importData$JComponent$Transferable(comp: JComponent, t: Transferable): boolean {
    let prop = this.getPropertyDescriptor(comp);
    if (prop != null) {
      let writer = prop.getWriteMethod();
      if (writer == null) {
        return false;
      }
      let params = writer.getParameterTypes();
      if (params.length !== 1) {
        return false;
      }
      let flavor = this.getPropertyDataFlavor(params[0], t.getTransferDataFlavors());
      if (flavor != null) {
        try {
          let value = t.getTransferData(flavor);
          let args = [value];
          MethodUtil.invoke(writer, comp, args);
          return true;
        } catch ($e1) {
          if ($J.isa($e1, Exception)) {
            let ex = $J.exc($e1);
            $J.err.println('Invocation failed');
          } else {
            throw $e1;
          }
        }
      }
    }
    return false;
  }
  /**
   * Returns the type of transfer actions supported by the source;
   * any bitwise-OR combination of {@code COPY}, {@code MOVE}
   * and {@code LINK}.
   * <p>
   * Some models are not mutable, so a transfer operation of {@code MOVE}
   * should not be advertised in that case. Returning {@code NONE}
   * disables transfers from the component.
   *
   * @param c  the component holding the data to be transferred;
   *           provided to enable sharing of <code>TransferHandler</code>s
   * @return {@code COPY} if the transfer property can be found,
   *          otherwise returns <code>NONE</code>
   */
  getSourceActions(c: JComponent): number {
    let prop = this.getPropertyDescriptor(c);
    if (prop != null) {
      return TransferHandler.COPY;
    }
    return TransferHandler.NONE;
  }
  /**
   * Creates a <code>Transferable</code> to use as the source for
   * a data transfer. Returns the representation of the data to
   * be transferred, or <code>null</code> if the component's
   * property is <code>null</code>
   *
   * @param c  the component holding the data to be transferred;
   *              provided to enable sharing of <code>TransferHandler</code>s
   * @return  the representation of the data to be transferred, or
   *  <code>null</code> if the property associated with <code>c</code>
   *  is <code>null</code>
   */
  createTransferable(c: JComponent): Transferable {
    let property = this.getPropertyDescriptor(c);
    if (property != null) {
      return new TransferHandler$PropertyTransferable()._TransferHandler$PropertyTransferable(property, c);
    }
    return null;
  }
  /**
   * Invoked after data has been exported.  This method should remove
   * the data that was transferred if the action was <code>MOVE</code>.
   * <p>
   * This method is implemented to do nothing since <code>MOVE</code>
   * is not a supported action of this implementation
   * (<code>getSourceActions</code> does not include <code>MOVE</code>).
   *
   * @param source the component that was the source of the data
   * @param data   The data that was transferred or possibly null
   *               if the action is <code>NONE</code>.
   * @param action the actual action that was performed
   */
  exportDone(source: JComponent, data: Transferable, action: number): void {
  }
  /**
   * Fetches the property descriptor for the property assigned to this transfer
   * handler on the given component (transfer handler may be shared).  This
   * returns <code>null</code> if the property descriptor can't be found
   * or there is an error attempting to fetch the property descriptor.
   */
  getPropertyDescriptor(comp: JComponent): PropertyDescriptor {
    if (this.propertyName == null) {
      return null;
    }
    let k = comp.getClass();
    let bi: BeanInfo;
    try {
      bi = Introspector.getBeanInfo(k);
    } catch ($e2) {
      if ($J.isa($e2, IntrospectionException)) {
        let ex = $J.exc($e2);
        return null;
      } else {
        throw $e2;
      }
    }
    let props = bi.getPropertyDescriptors();
    for (let i = 0; i < props.length; i++) {
      if ($J.equals(this.propertyName, props[i].getName())) {
        let reader = props[i].getReadMethod();
        if (reader != null) {
          let params = reader.getParameterTypes();
          if (params == null || params.length === 0) {
            return props[i];
          }
        }
      }
    }
    return null;
  }
  /**
   * Fetches the data flavor from the array of possible flavors that
   * has data of the type represented by property type.  Null is
   * returned if there is no match.
   */
  getPropertyDataFlavor(k: JClass<any>, flavors: DataFlavor[]): DataFlavor {
    for (let i = 0; i < flavors.length; i++) {
      let flavor = flavors[i];
      if ($J.equals('application', flavor.getPrimaryType()) && $J.equals('x-java-jvm-local-objectref', flavor.getSubType()) && k.isAssignableFrom(flavor.getRepresentationClass())) {
        return flavor;
      }
    }
    return null;
  }
  static getDropTargetListener(): DropTargetListener {
    {
      let handler = AppContext.getAppContext().get($J.cls(TransferHandler$DropHandler));
      if (handler == null) {
        handler = new TransferHandler$DropHandler()._TransferHandler$DropHandler();
        AppContext.getAppContext().put($J.cls(TransferHandler$DropHandler), handler);
      }
      return handler;
    }
  }
  static $clinit() {
    TransferHandler.recognizer = null;
    TransferHandler.cutAction = new TransferHandler$TransferAction()._TransferHandler$TransferAction('cut');
    TransferHandler.copyAction = new TransferHandler$TransferAction()._TransferHandler$TransferAction('copy');
    TransferHandler.pasteAction = new TransferHandler$TransferAction()._TransferHandler$TransferAction('paste');
  }
}

/**
 * An interface to tag things with a {@code getTransferHandler} method.
 */
export class TransferHandler$HasGetTransferHandler {
}

/**
 * Represents a location where dropped data should be inserted.
 * This is a base class that only encapsulates a point.
 * Components supporting drop may provide subclasses of this
 * containing more information.
 * <p>
 * Developers typically shouldn't create instances of, or extend, this
 * class. Instead, these are something provided by the DnD
 * implementation by <code>TransferSupport</code> instances and by
 * components with a <code>getDropLocation()</code> method.
 *
 * @see javax.swing.TransferHandler.TransferSupport#getDropLocation
 * @since 1.6
 */
export class TransferHandler$DropLocation extends JObject {
  dropPoint: Point = null;
  /**
   * Constructs a drop location for the given point.
   *
   * @param dropPoint the drop point, representing the mouse's
   *        current location within the component.
   * @throws IllegalArgumentException if the point
   *         is <code>null</code>
   */
  _TransferHandler$DropLocation(dropPoint: Point): this {
    if (dropPoint == null) {
      throw new IllegalArgumentException('Point cannot be null');
    }
    this.dropPoint = new Point()._Point$Point(dropPoint);
    return this;
  }
  /**
   * Returns the drop point, representing the mouse's
   * current location within the component.
   *
   * @return the drop point.
   */
  getDropPoint(): Point {
    return new Point()._Point$Point(this.dropPoint);
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
    return $J.getClass(this).getName() + '[dropPoint=' + $J.str(this.dropPoint) + ']';
  }
}

/**
 * This class encapsulates all relevant details of a clipboard
 * or drag and drop transfer, and also allows for customizing
 * aspects of the drag and drop experience.
 * <p>
 * The main purpose of this class is to provide the information
 * needed by a developer to determine the suitability of a
 * transfer or to import the data contained within. But it also
 * doubles as a controller for customizing properties during drag
 * and drop, such as whether or not to show the drop location,
 * and which drop action to use.
 * <p>
 * Developers typically need not create instances of this
 * class. Instead, they are something provided by the DnD
 * implementation to certain methods in <code>TransferHandler</code>.
 *
 * @see #canImport(TransferHandler.TransferSupport)
 * @see #importData(TransferHandler.TransferSupport)
 * @since 1.6
 */
export class TransferHandler$TransferSupport extends JObject {
  isDrop_: boolean = false;
  component: Component = null;
  showDropLocationIsSet: boolean = false;
  showDropLocation: boolean = false;
  dropAction: number = 0;
  /**
   * The source is a {@code DropTargetDragEvent} or
   * {@code DropTargetDropEvent} for drops,
   * and a {@code Transferable} otherwise
   */
  source: any = null;
  dropLocation: TransferHandler$DropLocation = null;
  $init_TransferHandler_TransferSupport() {
    this.dropAction = -1;
  }
  /**
   * Create a <code>TransferSupport</code> with <code>isDrop()</code>
   * <code>true</code> for the given component, event, and index.
   *
   * @param component the target component
   * @param event a <code>DropTargetEvent</code>
   */
  _TransferHandler$TransferSupport$Component$DropTargetEvent(component: Component, event: DropTargetEvent): this {
    this.$init_TransferHandler_TransferSupport();
    this.isDrop_ = true;
    this.setDNDVariables(component, event);
    return this;
  }
  /**
   * Create a <code>TransferSupport</code> with <code>isDrop()</code>
   * <code>false</code> for the given component and
   * <code>Transferable</code>.
   *
   * @param component the target component
   * @param transferable the transferable
   * @throws NullPointerException if either parameter
   *         is <code>null</code>
   */
  _TransferHandler$TransferSupport$Component$Transferable(component: Component, transferable: Transferable): this {
    this.$init_TransferHandler_TransferSupport();
    if (component == null) {
      throw new NullPointerException('component is null');
    }
    if (transferable == null) {
      throw new NullPointerException('transferable is null');
    }
    this.isDrop_ = false;
    this.component = component;
    this.source = transferable;
    return this;
  }
  /**
   * Allows for a single instance to be reused during DnD.
   *
   * @param component the target component
   * @param event a <code>DropTargetEvent</code>
   */
  setDNDVariables(component: Component, event: DropTargetEvent): void {
    // assert isDrop
    this.component = component;
    this.source = event;
    this.dropLocation = null;
    this.dropAction = -1;
    this.showDropLocationIsSet = false;
    if (this.source == null) {
      return;
    }
    // assert source instanceof DropTargetDragEvent || source instanceof DropTargetDropEvent
    let p = this.source instanceof DropTargetDragEvent ? (this.source).getLocation() : (this.source).getLocation();
    if (SunToolkit.isInstanceOf(component, 'javax.swing.text.JTextComponent')) {
      this.dropLocation = SwingAccessor.getJTextComponentAccessor().dropLocationForPoint(component, p);
    } else if (component instanceof JComponent) {
      this.dropLocation = (component).dropLocationForPoint$Point(p);
    }
  }
  /**
   * Returns whether or not this <code>TransferSupport</code>
   * represents a drop operation.
   *
   * @return <code>true</code> if this is a drop operation,
   *         <code>false</code> otherwise.
   */
  isDrop(): boolean {
    return this.isDrop_;
  }
  /**
   * Returns the target component of this transfer.
   *
   * @return the target component
   */
  getComponent(): Component {
    return this.component;
  }
  /**
   * Checks that this is a drop and throws an
   * {@code IllegalStateException} if it isn't.
   *
   * @throws IllegalStateException if {@code isDrop} is false.
   */
  assureIsDrop(): void {
    if (!this.isDrop_) {
      throw new IllegalStateException('Not a drop');
    }
  }
  /**
   * Returns the current (non-{@code null}) drop location for the component,
   * when this {@code TransferSupport} represents a drop.
   * <p>
   * Note: For components with built-in drop support, this location
   * will be a subclass of {@code DropLocation} of the same type
   * returned by that component's {@code getDropLocation} method.
   * <p>
   * This method is only for use with drag and drop transfers.
   * Calling it when {@code isDrop()} is {@code false} results
   * in an {@code IllegalStateException}.
   *
   * @return the drop location
   * @throws IllegalStateException if this is not a drop
   * @see #isDrop()
   */
  getDropLocation(): TransferHandler$DropLocation {
    this.assureIsDrop();
    if (this.dropLocation == null) {
      let p = this.source instanceof DropTargetDragEvent ? (this.source).getLocation() : (this.source).getLocation();
      this.dropLocation = new TransferHandler$DropLocation()._TransferHandler$DropLocation(p);
    }
    return this.dropLocation;
  }
  /**
   * Returns the action chosen for the drop, when this
   * {@code TransferSupport} represents a drop.
   * <p>
   * Unless explicitly chosen by way of {@code setDropAction},
   * this returns the user drop action provided by
   * {@code getUserDropAction}.
   * <p>
   * You may wish to query this in {@code TransferHandler}'s
   * {@code importData} method to customize processing based
   * on the action.
   * <p>
   * This method is only for use with drag and drop transfers.
   * Calling it when {@code isDrop()} is {@code false} results
   * in an {@code IllegalStateException}.
   *
   * @return the action chosen for the drop
   * @throws IllegalStateException if this is not a drop
   * @see #setDropAction
   * @see #getUserDropAction
   * @see #isDrop()
   */
  getDropAction(): number {
    return this.dropAction === -1 ? this.getUserDropAction() : this.dropAction;
  }
  /**
   * Returns the user drop action for the drop, when this
   * {@code TransferSupport} represents a drop.
   * <p>
   * The user drop action is chosen for a drop as described in the
   * documentation for {@link java.awt.dnd.DropTargetDragEvent} and
   * {@link java.awt.dnd.DropTargetDropEvent}. A different action
   * may be chosen as the drop action by way of the {@code setDropAction}
   * method.
   * <p>
   * You may wish to query this in {@code TransferHandler}'s
   * {@code canImport} method when determining the suitability of a
   * drop or when deciding on a drop action to explicitly choose.
   * <p>
   * This method is only for use with drag and drop transfers.
   * Calling it when {@code isDrop()} is {@code false} results
   * in an {@code IllegalStateException}.
   *
   * @return the user drop action
   * @throws IllegalStateException if this is not a drop
   * @see #setDropAction
   * @see #getDropAction
   * @see #isDrop()
   */
  getUserDropAction(): number {
    this.assureIsDrop();
    return (this.source instanceof DropTargetDragEvent) ? (this.source).getDropAction() : (this.source).getDropAction();
  }
  /**
   * Returns the <code>Transferable</code> associated with this transfer.
   * <p>
   * Note: Unless it is necessary to fetch the <code>Transferable</code>
   * directly, use one of the other methods on this class to inquire about
   * the transfer. This may perform better than fetching the
   * <code>Transferable</code> and asking it directly.
   *
   * @return the <code>Transferable</code> associated with this transfer
   */
  getTransferable(): Transferable {
    if (this.isDrop_) {
      if (this.source instanceof DropTargetDragEvent) {
        return (this.source).getTransferable();
      } else {
        return (this.source).getTransferable();
      }
    }
    return this.source;
  }
}

export class TransferHandler$PropertyTransferable extends JObject {
  component: JComponent = null;
  property: PropertyDescriptor = null;
  _TransferHandler$PropertyTransferable(p: PropertyDescriptor, c: JComponent): this {
    this.property = p;
    this.component = c;
    return this;
  }
  /**
   * Returns an array of <code>DataFlavor</code> objects indicating the flavors the data
   * can be provided in.  The array should be ordered according to preference
   * for providing the data (from most richly descriptive to least descriptive).
   * @return an array of data flavors in which this data can be transferred
   */
  getTransferDataFlavors(): DataFlavor[] {
    let flavors = $J.newArray(1, null);
    let propertyType = this.property.getPropertyType();
    let mimeType = 'application/x-java-jvm-local-objectref' + ';class=' + propertyType.getName();
    try {
      flavors[0] = new DataFlavor(mimeType);
    } catch ($e3) {
      if ($J.isa($e3, ClassNotFoundException)) {
        let cnfe = $J.exc($e3);
        flavors = $J.newArray(0, null);
      } else {
        throw $e3;
      }
    }
    return flavors;
  }
  /**
   * Returns whether the specified data flavor is supported for
   * this object.
   * @param flavor the requested flavor for the data
   * @return true if this <code>DataFlavor</code> is supported,
   *   otherwise false
   */
  isDataFlavorSupported(flavor: DataFlavor): boolean {
    let propertyType = this.property.getPropertyType();
    if ($J.equals('application', flavor.getPrimaryType()) && $J.equals('x-java-jvm-local-objectref', flavor.getSubType()) && flavor.getRepresentationClass().isAssignableFrom(propertyType)) {
      return true;
    }
    return false;
  }
  /**
   * Returns an object which represents the data to be transferred.  The class
   * of the object returned is defined by the representation class of the flavor.
   *
   * @param flavor the requested flavor for the data
   * @see DataFlavor#getRepresentationClass
   * @throws IOException                if the data is no longer available
   *              in the requested flavor.
   * @throws UnsupportedFlavorException if the requested data flavor is
   *              not supported.
   */
  getTransferData(flavor: DataFlavor): any {
    if (!this.isDataFlavorSupported(flavor)) {
      throw new UnsupportedFlavorException(flavor);
    }
    let reader = this.property.getReadMethod();
    let value = null;
    try {
      value = MethodUtil.invoke(reader, this.component, null);
    } catch ($e4) {
      if ($J.isa($e4, Exception)) {
        let ex = $J.exc($e4);
        throw new IOException('Property read failed: ' + this.property.getName());
      } else {
        throw $e4;
      }
    }
    return value;
  }
}

/**
 * This is the default drop target for drag and drop operations if
 * one isn't provided by the developer.  <code>DropTarget</code>
 * only supports one <code>DropTargetListener</code> and doesn't
 * function properly if it isn't set.
 * This class sets the one listener as the linkage of drop handling
 * to the <code>TransferHandler</code>, and adds support for
 * additional listeners which some of the <code>ComponentUI</code>
 * implementations install to manipulate a drop insertion location.
 */
export class TransferHandler$SwingDropTarget extends DropTarget {
  listenerList: EventListenerList = null;
  _TransferHandler$SwingDropTarget(c: Component): this {
    this._DropTarget$Component$int$DropTargetListener(c, TransferHandler.COPY_OR_MOVE | TransferHandler.LINK, null);
    try {
      super.addDropTargetListener(TransferHandler.getDropTargetListener());
    } catch ($e5) {
      if ($J.isa($e5, TooManyListenersException)) {
        let tmle = $J.exc($e5);
      } else {
        throw $e5;
      }
    }
    return this;
  }
  addDropTargetListener(dtl: DropTargetListener): void {
    if (this.listenerList == null) {
      this.listenerList = new EventListenerList()._EventListenerList();
    }
    this.listenerList.add($J.cls(DropTargetListener), dtl);
  }
  dragExit(e: DropTargetEvent): void {
    super.dragExit(e);
    if (this.listenerList != null) {
      let listeners = this.listenerList.getListenerList();
      for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
        if (listeners[i] === $J.cls(DropTargetListener)) {
          (listeners[(i + 1) | 0]).dragExit(e);
        }
      }
    }
    var dropHandler;
    if (!this.isActive()) {
      let dtListener = TransferHandler.getDropTargetListener();
      var dropHandler;
      if ((dropHandler = dtListener) instanceof TransferHandler$DropHandler) {
        dropHandler.cleanup(false);
      }
    }
  }
}

export class TransferHandler$DropHandler extends JObject {
  timer: Timer = null;
  lastPosition: Point = null;
  outer: Rectangle = null;
  inner: Rectangle = null;
  hysteresis: number = 0;
  component: Component = null;
  state: any = null;
  support: TransferHandler$TransferSupport = null;
  static readonly AUTOSCROLL_INSET: number = 10;
  _TransferHandler$DropHandler(): this {
    this.outer = new Rectangle()._Rectangle$();
    this.inner = new Rectangle()._Rectangle$();
    this.hysteresis = 10;
    this.support = new TransferHandler$TransferSupport()._TransferHandler$TransferSupport$Component$DropTargetEvent(null, null);
    return this;
  }
  /**
   * Update the geometry of the autoscroll region.  The geometry is
   * maintained as a pair of rectangles.  The region can cause
   * a scroll if the pointer sits inside it for the duration of the
   * timer.  The region that causes the timer countdown is the area
   * between the two rectangles.
   * <p>
   * This is implemented to use the visible area of the component
   * as the outer rectangle, and the insets are fixed at 10. Should
   * the component be smaller than a total of 20 in any direction,
   * autoscroll will not occur in that direction.
   */
  updateAutoscrollRegion(c: JComponent): void {
    let visible = c.getVisibleRect();
    this.outer.setBounds$int$int$int$int(visible.x_, visible.y_, visible.width_, visible.height_);
    let i = new Insets()._Insets(0, 0, 0, 0);
    if ($J.isa(c, Scrollable)) {
      let minSize = Math.imul(2, TransferHandler$DropHandler.AUTOSCROLL_INSET);
      if (visible.width_ >= minSize) {
        i.left = i.right = TransferHandler$DropHandler.AUTOSCROLL_INSET;
      }
      if (visible.height_ >= minSize) {
        i.top = i.bottom = TransferHandler$DropHandler.AUTOSCROLL_INSET;
      }
    }
    this.inner.setBounds$int$int$int$int((visible.x_ + i.left) | 0, (visible.y_ + i.top) | 0, (visible.width_ - (i.left + i.right)) | 0, (visible.height_ - (i.top + i.bottom)) | 0);
  }
  /**
   * Perform an autoscroll operation.  This is implemented to scroll by the
   * unit increment of the Scrollable using scrollRectToVisible.  If the
   * cursor is in a corner of the autoscroll region, more than one axis will
   * scroll.
   */
  autoscroll(c: JComponent, pos: Point): void {
    if ($J.isa(c, Scrollable)) {
      let s = c;
      if (pos.y_ < this.inner.y_) {
        let dy = s.getScrollableUnitIncrement(this.outer, SwingConstants.VERTICAL, -1);
        let r = new Rectangle()._Rectangle$int$int$int$int(this.inner.x_, (this.outer.y_ - dy) | 0, this.inner.width_, dy);
        c.scrollRectToVisible(r);
      } else if (pos.y_ > ((this.inner.y_ + this.inner.height_) | 0)) {
        let dy = s.getScrollableUnitIncrement(this.outer, SwingConstants.VERTICAL, 1);
        let r = new Rectangle()._Rectangle$int$int$int$int(this.inner.x_, (this.outer.y_ + this.outer.height_) | 0, this.inner.width_, dy);
        c.scrollRectToVisible(r);
      }
      if (pos.x_ < this.inner.x_) {
        let dx = s.getScrollableUnitIncrement(this.outer, SwingConstants.HORIZONTAL, -1);
        let r = new Rectangle()._Rectangle$int$int$int$int((this.outer.x_ - dx) | 0, this.inner.y_, dx, this.inner.height_);
        c.scrollRectToVisible(r);
      } else if (pos.x_ > ((this.inner.x_ + this.inner.width_) | 0)) {
        let dx = s.getScrollableUnitIncrement(this.outer, SwingConstants.HORIZONTAL, 1);
        let r = new Rectangle()._Rectangle$int$int$int$int((this.outer.x_ + this.outer.width_) | 0, this.inner.y_, dx, this.inner.height_);
        c.scrollRectToVisible(r);
      }
    }
  }
  /**
   * The timer fired, perform autoscroll if the pointer is within the
   * autoscroll region.
   * <P>
   * @param e the <code>ActionEvent</code>
   */
  actionPerformed(e: ActionEvent): void {
    this.updateAutoscrollRegion(this.component);
    if (this.outer.contains$Point(this.lastPosition) && !this.inner.contains$Point(this.lastPosition)) {
      this.autoscroll(this.component, this.lastPosition);
    }
  }
  setComponentDropLocation(support: TransferHandler$TransferSupport, forDrop: boolean): void {
    let dropLocation = (support == null) ? null : support.getDropLocation();
    if (SunToolkit.isInstanceOf(this.component, 'javax.swing.text.JTextComponent')) {
      this.state = SwingAccessor.getJTextComponentAccessor().setDropLocation(this.component, dropLocation, this.state, forDrop);
    } else if (this.component instanceof JComponent) {
      this.state = (this.component).setDropLocation$DropLocation$Object$boolean(dropLocation, this.state, forDrop);
    }
  }
  dragExit(e: DropTargetEvent): void {
    this.cleanup(false);
  }
  cleanup(forDrop: boolean): void {
    this.setComponentDropLocation(null, forDrop);
    if (this.component instanceof JComponent) {
      (this.component).dndDone();
    }
    if (this.timer != null) {
      this.timer.stop();
    }
    this.state = null;
    this.component = null;
    this.lastPosition = null;
  }
}

/**
 * This is the default drag handler for drag and drop operations that
 * use the <code>TransferHandler</code>.
 */
export class TransferHandler$DragHandler extends JObject {
  scrolls: boolean = false;
  _TransferHandler$DragHandler(): this {
    return this;
  }
  /**
   * a Drag gesture has been recognized
   */
  dragGestureRecognized(dge: DragGestureEvent): void {
    let c = dge.getComponent();
    let th = c.getTransferHandler();
    let t = th.createTransferable(c);
    if (t != null) {
      this.scrolls = c.getAutoscrolls();
      c.setAutoscrolls(false);
      try {
        let im = th.getDragImage();
        if (im == null) {
          dge.startDrag$Cursor$Transferable$DragSourceListener(null, t, this);
        } else {
          dge.startDrag$Cursor$Image$Point$Transferable$DragSourceListener(null, im, th.getDragImageOffset(), t, this);
        }
        return;
      } catch ($e6) {
        if ($J.isa($e6, RuntimeException)) {
          let re = $J.exc($e6);
          c.setAutoscrolls(this.scrolls);
        } else {
          throw $e6;
        }
      }
    }
    th.exportDone(c, t, TransferHandler.NONE);
  }
}

export class TransferHandler$SwingDragGestureRecognizer extends DragGestureRecognizer {
  _TransferHandler$SwingDragGestureRecognizer(dgl: DragGestureListener): this {
    this._DragGestureRecognizer$DragSource$Component$int$DragGestureListener(DragSource.getDefaultDragSource(), null, TransferHandler.NONE, dgl);
    return this;
  }
  gestured(c: JComponent, e: MouseEvent, srcActions: number, action: number): void {
    this.setComponent(c);
    this.setSourceActions(srcActions);
    this.appendEvent(e);
    this.fireDragGestureRecognized(action, e.getPoint());
  }
  /**
   * register this DragGestureRecognizer's Listeners with the Component
   */
  registerListeners(): void {
  }
  /**
   * unregister this DragGestureRecognizer's Listeners with the Component
   *
   * subclasses must override this method
   */
  unregisterListeners(): void {
  }
}

export class TransferHandler$TransferAction extends UIAction {
  static javaSecurityAccess: JavaSecurityAccess = null;
  /**
   * Key used in app context to lookup Clipboard to use if access to
   * System clipboard is denied.
   */
  static SandboxClipboardKey: any = null;
  _TransferHandler$TransferAction(name: string): this {
    this._UIAction(name);
    return this;
  }
  accept(sender: any): boolean {
    return !(sender instanceof JComponent && (sender).getTransferHandler() == null);
  }
  actionPerformed(e: ActionEvent): void {
    let src = e.getSource();
    let action = new (TransferHandler$TransferAction$1())().$o(this).$c(e);
    let stack = AccessController.getContext();
    let srcAcc = AWTAccessor.getComponentAccessor().getAccessControlContext(src);
    let eventAcc = AWTAccessor.getAWTEventAccessor().getAccessControlContext(e);
    if (srcAcc == null) {
      TransferHandler$TransferAction.javaSecurityAccess.doIntersectionPrivilege(action, stack, eventAcc);
    } else {
      TransferHandler$TransferAction.javaSecurityAccess.doIntersectionPrivilege(new (TransferHandler$TransferAction$2())().$o(this).$c(action, eventAcc), stack, srcAcc);
    }
  }
  actionPerformedImpl(e: ActionEvent): void {
    let src = e.getSource();
    if (src instanceof JComponent) {
      let c = src;
      let th = c.getTransferHandler();
      let clipboard = this.getClipboard(c);
      let name = this.getValue$String(Action.NAME);
      let trans = null;
      try {
        if ((clipboard != null) && (th != null) && (name != null)) {
          if ($J.equals('cut', name)) {
            th.exportToClipboard(c, clipboard, TransferHandler.MOVE);
          } else if ($J.equals('copy', name)) {
            th.exportToClipboard(c, clipboard, TransferHandler.COPY);
          } else if ($J.equals('paste', name)) {
            trans = clipboard.getContents(null);
          }
        }
      } catch ($e7) {
        if ($J.isa($e7, IllegalStateException)) {
          let ise = $J.exc($e7);
          UIManager.getLookAndFeel().provideErrorFeedback(c);
          return;
        } else {
          throw $e7;
        }
      }
      if (trans != null) {
        th.importData$TransferSupport(new TransferHandler$TransferSupport()._TransferHandler$TransferSupport$Component$Transferable(c, trans));
      }
    }
  }
  /**
   * Returns the clipboard to use for cut/copy/paste.
   */
  getClipboard(c: JComponent): Clipboard {
    if (SwingUtilities2.canAccessSystemClipboard()) {
      return c.getToolkit().getSystemClipboard();
    }
    let clipboard = AppContext.getAppContext().get(TransferHandler$TransferAction.SandboxClipboardKey);
    if (clipboard == null) {
      clipboard = new Clipboard('Sandboxed Component Clipboard');
      AppContext.getAppContext().put(TransferHandler$TransferAction.SandboxClipboardKey, clipboard);
    }
    return clipboard;
  }
  static $clinit() {
    TransferHandler$TransferAction.javaSecurityAccess = SharedSecrets.getJavaSecurityAccess();
    TransferHandler$TransferAction.SandboxClipboardKey = new JObject();
  }
}

let $TransferHandler$TransferAction$1: any = null;
/** An anonymous class (TransferHandler.java:1710). */
function TransferHandler$TransferAction$1(): any {
  return $TransferHandler$TransferAction$1 ??= $J.local(class extends JObject {
    run(): Void {
      this.$outer.actionPerformedImpl(this.$cv_e);
      return null;
    }
    $c($e): this {
      this.$cv_e = $e;
      return this;
    }
  }, 'javax.swing.TransferHandler$TransferAction$1', ['java.security.PrivilegedAction']);
}

let $TransferHandler$TransferAction$2: any = null;
/** An anonymous class (TransferHandler.java:1728). */
function TransferHandler$TransferAction$2(): any {
  return $TransferHandler$TransferAction$2 ??= $J.local(class extends JObject {
    run(): Void {
      TransferHandler$TransferAction.javaSecurityAccess.doIntersectionPrivilege(this.$cv_action, this.$cv_eventAcc);
      return null;
    }
    $c($action, $eventAcc): this {
      this.$cv_action = $action; this.$cv_eventAcc = $eventAcc;
      return this;
    }
  }, 'javax.swing.TransferHandler$TransferAction$2', ['java.security.PrivilegedAction']);
}

$J.define(TransferHandler, 'javax.swing.TransferHandler', { kind: 'class', ifaces: ['java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_TransferHandler$', 'java.lang.String': '_TransferHandler$String' }, meths: { 'canImport(javax.swing.JComponent,java.awt.datatransfer.DataFlavor[])': 'canImport$JComponent$DataFlavorArr', 'canImport(javax.swing.TransferHandler$TransferSupport)': 'canImport$TransferSupport', 'importData(javax.swing.JComponent,java.awt.datatransfer.Transferable)': 'importData$JComponent$Transferable', 'importData(javax.swing.TransferHandler$TransferSupport)': 'importData$TransferSupport' }, clinit: true, lazy: ['recognizer', 'cutAction', 'copyAction', 'pasteAction'] });
$J.define(TransferHandler$HasGetTransferHandler, 'javax.swing.TransferHandler$HasGetTransferHandler', { kind: 'interface' });
$J.define(TransferHandler$DropLocation, 'javax.swing.TransferHandler$DropLocation', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Point': '_TransferHandler$DropLocation' } });
$J.define(TransferHandler$TransferSupport, 'javax.swing.TransferHandler$TransferSupport', { kind: 'class', sup: 'java.lang.Object', ctors: { 'java.awt.Component,java.awt.datatransfer.Transferable': '_TransferHandler$TransferSupport$Component$Transferable', 'java.awt.Component,java.awt.dnd.DropTargetEvent': '_TransferHandler$TransferSupport$Component$DropTargetEvent' } });
$J.define(TransferHandler$PropertyTransferable, 'javax.swing.TransferHandler$PropertyTransferable', { kind: 'class', ifaces: ['java.awt.datatransfer.Transferable'], sup: 'java.lang.Object', ctors: { 'java.beans.PropertyDescriptor,javax.swing.JComponent': '_TransferHandler$PropertyTransferable' } });
$J.define(TransferHandler$SwingDropTarget, 'javax.swing.TransferHandler$SwingDropTarget', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'java.awt.dnd.DropTarget', ctors: { 'java.awt.Component': '_TransferHandler$SwingDropTarget' } });
$J.define(TransferHandler$DropHandler, 'javax.swing.TransferHandler$DropHandler', { kind: 'class', ifaces: ['java.awt.dnd.DropTargetListener', 'java.io.Serializable', 'java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_TransferHandler$DropHandler' } });
$J.define(TransferHandler$DragHandler, 'javax.swing.TransferHandler$DragHandler', { kind: 'class', ifaces: ['java.awt.dnd.DragGestureListener', 'java.awt.dnd.DragSourceListener'], sup: 'java.lang.Object', ctors: { '': '_TransferHandler$DragHandler' } });
$J.define(TransferHandler$SwingDragGestureRecognizer, 'javax.swing.TransferHandler$SwingDragGestureRecognizer', { kind: 'class', sup: 'java.awt.dnd.DragGestureRecognizer', ctors: { 'java.awt.dnd.DragGestureListener': '_TransferHandler$SwingDragGestureRecognizer' } });
$J.define(TransferHandler$TransferAction, 'javax.swing.TransferHandler$TransferAction', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'sun.swing.UIAction', ctors: { 'java.lang.String': '_TransferHandler$TransferAction' }, clinit: true, lazy: ['javaSecurityAccess', 'SandboxClipboardKey'] });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Insets = $J.load('java.awt.Insets');
  Point = $J.load('java.awt.Point');
  Rectangle = $J.load('java.awt.Rectangle');
  DragSource = $J.load('java.awt.dnd.DragSource');
  DropTargetDragEvent = $J.load('java.awt.dnd.DropTargetDragEvent');
  DropTargetListener = $J.load('java.awt.dnd.DropTargetListener');
  MouseEvent = $J.load('java.awt.event.MouseEvent');
  IntrospectionException = $J.load('java.beans.IntrospectionException');
  Action = $J.load('javax.swing.Action');
  JComponent = $J.load('javax.swing.JComponent');
  Scrollable = $J.load('javax.swing.Scrollable');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  UIManager = $J.load('javax.swing.UIManager');
  EventListenerList = $J.load('javax.swing.event.EventListenerList');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
