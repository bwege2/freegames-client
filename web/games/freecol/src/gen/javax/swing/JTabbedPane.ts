// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/JTabbedPane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 1997, 2024, Oracle and/or its affiliates. All rights reserved.
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
import { $J, ArrayList, IllegalArgumentException, IndexOutOfBoundsException, JObject, JString } from '../../../jre/index.ts';
import { JComponent } from './JComponent.ts';
import { JComponent$AccessibleJComponent } from './JComponent.ts';
import { AccessibleContext } from '../accessibility/AccessibleContext.ts';

let Accessible, AccessibleState, DefaultSingleSelectionModel, Icon, SwingConstants, SwingUtilities, ToolTipManager, UIManager, ChangeEvent, ChangeListener, UIResource, SwingUtilities2;

/**
 * A component that lets the user switch between a group of components by
 * clicking on a tab with a given title and/or icon.
 * For examples and information on using tabbed panes see
 * <a href="https://docs.oracle.com/javase/tutorial/uiswing/components/tabbedpane.html">How to Use Tabbed Panes</a>,
 * a section in <em>The Java Tutorial</em>.
 * <p>
 * Tabs/components are added to a <code>TabbedPane</code> object by using the
 * <code>addTab</code> and <code>insertTab</code> methods.
 * A tab is represented by an index corresponding
 * to the position it was added in, where the first tab has an index equal to 0
 * and the last tab has an index equal to the tab count minus 1.
 * <p>
 * The <code>TabbedPane</code> uses a <code>SingleSelectionModel</code>
 * to represent the set
 * of tab indices and the currently selected index.  If the tab count
 * is greater than 0, then there will always be a selected index, which
 * by default will be initialized to the first tab.  If the tab count is
 * 0, then the selected index will be -1.
 * <p>
 * The tab title can be rendered by a <code>Component</code>.
 * For example, the following produce similar results:
 * <pre>
 * // In this case the look and feel renders the title for the tab.
 * tabbedPane.addTab("Tab", myComponent);
 * // In this case the custom component is responsible for rendering the
 * // title of the tab.
 * tabbedPane.addTab(null, myComponent);
 * tabbedPane.setTabComponentAt(0, new JLabel("Tab"));
 * </pre>
 * The latter is typically used when you want a more complex user interaction
 * that requires custom components on the tab.  For example, you could
 * provide a custom component that animates or one that has widgets for
 * closing the tab.
 * <p>
 * If you specify a component for a tab, the <code>JTabbedPane</code>
 * will not render any text or icon you have specified for the tab.
 * <p>
 * <strong>Note:</strong>
 * Do not use <code>setVisible</code> directly on a tab component to make it visible,
 * use <code>setSelectedComponent</code> or <code>setSelectedIndex</code> methods instead.
 * <p>
 * <strong>Warning:</strong> Swing is not thread safe. For more
 * information see <a
 * href="package-summary.html#threading">Swing's Threading
 * Policy</a>.
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
 * @author Dave Moore
 * @author Philip Milne
 * @author Amy Fowler
 *
 * @see SingleSelectionModel
 * @since 1.2
 */
