// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/PopupFactory.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1999, 2023, Oracle and/or its affiliates. All rights reserved.
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
import { $J, Applet, ArrayList, HashMap, IllegalArgumentException, JObject, StringBuffer, Toolkit } from '../../../jre/index.ts';
import { Popup } from './Popup.ts';
import { Panel } from '../../java/awt/Panel.ts';

let BorderLayout, Container, GraphicsEnvironment, Insets, Rectangle, Window, WindowAdapter, ClientPropertyKey, JApplet, JComponent, JDialog, JFrame, JInternalFrame, JLayeredPane, JPanel, JPopupMenu, JRootPane, JSeparator, JToolTip, JWindow, MenuElement, Popup$DefaultFrame, Popup$HeavyWeightWindow, RootPaneContainer, SwingUtilities, EmbeddedFrame, OSInfo, OSInfo$OSType, SwingAccessor;

/**
 * <code>PopupFactory</code>, as the name implies, is used to obtain
 * instances of <code>Popup</code>s. <code>Popup</code>s are used to
 * display a <code>Component</code> above all other <code>Component</code>s
 * in a particular containment hierarchy. The general contract is that
 * once you have obtained a <code>Popup</code> from a
 * <code>PopupFactory</code>, you must invoke <code>hide</code> on the
 * <code>Popup</code>. The typical usage is:
 * <pre>
 *   PopupFactory factory = PopupFactory.getSharedInstance();
 *   Popup popup = factory.getPopup(owner, contents, x, y);
 *   popup.show();
 *   ...
 *   popup.hide();
 * </pre>
 *
 * @see Popup
 *
 * @since 1.4
 */
