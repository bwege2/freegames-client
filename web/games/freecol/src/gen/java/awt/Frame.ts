// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/java/awt/Frame.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject, SunToolkit, Toolkit } from '../../../jre/index.ts';
import { Window } from './Window.ts';
import { Window$AccessibleAWTWindow } from './Window.ts';

let GraphicsEnvironment, IllegalComponentStateException, AWTAccessor;

/**
 * A {@code Frame} is a top-level window with a title and a border.
 * <p>
 * The size of the frame includes any area designated for the
 * border.  The dimensions of the border area may be obtained
 * using the {@code getInsets} method, however, since
 * these dimensions are platform-dependent, a valid insets
 * value cannot be obtained until the frame is made displayable
 * by either calling {@code pack} or {@code show}.
 * Since the border area is included in the overall size of the
 * frame, the border effectively obscures a portion of the frame,
 * constraining the area available for rendering and/or displaying
 * subcomponents to the rectangle which has an upper-left corner
 * location of {@code (insets.left, insets.top)}, and has a size of
 * {@code width - (insets.left + insets.right)} by
 * {@code height - (insets.top + insets.bottom)}.
 * <p>
 * The default layout for a frame is {@code BorderLayout}.
 * <p>
 * A frame may have its native decorations (i.e. {@code Frame}
 * and {@code Titlebar}) turned off
 * with {@code setUndecorated}. This can only be done while the frame
 * is not {@link Component#isDisplayable() displayable}.
 * <p>
 * In a multi-screen environment, you can create a {@code Frame}
 * on a different screen device by constructing the {@code Frame}
 * with {@link #Frame(GraphicsConfiguration)} or
 * {@link #Frame(String title, GraphicsConfiguration)}.  The
 * {@code GraphicsConfiguration} object is one of the
 * {@code GraphicsConfiguration} objects of the target screen
 * device.
 * <p>
 * In a virtual device multi-screen environment in which the desktop
 * area could span multiple physical screen devices, the bounds of all
 * configurations are relative to the virtual-coordinate system.  The
 * origin of the virtual-coordinate system is at the upper left-hand
 * corner of the primary physical screen.  Depending on the location
 * of the primary screen in the virtual device, negative coordinates
 * are possible, as shown in the following figure.
 * <p>
 * <img src="doc-files/MultiScreen.gif" alt="Diagram of virtual device
 * encompassing three physical screens and one primary physical screen. The
 * primary physical screen shows (0,0) coords while a different physical screen
 * shows (-80,-100) coords." style="margin: 7px 10px;">
 * <p>
 * In such an environment, when calling {@code setLocation},
 * you must pass a virtual coordinate to this method.  Similarly,
 * calling {@code getLocationOnScreen} on a {@code Frame}
 * returns virtual device coordinates.  Call the {@code getBounds}
 * method of a {@code GraphicsConfiguration} to find its origin in
 * the virtual coordinate system.
 * <p>
 * The following code sets the
 * location of the {@code Frame} at (10, 10) relative
 * to the origin of the physical screen of the corresponding
 * {@code GraphicsConfiguration}.  If the bounds of the
 * {@code GraphicsConfiguration} is not taken into account, the
 * {@code Frame} location would be set at (10, 10) relative to the
 * virtual-coordinate system and would appear on the primary physical
 * screen, which might be different from the physical screen of the
 * specified {@code GraphicsConfiguration}.
 *
 * <pre>
 *      Frame f = new Frame(GraphicsConfiguration gc);
 *      Rectangle bounds = gc.getBounds();
 *      f.setLocation(10 + bounds.x, 10 + bounds.y);
 * </pre>
 *
 * <p>
 * Frames are capable of generating the following types of
 * {@code WindowEvent}s:
 * <ul>
 * <li>{@code WINDOW_OPENED}
 * <li>{@code WINDOW_CLOSING}:
 *     <br>If the program doesn't
 *     explicitly hide or dispose the window while processing
 *     this event, the window close operation is canceled.
 * <li>{@code WINDOW_CLOSED}
 * <li>{@code WINDOW_ICONIFIED}
 * <li>{@code WINDOW_DEICONIFIED}
 * <li>{@code WINDOW_ACTIVATED}
 * <li>{@code WINDOW_DEACTIVATED}
 * <li>{@code WINDOW_GAINED_FOCUS}
 * <li>{@code WINDOW_LOST_FOCUS}
 * <li>{@code WINDOW_STATE_CHANGED}
 * </ul>
 *
 * @author      Sami Shaio
 * @see WindowEvent
 * @see Window#addWindowListener
 * @since       1.0
 */