export class JTabbedPane extends JComponent {
  /**
   * The tab layout policy for wrapping tabs in multiple runs when all
   * tabs will not fit within a single run.
   */
  static readonly WRAP_TAB_LAYOUT: number = 0;
  /**
   * Tab layout policy for providing a subset of available tabs when all
   * the tabs will not fit within a single run.  If all the tabs do
   * not fit within a single run the look and feel will provide a way
   * to navigate to hidden tabs.
   */
  static readonly SCROLL_TAB_LAYOUT: number = 1;
  /**
   * @see #getUIClassID
   * @see #readObject
   */
  static readonly uiClassID: string = 'TabbedPaneUI';
  /**
   * Where the tabs are placed.
   * @see #setTabPlacement
   */
  tabPlacement: number = 0;
  tabLayoutPolicy: number = 0;
  /**
   * The default selection model
   */
  model: SingleSelectionModel = null;
  haveRegistered: boolean = false;
  /**
   * The <code>changeListener</code> is the listener we add to the
   * model.
   */
  changeListener: ChangeListener = null;
  pages: List<JTabbedPane$Page> = null;
  visComp: Component = null;
  /**
   * Only one <code>ChangeEvent</code> is needed per <code>TabPane</code>
   * instance since the
   * event's only (read-only) state is the source property.  The source
   * of events generated here is always "this".
   */
  changeEvent: ChangeEvent = null;
  $init_JTabbedPane() {
    this.tabPlacement = SwingConstants.TOP;
    this.changeListener = null;
    this.visComp = null;
    this.changeEvent = null;
  }
  /**
   * Creates an empty <code>TabbedPane</code> with a default
   * tab placement of <code>JTabbedPane.TOP</code>.
   * @see #addTab
   */
  _JTabbedPane$(): this {
    this._JTabbedPane$int$int(SwingConstants.TOP, JTabbedPane.WRAP_TAB_LAYOUT);
    return this;
  }
  /**
   * Creates an empty <code>TabbedPane</code> with the specified tab placement
   * of either: <code>JTabbedPane.TOP</code>, <code>JTabbedPane.BOTTOM</code>,
   * <code>JTabbedPane.LEFT</code>, or <code>JTabbedPane.RIGHT</code>.
   *
   * @param tabPlacement the placement for the tabs relative to the content
   * @see #addTab
   */
  _JTabbedPane$int(tabPlacement: number): this {
    this._JTabbedPane$int$int(tabPlacement, JTabbedPane.WRAP_TAB_LAYOUT);
    return this;
  }
  /**
   * Creates an empty <code>TabbedPane</code> with the specified tab placement
   * and tab layout policy.  Tab placement may be either:
   * <code>JTabbedPane.TOP</code>, <code>JTabbedPane.BOTTOM</code>,
   * <code>JTabbedPane.LEFT</code>, or <code>JTabbedPane.RIGHT</code>.
   * Tab layout policy may be either: <code>JTabbedPane.WRAP_TAB_LAYOUT</code>
   * or <code>JTabbedPane.SCROLL_TAB_LAYOUT</code>.
   *
   * @param tabPlacement the placement for the tabs relative to the content
   * @param tabLayoutPolicy the policy for laying out tabs when all tabs will not fit on one run
   * @throws IllegalArgumentException if tab placement or tab layout policy are not
   *            one of the above supported values
   * @see #addTab
   * @since 1.4
   */
  _JTabbedPane$int$int(tabPlacement: number, tabLayoutPolicy: number): this {
    this._JComponent();
    this.$init_JTabbedPane();
    this.setTabPlacement(tabPlacement);
    this.setTabLayoutPolicy(tabLayoutPolicy);
    this.pages = new ArrayList(1);
    this.setModel(new DefaultSingleSelectionModel()._DefaultSingleSelectionModel());
    this.updateUI();
    return this;
  }
  /**
   * Returns the UI object which implements the L&amp;F for this component.
   *
   * @return a <code>TabbedPaneUI</code> object
   * @see #setUI
   */
  getUI(): TabbedPaneUI {
    return this.ui;
  }
  /**
   * Sets the UI object which implements the L&amp;F for this component.
   *
   * @param ui the new UI object
   * @see UIDefaults#getUI
   */
  setUI$TabbedPaneUI(ui: TabbedPaneUI): void {
    super.setUI$ComponentUI(ui);
    for (let i = 0; i < this.getTabCount(); i++) {
      let icon = this.pages.get(i).disabledIcon;
      if ($J.isa(icon, UIResource)) {
        this.setDisabledIconAt(i, null);
      }
    }
  }
  /**
   * Resets the UI property to a value from the current look and feel.
   *
   * @see JComponent#updateUI
   */
  updateUI(): void {
    this.setUI$TabbedPaneUI(UIManager.getUI(this));
  }
  /**
   * Returns the name of the UI class that implements the
   * L&amp;F for this component.
   *
   * @return the string "TabbedPaneUI"
   * @see JComponent#getUIClassID
   * @see UIDefaults#getUI
   */
  getUIClassID(): string {
    return JTabbedPane.uiClassID;
  }
  /**
   * Subclasses that want to handle <code>ChangeEvents</code> differently
   * can override this to return a subclass of <code>ModelListener</code> or
   * another <code>ChangeListener</code> implementation.
   *
   * @return a {@code ChangeListener}
   * @see #fireStateChanged
   */
  createChangeListener(): ChangeListener {
    return $J.fn(new JTabbedPane$ModelListener().$o(this)._JTabbedPane$ModelListener(), 'stateChanged');
  }
  /**
   * Adds a <code>ChangeListener</code> to this tabbedpane.
   *
   * @param l the <code>ChangeListener</code> to add
   * @see #fireStateChanged
   * @see #removeChangeListener
   */
  addChangeListener(l: ChangeListener): void {
    this.listenerList.add($J.cls(ChangeListener), l);
  }
  /**
   * Removes a <code>ChangeListener</code> from this tabbedpane.
   *
   * @param l the <code>ChangeListener</code> to remove
   * @see #fireStateChanged
   * @see #addChangeListener
   */
  removeChangeListener(l: ChangeListener): void {
    this.listenerList.remove($J.cls(ChangeListener), l);
  }
  /**
   * Sends a {@code ChangeEvent}, with this {@code JTabbedPane} as the source,
   * to each registered listener. This method is called each time there is
   * a change to either the selected index or the selected tab in the
   * {@code JTabbedPane}. Usually, the selected index and selected tab change
   * together. However, there are some cases, such as tab addition, where the
   * selected index changes and the same tab remains selected. There are other
   * cases, such as deleting the selected tab, where the index remains the
   * same, but a new tab moves to that index. Events are fired for all of
   * these cases.
   *
   * @see #addChangeListener
   * @see javax.swing.event.EventListenerList
   */
  fireStateChanged(): void {
    let selIndex = this.getSelectedIndex();
    if (selIndex < 0) {
      if (this.visComp != null && this.visComp.isVisible$()) {
        this.visComp.setVisible(false);
      }
      this.visComp = null;
    } else {
      let newComp = this.getComponentAt$int(selIndex);
      if (newComp != null && newComp !== this.visComp) {
        let shouldChangeFocus = false;
        if (this.visComp != null) {
          shouldChangeFocus = (SwingUtilities.findFocusOwner(this.visComp) != null);
          if (this.visComp.isVisible$()) {
            this.visComp.setVisible(false);
          }
        }
        if (!newComp.isVisible$()) {
          newComp.setVisible(true);
        }
        if (shouldChangeFocus) {
          SwingUtilities2.tabbedPaneChangeFocusTo(newComp);
        }
        this.visComp = newComp;
      }
    }
    let listeners = this.listenerList.getListenerList();
    for (let i = (listeners.length - 2) | 0; i >= 0; i = (i - 2) | 0) {
      if (listeners[i] === $J.cls(ChangeListener)) {
        if (this.changeEvent == null) {
          this.changeEvent = new ChangeEvent()._ChangeEvent(this);
        }
        $J.fn((listeners[(i + 1) | 0]), 'stateChanged')(this.changeEvent);
      }
    }
  }
  /**
   * Returns the model associated with this tabbedpane.
   *
   * @return the {@code SingleSelectionModel} associated with this tabbedpane
   * @see #setModel
   */
  getModel(): SingleSelectionModel {
    return this.model;
  }
  /**
   * Sets the model to be used with this tabbedpane.
   *
   * @param model the model to be used
   * @see #getModel
   */
  setModel(model: SingleSelectionModel): void {
    let oldModel = this.getModel();
    if (oldModel != null) {
      oldModel.removeChangeListener(this.changeListener);
      this.changeListener = null;
    }
    this.model = model;
    if (model != null) {
      this.changeListener = this.createChangeListener();
      model.addChangeListener(this.changeListener);
    }
    this.firePropertyChange$String$Object$Object('model', oldModel, model);
    this.repaint$();
  }
  /**
   * Returns the placement of the tabs for this tabbedpane.
   *
   * @return an {@code int} specifying the placement for the tabs
   * @see #setTabPlacement
   */
  getTabPlacement(): number {
    return this.tabPlacement;
  }
  /**
   * Sets the tab placement for this tabbedpane.
   * Possible values are:<ul>
   * <li><code>JTabbedPane.TOP</code>
   * <li><code>JTabbedPane.BOTTOM</code>
   * <li><code>JTabbedPane.LEFT</code>
   * <li><code>JTabbedPane.RIGHT</code>
   * </ul>
   * The default value, if not set, is <code>SwingConstants.TOP</code>.
   *
   * @param tabPlacement the placement for the tabs relative to the content
   * @throws IllegalArgumentException if tab placement value isn't one
   *                          of the above valid values
   */
  setTabPlacement(tabPlacement: number): void {
    JTabbedPane.checkTabPlacement(tabPlacement);
    if (this.tabPlacement !== tabPlacement) {
      let oldValue = this.tabPlacement;
      this.tabPlacement = tabPlacement;
      this.firePropertyChange$String$int$int('tabPlacement', oldValue, tabPlacement);
      this.revalidate();
      this.repaint$();
    }
  }
  static checkTabPlacement(tabPlacement: number): void {
    if (tabPlacement !== SwingConstants.TOP && tabPlacement !== SwingConstants.LEFT && tabPlacement !== SwingConstants.BOTTOM && tabPlacement !== SwingConstants.RIGHT) {
      throw new IllegalArgumentException('illegal tab placement: must be TOP, BOTTOM, LEFT, or RIGHT');
    }
  }
  /**
   * Returns the policy used by the tabbedpane to layout the tabs when all the
   * tabs will not fit within a single run.
   *
   * @return an {@code int} specifying the policy used to layout the tabs
   * @see #setTabLayoutPolicy
   * @since 1.4
   */
  getTabLayoutPolicy(): number {
    return this.tabLayoutPolicy;
  }
  /**
   * Sets the policy which the tabbedpane will use in laying out the tabs
   * when all the tabs will not fit within a single run.
   * Possible values are:
   * <ul>
   * <li><code>JTabbedPane.WRAP_TAB_LAYOUT</code>
   * <li><code>JTabbedPane.SCROLL_TAB_LAYOUT</code>
   * </ul>
   *
   * The default value, if not set by the UI, is <code>JTabbedPane.WRAP_TAB_LAYOUT</code>.
   * <p>
   * Some look and feels might only support a subset of the possible
   * layout policies, in which case the value of this property may be
   * ignored.
   *
   * @param tabLayoutPolicy the policy used to layout the tabs
   * @throws IllegalArgumentException if layoutPolicy value isn't one
   *                          of the above valid values
   * @see #getTabLayoutPolicy
   * @since 1.4
   */
  setTabLayoutPolicy(tabLayoutPolicy: number): void {
    JTabbedPane.checkTabLayoutPolicy(tabLayoutPolicy);
    if (this.tabLayoutPolicy !== tabLayoutPolicy) {
      let oldValue = this.tabLayoutPolicy;
      this.tabLayoutPolicy = tabLayoutPolicy;
      this.firePropertyChange$String$int$int('tabLayoutPolicy', oldValue, tabLayoutPolicy);
      this.revalidate();
      this.repaint$();
    }
  }
  static checkTabLayoutPolicy(tabLayoutPolicy: number): void {
    if (tabLayoutPolicy !== JTabbedPane.WRAP_TAB_LAYOUT && tabLayoutPolicy !== JTabbedPane.SCROLL_TAB_LAYOUT) {
      throw new IllegalArgumentException('illegal tab layout policy: must be WRAP_TAB_LAYOUT or SCROLL_TAB_LAYOUT');
    }
  }
  /**
   * Returns the currently selected index for this tabbedpane.
   * Returns -1 if there is no currently selected tab.
   *
   * @return the index of the selected tab
   * @see #setSelectedIndex
   */
  getSelectedIndex(): number {
    return this.model.getSelectedIndex();
  }
  /**
   * Sets the selected index for this tabbedpane. The index must be
   * a valid tab index or -1, which indicates that no tab should be selected
   * (can also be used when there are no tabs in the tabbedpane).  If a -1
   * value is specified when the tabbedpane contains one or more tabs, then
   * the results will be implementation defined.
   *
   * @param index  the index to be selected
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < -1 || index >= tab count)}
   *
   * @see #getSelectedIndex
   * @see SingleSelectionModel#setSelectedIndex
   */
  setSelectedIndex(index: number): void {
    if (index !== -1) {
      this.checkIndex(index);
    }
    this.setSelectedIndexImpl(index, true);
  }
  setSelectedIndexImpl(index: number, doAccessibleChanges: boolean): void {
    let oldIndex = this.model.getSelectedIndex();
    let oldPage = null;
    let newPage = null;
    let oldName = null;
    doAccessibleChanges = doAccessibleChanges && (oldIndex !== index);
    if (doAccessibleChanges) {
      if (this.accessibleContext != null) {
        oldName = this.accessibleContext.getAccessibleName();
      }
      if (oldIndex >= 0) {
        oldPage = this.pages.get(oldIndex);
      }
      if (index >= 0) {
        newPage = this.pages.get(index);
      }
    }
    this.model.setSelectedIndex(index);
    if (doAccessibleChanges) {
      this.changeAccessibleSelection(oldPage, oldName, newPage);
    }
  }
  changeAccessibleSelection(oldPage: JTabbedPane$Page, oldName: string, newPage: JTabbedPane$Page): void {
    if (this.accessibleContext == null) {
      return;
    }
    if (oldPage != null) {
      oldPage.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.SELECTED, null);
    }
    if (newPage != null) {
      newPage.firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, null, AccessibleState.SELECTED);
    }
    this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, oldName, this.accessibleContext.getAccessibleName());
  }
  /**
   * Returns the currently selected component for this tabbedpane.
   * Returns <code>null</code> if there is no currently selected tab.
   *
   * @return the component corresponding to the selected tab
   * @see #setSelectedComponent
   */
  getSelectedComponent(): Component {
    let index = this.getSelectedIndex();
    if (index === -1) {
      return null;
    }
    return this.getComponentAt$int(index);
  }
  /**
   * Inserts a new tab for the given component, at the given index,
   * represented by the given title and/or icon, either of which may
   * be {@code null}.
   *
   * @param title the title to be displayed on the tab
   * @param icon the icon to be displayed on the tab
   * @param component the component to be displayed when this tab is clicked.
   * @param tip the tooltip to be displayed for this tab
   * @param index the position to insert this new tab
   *       {@code (index >= 0 && index <= getTabCount())}
   *
   * @throws IndexOutOfBoundsException if the index is out of range
   *         {@code (index < 0 || index > getTabCount())}
   *
   * @see #addTab
   * @see #removeTabAt
   */
  insertTab(title: string, icon: Icon, component: Component, tip: string, index: number): void {
    let newIndex = index;
    let removeIndex = this.indexOfComponent(component);
    if (component != null && removeIndex !== -1) {
      this.removeTabAt(removeIndex);
      if (newIndex > removeIndex) {
        newIndex--;
      }
    }
    let selectedIndex = this.getSelectedIndex();
    this.pages.add(newIndex, new JTabbedPane$Page().$o(this)._JTabbedPane$Page(this, title != null ? title : '', icon, null, component, tip));
    if (component != null) {
      this.addImpl(component, null, -1);
      component.setVisible(false);
    } else {
      this.firePropertyChange$String$int$int('indexForNullComponent', -1, index);
    }
    if (this.pages.size() === 1) {
      this.setSelectedIndex(0);
    }
    if (selectedIndex >= newIndex) {
      this.setSelectedIndexImpl((selectedIndex + 1) | 0, false);
    }
    if (!this.haveRegistered && tip != null) {
      ToolTipManager.sharedInstance().registerComponent(this);
      this.haveRegistered = true;
    }
    if (this.accessibleContext != null) {
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, null, component);
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Adds a <code>component</code> and <code>tip</code>
   * represented by a <code>title</code> and/or <code>icon</code>,
   * either of which can be <code>null</code>.
   * Cover method for <code>insertTab</code>.
   *
   * @param title the title to be displayed in this tab
   * @param icon the icon to be displayed in this tab
   * @param component the component to be displayed when this tab is clicked
   * @param tip the tooltip to be displayed for this tab
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  addTab$String$Icon$Component$String(title: string, icon: Icon, component: Component, tip: string): void {
    this.insertTab(title, icon, component, tip, this.pages.size());
  }
  /**
   * Adds a <code>component</code> represented by a <code>title</code>
   * and/or <code>icon</code>, either of which can be <code>null</code>.
   * Cover method for <code>insertTab</code>.
   *
   * @param title the title to be displayed in this tab
   * @param icon the icon to be displayed in this tab
   * @param component the component to be displayed when this tab is clicked
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  addTab$String$Icon$Component(title: string, icon: Icon, component: Component): void {
    this.insertTab(title, icon, component, null, this.pages.size());
  }
  /**
   * Adds a <code>component</code> represented by a <code>title</code>
   * and no icon.
   * Cover method for <code>insertTab</code>.
   *
   * @param title the title to be displayed in this tab
   * @param component the component to be displayed when this tab is clicked
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  addTab$String$Component(title: string, component: Component): void {
    this.insertTab(title, null, component, null, this.pages.size());
  }
  /**
   * Adds a <code>component</code> with a tab title defaulting to
   * the name of the component which is the result of calling
   * <code>component.getName</code>.
   * Cover method for <code>insertTab</code>.
   *
   * @param component the component to be displayed when this tab is clicked
   * @return the component
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  add$Component(component: Component): Component {
    if (!($J.isa(component, UIResource))) {
      this.addTab$String$Component(component.getName$(), component);
    } else {
      super.add$Component(component);
    }
    return component;
  }
  /**
   * Adds a <code>component</code> with the specified tab title.
   * Cover method for <code>insertTab</code>.
   *
   * @param title the title to be displayed in this tab
   * @param component the component to be displayed when this tab is clicked
   * @return the component
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  add$String$Component(title: string, component: Component): Component {
    if (!($J.isa(component, UIResource))) {
      this.addTab$String$Component(title, component);
    } else {
      super.add$String$Component(title, component);
    }
    return component;
  }
  /**
   * Adds a <code>component</code> at the specified tab index with a tab
   * title defaulting to the name of the component.
   * Cover method for <code>insertTab</code>.
   *
   * @param component the component to be displayed when this tab is clicked
   * @param index the position to insert this new tab
   * @return the component
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  add$Component$int(component: Component, index: number): Component {
    if (!($J.isa(component, UIResource))) {
      this.insertTab(component.getName$(), null, component, null, index === -1 ? this.getTabCount() : index);
    } else {
      super.add$Component$int(component, index);
    }
    return component;
  }
  /**
   * Adds a <code>component</code> to the tabbed pane.
   * If <code>constraints</code> is a <code>String</code> or an
   * <code>Icon</code>, it will be used for the tab title,
   * otherwise the component's name will be used as the tab title.
   * Cover method for <code>insertTab</code>.
   *
   * @param component the component to be displayed when this tab is clicked
   * @param constraints the object to be displayed in the tab
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  add$Component$Object(component: Component, constraints: any): void {
    if (!($J.isa(component, UIResource))) {
      if ($J.isa(constraints, JString)) {
        this.addTab$String$Component(constraints, component);
      } else if ($J.isa(constraints, Icon)) {
        this.addTab$String$Icon$Component(null, constraints, component);
      } else {
        this.add$Component(component);
      }
    } else {
      super.add$Component$Object(component, constraints);
    }
  }
  /**
   * Adds a <code>component</code> at the specified tab index.
   * If <code>constraints</code> is a <code>String</code> or an
   * <code>Icon</code>, it will be used for the tab title,
   * otherwise the component's name will be used as the tab title.
   * Cover method for <code>insertTab</code>.
   *
   * @param component the component to be displayed when this tab is clicked
   * @param constraints the object to be displayed in the tab
   * @param index the position to insert this new tab
   *
   * @see #insertTab
   * @see #removeTabAt
   */
  add$Component$Object$int(component: Component, constraints: any, index: number): void {
    if (!($J.isa(component, UIResource))) {
      let icon = $J.isa(constraints, Icon) ? constraints : null;
      let title = $J.isa(constraints, JString) ? constraints : null;
      this.insertTab(title, icon, component, null, index === -1 ? this.getTabCount() : index);
    } else {
      super.add$Component$Object$int(component, constraints, index);
    }
  }
  clearAccessibleParent(c: Component): void {
    let ac = c.getAccessibleContext();
    if (ac != null) {
      ac.setAccessibleParent(null);
    }
  }
  /**
   * Removes the tab at <code>index</code>.
   * After the component associated with <code>index</code> is removed,
   * its visibility is reset to true to ensure it will be visible
   * if added to other containers.
   * @param index the index of the tab to be removed
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #addTab
   * @see #insertTab
   */
  removeTabAt(index: number): void {
    this.checkIndex(index);
    let component = this.getComponentAt$int(index);
    let shouldChangeFocus = false;
    let selected = this.getSelectedIndex();
    let oldName = null;
    if (component === this.visComp) {
      shouldChangeFocus = (SwingUtilities.findFocusOwner(this.visComp) != null);
      this.visComp = null;
    }
    if (this.accessibleContext != null) {
      if (index === selected) {
        this.pages.get(index).firePropertyChange(AccessibleContext.ACCESSIBLE_STATE_PROPERTY, AccessibleState.SELECTED, null);
        oldName = this.accessibleContext.getAccessibleName();
      }
      this.accessibleContext.firePropertyChange(AccessibleContext.ACCESSIBLE_VISIBLE_DATA_PROPERTY, component, null);
    }
    this.setTabComponentAt(index, null);
    this.pages.removeAt(index);
    this.putClientProperty('__index_to_remove__', index);
    if (selected > index) {
      this.setSelectedIndexImpl((selected - 1) | 0, false);
    } else if (selected >= this.getTabCount()) {
      this.setSelectedIndexImpl((selected - 1) | 0, false);
      let newSelected = (selected !== 0) ? this.pages.get((selected - 1) | 0) : null;
      this.changeAccessibleSelection(null, oldName, newSelected);
    } else if (index === selected) {
      this.fireStateChanged();
      this.changeAccessibleSelection(null, oldName, this.pages.get(index));
    }
    if (component != null) {
      let components = this.getComponents();
      for (let i = components.length; --i >= 0; ) {
        if (components[i] === component) {
          super.remove$int(i);
          component.setVisible(true);
          this.clearAccessibleParent(component);
          break;
        }
      }
    }
    if (shouldChangeFocus) {
      SwingUtilities2.tabbedPaneChangeFocusTo(this.getSelectedComponent());
    }
    this.revalidate();
    this.repaint$();
  }
  /**
   * Removes the specified <code>Component</code> from the
   * <code>JTabbedPane</code>. The method does nothing
   * if the <code>component</code> is null.
   *
   * @param component the component to remove from the tabbedpane
   * @see #addTab
   * @see #removeTabAt
   */
  remove$Component(component: Component): void {
    let index = this.indexOfComponent(component);
    if (index !== -1) {
      this.removeTabAt(index);
    } else {
      let children = this.getComponents();
      for (let i = 0; i < children.length; i++) {
        if (component === children[i]) {
          super.remove$int(i);
          break;
        }
      }
    }
  }
  /**
   * Removes the tab and component which corresponds to the specified index.
   *
   * @param index the index of the component to remove from the
   *          <code>tabbedpane</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   * @see #addTab
   * @see #removeTabAt
   */
  remove$int(index: number): void {
    this.removeTabAt(index);
  }
  /**
   * Removes all the tabs and their corresponding components
   * from the <code>tabbedpane</code>.
   *
   * @see #addTab
   * @see #removeTabAt
   */
  removeAll(): void {
    this.setSelectedIndexImpl(-1, true);
    let tabCount = this.getTabCount();
    while (tabCount-- > 0) {
      this.removeTabAt(tabCount);
    }
  }
  /**
   * Returns the number of tabs in this <code>tabbedpane</code>.
   *
   * @return an integer specifying the number of tabbed pages
   */
  getTabCount(): number {
    return this.pages.size();
  }
  /**
   * Returns the tab title at <code>index</code>.
   *
   * @param index  the index of the item being queried
   * @return the title at <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   * @see #setTitleAt
   */
  getTitleAt(index: number): string {
    return this.pages.get(index).title;
  }
  /**
   * Returns the tab icon at <code>index</code>.
   *
   * @param index  the index of the item being queried
   * @return the icon at <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setIconAt
   */
  getIconAt(index: number): Icon {
    return this.pages.get(index).icon;
  }
  /**
   * Returns the tab disabled icon at <code>index</code>.
   * If the tab disabled icon doesn't exist at <code>index</code>
   * this will forward the call to the look and feel to construct
   * an appropriate disabled Icon from the corresponding enabled
   * Icon. Some look and feels might not render the disabled Icon,
   * in which case it won't be created.
   *
   * @param index  the index of the item being queried
   * @return the icon at <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setDisabledIconAt
   */
  getDisabledIconAt(index: number): Icon {
    let page = this.pages.get(index);
    if (page.disabledIcon == null) {
      page.disabledIcon = UIManager.getLookAndFeel().getDisabledIcon(this, page.icon);
    }
    return page.disabledIcon;
  }
  /**
   * Returns the tab background color at <code>index</code>.
   *
   * @param index  the index of the item being queried
   * @return the <code>Color</code> of the tab background at
   *          <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setBackgroundAt
   */
  getBackgroundAt(index: number): Color {
    return this.pages.get(index).getBackground();
  }
  /**
   * Returns the tab foreground color at <code>index</code>.
   *
   * @param index  the index of the item being queried
   * @return the <code>Color</code> of the tab foreground at
   *          <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setForegroundAt
   */
  getForegroundAt(index: number): Color {
    return this.pages.get(index).getForeground();
  }
  /**
   * Returns whether or not the tab at <code>index</code> is
   * currently enabled.
   *
   * @param index  the index of the item being queried
   * @return true if the tab at <code>index</code> is enabled;
   *          false otherwise
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setEnabledAt
   */
  isEnabledAt(index: number): boolean {
    return this.pages.get(index).isEnabled();
  }
  /**
   * Returns the component at <code>index</code>.
   *
   * @param index  the index of the item being queried
   * @return the <code>Component</code> at <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setComponentAt
   */
  getComponentAt$int(index: number): Component {
    return this.pages.get(index).component;
  }
  /**
   * Returns the keyboard mnemonic for accessing the specified tab.
   * The mnemonic is the key which when combined with the look and feel's
   * mouseless modifier (usually Alt) will activate the specified
   * tab.
   *
   * @since 1.4
   * @param tabIndex the index of the tab that the mnemonic refers to
   * @return the key code which represents the mnemonic;
   *         -1 if a mnemonic is not specified for the tab
   * @throws IndexOutOfBoundsException if index is out of range
   *            (<code>tabIndex</code> &lt; 0 ||
   *              <code>tabIndex</code> &gt;= tab count)
   * @see #setDisplayedMnemonicIndexAt(int,int)
   * @see #setMnemonicAt(int,int)
   */
  getMnemonicAt(tabIndex: number): number {
    this.checkIndex(tabIndex);
    let page = this.pages.get(tabIndex);
    return page.getMnemonic();
  }
  /**
   * Returns the character, as an index, that the look and feel should
   * provide decoration for as representing the mnemonic character.
   *
   * @since 1.4
   * @param tabIndex the index of the tab that the mnemonic refers to
   * @return index representing mnemonic character if one exists;
   *    otherwise returns -1
   * @throws IndexOutOfBoundsException if index is out of range
   *            (<code>tabIndex</code> &lt; 0 ||
   *              <code>tabIndex</code> &gt;= tab count)
   * @see #setDisplayedMnemonicIndexAt(int,int)
   * @see #setMnemonicAt(int,int)
   */
  getDisplayedMnemonicIndexAt(tabIndex: number): number {
    this.checkIndex(tabIndex);
    let page = this.pages.get(tabIndex);
    return page.getDisplayedMnemonicIndex();
  }
  /**
   * Sets the disabled icon at <code>index</code> to <code>icon</code>
   * which can be <code>null</code>.
   * An internal exception is raised if there is no tab at that index.
   *
   * @param index the tab index where the disabled icon should be set
   * @param disabledIcon the icon to be displayed in the tab when disabled
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #getDisabledIconAt
   */
  setDisabledIconAt(index: number, disabledIcon: Icon): void {
    let oldIcon = this.pages.get(index).disabledIcon;
    this.pages.get(index).disabledIcon = disabledIcon;
    if (disabledIcon !== oldIcon && !this.isEnabledAt(index)) {
      this.revalidate();
      this.repaint$();
    }
  }
  /**
   * Provides a hint to the look and feel as to which character in the
   * text should be decorated to represent the mnemonic. Not all look and
   * feels may support this. A value of -1 indicates either there is
   * no mnemonic for this tab, or you do not wish the mnemonic to be
   * displayed for this tab.
   * <p>
   * The value of this is updated as the properties relating to the
   * mnemonic change (such as the mnemonic itself, the text...).
   * You should only ever have to call this if
   * you do not wish the default character to be underlined. For example, if
   * the text at tab index 3 was 'Apple Price', with a mnemonic of 'p',
   * and you wanted the 'P'
   * to be decorated, as 'Apple <u>P</u>rice', you would have to invoke
   * <code>setDisplayedMnemonicIndex(3, 6)</code> after invoking
   * <code>setMnemonicAt(3, KeyEvent.VK_P)</code>.
   * <p>Note that it is the programmer's responsibility to ensure
   * that each tab has a unique mnemonic or unpredictable results may
   * occur.
   *
   * @since 1.4
   * @param tabIndex the index of the tab that the mnemonic refers to
   * @param mnemonicIndex index into the <code>String</code> to underline
   * @throws IndexOutOfBoundsException if <code>tabIndex</code> is
   *            out of range ({@code tabIndex < 0 || tabIndex >= tab
   *            count})
   * @throws IllegalArgumentException will be thrown if
   *            <code>mnemonicIndex</code> is &gt;= length of the tab
   *            title , or &lt; -1
   * @see #setMnemonicAt(int,int)
   * @see #getDisplayedMnemonicIndexAt(int)
   */
  setDisplayedMnemonicIndexAt(tabIndex: number, mnemonicIndex: number): void {
    this.checkIndex(tabIndex);
    let page = this.pages.get(tabIndex);
    page.setDisplayedMnemonicIndex(mnemonicIndex);
  }
  /**
   * Sets the keyboard mnemonic for accessing the specified tab.
   * The mnemonic is the key which when combined with the look and feel's
   * mouseless modifier (usually Alt) will activate the specified
   * tab.
   * <p>
   * A mnemonic must correspond to a single key on the keyboard
   * and should be specified using one of the <code>VK_XXX</code>
   * keycodes defined in <code>java.awt.event.KeyEvent</code>
   * or one of the extended keycodes obtained through
   * <code>java.awt.event.KeyEvent.getExtendedKeyCodeForChar</code>.
   * Mnemonics are case-insensitive, therefore a key event
   * with the corresponding keycode would cause the button to be
   * activated whether or not the Shift modifier was pressed.
   * <p>
   * This will update the displayed mnemonic property for the specified
   * tab.
   *
   * @since 1.4
   * @param tabIndex the index of the tab that the mnemonic refers to
   * @param mnemonic the key code which represents the mnemonic
   * @throws IndexOutOfBoundsException if <code>tabIndex</code> is out
   *            of range ({@code tabIndex < 0 || tabIndex >= tab count})
   * @see #getMnemonicAt(int)
   * @see #setDisplayedMnemonicIndexAt(int,int)
   */
  setMnemonicAt(tabIndex: number, mnemonic: number): void {
    this.checkIndex(tabIndex);
    let page = this.pages.get(tabIndex);
    page.setMnemonic(mnemonic);
    this.firePropertyChange$String$Object$Object('mnemonicAt', null, null);
  }
  /**
   * Returns the index of the tab for the specified component.
   * Returns -1 if there is no tab for this component.
   *
   * @param component the component for the tab
   * @return the first tab which matches this component, or -1
   *          if there is no tab for this component
   */
  indexOfComponent(component: Component): number {
    for (let i = 0; i < this.getTabCount(); i++) {
      let c = this.getComponentAt$int(i);
      if ((c != null && c.equals(component)) || (c == null && c === component)) {
        return i;
      }
    }
    return -1;
  }
  /**
   * Returns the tooltip text for the component determined by the
   * mouse event location.
   *
   * @param event  the <code>MouseEvent</code> that tells where the
   *          cursor is lingering
   * @return the <code>String</code> containing the tooltip text
   */
  getToolTipText$MouseEvent(event: MouseEvent): string {
    if (this.ui != null) {
      let index = (this.ui).tabForCoordinate$JTabbedPane$int$int(this, event.getX(), event.getY());
      if (index !== -1) {
        return this.pages.get(index).tip;
      }
    }
    return super.getToolTipText$MouseEvent(event);
  }
  checkIndex(index: number): void {
    if (index < 0 || index >= this.pages.size()) {
      throw new IndexOutOfBoundsException('Index: ' + index + ', Tab count: ' + this.pages.size());
    }
  }
  /**
   * Returns a string representation of this <code>JTabbedPane</code>.
   * This method
   * is intended to be used only for debugging purposes, and the
   * content and format of the returned string may vary between
   * implementations. The returned string may be empty but may not
   * be <code>null</code>.
   *
   * @return  a string representation of this JTabbedPane.
   */
  paramString(): string {
    let tabPlacementString: string;
    if (this.tabPlacement === SwingConstants.TOP) {
      tabPlacementString = 'TOP';
    } else if (this.tabPlacement === SwingConstants.BOTTOM) {
      tabPlacementString = 'BOTTOM';
    } else if (this.tabPlacement === SwingConstants.LEFT) {
      tabPlacementString = 'LEFT';
    } else if (this.tabPlacement === SwingConstants.RIGHT) {
      tabPlacementString = 'RIGHT';
    } else {
      tabPlacementString = '';
    }
    let haveRegisteredString = (this.haveRegistered ? 'true' : 'false');
    return super.paramString() + ',haveRegistered=' + haveRegisteredString + ',tabPlacement=' + tabPlacementString;
  }
  /**
   * Gets the AccessibleContext associated with this JTabbedPane.
   * For tabbed panes, the AccessibleContext takes the form of an
   * AccessibleJTabbedPane.
   * A new AccessibleJTabbedPane instance is created if necessary.
   *
   * @return an AccessibleJTabbedPane that serves as the
   *         AccessibleContext of this JTabbedPane
   */
  getAccessibleContext(): AccessibleContext {
    if (this.accessibleContext == null) {
      this.accessibleContext = new JTabbedPane$AccessibleJTabbedPane().$o(this)._JTabbedPane$AccessibleJTabbedPane();
      let count = this.getTabCount();
      for (let i = 0; i < count; i++) {
        this.pages.get(i).initAccessibleContext();
      }
    }
    return this.accessibleContext;
  }
  /**
   * Sets the component that is responsible for rendering the
   * title for the specified tab.  A null value means
   * <code>JTabbedPane</code> will render the title and/or icon for
   * the specified tab.  A non-null value means the component will
   * render the title and <code>JTabbedPane</code> will not render
   * the title and/or icon.
   * <p>
   * Note: The component must not be one that the developer has
   *       already added to the tabbed pane.
   *
   * @param index the tab index where the component should be set
   * @param component the component to render the title for the
   *                  specified tab
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   * @throws IllegalArgumentException if component has already been
   *            added to this <code>JTabbedPane</code>
   *
   * @see #getTabComponentAt
   * @since 1.6
   */
  setTabComponentAt(index: number, component: Component): void {
    if (component != null && this.indexOfComponent(component) !== -1) {
      throw new IllegalArgumentException('Component is already added to this JTabbedPane');
    }
    let oldValue = this.getTabComponentAt(index);
    if (component !== oldValue) {
      let tabComponentIndex = this.indexOfTabComponent(component);
      if (tabComponentIndex !== -1) {
        this.setTabComponentAt(tabComponentIndex, null);
      }
      this.pages.get(index).tabComponent = component;
      this.firePropertyChange$String$int$int('indexForTabComponent', -1, index);
    }
  }
  /**
   * Returns the tab component at <code>index</code>.
   *
   * @param index  the index of the item being queried
   * @return the tab component at <code>index</code>
   * @throws IndexOutOfBoundsException if index is out of range
   *            {@code (index < 0 || index >= tab count)}
   *
   * @see #setTabComponentAt
   * @since 1.6
   */
  getTabComponentAt(index: number): Component {
    return this.pages.get(index).tabComponent;
  }
  /**
   * Returns the index of the tab for the specified tab component.
   * Returns -1 if there is no tab for this tab component.
   *
   * @param tabComponent the tab component for the tab
   * @return the first tab which matches this tab component, or -1
   *          if there is no tab for this tab component
   * @see #setTabComponentAt
   * @see #getTabComponentAt
   * @since 1.6
   */
  indexOfTabComponent(tabComponent: Component): number {
    for (let i = 0; i < this.getTabCount(); i++) {
      let c = this.getTabComponentAt(i);
      if (c === tabComponent) {
        return i;
      }
    }
    return -1;
  }
}