export class PopupFactory extends JObject {
  /**
   * The shared instanceof <code>PopupFactory</code> is per
   * <code>AppContext</code>. This is the key used in the
   * <code>AppContext</code> to locate the <code>PopupFactory</code>.
   */
  static SharedInstanceKey: any = null;
  /**
   * Max number of items to store in any one particular cache.
   */
  static readonly MAX_CACHE_SIZE: number = 5;
  /**
   * Key used to indicate a light weight popup should be used.
   */
  static readonly LIGHT_WEIGHT_POPUP: number = 0;
  /**
   * Key used to indicate a medium weight Popup should be used.
   */
  static readonly MEDIUM_WEIGHT_POPUP: number = 1;
  static readonly HEAVY_WEIGHT_POPUP: number = 2;
  /**
   * Default type of Popup to create.
   */
  popupType: number = 0;
  /**
   * Constructs a {@code PopupFactory}.
   */
  _PopupFactory(): this {
    this.popupType = PopupFactory.LIGHT_WEIGHT_POPUP;
    return this;
  }
  /**
   * Sets the <code>PopupFactory</code> that will be used to obtain
   * <code>Popup</code>s.
   * This will throw an <code>IllegalArgumentException</code> if
   * <code>factory</code> is null.
   *
   * @param factory Shared PopupFactory
   * @throws IllegalArgumentException if <code>factory</code> is null
   * @see #getPopup
   */
  static setSharedInstance(factory: PopupFactory): void {
    if (factory == null) {
      throw new IllegalArgumentException('PopupFactory can not be null');
    }
    SwingUtilities.appContextPut(PopupFactory.SharedInstanceKey, factory);
  }
  /**
   * Returns the shared <code>PopupFactory</code> which can be used
   * to obtain <code>Popup</code>s.
   *
   * @return Shared PopupFactory
   */
  static getSharedInstance(): PopupFactory {
    let factory = SwingUtilities.appContextGet(PopupFactory.SharedInstanceKey);
    if (factory == null) {
      factory = new PopupFactory()._PopupFactory();
      PopupFactory.setSharedInstance(factory);
    }
    return factory;
  }
  /**
   * Provides a hint as to the type of <code>Popup</code> that should
   * be created.
   */
  setPopupType(type$: number): void {
    this.popupType = type$;
  }
  /**
   * Returns the preferred type of Popup to create.
   */
  getPopupType$(): number {
    return this.popupType;
  }
  /**
   * Creates a <code>Popup</code> for the Component <code>owner</code>
   * containing the Component <code>contents</code>. <code>owner</code>
   * is used to determine which <code>Window</code> the new
   * <code>Popup</code> will parent the <code>Component</code> the
   * <code>Popup</code> creates to. A null <code>owner</code> implies there
   * is no valid parent. <code>x</code> and
   * <code>y</code> specify the preferred initial location to place
   * the <code>Popup</code> at. Based on screen size, or other parameters,
   * the <code>Popup</code> may not display at <code>x</code> and
   * <code>y</code>.
   *
   * @param owner    Component mouse coordinates are relative to, may be null
   * @param contents Contents of the Popup
   * @param x        Initial x screen coordinate
   * @param y        Initial y screen coordinate
   * @throws IllegalArgumentException if contents is null
   * @return Popup containing Contents
   */
  getPopup$Component$Component$int$int(owner: Component, contents: Component, x: number, y: number): Popup {
    return this.getPopup$Component$Component$int$int$boolean(owner, contents, x, y, false);
  }
  /**
   * Creates a {@code Popup} for the Component {@code owner}
   * containing the Component {@code contents}.
   * The window containing the component {@code owner}
   * will be used as the parent window. A null {@code owner} implies there
   * is no valid parent. {@code x} and {@code y} specify the preferred
   * initial location to place the {@code Popup} at. Based on screen size,
   * or other parameters, the {@code Popup} may not display at {@code x} and
   * {@code y}. {@code isHeavyWeightPopup} specifies if the {@code Popup}
   * will be heavyweight. Passing {@code true} will force the {@code Popup}
   * type to be heavyweight, otherwise {@code Popup} type will be selected by
   * {@code Popup} factory. Lightweight {@code Popup} windows are more
   * efficient than heavyweight (native peer) windows, but lightweight
   * and heavyweight components do not mix well in a GUI.
   * This method is intended to be used only by PopupFactory sub-classes.
   * @param owner Component mouse coordinates are relative to, may be null
   * @param contents Contents of the Popup
   * @param x Initial x screen coordinate
   * @param y Initial y screen coordinate
   * @param isHeavyWeightPopup true if Popup should be heavy weight,
   * otherwise popup type will be selected by popup factory.
   * @throws IllegalArgumentException if contents is null
   * @return Popup containing Contents
   */
  getPopup$Component$Component$int$int$boolean(owner: Component, contents: Component, x: number, y: number, isHeavyWeightPopup: boolean): Popup {
    if (contents == null) {
      throw new IllegalArgumentException('Popup.getPopup must be passed non-null contents');
    }
    if (isHeavyWeightPopup) {
      return this.getPopup$Component$Component$int$int$int$PopupFactory(owner, contents, x, y, PopupFactory.HEAVY_WEIGHT_POPUP);
    }
    let popupType = this.getPopupType$Component$Component$int$int$PopupFactory(owner, contents, x, y);
    let popup = this.getPopup$Component$Component$int$int$int$PopupFactory(owner, contents, x, y, popupType);
    if (popup == null) {
      popup = this.getPopup$Component$Component$int$int$int$PopupFactory(owner, contents, x, y, PopupFactory.HEAVY_WEIGHT_POPUP);
    }
    return popup;
  }
  /**
   * Returns the popup type to use for the specified parameters.
   */
  getPopupType$Component$Component$int$int$PopupFactory(owner: Component, contents: Component, ownerX: number, ownerY: number): number {
    let popupType = this.getPopupType$();
    if (owner == null || this.invokerInHeavyWeightPopup(owner)) {
      popupType = PopupFactory.HEAVY_WEIGHT_POPUP;
    } else if (popupType === PopupFactory.LIGHT_WEIGHT_POPUP && !(contents instanceof JToolTip) && !(contents instanceof JPopupMenu)) {
      popupType = PopupFactory.MEDIUM_WEIGHT_POPUP;
    }
    let c = owner;
    while (c != null) {
      if (c instanceof JComponent) {
        if ((c).getClientProperty(ClientPropertyKey.PopupFactory_FORCE_HEAVYWEIGHT_POPUP) === true) {
          popupType = PopupFactory.HEAVY_WEIGHT_POPUP;
          break;
        }
      }
      c = c.getParent();
    }
    return popupType;
  }
  /**
   * Obtains the appropriate <code>Popup</code> based on
   * <code>popupType</code>.
   */
  getPopup$Component$Component$int$int$int$PopupFactory(owner: Component, contents: Component, ownerX: number, ownerY: number, popupType: number): Popup {
    if (GraphicsEnvironment.isHeadless()) {
      return this.getHeadlessPopup(owner, contents, ownerX, ownerY);
    }
    {
      let popup: Popup;
      switch (popupType) {
        case PopupFactory.LIGHT_WEIGHT_POPUP:
          return this.getLightWeightPopup(owner, contents, ownerX, ownerY);
        case PopupFactory.MEDIUM_WEIGHT_POPUP:
          return this.getMediumWeightPopup(owner, contents, ownerX, ownerY);
        case PopupFactory.HEAVY_WEIGHT_POPUP:
          popup = this.getHeavyWeightPopup(owner, contents, ownerX, ownerY);
          if ((OSInfo.getOSType() === OSInfo$OSType.MACOSX) && (owner != null) && (EmbeddedFrame.getAppletIfAncestorOf(owner) != null)) {
            (popup).setCacheEnabled(false);
          }
          return popup;
      }
    }
    return null;
  }
  /**
   * Creates a headless popup
   */
  getHeadlessPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    return PopupFactory$HeadlessPopup.getHeadlessPopup(owner, contents, ownerX, ownerY);
  }
  /**
   * Creates a light weight popup.
   */
  getLightWeightPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    return PopupFactory$LightWeightPopup.getLightWeightPopup(owner, contents, ownerX, ownerY);
  }
  /**
   * Creates a medium weight popup.
   */
  getMediumWeightPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    return PopupFactory$MediumWeightPopup.getMediumWeightPopup(owner, contents, ownerX, ownerY);
  }
  /**
   * Creates a heavy weight popup.
   */
  getHeavyWeightPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    if (GraphicsEnvironment.isHeadless()) {
      return this.getMediumWeightPopup(owner, contents, ownerX, ownerY);
    }
    return PopupFactory$HeavyWeightPopup.getHeavyWeightPopup(owner, contents, ownerX, ownerY);
  }
  /**
   * Returns true if the Component <code>i</code> inside a heavy weight
   * <code>Popup</code>.
   */
  invokerInHeavyWeightPopup(i: Component): boolean {
    if (i != null) {
      let parent: Container;
      for (parent = i.getParent(); parent != null; parent = parent.getParent()) {
        if (parent instanceof Popup$HeavyWeightWindow) {
          return true;
        }
      }
    }
    return false;
  }
  static $clinit() {
    SwingAccessor.setPopupFactoryAccessor(new (PopupFactory$1())());
    PopupFactory.SharedInstanceKey = new StringBuffer('PopupFactory.SharedInstanceKey');
  }
}

