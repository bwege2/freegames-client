// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Dialog.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1995, 2021, Oracle and/or its affiliates. All rights reserved.
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
import { $J, AccessController, AppContext, AtomicLong, IllegalArgumentException, IllegalStateException, JEnum, SunToolkit, Toolkit } from '../../../jre/index.ts';
import { Window } from './Window.ts';
import { Window$AccessibleAWTWindow } from './Window.ts';

let AWTEvent, Frame, GraphicsEnvironment, IllegalComponentStateException, KeyboardFocusManager, ModalEventFilter, ComponentEvent, HierarchyEvent, InvocationEvent, WindowEvent, AWTPermissions, IdentityArrayList;

/**
 * A Dialog is a top-level window with a title and a border
 * that is typically used to take some form of input from the user.
 *
 * The size of the dialog includes any area designated for the
 * border.  The dimensions of the border area can be obtained
 * using the {@code getInsets} method, however, since
 * these dimensions are platform-dependent, a valid insets
 * value cannot be obtained until the dialog is made displayable
 * by either calling {@code pack} or {@code show}.
 * Since the border area is included in the overall size of the
 * dialog, the border effectively obscures a portion of the dialog,
 * constraining the area available for rendering and/or displaying
 * subcomponents to the rectangle which has an upper-left corner
 * location of {@code (insets.left, insets.top)}, and has a size of
 * {@code width - (insets.left + insets.right)} by
 * {@code height - (insets.top + insets.bottom)}.
 * <p>
 * The default layout for a dialog is {@code BorderLayout}.
 * <p>
 * A dialog may have its native decorations (i.e. Frame &amp; Titlebar) turned off
 * with {@code setUndecorated}.  This can only be done while the dialog
 * is not {@link Component#isDisplayable() displayable}.
 * <p>
 * A dialog may have another window as its owner when it's constructed.  When
 * the owner window of a visible dialog is minimized, the dialog will
 * automatically be hidden from the user. When the owner window is subsequently
 * restored, the dialog is made visible to the user again.
 * <p>
 * In a multi-screen environment, you can create a {@code Dialog}
 * on a different screen device than its owner.  See {@link java.awt.Frame} for
 * more information.
 * <p>
 * A dialog can be either modeless (the default) or modal.  A modal
 * dialog is one which blocks input to some other top-level windows
 * in the application, except for any windows created with the dialog
 * as their owner. See <a href="doc-files/Modality.html">AWT Modality</a>
 * specification for details.
 * <p>
 * Dialogs are capable of generating the following
 * {@code WindowEvents}:
 * {@code WindowOpened}, {@code WindowClosing},
 * {@code WindowClosed}, {@code WindowActivated},
 * {@code WindowDeactivated}, {@code WindowGainedFocus},
 * {@code WindowLostFocus}.
 *
 * @see WindowEvent
 * @see Window#addWindowListener
 *
 * @author      Sami Shaio
 * @author      Arthur van Hoff
 * @since       1.0
 */
