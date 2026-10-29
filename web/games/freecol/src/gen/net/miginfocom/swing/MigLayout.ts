// @ts-nocheck
// MigLayout 5.3 swing/net/miginfocom/swing/MigLayout.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * License (BSD):
 * ==============
 *
 * Copyright (c) 2004, Mikael Grev, MiG InfoCom AB. (miglayout (at) miginfocom (dot) com)
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 * Redistributions of source code must retain the above copyright notice, this list
 * of conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this
 * list of conditions and the following disclaimer in the documentation and/or other
 * materials provided with the distribution.
 * Neither the name of the MiG InfoCom AB nor the names of its contributors may be
 * used to endorse or promote products derived from this software without specific
 * prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND
 * ANY EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED
 * WARRANTIES OF MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED.
 * IN NO EVENT SHALL THE COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT,
 * INDIRECT, INCIDENTAL, SPECIAL, EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING,
 * BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE GOODS OR SERVICES; LOSS OF USE, DATA,
 * OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED AND ON ANY THEORY OF LIABILITY,
 * WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING NEGLIGENCE OR OTHERWISE)
 * ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED OF THE POSSIBILITY
 * OF SUCH DAMAGE.
 *
 * @version 1.0
 * @author Mikael Grev, MiG InfoCom AB
 *         Date: 2006-sep-08
 */
import { $J, ArrayList, Arrays, HashMap, HashSet, IdentityHashMap, IllegalArgumentException, JObject, JString, NullPointerException } from '../../../../jre/index.ts';

let Container, Dimension, Point, Window, BoxLayout, JComponent, JEditorPane, JPopupMenu, JTextArea, OverlayLayout, SwingUtilities, Timer, AC, BoundSize, CC, ConstraintParser, Grid, LC, LayoutUtil, PlatformDefaults, SwingComponentWrapper, SwingContainerWrapper;

/**
 * A very flexible layout manager.
 * <p>
 * Read the documentation that came with this layout manager for information on usage.
 */