/**
 * Popup implementation that uses a Window as the popup.
 */
export class PopupFactory$HeavyWeightPopup extends Popup {
  static heavyWeightPopupCacheKey: any = null;
  isCacheEnabled: boolean = false;
  _PopupFactory$HeavyWeightPopup(): this {
    this._Popup$();
    this.isCacheEnabled = true;
    return this;
  }
  /**
   * Returns either a new or recycled <code>Popup</code> containing
   * the specified children.
   */
  static getHeavyWeightPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    let window = (owner != null) ? SwingUtilities.getWindowAncestor(owner) : null;
    let popup = null;
    if (window != null) {
      popup = PopupFactory$HeavyWeightPopup.getRecycledHeavyWeightPopup(window);
    }
    let focusPopup = false;
    if (contents != null && contents.isFocusable()) {
      if (contents instanceof JPopupMenu) {
        let jpm = contents;
        let popComps = jpm.getComponents();
        for (let popComp of popComps) {
          if (!($J.isa(popComp, MenuElement)) && !(popComp instanceof JSeparator)) {
            focusPopup = true;
            break;
          }
        }
      }
    }
    if (popup == null || (popup.getComponent()).getFocusableWindowState() !== focusPopup) {
      if (popup != null) {
        popup._dispose();
      }
      popup = new PopupFactory$HeavyWeightPopup()._PopupFactory$HeavyWeightPopup();
    }
    popup.reset(owner, contents, ownerX, ownerY);
    if (focusPopup) {
      let wnd = popup.getComponent();
      wnd.setFocusableWindowState(true);
      wnd.setName('###focusableSwingPopup###');
    }
    return popup;
  }
  /**
   * Returns a previously disposed heavy weight <code>Popup</code>
   * associated with <code>window</code>. This will return null if
   * there is no <code>HeavyWeightPopup</code> associated with
   * <code>window</code>.
   */
  static getRecycledHeavyWeightPopup(w: Window): PopupFactory$HeavyWeightPopup {
    {
      let cache: List<PopupFactory$HeavyWeightPopup>;
      let heavyPopupCache = PopupFactory$HeavyWeightPopup.getHeavyWeightPopupCache();
      if (heavyPopupCache.containsKey(w)) {
        cache = heavyPopupCache.get(w);
      } else {
        return null;
      }
      if (cache.size() > 0) {
        let r = cache.get(0);
        cache.removeAt(0);
        return r;
      }
      return null;
    }
  }
  /**
   * Returns the cache to use for heavy weight popups. Maps from
   * <code>Window</code> to a <code>List</code> of
   * <code>HeavyWeightPopup</code>s.
   */
  static getHeavyWeightPopupCache(): JMap<Window, List<PopupFactory$HeavyWeightPopup>> {
    {
      let cache = SwingUtilities.appContextGet(PopupFactory$HeavyWeightPopup.heavyWeightPopupCacheKey);
      if (cache == null) {
        cache = new HashMap(2);
        SwingUtilities.appContextPut(PopupFactory$HeavyWeightPopup.heavyWeightPopupCacheKey, cache);
      }
      return cache;
    }
  }
  /**
   * Recycles the passed in <code>HeavyWeightPopup</code>.
   */
  static recycleHeavyWeightPopup(popup: PopupFactory$HeavyWeightPopup): void {
    {
      let cache: List<PopupFactory$HeavyWeightPopup>;
      let window = SwingUtilities.getWindowAncestor(popup.getComponent());
      let heavyPopupCache = PopupFactory$HeavyWeightPopup.getHeavyWeightPopupCache();
      if (window instanceof Popup$DefaultFrame || !window.isVisible$()) {
        popup._dispose();
        return;
      } else if (heavyPopupCache.containsKey(window)) {
        cache = heavyPopupCache.get(window);
      } else {
        cache = new ArrayList();
        heavyPopupCache.put(window, cache);
        let w = window;
        w.addWindowListener(new (PopupFactory$HeavyWeightPopup$1())().$c(w)._WindowAdapter());
      }
      if (cache.size() < PopupFactory.MAX_CACHE_SIZE) {
        cache.add(popup);
      } else {
        popup._dispose();
      }
    }
  }
  /**
   * Enables or disables cache for current object.
   */
  setCacheEnabled(enable: boolean): void {
    this.isCacheEnabled = enable;
  }
  hide(): void {
    super.hide();
    if (this.isCacheEnabled) {
      PopupFactory$HeavyWeightPopup.recycleHeavyWeightPopup(this);
    } else {
      this._dispose();
    }
  }
  /**
   * As we recycle the <code>Window</code>, we don't want to dispose it,
   * thus this method does nothing, instead use <code>_dipose</code>
   * which will handle the disposing.
   */
  dispose(): void {
  }
  _dispose(): void {
    super.dispose();
  }
  static $clinit() {
    PopupFactory$HeavyWeightPopup.heavyWeightPopupCacheKey = new StringBuffer('PopupFactory.heavyWeightPopupCache');
  }
}

