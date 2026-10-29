// @ts-nocheck
// OpenJDK 21 (Temurin 21.0.12.1+1 src.zip) java.desktop/javax/swing/plaf/metal/MetalTitlePane.java, translated to TypeScript by re/freecol/tools/j2ts (do not edit).
/*
 * Copyright (c) 2000, 2014, Oracle and/or its affiliates. All rights reserved.
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
import { $J, JObject, SunToolkit, Toolkit } from '../../../../../jre/index.ts';
import { JComponent } from '../../JComponent.ts';
import { AbstractAction } from '../../AbstractAction.ts';
import { JMenuBar } from '../../JMenuBar.ts';
import { WindowAdapter } from '../../../../java/awt/event/WindowAdapter.ts';

let Dialog, Dimension, Frame, Rectangle, WindowEvent, AccessibleContext, JButton, JMenu, JRootPane, JSeparator, SwingUtilities, UIManager, EmptyBorder, UIResource, MetalBumps, MetalLookAndFeel, MetalUtils, SwingUtilities2;

/**
 * Class that manages a JLF awt.Window-descendant class's title bar.
 * <p>
 * This class assumes it will be created with a particular window
 * decoration style, and that if the style changes, a new one will
 * be created.
 *
 * @author Terry Kellerman
 * @since 1.4
 */