export class Dialog extends Window {
  /**
   * A dialog's resizable property. Will be true
   * if the Dialog is to be resizable, otherwise
   * it will be false.
   *
   * @serial
   * @see #setResizable(boolean)
   */
  resizable: boolean = false;
  /**
   * This field indicates whether the dialog is undecorated.
   * This property can only be changed while the dialog is not displayable.
   * {@code undecorated} will be true if the dialog is
   * undecorated, otherwise it will be false.
   *
   * @serial
   * @see #setUndecorated(boolean)
   * @see #isUndecorated()
   * @see Component#isDisplayable()
   * @since 1.4
   */
  undecorated: boolean = false;
  initialized: boolean = false;
  /**
   * Default modality type for modal dialogs. The default modality type is
   * {@code APPLICATION_MODAL}. Calling the oldstyle {@code setModal(true)}
   * is equal to {@code setModalityType(DEFAULT_MODALITY_TYPE)}.
   *
   * @see java.awt.Dialog.ModalityType
   * @see java.awt.Dialog#setModal
   *
   * @since 1.6
   */
  static DEFAULT_MODALITY_TYPE: Dialog$ModalityType = null;
  /**
   * True if this dialog is modal, false is the dialog is modeless.
   * A modal dialog blocks user input to some application top-level
   * windows. This field is kept only for backwards compatibility. Use the
   * {@link Dialog.ModalityType ModalityType} enum instead.
   *
   * @serial
   *
   * @see #isModal
   * @see #setModal
   * @see #getModalityType
   * @see #setModalityType
   * @see ModalityType
   * @see ModalityType#MODELESS
   * @see #DEFAULT_MODALITY_TYPE
   */
  modal: boolean = false;
  /**
   * Modality type of this dialog. If the dialog's modality type is not
   * {@link Dialog.ModalityType#MODELESS ModalityType.MODELESS}, it blocks all
   * user input to some application top-level windows.
   *
   * @serial
   *
   * @see ModalityType
   * @see #getModalityType
   * @see #setModalityType
   *
   * @since 1.6
   */
  modalityType: Dialog$ModalityType = null;
  static modalDialogs: IdentityArrayList<Dialog> = null;
  blockedWindows: IdentityArrayList<Window> = null;
  /**
   * Specifies the title of the Dialog.
   * This field can be null.
   *
   * @serial
   * @see #getTitle()
   * @see #setTitle(String)
   */
  title: string = null;
  modalFilter: ModalEventFilter = null;
  secondaryLoop: SecondaryLoop = null;
  isInHide: boolean = false;
  isInDispose: boolean = false;
  static readonly base: string = 'dialog';
  static nameCounter: number = 0;
  $init_Dialog() {
    this.resizable = true;
    this.undecorated = false;
    this.initialized = false;
    this.blockedWindows = new IdentityArrayList()._IdentityArrayList$();
  }
  /**
   * Constructs an initially invisible {@code Dialog} with the
   * specified owner {@code Frame}, title and modality.
   *
   * @param owner the owner of the dialog or {@code null} if
   *     this dialog has no owner
   * @param title the title of the dialog or {@code null} if this dialog
   *     has no title
   * @param modal specifies whether dialog blocks user input to other top-level
   *     windows when shown. If {@code false}, the dialog is {@code MODELESS};
   *     if {@code true}, the modality type property is set to
   *     {@code DEFAULT_MODALITY_TYPE}
   * @throws java.lang.IllegalArgumentException if the {@code owner}'s
   *    {@code GraphicsConfiguration} is not from a screen device
   * @throws HeadlessException when
   *    {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   *
   * @see java.awt.Dialog.ModalityType
   * @see java.awt.Dialog.ModalityType#MODELESS
   * @see java.awt.Dialog#DEFAULT_MODALITY_TYPE
   * @see java.awt.Dialog#setModal
   * @see java.awt.Dialog#setModalityType
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see Component#setSize
   * @see Component#setVisible
   */
  _Dialog$Frame$String$boolean(owner: Frame, title: string, modal: boolean): this {
    this._Dialog$Window$String$ModalityType(owner, title, modal ? Dialog.DEFAULT_MODALITY_TYPE : Dialog$ModalityType.MODELESS);
    return this;
  }
  /**
   * Constructs an initially invisible {@code Dialog} with the
   * specified owner {@code Dialog}, title, and modality.
   *
   * @param owner the owner of the dialog or {@code null} if this
   *     dialog has no owner
   * @param title the title of the dialog or {@code null} if this
   *     dialog has no title
   * @param modal specifies whether dialog blocks user input to other top-level
   *     windows when shown. If {@code false}, the dialog is {@code MODELESS};
   *     if {@code true}, the modality type property is set to
   *     {@code DEFAULT_MODALITY_TYPE}
   * @throws IllegalArgumentException if the {@code owner}'s
   *    {@code GraphicsConfiguration} is not from a screen device
   * @throws HeadlessException when
   *    {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   *
   * @see java.awt.Dialog.ModalityType
   * @see java.awt.Dialog.ModalityType#MODELESS
   * @see java.awt.Dialog#DEFAULT_MODALITY_TYPE
   * @see java.awt.Dialog#setModal
   * @see java.awt.Dialog#setModalityType
   * @see java.awt.GraphicsEnvironment#isHeadless
   *
   * @since 1.2
   */
  _Dialog$Dialog$String$boolean(owner: Dialog, title: string, modal: boolean): this {
    this._Dialog$Window$String$ModalityType(owner, title, modal ? Dialog.DEFAULT_MODALITY_TYPE : Dialog$ModalityType.MODELESS);
    return this;
  }
  /**
   * Constructs an initially invisible {@code Dialog} with the
   * specified owner {@code Window}, title and modality.
   *
   * @param owner the owner of the dialog. The owner must be an instance of
   *     {@link java.awt.Dialog Dialog}, {@link java.awt.Frame Frame}, any
   *     of their descendants or {@code null}
   * @param title the title of the dialog or {@code null} if this dialog
   *     has no title
   * @param modalityType specifies whether dialog blocks input to other
   *    windows when shown. {@code null} value and unsupported modality
   *    types are equivalent to {@code MODELESS}
   *
   * @throws java.lang.IllegalArgumentException if the {@code owner}
   *     is not an instance of {@link java.awt.Dialog Dialog} or {@link
   *     java.awt.Frame Frame}
   * @throws java.lang.IllegalArgumentException if the {@code owner}'s
   *     {@code GraphicsConfiguration} is not from a screen device
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   * @throws SecurityException if the calling thread does not have permission
   *     to create modal dialogs with the given {@code modalityType}
   *
   * @see java.awt.Dialog.ModalityType
   * @see java.awt.Dialog#setModal
   * @see java.awt.Dialog#setModalityType
   * @see java.awt.GraphicsEnvironment#isHeadless
   * @see java.awt.Toolkit#isModalityTypeSupported
   *
   * @since 1.6
   */
  _Dialog$Window$String$ModalityType(owner: Window, title: string, modalityType: Dialog$ModalityType): this {
    this._Window$Window(owner);
    this.$init_Dialog();
    if ((owner != null) && !(owner instanceof Frame) && !(owner instanceof Dialog)) {
      throw new IllegalArgumentException('Wrong parent window');
    }
    this.title = title;
    this.setModalityType(modalityType);
    SunToolkit.checkAndSetPolicy(this);
    this.initialized = true;
    return this;
  }
  /**
   * Construct a name for this component.  Called by getName() when the
   * name is null.
   */
  constructComponentName(): string {
    {
      return Dialog.base + Dialog.nameCounter++;
    }
  }
  /**
   * Makes this Dialog displayable by connecting it to
   * a native screen resource.  Making a dialog displayable will
   * cause any of its children to be made displayable.
   * This method is called internally by the toolkit and should
   * not be called directly by programs.
   * @see Component#isDisplayable
   * @see #removeNotify
   */
  addNotify(): void {
    {
      if (this.parent != null && this.parent.peer == null) {
        this.parent.addNotify();
      }
      if (this.peer == null) {
        this.peer = this.getComponentFactory().createDialog(this);
      }
      super.addNotify();
    }
  }
  /**
   * Indicates whether the dialog is modal.
   * <p>
   * This method is obsolete and is kept for backwards compatibility only.
   * Use {@link #getModalityType getModalityType()} instead.
   *
   * @return    {@code true} if this dialog window is modal;
   *            {@code false} otherwise
   *
   * @see       java.awt.Dialog#DEFAULT_MODALITY_TYPE
   * @see       java.awt.Dialog.ModalityType#MODELESS
   * @see       java.awt.Dialog#setModal
   * @see       java.awt.Dialog#getModalityType
   * @see       java.awt.Dialog#setModalityType
   */
  isModal(): boolean {
    return this.isModal_NoClientCode();
  }
  isModal_NoClientCode(): boolean {
    return this.modalityType !== Dialog$ModalityType.MODELESS;
  }
  /**
   * Specifies whether this dialog should be modal.
   * <p>
   * This method is obsolete and is kept for backwards compatibility only.
   * Use {@link #setModalityType setModalityType()} instead.
   * <p>
   * Note: changing modality of the visible dialog may have no effect
   * until it is hidden and then shown again.
   *
   * @param modal specifies whether dialog blocks input to other windows
   *     when shown; calling to {@code setModal(true)} is equivalent to
   *     {@code setModalityType(Dialog.DEFAULT_MODALITY_TYPE)}, and
   *     calling to {@code setModal(false)} is equivalent to
   *     {@code setModalityType(Dialog.ModalityType.MODELESS)}
   *
   * @see       java.awt.Dialog#DEFAULT_MODALITY_TYPE
   * @see       java.awt.Dialog.ModalityType#MODELESS
   * @see       java.awt.Dialog#isModal
   * @see       java.awt.Dialog#getModalityType
   * @see       java.awt.Dialog#setModalityType
   *
   * @since     1.1
   */
  setModal(modal: boolean): void {
    this.modal = modal;
    this.setModalityType(modal ? Dialog.DEFAULT_MODALITY_TYPE : Dialog$ModalityType.MODELESS);
  }
  /**
   * Returns the modality type of this dialog.
   *
   * @return modality type of this dialog
   *
   * @see java.awt.Dialog#setModalityType
   *
   * @since 1.6
   */
  getModalityType(): Dialog$ModalityType {
    return this.modalityType;
  }
  /**
   * Sets the modality type for this dialog. See {@link
   * java.awt.Dialog.ModalityType ModalityType} for possible modality types.
   * <p>
   * If the given modality type is not supported, {@code MODELESS}
   * is used. You may want to call {@code getModalityType()} after calling
   * this method to ensure that the modality type has been set.
   * <p>
   * Note: changing modality of the visible dialog may have no effect
   * until it is hidden and then shown again.
   *
   * @param type specifies whether dialog blocks input to other
   *     windows when shown. {@code null} value and unsupported modality
   *     types are equivalent to {@code MODELESS}
   * @throws SecurityException if the calling thread does not have permission
   *     to create modal dialogs with the given {@code modalityType}
   *
   * @see       java.awt.Dialog#getModalityType
   * @see       java.awt.Toolkit#isModalityTypeSupported
   *
   * @since     1.6
   */
  setModalityType(type$: Dialog$ModalityType): void {
    if (type$ == null) {
      type$ = Dialog$ModalityType.MODELESS;
    }
    if (!Toolkit.getDefaultToolkit().isModalityTypeSupported(type$)) {
      type$ = Dialog$ModalityType.MODELESS;
    }
    if (this.modalityType === type$) {
      return;
    }
    this.checkModalityPermission(type$);
    this.modalityType = type$;
    this.modal = (this.modalityType !== Dialog$ModalityType.MODELESS);
  }
  /**
   * Gets the title of the dialog. The title is displayed in the
   * dialog's border.
   * @return    the title of this dialog window. The title may be
   *            {@code null}.
   * @see       java.awt.Dialog#setTitle
   */
  getTitle(): string {
    return this.title;
  }
  /**
   * Sets the title of the Dialog.
   * @param title the title displayed in the dialog's border;
   * a null value results in an empty title
   * @see #getTitle
   */
  setTitle(title: string): void {
    let oldTitle = this.title;
    {
      this.title = title;
      let peer = this.peer;
      if (peer != null) {
        peer.setTitle(title);
      }
    }
    this.firePropertyChange$String$Object$Object('title', oldTitle, title);
  }
  /**
   * @return true if we actually showed, false if we just called toFront()
   */
  conditionalShow(toFocus: Component, time: AtomicLong): boolean {
    let retval: boolean;
    this.closeSplashScreen();
    {
      if (this.peer == null) {
        this.addNotify();
      }
      this.validateUnconditionally();
      if (this.visible) {
        this.toFront();
        retval = false;
      } else {
        this.visible = retval = true;
        if (!this.isModal()) {
          Dialog.checkShouldBeBlocked(this);
        } else {
          Dialog.modalDialogs.add(this);
          this.modalShow();
        }
        if (toFocus != null && time != null && this.isFocusable() && this.isEnabled() && !this.isModalBlocked()) {
          time.set(Toolkit.getEventQueue().getMostRecentKeyEventTime());
          KeyboardFocusManager.getCurrentKeyboardFocusManager$().enqueueKeyEvents(time.get(), toFocus);
        }
        this.mixOnShowing();
        this.peer.setVisible(true);
        if (this.isModalBlocked()) {
          this.modalBlocker.toFront();
        }
        this.setLocationByPlatform(false);
        for (let i = 0; i < this.ownedWindowList.size(); i++) {
          let child = this.ownedWindowList.elementAt(i).get();
          if ((child != null) && child.showWithParent) {
            child.show$();
            child.showWithParent = false;
          }
        }
        Window.updateChildFocusableWindowState(this);
        this.createHierarchyEvents(HierarchyEvent.HIERARCHY_CHANGED, this, this.parent, HierarchyEvent.SHOWING_CHANGED, Toolkit.enabledOnToolkit(AWTEvent.HIERARCHY_EVENT_MASK));
        if (this.componentListener != null || ($J.land(this.eventMask, AWTEvent.COMPONENT_EVENT_MASK)) !== 0 || Toolkit.enabledOnToolkit(AWTEvent.COMPONENT_EVENT_MASK)) {
          let e = new ComponentEvent()._ComponentEvent(this, ComponentEvent.COMPONENT_SHOWN);
          Toolkit.getEventQueue().postEvent$AWTEvent(e);
        }
      }
    }
    if (retval && (this.state & Window.OPENED) === 0) {
      this.postWindowEvent(WindowEvent.WINDOW_OPENED);
      this.state |= Window.OPENED;
    }
    return retval;
  }
  /**
   * Shows or hides this {@code Dialog} depending on the value of parameter
   * {@code b}.
   * @param b if {@code true}, makes the {@code Dialog} visible,
   * otherwise hides the {@code Dialog}.
   * If the dialog and/or its owner
   * are not yet displayable, both are made displayable.  The
   * dialog will be validated prior to being made visible.
   * If {@code false}, hides the {@code Dialog} and then causes {@code setVisible(true)}
   * to return if it is currently blocked.
   * <p>
   * <b>Notes for modal dialogs</b>.
   * <ul>
   * <li>{@code setVisible(true)}:  If the dialog is not already
   * visible, this call will not return until the dialog is
   * hidden by calling {@code setVisible(false)} or
   * {@code dispose}.
   * <li>{@code setVisible(false)}:  Hides the dialog and then
   * returns on {@code setVisible(true)} if it is currently blocked.
   * <li>It is OK to call this method from the event dispatching
   * thread because the toolkit ensures that other events are
   * not blocked while this method is blocked.
   * </ul>
   * @see java.awt.Window#setVisible
   * @see java.awt.Window#dispose
   * @see java.awt.Component#isDisplayable
   * @see java.awt.Component#validate
   * @see java.awt.Dialog#isModal
   */
  setVisible(b: boolean): void {
    super.setVisible(b);
  }
  /**
   * Makes the {@code Dialog} visible. If the dialog and/or its owner
   * are not yet displayable, both are made displayable.  The
   * dialog will be validated prior to being made visible.
   * If the dialog is already visible, this will bring the dialog
   * to the front.
   * <p>
   * If the dialog is modal and is not already visible, this call
   * will not return until the dialog is hidden by calling hide or
   * dispose. It is permissible to show modal dialogs from the event
   * dispatching thread because the toolkit will ensure that another
   * event pump runs while the one which invoked this method is blocked.
   * @see Component#hide
   * @see Component#isDisplayable
   * @see Component#validate
   * @see #isModal
   * @see Window#setVisible(boolean)
   * @deprecated As of JDK version 1.5, replaced by
   * {@link #setVisible(boolean) setVisible(boolean)}.
   */
  show$(): void {
    if (!this.initialized) {
      throw new IllegalStateException('The dialog component has not been initialized properly');
    }
    this.beforeFirstShow = false;
    if (!this.isModal()) {
      this.conditionalShow(null, null);
    } else {
      let showAppContext = AppContext.getAppContext();
      let time = new AtomicLong();
      let predictedFocusOwner = null;
      try {
        predictedFocusOwner = this.getMostRecentFocusOwner();
        if (this.conditionalShow(predictedFocusOwner, time)) {
          this.modalFilter = ModalEventFilter.createFilterForDialog(this);
          if (this.modalityType === Dialog$ModalityType.TOOLKIT_MODAL) {
            for (const $it0 = AppContext.getAppContexts().iterator(); $it0.hasNext(); ) {
              let appContext = $it0.next();
              if (appContext === showAppContext) {
                continue;
              }
              let eventQueue = appContext.get(AppContext.EVENT_QUEUE_KEY);
              eventQueue.postEvent$AWTEvent(new InvocationEvent()._InvocationEvent$Object$Runnable(this, () => {
              }));
              let edt = eventQueue.getDispatchThread();
              edt.addEventFilter(this.modalFilter);
            }
          }
          this.modalityPushed();
          try {
            let eventQueue = AccessController.doPrivileged($J.lambdaObj((($r) => () => $r.getSystemEventQueue())(Toolkit.getDefaultToolkit()), 'run', 'java.security.PrivilegedAction'));
            this.secondaryLoop = eventQueue.createSecondaryLoop$Conditional$EventFilter$long(() => true, this.modalFilter, 0);
            if (!this.secondaryLoop.enter()) {
              this.secondaryLoop = null;
            }
          } finally {
            this.modalityPopped();
          }
          if (this.modalityType === Dialog$ModalityType.TOOLKIT_MODAL) {
            for (const $it1 = AppContext.getAppContexts().iterator(); $it1.hasNext(); ) {
              let appContext = $it1.next();
              if (appContext === showAppContext) {
                continue;
              }
              let eventQueue = appContext.get(AppContext.EVENT_QUEUE_KEY);
              let edt = eventQueue.getDispatchThread();
              edt.removeEventFilter(this.modalFilter);
            }
          }
        }
      } finally {
        if (predictedFocusOwner != null) {
          KeyboardFocusManager.getCurrentKeyboardFocusManager$().dequeueKeyEvents(time.get(), predictedFocusOwner);
        }
      }
    }
  }
  modalityPushed(): void {
    let tk = Toolkit.getDefaultToolkit();
    if ($J.isa(tk, SunToolkit)) {
      let stk = tk;
      stk.notifyModalityPushed(this);
    }
  }
  modalityPopped(): void {
    let tk = Toolkit.getDefaultToolkit();
    if ($J.isa(tk, SunToolkit)) {
      let stk = tk;
      stk.notifyModalityPopped(this);
    }
  }
  hideAndDisposePreHandler(): void {
    this.isInHide = true;
    {
      if (this.secondaryLoop != null) {
        this.modalHide();
        if (this.modalFilter != null) {
          this.modalFilter.disable();
        }
        Dialog.modalDialogs.remove(this);
      }
    }
  }
  hideAndDisposeHandler(): void {
    if (this.secondaryLoop != null) {
      this.secondaryLoop.exit();
      this.secondaryLoop = null;
    }
    this.isInHide = false;
  }
  /**
   * Hides the Dialog and then causes {@code show} to return if it is currently
   * blocked.
   * @see Window#show
   * @see Window#dispose
   * @see Window#setVisible(boolean)
   * @deprecated As of JDK version 1.5, replaced by
   * {@link #setVisible(boolean) setVisible(boolean)}.
   */
  hide(): void {
    this.hideAndDisposePreHandler();
    super.hide();
    if (!this.isInDispose) {
      this.hideAndDisposeHandler();
    }
  }
  /**
   * Disposes the Dialog and then causes show() to return if it is currently
   * blocked.
   */
  doDispose(): void {
    this.isInDispose = true;
    super.doDispose();
    this.hideAndDisposeHandler();
    this.isInDispose = false;
  }
  /**
   * Indicates whether this dialog is resizable by the user.
   * By default, all dialogs are initially resizable.
   * @return    {@code true} if the user can resize the dialog;
   *            {@code false} otherwise.
   * @see       java.awt.Dialog#setResizable
   */
  isResizable(): boolean {
    return this.resizable;
  }
  /**
   * Sets whether this dialog is resizable by the user.
   * @param     resizable {@code true} if the user can
   *                 resize this dialog; {@code false} otherwise.
   * @see       java.awt.Dialog#isResizable
   */
  setResizable(resizable: boolean): void {
    let testvalid = false;
    {
      this.resizable = resizable;
      let peer = this.peer;
      if (peer != null) {
        peer.setResizable(resizable);
        testvalid = true;
      }
    }
    if (testvalid) {
      this.invalidateIfValid();
    }
  }
  /**
   * Disables or enables decorations for this dialog.
   * <p>
   * This method can only be called while the dialog is not displayable. To
   * make this dialog decorated, it must be opaque and have the default shape,
   * otherwise the {@code IllegalComponentStateException} will be thrown.
   * Refer to {@link Window#setShape}, {@link Window#setOpacity} and {@link
   * Window#setBackground} for details
   *
   * @param  undecorated {@code true} if no dialog decorations are to be
   *         enabled; {@code false} if dialog decorations are to be enabled
   *
   * @throws IllegalComponentStateException if the dialog is displayable
   * @throws IllegalComponentStateException if {@code undecorated} is
   *      {@code false}, and this dialog does not have the default shape
   * @throws IllegalComponentStateException if {@code undecorated} is
   *      {@code false}, and this dialog opacity is less than {@code 1.0f}
   * @throws IllegalComponentStateException if {@code undecorated} is
   *      {@code false}, and the alpha value of this dialog background
   *      color is less than {@code 1.0f}
   *
   * @see    #isUndecorated
   * @see    Component#isDisplayable
   * @see    Window#getShape
   * @see    Window#getOpacity
   * @see    Window#getBackground
   *
   * @since 1.4
   */
  setUndecorated(undecorated: boolean): void {
    {
      if (this.isDisplayable()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog is displayable.');
      }
      if (!undecorated) {
        if (this.getOpacity() < 1) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog is not opaque');
        }
        if (this.getShape() != null) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog does not have a default shape');
        }
        let bg = this.getBackground();
        if ((bg != null) && (bg.getAlpha() < 255)) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog background color is not opaque');
        }
      }
      this.undecorated = undecorated;
    }
  }
  /**
   * Indicates whether this dialog is undecorated.
   * By default, all dialogs are initially decorated.
   * @return    {@code true} if dialog is undecorated;
   *                        {@code false} otherwise.
   * @see       java.awt.Dialog#setUndecorated
   * @since 1.4
   */
  isUndecorated(): boolean {
    return this.undecorated;
  }
  /**
   * {@inheritDoc}
   */
  setOpacity(opacity: number): void {
    {
      if ((opacity < 1) && !this.isUndecorated()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog is decorated');
      }
      super.setOpacity(opacity);
    }
  }
  /**
   * {@inheritDoc}
   */
  setShape(shape: Shape): void {
    {
      if ((shape != null) && !this.isUndecorated()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog is decorated');
      }
      super.setShape(shape);
    }
  }
  /**
   * {@inheritDoc}
   */
  setBackground(bgColor: Color): void {
    {
      if ((bgColor != null) && (bgColor.getAlpha() < 255) && !this.isUndecorated()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The dialog is decorated');
      }
      super.setBackground(bgColor);
    }
  }
  /**
   * Returns a string representing the state of this dialog. This
   * method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not be
   * {@code null}.
   *
   * @return    the parameter string of this dialog window.
   */
  paramString(): string {
    let str = super.paramString() + ',' + $J.str(this.modalityType);
    if (this.title != null) {
      str += ',title=' + this.title;
    }
    return str;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Dialog', 'initIDs', this, $a);
  }
  modalShow(): void {
    let blockers = new IdentityArrayList()._IdentityArrayList$();
    for (const $it2 = Dialog.modalDialogs.iterator(); $it2.hasNext(); ) {
      let d = $it2.next();
      if (d.shouldBlock(this)) {
        let w = d;
        while ((w != null) && (w !== this)) {
          w = w.getOwner_NoClientCode();
        }
        if ((w === this) || !this.shouldBlock(d) || (this.modalityType.compareTo(d.getModalityType()) < 0)) {
          blockers.add(d);
        }
      }
    }
    for (let i = 0; i < blockers.size(); i++) {
      let blocker = blockers.get(i);
      if (blocker.isModalBlocked()) {
        let blockerBlocker = blocker.getModalBlocker();
        if (!blockers.contains(blockerBlocker)) {
          blockers.add((i + 1) | 0, blockerBlocker);
        }
      }
    }
    if (blockers.size() > 0) {
      blockers.get(0).blockWindow(this);
    }
    let blockersHierarchies = new IdentityArrayList()._IdentityArrayList$Collection(blockers);
    let k = 0;
    while (k < blockersHierarchies.size()) {
      let w = blockersHierarchies.get(k);
      let ownedWindows = w.getOwnedWindows_NoClientCode();
      for (let win of ownedWindows) {
        blockersHierarchies.add(win);
      }
      k++;
    }
    let toBlock = new IdentityArrayList()._IdentityArrayList$();
    let unblockedWindows = Window.getAllUnblockedWindows();
    for (const $it3 = unblockedWindows.iterator(); $it3.hasNext(); ) {
      let w = $it3.next();
      if (this.shouldBlock(w) && !blockersHierarchies.contains(w)) {
        if ((w instanceof Dialog) && (w).isModal_NoClientCode()) {
          let wd = w;
          if (wd.shouldBlock(this) && (Dialog.modalDialogs.indexOf(wd) > Dialog.modalDialogs.indexOf(this))) {
            continue;
          }
        }
        toBlock.add(w);
      }
    }
    this.blockWindows(toBlock);
    if (!this.isModalBlocked()) {
      this.updateChildrenBlocking();
    }
  }
  modalHide(): void {
    let save = new IdentityArrayList()._IdentityArrayList$();
    let blockedWindowsCount = this.blockedWindows.size();
    for (let i = 0; i < blockedWindowsCount; i++) {
      let w = this.blockedWindows.get(0);
      save.add(w);
      this.unblockWindow(w);
    }
    for (let i = 0; i < blockedWindowsCount; i++) {
      let w = save.get(i);
      if ((w instanceof Dialog) && (w).isModal_NoClientCode()) {
        let d = w;
        d.modalShow();
      } else {
        Dialog.checkShouldBeBlocked(w);
      }
    }
  }
  shouldBlock(w: Window): boolean {
    if (!this.isVisible_NoClientCode() || (!w.isVisible_NoClientCode() && !w.isInShow) || this.isInHide || (w === this) || !this.isModal_NoClientCode()) {
      return false;
    }
    if ((w instanceof Dialog) && (w).isInHide) {
      return false;
    }
    let blockerToCheck = this;
    while (blockerToCheck != null) {
      let c = w;
      while ((c != null) && (c !== blockerToCheck)) {
        c = c.getParent_NoClientCode();
      }
      if (c === blockerToCheck) {
        return false;
      }
      blockerToCheck = blockerToCheck.getModalBlocker();
    }
    switch (this.modalityType) {
      case Dialog$ModalityType.MODELESS:
        return false;
      case Dialog$ModalityType.DOCUMENT_MODAL:
        if (w.isModalExcluded(Dialog$ModalExclusionType.APPLICATION_EXCLUDE)) {
          let c = this;
          while ((c != null) && (c !== w)) {
            c = c.getParent_NoClientCode();
          }
          return c === w;
        } else {
          return this.getDocumentRoot() === w.getDocumentRoot();
        }
      case Dialog$ModalityType.APPLICATION_MODAL:
        return !w.isModalExcluded(Dialog$ModalExclusionType.APPLICATION_EXCLUDE) && (this.appContext === w.appContext);
      case Dialog$ModalityType.TOOLKIT_MODAL:
        return !w.isModalExcluded(Dialog$ModalExclusionType.TOOLKIT_EXCLUDE);
    }
    return false;
  }
  blockWindow(w: Window): void {
    if (!w.isModalBlocked()) {
      w.setModalBlocked(this, true, true);
      this.blockedWindows.add(w);
    }
  }
  blockWindows(toBlock: List<Window>): void {
    let dpeer = this.peer;
    if (dpeer == null) {
      return;
    }
    let it = toBlock.iterator();
    while (it.hasNext()) {
      let w = it.next();
      if (!w.isModalBlocked()) {
        w.setModalBlocked(this, true, false);
      } else {
        it.remove();
      }
    }
    dpeer.blockWindows(toBlock);
    this.blockedWindows.addAll(toBlock);
  }
  unblockWindow(w: Window): void {
    if (w.isModalBlocked() && this.blockedWindows.contains(w)) {
      this.blockedWindows.remove(w);
      w.setModalBlocked(this, false, true);
    }
  }
  static checkShouldBeBlocked(w: Window): void {
    {
      for (let i = 0; i < Dialog.modalDialogs.size(); i++) {
        let modalDialog = Dialog.modalDialogs.get(i);
        if (modalDialog.shouldBlock(w)) {
          modalDialog.blockWindow(w);
          break;
        }
      }
    }
  }
  checkModalityPermission(mt: Dialog$ModalityType): void {
    if (mt === Dialog$ModalityType.TOOLKIT_MODAL) {
      let sm = $J.system_getSecurityManager();
      if (sm != null) {
        sm.checkPermission(AWTPermissions.TOOLKIT_MODALITY_PERMISSION);
      }
    }
  }
  static $clinit() {
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Dialog.initIDs();
    }
    Dialog.DEFAULT_MODALITY_TYPE = Dialog$ModalityType.APPLICATION_MODAL;
    Dialog.modalDialogs = new IdentityArrayList()._IdentityArrayList$();
    Dialog.nameCounter = 0;
  }
}