/**
 * ContainerPopup consolidates the common code used in the light/medium
 * weight implementations of <code>Popup</code>.
 */
export class PopupFactory$ContainerPopup extends Popup {
  /**
   * Component we are to be added to.
   */
  owner: Component = null;
  /**
   * Desired x location.
   */
  x_: number = 0;
  /**
   * Desired y location.
   */
  y_: number = 0;
  _PopupFactory$ContainerPopup(): this {
    this._Popup$();
    return this;
  }
  hide(): void {
    let component = this.getComponent();
    if (component != null) {
      let parent = component.getParent();
      if (parent != null) {
        let bounds = component.getBounds$();
        parent.remove$Component(component);
        parent.repaint$int$int$int$int(bounds.x_, bounds.y_, bounds.width_, bounds.height_);
      }
    }
    this.owner = null;
  }
  pack(): void {
    let component = this.getComponent();
    if (component != null) {
      component.setSize$Dimension(component.getPreferredSize$());
    }
  }
  reset(owner: Component, contents: Component, ownerX: number, ownerY: number): void {
    if ((owner instanceof JFrame) || (owner instanceof JDialog) || (owner instanceof JWindow)) {
      owner = (owner).getLayeredPane();
    }
    super.reset(owner, contents, ownerX, ownerY);
    this.x_ = ownerX;
    this.y_ = ownerY;
    this.owner = owner;
  }
  overlappedByOwnedWindow(): boolean {
    let component = this.getComponent();
    if (this.owner != null && component != null) {
      let w = SwingUtilities.getWindowAncestor(this.owner);
      if (w == null) {
        return false;
      }
      let ownedWindows = w.getOwnedWindows();
      if (ownedWindows != null) {
        let bnd = component.getBounds$();
        for (let window of ownedWindows) {
          if (window.isVisible$() && bnd.intersects$Rectangle(window.getBounds$())) {
            return true;
          }
        }
      }
    }
    return false;
  }
  /**
   * Returns true if popup can fit the screen and the owner's top parent.
   * It determines can popup be lightweight or mediumweight.
   */
  fitsOnScreen(): boolean {
    let result = false;
    let component = this.getComponent();
    if (this.owner != null && component != null) {
      let popupWidth = component.getWidth();
      let popupHeight = component.getHeight();
      let parent = SwingUtilities.getRoot(this.owner);
      if (parent instanceof JFrame || parent instanceof JDialog || parent instanceof JWindow) {
        let parentBounds = parent.getBounds$();
        let i = parent.getInsets$();
        parentBounds.x_ = (parentBounds.x_ + i.left) | 0;
        parentBounds.y_ = (parentBounds.y_ + i.top) | 0;
        parentBounds.width_ = (parentBounds.width_ - (i.left + i.right)) | 0;
        parentBounds.height_ = (parentBounds.height_ - (i.top + i.bottom)) | 0;
        if (JPopupMenu.canPopupOverlapTaskBar()) {
          let gc = parent.getGraphicsConfiguration();
          let popupArea = this.getContainerPopupArea(gc);
          result = parentBounds.intersection(popupArea).contains$int$int$int$int(this.x_, this.y_, popupWidth, popupHeight);
        } else {
          result = parentBounds.contains$int$int$int$int(this.x_, this.y_, popupWidth, popupHeight);
        }
      } else if (parent instanceof JApplet) {
        let parentBounds = parent.getBounds$();
        let p = parent.getLocationOnScreen();
        parentBounds.x_ = p.x_;
        parentBounds.y_ = p.y_;
        result = parentBounds.contains$int$int$int$int(this.x_, this.y_, popupWidth, popupHeight);
      }
    }
    return result;
  }
  getContainerPopupArea(gc: GraphicsConfiguration): Rectangle {
    let screenBounds: Rectangle;
    let toolkit = Toolkit.getDefaultToolkit();
    let insets: Insets;
    if (gc != null) {
      screenBounds = gc.getBounds();
      insets = toolkit.getScreenInsets(gc);
    } else {
      screenBounds = new Rectangle()._Rectangle$Dimension(toolkit.getScreenSize());
      insets = new Insets()._Insets(0, 0, 0, 0);
    }
    screenBounds.x_ = (screenBounds.x_ + insets.left) | 0;
    screenBounds.y_ = (screenBounds.y_ + insets.top) | 0;
    screenBounds.width_ = (screenBounds.width_ - (insets.left + insets.right)) | 0;
    screenBounds.height_ = (screenBounds.height_ - (insets.top + insets.bottom)) | 0;
    return screenBounds;
  }
}