export class MetalTitlePane extends JComponent {
  static handyEmptyBorder: Border = null;
  static readonly IMAGE_HEIGHT: number = 16;
  static readonly IMAGE_WIDTH: number = 16;
  /**
   * PropertyChangeListener added to the JRootPane.
   */
  propertyChangeListener: PropertyChangeListener = null;
  /**
   * JMenuBar, typically renders the system menu items.
   */
  menuBar: JMenuBar = null;
  /**
   * Action used to close the Window.
   */
  closeAction: Action = null;
  /**
   * Action used to iconify the Frame.
   */
  iconifyAction: Action = null;
  /**
   * Action to restore the Frame size.
   */
  restoreAction: Action = null;
  /**
   * Action to restore the Frame size.
   */
  maximizeAction: Action = null;
  /**
   * Button used to maximize or restore the Frame.
   */
  toggleButton: JButton = null;
  /**
   * Button used to maximize or restore the Frame.
   */
  iconifyButton: JButton = null;
  /**
   * Button used to maximize or restore the Frame.
   */
  closeButton: JButton = null;
  /**
   * Icon used for toggleButton when window is normal size.
   */
  maximizeIcon: Icon = null;
  /**
   * Icon used for toggleButton when window is maximized.
   */
  minimizeIcon: Icon = null;
  /**
   * Image used for the system menu icon
   */
  systemIcon: Image = null;
  /**
   * Listens for changes in the state of the Window listener to update
   * the state of the widgets.
   */
  windowListener: WindowListener = null;
  /**
   * Window we're currently in.
   */
  window: Window = null;
  /**
   * JRootPane rendering for.
   */
  rootPane: JRootPane = null;
  /**
   * Room remaining in title for bumps.
   */
  buttonsWidth: number = 0;
  /**
   * Buffered Frame.state property. As state isn't bound, this is kept
   * to determine when to avoid updating widgets.
   */
  state: number = 0;
  /**
   * MetalRootPaneUI that created us.
   */
  rootPaneUI: MetalRootPaneUI = null;
  inactiveBackground: Color = null;
  inactiveForeground: Color = null;
  inactiveShadow: Color = null;
  activeBumpsHighlight: Color = null;
  activeBumpsShadow: Color = null;
  activeBackground: Color = null;
  activeForeground: Color = null;
  activeShadow: Color = null;
  activeBumps: MetalBumps = null;
  inactiveBumps: MetalBumps = null;
  _MetalTitlePane(root: JRootPane, ui: MetalRootPaneUI): this {
    this._JComponent();
    this.inactiveBackground = UIManager.getColor$Object('inactiveCaption');
    this.inactiveForeground = UIManager.getColor$Object('inactiveCaptionText');
    this.inactiveShadow = UIManager.getColor$Object('inactiveCaptionBorder');
    this.activeBumpsHighlight = MetalLookAndFeel.getPrimaryControlHighlight();
    this.activeBumpsShadow = MetalLookAndFeel.getPrimaryControlDarkShadow();
    this.activeBackground = null;
    this.activeForeground = null;
    this.activeShadow = null;
    this.activeBumps = new MetalBumps()._MetalBumps(0, 0, this.activeBumpsHighlight, this.activeBumpsShadow, MetalLookAndFeel.getPrimaryControl());
    this.inactiveBumps = new MetalBumps()._MetalBumps(0, 0, MetalLookAndFeel.getControlHighlight(), MetalLookAndFeel.getControlDarkShadow(), MetalLookAndFeel.getControl());
    this.rootPane = root;
    this.rootPaneUI = ui;
    this.state = -1;
    this.installSubcomponents();
    this.determineColors();
    this.installDefaults();
    this.setLayout(this.createLayout());
    return this;
  }
  /**
   * Installs the necessary listeners.
   */
  installListeners(): void {
    if (this.window != null) {
      this.windowListener = this.createWindowListener();
      this.window.addWindowListener(this.windowListener);
      this.propertyChangeListener = this.createWindowPropertyChangeListener();
      this.window.addPropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
  }
  /**
   * Uninstalls the necessary listeners.
   */
  uninstallListeners(): void {
    if (this.window != null) {
      this.window.removeWindowListener(this.windowListener);
      this.window.removePropertyChangeListener$PropertyChangeListener(this.propertyChangeListener);
    }
  }
  /**
   * Returns the <code>WindowListener</code> to add to the
   * <code>Window</code>.
   */
  createWindowListener(): WindowListener {
    return new MetalTitlePane$WindowHandler().$o(this)._MetalTitlePane$WindowHandler();
  }
  /**
   * Returns the <code>PropertyChangeListener</code> to install on
   * the <code>Window</code>.
   */
  createWindowPropertyChangeListener(): PropertyChangeListener {
    return $J.fn(new MetalTitlePane$PropertyChangeHandler().$o(this)._MetalTitlePane$PropertyChangeHandler(), 'propertyChange');
  }
  /**
   * Returns the <code>JRootPane</code> this was created for.
   */
  getRootPane(): JRootPane {
    return this.rootPane;
  }
  /**
   * Returns the decoration style of the <code>JRootPane</code>.
   */
  getWindowDecorationStyle(): number {
    return this.getRootPane().getWindowDecorationStyle();
  }
  addNotify(): void {
    super.addNotify();
    this.uninstallListeners();
    this.window = SwingUtilities.getWindowAncestor(this);
    if (this.window != null) {
      if (this.window instanceof Frame) {
        this.setState$int$MetalTitlePane((this.window).getExtendedState());
      } else {
        this.setState$int$MetalTitlePane(0);
      }
      this.setActive(this.window.isActive());
      this.installListeners();
      this.updateSystemIcon();
    }
  }
  removeNotify(): void {
    super.removeNotify();
    this.uninstallListeners();
    this.window = null;
  }
  /**
   * Adds any sub-Components contained in the <code>MetalTitlePane</code>.
   */
  installSubcomponents(): void {
    let decorationStyle = this.getWindowDecorationStyle();
    if (decorationStyle === JRootPane.FRAME) {
      this.createActions();
      this.menuBar = this.createMenuBar();
      this.add$Component(this.menuBar);
      this.createButtons();
      this.add$Component(this.iconifyButton);
      this.add$Component(this.toggleButton);
      this.add$Component(this.closeButton);
    } else if (decorationStyle === JRootPane.PLAIN_DIALOG || decorationStyle === JRootPane.INFORMATION_DIALOG || decorationStyle === JRootPane.ERROR_DIALOG || decorationStyle === JRootPane.COLOR_CHOOSER_DIALOG || decorationStyle === JRootPane.FILE_CHOOSER_DIALOG || decorationStyle === JRootPane.QUESTION_DIALOG || decorationStyle === JRootPane.WARNING_DIALOG) {
      this.createActions();
      this.createButtons();
      this.add$Component(this.closeButton);
    }
  }
  /**
   * Determines the Colors to draw with.
   */
  determineColors(): void {
    switch (this.getWindowDecorationStyle()) {
      case JRootPane.FRAME:
        this.activeBackground = UIManager.getColor$Object('activeCaption');
        this.activeForeground = UIManager.getColor$Object('activeCaptionText');
        this.activeShadow = UIManager.getColor$Object('activeCaptionBorder');
        break;
      case JRootPane.ERROR_DIALOG:
        this.activeBackground = UIManager.getColor$Object('OptionPane.errorDialog.titlePane.background');
        this.activeForeground = UIManager.getColor$Object('OptionPane.errorDialog.titlePane.foreground');
        this.activeShadow = UIManager.getColor$Object('OptionPane.errorDialog.titlePane.shadow');
        break;
      case JRootPane.QUESTION_DIALOG:
      case JRootPane.COLOR_CHOOSER_DIALOG:
      case JRootPane.FILE_CHOOSER_DIALOG:
        this.activeBackground = UIManager.getColor$Object('OptionPane.questionDialog.titlePane.background');
        this.activeForeground = UIManager.getColor$Object('OptionPane.questionDialog.titlePane.foreground');
        this.activeShadow = UIManager.getColor$Object('OptionPane.questionDialog.titlePane.shadow');
        break;
      case JRootPane.WARNING_DIALOG:
        this.activeBackground = UIManager.getColor$Object('OptionPane.warningDialog.titlePane.background');
        this.activeForeground = UIManager.getColor$Object('OptionPane.warningDialog.titlePane.foreground');
        this.activeShadow = UIManager.getColor$Object('OptionPane.warningDialog.titlePane.shadow');
        break;
      case JRootPane.PLAIN_DIALOG:
      case JRootPane.INFORMATION_DIALOG:
      default:
        this.activeBackground = UIManager.getColor$Object('activeCaption');
        this.activeForeground = UIManager.getColor$Object('activeCaptionText');
        this.activeShadow = UIManager.getColor$Object('activeCaptionBorder');
        break;
    }
    this.activeBumps.setBumpColors(this.activeBumpsHighlight, this.activeBumpsShadow, this.activeBackground);
  }
  /**
   * Installs the fonts and necessary properties on the MetalTitlePane.
   */
  installDefaults(): void {
    this.setFont(UIManager.getFont$Object$Locale('InternalFrame.titleFont', this.getLocale$()));
  }
  /**
   * Returns the <code>JMenuBar</code> displaying the appropriate
   * system menu items.
   */
  createMenuBar(): JMenuBar {
    this.menuBar = new MetalTitlePane$SystemMenuBar().$o(this)._MetalTitlePane$SystemMenuBar();
    this.menuBar.setFocusable(false);
    this.menuBar.setBorderPainted(true);
    this.menuBar.add$JMenu(this.createMenu());
    return this.menuBar;
  }
  /**
   * Closes the Window.
   */
  close(): void {
    let window = this.getWindow();
    if (window != null) {
      window.dispatchEvent(new WindowEvent()._WindowEvent$Window$int(window, WindowEvent.WINDOW_CLOSING));
    }
  }
  /**
   * Iconifies the Frame.
   */
  iconify(): void {
    let frame = this.getFrame();
    if (frame != null) {
      frame.setExtendedState(this.state | Frame.ICONIFIED);
    }
  }
  /**
   * Maximizes the Frame.
   */
  maximize(): void {
    let frame = this.getFrame();
    if (frame != null) {
      frame.setExtendedState(this.state | Frame.MAXIMIZED_BOTH);
    }
  }
  /**
   * Restores the Frame size.
   */
  restore(): void {
    let frame = this.getFrame();
    if (frame == null) {
      return;
    }
    if ((this.state & Frame.ICONIFIED) !== 0) {
      frame.setExtendedState(this.state & ~Frame.ICONIFIED);
    } else {
      frame.setExtendedState(this.state & ~Frame.MAXIMIZED_BOTH);
    }
  }
  /**
   * Create the <code>Action</code>s that get associated with the
   * buttons and menu items.
   */
  createActions(): void {
    this.closeAction = new MetalTitlePane$CloseAction().$o(this)._MetalTitlePane$CloseAction();
    if (this.getWindowDecorationStyle() === JRootPane.FRAME) {
      this.iconifyAction = new MetalTitlePane$IconifyAction().$o(this)._MetalTitlePane$IconifyAction();
      this.restoreAction = new MetalTitlePane$RestoreAction().$o(this)._MetalTitlePane$RestoreAction();
      this.maximizeAction = new MetalTitlePane$MaximizeAction().$o(this)._MetalTitlePane$MaximizeAction();
    }
  }
  /**
   * Returns the <code>JMenu</code> displaying the appropriate menu items
   * for manipulating the Frame.
   */
  createMenu(): JMenu {
    let menu = new JMenu()._JMenu$String('');
    if (this.getWindowDecorationStyle() === JRootPane.FRAME) {
      this.addMenuItems(menu);
    }
    return menu;
  }
  /**
   * Adds the necessary <code>JMenuItem</code>s to the passed in menu.
   */
  addMenuItems(menu: JMenu): void {
    let locale = this.getRootPane().getLocale$();
    let mi = menu.add$Action(this.restoreAction);
    let mnemonic = MetalUtils.getInt('MetalTitlePane.restoreMnemonic', -1);
    if (mnemonic !== -1) {
      mi.setMnemonic$int(mnemonic);
    }
    mi = menu.add$Action(this.iconifyAction);
    mnemonic = MetalUtils.getInt('MetalTitlePane.iconifyMnemonic', -1);
    if (mnemonic !== -1) {
      mi.setMnemonic$int(mnemonic);
    }
    if (Toolkit.getDefaultToolkit().isFrameStateSupported(Frame.MAXIMIZED_BOTH)) {
      mi = menu.add$Action(this.maximizeAction);
      mnemonic = MetalUtils.getInt('MetalTitlePane.maximizeMnemonic', -1);
      if (mnemonic !== -1) {
        mi.setMnemonic$int(mnemonic);
      }
    }
    menu.add$Component(new JSeparator()._JSeparator$());
    mi = menu.add$Action(this.closeAction);
    mnemonic = MetalUtils.getInt('MetalTitlePane.closeMnemonic', -1);
    if (mnemonic !== -1) {
      mi.setMnemonic$int(mnemonic);
    }
  }
  /**
   * Returns a <code>JButton</code> appropriate for placement on the
   * TitlePane.
   */
  createTitleButton(): JButton {
    let button = new JButton()._JButton$();
    button.setFocusPainted(false);
    button.setFocusable(false);
    button.setOpaque(true);
    return button;
  }
  /**
   * Creates the Buttons that will be placed on the TitlePane.
   */
  createButtons(): void {
    this.closeButton = this.createTitleButton();
    this.closeButton.setAction(this.closeAction);
    this.closeButton.setText(null);
    this.closeButton.putClientProperty('paintActive', true);
    this.closeButton.setBorder(MetalTitlePane.handyEmptyBorder);
    this.closeButton.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, 'Close');
    this.closeButton.setIcon(UIManager.getIcon$Object('InternalFrame.closeIcon'));
    if (this.getWindowDecorationStyle() === JRootPane.FRAME) {
      this.maximizeIcon = UIManager.getIcon$Object('InternalFrame.maximizeIcon');
      this.minimizeIcon = UIManager.getIcon$Object('InternalFrame.minimizeIcon');
      this.iconifyButton = this.createTitleButton();
      this.iconifyButton.setAction(this.iconifyAction);
      this.iconifyButton.setText(null);
      this.iconifyButton.putClientProperty('paintActive', true);
      this.iconifyButton.setBorder(MetalTitlePane.handyEmptyBorder);
      this.iconifyButton.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, 'Iconify');
      this.iconifyButton.setIcon(UIManager.getIcon$Object('InternalFrame.iconifyIcon'));
      this.toggleButton = this.createTitleButton();
      this.toggleButton.setAction(this.restoreAction);
      this.toggleButton.putClientProperty('paintActive', true);
      this.toggleButton.setBorder(MetalTitlePane.handyEmptyBorder);
      this.toggleButton.putClientProperty(AccessibleContext.ACCESSIBLE_NAME_PROPERTY, 'Maximize');
      this.toggleButton.setIcon(this.maximizeIcon);
    }
  }
  /**
   * Returns the <code>LayoutManager</code> that should be installed on
   * the <code>MetalTitlePane</code>.
   */
  createLayout(): LayoutManager {
    return new MetalTitlePane$TitlePaneLayout().$o(this)._MetalTitlePane$TitlePaneLayout();
  }
  /**
   * Updates state dependent upon the Window's active state.
   */
  setActive(isActive: boolean): void {
    let activeB = isActive ? true : false;
    this.closeButton.putClientProperty('paintActive', activeB);
    if (this.getWindowDecorationStyle() === JRootPane.FRAME) {
      this.iconifyButton.putClientProperty('paintActive', activeB);
      this.toggleButton.putClientProperty('paintActive', activeB);
    }
    this.getRootPane().repaint$();
  }
  /**
   * Sets the state of the Window.
   */
  setState$int$MetalTitlePane(state: number): void {
    this.setState$int$boolean$MetalTitlePane(state, false);
  }
  /**
   * Sets the state of the window. If <code>updateRegardless</code> is
   * true and the state has not changed, this will update anyway.
   */
  setState$int$boolean$MetalTitlePane(state: number, updateRegardless: boolean): void {
    let w = this.getWindow();
    if (w != null && this.getWindowDecorationStyle() === JRootPane.FRAME) {
      if (this.state === state && !updateRegardless) {
        return;
      }
      let frame = this.getFrame();
      if (frame != null) {
        let rootPane = this.getRootPane();
        if (((state & Frame.MAXIMIZED_BOTH) !== 0) && (rootPane.getBorder() == null || ($J.isa(rootPane.getBorder(), UIResource))) && frame.isShowing()) {
          rootPane.setBorder(null);
        } else if ((state & Frame.MAXIMIZED_BOTH) === 0) {
          this.rootPaneUI.installBorder(rootPane);
        }
        if (frame.isResizable()) {
          if ((state & Frame.MAXIMIZED_BOTH) !== 0) {
            this.updateToggleButton(this.restoreAction, this.minimizeIcon);
            this.maximizeAction.setEnabled(false);
            this.restoreAction.setEnabled(true);
          } else {
            this.updateToggleButton(this.maximizeAction, this.maximizeIcon);
            this.maximizeAction.setEnabled(true);
            this.restoreAction.setEnabled(false);
          }
          if (this.toggleButton.getParent() == null || this.iconifyButton.getParent() == null) {
            this.add$Component(this.toggleButton);
            this.add$Component(this.iconifyButton);
            this.revalidate();
            this.repaint$();
          }
          this.toggleButton.setText(null);
        } else {
          this.maximizeAction.setEnabled(false);
          this.restoreAction.setEnabled(false);
          if (this.toggleButton.getParent() != null) {
            this.remove$Component(this.toggleButton);
            this.revalidate();
            this.repaint$();
          }
        }
      } else {
        this.maximizeAction.setEnabled(false);
        this.restoreAction.setEnabled(false);
        this.iconifyAction.setEnabled(false);
        this.remove$Component(this.toggleButton);
        this.remove$Component(this.iconifyButton);
        this.revalidate();
        this.repaint$();
      }
      this.closeAction.setEnabled(true);
      this.state = state;
    }
  }
  /**
   * Updates the toggle button to contain the Icon <code>icon</code>, and
   * Action <code>action</code>.
   */
  updateToggleButton(action: Action, icon: Icon): void {
    this.toggleButton.setAction(action);
    this.toggleButton.setIcon(icon);
    this.toggleButton.setText(null);
  }
  /**
   * Returns the Frame rendering in. This will return null if the
   * <code>JRootPane</code> is not contained in a <code>Frame</code>.
   */
  getFrame(): Frame {
    let window = this.getWindow();
    if (window instanceof Frame) {
      return window;
    }
    return null;
  }
  /**
   * Returns the <code>Window</code> the <code>JRootPane</code> is
   * contained in. This will return null if there is no parent ancestor
   * of the <code>JRootPane</code>.
   */
  getWindow(): Window {
    return this.window;
  }
  /**
   * Returns the String to display as the title.
   */
  getTitle(): string {
    let w = this.getWindow();
    if (w instanceof Frame) {
      return (w).getTitle();
    } else if (w instanceof Dialog) {
      return (w).getTitle();
    }
    return null;
  }
  /**
   * Renders the TitlePane.
   */
  paintComponent(g: Graphics): void {
    if (this.getFrame() != null) {
      this.setState$int$MetalTitlePane(this.getFrame().getExtendedState());
    }
    let rootPane = this.getRootPane();
    let window = this.getWindow();
    let leftToRight = (window == null) ? rootPane.getComponentOrientation().isLeftToRight() : window.getComponentOrientation().isLeftToRight();
    let isSelected = (window == null) ? true : window.isActive();
    let width = this.getWidth();
    let height = this.getHeight();
    let background: Color;
    let foreground: Color;
    let darkShadow: Color;
    let bumps: MetalBumps;
    if (isSelected) {
      background = this.activeBackground;
      foreground = this.activeForeground;
      darkShadow = this.activeShadow;
      bumps = this.activeBumps;
    } else {
      background = this.inactiveBackground;
      foreground = this.inactiveForeground;
      darkShadow = this.inactiveShadow;
      bumps = this.inactiveBumps;
    }
    g.setColor(background);
    g.fillRect(0, 0, width, height);
    g.setColor(darkShadow);
    g.drawLine(0, (height - 1) | 0, width, (height - 1) | 0);
    g.drawLine(0, 0, 0, 0);
    g.drawLine((width - 1) | 0, 0, (width - 1) | 0, 0);
    let xOffset = leftToRight ? 5 : (width - 5) | 0;
    if (this.getWindowDecorationStyle() === JRootPane.FRAME) {
      xOffset = (xOffset + (leftToRight ? (MetalTitlePane.IMAGE_WIDTH + 5) | 0 : (-MetalTitlePane.IMAGE_WIDTH - 5) | 0)) | 0;
    }
    let theTitle = this.getTitle();
    if (theTitle != null) {
      let fm = SwingUtilities2.getFontMetrics$JComponent$Graphics(rootPane, g);
      g.setColor(foreground);
      let yOffset = (($J.idiv(((height - fm.getHeight()) | 0), 2)) + fm.getAscent()) | 0;
      let rect = new Rectangle()._Rectangle$int$int$int$int(0, 0, 0, 0);
      if (this.iconifyButton != null && this.iconifyButton.getParent() != null) {
        rect = this.iconifyButton.getBounds$();
      }
      let titleW: number;
      if (leftToRight) {
        if (rect.x_ === 0) {
          rect.x_ = (window.getWidth() - window.getInsets$().right - 2) | 0;
        }
        titleW = (rect.x_ - xOffset - 4) | 0;
        theTitle = SwingUtilities2.clipStringIfNecessary(rootPane, fm, theTitle, titleW);
      } else {
        titleW = (xOffset - rect.x_ - rect.width_ - 4) | 0;
        theTitle = SwingUtilities2.clipStringIfNecessary(rootPane, fm, theTitle, titleW);
        xOffset = (xOffset - SwingUtilities2.stringWidth$JComponent$FontMetrics$String(rootPane, fm, theTitle)) | 0;
      }
      let titleLength = SwingUtilities2.stringWidth$JComponent$FontMetrics$String(rootPane, fm, theTitle);
      SwingUtilities2.drawString$JComponent$Graphics$String$int$int(rootPane, g, theTitle, xOffset, yOffset);
      xOffset = (xOffset + (leftToRight ? (titleLength + 5) | 0 : -5)) | 0;
    }
    let bumpXOffset: number;
    let bumpLength: number;
    if (leftToRight) {
      bumpLength = (width - this.buttonsWidth - xOffset - 5) | 0;
      bumpXOffset = xOffset;
    } else {
      bumpLength = (xOffset - this.buttonsWidth - 5) | 0;
      bumpXOffset = (this.buttonsWidth + 5) | 0;
    }
    let bumpYOffset = 3;
    let bumpHeight = (this.getHeight() - (Math.imul(2, bumpYOffset))) | 0;
    bumps.setBumpArea$int$int(bumpLength, bumpHeight);
    bumps.paintIcon(this, g, bumpXOffset, bumpYOffset);
  }
  /**
   * Update the image used for the system icon
   */
  updateSystemIcon(): void {
    let window = this.getWindow();
    if (window == null) {
      this.systemIcon = null;
      return;
    }
    let icons = window.getIconImages();
    // assert icons != null
    if (icons.size() === 0) {
      this.systemIcon = null;
    } else if (icons.size() === 1) {
      this.systemIcon = icons.get(0);
    } else {
      this.systemIcon = SunToolkit.getScaledIconImage(icons, MetalTitlePane.IMAGE_WIDTH, MetalTitlePane.IMAGE_HEIGHT);
    }
  }
  static $clinit() {
    MetalTitlePane.handyEmptyBorder = new EmptyBorder()._EmptyBorder$int$int$int$int(0, 0, 0, 0);
  }
}

