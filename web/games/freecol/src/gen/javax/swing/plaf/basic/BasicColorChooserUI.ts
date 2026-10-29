// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/basic/BasicColorChooserUI.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
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
import { $J, JObject } from '../../../../../jre/index.ts';
import { ColorChooserUI } from '../ColorChooserUI.ts';
import { TransferHandler } from '../../TransferHandler.ts';

let BorderLayout, JColorChooser, JPanel, JTabbedPane, LookAndFeel, UIManager, TitledBorder, ColorChooserComponentFactory, UIResource, CenterLayout, DefaultLookup;

/**
 * Provides the basic look and feel for a JColorChooser.
 *
 * @author Tom Santos
 * @author Steve Wilson
 */
export class BasicColorChooserUI extends ColorChooserUI {
  /**
   * JColorChooser this BasicColorChooserUI is installed on.
   *
   * @since 1.5
   */
  chooser: JColorChooser = null;
  tabbedPane: JTabbedPane = null;
  singlePanel: JPanel = null;
  previewPanelHolder: JPanel = null;
  previewPanel: JComponent = null;
  isMultiPanel: boolean = false;
  static defaultTransferHandler: TransferHandler = null;
  /**
   * The array of default color choosers.
   */
  defaultChoosers: AbstractColorChooserPanel[] = null;
  /**
   * The instance of {@code ChangeListener}.
   */
  previewListener: ChangeListener = null;
  /**
   * The instance of {@code PropertyChangeListener}.
   */
  propertyChangeListener: PropertyChangeListener = null;
  handler: BasicColorChooserUI$Handler = null;
  /**
   * Constructs a {@code BasicColorChooserUI}.
   */
  _BasicColorChooserUI(): this {
    this._ColorChooserUI();
    this.isMultiPanel = false;
    return this;
  }
  /**
   * Returns a new instance of {@code BasicColorChooserUI}.
   *
   * @param c a component
   * @return a new instance of {@code BasicColorChooserUI}
   */
  static createUI(c: JComponent): ComponentUI {
    return new BasicColorChooserUI()._BasicColorChooserUI();
  }
  /**
   * Returns an array of default color choosers.
   *
   * @return an array of default color choosers
   */
  createDefaultChoosers(): AbstractColorChooserPanel[] {
    let panels = ColorChooserComponentFactory.getDefaultChooserPanels();
    return panels;
  }
  /**
   * Uninstalls default color choosers.
   */
  uninstallDefaultChoosers(): void {
    let choosers = this.chooser.getChooserPanels();
    for (let i = 0; i < choosers.length; i++) {
      this.chooser.removeChooserPanel(choosers[i]);
    }
  }
  installUI(c: JComponent): void {
    this.chooser = c;
    super.installUI(c);
    this.installDefaults();
    this.installListeners();
    this.tabbedPane = new JTabbedPane()._JTabbedPane$();
    this.tabbedPane.setName('ColorChooser.tabPane');
    this.tabbedPane.setInheritsPopupMenu(true);
    this.tabbedPane.getAccessibleContext().setAccessibleDescription(this.tabbedPane.getName$());
    this.singlePanel = new JPanel()._JPanel$LayoutManager(new CenterLayout()._CenterLayout());
    this.singlePanel.setName('ColorChooser.panel');
    this.singlePanel.setInheritsPopupMenu(true);
    this.chooser.setLayout(new BorderLayout()._BorderLayout$());
    this.defaultChoosers = this.createDefaultChoosers();
    this.chooser.setChooserPanels(this.defaultChoosers);
    this.previewPanelHolder = new JPanel()._JPanel$LayoutManager(new CenterLayout()._CenterLayout());
    this.previewPanelHolder.setName('ColorChooser.previewPanelHolder');
    if (DefaultLookup.getBoolean$JComponent$ComponentUI$String$boolean(this.chooser, this, 'ColorChooser.showPreviewPanelText', true)) {
      let previewString = UIManager.getString$Object$Locale('ColorChooser.previewText', this.chooser.getLocale$());
      this.previewPanelHolder.setBorder(new TitledBorder()._TitledBorder$String(previewString));
    }
    this.previewPanelHolder.setInheritsPopupMenu(true);
    this.installPreviewPanel();
    this.chooser.applyComponentOrientation(c.getComponentOrientation());
  }
  uninstallUI(c: JComponent): void {
    this.chooser.remove$Component(this.tabbedPane);
    this.chooser.remove$Component(this.singlePanel);
    this.chooser.remove$Component(this.previewPanelHolder);
    this.uninstallDefaultChoosers();
    this.uninstallListeners();
    this.uninstallPreviewPanel();
    this.uninstallDefaults();
    this.previewPanelHolder = null;
    this.previewPanel = null;
    this.defaultChoosers = null;
    this.chooser = null;
    this.tabbedPane = null;
    this.handler = null;
  }
  /**
   * Installs preview panel.
   */
  installPreviewPanel(): void {
    let previewPanel = this.chooser.getPreviewPanel();
    if (previewPanel == null) {
      previewPanel = ColorChooserComponentFactory.getPreviewPanel();
    } else if ($J.equals($J.cls(JPanel), previewPanel.getClass()) && (0 === previewPanel.getComponentCount())) {
      previewPanel = null;
    }
    this.previewPanel = previewPanel;
    if (previewPanel != null) {
      this.chooser.add$Component$Object(this.previewPanelHolder, BorderLayout.SOUTH);
      previewPanel.setForeground(this.chooser.getColor());
      this.previewPanelHolder.add$Component(previewPanel);
      previewPanel.addMouseListener(this.getHandler());
      previewPanel.setInheritsPopupMenu(true);
    }
  }
  /**
   * Removes installed preview panel from the UI delegate.
   *
   * @since 1.7
   */
  uninstallPreviewPanel(): void {
    if (this.previewPanel != null) {
      this.previewPanel.removeMouseListener(this.getHandler());
      this.previewPanelHolder.remove$Component(this.previewPanel);
    }
    this.chooser.remove$Component(this.previewPanelHolder);
  }
  /**
   * Installs default properties.
   */
  installDefaults(): void {
    LookAndFeel.installColorsAndFont(this.chooser, 'ColorChooser.background', 'ColorChooser.foreground', 'ColorChooser.font');
    LookAndFeel.installProperty(this.chooser, 'opaque', true);
    let th = this.chooser.getTransferHandler();
    if (th == null || $J.isa(th, UIResource)) {
      this.chooser.setTransferHandler(BasicColorChooserUI.defaultTransferHandler);
    }
  }
  /**
   * Uninstalls default properties.
   */
  uninstallDefaults(): void {
    if ($J.isa(this.chooser.getTransferHandler(), UIResource)) {
      this.chooser.setTransferHandler(null);
    }
  }
  /**
   * Registers listeners.
   */
  installListeners(): void {
    this.propertyChangeListener = this.createPropertyChangeListener();
    this.chooser.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.previewListener = $J.fn(this.getHandler(), 'stateChanged');
    this.chooser.getSelectionModel().addChangeListener(this.previewListener);
  }
  getHandler(): BasicColorChooserUI$Handler {
    if (this.handler == null) {
      this.handler = new BasicColorChooserUI$Handler().$o(this)._BasicColorChooserUI$Handler();
    }
    return this.handler;
  }
  /**
   * Returns an instance of {@code PropertyChangeListener}.
   *
   * @return an instance of {@code PropertyChangeListener}
   */
  createPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(this.getHandler(), 'propertyChange');
  }
  /**
   * Unregisters listeners.
   */
  uninstallListeners(): void {
    this.chooser.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    this.chooser.getSelectionModel().removeChangeListener(this.previewListener);
    this.previewListener = null;
  }
  selectionChanged(model: ColorSelectionModel): void {
    let previewPanel = this.chooser.getPreviewPanel();
    if (previewPanel != null) {
      previewPanel.setForeground(model.getSelectedColor());
      previewPanel.repaint$();
    }
    let panels = this.chooser.getChooserPanels();
    if (panels != null) {
      for (let panel of panels) {
        if (panel != null) {
          panel.updateChooser();
        }
      }
    }
  }
  static $clinit() {
    BasicColorChooserUI.defaultTransferHandler = new BasicColorChooserUI$ColorTransferHandler()._BasicColorChooserUI$ColorTransferHandler();
  }
}