/**
 * Popup implementation that is used in headless environment.
 */
export class PopupFactory$HeadlessPopup extends PopupFactory$ContainerPopup {
  _PopupFactory$HeadlessPopup(): this {
    this._PopupFactory$ContainerPopup();
    return this;
  }
  static getHeadlessPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    let popup = new PopupFactory$HeadlessPopup()._PopupFactory$HeadlessPopup();
    popup.reset(owner, contents, ownerX, ownerY);
    return popup;
  }
  createComponent(owner: Component): Component {
    return new Panel()._Panel$LayoutManager(new BorderLayout()._BorderLayout$());
  }
  show(): void {
  }
  hide(): void {
  }
}

/**
 * Popup implementation that uses a JPanel as the popup.
 */
export class PopupFactory$LightWeightPopup extends PopupFactory$ContainerPopup {
  static lightWeightPopupCacheKey: any = null;
  _PopupFactory$LightWeightPopup(): this {
    this._PopupFactory$ContainerPopup();
    return this;
  }
  /**
   * Returns a light weight <code>Popup</code> implementation. If
   * the <code>Popup</code> needs more space that in available in
   * <code>owner</code>, this will return null.
   */
  static getLightWeightPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    let popup = PopupFactory$LightWeightPopup.getRecycledLightWeightPopup();
    if (popup == null) {
      popup = new PopupFactory$LightWeightPopup()._PopupFactory$LightWeightPopup();
    }
    popup.reset(owner, contents, ownerX, ownerY);
    if (!popup.fitsOnScreen() || popup.overlappedByOwnedWindow()) {
      popup.hide();
      return null;
    }
    return popup;
  }
  /**
   * Returns the cache to use for heavy weight popups.
   */
  static getLightWeightPopupCache(): List<PopupFactory$LightWeightPopup> {
    let cache = SwingUtilities.appContextGet(PopupFactory$LightWeightPopup.lightWeightPopupCacheKey);
    if (cache == null) {
      cache = new ArrayList();
      SwingUtilities.appContextPut(PopupFactory$LightWeightPopup.lightWeightPopupCacheKey, cache);
    }
    return cache;
  }
  /**
   * Recycles the LightWeightPopup <code>popup</code>.
   */
  static recycleLightWeightPopup(popup: PopupFactory$LightWeightPopup): void {
    {
      let lightPopupCache = PopupFactory$LightWeightPopup.getLightWeightPopupCache();
      if (lightPopupCache.size() < PopupFactory.MAX_CACHE_SIZE) {
        lightPopupCache.add(popup);
      }
    }
  }
  /**
   * Returns a previously used <code>LightWeightPopup</code>, or null
   * if none of the popups have been recycled.
   */
  static getRecycledLightWeightPopup(): PopupFactory$LightWeightPopup {
    {
      let lightPopupCache = PopupFactory$LightWeightPopup.getLightWeightPopupCache();
      if (lightPopupCache.size() > 0) {
        let r = lightPopupCache.get(0);
        lightPopupCache.removeAt(0);
        return r;
      }
      return null;
    }
  }
  hide(): void {
    super.hide();
    let component = this.getComponent();
    component.removeAll();
    PopupFactory$LightWeightPopup.recycleLightWeightPopup(this);
  }
  show(): void {
    let parent = null;
    if (this.owner != null) {
      parent = (this.owner instanceof Container ? this.owner : this.owner.getParent());
    }
    for (let p = parent; p != null; p = p.getParent()) {
      if (p instanceof JRootPane) {
        if (p.getParent() instanceof JInternalFrame) {
          continue;
        }
        parent = (p).getLayeredPane();
      } else if (p instanceof Window) {
        if (parent == null) {
          parent = p;
        }
        break;
      } else if (p instanceof JApplet) {
        break;
      }
    }
    let p = SwingUtilities.convertScreenLocationToParent(parent, this.x_, this.y_);
    let component = this.getComponent();
    component.setLocation$int$int(p.x_, p.y_);
    if (parent instanceof JLayeredPane) {
      parent.add$Component$Object$int(component, JLayeredPane.POPUP_LAYER, 0);
    } else {
      parent.add$Component(component);
    }
    this.pack();
    component.setVisible(true);
  }
  createComponent(owner: Component): Component {
    return new JPanel()._JPanel$LayoutManager$boolean(new BorderLayout()._BorderLayout$(), true);
  }
  /**
   * Resets the <code>Popup</code> to an initial state.
   */
  reset(owner: Component, contents: Component, ownerX: number, ownerY: number): void {
    super.reset(owner, contents, ownerX, ownerY);
    let component = this.getComponent();
    component.setVisible(false);
    component.setLocation$int$int(ownerX, ownerY);
    component.setOpaque(contents.isOpaque());
    component.add$Component$Object(contents, BorderLayout.CENTER);
    this.pack();
  }
  static $clinit() {
    PopupFactory$LightWeightPopup.lightWeightPopupCacheKey = new StringBuffer('PopupFactory.lightPopupCache');
  }
}