/**
 * We pass <code>ModelChanged</code> events along to the listeners with
 * the tabbedpane (instead of the model itself) as the event source.
 */
export class JTabbedPane$ModelListener extends JObject {
  /**
   * Constructs a {@code ModelListener}.
   */
  _JTabbedPane$ModelListener(): this {
    return this;
  }
  stateChanged(e: ChangeEvent): void {
    this.$outer.fireStateChanged();
  }
}

/**
 * This class implements accessibility support for the
 * <code>JTabbedPane</code> class.  It provides an implementation of the
 * Java Accessibility API appropriate to tabbed pane user-interface
 * elements.
 * <p>
 * <strong>Warning:</strong>
 * Serialized objects of this class will not be compatible with
 * future Swing releases. The current serialization support is
 * appropriate for short term storage or RMI between applications running
 * the same version of Swing.  As of 1.4, support for long term storage
 * of all JavaBeans
 * has been added to the <code>java.beans</code> package.
 * Please see {@link java.beans.XMLEncoder}.
 */
export class JTabbedPane$AccessibleJTabbedPane extends JComponent$AccessibleJComponent {
  /**
   * Constructs an AccessibleJTabbedPane
   */
  _JTabbedPane$AccessibleJTabbedPane(): this {
    this._JComponent$AccessibleJComponent();
    this.$outer.model.addChangeListener($J.fn(this, 'stateChanged'));
    return this;
  }
  /**
   * Returns the accessible name of this object, or {@code null} if
   * there is no accessible name.
   *
   * @return the accessible name of this object, or {@code null}.
   * @since 1.6
   */
  getAccessibleName(): string {
    if (this.accessibleName != null) {
      return this.accessibleName;
    }
    let cp = this.$outer.getClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY);
    if (cp != null) {
      return cp;
    }
    let index = this.$outer.getSelectedIndex();
    if (index >= 0) {
      return this.$outer.pages.get(index).getAccessibleName();
    }
    return super.getAccessibleName();
  }
  stateChanged(e: ChangeEvent): void {
    let o = e.getSource();
    this.firePropertyChange(AccessibleContext.ACCESSIBLE_SELECTION_PROPERTY, null, o);
  }
  /**
   * Returns the number of accessible children in the object.
   *
   * @return the number of accessible children in the object.
   */
  getAccessibleChildrenCount(): number {
    return this.$outer.getTabCount();
  }
  /**
   * Return the specified Accessible child of the object.
   *
   * @param i zero-based index of child
   * @return the Accessible child of the object
   * @throws IllegalArgumentException if index is out of bounds
   */
  getAccessibleChild(i: number): Accessible {
    if (i < 0 || i >= this.$outer.getTabCount()) {
      return null;
    }
    return this.$outer.pages.get(i);
  }
  /**
   * Gets the <code>AccessibleSelection</code> associated with
   * this object.  In the implementation of the Java
   * Accessibility API for this class,
   * returns this object, which is responsible for implementing the
   * <code>AccessibleSelection</code> interface on behalf of itself.
   *
   * @return this object
   */
  getAccessibleSelection$(): AccessibleSelection {
    return this;
  }
  getAccessibleSelection$int(i: number): Accessible {
    let index = this.$outer.getSelectedIndex();
    if (index === -1) {
      return null;
    }
    return this.$outer.pages.get(index);
  }
  isAccessibleChildSelected(i: number): boolean {
    return (i === this.$outer.getSelectedIndex());
  }
}