/**
 * Modal dialogs block all input to some top-level windows.
 * Whether a particular window is blocked depends on dialog's type
 * of modality; this is called the "scope of blocking". The
 * {@code ModalityType} enum specifies modal types and their
 * associated scopes.
 *
 * @see Dialog#getModalityType
 * @see Dialog#setModalityType
 * @see Toolkit#isModalityTypeSupported
 *
 * @since 1.6
 */
export class Dialog$ModalityType extends JEnum {
  static MODELESS: Dialog$ModalityType = null;
  static DOCUMENT_MODAL: Dialog$ModalityType = null;
  static APPLICATION_MODAL: Dialog$ModalityType = null;
  static TOOLKIT_MODAL: Dialog$ModalityType = null;
  static $VALUES: Dialog$ModalityType[] = null;
  _Dialog$ModalityType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Dialog$ModalityType[] { return Dialog$ModalityType.$VALUES.slice(); }
  static valueOf(name: string): Dialog$ModalityType { return $J.enumValueOf(Dialog$ModalityType, name); }
  static $clinit() {
    Dialog$ModalityType.MODELESS = new Dialog$ModalityType()._Dialog$ModalityType('MODELESS', 0);
    Dialog$ModalityType.DOCUMENT_MODAL = new Dialog$ModalityType()._Dialog$ModalityType('DOCUMENT_MODAL', 1);
    Dialog$ModalityType.APPLICATION_MODAL = new Dialog$ModalityType()._Dialog$ModalityType('APPLICATION_MODAL', 2);
    Dialog$ModalityType.TOOLKIT_MODAL = new Dialog$ModalityType()._Dialog$ModalityType('TOOLKIT_MODAL', 3);
    Dialog$ModalityType.$VALUES = [Dialog$ModalityType.MODELESS, Dialog$ModalityType.DOCUMENT_MODAL, Dialog$ModalityType.APPLICATION_MODAL, Dialog$ModalityType.TOOLKIT_MODAL];
  }
}