export class MigLayout extends JObject {
  /**
   * The component to string constraints mappings.
   */
  scrConstrMap: JMap<Component, any> = null;
  /**
   * Hold the serializable text representation of the constraints.
   */
  layoutConstraints: any = null;
  /**
   * Hold the serializable text representation of the constraints.
   */
  colConstraints: any = null;
  /**
   * Hold the serializable text representation of the constraints.
   */
  rowConstraints: any = null;
  cacheParentW: ContainerWrapper = null;
  ccMap: JMap<ComponentWrapper, CC> = null;
  debugTimer: Timer = null;
  lc: LC = null;
  colSpecs: AC = null;
  rowSpecs: AC = null;
  grid: Grid = null;
  lastModCount: number = 0;
  lastHash: number = 0;
  lastInvalidSize: Dimension = null;
  lastWasInvalid: boolean = false;
  lastParentSize: Dimension = null;
  callbackList: ArrayList<LayoutCallback> = null;
  dirty: boolean = false;
  lastSize: number = 0;
  $init_MigLayout() {
    this.scrConstrMap = new IdentityHashMap(8);
    this.layoutConstraints = '';
    this.colConstraints = '';
    this.rowConstraints = '';
    this.cacheParentW = null;
    this.ccMap = new HashMap(8);
    this.debugTimer = null;
    this.lc = null;
    this.colSpecs = null;
    this.rowSpecs = null;
    this.grid = null;
    this.lastModCount = PlatformDefaults.getModCount();
    this.lastHash = -1;
    this.lastInvalidSize = null;
    this.lastWasInvalid = false;
    this.lastParentSize = null;
    this.callbackList = null;
    this.dirty = true;
    this.lastSize = 0;
  }
  /**
   * Constructor with no constraints.
   */
  _MigLayout$(): this {
    this._MigLayout$String$String$String('', '', '');
    return this;
  }
  /**
   * Constructor.
   * @param layoutConstraints The constraints that concern the whole layout. <code>null</code> will be treated as "".
   */
  _MigLayout$String(layoutConstraints: string): this {
    this._MigLayout$String$String$String(layoutConstraints, '', '');
    return this;
  }
  /**
   * Constructor.
   * @param layoutConstraints The constraints that concern the whole layout. <code>null</code> will be treated as "".
   * @param colConstraints The constraints for the columns in the grid. <code>null</code> will be treated as "".
   */
  _MigLayout$String$String(layoutConstraints: string, colConstraints: string): this {
    this._MigLayout$String$String$String(layoutConstraints, colConstraints, '');
    return this;
  }
  /**
   * Constructor.
   * @param layoutConstraints The constraints that concern the whole layout. <code>null</code> will be treated as "".
   * @param colConstraints The constraints for the columns in the grid. <code>null</code> will be treated as "".
   * @param rowConstraints The constraints for the rows in the grid. <code>null</code> will be treated as "".
   */
  _MigLayout$String$String$String(layoutConstraints: string, colConstraints: string, rowConstraints: string): this {
    this.$init_MigLayout();
    this.setLayoutConstraints(layoutConstraints);
    this.setColumnConstraints(colConstraints);
    this.setRowConstraints(rowConstraints);
    return this;
  }
  /**
   * Constructor.
   * @param layoutConstraints The constraints that concern the whole layout. <code>null</code> will be treated as an empty constraint.
   */
  _MigLayout$LC(layoutConstraints: LC): this {
    this._MigLayout$LC$AC$AC(layoutConstraints, null, null);
    return this;
  }
  /**
   * Constructor.
   * @param layoutConstraints The constraints that concern the whole layout. <code>null</code> will be treated as an empty constraint.
   * @param colConstraints The constraints for the columns in the grid. <code>null</code> will be treated as an empty constraint.
   */
  _MigLayout$LC$AC(layoutConstraints: LC, colConstraints: AC): this {
    this._MigLayout$LC$AC$AC(layoutConstraints, colConstraints, null);
    return this;
  }
  /**
   * Constructor.
   * @param layoutConstraints The constraints that concern the whole layout. <code>null</code> will be treated as an empty constraint.
   * @param colConstraints The constraints for the columns in the grid. <code>null</code> will be treated as an empty constraint.
   * @param rowConstraints The constraints for the rows in the grid. <code>null</code> will be treated as an empty constraint.
   */
  _MigLayout$LC$AC$AC(layoutConstraints: LC, colConstraints: AC, rowConstraints: AC): this {
    this.$init_MigLayout();
    this.setLayoutConstraints(layoutConstraints);
    this.setColumnConstraints(colConstraints);
    this.setRowConstraints(rowConstraints);
    return this;
  }
  /**
   * Returns layout constraints either as a <code>String</code> or {@link net.miginfocom.layout.LC} depending what was sent in
   * to the constructor or set with {@link #setLayoutConstraints(Object)}.
   * @return The layout constraints either as a <code>String</code> or {@link net.miginfocom.layout.LC} depending what was sent in
   * to the constructor or set with {@link #setLayoutConstraints(Object)}. Never <code>null</code>.
   */
  getLayoutConstraints(): any {
    return this.layoutConstraints;
  }
  /**
   * Sets the layout constraints for the layout manager instance as a String.
   * <p>
   * See the class JavaDocs for information on how this string is formatted.
   * @param constr The layout constraints as a String or {@link net.miginfocom.layout.LC} representation. <code>null</code> is converted to <code>""</code> for storage.
   * @throws RuntimeException if the constraint was not valid.
   */
  setLayoutConstraints(constr: any): void {
    if (constr == null || $J.isa(constr, JString)) {
      constr = ConstraintParser.prepare(constr);
      this.lc = ConstraintParser.parseLayoutConstraint(constr);
    } else if (constr instanceof LC) {
      this.lc = constr;
    } else {
      throw new IllegalArgumentException('Illegal constraint type: ' + $J.getClass(constr).toString());
    }
    this.layoutConstraints = constr;
    this.dirty = true;
  }
  /**
   * Returns the column layout constraints either as a <code>String</code> or {@link net.miginfocom.layout.AC}.
   * @return The column constraints either as a <code>String</code> or {@link net.miginfocom.layout.AC} depending what was sent in
   * to the constructor or set with {@link #setColumnConstraints(Object)}. Never <code>null</code>.
   */
  getColumnConstraints(): any {
    return this.colConstraints;
  }
  /**
   * Sets the column layout constraints for the layout manager instance as a String.
   * <p>
   * See the class JavaDocs for information on how this string is formatted.
   * @param constr The column layout constraints as a String or {@link net.miginfocom.layout.AC} representation. <code>null</code> is converted to <code>""</code> for storage.
   * @throws RuntimeException if the constraint was not valid.
   */
  setColumnConstraints(constr: any): void {
    if (constr == null || $J.isa(constr, JString)) {
      constr = ConstraintParser.prepare(constr);
      this.colSpecs = ConstraintParser.parseColumnConstraints(constr);
    } else if (constr instanceof AC) {
      this.colSpecs = constr;
    } else {
      throw new IllegalArgumentException('Illegal constraint type: ' + $J.getClass(constr).toString());
    }
    this.colConstraints = constr;
    this.dirty = true;
  }
  /**
   * Returns the row layout constraints either as a <code>String</code> or {@link net.miginfocom.layout.AC}.
   * @return The row constraints either as a <code>String</code> or {@link net.miginfocom.layout.AC} depending what was sent in
   * to the constructor or set with {@link #setRowConstraints(Object)}. Never <code>null</code>.
   */
  getRowConstraints(): any {
    return this.rowConstraints;
  }
  /**
   * Sets the row layout constraints for the layout manager instance as a String.
   * <p>
   * See the class JavaDocs for information on how this string is formatted.
   * @param constr The row layout constraints as a String or {@link net.miginfocom.layout.AC} representation. <code>null</code> is converted to <code>""</code> for storage.
   * @throws RuntimeException if the constraint was not valid.
   */
  setRowConstraints(constr: any): void {
    if (constr == null || $J.isa(constr, JString)) {
      constr = ConstraintParser.prepare(constr);
      this.rowSpecs = ConstraintParser.parseRowConstraints(constr);
    } else if (constr instanceof AC) {
      this.rowSpecs = constr;
    } else {
      throw new IllegalArgumentException('Illegal constraint type: ' + $J.getClass(constr).toString());
    }
    this.rowConstraints = constr;
    this.dirty = true;
  }
  /**
   * Returns a shallow copy of the constraints map.
   * @return A  shallow copy of the constraints map. Never <code>null</code>.
   */
  getConstraintMap(): JMap<Component, any> {
    return new IdentityHashMap(this.scrConstrMap);
  }
  /**
   * Sets the constraints map.
   * @param map The map. Will be copied.
   */
  setConstraintMap(map: JMap<Component, any>): void {
    this.scrConstrMap.clear();
    this.ccMap.clear();
    for (const $it0 = map.entrySet().iterator(); $it0.hasNext(); ) {
      let e = $it0.next();
      this.setComponentConstraintsImpl(e.getKey(), e.getValue(), true);
    }
  }
  /**
   * Returns the component constraints as a String representation. This string is the exact string as set with {@link #setComponentConstraints(java.awt.Component, Object)}
   * or set when adding the component to the parent component.
   * <p>
   * See the class JavaDocs for information on how this string is formatted.
   * @param comp The component to return the constraints for.
   * @return The component constraints as a String representation or <code>null</code> if the component is not registered
   * with this layout manager. The returned values is either a String or a {@link net.miginfocom.layout.CC}
   * depending on what constraint was sent in when the component was added. May be <code>null</code>.
   */
  getComponentConstraints(comp: Component): any {
    {
      return this.scrConstrMap.get(comp);
    }
  }
  /**
   * Sets the component constraint for the component that already must be handled by this layout manager.
   * <p>
   * See the class JavaDocs for information on how this string is formatted.
   * @param constr The component constraints as a String or {@link net.miginfocom.layout.CC}. <code>null</code> is ok.
   * @param comp The component to set the constraints for.
   * @throws RuntimeException if the constraint was not valid.
   * @throws IllegalArgumentException If the component is not handling the component.
   */
  setComponentConstraints(comp: Component, constr: any): void {
    this.setComponentConstraintsImpl(comp, constr, false);
  }
  /**
   * Sets the component constraint for the component that already must be handled by this layout manager.
   * <p>
   * See the class JavaDocs for information on how this string is formatted.
   * @param constr The component constraints as a String or {@link net.miginfocom.layout.CC}. <code>null</code> is ok.
   * @param comp The component to set the constraints for.
   * @param noCheck Does not check if the component is handled if true
   * @throws RuntimeException if the constraint was not valid.
   * @throws IllegalArgumentException If the component is not handling the component.
   */
  setComponentConstraintsImpl(comp: Component, constr: any, noCheck: boolean): void {
    let parent = comp.getParent();
    {
      if (noCheck === false && this.scrConstrMap.containsKey(comp) === false) {
        throw new IllegalArgumentException('Component must already be added to parent!');
      }
      let cw = new SwingComponentWrapper()._SwingComponentWrapper(comp);
      if (constr == null || $J.isa(constr, JString)) {
        let cStr = ConstraintParser.prepare(constr);
        this.scrConstrMap.put(comp, constr);
        this.ccMap.put(cw, ConstraintParser.parseComponentConstraint(cStr));
      } else if (constr instanceof CC) {
        this.scrConstrMap.put(comp, constr);
        this.ccMap.put(cw, constr);
      } else {
        throw new IllegalArgumentException('Constraint must be String or ComponentConstraint: ' + $J.getClass(constr).toString());
      }
      this.dirty = true;
    }
  }
  /**
   * Returns if this layout manager is currently managing this component.
   * @param c The component to check. If <code>null</code> then <code>false</code> will be returned.
   * @return If this layout manager is currently managing this component.
   */
  isManagingComponent(c: Component): boolean {
    return this.scrConstrMap.containsKey(c);
  }
  /**
   * Adds the callback function that will be called at different stages of the layout cycle.
   * @param callback The callback. Not <code>null</code>.
   */
  addLayoutCallback(callback: LayoutCallback): void {
    if (callback == null) {
      throw new NullPointerException();
    }
    if (this.callbackList == null) {
      this.callbackList = new ArrayList(1);
    }
    this.callbackList.add(callback);
    this.grid = null;
  }
  /**
   * Removes the callback if it exists.
   * @param callback The callback. May be <code>null</code>.
   */
  removeLayoutCallback(callback: LayoutCallback): void {
    if (this.callbackList != null) {
      this.callbackList.remove(callback);
    }
  }
  /**
   * Sets the debugging state for this layout manager instance. If debug is turned on a timer will repaint the last laid out parent
   * with debug information on top.
   * <p>
   * Red fill and dashed red outline is used to indicate occupied cells in the grid. Blue dashed outline indicate
   * component bounds set.
   * <p>
   * Note that debug can also be set on the layout constraints. There it will be persisted. The value set here will not. See the class
   * JavaDocs for information.
   * @param parentW The parent to set debug for.
   * @param b <code>true</code> means debug is turned on.
   */
  setDebug(parentW: ComponentWrapper, b: boolean): void {
    if (b && (this.debugTimer == null || this.debugTimer.getDelay() !== this.getDebugMillis())) {
      if (this.debugTimer != null) {
        this.debugTimer.stop();
      }
      let pCW = parentW.getParent();
      let parent = pCW != null ? pCW.getComponent() : null;
      this.debugTimer = new Timer()._Timer(this.getDebugMillis(), $J.fn(new MigLayout$MyDebugRepaintListener().$o(this)._MigLayout$MyDebugRepaintListener(), 'actionPerformed'));
      if (parent != null) {
        SwingUtilities.invokeLater(() => {
          let p = parent.getParent();
          if (p != null) {
            if (p instanceof JComponent) {
              (p).revalidate();
            } else {
              parent.invalidate();
              p.validate();
            }
          }
        });
      }
      this.debugTimer.setInitialDelay(100);
      this.debugTimer.start();
    } else if (!b && this.debugTimer != null) {
      this.debugTimer.stop();
      this.debugTimer = null;
    }
  }
  /**
   * Returns the current debugging state.
   * @return The current debugging state.
   */
  getDebug(): boolean {
    return this.debugTimer != null;
  }
  /**
   * Returns the debug millis. Combines the value from {@link net.miginfocom.layout.LC#getDebugMillis()} and {@link net.miginfocom.layout.LayoutUtil#getGlobalDebugMillis()}
   * @return The combined value.
   */
  getDebugMillis(): number {
    let globalDebugMillis = LayoutUtil.getGlobalDebugMillis();
    return globalDebugMillis > 0 ? globalDebugMillis : this.lc.getDebugMillis();
  }
  /**
   * Check if something has changed and if so recreate it to the cached objects.
   * @param parent The parent that is the target for this layout manager.
   */
  checkCache(parent: Container): void {
    if (parent == null) {
      return;
    }
    if (this.dirty) {
      this.grid = null;
    }
    this.cleanConstraintMaps(parent);
    let mc = PlatformDefaults.getModCount();
    if (this.lastModCount !== mc) {
      this.grid = null;
      this.lastModCount = mc;
    }
    if (!parent.isValid()) {
      if (!this.lastWasInvalid) {
        this.lastWasInvalid = true;
        let hash = 0;
        let resetLastInvalidOnParent = false;
        for (const $it1 = this.ccMap.keySet().iterator(); $it1.hasNext(); ) {
          let wrapper = $it1.next();
          let component = wrapper.getComponent();
          if (component instanceof JTextArea || component instanceof JEditorPane) {
            resetLastInvalidOnParent = true;
          }
          hash ^= wrapper.getLayoutHashCode();
          hash = (hash + 285134905) | 0;
        }
        if (resetLastInvalidOnParent) {
          this.resetLastInvalidOnParent(parent);
        }
        if (hash !== this.lastHash) {
          this.grid = null;
          this.lastHash = hash;
        }
        let ps = parent.getSize$();
        if (this.lastInvalidSize == null || !this.lastInvalidSize.equals(ps)) {
          this.grid = null;
          this.lastInvalidSize = ps;
        }
      }
    } else {
      this.lastWasInvalid = false;
    }
    let par = this.checkParent(parent);
    this.setDebug(par, this.getDebugMillis() > 0);
    if (this.grid == null) {
      this.grid = new Grid()._Grid(par, this.lc, this.rowSpecs, this.colSpecs, this.ccMap, this.callbackList);
    }
    this.dirty = false;
  }
  /**
   * Checks so all components in ccMap actually exist in the parent's collection. Removes
   * any references that don't.
   * @param parent The parent to compare ccMap against. Never null.
   */
  cleanConstraintMaps(parent: Container): void {
    let parentCompSet = new HashSet(Arrays.asList(...parent.getComponents()));
    let it = this.ccMap.entrySet().iterator();
    while (it.hasNext()) {
      let c = it.next().getKey().getComponent();
      if (parentCompSet.contains(c) === false) {
        it.remove();
        this.scrConstrMap.remove(c);
      }
    }
  }
  /**
   * @since 3.7.3
   */
  resetLastInvalidOnParent(parent: Container): void {
    while (parent != null) {
      let layoutManager = parent.getLayout();
      if (layoutManager instanceof MigLayout) {
        (layoutManager).lastWasInvalid = false;
      }
      parent = parent.getParent();
    }
  }
  checkParent(parent: Container): ContainerWrapper {
    if (parent == null) {
      return null;
    }
    if (this.cacheParentW == null || this.cacheParentW.getComponent() !== parent) {
      this.cacheParentW = new SwingContainerWrapper()._SwingContainerWrapper(parent);
    }
    return this.cacheParentW;
  }
  layoutContainer$Container(parent: Container): void {
    {
      this.checkCache(parent);
      let i = parent.getInsets$();
      let b = [i.left, i.top, (parent.getWidth() - i.left - i.right) | 0, (parent.getHeight() - i.top - i.bottom) | 0];
      if (this.grid.layout$intArr$UnitValue$UnitValue$boolean(b, this.lc.getAlignX(), this.lc.getAlignY(), this.getDebug())) {
        this.grid = null;
        this.checkCache(parent);
        this.grid.layout$intArr$UnitValue$UnitValue$boolean(b, this.lc.getAlignX(), this.lc.getAlignY(), this.getDebug());
      }
      let newSize = this.grid.getHeight$()[1] + ($J.lshl((this.grid.getWidth$()[1]), 32));
      if (this.lastSize !== newSize) {
        this.lastSize = newSize;
        let containerWrapper = this.checkParent(parent);
        let win = (SwingUtilities.getAncestorOfClass($J.cls(Window), containerWrapper.getComponent()));
        if (win != null) {
          if (win.isVisible$()) {
            SwingUtilities.invokeLater(() => {
              this.adjustWindowSize(containerWrapper);
            });
          } else {
            this.adjustWindowSize(containerWrapper);
          }
        }
      }
      this.lastInvalidSize = null;
    }
  }
  /**
   * Checks the parent window/popup if its size is within parameters as set by the LC.
   * @param parent The parent who's window to possibly adjust the size for.
   */
  adjustWindowSize(parent: ContainerWrapper): void {
    let wBounds = this.lc.getPackWidth();
    let hBounds = this.lc.getPackHeight();
    if (wBounds === BoundSize.NULL_SIZE && hBounds === BoundSize.NULL_SIZE) {
      return;
    }
    let packable = this.getPackable(parent.getComponent());
    if (packable != null) {
      let pc = parent.getComponent();
      let c = pc instanceof Container ? pc : pc.getParent();
      for (; c != null; c = c.getParent()) {
        let layout = c.getLayout();
        if (layout instanceof BoxLayout || layout instanceof OverlayLayout) {
          (layout).invalidateLayout(c);
        }
      }
      let prefSize = packable.getPreferredSize$();
      let targW = this.constrain(this.checkParent(packable), packable.getWidth(), prefSize.width_, wBounds);
      let targH = this.constrain(this.checkParent(packable), packable.getHeight(), prefSize.height_, hBounds);
      let p = packable.isShowing() ? packable.getLocationOnScreen() : packable.getLocation$();
      let x = $J.roundf(Math.fround(p.x_ - (Math.fround(((targW - packable.getWidth()) | 0) * (Math.fround(1 - this.lc.getPackWidthAlign()))))));
      let y = $J.roundf(Math.fround(p.y_ - (Math.fround(((targH - packable.getHeight()) | 0) * (Math.fround(1 - this.lc.getPackHeightAlign()))))));
      if (packable instanceof JPopupMenu) {
        let popupMenu = packable;
        popupMenu.setVisible(false);
        popupMenu.setPopupSize$int$int(targW, targH);
        let invoker = popupMenu.getInvoker();
        let popPoint = new Point()._Point$int$int(x, y);
        SwingUtilities.convertPointFromScreen(popPoint, invoker);
        (packable).show$Component$int$int(invoker, popPoint.x_, popPoint.y_);
        packable.setPreferredSize(null);
      } else {
        packable.setBounds$int$int$int$int(x, y, targW, targH);
      }
    }
  }
  /**
   * Returns a high level window or popup to pack, if any.
   * @return May be null.
   */
  getPackable(comp: Component): Container {
    let popup = MigLayout.findType($J.cls(JPopupMenu), comp);
    if (popup != null) {
      let popupComp = popup;
      while (popupComp != null) {
        if (popupComp.getClass().getName().includes('HeavyWeightWindow')) {
          return popupComp;
        }
        popupComp = popupComp.getParent();
      }
      return popup;
    }
    return MigLayout.findType($J.cls(Window), comp);
  }
  static findType<E>(clazz: JClass<E>, comp: Component): E {
    while (comp != null && !clazz.isInstance(comp)) {
      comp = comp.getParent();
    }
    return comp;
  }
  constrain(parent: ContainerWrapper, winSize: number, prefSize: number, constrain: BoundSize): number {
    if (constrain == null) {
      return winSize;
    }
    let retSize = winSize;
    let wUV = constrain.getPreferred();
    if (wUV != null) {
      retSize = wUV.getPixels(Math.fround(prefSize), parent, parent);
    }
    retSize = constrain.constrain(retSize, Math.fround(prefSize), parent);
    return constrain.getGapPush() ? Math.max(winSize, retSize) : retSize;
  }
  minimumLayoutSize(parent: Container): Dimension {
    {
      return this.getSizeImpl(parent, LayoutUtil.MIN);
    }
  }
  preferredLayoutSize(parent: Container): Dimension {
    {
      if (this.lastParentSize == null || !parent.getSize$().equals(this.lastParentSize)) {
        for (const $it2 = this.ccMap.keySet().iterator(); $it2.hasNext(); ) {
          let wrapper = $it2.next();
          if (wrapper.getContentBias() !== -1) {
            this.layoutContainer$Container(parent);
            break;
          }
        }
      }
      this.lastParentSize = parent.getSize$();
      return this.getSizeImpl(parent, LayoutUtil.PREF);
    }
  }
  maximumLayoutSize(parent: Container): Dimension {
    return new Dimension()._Dimension$int$int(2147483647, 2147483647);
  }
  getSizeImpl(parent: Container, sizeType: number): Dimension {
    this.checkCache(parent);
    let i = parent.getInsets$();
    let w = (LayoutUtil.getSizeSafe(this.grid != null ? this.grid.getWidth$() : null, sizeType) + i.left + i.right) | 0;
    let h = (LayoutUtil.getSizeSafe(this.grid != null ? this.grid.getHeight$() : null, sizeType) + i.top + i.bottom) | 0;
    return new Dimension()._Dimension$int$int(w, h);
  }
  getLayoutAlignmentX(parent: Container): number {
    return Math.fround(this.lc != null && this.lc.getAlignX() != null ? this.lc.getAlignX().getPixels(1, this.checkParent(parent), null) : 0);
  }
  getLayoutAlignmentY(parent: Container): number {
    return Math.fround(this.lc != null && this.lc.getAlignY() != null ? this.lc.getAlignY().getPixels(1, this.checkParent(parent), null) : 0);
  }
  addLayoutComponent$String$Component(s: string, comp: Component): void {
    this.addLayoutComponent$Component$Object(comp, s);
  }
  addLayoutComponent$Component$Object(comp: Component, constraints: any): void {
    {
      this.setComponentConstraintsImpl(comp, constraints, true);
    }
  }
  removeLayoutComponent(comp: Component): void {
    {
      this.scrConstrMap.remove(comp);
      this.ccMap.remove(new SwingComponentWrapper()._SwingComponentWrapper(comp));
      this.grid = null;
    }
  }
  invalidateLayout(target: Container): void {
    this.dirty = true;
  }
  readResolve(): any {
    return LayoutUtil.getSerializedObject(this);
  }
  readExternal(in$: ObjectInput): void {
    LayoutUtil.setSerializedObject(this, LayoutUtil.readAsXML(in$));
  }
  writeExternal(out: ObjectOutput): void {
    if ($J.getClass(this) === $J.cls(MigLayout)) {
      LayoutUtil.writeAsXML(out, this);
    }
  }
}