export class BasicColorChooserUI$Handler extends JObject {
  _BasicColorChooserUI$Handler(): this {
    return this;
  }
  stateChanged(evt: ChangeEvent): void {
    this.$outer.selectionChanged(evt.getSource());
  }
  mousePressed(evt: MouseEvent): void {
    if (this.$outer.chooser.getDragEnabled()) {
      let th = this.$outer.chooser.getTransferHandler();
      th.exportAsDrag(this.$outer.chooser, evt, TransferHandler.COPY);
    }
  }
  mouseReleased(evt: MouseEvent): void {
  }
  mouseClicked(evt: MouseEvent): void {
  }
  mouseEntered(evt: MouseEvent): void {
  }
  mouseExited(evt: MouseEvent): void {
  }
  propertyChange(evt: PropertyChangeEvent): void {
    let prop = evt.getPropertyName();
    if (prop === JColorChooser.CHOOSER_PANELS_PROPERTY) {
      let oldPanels = evt.getOldValue();
      let newPanels = evt.getNewValue();
      for (let i = 0; i < oldPanels.length; i++) {
        let wrapper = oldPanels[i].getParent();
        if (wrapper != null) {
          let parent = wrapper.getParent();
          if (parent != null) {
            parent.remove$Component(wrapper);
          }
          oldPanels[i].uninstallChooserPanel(this.$outer.chooser);
        }
      }
      let numNewPanels = newPanels.length;
      if (numNewPanels === 0) {
        this.$outer.chooser.remove$Component(this.$outer.tabbedPane);
        return;
      } else if (numNewPanels === 1) {
        this.$outer.chooser.remove$Component(this.$outer.tabbedPane);
        let centerWrapper = new JPanel()._JPanel$LayoutManager(new CenterLayout()._CenterLayout());
        centerWrapper.setInheritsPopupMenu(true);
        centerWrapper.add$Component(newPanels[0]);
        this.$outer.singlePanel.add$Component$Object(centerWrapper, BorderLayout.CENTER);
        this.$outer.chooser.add$Component(this.$outer.singlePanel);
      } else {
        if (oldPanels.length < 2) {
          this.$outer.chooser.remove$Component(this.$outer.singlePanel);
          this.$outer.chooser.add$Component$Object(this.$outer.tabbedPane, BorderLayout.CENTER);
        }
        for (let i = 0; i < newPanels.length; i++) {
          let centerWrapper = new JPanel()._JPanel$LayoutManager(new CenterLayout()._CenterLayout());
          centerWrapper.setInheritsPopupMenu(true);
          let name = newPanels[i].getDisplayName();
          let mnemonic = newPanels[i].getMnemonic();
          centerWrapper.add$Component(newPanels[i]);
          this.$outer.tabbedPane.addTab$String$Component(name, centerWrapper);
          if (mnemonic > 0) {
            this.$outer.tabbedPane.setMnemonicAt(i, mnemonic);
            let index = newPanels[i].getDisplayedMnemonicIndex();
            if (index >= 0) {
              this.$outer.tabbedPane.setDisplayedMnemonicIndexAt(i, index);
            }
          }
        }
      }
      this.$outer.chooser.applyComponentOrientation(this.$outer.chooser.getComponentOrientation());
      for (let i = 0; i < newPanels.length; i++) {
        newPanels[i].installChooserPanel(this.$outer.chooser);
      }
    } else if (prop === JColorChooser.PREVIEW_PANEL_PROPERTY) {
      this.$outer.uninstallPreviewPanel();
      this.$outer.installPreviewPanel();
    } else if (prop === JColorChooser.SELECTION_MODEL_PROPERTY) {
      let oldModel = evt.getOldValue();
      oldModel.removeChangeListener(this.$outer.previewListener);
      let newModel = evt.getNewValue();
      newModel.addChangeListener(this.$outer.previewListener);
      this.$outer.selectionChanged(newModel);
    } else if (prop === 'componentOrientation') {
      let o = evt.getNewValue();
      let cc = evt.getSource();
      if (o !== evt.getOldValue()) {
        cc.applyComponentOrientation(o);
        cc.updateUI();
      }
    }
  }
}