/**
 * Actions used to <code>close</code> the <code>Window</code>.
 */
export class MetalTitlePane$CloseAction extends AbstractAction {
  _MetalTitlePane$CloseAction(): this {
    this._AbstractAction$String(UIManager.getString$Object$Locale('MetalTitlePane.closeTitle', this.$outer.getLocale$()));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.close();
  }
}

/**
 * Actions used to <code>iconfiy</code> the <code>Frame</code>.
 */
export class MetalTitlePane$IconifyAction extends AbstractAction {
  _MetalTitlePane$IconifyAction(): this {
    this._AbstractAction$String(UIManager.getString$Object$Locale('MetalTitlePane.iconifyTitle', this.$outer.getLocale$()));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.iconify();
  }
}

/**
 * Actions used to <code>restore</code> the <code>Frame</code>.
 */
export class MetalTitlePane$RestoreAction extends AbstractAction {
  _MetalTitlePane$RestoreAction(): this {
    this._AbstractAction$String(UIManager.getString$Object$Locale('MetalTitlePane.restoreTitle', this.$outer.getLocale$()));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.restore();
  }
}

/**
 * Actions used to <code>restore</code> the <code>Frame</code>.
 */
export class MetalTitlePane$MaximizeAction extends AbstractAction {
  _MetalTitlePane$MaximizeAction(): this {
    this._AbstractAction$String(UIManager.getString$Object$Locale('MetalTitlePane.maximizeTitle', this.$outer.getLocale$()));
    return this;
  }
  actionPerformed(e: ActionEvent): void {
    this.$outer.maximize();
  }
}