export class MigLayout$MyDebugRepaintListener extends JObject {
  _MigLayout$MyDebugRepaintListener(): this {
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    if (this.$outer.grid != null) {
      let comp = this.$outer.grid.getContainer().getComponent();
      if (comp.isShowing()) {
        this.$outer.grid.paintDebug();
        return;
      }
    }
    this.$outer.debugTimer.stop();
    this.$outer.debugTimer = null;
  }
}

$J.define(MigLayout, 'net.miginfocom.swing.MigLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager2', 'java.io.Externalizable'], sup: 'java.lang.Object', ctors: { 'net.miginfocom.layout.LC,net.miginfocom.layout.AC,net.miginfocom.layout.AC': '_MigLayout$LC$AC$AC', 'net.miginfocom.layout.LC,net.miginfocom.layout.AC': '_MigLayout$LC$AC', 'net.miginfocom.layout.LC': '_MigLayout$LC', 'java.lang.String,java.lang.String,java.lang.String': '_MigLayout$String$String$String', 'java.lang.String,java.lang.String': '_MigLayout$String$String', 'java.lang.String': '_MigLayout$String', '': '_MigLayout$' }, meths: { 'addLayoutComponent(java.awt.Component,java.lang.Object)': 'addLayoutComponent$Component$Object', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component', 'layoutContainer(java.awt.Container)': 'layoutContainer$Container' } });
$J.define(MigLayout$MyDebugRepaintListener, 'net.miginfocom.swing.MigLayout$MyDebugRepaintListener', { kind: 'class', ifaces: ['java.awt.event.ActionListener'], sup: 'java.lang.Object', ctors: { '': '_MigLayout$MyDebugRepaintListener' }, inner: true });
$J.module(() => {
  Container = $J.load('java.awt.Container');
  Dimension = $J.load('java.awt.Dimension');
  Point = $J.load('java.awt.Point');
  Window = $J.load('java.awt.Window');
  BoxLayout = $J.load('javax.swing.BoxLayout');
  JComponent = $J.load('javax.swing.JComponent');
  JEditorPane = $J.load('javax.swing.JEditorPane');
  JPopupMenu = $J.load('javax.swing.JPopupMenu');
  JTextArea = $J.load('javax.swing.JTextArea');
  OverlayLayout = $J.load('javax.swing.OverlayLayout');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  Timer = $J.load('javax.swing.Timer');
  AC = $J.load('net.miginfocom.layout.AC');
  BoundSize = $J.load('net.miginfocom.layout.BoundSize');
  CC = $J.load('net.miginfocom.layout.CC');
  ConstraintParser = $J.load('net.miginfocom.layout.ConstraintParser');
  Grid = $J.load('net.miginfocom.layout.Grid');
  LC = $J.load('net.miginfocom.layout.LC');
  LayoutUtil = $J.load('net.miginfocom.layout.LayoutUtil');
  PlatformDefaults = $J.load('net.miginfocom.layout.PlatformDefaults');
  SwingComponentWrapper = $J.load('net.miginfocom.swing.SwingComponentWrapper');
  SwingContainerWrapper = $J.load('net.miginfocom.swing.SwingContainerWrapper');
});