/**
 * Any top-level window can be marked not to be blocked by modal
 * dialogs. This is called "modal exclusion". This enum specifies
 * the possible modal exclusion types.
 *
 * @see Window#getModalExclusionType
 * @see Window#setModalExclusionType
 * @see Toolkit#isModalExclusionTypeSupported
 *
 * @since 1.6
 */
export class Dialog$ModalExclusionType extends JEnum {
  static NO_EXCLUDE: Dialog$ModalExclusionType = null;
  static APPLICATION_EXCLUDE: Dialog$ModalExclusionType = null;
  static TOOLKIT_EXCLUDE: Dialog$ModalExclusionType = null;
  static $VALUES: Dialog$ModalExclusionType[] = null;
  _Dialog$ModalExclusionType($name: string, $ordinal: number): this {
    this._JEnum($name, $ordinal);
    return this;
  }
  static values(): Dialog$ModalExclusionType[] { return Dialog$ModalExclusionType.$VALUES.slice(); }
  static valueOf(name: string): Dialog$ModalExclusionType { return $J.enumValueOf(Dialog$ModalExclusionType, name); }
  static $clinit() {
    Dialog$ModalExclusionType.NO_EXCLUDE = new Dialog$ModalExclusionType()._Dialog$ModalExclusionType('NO_EXCLUDE', 0);
    Dialog$ModalExclusionType.APPLICATION_EXCLUDE = new Dialog$ModalExclusionType()._Dialog$ModalExclusionType('APPLICATION_EXCLUDE', 1);
    Dialog$ModalExclusionType.TOOLKIT_EXCLUDE = new Dialog$ModalExclusionType()._Dialog$ModalExclusionType('TOOLKIT_EXCLUDE', 2);
    Dialog$ModalExclusionType.$VALUES = [Dialog$ModalExclusionType.NO_EXCLUDE, Dialog$ModalExclusionType.APPLICATION_EXCLUDE, Dialog$ModalExclusionType.TOOLKIT_EXCLUDE];
  }
}