/**
 * Class responsible for drawing the system menu. Looks up the
 * image to draw from the Frame associated with the
 * <code>JRootPane</code>.
 */
export class MetalTitlePane$SystemMenuBar extends JMenuBar {
  _MetalTitlePane$SystemMenuBar(): this {
    this._JMenuBar();
    return this;
  }
  paint(g: Graphics): void {
    if (this.isOpaque()) {
      g.setColor(this.getBackground());
      g.fillRect(0, 0, this.getWidth(), this.getHeight());
    }
    if (this.$outer.systemIcon != null) {
      g.drawImage$Image$int$int$int$int$ImageObserver(this.$outer.systemIcon, 0, 0, MetalTitlePane.IMAGE_WIDTH, MetalTitlePane.IMAGE_HEIGHT, null);
    } else {
      let icon = UIManager.getIcon$Object('InternalFrame.icon');
      if (icon != null) {
        icon.paintIcon(this, g, 0, 0);
      }
    }
  }
  getMinimumSize$(): Dimension {
    return this.getPreferredSize$();
  }
  getPreferredSize$(): Dimension {
    let size = super.getPreferredSize$();
    return new Dimension()._Dimension$int$int(Math.max(MetalTitlePane.IMAGE_WIDTH, size.width_), Math.max(size.height_, MetalTitlePane.IMAGE_HEIGHT));
  }
}