export class JTabbedPane$Page extends AccessibleContext {
  title: string = null;
  background: Color = null;
  foreground: Color = null;
  icon: Icon = null;
  disabledIcon: Icon = null;
  parent: JTabbedPane = null;
  component: Component = null;
  tip: string = null;
  enabled: boolean = false;
  needsUIUpdate: boolean = false;
  mnemonic: number = 0;
  mnemonicIndex: number = 0;
  tabComponent: Component = null;
  _JTabbedPane$Page(parent: JTabbedPane, title: string, icon: Icon, disabledIcon: Icon, component: Component, tip: string): this {
    this._AccessibleContext();
    this.enabled = true;
    this.mnemonic = -1;
    this.mnemonicIndex = -1;
    this.title = title;
    this.icon = icon;
    this.disabledIcon = disabledIcon;
    this.parent = parent;
    this.setAccessibleParent(parent);
    this.component = component;
    this.tip = tip;
    this.initAccessibleContext();
    return this;
  }
  initAccessibleContext(): void {
    if (this.$outer.accessibleContext != null && $J.isa(this.component, Accessible)) {
      let ac: AccessibleContext;
      ac = this.component.getAccessibleContext();
      if (ac != null) {
        ac.setAccessibleParent(this);
      }
    }
  }
  setMnemonic(mnemonic: number): void {
    this.mnemonic = mnemonic;
    this.updateDisplayedMnemonicIndex();
  }
  getMnemonic(): number {
    return this.mnemonic;
  }
  setDisplayedMnemonicIndex(mnemonicIndex: number): void {
    if (this.mnemonicIndex !== mnemonicIndex) {
      let t = this.getTitle();
      if (mnemonicIndex !== -1 && (t == null || mnemonicIndex < 0 || mnemonicIndex >= t.length)) {
        throw new IllegalArgumentException('Invalid mnemonic index: ' + mnemonicIndex);
      }
      this.mnemonicIndex = mnemonicIndex;
      this.$outer.firePropertyChange$String$Object$Object('displayedMnemonicIndexAt', null, null);
    }
  }
  getDisplayedMnemonicIndex(): number {
    return this.mnemonicIndex;
  }
  updateDisplayedMnemonicIndex(): void {
    this.setDisplayedMnemonicIndex(SwingUtilities.findDisplayedMnemonicIndex(this.getTitle(), this.mnemonic));
  }
  getAccessibleContext(): AccessibleContext {
    return this;
  }
  getAccessibleName(): string {
    if (this.accessibleName != null) {
      return this.accessibleName;
    } else {
      return this.getTitle();
    }
  }
  getAccessibleDescription(): string {
    if (this.accessibleDescription != null) {
      return this.accessibleDescription;
    } else if (this.tip != null) {
      return this.tip;
    }
    return null;
  }
  getAccessibleIndexInParent(): number {
    return this.getPageIndex();
  }
  getAccessibleChildrenCount(): number {
    if ($J.isa(this.component, Accessible)) {
      return 1;
    } else {
      return 0;
    }
  }
  getAccessibleChild(i: number): Accessible {
    if ($J.isa(this.component, Accessible)) {
      return this.component;
    } else {
      return null;
    }
  }
  getBackground(): Color {
    return this.background != null ? this.background : this.parent.getBackground();
  }
  getForeground(): Color {
    return this.foreground != null ? this.foreground : this.parent.getForeground();
  }
  isEnabled(): boolean {
    return this.enabled;
  }
  getTitle(): string {
    return this.$outer.getTitleAt(this.getPageIndex());
  }
  getPageIndex(): number {
    let index: number;
    if (this.component != null || (this.component == null && this.tabComponent == null)) {
      index = this.parent.indexOfComponent(this.component);
    } else {
      index = this.parent.indexOfTabComponent(this.tabComponent);
    }
    return index;
  }
}