export class Frame extends Window {
  /**
   * @deprecated   replaced by {@code Cursor.DEFAULT_CURSOR}.
   */
  static readonly DEFAULT_CURSOR: number = 0;
  /**
   * @deprecated   replaced by {@code Cursor.CROSSHAIR_CURSOR}.
   */
  static readonly CROSSHAIR_CURSOR: number = 1;
  /**
   * @deprecated   replaced by {@code Cursor.TEXT_CURSOR}.
   */
  static readonly TEXT_CURSOR: number = 2;
  /**
   * @deprecated   replaced by {@code Cursor.WAIT_CURSOR}.
   */
  static readonly WAIT_CURSOR: number = 3;
  /**
   * @deprecated   replaced by {@code Cursor.SW_RESIZE_CURSOR}.
   */
  static readonly SW_RESIZE_CURSOR: number = 4;
  /**
   * @deprecated   replaced by {@code Cursor.SE_RESIZE_CURSOR}.
   */
  static readonly SE_RESIZE_CURSOR: number = 5;
  /**
   * @deprecated   replaced by {@code Cursor.NW_RESIZE_CURSOR}.
   */
  static readonly NW_RESIZE_CURSOR: number = 6;
  /**
   * @deprecated   replaced by {@code Cursor.NE_RESIZE_CURSOR}.
   */
  static readonly NE_RESIZE_CURSOR: number = 7;
  /**
   * @deprecated   replaced by {@code Cursor.N_RESIZE_CURSOR}.
   */
  static readonly N_RESIZE_CURSOR: number = 8;
  /**
   * @deprecated   replaced by {@code Cursor.S_RESIZE_CURSOR}.
   */
  static readonly S_RESIZE_CURSOR: number = 9;
  /**
   * @deprecated   replaced by {@code Cursor.W_RESIZE_CURSOR}.
   */
  static readonly W_RESIZE_CURSOR: number = 10;
  /**
   * @deprecated   replaced by {@code Cursor.E_RESIZE_CURSOR}.
   */
  static readonly E_RESIZE_CURSOR: number = 11;
  /**
   * @deprecated   replaced by {@code Cursor.HAND_CURSOR}.
   */
  static readonly HAND_CURSOR: number = 12;
  /**
   * @deprecated   replaced by {@code Cursor.MOVE_CURSOR}.
   */
  static readonly MOVE_CURSOR: number = 13;
  /**
   * Frame is in the "normal" state.  This symbolic constant names a
   * frame state with all state bits cleared.
   * @see #setExtendedState(int)
   * @see #getExtendedState
   */
  static readonly NORMAL: number = 0;
  /**
   * This state bit indicates that frame is iconified.
   * @see #setExtendedState(int)
   * @see #getExtendedState
   */
  static readonly ICONIFIED: number = 1;
  /**
   * This state bit indicates that frame is maximized in the
   * horizontal direction.
   * @see #setExtendedState(int)
   * @see #getExtendedState
   * @since 1.4
   */
  static readonly MAXIMIZED_HORIZ: number = 2;
  /**
   * This state bit indicates that frame is maximized in the
   * vertical direction.
   * @see #setExtendedState(int)
   * @see #getExtendedState
   * @since 1.4
   */
  static readonly MAXIMIZED_VERT: number = 4;
  /**
   * This state bit mask indicates that frame is fully maximized
   * (that is both horizontally and vertically).  It is just a
   * convenience alias for
   * <code>MAXIMIZED_VERT&nbsp;|&nbsp;MAXIMIZED_HORIZ</code>.
   *
   * <p>Note that the correct test for frame being fully maximized is
   * <pre>
   *     (state &amp; Frame.MAXIMIZED_BOTH) == Frame.MAXIMIZED_BOTH
   * </pre>
   *
   * <p>To test is frame is maximized in <em>some</em> direction use
   * <pre>
   *     (state &amp; Frame.MAXIMIZED_BOTH) != 0
   * </pre>
   *
   * @see #setExtendedState(int)
   * @see #getExtendedState
   * @since 1.4
   */
  static readonly MAXIMIZED_BOTH: number = 6;
  /**
   * Maximized bounds for this frame.
   * @see     #setMaximizedBounds(Rectangle)
   * @see     #getMaximizedBounds
   * @serial
   * @since 1.4
   */
  maximizedBounds: Rectangle = null;
  /**
   * This is the title of the frame.  It can be changed
   * at any time.  {@code title} can be null and if
   * this is the case the {@code title} = "".
   *
   * @serial
   * @see #getTitle
   * @see #setTitle(String)
   */
  title: string = null;
  /**
   * The frames menubar.  If {@code menuBar} = null
   * the frame will not have a menubar.
   *
   * @serial
   * @see #getMenuBar
   * @see #setMenuBar(MenuBar)
   */
  menuBar: MenuBar = null;
  /**
   * This field indicates whether the frame is resizable.
   * This property can be changed at any time.
   * {@code resizable} will be true if the frame is
   * resizable, otherwise it will be false.
   *
   * @serial
   * @see #isResizable()
   */
  resizable: boolean = false;
  /**
   * This field indicates whether the frame is undecorated.
   * This property can only be changed while the frame is not displayable.
   * {@code undecorated} will be true if the frame is
   * undecorated, otherwise it will be false.
   *
   * @serial
   * @see #setUndecorated(boolean)
   * @see #isUndecorated()
   * @see Component#isDisplayable()
   * @since 1.4
   */
  undecorated: boolean = false;
  /**
   * {@code mbManagement} is only used by the Motif implementation.
   *
   * @serial
   */
  mbManagement: boolean = false;
  /**
   * The bitwise mask of frame state constants.
   */
  state$Frame: number = 0;
  /**
   * The Windows owned by the Frame.
   * Note: in 1.2 this has been superseded by Window.ownedWindowList
   *
   * @serial
   * @see java.awt.Window#ownedWindowList
   */
  ownedWindows: Vector<Window> = null;
  static readonly base: string = 'frame';
  static nameCounter: number = 0;
  /**
   * {@code Frame}'s Serialized Data Version.
   *
   * @serial
   */
  frameSerializedDataVersion: number = 0;
  $init_Frame() {
    this.title = 'Untitled';
    this.resizable = true;
    this.undecorated = false;
    this.mbManagement = false;
    this.state$Frame = Frame.NORMAL;
    this.frameSerializedDataVersion = 1;
  }
  /**
   * Constructs a new instance of {@code Frame} that is
   * initially invisible.  The title of the {@code Frame}
   * is empty.
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   * @see java.awt.GraphicsEnvironment#isHeadless()
   * @see Component#setSize
   * @see Component#setVisible(boolean)
   */
  _Frame$(): this {
    this._Frame$String('');
    return this;
  }
  /**
   * Constructs a new, initially invisible {@code Frame} with the
   * specified {@code GraphicsConfiguration}.
   *
   * @param gc the {@code GraphicsConfiguration}
   * of the target screen device. If {@code gc}
   * is {@code null}, the system default
   * {@code GraphicsConfiguration} is assumed.
   * @throws IllegalArgumentException if
   * {@code gc} is not from a screen device.
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   * @see java.awt.GraphicsEnvironment#isHeadless()
   * @since     1.3
   */
  _Frame$GraphicsConfiguration(gc: GraphicsConfiguration): this {
    this._Frame$String$GraphicsConfiguration('', gc);
    return this;
  }
  /**
   * Constructs a new, initially invisible {@code Frame} object
   * with the specified title.
   * @param title the title to be displayed in the frame's border.
   *              A {@code null} value
   *              is treated as an empty string, "".
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   * @see java.awt.GraphicsEnvironment#isHeadless()
   * @see java.awt.Component#setSize
   * @see java.awt.Component#setVisible(boolean)
   * @see java.awt.GraphicsConfiguration#getBounds
   */
  _Frame$String(title: string): this {
    this._Window$();
    this.$init_Frame();
    this.init$String$GraphicsConfiguration$Frame(title, null);
    return this;
  }
  /**
   * Constructs a new, initially invisible {@code Frame} object
   * with the specified title and a
   * {@code GraphicsConfiguration}.
   * @param title the title to be displayed in the frame's border.
   *              A {@code null} value
   *              is treated as an empty string, "".
   * @param gc the {@code GraphicsConfiguration}
   * of the target screen device.  If {@code gc} is
   * {@code null}, the system default
   * {@code GraphicsConfiguration} is assumed.
   * @throws IllegalArgumentException if {@code gc}
   * is not from a screen device.
   * @throws HeadlessException when
   *     {@code GraphicsEnvironment.isHeadless()} returns {@code true}
   * @see java.awt.GraphicsEnvironment#isHeadless()
   * @see java.awt.Component#setSize
   * @see java.awt.Component#setVisible(boolean)
   * @see java.awt.GraphicsConfiguration#getBounds
   * @since 1.3
   */
  _Frame$String$GraphicsConfiguration(title: string, gc: GraphicsConfiguration): this {
    this._Window$GraphicsConfiguration(gc);
    this.$init_Frame();
    this.init$String$GraphicsConfiguration$Frame(title, gc);
    return this;
  }
  init$String$GraphicsConfiguration$Frame(title: string, gc: GraphicsConfiguration): void {
    this.title = title;
    SunToolkit.checkAndSetPolicy(this);
  }
  /**
   * Construct a name for this component.  Called by getName() when the
   * name is null.
   */
  constructComponentName(): string {
    {
      return Frame.base + Frame.nameCounter++;
    }
  }
  /**
   * Makes this Frame displayable by connecting it to
   * a native screen resource.  Making a frame displayable will
   * cause any of its children to be made displayable.
   * This method is called internally by the toolkit and should
   * not be called directly by programs.
   * @see Component#isDisplayable
   * @see #removeNotify
   */
  addNotify(): void {
    {
      if (this.peer == null) {
        this.peer = this.getComponentFactory().createFrame(this);
      }
      let p = this.peer;
      let menuBar = this.menuBar;
      if (menuBar != null) {
        this.mbManagement = true;
        menuBar.addNotify();
        p.setMenuBar(menuBar);
      }
      p.setMaximizedBounds(this.maximizedBounds);
      super.addNotify();
    }
  }
  /**
   * Gets the title of the frame.  The title is displayed in the
   * frame's border.
   * @return    the title of this frame, or an empty string ("")
   *                if this frame doesn't have a title.
   * @see       #setTitle(String)
   */
  getTitle(): string {
    return this.title;
  }
  /**
   * {@inheritDoc}
   */
  setIconImage(image: Image): void {
    super.setIconImage(image);
  }
  /**
   * Indicates whether this frame is resizable by the user.
   * By default, all frames are initially resizable.
   * @return    {@code true} if the user can resize this frame;
   *                        {@code false} otherwise.
   * @see       java.awt.Frame#setResizable(boolean)
   */
  isResizable(): boolean {
    return this.resizable;
  }
  /**
   * Sets whether this frame is resizable by the user.
   * @param    resizable   {@code true} if this frame is resizable;
   *                       {@code false} otherwise.
   * @see      java.awt.Frame#isResizable
   */
  setResizable(resizable: boolean): void {
    let oldResizable = this.resizable;
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
    this.firePropertyChange$String$boolean$boolean('resizable', oldResizable, resizable);
  }
  /**
   * Sets the state of this frame. The state is
   * represented as a bitwise mask.
   * <ul>
   * <li>{@code NORMAL}
   * <br>Indicates that no state bits are set.
   * <li>{@code ICONIFIED}
   * <li>{@code MAXIMIZED_HORIZ}
   * <li>{@code MAXIMIZED_VERT}
   * <li>{@code MAXIMIZED_BOTH}
   * <br>Concatenates {@code MAXIMIZED_HORIZ}
   * and {@code MAXIMIZED_VERT}.
   * </ul>
   * <p>Note that if the state is not supported on a
   * given platform, neither the state nor the return
   * value of the {@link #getExtendedState} method will
   * be changed. The application may determine whether
   * a specific state is supported via the {@link
   * java.awt.Toolkit#isFrameStateSupported} method.
   * <p><b>If the frame is currently visible on the
   * screen</b> (the {@link #isShowing} method returns
   * {@code true}), the developer should examine the
   * return value of the {@link
   * java.awt.event.WindowEvent#getNewState} method of
   * the {@code WindowEvent} received through the
   * {@link java.awt.event.WindowStateListener} to
   * determine that the state has actually been
   * changed.
   * <p><b>If the frame is not visible on the
   * screen</b>, the events may or may not be
   * generated.  In this case the developer may assume
   * that the state changes immediately after this
   * method returns.  Later, when the {@code
   * setVisible(true)} method is invoked, the frame
   * will attempt to apply this state. Receiving any
   * {@link
   * java.awt.event.WindowEvent#WINDOW_STATE_CHANGED}
   * events is not guaranteed in this case also.
   *
   * @param state a bitwise mask of frame state constants
   * @since   1.4
   * @see java.awt.Window#addWindowStateListener
   */
  setExtendedState(state: number): void {
    if (!this.isFrameStateSupported(state)) {
      return;
    }
    {
      this.state$Frame = state;
    }
    let peer = this.peer;
    if (peer != null) {
      peer.setState(state);
    }
  }
  isFrameStateSupported(state: number): boolean {
    if (!this.getToolkit().isFrameStateSupported(state)) {
      if (((state & Frame.ICONIFIED) !== 0) && !this.getToolkit().isFrameStateSupported(Frame.ICONIFIED)) {
        return false;
      } else {
        state &= ~Frame.ICONIFIED;
      }
      return this.getToolkit().isFrameStateSupported(state);
    }
    return true;
  }
  /**
   * Gets the state of this frame (obsolete).
   * <p>
   * In older versions of JDK a frame state could only be NORMAL or
   * ICONIFIED.  Since JDK 1.4 set of supported frame states is
   * expanded and frame state is represented as a bitwise mask.
   * <p>
   * For compatibility with old programs this method still returns
   * {@code Frame.NORMAL} and {@code Frame.ICONIFIED} but
   * it only reports the iconic state of the frame, other aspects of
   * frame state are not reported by this method.
   *
   * @return  {@code Frame.NORMAL} or {@code Frame.ICONIFIED}.
   * @see     #setState(int)
   * @see     #getExtendedState
   */
  getState(): number {
    return (this.getExtendedState() & Frame.ICONIFIED) !== 0 ? Frame.ICONIFIED : Frame.NORMAL;
  }
  /**
   * Gets the state of this frame. The state is
   * represented as a bitwise mask.
   * <ul>
   * <li>{@code NORMAL}
   * <br>Indicates that no state bits are set.
   * <li>{@code ICONIFIED}
   * <li>{@code MAXIMIZED_HORIZ}
   * <li>{@code MAXIMIZED_VERT}
   * <li>{@code MAXIMIZED_BOTH}
   * <br>Concatenates {@code MAXIMIZED_HORIZ}
   * and {@code MAXIMIZED_VERT}.
   * </ul>
   *
   * @return  a bitwise mask of frame state constants
   * @see     #setExtendedState(int)
   * @since 1.4
   */
  getExtendedState(): number {
    {
      return this.state$Frame;
    }
  }
  /**
   * Disables or enables decorations for this frame.
   * <p>
   * This method can only be called while the frame is not displayable. To
   * make this frame decorated, it must be opaque and have the default shape,
   * otherwise the {@code IllegalComponentStateException} will be thrown.
   * Refer to {@link Window#setShape}, {@link Window#setOpacity} and {@link
   * Window#setBackground} for details
   *
   * @param  undecorated {@code true} if no frame decorations are to be
   *         enabled; {@code false} if frame decorations are to be enabled
   *
   * @throws IllegalComponentStateException if the frame is displayable
   * @throws IllegalComponentStateException if {@code undecorated} is
   *      {@code false}, and this frame does not have the default shape
   * @throws IllegalComponentStateException if {@code undecorated} is
   *      {@code false}, and this frame opacity is less than {@code 1.0f}
   * @throws IllegalComponentStateException if {@code undecorated} is
   *      {@code false}, and the alpha value of this frame background
   *      color is less than {@code 1.0f}
   *
   * @see    #isUndecorated
   * @see    Component#isDisplayable
   * @see    Window#getShape
   * @see    Window#getOpacity
   * @see    Window#getBackground
   * @see    javax.swing.JFrame#setDefaultLookAndFeelDecorated(boolean)
   *
   * @since 1.4
   */
  setUndecorated(undecorated: boolean): void {
    {
      if (this.isDisplayable()) {
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame is displayable.');
      }
      if (!undecorated) {
        if (this.getOpacity() < 1) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame is not opaque');
        }
        if (this.getShape() != null) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame does not have a default shape');
        }
        let bg = this.getBackground();
        if ((bg != null) && (bg.getAlpha() < 255)) {
          throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame background color is not opaque');
        }
      }
      this.undecorated = undecorated;
    }
  }
  /**
   * Indicates whether this frame is undecorated.
   * By default, all frames are initially decorated.
   * @return    {@code true} if frame is undecorated;
   *                        {@code false} otherwise.
   * @see       java.awt.Frame#setUndecorated(boolean)
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
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame is decorated');
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
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame is decorated');
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
        throw new IllegalComponentStateException()._IllegalComponentStateException$String('The frame is decorated');
      }
      super.setBackground(bgColor);
    }
  }
  /**
   * Makes this Frame undisplayable by removing its connection
   * to its native screen resource. Making a Frame undisplayable
   * will cause any of its children to be made undisplayable.
   * This method is called by the toolkit internally and should
   * not be called directly by programs.
   * @see Component#isDisplayable
   * @see #addNotify
   */
  removeNotify(): void {
    {
      let peer = this.peer;
      if (peer != null) {
        this.getState();
        if (this.menuBar != null) {
          this.mbManagement = true;
          peer.setMenuBar(null);
          this.menuBar.removeNotify();
        }
      }
      super.removeNotify();
    }
  }
  postProcessKeyEvent(e: KeyEvent): void {
    if (this.menuBar != null && this.menuBar.handleShortcut(e)) {
      e.consume();
      return;
    }
    super.postProcessKeyEvent(e);
  }
  /**
   * Returns a string representing the state of this {@code Frame}.
   * This method is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not be
   * {@code null}.
   *
   * @return the parameter string of this frame
   */
  paramString(): string {
    let str = super.paramString();
    if (this.title != null) {
      str += ',title=' + this.title;
    }
    if (this.resizable) {
      str += ',resizable';
    }
    let state = this.getExtendedState();
    if (state === Frame.NORMAL) {
      str += ',normal';
    } else {
      if ((state & Frame.ICONIFIED) !== 0) {
        str += ',iconified';
      }
      if ((state & Frame.MAXIMIZED_BOTH) === Frame.MAXIMIZED_BOTH) {
        str += ',maximized';
      } else if ((state & Frame.MAXIMIZED_HORIZ) !== 0) {
        str += ',maximized_horiz';
      } else if ((state & Frame.MAXIMIZED_VERT) !== 0) {
        str += ',maximized_vert';
      }
    }
    return str;
  }
  /**
   * Returns an array of all {@code Frame}s created by this application.
   * If called from an applet, the array includes only the {@code Frame}s
   * accessible by that applet.
   * <p>
   * <b>Warning:</b> this method may return system created frames, such
   * as a shared, hidden frame which is used by Swing. Applications
   * should not assume the existence of these frames, nor should an
   * application assume anything about these frames such as component
   * positions, {@code LayoutManager}s or serialization.
   * <p>
   * <b>Note</b>: To obtain a list of all ownerless windows, including
   * ownerless {@code Dialog}s (introduced in release 1.6), use {@link
   * Window#getOwnerlessWindows Window.getOwnerlessWindows}.
   *
   * @return the array of all {@code Frame}s created by this application
   *
   * @see Window#getWindows()
   * @see Window#getOwnerlessWindows
   *
   * @since 1.2
   */
  static getFrames(): Frame[] {
    let allWindows = Window.getWindows$();
    let frameCount = 0;
    for (let w of allWindows) {
      if (w instanceof Frame) {
        frameCount++;
      }
    }
    let frames = $J.newArray(frameCount, null);
    let c = 0;
    for (let w of allWindows) {
      if (w instanceof Frame) {
        frames[c++] = w;
      }
    }
    return frames;
  }
  static initIDs(...$a: any[]): any {
    return $J.nativeCall('java.awt.Frame', 'initIDs', this, $a);
  }
  /**
   * Gets the AccessibleContext associated with this Frame.
   * For frames, the AccessibleContext takes the form of an
   * AccessibleAWTFrame.
   * A new AccessibleAWTFrame instance is created if necessary.
   *
   * @return an AccessibleAWTFrame that serves as the
   *         AccessibleContext of this Frame
   * @since 1.3
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new Frame$AccessibleAWTFrame().$o(this)._Frame$AccessibleAWTFrame();
    }
    return this.accessibleContext;
  }
  static $clinit() {
    Frame.nameCounter = 0;
    Toolkit.loadLibraries();
    if (!GraphicsEnvironment.isHeadless()) {
      Frame.initIDs();
    }
    AWTAccessor.setFrameAccessor(new (Frame$1())());
  }
}

/**
 * This class implements accessibility support for the
 * {@code Frame} class.  It provides an implementation of the
 * Java Accessibility API appropriate to frame user-interface elements.
 * @since 1.3
 */