export class MetalTitlePane$TitlePaneLayout extends JObject {
  _MetalTitlePane$TitlePaneLayout(): this {
    return this;
  }
  addLayoutComponent$String$Component(name: string, c: Component): void {
  }
  removeLayoutComponent(c: Component): void {
  }
  preferredLayoutSize(c: Container): Dimension {
    let height = this.computeHeight();
    return new Dimension()._Dimension$int$int(height, height);
  }
  minimumLayoutSize(c: Container): Dimension {
    return this.preferredLayoutSize(c);
  }
  computeHeight(): number {
    let fm = this.$outer.rootPane.getFontMetrics(this.$outer.getFont());
    let fontHeight = fm.getHeight();
    fontHeight = (fontHeight + 7) | 0;
    let iconHeight = 0;
    if (this.$outer.getWindowDecorationStyle() === JRootPane.FRAME) {
      iconHeight = MetalTitlePane.IMAGE_HEIGHT;
    }
    let finalHeight = Math.max(fontHeight, iconHeight);
    return finalHeight;
  }
  layoutContainer$Container(c: Container): void {
    let leftToRight = (this.$outer.window == null) ? this.$outer.getRootPane().getComponentOrientation().isLeftToRight() : this.$outer.window.getComponentOrientation().isLeftToRight();
    let w = this.$outer.getWidth();
    let x: number;
    let y = 3;
    let spacing: number;
    let buttonHeight: number;
    let buttonWidth: number;
    if (this.$outer.closeButton != null && this.$outer.closeButton.getIcon() != null) {
      buttonHeight = this.$outer.closeButton.getIcon().getIconHeight();
      buttonWidth = this.$outer.closeButton.getIcon().getIconWidth();
    } else {
      buttonHeight = MetalTitlePane.IMAGE_HEIGHT;
      buttonWidth = MetalTitlePane.IMAGE_WIDTH;
    }
    x = leftToRight ? w : 0;
    spacing = 5;
    x = leftToRight ? spacing : (w - buttonWidth - spacing) | 0;
    if (this.$outer.menuBar != null) {
      this.$outer.menuBar.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
    }
    x = leftToRight ? w : 0;
    spacing = 4;
    x = (x + (leftToRight ? (-spacing - buttonWidth) | 0 : spacing)) | 0;
    if (this.$outer.closeButton != null) {
      this.$outer.closeButton.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
    }
    if (!leftToRight) {
      x = (x + buttonWidth) | 0;
    }
    if (this.$outer.getWindowDecorationStyle() === JRootPane.FRAME) {
      if (Toolkit.getDefaultToolkit().isFrameStateSupported(Frame.MAXIMIZED_BOTH)) {
        if (this.$outer.toggleButton.getParent() != null) {
          spacing = 10;
          x = (x + (leftToRight ? (-spacing - buttonWidth) | 0 : spacing)) | 0;
          this.$outer.toggleButton.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
          if (!leftToRight) {
            x = (x + buttonWidth) | 0;
          }
        }
      }
      if (this.$outer.iconifyButton != null && this.$outer.iconifyButton.getParent() != null) {
        spacing = 2;
        x = (x + (leftToRight ? (-spacing - buttonWidth) | 0 : spacing)) | 0;
        this.$outer.iconifyButton.setBounds$int$int$int$int(x, y, buttonWidth, buttonHeight);
        if (!leftToRight) {
          x = (x + buttonWidth) | 0;
        }
      }
    }
    this.$outer.buttonsWidth = leftToRight ? (w - x) | 0 : x;
  }
}