$J.define(JTabbedPane, 'javax.swing.JTabbedPane', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.accessibility.Accessible', 'javax.swing.SwingConstants'], sup: 'javax.swing.JComponent', ctors: { 'int,int': '_JTabbedPane$int$int', 'int': '_JTabbedPane$int', '': '_JTabbedPane$' }, meths: { 'readObject(java.io.ObjectInputStream)': 'readObject$ObjectInputStream$JTabbedPane', 'writeObject(java.io.ObjectOutputStream)': 'writeObject$ObjectOutputStream$JTabbedPane', 'getToolTipText(java.awt.event.MouseEvent)': 'getToolTipText$MouseEvent', 'indexOfTab(javax.swing.Icon)': 'indexOfTab$Icon', 'indexOfTab(java.lang.String)': 'indexOfTab$String', 'getComponentAt(int)': 'getComponentAt$int', 'remove(int)': 'remove$int', 'remove(java.awt.Component)': 'remove$Component', 'add(java.awt.Component,java.lang.Object,int)': 'add$Component$Object$int', 'add(java.awt.Component,java.lang.Object)': 'add$Component$Object', 'add(java.awt.Component,int)': 'add$Component$int', 'add(java.lang.String,java.awt.Component)': 'add$String$Component', 'add(java.awt.Component)': 'add$Component', 'addTab(java.lang.String,java.awt.Component)': 'addTab$String$Component', 'addTab(java.lang.String,javax.swing.Icon,java.awt.Component)': 'addTab$String$Icon$Component', 'addTab(java.lang.String,javax.swing.Icon,java.awt.Component,java.lang.String)': 'addTab$String$Icon$Component$String', 'setUI(javax.swing.plaf.TabbedPaneUI)': 'setUI$TabbedPaneUI' } });
$J.define(JTabbedPane$ModelListener, 'javax.swing.JTabbedPane$ModelListener', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.io.Serializable'], sup: 'java.lang.Object', ctors: { '': '_JTabbedPane$ModelListener' }, inner: true });
$J.define(JTabbedPane$AccessibleJTabbedPane, 'javax.swing.JTabbedPane$AccessibleJTabbedPane', { kind: 'class', ifaces: ['javax.accessibility.AccessibleSelection', 'javax.swing.event.ChangeListener'], sup: 'javax.swing.JComponent$AccessibleJComponent', ctors: { '': '_JTabbedPane$AccessibleJTabbedPane' }, meths: { 'getAccessibleSelection(int)': 'getAccessibleSelection$int', 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleSelection()': 'getAccessibleSelection$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.define(JTabbedPane$Page, 'javax.swing.JTabbedPane$Page', { kind: 'class', ifaces: ['java.io.Serializable', 'javax.accessibility.Accessible', 'javax.accessibility.AccessibleComponent', 'javax.accessibility.AccessibleValue'], sup: 'javax.accessibility.AccessibleContext', ctors: { 'javax.swing.JTabbedPane,java.lang.String,javax.swing.Icon,javax.swing.Icon,java.awt.Component,java.lang.String': '_JTabbedPane$Page' }, meths: { 'getAccessibleAt(java.awt.Point)': 'getAccessibleAt$Point', 'getAccessibleStateSet()': 'getAccessibleStateSet$', 'getAccessibleRole()': 'getAccessibleRole$' }, inner: true });
$J.module(() => {
  Accessible = $J.load('javax.accessibility.Accessible');
  AccessibleState = $J.load('javax.accessibility.AccessibleState');
  DefaultSingleSelectionModel = $J.load('javax.swing.DefaultSingleSelectionModel');
  Icon = $J.load('javax.swing.Icon');
  SwingConstants = $J.load('javax.swing.SwingConstants');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  ToolTipManager = $J.load('javax.swing.ToolTipManager');
  UIManager = $J.load('javax.swing.UIManager');
  ChangeEvent = $J.load('javax.swing.event.ChangeEvent');
  ChangeListener = $J.load('javax.swing.event.ChangeListener');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