/**
 * Popup implementation that uses a Panel as the popup.
 */
export class PopupFactory$MediumWeightPopup extends PopupFactory$ContainerPopup {
  static mediumWeightPopupCacheKey: any = null;
  /**
   * Child of the panel. The contents are added to this.
   */
  rootPane: JRootPane = null;
  _PopupFactory$MediumWeightPopup(): this {
    this._PopupFactory$ContainerPopup();
    return this;
  }
  /**
   * Returns a medium weight <code>Popup</code> implementation. If
   * the <code>Popup</code> needs more space that in available in
   * <code>owner</code>, this will return null.
   */
  static getMediumWeightPopup(owner: Component, contents: Component, ownerX: number, ownerY: number): Popup {
    let popup = PopupFactory$MediumWeightPopup.getRecycledMediumWeightPopup();
    if (popup == null) {
      popup = new PopupFactory$MediumWeightPopup()._PopupFactory$MediumWeightPopup();
    }
    popup.reset(owner, contents, ownerX, ownerY);
    if (!popup.fitsOnScreen() || popup.overlappedByOwnedWindow()) {
      popup.hide();
      return null;
    }
    return popup;
  }
  /**
   * Returns the cache to use for medium weight popups.
   */
  static getMediumWeightPopupCache(): List<PopupFactory$MediumWeightPopup> {
    let cache = SwingUtilities.appContextGet(PopupFactory$MediumWeightPopup.mediumWeightPopupCacheKey);
    if (cache == null) {
      cache = new ArrayList();
      SwingUtilities.appContextPut(PopupFactory$MediumWeightPopup.mediumWeightPopupCacheKey, cache);
    }
    return cache;
  }
  /**
   * Recycles the MediumWeightPopup <code>popup</code>.
   */
  static recycleMediumWeightPopup(popup: PopupFactory$MediumWeightPopup): void {
    {
      let mediumPopupCache = PopupFactory$MediumWeightPopup.getMediumWeightPopupCache();
      if (mediumPopupCache.size() < PopupFactory.MAX_CACHE_SIZE) {
        mediumPopupCache.add(popup);
      }
    }
  }
  /**
   * Returns a previously used <code>MediumWeightPopup</code>, or null
   * if none of the popups have been recycled.
   */
  static getRecycledMediumWeightPopup(): PopupFactory$MediumWeightPopup {
    {
      let mediumPopupCache = PopupFactory$MediumWeightPopup.getMediumWeightPopupCache();
      if (mediumPopupCache.size() > 0) {
        let r = mediumPopupCache.get(0);
        mediumPopupCache.removeAt(0);
        return r;
      }
      return null;
    }
  }
  hide(): void {
    super.hide();
    this.rootPane.getContentPane().removeAll();
    PopupFactory$MediumWeightPopup.recycleMediumWeightPopup(this);
  }
  show(): void {
    let component = this.getComponent();
    let parent = null;
    if (this.owner != null) {
      parent = this.owner.getParent();
    }
    while (!(parent instanceof Window || $J.isa(parent, Applet)) && (parent != null)) {
      parent = parent.getParent();
    }
    if ($J.isa(parent, RootPaneContainer)) {
      parent = (parent).getLayeredPane();
    }
    let p = SwingUtilities.convertScreenLocationToParent(parent, this.x_, this.y_);
    component.setLocation$int$int(p.x_, p.y_);
    if (parent instanceof JLayeredPane) {
      parent.add$Component$Object$int(component, JLayeredPane.POPUP_LAYER, 0);
    } else {
      parent.add$Component(component);
    }
    this.pack();
    component.setVisible(true);
    component.revalidate();
  }
  createComponent(owner: Component): Component {
    let component = new PopupFactory$MediumWeightPopup$MediumWeightComponent()._PopupFactory$MediumWeightPopup$MediumWeightComponent();
    this.rootPane = new JRootPane()._JRootPane();
    this.rootPane.setOpaque(true);
    component.add$Component$Object(this.rootPane, BorderLayout.CENTER);
    return component;
  }
  /**
   * Resets the <code>Popup</code> to an initial state.
   */
  reset(owner: Component, contents: Component, ownerX: number, ownerY: number): void {
    super.reset(owner, contents, ownerX, ownerY);
    let component = this.getComponent();
    component.setVisible(false);
    component.setLocation$int$int(ownerX, ownerY);
    this.rootPane.getContentPane().add$Component$Object(contents, BorderLayout.CENTER);
    this.pack();
  }
  static $clinit() {
    PopupFactory$MediumWeightPopup.mediumWeightPopupCacheKey = new StringBuffer('PopupFactory.mediumPopupCache');
  }
}