/**
 * PropertyChangeListener installed on the Window. Updates the necessary
 * state as the state of the Window changes.
 */
export class MetalTitlePane$PropertyChangeHandler extends JObject {
  _MetalTitlePane$PropertyChangeHandler(): this {
    return this;
  }
  propertyChange(pce: PropertyChangeEvent): void {
    let name = pce.getPropertyName();
    if ($J.equals('resizable', name) || $J.equals('state', name)) {
      let frame = this.$outer.getFrame();
      if (frame != null) {
        this.$outer.setState$int$boolean$MetalTitlePane(frame.getExtendedState(), true);
      }
      if ($J.equals('resizable', name)) {
        this.$outer.getRootPane().repaint$();
      }
    } else if ($J.equals('title', name)) {
      this.$outer.repaint$();
    } else if ('componentOrientation' === name) {
      this.$outer.revalidate();
      this.$outer.repaint$();
    } else if ('iconImage' === name) {
      this.$outer.updateSystemIcon();
      this.$outer.revalidate();
      this.$outer.repaint$();
    }
  }
}

/**
 * WindowListener installed on the Window, updates the state as necessary.
 */
export class MetalTitlePane$WindowHandler extends WindowAdapter {
  _MetalTitlePane$WindowHandler(): this {
    this._WindowAdapter();
    return this;
  }
  windowActivated(ev: WindowEvent): void {
    this.$outer.setActive(true);
  }
  windowDeactivated(ev: WindowEvent): void {
    this.$outer.setActive(false);
  }
}