export class Frame$AccessibleAWTFrame extends Window$AccessibleAWTWindow {
  /**
   * Constructs an {@code AccessibleAWTFrame}.
   */
  _Frame$AccessibleAWTFrame(): this {
    this._Window$AccessibleAWTWindow();
    return this;
  }
}

let $Frame$1: any = null;
/** An anonymous class (Frame.java:828). */
function Frame$1(): any {
  return $Frame$1 ??= $J.local(class extends JObject {
  }, 'java.awt.Frame$1', ['sun.awt.AWTAccessor$FrameAccessor']);
}

$J.define(Frame, 'java.awt.Frame', { kind: 'class', ifaces: ['java.awt.MenuContainer'], sup: 'java.awt.Window', ctors: { 'java.lang.String,java.awt.GraphicsConfiguration': '_Frame$String$GraphicsConfiguration', 'java.lang.String': '_Frame$String', 'java.awt.GraphicsConfiguration': '_Frame$GraphicsConfiguration', '': '_Frame$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$Frame', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$Frame', 'setCursor(int)': 'setCursor$int', 'remove(java.awt.MenuComponent)': 'remove$MenuComponent', 'setMenuBar(java.awt.MenuBar)': 'setMenuBar$MenuBar', 'init(java.lang.String,java.awt.GraphicsConfiguration)': 'init$String$GraphicsConfiguration$Frame' }, clinit: true, lazy: ['nameCounter'] });
$J.define(Frame$AccessibleAWTFrame, 'java.awt.Frame$AccessibleAWTFrame', { kind: 'class', sup: 'java.awt.Window$AccessibleAWTWindow', ctors: { '': '_Frame$AccessibleAWTFrame' }, meths: { 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  IllegalComponentStateException = $J.load('java.awt.IllegalComponentStateException');
  AWTAccessor = $J.load('sun.awt.AWTAccessor');
});