export class PopupFactory$MediumWeightPopup$MediumWeightComponent extends Panel {
  _PopupFactory$MediumWeightPopup$MediumWeightComponent(): this {
    this._Panel$LayoutManager(new BorderLayout()._BorderLayout$());
    return this;
  }
}

let $PopupFactory$1: any = null;
/** An anonymous class (PopupFactory.java:76). */
function PopupFactory$1(): any {
  return $PopupFactory$1 ??= $J.local(class extends JObject {
  }, 'javax.swing.PopupFactory$1', ['sun.swing.SwingAccessor$PopupFactoryAccessor']);
}

let $PopupFactory$HeavyWeightPopup$1: any = null;
/** An anonymous class (PopupFactory.java:492). */
function PopupFactory$HeavyWeightPopup$1(): any {
  return $PopupFactory$HeavyWeightPopup$1 ??= $J.local(class extends WindowAdapter {
    windowClosed(e: WindowEvent): void {
      let popups: List<PopupFactory$HeavyWeightPopup>;
      {
        let heavyPopupCache2 = PopupFactory$HeavyWeightPopup.getHeavyWeightPopupCache();
        popups = heavyPopupCache2.remove(this.$cv_w);
      }
      if (popups != null) {
        for (let counter = (popups.size() - 1) | 0; counter >= 0; counter--) {
          popups.get(counter)._dispose();
        }
      }
    }
    $c($w): this {
      this.$cv_w = $w;
      return this;
    }
  }, 'javax.swing.PopupFactory$HeavyWeightPopup$1', []);
}