$J.define(MetalTitlePane, 'javax.swing.plaf.metal.MetalTitlePane', { kind: 'class', sup: 'javax.swing.JComponent', ctors: { 'javax.swing.JRootPane,javax.swing.plaf.metal.MetalRootPaneUI': '_MetalTitlePane' }, meths: { 'setState(int,boolean)': 'setState$int$boolean$MetalTitlePane', 'setState(int)': 'setState$int$MetalTitlePane' }, clinit: true, lazy: ['handyEmptyBorder'] });
$J.define(MetalTitlePane$CloseAction, 'javax.swing.plaf.metal.MetalTitlePane$CloseAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_MetalTitlePane$CloseAction' }, inner: true });
$J.define(MetalTitlePane$IconifyAction, 'javax.swing.plaf.metal.MetalTitlePane$IconifyAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_MetalTitlePane$IconifyAction' }, inner: true });
$J.define(MetalTitlePane$RestoreAction, 'javax.swing.plaf.metal.MetalTitlePane$RestoreAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_MetalTitlePane$RestoreAction' }, inner: true });
$J.define(MetalTitlePane$MaximizeAction, 'javax.swing.plaf.metal.MetalTitlePane$MaximizeAction', { kind: 'class', sup: 'javax.swing.AbstractAction', ctors: { '': '_MetalTitlePane$MaximizeAction' }, inner: true });
$J.define(MetalTitlePane$SystemMenuBar, 'javax.swing.plaf.metal.MetalTitlePane$SystemMenuBar', { kind: 'class', sup: 'javax.swing.JMenuBar', ctors: { '': '_MetalTitlePane$SystemMenuBar' }, meths: { 'getPreferredSize()': 'getPreferredSize$', 'getMinimumSize()': 'getMinimumSize$' }, inner: true });
$J.define(MetalTitlePane$TitlePaneLayout, 'javax.swing.plaf.metal.MetalTitlePane$TitlePaneLayout', { kind: 'class', ifaces: ['java.awt.LayoutManager'], sup: 'java.lang.Object', ctors: { '': '_MetalTitlePane$TitlePaneLayout' }, meths: { 'layoutContainer(java.awt.Container)': 'layoutContainer$Container', 'addLayoutComponent(java.lang.String,java.awt.Component)': 'addLayoutComponent$String$Component' }, inner: true });
$J.define(MetalTitlePane$PropertyChangeHandler, 'javax.swing.plaf.metal.MetalTitlePane$PropertyChangeHandler', { kind: 'class', ifaces: ['java.beans.PropertyChangeListener'], sup: 'java.lang.Object', ctors: { '': '_MetalTitlePane$PropertyChangeHandler' }, inner: true });
$J.define(MetalTitlePane$WindowHandler, 'javax.swing.plaf.metal.MetalTitlePane$WindowHandler', { kind: 'class', sup: 'java.awt.event.WindowAdapter', ctors: { '': '_MetalTitlePane$WindowHandler' }, inner: true });
$J.module(() => {
  Dialog = $J.load('java.awt.Dialog');
  Dimension = $J.load('java.awt.Dimension');
  Frame = $J.load('java.awt.Frame');
  Rectangle = $J.load('java.awt.Rectangle');
  WindowEvent = $J.load('java.awt.event.WindowEvent');
  AccessibleContext = $J.load('javax.accessibility.AccessibleContext');
  JButton = $J.load('javax.swing.JButton');
  JMenu = $J.load('javax.swing.JMenu');
  JRootPane = $J.load('javax.swing.JRootPane');
  JSeparator = $J.load('javax.swing.JSeparator');
  SwingUtilities = $J.load('javax.swing.SwingUtilities');
  UIManager = $J.load('javax.swing.UIManager');
  EmptyBorder = $J.load('javax.swing.border.EmptyBorder');
  UIResource = $J.load('javax.swing.plaf.UIResource');
  MetalBumps = $J.load('javax.swing.plaf.metal.MetalBumps');
  MetalLookAndFeel = $J.load('javax.swing.plaf.metal.MetalLookAndFeel');
  MetalUtils = $J.load('javax.swing.plaf.metal.MetalUtils');
  SwingUtilities2 = $J.load('sun.swing.SwingUtilities2');
});