/**
 * This class implements accessibility support for the
 * {@code Dialog} class.  It provides an implementation of the
 * Java Accessibility API appropriate to dialog user-interface elements.
 * @since 1.3
 */
export class Dialog$AccessibleAWTDialog extends Window$AccessibleAWTWindow {
  /**
   * Constructs an {@code AccessibleAWTDialog}.
   */
  _Dialog$AccessibleAWTDialog(): this {
    this._Window$AccessibleAWTWindow();
    return this;
  }
}

$J.define(Dialog, 'java.awt.Dialog', { kind: 'class', sup: 'java.awt.Window', ctors: { 'java.awt.Window,java.lang.String,java.awt.Dialog$ModalityType,java.awt.GraphicsConfiguration': '_Dialog$Window$String$ModalityType$GraphicsConfiguration', 'java.awt.Window,java.lang.String,java.awt.Dialog$ModalityType': '_Dialog$Window$String$ModalityType', 'java.awt.Window,java.awt.Dialog$ModalityType': '_Dialog$Window$ModalityType', 'java.awt.Window,java.lang.String': '_Dialog$Window$String', 'java.awt.Window': '_Dialog$Window', 'java.awt.Dialog,java.lang.String,boolean,java.awt.GraphicsConfiguration': '_Dialog$Dialog$String$boolean$GraphicsConfiguration', 'java.awt.Dialog,java.lang.String,boolean': '_Dialog$Dialog$String$boolean', 'java.awt.Dialog,java.lang.String': '_Dialog$Dialog$String', 'java.awt.Dialog': '_Dialog$Dialog', 'java.awt.Frame,java.lang.String,boolean,java.awt.GraphicsConfiguration': '_Dialog$Frame$String$boolean$GraphicsConfiguration', 'java.awt.Frame,java.lang.String,boolean': '_Dialog$Frame$String$boolean', 'java.awt.Frame,java.lang.String': '_Dialog$Frame$String', 'java.awt.Frame,boolean': '_Dialog$Frame$boolean', 'java.awt.Frame': '_Dialog$Frame' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Dialog', 'show()': 'show$' }, clinit: true, lazy: ['DEFAULT_MODALITY_TYPE', 'modalDialogs', 'nameCounter'] });
$J.define(Dialog$ModalityType, 'java.awt.Dialog$ModalityType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Dialog$ModalityType' }, clinit: true, lazy: ['$VALUES', 'MODELESS', 'DOCUMENT_MODAL', 'APPLICATION_MODAL', 'TOOLKIT_MODAL'] });
$J.define(Dialog$ModalExclusionType, 'java.awt.Dialog$ModalExclusionType', { kind: 'enum', sup: 'java.lang.Enum', ctors: { '': '_Dialog$ModalExclusionType' }, clinit: true, lazy: ['$VALUES', 'NO_EXCLUDE', 'APPLICATION_EXCLUDE', 'TOOLKIT_EXCLUDE'] });
$J.define(Dialog$AccessibleAWTDialog, 'java.awt.Dialog$AccessibleAWTDialog', { kind: 'class', sup: 'java.awt.Window$AccessibleAWTWindow', ctors: { '': '_Dialog$AccessibleAWTDialog' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  AWTEvent = $J.load('java.awt.AWTEvent');
  Frame = $J.load('java.awt.Frame');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  KeyboardFocusManager = $J.load('java.awt.KeyboardFocusManager');
  ModalEventFilter = $J.load('java.awt.ModalEventFilter');
  ComponentEvent = $J.load('java.awt.event.ComponentEvent');
  HierarchyEvent = $J.load('java.awt.event.HierarchyEvent');
  InvocationEvent = $J.load('java.awt.event.InvocationEvent');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  AWTPermissions = $J.load('sun.awt.AWTPermissions');
  IdentityArrayList = $J.load('sun.awt.util.IdentityArrayList');
});