$J.define(PopupFactory, 'javax.swing.PopupFactory', { kind: 'class', sup: 'java.lang.Object', ctors: { '': '_PopupFactory' }, meths: { 'getPopup(java.awt.Component,java.awt.Component,int,int,int)': 'getPopup$Component$Component$int$int$int$PopupFactory', 'getPopupType(java.awt.Component,java.awt.Component,int,int)': 'getPopupType$Component$Component$int$int$PopupFactory', 'getPopup(java.awt.Component,java.awt.Component,int,int,boolean)': 'getPopup$Component$Component$int$int$boolean', 'getPopup(java.awt.Component,java.awt.Component,int,int)': 'getPopup$Component$Component$int$int', 'getPopupType()': 'getPopupType$' }, clinit: true, lazy: ['SharedInstanceKey'] });
$J.define(PopupFactory$HeavyWeightPopup, 'javax.swing.PopupFactory$HeavyWeightPopup', { kind: 'class', sup: 'javax.swing.Popup', ctors: { '': '_PopupFactory$HeavyWeightPopup' }, clinit: true, lazy: ['heavyWeightPopupCacheKey'] });
$J.define(PopupFactory$ContainerPopup, 'javax.swing.PopupFactory$ContainerPopup', { kind: 'class', sup: 'javax.swing.Popup', ctors: { '': '_PopupFactory$ContainerPopup' } });
$J.define(PopupFactory$HeadlessPopup, 'javax.swing.PopupFactory$HeadlessPopup', { kind: 'class', sup: 'javax.swing.PopupFactory$ContainerPopup', ctors: { '': '_PopupFactory$HeadlessPopup' } });
$J.define(PopupFactory$LightWeightPopup, 'javax.swing.PopupFactory$LightWeightPopup', { kind: 'class', sup: 'javax.swing.PopupFactory$ContainerPopup', ctors: { '': '_PopupFactory$LightWeightPopup' }, clinit: true, lazy: ['lightWeightPopupCacheKey'] });
$J.define(PopupFactory$MediumWeightPopup, 'javax.swing.PopupFactory$MediumWeightPopup', { kind: 'class', sup: 'javax.swing.PopupFactory$ContainerPopup', ctors: { '': '_PopupFactory$MediumWeightPopup' }, clinit: true, lazy: ['mediumWeightPopupCacheKey'] });
$J.define(PopupFactory$MediumWeightPopup$MediumWeightComponent, 'javax.swing.PopupFactory$MediumWeightPopup$MediumWeightComponent', { kind: 'class', ifaces: ['javax.swing.SwingHeavyWeight'], sup: 'java.awt.Panel', ctors: { '': '_PopupFactory$MediumWeightPopup$MediumWeightComponent' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  Container = $J.load('java.awt.Container');
  GraphicsEnvironment = $J.load('java.awt.GraphicsEnvironment');
  Insets = $J.load('java.awt.Insets');
  Rectangle = $J.load('java.awt.Rectangle');
  Window = $J.load('java.awt.Window');
  WindowAdapter = $J.load('java.awt.event.WindowAdapter');
  ClientPropertyKey = $J.load('javax.swing.ClientPropertyKey');
  JApplet = $J.load('javax.swing.JApplet');
  JComponent = $J.load('javax.swing.JComponent');
  JDialog = $J.load('javax.swing.JDialog');
  JFrame = $J.load('javax.swing.JFrame');
  JInternalFrame = $J.load('javax.swing.JInternalFrame');
  JLayeredPane = $J.load('javax.swing.JLayeredPane');
  JPanel = $J.load('javax.swing.JPanel');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  JRootPane = $J.load('javax.swing.JRootPane');
  JSeparator = $J.load('javax.swing.JSeparator');
  JToolTip = $J.load('javax.swing.JToolTip');
  JWindow = $J.load('javax.swing.JWindow');
  MenuElement = $J.load('javax.swing.MenuElement');
  Popup$DefaultFrame = $J.load('javax.swing.Popup$DefaultFrame');
  Popup$HeavyWeightWindow = $J.load('javax.swing.Popup$HeavyWeightWindow');
  RootPaneContainer = $J.load('javax.swing.RootPaneContainer');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  EmbeddedFrame = $J.load('sun.awt.EmbeddedFrame');
  OSInfo = $J.load('sun.awt.OSInfo');
  OSInfo$OSType = $J.load('sun.awt.OSInfo$OSType');
  SwingAccessor = $J.load('sun.swing.SwingAccessor');
});