export class BasicColorChooserUI$ColorTransferHandler extends TransferHandler {
  _BasicColorChooserUI$ColorTransferHandler(): this {
    this._TransferHandler$String('color');
    return this;
  }
}

$J.define(BasicColorChooserUI, 'javax.swing.plaf.basic.BasicColorChooserUI', { kind: 'class', sup: 'javax.swing.plaf.ColorChooserUI', ctors: { '': '_BasicColorChooserUI' }, clinit: true, lazy: ['defaultTransferHandler'] });
$J.define(BasicColorChooserUI$Handler, 'javax.swing.plaf.basic.BasicColorChooserUI$Handler', { kind: 'class', ifaces: ['javax.swing.event.ChangeListener', 'java.awt.event.MouseListener', 'java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_BasicColorChooserUI$Handler' }, inner: true });
$J.define(BasicColorChooserUI$ColorTransferHandler, 'javax.swing.plaf.basic.BasicColorChooserUI$ColorTransferHandler', { kind: 'class', ifaces: ['javax.swing.plaf.UIResource'], sup: 'javax.swing.TransferHandler', ctors: { '': '_BasicColorChooserUI$ColorTransferHandler' } });
$J.module(() => {
  BorderLayout = $J.load('java.awt.BorderLayout');
  JColorChooser = $J.load('javax.swing.JColorChooser');
  JPanel = $J.load('javax.swing.JPanel');
  JTabbedPane = $J.load('javax.swing.JTabbedPane');
  LookAndFeel = $J.load('javax.swing.LookAndFeel');
  UIManager = $J.load('javax.swing.UIManager');
  TitledBorder = $J.load('javax.swing.border.TitledBorder');
  ColorChooserComponentFactory = $J.load('javax.swing.colorchooser.ColorChooserComponentFactory');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  CenterLayout = $J.load('javax.swing.plaf.basic.CenterLayout');
  DefaultLookup = $J.load('sun.swing.DefaultLookup');
});
